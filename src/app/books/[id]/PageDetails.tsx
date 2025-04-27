'use client';

import { bookDB } from "@/app/utils/types/booksDB";
import { useCurrentUser } from "@/lib/currentUser";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import BookCoverBackground from "./BookCoverBackground";

interface BookPageProps {
  bookId: string;
}

export default function BookDetails({ bookId }: BookPageProps) {
  const { user, loading } = useCurrentUser();
  const [book, setBook] = useState<bookDB | null>(null);

  useEffect(() => {
    if (loading) return; 
    if (!user) {
      // Redirect to login page or show a message
      console.log("User not logged in");
    } 
    else {
      const bookRef = doc(db, `users/${user.uid}/books`, bookId);
      const fetchBook = async () => {
        const bookSnap = await getDoc(bookRef);
        if (bookSnap.exists()) {
          let bookDetails = bookSnap.data() as bookDB;
          setBook(bookDetails);
        } 
        else {
          notFound();
        }
      };
      fetchBook();
    }
  }, [loading, user]);

  return (
    <div className="flex flex-col">
      <BookCoverBackground book={book} />

      <div className="p-6 text-center">
        <h3 className="text-2xl font-bold">{book?.title}</h3>
        <p className="text-gray-500">{book?.authors?.join(", ")}</p>
      </div>

      {/* Icons row */}
      <div className="flex gap-6 my-4 justify-around">
        {/* <button className="text-blue-500">📖</button>
        <button className="text-blue-500">✏️</button>
        <button className="text-blue-500">⭐</button> */}
      </div>
    </div>
  );
}