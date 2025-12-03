"use client";

// ============================================
// DASHBOARD DO CLIENTE - VALLE AI
// Versão 4.0 - UI Premium com DisplayCards interativos
// Cores: #001533 (navy), #1672d6 (primary), #ffffff (white)
// ============================================

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Eye,
  MousePointerClick,
  Target,
  DollarSign,
  TrendingUp,
  Users,
  BarChart3,
  Sparkles,
  Newspaper,
  ChevronRight,
  Calendar,
  ArrowRight,
  Zap,
  Lightbulb
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// Componentes Valle UI
import { 
  StatsCard, 
  StatsGrid,
  DisplayCards,
  InsightsPanel,
  QuickAccess,
  WelcomeHeader,
  NextMeeting,
  RecentActivities,
  SupportCard
} from "@/components/valle-ui";

// Dados de demonstração para os DisplayCards
const displayCardsData = [
  {
    icon: <TrendingUp className="size-5 text-white" />,
    title: "Desempenho",
    description: "Suas métricas subiram 23% este mês",
    date: "Atualizado há 2h",
    iconClassName: "bg-[#1672d6]",
    titleClassName: "text-[#1672d6]",
    href: "/cliente/painel/desempenho",
    badge: "+23%",
    badgeColor: "bg-emerald-500",
  },
  {
    icon: <Newspaper className="size-5 text-white" />,
    title: "Seu Setor",
    description: "3 novidades importantes do seu mercado",
    date: "Atualizado há 5h",
    iconClassName: "bg-[#001533]",
    titleClassName: "text-[#001533] dark:text-white",
    href: "/cliente/painel/setor",
    badge: "3 novas",
    badgeColor: "bg-orange-500",
  },
  {
    icon: <Target className="size-5 text-white" />,
    title: "Concorrentes",
    description: "Análise competitiva atualizada",
    date: "Atualizado agora",
    iconClassName: "bg-purple-500",
    titleClassName: "text-purple-600",
    href: "/cliente/painel/concorrentes",
  },
];

export default function ClienteDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [clienteData, setClienteData] = useState({
    nome: "Cliente",
    empresa: "Empresa",
    avatar: "",
    plano: "Premium",
  });

  useEffect(() => {
    loadClienteData();
  }, []);

  const loadClienteData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }

      // Buscar dados do cliente
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .single();

      const { data: client } = await supabase
        .from("clients")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profile || client) {
        setClienteData({
          nome: profile?.full_name || client?.name || "Cliente",
          empresa: client?.company_name || "Sua Empresa",
          avatar: client?.avatar_url || "",
          plano: client?.plan || "Premium",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1672d6] mx-auto" />
          <p className="mt-4 text-[#001533]/60 dark:text-white/60">Carregando...</p>
        </div>
      </div>
    );
  }

  const firstName = clienteData.nome.split(" ")[0];

  return (
    <div className="p-4 lg:p-6 space-y-6 md:space-y-8 max-w-7xl mx-auto">
        
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <WelcomeHeader
            userName={firstName}
            userCompany={clienteData.empresa}
            planName={clienteData.plano}
            ctaText="Agendar Reunião"
            ctaHref="/cliente/agenda"
          />
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
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
              title="Investimento"
              value="R$ 4.5K"
              change={-5}
              changeLabel="economia vs mês anterior"
              icon={<DollarSign className="size-5 text-[#1672d6]" />}
              variant="primary"
            />
          </StatsGrid>
        </motion.div>

        {/* ========== PAINEL DE INTELIGÊNCIA - Acesso Rápido ========== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link href="/cliente/painel">
            <div className="rounded-2xl bg-gradient-to-r from-[#001533] to-[#1672d6] p-6 text-white cursor-pointer hover:shadow-xl hover:shadow-[#1672d6]/20 transition-all group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-white/20">
                    <Zap className="size-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Painel de Inteligência</h3>
                    <p className="text-white/70 mt-1">
                      Acesse todas as informações organizadas: desempenho, setor, concorrentes e insights IA
                    </p>
                  </div>
                </div>
                <div className="p-3 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                  <ChevronRight className="size-6 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Display Cards - Destaques Clicáveis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="rounded-2xl border-2 border-[#001533]/10 dark:border-white/10 bg-white dark:bg-[#001533]/50 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#1672d6]/10">
                    <Sparkles className="size-5 text-[#1672d6]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#001533] dark:text-white">
                      Destaques da Semana
                    </h3>
                    <p className="text-sm text-[#001533]/60 dark:text-white/60">
                      Clique em um card para ver detalhes
                    </p>
                  </div>
                </div>
                <Link 
                  href="/cliente/painel" 
                  className="flex items-center gap-1 text-sm font-medium text-[#1672d6] hover:underline"
                >
                  Ver todos <ArrowRight className="size-4" />
                </Link>
              </div>
              
              <div className="flex justify-center py-4">
                <DisplayCards 
                  cards={displayCardsData.map((card, index) => ({
                    ...card,
                    className: index === 0
                      ? cn(
                          "[grid-area:stack] hover:-translate-y-10",
                          "before:absolute before:w-full before:h-full before:rounded-xl",
                          "before:bg-[#001533]/5 before:content-[''] before:left-0 before:top-0",
                          "before:transition-opacity before:duration-500",
                          "hover:before:opacity-0",
                          "grayscale-[20%] hover:grayscale-0"
                        )
                      : index === 1
                      ? cn(
                          "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1",
                          "before:absolute before:w-full before:h-full before:rounded-xl",
                          "before:bg-[#001533]/5 before:content-[''] before:left-0 before:top-0",
                          "before:transition-opacity before:duration-500",
                          "hover:before:opacity-0",
                          "grayscale-[20%] hover:grayscale-0"
                        )
                      : "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10"
                  }))}
                />
              </div>
            </motion.div>

            {/* Insights Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <InsightsPanel 
                defaultExpanded={false}
                stats={{
                  impressions: { value: "125.4K", change: 12 },
                  clicks: { value: "8.2K", change: 8 },
                  conversions: { value: "432", change: 23 },
                  roi: { value: "320%", change: 15 },
                }}
              />
            </motion.div>

            {/* Quick Access */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="rounded-2xl border-2 border-[#001533]/10 dark:border-white/10 bg-white dark:bg-[#001533]/50 p-6"
            >
              <QuickAccess />
            </motion.div>
          </div>

          {/* Right Column - 1/3 Sidebar */}
          <div className="space-y-6">
            
            {/* Card de Insights IA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
            >
              <Link href="/cliente/painel/insights">
                <div className="rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/5 p-6 cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-emerald-500">
                      <Lightbulb className="size-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#001533] dark:text-white">
                      Insights da Val
                    </h3>
                  </div>
                  <p className="text-sm text-[#001533]/70 dark:text-white/70 mb-4">
                    5 novas recomendações personalizadas para melhorar seus resultados
                  </p>
                  <div className="flex items-center gap-2 text-emerald-600 font-medium text-sm group-hover:gap-3 transition-all">
                    Ver recomendações <ChevronRight className="size-4" />
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Próxima Reunião */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <NextMeeting
                date="15 Dez"
                time="14:00"
                with="Ana Silva"
                withRole="Gestora de Conta"
              />
            </motion.div>

            {/* Atividades Recentes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <RecentActivities />
            </motion.div>

            {/* Card de Suporte */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <SupportCard />
            </motion.div>
          </div>
        </div>
    </div>
  );
}
