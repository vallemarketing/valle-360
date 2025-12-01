'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, Search, Calendar, Filter, Layers, Clock, AlertTriangle, 
  TrendingUp, ArrowRight, Eye, BarChart2, ChevronDown, Building2,
  Users, DollarSign, Wallet, Receipt, Zap, X
} from 'lucide-react'
import { toast } from 'sonner'
import { getPhasesForArea, getFinanceiroPhases, PhaseConfig } from '@/lib/kanban/phaseFields'
import { KanbanInsights } from '@/components/kanban/KanbanInsights'

// Tipos
type Card = {
  id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high'
  due_date?: string
  column_id: string
  assignee_id?: string
  labels?: string[]
  client_name?: string
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
  { id: 'all', label: 'Todas as Áreas', icon: Layers, color: 'bg-gray-100 text-gray-700' },
  { id: 'web_designer', label: 'Web Designer', icon: Layers, color: 'bg-blue-100 text-blue-700' },
  { id: 'designer', label: 'Designer', icon: Layers, color: 'bg-purple-100 text-purple-700' },
  { id: 'social_media', label: 'Social Media', icon: Layers, color: 'bg-pink-100 text-pink-700' },
  { id: 'trafego', label: 'Tráfego', icon: TrendingUp, color: 'bg-orange-100 text-orange-700' },
  { id: 'video_maker', label: 'Video Maker', icon: Layers, color: 'bg-red-100 text-red-700' },
  { id: 'head_marketing', label: 'Head Marketing', icon: Users, color: 'bg-indigo-100 text-indigo-700' },
  { id: 'comercial', label: 'Comercial', icon: Building2, color: 'bg-emerald-100 text-emerald-700' },
  { id: 'rh', label: 'RH', icon: Users, color: 'bg-green-100 text-green-700' },
  { id: 'financeiro_pagar', label: 'Contas a Pagar', icon: Wallet, color: 'bg-red-100 text-red-700' },
  { id: 'financeiro_receber', label: 'Contas a Receber', icon: Receipt, color: 'bg-green-100 text-green-700' },
]

