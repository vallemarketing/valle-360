'use client';

import Link from 'next/link';
import { Brain } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

export default function AdminRhInteligenciaPage() {
  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1672d6] to-[#001533] flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#001533] dark:text-white">RH Inteligência</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Removemos dados simulados. Este módulo será conectado a dados reais de colaboradores, desempenho e metas.
            </p>
          </div>
        </div>

        <div
          className="rounded-2xl border p-8"
          style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}
        >
          <EmptyState
            type="users"
            title="RH (sem mock)"
            description="Para manter confiabilidade, não exibimos cards/insights inventados. Quando os datasets de RH estiverem alimentados, habilitamos recomendações e insights."
            animated={false}
            action={{ label: 'Abrir Colaboradores', onClick: () => (window.location.href = '/admin/colaboradores') }}
            secondaryAction={{ label: 'Abrir Prontidão', onClick: () => (window.location.href = '/admin/prontidao') }}
          />

          <div className="mt-4">
            <Link href="/admin/colaboradores" className="text-sm underline" style={{ color: 'var(--primary-500)' }}>
              Ir para Colaboradores
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


