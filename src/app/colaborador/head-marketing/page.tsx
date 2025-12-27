'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase, Users, TrendingUp, TrendingDown, Target,
  AlertTriangle, CheckCircle2, Clock, DollarSign, Eye,
  BarChart3, PieChart, Calendar, Plus, Search, X,
  ChevronRight, ArrowUpRight, ArrowDownRight, Sparkles,
  Brain, RefreshCw, Settings, Filter, Download, Mail,
  MessageSquare, Star, Zap, Activity, Award, Layers
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, differenceInDays, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import AICollectorCard from '@/components/ai/AICollectorCard'
import SmartInsightsPanel from '@/components/ai/SmartInsightsPanel'
import GoalsTracker from '@/components/goals/GoalsTracker'
import Link from 'next/link'

// ==================== TIPOS ====================
interface Client {
  id: string
  name: string
  segment: string
  healthScore: number
  mrr: number
  lastContact: Date
  status: 'active' | 'at_risk' | 'churned'
  satisfaction: number
  engagementScore: number
  servicesActive: string[]
  teamAssigned: string[]
}

interface TeamMember {
  id: string
  name: string
  role: string
  area: string
  avatar?: string
  currentLoad: number
  maxCapacity: number
  tasksCompleted: number
  tasksInProgress: number
  performance: number
}

interface Campaign {
  id: string
  clientId: string
  clientName: string
  name: string
  type: 'social' | 'ads' | 'email' | 'content'
  status: 'planning' | 'active' | 'paused' | 'completed'
  budget: number
  spent: number
  roi: number
  startDate: Date
  endDate: Date
}

interface PerformanceMetric {
  label: string
  value: number
  change: number
  target: number
}

// ==================== MOCK DATA ====================
const MOCK_CLIENTS: Client[] = [
  {
    id: '1',
    name: 'Tech Solutions',
    segment: 'Tecnologia',
    healthScore: 85,
    mrr: 15000,
    lastContact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'active',
    satisfaction: 4.5,
    engagementScore: 78,
    servicesActive: ['Social Media', 'Tráfego', 'Design'],
    teamAssigned: ['Maria', 'João', 'Pedro']
  },
  {
    id: '2',
    name: 'E-commerce Plus',
    segment: 'E-commerce',
    healthScore: 45,
    mrr: 8000,
    lastContact: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    status: 'at_risk',
    satisfaction: 3.2,
    engagementScore: 35,
    servicesActive: ['Social Media', 'Tráfego'],
    teamAssigned: ['Ana', 'Carlos']
  },
  {
    id: '3',
    name: 'Fashion Store',
    segment: 'Moda',
    healthScore: 92,
    mrr: 12000,
    lastContact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    status: 'active',
    satisfaction: 5,
    engagementScore: 95,
    servicesActive: ['Social Media', 'Tráfego', 'Design', 'Video'],
    teamAssigned: ['Maria', 'Paula', 'Lucas']
  },
  {
    id: '4',
    name: 'Startup ABC',
    segment: 'Tecnologia',
    healthScore: 68,
    mrr: 5000,
    lastContact: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    status: 'active',
    satisfaction: 4,
    engagementScore: 60,
    servicesActive: ['Social Media'],
    teamAssigned: ['João']
  }
]

const MOCK_TEAM: TeamMember[] = [
  { id: '1', name: 'Maria Silva', role: 'Social Media', area: 'social_media', currentLoad: 35, maxCapacity: 40, tasksCompleted: 45, tasksInProgress: 8, performance: 92 },
  { id: '2', name: 'João Santos', role: 'Tráfego', area: 'trafego', currentLoad: 38, maxCapacity: 40, tasksCompleted: 52, tasksInProgress: 5, performance: 88 },
  { id: '3', name: 'Ana Costa', role: 'Designer', area: 'designer', currentLoad: 42, maxCapacity: 40, tasksCompleted: 38, tasksInProgress: 12, performance: 75 },
  { id: '4', name: 'Pedro Lima', role: 'Video Maker', area: 'video_maker', currentLoad: 28, maxCapacity: 40, tasksCompleted: 22, tasksInProgress: 4, performance: 95 },
  { id: '5', name: 'Carlos Souza', role: 'Web Designer', area: 'web_designer', currentLoad: 32, maxCapacity: 40, tasksCompleted: 15, tasksInProgress: 3, performance: 90 }
]

