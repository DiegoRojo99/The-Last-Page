'use client';

import React from "react";
import { userBook } from "../utils/types/booksDB";
import Image from "next/image";

interface BookCardProps {
  book: userBook
}

export function BookCard({ book }: BookCardProps) {
  return (
    <div className="border rounded-lg flex flex-col items-center w-[128px] h-[193px]">
      {/* Cover Image */}
      {book.coverImage ? (
        <Image
          src={book.coverImage} 
          alt={book.title} 
          className="object-cover w-[128px] h-[193px] rounded-lg"
          width={128}
          height={193}
          loading="lazy"
        />
      ) : (
        <div className="w-full h-48 flex items-center justify-center bg-gray-200 text-gray-500 text-sm">
          No Cover
        </div>
      )}

      {/* Book Info */}
      <div className="p-1">
        <h3 className="text-sm font-semibold line-clamp-1">{book.title}</h3>
        {book.authors.length > 0 && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-1">
            {book.authors.join(', ')}
          </p>
        )}
      </div>
    </div>
  );
}