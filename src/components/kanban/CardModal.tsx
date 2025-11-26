'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Calendar, User, Tag, Paperclip, MessageSquare, Clock,
  AlertCircle, Edit2, Trash2, Save, Upload, CheckSquare, FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCurrentUser } from '@/lib/auth'
import { toast } from 'sonner'

interface KanbanCard {
  id: string
  title: string
  description?: string
  column: string
  priority: 'urgent' | 'high' | 'normal' | 'low'
  assignees: string[]
  tags: string[]
  dueDate?: Date
  attachments: number
  comments: number
  createdAt: Date
  area?: string
}

interface CardModalProps {
  card: KanbanCard | null
  isOpen: boolean
  onClose: () => void
  onSave: (card: KanbanCard) => void
  onDelete: (cardId: string) => void
  isSuperAdmin?: boolean
}

export function CardModal({ card, isOpen, onClose, onSave, onDelete, isSuperAdmin }: CardModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedCard, setEditedCard] = useState<KanbanCard | null>(card)
  const [newComment, setNewComment] = useState('')
  const [userRole, setUserRole] = useState<string | null>(null)
  const [canDelete, setCanDelete] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  // Atualizar estado interno quando card muda
  useEffect(() => {
    setEditedCard(card)
  }, [card])

  useEffect(() => {
    const checkPermissions = async () => {
      const user = await getCurrentUser()
      if (user) {
        setUserRole(user.role)
        // Só super_admin pode deletar
        setCanDelete(user.role === 'super_admin' || !!isSuperAdmin)
      }
    }
    checkPermissions()
  }, [isSuperAdmin])

  if (!card || !editedCard) return null

  const priorityColors = {
    urgent: { bg: 'var(--error-50)', text: 'var(--error-700)', border: 'var(--error-200)' },
    high: { bg: 'var(--warning-50)', text: 'var(--warning-700)', border: 'var(--warning-200)' },
    normal: { bg: 'var(--info-50)', text: 'var(--info-700)', border: 'var(--info-200)' },
    low: { bg: 'var(--success-50)', text: 'var(--success-700)', border: 'var(--success-200)' }
  }

  // Lógica de validação para movimentação
  const validateMove = (targetColumn: string) => {
    // Regras de Negócio
    if (targetColumn === 'done') {
        // Exemplo: Para mover para Done, precisa ter anexo ou link se for tarefa de Design
        if (editedCard.area === 'Design' && editedCard.attachments === 0 && !editedCard.description?.includes('http')) {
            return 'Para concluir tarefas de Design, é obrigatório anexar o arquivo ou link do projeto.'
        }
    }
    
    if (targetColumn !== 'backlog' && !editedCard.description) {
        return 'É necessário preencher a descrição antes de iniciar a tarefa.'
    }

    return null
  }

  const handleSave = () => {
    if (!editedCard) return

    // Validar mudança de coluna
    if (editedCard.column !== card.column) {
        const error = validateMove(editedCard.column)
        if (error) {
            setValidationError(error)
            toast.error(error)
            return
        }
    }

    onSave(editedCard)
    setIsEditing(false)
    setValidationError(null)
  }

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      onDelete(card.id)
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden bg-white flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3 flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedCard.title}
                      onChange={(e) => setEditedCard({ ...editedCard, title: e.target.value })}
                      className="text-xl font-bold flex-1 px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  ) : (
                    <h2 className="text-xl font-bold text-gray-900">
                      {editedCard.title}
                    </h2>
                  )}
                  
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      editedCard.priority === 'urgent' ? 'bg-red-50 text-red-700 border-red-200' :
                      editedCard.priority === 'high' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      editedCard.priority === 'normal' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-green-50 text-green-700 border-green-200'
                  }`}>
                    {editedCard.priority === 'urgent' && '🔴 Urgente'}
                    {editedCard.priority === 'high' && '🟡 Alta'}
                    {editedCard.priority === 'normal' && '🔵 Normal'}
                    {editedCard.priority === 'low' && '🟢 Baixa'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="p-2 rounded-lg hover:bg-green-600 bg-green-500 text-white transition-all shadow-sm"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditedCard(card)
                          setIsEditing(false)
                          setValidationError(null)
                        }}
                        className="p-2 rounded-lg hover:bg-gray-200 bg-gray-100 text-gray-600 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="p-2 rounded-lg hover:bg-gray-200 bg-gray-100 text-gray-600 transition-all"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {canDelete ? (
                        <button
                          onClick={handleDelete}
                          className="p-2 rounded-lg hover:bg-red-600 bg-red-500 text-white transition-all shadow-sm"
                          title="Deletar (apenas super admin)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <div 
                          className="p-2 rounded-lg opacity-30 cursor-not-allowed bg-gray-100 text-gray-400"
                          title="Apenas super admin pode deletar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </div>
                      )}
                      <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-200 bg-gray-100 text-gray-600 transition-all"
                        title="Fechar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Validation Error Message */}
              {validationError && (
                <div className="bg-red-50 px-6 py-3 border-b border-red-100 flex items-center gap-2 text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {validationError}
                </div>
              )}

              {/* Body */}
              <div className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-3 gap-6 h-full">
                  {/* Left Column - Main Content */}
                  <div className="col-span-2 space-y-6">
                    {/* Description */}
                    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                        <FileText className="w-4 h-4 text-indigo-500" />
                        Descrição
                      </label>
                      {isEditing ? (
                        <textarea
                          value={editedCard.description || ''}
                          onChange={(e) => setEditedCard({ ...editedCard, description: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px] text-gray-700"
                          placeholder="Adicione uma descrição detalhada..."
                        />
                      ) : (
                        <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-wrap">
                          {editedCard.description || 'Sem descrição'}
                        </p>
                      )}
                    </div>

                    {/* Checklist (Mockup for Quality Gate) */}
                    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                            <CheckSquare className="w-4 h-4 text-green-500" />
                            Checklist de Qualidade
                        </label>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" />
                                <span className="text-sm text-gray-600">Briefing revisado</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" />
                                <span className="text-sm text-gray-600">Arquivos anexados</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" />
                                <span className="text-sm text-gray-600">Aprovado pelo gestor</span>
                            </div>
                        </div>
                    </div>

                    {/* Attachments */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                        <Paperclip className="w-4 h-4 text-gray-500" />
                        Anexos ({editedCard.attachments})
                      </label>
                      <button
                        className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-500 hover:bg-indigo-50 flex items-center justify-center gap-2 transition-all text-gray-500 hover:text-indigo-600"
                      >
                        <Upload className="w-4 h-4" />
                        <span className="text-sm">Adicionar anexo ou Link do Drive</span>
                      </button>
                    </div>

                    {/* Comments */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                        <MessageSquare className="w-4 h-4 text-gray-500" />
                        Comentários ({editedCard.comments})
                      </label>
                      
                      <div className="flex gap-2 mb-4">
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="Adicione um comentário..."
                        />
                        <button
                          onClick={() => {
                            if (newComment.trim()) {
                              setNewComment('')
                              toast.success('Comentário adicionado')
                            }
                          }}
                          className="px-4 py-2 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                        >
                          Enviar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Meta Info */}
                  <div className="space-y-6">
                    {/* Status */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase tracking-wider">
                        STATUS
                      </label>
                      {isEditing ? (
                        <select
                          value={editedCard.column}
                          onChange={(e) => setEditedCard({ ...editedCard, column: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="backlog">Backlog</option>
                          <option value="todo">A Fazer</option>
                          <option value="progress">Em Andamento</option>
                          <option value="review">Em Revisão</option>
                          <option value="testing">Em Teste</option>
                          <option value="done">Concluído</option>
                        </select>
                      ) : (
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                                editedCard.column === 'done' ? 'bg-green-500' : 
                                editedCard.column === 'progress' ? 'bg-blue-500' : 'bg-gray-400'
                            }`}></div>
                            <span className="text-sm font-medium text-gray-700 capitalize">
                                {editedCard.column}
                            </span>
                        </div>
                      )}
                    </div>

                    {/* Priority */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <label className="text-xs font-semibold text-gray-500 mb-2 block uppercase tracking-wider">
                        PRIORIDADE
                      </label>
                      {isEditing ? (
                        <select
                          value={editedCard.priority}
                          onChange={(e) => setEditedCard({ ...editedCard, priority: e.target.value as any })}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="urgent">🔴 Urgente</option>
                          <option value="high">🟡 Alta</option>
                          <option value="normal">🔵 Normal</option>
                          <option value="low">🟢 Baixa</option>
                        </select>
                      ) : (
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {editedCard.priority}
                        </span>
                      )}
                    </div>

                    {/* Due Date */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <label className="flex items-center gap-1 text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                        <Calendar className="w-3 h-3" />
                        PRAZO
                      </label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={editedCard.dueDate ? new Date(editedCard.dueDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => setEditedCard({ ...editedCard, dueDate: new Date(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        <span className={`text-sm font-medium ${
                            editedCard.dueDate && new Date(editedCard.dueDate) < new Date() ? 'text-red-600' : 'text-gray-700'
                        }`}>
                          {editedCard.dueDate ? new Date(editedCard.dueDate).toLocaleDateString('pt-BR') : 'Sem prazo'}
                        </span>
                      )}
                    </div>

                    {/* Assignees */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <label className="flex items-center gap-1 text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">
                        <User className="w-3 h-3" />
                        RESPONSÁVEIS
                      </label>
                      <div className="space-y-2">
                        {editedCard.assignees.map((assignee, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs text-indigo-700 font-bold">
                                {assignee.charAt(0)}
                            </div>
                            <span className="text-sm text-gray-700">{assignee}</span>
                          </div>
                        ))}
                        {isEditing && (
                            <button className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                                <User className="w-3 h-3" /> Adicionar
                            </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
