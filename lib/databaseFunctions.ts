import { ref, set, update, onValue, get, child, push, orderByChild, equalTo, query, remove } from "firebase/database";
import { db } from './firebase.mjs';
import { storage } from './firebase.mjs';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { logger } from './logger';
import { searchCache, type SearchFilters as CacheSearchFilters, type SearchResult as CacheSearchResult } from './searchCache';

// tipagem dos caminhos do produto
type ProductPath = {
  id: string;
  category: string;
  subcategory: string; // id da subcategoria (sempre string)
  subcategoryTitle: string; // título da subcategoria para exibição
  displayName: string;
};

// tipagem do objeto de produto no banco
type Product = {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  technicalInfo?: string;
  category: string; // mantido para compatibilidade
  subcategory?: string; // mantido para compatibilidade
  categories?: string[]; // múltiplas categorias
  subcategories?: string[]; // múltiplas subcategorias
  paths?: ProductPath[]; // caminhos completos
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
  titleID?: string, // id baseado no título para uso no site
  category?: string,
  active: boolean
}

type Tag = {
  id: string;
  title: string;
  color: string;
  active: boolean;
};

// cria usuário no banco
export function writeUserData(name: string, email: string, password: string, admin: boolean) {
  push(ref(db, 'users/'), {
    username: name,
    email: email,
    password: password,
    admin: admin
  });
}

// gera id para o link da categoria/equipo (título igual pode sobrepor)
function generateLinkID({ title }: { title: string }) {
  const ID = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '');
  return ID;
}

// cadastra produto no banco
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
  if (!category && paths.length === 0) {
    alert("Erro ao cadastrar produto, necessario selecionar categoria/subcategoria primeiro")
    return;
  }

  // usa paths se disponível, senão monta a partir dos campos antigos
  let finalPaths: ProductPath[] = [];
  
  if (paths.length > 0) {
    // usa paths fornecidos
    finalPaths = paths;
  } else {
    // monta paths a partir dos campos antigos (compatibilidade)
    const categoriesArray = categories.length > 0 ? Array.from(new Set(categories)) : [category];
    const subcategoriesArray = subcategories.length > 0 ? Array.from(new Set(subcategories.filter(sub => sub && sub !== ""))) : (subcategory && subcategory !== "" ? [subcategory] : []);

    // cria um path para cada combinação categoria-subcategoria
    if (subcategoriesArray.length > 0) {
      categoriesArray.forEach(cat => {
        subcategoriesArray.forEach(subcat => {
          finalPaths.push({
            id: `${cat}-${subcat}-${Date.now()}`,
            category: cat,
            subcategory: subcat,
            subcategoryTitle: subcat, // compatibilidade com dados antigos
            displayName: `${cat} > ${subcat}`
          });
        });
      });
    } else {
      // paths só com categoria (sem subcategoria)
      categoriesArray.forEach(cat => {
        finalPaths.push({
          id: `${cat}-none-${Date.now()}`,
          category: cat,
          subcategory: "", // evita undefined
          subcategoryTitle: "", // evita undefined
          displayName: cat
        });
      });
    }
  }

  // extrai categorias e subcategorias únicas dos paths
  const uniqueCategories = [...new Set(finalPaths.map(path => path.category))];
  const uniqueSubcategories = [...new Set(finalPaths.map(path => path.subcategory).filter(sub => sub && sub !== ""))];

  const productData: any = {
    title: title,
    subtitle: subtitle,
    description: description,
    technicalInfo: technicalInfo,
    imageUrl: imageUrl,
    price: price,
    tags: tags,
    supplier: supplier,
    active: true,
    video: !video ? "" : video,
    
    // salva paths completos
    paths: finalPaths,
    
    // arrays para compatibilidade e busca rápida
    categories: uniqueCategories,
    subcategories: uniqueSubcategories,
    
    // campos legados (primeiro path como principal)
    category: finalPaths.length > 0 ? finalPaths[0].category : category,
    subcategory: finalPaths.length > 0 ? (finalPaths[0].subcategory || "") : subcategory
  };

  push(ref(db, `produtos`), productData);
}

