'use client'
import { useEffect, useState } from "react";
import PathCard from "../../components/PathCard";
import ProductCard from "../../components/ProductCard";
import { useRouter, useParams } from "next/navigation";
import ProductsPage from "../../components/ProductPage";
import * as firebaseFunctions from "@/lib/sendDataTest";
import router from "next/router";

type Product = {
  subtitle: string;
  imageUrl: string;
  technicalInfo: string;
  video: string;
  description: string;
  supplier: string;
  tags: string[];
  title: string;
  price: number;
};

type Path = {
  type: number;
  [key: string]: any;
};

type DataItem = {
  key: string;
};

export default function Produtos() {
  const [items, setItems] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug : params.slug ? [params.slug] : [];

  // Build the current path string
  const currentPath = slug.length > 0
    ? 'produtos/' + slug.join('/') + '/'
    : 'produtos/';


  firebaseFunctions.getSubCategories({ category: "categoria0" })
  useEffect(() => {
    setLoading(true);
        let newItems: DataItem[] = [];
        firebaseFunctions.getCategories().then((element)=>{
          element.forEach((cats) => {
            
            newItems.push({ key: cats as string });
        })
        setItems(newItems);
        setLoading(false);
        });
      
    });
  };

  const handlePathClick = (key: string) => {
    const newSlug = [...slug, key];
    router.push(`/products/${newSlug.join("/")}`);
  };

  const handleProductClick = (key: string) => {
    const newSlug = [...slug, key];
    console.log(newSlug);
    router.push(`/products/${newSlug.join("/")}`);
  };

  const handleBack = () => {
    const newSlug = slug.slice(0, -1);
    router.push(newSlug.length > 0 ? `/products/${newSlug.join("/")}` : "/products");
  };

  const isProduct =
    items.length === 1 &&
    typeof items[0].value === "object" &&
    "supplier" in items[0].value;

  if (isProduct) {
    // Renderize o layout de produto
    const product = items[0].value as Product;
    return (
      <ProductsPage productId={product.title} description={product.description} imageUrl={product.imageUrl} price={product.price} tags={product.tags} supplier={product.supplier} video={product.video} technicalInfo={product.technicalInfo} title={product.title} subtitle={product.subtitle} />
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

  return (
    <div className="flex flex-col gap-10 justify-center items-center">
      {slug.length > 0 && (
        <button onClick={handleBack} style={{ marginBottom: 16 }}>
          ← Back
        </button>
      )}

      <div className="flex flex-wrap gap-4 items-center justify-center">
        {items.map(({ key, value }) => {
          if (typeof value === "object" && "type" in value) {
            return (
              <div
                key={key}
                onClick={() => handlePathClick(key)}
                className="cursor-pointer"
              >
                <PathCard name={key} />
              </div>
            );
          }
          return null;
        })}
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-center">
        {items.map(({ key, value }) => {
          if (typeof value === "object" && "title" in value && "price" in value) {
            return (
              <div
                key={key}
                onClick={() => handleProductClick(key)}
                className="cursor-pointer"
              >
                <ProductCard name={value.title} image={value.imageUrl} />
              </div>
            );
          }
          return null;
        })}
      </div>

    </div>
  );
}