'use client'

import { Fragment, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ProductCard from '../components/ProductCard';
import * as firebaseFunctions from '@/lib/databaseFunctions';
import { verusData } from '@/public/data/meta/verusData';

const FORNECEDOR = 'Loccus';
const LOCCUS_BLUE = '#009FE3';

const LINKS = [
  { href: '/', label: 'Início' },
  { href: '/produtos', label: 'Produtos' },
  { href: '/#sobre', label: 'Sobre' },
  { href: '/orcamento', label: 'Orçamento' },
];

const ETAPAS = [
  {
    titulo: 'Preparo da amostra',
    categorias: [
      { id: 'Agitadores', nome: 'Agitadores' },
      { id: 'Centrifugas', nome: 'Centrífugas' },
      { id: 'Banhos', nome: 'Banhos' },
    ],
  },
  {
    titulo: 'Extração e purificação',
    categorias: [
      { id: 'Extracaoepurificacaodematerialgenetico', nome: 'Extração e purificação de material genético' },
      { id: 'ExtractaPrepdeacidosnucleicoseproteinas', nome: 'Extracta Prep' },
    ],
  },
  {
    titulo: 'Amplificação',
    categorias: [
      { id: 'PCR', nome: 'PCR' },
      { id: 'PCRemtemporeal', nome: 'PCR em tempo real' },
    ],
  },
  {
    titulo: 'Análise e sequenciamento',
    categorias: [
      { id: 'Eletroforese', nome: 'Eletroforese' },
      { id: 'AutomacaodeNGS', nome: 'Automação de NGS' },
    ],
  },
];

const VANTAGENS = [
  {
    titulo: 'Garantia de fábrica',
    texto: 'Equipamentos com garantia oficial Loccus, vendidos pelo representante autorizado no RS.',
  },
  {
    titulo: 'Entrega em todo o RS',
    texto: 'Atendemos laboratórios em todo o Rio Grande do Sul.',
  },
  {
    titulo: 'Atendimento direto',
    texto: 'Fale com a equipe pelo WhatsApp ou peça seu orçamento pelo site.',
  },
];

const WHATSAPP_URL = `https://api.whatsapp.com/send?phone=55${verusData.telefone_principal.replace(/\D/g, '')}&text=${encodeURIComponent('Olá! Estava na página da Loccus no site da Verus e gostaria de fazer um orçamento.')}`;

type Produto = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  category?: string;
  subcategory?: string;
  paths?: { category: string; subcategory: string }[];
  featured?: boolean;
};

type Linha = { id: string; title: string; count: number };

