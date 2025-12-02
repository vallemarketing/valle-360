"use client";

// #region agent log
// DEBUG: Versão do dashboard v2.0 - UI Kit Valle AI - 02/12/2024
console.log("[DEBUG] Dashboard Cliente v2.0 - UI Kit Valle AI carregado");
// #endregion

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Bell, 
  Settings,
  ChevronRight,
  FileText,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointerClick,
  Target,
  DollarSign,
  Users,
  Heart
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// Dados mockados (em produção viriam da API)
const atividadesRecentes = [
  {
    id: 1,
    tipo: "campanha",
    titulo: "Campanha Black Friday atualizada",
    tempo: "Há 2 horas",
  },
  {
    id: 2,
    tipo: "relatorio",
    titulo: "Relatório semanal disponível",
    tempo: "Há 5 horas",
  },
  {
    id: 3,
    tipo: "mensagem",
    titulo: "Nova mensagem do gestor",
    tempo: "Ontem",
  },
  {
    id: 4,
    tipo: "campanha",
    titulo: "Meta Ads: orçamento otimizado",
    tempo: "2 dias atrás",
  },
];

const quickLinks = [
  { icon: FileText, label: "Relatórios", href: "/cliente/relatorios" },
  { icon: MessageSquare, label: "Mensagens", href: "/cliente/mensagens" },
  { icon: Calendar, label: "Agendar Reunião", href: "/cliente/reunioes" },
  { icon: HelpCircle, label: "Suporte", href: "/cliente/suporte" },
];

const destaques = [
  {
    id: 1,
    titulo: "Campanha em Alta",
    descricao: "Sua campanha de Meta Ads atingiu 10k impressões",
    tempo: "Há 5 minutos",
    tipo: "destaque",
  },
  {
    id: 2,
    titulo: "Análise de Mercado",
    descricao: "Novo relatório do seu setor disponível",
    tempo: "Há 2 horas",
    tipo: "mercado",
  },
  {
    id: 3,
    titulo: "Performance Semanal",
    descricao: "Crescimento de 23% em engajamento",
    tempo: "Hoje",
    tipo: "info",
  },
];

// Componente de Stats Card
function StatCard({ 
  title, 
  value, 
  change, 
  icon: Icon,
  delay = 0 
}: { 
  title: string; 
  value: string; 
  change: { value: string; type: "increase" | "decrease" }; 
  icon: any;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="relative flex flex-col gap-3 p-6 rounded-xl bg-card border border-border/60 transition-all duration-300 hover:border-[#1672d6]/30 hover:shadow-lg hover:shadow-[#1672d6]/5"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div className="p-2 rounded-lg bg-[#1672d6]/10 text-[#1672d6]">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-foreground tracking-tight">
          {value}
        </span>
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
            change.type === "increase" 
              ? "text-emerald-600 bg-emerald-500/10" 
              : "text-red-600 bg-red-500/10"
          }`}
        >
          {change.type === "increase" ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {change.value}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">vs. mês anterior</p>
    </motion.div>
  );
}

// Componente de Display Card
function DisplayCard({ 
  titulo, 
  descricao, 
  tempo, 
  tipo,
  className = ""
}: { 
  titulo: string; 
  descricao: string; 
  tempo: string; 
  tipo: string;
  className?: string;
}) {
  const tipoStyles: Record<string, { bg: string; text: string }> = {
    destaque: { bg: "bg-[#1672d6]/20", text: "text-[#1672d6]" },
    mercado: { bg: "bg-emerald-500/20", text: "text-emerald-500" },
    info: { bg: "bg-cyan-500/20", text: "text-cyan-500" },
  };

  const style = tipoStyles[tipo] || tipoStyles.destaque;

  return (
    <motion.div
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className={`relative flex h-40 w-full max-w-[22rem] -skew-y-[8deg] select-none flex-col justify-between rounded-xl border-2 border-border/60 bg-card/80 backdrop-blur-sm px-5 py-4 transition-all duration-500 hover:border-[#1672d6]/40 hover:bg-card hover:shadow-xl hover:shadow-[#1672d6]/10 ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className={`relative inline-flex rounded-full p-1.5 ${style.bg}`}>
          <Target className={`w-4 h-4 ${style.text}`} />
        </span>
        <p className={`text-base font-semibold ${style.text}`}>{titulo}</p>
      </div>
      <p className="whitespace-nowrap text-base font-medium text-foreground line-clamp-2">
        {descricao}
      </p>
      <p className="text-sm text-muted-foreground">{tempo}</p>
    </motion.div>
  );
}

