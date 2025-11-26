/**
 * Sistema de Badges Pré-definidas
 * Badges que podem ser conquistadas pelos colaboradores
 */

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  criteria: BadgeCriteria
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  category: string
}

export interface BadgeCriteria {
  type: 'count' | 'streak' | 'achievement' | 'milestone'
  metric: string
  threshold: number
  period?: 'day' | 'week' | 'month' | 'alltime'
}

export const PREDEFINED_BADGES: Badge[] = [
  {
    id: 'velocista',
    name: 'Velocista',
    description: '10 tarefas concluídas em 1 dia',
    icon: '⚡',
    criteria: {
      type: 'count',
      metric: 'tasks_completed',
      threshold: 10,
      period: 'day'
    },
    rarity: 'rare',
    category: 'produtividade'
  },
  {
    id: 'perfeccionista',
    name: 'Perfeccionista',
    description: '20 entregas sem nenhuma revisão',
    icon: '💎',
    criteria: {
      type: 'count',
      metric: 'approved_without_revision',
      threshold: 20,
      period: 'alltime'
    },
    rarity: 'epic',
    category: 'qualidade'
  },
  {
    id: 'colaborador_estrela',
    name: 'Colaborador Estrela',
    description: 'Ajudou 50 colegas',
    icon: '⭐',
    criteria: {
      type: 'count',
      metric: 'help_to_colleagues',
      threshold: 50,
      period: 'alltime'
    },
    rarity: 'epic',
    category: 'colaboração'
  },
  {
    id: 'cliente_feliz',
    name: 'Cliente Feliz',
    description: 'NPS 9+ em 10 clientes',
    icon: '😊',
    criteria: {
      type: 'achievement',
      metric: 'high_nps_count',
      threshold: 10,
      period: 'alltime'
    },
    rarity: 'rare',
    category: 'qualidade'
  },
  {
    id: 'maratonista',
    name: 'Maratonista',
    description: '30 dias consecutivos de entregas',
    icon: '🏃',
    criteria: {
      type: 'streak',
      metric: 'daily_deliveries',
      threshold: 30,
      period: 'alltime'
    },
    rarity: 'legendary',
    category: 'consistência'
  },
  {
    id: 'mentor',
    name: 'Mentor',
    description: 'Realizou 5 treinamentos',
    icon: '🎓',
    criteria: {
      type: 'count',
      metric: 'trainings_given',
      threshold: 5,
      period: 'alltime'
    },
    rarity: 'epic',
    category: 'colaboração'
  },
  {
    id: 'primeira_entrega',
    name: 'Primeira Entrega',
    description: 'Completou a primeira tarefa',
    icon: '🎯',
    criteria: {
      type: 'milestone',
      metric: 'tasks_completed',
      threshold: 1,
      period: 'alltime'
    },
    rarity: 'common',
    category: 'marcos'
  },
  {
    id: 'veterano',
    name: 'Veterano',
    description: '100 tarefas completadas',
    icon: '🏆',
    criteria: {
      type: 'count',
      metric: 'tasks_completed',
      threshold: 100,
      period: 'alltime'
    },
    rarity: 'rare',
    category: 'marcos'
  },
  {
    id: 'madrugador',
    name: 'Madrugador',
    description: '20 entregas antes das 9h',
    icon: '🌅',
    criteria: {
      type: 'count',
      metric: 'early_deliveries',
      threshold: 20,
      period: 'alltime'
    },
    rarity: 'rare',
    category: 'produtividade'
  },
  {
    id: 'equilibrio',
    name: 'Equilíbrio',
    description: 'Manteve bem-estar acima de 80 por 30 dias',
    icon: '⚖️',
    criteria: {
      type: 'streak',
      metric: 'wellbeing_score',
      threshold: 30,
      period: 'alltime'
    },
    rarity: 'epic',
    category: 'bem-estar'
  },
  {
    id: 'inovador',
    name: 'Inovador',
    description: 'Sugeriu 10 melhorias implementadas',
    icon: '💡',
    criteria: {
      type: 'count',
      metric: 'improvements_implemented',
      threshold: 10,
      period: 'alltime'
    },
    rarity: 'rare',
    category: 'inovação'
  },
  {
    id: 'comunicador',
    name: 'Comunicador',
    description: 'Respondeu 100 mensagens em menos de 2h',
    icon: '💬',
    criteria: {
      type: 'count',
      metric: 'quick_responses',
      threshold: 100,
      period: 'alltime'
    },
    rarity: 'common',
    category: 'colaboração'
  },
  {
    id: 'superestrela',
    name: 'Superestrela',
    description: 'Atingiu nível 20',
    icon: '🌟',
    criteria: {
      type: 'milestone',
      metric: 'level',
      threshold: 20,
      period: 'alltime'
    },
    rarity: 'legendary',
    category: 'marcos'
  },
  {
    id: 'dedicado',
    name: 'Dedicado',
    description: 'Trabalhou 6 meses sem faltas',
    icon: '📅',
    criteria: {
      type: 'streak',
      metric: 'attendance',
      threshold: 180,
      period: 'alltime'
    },
    rarity: 'epic',
    category: 'comprometimento'
  },
  {
    id: 'solucionador',
    name: 'Solucionador',
    description: 'Resolveu 25 problemas críticos',
    icon: '🔧',
    criteria: {
      type: 'count',
      metric: 'critical_issues_solved',
      threshold: 25,
      period: 'alltime'
    },
    rarity: 'epic',
    category: 'qualidade'
  }
]

/**
 * Verifica se um colaborador conquistou uma badge
 */
export function checkBadgeEligibility(
  badge: Badge,
  userMetrics: Record<string, number>
): boolean {
  const { criteria } = badge
  const metricValue = userMetrics[criteria.metric] || 0

  return metricValue >= criteria.threshold
}

/**
 * Retorna badges conquistadas
 */
export function getEarnedBadges(
  userMetrics: Record<string, number>
): Badge[] {
  return PREDEFINED_BADGES.filter(badge => 
    checkBadgeEligibility(badge, userMetrics)
  )
}

/**
 * Retorna próximas badges a conquistar
 */
export function getUpcomingBadges(
  userMetrics: Record<string, number>,
  limit: number = 5
): Array<Badge & { progress: number }> {
  return PREDEFINED_BADGES
    .filter(badge => !checkBadgeEligibility(badge, userMetrics))
    .map(badge => {
      const metricValue = userMetrics[badge.criteria.metric] || 0
      const progress = Math.min(100, (metricValue / badge.criteria.threshold) * 100)
      return { ...badge, progress }
    })
    .sort((a, b) => b.progress - a.progress)
    .slice(0, limit)
}

/**
 * Retorna cor baseada na raridade
 */
export function getBadgeColor(rarity: Badge['rarity']): string {
  const colors = {
    common: '#94A3B8',
    rare: '#3B82F6',
    epic: '#A855F7',
    legendary: '#F59E0B'
  }
  return colors[rarity]
}


