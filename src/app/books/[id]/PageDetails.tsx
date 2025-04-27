'use client';

import { Book } from "@/app/utils/types/booksAPI";
import { bookDB } from "@/app/utils/types/booksDB";
import { useCurrentUser } from "@/lib/currentUser";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";

interface BookPageProps {
  bookId: string;
}

export default function BookDetails({ bookId }: BookPageProps) {
  const { user, loading } = useCurrentUser();
  const [bookData, setBookData] = useState<bookDB | null>(null);

  useEffect(() => {
    if (loading) return; 
    if (!user) {
      // Redirect to login page or show a message
      console.log("User not logged in");
    } 
    else {
      const bookRef = doc(db, `users/${user.uid}/books`, bookId);
      const fetchBookData = async () => {
        const bookSnap = await getDoc(bookRef);
        if (bookSnap.exists()) {
          let bookDetails = bookSnap.data() as bookDB;
          setBookData(bookDetails);
        } 
        else {
          notFound();
        }
      };
      fetchBookData();
    }
  }, [loading, user]);

  return (
    <div>
      <h1>{bookData?.title}</h1>
      {/* We will do the beautiful layout next */}
    </div>
  );
}