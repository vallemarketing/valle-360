// Configuração de campos por fase e área para o Kanban

export interface PhaseField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'date' | 'number' | 'checkbox' | 'file' | 'url';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  helpText?: string;
}

export interface PhaseConfig {
  id: string;
  title: string;
  color: string;
  description: string;
  fields: PhaseField[];
}

export interface AreaConfig {
  id: string;
  name: string;
  phases: PhaseConfig[];
  specificFields: Record<string, PhaseField[]>;
}

// ==================== CAMPOS BASE POR FASE ====================

export const BASE_PHASE_FIELDS: Record<string, PhaseField[]> = {
  demandas: [
    { id: 'title', label: 'Título da Demanda', type: 'text', required: true, placeholder: 'Ex: Criação de Landing Page' },
    { id: 'description', label: 'Descrição', type: 'textarea', placeholder: 'Descreva os detalhes da demanda...' },
    { id: 'client_id', label: 'Cliente', type: 'select', required: true, helpText: 'Selecione o cliente associado' },
    { id: 'priority', label: 'Prioridade', type: 'select', required: true, options: [
      { value: 'low', label: 'Baixa' },
      { value: 'medium', label: 'Média' },
      { value: 'high', label: 'Alta' },
      { value: 'urgent', label: 'Urgente' }
    ]},
    { id: 'due_date', label: 'Data de Entrega Prevista', type: 'date', required: true }
  ],
  em_progresso: [
    { id: 'briefing_link', label: 'Link do Briefing', type: 'url', placeholder: 'https://...' },
    { id: 'references', label: 'Referências', type: 'textarea', placeholder: 'Links ou descrição de referências...' },
    { id: 'assignee', label: 'Responsável', type: 'select', required: true },
    { id: 'notes', label: 'Observações', type: 'textarea' },
    { id: 'started_at', label: 'Data de Início', type: 'date' }
  ],
  revisao: [
    { id: 'material_link', label: 'Link do Material', type: 'url', required: true, placeholder: 'Link do arquivo para revisão' },
    { id: 'checklist', label: 'Checklist de Qualidade', type: 'multiselect', options: [
      { value: 'ortografia', label: 'Ortografia verificada' },
      { value: 'design', label: 'Design conforme briefing' },
      { value: 'responsivo', label: 'Responsivo/Adaptado' },
      { value: 'links', label: 'Links funcionando' },
      { value: 'imagens', label: 'Imagens otimizadas' }
    ]},
    { id: 'adjustment_points', label: 'Pontos de Ajuste', type: 'textarea', placeholder: 'Liste os pontos que precisam de ajuste...' },
    { id: 'reviewer', label: 'Revisor', type: 'select' }
  ],
  aprovacao: [
    { id: 'approval_link', label: 'Link para Aprovação do Cliente', type: 'url', required: true },
    { id: 'sent_at', label: 'Enviado em', type: 'date' },
    { id: 'client_feedback', label: 'Feedback do Cliente', type: 'textarea' },
    { id: 'approval_status', label: 'Status da Aprovação', type: 'select', options: [
      { value: 'pending', label: 'Aguardando' },
      { value: 'approved', label: 'Aprovado' },
      { value: 'rejected', label: 'Reprovado' },
      { value: 'changes_requested', label: 'Alterações Solicitadas' }
    ]}
  ],
  concluido: [
    { id: 'completed_at', label: 'Data de Conclusão', type: 'date', required: true },
    { id: 'final_files', label: 'Arquivos Finais', type: 'url', placeholder: 'Link dos arquivos entregues' },
    { id: 'delivery_notes', label: 'Notas de Entrega', type: 'textarea' },
    { id: 'client_rating', label: 'Avaliação do Cliente', type: 'select', options: [
      { value: '5', label: '⭐⭐⭐⭐⭐ Excelente' },
      { value: '4', label: '⭐⭐⭐⭐ Muito Bom' },
      { value: '3', label: '⭐⭐⭐ Bom' },
      { value: '2', label: '⭐⭐ Regular' },
      { value: '1', label: '⭐ Ruim' }
    ]}
  ]
};

// ==================== CAMPOS ESPECÍFICOS POR ÁREA ====================

