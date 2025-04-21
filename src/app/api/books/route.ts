import { NextResponse } from 'next/server';

const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const bookId = searchParams.get('id');

  if (!bookId) {
    return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });
  }

  try {
    const response = await fetch(`${GOOGLE_BOOKS_API_URL}/${bookId}`);
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch book details' }, { status: response.status });
    }

    const bookDetails = await response.json();
    return NextResponse.json(bookDetails);
  } catch (error) {
    return NextResponse.json({ error: 'An error occurred while fetching book details' }, { status: 500 });
  }
}