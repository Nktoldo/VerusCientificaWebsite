// utilitário para sanitização de HTML
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  // lista de tags permitidas
  const allowedTags = [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'span'
  ];
  
  // lista de atributos permitidos
  const allowedAttributes = ['class', 'style'];
  
  // remove scripts e eventos perigosos
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '');
  
  // remove tags não permitidas
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^<>]*>/g;
  sanitized = sanitized.replace(tagRegex, (match, tagName) => {
    const lowerTagName = tagName.toLowerCase();
    if (allowedTags.includes(lowerTagName)) {
      return match;
    }
    return '';
  });
  
  return sanitized;
}

// valida se o HTML é seguro
export function isHtmlSafe(html: string): boolean {
  if (!html) return true;
  
  const dangerousPatterns = [
    /<script\b/i,
    /<iframe\b/i,
    /on\w+\s*=/i,
    /javascript:/i,
    /vbscript:/i,
    /data:text\/html/i
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(html));
}
