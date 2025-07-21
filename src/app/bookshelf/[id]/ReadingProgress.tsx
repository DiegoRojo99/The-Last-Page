'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { userBook, readingSession } from '@/app/utils/types/booksDB';
import { FiClock, FiBookOpen, FiPlus, FiTrendingUp, FiCalendar } from 'react-icons/fi';
import Link from 'next/link';
import Image from 'next/image';

interface ReadingProgressProps {
  bookId: string;
}

export default function ReadingProgress({ bookId }: ReadingProgressProps) {
  const [user, setUser] = useState<User | null>(null);
  const [book, setBook] = useState<userBook | null>(null);
  const [sessions, setSessions] = useState<readingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSession, setShowAddSession] = useState(false);
  const [sessionData, setSessionData] = useState({
    durationMinutes: '',
    pagesRead: '',
    notes: ''
  });
  const router = useRouter();

  const fetchBookData = useCallback(async (currentUser: User) => {
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`/api/user/books/${bookId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBook(data.book);
      }
    } catch (error) {
      console.error('Error fetching book data:', error);
    }
  }, [bookId]);

  const fetchSessions = useCallback(async (currentUser: User) => {
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`/api/user/books/${bookId}/sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchBookData(user);
        fetchSessions(user);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [bookId, router, fetchBookData, fetchSessions]);

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !sessionData.durationMinutes) return;

    try {
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
          notes: sessionData.notes || undefined
        })
      });

      if (response.ok) {
        setSessionData({ durationMinutes: '', pagesRead: '', notes: '' });
        setShowAddSession(false);
        // Refresh data
        fetchBookData(user);
        fetchSessions(user);
      }
    } catch (error) {
      console.error('Error adding session:', error);
    }
  };

  const formatDate = (timestamp: unknown) => {
    if (!timestamp) return '';
    
    let date: Date;
    
    // Check if it's a Firestore Timestamp with toDate method
    if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp) {
      const firebaseTimestamp = timestamp as { toDate: () => Date };
      date = firebaseTimestamp.toDate();
    } else if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      return '';
    }
    
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const totalMinutes = sessions.reduce((sum, session) => sum + session.durationMinutes, 0);
  const totalPages = sessions.reduce((sum, session) => sum + (session.pagesRead || 0), 0);
  const progressPercentage = book?.totalPages && book?.currentPage 
    ? Math.min((book.currentPage / book.totalPages) * 100, 100)
    : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-gray-600">Book not found in your library.</p>
        <Link href="/bookshelf" className="text-blue-600 hover:underline">
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
            {book.coverImage ? (
              <Image 
                src={book.coverImage} 
                alt={book.title}
                width={96}
                height={128}
                className="w-full h-full object-cover rounded-md"
              />
            ) : (
              <FiBookOpen className="text-gray-400 text-2xl" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{book.title}</h1>
            {book.authors && book.authors.length > 0 && (
              <p className="text-gray-600 mb-2">by {book.authors.join(', ')}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                book.status === 'completed' ? 'bg-green-100 text-green-800' :
                book.status === 'reading' ? 'bg-blue-100 text-blue-800' :
                book.status === 'abandoned' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {book.status === 'notStarted' ? 'Not Started' : 
                 book.status.charAt(0).toUpperCase() + book.status.slice(1)}
              </span>
              {book.totalPages && (
                <span>{book.currentPage || 0} / {book.totalPages} pages</span>
              )}
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        {book.totalPages && book.totalPages > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Reading Progress</span>
              <span>{progressPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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
            <FiClock className="text-blue-600 text-xl" />
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
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
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
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Add Session
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
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Reading Sessions</h3>
        </div>
        <div className="divide-y">
          {sessions.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <FiCalendar className="mx-auto text-4xl mb-2" />
              <p>No reading sessions yet.</p>
              <p className="text-sm">Add your first session to start tracking your progress!</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <FiClock className="text-xs" />
                        {session.durationMinutes} minutes
                      </span>
                      {session.pagesRead && (
                        <span className="flex items-center gap-1">
                          <FiBookOpen className="text-xs" />
                          {session.pagesRead} pages
                        </span>
                      )}
                    </div>
                    {session.notes && (
                      <p className="text-gray-700 text-sm mb-2">{session.notes}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(session.sessionDate)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
