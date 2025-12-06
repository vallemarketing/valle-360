/**
 * Valle 360 - API da Val (Assistente de IA)
 * Responde perguntas e executa ações usando GPT-4
 * COM PERSONAS ESPECIALIZADAS POR SETOR
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getOpenAIClient, OPENAI_MODELS } from '@/lib/integrations/openai/client';
import { getValPersona, buildValPrompt } from '@/lib/ai/val-personas';

export const dynamic = 'force-dynamic';

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

    // Buscar perfil do usuário para determinar persona
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    const userType = profileData?.user_type || 'colaborador';
    const userName = profileData?.full_name || user.email;
    const companyName = profileData?.company_name;

    // Obter persona especializada
    const persona = getValPersona(userType);

    // Buscar dados relevantes baseado no tipo de usuário
    let businessContext: any = {
      currentUser: userName,
      userRole: userType,
      currentDate: new Date().toLocaleDateString('pt-BR'),
      currentTime: new Date().toLocaleTimeString('pt-BR'),
      persona: persona.name,
      ...context
    };

    // Dados específicos por tipo de usuário
    if (['super_admin', 'admin', 'head_marketing'].includes(userType)) {
      // Buscar dados de gestão
      const [clientsData, tasksData, alertsData, financialData] = await Promise.all([
        supabase.from('user_profiles').select('id, full_name, email, company_name').eq('user_type', 'cliente').limit(20),
        supabase.from('tasks').select('*').in('status', ['pending', 'in_progress']).limit(10),
        supabase.from('sentiment_alerts').select('*').eq('status', 'pending').limit(5),
        supabase.from('contracts').select('value, status').eq('status', 'active')
      ]);

      businessContext = {
        ...businessContext,
        totalClients: clientsData.data?.length || 0,
        recentClients: clientsData.data?.slice(0, 5).map(c => c.company_name || c.full_name) || [],
        pendingTasks: tasksData.data?.length || 0,
        pendingAlerts: alertsData.data?.length || 0,
        activeContracts: financialData.data?.length || 0,
        monthlyRevenue: financialData.data?.reduce((sum, c) => sum + (c.value || 0), 0) || 0
      };
    } else if (userType === 'comercial') {
      // Buscar dados de vendas
      const [leadsData, proposalsData] = await Promise.all([
        supabase.from('leads').select('*').in('status', ['new', 'contacted', 'qualified']).limit(10),
        supabase.from('proposals').select('*').eq('status', 'pending').limit(5)
      ]);

      businessContext = {
        ...businessContext,
        activeLeads: leadsData.data?.length || 0,
        pendingProposals: proposalsData.data?.length || 0
      };
    } else if (userType === 'financeiro') {
      // Buscar dados financeiros
      const [contractsData, pendingPayments] = await Promise.all([
        supabase.from('contracts').select('*').eq('status', 'active'),
        supabase.from('contracts').select('*').eq('status', 'pending_payment')
      ]);

      businessContext = {
        ...businessContext,
        activeContracts: contractsData.data?.length || 0,
        pendingPayments: pendingPayments.data?.length || 0,
        totalPending: pendingPayments.data?.reduce((sum, c) => sum + (c.value || 0), 0) || 0
      };
    } else if (userType === 'cliente') {
      // Buscar dados do cliente
      const [tasksData, messagesData] = await Promise.all([
        supabase.from('tasks').select('*').eq('client_id', user.id).limit(10),
        supabase.from('messages').select('*').eq('receiver_id', user.id).eq('read', false).limit(5)
      ]);

      businessContext = {
        ...businessContext,
        myTasks: tasksData.data?.length || 0,
        unreadMessages: messagesData.data?.length || 0,
        companyName: companyName
      };
    } else {
      // Colaborador genérico
      const [myTasksData] = await Promise.all([
        supabase.from('tasks').select('*').eq('assigned_to', user.id).in('status', ['pending', 'in_progress']).limit(10)
      ]);

      businessContext = {
        ...businessContext,
        myPendingTasks: myTasksData.data?.length || 0
      };
    }

    // Construir prompt especializado
    const systemPrompt = buildValPrompt(userType, {
      userName,
      companyName,
      additionalContext: `Contexto do negócio:\n${JSON.stringify(businessContext, null, 2)}`
    });

    // Construir mensagens para o chat
    const messages: any[] = [
      { role: 'system', content: systemPrompt }
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
      max_tokens: 1500,
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
      parsedResponse = {
        message: content,
        suggestions: [],
        actions: [],
        mood: 'neutral'
      };
    }

    // Adicionar info da persona na resposta
    parsedResponse.persona = {
      name: persona.name,
      title: persona.title,
      emoji: persona.emoji
    };

    // Registrar interação (ignorar erro se tabela não existir)
    await supabase.from('val_interactions').insert({
      user_id: user.id,
      user_type: userType,
      message: message,
      response: parsedResponse.message,
      persona: persona.name,
      context: businessContext
    }).catch(() => {});

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

    // Buscar perfil do usuário
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('user_type, full_name')
      .eq('id', user.id)
      .single();

    const userType = profileData?.user_type || 'colaborador';
    const persona = getValPersona(userType);

    // Buscar dados para sugestões baseado no tipo
    let contextData: any = {};

    if (['super_admin', 'admin'].includes(userType)) {
      const [alertsData, tasksData, paymentsData] = await Promise.all([
        supabase.from('sentiment_alerts').select('*').eq('status', 'pending').limit(3),
        supabase.from('tasks').select('*').eq('status', 'overdue').limit(5),
        supabase.from('contracts').select('*').eq('status', 'pending_payment').limit(3)
      ]);

      contextData = {
        pendingAlerts: alertsData.data?.length || 0,
        overdueTasks: tasksData.data?.length || 0,
        pendingPayments: paymentsData.data?.length || 0
      };
    }

    const client = getOpenAIClient();

    const response = await client.chat.completions.create({
      model: OPENAI_MODELS.chat,
      messages: [
        { 
          role: 'system', 
          content: `Você é a ${persona.name}. Gere 2-3 sugestões proativas curtas e relevantes para um ${userType}.
Retorne JSON: { "suggestions": [{ "icon": "emoji", "text": "sugestão curta", "priority": "high/medium/low", "action": "ação_sugerida" }] }`
        },
        { 
          role: 'user', 
          content: JSON.stringify({
            ...contextData,
            currentTime: new Date().toLocaleTimeString('pt-BR'),
            dayOfWeek: new Date().toLocaleDateString('pt-BR', { weekday: 'long' })
          })
        }
      ],
      temperature: 0.8,
      max_tokens: 400,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    const parsed = content ? JSON.parse(content) : { suggestions: [] };

    return NextResponse.json({
      success: true,
      persona: {
        name: persona.name,
        title: persona.title,
        emoji: persona.emoji
      },
      quickActions: persona.quickActions,
      suggestions: parsed.suggestions || []
    });

  } catch (error: any) {
    console.error('Erro ao buscar sugestões:', error);
    
    // Fallback com sugestões genéricas
    return NextResponse.json({ 
      success: true,
      suggestions: [
        { icon: '👋', text: 'Olá! Como posso ajudar você hoje?', priority: 'low' }
      ]
    });
  }
}
