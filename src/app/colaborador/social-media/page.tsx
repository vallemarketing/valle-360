'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Instagram, Facebook, Linkedin, Youtube, Twitter, Globe,
  Calendar, Clock, Image, Video, FileText, Send, Plus,
  TrendingUp, TrendingDown, Heart, MessageCircle, Share2,
  Eye, Users, Target, Zap, Sparkles, RefreshCw, X,
  ChevronLeft, ChevronRight, Check, AlertTriangle, BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, addDays, startOfWeek, eachDayOfInterval, isSameDay, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import AICollectorCard from '@/components/ai/AICollectorCard'
import SmartInsightsPanel from '@/components/ai/SmartInsightsPanel'
import GoalsTracker from '@/components/goals/GoalsTracker'

// ==================== TIPOS ====================
interface ScheduledPost {
  id: string
  clientId: string
  clientName: string
  platform: 'instagram' | 'facebook' | 'linkedin' | 'youtube' | 'twitter'
  type: 'image' | 'video' | 'carousel' | 'story' | 'reel'
  caption: string
  mediaUrl?: string
  scheduledDate: Date
  scheduledTime: string
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  engagement?: {
    likes: number
    comments: number
    shares: number
    views: number
  }
}

interface Client {
  id: string
  name: string
  platforms: string[]
  lastPost?: Date
  avgEngagement: number
}

interface PlatformMetrics {
  platform: string
  followers: number
  growth: number
  engagement: number
  posts: number
}

// ==================== CONSTANTES ====================
const PLATFORM_CONFIG = {
  instagram: { icon: Instagram, color: '#E4405F', bgColor: 'bg-pink-100', label: 'Instagram' },
  facebook: { icon: Facebook, color: '#1877F2', bgColor: 'bg-blue-100', label: 'Facebook' },
  linkedin: { icon: Linkedin, color: '#0A66C2', bgColor: 'bg-sky-100', label: 'LinkedIn' },
  youtube: { icon: Youtube, color: '#FF0000', bgColor: 'bg-red-100', label: 'YouTube' },
  twitter: { icon: Twitter, color: '#1DA1F2', bgColor: 'bg-cyan-100', label: 'Twitter' }
}

const POST_TYPE_CONFIG = {
  image: { icon: Image, label: 'Imagem' },
  video: { icon: Video, label: 'Vídeo' },
  carousel: { icon: FileText, label: 'Carrossel' },
  story: { icon: Clock, label: 'Story' },
  reel: { icon: Video, label: 'Reels' }
}

// ==================== MOCK DATA ====================
const MOCK_POSTS: ScheduledPost[] = [
  {
    id: '1',
    clientId: '1',
    clientName: 'Tech Solutions',
    platform: 'instagram',
    type: 'carousel',
    caption: '5 dicas para aumentar sua produtividade no trabalho remoto 💼✨ #produtividade #homeoffice',
    scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    scheduledTime: '18:30',
    status: 'scheduled'
  },
  {
    id: '2',
    clientId: '2',
    clientName: 'E-commerce Plus',
    platform: 'facebook',
    type: 'video',
    caption: 'Conheça nossa nova coleção de verão! 🌞 Aproveite os descontos especiais.',
    scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    scheduledTime: '12:00',
    status: 'scheduled'
  },
  {
    id: '3',
    clientId: '1',
    clientName: 'Tech Solutions',
    platform: 'linkedin',
    type: 'image',
    caption: 'Estamos contratando! Venha fazer parte do nosso time de tecnologia.',
    scheduledDate: new Date(),
    scheduledTime: '10:00',
    status: 'published',
    engagement: { likes: 245, comments: 32, shares: 18, views: 1520 }
  }
]

const MOCK_CLIENTS: Client[] = [
  { id: '1', name: 'Tech Solutions', platforms: ['instagram', 'linkedin', 'facebook'], lastPost: new Date(), avgEngagement: 4.5 },
  { id: '2', name: 'E-commerce Plus', platforms: ['instagram', 'facebook'], lastPost: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), avgEngagement: 3.2 },
  { id: '3', name: 'Fashion Store', platforms: ['instagram', 'youtube'], lastPost: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), avgEngagement: 5.8 }
]

const MOCK_METRICS: PlatformMetrics[] = [
  { platform: 'instagram', followers: 15420, growth: 3.2, engagement: 4.8, posts: 45 },
  { platform: 'facebook', followers: 8750, growth: 1.5, engagement: 2.3, posts: 32 },
  { platform: 'linkedin', followers: 3200, growth: 5.1, engagement: 3.9, posts: 18 }
]