export default function LoccusClient() {
  const router = useRouter();
  const carrosselRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [destaques, setDestaques] = useState<Produto[]>([]);
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [totalProdutos, setTotalProdutos] = useState(0);
  const [categoriaIdPorChave, setCategoriaIdPorChave] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    Promise.all([
      firebaseFunctions.getProductsBySupplier(FORNECEDOR),
      firebaseFunctions.getCategories()
    ])
      .then(([produtos, categorias]) => {
        // produtos guardam a categoria pelo id ou pelo título
        const mapa = new Map<string, string>();
        categorias.forEach(c => {
          mapa.set(c.id, c.id);
          mapa.set(c.title, c.id);
        });

        const contagem = new Map<string, number>();
        (produtos as Produto[]).forEach(p => {
          const chaves = p.paths?.length ? p.paths.map(path => path.category) : [p.category];
          const ids = new Set(chaves.map(chave => mapa.get(chave || '')).filter((id): id is string => !!id));
          ids.forEach(id => contagem.set(id, (contagem.get(id) || 0) + 1));
        });

        setCategoriaIdPorChave(mapa);
        setTotalProdutos(produtos.length);
        setLinhas(
          categorias
            .filter(c => contagem.has(c.id))
            .map(c => ({ id: c.id, title: c.title, count: contagem.get(c.id) || 0 }))
            .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title))
        );
        setDestaques(
          (produtos as Produto[])
            .filter(p => p.featured === true)
            .sort((a, b) => (a.title || '').localeCompare(b.title || ''))
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const urlDoProduto = (produto: Produto) => {
    const path = produto.paths?.[0];
    const categoria = categoriaIdPorChave.get(path?.category || produto.category || '');
    const subcategoria = path?.subcategory || produto.subcategory;
    return categoria && subcategoria
      ? `/produtos/${categoria}/${subcategoria}/${produto.id}`
      : `/search?q=${encodeURIComponent(produto.title)}`;
  };

  const rolar = (direcao: number) => {
    const carrossel = carrosselRef.current;
    carrossel?.scrollBy({ left: direcao * carrossel.clientWidth, behavior: 'smooth' });
  };

  return (
    <div className="w-full bg-white">
      <header className="relative">
        <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white rounded-b-[50%] pt-5 pb-16 sm:pb-20 px-4 shadow-lg">
          <nav className="flex justify-center gap-5 sm:gap-12 text-sm sm:text-base font-semibold">
            {LINKS.map(link => (
              <Link key={link.href} href={link.href} className="opacity-90 hover:opacity-100 hover:underline underline-offset-4">
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="mt-5 text-center text-lg sm:text-2xl font-bold tracking-wide">{verusData.title}</p>
        </div>
        <Link
          href="/"
          aria-label={`${verusData.title} - início`}
          className="absolute left-1/2 -translate-x-1/2 -bottom-10 sm:-bottom-12 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white shadow-xl flex items-center justify-center"
        >
          <Image src="/assets/logo.png" alt={verusData.title} width={64} height={64} priority className="w-14 h-14 sm:w-16 sm:h-16 object-contain" />
        </Link>
      </header>

      <section className="px-4 pt-20 sm:pt-24 pb-12 text-center max-w-3xl mx-auto">
        <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Representante oficial no Rio Grande do Sul
        </p>
        <h1 className="mt-3 text-5xl sm:text-7xl font-bold tracking-tight" style={{ color: LOCCUS_BLUE }}>
          Loccus
        </h1>
        <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed">
          A Loccus é uma das principais fabricantes de equipamentos para laboratório do Brasil, reconhecida pela
          qualidade e inovação. Como representante oficial, a {verusData.title} oferece toda a linha com garantia
          de fábrica, suporte técnico especializado e entrega em todo o Rio Grande do Sul.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/search?q=${FORNECEDOR}`}
            className="px-6 py-3 rounded-lg text-white font-semibold shadow-md hover:opacity-90 transition"
            style={{ backgroundColor: LOCCUS_BLUE }}
          >
            Ver produtos Loccus
          </Link>
          <Link
            href="/orcamento"
            className="px-6 py-3 rounded-lg font-semibold border-2 border-slate-300 text-slate-700 hover:border-slate-400 transition"
          >
            Solicitar orçamento
          </Link>
        </div>
      </section>

      {(loading || destaques.length > 0) && (
        <section className="py-12 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 text-center">Equipamentos em destaque</h2>
            <div className="relative mt-6">
              <button
                type="button"
                aria-label="Anterior"
                onClick={() => rolar(-1)}
                className="hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white shadow-lg items-center justify-center text-slate-700 hover:text-blue-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div
                ref={carrosselRef}
                className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth py-6 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {loading
                  ? [0, 1, 2, 3].map(i => (
                      <div key={i} className="snap-start shrink-0 w-[80%] sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] aspect-[4/3] rounded-2xl bg-slate-200 animate-pulse" />
                    ))
                  : destaques.map(produto => (
                      <div key={produto.id} className="snap-start shrink-0 w-[80%] sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)]">
                        <ProductCard
                          name={produto.title}
                          subtitle={produto.subtitle || ''}
                          image={produto.imageUrl || ''}
                          onClick={() => router.push(urlDoProduto(produto))}
                        />
                      </div>
                    ))}
              </div>
              <button
                type="button"
                aria-label="Próximo"
                onClick={() => rolar(1)}
                className="hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white shadow-lg items-center justify-center text-slate-700 hover:text-blue-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="mt-4 text-center">
              <Link
                href={`/search?q=${FORNECEDOR}`}
                className="inline-block px-6 py-3 rounded-lg text-white font-semibold shadow-md hover:opacity-90 transition"
                style={{ backgroundColor: LOCCUS_BLUE }}
              >
                Ver produtos
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b-2 border-slate-900 pb-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Linhas Loccus</h2>
            <p className="text-sm text-slate-500">
              {loading
                ? 'Carregando o catálogo...'
                : linhas.length > 0
                  ? `${totalProdutos} produtos no catálogo, em ${linhas.length} linhas`
                  : 'Não foi possível carregar o catálogo agora.'}
            </p>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 md:gap-x-12">
            {loading
              ? [0, 1, 2, 3, 4, 5].map(i => (
                  <li key={i} className="border-b border-slate-200 py-4">
                    <div className="h-5 w-2/3 rounded bg-slate-100 animate-pulse" />
                  </li>
                ))
              : linhas.map(linha => (
                  <li key={linha.id} className="border-b border-slate-200">
                    <Link href={`/produtos/${linha.id}`} className="group flex items-baseline justify-between gap-4 py-4">
                      <span className="font-medium text-slate-800 group-hover:text-blue-700 transition-colors">{linha.title}</span>
                      <span className="shrink-0 text-sm text-slate-500 tabular-nums">
                        {linha.count} {linha.count === 1 ? 'produto' : 'produtos'}
                        <span aria-hidden className="ml-2 text-slate-400 group-hover:text-blue-700 transition-colors">→</span>
                      </span>
                    </Link>
                  </li>
                ))}
          </ul>
        </div>
      </section>

      <section className="py-16 px-4 bg-gradient-to-br from-blue-800 to-indigo-900 text-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center">Do preparo da amostra à análise</h2>
          <p className="mt-2 text-sky-100 text-center">A linha Loccus cobre todas as etapas do fluxo de biologia molecular.</p>
          <div className="mt-10 flex flex-col md:flex-row items-stretch gap-3">
            {ETAPAS.map((etapa, i) => (
              <Fragment key={etapa.titulo}>
                <div className="flex-1 rounded-2xl bg-white/10 border border-white/20 p-5">
                  <span className="inline-flex w-8 h-8 rounded-full bg-white text-blue-800 font-bold items-center justify-center">{i + 1}</span>
                  <h3 className="mt-3 text-lg font-bold">{etapa.titulo}</h3>
                  <ul className="mt-3 space-y-1.5">
                    {etapa.categorias.map(categoria => (
                      <li key={categoria.id}>
                        <Link href={`/produtos/${categoria.id}`} className="text-sky-100 hover:text-white hover:underline underline-offset-4">
                          {categoria.nome}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                {i < ETAPAS.length - 1 && (
                  <div aria-hidden className="flex items-center justify-center text-white/60">
                    <svg className="w-6 h-6 rotate-90 md:rotate-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Por que comprar com a {verusData.title}</h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            {VANTAGENS.map(vantagem => (
              <div key={vantagem.titulo} className="border-t-2 border-slate-900 pt-4">
                <h3 className="text-lg font-semibold text-slate-900">{vantagem.titulo}</h3>
                <p className="mt-2 text-slate-600 leading-relaxed">{vantagem.texto}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 text-center" style={{ background: `linear-gradient(135deg, ${LOCCUS_BLUE}, #1d4ed8)` }}>
        <h2 className="text-2xl sm:text-3xl font-bold text-white">Precisa de um equipamento Loccus?</h2>
        <p className="mt-3 text-sky-100">Fale com a nossa equipe e receba um orçamento.</p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-lg bg-white text-blue-700 font-semibold shadow hover:bg-sky-50 transition"
          >
            Falar no WhatsApp
          </a>
          <Link href="/orcamento" className="px-6 py-3 rounded-lg border-2 border-white text-white font-semibold hover:bg-white/10 transition">
            Solicitar orçamento
          </Link>
        </div>
      </section>
    </div>
  );
}
