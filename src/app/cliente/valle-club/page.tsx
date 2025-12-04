"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Trophy,
  Star,
  Gift,
  TrendingUp,
  Award,
  Crown,
  Target,
  CheckCircle,
  Lock,
  ChevronRight,
  Sparkles,
  Medal,
  Zap,
  Users,
  Calendar,
  FileCheck,
  CreditCard,
  MessageSquare,
  Rocket
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ============================================
// VALLE CLUB - GAMIFICAÇÃO DO CLIENTE
// Sistema de pontos, níveis, badges e recompensas
// ============================================

// Configuração de níveis
const LEVELS = [
  { name: "Bronze", minPoints: 0, maxPoints: 500, color: "from-amber-700 to-amber-800", discount: 0, icon: Medal },
  { name: "Prata", minPoints: 501, maxPoints: 2000, color: "from-gray-400 to-gray-500", discount: 5, icon: Medal },
  { name: "Ouro", minPoints: 2001, maxPoints: 5000, color: "from-yellow-400 to-yellow-500", discount: 10, icon: Trophy },
  { name: "Diamante", minPoints: 5001, maxPoints: 10000, color: "from-cyan-400 to-blue-500", discount: 15, icon: Crown },
  { name: "VIP", minPoints: 10001, maxPoints: Infinity, color: "from-purple-500 to-pink-500", discount: 20, icon: Crown },
];

// Badges/Conquistas
const BADGES = [
  { id: "early_adopter", name: "Early Adopter", description: "Primeiro mês ativo", icon: Rocket, unlocked: true, date: "Nov 2024" },
  { id: "fast_approver", name: "Aprovador Rápido", description: "10 aprovações em menos de 24h", icon: Zap, unlocked: true, date: "Nov 2024" },
  { id: "communicator", name: "Comunicativo", description: "50 mensagens enviadas", icon: MessageSquare, unlocked: true, date: "Out 2024" },
  { id: "growth", name: "Crescimento", description: "ROI acima de 200%", icon: TrendingUp, unlocked: true, date: "Dez 2024" },
  { id: "goal_crusher", name: "Meta Batida", description: "Atingiu meta do mês", icon: Target, unlocked: false },
  { id: "ambassador", name: "Embaixador", description: "Indicou 3 clientes", icon: Users, unlocked: false },
  { id: "punctual_payer", name: "Pagador Exemplar", description: "12 faturas pagas em dia", icon: CreditCard, unlocked: false },
  { id: "client_of_month", name: "Cliente do Mês", description: "Maior engajamento", icon: Award, unlocked: false },
];

// Histórico de pontos
const POINTS_HISTORY = [
  { id: 1, action: "Aprovação no prazo", points: 50, date: "2025-12-03", icon: FileCheck },
  { id: 2, action: "Pagamento em dia", points: 100, date: "2025-12-01", icon: CreditCard },
  { id: 3, action: "Resposta NPS", points: 30, date: "2025-11-28", icon: Star },
  { id: 4, action: "Aprovação no prazo", points: 50, date: "2025-11-25", icon: FileCheck },
  { id: 5, action: "Reunião mensal", points: 40, date: "2025-11-20", icon: Calendar },
];

// Recompensas gerais
const REWARDS = [
  { id: 1, name: "Desconto 10% na mensalidade", points: 500, available: true },
  { id: 2, name: "Créditos extras (R$ 500)", points: 800, available: true },
  { id: 3, name: "Consultoria estratégica grátis", points: 1500, available: true },
  { id: 4, name: "Mês de serviço grátis", points: 3000, available: false },
  { id: 5, name: "Acesso VIP a features beta", points: 2000, available: false },
];

// ===== BENEFÍCIOS POR SEGMENTO =====
// Benefícios exclusivos baseados no setor do cliente
interface SegmentBenefit {
  segment: string;
  benefit: string;
  description: string;
  requirement: string;
  icon: string;
}

