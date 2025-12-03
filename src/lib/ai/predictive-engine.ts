/**
 * Valle AI - Predictive Engine
 * Motor preditivo para análises e previsões
 */

import { supabase } from '@/lib/supabase';

export interface Prediction {
  id?: string;
  type: 'churn' | 'revenue' | 'conversion' | 'delay' | 'performance' | 'upsell';
  entity_type: 'client' | 'lead' | 'task' | 'campaign' | 'employee';
  entity_id: string;
  entity_name?: string;
  prediction_value: number;
  confidence: number; // 0-100
  factors: PredictionFactor[];
  recommendation?: string;
  created_at: string;
  valid_until: string;
  was_correct?: boolean;
  actual_outcome?: any;
}

export interface PredictionFactor {
  name: string;
  weight: number;
  value: number;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

export interface PredictionConfig {
  type: Prediction['type'];
  lookback_days?: number;
  confidence_threshold?: number;
  include_factors?: boolean;
}

class PredictiveEngineService {
  /**
   * Gera previsão de churn para um cliente
   */
  async predictChurn(clientId: string): Promise<Prediction | null> {
    try {
      const factors: PredictionFactor[] = [];
      let churnScore = 0;

      // Fator 1: Engajamento
      const engagement = await this.getEngagementMetrics(clientId);
      if (engagement.score < 40) {
        churnScore += 25;
        factors.push({
          name: 'Baixo engajamento',
          weight: 0.25,
          value: engagement.score,
          impact: 'negative',
          description: `Engajamento ${engagement.score}% abaixo da média`
        });
      }

      // Fator 2: Histórico de pagamento
      const payment = await this.getPaymentHistory(clientId);
      if (payment.late_payments > 2) {
        churnScore += 20;
        factors.push({
          name: 'Histórico de atrasos',
          weight: 0.20,
          value: payment.late_payments,
          impact: 'negative',
          description: `${payment.late_payments} pagamentos atrasados nos últimos 6 meses`
        });
      }

      // Fator 3: Tempo sem contato
      const lastContact = await this.getLastContactDate(clientId);
      const daysSinceContact = Math.floor((Date.now() - lastContact.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceContact > 14) {
        churnScore += 15;
        factors.push({
          name: 'Sem contato recente',
          weight: 0.15,
          value: daysSinceContact,
          impact: 'negative',
          description: `${daysSinceContact} dias sem interação`
        });
      }

      // Fator 4: NPS/Satisfação
      const satisfaction = await this.getSatisfactionScore(clientId);
      if (satisfaction < 7) {
        churnScore += 20;
        factors.push({
          name: 'Baixa satisfação',
          weight: 0.20,
          value: satisfaction,
          impact: 'negative',
          description: `NPS ${satisfaction}/10`
        });
      }

      // Fator 5: Tendência de métricas
      const metrics = await this.getMetricsTrend(clientId);
      if (metrics.trend === 'declining') {
        churnScore += 20;
        factors.push({
          name: 'Métricas em queda',
          weight: 0.20,
          value: metrics.change,
          impact: 'negative',
          description: `Queda de ${Math.abs(metrics.change)}% nas métricas`
        });
      }

      // Calcula confiança baseada na quantidade de dados
      const confidence = Math.min(95, 50 + factors.length * 10);

      const prediction: Prediction = {
        type: 'churn',
        entity_type: 'client',
        entity_id: clientId,
        prediction_value: Math.min(100, churnScore),
        confidence,
        factors,
        recommendation: this.generateChurnRecommendation(churnScore, factors),
        created_at: new Date().toISOString(),
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      await this.savePrediction(prediction);
      return prediction;
    } catch (error) {
      console.error('Erro ao prever churn:', error);
      return null;
    }
  }

  /**
   * Gera previsão de conversão para um lead
   */
  async predictConversion(leadId: string): Promise<Prediction | null> {
    try {
      const factors: PredictionFactor[] = [];
      let conversionScore = 50; // Base

      // Fator 1: Score do lead
      const { data: lead } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (!lead) return null;

      if (lead.score >= 80) {
        conversionScore += 20;
        factors.push({
          name: 'Lead qualificado',
          weight: 0.25,
          value: lead.score,
          impact: 'positive',
          description: `Score ${lead.score}/100`
        });
      }

      // Fator 2: Indústria
      const industryConversionRates: Record<string, number> = {
        'E-commerce': 0.35,
        'SaaS': 0.40,
        'Varejo': 0.25,
        'Tecnologia': 0.45,
        'Saúde': 0.30
      };
      const industryRate = industryConversionRates[lead.industry] || 0.25;
      conversionScore += industryRate * 30;
      factors.push({
        name: 'Taxa do setor',
        weight: 0.20,
        value: industryRate * 100,
        impact: industryRate > 0.30 ? 'positive' : 'neutral',
        description: `Setor ${lead.industry} com taxa de ${(industryRate * 100).toFixed(0)}%`
      });

      // Fator 3: Interações
      const interactions = await this.getLeadInteractions(leadId);
      if (interactions.total >= 3) {
        conversionScore += 15;
        factors.push({
          name: 'Múltiplas interações',
          weight: 0.20,
          value: interactions.total,
          impact: 'positive',
          description: `${interactions.total} interações registradas`
        });
      }

      // Fator 4: Tempo no pipeline
      const daysInPipeline = Math.floor(
        (Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysInPipeline > 30) {
        conversionScore -= 10;
        factors.push({
          name: 'Lead antigo',
          weight: 0.15,
          value: daysInPipeline,
          impact: 'negative',
          description: `${daysInPipeline} dias no pipeline`
        });
      }

      const confidence = Math.min(90, 40 + factors.length * 12);

      const prediction: Prediction = {
        type: 'conversion',
        entity_type: 'lead',
        entity_id: leadId,
        entity_name: lead.company_name,
        prediction_value: Math.min(100, Math.max(0, conversionScore)),
        confidence,
        factors,
        recommendation: this.generateConversionRecommendation(conversionScore, lead),
        created_at: new Date().toISOString(),
        valid_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      };

      await this.savePrediction(prediction);
      return prediction;
    } catch (error) {
      console.error('Erro ao prever conversão:', error);
      return null;
    }
  }

  /**
   * Gera previsão de atraso para uma tarefa
   */
  async predictDelay(taskId: string): Promise<Prediction | null> {
    try {
      const { data: task } = await supabase
        .from('kanban_cards')
        .select('*')
        .eq('id', taskId)
        .single();

      if (!task) return null;

      const factors: PredictionFactor[] = [];
      let delayProbability = 20; // Base

      // Fator 1: Histórico do responsável
      if (task.assigned_to) {
        const history = await this.getEmployeeDeliveryHistory(task.assigned_to);
        if (history.late_rate > 20) {
          delayProbability += history.late_rate * 0.5;
          factors.push({
            name: 'Histórico de atrasos',
            weight: 0.30,
            value: history.late_rate,
            impact: 'negative',
            description: `${history.late_rate}% de entregas atrasadas`
          });
        }
      }

      // Fator 2: Complexidade
      if (task.priority === 'high' || task.estimated_hours > 8) {
        delayProbability += 15;
        factors.push({
          name: 'Alta complexidade',
          weight: 0.25,
          value: task.estimated_hours || 8,
          impact: 'negative',
          description: `Tarefa estimada em ${task.estimated_hours || 8}h`
        });
      }

      // Fator 3: Proximidade do prazo
      if (task.due_date) {
        const daysUntilDue = Math.floor(
          (new Date(task.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilDue < 2 && task.status !== 'done') {
          delayProbability += 25;
          factors.push({
            name: 'Prazo iminente',
            weight: 0.25,
            value: daysUntilDue,
            impact: 'negative',
            description: `Apenas ${daysUntilDue} dias até o prazo`
          });
        }
      }

      // Fator 4: Dependências
      if (task.blocked_by && task.blocked_by.length > 0) {
        delayProbability += 20;
        factors.push({
          name: 'Dependências pendentes',
          weight: 0.20,
          value: task.blocked_by.length,
          impact: 'negative',
          description: `${task.blocked_by.length} tarefas bloqueando`
        });
      }

      const confidence = Math.min(85, 35 + factors.length * 15);

      const prediction: Prediction = {
        type: 'delay',
        entity_type: 'task',
        entity_id: taskId,
        entity_name: task.title,
        prediction_value: Math.min(100, delayProbability),
        confidence,
        factors,
        recommendation: delayProbability > 50 
          ? 'Considere realocar recursos ou ajustar prazo' 
          : 'Monitorar progresso normalmente',
        created_at: new Date().toISOString(),
        valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      await this.savePrediction(prediction);
      return prediction;
    } catch (error) {
      console.error('Erro ao prever atraso:', error);
      return null;
    }
  }

  /**
   * Gera previsão de receita
   */
  async predictRevenue(period: 'month' | 'quarter'): Promise<Prediction | null> {
    try {
      // Busca histórico de receita
      const { data: revenueHistory } = await supabase
        .from('revenue_records')
        .select('*')
        .order('period', { ascending: false })
        .limit(12);

      if (!revenueHistory || revenueHistory.length < 3) {
        return null;
      }

      // Média móvel simples
      const avgRevenue = revenueHistory
        .slice(0, 3)
        .reduce((acc, r) => acc + r.amount, 0) / 3;

      // Tendência
      const trend = this.calculateTrend(revenueHistory.map(r => r.amount));

      // Ajuste sazonal (simplificado)
      const currentMonth = new Date().getMonth();
      const seasonalFactors = [0.9, 0.85, 0.95, 1.0, 1.05, 1.0, 0.95, 0.9, 1.0, 1.1, 1.2, 1.15];
      const seasonalAdjustment = seasonalFactors[currentMonth];

      const predictedRevenue = avgRevenue * (1 + trend) * seasonalAdjustment;

      const factors: PredictionFactor[] = [
        {
          name: 'Média histórica',
          weight: 0.40,
          value: avgRevenue,
          impact: 'neutral',
          description: `Média dos últimos 3 meses: R$ ${avgRevenue.toLocaleString('pt-BR')}`
        },
        {
          name: 'Tendência',
          weight: 0.35,
          value: trend * 100,
          impact: trend > 0 ? 'positive' : 'negative',
          description: `Tendência de ${(trend * 100).toFixed(1)}%`
        },
        {
          name: 'Sazonalidade',
          weight: 0.25,
          value: (seasonalAdjustment - 1) * 100,
          impact: seasonalAdjustment > 1 ? 'positive' : 'negative',
          description: `Ajuste sazonal de ${((seasonalAdjustment - 1) * 100).toFixed(0)}%`
        }
      ];

      const prediction: Prediction = {
        type: 'revenue',
        entity_type: 'client',
        entity_id: 'all',
        entity_name: period === 'month' ? 'Próximo Mês' : 'Próximo Trimestre',
        prediction_value: Math.round(predictedRevenue * (period === 'quarter' ? 3 : 1)),
        confidence: Math.min(80, 50 + revenueHistory.length * 3),
        factors,
        recommendation: trend > 0.05 
          ? 'Tendência positiva - considere expandir capacidade'
          : trend < -0.05
          ? 'Tendência negativa - revisar estratégia comercial'
          : 'Receita estável - manter estratégia atual',
        created_at: new Date().toISOString(),
        valid_until: new Date(Date.now() + (period === 'month' ? 30 : 90) * 24 * 60 * 60 * 1000).toISOString()
      };

      await this.savePrediction(prediction);
      return prediction;
    } catch (error) {
      console.error('Erro ao prever receita:', error);
      return null;
    }
  }

  /**
   * Identifica oportunidades de upsell
   */
  async predictUpsellOpportunities(clientId: string): Promise<Prediction | null> {
    try {
      const { data: client } = await supabase
        .from('clients')
        .select('*, client_services(*)')
        .eq('id', clientId)
        .single();

      if (!client) return null;

      const currentServices = client.client_services?.map((s: any) => s.service_type) || [];
      const factors: PredictionFactor[] = [];
      let upsellScore = 30; // Base

      // Serviços complementares
      const serviceComplement: Record<string, string[]> = {
        'social_media': ['trafego_pago', 'design', 'video'],
        'trafego_pago': ['social_media', 'landing_page', 'email_marketing'],
        'design': ['social_media', 'video', 'branding'],
        'video': ['social_media', 'trafego_pago'],
        'site': ['seo', 'trafego_pago', 'manutencao']
      };

      const recommendedServices: string[] = [];
      for (const service of currentServices) {
        const complements = serviceComplement[service] || [];
        for (const complement of complements) {
          if (!currentServices.includes(complement) && !recommendedServices.includes(complement)) {
            recommendedServices.push(complement);
            upsellScore += 10;
          }
        }
      }

      if (recommendedServices.length > 0) {
        factors.push({
          name: 'Serviços complementares',
          weight: 0.40,
          value: recommendedServices.length,
          impact: 'positive',
          description: `${recommendedServices.length} serviços recomendados`
        });
      }

      // Crescimento do cliente
      const metrics = await this.getMetricsTrend(clientId);
      if (metrics.trend === 'growing' && metrics.change > 20) {
        upsellScore += 20;
        factors.push({
          name: 'Cliente em crescimento',
          weight: 0.30,
          value: metrics.change,
          impact: 'positive',
          description: `Crescimento de ${metrics.change}% - momento ideal para expandir`
        });
      }

      // Tempo como cliente
      const monthsAsClient = Math.floor(
        (Date.now() - new Date(client.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)
      );
      if (monthsAsClient >= 6) {
        upsellScore += 15;
        factors.push({
          name: 'Cliente fidelizado',
          weight: 0.30,
          value: monthsAsClient,
          impact: 'positive',
          description: `${monthsAsClient} meses de relacionamento`
        });
      }

      const prediction: Prediction = {
        type: 'upsell',
        entity_type: 'client',
        entity_id: clientId,
        entity_name: client.company_name,
        prediction_value: Math.min(100, upsellScore),
        confidence: Math.min(85, 40 + factors.length * 15),
        factors,
        recommendation: recommendedServices.length > 0
          ? `Serviços recomendados: ${recommendedServices.join(', ')}`
          : 'Cliente já possui pacote completo',
        created_at: new Date().toISOString(),
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      await this.savePrediction(prediction);
      return prediction;
    } catch (error) {
      console.error('Erro ao prever upsell:', error);
      return null;
    }
  }

  // Métodos auxiliares
  private async getEngagementMetrics(clientId: string) {
    // Simplificado - em produção buscaria dados reais
    return { score: Math.floor(Math.random() * 60) + 30 };
  }

  private async getPaymentHistory(clientId: string) {
    return { late_payments: Math.floor(Math.random() * 5) };
  }

  private async getLastContactDate(clientId: string) {
    return new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
  }

  private async getSatisfactionScore(clientId: string) {
    return Math.floor(Math.random() * 4) + 6;
  }

  private async getMetricsTrend(clientId: string) {
    const trends = ['growing', 'stable', 'declining'];
    return {
      trend: trends[Math.floor(Math.random() * 3)],
      change: Math.floor(Math.random() * 40) - 10
    };
  }

  private async getLeadInteractions(leadId: string) {
    return { total: Math.floor(Math.random() * 8) + 1 };
  }

  private async getEmployeeDeliveryHistory(employeeId: string) {
    return { late_rate: Math.floor(Math.random() * 30) };
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    const recent = values.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    const older = values.slice(3, 6).reduce((a, b) => a + b, 0) / Math.min(3, values.length - 3);
    return older > 0 ? (recent - older) / older : 0;
  }

  private generateChurnRecommendation(score: number, factors: PredictionFactor[]): string {
    if (score >= 70) {
      return '🚨 URGENTE: Agendar reunião de retenção imediatamente';
    } else if (score >= 50) {
      return '⚠️ Atenção: Iniciar ações preventivas de retenção';
    } else if (score >= 30) {
      return '📊 Monitorar: Acompanhar métricas semanalmente';
    }
    return '✅ Saudável: Manter relacionamento normal';
  }

  private generateConversionRecommendation(score: number, lead: any): string {
    if (score >= 70) {
      return '🎯 Alta probabilidade: Enviar proposta personalizada';
    } else if (score >= 50) {
      return '📞 Boa chance: Agendar call de apresentação';
    } else if (score >= 30) {
      return '📧 Nutrir: Continuar envio de conteúdo relevante';
    }
    return '❄️ Frio: Manter em nurturing automático';
  }

  private async savePrediction(prediction: Prediction): Promise<void> {
    try {
      await supabase.from('ai_predictions').insert(prediction);
    } catch (error) {
      console.error('Erro ao salvar previsão:', error);
    }
  }

  /**
   * Busca previsões
   */
  async getPredictions(filters?: {
    type?: Prediction['type'];
    entity_type?: string;
    entity_id?: string;
    min_confidence?: number;
  }): Promise<Prediction[]> {
    try {
      let query = supabase
        .from('ai_predictions')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.type) query = query.eq('type', filters.type);
      if (filters?.entity_type) query = query.eq('entity_type', filters.entity_type);
      if (filters?.entity_id) query = query.eq('entity_id', filters.entity_id);
      if (filters?.min_confidence) query = query.gte('confidence', filters.min_confidence);

      const { data } = await query;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar previsões:', error);
      return [];
    }
  }

  /**
   * Registra feedback sobre previsão
   */
  async recordPredictionOutcome(predictionId: string, wasCorrect: boolean, actualOutcome?: any): Promise<void> {
    try {
      await supabase
        .from('ai_predictions')
        .update({
          was_correct: wasCorrect,
          actual_outcome: actualOutcome
        })
        .eq('id', predictionId);
    } catch (error) {
      console.error('Erro ao registrar outcome:', error);
    }
  }
}

export const predictiveEngine = new PredictiveEngineService();
export default predictiveEngine;


