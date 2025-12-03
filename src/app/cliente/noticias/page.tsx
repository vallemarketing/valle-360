"use client";

// ============================================
// NOTÍCIAS - VALLE AI
// Página de notícias e atualizações do mercado
// Cores: #001533 (navy), #1672d6 (primary), #ffffff (white)
// ============================================

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Newspaper, 
  TrendingUp, 
  Users, 
  Globe,
  Filter,
  Search,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/valle-ui";
import IndustryNewsFeed from "@/components/cliente/IndustryNewsFeed";

const categories = [
  { id: "all", label: "Todas", icon: Globe },
  { id: "mercado", label: "Mercado", icon: TrendingUp },
  { id: "concorrentes", label: "Concorrentes", icon: Users },
  { id: "tendencias", label: "Tendências", icon: Newspaper },
];

export default function NoticiasPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <PageHeader
          title="Notícias do Mercado"
          description="Acompanhe as últimas novidades do seu setor e dos concorrentes"
          breadcrumb={[
            { label: "Dashboard", href: "/cliente/dashboard" },
            { label: "Notícias" },
          ]}
          actions={
            <Button 
              variant="outline" 
              className="border-[#1672d6]/30 text-[#1672d6] hover:bg-[#1672d6]/10"
            >
              <RefreshCw className="size-4 mr-2" />
              Atualizar
            </Button>
          }
        />
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#001533]/40 dark:text-white/40" />
          <Input
            placeholder="Buscar notícias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-[#001533]/20 dark:border-white/20 focus:border-[#1672d6] focus:ring-[#1672d6]/20"
          />
        </div>

        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            
            return (
              <Button
                key={category.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category.id)}
                className={
                  isActive
                    ? "bg-[#1672d6] hover:bg-[#1672d6]/90 text-white"
                    : "border-[#001533]/20 dark:border-white/20 text-[#001533] dark:text-white hover:bg-[#1672d6]/10"
                }
              >
                <Icon className="size-4 mr-2" />
                {category.label}
              </Button>
            );
          })}
        </div>
      </motion.div>

      {/* News Feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="rounded-2xl border-2 border-[#001533]/10 dark:border-white/10 bg-white dark:bg-[#001533]/50 overflow-hidden"
      >
        <IndustryNewsFeed 
          industry="marketing_digital" 
          clientName="Sua Empresa" 
        />
      </motion.div>
    </div>
  );
}
