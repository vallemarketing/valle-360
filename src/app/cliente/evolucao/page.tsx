'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Calendar,
  Award,
  Star,
  Target,
  CheckCircle,
  ArrowUpRight,
  Download,
  Share2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Trophy,
  Zap,
  Users,
  Eye,
  Heart,
  DollarSign
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface Milestone {
  id: string;
  date: Date;
  title: string;
  description: string;
  type: 'achievement' | 'growth' | 'campaign' | 'feature';
  metric?: {
    label: string;
    before: string;
    after: string;
  };
  badge?: string;
}

interface EvolutionMetric {
  label: string;
  icon: React.ElementType;
  startValue: number;
  currentValue: number;
  unit: string;
  color: string;
  data: { month: string; value: number }[];
}

// Mock data
const mockMilestones: Milestone[] = [
  {
    id: '1',
    date: new Date('2024-11-15'),
    title: '15.000 Seguidores Alcançados! 🎉',
    description: 'Você atingiu a marca de 15 mil seguidores no Instagram.',
    type: 'achievement',
    metric: { label: 'Seguidores', before: '14.2K', after: '15K' },
    badge: '🏆 15K Club'
  },
  {
    id: '2',
    date: new Date('2024-11-01'),
    title: 'Campanha Black Friday Iniciada',
    description: 'Lançamento da campanha com 20% de desconto.',
    type: 'campaign',
    metric: { label: 'Alcance', before: '8K', after: '45K' }
  },
  {
    id: '3',
    date: new Date('2024-10-20'),
    title: 'Reel Viral - 50K Views',
    description: 'Seu Reel sobre tendências atingiu 50 mil visualizações.',
    type: 'growth',
    metric: { label: 'Views', before: '5K média', after: '50K' },
    badge: '🔥 Viral'
  },
  {
    id: '4',
    date: new Date('2024-10-01'),
    title: 'Nova Identidade Visual',
    description: 'Implementação do novo design de posts e stories.',
    type: 'feature'
  },
  {
    id: '5',
    date: new Date('2024-09-15'),
    title: '10.000 Seguidores',
    description: 'Primeira grande marca atingida!',
    type: 'achievement',
    metric: { label: 'Seguidores', before: '8.5K', after: '10K' },
    badge: '⭐ 10K Club'
  },
  {
    id: '6',
    date: new Date('2024-08-01'),
    title: 'Início da Parceria Valle 360',
    description: 'Bem-vindo à família Valle 360! Início do trabalho de gestão de redes sociais.',
    type: 'feature',
    metric: { label: 'Seguidores', before: '5.2K', after: '5.2K' }
  }
];

const mockMetrics: EvolutionMetric[] = [
  {
    label: 'Seguidores',
    icon: Users,
    startValue: 5200,
    currentValue: 15420,
    unit: '',
    color: '#4370d1',
    data: [
      { month: 'Ago', value: 5200 },
      { month: 'Set', value: 7800 },
      { month: 'Out', value: 10500 },
      { month: 'Nov', value: 15420 }
    ]
  },
  {
    label: 'Alcance Médio',
    icon: Eye,
    startValue: 2500,
    currentValue: 12800,
    unit: '',
    color: '#22c55e',
    data: [
      { month: 'Ago', value: 2500 },
      { month: 'Set', value: 5200 },
      { month: 'Out', value: 8400 },
      { month: 'Nov', value: 12800 }
    ]
  },
  {
    label: 'Engajamento',
    icon: Heart,
    startValue: 2.1,
    currentValue: 4.8,
    unit: '%',
    color: '#ef4444',
    data: [
      { month: 'Ago', value: 2.1 },
      { month: 'Set', value: 3.2 },
      { month: 'Out', value: 4.1 },
      { month: 'Nov', value: 4.8 }
    ]
  },
  {
    label: 'Leads Gerados',
    icon: DollarSign,
    startValue: 5,
    currentValue: 45,
    unit: '/mês',
    color: '#f59e0b',
    data: [
      { month: 'Ago', value: 5 },
      { month: 'Set', value: 15 },
      { month: 'Out', value: 28 },
      { month: 'Nov', value: 45 }
    ]
  }
];

