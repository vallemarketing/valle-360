'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Plus, Search, Filter, CheckCircle, Clock, AlertTriangle,
  X, Download, Eye, MessageSquare, Calendar, User, Building,
  Sparkles, ArrowRight, MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MaterialRequest {
  id: string;
  title: string;
  description: string;
  client: string;
  type: 'arte' | 'video' | 'texto' | 'outro';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'review' | 'approved' | 'delivered';
  requestedAt: string;
  deadline: string;
  assignee: string;
  attachments: number;
  comments: number;
}

const mockRequests: MaterialRequest[] = [
  {
    id: '1',
    title: 'Banner Black Friday - Instagram',
    description: 'Banner promocional para campanha de Black Friday com foco em conversão',
    client: 'Tech Solutions Ltda',
    type: 'arte',
    priority: 'high',
    status: 'in_progress',
    requestedAt: '2024-12-01',
    deadline: '2024-12-10',
    assignee: 'Maria Santos',
    attachments: 3,
    comments: 5
  },
  {
    id: '2',
    title: 'Vídeo Institucional',
    description: 'Vídeo de 60s para apresentação da empresa nas redes sociais',
    client: 'Valle Boutique',
    type: 'video',
    priority: 'medium',
    status: 'review',
    requestedAt: '2024-11-28',
    deadline: '2024-12-15',
    assignee: 'João Silva',
    attachments: 2,
    comments: 8
  },
  {
    id: '3',
    title: 'Copy para Landing Page',
    description: 'Textos persuasivos para nova landing page de captação de leads',
    client: 'Digital Plus',
    type: 'texto',
    priority: 'urgent',
    status: 'pending',
    requestedAt: '2024-12-05',
    deadline: '2024-12-08',
    assignee: 'Ana Oliveira',
    attachments: 1,
    comments: 2
  },
  {
    id: '4',
    title: 'Stories de Natal',
    description: 'Kit com 10 stories temáticos para campanha de Natal',
    client: 'E-commerce Pro',
    type: 'arte',
    priority: 'low',
    status: 'approved',
    requestedAt: '2024-11-25',
    deadline: '2024-12-20',
    assignee: 'Pedro Costa',
    attachments: 10,
    comments: 12
  }
];

