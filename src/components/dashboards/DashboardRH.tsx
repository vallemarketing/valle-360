'use client'

import { Users, TrendingUp, CheckCircle, FileText, Sparkles } from 'lucide-react'

export default function DashboardRH() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">👥 RH - Gestão de Pessoas</h2>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4" style={{ borderColor: '#8B5CF6' }}>
          <p className="text-sm text-gray-600">Colaboradores</p>
          <p className="text-3xl font-bold text-gray-900">45</p>
          <p className="text-sm" style={{ color: '#8B5CF6' }}>👥 Equipe ativa</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4" style={{ borderColor: '#F59E0B' }}>
          <p className="text-sm text-gray-600">Solicitações</p>
          <p className="text-3xl font-bold text-gray-900">8</p>
          <p className="text-sm" style={{ color: '#F59E0B' }}>📝 Pendentes</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4" style={{ borderColor: '#10B981' }}>
          <p className="text-sm text-gray-600">Performance</p>
          <p className="text-3xl font-bold text-gray-900">87%</p>
          <p className="text-sm" style={{ color: '#10B981' }}>📊 Média geral</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4" style={{ borderColor: '#3B82F6' }}>
          <p className="text-sm text-gray-600">Aprovadas</p>
          <p className="text-3xl font-bold text-gray-900">23</p>
          <p className="text-sm" style={{ color: '#3B82F6' }}>✅ Este mês</p>
        </div>
      </div>

      {/* Solicitações Recentes */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Solicitações Pendentes</h3>
        <div className="space-y-3">
          {[
            { name: 'João Silva', type: 'Férias', date: '15/12/2025', status: 'pendente' },
            { name: 'Maria Santos', type: 'Home Office', date: '20/11/2025', status: 'pendente' },
            { name: 'Carlos Lima', type: 'Atestado', date: '18/11/2025', status: 'aprovado' }
          ].map((req, i) => (
            <div key={i} className="p-4 border rounded-lg hover:bg-gray-50 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{req.name}</p>
                  <p className="text-sm text-gray-600">{req.type} - {req.date}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  req.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                }`}>
                  {req.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights da Val */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border-2 border-purple-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl flex-shrink-0">
            ✨
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2 text-gray-900">Insights da Val para RH</h3>
            <p className="text-sm text-gray-700 mb-4">
              📊 A performance da equipe está em 87%! Considere implementar programas de reconhecimento para aumentar o engajamento.
            </p>
            <button className="px-4 py-2 rounded-lg text-white transition-all hover:scale-105" style={{ backgroundColor: '#8B5CF6' }}>
              <Sparkles className="w-4 h-4 inline mr-2" />
              Ver Análise Completa
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
