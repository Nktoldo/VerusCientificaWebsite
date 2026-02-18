import { ref, get, update, push, set, remove } from "firebase/database";
import { db } from './firebase.mjs';

// gera ID baseado no título (sem acentos e espaços)
function generateLinkID({ title }: { title: string }) {
  const ID = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '');
  return ID;
}

// migra subcategorias existentes para a nova estrutura com push
export async function migrateSubcategoriesToNewStructure() {
  try {
    
    // busca todas as subcategorias existentes
    const snapshot = await get(ref(db, "subcategorias"));
    if (!snapshot.exists()) {
      return;
    }

    const subcategorias = snapshot.val();
    let migratedCount = 0;
    let errorCount = 0;

    for (const [oldKey, subcategoria] of Object.entries(subcategorias)) {
      try {
        const subcategoriaData = subcategoria as any;
        
        // verifica se já tem a nova estrutura
        if (subcategoriaData.id && subcategoriaData.titleID) {
          continue;
        }

        // cria nova estrutura
        const newSubcategoriaRef = push(ref(db, 'subcategorias'));
        const newID = newSubcategoriaRef.key;
        const titleID = generateLinkID({ title: subcategoriaData.titulo || subcategoriaData.title || '' });

        // salva com nova estrutura
        await set(newSubcategoriaRef, {
          id: newID,
          title: subcategoriaData.titulo || subcategoriaData.title || '',
          titleID: titleID,
          categoria: subcategoriaData.categoria || subcategoriaData.category || '',
          active: subcategoriaData.active !== false
        });

        // remove estrutura antiga
        await remove(ref(db, `subcategorias/${oldKey}`));

        migratedCount++;

      } catch (error) {
        console.error(`Erro ao migrar subcategoria ${oldKey}:`, error);
        errorCount++;
      }
    }

    
  } catch (error) {
    console.error("Erro durante a migração de subcategorias:", error);
  }
}

// migra produtos existentes para a nova estrutura de múltiplas categorias
export async function migrateProductsToMultipleCategories() {
  try {
    
    // busca todos os produtos
    const snapshot = await get(ref(db, "produtos"));
    if (!snapshot.exists()) {
      return;
    }

    const produtos = snapshot.val();
    let migratedCount = 0;
    let errorCount = 0;

    for (const [productId, product] of Object.entries(produtos)) {
      try {
        const productData = product as any;
        
        // verifica se o produto já tem a nova estrutura
        if (productData.categories && Array.isArray(productData.categories)) {
          continue;
        }

        // prepara arrays de categorias e subcategorias
        const categories = productData.category ? [productData.category] : [];
        const subcategories = productData.subcategory ? [productData.subcategory] : [];

        // atualiza produto com a nova estrutura
        await update(ref(db, `produtos/${productId}`), {
          categories: categories,
          subcategories: subcategories
        });

        migratedCount++;

      } catch (error) {
        console.error(`Erro ao migrar produto ${productId}:`, error);
        errorCount++;
      }
    }

    
  } catch (error) {
    console.error("Erro durante a migração:", error);
  }
}

// atualiza referências de categorias nos produtos
export async function updateCategoryReferences() {
  try {
    
    // busca todas as categorias
    const categoriesSnapshot = await get(ref(db, "categorias"));
    if (!categoriesSnapshot.exists()) {
      return;
    }

    const categories = categoriesSnapshot.val();
    
    for (const [categoryName, categoryData] of Object.entries(categories)) {
      try {
        // busca produtos que pertencem a esta categoria
        const produtosSnapshot = await get(ref(db, "produtos"));
        if (!produtosSnapshot.exists()) continue;

        const produtos = produtosSnapshot.val();
        const produtoIds: string[] = [];

        for (const [productId, product] of Object.entries(produtos)) {
          const productData = product as any;
          
          if (productData.active === true) {
            // verifica se o produto pertence a esta categoria
            const pertenceACategoria = 
              productData.category === categoryName ||
              (productData.categories && Array.isArray(productData.categories) && productData.categories.includes(categoryName));

            if (pertenceACategoria) {
              produtoIds.push(productId);
            }
          }
        }

        // atualiza referências da categoria
        await update(ref(db, `categorias/${categoryName}`), {
          active: true,
          produtos: produtoIds
        });


      } catch (error) {
        console.error(`Erro ao atualizar categoria ${categoryName}:`, error);
      }
    }

    
  } catch (error) {
    console.error("Erro durante a atualização de referências:", error);
  }
}

// executa toda a migração (subcategorias, produtos, referências)
export async function runFullMigration() {
  
  await migrateSubcategoriesToNewStructure();
  await migrateProductsToMultipleCategories();
  await updateCategoryReferences();
  
}