export const AREA_SPECIFIC_FIELDS: Record<string, Record<string, PhaseField[]>> = {
  'Web Designer': {
    demandas: [
      { id: 'site_type', label: 'Tipo de Site', type: 'select', options: [
        { value: 'landing', label: 'Landing Page' },
        { value: 'institucional', label: 'Site Institucional' },
        { value: 'ecommerce', label: 'E-commerce' },
        { value: 'blog', label: 'Blog' },
        { value: 'portfolio', label: 'Portfólio' },
        { value: 'webapp', label: 'Web App' }
      ]},
      { id: 'pages_count', label: 'Quantidade de Páginas', type: 'number' },
      { id: 'functionalities', label: 'Funcionalidades', type: 'multiselect', options: [
        { value: 'form', label: 'Formulário de Contato' },
        { value: 'blog', label: 'Blog/Notícias' },
        { value: 'gallery', label: 'Galeria de Imagens' },
        { value: 'video', label: 'Vídeos' },
        { value: 'chat', label: 'Chat/WhatsApp' },
        { value: 'maps', label: 'Mapa/Localização' },
        { value: 'payment', label: 'Pagamento Online' }
      ]}
    ],
    em_progresso: [
      { id: 'has_domain', label: 'Tem domínio?', type: 'checkbox' },
      { id: 'domain', label: 'Domínio', type: 'text', placeholder: 'www.exemplo.com.br' },
      { id: 'has_hosting', label: 'Tem hospedagem?', type: 'checkbox' },
      { id: 'hosting_provider', label: 'Provedor de Hospedagem', type: 'text' }
    ],
    revisao: [
      { id: 'preview_link', label: 'Link de Preview', type: 'url' },
      { id: 'mobile_tested', label: 'Testado em Mobile', type: 'checkbox' },
      { id: 'browsers_tested', label: 'Navegadores Testados', type: 'multiselect', options: [
        { value: 'chrome', label: 'Chrome' },
        { value: 'firefox', label: 'Firefox' },
        { value: 'safari', label: 'Safari' },
        { value: 'edge', label: 'Edge' }
      ]}
    ]
  },
  
  'Social Media': {
    demandas: [
      { id: 'platforms', label: 'Plataformas', type: 'multiselect', required: true, options: [
        { value: 'instagram', label: 'Instagram' },
        { value: 'facebook', label: 'Facebook' },
        { value: 'linkedin', label: 'LinkedIn' },
        { value: 'tiktok', label: 'TikTok' },
        { value: 'youtube', label: 'YouTube' },
        { value: 'twitter', label: 'Twitter/X' }
      ]},
      { id: 'content_format', label: 'Formato do Conteúdo', type: 'multiselect', options: [
        { value: 'feed', label: 'Post Feed' },
        { value: 'reels', label: 'Reels' },
        { value: 'stories', label: 'Stories' },
        { value: 'carousel', label: 'Carrossel' },
        { value: 'video_longo_v', label: 'Vídeo Longo Vertical' },
        { value: 'video_longo_h', label: 'Vídeo Longo Horizontal' }
      ]},
      { id: 'content_quantity', label: 'Quantidade de Peças', type: 'number' }
    ],
    em_progresso: [
      { id: 'caption', label: 'Legenda/Copy', type: 'textarea' },
      { id: 'hashtags', label: 'Hashtags', type: 'textarea' },
      { id: 'scheduled_date', label: 'Data de Publicação', type: 'date' },
      { id: 'scheduled_time', label: 'Horário de Publicação', type: 'text', placeholder: '14:00' }
    ],
    concluido: [
      { id: 'post_link', label: 'Link da Publicação', type: 'url' },
      { id: 'engagement', label: 'Engajamento Inicial', type: 'text' }
    ]
  },
  
  'Tráfego': {
    demandas: [
      { id: 'ad_platform', label: 'Plataforma de Anúncios', type: 'select', required: true, options: [
        { value: 'google_ads', label: 'Google Ads' },
        { value: 'meta_ads', label: 'Meta Ads (Facebook/Instagram)' },
        { value: 'tiktok_ads', label: 'TikTok Ads' },
        { value: 'linkedin_ads', label: 'LinkedIn Ads' },
        { value: 'youtube_ads', label: 'YouTube Ads' }
      ]},
      { id: 'campaign_objective', label: 'Objetivo da Campanha', type: 'select', options: [
        { value: 'awareness', label: 'Reconhecimento de Marca' },
        { value: 'traffic', label: 'Tráfego' },
        { value: 'engagement', label: 'Engajamento' },
        { value: 'leads', label: 'Geração de Leads' },
        { value: 'conversions', label: 'Conversões' },
        { value: 'sales', label: 'Vendas' }
      ]},
      { id: 'budget', label: 'Orçamento Mensal', type: 'number' },
      { id: 'target_audience', label: 'Público-Alvo', type: 'textarea' }
    ],
    em_progresso: [
      { id: 'campaign_period', label: 'Período da Campanha', type: 'text', placeholder: '01/01 a 31/01' },
      { id: 'ad_sets', label: 'Conjuntos de Anúncios', type: 'number' },
      { id: 'creatives_count', label: 'Quantidade de Criativos', type: 'number' }
    ],
    concluido: [
      { id: 'impressions', label: 'Impressões', type: 'number' },
      { id: 'clicks', label: 'Cliques', type: 'number' },
      { id: 'conversions_count', label: 'Conversões', type: 'number' },
      { id: 'cpc', label: 'CPC Médio', type: 'number' },
      { id: 'roas', label: 'ROAS', type: 'number' }
    ]
  },
  
  'Video Maker': {
    demandas: [
      { id: 'video_type', label: 'Tipo de Vídeo', type: 'select', options: [
        { value: 'institucional', label: 'Vídeo Institucional' },
        { value: 'produto', label: 'Vídeo de Produto' },
        { value: 'depoimento', label: 'Depoimento' },
        { value: 'tutorial', label: 'Tutorial' },
        { value: 'reels', label: 'Reels/Shorts' },
        { value: 'animacao', label: 'Animação/Motion' }
      ]},
      { id: 'duration', label: 'Duração Estimada', type: 'text', placeholder: 'Ex: 30s, 1min, 5min' },
      { id: 'resolution', label: 'Resolução', type: 'select', options: [
        { value: '1080p', label: 'Full HD (1080p)' },
        { value: '4k', label: '4K' },
        { value: 'vertical', label: 'Vertical (9:16)' },
        { value: 'square', label: 'Quadrado (1:1)' }
      ]}
    ],
    em_progresso: [
      { id: 'raw_footage', label: 'Link Material Bruto', type: 'url' },
      { id: 'soundtrack', label: 'Trilha Sonora', type: 'text' },
      { id: 'has_subtitles', label: 'Incluir Legendas', type: 'checkbox' },
      { id: 'has_voiceover', label: 'Incluir Locução', type: 'checkbox' }
    ],
    revisao: [
      { id: 'preview_video', label: 'Link do Preview', type: 'url' },
      { id: 'cuts_feedback', label: 'Feedback dos Cortes', type: 'textarea' }
    ]
  },
  
  'Designer': {
    demandas: [
      { id: 'design_type', label: 'Tipo de Arte', type: 'select', options: [
        { value: 'logo', label: 'Logo/Marca' },
        { value: 'identidade', label: 'Identidade Visual' },
        { value: 'post', label: 'Post para Redes' },
        { value: 'banner', label: 'Banner' },
        { value: 'flyer', label: 'Flyer/Panfleto' },
        { value: 'apresentacao', label: 'Apresentação' },
        { value: 'embalagem', label: 'Embalagem' },
        { value: 'cartao', label: 'Cartão de Visita' }
      ]},
      { id: 'dimensions', label: 'Dimensões', type: 'text', placeholder: 'Ex: 1080x1080px, A4' },
      { id: 'file_format', label: 'Formato de Entrega', type: 'multiselect', options: [
        { value: 'png', label: 'PNG' },
        { value: 'jpg', label: 'JPG' },
        { value: 'pdf', label: 'PDF' },
        { value: 'ai', label: 'AI (Illustrator)' },
        { value: 'psd', label: 'PSD (Photoshop)' },
        { value: 'svg', label: 'SVG' }
      ]}
    ],
    em_progresso: [
      { id: 'color_palette', label: 'Paleta de Cores', type: 'text', placeholder: '#FFFFFF, #000000' },
      { id: 'fonts', label: 'Fontes Utilizadas', type: 'text' }
    ]
  },
  
  'Comercial': {
    demandas: [
      { id: 'proposal_type', label: 'Tipo de Proposta', type: 'select', options: [
        { value: 'new_client', label: 'Novo Cliente' },
        { value: 'upsell', label: 'Upsell' },
        { value: 'renewal', label: 'Renovação' },
        { value: 'custom', label: 'Projeto Especial' }
      ]},
      { id: 'services', label: 'Serviços Inclusos', type: 'multiselect', options: [
        { value: 'social_media', label: 'Social Media' },
        { value: 'trafego', label: 'Tráfego Pago' },
        { value: 'site', label: 'Site/Landing Page' },
        { value: 'design', label: 'Design' },
        { value: 'video', label: 'Vídeo' },
        { value: 'consultoria', label: 'Consultoria' }
      ]},
      { id: 'proposal_value', label: 'Valor da Proposta', type: 'number' },
      { id: 'contract_duration', label: 'Duração do Contrato', type: 'select', options: [
        { value: '3', label: '3 meses' },
        { value: '6', label: '6 meses' },
        { value: '12', label: '12 meses' },
        { value: 'project', label: 'Por Projeto' }
      ]}
    ],
    em_progresso: [
      { id: 'meeting_date', label: 'Data da Reunião', type: 'date' },
      { id: 'decision_maker', label: 'Decisor', type: 'text' },
      { id: 'competitors', label: 'Concorrentes na Negociação', type: 'textarea' }
    ],
    aprovacao: [
      { id: 'proposal_link', label: 'Link da Proposta', type: 'url' },
      { id: 'negotiation_notes', label: 'Notas da Negociação', type: 'textarea' }
    ],
    concluido: [
      { id: 'contract_signed', label: 'Contrato Assinado', type: 'checkbox' },
      { id: 'contract_link', label: 'Link do Contrato', type: 'url' },
      { id: 'start_date', label: 'Data de Início', type: 'date' }
    ]
  },
  
  'RH': {
    demandas: [
      { id: 'vacancy_title', label: 'Título da Vaga', type: 'text', required: true },
      { id: 'department', label: 'Departamento', type: 'select', options: [
        { value: 'marketing', label: 'Marketing' },
        { value: 'comercial', label: 'Comercial' },
        { value: 'financeiro', label: 'Financeiro' },
        { value: 'ti', label: 'TI' },
        { value: 'rh', label: 'RH' },
        { value: 'operacional', label: 'Operacional' }
      ]},
      { id: 'contract_type', label: 'Tipo de Contrato', type: 'select', options: [
        { value: 'clt', label: 'CLT' },
        { value: 'pj', label: 'PJ' },
        { value: 'estagio', label: 'Estágio' },
        { value: 'temporario', label: 'Temporário' }
      ]},
      { id: 'salary_range', label: 'Faixa Salarial', type: 'text' }
    ],
    em_progresso: [
      { id: 'candidate_name', label: 'Nome do Candidato', type: 'text' },
      { id: 'candidate_email', label: 'Email do Candidato', type: 'text' },
      { id: 'resume_link', label: 'Link do Currículo', type: 'url' },
      { id: 'selection_stage', label: 'Etapa da Seleção', type: 'select', options: [
        { value: 'triagem', label: 'Triagem' },
        { value: 'entrevista_rh', label: 'Entrevista RH' },
        { value: 'entrevista_tecnica', label: 'Entrevista Técnica' },
        { value: 'teste', label: 'Teste Prático' },
        { value: 'entrevista_final', label: 'Entrevista Final' }
      ]}
    ],
    concluido: [
      { id: 'hired', label: 'Contratado', type: 'checkbox' },
      { id: 'start_date', label: 'Data de Início', type: 'date' },
      { id: 'final_salary', label: 'Salário Final', type: 'number' }
    ]
  },
  
  'Head Marketing': {
    demandas: [
      { id: 'project_type', label: 'Tipo de Projeto', type: 'select', options: [
        { value: 'campanha', label: 'Campanha Completa' },
        { value: 'estrategia', label: 'Planejamento Estratégico' },
        { value: 'branding', label: 'Branding' },
        { value: 'lancamento', label: 'Lançamento' },
        { value: 'evento', label: 'Evento' }
      ]},
      { id: 'teams_involved', label: 'Equipes Envolvidas', type: 'multiselect', options: [
        { value: 'social_media', label: 'Social Media' },
        { value: 'trafego', label: 'Tráfego' },
        { value: 'design', label: 'Design' },
        { value: 'video', label: 'Vídeo' },
        { value: 'web', label: 'Web' }
      ]},
      { id: 'total_budget', label: 'Orçamento Total', type: 'number' }
    ],
    em_progresso: [
      { id: 'strategy_doc', label: 'Documento de Estratégia', type: 'url' },
      { id: 'timeline', label: 'Cronograma', type: 'url' }
    ],
    concluido: [
      { id: 'results_report', label: 'Relatório de Resultados', type: 'url' },
      { id: 'roi', label: 'ROI', type: 'text' }
    ]
  }
};

