'use client';

/**
 * Valle 360 - Dashboard de Metas Inteligentes
 * Sistema gamificado de metas com IA preditiva
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import {
  Target, Trophy, Flame, Star, TrendingUp, TrendingDown,
  Users, Zap, Brain, RefreshCw, ChevronRight, Award,
  BarChart3, Calendar, Clock, CheckCircle, XCircle,
  Crown, Medal, Sparkles, ArrowUpRight, ArrowDownRight,
  Filter, Plus, Settings, Eye, Bell, Gift, X, Wand2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// =====================================================
// TIPOS
// =====================================================

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  sector: string;
  role: string;
}

interface Goal {
  id: string;
  collaborator: Collaborator;
  period: string;
  metrics: GoalMetric[];
  overall_progress: number;
  status: 'active' | 'completed' | 'failed' | 'exceeded';
  streak_days: number;
  points: number;
  ai_suggested: boolean;
  ai_confidence: number;
}

interface GoalMetric {
  name: string;
  label: string;
  target: number;
  current: number;
  unit: string;
  progress: number;
}

interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  points: number;
  unlocked?: boolean;
  unlockedAt?: string;
}

interface RankingEntry {
  position: number;
  collaborator: Collaborator;
  points: number;
  goalsCompleted: number;
  streak: number;
  change: number; // Posições ganhas/perdidas
}

// =====================================================
// MOCK DATA
// =====================================================

const mockCollaborators: Collaborator[] = [
  { id: '1', name: 'João Silva', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=joao', sector: 'designer', role: 'Web Designer' },
  { id: '2', name: 'Maria Santos', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria', sector: 'social_media', role: 'Social Media' },
  { id: '3', name: 'Pedro Costa', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pedro', sector: 'trafego', role: 'Gestor de Tráfego' },
  { id: '4', name: 'Ana Oliveira', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana', sector: 'designer', role: 'Designer Gráfico' },
  { id: '5', name: 'Lucas Mendes', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lucas', sector: 'video_maker', role: 'Video Maker' },
  { id: '6', name: 'Carla Souza', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carla', sector: 'comercial', role: 'Comercial' },
];

const mockGoals: Goal[] = [
  {
    id: 'g1',
    collaborator: mockCollaborators[0],
    period: 'Dezembro 2024',
    metrics: [
      { name: 'pecas', label: 'Peças Entregues', target: 20, current: 18, unit: 'peças', progress: 90 },
      { name: 'revisoes', label: 'Revisões', target: 2, current: 1.5, unit: 'média', progress: 100 },
      { name: 'satisfacao', label: 'Satisfação', target: 90, current: 92, unit: '%', progress: 102 },
    ],
    overall_progress: 95,
    status: 'active',
    streak_days: 12,
    points: 450,
    ai_suggested: true,
    ai_confidence: 87
  },
  {
    id: 'g2',
    collaborator: mockCollaborators[1],
    period: 'Dezembro 2024',
    metrics: [
      { name: 'posts', label: 'Posts', target: 30, current: 32, unit: 'posts', progress: 107 },
      { name: 'engajamento', label: 'Engajamento', target: 4.5, current: 5.2, unit: '%', progress: 116 },
      { name: 'alcance', label: 'Alcance', target: 50000, current: 62000, unit: 'pessoas', progress: 124 },
    ],
    overall_progress: 115,
    status: 'exceeded',
    streak_days: 28,
    points: 820,
    ai_suggested: true,
    ai_confidence: 92
  },
  {
    id: 'g3',
    collaborator: mockCollaborators[2],
    period: 'Dezembro 2024',
    metrics: [
      { name: 'roas', label: 'ROAS', target: 4, current: 3.2, unit: 'x', progress: 80 },
      { name: 'conversoes', label: 'Conversões', target: 100, current: 65, unit: 'conv', progress: 65 },
      { name: 'cpc', label: 'CPC', target: 1.5, current: 1.8, unit: 'R$', progress: 83 },
    ],
    overall_progress: 58,
    status: 'active',
    streak_days: 0,
    points: 180,
    ai_suggested: true,
    ai_confidence: 75
  },
  {
    id: 'g4',
    collaborator: mockCollaborators[5],
    period: 'Dezembro 2024',
    metrics: [
      { name: 'leads', label: 'Leads Qualificados', target: 15, current: 18, unit: 'leads', progress: 120 },
      { name: 'reunioes', label: 'Reuniões', target: 12, current: 14, unit: 'reuniões', progress: 117 },
      { name: 'fechamentos', label: 'Fechamentos', target: 4, current: 5, unit: 'contratos', progress: 125 },
    ],
    overall_progress: 120,
    status: 'exceeded',
    streak_days: 15,
    points: 650,
    ai_suggested: true,
    ai_confidence: 90
  },
];

const mockRanking: RankingEntry[] = [
  { position: 1, collaborator: mockCollaborators[1], points: 820, goalsCompleted: 3, streak: 28, change: 0 },
  { position: 2, collaborator: mockCollaborators[5], points: 650, goalsCompleted: 2, streak: 15, change: 1 },
  { position: 3, collaborator: mockCollaborators[0], points: 450, goalsCompleted: 2, streak: 12, change: -1 },
  { position: 4, collaborator: mockCollaborators[4], points: 380, goalsCompleted: 2, streak: 8, change: 0 },
  { position: 5, collaborator: mockCollaborators[3], points: 220, goalsCompleted: 1, streak: 3, change: 1 },
  { position: 6, collaborator: mockCollaborators[2], points: 180, goalsCompleted: 0, streak: 0, change: -1 },
];

const mockAchievements: Achievement[] = [
  { id: 'a1', code: 'streak_7', name: 'Semana Perfeita', description: '7 dias batendo meta', icon: 'flame', color: 'orange', points: 100, unlocked: true, unlockedAt: '2024-12-01' },
  { id: 'a2', code: 'streak_30', name: 'Mês Impecável', description: '30 dias consecutivos', icon: 'fire', color: 'red', points: 500, unlocked: false },
  { id: 'a3', code: 'exceed_20', name: 'Superação', description: 'Excedeu meta em 20%', icon: 'rocket', color: 'purple', points: 200, unlocked: true, unlockedAt: '2024-11-28' },
  { id: 'a4', code: 'top_performer', name: 'Top Performer', description: '1º no ranking do mês', icon: 'crown', color: 'gold', points: 400, unlocked: false },
  { id: 'a5', code: 'first_goal', name: 'Primeira Meta', description: 'Completou primeira meta', icon: 'flag', color: 'green', points: 50, unlocked: true, unlockedAt: '2024-10-15' },
];

// =====================================================
// COMPONENTES
// =====================================================

function GoalCard({ goal, onViewDetails }: { goal: Goal; onViewDetails: () => void }) {
  const statusConfig = {
    active: { color: 'bg-blue-500', text: 'Em Andamento', icon: Clock },
    completed: { color: 'bg-green-500', text: 'Concluída', icon: CheckCircle },
    failed: { color: 'bg-red-500', text: 'Não Atingida', icon: XCircle },
    exceeded: { color: 'bg-purple-500', text: 'Superada!', icon: Trophy }
  }[goal.status];

  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl shadow-sm border p-5 cursor-pointer hover:shadow-md transition-all"
      onClick={onViewDetails}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <img 
            src={goal.collaborator.avatar} 
            alt={goal.collaborator.name}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <h3 className="font-semibold text-gray-900">{goal.collaborator.name}</h3>
            <p className="text-xs text-gray-500">{goal.collaborator.role} • {goal.period}</p>
          </div>
        </div>
        <div className={cn("flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white", statusConfig.color)}>
          <StatusIcon className="w-3 h-3" />
          {statusConfig.text}
        </div>
      </div>

      {/* Progress Circle */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 -rotate-90">
            <circle
              cx="40" cy="40" r="36"
              className="fill-none stroke-gray-100"
              strokeWidth="8"
            />
            <circle
              cx="40" cy="40" r="36"
              className={cn(
                "fill-none transition-all duration-500",
                goal.overall_progress >= 100 ? "stroke-green-500" : 
                goal.overall_progress >= 70 ? "stroke-blue-500" : "stroke-red-500"
              )}
              strokeWidth="8"
              strokeDasharray={`${(goal.overall_progress / 100) * 226} 226`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-gray-900">{Math.round(goal.overall_progress)}%</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          {goal.metrics.slice(0, 3).map((metric, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-24 truncate">{metric.label}</span>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all",
                    metric.progress >= 100 ? "bg-green-500" : 
                    metric.progress >= 70 ? "bg-blue-500" : "bg-red-500"
                  )}
                  style={{ width: `${Math.min(100, metric.progress)}%` }}
                />
              </div>
              <span className="text-xs font-medium w-10 text-right">{metric.current}/{metric.target}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t">
        <div className="flex items-center gap-4">
          {goal.streak_days > 0 && (
            <div className="flex items-center gap-1 text-orange-500">
              <Flame className="w-4 h-4" />
              <span className="text-xs font-medium">{goal.streak_days} dias</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="w-4 h-4" />
            <span className="text-xs font-medium">{goal.points} pts</span>
          </div>
        </div>
        
        {goal.ai_suggested && (
          <div className="flex items-center gap-1 text-purple-500">
            <Brain className="w-4 h-4" />
            <span className="text-xs">{goal.ai_confidence}% confiança</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function RankingPodium({ ranking }: { ranking: RankingEntry[] }) {
  const top3 = ranking.slice(0, 3);
  const podiumOrder = [1, 0, 2]; // Segundo, Primeiro, Terceiro
  const heights = ['h-24', 'h-32', 'h-20'];
  const colors = ['bg-gray-300', 'bg-yellow-400', 'bg-amber-600'];
  const medals = ['🥈', '🥇', '🥉'];

  return (
    <div className="flex items-end justify-center gap-4 mb-6">
      {podiumOrder.map((orderIdx, displayIdx) => {
        const entry = top3[orderIdx];
        if (!entry) return null;
        
        return (
          <motion.div
            key={entry.collaborator.id}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: displayIdx * 0.1 }}
            className="flex flex-col items-center"
          >
            <img 
              src={entry.collaborator.avatar}
              alt={entry.collaborator.name}
              className={cn(
                "rounded-full border-4 mb-2",
                orderIdx === 0 ? "w-20 h-20 border-yellow-400" : "w-16 h-16 border-gray-300"
              )}
            />
            <span className="text-sm font-medium text-gray-900 text-center max-w-[100px] truncate">
              {entry.collaborator.name}
            </span>
            <span className="text-xs text-gray-500">{entry.points} pts</span>
            <div className={cn(
              "w-20 mt-2 rounded-t-lg flex items-center justify-center text-2xl",
              heights[displayIdx],
              colors[displayIdx]
            )}>
              {medals[displayIdx]}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function AchievementBadge({ achievement }: { achievement: Achievement }) {
  const icons: Record<string, React.ElementType> = {
    flame: Flame,
    fire: Flame,
    rocket: Zap,
    crown: Crown,
    flag: Target,
    star: Star,
    trophy: Trophy
  };
  
  const Icon = icons[achievement.icon] || Award;
  
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={cn(
        "relative p-4 rounded-xl border-2 text-center transition-all",
        achievement.unlocked 
          ? "border-yellow-400 bg-yellow-50" 
          : "border-gray-200 bg-gray-50 opacity-50"
      )}
    >
      {achievement.unlocked && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className={cn(
        "w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2",
        achievement.unlocked ? `bg-${achievement.color}-100` : "bg-gray-100"
      )}>
        <Icon className={cn(
          "w-6 h-6",
          achievement.unlocked ? `text-${achievement.color}-500` : "text-gray-400"
        )} />
      </div>
      
      <h4 className="font-semibold text-sm text-gray-900">{achievement.name}</h4>
      <p className="text-xs text-gray-500 mt-1">{achievement.description}</p>
      <p className="text-xs font-medium text-yellow-600 mt-2">+{achievement.points} pts</p>
    </motion.div>
  );
}

// =====================================================
// PÁGINA PRINCIPAL
// =====================================================

export default function MetasPage() {
  const [goals, setGoals] = useState<Goal[]>(mockGoals);
  const [ranking, setRanking] = useState<RankingEntry[]>(mockRanking);
  const [achievements, setAchievements] = useState<Achievement[]>(mockAchievements);
  const [selectedSector, setSelectedSector] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);

  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      return token ? { Authorization: `Bearer ${token}` } : {};
    } catch {
      return {};
    }
  };

  const mapDbGoalToUi = (row: any): Goal => {
    const name = row.collaborator_name || 'Colaborador';
    const sector = row.sector || 'designer';
    const collaborator: Collaborator = {
      id: row.collaborator_id,
      name,
      sector,
      role: sector,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    };

    const goalsObj = row.goals || {};
    const metrics: GoalMetric[] = Object.entries(goalsObj).map(([metricName, data]: any) => {
      const tmpl = metricTemplates[metricName] || { label: metricName, unit: data?.unit || '', defaultTarget: '0' };
      const target = Number(data?.target || 0);
      const current = Number(data?.current || 0);
      const progress = target > 0 ? Math.round((current / target) * 100) : 0;
      return {
        name: metricName,
        label: tmpl.label,
        target,
        current,
        unit: data?.unit || tmpl.unit,
        progress,
      };
    });

    const period = row.period_start ? new Date(row.period_start).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : 'Período';

    return {
      id: row.id,
      collaborator,
      period,
      metrics,
      overall_progress: Math.round(Number(row.overall_progress || 0)),
      status: row.status || 'active',
      streak_days: row.streak_days || 0,
      points: row.points_earned || 0,
      ai_suggested: !!row.ai_suggested,
      ai_confidence: Math.round(Number(row.ai_confidence || 0)),
    };
  };

  const refreshGoalsFromApi = async () => {
    const authHeaders = await getAuthHeaders();
    const res = await fetch('/api/goals', { headers: authHeaders });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) return;
    const rows = Array.isArray(json.data) ? json.data : [];
    if (rows.length === 0) return;

    const mapped = rows.map(mapDbGoalToUi);
    setGoals(mapped);

    // Ranking simples baseado em pontos
    const rankingComputed: RankingEntry[] = mapped
      .slice()
      .sort((a: Goal, b: Goal) => (b.points || 0) - (a.points || 0))
      .slice(0, 10)
      .map((g: Goal, idx: number) => ({
        position: idx + 1,
        collaborator: g.collaborator,
        points: g.points || 0,
        goalsCompleted: g.status === 'completed' || g.status === 'exceeded' ? 1 : 0,
        streak: g.streak_days || 0,
        change: 0,
      }));
    if (rankingComputed.length > 0) setRanking(rankingComputed);
  };

  useEffect(() => {
    // Se houver dados reais no banco, preferimos mostrar.
    refreshGoalsFromApi().catch(() => {});
  }, []);
  
  // Formulário de nova meta
  const [goalForm, setGoalForm] = useState({
    collaborator_id: '',
    period: '',
    type: '',
    metrics: [] as { name: string; target: string; unit: string }[],
    use_ai: false,
  });
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGeneratedMetrics, setAiGeneratedMetrics] = useState<any[]>([]);

  const goalTypes = [
    { id: 'pecas', label: 'Entregas', icon: '📦', metrics: ['pecas', 'revisoes', 'satisfacao'] },
    { id: 'engajamento', label: 'Engajamento', icon: '📱', metrics: ['posts', 'engajamento', 'alcance'] },
    { id: 'vendas', label: 'Vendas', icon: '💰', metrics: ['leads', 'reunioes', 'fechamentos'] },
    { id: 'trafego', label: 'Tráfego', icon: '📈', metrics: ['roas', 'conversoes', 'cpc'] },
    { id: 'videos', label: 'Vídeos', icon: '🎬', metrics: ['videos', 'views', 'retencao'] },
  ];

  const metricTemplates: Record<string, { label: string; unit: string; defaultTarget: string }> = {
    pecas: { label: 'Peças Entregues', unit: 'peças', defaultTarget: '20' },
    revisoes: { label: 'Revisões (máx)', unit: 'média', defaultTarget: '2' },
    satisfacao: { label: 'Satisfação', unit: '%', defaultTarget: '90' },
    posts: { label: 'Posts', unit: 'posts', defaultTarget: '30' },
    engajamento: { label: 'Engajamento', unit: '%', defaultTarget: '4.5' },
    alcance: { label: 'Alcance', unit: 'pessoas', defaultTarget: '50000' },
    leads: { label: 'Leads Qualificados', unit: 'leads', defaultTarget: '15' },
    reunioes: { label: 'Reuniões', unit: 'reuniões', defaultTarget: '12' },
    fechamentos: { label: 'Fechamentos', unit: 'contratos', defaultTarget: '4' },
    roas: { label: 'ROAS', unit: 'x', defaultTarget: '4' },
    conversoes: { label: 'Conversões', unit: 'conv', defaultTarget: '100' },
    cpc: { label: 'CPC (máx)', unit: 'R$', defaultTarget: '1.5' },
    videos: { label: 'Vídeos Produzidos', unit: 'vídeos', defaultTarget: '8' },
    views: { label: 'Visualizações', unit: 'views', defaultTarget: '100000' },
    retencao: { label: 'Retenção Média', unit: '%', defaultTarget: '60' },
  };

  const periods = [
    { id: 'dezembro_2024', label: 'Dezembro 2024' },
    { id: 'janeiro_2025', label: 'Janeiro 2025' },
    { id: 'q1_2025', label: '1º Trimestre 2025' },
    { id: 'q2_2025', label: '2º Trimestre 2025' },
  ];

  const sectors = [
    { id: 'all', label: 'Todos' },
    { id: 'social_media', label: 'Social Media' },
    { id: 'designer', label: 'Design' },
    { id: 'trafego', label: 'Tráfego' },
    { id: 'video_maker', label: 'Vídeo' },
    { id: 'comercial', label: 'Comercial' },
  ];

  const filteredGoals = selectedSector === 'all' 
    ? goals 
    : goals.filter(g => g.collaborator.sector === selectedSector);

  const stats = {
    totalGoals: goals.length,
    completed: goals.filter(g => g.status === 'completed' || g.status === 'exceeded').length,
    avgProgress: Math.round(goals.reduce((a, b) => a + b.overall_progress, 0) / goals.length),
    totalPoints: ranking.reduce((a, b) => a + b.points, 0)
  };

  const handleGenerateGoals = async () => {
    setIsGenerating(true);
    toast.loading('Gerando metas com IA para todos os colaboradores...');
    try {
      const authHeaders = await getAuthHeaders();
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ action: 'generate_all', period_type: 'monthly' })
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Erro ao gerar metas');
      }

      toast.dismiss();
      toast.success(`Metas geradas com sucesso! ${data.generated || 0} colaboradores atualizados.`);
      await refreshGoalsFromApi();
    } catch (err: any) {
      toast.dismiss();
      toast.error(err?.message || 'Erro ao gerar metas');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewDetails = (goalId: string) => {
    toast.info('Abrindo detalhes da meta...');
    // Navegar para página de detalhes
  };

  // Handler para gerar métricas com IA
  const handleGenerateMetricsWithAI = async () => {
    if (!goalForm.collaborator_id) {
      toast.error('Selecione um colaborador primeiro');
      return;
    }
    
    setIsGeneratingAI(true);
    
    // Simular geração de métricas pela IA
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const collaborator = mockCollaborators.find(c => c.id === goalForm.collaborator_id);
    const sectorMetrics = {
      designer: ['pecas', 'revisoes', 'satisfacao'],
      social_media: ['posts', 'engajamento', 'alcance'],
      trafego: ['roas', 'conversoes', 'cpc'],
      comercial: ['leads', 'reunioes', 'fechamentos'],
      video_maker: ['videos', 'views', 'retencao'],
    }[collaborator?.sector || 'designer'] || ['pecas', 'revisoes', 'satisfacao'];
    
    // Gerar metas baseadas em histórico simulado
    const generatedMetrics = sectorMetrics.map(metric => {
      const template = metricTemplates[metric];
      const baseTarget = parseFloat(template.defaultTarget);
      // Adiciona variação de 10-20% baseada no "histórico"
      const aiTarget = Math.round(baseTarget * (1 + Math.random() * 0.2));
      return {
        name: metric,
        label: template.label,
        target: aiTarget.toString(),
        unit: template.unit,
        aiConfidence: Math.floor(75 + Math.random() * 20), // 75-95% confiança
      };
    });
    
    setAiGeneratedMetrics(generatedMetrics);
    setGoalForm(prev => ({
      ...prev,
      use_ai: true,
      metrics: generatedMetrics.map(m => ({
        name: m.name,
        target: m.target,
        unit: m.unit,
      })),
    }));
    
    setIsGeneratingAI(false);
    toast.success('Métricas geradas com base no histórico do colaborador!');
  };

  // Handler para criar nova meta
  const handleCreateGoal = () => {
    if (!goalForm.collaborator_id || !goalForm.period) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    if (goalForm.metrics.length === 0) {
      toast.error('Adicione pelo menos uma métrica');
      return;
    }

    const collaborator = mockCollaborators.find(c => c.id === goalForm.collaborator_id);
    if (!collaborator) return;

    const newGoal: Goal = {
      id: `g${Date.now()}`,
      collaborator,
      period: periods.find(p => p.id === goalForm.period)?.label || goalForm.period,
      metrics: goalForm.metrics.map((m, idx) => ({
        name: m.name,
        label: metricTemplates[m.name]?.label || m.name,
        target: parseFloat(m.target),
        current: 0,
        unit: m.unit,
        progress: 0,
      })),
      overall_progress: 0,
      status: 'active',
      streak_days: 0,
      points: 0,
      ai_suggested: goalForm.use_ai,
      ai_confidence: goalForm.use_ai ? 85 : 0,
    };

    setGoals(prev => [newGoal, ...prev]);
    setShowNewGoalModal(false);
    setGoalForm({
      collaborator_id: '',
      period: '',
      type: '',
      metrics: [],
      use_ai: false,
    });
    setAiGeneratedMetrics([]);
    toast.success(`Meta criada para ${collaborator.name}!`);
  };

  // Handler para selecionar tipo de meta
  const handleSelectGoalType = (typeId: string) => {
    const type = goalTypes.find(t => t.id === typeId);
    if (!type) return;

    setGoalForm(prev => ({
      ...prev,
      type: typeId,
      metrics: type.metrics.map(metric => ({
        name: metric,
        target: metricTemplates[metric]?.defaultTarget || '0',
        unit: metricTemplates[metric]?.unit || '',
      })),
    }));
    setAiGeneratedMetrics([]);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Target className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Metas Inteligentes</h1>
              <p className="text-sm text-gray-500">Sistema gamificado com IA preditiva</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNewGoalModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nova Meta
            </button>
            <button
              onClick={handleGenerateGoals}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <Brain className={cn("w-4 h-4", isGenerating && "animate-pulse")} />
              Gerar Metas IA
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm border"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Metas Ativas</span>
              <Target className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalGoals}</p>
            <p className="text-xs text-green-600 mt-1">+2 este mês</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm border"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Concluídas</span>
              <Trophy className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-xs text-gray-500 mt-1">{Math.round((stats.completed / stats.totalGoals) * 100)}% do total</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-sm border"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Progresso Médio</span>
              <BarChart3 className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.avgProgress}%</p>
            <p className="text-xs text-green-600 mt-1">+8% vs mês anterior</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-xl shadow-sm border"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Pontos Totais</span>
              <Star className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-orange-600">{stats.totalPoints.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">equipe completa</p>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-6">
          
          {/* Goals List */}
          <div className="col-span-2 space-y-4">
            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              {sectors.map(sector => (
                <button
                  key={sector.id}
                  onClick={() => setSelectedSector(sector.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    selectedSector === sector.id
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-500 hover:bg-gray-100"
                  )}
                >
                  {sector.label}
                </button>
              ))}
            </div>

            {/* Goals Grid */}
            <div className="grid grid-cols-2 gap-4">
              {filteredGoals.map(goal => (
                <GoalCard 
                  key={goal.id} 
                  goal={goal} 
                  onViewDetails={() => handleViewDetails(goal.id)}
                />
              ))}
            </div>

            {filteredGoals.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border">
                <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Nenhuma meta encontrada para este setor</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Ranking */}
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  Ranking do Mês
                </h2>
                <button className="text-xs text-indigo-600 hover:underline">Ver todos</button>
              </div>

              <RankingPodium ranking={ranking} />

              <div className="space-y-2 mt-4">
                {ranking.slice(3).map(entry => (
                  <div key={entry.collaborator.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                    <span className="text-sm font-bold text-gray-400 w-6">{entry.position}º</span>
                    <img src={entry.collaborator.avatar} alt="" className="w-8 h-8 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{entry.collaborator.name}</p>
                      <p className="text-xs text-gray-500">{entry.points} pts</p>
                    </div>
                    {entry.change !== 0 && (
                      <div className={cn(
                        "flex items-center gap-1 text-xs",
                        entry.change > 0 ? "text-green-500" : "text-red-500"
                      )}>
                        {entry.change > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(entry.change)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-500" />
                  Conquistas
                </h2>
                <span className="text-xs text-gray-500">
                  {achievements.filter(a => a.unlocked).length}/{achievements.length}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {achievements.slice(0, 4).map(achievement => (
                  <AchievementBadge key={achievement.id} achievement={achievement} />
                ))}
              </div>

              <button className="w-full mt-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                Ver todas as conquistas
              </button>
            </div>

            {/* Val Coach */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-bold">Dica da Val</h3>
              </div>
              <p className="text-sm text-white/90 leading-relaxed">
                A equipe está 15% acima da média de metas! 🚀 
                O setor de <strong>Social Media</strong> está se destacando. 
                Considere usar estratégias similares em outras áreas.
              </p>
              <button className="mt-4 w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
                Ver Mais Insights
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Nova Meta */}
      <AnimatePresence>
        {showNewGoalModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowNewGoalModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-indigo-100">
                      <Target className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Nova Meta</h2>
                      <p className="text-sm text-gray-500">Configure a meta para o colaborador</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowNewGoalModal(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="p-6 overflow-auto max-h-[60vh] space-y-6">
                {/* Colaborador */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Colaborador *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {mockCollaborators.map((collab) => (
                      <button
                        key={collab.id}
                        onClick={() => setGoalForm(prev => ({ ...prev, collaborator_id: collab.id }))}
                        className={cn(
                          "p-3 rounded-xl border text-left transition-all flex items-center gap-3",
                          goalForm.collaborator_id === collab.id
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <img src={collab.avatar} alt="" className="w-10 h-10 rounded-full" />
                        <div>
                          <p className="text-sm font-medium">{collab.name}</p>
                          <p className="text-xs text-gray-500">{collab.role}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Período */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Período *
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {periods.map((period) => (
                      <button
                        key={period.id}
                        onClick={() => setGoalForm(prev => ({ ...prev, period: period.id }))}
                        className={cn(
                          "p-3 rounded-xl border text-center transition-all",
                          goalForm.period === period.id
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <Calendar className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                        <span className="text-xs font-medium">{period.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tipo de Meta ou Gerar com IA */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Tipo de Meta
                    </label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateMetricsWithAI}
                      disabled={!goalForm.collaborator_id || isGeneratingAI}
                      className="text-purple-600 border-purple-200 hover:bg-purple-50"
                    >
                      {isGeneratingAI ? (
                        <>
                          <div className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mr-2" />
                          Gerando...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4 mr-2" />
                          Gerar com IA
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {!goalForm.use_ai && (
                    <div className="grid grid-cols-5 gap-2">
                      {goalTypes.map((type) => (
                        <button
                          key={type.id}
                          onClick={() => handleSelectGoalType(type.id)}
                          className={cn(
                            "p-3 rounded-xl border text-center transition-all",
                            goalForm.type === type.id
                              ? "border-indigo-500 bg-indigo-50"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          <span className="text-2xl block mb-1">{type.icon}</span>
                          <span className="text-xs font-medium">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Métricas Geradas por IA */}
                {goalForm.use_ai && aiGeneratedMetrics.length > 0 && (
                  <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-purple-900">Métricas Sugeridas pela IA</span>
                      <Badge className="bg-purple-100 text-purple-700 text-xs">Baseado no histórico</Badge>
                    </div>
                    <div className="space-y-3">
                      {aiGeneratedMetrics.map((metric, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-3 bg-white rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{metric.label}</p>
                            <p className="text-xs text-gray-500">Confiança: {metric.aiConfidence}%</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={metric.target}
                              onChange={(e) => {
                                const newMetrics = [...aiGeneratedMetrics];
                                newMetrics[idx].target = e.target.value;
                                setAiGeneratedMetrics(newMetrics);
                                setGoalForm(prev => ({
                                  ...prev,
                                  metrics: newMetrics.map(m => ({
                                    name: m.name,
                                    target: m.target,
                                    unit: m.unit,
                                  })),
                                }));
                              }}
                              className="w-24 p-2 border rounded-lg text-center text-sm"
                            />
                            <span className="text-sm text-gray-500">{metric.unit}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Métricas Manuais */}
                {!goalForm.use_ai && goalForm.metrics.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Definir Valores
                    </label>
                    <div className="space-y-3">
                      {goalForm.metrics.map((metric, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {metricTemplates[metric.name]?.label || metric.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={metric.target}
                              onChange={(e) => {
                                const newMetrics = [...goalForm.metrics];
                                newMetrics[idx].target = e.target.value;
                                setGoalForm(prev => ({ ...prev, metrics: newMetrics }));
                              }}
                              className="w-24 p-2 border rounded-lg text-center text-sm"
                            />
                            <span className="text-sm text-gray-500">{metric.unit}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowNewGoalModal(false);
                    setGoalForm({ collaborator_id: '', period: '', type: '', metrics: [], use_ai: false });
                    setAiGeneratedMetrics([]);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  onClick={handleCreateGoal}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Criar Meta
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

