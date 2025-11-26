'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Send,
  Paperclip,
  Calendar,
  Video,
  FileText,
  Bell,
  Users,
  Search,
  Plus,
  Clock,
  CheckCheck,
  Smile
} from 'lucide-react';

export default function MessagesPage() {
  const [activeView, setActiveView] = useState<'chat' | 'notifications' | 'meetings'>('chat');
  const [message, setMessage] = useState('');

  const conversations = [
    {
      id: 1,
      name: 'Equipe Valle',
      avatar: '👥',
      lastMessage: 'Seu relatório mensal está pronto!',
      time: '10:30',
      unread: 2,
      online: true
    },
    {
      id: 2,
      name: 'Maria Silva',
      role: 'Gestora de Tráfego',
      avatar: '👩',
      lastMessage: 'Campanha aprovada, iniciando hoje',
      time: 'Ontem',
      unread: 0,
      online: false
    },
    {
      id: 3,
      name: 'Pedro Costa',
      role: 'Designer',
      avatar: '👨',
      lastMessage: 'Enviando artes para aprovação',
      time: '2 dias',
      unread: 1,
      online: true
    }
  ];

  const messages = [
    {
      id: 1,
      sender: 'them',
      name: 'Maria Silva',
      content: 'Olá! Tudo bem? Sobre a campanha que discutimos...',
      time: '10:25',
      avatar: '👩'
    },
    {
      id: 2,
      sender: 'me',
      content: 'Oi Maria! Sim, pode falar',
      time: '10:26'
    },
    {
      id: 3,
      sender: 'them',
      name: 'Maria Silva',
      content: 'Seu relatório mensal está pronto! Gostaria de agendar uma reunião para apresentá-lo?',
      time: '10:30',
      avatar: '👩'
    },
  ];

  const notifications = [
    {
      id: 1,
      type: 'approval',
      icon: FileText,
      color: 'blue',
      title: '3 novos conteúdos para aprovação',
      description: 'Posts programados para esta semana aguardam sua aprovação',
      time: '15 min atrás',
      unread: true
    },
    {
      id: 2,
      type: 'meeting',
      icon: Video,
      color: 'green',
      title: 'Reunião agendada para amanhã',
      description: 'Apresentação de resultados - 14:00h',
      time: '1h atrás',
      unread: true
    },
    {
      id: 3,
      type: 'message',
      icon: MessageSquare,
      color: 'purple',
      title: 'Nova mensagem da equipe',
      description: 'Maria Silva enviou uma mensagem',
      time: '2h atrás',
      unread: false
    }
  ];

  const meetings = [
    {
      id: 1,
      title: 'Apresentação de Resultados',
      date: '20/11/2024',
      time: '14:00 - 15:00',
      participants: ['Maria Silva', 'Pedro Costa'],
      status: 'scheduled',
      link: 'https://meet.google.com/xxx-yyyy-zzz',
      hasRecording: false
    },
    {
      id: 2,
      title: 'Planejamento Mensal',
      date: '15/11/2024',
      time: '10:00 - 11:30',
      participants: ['Equipe Valle'],
      status: 'completed',
      hasRecording: true
    }
  ];

  const renderChat = () => (
    <div className="grid md:grid-cols-3 gap-4 h-[calc(100vh-300px)]">
      <Card className="md:col-span-1 overflow-hidden flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-lg">Conversas</CardTitle>
            <Button size="sm" variant="ghost" className="w-8 h-8 p-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-valle-silver-500" />
            <Input placeholder="Buscar conversas..." className="pl-9" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                className="w-full p-3 rounded-lg hover:bg-valle-blue-50 transition-colors text-left relative"
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-valle-blue-500 to-valle-blue-600 flex items-center justify-center text-2xl">
                      {conv.avatar}
                    </div>
                    {conv.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-sm text-valle-navy-900 truncate">{conv.name}</p>
                      <span className="text-xs text-valle-silver-600">{conv.time}</span>
                    </div>
                    {conv.role && (
                      <p className="text-xs text-valle-silver-600 mb-1">{conv.role}</p>
                    )}
                    <p className="text-sm text-valle-silver-700 truncate">{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && (
                    <Badge className="bg-valle-blue-600 text-white text-xs h-5 min-w-5 flex items-center justify-center">
                      {conv.unread}
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 flex flex-col">
        <CardHeader className="pb-3 border-b border-valle-silver-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-valle-blue-500 to-valle-blue-600 flex items-center justify-center text-xl">
                👥
              </div>
              <div>
                <h3 className="font-semibold text-valle-navy-900">Equipe Valle</h3>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Online
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">
                <Video className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Calendar className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'them' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-valle-blue-500 to-valle-blue-600 flex items-center justify-center text-lg mr-2 flex-shrink-0">
                    {msg.avatar}
                  </div>
                )}
                <div className={`max-w-[70%] ${msg.sender === 'me' ? 'bg-gradient-to-br from-valle-blue-600 to-valle-blue-700 text-white' : 'bg-valle-silver-100 text-valle-navy-800'} rounded-2xl px-4 py-3`}>
                  {msg.sender === 'them' && (
                    <p className="text-xs font-semibold mb-1 opacity-70">{msg.name}</p>
                  )}
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className={`text-xs ${msg.sender === 'me' ? 'text-white/70' : 'text-valle-silver-600'}`}>
                      {msg.time}
                    </span>
                    {msg.sender === 'me' && (
                      <CheckCheck className="w-3 h-3 text-white/70" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>

        <div className="p-4 border-t border-valle-silver-200">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" className="w-9 h-9 p-0">
              <Paperclip className="w-4 h-4" />
            </Button>
            <Input
              placeholder="Digite sua mensagem..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && setMessage('')}
              className="flex-1"
            />
            <Button size="sm" variant="ghost" className="w-9 h-9 p-0">
              <Smile className="w-4 h-4" />
            </Button>
            <Button size="sm" className="w-9 h-9 p-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderNotifications = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Notificações</CardTitle>
          <Button size="sm" variant="outline">Marcar todas como lidas</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notifications.map((notif) => {
            const Icon = notif.icon;
            return (
              <div
                key={notif.id}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  notif.unread
                    ? 'bg-valle-blue-50 border-valle-blue-200 hover:shadow-md'
                    : 'bg-white border-valle-silver-200 hover:border-valle-blue-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-${notif.color}-100 flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-6 h-6 text-${notif.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-semibold text-valle-navy-900">{notif.title}</h4>
                      {notif.unread && (
                        <div className="w-2 h-2 bg-valle-blue-600 rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-sm text-valle-silver-700 mb-2">{notif.description}</p>
                    <p className="text-xs text-valle-silver-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {notif.time}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  const renderMeetings = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Reuniões</CardTitle>
            <Button>
              <Calendar className="w-4 h-4 mr-2" />
              Agendar Reunião
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className={`p-5 rounded-xl border-2 ${
                  meeting.status === 'scheduled'
                    ? 'bg-gradient-to-br from-valle-blue-50 to-white border-valle-blue-300'
                    : 'bg-valle-silver-50 border-valle-silver-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-lg text-valle-navy-900 mb-1">
                      {meeting.title}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-valle-silver-700">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {meeting.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {meeting.time}
                      </span>
                    </div>
                  </div>
                  <Badge className={meeting.status === 'scheduled' ? 'bg-green-600 text-white' : 'bg-valle-silver-400 text-white'}>
                    {meeting.status === 'scheduled' ? 'Agendada' : 'Concluída'}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-valle-silver-600" />
                  <div className="flex -space-x-2">
                    {meeting.participants.map((_, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-valle-blue-500 to-valle-blue-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                      >
                        {String.fromCharCode(65 + i)}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-valle-silver-700">
                    {meeting.participants.join(', ')}
                  </span>
                </div>

                <div className="flex gap-2">
                  {meeting.status === 'scheduled' && meeting.link && (
                    <Button size="sm" variant="outline" className="flex-1">
                      <Video className="w-4 h-4 mr-2" />
                      Entrar na Reunião
                    </Button>
                  )}
                  {meeting.hasRecording && (
                    <Button size="sm" variant="outline" className="flex-1">
                      <Video className="w-4 h-4 mr-2" />
                      Ver Gravação
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <Calendar className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Solicitar Materiais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-valle-navy-700 mb-2 block">
                Tipo de Material
              </label>
              <select className="w-full px-4 py-2 rounded-lg border-2 border-valle-silver-300 bg-white hover:border-valle-blue-500 focus:border-valle-blue-600 focus:ring-2 focus:ring-valle-blue-200 transition-all">
                <option>Post para Instagram</option>
                <option>Story</option>
                <option>Vídeo para Reels</option>
                <option>Banner para site</option>
                <option>Material impresso</option>
                <option>Outro</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-valle-navy-700 mb-2 block">
                Descrição da Solicitação
              </label>
              <textarea
                rows={4}
                placeholder="Descreva em detalhes o material que você precisa..."
                className="w-full px-4 py-3 rounded-lg border-2 border-valle-silver-300 bg-white hover:border-valle-blue-500 focus:border-valle-blue-600 focus:ring-2 focus:ring-valle-blue-200 transition-all resize-none"
              />
            </div>
            <Button className="w-full">
              <Send className="w-4 h-4 mr-2" />
              Enviar Solicitação
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold text-valle-navy-900">Mensagens & Comunicação</h1>
        <p className="text-valle-silver-600 mt-2">Central de comunicação com a equipe Valle</p>
      </div>

      <div className="flex gap-2">
        <Button
          variant={activeView === 'chat' ? 'default' : 'outline'}
          onClick={() => setActiveView('chat')}
          className="flex items-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          Chat
        </Button>
        <Button
          variant={activeView === 'notifications' ? 'default' : 'outline'}
          onClick={() => setActiveView('notifications')}
          className="flex items-center gap-2 relative"
        >
          <Bell className="w-4 h-4" />
          Notificações
          <Badge className="ml-1 bg-red-600 text-white h-5 min-w-5 flex items-center justify-center p-0 text-xs">
            2
          </Badge>
        </Button>
        <Button
          variant={activeView === 'meetings' ? 'default' : 'outline'}
          onClick={() => setActiveView('meetings')}
          className="flex items-center gap-2"
        >
          <Video className="w-4 h-4" />
          Reuniões
        </Button>
      </div>

      <div>
        {activeView === 'chat' && renderChat()}
        {activeView === 'notifications' && renderNotifications()}
        {activeView === 'meetings' && renderMeetings()}
      </div>
    </div>
  );
}
