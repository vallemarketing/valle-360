import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

type ReadinessStatus = 'pass' | 'warn' | 'fail';

function statusFromBool(ok: boolean): ReadinessStatus {
  return ok ? 'pass' : 'fail';
}

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { data: isAdmin, error: isAdminError } = await supabase.rpc('is_admin');
  if (isAdminError || !isAdmin) {
    return NextResponse.json({ error: 'Acesso negado (admin)' }, { status: 403 });
  }

  try {
    const now = new Date().toISOString();

    // Hub
    const [{ count: pendingEvents }, { count: pendingTransitions }, { count: errorTransitions }] = await Promise.all([
      supabase.from('event_log').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('workflow_transitions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('workflow_transitions').select('*', { count: 'exact', head: true }).eq('status', 'error'),
    ]);

    // Integrações
    const { data: integrations } = await supabase
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

    const critical = ['openrouter', 'openai', 'stripe', 'sendgrid', 'whatsapp'];
    const criticalStatus: Record<string, ReadinessStatus> = {};
    for (const id of critical) {
      const row = (integrations || []).find((x: any) => x.integration_id === id);
      criticalStatus[id] = row?.status === 'connected' && (row?.api_key || row?.access_token) ? 'pass' : 'warn';
    }

    // Áreas (colaboradores)
    const areas = ['Comercial', 'Jurídico', 'Contratos', 'Financeiro', 'Operacao', 'Notificacoes', 'RH'];
    const { data: employees } = await supabase.from('employees').select('id, department, areas, is_active').eq('is_active', true);

    const normalize = (s: string) =>
      s
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();

    const areaCoverage = areas.map((area) => {
      const a = normalize(area);
      const count =
        (employees || []).filter((e: any) => {
          const dept = e?.department ? normalize(String(e.department)) : '';
          const arr = Array.isArray(e?.areas) ? e.areas.map((x: any) => normalize(String(x))) : [];
          if (dept === a || dept.includes(a) || a.includes(dept)) return true;
          if (arr.includes(a)) return true;
          if (arr.some((x: string) => x.includes(a) || a.includes(x))) return true;
          return false;
        }).length || 0;
      return {
        area,
        activeEmployees: count,
        status: count > 0 ? 'pass' : 'warn',
      };
    });

    // ML / Metas
    const [{ count: goalConfigs }, { count: mlModels }] = await Promise.all([
      supabase.from('goal_configs').select('*', { count: 'exact', head: true }),
      supabase.from('ml_models').select('*', { count: 'exact', head: true }),
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
    };

    // status geral
    const allStatuses: ReadinessStatus[] = [
      checks.hub.status,
      checks.areas.status,
      checks.integrations.status,
      checks.ai.status,
      checks.ml.status,
      checks.sql.status,
    ];
    const overall: ReadinessStatus = allStatuses.includes('fail') ? 'fail' : allStatuses.includes('warn') ? 'warn' : 'pass';

    return NextResponse.json({
      success: true,
      timestamp: now,
      overall,
      checks,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro interno' }, { status: 500 });
  }
}


