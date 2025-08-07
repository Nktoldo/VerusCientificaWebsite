// app/api/html/route.ts (em Next.js 13+)
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { url } = await req.json();

  try {
    const resposta = await fetch(url);
    const html = await resposta.text();
    return NextResponse.json({ html });
  } catch (err) {
    return NextResponse.json({ erro: "Erro ao buscar HTML", detalhes: err }, { status: 500 });
  }
}
