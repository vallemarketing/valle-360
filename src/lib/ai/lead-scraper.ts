/**
 * Valle AI - Lead Scraper Service
 * Sistema de scraping e identificação de leads potenciais
 * CONECTADO AO TAVILY PARA DADOS REAIS
 */

import { tavilyClient } from '@/lib/integrations/tavily/client';
import { getOpenAIClient, OPENAI_MODELS } from '@/lib/integrations/openai/client';

export interface Lead {
  id?: string;
  company_name: string;
  website?: string;
  email?: string;
  phone?: string;
  industry?: string;
  size?: 'small' | 'medium' | 'large' | 'enterprise';
  location?: string;
  social_media?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    twitter?: string;
  };
  score: number;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
  source: 'scraping' | 'referral' | 'inbound' | 'outbound' | 'event';
  tags?: string[];
  notes?: string;
  created_at?: string;
  updated_at?: string;
  assigned_to?: string;
  ai_insights?: {
    potential_services?: string[];
    estimated_value?: number;
    conversion_probability?: number;
    best_approach?: string;
    competitors_using?: string[];
  };
}

export interface ScrapingConfig {
  industry?: string;
  location?: string;
  min_employees?: number;
  max_employees?: number;
  has_website?: boolean;
  has_social_media?: boolean;
  keywords?: string[];
}

export interface ScrapingResult {
  success: boolean;
  leads: Lead[];
  total_found: number;
  source: string;
  timestamp: string;
}

