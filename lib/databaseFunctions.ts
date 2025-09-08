import { ref, set, update, onValue, get, child, push, orderByChild, equalTo, query, remove } from "firebase/database";
import { db } from './firebase.mjs';
import { storage } from './firebase.mjs';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getStorage } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { logger } from './logger';
import { searchCache, type SearchFilters as CacheSearchFilters, type SearchResult as CacheSearchResult } from './searchCache';

// tipagem para caminhos do produto
type ProductPath = {
  id: string;
  category: string;
  subcategory?: string; // ID da subcategoria
  subcategoryTitle?: string; // Título da subcategoria para exibição
  displayName: string;
};

// tipagem object de produtos passado para o bd
type Product = {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  technicalInfo?: string;
  category: string; // Mantido para compatibilidade
  subcategory?: string; // Mantido para compatibilidade
  categories?: string[]; // Nova estrutura para múltiplas categorias
  subcategories?: string[]; // Nova estrutura para múltiplas subcategorias
  paths?: ProductPath[]; // Nova estrutura para caminhos completos
  imageUrl?: string;
  price?: string;
  tags?: string[] | Record<number, string>;
  supplier: string;
  video?: string;
  active: boolean;
};

type Categoria = {
  id: string,
  title: string,
  titleID?: string, // ID baseado no título para uso geral no site
  category?: string,
  active: boolean
}

// criacao de usuarios
export function writeUserData(name: string, email: string, password: string, admin: boolean) {
  push(ref(db, 'users/'), {
    username: name,
    email: email,
    password: password,
    admin: admin
  });
}

// cria ID para o link de uma categoria ou equipto especifico ( caso tenha titulo igual, vai sobrepor ou atualizar!!! )
function generateLinkID({ title }: { title: string }) {
  const ID = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '');
  return ID;
}

// cadastra produto no bd
export async function writeProductData({
  title,
  subtitle,
  description,
  technicalInfo,
  imageUrl,
  category,
  subcategory = "",
  categories = [],
  subcategories = [],
  paths = [],
  price,
  tags,
  supplier,
  video = ""
}: {
  title: string;
  subtitle: string;
  description: string;
  technicalInfo: string;
  imageUrl: string;
  category: string;
  subcategory?: string;
  categories?: string[];
  subcategories?: string[];
  paths?: ProductPath[];
  price: string;
  tags: string[] | Record<number, string>;
  supplier: string;
  video?: string;
}) {

  // se nao houver categoria selecionada, evita que produto seja criado na raiz da pagina de produtos
  if (!category) {
    alert("Erro ao cadastrar produto, necessario selecionar categoria/subcategoria primeiro")
  } else {
    // Preparar arrays de categorias e subcategorias
    const categoriesArray = categories.length > 0 ? Array.from(new Set(categories)) : [category];
    const subcategoriesArray = subcategories.length > 0 ? Array.from(new Set(subcategories.filter(sub => sub && sub !== ""))) : (subcategory && subcategory !== "" ? [subcategory] : []);

    // Limpar valores undefined dos paths antes de enviar
    const cleanPaths = paths.map(path => ({
      id: path.id,
      category: path.category,
      ...(path.subcategory && { subcategory: path.subcategory }),
      ...(path.subcategoryTitle && { subcategoryTitle: path.subcategoryTitle }),
      displayName: path.displayName
    }));

    const productData: any = {
      title: title,
      subtitle: subtitle,
      description: description,
      technicalInfo: technicalInfo,
      category: category,
      subcategory: !subcategory ? "" : subcategory,
      imageUrl: imageUrl,
      price: price,
      tags: tags,
      supplier: supplier,
      active: true,
      video: !video ? "" : video
    };

    // Só adicionar arrays se há múltiplas categorias/subcategorias
    if (categoriesArray.length > 1) {
      productData.categories = categoriesArray;
    }
    if (subcategoriesArray.length > 0) {
      productData.subcategories = subcategoriesArray;
    }
    if (cleanPaths.length > 1) {
      productData.paths = cleanPaths;
    }

    push(ref(db, `produtos`), productData);
  }
}

