"use client";

import { useEffect } from "react";
import BookSearch from "../books/BookSearch";
import { Book } from "../utils/types/booksAPI";
import { auth } from "@/lib/firebase";

interface AddBookModalProps {
  onClose: () => void;
  refreshData?: () => void;
}

export function AddBookModal({ onClose, refreshData }: AddBookModalProps) {
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  function handleOutsideClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  async function handleBookSelection(book: Book) {
    try {
      // Check if the user is authenticated
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("No authenticated user.");

      // Get the user's ID token
      const token = await currentUser.getIdToken();
      if (!token) throw new Error("No token found.");

      const response = await fetch("/api/user/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: book.id,
          title: book.volumeInfo.title,
          authors: book.volumeInfo.authors,
          coverImage: book.volumeInfo.imageLinks?.thumbnail || null,
          status: "notStarted",
          startedAt: null,
          completedAt: null,
          totalPages: book.volumeInfo.pageCount || null,
          notes: null,
        }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to add book");
      }
  
      onClose();
      refreshData?.();
    } 
    catch (error) {
      console.error("Error adding book:", error);
    }
  }  

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleOutsideClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-900">Add a Book</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <p className="text-gray-600 mb-6 text-center">
              Search for books and add them to your bookshelf
            </p>
            <BookSearch bookSelection={handleBookSelection} />
          </div>
        </div>
      </div>
    </div>
  );
}