// ==================== FASES PADRÃO ====================

export const DEFAULT_PHASES: PhaseConfig[] = [
  { id: 'demandas', title: 'Demandas', color: '#6366f1', description: 'Novas demandas', fields: BASE_PHASE_FIELDS.demandas },
  { id: 'em_progresso', title: 'Em Progresso', color: '#f97316', description: 'Em andamento', fields: BASE_PHASE_FIELDS.em_progresso },
  { id: 'revisao', title: 'Revisão', color: '#eab308', description: 'Aguardando revisão', fields: BASE_PHASE_FIELDS.revisao },
  { id: 'aprovacao', title: 'Aprovação Cliente', color: '#06b6d4', description: 'Enviado para cliente', fields: BASE_PHASE_FIELDS.aprovacao },
  { id: 'concluido', title: 'Concluído', color: '#10b981', description: 'Finalizado', fields: BASE_PHASE_FIELDS.concluido }
];

// ==================== FASES FINANCEIRO - CONTAS A PAGAR ====================

export const CONTAS_PAGAR_PHASES: PhaseConfig[] = [
  { 
    id: 'pendente', 
    title: 'Pendente', 
    color: '#ef4444', 
    description: 'Contas a vencer',
    fields: [
      { id: 'supplier', label: 'Fornecedor', type: 'text', required: true },
      { id: 'description', label: 'Descrição', type: 'textarea' },
      { id: 'value', label: 'Valor', type: 'number', required: true },
      { id: 'due_date', label: 'Vencimento', type: 'date', required: true },
      { id: 'category', label: 'Categoria', type: 'select', options: [
        { value: 'fornecedores', label: 'Fornecedores' },
        { value: 'servicos', label: 'Serviços' },
        { value: 'impostos', label: 'Impostos' },
        { value: 'folha', label: 'Folha de Pagamento' },
        { value: 'aluguel', label: 'Aluguel' },
        { value: 'outros', label: 'Outros' }
      ]},
      { id: 'cost_center', label: 'Centro de Custo', type: 'select', options: [
        { value: 'marketing', label: 'Marketing' },
        { value: 'comercial', label: 'Comercial' },
        { value: 'administrativo', label: 'Administrativo' },
        { value: 'operacional', label: 'Operacional' }
      ]}
    ]
  },
  { 
    id: 'agendado', 
    title: 'Agendado', 
    color: '#f97316', 
    description: 'Pagamento agendado',
    fields: [
      { id: 'scheduled_date', label: 'Data do Pagamento', type: 'date', required: true },
      { id: 'payment_method', label: 'Forma de Pagamento', type: 'select', options: [
        { value: 'pix', label: 'PIX' },
        { value: 'boleto', label: 'Boleto' },
        { value: 'transferencia', label: 'Transferência' },
        { value: 'cartao', label: 'Cartão' },
        { value: 'dinheiro', label: 'Dinheiro' }
      ]},
      { id: 'bank_account', label: 'Conta Bancária', type: 'text' }
    ]
  },
  { 
    id: 'pago', 
    title: 'Pago', 
    color: '#10b981', 
    description: 'Pagamento realizado',
    fields: [
      { id: 'paid_date', label: 'Data do Pagamento', type: 'date', required: true },
      { id: 'paid_value', label: 'Valor Pago', type: 'number', required: true },
      { id: 'receipt', label: 'Comprovante', type: 'url' },
      { id: 'notes', label: 'Observações', type: 'textarea' }
    ]
  },
  { 
    id: 'arquivado', 
    title: 'Arquivado', 
    color: '#6b7280', 
    description: 'Contas arquivadas',
    fields: [
      { id: 'archived_reason', label: 'Motivo', type: 'select', options: [
        { value: 'pago', label: 'Pago' },
        { value: 'cancelado', label: 'Cancelado' },
        { value: 'estornado', label: 'Estornado' }
      ]}
    ]
  }
];