// cria e edita categorias
export async function writeCategoryData({ title }: { title: string }) {
  let categoryID = await generateLinkID({ title });
  update(ref(db, `categorias/${categoryID}/`), {
    title: title,
    id: categoryID,
    active: true
  });
}

// cria e edita subcategorias
export async function writeSubcategoryData({ title, category }: { title: string, category: string }) {
  // Usar push para permitir subcategorias com mesmo nome em categorias diferentes
  const subcategoriaRef = push(ref(db, 'subcategorias'));
  const subcategoriaID = subcategoriaRef.key;
  
  await set(subcategoriaRef, {
    title: title, 
    categoria: category, // Sempre usar "categoria" para consistência
    active: true
  });
  
  return subcategoriaID;
}

// cria e edita fornecedores
export async function writeSupplierData({ title, type }: { title: string, type: "representada" | "revenda" | "Representada" | "Revenda" }) {
  update(ref(db, `filtros/suppliers/${title}`), {
    type: type,
    active: true
  })
}

// cria e edita tags
export async function writeTagsData({ title, color, active }: { title: string, color?: string, active?: boolean }) {
    set(ref(db, `filtros/tags/${title}`), {
      active: active !== undefined ? active : true,
      color: color || "#3B82F6" // cor padrão azul se não for especificada
  })
}

// função para upload de imagem no Storage
export async function uploadProductImage(file: File, imageId: string) {
  const imgRef = storageRef(storage, `produtos/${imageId}`);
  await uploadBytes(imgRef, file);
  return await getDownloadURL(imgRef);
}

// recebe o HTML, faz upload das imagens base64 e retorna o HTML com srcs do Storage
export async function processDescriptionImages(html: string): Promise<string> {
  // regex para pegar todas as imagens base64
  const imgRegex = /<img[^>]+src=["'](data:image\/[^"']+)["'][^>]*>/g;
  let match;
  let newHtml = html;
  const promises = [];

  while ((match = imgRegex.exec(html)) !== null) {
    const base64 = match[1];

    // converte base64 para Blob/File
    const res = await fetch(base64);
    const blob = await res.blob();
    const file = new File([blob], uuidv4() + '.png', { type: blob.type });

    // upload para o Storage
    const imageId = uuidv4();
    const uploadPromise = uploadProductImage(file, `descricao/${imageId}`).then(url => {
      // substituir o src antigo pelo novo
      newHtml = newHtml.replace(base64, url);
    });
    promises.push(uploadPromise);
  }

  await Promise.all(promises);
  return newHtml;
}

