import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

import { getOrCreateOnboardingBoardIdForClient, getOrCreateSuperAdminBoardId, createKanbanTaskFromHub } from '@/lib/kanban/hub';
import { notifyAdmins } from '@/lib/admin/notifyAdmins';

export const dynamic = 'force-dynamic';

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

function pickPriority(triggerEvent: string) {
  const t = (triggerEvent || '').toLowerCase();
  if (t.includes('payment_failed') || t.includes('failed')) return 'urgent';
  if (t.includes('paid')) return 'high';
  if (t.includes('created')) return 'medium';
  return 'medium';
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
    if (String(transition.status).toLowerCase() !== 'pending') {
      return NextResponse.json({ error: 'Apenas transições pendentes podem ser executadas' }, { status: 400 });
    }

    const payload = transition.data_payload || {};
    const clientId = await resolveClientIdFromPayload(supabase, payload);

    const boardId = clientId
      ? await getOrCreateOnboardingBoardIdForClient(supabase as any, clientId, actorUserId)
      : await getOrCreateSuperAdminBoardId(supabase as any, actorUserId);

    const title = `${transition.from_area} → ${transition.to_area}: ${transition.trigger_event}`;
    const description = `Disparado por: ${transition.trigger_event}\n\nPayload:\n${JSON.stringify(payload, null, 2)}`;

    const task = await createKanbanTaskFromHub(supabase as any, {
      boardId,
      clientId,
      title,
      description,
      status: 'todo',
      priority: pickPriority(String(transition.trigger_event)),
      area: transition.to_area || 'Operacao',
      createdBy: actorUserId,
      referenceLinks: {
        type: 'workflow_transition',
        workflow_transition_id: transition.id,
        from_area: transition.from_area,
        to_area: transition.to_area,
        trigger_event: transition.trigger_event,
        payload,
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


