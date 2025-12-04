'use client'

import { useState } from 'react'
import { Check, X, MessageSquare, Clock, ZoomIn, ChevronDown, ChevronUp, Play } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// ============================================
// APROVAÇÕES - LAYOUT VERTICAL COMPACTO
// Cards empilhados com scroll, visualização completa no modal
// ============================================

interface Approval {
  id: number;
  title: string;
  type: string;
  image: string;
  isVideo?: boolean;
  designer: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  description?: string;
}

const approvals: Approval[] = [
  {
    id: 1,
    title: 'Post Instagram - Campanha Black Friday',
    type: 'Social Media',
    image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=500&q=80',
    designer: 'Ana Silva',
    date: '2025-11-22',
    status: 'pending',
    description: 'Post para feed do Instagram com promoção de Black Friday'
  },
  {
    id: 2,
    title: 'Banner Site - Lançamento Coleção',
    type: 'Web Design',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80',
    designer: 'Carlos Souza',
    date: '2025-11-21',
    status: 'pending',
    description: 'Banner principal do site para nova coleção'
  },
  {
    id: 3,
    title: 'Vídeo Institucional - Teaser',
    type: 'Videomaker',
    image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=500&q=80',
    isVideo: true,
    designer: 'Pedro Video',
    date: '2025-11-23',
    status: 'pending',
    description: 'Vídeo teaser de 30 segundos para redes sociais'
  },
  {
    id: 4,
    title: 'Stories Instagram - Promoção',
    type: 'Social Media',
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&q=80',
    designer: 'Ana Silva',
    date: '2025-11-24',
    status: 'pending',
    description: 'Sequência de 5 stories para promoção especial'
  },
  {
    id: 5,
    title: 'Post LinkedIn - Artigo',
    type: 'Social Media',
    image: 'https://images.unsplash.com/photo-1553484771-371a605b060b?w=500&q=80',
    designer: 'Maria Costa',
    date: '2025-11-25',
    status: 'pending',
    description: 'Post para LinkedIn sobre tendências do mercado'
  }
]

export default function ClientApprovals() {
  const [items, setItems] = useState(approvals)
  const [selectedItem, setSelectedItem] = useState<Approval | null>(null)
  const [comment, setComment] = useState('')
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const pendingItems = items.filter(item => item.status === 'pending')
  const completedItems = items.filter(item => item.status !== 'pending')

  const handleAction = (id: number, action: 'approve' | 'reject') => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, status: action === 'approve' ? 'approved' : 'rejected' } : item
    ))
    setSelectedItem(null)
    setComment('')
  }

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-[#001533] dark:text-white">Aprovações</h1>
        <p className="text-[#001533]/60 dark:text-white/60 mt-1">
          {pendingItems.length} itens aguardando sua aprovação
        </p>
      </header>

      {/* Lista de Aprovações Pendentes */}
      <div className="space-y-3">
        {pendingItems.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-[#001533]/50 rounded-xl border-2 border-[#001533]/10 dark:border-white/10">
            <div className="text-4xl mb-3">🎉</div>
            <p className="text-[#001533]/60 dark:text-white/60">
              Todas as aprovações foram processadas!
            </p>
          </div>
        ) : (
          pendingItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-[#001533]/50 rounded-xl border-2 border-[#001533]/10 dark:border-white/10 overflow-hidden"
            >
              {/* Card Header - Sempre visível */}
              <div 
                className="p-4 flex items-center gap-4 cursor-pointer hover:bg-[#001533]/5 dark:hover:bg-white/5 transition-colors"
                onClick={() => toggleExpand(item.id)}
              >
                {/* Thumbnail */}
                <div 
                  className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer group"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedItem(item)
                  }}
                >
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    {item.isVideo ? (
                      <Play className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                  {item.isVideo && (
                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                      0:30
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-[#001533] dark:text-white truncate">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs bg-[#1672d6]/10 text-[#1672d6]">
                          {item.type}
                        </Badge>
                        <span className="text-xs text-[#001533]/50 dark:text-white/50">
                          por {item.designer}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#001533]/50 dark:text-white/50 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </span>
                      {expandedId === item.id ? (
                        <ChevronUp className="w-5 h-5 text-[#001533]/40" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-[#001533]/40" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {expandedId === item.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-2 border-t border-[#001533]/10 dark:border-white/10">
                      {item.description && (
                        <p className="text-sm text-[#001533]/70 dark:text-white/70 mb-4">
                          {item.description}
                        </p>
                      )}
                      
                      {/* Comment Input */}
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={2}
                        className="w-full p-3 text-sm border-2 border-[#001533]/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#1672d6] focus:border-transparent resize-none bg-[#001533]/5 dark:bg-white/5 text-[#001533] dark:text-white placeholder:text-[#001533]/40"
                        placeholder="Comentários ou ajustes necessários..."
                      />

                      {/* Action Buttons */}
                      <div className="flex gap-3 mt-3">
                        <Button
                          onClick={() => handleAction(item.id, 'reject')}
                          variant="outline"
                          className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Solicitar Ajustes
                        </Button>
                        <Button
                          onClick={() => handleAction(item.id, 'approve')}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Aprovar
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>

      {/* Histórico de Aprovações */}
      {completedItems.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-[#001533] dark:text-white mb-4">
            Histórico Recente
          </h2>
          <div className="space-y-2">
            {completedItems.slice(0, 5).map((item) => (
              <div 
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-[#001533]/5 dark:bg-white/5"
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#001533] dark:text-white truncate">{item.title}</p>
                  <p className="text-xs text-[#001533]/50 dark:text-white/50">{item.designer}</p>
                </div>
                <Badge className={cn(
                  "text-xs",
                  item.status === 'approved' ? "bg-emerald-500/10 text-emerald-600" : "bg-orange-500/10 text-orange-600"
                )}>
                  {item.status === 'approved' ? 'Aprovado' : 'Ajustes'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Visualização Completa */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full bg-white dark:bg-[#0a0f1a] rounded-2xl overflow-hidden"
            >
              {/* Close button */}
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="aspect-video relative">
                <img 
                  src={selectedItem.image} 
                  alt={selectedItem.title}
                  className="w-full h-full object-contain bg-black"
                />
                {selectedItem.isVideo && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                      <Play className="w-10 h-10 text-white ml-1" />
                    </div>
                  </div>
                )}
              </div>

              {/* Info & Actions */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-[#001533] dark:text-white">{selectedItem.title}</h2>
                    <p className="text-[#001533]/60 dark:text-white/60 mt-1">{selectedItem.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-sm text-[#001533]/50 dark:text-white/50">
                      <span>{selectedItem.type}</span>
                      <span>•</span>
                      <span>{selectedItem.designer}</span>
                      <span>•</span>
                      <span>{new Date(selectedItem.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>

                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={2}
                  className="w-full p-3 text-sm border-2 border-[#001533]/10 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-[#1672d6] focus:border-transparent resize-none bg-[#001533]/5 dark:bg-white/5 text-[#001533] dark:text-white placeholder:text-[#001533]/40 mb-4"
                  placeholder="Comentários ou ajustes necessários..."
                />

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleAction(selectedItem.id, 'reject')}
                    variant="outline"
                    size="lg"
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Solicitar Ajustes
                  </Button>
                  <Button
                    onClick={() => handleAction(selectedItem.id, 'approve')}
                    size="lg"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Aprovar
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
