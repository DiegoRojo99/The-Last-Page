"use client";

import { useEffect } from "react";
import BookSearch from "../books/BookSearch";
import { Book } from "../utils/types/booksAPI";
import { auth } from "@/lib/firebase";

interface AddBookModalProps {
  onClose: () => void;
}

export function AddBookModal({ onClose }: AddBookModalProps) {
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
  
      console.log("Book successfully added!");
      onClose();
    } 
    catch (error) {
      console.error("Error adding book:", error);
    }
  }  

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleOutsideClick}
    >
      <div className="bg-white p-6 rounded-md shadow-md w-11/12 max-w-sm md:max-w-md lg:max-w-lg max-h-[70vh] sm:max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-semibold text-center">Add a Book</h2>
        <BookSearch bookSelection={handleBookSelection} />
      </div>
    </div>
  );
}