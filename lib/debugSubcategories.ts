import { ref, get } from "firebase/database";
import { db } from './firebase.mjs';

// Script para diagnosticar subcategorias duplicadas
export async function debugSubcategories() {
  try {
    console.log('🔍 Iniciando diagnóstico de subcategorias...');
    
    const subcategoriasSnapshot = await get(ref(db, 'subcategorias'));
    
    if (!subcategoriasSnapshot.exists()) {
      console.log('❌ Nenhuma subcategoria encontrada.');
      return;
    }

    const subcategorias = subcategoriasSnapshot.val();
    const duplicates: { [key: string]: string[] } = {};
    const allSubcategories: { [key: string]: any } = {};

    // Agrupar por título-categoria
    for (const [key, subcategoria] of Object.entries(subcategorias)) {
      const subcat = subcategoria as any;
      const identifier = `${subcat.title}-${subcat.categoria}`;
      
      if (!duplicates[identifier]) {
        duplicates[identifier] = [];
      }
      duplicates[identifier].push(key);
      allSubcategories[key] = subcat;
    }

    // Mostrar duplicatas
    console.log('\n📊 Análise de duplicatas:');
    let totalDuplicates = 0;
    
    for (const [identifier, keys] of Object.entries(duplicates)) {
      if (keys.length > 1) {
        console.log(`\n🔄 Duplicata encontrada: "${identifier}"`);
        console.log(`   Chaves: ${keys.join(', ')}`);
        
        keys.forEach(key => {
          const subcat = allSubcategories[key];
          console.log(`   - ${key}: ${JSON.stringify(subcat)}`);
        });
        
        totalDuplicates += keys.length - 1;
      }
    }

    console.log(`\n📈 Resumo:`);
    console.log(`   Total de subcategorias: ${Object.keys(subcategorias).length}`);
    console.log(`   Total de duplicatas: ${totalDuplicates}`);
    console.log(`   Subcategorias únicas: ${Object.keys(duplicates).length}`);

    // Verificar se há padrões nas duplicatas
    console.log('\n🔍 Verificando padrões...');
    const recentDuplicates = Object.entries(duplicates)
      .filter(([_, keys]) => keys.length > 1)
      .map(([identifier, keys]) => {
        const subcat = allSubcategories[keys[0]];
        return {
          identifier,
          keys,
          hasId: !!subcat.id,
          hasTitleID: !!subcat.titleID,
          categoria: subcat.categoria,
          title: subcat.title
        };
      });

    console.log('Duplicatas recentes:', recentDuplicates);

  } catch (error) {
    console.error('❌ Erro durante o diagnóstico:', error);
  }
}


