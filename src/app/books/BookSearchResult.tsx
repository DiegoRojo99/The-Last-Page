import { Book } from "../utils/types/booksAPI";
import BookSearchItem from "./BookSearchItem";
import './Books.css';

export default function BookSearchResult({ books, bookSelection }: { books: Book[], bookSelection?: (book: Book) => void }) {
  return (
    <div className='flex flex-col items-center justify-center'>
      {books.length > 0 ? (
        <ul className='flex flex-col items-center justify-center'>
          {books.map((book) => (
            <li key={book.id} className='m-2 book-search-item' onClick={() => bookSelection && bookSelection(book)}>
              <BookSearchItem book={book} />
            </li>
          ))}
        </ul>
      ) : (
        <p>No books found.</p>
      )}
    </div>
  );
}