'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Clock, AlertTriangle, CheckCircle2, 
  BarChart3, Users, Zap, Target, ArrowUp, ArrowDown
} from 'lucide-react';

interface KanbanInsightsProps {
  columns: {
    id: string;
    title: string;
    color: string;
    cards: any[];
  }[];
  area: string;
}

export default function KanbanInsights({ columns, area }: KanbanInsightsProps) {
  // Calcular métricas
  const totalCards = columns.reduce((acc, col) => acc + col.cards.length, 0);
  const completedCards = columns.find(c => c.id === 'concluido' || c.id === 'recebido' || c.id === 'pago')?.cards.length || 0;
  const inProgressCards = columns.find(c => c.id === 'em_progresso')?.cards.length || 0;
  const pendingCards = columns.find(c => c.id === 'demandas' || c.id === 'pendente' || c.id === 'a_faturar')?.cards.length || 0;

  // Cards atrasados (com due_date no passado e não concluídos)
  const today = new Date();
  const overdueCards = columns
    .filter(c => !['concluido', 'recebido', 'pago', 'arquivado'].includes(c.id))
    .flatMap(c => c.cards)
    .filter(card => card.dueDate && new Date(card.dueDate) < today);

  // Calcular tempo médio por fase (simulado)
  const avgTimePerPhase = {
    demandas: 2.5,
    em_progresso: 3.2,
    revisao: 1.1,
    aprovacao: 2.8,
  };

  // Taxa de conclusão
  const completionRate = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;

  // Identificar gargalos (fase com mais cards)
  const bottleneck = columns
    .filter(c => !['concluido', 'recebido', 'pago', 'arquivado'].includes(c.id))
    .reduce((max, col) => col.cards.length > max.cards.length ? col : max, columns[0]);

  const insights = [
    {
      id: 'completion',
      title: 'Taxa de Conclusão',
      value: `${completionRate}%`,
      change: '+12%',
      positive: true,
      icon: CheckCircle2,
      color: '#10b981',
    },
    {
      id: 'in_progress',
      title: 'Em Andamento',
      value: inProgressCards.toString(),
      subtitle: 'cards ativos',
      icon: Zap,
      color: '#f97316',
    },
    {
      id: 'pending',
      title: 'Aguardando',
      value: pendingCards.toString(),
      subtitle: 'na fila',
      icon: Clock,
      color: '#6366f1',
    },
    {
      id: 'overdue',
      title: 'Atrasados',
      value: overdueCards.length.toString(),
      subtitle: overdueCards.length > 0 ? 'atenção!' : 'nenhum',
      icon: AlertTriangle,
      color: overdueCards.length > 0 ? '#ef4444' : '#10b981',
      alert: overdueCards.length > 0,
    },
  ];

  return (
    <div className="bg-white rounded-xl border shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-500" />
          Insights do Kanban
        </h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {area}
        </span>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-xl border ${insight.alert ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${insight.color}20` }}
                >
                  <Icon className="w-4 h-4" style={{ color: insight.color }} />
                </div>
                <span className="text-xs text-gray-500">{insight.title}</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold" style={{ color: insight.color }}>
                  {insight.value}
                </span>
                {insight.change && (
                  <span className={`text-xs flex items-center gap-0.5 ${insight.positive ? 'text-green-600' : 'text-red-600'}`}>
                    {insight.positive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {insight.change}
                  </span>
                )}
                {insight.subtitle && (
                  <span className="text-xs text-gray-400">{insight.subtitle}</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Insights inteligentes */}
      <div className="space-y-2">
        {/* Gargalo identificado */}
        {bottleneck && bottleneck.cards.length > 3 && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Gargalo identificado</p>
              <p className="text-xs text-amber-700">
                A fase <strong>{bottleneck.title}</strong> tem {bottleneck.cards.length} cards acumulados. 
                Considere redistribuir tarefas ou adicionar recursos.
              </p>
            </div>
          </div>
        )}

        {/* Cards atrasados */}
        {overdueCards.length > 0 && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <Clock className="w-4 h-4 text-red-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">
                {overdueCards.length} {overdueCards.length === 1 ? 'card atrasado' : 'cards atrasados'}
              </p>
              <p className="text-xs text-red-700">
                {overdueCards.slice(0, 3).map(c => c.title).join(', ')}
                {overdueCards.length > 3 && ` e mais ${overdueCards.length - 3}`}
              </p>
            </div>
          </div>
        )}

        {/* Boa performance */}
        {completionRate >= 70 && overdueCards.length === 0 && (
          <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <TrendingUp className="w-4 h-4 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">Excelente performance!</p>
              <p className="text-xs text-green-700">
                Sua taxa de conclusão está em {completionRate}% e não há cards atrasados. Continue assim!
              </p>
            </div>
          </div>
        )}

        {/* Tempo médio */}
        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Target className="w-4 h-4 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">Tempo médio por fase</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {Object.entries(avgTimePerPhase).map(([phase, days]) => (
                <span key={phase} className="text-xs bg-white px-2 py-0.5 rounded border border-blue-200">
                  {phase.replace('_', ' ')}: <strong>{days}d</strong>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Distribuição por fase */}
      <div className="mt-4 pt-4 border-t">
        <p className="text-xs text-gray-500 mb-2">Distribuição por fase</p>
        <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
          {columns.map((col, index) => {
            const percentage = totalCards > 0 ? (col.cards.length / totalCards) * 100 : 0;
            if (percentage === 0) return null;
            return (
              <motion.div
                key={col.id}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="h-full"
                style={{ backgroundColor: col.color }}
                title={`${col.title}: ${col.cards.length} cards (${Math.round(percentage)}%)`}
              />
            );
          })}
        </div>
        <div className="flex flex-wrap gap-3 mt-2">
          {columns.map(col => (
            <div key={col.id} className="flex items-center gap-1 text-xs">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: col.color }} 
              />
              <span className="text-gray-600">{col.title}</span>
              <span className="text-gray-400">({col.cards.length})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
