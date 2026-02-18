'use client'

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from '../components/ProductCard';
import { AdvancedSearch } from '../components/AdvancedSearch';

interface SearchResult {
  id: string;
  type: 'product' | 'category' | 'subcategory' | 'tag' | 'supplier';
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  category?: string;
  subcategory?: string;
  tags?: string[];
  supplier?: string;
  price?: string;
  relevance: number;
}

export default function SearchClient() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  // buscar parâmetros da URL
  useEffect(() => {
    const q = searchParams.get('q');
    const type = searchParams.get('type');
    
    if (q) {
      setQuery(q);
      performSearch(q, type);
    }
  }, [searchParams]);

  // função de busca
  const performSearch = async (searchQuery: string, searchType?: string | null) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        ...(searchType && { type: searchType })
      });
      
      const response = await fetch(`/api/search?${params}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      } else {
        setResults([]);
      }
    } catch (error) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // função para lidar com clique em resultado
  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case 'product':
        // construir URL baseada na disponibilidade de categoria e subcategoria
        if (result.category && result.subcategory) {
          // categoria + subcategoria + produto
          router.push(`/produtos/${result.category}/${result.subcategory}/${result.id}`);
        } else if (result.category) {
          // apenas categoria + produto
          router.push(`/produtos/${result.category}/${result.id}`);
        } else {
          // fallback: ir para página de busca com o produto
          router.push(`/search?q=${encodeURIComponent(result.title)}&type=product`);
        }
        break;
      case 'category':
        router.push(`/produtos/${result.id}`);
        break;
      case 'subcategory':
        if (result.category) {
          router.push(`/produtos/${result.category}/${result.id}`);
        } else {
          // fallback: ir para busca
          router.push(`/search?q=${encodeURIComponent(result.title)}&type=subcategory`);
        }
        break;
      case 'supplier':
        router.push(`/search?q=${encodeURIComponent(result.title)}&type=supplier`);
        break;
      default:
        router.push(`/search?q=${encodeURIComponent(result.title)}`);
    }
  };

  // função para lidar com busca
  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  // agrupar resultados por tipo
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const resultTypes = [
    { key: 'product', label: 'Produtos', icon: '📦' },
    { key: 'category', label: 'Categorias', icon: '📁' },
    { key: 'subcategory', label: 'Subcategorias', icon: '📂' },
    { key: 'supplier', label: 'Fornecedores', icon: '🏢' },
    { key: 'tag', label: 'Tags', icon: '🏷️' }
  ];

  return (
    <div className="w-full min-h-screen py-4 sm:py-6 md:py-10 px-4 sm:px-6 md:px-10 flex flex-col">
      {/* barra de pesquisa */}
      <div className="w-full px-4 mb-6">
        <AdvancedSearch />
      </div>

      {/* resultados da busca */}
      <div className="w-full max-w-7xl mx-auto">
        {query && (
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Resultados para "{query}"
            </h1>
            <p className="text-gray-600">
              {loading ? 'Buscando...' : `${results.length} resultado(s) encontrado(s)`}
            </p>
          </div>
        )}

        {/* loading */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 text-sm">Buscando...</p>
            </div>
          </div>
        )}

        {/* resultados */}
        {!loading && results.length > 0 && (
          <div className="space-y-8">
            {resultTypes.map(({ key, label, icon }) => {
              const typeResults = groupedResults[key];
              if (!typeResults || typeResults.length === 0) return null;

              return (
                <div key={key} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>{icon}</span>
                    {label} ({typeResults.length})
                  </h2>

                  {key === 'product' ? (
                    // layout de grid para produtos
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 auto-rows-fr">
                      {typeResults.map((result) => (
                        <ProductCard
                          key={result.id}
                          name={result.title}
                          subtitle={result.subtitle || ''}
                          image={result.imageUrl || ''}
                          onClick={() => handleResultClick(result)}
                        />
                      ))}
                    </div>
                  ) : (
                    // layout de lista para outros tipos
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {typeResults.map((result) => (
                        <div
                          key={result.id}
                          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                          onClick={() => handleResultClick(result)}
                        >
                          <h3 className="font-medium text-gray-900 mb-2">{result.title}</h3>
                          {result.subtitle && (
                            <p className="text-sm text-gray-600 mb-2">{result.subtitle}</p>
                          )}
                          {result.description && (
                            <p className="text-xs text-gray-500 line-clamp-2">{result.description}</p>
                          )}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {result.category && (
                              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                📁 {result.category}
                              </span>
                            )}
                            {result.subcategory && (
                              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                📂 {result.subcategory}
                              </span>
                            )}
                            {result.supplier && (
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                🏢 {result.supplier}
                              </span>
                            )}
                            {result.price && (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                💰 R$ {result.price}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Sem resultados */}
        {!loading && query && results.length === 0 && (
          <div className="text-center py-12">
            <div className="mb-6">
              <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">
                Nenhum resultado encontrado
              </h2>
              <p className="text-gray-500 mb-6">
                Não encontramos resultados para "{query}". Tente termos diferentes ou verifique a ortografia.
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <p className="text-sm text-gray-600 mb-4">Sugestões:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Verifique se todas as palavras estão escritas corretamente</li>
                <li>• Tente palavras-chave diferentes</li>
                <li>• Tente palavras-chave mais gerais</li>
                <li>• Tente menos palavras-chave</li>
              </ul>
            </div>
          </div>
        )}

        {/* Página inicial sem busca */}
        {!query && !loading && (
          <div className="text-center py-12">
            <div className="mb-6">
              <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">
                Busque por produtos
              </h2>
              <p className="text-gray-500 mb-6">
                Digite o nome do produto, categoria, fornecedor ou qualquer termo relacionado.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}