/**
 * Valle 360 - API da Val (Assistente de IA)
 * Responde perguntas e executa ações usando GPT-4
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getOpenAIClient, OPENAI_MODELS } from '@/lib/integrations/openai/client';

export const dynamic = 'force-dynamic';

// Contexto do sistema para a Val
const VAL_SYSTEM_PROMPT = `Você é a Val, assistente de IA da Valle 360 - uma plataforma de gestão para agências de marketing digital.

Sua personalidade:
- Profissional mas amigável
- Proativa em sugerir ações
- Conhecedora profunda de marketing digital, gestão de agências e negócios
- Sempre oferece soluções práticas
- Usa emojis ocasionalmente para ser mais acolhedora

Suas capacidades:
- Responder perguntas sobre o negócio, clientes, finanças, equipe
- Sugerir ações baseadas em dados
- Ajudar com estratégias de marketing
- Gerar insights e recomendações
- Auxiliar em tarefas do dia-a-dia

Contexto do Sistema Valle 360:
- Gerencia clientes de agências de marketing
- Acompanha tarefas, projetos e equipes
- Monitora finanças e contratos
- Analisa sentimento e NPS
- Integra com diversas ferramentas (Meta Ads, Google Ads, N8N, etc)

Ao responder:
1. Seja concisa mas completa
2. Se tiver dados disponíveis, use-os na resposta
3. Sempre sugira próximos passos quando relevante
4. Se não souber algo, seja honesta
5. Ofereça executar ações quando possível

Formato de resposta - SEMPRE retorne JSON:
{
  "message": "Sua resposta aqui",
  "suggestions": ["Sugestão 1", "Sugestão 2"],
  "actions": [
    {
      "label": "Texto do botão",
      "action": "tipo_acao",
      "params": {}
    }
  ],
  "data": {} // Dados relevantes se houver
}`;

// POST - Conversar com a Val
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
    const { message, context, history } = body;

    if (!message) {
      return NextResponse.json({ error: 'Mensagem é obrigatória' }, { status: 400 });
    }

    // Buscar dados relevantes para contexto
    const [profileData, clientsData, tasksData, alertsData] = await Promise.all([
      supabase.from('user_profiles').select('*').eq('id', user.id).single(),
      supabase.from('user_profiles').select('id, full_name, email').eq('user_type', 'cliente').limit(10),
      supabase.from('tasks').select('*').eq('status', 'pending').limit(5),
      supabase.from('sentiment_alerts').select('*').eq('status', 'pending').limit(5)
    ]);

    const businessContext = {
      currentUser: profileData.data?.full_name || user.email,
      userRole: profileData.data?.user_type || 'unknown',
      recentClients: clientsData.data?.map(c => c.full_name) || [],
      pendingTasks: tasksData.data?.length || 0,
      pendingAlerts: alertsData.data?.length || 0,
      currentDate: new Date().toLocaleDateString('pt-BR'),
      currentTime: new Date().toLocaleTimeString('pt-BR'),
      ...context
    };

    // Construir mensagens para o chat
    const messages: any[] = [
      { role: 'system', content: VAL_SYSTEM_PROMPT },
      { 
        role: 'system', 
        content: `Contexto atual do negócio:\n${JSON.stringify(businessContext, null, 2)}`
      }
    ];

    // Adicionar histórico se houver
    if (history && Array.isArray(history)) {
      history.slice(-10).forEach((msg: any) => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
        });
      });
    }

    // Adicionar mensagem atual
    messages.push({ role: 'user', content: message });

    const client = getOpenAIClient();

    const response = await client.chat.completions.create({
      model: OPENAI_MODELS.chat,
      messages,
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Resposta vazia da IA');
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content);
    } catch {
      // Se não for JSON válido, criar estrutura padrão
      parsedResponse = {
        message: content,
        suggestions: [],
        actions: []
      };
    }

    // Registrar interação
    await supabase.from('val_interactions').insert({
      user_id: user.id,
      message: message,
      response: parsedResponse.message,
      context: businessContext
    }).catch(() => {}); // Ignorar erro se tabela não existir

    return NextResponse.json({
      success: true,
      response: parsedResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Erro na API da Val:', error);
    return NextResponse.json({ 
      error: 'Erro ao processar mensagem',
      details: error.message 
    }, { status: 500 });
  }
}

// GET - Obter sugestões proativas da Val
export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar dados para análise
    const [alertsData, tasksData, paymentsData] = await Promise.all([
      supabase.from('sentiment_alerts').select('*').eq('status', 'pending').limit(3),
      supabase.from('tasks').select('*').eq('status', 'pending').order('due_date').limit(5),
      supabase.from('contracts').select('*').eq('status', 'pending_payment').limit(3)
    ]);

    const client = getOpenAIClient();

    const response = await client.chat.completions.create({
      model: OPENAI_MODELS.chat,
      messages: [
        { 
          role: 'system', 
          content: `Você é a Val. Gere 2-3 sugestões proativas curtas baseadas nos dados.
Retorne JSON: { "suggestions": [{ "icon": "emoji", "text": "sugestão curta", "priority": "high/medium/low" }] }`
        },
        { 
          role: 'user', 
          content: JSON.stringify({
            pendingAlerts: alertsData.data?.length || 0,
            pendingTasks: tasksData.data?.length || 0,
            pendingPayments: paymentsData.data?.length || 0,
            currentTime: new Date().toLocaleTimeString('pt-BR')
          })
        }
      ],
      temperature: 0.8,
      max_tokens: 300,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    const parsed = content ? JSON.parse(content) : { suggestions: [] };

    return NextResponse.json({
      success: true,
      suggestions: parsed.suggestions || []
    });

  } catch (error: any) {
    console.error('Erro ao buscar sugestões:', error);
    return NextResponse.json({ 
      suggestions: [
        { icon: '👋', text: 'Olá! Como posso ajudar você hoje?', priority: 'low' }
      ]
    });
  }
}

