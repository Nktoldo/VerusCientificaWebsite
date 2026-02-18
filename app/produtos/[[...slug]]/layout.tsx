import type { Metadata } from "next";
import { ReactNode } from "react";
import { generateCanonicalUrl } from '@/lib/canonicalUtils';
import * as firebaseFunctions from '@/lib/databaseFunctions';
import { Noto_Sans_JP } from 'next/font/google';
import NavBar from '../../components/NavBar';

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  variable: '--font-noto-sans-jp',
});

// função para gerar metadados dinâmicos
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const slugArray = slug || [];
  const canonicalUrl = generateCanonicalUrl(slugArray);
  
  // gerar título baseado no nível da página
  let title = 'Produtos - Verus Científica';
  let description = 'Equipamentos para laboratório - Verus Científica';
  
  if (slugArray.length > 0) {
    try {
      let realTitle = '';
      
      // buscar categoria (primeiro segmento)
      if (slugArray.length >= 1) {
        const categories = await firebaseFunctions.getCategories();
        const category = categories?.find((c: any) => c.id === slugArray[0]);
        realTitle = category?.title || slugArray[0];
      }
      
      // buscar subcategoria (segundo segmento)
      if (slugArray.length >= 2) {
        const subcategories = await firebaseFunctions.getSubCategories({ category: slugArray[0] });
        const subcategory = subcategories?.find((s: any) => s.id === slugArray[1]);
        if (subcategory) {
          realTitle += ` - ${subcategory.title}`;
        } else {
          realTitle += ` - ${slugArray[1]}`;
        }
      }
      
      // buscar produto (terceiro segmento)
      if (slugArray.length >= 3) {
        const product = await firebaseFunctions.getProductById({ id: slugArray[2] });
        if (product) {
          realTitle = `${product.title} - ${realTitle}`;
          description = product.description ? 
            `${product.description.substring(0, 150)}...` : 
            `Equipamento ${product.title} para laboratório - Verus Científica`;
        }
      }
      
      if (realTitle) {
        title = `${realTitle} - Verus Científica`;
        description = `Equipamentos ${realTitle.toLowerCase()} para laboratório - Verus Científica`;
      }
    } catch (error) {
      // fallback para o slug formatado
      const lastSegment = slugArray[slugArray.length - 1];
      title = `${lastSegment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} - Verus Científica`;
      description = `Equipamentos ${lastSegment.replace(/-/g, ' ')} para laboratórios - Verus Científica`;
    }
  }
  
  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website'
    }
  };
}

export default async function Produtos({
  children,
  params,
}: {
  params: Promise<{ slug?: string[] }>;
  children: ReactNode;
}) {
  const { slug } = await params;
  const path = slug && slug.length > 0 ? `produtos/${slug.join("/")}` : "produtos";
  
  // buscar títulos dos itens para o breadcrumb
  const breadcrumbTitles: string[] = [];
  
  if (slug && slug.length > 0) {
    try {
      // buscar categoria (primeiro segmento)
      if (slug.length >= 1) {
        const categories = await firebaseFunctions.getCategories();
        const category = categories?.find((c: any) => c.id === slug[0]);
        if (category) {
          breadcrumbTitles.push(category.title);
        } else {
          breadcrumbTitles.push(slug[0]);
        }
      }
      
      // buscar subcategoria (segundo segmento)
      if (slug.length >= 2) {
        const subcategories = await firebaseFunctions.getSubCategories({ category: slug[0] });
        const subcategory = subcategories?.find((s: any) => s.id === slug[1]);
        if (subcategory) {
          breadcrumbTitles.push(subcategory.title);
        } else {
          breadcrumbTitles.push(slug[1]);
        }
      }
      
      // buscar produto (terceiro segmento)
      if (slug.length >= 3) {
        const product = await firebaseFunctions.getProductById({ id: slug[2] });
        if (product) {
          breadcrumbTitles.push(product.title);
        } else {
          breadcrumbTitles.push(slug[2]);
        }
      }
    } catch (error) {
      // fallback para os slugs
      breadcrumbTitles.push(...slug);
    }
  }

  return (
    <div className="w-full min-h-screen flex flex-col pt-20 sm:pt-24 pb-10 sm:pb-12">
      <NavBar />
      {/* cabeçalho com breadcrumb */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 py-4 sm:py-6">
        <div className="flex justify-center items-center flex-col px-4" >
          <a href="/produtos" className="group">
            <h1 className={`${notoSansJP.variable} font-sans text-2xl sm:text-3xl group-hover:text-blue-600 transition-colors duration-200`}>Produtos</h1>
          </a>
          
          {/* breadcrumb */}
          {slug && slug.length > 0 && (
            <nav className="flex items-center gap-1 sm:gap-2 mt-2 text-xs sm:text-sm text-slate-600 overflow-x-auto max-w-full">
              <a 
                href="/produtos" 
                className="flex items-center gap-1 hover:text-blue-600 transition-colors duration-200 whitespace-nowrap"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
                <span className="hidden sm:inline">Início</span>
                <span className="sm:hidden">Início</span>
              </a>
              
              {breadcrumbTitles.map((title, index) => (
                <div key={index} className="flex items-center gap-1 sm:gap-2">
                  <svg className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  
                  {index === breadcrumbTitles.length - 1 ? (
                    <span className="font-medium text-blue-600 bg-blue-50 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap">
                      {title}
                    </span>
                  ) : (
                    <a 
                      href={`/produtos/${slug?.slice(0, index + 1).join('/')}`}
                      className="hover:text-blue-600 transition-colors duration-200 text-xs sm:text-sm whitespace-nowrap"
                    >
                      {title}
                    </a>
                  )}
                </div>
              ))}
            </nav>
          )}
        </div>
      </div>
      
      {/* conteúdo principal */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}