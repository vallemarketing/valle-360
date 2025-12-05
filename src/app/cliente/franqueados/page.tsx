'use client';

/**
 * Valle 360 - Central de Franqueados (Cliente Franqueadora)
 * Visão completa das franquias para o cliente franqueador
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  MapPin,
  BarChart3,
  Target,
  Award,
  UserPlus,
  Search,
  Filter,
  RefreshCw,
  ChevronRight,
  Sparkles,
  Clock,
  FileText,
  Star,
  Phone,
  Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FeatureGate } from '@/components/features/FeatureGate';
import { FranchiseeCard, FranchiseePipeline, FranchiseeRanking } from '@/components/franchisee';

// =====================================================
// MOCK DATA
// =====================================================

const mockFranchisees = [
  {
    id: '1',
    unit_name: 'Unidade Pinheiros',
    unit_code: 'SP001',
    city: 'São Paulo',
    state: 'SP',
    owner_name: 'Carlos Eduardo Mendes',
    owner_email: 'carlos@franquiasp.com.br',
    owner_phone: '(11) 99999-1234',
    status: 'active' as const,
    health_status: 'healthy' as const,
    performance_score: 92,
    current_nps: 78,
    churn_risk: 5,
    ranking_position: 1,
    ranking_total: 8,
    vs_network_average: 15,
    followers_total: 12500,
    engagement_rate: 5.2
  },
  {
    id: '2',
    unit_name: 'Unidade Ipanema',
    unit_code: 'RJ001',
    city: 'Rio de Janeiro',
    state: 'RJ',
    owner_name: 'Ana Paula Costa',
    owner_email: 'ana@franquiarj.com.br',
    owner_phone: '(21) 99999-5678',
    status: 'active' as const,
    health_status: 'attention' as const,
    performance_score: 68,
    current_nps: 62,
    churn_risk: 35,
    ranking_position: 5,
    ranking_total: 8,
    vs_network_average: -8,
    followers_total: 8200,
    engagement_rate: 3.8
  },
  {
    id: '3',
    unit_name: 'Unidade Savassi',
    unit_code: 'MG001',
    city: 'Belo Horizonte',
    state: 'MG',
    owner_name: 'Roberto Oliveira',
    owner_email: 'roberto@franquiamg.com.br',
    owner_phone: '(31) 99999-4321',
    status: 'active' as const,
    health_status: 'healthy' as const,
    performance_score: 85,
    current_nps: 75,
    churn_risk: 10,
    ranking_position: 2,
    ranking_total: 8,
    vs_network_average: 12,
    followers_total: 9800,
    engagement_rate: 4.5
  },
  {
    id: '4',
    unit_name: 'Unidade Centro',
    unit_code: 'RS001',
    city: 'Porto Alegre',
    state: 'RS',
    owner_name: 'Fernanda Lima',
    owner_email: 'fernanda@franquiars.com.br',
    owner_phone: '(51) 99999-8765',
    status: 'active' as const,
    health_status: 'critical' as const,
    performance_score: 52,
    current_nps: 45,
    churn_risk: 65,
    ranking_position: 8,
    ranking_total: 8,
    vs_network_average: -25,
    followers_total: 5600,
    engagement_rate: 2.1
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
    stage: 'tests',
    stage_changed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    ai_fit_score: 72
  },
  {
    id: 'c3',
    name: 'Lucas Pereira',
    email: 'lucas@email.com',
    city: 'Fortaleza',
    state: 'CE',
    capital_available: 400000,
    stage: 'analysis',
    stage_changed_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    ai_fit_score: 91
  }
];

const mockRanking = [
  { id: '1', unit_name: 'Pinheiros', city: 'São Paulo', state: 'SP', ranking_position: 1, previous_position: 1, total_score: 92, nps_score: 78, engagement_rate: 5.2 },
  { id: '3', unit_name: 'Savassi', city: 'Belo Horizonte', state: 'MG', ranking_position: 2, previous_position: 3, total_score: 85, nps_score: 75, engagement_rate: 4.5 },
  { id: '5', unit_name: 'Boa Viagem', city: 'Recife', state: 'PE', ranking_position: 3, previous_position: 2, total_score: 82, nps_score: 72, engagement_rate: 4.2 },
  { id: '6', unit_name: 'Moinhos', city: 'Porto Alegre', state: 'RS', ranking_position: 4, previous_position: 4, total_score: 78, nps_score: 68, engagement_rate: 4.0 },
  { id: '2', unit_name: 'Ipanema', city: 'Rio de Janeiro', state: 'RJ', ranking_position: 5, previous_position: 5, total_score: 68, nps_score: 62, engagement_rate: 3.8 }
];

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export default function FranqueadosClientePage() {
  const [activeTab, setActiveTab] = useState<'franquias' | 'recrutamento' | 'ranking' | 'saude'>('franquias');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFranchisee, setSelectedFranchisee] = useState<any>(null);

  // Calcular métricas consolidadas
  const totalFranquias = mockFranchisees.filter(f => f.status === 'active').length;
  const npsMedia = Math.round(mockFranchisees.reduce((sum, f) => sum + (f.current_nps || 0), 0) / mockFranchisees.length);
  const emRisco = mockFranchisees.filter(f => f.health_status === 'critical' || f.health_status === 'attention').length;
  const candidatosAtivos = mockCandidates.length;

  return (
    <FeatureGate feature="franchisee_analysis">
      <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#001533] dark:text-white">
                  Minhas Franquias
                </h1>
                <p className="text-gray-500">
                  Gerencie sua rede de franquias
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                <FileText className="w-4 h-4" />
                Relatório
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#1672d6] text-white rounded-xl text-sm font-medium hover:bg-[#1260b5] transition-colors">
                <UserPlus className="w-4 h-4" />
                Novo Candidato
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-[#001533] to-[#1672d6] rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Building2 className="w-6 h-6" />
                </div>
              </div>
              <p className="text-4xl font-bold">{totalFranquias}</p>
              <p className="text-white/70 text-sm">Franquias Ativas</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <span className={cn(
                  "text-xs font-medium px-2 py-1 rounded-full",
                  npsMedia >= 70 ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"
                )}>
                  {npsMedia >= 70 ? 'Bom' : 'Atenção'}
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">{npsMedia}</p>
              <p className="text-sm text-gray-500">NPS Médio da Rede</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                {emRisco > 0 && (
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-orange-100 text-orange-600">
                    Requer ação
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">{emRisco}</p>
              <p className="text-sm text-gray-500">Em Atenção/Risco</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800 dark:text-white">{candidatosAtivos}</p>
              <p className="text-sm text-gray-500">Candidatos no Pipeline</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            {[
              { id: 'franquias', label: 'Minhas Franquias', icon: Building2 },
              { id: 'recrutamento', label: 'Seleção de Franqueados', icon: UserPlus },
              { id: 'ranking', label: 'Ranking', icon: Award },
              { id: 'saude', label: 'Saúde da Rede', icon: Target }
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
            {/* Minhas Franquias */}
            {activeTab === 'franquias' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
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

                {/* Grid de Franquias */}
                <div className="grid grid-cols-2 gap-6">
                  {mockFranchisees.map(franchisee => (
                    <FranchiseeCard
                      key={franchisee.id}
                      franchisee={franchisee}
                      onClick={() => setSelectedFranchisee(franchisee)}
                      variant="default"
                    />
                  ))}
                </div>

                {/* Insights Val IA */}
                <div className="bg-gradient-to-br from-[#001533] to-[#1672d6] rounded-2xl p-6 text-white">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Insights da Val IA</h3>
                      <p className="text-white/70 text-sm">Análise automática da sua rede</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-white/10 rounded-xl">
                      <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                      <div>
                        <p className="font-medium">Unidade Porto Alegre precisa de atenção</p>
                        <p className="text-sm text-white/70">Performance 25% abaixo da média. Sugestão: agendar reunião de alinhamento.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white/10 rounded-xl">
                      <TrendingUp className="w-5 h-5 text-green-400 mt-0.5" />
                      <div>
                        <p className="font-medium">Unidade Pinheiros é benchmark</p>
                        <p className="text-sm text-white/70">Documentar estratégias para replicar nas outras unidades.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Seleção de Franqueados */}
            {activeTab === 'recrutamento' && (
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
                      Classificação baseada em NPS, engajamento e métricas
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

            {/* Saúde da Rede */}
            {activeTab === 'saude' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Score Geral */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-1 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                    <h3 className="text-white/80 text-sm mb-2">Score de Saúde da Rede</h3>
                    <p className="text-5xl font-bold mb-2">76</p>
                    <p className="text-white/70 text-sm">de 100 pontos</p>
                    <div className="mt-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">+5 pts vs. mês anterior</span>
                    </div>
                  </div>

                  <div className="col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="font-bold text-gray-800 dark:text-white mb-4">Distribuição por Status</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600 flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            Saudáveis
                          </span>
                          <span className="font-bold text-gray-800 dark:text-white">5 franquias</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: '62.5%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600 flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                            Atenção
                          </span>
                          <span className="font-bold text-gray-800 dark:text-white">2 franquias</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-yellow-500 rounded-full" style={{ width: '25%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600 flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            Crítico
                          </span>
                          <span className="font-bold text-gray-800 dark:text-white">1 franquia</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full" style={{ width: '12.5%' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Franquias que precisam de atenção */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    Franquias que Precisam de Atenção
                  </h3>
                  
                  <div className="space-y-4">
                    {mockFranchisees
                      .filter(f => f.health_status !== 'healthy')
                      .map(franchisee => (
                        <div
                          key={franchisee.id}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-xl border",
                            franchisee.health_status === 'critical'
                              ? "border-red-200 bg-red-50"
                              : "border-yellow-200 bg-yellow-50"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white",
                              franchisee.health_status === 'critical' ? "bg-red-500" : "bg-yellow-500"
                            )}>
                              {franchisee.unit_code}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">{franchisee.unit_name}</h4>
                              <p className="text-sm text-gray-500">{franchisee.city}, {franchisee.state}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <p className="text-sm text-gray-500">Performance</p>
                              <p className={cn(
                                "font-bold",
                                franchisee.performance_score && franchisee.performance_score < 60 ? "text-red-600" : "text-yellow-600"
                              )}>
                                {franchisee.performance_score}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-500">NPS</p>
                              <p className={cn(
                                "font-bold",
                                franchisee.current_nps && franchisee.current_nps < 50 ? "text-red-600" : "text-yellow-600"
                              )}>
                                {franchisee.current_nps}
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-500">Risco Churn</p>
                              <p className={cn(
                                "font-bold",
                                franchisee.churn_risk && franchisee.churn_risk >= 50 ? "text-red-600" : "text-yellow-600"
                              )}>
                                {franchisee.churn_risk}%
                              </p>
                            </div>
                            <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                              Ver Detalhes
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </FeatureGate>
  );
}

