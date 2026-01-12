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
      sendgrid: !!process.env.SENDGRID_API_KEY,
      resend: !!process.env.RESEND_API_KEY,
      gmail: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_REFRESH_TOKEN),
      smtp: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
    };

    console.log('📋 Configurações disponíveis:', configs);

    // Enviar email de teste
    const result = await sendEmailWithFallback({
      to: emailDestino,
      subject: '🧪 Teste de Email - Valle 360',
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="font-family: sans-serif; padding: 40px; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1672d6 0%, #001533 100%); padding: 30px; border-radius: 12px; text-align: center;">
            <h1 style="color: white; margin: 0;">✅ Teste de Email</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Valle 360</p>
          </div>
          
          <div style="padding: 30px;">
            <p>Este é um email de teste enviado pelo sistema Valle 360.</p>
            <p>Se você está vendo este email, significa que o envio está funcionando! 🎉</p>
            
            <div style="background: #f0f9ff; border-left: 4px solid #1672d6; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <strong>📊 Informações do Teste:</strong><br>
              Data: ${new Date().toLocaleString('pt-BR')}<br>
              Destino: ${emailDestino}
            </div>
            
            <p style="color: #666; font-size: 12px;">
              Valle 360 - Sistema de Marketing Inteligente
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log(`\n📊 Resultado: ${result.success ? '✅ SUCESSO' : '❌ FALHA'}`);
    if (result.provider) console.log(`📧 Provedor: ${result.provider}`);
    console.log(`💬 Mensagem: ${result.message}\n`);

    return NextResponse.json({
      success: result.success,
      message: result.message,
      provider: result.provider,
      fallbackMode: result.fallbackMode,
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
      sendgrid: {
        configured: !!process.env.SENDGRID_API_KEY,
        fromEmail: process.env.SENDGRID_FROM_EMAIL || 'não configurado',
      },
      resend: {
        configured: !!process.env.RESEND_API_KEY,
        fromEmail: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev (padrão)',
      },
      gmail: {
        configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_REFRESH_TOKEN),
        user: process.env.GMAIL_USER || 'não configurado',
        hasRefreshToken: !!process.env.GOOGLE_REFRESH_TOKEN,
      },
      smtp: {
        configured: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
        host: process.env.SMTP_HOST || 'não configurado',
        user: process.env.SMTP_USER || 'não configurado',
        port: process.env.SMTP_PORT || '587',
      },
      cpanel: {
        configured: !!(process.env.CPANEL_USER && process.env.CPANEL_DOMAIN),
        domain: process.env.CPANEL_DOMAIN || 'não configurado',
      },
    };

    const activeProviders = Object.entries(configs)
      .filter(([key, value]) => key !== 'cpanel' && (value as any).configured)
      .map(([key]) => key);

    return NextResponse.json({
      success: true,
      activeProviders,
      configs,
      fallbackOrder: ['sendgrid', 'resend', 'gmail', 'smtp', 'manual'],
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
