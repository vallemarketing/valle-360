"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { 
  Sparkles, 
  ArrowLeft,
  TrendingUp,
  Target,
  Clock,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Zap,
  Calendar,
  BarChart3,
  Users,
  MessageCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// PAINEL DE INSIGHTS IA - VALLE AI
// Recomendações inteligentes da Val
// ============================================

type InsightType = "oportunidade" | "melhoria" | "alerta" | "tendencia";
type InsightPriority = "alta" | "media" | "baixa";
type InsightStatus = "novo" | "em_analise" | "implementado" | "ignorado";

interface Insight {
  id: string;
  type: InsightType;
  priority: InsightPriority;
  status: InsightStatus;
  title: string;
  description: string;
  impact: string;
  action: string;
  metrics?: { before: string; after: string; improvement: string };
  createdAt: string;
}

const insights: Insight[] = [
  {
    id: "1",
    type: "oportunidade",
    priority: "alta",
    status: "novo",
    title: "Aumente publicações às 19h",
    description: "Análise dos últimos 30 dias mostra que seus seguidores são 45% mais ativos entre 19h e 21h. Ajustar horários de publicação pode aumentar significativamente o alcance.",
    impact: "+35% de alcance estimado",
    action: "Reagendar próximas publicações para o período de 19h-21h",
    createdAt: "2025-12-03"
  },
  {
    id: "2",
    type: "melhoria",
    priority: "alta",
    status: "em_analise",
    title: "Formato carrossel tem melhor desempenho",
    description: "Posts em carrossel tiveram 2.3x mais engajamento que imagens únicas. Recomendo aumentar a frequência deste formato.",
    impact: "+120% de engajamento",
    action: "Converter 50% dos posts de imagem única para carrossel",
    metrics: { before: "2.1%", after: "4.8%", improvement: "+128%" },
    createdAt: "2025-12-02"
  },
  {
    id: "3",
    type: "tendencia",
    priority: "media",
    status: "implementado",
    title: "Reels curtos dominam o algoritmo",
    description: "Vídeos de 15-30 segundos estão tendo alcance orgânico 3x maior. O algoritmo está priorizando conteúdo dinâmico e rápido.",
    impact: "+200% de alcance orgânico",
    action: "Produzir 2-3 Reels curtos por semana",
    metrics: { before: "5.2K", after: "15.8K", improvement: "+203%" },
    createdAt: "2025-11-28"
  },
  {
    id: "4",
    type: "alerta",
    priority: "alta",
    status: "novo",
    title: "Queda no engajamento de Stories",
    description: "Stories tiveram 25% menos visualizações na última semana. Pode indicar fadiga de conteúdo ou mudança de comportamento do público.",
    impact: "Risco de perda de 15% do alcance",
    action: "Diversificar formatos de Stories com enquetes, perguntas e bastidores",
    createdAt: "2025-12-03"
  },
  {
    id: "5",
    type: "oportunidade",
    priority: "media",
    status: "novo",
    title: "Hashtags com potencial inexplorado",
    description: "Identificamos 5 hashtags do seu nicho com alto volume e baixa competição que podem aumentar a descoberta do seu conteúdo.",
    impact: "+40% de descoberta",
    action: "Incluir as hashtags sugeridas nas próximas publicações",
    createdAt: "2025-12-01"
  },
];

const typeConfig: Record<InsightType, { icon: React.ElementType; color: string; bgColor: string; label: string }> = {
  oportunidade: { icon: Lightbulb, color: "text-emerald-600", bgColor: "bg-emerald-500", label: "Oportunidade" },
  melhoria: { icon: TrendingUp, color: "text-[#1672d6]", bgColor: "bg-[#1672d6]", label: "Melhoria" },
  alerta: { icon: AlertTriangle, color: "text-orange-600", bgColor: "bg-orange-500", label: "Alerta" },
  tendencia: { icon: Zap, color: "text-purple-600", bgColor: "bg-purple-500", label: "Tendência" },
};

const priorityConfig: Record<InsightPriority, { color: string; label: string }> = {
  alta: { color: "bg-red-500/10 text-red-600", label: "Alta" },
  media: { color: "bg-yellow-500/10 text-yellow-600", label: "Média" },
  baixa: { color: "bg-gray-500/10 text-gray-600", label: "Baixa" },
};

const statusConfig: Record<InsightStatus, { color: string; label: string }> = {
  novo: { color: "bg-[#1672d6]/10 text-[#1672d6]", label: "Novo" },
  em_analise: { color: "bg-yellow-500/10 text-yellow-600", label: "Em Análise" },
  implementado: { color: "bg-emerald-500/10 text-emerald-600", label: "Implementado" },
  ignorado: { color: "bg-gray-500/10 text-gray-600", label: "Ignorado" },
};

