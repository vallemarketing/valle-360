'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  DollarSign, Settings, Users, Heart, TrendingUp, TrendingDown,
  AlertTriangle, CheckCircle, Clock, Send, Bot, Sparkles,
  ChevronRight, ChevronDown, RefreshCw, Download, MessageSquare,
  Building2, BarChart3, Target, Briefcase, Brain, Zap,
  ArrowUpRight, ArrowDownRight, Minus, PieChart, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// =====================================================
// TIPOS
// =====================================================

type ExecutiveType = 'cfo' | 'cto' | 'cmo' | 'chro' | 'all';

interface Alert {
  id: string;
  executive: ExecutiveType;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  recommendedAction: string;
  createdAt: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  executive?: ExecutiveType;
  timestamp: Date;
}

// =====================================================
// MOCK DATA
// =====================================================

const mockDashboard = {
  healthScore: 78,
  summary: 'Empresa em bom estado geral. Atenção necessária para capacidade do Design e 2 clientes em risco de churn.',
  cfo: {
    kpis: {
      totalRevenue: 245000,
      averageMargin: 34.5,
      revenueGrowth: 8.2,
      grossMargin: 84500,
      mrr: 245000,
      totalCosts: 160500
    },
    alerts: [
      { id: 'cfo-1', type: 'margin', severity: 'high', title: 'Cliente TechStart com margem de 12%', description: 'Margem muito abaixo do target de 30%', recommendedAction: 'Renegociar contrato ou revisar escopo' }
    ]
  },
  cto: {
    overview: {
      totalCapacity: 1280,
      totalUtilization: 82,
      averageEfficiency: 87,
      bottlenecks: 1,
      toolsInUse: 8,
      potentialSavings: 120
    },
    alerts: [
      { id: 'cto-1', type: 'capacity', severity: 'high', title: 'Design vai estourar capacidade em 15 dias', description: 'Utilização atual: 95%', recommendedAction: 'Contratar freelancer ou redistribuir tarefas' }
    ]
  },
  cmo: {
    kpis: {
      totalClients: 32,
      activeClients: 28,
      churnRate: 8.5,
      npsAverage: 72,
      upsellPipeline: 45000,
      retentionRate: 91.5
    },
    alerts: [
      { id: 'cmo-1', type: 'churn', severity: 'critical', title: 'Loja Virtual XYZ pode cancelar em 30 dias', description: 'Score de risco: 78%', recommendedAction: 'Ligação urgente do gestor' }
    ]
  },
  chro: {
    kpis: {
      totalEmployees: 15,
      averagePerformance: 84,
      averageEngagement: 79,
      turnoverRate: 12,
      openPositions: 2,
      averageTenure: 18,
      trainingHoursPerEmployee: 12
    },
    alerts: [
      { id: 'chro-1', type: 'turnover', severity: 'medium', title: 'João Santos pode sair nos próximos 60 dias', description: 'Engajamento baixo e salário abaixo do mercado', recommendedAction: 'Conversa individual e revisão salarial' }
    ]
  },
  consolidatedAlerts: [
    { id: '1', executive: 'cmo' as ExecutiveType, type: 'churn', severity: 'critical' as const, title: 'Loja Virtual XYZ pode cancelar em 30 dias', description: 'Score de risco: 78%', recommendedAction: 'Ligação urgente', createdAt: new Date().toISOString() },
    { id: '2', executive: 'cto' as ExecutiveType, type: 'capacity', severity: 'high' as const, title: 'Design vai estourar capacidade', description: 'Utilização: 95%', recommendedAction: 'Contratar', createdAt: new Date().toISOString() },
    { id: '3', executive: 'cfo' as ExecutiveType, type: 'margin', severity: 'high' as const, title: 'TechStart com margem baixa', description: '12% de margem', recommendedAction: 'Renegociar', createdAt: new Date().toISOString() },
    { id: '4', executive: 'chro' as ExecutiveType, type: 'turnover', severity: 'medium' as const, title: 'Risco de turnover: João', description: 'Engajamento baixo', recommendedAction: 'Conversa 1:1', createdAt: new Date().toISOString() }
  ]
};

