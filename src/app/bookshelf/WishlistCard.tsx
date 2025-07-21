'use client';

import React from "react";
import { wishlistBook } from "../utils/types/booksDB";
import Image from "next/image";
import Link from "next/link";
import { FiEye, FiPlus } from "react-icons/fi";
import WishlistAction from "../components/WishlistAction";
import { auth } from "@/lib/firebase";

interface WishlistCardProps {
  book: wishlistBook;
  onRemoved?: () => void;
  onMoveToLibrary?: () => void;
}

export function WishlistCard({ book, onRemoved, onMoveToLibrary }: WishlistCardProps) {
  const handleMoveToLibrary = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/user/wishlist/${book.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        onMoveToLibrary?.();
      } else {
        const error = await response.json();
        console.error('Error moving book to library:', error);
      }
    } catch (error) {
      console.error('Error moving book to library:', error);
    }
  };

  const formatDate = (timestamp: unknown) => {
    if (!timestamp) return '';
    
    let date: Date;
    if (typeof timestamp === 'object' && timestamp !== null && '_seconds' in timestamp) {
      date = new Date((timestamp as { _seconds: number })._seconds * 1000);
    } else if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp) {
      date = (timestamp as { toDate: () => Date }).toDate();
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      return '';
    }
    
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col items-center w-fit h-fit group">
      {/* Cover Image */}
      <div className="relative">
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
        
        {/* Wishlist overlay */}
        <div className="absolute top-2 right-2">
          <WishlistAction
            bookId={book.id}
            title={book.title}
            authors={book.authors}
            coverImage={book.coverImage}
            isInWishlist={true}
            onWishlistChange={onRemoved}
            className="bg-white/90 backdrop-blur-sm shadow-sm"
          />
        </div>
      </div>

      {/* Book Info */}
      <div className="p-1 w-[128px]">
        <h3 className="text-sm font-semibold line-clamp-1">{book.title}</h3>
        {book.authors.length > 0 && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-1">
            {book.authors.join(', ')}
          </p>
        )}
        
        <p className="text-xs text-gray-500 mt-1">
          Added {formatDate(book.addedAt)}
        </p>
        
        {/* Actions */}
        <div className="flex items-center justify-between mt-2 gap-1">
          <button
            onClick={handleMoveToLibrary}
            className="flex-1 bg-gray-800 text-white text-xs px-2 py-1 rounded hover:bg-gray-500 transition-colors flex items-center justify-center gap-1"
            title="Add to library"
          >
            <FiPlus className="text-xs" />
            Add
          </button>
          
          <Link
            href={`/books/${book.id}`}
            className="text-gray-500 hover:text-gray-800 transition-colors p-1"
            title="View book details"
          >
            <FiEye className="text-sm" />
          </Link>
        </div>
      </div>
    </div>
  );
}
