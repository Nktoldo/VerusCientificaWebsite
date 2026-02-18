'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { verusData } from "@/public/data/meta/verusData"
import Image from "next/image"
import Button from "./Button"

export default function NavBar() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const handleNavigation = () => {
        // fechar menu mobile quando navegar
        setMobileMenuOpen(false);
    };

    // garantir que componente seja renderizado de forma consistente
    if (!mounted) {
        return (
            <nav className={`
                bg-[rgba(0,0,0,0.15)] 
                shadow-[0_4px_30px_rgba(0,0,0,0.2)]
                backdrop-blur-xl 
                backdrop-brightness-125 
                backdrop-contrast-125 
                backdrop-saturate-150 
                border-t border-l border-[rgba(255,255,255,0.3)]
                border-b border-r border-[rgba(255,255,255,0.1)]
                justify-between 
                flex 
                rounded-2xl
                mt-5 
                h-15 
                px-3 
                items-center 
                align-baseline 
                fixed 
                top-1 
                left-5 
                right-5 
                z-50
            `}>
                <div>
                    <Link href="/" className="flex items-center gap-2">
                        <div className="relative h-8 w-auto aspect-[1/1]">
                            <Image
                                aria-hidden
                                alt="Logo"
                                src="/assets/logo.png"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                        <h1 className="font-bold text-shadow-strong text-white">
                            {verusData.title}
                        </h1>
                    </Link>
                </div>
                
                {/* navegação desktop */}
                <div className="hidden md:flex justify-around gap-15">
                    <Link href="/linhas" className="hover:scale-96 duration-200" onClick={handleNavigation}>
                        <p className="font-bold text-shadow-strong text-white">Nossas Linhas</p>
                    </Link>
                    <Link href="/produtos" className="hover:scale-96 duration-200" onClick={handleNavigation}>
                        <p className="font-bold text-shadow-strong text-white">Produtos</p>
                    </Link>
                    <Link href="/sobre" className="hover:scale-96 duration-200" onClick={handleNavigation}>
                        <p className="font-bold text-shadow-strong text-white">Sobre</p>
                    </Link>
                    <Link href="/orcamento" className="hover:scale-96 duration-200" onClick={handleNavigation}>
                        <p className="font-bold text-shadow-strong text-white">Contato</p>
                    </Link>
                </div>
                
                {/* botão desktop */}
                <div className="hidden md:block">
                    <Link href="/orcamento">
                        <span className="inline-block bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg text-sm shadow-md hover:bg-blue-700 transition-colors duration-200">
                            Solicite Orçamento
                        </span>
                    </Link>
                </div>

                {/* botão menu mobile */}
                <div className="lg:hidden">
                    <button
                        onClick={toggleMobileMenu}
                        className="text-white p-2"
                        aria-label="Toggle mobile menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {mobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </nav>
        );
    }

    const isProductsPage = pathname.startsWith('/produtos');
    
    return (
        <>
            <nav className={`
                bg-[rgba(0,0,0,0.15)] 
                shadow-[0_4px_30px_rgba(0,0,0,0.2)]
                backdrop-blur-xl 
                backdrop-brightness-125 
                backdrop-contrast-125 
                backdrop-saturate-150 
                border-t border-l border-[rgba(255,255,255,0.3)]
                border-b border-r border-[rgba(255,255,255,0.1)]
                justify-between 
                flex 
                rounded-2xl
                mt-5 
                h-15 
                px-3 
                items-center 
                align-baseline 
                fixed 
                top-1 
                left-5 
                right-5 
                z-50
            `}>
                <div>
                    <Link href="/" className="flex items-center gap-2">
                        <div className="relative h-8 w-auto aspect-[1/1]">
                            <Image
                                aria-hidden
                                alt="Logo"
                                src="/assets/logo.png"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <h1 className={`font-bold ${isProductsPage ? 'text-black' : 'text-shadow-strong text-white'}`}>
                            {verusData.title}
                        </h1>
                    </Link>
                </div>
                
                {/* navegação desktop */}
                <div className="hidden md:flex justify-around gap-15">
                    <Link href="/#linhas" scroll={true} className="hover:scale-96 duration-200" onClick={handleNavigation}>
                        <p className={`font-bold ${isProductsPage ? 'text-black' : 'text-shadow-strong text-white'}`}>
                            Nossas Linhas
                        </p>
                    </Link>
                    <Link href="/produtos" className="hover:scale-96 duration-200" onClick={handleNavigation}>
                        <p className={`font-bold ${isProductsPage ? 'text-black' : 'text-shadow-strong text-white'}`}>
                            Produtos
                        </p>
                    </Link>
                    <Link href="/#sobre" scroll={true} className="hover:scale-96 duration-200" onClick={handleNavigation}>
                        <p className={`font-bold ${isProductsPage ? 'text-black' : 'text-shadow-strong text-white'}`}>
                            Sobre
                        </p>
                    </Link>
                    <Link href="/orcamento" className="hover:scale-96 duration-200" onClick={handleNavigation}>
                        <p className={`font-bold ${isProductsPage ? 'text-black' : 'text-shadow-strong text-white'}`}>
                            Contato
                        </p>
                    </Link>
                </div>
                
                {/* botão desktop */}
                <div className="hidden md:block">
                    <Link href="/orcamento">
                        <span className="inline-block bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg text-sm shadow-md hover:bg-blue-700 hover:border-2 transition-all duration-300 transform hover:scale-105 will-change-transform">
                            Solicite Orçamento
                        </span>
                    </Link>
                </div>

                {/* botão menu mobile */}
                <div className="md:hidden">
                    <button
                        onClick={toggleMobileMenu}
                        className={`p-2 border-2 rounded-lg transition-colors duration-200
                            ${isProductsPage ? 'border-black text-black bg-white/80' : 'border-white text-white bg-black/20'}
                            hover:bg-white hover:text-blue-700`}
                        aria-label="Toggle mobile menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {mobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </nav>

            {/* overlay menu mobile */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={toggleMobileMenu}>
                    <div className="absolute top-20 left-5 right-5 bg-white rounded-2xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col space-y-4">
                            <Link 
                                href="/#linhas" 
                                className="text-gray-900 font-semibold py-2 hover:text-blue-600 transition-colors"
                                onClick={handleNavigation}
                            >
                                Nossas Linhas
                            </Link>
                            <Link 
                                href="/produtos" 
                                className="text-gray-900 font-semibold py-2 hover:text-blue-600 transition-colors"
                                onClick={handleNavigation}
                            >
                                Produtos
                            </Link>
                            <Link 
                                href="/#sobre" 
                                className="text-gray-900 font-semibold py-2 hover:text-blue-600 transition-colors"
                                onClick={handleNavigation}
                            >
                                Sobre
                            </Link>
                            <Link 
                                href="/orcamento" 
                                className="text-gray-900 font-semibold py-2 hover:text-blue-600 transition-colors"
                                onClick={handleNavigation}
                            >
                                Contato
                            </Link>
                            <div className="pt-4 border-t border-gray-200">
                                <Link 
                                    href="/orcamento" 
                                    className="block w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg text-center hover:bg-blue-700 transition-colors"
                                    onClick={handleNavigation}
                                >
                                    Solicite Orçamento
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}