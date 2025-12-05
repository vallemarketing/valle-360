'use client';

/**
 * Valle 360 - Gestão de Franqueados (Admin)
 * Pipeline de candidatos, testes e análise de franquias
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Users,
  UserPlus,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  Plus,
  RefreshCw,
  BarChart3,
  Target,
  Award,
  FileText,
  Brain,
  ChevronRight,
  X,
  MoreVertical,
  Eye,
  ClipboardList,
  History,
  Edit,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Calendar,
  Star,
  TrendingDown,
  Sparkles,
  Check,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =====================================================
// TIPOS
// =====================================================

interface Franchisee {
  id: string;
  unit_name: string;
  unit_code: string;
  city: string;
  state: string;
  owner_name: string;
  owner_email: string;
  owner_phone: string;
  status: 'active' | 'inactive' | 'pending';
  health_status: 'healthy' | 'attention' | 'critical';
  performance_score: number;
  current_nps: number;
  churn_risk: number;
  ranking_position: number;
  ranking_total: number;
  vs_network_average: number;
  start_date?: string;
  address?: string;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city: string;
  state: string;
  capital_available: number;
  stage: 'new' | 'screening' | 'interview' | 'tests' | 'analysis' | 'approved' | 'rejected';
  stage_changed_at: string;
  ai_fit_score: number;
  screening_score?: number;
  interview_score?: number;
  test_results?: {
    disc?: { completed: boolean; profile?: string };
    cultural_fit?: { completed: boolean; score?: number };
    entrepreneur?: { completed: boolean; score?: number };
  };
}

interface Test {
  id: string;
  name: string;
  description: string;
  type: 'DISC' | 'cultural_fit' | 'entrepreneur';
  duration: string;
  questions: number;
}

// =====================================================
// MOCK DATA
// =====================================================

const mockFranchisees: Franchisee[] = [
  {
    id: '1',
    unit_name: 'Valle Franchising SP - Pinheiros',
    unit_code: 'SP001',
    city: 'São Paulo',
    state: 'SP',
    owner_name: 'Carlos Eduardo Mendes',
    owner_email: 'carlos@vallesp.com.br',
    owner_phone: '(11) 99999-1234',
    status: 'active',
    health_status: 'healthy',
    performance_score: 92,
    current_nps: 78,
    churn_risk: 5,
    ranking_position: 1,
    ranking_total: 12,
    vs_network_average: 15,
    start_date: '2022-03-15',
    address: 'Av. Rebouças, 1200'
  },
  {
    id: '2',
    unit_name: 'Valle Franchising RJ - Centro',
    unit_code: 'RJ001',
    city: 'Rio de Janeiro',
    state: 'RJ',
    owner_name: 'Ana Paula Costa',
    owner_email: 'ana@vallerj.com.br',
    owner_phone: '(21) 99999-5678',
    status: 'active',
    health_status: 'attention',
    performance_score: 68,
    current_nps: 62,
    churn_risk: 35,
    ranking_position: 5,
    ranking_total: 12,
    vs_network_average: -8,
    start_date: '2023-01-10'
  },
  {
    id: '3',
    unit_name: 'Valle Franchising MG - Savassi',
    unit_code: 'MG001',
    city: 'Belo Horizonte',
    state: 'MG',
    owner_name: 'Roberto Oliveira',
    owner_email: 'roberto@vallemg.com.br',
    owner_phone: '(31) 99999-4321',
    status: 'active',
    health_status: 'healthy',
    performance_score: 85,
    current_nps: 75,
    churn_risk: 10,
    ranking_position: 2,
    ranking_total: 12,
    vs_network_average: 12,
    start_date: '2022-08-20'
  }
];

const mockCandidates: Candidate[] = [
  {
    id: 'c1',
    name: 'Fernando Almeida',
    email: 'fernando@email.com',
    phone: '(11) 98765-4321',
    city: 'Campinas',
    state: 'SP',
    capital_available: 250000,
    stage: 'new',
    stage_changed_at: new Date().toISOString(),
    ai_fit_score: 85
  },
  {
    id: 'c2',
    name: 'Mariana Santos',
    email: 'mariana@email.com',
    phone: '(41) 98765-1234',
    city: 'Curitiba',
    state: 'PR',
    capital_available: 350000,
    stage: 'screening',
    stage_changed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    ai_fit_score: 72,
    screening_score: 8
  },
  {
    id: 'c3',
    name: 'Lucas Pereira',
    email: 'lucas@email.com',
    phone: '(51) 98765-5678',
    city: 'Porto Alegre',
    state: 'RS',
    capital_available: 400000,
    stage: 'interview',
    stage_changed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    ai_fit_score: 91,
    screening_score: 9,
    interview_score: 8
  },
  {
    id: 'c4',
    name: 'Patrícia Lima',
    email: 'patricia@email.com',
    phone: '(71) 98765-9012',
    city: 'Salvador',
    state: 'BA',
    capital_available: 300000,
    stage: 'tests',
    stage_changed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    ai_fit_score: 78,
    test_results: {
      disc: { completed: true, profile: 'DI' },
      cultural_fit: { completed: false },
      entrepreneur: { completed: false }
    }
  },
  {
    id: 'c5',
    name: 'Ricardo Souza',
    email: 'ricardo@email.com',
    phone: '(48) 98765-3456',
    city: 'Florianópolis',
    state: 'SC',
    capital_available: 500000,
    stage: 'analysis',
    stage_changed_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    ai_fit_score: 95,
    screening_score: 10,
    interview_score: 9,
    test_results: {
      disc: { completed: true, profile: 'DC' },
      cultural_fit: { completed: true, score: 92 },
      entrepreneur: { completed: true, score: 88 }
    }
  }
];

const availableTests: Test[] = [
  { id: 't1', name: 'Perfil DISC', description: 'Avaliação comportamental baseada em Dominância, Influência, Estabilidade e Conformidade', type: 'DISC', duration: '15 min', questions: 24 },
  { id: 't2', name: 'Fit Cultural Valle 360', description: 'Avalia a compatibilidade com os valores e cultura da franqueadora', type: 'cultural_fit', duration: '10 min', questions: 15 },
  { id: 't3', name: 'Perfil Empreendedor', description: 'Avalia características essenciais para o sucesso como franqueado', type: 'entrepreneur', duration: '12 min', questions: 18 }
];

const pipelineStages = [
  { id: 'new', label: 'Novos', color: 'bg-blue-500' },
  { id: 'screening', label: 'Triagem', color: 'bg-purple-500' },
  { id: 'interview', label: 'Entrevista', color: 'bg-orange-500' },
  { id: 'tests', label: 'Testes', color: 'bg-yellow-500' },
  { id: 'analysis', label: 'Análise Final', color: 'bg-cyan-500' },
  { id: 'approved', label: 'Aprovados', color: 'bg-green-500' },
  { id: 'rejected', label: 'Rejeitados', color: 'bg-red-500' }
];

// =====================================================
// COMPONENTES DE MODAL
// =====================================================

// Modal de Detalhes do Franqueado
function FranchiseeDetailsModal({ franchisee, onClose }: { franchisee: Franchisee; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center",
                franchisee.health_status === 'healthy' && "bg-green-100",
                franchisee.health_status === 'attention' && "bg-yellow-100",
                franchisee.health_status === 'critical' && "bg-red-100"
              )}>
                <Building2 className={cn(
                  "w-7 h-7",
                  franchisee.health_status === 'healthy' && "text-green-600",
                  franchisee.health_status === 'attention' && "text-yellow-600",
                  franchisee.health_status === 'critical' && "text-red-600"
                )} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{franchisee.unit_name}</h2>
                <p className="text-gray-500">{franchisee.unit_code}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Métricas */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{franchisee.performance_score}</p>
              <p className="text-sm text-gray-500">Score Performance</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{franchisee.current_nps}</p>
              <p className="text-sm text-gray-500">NPS</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-center">
              <p className={cn(
                "text-3xl font-bold",
                franchisee.churn_risk > 30 ? "text-red-600" : franchisee.churn_risk > 15 ? "text-yellow-600" : "text-green-600"
              )}>{franchisee.churn_risk}%</p>
              <p className="text-sm text-gray-500">Risco de Churn</p>
            </div>
          </div>

          {/* Informações */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-500 uppercase tracking-wider">Proprietário</label>
              <p className="text-gray-900 dark:text-white font-medium">{franchisee.owner_name}</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 uppercase tracking-wider">Email</label>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <p className="text-gray-900 dark:text-white">{franchisee.owner_email}</p>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 uppercase tracking-wider">Telefone</label>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <p className="text-gray-900 dark:text-white">{franchisee.owner_phone}</p>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 uppercase tracking-wider">Localização</label>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <p className="text-gray-900 dark:text-white">{franchisee.city}, {franchisee.state}</p>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 uppercase tracking-wider">Ranking</label>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-500" />
                <p className="text-gray-900 dark:text-white">{franchisee.ranking_position}º de {franchisee.ranking_total}</p>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 uppercase tracking-wider">vs Média da Rede</label>
              <div className="flex items-center gap-2">
                {franchisee.vs_network_average > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <p className={cn(
                  "font-medium",
                  franchisee.vs_network_average > 0 ? "text-green-600" : "text-red-600"
                )}>
                  {franchisee.vs_network_average > 0 ? '+' : ''}{franchisee.vs_network_average}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            Fechar
          </button>
          <button className="px-4 py-2 bg-[#1672d6] text-white rounded-lg hover:bg-[#1260b5] flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Ver Relatório Completo
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Modal de Detalhes do Candidato
function CandidateDetailsModal({ candidate, onClose, onApplyTest }: { 
  candidate: Candidate; 
  onClose: () => void;
  onApplyTest: (candidate: Candidate) => void;
}) {
  const stageInfo = pipelineStages.find(s => s.id === candidate.stage);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                {candidate.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{candidate.name}</h2>
                <span className={cn("px-2 py-1 rounded-full text-xs font-medium text-white", stageInfo?.color)}>
                  {stageInfo?.label}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Score IA */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                <circle
                  cx="64" cy="64" r="56"
                  stroke={candidate.ai_fit_score >= 80 ? '#22c55e' : candidate.ai_fit_score >= 60 ? '#eab308' : '#ef4444'}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${candidate.ai_fit_score * 3.52} 352`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{candidate.ai_fit_score}%</span>
                <span className="text-xs text-gray-500">Fit Score IA</span>
              </div>
            </div>
          </div>

          {/* Informações */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-500 uppercase tracking-wider">Email</label>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <p className="text-gray-900 dark:text-white text-sm">{candidate.email}</p>
              </div>
            </div>
            {candidate.phone && (
              <div className="space-y-1">
                <label className="text-xs text-gray-500 uppercase tracking-wider">Telefone</label>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-900 dark:text-white text-sm">{candidate.phone}</p>
                </div>
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs text-gray-500 uppercase tracking-wider">Localização</label>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <p className="text-gray-900 dark:text-white text-sm">{candidate.city}, {candidate.state}</p>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500 uppercase tracking-wider">Capital Disponível</label>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-500" />
                <p className="text-green-600 font-medium text-sm">R$ {candidate.capital_available.toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </div>

          {/* Scores das Etapas */}
          {(candidate.screening_score || candidate.interview_score) && (
            <div className="space-y-2">
              <label className="text-xs text-gray-500 uppercase tracking-wider">Avaliações</label>
              <div className="flex gap-3">
                {candidate.screening_score && (
                  <div className="flex-1 bg-purple-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-purple-600">{candidate.screening_score}/10</p>
                    <p className="text-xs text-purple-600">Triagem</p>
                  </div>
                )}
                {candidate.interview_score && (
                  <div className="flex-1 bg-orange-50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-orange-600">{candidate.interview_score}/10</p>
                    <p className="text-xs text-orange-600">Entrevista</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status dos Testes */}
          {candidate.test_results && (
            <div className="space-y-2">
              <label className="text-xs text-gray-500 uppercase tracking-wider">Testes Comportamentais</label>
              <div className="space-y-2">
                {Object.entries(candidate.test_results).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {key === 'disc' ? 'DISC' : key === 'cultural_fit' ? 'Fit Cultural' : 'Perfil Empreendedor'}
                    </span>
                    {value.completed ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        {value.score ? `${value.score}%` : value.profile}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-gray-400 text-sm">
                        <Clock className="w-4 h-4" />
                        Pendente
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            Fechar
          </button>
          <button 
            onClick={() => { onApplyTest(candidate); onClose(); }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <ClipboardList className="w-4 h-4" />
            Aplicar Teste
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Modal de Aplicação de Teste
function ApplyTestModal({ candidate, onClose, onApply }: {
  candidate: Candidate;
  onClose: () => void;
  onApply: (candidateId: string, testId: string) => void;
}) {
  const [selectedTest, setSelectedTest] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Aplicar Teste</h2>
                <p className="text-sm text-gray-500">Para: {candidate.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-gray-600 text-sm">Selecione o teste que deseja enviar para o candidato:</p>

          {availableTests.map(test => {
            const isCompleted = candidate.test_results?.[test.type as keyof typeof candidate.test_results]?.completed;
            
            return (
              <div
                key={test.id}
                onClick={() => !isCompleted && setSelectedTest(test.id)}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all cursor-pointer",
                  isCompleted && "opacity-50 cursor-not-allowed",
                  selectedTest === test.id 
                    ? "border-purple-500 bg-purple-50" 
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">{test.name}</h3>
                      {isCompleted && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                          Concluído
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{test.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {test.duration}
                      </span>
                      <span>{test.questions} questões</span>
                    </div>
                  </div>
                  {selectedTest === test.id && (
                    <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            Cancelar
          </button>
          <button
            onClick={() => selectedTest && onApply(candidate.id, selectedTest)}
            disabled={!selectedTest}
            className={cn(
              "px-4 py-2 rounded-lg flex items-center gap-2",
              selectedTest 
                ? "bg-purple-600 text-white hover:bg-purple-700" 
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            )}
          >
            <Sparkles className="w-4 h-4" />
            Enviar Teste
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Modal de Novo Candidato
function NewCandidateModal({ onClose, onSave }: { onClose: () => void; onSave: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    capital_available: ''
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Novo Candidato a Franqueado</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite o nome"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(00) 00000-0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cidade</label>
              <input
                type="text"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="São Paulo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
              <input
                type="text"
                value={formData.state}
                onChange={e => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="SP"
                maxLength={2}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capital Disponível (R$)</label>
              <input
                type="number"
                value={formData.capital_available}
                onChange={e => setFormData({ ...formData, capital_available: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="250000"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            Cancelar
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Adicionar Candidato
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Menu de Ações do Card
function CardActionMenu({ onViewDetails, onApplyTest, onViewHistory }: {
  onViewDetails: () => void;
  onApplyTest: () => void;
  onViewHistory: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
      >
        <MoreVertical className="w-4 h-4 text-gray-500" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            className="absolute right-0 top-full mt-1 w-44 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
          >
            <button
              onClick={(e) => { e.stopPropagation(); onViewDetails(); setIsOpen(false); }}
              className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
            >
              <Eye className="w-4 h-4 text-blue-500" />
              <span>Ver Detalhes</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onApplyTest(); setIsOpen(false); }}
              className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
            >
              <ClipboardList className="w-4 h-4 text-purple-500" />
              <span>Aplicar Teste</span>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onViewHistory(); setIsOpen(false); }}
              className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
            >
              <History className="w-4 h-4 text-gray-500" />
              <span>Ver Histórico</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Card de Franquia melhorado
function FranchiseeCardEnhanced({ franchisee, onViewDetails, onApplyTest }: {
  franchisee: Franchisee;
  onViewDetails: () => void;
  onApplyTest: () => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer"
      onClick={onViewDetails}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            franchisee.health_status === 'healthy' && "bg-green-100",
            franchisee.health_status === 'attention' && "bg-yellow-100",
            franchisee.health_status === 'critical' && "bg-red-100"
          )}>
            <Building2 className={cn(
              "w-6 h-6",
              franchisee.health_status === 'healthy' && "text-green-600",
              franchisee.health_status === 'attention' && "text-yellow-600",
              franchisee.health_status === 'critical' && "text-red-600"
            )} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{franchisee.unit_name}</h3>
            <p className="text-sm text-gray-500">{franchisee.city}, {franchisee.state}</p>
          </div>
        </div>
        <CardActionMenu
          onViewDetails={onViewDetails}
          onApplyTest={onApplyTest}
          onViewHistory={() => console.log('History')}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900 dark:text-white">{franchisee.performance_score}</p>
          <p className="text-xs text-gray-500">Score</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900 dark:text-white">{franchisee.current_nps}</p>
          <p className="text-xs text-gray-500">NPS</p>
        </div>
        <div className="text-center">
          <p className={cn(
            "text-xl font-bold",
            franchisee.vs_network_average > 0 ? "text-green-600" : "text-red-600"
          )}>
            {franchisee.vs_network_average > 0 ? '+' : ''}{franchisee.vs_network_average}%
          </p>
          <p className="text-xs text-gray-500">vs Média</p>
        </div>
      </div>
    </motion.div>
  );
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export default function FranqueadosAdminPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'franchisees' | 'candidates' | 'ranking'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
  
  // Modals
  const [franchiseeDetails, setFranchiseeDetails] = useState<Franchisee | null>(null);
  const [candidateDetails, setCandidateDetails] = useState<Candidate | null>(null);
  const [applyTestModal, setApplyTestModal] = useState<Candidate | null>(null);
  const [newCandidateModal, setNewCandidateModal] = useState(false);

  const handleApplyTest = (candidateId: string, testId: string) => {
    console.log('Aplicando teste:', testId, 'para candidato:', candidateId);
    // TODO: Implementar API call
    setApplyTestModal(null);
  };

  const handleAddCandidate = (data: any) => {
    console.log('Novo candidato:', data);
    // TODO: Implementar API call
    setNewCandidateModal(false);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Gestão de Franqueados
              </h1>
              <p className="text-gray-500">
                Pipeline de candidatos e análise de performance
              </p>
            </div>
          </div>

          <button
            onClick={() => setNewCandidateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1672d6] text-white rounded-xl text-sm font-medium hover:bg-[#1260b5] transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Novo Candidato a Franqueado
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">+2 este mês</span>
            </div>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">12</p>
            <p className="text-sm text-gray-500">Franquias Ativas</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded-full">5 novos</span>
            </div>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">{candidates.length}</p>
            <p className="text-sm text-gray-500">Candidatos no Pipeline</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">78</p>
            <p className="text-sm text-gray-500">NPS Médio da Rede</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">2</p>
            <p className="text-sm text-gray-500">Franquias em Risco</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {[
            { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
            { id: 'franchisees', label: 'Franquias', icon: Building2 },
            { id: 'candidates', label: 'Candidatos', icon: UserPlus },
            { id: 'ranking', label: 'Ranking', icon: Award }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px whitespace-nowrap",
                activeTab === tab.id
                  ? "border-[#1672d6] text-[#1672d6]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* Visão Geral */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-3 gap-6"
            >
              {/* Franquias em Destaque */}
              <div className="col-span-2 space-y-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Franquias em Destaque</h3>
                <div className="grid grid-cols-2 gap-4">
                  {mockFranchisees.map(franchisee => (
                    <FranchiseeCardEnhanced
                      key={franchisee.id}
                      franchisee={franchisee}
                      onViewDetails={() => setFranchiseeDetails(franchisee)}
                      onApplyTest={() => console.log('Test for franchisee')}
                    />
                  ))}
                </div>
              </div>

              {/* Alertas */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Atenção Necessária</h3>
                
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">2 franquias em risco</h4>
                      <p className="text-sm text-gray-600 mt-1">Performance abaixo da média por 2 meses consecutivos</p>
                      <button className="text-sm text-orange-600 font-medium mt-2 flex items-center gap-1">
                        Ver detalhes <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <UserPlus className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">3 candidatos aguardando</h4>
                      <p className="text-sm text-gray-600 mt-1">Candidatos na etapa de análise precisam de decisão</p>
                      <button 
                        onClick={() => setActiveTab('candidates')}
                        className="text-sm text-blue-600 font-medium mt-2 flex items-center gap-1"
                      >
                        Avaliar <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">Performance em alta</h4>
                      <p className="text-sm text-gray-600 mt-1">NPS médio subiu 5 pontos no último mês</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Franquias */}
          {activeTab === 'franchisees' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar franquia..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1672d6]"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                  <Filter className="w-4 h-4" />
                  Filtros
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {mockFranchisees.map(franchisee => (
                  <FranchiseeCardEnhanced
                    key={franchisee.id}
                    franchisee={franchisee}
                    onViewDetails={() => setFranchiseeDetails(franchisee)}
                    onApplyTest={() => console.log('Test')}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Candidatos - Pipeline */}
          {activeTab === 'candidates' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar candidato..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1672d6]"
                  />
                </div>
              </div>

              {/* Pipeline */}
              <div className="flex gap-4 overflow-x-auto pb-4">
                {pipelineStages.slice(0, 5).map(stage => {
                  const stageCandidates = candidates.filter(c => c.stage === stage.id);
                  
                  return (
                    <div key={stage.id} className="flex-shrink-0 w-72">
                      <div className="flex items-center gap-2 mb-3">
                        <div className={cn("w-3 h-3 rounded-full", stage.color)} />
                        <h3 className="font-medium text-gray-700 dark:text-gray-300">{stage.label}</h3>
                        <span className="text-sm text-gray-400">({stageCandidates.length})</span>
                      </div>

                      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-3 min-h-[400px] space-y-3">
                        {stageCandidates.map(candidate => (
                          <motion.div
                            key={candidate.id}
                            whileHover={{ scale: 1.02 }}
                            className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-sm cursor-pointer"
                            onClick={() => setCandidateDetails(candidate)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                                  {candidate.name.charAt(0)}
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">{candidate.name}</h4>
                                  <p className="text-xs text-gray-500">{candidate.city}, {candidate.state}</p>
                                </div>
                              </div>
                              <CardActionMenu
                                onViewDetails={() => setCandidateDetails(candidate)}
                                onApplyTest={() => setApplyTestModal(candidate)}
                                onViewHistory={() => console.log('History')}
                              />
                            </div>

                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-1">
                                <Brain className="w-3 h-3 text-purple-500" />
                                <span className={cn(
                                  "text-xs font-medium",
                                  candidate.ai_fit_score >= 80 ? "text-green-600" :
                                  candidate.ai_fit_score >= 60 ? "text-yellow-600" : "text-red-600"
                                )}>
                                  {candidate.ai_fit_score}% Fit
                                </span>
                              </div>
                              <span className="text-xs text-gray-400">
                                R$ {(candidate.capital_available / 1000).toFixed(0)}k
                              </span>
                            </div>
                          </motion.div>
                        ))}

                        {stageCandidates.length === 0 && (
                          <div className="text-center py-8 text-gray-400 text-sm">
                            Nenhum candidato
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Ranking */}
          {activeTab === 'ranking' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Ranking de Performance</h3>
                  <p className="text-sm text-gray-500">Classificação baseada em NPS, engajamento e métricas</p>
                </div>
                <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  <option>Dezembro 2024</option>
                  <option>Novembro 2024</option>
                </select>
              </div>

              <div className="space-y-3">
                {mockFranchisees.sort((a, b) => a.ranking_position - b.ranking_position).map((f, idx) => (
                  <div
                    key={f.id}
                    onClick={() => setFranchiseeDetails(f)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-colors",
                      idx === 0 ? "bg-yellow-50 border border-yellow-200" :
                      idx === 1 ? "bg-gray-50 border border-gray-200" :
                      idx === 2 ? "bg-orange-50 border border-orange-200" :
                      "bg-white border border-gray-200 hover:bg-gray-50"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold",
                      idx === 0 ? "bg-yellow-400 text-white" :
                      idx === 1 ? "bg-gray-400 text-white" :
                      idx === 2 ? "bg-orange-400 text-white" :
                      "bg-gray-200 text-gray-600"
                    )}>
                      {f.ranking_position}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{f.unit_name}</h4>
                      <p className="text-sm text-gray-500">{f.city}, {f.state}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">{f.performance_score}</p>
                      <p className="text-xs text-gray-500">Score</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-purple-600">{f.current_nps}</p>
                      <p className="text-xs text-gray-500">NPS</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {franchiseeDetails && (
          <FranchiseeDetailsModal
            franchisee={franchiseeDetails}
            onClose={() => setFranchiseeDetails(null)}
          />
        )}

        {candidateDetails && (
          <CandidateDetailsModal
            candidate={candidateDetails}
            onClose={() => setCandidateDetails(null)}
            onApplyTest={(c) => setApplyTestModal(c)}
          />
        )}

        {applyTestModal && (
          <ApplyTestModal
            candidate={applyTestModal}
            onClose={() => setApplyTestModal(null)}
            onApply={handleApplyTest}
          />
        )}

        {newCandidateModal && (
          <NewCandidateModal
            onClose={() => setNewCandidateModal(false)}
            onSave={handleAddCandidate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
