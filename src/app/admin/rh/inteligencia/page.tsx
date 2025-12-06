'use client';

/**
 * Valle 360 - RH Inteligência
 * Sistema de avaliação de colaboradores com IA
 * Sugestões: aumento, demissão, promoção, treinamento
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Brain, Users, TrendingUp, TrendingDown, AlertTriangle, Award,
  DollarSign, Target, BarChart3, ChevronRight, X, Eye, Phone,
  Mail, Calendar, Star, Sparkles, ArrowUpRight, ArrowDownRight,
  UserCheck, UserMinus, GraduationCap, BadgeDollarSign, RefreshCw,
  MessageSquare, FileText, Briefcase, Clock, CheckCircle, XCircle,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =====================================================
// TIPOS
// =====================================================

interface Colaborador {
  id: string;
  nome: string;
  avatar: string;
  cargo: string;
  departamento: string;
  salarioAtual: number;
  dataAdmissao: string;
  scores: {
    desempenho: number;
    engajamento: number;
    entregas: number;
    comunicacao: number;
    lideranca: number;
    inovacao: number;
  };
  tendencia: 'up' | 'down' | 'stable';
  ultimaAvaliacao: string;
  alertas: string[];
  potencial: 'alto' | 'medio' | 'baixo';
}

interface SugestaoIA {
  tipo: 'aumento' | 'promocao' | 'treinamento' | 'atencao' | 'demissao' | 'reconhecimento';
  colaboradorId: string;
  titulo: string;
  descricao: string;
  impacto: string;
  urgencia: 'alta' | 'media' | 'baixa';
  acaoRecomendada: string;
}

// =====================================================
// MOCK DATA
// =====================================================

const mockColaboradores: Colaborador[] = [
  {
    id: '1',
    nome: 'João Silva',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=joao',
    cargo: 'Web Designer',
    departamento: 'Design',
    salarioAtual: 4500,
    dataAdmissao: '2023-03-15',
    scores: { desempenho: 92, engajamento: 88, entregas: 95, comunicacao: 85, lideranca: 70, inovacao: 90 },
    tendencia: 'up',
    ultimaAvaliacao: '2024-11-15',
    alertas: [],
    potencial: 'alto'
  },
  {
    id: '2',
    nome: 'Maria Santos',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
    cargo: 'Social Media',
    departamento: 'Marketing',
    salarioAtual: 3800,
    dataAdmissao: '2022-08-10',
    scores: { desempenho: 95, engajamento: 98, entregas: 92, comunicacao: 95, lideranca: 82, inovacao: 88 },
    tendencia: 'up',
    ultimaAvaliacao: '2024-11-20',
    alertas: [],
    potencial: 'alto'
  },
  {
    id: '3',
    nome: 'Pedro Costa',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pedro',
    cargo: 'Gestor de Tráfego',
    departamento: 'Performance',
    salarioAtual: 5200,
    dataAdmissao: '2023-01-20',
    scores: { desempenho: 58, engajamento: 45, entregas: 62, comunicacao: 55, lideranca: 40, inovacao: 50 },
    tendencia: 'down',
    ultimaAvaliacao: '2024-10-30',
    alertas: ['Baixo engajamento', 'Entregas atrasadas', 'Faltas frequentes'],
    potencial: 'baixo'
  },
  {
    id: '4',
    nome: 'Ana Oliveira',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana',
    cargo: 'Designer Gráfico',
    departamento: 'Design',
    salarioAtual: 4000,
    dataAdmissao: '2023-06-01',
    scores: { desempenho: 78, engajamento: 82, entregas: 80, comunicacao: 75, lideranca: 65, inovacao: 85 },
    tendencia: 'stable',
    ultimaAvaliacao: '2024-11-10',
    alertas: ['Necessita treinamento em gestão de tempo'],
    potencial: 'medio'
  },
  {
    id: '5',
    nome: 'Lucas Mendes',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lucas',
    cargo: 'Video Maker',
    departamento: 'Criação',
    salarioAtual: 4200,
    dataAdmissao: '2023-09-15',
    scores: { desempenho: 88, engajamento: 85, entregas: 90, comunicacao: 80, lideranca: 60, inovacao: 92 },
    tendencia: 'up',
    ultimaAvaliacao: '2024-11-25',
    alertas: [],
    potencial: 'alto'
  }
];

const gerarSugestoesIA = (colaboradores: Colaborador[]): SugestaoIA[] => {
  const sugestoes: SugestaoIA[] = [];
  
  colaboradores.forEach(col => {
    const mediaScore = Object.values(col.scores).reduce((a, b) => a + b, 0) / 6;
    
    // Alto desempenho + tendência positiva = promoção/aumento
    if (mediaScore >= 90 && col.tendencia === 'up') {
      sugestoes.push({
        tipo: 'promocao',
        colaboradorId: col.id,
        titulo: `Promover ${col.nome}`,
        descricao: `${col.nome} apresenta desempenho excepcional (${Math.round(mediaScore)}%) com tendência de crescimento. Avaliar promoção ou aumento salarial.`,
        impacto: `Retenção de talento chave. Risco de perda para mercado.`,
        urgencia: 'alta',
        acaoRecomendada: 'Agendar conversa de carreira'
      });
    }
    
    // Bom desempenho estável = aumento
    if (mediaScore >= 85 && mediaScore < 90 && col.tendencia !== 'down') {
      sugestoes.push({
        tipo: 'aumento',
        colaboradorId: col.id,
        titulo: `Revisar salário de ${col.nome}`,
        descricao: `Desempenho consistente de ${Math.round(mediaScore)}%. Colaborador há ${calcularTempoEmpresa(col.dataAdmissao)}.`,
        impacto: `Aumento de 10-15% recomendado para retenção.`,
        urgencia: 'media',
        acaoRecomendada: 'Avaliar reajuste salarial'
      });
    }
    
    // Desempenho médio = treinamento
    if (mediaScore >= 70 && mediaScore < 85) {
      sugestoes.push({
        tipo: 'treinamento',
        colaboradorId: col.id,
        titulo: `Desenvolver ${col.nome}`,
        descricao: `Colaborador com potencial ${col.potencial}. Score atual: ${Math.round(mediaScore)}%. Investir em capacitação pode elevar performance.`,
        impacto: `Melhoria estimada de 15-20% com treinamento adequado.`,
        urgencia: 'media',
        acaoRecomendada: 'Mapear gaps e definir PDI'
      });
    }
    
    // Baixo desempenho + tendência negativa = atenção/demissão
    if (mediaScore < 60 || (mediaScore < 70 && col.tendencia === 'down')) {
      sugestoes.push({
        tipo: col.alertas.length >= 3 ? 'demissao' : 'atencao',
        colaboradorId: col.id,
        titulo: col.alertas.length >= 3 ? `Avaliar desligamento de ${col.nome}` : `Atenção com ${col.nome}`,
        descricao: `Score de ${Math.round(mediaScore)}% com tendência de queda. Alertas: ${col.alertas.join(', ') || 'Nenhum específico'}.`,
        impacto: col.alertas.length >= 3 
          ? `Custo de desligamento vs. impacto na produtividade da equipe.`
          : `Risco de contaminar ambiente. Necessita intervenção imediata.`,
        urgencia: 'alta',
        acaoRecomendada: col.alertas.length >= 3 
          ? 'Consultar jurídico e iniciar processo'
          : 'Feedback imediato e plano de melhoria'
      });
    }
    
    // Reconhecimento para quem entrega bem
    if (col.scores.entregas >= 90) {
      sugestoes.push({
        tipo: 'reconhecimento',
        colaboradorId: col.id,
        titulo: `Reconhecer ${col.nome}`,
        descricao: `Taxa de entregas de ${col.scores.entregas}%. Colaborador confiável e pontual.`,
        impacto: `Reconhecimento público aumenta engajamento da equipe.`,
        urgencia: 'baixa',
        acaoRecomendada: 'Enviar elogio público ou bônus'
      });
    }
  });
  
  return sugestoes.sort((a, b) => {
    const urgenciaOrder = { alta: 0, media: 1, baixa: 2 };
    return urgenciaOrder[a.urgencia] - urgenciaOrder[b.urgencia];
  });
};

const calcularTempoEmpresa = (dataAdmissao: string) => {
  const diff = new Date().getTime() - new Date(dataAdmissao).getTime();
  const meses = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  if (meses < 12) return `${meses} meses`;
  const anos = Math.floor(meses / 12);
  const mesesRestantes = meses % 12;
  return `${anos} ano${anos > 1 ? 's' : ''}${mesesRestantes > 0 ? ` e ${mesesRestantes} meses` : ''}`;
};

// =====================================================
// COMPONENTES
// =====================================================

function ScoreRadar({ scores }: { scores: Colaborador['scores'] }) {
  const items = [
    { key: 'desempenho', label: 'Desempenho', color: 'bg-blue-500' },
    { key: 'engajamento', label: 'Engajamento', color: 'bg-green-500' },
    { key: 'entregas', label: 'Entregas', color: 'bg-purple-500' },
    { key: 'comunicacao', label: 'Comunicação', color: 'bg-yellow-500' },
    { key: 'lideranca', label: 'Liderança', color: 'bg-red-500' },
    { key: 'inovacao', label: 'Inovação', color: 'bg-pink-500' },
  ];

  return (
    <div className="space-y-2">
      {items.map(item => (
        <div key={item.key} className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-24">{item.label}</span>
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${scores[item.key as keyof typeof scores]}%` }}
              className={cn("h-full rounded-full", item.color)}
            />
          </div>
          <span className="text-xs font-medium w-8">{scores[item.key as keyof typeof scores]}%</span>
        </div>
      ))}
    </div>
  );
}

function SugestaoCard({ sugestao, colaborador, onAction }: { 
  sugestao: SugestaoIA; 
  colaborador?: Colaborador;
  onAction: (tipo: string) => void;
}) {
  const config = {
    promocao: { icon: ArrowUpRight, color: 'bg-emerald-500', bgLight: 'bg-emerald-50', textColor: 'text-emerald-700' },
    aumento: { icon: BadgeDollarSign, color: 'bg-blue-500', bgLight: 'bg-blue-50', textColor: 'text-blue-700' },
    treinamento: { icon: GraduationCap, color: 'bg-purple-500', bgLight: 'bg-purple-50', textColor: 'text-purple-700' },
    atencao: { icon: AlertTriangle, color: 'bg-amber-500', bgLight: 'bg-amber-50', textColor: 'text-amber-700' },
    demissao: { icon: UserMinus, color: 'bg-red-500', bgLight: 'bg-red-50', textColor: 'text-red-700' },
    reconhecimento: { icon: Star, color: 'bg-yellow-500', bgLight: 'bg-yellow-50', textColor: 'text-yellow-700' },
  }[sugestao.tipo];

  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("p-4 rounded-xl border", config.bgLight)}
    >
      <div className="flex items-start gap-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white", config.color)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={cn("font-semibold", config.textColor)}>{sugestao.titulo}</h4>
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full font-medium",
              sugestao.urgencia === 'alta' ? 'bg-red-100 text-red-700' :
              sugestao.urgencia === 'media' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-700'
            )}>
              {sugestao.urgencia}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">{sugestao.descricao}</p>
          <p className="text-xs text-gray-500 mb-3">💡 Impacto: {sugestao.impacto}</p>
          <button
            onClick={() => onAction(sugestao.tipo)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium text-white transition-colors",
              config.color, "hover:opacity-90"
            )}
          >
            {sugestao.acaoRecomendada}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// =====================================================
// PÁGINA PRINCIPAL
// =====================================================

export default function RHInteligenciaPage() {
  const [colaboradores] = useState<Colaborador[]>(mockColaboradores);
  const [sugestoes, setSugestoes] = useState<SugestaoIA[]>([]);
  const [selectedColaborador, setSelectedColaborador] = useState<Colaborador | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filterDepartamento, setFilterDepartamento] = useState('all');

  useEffect(() => {
    setSugestoes(gerarSugestoesIA(colaboradores));
  }, [colaboradores]);

  const handleGenerateAnalysis = async () => {
    setIsGenerating(true);
    toast.loading('Analisando colaboradores com IA...');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSugestoes(gerarSugestoesIA(colaboradores));
    toast.dismiss();
    toast.success('Análise concluída! Novas sugestões geradas.');
    setIsGenerating(false);
  };

  const handleAction = (tipo: string) => {
    const acoes: Record<string, string> = {
      promocao: 'Iniciando processo de promoção...',
      aumento: 'Abrindo proposta de reajuste salarial...',
      treinamento: 'Criando plano de desenvolvimento...',
      atencao: 'Agendando feedback imediato...',
      demissao: 'Consultando departamento jurídico...',
      reconhecimento: 'Enviando reconhecimento público...'
    };
    toast.success(acoes[tipo] || 'Ação iniciada!');
  };

  const handleViewDetails = (col: Colaborador) => {
    setSelectedColaborador(col);
    setShowModal(true);
  };

  const mediaGeral = colaboradores.reduce((acc, col) => {
    const media = Object.values(col.scores).reduce((a, b) => a + b, 0) / 6;
    return acc + media;
  }, 0) / colaboradores.length;

  const colaboradoresEmRisco = colaboradores.filter(c => {
    const media = Object.values(c.scores).reduce((a, b) => a + b, 0) / 6;
    return media < 70 || c.tendencia === 'down';
  });

  const topPerformers = colaboradores.filter(c => {
    const media = Object.values(c.scores).reduce((a, b) => a + b, 0) / 6;
    return media >= 85;
  });

  const filteredColaboradores = filterDepartamento === 'all' 
    ? colaboradores 
    : colaboradores.filter(c => c.departamento === filterDepartamento);

  const departamentos = [...new Set(colaboradores.map(c => c.departamento))];

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">RH Inteligência</h1>
              <p className="text-sm text-gray-500">Avaliação e sugestões de ações para colaboradores</p>
            </div>
          </div>
          
          <button
            onClick={handleGenerateAnalysis}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", isGenerating && "animate-spin")} />
            Gerar Análise IA
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm border"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Média Geral</span>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{Math.round(mediaGeral)}%</p>
            <p className="text-xs text-green-600 mt-1">+3% vs mês anterior</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm border"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Top Performers</span>
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{topPerformers.length}</p>
            <p className="text-xs text-gray-500 mt-1">colaboradores acima de 85%</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-sm border"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Em Atenção</span>
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-red-600">{colaboradoresEmRisco.length}</p>
            <p className="text-xs text-red-500 mt-1">precisam de intervenção</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-xl shadow-sm border"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Sugestões IA</span>
              <Sparkles className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-purple-600">{sugestoes.length}</p>
            <p className="text-xs text-purple-500 mt-1">ações recomendadas</p>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-6">
          
          {/* Sugestões da IA */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Sugestões da Val (IA)</h2>
              <span className="text-sm text-gray-500">{sugestoes.length} ações pendentes</span>
            </div>
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {sugestoes.map((sugestao, idx) => (
                <SugestaoCard 
                  key={idx} 
                  sugestao={sugestao} 
                  colaborador={colaboradores.find(c => c.id === sugestao.colaboradorId)}
                  onAction={handleAction}
                />
              ))}
            </div>
          </div>

          {/* Lista de Colaboradores */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Equipe</h2>
              <select
                value={filterDepartamento}
                onChange={e => setFilterDepartamento(e.target.value)}
                className="text-sm border rounded-lg px-2 py-1"
              >
                <option value="all">Todos</option>
                {departamentos.map(dep => (
                  <option key={dep} value={dep}>{dep}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              {filteredColaboradores.map(col => {
                const media = Math.round(Object.values(col.scores).reduce((a, b) => a + b, 0) / 6);
                return (
                  <motion.div
                    key={col.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => handleViewDetails(col)}
                    className="bg-white p-4 rounded-xl border cursor-pointer hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <img src={col.avatar} alt={col.nome} className="w-12 h-12 rounded-full" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900">{col.nome}</h4>
                          {col.tendencia === 'up' && <ArrowUpRight className="w-4 h-4 text-green-500" />}
                          {col.tendencia === 'down' && <ArrowDownRight className="w-4 h-4 text-red-500" />}
                        </div>
                        <p className="text-xs text-gray-500">{col.cargo} • {col.departamento}</p>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-lg font-bold",
                          media >= 85 ? "text-green-600" : media >= 70 ? "text-yellow-600" : "text-red-600"
                        )}>
                          {media}%
                        </p>
                        <p className="text-xs text-gray-400">score</p>
                      </div>
                    </div>
                    {col.alertas.length > 0 && (
                      <div className="mt-2 flex gap-1">
                        {col.alertas.slice(0, 2).map((alerta, i) => (
                          <span key={i} className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                            {alerta}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Botão Ver Performance Completa */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/admin/rh/colaborador/${col.id}`;
                      }}
                      className="mt-3 w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      Ver Performance Completa
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Detalhes */}
      <AnimatePresence>
        {showModal && selectedColaborador && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-auto"
            >
              <div className="p-6 border-b sticky top-0 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img 
                      src={selectedColaborador.avatar} 
                      alt={selectedColaborador.nome} 
                      className="w-16 h-16 rounded-full"
                    />
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedColaborador.nome}</h2>
                      <p className="text-gray-500">{selectedColaborador.cargo} • {selectedColaborador.departamento}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Info Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Salário Atual</p>
                    <p className="text-xl font-bold text-gray-900">
                      R$ {selectedColaborador.salarioAtual.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Tempo de Empresa</p>
                    <p className="text-xl font-bold text-gray-900">
                      {calcularTempoEmpresa(selectedColaborador.dataAdmissao)}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Potencial</p>
                    <p className={cn(
                      "text-xl font-bold capitalize",
                      selectedColaborador.potencial === 'alto' ? 'text-green-600' :
                      selectedColaborador.potencial === 'medio' ? 'text-yellow-600' : 'text-red-600'
                    )}>
                      {selectedColaborador.potencial}
                    </p>
                  </div>
                </div>

                {/* Scores */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Avaliação Detalhada</h3>
                  <ScoreRadar scores={selectedColaborador.scores} />
                </div>

                {/* Alertas */}
                {selectedColaborador.alertas.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Alertas</h3>
                    <div className="space-y-2">
                      {selectedColaborador.alertas.map((alerta, i) => (
                        <div key={i} className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span className="text-sm text-red-700">{alerta}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Ações */}
                <div className="flex gap-3 pt-4 border-t">
                  <button 
                    onClick={() => { handleAction('treinamento'); setShowModal(false); }}
                    className="flex-1 py-2.5 bg-purple-50 text-purple-600 rounded-lg font-medium hover:bg-purple-100 flex items-center justify-center gap-2"
                  >
                    <GraduationCap className="w-4 h-4" /> PDI
                  </button>
                  <button 
                    onClick={() => { handleAction('aumento'); setShowModal(false); }}
                    className="flex-1 py-2.5 bg-blue-50 text-blue-600 rounded-lg font-medium hover:bg-blue-100 flex items-center justify-center gap-2"
                  >
                    <BadgeDollarSign className="w-4 h-4" /> Reajuste
                  </button>
                  <button 
                    onClick={() => { handleAction('atencao'); setShowModal(false); }}
                    className="flex-1 py-2.5 bg-amber-50 text-amber-600 rounded-lg font-medium hover:bg-amber-100 flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" /> Feedback
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

