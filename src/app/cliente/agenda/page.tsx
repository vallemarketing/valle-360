'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Video,
  Users,
  Clock,
  MapPin,
  CheckCircle,
  Star,
  CalendarDays,
} from 'lucide-react';

type TabType = 'eventos' | 'reunioes' | 'disponibilidade';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  type: 'evento' | 'webinar' | 'workshop';
  description: string;
  spots?: number;
  registered: boolean;
}

interface Meeting {
  id: number;
  title: string;
  date: string;
  time: string;
  attendees: string[];
  status: 'confirmed' | 'pending' | 'completed';
  link?: string;
}

interface TimeSlot {
  date: string;
  time: string;
  available: boolean;
}

export default function ClienteAgendaPage() {
  const [activeTab, setActiveTab] = useState<TabType>('eventos');

  const events: Event[] = [
    {
      id: 1,
      title: 'Webinar: Estratégias de Marketing 2025',
      date: '2025-11-20',
      time: '14:00 - 15:30',
      type: 'webinar',
      description: 'Descubra as tendências de marketing para o próximo ano',
      spots: 150,
      registered: true,
    },
    {
      id: 2,
      title: 'Workshop: Design de Conteúdo',
      date: '2025-11-25',
      time: '16:00 - 18:00',
      type: 'workshop',
      description: 'Aprenda técnicas avançadas de design para redes sociais',
      spots: 50,
      registered: false,
    },
    {
      id: 3,
      title: 'Evento Valle: Networking',
      date: '2025-12-01',
      time: '19:00 - 21:00',
      type: 'evento',
      description: 'Encontro presencial com nossos clientes e parceiros',
      spots: 80,
      registered: false,
    },
  ];

  const meetings: Meeting[] = [
    {
      id: 1,
      title: 'Reunião de Alinhamento Mensal',
      date: '2025-11-05',
      time: '10:00 - 11:00',
      attendees: ['Guilherme', 'Gestor Valle', 'Designer'],
      status: 'confirmed',
      link: 'https://meet.google.com/abc-defg-hij',
    },
    {
      id: 2,
      title: 'Apresentação de Resultados',
      date: '2025-11-12',
      time: '14:00 - 15:00',
      attendees: ['Guilherme', 'Analista de Performance'],
      status: 'pending',
    },
    {
      id: 3,
      title: 'Review de Campanha',
      date: '2025-10-28',
      time: '16:00 - 17:00',
      attendees: ['Guilherme', 'Gestor Valle', 'Especialista em Ads'],
      status: 'completed',
    },
  ];

  const timeSlots: TimeSlot[] = [
    { date: '2025-11-08', time: '09:00', available: true },
    { date: '2025-11-08', time: '10:00', available: true },
    { date: '2025-11-08', time: '14:00', available: false },
    { date: '2025-11-08', time: '15:00', available: true },
    { date: '2025-11-09', time: '09:00', available: true },
    { date: '2025-11-09', time: '11:00', available: false },
    { date: '2025-11-09', time: '14:00', available: true },
    { date: '2025-11-09', time: '16:00', available: true },
  ];

  const tabs = [
    { id: 'eventos' as TabType, label: 'Eventos Valle', icon: Star },
    { id: 'reunioes' as TabType, label: 'Suas Reuniões', icon: Users },
    { id: 'disponibilidade' as TabType, label: 'Agendar', icon: CalendarDays },
  ];

  const getMeetingStatusBadge = (status: Meeting['status']) => {
    const config = {
      confirmed: { label: 'Confirmada', className: 'bg-green-100 text-green-700' },
      pending: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-700' },
      completed: { label: 'Concluída', className: 'bg-gray-100 text-gray-700' },
    };

    return <Badge className={config[status].className}>{config[status].label}</Badge>;
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Agenda</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Eventos exclusivos, reuniões e horários disponíveis
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'eventos' && (
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-xl transition-all">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {event.type === 'webinar' && (
                      <Video className="w-5 h-5 text-orange-600" />
                    )}
                    {event.type === 'workshop' && (
                      <Star className="w-5 h-5 text-orange-600" />
                    )}
                    {event.type === 'evento' && (
                      <Users className="w-5 h-5 text-orange-600" />
                    )}
                    <CardTitle className="text-base">{event.title}</CardTitle>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{event.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    {new Date(event.date).toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    {event.time}
                  </div>
                  {event.spots && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      {event.spots} vagas disponíveis
                    </div>
                  )}
                </div>

                {event.registered ? (
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">
                      Você está inscrito!
                    </span>
                  </div>
                ) : (
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    Inscrever-se
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'reunioes' && (
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <Card key={meeting.id} className="hover:shadow-lg transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {meeting.title}
                      </h3>
                      {getMeetingStatusBadge(meeting.status)}
                    </div>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(meeting.date).toLocaleDateString('pt-BR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {meeting.time}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {meeting.attendees.join(', ')}
                      </div>
                    </div>
                  </div>
                </div>

                {meeting.link && meeting.status === 'confirmed' && (
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">
                    <Video className="w-4 h-4 mr-2" />
                    Entrar na Reunião
                  </Button>
                )}

                {meeting.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-green-600 hover:bg-green-700">
                      Confirmar
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Reagendar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'disponibilidade' && (
        <Card>
          <CardHeader>
            <CardTitle>Horários Disponíveis para Reunião</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Escolha um horário para agendar uma reunião com seu gestor
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {timeSlots.map((slot, index) => (
                <button
                  key={index}
                  disabled={!slot.available}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    slot.available
                      ? 'border-gray-200 dark:border-gray-700 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/10 cursor-pointer'
                      : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {new Date(slot.date).toLocaleDateString('pt-BR', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                    {slot.available ? (
                      <Badge className="bg-green-100 text-green-700">Disponível</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-500">Ocupado</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    {slot.time}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
