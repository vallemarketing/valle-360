'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import {
  Plus, Search, Filter, X, Clock, User, Building2, Calendar,
  MoreHorizontal, Paperclip, MessageSquare, CheckCircle2, AlertCircle,
  Flame, Thermometer, Snowflake, Edit, Trash2, ZoomIn, ZoomOut, Maximize2,
  History, Zap, ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { PhaseTransitionModal } from '@/components/kanban/PhaseTransitionModal'
import { CardHistory, HistoryEntry } from '@/components/kanban/CardHistory'
import { KanbanInsights } from '@/components/kanban/KanbanInsights'
import { getPhasesForArea, PhaseConfig, getPhaseFields } from '@/lib/kanban/phaseFields'

// ==================== TIPOS ====================
interface KanbanCard {
  id: string
  title: string
  description?: string
  temperature: 'hot' | 'warm' | 'cold'
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  industry?: string
  company?: string
  clientId?: string
  clientName?: string
  dueDate?: Date
  createdAt: Date
  updatedAt: Date
  assignees: string[]
  tags: string[]
  attachments: number
  comments: number
  phaseData: Record<string, any>
  history: HistoryEntry[]
}

interface KanbanColumn {
  id: string
  title: string
  color: string
  cards: KanbanCard[]
  description?: string
}

interface Client {
  id: string
  name: string
  company?: string
}

