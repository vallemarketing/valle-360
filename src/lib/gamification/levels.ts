/**
 * Sistema de Níveis e Progressão
 */

export interface LevelInfo {
  level: number
  tier: string
  pointsRequired: number
  pointsForNext: number
  rewards: string[]
  color: string
}

export const LEVEL_TIERS = {
  INICIANTE: {
    name: 'Iniciante',
    range: [1, 5],
    color: '#64748B',
    description: 'Começando a jornada'
  },
  INTERMEDIARIO: {
    name: 'Intermediário',
    range: [6, 10],
    color: '#3B82F6',
    description: 'Ganhando experiência'
  },
  AVANCADO: {
    name: 'Avançado',
    range: [11, 15],
    color: '#8B5CF6',
    description: 'Dominando as habilidades'
  },
  EXPERT: {
    name: 'Expert',
    range: [16, 20],
    color: '#EC4899',
    description: 'Referência na área'
  },
  MASTER: {
    name: 'Master',
    range: [21, Infinity],
    color: '#F59E0B',
    description: 'Lenda viva'
  }
}

/**
 * Calcula pontos necessários para um nível específico
 */
export function getPointsForLevel(level: number): number {
  if (level <= 0) return 0
  if (level <= 5) return (level - 1) * 200
  if (level <= 10) return 1000 + ((level - 6) * 400)
  if (level <= 15) return 3000 + ((level - 11) * 600)
  if (level <= 20) return 6000 + ((level - 16) * 1000)
  return 10000 + ((level - 21) * 1000)
}

/**
 * Calcula nível baseado em pontos
 */
export function getLevelFromPoints(points: number): number {
  if (points >= 10000) return 21 + Math.floor((points - 10000) / 1000)
  if (points >= 6000) return 16 + Math.floor((points - 6000) / 1000)
  if (points >= 3000) return 11 + Math.floor((points - 3000) / 600)
  if (points >= 1000) return 6 + Math.floor((points - 1000) / 400)
  return Math.floor(points / 200) + 1
}

/**
 * Retorna tier do nível
 */
export function getTierForLevel(level: number): typeof LEVEL_TIERS[keyof typeof LEVEL_TIERS] {
  if (level >= 21) return LEVEL_TIERS.MASTER
  if (level >= 16) return LEVEL_TIERS.EXPERT
  if (level >= 11) return LEVEL_TIERS.AVANCADO
  if (level >= 6) return LEVEL_TIERS.INTERMEDIARIO
  return LEVEL_TIERS.INICIANTE
}

/**
 * Retorna informações completas do nível
 */
export function getLevelInfo(points: number): LevelInfo {
  const level = getLevelFromPoints(points)
  const tier = getTierForLevel(level)
  const pointsRequired = getPointsForLevel(level)
  const pointsForNext = getPointsForLevel(level + 1)
  const rewards = getRewardsForLevel(level)

  return {
    level,
    tier: tier.name,
    pointsRequired,
    pointsForNext,
    rewards,
    color: tier.color
  }
}

/**
 * Calcula progresso para próximo nível (0-100)
 */
export function getProgressToNextLevel(points: number): number {
  const currentLevel = getLevelFromPoints(points)
  const currentLevelPoints = getPointsForLevel(currentLevel)
  const nextLevelPoints = getPointsForLevel(currentLevel + 1)
  
  const pointsIntoLevel = points - currentLevelPoints
  const pointsNeeded = nextLevelPoints - currentLevelPoints
  
  return Math.min(100, Math.max(0, (pointsIntoLevel / pointsNeeded) * 100))
}

/**
 * Retorna recompensas por nível
 */
export function getRewardsForLevel(level: number): string[] {
  const rewards: string[] = []

  // Recompensas por marcos
  if (level >= 5) rewards.push('Badge "Novato Completo"')
  if (level >= 10) rewards.push('Acesso a Features Premium')
  if (level >= 15) rewards.push('Badge "Profissional"')
  if (level >= 20) rewards.push('Certificado de Expert')
  if (level >= 25) rewards.push('Badge "Master"')

  // Recompensas específicas
  if (level === 1) rewards.push('Bem-vindo ao Valle 360!')
  if (level === 5) rewards.push('Desbloqueou Dashboard Avançado')
  if (level === 10) rewards.push('Acesso a Relatórios Especiais')
  if (level === 15) rewards.push('Mentor de Novos Colaboradores')
  if (level === 20) rewards.push('Participação em Decisões Estratégicas')

  return rewards
}

/**
 * Calcula pontos de bônus por conquista
 */
export function calculateBonusPoints(achievement: string): number {
  const bonuses: Record<string, number> = {
    'first_task': 50,
    'perfect_week': 100,
    'help_colleague': 25,
    'positive_feedback': 75,
    'innovation': 150,
    'attendance_month': 100,
    'training_completed': 200
  }

  return bonuses[achievement] || 0
}

/**
 * Verifica se houve mudança de tier
 */
export function didTierChange(oldPoints: number, newPoints: number): boolean {
  const oldTier = getTierForLevel(getLevelFromPoints(oldPoints))
  const newTier = getTierForLevel(getLevelFromPoints(newPoints))
  return oldTier.name !== newTier.name
}


