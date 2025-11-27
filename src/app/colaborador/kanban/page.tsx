'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import {
  Plus, Search, Filter, Calendar, List, LayoutGrid, Clock,
  User, Tag, AlertCircle, CheckCircle2, Circle, Archive,
  MoreVertical, Paperclip, MessageSquare, Users, TrendingUp,
  AlertTriangle, Sparkles, Timer, Flame, Zap, Brain
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CardModal } from '@/components/kanban/CardModal'
import { NewTaskForm } from '@/components/kanban/NewTaskForm'
import { getTemplateForRole } from '@/lib/kanban-templates'
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, differenceInDays, differenceInHours } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = {
  'pt-BR': ptBR
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales
})

interface KanbanCard {
  id: string
  title: string
  description?: string
  column: string
  priority: 'urgent' | 'high' | 'normal' | 'low'
  assignees: string[]
  tags: string[]
  dueDate?: Date
  attachments: number
  comments: number
  createdAt: Date
  columnEnteredAt?: Date // Para calcular aging
  clientName?: string
}

interface KanbanColumn {
  id: string
  title: string
  icon: React.ReactNode
  color: string
  cards: KanbanCard[]
  wipLimit?: number
}

interface BottleneckAlert {
  columnId: string
  columnTitle: string
  count: number
  avgDays: number
  severity: 'warning' | 'critical'
}

interface ValInsight {
  type: 'tip' | 'warning' | 'success'
  message: string
  action?: string
}

type ViewMode = 'kanban' | 'list' | 'timeline' | 'calendar'

