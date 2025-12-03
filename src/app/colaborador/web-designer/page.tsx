'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe, Code, Palette, Layout, Smartphone, Monitor,
  CheckCircle2, Clock, AlertTriangle, Zap, Plus, Search,
  ChevronRight, X, ExternalLink, Eye, Settings, Layers,
  FileCode, Image, Box, Sparkles, Brain, RefreshCw,
  Target, TrendingUp, Calendar, Users
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import AICollectorCard from '@/components/ai/AICollectorCard'
import SmartInsightsPanel from '@/components/ai/SmartInsightsPanel'
import GoalsTracker from '@/components/goals/GoalsTracker'
import Link from 'next/link'

// ==================== TIPOS ====================
interface WebProject {
  id: string
  clientId: string
  clientName: string
  title: string
  type: 'landing' | 'institucional' | 'ecommerce' | 'blog' | 'webapp'
  status: 'briefing' | 'design' | 'development' | 'review' | 'testing' | 'completed'
  progress: number
  dueDate: Date
  startDate: Date
  technologies: string[]
  checklist: ChecklistItem[]
  complexity: 'low' | 'medium' | 'high'
  estimatedHours: number
  actualHours: number
}

interface ChecklistItem {
  id: string
  label: string
  category: 'design' | 'development' | 'seo' | 'performance' | 'accessibility'
  completed: boolean
}

interface Template {
  id: string
  name: string
  type: string
  thumbnail: string
  usageCount: number
  rating: number
}

