"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  X, 
  Send, 
  Mic, 
  Globe, 
  ChevronDown,
  TrendingUp,
  Calendar,
  Target,
  FileText,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PromptSuggestion } from "@/components/ui/prompt-suggestion";
import { AILoaderDots } from "@/components/ui/ai-loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ============================================
// VAL FLOATING CHAT - VALLE AI
// Chat flutuante com avatar, toolbar e animações
// ============================================

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ValFloatingChatProps {
  userName?: string;
}

const QUICK_ACTIONS = [
  { 
    icon: TrendingUp, 
    text: "Análise de desempenho",
    color: "text-emerald-600"
  },
  { 
    icon: Calendar, 
    text: "Agendar reunião",
    color: "text-[#1672d6]"
  },
  { 
    icon: Target, 
    text: "Ver concorrentes",
    color: "text-purple-600"
  },
  { 
    icon: FileText, 
    text: "Gerar relatório",
    color: "text-orange-600"
  },
];

export function ValFloatingChat({ userName = "Cliente" }: ValFloatingChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState("val-pro");
  const [webSearch, setWebSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Entendi sua solicitação! Estou analisando os dados e em breve terei uma resposta completa para você. Posso ajudar com mais alguma coisa?",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
    handleSend();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "w-14 h-14 rounded-full shadow-lg",
          "bg-gradient-to-br from-[#1672d6] to-[#001533]",
          "flex items-center justify-center",
          "hover:shadow-xl hover:scale-105 transition-all",
          "border-2 border-white/20",
          isOpen && "hidden"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Image
          src="/images/val-avatar.png"
          alt="Val"
          width={48}
          height={48}
          className="rounded-full object-cover"
          onError={(e) => {
            // Fallback to icon if image not found
            e.currentTarget.style.display = 'none';
          }}
        />
        <Sparkles className="w-6 h-6 text-white absolute" style={{ display: 'none' }} />
        
        {/* Pulse animation */}
        <span className="absolute inset-0 rounded-full bg-[#1672d6] animate-ping opacity-20" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "fixed bottom-6 right-6 z-50",
              "w-[380px] h-[600px] max-h-[80vh]",
              "bg-white dark:bg-[#0a0f1a] rounded-2xl shadow-2xl",
              "border border-[#001533]/10 dark:border-white/10",
              "flex flex-col overflow-hidden"
            )}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#001533] to-[#1672d6] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Image
                    src="/images/val-avatar.png"
                    alt="Val"
                    width={44}
                    height={44}
                    className="rounded-full border-2 border-white/30 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '';
                    }}
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Val</h3>
                  <p className="text-white/70 text-xs">Assistente IA Valle 360</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Welcome Message */}
              {messages.length === 0 && (
                <div className="space-y-4">
                  {/* Greeting */}
                  <div className="flex items-start gap-3">
                    <Image
                      src="/images/val-avatar.png"
                      alt="Val"
                      width={36}
                      height={36}
                      className="rounded-full object-cover flex-shrink-0"
                    />
                    <div className="bg-[#001533]/5 dark:bg-white/5 rounded-2xl rounded-tl-none p-4 max-w-[85%]">
                      <p className="text-[#001533] dark:text-white">
                        Olá, <span className="font-semibold">{userName}</span>! 👋
                      </p>
                      <p className="text-[#001533]/70 dark:text-white/70 text-sm mt-1">
                        Seja bem vindo. Como posso te ajudar hoje?
                      </p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-[#001533]/50 dark:text-white/50 uppercase tracking-wider px-1">
                      Ações Rápidas
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {QUICK_ACTIONS.map((action, index) => {
                        const Icon = action.icon;
                        return (
                          <PromptSuggestion
                            key={index}
                            onClick={() => handleQuickAction(action.text)}
                            className="flex items-center gap-2 text-xs"
                          >
                            <Icon className={cn("w-4 h-4", action.color)} />
                            <span className="truncate">{action.text}</span>
                          </PromptSuggestion>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-start gap-3",
                    message.isUser && "flex-row-reverse"
                  )}
                >
                  {!message.isUser && (
                    <Image
                      src="/images/val-avatar.png"
                      alt="Val"
                      width={36}
                      height={36}
                      className="rounded-full object-cover flex-shrink-0"
                    />
                  )}
                  <div
                    className={cn(
                      "rounded-2xl p-3 max-w-[85%]",
                      message.isUser
                        ? "bg-[#1672d6] text-white rounded-tr-none"
                        : "bg-[#001533]/5 dark:bg-white/5 text-[#001533] dark:text-white rounded-tl-none"
                    )}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className={cn(
                      "text-[10px] mt-1",
                      message.isUser ? "text-white/60" : "text-[#001533]/40 dark:text-white/40"
                    )}>
                      {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-start gap-3">
                  <Image
                    src="/images/val-avatar.png"
                    alt="Val"
                    width={36}
                    height={36}
                    className="rounded-full object-cover flex-shrink-0"
                  />
                  <div className="bg-[#001533]/5 dark:bg-white/5 rounded-2xl rounded-tl-none p-4">
                    <AILoaderDots />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-[#001533]/10 dark:border-white/10 p-3">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-1">
                  {/* Web Search Toggle */}
                  <button
                    onClick={() => setWebSearch(!webSearch)}
                    className={cn(
                      "flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-colors",
                      webSearch 
                        ? "bg-[#1672d6]/10 text-[#1672d6]" 
                        : "text-[#001533]/50 dark:text-white/50 hover:bg-[#001533]/5"
                    )}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Web</span>
                  </button>

                  {/* Voice */}
                  <button className="p-1.5 rounded-lg text-[#001533]/50 dark:text-white/50 hover:bg-[#001533]/5 transition-colors">
                    <Mic className="w-4 h-4" />
                  </button>
                </div>

                {/* Model Select */}
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="h-7 w-auto border-none shadow-none text-xs text-[#001533]/60 dark:text-white/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="val-pro">Val Pro</SelectItem>
                    <SelectItem value="val-fast">Val Fast</SelectItem>
                    <SelectItem value="val-creative">Val Creative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Input */}
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Digite sua mensagem..."
                    rows={1}
                    className={cn(
                      "w-full resize-none rounded-xl border-2 border-[#001533]/10 dark:border-white/10",
                      "bg-[#001533]/5 dark:bg-white/5",
                      "px-4 py-3 pr-12 text-sm",
                      "text-[#001533] dark:text-white",
                      "placeholder:text-[#001533]/40 dark:placeholder:text-white/40",
                      "focus:outline-none focus:border-[#1672d6]/50",
                      "max-h-32 overflow-y-auto"
                    )}
                    style={{ minHeight: '48px' }}
                  />
                </div>
                
                {/* Send Button */}
                <Button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                  className={cn(
                    "h-12 w-12 rounded-xl",
                    "bg-[#1672d6] hover:bg-[#1260b5]",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <Send className="w-5 h-5 text-white" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ValFloatingChat;
