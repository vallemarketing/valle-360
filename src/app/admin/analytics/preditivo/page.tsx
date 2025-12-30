'use client';

import Link from 'next/link';
import { Brain } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

export default function AdminPreditivoPage() {
  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1672d6] to-[#001533] flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#001533] dark:text-white">Analytics Preditivo</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Removemos previsões simuladas. Este painel será habilitado apenas com dados reais (health score, churn, Kanban).
            </p>
          </div>
        </div>

        <div
          className="rounded-2xl border p-8"
          style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}
        >
          <EmptyState
            type="default"
            title="Sem dados preditivos ainda"
            description="Para manter 100% de confiança, não exibimos cards com valores inventados. Quando o pipeline de ML estiver alimentado, este painel será ativado."
            animated={false}
            action={{ label: 'Ver Prontidão', onClick: () => (window.location.href = '/admin/prontidao') }}
            secondaryAction={{ label: 'Rodar Cron ML (manual)', onClick: () => (window.location.href = '/api/cron/ml') }}
          />

          <div className="mt-4">
            <Link href="/admin/prontidao" className="text-sm underline" style={{ color: 'var(--primary-500)' }}>
              Ir para Prontidão
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