const MOCK_CAMPAIGNS: Campaign[] = [
  { id: '1', clientId: '1', clientName: 'Tech Solutions', name: 'Black Friday 2024', type: 'ads', status: 'active', budget: 25000, spent: 18500, roi: 4.2, startDate: new Date(), endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  { id: '2', clientId: '2', clientName: 'E-commerce Plus', name: 'Lançamento Coleção', type: 'social', status: 'planning', budget: 8000, spent: 0, roi: 0, startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000) },
  { id: '3', clientId: '3', clientName: 'Fashion Store', name: 'Verão 2024', type: 'content', status: 'active', budget: 15000, spent: 12000, roi: 3.8, startDate: subDays(new Date(), 15), endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) }
]

// ==================== COMPONENTE PRINCIPAL ====================
export default function HeadMarketingPage() {
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS)
  const [team, setTeam] = useState<TeamMember[]>(MOCK_TEAM)
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'clients' | 'team' | 'campaigns'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [generatingReport, setGeneratingReport] = useState(false)

  // Estatísticas
  const stats = {
    totalClients: clients.length,
    activeClients: clients.filter(c => c.status === 'active').length,
    atRiskClients: clients.filter(c => c.status === 'at_risk').length,
    totalMRR: clients.reduce((sum, c) => sum + c.mrr, 0),
    avgHealthScore: Math.round(clients.reduce((sum, c) => sum + c.healthScore, 0) / clients.length),
    avgSatisfaction: (clients.reduce((sum, c) => sum + c.satisfaction, 0) / clients.length).toFixed(1),
    teamUtilization: Math.round(team.reduce((sum, t) => sum + (t.currentLoad / t.maxCapacity * 100), 0) / team.length),
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    totalBudget: campaigns.reduce((sum, c) => sum + c.budget, 0),
    avgROI: (campaigns.filter(c => c.roi > 0).reduce((sum, c) => sum + c.roi, 0) / campaigns.filter(c => c.roi > 0).length).toFixed(1)
  }

  const handleGenerateReport = async () => {
    setGeneratingReport(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setGeneratingReport(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-sm">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Painel Head Marketing</h1>
              <p className="text-sm text-muted-foreground">Visão consolidada de clientes, equipe e campanhas</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/colaborador/head-marketing/upload">
              <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm">
                <Layers className="w-4 h-4" />
                Agendar Postagem
              </button>
            </Link>
            <button
              onClick={handleGenerateReport}
              disabled={generatingReport}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 text-sm"
            >
              {generatingReport ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Relatório Mensal
                </>
              )}
            </button>
            <Link href="/colaborador/dashboard">
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                <Layers className="w-4 h-4" />
                Dashboard
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* KPIs Principais */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">MRR Total</span>
              <DollarSign className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-foreground">
              R$ {stats.totalMRR.toLocaleString('pt-BR')}
            </p>
            <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
              <ArrowUpRight className="w-3 h-3" />
              +12% vs mês anterior
            </div>
          </div>

          <div className="bg-card rounded-xl p-4 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Health Score</span>
              <Activity className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.avgHealthScore}%</p>
            <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full",
                  stats.avgHealthScore >= 70 ? "bg-green-500" :
                  stats.avgHealthScore >= 50 ? "bg-yellow-500" : "bg-red-500"
                )}
                style={{ width: `${stats.avgHealthScore}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Clientes em Risco</span>
              <AlertTriangle className="w-4 h-4 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-orange-600">{stats.atRiskClients}</p>
            <p className="text-xs text-gray-500 mt-1">de {stats.totalClients} clientes</p>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Utilização Equipe</span>
              <Users className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.teamUtilization}%</p>
            <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full",
                  stats.teamUtilization <= 80 ? "bg-green-500" :
                  stats.teamUtilization <= 95 ? "bg-yellow-500" : "bg-red-500"
                )}
                style={{ width: `${Math.min(stats.teamUtilization, 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">ROI Médio</span>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.avgROI}x</p>
            <p className="text-xs text-gray-500 mt-1">{stats.activeCampaigns} campanhas ativas</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="col-span-2 space-y-6">
            {/* AI Collector */}
            <AICollectorCard area="head_marketing" maxAlerts={3} />

            {/* Tabs */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="flex border-b">
                {[
                  { id: 'overview', label: 'Visão Geral', icon: Eye },
                  { id: 'clients', label: 'Clientes', icon: Users },
                  { id: 'team', label: 'Equipe', icon: Briefcase },
                  { id: 'campaigns', label: 'Campanhas', icon: Target }
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

              <div className="p-4">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Performance Summary */}
                    <div className="grid grid-cols-4 gap-4">
                      {[
                        { label: 'Satisfação', value: stats.avgSatisfaction, icon: Star, color: 'text-yellow-500', suffix: '/5' },
                        { label: 'Clientes Ativos', value: stats.activeClients, icon: CheckCircle2, color: 'text-green-500' },
                        { label: 'Orçamento Total', value: `R$ ${(stats.totalBudget / 1000).toFixed(0)}k`, icon: DollarSign, color: 'text-blue-500' },
                        { label: 'Campanhas', value: stats.activeCampaigns, icon: Zap, color: 'text-purple-500' }
                      ].map((metric, index) => (
                        <motion.div
                          key={metric.label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 bg-gray-50 rounded-xl text-center"
                        >
                          <metric.icon className={cn("w-6 h-6 mx-auto mb-2", metric.color)} />
                          <p className="text-xl font-bold text-gray-800">{metric.value}{metric.suffix}</p>
                          <p className="text-xs text-gray-500">{metric.label}</p>
                        </motion.div>
                      ))}
                    </div>

                    {/* Clients at Risk */}
                    {clients.filter(c => c.status === 'at_risk').length > 0 && (
                      <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                        <div className="flex items-center gap-2 text-orange-700 font-medium mb-3">
                          <AlertTriangle className="w-5 h-5" />
                          Clientes que Precisam de Atenção
                        </div>
                        <div className="space-y-2">
                          {clients.filter(c => c.status === 'at_risk').map(client => (
                            <div
                              key={client.id}
                              className="flex items-center justify-between p-3 bg-white rounded-lg cursor-pointer hover:shadow-md transition-all"
                              onClick={() => setSelectedClient(client)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                  <span className="text-orange-600 font-bold">{client.name.charAt(0)}</span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">{client.name}</p>
                                  <p className="text-xs text-gray-500">
                                    Último contato: {differenceInDays(new Date(), client.lastContact)} dias atrás
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-orange-600">Health: {client.healthScore}%</p>
                                <button className="text-xs text-indigo-600 hover:text-indigo-700">
                                  Ver detalhes →
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Team Performance */}
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3">Performance da Equipe</h4>
                      <div className="space-y-2">
                        {team.slice(0, 4).map((member, index) => (
                          <motion.div
                            key={member.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                {member.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{member.name}</p>
                                <p className="text-xs text-gray-500">{member.role}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-sm text-gray-600">{member.currentLoad}/{member.maxCapacity}h</p>
                                <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className={cn(
                                      "h-full rounded-full",
                                      member.currentLoad / member.maxCapacity <= 0.8 ? "bg-green-500" :
                                      member.currentLoad / member.maxCapacity <= 0.95 ? "bg-yellow-500" : "bg-red-500"
                                    )}
                                    style={{ width: `${Math.min((member.currentLoad / member.maxCapacity) * 100, 100)}%` }}
                                  />
                                </div>
                              </div>
                              <div className={cn(
                                "px-2 py-1 rounded text-xs font-medium",
                                member.performance >= 90 ? "bg-green-100 text-green-700" :
                                member.performance >= 75 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                              )}>
                                {member.performance}%
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Clients Tab */}
                {activeTab === 'clients' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar clientes..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <button className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50">
                        <Filter className="w-4 h-4" />
                        Filtros
                      </button>
                    </div>

                    <div className="space-y-3">
                      {clients
                        .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((client, index) => (
                          <motion.div
                            key={client.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setSelectedClient(client)}
                            className={cn(
                              "p-4 border rounded-xl cursor-pointer hover:shadow-md transition-all",
                              client.status === 'at_risk' && "border-orange-300 bg-orange-50"
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold",
                                  client.status === 'active' ? "bg-gradient-to-br from-green-500 to-emerald-500" :
                                  client.status === 'at_risk' ? "bg-gradient-to-br from-orange-500 to-red-500" :
                                  "bg-gray-400"
                                )}>
                                  {client.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-gray-800">{client.name}</h4>
                                    <span className={cn(
                                      "text-xs px-2 py-0.5 rounded-full",
                                      client.status === 'active' ? "bg-green-100 text-green-700" :
                                      client.status === 'at_risk' ? "bg-orange-100 text-orange-700" :
                                      "bg-gray-100 text-gray-700"
                                    )}>
                                      {client.status === 'active' ? 'Ativo' :
                                       client.status === 'at_risk' ? 'Em Risco' : 'Churned'}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-500">{client.segment}</p>
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {client.servicesActive.map(service => (
                                      <span key={service} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                        {service}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-gray-800">R$ {client.mrr.toLocaleString('pt-BR')}</p>
                                <p className="text-xs text-gray-500">MRR</p>
                                <div className="flex items-center gap-1 mt-2">
                                  <Star className="w-3 h-3 text-yellow-500" />
                                  <span className="text-sm">{client.satisfaction}</span>
                                </div>
                              </div>
                            </div>

                            {/* Health Score Bar */}
                            <div className="mt-3 pt-3 border-t">
                              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                <span>Health Score</span>
                                <span className={cn(
                                  "font-medium",
                                  client.healthScore >= 70 ? "text-green-600" :
                                  client.healthScore >= 50 ? "text-yellow-600" : "text-red-600"
                                )}>
                                  {client.healthScore}%
                                </span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={cn(
                                    "h-full rounded-full",
                                    client.healthScore >= 70 ? "bg-green-500" :
                                    client.healthScore >= 50 ? "bg-yellow-500" : "bg-red-500"
                                  )}
                                  style={{ width: `${client.healthScore}%` }}
                                />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Team Tab */}
                {activeTab === 'team' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="p-4 bg-green-50 rounded-xl text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {team.filter(t => t.currentLoad / t.maxCapacity <= 0.8).length}
                        </p>
                        <p className="text-xs text-green-700">Disponíveis</p>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-xl text-center">
                        <p className="text-2xl font-bold text-yellow-600">
                          {team.filter(t => t.currentLoad / t.maxCapacity > 0.8 && t.currentLoad / t.maxCapacity <= 0.95).length}
                        </p>
                        <p className="text-xs text-yellow-700">Alta Demanda</p>
                      </div>
                      <div className="p-4 bg-red-50 rounded-xl text-center">
                        <p className="text-2xl font-bold text-red-600">
                          {team.filter(t => t.currentLoad / t.maxCapacity > 0.95).length}
                        </p>
                        <p className="text-xs text-red-700">Sobrecarregados</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {team.map((member, index) => {
                        const loadPercentage = (member.currentLoad / member.maxCapacity) * 100
                        return (
                          <motion.div
                            key={member.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-4 border rounded-xl hover:shadow-md transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                  {member.name.charAt(0)}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-800">{member.name}</h4>
                                  <p className="text-sm text-gray-500">{member.role}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-center">
                                  <p className="text-lg font-bold text-gray-800">{member.tasksInProgress}</p>
                                  <p className="text-xs text-gray-500">Em progresso</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-lg font-bold text-gray-800">{member.tasksCompleted}</p>
                                  <p className="text-xs text-gray-500">Concluídas</p>
                                </div>
                                <div className={cn(
                                  "px-3 py-1 rounded-lg text-sm font-medium",
                                  member.performance >= 90 ? "bg-green-100 text-green-700" :
                                  member.performance >= 75 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                                )}>
                                  {member.performance}% perf.
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 pt-3 border-t">
                              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                <span>Carga de Trabalho</span>
                                <span>{member.currentLoad}h / {member.maxCapacity}h</span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={cn(
                                    "h-full rounded-full",
                                    loadPercentage <= 80 ? "bg-green-500" :
                                    loadPercentage <= 95 ? "bg-yellow-500" : "bg-red-500"
                                  )}
                                  style={{ width: `${Math.min(loadPercentage, 100)}%` }}
                                />
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Campaigns Tab */}
                {activeTab === 'campaigns' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-800">Campanhas Ativas</h4>
                      <button className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700">
                        <Plus className="w-4 h-4" />
                        Nova Campanha
                      </button>
                    </div>

                    <div className="space-y-3">
                      {campaigns.map((campaign, index) => (
                        <motion.div
                          key={campaign.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-4 border rounded-xl hover:shadow-md transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-800">{campaign.name}</h4>
                                <span className={cn(
                                  "text-xs px-2 py-0.5 rounded-full",
                                  campaign.status === 'active' ? "bg-green-100 text-green-700" :
                                  campaign.status === 'planning' ? "bg-blue-100 text-blue-700" :
                                  campaign.status === 'paused' ? "bg-yellow-100 text-yellow-700" :
                                  "bg-gray-100 text-gray-700"
                                )}>
                                  {campaign.status === 'active' ? 'Ativa' :
                                   campaign.status === 'planning' ? 'Planejamento' :
                                   campaign.status === 'paused' ? 'Pausada' : 'Concluída'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500">{campaign.clientName}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {format(campaign.startDate, 'dd/MM', { locale: ptBR })} - {format(campaign.endDate, 'dd/MM', { locale: ptBR })}
                              </p>
                            </div>
                            <div className="text-right">
                              {campaign.roi > 0 && (
                                <p className="text-lg font-bold text-green-600">{campaign.roi}x ROI</p>
                              )}
                              <p className="text-sm text-gray-500">
                                R$ {campaign.spent.toLocaleString('pt-BR')} / R$ {campaign.budget.toLocaleString('pt-BR')}
                              </p>
                            </div>
                          </div>

                          {/* Budget Progress */}
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                              <span>Orçamento utilizado</span>
                              <span>{Math.round((campaign.spent / campaign.budget) * 100)}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-indigo-500 rounded-full"
                                style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Goals & Insights */}
          <div className="space-y-6">
            <GoalsTracker area="head_marketing" />
            <SmartInsightsPanel area="head_marketing" maxInsights={4} />

            {/* AI Recommendations */}
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800">Recomendações IA</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-800">E-commerce Plus precisa de atenção</p>
                      <p className="text-xs text-orange-600 mt-1">Health score caiu 15% este mês. Recomendo agendar reunião urgente.</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Redistribuir carga de Ana</p>
                      <p className="text-xs text-blue-600 mt-1">Designer está 5% acima da capacidade. Considere realocar 2 tarefas.</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Oportunidade de upsell</p>
                      <p className="text-xs text-green-600 mt-1">Fashion Store tem engajamento alto. Momento ideal para oferecer Video.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Ações Rápidas</h3>
              <div className="space-y-2">
                <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3">
                  <Mail className="w-5 h-5 text-indigo-500" />
                  <div>
                    <span className="text-sm font-medium">Enviar Relatório</span>
                    <p className="text-xs text-gray-500">Para todos os clientes</p>
                  </div>
                </button>
                <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-green-500" />
                  <div>
                    <span className="text-sm font-medium">Agendar Reunião</span>
                    <p className="text-xs text-gray-500">Com equipe ou cliente</p>
                  </div>
                </button>
                <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <div>
                    <span className="text-sm font-medium">Gerar Insights</span>
                    <p className="text-xs text-gray-500">Análise completa IA</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Client Detail Modal */}
      <AnimatePresence>
        {selectedClient && (
          <ClientDetailModal
            client={selectedClient}
            onClose={() => setSelectedClient(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== CLIENT DETAIL MODAL ====================
function ClientDetailModal({
  client,
  onClose
}: {
  client: Client
  onClose: () => void
}) {
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
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl",
                client.status === 'active' ? "bg-gradient-to-br from-green-500 to-emerald-500" :
                client.status === 'at_risk' ? "bg-gradient-to-br from-orange-500 to-red-500" :
                "bg-gray-400"
              )}>
                {client.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{client.name}</h2>
                <p className="text-sm text-gray-500">{client.segment}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* KPIs */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <DollarSign className="w-5 h-5 mx-auto text-green-500 mb-1" />
              <p className="text-lg font-bold text-gray-800">R$ {client.mrr.toLocaleString('pt-BR')}</p>
              <p className="text-xs text-gray-500">MRR</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <Activity className="w-5 h-5 mx-auto text-blue-500 mb-1" />
              <p className="text-lg font-bold text-gray-800">{client.healthScore}%</p>
              <p className="text-xs text-gray-500">Health</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <Star className="w-5 h-5 mx-auto text-yellow-500 mb-1" />
              <p className="text-lg font-bold text-gray-800">{client.satisfaction}</p>
              <p className="text-xs text-gray-500">Satisfação</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <Zap className="w-5 h-5 mx-auto text-purple-500 mb-1" />
              <p className="text-lg font-bold text-gray-800">{client.engagementScore}%</p>
              <p className="text-xs text-gray-500">Engajamento</p>
            </div>
          </div>

          {/* Services */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-800 mb-2">Serviços Ativos</h4>
            <div className="flex flex-wrap gap-2">
              {client.servicesActive.map(service => (
                <span key={service} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-sm">
                  {service}
                </span>
              ))}
            </div>
          </div>

          {/* Team */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-800 mb-2">Equipe Responsável</h4>
            <div className="flex flex-wrap gap-2">
              {client.teamAssigned.map(member => (
                <div key={member} className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                    {member.charAt(0)}
                  </div>
                  <span className="text-sm">{member}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Last Contact */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Último contato</p>
                <p className="font-medium text-gray-800">
                  {format(client.lastContact, "dd 'de' MMMM", { locale: ptBR })}
                </p>
              </div>
              <span className={cn(
                "px-3 py-1 rounded-lg text-sm",
                differenceInDays(new Date(), client.lastContact) <= 7 ? "bg-green-100 text-green-700" :
                differenceInDays(new Date(), client.lastContact) <= 14 ? "bg-yellow-100 text-yellow-700" :
                "bg-red-100 text-red-700"
              )}>
                {differenceInDays(new Date(), client.lastContact)} dias atrás
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex gap-3">
          <button className="flex-1 px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Enviar Mensagem
          </button>
          <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" />
            Agendar Reunião
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}






