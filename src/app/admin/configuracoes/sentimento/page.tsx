'use client';

/**
 * Valle 360 - Configuração de Análise de Sentimento
 * Permite escolher o provedor de IA para análise de sentimento
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Settings,
  Zap,
  Globe,
  MessageSquare,
  BarChart3,
  Play,
  RefreshCw,
  Info,
  ChevronRight,
  Save,
  TestTube
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Image from 'next/image';

// =====================================================
// TIPOS
// =====================================================

type SentimentProvider = 'openai' | 'google' | 'claude' | 'auto';

interface ProviderConfig {
  id: SentimentProvider;
  name: string;
  description: string;
  logo: string;
  strengths: string[];
  weaknesses: string[];
  bestFor: string[];
  pricing: string;
  status: 'active' | 'inactive' | 'error';
  responseTime: number; // ms
}

interface TestResult {
  provider: SentimentProvider;
  result: {
    overall: string;
    score: number;
    confidence: number;
    time: number;
  } | null;
  error?: string;
}

// =====================================================
// DADOS DOS PROVEDORES
// =====================================================

const PROVIDERS: ProviderConfig[] = [
  {
    id: 'openai',
    name: 'OpenAI GPT-4',
    description: 'Análise avançada com compreensão contextual profunda e detecção de emoções',
    logo: '/integrations/openai.svg',
    strengths: [
      'Excelente compreensão contextual',
      'Detecção de emoções detalhada',
      'Funciona bem com textos complexos',
      'Suporta múltiplos idiomas'
    ],
    weaknesses: [
      'Custo mais alto por requisição',
      'Pode ser mais lento',
      'Requer mais tokens'
    ],
    bestFor: [
      'Análise de feedbacks detalhados',
      'Textos longos e complexos',
      'Quando precisa de resumos'
    ],
    pricing: '~$0.03 por 1K tokens',
    status: 'active',
    responseTime: 1500
  },
  {
    id: 'google',
    name: 'Google Cloud NLP',
    description: 'API nativa do Google com suporte otimizado para português brasileiro',
    logo: '/integrations/google.svg',
    strengths: [
      'Melhor precisão em português',
      'Análise por sentença',
      'Detecção de entidades',
      'Mais rápido e econômico'
    ],
    weaknesses: [
      'Menos detalhes emocionais',
      'Sem geração de resumos',
      'API mais técnica'
    ],
    bestFor: [
      'Textos em português',
      'Alto volume de análises',
      'Análise de reviews'
    ],
    pricing: '~$1.00 por 1K requisições',
    status: 'active',
    responseTime: 800
  },
  {
    id: 'claude',
    name: 'Anthropic Claude',
    description: 'IA conversacional com análise nuançada e segura',
    logo: '/integrations/anthropic.svg',
    strengths: [
      'Análise muito nuançada',
      'Excelente em contextos sensíveis',
      'Menos viés',
      'Explicações detalhadas'
    ],
    weaknesses: [
      'Pode ser conservador demais',
      'Custo intermediário',
      'API menos madura'
    ],
    bestFor: [
      'Conteúdo sensível',
      'Análises que requerem cuidado',
      'Quando precisa de explicações'
    ],
    pricing: '~$0.025 por 1K tokens',
    status: 'active',
    responseTime: 1200
  }
];

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

export default function SentimentConfigPage() {
  const [selectedProvider, setSelectedProvider] = useState<SentimentProvider>('auto');
  const [fallbackProvider, setFallbackProvider] = useState<SentimentProvider>('google');
  const [enableAutoSelect, setEnableAutoSelect] = useState(true);
  const [testText, setTestText] = useState('O serviço foi excelente! Muito satisfeito com o atendimento e a qualidade do produto.');
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Carregar configuração salva
  useEffect(() => {
    const saved = localStorage.getItem('valle360_sentiment_config');
    if (saved) {
      const config = JSON.parse(saved);
      setSelectedProvider(config.defaultProvider || 'auto');
      setFallbackProvider(config.fallbackProvider || 'google');
      setEnableAutoSelect(config.enableAutoSelect ?? true);
    }
  }, []);

  // Salvar configuração
  const handleSave = () => {
    setIsSaving(true);
    const config = {
      defaultProvider: selectedProvider,
      fallbackProvider,
      enableAutoSelect
    };
    localStorage.setItem('valle360_sentiment_config', JSON.stringify(config));
    
    setTimeout(() => {
      setIsSaving(false);
      toast.success('✅ Configuração salva com sucesso!');
    }, 500);
  };

  // Testar análise de sentimento
  const handleTest = async () => {
    if (!testText.trim()) {
      toast.error('Digite um texto para testar');
      return;
    }

    setIsTestRunning(true);
    setTestResults([]);

    const providers: SentimentProvider[] = ['openai', 'google', 'claude'];
    const results: TestResult[] = [];

    for (const provider of providers) {
      try {
        const startTime = Date.now();
        
        // Simular chamada à API (em produção, chamaria o endpoint real)
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
        
        // Resultado simulado
        const score = Math.random() * 2 - 1; // -1 a 1
        let overall: string;
        if (score > 0.25) overall = 'positive';
        else if (score < -0.25) overall = 'negative';
        else overall = 'neutral';

        results.push({
          provider,
          result: {
            overall,
            score: parseFloat(score.toFixed(2)),
            confidence: parseFloat((0.7 + Math.random() * 0.3).toFixed(2)),
            time: Date.now() - startTime
          }
        });
      } catch (error: any) {
        results.push({
          provider,
          result: null,
          error: error.message
        });
      }

      // Atualizar resultados incrementalmente
      setTestResults([...results]);
    }

    setIsTestRunning(false);
    toast.success('🧪 Teste concluído!');
  };

  const getProviderStatus = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700 border-green-300">Ativo</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-700 border-gray-300">Inativo</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-700 border-red-300">Erro</Badge>;
      default:
        return null;
    }
  };

  const getSentimentColor = (overall: string) => {
    switch (overall) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSentimentEmoji = (overall: string) => {
    switch (overall) {
      case 'positive': return '😊';
      case 'negative': return '😞';
      default: return '😐';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Configuração de Análise de Sentimento
              </h1>
              <p className="text-gray-500">
                Escolha qual provedor de IA usar para análise de sentimento
              </p>
            </div>
          </div>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#1672d6] hover:bg-[#1260b5]"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar Configuração
          </Button>
        </div>

        {/* Configuração Principal */}
        <Card className="border-2 border-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              Provedor Padrão
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Opções de Provedor */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Auto */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedProvider('auto')}
                className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedProvider === 'auto'
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {selectedProvider === 'auto' && (
                  <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-blue-600" />
                )}
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold">Auto Seleção</h3>
                  <p className="text-xs text-gray-500">
                    IA escolhe o melhor provedor automaticamente
                  </p>
                </div>
              </motion.div>

              {/* Provedores */}
              {PROVIDERS.map((provider) => (
                <motion.div
                  key={provider.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedProvider(provider.id)}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedProvider === provider.id
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {selectedProvider === provider.id && (
                    <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-blue-600" />
                  )}
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-white shadow flex items-center justify-center">
                      {provider.id === 'openai' && <span className="text-2xl">🤖</span>}
                      {provider.id === 'google' && <span className="text-2xl">🔍</span>}
                      {provider.id === 'claude' && <span className="text-2xl">🧠</span>}
                    </div>
                    <h3 className="font-semibold">{provider.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {provider.description}
                    </p>
                    {getProviderStatus(provider.status)}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Opções Avançadas */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium mb-2">Provedor de Fallback</label>
                <select
                  value={fallbackProvider}
                  onChange={(e) => setFallbackProvider(e.target.value as SentimentProvider)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="openai">OpenAI GPT-4</option>
                  <option value="google">Google Cloud NLP</option>
                  <option value="claude">Anthropic Claude</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Usado quando o provedor principal falha
                </p>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableAutoSelect}
                    onChange={(e) => setEnableAutoSelect(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-medium">Seleção Automática por Idioma</span>
                    <p className="text-xs text-gray-500">
                      Usa Google para português, OpenAI para inglês
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detalhes dos Provedores */}
        <div className="grid grid-cols-3 gap-4">
          {PROVIDERS.map((provider) => (
            <Card key={provider.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {provider.id === 'openai' && <span>🤖</span>}
                    {provider.id === 'google' && <span>🔍</span>}
                    {provider.id === 'claude' && <span>🧠</span>}
                    {provider.name}
                  </CardTitle>
                  {getProviderStatus(provider.status)}
                </div>
                <p className="text-sm text-gray-500">{provider.pricing}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-green-700 mb-1">✅ Pontos Fortes</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {provider.strengths.slice(0, 3).map((s, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <ChevronRight className="w-3 h-3 mt-0.5 text-green-500" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-700 mb-1">🎯 Melhor Para</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {provider.bestFor.slice(0, 2).map((s, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <ChevronRight className="w-3 h-3 mt-0.5 text-blue-500" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t">
                  <Zap className="w-3 h-3" />
                  Tempo médio: {provider.responseTime}ms
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Área de Teste */}
        <Card className="border-2 border-purple-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5 text-purple-600" />
              Testar Análise de Sentimento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Texto para Análise</label>
              <textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Digite um texto para testar a análise de sentimento..."
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 min-h-[100px]"
              />
            </div>

            <Button
              onClick={handleTest}
              disabled={isTestRunning}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isTestRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Testar Todos os Provedores
                </>
              )}
            </Button>

            {/* Resultados do Teste */}
            <AnimatePresence>
              {testResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-3 gap-4 pt-4 border-t"
                >
                  {testResults.map((test, idx) => (
                    <motion.div
                      key={test.provider}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`p-4 rounded-xl border-2 ${
                        test.result 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        {test.provider === 'openai' && <span>🤖</span>}
                        {test.provider === 'google' && <span>🔍</span>}
                        {test.provider === 'claude' && <span>🧠</span>}
                        <span className="font-medium capitalize">{test.provider}</span>
                      </div>

                      {test.result ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Sentimento:</span>
                            <span className={`font-medium ${getSentimentColor(test.result.overall)}`}>
                              {getSentimentEmoji(test.result.overall)} {test.result.overall}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Score:</span>
                            <span className="font-mono">{test.result.score}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Confiança:</span>
                            <span className="font-mono">{(test.result.confidence * 100).toFixed(0)}%</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                            <span>Tempo:</span>
                            <span>{test.result.time}ms</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4 inline mr-1" />
                          {test.error || 'Erro na análise'}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Dica de Configuração</p>
                <p>
                  Para análises em português brasileiro, recomendamos usar <strong>Google Cloud NLP</strong> como provedor padrão.
                  Para textos em inglês ou quando precisar de análises mais detalhadas com emoções, use <strong>OpenAI</strong>.
                  A opção <strong>Auto Seleção</strong> faz essa escolha automaticamente baseada no idioma detectado.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

