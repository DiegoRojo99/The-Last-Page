import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes/${id}`,
      {
        headers: {
          'User-Agent': 'BookTracker/1.0',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Book not found' }, { status: 404 });
      }
      throw new Error(`Google Books API error: ${response.status}`);
    }

    const bookData = await response.json();
    return NextResponse.json(bookData);
  } catch (error) {
    console.error('Error fetching book details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch book details' },
      { status: 500 }
    );
  }
}
