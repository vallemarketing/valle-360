'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, TrendingUp, Download, Filter, Calendar,
  PieChart, BarChart3, FileText, AlertTriangle
} from 'lucide-react';
import { CashFlowKPIs } from '@/components/financial/FinancialKPICards';
import { WaterfallChart } from '@/components/financial/WaterfallChart';
import { DRETable } from '@/components/financial/DRETable';

export default function FinanceiroPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('2024');
  const [selectedMonth, setSelectedMonth] = useState('all');

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#0F172A' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
            >
              <DollarSign className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard Financeiro</h1>
              <p className="text-gray-400">Análise de Receita e Margem</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 rounded-xl text-sm font-medium"
              style={{ 
                backgroundColor: '#1E293B',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 rounded-xl text-sm font-medium"
              style={{ 
                backgroundColor: '#1E293B',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <option value="all">Todos os Meses</option>
              <option value="01">Janeiro</option>
              <option value="02">Fevereiro</option>
              <option value="03">Março</option>
              <option value="04">Abril</option>
              <option value="05">Maio</option>
              <option value="06">Junho</option>
              <option value="07">Julho</option>
              <option value="08">Agosto</option>
              <option value="09">Setembro</option>
              <option value="10">Outubro</option>
              <option value="11">Novembro</option>
              <option value="12">Dezembro</option>
            </select>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-2 rounded-xl"
              style={{ 
                backgroundColor: '#1E293B',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <Download className="w-5 h-5 text-gray-400" />
            </motion.button>
          </div>
        </div>

        {/* KPI Cards */}
        <CashFlowKPIs />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Waterfall Chart */}
          <WaterfallChart />

          {/* Revenue Evolution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-6"
            style={{
              background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Evolução da Receita</h3>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <TrendingUp className="w-4 h-4 text-green-500" />
                +12% vs ano anterior
              </div>
            </div>

            {/* Placeholder for chart */}
            <div className="h-[250px] flex items-center justify-center rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-600" />
                <p className="text-gray-500">Gráfico de Evolução</p>
                <p className="text-xs text-gray-600">Dados carregando...</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* DRE Table */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Demonstrativo de Resultados (DRE)
            </h2>
            <button 
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{ 
                backgroundColor: '#1E293B',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <Download className="w-4 h-4" />
              Exportar Excel
            </button>
          </div>
          <DRETable />
        </div>

        {/* Alerts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6"
          style={{
            background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-bold text-white">Alertas Financeiros</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AlertCard
              title="Contas a Receber Vencidas"
              value="R$ 45.230"
              description="12 faturas vencidas há mais de 30 dias"
              type="warning"
            />
            <AlertCard
              title="Fluxo de Caixa Projetado"
              value="R$ 128.500"
              description="Saldo previsto para os próximos 30 dias"
              type="info"
            />
            <AlertCard
              title="Inadimplência"
              value="3,2%"
              description="Taxa atual de inadimplência"
              type="success"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Alert Card Component
function AlertCard({ title, value, description, type }: {
  title: string;
  value: string;
  description: string;
  type: 'success' | 'warning' | 'error' | 'info';
}) {
  const colors = {
    success: { bg: 'rgba(16, 185, 129, 0.1)', border: '#10B981', text: '#10B981' },
    warning: { bg: 'rgba(245, 158, 11, 0.1)', border: '#F59E0B', text: '#F59E0B' },
    error: { bg: 'rgba(239, 68, 68, 0.1)', border: '#EF4444', text: '#EF4444' },
    info: { bg: 'rgba(59, 130, 246, 0.1)', border: '#3B82F6', text: '#3B82F6' }
  };

  const color = colors[type];

  return (
    <div 
      className="p-4 rounded-xl"
      style={{ 
        backgroundColor: color.bg,
        border: `1px solid ${color.border}30`
      }}
    >
      <p className="text-sm text-gray-400 mb-1">{title}</p>
      <p className="text-2xl font-bold mb-1" style={{ color: color.text }}>{value}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  );
}
