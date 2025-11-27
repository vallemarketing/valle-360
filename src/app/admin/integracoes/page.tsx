'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plug, Check, X, Settings, ExternalLink, RefreshCw,
  CreditCard, MessageSquare, Mail, Calendar, BarChart3,
  Globe, Zap, Shield, AlertTriangle, ChevronRight
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  category: 'payment' | 'communication' | 'marketing' | 'productivity' | 'ai';
  connected: boolean;
  lastSync?: Date;
  status?: 'active' | 'error' | 'pending';
}

const INTEGRATIONS: Integration[] = [
  // Pagamentos
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Pagamentos, assinaturas e faturas',
    icon: <CreditCard className="w-6 h-6" />,
    color: '#635BFF',
    category: 'payment',
    connected: false
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Pagamentos alternativos',
    icon: <CreditCard className="w-6 h-6" />,
    color: '#003087',
    category: 'payment',
    connected: false
  },
  // Comunicação
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Mensagens automáticas para clientes',
    icon: <MessageSquare className="w-6 h-6" />,
    color: '#25D366',
    category: 'communication',
    connected: true,
    lastSync: new Date(),
    status: 'active'
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    description: 'Envio de emails transacionais',
    icon: <Mail className="w-6 h-6" />,
    color: '#1A82E2',
    category: 'communication',
    connected: true,
    lastSync: new Date(),
    status: 'active'
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Notificações para equipe',
    icon: <MessageSquare className="w-6 h-6" />,
    color: '#4A154B',
    category: 'communication',
    connected: false
  },
  // Marketing
  {
    id: 'google_ads',
    name: 'Google Ads',
    description: 'Importar métricas de campanhas',
    icon: <BarChart3 className="w-6 h-6" />,
    color: '#4285F4',
    category: 'marketing',
    connected: true,
    lastSync: new Date(Date.now() - 3600000),
    status: 'active'
  },
  {
    id: 'meta_ads',
    name: 'Meta Ads',
    description: 'Facebook e Instagram Ads',
    icon: <Globe className="w-6 h-6" />,
    color: '#1877F2',
    category: 'marketing',
    connected: true,
    lastSync: new Date(Date.now() - 7200000),
    status: 'active'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Publicar vagas e posts',
    icon: <Globe className="w-6 h-6" />,
    color: '#0A66C2',
    category: 'marketing',
    connected: false
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Agendar posts de clientes',
    icon: <Globe className="w-6 h-6" />,
    color: '#E4405F',
    category: 'marketing',
    connected: false
  },
  // Produtividade
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    description: 'Sincronizar reuniões',
    icon: <Calendar className="w-6 h-6" />,
    color: '#4285F4',
    category: 'productivity',
    connected: false
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Automações customizadas',
    icon: <Zap className="w-6 h-6" />,
    color: '#FF4A00',
    category: 'productivity',
    connected: false
  },
  // IA
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Val IA e geração de textos',
    icon: <Zap className="w-6 h-6" />,
    color: '#10A37F',
    category: 'ai',
    connected: true,
    lastSync: new Date(),
    status: 'active'
  }
];

const CATEGORIES = [
  { id: 'all', label: 'Todas' },
  { id: 'payment', label: 'Pagamentos' },
  { id: 'communication', label: 'Comunicação' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'productivity', label: 'Produtividade' },
  { id: 'ai', label: 'Inteligência Artificial' }
];

