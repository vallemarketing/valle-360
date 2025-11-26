'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Check, X, MessageSquare, Clock, Play, Image as ImageIcon, FileText, Download } from 'lucide-react'
import { toast } from 'sonner'

interface ApprovalItem {
  id: string
  title: string
  description: string
  type: 'video' | 'image' | 'document'
  url: string
  status: 'pending' | 'approved' | 'rejected'
  feedback?: string
}

export default function ClientApprovalPage({ params }: { params: { token: string } }) {
  const [items, setItems] = useState<ApprovalItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeItem, setActiveItem] = useState<ApprovalItem | null>(null)
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createClientComponentClient()

  useEffect(() => {
    // Mock simulando busca pelo token mágico
    // Na prática: supabase.from('approval_requests').select('*').eq('token', params.token)
    const mockItems: ApprovalItem[] = [
      {
        id: '1',
        title: 'Reels: Promoção de Natal',
        description: 'Vídeo curto para Instagram focado na campanha de fim de ano.',
        type: 'video',
        url: 'https://www.w3schools.com/html/mov_bbb.mp4', // Placeholder
        status: 'pending'
      },
      {
        id: '2',
        title: 'Post Estático: Feliz Ano Novo',
        description: 'Arte para feed com mensagem institucional.',
        type: 'image',
        url: 'https://via.placeholder.com/1080x1080',
        status: 'pending'
      }
    ]
    setItems(mockItems)
    setActiveItem(mockItems[0])
    setIsLoading(false)
  }, [])

  const handleAction = async (status: 'approved' | 'rejected') => {
    if (!activeItem) return
    if (status === 'rejected' && !feedback) {
      toast.error('Por favor, descreva o que precisa ser ajustado.')
      return
    }

    setIsSubmitting(true)
    // Simulação de update
    // await supabase.from('kanban_tasks').update({ status: ... }).eq('id', activeItem.taskId)
    
    const updatedItems = items.map(i => 
      i.id === activeItem.id ? { ...i, status, feedback: status === 'rejected' ? feedback : undefined } : i
    )
    setItems(updatedItems)
    
    toast.success(status === 'approved' ? 'Item aprovado!' : 'Solicitação de alteração enviada!')
    setIsSubmitting(false)
    setFeedback('')
    
    // Avançar para próximo item pendente
    const next = updatedItems.find(i => i.status === 'pending' && i.id !== activeItem.id)
    if (next) setActiveItem(next)
  }

  if (isLoading) return <div className="flex items-center justify-center h-screen bg-gray-50">Carregando...</div>

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
            V
          </div>
          <span className="font-semibold text-gray-900">Valle 360 | Aprovação de Criativos</span>
        </div>
        <div className="text-sm text-gray-500">
          {items.filter(i => i.status === 'approved').length} de {items.length} aprovados
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar Lista */}
        <aside className="w-80 bg-white border-r flex-shrink-0 overflow-y-auto hidden md:block">
          <div className="p-4 space-y-2">
            {items.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveItem(item)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  activeItem?.id === item.id 
                    ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-200' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-medium text-gray-500 uppercase">{item.type}</span>
                  {item.status === 'approved' && <Check className="w-4 h-4 text-green-500" />}
                  {item.status === 'rejected' && <X className="w-4 h-4 text-red-500" />}
                  {item.status === 'pending' && <Clock className="w-4 h-4 text-yellow-500" />}
                </div>
                <h4 className="font-medium text-gray-900 line-clamp-1">{item.title}</h4>
              </button>
            ))}
          </div>
        </aside>

        {/* Área Principal */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {activeItem ? (
            <>
              <div className="flex-1 p-8 overflow-y-auto flex items-center justify-center bg-gray-100">
                <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
                  {/* Preview */}
                  <div className="aspect-video bg-black flex items-center justify-center relative group">
                    {activeItem.type === 'video' ? (
                      <video src={activeItem.url} controls className="w-full h-full object-contain" />
                    ) : activeItem.type === 'image' ? (
                      <img src={activeItem.url} alt={activeItem.title} className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-white flex flex-col items-center gap-2">
                        <FileText className="w-12 h-12" />
                        <span>Pré-visualização não disponível para documentos</span>
                        <button className="mt-2 px-4 py-2 bg-white/20 rounded-full hover:bg-white/30 transition">
                          Baixar Arquivo
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Detalhes */}
                  <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{activeItem.title}</h2>
                    <p className="text-gray-600">{activeItem.description}</p>
                  </div>

                  {/* Ações */}
                  {activeItem.status === 'pending' ? (
                    <div className="p-6 bg-gray-50 space-y-4">
                      <div className="flex gap-4">
                        <button 
                          onClick={() => handleAction('approved')}
                          disabled={isSubmitting}
                          className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-sm"
                        >
                          <Check className="w-5 h-5" />
                          Aprovar Sem Alterações
                        </button>
                        <button 
                          onClick={() => document.getElementById('reject-area')?.classList.remove('hidden')}
                          className="px-6 bg-white border border-red-200 text-red-600 py-3 rounded-xl font-bold hover:bg-red-50 transition flex items-center gap-2"
                        >
                          <MessageSquare className="w-5 h-5" />
                          Solicitar Ajuste
                        </button>
                      </div>

                      <div id="reject-area" className="hidden animate-in fade-in slide-in-from-bottom-4">
                        <textarea
                          value={feedback}
                          onChange={e => setFeedback(e.target.value)}
                          placeholder="Descreva detalhadamente o que precisa ser alterado..."
                          className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-red-500 mb-3"
                          rows={4}
                        />
                        <button 
                          onClick={() => handleAction('rejected')}
                          disabled={isSubmitting}
                          className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition"
                        >
                          Enviar Solicitação de Alteração
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={`p-6 text-center font-medium ${
                      activeItem.status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {activeItem.status === 'approved' ? '✅ Aprovado em ' : '❌ Alteração solicitada em '} 
                      {new Date().toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Selecione um item para visualizar
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

