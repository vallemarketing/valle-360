"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Target, 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  BarChart3,
  Award,
  AlertCircle,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// PAINEL DE CONCORRENTES - VALLE AI
// Análise competitiva detalhada
// ============================================

interface Competitor {
  id: string;
  name: string;
  logo: string;
  segment: string;
  metrics: {
    followers: string;
    engagement: string;
    posts: number;
    growth: number;
  };
  strengths: string[];
  weaknesses: string[];
  recentActivity: string;
}

const competitors: Competitor[] = [
  {
    id: "1",
    name: "Concorrente Alpha",
    logo: "A",
    segment: "Marketing Digital",
    metrics: {
      followers: "45.2K",
      engagement: "4.8%",
      posts: 128,
      growth: 12,
    },
    strengths: ["Forte presença no Instagram", "Conteúdo de vídeo de qualidade"],
    weaknesses: ["Pouca interação com seguidores", "Baixa frequência no LinkedIn"],
    recentActivity: "Lançou campanha de Black Friday com 20% de desconto"
  },
  {
    id: "2",
    name: "Concorrente Beta",
    logo: "B",
    segment: "Agência Digital",
    metrics: {
      followers: "32.1K",
      engagement: "3.2%",
      posts: 95,
      growth: 8,
    },
    strengths: ["Blog com conteúdo educativo", "Newsletter semanal"],
    weaknesses: ["Design desatualizado", "Pouco investimento em ads"],
    recentActivity: "Publicou e-book sobre tendências 2025"
  },
  {
    id: "3",
    name: "Concorrente Gamma",
    logo: "G",
    segment: "Consultoria",
    metrics: {
      followers: "28.5K",
      engagement: "5.1%",
      posts: 76,
      growth: -3,
    },
    strengths: ["Alta taxa de engajamento", "Comunidade fiel"],
    weaknesses: ["Crescimento estagnado", "Poucos formatos de conteúdo"],
    recentActivity: "Sem atividade significativa nas últimas 2 semanas"
  },
];

const yourMetrics = {
  followers: "38.7K",
  engagement: "5.4%",
  posts: 112,
  growth: 15,
  ranking: 2,
  shareOfVoice: 28,
};

