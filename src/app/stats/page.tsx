'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/lib/currentUser';
import { 
  FiBookOpen, FiClock, FiTrendingUp, FiAward, FiCalendar, 
  FiUsers, FiTarget, FiHeart, FiBarChart, FiPieChart,
  FiActivity, FiStar, FiBook
} from 'react-icons/fi';

interface BookStats {
  totalBooks: number;
  completedBooks: number;
  currentlyReading: number;
  abandonedBooks: number;
  notStartedBooks: number;
  totalPages: number;
  averagePagesPerBook: number;
  genreDistribution: { [key: string]: number };
  authorStats: { [key: string]: number };
  completionRate: number;
}

interface ReadingStats {
  totalSessions: number;
  totalReadingTime: number;
  averageSessionLength: number;
  averageSessionsPerBook: number;
  pagesReadInSessions: number;
  averageReadingSpeed: number;
  readingStreak: number;
  busiestReadingMonth: string;
  sessionsThisMonth: number;
  sessionsThisYear: number;
}

interface WishlistStats {
  totalWishlistBooks: number;
  averageWishlistAge: number;
  mostWishedGenre: string;
  mostWishedAuthor: string;
}

interface UserStats {
  bookStats: BookStats;
  readingStats: ReadingStats;
  wishlistStats: WishlistStats;
}

export default function StatsPage() {
  const { user, loading } = useCurrentUser();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (loading || !user) return;
    
    async function fetchStats() {
      if (!user) return;
      
      try {
        setFetchLoading(true);
        const token = await user.getIdToken();
        const response = await fetch('/api/user/stats', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setFetchLoading(false);
      }
    }

    fetchStats();
  }, [user, loading]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  const getTopAuthors = (authorStats: { [key: string]: number }, limit: number = 5) => {
    return Object.entries(authorStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit);
  };

  const getTopGenres = (genreDistribution: { [key: string]: number }, limit: number = 5) => {
    return Object.entries(genreDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Log In</h1>
          <p className="text-gray-600">You need to be logged in to view your reading statistics.</p>
        </div>
      </div>
    );
  }

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Statistics Available</h1>
          <p className="text-gray-600">Start adding books and reading sessions to see your stats!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reading Statistics</h1>
              <p className="mt-1 text-gray-600">
                Your personal reading insights and achievements
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FiBarChart className="text-blue-600 text-2xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <FiBook className="text-blue-600 text-xl" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.bookStats.totalBooks}</h3>
                <p className="text-gray-600 text-sm">Total Books</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <FiAward className="text-green-600 text-xl" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.bookStats.completedBooks}</h3>
                <p className="text-gray-600 text-sm">Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-full mr-4">
                <FiClock className="text-orange-600 text-xl" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {formatTime(stats.readingStats.totalReadingTime)}
                </h3>
                <p className="text-gray-600 text-sm">Reading Time</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <FiActivity className="text-purple-600 text-xl" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{stats.readingStats.totalSessions}</h3>
                <p className="text-gray-600 text-sm">Reading Sessions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Book Statistics */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FiBookOpen className="mr-2 text-blue-600" />
                Book Statistics
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completion Rate</span>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${stats.bookStats.completionRate}%` }}
                    ></div>
                  </div>
                  <span className="font-medium">{stats.bookStats.completionRate}%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Currently Reading</span>
                <span className="font-medium">{stats.bookStats.currentlyReading}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Want to Read</span>
                <span className="font-medium">{stats.bookStats.notStartedBooks}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Abandoned</span>
                <span className="font-medium">{stats.bookStats.abandonedBooks}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Pages</span>
                <span className="font-medium">{stats.bookStats.totalPages.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Pages per Book</span>
                <span className="font-medium">{stats.bookStats.averagePagesPerBook}</span>
              </div>
            </div>
          </div>

          {/* Reading Habits */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FiTrendingUp className="mr-2 text-green-600" />
                Reading Habits
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Session Length</span>
                <span className="font-medium">{formatTime(stats.readingStats.averageSessionLength)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Sessions per Book</span>
                <span className="font-medium">{stats.readingStats.averageSessionsPerBook}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Reading Speed</span>
                <span className="font-medium">{stats.readingStats.averageReadingSpeed} pages/min</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pages Read in Sessions</span>
                <span className="font-medium">{stats.readingStats.pagesReadInSessions}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Sessions This Month</span>
                <span className="font-medium">{stats.readingStats.sessionsThisMonth}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Sessions This Year</span>
                <span className="font-medium">{stats.readingStats.sessionsThisYear}</span>
              </div>
              
              {stats.readingStats.busiestReadingMonth && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Busiest Month</span>
                  <span className="font-medium">{stats.readingStats.busiestReadingMonth}</span>
                </div>
              )}
            </div>
          </div>

          {/* Top Authors */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FiUsers className="mr-2 text-purple-600" />
                Top Authors
              </h3>
            </div>
            <div className="p-6">
              {getTopAuthors(stats.bookStats.authorStats).length > 0 ? (
                <div className="space-y-3">
                  {getTopAuthors(stats.bookStats.authorStats).map(([author, count], index) => (
                    <div key={author} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-purple-100 text-purple-600 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center mr-3">
                          {index + 1}
                        </div>
                        <span className="text-gray-900 text-sm">{author}</span>
                      </div>
                      <span className="text-gray-600 text-sm">{count} book{count > 1 ? 's' : ''}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No author data available</p>
              )}
            </div>
          </div>

          {/* Wishlist Stats */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FiHeart className="mr-2 text-red-600" />
                Wishlist Insights
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Books in Wishlist</span>
                <span className="font-medium">{stats.wishlistStats.totalWishlistBooks}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Wishlist Age</span>
                <span className="font-medium">{stats.wishlistStats.averageWishlistAge} days</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Most Wished Author</span>
                <span className="font-medium text-sm">{stats.wishlistStats.mostWishedAuthor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reading Goals Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FiTarget className="mr-2 text-indigo-600" />
              Reading Milestones
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-yellow-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <FiStar className="text-yellow-600 text-2xl" />
                </div>
                <h4 className="font-medium text-gray-900">Reading Consistency</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {stats.readingStats.sessionsThisMonth > 0 ? 'Great job staying consistent!' : 'Start a reading session today!'}
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <FiBookOpen className="text-blue-600 text-2xl" />
                </div>
                <h4 className="font-medium text-gray-900">Reading Progress</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {stats.bookStats.currentlyReading > 0 
                    ? `Currently reading ${stats.bookStats.currentlyReading} book${stats.bookStats.currentlyReading > 1 ? 's' : ''}` 
                    : 'Pick up a new book!'}
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <FiAward className="text-green-600 text-2xl" />
                </div>
                <h4 className="font-medium text-gray-900">Completion Achievement</h4>
                <p className="text-sm text-gray-600 mt-1">
                  {stats.bookStats.completionRate >= 70 
                    ? 'Excellent completion rate!' 
                    : stats.bookStats.completionRate >= 50 
                    ? 'Good progress on finishing books!'
                    : 'Try to finish more books you start!'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
