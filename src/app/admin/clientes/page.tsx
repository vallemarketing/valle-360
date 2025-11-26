'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Filter, MoreVertical, Mail, Phone, Globe, MapPin, TrendingUp, Calendar } from 'lucide-react'
import Link from 'next/link'

interface Client {
  id: string
  companyName: string
  contactName: string
  email: string
  phone: string
  industry: string
  status: 'active' | 'inactive' | 'pending'
  monthlyValue: number
  startDate: string
  avatar: string
}

export default function ClientsListPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'pending'>('all')

  // Mock data - será substituído por dados reais do Supabase
  const [clients] = useState<Client[]>([
    {
      id: '1',
      companyName: 'Valle Store',
      contactName: 'João Silva',
      email: 'joao@vallestore.com.br',
      phone: '(11) 98765-4321',
      industry: 'E-commerce',
      status: 'active',
      monthlyValue: 8500,
      startDate: '2024-01-15',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Valle+Store'
    },
    {
      id: '2',
      companyName: 'Tech Solutions Ltda',
      contactName: 'Maria Santos',
      email: 'maria@techsolutions.com',
      phone: '(11) 97654-3210',
      industry: 'Tecnologia',
      status: 'active',
      monthlyValue: 12000,
      startDate: '2023-11-20',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Tech+Solutions'
    },
    {
      id: '3',
      companyName: 'Valle Boutique',
      contactName: 'Ana Costa',
      email: 'ana@valleboutique.com.br',
      phone: '(11) 96543-2109',
      industry: 'Moda',
      status: 'active',
      monthlyValue: 5500,
      startDate: '2024-02-01',
      avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Valle+Boutique'
    }
  ])

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || client.status === filterStatus

    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    const colors = {
      active: { bg: 'var(--success-50)', text: 'var(--success-700)', label: 'Ativo' },
      inactive: { bg: 'var(--error-50)', text: 'var(--error-700)', label: 'Inativo' },
      pending: { bg: 'var(--warning-50)', text: 'var(--warning-700)', label: 'Pendente' }
    }
    return colors[status as keyof typeof colors]
  }

  const totalMonthlyRevenue = filteredClients.reduce((sum, client) => sum + client.monthlyValue, 0)

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Clientes
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Gerencie todos os clientes da Valle 360
            </p>
          </div>

          <Link href="/admin/clientes/novo">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white shadow-md"
              style={{ backgroundColor: 'var(--primary-500)' }}
            >
              <Plus className="w-5 h-5" />
              Novo Cliente
            </motion.button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-6 shadow-sm border"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-light)'
            }}
          >
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Total de Clientes
            </p>
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {filteredClients.length}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl p-6 shadow-sm border"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-light)'
            }}
          >
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Receita Mensal Total
            </p>
            <p className="text-3xl font-bold" style={{ color: 'var(--success-600)' }}>
              R$ {(totalMonthlyRevenue / 1000).toFixed(1)}k
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl p-6 shadow-sm border"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-light)'
            }}
          >
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Clientes Ativos
            </p>
            <p className="text-3xl font-bold" style={{ color: 'var(--primary-500)' }}>
              {clients.filter(c => c.status === 'active').length}
            </p>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: 'var(--text-tertiary)' }}
            />
            <input
              type="text"
              placeholder="Buscar por nome, contato ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-light)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
            <option value="pending">Pendentes</option>
          </select>
        </div>

        {/* Clients List */}
        <div className="space-y-4">
          {filteredClients.map((client, index) => {
            const statusInfo = getStatusColor(client.status)
            return (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl p-6 shadow-sm border hover:shadow-md transition-all"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-light)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <img
                      src={client.avatar}
                      alt={client.companyName}
                      className="w-16 h-16 rounded-lg"
                    />

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                          {client.companyName}
                        </h3>
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: statusInfo.bg,
                            color: statusInfo.text
                          }}
                        >
                          {statusInfo.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                        <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                          <Mail className="w-4 h-4" />
                          <span>{client.email}</span>
                        </div>
                        <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                          <Phone className="w-4 h-4" />
                          <span>{client.phone}</span>
                        </div>
                        <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                          <Globe className="w-4 h-4" />
                          <span>{client.industry}</span>
                        </div>
                        <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                          <TrendingUp className="w-4 h-4" />
                          <span className="font-semibold" style={{ color: 'var(--success-600)' }}>
                            R$ {client.monthlyValue.toLocaleString('pt-BR')} /mês
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link href={`/admin/clientes/${client.id}`}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 rounded-lg font-medium text-sm"
                        style={{
                          backgroundColor: 'var(--primary-50)',
                          color: 'var(--primary-600)'
                        }}
                      >
                        Ver Detalhes
                      </motion.button>
                    </Link>

                    <button
                      className="p-2 rounded-lg hover:bg-opacity-50"
                      style={{ backgroundColor: 'var(--bg-tertiary)' }}
                    >
                      <MoreVertical className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Nenhum cliente encontrado
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
