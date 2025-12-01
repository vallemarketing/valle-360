'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import {
  Plus, Search, Calendar, DollarSign, Building2, AlertTriangle,
  Clock, CheckCircle2, Archive, X, Filter, TrendingDown, Wallet,
  CreditCard, Banknote, Receipt, Zap
} from 'lucide-react'
import { format, differenceInDays, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { getFinanceiroPhases, PhaseConfig } from '@/lib/kanban/phaseFields'
import { PhaseTransitionModal } from '@/components/kanban/PhaseTransitionModal'

interface ContaPagar {
  id: string
  supplier: string
  description: string
  value: number
  dueDate: Date
  category: string
  costCenter: string
  status: string
  paymentMethod?: string
  scheduledDate?: Date
  paidDate?: Date
  paidValue?: number
  receipt?: string
  createdAt: Date
}

interface Column {
  id: string
  title: string
  color: string
  cards: ContaPagar[]
}

const CATEGORY_ICONS: Record<string, any> = {
  fornecedores: Building2,
  servicos: Receipt,
  impostos: DollarSign,
  folha: Wallet,
  aluguel: Building2,
  outros: CreditCard
}

export default function ContasPagarPage() {
  const [columns, setColumns] = useState<Column[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [showInsights, setShowInsights] = useState(true)
  const [transitionModal, setTransitionModal] = useState<{
    isOpen: boolean
    card: ContaPagar | null
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

  const phases = getFinanceiroPhases('pagar')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    // Mock data
    const mockContas: ContaPagar[] = [
      {
        id: '1',
        supplier: 'Fornecedor ABC',
        description: 'Compra de materiais de escritório',
        value: 2500,
        dueDate: addDays(new Date(), 5),
        category: 'fornecedores',
        costCenter: 'administrativo',
        status: 'pendente',
        createdAt: new Date()
      },
      {
        id: '2',
        supplier: 'Imobiliária XYZ',
        description: 'Aluguel do escritório - Janeiro',
        value: 8500,
        dueDate: addDays(new Date(), 10),
        category: 'aluguel',
        costCenter: 'administrativo',
        status: 'agendado',
        paymentMethod: 'transferencia',
        scheduledDate: addDays(new Date(), 9),
        createdAt: new Date()
      },
      {
        id: '3',
        supplier: 'Receita Federal',
        description: 'DAS - Simples Nacional',
        value: 3200,
        dueDate: addDays(new Date(), 2),
        category: 'impostos',
        costCenter: 'administrativo',
        status: 'pendente',
        createdAt: new Date()
      },
      {
        id: '4',
        supplier: 'Colaboradores',
        description: 'Folha de Pagamento - Dezembro',
        value: 45000,
        dueDate: addDays(new Date(), -2),
        category: 'folha',
        costCenter: 'operacional',
        status: 'pago',
        paymentMethod: 'transferencia',
        paidDate: addDays(new Date(), -2),
        paidValue: 45000,
        createdAt: new Date()
      },
      {
        id: '5',
        supplier: 'TechSupport',
        description: 'Manutenção de TI',
        value: 1500,
        dueDate: addDays(new Date(), 15),
        category: 'servicos',
        costCenter: 'operacional',
        status: 'pendente',
        createdAt: new Date()
      }
    ]

    const newColumns: Column[] = phases.map(phase => ({
      id: phase.id,
      title: phase.title,
      color: phase.color,
      cards: mockContas.filter(c => c.status === phase.id)
    }))

    setColumns(newColumns)
    setLoading(false)
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const { source, destination } = result

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    const sourceColIndex = columns.findIndex(col => col.id === source.droppableId)
    const destColIndex = columns.findIndex(col => col.id === destination.droppableId)
    const card = columns[sourceColIndex].cards[source.index]

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

    const [movedCard] = newColumns[sourceColIndex].cards.splice(transitionModal.sourceIndex, 1)
    movedCard.status = transitionModal.toColumnId

    // Atualizar campos específicos
    if (transitionModal.toColumnId === 'agendado') {
      movedCard.scheduledDate = data.scheduled_date ? new Date(data.scheduled_date) : undefined
      movedCard.paymentMethod = data.payment_method
    } else if (transitionModal.toColumnId === 'pago') {
      movedCard.paidDate = data.paid_date ? new Date(data.paid_date) : undefined
      movedCard.paidValue = data.paid_value
      movedCard.receipt = data.receipt
    }

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

  const handleCreateConta = (data: Partial<ContaPagar>) => {
    const newConta: ContaPagar = {
      id: Date.now().toString(),
      supplier: data.supplier || '',
      description: data.description || '',
      value: data.value || 0,
      dueDate: data.dueDate || new Date(),
      category: data.category || 'outros',
      costCenter: data.costCenter || 'administrativo',
      status: 'pendente',
      createdAt: new Date()
    }

    setColumns(prev => prev.map(col => {
      if (col.id === 'pendente') {
        return { ...col, cards: [...col.cards, newConta] }
      }
      return col
    }))

    setIsNewModalOpen(false)
  }

  // Métricas
  const totalPendente = columns.find(c => c.id === 'pendente')?.cards.reduce((sum, c) => sum + c.value, 0) || 0
  const totalAgendado = columns.find(c => c.id === 'agendado')?.cards.reduce((sum, c) => sum + c.value, 0) || 0
  const totalPago = columns.find(c => c.id === 'pago')?.cards.reduce((sum, c) => sum + (c.paidValue || c.value), 0) || 0
  const contasAtrasadas = columns.flatMap(c => c.cards).filter(c => 
    c.status !== 'pago' && c.status !== 'arquivado' && differenceInDays(c.dueDate, new Date()) < 0
  ).length

  const filteredColumns = columns.map(col => ({
    ...col,
    cards: col.cards.filter(card =>
      card.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }))

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
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Contas a Pagar</h1>
              <p className="text-sm text-gray-500">Gerencie suas despesas e pagamentos</p>
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
                className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <button
              onClick={() => setShowInsights(!showInsights)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                showInsights ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Zap className="w-4 h-4" />
              Insights
            </button>

            <button
              onClick={() => setIsNewModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nova Conta
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
            className="bg-white border-b px-6 py-4 overflow-hidden"
          >
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-red-50 rounded-xl">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">Pendente</span>
                </div>
                <p className="text-2xl font-bold text-red-700">
                  R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="p-4 bg-orange-50 rounded-xl">
                <div className="flex items-center gap-2 text-orange-600 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Agendado</span>
                </div>
                <p className="text-2xl font-bold text-orange-700">
                  R$ {totalAgendado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-xl">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Pago (mês)</span>
                </div>
                <p className="text-2xl font-bold text-green-700">
                  R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className={`p-4 rounded-xl ${contasAtrasadas > 0 ? 'bg-red-100' : 'bg-gray-50'}`}>
                <div className={`flex items-center gap-2 mb-2 ${contasAtrasadas > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">Atrasadas</span>
                </div>
                <p className={`text-2xl font-bold ${contasAtrasadas > 0 ? 'text-red-700' : 'text-gray-700'}`}>
                  {contasAtrasadas}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 h-full" style={{ minWidth: `${columns.length * 320}px` }}>
            {filteredColumns.map((column, colIndex) => (
              <div
                key={column.id}
                className="w-80 flex-shrink-0 bg-gray-100 rounded-xl flex flex-col"
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
                    <span className="text-sm font-medium text-gray-600">
                      R$ {column.cards.reduce((sum, c) => sum + c.value, 0).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 p-2 space-y-2 overflow-y-auto ${snapshot.isDraggingOver ? 'bg-red-50' : ''}`}
                    >
                      {column.cards.map((card, index) => {
                        const daysUntilDue = differenceInDays(card.dueDate, new Date())
                        const isOverdue = daysUntilDue < 0 && card.status !== 'pago' && card.status !== 'arquivado'
                        const CategoryIcon = CATEGORY_ICONS[card.category] || Receipt

                        return (
                          <Draggable key={card.id} draggableId={card.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white rounded-lg p-3 shadow-sm border cursor-pointer transition-all hover:shadow-md ${
                                  snapshot.isDragging ? 'shadow-lg ring-2 ring-red-500' : ''
                                } ${isOverdue ? 'border-red-300 bg-red-50' : ''}`}
                              >
                                {/* Category Badge */}
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600">
                                    <CategoryIcon className="w-3 h-3" />
                                    {card.category}
                                  </div>
                                  {isOverdue && (
                                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded font-medium">
                                      Atrasado
                                    </span>
                                  )}
                                </div>

                                {/* Supplier */}
                                <h4 className="font-medium text-gray-800 text-sm">{card.supplier}</h4>
                                <p className="text-xs text-gray-500 line-clamp-1 mt-1">{card.description}</p>

                                {/* Value */}
                                <div className="flex items-center justify-between mt-3">
                                  <span className="text-lg font-bold text-gray-800">
                                    R$ {card.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </span>
                                </div>

                                {/* Due Date */}
                                <div className={`flex items-center gap-1 mt-2 text-xs ${
                                  isOverdue ? 'text-red-600' :
                                  daysUntilDue <= 3 ? 'text-orange-600' :
                                  'text-gray-500'
                                }`}>
                                  <Calendar className="w-3 h-3" />
                                  {format(card.dueDate, "dd/MM/yyyy", { locale: ptBR })}
                                  {daysUntilDue === 0 && ' (Hoje)'}
                                  {daysUntilDue === 1 && ' (Amanhã)'}
                                  {isOverdue && ` (${Math.abs(daysUntilDue)} dias atrasado)`}
                                </div>

                                {/* Payment Info */}
                                {card.paymentMethod && (
                                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                                    <CreditCard className="w-3 h-3" />
                                    {card.paymentMethod}
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        )
                      })}
                      {provided.placeholder}

                      {/* Add Button - Only on first column */}
                      {colIndex === 0 && (
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
          cardTitle={transitionModal.card?.supplier || ''}
          existingData={{}}
          clients={[]}
          employees={[]}
        />
      )}

      {/* New Conta Modal */}
      <AnimatePresence>
        {isNewModalOpen && (
          <NewContaModal
            isOpen={isNewModalOpen}
            onClose={() => setIsNewModalOpen(false)}
            onSubmit={handleCreateConta}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// New Conta Modal Component
function NewContaModal({
  isOpen,
  onClose,
  onSubmit
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Partial<ContaPagar>) => void
}) {
  const [formData, setFormData] = useState({
    supplier: '',
    description: '',
    value: '',
    dueDate: '',
    category: 'fornecedores',
    costCenter: 'administrativo'
  })

  const handleSubmit = () => {
    if (!formData.supplier || !formData.value || !formData.dueDate) {
      alert('Preencha os campos obrigatórios')
      return
    }
    onSubmit({
      supplier: formData.supplier,
      description: formData.description,
      value: parseFloat(formData.value),
      dueDate: new Date(formData.dueDate),
      category: formData.category,
      costCenter: formData.costCenter
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
                Valor <span className="text-red-500">*</span>
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
                <option value="fornecedores">Fornecedores</option>
                <option value="servicos">Serviços</option>
                <option value="impostos">Impostos</option>
                <option value="folha">Folha de Pagamento</option>
                <option value="aluguel">Aluguel</option>
                <option value="outros">Outros</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Centro de Custo</label>
              <select
                value={formData.costCenter}
                onChange={(e) => setFormData(prev => ({ ...prev, costCenter: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="marketing">Marketing</option>
                <option value="comercial">Comercial</option>
                <option value="administrativo">Administrativo</option>
                <option value="operacional">Operacional</option>
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

