'use client';

import { useState } from 'react';
import { FiPlus, FiClock, FiBookOpen } from 'react-icons/fi';
import { auth } from '@/lib/firebase';

interface QuickSessionProps {
  bookId: string;
  onSessionAdded?: () => void;
}

export default function QuickSessionAdd({ bookId, onSessionAdded }: QuickSessionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [duration, setDuration] = useState('');
  const [pages, setPages] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !duration) return;

    setIsAdding(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`/api/user/books/${bookId}/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          durationMinutes: parseInt(duration),
          pagesRead: pages ? parseInt(pages) : undefined
        })
      });

      if (response.ok) {
        setDuration('');
        setPages('');
        setIsOpen(false);
        if (onSessionAdded) onSessionAdded();
      }
    } catch (error) {
      console.error('Error adding session:', error);
    } finally {
      setIsAdding(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full text-xs bg-gray-800 text-white px-2 py-1 rounded hover:bg-gray-500 transition-colors flex items-center justify-center gap-1"
        title="Add quick reading session"
      >
        <FiPlus className="text-xs" />
        Session
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Reading Session</h3>
        
        <form onSubmit={handleAddSession} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiClock className="inline mr-1" />
              Duration (minutes) *
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-gray-700 focus:border-gray-700"
              placeholder="30"
              required
              min="1"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiBookOpen className="inline mr-1" />
              Pages Read
            </label>
            <input
              type="number"
              value={pages}
              onChange={(e) => setPages(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-gray-700 focus:border-gray-700"
              placeholder="10"
              min="0"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isAdding || !duration}
              className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition-colors disabled:opacity-50"
            >
              {isAdding ? 'Adding...' : 'Add Session'}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
