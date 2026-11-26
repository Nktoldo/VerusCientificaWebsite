'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Editor from './Editor';
import { getCategories, getSubCategories, uploadProductImage, getTags, writeProductData, getSuppleiers, getProductById, updateProductData, isExternalImageUrl, importExternalImage, importExternalImagesInHtml } from '@/lib/databaseFunctions';
import { v4 as uuidv4 } from 'uuid';
import { onValue, ref } from 'firebase/database';
import { db } from '@/lib/firebase.mjs';
import { TagPicker } from '@/app/components/TagPicker';
import { PathPicker } from '@/app/components/PathPicker';
import { useRequireAdmin } from '@/app/hooks/useAuth';

type Item = { id: string, title?: string, img?: string, active?: boolean, category?: string }

type ProductPath = {
  id: string;
  category: string;
  subcategory: string; // id da subcategoria (sempre string, nunca undefined)
  subcategoryTitle: string; // título da subcategoria para exibição (sempre string, nunca undefined)
  displayName: string;
};

export default function Formulario() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, isAdmin } = useRequireAdmin();
  const editProductId = searchParams.get('edit');
  const isEditing = !!editProductId;

  const [titulo, setTitulo] = useState('');
  const [subtitulo, setSubtitulo] = useState('');
  const [preco, setPreco] = useState('');
  const [imagem, setImagem] = useState('');
  const [video, setVideo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [detalhes, setDetalhes] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [instrucoes, setInstrucoes] = useState('');
  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [precoEspecial, setPrecoEspecial] = useState(''); // para "Sob Consulta", "Sob Orçamento", etc.
  const [categorias, setCategorias] = useState<string[]>([]);
  const [subcategorias, setSubcategorias] = useState<Item[]>([]);
  const [productPaths, setProductPaths] = useState<ProductPath[]>([]);
  const [fornecedores, setFornecedores] = useState<string[]>([]);
  const [fornecedor, setFornecedor] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagsSelecionadas, setTagsSelecionadas] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [destaque, setDestaque] = useState(false);

  // carregar dados do produto se estiver editando
  useEffect(() => {
    if (isEditing && editProductId) {
      loadProductData(editProductId);
    }
  }, [isEditing, editProductId]);

  const loadProductData = async (productId: string) => {
    try {
      const productData = await getProductById({ id: productId });
      if (productData && typeof productData === 'object' && 'title' in productData) {
        const product = productData as any;
        setTitulo(product.title || '');
        setSubtitulo(product.subtitle || '');
        setPreco(product.price?.toString() || '');
        setImagem(product.imageUrl || '');
        setVideo(product.video || '');
        setDestaque(product.featured === true);
        setDescricao(product.description || '');
        setDetalhes(product.technicalInfo || '');
        setFornecedor(product.supplier || '');

        // carrega caminhos do produto
        const paths: ProductPath[] = [];
        
        // se existem caminhos estruturados, usar eles
        if (product.paths && Array.isArray(product.paths)) {
          setProductPaths(product.paths);
        } else {
          // caso contrário, criar caminhos a partir dos dados antigos
          if (product.categories && Array.isArray(product.categories)) {
            product.categories.forEach((category: string, index: number) => {
              const subcategory = product.subcategories && product.subcategories[index] ? product.subcategories[index] : "";
              paths.push({
                id: `legacy-${index}-${Date.now()}`,
                category: category,
                subcategory: subcategory || "", // sempre string, nunca undefined
                subcategoryTitle: subcategory || "", // sempre string, nunca undefined
                displayName: subcategory ? `${category} > ${subcategory}` : category
              });
            });
          } else if (product.category) {
            paths.push({
              id: `legacy-single-${Date.now()}`,
              category: product.category,
              subcategory: product.subcategory || "", // sempre string, nunca undefined
              subcategoryTitle: product.subcategory || "", // sempre string
              displayName: product.subcategory ? `${product.category} > ${product.subcategory}` : product.category
            });
          }
          setProductPaths(paths);
        }

        // carregar tags se existirem
        if (product.tags) {
          if (Array.isArray(product.tags)) {
            setTagsSelecionadas(product.tags);
          } else if (typeof product.tags === 'string') {
            setTagsSelecionadas(product.tags.split(',').map((t: string) => t.trim()));
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do produto:', error);
      // exibe feedback ao usuário
      console.error('Erro ao carregar dados do produto:', error);
    }
  };

  const handleEnviar = async () => {
    let imageUrlToUse = imagem;
    if (imagemFile) {
      const imageId = uuidv4();
      imageUrlToUse = await uploadProductImage(imagemFile, imageId);
    }

    let descricaoParaEnviar = descricao;
    let detalhesParaEnviar = detalhes;
    if (user) {
      const idToken = await user.getIdToken();
      const falhas: string[] = [];

      if (!imagemFile && isExternalImageUrl(imagem)) {
        try {
          imageUrlToUse = await importExternalImage(imagem, idToken);
        } catch (error) {
          falhas.push(`Imagem principal: ${imagem} (${error instanceof Error ? error.message : String(error)})`);
        }
      }

      const [descricaoImportada, detalhesImportados] = await Promise.all([
        importExternalImagesInHtml(descricao, idToken),
        importExternalImagesInHtml(detalhes, idToken)
      ]);
      descricaoParaEnviar = descricaoImportada.html;
      detalhesParaEnviar = detalhesImportados.html;
      falhas.push(...descricaoImportada.falhas, ...detalhesImportados.falhas);

      if (falhas.length > 0 && !confirm(
        `Não foi possível copiar ${falhas.length} imagem(ns) para o Storage:\n\n${falhas.join('\n')}\n\nSalvar mesmo assim com os links externos?`
      )) {
        return;
      }
    }

    // tratar o preço antes de enviar
    let precoParaEnviar = null;
    if (preco && preco !== "" && preco !== "Solicite cotação") {
      const precoNumerico = parseFloat(preco);
      if (!isNaN(precoNumerico)) {
        precoParaEnviar = precoNumerico;
      }
    }

    try {
      if (isEditing && editProductId) {
        // atualizar produto existente
        await updateProductData(editProductId, {
          title: titulo,
          subtitle: subtitulo,
          description: descricaoParaEnviar,
          technicalInfo: detalhesParaEnviar,
          imageUrl: imageUrlToUse,
          paths: productPaths,
          // manter compatibilidade com campos antigos
          category: productPaths.length > 0 ? productPaths[0].category : '',
          subcategory: productPaths.length > 0 ? productPaths[0].subcategory || '' : '',
          categories: [...new Set(productPaths.map(path => path.category))].filter((cat): cat is string => typeof cat === 'string'),
          subcategories: [...new Set(productPaths.map(path => path.subcategory).filter((sub): sub is string => !!sub && sub !== ''))],
          price: precoParaEnviar ? precoParaEnviar.toString() : "",
          tags: tagsSelecionadas,
          supplier: fornecedor,
          video: video,
          featured: destaque
        });

        // produto atualizado com sucesso
        router.push('/editor');
      } else {
        // criar novo produto
        await writeProductData({
          title: titulo,
          subtitle: subtitulo,
          description: descricaoParaEnviar,
          technicalInfo: detalhesParaEnviar,
          imageUrl: imageUrlToUse,
          paths: productPaths,
          // manter compatibilidade com campos antigos
          category: productPaths.length > 0 ? productPaths[0].category : '',
          subcategory: productPaths.length > 0 ? productPaths[0].subcategory || '' : '',
          categories: [...new Set(productPaths.map(path => path.category))].filter((cat): cat is string => typeof cat === 'string'),
          subcategories: [...new Set(productPaths.map(path => path.subcategory).filter((sub): sub is string => !!sub && sub !== ''))],
          price: precoParaEnviar ? precoParaEnviar.toString() : "",
          tags: tagsSelecionadas,
          supplier: fornecedor,
          video: video,
          featured: destaque
        });

        // limpar formulário
        setTitulo('');
        setSubtitulo('');
        setPreco('');
        setImagem('');
        setVideo('');
        setDescricao('');
        setDetalhes('');
        setTagsSelecionadas([]);
        setProductPaths([]);
        setImagemFile(null);
        setDestaque(false);
      }
    } catch (error) {
      console.error('Erro ao enviar produto:', error);
      // erro ao enviar produto
      console.error('Erro ao enviar produto:', error);
    }
  };

  // busca fornecedores ao montar
  useEffect(() => {
    getSuppleiers()
      .then(lista => { setFornecedores(lista) })
      .catch(err => {
        console.error('Erro ao buscar fornecedores:', err);
      });
  }, [])

  // busca tags ao montar
  useEffect(() => {
    getTags()
      .then((lista) => {
        // garante unicidade e ordenação alfabética
        const unicas = Array.from(new Set(lista)).sort((a, b) =>
          a.localeCompare(b, 'pt-BR', { sensitivity: 'base' })
        );
        setTags(unicas);
      })
      .catch((err) => {
        console.error(err);
        alert('Problema ao buscar tags');
      });
  }, []);

  // buscar categorias ao montar
  useEffect(() => {
    let isMounted = true; // evita setState após unmount
  
    (async () => {
      try {
        const categoryList: string[] = [];
        const cats = await getCategories().then((cats: any) => {
          for (let i in cats) {
            categoryList.push(cats[i].title);
          }
        })
  
        if (!isMounted) return;
  
        setCategorias(categoryList);
      } catch (err) {
        alert(`Problema ao buscar categorias\n\nErro:\n${err}`);
      }
    })();
  
    // cleanup
    return () => {
      isMounted = false;
    };
  }, []); 

  // busca todas as subcategorias para o PathPicker
  useEffect(() => {
    const loadAllSubcategories = async () => {
      try {
        const subCategoryList: Item[] = [];
        const subcats = await getSubCategories({ category: "none" });
        
        for (let i in subcats) {
          subCategoryList.push({
            id: subcats[i].id,
            title: subcats[i].title,
            category: subcats[i].category
          })
        }
        
        setSubcategorias(subCategoryList);
      } catch (err) {
        console.error('Erro ao buscar subcategorias:', err);
        alert(`Problema ao buscar subcategorias\n\nErro:\n${err}`);
      }
    };

    loadAllSubcategories();
  }, []);

  // mostra carregamento enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-300 mx-auto mb-4"></div>
          <p className="text-slate-200 text-lg">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // não renderiza nada se não for admin (redirecionado)
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="w-full pt-14 p-4 sm:p-6 flex flex-col gap-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-b-2xl shadow-2xl border border-slate-700">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-blue-300">
          {isEditing ? 'Editar Produto' : 'Cadastro de Produto'}
        </h1>
        <div className="flex gap-2">
          {isEditing && (
            <button
              onClick={() => router.push('/editor')}
              className="bg-slate-600 hover:bg-slate-700 text-white font-semibold px-4 py-2 rounded transition border border-slate-800"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* Seleção de Caminhos do Produto */}
      <PathPicker
        categories={categorias.map(cat => ({ id: cat, title: cat, active: true }))}
        subcategories={subcategorias.map(subcat => ({ id: subcat.id, title: subcat.title || '', active: true, category: subcat.category }))}
        selectedPaths={productPaths}
        onPathsChange={setProductPaths}
        placeholder="Selecionar categoria..."
        subcategoriesPlaceholder="Selecionar subcategoria (opcional)..."
      />

      <div className="flex flex-col gap-2">
        <label className="font-semibold text-slate-200">Título:</label>
        <input
          type="text"
          className="border border-slate-700 bg-slate-800 text-slate-100 w-full rounded-md p-2 focus:outline-blue-400 placeholder:text-slate-500"
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-semibold text-slate-200">Subtítulo:</label>
        <input
          type="text"
          className="border border-slate-700 bg-slate-800 text-slate-100 w-full rounded-md p-2 focus:outline-blue-400 placeholder:text-slate-500"
          value={subtitulo}
          onChange={e => setSubtitulo(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-semibold text-slate-200">Preço (opcional):</label>
        <input
          type="text"
          className="border border-slate-700 bg-slate-800 text-slate-100 w-full rounded-md p-2 focus:outline-blue-400 placeholder:text-slate-500"
          value={preco}
          onChange={e => setPreco(e.target.value)}
          min={0}
          step={0.01}
          placeholder="Ex: 1999.90"
        />
      </div>

      {/* Tags (multi-seleção com busca + chips) */}
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-slate-200">Tags:</label>

        {/* Container do seletor */}
        <div className="relative">
          {/* Campo de busca + chips */}
          <TagPicker
            options={tags}
            select={true}
            value={tagsSelecionadas}
            onChange={setTagsSelecionadas}
            placeholder="Digite para buscar e Enter para adicionar..."
          />
        </div>

        {/* Dica opcional */}
        <p className="text-xs text-slate-400">
          Dica: use Enter para adicionar a tag destacada, clique no "×" para remover.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-semibold text-slate-200">Fornecedor:</label>
        <select
          className="border border-slate-700 bg-slate-800 text-slate-100 w-full rounded-md p-2"
          value={fornecedor}
          onChange={e => setFornecedor(e.target.value)}
        >
          <option value="">Selecione uma Fornecedor</option>
          {fornecedores.map(sup => (
            <option key={sup} value={sup}>{sup}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 mt-2 text-slate-200">
          <input
            type="checkbox"
            className="w-4 h-4"
            checked={destaque}
            onChange={e => setDestaque(e.target.checked)}
          />
          Destaque no carrossel da página do fornecedor (ex.: /loccus)
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-semibold text-slate-200">URL da Imagem:</label>
        <input
          type="text"
          className="border border-slate-700 bg-slate-800 text-slate-100 w-full rounded-md p-2 focus:outline-blue-400 placeholder:text-slate-500"
          value={imagem}
          onChange={e => setImagem(e.target.value)}
          placeholder="Cole o link da imagem do produto"
        />
        <input
          type="file"
          accept="image/*"
          className="mt-2 text-slate-100"
          onChange={e => setImagemFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-semibold text-slate-200">URL do Vídeo (opcional):</label>
        <input
          type="text"
          className="border border-slate-700 bg-slate-800 text-slate-100 w-full rounded-md p-2 focus:outline-blue-400 placeholder:text-slate-500"
          value={video}
          onChange={e => setVideo(e.target.value)}
          placeholder="Cole o link do vídeo do produto (YouTube, etc)"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-semibold text-slate-200">Descrição:</label>
        <Editor content={descricao} onChange={setDescricao} />
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-slate-200">Detalhes Técnicos:</label>
        <Editor content={detalhes} onChange={setDetalhes} />
      </div>

      <button
        disabled={enviando}
        onClick={async () => {
          setEnviando(true);
          window.scrollTo({ top: 0, behavior: 'smooth'});
          try {
            await handleEnviar();
          } finally {
            setEnviando(false);
          }
        }}
        className="mt-6 px-6 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition border border-blue-900 shadow-lg w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {enviando ? 'Enviando...' : (isEditing ? 'Atualizar Produto' : 'Enviar para Firebase')}
      </button>
    </div>
  );
}