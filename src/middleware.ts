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

// Headers de segurança (mínimos para não interferir)
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get('origin');

  // Criar resposta base
  const response = NextResponse.next();

  // =========================================
  // 1. Headers de Segurança mínimos
  // =========================================
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // =========================================
  // 2. CORS - Permitir todas as origens em teste
  // =========================================
  if (pathname.startsWith('/api/')) {
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With',
          'Access-Control-Max-Age': '86400',
        },
      });
    }
    response.headers.set('Access-Control-Allow-Origin', '*');
  }

  // =========================================
  // 3. MODO TESTE: Não bloquear NADA
  // Apenas adiciona headers e passa adiante
  // A autenticação é feita nos componentes/páginas
  // =========================================
  if (TEST_MODE) {
    return response;
  }

  // =========================================
  // 4. MODO PRODUÇÃO (quando TEST_MODE = false)
  // =========================================
  // Rotas públicas
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/auth', '/_next', '/favicon.ico', '/icons', '/Logo', '/images', '/api/auth', '/api/webhooks'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route) || pathname === '/');
  
  if (isPublicRoute) {
    return response;
  }

  try {
    const supabase = createMiddlewareClient({ req: request, res: response });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

  } catch (error) {
    console.error('Middleware error:', error);
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

