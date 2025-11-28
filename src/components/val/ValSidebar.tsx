'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Send, Sparkles, Loader2, Copy, Check, 
  Lightbulb, FileText, Target, TrendingUp,
  MessageSquare, Zap, ChevronDown
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: ActionButton[];
}

interface ActionButton {
  label: string;
  action: string;
  icon?: React.ReactNode;
}

interface QuickAction {
  id: string;
  label: string;
  prompt: string;
  icon: React.ReactNode;
}

const QUICK_ACTIONS: Record<string, QuickAction[]> = {
  comercial: [
    { id: '1', label: 'Texto de Upsell', prompt: 'Gere um texto persuasivo para oferecer serviços adicionais ao cliente', icon: <TrendingUp className="w-4 h-4" /> },
    { id: '2', label: 'Texto de Cobrança', prompt: 'Gere um texto amigável para cobrar um cliente inadimplente', icon: <FileText className="w-4 h-4" /> },
    { id: '3', label: 'Análise de Lead', prompt: 'Analise este lead e sugira a melhor abordagem', icon: <Target className="w-4 h-4" /> },
    { id: '4', label: 'Proposta Comercial', prompt: 'Me ajude a criar uma proposta comercial', icon: <Lightbulb className="w-4 h-4" /> },
  ],
  trafego: [
    { id: '1', label: 'Otimizar Campanha', prompt: 'Sugira otimizações para minhas campanhas de tráfego', icon: <TrendingUp className="w-4 h-4" /> },
    { id: '2', label: 'Analisar ROAS', prompt: 'Analise o ROAS das minhas campanhas e sugira melhorias', icon: <Target className="w-4 h-4" /> },
    { id: '3', label: 'Texto para Cliente', prompt: 'Gere um texto explicando a performance para o cliente', icon: <FileText className="w-4 h-4" /> },
    { id: '4', label: 'Budget Ideal', prompt: 'Qual o budget ideal para esta campanha?', icon: <Lightbulb className="w-4 h-4" /> },
  ],
  social_media: [
    { id: '1', label: 'Criar Legenda', prompt: 'Crie uma legenda criativa para este post', icon: <FileText className="w-4 h-4" /> },
    { id: '2', label: 'Sugerir Hashtags', prompt: 'Sugira as melhores hashtags para este conteúdo', icon: <Target className="w-4 h-4" /> },
    { id: '3', label: 'Melhor Horário', prompt: 'Qual o melhor horário para postar este conteúdo?', icon: <TrendingUp className="w-4 h-4" /> },
    { id: '4', label: 'Ideias de Conteúdo', prompt: 'Sugira ideias de conteúdo para esta semana', icon: <Lightbulb className="w-4 h-4" /> },
  ],
  designer: [
    { id: '1', label: 'Analisar Briefing', prompt: 'Analise este briefing e sugira melhorias', icon: <FileText className="w-4 h-4" /> },
    { id: '2', label: 'Referências', prompt: 'Sugira referências de design para este projeto', icon: <Lightbulb className="w-4 h-4" /> },
    { id: '3', label: 'Feedback de Arte', prompt: 'Dê feedback sobre esta arte', icon: <Target className="w-4 h-4" /> },
    { id: '4', label: 'Tendências', prompt: 'Quais as tendências de design atuais?', icon: <TrendingUp className="w-4 h-4" /> },
  ],
  default: [
    { id: '1', label: 'Priorizar Tarefas', prompt: 'Me ajude a priorizar minhas tarefas de hoje', icon: <Target className="w-4 h-4" /> },
    { id: '2', label: 'Resumir Semana', prompt: 'Resuma minha performance desta semana', icon: <TrendingUp className="w-4 h-4" /> },
    { id: '3', label: 'Dicas de Produtividade', prompt: 'Me dê dicas para ser mais produtivo', icon: <Lightbulb className="w-4 h-4" /> },
    { id: '4', label: 'Criar Tarefa', prompt: 'Me ajude a criar uma nova tarefa', icon: <FileText className="w-4 h-4" /> },
  ]
};

