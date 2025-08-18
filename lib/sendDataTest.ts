import { ref, set, update, onValue, get, child, push, orderByChild, equalTo, query } from "firebase/database";
import { db } from './firebase.mjs';
import { storage } from './firebase.mjs';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getStorage } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

// tipagem object de produtos passado para o bd
type Product = {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  technicalInfo?: string;
  category: string;
  subcategory?: string;
  imageUrl?: string;
  price?: string;
  tags?: string[] | Record<number, string>;
  supplier: string;
  video?: string;
  active: boolean;
};

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
  price: string;
  tags: string[] | Record<number, string>;
  supplier: string;
  video?: string;
}) {

  // se nao houver categoria selecionada, evita que produto seja criado na raiz da pagina de produtos
  if (!category) {
    alert("Erro ao cadastrar produto, necessario selecionar categoria/subcategoria primeiro")
  } else {
    push(ref(db, `produtos`), {
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
    });
  }
}

// cria e edita categorias
export async function writeCategoryData({ title }: { title: string }) {
  let categoryID = await generateLinkID({ title });
  update(ref(db, `categorias/${categoryID}/`), {
    activated: true
  });
}

// cria e edita subcategorias
export async function writeSubcategoryData({ title, category }: { title: string, category: string }) {
  let subcategoriaID = await generateLinkID({ title });
  update(ref(db, `subcategorias/${subcategoriaID}`), {
    categoria: category,
    activated: true
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
  if (category && !subcategory) {
    let dbRef = ref(db);

    let snapshot = await get(query(
      ref(db, "produtos"),
      orderByChild("categoria"),
      equalTo(category)
    ));

    if (snapshot.exists()) {
      let dados = snapshot.val();
      let produtos: Product[] = [];

      Object.entries(dados).forEach(([key, item]: [string, any]) => {
        let value = item?.value || item; // caso não use o wrapper `value`
        produtos.push({ id: key, ...value });
      });

      console.log(produtos);
      return produtos;
    } else {
      console.log("Nenhum dado encontrado");
      return [];
    }
  } else if (category && subcategory) {
    return [];
  } else {
    return [];
  }

}

// pega categorias
export async function getCategories(): Promise<string[]> {
  let categoriasList: string[] = [];
  let snapshot = await get(ref(db, "categorias"))
  snapshot.forEach(element => {
    if (element.val().activated === true) {
      categoriasList.push(element.key)
    }
  });
  return categoriasList
}

// pega subcategorias passando a categoria como parametro
export async function getSubCategories({ category }: { category: string }): Promise<string[]> {
  let subCategoriasList: string[] = [];
  let snapshot = await get(query(
    ref(db, "subcategorias"),
    orderByChild("categoria"),
    equalTo(category)
  ));

  snapshot.forEach(element => {
    if (element.key) {
      if (element.val().activated == true) {
        subCategoriasList.push(element.key);
      }
    }
  });

  return subCategoriasList;
}
