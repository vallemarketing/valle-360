'use client';

/**
 * Valle 360 - Central de APIs
 * Gerenciamento de API Keys, documentação e logs
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  RefreshCw,
  Shield,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  ExternalLink,
  Search,
  Filter,
  Code,
  Webhook,
  Zap,
  X,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// =====================================================
// TIPOS
// =====================================================

interface APIKey {
  id: string;
  name: string;
  key: string;
  prefix: string;
  createdAt: string;
  lastUsed?: string;
  expiresAt?: string;
  permissions: string[];
  status: 'active' | 'expired' | 'revoked';
  usageCount: number;
  rateLimit: number;
}

interface APILog {
  id: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  status: number;
  duration: number;
  timestamp: string;
  apiKeyName: string;
  ip?: string;
}

interface APIEndpoint {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  description: string;
  auth: boolean;
  rateLimit: string;
}

// =====================================================
// MOCK DATA
// =====================================================

const mockAPIKeys: APIKey[] = [
  {
    id: 'key_1',
    name: 'Produção - Website',
    key: 'valle_live_sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    prefix: 'valle_live_sk',
    createdAt: '2024-10-15',
    lastUsed: '2024-12-05T11:30:00Z',
    permissions: ['read:clients', 'read:metrics', 'write:webhooks'],
    status: 'active',
    usageCount: 15420,
    rateLimit: 1000
  },
  {
    id: 'key_2',
    name: 'Integração N8N',
    key: 'valle_live_sk_yyyyyyyyyyyyyyyyyyyyyyyyyyyy',
    prefix: 'valle_live_sk',
    createdAt: '2024-11-20',
    lastUsed: '2024-12-05T10:15:00Z',
    permissions: ['read:all', 'write:all'],
    status: 'active',
    usageCount: 8750,
    rateLimit: 5000
  },
  {
    id: 'key_3',
    name: 'Teste - Desenvolvimento',
    key: 'valle_test_sk_zzzzzzzzzzzzzzzzzzzzzzzzzzzz',
    prefix: 'valle_test_sk',
    createdAt: '2024-12-01',
    lastUsed: '2024-12-04T16:45:00Z',
    expiresAt: '2025-01-01',
    permissions: ['read:clients'],
    status: 'active',
    usageCount: 342,
    rateLimit: 100
  },
  {
    id: 'key_4',
    name: 'Legado - App Antigo',
    key: 'valle_live_sk_aaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    prefix: 'valle_live_sk',
    createdAt: '2024-06-10',
    permissions: ['read:clients', 'read:metrics'],
    status: 'revoked',
    usageCount: 45000,
    rateLimit: 500
  }
];

const mockLogs: APILog[] = [
  { id: 'log_1', endpoint: '/api/v1/clients', method: 'GET', status: 200, duration: 45, timestamp: '2024-12-05T11:30:00Z', apiKeyName: 'Produção - Website', ip: '192.168.1.100' },
  { id: 'log_2', endpoint: '/api/v1/metrics/dashboard', method: 'GET', status: 200, duration: 120, timestamp: '2024-12-05T11:29:55Z', apiKeyName: 'Produção - Website' },
  { id: 'log_3', endpoint: '/api/v1/webhooks', method: 'POST', status: 201, duration: 85, timestamp: '2024-12-05T11:29:30Z', apiKeyName: 'Integração N8N' },
  { id: 'log_4', endpoint: '/api/v1/clients/123', method: 'PUT', status: 401, duration: 12, timestamp: '2024-12-05T11:28:00Z', apiKeyName: 'Teste - Desenvolvimento' },
  { id: 'log_5', endpoint: '/api/v1/reports', method: 'GET', status: 429, duration: 5, timestamp: '2024-12-05T11:27:30Z', apiKeyName: 'Produção - Website' },
  { id: 'log_6', endpoint: '/api/v1/clients', method: 'POST', status: 200, duration: 95, timestamp: '2024-12-05T11:27:00Z', apiKeyName: 'Integração N8N' }
];

const apiEndpoints: APIEndpoint[] = [
  { id: 'ep_1', path: '/api/v1/clients', method: 'GET', description: 'Lista todos os clientes', auth: true, rateLimit: '100/min' },
  { id: 'ep_2', path: '/api/v1/clients/:id', method: 'GET', description: 'Obtém detalhes de um cliente', auth: true, rateLimit: '100/min' },
  { id: 'ep_3', path: '/api/v1/clients', method: 'POST', description: 'Cria um novo cliente', auth: true, rateLimit: '50/min' },
  { id: 'ep_4', path: '/api/v1/metrics/dashboard', method: 'GET', description: 'Métricas do dashboard', auth: true, rateLimit: '60/min' },
  { id: 'ep_5', path: '/api/v1/metrics/:clientId', method: 'GET', description: 'Métricas de um cliente', auth: true, rateLimit: '60/min' },
  { id: 'ep_6', path: '/api/v1/webhooks', method: 'POST', description: 'Registra um webhook', auth: true, rateLimit: '10/min' },
  { id: 'ep_7', path: '/api/v1/ai/generate', method: 'POST', description: 'Gera conteúdo com IA', auth: true, rateLimit: '20/min' }
];

// =====================================================
// COMPONENTES
// =====================================================

function APIKeyCard({ 
  apiKey, 
  onRevoke, 
  onCopy,
  onViewKey 
}: { 
  apiKey: APIKey;
  onRevoke: () => void;
  onCopy: () => void;
  onViewKey: () => void;
}) {
  const [showKey, setShowKey] = useState(false);

  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-xl p-5 border shadow-sm",
      apiKey.status === 'active' ? "border-gray-200" : "border-red-200 bg-red-50"
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            apiKey.status === 'active' ? "bg-green-100" : "bg-red-100"
          )}>
            <Key className={cn(
              "w-5 h-5",
              apiKey.status === 'active' ? "text-green-600" : "text-red-600"
            )} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{apiKey.name}</h3>
            <p className="text-xs text-gray-500">Criada em {apiKey.createdAt}</p>
          </div>
        </div>
        <span className={cn(
          "px-2 py-1 rounded-full text-xs font-medium",
          apiKey.status === 'active' && "bg-green-100 text-green-700",
          apiKey.status === 'expired' && "bg-yellow-100 text-yellow-700",
          apiKey.status === 'revoked' && "bg-red-100 text-red-700"
        )}>
          {apiKey.status === 'active' ? 'Ativa' : apiKey.status === 'expired' ? 'Expirada' : 'Revogada'}
        </span>
      </div>

      {/* Key Display */}
      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mb-4 font-mono text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-300 truncate">
            {showKey ? apiKey.key : `${apiKey.prefix}_${'•'.repeat(20)}`}
          </span>
          <div className="flex items-center gap-2 ml-2">
            <button onClick={() => setShowKey(!showKey)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button onClick={onCopy} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {apiKey.permissions.map(perm => (
          <span key={perm} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
            {perm}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 text-center mb-4">
        <div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{apiKey.usageCount.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Requisições</p>
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{apiKey.rateLimit}</p>
          <p className="text-xs text-gray-500">Rate Limit/h</p>
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {apiKey.lastUsed ? new Date(apiKey.lastUsed).toLocaleDateString('pt-BR') : '-'}
          </p>
          <p className="text-xs text-gray-500">Último Uso</p>
        </div>
      </div>

      {/* Actions */}
      {apiKey.status === 'active' && (
        <div className="flex items-center gap-2">
          <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors">
            <RefreshCw className="w-4 h-4" />
            Rotacionar
          </button>
          <button 
            onClick={onRevoke}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Revogar
          </button>
        </div>
      )}
    </div>
  );
}

function LogRow({ log }: { log: APILog }) {
  const statusColor = {
    200: 'text-green-600 bg-green-100',
    201: 'text-green-600 bg-green-100',
    401: 'text-red-600 bg-red-100',
    403: 'text-red-600 bg-red-100',
    404: 'text-yellow-600 bg-yellow-100',
    429: 'text-orange-600 bg-orange-100',
    500: 'text-red-600 bg-red-100'
  }[log.status] || 'text-gray-600 bg-gray-100';

  const methodColor = {
    GET: 'text-blue-600 bg-blue-100',
    POST: 'text-green-600 bg-green-100',
    PUT: 'text-yellow-600 bg-yellow-100',
    DELETE: 'text-red-600 bg-red-100'
  }[log.method];

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-4 py-3">
        <span className={cn("px-2 py-0.5 rounded text-xs font-mono font-medium", methodColor)}>
          {log.method}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="font-mono text-sm text-gray-700 dark:text-gray-300">{log.endpoint}</span>
      </td>
      <td className="px-4 py-3">
        <span className={cn("px-2 py-0.5 rounded text-xs font-medium", statusColor)}>
          {log.status}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">{log.duration}ms</td>
      <td className="px-4 py-3 text-sm text-gray-500">{log.apiKeyName}</td>
      <td className="px-4 py-3 text-sm text-gray-500">
        {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
      </td>
    </tr>
  );
}

function CreateKeyModal({ onClose, onCreate }: { onClose: () => void; onCreate: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    permissions: [] as string[],
    expiresIn: '90'
  });

  const allPermissions = [
    { id: 'read:clients', label: 'Ler Clientes' },
    { id: 'write:clients', label: 'Escrever Clientes' },
    { id: 'read:metrics', label: 'Ler Métricas' },
    { id: 'write:webhooks', label: 'Configurar Webhooks' },
    { id: 'read:all', label: 'Ler Tudo' },
    { id: 'write:all', label: 'Escrever Tudo' }
  ];

  const togglePermission = (perm: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm]
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Key className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold">Nova API Key</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Produção - Website"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Permissões</label>
            <div className="space-y-2">
              {allPermissions.map(perm => (
                <label 
                  key={perm.id}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(perm.id)}
                    onChange={() => togglePermission(perm.id)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">{perm.label}</span>
                  <span className="text-xs text-gray-400 font-mono">{perm.id}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expira em</label>
            <select
              value={formData.expiresIn}
              onChange={e => setFormData({ ...formData, expiresIn: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="30">30 dias</option>
              <option value="90">90 dias</option>
              <option value="180">6 meses</option>
              <option value="365">1 ano</option>
              <option value="never">Nunca</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            Cancelar
          </button>
          <button
            onClick={() => onCreate(formData)}
            disabled={!formData.name || formData.permissions.length === 0}
            className="px-4 py-2 bg-[#1672d6] text-white rounded-lg hover:bg-[#1260b5] disabled:opacity-50"
          >
            Criar API Key
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// =====================================================
// PÁGINA PRINCIPAL
// =====================================================

export default function APICentralPage() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>(mockAPIKeys);
  const [logs] = useState<APILog[]>(mockLogs);
  const [activeTab, setActiveTab] = useState<'keys' | 'logs' | 'docs' | 'webhooks'>('keys');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreateKey = (data: any) => {
    console.log('Creating key:', data);
    toast.success('API Key criada com sucesso!');
    setShowCreateModal(false);
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('API Key copiada!');
  };

  const handleRevokeKey = (id: string) => {
    setApiKeys(prev => prev.map(k => 
      k.id === id ? { ...k, status: 'revoked' as const } : k
    ));
    toast.success('API Key revogada');
  };

  const stats = {
    activeKeys: apiKeys.filter(k => k.status === 'active').length,
    totalRequests: apiKeys.reduce((sum, k) => sum + k.usageCount, 0),
    errorRate: Math.round((logs.filter(l => l.status >= 400).length / logs.length) * 100)
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Code className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Central de APIs</h1>
              <p className="text-sm text-gray-500">Gerencie suas API Keys e integrações</p>
            </div>
          </div>

          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1672d6] text-white rounded-xl text-sm font-medium hover:bg-[#1260b5] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nova API Key
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <Key className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeKeys}</p>
            <p className="text-sm text-gray-500">Keys Ativas</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <Activity className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRequests.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Requisições Total</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <Clock className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">45ms</p>
            <p className="text-sm text-gray-500">Latência Média</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.errorRate}%</p>
            <p className="text-sm text-gray-500">Taxa de Erro</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {[
            { id: 'keys', label: 'API Keys', icon: Key },
            { id: 'logs', label: 'Logs', icon: Activity },
            { id: 'docs', label: 'Documentação', icon: FileText },
            { id: 'webhooks', label: 'Webhooks', icon: Webhook }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px",
                activeTab === tab.id
                  ? "border-[#1672d6] text-[#1672d6]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {/* API Keys */}
          {activeTab === 'keys' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-2 gap-4"
            >
              {apiKeys.map(key => (
                <APIKeyCard
                  key={key.id}
                  apiKey={key}
                  onCopy={() => handleCopyKey(key.key)}
                  onRevoke={() => handleRevokeKey(key.id)}
                  onViewKey={() => console.log('View key')}
                />
              ))}
            </motion.div>
          )}

          {/* Logs */}
          {activeTab === 'logs' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-200 flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Filtrar por endpoint..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </div>
                <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm">
                  <Filter className="w-4 h-4" />
                  Filtros
                </button>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Endpoint</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duração</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">API Key</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logs.map(log => (
                    <LogRow key={log.id} log={log} />
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {/* Docs */}
          {activeTab === 'docs' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-800">API Documentation</h3>
                    <p className="text-sm text-blue-600 mt-1">
                      Base URL: <code className="bg-blue-100 px-1 rounded">https://api.valle360.com.br/v1</code>
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {apiEndpoints.map(endpoint => (
                  <div key={endpoint.id} className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-xs font-mono font-medium",
                        endpoint.method === 'GET' && "bg-blue-100 text-blue-700",
                        endpoint.method === 'POST' && "bg-green-100 text-green-700",
                        endpoint.method === 'PUT' && "bg-yellow-100 text-yellow-700",
                        endpoint.method === 'DELETE' && "bg-red-100 text-red-700"
                      )}>
                        {endpoint.method}
                      </span>
                      <code className="font-mono text-sm text-gray-700">{endpoint.path}</code>
                      {endpoint.auth && (
                        <span title="Requer autenticação">
                          <Shield className="w-4 h-4 text-green-500" />
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{endpoint.description}</p>
                    <p className="text-xs text-gray-400 mt-2">Rate Limit: {endpoint.rateLimit}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Webhooks */}
          {activeTab === 'webhooks' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Webhook className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-purple-800">Configure Webhooks</h3>
                    <p className="text-sm text-purple-600 mt-1">
                      Receba notificações em tempo real quando eventos ocorrerem no Valle 360.
                    </p>
                  </div>
                </div>
              </div>

              <button className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors">
                <Plus className="w-5 h-5" />
                Adicionar Webhook
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create Key Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <CreateKeyModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateKey}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

