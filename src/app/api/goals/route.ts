/**
 * Valle 360 - API de Metas
 * Endpoints para gestão de metas inteligentes
 */

import { NextRequest, NextResponse } from 'next/server';
import { goalEngine } from '@/lib/goals/goal-engine';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const collaboratorId = searchParams.get('collaborator_id');
    const sector = searchParams.get('sector');
    const status = searchParams.get('status');

    let query = supabase.from('collaborator_goals').select('*');

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
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
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
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID da meta é obrigatório' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
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

