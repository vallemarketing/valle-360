'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Send, 
  Eye, 
  Edit, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  X,
  Building,
  User,
  Calendar,
  DollarSign,
  Upload,
  FileSignature,
  Scale,
  Sparkles,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Contract {
  id: string;
  clientName: string;
  clientCompany: string;
  type: 'service' | 'project' | 'retainer';
  status: 'draft' | 'pending_legal' | 'pending_signature' | 'signed' | 'expired';
  value: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  services: string[];
}

export default function ContratosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showNewContractModal, setShowNewContractModal] = useState(false);
  const [showContractPreview, setShowContractPreview] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  const [contracts] = useState<Contract[]>([
    {
      id: '1',
      clientName: 'João Silva',
      clientCompany: 'Tech Solutions Ltda',
      type: 'service',
      status: 'signed',
      value: 8500,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      createdAt: '2023-12-15',
      services: ['Gestão de Redes Sociais', 'Tráfego Pago']
    },
    {
      id: '2',
      clientName: 'Maria Santos',
      clientCompany: 'Valle Boutique',
      type: 'service',
      status: 'pending_signature',
      value: 5200,
      startDate: '2024-02-01',
      endDate: '2025-01-31',
      createdAt: '2024-01-20',
      services: ['Design Gráfico', 'Criação de Conteúdo']
    },
    {
      id: '3',
      clientName: 'Pedro Costa',
      clientCompany: 'Inova Marketing',
      type: 'retainer',
      status: 'pending_legal',
      value: 12000,
      startDate: '2024-03-01',
      endDate: '2025-02-28',
      createdAt: '2024-02-10',
      services: ['Consultoria Estratégica', 'Gestão Completa']
    },
    {
      id: '4',
      clientName: 'Ana Oliveira',
      clientCompany: 'Digital Plus',
      type: 'project',
      status: 'draft',
      value: 15000,
      startDate: '2024-04-01',
      endDate: '2024-06-30',
      createdAt: '2024-03-01',
      services: ['Desenvolvimento Web', 'SEO']
    }
  ]);

  const stats = {
    total: contracts.length,
    signed: contracts.filter(c => c.status === 'signed').length,
    pending: contracts.filter(c => ['pending_legal', 'pending_signature'].includes(c.status)).length,
    totalValue: contracts.filter(c => c.status === 'signed').reduce((acc, c) => acc + c.value, 0)
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { className: string; label: string; icon: React.ReactNode }> = {
      draft: { className: 'bg-gray-500/10 text-gray-600 border-gray-500/30', label: 'Rascunho', icon: <Edit className="w-3 h-3" /> },
      pending_legal: { className: 'bg-purple-500/10 text-purple-600 border-purple-500/30', label: 'Aguardando Jurídico', icon: <Scale className="w-3 h-3" /> },
      pending_signature: { className: 'bg-amber-500/10 text-amber-600 border-amber-500/30', label: 'Aguardando Assinatura', icon: <Clock className="w-3 h-3" /> },
      signed: { className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30', label: 'Assinado', icon: <CheckCircle className="w-3 h-3" /> },
      expired: { className: 'bg-red-500/10 text-red-600 border-red-500/30', label: 'Expirado', icon: <AlertTriangle className="w-3 h-3" /> }
    };
    const style = styles[status];
    return (
      <Badge className={cn("border flex items-center gap-1", style.className)}>
        {style.icon}
        {style.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const types: Record<string, string> = {
      service: 'Prestação de Serviço',
      project: 'Projeto',
      retainer: 'Retainer'
    };
    return <Badge variant="outline">{types[type]}</Badge>;
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = 
      contract.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.clientCompany.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || contract.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleGenerateContract = (contract: Contract) => {
    setSelectedContract(contract);
    setShowContractPreview(true);
  };

  const handleSendToLegal = async (contractId: string) => {
    // Integração jurídica ainda não está conectada nesta tela.
    toast.message('Envio para Jurídico ainda não está integrado. Use o Kanban/Mensagens para acompanhar.');
    void contractId;
  };

  const handleSendForSignature = async () => {
    toast.message('Assinatura eletrônica ainda não está integrada. Use Mensagens para enviar o contrato ao cliente.');
  };

  const handleDownloadPDF = async () => {
    try {
      if (!selectedContract) {
        toast.error('Selecione um contrato para exportar.');
        return;
      }
      const blob = new Blob([JSON.stringify(selectedContract, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contrato-${String(selectedContract.id || 'export')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Contrato exportado (JSON).');
    } catch {
      toast.error('Falha ao exportar contrato.');
    }
  };

  const handleNewContract = () => {
    // TODO: Implementar formulário de novo contrato com template padrão
    setShowNewContractModal(true);
  };

  const handleExportCSV = async () => {
    try {
      const headers = ['id', 'cliente', 'empresa', 'status', 'tipo', 'valor', 'inicio', 'fim'];
      const escape = (v: any) => `"${String(v ?? '').replace(/\"/g, '""')}"`;
      const rows = filteredContracts.map((c) =>
        [
          escape(c.id),
          escape(c.clientName),
          escape(c.clientCompany),
          escape(c.status),
          escape(c.type),
          escape(c.value),
          escape(c.startDate),
          escape(c.endDate),
        ].join(',')
      );
      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contratos-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('CSV exportado com sucesso!');
    } catch (e: any) {
      toast.error(e?.message || 'Falha ao exportar CSV');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0f1a] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#001533] dark:text-white mb-2">
                Gestão de Contratos
              </h1>
              <p className="text-[#001533]/60 dark:text-white/60">
                Geração automática e acompanhamento de contratos
              </p>
            </div>
            <Button 
              onClick={handleNewContract}
              className="bg-[#1672d6] hover:bg-[#1260b5]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Contrato
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total de Contratos', value: stats.total, icon: FileText, color: 'text-[#1672d6]' },
            { label: 'Contratos Ativos', value: stats.signed, icon: CheckCircle, color: 'text-emerald-500' },
            { label: 'Pendentes', value: stats.pending, icon: Clock, color: 'text-amber-500' },
            { label: 'Valor Total Mensal', value: `R$ ${stats.totalValue.toLocaleString('pt-BR')}`, icon: DollarSign, color: 'text-purple-500' }
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="border-[#001533]/10 dark:border-white/10">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-3 rounded-xl bg-[#001533]/5 dark:bg-white/5", stat.color)}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-[#001533]/60 dark:text-white/60">{stat.label}</p>
                      <p className="text-2xl font-bold text-[#001533] dark:text-white">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <Card className="border-[#001533]/10 dark:border-white/10 mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#001533]/40" />
                <Input
                  placeholder="Buscar por cliente ou empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-[#001533]/20"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 rounded-lg border border-[#001533]/20 bg-white dark:bg-[#001533] focus:outline-none focus:ring-2 focus:ring-[#1672d6]"
              >
                <option value="all">Todos os Status</option>
                <option value="draft">Rascunho</option>
                <option value="pending_legal">Aguardando Jurídico</option>
                <option value="pending_signature">Aguardando Assinatura</option>
                <option value="signed">Assinados</option>
                <option value="expired">Expirados</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Contracts List */}
        <div className="space-y-4">
          {filteredContracts.map((contract, idx) => (
            <motion.div
              key={contract.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="border-[#001533]/10 dark:border-white/10 hover:border-[#1672d6]/30 transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 rounded-xl bg-[#1672d6]/10">
                        <FileText className="w-6 h-6 text-[#1672d6]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-[#001533] dark:text-white">
                            {contract.clientCompany}
                          </h3>
                          {getStatusBadge(contract.status)}
                          {getTypeBadge(contract.type)}
                        </div>
                        <p className="text-sm text-[#001533]/60 dark:text-white/60 mb-3">
                          {contract.clientName} • {contract.services.join(', ')}
                        </p>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-[#001533]/40 dark:text-white/40">Valor Mensal</p>
                            <p className="font-semibold text-[#1672d6]">
                              R$ {contract.value.toLocaleString('pt-BR')}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#001533]/40 dark:text-white/40">Início</p>
                            <p className="font-medium">{new Date(contract.startDate).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <div>
                            <p className="text-[#001533]/40 dark:text-white/40">Término</p>
                            <p className="font-medium">{new Date(contract.endDate).toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerateContract(contract)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Visualizar
                      </Button>
                      
                      {contract.status === 'draft' && (
                        <Button
                          size="sm"
                          onClick={() => handleSendToLegal(contract.id)}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Scale className="w-4 h-4 mr-1" />
                          Enviar ao Jurídico
                        </Button>
                      )}
                      
                      {contract.status === 'pending_signature' && (
                        <Button
                          size="sm"
                          className="bg-[#1672d6] hover:bg-[#1260b5]"
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Enviar para Assinatura
                        </Button>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Baixar PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileSignature className="w-4 h-4 mr-2" />
                            Renovar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredContracts.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-[#001533]/20 mb-4" />
            <p className="text-[#001533]/60 dark:text-white/60">Nenhum contrato encontrado</p>
          </div>
        )}
      </div>

      {/* Modal de Preview do Contrato */}
      <AnimatePresence>
        {showContractPreview && selectedContract && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowContractPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#0a0f1a] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Header do Contrato */}
              <div className="p-6 border-b border-[#001533]/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img 
                      src="/images/valle360-logo.png" 
                      alt="Valle 360" 
                      className="h-10"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div>
                      <h2 className="text-xl font-bold">Contrato de Prestação de Serviços</h2>
                      <p className="text-sm text-[#001533]/60">Valle 360 Marketing Digital</p>
                    </div>
                  </div>
                  <button onClick={() => setShowContractPreview(false)}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Conteúdo do Contrato */}
              <div className="p-6 space-y-6">
                {/* Partes */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-4 rounded-xl bg-[#001533]/5">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Building className="w-4 h-4 text-[#1672d6]" />
                      CONTRATANTE
                    </h3>
                    <p className="font-bold">{selectedContract.clientCompany}</p>
                    <p className="text-sm text-[#001533]/60">{selectedContract.clientName}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#1672d6]/5">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Building className="w-4 h-4 text-[#1672d6]" />
                      CONTRATADA
                    </h3>
                    <p className="font-bold">Valle 360 Ltda</p>
                    <p className="text-sm text-[#001533]/60">CNPJ: 00.000.000/0001-00</p>
                  </div>
                </div>

                {/* Objeto */}
                <div>
                  <h3 className="font-semibold mb-2">CLÁUSULA 1ª - DO OBJETO</h3>
                  <p className="text-sm text-[#001533]/80 dark:text-white/80">
                    O presente contrato tem por objeto a prestação dos seguintes serviços de marketing digital:
                  </p>
                  <ul className="list-disc list-inside mt-2 text-sm">
                    {selectedContract.services.map((service, idx) => (
                      <li key={idx}>{service}</li>
                    ))}
                  </ul>
                </div>

                {/* Valor */}
                <div>
                  <h3 className="font-semibold mb-2">CLÁUSULA 2ª - DO VALOR</h3>
                  <p className="text-sm text-[#001533]/80 dark:text-white/80">
                    Pelos serviços prestados, a CONTRATANTE pagará à CONTRATADA o valor mensal de{' '}
                    <strong className="text-[#1672d6]">
                      R$ {selectedContract.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </strong>
                    , com vencimento todo dia 10 de cada mês.
                  </p>
                </div>

                {/* Vigência */}
                <div>
                  <h3 className="font-semibold mb-2">CLÁUSULA 3ª - DA VIGÊNCIA</h3>
                  <p className="text-sm text-[#001533]/80 dark:text-white/80">
                    Este contrato terá vigência de{' '}
                    <strong>{new Date(selectedContract.startDate).toLocaleDateString('pt-BR')}</strong> a{' '}
                    <strong>{new Date(selectedContract.endDate).toLocaleDateString('pt-BR')}</strong>,
                    podendo ser renovado automaticamente por igual período.
                  </p>
                </div>

                {/* Assinaturas */}
                <div className="grid grid-cols-2 gap-6 pt-6 border-t">
                  <div className="text-center">
                    <div className="h-20 border-b border-dashed border-[#001533]/30 mb-2"></div>
                    <p className="font-medium">{selectedContract.clientName}</p>
                    <p className="text-xs text-[#001533]/50">CONTRATANTE</p>
                  </div>
                  <div className="text-center">
                    <div className="h-20 border-b border-dashed border-[#001533]/30 mb-2"></div>
                    <p className="font-medium">Guilherme Valle</p>
                    <p className="text-xs text-[#001533]/50">CONTRATADA</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-[#001533]/10 flex justify-between">
                <Button variant="outline" onClick={handleDownloadPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar PDF
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="text-purple-600 border-purple-600/30 hover:bg-purple-50"
                    onClick={() => handleSendToLegal(selectedContract.id)}
                  >
                    <Scale className="w-4 h-4 mr-2" />
                    Enviar ao Jurídico
                  </Button>
                  <Button 
                    className="bg-[#1672d6] hover:bg-[#1260b5]"
                    onClick={handleSendForSignature}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Enviar para Assinatura
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
