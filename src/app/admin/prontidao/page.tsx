'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type ReadinessStatus = 'pass' | 'warn' | 'fail';

function pill(status: ReadinessStatus) {
  if (status === 'pass') return 'bg-green-100 text-green-800 border-green-200';
  if (status === 'warn') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-red-100 text-red-800 border-red-200';
}

function label(status: ReadinessStatus) {
  if (status === 'pass') return 'OK';
  if (status === 'warn') return 'Atenção';
  return 'Falha';
}

export default function ProntidaoPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/readiness', { cache: 'no-store' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Falha ao carregar prontidão');
      setData(json);
    } catch (e: any) {
      setError(e?.message || 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const overall: ReadinessStatus | null = useMemo(() => data?.overall ?? null, [data]);
  const checks = data?.checks;

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
            {/* Hub */}
            <div className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Hub (Eventos/Transições)</h2>
                <span className={`px-2 py-1 rounded-full border text-xs font-medium ${pill(checks.hub.status)}`}>
                  {label(checks.hub.status)}
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
                <span className={`px-2 py-1 rounded-full border text-xs font-medium ${pill(checks.areas.status)}`}>
                  {label(checks.areas.status)}
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
                <span className={`px-2 py-1 rounded-full border text-xs font-medium ${pill(checks.integrations.status)}`}>
                  {label(checks.integrations.status)}
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
                <span className={`px-2 py-1 rounded-full border text-xs font-medium ${pill(checks.ai.status)}`}>
                  {label(checks.ai.status)}
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

            <div className="p-5 rounded-xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>ML / Metas</h2>
                <span className={`px-2 py-1 rounded-full border text-xs font-medium ${pill(checks.ml.status)}`}>
                  {label(checks.ml.status)}
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

            <div className="p-5 rounded-xl border lg:col-span-2" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>SQL / RPC</h2>
                <span className={`px-2 py-1 rounded-full border text-xs font-medium ${pill(checks.sql.status)}`}>
                  {label(checks.sql.status)}
                </span>
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex items-center justify-between">
                  <span>RPC is_admin()</span>
                  <span className="font-medium">{checks.sql.rpc.is_admin}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


