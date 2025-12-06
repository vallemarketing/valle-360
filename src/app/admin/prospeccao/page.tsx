'use client';

/**
 * Valle 360 - Central de Prospecção Automatizada
 * Captação de leads com IA → Qualificação → Contato → Reunião
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Search, Users, Target, Mail, Phone, Linkedin, Globe,
  Building2, MapPin, TrendingUp, Calendar, MessageSquare,
  ChevronRight, Filter, Plus, RefreshCw, Brain, Zap,
  CheckCircle, Clock, XCircle, ArrowRight, Star, Award,
  BarChart3, PieChart, Activity, Send, Eye, MoreVertical,
  Play, Pause, Settings, Download, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =====================================================
// TIPOS
// =====================================================

interface Lead {
  id: string;
  company_name: string;
  company_website?: string;
  company_industry?: string;
  company_size?: string;
  location?: { city?: string; state?: string };
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_linkedin?: string;
  contact_role?: string;
  source: string;
  segment: string;
  qualification_score: number;
  status: 'new' | 'contacted' | 'responding' | 'meeting_scheduled' | 'negotiating' | 'won' | 'lost';
  interactions_count: number;
  estimated_value?: number;
  next_action?: string;
  next_action_date?: string;
  tags: string[];
  created_at: string;
}

interface Campaign {
  id: string;
  name: string;
  target_segment: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  leads_found: number;
  leads_contacted: number;
  meetings_scheduled: number;
  deals_won: number;
}

interface ProspectingStats {
  totalLeads: number;
  byStatus: Record<string, number>;
  bySegment: Record<string, number>;
  conversionRate: number;
  avgScore: number;
}

// =====================================================
// MOCK DATA
// =====================================================

const mockLeads: Lead[] = [
  {
    id: 'l1',
    company_name: 'Tech Solutions Ltda',
    company_website: 'https://techsolutions.com.br',
    company_industry: 'Tecnologia',
    company_size: 'medium',
    location: { city: 'São Paulo', state: 'SP' },
    contact_name: 'Carlos Silva',
    contact_email: 'carlos@techsolutions.com.br',
    contact_phone: '(11) 99999-1234',
    contact_linkedin: 'linkedin.com/in/carlossilva',
    contact_role: 'CEO',
    source: 'tavily',
    segment: 'ecommerce',
    qualification_score: 85,
    status: 'meeting_scheduled',
    interactions_count: 4,
    estimated_value: 5000,
    next_action: 'Reunião agendada',
    next_action_date: '2024-12-10',
    tags: ['ecommerce', 'alto_potencial'],
    created_at: '2024-12-01'
  },
  {
    id: 'l2',
    company_name: 'Sabor & Arte Restaurante',
    company_website: 'https://saborearte.com',
    company_industry: 'Alimentação',
    company_size: 'small',
    location: { city: 'Rio de Janeiro', state: 'RJ' },
    contact_name: 'Maria Santos',
    contact_email: 'contato@saborearte.com',
    contact_role: 'Proprietária',
    source: 'google_maps',
    segment: 'restaurante',
    qualification_score: 72,
    status: 'contacted',
    interactions_count: 2,
    estimated_value: 2500,
    next_action: 'Aguardar resposta',
    next_action_date: '2024-12-08',
    tags: ['restaurante', 'sem_redes_sociais'],
    created_at: '2024-12-02'
  },
  {
    id: 'l3',
    company_name: 'Clínica Bem Estar',
    company_website: 'https://clinicabemestar.com.br',
    company_industry: 'Saúde',
    company_size: 'medium',
    location: { city: 'Belo Horizonte', state: 'MG' },
    contact_name: 'Dr. Pedro Oliveira',
    contact_email: 'pedro@clinicabemestar.com.br',
    contact_linkedin: 'linkedin.com/in/drpedro',
    contact_role: 'Diretor',
    source: 'linkedin',
    segment: 'clinica',
    qualification_score: 90,
    status: 'negotiating',
    interactions_count: 6,
    estimated_value: 8000,
    next_action: 'Enviar proposta',
    next_action_date: '2024-12-06',
    tags: ['clinica', 'alto_potencial', 'google_ads'],
    created_at: '2024-11-25'
  },
  {
    id: 'l4',
    company_name: 'Fashion Store',
    company_industry: 'Varejo',
    company_size: 'small',
    location: { city: 'Curitiba', state: 'PR' },
    contact_name: 'Ana Costa',
    contact_email: 'ana@fashionstore.com',
    source: 'tavily',
    segment: 'ecommerce',
    qualification_score: 65,
    status: 'new',
    interactions_count: 0,
    estimated_value: 3000,
    tags: ['moda', 'sem_site'],
    created_at: '2024-12-05'
  },
  {
    id: 'l5',
    company_name: 'Imobiliária Prime',
    company_website: 'https://imobiliariaprime.com.br',
    company_industry: 'Imobiliário',
    company_size: 'large',
    location: { city: 'São Paulo', state: 'SP' },
    contact_name: 'Roberto Almeida',
    contact_email: 'roberto@prime.com.br',
    contact_phone: '(11) 98888-5555',
    contact_role: 'Diretor Comercial',
    source: 'referral',
    segment: 'imobiliaria',
    qualification_score: 95,
    status: 'won',
    interactions_count: 8,
    estimated_value: 12000,
    tags: ['imobiliaria', 'cliente_convertido'],
    created_at: '2024-11-15'
  },
];

const mockCampaigns: Campaign[] = [
  {
    id: 'c1',
    name: 'E-commerces SP',
    target_segment: 'ecommerce',
    status: 'active',
    leads_found: 45,
    leads_contacted: 32,
    meetings_scheduled: 8,
    deals_won: 3
  },
  {
    id: 'c2',
    name: 'Clínicas e Consultórios',
    target_segment: 'clinica',
    status: 'active',
    leads_found: 28,
    leads_contacted: 20,
    meetings_scheduled: 5,
    deals_won: 2
  },
  {
    id: 'c3',
    name: 'Restaurantes RJ',
    target_segment: 'restaurante',
    status: 'paused',
    leads_found: 15,
    leads_contacted: 10,
    meetings_scheduled: 2,
    deals_won: 0
  },
];

const segments = [
  { id: 'ecommerce', label: 'E-commerce', icon: '🛒' },
  { id: 'restaurante', label: 'Restaurantes', icon: '🍽️' },
  { id: 'clinica', label: 'Clínicas', icon: '🏥' },
  { id: 'imobiliaria', label: 'Imobiliárias', icon: '🏠' },
  { id: 'franquia', label: 'Franquias', icon: '🏢' },
  { id: 'fitness', label: 'Fitness', icon: '💪' },
];

// =====================================================
// COMPONENTES
// =====================================================

function LeadCard({ lead, onContact, onView }: { lead: Lead; onContact: () => void; onView: () => void }) {
  const statusConfig = {
    new: { color: 'bg-gray-100 text-gray-700', label: 'Novo' },
    contacted: { color: 'bg-blue-100 text-blue-700', label: 'Contatado' },
    responding: { color: 'bg-yellow-100 text-yellow-700', label: 'Respondendo' },
    meeting_scheduled: { color: 'bg-purple-100 text-purple-700', label: 'Reunião Agendada' },
    negotiating: { color: 'bg-orange-100 text-orange-700', label: 'Negociando' },
    won: { color: 'bg-green-100 text-green-700', label: 'Convertido' },
    lost: { color: 'bg-red-100 text-red-700', label: 'Perdido' }
  }[lead.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border p-4 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg",
            lead.qualification_score >= 80 ? "bg-green-100 text-green-700" :
            lead.qualification_score >= 60 ? "bg-yellow-100 text-yellow-700" :
            "bg-red-100 text-red-700"
          )}>
            {lead.qualification_score}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{lead.company_name}</h3>
            <p className="text-xs text-gray-500">{lead.company_industry} • {lead.company_size}</p>
          </div>
        </div>
        <span className={cn("px-2 py-1 rounded-full text-xs font-medium", statusConfig.color)}>
          {statusConfig.label}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        {lead.contact_name && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4 text-gray-400" />
            {lead.contact_name} {lead.contact_role && `• ${lead.contact_role}`}
          </div>
        )}
        {lead.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400" />
            {lead.location.city}, {lead.location.state}
          </div>
        )}
        {lead.estimated_value && (
          <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
            <TrendingUp className="w-4 h-4" />
            R$ {lead.estimated_value.toLocaleString('pt-BR')}/mês estimado
          </div>
        )}
      </div>

      {lead.next_action && (
        <div className="p-2 bg-gray-50 rounded-lg mb-3">
          <p className="text-xs text-gray-500">Próxima ação:</p>
          <p className="text-sm font-medium text-gray-700">{lead.next_action}</p>
          {lead.next_action_date && (
            <p className="text-xs text-gray-400 mt-1">
              <Calendar className="w-3 h-3 inline mr-1" />
              {new Date(lead.next_action_date).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 pt-3 border-t">
        {lead.contact_email && (
          <button 
            onClick={onContact}
            className="flex-1 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1"
          >
            <Mail className="w-4 h-4" />
            Contatar
          </button>
        )}
        <button 
          onClick={onView}
          className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
        >
          <Eye className="w-4 h-4" />
          Detalhes
        </button>
      </div>
    </motion.div>
  );
}

function CampaignCard({ campaign, onToggle, onEdit }: { campaign: Campaign; onToggle: () => void; onEdit: () => void }) {
  const conversionRate = campaign.leads_contacted > 0 
    ? ((campaign.deals_won / campaign.leads_contacted) * 100).toFixed(1)
    : '0';

  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
          <p className="text-xs text-gray-500">{campaign.target_segment}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            className={cn(
              "p-2 rounded-lg transition-colors",
              campaign.status === 'active' ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
            )}
          >
            {campaign.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button onClick={onEdit} className="p-2 hover:bg-gray-100 rounded-lg">
            <Settings className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="p-2 bg-gray-50 rounded-lg">
          <p className="text-lg font-bold text-gray-900">{campaign.leads_found}</p>
          <p className="text-xs text-gray-500">Encontrados</p>
        </div>
        <div className="p-2 bg-blue-50 rounded-lg">
          <p className="text-lg font-bold text-blue-600">{campaign.leads_contacted}</p>
          <p className="text-xs text-gray-500">Contatados</p>
        </div>
        <div className="p-2 bg-purple-50 rounded-lg">
          <p className="text-lg font-bold text-purple-600">{campaign.meetings_scheduled}</p>
          <p className="text-xs text-gray-500">Reuniões</p>
        </div>
        <div className="p-2 bg-green-50 rounded-lg">
          <p className="text-lg font-bold text-green-600">{campaign.deals_won}</p>
          <p className="text-xs text-gray-500">Convertidos</p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t flex items-center justify-between">
        <span className="text-sm text-gray-500">Taxa de conversão</span>
        <span className="font-bold text-green-600">{conversionRate}%</span>
      </div>
    </div>
  );
}

function FunnelChart({ leads }: { leads: Lead[] }) {
  const stages = [
    { key: 'new', label: 'Novos', color: 'bg-gray-400' },
    { key: 'contacted', label: 'Contatados', color: 'bg-blue-500' },
    { key: 'responding', label: 'Respondendo', color: 'bg-yellow-500' },
    { key: 'meeting_scheduled', label: 'Reunião', color: 'bg-purple-500' },
    { key: 'negotiating', label: 'Negociando', color: 'bg-orange-500' },
    { key: 'won', label: 'Convertidos', color: 'bg-green-500' },
  ];

  const counts = stages.map(s => ({
    ...s,
    count: leads.filter(l => l.status === s.key).length
  }));

  const maxCount = Math.max(...counts.map(c => c.count), 1);

  return (
    <div className="space-y-2">
      {counts.map((stage, idx) => (
        <div key={stage.key} className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-20">{stage.label}</span>
          <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(stage.count / maxCount) * 100}%` }}
              className={cn("h-full flex items-center justify-end pr-2", stage.color)}
            >
              <span className="text-xs font-bold text-white">{stage.count}</span>
            </motion.div>
          </div>
        </div>
      ))}
    </div>
  );
}

// =====================================================
// PÁGINA PRINCIPAL
// =====================================================

export default function ProspeccaoPage() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isSearching, setIsSearching] = useState(false);
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);

  const filteredLeads = leads.filter(lead => {
    if (selectedSegment !== 'all' && lead.segment !== selectedSegment) return false;
    if (selectedStatus !== 'all' && lead.status !== selectedStatus) return false;
    return true;
  });

  const stats = {
    totalLeads: leads.length,
    newLeads: leads.filter(l => l.status === 'new').length,
    meetings: leads.filter(l => l.status === 'meeting_scheduled').length,
    converted: leads.filter(l => l.status === 'won').length,
    totalValue: leads.filter(l => l.status === 'won').reduce((a, b) => a + (b.estimated_value || 0), 0),
    avgScore: Math.round(leads.reduce((a, b) => a + b.qualification_score, 0) / leads.length)
  };

  const handleSearchLeads = async () => {
    setIsSearching(true);
    toast.loading('Buscando leads com IA...');
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Simular novos leads encontrados
    const newLeads: Lead[] = [
      {
        id: `l${Date.now()}`,
        company_name: 'Nova Empresa Encontrada',
        company_industry: 'Tecnologia',
        company_size: 'small',
        location: { city: 'São Paulo', state: 'SP' },
        source: 'tavily',
        segment: selectedSegment === 'all' ? 'ecommerce' : selectedSegment,
        qualification_score: Math.floor(Math.random() * 30) + 60,
        status: 'new',
        interactions_count: 0,
        estimated_value: Math.floor(Math.random() * 5000) + 2000,
        tags: [],
        created_at: new Date().toISOString()
      }
    ];
    
    setLeads(prev => [...newLeads, ...prev]);
    toast.dismiss();
    toast.success(`${newLeads.length} novo(s) lead(s) encontrado(s)!`);
    setIsSearching(false);
  };

  const handleContactLead = (leadId: string) => {
    toast.success('Iniciando sequência de contato...');
    setLeads(prev => prev.map(l => 
      l.id === leadId ? { ...l, status: 'contacted' as const, interactions_count: l.interactions_count + 1 } : l
    ));
  };

  const handleViewLead = (leadId: string) => {
    toast.info('Abrindo detalhes do lead...');
  };

  const handleToggleCampaign = (campaignId: string) => {
    setCampaigns(prev => prev.map(c => 
      c.id === campaignId 
        ? { ...c, status: c.status === 'active' ? 'paused' : 'active' as any }
        : c
    ));
    toast.success('Status da campanha atualizado');
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Target className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Central de Prospecção</h1>
              <p className="text-sm text-gray-500">Captação automatizada de leads com IA</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNewCampaignModal(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nova Campanha
            </button>
            <button
              onClick={handleSearchLeads}
              disabled={isSearching}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Brain className={cn("w-4 h-4", isSearching && "animate-pulse")} />
              Buscar Leads
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-5 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-5 rounded-xl shadow-sm border"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Total Leads</span>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalLeads}</p>
            <p className="text-xs text-green-600 mt-1">+12 esta semana</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-5 rounded-xl shadow-sm border"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Novos</span>
              <Zap className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-yellow-600">{stats.newLeads}</p>
            <p className="text-xs text-gray-500 mt-1">aguardando contato</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-5 rounded-xl shadow-sm border"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Reuniões</span>
              <Calendar className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-purple-600">{stats.meetings}</p>
            <p className="text-xs text-gray-500 mt-1">agendadas</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-5 rounded-xl shadow-sm border"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Convertidos</span>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.converted}</p>
            <p className="text-xs text-gray-500 mt-1">este mês</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-5 rounded-xl shadow-sm border"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Receita Gerada</span>
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-emerald-600">R$ {stats.totalValue.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-gray-500 mt-1">/mês</p>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-3 gap-6">
          
          {/* Leads List */}
          <div className="col-span-2 space-y-4">
            {/* Filters */}
            <div className="bg-white rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">Segmento:</span>
                  <select
                    value={selectedSegment}
                    onChange={e => setSelectedSegment(e.target.value)}
                    className="text-sm border-none bg-transparent font-medium text-gray-700 focus:ring-0"
                  >
                    <option value="all">Todos</option>
                    {segments.map(s => (
                      <option key={s.id} value={s.id}>{s.icon} {s.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Status:</span>
                  <select
                    value={selectedStatus}
                    onChange={e => setSelectedStatus(e.target.value)}
                    className="text-sm border-none bg-transparent font-medium text-gray-700 focus:ring-0"
                  >
                    <option value="all">Todos</option>
                    <option value="new">Novos</option>
                    <option value="contacted">Contatados</option>
                    <option value="meeting_scheduled">Com Reunião</option>
                    <option value="negotiating">Negociando</option>
                    <option value="won">Convertidos</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Leads Grid */}
            <div className="grid grid-cols-2 gap-4">
              {filteredLeads.map(lead => (
                <LeadCard 
                  key={lead.id} 
                  lead={lead}
                  onContact={() => handleContactLead(lead.id)}
                  onView={() => handleViewLead(lead.id)}
                />
              ))}
            </div>

            {filteredLeads.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Nenhum lead encontrado</p>
                <button 
                  onClick={handleSearchLeads}
                  className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg text-sm"
                >
                  Buscar Leads
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Funnel */}
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                Funil de Conversão
              </h2>
              <FunnelChart leads={leads} />
            </div>

            {/* Active Campaigns */}
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-500" />
                  Campanhas Ativas
                </h2>
                <button className="text-xs text-indigo-600 hover:underline">Ver todas</button>
              </div>

              <div className="space-y-4">
                {campaigns.filter(c => c.status === 'active').map(campaign => (
                  <CampaignCard 
                    key={campaign.id} 
                    campaign={campaign}
                    onToggle={() => handleToggleCampaign(campaign.id)}
                    onEdit={() => toast.info('Editando campanha...')}
                  />
                ))}
              </div>
            </div>

            {/* Val Insights */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-bold">Insight da Val</h3>
              </div>
              <p className="text-sm text-white/90 leading-relaxed">
                O segmento de <strong>clínicas</strong> está com a maior taxa de conversão (25%)! 
                Recomendo intensificar a busca nesse segmento. 
                Leads com score acima de 80 têm 3x mais chance de fechar.
              </p>
              <button className="mt-4 w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
                Ver Análise Completa
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

