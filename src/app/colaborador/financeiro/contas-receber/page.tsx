'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import {
  Plus, Search, Calendar, DollarSign, Building2, AlertTriangle,
  Clock, CheckCircle2, Archive, X, Filter, TrendingUp, Wallet,
  CreditCard, Banknote, Receipt, Zap, FileText, Send
} from 'lucide-react'
import { format, differenceInDays, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale/pt-BR'
import { getFinanceiroPhases, PhaseConfig } from '@/lib/kanban/phaseFields'
import { PhaseTransitionModal } from '@/components/kanban/PhaseTransitionModal'

interface ContaReceber {
  id: string
  clientId: string
  clientName: string
  description: string
  value: number
  servicePeriod?: string
  services: string[]
  status: string
  invoiceNumber?: string
  invoiceDate?: Date
  dueDate?: Date
  invoiceLink?: string
  billingStatus?: string
  receivedDate?: Date
  receivedValue?: number
  paymentMethod?: string
  createdAt: Date
}

interface Column {
  id: string
  title: string
  color: string
  cards: ContaReceber[]
}

export default function ContasReceberPage() {
  const [columns, setColumns] = useState<Column[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [showInsights, setShowInsights] = useState(true)
  const [transitionModal, setTransitionModal] = useState<{
    isOpen: boolean
    card: ContaReceber | null
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

  const phases = getFinanceiroPhases('receber')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    // Mock data
    const mockContas: ContaReceber[] = [
      {
        id: '1',
        clientId: '1',
        clientName: 'Tech Solutions',
        description: 'Mensalidade Marketing Digital',
        value: 5500,
        servicePeriod: 'Janeiro/2025',
        services: ['social_media', 'trafego'],
        status: 'a_faturar',
        createdAt: new Date()
      },
      {
        id: '2',
        clientId: '2',
        clientName: 'E-commerce Plus',
        description: 'Projeto Landing Page',
        value: 3500,
        servicePeriod: 'Janeiro/2025',
        services: ['site'],
        status: 'faturado',
        invoiceNumber: 'NF-2025-001',
        invoiceDate: addDays(new Date(), -5),
        dueDate: addDays(new Date(), 5),
        billingStatus: 'enviado',
        createdAt: new Date()
      },
      {
        id: '3',
        clientId: '3',
        clientName: 'Startup XYZ',
        description: 'Consultoria Estratégica',
        value: 8000,
        servicePeriod: 'Dezembro/2024',
        services: ['consultoria'],
        status: 'recebido',
        invoiceNumber: 'NF-2024-125',
        invoiceDate: addDays(new Date(), -20),
        dueDate: addDays(new Date(), -5),
        receivedDate: addDays(new Date(), -3),
        receivedValue: 8000,
        paymentMethod: 'pix',
        createdAt: new Date()
      },
      {
        id: '4',
        clientId: '4',
        clientName: 'Fashion Store',
        description: 'Mensalidade Completa',
        value: 12000,
        servicePeriod: 'Janeiro/2025',
        services: ['social_media', 'trafego', 'design'],
        status: 'faturado',
        invoiceNumber: 'NF-2025-002',
        invoiceDate: addDays(new Date(), -10),
        dueDate: addDays(new Date(), -2),
        billingStatus: 'atrasado',
        createdAt: new Date()
      },
      {
        id: '5',
        clientId: '5',
        clientName: 'Restaurante Gourmet',
        description: 'Pacote Redes Sociais',
        value: 2800,
        servicePeriod: 'Janeiro/2025',
        services: ['social_media'],
        status: 'a_faturar',
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
    if (transitionModal.toColumnId === 'faturado') {
      movedCard.invoiceNumber = data.invoice_number
      movedCard.invoiceDate = data.invoice_date ? new Date(data.invoice_date) : undefined
      movedCard.dueDate = data.due_date ? new Date(data.due_date) : undefined
      movedCard.invoiceLink = data.invoice_link
      movedCard.billingStatus = data.billing_status || 'enviado'
    } else if (transitionModal.toColumnId === 'recebido') {
      movedCard.receivedDate = data.received_date ? new Date(data.received_date) : undefined
      movedCard.receivedValue = data.received_value
      movedCard.paymentMethod = data.payment_method
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

  const handleCreateConta = (data: Partial<ContaReceber>) => {
    const newConta: ContaReceber = {
      id: Date.now().toString(),
      clientId: data.clientId || '',
      clientName: data.clientName || '',
      description: data.description || '',
      value: data.value || 0,
      servicePeriod: data.servicePeriod,
      services: data.services || [],
      status: 'a_faturar',
      createdAt: new Date()
    }

    setColumns(prev => prev.map(col => {
      if (col.id === 'a_faturar') {
        return { ...col, cards: [...col.cards, newConta] }
      }
      return col
    }))

    setIsNewModalOpen(false)
  }

  // Métricas
  const totalAFaturar = columns.find(c => c.id === 'a_faturar')?.cards.reduce((sum, c) => sum + c.value, 0) || 0
  const totalFaturado = columns.find(c => c.id === 'faturado')?.cards.reduce((sum, c) => sum + c.value, 0) || 0
  const totalRecebido = columns.find(c => c.id === 'recebido')?.cards.reduce((sum, c) => sum + (c.receivedValue || c.value), 0) || 0
  const contasAtrasadas = columns.find(c => c.id === 'faturado')?.cards.filter(c => 
    c.dueDate && differenceInDays(c.dueDate, new Date()) < 0
  ).length || 0

  const filteredColumns = columns.map(col => ({
    ...col,
    cards: col.cards.filter(card =>
      card.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }))

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-73px)] flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Contas a Receber</h1>
              <p className="text-sm text-gray-500">Gerencie suas receitas e cobranças</p>
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
                className="pl-9 pr-4 py-2 border rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nova Receita
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
              <div className="p-4 bg-purple-50 rounded-xl">
                <div className="flex items-center gap-2 text-purple-600 mb-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-medium">A Faturar</span>
                </div>
                <p className="text-2xl font-bold text-purple-700">
                  R$ {totalAFaturar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="p-4 bg-cyan-50 rounded-xl">
                <div className="flex items-center gap-2 text-cyan-600 mb-2">
                  <Send className="w-4 h-4" />
                  <span className="text-sm font-medium">Faturado</span>
                </div>
                <p className="text-2xl font-bold text-cyan-700">
                  R$ {totalFaturado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-xl">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Recebido (mês)</span>
                </div>
                <p className="text-2xl font-bold text-green-700">
                  R$ {totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className={`p-4 rounded-xl ${contasAtrasadas > 0 ? 'bg-red-100' : 'bg-gray-50'}`}>
                <div className={`flex items-center gap-2 mb-2 ${contasAtrasadas > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">Inadimplentes</span>
                </div>
                <p className={`text-2xl font-bold ${contasAtrasadas > 0 ? 'text-red-700' : 'text-gray-700'}`}>
                  {contasAtrasadas}
                </p>
              </div>
            </div>

            {/* Fluxo de Caixa Previsto */}
            <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Previsão de Entrada (próx. 30 dias)</p>
                  <p className="text-3xl font-bold text-green-700 mt-1">
                    R$ {(totalAFaturar + totalFaturado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Taxa de Inadimplência</p>
                  <p className={`text-2xl font-bold ${contasAtrasadas > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {columns.find(c => c.id === 'faturado')?.cards.length 
                      ? Math.round((contasAtrasadas / columns.find(c => c.id === 'faturado')!.cards.length) * 100)
                      : 0}%
                  </p>
                </div>
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
                      className={`flex-1 p-2 space-y-2 overflow-y-auto ${snapshot.isDraggingOver ? 'bg-green-50' : ''}`}
                    >
                      {column.cards.map((card, index) => {
                        const isOverdue = card.dueDate && differenceInDays(card.dueDate, new Date()) < 0 && card.status === 'faturado'

                        return (
                          <Draggable key={card.id} draggableId={card.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white rounded-lg p-3 shadow-sm border cursor-pointer transition-all hover:shadow-md ${
                                  snapshot.isDragging ? 'shadow-lg ring-2 ring-green-500' : ''
                                } ${isOverdue ? 'border-red-300 bg-red-50' : ''}`}
                              >
                                {/* Status Badge */}
                                <div className="flex items-center justify-between mb-2">
                                  {card.billingStatus && (
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                      card.billingStatus === 'atrasado' ? 'bg-red-100 text-red-700' :
                                      card.billingStatus === 'enviado' ? 'bg-blue-100 text-blue-700' :
                                      card.billingStatus === 'aguardando' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-gray-100 text-gray-700'
                                    }`}>
                                      {card.billingStatus === 'atrasado' ? 'Atrasado' :
                                       card.billingStatus === 'enviado' ? 'Enviado' :
                                       card.billingStatus === 'aguardando' ? 'Aguardando' :
                                       card.billingStatus}
                                    </span>
                                  )}
                                  {card.invoiceNumber && (
                                    <span className="text-xs text-gray-400">{card.invoiceNumber}</span>
                                  )}
                                </div>

                                {/* Client */}
                                <div className="flex items-center gap-2 mb-1">
                                  <Building2 className="w-4 h-4 text-gray-400" />
                                  <h4 className="font-medium text-gray-800 text-sm">{card.clientName}</h4>
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-1">{card.description}</p>

                                {/* Service Period */}
                                {card.servicePeriod && (
                                  <p className="text-xs text-gray-400 mt-1">Ref: {card.servicePeriod}</p>
                                )}

                                {/* Value */}
                                <div className="flex items-center justify-between mt-3">
                                  <span className="text-lg font-bold text-green-600">
                                    R$ {card.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </span>
                                </div>

                                {/* Due Date */}
                                {card.dueDate && (
                                  <div className={`flex items-center gap-1 mt-2 text-xs ${
                                    isOverdue ? 'text-red-600' :
                                    differenceInDays(card.dueDate, new Date()) <= 3 ? 'text-orange-600' :
                                    'text-gray-500'
                                  }`}>
                                    <Calendar className="w-3 h-3" />
                                    Venc: {format(card.dueDate, "dd/MM/yyyy", { locale: ptBR })}
                                    {isOverdue && ` (${Math.abs(differenceInDays(card.dueDate, new Date()))} dias atrasado)`}
                                  </div>
                                )}

                                {/* Received Info */}
                                {card.receivedDate && (
                                  <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Recebido: {format(card.receivedDate, "dd/MM", { locale: ptBR })}
                                    {card.paymentMethod && ` via ${card.paymentMethod}`}
                                  </div>
                                )}

                                {/* Services Tags */}
                                {card.services.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {card.services.slice(0, 2).map(service => (
                                      <span key={service} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                                        {service}
                                      </span>
                                    ))}
                                    {card.services.length > 2 && (
                                      <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                                        +{card.services.length - 2}
                                      </span>
                                    )}
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
                          className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-green-400 hover:text-green-500 transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span className="text-sm">Nova receita</span>
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
          cardTitle={transitionModal.card?.clientName || ''}
          existingData={{}}
          clients={[]}
          employees={[]}
        />
      )}

      {/* New Conta Modal */}
      <AnimatePresence>
        {isNewModalOpen && (
          <NewContaReceberModal
            isOpen={isNewModalOpen}
            onClose={() => setIsNewModalOpen(false)}
            onSubmit={handleCreateConta}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// New Conta Receber Modal Component
function NewContaReceberModal({
  isOpen,
  onClose,
  onSubmit
}: {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Partial<ContaReceber>) => void
}) {
  const [formData, setFormData] = useState({
    clientName: '',
    description: '',
    value: '',
    servicePeriod: '',
    services: [] as string[]
  })

  const serviceOptions = [
    { value: 'mensalidade', label: 'Mensalidade' },
    { value: 'projeto', label: 'Projeto' },
    { value: 'extra', label: 'Serviço Extra' },
    { value: 'consultoria', label: 'Consultoria' },
    { value: 'social_media', label: 'Social Media' },
    { value: 'trafego', label: 'Tráfego Pago' },
    { value: 'site', label: 'Site/Landing Page' },
    { value: 'design', label: 'Design' },
    { value: 'video', label: 'Vídeo' }
  ]

  const handleSubmit = () => {
    if (!formData.clientName || !formData.value) {
      alert('Preencha os campos obrigatórios')
      return
    }
    onSubmit({
      clientName: formData.clientName,
      description: formData.description,
      value: parseFloat(formData.value),
      servicePeriod: formData.servicePeriod,
      services: formData.services
    })
  }

  const toggleService = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }))
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
            <h2 className="text-lg font-bold text-gray-800">Nova Conta a Receber</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
              placeholder="Nome do cliente"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descrição da receita"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Período de Referência
              </label>
              <input
                type="text"
                value={formData.servicePeriod}
                onChange={(e) => setFormData(prev => ({ ...prev, servicePeriod: e.target.value }))}
                placeholder="Ex: Janeiro/2025"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Serviços</label>
            <div className="flex flex-wrap gap-2">
              {serviceOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleService(option.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    formData.services.includes(option.value)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
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
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Criar Receita
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

