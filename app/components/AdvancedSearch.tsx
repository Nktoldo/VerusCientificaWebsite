import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import * as firebaseFunctions from '@/lib/databaseFunctions';
import { logger } from '@/lib/logger';

type SearchResult = {
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
};

type SearchFilters = {
  suppliers: string[];
  priceRange: {
    min: number;
    max: number;
  };
  tags: string[];
};

export function AdvancedSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    suppliers: [],
    priceRange: { min: 0, max: 100000 },
    tags: []
  });
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableSuppliers, setAvailableSuppliers] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Carregar dados para filtros
  useEffect(() => {
    const loadFilterData = async () => {
      try {
        const [categories, suppliers, tags] = await Promise.all([
          firebaseFunctions.getCategories(),
          firebaseFunctions.getSuppleiers(),
          firebaseFunctions.getTags()
        ]);

        setAvailableCategories(categories.map(cat => cat.title));
        setAvailableSuppliers(suppliers);
        setAvailableTags(tags);
        logger.debug('Dados dos filtros carregados', { 
          categories: categories.length, 
          suppliers: suppliers.length, 
          tags: tags.length 
        });
      } catch (error) {
        logger.error('Erro ao carregar dados dos filtros', error);
      }
    };

    loadFilterData();
  }, []);

  // Busca automática enquanto digita (com debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        performSearch(query);
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300); // 300ms de debounce

    return () => clearTimeout(timeoutId);
  }, [query, filters]);

  // Fechar resultados ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    try {
      // Sempre pesquisar por todos os tipos: produtos, categorias, subcategorias, tags e fornecedores
      const searchResults = await firebaseFunctions.globalSearch({
        query: searchQuery,
        filters: {
          types: ['product', 'category', 'subcategory', 'tag', 'supplier'],
          categories: [],
          ...filters
        }
      });

      // Ordenar por relevância
      const sortedResults = searchResults.sort((a, b) => b.relevance - a.relevance);
      setResults(sortedResults);
      setShowResults(true);
      logger.debug('Busca realizada com sucesso', { 
        query: searchQuery.substring(0, 50), 
        resultsCount: sortedResults.length 
      });
    } catch (error) {
      logger.error('Erro na busca', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (query.trim()) {
      // Redirecionar para a página de busca com todos os resultados
      const searchParams = new URLSearchParams();
      searchParams.set('q', query.trim());
      
      // Adicionar filtros ativos como parâmetros de URL
      if (filters.suppliers.length > 0) {
        searchParams.set('suppliers', filters.suppliers.join(','));
      }
      if (filters.tags.length > 0) {
        searchParams.set('tags', filters.tags.join(','));
      }
      
      router.push(`/search?${searchParams.toString()}`);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setShowResults(false);
    setQuery('');
    
    switch (result.type) {
      case 'product':
        // Construir URL baseada na disponibilidade de categoria e subcategoria
        if (result.category && result.subcategory) {
          // Categoria + Subcategoria + Produto
          router.push(`/products/${result.category}/${result.subcategory}/${result.id}`);
        } else if (result.category) {
          // Apenas Categoria + Produto
          router.push(`/products/${result.category}/${result.id}`);
        } else {
          // Fallback: ir para página de busca com o produto
          router.push(`/search?q=${encodeURIComponent(result.title)}&type=product`);
        }
        break;
      case 'category':
        router.push(`/products/${result.id}`);
        break;
      case 'subcategory':
        if (result.category) {
          router.push(`/products/${result.category}/${result.id}`);
        } else {
          // Fallback: ir para busca
          router.push(`/search?q=${encodeURIComponent(result.title)}&type=subcategory`);
        }
        break;
      case 'tag':
        router.push(`/search?q=${encodeURIComponent(result.title)}&type=tag`);
        break;
      case 'supplier':
        router.push(`/search?q=${encodeURIComponent(result.title)}&type=supplier`);
        break;
    }
  };

  const toggleFilter = (filterType: keyof SearchFilters, value: string) => {
    if (filterType === 'suppliers') {
      setFilters(prev => ({
        ...prev,
        suppliers: prev.suppliers.includes(value)
          ? prev.suppliers.filter(s => s !== value)
          : [...prev.suppliers, value]
      }));
    } else if (filterType === 'tags') {
      setFilters(prev => ({
        ...prev,
        tags: prev.tags.includes(value)
          ? prev.tags.filter(t => t !== value)
          : [...prev.tags, value]
      }));
    }
  };

  const clearFilters = () => {
    setFilters({
      suppliers: [],
      priceRange: { min: 0, max: 100000 },
      tags: []
    });
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'product': return '📦';
      case 'category': return '📁';
      case 'subcategory': return '📂';
      case 'tag': return '🏷️';
      case 'supplier': return '🏢';
      default: return '🔍';
    }
  };

  const getResultTypeLabel = (type: string) => {
    switch (type) {
      case 'product': return 'Produto';
      case 'category': return 'Categoria';
      case 'subcategory': return 'Subcategoria';
      case 'tag': return 'Tag';
      case 'supplier': return 'Fornecedor';
      default: return 'Item';
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={searchRef}>
      {/* Barra de Pesquisa Principal */}
      <form onSubmit={handleSearch} className="relative">
        <div className="flex items-center bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar produtos, categorias, características, marcas..."
              className="w-full px-4 py-3 text-gray-700 placeholder-gray-500 focus:outline-none"
              onFocus={() => query && setShowResults(true)}
            />
            {loading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 transition-colors border-l border-gray-200"
            title="Filtros"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
            </svg>
          </button>
          
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </form>

      {/* Painel de Filtros */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fornecedores */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Marcas</h3>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {availableSuppliers.map(supplier => (
                  <label key={supplier} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.suppliers.includes(supplier)}
                      onChange={() => toggleFilter('suppliers', supplier)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{supplier}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Características</h3>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {availableTags.map(tag => (
                  <label key={tag} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.tags.includes(tag)}
                      onChange={() => toggleFilter('tags', tag)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{tag}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Limpar Filtros
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Aplicar
            </button>
          </div>
        </div>
      )}

      {/* Resultados da Busca */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
          <div className="p-2">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-3 px-2">
              <span>{results.length} resultado(s) encontrado(s)</span>
              <span className="text-blue-600 font-medium">Pressione Enter para ver todos</span>
            </div>
            
            {/* Mostrar apenas os primeiros 5 resultados mais relevantes */}
            {results.slice(0, 5).map((result, index) => (
              <div
                key={`${result.type}-${result.id}-${index}`}
                onClick={() => handleResultClick(result)}
                className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors border-b border-gray-100 last:border-b-0"
              >
                <div className="text-2xl">{getResultIcon(result.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-gray-900 truncate">{result.title}</h4>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {getResultTypeLabel(result.type)}
                    </span>
                  </div>
                  {result.subtitle && (
                    <p className="text-sm text-gray-600 truncate mb-1">{result.subtitle}</p>
                  )}
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    {result.category && (
                      <span className="flex items-center">
                        <span className="mr-1">📁</span>
                        {result.category}
                      </span>
                    )}
                    {result.supplier && (
                      <span className="flex items-center">
                        <span className="mr-1">🏢</span>
                        {result.supplier}
                      </span>
                    )}
                    {result.price && (
                      <span className="flex items-center text-green-600 font-medium">
                        <span className="mr-1">💰</span>
                        R$ {result.price}
                      </span>
                    )}
                  </div>
                </div>

              </div>
            ))}
            
            {/* Mostrar indicador se há mais resultados */}
            {results.length > 5 && (
              <div className="text-center py-3 text-sm text-blue-600 font-medium border-t border-gray-100">
                +{results.length - 5} resultado(s) restante(s) - Pressione Enter para ver todos
              </div>
            )}
          </div>
        </div>
      )}

      {/* Nenhum resultado */}
      {showResults && results.length === 0 && !loading && query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">🔍</div>
            <p className="font-medium mb-1">Nenhum resultado encontrado para "{query}"</p>
            <p className="text-sm mb-3">Tente usar termos diferentes ou ajustar os filtros</p>
            <div className="text-xs text-gray-400">
              <p>Dicas de busca:</p>
              <p>• Use palavras-chave específicas</p>
              <p>• Tente nomes de produtos ou categorias</p>
              <p>• Verifique se os filtros não estão muito restritivos</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
