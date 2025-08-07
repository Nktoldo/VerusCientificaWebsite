"use client"
import Image from "next/image";
import Link from "next/link";
import { verusData } from "@/public/data/meta/verusData";
import { useEffect } from "react";
import Script from "next/script";

export default function Home() {
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      const el = document.getElementById(window.location.hash.replace("#", ""));
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
        }, 100); 
      }
    }
  }, []);

  // Dados estruturados para SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Verus Científica",
    "description": "Fornecemos equipamentos e produtos de alta qualidade para laboratórios no Rio Grande do Sul",
    "url": "https://veruscientifica.com.br",
    "logo": "https://veruscientifica.com.br/assets/logo.png",
    "address": {
      "@type": "PostalAddress",
      "addressRegion": "Rio Grande do Sul",
      "addressCountry": "BR"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "Portuguese"
    },
    "sameAs": [
      "https://www.linkedin.com/company/verus-cientifica",
      "https://www.facebook.com/veruscientifica"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Equipamentos para Laboratório",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "PCR Tempo Real",
            "description": "Equipamentos de PCR Tempo Real para laboratórios"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Eletroforeses",
            "description": "Equipamentos de eletroforese para laboratórios"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Incubadoras de CO2",
            "description": "Incubadoras de CO2 para laboratórios"
          }
        }
      ]
    }
  };

  return (
    <div className="min-h-screen">
      {/* Dados estruturados para SEO */}
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen py-25 md:py-25 flex items-center justify-center overflow-hidden">
        {/* Background with overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-cyan-700/80 z-10"></div>
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"
          }}
        ></div>

        {/* Content */}
        <div className="relative z-20 text-center text-white px-15 max-w-6xl mx-auto">
          <div className="mb-8">
            <Image
              src="/assets/logo.png"
              alt="Verus Científica Logo"
              width={120}
              height={120}
              className="mx-auto mb-6"
            />
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Inovação em
            <span className="block text-cyan-300">Laboratório!</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed px-4">
            Fornecemos equipamentos e produtos de alta qualidade para laboratórios,
            garantindo precisão e confiabilidade em suas pesquisas e análises.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/produtos"
              className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105"
            >
              Ver Produtos
            </Link>
            <Link
              href="/orcamento"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300"
            >
              Solicitar Orçamento
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="sobre" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Sobre a <span className="text-blue-600">Verus Científica</span>
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                <b>Missão:</b> Prover soluções completas em equipamentos e mobiliários para laboratórios de pesquisa científica, com agilidade, confiabilidade e suporte técnico.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                <b>Visão:</b> Ser referência no sul do Brasil como fornecedores de soluções laboratoriais para pesquisa.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                <b>Valores:</b> Ética, agilidade, excelência técnica, parceria, aprendizado contínuo, bem-estar e sustentabilidade.
              </p>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-8">
                <img
                  src="https://firebasestorage.googleapis.com/v0/b/veruswebsitedh.firebasestorage.app/o/home%2FBel%20AM8%20PRO.webp?alt=media&token=6e7dd227-7c7f-4a69-91df-186d2d29610a"
                  alt="Equipamentos de Laboratório Verus Científica"
                  width={500}
                  height={400}
                  className="rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Representadas Section Title */}
      <section id="representadas" className="py-10 bg-gradient-to-r from-blue-50 to-cyan-50 scroll-mt-24">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-2">
            Representadas Oficiais
          </h2>
          <p className="text-lg text-blue-700 max-w-5xl mx-auto">
            Conheça nossas principais representadas e descubra as melhores soluções para seu laboratório.
          </p>
        </div>
      </section>

      {/* Loccus Representative Section */}
      <section
        id="linhas"
        className="py-20 relative overflow-hidden scroll-mt-24"
      >
        {/* Animated background with laboratory theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 opacity-90"></div>

        {/* Floating laboratory icons */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 text-4xl animate-bounce">🧪</div>
          <div className="absolute top-20 right-20 text-3xl animate-pulse">⚖️</div>
          <div className="absolute bottom-20 left-20 text-3xl animate-bounce">🔬</div>
          <div className="absolute bottom-10 right-10 text-4xl animate-pulse">🧬</div>
          <div className="absolute top-1/2 left-1/4 text-2xl animate-bounce">⚗️</div>
          <div className="absolute top-1/3 right-1/4 text-3xl animate-pulse">🔋</div>
          <div className="absolute bottom-1/3 left-1/3 text-2xl animate-bounce">🌡️</div>
          <div className="absolute top-2/3 right-1/3 text-3xl animate-pulse">🧫</div>
        </div>

        {/* Geometric patterns */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 border-2 border-white rotate-45"></div>
          <div className="absolute top-20 right-0 w-24 h-24 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-0 left-1/4 w-40 h-40 border-2 border-white transform rotate-12"></div>
          <div className="absolute bottom-20 right-1/4 w-20 h-20 border-2 border-white transform -rotate-45"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <div className="mb-6">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Representante Oficial <span className="font-bold" style={{ color: "#009FE3" }}>Loccus</span>
                </h2>
                <p className="text-lg text-blue-100 mb-6 leading-relaxed">
                  Somos representantes oficiais da Loccus, uma das principais fabricantes
                  de equipamentos para laboratório do Brasil, reconhecida pela qualidade
                  e inovação em seus produtos.
                </p>
                <p className="text-lg text-blue-100 mb-8 leading-relaxed">
                  Como representantes autorizados, oferecemos toda a linha de produtos Loccus
                  com garantia de fábrica, suporte técnico especializado e entrega em todo território do Rio Grande do Sul.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                  <div className="text-2xl font-bold text-white mb-2">✓</div>
                  <div className="text-white font-semibold">Garantia Oficial</div>
                </div>
                <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                  <div className="text-2xl font-bold text-white mb-2">✓</div>
                  <div className="text-white font-semibold">Suporte Técnico</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
                <div className="flex justify-center items-center flex-col text-center">
                  <div className="bg-white rounded-full p-4 mb-4 md:shadow-lg">
                    <img src="https://firebasestorage.googleapis.com/v0/b/veruswebsitedh.firebasestorage.app/o/logotipos%2FloccusLogo.avif?alt=media&token=3639bc85-0325-4ed4-9e88-51423435c2f6" alt="Loccus Logo" width={150} height={150} className="rounded-full" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Produtos Loccus</h3>
                  <p className="text-blue-100 mb-6">
                  Oferecemos PCR Tempo Real, Eletroforeses, Incubadoras de CO2 e muito mais
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm w-full">
                    <div className="bg-blue-500/30 backdrop-blur-sm rounded-lg p-3 border border-blue-400/30 flex items-center justify-center">
                      <div className="font-semibold text-white">🧬 PCR Tempo Real</div>
                    </div>
                    <div className="bg-cyan-500/30 backdrop-blur-sm rounded-lg p-3 border border-cyan-400/30 flex items-center justify-center">
                      <div className="font-semibold text-white">💧 Extração e purificação de material genético</div>
                    </div>
                    <div className="bg-green-500/30 backdrop-blur-sm rounded-lg p-3 border border-green-400/30 flex items-center justify-center">
                      <div className="font-semibold text-white">⚡️ Eletroforeses</div>
                    </div>
                    <div className="bg-purple-500/30 backdrop-blur-sm rounded-lg p-3 border border-purple-400/3 flex items-center justify-center">
                      <div className="font-semibold text-white">🌡️ Incubadoras de CO2</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sartorius Representative Section */}
      <section
        id="sartorius"
        className="py-20 relative overflow-hidden scroll-mt-24"
      >
        {/* Animated background with laboratory theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-600 via-yellow-400 to-cyan-300 opacity-90"></div>
        {/* Floating laboratory icons */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 text-4xl animate-bounce">⚖️</div>
          <div className="absolute top-20 right-20 text-3xl animate-pulse">🧬</div>
          <div className="absolute bottom-20 left-20 text-3xl animate-bounce">🔬</div>
          <div className="absolute bottom-10 right-10 text-4xl animate-pulse">💧</div>
          <div className="absolute top-1/2 left-1/4 text-2xl animate-bounce">🧫</div>
          <div className="absolute top-1/3 right-1/4 text-3xl animate-pulse">🧪</div>
          <div className="absolute bottom-1/3 left-1/3 text-2xl animate-bounce">🌡️</div>
          <div className="absolute top-2/3 right-1/3 text-3xl animate-pulse">⚗️</div>
        </div>
        {/* Geometric patterns */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-32 h-32 border-2 border-yellow-400 rotate-45"></div>
          <div className="absolute top-20 right-0 w-24 h-24 border-2 border-yellow-400 rounded-full"></div>
          <div className="absolute bottom-0 left-1/4 w-40 h-40 border-2 border-yellow-400 transform rotate-12"></div>
          <div className="absolute bottom-20 right-1/4 w-20 h-20 border-2 border-yellow-400 transform -rotate-45"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Imagem Sartorius à esquerda em telas md+ */}
            <div className="relative order-1 md:order-1">
              <div className="p-8">
                <div className="flex justify-center  items-center flex-col text-center">
                  <div className="bg-white rounded-full p-15 mb-4 md:shadow-lg overflow-hidden flex items-center justify-center">
                    <img
                      src="https://firebasestorage.googleapis.com/v0/b/veruswebsitedh.firebasestorage.app/o/logotipos%2FSartorius%20Image.png?alt=media&token=d456f53e-2de3-418a-99a8-0004f2616e72"
                      alt="Sartorius Logo"
                      width={150}
                      height={150}
                      className="object-contain h-full rounded-full"
                      style={{ aspectRatio: '1/1' }}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Texto Sartorius à direita em telas md+ */}
            <div className="order-2 md:order-2">
              <div className="mb-6">
                <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
                  Representante Oficial <span
                    className="font-bold"
                    style={{
                      color: "#FFD600",
                      textShadow: `
                        0 1px 4px rgba(0,0,0,0.28),
                        0 0 0.5px #B8860B,
                        0 0 1.5px #B8860B,
                        0 0 2.5px #B8860B
                      `
                    }}
                  >Sartorius</span>
                </h2>
                <p className="text-lg text-black mb-6 leading-relaxed">
                  O extenso portfólio de filtração da Sartorius ajuda você a superar seus principais desafios e encontrar a solução ideal para sua aplicação.
                </p>
                <p className="text-lg text-black mb-8 leading-relaxed">
                  Beneficie-se da experiência de longa data e constante inovação.
                  Os elementos filtrantes em cápsulas ou cartuchos atendem as mais diversas aplicações e volumes em processos de filtração esterilizante, pré-filtração ou ar | gás e sistemas modulares (Transfer Sets).
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                  <div className="text-2xl font-bold text-black mb-2">✓</div>
                  <div className="text-black font-semibold">Tecnologia Alemã</div>
                </div>
                <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
                  <div className="text-2xl font-bold text-black mb-2">✓</div>
                  <div className="text-black font-semibold">Soluções Inovadoras</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Por que escolher a Verus Científica?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Nossos diferenciais que garantem a melhor experiência para seu laboratório
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl">🏆</div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Qualidade Garantida
              </h3>
              <p className="text-gray-600">
                Todos os produtos passam por rigorosos controles de qualidade
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl">🫱🏼‍🫲🏾</div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Parcerias com marcas reconhecidas
              </h3>
              <p className="text-gray-600">
                Trabalhamos com parceiros de renome no mercado
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl">🛠️</div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Assistência Técnica
              </h3>
              <p className="text-gray-600">
                Manutenção preventiva e corretiva de balanças
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="text-2xl">💡</div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Inovação Constante
              </h3>
              <p className="text-gray-600">
                Sempre atualizados com as últimas tecnologias do mercado
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Pronto para modernizar seu laboratório?
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-8 px-4">
            Entre em contato conosco e descubra como podemos ajudar a impulsionar
            suas pesquisas e análises com equipamentos de última geração.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/orcamento"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300"
            >
              Solicitar Orçamento
            </Link>
            <Link
              href="/produtos"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300"
            >
              Ver Catálogo Completo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
