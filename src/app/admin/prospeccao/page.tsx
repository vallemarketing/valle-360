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
  Play, Pause, Settings, Download, Sparkles, X, Copy,
  DollarSign, Briefcase, Hash, FileText, Lightbulb,
  TrendingDown, ThumbsUp, AlertTriangle, ChevronDown, PhoneCall
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  target_region?: string;
  target_company_size?: string;
  target_industry?: string;
  budget_estimate?: string;
  approach_method?: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  leads_found: number;
  leads_contacted: number;
  meetings_scheduled: number;
  deals_won: number;
  created_at: string;
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
    target_region: 'São Paulo',
    target_company_size: 'medium',
    target_industry: 'Varejo Online',
    approach_method: 'benefits',
    status: 'active',
    leads_found: 45,
    leads_contacted: 32,
    meetings_scheduled: 8,
    deals_won: 3,
    created_at: '2024-11-01'
  },
  {
    id: 'c2',
    name: 'Clínicas e Consultórios',
    target_segment: 'clinica',
    target_region: 'Nacional',
    target_company_size: 'medium',
    target_industry: 'Saúde',
    approach_method: 'data',
    status: 'active',
    leads_found: 28,
    leads_contacted: 20,
    meetings_scheduled: 5,
    deals_won: 2,
    created_at: '2024-11-10'
  },
  {
    id: 'c3',
    name: 'Restaurantes RJ',
    target_segment: 'restaurante',
    target_region: 'Rio de Janeiro',
    target_company_size: 'small',
    approach_method: 'pnl',
    status: 'paused',
    leads_found: 15,
    leads_contacted: 10,
    meetings_scheduled: 2,
    deals_won: 0,
    created_at: '2024-11-15'
  },
];

const segments = [
  { id: 'ecommerce', label: 'E-commerce', icon: '🛒' },
  { id: 'restaurante', label: 'Restaurantes', icon: '🍽️' },
  { id: 'clinica', label: 'Clínicas', icon: '🏥' },
  { id: 'imobiliaria', label: 'Imobiliárias', icon: '🏠' },
  { id: 'franquia', label: 'Franquias', icon: '🏢' },
  { id: 'fitness', label: 'Fitness', icon: '💪' },
  { id: 'educacao', label: 'Educação', icon: '📚' },
  { id: 'servicos', label: 'Serviços', icon: '🔧' },
];

const approachMethods = [
  { id: 'numbers', label: 'Foco em Números', icon: '📊', description: 'ROI, métricas, dados concretos' },
  { id: 'benefits', label: 'Foco em Benefícios', icon: '✨', description: 'Vantagens e diferenciais' },
  { id: 'reduction', label: 'Redução de Custos', icon: '💰', description: 'Economia e eficiência' },
  { id: 'data', label: 'Dados Reais', icon: '📈', description: 'Cases e resultados comprovados' },
  { id: 'pnl', label: 'PNL/Neurociência', icon: '🧠', description: 'Gatilhos mentais e persuasão' },
  { id: 'objection', label: 'Quebra de Objeção', icon: '🎯', description: 'Antecipa e resolve dúvidas' },
];

const regions = [
  { id: 'sp', label: 'São Paulo' },
  { id: 'rj', label: 'Rio de Janeiro' },
  { id: 'mg', label: 'Minas Gerais' },
  { id: 'rs', label: 'Rio Grande do Sul' },
  { id: 'pr', label: 'Paraná' },
  { id: 'nacional', label: 'Nacional' },
];

