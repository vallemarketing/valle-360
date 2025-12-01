'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Palette, Image, Layers, Folder, CheckCircle2, Clock,
  AlertTriangle, Plus, Search, X, Eye, Download, Upload,
  Heart, MessageSquare, Sparkles, Brain, RefreshCw,
  Target, TrendingUp, Calendar, Users, Star, Copy,
  ChevronRight, Filter, Grid, List
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import AICollectorCard from '@/components/ai/AICollectorCard'
import SmartInsightsPanel from '@/components/ai/SmartInsightsPanel'
import GoalsTracker from '@/components/goals/GoalsTracker'
import Link from 'next/link'

// ==================== TIPOS ====================
interface DesignProject {
  id: string
  clientId: string
  clientName: string
  title: string
  type: 'social' | 'banner' | 'logo' | 'branding' | 'print' | 'presentation'
  status: 'pending' | 'in_progress' | 'review' | 'approved' | 'revision'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate: Date
  createdAt: Date
  versions: DesignVersion[]
  feedback?: string[]
}

interface DesignVersion {
  id: string
  version: number
  thumbnail: string
  createdAt: Date
  status: 'pending' | 'approved' | 'rejected'
  feedback?: string
}

interface ClientAsset {
  id: string
  clientId: string
  clientName: string
  type: 'logo' | 'color' | 'font' | 'image' | 'guideline'
  name: string
  value?: string
  url?: string
}

interface DesignTemplate {
  id: string
  name: string
  category: string
  thumbnail: string
  usageCount: number
  rating: number
}

// ==================== CONSTANTES ====================
const PROJECT_TYPE_CONFIG = {
  social: { label: 'Social Media', icon: Image, color: 'text-pink-600', bgColor: 'bg-pink-100' },
  banner: { label: 'Banner', icon: Layers, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  logo: { label: 'Logo', icon: Star, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  branding: { label: 'Branding', icon: Palette, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  print: { label: 'Impresso', icon: Copy, color: 'text-green-600', bgColor: 'bg-green-100' },
  presentation: { label: 'Apresentação', icon: Layers, color: 'text-cyan-600', bgColor: 'bg-cyan-100' }
}

const STATUS_CONFIG = {
  pending: { label: 'Pendente', color: 'bg-gray-100 text-gray-700' },
  in_progress: { label: 'Em Produção', color: 'bg-blue-100 text-blue-700' },
  review: { label: 'Aguardando Aprovação', color: 'bg-yellow-100 text-yellow-700' },
  approved: { label: 'Aprovado', color: 'bg-green-100 text-green-700' },
  revision: { label: 'Em Revisão', color: 'bg-orange-100 text-orange-700' }
}

const PRIORITY_CONFIG = {
  low: { label: 'Baixa', color: 'text-gray-500', bgColor: 'bg-gray-100' },
  medium: { label: 'Média', color: 'text-blue-500', bgColor: 'bg-blue-100' },
  high: { label: 'Alta', color: 'text-orange-500', bgColor: 'bg-orange-100' },
  urgent: { label: 'Urgente', color: 'text-red-500', bgColor: 'bg-red-100' }
}

// ==================== MOCK DATA ====================
const MOCK_PROJECTS: DesignProject[] = [
  {
    id: '1',
    clientId: '1',
    clientName: 'Tech Solutions',
    title: 'Posts Instagram - Dezembro',
    type: 'social',
    status: 'review',
    priority: 'high',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    versions: [
      { id: '1', version: 1, thumbnail: '', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), status: 'rejected', feedback: 'Ajustar cores' },
      { id: '2', version: 2, thumbnail: '', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), status: 'pending' }
    ]
  },
  {
    id: '2',
    clientId: '2',
    clientName: 'E-commerce Plus',
    title: 'Banners Black Friday',
    type: 'banner',
    status: 'in_progress',
    priority: 'urgent',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    versions: []
  },
  {
    id: '3',
    clientId: '3',
    clientName: 'Fashion Store',
    title: 'Redesign Logo',
    type: 'logo',
    status: 'approved',
    priority: 'medium',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    versions: [
      { id: '1', version: 1, thumbnail: '', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), status: 'rejected' },
      { id: '2', version: 2, thumbnail: '', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), status: 'rejected' },
      { id: '3', version: 3, thumbnail: '', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), status: 'approved' }
    ]
  },
  {
    id: '4',
    clientId: '1',
    clientName: 'Tech Solutions',
    title: 'Apresentação Institucional',
    type: 'presentation',
    status: 'pending',
    priority: 'low',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    versions: []
  }
]

