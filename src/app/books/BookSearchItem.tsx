'use client';
import Image from "next/image";
import { useState } from "react";
import { Book } from "../utils/types/booksAPI";
import { FiPlus, FiCheck, FiBookOpen, FiArrowRight } from 'react-icons/fi';
import Link from "next/link";
import { auth } from "@/lib/firebase";
import WishlistAction from "../components/WishlistAction";
import { Badge, Button } from "../components/ui";

interface BookSearchItemProps {
  book: Book;
  onSelect?: () => void | Promise<void>;
  isModal?: boolean;
  viewMode?: 'grid' | 'list';
}

export default function BookSearchItem({ book, onSelect, isModal = false, viewMode = 'grid' }: BookSearchItemProps) {
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
  
  const bookTitle = bookInfo.title;
  if (!bookTitle) return null;

  const publicationYear = bookInfo.publishedDate ? new Date(bookInfo.publishedDate).getFullYear() : null;
  const rootClass = isModal
    ? "surface-paper overflow-hidden"
    : viewMode === 'list'
      ? "surface-paper overflow-hidden p-4"
      : "surface-paper overflow-hidden p-3";

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
      
      // Check if the user is authenticated
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("No authenticated user.");

      // Get the user's ID token
      const token = await currentUser.getIdToken();
      if (!token) throw new Error("No token found.");

      const response = await fetch('/api/user/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
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

  const handlePrimaryAction = async () => {
    if (isAdding || isAdded) return;

    if (onSelect) {
      setIsAdding(true);
      try {
        await onSelect();
        setIsAdded(true);
      } catch (error) {
        console.error('Error selecting book:', error);
      } finally {
        setIsAdding(false);
      }
      return;
    }

    await handleAddToBookshelf();
  };

  return (
    <article className={rootClass}>
      <div className={isModal || viewMode === 'grid' ? 'flex h-full flex-col' : 'flex gap-4'}>
        <div className={`relative shrink-0 overflow-hidden rounded-[var(--radius-md)] bg-[var(--neutral-100)] ${
          isModal ? 'h-48' : viewMode === 'list' ? 'h-48 w-32' : 'h-72 w-full'
        }`}>
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
            <div className="flex h-full w-full items-center justify-center text-[var(--neutral-500)]">
              <FiBookOpen className={`${isModal ? 'text-2xl' : 'text-4xl'}`} />
            </div>
          )}
        </div>

        <div className={`flex min-w-0 flex-1 flex-col ${isModal ? 'p-2' : viewMode === 'list' ? '' : 'pt-3'}`}>
          <h3 className={`line-clamp-2 font-semibold leading-tight text-[var(--neutral-900)] ${isModal ? 'text-xs' : 'text-sm md:text-base'}`}>
            {bookInfo.title}
          </h3>

          <p className={`mt-1 line-clamp-1 text-[var(--neutral-600)] ${isModal ? 'text-xs' : 'text-xs md:text-sm'}`}>
            by {bookInfo.authors?.length ? bookInfo.authors.join(', ') : 'Unknown author'}
          </p>

          {!isModal ? (
            <p className={`mt-2 text-xs text-[var(--neutral-600)] ${viewMode === 'list' ? 'line-clamp-4' : 'line-clamp-3'}`}>
              {bookDescription}
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-1.5">
            {publicationYear ? <Badge variant="neutral">{publicationYear}</Badge> : null}
            {bookInfo.pageCount ? <Badge variant="neutral">{bookInfo.pageCount}p</Badge> : null}
            {bookInfo.categories?.[0] ? <Badge variant="info" className="max-w-[120px] truncate">{bookInfo.categories[0]}</Badge> : null}
          </div>

          <div className={`mt-3 flex gap-2 ${isModal ? 'flex-col' : viewMode === 'list' ? 'items-center' : 'flex-col'} ${!isModal ? 'mt-auto' : ''}`}>
            <Button
              onClick={handlePrimaryAction}
              disabled={isAdding || isAdded}
              size="sm"
              className={`${isModal ? '' : 'h-9'} ${viewMode === 'list' && !isModal ? 'w-auto px-3' : 'w-full'}`}
            >
              {isAdded ? (
                <>
                  <FiCheck />
                  Added
                </>
              ) : isAdding ? (
                'Adding...'
              ) : (
                <>
                  <FiPlus />
                  Add To Shelf
                </>
              )}
            </Button>

            <div className={`${viewMode === 'list' && !isModal ? '' : 'w-full'} flex items-center gap-2`}>
              <WishlistAction
                bookId={book.id}
                title={bookInfo.title}
                authors={bookInfo.authors}
                coverImage={bookInfo.imageLinks?.thumbnail}
                className="h-9 w-9"
              />

              {!isModal ? (
                <Link href={`/books/${book.id}`} className={viewMode === 'list' ? '' : 'flex-1'}>
                  <Button variant="secondary" size="sm" className={viewMode === 'list' ? 'h-9 px-3' : 'h-9 w-full'}>
                    Details
                    <FiArrowRight className="text-xs" />
                  </Button>
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}