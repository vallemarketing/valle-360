import { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import { Sparkles, TrendingUp, Lightbulb, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'IA - Colaborador | Valle 360',
};

const suggestions = [
  {
    icon: TrendingUp,
    title: 'Tendência: Reels curtos em alta',
    description: 'Conteúdos de 7-15 segundos estão gerando 40% mais engajamento',
    link: 'https://example.com',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Lightbulb,
    title: 'Estratégia: Teste A/B de criativos',
    description: 'Implemente testes com variações de copy para melhorar CTR',
    link: 'https://example.com',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: BookOpen,
    title: 'Curso: Meta Ads avançado',
    description: 'Aprenda técnicas de otimização de campanhas de performance',
    link: 'https://example.com',
    color: 'from-emerald-500 to-teal-500',
  },
];

export default function EmployeeIAPage() {
  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Assistente IA</h1>
          </div>
          <p className="text-sm text-gray-600">
            Sugestões personalizadas para Tráfego Pago
          </p>
        </div>

        <div className="space-y-4">
          {suggestions.map((suggestion, i) => {
            const Icon = suggestion.icon;
            return (
              <Card key={i} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className={`p-3 bg-gradient-to-br ${suggestion.color} rounded-xl`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {suggestion.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {suggestion.description}
                    </p>
                    <div className="flex items-center gap-3">
                      <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                        Ver detalhes →
                      </button>
                      <button className="text-sm text-gray-500 hover:text-gray-700">
                        Útil 👍
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-2">
            💡 Dica do dia
          </h3>
          <p className="text-sm text-gray-700">
            Clientes que visualizam o dashboard regularmente têm 30% mais satisfação.
            Compartilhe insights semanais!
          </p>
        </Card>
      </div>
    </div>
  );
}
