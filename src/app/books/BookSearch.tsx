'use client';
import React, { useState } from 'react';
import { Book } from '../utils/types/booksAPI';
import BookSearchBar from './BookSearchBar';
import BookSearchResult from './BookSearchResult';

interface BookSearchProps {
  bookSelection?: (book: Book) => void;
}

const BookSearch: React.FC<BookSearchProps> = ({ bookSelection }) => {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setBooks(data);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError('Failed to fetch books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col items-center justify-center'>
      <BookSearchBar searchValue={query} setSearchValue={setQuery} handleSearch={handleSearch} />
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {books.length === 0 ? (
        <p>No books found.</p>
      ) : (
        <div className='flex flex-col items-center justify-center'>
          <BookSearchResult books={books} bookSelection={bookSelection} />
        </div>
      )}
    </div>
  );
};

export default BookSearch;