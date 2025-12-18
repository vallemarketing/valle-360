import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

interface ConnectRequest {
  integrationId: string;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  webhookSecret?: string;
  config?: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body: ConnectRequest = await request.json();
    const { integrationId, apiKey, apiSecret, accessToken, refreshToken, webhookSecret, config } = body;

    if (!integrationId) {
      return NextResponse.json({ error: 'ID da integração é obrigatório' }, { status: 400 });
    }

    // Validar credenciais baseado no tipo de integração
    const validationResult = await validateCredentials(integrationId, { apiKey, apiSecret, accessToken });
    
    if (!validationResult.valid) {
      // Registrar log de erro
      await supabase.from('integration_logs').insert({
        integration_id: integrationId,
        action: 'connect',
        status: 'error',
        error_message: validationResult.error,
        request_data: { hasApiKey: !!apiKey, hasAccessToken: !!accessToken }
      });

      return NextResponse.json({ 
        error: validationResult.error,
        details: validationResult.details 
      }, { status: 400 });
    }

    // Atualizar configuração da integração
    const { data, error } = await supabase
      .from('integration_configs')
      .upsert({
        integration_id: integrationId,
        api_key: apiKey,
        api_secret: apiSecret,
        access_token: accessToken,
        refresh_token: refreshToken,
        webhook_secret: webhookSecret,
        config: config || {},
        status: 'connected',
        last_sync: new Date().toISOString(),
        error_message: null
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar integração:', error);
      return NextResponse.json({ error: 'Erro ao salvar configuração' }, { status: 500 });
    }

    // Registrar log de sucesso
    await supabase.from('integration_logs').insert({
      integration_id: integrationId,
      action: 'connect',
      status: 'success',
      response_data: { connected: true }
    });

    return NextResponse.json({
      success: true,
      message: `${data.display_name} conectado com sucesso`,
      integration: {
        id: data.integration_id,
        name: data.display_name,
        status: data.status,
        lastSync: data.last_sync
      }
    });

  } catch (error: any) {
    console.error('Erro na conexão:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    }, { status: 500 });
  }
}

// Função para validar credenciais
async function validateCredentials(
  integrationId: string, 
  credentials: { apiKey?: string; apiSecret?: string; accessToken?: string }
): Promise<{ valid: boolean; error?: string; details?: string }> {
  
  const { apiKey, apiSecret, accessToken } = credentials;

  switch (integrationId) {
    case 'openai':
      if (!apiKey || !apiKey.startsWith('sk-')) {
        return { valid: false, error: 'API Key inválida', details: 'A API Key da OpenAI deve começar com "sk-"' };
      }
      // Testar conexão com OpenAI
      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        if (!response.ok) {
          return { valid: false, error: 'API Key inválida ou sem permissões' };
        }
      } catch {
        return { valid: false, error: 'Não foi possível validar a API Key' };
      }
      break;

    case 'openrouter':
      if (!apiKey || apiKey.length < 10) {
        return { valid: false, error: 'API Key inválida', details: 'Informe a API Key do OpenRouter' };
      }
      // Opcional: validar chamando modelos (não bloquear se falhar por CORS/rede)
      try {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        if (!response.ok) {
          return { valid: false, error: 'API Key inválida ou sem permissões' };
        }
      } catch {
        // não bloquear validação se rede falhar
      }
      break;

    case 'anthropic':
      if (!apiKey || apiKey.length < 10) {
        return { valid: false, error: 'API Key inválida', details: 'Informe a API Key da Anthropic (Claude)' };
      }
      break;

    case 'gemini':
      if (!apiKey || apiKey.length < 10) {
        return { valid: false, error: 'API Key inválida', details: 'Informe a API Key do Google Gemini/Cloud' };
      }
      break;

    case 'stripe':
      if (!apiKey || (!apiKey.startsWith('sk_live_') && !apiKey.startsWith('sk_test_'))) {
        return { valid: false, error: 'Secret Key inválida', details: 'A Secret Key do Stripe deve começar com "sk_live_" ou "sk_test_"' };
      }
      // Testar conexão com Stripe
      try {
        const response = await fetch('https://api.stripe.com/v1/balance', {
          headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        if (!response.ok) {
          return { valid: false, error: 'Secret Key inválida ou sem permissões' };
        }
      } catch {
        return { valid: false, error: 'Não foi possível validar a Secret Key' };
      }
      break;

    case 'sendgrid':
      if (!apiKey || !apiKey.startsWith('SG.')) {
        return { valid: false, error: 'API Key inválida', details: 'A API Key do SendGrid deve começar com "SG."' };
      }
      break;

    case 'whatsapp':
      if (!accessToken) {
        return { valid: false, error: 'Access Token é obrigatório' };
      }
      break;

    case 'meta_ads':
    case 'instagram':
      if (!accessToken) {
        return { valid: false, error: 'Access Token é obrigatório para Meta/Instagram' };
      }
      break;

    case 'google_ads':
    case 'google_calendar':
    case 'google_meet':
      if (!accessToken) {
        return { valid: false, error: 'Access Token é obrigatório para serviços Google' };
      }
      break;

    case 'slack':
      if (!accessToken) {
        return { valid: false, error: 'Bot Token é obrigatório' };
      }
      break;

    default:
      // Para outras integrações, aceitar qualquer credencial
      if (!apiKey && !accessToken) {
        return { valid: false, error: 'API Key ou Access Token é obrigatório' };
      }
  }

  return { valid: true };
}






