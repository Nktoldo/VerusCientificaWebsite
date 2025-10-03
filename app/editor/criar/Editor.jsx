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

      {/* Estilos CSS específicos do editor */}
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