// faz a primeira busca de produtos do site 
export async function buscarProdutos({ category, subcategory }: { category: string, subcategory: string }): Promise<Product[]> {
  if (category) {
    try {
      // Buscar o título da categoria pelo ID para compatibilidade
      let categoryTitle = category;
      try {
        const categorySnapshot = await get(ref(db, `categorias/${category}`));
        if (categorySnapshot.exists()) {
          const categoryData = categorySnapshot.val();
          if (categoryData && categoryData.title) {
            categoryTitle = categoryData.title;
          }
        }
      } catch (e) {
        console.log("Não foi possível buscar título da categoria:", e);
      }

      // Buscar todos os produtos e filtrar no cliente (mais flexível)
      const snapshot = await get(ref(db, "produtos"));
      
      if (!snapshot.exists()) {
        console.log("Nenhum produto encontrado no banco");
        return [];
      }

      let dados = snapshot.val();
      let produtos: Product[] = [];

      Object.entries(dados).forEach(([key, item]: [string, any]) => {
        // Filtrar apenas produtos ativos
        if (item.active === true) {
          let categoriaMatch = false;
          let subcategoriaMatch = true; // Default true se não há subcategoria

          // Verificar categoria principal (compatibilidade) - tanto por ID quanto por título
          if (item.category === category || item.category === categoryTitle) {
            categoriaMatch = true;
          }
          
          // Verificar array de categorias (nova estrutura)
          if (item.categories && Array.isArray(item.categories) && item.categories.includes(category)) {
            categoriaMatch = true;
          }

          // Verificar paths (nova estrutura)
          if (item.paths && Array.isArray(item.paths)) {
            const pathMatch = item.paths.some((path: any) => path.category === category);
            if (pathMatch) {
              categoriaMatch = true;
            }
          }
          
          if (categoriaMatch) {
            // Se há subcategoria especificada, verificar se o produto pertence a ela
            if (subcategory) {
              subcategoriaMatch = false;
              
              // Verificar subcategoria principal (compatibilidade)
              if (item.subcategory === subcategory) {
                subcategoriaMatch = true;
              }
              
              // Verificar array de subcategorias (nova estrutura)
              if (item.subcategories && Array.isArray(item.subcategories) && item.subcategories.includes(subcategory)) {
                subcategoriaMatch = true;
              }

              // Verificar paths (nova estrutura)
              if (item.paths && Array.isArray(item.paths)) {
                const pathMatch = item.paths.some((path: any) => 
                  path.subcategory === subcategory || path.subcategoryTitle === subcategory
                );
                if (pathMatch) {
                  subcategoriaMatch = true;
                }
              }
            } else {
              // Se não há subcategoria especificada, só mostrar produtos que estão APENAS na categoria
              // (não em subcategorias específicas)
              const temSubcategoria = (() => {
                // Verificar se tem subcategoria na estrutura legada
                if (item.subcategory && item.subcategory !== "") return true;
                
                // Verificar se tem subcategorias no array
                if (item.subcategories && Array.isArray(item.subcategories)) {
                  return item.subcategories.some((sub: any) => sub && sub !== "");
                }
                
                // Verificar se tem subcategoria nos paths
                if (item.paths && Array.isArray(item.paths)) {
                  return item.paths.some((path: any) => path.subcategory && path.subcategory !== "");
                }
                
                return false;
              })();
              
              console.log(`🔍 Produto ${item.title}: temSubcategoria = ${temSubcategoria}`);
              
              // Se o produto tem subcategoria, não mostrar na categoria pai
              if (temSubcategoria) {
                subcategoriaMatch = false;
                console.log(`❌ Produto ${item.title} tem subcategoria, não será mostrado na categoria pai`);
              } else {
                console.log(`✅ Produto ${item.title} será mostrado na categoria pai`);
              }
            }

            if (subcategoriaMatch) {
              produtos.push({ id: key, ...item });
            }
          }
        }
      });

      console.log("Produtos encontrados:", produtos);
      return produtos;
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      return [];
    }
  }

  return [];
}

// busca produtos de uma categoria específica usando referências diretas (mais eficiente)
export async function buscarProdutosPorCategoria(category: string): Promise<Product[]> {
  console.log("Buscando produtos da categoria:", category);

  try {
    // Usar a função buscarProdutos que funciona corretamente
    const produtos = await buscarProdutos({ category, subcategory: "" });
    console.log("Produtos carregados:", produtos);
    return produtos;

  } catch (error) {
    console.error("Erro ao buscar produtos da categoria:", error);
    return [];
  }
}

// busca produtos que pertencem a múltiplas categorias
export async function buscarProdutosPorMultiplasCategorias(categories: string[]): Promise<Product[]> {
  console.log("Buscando produtos das categorias:", categories);

  if (categories.length === 0) return [];

  try {
    // Buscar todos os produtos e filtrar por categorias
    const snapshot = await get(ref(db, "produtos"));
    if (!snapshot.exists()) return [];

    const produtos: Product[] = [];
    const dados = snapshot.val();

    Object.entries(dados).forEach(([key, item]: [string, any]) => {
      if (item.active === true) {
        // Verificar se o produto pertence a pelo menos uma das categorias
        const pertenceACategoria = categories.some(cat => {
          // Verificar categoria principal (compatibilidade)
          if (item.category === cat) return true;
          // Verificar array de categorias (nova estrutura)
          if (item.categories && Array.isArray(item.categories)) {
            return item.categories.includes(cat);
          }
          return false;
        });

        if (pertenceACategoria) {
          produtos.push({ id: key, ...item });
        }
      }
    });

    console.log("Produtos encontrados em múltiplas categorias:", produtos);
    return produtos;

  } catch (error) {
    console.error("Erro ao buscar produtos por múltiplas categorias:", error);
    return [];
  }
}

