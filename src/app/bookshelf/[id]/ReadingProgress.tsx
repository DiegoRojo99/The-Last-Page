'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { readingSession } from '@/app/utils/types/booksDB';
import { FiClock, FiBookOpen, FiPlus, FiTrendingUp, FiCalendar, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';
import { CompleteUserBook } from '@/app/utils/types/booksAPI';

interface ReadingProgressProps {
  bookId: string;
}

const getTimestamp = (date: unknown) => {
  if (!date) return 0;
  if (typeof date === 'object' && date !== null && 'toDate' in date) {
    return (date as { toDate: () => Date }).toDate().getTime();
  } else if (typeof date === 'object' && date !== null && '_seconds' in date) {
    // Handle Firestore timestamp object with _seconds and _nanoseconds
    const firestoreTimestamp = date as { _seconds: number; _nanoseconds: number };
    return firestoreTimestamp._seconds * 1000 + firestoreTimestamp._nanoseconds / 1000000;
  } else if (typeof date === 'string') {
    return new Date(date).getTime();
  } else if (date instanceof Date) {
    return date.getTime();
  }
  return 0;
};

export default function ReadingProgress({ bookId }: ReadingProgressProps) {
  const [user, setUser] = useState<User | null>(null);
  const [book, setBook] = useState<CompleteUserBook | null>(null);
  const [sessions, setSessions] = useState<readingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSession, setShowAddSession] = useState(false);
  const [editingTotalPages, setEditingTotalPages] = useState(false);
  const [newTotalPages, setNewTotalPages] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [sessionData, setSessionData] = useState({
    durationMinutes: '',
    pagesRead: '',
    sessionDate: `${new Date().toISOString().slice(0, 16)}`, // Default to current date and time
    notes: ''
  });
  const router = useRouter();

  const fetchBookData = useCallback(async (currentUser: User) => {
    setLoading(true);
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`/api/user/books/${bookId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBook(data);
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Error fetching book data:', error);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchBookData(user);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [bookId, router, fetchBookData]);

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !sessionData.durationMinutes) return;

    try {
      setIsAdding(true);
      const token = await user.getIdToken();
      const response = await fetch(`/api/user/books/${bookId}/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          durationMinutes: parseInt(sessionData.durationMinutes),
          pagesRead: sessionData.pagesRead ? parseInt(sessionData.pagesRead) : undefined,
          sessionDate: sessionData.sessionDate ? new Date(sessionData.sessionDate) : undefined,
          notes: sessionData.notes || undefined
        })
      });

      if (response.ok) {
        setSessionData({ durationMinutes: '', pagesRead: '', notes: '', sessionDate: '' });
        setShowAddSession(false);
        fetchBookData(user);
      }
    } catch (error) {
      console.error('Error adding session:', error);
    }
    finally {
      setIsAdding(false);
    }
  };

  const handleUpdateTotalPages = async () => {
    if (!user || !newTotalPages) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/user/books/${bookId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          totalPages: parseInt(newTotalPages)
        })
      });

      if (response.ok) {
        setEditingTotalPages(false);
        setNewTotalPages('');
        fetchBookData(user);
      }
    } catch (error) {
      console.error('Error updating total pages:', error);
    }
  };

  const startEditingTotalPages = () => {
    setEditingTotalPages(true);
    setNewTotalPages(book?.userInfo.totalPages?.toString() || '');
  };

  const cancelEditingTotalPages = () => {
    setEditingTotalPages(false);
    setNewTotalPages('');
  };

  const formatDate = (timestamp: unknown) => {
    if (!timestamp) return '';
    
    let date: Date;
    
    // Check if it's a Firestore Timestamp with toDate method
    if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp) {
      const firebaseTimestamp = timestamp as { toDate: () => Date };
      date = firebaseTimestamp.toDate();
    } else if (typeof timestamp === 'object' && timestamp !== null && '_seconds' in timestamp) {
      // Handle Firestore timestamp object with _seconds and _nanoseconds
      const firestoreTimestamp = timestamp as { _seconds: number; _nanoseconds: number };
      date = new Date(firestoreTimestamp._seconds * 1000 + firestoreTimestamp._nanoseconds / 1000000);
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      console.warn('Invalid timestamp format:', timestamp);
      return '';
    }

    return date.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' }) + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const totalMinutes = sessions.reduce((sum, session) => sum + session.durationMinutes, 0);
  const totalPages = sessions.reduce((sum, session) => sum + (session.pagesRead || 0), 0);
  const progressPercentage = book?.userInfo.totalPages && book?.userInfo.currentPage
    ? Math.min((book.userInfo.currentPage / book.userInfo.totalPages) * 100, 100)
    : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-gray-600">Book not found in your library.</p>
        <Link href="/bookshelf" className="text-gray-800 hover:underline">
          Go back to bookshelf
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Book Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-24 h-32 bg-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
            {book.userInfo.coverImage ? (
              <Image
                src={book.userInfo.coverImage}
                alt={book.userInfo.title}
                width={96}
                height={128}
                className="w-full h-full object-cover rounded-md"
                unoptimized
              />
            ) : (
              <FiBookOpen className="text-gray-500 text-2xl" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{book.userInfo.title}</h1>
            {book.userInfo.authors && book.userInfo.authors.length > 0 && (
              <p className="text-gray-600 mb-2">by {book.userInfo.authors.join(', ')}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                book.userInfo.status === 'completed' ? 'bg-green-100 text-green-800' :
                book.userInfo.status === 'reading' ? 'bg-blue-100 text-blue-800' :
                book.userInfo.status === 'abandoned' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {book.userInfo.status === 'notStarted' ? 'Not Started' : 
                 book.userInfo.status.charAt(0).toUpperCase() + book.userInfo.status.slice(1)}
              </span>
              <div className="flex items-center gap-2">
                {editingTotalPages ? (
                  <div className="flex items-center gap-2">
                    <span>{book.userInfo.currentPage || 0} /</span>
                    <input
                      type="number"
                      value={newTotalPages}
                      onChange={(e) => setNewTotalPages(e.target.value)}
                      className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-gray-700 focus:border-gray-700"
                      min="1"
                      autoFocus
                    />
                    <span>pages</span>
                    <button
                      onClick={handleUpdateTotalPages}
                      className="text-green-600 hover:text-green-700 p-1"
                      title="Save"
                    >
                      <FiSave className="text-xs" />
                    </button>
                    <button
                      onClick={cancelEditingTotalPages}
                      className="text-red-600 hover:text-red-700 p-1"
                      title="Cancel"
                    >
                      <FiX className="text-xs" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    {book.userInfo.totalPages ? (
                      <>
                        <span>{book.userInfo.currentPage || 0} / {book.userInfo.totalPages} pages</span>
                        <button
                          onClick={startEditingTotalPages}
                          className="text-gray-500 hover:text-gray-600 p-1"
                          title="Edit total pages"
                        >
                          <FiEdit2 className="text-xs" />
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span>{book.userInfo.currentPage || 0} pages read</span>
                        <button
                          onClick={startEditingTotalPages}
                          className="text-gray-800 hover:text-gray-500 text-xs px-2 py-1 border border-blue-200 rounded hover:bg-blue-50"
                          title="Add total pages"
                        >
                          Add total pages
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        {book.userInfo.totalPages && book.userInfo.totalPages > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Reading Progress</span>
              <span>{progressPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gray-800 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
            <FiClock className="text-gray-800 text-xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">
            {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
          </h3>
          <p className="text-gray-600 text-sm">Total Reading Time</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
            <FiBookOpen className="text-green-600 text-xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{totalPages}</h3>
          <p className="text-gray-600 text-sm">Pages Read in Sessions</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
            <FiTrendingUp className="text-purple-600 text-xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{sessions.length}</h3>
          <p className="text-gray-600 text-sm">Reading Sessions</p>
        </div>
      </div>

      {/* Add Session Button */}
      <div className="mb-6">
        <button
          onClick={() => setShowAddSession(true)}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors flex items-center gap-2"
        >
          <FiPlus className="text-sm" />
          Add Reading Session
        </button>
      </div>

      {/* Add Session Form */}
      {showAddSession && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Reading Session</h3>
          <form onSubmit={handleAddSession} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes) *
              </label>
              <input
                type="number"
                value={sessionData.durationMinutes}
                onChange={(e) => setSessionData(prev => ({ ...prev, durationMinutes: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-gray-700 focus:border-gray-700"
                required
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pages Read
              </label>
              <input
                type="number"
                value={sessionData.pagesRead}
                onChange={(e) => setSessionData(prev => ({ ...prev, pagesRead: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-gray-700 focus:border-gray-700"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Date
              </label>
              <input
                type="datetime-local"
                value={sessionData.sessionDate}
                onChange={(e) => setSessionData(prev => ({ ...prev, sessionDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-gray-700 focus:border-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={sessionData.notes}
                onChange={(e) => setSessionData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-gray-700 focus:border-gray-700"
              />
            </div>
            <div className="flex gap-2">
              <button
                disabled={isAdding}
                type="submit"
                className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition-colors"
              >
                {isAdding ? 'Adding...' : 'Add Session'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddSession(false)}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reading Sessions */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 sm:p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Reading Sessions</h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {sessions.length} session{sessions.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {sessions.length === 0 ? (
            <div className="p-6 sm:p-8 text-center text-gray-500">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCalendar className="text-gray-500 text-2xl" />
              </div>
              <p className="text-lg font-medium text-gray-600 mb-2">No reading sessions yet</p>
              <p className="text-sm text-gray-500">Add your first session to start tracking your progress!</p>
            </div>
          ) : (
            sessions
              .sort((a, b) => {
                return getTimestamp(b.sessionDate) - getTimestamp(a.sessionDate);
              })
              .map((session, index) => (
              <div key={session.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    {/* Date and primary info */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-blue-100 p-1.5 rounded-full">
                        <FiCalendar className="text-gray-800 text-xs" />
                      </div>
                      <span className="font-medium text-gray-900 text-sm">
                        {formatDate(session.sessionDate)}
                      </span>
                      {index === 0 && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-medium">
                          Latest
                        </span>
                      )}
                    </div>
                    
                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1.5">
                        <div className="bg-orange-100 p-1 rounded">
                          <FiClock className="text-orange-600 text-xs" />
                        </div>
                        <span className="font-medium">{session.durationMinutes}</span>
                        <span className="text-gray-500">min</span>
                      </span>
                      {session.pagesRead && session.pagesRead > 0 && (
                        <span className="flex items-center gap-1.5">
                          <div className="bg-purple-100 p-1 rounded">
                            <FiBookOpen className="text-purple-600 text-xs" />
                          </div>
                          <span className="font-medium">{session.pagesRead}</span>
                          <span className="text-gray-500">page{session.pagesRead !== 1 ? 's' : ''}</span>
                        </span>
                      )}
                    </div>
                    
                    {/* Notes */}
                    {session.notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-200">
                        <p className="text-sm text-gray-700 italic">&ldquo;{session.notes}&rdquo;</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Mobile-friendly session number */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1">
                    <div className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-mono">
                      #{sessions.length - index}
                    </div>
                    {session.pagesRead && session.pagesRead > 0 && (
                      <div className="text-xs text-gray-500 hidden sm:block">
                        {(session.pagesRead / session.durationMinutes).toFixed(1)} p/min
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
