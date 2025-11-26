'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { motion } from 'framer-motion'
import {
  Plus,
  Search,
  Filter,
  Calendar,
  List,
  LayoutGrid,
  Clock,
  User,
  Tag,
  AlertCircle,
  CheckCircle2,
  Circle,
  MoreVertical
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { NewTaskForm } from '@/components/kanban/NewTaskForm'
import { CardModal } from '@/components/kanban/CardModal'
import { availableAreas } from '@/lib/kanban/columnsByArea'

interface KanbanCard {
  id: string
  title: string
  description: string
  priority: 'baixa' | 'normal' | 'alta' | 'urgente'
  dueDate: string
  assignees: string[]
  tags: string[]
  comments: number
  attachments: number
  column: string
  area: string
}

interface KanbanColumn {
  id: string
  title: string
  color: string
  cards: KanbanCard[]
}

export default function AdminKanbanPage() {
  const [loading, setLoading] = useState(true)
  const [columns, setColumns] = useState<KanbanColumn[]>([
    { id: 'todo', title: 'A Fazer', color: '#F59E0B', cards: [] },
    { id: 'in_progress', title: 'Em Progresso', color: '#3B82F6', cards: [] },
    { id: 'review', title: 'Revisão', color: '#8B5CF6', cards: [] },
    { id: 'done', title: 'Concluído', color: '#10B981', cards: [] }
  ])
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedArea, setSelectedArea] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null)
  const [showCardModal, setShowCardModal] = useState(false)
  const [userArea, setUserArea] = useState('Admin')

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      // Carregar tarefas do admin
      const { data: tasks, error } = await supabase
        .from('kanban_tasks')
        .select('*')
        .eq('created_by_role', 'super_admin')

      if (error) throw error

      // Distribuir tasks nas colunas
      const updatedColumns = columns.map(col => ({
        ...col,
        cards: tasks?.filter((task: any) => task.column === col.id).map((task: any) => ({
          id: task.id,
          title: task.title,
          description: task.description || '',
          priority: task.priority || 'normal',
          dueDate: task.due_date || '',
          assignees: task.assignees || [],
          tags: task.tags || [],
          comments: 0,
          attachments: 0,
          column: task.column,
          area: task.area || ''
        })) || []
      }))

      setColumns(updatedColumns)
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result

    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const sourceColumn = columns.find(col => col.id === source.droppableId)
    const destColumn = columns.find(col => col.id === destination.droppableId)

    if (!sourceColumn || !destColumn) return

    const newColumns = [...columns]
    const sourceCards = [...sourceColumn.cards]
    const destCards = source.droppableId === destination.droppableId ? sourceCards : [...destColumn.cards]

    const [movedCard] = sourceCards.splice(source.index, 1)
    movedCard.column = destination.droppableId
    destCards.splice(destination.index, 0, movedCard)

    const sourceIndex = newColumns.findIndex(col => col.id === source.droppableId)
    const destIndex = newColumns.findIndex(col => col.id === destination.droppableId)

    newColumns[sourceIndex] = { ...sourceColumn, cards: sourceCards }
    if (source.droppableId !== destination.droppableId) {
      newColumns[destIndex] = { ...destColumn, cards: destCards }
    }

    setColumns(newColumns)

    // Atualizar no banco
    try {
      await supabase
        .from('kanban_tasks')
        .update({ column: movedCard.column })
        .eq('id', movedCard.id)
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error)
    }
  }

  const handleNewTask = async (taskData: any) => {
    try {
      const { data, error } = await supabase
        .from('kanban_tasks')
        .insert({
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          due_date: taskData.dueDate,
          column: taskData.column || 'todo',
          area: taskData.area,
          assignees: taskData.assignees,
          tags: taskData.tags,
          client: taskData.client,
          reference_links: taskData.referenceLinks,
          drive_link: taskData.driveLink,
          estimated_hours: taskData.estimatedHours,
          created_by_role: 'super_admin'
        })
        .select()

      if (error) throw error

      loadTasks()
      setShowNewTaskForm(false)
    } catch (error) {
      console.error('Erro ao criar tarefa:', error)
      alert('Erro ao criar tarefa')
    }
  }

  const handleOpenCard = (card: KanbanCard) => {
    setSelectedCard(card)
    setShowCardModal(true)
  }

  const handleSaveCard = async (updatedCard: KanbanCard) => {
    try {
      await supabase
        .from('kanban_tasks')
        .update({
          title: updatedCard.title,
          description: updatedCard.description,
          priority: updatedCard.priority,
          due_date: updatedCard.dueDate,
          assignees: updatedCard.assignees,
          tags: updatedCard.tags
        })
        .eq('id', updatedCard.id)

      loadTasks()
      setShowCardModal(false)
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error)
    }
  }

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta tarefa?')) return

    try {
      await supabase
        .from('kanban_tasks')
        .delete()
        .eq('id', cardId)

      loadTasks()
      setShowCardModal(false)
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error)
    }
  }

  const filteredColumns = columns.map(column => ({
    ...column,
    cards: column.cards.filter(card => {
      const matchesSearch = card.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesArea = selectedArea === 'all' || card.area === selectedArea
      return matchesSearch && matchesArea
    })
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* Header */}
      <div className="p-6 border-b" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Meu Kanban - Super Admin
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Gerencie tarefas de todas as áreas
            </p>
          </div>
          
          <button
            onClick={() => setShowNewTaskForm(true)}
            className="px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 transition-all hover:scale-105"
            style={{ backgroundColor: 'var(--primary-600)' }}
          >
            <Plus className="w-4 h-4" />
            Nova Tarefa
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* Busca */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Buscar tarefas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          {/* Filtro por Área */}
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-light)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="all">Todas as Áreas</option>
            {availableAreas.map((area) => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>

          {/* View Mode Toggle */}
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
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      {viewMode === 'kanban' && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
            <div className="flex gap-4 min-w-max pb-4">
              {filteredColumns.map((column) => (
                <Droppable droppableId={column.id} key={column.id}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="w-80 flex-shrink-0 flex flex-col rounded-3xl border backdrop-blur-xl shadow-sm"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        borderColor: 'rgba(200, 200, 200, 0.3)'
                      }}
                    >
                      {/* Column Header */}
                      <div className="p-5 border-b" style={{ borderColor: 'rgba(200, 200, 200, 0.3)' }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: column.color }} />
                            <h3 className="font-semibold text-gray-900">{column.title}</h3>
                            <span
                              className="px-2 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: 'rgba(100, 100, 100, 0.1)',
                                color: 'var(--text-secondary)'
                              }}
                            >
                              {column.cards.length}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Cards */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {column.cards.map((card, index) => (
                          <Draggable key={card.id} draggableId={card.id} index={index}>
                            {(provided) => (
                              <motion.div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={() => handleOpenCard(card)}
                                className="p-4 rounded-xl border shadow-sm cursor-pointer hover:shadow-md transition-all backdrop-blur-sm"
                                style={{
                                  backgroundColor: 'rgba(255, 255, 255, 0.6)',
                                  borderColor: 'rgba(200, 200, 200, 0.3)'
                                }}
                              >
                                <h4 className="font-medium text-gray-900 mb-2">{card.title}</h4>
                                {card.description && (
                                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{card.description}</p>
                                )}
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className={cn(
                                      'px-2 py-1 rounded text-xs font-medium',
                                      card.priority === 'urgente' ? 'bg-red-100 text-red-700' :
                                      card.priority === 'alta' ? 'bg-orange-100 text-orange-700' :
                                      card.priority === 'normal' ? 'bg-blue-100 text-blue-700' :
                                      'bg-gray-100 text-gray-700'
                                    )}>
                                      {card.priority}
                                    </span>
                                    {card.area && (
                                      <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700">
                                        {card.area}
                                      </span>
                                    )}
                                  </div>
                                  {card.dueDate && (
                                    <span className="text-xs text-gray-600 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {new Date(card.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                    </span>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
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
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Área</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Prioridade</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Prazo</th>
                </tr>
              </thead>
              <tbody>
                {filteredColumns.flatMap(col => col.cards).map((card) => (
                  <tr
                    key={card.id}
                    onClick={() => handleOpenCard(card)}
                    className="border-t cursor-pointer hover:bg-opacity-50 transition-all"
                    style={{ borderColor: 'var(--border-light)' }}
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{card.title}</p>
                      {card.description && (
                        <p className="text-sm line-clamp-1" style={{ color: 'var(--text-secondary)' }}>{card.description}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-700">
                        {card.area}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">
                        {filteredColumns.find(col => col.cards.includes(card))?.title}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'px-2 py-1 rounded text-xs font-medium',
                        card.priority === 'urgente' ? 'bg-red-100 text-red-700' :
                        card.priority === 'alta' ? 'bg-orange-100 text-orange-700' :
                        card.priority === 'normal' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      )}>
                        {card.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {card.dueDate ? new Date(card.dueDate).toLocaleDateString('pt-BR') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Task Form com seleção de área */}
      {showNewTaskForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-5xl w-full p-6">
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-2">Selecione a Área da Tarefa</h3>
              <select
                value={userArea}
                onChange={(e) => setUserArea(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
              >
                {availableAreas.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
            <NewTaskForm
              isOpen={true}
              onClose={() => setShowNewTaskForm(false)}
              onSave={handleNewTask}
              userArea={userArea}
            />
          </div>
        </div>
      )}

      {/* Card Modal */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          isOpen={showCardModal}
          onClose={() => setShowCardModal(false)}
          onSave={handleSaveCard}
          onDelete={handleDeleteCard}
        />
      )}
    </div>
  )
}


