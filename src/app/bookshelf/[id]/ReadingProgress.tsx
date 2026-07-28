'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { onAuthStateChanged, User } from 'firebase/auth';
import { FiBookOpen, FiEdit2, FiSave, FiTarget, FiTrendingUp, FiX } from 'react-icons/fi';
import { auth } from '@/lib/firebase';
import { CompleteUserBook } from '@/app/utils/types/booksAPI';
import { useToast } from '@/app/components/ui';

interface ReadingProgressProps {
  bookId: string;
}

function formatDate(timestamp: unknown): string {
  if (!timestamp) return '';

  let date: Date | null = null;
  if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp) {
    date = (timestamp as { toDate: () => Date }).toDate();
  } else if (typeof timestamp === 'object' && timestamp !== null && '_seconds' in timestamp) {
    const firestoreTimestamp = timestamp as { _seconds: number; _nanoseconds?: number };
    date = new Date(firestoreTimestamp._seconds * 1000 + (firestoreTimestamp._nanoseconds || 0) / 1000000);
  } else if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else if (timestamp instanceof Date) {
    date = timestamp;
  }

  if (!date || Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function ReadingProgress({ bookId }: ReadingProgressProps) {
  const { pushToast } = useToast();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [book, setBook] = useState<CompleteUserBook | null>(null);
  const [loading, setLoading] = useState(true);

  const [editingCurrentPage, setEditingCurrentPage] = useState(false);
  const [newCurrentPage, setNewCurrentPage] = useState('0');
  const [isSavingProgress, setIsSavingProgress] = useState(false);

  const [editingTotalPages, setEditingTotalPages] = useState(false);
  const [newTotalPages, setNewTotalPages] = useState('');

  const [showCompletionBackfill, setShowCompletionBackfill] = useState(false);
  const [completionBackfill, setCompletionBackfill] = useState({
    startedAt: '',
    completedAt: '',
  });

  const fetchBookData = useCallback(async (currentUser: User) => {
    setLoading(true);
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`/api/user/books/${bookId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Could not fetch book data');
      }

      const data = (await response.json()) as CompleteUserBook;
      setBook(data);
      setNewCurrentPage(String(data.userInfo.currentPage || 0));
    } catch (error) {
      console.error('Error fetching book data:', error);
      pushToast({
        title: 'Could not load book',
        description: 'Please try again in a moment.',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [bookId, pushToast]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        void fetchBookData(currentUser);
        return;
      }

      router.push('/login');
    });

    return () => unsubscribe();
  }, [fetchBookData, router]);

  const handleSaveProgress = async () => {
    if (!user || !book) return;

    const currentPage = Number.parseInt(newCurrentPage, 10);
    if (!Number.isFinite(currentPage) || currentPage < 0) {
      pushToast({
        title: 'Invalid page number',
        description: 'Current page must be 0 or greater.',
        variant: 'warning',
      });
      return;
    }

    if (book.userInfo.totalPages && currentPage > book.userInfo.totalPages) {
      pushToast({
        title: 'Page exceeds total pages',
        description: 'Current page cannot be greater than total pages.',
        variant: 'warning',
      });
      return;
    }

    let status = book.userInfo.status;
    if (book.userInfo.totalPages && currentPage >= book.userInfo.totalPages) {
      status = 'completed';
    } else if (currentPage > 0 && status === 'notStarted') {
      status = 'reading';
    } else if (currentPage === 0 && status === 'reading') {
      status = 'notStarted';
    }

    setIsSavingProgress(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/user/books/${bookId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPage,
          status,
        }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error || 'Failed to save progress');
      }

      setEditingCurrentPage(false);
      pushToast({
        title: 'Progress updated',
        description: 'Your current page was saved.',
        variant: 'success',
      });
      await fetchBookData(user);
    } catch (error) {
      console.error('Error updating progress:', error);
      pushToast({
        title: 'Could not save progress',
        description: 'Please try again.',
        variant: 'error',
      });
    } finally {
      setIsSavingProgress(false);
    }
  };

  const handleUpdateTotalPages = async () => {
    if (!user || !book) return;

    const totalPages = Number.parseInt(newTotalPages, 10);
    if (!Number.isFinite(totalPages) || totalPages <= 0) {
      pushToast({
        title: 'Invalid total pages',
        description: 'Total pages must be greater than 0.',
        variant: 'warning',
      });
      return;
    }

    if ((book.userInfo.currentPage || 0) > totalPages) {
      pushToast({
        title: 'Total pages too low',
        description: 'Total pages cannot be less than current page.',
        variant: 'warning',
      });
      return;
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/user/books/${bookId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ totalPages }),
      });

      if (!response.ok) {
        throw new Error('Failed to update total pages');
      }

      setEditingTotalPages(false);
      setNewTotalPages('');
      pushToast({
        title: 'Total pages updated',
        description: 'Book length was saved.',
        variant: 'success',
      });
      await fetchBookData(user);
    } catch (error) {
      console.error('Error updating total pages:', error);
      pushToast({
        title: 'Could not update total pages',
        description: 'Please try again.',
        variant: 'error',
      });
    }
  };

  const handleMarkBookCompleted = async () => {
    if (!user || !book) return;

    if (!completionBackfill.completedAt) {
      pushToast({
        title: 'Completed date required',
        description: 'Please choose a completed date before saving.',
        variant: 'warning',
      });
      return;
    }

    if (
      completionBackfill.startedAt &&
      new Date(completionBackfill.completedAt).getTime() < new Date(completionBackfill.startedAt).getTime()
    ) {
      pushToast({
        title: 'Invalid date range',
        description: 'Completed date cannot be earlier than the start date.',
        variant: 'warning',
      });
      return;
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/user/books/${bookId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'completed',
          currentPage: book.userInfo.totalPages || book.userInfo.currentPage || 0,
          startedAt: completionBackfill.startedAt || null,
          completedAt: completionBackfill.completedAt,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark book as completed');
      }

      pushToast({
        title: 'Book marked completed',
        description: 'The book was updated with your dates.',
        variant: 'success',
      });
      setShowCompletionBackfill(false);
      await fetchBookData(user);
    } catch (error) {
      console.error('Error marking book completed:', error);
      pushToast({
        title: 'Could not update book',
        description: 'Unexpected error while updating the book.',
        variant: 'error',
      });
    }
  };

  const startEditingTotalPages = () => {
    setEditingTotalPages(true);
    setNewTotalPages(book?.userInfo.totalPages?.toString() || '');
  };

  const currentPageValue = book?.userInfo.currentPage || 0;
  const totalPagesValue = book?.userInfo.totalPages || 0;
  const remainingPages = totalPagesValue > 0 ? Math.max(totalPagesValue - currentPageValue, 0) : 0;
  const progressPercentage = totalPagesValue > 0
    ? Math.min((currentPageValue / totalPagesValue) * 100, 100)
    : 0;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-800"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <p className="text-gray-600">Book not found in your library.</p>
        <Link href="/bookshelf" className="text-gray-800 hover:underline">
          Go back to bookshelf
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-32 w-24 flex-shrink-0 items-center justify-center rounded-md bg-gray-200">
            {book.userInfo.coverImage ? (
              <Image
                src={book.userInfo.coverImage}
                alt={book.userInfo.title}
                width={96}
                height={128}
                className="h-full w-full rounded-md object-cover"
                unoptimized
              />
            ) : (
              <FiBookOpen className="text-2xl text-gray-500" />
            )}
          </div>

          <div className="flex-1">
            <h1 className="mb-2 text-2xl font-bold text-gray-900">{book.userInfo.title}</h1>
            {book.userInfo.authors && book.userInfo.authors.length > 0 ? (
              <p className="mb-2 text-gray-600">by {book.userInfo.authors.join(', ')}</p>
            ) : null}

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className={`rounded px-2 py-1 text-xs font-medium ${
                book.userInfo.status === 'completed' ? 'bg-green-100 text-green-800' :
                book.userInfo.status === 'reading' ? 'bg-blue-100 text-blue-800' :
                book.userInfo.status === 'abandoned' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {book.userInfo.status === 'notStarted'
                  ? 'Not Started'
                  : book.userInfo.status.charAt(0).toUpperCase() + book.userInfo.status.slice(1)}
              </span>

              <div className="flex items-center gap-2">
                {editingCurrentPage ? (
                  <>
                    <input
                      type="number"
                      value={newCurrentPage}
                      onChange={(e) => setNewCurrentPage(e.target.value)}
                      className="w-24 rounded border border-gray-300 px-2 py-1 text-xs focus:border-gray-700 focus:ring-1 focus:ring-gray-700"
                      min="0"
                      autoFocus
                    />
                    <button
                      onClick={() => void handleSaveProgress()}
                      disabled={isSavingProgress}
                      className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50"
                      title="Save current page"
                    >
                      <FiSave className="text-xs" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingCurrentPage(false);
                        setNewCurrentPage(String(book.userInfo.currentPage || 0));
                      }}
                      className="p-1 text-red-600 hover:text-red-700"
                      title="Cancel"
                    >
                      <FiX className="text-xs" />
                    </button>
                  </>
                ) : (
                  <>
                    <span>
                      {currentPageValue}
                      {totalPagesValue > 0 ? ` / ${totalPagesValue}` : ''} pages
                    </span>
                    <button
                      onClick={() => setEditingCurrentPage(true)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                      title="Edit current page"
                    >
                      <FiEdit2 className="text-xs" />
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                {editingTotalPages ? (
                  <>
                    <input
                      type="number"
                      value={newTotalPages}
                      onChange={(e) => setNewTotalPages(e.target.value)}
                      className="w-24 rounded border border-gray-300 px-2 py-1 text-xs focus:border-gray-700 focus:ring-1 focus:ring-gray-700"
                      min="1"
                    />
                    <button
                      onClick={() => void handleUpdateTotalPages()}
                      className="p-1 text-green-600 hover:text-green-700"
                      title="Save total pages"
                    >
                      <FiSave className="text-xs" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingTotalPages(false);
                        setNewTotalPages('');
                      }}
                      className="p-1 text-red-600 hover:text-red-700"
                      title="Cancel"
                    >
                      <FiX className="text-xs" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={startEditingTotalPages}
                    className="rounded border border-blue-200 px-2 py-1 text-xs text-gray-800 hover:bg-blue-50"
                  >
                    {totalPagesValue > 0 ? 'Edit total pages' : 'Add total pages'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {totalPagesValue > 0 ? (
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-sm text-gray-600">
              <span>Reading Progress</span>
              <span>{progressPercentage.toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-gray-800 transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-6 text-center shadow-sm">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <FiBookOpen className="text-xl text-gray-800" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{currentPageValue}</h3>
          <p className="text-sm text-gray-600">Pages Read</p>
        </div>

        <div className="rounded-lg border bg-white p-6 text-center shadow-sm">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <FiTarget className="text-xl text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{totalPagesValue > 0 ? remainingPages : '-'}</h3>
          <p className="text-sm text-gray-600">Pages Remaining</p>
        </div>

        <div className="rounded-lg border bg-white p-6 text-center shadow-sm">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
            <FiTrendingUp className="text-xl text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{totalPagesValue > 0 ? `${progressPercentage.toFixed(1)}%` : '-'}</h3>
          <p className="text-sm text-gray-600">Completion</p>
        </div>
      </div>

      <div className="rounded-lg border border-green-100 bg-green-50/60 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-green-800">Backfill this book</p>
            <p className="text-xs text-green-700">Mark it as completed and optionally add your real dates.</p>
            <p className="mt-1 text-xs text-green-700">
              Started: {formatDate(book.userInfo.startedAt) || 'Not set'} | Completed: {formatDate(book.userInfo.completedAt) || 'Not set'}
            </p>
          </div>

          <button
            onClick={() => setShowCompletionBackfill((prev) => !prev)}
            className="inline-flex items-center justify-center rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            {showCompletionBackfill ? 'Close' : 'Mark Completed'}
          </button>
        </div>

        {showCompletionBackfill ? (
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <label className="text-sm text-gray-700">
              Started at
              <input
                type="date"
                value={completionBackfill.startedAt}
                onChange={(e) => setCompletionBackfill((prev) => ({ ...prev, startedAt: e.target.value }))}
                className="mt-1 h-10 w-full rounded border border-gray-300 px-3 text-sm"
              />
            </label>

            <label className="text-sm text-gray-700">
              Completed at
              <input
                type="date"
                value={completionBackfill.completedAt}
                onChange={(e) => setCompletionBackfill((prev) => ({ ...prev, completedAt: e.target.value }))}
                className="mt-1 h-10 w-full rounded border border-gray-300 px-3 text-sm"
              />
            </label>

            <div className="flex gap-2">
              <button
                onClick={() => void handleMarkBookCompleted()}
                className="inline-flex h-10 items-center justify-center rounded bg-gray-800 px-4 text-sm font-medium text-white hover:bg-gray-700"
              >
                Save
              </button>
              <button
                onClick={() => setShowCompletionBackfill(false)}
                className="inline-flex h-10 items-center justify-center rounded border border-gray-300 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
