"use client";

import { useState } from "react";
import { FiAlertCircle, FiCheckCircle, FiLoader, FiXCircle } from "react-icons/fi";
import { auth } from "@/lib/firebase";
import BookSearch from "../books/BookSearch";
import { Book } from "../utils/types/booksAPI";
import { normalizeGoogleBooksImageUrl } from "../utils/common";
import { Button, Modal, useToast } from "../components/ui";

interface AddBookModalProps {
  onClose: () => void;
  refreshData?: () => void;
  onBookAdded?: () => void;
}

export function AddBookModal({ onClose, refreshData, onBookAdded }: AddBookModalProps) {
  const { pushToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentBookTitle, setCurrentBookTitle] = useState<string>("");

  const closeIfIdle = () => {
    if (isSubmitting) return;
    onClose();
  };

  async function handleBookSelection(book: Book) {
    const title = book.volumeInfo.title || "book";
    const normalizedCoverImage = normalizeGoogleBooksImageUrl(book.volumeInfo.imageLinks?.thumbnail) || null;
    setCurrentBookTitle(title);
    setSubmitError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("You must be logged in to add books.");
      }

      const token = await currentUser.getIdToken();
      if (!token) {
        throw new Error("Could not validate your session. Please login again.");
      }

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
          coverImage: normalizedCoverImage,
          status: "notStarted",
          startedAt: null,
          completedAt: null,
          totalPages: book.volumeInfo.pageCount || null,
          notes: null,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null) as { error?: string } | null;
        const message = body?.error || (response.status === 409
          ? "This book is already in your library."
          : "Failed to add book. Please try again.");
        throw new Error(message);
      }

      setSuccessMessage(`Added \"${title}\" to your bookshelf.`);
      pushToast({
        title: "Book Added",
        description: `${title} is now in your bookshelf.`,
        variant: "success",
      });

      onBookAdded?.();
      refreshData?.();
      window.setTimeout(() => {
        onClose();
      }, 550);
    }
    catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error while adding book.";
      setSubmitError(message);
      pushToast({
        title: "Could not add book",
        description: message,
        variant: "error",
      });
      throw error;
    }
    finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal open onClose={closeIfIdle} title="Add A Book" className="max-w-5xl">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--neutral-200)] bg-[var(--neutral-50)] px-4 py-3 text-sm text-[var(--neutral-600)]">
          <p>
            Search by title, author, or ISBN, then add directly to your shelf.
            <span className="block text-xs text-[var(--neutral-500)]">Tip: Press Esc or click outside to close. Closing is paused while a book is being added.</span>
          </p>
          <Button variant="ghost" size="sm" onClick={closeIfIdle} disabled={isSubmitting}>
            Close
          </Button>
        </div>

        {isSubmitting ? (
          <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[#d7e7ff] bg-[#edf4ff] px-4 py-3 text-sm text-[var(--color-info)]">
            <FiLoader className="animate-spin" />
            Adding &quot;{currentBookTitle}&quot; to your bookshelf...
          </div>
        ) : null}

        {successMessage ? (
          <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[#d6f0de] bg-[#edf8f0] px-4 py-3 text-sm text-[var(--color-success)]">
            <FiCheckCircle />
            {successMessage}
          </div>
        ) : null}

        {submitError ? (
          <div className="flex items-center gap-2 rounded-[var(--radius-md)] border border-[#ffd9ce] bg-[#fff0ec] px-4 py-3 text-sm text-[var(--color-danger)]">
            <FiAlertCircle />
            {submitError}
            <FiXCircle className="ml-auto" />
          </div>
        ) : null}

        <BookSearch bookSelection={handleBookSelection} isModal />
      </div>
    </Modal>
  );
}
