'use client';

import { useState } from 'react';
import { userBook } from '@/app/utils/types/booksDB';
import { auth } from '@/lib/firebase';
import { FiCheckCircle, FiEdit, FiSave, FiX } from 'react-icons/fi';
import { useToast } from '@/app/components/ui';

interface QuickProgressUpdateProps {
  book: userBook;
  onUpdate?: (updatedBook: userBook) => void;
}

export default function QuickProgressUpdate({ book, onUpdate }: QuickProgressUpdateProps) {
  const { pushToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(book.currentPage?.toString() || '0');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);

  const toDateInputValue = (value: unknown) => {
    if (!value) return '';

    let date: Date | null = null;
    if (typeof value === 'object' && value !== null && 'toDate' in value) {
      date = (value as { toDate: () => Date }).toDate();
    } else if (typeof value === 'object' && value !== null && '_seconds' in value) {
      const firestoreValue = value as { _seconds: number; _nanoseconds?: number };
      date = new Date(firestoreValue._seconds * 1000 + (firestoreValue._nanoseconds || 0) / 1000000);
    } else if (typeof value === 'string') {
      date = new Date(value);
    } else if (value instanceof Date) {
      date = value;
    }

    if (!date || Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
  };

  const [startedAt, setStartedAt] = useState(() => toDateInputValue(book.startedAt));
  const [completedAt, setCompletedAt] = useState(() => toDateInputValue(book.completedAt));

  const handleUpdate = async () => {
    if (!auth.currentUser) return;

    setIsUpdating(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`/api/user/books/${book.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPage: parseInt(currentPage) || 0,
          status: book.totalPages && parseInt(currentPage) >= book.totalPages ? 'completed' : 
                  parseInt(currentPage) > 0 ? 'reading' : book.status
        })
      });

      if (response.ok) {
        const updatedBook = { ...book, currentPage: parseInt(currentPage) || 0 };
        if (onUpdate) onUpdate(updatedBook);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!auth.currentUser) return;

    if (!completedAt) {
      pushToast({
        title: 'Completion date required',
        description: 'Choose a completed date before marking this book as done.',
        variant: 'warning',
      });
      return;
    }

    if (startedAt && new Date(completedAt).getTime() < new Date(startedAt).getTime()) {
      pushToast({
        title: 'Invalid date range',
        description: 'Completed date cannot be earlier than the start date.',
        variant: 'warning',
      });
      return;
    }

    setIsMarkingComplete(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`/api/user/books/${book.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: 'completed',
          currentPage: book.totalPages || parseInt(currentPage) || 0,
          startedAt: startedAt || null,
          completedAt,
        })
      });

      if (response.ok) {
        const updatedBook = {
          ...book,
          status: 'completed' as const,
          currentPage: book.totalPages || parseInt(currentPage) || 0,
        };

        if (onUpdate) onUpdate(updatedBook);
        setIsEditing(false);
        pushToast({
          title: 'Book marked completed',
          description: 'The book was marked as finished with your dates.',
          variant: 'success',
        });
      } else {
        const body = await response.json().catch(() => null) as { error?: string } | null;
        pushToast({
          title: 'Could not update book',
          description: body?.error || 'Please try again.',
          variant: 'error',
        });
      }
    } catch (error) {
      console.error('Error marking book completed:', error);
      pushToast({
        title: 'Could not update book',
        description: 'Unexpected error while saving the book.',
        variant: 'error',
      });
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const progressPercentage = book.totalPages && book.currentPage 
    ? Math.min((book.currentPage / book.totalPages) * 100, 100)
    : 0;

  if (!book.totalPages) return null;

  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-gray-700">Reading Progress</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsEditing((prev) => !prev)}
            className="text-gray-500 transition-colors hover:text-gray-800"
            title="Edit progress"
          >
            <FiEdit className="text-sm" />
          </button>
          {book.status !== 'completed' ? (
            <button
              onClick={() => setIsMarkingComplete((prev) => !prev)}
              className="text-green-600 transition-colors hover:text-green-700"
              title="Mark completed with dates"
            >
              <FiCheckCircle className="text-sm" />
            </button>
          ) : null}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={currentPage}
              onChange={(e) => setCurrentPage(e.target.value)}
              className="w-20 rounded border border-gray-300 px-2 py-1 text-sm focus:border-gray-700 focus:ring-1 focus:ring-gray-700"
              min="0"
              max={book.totalPages}
            />
            <span className="text-sm text-gray-600">/ {book.totalPages} pages</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="inline-flex items-center gap-1 rounded bg-gray-800 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
            >
              <FiSave className="text-xs" />
              {isUpdating ? 'Saving...' : 'Save Progress'}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setCurrentPage(book.currentPage?.toString() || '0');
              }}
              className="inline-flex items-center gap-1 rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <FiX className="text-xs" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{book.currentPage || 0} / {book.totalPages} pages</span>
            <span>{progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-gray-800 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {isMarkingComplete ? (
        <div className="mt-3 space-y-3 rounded-lg border border-green-100 bg-green-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Mark as completed</p>

          <div className="grid gap-2">
            <label className="text-sm text-gray-700">
              Started at
              <input
                type="date"
                value={startedAt}
                onChange={(e) => setStartedAt(e.target.value)}
                className="mt-1 h-9 w-full rounded border border-gray-300 px-2 py-1 text-sm"
              />
            </label>

            <label className="text-sm text-gray-700">
              Completed at
              <input
                type="date"
                value={completedAt}
                onChange={(e) => setCompletedAt(e.target.value)}
                className="mt-1 h-9 w-full rounded border border-gray-300 px-2 py-1 text-sm"
              />
            </label>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={() => void handleMarkCompleted()}
              disabled={isMarkingComplete}
              className="inline-flex items-center justify-center gap-1 rounded bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              <FiCheckCircle className="text-xs" />
              {isMarkingComplete ? 'Updating...' : 'Mark Completed'}
            </button>
            <button
              onClick={() => setIsMarkingComplete(false)}
              className="inline-flex items-center justify-center gap-1 rounded border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <FiX className="text-xs" />
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
