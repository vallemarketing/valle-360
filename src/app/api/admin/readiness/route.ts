import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { AREA_BOARDS, inferAreaKeyFromLabel, type AreaKey } from '@/lib/kanban/areaBoards';
import { getSupabaseAdmin } from '@/lib/admin/supabaseAdmin';

export const dynamic = 'force-dynamic';

type ReadinessStatus = 'pass' | 'warn' | 'fail';

function statusFromBool(ok: boolean): ReadinessStatus {
  return ok ? 'pass' : 'fail';
}

function hasFirebaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  );
}

function normalizeErrorMessage(msg: string) {
  return String(msg || '').toLowerCase();
}

function isMissingTableError(message: string) {
  const m = normalizeErrorMessage(message);
  return (
    m.includes('does not exist') ||
    m.includes('relation') ||
    m.includes('not found') ||
    m.includes('schema cache') ||
    m.includes('could not find the table')
  );
}

async function checkTableExists(
  supabaseAdmin: ReturnType<typeof getSupabaseAdmin>,
  table: string
): Promise<{ ok: boolean; status: ReadinessStatus; reason?: string }> {
  const { error } = await supabaseAdmin.from(table).select('*', { head: true, count: 'exact' }).limit(1);
  if (!error) return { ok: true, status: 'pass' };

  // Se não existe, isso é FAIL. Qualquer outro erro (ex.: permissão) é WARN para não bloquear produção indevidamente.
  if (isMissingTableError(error.message)) {
    return { ok: false, status: 'fail', reason: error.message };
  }
  return { ok: false, status: 'warn', reason: error.message };
}

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const supabaseCookie = createRouteHandlerClient({ cookies: () => cookieStore });

  // Aceita auth por cookie (padrão) OU por Authorization Bearer (fallback),
  // porque algumas partes do front ainda usam supabase-js com sessão em localStorage.
  const authHeader = request.headers.get('authorization') || '';
  const bearer = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7).trim() : null;

  const supabaseUser = bearer
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        global: { headers: { Authorization: `Bearer ${bearer}` } },
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      })
    : supabaseCookie;

  const { data: authData } = await supabaseUser.auth.getUser();
  if (!authData.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  // Admin check via RPC (respeita RLS/auth.uid quando usando bearer token)
  const { data: isAdmin, error: isAdminError } = await supabaseUser.rpc('is_admin');
  if (isAdminError || !isAdmin) return NextResponse.json({ error: 'Acesso negado (admin)' }, { status: 403 });

  try {
    const now = new Date().toISOString();
    const supabaseAdmin = getSupabaseAdmin();

    // Hub
    const [{ count: pendingEvents }, { count: pendingTransitions }, { count: errorTransitions }] = await Promise.all([
      supabaseAdmin.from('event_log').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabaseAdmin.from('workflow_transitions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabaseAdmin.from('workflow_transitions').select('*', { count: 'exact', head: true }).eq('status', 'error'),
    ]);

    // Integrações
    const { data: integrations } = await supabaseAdmin
      .from('integration_configs')
      .select('integration_id, display_name, category, status, last_sync, error_message, api_key, access_token')
      .order('display_name');

    const integrationsSummary = (integrations || []).map((i: any) => ({
      id: i.integration_id,
      name: i.display_name,
      category: i.category,
      status: i.status,
      connected: i.status === 'connected',
      hasCredentials: Boolean(i.api_key || i.access_token),
      lastSync: i.last_sync,
      error: i.error_message,
    }));

    const critical = ['openrouter', 'openai', 'stripe', 'sendgrid', 'whatsapp', 'instagramback'];
    const criticalStatus: Record<string, ReadinessStatus> = {};
    for (const id of critical) {
      const row = (integrations || []).find((x: any) => x.integration_id === id);
      const connectedInDb = row?.status === 'connected' && (row?.api_key || row?.access_token);
      const connectedInEnv =
        (id === 'openrouter' && !!process.env.OPENROUTER_API_KEY) ||
        (id === 'openai' && !!process.env.OPENAI_API_KEY) ||
        (id === 'stripe' && !!process.env.STRIPE_SECRET_KEY) ||
        (id === 'sendgrid' && !!process.env.SENDGRID_API_KEY) ||
        (id === 'whatsapp' && !!process.env.WHATSAPP_ACCESS_TOKEN) ||
        // InstagramBack é configurado via DB (não env)
        false;

      criticalStatus[id] = connectedInDb || connectedInEnv ? 'pass' : 'warn';
    }

    const aiSource = {
      openrouter:
        (integrations || []).find((x: any) => x.integration_id === 'openrouter')?.status === 'connected' &&
        (integrations || []).find((x: any) => x.integration_id === 'openrouter')?.api_key
          ? ('db' as const)
          : process.env.OPENROUTER_API_KEY
            ? ('env' as const)
            : ('none' as const),
      openai:
        (integrations || []).find((x: any) => x.integration_id === 'openai')?.status === 'connected' &&
        (integrations || []).find((x: any) => x.integration_id === 'openai')?.api_key
          ? ('db' as const)
          : process.env.OPENAI_API_KEY
            ? ('env' as const)
            : ('none' as const),
    };

    // cPanel (mailbox)
    const cpanel = {
      status: (process.env.CPANEL_USER && process.env.CPANEL_PASSWORD && process.env.CPANEL_DOMAIN) ? ('pass' as ReadinessStatus) : ('warn' as ReadinessStatus),
      env: {
        hasUser: Boolean(process.env.CPANEL_USER),
        hasPassword: Boolean(process.env.CPANEL_PASSWORD),
        hasDomain: Boolean(process.env.CPANEL_DOMAIN),
        hasWebmailUrl: Boolean(process.env.WEBMAIL_URL || process.env.CPANEL_WEBMAIL_URL || process.env.NEXT_PUBLIC_WEBMAIL_URL),
      },
    };

    // Schema (tabelas críticas) — usando Service Role para evitar falsos negativos por RLS
    const schemaCriticalTables = [
      'notifications',
      'integration_configs',
      'integration_logs',
      'kanban_boards',
      'kanban_columns',
      'kanban_tasks',
      'kanban_task_comments',
      'clients',
      'employees',
      'user_profiles',
      'instagram_posts',
      'social_connected_accounts',
      // Social metrics (cliente)
      'social_account_metrics_daily',
      'social_post_metrics',
    ];

    const schemaChecks = await Promise.all(
      schemaCriticalTables.map(async (t) => {
        const r = await checkTableExists(supabaseAdmin, t);
        return { table: t, ...r };
      })
    );

    const schemaStatus: ReadinessStatus = schemaChecks.some((x) => x.status === 'fail')
      ? 'fail'
      : schemaChecks.some((x) => x.status === 'warn')
        ? 'warn'
        : 'pass';

    // Cron (execução real) — procura logs recentes
    const cronJobs = ['collection', 'overdue', 'ml', 'social-publish', 'social-metrics'] as const;
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const cronChecks = await Promise.all(
      cronJobs.map(async (job) => {
        const { data: last } = await supabaseAdmin
          .from('integration_logs')
          .select('status, created_at, error_message')
          .eq('integration_id', 'cron')
          .eq('action', job)
          .gte('created_at', since)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        const hasRun = Boolean(last?.created_at);
        // Se nunca rodou nas últimas 24h, warn (não fail) porque pode estar em implantação inicial
        const st: ReadinessStatus = hasRun ? (String(last?.status) === 'ok' ? 'pass' : 'warn') : 'warn';
        return {
          job,
          status: st,
          lastRunAt: last?.created_at || null,
          lastStatus: last?.status || null,
          lastError: last?.error_message || null,
        };
      })
    );
    const cronStatus: ReadinessStatus = cronChecks.some((c) => c.status === 'warn') ? 'warn' : 'pass';

    // Áreas (colaboradores)
    const { data: employees } = await supabaseAdmin
      .from('employees')
      .select('id, department, area_of_expertise, areas, is_active')
      .eq('is_active', true);

    const countsByAreaKey = new Map<AreaKey, number>();
    for (const b of AREA_BOARDS) countsByAreaKey.set(b.areaKey, 0);

    const addAreaKey = (k: AreaKey | null) => {
      if (!k) return;
      if (!countsByAreaKey.has(k)) return;
      countsByAreaKey.set(k, (countsByAreaKey.get(k) || 0) + 1);
    };

    for (const e of employees || []) {
      const labels: string[] = [];
      if (e?.department) labels.push(String(e.department));
      if ((e as any)?.area_of_expertise) labels.push(String((e as any).area_of_expertise));
      if (Array.isArray((e as any)?.areas)) labels.push(...((e as any).areas as any[]).map((x) => String(x)));

      const unique = new Set<AreaKey>();
      for (const lbl of labels) {
        const k = inferAreaKeyFromLabel(lbl);
        if (k) unique.add(k);
      }

      // Fallback: se nada foi inferido mas tem string de department, tenta inferir do texto todo
      if (unique.size === 0 && e?.department) {
        const k = inferAreaKeyFromLabel(String(e.department));
        if (k) unique.add(k);
      }

      for (const k of unique) addAreaKey(k);
    }

    const areaCoverage = AREA_BOARDS.map((b) => {
      const count = countsByAreaKey.get(b.areaKey) || 0;
      return {
        area: b.label,
        areaKey: b.areaKey,
        activeEmployees: count,
        status: count > 0 ? 'pass' : 'warn',
      };
    });

    // ML / Metas
    const [{ count: goalConfigs }, { count: mlModels }] = await Promise.all([
      supabaseAdmin.from('goal_configs').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('ml_models').select('*', { count: 'exact', head: true }),
    ]);

    // SQL/RPC essenciais
    const rpcOk = !isAdminError;

    const checks = {
      hub: {
        status: 'pass' as ReadinessStatus,
        pendingEvents: pendingEvents || 0,
        pendingTransitions: pendingTransitions || 0,
        errorTransitions: errorTransitions || 0,
      },
      areas: {
        status: areaCoverage.some((a) => a.status !== 'pass') ? ('warn' as ReadinessStatus) : ('pass' as ReadinessStatus),
        coverage: areaCoverage,
      },
      integrations: {
        status: Object.values(criticalStatus).some((s) => s === 'warn') ? ('warn' as ReadinessStatus) : ('pass' as ReadinessStatus),
        critical: criticalStatus,
        items: integrationsSummary,
      },
      ai: {
        status: criticalStatus.openrouter === 'pass' || criticalStatus.openai === 'pass' ? ('pass' as ReadinessStatus) : ('warn' as ReadinessStatus),
        providers: {
          openrouter: criticalStatus.openrouter,
          openai: criticalStatus.openai,
        },
        source: aiSource,
      },
      ml: {
        status: statusFromBool((goalConfigs || 0) > 0 || (mlModels || 0) > 0),
        goalConfigs: goalConfigs || 0,
        mlModels: mlModels || 0,
      },
      sql: {
        status: statusFromBool(rpcOk),
        rpc: { is_admin: rpcOk ? 'pass' : 'fail' },
      },
      schema: {
        status: schemaStatus,
        criticalTables: schemaChecks,
      },
      cron: {
        status: cronStatus,
        jobs: cronChecks,
      },
      cpanel,
    };

    // status geral
    const allStatuses: ReadinessStatus[] = [
      checks.hub.status,
      checks.areas.status,
      checks.integrations.status,
      checks.ai.status,
      checks.ml.status,
      checks.sql.status,
      checks.schema.status,
      checks.cron.status,
      checks.cpanel.status,
    ];
    const overall: ReadinessStatus = allStatuses.includes('fail') ? 'fail' : allStatuses.includes('warn') ? 'warn' : 'pass';

    return NextResponse.json({
      success: true,
      timestamp: now,
      overall,
      checks,
      firebase: {
        status: hasFirebaseEnv() ? ('pass' as ReadinessStatus) : ('warn' as ReadinessStatus),
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro interno' }, { status: 500 });
  }
}


