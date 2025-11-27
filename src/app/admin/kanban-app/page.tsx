'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CardModal } from '@/components/kanban/CardModal'
import { NewTaskForm } from '@/components/kanban/NewTaskForm'
import { Plus, Search, Calendar, Filter, Layers, Clock, AlertTriangle, TrendingUp, ArrowRight, Eye, BarChart2 } from 'lucide-react'
import { toast } from 'sonner'
import { columnsByArea } from '@/lib/kanban/columnsByArea'
import ProfitabilityView from '@/components/dashboards/widgets/ProfitabilityView'

// Definir tipos
type Card = {
  id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  due_date?: string
  column_id: string
  assignee_id?: string
  labels?: string[]
  assignee?: {
    full_name: string
    avatar_url?: string
  }
  area?: string
}

type Column = {
  id: string
  title: string
  cards: Card[]
  color?: string
}

// Áreas disponíveis
const AREAS = [
  { id: 'design', label: 'Design', color: 'bg-purple-100 text-purple-700' },
  { id: 'web_design', label: 'Web Design', color: 'bg-blue-100 text-blue-700' },
  { id: 'marketing', label: 'Marketing', color: 'bg-pink-100 text-pink-700' },
  { id: 'rh', label: 'RH', color: 'bg-green-100 text-green-700' },
  { id: 'financeiro', label: 'Financeiro', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'audiovisual', label: 'Audiovisual', color: 'bg-red-100 text-red-700' },
  { id: 'social_media', label: 'Social Media', color: 'bg-orange-100 text-orange-700' },
  { id: 'trafego', label: 'Tráfego', color: 'bg-indigo-100 text-indigo-700' },
  { id: 'comercial', label: 'Comercial', color: 'bg-emerald-100 text-emerald-700' },
]

