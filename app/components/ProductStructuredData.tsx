import { useEffect } from 'react';

interface ProductStructuredDataProps {
  product: {
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    imageUrl?: string;
    price?: string | number;
    supplier: string;
    category?: string;
    subcategory?: string;
  };
}

export default function ProductStructuredData({ product }: ProductStructuredDataProps) {
  useEffect(() => {
    // gerar dados estruturados para o produto
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.title,
      "description": product.description || product.subtitle || `Equipamento ${product.title} para laboratórios`,
      "brand": {
        "@type": "Brand",
        "name": product.supplier
      },
      "category": product.category || "Equipamentos para Laboratório",
      "image": product.imageUrl ? [product.imageUrl] : [],
      "offers": {
        "@type": "Offer",
        "price": product.price || "Sob consulta",
        "priceCurrency": "BRL",
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "Organization",
          "name": "Verus Científica",
          "url": "https://www.veruscientifica.com.br"
        },
        "url": typeof window !== 'undefined' ? window.location.href : ''
      },
      "manufacturer": {
        "@type": "Organization",
        "name": product.supplier
      }
    };

    // remover dados estruturados anteriores se existirem
    const existingScript = document.getElementById('product-structured-data');
    if (existingScript) {
      existingScript.remove();
    }

    // adicionar novos dados estruturados
    const script = document.createElement('script');
    script.id = 'product-structured-data';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    // função de limpeza
    return () => {
      const scriptToRemove = document.getElementById('product-structured-data');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [product]);

  return null; // este componente não renderiza nada visualmente
}