// ==================== FASES FINANCEIRO - CONTAS A RECEBER ====================

export const CONTAS_RECEBER_PHASES: PhaseConfig[] = [
  { 
    id: 'a_faturar', 
    title: 'A Faturar', 
    color: '#8b5cf6', 
    description: 'Aguardando faturamento',
    fields: [
      { id: 'client_id', label: 'Cliente', type: 'select', required: true },
      { id: 'description', label: 'Descrição', type: 'textarea' },
      { id: 'value', label: 'Valor', type: 'number', required: true },
      { id: 'service_period', label: 'Período de Referência', type: 'text', placeholder: 'Ex: Janeiro/2025' },
      { id: 'services', label: 'Serviços', type: 'multiselect', options: [
        { value: 'mensalidade', label: 'Mensalidade' },
        { value: 'projeto', label: 'Projeto' },
        { value: 'extra', label: 'Serviço Extra' },
        { value: 'consultoria', label: 'Consultoria' }
      ]}
    ]
  },
  { 
    id: 'faturado', 
    title: 'Faturado', 
    color: '#06b6d4', 
    description: 'NF emitida',
    fields: [
      { id: 'invoice_number', label: 'Número da NF', type: 'text', required: true },
      { id: 'invoice_date', label: 'Data de Emissão', type: 'date', required: true },
      { id: 'due_date', label: 'Vencimento', type: 'date', required: true },
      { id: 'invoice_link', label: 'Link da NF', type: 'url' },
      { id: 'billing_status', label: 'Status de Cobrança', type: 'select', options: [
        { value: 'enviado', label: 'Enviado ao Cliente' },
        { value: 'aguardando', label: 'Aguardando Pagamento' },
        { value: 'atrasado', label: 'Atrasado' },
        { value: 'negociando', label: 'Em Negociação' }
      ]}
    ]
  },
  { 
    id: 'recebido', 
    title: 'Recebido', 
    color: '#10b981', 
    description: 'Pagamento recebido',
    fields: [
      { id: 'received_date', label: 'Data do Recebimento', type: 'date', required: true },
      { id: 'received_value', label: 'Valor Recebido', type: 'number', required: true },
      { id: 'payment_method', label: 'Forma de Pagamento', type: 'select', options: [
        { value: 'pix', label: 'PIX' },
        { value: 'boleto', label: 'Boleto' },
        { value: 'transferencia', label: 'Transferência' },
        { value: 'cartao', label: 'Cartão' }
      ]},
      { id: 'receipt', label: 'Comprovante', type: 'url' }
    ]
  },
  { 
    id: 'arquivado', 
    title: 'Arquivado', 
    color: '#6b7280', 
    description: 'Contas arquivadas',
    fields: [
      { id: 'archived_reason', label: 'Motivo', type: 'select', options: [
        { value: 'recebido', label: 'Recebido' },
        { value: 'cancelado', label: 'Cancelado' },
        { value: 'inadimplente', label: 'Inadimplente' }
      ]}
    ]
  }
];

// ==================== FUNÇÕES AUXILIARES ====================

export function getPhaseFields(phaseId: string, area: string): PhaseField[] {
  const baseFields = BASE_PHASE_FIELDS[phaseId] || [];
  const areaFields = AREA_SPECIFIC_FIELDS[area]?.[phaseId] || [];
  return [...baseFields, ...areaFields];
}

export function getPhasesForArea(area: string): PhaseConfig[] {
  return DEFAULT_PHASES.map(phase => ({
    ...phase,
    fields: getPhaseFields(phase.id, area)
  }));
}

export function getFinanceiroPhases(type: 'pagar' | 'receber'): PhaseConfig[] {
  return type === 'pagar' ? CONTAS_PAGAR_PHASES : CONTAS_RECEBER_PHASES;
}

