// app/api/html/route.ts (em Next.js 13+)
import { NextResponse } from 'next/server';

// Lista de domínios permitidos para segurança
const ALLOWED_DOMAINS = [
  'loccus.com.br',
  'www.loccus.com.br',
  'sartorius.com',
  'www.sartorius.com',
  'thermofisher.com',
  'www.thermofisher.com',
  'bio-rad.com',
  'www.bio-rad.com'
];

function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    
    // Verificar se é HTTPS
    if (url.protocol !== 'https:') {
      return false;
    }
    
    // Verificar se o domínio está na lista permitida
    const domain = url.hostname.toLowerCase();
    return ALLOWED_DOMAINS.some(allowedDomain => 
      domain === allowedDomain || domain.endsWith('.' + allowedDomain)
    );
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    // Validar URL
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ erro: "URL é obrigatória" }, { status: 400 });
    }

    if (!isValidUrl(url)) {
      return NextResponse.json({ 
        erro: "URL não permitida. Apenas domínios de fornecedores confiáveis são aceitos." 
      }, { status: 403 });
    }

    // Timeout de 10 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const resposta = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VerusCientificaBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    clearTimeout(timeoutId);

    if (!resposta.ok) {
      return NextResponse.json({ 
        erro: `Erro HTTP: ${resposta.status} ${resposta.statusText}` 
      }, { status: 400 });
    }

    const html = await resposta.text();
    
    // Limitar tamanho do HTML (1MB)
    if (html.length > 1024 * 1024) {
      return NextResponse.json({ 
        erro: "HTML muito grande. Máximo 1MB permitido." 
      }, { status: 413 });
    }

    return NextResponse.json({ html });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return NextResponse.json({ erro: "Timeout ao buscar HTML" }, { status: 408 });
    }
    
    console.error('Erro ao buscar HTML:', err);
    return NextResponse.json({ 
      erro: "Erro interno do servidor" 
    }, { status: 500 });
  }
}
