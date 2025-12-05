'use client';

/**
 * Valle 360 - Gestão de Franqueados (Admin)
 * Pipeline de candidatos e análise de franquias
 */

import { useState, useEffect } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FranchiseeCard, FranchiseePipeline, FranchiseeRanking } from '@/components/franchisee';

// =====================================================
// MOCK DATA
// =====================================================

const mockFranchisees = [
  {
    id: '1',
    unit_name: 'Valle Franchising SP - Pinheiros',
    unit_code: 'SP001',
    city: 'São Paulo',
    state: 'SP',
    owner_name: 'Carlos Eduardo Mendes',
    owner_email: 'carlos@vallesp.com.br',
    owner_phone: '(11) 99999-1234',
    status: 'active' as const,
    health_status: 'healthy' as const,
    performance_score: 92,
    current_nps: 78,
    churn_risk: 5,
    ranking_position: 1,
    ranking_total: 12,
    vs_network_average: 15
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
    status: 'active' as const,
    health_status: 'attention' as const,
    performance_score: 68,
    current_nps: 62,
    churn_risk: 35,
    ranking_position: 5,
    ranking_total: 12,
    vs_network_average: -8
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
    status: 'active' as const,
    health_status: 'healthy' as const,
    performance_score: 85,
    current_nps: 75,
    churn_risk: 10,
    ranking_position: 2,
    ranking_total: 12,
    vs_network_average: 12
  }
];

const mockCandidates = [
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
    city: 'Salvador',
    state: 'BA',
    capital_available: 300000,
    stage: 'tests',
    stage_changed_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    ai_fit_score: 78
  },
  {
    id: 'c5',
    name: 'Ricardo Souza',
    email: 'ricardo@email.com',
    city: 'Florianópolis',
    state: 'SC',
    capital_available: 500000,
    stage: 'analysis',
    stage_changed_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    ai_fit_score: 95,
    screening_score: 10,
    interview_score: 9
  }
];

const mockRanking = [
  { id: '1', unit_name: 'Pinheiros', city: 'São Paulo', state: 'SP', ranking_position: 1, previous_position: 1, total_score: 92, nps_score: 78, engagement_rate: 5.2 },
  { id: '3', unit_name: 'Savassi', city: 'Belo Horizonte', state: 'MG', ranking_position: 2, previous_position: 3, total_score: 85, nps_score: 75, engagement_rate: 4.8 },
  { id: '4', unit_name: 'Asa Sul', city: 'Brasília', state: 'DF', ranking_position: 3, previous_position: 2, total_score: 82, nps_score: 72, engagement_rate: 4.5 },
  { id: '5', unit_name: 'Aldeota', city: 'Fortaleza', state: 'CE', ranking_position: 4, previous_position: 5, total_score: 78, nps_score: 70, engagement_rate: 4.2 },
  { id: '2', unit_name: 'Centro', city: 'Rio de Janeiro', state: 'RJ', ranking_position: 5, previous_position: 4, total_score: 68, nps_score: 62, engagement_rate: 3.8 }
];

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export default function FranqueadosAdminPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'franchisees' | 'candidates' | 'ranking'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#001533] dark:text-white">
                Gestão de Franqueados
              </h1>
              <p className="text-gray-500">
                Pipeline de candidatos e análise de performance
              </p>
            </div>
          </div>

          <button
            className="flex items-center gap-2 px-4 py-2 bg-[#1672d6] text-white rounded-xl text-sm font-medium hover:bg-[#1260b5] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Candidato
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">
                +2 este mês
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">12</p>
            <p className="text-sm text-gray-500">Franquias Ativas</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded-full">
                5 novos
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">8</p>
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
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  Franquias em Destaque
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {mockFranchisees.slice(0, 4).map(franchisee => (
                    <FranchiseeCard
                      key={franchisee.id}
                      franchisee={franchisee}
                      variant="default"
                    />
                  ))}
                </div>
              </div>

              {/* Alertas e Ações */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  Atenção Necessária
                </h3>
                
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">2 franquias em risco</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Performance abaixo da média por 2 meses consecutivos
                      </p>
                      <button className="text-sm text-orange-600 font-medium mt-2 flex items-center gap-1">
                        Ver detalhes <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <UserPlus className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800">3 candidatos aguardando</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Candidatos na etapa de análise precisam de decisão
                      </p>
                      <button className="text-sm text-blue-600 font-medium mt-2 flex items-center gap-1">
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
                      <h4 className="font-medium text-gray-800">Performance da rede em alta</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        NPS médio subiu 5 pontos no último mês
                      </p>
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
              {/* Search */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar franquia..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1672d6]"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                  <Filter className="w-4 h-4" />
                  Filtros
                </button>
              </div>

              {/* Lista */}
              <div className="grid grid-cols-3 gap-4">
                {mockFranchisees.map(franchisee => (
                  <FranchiseeCard
                    key={franchisee.id}
                    franchisee={franchisee}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Candidatos */}
          {activeTab === 'candidates' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <FranchiseePipeline
                candidates={mockCandidates}
                onCandidateClick={(candidate) => console.log('Click:', candidate)}
                onStageChange={(id, stage) => console.log('Stage change:', id, stage)}
                onAddCandidate={() => console.log('Add candidate')}
              />
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
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    Ranking de Performance
                  </h3>
                  <p className="text-sm text-gray-500">
                    Classificação baseada em NPS, engajamento e métricas de marketing
                  </p>
                </div>
                <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                  <option>Dezembro 2024</option>
                  <option>Novembro 2024</option>
                  <option>Outubro 2024</option>
                </select>
              </div>

              <FranchiseeRanking
                franchisees={mockRanking}
                onFranchiseeClick={(f) => console.log('Click:', f)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

