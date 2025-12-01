'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { format, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Search, Calendar, Filter, Layers, Clock, AlertTriangle, 
  TrendingUp, ArrowRight, Eye, BarChart2, ChevronDown, Building2,
  Users, DollarSign, Wallet, Receipt, Zap, X, ZoomIn, ZoomOut,
  Flame, Thermometer, Snowflake, History
} from 'lucide-react'
import { toast } from 'sonner'
import { getPhaseConfig, ALL_AREAS, KANBAN_PHASES } from '@/lib/kanban/phaseFields'
import KanbanInsights from '@/components/kanban/KanbanInsights'
import { cn } from '@/lib/utils'

// Tipos
interface KanbanCard {
  id: string
  title: string
  description?: string
  temperature: 'hot' | 'warm' | 'cold'
  clientId?: string
  clientName?: string
  company?: string
  dueDate?: Date
  createdAt: Date
  updatedAt: Date
  assignees: string[]
  tags: string[]
  attachments: number
  comments: number
  area?: string
}

interface KanbanColumn {
  id: string
  title: string
  color: string
  cards: KanbanCard[]
}

// Configuração de temperatura
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

export default function AdminKanbanPage() {
  const [selectedArea, setSelectedArea] = useState('Web Designer')
  const [columns, setColumns] = useState<KanbanColumn[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [showAreaSelector, setShowAreaSelector] = useState(false)
  const [showInsights, setShowInsights] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(0.85)
  const [filterEmployee, setFilterEmployee] = useState('')
  const [filterClient, setFilterClient] = useState('')
  const supabase = createClientComponentClient()

  // Carregar dados quando área mudar
  useEffect(() => {
    loadKanbanData()
  }, [selectedArea])

  const loadKanbanData = async () => {
    setLoading(true)
    try {
      // Carregar fases baseado na área
      const phases = getPhaseConfig(selectedArea)
      
      // Mock data - em produção, buscar do banco
      const mockCards: KanbanCard[] = [
        {
          id: '1',
          title: 'Landing Page - Lançamento',
          clientName: 'Tech Solutions',
          company: 'Tech Solutions',
          temperature: 'hot',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
          updatedAt: new Date(),
          assignees: ['João Silva'],
          tags: ['URGENTE'],
          attachments: 2,
          comments: 5,
          area: 'Web Designer'
        },
        {
          id: '2',
          title: 'Campanha Instagram',
          clientName: 'Fashion Store',
          company: 'Fashion Store',
          temperature: 'warm',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
          updatedAt: new Date(),
          assignees: ['Maria Santos'],
          tags: ['SOCIAL'],
          attachments: 3,
          comments: 8,
          area: 'Social Media'
        },
        {
          id: '3',
          title: 'Google Ads - Black Friday',
          clientName: 'E-commerce Plus',
          company: 'E-commerce Plus',
          temperature: 'hot',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
          updatedAt: new Date(),
          assignees: ['Pedro Costa'],
          tags: ['TRÁFEGO'],
          attachments: 1,
          comments: 12,
          area: 'Tráfego'
        },
        {
          id: '4',
          title: 'Vídeo Institucional',
          clientName: 'Startup XYZ',
          company: 'Startup XYZ',
          temperature: 'cold',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
          updatedAt: new Date(),
          assignees: ['Ana Oliveira'],
          tags: ['VÍDEO'],
          attachments: 5,
          comments: 3,
          area: 'Video Maker'
        }
      ]

      // Filtrar cards por área se não for "todas"
      const filteredCards = selectedArea === 'all' 
        ? mockCards 
        : mockCards.filter(c => c.area === selectedArea)

      // Distribuir cards nas colunas
      const newColumns: KanbanColumn[] = phases.map((phase, index) => ({
        id: phase.id,
        title: phase.title,
        color: phase.color,
        cards: index === 0 ? filteredCards.slice(0, 2) : 
               index === 1 ? filteredCards.slice(2, 3) :
               index === 2 ? filteredCards.slice(3) : []
      }))

      setColumns(newColumns)
    } catch (error) {
      console.error('Erro ao carregar kanban:', error)
      toast.error('Erro ao carregar dados do Kanban')
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const { source, destination } = result
    const newColumns = [...columns]

    const sourceColIndex = newColumns.findIndex(col => col.id === source.droppableId)
    const destColIndex = newColumns.findIndex(col => col.id === destination.droppableId)

    const [movedCard] = newColumns[sourceColIndex].cards.splice(source.index, 1)
    newColumns[destColIndex].cards.splice(destination.index, 0, movedCard)

    setColumns(newColumns)
    toast.success('Card movido com sucesso')
  }

  const filteredColumns = columns.map(col => ({
    ...col,
    cards: col.cards.filter(card => {
      const matchesSearch = card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           card.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesEmployee = !filterEmployee || card.assignees.some(a => a.toLowerCase().includes(filterEmployee.toLowerCase()))
      const matchesClient = !filterClient || card.clientName?.toLowerCase().includes(filterClient.toLowerCase())
      return matchesSearch && matchesEmployee && matchesClient
    })
  }))

  const totalCards = columns.reduce((sum, col) => sum + col.cards.length, 0)
  const columnWidth = Math.round(280 * zoomLevel)

  const selectedAreaInfo = ALL_AREAS.find(a => a.id === selectedArea) || ALL_AREAS[0]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-73px)] flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">Kanban Central</h1>
            
            {/* Area Selector */}
            <div className="relative">
              <button
                onClick={() => setShowAreaSelector(!showAreaSelector)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <span className="text-xl">{selectedAreaInfo.icon}</span>
                <span className="font-medium">{selectedAreaInfo.label}</span>
                <ChevronDown className={cn("w-4 h-4 transition-transform", showAreaSelector && "rotate-180")} />
              </button>

              <AnimatePresence>
                {showAreaSelector && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border z-50 overflow-hidden"
                  >
                    {ALL_AREAS.map((area) => (
                      <button
                        key={area.id}
                        onClick={() => {
                          setSelectedArea(area.id)
                          setShowAreaSelector(false)
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left",
                          selectedArea === area.id && "bg-blue-50"
                        )}
                      >
                        <span className="text-xl">{area.icon}</span>
                        <span className={cn(
                          "font-medium",
                          selectedArea === area.id ? "text-blue-700" : "text-gray-700"
                        )}>
                          {area.label}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {totalCards} cards
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

            {/* Filters */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Filtrar por colaborador..."
                value={filterEmployee}
                onChange={(e) => setFilterEmployee(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Filtrar por cliente..."
                value={filterClient}
                onChange={(e) => setFilterClient(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => {
                  const idx = ZOOM_LEVELS.findIndex(z => z.value === zoomLevel)
                  if (idx > 0) setZoomLevel(ZOOM_LEVELS[idx - 1].value)
                }}
                disabled={zoomLevel === ZOOM_LEVELS[0].value}
                className="p-1.5 hover:bg-white rounded transition-colors disabled:opacity-50"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-medium px-2">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={() => {
                  const idx = ZOOM_LEVELS.findIndex(z => z.value === zoomLevel)
                  if (idx < ZOOM_LEVELS.length - 1) setZoomLevel(ZOOM_LEVELS[idx + 1].value)
                }}
                disabled={zoomLevel === ZOOM_LEVELS[ZOOM_LEVELS.length - 1].value}
                className="p-1.5 hover:bg-white rounded transition-colors disabled:opacity-50"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Toggle Insights */}
            <button
              onClick={() => setShowInsights(!showInsights)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                showInsights ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"
              )}
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
            className="px-6 overflow-hidden"
          >
            <KanbanInsights columns={filteredColumns} area={selectedAreaInfo.label} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div 
            className="flex gap-4 p-6 h-full"
            style={{ 
              minWidth: `${columns.length * (columnWidth + 16)}px`,
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top left'
            }}
          >
            {filteredColumns.map((column) => (
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
                      style={{ maxHeight: 'calc(100vh - 350px)' }}
                    >
                      {column.cards.map((card, index) => (
                        <Draggable key={card.id} draggableId={card.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={cn(
                                "bg-white rounded-lg p-3 shadow-sm border border-gray-200 cursor-pointer transition-all hover:shadow-md",
                                snapshot.isDragging && "shadow-lg ring-2 ring-blue-500"
                              )}
                            >
                              {/* Temperature & Area Badge */}
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
                                {card.area && (
                                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                    {card.area}
                                  </span>
                                )}
                              </div>

                              {/* Title */}
                              <h4 className="font-medium text-gray-800 text-sm line-clamp-2">
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
                                  {differenceInDays(card.dueDate, new Date()) < 0 && (
                                    <AlertTriangle className="w-3 h-3 text-red-500" />
                                  )}
                                </div>
                              )}

                              {/* Footer */}
                              <div className="flex items-center justify-between mt-3 pt-2 border-t">
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                  {card.attachments > 0 && (
                                    <span>{card.attachments} anexos</span>
                                  )}
                                  {card.comments > 0 && (
                                    <span>{card.comments} comentários</span>
                                  )}
                                </div>
                                <div className="flex -space-x-1">
                                  {card.assignees.slice(0, 2).map((assignee, i) => (
                                    <div
                                      key={i}
                                      className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                                      title={assignee}
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
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Click outside to close area selector */}
      {showAreaSelector && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowAreaSelector(false)}
        />
      )}
    </div>
  )
}
