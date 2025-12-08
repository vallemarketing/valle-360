'use client';

/**
 * Valle 360 - Central de APIs
 * Gerenciamento de API Keys, documentação completa e logs
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
  Settings,
  Download,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Terminal,
  Play,
  Lock,
  Globe,
  Server,
  Database,
  Users,
  BarChart3,
  Brain,
  Mail,
  MessageSquare,
  Calendar,
  Target,
  DollarSign,
  TrendingUp,
  FileJson,
  Clipboard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

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
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  auth: boolean;
  rateLimit: string;
  category: string;
  requestBody?: any;
  responseBody?: any;
  queryParams?: { name: string; type: string; required: boolean; description: string }[];
  pathParams?: { name: string; type: string; description: string }[];
  headers?: { name: string; required: boolean; description: string }[];
  examples?: { title: string; request: string; response: string }[];
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
  }
];

const mockLogs: APILog[] = [
  { id: 'log_1', endpoint: '/api/v1/clients', method: 'GET', status: 200, duration: 45, timestamp: '2024-12-05T11:30:00Z', apiKeyName: 'Produção - Website', ip: '192.168.1.100' },
  { id: 'log_2', endpoint: '/api/v1/metrics/dashboard', method: 'GET', status: 200, duration: 120, timestamp: '2024-12-05T11:29:55Z', apiKeyName: 'Produção - Website' },
  { id: 'log_3', endpoint: '/api/v1/webhooks', method: 'POST', status: 201, duration: 85, timestamp: '2024-12-05T11:29:30Z', apiKeyName: 'Integração N8N' },
  { id: 'log_4', endpoint: '/api/v1/clients/123', method: 'PUT', status: 401, duration: 12, timestamp: '2024-12-05T11:28:00Z', apiKeyName: 'Teste - Desenvolvimento' },
  { id: 'log_5', endpoint: '/api/v1/reports', method: 'GET', status: 429, duration: 5, timestamp: '2024-12-05T11:27:30Z', apiKeyName: 'Produção - Website' }
];

const apiDocumentation: APIEndpoint[] = [
  // CLIENTES
  {
    id: 'clients-list',
    path: '/api/v1/clients',
    method: 'GET',
    description: 'Lista todos os clientes da agência com paginação e filtros',
    auth: true,
    rateLimit: '100/min',
    category: 'Clientes',
    queryParams: [
      { name: 'page', type: 'number', required: false, description: 'Página atual (padrão: 1)' },
      { name: 'limit', type: 'number', required: false, description: 'Itens por página (padrão: 20, máx: 100)' },
      { name: 'status', type: 'string', required: false, description: 'Filtrar por status: active, inactive, prospect' },
      { name: 'search', type: 'string', required: false, description: 'Buscar por nome ou email' }
    ],
    headers: [
      { name: 'Authorization', required: true, description: 'Bearer {api_key}' }
    ],
    responseBody: {
      success: true,
      data: [
        { id: 'cli_123', name: 'Empresa ABC', email: 'contato@empresa.com', status: 'active', created_at: '2024-01-15' }
      ],
      pagination: { page: 1, limit: 20, total: 150, pages: 8 }
    },
    examples: [
      {
        title: 'Listar clientes ativos',
        request: `curl -X GET "https://api.valle360.com.br/v1/clients?status=active" \\
  -H "Authorization: Bearer valle_live_sk_xxx"`,
        response: `{
  "success": true,
  "data": [
    {
      "id": "cli_123",
      "name": "Empresa ABC",
      "email": "contato@empresa.com",
      "phone": "(11) 99999-9999",
      "status": "active",
      "mrr": 5000,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}`
      }
    ]
  },
  {
    id: 'clients-get',
    path: '/api/v1/clients/:id',
    method: 'GET',
    description: 'Obtém os detalhes completos de um cliente específico',
    auth: true,
    rateLimit: '100/min',
    category: 'Clientes',
    pathParams: [
      { name: 'id', type: 'string', description: 'ID único do cliente (ex: cli_123)' }
    ],
    headers: [
      { name: 'Authorization', required: true, description: 'Bearer {api_key}' }
    ],
    responseBody: {
      success: true,
      data: {
        id: 'cli_123',
        name: 'Empresa ABC',
        email: 'contato@empresa.com',
        phone: '(11) 99999-9999',
        document: '12.345.678/0001-90',
        address: { street: 'Av. Paulista', number: '1000', city: 'São Paulo', state: 'SP' },
        status: 'active',
        mrr: 5000,
        services: ['social_media', 'ads', 'design'],
        team_assigned: ['user_1', 'user_2'],
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-12-01T15:45:00Z'
      }
    }
  },
  {
    id: 'clients-create',
    path: '/api/v1/clients',
    method: 'POST',
    description: 'Cria um novo cliente no sistema',
    auth: true,
    rateLimit: '50/min',
    category: 'Clientes',
    headers: [
      { name: 'Authorization', required: true, description: 'Bearer {api_key}' },
      { name: 'Content-Type', required: true, description: 'application/json' }
    ],
    requestBody: {
      name: 'Empresa XYZ',
      email: 'contato@xyz.com',
      phone: '(11) 98888-8888',
      document: '98.765.432/0001-10',
      status: 'prospect',
      services: ['social_media'],
      notes: 'Cliente indicado por parceiro'
    },
    responseBody: {
      success: true,
      data: { id: 'cli_456', name: 'Empresa XYZ', status: 'prospect' },
      message: 'Cliente criado com sucesso'
    },
    examples: [
      {
        title: 'Criar novo cliente',
        request: `curl -X POST "https://api.valle360.com.br/v1/clients" \\
  -H "Authorization: Bearer valle_live_sk_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Empresa XYZ",
    "email": "contato@xyz.com",
    "phone": "(11) 98888-8888",
    "status": "prospect"
  }'`,
        response: `{
  "success": true,
  "data": {
    "id": "cli_456",
    "name": "Empresa XYZ",
    "status": "prospect",
    "created_at": "2024-12-05T14:30:00Z"
  },
  "message": "Cliente criado com sucesso"
}`
      }
    ]
  },
  {
    id: 'clients-update',
    path: '/api/v1/clients/:id',
    method: 'PUT',
    description: 'Atualiza os dados de um cliente existente',
    auth: true,
    rateLimit: '50/min',
    category: 'Clientes',
    pathParams: [
      { name: 'id', type: 'string', description: 'ID único do cliente' }
    ],
    requestBody: {
      name: 'Empresa XYZ Atualizada',
      status: 'active',
      mrr: 3500
    }
  },
  {
    id: 'clients-delete',
    path: '/api/v1/clients/:id',
    method: 'DELETE',
    description: 'Remove um cliente (soft delete - marca como inativo)',
    auth: true,
    rateLimit: '20/min',
    category: 'Clientes'
  },
  // MÉTRICAS
  {
    id: 'metrics-dashboard',
    path: '/api/v1/metrics/dashboard',
    method: 'GET',
    description: 'Retorna as métricas consolidadas do dashboard principal',
    auth: true,
    rateLimit: '60/min',
    category: 'Métricas',
    queryParams: [
      { name: 'period', type: 'string', required: false, description: 'Período: today, week, month, year' },
      { name: 'start_date', type: 'string', required: false, description: 'Data inicial (YYYY-MM-DD)' },
      { name: 'end_date', type: 'string', required: false, description: 'Data final (YYYY-MM-DD)' }
    ],
    responseBody: {
      success: true,
      data: {
        revenue: { total: 150000, growth: 12.5 },
        clients: { active: 45, new: 8, churned: 2 },
        tasks: { completed: 234, pending: 45, overdue: 12 },
        nps: { score: 72, responses: 89 },
        engagement: { views: 15420, interactions: 3240 }
      }
    },
    examples: [
      {
        title: 'Métricas do mês atual',
        request: `curl -X GET "https://api.valle360.com.br/v1/metrics/dashboard?period=month" \\
  -H "Authorization: Bearer valle_live_sk_xxx"`,
        response: `{
  "success": true,
  "data": {
    "revenue": {
      "total": 150000,
      "growth": 12.5,
      "currency": "BRL"
    },
    "clients": {
      "active": 45,
      "new": 8,
      "churned": 2,
      "churn_rate": 4.4
    },
    "tasks": {
      "completed": 234,
      "pending": 45,
      "overdue": 12,
      "completion_rate": 83.9
    },
    "nps": {
      "score": 72,
      "responses": 89,
      "promoters": 65,
      "detractors": 8
    }
  },
  "period": {
    "start": "2024-12-01",
    "end": "2024-12-31"
  }
}`
      }
    ]
  },
  {
    id: 'metrics-client',
    path: '/api/v1/metrics/clients/:clientId',
    method: 'GET',
    description: 'Retorna métricas específicas de um cliente',
    auth: true,
    rateLimit: '60/min',
    category: 'Métricas',
    pathParams: [
      { name: 'clientId', type: 'string', description: 'ID do cliente' }
    ],
    queryParams: [
      { name: 'period', type: 'string', required: false, description: 'Período: week, month, quarter, year' }
    ]
  },
  {
    id: 'metrics-team',
    path: '/api/v1/metrics/team',
    method: 'GET',
    description: 'Retorna métricas de produtividade da equipe',
    auth: true,
    rateLimit: '30/min',
    category: 'Métricas',
    responseBody: {
      success: true,
      data: {
        members: [
          { id: 'user_1', name: 'João Silva', tasks_completed: 45, hours_worked: 168, efficiency: 92 }
        ],
        summary: { total_hours: 1250, avg_efficiency: 85 }
      }
    }
  },
  // TAREFAS
  {
    id: 'tasks-list',
    path: '/api/v1/tasks',
    method: 'GET',
    description: 'Lista todas as tarefas com filtros avançados',
    auth: true,
    rateLimit: '100/min',
    category: 'Tarefas',
    queryParams: [
      { name: 'status', type: 'string', required: false, description: 'todo, in_progress, review, done' },
      { name: 'assignee', type: 'string', required: false, description: 'ID do responsável' },
      { name: 'client_id', type: 'string', required: false, description: 'ID do cliente' },
      { name: 'priority', type: 'string', required: false, description: 'low, medium, high, urgent' },
      { name: 'due_date', type: 'string', required: false, description: 'Filtrar por data de entrega' }
    ]
  },
  {
    id: 'tasks-create',
    path: '/api/v1/tasks',
    method: 'POST',
    description: 'Cria uma nova tarefa',
    auth: true,
    rateLimit: '50/min',
    category: 'Tarefas',
    requestBody: {
      title: 'Criar campanha de marketing',
      description: 'Desenvolver campanha para o mês de natal',
      client_id: 'cli_123',
      assignee_id: 'user_1',
      priority: 'high',
      due_date: '2024-12-20',
      tags: ['marketing', 'campanha', 'natal']
    },
    examples: [
      {
        title: 'Criar tarefa com IA',
        request: `curl -X POST "https://api.valle360.com.br/v1/tasks" \\
  -H "Authorization: Bearer valle_live_sk_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Criar campanha de natal",
    "client_id": "cli_123",
    "assignee_id": "user_1",
    "priority": "high",
    "due_date": "2024-12-20",
    "ai_assist": true
  }'`,
        response: `{
  "success": true,
  "data": {
    "id": "task_789",
    "title": "Criar campanha de natal",
    "status": "todo",
    "ai_suggestions": {
      "subtasks": [
        "Definir conceito criativo",
        "Criar peças visuais",
        "Configurar segmentação de anúncios"
      ],
      "estimated_hours": 16
    }
  }
}`
      }
    ]
  },
  {
    id: 'tasks-update-status',
    path: '/api/v1/tasks/:id/status',
    method: 'PATCH',
    description: 'Atualiza o status de uma tarefa',
    auth: true,
    rateLimit: '100/min',
    category: 'Tarefas',
    pathParams: [
      { name: 'id', type: 'string', description: 'ID da tarefa' }
    ],
    requestBody: {
      status: 'in_progress'
    }
  },
  // IA
  {
    id: 'ai-generate-content',
    path: '/api/v1/ai/generate',
    method: 'POST',
    description: 'Gera conteúdo utilizando inteligência artificial',
    auth: true,
    rateLimit: '20/min',
    category: 'Inteligência Artificial',
    requestBody: {
      type: 'social_post',
      context: {
        client_id: 'cli_123',
        platform: 'instagram',
        topic: 'Lançamento de produto',
        tone: 'professional',
        length: 'medium'
      },
      options: {
        include_hashtags: true,
        include_emoji: true,
        variations: 3
      }
    },
    responseBody: {
      success: true,
      data: {
        variations: [
          { content: '🚀 Novidade chegando! Conheça nosso novo produto...', hashtags: ['#lancamento', '#novidade'] },
          { content: 'O momento que você esperava chegou! Apresentamos...', hashtags: ['#produto', '#inovacao'] }
        ],
        tokens_used: 450
      }
    },
    examples: [
      {
        title: 'Gerar post para Instagram',
        request: `curl -X POST "https://api.valle360.com.br/v1/ai/generate" \\
  -H "Authorization: Bearer valle_live_sk_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "social_post",
    "context": {
      "platform": "instagram",
      "topic": "Black Friday",
      "tone": "exciting"
    }
  }'`,
        response: `{
  "success": true,
  "data": {
    "content": "🔥 BLACK FRIDAY CHEGOU! \\n\\nAs maiores ofertas do ano estão aqui! Não perca essa oportunidade única...\\n\\n#BlackFriday #Ofertas #Desconto",
    "variations": [
      "⚡ É HOJE! Black Friday com descontos imperdíveis...",
      "🛒 Sua chance de economizar! Black Friday exclusiva..."
    ],
    "tokens_used": 320
  }
}`
      }
    ]
  },
  {
    id: 'ai-insights',
    path: '/api/v1/ai/insights',
    method: 'GET',
    description: 'Obtém insights gerados pela IA baseados nos dados da agência',
    auth: true,
    rateLimit: '30/min',
    category: 'Inteligência Artificial',
    queryParams: [
      { name: 'category', type: 'string', required: false, description: 'clients, revenue, tasks, team' },
      { name: 'limit', type: 'number', required: false, description: 'Número de insights (padrão: 5)' }
    ],
    responseBody: {
      success: true,
      data: [
        { type: 'opportunity', title: 'Upsell detectado', description: 'Cliente XYZ pode se beneficiar do serviço de ADS', confidence: 0.85 },
        { type: 'alert', title: 'Risco de churn', description: 'Cliente ABC não interage há 30 dias', confidence: 0.72 }
      ]
    }
  },
  {
    id: 'ai-email',
    path: '/api/v1/ai/email',
    method: 'POST',
    description: 'Gera emails profissionais com IA',
    auth: true,
    rateLimit: '20/min',
    category: 'Inteligência Artificial',
    requestBody: {
      type: 'proposal',
      recipient: { name: 'João da Silva', company: 'Empresa ABC' },
      context: 'Proposta de serviços de marketing digital',
      tone: 'formal',
      include_signature: true
    }
  },
  // WEBHOOKS
  {
    id: 'webhooks-list',
    path: '/api/v1/webhooks',
    method: 'GET',
    description: 'Lista todos os webhooks configurados',
    auth: true,
    rateLimit: '60/min',
    category: 'Webhooks'
  },
  {
    id: 'webhooks-create',
    path: '/api/v1/webhooks',
    method: 'POST',
    description: 'Registra um novo webhook para receber eventos',
    auth: true,
    rateLimit: '10/min',
    category: 'Webhooks',
    requestBody: {
      url: 'https://seu-servidor.com/webhook',
      events: ['client.created', 'task.completed', 'invoice.paid'],
      secret: 'seu_webhook_secret',
      active: true
    },
    responseBody: {
      success: true,
      data: {
        id: 'wh_123',
        url: 'https://seu-servidor.com/webhook',
        events: ['client.created', 'task.completed', 'invoice.paid'],
        status: 'active'
      }
    },
    examples: [
      {
        title: 'Configurar webhook para novos clientes',
        request: `curl -X POST "https://api.valle360.com.br/v1/webhooks" \\
  -H "Authorization: Bearer valle_live_sk_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://n8n.empresa.com/webhook/valle",
    "events": ["client.created", "client.updated"],
    "secret": "meu_secret_123"
  }'`,
        response: `{
  "success": true,
  "data": {
    "id": "wh_456",
    "url": "https://n8n.empresa.com/webhook/valle",
    "events": ["client.created", "client.updated"],
    "status": "active",
    "created_at": "2024-12-05T14:00:00Z"
  }
}`
      }
    ]
  },
  // FINANCEIRO
  {
    id: 'invoices-list',
    path: '/api/v1/invoices',
    method: 'GET',
    description: 'Lista todas as faturas',
    auth: true,
    rateLimit: '60/min',
    category: 'Financeiro',
    queryParams: [
      { name: 'status', type: 'string', required: false, description: 'pending, paid, overdue, cancelled' },
      { name: 'client_id', type: 'string', required: false, description: 'Filtrar por cliente' }
    ]
  },
  {
    id: 'invoices-create',
    path: '/api/v1/invoices',
    method: 'POST',
    description: 'Cria uma nova fatura',
    auth: true,
    rateLimit: '30/min',
    category: 'Financeiro',
    requestBody: {
      client_id: 'cli_123',
      items: [
        { description: 'Gestão de Redes Sociais', quantity: 1, unit_price: 2500 },
        { description: 'Gestão de Tráfego', quantity: 1, unit_price: 1500 }
      ],
      due_date: '2024-12-15',
      payment_method: 'pix'
    }
  },
  // EQUIPE
  {
    id: 'team-list',
    path: '/api/v1/team',
    method: 'GET',
    description: 'Lista todos os membros da equipe',
    auth: true,
    rateLimit: '60/min',
    category: 'Equipe'
  },
  {
    id: 'team-availability',
    path: '/api/v1/team/availability',
    method: 'GET',
    description: 'Verifica disponibilidade da equipe',
    auth: true,
    rateLimit: '30/min',
    category: 'Equipe',
    queryParams: [
      { name: 'date', type: 'string', required: true, description: 'Data para verificar (YYYY-MM-DD)' },
      { name: 'duration', type: 'number', required: false, description: 'Duração em minutos' }
    ]
  }
];

const webhookEvents = [
  { event: 'client.created', description: 'Novo cliente criado' },
  { event: 'client.updated', description: 'Dados do cliente atualizados' },
  { event: 'client.deleted', description: 'Cliente removido' },
  { event: 'task.created', description: 'Nova tarefa criada' },
  { event: 'task.completed', description: 'Tarefa concluída' },
  { event: 'task.overdue', description: 'Tarefa atrasada' },
  { event: 'invoice.created', description: 'Nova fatura gerada' },
  { event: 'invoice.paid', description: 'Fatura paga' },
  { event: 'invoice.overdue', description: 'Fatura vencida' },
  { event: 'nps.response', description: 'Nova resposta de NPS' },
  { event: 'message.received', description: 'Nova mensagem recebida' }
];

// =====================================================
// COMPONENTES
// =====================================================

function APIKeyCard({ 
  apiKey, 
  onRevoke, 
  onCopy,
  onRotate
}: { 
  apiKey: APIKey;
  onRevoke: () => void;
  onCopy: () => void;
  onRotate: () => void;
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

      <div className="flex flex-wrap gap-1.5 mb-4">
        {apiKey.permissions.map(perm => (
          <span key={perm} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
            {perm}
          </span>
        ))}
      </div>

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

      {apiKey.status === 'active' && (
        <div className="flex items-center gap-2">
          <button 
            onClick={onRotate}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
          >
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

function EndpointCard({ endpoint, isExpanded, onToggle }: { endpoint: APIEndpoint; isExpanded: boolean; onToggle: () => void }) {
  const methodColor = {
    GET: 'bg-blue-100 text-blue-700',
    POST: 'bg-green-100 text-green-700',
    PUT: 'bg-yellow-100 text-yellow-700',
    PATCH: 'bg-orange-100 text-orange-700',
    DELETE: 'bg-red-100 text-red-700'
  }[endpoint.method];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <span className={cn("px-2.5 py-1 rounded text-xs font-mono font-bold", methodColor)}>
            {endpoint.method}
          </span>
          <code className="font-mono text-sm text-gray-700 flex-1">{endpoint.path}</code>
          {endpoint.auth && (
            <span title="Requer autenticação" className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
              <Lock className="w-3 h-3" /> Auth
            </span>
          )}
          <span className="text-xs text-gray-400">{endpoint.rateLimit}</span>
          {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
        </div>
        <p className="text-sm text-gray-600 mt-2">{endpoint.description}</p>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200 overflow-hidden"
          >
            <div className="p-4 space-y-4 bg-gray-50">
              {/* Headers */}
              {endpoint.headers && endpoint.headers.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Headers</h4>
                  <div className="bg-white rounded-lg border p-3 space-y-2">
                    {endpoint.headers.map((header, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <code className="bg-gray-100 px-2 py-0.5 rounded text-purple-600">{header.name}</code>
                        {header.required && <span className="text-xs text-red-500">*obrigatório</span>}
                        <span className="text-gray-600 flex-1">{header.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Path Params */}
              {endpoint.pathParams && endpoint.pathParams.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Parâmetros de URL</h4>
                  <div className="bg-white rounded-lg border p-3 space-y-2">
                    {endpoint.pathParams.map((param, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <code className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">:{param.name}</code>
                        <span className="text-xs text-gray-400">({param.type})</span>
                        <span className="text-gray-600 flex-1">{param.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Query Params */}
              {endpoint.queryParams && endpoint.queryParams.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Query Parameters</h4>
                  <div className="bg-white rounded-lg border divide-y">
                    {endpoint.queryParams.map((param, i) => (
                      <div key={i} className="p-3 flex items-start gap-2 text-sm">
                        <code className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{param.name}</code>
                        <span className="text-xs text-gray-400">({param.type})</span>
                        {param.required && <span className="text-xs text-red-500">*</span>}
                        <span className="text-gray-600 flex-1">{param.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Request Body */}
              {endpoint.requestBody && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Request Body</h4>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                    <code>{JSON.stringify(endpoint.requestBody, null, 2)}</code>
                  </pre>
                </div>
              )}

              {/* Response */}
              {endpoint.responseBody && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Response (200)</h4>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">
                    <code>{JSON.stringify(endpoint.responseBody, null, 2)}</code>
                  </pre>
                </div>
              )}

              {/* Examples */}
              {endpoint.examples && endpoint.examples.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Exemplos</h4>
                  {endpoint.examples.map((example, i) => (
                    <div key={i} className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">{example.title}</p>
                      <div className="relative">
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                          <code>{example.request}</code>
                        </pre>
                        <button 
                          onClick={() => { navigator.clipboard.writeText(example.request); toast.success('Comando copiado!'); }}
                          className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded"
                        >
                          <Copy className="w-4 h-4 text-gray-300" />
                        </button>
                      </div>
                      <pre className="bg-gray-800 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">
                        <code>{example.response}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
    { id: 'read:tasks', label: 'Ler Tarefas' },
    { id: 'write:tasks', label: 'Escrever Tarefas' },
    { id: 'write:webhooks', label: 'Configurar Webhooks' },
    { id: 'ai:generate', label: 'Usar IA' },
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
            <div className="space-y-2 max-h-48 overflow-y-auto">
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
  const [expandedEndpoints, setExpandedEndpoints] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchDocs, setSearchDocs] = useState('');

  const categories = [...new Set(apiDocumentation.map(e => e.category))];

  const filteredEndpoints = apiDocumentation.filter(e => {
    const matchCategory = selectedCategory === 'all' || e.category === selectedCategory;
    const matchSearch = !searchDocs || 
      e.path.toLowerCase().includes(searchDocs.toLowerCase()) ||
      e.description.toLowerCase().includes(searchDocs.toLowerCase());
    return matchCategory && matchSearch;
  });

  const handleCreateKey = (data: any) => {
    const newKey: APIKey = {
      id: `key_${Date.now()}`,
      name: data.name,
      key: `valle_live_sk_${Math.random().toString(36).substring(2, 30)}`,
      prefix: 'valle_live_sk',
      createdAt: new Date().toISOString().split('T')[0],
      permissions: data.permissions,
      status: 'active',
      usageCount: 0,
      rateLimit: 1000
    };
    setApiKeys(prev => [...prev, newKey]);
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

  const handleRotateKey = (id: string) => {
    setApiKeys(prev => prev.map(k => 
      k.id === id ? { ...k, key: `valle_live_sk_${Math.random().toString(36).substring(2, 30)}` } : k
    ));
    toast.success('API Key rotacionada! A chave anterior foi invalidada.');
  };

  const toggleEndpoint = (id: string) => {
    setExpandedEndpoints(prev => 
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const handleDownloadDocs = () => {
    const docsContent = generateMarkdownDocs();
    const blob = new Blob([docsContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'valle360-api-documentation.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Documentação baixada com sucesso!');
  };

  const generateMarkdownDocs = () => {
    let md = `# Valle 360 API Documentation

## 📋 Visão Geral

A API do Valle 360 permite integrar seu sistema com nossa plataforma de gestão de agências. 
Esta documentação fornece todas as informações necessárias para começar a usar nossa API.

**Base URL:** \`https://api.valle360.com.br/v1\`

**Formato:** Todas as requisições e respostas utilizam JSON.

---

## 🔐 Autenticação

Todas as requisições devem incluir o header de autenticação:

\`\`\`
Authorization: Bearer sua_api_key
\`\`\`

### Obtendo sua API Key

1. Acesse o painel do Valle 360
2. Vá em **Configurações > Central de API**
3. Clique em **Nova API Key**
4. Defina as permissões necessárias
5. Copie e guarde sua chave em local seguro

⚠️ **Importante:** A API Key é exibida apenas uma vez. Guarde-a em local seguro.

---

## 📊 Rate Limits

| Plano | Requisições/min | Requisições/hora |
|-------|-----------------|------------------|
| Free | 60 | 1.000 |
| Pro | 300 | 10.000 |
| Enterprise | Ilimitado | Ilimitado |

Quando o limite é atingido, você receberá status **429 Too Many Requests**.

---

## 📚 Endpoints

`;

    categories.forEach(category => {
      md += `### ${category}\n\n`;
      
      apiDocumentation
        .filter(e => e.category === category)
        .forEach(endpoint => {
          md += `#### ${endpoint.method} ${endpoint.path}\n\n`;
          md += `${endpoint.description}\n\n`;
          md += `- **Autenticação:** ${endpoint.auth ? 'Obrigatória' : 'Não necessária'}\n`;
          md += `- **Rate Limit:** ${endpoint.rateLimit}\n\n`;

          if (endpoint.pathParams && endpoint.pathParams.length > 0) {
            md += `**Parâmetros de URL:**\n\n`;
            endpoint.pathParams.forEach(p => {
              md += `- \`${p.name}\` (${p.type}): ${p.description}\n`;
            });
            md += `\n`;
          }

          if (endpoint.queryParams && endpoint.queryParams.length > 0) {
            md += `**Query Parameters:**\n\n`;
            md += `| Parâmetro | Tipo | Obrigatório | Descrição |\n`;
            md += `|-----------|------|-------------|----------|\n`;
            endpoint.queryParams.forEach(p => {
              md += `| ${p.name} | ${p.type} | ${p.required ? 'Sim' : 'Não'} | ${p.description} |\n`;
            });
            md += `\n`;
          }

          if (endpoint.requestBody) {
            md += `**Request Body:**\n\n`;
            md += `\`\`\`json\n${JSON.stringify(endpoint.requestBody, null, 2)}\n\`\`\`\n\n`;
          }

          if (endpoint.responseBody) {
            md += `**Response:**\n\n`;
            md += `\`\`\`json\n${JSON.stringify(endpoint.responseBody, null, 2)}\n\`\`\`\n\n`;
          }

          if (endpoint.examples && endpoint.examples.length > 0) {
            md += `**Exemplo:**\n\n`;
            endpoint.examples.forEach(ex => {
              md += `*${ex.title}*\n\n`;
              md += `\`\`\`bash\n${ex.request}\n\`\`\`\n\n`;
              md += `Response:\n\`\`\`json\n${ex.response}\n\`\`\`\n\n`;
            });
          }

          md += `---\n\n`;
        });
    });

    md += `## 🔔 Webhooks

Webhooks permitem que seu sistema receba notificações em tempo real quando eventos ocorrem no Valle 360.

### Eventos Disponíveis

| Evento | Descrição |
|--------|-----------|
`;

    webhookEvents.forEach(e => {
      md += `| \`${e.event}\` | ${e.description} |\n`;
    });

    md += `
### Formato do Payload

\`\`\`json
{
  "event": "client.created",
  "timestamp": "2024-12-05T14:30:00Z",
  "data": {
    // dados específicos do evento
  }
}
\`\`\`

### Verificação de Assinatura

Todos os webhooks incluem um header \`X-Valle-Signature\` com um HMAC SHA256 do payload usando seu webhook secret.

---

## ❓ Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 400 | Bad Request - Parâmetros inválidos |
| 401 | Unauthorized - API Key inválida ou ausente |
| 403 | Forbidden - Sem permissão para este recurso |
| 404 | Not Found - Recurso não encontrado |
| 429 | Too Many Requests - Rate limit atingido |
| 500 | Internal Server Error - Erro interno |

---

## 💡 Suporte

- **Email:** api@valle360.com.br
- **Documentação:** https://docs.valle360.com.br
- **Status:** https://status.valle360.com.br

---

*Documentação gerada automaticamente em ${new Date().toLocaleDateString('pt-BR')}*
`;

    return md;
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
              <p className="text-sm text-gray-500">Gerencie suas API Keys, documentação e integrações</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleDownloadDocs}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Baixar Documentação
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#1672d6] text-white rounded-xl text-sm font-medium hover:bg-[#1260b5] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nova API Key
            </button>
          </div>
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
            { id: 'docs', label: 'Documentação', icon: BookOpen },
            { id: 'logs', label: 'Logs', icon: Activity },
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
                  onRotate={() => handleRotateKey(key.id)}
                />
              ))}
            </motion.div>
          )}

          {/* Documentation */}
          {activeTab === 'docs' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Quick Start */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2">🚀 Quick Start</h3>
                    <p className="text-blue-100 mb-4">
                      Comece a usar a API do Valle 360 em poucos minutos. A base URL é:
                    </p>
                    <div className="bg-black/30 rounded-lg p-3 font-mono text-sm flex items-center justify-between">
                      <span>https://api.valle360.com.br/v1</span>
                      <button 
                        onClick={() => { navigator.clipboard.writeText('https://api.valle360.com.br/v1'); toast.success('URL copiada!'); }}
                        className="p-1 hover:bg-white/10 rounded"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Auth Info */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800">Autenticação</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      Todas as requisições devem incluir o header: <code className="bg-amber-100 px-2 py-0.5 rounded">Authorization: Bearer sua_api_key</code>
                    </p>
                  </div>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchDocs}
                    onChange={e => setSearchDocs(e.target.value)}
                    placeholder="Buscar endpoints..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="all">Todas as Categorias</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Endpoints */}
              <div className="space-y-3">
                {categories.filter(cat => selectedCategory === 'all' || cat === selectedCategory).map(category => (
                  <div key={category}>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      {category === 'Clientes' && <Users className="w-5 h-5 text-blue-500" />}
                      {category === 'Métricas' && <BarChart3 className="w-5 h-5 text-green-500" />}
                      {category === 'Tarefas' && <Target className="w-5 h-5 text-purple-500" />}
                      {category === 'Inteligência Artificial' && <Brain className="w-5 h-5 text-pink-500" />}
                      {category === 'Webhooks' && <Webhook className="w-5 h-5 text-orange-500" />}
                      {category === 'Financeiro' && <DollarSign className="w-5 h-5 text-emerald-500" />}
                      {category === 'Equipe' && <Users className="w-5 h-5 text-indigo-500" />}
                      {category}
                    </h3>
                    <div className="space-y-2">
                      {filteredEndpoints
                        .filter(e => e.category === category)
                        .map(endpoint => (
                          <EndpointCard
                            key={endpoint.id}
                            endpoint={endpoint}
                            isExpanded={expandedEndpoints.includes(endpoint.id)}
                            onToggle={() => toggleEndpoint(endpoint.id)}
                          />
                        ))}
                    </div>
                  </div>
                ))}
              </div>
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

              {/* Available Events */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Eventos Disponíveis</h3>
                <div className="grid grid-cols-2 gap-4">
                  {webhookEvents.map(event => (
                    <div key={event.event} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <code className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-mono">
                        {event.event}
                      </code>
                      <span className="text-sm text-gray-600">{event.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => toast.success('Modal de configuração de webhook abrindo...')}
                className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
              >
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
