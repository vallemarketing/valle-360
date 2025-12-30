import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import type { AreaKey } from '@/lib/kanban/areaBoards';
import { getAreaBoard } from '@/lib/kanban/areaBoards';

export const dynamic = 'force-dynamic';

type RequestType = 'vacation' | 'dayoff' | 'home_office' | 'equipment' | 'refund';

function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function getUserFromRequest(request: NextRequest): Promise<{ user: { id: string; email?: string | null } | null }> {
  // 1) Cookies (app)
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data } = await supabase.auth.getUser();
    if (data?.user?.id) return { user: { id: data.user.id, email: data.user.email } };
  } catch {
    // ignore
  }

  // 2) Bearer (mobile / apps)
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;
  if (!token) return { user: null };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return { user: null };

  const supabase = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user?.id) return { user: null };
  return { user: { id: data.user.id, email: data.user.email } };
}

async function isAdminUser(service: any, userId: string): Promise<boolean> {
  try {
    const { data } = await service
      .from('user_profiles')
      .select('user_type, role')
      .eq('user_id', userId)
      .maybeSingle();
    const ut = String((data as any)?.user_type || '').toLowerCase();
    const role = String((data as any)?.role || '').toLowerCase();
    return ut === 'super_admin' || ut === 'admin' || role === 'super_admin' || role === 'admin';
  } catch {
    return false;
  }
}

function requestTypeLabel(type: string) {
  switch (String(type)) {
    case 'vacation':
      return 'Férias';
    case 'dayoff':
      return 'Folga / Day Off';
    case 'home_office':
      return 'Home Office';
    case 'equipment':
      return 'Equipamento';
    case 'refund':
      return 'Reembolso';
    default:
      return 'Solicitação';
  }
}

export async function GET(request: NextRequest) {
  try {
    const { user } = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const service = getServiceSupabase();
    if (!service) {
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY não configurada no servidor' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const wantAll = searchParams.get('all') === '1';
    const admin = wantAll ? await isAdminUser(service, user.id) : false;
    if (wantAll && !admin) return NextResponse.json({ error: 'Acesso negado (admin)' }, { status: 403 });

    let q = service
      .from('kanban_tasks')
      .select(
        `
          id, title, created_at, updated_at, reference_links,
          column:kanban_columns ( stage_key )
        `
      )
      .contains('reference_links', { source: 'employee_request' })
      .order('created_at', { ascending: false })
      .limit(200);

    if (!wantAll) q = q.eq('created_by', user.id);

    const { data, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const requests = (data || []).map((t: any) => {
      const ref = (t?.reference_links || {}) as any;
      const req = (ref?.request || {}) as any;
      const stageKey = String(t?.column?.stage_key || '').toLowerCase();
      const status =
        String(req?.status || '').trim() ||
        (stageKey.includes('final') ? 'approved' : stageKey.includes('bloq') ? 'rejected' : 'pending');

      return {
        id: String(t.id),
        type: String(req?.type || ''),
        start_date: req?.start_date || null,
        end_date: req?.end_date || null,
        reason: req?.reason || null,
        amount: req?.amount || null,
        attachments: Array.isArray(req?.attachments) ? req.attachments : [],
        status,
        created_at: t.created_at,
        title: String(t.title || ''),
      };
    });

    return NextResponse.json({ success: true, requests, total: requests.length });
  } catch (error) {
    console.error('Error fetching requests:', error)
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const service = getServiceSupabase();
    if (!service) {
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY não configurada no servidor' }, { status: 500 });
    }

    const body = await request.json().catch(() => null);
    const type = String(body?.type || '').trim() as RequestType;
    const start_date = body?.start_date ? String(body.start_date) : '';
    const end_date = body?.end_date ? String(body.end_date) : null;
    const reason = String(body?.reason || '').trim();
    const amount = body?.amount != null ? String(body.amount) : null;
    const attachments = Array.isArray(body?.attachments) ? body.attachments : [];

    if (!type || !start_date || !reason) {
      return NextResponse.json({ error: 'Campos obrigatórios: type, start_date, reason' }, { status: 400 });
    }

    // Validar que é colaborador (ou admin)
    const admin = await isAdminUser(service, user.id);
    if (!admin) {
      const { data: emp } = await service.from('employees').select('id, is_active').eq('user_id', user.id).maybeSingle();
      if (!emp?.id) return NextResponse.json({ error: 'Acesso negado (colaborador)' }, { status: 403 });
    }

    // Criar como tarefa no Kanban de RH (coluna Demanda)
    let areaKey: AreaKey = 'rh';
    let board = await service.from('kanban_boards').select('id, area_key, name').eq('area_key', areaKey).maybeSingle();
    if (!board?.data?.id) {
      areaKey = 'operacao';
      board = await service.from('kanban_boards').select('id, area_key, name').eq('area_key', areaKey).maybeSingle();
    }
    if (!board?.data?.id) return NextResponse.json({ error: 'Board de RH/Operação não encontrado' }, { status: 500 });

    const { data: demandCol } = await service
      .from('kanban_columns')
      .select('id, stage_key')
      .eq('board_id', board.data.id)
      .eq('stage_key', 'demanda')
      .maybeSingle();
    if (!demandCol?.id) return NextResponse.json({ error: 'Coluna "Demanda" não encontrada no board de destino' }, { status: 500 });

    // Próxima posição
    const { data: last } = await service
      .from('kanban_tasks')
      .select('position')
      .eq('board_id', board.data.id)
      .eq('column_id', demandCol.id)
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextPosition = Number((last as any)?.position || 0) + 1;

    const now = new Date().toISOString();
    const title = `Solicitação (${requestTypeLabel(type)}): ${start_date}${end_date ? ` → ${end_date}` : ''}`;

    const { data: created, error: insErr } = await service
      .from('kanban_tasks')
      .insert({
        board_id: board.data.id,
        column_id: demandCol.id,
        title,
        description: reason,
        priority: type === 'refund' ? 'high' : 'medium',
        status: 'todo',
        tags: Array.from(new Set(['solicitacao', 'colaborador', type])),
        due_date: start_date || null,
        client_id: null,
        area: areaKey,
        reference_links: {
          source: 'employee_request',
          request: {
            type,
            start_date,
            end_date,
            reason,
            amount,
            attachments,
            status: 'pending',
          },
          created_at: now,
        },
        assigned_to: null,
        created_by: user.id,
        position: nextPosition,
        updated_at: now,
      })
      .select('id, title, created_at, reference_links')
      .single();

    if (insErr || !created) {
      return NextResponse.json({ error: insErr?.message || 'Falha ao criar solicitação' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Solicitação criada com sucesso',
      request: {
        id: String((created as any).id),
        title: String((created as any).title || title),
        type,
        start_date,
        end_date,
        reason,
        amount,
        attachments,
        status: 'pending',
        created_at: (created as any).created_at,
      },
      target: { area_key: areaKey, board_id: board.data.id, column_id: demandCol.id, board_label: getAreaBoard(areaKey).label },
    });
  } catch (error) {
    console.error('Error creating request:', error)
    return NextResponse.json(
      { error: 'Failed to create request' },
      { status: 500 }
    )
  }
}


