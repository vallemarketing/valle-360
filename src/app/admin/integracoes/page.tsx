'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { CreditCard, MessageSquare, FileSignature, Key, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface Integration {
  id: string
  provider: string
  name: string
  api_key: string
  webhook_secret: string
  active: boolean
  last_sync: string
}

export default function IntegrationsHubPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Usaremos localStorage por enquanto para simular persistência segura de keys
  // Em produção, isso deve ir para uma tabela segura ou vault
  useEffect(() => {
    const mockIntegrations = [
      { id: 'stripe', provider: 'payment', name: 'Stripe', api_key: '', webhook_secret: '', active: false, last_sync: '-' },
      { id: 'asaas', provider: 'payment', name: 'ASAAS', api_key: '', webhook_secret: '', active: false, last_sync: '-' },
      { id: 'whatsapp', provider: 'communication', name: 'Z-API (WhatsApp)', api_key: '', webhook_secret: '', active: false, last_sync: '-' },
      { id: 'clicksign', provider: 'signature', name: 'ClickSign', api_key: '', webhook_secret: '', active: false, last_sync: '-' }
    ]
    
    const saved = localStorage.getItem('valle360_integrations')
    if (saved) {
      setIntegrations(JSON.parse(saved))
    } else {
      setIntegrations(mockIntegrations)
    }
    setIsLoading(false)
  }, [])

  const handleSave = (id: string, data: Partial<Integration>) => {
    const updated = integrations.map(int => 
      int.id === id ? { ...int, ...data, last_sync: new Date().toISOString() } : int
    )
    setIntegrations(updated)
    localStorage.setItem('valle360_integrations', JSON.stringify(updated))
    toast.success('Configuração salva com sucesso!')
    setEditingId(null)
  }

  const getIcon = (provider: string) => {
    switch (provider) {
      case 'payment': return <CreditCard className="w-6 h-6 text-blue-600" />
      case 'communication': return <MessageSquare className="w-6 h-6 text-green-600" />
      case 'signature': return <FileSignature className="w-6 h-6 text-orange-600" />
      default: return <Key className="w-6 h-6 text-gray-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Hub de Integrações</h1>
          <p className="text-gray-500">Conecte o Valle 360 ao ecossistema externo.</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {integrations.map((integration) => (
            <div key={integration.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {getIcon(integration.provider)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{integration.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className={`w-2 h-2 rounded-full ${integration.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                      {integration.active ? 'Ativo' : 'Inativo'}
                      <span className="mx-1">•</span>
                      Última sincronização: {integration.last_sync === '-' ? '-' : new Date(integration.last_sync).toLocaleString()}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setEditingId(editingId === integration.id ? null : integration.id)}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100"
                >
                  {editingId === integration.id ? 'Fechar' : 'Configurar'}
                </button>
              </div>

              {editingId === integration.id && (
                <div className="border-t pt-6 space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">API Key (Produção)</label>
                    <div className="flex gap-2">
                      <input 
                        type="password" 
                        defaultValue={integration.api_key}
                        onChange={(e) => {
                          const newInts = [...integrations]
                          const idx = newInts.findIndex(i => i.id === integration.id)
                          newInts[idx].api_key = e.target.value
                          setIntegrations(newInts)
                        }}
                        className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                        placeholder="sk_live_..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Webhook Secret</label>
                    <input 
                      type="password" 
                      defaultValue={integration.webhook_secret}
                      onChange={(e) => {
                        const newInts = [...integrations]
                        const idx = newInts.findIndex(i => i.id === integration.id)
                        newInts[idx].webhook_secret = e.target.value
                        setIntegrations(newInts)
                      }}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                      placeholder="whsec_..."
                    />
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={integration.active}
                        onChange={(e) => handleSave(integration.id, { active: e.target.checked })}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">Ativar Integração</span>
                    </label>
                    
                    <div className="flex-1" />
                    
                    <button 
                      onClick={() => handleSave(integration.id, {})}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
                    >
                      Salvar Alterações
                    </button>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-2 text-sm text-yellow-800">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>
                      Lembre-se de configurar o webhook na plataforma {integration.name} apontando para: 
                      <br/>
                      <code className="bg-yellow-100 px-1 rounded mt-1 inline-block">
                        https://api.valle360.com/webhooks/{integration.id}
                      </code>
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

