/**
 * API PÚBLICA para testar envio de email
 * ATENÇÃO: Remover após testar!
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendEmailWithFallback } from '@/lib/email/emailService';

export const dynamic = 'force-dynamic';

// Chave secreta simples para proteção básica
const TEST_SECRET = 'valle360-test-2026';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const email = searchParams.get('email');

  if (secret !== TEST_SECRET) {
    return NextResponse.json({ error: 'Chave inválida' }, { status: 403 });
  }

  // Se não passou email, retorna apenas configurações
  const configs = {
    sendgrid: {
      configured: !!process.env.SENDGRID_API_KEY,
      keyPrefix: process.env.SENDGRID_API_KEY?.substring(0, 10) + '...' || 'não configurado',
    },
    resend: {
      configured: !!process.env.RESEND_API_KEY,
      keyPrefix: process.env.RESEND_API_KEY?.substring(0, 10) + '...' || 'não configurado',
    },
    gmail: {
      configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_REFRESH_TOKEN),
      user: process.env.GMAIL_USER || 'não configurado',
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasRefreshToken: !!process.env.GOOGLE_REFRESH_TOKEN,
    },
    smtp: {
      configured: !!(process.env.SMTP_HOST && process.env.SMTP_USER),
      host: process.env.SMTP_HOST || 'não configurado',
      user: process.env.SMTP_USER || 'não configurado',
      port: process.env.SMTP_PORT || '587',
    },
  };

  const activeProviders = Object.entries(configs)
    .filter(([key, value]) => (value as any).configured)
    .map(([key]) => key);

  // Se passou email, tenta enviar
  if (email) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 TESTE PÚBLICO DE EMAIL`);
    console.log(`📧 Destino: ${email}`);
    console.log(`📋 Provedores ativos: ${activeProviders.join(', ') || 'nenhum'}`);
    console.log(`${'='.repeat(60)}\n`);

    try {
      // Testar cada provedor individualmente para diagnóstico
      const diagnostics: any = {};
      
      // Teste SendGrid
      try {
        const sgKey = process.env.SENDGRID_API_KEY?.substring(0, 15) + '...';
        const sgFrom = process.env.SENDGRID_FROM_EMAIL || 'não definido';
        const sgResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email }] }],
            from: { email: sgFrom || 'noreply@valle360.com.br', name: 'Valle 360 Teste' },
            subject: 'Teste SendGrid',
            content: [{ type: 'text/html', value: '<p>Teste</p>' }],
          }),
        });
        const sgText = await sgResponse.text();
        diagnostics.sendgrid = {
          status: sgResponse.status,
          ok: sgResponse.ok,
          fromEmail: sgFrom,
          response: sgText.substring(0, 200),
        };
      } catch (e: any) {
        diagnostics.sendgrid = { error: e.message };
      }
      
      // Teste Resend
      try {
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Valle 360 <onboarding@resend.dev>',
            to: [email],
            subject: 'Teste Resend',
            html: '<p>Teste via Resend</p>',
          }),
        });
        const resendData = await resendResponse.json();
        diagnostics.resend = {
          status: resendResponse.status,
          ok: resendResponse.ok,
          data: resendData,
        };
      } catch (e: any) {
        diagnostics.resend = { error: e.message };
      }

      // Se algum funcionou, retorna sucesso
      if (diagnostics.sendgrid?.ok || diagnostics.resend?.ok) {
        return NextResponse.json({
          success: true,
          message: diagnostics.sendgrid?.ok ? 'Email enviado via SendGrid!' : 'Email enviado via Resend!',
          provider: diagnostics.sendgrid?.ok ? 'sendgrid' : 'resend',
          diagnostics,
          emailDestino: email,
        });
      }

      const result = await sendEmailWithFallback({
        to: email,
        subject: '🧪 Teste Valle 360 - Email Funcionando!',
        html: `
          <!DOCTYPE html>
          <html>
          <head><meta charset="UTF-8"></head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; background: #f5f5f5;">
            <div style="background: linear-gradient(135deg, #1672d6 0%, #001533 100%); padding: 40px; border-radius: 16px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">✅ Email Funcionando!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 15px 0 0 0; font-size: 16px;">Valle 360 Platform</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 12px; margin-top: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <p style="margin: 0 0 15px 0; color: #333;">Parabéns! O sistema de email está funcionando corretamente. 🎉</p>
              
              <div style="background: #e8f4fd; border-left: 4px solid #1672d6; padding: 15px; margin: 20px 0; border-radius: 4px;">
                <strong style="color: #1672d6;">📊 Detalhes do Teste:</strong><br>
                <span style="color: #555;">
                  📅 Data: ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}<br>
                  📧 Destino: ${email}
                </span>
              </div>
              
              <p style="color: #888; font-size: 13px; margin: 20px 0 0 0; padding-top: 15px; border-top: 1px solid #eee;">
                Valle 360 - Sistema de Marketing Inteligente
              </p>
            </div>
          </body>
          </html>
        `,
      });

      console.log(`\n📊 Resultado: ${result.success ? '✅ SUCESSO' : '❌ FALHA'}`);
      if (result.provider) console.log(`📧 Provedor usado: ${result.provider}`);
      console.log(`💬 Mensagem: ${result.message}\n`);

      return NextResponse.json({
        success: result.success,
        message: result.message,
        provider: result.provider,
        fallbackMode: result.fallbackMode,
        diagnostics,
        configs,
        activeProviders,
        emailDestino: email,
        timestamp: new Date().toISOString(),
      });

    } catch (error: any) {
      console.error('❌ Erro ao enviar email:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        configs,
        activeProviders,
      }, { status: 500 });
    }
  }

  // Retorna apenas configurações
  return NextResponse.json({
    success: true,
    message: 'Adicione ?email=seu@email.com para enviar teste',
    configs,
    activeProviders,
    fallbackOrder: ['sendgrid', 'resend', 'gmail', 'smtp', 'manual'],
  });
}
