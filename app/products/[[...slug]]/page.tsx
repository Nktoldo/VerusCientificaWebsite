'use client'
import { useEffect, useState } from "react";
import PathCard from "../../components/PathCard";
import ProductCard from "../../components/ProductCard";
import { AdvancedSearch } from "../../components/AdvancedSearch";
import { useRouter, useParams } from "next/navigation";
import ProductsPage from "../../components/ProductPage";
import * as firebaseFunctions from "@/lib/databaseFunctions";
import ProductCardSquare from "@/app/components/ProductCardSquare";
import ProductCardMinimal from "@/app/components/ProductCardMinimal";

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

// ==== SUA PARTE (mantida) ====
type Item = { id: string, title?: string, img?: string, active?: boolean, category?: string }
// =============================

// Itens no formato { key, value } usados nas rotas de subcats/produtos
type KVItem = { key: string; value: any };

function isKV(item: Item | KVItem): item is KVItem {
  return (item as KVItem).key !== undefined;
}

export default function Produtos() {
  const [items, setItems] = useState<Array<Item | KVItem>>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();
  const slugParam = (params?.slug ?? []) as string[];
  const slug = Array.isArray(slugParam) ? slugParam : [slugParam];

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


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (slug.length === 0) {
          // Buscar categorias principais — SUA LÓGICA MANTIDA
          const categories = await firebaseFunctions.getCategories();
          const categoryList: Item[] = [];
          categories.forEach(cats => {
            categoryList.push({
              id: cats.id,
              title: cats.title
            });
          });
          setItems(categoryList);

        } else if (slug.length === 1) {
          const [subcategories, productsByRef] = await Promise.all([
            firebaseFunctions.getSubCategories({ category: slug[0] }),
            firebaseFunctions.buscarProdutosPorCategoria(slug[0])
          ]);

          // SEMPRE buscar produtos da categoria (fallback garantido)
          let products = productsByRef || [];
          if (products.length === 0) {
            const fallback = await firebaseFunctions.buscarProdutos({ category: slug[0], subcategory: "" });
            products = fallback.filter((p: any) => p.category === slug[0] && (!p.subcategory || p.subcategory === ""));
          }

          const subcategoryItems: KVItem[] = subcategories
            .map((sc: any) => ({
              key: subcatKey(sc),
              value: { 
                type: "subcategory",
                id: sc.id,
                title: sc.title,
                category: sc.category
              }
            }))
            .filter(it => it.key); // remove vazios por segurança

          const productItems: KVItem[] = products.map((product: any) => ({
            key: product.id,
            value: product
          }));

          // Combina subcategorias e produtos na mesma lista
          const combinedItems: Array<KVItem> = [...subcategoryItems, ...productItems];
          setItems(combinedItems);

        } else if (slug.length === 2) {
          const [category, second] = slug;

          // Heurística: tenta primeiro tratar como subcategoria conhecida
          const subcategories = await firebaseFunctions.getSubCategories({ category });
          const isKnownSubcategory = isSubcategorySlug(subcategories, second);

          if (isKnownSubcategory) {
            // Buscar produtos da subcategoria
            const products = await firebaseFunctions.buscarProdutos({
              category,
              subcategory: second
            });
            const newItems: KVItem[] = products.map((product: any) => ({
              key: product.id,
              value: product
            }));
            setItems(newItems);
          } else {
            // Tentar carregar como produto por ID
            const product = await firebaseFunctions.getProductById({ id: second });
            if (product && typeof product === 'object' && 'id' in product) {
              setItems([{ key: (product as any).id, value: product }]);
            } else {
              setItems([]);
            }
          }
        } else if (slug.length === 3) {
          // Slug com 3 elementos: categoria/subcategoria/produto
          const [category, subcategory, productId] = slug;
          
          // Tentar carregar o produto diretamente por ID
          const product = await firebaseFunctions.getProductById({ id: productId });
          if (product && typeof product === 'object' && 'id' in product) {
            setItems([{ key: (product as any).id, value: product }]);
          } else {
            setItems([]);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
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
        productId={product.id || ''}
        description={product.description || ''}
        imageUrl={product.imageUrl || ''}
        price={parseFloat(String(product.price || 0))}
        tags={safeTags}
        supplier={product.supplier || ''}
        video={product.video || ''}
        technicalInfo={product.technicalInfo || ''}
        title={product.title || ''}
        subtitle={product.subtitle || ''}
      />
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/70 z-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <span className="text-blue-700 font-semibold text-lg">Carregando...</span>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !loading) {
    return (
      <div className="flex flex-col gap-10 justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Nenhum item encontrado</h2>
          <p className="text-gray-500">Não foi possível carregar os dados solicitados.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 justify-center items-center">
      {/* Barra de Pesquisa */}
      <div className="w-full max-w-4xl px-4">
        <AdvancedSearch />
      </div>

      {slug.length > 0 && (
        <button onClick={handleBack} style={{ marginBottom: 16 }}>
          ← Back
        </button>
      )}

      {/* Seção de caminhos (categorias ou subcategorias) */}
      <div className="flex flex-wrap gap-4 items-center justify-center">
        {items.map((it) => {
          if (isKV(it) && typeof it.value === "object" && "type" in it.value) {
            // subcategoria (formato { key, value: { type: 'subcategory', id, title, category } })
            const key = it.key;
            const title = it.value.title || it.value.id || key;
            return (
              <div key={key} onClick={() => handlePathClick(key)} className="cursor-pointer">
                <PathCard name={title} />
              </div>
            );
          }
          if (!isKV(it)) {
            // categoria (formato { id, title })
            const key = it.id;
            const name = it.title ?? it.id;
            return (
              <div key={key} onClick={() => handlePathClick(key)} className="cursor-pointer">
                <PathCard name={name} />
              </div>
            );
          }
          return null;
        })}
      </div>

      {/* Seção de produtos */}
      <div className="flex flex-wrap gap-4 items-center justify-center">
        {items.map((it) => {
          if (isKV(it) && typeof it.value === "object" && "title" in it.value && "price" in it.value) {
            const a = it.value as Product;
            console.log("IT" + a);
            const key = it.key;
            const value = it.value as Product;
            return (
              <div key={key} onClick={() => handleProductClick(key)}>
                <ProductCard name={value.title} image={value.imageUrl} subtitle={value.subtitle} />
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
