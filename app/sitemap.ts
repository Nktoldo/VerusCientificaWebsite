// app/sitemap.ts
import type { MetadataRoute } from 'next'
import { getCategories, getSubCategories, getProducts } from '@/lib/databaseFunctions'

// Wrapper functions with error handling and timeout for sitemap generation
async function safeGetCategories(): Promise<any[]> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 10000)
    )
    return await Promise.race([getCategories(), timeoutPromise]) as any[]
  } catch (error) {
    console.error('❌ Erro ao buscar categorias:', error)
    return []
  }
}

async function safeGetSubCategories(): Promise<any[]> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 10000)
    )
    return await Promise.race([getSubCategories({ category: 'none' }), timeoutPromise]) as any[]
  } catch (error) {
    console.error('❌ Erro ao buscar subcategorias:', error)
    return []
  }
}

async function safeGetProducts(): Promise<any[]> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 15000)
    )
    return await Promise.race([getProducts(), timeoutPromise]) as any[]
  } catch (error) {
    console.error('❌ Erro ao buscar produtos:', error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.veruscientifica.com.br'
  const now = new Date()

  // Páginas estáticas
  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`,          lastModified: now, changeFrequency: 'weekly',  priority: 1 },
    { url: `${baseUrl}/products`,  lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${baseUrl}/orcamento`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  ]

  try {
    // CATEGORIAS - usar c.id que é gerado por generateLinkID (nome sem espaços)
    const categories = await safeGetCategories()
    
    const categoryUrls: MetadataRoute.Sitemap =
      (categories ?? [])
        .filter((c: any) => c?.active)
        .map((c: any) => ({
          url: `${baseUrl}/products/${c.id}`, // ID da categoria (nome sem espaços)
          lastModified: c.updatedAt ? new Date(c.updatedAt) : now,
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }))

    // Buscar todos os produtos para verificar quais subcategorias têm produtos
    const allProducts = await safeGetProducts()
    
    // SUBCATEGORIAS - usar s.id (Firebase push key) e só incluir se tiver produtos
    const allSubcategories = await safeGetSubCategories()
    
    const subcategoryUrls: MetadataRoute.Sitemap = []
    
    for (const s of (allSubcategories ?? []).filter((s: any) => s?.active)) {
      // Verificar se esta subcategoria tem produtos
      const hasProducts = allProducts.some((p: any) => 
        p?.active && 
        (p.subcategory === s.id || (p.subcategories && p.subcategories.includes(s.id)))
      )
      
      // Só adicionar ao sitemap se tiver produtos
      if (hasProducts) {
        // Encontrar a categoria pai (que usa ID baseado no nome)
        const categoryId = s.categoria || s.category
        
        subcategoryUrls.push({
          url: `${baseUrl}/products/${categoryId}/${s.id}`, // categoria (nome) + subcategoria (ID Firebase)
          lastModified: s.updatedAt ? new Date(s.updatedAt) : now,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        })
      }
    }

    // PRODUTOS - usar p.id (Firebase push key)
    const productUrls: MetadataRoute.Sitemap =
      (allProducts ?? [])
        .filter((p: any) => p?.active)
        .map((p: any) => {
          // Usar primeira categoria e subcategoria
          let categoryId = ''
          let subcategoryId = ''
          
          // Tentar pegar dos paths primeiro (nova estrutura)
          if (p.paths && Array.isArray(p.paths) && p.paths.length > 0) {
            const firstPath = p.paths[0]
            categoryId = firstPath.category || '' // Nome da categoria
            subcategoryId = firstPath.subcategory || '' // ID da subcategoria
          } else {
            // Fallback para estrutura antiga
            categoryId = p.category || ''
            subcategoryId = p.subcategory || ''
          }

          // Construir URL: categoria (nome) / subcategoria (ID) / produto (ID)
          const urlParts = [`${baseUrl}/products`]
          if (categoryId) urlParts.push(categoryId)
          if (subcategoryId) urlParts.push(subcategoryId)
          urlParts.push(p.id) // ID do produto (Firebase push key)

          return {
            url: urlParts.join('/'),
            lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
            changeFrequency: 'monthly' as const,
            priority: 0.6,
          }
        })

    const totalUrls = staticUrls.length + categoryUrls.length + subcategoryUrls.length + productUrls.length

    console.log(`✅ Sitemap gerado com ${totalUrls} URLs`)
    console.log(`  - ${staticUrls.length} páginas estáticas`)
    console.log(`  - ${categoryUrls.length} categorias`)
    console.log(`  - ${subcategoryUrls.length} subcategorias (apenas com produtos)`)
    console.log(`  - ${productUrls.length} produtos`)

    return [...staticUrls, ...categoryUrls, ...subcategoryUrls, ...productUrls]
  } catch (err) {
    console.error('❌ Erro ao gerar sitemap dinâmico:', err)
    return staticUrls
  }
}
