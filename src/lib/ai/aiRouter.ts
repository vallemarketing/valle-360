import { getSupabaseAdmin } from '@/lib/admin/supabaseAdmin';

export type LLMRole = 'system' | 'user' | 'assistant';
export interface LLMMessage {
  role: LLMRole;
  content: string;
}

export type LLMTask =
  | 'general'
  | 'analysis'
  | 'strategy'
  | 'sales'
  | 'copywriting'
  | 'hr'
  | 'sentiment'
  | 'classification';

export type LLMProvider = 'openrouter' | 'claude' | 'openai' | 'gemini';

export interface LLMRequest {
  messages: LLMMessage[];
  task?: LLMTask;
  temperature?: number;
  maxTokens?: number;
  json?: boolean;
  correlationId?: string;
  actorUserId?: string | null;
  entityType?: string | null;
  entityId?: string | null;
}

export interface LLMResponse {
  provider: LLMProvider;
  model: string;
  text: string;
  json?: any;
  usage?: Record<string, any>;
}

function extractJsonLoose(text: string) {
  const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!match) throw new Error('Resposta não contém JSON');
  return JSON.parse(match[0]);
}

function safeCorrelationId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function pickOpenRouterModel(task: LLMTask = 'general') {
  // Modelo automático do OpenRouter costuma escolher bem e permite fallback interno.
  // Você pode fixar via env se quiser.
  const envModel = process.env.OPENROUTER_MODEL;
  if (envModel) return envModel;

  switch (task) {
    case 'analysis':
    case 'strategy':
      return 'openrouter/auto';
    case 'sales':
    case 'copywriting':
      return 'openrouter/auto';
    default:
      return 'openrouter/auto';
  }
}

function pickClaudeModel(task: LLMTask = 'general') {
  const envModel = process.env.ANTHROPIC_MODEL;
  if (envModel) return envModel;
  // Sonnet costuma ser o melhor custo/qualidade para tasks gerais.
  return 'claude-3-5-sonnet-20241022';
}

function pickOpenAIModel(task: LLMTask = 'general') {
  const envModel = process.env.OPENAI_MODEL;
  if (envModel) return envModel;
  // Modelo custo/benefício atual (mantém compat com chat/completions).
  return task === 'analysis' || task === 'strategy' ? 'gpt-4o-mini' : 'gpt-4o-mini';
}

function pickGeminiModel(task: LLMTask = 'general') {
  const envModel = process.env.GEMINI_MODEL;
  if (envModel) return envModel;
  return task === 'analysis' || task === 'strategy' ? 'gemini-1.5-flash' : 'gemini-1.5-flash';
}

async function logAiAttempt(params: {
  userId?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  newValues: Record<string, any>;
}) {
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from('audit_logs').insert({
      user_id: params.userId || null,
      action: params.action,
      entity_type: params.entityType || 'ai',
      entity_id: params.entityId || null,
      old_values: null,
      new_values: params.newValues,
      ip_address: null,
      user_agent: null,
      created_at: new Date().toISOString(),
    });
  } catch {
    // best-effort
  }
}

async function getOpenRouterKey(): Promise<string | null> {
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from('integration_configs')
      .select('api_key')
      .eq('integration_id', 'openrouter')
      .single();
    if (data?.api_key) return data.api_key;
  } catch {
    // ignore
  }
  return process.env.OPENROUTER_API_KEY || null;
}
async function getAnthropicKey(): Promise<string | null> {
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from('integration_configs')
      .select('api_key')
      .eq('integration_id', 'anthropic')
      .single();
    if (data?.api_key) return data.api_key;
  } catch {
    // ignore
  }
  return process.env.ANTHROPIC_API_KEY || null;
}
async function getOpenAIKey(): Promise<string | null> {
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from('integration_configs')
      .select('api_key')
      .eq('integration_id', 'openai')
      .single();
    if (data?.api_key) return data.api_key;
  } catch {
    // ignore
  }
  return process.env.OPENAI_API_KEY || null;
}
async function getGeminiKey(): Promise<string | null> {
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from('integration_configs')
      .select('api_key')
      .eq('integration_id', 'gemini')
      .single();
    if (data?.api_key) return data.api_key;
  } catch {
    // ignore
  }
  return process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_CLOUD_API_KEY || null;
}