export function ValSidebar() {
  const { user, valChatOpen, setValChatOpen } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (valChatOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [valChatOpen]);

  // Get quick actions based on user role
  const quickActions = QUICK_ACTIONS[user?.role || 'default'] || QUICK_ACTIONS.default;

  // Send message to Val
  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowQuickActions(false);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          context: {
            userName: user?.fullName,
            userRole: user?.role,
            userArea: user?.area
          }
        })
      });

      if (!response.ok) throw new Error('Erro na resposta');

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || data.content || 'Desculpe, não consegui processar sua solicitação.',
        timestamp: new Date(),
        actions: data.actions
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro. Tente novamente em alguns instantes.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle quick action click
  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.prompt);
  };

  // Copy message to clipboard
  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Clear chat
  const clearChat = () => {
    setMessages([]);
    setShowQuickActions(true);
  };

  if (!valChatOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed right-0 top-0 h-full w-full sm:w-[420px] z-50 flex flex-col shadow-2xl"
        style={{ backgroundColor: 'var(--bg-primary)' }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 border-b"
          style={{ 
            background: 'linear-gradient(135deg, var(--purple-500) 0%, var(--primary-500) 100%)',
            borderColor: 'var(--border-light)'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white">Val</h2>
              <p className="text-xs text-white/80">Assistente IA Valle 360</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white text-xs"
              >
                Limpar
              </button>
            )}
            <button
              onClick={() => setValChatOpen(false)}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Welcome message */}
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: 'var(--purple-100)' }}
              >
                <Sparkles className="w-8 h-8" style={{ color: 'var(--purple-500)' }} />
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
                Olá, {user?.fullName?.split(' ')[0]}! 👋
              </h3>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
                Sou a Val, sua assistente de IA. Como posso ajudar você hoje?
              </p>
            </motion.div>
          )}

          {/* Quick Actions */}
          {showQuickActions && messages.length === 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                Ações rápidas para {user?.area || 'você'}:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => (
                  <motion.button
                    key={action.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleQuickAction(action)}
                    className="p-3 rounded-xl text-left transition-all border"
                    style={{ 
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-light)'
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1" style={{ color: 'var(--purple-500)' }}>
                      {action.icon}
                    </div>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                      {action.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Messages List */}
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 ${
                  message.role === 'user'
                    ? 'rounded-br-md'
                    : 'rounded-bl-md'
                }`}
                style={{
                  backgroundColor: message.role === 'user' 
                    ? 'var(--primary-500)' 
                    : 'var(--bg-secondary)',
                  color: message.role === 'user' 
                    ? 'white' 
                    : 'var(--text-primary)'
                }}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {/* Actions */}
                {message.actions && message.actions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.actions.map((action, idx) => (
                      <button
                        key={idx}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                        style={{
                          backgroundColor: 'var(--purple-500)',
                          color: 'white'
                        }}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Copy button for assistant messages */}
                {message.role === 'assistant' && (
                  <button
                    onClick={() => copyToClipboard(message.content, message.id)}
                    className="mt-2 flex items-center gap-1 text-xs opacity-60 hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {copiedId === message.id ? (
                      <>
                        <Check className="w-3 h-3" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        Copiar
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div 
                className="rounded-2xl rounded-bl-md p-4"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
              >
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--purple-500)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Val está pensando...
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div 
          className="p-4 border-t"
          style={{ borderColor: 'var(--border-light)' }}
        >
          <div 
            className="flex items-end gap-2 p-2 rounded-xl border"
            style={{ 
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-light)'
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Digite sua mensagem..."
              rows={1}
              className="flex-1 bg-transparent resize-none outline-none text-sm p-2"
              style={{ 
                color: 'var(--text-primary)',
                maxHeight: '120px'
              }}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="p-2 rounded-lg transition-colors disabled:opacity-50"
              style={{ 
                backgroundColor: input.trim() ? 'var(--purple-500)' : 'var(--neutral-300)',
                color: 'white'
              }}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
          <p className="text-xs text-center mt-2" style={{ color: 'var(--text-tertiary)' }}>
            Val pode cometer erros. Verifique informações importantes.
          </p>
        </div>
      </motion.div>

      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setValChatOpen(false)}
        className="fixed inset-0 bg-black/20 z-40 sm:hidden"
      />
    </AnimatePresence>
  );
}

// Botão flutuante para abrir Val
export function ValFloatingButton() {
  const { setValChatOpen, valChatOpen } = useApp();

  if (valChatOpen) return null;

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => setValChatOpen(true)}
      className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-40"
      style={{ 
        background: 'linear-gradient(135deg, var(--purple-500) 0%, var(--primary-500) 100%)'
      }}
    >
      <Sparkles className="w-6 h-6 text-white" />
      
      {/* Pulse animation */}
      <span className="absolute inset-0 rounded-full animate-ping opacity-20" 
        style={{ backgroundColor: 'var(--purple-500)' }} 
      />
    </motion.button>
  );
}


