import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// páginas administrativas: o acesso aos dados é barrado pelas regras do Firebase
const adminRoutes = ['/editor', '/login'];

export function middleware(request: NextRequest) {
  const { pathname, host } = request.nextUrl;

  // redireciona do domínio Firebase para o domínio personalizado
  if (host.includes('veruswebsitedh.web.app') || host.includes('firebaseapp.com')) {
    const url = request.nextUrl.clone();
    url.host = 'www.veruscientifica.com.br';
    url.protocol = 'https';
    
    return NextResponse.redirect(url, 301);
  }

  // páginas administrativas: sem cache e fora dos buscadores
  const isAdminRoute = adminRoutes.some(route =>
    pathname.startsWith(route)
  );

  if (isAdminRoute) {
    const adminResponse = NextResponse.next();
    adminResponse.headers.set('Cache-Control', 'no-store');
    adminResponse.headers.set('X-Robots-Tag', 'noindex, nofollow');
    return adminResponse;
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