export default function AdminKanbanPage() {
  const supabase = createClientComponentClient()
  const [selectedArea, setSelectedArea] = useState('all')
  const [columns, setColumns] = useState<Column[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAreaSelector, setShowAreaSelector] = useState(false)
  const [showInsights, setShowInsights] = useState(true)
  const [selectedCard, setSelectedCard] = useState<Card | null>(null)

  useEffect(() => {
    loadKanbanData()
  }, [selectedArea])

  const loadKanbanData = async () => {
    setLoading(true)
    try {
      // Determinar fases baseado na área selecionada
      let phases: PhaseConfig[]
      
      if (selectedArea === 'financeiro_pagar') {
        phases = getFinanceiroPhases('pagar')
      } else if (selectedArea === 'financeiro_receber') {
        phases = getFinanceiroPhases('receber')
      } else if (selectedArea === 'all') {
        phases = getPhasesForArea('Web Designer') // Fases padrão
      } else {
        const areaMap: Record<string, string> = {
          'web_designer': 'Web Designer',
          'designer': 'Designer',
          'social_media': 'Social Media',
          'trafego': 'Tráfego',
          'video_maker': 'Video Maker',
          'head_marketing': 'Head Marketing',
          'comercial': 'Comercial',
          'rh': 'RH'
        }
        phases = getPhasesForArea(areaMap[selectedArea] || 'Web Designer')
      }

      // Criar colunas baseadas nas fases
      const newColumns: Column[] = phases.map(phase => ({
        id: phase.id,
        title: phase.title,
        color: phase.color,
        cards: []
      }))

      // Carregar cards do banco (mock por enquanto)
      const mockCards = generateMockCards(selectedArea)
      
      // Distribuir cards nas colunas
      mockCards.forEach(card => {
        const col = newColumns.find(c => c.id === card.column_id)
        if (col) {
          col.cards.push(card)
        }
      })

      setColumns(newColumns)
    } catch (error) {
      console.error('Erro ao carregar kanban:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const generateMockCards = (area: string): Card[] => {
    if (area === 'financeiro_pagar') {
      return [
        { id: '1', title: 'Fornecedor ABC - Materiais', description: 'Compra de materiais', priority: 'high', due_date: '2025-01-05', column_id: 'pendente', client_name: 'Fornecedor ABC' },
        { id: '2', title: 'Aluguel Escritório', description: 'Pagamento mensal', priority: 'high', due_date: '2025-01-10', column_id: 'agendado', client_name: 'Imobiliária XYZ' },
        { id: '3', title: 'Serviços de TI', description: 'Manutenção mensal', priority: 'medium', due_date: '2025-01-15', column_id: 'pendente', client_name: 'TechSupport' },
      ]
    }
    
    if (area === 'financeiro_receber') {
      return [
        { id: '1', title: 'Tech Solutions - Mensalidade', description: 'Mensalidade Janeiro', priority: 'high', due_date: '2025-01-05', column_id: 'a_faturar', client_name: 'Tech Solutions' },
        { id: '2', title: 'E-commerce Plus - Projeto', description: 'Landing Page', priority: 'medium', due_date: '2025-01-10', column_id: 'faturado', client_name: 'E-commerce Plus' },
        { id: '3', title: 'Startup XYZ - Consultoria', description: 'Consultoria Marketing', priority: 'low', due_date: '2025-01-20', column_id: 'recebido', client_name: 'Startup XYZ' },
      ]
    }

    // Cards padrão para outras áreas
    return [
      { id: '1', title: 'Landing Page - Lançamento', description: 'Criar landing page', priority: 'high', due_date: '2025-01-05', column_id: 'demandas', client_name: 'Tech Solutions', area },
      { id: '2', title: 'Redesign Site Institucional', description: 'Redesign completo', priority: 'medium', due_date: '2025-01-10', column_id: 'em_progresso', client_name: 'E-commerce Plus', area },
      { id: '3', title: 'Blog Corporativo', description: 'Implementar blog', priority: 'low', due_date: '2025-01-20', column_id: 'revisao', client_name: 'Startup XYZ', area },
      { id: '4', title: 'E-commerce Completo', description: 'Desenvolvimento loja', priority: 'high', due_date: '2025-01-08', column_id: 'aprovacao', client_name: 'Fashion Store', area },
    ]
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const { source, destination } = result
    const newColumns = [...columns]

    const sourceColIndex = newColumns.findIndex(col => col.id === source.droppableId)
    const destColIndex = newColumns.findIndex(col => col.id === destination.droppableId)

    const [movedCard] = newColumns[sourceColIndex].cards.splice(source.index, 1)
    movedCard.column_id = destination.droppableId
    newColumns[destColIndex].cards.splice(destination.index, 0, movedCard)

    setColumns(newColumns)
    toast.success('Card movido com sucesso')
  }

  const filteredColumns = columns.map(col => ({
    ...col,
    cards: col.cards.filter(card =>
      card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }))

  const totalCards = columns.reduce((sum, col) => sum + col.cards.length, 0)
  const selectedAreaData = AREAS.find(a => a.id === selectedArea)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">Kanban - Super Admin</h1>
            
            {/* Area Selector */}
            <div className="relative">
              <button
                onClick={() => setShowAreaSelector(!showAreaSelector)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${selectedAreaData?.color || 'bg-gray-100'}`}
              >
                {selectedAreaData?.icon && <selectedAreaData.icon className="w-4 h-4" />}
                {selectedAreaData?.label || 'Selecionar Área'}
                <ChevronDown className={`w-4 h-4 transition-transform ${showAreaSelector ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showAreaSelector && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border z-50"
                  >
                    <div className="p-2 max-h-96 overflow-y-auto">
                      {AREAS.map(area => (
                        <button
                          key={area.id}
                          onClick={() => {
                            setSelectedArea(area.id)
                            setShowAreaSelector(false)
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                            selectedArea === area.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                          }`}
                        >
                          <area.icon className="w-4 h-4" />
                          <span className="font-medium">{area.label}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <span className="text-sm text-gray-500">{totalCards} cards</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar cards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Toggle Insights */}
            <button
              onClick={() => setShowInsights(!showInsights)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
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
            className="px-6 py-4 bg-white border-b overflow-hidden"
          >
            <KanbanInsights 
              columns={filteredColumns.map(col => ({
                ...col,
                cards: col.cards.map(c => ({
                  id: c.id,
                  title: c.title,
                  dueDate: c.due_date ? new Date(c.due_date) : undefined,
                  createdAt: new Date(),
                  assignees: c.assignee ? [c.assignee.full_name] : ['Não atribuído']
                }))
              }))} 
              area={selectedAreaData?.label || 'Geral'} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kanban Board */}
      <div className="p-6 overflow-x-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4" style={{ minWidth: `${columns.length * 300}px` }}>
            {filteredColumns.map(column => (
              <div
                key={column.id}
                className="w-72 flex-shrink-0 bg-gray-100 rounded-xl"
              >
                {/* Column Header */}
                <div 
                  className="p-3 rounded-t-xl"
                  style={{ backgroundColor: `${column.color}20` }}
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

                {/* Cards */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`p-2 space-y-2 min-h-[200px] ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
                    >
                      {column.cards.map((card, index) => (
                        <Draggable key={card.id} draggableId={card.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => setSelectedCard(card)}
                              className={`bg-white rounded-lg p-3 shadow-sm border cursor-pointer transition-all hover:shadow-md ${
                                snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''
                              }`}
                            >
                              {/* Priority Badge */}
                              <div className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-2 ${
                                card.priority === 'high' ? 'bg-red-100 text-red-700' :
                                card.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {card.priority === 'high' ? 'Alta' : card.priority === 'medium' ? 'Média' : 'Baixa'}
                              </div>

                              {/* Title */}
                              <h4 className="font-medium text-gray-800 text-sm line-clamp-2">
                                {card.title}
                              </h4>

                              {/* Client */}
                              {card.client_name && (
                                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                  <Building2 className="w-3 h-3" />
                                  <span className="truncate">{card.client_name}</span>
                                </div>
                              )}

                              {/* Due Date */}
                              {card.due_date && (
                                <div className={`flex items-center gap-1 mt-1 text-xs ${
                                  new Date(card.due_date) < new Date() ? 'text-red-600' : 'text-gray-500'
                                }`}>
                                  <Calendar className="w-3 h-3" />
                                  {format(new Date(card.due_date), 'dd/MM', { locale: ptBR })}
                                </div>
                              )}

                              {/* Area Badge */}
                              {card.area && (
                                <div className="mt-2">
                                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                    {card.area}
                                  </span>
                                </div>
                              )}
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

      {/* Card Detail Modal */}
      <AnimatePresence>
        {selectedCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedCard(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">{selectedCard.title}</h2>
                <button onClick={() => setSelectedCard(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {selectedCard.description && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Descrição</h4>
                    <p className="text-gray-600">{selectedCard.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Prioridade</h4>
                    <span className={`inline-block px-2 py-1 rounded text-sm ${
                      selectedCard.priority === 'high' ? 'bg-red-100 text-red-700' :
                      selectedCard.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {selectedCard.priority === 'high' ? 'Alta' : selectedCard.priority === 'medium' ? 'Média' : 'Baixa'}
                    </span>
                  </div>

                  {selectedCard.due_date && (
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Vencimento</h4>
                      <p className="text-gray-600">
                        {format(new Date(selectedCard.due_date), "dd 'de' MMMM", { locale: ptBR })}
                      </p>
                    </div>
                  )}
                </div>

                {selectedCard.client_name && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Cliente</h4>
                    <p className="text-gray-600 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {selectedCard.client_name}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
