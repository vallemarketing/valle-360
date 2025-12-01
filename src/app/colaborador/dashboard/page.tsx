'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { Sparkles, Settings, LayoutGrid, Target, Zap, ChevronRight, ArrowRight } from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { NotificationBanner } from '@/components/notifications/NotificationBanner'
import { GamificationWidget } from '@/components/gamification/GamificationWidget'
import { CustomizableDashboard } from '@/components/dashboard/CustomizableDashboard'
import { RoleBasedDashboard } from '@/components/dashboard/RoleBasedDashboard'
import { DashboardSettings } from '@/components/dashboard/DashboardSettings'
import AICollectorCard from '@/components/ai/AICollectorCard'
import SmartInsightsPanel from '@/components/ai/SmartInsightsPanel'
import GoalsTracker from '@/components/goals/GoalsTracker'
import Link from 'next/link'
import { cn } from '@/lib/utils'

gsap.registerPlugin(ScrollTrigger)

// Mapeamento de área para URL do painel dedicado
const AREA_PANEL_MAP: Record<string, { url: string; label: string; color: string }> = {
  'comercial': { url: '/colaborador/comercial', label: 'Painel Comercial', color: 'from-blue-500 to-indigo-500' },
  'social_media': { url: '/colaborador/social-media', label: 'Painel Social Media', color: 'from-pink-500 to-purple-500' },
  'social media': { url: '/colaborador/social-media', label: 'Painel Social Media', color: 'from-pink-500 to-purple-500' },
  'tráfego': { url: '/colaborador/trafego', label: 'Painel de Tráfego', color: 'from-green-500 to-emerald-500' },
  'trafego': { url: '/colaborador/trafego', label: 'Painel de Tráfego', color: 'from-green-500 to-emerald-500' },
  'tráfego pago': { url: '/colaborador/trafego', label: 'Painel de Tráfego', color: 'from-green-500 to-emerald-500' },
  'web_designer': { url: '/colaborador/kanban', label: 'Kanban Web Designer', color: 'from-cyan-500 to-blue-500' },
  'web designer': { url: '/colaborador/kanban', label: 'Kanban Web Designer', color: 'from-cyan-500 to-blue-500' },
  'designer': { url: '/colaborador/kanban', label: 'Kanban Designer', color: 'from-orange-500 to-red-500' },
  'video_maker': { url: '/colaborador/kanban', label: 'Kanban Video Maker', color: 'from-purple-500 to-pink-500' },
  'video maker': { url: '/colaborador/kanban', label: 'Kanban Video Maker', color: 'from-purple-500 to-pink-500' },
  'head_marketing': { url: '/colaborador/kanban', label: 'Visão Geral', color: 'from-amber-500 to-orange-500' },
  'head marketing': { url: '/colaborador/kanban', label: 'Visão Geral', color: 'from-amber-500 to-orange-500' },
  'rh': { url: '/colaborador/kanban', label: 'Painel RH', color: 'from-teal-500 to-cyan-500' },
  'financeiro': { url: '/colaborador/financeiro/contas-receber', label: 'Painel Financeiro', color: 'from-emerald-500 to-green-500' },
}

