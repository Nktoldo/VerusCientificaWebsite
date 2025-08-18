'use client';

import { useEffect, useState } from 'react';
import Editor from './Editor';
import { uploadProductImage } from '@/lib/sendDataTest';
import { v4 as uuidv4 } from 'uuid';
import { onValue, ref } from 'firebase/database';
import { db } from '@/lib/firebase.mjs';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: "AIzaSyDF26FD1kHIX0SgdLear-3VYuIGLcVJDDM" // Coloque sua chave aqui diretamente
});

async function getHTMLFromUrl(url: string) {
  const resposta = await fetch("/api/html", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ url })
  });

  const dados = await resposta.json();
  return dados.html;
}


export default function Formulario() {
  const [titulo, setTitulo] = useState('');
  const [subtitulo, setSubtitulo] = useState('');
  const [preco, setPreco] = useState('');
  const [tags, setTags] = useState('');
  const [fornecedor, setFornecedor] = useState('');
  const [imagem, setImagem] = useState('');
  const [video, setVideo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [detalhes, setDetalhes] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [instrucoes, setInstrucoes] = useState('');
  const [imagemFile, setImagemFile] = useState<File | null>(null);
  const [precoEspecial, setPrecoEspecial] = useState(''); // Para "Sob Consulta", "Sob Orçamento", etc.

  const handleEnviar = async () => {
    let imageUrlToUse = imagem;
    if (imagemFile) {
      const imageId = uuidv4();
      imageUrlToUse = await uploadProductImage(imagemFile, imageId);
    }

    // Tratar o preço antes de enviar
    let precoParaEnviar = null;
    if (preco && preco !== "" && preco !== "Solicite cotação") {
      const precoNumerico = parseFloat(preco);
      if (!isNaN(precoNumerico)) {
        precoParaEnviar = precoNumerico;
      }
    }

    // await writeData({
    //   type: 0,
    //   title: titulo,
    //   subtitle: subtitulo,
    //   supplier: fornecedor,
    //   description: descricao,
    //   technicalInfo: detalhes,
    //   imageUrl: imagem,
    //   category: categoriaSelecionada,
    //   subcategory: subcategoriaSelecionada,
    //   price: preco || "Solicite orcamento",
    //   tags: tags
    // })
  };

  const [categorias, setCategorias] = useState<string[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('');
  const [subcategorias, setSubcategorias] = useState<string[]>([]);
  const [subcategoriaSelecionada, setSubcategoriaSelecionada] = useState('');

  // Buscar categorias ao montar
  useEffect(() => {
    const categoriasRef = ref(db, 'categorias');
    onValue(categoriasRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const cats = Object.keys(data).filter(key => data[key].type === 2);
        setCategorias(cats);
      }
    });
  }, []);

  // Buscar subcategorias quando categoriaSelecionada mudar
  useEffect(() => {
    if (!categoriaSelecionada) {
      setSubcategorias([]);
      setSubcategoriaSelecionada('');
      return;
    }
    const subRef = ref(db, `categorias/${categoriaSelecionada}`);
    onValue(subRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const subs = Object.keys(data).filter(key => data[key].type === 1);
        setSubcategorias(subs);
      }
    });
  }, [categoriaSelecionada]);
  const path = `${categoriaSelecionada}/${subcategoriaSelecionada}`;

  // Estado para controlar o modal
  const [showIAModal, setShowIAModal] = useState(false);
  // Estados para os campos do modal IA
  const [iaLink, setIaLink] = useState("");
  const [iaMensagem, setIaMensagem] = useState("");

  async function handleEnviarIA() {
    const html = await getHTMLFromUrl(iaLink);
    if (!html) {
      alert('Não foi possível obter o HTML da URL informada.');
      return;
    } else {
      console.log(html);
    }

    const prompt = `Extraia e sugira os seguintes campos em formato JSON, analisando SOMENTE o conteúdo do html (não pesquise fora do html ou link fornecido):

LINK:
${iaLink}

HTML:
${html}

JSON:
{
  "titulo": "",
  "subtitulo": "",
  "tags": "",
  "fornecedor": "",
  "imagem": "",
  "video": "",
  "descricao": "",
  "detalhes": ""
}

- O subtitulo deve ser o modelo do produto, se houver. Caso tenha, nao colocar no titulo.
- A imagem deve ser o link direto da imagem do produto.
- O vídeo deve ser o link do YouTube do iframe, se houver.
- A descrição deve ser completa e exata do produto, formate com <p> e <br>, <b> e <i> para quebrar linhas, formatar, criar divisoes, destacar informações e titulos.
- Os detalhes devem conter as informações técnicas, preferencialmente em formato de tabela utilizando <table> e <tr> e <td>, se houver.
- Sempre preencha: titulo, subtitulo, descricao, detalhes, tags, fornecedor (a menos que não existam).
- NUNCA INVENTE DADOS.
- Não use informações de outros produtos da página, apenas do produto principal.

REVISE OS DADOS E VEJA SE ESTAO COMPLETOS, NAO FALTA NADA E ESTAO CORRETOS.

Responda apenas com o JSON.`;

    try {
      const chat = ai.chats.create({
        model: "gemini-2.5-flash",
      });

      const response = await chat.sendMessage({ message: prompt });
      const resposta = response.text;

      // Limpar blocos markdown ```json ... ``` ou ``` ... ```
      let respostaLimpa = resposta ?? "";
      // Remove blocos markdown do início e fim
      respostaLimpa = respostaLimpa.replace(/^```[a-zA-Z]*\s*([\s\S]*?)\s*```$/m, '$1').trim();
      // Se ainda houver múltiplos blocos, pega o primeiro JSON válido
      const match = respostaLimpa.match(/\{[\s\S]*\}/);
      if (match) {
        respostaLimpa = match[0];
      }
      const sugestao = JSON.parse(respostaLimpa);

      if (sugestao.titulo) setTitulo(sugestao.titulo);
      if (sugestao.subtitulo) setSubtitulo(sugestao.subtitulo);
      if (sugestao.preco === "Solicite cotação") {
        setPreco("Solicite cotação");
      } else if (sugestao.preco) {
        setPreco(sugestao.preco);
      }
      if (sugestao.tags) setTags(sugestao.tags);
      if (sugestao.fornecedor) setFornecedor(sugestao.fornecedor);
      if (sugestao.imagem) setImagem(sugestao.imagem);
      if (sugestao.video) setVideo(sugestao.video);
      if (sugestao.descricao) setDescricao(sugestao.descricao);
      if (sugestao.detalhes) setDetalhes(sugestao.detalhes);
      setShowIAModal(false);
    } catch (e) {
      alert('Não foi possível interpretar a resposta da IA.');
      console.error(e);
    }
  }

  return (
    <div className="w-full pt-24 p-6 flex flex-col gap-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-b-2xl shadow-2xl border border-slate-700">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-blue-300">Cadastro de Produto</h1>
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded transition"
          onClick={() => setShowIAModal(true)}
        >
          IA Assistent
        </button>
      </div>

      {/* Modal IA Assistent */}
      {showIAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setShowIAModal(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-green-700">IA Assistent</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Link</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="Insira um link do produto aqui"
                  value={iaLink}
                  onChange={e => setIaLink(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mensagem</label>
                <textarea
                  className="w-full border border-gray-300 rounded px-3 py-2 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder="Insira instrucoes extras para a IA"
                  value={iaMensagem}
                  onChange={e => setIaMensagem(e.target.value)}
                />
              </div>
              <button className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition"
                onClick={handleEnviarIA}
              >Enviar</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="font-semibold text-slate-200">Categoria:</label>
        <select
          className="border border-slate-700 bg-slate-800 text-slate-100 w-full rounded-md p-2"
          value={categoriaSelecionada}
          onChange={e => setCategoriaSelecionada(e.target.value)}
        >
          <option value="">Selecione uma categoria</option>
          {categorias.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-slate-200">Subcategoria:</label>
        <select
          className="border border-slate-700 bg-slate-800 text-slate-100 w-full rounded-md p-2"
          value={subcategoriaSelecionada}
          onChange={e => setSubcategoriaSelecionada(e.target.value)}
          disabled={!categoriaSelecionada}
        >
          <option value="">Selecione uma subcategoria</option>
          {subcategorias.map(sub => (
            <option key={sub} value={sub}>{sub}</option>
          ))}
        </select>
      </div>

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

      <div className="flex flex-col gap-2">
        <label className="font-semibold text-slate-200">Tags (separadas por vírgula):</label>
        <input
          type="text"
          className="border border-slate-700 bg-slate-800 text-slate-100 w-full rounded-md p-2 focus:outline-blue-400 placeholder:text-slate-500"
          value={tags}
          onChange={e => setTags(e.target.value)}
          placeholder="Ex: Agitador, Digital, Laboratório"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-semibold text-slate-200">Fornecedor:</label>
        <input
          type="text"
          className="border border-slate-700 bg-slate-800 text-slate-100 w-full rounded-md p-2 focus:outline-blue-400 placeholder:text-slate-500"
          value={fornecedor}
          onChange={e => setFornecedor(e.target.value)}
        />
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
        <Editor key={descricao} content={descricao} onChange={setDescricao} />
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-slate-200">Detalhes Técnicos:</label>
        <Editor key={detalhes} content={detalhes} onChange={setDetalhes} />
      </div>

      <button onClick={handleEnviar} className="mt-6 px-6 py-3 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-800 transition border border-blue-900 shadow-lg">Enviar para Firebase</button>
    </div>
  );
}