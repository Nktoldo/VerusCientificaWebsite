'use client'
import { useEffect, useState } from "react";
import ProductCard from "../../components/ProductCard";
import { AdvancedSearch } from "../../components/AdvancedSearch";
import { useRouter, useParams } from "next/navigation";
import ProductsPage from "../../components/ProductPage";
import * as firebaseFunctions from "@/lib/databaseFunctions";

type Product = {
  id: string;
  subtitle?: string;
  imageUrl?: string;
  technicalInfo?: string;
  video?: string;
  description?: string;
  supplier?: string;
  tags?: string[] | Record<string, string>;
  title: string;
  price?: string;
  category?: string;
  subcategory?: string;
  active: boolean;
};

type CategoryWithSubcategories = {
  id: string;
  title: string;
  active: boolean;
  subcategories: Array<{
    id: string;
    title: string;
    active: boolean;
  }>;
  directProducts: Product[];
};

type KVItem = { key: string; value: any };

function isKV(item: any): item is KVItem {
  return 'key' in item && 'value' in item;
}

export default function ProdutosBlocks() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const slugParam = (params?.slug ?? []) as string[];
  const slug = Array.isArray(slugParam) ? slugParam : [slugParam];

  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [subcategoryProducts, setSubcategoryProducts] = useState<Product[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string>('');
  const [currentSubcategory, setCurrentSubcategory] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (slug.length === 0) {
          // página principal - mostrar todas as categorias em blocos
          const categoriesData = await firebaseFunctions.getCategories();
          
          if (!categoriesData || categoriesData.length === 0) {
            setCategories([]);
            return;
          }
          
          const categoriesWithSubcategories: CategoryWithSubcategories[] = [];

          for (const category of categoriesData) {
            if (category && category.active) {
              // buscar subcategorias da categoria
              const subcategories = await firebaseFunctions.getSubCategories({ 
                category: category.id 
              });

              categoriesWithSubcategories.push({
                id: category.id,
                title: category.title || 'Categoria sem título',
                active: category.active,
                subcategories: (subcategories || []).filter((s: any) => s?.active),
                directProducts: [] // não vamos mais mostrar produtos diretos
              });
            }
          }

          // ordenar categorias alfabeticamente
          categoriesWithSubcategories.sort((a, b) => 
            a.title.toLowerCase().localeCompare(b.title.toLowerCase())
          );

          setCategories(categoriesWithSubcategories);
          setCurrentCategory('');
          setCurrentSubcategory('');
        } else if (slug.length === 1) {
          // página de categoria específica - mostrar blocos das subcategorias
          const categoryId = slug[0];
          
          if (!categoryId) {
            setCategories([]);
            return;
          }
          
          const subcategories = await firebaseFunctions.getSubCategories({ 
            category: categoryId 
          });

          const categoryWithSubcategories: CategoryWithSubcategories = {
            id: categoryId,
            title: '', // será preenchido depois
            active: true,
            subcategories: (subcategories || []).filter((s: any) => s?.active),
            directProducts: [] // não vamos mais mostrar produtos diretos
          };

          // buscar nome da categoria
          const categoriesData = await firebaseFunctions.getCategories();
          if (categoriesData && categoriesData.length > 0) {
            const category = categoriesData.find((c: any) => c.id === categoryId);
            if (category) {
              categoryWithSubcategories.title = category.title || 'Categoria sem título';
            } else {
              // categoria não encontrada
              setCategories([]);
              return;
            }
          }

          setCategories([categoryWithSubcategories]);
          setCurrentCategory(categoryId);
          setCurrentSubcategory('');
        } else if (slug.length === 2) {
          // página de subcategoria - mostrar produtos
          const categoryId = slug[0];
          const subcategoryId = slug[1];
          
          if (!categoryId || !subcategoryId) {
            setSubcategoryProducts([]);
            return;
          }
          
          const products = await firebaseFunctions.buscarProdutos({ 
            category: categoryId, 
            subcategory: subcategoryId 
          });

          setSubcategoryProducts((products || []).filter((p: any) => p?.active));
          setCurrentCategory(categoryId);
          setCurrentSubcategory(subcategoryId);
        } else if (slug.length === 3) {
          // página de produto individual
          const productId = slug[2];
          
          if (!productId) {
            setSubcategoryProducts([]);
            return;
          }
          
          const product = await firebaseFunctions.getProductById({ id: productId });
          if (product && product.active) {
            setSubcategoryProducts([product]);
          } else {
            setSubcategoryProducts([]);
          }
          setCurrentCategory(slug[0]);
          setCurrentSubcategory(slug[1]);
        } else {
          setCategories([]);
          setSubcategoryProducts([]);
        }
      } catch (error) {
        setCategories([]);
        setSubcategoryProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug.join('/')]);

  const handleSubcategoryClick = (categoryId: string, subcategoryId: string) => {
    router.push(`/produtos/${categoryId}/${subcategoryId}`);
  };

  const handleCategoryClick = async (categoryId: string) => {
    setLoading(true);
    try {
      // buscar todas as subcategorias da categoria
      const subcategories = await firebaseFunctions.getSubCategories({ 
        category: categoryId 
      });

      // buscar produtos de todas as subcategorias
      const allProducts: Product[] = [];
      
      for (const subcategory of subcategories || []) {
        if (subcategory.active) {
          const products = await firebaseFunctions.buscarProdutos({ 
            category: categoryId, 
            subcategory: subcategory.id 
          });
          
          // adicionar a subcategoria a cada produto
          const productsWithSubcategory = (products || []).filter((p: any) => p?.active).map((p: any) => ({
            ...p,
            subcategory: subcategory.id // garantir que cada produto tenha sua subcategoria
          }));
          
          allProducts.push(...productsWithSubcategory);
        }
      }

      // ordenar produtos alfabeticamente
      allProducts.sort((a, b) => 
        (a.title || '').toLowerCase().localeCompare((b.title || '').toLowerCase())
      );

      setSubcategoryProducts(allProducts);
      setCurrentCategory(categoryId);
      setCurrentSubcategory('');
      setCategories([]); // limpar categorias para mostrar produtos
    } catch (error) {
      setSubcategoryProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId: string) => {
    if (currentCategory && currentSubcategory) {
      // produto de subcategoria específica
      router.push(`/produtos/${currentCategory}/${currentSubcategory}/${productId}`);
    } else if (currentCategory && slug.length === 0) {
      // produto da categoria (quando clicou no título da categoria)
      // encontrar o produto na lista para obter sua subcategoria
      const product = subcategoryProducts.find(p => p.id === productId);
      if (product && product.subcategory) {
        router.push(`/produtos/${currentCategory}/${product.subcategory}/${productId}`);
      } else {
        // se não tem subcategoria, tentar acessar diretamente
        router.push(`/produtos/${currentCategory}/${productId}`);
      }
    } else if (currentCategory) {
      // fallback
      router.push(`/produtos/${currentCategory}/${productId}`);
    }
  };

  const handleBack = () => {
    const newSlug = slug.slice(0, -1);
    router.push(newSlug.length > 0 ? `/produtos/${newSlug.join("/")}` : "/produtos");
  };

  // checa se é uma página de produto individual
  const isProduct = slug.length === 3 && subcategoryProducts.length === 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isProduct) {
    const product = subcategoryProducts[0] as Product;
    
    // verificações de segurança para evitar erros
    const safeTags = (() => {
      if (!product.tags) return [];
      if (Array.isArray(product.tags)) return product.tags;
      if (typeof product.tags === 'object') return Object.values(product.tags);
      return [];
    })();
    
    return (
      <ProductsPage
        productId={product.id}
        title={product.title}
        subtitle={product.subtitle || ""}
        description={product.description || ""}
        imageUrl={product.imageUrl || ""}
        price={product.price ? parseFloat(product.price) : 0}
        tags={safeTags}
        supplier={product.supplier || ""}
        video={product.video || ""}
        technicalInfo={product.technicalInfo || ""}
      />
    );
  }

  return (
    <div className="w-full min-h-screen py-4 sm:py-6 md:py-10 px-4 sm:px-6 md:px-10 flex flex-col">
      {/* barra de pesquisa */}
      <div className="w-full px-4 mb-6">
        <AdvancedSearch />
      </div>

      {/* breadcrumb */}
      {(slug.length > 0 || (currentCategory && subcategoryProducts.length > 0)) && (
        <div className="w-full px-4 mb-6">
          <button 
            onClick={currentCategory && subcategoryProducts.length > 0 && slug.length === 0 ? 
              () => window.location.reload() : 
              handleBack
            } 
            className="flex items-center gap-2 px-4 py-2 text-sm sm:text-base text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {currentCategory && subcategoryProducts.length > 0 && slug.length === 0 ? 'Voltar às Categorias' : 'Voltar'}
          </button>
        </div>
      )}

      <div className="w-full max-w-7xl mx-auto">
        {/* loading indicator */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 text-sm">Carregando produtos...</p>
            </div>
          </div>
        )}

        {/* layout para categorias */}
        {!loading && slug.length <= 1 && categories.length > 0 && (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {categories.map((category) => (
              <div key={category.id} className="break-inside-avoid bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* cabeçalho da categoria */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3">
                  <button
                    onClick={() => handleCategoryClick(category.id)}
                    className="text-left w-full hover:bg-blue-800/20 rounded p-1 -m-1 transition-colors duration-200"
                  >
                    <h2 className="text-lg font-bold">{category.title}</h2>
                    <p className="text-blue-100 text-xs mt-1">
                      Clique para ver todos os produtos
                    </p>
                  </button>
                </div>

                {/* subcategorias */}
                {category.subcategories.length > 0 && (
                  <div className="p-3 space-y-1">
                    {category.subcategories.map((subcategory) => (
                      <button
                        key={subcategory.id}
                        onClick={() => handleSubcategoryClick(category.id, subcategory.id)}
                        className="block w-full text-left p-2 text-sm text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors duration-200"
                      >
                        {subcategory.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* layout de produtos para subcategoria ou categoria */}
        {!loading && subcategoryProducts.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {slug.length >= 2 ? 'Produtos' : `Todos os Produtos da Categoria`}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 auto-rows-fr">
              {subcategoryProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  name={product.title ?? ''}
                  subtitle={product.subtitle ?? ''}
                  image={product.imageUrl ?? ''}
                  onClick={() => handleProductClick(product.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* estado vazio */}
        {!loading && categories.length === 0 && subcategoryProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="mb-6">
              <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">
                Produtos em Breve
              </h2>
              <p className="text-gray-500 mb-6">
                Estamos trabalhando para adicionar produtos nesta categoria.
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <p className="text-sm text-gray-600 mb-4">Enquanto isso, explore outras categorias:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => router.push('/produtos')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ver Todas as Categorias
                </button>
                {slug.length > 0 && (
                  <button
                    onClick={handleBack}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Voltar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}