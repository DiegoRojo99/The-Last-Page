'use client';

import { useState } from 'react';
import { userBook } from '@/app/utils/types/booksDB';
import { auth } from '@/lib/firebase';
import { FiEdit, FiSave, FiX } from 'react-icons/fi';

interface QuickProgressUpdateProps {
  book: userBook;
  onUpdate?: (updatedBook: userBook) => void;
}

export default function QuickProgressUpdate({ book, onUpdate }: QuickProgressUpdateProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(book.currentPage?.toString() || '0');
  const [isUpdating, setIsUpdating] = useState(false);

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

  const progressPercentage = book.totalPages && book.currentPage 
    ? Math.min((book.currentPage / book.totalPages) * 100, 100)
    : 0;

  if (!book.totalPages) return null;

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Reading Progress</span>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-500 hover:text-gray-800 transition-colors"
          >
            <FiEdit className="text-sm" />
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="text-green-600 hover:text-green-700 transition-colors disabled:opacity-50"
            >
              <FiSave className="text-sm" />
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setCurrentPage(book.currentPage?.toString() || '0');
              }}
              className="text-gray-500 hover:text-red-600 transition-colors"
            >
              <FiX className="text-sm" />
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={currentPage}
              onChange={(e) => setCurrentPage(e.target.value)}
              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-gray-700 focus:border-gray-700"
              min="0"
              max={book.totalPages}
            />
            <span className="text-sm text-gray-600">/ {book.totalPages} pages</span>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{book.currentPage || 0} / {book.totalPages} pages</span>
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
  );
}