// cria ou atualiza categoria
export async function writeCategoryData({ title }: { title: string }) {
  let categoryID = await generateLinkID({ title });
  update(ref(db, `categorias/${categoryID}/`), {
    title: title,
    id: categoryID,
    active: true
  });
}

// cria ou atualiza subcategoria
export async function writeSubcategoryData({ title, category }: { title: string, category: string }) {
  try {
    // verifica se já existe subcategoria com mesmo nome na mesma categoria
    const subcategoriasSnapshot = await get(ref(db, 'subcategorias'));
    
    if (subcategoriasSnapshot.exists()) {
      const subcategorias = subcategoriasSnapshot.val();
      
      // procura subcategoria existente com mesmo título e categoria
      for (const [key, subcategoria] of Object.entries(subcategorias)) {
        const subcat = subcategoria as any;
        if (subcat.title === title && subcat.categoria === category) {
          console.log(`ℹ️ Subcategoria "${title}" já existe na categoria "${category}"`);
          return key; // retorna id da subcategoria existente
        }
      }
    }
    
    // cria nova subcategoria
    const subcategoriaRef = push(ref(db, 'subcategorias'));
    const subcategoriaID = subcategoriaRef.key;
    
    await set(subcategoriaRef, {
      id: subcategoriaID,
      title: title, 
      categoria: category,
      active: true
    });
    
    console.log(`✅ Nova subcategoria "${title}" criada na categoria "${category}"`);
    return subcategoriaID;
  } catch (error) {
    console.error('❌ Erro ao criar subcategoria:', error);
    throw error;
  }
}

// cria ou atualiza fornecedor
export async function writeSupplierData({ title, type }: { title: string, type: "representada" | "revenda" | "Representada" | "Revenda" }) {
  update(ref(db, `filtros/suppliers/${title}`), {
    type: type,
    active: true
  })
}

// cria ou atualiza tag
export async function writeTagsData({ title, color, active }: { title: string, color?: string, active?: boolean }) {
    set(ref(db, `filtros/tags/${title}`), {
      active: active !== undefined ? active : true,
      color: color || "#3B82F6" // cor padrão azul
  })
}

// faz upload de imagem no Storage
export async function uploadProductImage(file: File, imageId: string) {
  const imgRef = storageRef(storage, `produtos/${imageId}`);
  await uploadBytes(imgRef, file);
  return await getDownloadURL(imgRef);
}

// faz upload das imagens base64 do HTML e retorna HTML com urls do Storage
export async function processDescriptionImages(html: string): Promise<string> {
  // regex para imagens base64
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

    // envia para o Storage
    const imageId = uuidv4();
    const uploadPromise = uploadProductImage(file, `descricao/${imageId}`).then(url => {
      // substitui o src antigo pela url do Storage
      newHtml = newHtml.replace(base64, url);
    });
    promises.push(uploadPromise);
  }

  await Promise.all(promises);
  return newHtml;
}

