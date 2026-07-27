'use client';

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiBookmark, FiEye, FiPlus } from "react-icons/fi";
import { auth } from "@/lib/firebase";
import WishlistAction from "../components/WishlistAction";
import { wishlistBook } from "../utils/types/booksDB";
import { Badge, Button } from "../components/ui";
import { normalizeGoogleBooksImageUrl } from "../utils/common";

interface WishlistCardProps {
  book: wishlistBook;
  onRemoved?: () => void;
  onMoveToLibrary?: () => void;
}

export function WishlistCard({ book, onRemoved, onMoveToLibrary }: WishlistCardProps) {
  const [isMoving, setIsMoving] = useState(false);
  const coverImageSrc = normalizeGoogleBooksImageUrl(book.coverImage);

  const handleMoveToLibrary = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      setIsMoving(true);
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
    } finally {
      setIsMoving(false);
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
    <article className="group flex w-[170px] flex-col gap-2">
      <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--neutral-200)] bg-[var(--neutral-100)] shadow-[var(--shadow-sm)] transition-all duration-[var(--motion-normal)] ease-[var(--motion-ease)] group-hover:-translate-y-1 group-hover:shadow-[var(--shadow-md)]">
        {coverImageSrc ? (
          <Image
            src={coverImageSrc}
            alt={book.title}
            className="h-[240px] w-full object-cover"
            width={170}
            height={240}
            loading="lazy"
          />
        ) : (
          <div className="flex h-[240px] w-full items-center justify-center bg-[var(--neutral-200)] p-4 text-center text-sm text-[var(--neutral-500)]">
            No Cover Available
          </div>
        )}

        <div className="absolute right-2 top-2">
          <WishlistAction
            bookId={book.id}
            title={book.title}
            authors={book.authors}
            coverImage={coverImageSrc}
            isInWishlist={true}
            onWishlistChange={onRemoved}
            className="border-0 bg-white/90 shadow-[var(--shadow-sm)]"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="space-y-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-[var(--neutral-900)]">{book.title}</h3>
          <p className="line-clamp-1 text-xs text-[var(--neutral-600)]">
            {book.authors.length > 0 ? book.authors.join(', ') : 'Unknown author'}
          </p>
          <p className="text-[11px] text-[var(--neutral-500)]">Added {formatDate(book.addedAt)}</p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Badge variant="warning">
            <FiBookmark className="mr-1" />
            Wishlist
          </Badge>
          <Link href={`/books/${book.id}`} title="View public book details">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
              <FiEye />
              Details
            </Button>
          </Link>
        </div>

        <Button onClick={handleMoveToLibrary} fullWidth size="sm" disabled={isMoving} className="h-9 text-xs">
          <FiPlus />
          {isMoving ? 'Adding...' : 'Move To Library'}
          {!isMoving && <FiArrowRight className="text-[11px]" />}
        </Button>
      </div>
    </article>
  );
}
