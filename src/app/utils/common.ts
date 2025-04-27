import DOMPurify from 'dompurify';

function sanitizeHtml(html: string) {
  return { __html: DOMPurify.sanitize(html) };
}

export { 
  sanitizeHtml
};