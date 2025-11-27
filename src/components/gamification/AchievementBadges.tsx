'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Star, Zap, Target, Award, Crown,
  Flame, Heart, Users, TrendingUp, Clock,
  CheckCircle, Lock, Sparkles
} from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementBadgesProps {
  achievements: Achievement[];
  onAchievementClick?: (achievement: Achievement) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  trophy: <Trophy className="w-6 h-6" />,
  star: <Star className="w-6 h-6" />,
  zap: <Zap className="w-6 h-6" />,
  target: <Target className="w-6 h-6" />,
  award: <Award className="w-6 h-6" />,
  crown: <Crown className="w-6 h-6" />,
  flame: <Flame className="w-6 h-6" />,
  heart: <Heart className="w-6 h-6" />,
  users: <Users className="w-6 h-6" />,
  trending: <TrendingUp className="w-6 h-6" />,
  clock: <Clock className="w-6 h-6" />,
  check: <CheckCircle className="w-6 h-6" />
};

const RARITY_COLORS: Record<string, { bg: string; border: string; glow: string }> = {
  common: { 
    bg: 'from-gray-400 to-gray-500', 
    border: '#9CA3AF',
    glow: 'rgba(156, 163, 175, 0.3)'
  },
  rare: { 
    bg: 'from-blue-400 to-blue-600', 
    border: '#3B82F6',
    glow: 'rgba(59, 130, 246, 0.3)'
  },
  epic: { 
    bg: 'from-purple-400 to-purple-600', 
    border: '#8B5CF6',
    glow: 'rgba(139, 92, 246, 0.3)'
  },
  legendary: { 
    bg: 'from-yellow-400 to-orange-500', 
    border: '#F59E0B',
    glow: 'rgba(245, 158, 11, 0.4)'
  }
};

const RARITY_LABELS: Record<string, string> = {
  common: 'Comum',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Lendário'
};

