'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Calendar, Clock, Home, Palmtree, Heart, FileText,
  CheckCircle, XCircle, AlertTriangle, User, Building2,
  Filter, Search, ChevronDown, ChevronRight, RefreshCw,
  TrendingUp, TrendingDown, Brain, Sparkles, Bell,
  MoreVertical, Eye, MessageSquare, Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// =====================================================
// TIPOS
// =====================================================

type RequestType = 'vacation' | 'home_office' | 'day_off' | 'sick_leave' | 'maternity' | 'paternity' | 'other';
type RequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

interface EmployeeRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  department: string;
  type: RequestType;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  status: RequestStatus;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  impactsGoals: boolean;
  aiRecommendation?: string;
  aiRiskScore?: number;
  createdAt: string;
}

interface RequestStats {
  pending: number;
  approved: number;
  rejected: number;
  vacationDaysUsed: number;
  homeOfficeDays: number;
  sickLeaveDays: number;
}

interface AIInsight {
  type: 'risk' | 'opportunity' | 'warning' | 'info';
  title: string;
  description: string;
  actionable: boolean;
}

// =====================================================
// MOCK DATA
// =====================================================

const mockRequests: EmployeeRequest[] = [
  {
    id: 'req-1',
    userId: 'user-1',
    userName: 'Maria Silva',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
    department: 'Social Media',
    type: 'vacation',
    title: 'Férias de fim de ano',
    description: 'Viagem em família para o litoral',
    startDate: '2024-12-23',
    endDate: '2024-12-30',
    daysCount: 8,
    status: 'pending',
    priority: 'normal',
    impactsGoals: true,
    aiRecommendation: 'Aprovar com cautela. Período de alta demanda, garantir cobertura.',
    aiRiskScore: 35,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'req-2',
    userId: 'user-2',
    userName: 'João Santos',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=joao',
    department: 'Design',
    type: 'home_office',
    title: 'Home Office - Semana 50',
    description: 'Trabalho remoto para focar em projeto especial',
    startDate: '2024-12-09',
    endDate: '2024-12-13',
    daysCount: 5,
    status: 'pending',
    priority: 'low',
    impactsGoals: false,
    aiRecommendation: 'Baixo risco. Histórico positivo de produtividade em home office.',
    aiRiskScore: 15,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'req-3',
    userId: 'user-3',
    userName: 'Ana Oliveira',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana',
    department: 'Tráfego',
    type: 'sick_leave',
    title: 'Licença médica',
    description: 'Procedimento cirúrgico agendado',
    startDate: '2024-12-15',
    endDate: '2024-12-22',
    daysCount: 8,
    status: 'approved',
    priority: 'high',
    impactsGoals: true,
    approvedBy: 'Admin',
    approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    aiRecommendation: 'Licença médica obrigatória. Redistribuir tarefas urgentemente.',
    aiRiskScore: 65,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'req-4',
    userId: 'user-4',
    userName: 'Pedro Costa',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pedro',
    department: 'Vídeo',
    type: 'day_off',
    title: 'Folga compensatória',
    description: 'Compensação por horas extras no mês anterior',
    startDate: '2024-12-06',
    endDate: '2024-12-06',
    daysCount: 1,
    status: 'pending',
    priority: 'normal',
    impactsGoals: false,
    aiRecommendation: 'Aprovar. Colaborador tem saldo positivo de horas.',
    aiRiskScore: 10,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'req-5',
    userId: 'user-5',
    userName: 'Carla Mendes',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carla',
    department: 'Comercial',
    type: 'vacation',
    title: 'Férias de janeiro',
    description: 'Período de descanso anual',
    startDate: '2025-01-06',
    endDate: '2025-01-17',
    daysCount: 12,
    status: 'rejected',
    priority: 'normal',
    impactsGoals: true,
    rejectionReason: 'Conflito com período crítico de prospecção. Sugerir outro período.',
    aiRecommendation: 'Período de alta demanda comercial. Considerar adiar.',
    aiRiskScore: 75,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const mockStats: RequestStats = {
  pending: 3,
  approved: 12,
  rejected: 2,
  vacationDaysUsed: 45,
  homeOfficeDays: 28,
  sickLeaveDays: 8
};

const mockInsights: AIInsight[] = [
  {
    type: 'warning',
    title: 'Concentração de férias em dezembro',
    description: '4 colaboradores solicitaram férias na mesma semana. Pode impactar entregas.',
    actionable: true
  },
  {
    type: 'info',
    title: 'Home office aumentou produtividade',
    description: 'Colaboradores em home office tiveram 15% mais entregas no último mês.',
    actionable: false
  },
  {
    type: 'risk',
    title: 'João Santos pode estar em burnout',
    description: 'Não tirou férias há 14 meses e tem baixa taxa de home office.',
    actionable: true
  }
];

// =====================================================
// COMPONENTES
// =====================================================

const typeConfig: Record<RequestType, { label: string; icon: React.ElementType; color: string }> = {
  vacation: { label: 'Férias', icon: Palmtree, color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30' },
  home_office: { label: 'Home Office', icon: Home, color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30' },
  day_off: { label: 'Folga', icon: Calendar, color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30' },
  sick_leave: { label: 'Licença Médica', icon: Heart, color: 'text-red-500 bg-red-100 dark:bg-red-900/30' },
  maternity: { label: 'Licença Maternidade', icon: Heart, color: 'text-pink-500 bg-pink-100 dark:bg-pink-900/30' },
  paternity: { label: 'Licença Paternidade', icon: Heart, color: 'text-sky-500 bg-sky-100 dark:bg-sky-900/30' },
  other: { label: 'Outro', icon: FileText, color: 'text-gray-500 bg-gray-100 dark:bg-gray-900/30' }
};

const statusConfig: Record<RequestStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200', icon: Clock },
  approved: { label: 'Aprovado', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200', icon: CheckCircle },
  rejected: { label: 'Rejeitado', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200', icon: XCircle },
  cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200', icon: XCircle }
};

const RequestCard = ({ 
  request, 
  onApprove, 
  onReject, 
  onView 
}: { 
  request: EmployeeRequest;
  onApprove: () => void;
  onReject: () => void;
  onView: () => void;
}) => {
  const typeInfo = typeConfig[request.type];
  const statusInfo = statusConfig[request.status];
  const TypeIcon = typeInfo.icon;
  const StatusIcon = statusInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 hover:shadow-lg transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        {/* User Info */}
        <div className="flex items-center gap-3">
          <img 
            src={request.userAvatar} 
            alt={request.userName}
            className="w-12 h-12 rounded-xl"
          />
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">{request.userName}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{request.department}</p>
          </div>
        </div>

        {/* Status Badge */}
        <Badge className={cn("flex items-center gap-1", statusInfo.color)}>
          <StatusIcon className="w-3 h-3" />
          {statusInfo.label}
        </Badge>
      </div>

      {/* Request Info */}
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={cn("p-1.5 rounded-lg", typeInfo.color)}>
            <TypeIcon className="w-4 h-4" />
          </span>
          <h3 className="font-medium text-gray-900 dark:text-white">{request.title}</h3>
        </div>
        {request.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{request.description}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(request.startDate).toLocaleDateString('pt-BR')} - {new Date(request.endDate).toLocaleDateString('pt-BR')}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {request.daysCount} dia{request.daysCount > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* AI Recommendation */}
      {request.aiRecommendation && request.status === 'pending' && (
        <div className={cn(
          "mt-4 p-3 rounded-xl flex items-start gap-3",
          request.aiRiskScore && request.aiRiskScore > 50 
            ? "bg-red-50 dark:bg-red-900/20" 
            : request.aiRiskScore && request.aiRiskScore > 30
              ? "bg-yellow-50 dark:bg-yellow-900/20"
              : "bg-green-50 dark:bg-green-900/20"
        )}>
          <Brain className={cn(
            "w-5 h-5 flex-shrink-0",
            request.aiRiskScore && request.aiRiskScore > 50 
              ? "text-red-500" 
              : request.aiRiskScore && request.aiRiskScore > 30
                ? "text-yellow-500"
                : "text-green-500"
          )} />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-500">Análise da IA</span>
              <span className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                request.aiRiskScore && request.aiRiskScore > 50 
                  ? "bg-red-100 text-red-600 dark:bg-red-900/30" 
                  : request.aiRiskScore && request.aiRiskScore > 30
                    ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30"
                    : "bg-green-100 text-green-600 dark:bg-green-900/30"
              )}>
                Risco: {request.aiRiskScore}%
              </span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">{request.aiRecommendation}</p>
          </div>
        </div>
      )}

      {/* Rejection Reason */}
      {request.status === 'rejected' && request.rejectionReason && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
          <p className="text-sm text-red-600 dark:text-red-400">
            <strong>Motivo:</strong> {request.rejectionReason}
          </p>
        </div>
      )}

      {/* Actions */}
      {request.status === 'pending' && (
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={onApprove}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Aprovar
          </button>
          <button
            onClick={onReject}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            Rejeitar
          </button>
          <button
            onClick={onView}
            className="p-2 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Eye className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      )}
    </motion.div>
  );
};

const StatCard = ({ label, value, icon: Icon, color, trend }: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  trend?: 'up' | 'down';
}) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
    <div className="flex items-center justify-between mb-2">
      <span className={cn("p-2 rounded-lg", color)}>
        <Icon className="w-5 h-5" />
      </span>
      {trend && (
        trend === 'up' 
          ? <TrendingUp className="w-4 h-4 text-green-500" />
          : <TrendingDown className="w-4 h-4 text-red-500" />
      )}
    </div>
    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
  </div>
);

const InsightCard = ({ insight }: { insight: AIInsight }) => {
  const typeColors = {
    risk: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
    opportunity: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
  };

  const typeIcons = {
    risk: AlertTriangle,
    warning: AlertTriangle,
    opportunity: Sparkles,
    info: Brain
  };

  const Icon = typeIcons[insight.type];

  return (
    <div className={cn("p-4 rounded-xl border", typeColors[insight.type])}>
      <div className="flex items-start gap-3">
        <Icon className="w-5 h-5 flex-shrink-0 opacity-70" />
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-1">{insight.title}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">{insight.description}</p>
          {insight.actionable && (
            <button className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
              Ver detalhes →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// =====================================================
// PÁGINA PRINCIPAL
// =====================================================

export default function SolicitacoesPage() {
  const [requests, setRequests] = useState<EmployeeRequest[]>(mockRequests);
  const [stats] = useState<RequestStats>(mockStats);
  const [insights] = useState<AIInsight[]>(mockInsights);
  const [filter, setFilter] = useState<RequestStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<RequestType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<EmployeeRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const filteredRequests = requests.filter(req => {
    if (filter !== 'all' && req.status !== filter) return false;
    if (typeFilter !== 'all' && req.type !== typeFilter) return false;
    if (searchTerm && !req.userName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleApprove = (request: EmployeeRequest) => {
    setRequests(prev => prev.map(r => 
      r.id === request.id 
        ? { ...r, status: 'approved' as RequestStatus, approvedAt: new Date().toISOString(), approvedBy: 'Admin' }
        : r
    ));
    toast.success(`Solicitação de ${request.userName} aprovada!`);
  };

  const handleReject = (request: EmployeeRequest) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (!selectedRequest || !rejectReason.trim()) {
      toast.error('Informe o motivo da rejeição');
      return;
    }

    setRequests(prev => prev.map(r => 
      r.id === selectedRequest.id 
        ? { ...r, status: 'rejected' as RequestStatus, rejectionReason: rejectReason }
        : r
    ));
    toast.success(`Solicitação de ${selectedRequest.userName} rejeitada.`);
    setShowRejectModal(false);
    setSelectedRequest(null);
    setRejectReason('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Calendar className="w-8 h-8 text-indigo-500" />
              Solicitações de Colaboradores
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Gerencie férias, home office e folgas da equipe
            </p>
          </div>
          <button
            onClick={() => toast.info('Atualizando...')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <StatCard 
            label="Pendentes" 
            value={stats.pending} 
            icon={Clock} 
            color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30" 
          />
          <StatCard 
            label="Aprovadas" 
            value={stats.approved} 
            icon={CheckCircle} 
            color="bg-green-100 text-green-600 dark:bg-green-900/30" 
            trend="up"
          />
          <StatCard 
            label="Rejeitadas" 
            value={stats.rejected} 
            icon={XCircle} 
            color="bg-red-100 text-red-600 dark:bg-red-900/30" 
          />
          <StatCard 
            label="Dias de Férias" 
            value={stats.vacationDaysUsed} 
            icon={Palmtree} 
            color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30" 
          />
          <StatCard 
            label="Dias Home Office" 
            value={stats.homeOfficeDays} 
            icon={Home} 
            color="bg-blue-100 text-blue-600 dark:bg-blue-900/30" 
          />
          <StatCard 
            label="Licenças Médicas" 
            value={stats.sickLeaveDays} 
            icon={Heart} 
            color="bg-rose-100 text-rose-600 dark:bg-rose-900/30" 
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Requests List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar colaborador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as RequestStatus | 'all')}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Todos status</option>
                <option value="pending">Pendentes</option>
                <option value="approved">Aprovados</option>
                <option value="rejected">Rejeitados</option>
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as RequestType | 'all')}
                className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Todos tipos</option>
                <option value="vacation">Férias</option>
                <option value="home_office">Home Office</option>
                <option value="day_off">Folga</option>
                <option value="sick_leave">Licença Médica</option>
              </select>
            </div>

            {/* Request Cards */}
            <div className="space-y-4">
              <AnimatePresence>
                {filteredRequests.map(request => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    onApprove={() => handleApprove(request)}
                    onReject={() => handleReject(request)}
                    onView={() => toast.info(`Visualizando: ${request.title}`)}
                  />
                ))}
              </AnimatePresence>

              {filteredRequests.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Nenhuma solicitação encontrada</p>
                </div>
              )}
            </div>
          </div>

          {/* Insights Panel */}
          <div className="space-y-6">
            {/* AI Insights */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                Insights da IA
              </h3>
              <div className="space-y-3">
                {insights.map((insight, idx) => (
                  <InsightCard key={idx} insight={insight} />
                ))}
              </div>
            </div>

            {/* Calendar Preview */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                Próximas Ausências
              </h3>
              <div className="space-y-3">
                {requests
                  .filter(r => r.status === 'approved' && new Date(r.startDate) > new Date())
                  .slice(0, 4)
                  .map(req => (
                    <div key={req.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <img src={req.userAvatar} alt={req.userName} className="w-8 h-8 rounded-lg" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{req.userName}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(req.startDate).toLocaleDateString('pt-BR')} - {req.daysCount} dias
                        </p>
                      </div>
                      <Badge className={typeConfig[req.type].color}>
                        {typeConfig[req.type].label}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Rejeitar Solicitação
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Informe o motivo da rejeição para {selectedRequest.userName}:
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Motivo da rejeição..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmReject}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                >
                  Confirmar Rejeição
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

