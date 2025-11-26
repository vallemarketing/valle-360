'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smile, Meh, Frown, TrendingUp, MessageCircle } from 'lucide-react';

export function SentimentAnalysis() {
  const sentimentData = {
    positive: 72,
    neutral: 21,
    negative: 7,
    totalMentions: 1847,
    trend: '+15%',
    topPositiveKeywords: ['qualidade', 'excelente', 'recomendo', 'satisfeito', 'ótimo'],
    topNegativeKeywords: ['demora', 'preço', 'atendimento'],
  };

  const sentiments = [
    {
      type: 'Positivo',
      percentage: sentimentData.positive,
      icon: Smile,
      color: 'text-green-600',
      bg: 'bg-green-100',
      borderColor: 'border-green-300',
    },
    {
      type: 'Neutro',
      percentage: sentimentData.neutral,
      icon: Meh,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
      borderColor: 'border-yellow-300',
    },
    {
      type: 'Negativo',
      percentage: sentimentData.negative,
      icon: Frown,
      color: 'text-red-600',
      bg: 'bg-red-100',
      borderColor: 'border-red-300',
    },
  ];

  return (
    <Card className="border-2 border-valle-silver-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-valle-navy-900 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-valle-blue-600" />
            Análise de Sentimento
          </CardTitle>
          <Badge className="bg-gradient-to-r from-valle-blue-600 to-valle-blue-700 text-white">
            <TrendingUp className="w-3 h-3 mr-1" />
            {sentimentData.trend}
          </Badge>
        </div>
        <p className="text-sm text-valle-silver-600">
          Análise de {sentimentData.totalMentions.toLocaleString()} menções da sua marca
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          {sentiments.map((sentiment) => {
            const Icon = sentiment.icon;
            return (
              <div
                key={sentiment.type}
                className={`p-4 rounded-xl border-2 ${sentiment.borderColor} ${sentiment.bg} hover:shadow-lg transition-all`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm`}>
                    <Icon className={`w-6 h-6 ${sentiment.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-valle-silver-700 font-medium">{sentiment.type}</p>
                    <p className={`text-3xl font-bold ${sentiment.color}`}>{sentiment.percentage}%</p>
                  </div>
                </div>

                <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      sentiment.type === 'Positivo'
                        ? 'bg-green-600'
                        : sentiment.type === 'Neutro'
                        ? 'bg-yellow-600'
                        : 'bg-red-600'
                    }`}
                    style={{ width: `${sentiment.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
            <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
              <Smile className="w-4 h-4" />
              Palavras Mais Positivas
            </h4>
            <div className="flex flex-wrap gap-2">
              {sentimentData.topPositiveKeywords.map((keyword, i) => (
                <Badge key={i} className="bg-green-600 text-white">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>

          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
              <Frown className="w-4 h-4" />
              Pontos de Atenção
            </h4>
            <div className="flex flex-wrap gap-2">
              {sentimentData.topNegativeKeywords.map((keyword, i) => (
                <Badge key={i} className="bg-red-600 text-white">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-valle-blue-50 border-2 border-valle-blue-200 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-valle-blue-600 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-valle-navy-800 mb-1">Percepção da Marca em Alta</h4>
              <p className="text-sm text-valle-navy-700">
                Sua marca está sendo muito bem avaliada! {sentimentData.positive}% das menções são positivas,
                superando a média do mercado (58%). Continue investindo na qualidade do atendimento e produto.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
