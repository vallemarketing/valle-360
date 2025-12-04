import { NextRequest, NextResponse } from 'next/server';
import { runAutoCollection } from '@/lib/ai/collectionBot';

export const dynamic = 'force-dynamic';

// Esta rota deve ser chamada por um cron job (ex: Vercel Cron)
// Configurar em vercel.json:
// {
//   "crons": [{
//     "path": "/api/cron/collection",
//     "schedule": "0 9,14,18 * * *"
//   }]
// }

export async function GET(request: NextRequest) {
  try {
    // Verificar se é uma chamada do cron (Vercel)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Em produção, verificar autenticação
    if (process.env.NODE_ENV === 'production' && cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    console.log('Iniciando cobrança automática...');
    
    const result = await runAutoCollection();
    
    console.log(`Cobrança finalizada: ${result.sent} enviadas, ${result.failed} falhas`);

    return NextResponse.json({
      success: true,
      message: 'Cobrança automática executada',
      result
    });

  } catch (error) {
    console.error('Erro na cobrança automática:', error);
    return NextResponse.json(
      { error: 'Erro interno ao executar cobrança' },
      { status: 500 }
    );
  }
}

// POST para executar manualmente (admin)
export async function POST(request: NextRequest) {
  try {
    // TODO: Verificar se é admin
    
    const result = await runAutoCollection();

    return NextResponse.json({
      success: true,
      message: 'Cobrança manual executada',
      result
    });

  } catch (error) {
    console.error('Erro na cobrança manual:', error);
    return NextResponse.json(
      { error: 'Erro interno ao executar cobrança' },
      { status: 500 }
    );
  }
}









