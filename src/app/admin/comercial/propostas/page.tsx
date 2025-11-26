'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Search, FileText, Plus, Send, Link as LinkIcon, Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'

interface Service {
  id: string
  name: string
  base_price: number
  deliverables: any
}

interface Proposal {
  id: string
  client_name: string
  client_email: string
  total_value: number
  status: string
  magic_link_token: string
  created_at: string
}

export default function ProposalGeneratorPage() {
  const [services, setServices] = useState<Service[]>([])
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [selectedServices, setSelectedServices] = useState<Service[]>([])
  const [clientData, setClientData] = useState({ name: '', email: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    const [servicesRes, proposalsRes] = await Promise.all([
      supabase.from('services').select('*').eq('active', true),
      supabase.from('proposals').select('*').order('created_at', { ascending: false })
    ])

    if (servicesRes.data) setServices(servicesRes.data)
    if (proposalsRes.data) setProposals(proposalsRes.data)
    setIsLoading(false)
  }

  const toggleService = (service: Service) => {
    if (selectedServices.find(s => s.id === service.id)) {
      setSelectedServices(selectedServices.filter(s => s.id !== service.id))
    } else {
      setSelectedServices([...selectedServices, service])
    }
  }

  const calculateTotal = () => {
    return selectedServices.reduce((acc, curr) => acc + curr.base_price, 0)
  }

  const generateProposal = async () => {
    if (!clientData.name || !clientData.email || selectedServices.length === 0) {
      toast.error('Preencha os dados do cliente e selecione serviços')
      return
    }

    setIsGenerating(true)
    const magicLinkToken = Math.random().toString(36).substring(2) + Date.now().toString(36)
    
    const proposalData = {
      client_name: clientData.name,
      client_email: clientData.email,
      total_value: calculateTotal(),
      status: 'draft',
      items: selectedServices.map(s => ({ id: s.id, name: s.name, price: s.base_price })),
      magic_link_token: magicLinkToken
    }

    const { error } = await supabase.from('proposals').insert(proposalData)

    if (error) {
      toast.error('Erro ao gerar proposta')
    } else {
      toast.success('Proposta Gerada!')
      setClientData({ name: '', email: '' })
      setSelectedServices([])
      loadData()
    }
    setIsGenerating(false)
  }

  const copyLink = (token: string) => {
    const link = `${window.location.origin}/proposta/${token}`
    navigator.clipboard.writeText(link)
    toast.success('Link copiado!')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna da Esquerda: Gerador */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Nova Proposta Comercial
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente / Empresa</label>
                <input 
                  value={clientData.name}
                  onChange={e => setClientData({...clientData, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nome do Cliente"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email de Contato</label>
                <input 
                  value={clientData.email}
                  onChange={e => setClientData({...clientData, email: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="email@cliente.com"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Selecione os Serviços</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {services.map(service => {
                  const isSelected = !!selectedServices.find(s => s.id === service.id)
                  return (
                    <div 
                      key={service.id}
                      onClick={() => toggleService(service)}
                      className={`cursor-pointer p-3 rounded-lg border transition-all flex items-center justify-between ${
                        isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <div>
                        <p className="font-medium text-sm">{service.name}</p>
                        <p className="text-xs text-gray-500">R$ {service.base_price.toLocaleString('pt-BR')}</p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="text-sm text-gray-500">Valor Total Mensal</p>
                <p className="text-2xl font-bold text-indigo-600">
                  R$ {calculateTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <button
                onClick={generateProposal}
                disabled={isGenerating}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Gerar Link da Proposta
              </button>
            </div>
          </div>
        </div>

        {/* Coluna da Direita: Histórico */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
          <h3 className="font-bold text-gray-900 mb-4">Últimas Propostas</h3>
          <div className="space-y-4">
            {proposals.map(prop => (
              <div key={prop.id} className="p-4 rounded-lg border border-gray-100 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-medium text-gray-900">{prop.client_name}</p>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    prop.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {prop.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  R$ {prop.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <button 
                  onClick={() => copyLink(prop.magic_link_token)}
                  className="w-full py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1"
                >
                  <LinkIcon className="w-3 h-3" />
                  Copiar Link
                </button>
              </div>
            ))}
            {proposals.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Nenhuma proposta gerada ainda.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

