"use client";

// ============================================
// CLIENT SIDEBAR - VALLE AI
// Sidebar colapsável para área do cliente
// Cores: #001533 (navy), #1672d6 (primary), #ffffff (white)
// ============================================

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileCheck,
  FolderOpen,
  Lightbulb,
  TrendingUp,
  Users,
  DollarSign,
  CreditCard,
  Briefcase,
  MessageSquare,
  Newspaper,
  UserCircle,
  Gift,
  Calendar,
  Share2,
  Bot,
  Send,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Grupos de navegação
const navGroups = [
  {
    label: "Principal",
    items: [
      { href: "/cliente/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/cliente/producao", label: "Produção", icon: FileCheck, badge: 3 },
      { href: "/cliente/aprovacoes", label: "Aprovações", icon: FileCheck },
    ],
  },
  {
    label: "Métricas",
    items: [
      { href: "/cliente/insights", label: "Insights", icon: Lightbulb },
      { href: "/cliente/evolucao", label: "Evolução", icon: TrendingUp },
      { href: "/cliente/concorrentes", label: "Concorrentes", icon: Users },
      { href: "/cliente/redes", label: "Redes Sociais", icon: Share2 },
    ],
  },
  {
    label: "Financeiro",
    items: [
      { href: "/cliente/financeiro", label: "Financeiro", icon: DollarSign },
      { href: "/cliente/creditos", label: "Créditos", icon: CreditCard },
      { href: "/cliente/servicos", label: "Serviços", icon: Briefcase },
    ],
  },
  {
    label: "Comunicação",
    items: [
      { href: "/cliente/mensagens", label: "Mensagens", icon: MessageSquare },
      { href: "/cliente/noticias", label: "Notícias", icon: Newspaper },
      { href: "/cliente/solicitacao", label: "Solicitações", icon: Send },
    ],
  },
  {
    label: "Conta",
    items: [
      { href: "/cliente/perfil", label: "Meu Perfil", icon: UserCircle },
      { href: "/cliente/beneficios", label: "Benefícios", icon: Gift },
      { href: "/cliente/agenda", label: "Agenda", icon: Calendar },
      { href: "/cliente/arquivos", label: "Arquivos", icon: FolderOpen },
      { href: "/cliente/ia", label: "Assistente IA", icon: Bot },
    ],
  },
];

interface ClientSidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function ClientSidebar({ collapsed = false, onCollapsedChange }: ClientSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  const handleToggle = () => {
    const newValue = !isCollapsed;
    setIsCollapsed(newValue);
    onCollapsedChange?.(newValue);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen",
          "bg-[#001533] border-r border-white/10",
          "transition-all duration-300 ease-in-out",
          "flex flex-col",
          isCollapsed ? "w-[70px]" : "w-[260px]"
        )}
      >
        {/* Header */}
        <div className={cn(
          "flex items-center h-16 px-4 border-b border-white/10",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          <Link href="/cliente/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1672d6] to-[#1672d6]/80 flex items-center justify-center shadow-lg shadow-[#1672d6]/30 flex-shrink-0">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <span className="font-semibold text-white block">Valle AI</span>
                <span className="text-white/40 text-xs">Portal do Cliente</span>
              </div>
            )}
          </Link>
          
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggle}
              className="text-white/60 hover:text-white hover:bg-white/10 h-8 w-8"
            >
              <PanelLeftClose className="size-4" />
            </Button>
          )}
        </div>

        {/* Botão de expandir (quando colapsado) */}
        {isCollapsed && (
          <div className="flex justify-center py-3 border-b border-white/10">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggle}
              className="text-white/60 hover:text-white hover:bg-white/10 h-8 w-8"
            >
              <PanelLeft className="size-4" />
            </Button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
          {navGroups.map((group) => (
            <div key={group.label}>
              {/* Group Label */}
              {!isCollapsed && (
                <h3 className="px-3 mb-2 text-xs font-semibold text-white/40 uppercase tracking-wider">
                  {group.label}
                </h3>
              )}
              
              {/* Group Items */}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

                  const linkContent = (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg",
                        "transition-all duration-200",
                        "group relative",
                        isActive
                          ? "bg-[#1672d6] text-white shadow-lg shadow-[#1672d6]/30"
                          : "text-white/70 hover:text-white hover:bg-white/10",
                        isCollapsed && "justify-center px-0"
                      )}
                    >
                      <Icon className={cn(
                        "size-5 flex-shrink-0",
                        isActive ? "text-white" : "text-white/70 group-hover:text-white"
                      )} />
                      
                      {!isCollapsed && (
                        <>
                          <span className="font-medium text-sm">{item.label}</span>
                          {item.badge && (
                            <span className="ml-auto flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                      
                      {isCollapsed && item.badge && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );

                  // Com tooltip quando colapsado
                  if (isCollapsed) {
                    return (
                      <Tooltip key={item.href}>
                        <TooltipTrigger asChild>
                          {linkContent}
                        </TooltipTrigger>
                        <TooltipContent side="right" className="bg-[#001533] border-white/20 text-white">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return <div key={item.href}>{linkContent}</div>;
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className={cn(
          "p-4 border-t border-white/10",
          isCollapsed && "px-2"
        )}>
          {!isCollapsed ? (
            <div className="p-3 rounded-lg bg-[#1672d6]/10 border border-[#1672d6]/20">
              <p className="text-white/90 text-sm font-medium mb-1">Precisa de ajuda?</p>
              <p className="text-white/50 text-xs mb-3">Nossa equipe está online</p>
              <Link
                href="/cliente/mensagens"
                className="block w-full text-center py-2 rounded-lg bg-[#1672d6] text-white text-sm font-medium hover:bg-[#1672d6]/90 transition-colors"
              >
                Falar com Suporte
              </Link>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/cliente/mensagens"
                  className="flex items-center justify-center p-2 rounded-lg bg-[#1672d6] text-white hover:bg-[#1672d6]/90 transition-colors"
                >
                  <MessageSquare className="size-5" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-[#001533] border-white/20 text-white">
                Falar com Suporte
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}

export default ClientSidebar;