const MOCK_ASSETS: ClientAsset[] = [
  { id: '1', clientId: '1', clientName: 'Tech Solutions', type: 'logo', name: 'Logo Principal', url: '/assets/logo.png' },
  { id: '2', clientId: '1', clientName: 'Tech Solutions', type: 'color', name: 'Cor Primária', value: '#4370d1' },
  { id: '3', clientId: '1', clientName: 'Tech Solutions', type: 'color', name: 'Cor Secundária', value: '#0f1b35' },
  { id: '4', clientId: '1', clientName: 'Tech Solutions', type: 'font', name: 'Fonte Principal', value: 'Inter' },
  { id: '5', clientId: '2', clientName: 'E-commerce Plus', type: 'logo', name: 'Logo', url: '/assets/logo2.png' },
  { id: '6', clientId: '2', clientName: 'E-commerce Plus', type: 'color', name: 'Cor Primária', value: '#FF6B6B' }
]

// ==================== COMPONENTE PRINCIPAL ====================
export default function DesignerPage() {
  const [projects, setProjects] = useState<DesignProject[]>(MOCK_PROJECTS)
  const [assets, setAssets] = useState<ClientAsset[]>(MOCK_ASSETS)
  const [selectedProject, setSelectedProject] = useState<DesignProject | null>(null)
  const [activeTab, setActiveTab] = useState<'projects' | 'assets' | 'references'>('projects')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedClient, setSelectedClient] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  // Clientes únicos
  const clients = [...new Set(projects.map(p => p.clientName))]

  // Estatísticas
  const stats = {
    totalProjects: projects.length,
    pendingApproval: projects.filter(p => p.status === 'review').length,
    approved: projects.filter(p => p.status === 'approved').length,
    inProgress: projects.filter(p => p.status === 'in_progress').length,
    avgApprovalRate: 78, // %
    piecesThisMonth: 45
  }

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus
    const matchesClient = selectedClient === 'all' || p.clientName === selectedClient
    return matchesSearch && matchesStatus && matchesClient
  })

  const filteredAssets = selectedClient === 'all' 
    ? assets 
    : assets.filter(a => a.clientName === selectedClient)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Painel Designer</h1>
              <p className="text-sm text-gray-500">Projetos, assets e referências</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">Todos os clientes</option>
              {clients.map(client => (
                <option key={client} value={client}>{client}</option>
              ))}
            </select>
            <Link href="/colaborador/kanban">
              <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
                <Layers className="w-4 h-4" />
                Ver Kanban
              </button>
            </Link>
            <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
              <Plus className="w-4 h-4" />
              Nova Peça
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Palette className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalProjects}</p>
                <p className="text-xs text-gray-500">Projetos</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.pendingApproval}</p>
                <p className="text-xs text-gray-500">Aguardando</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.approved}</p>
                <p className="text-xs text-gray-500">Aprovados</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.avgApprovalRate}%</p>
                <p className="text-xs text-gray-500">Taxa Aprovação</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Image className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.piecesThisMonth}</p>
                <p className="text-xs text-gray-500">Peças/Mês</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                <Folder className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{assets.length}</p>
                <p className="text-xs text-gray-500">Assets</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Projects */}
          <div className="col-span-2 space-y-6">
            {/* AI Collector */}
            <AICollectorCard area="designer" maxAlerts={3} />

            {/* Tabs */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="flex border-b">
                {[
                  { id: 'projects', label: 'Projetos', icon: Layers },
                  { id: 'assets', label: 'Biblioteca de Assets', icon: Folder },
                  { id: 'references', label: 'Referências', icon: Heart }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
                      activeTab === tab.id
                        ? "bg-orange-50 text-orange-700 border-b-2 border-orange-600"
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-4">
                {activeTab === 'projects' && (
                  <>
                    {/* Search & Filter */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar projetos..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="all">Todos os status</option>
                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                          <option key={key} value={key}>{config.label}</option>
                        ))}
                      </select>
                      <div className="flex items-center bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => setViewMode('list')}
                          className={cn(
                            "p-1.5 rounded",
                            viewMode === 'list' ? "bg-white shadow" : ""
                          )}
                        >
                          <List className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setViewMode('grid')}
                          className={cn(
                            "p-1.5 rounded",
                            viewMode === 'grid' ? "bg-white shadow" : ""
                          )}
                        >
                          <Grid className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Projects List */}
                    <div className={cn(
                      viewMode === 'grid' ? "grid grid-cols-2 gap-4" : "space-y-3"
                    )}>
                      {filteredProjects.map((project, index) => {
                        const typeConfig = PROJECT_TYPE_CONFIG[project.type]
                        const statusConfig = STATUS_CONFIG[project.status]
                        const priorityConfig = PRIORITY_CONFIG[project.priority]
                        const TypeIcon = typeConfig.icon
                        const daysUntilDue = differenceInDays(project.dueDate, new Date())
                        const isOverdue = daysUntilDue < 0
                        const isUrgent = project.priority === 'urgent'

                        return (
                          <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setSelectedProject(project)}
                            className={cn(
                              "p-4 border rounded-xl cursor-pointer hover:shadow-md transition-all",
                              isOverdue && "border-red-300 bg-red-50",
                              isUrgent && !isOverdue && "border-orange-300 bg-orange-50"
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                                typeConfig.bgColor
                              )}>
                                <TypeIcon className={cn("w-5 h-5", typeConfig.color)} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h4 className="font-semibold text-gray-800 truncate">{project.title}</h4>
                                  <span className={cn("text-xs px-2 py-0.5 rounded-full", statusConfig.color)}>
                                    {statusConfig.label}
                                  </span>
                                  <span className={cn("text-xs px-2 py-0.5 rounded-full", priorityConfig.bgColor, priorityConfig.color)}>
                                    {priorityConfig.label}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500">{project.clientName}</p>
                                
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                                  <span className={cn(
                                    isOverdue ? "text-red-600" : isUrgent ? "text-orange-600" : ""
                                  )}>
                                    {isOverdue 
                                      ? `${Math.abs(daysUntilDue)}d atrasado`
                                      : `${daysUntilDue}d restantes`}
                                  </span>
                                  <span>{project.versions.length} versões</span>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </>
                )}

                {activeTab === 'assets' && (
                  <div className="space-y-6">
                    {/* Assets by Type */}
                    {['logo', 'color', 'font'].map(type => {
                      const typeAssets = filteredAssets.filter(a => a.type === type)
                      if (typeAssets.length === 0) return null

                      return (
                        <div key={type}>
                          <h4 className="font-medium text-gray-800 mb-3 capitalize flex items-center gap-2">
                            {type === 'logo' && <Image className="w-4 h-4 text-purple-500" />}
                            {type === 'color' && <Palette className="w-4 h-4 text-orange-500" />}
                            {type === 'font' && <span className="text-blue-500 font-bold">Aa</span>}
                            {type === 'logo' ? 'Logos' : type === 'color' ? 'Cores' : 'Fontes'}
                          </h4>
                          <div className="grid grid-cols-4 gap-3">
                            {typeAssets.map(asset => (
                              <div
                                key={asset.id}
                                className="p-3 border rounded-lg hover:shadow-md transition-all cursor-pointer"
                              >
                                {asset.type === 'color' && asset.value && (
                                  <div
                                    className="w-full h-16 rounded-lg mb-2"
                                    style={{ backgroundColor: asset.value }}
                                  />
                                )}
                                {asset.type === 'logo' && (
                                  <div className="w-full h-16 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                                    <Image className="w-8 h-8 text-gray-400" />
                                  </div>
                                )}
                                {asset.type === 'font' && (
                                  <div className="w-full h-16 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-gray-600">{asset.value}</span>
                                  </div>
                                )}
                                <p className="text-sm font-medium text-gray-800 truncate">{asset.name}</p>
                                <p className="text-xs text-gray-500 truncate">{asset.clientName}</p>
                                {asset.value && asset.type === 'color' && (
                                  <p className="text-xs text-gray-400 font-mono">{asset.value}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {activeTab === 'references' && (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Banco de Referências</h3>
                    <p className="text-gray-500 mb-4">Salve e organize suas inspirações</p>
                    <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                      Adicionar Referência
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Goals & Insights */}
          <div className="space-y-6">
            <GoalsTracker area="designer" />
            <SmartInsightsPanel area="designer" maxInsights={4} />

            {/* AI Suggestions */}
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800">Sugestões da IA</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="flex items-center gap-2 text-purple-700 text-sm font-medium mb-1">
                    <Palette className="w-4 h-4" />
                    Paleta Sugerida
                  </div>
                  <p className="text-sm text-purple-600">
                    Para Tech Solutions, tons de azul e verde transmitem tecnologia e confiança.
                  </p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <div className="flex items-center gap-2 text-orange-700 text-sm font-medium mb-1">
                    <TrendingUp className="w-4 h-4" />
                    Tendência
                  </div>
                  <p className="text-sm text-orange-600">
                    Layouts minimalistas com muito espaço em branco estão em alta para o segmento.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Ações Rápidas</h3>
              <div className="space-y-2">
                <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3">
                  <Upload className="w-5 h-5 text-blue-500" />
                  <span className="text-sm">Enviar para Aprovação</span>
                </button>
                <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3">
                  <Download className="w-5 h-5 text-green-500" />
                  <span className="text-sm">Baixar Assets do Cliente</span>
                </button>
                <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <span className="text-sm">Gerar Variações com IA</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <ProjectDetailModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== PROJECT DETAIL MODAL ====================
function ProjectDetailModal({
  project,
  onClose
}: {
  project: DesignProject
  onClose: () => void
}) {
  const typeConfig = PROJECT_TYPE_CONFIG[project.type]
  const statusConfig = STATUS_CONFIG[project.status]
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
                <h2 className="font-bold text-gray-800">{project.title}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500">{project.clientName}</span>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full", statusConfig.color)}>
                    {statusConfig.label}
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
          {/* Versions */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-800 mb-3">Versões ({project.versions.length})</h4>
            {project.versions.length > 0 ? (
              <div className="space-y-3">
                {project.versions.map((version, index) => (
                  <div
                    key={version.id}
                    className={cn(
                      "p-4 border rounded-xl",
                      version.status === 'approved' && "border-green-300 bg-green-50",
                      version.status === 'rejected' && "border-red-300 bg-red-50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Image className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">Versão {version.version}</p>
                          <p className="text-xs text-gray-500">
                            {format(version.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                          {version.feedback && (
                            <p className="text-sm text-red-600 mt-1">"{version.feedback}"</p>
                          )}
                        </div>
                      </div>
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        version.status === 'approved' ? "bg-green-100 text-green-700" :
                        version.status === 'rejected' ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      )}>
                        {version.status === 'approved' ? 'Aprovado' :
                         version.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Nenhuma versão enviada ainda</p>
            )}
          </div>

          {/* Project Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Tipo</p>
              <p className="font-medium">{typeConfig.label}</p>
            </div>
            <div>
              <p className="text-gray-500">Prioridade</p>
              <p className="font-medium capitalize">{project.priority}</p>
            </div>
            <div>
              <p className="text-gray-500">Criado em</p>
              <p className="font-medium">{format(project.createdAt, "dd/MM/yyyy", { locale: ptBR })}</p>
            </div>
            <div>
              <p className="text-gray-500">Prazo</p>
              <p className="font-medium">{format(project.dueDate, "dd/MM/yyyy", { locale: ptBR })}</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex gap-3">
          <button className="flex-1 px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Comentários
          </button>
          <button className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center gap-2">
            <Upload className="w-4 h-4" />
            Nova Versão
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

