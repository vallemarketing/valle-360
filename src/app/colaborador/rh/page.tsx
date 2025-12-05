'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, UserPlus, Award, Calendar, Clock, CheckCircle2,
  AlertTriangle, Plus, Search, X, Upload, FileText,
  Brain, RefreshCw, Target, TrendingUp, Star, Heart,
  ChevronRight, Filter, Settings, Mail, Phone, MapPin,
  Briefcase, GraduationCap, Coffee, Smile, Frown, Meh,
  Sparkles, BarChart3, PieChart, Activity, Layers, Building2, ArrowRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, differenceInDays, differenceInMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import AICollectorCard from '@/components/ai/AICollectorCard'
import SmartInsightsPanel from '@/components/ai/SmartInsightsPanel'
import GoalsTracker from '@/components/goals/GoalsTracker'
import Link from 'next/link'

// ==================== TIPOS ====================
interface Employee {
  id: string
  name: string
  email: string
  role: string
  area: string
  startDate: Date
  avatar?: string
  status: 'active' | 'vacation' | 'sick_leave' | 'inactive'
  performance: number
  satisfaction: number
  lastEvaluation?: Date
  nextVacation?: Date
  alerts: string[]
}

interface Candidate {
  id: string
  name: string
  email: string
  phone: string
  position: string
  status: 'new' | 'screening' | 'interview' | 'test' | 'offer' | 'hired' | 'rejected'
  aiScore: number
  appliedAt: Date
  source: string
  skills: string[]
  experience: number
  notes?: string
}

interface OnboardingTask {
  id: string
  employeeId: string
  employeeName: string
  task: string
  category: 'documents' | 'access' | 'training' | 'equipment' | 'introduction'
  status: 'pending' | 'in_progress' | 'completed'
  dueDate: Date
}

interface VacationRequest {
  id: string
  employeeId: string
  employeeName: string
  startDate: Date
  endDate: Date
  status: 'pending' | 'approved' | 'rejected'
  type: 'vacation' | 'sick_leave' | 'personal'
}

// ==================== CONSTANTES ====================
const CANDIDATE_STATUS_CONFIG = {
  new: { label: 'Novo', color: 'bg-blue-100 text-blue-700', step: 1 },
  screening: { label: 'Triagem', color: 'bg-purple-100 text-purple-700', step: 2 },
  interview: { label: 'Entrevista', color: 'bg-yellow-100 text-yellow-700', step: 3 },
  test: { label: 'Teste', color: 'bg-orange-100 text-orange-700', step: 4 },
  offer: { label: 'Proposta', color: 'bg-green-100 text-green-700', step: 5 },
  hired: { label: 'Contratado', color: 'bg-emerald-100 text-emerald-700', step: 6 },
  rejected: { label: 'Rejeitado', color: 'bg-red-100 text-red-700', step: 0 }
}

const AREA_COLORS: Record<string, string> = {
  'Social Media': 'bg-pink-100 text-pink-700',
  'Tráfego': 'bg-blue-100 text-blue-700',
  'Design': 'bg-purple-100 text-purple-700',
  'Video': 'bg-red-100 text-red-700',
  'Web': 'bg-cyan-100 text-cyan-700',
  'Comercial': 'bg-green-100 text-green-700',
  'RH': 'bg-orange-100 text-orange-700',
  'Financeiro': 'bg-yellow-100 text-yellow-700'
}

// ==================== MOCK DATA ====================
const MOCK_EMPLOYEES: Employee[] = [
  {
    id: '1',
    name: 'Maria Silva',
    email: 'maria@empresa.com',
    role: 'Social Media Manager',
    area: 'Social Media',
    startDate: new Date(2022, 3, 15),
    status: 'active',
    performance: 92,
    satisfaction: 85,
    lastEvaluation: new Date(2024, 9, 1),
    alerts: []
  },
  {
    id: '2',
    name: 'João Santos',
    email: 'joao@empresa.com',
    role: 'Gestor de Tráfego',
    area: 'Tráfego',
    startDate: new Date(2021, 7, 1),
    status: 'active',
    performance: 88,
    satisfaction: 78,
    lastEvaluation: new Date(2024, 8, 15),
    nextVacation: new Date(2025, 0, 15),
    alerts: ['Avaliação pendente']
  },
  {
    id: '3',
    name: 'Ana Costa',
    email: 'ana@empresa.com',
    role: 'Designer Sênior',
    area: 'Design',
    startDate: new Date(2023, 1, 10),
    status: 'vacation',
    performance: 95,
    satisfaction: 92,
    lastEvaluation: new Date(2024, 10, 1),
    alerts: []
  },
  {
    id: '4',
    name: 'Pedro Lima',
    email: 'pedro@empresa.com',
    role: 'Video Maker',
    area: 'Video',
    startDate: new Date(2024, 5, 1),
    status: 'active',
    performance: 75,
    satisfaction: 65,
    alerts: ['Performance abaixo da meta', 'Satisfação baixa']
  }
]

