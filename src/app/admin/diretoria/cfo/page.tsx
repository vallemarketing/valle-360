'use client';

/**
 * Valle 360 - CFO Virtual
 * Diretor Financeiro com IA
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  DollarSign, TrendingUp, TrendingDown, PieChart, BarChart3,
  AlertTriangle, CheckCircle, ArrowUpRight, ArrowDownRight,
  Brain, Sparkles, MessageSquare, Send, ChevronRight, X,
  Wallet, Receipt, CreditCard, Banknote, Target, Clock,
  Building2, Users, Calendar, FileText, Download, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';

// Mock Data
const financialData = {
  kpis: {
    totalRevenue: 287450,
    revenueGrowth: 12.5,
    totalExpenses: 195000,
    expenseGrowth: 8.2,
    profit: 92450,
    profitMargin: 32.2,
    cashFlow: 45000,
    pendingReceivables: 35000,
  },
  revenueByMonth: [
    { month: 'Jul', receita: 245000, despesas: 180000, lucro: 65000 },
    { month: 'Ago', receita: 258000, despesas: 185000, lucro: 73000 },
    { month: 'Set', receita: 267000, despesas: 190000, lucro: 77000 },
    { month: 'Out', receita: 275000, despesas: 192000, lucro: 83000 },
    { month: 'Nov', receita: 287000, despesas: 195000, lucro: 92000 },
    { month: 'Dez', receita: 310000, despesas: 200000, lucro: 110000 },
  ],
  revenueByClient: [
    { name: 'Cliente A', value: 45000, color: '#3B82F6' },
    { name: 'Cliente B', value: 38000, color: '#10B981' },
    { name: 'Cliente C', value: 32000, color: '#F59E0B' },
    { name: 'Cliente D', value: 28000, color: '#EF4444' },
    { name: 'Outros', value: 144450, color: '#8B5CF6' },
  ],
  alerts: [
    { id: 1, type: 'warning', message: '3 faturas vencendo em 5 dias - R$ 18.500', action: 'Enviar cobranças' },
    { id: 2, type: 'danger', message: '2 clientes com pagamento atrasado - R$ 12.000', action: 'Contatar clientes' },
    { id: 3, type: 'info', message: 'Margem do cliente E abaixo de 20%', action: 'Revisar precificação' },
  ],
  recommendations: [
    { id: 1, title: 'Aumentar margem do Pacote Standard', impact: '+R$ 8.500/mês', confidence: 92 },
    { id: 2, title: 'Renegociar contrato fornecedor X', impact: '-R$ 3.200/mês em custos', confidence: 87 },
    { id: 3, title: 'Oferecer desconto para pagamento antecipado', impact: '+R$ 5.000 em caixa', confidence: 78 },
  ],
  pricing: {
    services: [
      { name: 'Social Media Básico', currentPrice: 1500, suggestedPrice: 1750, marketAvg: 1600, margin: 35 },
      { name: 'Social Media Premium', currentPrice: 3500, suggestedPrice: 3900, marketAvg: 3700, margin: 42 },
      { name: 'Gestão de Tráfego', currentPrice: 2500, suggestedPrice: 2800, marketAvg: 2600, margin: 38 },
      { name: 'Produção de Vídeo', currentPrice: 4000, suggestedPrice: 4500, marketAvg: 4200, margin: 45 },
    ]
  }
};

export default function CFOPage() {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([
    { role: 'assistant', content: 'Olá! Sou seu CFO Virtual. Como posso ajudá-lo com as finanças da empresa hoje?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatInput('');
    setIsTyping(true);

    // Simular resposta da IA
    await new Promise(resolve => setTimeout(resolve, 1500));

    const responses: Record<string, string> = {
      'margem': 'Analisando as margens atuais, identifiquei que o serviço de Social Media Básico está com margem de 35%, abaixo da meta de 40%. Recomendo aumentar o preço de R$ 1.500 para R$ 1.750, alinhando com a média de mercado.',
      'receita': 'A receita atual é de R$ 287.450, com crescimento de 12.5% em relação ao mês anterior. Projeto R$ 310.000 para dezembro baseado na tendência e contratos ativos.',
      'custos': 'Os custos operacionais estão em R$ 195.000. Identifiquei oportunidade de redução de R$ 3.200/mês renegociando com o fornecedor X.',
      'default': 'Baseado na análise dos dados financeiros, posso ajudá-lo com: análise de margem, projeção de receita, controle de custos e precificação. Como posso ser mais específico?'
    };

    const keyword = Object.keys(responses).find(k => userMessage.toLowerCase().includes(k));
    const response = responses[keyword || 'default'];

    setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setIsTyping(false);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CFO Virtual</h1>
              <p className="text-sm text-gray-500">Diretor Financeiro com Inteligência Artificial</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/admin/diretoria">
              <Button variant="outline">
                <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
                Voltar
              </Button>
            </Link>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => setChatOpen(true)}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Conversar com CFO
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-l-4 border-l-emerald-500">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Receita Mensal</span>
                  <Wallet className="w-5 h-5 text-emerald-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {financialData.kpis.totalRevenue.toLocaleString('pt-BR')}
                </p>
                <div className="flex items-center gap-1 mt-1 text-emerald-600">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm font-medium">+{financialData.kpis.revenueGrowth}%</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Despesas</span>
                  <Receipt className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {financialData.kpis.totalExpenses.toLocaleString('pt-BR')}
                </p>
                <div className="flex items-center gap-1 mt-1 text-red-600">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm font-medium">+{financialData.kpis.expenseGrowth}%</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Lucro Líquido</span>
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {financialData.kpis.profit.toLocaleString('pt-BR')}
                </p>
                <div className="flex items-center gap-1 mt-1 text-blue-600">
                  <span className="text-sm font-medium">Margem: {financialData.kpis.profitMargin}%</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Fluxo de Caixa</span>
                  <Banknote className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {financialData.kpis.cashFlow.toLocaleString('pt-BR')}
                </p>
                <div className="flex items-center gap-1 mt-1 text-amber-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">R$ {financialData.kpis.pendingReceivables.toLocaleString('pt-BR')} a receber</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-500" />
                Evolução Financeira
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={financialData.revenueByMonth}>
                  <defs>
                    <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`} />
                  <Legend />
                  <Area type="monotone" dataKey="receita" stroke="#10B981" fill="url(#colorReceita)" name="Receita" />
                  <Area type="monotone" dataKey="lucro" stroke="#3B82F6" fill="url(#colorLucro)" name="Lucro" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-blue-500" />
                Receita por Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={financialData.revenueByClient}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {financialData.revenueByClient.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR')}`} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Alertas e Recomendações */}
        <div className="grid grid-cols-2 gap-6">
          {/* Alertas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Alertas Financeiros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {financialData.alerts.map((alert) => (
                <div 
                  key={alert.id}
                  className={cn(
                    "p-4 rounded-xl border flex items-start gap-3",
                    alert.type === 'danger' ? 'bg-red-50 border-red-200' :
                    alert.type === 'warning' ? 'bg-amber-50 border-amber-200' :
                    'bg-blue-50 border-blue-200'
                  )}
                >
                  <AlertTriangle className={cn(
                    "w-5 h-5 mt-0.5",
                    alert.type === 'danger' ? 'text-red-500' :
                    alert.type === 'warning' ? 'text-amber-500' :
                    'text-blue-500'
                  )} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                    <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs">
                      {alert.action}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recomendações IA */}
          <Card className="border-2 border-emerald-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-emerald-500" />
                Recomendações do CFO Virtual
                <Badge className="bg-emerald-100 text-emerald-700">
                  <Sparkles className="w-3 h-3 mr-1" />
                  IA
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {financialData.recommendations.map((rec) => (
                <motion.div 
                  key={rec.id}
                  whileHover={{ x: 4 }}
                  className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-transparent border border-emerald-200 cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{rec.title}</p>
                      <p className="text-sm text-emerald-600 mt-1">{rec.impact}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {rec.confidence}% confiança
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Precificação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-500" />
              Análise de Precificação
              <Badge className="bg-purple-100 text-purple-700 ml-2">
                <Brain className="w-3 h-3 mr-1" />
                Sugestões IA
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Serviço</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Preço Atual</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Sugestão IA</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Média Mercado</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Margem</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {financialData.pricing.services.map((service, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{service.name}</td>
                      <td className="py-3 px-4 text-right">R$ {service.currentPrice.toLocaleString('pt-BR')}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-emerald-600 font-medium">
                          R$ {service.suggestedPrice.toLocaleString('pt-BR')}
                        </span>
                        {service.suggestedPrice > service.currentPrice && (
                          <ArrowUpRight className="w-4 h-4 inline ml-1 text-emerald-500" />
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-500">
                        R$ {service.marketAvg.toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Badge className={cn(
                          service.margin >= 40 ? 'bg-emerald-100 text-emerald-700' :
                          service.margin >= 30 ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        )}>
                          {service.margin}%
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button size="sm" variant="outline">
                          Aplicar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chat Modal */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl h-[600px] flex flex-col"
            >
              <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-emerald-500 to-green-600 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">CFO Virtual</h3>
                    <p className="text-xs text-white/80">Sempre disponível</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)} className="text-white hover:bg-white/20">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-auto p-4 space-y-4">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={cn("flex", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                    <div className={cn(
                      "max-w-[80%] p-3 rounded-2xl",
                      msg.role === 'user' 
                        ? 'bg-emerald-500 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-900 rounded-bl-none'
                    )}>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-none">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Pergunte sobre finanças..."
                    className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <Button onClick={handleSendMessage} className="bg-emerald-500 hover:bg-emerald-600">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

