'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Strike from '@tiptap/extension-strike'
import CodeBlock from '@tiptap/extension-code-block'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import { useState, useEffect } from 'react'

// Componente de botão da barra de ferramentas
const ToolbarButton = ({ onClick, isActive = false, disabled = false, children, title, className = "" }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`px-4 py-2.5 border rounded-lg transition-all duration-300 font-medium text-sm backdrop-blur-sm ${
      isActive 
        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 shadow-lg shadow-blue-500/25 transform scale-105' 
        : 'bg-white/80 text-gray-700 border-gray-200 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:border-blue-300 hover:shadow-md hover:transform hover:scale-105'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'} ${className}`}
  >
    {children}
  </button>
)

// Componente de seletor de cor
const ColorPicker = ({ onColorChange, currentColor = '#000000' }) => (
  <div className="flex items-center gap-2">
    <input
      type="color"
      value={currentColor}
      onChange={(e) => onColorChange(e.target.value)}
      className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
      title="Selecionar cor do texto"
    />
  </div>
)

// Componente de seletor de tamanho de fonte
const FontSizeSelector = ({ onSizeChange, currentSize = '16px' }) => (
  <select
    value={currentSize}
    onChange={(e) => {
      console.log('FontSizeSelector onChange:', e.target.value);
      onSizeChange(e.target.value);
    }}
    className="px-2 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="12px">12px</option>
    <option value="14px">14px</option>
    <option value="16px">16px</option>
    <option value="18px">18px</option>
    <option value="20px">20px</option>
    <option value="24px">24px</option>
    <option value="28px">28px</option>
    <option value="32px">32px</option>
    <option value="36px">36px</option>
    <option value="48px">48px</option>
  </select>
)

