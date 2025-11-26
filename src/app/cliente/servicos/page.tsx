'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  TrendingUp,
  PenTool,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Star,
  Check,
} from 'lucide-react';

const categories = [
  { id: 'all', name: 'Todos', icon: Sparkles },
  { id: 'marketing', name: 'Marketing', icon: TrendingUp },
  { id: 'sales', name: 'Vendas', icon: Users },
  { id: 'service', name: 'Atendimento', icon: MessageSquare },
  { id: 'commercial', name: 'Comercial', icon: PenTool },
];

const services = [
  {
    id: 1,
    name: 'Social Media Pro',
    category: 'marketing',
    description: 'Gestão completa de redes sociais com planejamento estratégico',
    features: ['Planejamento mensal', 'Criação de conteúdo', 'Análise de métricas', 'Suporte 24/7'],
    price: 'R$ 2.500',
    isFeatured: true,
    recommended: true,
    recommendationReason: 'Seu engajamento pode aumentar 40%',
  },
  {
    id: 2,
    name: 'Tráfego Pago Estratégico',
    category: 'sales',
    description: 'Campanhas otimizadas para conversão máxima',
    features: ['Gestão de campanhas', 'Otimização de ROAS', 'Relatórios semanais', 'A/B Testing'],
    price: 'R$ 3.200',
    isFeatured: true,
    recommended: true,
    recommendationReason: 'ROAS estimado: 5.2x',
  },
  {
    id: 3,
    name: 'Produção de Vídeo',
    category: 'marketing',
    description: 'Criação de vídeos profissionais para redes sociais',
    features: ['Roteiro', 'Gravação', 'Edição', 'Legendas'],
    price: 'R$ 1.800',
    isFeatured: false,
    recommended: true,
    recommendationReason: 'Vídeos têm 85% mais engajamento',
  },
  {
    id: 4,
    name: 'Design Gráfico',
    category: 'marketing',
    description: 'Criação de peças visuais impactantes',
    features: ['Posts', 'Stories', 'Banners', 'Identidade visual'],
    price: 'R$ 1.500',
    isFeatured: false,
    recommended: false,
  },
  {
    id: 5,
    name: 'Copywriting Estratégico',
    category: 'sales',
    description: 'Textos persuasivos que convertem',
    features: ['Copies para ads', 'E-mail marketing', 'Landing pages', 'Scripts de venda'],
    price: 'R$ 1.200',
    isFeatured: false,
    recommended: false,
  },
  {
    id: 6,
    name: 'Consultoria de Marca',
    category: 'commercial',
    description: 'Posicionamento estratégico da sua marca',
    features: ['Análise de mercado', 'Definição de personas', 'Estratégia de comunicação', 'Plano de ação'],
    price: 'R$ 4.500',
    isFeatured: true,
    recommended: false,
  },
  {
    id: 7,
    name: 'Atendimento Digital',
    category: 'service',
    description: 'Atendimento humanizado em redes sociais',
    features: ['Resposta de mensagens', 'Gestão de comentários', 'Suporte ao cliente', 'Relatórios'],
    price: 'R$ 2.000',
    isFeatured: false,
    recommended: false,
  },
  {
    id: 8,
    name: 'Desenvolvimento Web',
    category: 'marketing',
    description: 'Sites e landing pages de alta conversão',
    features: ['Design responsivo', 'Otimização SEO', 'Integração com ferramentas', 'Suporte técnico'],
    price: 'R$ 5.000',
    isFeatured: false,
    recommended: false,
  },
];

export default function ServicosPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredServices = services.filter(
    (service) => selectedCategory === 'all' || service.category === selectedCategory
  );

  const recommendedServices = filteredServices.filter((s) => s.recommended);
  const otherServices = filteredServices.filter((s) => !s.recommended);

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nossos Serviços</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Soluções especializadas para impulsionar seu negócio
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = selectedCategory === category.id;

          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-valle-charcoal text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {category.name}
            </button>
          );
        })}
      </div>

      {recommendedServices.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-valle-steel" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Recomendados para Você
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendedServices.map((service) => (
              <Card
                key={service.id}
                className="hover:shadow-xl transition-all border-2 border-valle-silver dark:border-valle-charcoal/30"
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                      {service.isFeatured && (
                        <Badge className="mt-2 bg-valle-platinum text-valle-charcoal">
                          <Star className="w-3 h-3 mr-1" />
                          Destaque
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-valle-steel font-medium mt-2 p-2 bg-valle-platinum dark:bg-valle-charcoal/20 rounded-md">
                    <Sparkles className="w-4 h-4" />
                    {service.recommendationReason}
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {service.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    {service.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                    {service.features.length > 3 && (
                      <p className="text-xs text-gray-500 ml-6">
                        +{service.features.length - 3} benefícios
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">A partir de</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{service.price}</p>
                    </div>
                    <Button className="bg-valle-charcoal hover:bg-valle-steel">
                      Contratar
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {otherServices.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Todos os Serviços</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherServices.map((service) => (
              <Card key={service.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    {service.isFeatured && (
                      <Badge variant="secondary">
                        <Star className="w-3 h-3 mr-1" />
                        Destaque
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {service.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    {service.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                    {service.features.length > 3 && (
                      <p className="text-xs text-gray-500 ml-6">
                        +{service.features.length - 3} benefícios
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">A partir de</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{service.price}</p>
                    </div>
                    <Button variant="outline">
                      Saiba Mais
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
