'use client';

/**
 * Valle 360 - Integração N8N
 * Gerenciamento de workflows e automações
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Workflow,
  Play,
  Pause,
  RefreshCw,
  Settings,
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Plus,
  ExternalLink,
  ChevronRight,
  Activity,
  GitBranch,
  Webhook,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Trash2,
  Copy,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// =====================================================
// TIPOS
// =====================================================

interface WorkflowItem {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  nodes?: number;
  lastExecution?: {
    status: 'success' | 'error' | 'running';
    timestamp: string;
  };
}

interface Execution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'success' | 'error' | 'running' | 'waiting';
  startedAt: string;
  finishedAt?: string;
  error?: string;
}

interface WebhookItem {
  id: string;
  name: string;
  url: string;
  method: string;
  workflowId: string;
  active: boolean;
}

// =====================================================
// MOCK DATA
// =====================================================

const mockWorkflows: WorkflowItem[] = [
  {
    id: 'wf_1',
    name: 'Onboarding de Novo Cliente',
    active: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-12-01',
    tags: ['cliente', 'onboarding', 'email'],
    nodes: 8,
    lastExecution: { status: 'success', timestamp: '2024-12-05T10:30:00Z' }
  },
  {
    id: 'wf_2',
    name: 'Alerta de Tarefa Atrasada',
    active: true,
    createdAt: '2024-02-20',
    updatedAt: '2024-11-28',
    tags: ['tarefas', 'alerta', 'slack'],
    nodes: 5,
    lastExecution: { status: 'success', timestamp: '2024-12-05T09:15:00Z' }
  },
  {
    id: 'wf_3',
    name: 'Resposta Automática Review Negativo',
    active: false,
    createdAt: '2024-03-10',
    updatedAt: '2024-10-15',
    tags: ['review', 'automação', 'ia'],
    nodes: 12,
    lastExecution: { status: 'error', timestamp: '2024-12-04T16:00:00Z' }
  },
  {
    id: 'wf_4',
    name: 'NPS Baixo - Notificação Urgente',
    active: true,
    createdAt: '2024-04-05',
    updatedAt: '2024-12-02',
    tags: ['nps', 'alerta', 'urgente'],
    nodes: 6,
    lastExecution: { status: 'success', timestamp: '2024-12-05T11:00:00Z' }
  },
  {
    id: 'wf_5',
    name: 'Relatório Semanal Automático',
    active: true,
    createdAt: '2024-05-12',
    updatedAt: '2024-11-30',
    tags: ['relatório', 'automação', 'pdf'],
    nodes: 15,
    lastExecution: { status: 'running', timestamp: '2024-12-05T12:00:00Z' }
  },
  {
    id: 'wf_6',
    name: 'Sync Google Ads Métricas',
    active: true,
    createdAt: '2024-06-18',
    updatedAt: '2024-12-03',
    tags: ['google', 'ads', 'sync'],
    nodes: 10,
    lastExecution: { status: 'success', timestamp: '2024-12-05T08:00:00Z' }
  }
];

const mockExecutions: Execution[] = [
  { id: 'ex_1', workflowId: 'wf_1', workflowName: 'Onboarding de Novo Cliente', status: 'success', startedAt: '2024-12-05T10:30:00Z', finishedAt: '2024-12-05T10:30:05Z' },
  { id: 'ex_2', workflowId: 'wf_2', workflowName: 'Alerta de Tarefa Atrasada', status: 'success', startedAt: '2024-12-05T09:15:00Z', finishedAt: '2024-12-05T09:15:02Z' },
  { id: 'ex_3', workflowId: 'wf_3', workflowName: 'Resposta Automática Review', status: 'error', startedAt: '2024-12-04T16:00:00Z', finishedAt: '2024-12-04T16:00:10Z', error: 'Timeout ao conectar com API OpenAI' },
  { id: 'ex_4', workflowId: 'wf_5', workflowName: 'Relatório Semanal', status: 'running', startedAt: '2024-12-05T12:00:00Z' },
  { id: 'ex_5', workflowId: 'wf_4', workflowName: 'NPS Baixo - Notificação', status: 'success', startedAt: '2024-12-05T11:00:00Z', finishedAt: '2024-12-05T11:00:03Z' },
  { id: 'ex_6', workflowId: 'wf_6', workflowName: 'Sync Google Ads', status: 'success', startedAt: '2024-12-05T08:00:00Z', finishedAt: '2024-12-05T08:01:30Z' }
];

const mockWebhooks: WebhookItem[] = [
  { id: 'wh_1', name: 'Novo Cliente', url: 'https://n8n.valle360.com.br/webhook/new-client', method: 'POST', workflowId: 'wf_1', active: true },
  { id: 'wh_2', name: 'Review Recebido', url: 'https://n8n.valle360.com.br/webhook/review', method: 'POST', workflowId: 'wf_3', active: true },
  { id: 'wh_3', name: 'NPS Submission', url: 'https://n8n.valle360.com.br/webhook/nps', method: 'POST', workflowId: 'wf_4', active: true },
  { id: 'wh_4', name: 'Task Update', url: 'https://n8n.valle360.com.br/webhook/task', method: 'POST', workflowId: 'wf_2', active: true }
];

// =====================================================
// COMPONENTES
// =====================================================

function StatusBadge({ status }: { status: string }) {
  const config = {
    success: { color: 'bg-green-100 text-green-700', icon: CheckCircle, label: 'Sucesso' },
    error: { color: 'bg-red-100 text-red-700', icon: XCircle, label: 'Erro' },
    running: { color: 'bg-blue-100 text-blue-700', icon: RefreshCw, label: 'Executando' },
    waiting: { color: 'bg-yellow-100 text-yellow-700', icon: Clock, label: 'Aguardando' }
  }[status] || { color: 'bg-gray-100 text-gray-700', icon: Clock, label: status };

  const Icon = config.icon;

  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium", config.color)}>
      <Icon className={cn("w-3 h-3", status === 'running' && "animate-spin")} />
      {config.label}
    </span>
  );
}

function WorkflowCard({ 
  workflow, 
  onToggle, 
  onExecute, 
  onView 
}: { 
  workflow: WorkflowItem;
  onToggle: () => void;
  onExecute: () => void;
  onView: () => void;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            workflow.active ? "bg-green-100" : "bg-gray-100"
          )}>
            <Workflow className={cn(
              "w-5 h-5",
              workflow.active ? "text-green-600" : "text-gray-400"
            )} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{workflow.name}</h3>
            <p className="text-xs text-gray-500">{workflow.nodes} nodes</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className={cn(
            "relative w-11 h-6 rounded-full transition-colors",
            workflow.active ? "bg-green-500" : "bg-gray-300"
          )}
        >
          <motion.div
            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
            animate={{ left: workflow.active ? '24px' : '4px' }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {workflow.tags?.map(tag => (
          <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300">
            {tag}
          </span>
        ))}
      </div>

      {/* Last Execution */}
      {workflow.lastExecution && (
        <div className="flex items-center justify-between text-sm mb-4">
          <span className="text-gray-500">Última execução:</span>
          <StatusBadge status={workflow.lastExecution.status} />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onExecute}
          disabled={!workflow.active}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            workflow.active
              ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}
        >
          <Play className="w-4 h-4" />
          Executar
        </button>
        <button
          onClick={onView}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Eye className="w-4 h-4 text-gray-500" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ExternalLink className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </motion.div>
  );
}

