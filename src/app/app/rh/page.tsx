'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Clock,
  Calendar,
  Briefcase,
  Award,
  TrendingUp,
  FileText,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Plus,
  Download,
  BarChart3,
  Target,
  Activity,
} from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: 'marketing' | 'design' | 'dev' | 'comercial' | 'financeiro' | 'admin';
  hireDate: string;
  salary: number;
  status: 'active' | 'vacation' | 'leave' | 'inactive';
  performance: number;
  completedTasks: number;
  avatar?: string;
}

interface TimeOffRequest {
  id: string;
  employeeName: string;
  type: 'ferias' | 'atestado' | 'licenca' | 'folga';
  startDate: string;
  endDate: string;
  days: number;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
}

interface HRMetrics {
  totalEmployees: number;
  activeEmployees: number;
  onVacation: number;
  newHires: number;
  turnoverRate: number;
  avgPerformance: number;
  pendingRequests: number;
  totalPayroll: number;
}

export default function RHPage() {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedTab, setSelectedTab] = useState<'employees' | 'requests' | 'performance'>('employees');

  const employees: Employee[] = [
    {
      id: '1',
      name: 'João Silva',
      email: 'joao@valle360.com',
      phone: '(11) 98765-4321',
      role: 'Designer Gráfico',
      department: 'design',
      hireDate: '15/01/2024',
      salary: 5000,
      status: 'active',
      performance: 92,
      completedTasks: 148,
    },
    {
      id: '2',
      name: 'Ana Lima',
      email: 'ana@valle360.com',
      phone: '(11) 91234-5678',
      role: 'Web Designer',
      department: 'dev',
      hireDate: '20/03/2024',
      salary: 6000,
      status: 'active',
      performance: 88,
      completedTasks: 132,
    },
    {
      id: '3',
      name: 'Carlos Vendas',
      email: 'carlos@valle360.com',
      phone: '(11) 99876-5432',
      role: 'Gerente Comercial',
      department: 'comercial',
      hireDate: '10/02/2024',
      salary: 7500,
      status: 'active',
      performance: 95,
      completedTasks: 89,
    },
    {
      id: '4',
      name: 'Maria Santos',
      email: 'maria@valle360.com',
      phone: '(11) 97654-3210',
      role: 'Social Media',
      department: 'marketing',
      hireDate: '05/04/2024',
      salary: 4500,
      status: 'vacation',
      performance: 85,
      completedTasks: 156,
    },
    {
      id: '5',
      name: 'Pedro Costa',
      email: 'pedro@valle360.com',
      phone: '(11) 96543-2109',
      role: 'Videomaker',
      department: 'marketing',
      hireDate: '01/05/2024',
      salary: 5500,
      status: 'active',
      performance: 90,
      completedTasks: 78,
    },
  ];

  const timeOffRequests: TimeOffRequest[] = [
    {
      id: '1',
      employeeName: 'Maria Santos',
      type: 'ferias',
      startDate: '10/11/2025',
      endDate: '20/11/2025',
      days: 10,
      status: 'approved',
      reason: 'Férias programadas',
    },
    {
      id: '2',
      employeeName: 'João Silva',
      type: 'atestado',
      startDate: '08/11/2025',
      endDate: '09/11/2025',
      days: 2,
      status: 'pending',
      reason: 'Consulta médica',
    },
    {
      id: '3',
      employeeName: 'Ana Lima',
      type: 'folga',
      startDate: '15/11/2025',
      endDate: '15/11/2025',
      days: 1,
      status: 'pending',
    },
  ];

  const metrics: HRMetrics = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter(e => e.status === 'active').length,
    onVacation: employees.filter(e => e.status === 'vacation').length,
    newHires: 2,
    turnoverRate: 8.5,
    avgPerformance: Math.round(employees.reduce((sum, e) => sum + e.performance, 0) / employees.length),
    pendingRequests: timeOffRequests.filter(r => r.status === 'pending').length,
    totalPayroll: employees.reduce((sum, e) => sum + e.salary, 0),
  };

  const filteredEmployees = selectedFilter === 'all'
    ? employees
    : employees.filter(e => e.department === selectedFilter);

  const getStatusBadge = (status: string) => {
    const variants = {
      active: { label: 'Ativo', color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200', icon: <CheckCircle className="w-3 h-3" /> },
      vacation: { label: 'Férias', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200', icon: <Calendar className="w-3 h-3" /> },
      leave: { label: 'Licença', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200', icon: <Clock className="w-3 h-3" /> },
      inactive: { label: 'Inativo', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', icon: <UserX className="w-3 h-3" /> },
    };
    const variant = variants[status as keyof typeof variants];
    return (
      <Badge className={`${variant.color} flex items-center gap-1`}>
        {variant.icon}
        {variant.label}
      </Badge>
    );
  };

  const getRequestStatusBadge = (status: string) => {
    const variants = {
      pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-3 h-3" /> },
      approved: { label: 'Aprovado', color: 'bg-green-100 text-green-700', icon: <CheckCircle className="w-3 h-3" /> },
      rejected: { label: 'Rejeitado', color: 'bg-red-100 text-red-700', icon: <AlertCircle className="w-3 h-3" /> },
    };
    const variant = variants[status as keyof typeof variants];
    return (
      <Badge className={`${variant.color} flex items-center gap-1`}>
        {variant.icon}
        {variant.label}
      </Badge>
    );
  };

  const getDepartmentIcon = (department: string) => {
    switch (department) {
      case 'marketing':
        return <TrendingUp className="w-4 h-4" />;
      case 'design':
        return <Award className="w-4 h-4" />;
      case 'dev':
        return <Activity className="w-4 h-4" />;
      case 'comercial':
        return <Target className="w-4 h-4" />;
      case 'financeiro':
        return <DollarSign className="w-4 h-4" />;
      default:
        return <Briefcase className="w-4 h-4" />;
    }
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'text-green-600';
    if (performance >= 75) return 'text-blue-600';
    if (performance >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard - RH</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gestão de colaboradores, performance e solicitações
          </p>
        </div>
        <Button className="bg-orange-600 hover:bg-orange-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Colaborador
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">Total de Colaboradores</p>
                <p className="text-3xl font-bold text-blue-600">{metrics.totalEmployees}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Ativos: {metrics.activeEmployees}</p>
              </div>
              <Users className="w-10 h-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 dark:text-green-300 mb-1">Novas Contratações</p>
                <p className="text-3xl font-bold text-green-600">{metrics.newHires}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">Este mês</p>
              </div>
              <UserPlus className="w-10 h-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 dark:text-orange-300 mb-1">Solicitações Pendentes</p>
                <p className="text-3xl font-bold text-orange-600">{metrics.pendingRequests}</p>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Requer aprovação</p>
              </div>
              <Clock className="w-10 h-10 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 dark:text-purple-300 mb-1">Performance Média</p>
                <p className="text-3xl font-bold text-purple-600">{metrics.avgPerformance}%</p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Geral do time</p>
              </div>
              <Award className="w-10 h-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Folha de Pagamento</span>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              R$ {metrics.totalPayroll.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total mensal</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Em Férias</span>
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.onVacation}</p>
            <p className="text-xs text-blue-600 mt-1">Colaboradores</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Taxa de Turnover</span>
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.turnoverRate}%</p>
            <p className="text-xs text-orange-600 mt-1">Últimos 12 meses</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <Button
          variant={selectedTab === 'employees' ? 'default' : 'ghost'}
          onClick={() => setSelectedTab('employees')}
          className={selectedTab === 'employees' ? 'bg-orange-600 hover:bg-orange-700' : ''}
        >
          <Users className="w-4 h-4 mr-2" />
          Colaboradores ({employees.length})
        </Button>
        <Button
          variant={selectedTab === 'requests' ? 'default' : 'ghost'}
          onClick={() => setSelectedTab('requests')}
          className={selectedTab === 'requests' ? 'bg-orange-600 hover:bg-orange-700' : ''}
        >
          <FileText className="w-4 h-4 mr-2" />
          Solicitações ({metrics.pendingRequests})
        </Button>
        <Button
          variant={selectedTab === 'performance' ? 'default' : 'ghost'}
          onClick={() => setSelectedTab('performance')}
          className={selectedTab === 'performance' ? 'bg-orange-600 hover:bg-orange-700' : ''}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Performance
        </Button>
      </div>

      {selectedTab === 'employees' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Equipe</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Todos os colaboradores ativos
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant={selectedFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setSelectedFilter('all')}
                  className={selectedFilter === 'all' ? 'bg-orange-600' : ''}
                >
                  Todos
                </Button>
                <Button
                  size="sm"
                  variant={selectedFilter === 'marketing' ? 'default' : 'outline'}
                  onClick={() => setSelectedFilter('marketing')}
                  className={selectedFilter === 'marketing' ? 'bg-orange-600' : ''}
                >
                  Marketing
                </Button>
                <Button
                  size="sm"
                  variant={selectedFilter === 'design' ? 'default' : 'outline'}
                  onClick={() => setSelectedFilter('design')}
                  className={selectedFilter === 'design' ? 'bg-orange-600' : ''}
                >
                  Design
                </Button>
                <Button
                  size="sm"
                  variant={selectedFilter === 'comercial' ? 'default' : 'outline'}
                  onClick={() => setSelectedFilter('comercial')}
                  className={selectedFilter === 'comercial' ? 'bg-orange-600' : ''}
                >
                  Comercial
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredEmployees.map((employee) => (
                <Card key={employee.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg">
                          {employee.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{employee.name}</h3>
                            {getStatusBadge(employee.status)}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{employee.role}</p>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              <span>{employee.email}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              <span>{employee.phone}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>Admissão: {employee.hireDate}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-xs">
                              {getDepartmentIcon(employee.department)}
                              <span className="ml-1 capitalize">{employee.department}</span>
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <DollarSign className="w-3 h-3" />
                              <span className="ml-1">R$ {employee.salary.toLocaleString()}</span>
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle className="w-3 h-3" />
                              <span className="ml-1">{employee.completedTasks} tarefas</span>
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-3xl font-bold ${getPerformanceColor(employee.performance)}`}>
                          {employee.performance}%
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Performance</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          employee.performance >= 90
                            ? 'bg-green-600'
                            : employee.performance >= 75
                            ? 'bg-blue-600'
                            : 'bg-orange-600'
                        }`}
                        style={{ width: `${employee.performance}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedTab === 'requests' && (
        <Card className="border-2 border-orange-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-orange-900 dark:text-orange-200">Solicitações de Ausência</CardTitle>
                <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                  Férias, licenças e afastamentos
                </p>
              </div>
              <Badge className="bg-orange-600 text-white text-lg px-3 py-1">
                {metrics.pendingRequests}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {timeOffRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{request.employeeName}</h3>
                            <Badge variant="outline" className="text-xs capitalize">{request.type}</Badge>
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{request.startDate} até {request.endDate}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{request.days} dia{request.days > 1 ? 's' : ''}</span>
                            </div>
                          </div>
                          {request.reason && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                              {request.reason}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getRequestStatusBadge(request.status)}
                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Aprovar
                            </Button>
                            <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                              Rejeitar
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedTab === 'performance' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance por Departamento</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Média de performance - Novembro 2025
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { dept: 'Comercial', avg: 95, employees: 1, color: 'bg-green-600' },
                  { dept: 'Design', avg: 92, employees: 1, color: 'bg-green-600' },
                  { dept: 'Marketing', avg: 87.5, employees: 2, color: 'bg-blue-600' },
                  { dept: 'Desenvolvimento', avg: 88, employees: 1, color: 'bg-blue-600' },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.dept}</span>
                      <div className="text-right">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">{item.avg}%</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400 ml-2">({item.employees} colaboradores)</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className={`${item.color} h-3 rounded-full transition-all`}
                        style={{ width: `${item.avg}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Melhores avaliações do mês
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {employees
                    .sort((a, b) => b.performance - a.performance)
                    .slice(0, 3)
                    .map((emp, index) => (
                      <div key={emp.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-400 text-yellow-900' :
                          index === 1 ? 'bg-gray-300 text-gray-700' :
                          'bg-orange-300 text-orange-900'
                        }`}>
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{emp.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{emp.role}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">{emp.performance}%</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{emp.completedTasks} tarefas</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas do Time</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Novembro 2025
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tarefas Concluídas</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">603</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Engajamento</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">94%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Satisfação</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">88%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '88%' }}></div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-2">
                    <Download className="w-4 h-4 mr-2" />
                    Baixar Relatório Completo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
