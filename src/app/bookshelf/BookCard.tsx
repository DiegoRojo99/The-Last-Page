'use client';

import React from "react";
import { userBook } from "../utils/types/booksDB";

interface BookCardProps {
  book: userBook
}

export function BookCard({ book }: BookCardProps) {
  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 bg-white">
      {/* Cover Image */}
      {book.coverImage ? (
        <img 
          src={book.coverImage} 
          alt={book.title} 
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 flex items-center justify-center bg-gray-200 text-gray-500 text-sm">
          No Cover
        </div>
      )}

      {/* Book Info */}
      <div className="p-3">
        <h3 className="text-md font-semibold line-clamp-2">{book.title}</h3>
        {book.authors.length > 0 && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-1">
            {book.authors.join(', ')}
          </p>
        )}
      </div>
    </div>
  );
}