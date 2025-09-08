/**
 * Sistema de cache inteligente para busca
 * Reduz chamadas desnecessárias ao Firebase e melhora performance
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  hits: number;
}

interface SearchFilters {
  types: string[];
  categories: string[];
  suppliers: string[];
  tags: string[];
  priceRange: {
    min: number;
    max: number;
  };
}

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

class SearchCache {
  private cache = new Map<string, CacheItem<SearchResult[]>>();
  private maxSize = 100; // Máximo de itens no cache
  private defaultTTL = 5 * 60 * 1000; // 5 minutos em produção, 1 minuto em desenvolvimento
  private hits = 0;
  private misses = 0;

  constructor() {
    // Limpar cache periodicamente
    if (typeof window !== 'undefined') {
      setInterval(() => this.cleanup(), 60000); // Limpar a cada minuto
    }
  }

  private generateKey(query: string, filters: SearchFilters): string {
    // Criar chave única baseada na query e filtros
    const filterString = JSON.stringify({
      types: filters.types.sort(),
      categories: filters.categories.sort(),
      suppliers: filters.suppliers.sort(),
      tags: filters.tags.sort(),
      priceRange: filters.priceRange
    });
    
    return `${query.toLowerCase().trim()}:${filterString}`;
  }

  private isExpired(item: CacheItem<SearchResult[]>): boolean {
    const now = Date.now();
    const ttl = process.env.NODE_ENV === 'development' ? 60000 : this.defaultTTL; // 1 min em dev, 5 min em prod
    return now - item.timestamp > ttl;
  }

  private cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Remover itens expirados
    entries.forEach(([key, item]) => {
      if (this.isExpired(item)) {
        this.cache.delete(key);
      }
    });

    // Se ainda estiver muito grande, remover os menos usados
    if (this.cache.size > this.maxSize) {
      const sortedEntries = entries
        .filter(([_, item]) => !this.isExpired(item))
        .sort((a, b) => a[1].hits - b[1].hits);
      
      const toRemove = sortedEntries.slice(0, this.cache.size - this.maxSize);
      toRemove.forEach(([key]) => this.cache.delete(key));
    }
  }

  get(query: string, filters: SearchFilters): SearchResult[] | null {
    const key = this.generateKey(query, filters);
    const item = this.cache.get(key);

    if (!item) {
      this.misses++;
      return null;
    }

    if (this.isExpired(item)) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Incrementar hits e atualizar timestamp
    item.hits++;
    item.timestamp = Date.now();
    this.hits++;

    return item.data;
  }

  set(query: string, filters: SearchFilters, data: SearchResult[]): void {
    const key = this.generateKey(query, filters);
    
    // Limpar cache se estiver muito grande
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }

    this.cache.set(key, {
      data: [...data], // Clonar array para evitar mutação
      timestamp: Date.now(),
      hits: 0
    });
  }

  // Método para invalidar cache quando dados são atualizados
  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.includes(pattern.toLowerCase())) {
        this.cache.delete(key);
      }
    });
  }

  // Método para obter estatísticas do cache
  getStats() {
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits / (this.hits + this.misses) || 0
    };
  }

  // Método para limpar cache manualmente
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }
}

// Exportar instância singleton
export const searchCache = new SearchCache();

// Exportar tipos
export type { SearchFilters, SearchResult };
