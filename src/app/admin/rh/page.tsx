'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Brain, Target, TrendingUp, TrendingDown,
  AlertTriangle, Award, Calendar, FileText, Plus,
  Search, Filter, ChevronRight, BarChart3
} from 'lucide-react';
import { BehavioralTests } from '@/components/rh/BehavioralTests';

interface Employee {
  id: string;
  name: string;
  avatar: string;
  role: string;
  department: string;
  retentionScore: number;
  engagementScore: number;
  performanceScore: number;
  fitCultural: number;
  discProfile: { D: number; I: number; S: number; C: number };
  riskLevel: 'low' | 'medium' | 'high';
  joinedAt: Date;
}

const SAMPLE_EMPLOYEES: Employee[] = [
  {
    id: '1',
    name: 'João Silva',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=joao',
    role: 'Web Designer',
    department: 'Design',
    retentionScore: 85,
    engagementScore: 72,
    performanceScore: 88,
    fitCultural: 85,
    discProfile: { D: 45, I: 70, S: 30, C: 55 },
    riskLevel: 'medium',
    joinedAt: new Date('2023-03-15')
  },
  {
    id: '2',
    name: 'Maria Santos',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
    role: 'Social Media',
    department: 'Marketing',
    retentionScore: 92,
    engagementScore: 95,
    performanceScore: 91,
    fitCultural: 93,
    discProfile: { D: 35, I: 85, S: 45, C: 35 },
    riskLevel: 'low',
    joinedAt: new Date('2022-08-10')
  },
  {
    id: '3',
    name: 'Pedro Costa',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pedro',
    role: 'Gestor de Tráfego',
    department: 'Performance',
    retentionScore: 65,
    engagementScore: 58,
    performanceScore: 72,
    fitCultural: 70,
    discProfile: { D: 75, I: 55, S: 25, C: 45 },
    riskLevel: 'high',
    joinedAt: new Date('2023-01-20')
  }
];

