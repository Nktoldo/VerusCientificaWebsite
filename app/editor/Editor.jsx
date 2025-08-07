'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Image from '@tiptap/extension-image'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Heading from '@tiptap/extension-heading'
import Paragraph from '@tiptap/extension-paragraph'
import { v4 as uuidv4 } from 'uuid'
import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase.mjs';
import { ref, onValue } from 'firebase/database';

const CustomTextStyle = TextStyle.extend({
  addAttributes() {
    return {
      fontSize: {
        default: null,
        parseHTML: el => el.style.fontSize,
        renderHTML: attrs =>
          attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
      },
      fontStyle: {
        default: null,
        parseHTML: el => el.style.fontStyle,
        renderHTML: attrs =>
          attrs.fontStyle ? { style: `font-style: ${attrs.fontStyle}` } : {},
      },
      fontWeight: {
        default: null,
        parseHTML: el => el.style.fontWeight,
        renderHTML: attrs =>
          attrs.fontWeight ? { style: `font-weight: ${attrs.fontWeight}` } : {},
      },
    }
  },
})

const CustomImage = Image.extend({
  selectable: true,
  draggable: true,
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: 'width: 300px; height: auto;',
        parseHTML: el => el.getAttribute('style'),
        renderHTML: attrs => ({
          style: attrs.style,
        }),
      },
    }
  },
})

const Reference = Paragraph => Paragraph.extend({
  name: 'reference',
  addAttributes() {
    return {
      class: {
        default: 'reference',
      },
    };
  },
  renderHTML({ HTMLAttributes }) {
    return ['p', { ...HTMLAttributes, class: 'reference' }, 0];
  },
});

export default function Editor({ content = '', onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Heading.configure({ levels: [1, 2, 3] }),
      Placeholder.configure({
        placeholder: 'Digite aqui...',
        includeChildren: true,
        emptyEditorClass: 'is-editor-empty',
      }),
      CustomTextStyle,
      Color,
      CustomImage,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Reference(Paragraph),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      handlePaste(view, event) {
        const items = Array.from(event.clipboardData?.items || []);
        for (const item of items) {
          if (item.type.indexOf('image') !== -1) {
            const file = item.getAsFile();
            const reader = new FileReader();
            reader.onload = () => {
              const src = reader.result;
              editor.chain().focus().setImage({
                src,
                style: 'width: 300px; height: auto;',
              }).run();
            };
            reader.readAsDataURL(file);
            event.preventDefault();
            return true;
          }
        }
        return false;
      },
    },
  })

  

  return (
    <div className="border p-4 rounded bg-white text-black">
      {/* Menu */}
      
      <div className="flex flex-wrap gap-2 mb-4">
        <select
          className="border rounded p-1"
          onChange={e => {
            const value = e.target.value;
            if (value === 'paragraph') editor.chain().focus().setParagraph().run();
            if (value === 'h1') editor.chain().focus().toggleHeading({ level: 1 }).run();
            if (value === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run();
            if (value === 'h3') editor.chain().focus().toggleHeading({ level: 3 }).run();
            if (value === 'reference') editor.chain().focus().setNode('reference').run();
          }}
        >
          <option value="">Tipo de Texto</option>
          <option value="paragraph">Texto</option>
          <option value="h1">Título 1</option>
          <option value="h2">Título 2</option>
          <option value="h3">Subtítulo</option>
          <option value="reference">Referência</option>
        </select>
        <button onClick={() => editor.chain().focus().toggleBold().run()}><b>B</b></button>
        <button onClick={() => {
          const current = editor.getAttributes('textStyle').fontStyle;
          const next = current === 'italic' ? 'normal' : 'italic';
          editor.chain().focus().setMark('textStyle', { fontStyle: next }).run();
        }}><i>I</i></button>
        <select
          onChange={(e) => {
            const value = e.target.value;
            editor.chain().focus().setMark('textStyle', { fontSize: `${value}px` }).run();
          }}
        >
          <option value="">Tamanho</option>
          <option value="14">14px</option>
          <option value="16">16px</option>
          <option value="20">20px</option>
          <option value="24">24px</option>
          <option value="28">28px</option>
        </select>
        <input
          type="color"
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          title="Cor da fonte"
        />
        {/* <button onClick={() => {
          const url = prompt('URL da imagem:');
          if (url) {
            editor.chain().focus().setImage({
              src: url,
              style: 'width: 60%; height: auto;',
            }).run();
          }
        }}>🖼️</button>
        <label className="cursor-pointer">
          <span role="img" aria-label="upload">📁</span>
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = () => {
                  const src = reader.result;
                  editor.chain().focus().setImage({
                    src,
                    style: 'width: 60%; height: auto;',
                  }).run();
                };
                reader.readAsDataURL(file);
              }
              e.target.value = '';
            }}
          />
        </label> */}
        <button onClick={() => {
          let cols = parseInt(prompt('Quantas colunas? (mínimo 1)', '2') || '2', 10);
          if (isNaN(cols) || cols < 1) cols = 2;
          editor.chain().focus().insertTable({ rows: 2, cols, withHeaderRow: true }).run();
        }}>
          📊
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} className="tiptap w-full min-h-[200px]" />

      <style jsx global>{`
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #999;
          font-style: italic;
          pointer-events: none;
          height: 0;
        }

        .tiptap table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
          margin-bottom: 1rem;
        }

        .tiptap th, .tiptap td {
          border: 1px solid #ccc;
          padding: 8px;
        }

        .tiptap thead {
          background-color: #f0f0f0;
        }

        .tiptap h1 {
          font-size: 2em;
          color: #38bdf8;
        }

        .tiptap h2 {
          font-size: 1.5em;
          color: #0ea5e9;
        }

        .tiptap h3 {
          font-size: 1.2em;
          color: #7dd3fc;
          font-weight: 600;
        }

        .tiptap .reference {
          font-size: 0.95em;
          color: #60a5fa;
          font-style: italic;
          border-left: 3px solid #60a5fa;
          padding-left: 0.75em;
          margin-top: 0.5em;
        }
      `}</style>
    </div>
  )
}

export async function processDescriptionImages(html, productId) {
  const imgRegex = /<img[^>]+src=["'](data:image\/[^"']+)["'][^>]*>/g;
  let match;
  let newHtml = html;
  const promises = [];

  while ((match = imgRegex.exec(html)) !== null) {
    const base64 = match[1];
    const res = await fetch(base64);
    const blob = await res.blob();
    const uuid = uuidv4();
    const file = new File([blob], `${productId}-${uuid}.png`, { type: blob.type });
    const uploadPromise = uploadProductImage(file, `descricao/${productId}-${uuid}`).then(url => {
      newHtml = newHtml.replace(base64, url);
    });
    promises.push(uploadPromise);
  }

  await Promise.all(promises);
  return newHtml;
}
