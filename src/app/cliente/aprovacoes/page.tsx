'use client'

import { useState } from 'react'
import { Check, X, MessageSquare, Clock, ArrowRight, FileImage, ZoomIn } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Mock data
const approvals = [
  {
    id: 1,
    title: 'Post Instagram - Campanha Black Friday',
    type: 'Social Media',
    image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=500&q=80',
    designer: 'Ana Silva',
    date: '2025-11-22',
    status: 'pending'
  },
  {
    id: 2,
    title: 'Banner Site - Lançamento Coleção',
    type: 'Web Design',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&q=80',
    designer: 'Carlos Souza',
    date: '2025-11-21',
    status: 'pending'
  },
  {
    id: 3,
    title: 'Vídeo Institucional - Teaser',
    type: 'Videomaker',
    image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=500&q=80',
    designer: 'Pedro Video',
    date: '2025-11-23',
    status: 'pending'
  }
]

export default function ClientApprovals() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [comment, setComment] = useState('')
  const [isZoomed, setIsZoomed] = useState(false)

  const currentItem = approvals[currentIndex]

  const handleAction = (action: 'approve' | 'reject') => {
    // Aqui entraria a lógica de salvar no banco
    console.log(`${action} item ${currentItem.id} with comment: ${comment}`)
    
    if (currentIndex < approvals.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setComment('')
    } else {
      alert('Todas as aprovações foram processadas!')
    }
  }

  if (!currentItem) return (
    <div className="flex items-center justify-center h-full min-h-[400px] text-gray-500">
      Nenhum item pendente de aprovação.
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Galeria de Aprovações</h1>
        <p className="text-gray-500">Revise e aprove os materiais criados para você</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Preview Area */}
        <div className="relative group">
          <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-lg border border-gray-200 relative">
            {/* Badge Tipo */}
            <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold shadow-sm">
              {currentItem.type}
            </div>
            
            {/* Zoom Button */}
            <button 
              onClick={() => setIsZoomed(true)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ZoomIn className="w-4 h-4 text-gray-700" />
            </button>

            <img 
              src={currentItem.image} 
              alt={currentItem.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="mt-4 flex justify-center gap-2">
            {approvals.map((_, idx) => (
              <div 
                key={idx}
                className={`w-2 h-2 rounded-full transition-colors ${idx === currentIndex ? 'bg-blue-600' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </div>

        {/* Action Area */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{currentItem.title}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>Enviado em {new Date(currentItem.date).toLocaleDateString('pt-BR')}</span>
              <span>•</span>
              <span>Por {currentItem.designer}</span>
            </div>
          </div>

          {/* Comment Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentários ou Ajustes (Opcional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-50"
              placeholder="Ex: Alterar a cor do fundo para azul..."
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleAction('reject')}
              className="flex items-center justify-center gap-2 p-4 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors font-medium"
            >
              <X className="w-5 h-5" />
              Solicitar Ajustes
            </button>
            <button
              onClick={() => handleAction('approve')}
              className="flex items-center justify-center gap-2 p-4 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors font-medium shadow-md hover:shadow-lg"
            >
              <Check className="w-5 h-5" />
              Aprovar
            </button>
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsZoomed(false)}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              src={currentItem.image}
              alt={currentItem.title}
              className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

