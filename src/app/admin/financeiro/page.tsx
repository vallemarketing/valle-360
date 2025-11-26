'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Plus,
  Filter,
  Download,
  Calendar,
  Search,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';

export default function FinanceiroPage() {
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    {
      label: 'Contas a Pagar',
      value: 'R$ 45.280',
      change: '+12%',
      trend: 'up',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: TrendingDown,
    },
    {
      label: 'Contas a Receber',
      value: 'R$ 128.450',
      change: '+8%',
      trend: 'up',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      icon: TrendingUp,
    },
    {
      label: 'Saldo Projetado',
      value: 'R$ 83.170',
      change: '+5%',
      trend: 'up',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      icon: DollarSign,
    },
    {
      label: 'Alertas',
      value: '3',
      change: '2 críticos',
      trend: 'neutral',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      icon: AlertTriangle,
    },
  ];

  const accountsPayable = [
    {
      id: 1,
      supplier: 'Google Ads',
      description: 'Anúncios - Outubro 2024',
      amount: 15280.00,
      dueDate: '2024-11-05',
      status: 'pending',
      category: 'Marketing',
    },
    {
      id: 2,
      supplier: 'Fornecedor XYZ',
      description: 'Materiais de escritório',
      amount: 850.00,
      dueDate: '2024-11-03',
      status: 'overdue',
      category: 'Operacional',
    },
    {
      id: 3,
      supplier: 'Aluguel Escritório',
      description: 'Novembro 2024',
      amount: 8500.00,
      dueDate: '2024-11-10',
      status: 'pending',
      category: 'Aluguel',
    },
  ];

  const accountsReceivable = [
    {
      id: 1,
      client: 'Cliente A - Empresa ABC',
      description: 'Serviços de marketing - Outubro',
      amount: 25000.00,
      dueDate: '2024-11-05',
      status: 'pending',
      remindersSent: 1,
    },
    {
      id: 2,
      client: 'Cliente B - Loja XYZ',
      description: 'Tráfego pago - Outubro',
      amount: 12000.00,
      dueDate: '2024-10-28',
      status: 'overdue',
      remindersSent: 3,
    },
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-emerald-100 text-emerald-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    const labels = {
      pending: 'Pendente',
      paid: 'Pago',
      overdue: 'Vencido',
      cancelled: 'Cancelado',
    };
    const icons = {
      pending: Clock,
      paid: CheckCircle2,
      overdue: AlertTriangle,
      cancelled: XCircle,
    };
    const Icon = icons[status as keyof typeof icons] || Clock;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        <Icon className="w-3 h-3" />
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-valle-navy-900">Gestão Financeira</h1>
          <p className="text-valle-silver-600 mt-2">
            Controle completo de contas a pagar, receber e fluxo de caixa
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Download className="w-4 h-4" />
          Exportar Relatório
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.label}</h3>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
            </Card>
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="payable">Contas a Pagar</TabsTrigger>
          <TabsTrigger value="receivable">Contas a Receber</TabsTrigger>
          <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alerts */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Alertas Financeiros</h3>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-900">Conta vencida</p>
                      <p className="text-xs text-red-700 mt-1">
                        Fornecedor XYZ - R$ 850,00 venceu há 2 dias
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-900">Vence em 2 dias</p>
                      <p className="text-xs text-orange-700 mt-1">
                        Google Ads - R$ 15.280,00 vence em 05/11
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
              <div className="space-y-2">
                <button className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <p className="text-sm font-medium text-blue-900">Registrar Pagamento</p>
                </button>
                <button className="w-full p-3 text-left bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">
                  <p className="text-sm font-medium text-emerald-900">Registrar Recebimento</p>
                </button>
                <button className="w-full p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                  <p className="text-sm font-medium text-purple-900">Gerar Boleto</p>
                </button>
                <button className="w-full p-3 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                  <p className="text-sm font-medium text-orange-900">Enviar Cobrança</p>
                </button>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payable" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Contas a Pagar</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                Nova Conta
              </button>
            </div>

            <div className="flex gap-3 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar fornecedor..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                Filtros
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Fornecedor</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Descrição</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Valor</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Vencimento</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {accountsPayable.map((account) => (
                    <tr key={account.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-gray-900">{account.supplier}</p>
                        <p className="text-xs text-gray-500">{account.category}</p>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{account.description}</td>
                      <td className="py-3 px-4 text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          R$ {account.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(account.dueDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(account.status)}</td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                          Pagar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="receivable" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Contas a Receber</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                Nova Cobrança
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Cliente</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Descrição</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Valor</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Vencimento</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900">Cobranças</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {accountsReceivable.map((account) => (
                    <tr key={account.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{account.client}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{account.description}</td>
                      <td className="py-3 px-4 text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          R$ {account.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(account.dueDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(account.status)}</td>
                      <td className="py-3 px-4 text-center text-sm text-gray-600">
                        {account.remindersSent}x
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                          Cobrar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="cashflow">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Fluxo de Caixa Projetado</h3>
            <p className="text-gray-600">Em desenvolvimento...</p>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Relatórios Financeiros</h3>
            <p className="text-gray-600">Em desenvolvimento...</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