// ==================== CONSTANTES ====================
const PROJECT_TYPE_CONFIG = {
  landing: { label: 'Landing Page', icon: Layout, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  institucional: { label: 'Site Institucional', icon: Globe, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  ecommerce: { label: 'E-commerce', icon: Box, color: 'text-green-600', bgColor: 'bg-green-100' },
  blog: { label: 'Blog', icon: FileCode, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  webapp: { label: 'Web App', icon: Code, color: 'text-cyan-600', bgColor: 'bg-cyan-100' }
}

const STATUS_CONFIG = {
  briefing: { label: 'Briefing', color: 'bg-gray-100 text-gray-700', progress: 10 },
  design: { label: 'Design', color: 'bg-purple-100 text-purple-700', progress: 30 },
  development: { label: 'Desenvolvimento', color: 'bg-blue-100 text-blue-700', progress: 60 },
  review: { label: 'Revisão', color: 'bg-orange-100 text-orange-700', progress: 80 },
  testing: { label: 'Testes', color: 'bg-yellow-100 text-yellow-700', progress: 90 },
  completed: { label: 'Concluído', color: 'bg-green-100 text-green-700', progress: 100 }
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: '1', label: 'Design responsivo (Mobile, Tablet, Desktop)', category: 'design', completed: false },
  { id: '2', label: 'Paleta de cores aprovada', category: 'design', completed: false },
  { id: '3', label: 'Tipografia definida', category: 'design', completed: false },
  { id: '4', label: 'Imagens otimizadas', category: 'performance', completed: false },
  { id: '5', label: 'Meta tags configuradas', category: 'seo', completed: false },
  { id: '6', label: 'Sitemap.xml criado', category: 'seo', completed: false },
  { id: '7', label: 'Google Analytics instalado', category: 'seo', completed: false },
  { id: '8', label: 'SSL configurado', category: 'development', completed: false },
  { id: '9', label: 'Formulários funcionando', category: 'development', completed: false },
  { id: '10', label: 'Lighthouse score > 90', category: 'performance', completed: false },
  { id: '11', label: 'Textos alternativos em imagens', category: 'accessibility', completed: false },
  { id: '12', label: 'Teste cross-browser', category: 'development', completed: false }
]

// ==================== MOCK DATA ====================
const MOCK_PROJECTS: WebProject[] = [
  {
    id: '1',
    clientId: '1',
    clientName: 'Tech Solutions',
    title: 'Landing Page - Lançamento Produto',
    type: 'landing',
    status: 'development',
    progress: 65,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    technologies: ['Next.js', 'Tailwind', 'Framer Motion'],
    checklist: DEFAULT_CHECKLIST.map((item, i) => ({ ...item, completed: i < 6 })),
    complexity: 'medium',
    estimatedHours: 40,
    actualHours: 28
  },
  {
    id: '2',
    clientId: '2',
    clientName: 'E-commerce Plus',
    title: 'Redesign Site Institucional',
    type: 'institucional',
    status: 'design',
    progress: 35,
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    technologies: ['React', 'Styled Components'],
    checklist: DEFAULT_CHECKLIST.map((item, i) => ({ ...item, completed: i < 3 })),
    complexity: 'high',
    estimatedHours: 80,
    actualHours: 20
  },
  {
    id: '3',
    clientId: '3',
    clientName: 'Fashion Store',
    title: 'E-commerce Moda',
    type: 'ecommerce',
    status: 'review',
    progress: 85,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    technologies: ['Shopify', 'Liquid', 'JavaScript'],
    checklist: DEFAULT_CHECKLIST.map((item, i) => ({ ...item, completed: i < 10 })),
    complexity: 'high',
    estimatedHours: 100,
    actualHours: 92
  }
]

const MOCK_TEMPLATES: Template[] = [
  { id: '1', name: 'Landing SaaS Moderna', type: 'landing', thumbnail: '/templates/saas.png', usageCount: 15, rating: 4.8 },
  { id: '2', name: 'E-commerce Minimalista', type: 'ecommerce', thumbnail: '/templates/ecommerce.png', usageCount: 8, rating: 4.5 },
  { id: '3', name: 'Portfolio Criativo', type: 'institucional', thumbnail: '/templates/portfolio.png', usageCount: 12, rating: 4.7 },
  { id: '4', name: 'Blog Tech', type: 'blog', thumbnail: '/templates/blog.png', usageCount: 6, rating: 4.3 }
]

// ==================== COMPONENTE PRINCIPAL ====================
export default function WebDesignerPage() {
  const [projects, setProjects] = useState<WebProject[]>(MOCK_PROJECTS)
  const [templates, setTemplates] = useState<Template[]>(MOCK_TEMPLATES)
  const [selectedProject, setSelectedProject] = useState<WebProject | null>(null)
  const [activeTab, setActiveTab] = useState<'projects' | 'templates' | 'components'>('projects')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Estatísticas
  const stats = {
    totalProjects: projects.length,
    inProgress: projects.filter(p => !['completed', 'briefing'].includes(p.status)).length,
    completed: projects.filter(p => p.status === 'completed').length,
    avgDeliveryTime: 12, // dias
    onTimeRate: 85, // %
    totalHours: projects.reduce((sum, p) => sum + p.actualHours, 0)
  }

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <Code className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Painel Web Designer</h1>
              <p className="text-sm text-gray-500">Projetos, templates e componentes</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/colaborador/kanban">
              <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
                <Layers className="w-4 h-4" />
                Ver Kanban
              </button>
            </Link>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              Novo Projeto
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
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalProjects}</p>
                <p className="text-xs text-gray-500">Total Projetos</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.inProgress}</p>
                <p className="text-xs text-gray-500">Em Andamento</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.completed}</p>
                <p className="text-xs text-gray-500">Concluídos</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.avgDeliveryTime}d</p>
                <p className="text-xs text-gray-500">Tempo Médio</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Target className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.onTimeRate}%</p>
                <p className="text-xs text-gray-500">No Prazo</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalHours}h</p>
                <p className="text-xs text-gray-500">Horas Trabalhadas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Projects */}
          <div className="col-span-2 space-y-6">
            {/* AI Collector */}
            <AICollectorCard area="web_designer" maxAlerts={3} />

            {/* Tabs */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="flex border-b">
                {[
                  { id: 'projects', label: 'Projetos', icon: Globe },
                  { id: 'templates', label: 'Templates', icon: Layout },
                  { id: 'components', label: 'Componentes', icon: Box }
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

                    {/* Projects List */}
                    <div className="space-y-3">
                      {filteredProjects.map((project, index) => {
                        const typeConfig = PROJECT_TYPE_CONFIG[project.type]
                        const statusConfig = STATUS_CONFIG[project.status]
                        const TypeIcon = typeConfig.icon
                        const daysUntilDue = differenceInDays(project.dueDate, new Date())
                        const isOverdue = daysUntilDue < 0
                        const isUrgent = daysUntilDue <= 2 && daysUntilDue >= 0
                        const completedChecklist = project.checklist.filter(c => c.completed).length
                        const totalChecklist = project.checklist.length

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
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className={cn(
                                  "w-10 h-10 rounded-xl flex items-center justify-center",
                                  typeConfig.bgColor
                                )}>
                                  <TypeIcon className={cn("w-5 h-5", typeConfig.color)} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-gray-800">{project.title}</h4>
                                    <span className={cn("text-xs px-2 py-0.5 rounded-full", statusConfig.color)}>
                                      {statusConfig.label}
                                    </span>
                                    {isOverdue && (
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        Atrasado
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500">{project.clientName}</p>
                                  
                                  {/* Progress Bar */}
                                  <div className="mt-2 w-48">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                      <span>{project.progress}% concluído</span>
                                      <span>{completedChecklist}/{totalChecklist} itens</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                      <div 
                                        className={cn(
                                          "h-full rounded-full transition-all",
                                          project.progress >= 80 ? "bg-green-500" :
                                          project.progress >= 50 ? "bg-blue-500" : "bg-yellow-500"
                                        )}
                                        style={{ width: `${project.progress}%` }}
                                      />
                                    </div>
                                  </div>

                                  {/* Technologies */}
                                  <div className="flex items-center gap-2 mt-2">
                                    {project.technologies.slice(0, 3).map(tech => (
                                      <span key={tech} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                        {tech}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <p className={cn(
                                  "text-sm font-medium",
                                  isOverdue ? "text-red-600" :
                                  isUrgent ? "text-orange-600" : "text-gray-600"
                                )}>
                                  {isOverdue 
                                    ? `${Math.abs(daysUntilDue)}d atrasado`
                                    : `${daysUntilDue}d restantes`}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {project.actualHours}h / {project.estimatedHours}h
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </>
                )}

                {activeTab === 'templates' && (
                  <div className="grid grid-cols-2 gap-4">
                    {templates.map((template, index) => (
                      <motion.div
                        key={template.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="border rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                      >
                        <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <Layout className="w-12 h-12 text-gray-400" />
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-800">{template.name}</h4>
                          <p className="text-sm text-gray-500 capitalize">{template.type}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-400">Usado {template.usageCount}x</span>
                            <span className="text-xs text-yellow-600">★ {template.rating}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {activeTab === 'components' && (
                  <div className="text-center py-12">
                    <Box className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">Biblioteca de Componentes</h3>
                    <p className="text-gray-500 mb-4">Acesse componentes reutilizáveis para seus projetos</p>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Explorar Componentes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Goals & Insights */}
          <div className="space-y-6">
            <GoalsTracker area="web_designer" />
            <SmartInsightsPanel area="web_designer" maxInsights={4} />

            {/* AI Suggestions */}
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800">Sugestões da IA</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 text-blue-700 text-sm font-medium mb-1">
                    <Sparkles className="w-4 h-4" />
                    Layout Sugerido
                  </div>
                  <p className="text-sm text-blue-600">
                    Para o segmento de tecnologia, layouts com hero sections grandes e animações suaves performam 40% melhor.
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center gap-2 text-green-700 text-sm font-medium mb-1">
                    <TrendingUp className="w-4 h-4" />
                    Performance
                  </div>
                  <p className="text-sm text-green-600">
                    Projeto "Landing Page" pode melhorar 15% no Lighthouse otimizando imagens.
                  </p>
                </div>
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
            onUpdateChecklist={(updatedChecklist) => {
              setProjects(projects.map(p => 
                p.id === selectedProject.id 
                  ? { ...p, checklist: updatedChecklist }
                  : p
              ))
              setSelectedProject({ ...selectedProject, checklist: updatedChecklist })
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== PROJECT DETAIL MODAL ====================
function ProjectDetailModal({
  project,
  onClose,
  onUpdateChecklist
}: {
  project: WebProject
  onClose: () => void
  onUpdateChecklist: (checklist: ChecklistItem[]) => void
}) {
  const typeConfig = PROJECT_TYPE_CONFIG[project.type]
  const statusConfig = STATUS_CONFIG[project.status]
  const TypeIcon = typeConfig.icon
  const completedCount = project.checklist.filter(c => c.completed).length

  const toggleChecklistItem = (itemId: string) => {
    const updatedChecklist = project.checklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    )
    onUpdateChecklist(updatedChecklist)
  }

  const checklistByCategory = {
    design: project.checklist.filter(c => c.category === 'design'),
    development: project.checklist.filter(c => c.category === 'development'),
    seo: project.checklist.filter(c => c.category === 'seo'),
    performance: project.checklist.filter(c => c.category === 'performance'),
    accessibility: project.checklist.filter(c => c.category === 'accessibility')
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
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
          {/* Progress Overview */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progresso Geral</span>
              <span className="text-sm text-gray-500">{completedCount}/{project.checklist.length} itens</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all"
                style={{ width: `${(completedCount / project.checklist.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Checklist by Category */}
          <div className="space-y-6">
            {Object.entries(checklistByCategory).map(([category, items]) => (
              <div key={category}>
                <h4 className="font-medium text-gray-800 mb-3 capitalize flex items-center gap-2">
                  {category === 'design' && <Palette className="w-4 h-4 text-purple-500" />}
                  {category === 'development' && <Code className="w-4 h-4 text-blue-500" />}
                  {category === 'seo' && <Globe className="w-4 h-4 text-green-500" />}
                  {category === 'performance' && <Zap className="w-4 h-4 text-yellow-500" />}
                  {category === 'accessibility' && <Users className="w-4 h-4 text-cyan-500" />}
                  {category}
                </h4>
                <div className="space-y-2">
                  {items.map(item => (
                    <label
                      key={item.id}
                      className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleChecklistItem(item.id)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={cn(
                        "text-sm",
                        item.completed ? "text-gray-400 line-through" : "text-gray-700"
                      )}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Project Info */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium text-gray-800 mb-3">Informações do Projeto</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Início</p>
                <p className="font-medium">{format(project.startDate, "dd/MM/yyyy", { locale: ptBR })}</p>
              </div>
              <div>
                <p className="text-gray-500">Entrega</p>
                <p className="font-medium">{format(project.dueDate, "dd/MM/yyyy", { locale: ptBR })}</p>
              </div>
              <div>
                <p className="text-gray-500">Complexidade</p>
                <p className="font-medium capitalize">{project.complexity}</p>
              </div>
              <div>
                <p className="text-gray-500">Horas Estimadas</p>
                <p className="font-medium">{project.estimatedHours}h</p>
              </div>
              <div>
                <p className="text-gray-500">Horas Trabalhadas</p>
                <p className="font-medium">{project.actualHours}h</p>
              </div>
              <div>
                <p className="text-gray-500">Tecnologias</p>
                <p className="font-medium">{project.technologies.join(', ')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex gap-3">
          <button className="flex-1 px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
            <ExternalLink className="w-4 h-4" />
            Abrir Projeto
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}




