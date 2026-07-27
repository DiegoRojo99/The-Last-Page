import { NextResponse } from 'next/server';
import { GoogleBooksApiError, googleBooksSearch } from '@/lib/google-books';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required' },
      { status: 400 }
    );
  }

  try {
    const data = await googleBooksSearch(query);
    return NextResponse.json(data.items || []);
  }
  catch (error) {
    if (error instanceof GoogleBooksApiError) {
      if (error.status === 429) {
        return NextResponse.json(
          {
            error: 'Google Books API quota/rate limit reached. Please wait and try again later.',
            retryAfterSeconds: error.retryAfterSeconds,
          },
          { status: 429 }
        );
      }

      if (error.status >= 500) {
        return NextResponse.json(
          {
            error: 'Google Books is temporarily unavailable. Please retry in a moment.',
            retryAfterSeconds: error.retryAfterSeconds,
          },
          { status: 503 }
        );
      }
    }

    console.error('Error fetching books:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}