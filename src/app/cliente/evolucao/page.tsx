'use client';

import React, { useEffect, useMemo, useState } from 'react';
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

// Dados reais são carregados via /api/client/evolution (sem mocks)

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

const CLIENT_JOIN_DATE = new Date('2024-06-15'); // fallback local (será substituído por clients.created_at quando disponível)

export default function EvolucaoPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [metrics, setMetrics] = useState<EvolutionMetric[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<EvolutionMetric>({
    label: 'Seguidores',
    icon: Users,
    startValue: 0,
    currentValue: 0,
    unit: '',
    color: '#4370d1',
    data: [],
  });
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);
  const [joinDate, setJoinDate] = useState<Date>(CLIENT_JOIN_DATE);
  const [loading, setLoading] = useState(true);

  const calculateGrowth = (start: number, current: number) => {
    if (!start) return 0;
    return Math.round(((current - start) / start) * 100);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const sinceLabel = useMemo(() => {
    return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' }).format(joinDate);
  }, [joinDate]);

  const startSeriesLabel = selectedMetric?.data?.[0]?.month ? `Início (${selectedMetric.data[0].month})` : 'Início';
  const endSeriesLabel = selectedMetric?.data?.length
    ? `Atual (${selectedMetric.data[selectedMetric.data.length - 1].month})`
    : 'Atual';

  const downloadJson = (filename: string, payload: any) => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/client/evolution?months=6', { cache: 'no-store' });
        const json = await res.json().catch(() => null);
        if (!res.ok || !json?.success) throw new Error(json?.error || 'Falha ao carregar evolução');

        if (json?.join_date) {
          const jd = new Date(String(json.join_date));
          if (!Number.isNaN(jd.getTime())) setJoinDate(jd);
        }

        const cfg = [
          { key: 'followers', label: 'Seguidores', icon: Users, unit: '', color: '#4370d1' },
          { key: 'reach_avg', label: 'Alcance Médio', icon: Eye, unit: '', color: '#22c55e' },
          { key: 'engagement_rate', label: 'Engajamento', icon: Heart, unit: '%', color: '#ef4444' },
          { key: 'profile_views', label: 'Visitas ao Perfil', icon: DollarSign, unit: '', color: '#f59e0b' },
        ];

        const apiMetrics = Array.isArray(json?.metrics) ? json.metrics : [];
        const mappedMetrics: EvolutionMetric[] = cfg
          .map((c: any) => {
            const m = apiMetrics.find((x: any) => String(x?.key) === c.key) || null;
            if (!m) return null;
            const series = Array.isArray(m?.series) ? m.series : [];
            return {
              label: c.label,
              icon: c.icon,
              startValue: Number(m?.startValue || 0),
              currentValue: Number(m?.currentValue || 0),
              unit: c.unit,
              color: c.color,
              data: series.map((p: any) => ({ month: String(p?.month || ''), value: Number(p?.value || 0) })),
            } as EvolutionMetric;
          })
          .filter(Boolean) as EvolutionMetric[];

        const apiMilestones = Array.isArray(json?.milestones) ? json.milestones : [];
        const mappedMilestones: Milestone[] = apiMilestones
          .map((m: any) => {
            const dt = new Date(String(m?.date || ''));
            return {
              id: String(m?.id || ''),
              date: Number.isNaN(dt.getTime()) ? new Date() : dt,
              title: String(m?.title || 'Atualização'),
              description: String(m?.description || ''),
              type: (m?.type || 'feature') as any,
              metric: m?.metric
                ? { label: String(m.metric.label || ''), before: String(m.metric.before || ''), after: String(m.metric.after || '') }
                : undefined,
              badge: m?.badge ? String(m.badge) : undefined,
            } as Milestone;
          })
          .filter((m: Milestone) => !!m.id)
          .sort((a: Milestone, b: Milestone) => b.date.getTime() - a.date.getTime());

        setMetrics(mappedMetrics);
        setSelectedMetric(mappedMetrics[0] || selectedMetric);
        setMilestones(mappedMilestones);
      } catch (e) {
        console.error('Falha ao carregar evolução:', e);
        setMetrics([]);
        setMilestones([]);
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          onClick={() =>
            downloadJson('minha-evolucao.json', {
              joinDate: joinDate.toISOString(),
              metrics,
              milestones: milestones.map((m) => ({ ...m, date: m.date.toISOString() })),
            })
          }
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
          <span className="text-white/80">Desde {sinceLabel}</span>
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

          {!loading && metrics.length === 0 && (
            <div className="col-span-2 md:col-span-4 p-4 rounded-xl bg-white/10">
              <p className="text-white/80 text-sm">
                Ainda não há métricas suficientes coletadas. Conecte suas redes e aguarde a coleta diária.
              </p>
            </div>
          )}
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
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{startSeriesLabel}</p>
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
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>{endSeriesLabel}</p>
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