export default function Editor({ content = '', onChange }) {
  const [mounted, setMounted] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState('16px');

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Comece a escrever seu conteúdo aqui...',
        includeChildren: true,
        emptyEditorClass: 'is-editor-empty',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Strike,
      CodeBlock,
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      Image,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: mounted ? content : '',
    onUpdate: ({ editor }) => {
      if (mounted) {
        onChange(editor.getHTML());
      }
    },
    immediatelyRender: false,
  })

  // Atualizar o conteúdo quando mounted mudar
  useEffect(() => {
    if (mounted && editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [mounted, editor, content]);

  // Funções auxiliares
  const setLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const setImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setShowImageInput(false);
    }
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const addColumn = () => {
    editor.chain().focus().addColumnAfter().run();
  };

  const addRow = () => {
    editor.chain().focus().addRowAfter().run();
  };

  const deleteTable = () => {
    editor.chain().focus().deleteTable().run();
  };

  const deleteColumn = () => {
    editor.chain().focus().deleteColumn().run();
  };

  const deleteRow = () => {
    editor.chain().focus().deleteRow().run();
  };

  const mergeCells = () => {
    editor.chain().focus().mergeCells().run();
  };

  const splitCell = () => {
    editor.chain().focus().splitCell().run();
  };

  const applyTextColor = (color) => {
    // Aplica cor ao texto selecionado
    editor.chain().focus().setColor(color).run();
  };

  const applyFontSize = (size) => {
    console.log('Aplicando tamanho de fonte:', size);
    // Aplica tamanho ao texto selecionado usando TextStyle
    editor.chain().focus().setMark('textStyle', { fontSize: size }).run();
  };

  if (!mounted || !editor) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Carregando editor...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Barra de Ferramentas Principal */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Formatação de Texto */}
          <div className="flex items-center gap-1 p-2 bg-white rounded-lg border border-gray-200">
            <span className="text-xs font-medium text-gray-500 mr-2">Texto</span>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title="Negrito (Ctrl+B)"
            >
              <b>B</b>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title="Itálico (Ctrl+I)"
            >
              <i>I</i>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive('underline')}
              title="Sublinhado (Ctrl+U)"
            >
              <u>U</u>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
              title="Tachado"
            >
              <s>S</s>
            </ToolbarButton>
          </div>

          {/* Títulos */}
          <div className="flex items-center gap-1 p-2 bg-white rounded-lg border border-gray-200">
            <span className="text-xs font-medium text-gray-500 mr-2">Títulos</span>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive('heading', { level: 1 })}
              title="Título 1"
            >
              H1
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive('heading', { level: 2 })}
              title="Título 2"
            >
              H2
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive('heading', { level: 3 })}
              title="Título 3"
            >
              H3
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setParagraph().run()}
              isActive={editor.isActive('paragraph')}
              title="Parágrafo"
            >
              P
            </ToolbarButton>
          </div>

          {/* Listas */}
          <div className="flex items-center gap-1 p-2 bg-white rounded-lg border border-gray-200">
            <span className="text-xs font-medium text-gray-500 mr-2">Listas</span>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              title="Lista com marcadores"
            >
              •
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              title="Lista numerada"
            >
              1.
            </ToolbarButton>
          </div>

          {/* Alinhamento */}
          <div className="flex items-center gap-1 p-2 bg-white rounded-lg border border-gray-200">
            <span className="text-xs font-medium text-gray-500 mr-2">Alinhar</span>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              isActive={editor.isActive({ textAlign: 'left' })}
              title="Alinhar à esquerda"
            >
              ⬅️
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              isActive={editor.isActive({ textAlign: 'center' })}
              title="Centralizar"
            >
              ↔️
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              isActive={editor.isActive({ textAlign: 'right' })}
              title="Alinhar à direita"
            >
              ➡️
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('justify').run()}
              isActive={editor.isActive({ textAlign: 'justify' })}
              title="Justificar"
            >
              ⬌
            </ToolbarButton>
          </div>

          {/* Cores e Tamanho */}
          <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200">
            <span className="text-xs font-medium text-gray-500">Cor</span>
            <ColorPicker onColorChange={applyTextColor} currentColor={textColor} />
            <span className="text-xs font-medium text-gray-500 ml-2">Tamanho</span>
            <FontSizeSelector onSizeChange={applyFontSize} currentSize="16px" />
          </div>
        </div>

        {/* Segunda Linha de Ferramentas */}
        <div className="flex flex-wrap gap-2">
          {/* Links e Imagens */}
          <div className="flex items-center gap-1 p-2 bg-white rounded-lg border border-gray-200">
            <span className="text-xs font-medium text-gray-500 mr-2">Mídia</span>
            <ToolbarButton
              onClick={() => setShowLinkInput(true)}
              title="Inserir link"
            >
              🔗
            </ToolbarButton>
            <ToolbarButton
              onClick={() => setShowImageInput(true)}
              title="Inserir imagem"
            >
              🖼️
            </ToolbarButton>
          </div>

          {/* Tabelas */}
          <div className="flex items-center gap-1 p-2 bg-white rounded-lg border border-gray-200">
            <span className="text-xs font-medium text-gray-500 mr-2">Tabela</span>
            <ToolbarButton
              onClick={addTable}
              title="Inserir tabela (3x3)"
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={addColumn}
              title="Adicionar coluna"
              className="bg-gradient-to-r from-green-500 to-green-600 text-white border-green-600 hover:from-green-600 hover:to-green-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={addRow}
              title="Adicionar linha"
              className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-purple-600 hover:from-purple-600 hover:to-purple-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={deleteTable}
              title="Deletar tabela"
              className="bg-gradient-to-r from-red-500 to-red-600 text-white border-red-600 hover:from-red-600 hover:to-red-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={deleteColumn}
              title="Deletar coluna"
              className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={deleteRow}
              title="Deletar linha"
              className="bg-gradient-to-r from-pink-500 to-pink-600 text-white border-pink-600 hover:from-pink-600 hover:to-pink-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={mergeCells}
              title="Mesclar células"
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-indigo-600 hover:from-indigo-600 hover:to-indigo-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </ToolbarButton>
            <ToolbarButton
              onClick={splitCell}
              title="Dividir células"
              className="bg-gradient-to-r from-teal-500 to-teal-600 text-white border-teal-600 hover:from-teal-600 hover:to-teal-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </ToolbarButton>
          </div>

          {/* Código */}
          <div className="flex items-center gap-1 p-2 bg-white rounded-lg border border-gray-200">
            <span className="text-xs font-medium text-gray-500 mr-2">Código</span>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive('code')}
              title="Código inline"
            >
              &lt;/&gt;
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              isActive={editor.isActive('codeBlock')}
              title="Bloco de código"
            >
              📝
            </ToolbarButton>
          </div>

          {/* Citações */}
          <div className="flex items-center gap-1 p-2 bg-white rounded-lg border border-gray-200">
            <span className="text-xs font-medium text-gray-500 mr-2">Citação</span>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              title="Citação"
            >
              💬
            </ToolbarButton>
          </div>
        </div>
      </div>

      {/* Inputs para Link e Imagem */}
      {showLinkInput && (
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Digite a URL do link..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="flex-1 px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={setLink}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Inserir
            </button>
            <button
              onClick={() => setShowLinkInput(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {showImageInput && (
        <div className="p-4 bg-green-50 border-b border-green-200">
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Digite a URL da imagem..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="flex-1 px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              onClick={setImage}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
            >
              Inserir
            </button>
            <button
              onClick={() => setShowImageInput(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="p-6">
        <EditorContent 
          editor={editor} 
          className="tiptap prose prose-lg max-w-none min-h-[400px] focus:outline-none" 
        />
      </div>

      {/* Estilos CSS */}
      <style jsx global>{`
        .tiptap {
          outline: none;
        }

        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          font-style: italic;
          pointer-events: none;
          height: 0;
        }

        .tiptap h1 {
          font-size: 2.5em;
          color: #1e40af;
          font-weight: 700;
          margin: 1em 0 0.5em 0;
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 0.3em;
        }

        .tiptap h2 {
          font-size: 2em;
          color: #1d4ed8;
          font-weight: 600;
          margin: 0.8em 0 0.4em 0;
        }

        .tiptap h3 {
          font-size: 1.5em;
          color: #2563eb;
          font-weight: 600;
          margin: 0.6em 0 0.3em 0;
        }

        .tiptap p {
          margin: 0.8em 0;
          line-height: 1.6;
          color: #374151;
        }

        .tiptap ul, .tiptap ol {
          margin: 0.8em 0;
          padding-left: 2em;
          list-style-position: outside;
        }

        .tiptap ul {
          list-style-type: disc;
        }

        .tiptap ol {
          list-style-type: decimal;
        }

        .tiptap li {
          margin: 0.4em 0;
          line-height: 1.5;
          display: list-item;
        }

        .tiptap blockquote {
          border-left: 4px solid #3b82f6;
          margin: 1em 0;
          padding: 0.5em 1em;
          background-color: #f8fafc;
          font-style: italic;
          color: #4b5563;
        }

        .tiptap code {
          background-color: #f3f4f6;
          padding: 0.2em 0.4em;
          border-radius: 0.25em;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          color: #dc2626;
        }

        .tiptap pre {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 1em;
          border-radius: 0.5em;
          overflow-x: auto;
          margin: 1em 0;
        }

        .tiptap pre code {
          background-color: transparent;
          color: inherit;
          padding: 0;
        }

        .tiptap table {
          border-collapse: separate;
          border-spacing: 0;
          margin: 2em 0;
          width: 100%;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border: 1px solid #e2e8f0;
          background: #ffffff;
          backdrop-filter: blur(10px);
        }

        .tiptap th {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1.25rem 1.5rem;
          text-align: left;
          font-weight: 600;
          font-size: 0.9rem;
          letter-spacing: 0.05em;
          border: none;
          position: relative;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          text-transform: uppercase;
        }

        .tiptap th:first-child {
          border-top-left-radius: 16px;
        }

        .tiptap th:last-child {
          border-top-right-radius: 16px;
        }

        .tiptap th::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%);
        }

        .tiptap td {
          padding: 1.25rem 1.5rem;
          border: none;
          color: #2d3748;
          font-size: 0.95rem;
          line-height: 1.6;
          border-bottom: 1px solid #f7fafc;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }

        .tiptap tr {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .tiptap tr:nth-child(even) {
          background: #ffffff;
        }

        .tiptap tr:nth-child(odd) {
          background: #f8fafc;
        }

        .tiptap tr:hover {
          background: linear-gradient(135deg, #f0f4ff 0%, #e6f3ff 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
        }

        .tiptap tr:hover td {
          color: #1a202c;
        }

        .tiptap tr:last-child td:first-child {
          border-bottom-left-radius: 16px;
        }

        .tiptap tr:last-child td:last-child {
          border-bottom-right-radius: 16px;
        }

        /* Estilo para células vazias */
        .tiptap td:empty::before {
          content: '—';
          color: #a0aec0;
          font-style: italic;
          font-weight: 300;
        }

        /* Responsividade para tabelas */
        @media (max-width: 768px) {
          .tiptap table {
            font-size: 0.875rem;
            margin: 1em 0;
          }

          .tiptap th,
          .tiptap td {
            padding: 0.75rem 0.5rem;
          }
        }

        /* Estilos para edição de tabelas */
        .tiptap table .selectedCell {
          background: linear-gradient(135deg, #e6f3ff 0%, #cce7ff 100%) !important;
          box-shadow: inset 0 0 0 3px #667eea;
          border-radius: 8px;
        }

        .tiptap table .selectedCell::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent 30%, rgba(102, 126, 234, 0.1) 50%, transparent 70%);
          pointer-events: none;
          border-radius: 8px;
        }

        /* Estilos para resizing de colunas */
        .tiptap table .column-resize-handle {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          width: 4px;
          border-radius: 2px;
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .tiptap table .column-resize-handle:hover {
          opacity: 1;
          width: 6px;
          box-shadow: 0 0 10px rgba(102, 126, 234, 0.5);
        }

        /* Estilos para células com foco */
        .tiptap table td:focus,
        .tiptap table th:focus {
          outline: none;
          background: linear-gradient(135deg, #fff5e6 0%, #ffeaa7 100%) !important;
          box-shadow: inset 0 0 0 3px #f39c12;
          border-radius: 8px;
        }

        /* Animação de entrada para novas linhas/colunas */
        .tiptap table tr.new-row {
          animation: slideInFromTop 0.3s ease-out;
        }

        .tiptap table td.new-cell {
          animation: slideInFromLeft 0.3s ease-out;
        }

        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Estilos para tabelas com scroll horizontal */
        .tiptap .table-wrapper {
          overflow-x: auto;
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        /* Estilos para indicadores de tabela */
        .tiptap table::before {
          content: '📊';
          position: absolute;
          top: -30px;
          left: 0;
          font-size: 1.2rem;
          opacity: 0.7;
        }

        /* Estilos para células com dados importantes */
        .tiptap table td.important {
          background: linear-gradient(135deg, #fff5e6 0%, #ffeaa7 100%);
          font-weight: 600;
          color: #d68910;
          border-left: 4px solid #f39c12;
        }

        .tiptap table td.success {
          background: linear-gradient(135deg, #e8f8f5 0%, #d5f4e6 100%);
          color: #0e7c61;
          border-left: 4px solid #27ae60;
        }

        .tiptap table td.warning {
          background: linear-gradient(135deg, #fff5e6 0%, #ffeaa7 100%);
          color: #d68910;
          border-left: 4px solid #f39c12;
        }

        .tiptap table td.error {
          background: linear-gradient(135deg, #fdeaea 0%, #fad5d5 100%);
          color: #c53030;
          border-left: 4px solid #e74c3c;
        }

        /* Estilos para células mescladas */
        .tiptap table td[colspan],
        .tiptap table td[rowspan] {
          background: linear-gradient(135deg, #f0f4ff 0%, #e6f3ff 100%);
          font-weight: 600;
          color: #4c51bf;
          text-align: center;
          border: 2px solid #667eea;
          border-radius: 8px;
        }

        /* Estilos para células de cabeçalho personalizadas */
        .tiptap table th.custom-header {
          background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
          color: white;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .tiptap table th.warning-header {
          background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%);
          color: white;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        /* Efeitos de hover mais sofisticados */
        .tiptap table tr:hover td {
          transform: scale(1.02);
          z-index: 1;
          position: relative;
        }

        /* Estilos para células com dados numéricos */
        .tiptap table td.numeric {
          text-align: right;
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
          font-weight: 600;
          color: #2d3748;
          background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
        }

        /* Estilos para células com datas */
        .tiptap table td.date {
          color: #718096;
          font-style: italic;
          font-weight: 500;
        }

        /* Estilos para células com status */
        .tiptap table td.status {
          text-align: center;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-size: 0.85rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          display: inline-block;
          min-width: 80px;
        }

        /* Estilos para células com ícones */
        .tiptap table td.with-icon {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .tiptap table td.with-icon::before {
          font-size: 1.2em;
        }

        /* Estilos para tabelas com bordas personalizadas */
        .tiptap table.bordered {
          border: 2px solid #3b82f6;
        }

        .tiptap table.bordered th {
          border-right: 1px solid rgba(255, 255, 255, 0.3);
        }

        .tiptap table.bordered td {
          border-right: 1px solid #e5e7eb;
        }

        /* Estilos para tabelas compactas */
        .tiptap table.compact th,
        .tiptap table.compact td {
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
        }

        /* Estilos para tabelas com zebra mais sutil */
        .tiptap table.zebra tr:nth-child(even) {
          background: rgba(59, 130, 246, 0.02);
        }

        /* Estilos para células com tooltip */
        .tiptap table td[title] {
          position: relative;
          cursor: help;
        }

        .tiptap table td[title]:hover::after {
          content: attr(title);
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: #1f2937;
          color: white;
          padding: 0.5rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          white-space: nowrap;
          z-index: 10;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .tiptap img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5em;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin: 1em 0;
        }

        .tiptap a {
          color: #2563eb;
          text-decoration: underline;
          transition: color 0.2s;
        }

        .tiptap a:hover {
          color: #1d4ed8;
        }

        .tiptap strong {
          font-weight: 700;
          color: #1f2937;
        }

        .tiptap em {
          font-style: italic;
          color: #4b5563;
        }

        .tiptap s {
          text-decoration: line-through;
          color: #6b7280;
        }

        .tiptap u {
          text-decoration: underline;
          color: #059669;
        }

        /* Estilos para cores e tamanhos de fonte */
        .tiptap .textStyle {
          /* Estilos para marcações de texto */
        }

        /* Estilos para texto colorido */
        .tiptap [style*="color"] {
          /* Aplica cor inline */
        }

        /* Estilos para diferentes tamanhos de fonte */
        .tiptap [style*="font-size"] {
          /* Aplica tamanho inline */
        }

        /* Estilos específicos para TextStyle com fontSize */
        .tiptap .textStyle[style*="font-size"] {
          /* Garante que o tamanho seja aplicado */
        }

        /* Classes específicas para cada tamanho de fonte */
        .tiptap .textStyle[data-font-size="12px"] { font-size: 12px !important; }
        .tiptap .textStyle[data-font-size="14px"] { font-size: 14px !important; }
        .tiptap .textStyle[data-font-size="16px"] { font-size: 16px !important; }
        .tiptap .textStyle[data-font-size="18px"] { font-size: 18px !important; }
        .tiptap .textStyle[data-font-size="20px"] { font-size: 20px !important; }
        .tiptap .textStyle[data-font-size="24px"] { font-size: 24px !important; }
        .tiptap .textStyle[data-font-size="28px"] { font-size: 28px !important; }
        .tiptap .textStyle[data-font-size="32px"] { font-size: 32px !important; }
        .tiptap .textStyle[data-font-size="36px"] { font-size: 36px !important; }
        .tiptap .textStyle[data-font-size="48px"] { font-size: 48px !important; }
      `}</style>
    </div>
  )
}


