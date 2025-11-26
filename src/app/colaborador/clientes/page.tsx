'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import {
  Search, Filter, User, Building2, TrendingUp, TrendingDown,
  Calendar, DollarSign, Activity, MessageCircle, BarChart3,
  Phone, Mail, MapPin, ExternalLink, ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Client {
  id: string
  name: string
  company: string
  logo: string
  plan: string
  status: 'active' | 'inactive' | 'at_risk'
  lastInteraction: Date
  revenue: number
  performance: {
    trend: 'up' | 'down' | 'stable'
    value: number
  }
  email: string
  phone: string
  location: string
}

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [userRole, setUserRole] = useState<string>('')

  useEffect(() => {
    loadClients()
    checkUserRole()
  }, [])

  const checkUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()
      
      if (profile) {
        setUserRole(profile.role)
      }
    }
  }

  const loadClients = async () => {
    try {
      // Mock data - integrar com banco depois
      const mockClients: Client[] = [
        {
          id: '1',
          name: 'João Silva',
          company: 'Tech Solutions',
          logo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=techsolutions',
          plan: 'Premium',
          status: 'active',
          lastInteraction: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          revenue: 12500,
          performance: {
            trend: 'up',
            value: 15
          },
          email: 'joao@techsolutions.com',
          phone: '(11) 99999-9999',
          location: 'São Paulo, SP'
        },
        {
          id: '2',
          name: 'Maria Santos',
          company: 'Marketing Pro',
          logo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marketingpro',
          plan: 'Business',
          status: 'active',
          lastInteraction: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          revenue: 8500,
          performance: {
            trend: 'stable',
            value: 0
          },
          email: 'maria@marketingpro.com',
          phone: '(11) 98888-8888',
          location: 'Rio de Janeiro, RJ'
        },
        {
          id: '3',
          name: 'Pedro Costa',
          company: 'E-commerce Plus',
          logo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ecommerceplus',
          plan: 'Premium',
          status: 'at_risk',
          lastInteraction: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          revenue: 15000,
          performance: {
            trend: 'down',
            value: -20
          },
          email: 'pedro@ecommerceplus.com',
          phone: '(11) 97777-7777',
          location: 'Campinas, SP'
        },
        {
          id: '4',
          name: 'Ana Lima',
          company: 'Consultoria Estratégica',
          logo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=consultoria',
          plan: 'Enterprise',
          status: 'active',
          lastInteraction: new Date(Date.now() - 3 * 60 * 60 * 1000),
          revenue: 25000,
          performance: {
            trend: 'up',
            value: 25
          },
          email: 'ana@consultoria.com',
          phone: '(11) 96666-6666',
          location: 'São Paulo, SP'
        }
      ]

      setClients(mockClients)
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || client.status === filterStatus

    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case 'active':
        return { bg: 'var(--success-50)', text: 'var(--success-700)', border: 'var(--success-200)' }
      case 'at_risk':
        return { bg: 'var(--warning-50)', text: 'var(--warning-700)', border: 'var(--warning-200)' }
      case 'inactive':
        return { bg: 'var(--text-tertiary)', text: 'var(--text-secondary)', border: 'var(--border-light)' }
    }
  }

  const getStatusLabel = (status: Client['status']) => {
    switch (status) {
      case 'active': return 'Ativo'
      case 'at_risk': return 'Em Risco'
      case 'inactive': return 'Inativo'
    }
  }

  // Verifica se deve mostrar dados financeiros
  const showFinancialData = ['admin', 'financeiro', 'super_admin'].includes(userRole);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: 'var(--primary-500)' }}></div>
          <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Carregando clientes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-73px)] p-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Meus Clientes
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Gerencie e acompanhe seus clientes atribuídos
          </p>
        </div>

        {/* Stats Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-${showFinancialData ? '4' : '3'} gap-4`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-6"
            style={{ backgroundColor: 'var(--bg-primary)', borderWidth: '1px', borderColor: 'var(--border-light)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Total de Clientes</span>
              <User className="w-5 h-5" style={{ color: 'var(--primary-500)' }} />
            </div>
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {clients.length}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl p-6"
            style={{ backgroundColor: 'var(--bg-primary)', borderWidth: '1px', borderColor: 'var(--border-light)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Ativos</span>
              <Activity className="w-5 h-5" style={{ color: 'var(--success-500)' }} />
            </div>
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {clients.filter(c => c.status === 'active').length}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl p-6"
            style={{ backgroundColor: 'var(--bg-primary)', borderWidth: '1px', borderColor: 'var(--border-light)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Em Risco</span>
              <TrendingDown className="w-5 h-5" style={{ color: 'var(--warning-500)' }} />
            </div>
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {clients.filter(c => c.status === 'at_risk').length}
            </p>
          </motion.div>

          {showFinancialData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl p-6"
              style={{ backgroundColor: 'var(--bg-primary)', borderWidth: '1px', borderColor: 'var(--border-light)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Receita Total</span>
                <DollarSign className="w-5 h-5" style={{ color: 'var(--success-500)' }} />
              </div>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                R$ {clients.reduce((acc, c) => acc + c.revenue, 0).toLocaleString('pt-BR')}
              </p>
            </motion.div>
          )}
        </div>

        {/* Filters */}
        <div 
          className="rounded-xl p-4"
          style={{ backgroundColor: 'var(--bg-primary)', borderWidth: '1px', borderColor: 'var(--border-light)' }}
        >
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome ou empresa..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-light)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativos</option>
              <option value="at_risk">Em Risco</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredClients.map((client, index) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl p-6 border hover:shadow-lg transition-all cursor-pointer group"
              style={{ 
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-light)'
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <img
                    src={client.logo}
                    alt={client.company}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                      {client.name}
                    </h3>
                    <p className="text-sm flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                      <Building2 className="w-4 h-4" />
                      {client.company}
                    </p>
                  </div>
                </div>

                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: getStatusColor(client.status).bg,
                    color: getStatusColor(client.status).text,
                    borderWidth: '1px',
                    borderColor: getStatusColor(client.status).border
                  }}
                >
                  {getStatusLabel(client.status)}
                </span>
              </div>

              {/* Info Grid */}
              <div className={`grid grid-cols-${showFinancialData ? '2' : '1'} gap-4 mb-4 pb-4 border-b`} style={{ borderColor: 'var(--border-light)' }}>
                <div>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Plano</p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{client.plan}</p>
                </div>
                {showFinancialData && (
                  <div>
                    <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Receita Mensal</p>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      R$ {client.revenue.toLocaleString('pt-BR')}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Última Interação</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {Math.floor((Date.now() - client.lastInteraction.getTime()) / (1000 * 60 * 60 * 24))}d atrás
                  </p>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>Performance</p>
                  <div className="flex items-center gap-1">
                    {client.performance.trend === 'up' && (
                      <>
                        <TrendingUp className="w-4 h-4" style={{ color: 'var(--success-500)' }} />
                        <span className="text-sm font-semibold" style={{ color: 'var(--success-600)' }}>
                          +{client.performance.value}%
                        </span>
                      </>
                    )}
                    {client.performance.trend === 'down' && (
                      <>
                        <TrendingDown className="w-4 h-4" style={{ color: 'var(--error-500)' }} />
                        <span className="text-sm font-semibold" style={{ color: 'var(--error-600)' }}>
                          {client.performance.value}%
                        </span>
                      </>
                    )}
                    {client.performance.trend === 'stable' && (
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Estável</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <Mail className="w-4 h-4" />
                  {client.email}
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <Phone className="w-4 h-4" />
                  {client.phone}
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <MapPin className="w-4 h-4" />
                  {client.location}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <button
                  className="flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all hover:scale-105"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                >
                  <MessageCircle className="w-4 h-4" />
                  Mensagem
                </button>
                <button
                  className="flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all hover:scale-105"
                  style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                >
                  <BarChart3 className="w-4 h-4" />
                  Relatório
                </button>
                <button
                  className="px-4 py-2 rounded-lg flex items-center justify-center transition-all hover:scale-105"
                  style={{ backgroundColor: 'var(--primary-50)', color: 'var(--primary-700)' }}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <User className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-tertiary)' }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Nenhum cliente encontrado
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Tente ajustar os filtros ou a busca
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
