/**
 * Valle 360 - API de Geração de Conteúdo com IA
 * Gera emails, posts, descrições de vagas, etc.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { 
  generateSocialContent, 
  generateEmail,
  generateJobDescription 
} from '@/lib/ai/intelligence-service';

export const dynamic = 'force-dynamic';

// POST - Gerar conteúdo
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
    const { type, params } = body;

    let result;

    switch (type) {
      case 'social':
        if (!params?.platform || !params?.topic) {
          return NextResponse.json({ 
            error: 'platform e topic são obrigatórios' 
          }, { status: 400 });
        }
        result = await generateSocialContent({
          platform: params.platform,
          topic: params.topic,
          tone: params.tone || 'professional',
          clientBrand: params.clientBrand,
          keywords: params.keywords
        });
        break;

      case 'email':
        if (!params?.type || !params?.recipientName || !params?.context) {
          return NextResponse.json({ 
            error: 'type, recipientName e context são obrigatórios' 
          }, { status: 400 });
        }
        result = await generateEmail({
          type: params.type,
          recipientName: params.recipientName,
          recipientCompany: params.recipientCompany,
          context: params.context,
          tone: params.tone
        });
        break;

      case 'job':
        if (!params?.title || !params?.department) {
          return NextResponse.json({ 
            error: 'title e department são obrigatórios' 
          }, { status: 400 });
        }
        result = await generateJobDescription({
          title: params.title,
          department: params.department,
          level: params.level || 'pleno',
          type: params.type || 'clt',
          skills: params.skills,
          benefits: params.benefits,
          companyDescription: params.companyDescription
        });
        break;

      case 'proposal':
        // Gerar proposta comercial
        result = await generateProposal(params);
        break;

      case 'report':
        // Gerar relatório
        result = await generateReport(params);
        break;

      default:
        return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      type,
      content: result,
      generatedAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Erro na API de geração:', error);
    return NextResponse.json({ 
      error: 'Erro ao gerar conteúdo',
      details: error.message 
    }, { status: 500 });
  }
}

// Função auxiliar para gerar proposta
async function generateProposal(params: any) {
  const { getOpenAIClient, OPENAI_MODELS } = await import('@/lib/integrations/openai/client');
  const client = getOpenAIClient();

  const systemPrompt = `Você é um especialista em vendas de serviços de marketing digital.
Crie uma proposta comercial profissional e persuasiva.

Retorne um JSON:
{
  "title": "Título da proposta",
  "introduction": "Parágrafo de introdução personalizado",
  "problemAnalysis": "Análise do problema/necessidade do cliente",
  "solution": "Nossa solução proposta",
  "services": [{ "name": "Serviço", "description": "Descrição", "value": 0 }],
  "benefits": ["Lista de benefícios"],
  "timeline": "Prazo de implementação",
  "investment": { "total": 0, "payment": "Condições de pagamento" },
  "nextSteps": ["Próximos passos"],
  "closing": "Parágrafo de fechamento"
}`;

  const response = await client.chat.completions.create({
    model: OPENAI_MODELS.chat,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: JSON.stringify(params) }
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0]?.message?.content;
  return content ? JSON.parse(content) : null;
}

// Função auxiliar para gerar relatório
async function generateReport(params: any) {
  const { getOpenAIClient, OPENAI_MODELS } = await import('@/lib/integrations/openai/client');
  const client = getOpenAIClient();

  const systemPrompt = `Você é um analista de dados de marketing.
Crie um relatório executivo baseado nos dados fornecidos.

Retorne um JSON:
{
  "title": "Título do relatório",
  "executiveSummary": "Resumo executivo (2-3 parágrafos)",
  "highlights": [{ "metric": "Nome", "value": "Valor", "trend": "up/down/stable", "analysis": "Análise" }],
  "analysis": "Análise detalhada",
  "recommendations": ["Lista de recomendações"],
  "nextSteps": ["Próximos passos sugeridos"],
  "conclusion": "Conclusão"
}`;

  const response = await client.chat.completions.create({
    model: OPENAI_MODELS.analysis,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: JSON.stringify(params) }
    ],
    temperature: 0.5,
    response_format: { type: 'json_object' }
  });

  const content = response.choices[0]?.message?.content;
  return content ? JSON.parse(content) : null;
}