// busca produtos por categoria e subcategoria
export async function buscarProdutos({ category, subcategory }: { category: string, subcategory: string }): Promise<Product[]> {
  if (category) {
    try {
      // busca título da categoria pelo id para compatibilidade
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
        console.error("Não foi possível buscar título da categoria:", e);
      }

      // busca todos os produtos e filtra no cliente
      const snapshot = await get(ref(db, "produtos"));
      
      if (!snapshot.exists()) {
        console.error("Nenhum produto encontrado no banco");
        return [];
      }

      let dados = snapshot.val();
      let produtos: Product[] = [];

      Object.entries(dados).forEach(([key, item]: [string, any]) => {
        // filtra apenas produtos ativos
        if (item.active === true) {
          let categoriaMatch = false;
          let subcategoriaMatch = true; // default true se não há subcategoria

          // verifica paths primeiro (estrutura nova)
          if (item.paths && Array.isArray(item.paths)) {
            const matchingPaths = item.paths.filter((path: any) => {
              const categoryMatches = path.category === category || path.category === categoryTitle;
              if (!categoryMatches) return false;
              
              // verifica se o path tem a subcategoria especificada
              if (subcategory) {
                return path.subcategory === subcategory || path.subcategoryTitle === subcategory;
              }
              
              // sem subcategoria: só paths sem subcategoria
              return !path.subcategory || path.subcategory === "";
            });
            
            if (matchingPaths.length > 0) {
              categoriaMatch = true;
              subcategoriaMatch = true;
            }
          } else {
            // estrutura legada: verifica campos antigos
            // verifica categoria principal por id ou título
            if (item.category === category || item.category === categoryTitle) {
              categoriaMatch = true;
            }
            
            // verifica array de categorias
            if (item.categories && Array.isArray(item.categories) && item.categories.includes(category)) {
              categoriaMatch = true;
            }
            
            if (categoriaMatch) {
              // verifica se o produto pertence à subcategoria
              if (subcategory) {
                subcategoriaMatch = false;
                
                // verifica subcategoria principal
                if (item.subcategory === subcategory) {
                  subcategoriaMatch = true;
                }
                
                // verifica array de subcategorias
                if (item.subcategories && Array.isArray(item.subcategories) && item.subcategories.includes(subcategory)) {
                  subcategoriaMatch = true;
                }
              } else {
                // sem subcategoria: só produtos apenas na categoria
                // (não em subcategorias específicas)
                const temSubcategoria = (() => {
                  // verifica subcategoria na estrutura legada
                  if (item.subcategory && item.subcategory !== "") return true;
                  
                  // verifica subcategorias no array
                  if (item.subcategories && Array.isArray(item.subcategories)) {
                    return item.subcategories.some((sub: any) => sub && sub !== "");
                  }
                  
                  return false;
                })();
                
                // produto com subcategoria não aparece na categoria pai
                if (temSubcategoria) {
                  subcategoriaMatch = false;
                }
              }
            }
          }

          if (categoriaMatch && subcategoriaMatch) {
            produtos.push({ id: key, ...item });
          }
        }
      });

      return produtos;
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      return [];
    }
  }

  return [];
}

// busca produtos de uma categoria específica usando NOVA ESTRUTURA
export async function buscarProdutosPorCategoria(category: string): Promise<Product[]> {

  try {
    // busca título da categoria pelo id para compatibilidade
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

    // busca todos os produtos e filtra com nova estrutura
    const snapshot = await get(ref(db, "produtos"));
    
    if (!snapshot.exists()) {
      console.error("❌ Nenhum produto encontrado no banco");
      return [];
    }

    const dados = snapshot.val();
    const produtos: Product[] = [];

    Object.entries(dados).forEach(([key, item]: [string, any]) => {
      if (item.active === true) {
        let belongsToCategory = false;

        // verifica paths primeiro (estrutura nova)
        if (item.paths && Array.isArray(item.paths)) {
          const matchingPaths = item.paths.filter((path: any) => {
            const categoryMatches = path.category === category || path.category === categoryTitle;
            // só produtos apenas na categoria (sem subcategoria)
            return categoryMatches && (!path.subcategory || path.subcategory === "");
          });
          
          if (matchingPaths.length > 0) {
            belongsToCategory = true;
          }
        } else {
          // estrutura legada: verifica campos antigos
          // verifica array categorias (produtos sem subcategoria)
          if (item.categories && Array.isArray(item.categories)) {
            if (item.categories.includes(category) || item.categories.includes(categoryTitle)) {
              belongsToCategory = true;
            }
          }

          // compatibilidade: verifica estrutura legada
          if (item.category === category || item.category === categoryTitle) {
            // só inclui se não tem subcategoria
            if (!item.subcategory || item.subcategory === "") {
              belongsToCategory = true;
            }
          }
        }

        if (belongsToCategory) {
          produtos.push({ id: key, ...item });
        } else {
        }
      }
    });

    return produtos;

  } catch (error) {
    console.error("❌ Erro ao buscar produtos da categoria:", error);
    return [];
  }
}

