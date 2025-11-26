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
  Clock
} from 'lucide-react'
import Link from 'next/link'

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
      color: 'var(--primary-500)'
    },
    {
      title: 'Novo Colaborador',
      description: 'Adicionar colaborador',
      icon: Users,
      href: '/admin/colaboradores/novo',
      color: 'var(--success-500)'
    },
    {
      title: 'Relatórios',
      description: 'Ver todos os relatórios',
      href: '/admin/relatorios',
      icon: BarChart3,
      color: 'var(--purple-500)'
    },
    {
      title: 'Configurações',
      description: 'Gerenciar sistema',
      href: '/admin/configuracoes',
      icon: Activity,
      color: 'var(--warning-500)'
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Dashboard Admin
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Visão geral do sistema Valle 360
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Clientes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl p-6 shadow-sm border"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-light)'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: 'var(--primary-50)' }}
              >
                <Briefcase className="w-6 h-6" style={{ color: 'var(--primary-500)' }} />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {stats.totalClients}
                </p>
                <p className="text-sm" style={{ color: 'var(--success-600)' }}>
                  +{stats.activeClients} ativos
                </p>
              </div>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Total de Clientes
            </p>
          </motion.div>

          {/* Total Colaboradores */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl p-6 shadow-sm border"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-light)'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: 'var(--success-50)' }}
              >
                <Users className="w-6 h-6" style={{ color: 'var(--success-500)' }} />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {stats.totalEmployees}
                </p>
                <p className="text-sm" style={{ color: 'var(--success-600)' }}>
                  +{stats.activeEmployees} ativos
                </p>
              </div>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Colaboradores
            </p>
          </motion.div>

          {/* Receita Mensal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl p-6 shadow-sm border"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-light)'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: 'var(--purple-50)' }}
              >
                <DollarSign className="w-6 h-6" style={{ color: 'var(--purple-500)' }} />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  R$ {(stats.monthlyRevenue / 1000).toFixed(0)}k
                </p>
                <p className="text-sm" style={{ color: 'var(--success-600)' }}>
                  +12% vs mês anterior
                </p>
              </div>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Receita Mensal
            </p>
          </motion.div>

          {/* Tarefas Pendentes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl p-6 shadow-sm border"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-light)'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: 'var(--warning-50)' }}
              >
                <Target className="w-6 h-6" style={{ color: 'var(--warning-500)' }} />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  {stats.pendingTasks}
                </p>
                <p className="text-sm" style={{ color: 'var(--success-600)' }}>
                  {stats.completedTasksToday} concluídas hoje
                </p>
              </div>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Tarefas Pendentes
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ações Rápidas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2"
          >
            <div
              className="rounded-xl p-6 shadow-sm border"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-light)'
              }}
            >
              <h2
                className="text-xl font-bold mb-6 flex items-center gap-2"
                style={{ color: 'var(--text-primary)' }}
              >
                <Activity className="w-6 h-6" style={{ color: 'var(--primary-500)' }} />
                Ações Rápidas
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon
                  return (
                    <Link key={index} href={action.href}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md"
                        style={{
                          borderColor: 'var(--border-light)',
                          backgroundColor: 'var(--bg-secondary)'
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="p-3 rounded-lg"
                            style={{ backgroundColor: `${action.color}20` }}
                          >
                            <Icon className="w-6 h-6" style={{ color: action.color }} />
                          </div>
                          <div className="flex-1">
                            <h3
                              className="font-semibold mb-1"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {action.title}
                            </h3>
                            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                              {action.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </motion.div>

          {/* Atividades Recentes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div
              className="rounded-xl p-6 shadow-sm border"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-light)'
              }}
            >
              <h2
                className="text-xl font-bold mb-6 flex items-center gap-2"
                style={{ color: 'var(--text-primary)' }}
              >
                <Clock className="w-6 h-6" style={{ color: 'var(--primary-500)' }} />
                Atividades Recentes
              </h2>

              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const Icon = getActivityIcon(activity.icon)
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 pb-4 border-b last:border-b-0"
                      style={{ borderColor: 'var(--border-light)' }}
                    >
                      <div
                        className="p-2 rounded-lg flex-shrink-0"
                        style={{ backgroundColor: 'var(--bg-tertiary)' }}
                      >
                        <Icon className="w-4 h-4" style={{ color: 'var(--primary-500)' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-medium text-sm mb-1"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {activity.title}
                        </p>
                        <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
                          {activity.description}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <Link href="/admin/atividades">
                <button
                  className="w-full mt-4 py-2 rounded-lg font-medium text-sm transition-colors"
                  style={{
                    backgroundColor: 'var(--primary-50)',
                    color: 'var(--primary-600)'
                  }}
                >
                  Ver todas as atividades
                </button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Insights da IA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-6"
        >
          <div
            className="rounded-xl p-6 shadow-sm border"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--primary-200)',
              borderWidth: '2px'
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="p-3 rounded-lg"
                style={{ backgroundColor: 'var(--primary-50)' }}
              >
                <Brain className="w-6 h-6" style={{ color: 'var(--primary-500)' }} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                  💡 Insight da Val (IA)
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Baseado nos dados dos últimos 30 dias, identifiquei algumas oportunidades:
                </p>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <li className="flex items-center gap-2">
                    <Award className="w-4 h-4" style={{ color: 'var(--success-500)' }} />
                    <span>3 clientes estão prontos para fazer <strong>upgrade</strong> de plano</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" style={{ color: 'var(--primary-500)' }} />
                    <span>Produtividade da equipe aumentou <strong>18%</strong> este mês</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Bell className="w-4 h-4" style={{ color: 'var(--warning-500)' }} />
                    <span>2 colaboradores precisam de <strong>atenção especial</strong> (bem-estar baixo)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