export default function IntegracoesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  const filteredIntegrations = INTEGRATIONS.filter(integration => {
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const connectedCount = INTEGRATIONS.filter(i => i.connected).length;

  const handleConnect = (integration: Integration) => {
    // TODO: Implement OAuth flow or API key configuration
    setSelectedIntegration(integration);
  };

  const handleDisconnect = (integration: Integration) => {
    // TODO: Implement disconnect
    console.log('Disconnecting:', integration.name);
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: 'var(--primary-100)' }}
            >
              <Plug className="w-7 h-7" style={{ color: 'var(--primary-500)' }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Integrações
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                {connectedCount} de {INTEGRATIONS.length} conectadas
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar integração..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 px-4 py-2 pl-10 rounded-xl border"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--border-light)',
                color: 'var(--text-primary)'
              }}
            />
            <Globe 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
              style={{ color: 'var(--text-tertiary)' }}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{
                backgroundColor: selectedCategory === category.id 
                  ? 'var(--primary-500)' 
                  : 'var(--bg-primary)',
                color: selectedCategory === category.id 
                  ? 'white' 
                  : 'var(--text-secondary)',
                border: `1px solid ${selectedCategory === category.id ? 'var(--primary-500)' : 'var(--border-light)'}`
              }}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIntegrations.map((integration, index) => (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-xl p-5 border transition-all hover:shadow-lg"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: integration.connected 
                  ? `${integration.color}50` 
                  : 'var(--border-light)'
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ 
                      backgroundColor: `${integration.color}20`,
                      color: integration.color
                    }}
                  >
                    {integration.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {integration.name}
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {integration.description}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                {integration.connected && (
                  <div 
                    className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: integration.status === 'active' 
                        ? 'var(--success-100)' 
                        : integration.status === 'error'
                          ? 'var(--error-100)'
                          : 'var(--warning-100)',
                      color: integration.status === 'active' 
                        ? 'var(--success-700)' 
                        : integration.status === 'error'
                          ? 'var(--error-700)'
                          : 'var(--warning-700)'
                    }}
                  >
                    {integration.status === 'active' && <Check className="w-3 h-3" />}
                    {integration.status === 'error' && <AlertTriangle className="w-3 h-3" />}
                    {integration.status === 'active' ? 'Ativo' : integration.status === 'error' ? 'Erro' : 'Pendente'}
                  </div>
                )}
              </div>

              {/* Last Sync */}
              {integration.connected && integration.lastSync && (
                <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>
                  Último sync: {integration.lastSync.toLocaleString('pt-BR')}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                {integration.connected ? (
                  <>
                    <button
                      onClick={() => handleConnect(integration)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <Settings className="w-4 h-4" />
                      Configurar
                    </button>
                    <button
                      onClick={() => handleDisconnect(integration)}
                      className="p-2 rounded-lg transition-colors"
                      style={{
                        backgroundColor: 'var(--error-100)',
                        color: 'var(--error-600)'
                      }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleConnect(integration)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-white"
                    style={{ backgroundColor: integration.color }}
                  >
                    <Plug className="w-4 h-4" />
                    Conectar
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredIntegrations.length === 0 && (
          <div className="text-center py-12">
            <Globe 
              className="w-16 h-16 mx-auto mb-4 opacity-20"
              style={{ color: 'var(--text-tertiary)' }}
            />
            <p style={{ color: 'var(--text-secondary)' }}>
              Nenhuma integração encontrada
            </p>
          </div>
        )}

        {/* Configuration Modal */}
        <AnimatePresence>
          {selectedIntegration && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedIntegration(null)}
                className="fixed inset-0 bg-black/50 z-50"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 rounded-2xl shadow-2xl z-50"
                style={{ backgroundColor: 'var(--bg-primary)' }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ 
                      backgroundColor: `${selectedIntegration.color}20`,
                      color: selectedIntegration.color
                    }}
                  >
                    {selectedIntegration.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                      {selectedIntegration.connected ? 'Configurar' : 'Conectar'} {selectedIntegration.name}
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {selectedIntegration.description}
                    </p>
                  </div>
                </div>

                {/* Configuration Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                      API Key
                    </label>
                    <input
                      type="password"
                      placeholder="sk_live_..."
                      className="w-full px-4 py-2 rounded-lg border"
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: 'var(--border-light)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>

                  {selectedIntegration.id === 'whatsapp' && (
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                        Phone Number ID
                      </label>
                      <input
                        type="text"
                        placeholder="1234567890"
                        className="w-full px-4 py-2 rounded-lg border"
                        style={{
                          backgroundColor: 'var(--bg-secondary)',
                          borderColor: 'var(--border-light)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: 'var(--info-100)' }}>
                    <Shield className="w-5 h-5" style={{ color: 'var(--info-600)' }} />
                    <p className="text-xs" style={{ color: 'var(--info-700)' }}>
                      Suas credenciais são criptografadas e armazenadas com segurança.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 mt-6">
                  <button
                    onClick={() => setSelectedIntegration(null)}
                    className="flex-1 px-4 py-2 rounded-lg font-medium transition-colors"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      // TODO: Save configuration
                      setSelectedIntegration(null);
                    }}
                    className="flex-1 px-4 py-2 rounded-lg font-medium text-white transition-colors"
                    style={{ backgroundColor: selectedIntegration.color }}
                  >
                    {selectedIntegration.connected ? 'Salvar' : 'Conectar'}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
