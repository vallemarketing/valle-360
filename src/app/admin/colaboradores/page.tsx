'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, Mail, Phone, Award, Calendar, MoreVertical } from 'lucide-react'
import Link from 'next/link'

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
}

export default function EmployeesListPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('all')

  // Mock data - será substituído por dados reais do Supabase
  const [employees] = useState<Employee[]>([
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
      performanceScore: 92
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
      performanceScore: 88
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
      performanceScore: 95
    }
  ])

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

                    <Link href={`/admin/colaboradores/${employee.id}`}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 rounded-lg font-medium text-sm"
                        style={{
                          backgroundColor: 'var(--primary-50)',
                          color: 'var(--primary-600)'
                        }}
                      >
                        Ver Detalhes
                      </motion.button>
                    </Link>

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
    </div>
  )
}