function ExecutionRow({ execution }: { execution: Execution }) {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Workflow className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">{execution.workflowName}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={execution.status} />
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">
        {new Date(execution.startedAt).toLocaleString('pt-BR')}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">
        {execution.finishedAt 
          ? `${((new Date(execution.finishedAt).getTime() - new Date(execution.startedAt).getTime()) / 1000).toFixed(1)}s`
          : '-'
        }
      </td>
      <td className="px-4 py-3">
        {execution.error && (
          <span className="text-xs text-red-600 truncate max-w-[200px] block">{execution.error}</span>
        )}
      </td>
    </tr>
  );
}

function WebhookRow({ webhook, onCopy }: { webhook: WebhookItem; onCopy: (url: string) => void }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          webhook.active ? "bg-purple-100" : "bg-gray-100"
        )}>
          <Webhook className={cn(
            "w-5 h-5",
            webhook.active ? "text-purple-600" : "text-gray-400"
          )} />
        </div>
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white">{webhook.name}</h4>
          <p className="text-xs text-gray-500 font-mono truncate max-w-[300px]">{webhook.url}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={cn(
          "px-2 py-1 rounded text-xs font-mono",
          webhook.method === 'POST' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
        )}>
          {webhook.method}
        </span>
        <button 
          onClick={() => onCopy(webhook.url)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Copy className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
}

// =====================================================
// PÁGINA PRINCIPAL
// =====================================================

