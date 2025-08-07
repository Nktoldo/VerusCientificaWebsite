import { ref, set, update, onValue, get, child } from "firebase/database";
import { db } from '../../../lib/firebase.mjs';
import { storage } from '../../../lib/firebase.mjs';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getStorage } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

//VARIAVEIS DE INICIACAO DO FIREBASE

function writeUserData(userId, name, email, imageUrl) {
  set(ref(db, 'users/' + userId), {
    username: name,
    email: email,
    profile_picture: imageUrl
  });
}

export function writeData(type, title, subtitle, description, technicalInfo, imageUrl, path, price, tags, supplier, video) {
  // Remove espaços e acentos do título
  const productId = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/\s+/g, ''); // Remove espaços
  
  switch (type) {
    case 2:
      update(ref(db, `produtos/${productId}/`), {
        type: type
      });
      break;
    case 1:
      if (!path) {
        console.log("Erro ao cadastrar subcategoria, necessario selecionar categoria primeiro")
      } else {
        update(ref(db, `produtos/${path}/${productId}/`), {
          type: type
        });
      }
      break;
    default:
      if (!path) {
        console.log("Erro ao cadastrar produto, necessario selecionar categoria/subcategoria primeiro")
      } else {
        update(ref(db, `produtos/${path}/${productId}/`), {
          title: title,
          subtitle: subtitle,
          description: description,
          technicalInfo: technicalInfo,
          imageUrl: imageUrl,
          price: price,
          tags: tags,
          supplier: supplier,
          video: video
        });
      }
      break;
  }
}

// writeUserData(142, "Agitador Velp", "Descrição", "info técnicas");

// writeData(0, 'teste')

// codigo pega a referencia, analisa o conteudo e se dentro de cada conteudo tiver ... retorna
// onValue(ref(db, `categoria0/`), (snapshot) => {
//   // console.log(data)
//   snapshot.forEach(element => {
//     const data = element.val();
//     if (element.hasChild('price')) {
//       console.log(element.key); // se for produto retorna os nomes deles
//   } else {
//     console.log('caminho:' + element.key);
//   }
//   });    
// });
// onValue(ref(db), (snapshot) => {
//   // console.log(data)
//   snapshot.forEach(element => {
//     const data = element.val();
//     console.log(data);
//   });    
// });

// get(child(db, `categoria0/`)).then((snapshot) => {
//   if (snapshot.exists()) {
//     console.log("Data for categoria0:", snapshot.val());
//   } else {
//     console.log("No data available at categoria0");
//   }
// }).catch((error) => {
//   console.error("Error fetching data:", error);
// });



// --- Função para Gerar Dados Fictícios (a mesma de antes) ---
// function generateFakeDatabase() {

//   for (let i = 0; i < 10; i++) {
//     set(ref(db, `produtos/categoria${i}`), {type: 2})
//     for (let j = 0; j < 10; j++) {
//       set(ref(db, `produtos/categoria${i}/subcategoria${j}`), {type: 1})
//       for (let o = 0; o < 10; o++) {
//         set(ref(db, `produtos/categoria${i}/subcategoria${j}/produto${o}`), {
//           title: "teste",
//           price: 0
//         })
//       }
//     }
//   }
// }
// generateFakeDatabase()

// Função para upload de imagem no Storage
export async function uploadProductImage(file, imageId) {
  const imgRef = storageRef(storage, `produtos/${imageId}`);
  await uploadBytes(imgRef, file);
  return await getDownloadURL(imgRef);
}

// Recebe o HTML, faz upload das imagens base64 e retorna o HTML com srcs do Storage
export async function processDescriptionImages(html) {
  // Regex para pegar todas as imagens base64
  const imgRegex = /<img[^>]+src=["'](data:image\/[^"']+)["'][^>]*>/g;
  let match;
  let newHtml = html;
  const promises = [];

  while ((match = imgRegex.exec(html)) !== null) {
    const base64 = match[1];
    // Converter base64 para Blob/File
    const res = await fetch(base64);
    const blob = await res.blob();
    const file = new File([blob], uuidv4() + '.png', { type: blob.type });
    // Upload para o Storage
    const imageId = uuidv4();
    const uploadPromise = uploadProductImage(file, `descricao/${imageId}`).then(url => {
      // Substituir o src antigo pelo novo
      newHtml = newHtml.replace(base64, url);
    });
    promises.push(uploadPromise);
  }

  await Promise.all(promises);
  return newHtml;
}

const handleEnviar = async () => {
  let imageUrlToUse = imagem;
  if (imagemFile) {
    const imageId = uuidv4();
    imageUrlToUse = await uploadProductImage(imagemFile, imageId);
  }

  // Processa as imagens da descrição
  const descricaoProcessada = await processDescriptionImages(descricao);

  await writeData(
    0,
    titulo,
    subtitulo,
    descricaoProcessada, // agora com links do Storage
    detalhes,
    imageUrlToUse,
    "categoria0",
    1999.90,
    'laboratório, agitador, magnético, digital',
    'Fornecedor XYZ',
    'https://youtube.com/watch?v=exemplo'
  );
};

// writeData(0, 'Agitador Magnético Digital', 'Modelo AM-500', '<h1>Agitador Magnético Digital</h1><p>Equipamento de laboratório para agitação de líquidos com controle digital de velocidade. Ideal para misturas homogêneas em processos de laboratório.</p><h2>Características Principais</h2><p>Controle digital de velocidade, display LCD, timer programável e proteção térmica.</p>', '<table><thead><tr><th>Especificação</th><th>Valor</th><th>Unidade</th></tr></thead><tbody><tr><td>Capacidade Máxima</td><td>500</td><td>mL</td></tr><tr><td>Material do Corpo</td><td>Aço Inox 316</td><td>-</td></tr><tr><td>Voltagem de Operação</td><td>110/220</td><td>V</td></tr><tr><td>Potência Nominal</td><td>100</td><td>W</td></tr><tr><td>Faixa de Velocidade</td><td>100-1500</td><td>rpm</td></tr><tr><td>Dimensões (LxAxP)</td><td>20x15x10</td><td>cm</td></tr><tr><td>Peso</td><td>2.5</td><td>kg</td></tr><tr><td>Temperatura Máxima</td><td>80</td><td>°C</td></tr></tbody></table>', 'https://firebasestorage.googleapis.com/v0/b/veruswebsitedh.appspot.com/o/produtos%2Fagitador_teste.jpg?alt=media&token=exemplo', 'categoria0/subcategoria0', 1999.95, 'laboratório, agitador, magnético, digital', 'Verus Cientifica', 'https://www.youtube.com/embed/dQw4w9WgXcQ');