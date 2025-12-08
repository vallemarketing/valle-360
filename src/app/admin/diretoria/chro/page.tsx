'use client';

/**
 * Valle 360 - CHRO Virtual
 * Diretor de RH com IA
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Users, TrendingUp, TrendingDown, Heart, AlertTriangle, CheckCircle,
  ArrowUpRight, Brain, Sparkles, MessageSquare, Send, ChevronRight, X,
  Award, Target, Calendar, Briefcase, Star, Clock, UserPlus, UserMinus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const hrData = {
  kpis: { totalEmployees: 12, satisfaction: 8.4, turnoverRisk: 16.7, avgPerformance: 87, trainingsCompleted: 24 },
  teamPerformance: [
    { name: 'João Silva', role: 'Web Designer', performance: 95, satisfaction: 9, risk: 'low' },
    { name: 'Maria Santos', role: 'Social Media', performance: 110, satisfaction: 8.5, risk: 'low' },
    { name: 'Pedro Costa', role: 'Tráfego', performance: 68, satisfaction: 6, risk: 'high' },
    { name: 'Ana Oliveira', role: 'Designer', performance: 92, satisfaction: 8, risk: 'low' },
  ],
  turnoverRisk: [
    { id: 1, employee: 'Pedro Costa', risk: 75, factors: 'Performance baixa + insatisfação', recommendation: 'Conversa de desenvolvimento urgente' },
    { id: 2, employee: 'Lucas Mendes', risk: 45, factors: 'Proposta externa', recommendation: 'Contra-proposta ou plano de carreira' },
  ],
  careerPlans: [
    { id: 1, employee: 'Maria Santos', current: 'Social Media Jr', next: 'Social Media Pleno', timeline: '6 meses', progress: 75 },
    { id: 2, employee: 'João Silva', current: 'Web Designer', next: 'Tech Lead', timeline: '12 meses', progress: 40 },
  ],
  salaryAnalysis: [
    { role: 'Social Media Jr', current: 2800, market: 3200, gap: -12.5 },
    { role: 'Web Designer', current: 4500, market: 4800, gap: -6.3 },
    { role: 'Gestor de Tráfego', current: 5000, market: 5500, gap: -9.1 },
  ]
};

export default function CHROPage() {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([
    { role: 'assistant', content: 'Olá! Sou seu CHRO Virtual. Posso ajudar com gestão de pessoas, análise de turnover, planos de carreira e clima organizacional. Como posso ajudar?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { role: 'user', content: chatInput }]);
    setChatInput('');
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const responses: Record<string, string> = {
      'turnover': 'Identifiquei 2 colaboradores com risco de turnover. Pedro Costa (75% de risco) precisa de atenção urgente devido à baixa performance e insatisfação.',
      'carreira': 'Maria Santos está no caminho para promoção a Social Media Pleno em 6 meses (75% do plano concluído). Recomendo feedback positivo e novos desafios.',
      'salário': 'Há defasagem salarial em 3 posições. Social Media Jr está 12.5% abaixo do mercado. Sugiro revisão para evitar perda de talentos.',
      'default': 'Posso analisar: risco de turnover, planos de carreira, análise salarial e clima organizacional. O que gostaria de explorar?'
    };

    const keyword = Object.keys(responses).find(k => chatInput.toLowerCase().includes(k));
    setChatMessages(prev => [...prev, { role: 'assistant', content: responses[keyword || 'default'] }]);
    setIsTyping(false);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CHRO Virtual</h1>
              <p className="text-sm text-gray-500">Diretor de RH com Inteligência Artificial</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/diretoria">
              <Button variant="outline"><ChevronRight className="w-4 h-4 mr-2 rotate-180" />Voltar</Button>
            </Link>
            <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => setChatOpen(true)}>
              <MessageSquare className="w-4 h-4 mr-2" />Conversar com CHRO
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Colaboradores</span>
                <Users className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{hrData.kpis.totalEmployees}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Satisfação</span>
                <Heart className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-2xl font-bold text-green-600">{hrData.kpis.satisfaction}</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Risco Turnover</span>
                <UserMinus className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-red-600">{hrData.kpis.turnoverRisk}%</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Performance Média</span>
                <Target className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-blue-600">{hrData.kpis.avgPerformance}%</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />Performance da Equipe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hrData.teamPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 120]} />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="performance" fill="#3B82F6" name="Performance %" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />Risco de Turnover
                <Badge className="bg-red-100 text-red-700"><Brain className="w-3 h-3 mr-1" />IA</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {hrData.turnoverRisk.map((emp) => (
                <div key={emp.id} className="p-4 rounded-xl bg-red-50 border border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{emp.employee}</span>
                    <Badge className="bg-red-500">{emp.risk}% risco</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{emp.factors}</p>
                  <Button size="sm" variant="outline">{emp.recommendation}</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <Card className="border-2 border-green-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-green-500" />Planos de Carreira
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {hrData.careerPlans.map((plan) => (
                <div key={plan.id} className="p-4 rounded-xl bg-green-50 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{plan.employee}</span>
                    <Badge variant="outline">{plan.timeline}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <span>{plan.current}</span>
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                    <span className="text-green-700 font-medium">{plan.next}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${plan.progress}%` }} />
                  </div>
                  <span className="text-xs text-gray-500">{plan.progress}% concluído</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-500" />Análise Salarial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {hrData.salaryAnalysis.map((salary, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-gray-50 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{salary.role}</p>
                      <p className="text-sm text-gray-500">Atual: R$ {salary.current.toLocaleString()} | Mercado: R$ {salary.market.toLocaleString()}</p>
                    </div>
                    <Badge className={salary.gap < -10 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}>
                      {salary.gap}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AnimatePresence>
        {chatOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl h-[600px] flex flex-col">
              <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-orange-500 to-red-600 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">CHRO Virtual</h3>
                    <p className="text-xs text-white/80">Especialista em RH</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)} className="text-white hover:bg-white/20">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex-1 overflow-auto p-4 space-y-4">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={cn("flex", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                    <div className={cn("max-w-[80%] p-3 rounded-2xl",
                      msg.role === 'user' ? 'bg-orange-500 text-white rounded-br-none' : 'bg-gray-100 text-gray-900 rounded-bl-none')}>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isTyping && <div className="flex justify-start"><div className="bg-gray-100 p-3 rounded-2xl rounded-bl-none"><div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div></div></div>}
              </div>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Pergunte sobre gestão de pessoas..."
                    className="flex-1 p-3 border rounded-xl focus:ring-2 focus:ring-orange-500" />
                  <Button onClick={handleSendMessage} className="bg-orange-500 hover:bg-orange-600">
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

