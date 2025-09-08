import { Noto_Sans_JP } from 'next/font/google';
import { ReactNode } from 'react';
import Image from "next/image";
import NavBar from '@/app/components/NavBar';

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-jp',
});


export default async function Produtos({
  children,
  params,
}: {
  params: Promise<{ slug?: string[] }>;
  children: ReactNode;
}) {
  const { slug } = await params;
  const path = slug && slug.length > 0 ? `products/${slug.join("/")}` : "products";

  return (
    <main className="mt-24 min-h-screen">
      <NavBar />
      <div className='mb-5'>
        <div className="flex justify-center items-center flex-col" >
          <a href="/products" className="group">
            <h1 className={`${notoSansJP.variable} font-sans text-3xl group-hover:text-blue-600 transition-colors duration-200`}>Produtos</h1>
          </a>
          
          {/* Breadcrumb moderno */}
          {slug && slug.length > 0 && (
            <nav className="flex items-center gap-2 mt-2 text-sm text-slate-600">
              <a 
                href="/products" 
                className="flex items-center gap-1 hover:text-blue-600 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
                Início
              </a>
              
              {slug.map((segment, index) => (
                <div key={index} className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  
                  {index === slug.length - 1 ? (
                    <span className="font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                      {segment}
                    </span>
                  ) : (
                    <a 
                      href={`/products/${slug.slice(0, index + 1).join('/')}`}
                      className="hover:text-blue-600 transition-colors duration-200 capitalize"
                    >
                      {segment}
                    </a>
                  )}
                </div>
              ))}
            </nav>
          )}
        </div>
      </div>
      <div className="px-10 flex justify-center items-center align-middle">
        {children}
      </div>
    </main>
  );
}