// =====================================================
// COMPONENTES
// =====================================================

const ExecutiveCard = ({ 
  type, 
  name, 
  icon: Icon, 
  color, 
  alertCount, 
  isSelected, 
  onClick 
}: { 
  type: ExecutiveType;
  name: string;
  icon: React.ElementType;
  color: string;
  alertCount: number;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={cn(
      "relative p-4 rounded-2xl border-2 transition-all",
      "flex flex-col items-center gap-2 min-w-[100px]",
      isSelected 
        ? `border-${color}-500 bg-${color}-50 dark:bg-${color}-950` 
        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
    )}
    style={{
      borderColor: isSelected ? `var(--${color})` : undefined,
      backgroundColor: isSelected ? `var(--${color}-light)` : undefined
    }}
  >
    <div className={cn(
      "w-12 h-12 rounded-xl flex items-center justify-center",
      `bg-gradient-to-br from-${color}-500 to-${color}-600`
    )} style={{ 
      background: `linear-gradient(135deg, var(--${color}-500, #6366f1), var(--${color}-600, #4f46e5))` 
    }}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <span className="text-sm font-semibold text-gray-900 dark:text-white">{name}</span>
    {alertCount > 0 && (
      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
        {alertCount}
      </span>
    )}
  </motion.button>
);

const KPICard = ({ 
  label, 
  value, 
  trend, 
  format = 'number',
  icon: Icon
}: { 
  label: string;
  value: number;
  trend?: 'up' | 'down' | 'stable';
  format?: 'number' | 'currency' | 'percent';
  icon?: React.ElementType;
}) => {
  const formattedValue = format === 'currency' 
    ? `R$ ${value.toLocaleString('pt-BR')}`
    : format === 'percent'
      ? `${value.toFixed(1)}%`
      : value.toLocaleString('pt-BR');

  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : Minus;
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-400';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{formattedValue}</span>
        {trend && <TrendIcon className={cn("w-5 h-5", trendColor)} />}
      </div>
    </div>
  );
};

const AlertItem = ({ alert, onAction }: { alert: Alert; onAction: () => void }) => {
  const severityColors = {
    critical: 'bg-red-100 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-200',
    high: 'bg-orange-100 border-orange-200 text-orange-800 dark:bg-orange-900/30 dark:border-orange-800 dark:text-orange-200',
    medium: 'bg-yellow-100 border-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-200',
    low: 'bg-blue-100 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-200'
  };

  const executiveLabels = {
    cfo: '🏦 CFO',
    cto: '🔧 CTO',
    cmo: '📈 CMO',
    chro: '👥 CHRO',
    all: '🏢 Todos'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "p-4 rounded-xl border transition-all hover:shadow-md cursor-pointer",
        severityColors[alert.severity]
      )}
      onClick={onAction}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium opacity-70">
              {executiveLabels[alert.executive]}
            </span>
            <Badge variant={alert.severity === 'critical' ? 'danger' : 'secondary'} className="text-xs">
              {alert.severity.toUpperCase()}
            </Badge>
          </div>
          <h4 className="font-semibold">{alert.title}</h4>
          <p className="text-sm opacity-80 mt-1">{alert.description}</p>
        </div>
        <ChevronRight className="w-5 h-5 opacity-50" />
      </div>
    </motion.div>
  );
};

// =====================================================
// PÁGINA PRINCIPAL
// =====================================================

