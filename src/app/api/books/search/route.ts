import { NextResponse } from 'next/server';

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

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
    const response = await fetch(`${GOOGLE_BOOKS_API_URL}?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch data from Google Books API');
    }

    const data = await response.json();
    return NextResponse.json(data.items || []);
  } 
  catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}