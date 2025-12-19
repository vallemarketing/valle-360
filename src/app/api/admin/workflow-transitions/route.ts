import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

type WorkflowStatus = 'pending' | 'completed' | 'error';

function asWorkflowStatus(v: any): WorkflowStatus | null {
  const s = String(v || '').toLowerCase();
  if (s === 'pending' || s === 'completed' || s === 'error') return s;
  return null;
}

/**
 * GET /api/admin/workflow-transitions
 * Lista transições de fluxo (hub).
 */
export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { data: isAdmin, error: isAdminError } = await supabase.rpc('is_admin');
  if (isAdminError || !isAdmin) return NextResponse.json({ error: 'Acesso negado (admin)' }, { status: 403 });

  try {
    const { searchParams } = new URL(request.url);
    const status = asWorkflowStatus(searchParams.get('status')) || undefined;
    const fromArea = searchParams.get('from_area') || undefined;
    const toArea = searchParams.get('to_area') || undefined;
    const triggerEvent = searchParams.get('trigger_event') || undefined;
    const limit = Math.max(1, Math.min(500, Number(searchParams.get('limit') || 100)));

    let q = supabase
      .from('workflow_transitions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) q = q.eq('status', status);
    if (fromArea) q = q.eq('from_area', fromArea);
    if (toArea) q = q.eq('to_area', toArea);
    if (triggerEvent) q = q.eq('trigger_event', triggerEvent);

    const { data, error } = await q;
    if (error) throw error;

    return NextResponse.json({ transitions: data || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro interno' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/workflow-transitions
 * Atualiza status de uma transição.
 * body: { id, status, error_message? }
 */
export async function PATCH(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user?.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const actorUserId = authData.user.id;

  const { data: isAdmin, error: isAdminError } = await supabase.rpc('is_admin');
  if (isAdminError || !isAdmin) return NextResponse.json({ error: 'Acesso negado (admin)' }, { status: 403 });

  try {
    const body = await request.json();
    const id = body?.id as string | undefined;
    const status = asWorkflowStatus(body?.status);
    const errorMessage = (body?.error_message ?? body?.errorMessage) as string | null | undefined;
    const note = (body?.note ?? body?.completed_note ?? body?.completion_note) as string | null | undefined;
    const action = String(body?.action || '').toLowerCase() || null; // reopen | resolve_error | null

    if (!id || !status) {
      return NextResponse.json({ error: 'id e status são obrigatórios' }, { status: 400 });
    }

    const { data: existingRow } = await supabase
      .from('workflow_transitions')
      .select('status,data_payload')
      .eq('id', id)
      .maybeSingle();

    const prevStatus = String((existingRow as any)?.status || '').toLowerCase();
    const prevPayload = ((existingRow as any)?.data_payload || {}) as Record<string, any>;

    const now = new Date().toISOString();
    const patch: Record<string, any> = {
      status,
      error_message: status === 'error' ? (errorMessage || 'Erro informado pelo admin') : null,
      completed_at: status === 'completed' ? now : null,
    };

    // Persistir notas/auditoria no data_payload (best-effort + merge)
    if (status === 'completed' && note && String(note).trim()) {
      patch.data_payload = {
        ...(prevPayload || {}),
        completed_note: String(note),
        completed_by: actorUserId,
        completed_at: now,
      };
    }

    // Voltar para pendente (manual): distingue reabrir vs resolver erro + reseta execução do Kanban (sem perder histórico)
    if (status === 'pending') {
      // Limpar completed_at e também limpar error_message
      patch.completed_at = null;
      patch.error_message = null;

      const nextPayload: Record<string, any> = { ...(prevPayload || {}) };

      const kanbanTaskId = nextPayload.kanban_task_id || null;
      const kanbanBoardId = nextPayload.kanban_board_id || null;
      const executedAt = nextPayload.executed_at || null;
      const executedBy = nextPayload.executed_by || null;

      if (kanbanTaskId || kanbanBoardId || executedAt || executedBy) {
        const prevExec = Array.isArray(nextPayload.previous_executions) ? nextPayload.previous_executions : [];
        prevExec.push({
          kanban_task_id: kanbanTaskId,
          kanban_board_id: kanbanBoardId,
          executed_at: executedAt,
          executed_by: executedBy,
          reset_at: now,
          reset_by: actorUserId,
        });
        nextPayload.previous_executions = prevExec;

        delete nextPayload.kanban_task_id;
        delete nextPayload.kanban_board_id;
        delete nextPayload.executed_at;
        delete nextPayload.executed_by;
      }

      const trimmedNote = note && String(note).trim() ? String(note).trim() : null;
      if (trimmedNote) {
        if (action === 'resolve_error' || (action === null && prevStatus === 'error')) {
          nextPayload.error_resolved_note = trimmedNote;
          nextPayload.error_resolved_by = actorUserId;
          nextPayload.error_resolved_at = now;
        } else {
          // default: reopen
          nextPayload.reopened_note = trimmedNote;
          nextPayload.reopened_by = actorUserId;
          nextPayload.reopened_at = now;
        }
      }

      patch.data_payload = nextPayload;
    }

    const { data, error } = await supabase
      .from('workflow_transitions')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, transition: data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro interno' }, { status: 500 });
  }
}


