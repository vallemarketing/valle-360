'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Calendar, 
  FileText, 
  Users, 
  User, 
  Check, 
  CheckCheck,
  Star,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { MeetingSchedulerModal } from '@/components/messaging/MeetingSchedulerModal';
import { MaterialRequestModal } from '@/components/messaging/MaterialRequestModal';
import { cn } from '@/lib/utils';

// ============================================
// MENSAGENS - VALLE AI
// Com checks de status, data/hora e avaliação
// ============================================

interface Conversa {
  id: number;
  nome: string;
  ultimaMensagem?: string;
  naoLidas?: number;
  tipo: 'grupo' | 'direto';
  lastTime?: string;
}

interface Mensagem {
  id: number;
  texto: string;
  autor: string;
  hora: string;
  data: string;
  isUser: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

export default function MensagensPage() {
  const [conversaSelecionada, setConversaSelecionada] = useState<number | null>(1);
  const [inputMensagem, setInputMensagem] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState<'todos' | 'grupo' | 'direto'>('todos');
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState<number | null>(null);

  const conversas: Conversa[] = [
    { id: 1, nome: 'Equipe Valle 360', ultimaMensagem: 'Material aprovado!', naoLidas: 2, tipo: 'grupo', lastTime: '10:33' },
    { id: 3, nome: 'Social Media', ultimaMensagem: 'Novo post agendado', naoLidas: 1, tipo: 'grupo', lastTime: '09:15' },
    { id: 4, nome: 'João Silva', ultimaMensagem: 'Obrigado!', naoLidas: 3, tipo: 'direto', lastTime: 'Ontem' },
    { id: 2, nome: 'Comercial', ultimaMensagem: 'Sobre o upgrade...', naoLidas: 0, tipo: 'grupo', lastTime: '03/12' },
    { id: 5, nome: 'Maria Santos', ultimaMensagem: 'Até logo', naoLidas: 0, tipo: 'direto', lastTime: '02/12' },
  ];

  const mensagens: Mensagem[] = [
    {
      id: 1,
      texto: 'Olá! Como posso ajudá-lo hoje?',
      autor: 'Valle 360',
      hora: '10:30',
      data: '04/12/2024',
      isUser: false,
    },
    {
      id: 2,
      texto: 'Gostaria de saber sobre o status do projeto',
      autor: 'Você',
      hora: '10:32',
      data: '04/12/2024',
      isUser: true,
      status: 'read',
    },
    {
      id: 3,
      texto: 'Claro! O projeto está em desenvolvimento. Já finalizamos 60% do escopo.',
      autor: 'Valle 360',
      hora: '10:33',
      data: '04/12/2024',
      isUser: false,
    },
  ];

  const conversasFiltradas = conversas
    .filter(c => {
      if (filtroAtivo === 'todos') return true;
      return c.tipo === filtroAtivo;
    })
    .sort((a, b) => {
      if (a.naoLidas && !b.naoLidas) return -1;
      if (!a.naoLidas && b.naoLidas) return 1;
      return 0;
    });

  const enviarMensagem = () => {
    if (!inputMensagem.trim()) return;
    setInputMensagem('');
  };

  const getStatusIcon = (status?: string) => {
    if (status === 'sent') return <Check className="size-3 text-[#001533]/40" />;
    if (status === 'delivered') return <CheckCheck className="size-3 text-[#001533]/40" />;
    if (status === 'read') return <CheckCheck className="size-3 text-[#1672d6]" />;
    return null;
  };

  const handleRating = (stars: number) => {
    setRating(stars);
    setTimeout(() => setShowRatingModal(false), 1000);
  };

  return (
    <div className="pb-24 h-screen flex flex-col md:flex-row">
      <aside className="w-full md:w-80 border-r border-[#001533]/10 dark:border-white/10 bg-white dark:bg-[#0a0f1a]">
        <div className="p-4 border-b border-[#001533]/10 dark:border-white/10 space-y-3">
          <h2 className="font-semibold text-lg text-[#001533] dark:text-white">Mensagens</h2>

          <div className="flex gap-2">
            {['todos', 'grupo', 'direto'].map((filtro) => (
              <Button
                key={filtro}
                size="sm"
                variant={filtroAtivo === filtro ? 'default' : 'outline'}
                onClick={() => setFiltroAtivo(filtro as any)}
                className={cn(
                  "flex-1",
                  filtroAtivo === filtro 
                    ? "bg-[#1672d6] hover:bg-[#1260b5]" 
                    : "border-[#001533]/20"
                )}
              >
                {filtro === 'grupo' && <Users className="w-3 h-3 mr-1" />}
                {filtro === 'direto' && <User className="w-3 h-3 mr-1" />}
                {filtro === 'todos' ? 'Todas' : filtro === 'grupo' ? 'Grupos' : 'Diretas'}
              </Button>
            ))}
          </div>
        </div>
        <div className="overflow-y-auto">
          {conversasFiltradas.map((conversa) => (
            <button
              key={conversa.id}
              onClick={() => setConversaSelecionada(conversa.id)}
              className={cn(
                "w-full p-4 text-left hover:bg-[#001533]/5 dark:hover:bg-white/5 transition-colors border-b border-[#001533]/10 dark:border-white/10",
                conversaSelecionada === conversa.id && "bg-[#1672d6]/10",
                conversa.naoLidas && conversa.naoLidas > 0 && "bg-[#1672d6]/5"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                  conversa.tipo === 'grupo'
                    ? "bg-gradient-to-br from-[#1672d6] to-[#001533]"
                    : "bg-gradient-to-br from-gray-400 to-gray-600"
                )}>
                  {conversa.tipo === 'grupo' ? (
                    <Users className="w-5 h-5 text-white" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      "font-medium truncate text-[#001533] dark:text-white",
                      conversa.naoLidas && conversa.naoLidas > 0 && "font-bold"
                    )}>{conversa.nome}</span>
                    <span className="text-xs text-[#001533]/50 dark:text-white/50 ml-2">
                      {conversa.lastTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    {conversa.ultimaMensagem && (
                      <p className={cn(
                        "text-sm text-[#001533]/60 dark:text-white/60 truncate",
                        conversa.naoLidas && conversa.naoLidas > 0 && "font-semibold text-[#001533] dark:text-white"
                      )}>{conversa.ultimaMensagem}</p>
                    )}
                    {conversa.naoLidas && conversa.naoLidas > 0 && (
                      <Badge className="bg-[#1672d6] text-white ml-2 flex-shrink-0">
                        {conversa.naoLidas}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        {conversaSelecionada ? (
          <>
            <div className="p-4 border-b border-[#001533]/10 dark:border-white/10 bg-gradient-to-r from-[#1672d6]/10 to-transparent">
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
                  conversas.find((c) => c.id === conversaSelecionada)?.tipo === 'grupo'
                    ? "bg-gradient-to-br from-[#1672d6] to-[#001533]"
                    : "bg-gradient-to-br from-gray-400 to-gray-600"
                )}>
                  {conversas.find((c) => c.id === conversaSelecionada)?.tipo === 'grupo' ? (
                    <Users className="w-6 h-6 text-white" />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <div>
                    <h3 className="font-semibold text-lg text-[#001533] dark:text-white">
                      {conversas.find((c) => c.id === conversaSelecionada)?.nome}
                    </h3>
                    <Badge variant="outline" className="mt-1 border-[#1672d6]/30 text-[#1672d6]">
                      {conversas.find((c) => c.id === conversaSelecionada)?.tipo === 'grupo' ? 'Grupo' : 'Conversa Direta'}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowRatingModal(true)}
                    className="border-[#1672d6]/30 text-[#1672d6] hover:bg-[#1672d6]/10"
                  >
                    <Star className="w-4 h-4 mr-1" />
                    Avaliar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowMeetingModal(true)}
                    className="border-[#1672d6]/30 text-[#1672d6] hover:bg-[#1672d6]/10"
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    Agendar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowMaterialModal(true)}
                    className="border-[#1672d6]/30 text-[#1672d6] hover:bg-[#1672d6]/10"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Material
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#001533]/5 dark:bg-white/5">
              {/* Data separator */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-[#001533]/10 dark:bg-white/10" />
                <span className="text-xs text-[#001533]/50 dark:text-white/50 px-2">
                  {mensagens[0]?.data}
                </span>
                <div className="flex-1 h-px bg-[#001533]/10 dark:bg-white/10" />
              </div>

              {mensagens.map((mensagem) => (
                <motion.div
                  key={mensagem.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex", mensagem.isUser ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-md p-3 rounded-2xl",
                      mensagem.isUser
                        ? "bg-[#1672d6] text-white rounded-br-md"
                        : "bg-white dark:bg-[#0a0f1a] border border-[#001533]/10 dark:border-white/10 rounded-bl-md"
                    )}
                  >
                    <p className="text-sm">{mensagem.texto}</p>
                    <div className={cn(
                      "flex items-center gap-1 mt-1",
                      mensagem.isUser ? "justify-end" : "justify-start"
                    )}>
                      <span className={cn(
                        "text-xs",
                        mensagem.isUser ? "text-white/70" : "text-[#001533]/50 dark:text-white/50"
                      )}>
                        {mensagem.hora}
                      </span>
                      {mensagem.isUser && getStatusIcon(mensagem.status)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-4 border-t border-[#001533]/10 dark:border-white/10 bg-white dark:bg-[#0a0f1a]">
              <div className="flex gap-2">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={inputMensagem}
                  onChange={(e) => setInputMensagem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      enviarMensagem();
                    }
                  }}
                  className="flex-1 border-[#001533]/20"
                />
                <Button 
                  onClick={enviarMensagem} 
                  size="icon"
                  className="bg-[#1672d6] hover:bg-[#1260b5]"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#001533]/50 dark:text-white/50">
            Selecione uma conversa para começar
          </div>
        )}
      </main>

      {showMeetingModal && (
        <MeetingSchedulerModal onClose={() => setShowMeetingModal(false)} />
      )}

      {showMaterialModal && (
        <MaterialRequestModal onClose={() => setShowMaterialModal(false)} />
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowRatingModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#0a0f1a] shadow-2xl p-6 text-center"
          >
            <Star className="size-12 text-[#1672d6] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#001533] dark:text-white mb-2">
              Avalie esta conversa
            </h3>
            <p className="text-sm text-[#001533]/60 dark:text-white/60 mb-4">
              Como foi seu atendimento?
            </p>
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  className={cn(
                    "p-2 transition-all hover:scale-110",
                    rating && rating >= star ? "text-yellow-500" : "text-gray-300"
                  )}
                >
                  <Star className="size-8 fill-current" />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleRating(-1)}
                className="flex-1 border-red-500/30 text-red-500 hover:bg-red-500/10"
              >
                <ThumbsDown className="size-4 mr-2" />
                Ruim
              </Button>
              <Button
                onClick={() => handleRating(5)}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600"
              >
                <ThumbsUp className="size-4 mr-2" />
                Excelente
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
