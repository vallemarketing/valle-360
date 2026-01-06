'use client';

import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { DirectorChatModal } from '@/components/diretoria/DirectorChatModal';

export default function CMOPage() {
  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1672d6] to-[#001533] flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#001533] dark:text-white">CMO (Clientes / Performance)</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Sem mocks: NPS, churn e performance só com dados reais (health score, social metrics, aprovações).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DirectorChatModal
            director="cmo"
            title="Conversar com CMO"
            subtitle="Chat executivo focado em performance e retenção."
          />
          <Link href="/admin/diretoria" className="text-sm underline" style={{ color: 'var(--primary-500)' }}>
            Voltar
          </Link>
        </div>

        <div
          className="rounded-2xl border p-8"
          style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}
        >
          <EmptyState
            type="default"
            title="CMO com dados reais"
            description="Removemos indicadores simulados. Para habilitar este painel, ligamos às fontes reais (clients, health score, NPS, social metrics) e ao pipeline de aprovações."
            animated={false}
            action={{ label: 'Abrir Performance', onClick: () => (window.location.href = '/admin/performance') }}
            secondaryAction={{ label: 'Abrir Prontidão', onClick: () => (window.location.href = '/admin/prontidao') }}
          />

          <div className="mt-4">
            <Link href="/admin/performance" className="text-sm underline" style={{ color: 'var(--primary-500)' }}>
              Ir para Performance
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


