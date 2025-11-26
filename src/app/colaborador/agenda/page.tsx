import { Metadata } from 'next';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, Plus, Video } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Agenda - Colaborador | Valle 360',
};

const events = [
  {
    title: 'Reunião com Cliente A',
    time: '10:00 - 11:00',
    type: 'meeting',
    color: 'bg-blue-500',
  },
  {
    title: 'Revisão de Campanha',
    time: '14:00 - 15:00',
    type: 'internal',
    color: 'bg-purple-500',
  },
  {
    title: 'Análise de Métricas',
    time: '16:00 - 17:00',
    type: 'task',
    color: 'bg-emerald-500',
  },
];

export default function EmployeeAgendaPage() {
  return (
    <div className="min-h-screen p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
            <p className="text-sm text-gray-600 mt-1">Hoje, 1 de Novembro</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Novo
          </button>
        </div>

        <Card className="p-4 mb-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">3 eventos hoje</p>
              <p className="text-sm text-gray-600">Próximo em 30 minutos</p>
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          {events.map((event, i) => (
            <Card key={i} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className={`w-1 h-full ${event.color} rounded-full`} />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {event.time}
                    </span>
                    {event.type === 'meeting' && (
                      <span className="flex items-center gap-1 text-blue-600">
                        <Video className="w-4 h-4" />
                        Meet
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
