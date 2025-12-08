'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Clock, AlertTriangle, CheckCircle2, 
  BarChart3, Users, Zap, Target, ArrowUp, ArrowDown,
  Brain, Sparkles, Calendar, ChevronRight, Play,
  X, ThumbsUp, MessageSquare, Mail, Send, Eye, Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface KanbanCard {
  id: string;
  title: string;
  clientName?: string;
  assignees: string[];
  dueDate?: Date;
  temperature: 'hot' | 'warm' | 'cold';
}

interface KanbanInsightsProps {
  columns: {
    id: string;
    title: string;
    color: string;
    cards: KanbanCard[];
  }[];
  area: string;
}

type ModalType = 'overdue' | 'pending' | 'inProgress' | 'praise' | 'charge' | null;

export default function KanbanInsights({ columns, area }: KanbanInsightsProps) {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedCards, setSelectedCards] = useState<KanbanCard[]>([]);
  const [selectedCollaborator, setSelectedCollaborator] = useState<string>('');
  const [messageGenerated, setMessageGenerated] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  // Calcular métricas
  const totalCards = columns.reduce((acc, col) => acc + col.cards.length, 0);
  const completedCards = columns.find(c => c.id === 'concluido' || c.id === 'recebido' || c.id === 'pago')?.cards.length || 0;
  const inProgressCards = columns.filter(c => c.id === 'em_progresso' || c.id === 'em_producao' || c.id === 'producao').flatMap(c => c.cards);
  const pendingCards = columns.filter(c => c.id === 'demandas' || c.id === 'pendente' || c.id === 'a_faturar' || c.id === 'briefing').flatMap(c => c.cards);

  // Cards atrasados (com due_date no passado e não concluídos)
  const today = new Date();
  const overdueCards = columns
    .filter(c => !['concluido', 'recebido', 'pago', 'arquivado'].includes(c.id))
    .flatMap(c => c.cards)
    .filter(card => card.dueDate && new Date(card.dueDate) < today);

  // Todos os colaboradores
  const allCollaborators = [...new Set(columns.flatMap(c => c.cards.flatMap(card => card.assignees)))];

  // Taxa de conclusão
  const completionRate = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0;

  // Identificar gargalos (fase com mais cards)
  const bottleneck = columns
    .filter(c => !['concluido', 'recebido', 'pago', 'arquivado'].includes(c.id))
    .reduce((max, col) => col.cards.length > max.cards.length ? col : max, columns[0]);

  // Calcular tempo médio por fase (simulado)
  const avgTimePerPhase = {
    demandas: 2.5,
    em_progresso: 3.2,
    revisao: 1.1,
    aprovacao: 2.8,
  };

  // Handler para clicar nos cards de insights
  const handleInsightClick = (type: 'overdue' | 'pending' | 'inProgress') => {
    switch (type) {
      case 'overdue':
        setSelectedCards(overdueCards);
        break;
      case 'pending':
        setSelectedCards(pendingCards);
        break;
      case 'inProgress':
        setSelectedCards(inProgressCards);
        break;
    }
    setActiveModal(type);
  };

  // Handler para elogiar colaborador
  const handlePraise = async (collaborator: string) => {
    setSelectedCollaborator(collaborator);
    setIsGenerating(true);
    setActiveModal('praise');
    
    // Simular geração de mensagem por IA
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const praiseMessages = [
      `Olá ${collaborator}! 🎉\n\nQuero parabenizá-lo(a) pelo excelente trabalho realizado! Sua dedicação e comprometimento têm feito toda a diferença nos resultados da equipe.\n\nContinue assim! Você é um exemplo para todos nós.\n\n💪 Seu desempenho nas entregas está acima da média\n⭐ Qualidade impecável do trabalho\n🚀 Sempre dentro do prazo\n\nMuito obrigado por fazer parte do nosso time!`,
      `Oi ${collaborator}! 🌟\n\nPassando para reconhecer seu trabalho excepcional! Percebi que você tem se destacado muito nas últimas entregas.\n\n✨ Performance: Excelente\n📊 Entregas: 100% no prazo\n🎯 Qualidade: Superior\n\nSeu comprometimento é inspirador. Continue brilhando!`,
    ];
    
    setMessageGenerated(praiseMessages[Math.floor(Math.random() * praiseMessages.length)]);
    setIsGenerating(false);
  };

  // Handler para cobrar colaborador
  const handleCharge = async (collaborator: string, cards: KanbanCard[]) => {
    setSelectedCollaborator(collaborator);
    setSelectedCards(cards);
    setIsGenerating(true);
    setActiveModal('charge');
    
    // Simular geração de mensagem por IA
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const cardTitles = cards.map(c => `• ${c.title}`).join('\n');
    
    setMessageGenerated(
      `Olá ${collaborator}! 👋\n\nEspero que esteja bem. Preciso alinhar com você sobre algumas demandas que precisam de atenção:\n\n${cardTitles}\n\nPodemos conversar sobre o andamento? Estou disponível para ajudar caso precise de suporte ou tenha algum impedimento.\n\nAguardo seu retorno! 🙏`
    );
    setIsGenerating(false);
  };

  // Handler para enviar mensagem
  const handleSendMessage = () => {
    setMessageSent(true);
    setTimeout(() => {
      setActiveModal(null);
      setMessageSent(false);
      setMessageGenerated('');
      setSelectedCollaborator('');
    }, 2000);
  };

  // Handler para copiar mensagem
  const handleCopyMessage = () => {
    navigator.clipboard.writeText(messageGenerated);
    alert('✅ Mensagem copiada!');
  };

  const insights = [
    {
      id: 'completion',
      title: 'Taxa de Conclusão',
      value: `${completionRate}%`,
      change: '+12%',
      positive: true,
      icon: CheckCircle2,
      color: '#10b981',
      clickable: false,
    },
    {
      id: 'in_progress',
      title: 'Em Andamento',
      value: inProgressCards.length.toString(),
      subtitle: 'cards ativos',
      icon: Zap,
      color: '#f97316',
      clickable: true,
      onClick: () => handleInsightClick('inProgress'),
    },
    {
      id: 'pending',
      title: 'Aguardando',
      value: pendingCards.length.toString(),
      subtitle: 'na fila',
      icon: Clock,
      color: '#6366f1',
      clickable: true,
      onClick: () => handleInsightClick('pending'),
    },
    {
      id: 'overdue',
      title: 'Atrasados',
      value: overdueCards.length.toString(),
      subtitle: overdueCards.length > 0 ? 'atenção!' : 'nenhum',
      icon: AlertTriangle,
      color: overdueCards.length > 0 ? '#ef4444' : '#10b981',
      alert: overdueCards.length > 0,
      clickable: overdueCards.length > 0,
      onClick: () => handleInsightClick('overdue'),
    },
  ];

  return (
    <>
      <div className="bg-white rounded-xl border shadow-sm p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            Insights do Kanban
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {area}
            </span>
            {/* Botões de Ação Rápida */}
            <div className="flex gap-1">
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                onClick={() => {
                  if (allCollaborators.length > 0) {
                    handlePraise(allCollaborators[0]);
                  }
                }}
              >
                <ThumbsUp className="w-3 h-3 mr-1" />
                Elogiar
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs text-orange-600 border-orange-500/30 hover:bg-orange-500/10"
                onClick={() => {
                  if (overdueCards.length > 0 && overdueCards[0].assignees.length > 0) {
                    handleCharge(overdueCards[0].assignees[0], overdueCards.filter(c => c.assignees.includes(overdueCards[0].assignees[0])));
                  }
                }}
              >
                <MessageSquare className="w-3 h-3 mr-1" />
                Cobrar
              </Button>
            </div>
          </div>
        </div>

        {/* Métricas principais - agora clicáveis */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={insight.clickable ? insight.onClick : undefined}
                className={cn(
                  "p-3 rounded-xl border transition-all",
                  insight.alert ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-gray-50',
                  insight.clickable && 'cursor-pointer hover:shadow-md hover:scale-[1.02]'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${insight.color}20` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: insight.color }} />
                  </div>
                  <span className="text-xs text-gray-500">{insight.title}</span>
                  {insight.clickable && (
                    <Eye className="w-3 h-3 text-gray-400 ml-auto" />
                  )}
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
            <div 
              className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg cursor-pointer hover:bg-red-100 transition-colors"
              onClick={() => handleInsightClick('overdue')}
            >
              <Clock className="w-4 h-4 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">
                  {overdueCards.length} {overdueCards.length === 1 ? 'card atrasado' : 'cards atrasados'}
                </p>
                <p className="text-xs text-red-700">
                  {overdueCards.slice(0, 3).map(c => c.title).join(', ')}
                  {overdueCards.length > 3 && ` e mais ${overdueCards.length - 3}`}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-red-400" />
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

        {/* ===== SEÇÃO DE IA AVANÇADA ===== */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Brain className="w-4 h-4 text-[#1672d6]" />
              Sugestões da Val (IA)
              <Badge className="bg-[#1672d6]/10 text-[#1672d6] border-[#1672d6]/30 text-[10px]">
                <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                AI
              </Badge>
            </h4>
          </div>

          <div className="space-y-2">
            {/* Sugestão de Priorização */}
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-3 rounded-lg bg-gradient-to-r from-[#1672d6]/5 to-transparent border border-[#1672d6]/20 cursor-pointer hover:border-[#1672d6]/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#1672d6]/10 flex items-center justify-center">
                    <Target className="w-4 h-4 text-[#1672d6]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Repriorizar Tarefas</p>
                    <p className="text-xs text-gray-500">2 cards podem ser antecipados baseado em dependências</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="text-[#1672d6]">
                  <Play className="w-3 h-3 mr-1" />
                  Executar
                </Button>
              </div>
            </motion.div>

            {/* Previsão de Conclusão */}
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-3 rounded-lg bg-gradient-to-r from-emerald-500/5 to-transparent border border-emerald-500/20 cursor-pointer hover:border-emerald-500/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Previsão de Conclusão</p>
                    <p className="text-xs text-gray-500">
                      Estimativa: <strong className="text-emerald-600">85%</strong> das tarefas até sexta-feira
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </motion.div>

            {/* Alerta de Sobrecarga */}
            {inProgressCards.length > 5 && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="p-3 rounded-lg bg-gradient-to-r from-amber-500/5 to-transparent border border-amber-500/20"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Equipe Sobrecarregada</p>
                    <p className="text-xs text-gray-500">
                      Considere redistribuir {inProgressCards.length - 3} cards para outros colaboradores
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Otimização de Fluxo */}
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="p-3 rounded-lg bg-gradient-to-r from-purple-500/5 to-transparent border border-purple-500/20 cursor-pointer hover:border-purple-500/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Otimizar Fluxo</p>
                    <p className="text-xs text-gray-500">Analisar e sugerir melhorias no processo</p>
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="text-purple-600">
                  Analisar
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Colaboradores para Elogiar/Cobrar */}
        {allCollaborators.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-gray-500 mb-2">Colaboradores Ativos</p>
            <div className="flex flex-wrap gap-2">
              {allCollaborators.map(collaborator => {
                const collabCards = columns.flatMap(c => c.cards.filter(card => card.assignees.includes(collaborator)));
                const hasOverdue = collabCards.some(c => c.dueDate && new Date(c.dueDate) < today);
                
                return (
                  <div 
                    key={collaborator}
                    className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium text-sm">
                      {collaborator.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{collaborator}</p>
                      <p className="text-xs text-gray-500">{collabCards.length} cards</p>
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 w-7 p-0 text-emerald-600 hover:bg-emerald-50"
                        onClick={() => handlePraise(collaborator)}
                        title="Elogiar"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </Button>
                      {hasOverdue && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 w-7 p-0 text-orange-600 hover:bg-orange-50"
                          onClick={() => handleCharge(collaborator, collabCards.filter(c => c.dueDate && new Date(c.dueDate) < today))}
                          title="Cobrar"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Cards */}
      <AnimatePresence>
        {(activeModal === 'overdue' || activeModal === 'pending' || activeModal === 'inProgress') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[80vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-3 rounded-xl",
                      activeModal === 'overdue' ? 'bg-red-100' : 
                      activeModal === 'pending' ? 'bg-indigo-100' : 'bg-orange-100'
                    )}>
                      {activeModal === 'overdue' ? <AlertTriangle className="w-6 h-6 text-red-600" /> :
                       activeModal === 'pending' ? <Clock className="w-6 h-6 text-indigo-600" /> :
                       <Zap className="w-6 h-6 text-orange-600" />}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {activeModal === 'overdue' ? 'Cards Atrasados' :
                         activeModal === 'pending' ? 'Cards Aguardando' : 'Cards em Andamento'}
                      </h2>
                      <p className="text-sm text-gray-500">{selectedCards.length} demandas</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setActiveModal(null)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="p-6 overflow-auto max-h-[50vh] space-y-3">
                {selectedCards.map((card) => (
                  <div 
                    key={card.id}
                    className={cn(
                      "p-4 rounded-xl border transition-all hover:shadow-md",
                      activeModal === 'overdue' ? 'bg-red-50 border-red-200' :
                      activeModal === 'pending' ? 'bg-indigo-50 border-indigo-200' : 
                      'bg-orange-50 border-orange-200'
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{card.title}</h4>
                      <Badge className={cn(
                        "text-white text-xs",
                        card.temperature === 'hot' ? 'bg-red-500' :
                        card.temperature === 'warm' ? 'bg-orange-500' : 'bg-blue-500'
                      )}>
                        {card.temperature === 'hot' ? 'Quente' : card.temperature === 'warm' ? 'Morno' : 'Frio'}
                      </Badge>
                    </div>
                    {card.clientName && (
                      <p className="text-sm text-gray-600 mb-2">Cliente: {card.clientName}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {card.assignees.map((a, i) => (
                          <div 
                            key={i}
                            className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
                            title={a}
                          >
                            {a.charAt(0)}
                          </div>
                        ))}
                        <span className="text-xs text-gray-500">{card.assignees.join(', ')}</span>
                      </div>
                      <div className="flex gap-1">
                        {card.assignees.map((assignee) => (
                          <React.Fragment key={assignee}>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-7 px-2 text-xs text-emerald-600"
                              onClick={() => handlePraise(assignee)}
                            >
                              <ThumbsUp className="w-3 h-3 mr-1" />
                              Elogiar
                            </Button>
                            {activeModal === 'overdue' && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-7 px-2 text-xs text-orange-600"
                                onClick={() => handleCharge(assignee, [card])}
                              >
                                <MessageSquare className="w-3 h-3 mr-1" />
                                Cobrar
                              </Button>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Elogio */}
      <AnimatePresence>
        {activeModal === 'praise' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => !isGenerating && setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-emerald-100">
                    <ThumbsUp className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Elogiar Colaborador</h2>
                    <p className="text-sm text-gray-500">Mensagem para {selectedCollaborator}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
                    <p className="text-gray-600">Gerando mensagem com IA...</p>
                  </div>
                ) : messageSent ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4" />
                    <p className="text-xl font-bold text-gray-900">Mensagem Enviada!</p>
                    <p className="text-gray-500 mt-2">O colaborador será notificado.</p>
                  </div>
                ) : (
                  <>
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 mb-4">
                      <p className="whitespace-pre-line text-gray-700">{messageGenerated}</p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleCopyMessage}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar
                      </Button>
                      <Button
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                        onClick={handleSendMessage}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Enviar
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Cobrança */}
      <AnimatePresence>
        {activeModal === 'charge' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => !isGenerating && setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-orange-100">
                    <MessageSquare className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Cobrar Colaborador</h2>
                    <p className="text-sm text-gray-500">Mensagem para {selectedCollaborator}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mb-4" />
                    <p className="text-gray-600">Gerando mensagem com IA...</p>
                  </div>
                ) : messageSent ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <CheckCircle2 className="w-16 h-16 text-orange-500 mb-4" />
                    <p className="text-xl font-bold text-gray-900">Mensagem Enviada!</p>
                    <p className="text-gray-500 mt-2">O colaborador será notificado.</p>
                  </div>
                ) : (
                  <>
                    <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 mb-4">
                      <p className="whitespace-pre-line text-gray-700">{messageGenerated}</p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleCopyMessage}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar
                      </Button>
                      <Button
                        className="flex-1 bg-orange-600 hover:bg-orange-700"
                        onClick={handleSendMessage}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Enviar
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
