"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Newspaper, 
  ArrowLeft,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  Clock,
  Tag,
  Bookmark,
  Share2,
  Filter,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

// ============================================
// PAINEL DO SETOR - VALLE AI
// Notícias e tendências do mercado
// ============================================

type NewsType = "noticia" | "tendencia" | "alerta" | "oportunidade";

interface NewsItem {
  id: string;
  type: NewsType;
  title: string;
  summary: string;
  source: string;
  date: string;
  tags: string[];
  relevance: "alta" | "media" | "baixa";
  link?: string;
}

const newsItems: NewsItem[] = [
  {
    id: "1",
    type: "tendencia",
    title: "IA Generativa revoluciona o marketing digital em 2025",
    summary: "Empresas que adotaram IA generativa em suas estratégias de marketing viram aumento de 45% no engajamento. Saiba como aplicar no seu negócio.",
    source: "Marketing Digital Brasil",
    date: "2025-12-03",
    tags: ["IA", "Marketing Digital", "Tendências"],
    relevance: "alta",
    link: "#"
  },
  {
    id: "2",
    type: "alerta",
    title: "Nova regulamentação de proteção de dados entra em vigor",
    summary: "LGPD 2.0 traz novas exigências para coleta e uso de dados em campanhas digitais. Sua empresa precisa se adequar até março de 2025.",
    source: "Portal Jurídico",
    date: "2025-12-02",
    tags: ["LGPD", "Regulamentação", "Compliance"],
    relevance: "alta",
    link: "#"
  },
  {
    id: "3",
    type: "oportunidade",
    title: "Mercado de e-commerce B2B cresce 38% no Brasil",
    summary: "Setor apresenta oportunidades inexploradas. Análise indica potencial de crescimento para empresas que investirem em presença digital.",
    source: "E-commerce Brasil",
    date: "2025-12-01",
    tags: ["E-commerce", "B2B", "Oportunidade"],
    relevance: "alta",
    link: "#"
  },
  {
    id: "4",
    type: "noticia",
    title: "Redes sociais atualizam algoritmos para priorizar conteúdo autêntico",
    summary: "Instagram e TikTok anunciam mudanças que favorecem criadores de conteúdo original. Veja como adaptar sua estratégia.",
    source: "Social Media Today",
    date: "2025-11-30",
    tags: ["Redes Sociais", "Algoritmo", "Conteúdo"],
    relevance: "media",
    link: "#"
  },
  {
    id: "5",
    type: "tendencia",
    title: "Video marketing curto domina preferências do consumidor",
    summary: "Pesquisa mostra que 78% dos usuários preferem vídeos de até 60 segundos. Reels e Shorts são os formatos mais consumidos.",
    source: "Video Marketing Institute",
    date: "2025-11-29",
    tags: ["Vídeo", "Reels", "Shorts"],
    relevance: "media",
    link: "#"
  },
];

const typeConfig: Record<NewsType, { icon: React.ElementType; color: string; label: string }> = {
  noticia: { icon: Newspaper, color: "bg-[#1672d6]", label: "Notícia" },
  tendencia: { icon: TrendingUp, color: "bg-purple-500", label: "Tendência" },
  alerta: { icon: AlertTriangle, color: "bg-orange-500", label: "Alerta" },
  oportunidade: { icon: Lightbulb, color: "bg-emerald-500", label: "Oportunidade" },
};