// ==================== CONSTANTES ====================
const TEMPERATURE_CONFIG = {
  hot: { label: 'Quente', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50', icon: Flame },
  warm: { label: 'Morno', color: 'bg-orange-400', textColor: 'text-orange-700', bgLight: 'bg-orange-50', icon: Thermometer },
  cold: { label: 'Frio', color: 'bg-blue-400', textColor: 'text-blue-700', bgLight: 'bg-blue-50', icon: Snowflake }
}

const ZOOM_LEVELS = [
  { value: 0.6, label: '60%' },
  { value: 0.75, label: '75%' },
  { value: 0.85, label: '85%' },
  { value: 1, label: '100%' }
]

// ==================== COMPONENTE PRINCIPAL ====================
export default function KanbanPage() {
  const [columns, setColumns] = useState<KanbanColumn[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null)
  const [isCardModalOpen, setIsCardModalOpen] = useState(false)
  const [isNewCardModalOpen, setIsNewCardModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userArea, setUserArea] = useState('Web Designer')
  const [userName, setUserName] = useState('')
  const [zoomLevel, setZoomLevel] = useState(0.85)
  const [showInsights, setShowInsights] = useState(true)
  const [clients, setClients] = useState<Client[]>([])
  const [employees, setEmployees] = useState<Array<{ id: string; name: string }>>([])
  
  // Modal de transição de fase
  const [transitionModal, setTransitionModal] = useState<{
    isOpen: boolean
    card: KanbanCard | null
    fromPhase: PhaseConfig | null
    toPhase: PhaseConfig | null
    fromColumnId: string
    toColumnId: string
    sourceIndex: number
    destIndex: number
  }>({
    isOpen: false,
    card: null,
    fromPhase: null,
    toPhase: null,
    fromColumnId: '',
    toColumnId: '',
    sourceIndex: 0,
    destIndex: 0
  })

  // Fases baseadas na área
  const phases = getPhasesForArea(userArea)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    // Atualizar colunas quando a área mudar
    if (userArea) {
      const newPhases = getPhasesForArea(userArea)
      setColumns(prevColumns => {
        return newPhases.map(phase => {
          const existingCol = prevColumns.find(c => c.id === phase.id)
          return {
            id: phase.id,
            title: phase.title,
            color: phase.color,
            description: phase.description,
            cards: existingCol?.cards || []
          }
        })
      })
    }
  }, [userArea])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: employee } = await supabase
          .from('employees')
          .select('*')
          .eq('user_id', user.id)
          .single()

        const area = employee?.area_of_expertise || 'Web Designer'
        setUserArea(area)
        setUserName(employee?.full_name || 'Colaborador')

        // Carregar clientes do setor
        const { data: clientsData } = await supabase
          .from('clients')
          .select('id, name, company_name')
          .eq('status', 'active')
        
        if (clientsData) {
          setClients(clientsData.map(c => ({
            id: c.id,
            name: c.name,
            company: c.company_name
          })))
        }

        // Carregar colaboradores
        const { data: employeesData } = await supabase
          .from('employees')
          .select('id, full_name')
        
        if (employeesData) {
          setEmployees(employeesData.map(e => ({
            id: e.id,
            name: e.full_name
          })))
        }
      }

      // Inicializar colunas com dados mock
      loadMockData()
    } catch (error) {
      console.error('Erro:', error)
      loadMockData()
    } finally {
      setLoading(false)
    }
  }

  const loadMockData = () => {
    const mockCards: KanbanCard[] = [
      {
        id: '1',
        title: 'Landing Page - Lançamento Produto',
        clientId: '1',
        clientName: 'Tech Solutions',
        company: 'Tech Solutions',
        temperature: 'hot',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        assignees: ['Você'],
        tags: ['URGENTE'],
        attachments: 2,
        comments: 5,
        description: 'Criar landing page para lançamento do novo produto',
        phaseData: {},
        history: [
          { id: '1', type: 'created', user: 'Sistema', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }
        ]
      },
      {
        id: '2',
        title: 'Redesign Site Institucional',
        clientId: '2',
        clientName: 'E-commerce Plus',
        company: 'E-commerce Plus',
        temperature: 'warm',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        assignees: ['Você'],
        tags: ['SITE'],
        attachments: 1,
        comments: 3,
        description: 'Redesign completo do site institucional',
        phaseData: {},
        history: [
          { id: '1', type: 'created', user: 'Sistema', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
        ]
      },
      {
        id: '3',
        title: 'Blog Corporativo',
        clientId: '3',
        clientName: 'Startup XYZ',
        company: 'Startup XYZ',
        temperature: 'cold',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        assignees: ['Você'],
        tags: ['BLOG'],
        attachments: 0,
        comments: 1,
        description: 'Implementar seção de blog no site',
        phaseData: {},
        history: [
          { id: '1', type: 'created', user: 'Sistema', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        ]
      }
    ]

    const initialPhases = getPhasesForArea(userArea)
    const newColumns: KanbanColumn[] = initialPhases.map((phase, index) => ({
      id: phase.id,
      title: phase.title,
      color: phase.color,
      description: phase.description,
      cards: index === 0 ? [mockCards[0], mockCards[1]] : 
             index === 1 ? [mockCards[2]] : []
    }))

    setColumns(newColumns)
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const { source, destination } = result
    
    // Se moveu para a mesma posição, não fazer nada
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    const sourceColIndex = columns.findIndex(col => col.id === source.droppableId)
    const destColIndex = columns.findIndex(col => col.id === destination.droppableId)
    const card = columns[sourceColIndex].cards[source.index]

    // Se moveu para outra coluna, abrir modal de transição
    if (source.droppableId !== destination.droppableId) {
      const fromPhase = phases.find(p => p.id === source.droppableId)
      const toPhase = phases.find(p => p.id === destination.droppableId)

      if (fromPhase && toPhase) {
        setTransitionModal({
          isOpen: true,
          card,
          fromPhase,
          toPhase,
          fromColumnId: source.droppableId,
          toColumnId: destination.droppableId,
          sourceIndex: source.index,
          destIndex: destination.index
        })
        return
      }
    }

    // Mover dentro da mesma coluna
    const newColumns = [...columns]
    const [movedCard] = newColumns[sourceColIndex].cards.splice(source.index, 1)
    newColumns[destColIndex].cards.splice(destination.index, 0, movedCard)
    setColumns(newColumns)
  }

  const handleTransitionConfirm = (data: Record<string, any>) => {
    if (!transitionModal.card) return

    const newColumns = [...columns]
    const sourceColIndex = newColumns.findIndex(col => col.id === transitionModal.fromColumnId)
    const destColIndex = newColumns.findIndex(col => col.id === transitionModal.toColumnId)

    // Remover card da coluna origem
    const [movedCard] = newColumns[sourceColIndex].cards.splice(transitionModal.sourceIndex, 1)

    // Atualizar dados do card
    movedCard.phaseData = {
      ...movedCard.phaseData,
      [transitionModal.toColumnId]: data
    }
    movedCard.updatedAt = new Date()

    // Adicionar ao histórico
    movedCard.history = [
      ...movedCard.history,
      {
        id: Date.now().toString(),
        type: 'moved' as const,
        fromPhase: transitionModal.fromColumnId,
        toPhase: transitionModal.toColumnId,
        user: userName,
        timestamp: new Date(),
        data
      }
    ]

    // Adicionar na coluna destino
    newColumns[destColIndex].cards.splice(transitionModal.destIndex, 0, movedCard)

    setColumns(newColumns)
    setTransitionModal({
      isOpen: false,
      card: null,
      fromPhase: null,
      toPhase: null,
      fromColumnId: '',
      toColumnId: '',
      sourceIndex: 0,
      destIndex: 0
    })
  }

  const handleOpenCard = (card: KanbanCard) => {
    setSelectedCard(card)
    setIsCardModalOpen(true)
  }

  const handleCreateCard = (cardData: Partial<KanbanCard>) => {
    const client = clients.find(c => c.id === cardData.clientId)
    
    const newCard: KanbanCard = {
      id: Date.now().toString(),
      title: cardData.title || 'Nova Demanda',
      description: cardData.description,
      temperature: cardData.temperature || 'warm',
      clientId: cardData.clientId,
      clientName: client?.name,
      company: client?.company || client?.name,
      dueDate: cardData.dueDate,
      createdAt: new Date(),
      updatedAt: new Date(),
      assignees: [userName],
      tags: cardData.tags || [],
      attachments: 0,
      comments: 0,
      phaseData: {},
      history: [
        {
          id: '1',
          type: 'created',
          user: userName,
          timestamp: new Date()
        }
      ]
    }

    const newColumns = columns.map(col => {
      if (col.id === 'demandas') {
        return { ...col, cards: [...col.cards, newCard] }
      }
      return col
    })

    setColumns(newColumns)
    setIsNewCardModalOpen(false)
  }

  const filteredColumns = columns.map(col => ({
    ...col,
    cards: col.cards.filter(card =>
      card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.company?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }))

  const handleZoomIn = () => {
    const currentIndex = ZOOM_LEVELS.findIndex(z => z.value === zoomLevel)
    if (currentIndex < ZOOM_LEVELS.length - 1) {
      setZoomLevel(ZOOM_LEVELS[currentIndex + 1].value)
    }
  }

  const handleZoomOut = () => {
    const currentIndex = ZOOM_LEVELS.findIndex(z => z.value === zoomLevel)
    if (currentIndex > 0) {
      setZoomLevel(ZOOM_LEVELS[currentIndex - 1].value)
    }
  }

  // Phase colors e names para o histórico
  const phaseColors = phases.reduce((acc, p) => ({ ...acc, [p.id]: p.color }), {} as Record<string, string>)
  const phaseNames = phases.reduce((acc, p) => ({ ...acc, [p.id]: p.title }), {} as Record<string, string>)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    )
  }

  const columnWidth = Math.round(280 * zoomLevel)
  const cardPadding = zoomLevel < 0.8 ? 'p-2' : 'p-3'
  const fontSize = zoomLevel < 0.8 ? 'text-xs' : 'text-sm'

  return (
    <div className="h-[calc(100vh-73px)] flex flex-col" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-800">Kanban - {userArea}</h1>
            <span className="text-sm text-gray-500">
              {columns.reduce((sum, col) => sum + col.cards.length, 0)} cards
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={handleZoomOut}
                disabled={zoomLevel === ZOOM_LEVELS[0].value}
                className="p-1.5 hover:bg-white rounded transition-colors disabled:opacity-50"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-medium px-2 min-w-[40px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={zoomLevel === ZOOM_LEVELS[ZOOM_LEVELS.length - 1].value}
                className="p-1.5 hover:bg-white rounded transition-colors disabled:opacity-50"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Toggle Insights */}
            <button
              onClick={() => setShowInsights(!showInsights)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showInsights ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Zap className="w-4 h-4" />
              Insights
            </button>
          </div>
        </div>
      </div>

      {/* Insights Panel */}
      <AnimatePresence>
        {showInsights && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 py-3 bg-white border-b overflow-hidden"
          >
            <KanbanInsights columns={filteredColumns} area={userArea} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div 
            className="flex gap-4 p-4 h-full"
            style={{ 
              minWidth: `${columns.length * (columnWidth + 16)}px`,
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top left'
            }}
          >
            {filteredColumns.map((column, colIndex) => (
              <div
                key={column.id}
                className="flex flex-col bg-gray-100 rounded-xl"
                style={{ width: columnWidth, minWidth: columnWidth }}
              >
                {/* Column Header */}
                <div 
                  className="p-3 rounded-t-xl"
                  style={{ backgroundColor: `${column.color}15` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: column.color }}
                      />
                      <h3 className="font-semibold text-gray-800">{column.title}</h3>
                      <span className="text-xs bg-white px-2 py-0.5 rounded-full text-gray-600">
                        {column.cards.length}
                      </span>
                    </div>
                  </div>
                  {column.description && (
                    <p className="text-xs text-gray-500 mt-1">{column.description}</p>
                  )}
                </div>

                {/* Cards Container */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "flex-1 p-2 space-y-2 overflow-y-auto",
                        snapshot.isDraggingOver && "bg-blue-50"
                      )}
                      style={{ maxHeight: 'calc(100vh - 300px)' }}
                    >
                      {column.cards.map((card, index) => (
                        <Draggable key={card.id} draggableId={card.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => handleOpenCard(card)}
                              className={cn(
                                `bg-white rounded-lg ${cardPadding} shadow-sm border border-gray-200 cursor-pointer transition-all hover:shadow-md`,
                                snapshot.isDragging && "shadow-lg ring-2 ring-blue-500"
                              )}
                            >
                              {/* Temperature Badge */}
                              <div className="flex items-center justify-between mb-2">
                                <div className={cn(
                                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                                  TEMPERATURE_CONFIG[card.temperature].bgLight,
                                  TEMPERATURE_CONFIG[card.temperature].textColor
                                )}>
                                  {(() => {
                                    const TempIcon = TEMPERATURE_CONFIG[card.temperature].icon
                                    return <TempIcon className="w-3 h-3" />
                                  })()}
                                  {TEMPERATURE_CONFIG[card.temperature].label}
                                </div>
                                {card.dueDate && differenceInDays(card.dueDate, new Date()) <= 2 && (
                                  <AlertCircle className="w-4 h-4 text-red-500" />
                                )}
                              </div>

                              {/* Title */}
                              <h4 className={`font-medium text-gray-800 ${fontSize} line-clamp-2`}>
                                {card.title}
                              </h4>

                              {/* Client */}
                              {card.clientName && (
                                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                  <Building2 className="w-3 h-3" />
                                  <span className="truncate">{card.clientName}</span>
                                </div>
                              )}

                              {/* Due Date */}
                              {card.dueDate && (
                                <div className={cn(
                                  "flex items-center gap-1 mt-1 text-xs",
                                  differenceInDays(card.dueDate, new Date()) < 0 ? "text-red-600" :
                                  differenceInDays(card.dueDate, new Date()) <= 2 ? "text-orange-600" :
                                  "text-gray-500"
                                )}>
                                  <Calendar className="w-3 h-3" />
                                  {format(card.dueDate, "dd/MM", { locale: ptBR })}
                                </div>
                              )}

                              {/* Footer */}
                              <div className="flex items-center justify-between mt-3 pt-2 border-t">
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                  {card.attachments > 0 && (
                                    <span className="flex items-center gap-0.5">
                                      <Paperclip className="w-3 h-3" />
                                      {card.attachments}
                                    </span>
                                  )}
                                  {card.comments > 0 && (
                                    <span className="flex items-center gap-0.5">
                                      <MessageSquare className="w-3 h-3" />
                                      {card.comments}
                                    </span>
                                  )}
                                  {card.history.length > 1 && (
                                    <span className="flex items-center gap-0.5">
                                      <History className="w-3 h-3" />
                                      {card.history.length}
                                    </span>
                                  )}
                                </div>
                                <div className="flex -space-x-1">
                                  {card.assignees.slice(0, 2).map((assignee, i) => (
                                    <div
                                      key={i}
                                      className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                                    >
                                      {assignee[0]}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {/* Add Card Button - Only on first column (Demandas) */}
                      {colIndex === 0 && (
                        <button
                          onClick={() => setIsNewCardModalOpen(true)}
                          className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span className="text-sm">Criar nova demanda</span>
                        </button>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Phase Transition Modal */}
      {transitionModal.fromPhase && transitionModal.toPhase && (
        <PhaseTransitionModal
          isOpen={transitionModal.isOpen}
          onClose={() => setTransitionModal({
            isOpen: false,
            card: null,
            fromPhase: null,
            toPhase: null,
            fromColumnId: '',
            toColumnId: '',
            sourceIndex: 0,
            destIndex: 0
          })}
          onConfirm={handleTransitionConfirm}
          fromPhase={transitionModal.fromPhase}
          toPhase={transitionModal.toPhase}
          cardTitle={transitionModal.card?.title || ''}
          existingData={transitionModal.card?.phaseData[transitionModal.toColumnId] || {}}
          clients={clients}
          employees={employees}
        />
      )}

      {/* New Card Modal */}
      <AnimatePresence>
        {isNewCardModalOpen && (
          <NewCardModal
            isOpen={isNewCardModalOpen}
            onClose={() => setIsNewCardModalOpen(false)}
            onSubmit={handleCreateCard}
            clients={clients}
            area={userArea}
          />
        )}
      </AnimatePresence>

      {/* Card Detail Modal */}
      <AnimatePresence>
        {isCardModalOpen && selectedCard && (
          <CardDetailModal
            isOpen={isCardModalOpen}
            onClose={() => {
              setIsCardModalOpen(false)
              setSelectedCard(null)
            }}
            card={selectedCard}
            phaseColors={phaseColors}
            phaseNames={phaseNames}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== NEW CARD MODAL ====================
function NewCardModal({
  isOpen,
  onClose,
  onSubmit,
  clients,
  area
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Partial<KanbanCard>) => void
  clients: Client[]
  area: string
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    clientId: '',
    temperature: 'warm' as 'hot' | 'warm' | 'cold',
    dueDate: '',
    tags: [] as string[]
  })

  const handleSubmit = () => {
    if (!formData.title || !formData.clientId) {
      alert('Preencha o título e selecione um cliente')
      return
    }
    onSubmit({
      ...formData,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined
    })
    setFormData({
      title: '',
      description: '',
      clientId: '',
      temperature: 'warm',
      dueDate: '',
      tags: []
    })
  }

  if (!isOpen) return null

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
            <h2 className="text-lg font-bold text-gray-800">Nova Demanda</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Criação de Landing Page"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.clientId}
              onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione um cliente...</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} {client.company && `(${client.company})`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva os detalhes da demanda..."
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
              <select
                value={formData.temperature}
                onChange={(e) => setFormData(prev => ({ ...prev, temperature: e.target.value as any }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cold">🔵 Baixa</option>
                <option value="warm">🟠 Média</option>
                <option value="hot">🔴 Alta/Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Entrega</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Criar Demanda
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ==================== CARD DETAIL MODAL ====================
function CardDetailModal({
  isOpen,
  onClose,
  card,
  phaseColors,
  phaseNames
}: {
  isOpen: boolean
  onClose: () => void
  card: KanbanCard
  phaseColors: Record<string, string>
  phaseNames: Record<string, string>
}) {
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details')

  if (!isOpen) return null

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
            <div>
              <h2 className="text-lg font-bold text-gray-800">{card.title}</h2>
              {card.clientName && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                  <Building2 className="w-4 h-4" />
                  {card.clientName}
                </p>
              )}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={() => setActiveTab('details')}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                activeTab === 'details' ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              Detalhes
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2",
                activeTab === 'history' ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <History className="w-4 h-4" />
              Histórico ({card.history.length})
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'details' ? (
            <div className="space-y-4">
              {/* Temperature & Due Date */}
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
                  TEMPERATURE_CONFIG[card.temperature].bgLight,
                  TEMPERATURE_CONFIG[card.temperature].textColor
                )}>
                  {(() => {
                    const TempIcon = TEMPERATURE_CONFIG[card.temperature].icon
                    return <TempIcon className="w-4 h-4" />
                  })()}
                  {TEMPERATURE_CONFIG[card.temperature].label}
                </div>
                {card.dueDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    Entrega: {format(card.dueDate, "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                )}
              </div>

              {/* Description */}
              {card.description && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Descrição</h4>
                  <p className="text-gray-600">{card.description}</p>
                </div>
              )}

              {/* Phase Data */}
              {Object.keys(card.phaseData).length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Dados por Fase</h4>
                  <div className="space-y-3">
                    {Object.entries(card.phaseData).map(([phaseId, data]) => (
                      <div key={phaseId} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: phaseColors[phaseId] }}
                          />
                          <span className="font-medium text-sm">{phaseNames[phaseId]}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(data as Record<string, any>)
                            .filter(([key]) => !key.startsWith('_'))
                            .map(([key, value]) => (
                              <div key={key}>
                                <span className="text-gray-500">{key}:</span>{' '}
                                <span className="text-gray-800">
                                  {Array.isArray(value) ? value.join(', ') : String(value)}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assignees */}
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Responsáveis</h4>
                <div className="flex gap-2">
                  {card.assignees.map((assignee, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full"
                    >
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                        {assignee[0]}
                      </div>
                      <span className="text-sm text-blue-700">{assignee}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timestamps */}
              <div className="text-xs text-gray-400 pt-4 border-t">
                <p>Criado em: {format(card.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                <p>Atualizado em: {format(card.updatedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
              </div>
            </div>
          ) : (
            <CardHistory 
              history={card.history} 
              phaseColors={phaseColors}
              phaseNames={phaseNames}
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
