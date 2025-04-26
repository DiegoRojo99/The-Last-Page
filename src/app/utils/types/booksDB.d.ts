type bookStatus = 'reading' | 'completed' | 'abandoned' | 'notStarted';

type userBook = {
  id: string;
  title: string;
  authors: string[];
  coverImage: string;
  status: bookStatus;
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  totalPages?: number;
  notes?: string;
}

type readingSession = {
  id: string;
  bookId: string;
  durationMinutes: number;
  pagesRead?: number;
  sessionDate: Timestamp;
  notes?: string;
}

type achievement = {
  id: string;
  title: string;
  description: string;
  achievedAt: Timestamp;
  type: 'booksRead' | 'seriesCompleted' | 'authorCompleted' | 'custom';
  relatedData?: any; // e.g. seriesName or authorName
}

type bookDB = {
  id: string;
  title: string;
  authors: string[];
  coverImage: string;
}

type libraryBook = bookDB & {
  purchasedAt?: Timestamp;
  format?: 'physical' | 'ebook' | 'audiobook';
}

type wishlistBook =  bookDB & {
  addedAt: Timestamp;
}

export {
  userBook,
  readingSession,
  achievement,
  bookDB,
  libraryBook,
  wishlistBook,
  bookStatus
}