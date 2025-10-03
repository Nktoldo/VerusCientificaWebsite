import { ref, get, remove } from "firebase/database";
import { db } from './firebase.mjs';

export async function cleanDuplicateSubcategories() {
  try {
    console.log('🧹 Iniciando limpeza de subcategorias duplicadas...');
    
    const subcategoriasSnapshot = await get(ref(db, 'subcategorias'));
    
    if (!subcategoriasSnapshot.exists()) {
      console.log('Nenhuma subcategoria encontrada.');
      return;
    }

    const subcategorias = subcategoriasSnapshot.val();
    const seen = new Map<string, string>(); // Map<"title-category", "key">
    const duplicates: string[] = [];

    // Identificar duplicatas (manter a primeira, marcar as outras para remoção)
    for (const [key, subcategoria] of Object.entries(subcategorias)) {
      const subcat = subcategoria as any;
      const identifier = `${subcat.title}-${subcat.categoria}`;
      
      if (seen.has(identifier)) {
        console.log(`🗑️ Marcando para remoção: "${subcat.title}" em "${subcat.categoria}" (${key})`);
        duplicates.push(key);
      } else {
        seen.set(identifier, key);
        console.log(`✅ Mantendo: "${subcat.title}" em "${subcat.categoria}" (${key})`);
      }
    }

    // Remover duplicatas
    for (const duplicateKey of duplicates) {
      await remove(ref(db, `subcategorias/${duplicateKey}`));
      console.log(`🗑️ Removida subcategoria duplicada: ${duplicateKey}`);
    }

    console.log(`✅ Limpeza concluída. ${duplicates.length} subcategorias duplicadas removidas.`);
    
  } catch (error) {
    console.error('❌ Erro durante a limpeza:', error);
  }
}