export default function SolicitacoesMaterialPage() {
  const [requests, setRequests] = useState<MaterialRequest[]>(mockRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaterialRequest | null>(null);

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      pending: { color: 'bg-gray-100 text-gray-700 border-gray-300', icon: <Clock className="w-3 h-3" />, label: 'Pendente' },
      in_progress: { color: 'bg-blue-100 text-blue-700 border-blue-300', icon: <Sparkles className="w-3 h-3" />, label: 'Em Produção' },
      review: { color: 'bg-purple-100 text-purple-700 border-purple-300', icon: <Eye className="w-3 h-3" />, label: 'Em Revisão' },
      approved: { color: 'bg-green-100 text-green-700 border-green-300', icon: <CheckCircle className="w-3 h-3" />, label: 'Aprovado' },
      delivered: { color: 'bg-emerald-100 text-emerald-700 border-emerald-300', icon: <ArrowRight className="w-3 h-3" />, label: 'Entregue' }
    };
    const c = config[status] || config.pending;
    return (
      <Badge className={`${c.color} border flex items-center gap-1`}>
        {c.icon}
        {c.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const config: Record<string, { color: string; label: string }> = {
      low: { color: 'bg-gray-100 text-gray-600', label: 'Baixa' },
      medium: { color: 'bg-blue-100 text-blue-600', label: 'Média' },
      high: { color: 'bg-orange-100 text-orange-600', label: 'Alta' },
      urgent: { color: 'bg-red-100 text-red-600', label: 'Urgente' }
    };
    const c = config[priority] || config.low;
    return <span className={`px-2 py-0.5 rounded text-xs font-medium ${c.color}`}>{c.label}</span>;
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || req.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    inProgress: requests.filter(r => r.status === 'in_progress').length,
    urgent: requests.filter(r => r.priority === 'urgent').length
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Solicitações de Material
              </h1>
              <p className="text-gray-500">
                Gerencie solicitações de artes, vídeos e conteúdos
              </p>
            </div>
          </div>
          <Button 
            onClick={() => setShowNewModal(true)}
            className="bg-[#1672d6] hover:bg-[#1260b5]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Solicitação
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                  <p className="text-sm text-gray-500">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inProgress}</p>
                  <p className="text-sm text-gray-500">Em Produção</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
                  <p className="text-sm text-gray-500">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.urgent}</p>
                  <p className="text-sm text-gray-500">Urgentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por título ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1672d6] bg-white dark:bg-gray-800"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1672d6] bg-white dark:bg-gray-800"
          >
            <option value="all">Todos os Status</option>
            <option value="pending">Pendente</option>
            <option value="in_progress">Em Produção</option>
            <option value="review">Em Revisão</option>
            <option value="approved">Aprovado</option>
            <option value="delivered">Entregue</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1672d6] bg-white dark:bg-gray-800"
          >
            <option value="all">Todas as Prioridades</option>
            <option value="urgent">Urgente</option>
            <option value="high">Alta</option>
            <option value="medium">Média</option>
            <option value="low">Baixa</option>
          </select>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredRequests.map((request, idx) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="hover:border-[#1672d6]/30 transition-all cursor-pointer" onClick={() => setSelectedRequest(request)}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{request.title}</h3>
                        {getStatusBadge(request.status)}
                        {getPriorityBadge(request.priority)}
                      </div>
                      <p className="text-sm text-gray-500 mb-3">{request.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Building className="w-4 h-4" />
                          {request.client}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {request.assignee}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Prazo: {new Date(request.deadline).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {request.comments}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); alert('📥 Baixando arquivos...'); }}>
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedRequest(request); }}>
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Nenhuma solicitação encontrada</p>
          </div>
        )}

        {/* Modal de Nova Solicitação */}
        <AnimatePresence>
          {showNewModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
              onClick={() => setShowNewModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl"
              >
                <div className="p-6 border-b flex items-center justify-between">
                  <h2 className="text-xl font-bold">Nova Solicitação</h2>
                  <button onClick={() => setShowNewModal(false)}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Título</label>
                    <input type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="Ex: Banner para Instagram" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Descrição</label>
                    <textarea className="w-full px-3 py-2 border rounded-lg" rows={3} placeholder="Descreva o que precisa..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Tipo</label>
                      <select className="w-full px-3 py-2 border rounded-lg">
                        <option value="arte">Arte/Design</option>
                        <option value="video">Vídeo</option>
                        <option value="texto">Texto/Copy</option>
                        <option value="outro">Outro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Prioridade</label>
                      <select className="w-full px-3 py-2 border rounded-lg">
                        <option value="low">Baixa</option>
                        <option value="medium">Média</option>
                        <option value="high">Alta</option>
                        <option value="urgent">Urgente</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Prazo</label>
                    <input type="date" className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                </div>
                <div className="p-6 border-t flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowNewModal(false)}>Cancelar</Button>
                  <Button className="bg-[#1672d6]" onClick={() => { alert('✅ Solicitação criada com sucesso!'); setShowNewModal(false); }}>
                    Criar Solicitação
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de Detalhes */}
        <AnimatePresence>
          {selectedRequest && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
              onClick={() => setSelectedRequest(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 border-b flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">{selectedRequest.title}</h2>
                    <p className="text-sm text-gray-500">{selectedRequest.client}</p>
                  </div>
                  <button onClick={() => setSelectedRequest(null)}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedRequest.status)}
                    {getPriorityBadge(selectedRequest.priority)}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Descrição</label>
                    <p className="text-gray-900 dark:text-white">{selectedRequest.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Responsável</label>
                      <p className="text-gray-900 dark:text-white">{selectedRequest.assignee}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Prazo</label>
                      <p className="text-gray-900 dark:text-white">{new Date(selectedRequest.deadline).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Arquivos Anexados ({selectedRequest.attachments})</label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => alert('📥 Baixando todos os arquivos...')}>
                        <Download className="w-4 h-4 mr-1" />
                        Baixar Todos
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t flex justify-between">
                  <Button variant="outline" onClick={() => alert('✅ Status atualizado!')}>
                    Atualizar Status
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => alert('💬 Abrindo chat...')}>
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Comentar
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700" onClick={() => { alert('✅ Material aprovado e enviado ao cliente!'); setSelectedRequest(null); }}>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Aprovar
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
