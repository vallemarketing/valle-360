/**
 * Valle 360 - API da Val (Assistente de IA)
 * Responde perguntas e executa ações usando GPT-4
 * COM PERSONAS ESPECIALIZADAS POR SETOR
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { generateWithAI } from '@/lib/ai/aiRouter';
import { getValPersona, buildValPrompt } from '@/lib/ai/val-personas';

export const dynamic = 'force-dynamic';

function normalizeText(input: string) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function inferPersonaFromEmployee(params: { department?: string | null; areas?: string[] | null }) {
  const dept = params.department ? normalizeText(params.department) : '';
  const areas = Array.isArray(params.areas) ? params.areas.map((a) => normalizeText(String(a))) : [];
  const raw = [dept, ...areas].filter(Boolean).join(' ');

  if (raw.includes('comercial') || raw.includes('vendas')) return 'comercial';
  if (raw.includes('financeiro') || raw.includes('finance') || raw.includes('cobranca') || raw.includes('cobran')) return 'financeiro';
  if (raw.includes('rh') || raw.includes('people') || raw.includes('pessoas')) return 'rh';
  if (raw.includes('juridico') || raw.includes('compliance')) return 'juridico';
  if (raw.includes('contratos') || raw.includes('contract')) return 'contratos';
  if (raw.includes('operacao') || raw.includes('operacional') || raw.includes('ops')) return 'operacao';
  if (raw.includes('notificacao') || raw.includes('alert')) return 'notificacoes';
  if (raw.includes('trafego') || raw.includes('ads') || raw.includes('midia') || raw.includes('mídia')) return 'trafego';
  if (raw.includes('social')) return 'social_media';
  if (raw.includes('video') || raw.includes('vídeo')) return 'video_maker';
  if (raw.includes('web')) return 'web_designer';
  if (raw.includes('design')) return 'designer';

  return 'colaborador';
}

function inferTaskFromPersona(personaKey: string) {
  const p = String(personaKey || '').toLowerCase();
  if (p === 'comercial') return 'sales';
  if (p === 'rh') return 'hr';
  if (p === 'financeiro') return 'analysis';
  if (p === 'trafego') return 'analysis';
  if (p === 'social_media') return 'copywriting';
  if (p === 'notificacoes' || p === 'operacao') return 'analysis';
  if (p === 'super_admin' || p === 'admin') return 'strategy';
  return 'general';
}

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
      .or(`id.eq.${user.id},user_id.eq.${user.id}`)
      .maybeSingle();

    // user_type do banco tende a ser enum (super_admin/admin/hr/finance/manager/employee/client).
    const rawUserType = (profileData?.user_type || 'employee') as string;
    const userName = profileData?.full_name || user.email;
    const companyName = profileData?.company_name;

    // Inferir persona por área do colaborador (department/areas) quando aplicável
    let personaKey: string = rawUserType;
    if (rawUserType === 'finance') personaKey = 'financeiro';
    if (rawUserType === 'hr') personaKey = 'rh';
    if (rawUserType === 'client') personaKey = 'cliente';
    if (rawUserType === 'employee' || rawUserType === 'manager') {
      const { data: emp } = await supabase
        .from('employees')
        .select('department, areas')
        .eq('user_id', user.id)
        .maybeSingle();
      personaKey = inferPersonaFromEmployee({
        department: (emp as any)?.department,
        areas: (emp as any)?.areas,
      });
    }

    // Obter persona especializada
    const persona = getValPersona(personaKey);

    // Buscar dados relevantes baseado no tipo de usuário
    let businessContext: any = {
      currentUser: userName,
      userRole: personaKey,
      currentDate: new Date().toLocaleDateString('pt-BR'),
      currentTime: new Date().toLocaleTimeString('pt-BR'),
      persona: persona.name,
      ...context
    };

    // Dados específicos por tipo de usuário
    if (['super_admin', 'admin'].includes(personaKey)) {
      // Buscar dados de gestão
      const [clientsData, tasksData, alertsData, financialData] = await Promise.all([
        supabase.from('clients').select('id, company_name, contact_email').limit(20),
        supabase.from('tasks').select('*').in('status', ['pending', 'in_progress']).limit(10),
        supabase.from('sentiment_alerts').select('*').eq('status', 'pending').limit(5),
        supabase.from('contracts').select('monthly_value, status').eq('status', 'active')
      ]);

      businessContext = {
        ...businessContext,
        totalClients: clientsData.data?.length || 0,
        recentClients: clientsData.data?.slice(0, 5).map((c: any) => c.company_name || c.contact_email) || [],
        pendingTasks: tasksData.data?.length || 0,
        pendingAlerts: alertsData.data?.length || 0,
        activeContracts: financialData.data?.length || 0,
        monthlyRevenue: financialData.data?.reduce((sum: number, c: any) => sum + (c.monthly_value || 0), 0) || 0
      };
    } else if (personaKey === 'comercial') {
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
    } else if (personaKey === 'financeiro') {
      // Buscar dados financeiros
      const [contractsData, pendingPayments] = await Promise.all([
        supabase.from('contracts').select('*').eq('status', 'active'),
        supabase.from('contracts').select('*').eq('status', 'pending_payment')
      ]);

      businessContext = {
        ...businessContext,
        activeContracts: contractsData.data?.length || 0,
        pendingPayments: pendingPayments.data?.length || 0,
        totalPending: pendingPayments.data?.reduce((sum: number, c: any) => sum + (c.monthly_value || 0), 0) || 0
      };
    } else if (personaKey === 'cliente') {
      // Buscar dados do cliente
      const { data: clientRow } = await supabase.from('clients').select('id').eq('user_id', user.id).maybeSingle();
      const clientId = (clientRow as any)?.id as string | undefined;

      const [tasksData, messagesData] = await Promise.all([
        clientId ? supabase.from('kanban_tasks').select('*').eq('client_id', clientId).limit(10) : supabase.from('kanban_tasks').select('*').limit(0),
        supabase.from('messages').select('*').eq('recipient_id', user.id).eq('is_read', false).limit(5)
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
    const systemPrompt = buildValPrompt(personaKey, {
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

    let parsedResponse;
    try {
      const result = await generateWithAI({
        task: inferTaskFromPersona(personaKey) as any,
        json: true,
        temperature: 0.7,
        maxTokens: 1500,
        actorUserId: user.id,
        entityType: 'val',
        entityId: null,
        messages
      });
      parsedResponse = result.json;
    } catch (e: any) {
      const msg = String(e?.message || '');
      const missingAiKey =
        msg.includes('OPENROUTER_API_KEY') ||
        msg.includes('OPENAI_API_KEY') ||
        msg.includes('não configurada') ||
        msg.includes('nao configurada') ||
        msg.includes('não configurado') ||
        msg.includes('nao configurado');

      if (missingAiKey) {
        parsedResponse = {
          message:
            'A IA ainda não está conectada neste ambiente. Para ativar agora, vá em **Admin → Integrações** e conecte **OpenRouter** (recomendado) ou **OpenAI**.\n\nDepois disso eu já consigo responder e automatizar tarefas com a Val.',
          suggestions: ['Abrir Integrações', 'Conectar OpenRouter', 'Conectar OpenAI'],
          actions: [
            { label: 'Abrir Integrações', action: 'open_link', params: { url: '/admin/integracoes' } },
          ],
          mood: 'alert',
        };
      } else {
        parsedResponse = {
          message: 'Não consegui estruturar a resposta em JSON agora. Pode tentar novamente com uma pergunta mais direta?',
          suggestions: [],
          actions: [],
          mood: 'neutral',
        };
      }
    }

    // Adicionar info da persona na resposta
    parsedResponse.persona = {
      name: persona.name,
      title: persona.title,
      emoji: persona.emoji
    };

    // Registrar interação (ignorar erro se tabela não existir)
    try {
      await supabase.from('val_interactions').insert({
        user_id: user.id,
        user_type: personaKey,
        message: message,
        response: parsedResponse.message,
        persona: persona.name,
        context: businessContext
      });
    } catch {
      // Ignorar erro silenciosamente
    }

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
      .or(`id.eq.${user.id},user_id.eq.${user.id}`)
      .maybeSingle();

    const rawUserType = (profileData?.user_type || 'employee') as string;
    let personaKey: string = rawUserType;
    if (rawUserType === 'finance') personaKey = 'financeiro';
    if (rawUserType === 'hr') personaKey = 'rh';
    if (rawUserType === 'client') personaKey = 'cliente';
    if (rawUserType === 'employee' || rawUserType === 'manager') {
      const { data: emp } = await supabase
        .from('employees')
        .select('department, areas')
        .eq('user_id', user.id)
        .maybeSingle();
      personaKey = inferPersonaFromEmployee({
        department: (emp as any)?.department,
        areas: (emp as any)?.areas,
      });
    }
    const persona = getValPersona(personaKey);

    // Buscar dados para sugestões baseado no tipo
    let contextData: any = {};

    if (['super_admin', 'admin'].includes(personaKey)) {
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

    const result = await generateWithAI({
      task: inferTaskFromPersona(personaKey) as any,
      json: true,
      temperature: 0.8,
      maxTokens: 400,
      actorUserId: user.id,
      entityType: 'val_suggestions',
      entityId: null,
      messages: [
        { 
          role: 'system', 
          content: `Você é a ${persona.name}. Gere 2-3 sugestões proativas curtas e relevantes para um ${personaKey}.\nRetorne JSON: { "suggestions": [{ "icon": "emoji", "text": "sugestão curta", "priority": "high/medium/low", "action": "ação_sugerida" }] }`
        },
        { 
          role: 'user', 
          content: JSON.stringify({
            ...contextData,
            currentTime: new Date().toLocaleTimeString('pt-BR'),
            dayOfWeek: new Date().toLocaleDateString('pt-BR', { weekday: 'long' })
          })
        }
      ]
    });

    const parsed = result.json || { suggestions: [] };

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
