'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Scale, FileText, AlertTriangle, Clock, DollarSign, Users,
  Calendar, ChevronRight, Plus, Search, Filter, X, Send,
  CheckCircle2, XCircle, Briefcase, Building2, Phone, Mail,
  Sparkles, Brain, RefreshCw, ArrowRight, History, Gavel,
  Shield, BookOpen, MessageSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, differenceInDays, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import AICollectorCard from '@/components/ai/AICollectorCard'
import SmartInsightsPanel from '@/components/ai/SmartInsightsPanel'

// ==================== TIPOS ====================
interface Contract {
  id: string
  clientId: string
  clientName: string
  type: 'mensal' | 'trimestral' | 'semestral' | 'anual'
  value: number
  startDate: Date
  endDate: Date
  status: 'active' | 'expiring' | 'expired' | 'cancelled'
  services: string[]
  finePercentage: number
  noticePeriod: number // dias
}

interface LegalCase {
  id: string
  type: 'cobranca' | 'trabalhista' | 'contratual' | 'consultoria'
  title: string
  description: string
  clientId?: string
  clientName?: string
  employeeId?: string
  employeeName?: string
  status: 'aberto' | 'em_andamento' | 'aguardando' | 'resolvido' | 'arquivado'
  priority: 'low' | 'medium' | 'high' | 'critical'
  value?: number
  createdAt: Date
  updatedAt: Date
  createdBy: string
  assignedTo?: string
  history: CaseHistoryEntry[]
}

interface CaseHistoryEntry {
  id: string
  action: string
  description: string
  createdAt: Date
  createdBy: string
}

interface CollectionAttempt {
  id: string
  caseId: string
  type: 'email' | 'whatsapp' | 'carta' | 'telefone' | 'extrajudicial'
  sentAt: Date
  status: 'enviado' | 'visualizado' | 'respondido' | 'sem_resposta'
  response?: string
}

// ==================== CONSTANTES ====================
const STATUS_CONFIG = {
  aberto: { label: 'Aberto', color: 'bg-blue-100 text-blue-700' },
  em_andamento: { label: 'Em Andamento', color: 'bg-yellow-100 text-yellow-700' },
  aguardando: { label: 'Aguardando', color: 'bg-purple-100 text-purple-700' },
  resolvido: { label: 'Resolvido', color: 'bg-green-100 text-green-700' },
  arquivado: { label: 'Arquivado', color: 'bg-gray-100 text-gray-700' }
}

const PRIORITY_CONFIG = {
  low: { label: 'Baixa', color: 'text-gray-500' },
  medium: { label: 'Média', color: 'text-yellow-600' },
  high: { label: 'Alta', color: 'text-orange-600' },
  critical: { label: 'Crítica', color: 'text-red-600' }
}

const CASE_TYPE_CONFIG = {
  cobranca: { label: 'Cobrança', icon: DollarSign, color: 'text-green-600', bgColor: 'bg-green-100' },
  trabalhista: { label: 'Trabalhista', icon: Briefcase, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  contratual: { label: 'Contratual', icon: FileText, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  consultoria: { label: 'Consultoria', icon: BookOpen, color: 'text-amber-600', bgColor: 'bg-amber-100' }
}

// ==================== MOCK DATA ====================
const MOCK_CONTRACTS: Contract[] = [
  {
    id: '1',
    clientId: '1',
    clientName: 'Tech Solutions',
    type: 'anual',
    value: 5000,
    startDate: new Date(Date.now() - 300 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 65 * 24 * 60 * 60 * 1000),
    status: 'active',
    services: ['Social Media', 'Tráfego Pago'],
    finePercentage: 30,
    noticePeriod: 30
  },
  {
    id: '2',
    clientId: '2',
    clientName: 'E-commerce Plus',
    type: 'semestral',
    value: 8000,
    startDate: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: 'expiring',
    services: ['Tráfego Pago', 'Criação de Conteúdo', 'E-mail Marketing'],
    finePercentage: 25,
    noticePeriod: 15
  },
  {
    id: '3',
    clientId: '3',
    clientName: 'Fashion Store',
    type: 'mensal',
    value: 3000,
    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    endDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: 'expired',
    services: ['Social Media'],
    finePercentage: 20,
    noticePeriod: 7
  }
]

const MOCK_CASES: LegalCase[] = [
  {
    id: '1',
    type: 'cobranca',
    title: 'Inadimplência - Fashion Store',
    description: 'Cliente com 45 dias de atraso. Total devido: R$ 9.000,00',
    clientId: '3',
    clientName: 'Fashion Store',
    status: 'em_andamento',
    priority: 'high',
    value: 9000,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    createdBy: 'Financeiro',
    history: [
      { id: '1', action: 'Caso aberto', description: 'Escalado pelo Financeiro após D+30', createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), createdBy: 'Sistema' },
      { id: '2', action: 'Carta enviada', description: 'Primeira notificação extrajudicial enviada', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), createdBy: 'Jurídico' }
    ]
  },
  {
    id: '2',
    type: 'contratual',
    title: 'Revisão de Contrato - Tech Solutions',
    description: 'Cliente solicitou revisão de cláusulas para renovação',
    clientId: '1',
    clientName: 'Tech Solutions',
    status: 'aguardando',
    priority: 'medium',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    createdBy: 'Comercial',
    history: [
      { id: '1', action: 'Caso aberto', description: 'Solicitação de revisão contratual', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), createdBy: 'Comercial' }
    ]
  },
  {
    id: '3',
    type: 'consultoria',
    title: 'Dúvida sobre férias coletivas',
    description: 'RH precisa de orientação sobre procedimento de férias coletivas',
    employeeId: '1',
    employeeName: 'RH - Maria Silva',
    status: 'aberto',
    priority: 'low',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    createdBy: 'RH',
    history: []
  }
]

