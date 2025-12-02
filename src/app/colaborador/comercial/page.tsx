'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, DollarSign, TrendingUp, Target, Phone, Mail, Calendar,
  ChevronRight, Plus, Search, Filter, MoreHorizontal, Clock,
  Star, Flame, Thermometer, Snowflake, Send, FileText, Building2,
  ArrowUpRight, ArrowDownRight, Zap, Brain, Eye, MessageSquare,
  CheckCircle2, AlertTriangle, X, Sparkles, RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import AICollectorCard from '@/components/ai/AICollectorCard'
import SmartInsightsPanel from '@/components/ai/SmartInsightsPanel'
import GoalsTracker from '@/components/goals/GoalsTracker'

// ==================== TIPOS ====================
interface Lead {
  id: string
  name: string
  company: string
  email: string
  phone: string
  source: string
  temperature: 'hot' | 'warm' | 'cold'
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
  value: number
  probability: number
  lastContact?: Date
  nextAction?: string
  notes?: string
  createdAt: Date
  assignee: string
}

interface Opportunity {
  id: string
  clientId: string
  clientName: string
  type: 'upsell' | 'cross-sell' | 'renewal'
  currentPlan?: string
  suggestedPlan?: string
  potentialValue: number
  probability: number
  reason: string
  aiSuggestion: string
}

interface Meeting {
  id: string
  title: string
  client: string
  date: Date
  time: string
  type: 'discovery' | 'proposal' | 'negotiation' | 'closing'
  status: 'scheduled' | 'completed' | 'cancelled'
}

// ==================== CONSTANTES ====================
const TEMPERATURE_CONFIG = {
  hot: { label: 'Quente', color: 'text-red-600', bgColor: 'bg-red-100', icon: Flame },
  warm: { label: 'Morno', color: 'text-orange-600', bgColor: 'bg-orange-100', icon: Thermometer },
  cold: { label: 'Frio', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Snowflake }
}

const STATUS_CONFIG = {
  new: { label: 'Novo', color: 'bg-gray-100 text-gray-700' },
  contacted: { label: 'Contatado', color: 'bg-blue-100 text-blue-700' },
  qualified: { label: 'Qualificado', color: 'bg-purple-100 text-purple-700' },
  proposal: { label: 'Proposta', color: 'bg-amber-100 text-amber-700' },
  negotiation: { label: 'Negociação', color: 'bg-orange-100 text-orange-700' },
  won: { label: 'Ganho', color: 'bg-green-100 text-green-700' },
  lost: { label: 'Perdido', color: 'bg-red-100 text-red-700' }
}

// ==================== MOCK DATA ====================
const MOCK_LEADS: Lead[] = [
  {
    id: '1',
    name: 'Carlos Silva',
    company: 'Tech Solutions',
    email: 'carlos@techsolutions.com',
    phone: '(11) 99999-0001',
    source: 'Site',
    temperature: 'hot',
    status: 'proposal',
    value: 15000,
    probability: 80,
    lastContact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    nextAction: 'Enviar proposta ajustada',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    assignee: 'Você'
  },
  {
    id: '2',
    name: 'Ana Oliveira',
    company: 'E-commerce Plus',
    email: 'ana@ecommerceplus.com',
    phone: '(11) 99999-0002',
    source: 'Indicação',
    temperature: 'warm',
    status: 'qualified',
    value: 8500,
    probability: 60,
    lastContact: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    nextAction: 'Agendar reunião de apresentação',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    assignee: 'Você'
  },
  {
    id: '3',
    name: 'Roberto Santos',
    company: 'Fashion Store',
    email: 'roberto@fashionstore.com',
    phone: '(11) 99999-0003',
    source: 'LinkedIn',
    temperature: 'cold',
    status: 'contacted',
    value: 5000,
    probability: 30,
    lastContact: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    assignee: 'Você'
  }
]

