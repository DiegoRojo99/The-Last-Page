'use client';

import React, { useEffect, useState } from "react";
import BookshelfTabs from "./BookshelfTabs";
import AddBookButton from "./AddBookButton";
import { AddBookModal } from "./AddBookModal";
import { bookStatus, userBook, wishlistBook } from "../utils/types/booksDB";
import { BookCard } from "./BookCard";
import { WishlistCard } from "./WishlistCard";
import { useCurrentUser } from "@/lib/currentUser";
import { Button, EmptyState, PageHeader, Skeleton } from "../components/ui";
import { FiBookOpen, FiCheckCircle, FiClock, FiHeart, FiPauseCircle } from "react-icons/fi";

function BookshelfPageSkeleton() {
  return (
    <div className="app-section">
      <div className="app-container page-stack">
        <div className="surface-elevated px-5 py-6 md:px-7 md:py-7">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="mt-3 h-5 w-96 max-w-full" />
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`stat-skeleton-${i}`} className="surface-paper p-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="mt-3 h-8 w-14" />
            </div>
          ))}
        </div>

        <Skeleton className="h-12 w-full rounded-[var(--radius-lg)]" />

        <div className="surface-elevated p-6">
          <Skeleton className="h-7 w-52" />
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`card-skeleton-${i}`} className="space-y-2">
                <Skeleton className="h-44 w-full rounded-[var(--radius-md)]" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookshelfPage() {
  const { user, loading } = useCurrentUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [books, setBooks] = useState<userBook[]>([]);
  const [wishlist, setWishlist] = useState<wishlistBook[]>([]);
  const [selectedTab, setSelectedTab] = useState<bookStatus | 'wishlist'>('reading');
  const [fetchLoading, setFetchLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    if (loading || !user) return;

    async function fetchData() {
      try {
        setFetchLoading(true);
        const token = await user?.getIdToken();
        if (!token) {
          console.error("Failed to retrieve authentication token.");
          return;
        }

        const booksRes = await fetch('/api/user/books', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        const booksData = await booksRes.json();
        setBooks(booksData);

        const wishlistRes = await fetch('/api/user/wishlist', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        const wishlistData = await wishlistRes.json();
        setWishlist(wishlistData.wishlist || []);
      }
      catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setFetchLoading(false);
      }
    }

    fetchData();
  }, [loading, user, refresh]);

  function handleTabChange(tab: bookStatus | 'wishlist') {
    setSelectedTab(tab);
  }

  const filteredBooks = selectedTab === 'wishlist' ? [] : books.filter((book) => book.status === selectedTab);
  const displayItems = selectedTab === 'wishlist' ? wishlist : filteredBooks;

  const bookCounts = {
    reading: books.filter((b) => b.status === 'reading').length,
    completed: books.filter((b) => b.status === 'completed').length,
    notStarted: books.filter((b) => b.status === 'notStarted').length,
    abandoned: books.filter((b) => b.status === 'abandoned').length,
    wishlist: wishlist.length,
  };

  const totalBooksInLibrary = books.length;
  const activeReadRatio = totalBooksInLibrary > 0
    ? Math.round((bookCounts.reading / totalBooksInLibrary) * 100)
    : 0;

  const statusCards = [
    {
      key: 'reading',
      label: 'Currently Reading',
      value: bookCounts.reading,
      helper: `${activeReadRatio}% active`,
      icon: FiBookOpen,
      tone: 'text-[var(--color-info)]',
      bg: 'bg-[#eef4ff]'
    },
    {
      key: 'completed',
      label: 'Completed',
      value: bookCounts.completed,
      helper: 'Finished books',
      icon: FiCheckCircle,
      tone: 'text-[var(--color-success)]',
      bg: 'bg-[#ebf8f0]'
    },
    {
      key: 'notStarted',
      label: 'Want to Read',
      value: bookCounts.notStarted,
      helper: 'Ready queue',
      icon: FiClock,
      tone: 'text-[var(--neutral-700)]',
      bg: 'bg-[var(--neutral-100)]'
    },
    {
      key: 'abandoned',
      label: 'Abandoned',
      value: bookCounts.abandoned,
      helper: 'Paused long-term',
      icon: FiPauseCircle,
      tone: 'text-[var(--color-danger)]',
      bg: 'bg-[#fff0ec]'
    },
    {
      key: 'wishlist',
      label: 'Wishlist',
      value: bookCounts.wishlist,
      helper: 'Next candidates',
      icon: FiHeart,
      tone: 'text-[var(--color-warning)]',
      bg: 'bg-[#fff6e8]'
    },
  ];

  if (loading) {
    return <BookshelfPageSkeleton />;
  }

  if (!user) {
    return (
      <div className="app-container app-section">
        <div className="mx-auto max-w-2xl">
          <EmptyState
            title="Please Log In"
            description="You need to be logged in to view your bookshelf."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="app-section">
      <div className="app-container page-stack">
        <PageHeader
          title="My Bookshelf"
          description="Manage your library, stay in motion, and keep every reading session in one place."
          action={<AddBookButton handleClick={() => setIsModalOpen(true)} />}
          className="bg-mesh-warm"
        />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {statusCards.map((card) => (
            <div key={card.key} className="surface-paper p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--neutral-500)]">{card.label}</p>
                  <p className="mt-2 text-3xl font-bold text-[var(--neutral-900)]">{card.value}</p>
                  <p className="mt-1 text-xs text-[var(--neutral-600)]">{card.helper}</p>
                </div>
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${card.bg} ${card.tone}`}>
                  <card.icon className="text-lg" />
                </span>
              </div>
            </div>
          ))}
        </div>

        <BookshelfTabs selectedTab={selectedTab} onTabChange={handleTabChange} counts={bookCounts} />

        <div className="surface-elevated">
          <div className="p-6">
            <h2 className="mb-6 text-2xl text-[var(--neutral-900)]">
              {selectedTab === 'reading' && 'Currently Reading'}
              {selectedTab === 'completed' && 'Completed Books'}
              {selectedTab === 'notStarted' && 'Want to Read'}
              {selectedTab === 'abandoned' && 'Abandoned Books'}
              {selectedTab === 'wishlist' && 'Wishlist'}
              {displayItems.length > 0 && (
                <span className="ml-2 font-normal text-[var(--neutral-500)]">({displayItems.length})</span>
              )}
            </h2>

            {fetchLoading ? (
              <div className="grid grid-cols-2 gap-4 py-2 md:grid-cols-4 lg:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={`book-grid-skeleton-${i}`} className="space-y-2">
                    <Skeleton className="h-44 w-full rounded-[var(--radius-md)]" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : displayItems.length > 0 ? (
              <div className="flex flex-wrap gap-4 justify-start">
                {selectedTab === 'wishlist'
                  ? wishlist.map((book) => (
                      <WishlistCard
                        key={book.id}
                        book={book}
                        onRemoved={() => setRefresh((prev) => !prev)}
                        onMoveToLibrary={() => setRefresh((prev) => !prev)}
                      />
                    ))
                  : filteredBooks.map((book) => <BookCard key={book.id} book={book} />)}
              </div>
            ) : (
              <EmptyState
                title={selectedTab === 'wishlist' ? 'No books in your wishlist' : 'No books in this category'}
                description={
                  selectedTab === 'reading'
                    ? 'Start reading a book to see it here.'
                    : selectedTab === 'completed'
                      ? "Books you've finished will appear here."
                      : selectedTab === 'notStarted'
                        ? 'Add books you want to read to see them here.'
                        : selectedTab === 'abandoned'
                          ? "Books you've stopped reading will appear here."
                          : 'Books you want to buy or read later will appear here.'
                }
                action={
                  <Button onClick={() => setIsModalOpen(true)}>
                    {selectedTab === 'wishlist' ? 'Browse Books' : 'Add Your First Book'}
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </div>

      {isModalOpen && <AddBookModal onClose={() => setIsModalOpen(false)} refreshData={() => setRefresh((prev) => !prev)} />}
    </div>
  );
}