const MOCK_CANDIDATES: Candidate[] = [
  {
    id: '1',
    name: 'Lucas Ferreira',
    email: 'lucas@email.com',
    phone: '(11) 99999-0001',
    position: 'Social Media Analyst',
    status: 'interview',
    aiScore: 87,
    appliedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    source: 'LinkedIn',
    skills: ['Instagram', 'TikTok', 'Copywriting'],
    experience: 3
  },
  {
    id: '2',
    name: 'Carla Mendes',
    email: 'carla@email.com',
    phone: '(11) 99999-0002',
    position: 'Designer Jr',
    status: 'test',
    aiScore: 92,
    appliedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    source: 'Indeed',
    skills: ['Figma', 'Photoshop', 'Illustrator'],
    experience: 2
  },
  {
    id: '3',
    name: 'Roberto Alves',
    email: 'roberto@email.com',
    phone: '(11) 99999-0003',
    position: 'Gestor de Tráfego',
    status: 'new',
    aiScore: 75,
    appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    source: 'Indicação',
    skills: ['Google Ads', 'Meta Ads', 'Analytics'],
    experience: 4
  }
]

const MOCK_ONBOARDING: OnboardingTask[] = [
  { id: '1', employeeId: '4', employeeName: 'Pedro Lima', task: 'Configurar email corporativo', category: 'access', status: 'completed', dueDate: new Date(2024, 5, 1) },
  { id: '2', employeeId: '4', employeeName: 'Pedro Lima', task: 'Treinamento de ferramentas', category: 'training', status: 'in_progress', dueDate: new Date(2024, 5, 15) },
  { id: '3', employeeId: '4', employeeName: 'Pedro Lima', task: 'Apresentação à equipe', category: 'introduction', status: 'pending', dueDate: new Date(2024, 5, 5) }
]

const MOCK_VACATION_REQUESTS: VacationRequest[] = [
  { id: '1', employeeId: '2', employeeName: 'João Santos', startDate: new Date(2025, 0, 15), endDate: new Date(2025, 0, 30), status: 'pending', type: 'vacation' },
  { id: '2', employeeId: '1', employeeName: 'Maria Silva', startDate: new Date(2025, 2, 1), endDate: new Date(2025, 2, 15), status: 'approved', type: 'vacation' }
]

