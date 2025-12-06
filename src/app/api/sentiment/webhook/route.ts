/**
 * Valle 360 - Webhook de Análise de Sentimento
 * Para integração com N8N e outros sistemas externos
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzeAndStore, queueForAnalysis, SentimentSourceType } from '@/lib/ai/sentiment-automation';

export const dynamic = 'force-dynamic';

// Verificar API Key
function verifyApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key') || 
                 request.headers.get('authorization')?.replace('Bearer ', '');
  
  // Verificar contra chaves configuradas
  const validKeys = [
    process.env.SENTIMENT_WEBHOOK_KEY,
    process.env.N8N_WEBHOOK_KEY,
    process.env.INTERNAL_API_KEY
  ].filter(Boolean);

  // Em desenvolvimento, aceitar qualquer key
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  return validKeys.some(key => key === apiKey);
}

// POST - Receber webhook
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    if (!verifyApiKey(request)) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'API Key inválida ou não fornecida'
      }, { status: 401 });
    }

    const body = await request.json();
    const {
      event, // 'new_message', 'new_nps', 'new_feedback', 'new_review', 'new_comment'
      data
    } = body;

    if (!event || !data) {
      return NextResponse.json({
        error: 'Bad Request',
        message: 'event e data são obrigatórios'
      }, { status: 400 });
    }

    let sourceType: SentimentSourceType;
    let content: string;
    let sourceId: string;
    let priority = 5;

    // Mapear evento para tipo de fonte
    switch (event) {
      case 'new_message':
        sourceType = 'message';
        content = data.content || data.text || data.message;
        sourceId = data.message_id || data.id;
        priority = 5;
        break;

      case 'new_nps':
      case 'nps_response':
        sourceType = 'nps_response';
        content = data.feedback || data.comment || data.text;
        sourceId = data.response_id || data.id;
        // NPS detractor (0-6) tem prioridade alta
        priority = data.score <= 6 ? 10 : data.score <= 8 ? 5 : 1;
        break;

      case 'new_feedback':
        sourceType = 'feedback';
        content = data.content || data.text || data.feedback;
        sourceId = data.feedback_id || data.id;
        priority = 7;
        break;

      case 'new_review':
        sourceType = 'review';
        content = data.content || data.text || data.review;
        sourceId = data.review_id || data.id;
        // Reviews negativos têm prioridade alta
        priority = data.rating <= 2 ? 10 : data.rating <= 3 ? 5 : 1;
        break;

      case 'new_comment':
      case 'task_comment':
        sourceType = 'task_comment';
        content = data.content || data.text || data.comment;
        sourceId = data.comment_id || data.id;
        priority = 3;
        break;

      case 'support_ticket':
        sourceType = 'support_ticket';
        content = data.description || data.content || data.text;
        sourceId = data.ticket_id || data.id;
        priority = 8;
        break;

      case 'email':
        sourceType = 'email';
        content = data.body || data.content || data.text;
        sourceId = data.email_id || data.id;
        priority = 4;
        break;

      default:
        return NextResponse.json({
          error: 'Bad Request',
          message: `Evento não suportado: ${event}`
        }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({
        error: 'Bad Request',
        message: 'Conteúdo não encontrado nos dados'
      }, { status: 400 });
    }

    // Processar imediatamente ou adicionar à fila
    const immediate = data.immediate === true || data.sync === true;

    if (immediate) {
      // Processar imediatamente
      const result = await analyzeAndStore(
        sourceType,
        sourceId,
        content,
        {
          clientId: data.client_id,
          userId: data.user_id,
          sourceTable: data.source_table,
          provider: data.provider
        }
      );

      return NextResponse.json({
        success: true,
        processed: true,
        result: result ? {
          id: result.id,
          overall_sentiment: result.overall_sentiment,
          score: result.score,
          alert_generated: result.alert_generated
        } : null
      });
    } else {
      // Adicionar à fila
      const queueId = await queueForAnalysis(
        sourceType,
        sourceId,
        content,
        {
          clientId: data.client_id,
          userId: data.user_id,
          sourceTable: data.source_table,
          priority,
          metadata: {
            event,
            ...data
          }
        }
      );

      return NextResponse.json({
        success: true,
        queued: true,
        queue_id: queueId
      });
    }

  } catch (error: any) {
    console.error('Erro no webhook de sentimento:', error);
    return NextResponse.json({
      error: 'Internal Server Error',
      message: error.message
    }, { status: 500 });
  }
}

// GET - Verificar status do webhook
export async function GET(request: NextRequest) {
  // Verificar autenticação
  if (!verifyApiKey(request)) {
    return NextResponse.json({ 
      error: 'Unauthorized'
    }, { status: 401 });
  }

  return NextResponse.json({
    status: 'healthy',
    version: '1.0.0',
    supported_events: [
      'new_message',
      'new_nps',
      'nps_response',
      'new_feedback',
      'new_review',
      'new_comment',
      'task_comment',
      'support_ticket',
      'email'
    ],
    documentation: '/admin/integracoes/api/docs'
  });
}

