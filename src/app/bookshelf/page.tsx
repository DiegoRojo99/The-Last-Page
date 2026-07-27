'use client';

import React, { useEffect, useState } from "react";
import BookshelfTabs from "./BookshelfTabs";
import AddBookButton from "./AddBookButton";
import { AddBookModal } from "./AddBookModal";
import { bookStatus, userBook, wishlistBook } from "../utils/types/booksDB";
import { BookCard } from "./BookCard";
import { WishlistCard } from "./WishlistCard";
import { useCurrentUser } from "@/lib/currentUser";
import { Button, EmptyState, PageHeader } from "../components/ui";

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--color-ink)]" />
      </div>
    );
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
        />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <div className="surface-paper p-4 text-center">
            <div className="text-2xl font-bold text-[var(--color-info)]">{bookCounts.reading}</div>
            <div className="text-sm text-[var(--neutral-600)]">Currently Reading</div>
          </div>
          <div className="surface-paper p-4 text-center">
            <div className="text-2xl font-bold text-[var(--color-success)]">{bookCounts.completed}</div>
            <div className="text-sm text-[var(--neutral-600)]">Completed</div>
          </div>
          <div className="surface-paper p-4 text-center">
            <div className="text-2xl font-bold text-[var(--neutral-800)]">{bookCounts.notStarted}</div>
            <div className="text-sm text-[var(--neutral-600)]">Want to Read</div>
          </div>
          <div className="surface-paper p-4 text-center">
            <div className="text-2xl font-bold text-[var(--color-danger)]">{bookCounts.abandoned}</div>
            <div className="text-sm text-[var(--neutral-600)]">Abandoned</div>
          </div>
          <div className="surface-paper p-4 text-center">
            <div className="text-2xl font-bold text-[var(--color-warning)]">{bookCounts.wishlist}</div>
            <div className="text-sm text-[var(--neutral-600)]">Wishlist</div>
          </div>
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
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[var(--color-ink)]" />
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
