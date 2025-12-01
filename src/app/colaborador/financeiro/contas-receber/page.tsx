'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import {
  Plus, Search, X, Calendar, Building2, DollarSign, 
  AlertCircle, Receipt, FileText, Banknote, Archive,
  TrendingUp, Wallet, Filter, Send, CheckCircle2, Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, differenceInDays, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

interface ContaReceber {
  id: string
  clientId: string
  clientName: string
  service: string
  value: number
  referenceMonth: string
  description?: string
  invoiceNumber?: string
  invoiceDate?: Date
  dueDate?: Date
  invoiceLink?: string
  billingStatus?: 'sent' | 'viewed' | 'reminded'
  receivedAt?: Date
  receivedValue?: number
  paymentMethod?: string
  createdAt: Date
}

interface Column {
  id: string
  title: string
  color: string
  icon: any
  cards: ContaReceber[]
}

const BILLING_STATUS = {
  sent: { label: 'Enviado', color: 'bg-blue-100 text-blue-700' },
  viewed: { label: 'Visualizado', color: 'bg-purple-100 text-purple-700' },
  reminded: { label: 'Lembrete Enviado', color: 'bg-orange-100 text-orange-700' }
}

const PAYMENT_METHODS = [
  { value: 'pix', label: 'PIX' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'transferencia', label: 'Transferência' },
  { value: 'cartao', label: 'Cartão' }
]

const INITIAL_COLUMNS: Column[] = [
  { id: 'a_faturar', title: 'A Faturar', color: '#8b5cf6', icon: FileText, cards: [] },
  { id: 'faturado', title: 'Faturado', color: '#06b6d4', icon: Send, cards: [] },
  { id: 'recebido', title: 'Recebido', color: '#10b981', icon: Banknote, cards: [] },
  { id: 'arquivado', title: 'Arquivado', color: '#6b7280', icon: Archive, cards: [] }
]

