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
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setHasSearched(true);
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
    <div className='max-w-6xl mx-auto px-4 py-8'>
      <BookSearchBar searchValue={query} setSearchValue={setQuery} handleSearch={handleSearch} />
      
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-6">
          {error}
        </div>
      )}
      
      {!loading && !error && hasSearched && books.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No books found for "{query}"</p>
          <p className="text-gray-400 mt-2">Try adjusting your search terms</p>
        </div>
      )}
      
      {!loading && books.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              Search Results ({books.length})
            </h2>
          </div>
          <BookSearchResult books={books} bookSelection={bookSelection} />
        </div>
      )}
    </div>
  );
};

export default BookSearch;