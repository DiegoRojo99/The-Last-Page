import { bookDB } from "@/app/utils/types/booksDB";
import Image from "next/image";

export default function BookCoverBackground({ book }: { book: bookDB | null }) {
  if (!book) {
    return <div className="h-[300px] w-full bg-gray-200 animate-pulse"></div>;
  }
  return (
    <div className="relative h-[300px] w-full">
      <Image
        src={book?.coverImage || "/default-cover.jpg"}
        alt="Cover background"
        className="h-full w-full object-cover filter blur-md brightness-75"
        width={128}
        height={193}
      />
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <Image
          src={book?.coverImage || "/default-cover.jpg"}
          alt={book?.title}
          className="w-32 h-48 object-cover rounded shadow-lg"
          width={128}
          height={193}
        />
      </div>
    </div>
  );
}