const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: '1',
    clientId: '1',
    clientName: 'Tech Solutions',
    type: 'upsell',
    currentPlan: 'Social Media Basic',
    suggestedPlan: 'Social Media + Tráfego',
    potentialValue: 5000,
    probability: 78,
    reason: 'Cliente com alto engajamento, contrato vencendo em 30 dias',
    aiSuggestion: 'Oferecer upgrade com 15% de desconto. Momento ideal para contato.'
  },
  {
    id: '2',
    clientId: '2',
    clientName: 'E-commerce Plus',
    type: 'cross-sell',
    currentPlan: 'Tráfego Pago',
    suggestedPlan: 'Tráfego + Criação de Conteúdo',
    potentialValue: 3500,
    probability: 65,
    reason: 'Campanhas performando bem, mas conteúdo fraco',
    aiSuggestion: 'Apresentar cases de sucesso de clientes com pacote completo.'
  },
  {
    id: '3',
    clientId: '3',
    clientName: 'Startup XYZ',
    type: 'renewal',
    potentialValue: 8000,
    probability: 85,
    reason: 'Contrato vence em 15 dias, cliente satisfeito',
    aiSuggestion: 'Propor renovação com reajuste de 10% e benefícios adicionais.'
  }
]

const MOCK_MEETINGS: Meeting[] = [
  {
    id: '1',
    title: 'Apresentação de Proposta',
    client: 'Tech Solutions',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    time: '14:00',
    type: 'proposal',
    status: 'scheduled'
  },
  {
    id: '2',
    title: 'Discovery Call',
    client: 'Nova Empresa ABC',
    date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    time: '10:00',
    type: 'discovery',
    status: 'scheduled'
  }
]

