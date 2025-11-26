'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, Sparkles, TrendingUp, Calendar, Users, Target } from 'lucide-react';

const QUICK_PROMPTS = [
  { text: 'Quero uma análise geral da evolução da minha marca', icon: TrendingUp, color: 'from-valle-blue-500 to-valle-blue-600' },
  { text: 'Traga novidades do meu setor', icon: Target, color: 'from-green-500 to-green-600' },
  { text: 'Quero agendar uma reunião com a equipe que cuida da minha conta', icon: Calendar, color: 'from-purple-500 to-purple-600' },
  { text: 'O que meus concorrentes estão fazendo?', icon: Users, color: 'from-orange-500 to-orange-600' },
];

export default function IAPage() {
  const [rotation, setRotation] = useState(0);
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([
    {
      text: 'Olá! Sou a Val, sua assistente de IA. Como posso ajudá-lo hoje?',
      isUser: false,
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const clientName = 'Guilherme';

  useEffect(() => {
    const rotationInterval = setInterval(() => {
      setRotation((prev) => (prev + 1) % 360);
    }, 20);

    return () => clearInterval(rotationInterval);
  }, []);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    setMessages((prev) => [...prev, { text: inputValue, isUser: true }]);
    setInputValue('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          text: 'Estou processando sua solicitação. Em breve terei uma análise completa para você!',
          isUser: false,
        },
      ]);
    }, 1000);
  };

  const handleQuickPrompt = (prompt: string) => {
    setMessages((prev) => [...prev, { text: prompt, isUser: true }]);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          text: 'Perfeito! Estou processando sua solicitação e vou trazer insights personalizados para você em instantes.',
          isUser: false,
        },
      ]);
    }, 1000);
  };

  return (
    <div className="pb-24 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-valle-navy-900">Assistente IA Valle</h1>
        <p className="text-valle-silver-600 mt-2">Seu consultor inteligente de marketing</p>
      </div>

      <Card className="border-2 border-valle-blue-300 bg-gradient-to-br from-white via-valle-blue-50 to-valle-blue-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-valle-blue-300/40 to-transparent rounded-full blur-3xl animate-pulse" />

        <CardContent className="p-8 relative z-10">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-valle-blue-400 to-valle-blue-600 rounded-full blur-2xl opacity-50 animate-pulse" />

              <div
                className="relative w-32 h-32 rounded-full flex items-center justify-center shadow-2xl border-4 border-white"
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #9e9e9e 100%)',
                  transform: `rotate(${rotation}deg)`,
                  transition: 'transform 0.02s linear',
                }}
              >
                <div className="absolute inset-2 rounded-full border-2 border-dashed border-white/40" />

                <Sparkles className="w-16 h-16 text-white drop-shadow-lg" style={{ transform: `rotate(-${rotation}deg)` }} />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-valle-navy-900 mb-2">
              Olá, {clientName}! 👋
            </h2>
            <p className="text-valle-navy-700 max-w-2xl">
              Sou a <span className="font-bold text-valle-blue-600">Val</span>, sua assistente inteligente da Valle 360.
              Posso ajudá-lo com análises, insights do mercado, agendamentos e muito mais. Como posso te ajudar hoje?
            </p>

            <div className="flex items-center gap-2 mt-4">
              <Badge className="bg-green-600 text-white border-0">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse" />
                Online
              </Badge>
              <Badge className="bg-valle-blue-600 text-white border-0">
                IA Avançada
              </Badge>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {QUICK_PROMPTS.map((prompt, index) => {
              const Icon = prompt.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleQuickPrompt(prompt.text)}
                  className="group p-5 bg-white rounded-xl border-2 border-valle-silver-200 hover:border-valle-blue-400 hover:shadow-lg transition-all text-left"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${prompt.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-md`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-valle-navy-800 leading-relaxed group-hover:text-valle-blue-600 transition-colors">
                        {prompt.text}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-valle-silver-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-valle-navy-900 mb-4">Conversa com Val</h3>

          <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!message.isUser && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-valle-blue-500 to-valle-blue-600 flex items-center justify-center mr-3 flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] p-4 rounded-2xl ${
                    message.isUser
                      ? 'bg-gradient-to-br from-valle-blue-600 to-valle-blue-700 text-white ml-auto'
                      : 'bg-valle-silver-100 text-valle-navy-800'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Input
              placeholder="Digite sua mensagem..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              className="bg-gradient-to-r from-valle-blue-600 to-valle-blue-700 hover:from-valle-blue-700 hover:to-valle-blue-800"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          <p className="text-xs text-valle-silver-600 text-center mt-4">
            Val pode cometer erros. Considere verificar informações importantes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