export default function KanbanPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [columns, setColumns] = useState<KanbanColumn[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false)
  const [userArea, setUserArea] = useState('Designer')
  const [bottlenecks, setBottlenecks] = useState<BottleneckAlert[]>([])
  const [valInsights, setValInsights] = useState<ValInsight[]>([])
  const [showInsights, setShowInsights] = useState(true)

  useEffect(() => {
    loadUserAreaAndKanban()
  }, [])

  useEffect(() => {
    // Analisar gargalos sempre que as colunas mudarem
    analyzeBottlenecks()
    generateValInsights()
  }, [columns])

  const loadUserAreaAndKanban = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: employee } = await supabase
          .from('employees')
          .select(`
            *,
            employee_areas_of_expertise(area_name)
          `)
          .eq('user_id', user.id)
          .single()

        const area = employee?.employee_areas_of_expertise?.[0]?.area_name || 'Designer'
        setUserArea(area)
        
        // Inicializar colunas baseadas na área usando o sistema de templates
        const template = getTemplateForRole(area)
        const initialColumns = template.columns.map((col: any, index: number) => ({
          id: col.name.toLowerCase().replace(/ /g, '_'),
          title: col.name,
          color: col.color,
          wipLimit: index < 2 ? undefined : 5, // Limites WIP nas colunas do meio
          icon: <Circle className="w-4 h-4" />,
          cards: []
        }))
        
        setColumns(initialColumns)
        
        // Carregar tarefas mock para demonstração
        loadMockTasks(initialColumns, area)
      }
    } catch (error) {
      console.error('Erro ao carregar área do usuário:', error)
      loadKanbanData()
    }
  }

  const loadMockTasks = (cols: KanbanColumn[], area: string) => {
    // Tarefas de exemplo baseadas na área
    const mockTasks: Record<string, KanbanCard[]> = {
      'Web Designer': [
        {
          id: '1',
          title: 'Landing Page - Tech Solutions',
          description: 'Criar landing page para campanha de Black Friday',
          column: cols[0]?.id || 'briefing',
          priority: 'high',
          assignees: ['Você'],
          tags: ['Landing Page', 'Black Friday'],
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          attachments: 2,
          comments: 3,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          columnEnteredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          clientName: 'Tech Solutions'
        },
        {
          id: '2',
          title: 'Redesign Homepage - E-commerce Plus',
          description: 'Atualizar visual da homepage principal',
          column: cols[2]?.id || 'wireframe',
          priority: 'normal',
          assignees: ['Você'],
          tags: ['Redesign', 'Homepage'],
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          attachments: 5,
          comments: 8,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          columnEnteredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          clientName: 'E-commerce Plus'
        },
        {
          id: '3',
          title: 'Banner Institucional - Marketing Pro',
          description: 'Criar banner para site institucional',
          column: cols[4]?.id || 'revisao_interna',
          priority: 'urgent',
          assignees: ['Você'],
          tags: ['Banner', 'Urgente'],
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          attachments: 1,
          comments: 12,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          columnEnteredAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 dias na mesma coluna = gargalo
          clientName: 'Marketing Pro'
        }
      ],
      'Designer': [
        {
          id: '1',
          title: 'Posts Instagram - Cliente A',
          description: 'Criar 10 posts para feed',
          column: cols[1]?.id || 'em_criacao',
          priority: 'high',
          assignees: ['Você'],
          tags: ['Instagram', 'Feed'],
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          attachments: 0,
          comments: 2,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          columnEnteredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          clientName: 'Cliente A'
        }
      ]
    }

    const tasks = mockTasks[area] || mockTasks['Designer'] || []
    
    const updatedColumns = cols.map(col => ({
      ...col,
      cards: tasks.filter(t => t.column === col.id)
    }))

    setColumns(updatedColumns)
    setLoading(false)
  }

  const analyzeBottlenecks = () => {
    const alerts: BottleneckAlert[] = []
    
    columns.forEach(col => {
      if (col.cards.length === 0) return
      
      // Calcular média de dias na coluna
      const agingDays = col.cards.map(card => {
        if (!card.columnEnteredAt) return 0
        return differenceInDays(new Date(), new Date(card.columnEnteredAt))
      })
      
      const avgDays = agingDays.reduce((a, b) => a + b, 0) / agingDays.length
      
      // Alertas de gargalo
      if (col.cards.length >= 3 && avgDays >= 2) {
        alerts.push({
          columnId: col.id,
          columnTitle: col.title,
          count: col.cards.length,
          avgDays: Math.round(avgDays),
          severity: avgDays >= 4 ? 'critical' : 'warning'
        })
      }
      
      // Alerta de WIP limit
      if (col.wipLimit && col.cards.length >= col.wipLimit) {
        if (!alerts.find(a => a.columnId === col.id)) {
          alerts.push({
            columnId: col.id,
            columnTitle: col.title,
            count: col.cards.length,
            avgDays: Math.round(avgDays),
            severity: 'warning'
          })
        }
      }
    })
    
    setBottlenecks(alerts)
  }

  const generateValInsights = () => {
    const insights: ValInsight[] = []
    
    // Verificar tarefas urgentes
    const urgentTasks = columns.flatMap(c => c.cards).filter(card => card.priority === 'urgent')
    if (urgentTasks.length > 0) {
      insights.push({
        type: 'warning',
        message: `Você tem ${urgentTasks.length} tarefa(s) urgente(s). Priorize-as!`,
        action: 'Ver tarefas urgentes'
      })
    }
    
    // Verificar tarefas próximas do prazo
    const nearDeadline = columns.flatMap(c => c.cards).filter(card => {
      if (!card.dueDate) return false
      const daysUntil = differenceInDays(new Date(card.dueDate), new Date())
      return daysUntil <= 2 && daysUntil >= 0
    })
    if (nearDeadline.length > 0) {
      insights.push({
        type: 'warning',
        message: `${nearDeadline.length} tarefa(s) vencem nos próximos 2 dias!`
      })
    }
    
    // Dica de produtividade
    const totalTasks = columns.flatMap(c => c.cards).length
    const doneTasks = columns.find(c => c.id.includes('finalizado') || c.id.includes('done') || c.id.includes('pronto'))?.cards.length || 0
    if (totalTasks > 0 && doneTasks > 0) {
      const completionRate = Math.round((doneTasks / totalTasks) * 100)
      if (completionRate >= 50) {
        insights.push({
          type: 'success',
          message: `Ótimo trabalho! ${completionRate}% das tarefas concluídas! 🎉`
        })
      }
    }
    
    // Sugestão baseada em gargalos
    if (bottlenecks.length > 0) {
      const critical = bottlenecks.find(b => b.severity === 'critical')
      if (critical) {
        insights.push({
          type: 'tip',
          message: `Dica: "${critical.columnTitle}" está com ${critical.count} tarefas há ${critical.avgDays} dias. Considere revisar prioridades.`
        })
      }
    }
    
    setValInsights(insights)
  }

  const getAgingBadge = (card: KanbanCard) => {
    if (!card.columnEnteredAt) return null
    const days = differenceInDays(new Date(), new Date(card.columnEnteredAt))
    
    if (days >= 5) {
      return (
        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-bold">
          <Flame className="w-3 h-3" />
          {days}d
        </span>
      )
    }
    if (days >= 3) {
      return (
        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold">
          <Timer className="w-3 h-3" />
          {days}d
        </span>
      )
    }
    return null
  }

  const handleOpenCard = (card: KanbanCard) => {
    setSelectedCard(card)
    setIsModalOpen(true)
  }

  const handleSaveCard = (updatedCard: KanbanCard) => {
    setColumns(columns.map(col => ({
      ...col,
      cards: col.cards.map(card => 
        card.id === updatedCard.id ? updatedCard : card
      )
    })))
    setIsModalOpen(false)
  }

  const handleDeleteCard = (cardId: string) => {
    setColumns(columns.map(col => ({
      ...col,
      cards: col.cards.filter(card => card.id !== cardId)
    })))
    setIsModalOpen(false)
  }

  const handleNewTask = (taskData: any) => {
    const newCard: KanbanCard = {
      id: Date.now().toString(),
      title: taskData.title,
      description: taskData.description,
      column: columns[0].id,
      priority: taskData.priority,
      assignees: ['Você'],
      tags: [],
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
      attachments: 0,
      comments: 0,
      createdAt: new Date(),
      columnEnteredAt: new Date()
    }

    setColumns(columns.map((col, index) => 
      index === 0 
        ? { ...col, cards: [...col.cards, newCard] }
        : col
    ))
  }

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result

    if (!destination) return

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return
    }

    const sourceColumn = columns.find(col => col.id === source.droppableId)
    const destColumn = columns.find(col => col.id === destination.droppableId)

    if (!sourceColumn || !destColumn) return

    const sourceCards = Array.from(sourceColumn.cards)
    const destCards = source.droppableId === destination.droppableId 
      ? sourceCards 
      : Array.from(destColumn.cards)

    const [movedCard] = sourceCards.splice(source.index, 1)
    
    // Atualizar columnEnteredAt se mudou de coluna
    if (source.droppableId !== destination.droppableId) {
      movedCard.columnEnteredAt = new Date()
    }
    
    movedCard.column = destination.droppableId
    destCards.splice(destination.index, 0, movedCard)

    const newColumns = columns.map(col => {
      if (col.id === source.droppableId) {
        return { ...col, cards: sourceCards }
      }
      if (col.id === destination.droppableId) {
        return { ...col, cards: destCards }
      }
      return col
    })

    setColumns(newColumns)
  }

  const loadKanbanData = async () => {
    setLoading(false)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#ef4444'
      case 'high': return '#f59e0b'
      case 'normal': return '#4370d1'
      case 'low': return '#9ca3af'
      default: return '#9ca3af'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return '🔴 Urgente'
      case 'high': return '🟡 Alta'
      case 'normal': return '🟢 Normal'
      case 'low': return '⚪ Baixa'
      default: return priority
    }
  }

  const filteredColumns = columns.map(column => ({
    ...column,
    cards: column.cards.filter(card => {
      const matchesSearch = card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           card.description?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesPriority = selectedPriority === 'all' || card.priority === selectedPriority
      return matchesSearch && matchesPriority
    })
  }))

  if (loading) {
    return (
      <div className="h-[calc(100vh-73px)] flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#4370d1' }}></div>
          <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Carregando kanban...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-73px)] flex flex-col" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* Header */}
      <div 
        className="px-6 py-4"
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Kanban - {userArea}
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Gerencie suas tarefas de forma inteligente
            </p>
          </div>
          
          <button 
            onClick={() => setIsNewTaskOpen(true)}
            className="px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-all hover:scale-105 text-white shadow-lg"
            style={{ backgroundColor: '#4370d1' }}
          >
            <Plus className="w-4 h-4" />
            Nova Tarefa
          </button>
        </div>

        {/* Bottleneck Alerts */}
        <AnimatePresence>
          {bottlenecks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <div className="flex flex-wrap gap-2">
                {bottlenecks.map((alert, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                      alert.severity === 'critical' 
                        ? 'bg-red-100 text-red-700 border border-red-200' 
                        : 'bg-orange-100 text-orange-700 border border-orange-200'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>
                      <strong>{alert.columnTitle}</strong>: {alert.count} tarefas há ~{alert.avgDays} dias
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Val Insights */}
        <AnimatePresence>
          {showInsights && valInsights.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-4 rounded-xl"
              style={{ 
                background: 'linear-gradient(135deg, var(--primary-50) 0%, var(--purple-50) 100%)',
                border: '1px solid var(--primary-200)'
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg" style={{ backgroundColor: '#4370d1' }}>
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                      💡 Insights da Val
                    </h3>
                    <div className="space-y-1">
                      {valInsights.map((insight, idx) => (
                        <p key={idx} className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {insight.type === 'warning' && '⚠️ '}
                          {insight.type === 'success' && '✅ '}
                          {insight.type === 'tip' && '💡 '}
                          {insight.message}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setShowInsights(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filters and View Modes */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Buscar tarefas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-2 transition-all"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-4 py-2 rounded-xl border focus:outline-none focus:ring-2 transition-all"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-light)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="all">Todas Prioridades</option>
            <option value="urgent">🔴 Urgente</option>
            <option value="high">🟡 Alta</option>
            <option value="normal">🟢 Normal</option>
            <option value="low">⚪ Baixa</option>
          </select>

          {/* View Mode Buttons */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <button
              onClick={() => setViewMode('kanban')}
              className={cn('p-2 rounded-lg transition-all')}
              style={{
                backgroundColor: viewMode === 'kanban' ? '#4370d1' : 'transparent',
                color: viewMode === 'kanban' ? 'white' : 'var(--text-secondary)'
              }}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn('p-2 rounded-lg transition-all')}
              style={{
                backgroundColor: viewMode === 'list' ? '#4370d1' : 'transparent',
                color: viewMode === 'list' ? 'white' : 'var(--text-secondary)'
              }}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={cn('p-2 rounded-lg transition-all')}
              style={{
                backgroundColor: viewMode === 'calendar' ? '#4370d1' : 'transparent',
                color: viewMode === 'calendar' ? 'white' : 'var(--text-secondary)'
              }}
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      {viewMode === 'kanban' && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
            <div className="flex gap-4 min-w-max pb-4">
              {filteredColumns.map((column) => (
              <div 
                key={column.id}
                className="w-80 flex-shrink-0 flex flex-col rounded-2xl shadow-sm"
                style={{ 
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-light)'
                }}
              >
                {/* Column Header */}
                <div className="p-4" style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: column.color }}
                      />
                      <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {column.title}
                      </h3>
                      <span 
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ 
                          backgroundColor: 'var(--bg-secondary)', 
                          color: 'var(--text-secondary)' 
                        }}
                      >
                        {column.cards.length}
                      </span>
                    </div>
                    <button 
                      onClick={() => setIsNewTaskOpen(true)}
                      className="p-1 rounded hover:bg-gray-100 transition-colors"
                    >
                      <Plus className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
                    </button>
                  </div>
                  
                  {column.wipLimit && (
                    <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      WIP: {column.cards.length}/{column.wipLimit}
                      {column.cards.length >= column.wipLimit && (
                        <span className="text-red-500 ml-1">⚠️</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Cards */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex-1 overflow-y-auto p-3 space-y-3"
                      style={{
                        backgroundColor: snapshot.isDraggingOver ? 'var(--primary-50)' : 'transparent',
                        minHeight: '200px'
                      }}
                    >
                      {column.cards.map((card, index) => (
                        <Draggable key={card.id} draggableId={card.id} index={index}>
                          {(provided, snapshot) => (
                            <motion.div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => handleOpenCard(card)}
                              whileHover={{ scale: 1.02 }}
                              className="p-4 rounded-xl cursor-pointer transition-all"
                              style={{
                                ...provided.draggableProps.style,
                                backgroundColor: snapshot.isDragging ? 'var(--primary-50)' : 'var(--bg-secondary)',
                                border: `1px solid ${snapshot.isDragging ? '#4370d1' : 'var(--border-light)'}`,
                                boxShadow: snapshot.isDragging ? '0 10px 20px rgba(0,0,0,0.1)' : 'none'
                              }}
                            >
                              {/* Card Header */}
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium text-sm leading-tight" style={{ color: 'var(--text-primary)' }}>
                                  {card.title}
                                </h4>
                                {getAgingBadge(card)}
                              </div>

                              {/* Client Name */}
                              {card.clientName && (
                                <p className="text-xs mb-2" style={{ color: 'var(--text-tertiary)' }}>
                                  📋 {card.clientName}
                                </p>
                              )}

                              {/* Priority & Due Date */}
                              <div className="flex items-center justify-between mb-3">
                                <span 
                                  className="text-xs px-2 py-1 rounded-full font-medium"
                                  style={{ 
                                    backgroundColor: `${getPriorityColor(card.priority)}20`,
                                    color: getPriorityColor(card.priority)
                                  }}
                                >
                                  {getPriorityLabel(card.priority)}
                                </span>
                                {card.dueDate && (
                                  <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
                                    <Calendar className="w-3 h-3" />
                                    {format(new Date(card.dueDate), 'dd MMM', { locale: ptBR })}
                                  </span>
                                )}
                              </div>

                              {/* Tags */}
                              {card.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {card.tags.slice(0, 2).map((tag, idx) => (
                                    <span 
                                      key={idx}
                                      className="text-[10px] px-2 py-0.5 rounded-full"
                                      style={{ 
                                        backgroundColor: 'var(--primary-50)', 
                                        color: '#4370d1' 
                                      }}
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Footer Stats */}
                              <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border-light)' }}>
                                <div className="flex -space-x-2">
                                  {card.assignees.slice(0, 2).map((assignee, idx) => (
                                    <div 
                                      key={idx}
                                      className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-medium"
                                      style={{ 
                                        backgroundColor: '#4370d1', 
                                        borderColor: 'var(--bg-secondary)',
                                        color: 'white'
                                      }}
                                    >
                                      {assignee.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </div>
                                  ))}
                                </div>
                                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                                  {card.attachments > 0 && (
                                    <span className="flex items-center gap-1">
                                      <Paperclip className="w-3 h-3" />
                                      {card.attachments}
                                    </span>
                                  )}
                                  {card.comments > 0 && (
                                    <span className="flex items-center gap-1">
                                      <MessageSquare className="w-3 h-3" />
                                      {card.comments}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {column.cards.length === 0 && (
                        <div className="text-center py-8" style={{ color: 'var(--text-tertiary)' }}>
                          <p className="text-sm">Nenhuma tarefa</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </div>
      </DragDropContext>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}>
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Tarefa</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Prioridade</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Prazo</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Aging</th>
                </tr>
              </thead>
              <tbody>
                {filteredColumns.flatMap(col => 
                  col.cards.map(card => (
                    <tr 
                      key={card.id}
                      onClick={() => handleOpenCard(card)}
                      className="cursor-pointer hover:bg-gray-50 transition-all"
                      style={{ borderBottom: '1px solid var(--border-light)' }}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{card.title}</div>
                        {card.clientName && (
                          <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                            {card.clientName}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ 
                          backgroundColor: `${col.color}20`,
                          color: col.color
                        }}>
                          {col.title}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm">{getPriorityLabel(card.priority)}</span>
                      </td>
                      <td className="px-6 py-4">
                        {card.dueDate && (
                          <span className="text-sm flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                            <Clock className="w-4 h-4" />
                            {format(new Date(card.dueDate), 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getAgingBadge(card)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="rounded-2xl shadow-lg p-6" style={{ backgroundColor: 'var(--bg-primary)', height: 'calc(100vh - 280px)' }}>
            <BigCalendar
              localizer={localizer}
              events={filteredColumns.flatMap(col => 
                col.cards
                  .filter(card => card.dueDate)
                  .map(card => ({
                    title: `${card.title} (${col.title})`,
                    start: new Date(card.dueDate!),
                    end: new Date(card.dueDate!),
                    resource: {
                      card,
                      column: col,
                      priority: card.priority
                    }
                  }))
              )}
              startAccessor="start"
              endAccessor="end"
              culture="pt-BR"
              messages={{
                next: "Próximo",
                previous: "Anterior",
                today: "Hoje",
                month: "Mês",
                week: "Semana",
                day: "Dia",
                agenda: "Agenda",
                date: "Data",
                time: "Hora",
                event: "Evento",
                noEventsInRange: "Não há tarefas neste período."
              }}
              onSelectEvent={(event) => {
                handleOpenCard(event.resource.card)
              }}
              eventPropGetter={(event) => {
                const colors = {
                  urgent: { bg: '#fee2e2', border: '#ef4444' },
                  high: { bg: '#fef3c7', border: '#f59e0b' },
                  normal: { bg: '#dbeafe', border: '#3b82f6' },
                  low: { bg: '#d1fae5', border: '#10b981' }
                }
                const color = colors[event.resource.priority as keyof typeof colors] || colors.normal
                return {
                  style: {
                    backgroundColor: color.bg,
                    borderLeft: `4px solid ${color.border}`,
                    color: '#1f2937',
                    fontSize: '13px',
                    padding: '4px 8px',
                    borderRadius: '6px'
                  }
                }
              }}
              style={{ height: '100%' }}
            />
          </div>
        </div>
      )}

      {/* Card Modal */}
      <CardModal
        card={selectedCard}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCard}
        onDelete={handleDeleteCard}
      />

      {/* New Task Form */}
      <NewTaskForm
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
        onSave={handleNewTask}
        userArea={userArea}
      />
    </div>
  )
}