// busca produtos que pertencem a múltiplas subcategorias
export async function buscarProdutosPorMultiplasSubcategorias(subcategories: string[]): Promise<Product[]> {
  console.log("Buscando produtos das subcategorias:", subcategories);

  if (subcategories.length === 0) return [];

  try {
    // Buscar todos os produtos e filtrar por subcategorias
    const snapshot = await get(ref(db, "produtos"));
    if (!snapshot.exists()) return [];

    const produtos: Product[] = [];
    const dados = snapshot.val();

    Object.entries(dados).forEach(([key, item]: [string, any]) => {
      if (item.active === true) {
        // Verificar se o produto pertence a pelo menos uma das subcategorias
        const pertenceASubcategoria = subcategories.some(subcat => {
          // Verificar subcategoria principal (compatibilidade)
          if (item.subcategory === subcat) return true;
          // Verificar array de subcategorias (nova estrutura)
          if (item.subcategories && Array.isArray(item.subcategories)) {
            return item.subcategories.includes(subcat);
          }
          return false;
        });

        if (pertenceASubcategoria) {
          produtos.push({ id: key, ...item });
        }
      }
    });

    console.log("Produtos encontrados em múltiplas subcategorias:", produtos);
    return produtos;

  } catch (error) {
    console.error("Erro ao buscar produtos por múltiplas subcategorias:", error);
    return [];
  }
}

// função para atualizar estrutura da categoria e adicionar referências aos produtos

export async function atualizarEstruturaCategoria(categoryName: string) {
  try {
    // 1. Buscar todos os produtos da categoria
    const snapshot = await get(query(
      ref(db, "produtos"),
      orderByChild("category"),
      equalTo(categoryName)
    ));

    if (snapshot.exists()) {
      const produtos = snapshot.val();
      const produtoIds: string[] = [];

      // Coletar IDs dos produtos ativos
      Object.entries(produtos).forEach(([id, item]: [string, any]) => {
        if (item.active === true && item.category === categoryName) {
          produtoIds.push(id);
        }
      });

      // 2. Atualizar estrutura da categoria
      await update(ref(db, `categorias/${categoryName}`), {
        active: true,
        produtos: produtoIds
      });

      console.log(`Categoria ${categoryName} atualizada com ${produtoIds.length} produtos`);
      return produtoIds;
    }

    return [];
  } catch (error) {
    console.error("Erro ao atualizar estrutura da categoria:", error);
    return [];
  }
}

export async function getTags(): Promise<string[]> {
  let tagsList: string[] = [];
  let snapshot = await get(ref(db, "filtros/tags"));
  snapshot.forEach(tag => {
    tagsList.push(tag.key);
  });
  return tagsList;
}

export async function getSuppleiers(): Promise<string[]> {
  let suppliersList: string[] = [];
  let snapshot = await get(ref(db, "filtros/suppliers"));
  snapshot.forEach(supplier => {
    suppliersList.push(supplier.key)
  });
  return suppliersList;
}

// pega categorias
export async function getCategories(): Promise<Categoria[]> {
  let categoriasList: Categoria[] = [];
  let snapshot = await get(ref(db, "categorias"))
  snapshot.forEach(element => {
    const value = element.val();
    if (typeof value === 'object') {
      // Se não tem título, usar o ID como título
      const title = value.title || element.key || 'Categoria sem nome';
      categoriasList.push({
        id: element.key,
        title: title,
        active: value.active
      })
    }
  });
  return categoriasList
}

// util: normaliza chaves (remove acentos e espaços)
export function normalizeKey(input: string): string {
  return (input || "")
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .trim();
}

