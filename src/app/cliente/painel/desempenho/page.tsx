"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  TrendingUp, 
  TrendingDown,
  ArrowLeft,
  Eye,
  MousePointerClick,
  Target,
  DollarSign,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  ArrowUpRight,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatsCard, StatsGrid } from "@/components/valle-ui";

// ============================================
// PAINEL DE DESEMPENHO - VALLE AI
// Métricas detalhadas de performance
// ============================================

const mockChartData = [
  { month: "Jan", impressions: 45000, clicks: 2100, conversions: 180 },
  { month: "Fev", impressions: 52000, clicks: 2400, conversions: 210 },
  { month: "Mar", impressions: 48000, clicks: 2200, conversions: 195 },
  { month: "Abr", impressions: 61000, clicks: 2800, conversions: 250 },
  { month: "Mai", impressions: 58000, clicks: 2650, conversions: 235 },
  { month: "Jun", impressions: 72000, clicks: 3200, conversions: 290 },
  { month: "Jul", impressions: 85000, clicks: 3800, conversions: 340 },
  { month: "Ago", impressions: 91000, clicks: 4100, conversions: 365 },
  { month: "Set", impressions: 98000, clicks: 4400, conversions: 390 },
  { month: "Out", impressions: 105000, clicks: 4700, conversions: 420 },
  { month: "Nov", impressions: 118000, clicks: 5200, conversions: 465 },
  { month: "Dez", impressions: 125400, clicks: 8200, conversions: 432 },
];

const campaigns = [
  { name: "Black Friday 2024", status: "active", impressions: "45.2K", clicks: "3.1K", conversions: 156, roi: "320%" },
  { name: "Natal Promocional", status: "active", impressions: "32.1K", clicks: "2.4K", conversions: 98, roi: "285%" },
  { name: "Lançamento Produto X", status: "completed", impressions: "28.5K", clicks: "1.9K", conversions: 87, roi: "245%" },
  { name: "Branding Institucional", status: "active", impressions: "19.6K", clicks: "0.8K", conversions: 45, roi: "180%" },
];

export default function DesempenhoPage() {
  const maxImpressions = Math.max(...mockChartData.map(d => d.impressions));

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
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#1672d6] to-[#1260b5]">
              <TrendingUp className="size-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#001533] dark:text-white">
              Desempenho
            </h1>
          </div>
          <p className="text-[#001533]/60 dark:text-white/60 ml-12">
            Métricas de performance e ROI das suas campanhas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-[#001533]/10 text-[#001533] dark:text-white hover:bg-[#001533]/5 transition-colors">
            <Filter className="size-4" />
            Filtrar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-[#001533]/10 text-[#001533] dark:text-white hover:bg-[#001533]/5 transition-colors">
            <Calendar className="size-4" />
            Últimos 30 dias
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1672d6] text-white hover:bg-[#1672d6]/90 transition-colors">
            <Download className="size-4" />
            Exportar
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <StatsGrid>
          <StatsCard
            title="Impressões"
            value="125.4K"
            change={12}
            icon={<Eye className="size-5 text-[#1672d6]" />}
          />
          <StatsCard
            title="Cliques"
            value="8.2K"
            change={8}
            icon={<MousePointerClick className="size-5 text-[#1672d6]" />}
          />
          <StatsCard
            title="Conversões"
            value="432"
            change={23}
            icon={<Target className="size-5 text-[#1672d6]" />}
          />
          <StatsCard
            title="ROI Médio"
            value="320%"
            change={15}
            icon={<DollarSign className="size-5 text-[#1672d6]" />}
            variant="primary"
          />
        </StatsGrid>
      </motion.div>

      {/* Gráfico de Evolução */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border-2 border-[#001533]/10 dark:border-white/10 bg-white dark:bg-[#001533]/50 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#1672d6]/10">
              <Activity className="size-5 text-[#1672d6]" />
            </div>
            <h3 className="text-lg font-semibold text-[#001533] dark:text-white">
              Evolução Mensal
            </h3>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#1672d6]" />
              Impressões
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              Cliques
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500" />
              Conversões
            </span>
          </div>
        </div>

        {/* Mini Chart */}
        <div className="h-64 flex items-end gap-2">
          {mockChartData.map((data, index) => (
            <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col items-center gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(data.impressions / maxImpressions) * 100}%` }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                  className="w-full bg-[#1672d6]/20 rounded-t-md relative group cursor-pointer hover:bg-[#1672d6]/30 transition-colors"
                  style={{ minHeight: 20 }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#001533] text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {(data.impressions / 1000).toFixed(1)}K
                  </div>
                </motion.div>
              </div>
              <span className="text-xs text-[#001533]/60 dark:text-white/60">{data.month}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Tabela de Campanhas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border-2 border-[#001533]/10 dark:border-white/10 bg-white dark:bg-[#001533]/50 overflow-hidden"
      >
        <div className="p-6 border-b border-[#001533]/10 dark:border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#1672d6]/10">
                <BarChart3 className="size-5 text-[#1672d6]" />
              </div>
              <h3 className="text-lg font-semibold text-[#001533] dark:text-white">
                Campanhas Ativas
              </h3>
            </div>
            <button className="text-sm text-[#1672d6] font-medium hover:underline flex items-center gap-1">
              Ver todas <ArrowUpRight className="size-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#001533]/10 dark:border-white/10">
                <th className="text-left p-4 text-sm font-semibold text-[#001533]/60 dark:text-white/60">Campanha</th>
                <th className="text-left p-4 text-sm font-semibold text-[#001533]/60 dark:text-white/60">Status</th>
                <th className="text-right p-4 text-sm font-semibold text-[#001533]/60 dark:text-white/60">Impressões</th>
                <th className="text-right p-4 text-sm font-semibold text-[#001533]/60 dark:text-white/60">Cliques</th>
                <th className="text-right p-4 text-sm font-semibold text-[#001533]/60 dark:text-white/60">Conversões</th>
                <th className="text-right p-4 text-sm font-semibold text-[#001533]/60 dark:text-white/60">ROI</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign, index) => (
                <motion.tr
                  key={campaign.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="border-b border-[#001533]/5 dark:border-white/5 hover:bg-[#001533]/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <td className="p-4">
                    <span className="font-medium text-[#001533] dark:text-white">{campaign.name}</span>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      campaign.status === "active" 
                        ? "bg-emerald-500/10 text-emerald-600" 
                        : "bg-[#001533]/10 text-[#001533]/60 dark:bg-white/10 dark:text-white/60"
                    )}>
                      {campaign.status === "active" ? "Ativa" : "Concluída"}
                    </span>
                  </td>
                  <td className="p-4 text-right text-[#001533] dark:text-white">{campaign.impressions}</td>
                  <td className="p-4 text-right text-[#001533] dark:text-white">{campaign.clicks}</td>
                  <td className="p-4 text-right text-[#001533] dark:text-white">{campaign.conversions}</td>
                  <td className="p-4 text-right">
                    <span className="font-semibold text-emerald-600">{campaign.roi}</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}



