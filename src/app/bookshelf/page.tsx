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
  const [fetchLoading, setFetchLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    if(loading || !user) return; // Wait for user to be loaded
    async function fetchBooks() {
      try {
        setFetchLoading(true);
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
        setBooks(data);
      } 
      catch (error) {
        console.error("Error fetching books:", error);
      } finally {
        setFetchLoading(false);
      }
    }

    fetchBooks();
  }, [loading, user, refresh]);

  function handleTabChange(tab: bookStatus) {
    setSelectedTab(tab);
  }

  const filteredBooks = books.filter(book => book.status === selectedTab);

  // Get counts for each status
  const bookCounts = {
    reading: books.filter(b => b.status === 'reading').length,
    completed: books.filter(b => b.status === 'completed').length,
    notStarted: books.filter(b => b.status === 'notStarted').length,
    abandoned: books.filter(b => b.status === 'abandoned').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h1>
          <p className="text-gray-600">You need to be logged in to view your bookshelf.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Bookshelf</h1>
              <p className="mt-1 text-gray-600">
                Manage and track your reading progress
              </p>
            </div>
            <AddBookButton handleClick={() => setIsModalOpen(true)} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{bookCounts.reading}</div>
              <div className="text-sm text-gray-600">Currently Reading</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{bookCounts.completed}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{bookCounts.notStarted}</div>
              <div className="text-sm text-gray-600">Want to Read</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{bookCounts.abandoned}</div>
              <div className="text-sm text-gray-600">Abandoned</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 overflow-x-scroll">
          <BookshelfTabs selectedTab={selectedTab} onTabChange={handleTabChange} />
        </div>

        {/* Books Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedTab === 'reading' && 'Currently Reading'}
                {selectedTab === 'completed' && 'Completed Books'}
                {selectedTab === 'notStarted' && 'Want to Read'}
                {selectedTab === 'abandoned' && 'Abandoned Books'}
                {filteredBooks.length > 0 && (
                  <span className="text-gray-500 font-normal ml-2">
                    ({filteredBooks.length})
                  </span>
                )}
              </h2>
            </div>

            {fetchLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredBooks.length > 0 ? (
              <div className="flex flex-wrap gap-4 justify-between">
                {filteredBooks.map(book => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No books in this category
                </h3>
                <p className="text-gray-600 mb-4">
                  {selectedTab === 'reading' && 'Start reading a book to see it here.'}
                  {selectedTab === 'completed' && 'Books you\'ve finished will appear here.'}
                  {selectedTab === 'notStarted' && 'Add books you want to read to see them here.'}
                  {selectedTab === 'abandoned' && 'Books you\'ve stopped reading will appear here.'}
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Your First Book
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && <AddBookModal onClose={() => setIsModalOpen(false)} refreshData={() => setRefresh(prev => !prev)} />}
    </div>
  );
}