export default function N8NIntegrationPage() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>(mockWorkflows);
  const [executions] = useState<Execution[]>(mockExecutions);
  const [webhooks] = useState<WebhookItem[]>(mockWebhooks);
  const [activeTab, setActiveTab] = useState<'workflows' | 'executions' | 'webhooks' | 'triggers'>('workflows');
  const [searchTerm, setSearchTerm] = useState('');
  const [n8nConnected, setN8nConnected] = useState(true);

  const toggleWorkflow = (id: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === id ? { ...w, active: !w.active } : w
    ));
    toast.success('Status do workflow atualizado');
  };

  const executeWorkflow = (id: string) => {
    toast.success('Workflow executado com sucesso!');
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copiada para a área de transferência');
  };

  const stats = {
    active: workflows.filter(w => w.active).length,
    total: workflows.length,
    successRate: Math.round((executions.filter(e => e.status === 'success').length / executions.length) * 100),
    todayExecutions: executions.filter(e => new Date(e.startedAt).toDateString() === new Date().toDateString()).length
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <GitBranch className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Integração N8N</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  n8nConnected ? "bg-green-500" : "bg-red-500"
                )} />
                <p className="text-sm text-gray-500">
                  {n8nConnected ? 'Conectado' : 'Desconectado'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition-colors">
              <RefreshCw className="w-4 h-4" />
              Sincronizar
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#1672d6] text-white rounded-xl text-sm font-medium hover:bg-[#1260b5] transition-colors">
              <ExternalLink className="w-4 h-4" />
              Abrir N8N
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <Workflow className="w-5 h-5 text-blue-500" />
              <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">{stats.active} ativos</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            <p className="text-sm text-gray-500">Workflows</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <Activity className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.todayExecutions}</p>
            <p className="text-sm text-gray-500">Execuções Hoje</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.successRate}%</p>
            <p className="text-sm text-gray-500">Taxa de Sucesso</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <Webhook className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{webhooks.length}</p>
            <p className="text-sm text-gray-500">Webhooks</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'workflows', label: 'Workflows', icon: Workflow },
            { id: 'executions', label: 'Execuções', icon: Activity },
            { id: 'webhooks', label: 'Webhooks', icon: Webhook },
            { id: 'triggers', label: 'Triggers', icon: Zap }
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
          {/* Workflows */}
          {activeTab === 'workflows' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar workflow..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1672d6]"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-xl text-sm hover:bg-gray-200 transition-colors">
                  <Filter className="w-4 h-4" />
                  Filtros
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {workflows
                  .filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(workflow => (
                    <WorkflowCard
                      key={workflow.id}
                      workflow={workflow}
                      onToggle={() => toggleWorkflow(workflow.id)}
                      onExecute={() => executeWorkflow(workflow.id)}
                      onView={() => console.log('View', workflow.id)}
                    />
                  ))}
              </div>
            </motion.div>
          )}

          {/* Executions */}
          {activeTab === 'executions' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Workflow</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Início</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duração</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Erro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {executions.map(exec => (
                    <ExecutionRow key={exec.id} execution={exec} />
                  ))}
                </tbody>
              </table>
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
              {webhooks.map(webhook => (
                <WebhookRow 
                  key={webhook.id} 
                  webhook={webhook} 
                  onCopy={copyToClipboard}
                />
              ))}
            </motion.div>
          )}

          {/* Triggers */}
          {activeTab === 'triggers' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-800">Triggers Automáticos</h3>
                    <p className="text-sm text-blue-600 mt-1">
                      Configure eventos que disparam workflows automaticamente no Valle 360.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { id: 't1', name: 'Novo Cliente Cadastrado', description: 'Dispara quando um novo cliente é adicionado ao sistema', workflow: 'Onboarding de Novo Cliente', active: true },
                  { id: 't2', name: 'Tarefa Atrasada', description: 'Dispara quando uma tarefa passa da data limite', workflow: 'Alerta de Tarefa Atrasada', active: true },
                  { id: 't3', name: 'NPS Abaixo de 7', description: 'Dispara quando um cliente responde NPS com nota baixa', workflow: 'NPS Baixo - Notificação', active: true },
                  { id: 't4', name: 'Review Negativo', description: 'Dispara quando um review negativo é detectado', workflow: 'Resposta Automática Review', active: false },
                  { id: 't5', name: 'Contrato Próximo do Vencimento', description: 'Dispara 30 dias antes do vencimento do contrato', workflow: null, active: false }
                ].map(trigger => (
                  <div
                    key={trigger.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-colors",
                      trigger.active 
                        ? "bg-white border-green-200" 
                        : "bg-gray-50 border-gray-200"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        trigger.active ? "bg-green-100" : "bg-gray-100"
                      )}>
                        <Zap className={cn(
                          "w-5 h-5",
                          trigger.active ? "text-green-600" : "text-gray-400"
                        )} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{trigger.name}</h4>
                        <p className="text-sm text-gray-500">{trigger.description}</p>
                        {trigger.workflow && (
                          <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                            <Workflow className="w-3 h-3" />
                            {trigger.workflow}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {!trigger.workflow && (
                        <button className="text-sm text-blue-600 hover:underline">
                          Configurar Workflow
                        </button>
                      )}
                      <button
                        className={cn(
                          "relative w-11 h-6 rounded-full transition-colors",
                          trigger.active ? "bg-green-500" : "bg-gray-300"
                        )}
                      >
                        <motion.div
                          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                          animate={{ left: trigger.active ? '24px' : '4px' }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