// ==================== COMPONENTE PRINCIPAL ====================
export default function SocialMediaPage() {
  const [posts, setPosts] = useState<ScheduledPost[]>(MOCK_POSTS)
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS)
  const [metrics, setMetrics] = useState<PlatformMetrics[]>(MOCK_METRICS)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showNewPostModal, setShowNewPostModal] = useState(false)
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null)
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [selectedClient, setSelectedClient] = useState<string>('all')

  // Estatísticas
  const stats = {
    totalPosts: posts.length,
    scheduledPosts: posts.filter(p => p.status === 'scheduled').length,
    publishedToday: posts.filter(p => p.status === 'published' && isSameDay(p.scheduledDate, new Date())).length,
    totalEngagement: posts.reduce((sum, p) => sum + (p.engagement?.likes || 0) + (p.engagement?.comments || 0), 0),
    avgEngagement: 4.2
  }

  // Gerar dias da semana atual
  const weekStart = startOfWeek(selectedDate, { locale: ptBR })
  const weekDays = eachDayOfInterval({ start: weekStart, end: addDays(weekStart, 6) })

  const getPostsForDay = (day: Date) => {
    return posts.filter(post => isSameDay(post.scheduledDate, day))
  }

  const filteredPosts = selectedClient === 'all' 
    ? posts 
    : posts.filter(p => p.clientId === selectedClient)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Painel Social Media</h1>
            <p className="text-sm text-gray-500">Gerencie posts, agende conteúdo e acompanhe métricas</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="all">Todos os clientes</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
            <button
              onClick={() => setShowNewPostModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Novo Post
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.scheduledPosts}</p>
                <p className="text-xs text-gray-500">Agendados</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.publishedToday}</p>
                <p className="text-xs text-gray-500">Publicados Hoje</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <Heart className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalEngagement}</p>
                <p className="text-xs text-gray-500">Engajamentos</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.avgEngagement}%</p>
                <p className="text-xs text-gray-500">Eng. Médio</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{clients.length}</p>
                <p className="text-xs text-gray-500">Clientes Ativos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Calendar & Posts */}
          <div className="col-span-2 space-y-6">
            {/* AI Collector */}
            <AICollectorCard area="social_media" maxAlerts={3} />

            {/* Calendar/List View */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              {/* View Toggle */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedDate(addDays(selectedDate, -7))}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <h3 className="font-semibold text-gray-800">
                    {format(weekStart, "'Semana de' dd MMM", { locale: ptBR })}
                  </h3>
                  <button
                    onClick={() => setSelectedDate(addDays(selectedDate, 7))}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                      viewMode === 'calendar' ? "bg-white shadow text-gray-800" : "text-gray-600"
                    )}
                  >
                    Calendário
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                      viewMode === 'list' ? "bg-white shadow text-gray-800" : "text-gray-600"
                    )}
                  >
                    Lista
                  </button>
                </div>
              </div>

              {viewMode === 'calendar' ? (
                <div className="grid grid-cols-7 divide-x">
                  {weekDays.map((day, idx) => {
                    const dayPosts = getPostsForDay(day)
                    const isCurrentDay = isToday(day)

                    return (
                      <div key={idx} className="min-h-[200px]">
                        <div className={cn(
                          "p-2 text-center border-b",
                          isCurrentDay && "bg-pink-50"
                        )}>
                          <p className="text-xs text-gray-500">
                            {format(day, 'EEE', { locale: ptBR })}
                          </p>
                          <p className={cn(
                            "text-lg font-bold",
                            isCurrentDay ? "text-pink-600" : "text-gray-800"
                          )}>
                            {format(day, 'd')}
                          </p>
                        </div>
                        <div className="p-2 space-y-2">
                          {dayPosts.map(post => {
                            const platform = PLATFORM_CONFIG[post.platform]
                            const PlatformIcon = platform.icon

                            return (
                              <div
                                key={post.id}
                                onClick={() => setSelectedPost(post)}
                                className={cn(
                                  "p-2 rounded-lg cursor-pointer hover:shadow-md transition-all text-xs",
                                  platform.bgColor
                                )}
                              >
                                <div className="flex items-center gap-1 mb-1">
                                  <PlatformIcon className="w-3 h-3" style={{ color: platform.color }} />
                                  <span className="font-medium truncate">{post.clientName}</span>
                                </div>
                                <p className="text-gray-600 truncate">{post.scheduledTime}</p>
                              </div>
                            )
                          })}
                          <button
                            onClick={() => {
                              setSelectedDate(day)
                              setShowNewPostModal(true)
                            }}
                            className="w-full p-2 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-pink-300 hover:text-pink-500 transition-colors"
                          >
                            <Plus className="w-4 h-4 mx-auto" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredPosts.map((post, index) => {
                    const platform = PLATFORM_CONFIG[post.platform]
                    const PlatformIcon = platform.icon
                    const PostTypeIcon = POST_TYPE_CONFIG[post.type].icon

                    return (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedPost(post)}
                        className="p-4 hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center",
                            platform.bgColor
                          )}>
                            <PlatformIcon className="w-6 h-6" style={{ color: platform.color }} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-800">{post.clientName}</span>
                              <span className={cn(
                                "text-xs px-2 py-0.5 rounded-full",
                                post.status === 'published' ? "bg-green-100 text-green-700" :
                                post.status === 'scheduled' ? "bg-blue-100 text-blue-700" :
                                post.status === 'failed' ? "bg-red-100 text-red-700" :
                                "bg-gray-100 text-gray-700"
                              )}>
                                {post.status === 'published' ? 'Publicado' :
                                 post.status === 'scheduled' ? 'Agendado' :
                                 post.status === 'failed' ? 'Falhou' : 'Rascunho'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">{post.caption}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(post.scheduledDate, 'dd/MM', { locale: ptBR })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {post.scheduledTime}
                              </span>
                              <span className="flex items-center gap-1">
                                <PostTypeIcon className="w-3 h-3" />
                                {POST_TYPE_CONFIG[post.type].label}
                              </span>
                            </div>
                          </div>
                          {post.engagement && (
                            <div className="text-right text-xs">
                              <div className="flex items-center gap-2 text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Heart className="w-3 h-3" />
                                  {post.engagement.likes}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="w-3 h-3" />
                                  {post.engagement.comments}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Platform Metrics */}
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <h3 className="font-semibold text-gray-800 mb-4">Métricas por Plataforma</h3>
              <div className="grid grid-cols-3 gap-4">
                {metrics.map(metric => {
                  const platform = PLATFORM_CONFIG[metric.platform as keyof typeof PLATFORM_CONFIG]
                  const PlatformIcon = platform.icon

                  return (
                    <div key={metric.platform} className="p-4 border rounded-xl">
                      <div className="flex items-center gap-2 mb-3">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", platform.bgColor)}>
                          <PlatformIcon className="w-4 h-4" style={{ color: platform.color }} />
                        </div>
                        <span className="font-medium text-gray-800">{platform.label}</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Seguidores</span>
                          <span className="font-medium">{metric.followers.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Crescimento</span>
                          <span className={cn(
                            "font-medium flex items-center gap-1",
                            metric.growth > 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {metric.growth > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {metric.growth}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Engajamento</span>
                          <span className="font-medium">{metric.engagement}%</span>
                        </div>
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
            <GoalsTracker area="social_media" />

            {/* Smart Insights */}
            <SmartInsightsPanel area="social_media" maxInsights={4} />

            {/* Clients Status */}
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <h3 className="font-semibold text-gray-800 mb-4">Status dos Clientes</h3>
              <div className="space-y-3">
                {clients.map(client => {
                  const daysSincePost = client.lastPost
                    ? Math.floor((Date.now() - client.lastPost.getTime()) / (1000 * 60 * 60 * 24))
                    : 999
                  const isOverdue = daysSincePost > 3

                  return (
                    <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{client.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {client.platforms.map(p => {
                            const platform = PLATFORM_CONFIG[p as keyof typeof PLATFORM_CONFIG]
                            const PlatformIcon = platform.icon
                            return (
                              <PlatformIcon key={p} className="w-3 h-3" style={{ color: platform.color }} />
                            )
                          })}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-sm font-medium",
                          isOverdue ? "text-red-600" : "text-gray-600"
                        )}>
                          {daysSincePost === 0 ? 'Hoje' : `${daysSincePost}d atrás`}
                        </p>
                        {isOverdue && (
                          <span className="text-xs text-red-500 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Atrasado
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Post Modal */}
      <AnimatePresence>
        {showNewPostModal && (
          <NewPostModal
            clients={clients}
            selectedDate={selectedDate}
            onClose={() => setShowNewPostModal(false)}
            onSubmit={(post) => {
              setPosts([...posts, { ...post, id: Date.now().toString() }])
              setShowNewPostModal(false)
            }}
          />
        )}
      </AnimatePresence>

      {/* Post Detail Modal */}
      <AnimatePresence>
        {selectedPost && (
          <PostDetailModal
            post={selectedPost}
            onClose={() => setSelectedPost(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== NEW POST MODAL ====================
function NewPostModal({
  clients,
  selectedDate,
  onClose,
  onSubmit
}: {
  clients: Client[]
  selectedDate: Date
  onClose: () => void
  onSubmit: (post: Omit<ScheduledPost, 'id'>) => void
}) {
  const [formData, setFormData] = useState({
    clientId: '',
    platform: 'instagram' as ScheduledPost['platform'],
    type: 'image' as ScheduledPost['type'],
    caption: '',
    scheduledDate: selectedDate,
    scheduledTime: '18:00'
  })
  const [aiGenerating, setAiGenerating] = useState(false)

  const handleGenerateCaption = async () => {
    setAiGenerating(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setFormData(prev => ({
      ...prev,
      caption: '✨ Transforme sua rotina com nossas dicas exclusivas! 💡\n\nDescubra como pequenas mudanças podem fazer grandes diferenças no seu dia a dia.\n\n#dicas #produtividade #lifestyle'
    }))
    setAiGenerating(false)
  }

  const handleSubmit = () => {
    const client = clients.find(c => c.id === formData.clientId)
    if (!client) return

    onSubmit({
      clientId: formData.clientId,
      clientName: client.name,
      platform: formData.platform,
      type: formData.type,
      caption: formData.caption,
      scheduledDate: formData.scheduledDate,
      scheduledTime: formData.scheduledTime,
      status: 'scheduled'
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
            <h2 className="text-lg font-bold text-gray-800">Novo Post</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
            <select
              value={formData.clientId}
              onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="">Selecione um cliente...</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plataforma</label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value as any }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                {Object.entries(PLATFORM_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                {Object.entries(POST_TYPE_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input
                type="date"
                value={format(formData.scheduledDate, 'yyyy-MM-dd')}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: new Date(e.target.value) }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
              <input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Legenda</label>
              <button
                onClick={handleGenerateCaption}
                disabled={aiGenerating}
                className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700"
              >
                {aiGenerating ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                Gerar com IA
              </button>
            </div>
            <textarea
              value={formData.caption}
              onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
              placeholder="Escreva a legenda do post..."
              rows={4}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <div className="text-center">
              <Image className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Arraste uma imagem ou clique para fazer upload</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!formData.clientId || !formData.caption}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Agendar Post
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ==================== POST DETAIL MODAL ====================
function PostDetailModal({
  post,
  onClose
}: {
  post: ScheduledPost
  onClose: () => void
}) {
  const platform = PLATFORM_CONFIG[post.platform]
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
      >
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", platform.bgColor)}>
                <PlatformIcon className="w-5 h-5" style={{ color: platform.color }} />
              </div>
              <div>
                <h2 className="font-bold text-gray-800">{post.clientName}</h2>
                <p className="text-sm text-gray-500">{platform.label}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <span className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              post.status === 'published' ? "bg-green-100 text-green-700" :
              post.status === 'scheduled' ? "bg-blue-100 text-blue-700" :
              "bg-gray-100 text-gray-700"
            )}>
              {post.status === 'published' ? 'Publicado' :
               post.status === 'scheduled' ? 'Agendado' : 'Rascunho'}
            </span>
            <span className="text-sm text-gray-500">
              {format(post.scheduledDate, "dd/MM/yyyy", { locale: ptBR })} às {post.scheduledTime}
            </span>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl">
            <p className="text-gray-700 whitespace-pre-wrap">{post.caption}</p>
          </div>

          {post.engagement && (
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <Heart className="w-5 h-5 mx-auto text-red-500 mb-1" />
                <p className="text-lg font-bold text-gray-800">{post.engagement.likes}</p>
                <p className="text-xs text-gray-500">Curtidas</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <MessageCircle className="w-5 h-5 mx-auto text-blue-500 mb-1" />
                <p className="text-lg font-bold text-gray-800">{post.engagement.comments}</p>
                <p className="text-xs text-gray-500">Comentários</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <Share2 className="w-5 h-5 mx-auto text-green-500 mb-1" />
                <p className="text-lg font-bold text-gray-800">{post.engagement.shares}</p>
                <p className="text-xs text-gray-500">Compartilhamentos</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <Eye className="w-5 h-5 mx-auto text-purple-500 mb-1" />
                <p className="text-lg font-bold text-gray-800">{post.engagement.views}</p>
                <p className="text-xs text-gray-500">Visualizações</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50">
          <button onClick={onClose} className="w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900">
            Fechar
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}




