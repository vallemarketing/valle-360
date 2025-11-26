'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { FileSignature, CheckCircle, XCircle, Loader2, Calendar, Package } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface ProposalItem {
  id: string
  name: string
  price: number
}

interface Proposal {
  id: string
  client_name: string
  client_email: string
  total_value: number
  status: 'draft' | 'sent' | 'accepted' | 'rejected'
  items: ProposalItem[]
  created_at: string
}

export default function PublicProposalPage({ params }: { params: { token: string } }) {
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSigning, setIsSigning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchProposal = async () => {
      // Buscar proposta pelo token mágico
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .eq('magic_link_token', params.token)
        .single()

      if (error || !data) {
        setError('Proposta não encontrada ou link expirado.')
      } else {
        setProposal(data)
      }
      setIsLoading(false)
    }

    fetchProposal()
  }, [params.token])

  const handleSign = async () => {
    setIsSigning(true)
    try {
      const response = await fetch('/api/proposals/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: params.token })
      })

      const result = await response.json()

      if (!response.ok) throw new Error(result.error)

      toast.success('Contrato assinado com sucesso!')
      setProposal(prev => prev ? { ...prev, status: 'accepted' } : null)
    } catch (err: any) {
      toast.error('Erro ao assinar: ' + err.message)
    } finally {
      setIsSigning(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Ops!</h1>
        <p className="text-gray-600">{error || 'Algo deu errado.'}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
      >
        {/* Header */}
        <div className="bg-indigo-600 px-8 py-10 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <h1 className="text-3xl font-bold mb-2 relative z-10">Proposta Comercial</h1>
          <p className="text-indigo-100 relative z-10">Preparada especialmente para {proposal.client_name}</p>
        </div>

        <div className="p-8">
          {/* Status Banner */}
          {proposal.status === 'accepted' && (
            <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 text-green-800">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-bold">Proposta Aceita!</p>
                <p className="text-sm">O contrato foi gerado e a equipe já foi notificada.</p>
              </div>
            </div>
          )}

          {/* Detalhes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Cliente</h3>
              <p className="text-lg font-medium text-gray-900">{proposal.client_name}</p>
              <p className="text-gray-600">{proposal.client_email}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Data da Proposta</h3>
              <div className="flex items-center gap-2 text-gray-900">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span>{new Date(proposal.created_at).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>

          {/* Serviços */}
          <div className="mb-10">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Serviços Inclusos</h3>
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              {proposal.items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 border-b border-gray-200 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-gray-200 text-indigo-600">
                      <Package className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-gray-900">{item.name}</span>
                  </div>
                  <span className="font-medium text-gray-600">
                    R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
              <div className="p-4 bg-gray-100 flex justify-between items-center">
                <span className="font-bold text-gray-900">Valor Total Mensal</span>
                <span className="text-2xl font-bold text-indigo-600">
                  R$ {proposal.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Ação */}
          {proposal.status !== 'accepted' && (
            <div className="text-center pt-6 border-t border-gray-100">
              <p className="text-gray-500 mb-6 text-sm">
                Ao clicar em "Aceitar e Assinar", você concorda com os termos de serviço e inicia o contrato automaticamente.
              </p>
              <button
                onClick={handleSign}
                disabled={isSigning}
                className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white text-lg font-bold rounded-xl hover:bg-indigo-700 transform hover:scale-105 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isSigning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <FileSignature className="w-5 h-5" />
                    Aceitar e Assinar Digitalmente
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </motion.div>
      
      <div className="text-center mt-8 text-gray-400 text-sm">
        <p>© 2024 Valle 360. Todos os direitos reservados.</p>
      </div>
    </div>
  )
}

