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

function mapAreasToDepartment(areas?: string[] | null) {
  const a = (areas || []).map(x => String(x).toLowerCase());
  if (a.some(x => x.includes('design'))) return 'Design';
  if (a.some(x => x.includes('social'))) return 'Marketing';
  if (a.some(x => x.includes('trafego'))) return 'Marketing';
  if (a.some(x => x.includes('video'))) return 'Marketing';
  if (a.some(x => x.includes('finance'))) return 'Financeiro';
  if (a.some(x => x.includes('rh'))) return 'RH';
  if (a.some(x => x.includes('comercial'))) return 'Comercial';
  return 'Geral';
}

function mapAreasToExpertise(areas?: string[] | null) {
  return (areas || []).join(', ') || '—';
}

export async function GET(request: NextRequest) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  // employees + users (fallback para user_profiles se necessário)
  try {
    const { data: employees, error } = await adminSupabase
      .from('employees')
      .select('user_id,first_name,last_name,whatsapp,admission_date,areas,photo_url,created_at')
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) throw error;

    const userIds = (employees || []).map((e: any) => e.user_id).filter(Boolean);

    let usersRows: any[] = [];
    {
      const tryRich = await adminSupabase
        .from('users')
        .select('id,email,full_name,phone,account_status,name,role,user_type')
        .in('id', userIds);
      if (!tryRich.error) usersRows = tryRich.data || [];
      else {
        const tryBasic = await adminSupabase.from('users').select('id,email,name,role').in('id', userIds);
        usersRows = tryBasic.data || [];
      }
    }
    const usersById = new Map(usersRows.map((u: any) => [u.id, u]));

    const mapped = (employees || []).map((e: any) => {
      const u = usersById.get(e.user_id) || {};
      const fullName = (u.full_name || `${e.first_name || ''} ${e.last_name || ''}`.trim() || u.name || u.email || 'Colaborador');

      return {
        id: e.user_id,
        fullName,
        email: u.email || '',
        phone: u.phone || e.whatsapp || '',
        position: mapAreasToExpertise(e.areas),
        department: mapAreasToDepartment(e.areas),
        areaOfExpertise: mapAreasToExpertise(e.areas),
        status: (u.account_status && String(u.account_status).toLowerCase().includes('inact')) ? 'inactive' : 'active',
        hireDate: e.admission_date || e.created_at || new Date().toISOString(),
        avatar: e.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`,
        performanceScore: 0,
        deliveriesOnTime: 0,
        totalDeliveries: 0,
        retentionStatus: 'melhorar',
        clientsAssigned: 0,
        feedbackHistory: [],
      };
    });

    return NextResponse.json({ employees: mapped });
  } catch {
    const { data: profiles } = await adminSupabase
      .from('user_profiles')
      .select('user_id,full_name,email,phone,user_type,is_active,created_at,avatar_url')
      .neq('user_type', 'client')
      .limit(500);

    const mapped = (profiles || []).map((p: any) => ({
      id: p.user_id,
      fullName: p.full_name,
      email: p.email,
      phone: p.phone || '',
      position: p.user_type || 'Colaborador',
      department: p.user_type || 'Geral',
      areaOfExpertise: p.user_type || '—',
      status: p.is_active === false ? 'inactive' : 'active',
      hireDate: p.created_at || new Date().toISOString(),
      avatar: p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(p.full_name || p.email || 'user')}`,
      performanceScore: 0,
      deliveriesOnTime: 0,
      totalDeliveries: 0,
      retentionStatus: 'melhorar',
      clientsAssigned: 0,
      feedbackHistory: [],
    }));

    return NextResponse.json({ employees: mapped, warning: 'fallback_user_profiles' });
  }
}


