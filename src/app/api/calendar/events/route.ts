import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/admin/supabaseAdmin';

export const dynamic = 'force-dynamic';

function isMissingTableError(message: string) {
  const m = String(message || '').toLowerCase();
  return (
    m.includes('does not exist') ||
    m.includes('relation') ||
    m.includes('schema cache') ||
    m.includes('could not find the table')
  );
}

function parseIso(v: string | null): string | null {
  if (!v) return null;
  const s = String(v).trim();
  if (!s) return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

function getUserSupabaseFromRequest(request: NextRequest) {
  // cookie OU Bearer token
  const cookieStore = cookies();
  const supabaseCookie = createRouteHandlerClient({ cookies: () => cookieStore });

  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization') || '';
  const token = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice('Bearer '.length).trim() : null;

  const supabaseUser = token
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      })
    : supabaseCookie;

  return { supabaseUser };
}

export async function GET(request: NextRequest) {
  const { supabaseUser } = getUserSupabaseFromRequest(request);
  const { data: auth } = await supabaseUser.auth.getUser();
  const user = auth?.user;
  if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const all = searchParams.get('all') === '1';
  const start = parseIso(searchParams.get('start'));
  const end = parseIso(searchParams.get('end'));

  const { data: isAdmin } = await supabaseUser.rpc('is_admin');

  const db = getSupabaseAdmin();

  try {
    // coluna pode variar por drift: start_datetime/end_datetime (migration) vs start_date/end_date (alguns pontos do app)
    const selectCols = 'id,title,description,event_type,start_datetime,end_datetime,start_date,end_date,all_day,location,meeting_link,is_online,organizer_id,participants,client_id,status,created_at';

    let query = db.from('calendar_events').select(selectCols).order('start_datetime', { ascending: true, nullsFirst: false });

    if (start) {
      query = query.gte('start_datetime', start);
    }
    if (end) {
      query = query.lte('end_datetime', end);
    }

    if (!all || !isAdmin) {
      // escopo: eventos do usuário (best-effort)
      query = query.or(`organizer_id.eq.${user.id}`);
    }

    const { data, error } = await query.limit(all && isAdmin ? 2000 : 300);
    if (error) throw error;

    return NextResponse.json({
      success: true,
      events: data || [],
      note: null,
    });
  } catch (e: any) {
    if (isMissingTableError(e?.message || '')) {
      return NextResponse.json({ success: true, events: [], note: 'Tabela calendar_events ainda não existe neste ambiente.' });
    }
    return NextResponse.json({ success: false, error: e?.message || 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { supabaseUser } = getUserSupabaseFromRequest(request);
  const { data: auth } = await supabaseUser.auth.getUser();
  const user = auth?.user;
  if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

  const db = getSupabaseAdmin();

  try {
    const body = await request.json().catch(() => null);
    const title = String(body?.title || '').trim();
    if (!title) return NextResponse.json({ success: false, error: 'title é obrigatório' }, { status: 400 });

    const event_type = String(body?.event_type || 'other');
    const start_datetime = parseIso(body?.start_datetime) || null;
    const end_datetime = parseIso(body?.end_datetime) || null;
    if (!start_datetime || !end_datetime) {
      return NextResponse.json({ success: false, error: 'start_datetime e end_datetime são obrigatórios (ISO)' }, { status: 400 });
    }

    const row: any = {
      title,
      description: body?.description ? String(body.description) : null,
      event_type,
      start_datetime,
      end_datetime,
      all_day: !!body?.all_day,
      location: body?.location ? String(body.location) : null,
      meeting_link: body?.meeting_link ? String(body.meeting_link) : null,
      is_online: !!body?.is_online,
      organizer_id: user.id,
      participants: Array.isArray(body?.participants) ? body.participants : [],
      client_id: body?.client_id ? String(body.client_id) : null,
      status: body?.status ? String(body.status) : 'scheduled',
      metadata: body?.metadata && typeof body.metadata === 'object' ? body.metadata : {},
    };

    const { data, error } = await db.from('calendar_events').insert(row).select('*').single();
    if (error) throw error;

    return NextResponse.json({ success: true, event: data });
  } catch (e: any) {
    if (isMissingTableError(e?.message || '')) {
      return NextResponse.json({ success: false, error: 'Schema de calendário ainda não aplicado (calendar_events).' }, { status: 501 });
    }
    return NextResponse.json({ success: false, error: e?.message || 'Erro interno' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const { supabaseUser } = getUserSupabaseFromRequest(request);
  const { data: auth } = await supabaseUser.auth.getUser();
  const user = auth?.user;
  if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

  const { data: isAdmin } = await supabaseUser.rpc('is_admin');
  const db = getSupabaseAdmin();

  try {
    const body = await request.json().catch(() => null);
    const id = String(body?.id || '').trim();
    if (!id) return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });

    if (!isAdmin) {
      const { data: ev } = await db.from('calendar_events').select('id,organizer_id').eq('id', id).maybeSingle();
      if (!ev || String((ev as any).organizer_id || '') !== user.id) {
        return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 });
      }
    }

    const updates: any = {};
    if (body?.title != null) updates.title = String(body.title).trim();
    if (body?.description != null) updates.description = body.description ? String(body.description) : null;
    if (body?.event_type != null) updates.event_type = String(body.event_type);
    if (body?.start_datetime != null) updates.start_datetime = parseIso(String(body.start_datetime)) || null;
    if (body?.end_datetime != null) updates.end_datetime = parseIso(String(body.end_datetime)) || null;
    if (body?.location != null) updates.location = body.location ? String(body.location) : null;
    if (body?.meeting_link != null) updates.meeting_link = body.meeting_link ? String(body.meeting_link) : null;
    if (body?.status != null) updates.status = String(body.status);
    if (body?.metadata != null) updates.metadata = body.metadata && typeof body.metadata === 'object' ? body.metadata : {};

    const { data, error } = await db.from('calendar_events').update(updates).eq('id', id).select('*').single();
    if (error) throw error;

    return NextResponse.json({ success: true, event: data });
  } catch (e: any) {
    if (isMissingTableError(e?.message || '')) {
      return NextResponse.json({ success: false, error: 'Schema de calendário ainda não aplicado (calendar_events).' }, { status: 501 });
    }
    return NextResponse.json({ success: false, error: e?.message || 'Erro interno' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { supabaseUser } = getUserSupabaseFromRequest(request);
  const { data: auth } = await supabaseUser.auth.getUser();
  const user = auth?.user;
  if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

  const { data: isAdmin } = await supabaseUser.rpc('is_admin');
  const db = getSupabaseAdmin();
  const { searchParams } = new URL(request.url);
  const id = String(searchParams.get('id') || '').trim();
  if (!id) return NextResponse.json({ success: false, error: 'id é obrigatório' }, { status: 400 });

  try {
    if (!isAdmin) {
      const { data: ev } = await db.from('calendar_events').select('id,organizer_id').eq('id', id).maybeSingle();
      if (!ev || String((ev as any).organizer_id || '') !== user.id) {
        return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 });
      }
    }

    const { error } = await db.from('calendar_events').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (isMissingTableError(e?.message || '')) {
      return NextResponse.json({ success: false, error: 'Schema de calendário ainda não aplicado (calendar_events).' }, { status: 501 });
    }
    return NextResponse.json({ success: false, error: e?.message || 'Erro interno' }, { status: 500 });
  }
}


