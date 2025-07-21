import { readingSession, userBook } from "./booksDB";

type VolumeInfo = {
  title: string;
  subtitle?: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  imageLinks?: {
    thumbnail?: string;
    smallThumbnail?: string;
  };
  pageCount?: number;
  categories?: string[];
  language?: string;
  industryIdentifiers?: {
    type: string;
    identifier: string;
  }[];
};

interface Book {
  id: string;
  volumeInfo: VolumeInfo;
}

interface CompleteUserBook {
  id: string;
  volumeInfo: VolumeInfo?;
  userInfo: userBook;
  sessions: readingSession[];
}

export {
  Book,
  CompleteUserBook
}