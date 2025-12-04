"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Trophy,
  Crown,
  Medal,
  Star,
  ChevronLeft,
  TrendingUp,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// ============================================
// RANKING DO VALLE CLUB
// Leaderboard mensal de clientes
// ============================================

// Mock de dados do ranking
const RANKING_DATA = [
  { position: 1, name: "Empresa Alpha", points: 4520, change: "+3", avatar: "EA" },
  { position: 2, name: "Você", points: 1850, change: "+1", isUser: true, avatar: "VC" },
  { position: 3, name: "Empresa Beta", points: 1780, change: "-2", avatar: "EB" },
  { position: 4, name: "Empresa Gamma", points: 1650, change: "+5", avatar: "EG" },
  { position: 5, name: "Empresa Delta", points: 1520, change: "0", avatar: "ED" },
  { position: 6, name: "Empresa Epsilon", points: 1400, change: "+2", avatar: "EE" },
  { position: 7, name: "Empresa Zeta", points: 1350, change: "-1", avatar: "EZ" },
  { position: 8, name: "Empresa Eta", points: 1280, change: "+4", avatar: "EH" },
  { position: 9, name: "Empresa Theta", points: 1150, change: "-3", avatar: "ET" },
  { position: 10, name: "Empresa Iota", points: 1050, change: "+1", avatar: "EI" },
];

const getPositionIcon = (position: number) => {
  if (position === 1) return <Crown className="size-5 text-yellow-500" />;
  if (position === 2) return <Medal className="size-5 text-gray-400" />;
  if (position === 3) return <Medal className="size-5 text-amber-600" />;
  return null;
};

const getPositionStyle = (position: number) => {
  if (position === 1) return "bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border-yellow-500/30";
  if (position === 2) return "bg-gradient-to-r from-gray-400/10 to-gray-400/5 border-gray-400/30";
  if (position === 3) return "bg-gradient-to-r from-amber-600/10 to-amber-600/5 border-amber-600/30";
  return "border-[#001533]/10 dark:border-white/10";
};

export default function RankingPage() {
  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link 
          href="/cliente/valle-club"
          className="inline-flex items-center gap-2 text-[#1672d6] hover:underline mb-4"
        >
          <ChevronLeft className="size-4" />
          Voltar para Valle Club
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-[#1672d6] to-[#001533]">
            <Trophy className="size-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#001533] dark:text-white">Ranking Mensal</h1>
        </div>
        <p className="text-[#001533]/60 dark:text-white/60">
          Dezembro 2024 • Os top 3 ganham prêmios especiais!
        </p>
      </motion.div>

      {/* Prêmios */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4"
      >
        {[
          { place: "1º Lugar", prize: "1 mês de serviço grátis", icon: Crown, color: "yellow" },
          { place: "2º Lugar", prize: "Consultoria estratégica", icon: Star, color: "gray" },
          { place: "3º Lugar", prize: "500 créditos extras", icon: Medal, color: "amber" },
        ].map((item, index) => {
          const Icon = item.icon;
          return (
            <Card key={index} className={cn(
              "border-2 text-center",
              index === 0 && "border-yellow-500/30 bg-yellow-500/5",
              index === 1 && "border-gray-400/30 bg-gray-400/5",
              index === 2 && "border-amber-600/30 bg-amber-600/5"
            )}>
              <CardContent className="pt-4">
                <Icon className={cn(
                  "size-8 mx-auto mb-2",
                  index === 0 && "text-yellow-500",
                  index === 1 && "text-gray-400",
                  index === 2 && "text-amber-600"
                )} />
                <p className="font-bold text-[#001533] dark:text-white">{item.place}</p>
                <p className="text-xs text-[#001533]/60 dark:text-white/60 mt-1">{item.prize}</p>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Ranking Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-[#001533]/10 dark:border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5 text-[#1672d6]" />
              Top 10 do Mês
            </CardTitle>
            <Badge variant="outline" className="bg-[#1672d6]/10 text-[#1672d6]">
              Sua posição: #2
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            {RANKING_DATA.map((item, index) => (
              <motion.div
                key={item.position}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border-2",
                  getPositionStyle(item.position),
                  item.isUser && "ring-2 ring-[#1672d6]/50"
                )}
              >
                {/* Position */}
                <div className="w-8 text-center">
                  {getPositionIcon(item.position) || (
                    <span className="text-lg font-bold text-[#001533]/60 dark:text-white/60">
                      {item.position}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <Avatar className="h-10 w-10">
                  <AvatarFallback className={cn(
                    "text-sm font-bold",
                    item.isUser 
                      ? "bg-[#1672d6] text-white" 
                      : "bg-[#001533]/10 text-[#001533] dark:bg-white/10 dark:text-white"
                  )}>
                    {item.avatar}
                  </AvatarFallback>
                </Avatar>

                {/* Name */}
                <div className="flex-1">
                  <p className={cn(
                    "font-semibold",
                    item.isUser ? "text-[#1672d6]" : "text-[#001533] dark:text-white"
                  )}>
                    {item.name}
                    {item.isUser && <Badge className="ml-2 bg-[#1672d6]">Você</Badge>}
                  </p>
                </div>

                {/* Points */}
                <div className="text-right">
                  <p className="font-bold text-[#001533] dark:text-white">
                    {item.points.toLocaleString()} pts
                  </p>
                  <div className="flex items-center gap-1 justify-end">
                    <TrendingUp className={cn(
                      "size-3",
                      item.change.startsWith("+") ? "text-emerald-500" : 
                      item.change.startsWith("-") ? "text-red-500 rotate-180" : 
                      "text-gray-400"
                    )} />
                    <span className={cn(
                      "text-xs",
                      item.change.startsWith("+") ? "text-emerald-500" : 
                      item.change.startsWith("-") ? "text-red-500" : 
                      "text-gray-400"
                    )}>
                      {item.change}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

