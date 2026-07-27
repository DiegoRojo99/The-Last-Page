import { NextRequest, NextResponse } from 'next/server';
import { GoogleBooksApiError, googleBookDetails } from '@/lib/google-books';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });
  }

  try {
    const bookData = await googleBookDetails(id);
    return NextResponse.json(bookData);
  } catch (error) {
    if (error instanceof GoogleBooksApiError) {
      if (error.status === 404) {
        return NextResponse.json({ error: 'Book not found' }, { status: 404 });
      }

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

    console.error('Error fetching book details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch book details' },
      { status: 500 }
    );
  }
}
