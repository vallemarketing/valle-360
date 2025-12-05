'use client'

import { useState } from 'react'
import { ColaboradorHeader } from '@/components/layout/ColaboradorHeader'
import { ColaboradorSidebar } from '@/components/layout/ColaboradorSidebar'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { useIsMobile } from '@/hooks/useIsMobile'
import { Menu } from 'lucide-react'

export default function ColaboradorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isMobile = useIsMobile()

  return (
    <ProtectedRoute 
      allowedRoles={[
        'employee',      // Role no banco de dados (users.role)
        'colaborador',   // Role normalizado no sistema
        'super_admin'    // Super admin também pode acessar
      ]}
    >
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header com botão de menu mobile */}
        <ColaboradorHeader onMenuClick={() => setMobileMenuOpen(true)} />
        
        {/* Sidebar Desktop */}
        <div className="hidden lg:block">
          <ColaboradorSidebar />
        </div>
        
        {/* Sidebar Mobile */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-[280px]">
            <ColaboradorSidebar />
          </SheetContent>
        </Sheet>
        
        {/* Main Content - Responsivo */}
        <main className="lg:ml-64 pt-[73px] min-h-screen transition-all duration-300">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
