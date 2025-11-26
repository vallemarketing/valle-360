'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface DashboardSection {
  id: string;
  component: React.ReactNode;
}

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
        <GripVertical className="w-6 h-6 text-valle-silver-400 hover:text-valle-blue-600" />
      </div>
      {children}
    </div>
  );
}

export default function ClienteDashboard() {
  const router = useRouter();
  const clientName = 'Guilherme';
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

  const getDefaultSections = (uid: string): DashboardSection[] => [
    {
      id: 'ai-recommendations',
      component: (
        <Card key="ai-recommendations" className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-white to-pink-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-valle-navy-900">Recomendações da IA ✨</CardTitle>
                <p className="text-sm text-valle-silver-600 mt-1">Baseado na sua performance atual</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 bg-white rounded-xl border-2 border-purple-100 hover:border-purple-300 transition-all cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <h4 className="font-semibold text-valle-navy-900 mb-1">Tráfego Pago Recomendado</h4>
                  <p className="text-sm text-valle-silver-700 mb-2">
                    Seu engajamento orgânico cresceu 287%. Investir em tráfego pago agora pode acelerar seu crescimento em até 3x.
                  </p>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white rounded-xl border-2 border-blue-100 hover:border-blue-300 transition-all cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <h4 className="font-semibold text-valle-navy-900 mb-1">Vídeos Curtos em Alta</h4>
                  <p className="text-sm text-valle-silver-700 mb-2">
                    Seu público está 45% mais engajado com vídeos de 15-30 segundos. Recomendamos aumentar a produção de Reels.
                  </p>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Solicitar Produção
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-4 bg-white rounded-xl border-2 border-emerald-100 hover:border-emerald-300 transition-all cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <h4 className="font-semibold text-valle-navy-900 mb-1">LinkedIn B2B Strategy</h4>
                  <p className="text-sm text-valle-silver-700 mb-2">
                    Seu perfil no LinkedIn tem crescimento 198% acima da média. Considere expandir para LinkedIn Ads B2B.
                  </p>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                    Agendar Reunião
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
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
      id: 'quick-metrics',
      component: (
        <div key="quick-metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const isPositive = metric.trend === 'up';
            return (
              <Card key={metric.label} className="hover:shadow-lg transition-all border-2 border-valle-silver-200 hover:border-valle-blue-400">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-valle-blue-50 rounded-lg">
                      <Icon className="w-5 h-5 text-valle-blue-600" />
                    </div>
                    <Badge className={isPositive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}>{metric.change}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-valle-silver-600">{metric.label}</p>
                    <p className="text-2xl font-bold text-valle-navy-900">{metric.value}</p>
                  </div>
                  <div className="mt-2 flex items-center text-xs text-valle-silver-600">
                    {isPositive ? <TrendingUp className="w-3 h-3 mr-1 text-green-600" /> : <TrendingDown className="w-3 h-3 mr-1 text-red-600" />}
                    vs. mês anterior
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ),
    },
    {
      id: 'growth-chart',
      component: (
        <Card key="growth-chart" className="border-2 border-valle-blue-200">
          <CardHeader>
            <CardTitle className="text-valle-navy-900">Crescimento nas Redes Sociais</CardTitle>
            <p className="text-sm text-valle-silver-600">Evolução mês a mês</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="month" stroke="#757575" />
                <YAxis yAxisId="left" stroke="#757575" />
                <YAxis yAxisId="right" orientation="right" stroke="#757575" />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '2px solid #2563eb', borderRadius: '8px' }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="seguidores" stroke="#2563eb" strokeWidth={3} name="Seguidores" />
                <Line yAxisId="right" type="monotone" dataKey="engajamento" stroke="#10b981" strokeWidth={3} name="Engajamento %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ),
    },
    {
      id: 'social-networks',
      component: (
        <div key="social-networks" className="grid md:grid-cols-3 gap-6">
          {socialNetworksGrowth.map((network) => {
            const Icon = network.icon;
            return (
              <Card key={network.name} className="border-2 border-valle-silver-200 hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${network.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge className="bg-green-600 text-white text-sm">{network.growth}</Badge>
                  </div>
                  <h3 className="text-xl font-bold text-valle-navy-900 mb-4">{network.name}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-valle-silver-50 rounded-lg">
                      <span className="text-sm text-valle-silver-700">Seguidores</span>
                      <span className="text-lg font-bold text-valle-navy-900">{network.followers}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-valle-blue-50 rounded-lg">
                      <span className="text-sm text-valle-blue-700">Engajamento</span>
                      <span className="text-lg font-bold text-valle-blue-600">{network.engagement}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <div className="text-center p-2 bg-white rounded-lg border border-valle-silver-200">
                        <p className="text-xs text-valle-silver-600">Posts</p>
                        <p className="text-sm font-bold text-valle-navy-800">{network.posts}</p>
                      </div>
                      <div className="text-center p-2 bg-white rounded-lg border border-valle-silver-200">
                        <ThumbsUp className="w-3 h-3 mx-auto mb-1 text-valle-silver-600" />
                        <p className="text-sm font-bold text-valle-navy-800">{network.avgLikes}</p>
                      </div>
                      <div className="text-center p-2 bg-white rounded-lg border border-valle-silver-200">
                        <MessageCircle className="w-3 h-3 mx-auto mb-1 text-valle-silver-600" />
                        <p className="text-sm font-bold text-valle-navy-800">{network.avgComments}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
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

  const metrics = [
    { label: 'Total de Seguidores', value: '45.2K', change: '+12.5%', trend: 'up', icon: Users },
    { label: 'Engajamento', value: '8.7%', change: '+2.3%', trend: 'up', icon: Heart },
    { label: 'Alcance', value: '128K', change: '+18.2%', trend: 'up', icon: Eye },
    { label: 'Cliques', value: '3.4K', change: '+5.1%', trend: 'up', icon: MousePointerClick },
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

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-valle-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-valle-navy-900">Olá, {clientName}, sejam bem-vindo! 👋</h1>
          <p className="text-lg text-valle-silver-600">Sempre bom te ver por aqui</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {isCustomizing && (
            <Button
              onClick={resetLayout}
              variant="outline"
              className="border-valle-silver-300 text-valle-navy-700 hover:bg-valle-silver-100"
            >
              Restaurar Padrão
            </Button>
          )}
          <Button
            onClick={() => setIsCustomizing(!isCustomizing)}
            className={isCustomizing ? 'bg-valle-blue-600 hover:bg-valle-blue-700' : 'bg-valle-silver-600 hover:bg-valle-silver-700'}
          >
            <Settings className="w-4 h-4 mr-2" />
            {isCustomizing ? 'Concluir' : 'Personalizar'}
          </Button>
        </div>
      </div>

      {isCustomizing && (
        <Card className="border-2 border-valle-blue-200 bg-gradient-to-r from-valle-blue-50 to-white">
          <CardContent className="p-4 flex items-center gap-3">
            <GripVertical className="w-5 h-5 text-valle-blue-600" />
            <p className="text-sm text-valle-navy-700">
              <strong>Modo de Personalização Ativo:</strong> Arraste as seções usando o ícone ao lado esquerdo para reordenar seu dashboard
            </p>
          </CardContent>
        </Card>
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
    </div>
  );
}
