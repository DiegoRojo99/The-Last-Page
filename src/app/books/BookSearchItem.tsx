import Image from "next/image";
import { Book } from "../utils/types/booksAPI";

export default function BookSearchItem({ book }: { book: Book }) {
  if (!book.volumeInfo) {
    return <p>No book information available.</p>;
  }
  const bookInfo = book.volumeInfo;
  let bookDescription = bookInfo.description || "No description available.";
  if (bookDescription?.length > 100) { bookDescription = `${bookInfo.description.substring(0, 100)}...`; }
  let bookTitle = bookInfo.title;
  if(!bookTitle) return;
  if (bookTitle?.length > 60) { bookTitle = `${bookTitle.substring(0, 60)}...`; }

  return (
    <>
      {bookInfo.imageLinks?.thumbnail && (
        <Image
          src={bookInfo.imageLinks?.thumbnail}
          alt={bookTitle}
          width={64}
          height={96}
          className="object-cover w-16 h-24 rounded-md my-auto"
          loading="lazy"
        />
      )}
      <div className='ml-2'>
        <h3 className="font-bold">{bookTitle}</h3>
        <p className="text-xs">{bookDescription}</p>
        <p className="text-gray-500">{bookInfo.authors?.join(", ")}</p>
      </div>
    </>
  );
}