'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, type UserRole } from '@/lib/auth';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export function ProtectedRoute({ children, allowedRoles, redirectTo = '/login' }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      console.log('🔐 ProtectedRoute: Iniciando verificação de autenticação...');
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e7496d7c-c166-4b65-854d-05abdab472d9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'components/auth/ProtectedRoute.tsx:21',message:'Checking auth',data:{allowedRoles},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'login-loop'})}).catch(()=>{});
      // #endregion

      const user = await getCurrentUser();
      console.log('👤 ProtectedRoute: Usuário retornado:', user);

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/e7496d7c-c166-4b65-854d-05abdab472d9',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'components/auth/ProtectedRoute.tsx:29',message:'User returned',data:{user},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'login-loop'})}).catch(()=>{});
      // #endregion

      if (!user) {
        console.log('❌ ProtectedRoute: Nenhum usuário encontrado');
        setDebugInfo({ error: 'No user found', allowedRoles });
        // Não redirecionar automaticamente para debug
        // router.push(redirectTo);
        return;
      }

      console.log('🔍 ProtectedRoute: Verificando se role', user.role, 'está em', allowedRoles);
      if (!allowedRoles.includes(user.role)) {
        console.log('❌ ProtectedRoute: Role', user.role, 'não autorizada.');
        setDebugInfo({ error: 'Role not authorized', userRole: user.role, allowedRoles });
        // Não redirecionar automaticamente para debug
        // router.push('/login');
        return;
      }

      console.log('✅ ProtectedRoute: Usuário autorizado!');
      setIsAuthorized(true);
    } catch (error: any) {
      console.error('❌ ProtectedRoute: Erro na verificação de auth:', error);
      setDebugInfo({ error: 'Exception', message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, [allowedRoles, redirectTo]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-8 h-8 border-4 border-valle-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500">Verificando permissões...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🚫</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h2>
          <p className="text-gray-600 mb-6">
            Você não tem permissão para acessar esta página.
          </p>
          
          {/* Debug Info */}
          <div className="bg-gray-100 p-4 rounded-lg text-left text-xs font-mono mb-6 overflow-auto max-h-40">
            <p><strong>Debug Info:</strong></p>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => router.push('/login')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              Voltar para Login
            </Button>
            <Button 
              onClick={checkAuth}
              variant="outline"
              className="w-full"
            >
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
