'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Calendar, FileText, Users, User } from 'lucide-react';
import { MeetingSchedulerModal } from '@/components/messaging/MeetingSchedulerModal';
import { MaterialRequestModal } from '@/components/messaging/MaterialRequestModal';

interface Conversa {
  id: number;
  nome: string;
  ultimaMensagem?: string;
  naoLidas?: number;
  tipo: 'grupo' | 'direto';
}

interface Mensagem {
  id: number;
  texto: string;
  autor: string;
  hora: string;
  isUser: boolean;
}

export default function MensagensPage() {
  const [conversaSelecionada, setConversaSelecionada] = useState<number | null>(1);
  const [inputMensagem, setInputMensagem] = useState('');
  const [filtroAtivo, setFiltroAtivo] = useState<'todos' | 'grupo' | 'direto'>('todos');
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);

  const conversas: Conversa[] = [
    { id: 1, nome: 'Equipe Valle 360', ultimaMensagem: 'Material aprovado!', naoLidas: 2, tipo: 'grupo' },
    { id: 3, nome: 'Social Media', ultimaMensagem: 'Novo post agendado', naoLidas: 1, tipo: 'grupo' },
    { id: 4, nome: 'João Silva', ultimaMensagem: 'Obrigado!', naoLidas: 3, tipo: 'direto' },
    { id: 2, nome: 'Comercial', ultimaMensagem: 'Sobre o upgrade...', naoLidas: 0, tipo: 'grupo' },
    { id: 5, nome: 'Maria Santos', ultimaMensagem: 'Até logo', naoLidas: 0, tipo: 'direto' },
  ];

  const mensagens: Mensagem[] = [
    {
      id: 1,
      texto: 'Olá! Como posso ajudá-lo hoje?',
      autor: 'Valle 360',
      hora: '10:30',
      isUser: false,
    },
    {
      id: 2,
      texto: 'Gostaria de saber sobre o status do projeto',
      autor: 'Você',
      hora: '10:32',
      isUser: true,
    },
    {
      id: 3,
      texto: 'Claro! O projeto está em desenvolvimento. Já finalizamos 60% do escopo.',
      autor: 'Valle 360',
      hora: '10:33',
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

  return (
    <div className="pb-24 h-screen flex flex-col md:flex-row">
      <aside className="w-full md:w-80 border-r border-border bg-card">
        <div className="p-4 border-b border-border space-y-3">
          <h2 className="font-semibold text-lg">Mensagens</h2>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant={filtroAtivo === 'todos' ? 'default' : 'outline'}
              onClick={() => setFiltroAtivo('todos')}
              className="flex-1"
            >
              Todas
            </Button>
            <Button
              size="sm"
              variant={filtroAtivo === 'grupo' ? 'default' : 'outline'}
              onClick={() => setFiltroAtivo('grupo')}
              className="flex-1"
            >
              <Users className="w-3 h-3 mr-1" />
              Grupos
            </Button>
            <Button
              size="sm"
              variant={filtroAtivo === 'direto' ? 'default' : 'outline'}
              onClick={() => setFiltroAtivo('direto')}
              className="flex-1"
            >
              <User className="w-3 h-3 mr-1" />
              Diretas
            </Button>
          </div>
        </div>
        <div className="overflow-y-auto">
          {conversasFiltradas.map((conversa) => (
            <button
              key={conversa.id}
              onClick={() => setConversaSelecionada(conversa.id)}
              className={`w-full p-4 text-left hover:bg-muted/50 transition-colors border-b border-border ${
                conversaSelecionada === conversa.id ? 'bg-muted' : ''
              } ${
                conversa.naoLidas && conversa.naoLidas > 0 ? 'bg-valle-blue-50/30' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  conversa.tipo === 'grupo'
                    ? 'bg-gradient-to-br from-valle-blue-500 to-valle-blue-600'
                    : 'bg-gradient-to-br from-valle-silver-400 to-valle-silver-600'
                }`}>
                  {conversa.tipo === 'grupo' ? (
                    <Users className="w-5 h-5 text-white" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-medium truncate ${
                      conversa.naoLidas && conversa.naoLidas > 0 ? 'font-bold' : ''
                    }`}>{conversa.nome}</span>
                    {conversa.naoLidas && conversa.naoLidas > 0 && (
                      <Badge className="bg-valle-blue-600 text-white ml-2 flex-shrink-0">
                        {conversa.naoLidas}
                      </Badge>
                    )}
                  </div>
                  {conversa.ultimaMensagem && (
                    <p className={`text-sm text-muted-foreground truncate ${
                      conversa.naoLidas && conversa.naoLidas > 0 ? 'font-semibold text-foreground' : ''
                    }`}>{conversa.ultimaMensagem}</p>
                  )}
                  <Badge variant="outline" className="mt-1 text-xs">
                    {conversa.tipo === 'grupo' ? 'Grupo' : 'Direto'}
                  </Badge>
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        {conversaSelecionada ? (
          <>
            <div className="p-4 border-b border-border bg-gradient-to-r from-valle-blue-50 to-white">
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  conversas.find((c) => c.id === conversaSelecionada)?.tipo === 'grupo'
                    ? 'bg-gradient-to-br from-valle-blue-500 to-valle-blue-600'
                    : 'bg-gradient-to-br from-valle-silver-400 to-valle-silver-600'
                }`}>
                  {conversas.find((c) => c.id === conversaSelecionada)?.tipo === 'grupo' ? (
                    <Users className="w-6 h-6 text-white" />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {conversas.find((c) => c.id === conversaSelecionada)?.nome}
                    </h3>
                    <Badge variant="outline" className="mt-1">
                      {conversas.find((c) => c.id === conversaSelecionada)?.tipo === 'grupo' ? 'Grupo' : 'Conversa Direta'}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowMeetingModal(true)}
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    Agendar Reunião
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowMaterialModal(true)}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Solicitar Material
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-valle-silver-50/30 to-white">
              {mensagens.map((mensagem) => (
                <div
                  key={mensagem.id}
                  className={`flex ${mensagem.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md p-3 rounded-lg ${
                      mensagem.isUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card border border-border'
                    }`}
                  >
                    <p className="text-sm">{mensagem.texto}</p>
                    <span className="text-xs opacity-70 mt-1 block">{mensagem.hora}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-border bg-card">
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
                  className="flex-1"
                />
                <Button onClick={enviarMensagem} size="icon">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
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
    </div>
  );
}