const MILESTONE_COLORS: Record<string, { bg: string; border: string; icon: string }> = {
  achievement: { bg: 'var(--purple-50)', border: 'var(--purple-200)', icon: 'var(--purple-500)' },
  growth: { bg: 'var(--success-50)', border: 'var(--success-200)', icon: 'var(--success-500)' },
  campaign: { bg: 'var(--primary-50)', border: 'var(--primary-200)', icon: 'var(--primary-500)' },
  feature: { bg: 'var(--warning-50)', border: 'var(--warning-200)', icon: 'var(--warning-500)' }
};

const MILESTONE_ICONS: Record<string, React.ElementType> = {
  achievement: Trophy,
  growth: TrendingUp,
  campaign: Target,
  feature: Zap
};

const CLIENT_JOIN_DATE = new Date('2024-06-15'); // Data de entrada no time Valle 360

export default function EvolucaoPage() {
  const [milestones] = useState<Milestone[]>(mockMilestones);
  const [metrics] = useState<EvolutionMetric[]>(mockMetrics);
  const [selectedMetric, setSelectedMetric] = useState<EvolutionMetric>(metrics[0]);
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);

  const calculateGrowth = (start: number, current: number) => {
    return Math.round(((current - start) / start) * 100);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-[#001533] dark:text-white">
            <TrendingUp className="w-7 h-7 text-emerald-500" />
            Minha Evolução
          </h1>
          <p className="text-[#001533]/60 dark:text-white/60">
            Evolução desde que entrou no time Valle 360
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl"
          style={{ backgroundColor: 'var(--primary-500)', color: 'white' }}
        >
          <Download className="w-4 h-4" />
          Exportar
        </button>
      </div>

      {/* Hero Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl"
        style={{ 
          background: 'linear-gradient(135deg, var(--success-500) 0%, var(--primary-500) 100%)'
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-white" />
          <span className="text-white/80">Desde Agosto 2024</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            const growth = calculateGrowth(metric.startValue, metric.currentValue);
            
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl bg-white/10 cursor-pointer hover:bg-white/20 transition-colors"
                onClick={() => setSelectedMetric(metric)}
              >
                <Icon className="w-6 h-6 text-white/70 mb-2" />
                <p className="text-white text-2xl font-bold">
                  {formatNumber(metric.currentValue)}{metric.unit}
                </p>
                <p className="text-white/70 text-sm">{metric.label}</p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUpRight className="w-4 h-4 text-green-300" />
                  <span className="text-green-300 text-sm font-medium">+{growth}%</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Growth Chart */}
      <div 
        className="p-6 rounded-xl"
        style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>
            Evolução de {selectedMetric.label}
          </h3>
          <div className="flex gap-2">
            {metrics.map((m) => (
              <button
                key={m.label}
                onClick={() => setSelectedMetric(m)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors`}
                style={{
                  backgroundColor: selectedMetric.label === m.label ? m.color : 'var(--bg-secondary)',
                  color: selectedMetric.label === m.label ? 'white' : 'var(--text-secondary)'
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={selectedMetric.data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={selectedMetric.color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={selectedMetric.color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis dataKey="month" stroke="var(--text-tertiary)" />
              <YAxis stroke="var(--text-tertiary)" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--bg-primary)', 
                  border: '1px solid var(--border-light)',
                  borderRadius: '8px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={selectedMetric.color} 
                strokeWidth={3}
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Before/After Comparison */}
        <div className="mt-4 flex items-center justify-center gap-8 p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="text-center">
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Início (Ago/24)</p>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {formatNumber(selectedMetric.startValue)}{selectedMetric.unit}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpRight className="w-6 h-6" style={{ color: 'var(--success-500)' }} />
            <span className="text-lg font-bold" style={{ color: 'var(--success-500)' }}>
              +{calculateGrowth(selectedMetric.startValue, selectedMetric.currentValue)}%
            </span>
          </div>
          <div className="text-center">
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Atual (Nov/24)</p>
            <p className="text-xl font-bold" style={{ color: selectedMetric.color }}>
              {formatNumber(selectedMetric.currentValue)}{selectedMetric.unit}
            </p>
          </div>
        </div>
      </div>

      {/* Badges/Achievements */}
      <div>
        <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Award className="w-5 h-5" style={{ color: 'var(--warning-500)' }} />
          Conquistas Desbloqueadas
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {milestones.filter(m => m.badge).map((milestone) => (
            <motion.div
              key={milestone.id}
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0 p-4 rounded-xl text-center min-w-[120px]"
              style={{ 
                background: 'linear-gradient(135deg, var(--warning-100) 0%, var(--purple-100) 100%)',
                border: '2px solid var(--warning-300)'
              }}
            >
              <span className="text-3xl">{milestone.badge?.split(' ')[0]}</span>
              <p className="text-sm font-medium mt-2" style={{ color: 'var(--text-primary)' }}>
                {milestone.badge?.split(' ').slice(1).join(' ')}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                {milestone.date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div>
        <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Calendar className="w-5 h-5" style={{ color: 'var(--primary-500)' }} />
          Linha do Tempo
        </h3>

        <div className="relative">
          {/* Timeline Line */}
          <div 
            className="absolute left-6 top-0 bottom-0 w-0.5"
            style={{ backgroundColor: 'var(--border-light)' }}
          />

          {/* Milestones */}
          <div className="space-y-4">
            {milestones.map((milestone, index) => {
              const colors = MILESTONE_COLORS[milestone.type];
              const Icon = MILESTONE_ICONS[milestone.type];
              const isExpanded = expandedMilestone === milestone.id;

              return (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative pl-14"
                >
                  {/* Timeline Dot */}
                  <div 
                    className="absolute left-4 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: colors.icon }}
                  >
                    <Icon className="w-3 h-3 text-white" />
                  </div>

                  {/* Content */}
                  <div
                    className="p-4 rounded-xl cursor-pointer transition-all"
                    style={{ 
                      backgroundColor: colors.bg, 
                      border: `1px solid ${colors.border}`
                    }}
                    onClick={() => setExpandedMilestone(isExpanded ? null : milestone.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>
                          {milestone.date.toLocaleDateString('pt-BR', { 
                            day: '2-digit', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </p>
                        <h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>
                          {milestone.title}
                        </h4>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                      ) : (
                        <ChevronDown className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                      )}
                    </div>

                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="mt-3 pt-3 border-t"
                        style={{ borderColor: colors.border }}
                      >
                        <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                          {milestone.description}
                        </p>

                        {milestone.metric && (
                          <div 
                            className="flex items-center gap-4 p-3 rounded-lg"
                            style={{ backgroundColor: 'var(--bg-primary)' }}
                          >
                            <div className="text-center">
                              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Antes</p>
                              <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
                                {milestone.metric.before}
                              </p>
                            </div>
                            <ArrowUpRight className="w-5 h-5" style={{ color: 'var(--success-500)' }} />
                            <div className="text-center">
                              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Depois</p>
                              <p className="font-bold" style={{ color: 'var(--success-600)' }}>
                                {milestone.metric.after}
                              </p>
                            </div>
                          </div>
                        )}

                        {milestone.badge && (
                          <div className="mt-3 flex items-center gap-2">
                            <Star className="w-4 h-4" style={{ color: 'var(--warning-500)' }} />
                            <span className="text-sm font-medium" style={{ color: 'var(--warning-600)' }}>
                              Badge: {milestone.badge}
                            </span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Share Card */}
      <div 
        className="p-4 rounded-xl flex items-center justify-between"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <div>
          <h4 className="font-bold" style={{ color: 'var(--text-primary)' }}>
            Compartilhe sua evolução!
          </h4>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Mostre para o mundo o quanto você cresceu
          </p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl"
          style={{ backgroundColor: 'var(--primary-500)', color: 'white' }}
        >
          <Share2 className="w-4 h-4" />
          Compartilhar
        </button>
      </div>
    </div>
  );
}