// ==================== COMPONENTE PRINCIPAL ====================
export default function JuridicoPage() {
  const [contracts, setContracts] = useState<Contract[]>(MOCK_CONTRACTS)
  const [cases, setCases] = useState<LegalCase[]>(MOCK_CASES)
  const [activeTab, setActiveTab] = useState<'casos' | 'contratos' | 'cobrancas' | 'consultoria'>('casos')
  const [selectedCase, setSelectedCase] = useState<LegalCase | null>(null)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [showNewCaseModal, setShowNewCaseModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Estatísticas
  const stats = {
    totalCases: cases.length,
    openCases: cases.filter(c => c.status === 'aberto' || c.status === 'em_andamento').length,
    totalContracts: contracts.length,
    expiringContracts: contracts.filter(c => c.status === 'expiring').length,
    totalDebt: cases.filter(c => c.type === 'cobranca' && c.value).reduce((sum, c) => sum + (c.value || 0), 0),
    criticalCases: cases.filter(c => c.priority === 'critical' || c.priority === 'high').length
  }

  const filteredCases = cases.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || c.status === filterStatus
    const matchesTab = activeTab === 'casos' ||
                      (activeTab === 'cobrancas' && c.type === 'cobranca') ||
                      (activeTab === 'consultoria' && c.type === 'consultoria')
    return matchesSearch && matchesStatus && matchesTab
  })

  const calculateFine = (contract: Contract): number => {
    const remainingMonths = Math.max(0, differenceInDays(contract.endDate, new Date()) / 30)
    return Math.round(contract.value * remainingMonths * (contract.finePercentage / 100))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Jurídico</h1>
              <p className="text-sm text-gray-500">Contratos, cobranças e consultoria</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNewCaseModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Novo Caso
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Gavel className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalCases}</p>
                <p className="text-xs text-gray-500">Total de Casos</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.openCases}</p>
                <p className="text-xs text-gray-500">Casos Abertos</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalContracts}</p>
                <p className="text-xs text-gray-500">Contratos</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.expiringContracts}</p>
                <p className="text-xs text-gray-500">Vencendo</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  R$ {(stats.totalDebt / 1000).toFixed(0)}k
                </p>
                <p className="text-xs text-gray-500">Em Cobrança</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.criticalCases}</p>
                <p className="text-xs text-gray-500">Alta Prioridade</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Cases & Contracts */}
          <div className="col-span-2 space-y-6">
            {/* AI Collector */}
            <AICollectorCard area="juridico" maxAlerts={3} />

            {/* Tabs */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="flex border-b">
                {[
                  { id: 'casos', label: 'Todos os Casos', icon: Gavel },
                  { id: 'contratos', label: 'Contratos', icon: FileText },
                  { id: 'cobrancas', label: 'Cobranças', icon: DollarSign },
                  { id: 'consultoria', label: 'Consultoria', icon: BookOpen }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
                      activeTab === tab.id
                        ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600"
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-4">
                {activeTab === 'contratos' ? (
                  <div className="space-y-3">
                    {contracts.map((contract, index) => {
                      const daysUntilExpiry = differenceInDays(contract.endDate, new Date())
                      const fine = calculateFine(contract)

                      return (
                        <motion.div
                          key={contract.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => setSelectedContract(contract)}
                          className={cn(
                            "p-4 border rounded-xl cursor-pointer hover:shadow-md transition-all",
                            contract.status === 'expiring' && "border-orange-300 bg-orange-50",
                            contract.status === 'expired' && "border-red-300 bg-red-50"
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-800">{contract.clientName}</h4>
                                <span className={cn(
                                  "text-xs px-2 py-0.5 rounded-full",
                                  contract.status === 'active' ? "bg-green-100 text-green-700" :
                                  contract.status === 'expiring' ? "bg-orange-100 text-orange-700" :
                                  contract.status === 'expired' ? "bg-red-100 text-red-700" :
                                  "bg-gray-100 text-gray-700"
                                )}>
                                  {contract.status === 'active' ? 'Ativo' :
                                   contract.status === 'expiring' ? 'Vencendo' :
                                   contract.status === 'expired' ? 'Vencido' : 'Cancelado'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 mb-2">
                                {contract.services.join(', ')}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gray-400">
                                <span>Valor: R$ {contract.value.toLocaleString('pt-BR')}/mês</span>
                                <span>Tipo: {contract.type}</span>
                                <span>Multa: {contract.finePercentage}%</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={cn(
                                "text-sm font-medium",
                                daysUntilExpiry < 0 ? "text-red-600" :
                                daysUntilExpiry < 30 ? "text-orange-600" :
                                "text-gray-600"
                              )}>
                                {daysUntilExpiry < 0 
                                  ? `Vencido há ${Math.abs(daysUntilExpiry)} dias`
                                  : `${daysUntilExpiry} dias restantes`}
                              </p>
                              {fine > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Multa rescisória: R$ {fine.toLocaleString('pt-BR')}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                ) : (
                  <>
                    {/* Search & Filter */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar casos..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="all">Todos os status</option>
                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                          <option key={key} value={key}>{config.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Cases List */}
                    <div className="space-y-3">
                      {filteredCases.map((legalCase, index) => {
                        const typeConfig = CASE_TYPE_CONFIG[legalCase.type]
                        const statusConfig = STATUS_CONFIG[legalCase.status]
                        const priorityConfig = PRIORITY_CONFIG[legalCase.priority]
                        const TypeIcon = typeConfig.icon

                        return (
                          <motion.div
                            key={legalCase.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setSelectedCase(legalCase)}
                            className="p-4 border rounded-xl cursor-pointer hover:shadow-md transition-all"
                          >
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center",
                                typeConfig.bgColor
                              )}>
                                <TypeIcon className={cn("w-5 h-5", typeConfig.color)} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-gray-800">{legalCase.title}</h4>
                                  <span className={cn("text-xs px-2 py-0.5 rounded-full", statusConfig.color)}>
                                    {statusConfig.label}
                                  </span>
                                  <span className={cn("text-xs font-medium", priorityConfig.color)}>
                                    • {priorityConfig.label}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{legalCase.description}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-400">
                                  <span>Criado por: {legalCase.createdBy}</span>
                                  <span>
                                    {format(legalCase.createdAt, "dd/MM/yyyy", { locale: ptBR })}
                                  </span>
                                  {legalCase.value && (
                                    <span className="text-green-600 font-medium">
                                      R$ {legalCase.value.toLocaleString('pt-BR')}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Insights & AI */}
          <div className="space-y-6">
            {/* Smart Insights */}
            <SmartInsightsPanel area="juridico" maxInsights={4} />

            {/* AI Legal Assistant */}
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800">Assistente Jurídico IA</h3>
              </div>
              <div className="space-y-3">
                <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    Gerar carta de cobrança
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    IA gera carta extrajudicial personalizada
                  </p>
                </button>
                <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                    <FileText className="w-4 h-4 text-purple-600" />
                    Calcular multa rescisória
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Cálculo automático baseado no contrato
                  </p>
                </button>
                <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    Consultar direito trabalhista
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Pergunte sobre CLT, férias, rescisão, etc.
                  </p>
                </button>
                <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                    <Scale className="w-4 h-4 text-indigo-600" />
                    Gerar minuta de contrato
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Template personalizado por serviço
                  </p>
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-4">
              <h3 className="font-semibold text-indigo-800 mb-3">Resumo do Mês</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-indigo-600">Casos resolvidos:</span>
                  <span className="font-medium text-indigo-800">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-600">Valor recuperado:</span>
                  <span className="font-medium text-green-600">R$ 45.000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-600">Contratos renovados:</span>
                  <span className="font-medium text-indigo-800">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-indigo-600">Consultorias realizadas:</span>
                  <span className="font-medium text-indigo-800">15</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Case Detail Modal */}
      <AnimatePresence>
        {selectedCase && (
          <CaseDetailModal
            legalCase={selectedCase}
            onClose={() => setSelectedCase(null)}
          />
        )}
      </AnimatePresence>

      {/* New Case Modal */}
      <AnimatePresence>
        {showNewCaseModal && (
          <NewCaseModal
            onClose={() => setShowNewCaseModal(false)}
            onSubmit={(data) => {
              setCases([...cases, { ...data, id: Date.now().toString() } as LegalCase])
              setShowNewCaseModal(false)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== CASE DETAIL MODAL ====================
function CaseDetailModal({
  legalCase,
  onClose
}: {
  legalCase: LegalCase
  onClose: () => void
}) {
  const typeConfig = CASE_TYPE_CONFIG[legalCase.type]
  const statusConfig = STATUS_CONFIG[legalCase.status]
  const TypeIcon = typeConfig.icon

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", typeConfig.bgColor)}>
                <TypeIcon className={cn("w-6 h-6", typeConfig.color)} />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">{legalCase.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn("text-xs px-2 py-0.5 rounded-full", statusConfig.color)}>
                    {statusConfig.label}
                  </span>
                  <span className="text-xs text-gray-500">
                    {typeConfig.label}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Descrição</h4>
              <p className="text-gray-600">{legalCase.description}</p>
            </div>

            {legalCase.value && (
              <div className="p-4 bg-green-50 rounded-xl">
                <p className="text-sm text-green-600">Valor em questão</p>
                <p className="text-2xl font-bold text-green-700">
                  R$ {legalCase.value.toLocaleString('pt-BR')}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Criado por</p>
                <p className="font-medium">{legalCase.createdBy}</p>
              </div>
              <div>
                <p className="text-gray-500">Data de abertura</p>
                <p className="font-medium">{format(legalCase.createdAt, "dd/MM/yyyy", { locale: ptBR })}</p>
              </div>
              {legalCase.clientName && (
                <div>
                  <p className="text-gray-500">Cliente</p>
                  <p className="font-medium">{legalCase.clientName}</p>
                </div>
              )}
              {legalCase.employeeName && (
                <div>
                  <p className="text-gray-500">Solicitante</p>
                  <p className="font-medium">{legalCase.employeeName}</p>
                </div>
              )}
            </div>

            {/* Histórico */}
            {legalCase.history.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Histórico
                </h4>
                <div className="space-y-3">
                  {legalCase.history.map((entry, index) => (
                    <div key={entry.id} className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2" />
                      <div>
                        <p className="font-medium text-gray-800">{entry.action}</p>
                        <p className="text-sm text-gray-600">{entry.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {format(entry.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} • {entry.createdBy}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex gap-3">
          <button className="flex-1 px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50">
            Adicionar Nota
          </button>
          {legalCase.type === 'cobranca' && (
            <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2">
              <Send className="w-4 h-4" />
              Enviar Cobrança
            </button>
          )}
          <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Atualizar Status
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ==================== NEW CASE MODAL ====================
function NewCaseModal({
  onClose,
  onSubmit
}: {
  onClose: () => void
  onSubmit: (data: Partial<LegalCase>) => void
}) {
  const [formData, setFormData] = useState({
    type: 'consultoria' as LegalCase['type'],
    title: '',
    description: '',
    priority: 'medium' as LegalCase['priority'],
    clientName: '',
    value: ''
  })

  const handleSubmit = () => {
    onSubmit({
      ...formData,
      value: formData.value ? parseFloat(formData.value) : undefined,
      status: 'aberto',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'Você',
      history: []
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
      >
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">Novo Caso Jurídico</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {Object.entries(CASE_TYPE_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Inadimplência - Cliente XYZ"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o caso..."
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>

            {formData.type === 'cobranca' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="0,00"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>

          {(formData.type === 'cobranca' || formData.type === 'contratual') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                placeholder="Nome do cliente"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!formData.title || !formData.description}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            Criar Caso
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}






