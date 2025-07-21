import { Book } from "../utils/types/booksAPI";
import BookSearchItem from "./BookSearchItem";

export default function BookSearchResult({ books, bookSelection, isModal }: { books: Book[], bookSelection?: (book: Book) => void, isModal?: boolean }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
      {books.map((book) => (
        <BookSearchItem
          key={book.id}
          book={book}
          onSelect={() => bookSelection && bookSelection(book)}
          isModal={isModal}
        />
      ))}
    </div>
  );
}