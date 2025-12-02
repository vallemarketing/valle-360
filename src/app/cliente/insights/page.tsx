'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  Zap,
  Calendar,
  ArrowRight,
  Sparkles,
  ChevronRight,
  BarChart3,
  Users,
  DollarSign,
  Eye
} from 'lucide-react';

interface Insight {
  id: string;
  type: 'opportunity' | 'warning' | 'achievement' | 'recommendation';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  metric?: {
    label: string;
    value: string;
    change: number;
  };
  action?: {
    label: string;
    href: string;
  };
  createdAt: Date;
}

interface WeeklySummary {
  period: string;
  highlights: string[];
  metrics: {
    label: string;
    value: string;
    change: number;
    icon: React.ElementType;
  }[];
  opportunities: string[];
  risks: string[];
  nextSteps: string[];
}

// Mock data
const mockInsights: Insight[] = [
  {
    id: '1',
    type: 'opportunity',
    priority: 'high',
    title: 'Horário de Ouro Identificado',
    description: 'Seus posts entre 19h e 21h têm 45% mais engajamento. Considere concentrar publicações neste período.',
    metric: { label: 'Engajamento', value: '+45%', change: 45 },
    action: { label: 'Ver Análise Completa', href: '/cliente/dashboard' },
    createdAt: new Date()
  },
  {
    id: '2',
    type: 'achievement',
    priority: 'medium',
    title: 'Meta de Seguidores Atingida! 🎉',
    description: 'Você alcançou 15.000 seguidores no Instagram, um crescimento de 12% este mês.',
    metric: { label: 'Seguidores', value: '15K', change: 12 },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5)
  },
  {
    id: '3',
    type: 'warning',
    priority: 'high',
    title: 'Queda no Alcance Detectada',
    description: 'O alcance orgânico caiu 18% na última semana. Recomendamos aumentar a frequência de Reels.',
    metric: { label: 'Alcance', value: '-18%', change: -18 },
    action: { label: 'Ver Recomendações', href: '/cliente/noticias' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12)
  },
  {
    id: '4',
    type: 'recommendation',
    priority: 'medium',
    title: 'Tendência: Conteúdo em Carrossel',
    description: 'Posts em carrossel estão gerando 2x mais salvamentos. Considere criar mais deste formato.',
    action: { label: 'Solicitar Conteúdo', href: '/cliente/producao' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
  },
  {
    id: '5',
    type: 'opportunity',
    priority: 'low',
    title: 'Seu Concorrente Está Inativo',
    description: 'O concorrente "Alpha" não postou há 5 dias. Boa oportunidade para aumentar presença.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36)
  }
];

const mockWeeklySummary: WeeklySummary = {
  period: '18-24 Nov 2024',
  highlights: [
    '📈 Crescimento de 12% em seguidores',
    '🎯 3 posts com engajamento acima da média',
    '💬 87 novos comentários respondidos',
    '🔥 1 Reel viral com 50K visualizações'
  ],
  metrics: [
    { label: 'Alcance Total', value: '125.4K', change: 8, icon: Eye },
    { label: 'Novos Seguidores', value: '+1.2K', change: 12, icon: Users },
    { label: 'Engajamento', value: '4.8%', change: 5, icon: TrendingUp },
    { label: 'Leads Gerados', value: '23', change: 15, icon: DollarSign }
  ],
  opportunities: [
    'Aumentar produção de Reels (performance 3x maior)',
    'Explorar horário das 7h (baixa concorrência)',
    'Criar série de conteúdo educativo'
  ],
  risks: [
    'Engajamento em stories caindo 10%',
    'Taxa de resposta de DMs abaixo da meta'
  ],
  nextSteps: [
    'Aprovar 5 posts pendentes para próxima semana',
    'Revisar calendário de conteúdo de Dezembro',
    'Agendar reunião de alinhamento'
  ]
};

const INSIGHT_ICONS: Record<string, React.ElementType> = {
  opportunity: Lightbulb,
  warning: AlertTriangle,
  achievement: CheckCircle,
  recommendation: Target
};

const INSIGHT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  opportunity: { bg: 'var(--success-50)', text: 'var(--success-700)', border: 'var(--success-200)' },
  warning: { bg: 'var(--warning-50)', text: 'var(--warning-700)', border: 'var(--warning-200)' },
  achievement: { bg: 'var(--purple-50)', text: 'var(--purple-700)', border: 'var(--purple-200)' },
  recommendation: { bg: 'var(--primary-50)', text: 'var(--primary-700)', border: 'var(--primary-200)' }
};

