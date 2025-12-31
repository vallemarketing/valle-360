'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type ReadinessStatus = 'pass' | 'warn' | 'fail';
type UiStatus = ReadinessStatus | 'na';

function pill(status: UiStatus) {
  if (status === 'pass') return 'bg-green-100 text-green-800 border-green-200';
  if (status === 'warn') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  if (status === 'fail') return 'bg-red-100 text-red-800 border-red-200';
  return 'bg-gray-100 text-gray-700 border-gray-200';
}

function label(status: UiStatus) {
  if (status === 'pass') return 'OK';
  if (status === 'warn') return 'Atenção';
  if (status === 'fail') return 'Falha';
  return 'N/A';
}

function effectiveStatus(status: ReadinessStatus, applicable?: boolean): UiStatus {
  if (applicable === false) return 'na';
  return status;
}

export default function ProntidaoPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [cronRunning, setCronRunning] = useState(false);
  const [cronRunResult, setCronRunResult] = useState<any[] | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token || null;

      const res = await fetch('/api/admin/readiness', {
        cache: 'no-store',
        credentials: 'same-origin',
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Falha ao carregar prontidão');
      setData(json);
    } catch (e: any) {
      setError(e?.message || 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }

  async function runCronNow() {
    setCronRunning(true);
    setCronRunResult(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token || null;

      const jobs = [
        { job: 'collection', url: '/api/cron/collection' },
        { job: 'overdue', url: '/api/cron/overdue' },
        { job: 'ml', url: '/api/cron/ml' },
        { job: 'social-publish', url: '/api/cron/social-publish' },
        { job: 'social-metrics', url: '/api/cron/social-metrics' },
      ];

      const results = await Promise.all(
        jobs.map(async (j) => {
          try {
            const res = await fetch(j.url, {
              method: 'POST',
              cache: 'no-store',
              credentials: 'same-origin',
              headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
            });
            const json = await res.json().catch(() => null);
            return {
              job: j.job,
              ok: res.ok && (json?.success !== false),
              status: res.status,
              message: json?.message || json?.result?.message || null,
              error: res.ok ? null : (json?.error || 'Falha'),
            };
          } catch (e: any) {
            return { job: j.job, ok: false, status: 0, message: null, error: e?.message || 'Erro de rede' };
          }
        })
      );

      setCronRunResult(results);
      await load();
    } finally {
      setCronRunning(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const overall: ReadinessStatus | null = useMemo(() => data?.overall ?? null, [data]);
  const checks = data?.checks;
  const firebase = data?.firebase;
  const env = data?.environment;

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Prontidão do Sistema
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Checklist operacional: áreas, Hub, integrações, IA, ML e SQL.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {overall && (
              <span className={`px-3 py-1 rounded-full border text-sm font-medium ${pill(overall)}`}>
                {label(overall)}
              </span>
            )}
            <button
              onClick={load}
              className="px-3 py-2 rounded-lg border text-sm"
              style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}
            >
              Recarregar
            </button>
          </div>
        </div>

        {env?.vercelEnv && (
          <div className="p-4 rounded-xl border text-sm" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)', color: 'var(--text-secondary)' }}>
            Ambiente: <span style={{ color: 'var(--text-primary)' }}>{String(env.vercelEnv)}</span>
            {env?.appUrl ? (
              <>
                {' '}
                • URL: <span style={{ color: 'var(--text-primary)' }}>{String(env.appUrl)}</span>
              </>
            ) : null}
          </div>
        )}

        {loading && (
          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Carregando…</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}>
            <p className="font-medium text-red-700">Erro</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && data && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Firebase (Opcional) */}
            <div className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Firebase (opcional)</h2>
                <span className={`px-2 py-1 rounded-full border text-xs font-medium ${pill(effectiveStatus(firebase?.status || 'warn', firebase?.applicable))}`}>
                  {label(effectiveStatus(firebase?.status || 'warn', firebase?.applicable))}
                </span>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {firebase?.applicable === false
                  ? 'Não aplicável (uploads usam Supabase Storage por padrão).'
                  : firebase?.status === 'pass'
                  ? 'Env vars do Firebase estão configuradas.'
                  : 'Configure as env vars NEXT_PUBLIC_FIREBASE_* para habilitar upload direto.'}
              </p>
            </div>

            {/* Hub */}
            <div className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Hub (Eventos/Transições)</h2>
                <span className={`px-2 py-1 rounded-full border text-xs font-medium ${pill(effectiveStatus(checks.hub.status, checks.hub.applicable))}`}>
                  {label(effectiveStatus(checks.hub.status, checks.hub.applicable))}
                </span>
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex items-center justify-between"><span>Eventos pendentes</span><span className="font-medium">{checks.hub.pendingEvents}</span></div>
                <div className="flex items-center justify-between"><span>Transições pendentes</span><span className="font-medium">{checks.hub.pendingTransitions}</span></div>
                <div className="flex items-center justify-between"><span>Transições em erro</span><span className="font-medium">{checks.hub.errorTransitions}</span></div>
              </div>
              <div className="mt-3">
                <Link className="text-sm underline" href="/admin/fluxos">Abrir Central de Fluxos</Link>
              </div>
            </div>

            {/* Áreas */}
            <div className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Áreas (Colaboradores)</h2>
                <span className={`px-2 py-1 rounded-full border text-xs font-medium ${pill(effectiveStatus(checks.areas.status, checks.areas.applicable))}`}>
                  {label(effectiveStatus(checks.areas.status, checks.areas.applicable))}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                {checks.areas.coverage.map((a: any) => (
                  <div key={a.area} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span style={{ color: 'var(--text-primary)' }}>{a.area}</span>
                      <span className={`px-2 py-0.5 rounded-full border text-xs ${pill(a.status)}`}>{label(a.status)}</span>
                    </div>
                    <span style={{ color: 'var(--text-secondary)' }}>{a.activeEmployees} ativos</span>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <Link className="text-sm underline" href="/admin/colaboradores">Gerenciar colaboradores</Link>
                <span className="mx-2 text-sm" style={{ color: 'var(--text-secondary)' }}>•</span>
                <Link className="text-sm underline" href="/admin/colaboradores/vincular">Vincular existente</Link>
              </div>
            </div>

            {/* Integrações */}
            <div className="p-5 rounded-xl border lg:col-span-2" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Integrações</h2>
                <span className={`px-2 py-1 rounded-full border text-xs font-medium ${pill(effectiveStatus(checks.integrations.status, checks.integrations.applicable))}`}>
                  {label(effectiveStatus(checks.integrations.status, checks.integrations.applicable))}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.entries(checks.integrations.critical).map(([id, st]: any) => (
                  <div key={id} className="p-3 rounded-lg border" style={{ borderColor: 'var(--border-light)' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{id}</span>
                      <span className={`px-2 py-0.5 rounded-full border text-xs ${pill(st)}`}>{label(st)}</span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                      {st === 'pass' ? 'Conectado' : 'Configure/Conecte nas integrações'}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-4">
                <Link className="text-sm underline" href="/admin/integracoes">Abrir Integrações</Link>
                <Link className="text-sm underline" href="/admin/integracoes/n8n">N8N</Link>
              </div>
            </div>

            {/* IA/ML/SQL */}
            <div className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>IA</h2>
                <span className={`px-2 py-1 rounded-full border text-xs font-medium ${pill(effectiveStatus(checks.ai.status, checks.ai.applicable))}`}>
                  {label(effectiveStatus(checks.ai.status, checks.ai.applicable))}
                </span>
              </div>
              <div className="text-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-primary)' }}>OpenRouter</span>
                  <span className={`px-2 py-0.5 rounded-full border text-xs ${pill(checks.ai.providers.openrouter)}`}>{label(checks.ai.providers.openrouter)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-primary)' }}>OpenAI</span>
                  <span className={`px-2 py-0.5 rounded-full border text-xs ${pill(checks.ai.providers.openai)}`}>{label(checks.ai.providers.openai)}</span>
                </div>
              </div>
              <div className="mt-3">
                <Link className="text-sm underline" href="/admin/inteligencia">Abrir Inteligência</Link>
              </div>
            </div>

            {/* Schema (Supabase) */}
            <div className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Schema (Supabase)</h2>
                <span className={`px-2 py-1 rounded-full border text-xs font-medium ${pill(effectiveStatus(checks.schema.status, checks.schema.applicable))}`}>
                  {label(effectiveStatus(checks.schema.status, checks.schema.applicable))}
                </span>
              </div>
              <div className="text-sm space-y-2">
                {(checks.schema.criticalTables || []).slice(0, 8).map((t: any) => (
                  <div key={t.table} className="flex items-center justify-between gap-3">
                    <span className="truncate" style={{ color: 'var(--text-primary)' }}>{t.table}</span>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full border text-xs ${pill(t.status)}`}>{label(t.status)}</span>
                  </div>
                ))}
                {(checks.schema.criticalTables || []).length > 8 && (
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    +{(checks.schema.criticalTables || []).length - 8} tabelas…
                  </p>
                )}
              </div>
              <p className="text-xs mt-3" style={{ color: 'var(--text-secondary)' }}>
                Se alguma tabela crítica estiver ausente, o sistema pode retornar erro 500 em rotas específicas.
              </p>
            </div>

            <div className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>ML / Metas</h2>
                <span className={`px-2 py-1 rounded-full border text-xs font-medium ${pill(effectiveStatus(checks.ml.status, checks.ml.applicable))}`}>
                  {label(effectiveStatus(checks.ml.status, checks.ml.applicable))}
                </span>
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex items-center justify-between"><span>Configs de metas</span><span className="font-medium">{checks.ml.goalConfigs}</span></div>
                <div className="flex items-center justify-between"><span>Modelos ML</span><span className="font-medium">{checks.ml.mlModels}</span></div>
              </div>
              <div className="mt-3 flex items-center gap-4">
                <Link className="text-sm underline" href="/admin/metas">Metas</Link>
                <Link className="text-sm underline" href="/admin/machine-learning">Machine Learning</Link>
              </div>
            </div>

            {/* Cron */}
            <div className="p-5 rounded-xl border lg:col-span-2" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Cron (Vercel)</h2>
                <span className={`px-2 py-1 rounded-full border text-xs font-medium ${pill(effectiveStatus(checks.cron.status, checks.cron.applicable))}`}>
                  {label(effectiveStatus(checks.cron.status, checks.cron.applicable))}
                </span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <button
                  onClick={runCronNow}
                  disabled={cronRunning}
                  className="px-3 py-2 rounded-lg border text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)', color: 'var(--text-primary)' }}
                >
                  {cronRunning ? 'Rodando…' : 'Rodar agora'}
                </button>
                {cronRunResult && (
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Executado agora • {cronRunResult.filter((r) => r.ok).length}/{cronRunResult.length} OK
                  </span>
                )}
              </div>

              {cronRunResult && (
                <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                  {cronRunResult.map((r) => {
                    const st: UiStatus = r.ok ? 'pass' : 'warn';
                    return (
                      <div key={r.job} className="p-3 rounded-lg border" style={{ borderColor: 'var(--border-light)' }}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{r.job}</span>
                          <span className={`px-2 py-0.5 rounded-full border text-xs ${pill(st)}`}>{label(st)}</span>
                        </div>
                        {r.error ? (
                          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{r.error}</p>
                        ) : (
                          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{r.message || 'OK'}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {checks.cron.applicable === false && checks.cron.reason && (
                <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                  {checks.cron.reason}
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(checks.cron.jobs || []).map((j: any) => (
                  <div key={j.job} className="p-3 rounded-lg border" style={{ borderColor: 'var(--border-light)' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{j.job}</span>
                      <span className={`px-2 py-0.5 rounded-full border text-xs ${pill(effectiveStatus(j.status, j.applicable))}`}>
                        {label(effectiveStatus(j.status, j.applicable))}
                      </span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                      {j.applicable === false
                        ? 'Não aplicável neste ambiente'
                        : j.lastRunAt
                          ? `Última execução: ${new Date(j.lastRunAt).toLocaleString()}`
                          : 'Sem execução nas últimas 24h'}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-xs mt-3" style={{ color: 'var(--text-secondary)' }}>
                Observação: para “pass”, cada job precisa ter ao menos 1 log nas últimas 24h.
              </p>
            </div>

            <div className="p-5 rounded-xl border lg:col-span-2" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>SQL / RPC</h2>
                <span className={`px-2 py-1 rounded-full border text-xs font-medium ${pill(effectiveStatus(checks.sql.status, checks.sql.applicable))}`}>
                  {label(effectiveStatus(checks.sql.status, checks.sql.applicable))}
                </span>
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex items-center justify-between">
                  <span>RPC is_admin()</span>
                  <span className="font-medium">{checks.sql.rpc.is_admin}</span>
                </div>
              </div>
            </div>

            {/* cPanel mailbox */}
            <div className="p-5 rounded-xl border lg:col-span-2" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Mailbox (cPanel)</h2>
                <span className={`px-2 py-1 rounded-full border text-xs font-medium ${pill(effectiveStatus(checks.cpanel.status, checks.cpanel.applicable))}`}>
                  {label(effectiveStatus(checks.cpanel.status, checks.cpanel.applicable))}
                </span>
              </div>
              <div className="text-sm space-y-2" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex items-center justify-between">
                  <span>CPANEL_USER</span>
                  <span className="font-medium">{checks.cpanel.env.hasUser ? 'OK' : 'Falta'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>CPANEL_PASSWORD</span>
                  <span className="font-medium">{checks.cpanel.env.hasPassword ? 'OK' : 'Falta'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>CPANEL_DOMAIN</span>
                  <span className="font-medium">{checks.cpanel.env.hasDomain ? 'OK' : 'Falta'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>WEBMAIL_URL</span>
                  <span className="font-medium">{checks.cpanel.env.hasWebmailUrl ? 'OK' : 'Opcional'}</span>
                </div>
              </div>
              <p className="text-xs mt-3" style={{ color: 'var(--text-secondary)' }}>
                A plataforma não expõe webmail internamente; isso só afeta o e-mail de boas-vindas enviado ao e-mail pessoal.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


