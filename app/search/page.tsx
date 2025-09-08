'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AdvancedSearch } from '../components/AdvancedSearch';
import * as firebaseFunctions from '@/lib/databaseFunctions';
import { useRouter } from 'next/navigation';

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

export default function SearchPage() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<string>('');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const urlQuery = searchParams.get('q');
    const urlType = searchParams.get('type');
    const urlCategories = searchParams.get('categories');
    const urlSuppliers = searchParams.get('suppliers');
    const urlTags = searchParams.get('tags');
    
    if (urlQuery) {
      setQuery(urlQuery);
      setSearchType(urlType || '');
      
      // Preparar filtros baseados nos parâmetros da URL
      const filters = {
        types: ['product', 'category', 'subcategory', 'tag', 'supplier'],
        categories: urlCategories ? urlCategories.split(',') : [],
        suppliers: urlSuppliers ? urlSuppliers.split(',') : [],
        tags: urlTags ? urlTags.split(',') : [],
        priceRange: { min: 0, max: 100000 }
      };
      
      performSearchWithFilters(urlQuery, urlType || '', filters);
    }
  }, [searchParams]);

  const performSearchWithFilters = async (searchQuery: string, type: string = '', filters: any) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      let searchResults: SearchResult[] = [];

      if (type === 'tag') {
        // Buscar produtos que contêm a tag
        const products = await firebaseFunctions.getProducts();
        searchResults = products
          .filter(product => {
            if (!product.active) return false;
            if (Array.isArray(product.tags)) {
              return product.tags.some(tag => 
                tag.toLowerCase().includes(searchQuery.toLowerCase())
              );
            }
            return false;
          })
          .map(product => ({
            id: product.id,
            type: 'product' as const,
            title: product.title,
            subtitle: product.subtitle,
            description: product.description,
            imageUrl: product.imageUrl,
            category: product.category,
            subcategory: product.subcategory,
            supplier: product.supplier,
            price: product.price,
            relevance: 0.8
          }));
      } else if (type === 'supplier') {
        // Buscar produtos do fornecedor
        const products = await firebaseFunctions.getProducts();
        searchResults = products
          .filter(product => {
            if (!product.active) return false;
            return product.supplier?.toLowerCase().includes(searchQuery.toLowerCase());
          })
          .map(product => ({
            id: product.id,
            type: 'product' as const,
            title: product.title,
            subtitle: product.subtitle,
            description: product.description,
            imageUrl: product.imageUrl,
            category: product.category,
            subcategory: product.subcategory,
            supplier: product.supplier,
            price: product.price,
            relevance: 0.8
          }));
      } else {
        // Busca geral com filtros
        searchResults = await firebaseFunctions.globalSearch({
          query: searchQuery,
          filters: filters
        });
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Erro na busca:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (searchQuery: string, type: string = '') => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      let searchResults: SearchResult[] = [];

      if (type === 'tag') {
        // Buscar produtos que contêm a tag
        const products = await firebaseFunctions.getProducts();
        searchResults = products
          .filter(product => {
            if (!product.active) return false;
            if (Array.isArray(product.tags)) {
              return product.tags.some(tag => 
                tag.toLowerCase().includes(searchQuery.toLowerCase())
              );
            }
            return false;
          })
          .map(product => ({
            id: product.id,
            type: 'product' as const,
            title: product.title,
            subtitle: product.subtitle,
            description: product.description,
            imageUrl: product.imageUrl,
            category: product.category,
            subcategory: product.subcategory,
            supplier: product.supplier,
            price: product.price,
            relevance: 0.8
          }));
      } else if (type === 'supplier') {
        // Buscar produtos do fornecedor
        const products = await firebaseFunctions.getProducts();
        searchResults = products
          .filter(product => {
            if (!product.active) return false;
            return product.supplier?.toLowerCase().includes(searchQuery.toLowerCase());
          })
          .map(product => ({
            id: product.id,
            type: 'product' as const,
            title: product.title,
            subtitle: product.subtitle,
            description: product.description,
            imageUrl: product.imageUrl,
            category: product.category,
            subcategory: product.subcategory,
            supplier: product.supplier,
            price: product.price,
            relevance: 0.8
          }));
      } else {
        // Busca geral
        searchResults = await firebaseFunctions.quickSearch(searchQuery);
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Erro na busca:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
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

  const groupResultsByType = (results: SearchResult[]) => {
    const grouped: { [key: string]: SearchResult[] } = {};
    
    results.forEach(result => {
      if (!grouped[result.type]) {
        grouped[result.type] = [];
      }
      grouped[result.type].push(result);
    });

    return grouped;
  };

  const groupedResults = groupResultsByType(results);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Busca Avançada</h1>
          <p className="text-gray-600 mb-6">
            Encontre produtos, categorias, tags e fornecedores em nosso catálogo
          </p>
          
          {/* Barra de Pesquisa */}
          <div className="max-w-4xl mx-auto">
            <AdvancedSearch />
          </div>
        </div>

        {/* Resultados */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Buscando...</p>
          </div>
        )}

        {!loading && query && (
          <div className="max-w-6xl mx-auto">
            {/* Informações da Busca */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Resultados para "{query}"
                {searchType && (
                  <span className="text-lg font-normal text-gray-600 ml-2">
                    (filtrado por {searchType})
                  </span>
                )}
              </h2>
              
              {/* Filtros Ativos */}
              {(() => {
                const urlCategories = searchParams.get('categories');
                const urlSuppliers = searchParams.get('suppliers');
                const urlTags = searchParams.get('tags');
                
                if (urlCategories || urlSuppliers || urlTags) {
                  return (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {urlCategories && urlCategories.split(',').map((cat, index) => (
                        <span key={`cat-${index}`} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                          📁 {cat}
                        </span>
                      ))}
                      {urlSuppliers && urlSuppliers.split(',').map((supp, index) => (
                        <span key={`supp-${index}`} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                          🏢 {supp}
                        </span>
                      ))}
                      {urlTags && urlTags.split(',').map((tag, index) => (
                        <span key={`tag-${index}`} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
                          🏷️ {tag}
                        </span>
                      ))}
                    </div>
                  );
                }
                return null;
              })()}
              
              <p className="text-gray-600 mt-2">
                {results.length} resultado(s) encontrado(s)
              </p>
            </div>

            {/* Resultados Agrupados */}
            {results.length > 0 ? (
              <div className="space-y-8">
                {Object.entries(groupedResults).map(([type, typeResults]) => (
                  <div key={type} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <span className="text-2xl mr-2">{getResultIcon(type)}</span>
                      {getResultTypeLabel(type)}s ({typeResults.length})
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {typeResults.map((result, index) => (
                        <div
                          key={`${result.type}-${result.id}-${index}`}
                          onClick={() => handleResultClick(result)}
                          className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md cursor-pointer transition-all duration-200"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="text-2xl">{getResultIcon(result.type)}</div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate mb-1">
                                {result.title}
                              </h4>
                              
                              {result.subtitle && (
                                <p className="text-sm text-gray-600 truncate mb-2">
                                  {result.subtitle}
                                </p>
                              )}
                              
                              {result.description && (
                                <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                                  {result.description}
                                </p>
                              )}
                              
                              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                                {result.category && (
                                  <span className="bg-gray-100 px-2 py-1 rounded">
                                    📁 {result.category}
                                  </span>
                                )}
                                {result.subcategory && (
                                  <span className="bg-gray-100 px-2 py-1 rounded">
                                    📂 {result.subcategory}
                                  </span>
                                )}
                                {result.supplier && (
                                  <span className="bg-gray-100 px-2 py-1 rounded">
                                    🏢 {result.supplier}
                                  </span>
                                )}
                                {result.price && (
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                    💰 R$ {result.price}
                                  </span>
                                )}
                              </div>
                              
                              <div className="mt-2 text-xs text-gray-400">
                                Relevância: {Math.round(result.relevance * 100)}%
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nenhum resultado encontrado
                </h3>
                <p className="text-gray-600 mb-4">
                  Não encontramos resultados para "{query}"
                </p>
                <div className="text-sm text-gray-500">
                  <p>Dicas para melhorar sua busca:</p>
                  <ul className="mt-2 space-y-1">
                    <li>• Verifique a ortografia das palavras</li>
                    <li>• Tente usar termos mais gerais</li>
                    <li>• Use sinônimos ou termos relacionados</li>
                    <li>• Experimente a busca avançada com filtros</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Estado Inicial */}
        {!loading && !query && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Comece sua busca
            </h3>
            <p className="text-gray-600">
              Digite o que você está procurando na barra de pesquisa acima
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
