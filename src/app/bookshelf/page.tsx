'use client';

import React, { useEffect, useState } from "react";
import BookshelfTabs from "./BookshelfTabs";
import AddBookButton from "./AddBookButton";
import { AddBookModal } from "./AddBookModal";
import { bookStatus, userBook } from "../utils/types/booksDB";
import { BookCard } from "./BookCard";
import { useCurrentUser } from "@/lib/currentUser";

export default function BookshelfPage() {
  const { user, loading } = useCurrentUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [books, setBooks] = useState<userBook[]>([]);
  const [selectedTab, setSelectedTab] = useState<bookStatus>('reading');

  useEffect(() => {
    if(loading || !user) return; // Wait for user to be loaded
    async function fetchBooks() {
      try {
        console.log("Fetching books...");
        const token = await user?.getIdToken();
        if (!token) {
          console.error("Failed to retrieve authentication token.");
          return; // Exit if token is not available
        }
        const res = await fetch('/api/user/books', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        const data = await res.json();
        console.log("Fetched books:", data);
        setBooks(data);
      } 
      catch (error) {
        console.error("Error fetching books:", error);
      }
    }

    fetchBooks();
  }, [loading, user]);

  function handleTabChange(tab: bookStatus) {
    setSelectedTab(tab);
  }

  const filteredBooks = books.filter(book => book.status === selectedTab);

  return (
    <div className="p-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between my-4">
        <h1 className="text-2xl font-bold mx-auto">Bookshelf</h1>
        <AddBookButton handleClick={() => setIsModalOpen(true)} />
      </div>

      {/* Tabs */}
      <BookshelfTabs selectedTab={selectedTab} onTabChange={handleTabChange} />

      {/* Book Grid */}
      <div className="mt-6 flex flex-wrap gap-4 justify-start">
        {filteredBooks.map(book => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>

      {isModalOpen && <AddBookModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}