export default function SetorPage() {
  const [filter, setFilter] = useState<NewsType | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredNews = newsItems.filter(item => {
    const matchesFilter = filter === "all" || item.type === filter;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
              <Newspaper className="size-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#001533] dark:text-white">
              Seu Setor
            </h1>
          </div>
          <p className="text-[#001533]/60 dark:text-white/60 ml-12">
            Notícias, tendências e oportunidades do seu mercado
          </p>
        </div>
      </motion.div>

      {/* Filtros e Busca */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row gap-4"
      >
        {/* Busca */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-[#001533]/40 dark:text-white/40" />
          <input
            type="text"
            placeholder="Buscar notícias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-[#001533]/10 dark:border-white/10 bg-white dark:bg-[#001533]/50 text-[#001533] dark:text-white placeholder:text-[#001533]/40 dark:placeholder:text-white/40 focus:border-[#1672d6] focus:outline-none transition-colors"
          />
        </div>

        {/* Filtros por tipo */}
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors",
              filter === "all"
                ? "bg-[#1672d6] text-white"
                : "bg-[#001533]/5 dark:bg-white/5 text-[#001533] dark:text-white hover:bg-[#001533]/10 dark:hover:bg-white/10"
            )}
          >
            Todas
          </button>
          {Object.entries(typeConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={key}
                onClick={() => setFilter(key as NewsType)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors",
                  filter === key
                    ? cn(config.color, "text-white")
                    : "bg-[#001533]/5 dark:bg-white/5 text-[#001533] dark:text-white hover:bg-[#001533]/10 dark:hover:bg-white/10"
                )}
              >
                <Icon className="size-4" />
                {config.label}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Lista de Notícias */}
      <div className="space-y-4">
        {filteredNews.map((item, index) => {
          const config = typeConfig[item.type];
          const Icon = config.icon;

          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="rounded-2xl border-2 border-[#001533]/10 dark:border-white/10 bg-white dark:bg-[#001533]/50 p-6 hover:border-[#1672d6]/30 transition-colors"
            >
              <div className="flex flex-col md:flex-row gap-4">
                {/* Ícone e tipo */}
                <div className="flex md:flex-col items-center gap-3 md:w-24">
                  <div className={cn("p-3 rounded-xl", config.color)}>
                    <Icon className="size-6 text-white" />
                  </div>
                  <span className={cn(
                    "text-xs font-bold px-2 py-1 rounded-full",
                    config.color.replace("bg-", "bg-") + "/10",
                    config.color.replace("bg-", "text-").replace("-500", "-600")
                  )}>
                    {config.label}
                  </span>
                </div>

                {/* Conteúdo */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-bold text-[#001533] dark:text-white hover:text-[#1672d6] transition-colors cursor-pointer">
                      {item.title}
                    </h3>
                    {item.relevance === "alta" && (
                      <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-600 whitespace-nowrap">
                        Alta Relevância
                      </span>
                    )}
                  </div>

                  <p className="text-[#001533]/70 dark:text-white/70 mt-2 line-clamp-2">
                    {item.summary}
                  </p>

                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-4 mt-4">
                    <span className="flex items-center gap-1 text-sm text-[#001533]/50 dark:text-white/50">
                      <Clock className="size-4" />
                      {new Date(item.date).toLocaleDateString("pt-BR")}
                    </span>
                    <span className="text-sm text-[#001533]/50 dark:text-white/50">
                      {item.source}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {item.tags.map(tag => (
                      <span
                        key={tag}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-[#001533]/5 dark:bg-white/5 text-[#001533]/70 dark:text-white/70"
                      >
                        <Tag className="size-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex md:flex-col gap-2">
                  <button className="p-2 rounded-lg hover:bg-[#001533]/5 dark:hover:bg-white/5 transition-colors">
                    <Bookmark className="size-5 text-[#001533]/40 dark:text-white/40" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-[#001533]/5 dark:hover:bg-white/5 transition-colors">
                    <Share2 className="size-5 text-[#001533]/40 dark:text-white/40" />
                  </button>
                  {item.link && (
                    <button className="p-2 rounded-lg hover:bg-[#001533]/5 dark:hover:bg-white/5 transition-colors">
                      <ExternalLink className="size-5 text-[#001533]/40 dark:text-white/40" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredNews.length === 0 && (
        <div className="text-center py-12">
          <Newspaper className="size-12 text-[#001533]/20 dark:text-white/20 mx-auto mb-4" />
          <p className="text-[#001533]/60 dark:text-white/60">
            Nenhuma notícia encontrada com os filtros selecionados
          </p>
        </div>
      )}
    </div>
  );
}



