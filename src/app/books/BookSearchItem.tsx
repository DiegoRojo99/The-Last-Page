'use client';
import Image from "next/image";
import { useState } from "react";
import { Book } from "../utils/types/booksAPI";
import { FiPlus, FiCheck, FiBookOpen } from 'react-icons/fi';
import Link from "next/link";

interface BookSearchItemProps {
  book: Book;
  onSelect?: () => void;
}

export default function BookSearchItem({ book, onSelect }: BookSearchItemProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  if (!book.volumeInfo) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <p className="text-gray-500 text-center">No book information available.</p>
      </div>
    );
  }

  const bookInfo = book.volumeInfo;
  let bookDescription = bookInfo.description || "No description available.";
  if (bookDescription?.length > 200) { 
    bookDescription = `${bookDescription.substring(0, 200)}...`; 
  }
  
  let bookTitle = bookInfo.title;
  if (!bookTitle) return null;

  const handleAddToBookshelf = async () => {
    if (isAdding || isAdded) return;
    
    setIsAdding(true);
    try {
      const userBook = {
        id: book.id,
        title: bookInfo.title,
        authors: bookInfo.authors || [],
        coverImage: bookInfo.imageLinks?.thumbnail || '',
        status: 'notStarted' as const,
        totalPages: bookInfo.pageCount
      };

      const response = await fetch('/api/user/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userBook),
      });

      if (response.ok) {
        setIsAdded(true);
      } else {
        console.error('Failed to add book to bookshelf');
      }
    } catch (error) {
      console.error('Error adding book to bookshelf:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200 overflow-hidden h-full flex flex-col">
      {/* Book Cover */}
      <div className="h-80 relative bg-gray-100 flex-shrink-0">
        {bookInfo.imageLinks?.thumbnail ? (
          <Image
            src={bookInfo.imageLinks.thumbnail}
            alt={bookTitle}
            fill
            className="object-cover"
            loading="lazy"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <FiBookOpen className="text-4xl" />
          </div>
        )}
      </div>

      {/* Book Info */}
      <div className="p-3 flex-1 flex flex-col">
        <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2 leading-tight">
          {bookInfo.title}
        </h3>
        
        {bookInfo.authors && bookInfo.authors.length > 0 && (
          <p className="text-gray-600 text-xs mb-2">
            by {bookInfo.authors.join(", ")}
          </p>
        )}
        
        <p className="text-gray-500 text-xs mb-3 line-clamp-4 flex-1">
          {bookDescription}
        </p>

        {/* Book Details */}
        <div className="flex flex-wrap gap-1 mb-3 text-xs text-gray-500">
          {bookInfo.publishedDate && (
            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
              {new Date(bookInfo.publishedDate).getFullYear()}
            </span>
          )}
          {bookInfo.pageCount && (
            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
              {bookInfo.pageCount}p
            </span>
          )}
          {bookInfo.categories && bookInfo.categories.length > 0 && (
            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
              {bookInfo.categories[0]}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={handleAddToBookshelf}
            disabled={isAdding || isAdded}
            className={`flex-1 px-3 py-2 rounded-lg font-medium text-xs transition-colors ${
              isAdded
                ? 'bg-green-100 text-green-800 cursor-default'
                : isAdding
                ? 'bg-blue-100 text-blue-800 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isAdded ? (
              <>
                <FiCheck className="inline mr-1 text-xs" />
                Added
              </>
            ) : isAdding ? (
              'Adding...'
            ) : (
              <>
                <FiPlus className="inline mr-1 text-xs" />
                Add
              </>
            )}
          </button>

          <Link
            href={`/books/${book.id}`}
            className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-xs font-medium"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}