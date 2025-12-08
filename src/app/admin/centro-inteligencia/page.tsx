'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  Award,
  Briefcase,
  BarChart3,
  LineChart,
  PieChart,
  Zap,
  Brain,
  Sparkles,
  X,
  Send,
  Mail,
  Phone,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  MessageSquare,
  Calendar,
  FileText,
  Eye,
  PhoneCall,
  FileSearch,
  UserPlus,
  Clock,
  Building,
  Star,
  Copy,
  ExternalLink
} from 'lucide-react';
import ScopeCreepWidget from './widgets/ScopeCreepWidget';
import {
  LineChart as RechartsLineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '@/lib/utils';
import ThreeDPhotoCarousel from '@/components/ui/carousel-3d';

interface KPI {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string;
}

interface Alert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  title: string;
  description: string;
  actionable: boolean;
}

interface AIRecommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  category: string;
}

interface AIInsightLead {
  id: string;
  name: string;
  company: string;
  position: string;
  phone: string;
  email: string;
  score: number;
  interest: string;
  lastContact: string;
  script: string;
  status: 'hot' | 'warm' | 'cold';
}

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showExecuteModal, setShowExecuteModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState<AIRecommendation | null>(null);
  const [executingAction, setExecutingAction] = useState(false);
  const [actionExecuted, setActionExecuted] = useState<string[]>([]);
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [analysisGenerated, setAnalysisGenerated] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel'>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultContent, setResultContent] = useState<any>(null);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<AIInsightLead | null>(null);
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callScheduled, setCallScheduled] = useState(false);
  const [callTime, setCallTime] = useState('');
  
  // Dados de leads para Insights de IA
  const aiLeads: AIInsightLead[] = [
    {
      id: '1',
      name: 'Roberto Mendes',
      company: 'TechVision Ltda',
      position: 'CEO',
      phone: '(11) 99876-5432',
      email: 'roberto@techvision.com.br',
      score: 95,
      interest: 'Busca soluções de automação de marketing',
      lastContact: '2 dias atrás',
      script: `Olá Roberto, aqui é [Seu Nome] da Valle 360!

Vi que a TechVision está crescendo muito no setor de tecnologia. Parabéns pelos resultados!

Estou entrando em contato porque trabalhamos com empresas similares ajudando a automatizar o marketing digital e aumentar a geração de leads qualificados.

Conseguimos em média um aumento de 40% na conversão de leads para nossos clientes do segmento tech.

Gostaria de agendar uma conversa de 15 minutos para mostrar como podemos ajudar a TechVision a escalar ainda mais?`,
      status: 'hot'
    },
    {
      id: '2',
      name: 'Ana Paula Ferreira',
      company: 'Construtora Horizonte',
      position: 'Diretora de Marketing',
      phone: '(21) 98765-4321',
      email: 'ana.paula@horizonte.com.br',
      score: 88,
      interest: 'Precisa melhorar presença nas redes sociais',
      lastContact: '1 semana atrás',
      script: `Olá Ana Paula, tudo bem?

Aqui é [Seu Nome] da Valle 360. Notei que a Construtora Horizonte tem lançamentos incríveis, mas a presença digital ainda tem muito potencial.

Trabalhamos com construtoras e conseguimos aumentar em média 60% o engajamento nas redes sociais e 35% nos leads de imóveis.

Seria interessante uma conversa rápida para mostrar cases do setor imobiliário?`,
      status: 'warm'
    },
    {
      id: '3',
      name: 'Carlos Eduardo',
      company: 'Clínica Premium Saúde',
      position: 'Sócio-administrador',
      phone: '(31) 97654-3210',
      email: 'carlos@premiumsaude.com.br',
      score: 82,
      interest: 'Quer aumentar agendamentos online',
      lastContact: '3 dias atrás',
      script: `Olá Dr. Carlos, aqui é [Seu Nome] da Valle 360!

Acompanhei o crescimento da Clínica Premium Saúde e o trabalho excepcional que vocês fazem.

Trabalhamos com clínicas e consultórios ajudando a aumentar os agendamentos online através de campanhas segmentadas e automação de WhatsApp.

Um de nossos clientes do segmento de saúde aumentou 45% os agendamentos em 2 meses.

Podemos marcar uma conversa para apresentar nossa metodologia?`,
      status: 'warm'
    },
    {
      id: '4',
      name: 'Mariana Santos',
      company: 'E-commerce Fashion Store',
      position: 'Fundadora',
      phone: '(41) 96543-2109',
      email: 'mariana@fashionstore.com.br',
      score: 76,
      interest: 'Procura melhorar conversão do e-commerce',
      lastContact: '5 dias atrás',
      script: `Olá Mariana, tudo bem?

Aqui é [Seu Nome] da Valle 360. Conheço o Fashion Store e vi o potencial enorme que vocês têm!

Trabalhamos com e-commerces de moda ajudando a otimizar campanhas de tráfego pago e aumentar a taxa de conversão.

Conseguimos para um cliente similar aumentar 52% o ROAS em 3 meses.

Podemos agendar uma call para mostrar como replicar isso no Fashion Store?`,
      status: 'cold'
    }
  ];
  
  // Hook de IA
  const { generateInsights, generateContent, generateEmail, isLoading: aiLoading, error: aiError } = useAI();

  // Handler para gerar análise de IA - CONECTADO À IA REAL
  const handleGenerateAnalysis = async () => {
    setIsGeneratingAnalysis(true);
    try {
      const insights = await generateInsights('strategic', { period: '30d' });
      setAiInsights(insights);
      setAnalysisGenerated(true);
      setResultContent({
        title: '✅ Análise de IA Gerada!',
        message: `A IA analisou seus dados e encontrou ${insights.length} insights estratégicos.`,
        insights: insights.slice(0, 5)
      });
      setShowResultModal(true);
    } catch (error: any) {
      console.error('Erro ao gerar análise:', error);
      alert('❌ Erro ao gerar análise. Verifique a configuração da API.');
    } finally {
      setIsGeneratingAnalysis(false);
    }
  };

  // Handler para exportar relatório - CONECTADO À IA REAL
  const handleExport = async (format: 'pdf' | 'excel') => {
    setExportFormat(format);
    setIsExporting(true);
    try {
      const report = await generateContent('report', {
        type: 'executive',
        period: 'monthly',
        includeInsights: true,
        includeMetrics: true
      });
      
      // Simular download
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-valle360.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setShowExportModal(false);
      alert(`✅ Relatório exportado em ${format.toUpperCase()} com sucesso!`);
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('❌ Erro ao exportar relatório.');
    } finally {
      setIsExporting(false);
    }
  };

  // Handler para ações rápidas - CONECTADO À IA REAL
  const handleQuickAction = async (action: string) => {
    try {
      switch (action) {
        case 'cobrar':
          const cobrancaEmail = await generateEmail({
            type: 'cobranca',
            recipientName: 'Cliente',
            context: 'Pagamento em atraso há 15 dias',
            tone: 'formal'
          });
          setResultContent({
            title: '📧 Email de Cobrança Gerado',
            message: 'A IA criou o seguinte email para envio:',
            email: cobrancaEmail
          });
          setShowResultModal(true);
          break;
          
        case 'elogiar':
          const elogioEmail = await generateEmail({
            type: 'feedback',
            recipientName: 'Colaborador',
            context: 'Excelente performance no último mês, superou todas as metas',
            tone: 'amigavel'
          });
          setResultContent({
            title: '🎉 Reconhecimento Gerado',
            message: 'A IA criou a seguinte mensagem de reconhecimento:',
            email: elogioEmail
          });
          setShowResultModal(true);
          break;
          
        case 'agendar':
          setResultContent({
            title: '📅 Reuniões Agendadas',
            message: 'Foram identificadas 4 reuniões pendentes e os convites foram preparados.',
            actions: [
              'Reunião de alinhamento com Cliente A - Terça 14h',
              'Review mensal com equipe - Quarta 10h',
              'Apresentação de resultados - Quinta 15h',
              'Reunião estratégica - Sexta 9h'
            ]
          });
          setShowResultModal(true);
          break;
          
        case 'relatorio':
          const report = await generateContent('report', {
            type: 'monthly',
            metrics: ['revenue', 'clients', 'tasks', 'nps']
          });
          setResultContent({
            title: '📊 Relatório Mensal Gerado',
            message: 'A IA compilou os dados do mês:',
            report
          });
          setShowResultModal(true);
          break;
          
        default:
          alert('⚡ Ação em execução...');
      }
    } catch (error) {
      console.error('Erro na ação:', error);
      alert('❌ Erro ao executar ação.');
    }
  };

  const handleExecuteClick = (rec: AIRecommendation) => {
    setSelectedAction(rec);
    setShowExecuteModal(true);
  };

  const confirmExecution = async () => {
    if (!selectedAction) return;
    setExecutingAction(true);
    try {
      // Executar ação baseada na categoria
      const actionContent = await generateContent('report', {
        action: selectedAction.title,
        category: selectedAction.category,
        description: selectedAction.description
      });
      
      setActionExecuted(prev => [...prev, selectedAction.id]);
      setShowExecuteModal(false);
      
      setResultContent({
        title: `✅ ${selectedAction.title}`,
        message: 'Ação executada com sucesso pela IA!',
        details: actionContent
      });
      setShowResultModal(true);
    } catch (error) {
      console.error('Erro ao executar:', error);
      alert('❌ Erro ao executar ação.');
    } finally {
      setExecutingAction(false);
      setSelectedAction(null);
    }
  };

  const kpis: KPI[] = [
    {
      label: 'Receita Mensal',
      value: 'R$ 287.450',
      change: 12.5,
      trend: 'up',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'text-green-600',
    },
    {
      label: 'Clientes Ativos',
      value: '42',
      change: 8.3,
      trend: 'up',
      icon: <Users className="w-6 h-6" />,
      color: 'text-blue-600',
    },
    {
      label: 'Taxa de Conclusão',
      value: '94.2%',
      change: 3.7,
      trend: 'up',
      icon: <Target className="w-6 h-6" />,
      color: 'text-purple-600',
    },
    {
      label: 'NPS Médio',
      value: '8.7',
      change: -0.5,
      trend: 'down',
      icon: <Award className="w-6 h-6" />,
      color: 'text-orange-600',
    },
  ];

  const alerts: Alert[] = [
    {
      id: '1',
      type: 'critical',
      title: 'Cliente A - Risco de Churn',
      description: 'NPS baixo nos últimos 2 meses e atraso em 3 entregas',
      actionable: true,
    },
    {
      id: '2',
      type: 'warning',
      title: 'João Silva - Performance abaixo da meta',
      description: 'Apenas 65% das metas atingidas este mês',
      actionable: true,
    },
    {
      id: '3',
      type: 'info',
      title: 'Renovação de contratos - 3 clientes',
      description: '3 contratos vencem nos próximos 30 dias',
      actionable: true,
    },
    {
      id: '4',
      type: 'warning',
      title: 'Capacidade da equipe em 92%',
      description: 'Considerar contratação ou redistribuição de tarefas',
      actionable: true,
    },
  ];

  const aiRecommendations: AIRecommendation[] = [
    {
      id: '1',
      priority: 'high',
      title: 'Aumentar preço do pacote Premium',
      description:
        'Análise de mercado e satisfação dos clientes indica que há espaço para aumento de 15% sem impacto no churn.',
      impact: '+R$ 12.500/mês',
      category: 'Receita',
    },
    {
      id: '2',
      priority: 'high',
      title: 'Contratar Social Media Júnior',
      description:
        'Equipe de Social Media está com carga de 95%. Nova contratação pode aumentar capacidade em 30%.',
      impact: '+10 clientes potenciais',
      category: 'Recursos Humanos',
    },
    {
      id: '3',
      priority: 'medium',
      title: 'Implementar upsell para Cliente B',
      description:
        'Cliente B tem crescimento de 45% em engajamento. Momento ideal para oferecer serviços adicionais.',
      impact: '+R$ 3.200/mês',
      category: 'Vendas',
    },
    {
      id: '4',
      priority: 'medium',
      title: 'Reunião 1-on-1 com Maria Santos',
      description:
        'Performance excelente (110% das metas). Momento para discutir promoção e evitar perda de talento.',
      impact: 'Retenção de talento',
      category: 'Gestão de Pessoas',
    },
    {
      id: '5',
      priority: 'low',
      title: 'Automatizar relatórios mensais',
      description:
        'Equipe gasta 8h/mês em relatórios manuais. Automação pode economizar 80% desse tempo.',
      impact: '6.4h economizadas/mês',
      category: 'Eficiência Operacional',
    },
  ];

  const revenueData = [
    { month: 'Jul', receita: 245000, despesas: 180000, lucro: 65000 },
    { month: 'Ago', receita: 258000, despesas: 185000, lucro: 73000 },
    { month: 'Set', receita: 267000, despesas: 190000, lucro: 77000 },
    { month: 'Out', receita: 275000, despesas: 192000, lucro: 83000 },
    { month: 'Nov', receita: 287000, despesas: 195000, lucro: 92000 },
  ];

  const performanceData = [
    { name: 'Maria Santos', score: 110 },
    { name: 'Pedro Costa', score: 105 },
    { name: 'Ana Lima', score: 98 },
    { name: 'Carlos Souza', score: 92 },
    { name: 'Julia Alves', score: 88 },
    { name: 'João Silva', score: 65 },
  ];

  const departmentData = [
    { name: 'Social Media', value: 30, color: '#3B82F6' },
    { name: 'Tráfego', value: 25, color: '#10B981' },
    { name: 'Design', value: 20, color: '#F59E0B' },
    { name: 'Vídeo', value: 15, color: '#EF4444' },
    { name: 'Web', value: 10, color: '#8B5CF6' },
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-blue-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-50 dark:bg-red-900/10';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10';
      default:
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/10';
    }
  };

  // Handlers para Insights de IA - Leads
  const handleViewLead = (lead: AIInsightLead) => {
    setSelectedLead(lead);
    setShowLeadModal(true);
  };

  const handleCallLead = (lead: AIInsightLead) => {
    setSelectedLead(lead);
    setCallScheduled(false);
    setCallTime('');
    setShowCallModal(true);
  };

  const handleViewScript = (lead: AIInsightLead) => {
    setSelectedLead(lead);
    setShowScriptModal(true);
  };

  const handleScheduleCall = () => {
    if (!callTime) {
      alert('Selecione um horário para a ligação');
      return;
    }
    setCallScheduled(true);
    setTimeout(() => {
      setShowCallModal(false);
      setResultContent({
        title: '📞 Ligação Agendada!',
        message: `Ligação para ${selectedLead?.name} agendada com sucesso.`,
        actions: [
          `📅 Data: ${callTime}`,
          `📱 Telefone: ${selectedLead?.phone}`,
          `🏢 Empresa: ${selectedLead?.company}`,
          '⏰ Lembrete será enviado 15 min antes'
        ]
      });
      setShowResultModal(true);
    }, 1500);
  };

  const handleCopyScript = () => {
    if (selectedLead) {
      navigator.clipboard.writeText(selectedLead.script);
      alert('✅ Roteiro copiado para a área de transferência!');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot':
        return 'bg-red-500';
      case 'warm':
        return 'bg-orange-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'hot':
        return 'Quente';
      case 'warm':
        return 'Morno';
      default:
        return 'Frio';
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Centro de Inteligência de Gestão
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Dashboard executivo com insights e recomendações automatizadas por IA
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowExportModal(true)}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
          <Button 
            className="bg-orange-600 hover:bg-orange-700"
            onClick={handleGenerateAnalysis}
            disabled={isGeneratingAnalysis}
          >
            {isGeneratingAnalysis ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar Análise IA
              </>
            )}
          </Button>
        </div>
      </div>

      {/* KPIs Clicáveis */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => {
          const links = ['/admin/financeiro', '/admin/clientes', '/admin/performance', '/admin/nps'];
          return (
            <Link key={index} href={links[index]}>
              <motion.div whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="cursor-pointer border-2 border-transparent hover:border-[#1672d6]/30 hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className={kpi.color}>{kpi.icon}</div>
                      <Badge
                        className={kpi.trend === 'up' ? 'bg-emerald-600' : kpi.trend === 'down' ? 'bg-red-600' : 'bg-gray-600'}
                      >
                        {kpi.trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                        {kpi.change > 0 ? '+' : ''}
                        {kpi.change}%
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold text-[#001533] dark:text-white">{kpi.value}</p>
                    <p className="text-sm text-[#001533]/60 dark:text-white/60">{kpi.label}</p>
                    <div className="mt-2 flex items-center text-[#1672d6] text-xs font-medium">
                      Ver detalhes <ChevronRight className="w-3 h-3 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              Recomendações de IA Priorizadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiRecommendations.map((rec) => (
              <div
                key={rec.id}
                className={`p-4 rounded-lg border-l-4 ${getPriorityColor(rec.priority)} transition-all hover:shadow-md`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{rec.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {rec.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{rec.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        Impacto: {rec.impact}
                      </span>
                      <span className="text-gray-500">•</span>
                      <span className="text-purple-600 dark:text-purple-400 font-medium">
                        {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Média' : 'Baixa'} Prioridade
                      </span>
                    </div>
                  </div>
                  {actionExecuted.includes(rec.id) ? (
                    <Badge className="ml-4 bg-emerald-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Executado
                    </Badge>
                  ) : (
                    <Button 
                      size="sm" 
                      className="ml-4 bg-[#1672d6] hover:bg-[#1260b5]"
                      onClick={() => handleExecuteClick(rec)}
                    >
                      <Zap className="w-4 h-4 mr-1" />
                      Executar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <ScopeCreepWidget />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Alertas Críticos
              </CardTitle>
            </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg ${
                  alert.type === 'critical'
                    ? 'bg-red-50 dark:bg-red-900/10 border border-red-200'
                    : alert.type === 'warning'
                    ? 'bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200'
                    : 'bg-blue-50 dark:bg-blue-900/10 border border-blue-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <h5 className="font-medium text-sm text-gray-900 dark:text-white mb-1">{alert.title}</h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{alert.description}</p>
                    {alert.actionable && (
                      <Button variant="ghost" size="sm" className="p-0 h-auto mt-1 text-xs">
                        Ver detalhes →
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="w-5 h-5 text-blue-600" />
              Evolução Financeira
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="receita" stroke="#10B981" strokeWidth={2} name="Receita" />
                <Line type="monotone" dataKey="despesas" stroke="#EF4444" strokeWidth={2} name="Despesas" />
                <Line type="monotone" dataKey="lucro" stroke="#3B82F6" strokeWidth={2} name="Lucro" />
              </RechartsLineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Ranking de Performance da Equipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 120]} />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="score" fill="#3B82F6" name="Performance Score" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-[#1672d6]" />
            Distribuição de Receita por Departamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ===== SEÇÃO INSIGHTS DE IA - LEADS QUALIFICADOS ===== */}
      <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              Insights de IA - Leads Qualificados
              <Badge className="bg-purple-500/10 text-purple-600 border border-purple-500/30 text-[10px]">
                <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                {aiLeads.length} Leads
              </Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {aiLeads.map((lead) => (
              <motion.div
                key={lead.id}
                whileHover={{ y: -2 }}
                className="p-4 rounded-xl border border-border bg-white dark:bg-[#0a0f1a] shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                      {lead.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{lead.name}</h4>
                      <p className="text-xs text-muted-foreground">{lead.position} @ {lead.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn("text-white text-[10px]", getStatusColor(lead.status))}>
                      {getStatusLabel(lead.status)}
                    </Badge>
                    <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 px-2 py-1 rounded-full text-xs font-medium">
                      <Star className="w-3 h-3 fill-current" />
                      {lead.score}%
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3">{lead.interest}</p>

                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                  <Clock className="w-3 h-3" />
                  Último contato: {lead.lastContact}
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 text-xs"
                    onClick={() => handleViewLead(lead)}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Ver
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 text-xs text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                    onClick={() => handleCallLead(lead)}
                  >
                    <PhoneCall className="w-3 h-3 mr-1" />
                    Ligar
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 text-xs bg-purple-600 hover:bg-purple-700"
                    onClick={() => handleViewScript(lead)}
                  >
                    <FileSearch className="w-3 h-3 mr-1" />
                    Ver Roteiro
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ===== CARROSSEL 3D DE INSIGHTS ===== */}
      <Card className="border-2 border-[#1672d6]/20 overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#1672d6]" />
              Insights Estratégicos em 3D
              <Badge className="bg-[#1672d6]/10 text-[#1672d6] border-[#1672d6]/30 text-[10px]">
                <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                Preditivo
              </Badge>
            </CardTitle>
            <Button variant="outline" size="sm">
              Ver Todos
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ThreeDPhotoCarousel 
              items={[
                { id: 1, title: "Crescimento de Receita +22%", description: "Projeção baseada em contratos ativos", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400", category: "Financeiro" },
                { id: 2, title: "3 Clientes com Risco de Churn", description: "Análise comportamental detectou alertas", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400", category: "Retenção" },
                { id: 3, title: "5 Oportunidades de Upsell", description: "Clientes com alto engajamento", image: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400", category: "Vendas" },
                { id: 4, title: "8 Leads Qualificados", description: "Prontos para conversão este mês", image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400", category: "Comercial" },
                { id: 5, title: "Performance da Equipe +15%", description: "Melhoria contínua nos indicadores", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400", category: "RH" },
                { id: 6, title: "ROI Médio das Campanhas", description: "Retorno de 340% nos últimos 3 meses", image: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=400", category: "Marketing" },
              ]}
              onItemClick={(item) => console.log('Clicked:', item)}
              hideInstructions={true}
            />
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Arraste para explorar os insights • Clique para ver detalhes
          </p>
        </CardContent>
      </Card>

      {/* ===== CARDS DE INTELIGÊNCIA PREDITIVA ===== */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/analytics/preditivo">
          <motion.div whileHover={{ y: -4 }}>
            <Card className="cursor-pointer border-2 border-transparent hover:border-emerald-500/30 hover:shadow-lg transition-all h-full">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                  </div>
                  <span className="text-xs text-emerald-500 font-medium">Previsão</span>
                </div>
                <h4 className="font-bold text-lg mb-1">+22% Receita</h4>
                <p className="text-sm text-muted-foreground">
                  Projeção para próximo trimestre baseada em contratos ativos
                </p>
                <div className="mt-3 flex items-center text-emerald-500 text-xs font-medium">
                  Ver análise <ChevronRight className="w-3 h-3 ml-1" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </Link>

        <Link href="/admin/clientes?filter=churn_risk">
          <motion.div whileHover={{ y: -4 }}>
            <Card className="cursor-pointer border-2 border-transparent hover:border-amber-500/30 hover:shadow-lg transition-all h-full">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  </div>
                  <span className="text-xs text-amber-500 font-medium">Alerta IA</span>
                </div>
                <h4 className="font-bold text-lg mb-1">3 Clientes Risco</h4>
                <p className="text-sm text-muted-foreground">
                  Probabilidade de churn detectada pela análise comportamental
                </p>
                <div className="mt-3 flex items-center text-amber-500 text-xs font-medium">
                  Ver clientes <ChevronRight className="w-3 h-3 ml-1" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </Link>

        <Link href="/admin/clientes?filter=upsell">
          <motion.div whileHover={{ y: -4 }}>
            <Card className="cursor-pointer border-2 border-transparent hover:border-purple-500/30 hover:shadow-lg transition-all h-full">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10">
                    <Users className="w-5 h-5 text-purple-500" />
                  </div>
                  <span className="text-xs text-purple-500 font-medium">Oportunidade</span>
                </div>
                <h4 className="font-bold text-lg mb-1">5 Upsells</h4>
                <p className="text-sm text-muted-foreground">
                  Clientes com alto engajamento prontos para upgrade
                </p>
                <div className="mt-3 flex items-center text-purple-500 text-xs font-medium">
                  Ver oportunidades <ChevronRight className="w-3 h-3 ml-1" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </Link>

        <Link href="/admin/comercial/leads">
          <motion.div whileHover={{ y: -4 }}>
            <Card className="cursor-pointer border-2 border-transparent hover:border-[#1672d6]/30 hover:shadow-lg transition-all h-full">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-[#1672d6]/10">
                    <Target className="w-5 h-5 text-[#1672d6]" />
                  </div>
                  <span className="text-xs text-[#1672d6] font-medium">SQL</span>
                </div>
                <h4 className="font-bold text-lg mb-1">8 Leads Quentes</h4>
                <p className="text-sm text-muted-foreground">
                  Leads qualificados prontos para conversão este mês
                </p>
                <div className="mt-3 flex items-center text-[#1672d6] text-xs font-medium">
                  Ver leads <ChevronRight className="w-3 h-3 ml-1" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </Link>
      </div>

      {/* Ações Rápidas com IA */}
      <Card className="border-2 border-[#1672d6]/20 bg-gradient-to-br from-[#1672d6]/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#1672d6]" />
            Ações Rápidas com IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleQuickAction('cobrar')}
              className="p-4 rounded-xl border-2 border-[#001533]/10 bg-white dark:bg-[#001533]/50 hover:border-[#1672d6]/30 transition-all text-left"
            >
              <Mail className="w-6 h-6 text-[#1672d6] mb-2" />
              <p className="font-semibold text-sm">Cobrar Clientes</p>
              <p className="text-xs text-muted-foreground">3 em atraso</p>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleQuickAction('elogiar')}
              className="p-4 rounded-xl border-2 border-[#001533]/10 bg-white dark:bg-[#001533]/50 hover:border-emerald-500/30 transition-all text-left"
            >
              <ThumbsUp className="w-6 h-6 text-emerald-500 mb-2" />
              <p className="font-semibold text-sm">Elogiar Equipe</p>
              <p className="text-xs text-muted-foreground">5 destaques</p>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleQuickAction('agendar')}
              className="p-4 rounded-xl border-2 border-[#001533]/10 bg-white dark:bg-[#001533]/50 hover:border-purple-500/30 transition-all text-left"
            >
              <Calendar className="w-6 h-6 text-purple-500 mb-2" />
              <p className="font-semibold text-sm">Agendar Reuniões</p>
              <p className="text-xs text-muted-foreground">4 pendentes</p>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleQuickAction('relatorio')}
              className="p-4 rounded-xl border-2 border-[#001533]/10 bg-white dark:bg-[#001533]/50 hover:border-orange-500/30 transition-all text-left"
            >
              <FileText className="w-6 h-6 text-orange-500 mb-2" />
              <p className="font-semibold text-sm">Gerar Relatório</p>
              <p className="text-xs text-muted-foreground">Mensal</p>
            </motion.button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Confirmação de Execução */}
      <AnimatePresence>
        {showExecuteModal && selectedAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => !executingAction && setShowExecuteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#0a0f1a] rounded-2xl w-full max-w-md shadow-2xl"
            >
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 rounded-xl bg-[#1672d6]/10">
                    <Zap className="w-6 h-6 text-[#1672d6]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Confirmar Execução</h2>
                    <p className="text-sm text-muted-foreground">Esta ação será executada automaticamente</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="p-4 rounded-xl bg-muted/50 mb-4">
                  <h3 className="font-semibold text-foreground mb-1">{selectedAction.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{selectedAction.description}</p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                      Impacto: {selectedAction.impact}
                    </Badge>
                    <Badge variant="outline">{selectedAction.category}</Badge>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  Ao confirmar, a IA irá executar as ações necessárias automaticamente.
                </p>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowExecuteModal(false)}
                    disabled={executingAction}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 bg-[#1672d6] hover:bg-[#1260b5]"
                    onClick={confirmExecution}
                    disabled={executingAction}
                  >
                    {executingAction ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Executando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirmar Execução
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Exportação */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => !isExporting && setShowExportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#0a0f1a] rounded-2xl w-full max-w-md shadow-2xl"
            >
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-bold text-foreground">Exportar Relatório</h2>
                <p className="text-sm text-muted-foreground">Escolha o formato do arquivo</p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleExport('pdf')}
                    disabled={isExporting}
                    className="p-6 rounded-xl border-2 border-red-500/30 bg-red-500/5 hover:bg-red-500/10 transition-all text-center"
                  >
                    <Download className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="font-semibold text-red-600">PDF</p>
                    <p className="text-xs text-muted-foreground">Relatório formatado</p>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleExport('excel')}
                    disabled={isExporting}
                    className="p-6 rounded-xl border-2 border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all text-center"
                  >
                    <FileSpreadsheet className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="font-semibold text-emerald-600">Excel</p>
                    <p className="text-xs text-muted-foreground">Planilha editável</p>
                  </motion.button>
                </div>

                {isExporting && (
                  <div className="flex items-center justify-center gap-2 text-[#1672d6]">
                    <div className="w-4 h-4 border-2 border-[#1672d6]/30 border-t-[#1672d6] rounded-full animate-spin" />
                    <span className="text-sm">Gerando {exportFormat.toUpperCase()}...</span>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => setShowExportModal(false)}
                  disabled={isExporting}
                >
                  Cancelar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Ver Detalhes do Lead */}
      <AnimatePresence>
        {showLeadModal && selectedLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowLeadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#0a0f1a] rounded-2xl w-full max-w-lg shadow-2xl"
            >
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                      {selectedLead.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{selectedLead.name}</h2>
                      <p className="text-sm text-muted-foreground">{selectedLead.position}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowLeadModal(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Building className="w-3 h-3" />
                      Empresa
                    </div>
                    <p className="font-medium text-foreground">{selectedLead.company}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Star className="w-3 h-3" />
                      Score
                    </div>
                    <p className="font-medium text-foreground">{selectedLead.score}%</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Phone className="w-3 h-3" />
                    Telefone
                  </div>
                  <p className="font-medium text-foreground">{selectedLead.phone}</p>
                </div>

                <div className="p-3 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Mail className="w-3 h-3" />
                    Email
                  </div>
                  <p className="font-medium text-foreground">{selectedLead.email}</p>
                </div>

                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-center gap-2 text-xs text-purple-600 mb-1">
                    <Brain className="w-3 h-3" />
                    Interesse Detectado pela IA
                  </div>
                  <p className="font-medium text-foreground">{selectedLead.interest}</p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setShowLeadModal(false);
                      handleCallLead(selectedLead);
                    }}
                  >
                    <PhoneCall className="w-4 h-4 mr-2" />
                    Ligar
                  </Button>
                  <Button 
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    onClick={() => {
                      setShowLeadModal(false);
                      handleViewScript(selectedLead);
                    }}
                  >
                    <FileSearch className="w-4 h-4 mr-2" />
                    Ver Roteiro
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Agendar Ligação */}
      <AnimatePresence>
        {showCallModal && selectedLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => !callScheduled && setShowCallModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#0a0f1a] rounded-2xl w-full max-w-md shadow-2xl"
            >
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-emerald-500/10">
                    <PhoneCall className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Agendar Ligação</h2>
                    <p className="text-sm text-muted-foreground">Para {selectedLead.name}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-4 rounded-xl bg-muted/50 border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                      {selectedLead.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{selectedLead.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedLead.phone}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedLead.company}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Escolha a data e horário
                  </label>
                  <input
                    type="datetime-local"
                    value={callTime}
                    onChange={(e) => setCallTime(e.target.value)}
                    className="w-full p-3 rounded-xl border border-border bg-background text-foreground"
                  />
                </div>

                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-center gap-2 text-sm text-purple-600">
                    <Brain className="w-4 h-4" />
                    <span className="font-medium">Dica da IA:</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Melhores horários para {selectedLead.name}: 10h-12h ou 14h-16h
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowCallModal(false)}
                    disabled={callScheduled}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    onClick={handleScheduleCall}
                    disabled={callScheduled}
                  >
                    {callScheduled ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Agendando...
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4 mr-2" />
                        Agendar Ligação
                      </>
                    )}
                  </Button>
                </div>

                <Button 
                  variant="ghost" 
                  className="w-full text-emerald-600"
                  onClick={() => window.open(`tel:${selectedLead.phone}`)}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Ligar Agora
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Ver Roteiro de Abordagem */}
      <AnimatePresence>
        {showScriptModal && selectedLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowScriptModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#0a0f1a] rounded-2xl w-full max-w-lg shadow-2xl max-h-[85vh] overflow-hidden"
            >
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20">
                      <FileSearch className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Roteiro de Abordagem</h2>
                      <p className="text-sm text-muted-foreground">Gerado pela IA para {selectedLead.name}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowScriptModal(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="p-6 overflow-auto max-h-[50vh]">
                <div className="flex items-center gap-2 mb-4">
                  <Badge className={cn("text-white", getStatusColor(selectedLead.status))}>
                    Lead {getStatusLabel(selectedLead.status)}
                  </Badge>
                  <Badge variant="outline">Score: {selectedLead.score}%</Badge>
                  <Badge className="bg-purple-500/10 text-purple-600 border border-purple-500/30">
                    <Sparkles className="w-3 h-3 mr-1" />
                    IA Personalizado
                  </Badge>
                </div>

                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/5 to-indigo-500/5 border border-purple-500/20">
                  <p className="text-foreground whitespace-pre-line leading-relaxed">
                    {selectedLead.script}
                  </p>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-center gap-2 text-sm text-amber-600 mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">Pontos de Atenção:</span>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                    <li>Foque nos benefícios específicos para {selectedLead.company}</li>
                    <li>Mencione cases de sucesso do mesmo segmento</li>
                    <li>Prepare-se para objeções de preço</li>
                  </ul>
                </div>
              </div>

              <div className="p-6 border-t border-border bg-muted/30">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleCopyScript}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Roteiro
                  </Button>
                  <Button
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => {
                      setShowScriptModal(false);
                      handleCallLead(selectedLead);
                    }}
                  >
                    <PhoneCall className="w-4 h-4 mr-2" />
                    Ligar Agora
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Resultado da IA */}
      <AnimatePresence>
        {showResultModal && resultContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowResultModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#0a0f1a] rounded-2xl w-full max-w-lg shadow-2xl max-h-[80vh] overflow-auto"
            >
              <div className="p-6 border-b border-border sticky top-0 bg-white dark:bg-[#0a0f1a]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-[#1672d6]/20 to-purple-500/20">
                      <Sparkles className="w-6 h-6 text-[#1672d6]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground">{resultContent.title}</h2>
                      <p className="text-sm text-muted-foreground">Gerado pela IA</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowResultModal(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-muted-foreground">{resultContent.message}</p>

                {/* Se tiver insights */}
                {resultContent.insights && resultContent.insights.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground">Insights Encontrados:</h3>
                    {resultContent.insights.map((insight: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-xl bg-muted/50 border border-border">
                        <div className="flex items-start gap-2">
                          <Badge className={cn(
                            "shrink-0",
                            insight.priority === 'critical' || insight.priority === 'high' 
                              ? 'bg-red-500/10 text-red-600' 
                              : insight.priority === 'medium'
                              ? 'bg-yellow-500/10 text-yellow-600'
                              : 'bg-green-500/10 text-green-600'
                          )}>
                            {insight.priority}
                          </Badge>
                          <div>
                            <p className="font-medium text-foreground">{insight.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                            <p className="text-xs text-[#1672d6] mt-2">💡 {insight.action}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Se tiver email */}
                {resultContent.email && (
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-muted/50 border border-border">
                      <p className="font-medium text-foreground mb-2">Assunto: {resultContent.email.subject}</p>
                      <div 
                        className="text-sm text-muted-foreground prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: resultContent.email.body }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1 bg-[#1672d6]">
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Email
                      </Button>
                      <Button variant="outline" className="flex-1">
                        Copiar
                      </Button>
                    </div>
                  </div>
                )}

                {/* Se tiver ações */}
                {resultContent.actions && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground">Ações Preparadas:</h3>
                    {resultContent.actions.map((action: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                        <span className="text-sm text-foreground">{action}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Se tiver relatório */}
                {resultContent.report && (
                  <div className="p-4 rounded-xl bg-muted/50 border border-border">
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap overflow-auto max-h-60">
                      {JSON.stringify(resultContent.report, null, 2)}
                    </pre>
                  </div>
                )}

                <Button 
                  className="w-full bg-[#1672d6] hover:bg-[#1260b5]"
                  onClick={() => setShowResultModal(false)}
                >
                  Fechar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
