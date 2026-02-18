import type { MetadataRoute } from 'next'
import { getCategories, getSubCategories, getProducts } from '@/lib/databaseFunctions'

// wrappers com tratamento de erro e timeout para geração do sitemap
async function safeGetCategories(): Promise<any[]> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 10000)
    )
    return await Promise.race([getCategories(), timeoutPromise]) as any[]
  } catch (error) {
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
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.veruscientifica.com.br'
  const now = new Date()

  // páginas estáticas
  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`,          lastModified: now, changeFrequency: 'weekly',  priority: 1 },
    { url: `${baseUrl}/produtos`,  lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${baseUrl}/orcamento`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
  ]

  try {
    // categorias: usa c.id gerado por generateLinkID (nome sem espaços)
    const categories = await safeGetCategories()
    
    const categoryUrls: MetadataRoute.Sitemap =
      (categories ?? [])
        .filter((c: any) => c?.active)
        .map((c: any) => ({
          url: `${baseUrl}/produtos/${c.id}`, // id da categoria (nome sem espaços)
          lastModified: c.updatedAt ? new Date(c.updatedAt) : now,
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }))

    // buscar todos os produtos para verificar quais subcategorias têm produtos
    const allProducts = await safeGetProducts()
    
    // subcategorias: usa s.id (Firebase) e só inclui se tiver produtos
    const allSubcategories = await safeGetSubCategories()
    
    const subcategoryUrls: MetadataRoute.Sitemap = []
    
    for (const s of (allSubcategories ?? []).filter((s: any) => s?.active)) {
      // verificar se esta subcategoria tem produtos
      const hasProducts = allProducts.some((p: any) => 
        p?.active && 
        (p.subcategory === s.id || (p.subcategories && p.subcategories.includes(s.id)))
      )
      
      if (hasProducts) {
        // encontrar a categoria desta subcategoria
        const categoryId = s.category
        if (categoryId) {
          subcategoryUrls.push({
            url: `${baseUrl}/produtos/${categoryId}/${s.id}`, // categoria (nome) + subcategoria (id Firebase)
            lastModified: s.updatedAt ? new Date(s.updatedAt) : now,
            changeFrequency: 'weekly' as const,
            priority: 0.7,
          })
        }
      }
    }

    // produtos - usar estrutura: categoria/subcategoria/produto
    const productUrls: MetadataRoute.Sitemap = []
    
    for (const p of (allProducts ?? []).filter((p: any) => p?.active)) {
      // constrói URL baseada na estrutura do produto
      const urlParts = [`${baseUrl}/produtos`]
      
      // adicionar categoria (nome sem espaços)
      if (p.category) {
        urlParts.push(p.category)
      }
      
      // adiciona subcategoria (id Firebase)
      if (p.subcategory) {
        urlParts.push(p.subcategory)
      }
      
      // adiciona produto (id Firebase)
      urlParts.push(p.id)
      
      productUrls.push({
        url: urlParts.join('/'),
        lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })
    }

    // combina todas as URLs
    return [
      ...staticUrls,
      ...categoryUrls,
      ...subcategoryUrls,
      ...productUrls,
    ]

  } catch (error) {
    // ignora erro e retorna sitemap mínimo
    // retorna pelo menos as URLs estáticas em caso de erro
    return staticUrls
  }
}