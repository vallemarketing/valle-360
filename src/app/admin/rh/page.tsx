'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Brain, Target, TrendingUp, TrendingDown,
  AlertTriangle, Award, Calendar, FileText, Plus,
  Search, Filter, ChevronRight, BarChart3, Building2, ArrowRight,
  X, Sparkles, Briefcase, MapPin, DollarSign, Clock, CheckCircle,
  Linkedin, Globe, Heart
} from 'lucide-react';
import { BehavioralTests } from '@/components/rh/BehavioralTests';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

// Roteiro de Entrevista
const INTERVIEW_SCRIPT = [
  { 
    category: 'Apresentação',
    questions: [
      { id: 'intro1', text: 'Conte-me sobre sua trajetória profissional.', tip: 'Observe clareza na comunicação e estrutura do pensamento' },
      { id: 'intro2', text: 'O que te atraiu para esta oportunidade?', tip: 'Avalie motivação genuína e pesquisa sobre a empresa' },
    ]
  },
  {
    category: 'Experiência',
    questions: [
      { id: 'exp1', text: 'Descreva um projeto de que você tem orgulho. Qual foi seu papel?', tip: 'Foco em resultados e contribuição individual' },
      { id: 'exp2', text: 'Conte sobre uma situação desafiadora que você superou no trabalho.', tip: 'Metodologia STAR: Situação, Tarefa, Ação, Resultado' },
      { id: 'exp3', text: 'Como você lida com prazos apertados e múltiplas prioridades?', tip: 'Habilidades de organização e gestão de tempo' },
    ]
  },
  {
    category: 'Comportamental',
    questions: [
      { id: 'behav1', text: 'Como você prefere trabalhar: sozinho ou em equipe?', tip: 'Alinhamento com a cultura da empresa' },
      { id: 'behav2', text: 'Conte sobre um conflito no trabalho e como você o resolveu.', tip: 'Inteligência emocional e resolução de conflitos' },
      { id: 'behav3', text: 'Como você lida com feedback negativo?', tip: 'Capacidade de aprendizado e crescimento' },
    ]
  },
  {
    category: 'Fit Cultural',
    questions: [
      { id: 'fit1', text: 'Quais são seus valores profissionais mais importantes?', tip: 'Compare com os valores da empresa' },
      { id: 'fit2', text: 'Como você se mantém atualizado na sua área?', tip: 'Proatividade e busca por conhecimento' },
      { id: 'fit3', text: 'O que você espera da empresa e do gestor?', tip: 'Expectativas e maturidade profissional' },
    ]
  },
  {
    category: 'Fechamento',
    questions: [
      { id: 'close1', text: 'Você tem alguma dúvida sobre a vaga ou a empresa?', tip: 'Qualidade das perguntas indica interesse real' },
      { id: 'close2', text: 'Qual sua disponibilidade para início?', tip: 'Verifique compatibilidade com as necessidades' },
      { id: 'close3', text: 'Há algo mais que gostaria de compartilhar?', tip: 'Espaço para informações adicionais relevantes' },
    ]
  }
];