const SEGMENT_BENEFITS: SegmentBenefit[] = [
  {
    segment: "Médicos/Saúde",
    benefit: "Ingresso para Congressos Médicos",
    description: "Ingresso VIP para os principais congressos de medicina e saúde do Brasil",
    requirement: "NPS acima de 9 por 6 meses consecutivos",
    icon: "🏥"
  },
  {
    segment: "E-commerce",
    benefit: "Serviços Valle 360 de IA",
    description: "Acesso gratuito por 3 meses às ferramentas de IA da Valle 360 para otimização",
    requirement: "Indicar 2 novos clientes",
    icon: "🛒"
  },
  {
    segment: "Restaurantes",
    benefit: "IAs Premium + Consultoria Chef",
    description: "IAs premium da Valle 360 + Consultoria com Chef renomado in loco",
    requirement: "Pagar em dia por 12 meses",
    icon: "🍽️"
  },
  {
    segment: "Moda/Beleza",
    benefit: "Sessão Fotográfica Profissional",
    description: "Sessão completa de fotos profissionais para seu catálogo",
    requirement: "Aprovar conteúdos em até 24h por 3 meses",
    icon: "💄"
  },
  {
    segment: "Advocacia",
    benefit: "Acesso a Cursos Jurídicos",
    description: "Acesso a cursos de marketing jurídico e plataformas especializadas",
    requirement: "Participar de todas as reuniões mensais",
    icon: "⚖️"
  },
];

// Metas para desbloquear benefícios
const BENEFIT_GOALS = [
  { id: 1, name: "Aprovador Ágil", description: "Aprovar conteúdos em até 24h por 3 meses", progress: 2, total: 3, icon: Zap },
  { id: 2, name: "NPS Exemplar", description: "NPS acima de 9 por 6 meses", progress: 4, total: 6, icon: Star },
  { id: 3, name: "Embaixador Valle", description: "Indicar 2 novos clientes", progress: 1, total: 2, icon: Users },
  { id: 4, name: "Pagador Pontual", description: "Pagar em dia por 12 meses", progress: 8, total: 12, icon: CreditCard },
  { id: 5, name: "Parceiro Presente", description: "Participar de todas as reuniões mensais", progress: 5, total: 6, icon: Calendar },
];