export default function ClienteDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [clienteData, setClienteData] = useState({
    nome: "Cliente",
    empresa: "Empresa",
    avatar: "",
    plano: "Premium",
    proximaReuniao: "15 Dez, 14:00",
  });

  const [stats, setStats] = useState([
    { title: "Impressões", value: "125.4K", change: { value: "+12.5%", type: "increase" as const }, icon: Eye },
    { title: "Cliques", value: "8.2K", change: { value: "+8.1%", type: "increase" as const }, icon: MousePointerClick },
    { title: "Conversões", value: "432", change: { value: "+23.4%", type: "increase" as const }, icon: Target },
    { title: "Investimento", value: "R$ 4.5K", change: { value: "-5.2%", type: "decrease" as const }, icon: DollarSign },
  ]);

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
          proximaReuniao: "15 Dez, 14:00",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1672d6] mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const firstName = clienteData.nome.split(" ")[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#001533] to-[#1672d6] flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="font-semibold text-foreground">Valle AI</span>
            {/* #region agent log */}
            <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded">v2.0 DEBUG</span>
            {/* #endregion */}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#1672d6] text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
            <Avatar className="h-9 w-9 border-2 border-[#1672d6]/20">
              <AvatarImage src={clienteData.avatar} />
              <AvatarFallback className="bg-[#1672d6]/10 text-[#1672d6] font-semibold">
                {clienteData.nome.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-8 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Olá, {firstName}! 👋
              </h1>
              <p className="text-muted-foreground mt-1">
                Aqui está o resumo da sua conta {clienteData.empresa}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-[#1672d6]/30 text-[#1672d6]">
                Plano {clienteData.plano}
              </Badge>
              <Button className="bg-[#1672d6] hover:bg-[#1672d6]/90">
                <Calendar className="w-4 h-4 mr-2" />
                Agendar Reunião
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={stat.title} {...stat} delay={0.1 * index} />
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Destaques */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-border/60">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold flex items-center justify-between">
                    Destaques
                    <Button variant="ghost" size="sm" className="text-[#1672d6]">
                      Ver todos
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid [grid-template-areas:'stack'] place-items-center py-4">
                    {destaques.map((destaque, index) => (
                      <DisplayCard
                        key={destaque.id}
                        {...destaque}
                        className={
                          index === 0
                            ? "[grid-area:stack] hover:-translate-y-10 grayscale-[100%] hover:grayscale-0"
                            : index === 1
                            ? "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1 grayscale-[100%] hover:grayscale-0"
                            : "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10"
                        }
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-border/60">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold">
                    Acesso Rápido
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {quickLinks.map((link, index) => {
                      const Icon = link.icon;
                      return (
                        <motion.a
                          key={index}
                          href={link.href}
                          whileHover={{ y: -4 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex flex-col items-center gap-3 p-4 rounded-xl border border-border/60 bg-card hover:border-[#1672d6]/40 hover:shadow-lg hover:shadow-[#1672d6]/5 transition-all cursor-pointer"
                        >
                          <div className="p-3 rounded-lg bg-[#1672d6]/10">
                            <Icon className="w-6 h-6 text-[#1672d6]" />
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {link.label}
                          </span>
                        </motion.a>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Próxima Reunião */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-border/60 bg-gradient-to-br from-[#001533] to-[#1672d6] text-white">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-white/20">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Próxima Reunião</p>
                      <p className="font-semibold">{clienteData.proximaReuniao}</p>
                    </div>
                  </div>
                  <p className="text-sm text-white/80 mb-4">
                    Reunião de alinhamento estratégico com seu gestor de conta.
                  </p>
                  <Button variant="secondary" className="w-full bg-white text-[#001533] hover:bg-white/90">
                    Confirmar Presença
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Atividades Recentes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-border/60">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold flex items-center justify-between">
                    Atividades Recentes
                    <Button variant="ghost" size="sm" className="text-[#1672d6] text-xs">
                      Ver todas
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[280px] pr-4">
                    <div className="space-y-1">
                      {atividadesRecentes.map((atividade, index) => (
                        <div key={atividade.id}>
                          <div className="flex items-start gap-3 py-3 hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors cursor-pointer">
                            <div className="w-2 h-2 rounded-full bg-[#1672d6] mt-2 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground line-clamp-1">
                                {atividade.titulo}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {atividade.tempo}
                              </p>
                            </div>
                          </div>
                          {index < atividadesRecentes.length - 1 && (
                            <Separator className="ml-5" />
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>

            {/* Precisa de Ajuda? */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="border-border/60 border-dashed">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#1672d6]/10 flex items-center justify-center mx-auto mb-4">
                    <HelpCircle className="w-6 h-6 text-[#1672d6]" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    Precisa de ajuda?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Nossa equipe está pronta para te ajudar.
                  </p>
                  <Button variant="outline" className="w-full">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Falar com Suporte
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
