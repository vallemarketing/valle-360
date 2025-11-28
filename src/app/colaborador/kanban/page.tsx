'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import {
  Plus, Search, Filter, X, Clock, User, Phone, Building2, Calendar,
  MoreHorizontal, Paperclip, MessageSquare, CheckCircle2, AlertCircle,
  Flame, Thermometer, Snowflake, ChevronDown, Eye, Edit, Trash2,
  FileText, Link2, Video, Mail, Tag
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'

// ==================== TIPOS ====================
interface PipefyCard {
  id: string
  title: string
  description?: string
  temperature: 'hot' | 'warm' | 'cold'
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  industry?: string
  company?: string
  dueDate?: Date
  createdAt: Date
  updatedAt: Date
  assignees: string[]
  tags: string[]
  attachments: number
  comments: number
  customFields?: Record<string, string>
}

interface PipefyColumn {
  id: string
  title: string
  color: string
  cards: PipefyCard[]
  description?: string
}

// ==================== CONSTANTES ====================
const TEMPERATURE_CONFIG = {
  hot: { label: 'Quente', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50', icon: Flame },
  warm: { label: 'Morno', color: 'bg-orange-400', textColor: 'text-orange-700', bgLight: 'bg-orange-50', icon: Thermometer },
  cold: { label: 'Frio', color: 'bg-blue-400', textColor: 'text-blue-700', bgLight: 'bg-blue-50', icon: Snowflake }
}

const COLUMN_COLORS: Record<string, string> = {
  backlog: '#6366f1',
  qualificacao: '#f59e0b',
  contato: '#10b981',
  followup: '#3b82f6',
  reuniao: '#8b5cf6',
  qualificado: '#22c55e',
  nao_qualificado: '#ef4444',
  em_progresso: '#f97316',
  revisao: '#eab308',
  aprovacao: '#06b6d4',
  concluido: '#10b981'
}

const DEFAULT_COLUMNS: PipefyColumn[] = [
  { id: 'backlog', title: 'Backlog', color: '#6366f1', cards: [], description: 'Tarefas a fazer' },
  { id: 'em_progresso', title: 'Em Progresso', color: '#f97316', cards: [], description: 'Em andamento' },
  { id: 'revisao', title: 'Revisão', color: '#eab308', cards: [], description: 'Aguardando revisão' },
  { id: 'aprovacao', title: 'Aprovação Cliente', color: '#06b6d4', cards: [], description: 'Enviado para cliente' },
  { id: 'concluido', title: 'Concluído', color: '#10b981', cards: [], description: 'Finalizado' }
]

// ==================== COMPONENTE PRINCIPAL ====================
export default function KanbanPipefyPage() {
  const [columns, setColumns] = useState<PipefyColumn[]>(DEFAULT_COLUMNS)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCard, setSelectedCard] = useState<PipefyCard | null>(null)
  const [isCardModalOpen, setIsCardModalOpen] = useState(false)
  const [isNewCardModalOpen, setIsNewCardModalOpen] = useState(false)
  const [newCardColumn, setNewCardColumn] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [userArea, setUserArea] = useState('Web Designer')
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: employee } = await supabase
          .from('employees')
          .select('*, employee_areas_of_expertise(area_name)')
          .eq('user_id', user.id)
          .single()

        const area = employee?.employee_areas_of_expertise?.[0]?.area_name || 'Web Designer'
        setUserArea(area)
      }

      // Carregar cards de exemplo
      loadMockData()
    } catch (error) {
      console.error('Erro:', error)
      loadMockData()
    } finally {
      setLoading(false)
    }
  }

  const loadMockData = () => {
    const mockCards: PipefyCard[] = [
      {
        id: '1',
        title: 'Indústrias Wonka',
        contactName: 'Willy Wonka',
        company: 'Wonka Industries',
        industry: 'Manufatura',
        temperature: 'warm',
        createdAt: new Date(Date.now() - 1151 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        assignees: ['Você'],
        tags: ['Novo Cliente'],
        attachments: 0,
        comments: 0
      },
      {
        id: '2',
        title: 'Bem-vindo',
        description: 'Verifique se os leads recebidos são potenciais clientes',
        temperature: 'cold',
        createdAt: new Date(Date.now() - 1148 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        assignees: [],
        tags: [],
        attachments: 0,
        comments: 0
      },
      {
        id: '3',
        title: 'Corporação Umbrella',
        contactName: 'Edward Ashford',
        company: 'Umbrella Corp',
        industry: 'Saúde',
        temperature: 'warm',
        createdAt: new Date(Date.now() - 1151 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        assignees: ['Você'],
        tags: ['EXEMPLO'],
        attachments: 0,
        comments: 0,
        description: 'Colete as informações iniciais sobre o lead'
      },
      {
        id: '4',
        title: 'Indústrias Stark',
        contactName: 'Tony Stark',
        company: 'Stark Industries',
        industry: 'Tecnologia',
        temperature: 'hot',
        createdAt: new Date(Date.now() - 1151 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        assignees: ['Você'],
        tags: ['EXEMPLO'],
        attachments: 0,
        comments: 0,
        description: 'Colete as informações iniciais sobre o lead'
      },
      {
        id: '5',
        title: 'Empresas Wayne',
        contactName: 'Bruce Wayne',
        company: 'Wayne Enterprises',
        industry: 'Tecnologia',
        temperature: 'cold',
        createdAt: new Date(Date.now() - 1151 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        assignees: ['Você'],
        tags: ['EXEMPLO'],
        attachments: 0,
        comments: 0,
        description: 'Descubra as necessidades e prazos para compra'
      },
      {
        id: '6',
        title: 'Los Pollos Hermanos',
        contactName: 'Gustavo Fring',
        company: 'Los Pollos',
        industry: 'Outras',
        temperature: 'warm',
        createdAt: new Date(Date.now() - 1151 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        assignees: ['Você'],
        tags: ['EXEMPLO'],
        attachments: 0,
        comments: 0,
        description: 'Acompanhe o status do lead'
      },
      {
        id: '7',
        title: 'Central Perk',
        contactName: 'Gunther',
        company: 'Central Perk',
        industry: 'Outras',
        temperature: 'cold',
        createdAt: new Date(Date.now() - 1151 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        assignees: ['Você'],
        tags: ['EXEMPLO'],
        attachments: 0,
        comments: 0,
        description: 'Agende uma demonstração do produto'
      },
      {
        id: '8',
        title: 'ACME',
        contactName: 'Coiote',
        company: 'ACME Corp',
        industry: 'Energia e Utilitários',
        temperature: 'warm',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
        assignees: ['Você'],
        tags: ['EXEMPLO'],
        attachments: 0,
        comments: 0,
        description: 'Acesse o processo "Funil de Vendas" para continuar'
      },
      {
        id: '9',
        title: 'Oscorp',
        contactName: 'Norman Osborn',
        company: 'Oscorp Industries',
        industry: 'Marketing, Mídia e Entretenimento',
        temperature: 'cold',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
        assignees: ['Você'],
        tags: ['EXEMPLO'],
        attachments: 0,
        comments: 0,
        description: 'Oportunidades descartadas'
      }
    ]

    // Distribuir cards nas colunas
    const newColumns = [...DEFAULT_COLUMNS]
    newColumns[0].cards = [mockCards[0], mockCards[1]] // Backlog
    newColumns[1].cards = [mockCards[2], mockCards[3]] // Em Progresso
    newColumns[2].cards = [mockCards[4]] // Revisão
    newColumns[3].cards = [mockCards[5], mockCards[6]] // Aprovação
    newColumns[4].cards = [mockCards[7], mockCards[8]] // Concluído

    setColumns(newColumns)
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
  }

  const handleOpenCard = (card: PipefyCard) => {
    setSelectedCard(card)
    setIsCardModalOpen(true)
  }

  const handleNewCard = (columnId: string) => {
    setNewCardColumn(columnId)
    setIsNewCardModalOpen(true)
  }

  const handleCreateCard = (cardData: Partial<PipefyCard>) => {
    const newCard: PipefyCard = {
      id: Date.now().toString(),
      title: cardData.title || 'Novo Card',
      description: cardData.description,
      temperature: cardData.temperature || 'warm',
      contactName: cardData.contactName,
      contactEmail: cardData.contactEmail,
      contactPhone: cardData.contactPhone,
      industry: cardData.industry,
      company: cardData.company,
      createdAt: new Date(),
      updatedAt: new Date(),
      assignees: ['Você'],
      tags: cardData.tags || [],
      attachments: 0,
      comments: 0
    }

    const newColumns = columns.map(col => {
      if (col.id === newCardColumn) {
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
      card.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.company?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }))

  // Scroll horizontal com mouse wheel
  const handleWheel = (e: React.WheelEvent) => {
    if (scrollContainerRef.current) {
      e.preventDefault()
      scrollContainerRef.current.scrollLeft += e.deltaY
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-800">Kanban - {userArea}</h1>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {columns.reduce((acc, col) => acc + col.cards.length, 0)} cards
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Procurar cards"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>

            {/* Filtros */}
            <button className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div 
        ref={scrollContainerRef}
        onWheel={handleWheel}
        className="flex-1 overflow-x-auto overflow-y-hidden p-6"
        style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 #f1f5f9'
        }}
      >
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 h-full min-w-max pb-4">
            {filteredColumns.map((column) => (
              <div
                key={column.id}
                className="w-72 flex-shrink-0 flex flex-col bg-gray-100 rounded-lg overflow-hidden"
                style={{ maxHeight: 'calc(100vh - 180px)' }}
              >
                {/* Column Header */}
                <div 
                  className="px-4 py-3 flex items-center justify-between"
                  style={{ backgroundColor: column.color }}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{column.title}</span>
                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs text-white font-medium">
                      {column.cards.length}
                    </span>
                  </div>
                  <button className="text-white/80 hover:text-white">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                {/* Cards Container */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "flex-1 overflow-y-auto p-2 space-y-2",
                        snapshot.isDraggingOver && "bg-blue-50"
                      )}
                      style={{ 
                        minHeight: '200px',
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#cbd5e1 transparent'
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
                              className={cn(
                                "bg-white rounded-lg p-3 cursor-pointer transition-all",
                                "border border-gray-200 hover:shadow-md",
                                snapshot.isDragging && "shadow-lg ring-2 ring-blue-500"
                              )}
                              style={{
                                ...provided.draggableProps.style
                              }}
                            >
                              {/* Tag EXEMPLO */}
                              {card.tags.includes('EXEMPLO') && (
                                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                                  EXEMPLO
                                </span>
                              )}

                              {/* Temperature Badge */}
                              {card.temperature && (
                                <div className="mb-2">
                                  <span className={cn(
                                    "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium",
                                    TEMPERATURE_CONFIG[card.temperature].color,
                                    "text-white"
                                  )}>
                                    {TEMPERATURE_CONFIG[card.temperature].label}
                                  </span>
                                </div>
                              )}

                              {/* Title */}
                              <h3 className="font-semibold text-gray-800 mb-2">{card.title}</h3>

                              {/* Contact Info */}
                              {card.contactName && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                  <User className="w-3.5 h-3.5 text-gray-400" />
                                  <span className="text-xs text-gray-500">NOME DO CONTATO</span>
                                </div>
                              )}
                              {card.contactName && (
                                <p className="text-sm text-gray-700 mb-2 ml-5">{card.contactName}</p>
                              )}

                              {/* Industry */}
                              {card.industry && (
                                <>
                                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="text-xs text-gray-500">INDÚSTRIA</span>
                                  </div>
                                  <p className="text-sm text-gray-700 mb-2 ml-5">{card.industry}</p>
                                </>
                              )}

                              {/* Description */}
                              {card.description && (
                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                  {card.description}
                                </p>
                              )}

                              {/* Footer - Dates */}
                              <div className="flex items-center gap-3 mt-3 pt-2 border-t border-gray-100">
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <AlertCircle className="w-3 h-3 text-red-400" />
                                  <span>{differenceInDays(new Date(), card.createdAt)}d</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Clock className="w-3 h-3 text-green-400" />
                                  <span>{differenceInDays(new Date(), card.createdAt)}d</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Calendar className="w-3 h-3 text-blue-400" />
                                  <span>{differenceInDays(new Date(), card.createdAt)}d</span>
                                </div>
                                {card.dueDate && (
                                  <div className="flex items-center gap-1 text-xs text-gray-500 ml-auto">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                    <span>0min</span>
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

                {/* Add Card Button */}
                <button
                  onClick={() => handleNewCard(column.id)}
                  className="m-2 p-3 flex items-center gap-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Criar novo card
                </button>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Card Detail Modal */}
      <AnimatePresence>
        {isCardModalOpen && selectedCard && (
          <CardDetailModal
            card={selectedCard}
            onClose={() => setIsCardModalOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* New Card Modal */}
      <AnimatePresence>
        {isNewCardModalOpen && (
          <NewCardModal
            onClose={() => setIsNewCardModalOpen(false)}
            onCreate={handleCreateCard}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== MODAL DETALHES DO CARD ====================
function CardDetailModal({ card, onClose }: { card: PipefyCard; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-start justify-between">
            <div>
              {card.temperature && (
                <span className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium mb-2",
                  TEMPERATURE_CONFIG[card.temperature].color,
                  "text-white"
                )}>
                  {TEMPERATURE_CONFIG[card.temperature].label}
                </span>
              )}
              <h2 className="text-xl font-bold text-gray-800">{card.title}</h2>
              {card.company && (
                <p className="text-sm text-gray-500 mt-1">{card.company}</p>
              )}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {card.contactName && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Nome do Contato</label>
                  <p className="text-gray-800 mt-1">{card.contactName}</p>
                </div>
              )}

              {card.contactEmail && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                  <p className="text-gray-800 mt-1">{card.contactEmail}</p>
                </div>
              )}

              {card.contactPhone && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Telefone</label>
                  <p className="text-gray-800 mt-1">{card.contactPhone}</p>
                </div>
              )}

              {card.industry && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Indústria</label>
                  <p className="text-gray-800 mt-1">{card.industry}</p>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {card.description && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Descrição</label>
                  <p className="text-gray-700 mt-1">{card.description}</p>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Criado em</label>
                <p className="text-gray-800 mt-1">
                  {format(card.createdAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>

              {card.dueDate && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Prazo</label>
                  <p className="text-gray-800 mt-1">
                    {format(card.dueDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {card.tags.length > 0 && (
            <div className="mt-6">
              <label className="text-xs font-semibold text-gray-500 uppercase">Tags</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {card.tags.map((tag, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Paperclip className="w-4 h-4" />
              {card.attachments} anexos
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {card.comments} comentários
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
              <Edit className="w-4 h-4 inline mr-1" />
              Editar
            </button>
            <button className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
              <Trash2 className="w-4 h-4 inline mr-1" />
              Excluir
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ==================== MODAL NOVO CARD ====================
function NewCardModal({ onClose, onCreate }: { onClose: () => void; onCreate: (data: Partial<PipefyCard>) => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    company: '',
    industry: '',
    temperature: 'warm' as 'hot' | 'warm' | 'cold',
    tags: ''
  })

  const handleSubmit = () => {
    if (!formData.title.trim()) return
    onCreate({
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Novo Card</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nome do lead ou tarefa"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Detalhes sobre o card..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Contato</label>
              <input
                type="text"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Indústria</label>
            <select
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione...</option>
              <option value="Tecnologia">Tecnologia</option>
              <option value="Saúde">Saúde</option>
              <option value="Manufatura">Manufatura</option>
              <option value="Varejo">Varejo</option>
              <option value="Serviços">Serviços</option>
              <option value="Educação">Educação</option>
              <option value="Energia e Utilitários">Energia e Utilitários</option>
              <option value="Marketing, Mídia e Entretenimento">Marketing, Mídia e Entretenimento</option>
              <option value="Outras">Outras</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Temperatura</label>
            <div className="flex gap-2">
              {(['hot', 'warm', 'cold'] as const).map((temp) => (
                <button
                  key={temp}
                  onClick={() => setFormData({ ...formData, temperature: temp })}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                    formData.temperature === temp
                      ? cn(TEMPERATURE_CONFIG[temp].color, "text-white")
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {TEMPERATURE_CONFIG[temp].label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (separadas por vírgula)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Urgente, Novo Cliente"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!formData.title.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Criar Card
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
