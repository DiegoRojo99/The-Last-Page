import DOMPurify from 'dompurify';

function sanitizeHtml(html: string) {
  return { __html: DOMPurify.sanitize(html) };
}

function normalizeGoogleBooksImageUrl(url?: string | null) {
  if (!url) return '';

  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'books.google.com' && parsed.protocol === 'http:') {
      parsed.protocol = 'https:';
      return parsed.toString();
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

export { 
  sanitizeHtml,
  normalizeGoogleBooksImageUrl,
};