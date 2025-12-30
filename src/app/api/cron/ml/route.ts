import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/admin/supabaseAdmin';
import { predictiveEngine } from '@/lib/ai/predictive-engine';
import { clientHealthScore } from '@/lib/ai/client-health-score';
import { logCronRun, requireCronAuth } from '@/lib/cron/cronUtils';
import { requireAdmin } from '@/lib/auth/requireAdmin';

export const dynamic = 'force-dynamic';

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

async function runMlJobs() {
  const supabase = getSupabaseAdmin();
  const nowIso = new Date().toISOString();

  // 1) Recalcular health score para todos (base para churn/risk)
  const recalculated = await clientHealthScore.recalculateAllScores();

  // 1.1) Atualizar padrões de comportamento (ml_client_behavior_patterns) baseado no health score
  const { data: healthRows } = await supabase
    .from('client_health_scores')
    .select('client_id, client_name, overall_score, churn_probability, risk_level')
    .order('churn_probability', { ascending: false })
    .limit(5000);

  const clientIds = (healthRows || []).map((r: any) => String(r.client_id)).filter((id) => isUuid(id));

  // Mapear padrões existentes (evita duplicar rows a cada cron)
  const existingByClientId = new Map<string, string>();
  for (let i = 0; i < clientIds.length; i += 500) {
    const chunk = clientIds.slice(i, i + 500);
    const { data: existing } = await supabase
      .from('ml_client_behavior_patterns')
      .select('id, client_id')
      .in('client_id', chunk);
    for (const row of existing || []) {
      if (row?.client_id && row?.id) existingByClientId.set(String(row.client_id), String(row.id));
    }
  }

  const toSegment = (risk: string) => {
    const r = String(risk || '').toLowerCase();
    if (r === 'critical' || r === 'high') return 'churn_risk';
    if (r === 'low') return 'satisfied';
    return 'needs_attention';
  };

  const inserts: any[] = [];
  const updates: any[] = [];

  for (const r of healthRows || []) {
    const clientId = String(r.client_id || '');
    if (!isUuid(clientId)) continue;

    const churnProb = Number(r.churn_probability || 0);
    const churnRisk = Math.max(0, Math.min(100, churnProb));
    const renewalProb = Math.max(0, Math.min(100, 100 - churnRisk));
    const overall = Number(r.overall_score || 0);
    const upsellProb = Math.max(0, Math.min(100, overall >= 80 ? 55 : overall >= 65 ? 35 : 15));

    const payload = {
      client_id: clientId,
      behavior_segment: toSegment(r.risk_level),
      churn_risk_score: churnRisk,
      renewal_probability: renewalProb,
      upsell_probability: upsellProb,
      recommended_actions: [
        churnRisk >= 70 ? 'Agendar reunião de retenção' : null,
        churnRisk >= 50 ? 'Aumentar cadência de contato' : null,
        overall >= 80 ? 'Avaliar oportunidade de upsell' : null,
      ].filter(Boolean),
      confidence_score: 70,
      last_analyzed_at: nowIso,
      updated_at: nowIso,
    };

    const existingId = existingByClientId.get(clientId);
    if (existingId) {
      updates.push({ id: existingId, ...payload });
    } else {
      inserts.push(payload);
    }
  }

  // Inserir novos padrões
  for (let i = 0; i < inserts.length; i += 500) {
    const chunk = inserts.slice(i, i + 500);
    if (!chunk.length) continue;
    await supabase.from('ml_client_behavior_patterns').insert(chunk);
  }

  // Atualizar padrões existentes (upsert por PK id)
  for (let i = 0; i < updates.length; i += 500) {
    const chunk = updates.slice(i, i + 500);
    if (!chunk.length) continue;
    await supabase.from('ml_client_behavior_patterns').upsert(chunk, { onConflict: 'id' });
  }

  // 2) Predições de churn (por cliente)
  const { data: clients } = await supabase.from('clients').select('id').limit(5000);
  let churnPredicted = 0;
  for (const c of clients || []) {
    if (!c?.id || !isUuid(String(c.id))) continue;
    const p = await predictiveEngine.predictChurn(String(c.id));
    if (p) churnPredicted++;
  }

  // 3) Predições de atraso (por tarefa em aberto)
  const { data: tasks } = await supabase
    .from('kanban_tasks')
    .select('id')
    .neq('status', 'done')
    .limit(5000);

  let delayPredicted = 0;
  for (const t of tasks || []) {
    if (!t?.id || !isUuid(String(t.id))) continue;
    const p = await predictiveEngine.predictDelay(String(t.id));
    if (p) delayPredicted++;
  }

  // 4) Insights simples para Super Admin (sem IA ainda): volume de risco
  const { data: risky } = await supabase
    .from('client_health_scores')
    .select('client_id, client_name, overall_score, churn_probability, risk_level')
    .in('risk_level', ['high', 'critical'])
    .order('churn_probability', { ascending: false })
    .limit(10);

  const topNames = (risky || []).map((r: any) => `${r.client_name || r.client_id} (${r.churn_probability || 0}%)`);
  if (topNames.length > 0) {
    await supabase.from('super_admin_insights').insert({
      insight_category: 'risk',
      insight_priority: 'high',
      insight_title: 'Clientes com risco elevado (ML/heurística)',
      insight_description: `Top clientes em risco (baseado em Health Score):\n- ${topNames.join('\n- ')}`,
      affected_area: 'clients',
      confidence_score: 70,
      urgency_score: 75,
      source_type: 'system',
      generated_by: 'system',
      status: 'new',
    });
  }

  return {
    recalculatedHealthScores: recalculated,
    behaviorPatternsInserted: inserts.length,
    behaviorPatternsUpdated: updates.length,
    churnPredicted,
    delayPredicted,
    insertedInsight: topNames.length > 0,
  };
}

export async function GET(request: NextRequest) {
  const started = Date.now();
  const admin = getSupabaseAdmin();
  try {
    const auth = requireCronAuth(request);
    if (auth) return auth;

    const result = await runMlJobs();
    await logCronRun({
      supabase: admin,
      action: 'ml',
      status: 'ok',
      durationMs: Date.now() - started,
      responseData: result,
    });
    return NextResponse.json({ success: true, result });
  } catch (e: any) {
    await logCronRun({
      supabase: admin,
      action: 'ml',
      status: 'error',
      durationMs: Date.now() - started,
      errorMessage: e?.message || 'Erro interno',
    });
    return NextResponse.json({ error: e?.message || 'Erro interno' }, { status: 500 });
  }
}

// POST manual (admin) — mantemos simples e protegido por sessão no passo do dashboard
export async function POST(request: NextRequest) {
  const started = Date.now();
  const admin = getSupabaseAdmin();
  try {
    const gate = await requireAdmin(request);
    if (!gate.ok) return gate.res;

    const result = await runMlJobs();
    await logCronRun({
      supabase: admin,
      action: 'ml',
      status: 'ok',
      durationMs: Date.now() - started,
      requestData: { manual: true, by: gate.userId },
      responseData: result,
    });
    return NextResponse.json({ success: true, result });
  } catch (e: any) {
    await logCronRun({
      supabase: admin,
      action: 'ml',
      status: 'error',
      durationMs: Date.now() - started,
      errorMessage: e?.message || 'Erro interno',
    });
    return NextResponse.json({ error: e?.message || 'Erro interno' }, { status: 500 });
  }
}