// pega subcategorias passando a categoria como parametro
export async function getSubCategories({ category }: { category: string }): Promise<Categoria[]> {
  console.log("Buscando subcategorias para categoria:", category);
  let subCategoriasList: Categoria[] = [];

  try {
    // Busca todas e filtra no cliente para tolerar diferenças de formatação
    const snapshot = await get(ref(db, "subcategorias"));
    const all = snapshot.val() || {};

    if (category !== "none") {
      // Buscar o título da categoria pelo ID para compatibilidade
      let categoryTitle = category;
      try {
        const categorySnapshot = await get(ref(db, `categorias/${category}`));
        if (categorySnapshot.exists()) {
          const categoryData = categorySnapshot.val();
          if (categoryData && categoryData.title) {
            categoryTitle = categoryData.title;
          }
        }
      } catch (e) {
        console.log("Não foi possível buscar título da categoria:", e);
      }

      Object.entries(all).forEach(([key, val]: [string, any]) => {
        if (typeof val === 'object' && val !== null) {
          const cat = val.categoria || val.category || "";
          const isActive = val.active !== false; // Mais rigoroso: só ativo se explicitamente true
          
          // Buscar tanto por ID da categoria quanto por título da categoria
          if (isActive && (cat === category || cat === categoryTitle)) {
            subCategoriasList.push({
              id: key, // ID único do Firebase (chave do push)
              title: val.title || val.titulo || key, // Fallback para key se não há título
              titleID: val.titleID, // ID baseado no título para uso geral
              category: val.categoria || val.category,
              active: val.active
            });
          }
        }
      });

      console.log("Subcategorias encontradas:", subCategoriasList);
    } else {
      // Buscar todas as subcategorias
      Object.entries(all).forEach(([key, val]: [string, any]) => {
        if (typeof val === 'object' && val !== null) {
          const isActive = val.active !== false;
          if (isActive) {
            subCategoriasList.push({
              id: key,
              title: val.title || val.titulo || key,
              titleID: val.titleID,
              category: val.categoria || val.category,
              active: val.active
            })
          }
        }
      })
    }
  } catch (error) {
    console.error("Erro ao buscar subcategorias:", error);
  }
  
  return subCategoriasList;
}

// busca subcategorias por titleID (para uso geral no site)
export async function getSubCategoriesByTitleID(titleID: string): Promise<Categoria[]> {
  console.log("Buscando subcategorias por titleID:", titleID);
  let subCategoriasList: Categoria[] = [];

  const snapshot = await get(ref(db, "subcategorias"));
  const all = snapshot.val() || {};

  Object.entries(all).forEach(([key, val]: [string, any]) => {
    const isActive = val === true || (typeof val === 'object' ? val.active !== false : false);
    if (isActive && val.titleID === titleID) {
      subCategoriasList.push({
        id: key,
        title: val.title || val.titulo,
        titleID: val.titleID,
        category: val.categoria,
        active: val.active
      })
    }
  });

  console.log("Subcategorias encontradas por titleID:", subCategoriasList);
  return subCategoriasList;
}

// busca uma subcategoria específica por ID único (para links específicos)
export async function getSubCategoryByID(id: string): Promise<Categoria | null> {
  console.log("Buscando subcategoria por ID:", id);
  
  const snapshot = await get(ref(db, `subcategorias/${id}`));
  if (!snapshot.exists()) {
    return null;
  }

  const val = snapshot.val();
  const isActive = val === true || (typeof val === 'object' ? val.active !== false : false);
  
  if (!isActive) {
    return null;
  }

  return {
    id: id, // ID único do Firebase (chave do push)
    title: val.title || val.titulo,
    titleID: val.titleID,
    category: val.categoria,
    active: val.active
  };
}

// função utilitária para obter o título de uma subcategoria pelo ID
export async function getSubcategoryTitleById(id: string): Promise<string | null> {
  try {
    const subcategory = await getSubCategoryByID(id);
    return subcategory ? subcategory.title : null;
  } catch (error) {
    console.error('Erro ao buscar título da subcategoria:', error);
    return null;
  }
}

// Tipos para busca global
type SearchFilters = {
  types: string[];
  categories: string[];
  suppliers: string[];
  priceRange: {
    min: number;
    max: number;
  };
  tags: string[];
};

type SearchResult = {
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
};

