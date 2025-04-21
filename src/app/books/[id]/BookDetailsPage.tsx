'use client';

import { useEffect, useState } from 'react';

interface BookDetailsPageProps {
  id: string;
}

export default function BookDetailsPage({ id }: BookDetailsPageProps) {
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`);
        const data = await response.json();
        setBook(data);
      } catch (error) {
        console.error('Error fetching book details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBookDetails();
  }, [id]);

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading book details...</p>;
  if (!book) return <p className="text-center mt-10 text-red-500">Book not found.</p>;

  const volume = book.volumeInfo;

  return (
    <div className="mx-auto p-6 shadow-md rounded-lg mt-6">
      <div className="flex flex-col sm:flex-row gap-6">
        {volume.imageLinks?.thumbnail && (
          <img
            src={volume.imageLinks.thumbnail}
            alt={volume.title}
            className="w-48 h-auto shadow-md rounded"
          />
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-2">{volume.title}</h1>
          {volume.authors && (
            <p className="text-gray-600 mb-1">
              <span className="font-semibold">Author(s):</span> {volume.authors.join(', ')}
            </p>
          )}
          {volume.publishedDate && (
            <p className="text-gray-600 mb-1">
              <span className="font-semibold">Published:</span> {volume.publishedDate}
            </p>
          )}
          {volume.publisher && (
            <p className="text-gray-600 mb-1">
              <span className="font-semibold">Publisher:</span> {volume.publisher}
            </p>
          )}
          {volume.pageCount && (
            <p className="text-gray-600 mb-1">
              <span className="font-semibold">Pages:</span> {volume.pageCount}
            </p>
          )}
          {volume.categories && (
            <p className="text-gray-600 mb-1">
              <span className="font-semibold">Categories:</span> {volume.categories.join(', ')}
            </p>
          )}
        </div>
      </div>

      {volume.description && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="text-gray-700 leading-relaxed">{volume.description}</p>
        </div>
      )}

      {volume.previewLink && (
        <div className="mt-6">
          <a
            href={volume.previewLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Preview on Google Books
          </a>
        </div>
      )}
    </div>
  );
}