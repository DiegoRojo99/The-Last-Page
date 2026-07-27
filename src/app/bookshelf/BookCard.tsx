'use client';

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FiArrowRight, FiBookOpen, FiEye } from "react-icons/fi";
import QuickSessionAdd from "../components/QuickSessionAdd";
import { userBook } from "../utils/types/booksDB";
import { Badge, Button } from "../components/ui";

interface BookCardProps {
  book: userBook;
}

function getStatusMeta(status: userBook['status']) {
  if (status === 'reading') return { label: 'Reading', variant: 'info' as const };
  if (status === 'completed') return { label: 'Completed', variant: 'success' as const };
  if (status === 'abandoned') return { label: 'Abandoned', variant: 'danger' as const };
  return { label: 'To Read', variant: 'neutral' as const };
}

export function BookCard({ book }: BookCardProps) {
  const progressPercentage = book.totalPages && book.currentPage
    ? Math.min((book.currentPage / book.totalPages) * 100, 100)
    : 0;

  const statusMeta = getStatusMeta(book.status);

  return (
    <article className="group flex w-[170px] flex-col gap-2">
      <Link
        href={`/bookshelf/${book.id}`}
        className="relative block overflow-hidden rounded-[var(--radius-lg)] border border-[var(--neutral-200)] bg-[var(--neutral-100)] shadow-[var(--shadow-sm)] transition-all duration-[var(--motion-normal)] ease-[var(--motion-ease)] group-hover:-translate-y-1 group-hover:shadow-[var(--shadow-md)]"
      >
        {book.coverImage ? (
          <Image
            src={book.coverImage}
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

        {book.status === 'reading' && book.totalPages && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/70 to-transparent px-3 pb-2 pt-6 text-white">
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span>{book.currentPage || 0} / {book.totalPages} pages</span>
              <span>{progressPercentage.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/25">
              <div
                className="h-1.5 rounded-full bg-[var(--color-accent)] transition-all duration-[var(--motion-normal)]"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </Link>

      <div className="space-y-2">
        <div className="space-y-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-[var(--neutral-900)]">{book.title}</h3>
          <p className="line-clamp-1 text-xs text-[var(--neutral-600)]">
            {book.authors.length > 0 ? book.authors.join(', ') : 'Unknown author'}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
          <Link href={`/books/${book.id}`} title="View public book details">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
              <FiEye />
              Details
            </Button>
          </Link>
        </div>

        <Link href={`/bookshelf/${book.id}`}>
          <Button size="sm" fullWidth className="h-9 text-xs">
            <FiBookOpen />
            Open Progress
            <FiArrowRight className="text-[11px]" />
          </Button>
        </Link>

        {book.status === 'reading' && (
          <div className="pt-0.5">
            <QuickSessionAdd bookId={book.id} />
          </div>
        )}
      </div>
    </article>
  );
}