async function callOpenRouter(req: LLMRequest): Promise<LLMResponse> {
  const key = await getOpenRouterKey();
  if (!key) throw new Error('OPENROUTER_API_KEY não configurada');

  const model = pickOpenRouterModel(req.task);
  const url = 'https://openrouter.ai/api/v1/chat/completions';

  const startedAt = Date.now();
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      // OpenRouter recomenda identificar a app (opcional)
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost',
      'X-Title': 'Valle 360',
    },
    body: JSON.stringify({
      model,
      messages: req.messages,
      temperature: req.temperature ?? 0.7,
      max_tokens: req.maxTokens ?? 1024,
      // Nem todos os modelos respeitam, mas ajuda quando suportado.
      response_format: req.json ? { type: 'json_object' } : undefined,
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`OpenRouter error (${res.status}): ${raw.slice(0, 500)}`);
  }

  const data = JSON.parse(raw);
  const text: string = data?.choices?.[0]?.message?.content || '';
  const out: LLMResponse = {
    provider: 'openrouter',
    model: data?.model || model,
    text,
    usage: data?.usage,
  };

  await logAiAttempt({
    userId: req.actorUserId || null,
    action: 'ai.request',
    entityType: req.entityType || 'ai',
    entityId: req.entityId || null,
    newValues: {
      provider: out.provider,
      model: out.model,
      ok: true,
      ms: Date.now() - startedAt,
      task: req.task || 'general',
      correlation_id: req.correlationId,
      json: !!req.json,
    },
  });

  if (req.json) {
    out.json = extractJsonLoose(text);
  }
  return out;
}

async function callClaude(req: LLMRequest): Promise<LLMResponse> {
  const key = await getAnthropicKey();
  if (!key) throw new Error('ANTHROPIC_API_KEY não configurada');

  const model = pickClaudeModel(req.task);
  const startedAt = Date.now();

  const sys = req.messages.find((m) => m.role === 'system')?.content;
  const userMessages = req.messages.filter((m) => m.role !== 'system');
  const mergedUser = userMessages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join('\n\n');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: req.maxTokens ?? 1024,
      temperature: req.temperature ?? 0.7,
      system: req.json
        ? `${sys || ''}\n\nResponda APENAS com um JSON válido, sem texto extra.`
        : sys,
      messages: [{ role: 'user', content: mergedUser }],
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`Claude error (${res.status}): ${raw.slice(0, 500)}`);
  }

  const data = JSON.parse(raw);
  const text: string = data?.content?.[0]?.text || '';
  const out: LLMResponse = { provider: 'claude', model, text, usage: data?.usage };

  await logAiAttempt({
    userId: req.actorUserId || null,
    action: 'ai.request',
    entityType: req.entityType || 'ai',
    entityId: req.entityId || null,
    newValues: {
      provider: out.provider,
      model: out.model,
      ok: true,
      ms: Date.now() - startedAt,
      task: req.task || 'general',
      correlation_id: req.correlationId,
      json: !!req.json,
    },
  });

  if (req.json) out.json = extractJsonLoose(text);
  return out;
}

