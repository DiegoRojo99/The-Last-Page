import { Book } from "../utils/types/booksAPI";
import BookSearchItem from "./BookSearchItem";

export default function BookSearchResult({ books, bookSelection, isModal, viewMode = 'grid' }: { books: Book[], bookSelection?: (book: Book) => void | Promise<void>, isModal?: boolean, viewMode?: 'grid' | 'list' }) {
  const containerClass = isModal
    ? "grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4"
    : viewMode === 'list'
      ? "grid grid-cols-1 gap-4"
      : "grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

  return (
    <div className={containerClass}>
      {books.map((book) => (
        <BookSearchItem
          key={book.id}
          book={book}
          onSelect={bookSelection ? () => bookSelection(book) : undefined}
          isModal={isModal}
          viewMode={viewMode}
        />
      ))}
    </div>
  );
}