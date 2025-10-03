import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas que requerem autenticação
const protectedRoutes = ['/editor'];

// Rotas que requerem admin
const adminRoutes = ['/editor'];

export function middleware(request: NextRequest) {
  const { pathname, host } = request.nextUrl;

  // REDIRECIONAMENTO CRÍTICO: Firebase para domínio personalizado
  // Se o host for o domínio do Firebase, redirecionar para o domínio personalizado
  if (host.includes('veruswebsitedh.web.app') || host.includes('firebaseapp.com')) {
    const url = request.nextUrl.clone();
    url.host = 'www.veruscientifica.com.br';
    url.protocol = 'https';
    
    console.log(`🔄 Redirecionando de ${host} para www.veruscientifica.com.br`);
    
    return NextResponse.redirect(url, 301); // Redirecionamento permanente
  }

  // Verificar se é uma rota protegida
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // Redirecionar para login se não estiver autenticado
    // O hook useRequireAuth fará a verificação real no cliente
    return NextResponse.next();
  }

  // Adicionar header canonical para todas as páginas
  const response = NextResponse.next();
  response.headers.set('Link', `<https://www.veruscientifica.com.br${pathname}>; rel="canonical"`);

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|assets|api).*)',
  ],
};
