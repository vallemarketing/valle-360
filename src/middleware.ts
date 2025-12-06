/**
 * Valle 360 - Middleware DESABILITADO PARA TESTES
 * 
 * Este middleware está completamente desabilitado.
 * Para reativar a segurança em produção, restaure o código original.
 */

import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // MIDDLEWARE COMPLETAMENTE DESABILITADO PARA TESTES
  // Não faz absolutamente nada - apenas passa adiante
  return NextResponse.next();
}

// Matcher vazio = middleware não processa nenhuma rota
export const config = {
  matcher: [],
};

