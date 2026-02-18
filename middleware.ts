import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// rotas que requerem autenticação
const protectedRoutes = ['/editor'];

// rotas que requerem admin
const adminRoutes = ['/editor'];

export function middleware(request: NextRequest) {
  const { pathname, host } = request.nextUrl;

  // redireciona do domínio Firebase para o domínio personalizado
  if (host.includes('veruswebsitedh.web.app') || host.includes('firebaseapp.com')) {
    const url = request.nextUrl.clone();
    url.host = 'www.veruscientifica.com.br';
    url.protocol = 'https';
    
    return NextResponse.redirect(url, 301);
  }

  // verifica se a rota exige autenticação
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    return NextResponse.next();
  }

  // adiciona headers de segurança e SEO
  const response = NextResponse.next();
  
  // header canonical
  response.headers.set('Link', `<https://www.veruscientifica.com.br${pathname}>; rel="canonical"`);
  
  // cache para páginas estáticas
  if (pathname === '/' || pathname === '/produtos') {
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|assets|api).*)',
  ],
};
