'use client';

import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

export default function AdminFranqueadosPage() {
  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1672d6] to-[#001533] flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#001533] dark:text-white">Franqueados</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Removemos dados simulados. Este módulo será ativado quando a base real de franqueados estiver conectada.
            </p>
          </div>
        </div>

        <div
          className="rounded-2xl border p-8"
          style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-light)' }}
        >
          <EmptyState
            type="users"
            title="Base de franqueados ainda não conectada"
            description="Para manter 100% de confiança, não exibimos listas/indicadores fake. Quando a base real estiver no Supabase (ou integração), este painel será habilitado."
            animated={false}
            action={{ label: 'Abrir Prontidão', onClick: () => (window.location.href = '/admin/prontidao') }}
            secondaryAction={{ label: 'Abrir Kanban', onClick: () => (window.location.href = '/admin/kanban-app') }}
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


