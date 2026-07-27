'use client';
import React, { useMemo, useState } from 'react';
import { FiGrid, FiList, FiSearch, FiSliders } from 'react-icons/fi';
import { Book } from '../utils/types/booksAPI';
import BookSearchBar from './BookSearchBar';
import BookSearchResult from './BookSearchResult';
import { Button, EmptyState, Skeleton } from '../components/ui';

interface BookSearchProps {
  bookSelection?: (book: Book) => void | Promise<void>;
  isModal?: boolean;
}

const BookSearch: React.FC<BookSearchProps> = ({ bookSelection, isModal = false }) => {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'title-asc' | 'title-desc' | 'year-desc' | 'year-asc'>('relevance');

  const languages = useMemo(() => {
    const values = new Set<string>();
    books.forEach((book) => {
      const language = book.volumeInfo?.language?.trim().toLowerCase();
      if (language) values.add(language);
    });
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [books]);

  const categories = useMemo(() => {
    const values = new Set<string>();
    books.forEach((book) => {
      (book.volumeInfo?.categories || []).forEach((category) => {
        const cleanCategory = category.trim();
        if (cleanCategory) values.add(cleanCategory);
      });
    });
    return Array.from(values).sort((a, b) => a.localeCompare(b));
  }, [books]);

  const filteredBooks = useMemo(() => {
    const byFilter = books.filter((book) => {
      const language = book.volumeInfo?.language?.trim().toLowerCase();
      const matchesLanguage = languageFilter === 'all' || language === languageFilter;

      const categoryList = book.volumeInfo?.categories || [];
      const matchesCategory = categoryFilter === 'all' || categoryList.includes(categoryFilter);

      return matchesLanguage && matchesCategory;
    });

    if (sortBy === 'relevance') return byFilter;

    const sorted = [...byFilter];
    if (sortBy === 'title-asc') {
      sorted.sort((a, b) => (a.volumeInfo?.title || '').localeCompare(b.volumeInfo?.title || ''));
    } else if (sortBy === 'title-desc') {
      sorted.sort((a, b) => (b.volumeInfo?.title || '').localeCompare(a.volumeInfo?.title || ''));
    } else if (sortBy === 'year-desc' || sortBy === 'year-asc') {
      sorted.sort((a, b) => {
        const yearA = Number((a.volumeInfo?.publishedDate || '').slice(0, 4)) || 0;
        const yearB = Number((b.volumeInfo?.publishedDate || '').slice(0, 4)) || 0;
        return sortBy === 'year-desc' ? yearB - yearA : yearA - yearB;
      });
    }

    return sorted;
  }, [books, categoryFilter, languageFilter, sortBy]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setHasSearched(true);
    try {
      const response = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { error?: string } | null;
        const apiMessage = body?.error;
        if (response.status === 503) throw new Error('Google Books is temporarily unavailable right now. Please retry in a moment.');
        if (response.status === 429) throw new Error('Google Books quota/rate limit is currently exhausted. Please try again later.');
        throw new Error(apiMessage || 'Search request failed. Please try again.');
      }
      const data = await response.json();
      setBooks(data);
    } catch (err) {
      console.error('Error fetching books:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setBooks([]);
    setError('');
    setHasSearched(false);
    setLanguageFilter('all');
    setCategoryFilter('all');
    setSortBy('relevance');
  };

  const showToggle = !isModal && filteredBooks.length > 0 && !loading;

  return (
    <div className={isModal ? 'w-full' : 'page-stack'}>
      <BookSearchBar
        searchValue={query}
        setSearchValue={setQuery}
        handleSearch={handleSearch}
        onClear={handleClear}
        isModal={isModal}
      />

      {showToggle ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--neutral-600)]">Search Results ({filteredBooks.length} / {books.length})</p>
          <div className="inline-flex gap-2 rounded-[var(--radius-pill)] border border-[var(--neutral-200)] bg-white p-1">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              onClick={() => setViewMode('grid')}
              className="h-8 px-3 text-xs"
            >
              <FiGrid />
              Grid
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              onClick={() => setViewMode('list')}
              className="h-8 px-3 text-xs"
            >
              <FiList />
              List
            </Button>
          </div>
        </div>
      ) : null}

      {!isModal && books.length > 0 && !loading ? (
        <div className="surface-paper flex flex-wrap items-center gap-2 p-3">
          <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-[var(--neutral-500)]">
            <FiSliders />
            Search Controls
          </span>

          <select
            value={languageFilter}
            onChange={(event) => setLanguageFilter(event.target.value)}
            className="h-9 rounded-[var(--radius-md)] border border-[var(--neutral-300)] bg-white px-3 text-sm text-[var(--neutral-700)]"
          >
            <option value="all">All languages</option>
            {languages.map((language) => (
              <option key={language} value={language}>{language.toUpperCase()}</option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="h-9 rounded-[var(--radius-md)] border border-[var(--neutral-300)] bg-white px-3 text-sm text-[var(--neutral-700)]"
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as 'relevance' | 'title-asc' | 'title-desc' | 'year-desc' | 'year-asc')}
            className="h-9 rounded-[var(--radius-md)] border border-[var(--neutral-300)] bg-white px-3 text-sm text-[var(--neutral-700)]"
          >
            <option value="relevance">Sort: Relevance</option>
            <option value="title-asc">Sort: Title A-Z</option>
            <option value="title-desc">Sort: Title Z-A</option>
            <option value="year-desc">Sort: Newest</option>
            <option value="year-asc">Sort: Oldest</option>
          </select>
        </div>
      ) : null}
      
      {loading && (
        <div className={viewMode === 'list' ? 'space-y-4' : 'grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'}>
          {Array.from({ length: viewMode === 'list' ? 4 : 10 }).map((_, i) => (
            <div
              key={`search-skeleton-${i}`}
              className={viewMode === 'list' ? 'surface-paper flex gap-4 p-4' : 'surface-paper p-3'}
            >
              <Skeleton className={viewMode === 'list' ? 'h-40 w-28 shrink-0 rounded-[var(--radius-md)]' : 'h-56 w-full rounded-[var(--radius-md)]'} />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}
      
      {error && (
        <div className="rounded-[var(--radius-md)] border border-[#ffd9ce] bg-[#fff0ec] px-4 py-3 text-sm text-[var(--color-danger)]">
          {error}
        </div>
      )}
      
      {!loading && !error && hasSearched && books.length === 0 && (
        <EmptyState
          title={`No books found for "${query}"`}
          description="Try title-only searches, an author surname, or a clean ISBN without extra text."
          icon={<FiSearch className="text-3xl" />}
          action={<Button variant="secondary" onClick={handleClear}>Clear Search</Button>}
        />
      )}

      {!loading && !error && hasSearched && books.length > 0 && filteredBooks.length === 0 && (
        <EmptyState
          title="No matches for the selected filters"
          description="Try a different language/category filter or switch sort mode."
          icon={<FiSliders className="text-3xl" />}
          action={<Button variant="secondary" onClick={() => { setLanguageFilter('all'); setCategoryFilter('all'); }}>Reset Filters</Button>}
        />
      )}
      
      {!loading && filteredBooks.length > 0 && (
        <div className={isModal ? 'mt-6' : 'mt-8'}>
          <BookSearchResult books={filteredBooks} bookSelection={bookSelection} isModal={isModal} viewMode={viewMode} />
        </div>
      )}
    </div>
  );
};

export default BookSearch;