export default function SuperAdminKanban() {
  const [selectedArea, setSelectedArea] = useState('design')
  const [columns, setColumns] = useState<Column[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCardModalOpen, setIsCardModalOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewTaskForm, setShowNewTaskForm] = useState(false)
  
  // Métricas simuladas para o "God Mode"
  const [metrics, setMetrics] = useState({
    totalTasks: 128,
    delayed: 12,
    completedToday: 8,
    productivity: 87
  })

  const supabase = createClientComponentClient()

  // Carregar estrutura e dados
  useEffect(() => {
    loadKanbanBoard()
  }, [selectedArea])

  const loadKanbanBoard = async () => {
    setIsLoading(true)
    try {
      // 1. Carregar colunas da área selecionada (columnsByArea.ts)
      const areaConfig = columnsByArea[selectedArea] || columnsByArea['Default']
      
      // 2. Carregar cards do Supabase
      const { data: tasks, error } = await supabase
        .from('kanban_tasks')
        .select(`
          *,
          assignee:employees(full_name)
        `)
        .eq('area', selectedArea) // Filtrar por área
        .order('position')

      if (error) throw error

      // 3. Organizar cards nas colunas
      const newColumns = areaConfig.map(col => ({
        id: col.id,
        title: col.title,
        color: col.color,
        cards: tasks?.filter(t => t.column_id === col.id) || []
      }))

      setColumns(newColumns)
      
      // Atualizar métricas simuladas (em produção viriam do banco)
      setMetrics({
        totalTasks: tasks?.length || 0,
        delayed: tasks?.filter(t => t.due_date && new Date(t.due_date) < new Date()).length || 0,
        completedToday: tasks?.filter(t => t.column_id === 'done' && new Date(t.updated_at).getDate() === new Date().getDate()).length || 0,
        productivity: Math.floor(Math.random() * 20) + 80 // Simulado entre 80-100%
      })

    } catch (error) {
      console.error('Erro ao carregar Kanban:', error)
      toast.error('Erro ao carregar o quadro.')
    } finally {
      setIsLoading(false)
    }
  }

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    // Atualização Otimista
    const sourceColIndex = columns.findIndex(col => col.id === source.droppableId)
    const destColIndex = columns.findIndex(col => col.id === destination.droppableId)
    
    const newColumns = [...columns]
    const sourceCards = [...newColumns[sourceColIndex].cards]
    const destCards = source.droppableId === destination.droppableId 
      ? sourceCards 
      : [...newColumns[destColIndex].cards]

    const [movedCard] = sourceCards.splice(source.index, 1)
    movedCard.column_id = destination.droppableId
    destCards.splice(destination.index, 0, movedCard)

    newColumns[sourceColIndex].cards = sourceCards
    if (source.droppableId !== destination.droppableId) {
      newColumns[destColIndex].cards = destCards
    }

    setColumns(newColumns)

    // Persistir no Banco
    try {
      await supabase
        .from('kanban_tasks')
        .update({ 
          column_id: destination.droppableId,
          position: destination.index,
          updated_at: new Date().toISOString()
        })
        .eq('id', draggableId)
      
      // Registrar métrica de movimentação (via Trigger SQL já criado)
      toast.success('Tarefa movida com sucesso')
    } catch (error) {
      console.error('Erro ao mover card:', error)
      toast.error('Erro ao salvar movimentação')
      loadKanbanBoard() // Reverter em caso de erro
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 space-y-6">
      
      {/* Header e Métricas */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Eye className="w-8 h-8 text-indigo-600" />
              Visão Global (Super Admin)
            </h1>
            <p className="text-gray-500">Monitore e gerencie todas as áreas em tempo real.</p>
          </div>

          {/* Seletor de Área */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600">Visualizando Área:</span>
            <select 
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-64 p-2.5 shadow-sm"
            >
              {AREAS.map(area => (
                <option key={area.id} value={area.id}>{area.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Widget de Lucratividade (God Mode) */}
        <div className="mb-4">
          <details className="group bg-white p-4 rounded-xl border border-indigo-100 shadow-sm open:ring-2 open:ring-indigo-500 open:ring-opacity-50 transition-all">
            <summary className="flex justify-between items-center cursor-pointer list-none">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <BarChart2 size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Painel de Lucratividade e Custos (God Mode)</h3>
                  <p className="text-xs text-gray-500">Clique para expandir a visão financeira detalhada dos projetos.</p>
                </div>
              </div>
              <div className="transform group-open:rotate-180 transition-transform text-gray-400">
                ▼
              </div>
            </summary>
            <div className="mt-6 border-t border-gray-100 pt-6">
              <ProfitabilityView />
            </div>
          </details>
        </div>

        {/* Cards de Métricas da Área */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total de Tarefas</p>
              <h3 className="text-2xl font-bold text-gray-900">{metrics.totalTasks}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Layers size={20} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Atrasadas</p>
              <h3 className="text-2xl font-bold text-red-600">{metrics.delayed}</h3>
            </div>
            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
              <AlertTriangle size={20} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Concluídas Hoje</p>
              <h3 className="text-2xl font-bold text-green-600">{metrics.completedToday}</h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-lg">
              <Calendar size={20} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Produtividade</p>
              <h3 className="text-2xl font-bold text-purple-600">{metrics.productivity}%</h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e Ações */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text"
            placeholder="Filtrar tarefas por nome, responsável ou tag..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filtros Avançados
          </button>
          <button 
            onClick={() => setShowNewTaskForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nova Tarefa Global
          </button>
        </div>
      </div>

      {/* Kanban Board Horizontal */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto pb-8 min-h-[calc(100vh-300px)] items-start">
          {columns.map(column => (
            <div key={column.id} className="flex-shrink-0 w-80 flex flex-col bg-gray-100/50 rounded-xl border border-gray-200/60 max-h-full">
              {/* Header da Coluna */}
              <div className={`p-4 border-b border-gray-200 rounded-t-xl bg-white/50 backdrop-blur-sm sticky top-0 z-10 flex justify-between items-center`}>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${column.color || 'bg-gray-400'}`}></div>
                  <h3 className="font-semibold text-gray-700">{column.title}</h3>
                </div>
                <span className="text-xs font-medium bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                  {column.cards.length}
                </span>
              </div>

              {/* Área de Droppable */}
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`flex-1 p-3 space-y-3 overflow-y-auto min-h-[150px] transition-colors ${
                      snapshot.isDraggingOver ? 'bg-indigo-50/50' : ''
                    }`}
                  >
                    {column.cards
                      .filter(card => 
                        card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        card.assignee?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((card, index) => (
                      <Draggable key={card.id} draggableId={card.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => {
                              setSelectedCard(card)
                              setIsCardModalOpen(true)
                            }}
                            className={`
                              bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group relative
                              ${snapshot.isDragging ? 'rotate-2 shadow-xl ring-2 ring-indigo-500 ring-opacity-50 z-50' : ''}
                            `}
                          >
                            {/* Prioridade */}
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex gap-1 flex-wrap">
                                {card.priority === 'high' && (
                                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold uppercase rounded tracking-wider">Urgente</span>
                                )}
                                {card.priority === 'medium' && (
                                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase rounded tracking-wider">Média</span>
                                )}
                              </div>
                              {/* Menu de Contexto (visible on hover) */}
                              <button className="text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                •••
                              </button>
                            </div>

                            <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">{card.title}</h4>
                            
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                              {/* Responsável */}
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                                  {card.assignee?.full_name?.charAt(0) || '?'}
                                </div>
                                <span className="text-xs text-gray-500 truncate max-w-[80px]">
                                  {card.assignee?.full_name?.split(' ')[0] || 'Sem resp.'}
                                </span>
                              </div>

                              {/* Data */}
                              {card.due_date && (
                                <div className={`flex items-center gap-1 text-xs ${
                                  new Date(card.due_date) < new Date() ? 'text-red-500 font-semibold' : 'text-gray-400'
                                }`}>
                                  <Clock size={12} />
                                  {format(new Date(card.due_date), 'dd/MM', { locale: ptBR })}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Modal de Detalhes do Card */}
      {selectedCard && (
        <CardModal
          card={{
            id: selectedCard.id,
            title: selectedCard.title,
            description: selectedCard.description,
            column: selectedCard.column_id,
            priority: selectedCard.priority === 'high' ? 'high' : selectedCard.priority === 'medium' ? 'normal' : 'low',
            // Mapeamento de campos incompatíveis
            assignees: selectedCard.assignee ? [selectedCard.assignee.full_name] : [],
            tags: selectedCard.labels || [],
            dueDate: selectedCard.due_date ? new Date(selectedCard.due_date) : undefined,
            attachments: 0, // TODO: Buscar do banco
            comments: 0,    // TODO: Buscar do banco
            createdAt: new Date(), // TODO: Buscar do banco
            area: selectedCard.area
          }}
          isOpen={isCardModalOpen}
          onClose={() => {
            setIsCardModalOpen(false)
            setSelectedCard(null)
          }}
          onSave={(updatedCard) => {
            // Converter de volta para salvar no banco se necessário, ou apenas recarregar
            loadKanbanBoard()
            setIsCardModalOpen(false)
          }}
          onDelete={async (cardId) => {
             await supabase.from('kanban_tasks').delete().eq('id', cardId)
             loadKanbanBoard()
             setIsCardModalOpen(false)
          }}
          isSuperAdmin={true} // Habilita delete
        />
      )}

      {/* Modal de Nova Tarefa */}
      {showNewTaskForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Nova Tarefa para {AREAS.find(a => a.id === selectedArea)?.label}</h2>
              <button onClick={() => setShowNewTaskForm(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <NewTaskForm 
              isOpen={true} // Sempre aberto dentro do modal
              onClose={() => setShowNewTaskForm(false)}
              onSave={(taskData) => {
                setShowNewTaskForm(false)
                loadKanbanBoard()
                toast.success('Tarefa criada!')
              }}
              userArea={selectedArea} // Passar a área selecionada como userArea
            />
          </div>
        </div>
      )}
    </div>
  )
}
