'use client'
import { useEffect, useState } from "react";
import PathCard from "../../components/PathCard";
import ProductCard from "../../components/ProductCard";
import { AdvancedSearch } from "../../components/AdvancedSearch";
import { useRouter, useParams } from "next/navigation";
import ProductsPage from "../../components/ProductPage";
import * as firebaseFunctions from "@/lib/databaseFunctions";
import { generateCanonicalUrl } from "@/lib/canonicalUtils";

type Product = {
  id: string;
  subtitle: string;
  imageUrl: string;
  technicalInfo: string;
  video: string;
  description: string;
  supplier: string;
  tags: string[] | Record<string, string>;
  title: string;
  price: string;
  category: string;
  subcategory: string;
  active: boolean;
};

type Item = { id: string, title?: string, img?: string, active?: boolean, value?: any };
type KVItem = { key: string; value: any };

function isKV(item: Item | KVItem): item is KVItem {
  return 'key' in item && 'value' in item;
}

export default function Produtos() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const slugParam = (params?.slug ?? []) as string[];
  const slug = Array.isArray(slugParam) ? slugParam : [slugParam];

  // URL canônica definida no layout com metadados server-side

  // Normaliza subcategoria para uma chave string (id > title)
  const subcatKey = (sc: any): string =>
    typeof sc === "string" ? sc : String(sc?.id ?? sc?.title ?? "");

  // Função para verificar se um slug corresponde a uma subcategoria
  const isSubcategorySlug = (subcategories: any[], slug: string): boolean => {
    return subcategories.some((sc) => {
      // Verificar por ID
      if (sc.id === slug) return true;
      // Verificar por título
      if (sc.title === slug) return true;
      // Verificar por titleID se existir
      if (sc.titleID === slug) return true;
      return false;
    });
  };

  const [items, setItems] = useState<(Item | KVItem)[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setItems([]); // Limpar itens anteriores
      try {
        if (slug.length === 0) {
          // Buscar categorias principais — SUA LÓGICA MANTIDA
          const categories = await firebaseFunctions.getCategories();
          const itemsList: Item[] = (categories ?? [])
            .filter((c: any) => c?.active)
            .map((c: any) => ({
              id: c.id,
              title: c.title,
              img: "/assets/folderVerus.pdf", // Imagem padrão para categorias
              active: c.active
            }))
            // Ordenar alfabeticamente por título
            .sort((a, b) => {
              const titleA = (a.title || '').toLowerCase();
              const titleB = (b.title || '').toLowerCase();
              return titleA.localeCompare(titleB);
            });
          setItems(itemsList);
        } else if (slug.length === 1) {
          // Buscar subcategorias da categoria
          const subcategories = await firebaseFunctions.getSubCategories({ category: slug[0] });
          
          // Buscar produtos diretamente na categoria (sem subcategoria)
          const productsInCategory = await firebaseFunctions.buscarProdutos({ 
            category: slug[0], 
            subcategory: "" 
          });
          
          const itemsList: (Item | KVItem)[] = [];
          
          // Adicionar subcategorias
          const subcategoryItems: Item[] = (subcategories ?? [])
            .filter((s: any) => s?.active)
            .map((s: any) => ({
              id: s.id,
              title: s.title,
              img: "/assets/folderVerus.pdf", // Imagem padrão para subcategorias
              active: s.active
            }))
            // Ordenar alfabeticamente por título
            .sort((a, b) => {
              const titleA = (a.title || '').toLowerCase();
              const titleB = (b.title || '').toLowerCase();
              return titleA.localeCompare(titleB);
            });
          
          // Adicionar produtos diretos na categoria
          const productItems: KVItem[] = (productsInCategory ?? [])
            .filter((p: any) => p?.active)
            .map((p: any) => ({
              key: p.id,
              value: p
            }))
            // Ordenar alfabeticamente por título do produto
            .sort((a, b) => {
              const titleA = (a.value.title || '').toLowerCase();
              const titleB = (b.value.title || '').toLowerCase();
              return titleA.localeCompare(titleB);
            });
          
          // Combinar subcategorias e produtos
          itemsList.push(...subcategoryItems, ...productItems);
          setItems(itemsList);
        } else if (slug.length === 2) {
          // Buscar produtos da subcategoria
          const products = await firebaseFunctions.buscarProdutos({ 
            category: slug[0], 
            subcategory: slug[1] 
          });
          const itemsList: KVItem[] = (products ?? [])
            .filter((p: any) => p?.active)
            .map((p: any) => ({
              key: p.id,
              value: p
            }))
            // Ordenar alfabeticamente por título do produto
            .sort((a, b) => {
              const titleA = (a.value.title || '').toLowerCase();
              const titleB = (b.value.title || '').toLowerCase();
              return titleA.localeCompare(titleB);
            });
          setItems(itemsList);
        } else if (slug.length === 3) {
          // Página de produto individual
          const product = await firebaseFunctions.getProductById({ id: slug[2] });
          if (product && product.active) {
            setItems([{ key: product.id, value: product }]);
          } else {
            setItems([]);
          }
        } else {
          // Slug muito longo - não encontrado
          setItems([]);
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    // Só executa se o slug mudar
    if (slug.length >= 0) {
      fetchData();
    }
  }, [slug.join('/')]);

  const handlePathClick = (key: string) => {
    const newSlug = [...slug, key];
    router.push(`/products/${newSlug.join("/")}`);
  };

  const handleProductClick = (key: string) => {
    const newSlug = [...slug, key];
    router.push(`/products/${newSlug.join("/")}`);
  };

  const handleBack = () => {
    const newSlug = slug.slice(0, -1);
    router.push(newSlug.length > 0 ? `/products/${newSlug.join("/")}` : "/products");
  };

  // Checa com segurança se é uma página de produto (1 item e possui value.supplier)
  const first = items[0] as any;
  const isProduct =
    items.length === 1 &&
    first &&
    typeof first === "object" &&
    "value" in first &&
    first.value &&
    typeof first.value === "object" &&
    "supplier" in first.value;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isProduct) {
    const product = (items[0] as KVItem).value as Product;
    
    // Verificações de segurança para evitar erros
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
      {/* Barra de Pesquisa */}
      <div className="w-full px-4 mb-4">
        <AdvancedSearch />
      </div>

      {slug.length > 0 && (
        <button 
          onClick={handleBack} 
          className="flex w-min items-center gap-2 px-4 py-2 text-sm sm:text-base text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200 mb-2 sm:mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </button>
      )}

      {/* Container responsivo com grid */}
      <div className="w-full max-w-7xl mx-auto">
        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600 text-sm">Carregando produtos...</p>
            </div>
          </div>
        )}

        {/* Seção de caminhos (categorias ou subcategorias) */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 sm:gap-x-10 lg:gap-x-12 xl:gap-x-16 gap-y-4 sm:gap-y-5 lg:gap-y-6 xl:gap-y-6 px-4 mb-6 sm:mb-8 justify-items-center">
          {items.map((item) => {
            if (isKV(item)) {
              return (
                <ProductCard
                  key={item.key}
                  name={item.value.title}
                  subtitle={item.value.subtitle}
                  image={item.value.imageUrl}
                  onClick={() => handleProductClick(item.key)}
                />
              );
            } else {
              return (
                <PathCard
                  key={item.id}
                  name={item.title || ""}
                  onClick={() => handlePathClick(item.id)}
                />
              );
            }
          })}
          </div>
        )}

        {items.length === 0 && !loading && (
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
            
            {/* Sugestões de navegação */}
            <div className="max-w-2xl mx-auto">
              <p className="text-sm text-gray-600 mb-4">Enquanto isso, explore outras categorias:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => router.push('/products')}
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
      
      {/* Meta tag noindex para páginas vazias */}
      {items.length === 0 && !loading && (
        <head>
          <meta name="robots" content="noindex, follow" />
        </head>
      )}
    </div>
  );
}
