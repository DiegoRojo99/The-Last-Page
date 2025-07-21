'use client';

import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import BookCoverBackground from "./BookCoverBackground";
import { Book } from "@/app/utils/types/booksAPI";
import { sanitizeHtml } from "@/app/utils/common";

interface BookPageProps {
  bookId: string;
}

export default function BookDetails({ bookId }: BookPageProps) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch book details from Google Books API via your API route
        const response = await fetch(`/api/books/details?id=${bookId}`);
        
        if (response.ok) {
          const bookDetails = await response.json();
          setBook(bookDetails);
        } 
        else if (response.status === 404) {
          notFound();
        } 
        else {
          setError("Failed to fetch book details");
        }
      } 
      catch (error) {
        console.error("Error fetching book details:", error);
        setError("Error loading book details");
      } finally {
        setLoading(false);
      }
    };

    if (bookId) {
      fetchBook();
    }
  }, [bookId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Book</h1>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!book || !book.volumeInfo) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto">
      <BookCoverBackground book={book} />

      {/* Book Title and Author */}
      <div className="p-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          {book.volumeInfo.title}
        </h1>
        {book.volumeInfo.subtitle && (
          <h2 className="text-xl text-gray-600 mb-3">
            {book.volumeInfo.subtitle}
          </h2>
        )}
        <p className="text-lg text-gray-700">
          by {book.volumeInfo.authors?.join(", ") || "Unknown Author"}
        </p>
      </div>

      {/* Book Details */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {book.volumeInfo.publishedDate && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Published</p>
              <p className="font-semibold">
                {new Date(book.volumeInfo.publishedDate).getFullYear()}
              </p>
            </div>
          )}
          
          {book.volumeInfo.pageCount && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Pages</p>
              <p className="font-semibold">{book.volumeInfo.pageCount}</p>
            </div>
          )}
          
          {book.volumeInfo.publisher && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Publisher</p>
              <p className="font-semibold text-sm">{book.volumeInfo.publisher}</p>
            </div>
          )}
          
          {book.volumeInfo.categories && book.volumeInfo.categories.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Genre</p>
              <p className="font-semibold text-sm">{book.volumeInfo.categories[0]}</p>
            </div>
          )}
        </div>
      </div>

      <hr className="mx-6 border-gray-200" />

      {/* Book Description */}
      <div className="px-6 py-6">
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">About This Book</h3>
        {book.volumeInfo.description ? (
          <div 
            className="prose prose-gray max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={sanitizeHtml(book.volumeInfo.description)} 
          />
        ) : (
          <p className="text-gray-500 italic">No description available.</p>
        )}
      </div>

      {/* Additional Information */}
      {(book.volumeInfo.industryIdentifiers || book.volumeInfo.language) && (
        <>
          <hr className="mx-6 border-gray-200" />
          <div className="px-6 py-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h3>
            <div className="space-y-2">
              {book.volumeInfo.language && (
                <p className="text-gray-600">
                  <span className="font-medium">Language:</span> {book.volumeInfo.language.toUpperCase()}
                </p>
              )}
              {book.volumeInfo.industryIdentifiers && book.volumeInfo.industryIdentifiers.length > 0 && (
                <div>
                  {book.volumeInfo.industryIdentifiers.map((identifier: any, index: number) => (
                    <p key={index} className="text-gray-600">
                      <span className="font-medium">{identifier.type}:</span> {identifier.identifier}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}