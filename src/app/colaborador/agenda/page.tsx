'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Plus, Video, X, Users, MapPin, Bell, Check, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Event {
  id: string;
  title: string;
  description?: string;
  time: string;
  endTime?: string;
  type: 'meeting' | 'internal' | 'task' | 'reminder';
  color: string;
  location?: string;
  attendees?: string[];
  meetLink?: string;
  date: Date;
}

const EVENT_COLORS = {
  meeting: 'bg-blue-500',
  internal: 'bg-purple-500',
  task: 'bg-emerald-500',
  reminder: 'bg-orange-500'
};

const EVENT_LABELS = {
  meeting: 'Reunião',
  internal: 'Interno',
  task: 'Tarefa',
  reminder: 'Lembrete'
};

export default function EmployeeAgendaPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    time: '09:00',
    endTime: '10:00',
    type: 'meeting' as Event['type'],
    location: '',
    meetLink: '',
    attendees: ''
  });

  useEffect(() => {
    loadEvents();
  }, [selectedDate]);

  const loadEvents = async () => {
    try {
      // Mock events - em produção, buscar do banco
      const mockEvents: Event[] = [
        {
          id: '1',
          title: 'Reunião com Cliente A',
          time: '10:00',
          endTime: '11:00',
          type: 'meeting',
          color: 'bg-blue-500',
          location: 'Google Meet',
          meetLink: 'https://meet.google.com/abc-defg-hij',
          attendees: ['Maria Silva', 'João Santos'],
          date: new Date()
        },
        {
          id: '2',
          title: 'Revisão de Campanha',
          description: 'Revisar métricas da campanha de Black Friday',
          time: '14:00',
          endTime: '15:00',
          type: 'internal',
          color: 'bg-purple-500',
          date: new Date()
        },
        {
          id: '3',
          title: 'Análise de Métricas',
          time: '16:00',
          endTime: '17:00',
          type: 'task',
          color: 'bg-emerald-500',
          date: new Date()
        },
      ];
      
      setEvents(mockEvents);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title.trim()) {
      toast.error('Digite um título para o evento');
      return;
    }

    const event: Event = {
      id: Date.now().toString(),
      title: newEvent.title,
      description: newEvent.description,
      time: newEvent.time,
      endTime: newEvent.endTime,
      type: newEvent.type,
      color: EVENT_COLORS[newEvent.type],
      location: newEvent.location,
      meetLink: newEvent.meetLink,
      attendees: newEvent.attendees.split(',').map(a => a.trim()).filter(Boolean),
      date: selectedDate
    };

    setEvents([...events, event]);
    setIsModalOpen(false);
    setNewEvent({
      title: '',
      description: '',
      time: '09:00',
      endTime: '10:00',
      type: 'meeting',
      location: '',
      meetLink: '',
      attendees: ''
    });
    
    toast.success('Evento criado com sucesso!');

    // TODO: Salvar no banco
    // await supabase.from('calendar_events').insert(event);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(e => e.id !== eventId));
    toast.success('Evento removido');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const todayEvents = events.filter(e => 
    e.date.toDateString() === selectedDate.toDateString()
  );

  return (
    <div className="min-h-screen p-4 pb-24" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Agenda
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {formatDate(selectedDate)}
            </p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg shadow-lg transition-colors"
            style={{ backgroundColor: '#4370d1' }}
          >
            <Plus className="w-4 h-4" />
            Novo
          </motion.button>
        </div>

        {/* Summary Card */}
        <div 
          className="p-4 mb-6 rounded-xl border"
          style={{ 
            background: 'linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%)',
            borderColor: 'var(--primary-200)'
          }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#4370d1' }}>
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {todayEvents.length} evento{todayEvents.length !== 1 ? 's' : ''} hoje
              </p>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {todayEvents.length > 0 
                  ? `Próximo às ${todayEvents[0].time}`
                  : 'Nenhum evento agendado'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#4370d1' }} />
            </div>
          ) : todayEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-tertiary)' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Nenhum evento para hoje</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="mt-4 text-sm font-medium"
                style={{ color: '#4370d1' }}
              >
                Criar primeiro evento
              </button>
            </div>
          ) : (
            todayEvents.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow group"
                style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)' }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-1 h-full self-stretch ${event.color} rounded-full`} />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                        {event.title}
                      </h3>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                    
                    {event.description && (
                      <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                        {event.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {event.time} - {event.endTime}
                      </span>
                      
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </span>
                      )}
                      
                      {event.meetLink && (
                        <a 
                          href={event.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1"
                          style={{ color: '#4370d1' }}
                        >
                          <Video className="w-4 h-4" />
                          Entrar na reunião
                        </a>
                      )}
                      
                      {event.attendees && event.attendees.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {event.attendees.length} participante{event.attendees.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Novo Evento */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
              style={{ backgroundColor: 'var(--bg-primary)' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div 
                className="p-4 flex items-center justify-between"
                style={{ borderBottom: '1px solid var(--border-light)' }}
              >
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                  Novo Evento
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 space-y-4">
                {/* Título */}
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    Título *
                  </label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    placeholder="Ex: Reunião com cliente"
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: 'var(--bg-secondary)', 
                      borderColor: 'var(--border-light)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    Tipo
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(EVENT_LABELS).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setNewEvent({ ...newEvent, type: key as Event['type'] })}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          newEvent.type === key ? 'ring-2 ring-offset-2' : ''
                        }`}
                        style={{
                          backgroundColor: newEvent.type === key ? EVENT_COLORS[key as keyof typeof EVENT_COLORS].replace('bg-', '') : 'var(--bg-secondary)',
                          color: newEvent.type === key ? 'white' : 'var(--text-secondary)'
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Horários */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                      Início
                    </label>
                    <input
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                      style={{ 
                        backgroundColor: 'var(--bg-secondary)', 
                        borderColor: 'var(--border-light)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                      Término
                    </label>
                    <input
                      type="time"
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                      style={{ 
                        backgroundColor: 'var(--bg-secondary)', 
                        borderColor: 'var(--border-light)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    Descrição
                  </label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    placeholder="Detalhes do evento..."
                    rows={2}
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 resize-none"
                    style={{ 
                      backgroundColor: 'var(--bg-secondary)', 
                      borderColor: 'var(--border-light)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                {/* Local/Link */}
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    Local ou Link da Reunião
                  </label>
                  <input
                    type="text"
                    value={newEvent.location || newEvent.meetLink}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.startsWith('http')) {
                        setNewEvent({ ...newEvent, meetLink: value, location: '' });
                      } else {
                        setNewEvent({ ...newEvent, location: value, meetLink: '' });
                      }
                    }}
                    placeholder="Ex: Sala 1 ou https://meet.google.com/..."
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: 'var(--bg-secondary)', 
                      borderColor: 'var(--border-light)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>

                {/* Participantes */}
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    Participantes (separados por vírgula)
                  </label>
                  <input
                    type="text"
                    value={newEvent.attendees}
                    onChange={(e) => setNewEvent({ ...newEvent, attendees: e.target.value })}
                    placeholder="Ex: Maria Silva, João Santos"
                    className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                    style={{ 
                      backgroundColor: 'var(--bg-secondary)', 
                      borderColor: 'var(--border-light)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div 
                className="p-4 flex gap-3"
                style={{ borderTop: '1px solid var(--border-light)', backgroundColor: 'var(--bg-secondary)' }}
              >
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
                  style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateEvent}
                  className="flex-1 px-4 py-2 rounded-lg font-medium text-white transition-colors flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#4370d1' }}
                >
                  <Check className="w-4 h-4" />
                  Criar Evento
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
