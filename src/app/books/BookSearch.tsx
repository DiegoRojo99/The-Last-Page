'use client';
import React, { useState } from 'react';
import { Book } from '../utils/types/books';
import BookSearchBar from './BookSearchBar';

const BookSearch: React.FC = () => {
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
      setError('Failed to fetch books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex flex-col items-center justify-center p-4'>
      <BookSearchBar searchValue={query} setSearchValue={setQuery} handleSearch={handleSearch} />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className='flex flex-col items-center justify-center'>
        {books.length > 0 ? (
          <ul className='flex flex-row items-center justify-center'>
            {books.map((book) => (
              <li key={book.id}>
                <img src={book.volumeInfo.imageLinks.thumbnail} alt={book.volumeInfo.title} style={{ width: '50px', height: '75px' }} />
                <p>{book.volumeInfo.title}</p>
              </li>
            ))}
          </ul>
        ) : (
          !loading && <p>No books found.</p>
        )}
      </div>
    </div>
  );
};

export default BookSearch;