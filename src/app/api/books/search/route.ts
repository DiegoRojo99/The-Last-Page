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
      let errorMessage = 'An error occurred while fetching data from Google Books API.';
      switch (error.status) {
        case 400:
          errorMessage = 'Bad request to Google Books API. Please check your query.';
          return NextResponse.json({ error: errorMessage }, { status: 400 });
        case 403:
          errorMessage = 'Access to Google Books API is forbidden. You might have exceeded your quota.';
          return NextResponse.json({ error: errorMessage }, { status: 403 });
        case 404:
          errorMessage = 'The requested book was not found in Google Books API.';
          return NextResponse.json({ error: errorMessage }, { status: 404 });
        case 429:
          errorMessage = 'Google Books API quota/rate limit reached. Please wait and try again later.';
          return NextResponse.json({ error: errorMessage }, { status: 429 });
        case 500:
          errorMessage = 'Google Books API is currently experiencing issues. Please try again later.';
          return NextResponse.json({ error: errorMessage }, { status: 500 });
        case 503:
          errorMessage = 'Google Books API is temporarily unavailable. Please retry in a moment.';
          return NextResponse.json({ error: errorMessage }, { status: 503 });
        default:
          return NextResponse.json({ error: error.message }, { status: error.status });
      }
    }
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}