// ==================== COMPONENTE PRINCIPAL ====================
export default function ComercialPage() {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS)
  const [opportunities, setOpportunities] = useState<Opportunity[]>(MOCK_OPPORTUNITIES)
  const [meetings, setMeetings] = useState<Meeting[]>(MOCK_MEETINGS)
  const [loading, setLoading] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showProposalModal, setShowProposalModal] = useState(false)
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'pipeline' | 'calendar' | 'opportunities'>('pipeline')

  // Estatísticas
  const stats = {
    totalLeads: leads.length,
    hotLeads: leads.filter(l => l.temperature === 'hot').length,
    pipelineValue: leads.reduce((sum, l) => sum + l.value, 0),
    conversionRate: 32, // Mock
    avgDealSize: Math.round(leads.reduce((sum, l) => sum + l.value, 0) / leads.length),
    meetingsThisWeek: meetings.filter(m => m.status === 'scheduled').length
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleSendProposal = async (opportunity: Opportunity) => {
    // Simular envio de proposta gerada por IA
    setSelectedOpportunity(opportunity)
    setShowProposalModal(true)
  }

  const handleScrapLeads = async () => {
    setLoading(true)
    // Simular scraping de leads
    await new Promise(resolve => setTimeout(resolve, 2000))
    setLoading(false)
    // Adicionar novos leads mock
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Painel Comercial</h1>
            <p className="text-sm text-gray-500">Gerencie leads, oportunidades e feche mais negócios</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleScrapLeads}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Brain className="w-4 h-4" />
              )}
              IA: Buscar Leads
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              Novo Lead
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalLeads}</p>
                <p className="text-xs text-gray-500">Total de Leads</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <Flame className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.hotLeads}</p>
                <p className="text-xs text-gray-500">Leads Quentes</p>
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
                  R$ {(stats.pipelineValue / 1000).toFixed(0)}k
                </p>
                <p className="text-xs text-gray-500">Pipeline</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.conversionRate}%</p>
                <p className="text-xs text-gray-500">Conversão</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  R$ {(stats.avgDealSize / 1000).toFixed(1)}k
                </p>
                <p className="text-xs text-gray-500">Ticket Médio</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.meetingsThisWeek}</p>
                <p className="text-xs text-gray-500">Reuniões</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Pipeline & Leads */}
          <div className="col-span-2 space-y-6">
            {/* IA Collector Card */}
            <AICollectorCard area="comercial" maxAlerts={3} />

            {/* Tabs */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="flex border-b">
                {[
                  { id: 'pipeline', label: 'Pipeline de Leads', icon: Users },
                  { id: 'calendar', label: 'Agenda', icon: Calendar },
                  { id: 'opportunities', label: 'Oportunidades', icon: Zap }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
                      activeTab === tab.id
                        ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
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
                {activeTab === 'pipeline' && (
                  <>
                    {/* Search & Filter */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar leads..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">Todos os status</option>
                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                          <option key={key} value={key}>{config.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Leads List */}
                    <div className="space-y-3">
                      {filteredLeads.map((lead, index) => {
                        const tempConfig = TEMPERATURE_CONFIG[lead.temperature]
                        const statusConfig = STATUS_CONFIG[lead.status]
                        const TempIcon = tempConfig.icon
                        const daysSinceContact = lead.lastContact
                          ? differenceInDays(new Date(), lead.lastContact)
                          : null

                        return (
                          <motion.div
                            key={lead.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setSelectedLead(lead)}
                            className="p-4 border rounded-xl hover:shadow-md transition-all cursor-pointer group"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className={cn(
                                  "w-10 h-10 rounded-full flex items-center justify-center",
                                  tempConfig.bgColor
                                )}>
                                  <TempIcon className={cn("w-5 h-5", tempConfig.color)} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-gray-800">{lead.name}</h4>
                                    <span className={cn(
                                      "text-xs px-2 py-0.5 rounded-full",
                                      statusConfig.color
                                    )}>
                                      {statusConfig.label}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <Building2 className="w-3 h-3" />
                                    {lead.company}
                                  </p>
                                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                    <span className="flex items-center gap-1">
                                      <Mail className="w-3 h-3" />
                                      {lead.email}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Phone className="w-3 h-3" />
                                      {lead.phone}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <p className="text-lg font-bold text-green-600">
                                  R$ {lead.value.toLocaleString('pt-BR')}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {lead.probability}% probabilidade
                                </p>
                                {daysSinceContact !== null && daysSinceContact > 3 && (
                                  <p className="text-xs text-red-500 flex items-center gap-1 justify-end mt-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    {daysSinceContact}d sem contato
                                  </p>
                                )}
                              </div>
                            </div>

                            {lead.nextAction && (
                              <div className="mt-3 pt-3 border-t flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Próxima ação:</span> {lead.nextAction}
                                </p>
                                <button className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700">
                                  Executar
                                </button>
                              </div>
                            )}
                          </motion.div>
                        )
                      })}
                    </div>
                  </>
                )}

                {activeTab === 'calendar' && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800 mb-4">Próximas Reuniões</h4>
                    {meetings.map((meeting, index) => (
                      <motion.div
                        key={meeting.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-4 p-4 border rounded-xl hover:shadow-md transition-all"
                      >
                        <div className="w-14 h-14 rounded-xl bg-blue-100 flex flex-col items-center justify-center">
                          <span className="text-lg font-bold text-blue-600">
                            {format(meeting.date, 'dd')}
                          </span>
                          <span className="text-xs text-blue-500">
                            {format(meeting.date, 'MMM', { locale: ptBR })}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{meeting.title}</h4>
                          <p className="text-sm text-gray-500">{meeting.client}</p>
                          <p className="text-xs text-gray-400">{meeting.time}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <Phone className="w-4 h-4 text-gray-500" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <MessageSquare className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {activeTab === 'opportunities' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-800">Oportunidades de Upsell</h4>
                      <span className="text-sm text-gray-500">
                        Potencial: R$ {opportunities.reduce((sum, o) => sum + o.potentialValue, 0).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    {opportunities.map((opp, index) => (
                      <motion.div
                        key={opp.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 border rounded-xl hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-800">{opp.clientName}</h4>
                              <span className={cn(
                                "text-xs px-2 py-0.5 rounded-full",
                                opp.type === 'upsell' ? "bg-green-100 text-green-700" :
                                opp.type === 'cross-sell' ? "bg-purple-100 text-purple-700" :
                                "bg-blue-100 text-blue-700"
                              )}>
                                {opp.type === 'upsell' ? 'Upsell' :
                                 opp.type === 'cross-sell' ? 'Cross-sell' : 'Renovação'}
                              </span>
                            </div>
                            {opp.currentPlan && (
                              <p className="text-sm text-gray-500">
                                {opp.currentPlan} → {opp.suggestedPlan}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">
                              +R$ {opp.potentialValue.toLocaleString('pt-BR')}
                            </p>
                            <p className="text-xs text-gray-500">{opp.probability}% probabilidade</p>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 mb-3">{opp.reason}</p>

                        <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg mb-3">
                          <div className="flex items-center gap-2 text-purple-700 text-sm font-medium mb-1">
                            <Sparkles className="w-4 h-4" />
                            Sugestão da IA
                          </div>
                          <p className="text-sm text-purple-600">{opp.aiSuggestion}</p>
                        </div>

                        <button
                          onClick={() => handleSendProposal(opp)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
                        >
                          <Send className="w-4 h-4" />
                          Enviar Proposta Automática
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Insights & Goals */}
          <div className="space-y-6">
            {/* Goals Tracker */}
            <GoalsTracker area="comercial" />

            {/* Smart Insights */}
            <SmartInsightsPanel area="comercial" maxInsights={4} />
          </div>
        </div>
      </div>

      {/* Proposal Modal */}
      <AnimatePresence>
        {showProposalModal && selectedOpportunity && (
          <ProposalModal
            opportunity={selectedOpportunity}
            onClose={() => {
              setShowProposalModal(false)
              setSelectedOpportunity(null)
            }}
          />
        )}
      </AnimatePresence>

      {/* Lead Detail Modal */}
      <AnimatePresence>
        {selectedLead && (
          <LeadDetailModal
            lead={selectedLead}
            onClose={() => setSelectedLead(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== PROPOSAL MODAL ====================
function ProposalModal({
  opportunity,
  onClose
}: {
  opportunity: Opportunity
  onClose: () => void
}) {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSend = async () => {
    setSending(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setSending(false)
    setSent(true)
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
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">Proposta Automática</h2>
                <p className="text-sm text-gray-500">{opportunity.clientName}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {sent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Proposta Enviada!</h3>
              <p className="text-gray-500">
                A proposta foi enviada para {opportunity.clientName}. 
                Você receberá uma notificação quando o cliente visualizar.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-medium text-gray-800 mb-2">Resumo da Proposta</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Cliente:</span>
                      <span className="font-medium">{opportunity.clientName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tipo:</span>
                      <span className="font-medium capitalize">{opportunity.type}</span>
                    </div>
                    {opportunity.suggestedPlan && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Plano:</span>
                        <span className="font-medium">{opportunity.suggestedPlan}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-500">Valor:</span>
                      <span className="font-bold text-green-600">
                        R$ {opportunity.potentialValue.toLocaleString('pt-BR')}/mês
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-xl">
                  <div className="flex items-center gap-2 text-purple-700 font-medium mb-2">
                    <Sparkles className="w-4 h-4" />
                    Mensagem gerada pela IA
                  </div>
                  <p className="text-sm text-purple-600">
                    "Olá! Notamos que você está aproveitando bem nossos serviços de {opportunity.currentPlan}. 
                    Gostaríamos de apresentar uma oportunidade exclusiva: {opportunity.suggestedPlan} 
                    com condições especiais. Podemos agendar uma conversa?"
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {!sent && (
          <div className="p-6 border-t bg-gray-50 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar Proposta
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

// ==================== LEAD DETAIL MODAL ====================
function LeadDetailModal({
  lead,
  onClose
}: {
  lead: Lead
  onClose: () => void
}) {
  const tempConfig = TEMPERATURE_CONFIG[lead.temperature]
  const statusConfig = STATUS_CONFIG[lead.status]
  const TempIcon = tempConfig.icon

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
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                tempConfig.bgColor
              )}>
                <TempIcon className={cn("w-6 h-6", tempConfig.color)} />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">{lead.name}</h2>
                <p className="text-sm text-gray-500">{lead.company}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <span className={cn("px-3 py-1 rounded-full text-sm font-medium", statusConfig.color)}>
              {statusConfig.label}
            </span>
            <span className={cn("px-3 py-1 rounded-full text-sm font-medium", tempConfig.bgColor, tempConfig.color)}>
              Lead {tempConfig.label}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Valor Potencial</p>
              <p className="text-lg font-bold text-green-600">
                R$ {lead.value.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Probabilidade</p>
              <p className="text-lg font-bold text-blue-600">{lead.probability}%</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>{lead.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{lead.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>
                Último contato: {lead.lastContact 
                  ? formatDistanceToNow(lead.lastContact, { addSuffix: true, locale: ptBR })
                  : 'Nunca'}
              </span>
            </div>
          </div>

          {lead.nextAction && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 font-medium">Próxima Ação</p>
              <p className="text-sm text-blue-700">{lead.nextAction}</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50 flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50">
            <Phone className="w-4 h-4" />
            Ligar
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50">
            <Mail className="w-4 h-4" />
            Email
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <FileText className="w-4 h-4" />
            Proposta
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}



