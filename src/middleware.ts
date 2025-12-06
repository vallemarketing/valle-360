/**
 * Valle 360 - Middleware Principal
 * Proteção de rotas, segurança e headers
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// Headers de segurança
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
};

// Rotas públicas (não requerem autenticação)
const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/auth/callback',
  '/api/auth',
  '/api/webhooks',
  '/_next',
  '/favicon.ico',
  '/icons',
  '/Logo',
  '/images',
];

// Rotas de API que requerem rate limiting
const rateLimitedRoutes = [
  '/api/v1/',
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
  let response = NextResponse.next();

  // =========================================
  // 1. CORS para requisições de API
  // =========================================
  if (pathname.startsWith('/api/')) {
    // Preflight request
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With',
          'Access-Control-Max-Age': '86400',
          'Access-Control-Allow-Credentials': 'true',
        },
      });
    }

    // Adicionar headers CORS às respostas de API
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
    }
  }

  // =========================================
  // 2. Headers de Segurança
  // =========================================
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

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
  // 4. Autenticação via Supabase
  // =========================================
  try {
    const supabase = createMiddlewareClient({ req: request, res: response });
    const { data: { session } } = await supabase.auth.getSession();

    // Se não tem sessão, redirecionar para login
    if (!session) {
      // Se é API, retornar 401
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'unauthorized', message: 'Authentication required' },
          { status: 401, headers: Object.fromEntries(response.headers) }
        );
      }

      // Redirecionar para login com URL de retorno
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // =========================================
    // 5. Verificar permissões de rota
    // NOTA: Em ambiente de teste, super_admin tem acesso total
    // =========================================
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    const userRole = userProfile?.role || 'user';

    // Super admin tem acesso a TODAS as áreas
    if (userRole === 'super_admin') {
      return response;
    }

    // Rotas de admin - apenas super_admin
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/cliente/dashboard', request.url));
    }

    // Rotas de cliente
    if (pathname.startsWith('/cliente')) {
      if (userRole !== 'cliente') {
        return NextResponse.redirect(new URL('/colaborador/dashboard', request.url));
      }
    }

    // Rotas de colaborador
    if (pathname.startsWith('/colaborador')) {
      const allowedRoles = ['employee', 'colaborador'];
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }

  } catch (error) {
    console.error('Middleware auth error:', error);
    
    // Em caso de erro durante teste, permitir acesso
    // TODO: Em produção, ser mais restritivo
  }

  return response;
}

// Configurar quais rotas o middleware deve processar
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

