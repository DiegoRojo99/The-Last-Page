import { NextRequest, NextResponse } from 'next/server';
import { GoogleBooksApiError, googleBookDetails } from '@/lib/google-books';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });

  try {
    const bookData = await googleBookDetails(id);
    return NextResponse.json(bookData);
  } 
  catch (error) {
    if (error instanceof GoogleBooksApiError) {
      switch (error.status) {
        case 400:
          return NextResponse.json({ error: 'Bad request to Google Books API. Please check your query.' }, { status: 400 });
        case 403:
          return NextResponse.json({ error: 'Access to Google Books API is forbidden. You might have exceeded your quota.' }, { status: 403 });
        case 404:
          return NextResponse.json({ error: 'The requested book was not found in Google Books API.' }, { status: 404 });
        case 429:
          return NextResponse.json({ error: 'Google Books API quota/rate limit reached. Please wait and try again later.' }, { status: 429 });
        case 500:
          return NextResponse.json({ error: 'Google Books API is currently experiencing issues. Please try again later.' }, { status: 500 });
        case 503:
          return NextResponse.json({ error: 'Google Books API is temporarily unavailable. Please retry in a moment.' }, { status: 503 });
        default:
          return NextResponse.json({ error: error.message }, { status: error.status });
      }
    }

    console.error('Error fetching book details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch book details' },
      { status: 500 }
    );
  }
}
