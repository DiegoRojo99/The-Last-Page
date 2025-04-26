"use client";

import { useEffect } from "react";

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

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleOutsideClick}
    >
      <div className="bg-white p-6 rounded-md shadow-md w-11/12 max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add a Book</h2>
        {/* Here we will later add the search input and results */}
        <p className="text-gray-600">Search for a book to add it to your collection.</p>
      </div>
    </div>
  );
}