'use client';

/**
 * Valle 360 - RH Inteligência
 * Sistema completo de avaliação de colaboradores com IA
 * Sugestões: aumento, demissão, promoção, treinamento
 * Planos de carreira, monitoramento de processos, conversas de carreira
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Brain, Users, TrendingUp, TrendingDown, AlertTriangle, Award,
  DollarSign, Target, BarChart3, ChevronRight, X, Eye, Phone,
  Mail, Calendar, Star, Sparkles, ArrowUpRight, ArrowDownRight,
  UserCheck, UserMinus, GraduationCap, BadgeDollarSign, RefreshCw,
  MessageSquare, FileText, Briefcase, Clock, CheckCircle, XCircle,
  ExternalLink, Send, Play, Pause, Settings, Lightbulb, Rocket,
  ChevronUp, ChevronDown, Edit, Trash2, Plus, Download, Upload,
  Video, Mic, BookOpen, Zap, Heart, ThumbsUp, Flag, Trophy, Milestone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// =====================================================
// TIPOS
// =====================================================

interface Colaborador {
  id: string;
  nome: string;
  avatar: string;
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
  planoCarreira?: PlanoCarreira;
  proximaConversa?: string;
  feedbacksPendentes: number;
}

interface SugestaoIA {
  tipo: 'aumento' | 'promocao' | 'treinamento' | 'atencao' | 'demissao' | 'reconhecimento';
  colaboradorId: string;
  titulo: string;
  descricao: string;
  impacto: string;
  urgencia: 'alta' | 'media' | 'baixa';
  acaoRecomendada: string;
}

interface PlanoCarreira {
  id: string;
  colaboradorId: string;
  cargoAtual: string;
  proximoCargo: string;
  metaCargo: string;
  etapas: EtapaCarreira[];
  progressoGeral: number;
  tempoEstimado: string;
  habilidadesNecessarias: string[];
  treinamentosRecomendados: string[];
}

interface EtapaCarreira {
  id: string;
  titulo: string;
  descricao: string;
  status: 'concluida' | 'em_andamento' | 'pendente';
  prazo?: string;
  requisitos: string[];
  progressoPercentual: number;
}

interface ProcessoRH {
  id: string;
  tipo: 'avaliacao' | 'promocao' | 'treinamento' | 'feedbacks' | 'demissao';
  colaboradorId: string;
  colaboradorNome: string;
  status: 'pendente' | 'em_andamento' | 'aguardando_aprovacao' | 'concluido' | 'cancelado';
  prioridade: 'alta' | 'media' | 'baixa';
  dataInicio: string;
  prazo: string;
  responsavel: string;
  sugestoesIA: string[];
}

interface ConversaCarreira {
  id: string;
  colaboradorId: string;
  colaboradorNome: string;
  dataAgendada: string;
  tipo: 'feedback' | 'desenvolvimento' | 'promocao' | 'pdp';
  status: 'agendada' | 'realizada' | 'cancelada' | 'reagendada';
  notas?: string;
  proximosPassos?: string[];
}

// =====================================================
// MOCK DATA
// =====================================================

const mockColaboradores: Colaborador[] = [
  {
    id: '1',
    nome: 'João Silva',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=joao',
    cargo: 'Web Designer',
    departamento: 'Design',
    salarioAtual: 4500,
    dataAdmissao: '2023-03-15',
    scores: { desempenho: 92, engajamento: 88, entregas: 95, comunicacao: 85, lideranca: 70, inovacao: 90 },
    tendencia: 'up',
    ultimaAvaliacao: '2024-11-15',
    alertas: [],
    potencial: 'alto',
    feedbacksPendentes: 0,
    proximaConversa: '2024-12-20',
    planoCarreira: {
      id: 'pc1',
      colaboradorId: '1',
      cargoAtual: 'Web Designer',
      proximoCargo: 'Web Designer Senior',
      metaCargo: 'Head de Design',
      progressoGeral: 65,
      tempoEstimado: '18 meses',
      habilidadesNecessarias: ['Liderança de equipe', 'UX Research', 'Design Systems'],
      treinamentosRecomendados: ['Certificação UX', 'Gestão de Projetos Criativos'],
      etapas: [
        { id: 'e1', titulo: 'Dominar Design Systems', descricao: 'Criar e manter sistema de design', status: 'concluida', progressoPercentual: 100, requisitos: ['Documentação', 'Componentes'] },
        { id: 'e2', titulo: 'Mentoria de Júniors', descricao: 'Guiar 2 designers júniors', status: 'em_andamento', progressoPercentual: 60, requisitos: ['Sessões 1:1', 'Code reviews'] },
        { id: 'e3', titulo: 'Liderança de Projeto', descricao: 'Liderar projeto de ponta a ponta', status: 'pendente', progressoPercentual: 0, requisitos: ['Escopo', 'Delivery', 'Stakeholders'] }
      ]
    }
  },
  {
    id: '2',
    nome: 'Maria Santos',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
    cargo: 'Social Media',
    departamento: 'Marketing',
    salarioAtual: 3800,
    dataAdmissao: '2022-08-10',
    scores: { desempenho: 95, engajamento: 98, entregas: 92, comunicacao: 95, lideranca: 82, inovacao: 88 },
    tendencia: 'up',
    ultimaAvaliacao: '2024-11-20',
    alertas: [],
    potencial: 'alto',
    feedbacksPendentes: 1,
    proximaConversa: '2024-12-15'
  },
  {
    id: '3',
    nome: 'Pedro Costa',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pedro',
    cargo: 'Gestor de Tráfego',
    departamento: 'Performance',
    salarioAtual: 5200,
    dataAdmissao: '2023-01-20',
    scores: { desempenho: 58, engajamento: 45, entregas: 62, comunicacao: 55, lideranca: 40, inovacao: 50 },
    tendencia: 'down',
    ultimaAvaliacao: '2024-10-30',
    alertas: ['Baixo engajamento', 'Entregas atrasadas', 'Faltas frequentes'],
    potencial: 'baixo',
    feedbacksPendentes: 3,
    proximaConversa: '2024-12-10'
  },
  {
    id: '4',
    nome: 'Ana Oliveira',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana',
    cargo: 'Designer Gráfico',
    departamento: 'Design',
    salarioAtual: 4000,
    dataAdmissao: '2023-06-01',
    scores: { desempenho: 78, engajamento: 82, entregas: 80, comunicacao: 75, lideranca: 65, inovacao: 85 },
    tendencia: 'stable',
    ultimaAvaliacao: '2024-11-10',
    alertas: ['Necessita treinamento em gestão de tempo'],
    potencial: 'medio',
    feedbacksPendentes: 1
  },
  {
    id: '5',
    nome: 'Lucas Mendes',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lucas',
    cargo: 'Video Maker',
    departamento: 'Criação',
    salarioAtual: 4200,
    dataAdmissao: '2023-09-15',
    scores: { desempenho: 88, engajamento: 85, entregas: 90, comunicacao: 80, lideranca: 60, inovacao: 92 },
    tendencia: 'up',
    ultimaAvaliacao: '2024-11-25',
    alertas: [],
    potencial: 'alto',
    feedbacksPendentes: 0,
    proximaConversa: '2024-12-22'
  }
];

const mockProcessos: ProcessoRH[] = [
  {
    id: 'proc1',
    tipo: 'promocao',
    colaboradorId: '1',
    colaboradorNome: 'João Silva',
    status: 'em_andamento',
    prioridade: 'alta',
    dataInicio: '2024-11-15',
    prazo: '2024-12-31',
    responsavel: 'RH',
    sugestoesIA: ['Agendar reunião de alinhamento', 'Preparar proposta salarial', 'Definir novas responsabilidades']
  },
  {
    id: 'proc2',
    tipo: 'feedbacks',
    colaboradorId: '3',
    colaboradorNome: 'Pedro Costa',
    status: 'pendente',
    prioridade: 'alta',
    dataInicio: '2024-12-01',
    prazo: '2024-12-10',
    responsavel: 'Gestor Direto',
    sugestoesIA: ['Feedback urgente necessário', 'Considerar plano de melhoria', 'Monitorar próximas entregas']
  },
  {
    id: 'proc3',
    tipo: 'treinamento',
    colaboradorId: '4',
    colaboradorNome: 'Ana Oliveira',
    status: 'aguardando_aprovacao',
    prioridade: 'media',
    dataInicio: '2024-11-20',
    prazo: '2025-01-15',
    responsavel: 'RH',
    sugestoesIA: ['Curso de gestão de tempo', 'Mentoria com designer senior']
  }
];

const mockConversas: ConversaCarreira[] = [
  { id: 'conv1', colaboradorId: '3', colaboradorNome: 'Pedro Costa', dataAgendada: '2024-12-10T14:00:00', tipo: 'feedback', status: 'agendada' },
  { id: 'conv2', colaboradorId: '2', colaboradorNome: 'Maria Santos', dataAgendada: '2024-12-15T10:00:00', tipo: 'promocao', status: 'agendada' },
  { id: 'conv3', colaboradorId: '1', colaboradorNome: 'João Silva', dataAgendada: '2024-12-20T15:00:00', tipo: 'desenvolvimento', status: 'agendada' }
];

const gerarSugestoesIA = (colaboradores: Colaborador[]): SugestaoIA[] => {
  const sugestoes: SugestaoIA[] = [];
  
  colaboradores.forEach(col => {
    const mediaScore = Object.values(col.scores).reduce((a, b) => a + b, 0) / 6;
    
    if (mediaScore >= 90 && col.tendencia === 'up') {
      sugestoes.push({
        tipo: 'promocao',
        colaboradorId: col.id,
        titulo: `Promover ${col.nome}`,
        descricao: `${col.nome} apresenta desempenho excepcional (${Math.round(mediaScore)}%) com tendência de crescimento.`,
        impacto: `Retenção de talento chave. Risco de perda para mercado.`,
        urgencia: 'alta',
        acaoRecomendada: 'Agendar conversa de carreira'
      });
    }
    
    if (mediaScore >= 85 && mediaScore < 90 && col.tendencia !== 'down') {
      sugestoes.push({
        tipo: 'aumento',
        colaboradorId: col.id,
        titulo: `Revisar salário de ${col.nome}`,
        descricao: `Desempenho consistente de ${Math.round(mediaScore)}%. Colaborador há ${calcularTempoEmpresa(col.dataAdmissao)}.`,
        impacto: `Aumento de 10-15% recomendado para retenção.`,
        urgencia: 'media',
        acaoRecomendada: 'Avaliar reajuste salarial'
      });
    }
    
    if (mediaScore >= 70 && mediaScore < 85) {
      sugestoes.push({
        tipo: 'treinamento',
        colaboradorId: col.id,
        titulo: `Desenvolver ${col.nome}`,
        descricao: `Colaborador com potencial ${col.potencial}. Score: ${Math.round(mediaScore)}%.`,
        impacto: `Melhoria estimada de 15-20% com treinamento adequado.`,
        urgencia: 'media',
        acaoRecomendada: 'Mapear gaps e definir PDI'
      });
    }
    
    if (mediaScore < 60 || (mediaScore < 70 && col.tendencia === 'down')) {
      sugestoes.push({
        tipo: col.alertas.length >= 3 ? 'demissao' : 'atencao',
        colaboradorId: col.id,
        titulo: col.alertas.length >= 3 ? `Avaliar desligamento de ${col.nome}` : `Atenção com ${col.nome}`,
        descricao: `Score de ${Math.round(mediaScore)}% com tendência de queda. Alertas: ${col.alertas.join(', ') || 'Nenhum específico'}.`,
        impacto: col.alertas.length >= 3 
          ? `Custo de desligamento vs. impacto na produtividade.`
          : `Risco de contaminar ambiente. Necessita intervenção.`,
        urgencia: 'alta',
        acaoRecomendada: col.alertas.length >= 3 
          ? 'Consultar jurídico e iniciar processo'
          : 'Feedback imediato e plano de melhoria'
      });
    }
    
    if (col.scores.entregas >= 90) {
      sugestoes.push({
        tipo: 'reconhecimento',
        colaboradorId: col.id,
        titulo: `Reconhecer ${col.nome}`,
        descricao: `Taxa de entregas de ${col.scores.entregas}%. Colaborador confiável e pontual.`,
        impacto: `Reconhecimento público aumenta engajamento da equipe.`,
        urgencia: 'baixa',
        acaoRecomendada: 'Enviar elogio público ou bônus'
      });
    }
  });
  
  return sugestoes.sort((a, b) => {
    const urgenciaOrder = { alta: 0, media: 1, baixa: 2 };
    return urgenciaOrder[a.urgencia] - urgenciaOrder[b.urgencia];
  });
};

const calcularTempoEmpresa = (dataAdmissao: string) => {
  const diff = new Date().getTime() - new Date(dataAdmissao).getTime();
  const meses = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  if (meses < 12) return `${meses} meses`;
  const anos = Math.floor(meses / 12);
  const mesesRestantes = meses % 12;
  return `${anos} ano${anos > 1 ? 's' : ''}${mesesRestantes > 0 ? ` e ${mesesRestantes} meses` : ''}`;
};

// =====================================================
// COMPONENTES
// =====================================================

function ScoreRadar({ scores }: { scores: Colaborador['scores'] }) {
  const items = [
    { key: 'desempenho', label: 'Desempenho', color: 'bg-blue-500' },
    { key: 'engajamento', label: 'Engajamento', color: 'bg-green-500' },
    { key: 'entregas', label: 'Entregas', color: 'bg-purple-500' },
    { key: 'comunicacao', label: 'Comunicação', color: 'bg-yellow-500' },
    { key: 'lideranca', label: 'Liderança', color: 'bg-red-500' },
    { key: 'inovacao', label: 'Inovação', color: 'bg-pink-500' },
  ];

  return (
    <div className="space-y-2">
      {items.map(item => (
        <div key={item.key} className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-24">{item.label}</span>
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${scores[item.key as keyof typeof scores]}%` }}
              className={cn("h-full rounded-full", item.color)}
            />
          </div>
          <span className="text-xs font-medium w-8">{scores[item.key as keyof typeof scores]}%</span>
        </div>
      ))}
    </div>
  );
}

function PlanoCarreiraCard({ plano, colaborador }: { plano: PlanoCarreira; colaborador: Colaborador }) {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Rocket className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Plano de Carreira</h3>
          <p className="text-sm text-gray-500">{colaborador.nome}</p>
        </div>
      </div>

      {/* Trajectory */}
      <div className="flex items-center gap-2 mb-4 text-sm">
        <span className="px-2 py-1 bg-gray-100 rounded font-medium">{plano.cargoAtual}</span>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded font-medium">{plano.proximoCargo}</span>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded font-medium">{plano.metaCargo}</span>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600">Progresso Geral</span>
          <span className="font-bold text-indigo-600">{plano.progressoGeral}%</span>
        </div>
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${plano.progressoGeral}%` }}
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">Tempo estimado: {plano.tempoEstimado}</p>
      </div>

      {/* Steps */}
      <div className="space-y-2 mb-4">
        <h4 className="text-sm font-semibold text-gray-700">Etapas do Plano</h4>
        {plano.etapas.map((etapa, idx) => (
          <div key={etapa.id} className="flex items-center gap-3 p-2 bg-white rounded-lg border">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold",
              etapa.status === 'concluida' ? 'bg-green-500' :
              etapa.status === 'em_andamento' ? 'bg-indigo-500' : 'bg-gray-300'
            )}>
              {etapa.status === 'concluida' ? <CheckCircle className="w-4 h-4" /> : idx + 1}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{etapa.titulo}</p>
              <p className="text-xs text-gray-500">{etapa.descricao}</p>
            </div>
            <span className={cn(
              "text-xs px-2 py-1 rounded-full",
              etapa.status === 'concluida' ? 'bg-green-100 text-green-700' :
              etapa.status === 'em_andamento' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
            )}>
              {etapa.progressoPercentual}%
            </span>
          </div>
        ))}
      </div>

      {/* Skills */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Habilidades Necessárias</h4>
        <div className="flex flex-wrap gap-1">
          {plano.habilidadesNecessarias.map((skill, i) => (
            <span key={i} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Trainings */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Treinamentos Recomendados</h4>
        <div className="space-y-1">
          {plano.treinamentosRecomendados.map((training, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
              <BookOpen className="w-3 h-3 text-purple-500" />
              {training}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProcessoCard({ processo, onAction }: { processo: ProcessoRH; onAction: (action: string, processo: ProcessoRH) => void }) {
  const tipoConfig = {
    avaliacao: { icon: BarChart3, color: 'bg-blue-500', label: 'Avaliação' },
    promocao: { icon: ArrowUpRight, color: 'bg-green-500', label: 'Promoção' },
    treinamento: { icon: GraduationCap, color: 'bg-purple-500', label: 'Treinamento' },
    feedbacks: { icon: MessageSquare, color: 'bg-amber-500', label: 'Feedback' },
    demissao: { icon: UserMinus, color: 'bg-red-500', label: 'Desligamento' }
  }[processo.tipo];

  const statusConfig = {
    pendente: { color: 'bg-gray-100 text-gray-700', label: 'Pendente' },
    em_andamento: { color: 'bg-blue-100 text-blue-700', label: 'Em Andamento' },
    aguardando_aprovacao: { color: 'bg-yellow-100 text-yellow-700', label: 'Aguardando Aprovação' },
    concluido: { color: 'bg-green-100 text-green-700', label: 'Concluído' },
    cancelado: { color: 'bg-red-100 text-red-700', label: 'Cancelado' }
  }[processo.status];

  const Icon = tipoConfig.icon;

  return (
    <div className="bg-white rounded-xl p-4 border shadow-sm">
      <div className="flex items-start gap-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white", tipoConfig.color)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900">{tipoConfig.label} - {processo.colaboradorNome}</h4>
            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusConfig.color)}>
              {statusConfig.label}
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-2">
            Responsável: {processo.responsavel} • Prazo: {new Date(processo.prazo).toLocaleDateString('pt-BR')}
          </p>
          
          {processo.sugestoesIA.length > 0 && (
            <div className="bg-indigo-50 rounded-lg p-2 mb-3">
              <p className="text-xs font-medium text-indigo-700 mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Sugestões da IA:
              </p>
              <ul className="text-xs text-indigo-600 space-y-0.5">
                {processo.sugestoesIA.slice(0, 2).map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => onAction('iniciar', processo)}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 flex items-center gap-1"
            >
              <Play className="w-3 h-3" /> Iniciar
            </button>
            <button
              onClick={() => onAction('detalhes', processo)}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 flex items-center gap-1"
            >
              <Eye className="w-3 h-3" /> Ver Detalhes
            </button>
            <button
              onClick={() => onAction('agendar', processo)}
              className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 flex items-center gap-1"
            >
              <Calendar className="w-3 h-3" /> Agendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SugestaoCard({ sugestao, colaborador, onAction }: { 
  sugestao: SugestaoIA; 
  colaborador?: Colaborador;
  onAction: (tipo: string, colaboradorId: string) => void;
}) {
  const config = {
    promocao: { icon: ArrowUpRight, color: 'bg-emerald-500', bgLight: 'bg-emerald-50', textColor: 'text-emerald-700' },
    aumento: { icon: BadgeDollarSign, color: 'bg-blue-500', bgLight: 'bg-blue-50', textColor: 'text-blue-700' },
    treinamento: { icon: GraduationCap, color: 'bg-purple-500', bgLight: 'bg-purple-50', textColor: 'text-purple-700' },
    atencao: { icon: AlertTriangle, color: 'bg-amber-500', bgLight: 'bg-amber-50', textColor: 'text-amber-700' },
    demissao: { icon: UserMinus, color: 'bg-red-500', bgLight: 'bg-red-50', textColor: 'text-red-700' },
    reconhecimento: { icon: Star, color: 'bg-yellow-500', bgLight: 'bg-yellow-50', textColor: 'text-yellow-700' },
  }[sugestao.tipo];

  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("p-4 rounded-xl border", config.bgLight)}
    >
      <div className="flex items-start gap-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white", config.color)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={cn("font-semibold", config.textColor)}>{sugestao.titulo}</h4>
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full font-medium",
              sugestao.urgencia === 'alta' ? 'bg-red-100 text-red-700' :
              sugestao.urgencia === 'media' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-700'
            )}>
              {sugestao.urgencia}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">{sugestao.descricao}</p>
          <p className="text-xs text-gray-500 mb-3">💡 Impacto: {sugestao.impacto}</p>
          <button
            onClick={() => onAction(sugestao.tipo, sugestao.colaboradorId)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium text-white transition-colors",
              config.color, "hover:opacity-90"
            )}
          >
            {sugestao.acaoRecomendada}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// =====================================================
// PÁGINA PRINCIPAL
// =====================================================

export default function RHInteligenciaPage() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>(mockColaboradores);
  const [sugestoes, setSugestoes] = useState<SugestaoIA[]>([]);
  const [processos, setProcessos] = useState<ProcessoRH[]>(mockProcessos);
  const [conversas, setConversas] = useState<ConversaCarreira[]>(mockConversas);
  const [selectedColaborador, setSelectedColaborador] = useState<Colaborador | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showConversaModal, setShowConversaModal] = useState(false);
  const [showPlanoModal, setShowPlanoModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filterDepartamento, setFilterDepartamento] = useState('all');
  const [activeTab, setActiveTab] = useState<'sugestoes' | 'processos' | 'conversas'>('sugestoes');
  
  // Form states
  const [novaConversa, setNovaConversa] = useState({
    colaboradorId: '',
    data: '',
    hora: '',
    tipo: 'desenvolvimento' as const
  });
  const [feedbackContent, setFeedbackContent] = useState('');
  const [gerandoPlano, setGerandoPlano] = useState(false);

  useEffect(() => {
    setSugestoes(gerarSugestoesIA(colaboradores));
  }, [colaboradores]);

  const handleGenerateAnalysis = async () => {
    setIsGenerating(true);
    toast.loading('Analisando colaboradores com IA...');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSugestoes(gerarSugestoesIA(colaboradores));
    toast.dismiss();
    toast.success('Análise concluída! Novas sugestões geradas.');
    setIsGenerating(false);
  };

  const handleAction = async (tipo: string, colaboradorId: string) => {
    const col = colaboradores.find(c => c.id === colaboradorId);
    
    switch (tipo) {
      case 'promocao':
        toast.loading('Iniciando processo de promoção...');
        await new Promise(r => setTimeout(r, 1000));
        toast.dismiss();
        toast.success(`Processo de promoção iniciado para ${col?.nome}!`);
        setProcessos(prev => [...prev, {
          id: `proc_${Date.now()}`,
          tipo: 'promocao',
          colaboradorId,
          colaboradorNome: col?.nome || '',
          status: 'pendente',
          prioridade: 'alta',
          dataInicio: new Date().toISOString(),
          prazo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          responsavel: 'RH',
          sugestoesIA: ['Preparar proposta salarial', 'Definir novas responsabilidades', 'Comunicar equipe']
        }]);
        break;
        
      case 'aumento':
        toast.success(`Proposta de reajuste salarial aberta para ${col?.nome}!`);
        break;
        
      case 'treinamento':
        toast.loading('Criando plano de desenvolvimento...');
        await new Promise(r => setTimeout(r, 1500));
        toast.dismiss();
        toast.success(`PDI criado para ${col?.nome}!`);
        break;
        
      case 'atencao':
        setSelectedColaborador(col || null);
        setShowFeedbackModal(true);
        break;
        
      case 'demissao':
        toast.warning(`Processo de desligamento iniciado. Consulte o jurídico.`);
        break;
        
      case 'reconhecimento':
        toast.loading('Enviando reconhecimento...');
        await new Promise(r => setTimeout(r, 1000));
        toast.dismiss();
        toast.success(`🎉 Reconhecimento enviado para ${col?.nome}!`);
        break;
    }
  };

  const handleAgendarConversa = async () => {
    if (!novaConversa.colaboradorId || !novaConversa.data || !novaConversa.hora) {
      toast.error('Preencha todos os campos');
      return;
    }
    
    toast.loading('Agendando conversa de carreira...');
    await new Promise(r => setTimeout(r, 1000));
    
    const col = colaboradores.find(c => c.id === novaConversa.colaboradorId);
    const novaConv: ConversaCarreira = {
      id: `conv_${Date.now()}`,
      colaboradorId: novaConversa.colaboradorId,
      colaboradorNome: col?.nome || '',
      dataAgendada: `${novaConversa.data}T${novaConversa.hora}:00`,
      tipo: novaConversa.tipo,
      status: 'agendada'
    };
    
    setConversas(prev => [...prev, novaConv]);
    setColaboradores(prev => prev.map(c => 
      c.id === novaConversa.colaboradorId 
        ? { ...c, proximaConversa: novaConversa.data }
        : c
    ));
    
    toast.dismiss();
    toast.success(`Conversa agendada com ${col?.nome}!`);
    setShowConversaModal(false);
    setNovaConversa({ colaboradorId: '', data: '', hora: '', tipo: 'desenvolvimento' });
  };

  const handleEnviarFeedback = async () => {
    if (!feedbackContent.trim()) {
      toast.error('Digite o conteúdo do feedback');
      return;
    }
    
    toast.loading('Enviando feedback...');
    await new Promise(r => setTimeout(r, 1000));
    
    if (selectedColaborador) {
      setColaboradores(prev => prev.map(c => 
        c.id === selectedColaborador.id 
          ? { ...c, feedbacksPendentes: Math.max(0, c.feedbacksPendentes - 1) }
          : c
      ));
    }
    
    toast.dismiss();
    toast.success('Feedback enviado com sucesso!');
    setShowFeedbackModal(false);
    setFeedbackContent('');
  };

  const handleGerarPlanoCarreira = async (colaboradorId: string) => {
    setGerandoPlano(true);
    toast.loading('A IA está gerando um plano de carreira personalizado...');
    
    await new Promise(r => setTimeout(r, 2500));
    
    const col = colaboradores.find(c => c.id === colaboradorId);
    const novoPlano: PlanoCarreira = {
      id: `pc_${Date.now()}`,
      colaboradorId,
      cargoAtual: col?.cargo || '',
      proximoCargo: `${col?.cargo} Senior`,
      metaCargo: `Head de ${col?.departamento}`,
      progressoGeral: 15,
      tempoEstimado: '24 meses',
      habilidadesNecessarias: ['Liderança', 'Gestão de Projetos', 'Comunicação Executiva'],
      treinamentosRecomendados: ['Liderança 4.0', 'Gestão de Pessoas', 'OKRs e Metas'],
      etapas: [
        { id: 'e1', titulo: 'Consolidar conhecimento técnico', descricao: 'Tornar-se referência na área', status: 'em_andamento', progressoPercentual: 30, requisitos: ['Certificações', 'Projetos entregues'] },
        { id: 'e2', titulo: 'Desenvolver soft skills', descricao: 'Comunicação e liderança', status: 'pendente', progressoPercentual: 0, requisitos: ['Treinamentos', 'Mentoria'] },
        { id: 'e3', titulo: 'Assumir responsabilidades de gestão', descricao: 'Liderar pequenas equipes', status: 'pendente', progressoPercentual: 0, requisitos: ['Projetos piloto', 'Feedback 360'] }
      ]
    };
    
    setColaboradores(prev => prev.map(c => 
      c.id === colaboradorId ? { ...c, planoCarreira: novoPlano } : c
    ));
    
    toast.dismiss();
    toast.success(`Plano de carreira criado para ${col?.nome}!`);
    setGerandoPlano(false);
  };

  const handleProcessoAction = (action: string, processo: ProcessoRH) => {
    switch (action) {
      case 'iniciar':
        setProcessos(prev => prev.map(p => 
          p.id === processo.id ? { ...p, status: 'em_andamento' } : p
        ));
        toast.success(`Processo iniciado: ${processo.tipo}`);
        break;
      case 'detalhes':
        const col = colaboradores.find(c => c.id === processo.colaboradorId);
        if (col) {
          setSelectedColaborador(col);
          setShowModal(true);
        }
        break;
      case 'agendar':
        setNovaConversa(prev => ({ ...prev, colaboradorId: processo.colaboradorId }));
        setShowConversaModal(true);
        break;
    }
  };

  const handleViewDetails = (col: Colaborador) => {
    setSelectedColaborador(col);
    setShowModal(true);
  };

  const mediaGeral = colaboradores.reduce((acc, col) => {
    const media = Object.values(col.scores).reduce((a, b) => a + b, 0) / 6;
    return acc + media;
  }, 0) / colaboradores.length;

  const colaboradoresEmRisco = colaboradores.filter(c => {
    const media = Object.values(c.scores).reduce((a, b) => a + b, 0) / 6;
    return media < 70 || c.tendencia === 'down';
  });

  const topPerformers = colaboradores.filter(c => {
    const media = Object.values(c.scores).reduce((a, b) => a + b, 0) / 6;
    return media >= 85;
  });

  const filteredColaboradores = filterDepartamento === 'all' 
    ? colaboradores 
    : colaboradores.filter(c => c.departamento === filterDepartamento);

  const departamentos = [...new Set(colaboradores.map(c => c.departamento))];

  const conversasPendentes = conversas.filter(c => c.status === 'agendada');

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">RH Inteligência</h1>
              <p className="text-sm text-gray-500">Avaliação, carreira e desenvolvimento com IA</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowConversaModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Agendar Conversa
            </button>
            <button
              onClick={handleGenerateAnalysis}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn("w-4 h-4", isGenerating && "animate-spin")} />
              Gerar Análise IA
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-5 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-5 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Média Geral</span>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{Math.round(mediaGeral)}%</p>
            <p className="text-xs text-green-600 mt-1">+3% vs mês anterior</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-5 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Top Performers</span>
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{topPerformers.length}</p>
            <p className="text-xs text-gray-500 mt-1">acima de 85%</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-5 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Em Atenção</span>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-red-600">{colaboradoresEmRisco.length}</p>
            <p className="text-xs text-red-500 mt-1">precisam de intervenção</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-5 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Conversas Agendadas</span>
              <Calendar className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-600">{conversasPendentes.length}</p>
            <p className="text-xs text-green-500 mt-1">próximos 30 dias</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white p-5 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Processos Ativos</span>
              <Briefcase className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-purple-600">{processos.filter(p => p.status !== 'concluido').length}</p>
            <p className="text-xs text-purple-500 mt-1">{sugestoes.length} sugestões IA</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          {[
            { id: 'sugestoes', label: 'Sugestões IA', icon: Sparkles, count: sugestoes.length },
            { id: 'processos', label: 'Processos RH', icon: Briefcase, count: processos.filter(p => p.status !== 'concluido').length },
            { id: 'conversas', label: 'Conversas de Carreira', icon: MessageSquare, count: conversasPendentes.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 font-medium border-b-2 -mb-px transition-colors",
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                activeTab === tab.id ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-6">
          
          {/* Main Panel */}
          <div className="col-span-2 space-y-4">
            <AnimatePresence mode="wait">
              {activeTab === 'sugestoes' && (
                <motion.div
                  key="sugestoes"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3 max-h-[600px] overflow-y-auto"
                >
                  {sugestoes.map((sugestao, idx) => (
                    <SugestaoCard 
                      key={idx} 
                      sugestao={sugestao} 
                      colaborador={colaboradores.find(c => c.id === sugestao.colaboradorId)}
                      onAction={handleAction}
                    />
                  ))}
                </motion.div>
              )}

              {activeTab === 'processos' && (
                <motion.div
                  key="processos"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3 max-h-[600px] overflow-y-auto"
                >
                  {processos.filter(p => p.status !== 'concluido').map(processo => (
                    <ProcessoCard 
                      key={processo.id} 
                      processo={processo}
                      onAction={handleProcessoAction}
                    />
                  ))}
                </motion.div>
              )}

              {activeTab === 'conversas' && (
                <motion.div
                  key="conversas"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  {conversasPendentes.map(conversa => (
                    <div key={conversa.id} className="bg-white rounded-xl p-4 border shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <Video className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{conversa.colaboradorNome}</h4>
                            <p className="text-sm text-gray-500">
                              {new Date(conversa.dataAgendada).toLocaleDateString('pt-BR')} às {new Date(conversa.dataAgendada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium",
                            conversa.tipo === 'feedback' ? 'bg-amber-100 text-amber-700' :
                            conversa.tipo === 'promocao' ? 'bg-green-100 text-green-700' :
                            conversa.tipo === 'desenvolvimento' ? 'bg-blue-100 text-blue-700' :
                            'bg-purple-100 text-purple-700'
                          )}>
                            {conversa.tipo}
                          </span>
                          <button
                            onClick={() => toast.success('Entrando na reunião...')}
                            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700"
                          >
                            Iniciar
                          </button>
                          <button
                            onClick={() => toast.success('Reagendamento solicitado')}
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200"
                          >
                            Reagendar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {conversasPendentes.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma conversa agendada</p>
                      <button 
                        onClick={() => setShowConversaModal(true)}
                        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
                      >
                        Agendar Conversa
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Lista de Colaboradores */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Equipe</h2>
              <select
                value={filterDepartamento}
                onChange={e => setFilterDepartamento(e.target.value)}
                className="text-sm border rounded-lg px-2 py-1"
              >
                <option value="all">Todos</option>
                {departamentos.map(dep => (
                  <option key={dep} value={dep}>{dep}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredColaboradores.map(col => {
                const media = Math.round(Object.values(col.scores).reduce((a, b) => a + b, 0) / 6);
                return (
                  <motion.div
                    key={col.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white p-4 rounded-xl border cursor-pointer hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3" onClick={() => handleViewDetails(col)}>
                      <img src={col.avatar} alt={col.nome} className="w-12 h-12 rounded-full" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">{col.nome}</h4>
                          {col.tendencia === 'up' && <ArrowUpRight className="w-4 h-4 text-green-500" />}
                          {col.tendencia === 'down' && <ArrowDownRight className="w-4 h-4 text-red-500" />}
                        </div>
                        <p className="text-xs text-gray-500">{col.cargo} • {col.departamento}</p>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-lg font-bold",
                          media >= 85 ? "text-green-600" : media >= 70 ? "text-yellow-600" : "text-red-600"
                        )}>
                          {media}%
                        </p>
                        <p className="text-xs text-gray-400">score</p>
                      </div>
                    </div>
                    
                    {col.alertas.length > 0 && (
                      <div className="mt-2 flex gap-1 flex-wrap">
                        {col.alertas.slice(0, 2).map((alerta, i) => (
                          <span key={i} className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                            {alerta}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Quick Actions */}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedColaborador(col); setShowFeedbackModal(true); }}
                        className="flex-1 py-2 bg-amber-50 text-amber-600 rounded-lg text-xs font-medium hover:bg-amber-100 transition-colors flex items-center justify-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" /> Feedback
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setNovaConversa(prev => ({ ...prev, colaboradorId: col.id })); setShowConversaModal(true); }}
                        className="flex-1 py-2 bg-green-50 text-green-600 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors flex items-center justify-center gap-1"
                      >
                        <Calendar className="w-3 h-3" /> Agendar
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); col.planoCarreira ? setShowPlanoModal(true) : handleGerarPlanoCarreira(col.id); setSelectedColaborador(col); }}
                        className="flex-1 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1"
                      >
                        <Rocket className="w-3 h-3" /> {col.planoCarreira ? 'Ver Plano' : 'Criar Plano'}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Detalhes Colaborador */}
      <AnimatePresence>
        {showModal && selectedColaborador && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-auto"
            >
              <div className="p-6 border-b sticky top-0 bg-white z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img src={selectedColaborador.avatar} alt={selectedColaborador.nome} className="w-16 h-16 rounded-full" />
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedColaborador.nome}</h2>
                      <p className="text-gray-500">{selectedColaborador.cargo} • {selectedColaborador.departamento}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Info Grid */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Salário Atual</p>
                    <p className="text-xl font-bold text-gray-900">R$ {selectedColaborador.salarioAtual.toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Tempo de Empresa</p>
                    <p className="text-xl font-bold text-gray-900">{calcularTempoEmpresa(selectedColaborador.dataAdmissao)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Potencial</p>
                    <p className={cn(
                      "text-xl font-bold capitalize",
                      selectedColaborador.potencial === 'alto' ? 'text-green-600' :
                      selectedColaborador.potencial === 'medio' ? 'text-yellow-600' : 'text-red-600'
                    )}>
                      {selectedColaborador.potencial}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Próxima Conversa</p>
                    <p className="text-xl font-bold text-gray-900">
                      {selectedColaborador.proximaConversa ? new Date(selectedColaborador.proximaConversa).toLocaleDateString('pt-BR') : 'Não agendada'}
                    </p>
                  </div>
                </div>

                {/* Scores */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Avaliação Detalhada</h3>
                  <ScoreRadar scores={selectedColaborador.scores} />
                </div>

                {/* Plano de Carreira */}
                {selectedColaborador.planoCarreira && (
                  <PlanoCarreiraCard plano={selectedColaborador.planoCarreira} colaborador={selectedColaborador} />
                )}

                {!selectedColaborador.planoCarreira && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 text-center">
                    <Rocket className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
                    <h3 className="font-semibold text-indigo-900 mb-2">Plano de Carreira Não Definido</h3>
                    <p className="text-sm text-indigo-700 mb-4">A IA pode gerar um plano personalizado baseado no perfil e potencial do colaborador.</p>
                    <button
                      onClick={() => handleGerarPlanoCarreira(selectedColaborador.id)}
                      disabled={gerandoPlano}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 mx-auto"
                    >
                      {gerandoPlano ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      Gerar Plano com IA
                    </button>
                  </div>
                )}

                {/* Alertas */}
                {selectedColaborador.alertas.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Alertas</h3>
                    <div className="space-y-2">
                      {selectedColaborador.alertas.map((alerta, i) => (
                        <div key={i} className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span className="text-sm text-red-700">{alerta}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ações */}
                <div className="flex gap-3 pt-4 border-t">
                  <button 
                    onClick={() => { handleAction('treinamento', selectedColaborador.id); setShowModal(false); }}
                    className="flex-1 py-2.5 bg-purple-50 text-purple-600 rounded-lg font-medium hover:bg-purple-100 flex items-center justify-center gap-2"
                  >
                    <GraduationCap className="w-4 h-4" /> Criar PDI
                  </button>
                  <button 
                    onClick={() => { handleAction('aumento', selectedColaborador.id); setShowModal(false); }}
                    className="flex-1 py-2.5 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 flex items-center justify-center gap-2"
                  >
                    <BadgeDollarSign className="w-4 h-4" /> Propor Reajuste
                  </button>
                  <button 
                    onClick={() => { setShowFeedbackModal(true); }}
                    className="flex-1 py-2.5 bg-amber-50 text-amber-600 rounded-lg font-medium hover:bg-amber-100 flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" /> Enviar Feedback
                  </button>
                  <button 
                    onClick={() => { setNovaConversa(prev => ({ ...prev, colaboradorId: selectedColaborador.id })); setShowConversaModal(true); }}
                    className="flex-1 py-2.5 bg-green-50 text-green-600 rounded-lg font-medium hover:bg-green-100 flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" /> Agendar 1:1
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Agendar Conversa */}
      <Dialog open={showConversaModal} onOpenChange={setShowConversaModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Agendar Conversa de Carreira</DialogTitle>
            <DialogDescription>
              Agende uma conversa com o colaborador para feedback, desenvolvimento ou alinhamento.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Colaborador</Label>
              <Select value={novaConversa.colaboradorId} onValueChange={v => setNovaConversa(prev => ({ ...prev, colaboradorId: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o colaborador" />
                </SelectTrigger>
                <SelectContent>
                  {colaboradores.map(col => (
                    <SelectItem key={col.id} value={col.id}>{col.nome} - {col.cargo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Data</Label>
                <Input type="date" value={novaConversa.data} onChange={e => setNovaConversa(prev => ({ ...prev, data: e.target.value }))} />
              </div>
              <div className="grid gap-2">
                <Label>Hora</Label>
                <Input type="time" value={novaConversa.hora} onChange={e => setNovaConversa(prev => ({ ...prev, hora: e.target.value }))} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Tipo de Conversa</Label>
              <Select value={novaConversa.tipo} onValueChange={v => setNovaConversa(prev => ({ ...prev, tipo: v as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feedback">Feedback</SelectItem>
                  <SelectItem value="desenvolvimento">Desenvolvimento</SelectItem>
                  <SelectItem value="promocao">Promoção</SelectItem>
                  <SelectItem value="pdp">Plano de Desenvolvimento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConversaModal(false)}>Cancelar</Button>
            <Button onClick={handleAgendarConversa}>
              <Calendar className="w-4 h-4 mr-2" />
              Agendar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Feedback */}
      <Dialog open={showFeedbackModal} onOpenChange={setShowFeedbackModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Enviar Feedback</DialogTitle>
            <DialogDescription>
              {selectedColaborador ? `Feedback para ${selectedColaborador.nome}` : 'Envie um feedback construtivo'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Tipo de Feedback</Label>
              <Select defaultValue="construtivo">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="positivo">Reconhecimento Positivo</SelectItem>
                  <SelectItem value="construtivo">Feedback Construtivo</SelectItem>
                  <SelectItem value="corretivo">Correção de Comportamento</SelectItem>
                  <SelectItem value="desenvolvimento">Sugestão de Desenvolvimento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Mensagem</Label>
              <Textarea 
                value={feedbackContent} 
                onChange={e => setFeedbackContent(e.target.value)}
                placeholder="Descreva o feedback de forma clara e objetiva..."
                rows={5}
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-indigo-600 bg-indigo-50 p-3 rounded-lg">
              <Sparkles className="w-4 h-4" />
              <span>A IA pode ajudar a melhorar sua mensagem para ser mais efetiva</span>
              <button className="ml-auto px-2 py-1 bg-indigo-100 rounded text-xs font-medium hover:bg-indigo-200">
                Melhorar com IA
              </button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeedbackModal(false)}>Cancelar</Button>
            <Button onClick={handleEnviarFeedback}>
              <Send className="w-4 h-4 mr-2" />
              Enviar Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Plano de Carreira */}
      <Dialog open={showPlanoModal} onOpenChange={setShowPlanoModal}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Plano de Carreira</DialogTitle>
          </DialogHeader>
          {selectedColaborador?.planoCarreira && (
            <PlanoCarreiraCard plano={selectedColaborador.planoCarreira} colaborador={selectedColaborador} />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlanoModal(false)}>Fechar</Button>
            <Button onClick={() => toast.success('Plano atualizado!')}>
              <Edit className="w-4 h-4 mr-2" />
              Editar Plano
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
