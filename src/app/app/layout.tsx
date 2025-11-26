'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={['colaborador', 'super_admin']}>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1">
          <div className="border-b border-border px-6 py-4 bg-valle-navy/50 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-foreground">Área Interna</h2>
          </div>
          <div className="p-6">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
