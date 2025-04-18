import { Book } from "../utils/types/books";

export default function BookSearchItem({ book }: { book: Book }) {
  return (
    <div className='flex flex-col items-center justify-center'>
      <img
        src={book.volumeInfo.imageLinks.thumbnail}
        alt={book.volumeInfo.title}
        style={{ width: '50px', height: '75px' }}
      />
      <p>{book.volumeInfo.title}</p>
    </div>
  );
}