export function AchievementBadges({ achievements, onAchievementClick }: AchievementBadgesProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  const handleClick = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    onAchievementClick?.(achievement);
  };

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5" style={{ color: 'var(--warning-500)' }} />
          <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>
            Conquistas
          </h3>
        </div>
        <span 
          className="text-sm font-medium px-3 py-1 rounded-full"
          style={{ 
            backgroundColor: 'var(--warning-100)',
            color: 'var(--warning-700)'
          }}
        >
          {unlockedCount}/{achievements.length}
        </span>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
        {achievements.map((achievement, index) => {
          const rarity = RARITY_COLORS[achievement.rarity];
          const icon = ICON_MAP[achievement.icon] || <Trophy className="w-6 h-6" />;

          return (
            <motion.button
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: achievement.unlocked ? 1.1 : 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleClick(achievement)}
              className="relative aspect-square rounded-xl flex items-center justify-center transition-all"
              style={{
                backgroundColor: achievement.unlocked ? `${achievement.color}20` : 'var(--bg-secondary)',
                border: `2px solid ${achievement.unlocked ? rarity.border : 'var(--border-light)'}`,
                boxShadow: achievement.unlocked ? `0 0 20px ${rarity.glow}` : 'none',
                opacity: achievement.unlocked ? 1 : 0.5
              }}
            >
              {/* Icon */}
              <div style={{ color: achievement.unlocked ? achievement.color : 'var(--text-disabled)' }}>
                {achievement.unlocked ? icon : <Lock className="w-5 h-5" />}
              </div>

              {/* Progress indicator for locked achievements */}
              {!achievement.unlocked && achievement.progress !== undefined && achievement.maxProgress && (
                <div 
                  className="absolute bottom-1 left-1 right-1 h-1 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'var(--bg-tertiary)' }}
                >
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                      backgroundColor: achievement.color
                    }}
                  />
                </div>
              )}

              {/* Rarity indicator */}
              {achievement.unlocked && achievement.rarity !== 'common' && (
                <div 
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                  style={{ backgroundColor: rarity.border }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Achievement Detail Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAchievement(null)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-sm p-6 rounded-2xl shadow-2xl z-50"
              style={{ backgroundColor: 'var(--bg-primary)' }}
            >
              {/* Badge Display */}
              <div className="text-center mb-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                  className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center bg-gradient-to-br ${RARITY_COLORS[selectedAchievement.rarity].bg}`}
                  style={{
                    boxShadow: `0 0 30px ${RARITY_COLORS[selectedAchievement.rarity].glow}`
                  }}
                >
                  <div className="text-white">
                    {ICON_MAP[selectedAchievement.icon] || <Trophy className="w-10 h-10" />}
                  </div>
                </motion.div>
              </div>

              {/* Info */}
              <div className="text-center">
                <span 
                  className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                  style={{ 
                    backgroundColor: `${RARITY_COLORS[selectedAchievement.rarity].border}20`,
                    color: RARITY_COLORS[selectedAchievement.rarity].border
                  }}
                >
                  {RARITY_LABELS[selectedAchievement.rarity]}
                </span>
                
                <h3 
                  className="text-xl font-bold mt-3"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {selectedAchievement.name}
                </h3>
                
                <p 
                  className="text-sm mt-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {selectedAchievement.description}
                </p>

                {/* Status */}
                <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
                  {selectedAchievement.unlocked ? (
                    <div className="flex items-center justify-center gap-2 text-sm" style={{ color: 'var(--success-500)' }}>
                      <CheckCircle className="w-4 h-4" />
                      <span>Desbloqueada!</span>
                    </div>
                  ) : (
                    <div>
                      {selectedAchievement.progress !== undefined && selectedAchievement.maxProgress && (
                        <>
                          <div 
                            className="h-2 rounded-full overflow-hidden mb-2"
                            style={{ backgroundColor: 'var(--bg-secondary)' }}
                          >
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(selectedAchievement.progress / selectedAchievement.maxProgress) * 100}%` }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: selectedAchievement.color }}
                            />
                          </div>
                          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                            {selectedAchievement.progress} / {selectedAchievement.maxProgress}
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedAchievement(null)}
                className="w-full mt-4 py-2 rounded-lg font-medium transition-colors"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)'
                }}
              >
                Fechar
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Dados de exemplo
export const SAMPLE_ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    name: 'Primeiro Passo',
    description: 'Complete sua primeira tarefa',
    icon: 'check',
    color: '#10B981',
    unlocked: true,
    rarity: 'common'
  },
  {
    id: '2',
    name: 'Velocista',
    description: 'Complete 10 tarefas em um dia',
    icon: 'zap',
    color: '#3B82F6',
    unlocked: true,
    rarity: 'rare'
  },
  {
    id: '3',
    name: 'Perfeccionista',
    description: '5 aprovações na primeira tentativa',
    icon: 'star',
    color: '#8B5CF6',
    unlocked: true,
    rarity: 'epic'
  },
  {
    id: '4',
    name: 'Lenda',
    description: 'Fique em 1º lugar por 30 dias',
    icon: 'crown',
    color: '#F59E0B',
    unlocked: false,
    progress: 12,
    maxProgress: 30,
    rarity: 'legendary'
  },
  {
    id: '5',
    name: 'Colaborador',
    description: 'Ajude 20 colegas',
    icon: 'users',
    color: '#EC4899',
    unlocked: false,
    progress: 8,
    maxProgress: 20,
    rarity: 'rare'
  },
  {
    id: '6',
    name: 'Maratonista',
    description: 'Mantenha uma sequência de 30 dias',
    icon: 'flame',
    color: '#EF4444',
    unlocked: false,
    progress: 15,
    maxProgress: 30,
    rarity: 'epic'
  },
  {
    id: '7',
    name: 'Pontual',
    description: '50 entregas no prazo',
    icon: 'clock',
    color: '#06B6D4',
    unlocked: true,
    rarity: 'common'
  },
  {
    id: '8',
    name: 'Top Performer',
    description: 'Alcance o top 3 do ranking',
    icon: 'trophy',
    color: '#F59E0B',
    unlocked: false,
    rarity: 'rare'
  }
];