export default function InsightsPage() {
  const [insights] = useState<Insight[]>(mockInsights);
  const [summary] = useState<WeeklySummary>(mockWeeklySummary);
  const [filter, setFilter] = useState<string>('all');

  const filteredInsights = filter === 'all' 
    ? insights 
    : insights.filter(i => i.type === filter);

  return (
    <div className="pb-20 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Sparkles className="w-7 h-7" style={{ color: 'var(--purple-500)' }} />
          Central de Insights
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Análises e recomendações personalizadas pela Val IA
        </p>
      </div>

      {/* Weekly Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden"
        style={{ 
          background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--purple-500) 100%)'
        }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-white/80" />
              <span className="text-white/80 text-sm">Resumo Semanal</span>
            </div>
            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-sm">
              {summary.period}
            </span>
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {summary.highlights.map((highlight, index) => (
              <div
                key={index}
                className="p-3 rounded-xl bg-white/10 text-white text-sm"
              >
                {highlight}
              </div>
            ))}
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {summary.metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div
                  key={index}
                  className="p-3 rounded-xl bg-white/10"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-white/70" />
                    <span className="text-white/70 text-xs">{metric.label}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white text-xl font-bold">{metric.value}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      metric.change > 0 ? 'bg-green-400/30 text-green-100' : 'bg-red-400/30 text-red-100'
                    }`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Items */}
        <div className="p-4 bg-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-white" />
            <span className="text-white font-medium text-sm">Próximos Passos</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {summary.nextSteps.map((step, index) => (
              <span
                key={index}
                className="px-3 py-1.5 rounded-lg bg-white/20 text-white text-sm"
              >
                {step}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Opportunities & Risks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Opportunities */}
        <div 
          className="p-4 rounded-xl"
          style={{ backgroundColor: 'var(--success-50)', border: '1px solid var(--success-200)' }}
        >
          <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--success-700)' }}>
            <TrendingUp className="w-5 h-5" />
            Oportunidades
          </h3>
          <div className="space-y-2">
            {summary.opportunities.map((opp, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--success-500)' }} />
                <span className="text-sm" style={{ color: 'var(--success-700)' }}>{opp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risks */}
        <div 
          className="p-4 rounded-xl"
          style={{ backgroundColor: 'var(--warning-50)', border: '1px solid var(--warning-200)' }}
        >
          <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--warning-700)' }}>
            <AlertTriangle className="w-5 h-5" />
            Pontos de Atenção
          </h3>
          <div className="space-y-2">
            {summary.risks.map((risk, index) => (
              <div key={index} className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--warning-500)' }} />
                <span className="text-sm" style={{ color: 'var(--warning-700)' }}>{risk}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'Todos' },
          { id: 'opportunity', label: 'Oportunidades' },
          { id: 'warning', label: 'Alertas' },
          { id: 'achievement', label: 'Conquistas' },
          { id: 'recommendation', label: 'Recomendações' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all`}
            style={{
              backgroundColor: filter === tab.id ? 'var(--primary-500)' : 'var(--bg-secondary)',
              color: filter === tab.id ? 'white' : 'var(--text-primary)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {filteredInsights.map((insight, index) => {
          const Icon = INSIGHT_ICONS[insight.type];
          const colors = INSIGHT_COLORS[insight.type];
          
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl"
              style={{ 
                backgroundColor: colors.bg, 
                border: `1px solid ${colors.border}`
              }}
            >
              <div className="flex items-start gap-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${colors.text}20` }}
                >
                  <Icon className="w-5 h-5" style={{ color: colors.text }} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-bold" style={{ color: colors.text }}>
                      {insight.title}
                    </h3>
                    {insight.priority === 'high' && (
                      <span 
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: 'var(--error-100)', color: 'var(--error-700)' }}
                      >
                        Prioridade Alta
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                    {insight.description}
                  </p>

                  <div className="flex items-center justify-between">
                    {insight.metric && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                          {insight.metric.label}:
                        </span>
                        <span 
                          className="font-bold"
                          style={{ 
                            color: insight.metric.change > 0 ? 'var(--success-600)' : 'var(--error-600)'
                          }}
                        >
                          {insight.metric.value}
                        </span>
                      </div>
                    )}
                    
                    {insight.action && (
                      <a
                        href={insight.action.href}
                        className="flex items-center gap-1 text-sm font-medium"
                        style={{ color: colors.text }}
                      >
                        {insight.action.label}
                        <ChevronRight className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Val AI Summary */}
      <div 
        className="p-4 rounded-xl"
        style={{ 
          background: 'linear-gradient(135deg, var(--purple-50) 0%, var(--primary-50) 100%)',
          border: '1px solid var(--purple-200)'
        }}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--purple-500)' }}>
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold" style={{ color: 'var(--purple-700)' }}>
              Resumo da Val
            </h3>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              "Olá! Esta semana você teve um ótimo desempenho, especialmente com Reels. 
              Recomendo focar em conteúdos em carrossel e manter a consistência nos horários de pico. 
              Seu concorrente principal está menos ativo - aproveite para ganhar mais espaço! 
              Qualquer dúvida, estou aqui para ajudar. 💜"
            </p>
            <a 
              href="/cliente/ia"
              className="inline-flex items-center gap-1 mt-3 text-sm font-medium"
              style={{ color: 'var(--purple-600)' }}
            >
              Conversar com Val
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}