// ==================== COMPONENTE PRINCIPAL ====================
export default function RHPage() {
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES)
  const [candidates, setCandidates] = useState<Candidate[]>(MOCK_CANDIDATES)
  const [onboarding, setOnboarding] = useState<OnboardingTask[]>(MOCK_ONBOARDING)
  const [vacationRequests, setVacationRequests] = useState<VacationRequest[]>(MOCK_VACATION_REQUESTS)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'recruitment' | 'employees' | 'requests'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [runningAIScreening, setRunningAIScreening] = useState(false)

  // Estatísticas
  const stats = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter(e => e.status === 'active').length,
    onVacation: employees.filter(e => e.status === 'vacation').length,
    avgPerformance: Math.round(employees.reduce((sum, e) => sum + e.performance, 0) / employees.length),
    avgSatisfaction: Math.round(employees.reduce((sum, e) => sum + e.satisfaction, 0) / employees.length),
    openPositions: 3,
    totalCandidates: candidates.length,
    pendingRequests: vacationRequests.filter(v => v.status === 'pending').length,
    turnover: 5.2,
    avgHiringTime: 18
  }

  const handleAIScreening = async () => {
    setRunningAIScreening(true)
    await new Promise(resolve => setTimeout(resolve, 2500))
    setRunningAIScreening(false)
  }

  const getSatisfactionIcon = (score: number) => {
    if (score >= 80) return <Smile className="w-4 h-4 text-green-500" />
    if (score >= 60) return <Meh className="w-4 h-4 text-yellow-500" />
    return <Frown className="w-4 h-4 text-red-500" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Painel RH</h1>
              <p className="text-sm text-gray-500">Recrutamento, gestão de pessoas e bem-estar</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleAIScreening}
              disabled={runningAIScreening}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {runningAIScreening ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Triagem IA
                </>
              )}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
              <UserPlus className="w-4 h-4" />
              Nova Vaga
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* KPIs Principais */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Colaboradores</span>
              <Users className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.totalEmployees}</p>
            <p className="text-xs text-gray-500 mt-1">{stats.activeEmployees} ativos</p>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Performance</span>
              <Target className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.avgPerformance}%</p>
            <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full",
                  stats.avgPerformance >= 80 ? "bg-green-500" :
                  stats.avgPerformance >= 60 ? "bg-yellow-500" : "bg-red-500"
                )}
                style={{ width: `${stats.avgPerformance}%` }}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Satisfação</span>
              <Heart className="w-4 h-4 text-pink-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.avgSatisfaction}%</p>
            <div className="flex items-center gap-1 mt-1">
              {getSatisfactionIcon(stats.avgSatisfaction)}
              <span className="text-xs text-gray-500">média geral</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Turnover</span>
              <TrendingUp className="w-4 h-4 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.turnover}%</p>
            <p className="text-xs text-green-600 mt-1">↓ 2% vs ano anterior</p>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Vagas Abertas</span>
              <Briefcase className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.openPositions}</p>
            <p className="text-xs text-gray-500 mt-1">{stats.totalCandidates} candidatos</p>
          </div>
        </div>

        {/* Link para Gestão de Franqueados */}
        <Link href="/admin/franqueados">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="flex items-center justify-between p-4 mb-6 rounded-xl border bg-white cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Gestão de Franqueados</h3>
                <p className="text-sm text-gray-500">Pipeline de candidatos, testes comportamentais e análise de franquias</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-orange-600">
              <span className="text-sm font-medium">Acessar</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>
        </Link>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="col-span-2 space-y-6">
            {/* AI Collector */}
            <AICollectorCard area="rh" maxAlerts={3} />

            {/* Tabs */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="flex border-b">
                {[
                  { id: 'overview', label: 'Visão Geral', icon: Activity },
                  { id: 'recruitment', label: 'Recrutamento', icon: UserPlus },
                  { id: 'employees', label: 'Colaboradores', icon: Users },
                  { id: 'requests', label: 'Solicitações', icon: Calendar }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
                      activeTab === tab.id
                        ? "bg-orange-50 text-orange-700 border-b-2 border-orange-600"
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-4">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Alerts */}
                    {employees.filter(e => e.alerts.length > 0).length > 0 && (
                      <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                        <div className="flex items-center gap-2 text-orange-700 font-medium mb-3">
                          <AlertTriangle className="w-5 h-5" />
                          Colaboradores que Precisam de Atenção
                        </div>
                        <div className="space-y-2">
                          {employees.filter(e => e.alerts.length > 0).map(emp => (
                            <div
                              key={emp.id}
                              className="flex items-center justify-between p-3 bg-white rounded-lg cursor-pointer hover:shadow-md transition-all"
                              onClick={() => setSelectedEmployee(emp)}
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                  <span className="text-orange-600 font-bold">{emp.name.charAt(0)}</span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">{emp.name}</p>
                                  <p className="text-xs text-gray-500">{emp.role}</p>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {emp.alerts.map((alert, i) => (
                                  <span key={i} className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded">
                                    {alert}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Distribution by Area */}
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3">Distribuição por Área</h4>
                      <div className="grid grid-cols-4 gap-3">
                        {Object.entries(
                          employees.reduce((acc, emp) => {
                            acc[emp.area] = (acc[emp.area] || 0) + 1
                            return acc
                          }, {} as Record<string, number>)
                        ).map(([area, count]) => (
                          <div key={area} className="p-3 bg-gray-50 rounded-lg text-center">
                            <span className={cn(
                              "text-xs px-2 py-0.5 rounded-full",
                              AREA_COLORS[area] || 'bg-gray-100 text-gray-700'
                            )}>
                              {area}
                            </span>
                            <p className="text-2xl font-bold text-gray-800 mt-2">{count}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Onboarding Progress */}
                    {onboarding.filter(t => t.status !== 'completed').length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-3">Onboarding em Andamento</h4>
                        <div className="space-y-2">
                          {onboarding.filter(t => t.status !== 'completed').map(task => (
                            <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center",
                                  task.status === 'in_progress' ? 'bg-blue-100' : 'bg-gray-100'
                                )}>
                                  {task.category === 'training' && <GraduationCap className="w-4 h-4 text-blue-500" />}
                                  {task.category === 'access' && <Settings className="w-4 h-4 text-purple-500" />}
                                  {task.category === 'introduction' && <Users className="w-4 h-4 text-green-500" />}
                                  {task.category === 'documents' && <FileText className="w-4 h-4 text-orange-500" />}
                                  {task.category === 'equipment' && <Briefcase className="w-4 h-4 text-cyan-500" />}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">{task.task}</p>
                                  <p className="text-xs text-gray-500">{task.employeeName}</p>
                                </div>
                              </div>
                              <span className={cn(
                                "text-xs px-2 py-0.5 rounded-full",
                                task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                              )}>
                                {task.status === 'in_progress' ? 'Em progresso' : 'Pendente'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Recruitment Tab */}
                {activeTab === 'recruitment' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-800">Pipeline de Recrutamento</h4>
                      <button className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700">
                        <Plus className="w-4 h-4" />
                        Adicionar Candidato
                      </button>
                    </div>

                    {/* Pipeline Stats */}
                    <div className="grid grid-cols-6 gap-2 mb-4">
                      {Object.entries(CANDIDATE_STATUS_CONFIG)
                        .filter(([key]) => key !== 'rejected')
                        .map(([key, config]) => {
                          const count = candidates.filter(c => c.status === key).length
                          return (
                            <div key={key} className={cn("p-2 rounded-lg text-center", config.color)}>
                              <p className="text-lg font-bold">{count}</p>
                              <p className="text-xs">{config.label}</p>
                            </div>
                          )
                        })}
                    </div>

                    {/* Candidates List */}
                    <div className="space-y-3">
                      {candidates.map((candidate, index) => {
                        const statusConfig = CANDIDATE_STATUS_CONFIG[candidate.status]
                        return (
                          <motion.div
                            key={candidate.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setSelectedCandidate(candidate)}
                            className="p-4 border rounded-xl cursor-pointer hover:shadow-md transition-all"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold">
                                  {candidate.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-gray-800">{candidate.name}</h4>
                                    <span className={cn("text-xs px-2 py-0.5 rounded-full", statusConfig.color)}>
                                      {statusConfig.label}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-500">{candidate.position}</p>
                                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                                    <span>{candidate.experience} anos exp.</span>
                                    <span>•</span>
                                    <span>{candidate.source}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-2">
                                  <Brain className="w-4 h-4 text-purple-500" />
                                  <span className={cn(
                                    "text-lg font-bold",
                                    candidate.aiScore >= 80 ? "text-green-600" :
                                    candidate.aiScore >= 60 ? "text-yellow-600" : "text-red-600"
                                  )}>
                                    {candidate.aiScore}%
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500">Score IA</p>
                              </div>
                            </div>

                            {/* Pipeline Progress */}
                            <div className="mt-3 pt-3 border-t">
                              <div className="flex items-center gap-1">
                                {Object.entries(CANDIDATE_STATUS_CONFIG)
                                  .filter(([key]) => key !== 'rejected')
                                  .map(([key, config]) => (
                                    <div
                                      key={key}
                                      className={cn(
                                        "h-1.5 flex-1 rounded-full",
                                        config.step <= statusConfig.step ? "bg-orange-500" : "bg-gray-200"
                                      )}
                                    />
                                  ))}
                              </div>
                            </div>

                            {/* Skills */}
                            <div className="flex flex-wrap gap-1 mt-2">
                              {candidate.skills.slice(0, 3).map(skill => (
                                <span key={skill} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                  {skill}
                                </span>
                              ))}
                              {candidate.skills.length > 3 && (
                                <span className="text-xs text-gray-400">+{candidate.skills.length - 3}</span>
                              )}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Employees Tab */}
                {activeTab === 'employees' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar colaboradores..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <button className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50">
                        <Filter className="w-4 h-4" />
                        Filtros
                      </button>
                    </div>

                    <div className="space-y-3">
                      {employees
                        .filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((emp, index) => (
                          <motion.div
                            key={emp.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => setSelectedEmployee(emp)}
                            className={cn(
                              "p-4 border rounded-xl cursor-pointer hover:shadow-md transition-all",
                              emp.alerts.length > 0 && "border-orange-300 bg-orange-50"
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold",
                                  emp.status === 'active' ? "bg-gradient-to-br from-green-500 to-emerald-500" :
                                  emp.status === 'vacation' ? "bg-gradient-to-br from-blue-500 to-cyan-500" :
                                  "bg-gray-400"
                                )}>
                                  {emp.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-gray-800">{emp.name}</h4>
                                    <span className={cn(
                                      "text-xs px-2 py-0.5 rounded-full",
                                      emp.status === 'active' ? "bg-green-100 text-green-700" :
                                      emp.status === 'vacation' ? "bg-blue-100 text-blue-700" :
                                      "bg-gray-100 text-gray-700"
                                    )}>
                                      {emp.status === 'active' ? 'Ativo' :
                                       emp.status === 'vacation' ? 'Férias' : emp.status}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-500">{emp.role}</p>
                                  <span className={cn(
                                    "text-xs px-2 py-0.5 rounded-full mt-1 inline-block",
                                    AREA_COLORS[emp.area] || 'bg-gray-100 text-gray-700'
                                  )}>
                                    {emp.area}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-2 mb-1">
                                  <Target className="w-4 h-4 text-gray-400" />
                                  <span className={cn(
                                    "font-bold",
                                    emp.performance >= 80 ? "text-green-600" :
                                    emp.performance >= 60 ? "text-yellow-600" : "text-red-600"
                                  )}>
                                    {emp.performance}%
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {getSatisfactionIcon(emp.satisfaction)}
                                  <span className="text-sm text-gray-600">{emp.satisfaction}%</span>
                                </div>
                              </div>
                            </div>

                            {/* Alerts */}
                            {emp.alerts.length > 0 && (
                              <div className="mt-3 pt-3 border-t flex flex-wrap gap-1">
                                {emp.alerts.map((alert, i) => (
                                  <span key={i} className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    {alert}
                                  </span>
                                ))}
                              </div>
                            )}
                          </motion.div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Requests Tab */}
                {activeTab === 'requests' && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-800 mb-3">Solicitações de Férias/Ausências</h4>
                    
                    <div className="space-y-3">
                      {vacationRequests.map((request, index) => (
                        <motion.div
                          key={request.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                            "p-4 border rounded-xl",
                            request.status === 'pending' && "border-yellow-300 bg-yellow-50"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold">
                                {request.employeeName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{request.employeeName}</p>
                                <p className="text-sm text-gray-500">
                                  {format(request.startDate, 'dd/MM/yyyy', { locale: ptBR })} - {format(request.endDate, 'dd/MM/yyyy', { locale: ptBR })}
                                </p>
                                <span className={cn(
                                  "text-xs px-2 py-0.5 rounded-full",
                                  request.type === 'vacation' ? 'bg-blue-100 text-blue-700' :
                                  request.type === 'sick_leave' ? 'bg-red-100 text-red-700' :
                                  'bg-gray-100 text-gray-700'
                                )}>
                                  {request.type === 'vacation' ? 'Férias' :
                                   request.type === 'sick_leave' ? 'Licença Médica' : 'Pessoal'}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {request.status === 'pending' ? (
                                <>
                                  <button className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600">
                                    Aprovar
                                  </button>
                                  <button className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600">
                                    Recusar
                                  </button>
                                </>
                              ) : (
                                <span className={cn(
                                  "px-3 py-1 rounded-lg text-sm",
                                  request.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                )}>
                                  {request.status === 'approved' ? 'Aprovado' : 'Recusado'}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Goals & Insights */}
          <div className="space-y-6">
            <GoalsTracker area="rh" />
            <SmartInsightsPanel area="rh" maxInsights={4} />

            {/* AI Tools */}
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-gray-800">Ferramentas IA</h3>
              </div>
              <div className="space-y-2">
                <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3">
                  <FileText className="w-5 h-5 text-orange-500" />
                  <div>
                    <span className="text-sm font-medium">Triagem de CVs</span>
                    <p className="text-xs text-gray-500">Análise automática</p>
                  </div>
                </button>
                <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <div>
                    <span className="text-sm font-medium">Avaliação 360°</span>
                    <p className="text-xs text-gray-500">Gerar formulário</p>
                  </div>
                </button>
                <button className="w-full p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3">
                  <Heart className="w-5 h-5 text-pink-500" />
                  <div>
                    <span className="text-sm font-medium">Pesquisa de Clima</span>
                    <p className="text-xs text-gray-500">Enviar pesquisa</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-xl border shadow-sm p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Próximos Eventos</h3>
              <div className="space-y-3">
                {employees.filter(e => e.nextVacation).slice(0, 3).map(emp => (
                  <div key={emp.id} className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{emp.name}</p>
                      <p className="text-xs text-gray-500">
                        Férias: {format(emp.nextVacation!, 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                ))}
                {employees.filter(e => {
                  if (!e.startDate) return false
                  const months = differenceInMonths(new Date(), e.startDate)
                  return months > 0 && months % 12 === 0
                }).slice(0, 2).map(emp => (
                  <div key={emp.id} className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                    <Award className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{emp.name}</p>
                      <p className="text-xs text-gray-500">
                        Aniversário de empresa
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Detail Modal */}
      <AnimatePresence>
        {selectedEmployee && (
          <EmployeeDetailModal
            employee={selectedEmployee}
            onClose={() => setSelectedEmployee(null)}
          />
        )}
      </AnimatePresence>

      {/* Candidate Detail Modal */}
      <AnimatePresence>
        {selectedCandidate && (
          <CandidateDetailModal
            candidate={selectedCandidate}
            onClose={() => setSelectedCandidate(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ==================== EMPLOYEE DETAIL MODAL ====================
function EmployeeDetailModal({
  employee,
  onClose
}: {
  employee: Employee
  onClose: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
      >
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl",
                employee.status === 'active' ? "bg-gradient-to-br from-green-500 to-emerald-500" :
                "bg-gradient-to-br from-blue-500 to-cyan-500"
              )}>
                {employee.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{employee.name}</h2>
                <p className="text-sm text-gray-500">{employee.role}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <Target className="w-6 h-6 mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-bold text-gray-800">{employee.performance}%</p>
              <p className="text-xs text-gray-500">Performance</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl text-center">
              <Heart className="w-6 h-6 mx-auto text-pink-500 mb-2" />
              <p className="text-2xl font-bold text-gray-800">{employee.satisfaction}%</p>
              <p className="text-xs text-gray-500">Satisfação</p>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{employee.email}</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Briefcase className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{employee.area}</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm">
                Desde {format(employee.startDate, "MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </div>
          </div>

          {/* Alerts */}
          {employee.alerts.length > 0 && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <p className="text-sm font-medium text-orange-700 mb-2">Alertas</p>
              <div className="space-y-1">
                {employee.alerts.map((alert, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-orange-600">
                    <AlertTriangle className="w-4 h-4" />
                    {alert}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50 flex gap-3">
          <button className="flex-1 px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-50">
            Ver Histórico
          </button>
          <button className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
            Iniciar Avaliação
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ==================== CANDIDATE DETAIL MODAL ====================
function CandidateDetailModal({
  candidate,
  onClose
}: {
  candidate: Candidate
  onClose: () => void
}) {
  const statusConfig = CANDIDATE_STATUS_CONFIG[candidate.status]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
      >
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-xl">
                {candidate.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{candidate.name}</h2>
                <p className="text-sm text-gray-500">{candidate.position}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* AI Score */}
          <div className="p-4 bg-purple-50 rounded-xl mb-6 text-center">
            <Brain className="w-8 h-8 mx-auto text-purple-500 mb-2" />
            <p className={cn(
              "text-3xl font-bold",
              candidate.aiScore >= 80 ? "text-green-600" :
              candidate.aiScore >= 60 ? "text-yellow-600" : "text-red-600"
            )}>
              {candidate.aiScore}%
            </p>
            <p className="text-sm text-purple-700">Score IA</p>
          </div>

          {/* Pipeline */}
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">Status no Pipeline</p>
            <div className="flex items-center gap-1">
              {Object.entries(CANDIDATE_STATUS_CONFIG)
                .filter(([key]) => key !== 'rejected')
                .map(([key, config]) => (
                  <div
                    key={key}
                    className={cn(
                      "h-2 flex-1 rounded-full",
                      config.step <= statusConfig.step ? "bg-orange-500" : "bg-gray-200"
                    )}
                  />
                ))}
            </div>
            <p className="text-center mt-2">
              <span className={cn("px-3 py-1 rounded-full text-sm", statusConfig.color)}>
                {statusConfig.label}
              </span>
            </p>
          </div>

          {/* Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{candidate.email}</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{candidate.phone}</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Briefcase className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{candidate.experience} anos de experiência</span>
            </div>
          </div>

          {/* Skills */}
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Habilidades</p>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map(skill => (
                <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex gap-3">
          <button className="flex-1 px-4 py-2 text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50">
            Rejeitar
          </button>
          <button className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
            Avançar Etapa
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}