export default function ValleClubPage() {
  const [activeTab, setActiveTab] = useState("visao-geral");
  
  // Dados do usuário (mock)
  const userPoints = 2450;
  const currentLevel = LEVELS.find(l => userPoints >= l.minPoints && userPoints <= l.maxPoints) || LEVELS[0];
  const nextLevel = LEVELS[LEVELS.indexOf(currentLevel) + 1];
  const progressToNextLevel = nextLevel 
    ? ((userPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
    : 100;
  const pointsToNextLevel = nextLevel ? nextLevel.minPoints - userPoints : 0;
  const unlockedBadges = BADGES.filter(b => b.unlocked).length;

  const LevelIcon = currentLevel.icon;

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header com Card de Nível */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={cn(
          "rounded-2xl p-6 text-white relative overflow-hidden",
          "bg-gradient-to-r",
          currentLevel.color
        )}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5" />
                  <span className="text-sm font-medium text-white/80">Valle Club</span>
                </div>
                <h1 className="text-3xl font-bold mb-1">
                  Nível {currentLevel.name}
                </h1>
                <p className="text-white/70">
                  {currentLevel.discount}% de desconto em serviços extras
                </p>
              </div>

              <div className="text-right">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mb-2">
                  <LevelIcon className="w-10 h-10" />
                </div>
                <p className="text-2xl font-bold">{userPoints.toLocaleString()}</p>
                <p className="text-sm text-white/70">pontos</p>
              </div>
            </div>

            {/* Progress to Next Level */}
            {nextLevel && (
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>{currentLevel.name}</span>
                  <span>{nextLevel.name}</span>
                </div>
                <Progress value={progressToNextLevel} className="h-3 bg-white/20" />
                <p className="text-sm text-white/70 mt-2 text-center">
                  Faltam <strong>{pointsToNextLevel}</strong> pontos para o próximo nível
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Card className="border-[#001533]/10 dark:border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#1672d6]/10">
                <Star className="w-5 h-5 text-[#1672d6]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#001533] dark:text-white">{userPoints.toLocaleString()}</p>
                <p className="text-sm text-[#001533]/60 dark:text-white/60">Pontos totais</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#001533]/10 dark:border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Award className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#001533] dark:text-white">{unlockedBadges}</p>
                <p className="text-sm text-[#001533]/60 dark:text-white/60">Conquistas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#001533]/10 dark:border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#001533] dark:text-white">#12</p>
                <p className="text-sm text-[#001533]/60 dark:text-white/60">No ranking</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#001533]/10 dark:border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Gift className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#001533] dark:text-white">3</p>
                <p className="text-sm text-[#001533]/60 dark:text-white/60">Recompensas disponíveis</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tabs Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs defaultValue="visao-geral" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-xl bg-[#001533]/5 dark:bg-white/5">
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="conquistas">Conquistas</TabsTrigger>
            <TabsTrigger value="ranking">Ranking</TabsTrigger>
            <TabsTrigger value="recompensas">Recompensas</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="visao-geral" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Como Ganhar Pontos */}
              <Card className="border-[#001533]/10 dark:border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="w-5 h-5 text-[#1672d6]" />
                    Como Ganhar Pontos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { action: "Aprovar material no prazo", points: 50 },
                    { action: "Pagar fatura em dia", points: 100 },
                    { action: "Responder pesquisa NPS", points: 30 },
                    { action: "Indicar novo cliente", points: 500 },
                    { action: "Agendar reunião mensal", points: 40 },
                    { action: "Completar perfil", points: 50 },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-[#001533]/5 dark:bg-white/5">
                      <span className="text-sm text-[#001533] dark:text-white">{item.action}</span>
                      <Badge className="bg-[#1672d6]/10 text-[#1672d6] hover:bg-[#1672d6]/20">
                        +{item.points} pts
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Histórico Recente */}
              <Card className="border-[#001533]/10 dark:border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    Pontos Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {POINTS_HISTORY.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-[#001533]/5 dark:bg-white/5">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-lg bg-emerald-500/10">
                            <Icon className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#001533] dark:text-white">{item.action}</p>
                            <p className="text-xs text-[#001533]/50 dark:text-white/50">
                              {new Date(item.date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-emerald-600">+{item.points}</span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Conquistas */}
          <TabsContent value="conquistas">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {BADGES.map((badge) => {
                const Icon = badge.icon;
                return (
                  <motion.div
                    key={badge.id}
                    whileHover={{ scale: badge.unlocked ? 1.02 : 1 }}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all",
                      badge.unlocked 
                        ? "border-[#1672d6]/30 bg-[#1672d6]/5" 
                        : "border-[#001533]/10 dark:border-white/10 bg-[#001533]/5 dark:bg-white/5 opacity-60"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={cn(
                        "p-3 rounded-xl",
                        badge.unlocked ? "bg-[#1672d6]/10" : "bg-[#001533]/10 dark:bg-white/10"
                      )}>
                        {badge.unlocked ? (
                          <Icon className="w-6 h-6 text-[#1672d6]" />
                        ) : (
                          <Lock className="w-6 h-6 text-[#001533]/40 dark:text-white/40" />
                        )}
                      </div>
                      {badge.unlocked && (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      )}
                    </div>
                    <h3 className="font-semibold text-[#001533] dark:text-white mb-1">
                      {badge.name}
                    </h3>
                    <p className="text-sm text-[#001533]/60 dark:text-white/60 mb-2">
                      {badge.description}
                    </p>
                    {badge.unlocked && badge.date && (
                      <p className="text-xs text-[#1672d6]">
                        Conquistado em {badge.date}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>

          {/* Ranking */}
          <TabsContent value="ranking">
            <Card className="border-[#001533]/10 dark:border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Ranking do Mês
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { pos: 1, name: "Empresa ABC Ltda", points: 4850, level: "Diamante" },
                    { pos: 2, name: "Tech Solutions", points: 4200, level: "Diamante" },
                    { pos: 3, name: "Marketing Pro", points: 3900, level: "Ouro" },
                    { pos: 4, name: "Você", points: userPoints, level: currentLevel.name, isYou: true },
                    { pos: 5, name: "Digital Agency", points: 2100, level: "Ouro" },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl",
                        item.isYou 
                          ? "bg-[#1672d6]/10 border-2 border-[#1672d6]/30" 
                          : "bg-[#001533]/5 dark:bg-white/5"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                          item.pos === 1 ? "bg-yellow-500 text-white" :
                          item.pos === 2 ? "bg-gray-400 text-white" :
                          item.pos === 3 ? "bg-amber-700 text-white" :
                          "bg-[#001533]/10 dark:bg-white/10 text-[#001533] dark:text-white"
                        )}>
                          {item.pos}
                        </div>
                        <div>
                          <p className={cn(
                            "font-semibold",
                            item.isYou ? "text-[#1672d6]" : "text-[#001533] dark:text-white"
                          )}>
                            {item.name}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {item.level}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#001533] dark:text-white">
                          {item.points.toLocaleString()}
                        </p>
                        <p className="text-sm text-[#001533]/50 dark:text-white/50">pontos</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recompensas */}
          <TabsContent value="recompensas" className="space-y-8">
            {/* Recompensas Gerais */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5 text-[#1672d6]" />
                Recompensas Gerais
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {REWARDS.map((reward) => {
                  const canRedeem = userPoints >= reward.points && reward.available;
                  return (
                    <Card 
                      key={reward.id}
                      className={cn(
                        "border-2 transition-all",
                        canRedeem 
                          ? "border-[#1672d6]/30 hover:border-[#1672d6]/50" 
                          : "border-[#001533]/10 dark:border-white/10 opacity-70"
                      )}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={cn(
                            "p-3 rounded-xl",
                            canRedeem ? "bg-[#1672d6]/10" : "bg-[#001533]/10 dark:bg-white/10"
                          )}>
                            <Gift className={cn(
                              "w-6 h-6",
                              canRedeem ? "text-[#1672d6]" : "text-[#001533]/40 dark:text-white/40"
                            )} />
                          </div>
                          <Badge className={cn(
                            canRedeem 
                              ? "bg-[#1672d6]/10 text-[#1672d6]" 
                              : "bg-[#001533]/10 text-[#001533]/60 dark:bg-white/10 dark:text-white/60"
                          )}>
                            {reward.points.toLocaleString()} pts
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-[#001533] dark:text-white mb-4">
                          {reward.name}
                        </h3>
                        <Button 
                          className={cn(
                            "w-full",
                            canRedeem 
                              ? "bg-[#1672d6] hover:bg-[#1260b5] text-white" 
                              : "bg-[#001533]/10 text-[#001533]/50 cursor-not-allowed"
                          )}
                          disabled={!canRedeem}
                        >
                          {canRedeem ? "Resgatar" : "Pontos insuficientes"}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* ===== BENEFÍCIOS POR SEGMENTO ===== */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Benefícios Exclusivos do Seu Segmento
                <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/30 text-xs">
                  Premium
                </Badge>
              </h3>
              <p className="text-sm text-[#001533]/60 dark:text-white/60 mb-4">
                Conquiste benefícios especiais cumprindo metas específicas para o seu setor
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                {SEGMENT_BENEFITS.map((benefit, idx) => (
                  <motion.div
                    key={benefit.segment}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent hover:border-purple-500/40 transition-all">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-3xl">{benefit.icon}</span>
                          <div>
                            <Badge className="bg-purple-500/10 text-purple-500 mb-1">{benefit.segment}</Badge>
                            <h4 className="font-bold text-[#001533] dark:text-white">{benefit.benefit}</h4>
                          </div>
                        </div>
                        <p className="text-sm text-[#001533]/70 dark:text-white/70 mb-3">
                          {benefit.description}
                        </p>
                        <div className="p-3 rounded-lg bg-[#001533]/5 dark:bg-white/5">
                          <p className="text-xs text-[#001533]/60 dark:text-white/60">
                            <strong>Como desbloquear:</strong> {benefit.requirement}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* ===== METAS PARA BENEFÍCIOS ===== */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-500" />
                Seu Progresso nas Metas
              </h3>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {BENEFIT_GOALS.map((goal) => {
                      const GoalIcon = goal.icon;
                      const progressPercent = (goal.progress / goal.total) * 100;
                      const isComplete = goal.progress >= goal.total;
                      
                      return (
                        <div 
                          key={goal.id} 
                          className={cn(
                            "p-4 rounded-xl border-2 transition-all",
                            isComplete 
                              ? "border-emerald-500/30 bg-emerald-500/5" 
                              : "border-[#001533]/10 dark:border-white/10"
                          )}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "p-2 rounded-lg",
                                isComplete ? "bg-emerald-500/10" : "bg-[#001533]/10 dark:bg-white/10"
                              )}>
                                <GoalIcon className={cn(
                                  "w-5 h-5",
                                  isComplete ? "text-emerald-500" : "text-[#001533]/60 dark:text-white/60"
                                )} />
                              </div>
                              <div>
                                <h4 className="font-semibold text-[#001533] dark:text-white">{goal.name}</h4>
                                <p className="text-xs text-[#001533]/60 dark:text-white/60">{goal.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              {isComplete ? (
                                <Badge className="bg-emerald-500 text-white">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Completo
                                </Badge>
                              ) : (
                                <span className="text-sm font-medium text-[#001533] dark:text-white">
                                  {goal.progress}/{goal.total}
                                </span>
                              )}
                            </div>
                          </div>
                          <Progress value={progressPercent} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
