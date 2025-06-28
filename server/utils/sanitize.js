import sanitizeHtml from 'sanitize-html';

const sanitizeOptions = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'br', 'ul', 'ol', 'li',
    'b', 'i', 'strong', 'em',
    'a', 'pre', 'code', 'span'
  ],
  allowedAttributes: {
    'a': ['href', 'target'],
    'span': ['style'],
    '*': ['class']
  },
  allowedStyles: {
    '*': {
      'color': [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/],
      'text-align': [/^left$/, /^right$/, /^center$/],
      'font-size': [/^\d+(?:px|em|%)$/]
    }
  }
};

export const sanitizeContent = (content) => {
  if (!content) return '';
  return sanitizeHtml(content, sanitizeOptions);
};

export const stripHtml = (html) => {
  if (!html) return '';
  return sanitizeHtml(html, { allowedTags: [] });
};
