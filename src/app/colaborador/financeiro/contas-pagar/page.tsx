'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import {
  Plus, Search, X, Calendar, Building2, DollarSign, 
  AlertCircle, Receipt, CreditCard, Banknote, Archive,
  TrendingDown, Wallet, Filter, Download, Upload, Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, differenceInDays, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

interface ContaPagar {
  id: string
  supplier: string
  description: string
  value: number
  dueDate: Date
  category: string
  costCenter: string
  paymentMethod?: string
  paymentDate?: Date
  paidValue?: number
  receipt?: string
  createdAt: Date
}

interface Column {
  id: string
  title: string
  color: string
  icon: any
  cards: ContaPagar[]
}

const CATEGORIES = [
  { value: 'servicos', label: 'Serviços' },
  { value: 'software', label: 'Software/Assinaturas' },
  { value: 'marketing', label: 'Marketing/Ads' },
  { value: 'pessoal', label: 'Pessoal' },
  { value: 'infraestrutura', label: 'Infraestrutura' },
  { value: 'impostos', label: 'Impostos' },
  { value: 'outros', label: 'Outros' }
]

const COST_CENTERS = [
  { value: 'operacional', label: 'Operacional' },
  { value: 'administrativo', label: 'Administrativo' },
  { value: 'comercial', label: 'Comercial' },
  { value: 'marketing', label: 'Marketing' }
]

const PAYMENT_METHODS = [
  { value: 'pix', label: 'PIX' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'transferencia', label: 'Transferência' },
  { value: 'cartao', label: 'Cartão' },
  { value: 'debito', label: 'Débito Automático' }
]

const INITIAL_COLUMNS: Column[] = [
  { id: 'pendente', title: 'Pendente', color: '#ef4444', icon: AlertCircle, cards: [] },
  { id: 'agendado', title: 'Agendado', color: '#f97316', icon: Calendar, cards: [] },
  { id: 'pago', title: 'Pago', color: '#10b981', icon: Banknote, cards: [] },
  { id: 'arquivado', title: 'Arquivado', color: '#6b7280', icon: Archive, cards: [] }
]

