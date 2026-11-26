import DOMPurify from 'dompurify';

const ALLOWED_TAGS = [
  'p', 'br', 'hr', 'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup', 'mark',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre', 'code',
  'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'colgroup', 'col',
  'div', 'span', 'a', 'img', 'figure', 'figcaption'
];

const ALLOWED_ATTR = ['href', 'target', 'rel', 'src', 'alt', 'title', 'width', 'height', 'colspan', 'rowspan', 'class', 'style'];

let hookRegistrado = false;

// limpa o HTML das descrições antes de exibir (só roda no navegador, onde as descrições são carregadas)
export function sanitizeHtml(html: string): string {
  if (!html || typeof window === 'undefined') return '';

  if (!hookRegistrado) {
    // links que abrem em nova aba não dão acesso à página de origem
    DOMPurify.addHook('afterSanitizeAttributes', node => {
      if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
        node.setAttribute('rel', 'noopener noreferrer');
      }
    });
    hookRegistrado = true;
  }

  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
}
