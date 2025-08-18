import React from "react";
import Image from "next/image";
import NavBar from "../components/NavBar";
export default function ProdutosPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-16 bg-gray-50 pt-34">
      <NavBar />
      <h1 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-4 text-center">
        Página de Produtos em Construção
      </h1>
      <p className="text-lg text-gray-700 mb-8 text-center max-w-xl">
        Em breve você poderá navegar por todos os nossos produtos aqui. Enquanto isso, confira nosso catálogo completo de produtos no PDF abaixo!
      </p>
      <a
        href="/assets/folderVerus.pdf"
        download
        className="mb-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition"
      >
        Baixar Catálogo em PDF
      </a>
      <div className="w-full max-w-5xl h-[80vh] bg-white rounded-lg shadow overflow-hidden flex items-center justify-center">
        <iframe
          src="/assets/folderVerus.pdf"
          title="Catálogo de Produtos"
          width="100%"
          height="100%"
          className="border-0 w-full h-full"
        />
      </div>
    </div>
  );
}