export default function RHPage() {
  const router = useRouter();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showTest, setShowTest] = useState(false);
  const [showInterviewScript, setShowInterviewScript] = useState(false);
  const [showNewJob, setShowNewJob] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [checkedQuestions, setCheckedQuestions] = useState<Record<string, boolean>>({});
  const [questionNotes, setQuestionNotes] = useState<Record<string, string>>({});
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  
  // Formulário de nova vaga (baseado em campos do LinkedIn)
  const [jobForm, setJobForm] = useState({
    title: '',
    description: '',
    department: '',
    employment_type: 'full_time', // full_time, part_time, contract, internship
    workplace_type: 'hybrid', // on_site, remote, hybrid
    location: '',
    experience_level: 'mid_senior', // internship, entry, associate, mid_senior, director, executive
    skills: [] as string[],
    salary_min: '',
    salary_max: '',
    benefits: [] as string[],
    application_deadline: '',
    number_of_positions: '1',
  });

  const employmentTypes = [
    { id: 'full_time', label: 'Tempo Integral' },
    { id: 'part_time', label: 'Meio Período' },
    { id: 'contract', label: 'Contrato' },
    { id: 'internship', label: 'Estágio' },
    { id: 'freelance', label: 'Freelancer' },
  ];

  const workplaceTypes = [
    { id: 'on_site', label: 'Presencial', icon: '🏢' },
    { id: 'remote', label: 'Remoto', icon: '🏠' },
    { id: 'hybrid', label: 'Híbrido', icon: '🔄' },
  ];

  const experienceLevels = [
    { id: 'internship', label: 'Estágio' },
    { id: 'entry', label: 'Júnior' },
    { id: 'associate', label: 'Associado' },
    { id: 'mid_senior', label: 'Pleno/Sênior' },
    { id: 'director', label: 'Diretor' },
    { id: 'executive', label: 'Executivo' },
  ];

  const commonSkills = [
    'Social Media', 'Design Gráfico', 'Tráfego Pago', 'Copywriting', 'Video Editing',
    'Photoshop', 'Figma', 'Google Ads', 'Meta Ads', 'SEO', 'WordPress', 'Canva'
  ];

  const commonBenefits = [
    'Vale Alimentação', 'Vale Transporte', 'Plano de Saúde', 'Plano Odontológico',
    'Home Office', 'Horário Flexível', 'Day Off Aniversário', 'Participação nos Lucros',
    'Gympass', 'Auxílio Educação', 'Notebook Empresa'
  ];

  const handleToggleQuestion = (questionId: string) => {
    setCheckedQuestions(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handleNoteChange = (questionId: string, note: string) => {
    setQuestionNotes(prev => ({ ...prev, [questionId]: note }));
  };

  const handleNewJob = () => {
    setShowNewJob(true);
  };

  const handleGenerateDescription = async () => {
    if (!jobForm.title) {
      alert('Preencha o título da vaga primeiro');
      return;
    }
    
    setIsGeneratingDescription(true);
    
    // Simular geração de descrição com IA
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const generatedDescription = `**Sobre a Vaga:**
Estamos buscando um(a) ${jobForm.title} talentoso(a) para integrar nossa equipe de ${jobForm.department || 'Marketing Digital'}. Se você é apaixonado(a) por resultados e inovação, esta oportunidade é para você!

**Responsabilidades:**
• Desenvolver e executar estratégias de ${jobForm.title.toLowerCase()}
• Colaborar com a equipe para atingir metas e KPIs
• Analisar métricas e propor melhorias contínuas
• Manter-se atualizado(a) sobre tendências do mercado
• Participar de reuniões de planejamento e apresentação de resultados

**O que buscamos:**
• Experiência comprovada na área
• Perfil proativo e orientado a resultados
• Excelente comunicação e trabalho em equipe
• Organização e gestão de prioridades
• Conhecimento das principais ferramentas do mercado

**Diferenciais:**
• Certificações na área
• Experiência em agências de marketing
• Portfólio de projetos anteriores

Venha fazer parte de uma equipe que transforma negócios através do marketing digital! 🚀`;

    setJobForm(prev => ({ ...prev, description: generatedDescription }));
    setIsGeneratingDescription(false);
  };

  const handleCreateJob = () => {
    if (!jobForm.title || !jobForm.description) {
      alert('Preencha os campos obrigatórios');
      return;
    }
    
    alert('✅ Vaga criada com sucesso! A vaga está pronta para publicação no LinkedIn.');
    setShowNewJob(false);
    setJobForm({
      title: '', description: '', department: '', employment_type: 'full_time',
      workplace_type: 'hybrid', location: '', experience_level: 'mid_senior',
      skills: [], salary_min: '', salary_max: '', benefits: [],
      application_deadline: '', number_of_positions: '1'
    });
  };

  const toggleSkill = (skill: string) => {
    setJobForm(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const toggleBenefit = (benefit: string) => {
    setJobForm(prev => ({
      ...prev,
      benefits: prev.benefits.includes(benefit)
        ? prev.benefits.filter(b => b !== benefit)
        : [...prev.benefits, benefit]
    }));
  };

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
              onClick={() => router.push('/admin/rh/nine-box')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-white"
              style={{ backgroundColor: 'var(--primary-500)' }}
            >
              <BarChart3 className="w-4 h-4" />
              9 Box
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowInterviewScript(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium"
              style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
            >
              <FileText className="w-4 h-4" />
              Roteiro Entrevista
            </motion.button>
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
              onClick={handleNewJob}
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

        {/* Link para Franqueados */}
        <Link href="/admin/franqueados">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all"
            style={{ 
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-light)'
            }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
              >
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Gestão de Franqueados
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Pipeline de candidatos, testes e análise de performance das franquias
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2" style={{ color: 'var(--primary-500)' }}>
              <span className="text-sm font-medium">Acessar</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>
        </Link>

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
                  Teste DISC (10 perguntas)
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

        {/* Roteiro de Entrevista Modal */}
        {showInterviewScript && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowInterviewScript(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-6"
              style={{ backgroundColor: 'var(--bg-primary)' }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'var(--primary-100)' }}
                  >
                    <FileText className="w-5 h-5" style={{ color: 'var(--primary-500)' }} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                      Roteiro de Entrevista
                    </h2>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Clique nas perguntas para marcar como feitas
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInterviewScript(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                  style={{ backgroundColor: 'var(--bg-secondary)' }}
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {INTERVIEW_SCRIPT.map((section, sectionIdx) => (
                  <div key={sectionIdx}>
                    <h3 
                      className="font-semibold mb-3 flex items-center gap-2"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-sm text-white"
                        style={{ backgroundColor: 'var(--primary-500)' }}>
                        {sectionIdx + 1}
                      </span>
                      {section.category}
                    </h3>
                    <div className="space-y-3">
                      {section.questions.map((question) => (
                        <div 
                          key={question.id}
                          className={`p-4 rounded-xl border transition-all cursor-pointer ${
                            checkedQuestions[question.id] ? 'border-green-500 bg-green-50' : ''
                          }`}
                          style={{ 
                            backgroundColor: checkedQuestions[question.id] ? 'var(--success-100)' : 'var(--bg-secondary)',
                            borderColor: checkedQuestions[question.id] ? 'var(--success-500)' : 'var(--border-light)'
                          }}
                          onClick={() => handleToggleQuestion(question.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div 
                              className={`w-5 h-5 rounded-full flex items-center justify-center border-2 flex-shrink-0 mt-0.5 ${
                                checkedQuestions[question.id] ? 'bg-green-500 border-green-500' : 'border-gray-300'
                              }`}
                            >
                              {checkedQuestions[question.id] && (
                                <Award className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p 
                                className={`font-medium ${checkedQuestions[question.id] ? 'line-through opacity-60' : ''}`}
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {question.text}
                              </p>
                              <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
                                💡 {question.tip}
                              </p>
                              <textarea
                                placeholder="Anotações sobre a resposta..."
                                value={questionNotes[question.id] || ''}
                                onChange={(e) => handleNoteChange(question.id, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="mt-2 w-full p-2 text-sm rounded-lg border resize-none"
                                style={{ 
                                  backgroundColor: 'var(--bg-primary)',
                                  borderColor: 'var(--border-light)',
                                  color: 'var(--text-primary)'
                                }}
                                rows={2}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-light)' }}>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {Object.values(checkedQuestions).filter(Boolean).length} de {INTERVIEW_SCRIPT.reduce((acc, s) => acc + s.questions.length, 0)} perguntas feitas
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setCheckedQuestions({});
                      setQuestionNotes({});
                    }}
                    className="px-4 py-2 rounded-lg"
                    style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  >
                    Limpar
                  </button>
                  <button
                    onClick={() => {
                      alert('✅ Roteiro salvo! Notas exportadas para o perfil do candidato.');
                      setShowInterviewScript(false);
                    }}
                    className="px-4 py-2 rounded-lg text-white"
                    style={{ backgroundColor: 'var(--primary-500)' }}
                  >
                    Salvar Avaliação
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Modal Nova Vaga */}
        <AnimatePresence>
          {showNewJob && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
              onClick={() => setShowNewJob(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-hidden"
              >
                <div className="p-6 border-b flex items-center justify-between bg-gradient-to-r from-blue-500 to-indigo-600">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Nova Vaga</h2>
                      <p className="text-sm text-white/80 flex items-center gap-1">
                        <Linkedin className="w-4 h-4" /> Campos baseados na API LinkedIn
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowNewJob(false)} className="text-white hover:bg-white/20">
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="p-6 overflow-auto max-h-[60vh] space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Título da Vaga *</label>
                      <input
                        type="text"
                        value={jobForm.title}
                        onChange={(e) => setJobForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Ex: Social Media Manager"
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Departamento</label>
                      <select
                        value={jobForm.department}
                        onChange={(e) => setJobForm(prev => ({ ...prev, department: e.target.value }))}
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Selecione...</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Design">Design</option>
                        <option value="Performance">Performance</option>
                        <option value="Comercial">Comercial</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Descrição da Vaga *</label>
                      <Button variant="outline" size="sm" onClick={handleGenerateDescription} disabled={isGeneratingDescription} className="text-purple-600 border-purple-200 hover:bg-purple-50">
                        {isGeneratingDescription ? (<><div className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mr-2" />Gerando...</>) : (<><Sparkles className="w-4 h-4 mr-2" />Gerar com IA</>)}
                      </Button>
                    </div>
                    <textarea value={jobForm.description} onChange={(e) => setJobForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Descreva a vaga..." rows={6} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Modelo de Trabalho</label>
                      <div className="grid grid-cols-3 gap-2">
                        {workplaceTypes.map((type) => (
                          <button key={type.id} onClick={() => setJobForm(prev => ({ ...prev, workplace_type: type.id }))} className={`p-3 rounded-lg border text-center transition-all ${jobForm.workplace_type === type.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                            <span className="text-xl block mb-1">{type.icon}</span>
                            <span className="text-xs">{type.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Nível de Experiência</label>
                      <select value={jobForm.experience_level} onChange={(e) => setJobForm(prev => ({ ...prev, experience_level: e.target.value }))} className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500">
                        {experienceLevels.map((level) => (<option key={level.id} value={level.id}>{level.label}</option>))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-1"><MapPin className="w-4 h-4" /> Localização</label>
                      <input type="text" value={jobForm.location} onChange={(e) => setJobForm(prev => ({ ...prev, location: e.target.value }))} placeholder="São Paulo, SP" className="w-full p-3 rounded-xl border border-gray-200" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-1"><DollarSign className="w-4 h-4" /> Faixa Salarial</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" value={jobForm.salary_min} onChange={(e) => setJobForm(prev => ({ ...prev, salary_min: e.target.value }))} placeholder="Mín: R$ 3.000" className="w-full p-3 rounded-xl border border-gray-200" />
                        <input type="text" value={jobForm.salary_max} onChange={(e) => setJobForm(prev => ({ ...prev, salary_max: e.target.value }))} placeholder="Máx: R$ 5.000" className="w-full p-3 rounded-xl border border-gray-200" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Habilidades Requeridas</label>
                    <div className="flex flex-wrap gap-2">
                      {commonSkills.map((skill) => (
                        <button key={skill} onClick={() => toggleSkill(skill)} className={`px-3 py-1 rounded-full text-sm transition-all ${jobForm.skills.includes(skill) ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{skill}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-1"><Heart className="w-4 h-4" /> Benefícios</label>
                    <div className="flex flex-wrap gap-2">
                      {commonBenefits.map((benefit) => (
                        <button key={benefit} onClick={() => toggleBenefit(benefit)} className={`px-3 py-1 rounded-full text-sm transition-all ${jobForm.benefits.includes(benefit) ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{benefit}</button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t bg-gray-50 flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setShowNewJob(false)}>Cancelar</Button>
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={handleCreateJob}><CheckCircle className="w-4 h-4 mr-2" />Criar Vaga</Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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









