'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Heart,
  Eye,
  MousePointerClick,
  Instagram,
  Facebook,
  Linkedin,
  ThumbsUp,
  MessageCircle,
  GripVertical,
  Settings,
  CreditCard,
  Calendar,
  Bell,
  ChevronRight,
  FileText,
  MessageSquare,
  HelpCircle,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { AIPerformanceSummary } from '@/components/dashboard/AIPerformanceSummary';
import BeforeAfterSection from '@/components/dashboard/BeforeAfterSection';
import { SentimentAnalysis } from '@/components/dashboard/SentimentAnalysis';
import { CompetitorAnalysis } from '@/components/dashboard/CompetitorAnalysis';
import { CommercialMetricsSection } from '@/components/dashboard/CommercialMetricsSection';
import { TrafficMetricsSection } from '@/components/dashboard/TrafficMetricsSection';
import StatsCards from '@/components/valle-ui/StatsCards';
import DisplayCards from '@/components/valle-ui/DisplayCards';
import FeatureGrid from '@/components/valle-ui/FeatureGrid';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface DashboardSection {
  id: string;
  component: React.ReactNode;
}

// Dados do cliente
const clienteData = {
  nome: "Guilherme",
  empresa: "Valle Group",
  avatar: "",
  plano: "Premium",
  proximaReuniao: "15 Dez, 14:00",
};

const atividadesRecentes = [
  {
    id: 1,
    tipo: "campanha",
    titulo: "Campanha Black Friday atualizada",
    tempo: "Há 2 horas",
  },
  {
    id: 2,
    tipo: "relatorio",
    titulo: "Relatório semanal disponível",
    tempo: "Há 5 horas",
  },
  {
    id: 3,
    tipo: "mensagem",
    titulo: "Nova mensagem do gestor",
    tempo: "Ontem",
  },
  {
    id: 4,
    tipo: "campanha",
    titulo: "Meta Ads: orçamento otimizado",
    tempo: "2 dias atrás",
  },
];

const quickLinks = [
  { icon: FileText, label: "Relatórios", href: "/cliente/relatorios" },
  { icon: MessageSquare, label: "Mensagens", href: "/cliente/mensagens" },
  { icon: Calendar, label: "Agendar Reunião", href: "/cliente/agenda" },
  { icon: HelpCircle, label: "Suporte", href: "/cliente/suporte" },
];

function SortableSection({ id, children }: { id: string; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-8 top-4 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <GripVertical className="w-6 h-6 text-muted-foreground hover:text-[#1672d6]" />
      </div>
      {children}
    </div>
  );
}