export default function RHPage() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showTest, setShowTest] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  const filteredEmployees = SAMPLE_EMPLOYEES.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = filterRisk === 'all' || emp.riskLevel === filterRisk;
    return matchesSearch && matchesRisk;
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--success-500)';
    if (score >= 60) return 'var(--warning-500)';
    return 'var(--error-500)';
  };

  const getRiskBadge = (risk: string) => {
    const config = {
      low: { bg: 'var(--success-100)', color: 'var(--success-700)', label: 'Baixo' },
      medium: { bg: 'var(--warning-100)', color: 'var(--warning-700)', label: 'Médio' },
      high: { bg: 'var(--error-100)', color: 'var(--error-700)', label: 'Alto' }
    };
    return config[risk as keyof typeof config];
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--purple-100)' }}
            >
              <Users className="w-7 h-7" style={{ color: 'var(--purple-500)' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Gestão de RH
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                Análise comportamental e retenção de talentos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowTest(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-white"
              style={{ backgroundColor: 'var(--purple-500)' }}
            >
              <Brain className="w-4 h-4" />
              Novo Teste
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-white"
              style={{ backgroundColor: 'var(--primary-500)' }}
            >
              <Plus className="w-4 h-4" />
              Nova Vaga
            </motion.button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard 
            label="Total Colaboradores"
            value="32"
            icon={<Users className="w-6 h-6" />}
            color="var(--primary-500)"
            trend={{ value: 2, isPositive: true }}
          />
          <KPICard 
            label="Engajamento Médio"
            value="78%"
            icon={<Target className="w-6 h-6" />}
            color="var(--success-500)"
            trend={{ value: 5, isPositive: true }}
          />
          <KPICard 
            label="Risco de Saída"
            value="3"
            icon={<AlertTriangle className="w-6 h-6" />}
            color="var(--error-500)"
            trend={{ value: 1, isPositive: false }}
          />
          <KPICard 
            label="Vagas Abertas"
            value="5"
            icon={<FileText className="w-6 h-6" />}
            color="var(--warning-500)"
          />
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar colaborador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 rounded-xl border"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)'
              }}
            />
            <Search 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
              style={{ color: 'var(--text-tertiary)' }}
            />
          </div>

          <div className="flex gap-2">
            {['all', 'low', 'medium', 'high'].map((risk) => (
              <button
                key={risk}
                onClick={() => setFilterRisk(risk as any)}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                style={{
                  backgroundColor: filterRisk === risk ? 'var(--primary-500)' : 'var(--bg-primary)',
                  color: filterRisk === risk ? 'white' : 'var(--text-secondary)',
                  border: `1px solid ${filterRisk === risk ? 'var(--primary-500)' : 'var(--border-light)'}`
                }}
              >
                {risk === 'all' ? 'Todos' : risk === 'low' ? 'Baixo Risco' : risk === 'medium' ? 'Médio Risco' : 'Alto Risco'}
              </button>
            ))}
          </div>
        </div>

        {/* Employees Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((employee, index) => {
            const risk = getRiskBadge(employee.riskLevel);
            
            return (
              <motion.div
                key={employee.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                onClick={() => setSelectedEmployee(employee)}
                className="rounded-xl p-5 border cursor-pointer transition-all"
                style={{ 
                  backgroundColor: 'var(--bg-primary)',
                  borderColor: employee.riskLevel === 'high' ? 'var(--error-300)' : 'var(--border-light)'
                }}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={employee.avatar}
                      alt={employee.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {employee.name}
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {employee.role}
                      </p>
                    </div>
                  </div>
                  <span 
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{ backgroundColor: risk.bg, color: risk.color }}
                  >
                    Risco {risk.label}
                  </span>
                </div>

                {/* Scores */}
                <div className="space-y-3">
                  <ScoreBar 
                    label="Retenção" 
                    value={employee.retentionScore} 
                    color={getScoreColor(employee.retentionScore)}
                  />
                  <ScoreBar 
                    label="Engajamento" 
                    value={employee.engagementScore} 
                    color={getScoreColor(employee.engagementScore)}
                  />
                  <ScoreBar 
                    label="Performance" 
                    value={employee.performanceScore} 
                    color={getScoreColor(employee.performanceScore)}
                  />
                </div>

                {/* DISC Mini Chart */}
                <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
                  <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-tertiary)' }}>
                    Perfil DISC
                  </p>
                  <div className="flex gap-2">
                    {Object.entries(employee.discProfile).map(([key, value]) => (
                      <div key={key} className="flex-1 text-center">
                        <div 
                          className="h-8 rounded mb-1 flex items-end justify-center"
                          style={{ backgroundColor: 'var(--bg-secondary)' }}
                        >
                          <div 
                            className="w-full rounded"
                            style={{ 
                              height: `${value}%`,
                              backgroundColor: key === 'D' ? '#EF4444' : key === 'I' ? '#F59E0B' : key === 'S' ? '#10B981' : '#3B82F6'
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                          {key}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alert if high risk */}
                {employee.riskLevel === 'high' && (
                  <div 
                    className="mt-4 p-3 rounded-lg flex items-start gap-2"
                    style={{ backgroundColor: 'var(--error-100)' }}
                  >
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--error-600)' }} />
                    <div>
                      <p className="text-xs font-medium" style={{ color: 'var(--error-700)' }}>
                        Engajamento em queda
                      </p>
                      <p className="text-xs" style={{ color: 'var(--error-600)' }}>
                        Sugestão: Agendar 1:1 para entender momento
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Test Modal */}
        {showTest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowTest(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6"
              style={{ backgroundColor: 'var(--bg-primary)' }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  Teste DISC
                </h2>
                <button
                  onClick={() => setShowTest(false)}
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: 'var(--bg-secondary)' }}
                >
                  ✕
                </button>
              </div>
              <BehavioralTests 
                testType="disc" 
                onComplete={(results) => {
                  console.log('Resultados:', results);
                }}
              />
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

// KPI Card Component
function KPICard({ label, value, icon, color, trend }: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  trend?: { value: number; isPositive: boolean };
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-xl p-5 border"
      style={{ 
        backgroundColor: 'var(--bg-primary)',
        borderColor: 'var(--border-light)'
      }}
    >
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {icon}
      </div>
      <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
      <div className="flex items-center justify-between mt-1">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</p>
        {trend && (
          <span 
            className="text-xs font-medium flex items-center gap-0.5"
            style={{ color: trend.isPositive ? 'var(--success-500)' : 'var(--error-500)' }}
          >
            {trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend.value}
          </span>
        )}
      </div>
    </motion.div>
  );
}

// Score Bar Component
function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span className="text-xs font-medium" style={{ color }}>{value}%</span>
      </div>
      <div 
        className="h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5 }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}






