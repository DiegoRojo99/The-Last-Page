const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

export class GoogleBooksApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'GoogleBooksApiError';
    this.status = status;
  }
}

function getApiKey() {
  return process.env.GOOGLE_BOOKS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
}

async function fetchGoogleBooks(url: string, init?: RequestInit) {
  const response = await fetch(url, init);

  if (response.ok) return response;

  throw new GoogleBooksApiError(`Google Books API error: ${response.status}`, response.status);
}

function appendKey(url: URL) {
  const key = getApiKey();
  if (key) url.searchParams.set('key', key);
}

function normalizeSearchQuery(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return trimmed;

  const isbnPrefixed = /^isbn(?:-1[03])?\s*[:\s]\s*(.+)$/i.exec(trimmed);
  if (isbnPrefixed) {
    const candidate = isbnPrefixed[1].replace(/[\s-]/g, '').toUpperCase();
    return `isbn:${candidate}`;
  }

  const isbnCandidate = trimmed.replace(/[\s-]/g, '').toUpperCase();
  const isIsbn10 = /^\d{9}[\dX]$/.test(isbnCandidate);
  const isIsbn13 = /^\d{13}$/.test(isbnCandidate);

  if (isIsbn10 || isIsbn13) {
    return `isbn:${isbnCandidate}`;
  }

  return trimmed;
}

function broadSearchQuery(query: string) {
  const trimmed = query.trim();
  const cleaned = trimmed
    .replace(/[“”"']/g, '')
    .replace(/[\u2013\u2014:;,.!?()[\]{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) {
    return trimmed;
  }

  const titlePart = cleaned.split(/\s+by\s+/i)[0].trim();
  return titlePart || cleaned;
}

export async function googleBooksSearch(query: string) {
  const url = new URL(GOOGLE_BOOKS_API_URL);
  const normalizedQuery = normalizeSearchQuery(query);
  const searchQuery = normalizedQuery.startsWith('isbn:') ? normalizedQuery : broadSearchQuery(normalizedQuery);
  url.searchParams.set('q', searchQuery);
  url.searchParams.set('printType', 'books');
  url.searchParams.set('maxResults', '20');
  appendKey(url);

  const response = await fetchGoogleBooks(url.toString(), {
    headers: { 'User-Agent': 'TheLastPage/2.0', },
    next: { revalidate: 60 },
  });

  return response.json();
}

export async function googleBookDetails(id: string) {
  const url = new URL(`${GOOGLE_BOOKS_API_URL}/${id}`);
  appendKey(url);

  const response = await fetchGoogleBooks(url.toString(), {
    headers: { 'User-Agent': 'TheLastPage/2.0', },
    next: { revalidate: 300 },
  });

  return response.json();
}
