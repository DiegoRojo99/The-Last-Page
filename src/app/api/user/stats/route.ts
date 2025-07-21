import { adminAuth, adminDB } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";

interface UserBook {
  id: string;
  status?: string;
  totalPages?: number;
  genre?: string;
  authors?: string[];
  [key: string]: unknown;
}

interface ReadingSession {
  id: string;
  bookId: string;
  durationMinutes?: number;
  pagesRead?: number;
  [key: string]: unknown;
}

async function verifyUser(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  const idToken = authHeader.split("Bearer ")[1];
  const decodedToken = await adminAuth.verifyIdToken(idToken);
  return decodedToken.uid;
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
  totalSessions: number;
  totalReadingTime: number; // in minutes
  averageSessionLength: number;
  averageSessionsPerBook: number;
  pagesReadInSessions: number;
  averageReadingSpeed: number; // pages per minute
  readingStreak: number;
  busiestReadingMonth: string;
  sessionsThisMonth: number;
  sessionsThisYear: number;
}

interface WishlistStats {
  totalWishlistBooks: number;
  averageWishlistAge: number; // in days
  mostWishedGenre: string;
  mostWishedAuthor: string;
}

// GET user reading statistics
export async function GET(req: NextRequest) {
  try {
    const uid = await verifyUser(req);
    if (!uid) { 
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all user books
    const booksSnapshot = await adminDB
      .collection('users')
      .doc(uid)
      .collection('books')
      .get();

    const books = booksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as UserBook[];

    // Fetch all reading sessions across all books
    const allSessions: ReadingSession[] = [];
    for (const book of books) {
      const sessionsSnapshot = await adminDB
        .collection('users')
        .doc(uid)
        .collection('books')
        .doc(book.id)
        .collection('readingSessions')
        .get();
      
      const sessions = sessionsSnapshot.docs.map(doc => ({
        id: doc.id,
        bookId: book.id,
        ...doc.data()
      })) as ReadingSession[];
      allSessions.push(...sessions);
    }

    // Fetch wishlist
    const wishlistSnapshot = await adminDB
      .collection('users')
      .doc(uid)
      .collection('wishlist')
      .get();

    const wishlistBooks = wishlistSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Array<{
      id: string;
      addedAt?: unknown;
      authors?: string[];
      [key: string]: unknown;
    }>;

    // Calculate book statistics
    const bookStats: BookStats = {
      totalBooks: books.length,
      completedBooks: books.filter(b => b.status === 'completed').length,
      currentlyReading: books.filter(b => b.status === 'reading').length,
      abandonedBooks: books.filter(b => b.status === 'abandoned').length,
      notStartedBooks: books.filter(b => b.status === 'notStarted').length,
      totalPages: books.reduce((sum, book) => sum + (book.totalPages || 0), 0),
      averagePagesPerBook: 0,
      genreDistribution: {},
      authorStats: {},
      completionRate: 0
    };

    if (bookStats.totalBooks > 0) {
      bookStats.averagePagesPerBook = Math.round(bookStats.totalPages / bookStats.totalBooks);
      bookStats.completionRate = Math.round((bookStats.completedBooks / bookStats.totalBooks) * 100);
    }

    // Calculate genre distribution (this would need to be stored or fetched from Google Books API)
    const genreCounts: { [key: string]: number } = {};
    books.forEach(book => {
      // For now, we'll use a placeholder. In a real app, you'd store genres with books
      const genre = book.genre || 'Unknown';
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
    bookStats.genreDistribution = genreCounts;

    // Calculate author statistics
    const authorCounts: { [key: string]: number } = {};
    books.forEach(book => {
      if (book.authors && Array.isArray(book.authors)) {
        book.authors.forEach((author: string) => {
          authorCounts[author] = (authorCounts[author] || 0) + 1;
        });
      }
    });
    bookStats.authorStats = authorCounts;

    // Calculate reading session statistics
    const readingStats: ReadingStats = {
      totalSessions: allSessions.length,
      totalReadingTime: allSessions.reduce((sum, session) => sum + (session.durationMinutes || 0), 0),
      averageSessionLength: 0,
      averageSessionsPerBook: 0,
      pagesReadInSessions: allSessions.reduce((sum, session) => sum + (session.pagesRead || 0), 0),
      averageReadingSpeed: 0,
      readingStreak: 0,
      busiestReadingMonth: '',
      sessionsThisMonth: 0,
      sessionsThisYear: 0
    };

    if (readingStats.totalSessions > 0) {
      readingStats.averageSessionLength = Math.round(readingStats.totalReadingTime / readingStats.totalSessions);
      
      const booksWithSessions = [...new Set(allSessions.map(s => s.bookId))].length;
      if (booksWithSessions > 0) {
        readingStats.averageSessionsPerBook = Math.round(readingStats.totalSessions / booksWithSessions);
      }

      // Calculate reading speed (pages per minute)
      const sessionsWithPages = allSessions.filter(s => s.pagesRead && s.pagesRead > 0);
      if (sessionsWithPages.length > 0) {
        const totalPagesInSessions = sessionsWithPages.reduce((sum, session) => sum + (session.pagesRead || 0), 0);
        const totalTimeInSessions = sessionsWithPages.reduce((sum, session) => sum + (session.durationMinutes || 0), 0);
        readingStats.averageReadingSpeed = parseFloat((totalPagesInSessions / totalTimeInSessions).toFixed(2));
      }

      // Calculate current month and year sessions
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      readingStats.sessionsThisMonth = allSessions.filter(session => {
        const sessionDate = getDateFromTimestamp(session.sessionDate);
        return sessionDate.getMonth() === currentMonth && sessionDate.getFullYear() === currentYear;
      }).length;

      readingStats.sessionsThisYear = allSessions.filter(session => {
        const sessionDate = getDateFromTimestamp(session.sessionDate);
        return sessionDate.getFullYear() === currentYear;
      }).length;

      // Find busiest reading month
      const monthCounts: { [key: string]: number } = {};
      allSessions.forEach(session => {
        const sessionDate = getDateFromTimestamp(session.sessionDate);
        const monthYear = `${sessionDate.getFullYear()}-${sessionDate.getMonth()}`;
        monthCounts[monthYear] = (monthCounts[monthYear] || 0) + 1;
      });

      const busiestMonth = Object.entries(monthCounts).reduce((a, b) => 
        monthCounts[a[0]] > monthCounts[b[0]] ? a : b
      );

      if (busiestMonth) {
        const [year, month] = busiestMonth[0].split('-');
        const date = new Date(parseInt(year), parseInt(month));
        readingStats.busiestReadingMonth = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      }
    }

    // Calculate wishlist statistics
    const wishlistStats: WishlistStats = {
      totalWishlistBooks: wishlistBooks.length,
      averageWishlistAge: 0,
      mostWishedGenre: 'Unknown',
      mostWishedAuthor: 'Unknown'
    };

    if (wishlistBooks.length > 0) {
      const now = Date.now();
      const totalAge = wishlistBooks.reduce((sum, book) => {
        const addedDate = getDateFromTimestamp(book.addedAt);
        return sum + (now - addedDate.getTime());
      }, 0);
      wishlistStats.averageWishlistAge = Math.round(totalAge / (wishlistBooks.length * 24 * 60 * 60 * 1000)); // in days

      // Most wished author
      const wishlistAuthorCounts: { [key: string]: number } = {};
      wishlistBooks.forEach(book => {
        if (book.authors && Array.isArray(book.authors)) {
          book.authors.forEach((author: string) => {
            wishlistAuthorCounts[author] = (wishlistAuthorCounts[author] || 0) + 1;
          });
        }
      });

      const mostWishedAuthorEntry = Object.entries(wishlistAuthorCounts).reduce((a, b) => 
        wishlistAuthorCounts[a[0]] > wishlistAuthorCounts[b[0]] ? a : b, ['Unknown', 0]
      );
      wishlistStats.mostWishedAuthor = mostWishedAuthorEntry[0];
    }

    return NextResponse.json({
      bookStats,
      readingStats,
      wishlistStats
    });
  } 
  catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: "Error fetching user statistics" }, { status: 500 });
  }
}

function getDateFromTimestamp(timestamp: unknown): Date {
  if (!timestamp) return new Date();
  
  if (typeof timestamp === 'object' && timestamp !== null && '_seconds' in timestamp) {
    return new Date((timestamp as { _seconds: number })._seconds * 1000);
  } else if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp) {
    return (timestamp as { toDate: () => Date }).toDate();
  } else if (typeof timestamp === 'string') {
    return new Date(timestamp);
  } else if (timestamp instanceof Date) {
    return timestamp;
  }
  
  return new Date();
}
