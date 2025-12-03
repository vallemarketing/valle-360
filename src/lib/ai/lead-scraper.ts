/**
 * Valle AI - Lead Scraper Service
 * Sistema de scraping e identificação de leads potenciais
 */

import { supabase } from '@/lib/supabase';

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
  score: number; // 0-100
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
   * Busca leads baseado em critérios
   */
  async searchLeads(config: ScrapingConfig): Promise<ScrapingResult> {
    try {
      // Simula busca de leads (em produção, integrar com APIs reais como Apollo, Hunter, etc)
      const mockLeads = this.generateMockLeads(config, 10);
      
      // Salva os leads encontrados
      for (const lead of mockLeads) {
        await this.saveLead(lead);
      }

      return {
        success: true,
        leads: mockLeads,
        total_found: mockLeads.length,
        source: 'scraping_service',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Erro no scraping:', error);
      return {
        success: false,
        leads: [],
        total_found: 0,
        source: 'scraping_service',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Gera leads mockados para demonstração
   */
  private generateMockLeads(config: ScrapingConfig, count: number): Lead[] {
    const industries = [
      'E-commerce', 'SaaS', 'Varejo', 'Educação', 'Saúde', 
      'Imobiliário', 'Alimentação', 'Moda', 'Tecnologia', 'Serviços'
    ];
    
    const companies = [
      'TechStart', 'Digital Plus', 'Smart Solutions', 'Innova Corp',
      'Growth Hub', 'NextGen', 'Velocity', 'Peak Performance',
      'Scale Up', 'Future Vision', 'Quantum Leap', 'Alpha Solutions'
    ];

    const locations = [
      'São Paulo, SP', 'Rio de Janeiro, RJ', 'Belo Horizonte, MG',
      'Curitiba, PR', 'Porto Alegre, RS', 'Brasília, DF'
    ];

    const leads: Lead[] = [];

    for (let i = 0; i < count; i++) {
      const companyBase = companies[Math.floor(Math.random() * companies.length)];
      const industry = config.industry || industries[Math.floor(Math.random() * industries.length)];
      const location = config.location || locations[Math.floor(Math.random() * locations.length)];
      
      const lead: Lead = {
        company_name: `${companyBase} ${Math.floor(Math.random() * 1000)}`,
        website: `https://www.${companyBase.toLowerCase().replace(' ', '')}.com.br`,
        email: `contato@${companyBase.toLowerCase().replace(' ', '')}.com.br`,
        phone: `(11) 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
        industry,
        size: ['small', 'medium', 'large'][Math.floor(Math.random() * 3)] as Lead['size'],
        location,
        social_media: {
          instagram: `@${companyBase.toLowerCase().replace(' ', '')}`,
          linkedin: `linkedin.com/company/${companyBase.toLowerCase().replace(' ', '')}`,
        },
        score: Math.floor(Math.random() * 40) + 60, // 60-100
        status: 'new',
        source: 'scraping',
        tags: this.generateTags(industry),
        ai_insights: this.generateAIInsights(industry),
        created_at: new Date().toISOString()
      };

      leads.push(lead);
    }

    // Ordena por score
    return leads.sort((a, b) => b.score - a.score);
  }

  /**
   * Gera tags baseadas na indústria
   */
  private generateTags(industry: string): string[] {
    const tagMap: Record<string, string[]> = {
      'E-commerce': ['loja-virtual', 'vendas-online', 'marketplace'],
      'SaaS': ['software', 'b2b', 'tecnologia'],
      'Varejo': ['loja-fisica', 'retail', 'consumidor'],
      'Educação': ['edtech', 'cursos', 'ensino'],
      'Saúde': ['healthtech', 'clinica', 'bem-estar'],
      'Imobiliário': ['imoveis', 'corretora', 'construtora'],
      'Alimentação': ['foodtech', 'restaurante', 'delivery'],
      'Moda': ['fashion', 'vestuario', 'acessorios'],
      'Tecnologia': ['tech', 'startup', 'inovacao'],
      'Serviços': ['b2b', 'consultoria', 'prestador'],
    };

    return tagMap[industry] || ['potencial', 'novo'];
  }

  /**
   * Gera insights de IA para o lead
   */
  private generateAIInsights(industry: string): Lead['ai_insights'] {
    const serviceMap: Record<string, string[]> = {
      'E-commerce': ['Tráfego Pago', 'Social Media', 'SEO', 'Email Marketing'],
      'SaaS': ['Inbound Marketing', 'LinkedIn Ads', 'Content Marketing'],
      'Varejo': ['Google Ads', 'Social Media', 'Influencer Marketing'],
      'Educação': ['YouTube Ads', 'Social Media', 'Email Marketing'],
      'Saúde': ['Google Ads', 'Social Media', 'Reputação Online'],
      'Imobiliário': ['Facebook Ads', 'Google Ads', 'Portal Imobiliário'],
      'Alimentação': ['Instagram', 'iFood Ads', 'Influencer Local'],
      'Moda': ['Instagram', 'Pinterest', 'Influencer Marketing'],
      'Tecnologia': ['LinkedIn', 'Google Ads', 'Content Marketing'],
      'Serviços': ['LinkedIn', 'Google Ads', 'Referral Marketing'],
    };

    const approaches = [
      'Abordagem consultiva focada em ROI',
      'Demonstração de cases do setor',
      'Proposta de diagnóstico gratuito',
      'Webinar exclusivo sobre tendências',
      'Reunião de apresentação personalizada'
    ];

    return {
      potential_services: serviceMap[industry] || ['Social Media', 'Tráfego Pago'],
      estimated_value: Math.floor(Math.random() * 15000) + 5000,
      conversion_probability: Math.floor(Math.random() * 30) + 50,
      best_approach: approaches[Math.floor(Math.random() * approaches.length)],
      competitors_using: ['Agência X', 'Freelancer'].slice(0, Math.floor(Math.random() * 2) + 1)
    };
  }

  /**
   * Salva um lead no banco de dados
   */
  async saveLead(lead: Lead): Promise<Lead | null> {
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert({
          company_name: lead.company_name,
          website: lead.website,
          email: lead.email,
          phone: lead.phone,
          industry: lead.industry,
          company_size: lead.size,
          location: lead.location,
          social_media: lead.social_media,
          score: lead.score,
          status: lead.status,
          source: lead.source,
          tags: lead.tags,
          notes: lead.notes,
          ai_insights: lead.ai_insights,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar lead:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao salvar lead:', error);
      return null;
    }
  }

  /**
   * Busca leads do banco de dados
   */
  async getLeads(filters?: {
    status?: string;
    industry?: string;
    min_score?: number;
    assigned_to?: string;
  }): Promise<Lead[]> {
    try {
      let query = supabase
        .from('leads')
        .select('*')
        .order('score', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.industry) {
        query = query.eq('industry', filters.industry);
      }
      if (filters?.min_score) {
        query = query.gte('score', filters.min_score);
      }
      if (filters?.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar leads:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
      return [];
    }
  }

  /**
   * Atualiza o score de um lead baseado em interações
   */
  async updateLeadScore(leadId: string, interaction: {
    type: 'email_opened' | 'link_clicked' | 'meeting_scheduled' | 'proposal_sent' | 'response_received';
    value?: number;
  }): Promise<void> {
    const scoreMap = {
      'email_opened': 5,
      'link_clicked': 10,
      'meeting_scheduled': 25,
      'proposal_sent': 15,
      'response_received': 20
    };

    const scoreIncrease = interaction.value || scoreMap[interaction.type] || 0;

    try {
      const { data: lead } = await supabase
        .from('leads')
        .select('score')
        .eq('id', leadId)
        .single();

      if (lead) {
        const newScore = Math.min(100, (lead.score || 0) + scoreIncrease);
        
        await supabase
          .from('leads')
          .update({ 
            score: newScore,
            updated_at: new Date().toISOString()
          })
          .eq('id', leadId);
      }
    } catch (error) {
      console.error('Erro ao atualizar score:', error);
    }
  }

  /**
   * Gera mensagem personalizada para abordagem do lead
   */
  generateOutreachMessage(lead: Lead, template: 'initial' | 'followup' | 'proposal'): string {
    const templates = {
      initial: `Olá!

Notei que a ${lead.company_name} atua no segmento de ${lead.industry} e tem um grande potencial de crescimento digital.

Na Valle Group, ajudamos empresas como a sua a aumentar suas vendas através de estratégias de ${lead.ai_insights?.potential_services?.slice(0, 2).join(' e ')}.

Gostaria de agendar uma conversa de 15 minutos para entender melhor seus objetivos e mostrar como podemos ajudar?

Abraços,
Equipe Valle Group`,

      followup: `Olá!

Estou retomando o contato sobre nossa conversa anterior.

Preparei algumas ideias específicas para a ${lead.company_name} que acredito que podem gerar resultados expressivos no curto prazo.

Podemos agendar uma call rápida esta semana?

Abraços,
Equipe Valle Group`,

      proposal: `Olá!

Conforme conversamos, segue nossa proposta personalizada para a ${lead.company_name}.

Baseado na análise do seu mercado, recomendamos iniciar com:
${lead.ai_insights?.potential_services?.map(s => `• ${s}`).join('\n')}

Investimento estimado: R$ ${lead.ai_insights?.estimated_value?.toLocaleString('pt-BR')}

Fico à disposição para esclarecer qualquer dúvida.

Abraços,
Equipe Valle Group`
    };

    return templates[template];
  }
}

export const leadScraper = new LeadScraperService();
export default leadScraper;


