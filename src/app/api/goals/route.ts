/**
 * Valle 360 - API de Metas
 * Endpoints para gestão de metas inteligentes
 */

import { NextRequest, NextResponse } from 'next/server';
import { goalEngine } from '@/lib/goals/goal-engine';
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

async function getUserFromRequest(request: NextRequest) {
  // Bearer token (compatível com login via supabase-js localStorage)
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;
  if (!token) return null;

  const { data: { user } } = await adminSupabase.auth.getUser(token);
  return user || null;
}

function mapEmployeeAreaToSector(area?: string | null): string {
  const a = (area || '').toLowerCase();
  if (a.includes('social')) return 'social_media';
  if (a.includes('trafego')) return 'trafego';
  if (a.includes('video')) return 'video_maker';
  if (a.includes('comercial')) return 'comercial';
  if (a.includes('design')) return 'designer';
  if (a.includes('web')) return 'designer';
  return 'designer';
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const collaboratorId = searchParams.get('collaborator_id');
    const sector = searchParams.get('sector');
    const status = searchParams.get('status');

    let query = adminSupabase.from('collaborator_goals').select('*');

    if (collaboratorId) {
      query = query.eq('collaborator_id', collaboratorId);
    }
    if (sector) {
      query = query.eq('sector', sector);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'generate_all': {
        const period_type = (params.period_type || 'monthly') as 'weekly' | 'monthly' | 'quarterly';

        const { data: employees, error } = await adminSupabase
          .from('employees')
          .select('user_id, first_name, last_name, areas')
          .limit(500);

        if (error) {
          return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        let generated = 0;
        const created: any[] = [];

        for (const emp of employees || []) {
          const name = `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'Colaborador';
          const firstArea = Array.isArray(emp.areas) ? emp.areas[0] : undefined;
          const sector = mapEmployeeAreaToSector(firstArea);

          const goal = await goalEngine.createGoal(emp.user_id, name, sector, period_type);
          if (goal) {
            generated += 1;
            created.push(goal);
          }
        }

        return NextResponse.json({ success: true, generated, data: created });
      }

      case 'generate': {
        // Gerar metas automáticas com IA
        const { collaborator_id, collaborator_name, sector, period_type } = params;
        
        if (!collaborator_id || !sector) {
          return NextResponse.json(
            { success: false, error: 'collaborator_id e sector são obrigatórios' },
            { status: 400 }
          );
        }

        const goal = await goalEngine.createGoal(
          collaborator_id,
          collaborator_name || 'Colaborador',
          sector,
          period_type || 'monthly'
        );

        return NextResponse.json({ success: true, data: goal });
      }

      case 'suggest': {
        // Obter sugestões de metas
        const { collaborator_id, sector, period_type } = params;
        
        const suggestions = await goalEngine.calculateSuggestedGoals(
          collaborator_id,
          sector,
          period_type || 'monthly'
        );

        return NextResponse.json({ success: true, data: suggestions });
      }

      case 'update_progress': {
        // Atualizar progresso de uma meta
        const { goal_id, metric_name, value } = params;
        
        const result = await goalEngine.updateProgress(goal_id, metric_name, value);
        return NextResponse.json({ success: true, data: result });
      }

      case 'check_alerts': {
        // Verificar e criar alertas para metas atrasadas
        await goalEngine.checkAndCreateAlerts();
        return NextResponse.json({ success: true, message: 'Alertas verificados' });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Ação inválida' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID da meta é obrigatório' },
        { status: 400 }
      );
    }

    const { data, error } = await adminSupabase
      .from('collaborator_goals')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

