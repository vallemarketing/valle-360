import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get('id');
    const category = searchParams.get('category');

    let query = supabase
      .from('integration_configs')
      .select('integration_id, display_name, category, status, last_sync, error_message, config');

    if (integrationId) {
      query = query.eq('integration_id', integrationId);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query.order('display_name');

    if (error) {
      console.error('Erro ao buscar integrações:', error);
      return NextResponse.json({ error: 'Erro ao buscar integrações' }, { status: 500 });
    }

    // Formatar resposta
    const integrations = data.map(integration => ({
      id: integration.integration_id,
      name: integration.display_name,
      category: integration.category,
      status: integration.status,
      connected: integration.status === 'connected',
      lastSync: integration.last_sync,
      error: integration.error_message,
      config: integration.config
    }));

    // Estatísticas
    const stats = {
      total: integrations.length,
      connected: integrations.filter(i => i.connected).length,
      disconnected: integrations.filter(i => !i.connected).length,
      error: integrations.filter(i => i.status === 'error').length
    };

    return NextResponse.json({
      success: true,
      integrations,
      stats
    });

  } catch (error: any) {
    console.error('Erro ao buscar status:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    }, { status: 500 });
  }
}

// Endpoint para verificar saúde de uma integração específica
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { integrationId } = await request.json();

    if (!integrationId) {
      return NextResponse.json({ error: 'ID da integração é obrigatório' }, { status: 400 });
    }

    // Buscar configuração
    const { data: config, error } = await supabase
      .from('integration_configs')
      .select('*')
      .eq('integration_id', integrationId)
      .single();

    if (error || !config) {
      return NextResponse.json({ error: 'Integração não encontrada' }, { status: 404 });
    }

    if (config.status !== 'connected') {
      return NextResponse.json({
        success: true,
        healthy: false,
        reason: 'Integração não está conectada'
      });
    }

    // Verificar saúde baseado no tipo
    const healthCheck = await checkIntegrationHealth(integrationId, config);

    // Atualizar status se necessário
    if (!healthCheck.healthy && config.status === 'connected') {
      await supabase
        .from('integration_configs')
        .update({
          status: 'error',
          error_message: healthCheck.error
        })
        .eq('integration_id', integrationId);
    }

    // Registrar log
    await supabase.from('integration_logs').insert({
      integration_id: integrationId,
      action: 'health_check',
      status: healthCheck.healthy ? 'success' : 'error',
      error_message: healthCheck.error,
      duration_ms: healthCheck.responseTime
    });

    return NextResponse.json({
      success: true,
      ...healthCheck
    });

  } catch (error: any) {
    console.error('Erro no health check:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    }, { status: 500 });
  }
}

// Função para verificar saúde de cada integração
async function checkIntegrationHealth(
  integrationId: string, 
  config: any
): Promise<{ healthy: boolean; error?: string; responseTime?: number }> {
  const startTime = Date.now();

  try {
    switch (integrationId) {
      case 'openai':
        if (!config.api_key) return { healthy: false, error: 'API Key não configurada' };
        const openaiResponse = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${config.api_key}` }
        });
        return { 
          healthy: openaiResponse.ok, 
          error: openaiResponse.ok ? undefined : 'Falha na autenticação',
          responseTime: Date.now() - startTime
        };

      case 'stripe':
        if (!config.api_key) return { healthy: false, error: 'Secret Key não configurada' };
        const stripeResponse = await fetch('https://api.stripe.com/v1/balance', {
          headers: { 'Authorization': `Bearer ${config.api_key}` }
        });
        return { 
          healthy: stripeResponse.ok,
          error: stripeResponse.ok ? undefined : 'Falha na autenticação',
          responseTime: Date.now() - startTime
        };

      case 'sendgrid':
        if (!config.api_key) return { healthy: false, error: 'API Key não configurada' };
        // SendGrid não tem endpoint de health check simples, assumir OK se tem key
        return { healthy: true, responseTime: Date.now() - startTime };

      default:
        // Para outras integrações, verificar se tem credenciais
        const hasCredentials = config.api_key || config.access_token;
        return { 
          healthy: hasCredentials,
          error: hasCredentials ? undefined : 'Credenciais não configuradas',
          responseTime: Date.now() - startTime
        };
    }
  } catch (error: any) {
    return { 
      healthy: false, 
      error: error.message,
      responseTime: Date.now() - startTime
    };
  }
}




