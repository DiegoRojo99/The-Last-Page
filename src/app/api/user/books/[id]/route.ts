import { CompleteUserBook } from "@/app/utils/types/booksAPI";
import { userBook } from "@/app/utils/types/booksDB";
import { adminAuth, adminDB } from "@/lib/firebase-admin";
import { NextRequest, NextResponse } from "next/server";

// Google Books API URL
const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

async function verifyUser(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  const idToken = authHeader.split("Bearer ")[1];
  const decodedToken = await adminAuth.verifyIdToken(idToken);
  return decodedToken.uid;
}

// GET a specific user book
export async function GET(req: NextRequest) {
  try {
    const bookId = req.nextUrl.pathname.split("/").pop();
    if (!bookId) {
      throw new Error("Book ID is required");
    }

    // Get the user's books collection reference
    const uid = await verifyUser(req);
    const bookRef = adminDB.doc(`users/${uid}/books/${bookId}`);
    const bookDoc = await bookRef.get();
    if (!bookDoc.exists) { throw new Error("Book not found"); }
    
    // Get user book data
    const userBook = bookDoc.data() as userBook;

    // Fetch additional book information from Google Books API
    const googleBooksApiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
    if (!googleBooksApiKey) {
      throw new Error("Google Books API key is not configured");
    }

    // Fetch book info from Google Books API
    const fetchBookInfo = async (bookId: string) => {
      const response = await fetch(`${GOOGLE_BOOKS_API_URL}/${bookId}?key=${googleBooksApiKey}`);
      if (!response.ok) {
        console.error(`Failed to fetch book info for ID: ${bookId}`);
        return null;
      }
      return response.json();
    };
    const bookInfo = await fetchBookInfo(userBook.id);

    const bookWithVolumeInfo: CompleteUserBook = {
      id: userBook.id,
      userInfo: { ...userBook },
      volumeInfo: bookInfo ? bookInfo.volumeInfo : null,
    };

    return NextResponse.json(bookWithVolumeInfo);
  } 
  catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unauthorized or Error fetching book" }, { status: 401 });
  }
}