// Função de busca global otimizada com cache
export async function globalSearch({ query, filters }: { query: string, filters: CacheSearchFilters }): Promise<CacheSearchResult[]> {
  const startTime = performance.now();
  logger.debug("Iniciando busca global", { query: query.substring(0, 50), filtersCount: Object.keys(filters).length });
  
  if (!query.trim()) return [];

  // Verificar cache primeiro
  const cachedResults = searchCache.get(query, filters);
  if (cachedResults) {
    logger.debug("Resultado encontrado no cache", { query: query.substring(0, 50), resultsCount: cachedResults.length });
    return cachedResults;
  }

  const searchTerm = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  try {
    // Buscar produtos
    if (filters.types.includes('product')) {
      // Buscar produtos completos com todas as informações
      const snapshot = await get(ref(db, "produtos/"));
      if (!snapshot.exists()) return [];
      
      const data = snapshot.val();
      const products = Object.entries(data)
        .map(([id, value]: [string, any]) => ({ id, ...value }))
        .filter((product: any) => product.active === true);
      const productResults = products
        .filter(product => {
          // Filtros básicos (já filtrado acima, mas verificando novamente por segurança)
          if (!product.active) return false;
          
          // Filtro por fornecedores
          if (filters.suppliers.length > 0 && !filters.suppliers.includes(product.supplier)) return false;
          
          // Filtro por tags
          if (filters.tags.length > 0 && Array.isArray(product.tags)) {
            const hasMatchingTag = product.tags.some((tag: string) => filters.tags.includes(tag));
            if (!hasMatchingTag) return false;
          }
          
          // Filtro de preço
          if (product.price) {
            const price = parseFloat(product.price);
            if (price < filters.priceRange.min || price > filters.priceRange.max) return false;
          }

          // Busca no texto - otimizada para performance
          const title = product.title?.toLowerCase() || '';
          const subtitle = product.subtitle?.toLowerCase() || '';
          const description = product.description?.toLowerCase() || '';
          const supplier = product.supplier?.toLowerCase() || '';
          
          // Verificar match direto nos campos principais primeiro
          if (title.includes(searchTerm) || subtitle.includes(searchTerm) || 
              description.includes(searchTerm) || supplier.includes(searchTerm)) {
            return true;
          }
          
          // Verificar tags
          if (Array.isArray(product.tags)) {
            if (product.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm))) {
              return true;
            }
          }
          
          // Verificar categorias e subcategorias
          const hasPaths = product.paths && product.paths.length > 0;
          if (hasPaths) {
            if (product.paths.some((path: any) => 
              path.category?.toLowerCase().includes(searchTerm) || 
              path.subcategoryTitle?.toLowerCase().includes(searchTerm)
            )) {
              return true;
            }
          } else {
            // Estrutura legada
            const category = product.category?.toLowerCase() || '';
            const subcategory = product.subcategory?.toLowerCase() || '';
            if (category.includes(searchTerm) || subcategory.includes(searchTerm)) {
              return true;
            }
          }
          
          return false;
        })
        .map(product => {
          let relevance = 0;
          
          // Calcular relevância - otimizado para performance
          const title = product.title?.toLowerCase() || '';
          const subtitle = product.subtitle?.toLowerCase() || '';
          const description = product.description?.toLowerCase() || '';
          const supplier = product.supplier?.toLowerCase() || '';
          
          if (title.includes(searchTerm)) relevance += 0.4;
          if (subtitle.includes(searchTerm)) relevance += 0.3;
          if (description.includes(searchTerm)) relevance += 0.2;
          if (supplier.includes(searchTerm)) relevance += 0.1;
          
          // Relevância para tags
          if (Array.isArray(product.tags)) {
            product.tags.forEach((tag: string) => {
              if (tag.toLowerCase().includes(searchTerm)) relevance += 0.15;
            });
          }
          
          // Relevância para categorias e subcategorias
          const hasPaths = product.paths && product.paths.length > 0;
          if (hasPaths) {
            product.paths.forEach((path: any) => {
              if (path.category?.toLowerCase().includes(searchTerm)) relevance += 0.1;
              if (path.subcategoryTitle?.toLowerCase().includes(searchTerm)) relevance += 0.1;
            });
          } else {
            // Estrutura legada
            if (product.category?.toLowerCase().includes(searchTerm)) relevance += 0.1;
            if (product.subcategory?.toLowerCase().includes(searchTerm)) relevance += 0.1;
          }

          // Determinar categoria e subcategoria para navegação
          let primaryCategory = '';
          let primarySubcategory = '';
          
          if (product.paths && product.paths.length > 0) {
            // Usar o primeiro path como principal
            const firstPath = product.paths[0];
            primaryCategory = firstPath.category;
            primarySubcategory = firstPath.subcategory || '';
          } else {
            // Estrutura legada
            primaryCategory = product.category || '';
            primarySubcategory = product.subcategory || '';
          }

          return {
            id: product.id,
            type: 'product' as const,
            title: product.title,
            subtitle: product.subtitle,
            description: product.description,
            imageUrl: product.imageUrl,
            category: primaryCategory,
            subcategory: primarySubcategory,
            supplier: product.supplier,
            price: product.price,
            relevance
          };
        });

      results.push(...productResults);
    }

    // Buscar categorias
    if (filters.types.includes('category')) {
      const categories = await getCategories();
      const categoryResults = categories
        .filter(category => {
          if (!category.active) return false;
          if (filters.categories.length > 0 && !filters.categories.includes(category.title)) return false;
          return category.title.toLowerCase().includes(searchTerm);
        })
        .map(category => ({
          id: category.id,
          type: 'category' as const,
          title: category.title,
          relevance: category.title.toLowerCase().includes(searchTerm) ? 0.8 : 0.5
        }));

      results.push(...categoryResults);
    }

    // Buscar subcategorias
    if (filters.types.includes('subcategory')) {
      const subcategories = await getSubCategories({ category: "none" });
      const subcategoryResults = subcategories
        .filter(subcategory => {
          if (!subcategory.active) return false;
          if (filters.categories.length > 0 && !filters.categories.includes(subcategory.category || '')) return false;
          return subcategory.title.toLowerCase().includes(searchTerm);
        })
        .map(subcategory => ({
          id: subcategory.id,
          type: 'subcategory' as const,
          title: subcategory.title,
          category: subcategory.category,
          relevance: subcategory.title.toLowerCase().includes(searchTerm) ? 0.7 : 0.4
        }));

      results.push(...subcategoryResults);
    }

    // Buscar tags
    if (filters.types.includes('tag')) {
      const tags = await getTags();
      const tagResults = tags
        .filter(tag => {
          if (filters.tags.length > 0 && !filters.tags.includes(tag)) return false;
          return tag.toLowerCase().includes(searchTerm);
        })
        .map(tag => ({
          id: tag,
          type: 'tag' as const,
          title: tag,
          relevance: tag.toLowerCase().includes(searchTerm) ? 0.6 : 0.3
        }));

      results.push(...tagResults);
    }

    // Buscar fornecedores
    if (filters.types.includes('supplier')) {
      const suppliers = await getSuppleiers();
      const supplierResults = suppliers
        .filter(supplier => {
          if (filters.suppliers.length > 0 && !filters.suppliers.includes(supplier)) return false;
          return supplier.toLowerCase().includes(searchTerm);
        })
        .map(supplier => ({
          id: supplier,
          type: 'supplier' as const,
          title: supplier,
          relevance: supplier.toLowerCase().includes(searchTerm) ? 0.6 : 0.3
        }));

      results.push(...supplierResults);
    }

    // Salvar no cache
    searchCache.set(query, filters, results);
    
    const duration = performance.now() - startTime;
    logger.debug("Busca global concluída", { 
      query: query.substring(0, 50), 
      resultsCount: results.length, 
      duration: `${duration.toFixed(2)}ms` 
    });
    
    return results;

  } catch (error) {
    logger.error('Erro na busca global', error);
    return [];
  }
}

