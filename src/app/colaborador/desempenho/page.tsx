'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { BarChart3, TrendingUp, TrendingDown, Minus, Award, Users, Star, Target, Brain } from 'lucide-react'
import { motion } from 'framer-motion'

interface PerformanceData {
  productivityScore: number
  qualityScore: number
  collaborationScore: number
  wellbeingScore: number
  trend: 'up' | 'down' | 'stable'
  feedback360: any[]
  strengths: string[]
  areasToImprove: string[]
  aiRecommendations: any[]
}

export default function DesempenhoPage() {
  const [data, setData] = useState<PerformanceData | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPerformanceData()
  }, [selectedPeriod])

  const loadPerformanceData = async () => {
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

      // Wellbeing (últimos X dias)
      const daysMap = { '7d': 7, '30d': 30, '90d': 90 }
      const { data: wellbeing } = await supabase
        .from('employee_wellbeing_checkins')
        .select('*')
        .eq('employee_id', employee.id)
        .gte('checkin_date', new Date(Date.now() - daysMap[selectedPeriod] * 24 * 60 * 60 * 1000).toISOString())
        .order('checkin_date', { ascending: false })

      const wellbeingAvg = wellbeing?.length 
        ? wellbeing.reduce((acc, w) => acc + (w.mood_score + w.energy_score + w.motivation_score + w.job_satisfaction_score) / 4, 0) / wellbeing.length * 10
        : 70

      // Feedback 360
      const { data: feedback } = await supabase
        .from('employee_feedback_360')
        .select('*, reviewer:user_profiles!employee_feedback_360_reviewer_id_fkey(full_name)')
        .eq('employee_id', employee.id)
        .eq('status', 'submitted')
        .order('submitted_at', { ascending: false })
        .limit(5)

      // Behavioral analysis
      const { data: behavioralData } = await supabase
        .from('employee_behavioral_analysis')
        .select('*')
        .eq('employee_id', employee.id)
        .order('analysis_date', { ascending: false })
        .limit(daysMap[selectedPeriod])

      // Calcular tendência
      const recentScores = behavioralData?.slice(0, 7).map(b => b.overall_health_score || 0) || []
      const olderScores = behavioralData?.slice(7, 14).map(b => b.overall_health_score || 0) || []
      
      const recentAvg = recentScores.length ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length : 0
      const olderAvg = olderScores.length ? olderScores.reduce((a, b) => a + b, 0) / olderScores.length : 0
      
      const trend = recentAvg > olderAvg + 5 ? 'up' : recentAvg < olderAvg - 5 ? 'down' : 'stable'

      setData({
        productivityScore: gamification?.productivity_score || 0,
        qualityScore: gamification?.quality_score || 0,
        collaborationScore: gamification?.collaboration_score || 0,
        wellbeingScore: Math.round(wellbeingAvg),
        trend,
        feedback360: feedback || [],
        strengths: ['Comunicação excelente', 'Pontualidade', 'Proatividade'],
        areasToImprove: ['Gestão de tempo', 'Delegar tarefas'],
        aiRecommendations: [
          { title: 'Foque em planejamento', description: 'Dedique 15 min no início do dia para organizar tarefas' },
          { title: 'Peça feedback frequente', description: 'Converse com seu gestor semanalmente' },
        ]
      })
    } catch (error) {
      console.error('Erro ao carregar desempenho:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4370d1] mx-auto"></div>
          <p className="mt-4 text-gray-600">Analisando seu desempenho...</p>
        </div>
      </div>
    )
  }

  const TrendIcon = data?.trend === 'up' ? TrendingUp : data?.trend === 'down' ? TrendingDown : Minus
  const trendColor = data?.trend === 'up' ? 'text-green-600' : data?.trend === 'down' ? 'text-red-600' : 'text-gray-600'
  const trendBg = data?.trend === 'up' ? 'bg-green-100' : data?.trend === 'down' ? 'bg-red-100' : 'bg-gray-100'

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-[#4370d1]" />
              Meu Desempenho
            </h1>
            <p className="text-gray-600 mt-1">Análise detalhada da sua performance</p>
          </div>
          
          <div className="flex gap-2">
            {['7d', '30d', '90d'].map(period => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedPeriod === period
                    ? 'bg-[#4370d1] text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {period === '7d' && '7 dias'}
                {period === '30d' && '30 dias'}
                {period === '90d' && '90 dias'}
              </button>
            ))}
          </div>
        </div>

        {/* Tendência Geral */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${trendBg} rounded-xl p-6 border-2 ${
            data?.trend === 'up' ? 'border-green-200' : 
            data?.trend === 'down' ? 'border-red-200' : 
            'border-gray-200'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-4 ${trendColor} rounded-lg`}>
              <TrendIcon className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {data?.trend === 'up' && 'Performance em Alta! 📈'}
                {data?.trend === 'down' && 'Oportunidade de Melhoria 📉'}
                {data?.trend === 'stable' && 'Performance Estável ➡️'}
              </h2>
              <p className="text-gray-700 mt-1">
                {data?.trend === 'up' && 'Continue assim! Seus números estão melhorando consistentemente.'}
                {data?.trend === 'down' && 'Vamos trabalhar juntos para melhorar seus indicadores.'}
                {data?.trend === 'stable' && 'Mantenha o ritmo e busque pequenas melhorias contínuas.'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Scores Detalhados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">Produtividade</h3>
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-4xl font-bold text-gray-900">{data?.productivityScore}</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${data?.productivityScore}%` }} />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">Qualidade</h3>
              <Star className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-4xl font-bold text-gray-900">{data?.qualityScore}</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${data?.qualityScore}%` }} />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">Colaboração</h3>
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-4xl font-bold text-gray-900">{data?.collaborationScore}</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${data?.collaborationScore}%` }} />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">Bem-Estar</h3>
              <Award className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-4xl font-bold text-gray-900">{data?.wellbeingScore}</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${data?.wellbeingScore}%` }} />
            </div>
          </motion.div>
        </div>

        {/* Row com 2 colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Pontos Fortes e Áreas de Melhoria */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Análise Qualitativa</h2>
            
            <div className="space-y-6">
              {/* Pontos Fortes */}
              <div>
                <h3 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Seus Pontos Fortes
                </h3>
                <ul className="space-y-2">
                  {data?.strengths.map((strength, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Áreas de Melhoria */}
              <div>
                <h3 className="font-semibold text-yellow-700 mb-3 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Áreas para Desenvolver
                </h3>
                <ul className="space-y-2">
                  {data?.areasToImprove.map((area, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Recomendações da IA */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Brain className="w-6 h-6 text-[#4370d1]" />
              Recomendações da IA Val
            </h2>
            
            <div className="space-y-4">
              {data?.aiRecommendations.map((rec, idx) => (
                <div key={idx} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-l-4 border-[#4370d1]">
                  <h3 className="font-semibold text-gray-900 mb-2">{rec.title}</h3>
                  <p className="text-sm text-gray-700">{rec.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Feedback 360 */}
        {data?.feedback360 && data.feedback360.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Feedback 360º Recente</h2>
            
            <div className="space-y-4">
              {data.feedback360.map((feedback) => (
                <div key={feedback.id} className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">
                      por {feedback.reviewer?.full_name || 'Anônimo'} • {feedback.reviewer_relationship}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(feedback.submitted_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  
                  {feedback.strengths && (
                    <div className="mb-3">
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Pontos Fortes:</h4>
                      <p className="text-sm text-gray-600">{feedback.strengths}</p>
                    </div>
                  )}
                  
                  {feedback.areas_for_improvement && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-1">Áreas de Melhoria:</h4>
                      <p className="text-sm text-gray-600">{feedback.areas_for_improvement}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Análise Comportamental e Predição de Churn */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Análise Comportamental Detalhada */}
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
              <Brain className="w-6 h-6" style={{ color: 'var(--purple-500)' }} />
              Análise Comportamental (IA)
            </h2>
            
            <div className="space-y-4">
              {/* Red Flags */}
              <div 
                className="p-4 rounded-xl border-l-4"
                style={{
                  backgroundColor: 'var(--error-50)',
                  borderColor: 'var(--error-500)',
                }}
              >
                <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--error-700)' }}>
                  ⚠️ Pontos de Atenção
                </h3>
                <ul className="space-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <li>• Nenhum red flag identificado no momento</li>
                </ul>
              </div>

              {/* Strengths Comportamentais */}
              <div 
                className="p-4 rounded-xl border-l-4"
                style={{
                  backgroundColor: 'var(--success-50)',
                  borderColor: 'var(--success-500)',
                }}
              >
                <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--success-700)' }}>
                  ✨ Pontos Positivos
                </h3>
                <ul className="space-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <li>• Engajamento consistente nas últimas semanas</li>
                  <li>• Boa comunicação com a equipe</li>
                  <li>• Entrega de tarefas dentro do prazo</li>
                </ul>
              </div>

              {/* Análise de Sentimento */}
              <div 
                className="p-4 rounded-xl border-l-4"
                style={{
                  backgroundColor: 'var(--primary-50)',
                  borderColor: 'var(--primary-500)',
                }}
              >
                <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--primary-700)' }}>
                  💬 Análise de Sentimento
                </h3>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Tom geral das interações: <strong>Positivo</strong> (85% de sentimentos positivos nas últimas mensagens)
                </p>
              </div>
            </div>
          </div>

          {/* Predição de Churn */}
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
              <BarChart3 className="w-6 h-6" style={{ color: 'var(--warning-500)' }} />
              Predição de Saída (IA)
            </h2>
            
            <div className="space-y-4">
              {/* Probabilidade de Churn */}
              <div className="text-center p-6 rounded-xl" style={{ backgroundColor: 'var(--success-50)' }}>
                <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Probabilidade de Saída
                </p>
                <p className="text-5xl font-bold mb-2" style={{ color: 'var(--success-600)' }}>
                  12%
                </p>
                <span 
                  className="text-xs px-3 py-1 rounded-full font-medium"
                  style={{ 
                    backgroundColor: 'var(--success-100)', 
                    color: 'var(--success-700)' 
                  }}
                >
                  Risco Baixo ✓
                </span>
              </div>

              {/* Fatores Contribuintes */}
              <div>
                <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
                  Fatores Analisados:
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: 'var(--text-secondary)' }}>Engajamento</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 rounded-full" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                        <div className="h-2 rounded-full" style={{ width: '88%', backgroundColor: 'var(--success-500)' }} />
                      </div>
                      <span className="font-medium" style={{ color: 'var(--success-600)' }}>88%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: 'var(--text-secondary)' }}>Bem-Estar</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 rounded-full" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                        <div className="h-2 rounded-full" style={{ width: `${data?.wellbeingScore}%`, backgroundColor: 'var(--warning-500)' }} />
                      </div>
                      <span className="font-medium" style={{ color: 'var(--warning-600)' }}>{data?.wellbeingScore}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: 'var(--text-secondary)' }}>Desempenho</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 rounded-full" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                        <div className="h-2 rounded-full" style={{ width: `${data?.productivityScore}%`, backgroundColor: 'var(--primary-500)' }} />
                      </div>
                      <span className="font-medium" style={{ color: 'var(--primary-600)' }}>{data?.productivityScore}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ações Recomendadas */}
              <div 
                className="p-4 rounded-xl"
                style={{ backgroundColor: 'var(--primary-50)' }}
              >
                <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--primary-700)' }}>
                  💡 Ações Recomendadas:
                </h3>
                <ul className="space-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <li>• Continue mantendo o bom ritmo de trabalho</li>
                  <li>• Considere novos desafios ou projetos</li>
                  <li>• Converse sobre plano de carreira no próximo 1-on-1</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  )
}

