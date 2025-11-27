'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import {
  Plus, Search, Filter, Calendar, List, LayoutGrid, Clock,
  User, Tag, AlertCircle, CheckCircle2, Circle, Archive,
  MoreVertical, Paperclip, MessageSquare, Users, TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CardModal } from '@/components/kanban/CardModal'
import { NewTaskForm } from '@/components/kanban/NewTaskForm'
import { getTemplateForRole } from '@/lib/kanban-templates'
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
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
}

interface KanbanColumn {
  id: string
  title: string
  icon: React.ReactNode
  color: string
  cards: KanbanCard[]
  wipLimit?: number
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
  const [userArea, setUserArea] = useState('Designer') // Será carregado do perfil

  useEffect(() => {
    loadUserAreaAndKanban()
  }, [])

  const loadUserAreaAndKanban = async () => {
    try {
      // Carregar área do usuário
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('employees')
          .select('area_of_expertise')
          .eq('user_id', user.id)
          .single()

        if (profile?.area_of_expertise) {
          setUserArea(profile.area_of_expertise)
          
          // Inicializar colunas baseadas na área usando o novo sistema de templates
          const template = getTemplateForRole(profile.area_of_expertise)
          setColumns(template.columns.map((col: any) => ({
            id: col.name.toLowerCase().replace(/ /g, '_'), // Normaliza ID
            title: col.name,
            color: col.color,
            wipLimit: 5, // Default limit
            icon: <Circle className="w-4 h-4" />, // Default icon, pode melhorar depois
            cards: []
          })))
        }
      }
      
      loadKanbanData()
    } catch (error) {
      console.error('Erro ao carregar área do usuário:', error)
      loadKanbanData()
    }
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
      column: columns[0].id, // Default para a primeira coluna
      priority: taskData.priority,
      assignees: [],
      tags: [],
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
      attachments: 0,
      comments: 0,
      createdAt: new Date()
    }

    setColumns(columns.map((col, index) => 
      index === 0 
        ? { ...col, cards: [...col.cards, newCard] }
        : col
    ))
  }

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result

    // Dropped outside the list
    if (!destination) return

    // Dropped in same position
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

    // Se o card foi movido para "Concluído", enviar notificação
    if (destination.droppableId === 'concluido' || destination.droppableId === 'done' || destination.droppableId === 'entregue' || destination.droppableId === 'finalizado') {
      try {
        // Notificar responsáveis/assignees
        if (movedCard?.assignees && movedCard.assignees.length > 0) {
          for (const assignee of movedCard.assignees) {
            await fetch('/api/notifications/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: assignee,
                type: 'task_completed',
                title: '✅ Tarefa Concluída!',
                message: `A tarefa "${movedCard.title}" foi marcada como concluída.`,
                metadata: {
                  cardId: movedCard.id,
                  cardTitle: movedCard.title,
                  oldColumn: source.droppableId,
                  newColumn: destination.droppableId
                }
              })
            })
          }
        }
        
        console.log('✅ Notificações de conclusão enviadas!')
      } catch (error) {
        console.error('Erro ao enviar notificações:', error)
      }
    }

    // Atualizar no banco de dados
    try {
      await supabase
        .from('kanban_tasks')
        .update({ status: destination.droppableId })
        .eq('id', draggableId)
      
      console.log('✅ Card movido com sucesso no banco')
    } catch (error) {
      console.error('❌ Erro ao mover card no banco:', error)
    }
  }

  const loadKanbanData = async () => {
    try {
      // Buscar área do usuário
      const { data: { user } } = await supabase.auth.getUser()
      let area = 'Geral'
      
      if (user) {
        const { data: employee } = await supabase
          .from('employees')
          .select(`
            *,
            employee_areas_of_expertise(area_name)
          `)
          .eq('user_id', user.id)
          .single()

        area = employee?.employee_areas_of_expertise?.[0]?.area_name || 'Geral'
        setUserArea(area)
      }

      // Se colunas já foram inicializadas pelo template, adicionar dados mock
      // Em produção, buscaria do banco aqui
      setColumns(prevColumns => {
          if (prevColumns.length === 0) return prevColumns;
          
          const newCols = [...prevColumns];
          // Adicionar card de exemplo na primeira coluna se estiver vazia
          if (newCols[0].cards.length === 0) {
              newCols[0].cards = [
                {
                  id: '1',
                  title: 'Nova tarefa de exemplo',
                  description: 'Esta é uma tarefa de exemplo criada automaticamente.',
                  column: newCols[0].id,
                  priority: 'normal',
                  assignees: [],
                  tags: [area],
                  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                  attachments: 0,
                  comments: 0,
                  createdAt: new Date()
                }
              ];
          }
          return newCols;
      });

    } catch (error) {
      console.error('Erro ao carregar kanban:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'var(--error-500)'
      case 'high': return 'var(--warning-500)'
      case 'normal': return 'var(--primary-500)'
      case 'low': return 'var(--text-tertiary)'
      default: return 'var(--text-tertiary)'
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: 'var(--primary-500)' }}></div>
          <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Carregando kanban...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-73px)] flex flex-col" style={{ 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      {/* Header */}
      <div 
        className="border-b px-6 py-4"
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border-light)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Kanban - {userArea}
          </h1>
          
          <button 
            onClick={() => setIsNewTaskOpen(true)}
            className="px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-all hover:scale-105 text-white"
            style={{ backgroundColor: 'var(--primary-500)' }}
          >
            <Plus className="w-4 h-4" />
            Nova Tarefa
          </button>
        </div>

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
          <div className="flex gap-2 p-1 rounded-xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <button
              onClick={() => setViewMode('kanban')}
              className={cn(
                'p-2 rounded-lg transition-all',
                viewMode === 'kanban' ? 'text-white' : ''
              )}
              style={{
                backgroundColor: viewMode === 'kanban' ? 'var(--primary-500)' : 'transparent',
                color: viewMode === 'kanban' ? 'white' : 'var(--text-secondary)'
              }}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-lg transition-all',
                viewMode === 'list' ? 'text-white' : ''
              )}
              style={{
                backgroundColor: viewMode === 'list' ? 'var(--primary-500)' : 'transparent',
                color: viewMode === 'list' ? 'white' : 'var(--text-secondary)'
              }}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={cn(
                'p-2 rounded-lg transition-all',
                viewMode === 'calendar' ? 'text-white' : ''
              )}
              style={{
                backgroundColor: viewMode === 'calendar' ? 'var(--primary-500)' : 'transparent',
                color: viewMode === 'calendar' ? 'white' : 'var(--text-secondary)'
              }}
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board - LAYOUT HORIZONTAL COM SCROLL */}
      {viewMode === 'kanban' && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
            <div className="flex gap-4 min-w-max pb-4">
              {filteredColumns.map((column) => (
              <div 
                key={column.id}
                className="w-80 flex-shrink-0 flex flex-col rounded-3xl border backdrop-blur-xl shadow-sm"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  borderColor: 'rgba(200, 200, 200, 0.3)'
                }}
              >
                {/* Column Header - GLASSMORPHISM */}
                <div className="p-5 border-b" style={{ borderColor: 'rgba(200, 200, 200, 0.3)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: column.color }}
                      />
                      <h3 className="font-semibold text-gray-900">
                        {column.title}
                      </h3>
                      <span 
                        className="px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm border"
                        style={{ 
                          backgroundColor: 'rgba(100, 100, 100, 0.1)', 
                          borderColor: 'rgba(100, 100, 100, 0.2)',
                          color: 'var(--text-secondary)' 
                        }}
                      >
                        {column.cards.length}
                      </span>
                    </div>
                    <button className="p-1 rounded-full hover:bg-white/30 transition-colors">
                      <Plus className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>
                  
                  {column.wipLimit && (
                    <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      WIP Limit: {column.cards.length}/{column.wipLimit}
                      {column.cards.length >= column.wipLimit && (
                        <span style={{ color: 'var(--error-500)' }}> ⚠️ Limite atingido</span>
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
                      className="flex-1 overflow-y-auto p-4 space-y-3"
                      style={{
                        backgroundColor: snapshot.isDraggingOver ? 'var(--primary-50)' : 'transparent'
                      }}
                    >
                      {column.cards.map((card, index) => (
                        <Draggable key={card.id} draggableId={card.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => handleOpenCard(card)}
                              className={`
                                p-5 rounded-xl border backdrop-blur-sm cursor-move hover:shadow-lg transition-all duration-300
                                ${snapshot.isDragging ? 'shadow-xl ring-2 ring-indigo-500 ring-opacity-50 z-50' : ''}
                              `}
                              style={{
                                ...provided.draggableProps.style,
                                backgroundColor: snapshot.isDragging ? 'rgba(67, 112, 209, 0.2)' : 'rgba(255, 255, 255, 0.6)',
                                borderColor: snapshot.isDragging ? 'rgba(67, 112, 209, 0.5)' : 'rgba(200, 200, 200, 0.3)',
                              }}
                            >
                      {/* Title com Grip Icon */}
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold leading-tight text-gray-900 flex-1">
                          {card.title}
                        </h4>
                        <div className="w-5 h-5 text-gray-400 cursor-move ml-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                          </svg>
                        </div>
                      </div>

                      {/* Priority Badge e Data */}
                      <div className="flex items-center justify-between mb-3">
                        <span 
                          className="text-xs px-3 py-1 rounded-full font-medium backdrop-blur-sm border"
                          style={{ 
                            backgroundColor: `${getPriorityColor(card.priority)}20`,
                            borderColor: `${getPriorityColor(card.priority)}30`,
                            color: getPriorityColor(card.priority)
                          }}
                        >
                          {getPriorityLabel(card.priority)}
                        </span>
                        {card.dueDate && (
                          <span className="text-xs flex items-center gap-1 text-gray-600">
                            <Calendar className="w-3 h-3" />
                            <span className="font-medium">
                              {new Date(card.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                            </span>
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      {card.description && (
                        <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                          {card.description}
                        </p>
                      )}

                      {/* Tags */}
                      {card.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {card.tags.map((tag, idx) => (
                            <span 
                              key={idx}
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{ 
                                backgroundColor: 'var(--primary-50)', 
                                color: 'var(--primary-700)' 
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        {/* Assignees */}
                        <div className="flex -space-x-2">
                          {card.assignees.slice(0, 3).map((assignee, idx) => (
                            <div 
                              key={idx}
                              className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium"
                              style={{ 
                                backgroundColor: 'var(--primary-100)', 
                                borderColor: 'var(--bg-primary)',
                                color: 'var(--primary-700)'
                              }}
                              title={assignee}
                            >
                              {assignee.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                          ))}
                          {card.assignees.length > 3 && (
                            <div 
                              className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium"
                              style={{ 
                                backgroundColor: 'var(--bg-tertiary)', 
                                borderColor: 'var(--bg-primary)',
                                color: 'var(--text-secondary)'
                              }}
                            >
                              +{card.assignees.length - 3}
                            </div>
                          )}
                        </div>

                        {/* Stats */}
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
                            </div>
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
          <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Tarefa</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Prioridade</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Prazo</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Assignees</th>
                </tr>
              </thead>
              <tbody>
                {filteredColumns.flatMap(col => 
                  col.cards.map(card => (
                    <tr 
                      key={card.id}
                      onClick={() => handleOpenCard(card)}
                      className="border-b cursor-pointer hover:bg-opacity-50 transition-all"
                      style={{ borderColor: 'var(--border-light)' }}
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{card.title}</div>
                        {card.description && (
                          <div className="text-sm mt-1 line-clamp-1" style={{ color: 'var(--text-secondary)' }}>
                            {card.description}
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
                            {new Date(card.dueDate).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex -space-x-2">
                          {card.assignees.slice(0, 3).map((assignee, idx) => (
                            <div 
                              key={idx}
                              className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-medium"
                              style={{ 
                                backgroundColor: 'var(--primary-100)', 
                                borderColor: 'var(--bg-primary)',
                                color: 'var(--primary-700)'
                              }}
                              title={assignee}
                            >
                              {assignee.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Calendar View - FUNCIONAL COM REACT-BIG-CALENDAR */}
      {viewMode === 'calendar' && (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-2xl shadow-lg p-6" style={{ height: 'calc(100vh - 200px)' }}>
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
