'use client';

import { useCurrentUser } from "@/lib/currentUser";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import BookCoverBackground from "./BookCoverBackground";
import { CompleteUserBook } from "@/app/utils/types/booksAPI";
import { sanitizeHtml } from "@/app/utils/common";

interface BookPageProps {
  bookId: string;
}

export default function BookDetails({ bookId }: BookPageProps) {
  const { user, loading } = useCurrentUser();
  const [book, setBook] = useState<CompleteUserBook | null>(null);

  useEffect(() => {
    if (loading) return; 
    if (!user) {
      // Redirect to login page or show a message
      console.log("User not logged in");
    } 
    else {
      const fetchBook = async () => {
        try {
          const response = await fetch(`/api/user/books/${bookId}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${await user?.getIdToken()}`,
              "Content-Type": "application/json",
            },
          });
          if (response.ok) {
            const bookDetails = await response.json();
            setBook(bookDetails);
          } 
          else if (response.status === 404) {
            notFound();
          } 
          else {
            console.error("Failed to fetch book details");
          }
        } 
        catch (error) {
          console.error("Error fetching book details:", error);
        }
      };
      fetchBook();
    }
  }, [loading, user, bookId]);

  return (
    <div className="flex flex-col">
      <BookCoverBackground book={book} />

      <div className="p-6 text-center">
        <h3 className="text-2xl font-bold">{book?.volumeInfo?.title}</h3>
        <p className="text-gray-500">{book?.volumeInfo?.authors?.join(", ")}</p>
      </div>

      {/* Icons row */}
      {/* <div className="flex gap-6 my-4 justify-around">
        <button className="text-blue-500">📖</button>
        <button className="text-blue-500">✏️</button>
        <button className="text-blue-500">⭐</button>
      </div> */}

      <hr style={{borderTopWidth: '0.25px'}} />

      {/* Book description */}
      <div className="px-6 text-left">
        <h4 className="text-xl font-semibold pt-6 pb-3">Description</h4>
        { book?.volumeInfo?.description && <div dangerouslySetInnerHTML={sanitizeHtml(book?.volumeInfo?.description)} />}
      </div>
    </div>
  );
}