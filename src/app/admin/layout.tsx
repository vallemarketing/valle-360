'use client';

import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={['super_admin']} redirectTo="/login">
      <div className="min-h-screen bg-gradient-to-br from-valle-silver-50 to-white">
        <AdminSidebar />

        <main className="md:ml-72 min-h-screen">
          <div className="pt-20 md:pt-6 px-4 md:px-8 pb-8">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
