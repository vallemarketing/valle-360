'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Video, Film, Play, Pause, Clock, CheckCircle2,
  AlertTriangle, Plus, Search, X, Upload, Download,
  Music, Subtitles, Sparkles, Brain, RefreshCw,
  Target, TrendingUp, Calendar, Users, Layers,
  ChevronRight, Filter, Settings, Mic, FileVideo
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import AICollectorCard from '@/components/ai/AICollectorCard'
import SmartInsightsPanel from '@/components/ai/SmartInsightsPanel'
import GoalsTracker from '@/components/goals/GoalsTracker'
import Link from 'next/link'

// ==================== TIPOS ====================
interface VideoProject {
  id: string
  clientId: string
  clientName: string
  title: string
  type: 'reels' | 'youtube' | 'institucional' | 'ads' | 'stories' | 'tiktok'
  status: 'briefing' | 'gravacao' | 'edicao' | 'revisao' | 'legendas' | 'entregue'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate: Date
  createdAt: Date
  duration?: number // segundos
  hasSubtitles: boolean
  hasTranscription: boolean
  renderProgress?: number
  versions: VideoVersion[]
}

interface VideoVersion {
  id: string
  version: number
  url?: string
  thumbnail?: string
  createdAt: Date
  status: 'pending' | 'approved' | 'rejected'
  feedback?: string
  duration?: number
}

interface AudioTrack {
  id: string
  name: string
  artist: string
  duration: number
  category: string
  licensed: boolean
  usageCount: number
}

interface BRoll {
  id: string
  clientId: string
  clientName: string
  name: string
  thumbnail: string
  duration: number
  tags: string[]
}

// ==================== CONSTANTES ====================
const PROJECT_TYPE_CONFIG = {
  reels: { label: 'Reels', icon: Video, color: 'text-pink-600', bgColor: 'bg-pink-100' },
  youtube: { label: 'YouTube', icon: Play, color: 'text-red-600', bgColor: 'bg-red-100' },
  institucional: { label: 'Institucional', icon: Film, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  ads: { label: 'Anúncio', icon: Target, color: 'text-green-600', bgColor: 'bg-green-100' },
  stories: { label: 'Stories', icon: Layers, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  tiktok: { label: 'TikTok', icon: Video, color: 'text-cyan-600', bgColor: 'bg-cyan-100' }
}

const STATUS_CONFIG = {
  briefing: { label: 'Briefing', color: 'bg-gray-100 text-gray-700', step: 1 },
  gravacao: { label: 'Gravação', color: 'bg-blue-100 text-blue-700', step: 2 },
  edicao: { label: 'Edição', color: 'bg-purple-100 text-purple-700', step: 3 },
  revisao: { label: 'Revisão', color: 'bg-yellow-100 text-yellow-700', step: 4 },
  legendas: { label: 'Legendas', color: 'bg-orange-100 text-orange-700', step: 5 },
  entregue: { label: 'Entregue', color: 'bg-green-100 text-green-700', step: 6 }
}

const PRIORITY_CONFIG = {
  low: { label: 'Baixa', color: 'text-gray-500', bgColor: 'bg-gray-100' },
  medium: { label: 'Média', color: 'text-blue-500', bgColor: 'bg-blue-100' },
  high: { label: 'Alta', color: 'text-orange-500', bgColor: 'bg-orange-100' },
  urgent: { label: 'Urgente', color: 'text-red-500', bgColor: 'bg-red-100' }
}

// ==================== MOCK DATA ====================
const MOCK_PROJECTS: VideoProject[] = [
  {
    id: '1',
    clientId: '1',
    clientName: 'Tech Solutions',
    title: 'Vídeo Institucional 2024',
    type: 'institucional',
    status: 'edicao',
    priority: 'high',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    duration: 180,
    hasSubtitles: false,
    hasTranscription: true,
    renderProgress: 65,
    versions: [
      { id: '1', version: 1, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), status: 'rejected', feedback: 'Ajustar ritmo' }
    ]
  },
  {
    id: '2',
    clientId: '2',
    clientName: 'E-commerce Plus',
    title: 'Reels Black Friday',
    type: 'reels',
    status: 'legendas',
    priority: 'urgent',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    duration: 30,
    hasSubtitles: true,
    hasTranscription: true,
    versions: [
      { id: '1', version: 1, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), status: 'approved' }
    ]
  },
  {
    id: '3',
    clientId: '3',
    clientName: 'Fashion Store',
    title: 'Anúncio Coleção Verão',
    type: 'ads',
    status: 'revisao',
    priority: 'medium',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    duration: 15,
    hasSubtitles: false,
    hasTranscription: false,
    versions: []
  },
  {
    id: '4',
    clientId: '1',
    clientName: 'Tech Solutions',
    title: 'Tutorial Produto',
    type: 'youtube',
    status: 'gravacao',
    priority: 'low',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    hasSubtitles: false,
    hasTranscription: false,
    versions: []
  }
]

