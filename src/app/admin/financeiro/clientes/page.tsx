'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { DollarSign, TrendingUp, AlertTriangle, Calendar, CheckCircle, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface ClientFinancial {
  id: string
  name: string
  contract_value: number
  status: 'active' | 'inactive'
  payment_status: 'ok' | 'late' | 'pending'
  next_billing: string
  health_score: number
}

export default function FinancialClientsDashboard() {
  const [clients, setClients] = useState<ClientFinancial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [metrics, setMetrics] = useState({
    mrr: 0,
    late_total: 0,
    active_contracts: 0,
    avg_ticket: 0
  })

  const supabase = createClientComponentClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    // Simulação de dados reais vindos das tabelas novas
    // Na prática, faria um join entre clients, contracts e payments
    
    // Mock temporário para visualização
    const mockClients: ClientFinancial[] = [
      { id: '1', name: 'Restaurante Sabor & Arte', contract_value: 2500, status: 'active', payment_status: 'ok', next_billing: '2025-12-05', health_score: 95 },
      { id: '2', name: 'Clínica Sorriso Perfeito', contract_value: 4000, status: 'active', payment_status: 'late', next_billing: '2025-11-20', health_score: 60 },
      { id: '3', name: 'Advocacia Silva', contract_value: 1800, status: 'active', payment_status: 'pending', next_billing: '2025-12-01', health_score: 85 },
      { id: '4', name: 'Academia FitLife', contract_value: 3200, status: 'active', payment_status: 'ok', next_billing: '2025-12-10', health_score: 90 },
    ]

    setClients(mockClients)
    
    // Calcular métricas
    const mrr = mockClients.reduce((acc, c) => acc + c.contract_value, 0)
    const late = mockClients.filter(c => c.payment_status === 'late').reduce((acc, c) => acc + c.contract_value, 0)
    
    setMetrics({
      mrr,
      late_total: late,
      active_contracts: mockClients.length,
      avg_ticket: mrr / mockClients.length
    })

    setIsLoading(false)
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão Financeira de Clientes</h1>
            <p className="text-gray-500">Visão consolidada de contratos e inadimplência.</p>
          </div>
          <div className="text-sm text-gray-400">
            Atualizado em {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricCard 
            title="MRR (Receita Recorrente)" 
            value={`R$ ${metrics.mrr.toLocaleString('pt-BR')}`} 
            icon={<DollarSign className="w-6 h-6 text-green-600" />}
            trend="+12% vs mês anterior"
            color="green"
          />
          <MetricCard 
            title="Inadimplência Atual" 
            value={`R$ ${metrics.late_total.toLocaleString('pt-BR')}`} 
            icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
            trend="2 clientes atrasados"
            color="red"
          />
          <MetricCard 
            title="Contratos Ativos" 
            value={metrics.active_contracts.toString()} 
            icon={<CheckCircle className="w-6 h-6 text-blue-600" />}
            trend="Estável"
            color="blue"
          />
          <MetricCard 
            title="Ticket Médio" 
            value={`R$ ${metrics.avg_ticket.toLocaleString('pt-BR')}`} 
            icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
            trend="+5% vs mês anterior"
            color="purple"
          />
        </div>

        {/* Tabela Mestra */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">Carteira de Clientes</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm border rounded hover:bg-gray-50">Exportar CSV</button>
              <button className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700">Novo Contrato</button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Valor Mensal</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status Pagamento</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Próximo Vencimento</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Saúde (Score)</th>
                  <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr><td colSpan={6} className="text-center py-8">Carregando...</td></tr>
                ) : clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-900">{client.name}</td>
                    <td className="py-4 px-6 text-gray-600">R$ {client.contract_value.toLocaleString('pt-BR')}</td>
                    <td className="py-4 px-6">
                      <StatusBadge status={client.payment_status} />
                    </td>
                    <td className="py-4 px-6 text-gray-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(client.next_billing).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-4 px-6">
                      <HealthBar score={client.health_score} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Detalhes</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}

function MetricCard({ title, value, icon, trend, color }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white p-6 rounded-xl shadow-sm border-l-4 border-${color}-500`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className={`p-2 bg-${color}-50 rounded-lg`}>
          {icon}
        </div>
      </div>
      <p className={`text-xs font-medium text-${color}-600`}>{trend}</p>
    </motion.div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    ok: 'bg-green-100 text-green-800',
    late: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800'
  }
  
  const labels = {
    ok: 'Em Dia',
    late: 'Atrasado',
    pending: 'Pendente'
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
      {labels[status as keyof typeof labels]}
    </span>
  )
}

function HealthBar({ score }: { score: number }) {
  let color = 'bg-green-500'
  if (score < 70) color = 'bg-red-500'
  else if (score < 90) color = 'bg-yellow-500'

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden w-24">
        <div 
          className={`h-full ${color}`} 
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs text-gray-600 font-medium">{score}</span>
    </div>
  )
}

