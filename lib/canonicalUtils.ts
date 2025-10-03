// Utilitários para geração de URLs canônicas

const BASE_URL = 'https://www.veruscientifica.com.br';

/**
 * Gera URL canônica para páginas de produtos dinâmicas
 */
export function generateCanonicalUrl(slug: string[]): string {
  if (!slug || slug.length === 0) {
    return `${BASE_URL}/products`;
  }
  
  return `${BASE_URL}/products/${slug.join('/')}`;
}

/**
 * Gera URL canônica para páginas estáticas
 */
export function generateStaticCanonicalUrl(path: string): string {
  // Remove barra inicial se existir
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${BASE_URL}/${cleanPath}`;
}

/**
 * Gera metadados com URL canônica para páginas de produtos
 */
export function generateProductMetadata(slug: string[], title?: string, description?: string) {
  const canonicalUrl = generateCanonicalUrl(slug);
  
  return {
    title: title || `Produtos - Verus Científica`,
    description: description || `Equipamentos para laboratório - ${slug.join(' > ')}`,
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      title: title || `Produtos - Verus Científica`,
      description: description || `Equipamentos para laboratório - ${slug.join(' > ')}`,
      url: canonicalUrl,
      type: 'website' as const
    }
  };
}

/**
 * Gera metadados com URL canônica para páginas estáticas
 */
export function generateStaticMetadata(path: string, title?: string, description?: string) {
  const canonicalUrl = generateStaticCanonicalUrl(path);
  
  return {
    title: title || 'Verus Científica',
    description: description || 'Equipamentos para laboratório',
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      title: title || 'Verus Científica',
      description: description || 'Equipamentos para laboratório',
      url: canonicalUrl,
      type: 'website' as const
    }
  };
}



