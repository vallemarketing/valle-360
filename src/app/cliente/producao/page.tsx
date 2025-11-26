'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
} from '@/components/ui/dialog';
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
} from 'lucide-react';

type ApprovalStatus = 'aguardando' | 'aprovado' | 'recusado';

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

export default function ProducaoPage() {
  const [activeTab, setActiveTab] = useState<ApprovalStatus>('aguardando');
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [rejectionFeedback, setRejectionFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [materials, setMaterials] = useState<Material[]>([
    {
      id: 1,
      title: 'Post Instagram - Promoção Black Friday',
      type: 'Post Instagram',
      status: 'aguardando',
      submittedAt: '2025-10-28',
      submittedBy: 'Designer João',
      description: 'Arte promocional para Black Friday com desconto de 40%',
      comments: 2,
    },
    {
      id: 2,
      title: 'Banner Site - Lançamento Produto',
      type: 'Banner Web',
      status: 'aguardando',
      submittedAt: '2025-10-29',
      submittedBy: 'Designer Maria',
      description: 'Banner principal para lançamento do novo produto X',
      comments: 0,
    },
    {
      id: 3,
      title: 'Story - Novidade da Semana',
      type: 'Story',
      status: 'aguardando',
      submittedAt: '2025-10-30',
      submittedBy: 'Designer Pedro',
      description: 'Story animado apresentando as novidades',
      comments: 1,
    },
    {
      id: 4,
      title: 'Vídeo Institucional - Empresa',
      type: 'Vídeo',
      status: 'aprovado',
      submittedAt: '2025-10-25',
      submittedBy: 'Videomaker Ana',
      description: 'Vídeo institucional de 30 segundos',
      comments: 5,
    },
    {
      id: 5,
      title: 'Post LinkedIn - Vaga Aberta',
      type: 'Post LinkedIn',
      status: 'aprovado',
      submittedAt: '2025-10-26',
      submittedBy: 'Designer João',
      description: 'Divulgação de vaga para desenvolvedor',
      comments: 3,
    },
  ]);

  const filteredMaterials = materials.filter((m) => m.status === activeTab);

  const tabs = [
    {
      id: 'aguardando' as ApprovalStatus,
      label: 'Aguardando',
      count: materials.filter((m) => m.status === 'aguardando').length,
      color: 'orange',
      icon: Clock,
    },
    {
      id: 'aprovado' as ApprovalStatus,
      label: 'Aprovados',
      count: materials.filter((m) => m.status === 'aprovado').length,
      color: 'green',
      icon: ThumbsUp,
    },
    {
      id: 'recusado' as ApprovalStatus,
      label: 'Recusados',
      count: materials.filter((m) => m.status === 'recusado').length,
      color: 'red',
      icon: XCircle,
    },
  ];

  const handleApprove = (material: Material) => {
    setSelectedMaterial(material);
    setShowApprovalDialog(true);
  };

  const confirmApproval = () => {
    if (selectedMaterial) {
      setIsSubmitting(true);

      setTimeout(() => {
        setMaterials((prev) =>
          prev.map((m) => (m.id === selectedMaterial.id ? { ...m, status: 'aprovado' } : m))
        );

        setIsSubmitting(false);
        setShowApprovalDialog(false);
        setSelectedMaterial(null);
      }, 1500);
    }
  };

  const handleReject = (material: Material) => {
    setSelectedMaterial(material);
    setRejectionFeedback('');
    setShowRejectionDialog(true);
  };

  const confirmRejection = () => {
    if (selectedMaterial && rejectionFeedback.trim()) {
      setIsSubmitting(true);

      setTimeout(() => {
        setMaterials((prev) =>
          prev.map((m) => (m.id === selectedMaterial.id ? { ...m, status: 'recusado' } : m))
        );

        setIsSubmitting(false);
        setShowRejectionDialog(false);
        setSelectedMaterial(null);
        setRejectionFeedback('');
      }, 1500);
    }
  };

  const getStatusBadge = (status: ApprovalStatus) => {
    const statusConfig = {
      aguardando: { label: 'Aguardando', className: 'bg-orange-100 text-orange-700' },
      aprovado: { label: 'Aprovado', className: 'bg-green-100 text-green-700' },
      recusado: { label: 'Recusado', className: 'bg-red-100 text-red-700' },
    };

    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Aprovações</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Revise e aprove os materiais criados pela equipe
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
                  ? 'bg-gradient-to-r from-valle-blue-600 to-valle-blue-700 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-valle-blue-50 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {filteredMaterials.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">Nenhum material nesta categoria</p>
              <p className="text-sm mt-1">
                {activeTab === 'aguardando' && 'Todos os materiais foram revisados'}
                {activeTab === 'aprovado' && 'Nenhum material aprovado ainda'}
                {activeTab === 'recusado' && 'Nenhum material recusado'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((material) => (
            <Card key={material.id} className="hover:shadow-xl transition-all">
              <CardHeader>
                <div className="aspect-video bg-gradient-to-br from-valle-platinum to-valle-silver dark:from-valle-charcoal/30 dark:to-valle-steel/20 rounded-lg mb-3 flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="w-12 h-12 mx-auto mb-2 text-valle-steel" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">{material.type}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-base line-clamp-2">{material.title}</CardTitle>
                  {getStatusBadge(material.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {material.description}
                </p>

                <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>Enviado em {new Date(material.submittedAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Por {material.submittedBy}</span>
                  </div>
                  {material.comments && material.comments > 0 && (
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-3 h-3" />
                      <span>{material.comments} comentário(s)</span>
                    </div>
                  )}
                </div>

                {material.status === 'aguardando' && (
                  <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(material)}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => handleReject(material)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Recusar
                    </Button>
                  </div>
                )}

                {material.status === 'aprovado' && (
                  <Button variant="outline" size="sm" className="w-full">
                    Ver Detalhes
                  </Button>
                )}

                {material.status === 'recusado' && (
                  <Button variant="outline" size="sm" className="w-full">
                    Ver Motivo
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent onClose={() => !isSubmitting && setShowApprovalDialog(false)}>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <DialogTitle>Obrigado pela aprovação!</DialogTitle>
                <DialogDescription>Sua aprovação foi registrada com sucesso</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <DialogBody>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-1">
                      Material aprovado!
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-400">
                      Nossa equipe foi notificada e o material "{selectedMaterial?.title}" está
                      liberado para publicação. Obrigado pela confiança!
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  onClick={confirmApproval}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? 'Enviando...' : 'Confirmar Aprovação'}
                </Button>
              </div>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent onClose={() => !isSubmitting && setShowRejectionDialog(false)}>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <MessageSquare className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <DialogTitle>Feedback da Recusa</DialogTitle>
                <DialogDescription>Ajude-nos a melhorar com seu feedback</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <DialogBody>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Material:</strong> {selectedMaterial?.title}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pode nos dar um feedback da rejeição?
                </label>
                <textarea
                  value={rejectionFeedback}
                  onChange={(e) => setRejectionFeedback(e.target.value)}
                  placeholder="Descreva o que não ficou ideal no material para que possamos melhorar..."
                  className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-valle-steel resize-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Seu feedback nos ajuda a entregar materiais cada vez melhores!
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowRejectionDialog(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmRejection}
                  disabled={isSubmitting || !rejectionFeedback.trim()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Enviando...' : 'Enviar para Equipe'}
                </Button>
              </div>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}
