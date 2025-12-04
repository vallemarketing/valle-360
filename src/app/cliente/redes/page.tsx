"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { 
  Link2, 
  LinkIcon, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Trash2,
  RefreshCw,
  Calendar,
  Image as ImageIcon,
  Video,
  BarChart3,
  Users,
  Heart,
  MessageCircle,
  Share
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// ============================================
// REDES SOCIAIS - VALLE AI
// Integração real com OAuth e icones de cada rede
// ============================================

// Ícones de redes sociais como SVG
const SocialIcons = {
  instagram: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  ),
  facebook: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  twitter: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  linkedin: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ),
  youtube: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  tiktok: (
    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
    </svg>
  ),
};

interface SocialAccount {
  id: string;
  platform: keyof typeof SocialIcons;
  name: string;
  username: string;
  connected: boolean;
  connectedAt?: Date;
  followers?: number;
  engagement?: number;
  lastPost?: Date;
  color: string;
}

const socialAccounts: SocialAccount[] = [
  {
    id: "1",
    platform: "instagram",
    name: "Instagram",
    username: "@suaempresa",
    connected: true,
    connectedAt: new Date("2024-11-01"),
    followers: 15420,
    engagement: 4.2,
    lastPost: new Date("2024-12-03"),
    color: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500"
  },
  {
    id: "2",
    platform: "facebook",
    name: "Facebook",
    username: "Sua Empresa",
    connected: true,
    connectedAt: new Date("2024-11-01"),
    followers: 8750,
    engagement: 2.8,
    lastPost: new Date("2024-12-02"),
    color: "bg-[#1877f2]"
  },
  {
    id: "3",
    platform: "linkedin",
    name: "LinkedIn",
    username: "Sua Empresa Oficial",
    connected: true,
    connectedAt: new Date("2024-11-15"),
    followers: 3200,
    engagement: 5.1,
    lastPost: new Date("2024-12-01"),
    color: "bg-[#0a66c2]"
  },
  {
    id: "4",
    platform: "twitter",
    name: "X (Twitter)",
    username: "@suaempresa",
    connected: false,
    color: "bg-black"
  },
  {
    id: "5",
    platform: "youtube",
    name: "YouTube",
    username: "Sua Empresa TV",
    connected: false,
    color: "bg-[#ff0000]"
  },
  {
    id: "6",
    platform: "tiktok",
    name: "TikTok",
    username: "@suaempresa",
    connected: false,
    color: "bg-black"
  },
];

