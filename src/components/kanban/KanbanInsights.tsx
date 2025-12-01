'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, Clock, AlertTriangle, CheckCircle2, 
  BarChart3, Users, Zap, Target, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

interface KanbanInsightsProps {
  columns: Array<{
    id: string;
    title: string;
    color: string;
    cards: Array<{
      id: string;
      title: string;
      dueDate?: Date;
      createdAt: Date;
      assignees: string[];
    }>;
  }>;
  area: string;
}

export function KanbanInsights({ columns, area }: KanbanInsightsProps) {
  // Calcular métricas
  const totalCards = columns.reduce((sum, col) => sum + col.cards.length, 0);
  const completedCards = columns.find(c => c.id === 'concluido')?.cards.length || 0;
  const inProgressCards = columns.find(c => c.id === 'em_progresso')?.cards.length || 0;
  const overdueCards = columns.flatMap(col => col.cards).filter(card => 
    card.dueDate && new Date(card.dueDate) < new Date() && 
    !columns.find(c => c.id === 'concluido')?.cards.includes(card)
  ).length;

  // Tempo médio por fase (simulado)
  const avgTimePerPhase = {
    demandas: 2.3,
    em_progresso: 4.5,
    revisao: 1.2,
    aprovacao: 2.8,
    concluido: 0
  };

  // Gargalos identificados
  const bottlenecks = columns
    .filter(col => col.id !== 'concluido' && col.id !== 'demandas')
    .sort((a, b) => b.cards.length - a.cards.length)
    .slice(0, 2);

  // Taxa de conclusão
  const completionRate = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;

  // Insights inteligentes baseados nos dados
  const insights = generateInsights(columns, area, overdueCards, completionRate);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Insights Inteligentes
        </h3>
        <span className="text-xs text-gray-500">{area}</span>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          label="Total de Cards"
          value={totalCards}
          icon={<BarChart3 className="w-4 h-4" />}
          color="blue"
        />
        <MetricCard
          label="Em Progresso"
          value={inProgressCards}
          icon={<Clock className="w-4 h-4" />}
          color="orange"
        />
        <MetricCard
          label="Concluídos"
          value={completedCards}
          icon={<CheckCircle2 className="w-4 h-4" />}
          color="green"
        />
        <MetricCard
          label="Atrasados"
          value={overdueCards}
          icon={<AlertTriangle className="w-4 h-4" />}
          color="red"
          highlight={overdueCards > 0}
        />
      </div>

      {/* Taxa de Conclusão */}
      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Taxa de Conclusão</span>
          <span className={`text-sm font-bold ${
            completionRate >= 70 ? 'text-green-600' : 
            completionRate >= 40 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {completionRate}%
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionRate}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              completionRate >= 70 ? 'bg-green-500' : 
              completionRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
          />
        </div>
      </div>

      {/* Gargalos */}
      {bottlenecks.length > 0 && bottlenecks[0].cards.length > 3 && (
        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-800">Gargalo Identificado</p>
              <p className="text-xs text-orange-600 mt-1">
                A fase "{bottlenecks[0].title}" tem {bottlenecks[0].cards.length} cards acumulados. 
                Considere redistribuir tarefas ou priorizar esta etapa.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Insights Inteligentes */}
      <div className="space-y-2">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-3 rounded-lg border ${
              insight.type === 'success' ? 'bg-green-50 border-green-200' :
              insight.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
              insight.type === 'danger' ? 'bg-red-50 border-red-200' :
              'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-start gap-2">
              {insight.type === 'success' ? (
                <TrendingUp className="w-4 h-4 text-green-500 mt-0.5" />
              ) : insight.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
              ) : insight.type === 'danger' ? (
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
              ) : (
                <Target className="w-4 h-4 text-blue-500 mt-0.5" />
              )}
              <div>
                <p className={`text-sm font-medium ${
                  insight.type === 'success' ? 'text-green-800' :
                  insight.type === 'warning' ? 'text-yellow-800' :
                  insight.type === 'danger' ? 'text-red-800' :
                  'text-blue-800'
                }`}>
                  {insight.title}
                </p>
                <p className={`text-xs mt-0.5 ${
                  insight.type === 'success' ? 'text-green-600' :
                  insight.type === 'warning' ? 'text-yellow-600' :
                  insight.type === 'danger' ? 'text-red-600' :
                  'text-blue-600'
                }`}>
                  {insight.message}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Distribuição por Fase */}
      <div className="pt-3 border-t">
        <p className="text-xs text-gray-500 mb-2">Distribuição por Fase</p>
        <div className="flex gap-1">
          {columns.map(col => {
            const percentage = totalCards > 0 ? (col.cards.length / totalCards) * 100 : 0;
            return (
              <div
                key={col.id}
                className="h-6 rounded transition-all hover:opacity-80 cursor-pointer group relative"
                style={{ 
                  backgroundColor: col.color,
                  width: `${Math.max(percentage, 5)}%`
                }}
                title={`${col.title}: ${col.cards.length} cards`}
              >
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {col.title}: {col.cards.length}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-1">
          {columns.map(col => (
            <span key={col.id} className="text-[10px] text-gray-400">{col.cards.length}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Componente de métrica
function MetricCard({ 
  label, 
  value, 
  icon, 
  color, 
  highlight = false 
}: { 
  label: string; 
  value: number; 
  icon: React.ReactNode; 
  color: 'blue' | 'green' | 'orange' | 'red';
  highlight?: boolean;
}) {
  const colors = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-500' },
    green: { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-500' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'text-orange-500' },
    red: { bg: 'bg-red-50', text: 'text-red-600', icon: 'text-red-500' }
  };

  return (
    <div className={`p-3 rounded-lg ${colors[color].bg} ${highlight ? 'ring-2 ring-red-300' : ''}`}>
      <div className={`${colors[color].icon} mb-1`}>{icon}</div>
      <p className={`text-xl font-bold ${colors[color].text}`}>{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

// Gerar insights baseados nos dados
function generateInsights(
  columns: any[], 
  area: string, 
  overdueCards: number,
  completionRate: number
): Array<{ type: 'success' | 'warning' | 'danger' | 'info'; title: string; message: string }> {
  const insights: Array<{ type: 'success' | 'warning' | 'danger' | 'info'; title: string; message: string }> = [];

  // Insight sobre atrasos
  if (overdueCards > 0) {
    insights.push({
      type: 'danger',
      title: `${overdueCards} card${overdueCards > 1 ? 's' : ''} atrasado${overdueCards > 1 ? 's' : ''}`,
      message: 'Priorize estas entregas para não impactar o cliente.'
    });
  }

  // Insight sobre taxa de conclusão
  if (completionRate >= 70) {
    insights.push({
      type: 'success',
      title: 'Excelente produtividade!',
      message: `Taxa de conclusão de ${completionRate}% está acima da média.`
    });
  } else if (completionRate < 30) {
    insights.push({
      type: 'warning',
      title: 'Atenção à produtividade',
      message: 'Muitos cards ainda não foram concluídos. Revise as prioridades.'
    });
  }

  // Insight sobre demandas acumuladas
  const demandasCount = columns.find(c => c.id === 'demandas')?.cards.length || 0;
  if (demandasCount > 10) {
    insights.push({
      type: 'warning',
      title: 'Muitas demandas pendentes',
      message: `${demandasCount} demandas aguardando início. Considere priorizar ou delegar.`
    });
  }

  // Insight sobre aprovação
  const aprovacaoCount = columns.find(c => c.id === 'aprovacao')?.cards.length || 0;
  if (aprovacaoCount > 5) {
    insights.push({
      type: 'info',
      title: 'Cards aguardando cliente',
      message: `${aprovacaoCount} cards estão aguardando aprovação do cliente.`
    });
  }

  // Insight positivo se tudo estiver bem
  if (insights.length === 0) {
    insights.push({
      type: 'success',
      title: 'Tudo em ordem!',
      message: 'Seu fluxo de trabalho está equilibrado. Continue assim!'
    });
  }

  return insights.slice(0, 3); // Limitar a 3 insights
}