export default function DiretoriaPage() {
  const [selectedExecutive, setSelectedExecutive] = useState<ExecutiveType>('all');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [dashboard] = useState(mockDashboard);
  const chatRef = useRef<HTMLDivElement>(null);

  // Scroll para última mensagem
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Mensagem inicial
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `Olá! Sou a Diretoria Virtual da Valle 360. Posso te ajudar com análises financeiras (CFO), operacionais (CTO), de clientes (CMO) ou de pessoas (CHRO). Como posso ajudar hoje?`,
        executive: 'all',
        timestamp: new Date()
      }]);
    }
  }, [messages.length]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/csuite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage,
          executive: selectedExecutive
        })
      });

      if (!response.ok) throw new Error('Erro na API');

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        executive: data.executive,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao processar mensagem');
      
      // Resposta simulada em caso de erro
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Baseado nos dados atuais, posso informar que a empresa está com saúde geral de ${dashboard.healthScore}%. Temos ${dashboard.consolidatedAlerts.length} alertas ativos, sendo ${dashboard.consolidatedAlerts.filter(a => a.severity === 'critical').length} críticos. Posso detalhar algum ponto específico?`,
        executive: selectedExecutive,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAlertAction = (alert: Alert) => {
    toast.info(`Ação para: ${alert.title}`);
    setInputMessage(`Me fale mais sobre "${alert.title}" e como resolver.`);
  };

  const handleExportReport = () => {
    toast.success('Relatório executivo sendo gerado...');
    // Implementar geração de PDF
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              🏢 Diretoria Virtual
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              C-Suite com Inteligência Artificial
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => toast.info('Atualizando dados...')}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5 text-gray-500" />
            </button>
            <button
              onClick={handleExportReport}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Relatório Executivo
            </button>
          </div>
        </div>

        {/* Health Score */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white",
                dashboard.healthScore >= 80 ? "bg-gradient-to-br from-green-500 to-emerald-600" :
                dashboard.healthScore >= 60 ? "bg-gradient-to-br from-yellow-500 to-orange-600" :
                "bg-gradient-to-br from-red-500 to-rose-600"
              )}>
                {dashboard.healthScore}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Saúde da Empresa</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{dashboard.summary}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {dashboard.consolidatedAlerts.filter(a => a.severity === 'critical').length > 0 && (
                <Badge variant="danger" className="animate-pulse">
                  {dashboard.consolidatedAlerts.filter(a => a.severity === 'critical').length} Críticos
                </Badge>
              )}
            </div>
          </div>
          <Progress value={dashboard.healthScore} className="h-2" />
        </div>

        {/* Executive Selection */}
        <div className="flex gap-4 overflow-x-auto pb-2">
          <ExecutiveCard
            type="all"
            name="Todos"
            icon={Building2}
            color="indigo"
            alertCount={dashboard.consolidatedAlerts.length}
            isSelected={selectedExecutive === 'all'}
            onClick={() => setSelectedExecutive('all')}
          />
          <ExecutiveCard
            type="cfo"
            name="CFO"
            icon={DollarSign}
            color="emerald"
            alertCount={dashboard.cfo?.alerts?.length || 0}
            isSelected={selectedExecutive === 'cfo'}
            onClick={() => setSelectedExecutive('cfo')}
          />
          <ExecutiveCard
            type="cto"
            name="CTO"
            icon={Settings}
            color="blue"
            alertCount={dashboard.cto?.alerts?.length || 0}
            isSelected={selectedExecutive === 'cto'}
            onClick={() => setSelectedExecutive('cto')}
          />
          <ExecutiveCard
            type="cmo"
            name="CMO"
            icon={TrendingUp}
            color="purple"
            alertCount={dashboard.cmo?.alerts?.length || 0}
            isSelected={selectedExecutive === 'cmo'}
            onClick={() => setSelectedExecutive('cmo')}
          />
          <ExecutiveCard
            type="chro"
            name="CHRO"
            icon={Heart}
            color="rose"
            alertCount={dashboard.chro?.alerts?.length || 0}
            isSelected={selectedExecutive === 'chro'}
            onClick={() => setSelectedExecutive('chro')}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* KPIs & Alerts */}
          <div className="lg:col-span-2 space-y-6">
            {/* KPIs por Executivo */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                KPIs Principais
              </h3>

              {selectedExecutive === 'all' || selectedExecutive === 'cfo' ? (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                    🏦 Financeiro (CFO)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <KPICard label="Receita" value={dashboard.cfo.kpis.totalRevenue} format="currency" trend="up" />
                    <KPICard label="Margem Média" value={dashboard.cfo.kpis.averageMargin} format="percent" />
                    <KPICard label="Crescimento" value={dashboard.cfo.kpis.revenueGrowth} format="percent" trend="up" />
                    <KPICard label="Lucro Bruto" value={dashboard.cfo.kpis.grossMargin} format="currency" />
                  </div>
                </div>
              ) : null}

              {selectedExecutive === 'all' || selectedExecutive === 'cto' ? (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                    🔧 Operações (CTO)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <KPICard label="Utilização" value={dashboard.cto.overview.totalUtilization} format="percent" trend={dashboard.cto.overview.totalUtilization > 85 ? 'up' : 'stable'} />
                    <KPICard label="Eficiência" value={dashboard.cto.overview.averageEfficiency} format="percent" />
                    <KPICard label="Gargalos" value={dashboard.cto.overview.bottlenecks} />
                    <KPICard label="Economia Potencial" value={dashboard.cto.overview.potentialSavings} />
                  </div>
                </div>
              ) : null}

              {selectedExecutive === 'all' || selectedExecutive === 'cmo' ? (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                    📈 Clientes (CMO)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <KPICard label="Clientes Ativos" value={dashboard.cmo.kpis.activeClients} />
                    <KPICard label="Taxa Churn" value={dashboard.cmo.kpis.churnRate} format="percent" trend="down" />
                    <KPICard label="NPS" value={dashboard.cmo.kpis.npsAverage} />
                    <KPICard label="Pipeline Upsell" value={dashboard.cmo.kpis.upsellPipeline} format="currency" />
                  </div>
                </div>
              ) : null}

              {selectedExecutive === 'all' || selectedExecutive === 'chro' ? (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                    👥 Pessoas (CHRO)
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <KPICard label="Colaboradores" value={dashboard.chro.kpis.totalEmployees} />
                    <KPICard label="Performance" value={dashboard.chro.kpis.averagePerformance} format="percent" />
                    <KPICard label="Engajamento" value={dashboard.chro.kpis.averageEngagement} format="percent" />
                    <KPICard label="Risco Turnover" value={dashboard.chro.kpis.turnoverRate} format="percent" trend="down" />
                  </div>
                </div>
              ) : null}
            </div>

            {/* Alertas */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Alertas da Diretoria
              </h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {dashboard.consolidatedAlerts
                  .filter(a => selectedExecutive === 'all' || a.executive === selectedExecutive)
                  .map(alert => (
                    <AlertItem 
                      key={alert.id} 
                      alert={alert} 
                      onAction={() => handleAlertAction(alert)} 
                    />
                  ))}
              </div>
            </div>
          </div>

          {/* Chat */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col h-[700px]">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Chat C-Suite</h3>
                  <p className="text-xs text-gray-500">
                    Conversando com: {selectedExecutive === 'all' ? 'Toda Diretoria' : selectedExecutive.toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowChat(!showChat)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {showChat ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
            </div>

            <AnimatePresence>
              {showChat && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  {/* Messages */}
                  <div 
                    ref={chatRef}
                    className="flex-1 overflow-y-auto p-4 space-y-4"
                  >
                    {messages.map(msg => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "flex",
                          msg.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div className={cn(
                          "max-w-[85%] rounded-2xl px-4 py-3",
                          msg.role === 'user'
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        )}>
                          {msg.role === 'assistant' && msg.executive && (
                            <div className="text-xs opacity-70 mb-1">
                              {msg.executive === 'all' ? '🏢 Diretoria' : 
                               msg.executive === 'cfo' ? '🏦 CFO' :
                               msg.executive === 'cto' ? '🔧 CTO' :
                               msg.executive === 'cmo' ? '📈 CMO' : '👥 CHRO'}
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </motion.div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Pergunte à diretoria..."
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={isLoading}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={isLoading || !inputMessage.trim()}
                        className="px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {[
                        'Qual a saúde financeira?',
                        'Tem gargalo operacional?',
                        'Clientes em risco?',
                        'Equipe está bem?'
                      ].map((q, i) => (
                        <button
                          key={i}
                          onClick={() => setInputMessage(q)}
                          className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

