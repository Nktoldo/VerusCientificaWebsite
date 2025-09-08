import { ref, get, update, push, set, remove } from "firebase/database";
import { db } from './firebase.mjs';

// Função auxiliar para gerar ID baseado no título
function generateLinkID({ title }: { title: string }) {
  const ID = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '');
  return ID;
}

// Script para migrar subcategorias existentes para a nova estrutura com push
export async function migrateSubcategoriesToNewStructure() {
  try {
    console.log("Iniciando migração de subcategorias para nova estrutura...");
    
    // Buscar todas as subcategorias existentes
    const snapshot = await get(ref(db, "subcategorias"));
    if (!snapshot.exists()) {
      console.log("Nenhuma subcategoria encontrada para migração");
      return;
    }

    const subcategorias = snapshot.val();
    let migratedCount = 0;
    let errorCount = 0;

    for (const [oldKey, subcategoria] of Object.entries(subcategorias)) {
      try {
        const subcategoriaData = subcategoria as any;
        
        // Verificar se já tem a nova estrutura
        if (subcategoriaData.id && subcategoriaData.titleID) {
          console.log(`Subcategoria ${oldKey} já possui nova estrutura`);
          continue;
        }

        // Criar nova estrutura
        const newSubcategoriaRef = push(ref(db, 'subcategorias'));
        const newID = newSubcategoriaRef.key;
        const titleID = generateLinkID({ title: subcategoriaData.titulo || subcategoriaData.title || '' });

        // Salvar com nova estrutura
        await set(newSubcategoriaRef, {
          id: newID,
          title: subcategoriaData.titulo || subcategoriaData.title || '',
          titleID: titleID,
          categoria: subcategoriaData.categoria || subcategoriaData.category || '',
          active: subcategoriaData.active !== false
        });

        // Remover estrutura antiga
        await remove(ref(db, `subcategorias/${oldKey}`));

        console.log(`Subcategoria ${oldKey} migrada para ${newID}`);
        migratedCount++;

      } catch (error) {
        console.error(`Erro ao migrar subcategoria ${oldKey}:`, error);
        errorCount++;
      }
    }

    console.log(`Migração de subcategorias concluída! ${migratedCount} subcategorias migradas, ${errorCount} erros`);
    
  } catch (error) {
    console.error("Erro durante a migração de subcategorias:", error);
  }
}

// Script para migrar produtos existentes para a nova estrutura de múltiplas categorias
export async function migrateProductsToMultipleCategories() {
  try {
    console.log("Iniciando migração de produtos para múltiplas categorias...");
    
    // Buscar todos os produtos
    const snapshot = await get(ref(db, "produtos"));
    if (!snapshot.exists()) {
      console.log("Nenhum produto encontrado para migração");
      return;
    }

    const produtos = snapshot.val();
    let migratedCount = 0;
    let errorCount = 0;

    for (const [productId, product] of Object.entries(produtos)) {
      try {
        const productData = product as any;
        
        // Verificar se o produto já tem a nova estrutura
        if (productData.categories && Array.isArray(productData.categories)) {
          console.log(`Produto ${productId} já possui estrutura de múltiplas categorias`);
          continue;
        }

        // Preparar arrays de categorias e subcategorias
        const categories = productData.category ? [productData.category] : [];
        const subcategories = productData.subcategory ? [productData.subcategory] : [];

        // Atualizar produto com a nova estrutura
        await update(ref(db, `produtos/${productId}`), {
          categories: categories,
          subcategories: subcategories
        });

        console.log(`Produto ${productId} migrado com sucesso`);
        migratedCount++;

      } catch (error) {
        console.error(`Erro ao migrar produto ${productId}:`, error);
        errorCount++;
      }
    }

    console.log(`Migração concluída! ${migratedCount} produtos migrados, ${errorCount} erros`);
    
  } catch (error) {
    console.error("Erro durante a migração:", error);
  }
}

// Script para atualizar referências de categorias
export async function updateCategoryReferences() {
  try {
    console.log("Atualizando referências de categorias...");
    
    // Buscar todas as categorias
    const categoriesSnapshot = await get(ref(db, "categorias"));
    if (!categoriesSnapshot.exists()) {
      console.log("Nenhuma categoria encontrada");
      return;
    }

    const categories = categoriesSnapshot.val();
    
    for (const [categoryName, categoryData] of Object.entries(categories)) {
      try {
        // Buscar produtos que pertencem a esta categoria
        const produtosSnapshot = await get(ref(db, "produtos"));
        if (!produtosSnapshot.exists()) continue;

        const produtos = produtosSnapshot.val();
        const produtoIds: string[] = [];

        for (const [productId, product] of Object.entries(produtos)) {
          const productData = product as any;
          
          if (productData.active === true) {
            // Verificar se o produto pertence a esta categoria
            const pertenceACategoria = 
              productData.category === categoryName ||
              (productData.categories && Array.isArray(productData.categories) && productData.categories.includes(categoryName));

            if (pertenceACategoria) {
              produtoIds.push(productId);
            }
          }
        }

        // Atualizar referências da categoria
        await update(ref(db, `categorias/${categoryName}`), {
          active: true,
          produtos: produtoIds
        });

        console.log(`Categoria ${categoryName} atualizada com ${produtoIds.length} produtos`);

      } catch (error) {
        console.error(`Erro ao atualizar categoria ${categoryName}:`, error);
      }
    }

    console.log("Atualização de referências concluída!");
    
  } catch (error) {
    console.error("Erro durante a atualização de referências:", error);
  }
}

// Função para executar toda a migração
export async function runFullMigration() {
  console.log("=== INICIANDO MIGRAÇÃO COMPLETA ===");
  
  await migrateSubcategoriesToNewStructure();
  await migrateProductsToMultipleCategories();
  await updateCategoryReferences();
  
  console.log("=== MIGRAÇÃO COMPLETA FINALIZADA ===");
}