export default function ClienteDashboard() {
  const router = useRouter();
  const clientName = clienteData.nome;
  const [userId, setUserId] = useState<string>('');
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [sections, setSections] = useState<DashboardSection[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      loadDashboardLayout(user.id);
    }
  };

  const loadDashboardLayout = (uid: string) => {
    const savedLayout = localStorage.getItem(`dashboard_layout_${uid}`);
    if (savedLayout) {
      const savedOrder = JSON.parse(savedLayout);
      const orderedSections = savedOrder.map((id: string) =>
        getDefaultSections(uid).find(s => s.id === id)
      ).filter(Boolean);
      setSections(orderedSections as DashboardSection[]);
    } else {
      setSections(getDefaultSections(uid));
    }
  };

  const metrics = [
    { label: 'Total de Seguidores', value: '45.2K', change: '+12.5%', trend: 'up', icon: Users },
    { label: 'Engajamento', value: '8.7%', change: '+2.3%', trend: 'up', icon: Heart },
    { label: 'Alcance', value: '128K', change: '+18.2%', trend: 'up', icon: Eye },
    { label: 'Cliques', value: '3.4K', change: '+5.1%', trend: 'up', icon: MousePointerClick },
  ];

  const statsCardsData = [
    {
      title: 'Total de Seguidores',
      value: '45.2K',
      change: { value: '+12.5%', type: 'increase' as const },
      icon: <Users className="w-5 h-5" />,
      description: 'vs. mês anterior'
    },
    {
      title: 'Engajamento',
      value: '8.7%',
      change: { value: '+2.3%', type: 'increase' as const },
      icon: <Heart className="w-5 h-5" />,
      description: 'vs. mês anterior'
    },
    {
      title: 'Alcance',
      value: '128K',
      change: { value: '+18.2%', type: 'increase' as const },
      icon: <Eye className="w-5 h-5" />,
      description: 'vs. mês anterior'
    },
    {
      title: 'Cliques',
      value: '3.4K',
      change: { value: '+5.1%', type: 'increase' as const },
      icon: <MousePointerClick className="w-5 h-5" />,
      description: 'vs. mês anterior'
    },
  ];

  const socialNetworksGrowth = [
    { name: 'Instagram', icon: Instagram, color: 'from-pink-500 to-purple-600', followers: '25.8K', growth: '+287%', engagement: '9.2%', posts: 145, avgLikes: 2340, avgComments: 156 },
    { name: 'Facebook', icon: Facebook, color: 'from-blue-600 to-blue-700', followers: '12.4K', growth: '+156%', engagement: '6.8%', posts: 98, avgLikes: 890, avgComments: 67 },
    { name: 'LinkedIn', icon: Linkedin, color: 'from-blue-700 to-blue-800', followers: '7.0K', growth: '+198%', engagement: '11.5%', posts: 76, avgLikes: 1240, avgComments: 89 },
  ];

  const growthData = [
    { month: 'Jan', seguidores: 12000, engajamento: 4.2 },
    { month: 'Fev', seguidores: 15500, engajamento: 5.1 },
    { month: 'Mar', seguidores: 19800, engajamento: 6.3 },
    { month: 'Abr', seguidores: 25400, engajamento: 7.2 },
    { month: 'Mai', seguidores: 32100, engajamento: 7.9 },
    { month: 'Jun', seguidores: 45200, engajamento: 8.7 },
  ];

  const getDefaultSections = (uid: string): DashboardSection[] => [
    {
      id: 'stats-cards',
      component: (
        <motion.div
          key="stats-cards"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <StatsCards stats={statsCardsData} columns={4} />
        </motion.div>
      ),
    },
    {
      id: 'highlights-quick',
      component: (
        <div key="highlights-quick" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Destaques com DisplayCards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="border-border/60 h-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#1672d6]" />
                    Destaques
                  </span>
                  <Button variant="ghost" size="sm" className="text-[#1672d6]">
                    Ver todos
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center py-6">
                <DisplayCards />
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar - Próxima Reunião e Atividades */}
          <div className="space-y-6">
            {/* Próxima Reunião */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-border/60 bg-gradient-to-br from-[#001533] to-[#1672d6] text-white">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-white/20">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-white/70">Próxima Reunião</p>
                      <p className="font-semibold">{clienteData.proximaReuniao}</p>
                    </div>
                  </div>
                  <p className="text-sm text-white/80 mb-4">
                    Reunião de alinhamento estratégico com seu gestor de conta.
                  </p>
                  <Button variant="secondary" className="w-full bg-white text-[#001533] hover:bg-white/90">
                    Confirmar Presença
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Atividades Recentes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-border/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold flex items-center justify-between">
                    Atividades Recentes
                    <Button variant="ghost" size="sm" className="text-[#1672d6] text-xs">
                      Ver todas
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {atividadesRecentes.slice(0, 3).map((atividade, index) => (
                      <div key={atividade.id}>
                        <div className="flex items-start gap-3 py-2 hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors cursor-pointer">
                          <div className="w-2 h-2 rounded-full bg-[#1672d6] mt-2 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground line-clamp-1">
                              {atividade.titulo}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {atividade.tempo}
                            </p>
                          </div>
                        </div>
                        {index < 2 && <Separator className="ml-5" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      ),
    },
    {
      id: 'quick-links',
      component: (
        <motion.div
          key="quick-links"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border/60">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#1672d6]" />
                Acesso Rápido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickLinks.map((link, index) => {
                  const Icon = link.icon;
                  return (
                    <motion.a
                      key={index}
                      href={link.href}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex flex-col items-center gap-3 p-4 rounded-xl border border-border/60 bg-card hover:border-[#1672d6]/40 hover:shadow-lg hover:shadow-[#1672d6]/5 transition-all cursor-pointer"
                    >
                      <div className="p-3 rounded-lg bg-[#1672d6]/10">
                        <Icon className="w-6 h-6 text-[#1672d6]" />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {link.label}
                      </span>
                    </motion.a>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ),
    },
    {
      id: 'ai-recommendations',
      component: (
        <motion.div
          key="ai-recommendations"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-2 border-[#1672d6]/20 bg-gradient-to-br from-[#1672d6]/5 via-white to-purple-50/30">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-[#001533] to-[#1672d6] rounded-xl shadow-lg shadow-[#1672d6]/20">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-foreground">Recomendações da IA ✨</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Baseado na sua performance atual</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <motion.div 
                whileHover={{ y: -2 }}
                className="p-4 bg-card rounded-xl border-2 border-purple-100 hover:border-purple-300 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">Tráfego Pago Recomendado</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Seu engajamento orgânico cresceu 287%. Investir em tráfego pago agora pode acelerar seu crescimento em até 3x.
                    </p>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </motion.div>
              <motion.div 
                whileHover={{ y: -2 }}
                className="p-4 bg-card rounded-xl border-2 border-blue-100 hover:border-blue-300 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#1672d6] rounded-full mt-2"></div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">Vídeos Curtos em Alta</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Seu público está 45% mais engajado com vídeos de 15-30 segundos. Recomendamos aumentar a produção de Reels.
                    </p>
                    <Button size="sm" className="bg-[#1672d6] hover:bg-[#1672d6]/90">
                      Solicitar Produção
                    </Button>
                  </div>
                </div>
              </motion.div>
              <motion.div 
                whileHover={{ y: -2 }}
                className="p-4 bg-card rounded-xl border-2 border-emerald-100 hover:border-emerald-300 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-1">LinkedIn B2B Strategy</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      Seu perfil no LinkedIn tem crescimento 198% acima da média. Considere expandir para LinkedIn Ads B2B.
                    </p>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                      Agendar Reunião
                    </Button>
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      ),
    },
    {
      id: 'before-after',
      component: <BeforeAfterSection key="before-after" clientId={uid} />,
    },
    {
      id: 'traffic-metrics',
      component: <TrafficMetricsSection key="traffic-metrics" clientId={uid} />,
    },
    {
      id: 'commercial-metrics',
      component: <CommercialMetricsSection key="commercial-metrics" clientName={clientName} />,
    },
    {
      id: 'ai-performance',
      component: <AIPerformanceSummary key="ai-performance" clientName={clientName} />,
    },
    {
      id: 'sentiment-analysis',
      component: <SentimentAnalysis key="sentiment-analysis" />,
    },
    {
      id: 'competitor-analysis',
      component: <CompetitorAnalysis key="competitor-analysis" />,
    },
    {
      id: 'growth-chart',
      component: (
        <motion.div
          key="growth-chart"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#1672d6]" />
                Crescimento nas Redes Sociais
              </CardTitle>
              <p className="text-sm text-muted-foreground">Evolução mês a mês</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '2px solid #1672d6', 
                      borderRadius: '8px',
                      color: 'hsl(var(--foreground))'
                    }} 
                  />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="seguidores" stroke="#1672d6" strokeWidth={3} name="Seguidores" />
                  <Line yAxisId="right" type="monotone" dataKey="engajamento" stroke="#10b981" strokeWidth={3} name="Engajamento %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      ),
    },
    {
      id: 'social-networks',
      component: (
        <motion.div 
          key="social-networks" 
          className="grid md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {socialNetworksGrowth.map((network, index) => {
            const Icon = network.icon;
            return (
              <motion.div
                key={network.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card className="border-border/60 hover:shadow-xl hover:shadow-[#1672d6]/5 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${network.color} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <Badge className="bg-emerald-600 text-white text-sm">{network.growth}</Badge>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-4">{network.name}</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm text-muted-foreground">Seguidores</span>
                        <span className="text-lg font-bold text-foreground">{network.followers}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-[#1672d6]/5 rounded-lg">
                        <span className="text-sm text-[#1672d6]">Engajamento</span>
                        <span className="text-lg font-bold text-[#1672d6]">{network.engagement}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        <div className="text-center p-2 bg-card rounded-lg border border-border/60">
                          <p className="text-xs text-muted-foreground">Posts</p>
                          <p className="text-sm font-bold text-foreground">{network.posts}</p>
                        </div>
                        <div className="text-center p-2 bg-card rounded-lg border border-border/60">
                          <ThumbsUp className="w-3 h-3 mx-auto mb-1 text-muted-foreground" />
                          <p className="text-sm font-bold text-foreground">{network.avgLikes}</p>
                        </div>
                        <div className="text-center p-2 bg-card rounded-lg border border-border/60">
                          <MessageCircle className="w-3 h-3 mx-auto mb-1 text-muted-foreground" />
                          <p className="text-sm font-bold text-foreground">{network.avgComments}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      ),
    },
    {
      id: 'market-news',
      component: (
        <motion.div
          key="market-news"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <FeatureGrid 
            title="Inteligência de Mercado"
            subtitle="Acompanhe as últimas notícias e movimentações do seu setor"
          />
        </motion.div>
      ),
    },
  ];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);

        if (userId) {
          const orderIds = newOrder.map(s => s.id);
          localStorage.setItem(`dashboard_layout_${userId}`, JSON.stringify(orderIds));
        }

        return newOrder;
      });
    }
  };

  const resetLayout = () => {
    if (userId) {
      localStorage.removeItem(`dashboard_layout_${userId}`);
      setSections(getDefaultSections(userId));
    }
  };

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-16 h-16 border-4 border-[#1672d6] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#001533] to-[#1672d6] flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="font-semibold text-foreground">Valle AI</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#1672d6] text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
            <Avatar className="h-9 w-9 border-2 border-[#1672d6]/20">
              <AvatarImage src={clienteData.avatar} />
              <AvatarFallback className="bg-[#1672d6]/10 text-[#1672d6] font-semibold">
                {clienteData.nome.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Olá, {clientName}! 👋
              </h1>
              <p className="text-muted-foreground mt-1">
                Aqui está o resumo da sua conta {clienteData.empresa}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="outline" className="border-[#1672d6]/30 text-[#1672d6]">
                Plano {clienteData.plano}
              </Badge>
              {isCustomizing && (
                <Button
                  onClick={resetLayout}
                  variant="outline"
                  className="border-border text-foreground hover:bg-muted"
                >
                  Restaurar Padrão
                </Button>
              )}
              <Button
                onClick={() => setIsCustomizing(!isCustomizing)}
                className={isCustomizing ? 'bg-[#1672d6] hover:bg-[#1672d6]/90' : 'bg-muted text-foreground hover:bg-muted/80'}
              >
                <Settings className="w-4 h-4 mr-2" />
                {isCustomizing ? 'Concluir' : 'Personalizar'}
              </Button>
            </div>
          </div>
        </motion.div>

        {isCustomizing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-2 border-[#1672d6]/20 bg-[#1672d6]/5 mb-6">
              <CardContent className="p-4 flex items-center gap-3">
                <GripVertical className="w-5 h-5 text-[#1672d6]" />
                <p className="text-sm text-foreground">
                  <strong>Modo de Personalização Ativo:</strong> Arraste as seções usando o ícone ao lado esquerdo para reordenar seu dashboard
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-6 pl-8">
              {sections.map((section) => (
                isCustomizing ? (
                  <SortableSection key={section.id} id={section.id}>
                    {section.component}
                  </SortableSection>
                ) : (
                  <div key={section.id}>{section.component}</div>
                )
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </main>
    </div>
  );
}
