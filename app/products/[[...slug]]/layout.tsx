import { Noto_Sans_JP } from 'next/font/google';
import { ReactNode } from 'react';
import Image from "next/image";
import NavBar from '@/app/components/NavBar';

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-jp',
});


export default function Produtos({
  children,
  params,
}: {
  params: any;
  children: ReactNode;
}) {
  const path = params?.slug ? `products/${params.slug.join("/")}` : "products";

  return (
    <main className="mt-24 min-h-screen">
      <NavBar />
      <div className='mb-5'>
        <div className="flex justify-center items-center flex-col" >
          <a href="/products">
            <h1 className={`${notoSansJP.variable} font-sans text-3xl`}>Produtos</h1>
          </a>
          <p className="text-sm text-gray-500 italic">{path}</p>
        </div>
      </div>
      <div className="px-10 flex justify-center items-center align-middle">
        {children}
      </div>
    </main>
  );
}