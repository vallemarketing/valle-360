'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ThumbsUp,
  MessageSquare,
  Calendar,
  FileText,
  Heart,
  Send,
  Sparkles,
  Eye,
  ArrowRight,
  AlertCircle,
  Loader2,
  Filter,
  RefreshCw
} from 'lucide-react';
import { format, differenceInDays, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

type ApprovalStatus = 'aguardando' | 'aprovado' | 'recusado';
type DemandStatus = 'demandas' | 'em_progresso' | 'revisao' | 'aprovacao' | 'concluido';

interface Demand {
  id: string;
  title: string;
  description?: string;
  status: DemandStatus;
  dueDate?: Date;
  createdAt: Date;
  area: string;
  assignee?: string;
  priority: 'low' | 'medium' | 'high';
}

interface Material {
  id: number;
  title: string;
  type: string;
  status: ApprovalStatus;
  submittedAt: string;
  submittedBy: string;
  description: string;
  comments?: number;
}

const STATUS_CONFIG: Record<DemandStatus, { label: string; color: string; icon: any; bgColor: string }> = {
  demandas: { label: 'Aguardando Início', color: '#6366f1', icon: Clock, bgColor: 'bg-indigo-50' },
  em_progresso: { label: 'Em Produção', color: '#f97316', icon: Loader2, bgColor: 'bg-orange-50' },
  revisao: { label: 'Em Revisão', color: '#eab308', icon: Eye, bgColor: 'bg-yellow-50' },
  aprovacao: { label: 'Aguardando Sua Aprovação', color: '#06b6d4', icon: ThumbsUp, bgColor: 'bg-cyan-50' },
  concluido: { label: 'Concluído', color: '#10b981', icon: CheckCircle2, bgColor: 'bg-green-50' }
};

const PRIORITY_CONFIG = {
  low: { label: 'Normal', color: 'bg-gray-100 text-gray-700' },
  medium: { label: 'Média', color: 'bg-yellow-100 text-yellow-700' },
  high: { label: 'Urgente', color: 'bg-red-100 text-red-700' }
};

export default function ProducaoPage() {
  const [activeTab, setActiveTab] = useState<'demandas' | 'aprovacoes'>('demandas');
  const [demands, setDemands] = useState<Demand[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDemand, setSelectedDemand] = useState<Demand | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [rejectionFeedback, setRejectionFeedback] = useState('');
  const [filterStatus, setFilterStatus] = useState<DemandStatus | 'all'>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Carregar demandas do cliente (mock por enquanto)
      const mockDemands: Demand[] = [
        {
          id: '1',
          title: 'Landing Page - Lançamento Produto',
          description: 'Criação de landing page para o lançamento do novo produto',
          status: 'em_progresso',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          area: 'Web Designer',
          assignee: 'João Silva',
          priority: 'high'
        },
        {
          id: '2',
          title: 'Posts Instagram - Campanha Natal',
          description: '10 posts para campanha de natal',
          status: 'aprovacao',
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          area: 'Social Media',
          assignee: 'Maria Santos',
          priority: 'high'
        },
        {
          id: '3',
          title: 'Vídeo Institucional',
          description: 'Vídeo de 1 minuto apresentando a empresa',
          status: 'revisao',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          area: 'Video Maker',
          assignee: 'Pedro Costa',
          priority: 'medium'
        },
        {
          id: '4',
          title: 'Campanha Google Ads',
          description: 'Configuração e otimização de campanhas',
          status: 'demandas',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          area: 'Tráfego',
          priority: 'low'
        },
        {
          id: '5',
          title: 'Redesign Logo',
          description: 'Atualização da identidade visual',
          status: 'concluido',
          dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          area: 'Designer',
          assignee: 'Ana Lima',
          priority: 'medium'
        }
      ];

      setDemands(mockDemands);

      // Materiais para aprovação
      const mockMaterials: Material[] = [
        {
          id: 1,
          title: 'Post Instagram - Promoção Black Friday',
          type: 'Social Media',
          status: 'aguardando',
          submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          submittedBy: 'Maria Santos',
          description: 'Post carrossel com 5 imagens para a campanha de Black Friday',
          comments: 2
        },
        {
          id: 2,
          title: 'Banner Site - Nova Coleção',
          type: 'Design',
          status: 'aguardando',
          submittedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          submittedBy: 'Ana Lima',
          description: 'Banner principal para o site com a nova coleção',
          comments: 0
        },
        {
          id: 3,
          title: 'Vídeo Reels - Tutorial Produto',
          type: 'Vídeo',
          status: 'aprovado',
          submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          submittedBy: 'Pedro Costa',
          description: 'Vídeo de 30 segundos mostrando como usar o produto',
          comments: 5
        }
      ];

      setMaterials(mockMaterials);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDemands = demands.filter(d => 
    filterStatus === 'all' || d.status === filterStatus
  );

  const pendingApprovals = materials.filter(m => m.status === 'aguardando').length;
  const inProgressCount = demands.filter(d => ['em_progresso', 'revisao'].includes(d.status)).length;
  const completedCount = demands.filter(d => d.status === 'concluido').length;

  const handleApprove = (material: Material) => {
    setMaterials(prev => prev.map(m => 
      m.id === material.id ? { ...m, status: 'aprovado' as ApprovalStatus } : m
    ));
    setShowApprovalDialog(false);
    setSelectedMaterial(null);
  };

  const handleReject = (material: Material) => {
    setMaterials(prev => prev.map(m => 
      m.id === material.id ? { ...m, status: 'recusado' as ApprovalStatus } : m
    ));
    setShowRejectionDialog(false);
    setSelectedMaterial(null);
    setRejectionFeedback('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Produção</h1>
            <p className="text-gray-500">Acompanhe suas demandas e aprovações</p>
          </div>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{inProgressCount}</p>
                <p className="text-sm text-gray-500">Em Produção</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                <ThumbsUp className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{pendingApprovals}</p>
                <p className="text-sm text-gray-500">Aguardando Aprovação</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{completedCount}</p>
                <p className="text-sm text-gray-500">Concluídos</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{demands.length}</p>
                <p className="text-sm text-gray-500">Total de Demandas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('demandas')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'demandas'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                Minhas Demandas
              </div>
            </button>
            <button
              onClick={() => setActiveTab('aprovacoes')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${
                activeTab === 'aprovacoes'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <ThumbsUp className="w-4 h-4" />
                Aprovações
                {pendingApprovals > 0 && (
                  <span className="absolute top-2 right-1/4 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {pendingApprovals}
                  </span>
                )}
              </div>
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'demandas' ? (
              <div className="space-y-4">
                {/* Filter */}
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todas as Demandas</option>
                    <option value="demandas">Aguardando Início</option>
                    <option value="em_progresso">Em Produção</option>
                    <option value="revisao">Em Revisão</option>
                    <option value="aprovacao">Aguardando Aprovação</option>
                    <option value="concluido">Concluídos</option>
                  </select>
                </div>

                {/* Demands List */}
                <div className="space-y-3">
                  {filteredDemands.map((demand, index) => {
                    const statusConfig = STATUS_CONFIG[demand.status];
                    const StatusIcon = statusConfig.icon;
                    const daysUntilDue = demand.dueDate ? differenceInDays(demand.dueDate, new Date()) : null;

                    return (
                      <motion.div
                        key={demand.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedDemand(demand)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${statusConfig.bgColor}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span 
                                className="px-2 py-1 rounded-full text-xs font-medium text-white"
                                style={{ backgroundColor: statusConfig.color }}
                              >
                                <StatusIcon className="w-3 h-3 inline mr-1" />
                                {statusConfig.label}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_CONFIG[demand.priority].color}`}>
                                {PRIORITY_CONFIG[demand.priority].label}
                              </span>
                            </div>

                            <h3 className="font-semibold text-gray-800">{demand.title}</h3>
                            {demand.description && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-1">{demand.description}</p>
                            )}

                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Sparkles className="w-4 h-4" />
                                {demand.area}
                              </span>
                              {demand.assignee && (
                                <span className="flex items-center gap-1">
                                  <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">
                                    {demand.assignee[0]}
                                  </span>
                                  {demand.assignee}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            {demand.dueDate && (
                              <div className={`flex items-center gap-1 text-sm ${
                                daysUntilDue !== null && daysUntilDue < 0 ? 'text-red-600' :
                                daysUntilDue !== null && daysUntilDue <= 2 ? 'text-orange-600' :
                                'text-gray-500'
                              }`}>
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {daysUntilDue !== null && daysUntilDue < 0 
                                    ? `Atrasado ${Math.abs(daysUntilDue)} dias`
                                    : daysUntilDue === 0 
                                      ? 'Hoje'
                                      : daysUntilDue === 1
                                        ? 'Amanhã'
                                        : `${daysUntilDue} dias`
                                  }
                                </span>
                              </div>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              Criado {formatDistanceToNow(demand.createdAt, { addSuffix: true, locale: ptBR })}
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="flex items-center gap-1">
                            {Object.keys(STATUS_CONFIG).map((status, i) => (
                              <div
                                key={status}
                                className={`flex-1 h-1.5 rounded-full transition-colors ${
                                  Object.keys(STATUS_CONFIG).indexOf(demand.status) >= i
                                    ? 'bg-blue-500'
                                    : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {filteredDemands.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Nenhuma demanda encontrada</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Pending Approvals */}
                <h3 className="font-semibold text-gray-800 mb-4">Materiais Aguardando Aprovação</h3>
                
                {materials.filter(m => m.status === 'aguardando').map((material, index) => (
                  <motion.div
                    key={material.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 bg-cyan-50 rounded-xl border border-cyan-200"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2 py-1 bg-cyan-100 text-cyan-700 text-xs rounded-full font-medium">
                          {material.type}
                        </span>
                        <h4 className="font-semibold text-gray-800 mt-2">{material.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          Enviado por {material.submittedBy} • {formatDistanceToNow(new Date(material.submittedAt), { addSuffix: true, locale: ptBR })}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedMaterial(material);
                            setShowRejectionDialog(true);
                          }}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Recusar
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMaterial(material);
                            setShowApprovalDialog(true);
                          }}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Aprovar
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {materials.filter(m => m.status === 'aguardando').length === 0 && (
                  <div className="text-center py-12">
                    <ThumbsUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum material aguardando aprovação</p>
                  </div>
                )}

                {/* Recent Approvals */}
                {materials.filter(m => m.status !== 'aguardando').length > 0 && (
                  <>
                    <h3 className="font-semibold text-gray-800 mt-8 mb-4">Histórico Recente</h3>
                    {materials.filter(m => m.status !== 'aguardando').map((material, index) => (
                      <div
                        key={material.id}
                        className={`p-4 rounded-xl border ${
                          material.status === 'aprovado' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              {material.status === 'aprovado' ? (
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-600" />
                              )}
                              <span className={`text-sm font-medium ${
                                material.status === 'aprovado' ? 'text-green-700' : 'text-red-700'
                              }`}>
                                {material.status === 'aprovado' ? 'Aprovado' : 'Recusado'}
                              </span>
                            </div>
                            <h4 className="font-medium text-gray-800 mt-1">{material.title}</h4>
                          </div>
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(material.submittedAt), { addSuffix: true, locale: ptBR })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Approval Dialog */}
        <AnimatePresence>
          {showApprovalDialog && selectedMaterial && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowApprovalDialog(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Aprovar Material</h2>
                  <p className="text-gray-500 mt-2">
                    Você está prestes a aprovar "{selectedMaterial.title}"
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowApprovalDialog(false)}
                    className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleApprove(selectedMaterial)}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    Confirmar Aprovação
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rejection Dialog */}
        <AnimatePresence>
          {showRejectionDialog && selectedMaterial && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowRejectionDialog(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Recusar Material</h2>
                  <p className="text-gray-500 mt-2">
                    Por favor, informe o motivo da recusa
                  </p>
                </div>

                <textarea
                  value={rejectionFeedback}
                  onChange={(e) => setRejectionFeedback(e.target.value)}
                  placeholder="Descreva o que precisa ser ajustado..."
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
                />

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowRejectionDialog(false);
                      setRejectionFeedback('');
                    }}
                    className="flex-1 px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleReject(selectedMaterial)}
                    disabled={!rejectionFeedback.trim()}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Enviar Feedback
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Demand Detail Modal */}
        <AnimatePresence>
          {selectedDemand && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedDemand(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: STATUS_CONFIG[selectedDemand.status].color }}
                    >
                      {STATUS_CONFIG[selectedDemand.status].label}
                    </span>
                    <h2 className="text-xl font-bold text-gray-800 mt-2">{selectedDemand.title}</h2>
                  </div>
                  <button
                    onClick={() => setSelectedDemand(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <XCircle className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {selectedDemand.description && (
                  <p className="text-gray-600 mb-4">{selectedDemand.description}</p>
                )}

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-gray-500">Área</span>
                    <span className="font-medium">{selectedDemand.area}</span>
                  </div>
                  {selectedDemand.assignee && (
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-gray-500">Responsável</span>
                      <span className="font-medium">{selectedDemand.assignee}</span>
                    </div>
                  )}
                  {selectedDemand.dueDate && (
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-gray-500">Previsão de Entrega</span>
                      <span className="font-medium">
                        {format(selectedDemand.dueDate, "dd 'de' MMMM", { locale: ptBR })}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-500">Prioridade</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_CONFIG[selectedDemand.priority].color}`}>
                      {PRIORITY_CONFIG[selectedDemand.priority].label}
                    </span>
                  </div>
                </div>

                {/* Progress */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-3">Progresso</h4>
                  <div className="flex items-center gap-2">
                    {Object.entries(STATUS_CONFIG).map(([status, config], i) => {
                      const isActive = Object.keys(STATUS_CONFIG).indexOf(selectedDemand.status) >= i;
                      const isCurrent = status === selectedDemand.status;
                      return (
                        <div key={status} className="flex-1 flex flex-col items-center">
                          <div 
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isActive ? 'text-white' : 'bg-gray-200 text-gray-400'
                            }`}
                            style={{ backgroundColor: isActive ? config.color : undefined }}
                          >
                            <config.icon className="w-4 h-4" />
                          </div>
                          <span className={`text-xs mt-1 text-center ${isCurrent ? 'font-medium text-gray-800' : 'text-gray-400'}`}>
                            {config.label.split(' ')[0]}
                          </span>
                        </div>
                      );
                    })}
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
