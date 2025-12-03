import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { 
  generateBusinessInsights, 
  generateMarketingInsights, 
  analyzeCompetitors,
  generateClientInsights 
} from '@/lib/integrations/openai/insights';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { type, data } = body;

    // Buscar API key da OpenAI
    const { data: config } = await supabase
      .from('integration_configs')
      .select('api_key')
      .eq('integration_id', 'openai')
      .single();

    const apiKey = config?.api_key || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ 
        error: 'OpenAI não configurada',
        details: 'Configure a API Key da OpenAI nas integrações'
      }, { status: 400 });
    }

    let result;
    const startTime = Date.now();

    switch (type) {
      case 'business':
        // Insights de negócio gerais
        result = await generateBusinessInsights(data, apiKey);
        break;

      case 'marketing':
        // Insights de marketing/campanhas
        if (!data.campaigns) {
          return NextResponse.json({ error: 'Dados de campanhas são obrigatórios' }, { status: 400 });
        }
        result = await generateMarketingInsights(data, apiKey);
        break;

      case 'competitor':
        // Análise de concorrentes
        if (!data.ourBusiness || !data.competitors) {
          return NextResponse.json({ error: 'Dados do negócio e concorrentes são obrigatórios' }, { status: 400 });
        }
        result = await analyzeCompetitors(data, apiKey);
        break;

      case 'client':
        // Insights de cliente específico
        if (!data.name) {
          return NextResponse.json({ error: 'Nome do cliente é obrigatório' }, { status: 400 });
        }
        result = await generateClientInsights(data, apiKey);
        break;

      default:
        return NextResponse.json({ error: 'Tipo de insight inválido' }, { status: 400 });
    }

    const duration = Date.now() - startTime;

    // Registrar uso
    await supabase.from('integration_logs').insert({
      integration_id: 'openai',
      action: `insights_${type}`,
      status: 'success',
      request_data: { type },
      response_data: { insightsCount: Array.isArray(result) ? result.length : 1 },
      duration_ms: duration
    });

    return NextResponse.json({
      success: true,
      result,
      metadata: {
        type,
        generatedAt: new Date().toISOString(),
        processingTime: duration
      }
    });

  } catch (error: any) {
    console.error('Erro na geração de insights:', error);
    return NextResponse.json({ 
      error: 'Erro na geração de insights',
      details: error.message 
    }, { status: 500 });
  }
}

// GET para buscar insights pré-gerados ou do dashboard
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const type = searchParams.get('type') || 'business';

    // Buscar dados relevantes do banco
    let businessData: any = {};

    // Buscar métricas de clientes
    const { data: clients } = await supabase
      .from('clients')
      .select('id, name, status')
      .limit(100);

    businessData.clients = clients?.length || 0;
    businessData.activeClients = clients?.filter(c => c.status === 'active').length || 0;

    // Buscar dados de colaboradores
    const { data: employees } = await supabase
      .from('employees')
      .select('id, area_of_expertise')
      .limit(100);

    businessData.teamSize = employees?.length || 0;

    // Se tiver clientId, buscar dados específicos
    if (clientId) {
      const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (client) {
        businessData.clientData = client;
      }
    }

    // Gerar insights básicos sem IA (fallback)
    const basicInsights = generateBasicInsights(businessData);

    return NextResponse.json({
      success: true,
      insights: basicInsights,
      businessData: {
        totalClients: businessData.clients,
        activeClients: businessData.activeClients,
        teamSize: businessData.teamSize
      }
    });

  } catch (error: any) {
    console.error('Erro ao buscar insights:', error);
    return NextResponse.json({ 
      error: 'Erro ao buscar insights',
      details: error.message 
    }, { status: 500 });
  }
}

// Função para gerar insights básicos sem IA
function generateBasicInsights(data: any) {
  const insights = [];

  if (data.clients > 0) {
    const activeRate = (data.activeClients / data.clients) * 100;
    
    if (activeRate < 70) {
      insights.push({
        id: 'client-retention',
        type: 'risk',
        priority: 'high',
        title: 'Taxa de Clientes Ativos Baixa',
        description: `Apenas ${activeRate.toFixed(1)}% dos clientes estão ativos. Considere implementar estratégias de retenção.`,
        impact: 'Pode afetar receita recorrente',
        action: 'Revisar processo de onboarding e suporte ao cliente',
        confidence: 0.8
      });
    }

    if (data.clients > 50 && data.teamSize < 10) {
      insights.push({
        id: 'team-scaling',
        type: 'opportunity',
        priority: 'medium',
        title: 'Oportunidade de Expansão da Equipe',
        description: `Com ${data.clients} clientes e apenas ${data.teamSize} colaboradores, há oportunidade de crescimento.`,
        impact: 'Melhor atendimento e capacidade de crescimento',
        action: 'Avaliar contratação para áreas críticas',
        confidence: 0.7
      });
    }
  }

  // Insight padrão se não houver dados suficientes
  if (insights.length === 0) {
    insights.push({
      id: 'data-collection',
      type: 'recommendation',
      priority: 'medium',
      title: 'Colete Mais Dados',
      description: 'Com mais dados históricos, podemos gerar insights mais precisos sobre seu negócio.',
      impact: 'Melhores decisões baseadas em dados',
      action: 'Continue registrando métricas e interações',
      confidence: 1.0
    });
  }

  return insights;
}




