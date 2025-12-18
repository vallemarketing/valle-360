import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const adminSupabase = createClient(
  supabaseUrl || 'https://setup-missing.supabase.co',
  supabaseServiceKey || 'setup-missing',
  { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
);

async function requireUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;
  if (!token) return null;
  const { data: { user } } = await adminSupabase.auth.getUser(token);
  return user || null;
}

async function requireAdmin(userId: string) {
  const { data } = await adminSupabase
    .from('user_profiles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();
  const role = (data?.role || '').toLowerCase();
  return role === 'admin' || role === 'super_admin';
}

function timeAgoPtBR(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'Agora';
  if (minutes < 60) return `Há ${minutes} minutos`;
  if (hours < 24) return `Há ${hours} horas`;
  return `Há ${days} dias`;
}

/**
 * GET /api/admin/dashboard
 * Retorna KPIs reais do Admin (modo teste: com fallback).
 */
export async function GET(request: NextRequest) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  if (!(await requireAdmin(user.id))) return NextResponse.json({ error: 'Acesso negado (admin)' }, { status: 403 });

  try {
    // ===== Clients =====
    const { count: totalClients } = await adminSupabase
      .from('clients')
      .select('*', { count: 'exact', head: true });

    const { count: activeClients } = await adminSupabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .or('status.eq.active,status.eq.ativo,is_active.eq.true');

    // ===== Employees =====
    const { count: totalEmployees } = await adminSupabase
      .from('employees')
      .select('*', { count: 'exact', head: true });

    const { count: activeEmployees } = await adminSupabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // ===== Monthly revenue (contracts active) =====
    const { data: contracts } = await adminSupabase
      .from('contracts')
      .select('monthly_value,status,active')
      .limit(500);

    const monthlyRevenue = (contracts || [])
      .filter((c: any) => String(c.status || '').toLowerCase() === 'active' || c.active === true)
      .reduce((sum: number, c: any) => sum + Number(c.monthly_value || 0), 0);

    // ===== Tasks =====
    const pendingStatuses = ['backlog', 'todo', 'in_progress', 'in_review', 'blocked'];
    const { count: pendingTasks } = await adminSupabase
      .from('kanban_tasks')
      .select('*', { count: 'exact', head: true })
      .in('status', pendingStatuses as any);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const { count: completedTasksToday } = await adminSupabase
      .from('kanban_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'done' as any)
      .gte('updated_at', startOfDay.toISOString());

    // ===== Hub pendências (event_log + workflow_transitions) =====
    const { count: pendingEvents } = await adminSupabase
      .from('event_log')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { count: pendingTransitions } = await adminSupabase
      .from('workflow_transitions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const pendingTotal = Number(pendingTasks || 0) + Number(pendingEvents || 0) + Number(pendingTransitions || 0);
    const preferredHubTab = Number(pendingEvents || 0) > 0 ? 'events' : 'transitions';

    // ===== Activity =====
    const { data: lastEvents } = await adminSupabase
      .from('event_log')
      .select('id,event_type,created_at,status')
      .order('created_at', { ascending: false })
      .limit(6);

    let recentActivity = (lastEvents || []).map((e: any) => {
      const type = String(e.event_type || 'system.event');
      const icon: 'user' | 'task' | 'money' | 'alert' =
        type.includes('invoice') || type.includes('payment') ? 'money' :
        type.includes('client') || type.includes('employee') ? 'user' :
        type.includes('proposal') || type.includes('goal') ? 'task' :
        'alert';

      return {
        id: e.id,
        type,
        title: type,
        description: `Status: ${e.status}`,
        time: timeAgoPtBR(e.created_at),
        icon,
        link: `/admin/fluxos?tab=events&status=${encodeURIComponent(String(e.status || 'pending'))}&q=${encodeURIComponent(type)}`,
      };
    });

    // Fallback: se não há eventos ainda, usar audit_logs (ai.request / api.* / system.*)
    if (!recentActivity || recentActivity.length === 0) {
      const { data: auditRows } = await adminSupabase
        .from('audit_logs')
        .select('id,action,created_at,new_values')
        .order('created_at', { ascending: false })
        .limit(6);

      recentActivity = (auditRows || []).map((r: any) => {
        const type = String(r.action || 'audit');
        const nv = r.new_values || {};
        const ok = nv.success ?? nv.ok;
        const icon: 'user' | 'task' | 'money' | 'alert' =
          type.includes('invoice') || type.includes('payment') ? 'money' :
          type.includes('client') || type.includes('employee') ? 'user' :
          type.includes('proposal') || type.includes('goal') ? 'task' :
          'alert';

        return {
          id: r.id,
          type,
          title: type,
          description: String(nv.description || 'Log de auditoria'),
          time: timeAgoPtBR(r.created_at),
          icon,
          link: `/admin/auditoria`,
        };
      });
    }

    // ===== Active clients (list) =====
    const { data: clients } = await adminSupabase
      .from('clients')
      .select('id,company_name,nome_fantasia,razao_social,contact_name,contact_email,contact_phone,whatsapp,created_at,monthly_value')
      .order('created_at', { ascending: false })
      .limit(5);

    const activeClientsList = (clients || []).map((c: any) => {
      const company = c.company_name || c.nome_fantasia || c.razao_social || 'Cliente';
      const name = c.contact_name || company;
      const email = c.contact_email || '';
      const phone = c.contact_phone || c.whatsapp || '';

      const createdAt = c.created_at ? new Date(c.created_at) : new Date();
      const days = Math.floor((Date.now() - createdAt.getTime()) / 86400000);
      const status: 'em_dia' | 'atrasado' | 'novo' = days <= 7 ? 'novo' : 'em_dia';

      const monthly = Number(c.monthly_value || 0);
      return {
        id: c.id,
        name,
        company,
        email,
        phone,
        status,
        projectStatus: status === 'novo' ? 'Onboarding' : 'Ativo',
        nextDelivery: '',
        contractValue: monthly ? `R$ ${monthly.toLocaleString('pt-BR')}/mês` : '—',
      };
    });

    return NextResponse.json({
      stats: {
        totalClients: totalClients || 0,
        activeClients: activeClients || 0,
        totalEmployees: totalEmployees || 0,
        activeEmployees: activeEmployees || 0,
        monthlyRevenue,
        pendingTasks: pendingTotal,
        completedTasksToday: completedTasksToday || 0,
        avgClientSatisfaction: 0,
      },
      hub: {
        pending: {
          kanban: Number(pendingTasks || 0),
          events: Number(pendingEvents || 0),
          transitions: Number(pendingTransitions || 0),
          total: pendingTotal,
        },
        preferredTab: preferredHubTab,
        links: {
          pending: `/admin/fluxos?tab=${preferredHubTab}&status=pending`,
        },
      },
      recentActivity,
      activeClients: activeClientsList,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro interno' }, { status: 500 });
  }
}