export default function ContasPagarPage() {
  const [columns, setColumns] = useState<Column[]>(INITIAL_COLUMNS)
  const [searchTerm, setSearchTerm] = useState('')
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<ContaPagar | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Mock data
      const mockData: ContaPagar[] = [
        {
          id: '1',
          supplier: 'Google',
          description: 'Google Workspace',
          value: 299.90,
          dueDate: addDays(new Date(), 5),
          category: 'software',
          costCenter: 'operacional',
          createdAt: new Date()
        },
        {
          id: '2',
          supplier: 'Meta',
          description: 'Facebook Ads - Dezembro',
          value: 5000,
          dueDate: addDays(new Date(), 3),
          category: 'marketing',
          costCenter: 'marketing',
          createdAt: new Date()
        },
        {
          id: '3',
          supplier: 'Aluguel',
          description: 'Aluguel Escritório',
          value: 3500,
          dueDate: addDays(new Date(), 10),
          category: 'infraestrutura',
          costCenter: 'administrativo',
          paymentMethod: 'boleto',
          paymentDate: addDays(new Date(), 8),
          createdAt: new Date()
        },
        {
          id: '4',
          supplier: 'Contador',
          description: 'Honorários Contábeis',
          value: 1200,
          dueDate: addDays(new Date(), -2),
          category: 'servicos',
          costCenter: 'administrativo',
          paymentMethod: 'pix',
          paymentDate: new Date(),
          paidValue: 1200,
          createdAt: new Date()
        }
      ]

      const newColumns = INITIAL_COLUMNS.map(col => ({
        ...col,
        cards: col.id === 'pendente' ? mockData.slice(0, 2) :
               col.id === 'agendado' ? mockData.slice(2, 3) :
               col.id === 'pago' ? mockData.slice(3) : []
      }))

      setColumns(newColumns)
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
    toast.success(`Conta movida para ${newColumns[destColIndex].title}`)
  }

  const handleCreateCard = (data: Partial<ContaPagar>) => {
    const newCard: ContaPagar = {
      id: Date.now().toString(),
      supplier: data.supplier || '',
      description: data.description || '',
      value: data.value || 0,
      dueDate: data.dueDate || new Date(),
      category: data.category || 'outros',
      costCenter: data.costCenter || 'operacional',
      createdAt: new Date()
    }

    setColumns(cols => cols.map(col => {
      if (col.id === 'pendente') {
        return { ...col, cards: [...col.cards, newCard] }
      }
      return col
    }))

    setIsNewModalOpen(false)
    toast.success('Conta criada com sucesso')
  }

  const filteredColumns = columns.map(col => ({
    ...col,
    cards: col.cards.filter(card => {
      const matchesSearch = card.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           card.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !filterCategory || card.category === filterCategory
      return matchesSearch && matchesCategory
    })
  }))

  // Cálculos
  const totalPendente = columns.find(c => c.id === 'pendente')?.cards.reduce((sum, c) => sum + c.value, 0) || 0
  const totalAgendado = columns.find(c => c.id === 'agendado')?.cards.reduce((sum, c) => sum + c.value, 0) || 0
  const totalPago = columns.find(c => c.id === 'pago')?.cards.reduce((sum, c) => sum + (c.paidValue || c.value), 0) || 0
  const vencidosCount = columns.find(c => c.id === 'pendente')?.cards.filter(c => differenceInDays(c.dueDate, new Date()) < 0).length || 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500" />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-73px)] flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Contas a Pagar</h1>
                <p className="text-sm text-gray-500">Gerencie suas despesas</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border rounded-lg text-sm w-48 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Todas categorias</option>
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>

            <button
              onClick={() => setIsNewModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nova Conta
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="bg-red-50 rounded-xl p-3 border border-red-100">
            <p className="text-xs text-red-600 font-medium">Pendente</p>
            <p className="text-xl font-bold text-red-700">
              R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            {vencidosCount > 0 && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                {vencidosCount} vencido(s)
              </p>
            )}
          </div>
          <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
            <p className="text-xs text-orange-600 font-medium">Agendado</p>
            <p className="text-xl font-bold text-orange-700">
              R$ {totalAgendado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-green-50 rounded-xl p-3 border border-green-100">
            <p className="text-xs text-green-600 font-medium">Pago (Mês)</p>
            <p className="text-xl font-bold text-green-700">
              R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
            <p className="text-xs text-gray-600 font-medium">Total Previsto</p>
            <p className="text-xl font-bold text-gray-700">
              R$ {(totalPendente + totalAgendado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Kanban */}
      <div className="flex-1 overflow-x-auto">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 p-6 h-full min-w-max">
            {filteredColumns.map((column) => {
              const Icon = column.icon
              return (
                <div
                  key={column.id}
                  className="flex flex-col bg-gray-100 rounded-xl w-80"
                >
                  <div 
                    className="p-3 rounded-t-xl"
                    style={{ backgroundColor: `${column.color}15` }}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5" style={{ color: column.color }} />
                      <h3 className="font-semibold text-gray-800">{column.title}</h3>
                      <span className="text-xs bg-white px-2 py-0.5 rounded-full text-gray-600">
                        {column.cards.length}
                      </span>
                    </div>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "flex-1 p-2 space-y-2 overflow-y-auto",
                          snapshot.isDraggingOver && "bg-red-50"
                        )}
                        style={{ maxHeight: 'calc(100vh - 350px)' }}
                      >
                        {column.cards.map((card, index) => {
                          const isOverdue = differenceInDays(card.dueDate, new Date()) < 0 && column.id === 'pendente'
                          const daysUntilDue = differenceInDays(card.dueDate, new Date())
                          const categoryLabel = CATEGORIES.find(c => c.value === card.category)?.label

                          return (
                            <Draggable key={card.id} draggableId={card.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => setSelectedCard(card)}
                                  className={cn(
                                    "bg-white rounded-lg p-3 shadow-sm border cursor-pointer hover:shadow-md transition-all",
                                    isOverdue && "border-red-300 bg-red-50",
                                    snapshot.isDragging && "shadow-lg ring-2 ring-red-500"
                                  )}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                      {categoryLabel}
                                    </span>
                                    {isOverdue && (
                                      <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        Vencido
                                      </span>
                                    )}
                                  </div>

                                  <h4 className="font-medium text-gray-800">{card.supplier}</h4>
                                  <p className="text-sm text-gray-500 line-clamp-1">{card.description}</p>

                                  <div className="flex items-center justify-between mt-3">
                                    <span className="text-lg font-bold text-gray-800">
                                      R$ {card.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                    <div className={cn(
                                      "flex items-center gap-1 text-xs",
                                      isOverdue ? "text-red-600" :
                                      daysUntilDue <= 3 ? "text-orange-600" :
                                      "text-gray-500"
                                    )}>
                                      <Calendar className="w-3 h-3" />
                                      {format(card.dueDate, "dd/MM", { locale: ptBR })}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          )
                        })}
                        {provided.placeholder}

                        {column.id === 'pendente' && (
                          <button
                            onClick={() => setIsNewModalOpen(true)}
                            className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-red-400 hover:text-red-500 transition-colors flex items-center justify-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            <span className="text-sm">Nova conta</span>
                          </button>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              )
            })}
          </div>
        </DragDropContext>
      </div>

      {/* New Card Modal */}
      <AnimatePresence>
        {isNewModalOpen && (
          <NewContaModal
            onClose={() => setIsNewModalOpen(false)}
            onSubmit={handleCreateCard}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function NewContaModal({
  onClose,
  onSubmit
}: {
  onClose: () => void
  onSubmit: (data: Partial<ContaPagar>) => void
}) {
  const [formData, setFormData] = useState({
    supplier: '',
    description: '',
    value: '',
    dueDate: '',
    category: 'servicos',
    costCenter: 'operacional'
  })

  const handleSubmit = () => {
    if (!formData.supplier || !formData.value || !formData.dueDate) {
      toast.error('Preencha os campos obrigatórios')
      return
    }
    onSubmit({
      ...formData,
      value: parseFloat(formData.value),
      dueDate: new Date(formData.dueDate)
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
      >
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">Nova Conta a Pagar</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fornecedor <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.supplier}
              onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
              placeholder="Nome do fornecedor"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição da conta"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor (R$) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                placeholder="0,00"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vencimento <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Centro de Custo</label>
              <select
                value={formData.costCenter}
                onChange={(e) => setFormData(prev => ({ ...prev, costCenter: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {COST_CENTERS.map(cc => (
                  <option key={cc.value} value={cc.value}>{cc.label}</option>
                ))}
              </select>
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
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Criar Conta
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
