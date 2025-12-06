'use client';

/**
 * Valle 360 - Performance Completa do Colaborador
 * Página detalhada com histórico, gráficos e análises
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft, Brain, TrendingUp, TrendingDown, Star, Calendar,
  Award, Target, BarChart3, LineChart, Clock, CheckCircle,
  XCircle, AlertTriangle, MessageSquare, FileText, DollarSign,
  GraduationCap, BadgeDollarSign, RefreshCw, ChevronRight,
  Activity, Zap, Heart, Users, Briefcase, Mail, Phone,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =====================================================
// TIPOS
// =====================================================

interface HistoricoAvaliacao {
  data: string;
  scores: {
    desempenho: number;
    engajamento: number;
    entregas: number;
    comunicacao: number;
    lideranca: number;
    inovacao: number;
  };
  feedback: string;
  avaliador: string;
}

interface Colaborador {
  id: string;
  nome: string;
  avatar: string;
  email: string;
  telefone: string;
  cargo: string;
  departamento: string;
  salarioAtual: number;
  dataAdmissao: string;
  scores: {
    desempenho: number;
    engajamento: number;
    entregas: number;
    comunicacao: number;
    lideranca: number;
    inovacao: number;
  };
  tendencia: 'up' | 'down' | 'stable';
  ultimaAvaliacao: string;
  alertas: string[];
  potencial: 'alto' | 'medio' | 'baixo';
  historico: HistoricoAvaliacao[];
  conquistas: string[];
  treinamentos: { nome: string; data: string; status: 'concluido' | 'em_andamento' | 'pendente' }[];
  metas: { titulo: string; progresso: number; prazo: string }[];
}

// =====================================================
// MOCK DATA
// =====================================================

const mockColaboradores: Record<string, Colaborador> = {
  '1': {
    id: '1',
    nome: 'João Silva',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=joao',
    email: 'joao.silva@valle360.com',
    telefone: '(11) 99999-1234',
    cargo: 'Web Designer',
    departamento: 'Design',
    salarioAtual: 4500,
    dataAdmissao: '2023-03-15',
    scores: { desempenho: 92, engajamento: 88, entregas: 95, comunicacao: 85, lideranca: 70, inovacao: 90 },
    tendencia: 'up',
    ultimaAvaliacao: '2024-11-15',
    alertas: [],
    potencial: 'alto',
    historico: [
      { data: '2024-11', scores: { desempenho: 92, engajamento: 88, entregas: 95, comunicacao: 85, lideranca: 70, inovacao: 90 }, feedback: 'Excelente evolução no trimestre', avaliador: 'Maria Santos' },
      { data: '2024-08', scores: { desempenho: 85, engajamento: 82, entregas: 88, comunicacao: 80, lideranca: 65, inovacao: 85 }, feedback: 'Bom desempenho, melhorar liderança', avaliador: 'Maria Santos' },
      { data: '2024-05', scores: { desempenho: 78, engajamento: 75, entregas: 82, comunicacao: 75, lideranca: 60, inovacao: 80 }, feedback: 'Período de adaptação concluído', avaliador: 'Carlos Oliveira' },
      { data: '2024-02', scores: { desempenho: 70, engajamento: 70, entregas: 75, comunicacao: 70, lideranca: 55, inovacao: 72 }, feedback: 'Início promissor', avaliador: 'Carlos Oliveira' },
    ],
    conquistas: ['Designer do Mês - Out/24', 'Projeto Destaque - Black Friday', '100% de entregas no prazo'],
    treinamentos: [
      { nome: 'UX Design Avançado', data: '2024-09', status: 'concluido' },
      { nome: 'Gestão de Projetos', data: '2024-11', status: 'em_andamento' },
      { nome: 'Liderança Criativa', data: '2025-01', status: 'pendente' },
    ],
    metas: [
      { titulo: 'Reduzir tempo de entrega em 20%', progresso: 75, prazo: '2024-12-31' },
      { titulo: 'Certificação UX/UI', progresso: 60, prazo: '2025-03-31' },
      { titulo: 'Mentoria de estagiário', progresso: 100, prazo: '2024-12-15' },
    ]
  },
  '2': {
    id: '2',
    nome: 'Maria Santos',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
    email: 'maria.santos@valle360.com',
    telefone: '(11) 99999-5678',
    cargo: 'Social Media',
    departamento: 'Marketing',
    salarioAtual: 3800,
    dataAdmissao: '2022-08-10',
    scores: { desempenho: 95, engajamento: 98, entregas: 92, comunicacao: 95, lideranca: 82, inovacao: 88 },
    tendencia: 'up',
    ultimaAvaliacao: '2024-11-20',
    alertas: [],
    potencial: 'alto',
    historico: [
      { data: '2024-11', scores: { desempenho: 95, engajamento: 98, entregas: 92, comunicacao: 95, lideranca: 82, inovacao: 88 }, feedback: 'Performance excepcional', avaliador: 'Guilherme Valle' },
      { data: '2024-08', scores: { desempenho: 90, engajamento: 95, entregas: 88, comunicacao: 92, lideranca: 78, inovacao: 85 }, feedback: 'Excelente comunicação', avaliador: 'Guilherme Valle' },
    ],
    conquistas: ['Colaboradora do Ano 2024', 'Campanha Viral - 1M views', 'NPS 100 dos clientes'],
    treinamentos: [
      { nome: 'Marketing de Influência', data: '2024-10', status: 'concluido' },
      { nome: 'Análise de Dados', data: '2024-12', status: 'em_andamento' },
    ],
    metas: [
      { titulo: 'Aumentar engajamento em 30%', progresso: 90, prazo: '2024-12-31' },
      { titulo: 'Liderar equipe de 3 pessoas', progresso: 100, prazo: '2024-11-30' },
    ]
  },
  '3': {
    id: '3',
    nome: 'Pedro Costa',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pedro',
    email: 'pedro.costa@valle360.com',
    telefone: '(11) 99999-9012',
    cargo: 'Gestor de Tráfego',
    departamento: 'Performance',
    salarioAtual: 5200,
    dataAdmissao: '2023-01-20',
    scores: { desempenho: 58, engajamento: 45, entregas: 62, comunicacao: 55, lideranca: 40, inovacao: 50 },
    tendencia: 'down',
    ultimaAvaliacao: '2024-10-30',
    alertas: ['Baixo engajamento', 'Entregas atrasadas', 'Faltas frequentes'],
    potencial: 'baixo',
    historico: [
      { data: '2024-10', scores: { desempenho: 58, engajamento: 45, entregas: 62, comunicacao: 55, lideranca: 40, inovacao: 50 }, feedback: 'Necessita melhoria urgente', avaliador: 'Guilherme Valle' },
      { data: '2024-07', scores: { desempenho: 72, engajamento: 65, entregas: 75, comunicacao: 68, lideranca: 55, inovacao: 62 }, feedback: 'Queda de performance notada', avaliador: 'Guilherme Valle' },
      { data: '2024-04', scores: { desempenho: 80, engajamento: 78, entregas: 82, comunicacao: 75, lideranca: 60, inovacao: 70 }, feedback: 'Bom desempenho inicial', avaliador: 'Carlos Oliveira' },
    ],
    conquistas: ['ROAS 5x - Cliente XYZ'],
    treinamentos: [
      { nome: 'Google Ads Avançado', data: '2024-06', status: 'concluido' },
      { nome: 'Gestão de Tempo', data: '2024-11', status: 'pendente' },
    ],
    metas: [
      { titulo: 'Melhorar taxa de conversão', progresso: 30, prazo: '2024-12-31' },
      { titulo: 'Zero atrasos no mês', progresso: 50, prazo: '2024-12-31' },
    ]
  },
  '4': {
    id: '4',
    nome: 'Ana Oliveira',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana',
    email: 'ana.oliveira@valle360.com',
    telefone: '(11) 99999-3456',
    cargo: 'Designer Gráfico',
    departamento: 'Design',
    salarioAtual: 4000,
    dataAdmissao: '2023-06-01',
    scores: { desempenho: 78, engajamento: 82, entregas: 80, comunicacao: 75, lideranca: 65, inovacao: 85 },
    tendencia: 'stable',
    ultimaAvaliacao: '2024-11-10',
    alertas: ['Necessita treinamento em gestão de tempo'],
    potencial: 'medio',
    historico: [
      { data: '2024-11', scores: { desempenho: 78, engajamento: 82, entregas: 80, comunicacao: 75, lideranca: 65, inovacao: 85 }, feedback: 'Criatividade destacada', avaliador: 'Maria Santos' },
    ],
    conquistas: ['Identidade Visual Aprovada - 1ª tentativa'],
    treinamentos: [
      { nome: 'Adobe Creative Suite', data: '2024-08', status: 'concluido' },
    ],
    metas: [
      { titulo: 'Dominar Figma', progresso: 70, prazo: '2025-01-31' },
    ]
  },
  '5': {
    id: '5',
    nome: 'Lucas Mendes',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lucas',
    email: 'lucas.mendes@valle360.com',
    telefone: '(11) 99999-7890',
    cargo: 'Video Maker',
    departamento: 'Criação',
    salarioAtual: 4200,
    dataAdmissao: '2023-09-15',
    scores: { desempenho: 88, engajamento: 85, entregas: 90, comunicacao: 80, lideranca: 60, inovacao: 92 },
    tendencia: 'up',
    ultimaAvaliacao: '2024-11-25',
    alertas: [],
    potencial: 'alto',
    historico: [
      { data: '2024-11', scores: { desempenho: 88, engajamento: 85, entregas: 90, comunicacao: 80, lideranca: 60, inovacao: 92 }, feedback: 'Vídeos de alta qualidade', avaliador: 'Guilherme Valle' },
    ],
    conquistas: ['Vídeo Viral - 500k views', 'Edição premiada'],
    treinamentos: [
      { nome: 'After Effects Pro', data: '2024-10', status: 'concluido' },
      { nome: 'Direção de Vídeo', data: '2025-02', status: 'pendente' },
    ],
    metas: [
      { titulo: 'Produzir 20 vídeos/mês', progresso: 85, prazo: '2024-12-31' },
    ]
  }
};

// =====================================================
// COMPONENTES AUXILIARES
// =====================================================

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-28">{label}</span>
      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn("h-full rounded-full", color)}
        />
      </div>
      <span className={cn(
        "text-sm font-bold w-12 text-right",
        value >= 85 ? 'text-green-600' : value >= 70 ? 'text-yellow-600' : 'text-red-600'
      )}>
        {value}%
      </span>
    </div>
  );
}

function HistoryChart({ historico }: { historico: HistoricoAvaliacao[] }) {
  const reversedHistory = [...historico].reverse();
  const maxScore = 100;
  
  return (
    <div className="relative h-48 flex items-end gap-2 px-4">
      {reversedHistory.map((h, idx) => {
        const media = Math.round(Object.values(h.scores).reduce((a, b) => a + b, 0) / 6);
        const height = (media / maxScore) * 100;
        
        return (
          <motion.div
            key={idx}
            initial={{ height: 0 }}
            animate={{ height: `${height}%` }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="flex-1 relative group"
          >
            <div 
              className={cn(
                "w-full rounded-t-lg transition-all",
                media >= 85 ? 'bg-green-500' : media >= 70 ? 'bg-yellow-500' : 'bg-red-500'
              )}
              style={{ height: '100%' }}
            />
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500">
              {h.data}
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded-lg p-2 whitespace-nowrap z-10">
              <p className="font-bold">{media}% média</p>
              <p className="text-gray-300">{h.feedback}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// =====================================================
// PÁGINA PRINCIPAL
// =====================================================

export default function ColaboradorPerformancePage() {
  const params = useParams();
  const router = useRouter();
  const [colaborador, setColaborador] = useState<Colaborador | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'historico' | 'metas' | 'treinamentos'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const id = params.id as string;
    const col = mockColaboradores[id];
    
    if (col) {
      setColaborador(col);
    } else {
      toast.error('Colaborador não encontrado');
      router.push('/admin/rh/inteligencia');
    }
    
    setIsLoading(false);
  }, [params.id, router]);

  if (isLoading || !colaborador) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const mediaGeral = Math.round(Object.values(colaborador.scores).reduce((a, b) => a + b, 0) / 6);
  const tempoEmpresa = (() => {
    const diff = new Date().getTime() - new Date(colaborador.dataAdmissao).getTime();
    const meses = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    if (meses < 12) return `${meses} meses`;
    const anos = Math.floor(meses / 12);
    const mesesRestantes = meses % 12;
    return `${anos} ano${anos > 1 ? 's' : ''}${mesesRestantes > 0 ? ` e ${mesesRestantes} meses` : ''}`;
  })();

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex-1 flex items-center gap-4">
            <img 
              src={colaborador.avatar} 
              alt={colaborador.nome}
              className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{colaborador.nome}</h1>
                {colaborador.tendencia === 'up' && <ArrowUpRight className="w-5 h-5 text-green-500" />}
                {colaborador.tendencia === 'down' && <ArrowDownRight className="w-5 h-5 text-red-500" />}
              </div>
              <p className="text-gray-500">{colaborador.cargo} • {colaborador.departamento}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => toast.info('Abrindo email...')}
              className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              <Mail className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => toast.info('Ligando...')}
              className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              <Phone className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => toast.info('Abrindo chat...')}
              className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              <MessageSquare className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-5 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 rounded-xl shadow-sm"
          >
            <p className="text-xs text-gray-500 mb-1">Score Geral</p>
            <p className={cn(
              "text-3xl font-bold",
              mediaGeral >= 85 ? 'text-green-600' : mediaGeral >= 70 ? 'text-yellow-600' : 'text-red-600'
            )}>
              {mediaGeral}%
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-4 rounded-xl shadow-sm"
          >
            <p className="text-xs text-gray-500 mb-1">Tempo de Empresa</p>
            <p className="text-xl font-bold text-gray-900">{tempoEmpresa}</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-4 rounded-xl shadow-sm"
          >
            <p className="text-xs text-gray-500 mb-1">Salário Atual</p>
            <p className="text-xl font-bold text-gray-900">R$ {colaborador.salarioAtual.toLocaleString('pt-BR')}</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-4 rounded-xl shadow-sm"
          >
            <p className="text-xs text-gray-500 mb-1">Potencial</p>
            <p className={cn(
              "text-xl font-bold capitalize",
              colaborador.potencial === 'alto' ? 'text-green-600' : 
              colaborador.potencial === 'medio' ? 'text-yellow-600' : 'text-red-600'
            )}>
              {colaborador.potencial}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-4 rounded-xl shadow-sm"
          >
            <p className="text-xs text-gray-500 mb-1">Conquistas</p>
            <p className="text-xl font-bold text-purple-600">{colaborador.conquistas.length}</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {[
            { id: 'overview', label: 'Visão Geral', icon: Activity },
            { id: 'historico', label: 'Histórico', icon: LineChart },
            { id: 'metas', label: 'Metas', icon: Target },
            { id: 'treinamentos', label: 'Treinamentos', icon: GraduationCap },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors border-b-2 -mb-px",
                activeTab === tab.id 
                  ? 'border-indigo-500 text-indigo-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 gap-6">
            {/* Scores Detalhados */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                Avaliação Detalhada
              </h3>
              <div className="space-y-4">
                <ScoreBar label="Desempenho" value={colaborador.scores.desempenho} color="bg-blue-500" />
                <ScoreBar label="Engajamento" value={colaborador.scores.engajamento} color="bg-green-500" />
                <ScoreBar label="Entregas" value={colaborador.scores.entregas} color="bg-purple-500" />
                <ScoreBar label="Comunicação" value={colaborador.scores.comunicacao} color="bg-yellow-500" />
                <ScoreBar label="Liderança" value={colaborador.scores.lideranca} color="bg-red-500" />
                <ScoreBar label="Inovação" value={colaborador.scores.inovacao} color="bg-pink-500" />
              </div>
            </div>

            {/* Conquistas e Alertas */}
            <div className="space-y-6">
              {/* Conquistas */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Conquistas
                </h3>
                <div className="space-y-2">
                  {colaborador.conquistas.map((conquista, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-700">{conquista}</span>
                    </div>
                  ))}
                  {colaborador.conquistas.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">Nenhuma conquista registrada</p>
                  )}
                </div>
              </div>

              {/* Alertas */}
              {colaborador.alertas.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Alertas
                  </h3>
                  <div className="space-y-2">
                    {colaborador.alertas.map((alerta, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-red-700">{alerta}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'historico' && (
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <LineChart className="w-5 h-5 text-indigo-500" />
              Evolução de Performance
            </h3>
            
            <HistoryChart historico={colaborador.historico} />
            
            <div className="mt-12 space-y-4">
              <h4 className="font-semibold text-gray-700">Feedbacks Anteriores</h4>
              {colaborador.historico.map((h, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{h.data}</span>
                    <span className="text-sm text-gray-500">Por: {h.avaliador}</span>
                  </div>
                  <p className="text-sm text-gray-600">{h.feedback}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Média: {Math.round(Object.values(h.scores).reduce((a, b) => a + b, 0) / 6)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'metas' && (
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-500" />
              Metas e Objetivos
            </h3>
            
            <div className="space-y-4">
              {colaborador.metas.map((meta, idx) => (
                <div key={idx} className="p-4 border rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{meta.titulo}</h4>
                    <span className={cn(
                      "text-sm font-bold",
                      meta.progresso === 100 ? 'text-green-600' : 'text-blue-600'
                    )}>
                      {meta.progresso}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${meta.progresso}%` }}
                      className={cn(
                        "h-full rounded-full",
                        meta.progresso === 100 ? 'bg-green-500' : 'bg-blue-500'
                      )}
                    />
                  </div>
                  <p className="text-xs text-gray-500">Prazo: {new Date(meta.prazo).toLocaleDateString('pt-BR')}</p>
                </div>
              ))}
              
              {colaborador.metas.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">Nenhuma meta definida</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'treinamentos' && (
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-500" />
              Treinamentos e Capacitações
            </h3>
            
            <div className="space-y-3">
              {colaborador.treinamentos.map((treinamento, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      treinamento.status === 'concluido' ? 'bg-green-100' :
                      treinamento.status === 'em_andamento' ? 'bg-blue-100' : 'bg-gray-100'
                    )}>
                      {treinamento.status === 'concluido' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : treinamento.status === 'em_andamento' ? (
                        <Clock className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Calendar className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{treinamento.nome}</h4>
                      <p className="text-xs text-gray-500">{treinamento.data}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    treinamento.status === 'concluido' ? 'bg-green-100 text-green-700' :
                    treinamento.status === 'em_andamento' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                  )}>
                    {treinamento.status === 'concluido' ? 'Concluído' :
                     treinamento.status === 'em_andamento' ? 'Em Andamento' : 'Pendente'}
                  </span>
                </div>
              ))}
              
              {colaborador.treinamentos.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">Nenhum treinamento registrado</p>
              )}
            </div>
          </div>
        )}

        {/* Ações Rápidas */}
        <div className="flex gap-3">
          <button
            onClick={() => toast.success('Abrindo formulário de feedback...')}
            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-5 h-5" />
            Enviar Feedback
          </button>
          <button
            onClick={() => toast.success('Abrindo PDI...')}
            className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
          >
            <GraduationCap className="w-5 h-5" />
            Criar PDI
          </button>
          <button
            onClick={() => toast.success('Abrindo proposta de reajuste...')}
            className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <BadgeDollarSign className="w-5 h-5" />
            Propor Reajuste
          </button>
          <button
            onClick={() => toast.success('Gerando relatório PDF...')}
            className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-5 h-5" />
            Exportar PDF
          </button>
        </div>
      </div>
    </div>
  );
}

