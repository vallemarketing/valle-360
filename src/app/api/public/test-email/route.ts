/**
 * API PÚBLICA para testar envio de email
 * REMOVER EM PRODUÇÃO!
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendEmailWithFallback } from '@/lib/email/emailService';

export const dynamic = 'force-dynamic';

const TEST_SECRET = 'valle360-test-2026';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const email = searchParams.get('email');

  if (secret !== TEST_SECRET) {
    return NextResponse.json({ error: 'Chave inválida' }, { status: 403 });
  }

  const configs = {
    mailto: {
      configured: true,
    },
  };

  const activeProviders = ['mailto'];

  // Se não passou email, retorna configurações
  if (!email) {
    return NextResponse.json({
      success: true,
      message: 'Adicione ?email=seu@email.com para enviar teste',
      configs,
      activeProviders,
      fallbackOrder: ['mailto'],
    });
  }

  // Envia email de teste
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 TESTE DE EMAIL`);
  console.log(`📧 Para: ${email}`);
  console.log(`📋 Provedores: ${activeProviders.join(', ') || 'nenhum'}`);
  console.log(`${'='.repeat(60)}\n`);

  try {
    const result = await sendEmailWithFallback({
      to: email,
      subject: '🧪 Teste Valle 360 - Email Funcionando!',
      body: [
        '✅ Email Funcionando!',
        'Parabéns! O sistema de email está funcionando.',
        '',
        `📅 ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`,
        `📧 ${email}`,
        '',
        'Valle 360',
      ].join('\n'),
    });

    return NextResponse.json({
      success: result.success,
      message: result.message,
      provider: result.provider,
      mailtoUrl: result.mailtoUrl,
      error: result.error,
      configs,
      activeProviders,
      emailDestino: email,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('❌ Erro:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      configs,
      activeProviders,
    }, { status: 500 });
  }
}
