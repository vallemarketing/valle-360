'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Mail, Phone, Award, Calendar, MoreVertical, X, TrendingUp, Target, Clock, Star, AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

interface Employee {
  id: string
  fullName: string
  email: string
  phone: string
  position: string
  department: string
  areaOfExpertise: string
  status: 'active' | 'inactive' | 'vacation'
  hireDate: string
  avatar: string
  performanceScore: number
  // Dados adicionais para o modal
  deliveriesOnTime: number
  totalDeliveries: number
  retentionStatus: 'reter' | 'melhorar' | 'atenção'
  clientsAssigned: number
  feedbackHistory: Array<{
    date: string
    type: 'positive' | 'negative' | 'neutral'
    comment: string
  }>
}

export default function EmployeesListPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('all')
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [showModal, setShowModal] = useState(false)

  const handleViewDetails = (emp: Employee) => {
    setSelectedEmployee(emp)
    setShowModal(true)
  }

  // Mock data - fallback (a tela tenta carregar dados reais via API)
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      fullName: 'Ana Silva Santos',
      email: 'ana.silva@valle360.com.br',
      phone: '(11) 99876-5432',
      position: 'Social Media Manager',
      department: 'Marketing',
      areaOfExpertise: 'Social Media',
      status: 'active',
      hireDate: '2023-03-15',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana',
      performanceScore: 92,
      deliveriesOnTime: 45,
      totalDeliveries: 48,
      retentionStatus: 'reter',
      clientsAssigned: 8,
      feedbackHistory: [
        { date: '2024-11-15', type: 'positive', comment: 'Excelente trabalho no projeto Valle Store!' },
        { date: '2024-10-20', type: 'positive', comment: 'Muito proativa e organizada.' },
        { date: '2024-09-10', type: 'neutral', comment: 'Pode melhorar comunicação com clientes.' }
      ]
    },
    {
      id: '2',
      fullName: 'Carlos Eduardo Mendes',
      email: 'carlos.mendes@valle360.com.br',
      phone: '(11) 98765-4321',
      position: 'Gestor de Tráfego Pago',
      department: 'Marketing',
      areaOfExpertise: 'Tráfego Pago',
      status: 'active',
      hireDate: '2022-11-20',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
      performanceScore: 88,
      deliveriesOnTime: 38,
      totalDeliveries: 42,
      retentionStatus: 'reter',
      clientsAssigned: 12,
      feedbackHistory: [
        { date: '2024-11-10', type: 'positive', comment: 'Ótimos resultados em campanhas.' },
        { date: '2024-10-05', type: 'negative', comment: 'Atrasou entrega de relatório.' }
      ]
    },
    {
      id: '3',
      fullName: 'Mariana Costa Lima',
      email: 'mariana.lima@valle360.com.br',
      phone: '(11) 97654-3210',
      position: 'Designer Gráfico',
      department: 'Design',
      areaOfExpertise: 'Design',
      status: 'active',
      hireDate: '2023-06-01',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mariana',
      performanceScore: 95,
      deliveriesOnTime: 52,
      totalDeliveries: 54,
      retentionStatus: 'reter',
      clientsAssigned: 15,
      feedbackHistory: [
        { date: '2024-11-20', type: 'positive', comment: 'Criatividade excepcional!' },
        { date: '2024-11-01', type: 'positive', comment: 'Cliente muito satisfeito com artes.' }
      ]
    },
    {
      id: '4',
      fullName: 'João Pedro Oliveira',
      email: 'joao.pedro@valle360.com.br',
      phone: '(11) 96543-2109',
      position: 'Desenvolvedor Web',
      department: 'Tecnologia',
      areaOfExpertise: 'Web',
      status: 'active',
      hireDate: '2024-01-10',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joao',
      performanceScore: 65,
      deliveriesOnTime: 18,
      totalDeliveries: 25,
      retentionStatus: 'melhorar',
      clientsAssigned: 5,
      feedbackHistory: [
        { date: '2024-11-18', type: 'negative', comment: 'Precisa melhorar prazos.' },
        { date: '2024-10-25', type: 'neutral', comment: 'Qualidade boa, mas atrasos frequentes.' }
      ]
    }
  ])

  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    try {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      return token ? { Authorization: `Bearer ${token}` } : {}
    } catch {
      return {}
    }
  }

  const loadEmployeesReal = async () => {
    try {
      const authHeaders = await getAuthHeaders()
      const res = await fetch('/api/admin/employees', { headers: authHeaders })
      const data = await res.json().catch(() => null)
      if (!res.ok) return
      if (Array.isArray(data?.employees) && data.employees.length > 0) {
        setEmployees(data.employees)
      }
    } catch {
      // mantém mock
    }
  }

  // Carrega dados reais uma vez
  useEffect(() => {
    loadEmployeesReal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getRetentionBadge = (status: string) => {
    switch (status) {
      case 'reter':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">Reter</Badge>
      case 'melhorar':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">Melhorar</Badge>
      case 'atenção':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/30">Atenção</Badge>
      default:
        return null
    }
  }

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDepartment = filterDepartment === 'all' || emp.department === filterDepartment

    return matchesSearch && matchesDepartment
  })

  const getStatusInfo = (status: string) => {
    const statuses = {
      active: { bg: 'var(--success-50)', text: 'var(--success-700)', label: 'Ativo' },
      inactive: { bg: 'var(--error-50)', text: 'var(--error-700)', label: 'Inativo' },
      vacation: { bg: 'var(--warning-50)', text: 'var(--warning-700)', label: 'Férias' }
    }
    return statuses[status as keyof typeof statuses]
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'var(--success-500)'
    if (score >= 70) return 'var(--primary-500)'
    if (score >= 50) return 'var(--warning-500)'
    return 'var(--error-500)'
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              Colaboradores
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Gerencie a equipe da Valle 360
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/admin/colaboradores/vincular">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium border shadow-sm"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-light)',
                  color: 'var(--text-primary)',
                }}
              >
                Vincular existente
              </motion.button>
            </Link>
            <Link href="/admin/colaboradores/novo">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white shadow-md"
                style={{ backgroundColor: 'var(--primary-500)' }}
              >
                <Plus className="w-5 h-5" />
                Novo Colaborador
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-6 shadow-sm border"
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-light)'
            }}
          >
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Total Colaboradores
            </p>
            <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {filteredEmployees.length}
            </p>
          </motion.div>

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
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Ativos
            </p>
            <p className="text-3xl font-bold" style={{ color: 'var(--success-600)' }}>
              {employees.filter(e => e.status === 'active').length}
            </p>
          </motion.div>

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
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Performance Média
            </p>
            <p className="text-3xl font-bold" style={{ color: 'var(--primary-500)' }}>
              {Math.round(employees.reduce((sum, e) => sum + e.performanceScore, 0) / employees.length)}%
            </p>
          </motion.div>

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
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Departamentos
            </p>
            <p className="text-3xl font-bold" style={{ color: 'var(--purple-500)' }}>
              {new Set(employees.map(e => e.department)).size}
            </p>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: 'var(--text-tertiary)' }}
            />
            <input
              type="text"
              placeholder="Buscar por nome, email ou cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-light)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="all">Todos os Departamentos</option>
            <option value="Marketing">Marketing</option>
            <option value="Design">Design</option>
            <option value="Comercial">Comercial</option>
            <option value="Financeiro">Financeiro</option>
            <option value="RH">RH</option>
          </select>
        </div>

        {/* Employees List */}
        <div className="space-y-4">
          {filteredEmployees.map((employee, index) => {
            const statusInfo = getStatusInfo(employee.status)
            return (
              <motion.div
                key={employee.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-xl p-6 shadow-sm border hover:shadow-md transition-all"
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: 'var(--border-light)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <img
                      src={employee.avatar}
                      alt={employee.fullName}
                      className="w-16 h-16 rounded-full"
                    />

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                          {employee.fullName}
                        </h3>
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: statusInfo.bg,
                            color: statusInfo.text
                          }}
                        >
                          {statusInfo.label}
                        </span>
                      </div>

                      <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        {employee.position} • {employee.department}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                          <Mail className="w-4 h-4" />
                          <span>{employee.email}</span>
                        </div>
                        <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                          <Phone className="w-4 h-4" />
                          <span>{employee.phone}</span>
                        </div>
                        <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                          <Calendar className="w-4 h-4" />
                          <span>Desde {new Date(employee.hireDate).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Performance Score */}
                    <div className="text-center">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg border-4"
                        style={{
                          borderColor: getPerformanceColor(employee.performanceScore),
                          color: getPerformanceColor(employee.performanceScore)
                        }}
                      >
                        {employee.performanceScore}
                      </div>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                        Performance
                      </p>
                    </div>

                    <motion.button
                      onClick={() => handleViewDetails(employee)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2"
                      style={{
                        backgroundColor: 'var(--primary-50)',
                        color: 'var(--primary-600)'
                      }}
                    >
                      Ver Detalhes
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>

                    <button
                      className="p-2 rounded-lg hover:bg-opacity-50"
                      style={{ backgroundColor: 'var(--bg-tertiary)' }}
                    >
                      <MoreVertical className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
              Nenhum colaborador encontrado
            </p>
          </div>
        )}
      </div>

      {/* Modal de Detalhes do Colaborador */}
      <AnimatePresence>
        {showModal && selectedEmployee && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#0a0f1a] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedEmployee.avatar}
                      alt={selectedEmployee.fullName}
                      className="w-16 h-16 rounded-full border-4 border-[#1672d6]/30"
                    />
                    <div>
                      <h2 className="text-xl font-bold text-[#001533] dark:text-white">{selectedEmployee.fullName}</h2>
                      <p className="text-gray-500">{selectedEmployee.position}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{selectedEmployee.department}</Badge>
                        {getRetentionBadge(selectedEmployee.retentionStatus)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Performance Score */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#1672d6]/10 to-[#001533]/5 border border-[#1672d6]/20">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#1672d6]" />
                    Performance Geral
                  </h3>
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold border-4",
                      selectedEmployee.performanceScore >= 90 ? "border-emerald-500 text-emerald-500" :
                      selectedEmployee.performanceScore >= 70 ? "border-[#1672d6] text-[#1672d6]" :
                      selectedEmployee.performanceScore >= 50 ? "border-amber-500 text-amber-500" : "border-red-500 text-red-500"
                    )}>
                      {selectedEmployee.performanceScore}%
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Entregas no Prazo</span>
                          <span className="font-medium">{selectedEmployee.deliveriesOnTime}/{selectedEmployee.totalDeliveries}</span>
                        </div>
                        <Progress value={(selectedEmployee.deliveriesOnTime / selectedEmployee.totalDeliveries) * 100} className="h-2" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="text-center p-3 rounded-lg bg-white dark:bg-[#001533]/50">
                          <p className="text-2xl font-bold text-[#1672d6]">{selectedEmployee.clientsAssigned}</p>
                          <p className="text-xs text-gray-500">Clientes Atribuídos</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-white dark:bg-[#001533]/50">
                          <p className="text-2xl font-bold text-emerald-500">{Math.round((selectedEmployee.deliveriesOnTime / selectedEmployee.totalDeliveries) * 100)}%</p>
                          <p className="text-xs text-gray-500">Taxa de Entrega</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contato */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[#001533]/30">
                    <Mail className="w-4 h-4 text-[#1672d6]" />
                    <div>
                      <p className="text-xs text-gray-500">E-mail</p>
                      <p className="text-sm font-medium">{selectedEmployee.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-[#001533]/30">
                    <Phone className="w-4 h-4 text-[#1672d6]" />
                    <div>
                      <p className="text-xs text-gray-500">Telefone</p>
                      <p className="text-sm font-medium">{selectedEmployee.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Histórico de Feedbacks */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500" />
                    Histórico de Feedbacks
                  </h3>
                  <div className="space-y-2">
                    {selectedEmployee.feedbackHistory.map((feedback, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "p-3 rounded-lg border-l-4",
                          feedback.type === 'positive' ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10" :
                          feedback.type === 'negative' ? "border-red-500 bg-red-50 dark:bg-red-900/10" :
                          "border-gray-300 bg-gray-50 dark:bg-gray-900/10"
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-500">
                            {new Date(feedback.date).toLocaleDateString('pt-BR')}
                          </span>
                          {feedback.type === 'positive' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                          {feedback.type === 'negative' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                        </div>
                        <p className="text-sm">{feedback.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button variant="outline" className="flex-1">
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar Mensagem
                  </Button>
                  <Button className="flex-1 bg-[#1672d6] hover:bg-[#1260b5]">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Ver Performance Completa
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