export default function ContasReceberPage() {
  const [columns, setColumns] = useState<Column[]>(INITIAL_COLUMNS)
  const [searchTerm, setSearchTerm] = useState('')
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<ContaReceber | null>(null)
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Carregar clientes
      const { data: clientsData } = await supabase
        .from('clients')
        .select('id, name')
        .eq('status', 'active')
      
      if (clientsData) {
        setClients(clientsData)
      }

      // Mock data
      const mockData: ContaReceber[] = [
        {
          id: '1',
          clientId: '1',
          clientName: 'Tech Solutions',
          service: 'Gestão de Redes Sociais',
          value: 3500,
          referenceMonth: 'Dezembro/2024',
          createdAt: new Date()
        },
        {
          id: '2',
          clientId: '2',
          clientName: 'E-commerce Plus',
          service: 'Tráfego Pago + Social Media',
          value: 8500,
          referenceMonth: 'Dezembro/2024',
          createdAt: new Date()
        },
        {
          id: '3',
          clientId: '3',
          clientName: 'Startup XYZ',
          service: 'Criação de Site',
          value: 12000,
          referenceMonth: 'Dezembro/2024',
          invoiceNumber: 'NF-2024-0145',
          invoiceDate: new Date(),
          dueDate: addDays(new Date(), 15),
          billingStatus: 'sent',
          createdAt: new Date()
        },
        {
          id: '4',
          clientId: '4',
          clientName: 'Fashion Store',
          service: 'Gestão de Redes Sociais',
          value: 2800,
          referenceMonth: 'Novembro/2024',
          invoiceNumber: 'NF-2024-0140',
          invoiceDate: addDays(new Date(), -30),
          dueDate: addDays(new Date(), -5),
          receivedAt: addDays(new Date(), -3),
          receivedValue: 2800,
          paymentMethod: 'pix',
          createdAt: new Date()
        }
      ]

      const newColumns = INITIAL_COLUMNS.map(col => ({
        ...col,
        cards: col.id === 'a_faturar' ? mockData.slice(0, 2) :
               col.id === 'faturado' ? mockData.slice(2, 3) :
               col.id === 'recebido' ? mockData.slice(3) : []
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

  const handleCreateCard = (data: Partial<ContaReceber>) => {
    const client = clients.find(c => c.id === data.clientId)
    
    const newCard: ContaReceber = {
      id: Date.now().toString(),
      clientId: data.clientId || '',
      clientName: client?.name || '',
      service: data.service || '',
      value: data.value || 0,
      referenceMonth: data.referenceMonth || '',
      description: data.description,
      createdAt: new Date()
    }

    setColumns(cols => cols.map(col => {
      if (col.id === 'a_faturar') {
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
      return card.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             card.service.toLowerCase().includes(searchTerm.toLowerCase())
    })
  }))

  // Cálculos
  const totalAFaturar = columns.find(c => c.id === 'a_faturar')?.cards.reduce((sum, c) => sum + c.value, 0) || 0
  const totalFaturado = columns.find(c => c.id === 'faturado')?.cards.reduce((sum, c) => sum + c.value, 0) || 0
  const totalRecebido = columns.find(c => c.id === 'recebido')?.cards.reduce((sum, c) => sum + (c.receivedValue || c.value), 0) || 0
  const vencidosCount = columns.find(c => c.id === 'faturado')?.cards.filter(c => c.dueDate && differenceInDays(c.dueDate, new Date()) < 0).length || 0

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
      <div className="bg-white border-b px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Contas a Receber</h1>
                <p className="text-sm text-gray-500">Gerencie suas receitas</p>
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
                className="pl-9 pr-4 py-2 border rounded-lg text-sm w-48 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <button
              onClick={() => setIsNewModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nova Conta
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
            <p className="text-xs text-purple-600 font-medium">A Faturar</p>
            <p className="text-xl font-bold text-purple-700">
              R$ {totalAFaturar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-cyan-50 rounded-xl p-3 border border-cyan-100">
            <p className="text-xs text-cyan-600 font-medium">Faturado</p>
            <p className="text-xl font-bold text-cyan-700">
              R$ {totalFaturado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            {vencidosCount > 0 && (
              <p className="text-xs text-orange-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" />
                {vencidosCount} vencido(s)
              </p>
            )}
          </div>
          <div className="bg-green-50 rounded-xl p-3 border border-green-100">
            <p className="text-xs text-green-600 font-medium">Recebido (Mês)</p>
            <p className="text-xl font-bold text-green-700">
              R$ {totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
            <p className="text-xs text-blue-600 font-medium">Total Previsto</p>
            <p className="text-xl font-bold text-blue-700">
              R$ {(totalAFaturar + totalFaturado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                          snapshot.isDraggingOver && "bg-green-50"
                        )}
                        style={{ maxHeight: 'calc(100vh - 350px)' }}
                      >
                        {column.cards.map((card, index) => {
                          const isOverdue = card.dueDate && differenceInDays(card.dueDate, new Date()) < 0 && column.id === 'faturado'
                          const daysUntilDue = card.dueDate ? differenceInDays(card.dueDate, new Date()) : null

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
                                    isOverdue && "border-orange-300 bg-orange-50",
                                    snapshot.isDragging && "shadow-lg ring-2 ring-green-500"
                                  )}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                      <Building2 className="w-3 h-3" />
                                      <span className="truncate">{card.clientName}</span>
                                    </div>
                                    {card.billingStatus && (
                                      <span className={cn(
                                        "text-xs px-2 py-0.5 rounded",
                                        BILLING_STATUS[card.billingStatus].color
                                      )}>
                                        {BILLING_STATUS[card.billingStatus].label}
                                      </span>
                                    )}
                                  </div>

                                  <h4 className="font-medium text-gray-800">{card.service}</h4>
                                  <p className="text-xs text-gray-500">{card.referenceMonth}</p>

                                  <div className="flex items-center justify-between mt-3">
                                    <span className="text-lg font-bold text-green-600">
                                      R$ {card.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                    {card.dueDate && (
                                      <div className={cn(
                                        "flex items-center gap-1 text-xs",
                                        isOverdue ? "text-red-600" :
                                        daysUntilDue !== null && daysUntilDue <= 3 ? "text-orange-600" :
                                        "text-gray-500"
                                      )}>
                                        <Calendar className="w-3 h-3" />
                                        {format(card.dueDate, "dd/MM", { locale: ptBR })}
                                      </div>
                                    )}
                                  </div>

                                  {card.invoiceNumber && (
                                    <div className="mt-2 pt-2 border-t text-xs text-gray-400">
                                      NF: {card.invoiceNumber}
                                    </div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          )
                        })}
                        {provided.placeholder}

                        {column.id === 'a_faturar' && (
                          <button
                            onClick={() => setIsNewModalOpen(true)}
                            className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-green-400 hover:text-green-500 transition-colors flex items-center justify-center gap-2"
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
            clients={clients}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function NewContaModal({
  onClose,
  onSubmit,
  clients
}: {
  onClose: () => void
  onSubmit: (data: Partial<ContaReceber>) => void
  clients: Array<{ id: string; name: string }>
}) {
  const [formData, setFormData] = useState({
    clientId: '',
    service: '',
    value: '',
    referenceMonth: '',
    description: ''
  })

  const handleSubmit = () => {
    if (!formData.clientId || !formData.service || !formData.value) {
      toast.error('Preencha os campos obrigatórios')
      return
    }
    onSubmit({
      ...formData,
      value: parseFloat(formData.value)
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
            <select
              value={formData.clientId}
              onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Selecione o cliente...</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Serviço <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.service}
              onChange={(e) => setFormData(prev => ({ ...prev, service: e.target.value }))}
              placeholder="Ex: Gestão de Redes Sociais"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mês Referência</label>
              <input
                type="text"
                value={formData.referenceMonth}
                onChange={(e) => setFormData(prev => ({ ...prev, referenceMonth: e.target.value }))}
                placeholder="Dezembro/2024"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Observações..."
              rows={2}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
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
            Criar Conta
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
