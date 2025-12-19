import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

import { getOrCreateOnboardingBoardIdForClient, getOrCreateSuperAdminBoardId, createKanbanTaskFromHub } from '@/lib/kanban/hub';
import { notifyAdmins } from '@/lib/admin/notifyAdmins';

export const dynamic = 'force-dynamic';

type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done' | 'blocked' | 'cancelled';
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

function extractExistingKanbanIds(payload: any): { boardId: string | null; taskId: string | null } {
  if (!payload) return { boardId: null, taskId: null };
  const p = payload as any;
  const boardId = p.kanban_board_id || p.board_id || null;
  const taskId = p.kanban_task_id || p.task_id || null;
  return {
    boardId: boardId ? String(boardId) : null,
    taskId: taskId ? String(taskId) : null,
  };
}

async function findExistingKanbanTaskForTransition(supabase: any, transitionId: string) {
  // best-effort: schema pode variar (reference_links vs metadata)
  try {
    const { data } = await supabase
      .from('kanban_tasks')
      .select('id, board_id, client_id')
      .eq('reference_links->>workflow_transition_id', transitionId)
      .limit(1)
      .maybeSingle();
    if (data?.id && data?.board_id) return data as { id: string; board_id: string; client_id?: string | null };
  } catch {
    // ignore
  }

  try {
    const { data } = await supabase
      .from('kanban_tasks')
      .select('id, board_id, client_id')
      .eq('metadata->>workflow_transition_id', transitionId)
      .limit(1)
      .maybeSingle();
    if (data?.id && data?.board_id) return data as { id: string; board_id: string; client_id?: string | null };
  } catch {
    // ignore
  }

  return null;
}

async function resolveClientIdFromPayload(supabase: any, payload: any): Promise<string | null> {
  if (!payload) return null;
  if (payload.client_id) return String(payload.client_id);
  if (payload.clientId) return String(payload.clientId);

  // proposal_id -> proposals.client_email -> clients
  if (payload.proposal_id) {
    const { data: proposal } = await supabase
      .from('proposals')
      .select('client_email')
      .eq('id', payload.proposal_id)
      .maybeSingle();
    const email = proposal?.client_email ? String(proposal.client_email) : null;
    if (email) {
      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .or(`email.eq.${email},contact_email.eq.${email}`)
        .limit(1)
        .maybeSingle();
      if (client?.id) return String(client.id);
    }
  }

  // invoice_id -> invoices.client_id
  if (payload.invoice_id) {
    const { data } = await supabase.from('invoices').select('client_id').eq('id', payload.invoice_id).maybeSingle();
    if (data?.client_id) return String(data.client_id);
  }

  // contract_id -> contracts.client_id
  if (payload.contract_id) {
    const { data } = await supabase.from('contracts').select('client_id').eq('id', payload.contract_id).maybeSingle();
    if (data?.client_id) return String(data.client_id);
  }

  return null;
}

function pickArea(transition: any) {
  return (transition?.to_area || transition?.from_area || 'Operacao') as string;
}

function pickPriority(triggerEvent: string) {
  const t = (triggerEvent || '').toLowerCase();
  if (t.includes('payment_failed') || t.includes('failed')) return 'urgent';
  if (t.includes('paid')) return 'high';
  if (t.includes('created')) return 'medium';
  return 'medium';
}

