'use client';

import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { User, Settings, LogOut } from 'lucide-react';
import { useState } from 'react';
import { signOut } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['cliente']}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-16">
      <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between h-16 px-4 max-w-screen-xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-valle-blue-600 to-valle-blue-700 rounded-lg flex items-center justify-center shadow-md border-2 border-valle-blue-200">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <h1 className="text-xl font-bold text-valle-navy-900 dark:text-white">
              Valle 360
            </h1>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-valle-blue-50 dark:hover:bg-valle-navy-800 transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-valle-blue-500 to-valle-blue-600 rounded-full flex items-center justify-center border-2 border-white dark:border-valle-navy-900 shadow-md hover:shadow-lg transition-all">
                <User className="w-5 h-5 text-white" />
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                <button
                  onClick={() => {
                    router.push('/cliente/perfil');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <Settings className="w-4 h-4 text-valle-steel" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Meu Perfil
                  </span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Sair</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {children}
      </main>

      <BottomNavigation />
      <EditProfileModal open={showEditProfile} onOpenChange={setShowEditProfile} />
    </div>
    </ProtectedRoute>
  );
}
