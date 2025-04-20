import { Book } from "../utils/types/books";
import BookSearchItem from "./BookSearchItem";
import './Books.css';

export default function BookSearchResult({ books }: { books: Book[] }) {
  return (
    <div className='flex flex-col items-center justify-center'>
      {books.length > 0 ? (
        <ul className='flex flex-col items-center justify-center'>
          {books.map((book) => (
            <li key={book.id} className='m-2 book-search-item'>
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