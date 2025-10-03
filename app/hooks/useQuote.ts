
'use client'
import { useState, useEffect } from 'react';

export interface QuoteProduct {
  id: string;
  title: string;
  subtitle: string;
  supplier: string;
  imageUrl: string;
  description: string;
  price?: number;
  productUrl: string;
}

export function useQuote() {
  const [products, setProducts] = useState<QuoteProduct[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar produtos do localStorage na inicialização
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProducts = localStorage.getItem('quoteProducts');
      if (savedProducts) {
        try {
          setProducts(JSON.parse(savedProducts));
        } catch (error) {
          console.error('Erro ao carregar produtos do localStorage:', error);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Salvar produtos no localStorage sempre que mudar
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('quoteProducts', JSON.stringify(products));
    }
  }, [products, isLoaded]);

  const addProduct = (product: QuoteProduct) => {
    setProducts(prev => {
      // Verificar se o produto já existe
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        return prev; // Não adicionar se já existe
      }
      return [...prev, product];
    });
  };

  const removeProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const clearProducts = () => {
    setProducts([]);
  };

  const getTotalProducts = () => products.length;

  return {
    products,
    addProduct,
    removeProduct,
    clearProducts,
    getTotalProducts,
    isLoaded
  };
}