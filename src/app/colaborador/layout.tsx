'use client'

import { ColaboradorHeader } from '@/components/layout/ColaboradorHeader'
import { ColaboradorSidebar } from '@/components/layout/ColaboradorSidebar'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function ColaboradorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute 
      allowedRoles={[
        'employee',      // Role no banco de dados (users.role)
        'colaborador',   // Role normalizado no sistema
        'super_admin'    // Super admin também pode acessar
      ]}
    >
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <ColaboradorHeader />
        <ColaboradorSidebar />
        <main className="ml-64 pt-[73px]">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}
