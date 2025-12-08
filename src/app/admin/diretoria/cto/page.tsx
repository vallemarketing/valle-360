'use client';

/**
 * Valle 360 - CTO Virtual
 * Diretor de Tecnologia/Operações com IA
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Zap, TrendingUp, Users, Clock, AlertTriangle, CheckCircle,
  ArrowUpRight, ArrowDownRight, Brain, Sparkles, MessageSquare,
  Send, ChevronRight, X, Settings, Gauge, Activity, Cpu,
  Server, Database, BarChart3, Calendar, Wrench, Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

// Mock Data
const operationalData = {
  kpis: {
    utilizationRate: 87,
    hoursAvailable: 1200,
    hoursSold: 1044,
    bottlenecks: 2,
    efficiency: 94,
    automationRate: 42,
  },
  teamCapacity: [
    { area: 'Design', capacity: 92, target: 85 },
    { area: 'Social Media', capacity: 78, target: 85 },
    { area: 'Tráfego', capacity: 95, target: 85 },
    { area: 'Vídeo', capacity: 68, target: 85 },
    { area: 'Web', capacity: 82, target: 85 },
  ],
  processEfficiency: [
    { process: 'Briefing', current: 85, optimal: 95 },
    { process: 'Produção', current: 78, optimal: 90 },
    { process: 'Revisão', current: 92, optimal: 95 },
    { process: 'Entrega', current: 88, optimal: 95 },
    { process: 'Feedback', current: 72, optimal: 85 },
  ],
  bottlenecks: [
    { id: 1, area: 'Tráfego', severity: 'high', issue: 'Equipe com 95% de utilização', recommendation: 'Contratar gestor júnior ou terceirizar campanhas menores' },
    { id: 2, area: 'Vídeo', severity: 'medium', issue: 'Atraso médio de 2 dias nas entregas', recommendation: 'Automatizar edição básica ou redistribuir tarefas' },
  ],
  toolRecommendations: [
    { id: 1, tool: 'Automação de Posts', impact: '8h/semana economizadas', cost: 'R$ 200/mês', roi: '320%' },
    { id: 2, tool: 'IA para Legendas', impact: '5h/semana economizadas', cost: 'R$ 150/mês', roi: '280%' },
    { id: 3, tool: 'Templates Automatizados', impact: '12h/semana economizadas', cost: 'R$ 100/mês', roi: '450%' },
  ],
  hiringVsAutomation: {
    scenario: 'Contratar Social Media Jr',
    hiringCost: 3500,
    hiringBenefit: '+160h/mês',
    automationCost: 500,
    automationBenefit: '+100h/mês',
    recommendation: 'automação',
    reasoning: 'Automação oferece melhor ROI no curto prazo. Reavaliar contratação quando utilização superar 95%.'
  }
};

export default function CTOPage() {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([
    { role: 'assistant', content: 'Olá! Sou seu CTO Virtual. Posso ajudá-lo a otimizar operações, identificar gargalos e melhorar a eficiência da equipe. Como posso ajudar?' }
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
      'gargalo': 'Identifiquei 2 gargalos principais: Tráfego está com 95% de utilização (crítico) e Vídeo tem atraso médio de 2 dias. Recomendo priorizar o setor de Tráfego com automação ou contratação.',
      'capacidade': 'A capacidade atual da equipe é de 1.200 horas/mês, com 1.044 horas vendidas (87%). O setor de Vídeo tem capacidade ociosa que pode absorver mais demandas.',
      'automação': 'Identifiquei 3 oportunidades de automação que podem economizar 25h/semana. A de maior ROI é Templates Automatizados (450% de retorno).',
      'contratar': 'Analisando contratar vs automatizar: Para a demanda atual, automação oferece melhor ROI. Recomendo contratação quando utilização superar 95% consistentemente.',
      'default': 'Posso analisar: capacidade produtiva, gargalos operacionais, oportunidades de automação e decisões de contratação. O que gostaria de explorar?'
    };

    const keyword = Object.keys(responses).find(k => userMessage.toLowerCase().includes(k));
    const response = responses[keyword || 'default'];

    setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setIsTyping(false);
  };

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CTO Virtual</h1>
              <p className="text-sm text-gray-500">Diretor de Operações com Inteligência Artificial</p>
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
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setChatOpen(true)}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Conversar com CTO
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Taxa de Utilização</span>
                  <Gauge className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{operationalData.kpis.utilizationRate}%</p>
                <div className="w-full h-2 bg-gray-100 rounded-full mt-2">
                  <div 
                    className={cn(
                      "h-full rounded-full",
                      operationalData.kpis.utilizationRate >= 90 ? 'bg-red-500' :
                      operationalData.kpis.utilizationRate >= 80 ? 'bg-amber-500' :
                      'bg-green-500'
                    )}
                    style={{ width: `${operationalData.kpis.utilizationRate}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Horas Produtivas</span>
                  <Clock className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {operationalData.kpis.hoursSold.toLocaleString()}h
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  de {operationalData.kpis.hoursAvailable.toLocaleString()}h disponíveis
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Eficiência</span>
                  <Activity className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{operationalData.kpis.efficiency}%</p>
                <div className="flex items-center gap-1 mt-1 text-green-600">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm font-medium">+5% vs mês anterior</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-l-4 border-l-amber-500">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">Gargalos</span>
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <p className="text-2xl font-bold text-amber-600">{operationalData.kpis.bottlenecks}</p>
                <p className="text-xs text-gray-500 mt-1">áreas com atenção</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Capacidade por Área
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={operationalData.teamCapacity} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="area" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="capacity" fill="#3B82F6" name="Utilização Atual" radius={[0, 4, 4, 0]}>
                    {operationalData.teamCapacity.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.capacity >= 90 ? '#EF4444' : entry.capacity >= 80 ? '#F59E0B' : '#10B981'} 
                      />
                    ))}
                  </Bar>
                  <Line type="monotone" dataKey="target" stroke="#9CA3AF" strokeDasharray="5 5" name="Meta" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-500" />
                Eficiência de Processos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={operationalData.processEfficiency}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="process" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Atual" dataKey="current" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.5} />
                  <Radar name="Ideal" dataKey="optimal" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Gargalos e Recomendações */}
        <div className="grid grid-cols-2 gap-6">
          {/* Gargalos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Gargalos Identificados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {operationalData.bottlenecks.map((bottleneck) => (
                <div 
                  key={bottleneck.id}
                  className={cn(
                    "p-4 rounded-xl border",
                    bottleneck.severity === 'high' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={cn(
                      bottleneck.severity === 'high' ? 'bg-red-500' : 'bg-amber-500'
                    )}>
                      {bottleneck.area}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {bottleneck.severity === 'high' ? 'Alta Prioridade' : 'Média Prioridade'}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-2">{bottleneck.issue}</p>
                  <div className="flex items-start gap-2 p-2 bg-white rounded-lg">
                    <Brain className="w-4 h-4 text-blue-500 mt-0.5" />
                    <p className="text-xs text-gray-600">{bottleneck.recommendation}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Ferramentas Recomendadas */}
          <Card className="border-2 border-blue-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-500" />
                Automações Recomendadas
                <Badge className="bg-blue-100 text-blue-700">
                  <Sparkles className="w-3 h-3 mr-1" />
                  IA
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {operationalData.toolRecommendations.map((tool) => (
                <motion.div 
                  key={tool.id}
                  whileHover={{ x: 4 }}
                  className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-transparent border border-blue-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{tool.tool}</span>
                    <Badge className="bg-green-100 text-green-700">ROI: {tool.roi}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>💰 {tool.cost}</span>
                    <span>⏱️ {tool.impact}</span>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Contratar vs Automatizar */}
        <Card className="border-2 border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-500" />
              Análise: Contratar vs Automatizar
              <Badge className="bg-purple-100 text-purple-700 ml-2">
                <Brain className="w-3 h-3 mr-1" />
                Decisão IA
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-gray-50 border">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Contratar
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Custo Mensal</span>
                    <span className="font-medium text-red-600">R$ {operationalData.hiringVsAutomation.hiringCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Capacidade Adicional</span>
                    <span className="font-medium text-green-600">{operationalData.hiringVsAutomation.hiringBenefit}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-purple-50 border-2 border-purple-300">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  Automatizar
                  <Badge className="bg-purple-500 text-white text-xs">Recomendado</Badge>
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Custo Mensal</span>
                    <span className="font-medium text-green-600">R$ {operationalData.hiringVsAutomation.automationCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Capacidade Adicional</span>
                    <span className="font-medium text-green-600">{operationalData.hiringVsAutomation.automationBenefit}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div className="flex items-start gap-2">
                <Brain className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium text-purple-900">Recomendação do CTO Virtual</p>
                  <p className="text-sm text-purple-700 mt-1">{operationalData.hiringVsAutomation.reasoning}</p>
                </div>
              </div>
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
              <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">CTO Virtual</h3>
                    <p className="text-xs text-white/80">Especialista em Operações</p>
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
                        ? 'bg-blue-500 text-white rounded-br-none'
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
                    placeholder="Pergunte sobre operações..."
                    className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Button onClick={handleSendMessage} className="bg-blue-500 hover:bg-blue-600">
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

