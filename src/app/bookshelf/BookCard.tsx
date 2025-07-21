'use client';

import React from "react";
import { userBook } from "../utils/types/booksDB";
import Image from "next/image";
import Link from "next/link";
import { FiEye } from "react-icons/fi";
import QuickSessionAdd from "../components/QuickSessionAdd";

interface BookCardProps {
  book: userBook
}

export function BookCard({ book }: BookCardProps) {
  const progressPercentage = book.totalPages && book.currentPage 
    ? Math.min((book.currentPage / book.totalPages) * 100, 100)
    : 0;

  const handleSessionAdded = () => {
    // In a real app, you might want to refetch the book data here
    // For now, we'll rely on the parent component to refresh
  };

  return (
    <div className="flex flex-col items-center w-fit h-fit group">
      {/* Cover Image */}
      <Link href={`/bookshelf/${book.id}`} className="relative">
        {book.coverImage ? (
          <Image
            src={book.coverImage} 
            alt={book.title} 
            className="border rounded-lg object-cover w-[128px] h-[193px] group-hover:shadow-md transition-shadow"
            width={128}
            height={193}
            loading="lazy"
          />
        ) : (
          <div className="w-[128px] h-[193px] flex items-center justify-center bg-gray-200 text-gray-500 text-sm rounded-lg group-hover:shadow-md transition-shadow">
            No Cover
          </div>
        )}
        
        {/* Progress overlay for reading books */}
        {book.status === 'reading' && book.totalPages && book.currentPage && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 rounded-b-lg">
            <div className="flex justify-between items-center mb-1">
              <span>{book.currentPage}/{book.totalPages}</span>
              <span>{progressPercentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-1">
              <div 
                className="bg-blue-400 h-1 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </Link>

      {/* Book Info */}
      <div className="p-1 w-[128px]">
        <h3 className="text-sm font-semibold line-clamp-1">{book.title}</h3>
        {book.authors.length > 0 && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-1">
            {book.authors.join(', ')}
          </p>
        )}
        
        {/* Status Badge */}
        <div className="flex items-center justify-between mt-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            book.status === 'completed' ? 'bg-green-100 text-green-800' :
            book.status === 'reading' ? 'bg-blue-100 text-blue-800' :
            book.status === 'abandoned' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {book.status === 'notStarted' ? 'To Read' : 
             book.status.charAt(0).toUpperCase() + book.status.slice(1)}
          </span>
          
          {/* Book Details Link */}
          <Link
            href={`/books/${book.id}`}
            className="text-gray-400 hover:text-blue-600 transition-colors p-1"
            title="View book details"
          >
            <FiEye className="text-sm" />
          </Link>
        </div>
        
        {/* Actions for reading books */}
        {book.status === 'reading' && (
          <div className="flex w-full gap-1 mt-1">
            <QuickSessionAdd bookId={book.id} onSessionAdded={handleSessionAdded} />
          </div>
        )}
      </div>
    </div>
  );
}