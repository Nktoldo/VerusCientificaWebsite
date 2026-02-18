'use client'

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/lib/hooks/useDebounce';

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

export default function AdvancedSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // debounce da query para evitar muitas requisições
  const debouncedQuery = useDebounce(query, 300);

  // função de busca
  const searchItems = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      } else {
        setResults([]);
      }
    } catch (error) {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // efeito para buscar quando query muda
  useEffect(() => {
    if (debouncedQuery) {
      searchItems(debouncedQuery);
      setShowResults(true);
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [debouncedQuery]);

  // fechar resultados ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // navegação com teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleResultClick(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // função para lidar com clique em resultado
  const handleResultClick = (result: SearchResult) => {
    setShowResults(false);
    setSelectedIndex(-1);
    
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

  // função para lidar com submit do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (results.length > 0) {
                setShowResults(true);
              }
            }}
            placeholder="Buscar produtos, categorias, fornecedores..."
            className="w-full px-4 py-3 pl-12 pr-12 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          />
          
          {/* ícone de busca */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* ícone de loading */}
          {isLoading && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* botão de limpar */}
          {query && !isLoading && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
                setShowResults(false);
                inputRef.current?.focus();
              }}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* resultados da busca */}
        {showResults && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
            {results.map((result, index) => (
              <div
                key={`${result.type}-${result.id}`}
                className={`p-3 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150 ${
                  index === selectedIndex 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleResultClick(result)}
              >
                <div className="flex items-start gap-3">
                  {/* imagem do produto (se disponível) */}
                  {result.imageUrl && (
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={result.imageUrl}
                        alt={result.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {result.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        result.type === 'product' ? 'bg-green-100 text-green-800' :
                        result.type === 'category' ? 'bg-blue-100 text-blue-800' :
                        result.type === 'subcategory' ? 'bg-purple-100 text-purple-800' :
                        result.type === 'supplier' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {result.type === 'product' ? 'Produto' :
                         result.type === 'category' ? 'Categoria' :
                         result.type === 'subcategory' ? 'Subcategoria' :
                         result.type === 'supplier' ? 'Fornecedor' :
                         'Outro'}
                      </span>
                    </div>
                    
                    {result.subtitle && (
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {result.subtitle}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-1 text-xs">
                      {result.category && (
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          📁 {result.category}
                        </span>
                      )}
                      {result.subcategory && (
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          📂 {result.subcategory}
                        </span>
                      )}
                      {result.supplier && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          🏢 {result.supplier}
                        </span>
                      )}
                      {result.price && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                          💰 R$ {result.price}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* mensagem quando não há resultados */}
        {showResults && !isLoading && query && results.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
            <p>Nenhum resultado encontrado para "{query}"</p>
            <p className="text-xs mt-1">Tente termos diferentes ou verifique a ortografia</p>
          </div>
        )}
      </form>
    </div>
  );
}

export { AdvancedSearch };