'use client';

import Link from 'next/link';
import { Users } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { DirectorChatModal } from '@/components/diretoria/DirectorChatModal';

export default function CHROPage() {
  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1672d6] to-[#001533] flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#001533] dark:text-white">CHRO (RH)</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Sem mocks: KPIs de RH ficam apenas com dados reais. O chat executivo está disponível.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <DirectorChatModal
            director="chro"
            title="Conversar com CHRO"
            subtitle="Chat executivo focado em RH (solicitações, carga, riscos)."
            buttonClassName="bg-orange-600 hover:bg-orange-700"
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
            type="users"
            title="RH com dados reais"
            description="O CHRO Virtual usa eventos/tarefas/solicitações reais como contexto quando disponíveis. Para painéis completos, ligamos às fontes de RH (solicitações, performance, carreira) em dados reais."
            animated={false}
            action={{ label: 'Abrir Solicitações', onClick: () => (window.location.href = '/admin/solicitacoes') }}
            secondaryAction={{ label: 'Abrir RH', onClick: () => (window.location.href = '/admin/rh') }}
          />
        </div>
      </div>
    </div>
  );
}