function buildTemplate(transition: any, payload: any): {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  area: string;
  templateId: string;
} {
  const trigger = String(transition?.trigger_event || '').toLowerCase();
  const from = transition?.from_area || '';
  const to = transition?.to_area || '';

  const ids = {
    client_id: payload?.client_id || payload?.clientId || null,
    proposal_id: payload?.proposal_id || null,
    contract_id: payload?.contract_id || null,
    invoice_id: payload?.invoice_id || null,
    correlation_id: payload?.correlation_id || null,
  };

  const baseHeader = [
    `Origem: ${from} → ${to}`,
    `Evento: ${transition?.trigger_event}`,
    ids.client_id ? `Cliente: ${ids.client_id}` : null,
    ids.proposal_id ? `Proposta: ${ids.proposal_id}` : null,
    ids.contract_id ? `Contrato: ${ids.contract_id}` : null,
    ids.invoice_id ? `Fatura: ${ids.invoice_id}` : null,
    ids.correlation_id ? `Correlation: ${ids.correlation_id}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const payloadJson = (() => {
    try {
      return JSON.stringify(payload || {}, null, 2);
    } catch {
      return '';
    }
  })();

  // Defaults
  let title = `${from} → ${to}: ${transition?.trigger_event}`;
  let area = pickArea(transition);
  let priority: TaskPriority = pickPriority(String(transition?.trigger_event || '')) as TaskPriority;
  let templateId = 'generic.workflow_transition';
  const status: TaskStatus = 'todo';
  let checklist: string[] = [];

  if (trigger === 'proposal.sent') {
    title = 'Revisar proposta e preparar documentação (Jurídico)';
    area = 'Jurídico';
    priority = 'high';
    templateId = 'juridico.proposal_review';
    checklist = [
      'Revisar escopo, prazos e cláusulas críticas',
      'Validar dados do cliente e CNPJ/CPF (se aplicável)',
      'Preparar minuta/termos do contrato',
      'Devolver para Contratos/Comercial com ajustes e riscos',
    ];
  } else if (trigger === 'proposal.accepted') {
    title = 'Gerar contrato e preparar assinatura (Contratos)';
    area = 'Contratos';
    priority = 'high';
    templateId = 'contratos.contract_generation';
    checklist = [
      'Gerar contrato a partir da proposta aceita',
      'Conferir valores, datas, vencimento e escopo',
      'Enviar para assinatura (DocuSign/Clicksign/etc.)',
      'Atualizar status e anexos no sistema',
    ];
  } else if (trigger === 'contract.created') {
    title = 'Configurar cobrança inicial e acompanhar pagamento (Financeiro)';
    area = 'Financeiro';
    priority = 'medium';
    templateId = 'financeiro.invoice_setup';
    checklist = [
      'Confirmar contrato ativo e dados de cobrança',
      'Validar fatura gerada / método de pagamento',
      'Enviar comunicação de cobrança ao cliente (se necessário)',
      'Registrar pendência/risco (se houver)',
    ];
  } else if (trigger === 'invoice.created') {
    title = 'Iniciar onboarding operacional (Operação)';
    area = 'Operacao';
    priority = 'high';
    templateId = 'operacao.onboarding_start';
    checklist = [
      'Agendar kickoff com cliente',
      'Coletar acessos e briefing',
      'Conectar integrações (Google/Meta/Pixel/WhatsApp)',
      'Criar plano inicial e responsabilidades',
    ];
  } else if (trigger === 'invoice.paid') {
    title = 'Pagamento confirmado — iniciar execução (Operação)';
    area = 'Operacao';
    priority = 'high';
    templateId = 'operacao.payment_confirmed';
    checklist = [
      'Confirmar liberação de execução (pagamento OK)',
      'Priorizar setup e kickoff',
      'Registrar início de operação e próximos marcos',
    ];
  } else if (trigger === 'invoice.payment_failed') {
    title = 'Falha no pagamento — acionar Financeiro/Comercial';
    area = 'Financeiro';
    priority = 'urgent';
    templateId = 'financeiro.payment_failed';
    checklist = [
      'Verificar motivo da falha no Stripe',
      'Contatar cliente e oferecer alternativa',
      'Atualizar status e próximos passos',
    ];
  }

  const checklistBlock = checklist.length
    ? `\n\nChecklist:\n${checklist.map((c) => `- [ ] ${c}`).join('\n')}`
    : '';

  const description =
    `${baseHeader}` +
    checklistBlock +
    `\n\nPayload:\n${payloadJson}`;

  return { title, description, status, priority, area, templateId };
}

/**
 * POST /api/admin/workflow-transitions/execute
 * Converte uma workflow_transition pendente em uma tarefa no Kanban (execução).
 * body: { id }
 */
export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const { data: authData } = await supabase.auth.getUser();
  const actorUserId = authData.user?.id || null;
  if (!actorUserId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { data: isAdmin, error: isAdminError } = await supabase.rpc('is_admin');
  if (isAdminError || !isAdmin) return NextResponse.json({ error: 'Acesso negado (admin)' }, { status: 403 });

  try {
    const body = await request.json();
    const id = body?.id as string | undefined;
    if (!id) return NextResponse.json({ error: 'id é obrigatório' }, { status: 400 });

    const { data: transition, error } = await supabase
      .from('workflow_transitions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !transition) return NextResponse.json({ error: 'Transição não encontrada' }, { status: 404 });
    const payload = transition.data_payload || {};
    const status = String(transition.status || '').toLowerCase();
    const existingIds = extractExistingKanbanIds(payload);

    // Idempotência: se já foi executada e temos ids, só retorna.
    if (status === 'completed' && existingIds.boardId && existingIds.taskId) {
      return NextResponse.json({
        success: true,
        task_id: existingIds.taskId,
        board_id: existingIds.boardId,
        client_id: payload?.client_id ?? null,
        already_executed: true,
      });
    }

    // Idempotência: tentar achar tarefa já criada por reference_links/metadata (mesmo que payload não tenha ids)
    const foundTask = await findExistingKanbanTaskForTransition(supabase, transition.id);
    if (foundTask?.id && foundTask?.board_id) {
      const executedAt = new Date().toISOString();
      const mergedPayload = {
        ...(payload || {}),
        kanban_task_id: String(foundTask.id),
        kanban_board_id: String(foundTask.board_id),
        executed_at: (payload as any)?.executed_at || executedAt,
        executed_by: (payload as any)?.executed_by || actorUserId,
        client_id: (payload as any)?.client_id ?? (foundTask as any)?.client_id ?? null,
      };

      // Se ainda estava pendente, "fecha" como concluída.
      if (status === 'pending') {
        await supabase
          .from('workflow_transitions')
          .update({
            status: 'completed',
            completed_at: executedAt,
            error_message: null,
            data_payload: mergedPayload,
          })
          .eq('id', transition.id);
      } else {
        // status já completed/error, só garantir payload atualizado (best-effort)
        try {
          await supabase.from('workflow_transitions').update({ data_payload: mergedPayload }).eq('id', transition.id);
        } catch {
          // ignore
        }
      }

      return NextResponse.json({
        success: true,
        task_id: String(foundTask.id),
        board_id: String(foundTask.board_id),
        client_id: mergedPayload.client_id ?? null,
        already_executed: true,
      });
    }

    if (status !== 'pending') {
      return NextResponse.json({ error: 'Apenas transições pendentes podem ser executadas' }, { status: 400 });
    }

    const clientId = await resolveClientIdFromPayload(supabase, payload);

    const boardId = clientId
      ? await getOrCreateOnboardingBoardIdForClient(supabase as any, clientId, actorUserId)
      : await getOrCreateSuperAdminBoardId(supabase as any, actorUserId);

    const tpl = buildTemplate(transition, payload);

    const task = await createKanbanTaskFromHub(supabase as any, {
      boardId,
      clientId,
      title: tpl.title,
      description: tpl.description,
      status: tpl.status,
      priority: tpl.priority,
      area: tpl.area,
      createdBy: actorUserId,
      referenceLinks: {
        type: 'workflow_transition',
        workflow_transition_id: transition.id,
        from_area: transition.from_area,
        to_area: transition.to_area,
        trigger_event: transition.trigger_event,
        payload,
        template_id: tpl.templateId,
      },
    });

    const executedAt = new Date().toISOString();
    const mergedPayload = {
      ...(payload || {}),
      kanban_task_id: task.id,
      kanban_board_id: task.board_id,
      executed_at: executedAt,
      executed_by: actorUserId,
      client_id: clientId ?? (payload as any)?.client_id ?? null,
    };

    // Marcar transição como concluída (já virou execução) + persistir ids do Kanban no payload
    await supabase
      .from('workflow_transitions')
      .update({
        status: 'completed',
        completed_at: executedAt,
        error_message: null,
        data_payload: mergedPayload,
      })
      .eq('id', transition.id);

    // Notificar admins (broadcast)
    const kanbanLink = `/admin/meu-kanban?boardId=${encodeURIComponent(task.board_id)}&taskId=${encodeURIComponent(task.id)}`;
    await notifyAdmins(supabase as any, {
      title: 'Fluxo enviado para execução',
      message: `Transição "${transition.from_area} → ${transition.to_area}" virou tarefa no Kanban.`,
      type: 'system',
      link: kanbanLink,
      metadata: {
        workflow_transition_id: transition.id,
        trigger_event: transition.trigger_event,
        board_id: task.board_id,
        task_id: task.id,
        client_id: clientId,
      },
      is_read: false,
    });

    return NextResponse.json({
      success: true,
      task_id: task.id,
      board_id: task.board_id,
      client_id: clientId,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro interno' }, { status: 500 });
  }
}


