'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { FiHeart, FiLoader } from 'react-icons/fi';

interface WishlistActionProps {
  bookId: string;
  title: string;
  authors?: string[];
  coverImage?: string;
  isInWishlist?: boolean;
  onWishlistChange?: () => void;
  className?: string;
}

export default function WishlistAction({ 
  bookId, 
  title, 
  authors, 
  coverImage, 
  isInWishlist = false,
  onWishlistChange,
  className = ""
}: WishlistActionProps) {
  const [loading, setLoading] = useState(false);
  const [inWishlist, setInWishlist] = useState(isInWishlist);

  const handleWishlistToggle = async () => {
    const user = auth.currentUser;
    if (!user) {
      window.location.href = '/login'; // Redirect to login or show login prompt
      return;
    }

    setLoading(true);
    try {
      const token = await user.getIdToken();
      
      if (inWishlist) {
        // Remove from wishlist
        const response = await fetch(`/api/user/wishlist/${bookId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        if (response.ok) {
          setInWishlist(false);
          onWishlistChange?.();
        } else {
          const error = await response.json();
          console.error('Error removing from wishlist:', error);
        }
      } else {
        // Add to wishlist
        const response = await fetch('/api/user/wishlist', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: bookId,
            title,
            authors: authors || [],
            coverImage: coverImage || ''
          })
        });

        if (response.ok) {
          setInWishlist(true);
          onWishlistChange?.();
        } else {
          const error = await response.json();
          if (response.status === 409) {
            // Book already in wishlist or library
            setInWishlist(true);
          } else {
            console.error('Error adding to wishlist:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleWishlistToggle}
      disabled={loading}
      className={`flex items-center justify-center p-2 rounded-lg border border-gray-300 transition-all duration-200 ${
        inWishlist
          ? 'bg-red-50 text-red-600 hover:bg-red-100'
          : 'bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600'
      } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {loading ? (
        <FiLoader className="text-sm animate-spin" />
      ) : (
        <FiHeart className={`text-sm ${inWishlist ? 'fill-current' : ''}`} />
      )}
    </button>
  );
}