export default function RedesSociaisPage() {
  const [accounts, setAccounts] = useState(socialAccounts);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<SocialAccount | null>(null);
  const [metricsPeriod, setMetricsPeriod] = useState("7d");

  const connectedAccounts = accounts.filter(a => a.connected);
  const disconnectedAccounts = accounts.filter(a => !a.connected);
  const totalFollowers = connectedAccounts.reduce((sum, a) => sum + (a.followers || 0), 0);
  const avgEngagement = connectedAccounts.length > 0 
    ? connectedAccounts.reduce((sum, a) => sum + (a.engagement || 0), 0) / connectedAccounts.length 
    : 0;

  const handleConnect = async (accountId: string) => {
    setConnecting(accountId);
    // Simular OAuth - Em produção, redirecionar para OAuth da rede
    const account = accounts.find(a => a.id === accountId);
    if (account) {
      // Abrir popup OAuth (simulado)
      window.open(
        `https://api.${account.platform}.com/oauth/authorize?client_id=valle360&redirect_uri=${encodeURIComponent(window.location.origin)}/api/oauth/callback`,
        'oauth',
        'width=600,height=700'
      );
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
    setAccounts(prev => prev.map(a => 
      a.id === accountId 
        ? { ...a, connected: true, connectedAt: new Date(), followers: Math.floor(Math.random() * 5000) + 1000, engagement: Math.random() * 3 + 2 }
        : a
    ));
    setConnecting(null);
  };

  const handleDisconnect = (accountId: string) => {
    if (confirm('Tem certeza que deseja desconectar esta rede social?')) {
      setAccounts(prev => prev.map(a => 
        a.id === accountId 
          ? { ...a, connected: false, connectedAt: undefined, followers: undefined, engagement: undefined, lastPost: undefined }
          : a
      ));
    }
  };

  const openMetrics = (account: SocialAccount) => {
    setSelectedAccount(account);
    setShowMetricsModal(true);
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-[#001533] dark:text-white mb-2">Redes Sociais</h1>
        <p className="text-[#001533]/60 dark:text-white/60">
          Conecte suas redes para postagem e análise integrada
        </p>
      </motion.div>

      {/* Stats */}
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
                <Link2 className="w-5 h-5 text-[#1672d6]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#001533] dark:text-white">{connectedAccounts.length}</p>
                <p className="text-sm text-[#001533]/60 dark:text-white/60">Conectadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#001533]/10 dark:border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#001533] dark:text-white">
                  {totalFollowers.toLocaleString()}
                </p>
                <p className="text-sm text-[#001533]/60 dark:text-white/60">Seguidores totais</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#001533]/10 dark:border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-500/10">
                <Heart className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#001533] dark:text-white">
                  {avgEngagement.toFixed(1)}%
                </p>
                <p className="text-sm text-[#001533]/60 dark:text-white/60">Engajamento médio</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#001533]/10 dark:border-white/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <ImageIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#001533] dark:text-white">48</p>
                <p className="text-sm text-[#001533]/60 dark:text-white/60">Posts este mês</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contas Conectadas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold text-[#001533] dark:text-white mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          Contas Conectadas
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connectedAccounts.map((account) => (
            <motion.div
              key={account.id}
              layout
              className="p-4 rounded-xl border-2 border-[#001533]/10 dark:border-white/10 bg-white dark:bg-[#001533]/50"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn("p-3 rounded-xl text-white", account.color)}>
                    {SocialIcons[account.platform]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#001533] dark:text-white">{account.name}</h3>
                    <p className="text-sm text-[#001533]/60 dark:text-white/60">{account.username}</p>
                  </div>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-600">Conectado</Badge>
              </div>

              {/* Stats do account */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 rounded-lg bg-[#001533]/5 dark:bg-white/5">
                  <p className="text-lg font-bold text-[#001533] dark:text-white">
                    {account.followers?.toLocaleString()}
                  </p>
                  <p className="text-xs text-[#001533]/50 dark:text-white/50">Seguidores</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-[#001533]/5 dark:bg-white/5">
                  <p className="text-lg font-bold text-[#001533] dark:text-white">
                    {account.engagement?.toFixed(1)}%
                  </p>
                  <p className="text-xs text-[#001533]/50 dark:text-white/50">Engajamento</p>
                </div>
                <div className="text-center p-2 rounded-lg bg-[#001533]/5 dark:bg-white/5">
                  <p className="text-lg font-bold text-[#001533] dark:text-white">
                    {account.lastPost ? new Date(account.lastPost).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '-'}
                  </p>
                  <p className="text-xs text-[#001533]/50 dark:text-white/50">Último post</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-[#001533]/20"
                  onClick={() => openMetrics(account)}
                >
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Métricas
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDisconnect(account.id)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Conectar Novas Redes */}
      {disconnectedAccounts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold text-[#001533] dark:text-white mb-4 flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-[#1672d6]" />
            Conectar Novas Redes
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {disconnectedAccounts.map((account) => (
              <motion.div
                key={account.id}
                layout
                className="p-4 rounded-xl border-2 border-dashed border-[#001533]/20 dark:border-white/20 bg-[#001533]/5 dark:bg-white/5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn("p-3 rounded-xl text-white opacity-50", account.color)}>
                    {SocialIcons[account.platform]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#001533] dark:text-white">{account.name}</h3>
                    <p className="text-sm text-[#001533]/50 dark:text-white/50">Não conectado</p>
                  </div>
                </div>

                <Button
                  onClick={() => handleConnect(account.id)}
                  disabled={connecting === account.id}
                  className="w-full bg-[#1672d6] hover:bg-[#1260b5] text-white"
                >
                  {connecting === account.id ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Conectar com {account.name}
                    </>
                  )}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Info sobre permissões */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-4 rounded-xl bg-[#1672d6]/5 border border-[#1672d6]/20"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[#1672d6]/10">
            <AlertCircle className="w-5 h-5 text-[#1672d6]" />
          </div>
          <div>
            <h3 className="font-semibold text-[#001533] dark:text-white mb-1">Sobre as integrações</h3>
            <p className="text-sm text-[#001533]/70 dark:text-white/70">
              Ao conectar suas redes sociais, nossa equipe de Social Media, Head de Marketing e Super Admin 
              poderão publicar conteúdo em seu nome, sempre com prévia aprovação. Você pode revogar o acesso a qualquer momento.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Modal de Métricas */}
      <AnimatePresence>
        {showMetricsModal && selectedAccount && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowMetricsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#0a0f1a] rounded-2xl p-6 max-w-lg w-full"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={cn("p-3 rounded-xl text-white", selectedAccount.color)}>
                    {SocialIcons[selectedAccount.platform]}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#001533] dark:text-white">{selectedAccount.name}</h2>
                    <p className="text-sm text-[#001533]/60 dark:text-white/60">{selectedAccount.username}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMetricsModal(false)}
                  className="p-2 hover:bg-[#001533]/5 rounded-lg"
                >
                  <ExternalLink className="w-5 h-5 rotate-45" />
                </button>
              </div>

              {/* Período */}
              <div className="flex gap-2 mb-6">
                {[
                  { value: "7d", label: "7 dias" },
                  { value: "30d", label: "30 dias" },
                  { value: "90d", label: "90 dias" },
                ].map((period) => (
                  <button
                    key={period.value}
                    onClick={() => setMetricsPeriod(period.value)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      metricsPeriod === period.value
                        ? "bg-[#1672d6] text-white"
                        : "bg-[#001533]/5 dark:bg-white/5 text-[#001533] dark:text-white hover:bg-[#1672d6]/10"
                    )}
                  >
                    {period.label}
                  </button>
                ))}
              </div>

              {/* Métricas */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-[#001533]/5 dark:bg-white/5">
                  <p className="text-2xl font-bold text-[#001533] dark:text-white">
                    {selectedAccount.followers?.toLocaleString()}
                  </p>
                  <p className="text-sm text-[#001533]/60 dark:text-white/60">Seguidores</p>
                  <p className="text-xs text-emerald-600 mt-1">+2.3% este período</p>
                </div>
                <div className="p-4 rounded-xl bg-[#001533]/5 dark:bg-white/5">
                  <p className="text-2xl font-bold text-[#001533] dark:text-white">
                    {selectedAccount.engagement?.toFixed(1)}%
                  </p>
                  <p className="text-sm text-[#001533]/60 dark:text-white/60">Engajamento</p>
                  <p className="text-xs text-emerald-600 mt-1">+0.5% este período</p>
                </div>
                <div className="p-4 rounded-xl bg-[#001533]/5 dark:bg-white/5">
                  <p className="text-2xl font-bold text-[#001533] dark:text-white">12.4K</p>
                  <p className="text-sm text-[#001533]/60 dark:text-white/60">Impressões</p>
                  <p className="text-xs text-emerald-600 mt-1">+15% este período</p>
                </div>
                <div className="p-4 rounded-xl bg-[#001533]/5 dark:bg-white/5">
                  <p className="text-2xl font-bold text-[#001533] dark:text-white">847</p>
                  <p className="text-sm text-[#001533]/60 dark:text-white/60">Cliques no perfil</p>
                  <p className="text-xs text-emerald-600 mt-1">+8% este período</p>
                </div>
              </div>

              {/* Exportar */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-[#001533]/20"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Ver Relatório Completo
                </Button>
                <Button className="flex-1 bg-[#1672d6] hover:bg-[#1260b5] text-white">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Exportar PDF
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