const companySizes = [
  { id: 'micro', label: 'Micro (1-9)' },
  { id: 'small', label: 'Pequena (10-49)' },
  { id: 'medium', label: 'Média (50-249)' },
  { id: 'large', label: 'Grande (250+)' },
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
        <button 
          onClick={onContact}
          className="flex-1 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1"
        >
          <Mail className="w-4 h-4" />
          Contatar
        </button>
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

  const methodConfig = approachMethods.find(m => m.id === campaign.approach_method);

  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-gray-500">{campaign.target_segment}</p>
            {methodConfig && (
              <Badge variant="outline" className="text-[10px]">
                {methodConfig.icon} {methodConfig.label}
              </Badge>
            )}
          </div>
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
  
  // Modais
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [showLeadDetailModal, setShowLeadDetailModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  // Formulário de nova campanha
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    target_segment: '',
    target_region: '',
    target_company_size: '',
    target_industry: '',
    budget_estimate: '',
    approach_method: '',
    keywords: '',
  });

  // Contato
  const [contactScript, setContactScript] = useState('');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

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

  // Evolução por segmento
  const segmentEvolution = segments.map(seg => {
    const segLeads = leads.filter(l => l.segment === seg.id);
    const won = segLeads.filter(l => l.status === 'won').length;
    const total = segLeads.length;
    const conversionRate = total > 0 ? (won / total) * 100 : 0;
    return {
      ...seg,
      total,
      won,
      conversionRate: conversionRate.toFixed(1)
    };
  }).filter(s => s.total > 0);

  const handleSearchLeads = async () => {
    setIsSearching(true);
    toast.loading('Buscando leads com IA...');
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
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

  const handleCreateCampaign = () => {
    if (!campaignForm.name || !campaignForm.target_segment) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    const newCampaign: Campaign = {
      id: `c${Date.now()}`,
      name: campaignForm.name,
      target_segment: campaignForm.target_segment,
      target_region: campaignForm.target_region,
      target_company_size: campaignForm.target_company_size,
      target_industry: campaignForm.target_industry,
      budget_estimate: campaignForm.budget_estimate,
      approach_method: campaignForm.approach_method,
      status: 'active',
      leads_found: 0,
      leads_contacted: 0,
      meetings_scheduled: 0,
      deals_won: 0,
      created_at: new Date().toISOString()
    };

    setCampaigns(prev => [newCampaign, ...prev]);
    setShowNewCampaignModal(false);
    setCampaignForm({
      name: '', target_segment: '', target_region: '', target_company_size: '',
      target_industry: '', budget_estimate: '', approach_method: '', keywords: ''
    });
    toast.success('Campanha criada com sucesso!');
  };

  const handleViewLead = (lead: Lead) => {
    setSelectedLead(lead);
    setShowLeadDetailModal(true);
  };

  const handleContactLead = async (lead: Lead) => {
    setSelectedLead(lead);
    setShowContactModal(true);
    setIsGeneratingScript(true);
    
    // Simular geração de script
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const scripts = {
      numbers: `Olá ${lead.contact_name || 'Prezado(a)'}!

Analisei o perfil da ${lead.company_name} e identifiquei um potencial de crescimento de até 40% no faturamento digital.

Empresas similares do segmento ${lead.company_industry} que trabalhamos alcançaram:
• ROI médio de 340%
• Aumento de 52% em leads qualificados
• Redução de 35% no custo de aquisição

Podemos agendar 15 minutos para mostrar esses números na prática?`,
      
      benefits: `Olá ${lead.contact_name || 'Prezado(a)'}!

A ${lead.company_name} pode estar perdendo oportunidades valiosas no digital!

Imagine poder:
✨ Atrair clientes qualificados automaticamente
✨ Ter presença profissional nas redes sociais
✨ Converter mais visitantes em vendas
✨ Acompanhar resultados em tempo real

Posso mostrar como fazemos isso em uma conversa rápida?`,

      pnl: `Olá ${lead.contact_name || 'Prezado(a)'}!

Você sabia que 78% dos seus potenciais clientes pesquisam online antes de comprar?

A grande questão é: o que eles encontram sobre a ${lead.company_name}?

Empresas que dominam o digital não só vendem mais - elas se tornam referência no mercado.

A pergunta não é SE você precisa de marketing digital, mas QUANDO vai começar a colher os resultados.

Que tal conversarmos sobre isso?`
    };

    setContactScript(scripts.benefits);
    setIsGeneratingScript(false);
  };

  const handleSendContact = () => {
    if (!selectedLead) return;
    
    setLeads(prev => prev.map(l => 
      l.id === selectedLead.id 
        ? { ...l, status: 'contacted' as const, interactions_count: l.interactions_count + 1 }
        : l
    ));
    
    setShowContactModal(false);
    toast.success('Mensagem enviada com sucesso!');
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
            <Button
              variant="outline"
              onClick={() => setShowNewCampaignModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Campanha
            </Button>
            <Button
              onClick={handleSearchLeads}
              disabled={isSearching}
              className="bg-green-600 hover:bg-green-700"
            >
              <Brain className={cn("w-4 h-4 mr-2", isSearching && "animate-pulse")} />
              Buscar Leads
            </Button>
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

        {/* Evolução por Segmento */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-500" />
            Evolução por Segmento
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {segmentEvolution.map((seg) => (
              <div key={seg.id} className="p-4 rounded-xl border bg-gradient-to-br from-gray-50 to-white">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{seg.icon}</span>
                  <span className="font-medium text-gray-900">{seg.label}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Leads</span>
                    <span className="font-bold">{seg.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Convertidos</span>
                    <span className="font-bold text-green-600">{seg.won}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Taxa de Conversão</span>
                    <span className="font-bold text-indigo-600">{seg.conversionRate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                  onContact={() => handleContactLead(lead)}
                  onView={() => handleViewLead(lead)}
                />
              ))}
            </div>

            {filteredLeads.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Nenhum lead encontrado</p>
                <Button 
                  onClick={handleSearchLeads}
                  className="mt-4 bg-green-600 hover:bg-green-700"
                >
                  Buscar Leads
                </Button>
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
                <button 
                  onClick={() => setShowNewCampaignModal(true)}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  + Nova
                </button>
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

      {/* Modal Nova Campanha */}
      <AnimatePresence>
        {showNewCampaignModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowNewCampaignModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-green-100">
                      <Target className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Nova Campanha de Prospecção</h2>
                      <p className="text-sm text-gray-500">Configure os parâmetros de busca de leads</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowNewCampaignModal(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="p-6 overflow-auto max-h-[60vh] space-y-6">
                {/* Nome da Campanha */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Nome da Campanha *
                  </label>
                  <input
                    type="text"
                    value={campaignForm.name}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: E-commerces de Moda SP"
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                {/* Segmento */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Segmento Alvo *
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {segments.map((seg) => (
                      <button
                        key={seg.id}
                        onClick={() => setCampaignForm(prev => ({ ...prev, target_segment: seg.id }))}
                        className={cn(
                          "p-3 rounded-xl border text-center transition-all",
                          campaignForm.target_segment === seg.id
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <span className="text-2xl block mb-1">{seg.icon}</span>
                        <span className="text-xs font-medium">{seg.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Região e Tamanho */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Região
                    </label>
                    <select
                      value={campaignForm.target_region}
                      onChange={(e) => setCampaignForm(prev => ({ ...prev, target_region: e.target.value }))}
                      className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Selecione...</option>
                      {regions.map((r) => (
                        <option key={r.id} value={r.id}>{r.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Tamanho da Empresa
                    </label>
                    <select
                      value={campaignForm.target_company_size}
                      onChange={(e) => setCampaignForm(prev => ({ ...prev, target_company_size: e.target.value }))}
                      className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Selecione...</option>
                      {companySizes.map((s) => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Indústria e Budget */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Indústria/Nicho
                    </label>
                    <input
                      type="text"
                      value={campaignForm.target_industry}
                      onChange={(e) => setCampaignForm(prev => ({ ...prev, target_industry: e.target.value }))}
                      placeholder="Ex: Moda Feminina, Gastronomia..."
                      className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Budget Estimado do Cliente
                    </label>
                    <select
                      value={campaignForm.budget_estimate}
                      onChange={(e) => setCampaignForm(prev => ({ ...prev, budget_estimate: e.target.value }))}
                      className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Selecione...</option>
                      <option value="1000-3000">R$ 1.000 - 3.000/mês</option>
                      <option value="3000-5000">R$ 3.000 - 5.000/mês</option>
                      <option value="5000-10000">R$ 5.000 - 10.000/mês</option>
                      <option value="10000+">R$ 10.000+/mês</option>
                    </select>
                  </div>
                </div>

                {/* Método de Abordagem */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Método de Abordagem
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {approachMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setCampaignForm(prev => ({ ...prev, approach_method: method.id }))}
                        className={cn(
                          "p-3 rounded-xl border text-left transition-all",
                          campaignForm.approach_method === method.id
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <span className="text-xl block mb-1">{method.icon}</span>
                        <span className="text-sm font-medium block">{method.label}</span>
                        <span className="text-xs text-gray-500">{method.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Palavras-chave */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Palavras-chave para Busca (opcional)
                  </label>
                  <textarea
                    value={campaignForm.keywords}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, keywords: e.target.value }))}
                    placeholder="Digite palavras-chave separadas por vírgula..."
                    rows={2}
                    className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowNewCampaignModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={handleCreateCampaign}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Criar Campanha
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Detalhes do Lead */}
      <AnimatePresence>
        {showLeadDetailModal && selectedLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowLeadDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl",
                      selectedLead.qualification_score >= 80 ? "bg-green-100 text-green-700" :
                      selectedLead.qualification_score >= 60 ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    )}>
                      {selectedLead.qualification_score}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedLead.company_name}</h2>
                      <p className="text-sm text-gray-500">{selectedLead.company_industry}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowLeadDetailModal(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Contato */}
                <div className="p-4 rounded-xl bg-gray-50 space-y-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Contato Principal
                  </h3>
                  {selectedLead.contact_name && (
                    <p className="text-gray-700">{selectedLead.contact_name} - {selectedLead.contact_role}</p>
                  )}
                  {selectedLead.contact_email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      {selectedLead.contact_email}
                    </div>
                  )}
                  {selectedLead.contact_phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      {selectedLead.contact_phone}
                    </div>
                  )}
                  {selectedLead.contact_linkedin && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Linkedin className="w-4 h-4" />
                      {selectedLead.contact_linkedin}
                    </div>
                  )}
                </div>

                {/* Empresa */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-gray-50">
                    <span className="text-xs text-gray-500">Localização</span>
                    <p className="font-medium">{selectedLead.location?.city}, {selectedLead.location?.state}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50">
                    <span className="text-xs text-gray-500">Tamanho</span>
                    <p className="font-medium capitalize">{selectedLead.company_size}</p>
                  </div>
                </div>

                {/* Valor Estimado */}
                {selectedLead.estimated_value && (
                  <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-700">Valor Mensal Estimado</span>
                      <span className="text-xl font-bold text-green-600">
                        R$ {selectedLead.estimated_value.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {selectedLead.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedLead.tags.map((tag, idx) => (
                      <Badge key={idx} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowLeadDetailModal(false)}
                >
                  Fechar
                </Button>
                <Button
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => {
                    setShowLeadDetailModal(false);
                    handleContactLead(selectedLead);
                  }}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contatar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Contatar Lead */}
      <AnimatePresence>
        {showContactModal && selectedLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowContactModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-indigo-100">
                      <MessageSquare className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Contatar Lead</h2>
                      <p className="text-sm text-gray-500">{selectedLead.company_name}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowContactModal(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="p-6">
                {isGeneratingScript ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
                    <p className="text-gray-600">Gerando script de abordagem...</p>
                    <p className="text-sm text-gray-400 mt-1">Analisando perfil do lead com IA</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Método de Abordagem */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Método de Abordagem
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {approachMethods.slice(0, 3).map((method) => (
                          <button
                            key={method.id}
                            className="p-2 rounded-lg border border-gray-200 hover:border-indigo-500 transition-all text-center"
                          >
                            <span className="text-lg">{method.icon}</span>
                            <span className="text-xs block">{method.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Script */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700">
                          Script Gerado pela IA
                        </label>
                        <Badge className="bg-indigo-100 text-indigo-700">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Personalizado
                        </Badge>
                      </div>
                      <textarea
                        value={contactScript}
                        onChange={(e) => setContactScript(e.target.value)}
                        rows={8}
                        className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                    </div>

                    {/* Canal de Contato */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Canal de Contato
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        <button className="p-3 rounded-lg border border-indigo-500 bg-indigo-50 text-indigo-700 flex flex-col items-center">
                          <Mail className="w-5 h-5 mb-1" />
                          <span className="text-xs">Email</span>
                        </button>
                        <button className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 flex flex-col items-center">
                          <MessageSquare className="w-5 h-5 mb-1 text-green-600" />
                          <span className="text-xs">WhatsApp</span>
                        </button>
                        <button className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 flex flex-col items-center">
                          <Linkedin className="w-5 h-5 mb-1 text-blue-600" />
                          <span className="text-xs">LinkedIn</span>
                        </button>
                        <button className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 flex flex-col items-center">
                          <PhoneCall className="w-5 h-5 mb-1 text-purple-600" />
                          <span className="text-xs">Ligar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {!isGeneratingScript && (
                <div className="p-6 border-t border-gray-200 flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      navigator.clipboard.writeText(contactScript);
                      toast.success('Script copiado!');
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar
                  </Button>
                  <Button
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    onClick={handleSendContact}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Contato
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