export default function ColaboradorDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [userArea, setUserArea] = useState('')
  const [userAreaDisplay, setUserAreaDisplay] = useState('')
  const [userId, setUserId] = useState('')
  const [notifications, setNotifications] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<'specific' | 'customizable'>('specific')
  const [showSettings, setShowSettings] = useState(false)

  // Refs para animações GSAP
  const headerRef = useRef<HTMLDivElement>(null)
  const aiPanelRef = useRef<HTMLDivElement>(null)
  const goalsRef = useRef<HTMLDivElement>(null)
  const dashboardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadData()
  }, [])

  // Animações GSAP após carregamento
  useEffect(() => {
    if (!loading) {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline()
        
        // Animação do header
        tl.fromTo(
          headerRef.current,
          { y: -30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
        )
        // Animação do AI Panel
        .fromTo(
          aiPanelRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" },
          "-=0.3"
        )
        // Animação das metas
        .fromTo(
          goalsRef.current,
          { x: 30, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.5, ease: "power3.out" },
          "-=0.4"
        )
        // Animação do dashboard específico
        .fromTo(
          dashboardRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" },
          "-=0.2"
        )
      })

      return () => ctx.revert()
    }
  }, [loading])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return
      }

      setUserId(user.id);

      // Buscar dados do usuário
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single()

      const { data: employee } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', user.id)
        .single()

      // Usar area_of_expertise diretamente da tabela employees
      const rawArea = employee?.area_of_expertise || 'Web Designer';
      const area = rawArea.toLowerCase().replace(/ /g, '_');
      
      // Buscar nome completo do employee se profile não tiver
      const fullName = profile?.full_name || employee?.full_name || 'Colaborador';
      const firstName = fullName.split(' ')[0];

      setUserName(firstName)
      setUserArea(area)
      setUserAreaDisplay(rawArea)

      // Carregar notificações
      const notifs = loadNotifications(rawArea)
      setNotifications(notifs)

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadNotifications = (area: string) => {
    const baseNotifications = [
      {
        type: 'meeting' as const,
        title: '📅 Reunião agendada em 2 horas',
        description: 'Cliente Tech Solutions - Análise de Performance Q4'
      }
    ]

    if (['Tráfego Pago', 'Tráfego', 'Gestor de Tráfego'].includes(area)) {
      return [
        ...baseNotifications,
        {
          type: 'refill' as const,
          title: '💰 Cliente precisa recarregar saldo',
          description: 'E-commerce Plus - Facebook Ads: Budget esgotado',
          actionLabel: 'Notificar'
        }
      ]
    }

    if (['Social Media', 'Social'].includes(area)) {
      return [
        ...baseNotifications,
        {
          type: 'approval' as const,
          title: '✅ 3 posts aguardando aprovação',
          description: 'Cliente Tech Solutions - Instagram Stories',
          actionLabel: 'Ver Posts'
        }
      ]
    }

    if (area === 'Comercial') {
      return [
        ...baseNotifications,
        {
          type: 'upsell' as const,
          title: '💡 Oportunidade de Upsell',
          description: 'Cliente E-commerce Plus não tem: Tráfego Pago, Automação',
          actionLabel: 'Ver Detalhes'
        }
      ]
    }

    return baseNotifications
  }

  const panelConfig = AREA_PANEL_MAP[userArea.toLowerCase()]

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: 'var(--primary-500)' }}></div>
          <p className="mt-4" style={{ color: 'var(--text-secondary)' }}>Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-73px)] p-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div ref={headerRef} className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              Olá, {userName}! 👋
            </h1>
            <p className="text-lg font-semibold" style={{ color: '#4370d1' }}>
              {userAreaDisplay}
            </p>
          </div>
          
          {/* Botões de Controle */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSettings(true)}
              className="p-3 rounded-xl shadow-lg transition-all"
              style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}
              title="Configurações do Dashboard"
            >
              <Settings className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode(viewMode === 'specific' ? 'customizable' : 'specific')}
              className="px-6 py-3 rounded-xl font-semibold text-white shadow-lg transition-all flex items-center gap-2"
              style={{ backgroundColor: 'var(--primary-600)' }}
            >
              <LayoutGrid className="w-5 h-5" />
              {viewMode === 'specific' ? 'Personalizar' : 'Dashboard Padrão'}
            </motion.button>
          </div>
        </div>

        {/* Painel Inteligente da Área - NO TOPO */}
        {panelConfig && (
          <Link href={panelConfig.url}>
            <motion.div
              whileHover={{ scale: 1.01, y: -2 }}
              className={cn(
                "relative overflow-hidden rounded-2xl p-6 cursor-pointer shadow-lg",
                `bg-gradient-to-r ${panelConfig.color}`
              )}
            >
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{panelConfig.label}</h2>
                    <p className="text-white/80 text-sm">
                      Acesse seu painel inteligente com IA, métricas e automações
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-white font-medium">
                  Acessar
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          </Link>
        )}

        {/* Grid Principal: IA Cobrança + Metas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal: IA Cobrança */}
          <div className="lg:col-span-2 space-y-6" ref={aiPanelRef}>
            <AICollectorCard area={userArea} maxAlerts={4} />
            
            {/* Notificações */}
            {notifications.length > 0 && (
              <div className="space-y-3">
                {notifications.slice(0, 2).map((notif, index) => (
                  <NotificationBanner
                    key={index}
                    type={notif.type}
                    title={notif.title}
                    description={notif.description}
                    actionLabel={notif.actionLabel}
                    delay={index * 0.1}
                  />
                ))}
              </div>
            )}
          </div>
          
          {/* Coluna Lateral: Metas + Gamificação */}
          <div className="lg:col-span-1 space-y-6" ref={goalsRef}>
            <GoalsTracker area={userArea} />
            <GamificationWidget />
          </div>
        </div>

        {/* Insights Inteligentes */}
        <SmartInsightsPanel area={userArea} maxInsights={4} />

        {/* Dashboards - Personalizável ou Específico da Área */}
        <div ref={dashboardRef}>
          {viewMode === 'customizable' && userId && (
            <CustomizableDashboard userId={userId} />
          )}

          {viewMode === 'specific' && (
            <RoleBasedDashboard role={userArea} />
          )}
        </div>

        {/* Card de Ação Rápida para Kanban */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/colaborador/kanban">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-4 bg-white rounded-xl border shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <LayoutGrid className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">Kanban</h4>
                  <p className="text-xs text-gray-500">Gerencie suas demandas</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </motion.div>
          </Link>

          <Link href="/colaborador/agenda">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-4 bg-white rounded-xl border shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">Agenda</h4>
                  <p className="text-xs text-gray-500">Reuniões e compromissos</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </motion.div>
          </Link>

          <Link href="/colaborador/mensagens">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="p-4 bg-white rounded-xl border shadow-sm hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">Mensagens</h4>
                  <p className="text-xs text-gray-500">Equipe e clientes</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </motion.div>
          </Link>
        </div>

      </div>

      {/* Modal de Configurações do Dashboard */}
      <DashboardSettings
        userId={userId}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={(settings) => {
          console.log('Configurações salvas:', settings)
        }}
      />
    </div>
  )
}
