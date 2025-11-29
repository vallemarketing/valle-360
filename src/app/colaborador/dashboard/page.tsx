'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { Sparkles, Settings } from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { NotificationBanner } from '@/components/notifications/NotificationBanner'
import { IcebreakerCard } from '@/components/val/IcebreakerCard'
import { GamificationWidget } from '@/components/gamification/GamificationWidget'
import { CustomizableDashboard } from '@/components/dashboard/CustomizableDashboard'
import { RoleBasedDashboard } from '@/components/dashboard/RoleBasedDashboard'
import { DashboardSettings } from '@/components/dashboard/DashboardSettings'

gsap.registerPlugin(ScrollTrigger)

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
  const icebreakerRef = useRef<HTMLDivElement>(null)
  const gamificationRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const dashboardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    console.log("🚀 DASHBOARD CARREGADO - V2.0 LIVE CHECK")
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
        // Animação do Icebreaker
        .fromTo(
          icebreakerRef.current,
          { x: -50, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
          "-=0.4"
        )
        // Animação do Gamification
        .fromTo(
          gamificationRef.current,
          { x: 50, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
          "-=0.5"
        )
        // Animação das notificações
        .fromTo(
          notificationsRef.current?.children || [],
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: "power2.out" },
          "-=0.3"
        )
        // Animação do dashboard específico
        .fromTo(
          dashboardRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" },
          "-=0.2"
        )

        // Animação de parallax no scroll
        if (headerRef.current) {
          gsap.to(headerRef.current, {
            yPercent: 10,
            ease: "none",
            scrollTrigger: {
              trigger: headerRef.current,
              start: "top top",
              end: "bottom top",
              scrub: true
            }
          })
        }
      })

      return () => ctx.revert() // Cleanup das animações
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
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single()

      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select(`
          *,
          employee_areas_of_expertise(area_name)
        `)
        .eq('user_id', user.id)
        .single()

      // Normalizar a área para garantir que o mapeamento funcione

      const rawArea = employee?.employee_areas_of_expertise?.[0]?.area_name || 'Web Designer';
      const area = rawArea.toLowerCase().replace(/ /g, '_');
      
      // Buscar nome completo do employee se profile não tiver
      const fullName = profile?.full_name || employee?.full_name || 'Colaborador';
      const firstName = fullName.split(' ')[0];

      console.log('🎯 ÁREA DETECTADA (Raw):', rawArea)
      console.log('🎯 ÁREA NORMALIZADA:', area)
      console.log('👤 NOME COMPLETO:', fullName)
      console.log('👤 PRIMEIRO NOME:', firstName)

      setUserName(firstName)
      setUserArea(area) // Área normalizada para lógica
      setUserAreaDisplay(rawArea) // Área original para exibição

      // Carregar notificações e dados específicos
      const notifs = loadNotifications(rawArea) // Manter rawArea para notificações se necessário
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
      },
      {
        type: 'overdue' as const,
        title: '⚠️ Tarefa atrasada há 2 dias',
        description: 'Relatório mensal - Cliente Marketing Pro'
      }
    ]

    // Notificações específicas por área
    if (['Tráfego Pago', 'Tráfego', 'Gestor de Tráfego'].includes(area)) {
      return [
        ...baseNotifications,
        {
          type: 'refill' as const,
          title: '💰 Cliente precisa recarregar saldo',
          description: 'E-commerce Plus - Facebook Ads: Budget esgotado',
          actionLabel: 'Notificar'
        },
        {
          type: 'low_budget' as const,
          title: '⚡ Budget acabando',
          description: 'Tech Solutions - Google Ads: Restam R$ 200',
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
        },
        {
          type: 'info' as const,
          title: '⏰ Postagem agendada em 1 hora',
          description: 'Cliente Marketing Pro - LinkedIn'
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
        
        {/* Header - COM ANIMAÇÃO GSAP */}
        <div ref={headerRef} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
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
              <Sparkles className="w-5 h-5" />
              {viewMode === 'specific' ? 'Personalizar Dashboard' : 'Dashboard Padrão'}
            </motion.button>
          </div>
        </div>

        {/* Grid Layout: Icebreaker + Gamification - COM ANIMAÇÃO GSAP */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal: Icebreaker */}
          <div className="lg:col-span-2" ref={icebreakerRef}>
            <IcebreakerCard area={userArea} />
          </div>
          
          {/* Coluna Lateral: Gamification */}
          <div className="lg:col-span-1" ref={gamificationRef}>
            <GamificationWidget />
          </div>
        </div>

        {/* Notificações - COM ANIMAÇÃO GSAP */}
        {notifications.length > 0 && (
          <div className="space-y-3" ref={notificationsRef}>
            {notifications.map((notif, index) => (
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

        {/* Dashboards - Personalizável ou Específico da Área */}
        <div ref={dashboardRef}>
          
          {/* Dashboard Personalizável */}
          {viewMode === 'customizable' && userId && (
            <CustomizableDashboard userId={userId} />
          )}

          {/* Dashboard Modular Baseado em Cargo (Novo Padrão) */}
          {viewMode === 'specific' && (
             <RoleBasedDashboard role={userArea} />
          )}
        </div>

        {/* Insights da Val */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-6"
          style={{ 
            background: 'linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%)',
            borderWidth: '1px',
            borderColor: 'var(--primary-200)'
          }}
        >
          <div className="flex items-start gap-4">
            <div 
              className="p-3 rounded-xl flex-shrink-0"
              style={{ backgroundColor: 'var(--primary-500)' }}
            >
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold mb-2" style={{ color: 'var(--primary-700)' }}>
                💡 Insight da Val
              </h3>
              <p className="text-sm mb-3" style={{ color: 'var(--primary-600)' }}>
                {userArea === 'Tráfego Pago' && 
                  'Excelente trabalho! Suas campanhas estão com ROAS acima da média. Continue monitorando os budgets para evitar pausas.'}
                {userArea === 'Social Media' && 
                  'Ótimo engajamento esta semana! Lembre-se de enviar os posts pendentes para aprovação do cliente.'}
                {userArea === 'Comercial' && 
                  'Você tem 2 ótimas oportunidades de upsell! Aproveite para oferecer serviços complementares aos seus clientes.'}
                {!['Tráfego Pago', 'Social Media', 'Comercial'].includes(userArea) && 
                  'Continue com o excelente trabalho! Você está no caminho certo para atingir suas metas.'}
              </p>
              <p className="text-xs font-semibold" style={{ color: 'var(--primary-700)' }}>
                💪 Você está fazendo um ótimo trabalho!
              </p>
            </div>
          </div>
        </motion.div>

        {/* Debug Indicator - Remove in Production */}
        <div className="fixed bottom-2 right-2 bg-black text-white text-xs px-2 py-1 rounded opacity-50 pointer-events-none">
            v2.0 (Live)
        </div>

      </div>

      {/* Modal de Configurações do Dashboard */}
      <DashboardSettings
        userId={userId}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={(settings) => {
          console.log('Configurações salvas:', settings)
          // Aplicar configurações aqui se necessário
        }}
      />
    </div>
  )
}
