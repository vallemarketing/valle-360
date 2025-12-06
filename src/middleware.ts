/**
 * Valle 360 - Middleware Principal
 * Proteção de rotas, segurança e headers
 * 
 * MODO: TESTE - Verificação de roles desabilitada
 * Para produção, descomentar a seção de verificação de permissões
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// =========================================
// CONFIGURAÇÃO: Modo de teste (sem bloqueio de roles)
// Mudar para false em produção
// =========================================
const TEST_MODE = true;

// Headers de segurança
const securityHeaders = {
  'X-Frame-Options': 'SAMEORIGIN', // Permite iframes do mesmo domínio
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
};

// Rotas públicas (não requerem autenticação)
const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/auth/callback',
  '/auth',
  '/api/auth',
  '/api/webhooks',
  '/api/health',
  '/_next',
  '/favicon.ico',
  '/icons',
  '/Logo',
  '/images',
  '/public',
];

// Origens permitidas para CORS
const allowedOrigins = [
  'https://valle360.com',
  'https://app.valle360.com',
  'https://valle-360-platform-guilherme-valles-projects.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get('origin');

  // Criar resposta base
  const response = NextResponse.next();

  // =========================================
  // 1. Headers de Segurança (sempre aplicados)
  // =========================================
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // =========================================
  // 2. CORS para requisições de API
  // =========================================
  if (pathname.startsWith('/api/')) {
    // Preflight request
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origin && allowedOrigins.includes(origin) ? origin : '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With',
          'Access-Control-Max-Age': '86400',
          'Access-Control-Allow-Credentials': 'true',
        },
      });
    }

    // Adicionar headers CORS às respostas de API
    response.headers.set('Access-Control-Allow-Origin', origin || '*');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  // =========================================
  // 3. Verificar rotas públicas
  // =========================================
  const isPublicRoute = publicRoutes.some(route => 
    pathname.startsWith(route) || pathname === '/'
  );

  if (isPublicRoute) {
    return response;
  }

  // =========================================
  // 4. MODO TESTE: Permitir todo acesso autenticado
  // =========================================
  if (TEST_MODE) {
    // Em modo teste, apenas verifica se tem sessão
    // Não bloqueia por role
    try {
      const supabase = createMiddlewareClient({ req: request, res: response });
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Sem sessão em rota de API = 401
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { error: 'unauthorized', message: 'Authentication required' },
            { status: 401 }
          );
        }
        // Sem sessão em rota protegida = redirecionar para login
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirectTo', pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Sessão válida = permitir acesso
      return response;

    } catch (error) {
      // Erro no middleware = permitir acesso em modo teste
      console.error('Middleware error (allowing access in test mode):', error);
      return response;
    }
  }

  // =========================================
  // 5. MODO PRODUÇÃO: Verificação completa de permissões
  // (Este código só executa quando TEST_MODE = false)
  // =========================================
  try {
    const supabase = createMiddlewareClient({ req: request, res: response });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'unauthorized', message: 'Authentication required' },
          { status: 401 }
        );
      }
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verificar role do usuário
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    const userRole = userProfile?.role || 'user';

    // Super admin tem acesso total
    if (userRole === 'super_admin') {
      return response;
    }

    // Verificar permissões por rota
    if (pathname.startsWith('/admin') && userRole !== 'super_admin') {
      return NextResponse.redirect(new URL('/cliente/dashboard', request.url));
    }

    if (pathname.startsWith('/cliente') && !['cliente', 'super_admin'].includes(userRole)) {
      return NextResponse.redirect(new URL('/colaborador/dashboard', request.url));
    }

    if (pathname.startsWith('/colaborador') && !['employee', 'colaborador', 'super_admin'].includes(userRole)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

  } catch (error) {
    console.error('Middleware auth error:', error);
  }

  return response;
}

// Configurar quais rotas o middleware deve processar
export const config = {
  matcher: [
    /*
     * Processar apenas rotas que não são arquivos estáticos
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};

