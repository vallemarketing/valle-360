'use client';

/**
 * Valle 360 - CMO Virtual
 * Diretor de Marketing/Comercial com IA
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  TrendingUp, TrendingDown, Users, Target, AlertTriangle, CheckCircle,
  ArrowUpRight, ArrowDownRight, Brain, Sparkles, MessageSquare,
  Send, ChevronRight, X, BarChart3, PieChart, Activity,
  ShoppingCart, UserPlus, Repeat, Gift, Heart, Star, Megaphone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Funnel, FunnelChart
} from 'recharts';

// Mock Data
const commercialData = {
  kpis: {
    totalClients: 42,
    newClients: 5,
    churnRate: 4.2,
    nps: 8.7,
    ltv: 18500,
    cac: 2100,
    upsellRate: 23,
  },
  clientsBySegment: [
    { name: 'E-commerce', value: 12, color: '#3B82F6' },
    { name: 'Clínicas', value: 8, color: '#10B981' },
    { name: 'Restaurantes', value: 7, color: '#F59E0B' },
    { name: 'Imobiliárias', value: 6, color: '#EF4444' },
    { name: 'Outros', value: 9, color: '#8B5CF6' },
  ],
  churnRisk: [
    { id: 1, client: 'Cliente A', risk: 85, reason: 'NPS baixo + atraso em entregas', value: 5000, recommendation: 'Reunião de alinhamento urgente' },
    { id: 2, client: 'Cliente B', risk: 72, reason: 'Engajamento em queda', value: 3500, recommendation: 'Propor upgrade de serviços' },
    { id: 3, client: 'Cliente C', risk: 65, reason: 'Contrato vencendo sem renovação', value: 4200, recommendation: 'Oferecer condições especiais' },
  ],
  upsellOpportunities: [
    { id: 1, client: 'Cliente D', current: 'Social Media Básico', suggested: 'Social Media + Tráfego', potential: 2500, probability: 78 },
    { id: 2, client: 'Cliente E', current: 'Design', suggested: 'Design + Vídeo', potential: 1800, probability: 65 },
    { id: 3, client: 'Cliente F', current: 'Tráfego', suggested: 'Tráfego + CRM', potential: 3200, probability: 82 },
  ],
  retentionCampaigns: [
    { id: 1, name: 'Aniversário de Cliente', type: 'email', status: 'active', opens: 68, conversions: 12 },
    { id: 2, name: 'NPS Recuperação', type: 'call', status: 'active', opens: 0, conversions: 8 },
    { id: 3, name: 'Upgrade Trimestral', type: 'email', status: 'draft', opens: 0, conversions: 0 },
  ],
  segmentPerformance: [
    { segment: 'E-commerce', revenue: 85000, growth: 15, margin: 42, clients: 12 },
    { segment: 'Clínicas', revenue: 64000, growth: 22, margin: 38, clients: 8 },
    { segment: 'Restaurantes', revenue: 42000, growth: -5, margin: 35, clients: 7 },
    { segment: 'Imobiliárias', revenue: 48000, growth: 8, margin: 40, clients: 6 },
    { segment: 'Outros', revenue: 48450, growth: 12, margin: 36, clients: 9 },
  ]
};

export default function CMOPage() {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([
    { role: 'assistant', content: 'Olá! Sou seu CMO Virtual. Posso ajudar com estratégias comerciais, análise de churn, oportunidades de upsell e retenção de clientes. Como posso ajudar?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatInput('');
    setIsTyping(true);

    await new Promise(resolve => setTimeout(resolve, 1500));

    const responses: Record<string, string> = {
      'churn': 'Identifiquei 3 clientes com alto risco de churn, representando R$ 12.700/mês em receita. O Cliente A é o mais crítico (85% de risco). Recomendo agendar reunião de alinhamento urgente.',
      'upsell': 'Há 3 oportunidades de upsell identificadas, com potencial de R$ 7.500 em receita adicional. O Cliente F tem a maior probabilidade de conversão (82%) para Tráfego + CRM.',
      'segmento': 'O segmento de Clínicas está com melhor crescimento (+22%), enquanto Restaurantes precisa de atenção (-5%). Sugiro intensificar prospecção em Clínicas.',
      'nps': 'O NPS atual é 8.7, considerado excelente. Porém, 15% dos clientes deram notas abaixo de 7. Temos uma campanha de recuperação ativa com 8 conversões até agora.',
      'default': 'Posso analisar: risco de churn, oportunidades de upsell, performance por segmento e campanhas de retenção. Sobre o que gostaria de saber mais?'
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CMO Virtual</h1>
              <p className="text-sm text-gray-500">Diretor Comercial com Inteligência Artificial</p>
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
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => setChatOpen(true)}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Conversar com CMO
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Clientes Ativos</span>
                  <Users className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{commercialData.kpis.totalClients}</p>
                <div className="flex items-center gap-1 mt-1 text-green-600">
                  <UserPlus className="w-4 h-4" />
                  <span className="text-sm font-medium">+{commercialData.kpis.newClients} este mês</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Taxa de Churn</span>
                  <TrendingDown className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-2xl font-bold text-red-600">{commercialData.kpis.churnRate}%</p>
                <p className="text-xs text-gray-500 mt-1">Meta: abaixo de 5%</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">NPS</span>
                  <Star className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{commercialData.kpis.nps}</p>
                <p className="text-xs text-green-600 mt-1">Excelente</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Taxa de Upsell</span>
                  <Repeat className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-green-600">{commercialData.kpis.upsellRate}%</p>
                <p className="text-xs text-gray-500 mt-1">dos clientes expandiram</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-purple-500" />
                Clientes por Segmento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={commercialData.clientsBySegment}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {commercialData.clientsBySegment.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-500" />
                Performance por Segmento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={commercialData.segmentPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="segment" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value: number, name: string) => 
                    name === 'revenue' ? `R$ ${value.toLocaleString('pt-BR')}` : `${value}%`
                  } />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" fill="#8B5CF6" name="Receita" />
                  <Bar yAxisId="right" dataKey="growth" fill="#10B981" name="Crescimento %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Churn Risk e Upsell */}
        <div className="grid grid-cols-2 gap-6">
          {/* Risco de Churn */}
          <Card className="border-2 border-red-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Clientes em Risco de Churn
                <Badge className="bg-red-100 text-red-700">{commercialData.churnRisk.length} alertas</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {commercialData.churnRisk.map((client) => (
                <div 
                  key={client.id}
                  className="p-4 rounded-xl bg-red-50 border border-red-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">{client.client}</span>
                    <Badge className={cn(
                      client.risk >= 80 ? 'bg-red-500' : 'bg-amber-500'
                    )}>
                      {client.risk}% risco
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{client.reason}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-red-600">
                      R$ {client.value.toLocaleString('pt-BR')}/mês
                    </span>
                    <Button size="sm" variant="outline" className="text-xs">
                      {client.recommendation}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Oportunidades de Upsell */}
          <Card className="border-2 border-green-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Oportunidades de Upsell
                <Badge className="bg-green-100 text-green-700">
                  <Sparkles className="w-3 h-3 mr-1" />
                  IA
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {commercialData.upsellOpportunities.map((opp) => (
                <motion.div 
                  key={opp.id}
                  whileHover={{ x: 4 }}
                  className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-transparent border border-green-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">{opp.client}</span>
                    <Badge variant="outline" className="text-green-700 border-green-300">
                      {opp.probability}% probabilidade
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <span>{opp.current}</span>
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                    <span className="text-green-700 font-medium">{opp.suggested}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-600">
                      +R$ {opp.potential.toLocaleString('pt-BR')}/mês
                    </span>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs">
                      Abordar
                    </Button>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Campanhas de Retenção */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-purple-500" />
              Campanhas de Retenção Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Campanha</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Tipo</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Taxa Abertura</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Conversões</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {commercialData.retentionCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{campaign.name}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline">{campaign.type}</Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={cn(
                          campaign.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        )}>
                          {campaign.status === 'active' ? 'Ativa' : 'Rascunho'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {campaign.opens > 0 ? `${campaign.opens}%` : '-'}
                      </td>
                      <td className="py-3 px-4 text-center text-green-600 font-medium">
                        {campaign.conversions}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button size="sm" variant="outline">
                          {campaign.status === 'active' ? 'Ver Detalhes' : 'Ativar'}
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
              <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-purple-500 to-pink-600 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">CMO Virtual</h3>
                    <p className="text-xs text-white/80">Especialista Comercial</p>
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
                        ? 'bg-purple-500 text-white rounded-br-none'
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
                    placeholder="Pergunte sobre estratégia comercial..."
                    className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <Button onClick={handleSendMessage} className="bg-purple-500 hover:bg-purple-600">
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

