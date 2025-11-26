'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  Trophy, Award, Star, Flame, Crown, Medal, Target, 
  TrendingUp, Zap, Users, ChevronRight, Lock, CheckCircle,
  BarChart3, Calendar, Gift
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface GamificationData {
  totalPoints: number
  level: number
  currentStreak: number
  longestStreak: number
  productivityScore: number
  qualityScore: number
  collaborationScore: number
  badges: any[]
  achievements: any[]
  ranking: number
  totalEmployees: number
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  points: number
  unlocked: boolean
  progress: number
  totalRequired: number
  unlockedAt?: Date
}

export default function GamificacaoPage() {
  const [data, setData] = useState<GamificationData | null>(null)
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([])
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [selectedTab, setSelectedTab] = useState<'overview' | 'achievements' | 'ranking'>('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGamificationData()
  }, [])

  const loadGamificationData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!employee) return

      // Gamification scores
      const { data: gamification } = await supabase
        .from('employee_gamification_scores')
        .select('*')
        .eq('employee_id', employee.id)
        .single()

      // Ranking
      const { data: ranking } = await supabase
        .from('employee_gamification_scores')
        .select('employee_id, total_points, level')
        .order('total_points', { ascending: false })

      const myPosition = ranking?.findIndex(r => r.employee_id === employee.id) + 1 || 0

      // Leaderboard (top 10)
      const { data: leaderboardData } = await supabase
        .from('employee_gamification_scores')
        .select(`
          total_points,
          level,
          employees!inner(
            user_profiles!inner(full_name)
          )
        `)
        .order('total_points', { ascending: false })
        .limit(10)

      setData({
        totalPoints: gamification?.total_points || 0,
        level: gamification?.level || 1,
        currentStreak: gamification?.current_streak || 0,
        longestStreak: gamification?.longest_streak || 0,
        productivityScore: gamification?.productivity_score || 0,
        qualityScore: gamification?.quality_score || 0,
        collaborationScore: gamification?.collaboration_score || 0,
        badges: gamification?.badges || [],
        achievements: gamification?.achievements || [],
        ranking: myPosition,
        totalEmployees: ranking?.length || 1
      })

      setLeaderboard(leaderboardData || [])

      // Mock de conquistas (na produção viria do banco)
      setAllAchievements([
        { id: '1', name: 'Primeiro Projeto', description: 'Complete seu primeiro projeto', icon: '🎯', points: 5, unlocked: true, progress: 1, totalRequired: 1, unlockedAt: new Date() },
        { id: '2', name: 'Sequência de 7 Dias', description: 'Mantenha uma sequência de 7 dias ativos', icon: '🔥', points: 20, unlocked: true, progress: 7, totalRequired: 7, unlockedAt: new Date() },
        { id: '3', name: '10 Tarefas em um Dia', description: 'Complete 10 tarefas em um único dia', icon: '⚡', points: 15, unlocked: false, progress: 7, totalRequired: 10 },
        { id: '4', name: '100% de Qualidade', description: 'Alcance 100 de score de qualidade', icon: '💯', points: 30, unlocked: false, progress: gamification?.quality_score || 0, totalRequired: 100 },
        { id: '5', name: 'Colaborador do Mês', description: 'Seja o colaborador mais pontuado do mês', icon: '👑', points: 50, unlocked: false, progress: 0, totalRequired: 1 },
        { id: '6', name: 'Inovador', description: 'Tenha uma ideia implementada', icon: '💡', points: 40, unlocked: false, progress: 0, totalRequired: 1 },
        { id: '7', name: 'Mentor', description: 'Ajude 5 colegas em suas tarefas', icon: '🎓', points: 35, unlocked: false, progress: 2, totalRequired: 5 },
        { id: '8', name: 'Velocista', description: 'Complete 50 tarefas em uma semana', icon: '🏃', points: 25, unlocked: false, progress: 23, totalRequired: 50 },
        { id: '9', name: 'Perfeccionista', description: 'Tenha 20 tarefas aprovadas sem revisão', icon: '✨', points: 30, unlocked: false, progress: 8, totalRequired: 20 },
        { id: '10', name: 'Maratonista', description: 'Sequência de 30 dias ativos', icon: '🎖️', points: 100, unlocked: false, progress: gamification?.current_streak || 0, totalRequired: 30 },
      ])

    } catch (error) {
      console.error('Erro ao carregar gamificação:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4370d1] mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando gamificação...</p>
        </div>
      </div>
    )
  }

  const pointsToNextLevel = (data?.level || 1) * 100
  const progressToNextLevel = ((data?.totalPoints || 0) % 100)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header com Nível e Pontos */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl p-8 text-white relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Crown className="w-10 h-10" />
                  <h1 className="text-4xl font-bold">Nível {data?.level}</h1>
                </div>
                <p className="text-white/90 text-lg">Você está no top {Math.round((data?.ranking / data?.totalEmployees) * 100)}% da equipe!</p>
              </div>
              
              <div className="text-right">
                <p className="text-white/80 text-sm mb-1">Total de Pontos</p>
                <p className="text-5xl font-bold">{data?.totalPoints}</p>
                <p className="text-white/80 text-sm mt-1">#{data?.ranking} no ranking</p>
              </div>
            </div>

            {/* Progress para próximo nível */}
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Progresso para Nível {(data?.level || 1) + 1}</span>
                <span>{progressToNextLevel} / {pointsToNextLevel} pts</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-4 backdrop-blur-sm">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(progressToNextLevel / pointsToNextLevel) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-white h-4 rounded-full flex items-center justify-end px-2"
                >
                  <Zap className="w-3 h-3 text-yellow-500" />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`px-6 py-3 font-medium transition-all ${
              selectedTab === 'overview'
                ? 'border-b-2 border-[#4370d1] text-[#4370d1]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setSelectedTab('achievements')}
            className={`px-6 py-3 font-medium transition-all ${
              selectedTab === 'achievements'
                ? 'border-b-2 border-[#4370d1] text-[#4370d1]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Conquistas
          </button>
          <button
            onClick={() => setSelectedTab('ranking')}
            className={`px-6 py-3 font-medium transition-all ${
              selectedTab === 'ranking'
                ? 'border-b-2 border-[#4370d1] text-[#4370d1]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Ranking
          </button>
        </div>

        {/* Content baseado na tab selecionada */}
        <AnimatePresence mode="wait">
          {selectedTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Cards de Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Flame className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm text-gray-600">Sequência Atual</h3>
                      <p className="text-2xl font-bold text-gray-900">{data?.currentStreak} dias</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Seu recorde: <span className="font-semibold text-gray-700">{data?.longestStreak} dias</span>
                  </p>
                  {data?.currentStreak === data?.longestStreak && data?.currentStreak > 0 && (
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Você está no seu melhor!
                    </p>
                  )}
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Award className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-sm text-gray-600">Badges</h3>
                      <p className="text-2xl font-bold text-gray-900">{data?.badges?.length || 0}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Conquistas desbloqueadas: <span className="font-semibold text-gray-700">{allAchievements.filter(a => a.unlocked).length}</span>
                  </p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <Trophy className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-sm text-gray-600">Posição</h3>
                      <p className="text-2xl font-bold text-gray-900">#{data?.ranking}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    De {data?.totalEmployees} colaboradores
                  </p>
                </div>
              </div>

              {/* Scores Detalhados */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-[#4370d1]" />
                  Seus Scores
                </h2>

                <div className="space-y-6">
                  {/* Produtividade */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-gray-700">Produtividade</span>
                      </div>
                      <span className="text-xl font-bold text-gray-900">{data?.productivityScore}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${data?.productivityScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Qualidade */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-gray-700">Qualidade</span>
                      </div>
                      <span className="text-xl font-bold text-gray-900">{data?.qualityScore}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${data?.qualityScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Colaboração */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-600" />
                        <span className="font-medium text-gray-700">Colaboração</span>
                      </div>
                      <span className="text-xl font-bold text-gray-900">{data?.collaborationScore}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${data?.collaborationScore}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Últimas Conquistas */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Medal className="w-6 h-6 text-[#4370d1]" />
                  Conquistas Recentes
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {allAchievements.filter(a => a.unlocked).slice(0, 4).map((achievement) => (
                    <div key={achievement.id} className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            {achievement.name}
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                          <p className="text-xs text-yellow-700 font-medium mt-2">+{achievement.points} pontos</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {selectedTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Todas as Conquistas</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allAchievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`p-5 rounded-xl border-2 transition-all ${
                      achievement.unlocked
                        ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200'
                        : 'bg-gray-50 border-gray-200 opacity-75'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`text-5xl ${!achievement.unlocked && 'grayscale'}`}>
                        {achievement.icon}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-gray-900">{achievement.name}</h3>
                          {achievement.unlocked ? (
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <Lock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                        
                        {!achievement.unlocked && (
                          <>
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span>Progresso</span>
                              <span className="font-medium">{achievement.progress} / {achievement.totalRequired}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${(achievement.progress / achievement.totalRequired) * 100}%` }}
                              />
                            </div>
                          </>
                        )}
                        
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-semibold">
                            {achievement.points} pontos
                          </span>
                          
                          {achievement.unlocked && achievement.unlockedAt && (
                            <span className="text-xs text-gray-500">
                              Desbloqueado em {new Date(achievement.unlockedAt).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {selectedTab === 'ranking' && (
            <motion.div
              key="ranking"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Trophy className="w-7 h-7 text-yellow-600" />
                Ranking Geral
              </h2>
              
              <div className="space-y-3">
                {leaderboard.map((entry, index) => {
                  const position = index + 1
                  const isCurrentUser = position === data?.ranking
                  
                  return (
                    <motion.div 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-xl border-2 flex items-center gap-4 ${
                        isCurrentUser 
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-[#4370d1]' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      {/* Posição */}
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        position === 1 ? 'bg-yellow-400 text-yellow-900' :
                        position === 2 ? 'bg-gray-300 text-gray-700' :
                        position === 3 ? 'bg-orange-400 text-orange-900' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {position === 1 && <Crown className="w-6 h-6" />}
                        {position === 2 && <Medal className="w-6 h-6" />}
                        {position === 3 && <Award className="w-6 h-6" />}
                        {position > 3 && `#${position}`}
                      </div>

                      {/* Info do usuário */}
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                          {entry.employees?.user_profiles?.full_name || 'Colaborador'}
                          {isCurrentUser && (
                            <span className="text-xs bg-[#4370d1] text-white px-2 py-0.5 rounded-full">
                              Você
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600">Nível {entry.level}</p>
                      </div>

                      {/* Pontos */}
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">{entry.total_points}</p>
                        <p className="text-xs text-gray-600">pontos</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {data?.ranking > 10 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <p className="text-center text-gray-700">
                    Você está na posição <span className="font-bold text-[#4370d1]">#{data.ranking}</span>. 
                    Continue assim para entrar no Top 10! 🚀
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}











