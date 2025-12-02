'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, TrendingDown, DollarSign, Target, Users, Eye,
  MousePointer, ShoppingCart, BarChart3, PieChart, Activity,
  AlertTriangle, CheckCircle2, Zap, Brain, RefreshCw, X,
  ChevronRight, Send, CreditCard, Plus, Search, Filter,
  Globe, Facebook, Sparkles, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import AICollectorCard from '@/components/ai/AICollectorCard'
import SmartInsightsPanel from '@/components/ai/SmartInsightsPanel'
import GoalsTracker from '@/components/goals/GoalsTracker'

// ==================== TIPOS ====================
interface Campaign {
  id: string
  clientId: string
  clientName: string
  name: string
  platform: 'meta' | 'google' | 'tiktok' | 'linkedin'
  status: 'active' | 'paused' | 'completed'
  budget: number
  spent: number
  impressions: number
  clicks: number
  conversions: number
  cpc: number
  cpa: number
  roas: number
  startDate: Date
  endDate?: Date
}

interface Client {
  id: string
  name: string
  monthlyBudget: number
  currentSpend: number
  lastRecharge?: Date
  campaigns: number
  avgROAS: number
}

interface RechargeRequest {
  id: string
  clientId: string
  clientName: string
  amount: number
  status: 'pending' | 'sent' | 'paid' | 'rejected'
  sentAt?: Date
  paidAt?: Date
  message?: string
}

// ==================== CONSTANTES ====================
const PLATFORM_CONFIG = {
  meta: { icon: Facebook, color: '#1877F2', bgColor: 'bg-blue-100', label: 'Meta Ads' },
  google: { icon: Globe, color: '#4285F4', bgColor: 'bg-red-100', label: 'Google Ads' },
  tiktok: { icon: Activity, color: '#000000', bgColor: 'bg-gray-100', label: 'TikTok Ads' },
  linkedin: { icon: Globe, color: '#0A66C2', bgColor: 'bg-sky-100', label: 'LinkedIn Ads' }
}

// ==================== MOCK DATA ====================
const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: '1',
    clientId: '1',
    clientName: 'Tech Solutions',
    name: 'Remarketing - Black Friday',
    platform: 'meta',
    status: 'active',
    budget: 5000,
    spent: 3250,
    impressions: 125000,
    clicks: 4500,
    conversions: 85,
    cpc: 0.72,
    cpa: 38.24,
    roas: 5.2,
    startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
  },
  {
    id: '2',
    clientId: '1',
    clientName: 'Tech Solutions',
    name: 'Prospecção - Leads B2B',
    platform: 'google',
    status: 'active',
    budget: 3000,
    spent: 2100,
    impressions: 45000,
    clicks: 1200,
    conversions: 32,
    cpc: 1.75,
    cpa: 65.63,
    roas: 3.1,
    startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
  },
  {
    id: '3',
    clientId: '2',
    clientName: 'E-commerce Plus',
    name: 'Vendas - Coleção Verão',
    platform: 'meta',
    status: 'active',
    budget: 8000,
    spent: 6500,
    impressions: 280000,
    clicks: 12000,
    conversions: 245,
    cpc: 0.54,
    cpa: 26.53,
    roas: 7.8,
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
  },
  {
    id: '4',
    clientId: '3',
    clientName: 'Fashion Store',
    name: 'Awareness - Nova Marca',
    platform: 'meta',
    status: 'paused',
    budget: 2000,
    spent: 1800,
    impressions: 95000,
    clicks: 2800,
    conversions: 15,
    cpc: 0.64,
    cpa: 120.00,
    roas: 1.2,
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  }
]

const MOCK_CLIENTS: Client[] = [
  { id: '1', name: 'Tech Solutions', monthlyBudget: 10000, currentSpend: 5350, lastRecharge: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), campaigns: 2, avgROAS: 4.15 },
  { id: '2', name: 'E-commerce Plus', monthlyBudget: 15000, currentSpend: 6500, lastRecharge: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), campaigns: 1, avgROAS: 7.8 },
  { id: '3', name: 'Fashion Store', monthlyBudget: 5000, currentSpend: 1800, campaigns: 1, avgROAS: 1.2 }
]

