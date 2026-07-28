import { adminAuth, adminDB } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';

interface UserBook {
  id: string;
  status?: string;
  totalPages?: number;
  currentPage?: number;
  genre?: string;
  authors?: string[];
  startedAt?: unknown;
  completedAt?: unknown;
  [key: string]: unknown;
}

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
  totalPagesRead: number;
  booksWithProgress: number;
  averagePagesProgressed: number;
  averageCompletionPercentage: number;
  startedThisMonth: number;
  completedThisYear: number;
}

interface WishlistStats {
  totalWishlistBooks: number;
  averageWishlistAge: number;
  mostWishedGenre: string;
  mostWishedAuthor: string;
}

async function verifyUser(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized');
  }

  const idToken = authHeader.split('Bearer ')[1];
  const decodedToken = await adminAuth.verifyIdToken(idToken);
  return decodedToken.uid;
}

export async function GET(req: NextRequest) {
  try {
    const uid = await verifyUser(req);
    if (!uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const booksSnapshot = await adminDB
      .collection('users')
      .doc(uid)
      .collection('books')
      .get();

    const books = booksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as UserBook[];

    const wishlistSnapshot = await adminDB
      .collection('users')
      .doc(uid)
      .collection('wishlist')
      .get();

    const wishlistBooks = wishlistSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Array<{
      id: string;
      addedAt?: unknown;
      authors?: string[];
      genre?: string;
      [key: string]: unknown;
    }>;

    const bookStats: BookStats = {
      totalBooks: books.length,
      completedBooks: books.filter((book) => book.status === 'completed').length,
      currentlyReading: books.filter((book) => book.status === 'reading').length,
      abandonedBooks: books.filter((book) => book.status === 'abandoned').length,
      notStartedBooks: books.filter((book) => book.status === 'notStarted').length,
      totalPages: books.reduce((sum, book) => sum + Number(book.totalPages || 0), 0),
      averagePagesPerBook: 0,
      genreDistribution: {},
      authorStats: {},
      completionRate: 0,
    };

    if (bookStats.totalBooks > 0) {
      bookStats.averagePagesPerBook = Math.round(bookStats.totalPages / bookStats.totalBooks);
      bookStats.completionRate = Math.round((bookStats.completedBooks / bookStats.totalBooks) * 100);
    }

    const genreCounts: { [key: string]: number } = {};
    books.forEach((book) => {
      const genre = String(book.genre || 'Unknown');
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
    bookStats.genreDistribution = genreCounts;

    const authorCounts: { [key: string]: number } = {};
    books.forEach((book) => {
      if (book.authors && Array.isArray(book.authors)) {
        book.authors.forEach((author: string) => {
          authorCounts[author] = (authorCounts[author] || 0) + 1;
        });
      }
    });
    bookStats.authorStats = authorCounts;

    const totalPagesRead = books.reduce((sum, book) => sum + Number(book.currentPage || 0), 0);
    const booksWithProgress = books.filter((book) => Number(book.currentPage || 0) > 0).length;

    const booksWithTotals = books.filter((book) => Number(book.totalPages || 0) > 0);
    const completionPercentageSum = booksWithTotals.reduce((sum, book) => {
      const totalPages = Number(book.totalPages || 0);
      const currentPage = Number(book.currentPage || 0);
      if (totalPages <= 0) return sum;
      return sum + Math.min((currentPage / totalPages) * 100, 100);
    }, 0);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const startedThisMonth = books.filter((book) => {
      if (!book.startedAt) return false;
      const startedDate = getDateFromTimestamp(book.startedAt);
      return startedDate.getMonth() === currentMonth && startedDate.getFullYear() === currentYear;
    }).length;

    const completedThisYear = books.filter((book) => {
      if (!book.completedAt) return false;
      const completedDate = getDateFromTimestamp(book.completedAt);
      return completedDate.getFullYear() === currentYear;
    }).length;

    const readingStats: ReadingStats = {
      totalPagesRead,
      booksWithProgress,
      averagePagesProgressed: booksWithProgress > 0 ? Math.round(totalPagesRead / booksWithProgress) : 0,
      averageCompletionPercentage: booksWithTotals.length > 0
        ? parseFloat((completionPercentageSum / booksWithTotals.length).toFixed(1))
        : 0,
      startedThisMonth,
      completedThisYear,
    };

    const wishlistStats: WishlistStats = {
      totalWishlistBooks: wishlistBooks.length,
      averageWishlistAge: 0,
      mostWishedGenre: 'Unknown',
      mostWishedAuthor: 'Unknown',
    };

    if (wishlistBooks.length > 0) {
      const nowMs = Date.now();
      const totalAge = wishlistBooks.reduce((sum, book) => {
        const addedDate = getDateFromTimestamp(book.addedAt);
        return sum + (nowMs - addedDate.getTime());
      }, 0);

      wishlistStats.averageWishlistAge = Math.round(totalAge / (wishlistBooks.length * 24 * 60 * 60 * 1000));

      const wishlistAuthorCounts: { [key: string]: number } = {};
      wishlistBooks.forEach((book) => {
        if (book.authors && Array.isArray(book.authors)) {
          book.authors.forEach((author: string) => {
            wishlistAuthorCounts[author] = (wishlistAuthorCounts[author] || 0) + 1;
          });
        }
      });

      const wishlistGenreCounts: { [key: string]: number } = {};
      wishlistBooks.forEach((book) => {
        const genre = String(book.genre || 'Unknown');
        wishlistGenreCounts[genre] = (wishlistGenreCounts[genre] || 0) + 1;
      });

      const mostWishedAuthorEntry = Object.entries(wishlistAuthorCounts).reduce(
        (a, b) => (wishlistAuthorCounts[a[0]] > wishlistAuthorCounts[b[0]] ? a : b),
        ['Unknown', 0]
      );
      wishlistStats.mostWishedAuthor = mostWishedAuthorEntry[0];

      const mostWishedGenreEntry = Object.entries(wishlistGenreCounts).reduce(
        (a, b) => (wishlistGenreCounts[a[0]] > wishlistGenreCounts[b[0]] ? a : b),
        ['Unknown', 0]
      );
      wishlistStats.mostWishedGenre = mostWishedGenreEntry[0];
    }

    return NextResponse.json({
      bookStats,
      readingStats,
      wishlistStats,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: 'Error fetching user statistics' }, { status: 500 });
  }
}

function getDateFromTimestamp(timestamp: unknown): Date {
  if (!timestamp) return new Date();

  if (typeof timestamp === 'object' && timestamp !== null && '_seconds' in timestamp) {
    return new Date((timestamp as { _seconds: number })._seconds * 1000);
  }

  if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp) {
    return (timestamp as { toDate: () => Date }).toDate();
  }

  if (typeof timestamp === 'string') {
    const parsed = new Date(timestamp);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }

  if (timestamp instanceof Date) {
    return timestamp;
  }

  return new Date();
}
