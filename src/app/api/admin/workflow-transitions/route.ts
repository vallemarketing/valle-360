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

  const { data: isAdmin, error: isAdminError } = await supabase.rpc('is_admin');
  if (isAdminError || !isAdmin) return NextResponse.json({ error: 'Acesso negado (admin)' }, { status: 403 });

  try {
    const body = await request.json();
    const id = body?.id as string | undefined;
    const status = asWorkflowStatus(body?.status);
    const errorMessage = (body?.error_message ?? body?.errorMessage) as string | null | undefined;

    if (!id || !status) {
      return NextResponse.json({ error: 'id e status são obrigatórios' }, { status: 400 });
    }

    const patch: Record<string, any> = {
      status,
      error_message: status === 'error' ? (errorMessage || 'Erro informado pelo admin') : null,
      completed_at: status === 'completed' ? new Date().toISOString() : null,
    };

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


