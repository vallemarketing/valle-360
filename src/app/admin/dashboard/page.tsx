'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  UserPlus, 
  Briefcase, 
  TrendingUp, 
  DollarSign,
  Calendar,
  Bell,
  Target,
  Brain,
  Award,
  Activity,
  BarChart3,
  Clock,
  Eye,
  MousePointerClick,
  Zap,
  ArrowRight,
  ChevronRight,
  Rocket,
  CheckCircle,
  AlertCircle,
  Settings,
  FileText,
  MessageSquare
} from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import StatsCards from '@/components/valle-ui/StatsCards'
import OrbitalTimeline from '@/components/valle-ui/OrbitalTimeline'
import IntegrationsOrbit from '@/components/valle-ui/IntegrationsOrbit'

interface DashboardStats {
  totalClients: number
  activeClients: number
  totalEmployees: number
  activeEmployees: number
  monthlyRevenue: number
  pendingTasks: number
  completedTasksToday: number
  avgClientSatisfaction: number
}

interface RecentActivity {
  id: string
  type: string
  title: string
  description: string
  time: string
  icon: 'user' | 'task' | 'money' | 'alert'
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 45,
    activeClients: 42,
    totalEmployees: 23,
    activeEmployees: 21,
    monthlyRevenue: 285000,
    pendingTasks: 18,
    completedTasksToday: 12,
    avgClientSatisfaction: 4.7
  })

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'client',
      title: 'Novo cliente cadastrado',
      description: 'Tech Solutions Ltda',
      time: 'Há 15 minutos',
      icon: 'user'
    },
    {
      id: '2',
      type: 'task',
      title: 'Tarefa concluída',
      description: 'Campanha de Black Friday - Social Media',
      time: 'Há 32 minutos',
      icon: 'task'
    },
    {
      id: '3',
      type: 'payment',
      title: 'Pagamento recebido',
      description: 'R$ 8.500,00 - Valle Store',
      time: 'Há 1 hora',
      icon: 'money'
    },
    {
      id: '4',
      type: 'alert',
      title: 'Atenção requerida',
      description: 'Cliente Valle Boutique - Reunião agendada',
      time: 'Há 2 horas',
      icon: 'alert'
    }
  ])

  const quickActions = [
    {
      title: 'Novo Cliente',
      description: 'Cadastrar novo cliente',
      icon: UserPlus,
      href: '/admin/clientes/novo',
      color: '#1672d6'
    },
    {
      title: 'Novo Colaborador',
      description: 'Adicionar colaborador',
      icon: Users,
      href: '/admin/colaboradores/novo',
      color: '#10b981'
    },
    {
      title: 'Relatórios',
      description: 'Ver todos os relatórios',
      href: '/admin/relatorios',
      icon: BarChart3,
      color: '#8b5cf6'
    },
    {
      title: 'Configurações',
      description: 'Gerenciar sistema',
      href: '/admin/configuracoes',
      icon: Settings,
      color: '#f59e0b'
    }
  ]

  const statsCards = [
    {
      title: 'Total de Clientes',
      value: stats.totalClients.toString(),
      change: { value: `+${stats.activeClients} ativos`, type: 'increase' as const },
      icon: <Briefcase className="w-5 h-5" />,
      description: 'Clientes cadastrados'
    },
    {
      title: 'Colaboradores',
      value: stats.totalEmployees.toString(),
      change: { value: `+${stats.activeEmployees} ativos`, type: 'increase' as const },
      icon: <Users className="w-5 h-5" />,
      description: 'Equipe completa'
    },
    {
      title: 'Receita Mensal',
      value: `R$ ${(stats.monthlyRevenue / 1000).toFixed(0)}k`,
      change: { value: '+12% vs mês anterior', type: 'increase' as const },
      icon: <DollarSign className="w-5 h-5" />,
      description: 'Faturamento do mês'
    },
    {
      title: 'Tarefas Pendentes',
      value: stats.pendingTasks.toString(),
      change: { value: `${stats.completedTasksToday} concluídas hoje`, type: 'neutral' as const },
      icon: <Target className="w-5 h-5" />,
      description: 'Aguardando execução'
    }
  ]

  const getActivityIcon = (type: 'user' | 'task' | 'money' | 'alert') => {
    const icons = {
      user: Users,
      task: Target,
      money: DollarSign,
      alert: Bell
    }
    return icons[type]
  }

  const getActivityColor = (type: 'user' | 'task' | 'money' | 'alert') => {
    const colors = {
      user: 'bg-[#1672d6]/10 text-[#1672d6]',
      task: 'bg-emerald-500/10 text-emerald-500',
      money: 'bg-purple-500/10 text-purple-500',
      alert: 'bg-amber-500/10 text-amber-500'
    }
    return colors[type]
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Dashboard Admin
              </h1>
              <p className="text-muted-foreground mt-1">
                Visão geral do sistema Valle 360
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-[#1672d6]/30 text-[#1672d6] bg-[#1672d6]/5">
                <Activity className="w-3 h-3 mr-1" />
                Sistema Online
              </Badge>
              <Button className="bg-[#1672d6] hover:bg-[#1672d6]/90">
                <Zap className="w-4 h-4 mr-2" />
                Ações Rápidas
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <StatsCards stats={statsCards} columns={4} />
        </motion.div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Ações Rápidas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="border-border/60 h-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#1672d6]" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon
                    return (
                      <Link key={index} href={action.href}>
                        <motion.div
                          whileHover={{ y: -4, transition: { duration: 0.2 } }}
                          whileTap={{ scale: 0.98 }}
                          className="p-4 rounded-xl border-2 border-border/60 cursor-pointer transition-all hover:border-[#1672d6]/40 hover:shadow-lg hover:shadow-[#1672d6]/5 bg-card"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className="p-3 rounded-lg"
                              style={{ backgroundColor: `${action.color}15` }}
                            >
                              <Icon className="w-6 h-6" style={{ color: action.color }} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground mb-1">
                                {action.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {action.description}
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          </div>
                        </motion.div>
                      </Link>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Atividades Recentes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-border/60 h-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#1672d6]" />
                    Atividades Recentes
                  </span>
                  <Button variant="ghost" size="sm" className="text-[#1672d6]">
                    Ver todas
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => {
                    const Icon = getActivityIcon(activity.icon)
                    return (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ x: 4 }}
                        className="flex items-start gap-3 pb-4 border-b border-border/60 last:border-b-0 last:pb-0 cursor-pointer"
                      >
                        <div className={`p-2 rounded-lg flex-shrink-0 ${getActivityColor(activity.icon)}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground mb-1">
                            {activity.title}
                          </p>
                          <p className="text-xs text-muted-foreground mb-1 truncate">
                            {activity.description}
                          </p>
                          <p className="text-xs text-muted-foreground/70">
                            {activity.time}
                          </p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Insights da IA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card className="border-2 border-[#1672d6]/20 bg-gradient-to-br from-[#1672d6]/5 to-transparent">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-[#001533] to-[#1672d6] shadow-lg shadow-[#1672d6]/20">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-foreground">
                      💡 Insights da Val (IA)
                    </h3>
                    <Badge variant="outline" className="border-[#1672d6]/30 text-[#1672d6] text-xs">
                      Atualizado agora
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Baseado nos dados dos últimos 30 dias, identifiquei algumas oportunidades:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div 
                      whileHover={{ y: -2 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/60"
                    >
                      <div className="p-2 rounded-lg bg-emerald-500/10">
                        <Award className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">3 clientes</p>
                        <p className="text-xs text-muted-foreground">prontos para upgrade</p>
                      </div>
                    </motion.div>
                    <motion.div 
                      whileHover={{ y: -2 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/60"
                    >
                      <div className="p-2 rounded-lg bg-[#1672d6]/10">
                        <TrendingUp className="w-4 h-4 text-[#1672d6]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">+18%</p>
                        <p className="text-xs text-muted-foreground">produtividade este mês</p>
                      </div>
                    </motion.div>
                    <motion.div 
                      whileHover={{ y: -2 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border/60"
                    >
                      <div className="p-2 rounded-lg bg-amber-500/10">
                        <Bell className="w-4 h-4 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">2 colaboradores</p>
                        <p className="text-xs text-muted-foreground">precisam de atenção</p>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Orbital Timeline - Projetos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <Card className="border-border/60 overflow-hidden">
            <OrbitalTimeline 
              title="Projetos Ativos"
              subtitle="Visualize o status de todos os projetos e suas conexões"
            />
          </Card>
        </motion.div>

        {/* Integrações */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-border/60 overflow-hidden">
            <IntegrationsOrbit 
              title="Central de Integrações"
              subtitle="Gerencie todas as conexões do ecossistema Valle 360"
            />
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