const MOCK_AUDIO_TRACKS: AudioTrack[] = [
  { id: '1', name: 'Upbeat Corporate', artist: 'AudioLibrary', duration: 120, category: 'Corporate', licensed: true, usageCount: 15 },
  { id: '2', name: 'Energetic Pop', artist: 'MusicBed', duration: 180, category: 'Pop', licensed: true, usageCount: 8 },
  { id: '3', name: 'Ambient Tech', artist: 'Epidemic Sound', duration: 240, category: 'Ambient', licensed: true, usageCount: 12 },
  { id: '4', name: 'Cinematic Epic', artist: 'Artlist', duration: 300, category: 'Cinematic', licensed: true, usageCount: 5 }
]

const MOCK_BROLLS: BRoll[] = [
  { id: '1', clientId: '1', clientName: 'Tech Solutions', name: 'Escritório', thumbnail: '', duration: 15, tags: ['office', 'tech'] },
  { id: '2', clientId: '1', clientName: 'Tech Solutions', name: 'Equipe', thumbnail: '', duration: 20, tags: ['team', 'people'] },
  { id: '3', clientId: '2', clientName: 'E-commerce Plus', name: 'Produtos', thumbnail: '', duration: 10, tags: ['products', 'ecommerce'] }
]

// ==================== COMPONENTE PRINCIPAL ====================
export default function VideoMakerPage() {
  const [projects, setProjects] = useState<VideoProject[]>(MOCK_PROJECTS)
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>(MOCK_AUDIO_TRACKS)
  const [brolls, setBrolls] = useState<BRoll[]>(MOCK_BROLLS)
  const [selectedProject, setSelectedProject] = useState<VideoProject | null>(null)
  const [activeTab, setActiveTab] = useState<'projects' | 'audio' | 'broll'>('projects')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [generatingSubtitles, setGeneratingSubtitles] = useState<string | null>(null)

  // Estatísticas
  const stats = {
    totalProjects: projects.length,
    inProduction: projects.filter(p => ['gravacao', 'edicao'].includes(p.status)).length,
    pendingReview: projects.filter(p => p.status === 'revisao').length,
    delivered: projects.filter(p => p.status === 'entregue').length,
    avgProductionTime: 8, // dias
    totalMinutes: Math.round(projects.reduce((sum, p) => sum + (p.duration || 0), 0) / 60)
  }

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleGenerateSubtitles = async (projectId: string) => {
    setGeneratingSubtitles(projectId)
    // Simular geração de legendas
    await new Promise(resolve => setTimeout(resolve, 3000))
    setProjects(projects.map(p => 
      p.id === projectId 
        ? { ...p, hasSubtitles: true, hasTranscription: true }
        : p
    ))
    setGeneratingSubtitles(null)
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Painel Video Maker</h1>
              <p className="text-sm text-gray-500">Produção, edição e entrega de vídeos</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/colaborador/kanban">
              <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
                <Layers className="w-4 h-4" />
                Ver Kanban
              </button>
            </Link>
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
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
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Video className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalProjects}</p>
                <p className="text-xs text-gray-500">Projetos</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Film className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.inProduction}</p>
                <p className="text-xs text-gray-500">Em Produção</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.pendingReview}</p>
                <p className="text-xs text-gray-500">Em Revisão</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.delivered}</p>
                <p className="text-xs text-gray-500">Entregues</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.avgProductionTime}d</p>
                <p className="text-xs text-gray-500">Tempo Médio</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                <Play className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalMinutes}min</p>
                <p className="text-xs text-gray-500">Total Produzido</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Projects */}
          <div className="col-span-2 space-y-6">
            {/* AI Collector */}
            <AICollectorCard area="video_maker" maxAlerts={3} />

            {/* Tabs */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="flex border-b">
                {[
                  { id: 'projects', label: 'Projetos', icon: Video },
                  { id: 'audio', label: 'Biblioteca de Áudio', icon: Music },
                  { id: 'broll', label: 'B-Rolls', icon: Film }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
                      activeTab === tab.id
                        ? "bg-purple-50 text-purple-700 border-b-2 border-purple-600"
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
                          className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className={cn(
                                  "w-12 h-12 rounded-xl flex items-center justify-center",
                                  typeConfig.bgColor
                                )}>
                                  <TypeIcon className={cn("w-6 h-6", typeConfig.color)} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h4 className="font-semibold text-gray-800">{project.title}</h4>
                                    <span className={cn("text-xs px-2 py-0.5 rounded-full", statusConfig.color)}>
                                      {statusConfig.label}
                                    </span>
                                    <span className={cn("text-xs px-2 py-0.5 rounded-full", priorityConfig.bgColor, priorityConfig.color)}>
                                      {priorityConfig.label}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-500">{project.clientName}</p>
                                  
                                  {/* Pipeline Progress */}
                                  <div className="flex items-center gap-1 mt-2">
                                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                      <div
                                        key={key}
                                        className={cn(
                                          "h-1.5 flex-1 rounded-full",
                                          config.step <= statusConfig.step ? "bg-purple-500" : "bg-gray-200"
                                        )}
                                      />
                                    ))}
                                  </div>

                                  {/* Info badges */}
                                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                    {project.duration && (
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatDuration(project.duration)}
                                      </span>
                                    )}
                                    {project.hasSubtitles && (
                                      <span className="flex items-center gap-1 text-green-600">
                                        <Subtitles className="w-3 h-3" />
                                        Legendas
                                      </span>
                                    )}
                                    {project.hasTranscription && (
                                      <span className="flex items-center gap-1 text-blue-600">
                                        <Mic className="w-3 h-3" />
                                        Transcrição
                                      </span>
                                    )}
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
                                {project.renderProgress !== undefined && project.renderProgress < 100 && (
                                  <div className="mt-2">
                                    <p className="text-xs text-gray-500 mb-1">Renderizando...</p>
                                    <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-purple-500 rounded-full"
                                        style={{ width: `${project.renderProgress}%` }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Quick Actions */}
                            {!project.hasSubtitles && project.status !== 'briefing' && (
                              <div className="mt-3 pt-3 border-t">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleGenerateSubtitles(project.id)
                                  }}
                                  disabled={generatingSubtitles === project.id}
                                  className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
                                >
                                  {generatingSubtitles === project.id ? (
                                    <>
                                      <RefreshCw className="w-4 h-4 animate-spin" />
                                      Gerando legendas...
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="w-4 h-4" />
                                      Gerar legendas automáticas
                                    </>
                                  )}
                                </button>
                              </div>
                            )}
                          </motion.div>
                        )
                      })}
                    </div>
                  </>
                )}

                {activeTab === 'audio' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-800">Trilhas Licenciadas</h4>
                      <button className="text-sm text-purple-600 hover:text-purple-700">
                        Adicionar trilha
                      </button>
                    </div>
                    {audioTracks.map((track, index) => (
                      <motion.div
                        key={track.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-4 p-4 border rounded-xl hover:shadow-md transition-all"
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <Music className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{track.name}</h4>
                          <p className="text-sm text-gray-500">{track.artist}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                            <span>{formatDuration(track.duration)}</span>
                            <span>{track.category}</span>
                            <span className="text-green-600">✓ Licenciada</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Usado {track.usageCount}x</p>
                          <button className="mt-1 p-2 hover:bg-gray-100 rounded-lg">
                            <Play className="w-4 h-4 text-purple-600" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {activeTab === 'broll' && (
                  <div className="grid grid-cols-3 gap-4">
                    {brolls.map((broll, index) => (
                      <motion.div
                        key={broll.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="border rounded-xl overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                      >
                        <div className="h-24 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center relative">
                          <FileVideo className="w-10 h-10 text-gray-400" />
                          <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white text-xs rounded">
                            {formatDuration(broll.duration)}
                          </div>
                        </div>
                        <div className="p-3">
                          <h4 className="font-semibold text-gray-800 text-sm">{broll.name}</h4>
                          <p className="text-xs text-gray-500">{broll.clientName}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {broll.tags.map(tag => (
                              <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    <div className="border-2 border-dashed border-gray-300 rounded-xl h-full min-h-[150px] flex items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
                      <div className="text-center">
                        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Adicionar B-Roll</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Goals & Insights */}
          <div className="space-y-6">
            <GoalsTracker area="video_maker" />
            <SmartInsightsPanel area="video_maker" maxInsights={4} />

            {/* AI Tools */}
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800">Ferramentas IA</h3>
              </div>
              <div className="space-y-2">
                <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3">
                  <Subtitles className="w-5 h-5 text-purple-500" />
                  <div>
                    <span className="text-sm font-medium">Gerar Legendas</span>
                    <p className="text-xs text-gray-500">Transcrição automática</p>
                  </div>
                </button>
                <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3">
                  <Mic className="w-5 h-5 text-blue-500" />
                  <div>
                    <span className="text-sm font-medium">Transcrever Áudio</span>
                    <p className="text-xs text-gray-500">Speech-to-text</p>
                  </div>
                </button>
                <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-pink-500" />
                  <div>
                    <span className="text-sm font-medium">Sugerir Cortes</span>
                    <p className="text-xs text-gray-500">IA analisa o vídeo</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Render Queue */}
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Fila de Renderização</h3>
              {projects.filter(p => p.renderProgress !== undefined && p.renderProgress < 100).length > 0 ? (
                <div className="space-y-3">
                  {projects.filter(p => p.renderProgress !== undefined && p.renderProgress < 100).map(project => (
                    <div key={project.id} className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-800">{project.title}</span>
                        <span className="text-sm text-purple-600">{project.renderProgress}%</span>
                      </div>
                      <div className="h-2 bg-purple-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 rounded-full transition-all"
                          style={{ width: `${project.renderProgress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Nenhuma renderização em andamento</p>
              )}
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
            onGenerateSubtitles={() => handleGenerateSubtitles(selectedProject.id)}
            generatingSubtitles={generatingSubtitles === selectedProject.id}
            formatDuration={formatDuration}
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
  onGenerateSubtitles,
  generatingSubtitles,
  formatDuration
}: {
  project: VideoProject
  onClose: () => void
  onGenerateSubtitles: () => void
  generatingSubtitles: boolean
  formatDuration: (seconds: number) => string
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
          {/* Pipeline */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-800 mb-3">Pipeline de Produção</h4>
            <div className="flex items-center gap-2">
              {Object.entries(STATUS_CONFIG).map(([key, config], index) => (
                <div key={key} className="flex-1">
                  <div className={cn(
                    "h-2 rounded-full",
                    config.step <= statusConfig.step ? "bg-purple-500" : "bg-gray-200"
                  )} />
                  <p className={cn(
                    "text-xs mt-1 text-center",
                    config.step <= statusConfig.step ? "text-purple-600 font-medium" : "text-gray-400"
                  )}>
                    {config.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <Clock className="w-5 h-5 mx-auto text-gray-400 mb-1" />
              <p className="text-lg font-bold text-gray-800">
                {project.duration ? formatDuration(project.duration) : '--:--'}
              </p>
              <p className="text-xs text-gray-500">Duração</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <Subtitles className={cn(
                "w-5 h-5 mx-auto mb-1",
                project.hasSubtitles ? "text-green-500" : "text-gray-400"
              )} />
              <p className="text-lg font-bold text-gray-800">
                {project.hasSubtitles ? 'Sim' : 'Não'}
              </p>
              <p className="text-xs text-gray-500">Legendas</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg text-center">
              <Layers className="w-5 h-5 mx-auto text-gray-400 mb-1" />
              <p className="text-lg font-bold text-gray-800">{project.versions.length}</p>
              <p className="text-xs text-gray-500">Versões</p>
            </div>
          </div>

          {/* Versions */}
          {project.versions.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-800 mb-3">Versões</h4>
              <div className="space-y-2">
                {project.versions.map(version => (
                  <div
                    key={version.id}
                    className={cn(
                      "p-3 border rounded-lg",
                      version.status === 'approved' && "border-green-300 bg-green-50",
                      version.status === 'rejected' && "border-red-300 bg-red-50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Versão {version.version}</span>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        version.status === 'approved' ? "bg-green-100 text-green-700" :
                        version.status === 'rejected' ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      )}>
                        {version.status === 'approved' ? 'Aprovado' :
                         version.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                      </span>
                    </div>
                    {version.feedback && (
                      <p className="text-sm text-red-600 mt-1">"{version.feedback}"</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Actions */}
          {!project.hasSubtitles && (
            <div className="p-4 bg-purple-50 rounded-xl">
              <div className="flex items-center gap-2 text-purple-700 font-medium mb-2">
                <Sparkles className="w-4 h-4" />
                Ferramentas de IA
              </div>
              <button
                onClick={onGenerateSubtitles}
                disabled={generatingSubtitles}
                className="w-full p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {generatingSubtitles ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Gerando legendas...
                  </>
                ) : (
                  <>
                    <Subtitles className="w-4 h-4" />
                    Gerar Legendas Automáticas
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50 flex gap-3">
          <button className="flex-1 px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Baixar
          </button>
          <button className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2">
            <Upload className="w-4 h-4" />
            Nova Versão
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}