// Função de busca rápida (sem filtros)
export async function quickSearch(query: string): Promise<CacheSearchResult[]> {
  return globalSearch({
    query,
    filters: {
      types: ['product', 'category', 'subcategory', 'tag', 'supplier'],
      categories: [],
      suppliers: [],
      priceRange: { min: 0, max: 100000 },
      tags: []
    }
  });
}


// busca todos produtos
export async function getProducts(): Promise<Product[]> {
  try {
    const snap = await get(ref(db, "produtos/"));
    if (!snap.exists()) return [];

    const data = snap.val(); // retorna um objeto com todos os produtos
    const products: Product[] = Object.entries(data)
      .map(([id, value]: [string, any]) => ({
        id,
        title: value.title,
        img: value.imageUrl,
        active: value.active,
        category: value.categoria,
        supplier: value.supplier
      }))
      // .filter((p) => p.active); // só ativos

    return products;
  } catch (e) {
    console.error("Erro ao buscar produtos:", e);
    return [];
  }
}

// busca um produto por ID
export async function getProductById({ id }: { id: string }): Promise<Product | null > {

  try {
    let snap = await get(ref(db, `produtos/${id}`));
    if (!snap.exists()) return null;
    let data = snap.val();
    if (data && data.active === true) {
      return { id, ...data } as Product;
    }
    return null;
  } catch (e) {
    console.error("Erro ao buscar produto por ID:", e);
    return null;
  }
}

