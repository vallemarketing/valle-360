'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { NotificationBanner } from '@/components/notifications/NotificationBanner'
import { DashboardTrafego } from '@/components/dashboards/DashboardTrafego'
import DashboardSocial from '@/components/dashboards/DashboardSocial'
import { DashboardComercial } from '@/components/dashboards/DashboardComercial'
import { DashboardGenerico } from '@/components/dashboards/DashboardGenerico'
import DashboardDesigner from '@/components/dashboards/DashboardDesigner'
import DashboardWebDesigner from '@/components/dashboards/DashboardWebDesigner'
import DashboardHeadMarketing from '@/components/dashboards/DashboardHeadMarketing'
import DashboardRH from '@/components/dashboards/DashboardRH'
import DashboardFinanceiro from '@/components/dashboards/DashboardFinanceiro'
import DashboardVideomaker from '@/components/dashboards/DashboardVideomaker'
import { IcebreakerCard } from '@/components/val/IcebreakerCard'
import { GamificationWidget } from '@/components/gamification/GamificationWidget'
import { CustomizableDashboard } from '@/components/dashboard/CustomizableDashboard'

gsap.registerPlugin(ScrollTrigger)

export default function ColaboradorDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [userArea, setUserArea] = useState('')
  const [userId, setUserId] = useState('')
  const [notifications, setNotifications] = useState<any[]>([])
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [viewMode, setViewMode] = useState<'specific' | 'customizable'>('specific')

  // Refs para animações GSAP
  const headerRef = useRef<HTMLDivElement>(null)
  const icebreakerRef = useRef<HTMLDivElement>(null)
  const gamificationRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)
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

      const area = employee?.employee_areas_of_expertise?.[0]?.area_name || 'Marketing'
      const firstName = profile?.full_name?.split(' ')[0] || 'Colaborador'

      console.log('🎯 ÁREA DETECTADA:', area)
      console.log('👤 NOME:', firstName)

      setUserName(firstName)
      setUserArea(area)

      // Carregar notificações e dados específicos
      const notifs = loadNotifications(area)
      const data = loadDashboardData(area)

      setNotifications(notifs)
      setDashboardData(data)

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

  const loadDashboardData = (area: string) => {
    if (['Tráfego Pago', 'Tráfego', 'Gestor de Tráfego'].includes(area)) {
      return {
        campaigns: [
          {
            id: '1',
            clientName: 'Tech Solutions',
            platform: 'Google Ads',
            budget: 5000,
            spent: 4800,
            roas: 4.2,
            status: 'low_budget' as const
          },
          {
            id: '2',
            clientName: 'E-commerce Plus',
            platform: 'Facebook Ads',
            budget: 3000,
            spent: 3000,
            roas: 2.8,
            status: 'needs_refill' as const
          },
          {
            id: '3',
            clientName: 'Marketing Pro',
            platform: 'Instagram Ads',
            budget: 4000,
            spent: 2100,
            roas: 5.1,
            status: 'active' as const
          }
        ]
      }
    }

    if (['Social Media', 'Social'].includes(area)) {
      return {
        posts: [
          {
            id: '1',
            clientName: 'Tech Solutions',
            network: 'Instagram',
            scheduledFor: new Date(Date.now() + 1 * 60 * 60 * 1000),
            status: 'pending_approval' as const
          },
          {
            id: '2',
            clientName: 'Marketing Pro',
            network: 'LinkedIn',
            scheduledFor: new Date(Date.now() + 3 * 60 * 60 * 1000),
            status: 'approved' as const
          },
          {
            id: '3',
            clientName: 'E-commerce Plus',
            network: 'Facebook',
            scheduledFor: new Date(Date.now() + 5 * 60 * 60 * 1000),
            status: 'pending_approval' as const,
            engagement: 4.5
          }
        ]
      }
    }

    if (area === 'Comercial') {
      return {
        leads: [
          {
            id: '1',
            name: 'João Silva',
            company: 'Startup Tech',
            phase: 'proposta',
            value: 8500,
            missingServices: []
          },
          {
            id: '2',
            name: 'Maria Santos',
            company: 'E-commerce Plus',
            phase: 'negociacao',
            value: 15000,
            missingServices: ['Tráfego Pago', 'Automação']
          },
          {
            id: '3',
            name: 'Pedro Costa',
            company: 'Consultoria XYZ',
            phase: 'qualificacao',
            value: 12000,
            missingServices: ['Social Media']
          }
        ],
        monthGoal: 50000
      }
    }

    // Dados genéricos para outras áreas
    return {
      areaName: area,
      stats: [
        {
          label: 'Tarefas Ativas',
          value: 12,
          icon: 'chart',
          color: 'var(--primary-500)'
        },
        {
          label: 'Concluídas Este Mês',
          value: 45,
          icon: 'chart',
          color: 'var(--success-500)'
        },
        {
          label: 'Clientes Ativos',
          value: 8,
          icon: 'users',
          color: 'var(--info-500)'
        },
        {
          label: 'Performance',
          value: '92%',
          icon: 'chart',
          color: 'var(--warning-500)'
        }
      ],
      tasks: [
        {
          id: '1',
          title: 'Revisar projeto do Cliente X',
          status: 'in_progress' as const,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        },
        {
          id: '2',
          title: 'Entregar arte final',
          status: 'pending' as const,
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
        },
        {
          id: '3',
          title: 'Reunião com Cliente Y',
          status: 'completed' as const
        }
      ]
    }
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
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Dashboard - {userArea}
            </p>
          </div>
          
          {/* Botão Toggle de Visualização */}
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

          {/* Dashboard Específico da Área */}
          {viewMode === 'specific' && (
            <>
              {['Tráfego Pago', 'Trafego Pago', 'Tráfego', 'Gestor de Tráfego'].includes(userArea) && dashboardData?.campaigns && (
                <DashboardTrafego campaigns={dashboardData.campaigns} />
              )}

              {['Social Media', 'Social'].includes(userArea) && dashboardData?.posts && (
                <DashboardSocial posts={dashboardData.posts} />
              )}

              {['Comercial', 'Vendas'].includes(userArea) && dashboardData?.leads && (
                <DashboardComercial 
                  leads={dashboardData.leads} 
                  monthGoal={dashboardData.monthGoal} 
                />
              )}

              {/* Novos Dashboards Específicos */}
              {['Designer', 'Design Gráfico', 'Designer Gráfico', 'Design'].includes(userArea) && (
                <DashboardDesigner />
              )}

              {['Web Designer', 'Webdesigner', 'Web Designer Gráfico', 'Web Design'].includes(userArea) && (
                <DashboardWebDesigner />
              )}

              {['Head de Marketing', 'Head Marketing', 'Head de Mkt', 'Head Mkt', 'Marketing'].includes(userArea) && (
                <DashboardHeadMarketing />
              )}

              {['RH', 'Recursos Humanos', 'HR'].includes(userArea) && (
                <DashboardRH />
              )}

              {['Financeiro', 'Finanças', 'Finance'].includes(userArea) && (
                <DashboardFinanceiro />
              )}

              {['Videomaker', 'Video Maker', 'Editor de Vídeo', 'Vídeo', 'Audiovisual'].includes(userArea) && (
                <DashboardVideomaker />
              )}

              {/* Dashboard Genérico para outras áreas */}
              {!['Tráfego Pago', 'Trafego Pago', 'Tráfego', 'Gestor de Tráfego', 
                 'Social Media', 'Social', 
                 'Comercial', 'Vendas', 
                 'Designer', 'Design Gráfico', 'Designer Gráfico', 'Design', 
                 'Web Designer', 'Webdesigner', 'Web Design', 
                 'Head de Marketing', 'Head Marketing', 'Head de Mkt', 'Head Mkt', 'Marketing', 
                 'RH', 'Recursos Humanos', 'HR', 
                 'Financeiro', 'Finanças', 'Finance', 
                 'Videomaker', 'Video Maker', 'Editor de Vídeo', 'Vídeo', 'Audiovisual'].includes(userArea) && dashboardData && (
                <DashboardGenerico data={dashboardData} />
              )}
            </>
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

      </div>
    </div>
  )
}
