/**
 * Valle 360 - API de Prospecção
 * Endpoints para captação e gestão de leads
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const segment = searchParams.get('segment');
    const status = searchParams.get('status');
    const minScore = searchParams.get('min_score');

    let query = supabase.from('prospecting_leads').select('*');

    if (segment) {
      query = query.eq('segment', segment);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (minScore) {
      query = query.gte('qualification_score', parseInt(minScore));
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
      case 'search': {
        // Simular busca de leads (integrar com Tavily em produção)
        const { segment, limit } = params;
        
        // Mock de leads encontrados
        const mockLeads = [
          {
            company_name: `Empresa ${segment} ${Date.now()}`,
            segment: segment || 'ecommerce',
            qualification_score: Math.floor(Math.random() * 40) + 60,
            source: 'tavily',
            status: 'new'
          }
        ];

        // Salvar no banco
        const { data, error } = await supabase
          .from('prospecting_leads')
          .insert(mockLeads)
          .select();

        if (error) {
          return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data, count: mockLeads.length });
      }

      case 'contact': {
        // Iniciar contato com lead
        const { lead_id } = params;
        
        await supabase
          .from('prospecting_leads')
          .update({ 
            status: 'contacted',
            last_interaction_at: new Date().toISOString()
          })
          .eq('id', lead_id);

        return NextResponse.json({ success: true, message: 'Contato iniciado' });
      }

      case 'create': {
        // Criar lead manual
        const { data, error } = await supabase
          .from('prospecting_leads')
          .insert(params)
          .select()
          .single();

        if (error) {
          return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
      }

      default:
        return NextResponse.json({ success: false, error: 'Ação inválida' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    const { data, error } = await supabase
      .from('prospecting_leads')
      .update({ ...updates, updated_at: new Date().toISOString() })
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
