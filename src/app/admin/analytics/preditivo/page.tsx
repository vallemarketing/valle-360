'use client';

/**
 * Valle 360 - Dashboard SQL Preditivo
 * Análises preditivas com IA para tomada de decisão
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  DollarSign,
  Calendar,
  RefreshCw,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Zap,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Shield,
  Eye,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =====================================================
// TIPOS
// =====================================================

interface PredictionCard {
  id: string;
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
  description: string;
  period: string;
}

interface ChurnRisk {
  clientId: string;
  clientName: string;
  risk: number;
  factors: string[];
  lastActivity: string;
  revenueAtRisk: number;
}

interface Alert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  description: string;
  action?: string;
  createdAt: string;
}

// =====================================================
// MOCK DATA
// =====================================================

const mockPredictions: PredictionCard[] = [
  {
    id: 'revenue',
    title: 'Receita Projetada',
    value: 'R$ 485k',
    change: 12.5,
    trend: 'up',
    confidence: 87,
    description: 'Projeção para os próximos 30 dias',
    period: 'Próximo mês'
  },
  {
    id: 'churn',
    title: 'Risco de Churn',
    value: '3 clientes',
    change: -2,
    trend: 'down',
    confidence: 92,
    description: 'Clientes com alta probabilidade de cancelamento',
    period: 'Próximos 60 dias'
  },
  {
    id: 'growth',
    title: 'Crescimento Estimado',
    value: '+18%',
    change: 5.2,
    trend: 'up',
    confidence: 78,
    description: 'Crescimento projetado da base de clientes',
    period: 'Próximo trimestre'
  },
  {
    id: 'nps',
    title: 'NPS Projetado',
    value: '72',
    change: 3,
    trend: 'up',
    confidence: 85,
    description: 'Tendência baseada em sentimento atual',
    period: 'Próximo mês'
  }
];

const mockChurnRisks: ChurnRisk[] = [
  {
    clientId: 'c1',
    clientName: 'Sabor & Arte',
    risk: 78,
    factors: ['NPS baixo', 'Engajamento reduzido', 'Reclamações recentes'],
    lastActivity: '2024-11-15',
    revenueAtRisk: 3500
  },
  {
    clientId: 'c2',
    clientName: 'Tech Solutions',
    risk: 45,
    factors: ['Mudança de responsável', 'Atraso em pagamentos'],
    lastActivity: '2024-12-01',
    revenueAtRisk: 12000
  },
  {
    clientId: 'c3',
    clientName: 'Fashion Store',
    risk: 32,
    factors: ['Redução de investimento'],
    lastActivity: '2024-12-03',
    revenueAtRisk: 5500
  }
];

const mockAlerts: Alert[] = [
  {
    id: 'a1',
    type: 'danger',
    title: 'Alto risco de churn detectado',
    description: 'Cliente "Sabor & Arte" apresenta 78% de probabilidade de cancelamento nos próximos 60 dias.',
    action: 'Agendar reunião urgente',
    createdAt: '2024-12-05T10:00:00Z'
  },
  {
    id: 'a2',
    type: 'warning',
    title: 'Queda no engajamento',
    description: '5 clientes apresentaram redução de 30% no engajamento nas últimas 2 semanas.',
    action: 'Ver clientes afetados',
    createdAt: '2024-12-05T09:30:00Z'
  },
  {
    id: 'a3',
    type: 'info',
    title: 'Oportunidade de upsell identificada',
    description: '3 clientes têm perfil compatível com o pacote "Social Media Completo".',
    action: 'Ver oportunidades',
    createdAt: '2024-12-05T08:00:00Z'
  }
];

// =====================================================
// COMPONENTES
// =====================================================

function PredictionCardComponent({ prediction }: { prediction: PredictionCard }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">{prediction.title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{prediction.value}</p>
        </div>
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium",
          prediction.trend === 'up' && prediction.change > 0 && "bg-green-100 text-green-700",
          prediction.trend === 'down' && prediction.change < 0 && "bg-red-100 text-red-700",
          prediction.trend === 'stable' && "bg-gray-100 text-gray-700"
        )}>
          {prediction.trend === 'up' ? (
            <ArrowUpRight className="w-4 h-4" />
          ) : prediction.trend === 'down' ? (
            <ArrowDownRight className="w-4 h-4" />
          ) : null}
          {Math.abs(prediction.change)}%
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">{prediction.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-500" />
          <span className="text-xs text-gray-500">Confiança: {prediction.confidence}%</span>
        </div>
        <span className="text-xs text-gray-400">{prediction.period}</span>
      </div>
    </motion.div>
  );
}

function ChurnRiskRow({ risk, onAction }: { risk: ChurnRisk; onAction: () => void }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold",
          risk.risk >= 70 ? "bg-red-500" : risk.risk >= 40 ? "bg-yellow-500" : "bg-green-500"
        )}>
          {risk.risk}%
        </div>
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white">{risk.clientName}</h4>
          <div className="flex flex-wrap gap-1 mt-1">
            {risk.factors.slice(0, 2).map((factor, idx) => (
              <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                {factor}
              </span>
            ))}
            {risk.factors.length > 2 && (
              <span className="text-xs text-gray-400">+{risk.factors.length - 2}</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-red-600">R$ {risk.revenueAtRisk.toLocaleString('pt-BR')}</p>
          <p className="text-xs text-gray-500">em risco</p>
        </div>
        <button
          onClick={onAction}
          className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
        >
          Ação
        </button>
      </div>
    </div>
  );
}

function AlertCard({ alert }: { alert: Alert }) {
  const config = {
    danger: { bg: 'bg-red-50', border: 'border-red-200', icon: AlertTriangle, iconColor: 'text-red-600' },
    warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: AlertTriangle, iconColor: 'text-yellow-600' },
    info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: Zap, iconColor: 'text-blue-600' }
  }[alert.type];

  const Icon = config.icon;

  return (
    <div className={cn("p-4 rounded-xl border", config.bg, config.border)}>
      <div className="flex items-start gap-3">
        <Icon className={cn("w-5 h-5 mt-0.5", config.iconColor)} />
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{alert.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
          {alert.action && (
            <button className="text-sm text-blue-600 font-medium mt-2 flex items-center gap-1 hover:underline">
              {alert.action}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
        <span className="text-xs text-gray-400">
          {new Date(alert.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

// =====================================================
// PÁGINA PRINCIPAL
// =====================================================

export default function PreditivoPage() {
  const [predictions] = useState<PredictionCard[]>(mockPredictions);
  const [churnRisks] = useState<ChurnRisk[]>(mockChurnRisks);
  const [alerts] = useState<Alert[]>(mockAlerts);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  const totalRevenueAtRisk = churnRisks.reduce((sum, r) => sum + r.revenueAtRisk, 0);

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Preditivo</h1>
              <p className="text-sm text-gray-500">Insights e previsões baseadas em IA</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={e => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
            </select>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
              Atualizar
            </button>
          </div>
        </div>

        {/* Prediction Cards */}
        <div className="grid grid-cols-4 gap-4">
          {predictions.map(prediction => (
            <PredictionCardComponent key={prediction.id} prediction={prediction} />
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-6">
          {/* Churn Analysis */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Análise de Churn</h2>
                <p className="text-sm text-gray-500">Clientes com maior risco de cancelamento</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-medium">R$ {totalRevenueAtRisk.toLocaleString('pt-BR')} em risco</span>
              </div>
            </div>

            <div className="space-y-3">
              {churnRisks.map(risk => (
                <ChurnRiskRow
                  key={risk.clientId}
                  risk={risk}
                  onAction={() => console.log('Action for', risk.clientName)}
                />
              ))}
            </div>

            {/* Revenue Projection Chart Placeholder */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Projeção de Receita</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center text-gray-400">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Gráfico de projeção de receita</p>
                  <p className="text-sm">Próximos 6 meses</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">+15%</p>
                  <p className="text-xs text-green-600">Cenário Otimista</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">+8%</p>
                  <p className="text-xs text-blue-600">Cenário Esperado</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">+2%</p>
                  <p className="text-xs text-yellow-600">Cenário Conservador</p>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts & Insights */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Alertas Inteligentes</h2>
              <div className="space-y-3">
                {alerts.map(alert => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-bold">Insight da Val IA</h3>
              </div>
              <p className="text-white/90 text-sm leading-relaxed mb-4">
                Com base nos dados atuais, identificamos que clientes do setor de{' '}
                <strong>e-commerce</strong> apresentam 40% mais engajamento que a média.
                Recomendamos focar a prospecção neste segmento para os próximos 30 dias.
              </p>
              <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
                Ver Análise Completa
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Ações Recomendadas</h3>
              <div className="space-y-2">
                {[
                  { icon: Users, label: 'Contatar clientes em risco', count: 3 },
                  { icon: Target, label: 'Oportunidades de upsell', count: 5 },
                  { icon: Calendar, label: 'Reuniões a agendar', count: 2 }
                ].map((action, idx) => (
                  <button
                    key={idx}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <action.icon className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-700">{action.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                        {action.count}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