async function callOpenAI(req: LLMRequest): Promise<LLMResponse> {
  const key = await getOpenAIKey();
  if (!key) throw new Error('OPENAI_API_KEY não configurada');

  const model = pickOpenAIModel(req.task);
  const startedAt = Date.now();

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: req.messages,
      temperature: req.temperature ?? 0.7,
      max_tokens: req.maxTokens ?? 1024,
      response_format: req.json ? { type: 'json_object' } : undefined,
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`OpenAI error (${res.status}): ${raw.slice(0, 500)}`);
  }

  const data = JSON.parse(raw);
  const text: string = data?.choices?.[0]?.message?.content || '';
  const out: LLMResponse = { provider: 'openai', model: data?.model || model, text, usage: data?.usage };

  await logAiAttempt({
    userId: req.actorUserId || null,
    action: 'ai.request',
    entityType: req.entityType || 'ai',
    entityId: req.entityId || null,
    newValues: {
      provider: out.provider,
      model: out.model,
      ok: true,
      ms: Date.now() - startedAt,
      task: req.task || 'general',
      correlation_id: req.correlationId,
      json: !!req.json,
    },
  });

  if (req.json) out.json = extractJsonLoose(text);
  return out;
}

async function callGemini(req: LLMRequest): Promise<LLMResponse> {
  const key = await getGeminiKey();
  if (!key) throw new Error('GOOGLE_GEMINI_API_KEY/GOOGLE_CLOUD_API_KEY não configurada');

  const model = pickGeminiModel(req.task);
  const startedAt = Date.now();

  const sys = req.messages.find((m) => m.role === 'system')?.content;
  const user = req.messages.filter((m) => m.role !== 'system').map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');
  const prompt = req.json
    ? `${sys || ''}\n\nResponda APENAS com um JSON válido, sem texto extra.\n\n${user}`
    : `${sys || ''}\n\n${user}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: req.temperature ?? 0.7,
        maxOutputTokens: req.maxTokens ?? 1024,
      },
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`Gemini error (${res.status}): ${raw.slice(0, 500)}`);
  }

  const data = JSON.parse(raw);
  const text: string = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') || '';
  const out: LLMResponse = { provider: 'gemini', model, text, usage: data?.usageMetadata };

  await logAiAttempt({
    userId: req.actorUserId || null,
    action: 'ai.request',
    entityType: req.entityType || 'ai',
    entityId: req.entityId || null,
    newValues: {
      provider: out.provider,
      model: out.model,
      ok: true,
      ms: Date.now() - startedAt,
      task: req.task || 'general',
      correlation_id: req.correlationId,
      json: !!req.json,
    },
  });

  if (req.json) out.json = extractJsonLoose(text);
  return out;
}

export function getProviderStatus() {
  return {
    openrouter: !!process.env.OPENROUTER_API_KEY,
    claude: !!process.env.ANTHROPIC_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    gemini: !!(process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_CLOUD_API_KEY),
  };
}

/**
 * Roteia: OpenRouter (gateway) -> Claude -> OpenAI -> Gemini
 */
export async function generateWithAI(req: LLMRequest): Promise<LLMResponse> {
  const correlationId = req.correlationId || safeCorrelationId();
  const enriched: LLMRequest = { ...req, correlationId };

  const errors: Array<{ provider: string; error: string }> = [];

  const attempts: Array<{ provider: LLMProvider; fn: (r: LLMRequest) => Promise<LLMResponse> }> = [
    { provider: 'openrouter', fn: callOpenRouter },
    { provider: 'claude', fn: callClaude },
    { provider: 'openai', fn: callOpenAI },
    { provider: 'gemini', fn: callGemini },
  ];

  for (const a of attempts) {
    try {
      const result = await a.fn(enriched);
      return result;
    } catch (e: any) {
      const msg = e?.message || String(e);
      errors.push({ provider: a.provider, error: msg });
      await logAiAttempt({
        userId: enriched.actorUserId || null,
        action: 'ai.request_failed',
        entityType: enriched.entityType || 'ai',
        entityId: enriched.entityId || null,
        newValues: {
          provider: a.provider,
          ok: false,
          error: msg.slice(0, 500),
          task: enriched.task || 'general',
          correlation_id: correlationId,
          json: !!enriched.json,
        },
      });
    }
  }

  const summary = errors.map((e) => `${e.provider}: ${e.error}`).join(' | ');
  throw new Error(`Falha em todos os provedores. ${summary}`);
}


