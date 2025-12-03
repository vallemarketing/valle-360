"use client";

// ============================================
// DASHBOARD DO CLIENTE - VALLE AI
// Versão 3.0 - UI Premium com componentes Valle UI
// Cores: #001533 (navy), #1672d6 (primary), #ffffff (white)
// ============================================

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Bell, 
  Settings,
  Eye,
  MousePointerClick,
  Target,
  DollarSign,
  TrendingUp,
  Users,
  BarChart3,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

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

// Dados de demonstração
const mockDestaques = [
  {
    icon: <TrendingUp className="size-4 text-white" />,
    title: "Crescimento",
    description: "Suas métricas subiram 23% este mês",
    date: "Atualizado há 2h",
    iconClassName: "bg-[#1672d6]",
    titleClassName: "text-[#1672d6]",
  },
  {
    icon: <Users className="size-4 text-white" />,
    title: "Engajamento",
    description: "1.2k novas interações com seu conteúdo",
    date: "Atualizado há 5h",
    iconClassName: "bg-[#001533]",
    titleClassName: "text-[#001533] dark:text-white",
  },
  {
    icon: <BarChart3 className="size-4 text-white" />,
    title: "Resultados",
    description: "ROI de 320% nas campanhas ativas",
    date: "Atualizado agora",
    iconClassName: "bg-[#1672d6]",
    titleClassName: "text-[#1672d6]",
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
    <div className="min-h-screen bg-white dark:bg-[#001533]/95">
      {/* ========== HEADER ========== */}
      <header className="sticky top-0 z-50 w-full border-b border-[#001533]/10 dark:border-white/10 bg-white/95 dark:bg-[#001533]/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#001533] to-[#1672d6] flex items-center justify-center shadow-lg shadow-[#1672d6]/20">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-semibold text-[#001533] dark:text-white">Valle AI</span>
              <span className="text-[#001533]/40 dark:text-white/40 text-xs ml-2">Portal do Cliente</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hover:bg-[#1672d6]/10"
            >
              <Bell className="w-5 h-5 text-[#001533] dark:text-white" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#1672d6] text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                3
              </span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="hover:bg-[#1672d6]/10"
            >
              <Settings className="w-5 h-5 text-[#001533] dark:text-white" />
            </Button>
            <div className="w-px h-6 bg-[#001533]/10 dark:bg-white/10 mx-1" />
            <Avatar className="h-9 w-9 border-2 border-[#1672d6]/30">
              <AvatarImage src={clienteData.avatar} />
              <AvatarFallback className="bg-[#1672d6]/10 text-[#1672d6] font-semibold text-sm">
                {clienteData.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* ========== MAIN CONTENT ========== */}
      <main className="container px-4 py-6 md:py-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
        
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

        {/* ========== INSIGHTS PANEL (NOVO!) ========== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
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

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Display Cards - Destaques */}
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
                  <h3 className="text-lg font-semibold text-[#001533] dark:text-white">
                    Destaques da Semana
                  </h3>
                </div>
              </div>
              
              <div className="flex justify-center py-4">
                <DisplayCards 
                  cards={mockDestaques.map((card, index) => ({
                    ...card,
                    className: index === 0
                      ? "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-full before:h-full before:rounded-xl before:bg-[#001533]/5 before:content-[''] before:left-0 before:top-0 before:transition-opacity before:duration-500 hover:before:opacity-0 grayscale-[30%] hover:grayscale-0"
                      : index === 1
                      ? "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 before:absolute before:w-full before:h-full before:rounded-xl before:bg-[#001533]/5 before:content-[''] before:left-0 before:top-0 before:transition-opacity before:duration-500 hover:before:opacity-0 grayscale-[30%] hover:grayscale-0"
                      : "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10"
                  }))}
                />
              </div>
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
      </main>
    </div>
  );
}
