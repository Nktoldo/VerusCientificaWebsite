import { NextResponse } from 'next/server';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

const MAX_BYTES = 10 * 1024 * 1024;
const MAX_REDIRECTS = 3;
const TIMEOUT_MS = 15000;

class ImportError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

async function getEmailFromToken(idToken: string): Promise<string | null> {
  const resposta = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    }
  );
  if (!resposta.ok) return null;
  const dados = await resposta.json();
  return dados.users?.[0]?.email ?? null;
}

async function isAdminInDatabase(email: string, idToken: string): Promise<boolean> {
  const params = new URLSearchParams({
    orderBy: '"email"',
    equalTo: JSON.stringify(email.toLowerCase()),
    auth: idToken
  });
  const databaseUrl = (process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || '').replace(/\/$/, '');
  const resposta = await fetch(`${databaseUrl}/adminEmails.json?${params}`);
  if (!resposta.ok) return false;
  const dados = await resposta.json();
  return Object.values(dados || {}).some((item: any) => item?.active === true);
}

// bloqueia endereços internos (rede local, loopback, metadados da nuvem)
function isPrivateAddress(ip: string): boolean {
  if (isIP(ip) === 4) {
    const [a, b] = ip.split('.').map(Number);
    return a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127);
  }
  const v6 = ip.toLowerCase();
  if (v6.startsWith('::ffff:')) {
    const v4 = v6.slice(7);
    return isIP(v4) === 4 ? isPrivateAddress(v4) : true;
  }
  return v6 === '::' || v6 === '::1' || /^f[cd]/.test(v6) || /^fe[89ab]/.test(v6);
}

async function validarUrl(urlString: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(urlString);
  } catch {
    throw new ImportError('Link inválido');
  }

  if (url.protocol !== 'https:') {
    throw new ImportError('Apenas links https são aceitos');
  }
  if (url.port && url.port !== '443') {
    throw new ImportError('Porta não permitida');
  }

  const host = url.hostname.replace(/^\[|\]$/g, '');
  let enderecos: { address: string }[];
  try {
    enderecos = isIP(host) ? [{ address: host }] : await lookup(host, { all: true });
  } catch {
    throw new ImportError('Não foi possível encontrar o site do link');
  }
  if (enderecos.length === 0 || enderecos.some(e => isPrivateAddress(e.address))) {
    throw new ImportError('Endereço não permitido');
  }

  return url;
}

async function baixarImagem(urlString: string, signal: AbortSignal) {
  let url = await validarUrl(urlString);
  let resposta: Response;

  for (let redirects = 0; ; redirects++) {
    resposta = await fetch(url, {
      redirect: 'manual',
      signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VerusCientificaBot/1.0)',
        'Accept': 'image/avif,image/webp,image/png,image/jpeg,image/*;q=0.8'
      }
    });

    const location = resposta.headers.get('location');
    if (resposta.status >= 300 && resposta.status < 400 && location) {
      if (redirects >= MAX_REDIRECTS) {
        throw new ImportError('Redirecionamentos demais');
      }
      url = await validarUrl(new URL(location, url).toString());
      continue;
    }
    break;
  }

  if (!resposta.ok) {
    throw new ImportError(`O site respondeu com erro ${resposta.status}`);
  }

  const tipo = (resposta.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  if (!tipo.startsWith('image/') || tipo === 'image/svg+xml') {
    throw new ImportError('O link não aponta para uma imagem');
  }

  if (Number(resposta.headers.get('content-length') || 0) > MAX_BYTES) {
    throw new ImportError('Imagem maior que 10 MB', 413);
  }

  const reader = resposta.body?.getReader();
  if (!reader) {
    throw new ImportError('Resposta sem conteúdo');
  }

  const partes: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > MAX_BYTES) {
      await reader.cancel();
      throw new ImportError('Imagem maior que 10 MB', 413);
    }
    partes.push(value);
  }

  return { bytes: Buffer.concat(partes), tipo };
}

export async function POST(req: Request) {
  const idToken = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!idToken) {
    return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 });
  }

  const email = await getEmailFromToken(idToken).catch(() => null);
  if (!email || !(await isAdminInDatabase(email, idToken).catch(() => false))) {
    return NextResponse.json({ erro: 'Acesso negado' }, { status: 403 });
  }

  const { url } = await req.json().catch(() => ({ url: null }));
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ erro: 'Link é obrigatório' }, { status: 400 });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const { bytes, tipo } = await baixarImagem(url, controller.signal);
    return new NextResponse(bytes, { headers: { 'Content-Type': tipo } });
  } catch (err) {
    if (err instanceof ImportError) {
      return NextResponse.json({ erro: err.message }, { status: err.status });
    }
    if (err instanceof Error && err.name === 'AbortError') {
      return NextResponse.json({ erro: 'Tempo esgotado ao baixar a imagem' }, { status: 408 });
    }
    return NextResponse.json({ erro: 'Não foi possível baixar a imagem' }, { status: 502 });
  } finally {
    clearTimeout(timeoutId);
  }
}
