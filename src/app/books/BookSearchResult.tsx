import { Book } from "../utils/types/booksAPI";
import BookSearchItem from "./BookSearchItem";

export default function BookSearchResult({ books, bookSelection, isModal }: { books: Book[], bookSelection?: (book: Book) => void, isModal?: boolean }) {
  return (
    <div className={ !isModal ? 
      "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6" : 
      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
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