// altera estado do produto(active)
export async function changeItemState({ id, type, state }: { id: string, type: string, state: boolean }): Promise<void> {
  try {
    console.log(`alterando ${id} ${type} ${state}`);
    await update(ref(db, `${type}/${id}`), { active: state });
    console.log("Mudanca de estado concluida com sucesso!");
  } catch (err) {
    console.log(`Erro ao alterar estado do produto\n\nCod de Erro:\n${err}`);
  }
}

// atualiza um produto existente no bd
export async function updateProductData(productId: string, {
  title,
  subtitle,
  description,
  technicalInfo,
  imageUrl,
  category,
  subcategory = "",
  categories = [],
  subcategories = [],
  paths = [],
  price,
  tags,
  supplier,
  video = ""
}: {
  title: string;
  subtitle: string;
  description: string;
  technicalInfo: string;
  imageUrl: string;
  category: string;
  subcategory?: string;
  categories?: string[];
  subcategories?: string[];
  paths?: ProductPath[];
  price: string;
  tags: string[] | Record<number, string>;
  supplier: string;
  video?: string;
}) {

  // se nao houver categoria selecionada, evita que produto seja atualizado
  if (!category) {
    throw new Error("Erro ao atualizar produto, necessario selecionar categoria/subcategoria primeiro");
  }

  try {
    // Preparar arrays de categorias e subcategorias
    const categoriesArray = categories.length > 0 ? Array.from(new Set(categories)) : [category];
    const subcategoriesArray = subcategories.length > 0 ? Array.from(new Set(subcategories.filter(sub => sub && sub !== ""))) : (subcategory && subcategory !== "" ? [subcategory] : []);

    // Limpar valores undefined dos paths antes de enviar
    const cleanPaths = paths.map(path => ({
      id: path.id,
      category: path.category,
      ...(path.subcategory && { subcategory: path.subcategory }),
      ...(path.subcategoryTitle && { subcategoryTitle: path.subcategoryTitle }),
      displayName: path.displayName
    }));

    await update(ref(db, `produtos/${productId}`), {
      title: title,
      subtitle: subtitle,
      description: description,
      technicalInfo: technicalInfo,
      category: category, // Mantido para compatibilidade
      subcategory: !subcategory ? "" : subcategory, // Mantido para compatibilidade
      categories: categoriesArray, // Nova estrutura
      subcategories: subcategoriesArray, // Nova estrutura
      paths: cleanPaths, // Nova estrutura para caminhos completos (sem undefined)
      imageUrl: imageUrl,
      price: price,
      tags: tags,
      supplier: supplier,
      video: !video ? "" : video,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    throw error;
  }
}


// deleta um item do banco de dados
export async function deleteItem({ id, type }: { id: string, type: string }): Promise<void> {
  try {
    console.log(`deletando ${id} de ${type}`);
    await remove(ref(db, `${type}/${id}`));
    console.log("Item deletado com sucesso!");
  } catch (err) {
    console.log(`Erro ao deletar item

Cod de Erro:
${err}`);
    throw err;
  }
}
