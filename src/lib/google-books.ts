const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

export class GoogleBooksApiError extends Error {
  status: number;
  retryAfterSeconds?: number;

  constructor(message: string, status: number, retryAfterSeconds?: number) {
    super(message);
    this.name = 'GoogleBooksApiError';
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

function getApiKey() {
  return process.env.GOOGLE_BOOKS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
}

function toRetryAfterSeconds(value: string | null) {
  if (!value) return undefined;

  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric >= 0) return numeric;

  const dateMs = Date.parse(value);
  if (Number.isNaN(dateMs)) return undefined;

  const diffSeconds = Math.ceil((dateMs - Date.now()) / 1000);
  return diffSeconds > 0 ? diffSeconds : 0;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, init?: RequestInit) {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await fetch(url, init);

    if (response.ok) {
      return response;
    }

    const retryAfterSeconds = toRetryAfterSeconds(response.headers.get('retry-after'));
    const isRetryable = response.status === 429 || response.status >= 500;

    if (!isRetryable || attempt === maxAttempts) {
      throw new GoogleBooksApiError(
        `Google Books API error: ${response.status}`,
        response.status,
        retryAfterSeconds,
      );
    }

    const fallbackDelayMs = 250 * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 120);
    const waitMs = retryAfterSeconds ? retryAfterSeconds * 1000 : fallbackDelayMs;
    await delay(waitMs);
  }

  throw new GoogleBooksApiError('Google Books API request failed', 500);
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

export async function googleBooksSearch(query: string) {
  const url = new URL(GOOGLE_BOOKS_API_URL);
  const normalizedQuery = normalizeSearchQuery(query);
  url.searchParams.set('q', normalizedQuery);
  url.searchParams.set('printType', 'books');
  url.searchParams.set('maxResults', '20');
  appendKey(url);

  const response = await fetchWithRetry(url.toString(), {
    headers: { 'User-Agent': 'TheLastPage/2.0', },
    next: { revalidate: 60 },
  });

  const data = await response.json();

  // Retry with a generic text query when an explicit ISBN search comes back empty.
  if (normalizedQuery.startsWith('isbn:') && (!data.items || data.items.length === 0)) {
    const fallbackUrl = new URL(GOOGLE_BOOKS_API_URL);
    fallbackUrl.searchParams.set('q', query.trim());
    fallbackUrl.searchParams.set('printType', 'books');
    fallbackUrl.searchParams.set('maxResults', '20');
    appendKey(fallbackUrl);

    const fallbackResponse = await fetchWithRetry(fallbackUrl.toString(), {
      headers: { 'User-Agent': 'TheLastPage/2.0', },
      next: { revalidate: 60 },
    });

    return fallbackResponse.json();
  }

  return data;
}

export async function googleBookDetails(id: string) {
  const url = new URL(`${GOOGLE_BOOKS_API_URL}/${id}`);
  appendKey(url);

  const response = await fetchWithRetry(url.toString(), {
    headers: { 'User-Agent': 'TheLastPage/2.0', },
    next: { revalidate: 300 },
  });

  return response.json();
}