// ==================== COMPONENTE PRINCIPAL ====================
export default function TrafegoPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS)
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS)
  const [selectedClient, setSelectedClient] = useState<string>('all')
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [showRechargeModal, setShowRechargeModal] = useState(false)
  const [rechargeClient, setRechargeClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(false)

  // Estatísticas gerais
  const filteredCampaigns = selectedClient === 'all' 
    ? campaigns 
    : campaigns.filter(c => c.clientId === selectedClient)

  const stats = {
    totalSpent: filteredCampaigns.reduce((sum, c) => sum + c.spent, 0),
    totalBudget: filteredCampaigns.reduce((sum, c) => sum + c.budget, 0),
    totalConversions: filteredCampaigns.reduce((sum, c) => sum + c.conversions, 0),
    avgROAS: filteredCampaigns.length > 0 
      ? filteredCampaigns.reduce((sum, c) => sum + c.roas, 0) / filteredCampaigns.length 
      : 0,
    avgCPA: filteredCampaigns.length > 0
      ? filteredCampaigns.reduce((sum, c) => sum + c.cpa, 0) / filteredCampaigns.length
      : 0,
    activeCampaigns: filteredCampaigns.filter(c => c.status === 'active').length
  }

  const handleRechargeRequest = (client: Client) => {
    setRechargeClient(client)
    setShowRechargeModal(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Painel de Tráfego</h1>
            <p className="text-sm text-gray-500">Gerencie campanhas, orçamentos e performance</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os clientes</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              Nova Campanha
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  R$ {(stats.totalSpent / 1000).toFixed(1)}k
                </p>
                <p className="text-xs text-gray-500">Investido</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.avgROAS.toFixed(1)}x</p>
                <p className="text-xs text-gray-500">ROAS Médio</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  R$ {stats.avgCPA.toFixed(0)}
                </p>
                <p className="text-xs text-gray-500">CPA Médio</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalConversions}</p>
                <p className="text-xs text-gray-500">Conversões</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                <Activity className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.activeCampaigns}</p>
                <p className="text-xs text-gray-500">Campanhas Ativas</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <PieChart className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">
                  {Math.round((stats.totalSpent / stats.totalBudget) * 100)}%
                </p>
                <p className="text-xs text-gray-500">Budget Usado</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Campaigns & Clients */}
          <div className="col-span-2 space-y-6">
            {/* AI Collector */}
            <AICollectorCard area="trafego" maxAlerts={3} />

            {/* Campaigns List */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Campanhas</h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar..."
                      className="pl-9 pr-4 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="divide-y">
                {filteredCampaigns.map((campaign, index) => {
                  const platform = PLATFORM_CONFIG[campaign.platform]
                  const PlatformIcon = platform.icon
                  const budgetPercent = (campaign.spent / campaign.budget) * 100
                  const isOverBudget = budgetPercent > 90
                  const isLowROAS = campaign.roas < 2

                  return (
                    <motion.div
                      key={campaign.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedCampaign(campaign)}
                      className="p-4 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            platform.bgColor
                          )}>
                            <PlatformIcon className="w-5 h-5" style={{ color: platform.color }} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-800">{campaign.name}</h4>
                              <span className={cn(
                                "text-xs px-2 py-0.5 rounded-full",
                                campaign.status === 'active' ? "bg-green-100 text-green-700" :
                                campaign.status === 'paused' ? "bg-yellow-100 text-yellow-700" :
                                "bg-gray-100 text-gray-700"
                              )}>
                                {campaign.status === 'active' ? 'Ativa' :
                                 campaign.status === 'paused' ? 'Pausada' : 'Concluída'}
                              </span>
                              {isLowROAS && campaign.status === 'active' && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  ROAS baixo
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{campaign.clientName}</p>
                            
                            {/* Budget Progress */}
                            <div className="mt-2 w-48">
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>R$ {campaign.spent.toLocaleString('pt-BR')}</span>
                                <span>R$ {campaign.budget.toLocaleString('pt-BR')}</span>
                              </div>
                              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={cn(
                                    "h-full rounded-full",
                                    isOverBudget ? "bg-red-500" : "bg-blue-500"
                                  )}
                                  style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="grid grid-cols-4 gap-4 text-center">
                            <div>
                              <p className={cn(
                                "text-lg font-bold",
                                campaign.roas >= 4 ? "text-green-600" :
                                campaign.roas >= 2 ? "text-blue-600" : "text-red-600"
                              )}>
                                {campaign.roas.toFixed(1)}x
                              </p>
                              <p className="text-xs text-gray-500">ROAS</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-gray-800">
                                R$ {campaign.cpa.toFixed(0)}
                              </p>
                              <p className="text-xs text-gray-500">CPA</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-gray-800">
                                {campaign.conversions}
                              </p>
                              <p className="text-xs text-gray-500">Conv.</p>
                            </div>
                            <div>
                              <p className="text-lg font-bold text-gray-800">
                                {(campaign.clicks / 1000).toFixed(1)}k
                              </p>
                              <p className="text-xs text-gray-500">Cliques</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Clients Budget Status */}
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Status de Orçamento por Cliente</h3>
              </div>
              <div className="space-y-4">
                {clients.map(client => {
                  const budgetPercent = (client.currentSpend / client.monthlyBudget) * 100
                  const needsRecharge = budgetPercent > 70

                  return (
                    <div key={client.id} className="p-4 border rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-800">{client.name}</h4>
                          <p className="text-sm text-gray-500">
                            {client.campaigns} campanha{client.campaigns > 1 ? 's' : ''} • ROAS médio: {client.avgROAS.toFixed(1)}x
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {needsRecharge && (
                            <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Recarga necessária
                            </span>
                          )}
                          <button
                            onClick={() => handleRechargeRequest(client)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                          >
                            <CreditCard className="w-4 h-4" />
                            Solicitar Recarga
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>R$ {client.currentSpend.toLocaleString('pt-BR')} gastos</span>
                            <span>R$ {client.monthlyBudget.toLocaleString('pt-BR')} budget</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all",
                                budgetPercent > 90 ? "bg-red-500" :
                                budgetPercent > 70 ? "bg-amber-500" : "bg-green-500"
                              )}
                              style={{ width: `${Math.min(budgetPercent, 100)}%` }}
                            />
                          </div>
                        </div>
                        <span className={cn(
                          "text-sm font-bold",
                          budgetPercent > 90 ? "text-red-600" :
                          budgetPercent > 70 ? "text-amber-600" : "text-green-600"
                        )}>
                          {budgetPercent.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Insights & Goals */}
          <div className="space-y-6">
            {/* Goals Tracker */}
            <GoalsTracker area="trafego" />

            {/* Smart Insights */}
            <SmartInsightsPanel area="trafego" maxInsights={4} />

            {/* AI Suggestions */}
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800">Sugestões da IA</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center gap-2 text-green-700 text-sm font-medium mb-1">
                    <TrendingUp className="w-4 h-4" />
                    Oportunidade de Escala
                  </div>
                  <p className="text-sm text-green-600">
                    Campanha "Remarketing" com ROAS 5.2x. Recomendo aumentar budget em 50%.
                  </p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex items-center gap-2 text-red-700 text-sm font-medium mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    Ação Necessária
                  </div>
                  <p className="text-sm text-red-600">
                    "Awareness - Nova Marca" com CPA alto. Pausar e revisar segmentação.
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 text-blue-700 text-sm font-medium mb-1">
                    <Sparkles className="w-4 h-4" />
                    Tendência Identificada
                  </div>
                  <p className="text-sm text-blue-600">
                    Horário 18h-21h performando 35% melhor. Concentrar budget nesse período.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recharge Modal */}
      <AnimatePresence>
        {showRechargeModal && rechargeClient && (
          <RechargeModal
            client={rechargeClient}
            onClose={() => {
              setShowRechargeModal(false)
              setRechargeClient(null)
            }}
          />
        )}
      </AnimatePresence>

      {/* Campaign Detail Modal */}
      <AnimatePresence>
        {selectedCampaign && (
          <CampaignDetailModal
            campaign={selectedCampaign}
            onClose={() => setSelectedCampaign(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== RECHARGE MODAL ====================
function RechargeModal({
  client,
  onClose
}: {
  client: Client
  onClose: () => void
}) {
  const [amount, setAmount] = useState(5000)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const suggestedAmount = Math.ceil((client.monthlyBudget - client.currentSpend) / 1000) * 1000

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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
      >
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">Solicitar Recarga</h2>
                <p className="text-sm text-gray-500">{client.name}</p>
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
              <h3 className="text-xl font-bold text-gray-800 mb-2">Solicitação Enviada!</h3>
              <p className="text-gray-500">
                O cliente receberá a mensagem com o link de pagamento.
                Você será notificado quando o pagamento for confirmado.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Budget mensal:</span>
                    <span className="font-medium">R$ {client.monthlyBudget.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Já investido:</span>
                    <span className="font-medium">R$ {client.currentSpend.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Disponível:</span>
                    <span className="font-medium text-green-600">
                      R$ {(client.monthlyBudget - client.currentSpend).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor da Recarga
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full pl-10 pr-4 py-3 border rounded-lg text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[3000, 5000, 10000].map(val => (
                      <button
                        key={val}
                        onClick={() => setAmount(val)}
                        className={cn(
                          "flex-1 py-2 text-sm rounded-lg border transition-colors",
                          amount === val
                            ? "bg-blue-50 border-blue-500 text-blue-700"
                            : "hover:bg-gray-50"
                        )}
                      >
                        R$ {val.toLocaleString('pt-BR')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-xl">
                  <div className="flex items-center gap-2 text-purple-700 font-medium mb-2">
                    <Sparkles className="w-4 h-4" />
                    Mensagem gerada pela IA
                  </div>
                  <p className="text-sm text-purple-600">
                    "Olá! Suas campanhas estão performando muito bem! 🚀 
                    Para manter o ritmo e não perder oportunidades, sugerimos uma recarga de 
                    R$ {amount.toLocaleString('pt-BR')}. Clique no link abaixo para realizar o pagamento."
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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar Solicitação
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

// ==================== CAMPAIGN DETAIL MODAL ====================
function CampaignDetailModal({
  campaign,
  onClose
}: {
  campaign: Campaign
  onClose: () => void
}) {
  const platform = PLATFORM_CONFIG[campaign.platform]
  const PlatformIcon = platform.icon

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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl"
      >
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", platform.bgColor)}>
                <PlatformIcon className="w-6 h-6" style={{ color: platform.color }} />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">{campaign.name}</h2>
                <p className="text-sm text-gray-500">{campaign.clientName} • {platform.label}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center gap-4">
            <span className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              campaign.status === 'active' ? "bg-green-100 text-green-700" :
              campaign.status === 'paused' ? "bg-yellow-100 text-yellow-700" :
              "bg-gray-100 text-gray-700"
            )}>
              {campaign.status === 'active' ? 'Ativa' :
               campaign.status === 'paused' ? 'Pausada' : 'Concluída'}
            </span>
            <span className="text-sm text-gray-500">
              Iniciada em {format(campaign.startDate, "dd/MM/yyyy", { locale: ptBR })}
            </span>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 rounded-xl text-center">
              <p className={cn(
                "text-2xl font-bold",
                campaign.roas >= 4 ? "text-green-600" :
                campaign.roas >= 2 ? "text-blue-600" : "text-red-600"
              )}>
                {campaign.roas.toFixed(1)}x
              </p>
              <p className="text-xs text-gray-500">ROAS</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-xl text-center">
              <p className="text-2xl font-bold text-blue-600">R$ {campaign.cpa.toFixed(0)}</p>
              <p className="text-xs text-gray-500">CPA</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl text-center">
              <p className="text-2xl font-bold text-purple-600">{campaign.conversions}</p>
              <p className="text-xs text-gray-500">Conversões</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-xl text-center">
              <p className="text-2xl font-bold text-orange-600">R$ {campaign.cpc.toFixed(2)}</p>
              <p className="text-xs text-gray-500">CPC</p>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border rounded-xl">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Eye className="w-4 h-4" />
                <span className="text-sm">Impressões</span>
              </div>
              <p className="text-xl font-bold text-gray-800">
                {(campaign.impressions / 1000).toFixed(0)}k
              </p>
            </div>
            <div className="p-4 border rounded-xl">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <MousePointer className="w-4 h-4" />
                <span className="text-sm">Cliques</span>
              </div>
              <p className="text-xl font-bold text-gray-800">
                {(campaign.clicks / 1000).toFixed(1)}k
              </p>
            </div>
            <div className="p-4 border rounded-xl">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm">CTR</span>
              </div>
              <p className="text-xl font-bold text-gray-800">
                {((campaign.clicks / campaign.impressions) * 100).toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Budget */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-500">Orçamento</span>
              <span className="text-sm font-medium">
                R$ {campaign.spent.toLocaleString('pt-BR')} / R$ {campaign.budget.toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex gap-3">
          <button className="flex-1 px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50">
            {campaign.status === 'active' ? 'Pausar' : 'Ativar'} Campanha
          </button>
          <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Editar Campanha
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}