// busca produtos que pertencem a múltiplas categorias
export async function buscarProdutosPorMultiplasCategorias(categories: string[]): Promise<Product[]> {

  if (categories.length === 0) return [];

  try {
    // busca todos os produtos e filtra por categorias
    const snapshot = await get(ref(db, "produtos"));
    if (!snapshot.exists()) return [];

    const produtos: Product[] = [];
    const dados = snapshot.val();

    Object.entries(dados).forEach(([key, item]: [string, any]) => {
      if (item.active === true) {
        // verifica se o produto pertence a pelo menos uma categoria
        const pertenceACategoria = categories.some(cat => {
          // verifica categoria principal
          if (item.category === cat) return true;
          // verifica array de categorias
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

    return produtos;

  } catch (error) {
    console.error("Erro ao buscar produtos por múltiplas categorias:", error);
    return [];
  }
}

// busca produtos que pertencem a múltiplas subcategorias
export async function buscarProdutosPorMultiplasSubcategorias(subcategories: string[]): Promise<Product[]> {

  if (subcategories.length === 0) return [];

  try {
    // busca todos os produtos e filtra por subcategorias
    const snapshot = await get(ref(db, "produtos"));
    if (!snapshot.exists()) return [];

    const produtos: Product[] = [];
    const dados = snapshot.val();

    Object.entries(dados).forEach(([key, item]: [string, any]) => {
      if (item.active === true) {
        // verifica se o produto pertence a pelo menos uma subcategoria
        const pertenceASubcategoria = subcategories.some(subcat => {
          // verifica subcategoria principal
          if (item.subcategory === subcat) return true;
          // verifica array de subcategorias
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

    return produtos;

  } catch (error) {
    console.error("Erro ao buscar produtos por múltiplas subcategorias:", error);
    return [];
  }
}

// atualiza estrutura da categoria e referências aos produtos

export async function atualizarEstruturaCategoria(categoryName: string) {
  try {
    // busca todos os produtos da categoria
    const snapshot = await get(query(
      ref(db, "produtos"),
      orderByChild("category"),
      equalTo(categoryName)
    ));

    if (snapshot.exists()) {
      const produtos = snapshot.val();
      const produtoIds: string[] = [];

      // coleta ids dos produtos ativos
      Object.entries(produtos).forEach(([id, item]: [string, any]) => {
        if (item.active === true && item.category === categoryName) {
          produtoIds.push(id);
        }
      });

      // atualiza estrutura da categoria
      await update(ref(db, `categorias/${categoryName}`), {
        active: true,
        produtos: produtoIds
      });

      return produtoIds;
    }

    return [];
  } catch (error) {
    console.error("Erro ao atualizar estrutura da categoria:", error);
    return [];
  }
}

// busca tags com cores do banco
export async function getTagsWithColors(): Promise<Tag[]> {
  try {
    const snapshot = await get(ref(db, "filtros/tags"));
    if (!snapshot.exists()) return [];

    const tags: Tag[] = [];
    snapshot.forEach((child) => {
      const data = child.val();
      if (typeof data === 'object' && data !== null) {
        tags.push({
          id: child.key,
          title: child.key,
          color: data.color || "#3B82F6",
          active: data.active !== false
        });
      } else if (data === true) {
        // tags legadas (apenas boolean true)
        tags.push({
          id: child.key,
          title: child.key,
          color: "#3B82F6", // cor padrão
          active: true
        });
      }
    });

    return tags;
  } catch (error) {
    console.error("Erro ao buscar tags com cores:", error);
    return [];
  }
}

export async function getTags(): Promise<string[]> {
  const tags = await getTagsWithColors();
  return tags.map(tag => tag.title);
}

// retorna a cor de uma tag pelo id
export async function getTagColor(tagName: string): Promise<string> {
  try {
    const snapshot = await get(ref(db, `filtros/tags/${tagName}`));
    if (!snapshot.exists()) return "#3B82F6";

    const data = snapshot.val();
    if (typeof data === 'object' && data !== null) {
      return data.color || "#3B82F6";
    }
    
    return "#3B82F6"; // cor padrão
  } catch (error) {
    console.error("Erro ao buscar cor da tag:", error);
    return "#3B82F6";
  }
}

// atualiza a cor de uma tag no banco
export async function updateTagColor(tagName: string, color: string): Promise<void> {
  try {
    await update(ref(db, `filtros/tags/${tagName}`), {
      color: color,
      active: true
    });
  } catch (error) {
    console.error("Erro ao atualizar cor da tag:", error);
    throw error;
  }
}

export async function getSuppleiers(): Promise<string[]> {
  let suppliersList: string[] = [];
  let snapshot = await get(ref(db, "filtros/suppliers"));
  snapshot.forEach(supplier => {
    suppliersList.push(supplier.key)
  });
  return suppliersList;
}

// retorna lista de categorias
export async function getCategories(): Promise<Categoria[]> {
  let categoriasList: Categoria[] = [];
  let snapshot = await get(ref(db, "categorias"))
  snapshot.forEach(element => {
    const value = element.val();
    if (typeof value === 'object' && value.active !== false) {
      // se não tem título, usa o id como título
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

// retorna subcategorias da categoria informada
export async function getSubCategories({ category }: { category: string }): Promise<Categoria[]> {
  let subCategoriasList: Categoria[] = [];

  try {
    // busca todas e filtra no cliente (tolera diferenças de formatação)
    const snapshot = await get(ref(db, "subcategorias"));
    const all = snapshot.val() || {};

    if (category !== "none") {
      // busca título da categoria pelo id para compatibilidade
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
        console.error("Não foi possível buscar título da categoria:", e);
      }

      Object.entries(all).forEach(([key, val]: [string, any]) => {
        if (typeof val === 'object' && val !== null) {
          const cat = val.categoria || val.category || "";
          const isActive = val.active !== false; // só ativo se não for false
          
          // busca por id ou título da categoria
          if (isActive && (cat === category || cat === categoryTitle)) {
            subCategoriasList.push({
              id: key, // id único do Firebase (chave do push)
              title: val.title || val.titulo || key, // fallback para key se não há título
              titleID: val.titleID, // id baseado no título
              category: val.categoria || val.category,
              active: val.active
            });
          }
        }
      });

    } else {
      // busca todas as subcategorias
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

  return subCategoriasList;
}

// busca uma subcategoria por id (para links)
export async function getSubCategoryByID(id: string): Promise<Categoria | null> {
  
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
    id: id, // id único do Firebase (chave do push)
    title: val.title || val.titulo,
    titleID: val.titleID,
    category: val.categoria,
    active: val.active
  };
}

// obtém o título de uma subcategoria pelo id
export async function getSubcategoryTitleById(id: string): Promise<string | null> {
  try {
    const subcategory = await getSubCategoryByID(id);
    return subcategory ? subcategory.title : null;
  } catch (error) {
    console.error('Erro ao buscar título da subcategoria:', error);
    return null;
  }
}

// tipos para busca global
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

// busca global com cache
export async function globalSearch({ query, filters }: { query: string, filters: CacheSearchFilters }): Promise<CacheSearchResult[]> {
  const startTime = performance.now();
  logger.debug("Iniciando busca global", { query: query.substring(0, 50), filtersCount: Object.keys(filters).length });
  
  if (!query.trim()) return [];

  // verifica cache primeiro
  const cachedResults = searchCache.get(query, filters);
  if (cachedResults) {
    logger.debug("Resultado encontrado no cache", { query: query.substring(0, 50), resultsCount: cachedResults.length });
    return cachedResults;
  }

  const searchTerm = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  try {
    // busca produtos
    if (filters.types.includes('product')) {
      // busca produtos completos com todas as informações
      const snapshot = await get(ref(db, "produtos/"));
      if (!snapshot.exists()) return [];
      
      const data = snapshot.val();
      const products = Object.entries(data)
        .map(([id, value]: [string, any]) => ({ id, ...value }))
        .filter((product: any) => product.active === true);
      const productResults = products
        .filter(product => {
          // filtros básicos (verificação adicional)
          if (!product.active) return false;
          
          // filtra por fornecedores
          if (filters.suppliers.length > 0 && !filters.suppliers.includes(product.supplier)) return false;
          
          // filtra por tags
          if (filters.tags.length > 0 && Array.isArray(product.tags)) {
            const hasMatchingTag = product.tags.some((tag: string) => filters.tags.includes(tag));
            if (!hasMatchingTag) return false;
          }
          
          // filtra por faixa de preço
          if (product.price) {
            const price = parseFloat(product.price);
            if (price < filters.priceRange.min || price > filters.priceRange.max) return false;
          }

          // busca no texto
          const title = product.title?.toLowerCase() || '';
          const subtitle = product.subtitle?.toLowerCase() || '';
          const description = product.description?.toLowerCase() || '';
          const supplier = product.supplier?.toLowerCase() || '';
          
          // verifica match nos campos principais
          if (title.includes(searchTerm) || subtitle.includes(searchTerm) || 
              description.includes(searchTerm) || supplier.includes(searchTerm)) {
            return true;
          }
          
          // verifica tags
          if (Array.isArray(product.tags)) {
            if (product.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm))) {
              return true;
            }
          }
          
          // verifica categorias e subcategorias
          const hasPaths = product.paths && product.paths.length > 0;
          if (hasPaths) {
            if (product.paths.some((path: any) => 
              path.category?.toLowerCase().includes(searchTerm) || 
              path.subcategoryTitle?.toLowerCase().includes(searchTerm)
            )) {
              return true;
            }
          } else {
            // estrutura legada
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
          
          // calcula relevância do resultado
          const title = product.title?.toLowerCase() || '';
          const subtitle = product.subtitle?.toLowerCase() || '';
          const description = product.description?.toLowerCase() || '';
          const supplier = product.supplier?.toLowerCase() || '';
          
          if (title.includes(searchTerm)) relevance += 0.4;
          if (subtitle.includes(searchTerm)) relevance += 0.3;
          if (description.includes(searchTerm)) relevance += 0.2;
          if (supplier.includes(searchTerm)) relevance += 0.1;
          
          // relevância para tags
          if (Array.isArray(product.tags)) {
            product.tags.forEach((tag: string) => {
              if (tag.toLowerCase().includes(searchTerm)) relevance += 0.15;
            });
          }
          
          // relevância para categorias e subcategorias
          const hasPaths = product.paths && product.paths.length > 0;
          if (hasPaths) {
            product.paths.forEach((path: any) => {
              if (path.category?.toLowerCase().includes(searchTerm)) relevance += 0.1;
              if (path.subcategoryTitle?.toLowerCase().includes(searchTerm)) relevance += 0.1;
            });
          } else {
            // estrutura legada
            if (product.category?.toLowerCase().includes(searchTerm)) relevance += 0.1;
            if (product.subcategory?.toLowerCase().includes(searchTerm)) relevance += 0.1;
          }

          // determina categoria e subcategoria para navegação
          let primaryCategory = '';
          let primarySubcategory = '';
          
          if (product.paths && product.paths.length > 0) {
            // usa o primeiro path como principal
            const firstPath = product.paths[0];
            primaryCategory = firstPath.category;
            primarySubcategory = firstPath.subcategory || '';
          } else {
            // estrutura legada
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

    // busca categorias
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

    // busca subcategorias
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

    // busca tags
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

    // busca fornecedores
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

    // salva no cache
    searchCache.set(query, filters, results);
    
    const duration = performance.now() - startTime;
    logger.debug("Busca global concluída", { 
      query: query.substring(0, 50), 
      resultsCount: results.length, 
      duration: `${duration.toFixed(2)}ms` 
    });
    
    return results;

  } catch (error) {
    logger.error('Erro na busca global', { error: String(error) });
    return [];
  }
}

// busca rápida sem filtros
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


// retorna todos os produtos
export async function getProducts(): Promise<Product[]> {
  try {
    const snap = await get(ref(db, "produtos/"));
    if (!snap.exists()) return [];

    const data = snap.val(); // retorna um objeto com todos os produtos
    const products: Product[] = Object.entries(data)
      .map(([id, value]: [string, any]) => ({
        id,
        title: value.title,
        subtitle: value.subtitle,
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

// busca um produto por id
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

// altera estado ativo do produto
export async function changeItemState({ id, type, state }: { id: string, type: string, state: boolean }): Promise<void> {
  try {
    await update(ref(db, `${type}/${id}`), { active: state });
  } catch (err) {
    console.error(`Erro ao alterar estado do produto\n\nCod de Erro:\n${err}`);
  }
}

// atualiza produto existente no banco
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
  if (!category && paths.length === 0) {
    throw new Error("Erro ao atualizar produto, necessario selecionar categoria/subcategoria primeiro");
  }

  try {
    // usa paths se disponível, senão monta a partir dos campos antigos
    let finalPaths: ProductPath[] = [];
    
    if (paths.length > 0) {
      // usa paths fornecidos
      finalPaths = paths;
    } else {
      // monta paths a partir dos campos antigos (compatibilidade)
      const categoriesArray = categories.length > 0 ? Array.from(new Set(categories)) : [category];
      const subcategoriesArray = subcategories.length > 0 ? Array.from(new Set(subcategories.filter(sub => sub && sub !== ""))) : (subcategory && subcategory !== "" ? [subcategory] : []);

      // cria um path para cada combinação categoria-subcategoria
      if (subcategoriesArray.length > 0) {
        categoriesArray.forEach(cat => {
          subcategoriesArray.forEach(subcat => {
            finalPaths.push({
              id: `${cat}-${subcat}-${Date.now()}`,
              category: cat,
              subcategory: subcat,
              subcategoryTitle: subcat, // compatibilidade com dados antigos
              displayName: `${cat} > ${subcat}`
            });
          });
        });
      } else {
        // paths só com categoria (sem subcategoria)
        categoriesArray.forEach(cat => {
          finalPaths.push({
            id: `${cat}-none-${Date.now()}`,
            category: cat,
            subcategory: "", // evita undefined
            subcategoryTitle: "", // evita undefined
            displayName: cat
          });
        });
      }
    }

    // extrai categorias e subcategorias únicas dos paths
    const uniqueCategories = [...new Set(finalPaths.map(path => path.category))];
    const uniqueSubcategories = [...new Set(finalPaths.map(path => path.subcategory).filter(sub => sub && sub !== ""))];

    await update(ref(db, `produtos/${productId}`), {
      title: title,
      subtitle: subtitle,
      description: description,
      technicalInfo: technicalInfo,
      imageUrl: imageUrl,
      price: price,
      tags: tags,
      supplier: supplier,
      video: !video ? "" : video,
      
      // salva paths completos
      paths: finalPaths,
      
      // arrays para compatibilidade e busca rápida
      categories: uniqueCategories,
      subcategories: uniqueSubcategories,
      
      // campos legados (primeiro path como principal)
      category: finalPaths.length > 0 ? finalPaths[0].category : category,
      subcategory: finalPaths.length > 0 ? (finalPaths[0].subcategory || "") : subcategory,
      
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    throw error;
  }
}


// remove um item do banco de dados
export async function deleteItem({ id, type }: { id: string, type: string }): Promise<void> {
  try {
    await remove(ref(db, `${type}/${id}`));
  } catch (err) {
    console.error(`Erro ao deletar item

Cod de Erro:
${err}`);
    throw err;
  }
}
