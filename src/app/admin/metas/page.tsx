'use client';

import Link from 'next/link';
import { Target } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

export default function AdminMetasPage() {
  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1672d6] to-[#001533] flex items-center justify-center">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#001533] dark:text-white">Metas</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Removemos dados simulados. Este módulo será conectado apenas a dados reais (goals/analytics).
            </p>
          </div>
        </div>

        <div
          className="rounded-2xl border p-8"
          style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}
        >
          <EmptyState
            type="tasks"
            title="Metas (Admin)"
            description="Para evitar indicadores falsos, o dashboard de Metas do Admin ficará ativo somente quando estiver alimentado por dados reais. Enquanto isso, use o Kanban e os relatórios."
            animated={false}
            action={{ label: 'Abrir Kanban', onClick: () => (window.location.href = '/admin/kanban-app') }}
            secondaryAction={{ label: 'Abrir Performance', onClick: () => (window.location.href = '/admin/performance') }}
          />

          <div className="mt-6 text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Se você quiser priorizar Metas agora, eu ligo este painel às tabelas de metas/ML já migradas no Supabase (sem mock).
          </div>

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