export default function InsightsIAPage() {
  const [filter, setFilter] = useState<InsightStatus | "all">("all");

  const filteredInsights = insights.filter(
    insight => filter === "all" || insight.status === filter
  );

  const stats = {
    total: insights.length,
    implementados: insights.filter(i => i.status === "implementado").length,
    impactoTotal: "+18%",
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link 
              href="/cliente/painel"
              className="p-2 rounded-lg bg-[#001533]/5 hover:bg-[#001533]/10 transition-colors"
            >
              <ArrowLeft className="size-5 text-[#001533] dark:text-white" />
            </Link>
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
              <Sparkles className="size-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#001533] dark:text-white">
              Insights IA
            </h1>
          </div>
          <p className="text-[#001533]/60 dark:text-white/60 ml-12">
            Recomendações personalizadas da Val para seu negócio
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4"
      >
        <div className="rounded-xl border-2 border-[#001533]/10 dark:border-white/10 bg-white dark:bg-[#001533]/50 p-4 text-center">
          <p className="text-3xl font-bold text-[#001533] dark:text-white">{stats.total}</p>
          <p className="text-sm text-[#001533]/60 dark:text-white/60">Total de Insights</p>
        </div>
        <div className="rounded-xl border-2 border-[#001533]/10 dark:border-white/10 bg-white dark:bg-[#001533]/50 p-4 text-center">
          <p className="text-3xl font-bold text-emerald-600">{stats.implementados}</p>
          <p className="text-sm text-[#001533]/60 dark:text-white/60">Implementados</p>
        </div>
        <div className="rounded-xl border-2 border-[#001533]/10 dark:border-white/10 bg-white dark:bg-[#001533]/50 p-4 text-center">
          <p className="text-3xl font-bold text-[#1672d6]">{stats.impactoTotal}</p>
          <p className="text-sm text-[#001533]/60 dark:text-white/60">Impacto Total</p>
        </div>
      </motion.div>

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 overflow-x-auto pb-2"
      >
        <button
          onClick={() => setFilter("all")}
          className={cn(
            "px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors",
            filter === "all"
              ? "bg-[#1672d6] text-white"
              : "bg-[#001533]/5 dark:bg-white/5 text-[#001533] dark:text-white hover:bg-[#001533]/10 dark:hover:bg-white/10"
          )}
        >
          Todos ({insights.length})
        </button>
        {Object.entries(statusConfig).map(([key, config]) => {
          const count = insights.filter(i => i.status === key).length;
          return (
            <button
              key={key}
              onClick={() => setFilter(key as InsightStatus)}
              className={cn(
                "px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors",
                filter === key
                  ? "bg-[#1672d6] text-white"
                  : "bg-[#001533]/5 dark:bg-white/5 text-[#001533] dark:text-white hover:bg-[#001533]/10 dark:hover:bg-white/10"
              )}
            >
              {config.label} ({count})
            </button>
          );
        })}
      </motion.div>

      {/* Lista de Insights */}
      <div className="space-y-4">
        {filteredInsights.map((insight, index) => {
          const typeConf = typeConfig[insight.type];
          const priorityConf = priorityConfig[insight.priority];
          const statusConf = statusConfig[insight.status];
          const Icon = typeConf.icon;

          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className={cn(
                "rounded-2xl border-2 bg-white dark:bg-[#001533]/50 overflow-hidden",
                insight.priority === "alta" 
                  ? "border-red-500/30" 
                  : "border-[#001533]/10 dark:border-white/10"
              )}
            >
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={cn("p-3 rounded-xl", typeConf.bgColor)}>
                      <Icon className="size-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold", statusConf.color)}>
                          {statusConf.label}
                        </span>
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold", priorityConf.color)}>
                          Prioridade {priorityConf.label}
                        </span>
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-bold", typeConf.color, "bg-current/10")}>
                          {typeConf.label}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-[#001533] dark:text-white mb-2">
                        {insight.title}
                      </h3>
                      <p className="text-[#001533]/70 dark:text-white/70">
                        {insight.description}
                      </p>

                      {/* Métricas (se houver) */}
                      {insight.metrics && (
                        <div className="flex gap-4 mt-4 p-3 rounded-lg bg-emerald-500/10">
                          <div>
                            <p className="text-xs text-[#001533]/60 dark:text-white/60">Antes</p>
                            <p className="font-bold text-[#001533] dark:text-white">{insight.metrics.before}</p>
                          </div>
                          <div className="flex items-center">
                            <ChevronRight className="size-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-xs text-[#001533]/60 dark:text-white/60">Depois</p>
                            <p className="font-bold text-emerald-600">{insight.metrics.after}</p>
                          </div>
                          <div className="ml-auto">
                            <p className="text-xs text-[#001533]/60 dark:text-white/60">Melhoria</p>
                            <p className="font-bold text-emerald-600">{insight.metrics.improvement}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Impacto e Ação */}
                <div className="mt-4 pt-4 border-t border-[#001533]/10 dark:border-white/10 grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-[#001533]/60 dark:text-white/60 uppercase mb-1">
                      Impacto Estimado
                    </p>
                    <p className="font-bold text-[#1672d6]">{insight.impact}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#001533]/60 dark:text-white/60 uppercase mb-1">
                      Ação Recomendada
                    </p>
                    <p className="text-[#001533] dark:text-white">{insight.action}</p>
                  </div>
                </div>

                {/* Botões de Ação */}
                {insight.status === "novo" && (
                  <div className="mt-4 flex gap-3">
                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1672d6] text-white font-semibold hover:bg-[#1672d6]/90 transition-colors">
                      <CheckCircle className="size-5" />
                      Implementar
                    </button>
                    <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-[#001533]/10 text-[#001533] dark:text-white hover:bg-[#001533]/5 transition-colors">
                      <ThumbsDown className="size-5" />
                      Ignorar
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Val Assistant */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl bg-gradient-to-r from-[#001533] to-[#1672d6] p-6"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-white/20">
            <Sparkles className="size-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">
              💜 Resumo da Val
            </h3>
            <p className="text-white/80 mt-1">
              "Esta semana identifiquei 5 insights importantes para você! O mais urgente é ajustar os horários de publicação - 
              isso pode trazer um aumento de 35% no alcance. Quer que eu detalhe algum insight específico?"
            </p>
          </div>
          <Link
            href="/cliente/ia"
            className="px-6 py-3 rounded-xl bg-white text-[#001533] font-semibold hover:bg-white/90 transition-colors whitespace-nowrap"
          >
            Conversar
          </Link>
        </div>
      </motion.div>
    </div>
  );
}