class LeadScraperService {
  /**
   * Busca leads baseado em critérios usando Tavily
   */
  async searchLeads(config: ScrapingConfig): Promise<ScrapingResult> {
    try {
      // Construir query de busca
      let query = 'empresas';
      if (config.industry) query += ` ${config.industry}`;
      if (config.location) query += ` em ${config.location}`;
      if (config.keywords?.length) query += ` ${config.keywords.join(' ')}`;
      query += ' contato site email';

      // Buscar com Tavily
      const searchResults = await tavilyClient.search({
        query,
        searchDepth: 'advanced',
        maxResults: 20,
        includeAnswer: true
      });

      // Processar resultados com IA
      const leads = await this.processSearchResults(searchResults.results, config);

      return {
        success: true,
        leads,
        total_found: leads.length,
        source: 'tavily_search',
        timestamp: new Date().toISOString()
      };
    } catch (error: any) {
      console.error('Erro no scraping de leads:', error);
      return {
        success: false,
        leads: [],
        total_found: 0,
        source: 'tavily_search',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Processa resultados de busca e extrai leads
   */
  private async processSearchResults(
    results: any[],
    config: ScrapingConfig
  ): Promise<Lead[]> {
    const client = getOpenAIClient();

    const systemPrompt = `Você é um especialista em qualificação de leads B2B.
Analise os resultados de busca e extraia informações de empresas potenciais.

Para cada empresa encontrada, retorne:
{
  "leads": [
    {
      "company_name": "Nome da empresa",
      "website": "URL se encontrada",
      "industry": "Setor",
      "location": "Cidade/Estado",
      "description": "Breve descrição",
      "score": 0-100 (potencial como lead),
      "potential_services": ["serviços que podem precisar"],
      "notes": "Observações relevantes"
    }
  ]
}

Critérios de qualificação:
- Empresas com presença digital ativa = maior score
- Empresas do setor ${config.industry || 'diversos'} = maior score
- Empresas em ${config.location || 'Brasil'} = maior score`;

    try {
      const response = await client.chat.completions.create({
        model: OPENAI_MODELS.analysis,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: JSON.stringify(results.map(r => ({
            title: r.title,
            url: r.url,
            content: r.content
          }))) }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return [];

      const parsed = JSON.parse(content);
      
      return (parsed.leads || []).map((lead: any) => ({
        company_name: lead.company_name,
        website: lead.website,
        industry: lead.industry || config.industry,
        location: lead.location || config.location,
        score: lead.score || 50,
        status: 'new' as const,
        source: 'scraping' as const,
        notes: lead.notes,
        ai_insights: {
          potential_services: lead.potential_services || [],
          conversion_probability: lead.score / 100,
          best_approach: lead.notes
        }
      }));
    } catch (error) {
      console.error('Erro ao processar resultados:', error);
      return [];
    }
  }

  /**
   * Enriquece dados de um lead
   */
  async enrichLead(lead: Lead): Promise<Lead> {
    try {
      // Buscar mais informações sobre a empresa
      const [companyInfo, socialInfo, reputationInfo] = await Promise.all([
        tavilyClient.searchCompany(lead.company_name),
        tavilyClient.searchSocialMedia(lead.company_name),
        tavilyClient.searchReputation(lead.company_name)
      ]);

      // Processar com IA
      const client = getOpenAIClient();
      
      const response = await client.chat.completions.create({
        model: OPENAI_MODELS.analysis,
        messages: [
          { 
            role: 'system', 
            content: `Analise as informações e extraia dados estruturados da empresa.
Retorne JSON:
{
  "website": "url principal",
  "email": "email de contato se encontrado",
  "phone": "telefone se encontrado",
  "social_media": {
    "instagram": "@handle ou url",
    "facebook": "url",
    "linkedin": "url"
  },
  "size": "small/medium/large/enterprise",
  "industry": "setor",
  "score_adjustment": -20 a +20 (baseado na reputação),
  "insights": {
    "potential_services": ["serviços recomendados"],
    "best_approach": "melhor abordagem de vendas",
    "competitors_using": ["concorrentes que usam marketing digital"]
  }
}`
          },
          { 
            role: 'user', 
            content: JSON.stringify({
              company: lead.company_name,
              companyResults: companyInfo.results.slice(0, 5),
              socialResults: socialInfo.results.slice(0, 5),
              reputationResults: reputationInfo.results.slice(0, 5)
            })
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });

      const content = response.choices[0]?.message?.content;
      if (!content) return lead;

      const enrichment = JSON.parse(content);

      return {
        ...lead,
        website: enrichment.website || lead.website,
        email: enrichment.email || lead.email,
        phone: enrichment.phone || lead.phone,
        social_media: enrichment.social_media || lead.social_media,
        size: enrichment.size || lead.size,
        industry: enrichment.industry || lead.industry,
        score: Math.max(0, Math.min(100, lead.score + (enrichment.score_adjustment || 0))),
        ai_insights: {
          ...lead.ai_insights,
          ...enrichment.insights
        }
      };
    } catch (error) {
      console.error('Erro ao enriquecer lead:', error);
      return lead;
    }
  }

  /**
   * Busca leads em um setor específico
   */
  async findLeadsByIndustry(industry: string, location?: string): Promise<ScrapingResult> {
    return this.searchLeads({
      industry,
      location,
      keywords: ['marketing digital', 'precisa marketing', 'quer crescer', 'sem presença online']
    });
  }

  /**
   * Busca leads que precisam de marketing digital
   */
  async findLeadsNeedingMarketing(location?: string): Promise<ScrapingResult> {
    return this.searchLeads({
      location,
      keywords: ['empresa sem site', 'sem redes sociais', 'precisa divulgação', 'quer vender mais online']
    });
  }

  /**
   * Busca leads do banco de dados com filtros opcionais
   */
  async getLeads(filters: {
    status?: string;
    industry?: string;
    min_score?: number;
    assigned_to?: string;
  }): Promise<Lead[]> {
    // Retorna mock data por enquanto (em produção, buscar do Supabase)
    const mockLeads: Lead[] = [
      {
        id: '1',
        company_name: 'Tech Solutions SP',
        website: 'www.techsolutions.com.br',
        email: 'contato@techsolutions.com.br',
        phone: '(11) 99999-8888',
        industry: 'Tecnologia',
        size: 'medium',
        location: 'São Paulo, SP',
        score: 85,
        status: 'qualified',
        source: 'scraping',
        tags: ['b2b', 'software'],
        created_at: new Date().toISOString(),
        ai_insights: {
          potential_services: ['Social Media', 'Tráfego Pago'],
          estimated_value: 5000,
          conversion_probability: 0.75
        }
      },
      {
        id: '2',
        company_name: 'Boutique Fashion',
        website: 'www.boutiquefashion.com.br',
        email: 'vendas@boutiquefashion.com.br',
        phone: '(21) 98888-7777',
        industry: 'Moda',
        size: 'small',
        location: 'Rio de Janeiro, RJ',
        score: 72,
        status: 'new',
        source: 'scraping',
        tags: ['ecommerce', 'varejo'],
        created_at: new Date().toISOString(),
        ai_insights: {
          potential_services: ['E-commerce', 'Instagram Ads'],
          estimated_value: 3500,
          conversion_probability: 0.60
        }
      },
      {
        id: '3',
        company_name: 'Restaurante Sabor & Arte',
        email: 'contato@saborarte.com.br',
        phone: '(11) 97777-6666',
        industry: 'Restaurante',
        size: 'small',
        location: 'São Paulo, SP',
        score: 90,
        status: 'proposal',
        source: 'referral',
        tags: ['food', 'local'],
        created_at: new Date().toISOString(),
        ai_insights: {
          potential_services: ['Google Meu Negócio', 'Social Media'],
          estimated_value: 2500,
          conversion_probability: 0.85
        }
      }
    ];

    // Aplicar filtros
    let filteredLeads = mockLeads;

    if (filters.status) {
      filteredLeads = filteredLeads.filter(l => l.status === filters.status);
    }
    if (filters.industry) {
      filteredLeads = filteredLeads.filter(l => 
        l.industry?.toLowerCase().includes(filters.industry!.toLowerCase())
      );
    }
    if (filters.min_score) {
      filteredLeads = filteredLeads.filter(l => l.score >= filters.min_score!);
    }
    if (filters.assigned_to) {
      filteredLeads = filteredLeads.filter(l => l.assigned_to === filters.assigned_to);
    }

    return filteredLeads;
  }
}

export const leadScraper = new LeadScraperService();
export default leadScraper;