export default function ConcorrentesPage() {
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
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
              <Target className="size-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#001533] dark:text-white">
              Concorrentes
            </h1>
          </div>
          <p className="text-[#001533]/60 dark:text-white/60 ml-12">
            Análise competitiva e benchmarking do mercado
          </p>
        </div>
      </motion.div>

      {/* Seu Posicionamento */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-gradient-to-r from-[#001533] to-[#1672d6] p-6 text-white"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-semibold text-white/80 mb-1">Seu Posicionamento</h3>
            <div className="flex items-center gap-3">
              <Award className="size-8" />
              <span className="text-4xl font-bold">#{yourMetrics.ranking}</span>
              <span className="text-white/70">no mercado</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{yourMetrics.followers}</p>
              <p className="text-sm text-white/70">Seguidores</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{yourMetrics.engagement}</p>
              <p className="text-sm text-white/70">Engajamento</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{yourMetrics.shareOfVoice}%</p>
              <p className="text-sm text-white/70">Share of Voice</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <TrendingUp className="size-5 text-emerald-400" />
                <p className="text-2xl font-bold">+{yourMetrics.growth}%</p>
              </div>
              <p className="text-sm text-white/70">Crescimento</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Lista de Concorrentes */}
      <div className="space-y-4">
        {competitors.map((competitor, index) => (
          <motion.div
            key={competitor.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="rounded-2xl border-2 border-[#001533]/10 dark:border-white/10 bg-white dark:bg-[#001533]/50 overflow-hidden"
          >
            {/* Header do Concorrente */}
            <div className="p-6 border-b border-[#001533]/10 dark:border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#001533] to-[#1672d6] flex items-center justify-center text-white font-bold text-xl">
                    {competitor.logo}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#001533] dark:text-white">
                      {competitor.name}
                    </h3>
                    <p className="text-sm text-[#001533]/60 dark:text-white/60">
                      {competitor.segment}
                    </p>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#001533]/5 dark:bg-white/5 text-[#001533] dark:text-white hover:bg-[#001533]/10 dark:hover:bg-white/10 transition-colors">
                  <ExternalLink className="size-4" />
                  Ver perfil
                </button>
              </div>
            </div>

            {/* Métricas */}
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-[#001533]/10 dark:border-white/10">
              <div>
                <div className="flex items-center gap-2 text-[#001533]/60 dark:text-white/60 mb-1">
                  <Users className="size-4" />
                  <span className="text-sm">Seguidores</span>
                </div>
                <p className="text-xl font-bold text-[#001533] dark:text-white">{competitor.metrics.followers}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-[#001533]/60 dark:text-white/60 mb-1">
                  <Heart className="size-4" />
                  <span className="text-sm">Engajamento</span>
                </div>
                <p className="text-xl font-bold text-[#001533] dark:text-white">{competitor.metrics.engagement}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-[#001533]/60 dark:text-white/60 mb-1">
                  <MessageCircle className="size-4" />
                  <span className="text-sm">Posts/mês</span>
                </div>
                <p className="text-xl font-bold text-[#001533] dark:text-white">{competitor.metrics.posts}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-[#001533]/60 dark:text-white/60 mb-1">
                  {competitor.metrics.growth >= 0 ? (
                    <TrendingUp className="size-4 text-emerald-500" />
                  ) : (
                    <TrendingDown className="size-4 text-red-500" />
                  )}
                  <span className="text-sm">Crescimento</span>
                </div>
                <p className={cn(
                  "text-xl font-bold",
                  competitor.metrics.growth >= 0 ? "text-emerald-600" : "text-red-600"
                )}>
                  {competitor.metrics.growth >= 0 ? "+" : ""}{competitor.metrics.growth}%
                </p>
              </div>
            </div>

            {/* Análise */}
            <div className="p-6 grid md:grid-cols-3 gap-6">
              {/* Pontos Fortes */}
              <div>
                <h4 className="flex items-center gap-2 text-sm font-semibold text-emerald-600 mb-3">
                  <TrendingUp className="size-4" />
                  Pontos Fortes
                </h4>
                <ul className="space-y-2">
                  {competitor.strengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#001533]/70 dark:text-white/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pontos Fracos */}
              <div>
                <h4 className="flex items-center gap-2 text-sm font-semibold text-orange-600 mb-3">
                  <AlertCircle className="size-4" />
                  Pontos Fracos
                </h4>
                <ul className="space-y-2">
                  {competitor.weaknesses.map((weakness, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#001533]/70 dark:text-white/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                      {weakness}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Atividade Recente */}
              <div>
                <h4 className="flex items-center gap-2 text-sm font-semibold text-[#1672d6] mb-3">
                  <Eye className="size-4" />
                  Atividade Recente
                </h4>
                <p className="text-sm text-[#001533]/70 dark:text-white/70 p-3 rounded-lg bg-[#001533]/5 dark:bg-white/5">
                  {competitor.recentActivity}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl border-2 border-dashed border-[#1672d6]/30 bg-[#1672d6]/5 p-6 text-center"
      >
        <Target className="size-10 text-[#1672d6] mx-auto mb-3" />
        <h3 className="text-lg font-bold text-[#001533] dark:text-white mb-2">
          Quer monitorar mais concorrentes?
        </h3>
        <p className="text-[#001533]/60 dark:text-white/60 mb-4">
          Adicione até 10 concorrentes para análise completa
        </p>
        <button className="px-6 py-3 rounded-xl bg-[#1672d6] text-white font-semibold hover:bg-[#1672d6]/90 transition-colors">
          Adicionar Concorrente
        </button>
      </motion.div>
    </div>
  );
}

