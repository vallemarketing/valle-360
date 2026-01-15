/**
 * API para testar envio de email
 * Testa todos os provedores configurados
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { sendEmailWithFallback } from '@/lib/email/emailService';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Verificar autenticação
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se é admin
    const { data: isAdmin } = await supabase.rpc('is_admin');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const { emailDestino } = await request.json();

    if (!emailDestino) {
      return NextResponse.json({ 
        error: 'emailDestino é obrigatório' 
      }, { status: 400 });
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 TESTE DE ENVIO DE EMAIL`);
    console.log(`📧 Destino: ${emailDestino}`);
    console.log(`${'='.repeat(60)}\n`);

    // Verificar configurações
    const configs = {
      mailto: true,
    };

    console.log('📋 Configurações disponíveis:', configs);

    // Enviar email de teste
    const result = await sendEmailWithFallback({
      to: emailDestino,
      subject: '🧪 Teste de Email - Valle 360',
      body: [
        '✅ Teste de Email',
        '',
        'Este é um email de teste do sistema Valle 360.',
        'Se você está vendo este email, o mailto abriu corretamente.',
        '',
        `Data: ${new Date().toLocaleString('pt-BR')}`,
        `Destino: ${emailDestino}`,
        '',
        'Valle 360 - Sistema de Marketing Inteligente',
      ].join('\n'),
    });

    console.log(`\n📊 Resultado: ${result.success ? '✅ SUCESSO' : '❌ FALHA'}`);
    if (result.provider) console.log(`📧 Provedor: ${result.provider}`);
    console.log(`💬 Mensagem: ${result.message}\n`);

    return NextResponse.json({
      success: result.success,
      message: result.message,
      provider: result.provider,
      mailtoUrl: result.mailtoUrl,
      configs,
      emailDestino,
    });

  } catch (error: any) {
    console.error('❌ Erro no teste de email:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

// GET - Retorna status das configurações
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Verificar autenticação
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { data: isAdmin } = await supabase.rpc('is_admin');
    if (!isAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const configs = {
      mailto: {
        configured: true,
      },
    };

    const activeProviders = ['mailto'];

    return NextResponse.json({
      success: true,
      activeProviders,
      configs,
      fallbackOrder: ['mailto'],
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
