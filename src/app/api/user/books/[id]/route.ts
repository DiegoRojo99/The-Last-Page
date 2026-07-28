import { CompleteUserBook } from "@/app/utils/types/booksAPI";
import { userBook } from "@/app/utils/types/booksDB";
import { adminAuth, adminDB } from "@/lib/firebase-admin";
import { googleBookDetails } from "@/lib/google-books";
import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from 'firebase-admin/firestore';

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
    console.log("Fetching book with ID:", bookId);
    if (!bookId) {
      throw new Error("Book ID is required");
    }

    // Get the user's books collection reference
    const uid = await verifyUser(req);
    if (!uid) { 
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bookRef = adminDB.doc(`users/${uid}/books/${bookId}`);
    const bookDoc = await bookRef.get();
    if (!bookDoc.exists) { throw new Error("Book not found"); }
    
    // Get user book data
    const userBook = bookDoc.data() as userBook;

    let bookInfo: { volumeInfo?: CompleteUserBook['volumeInfo'] } | null = null;
    try {
      bookInfo = await googleBookDetails(userBook.id);
    } catch (error) {
      // Keep user data available even if external API is currently rate-limited.
      console.error(`Failed to fetch Google Books details for ${userBook.id}:`, error);
    }

    const bookWithVolumeInfo: CompleteUserBook = {
      id: userBook.id,
      userInfo: { ...userBook },
      volumeInfo: bookInfo?.volumeInfo ?? null
    };

    return NextResponse.json(bookWithVolumeInfo);
  } 
  catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error fetching book" }, { status: 404 });
  }
}

// PUT update a specific user book
export async function PUT(req: NextRequest) {
  try {
    const bookId = req.nextUrl.pathname.split("/").pop();
    if (!bookId) {
      throw new Error("Book ID is required");
    }

    const uid = await verifyUser(req);
    if (!uid) { 
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get current book data
    const body = await req.json();
    const bookRef = adminDB.doc(`users/${uid}/books/${bookId}`);
    const bookDoc = await bookRef.get();
    if (!bookDoc.exists) { 
      throw new Error("Book not found"); 
    }

    const currentData = bookDoc.data() as userBook;
    
    // Update fields using a typed object
    const updateData: {
      currentPage?: number;
      totalPages?: number;
      status?: string;
      notes?: string;
      startedAt?: FirebaseFirestore.Timestamp | null;
      completedAt?: FirebaseFirestore.Timestamp | null;
    } = {};

    const parseDateInput = (value: unknown) => {
      if (value === null) return null;
      if (value === undefined) return undefined;

      const parsed = new Date(String(value));
      if (Number.isNaN(parsed.getTime())) throw new Error('Invalid date value');
      return Timestamp.fromDate(parsed);
    };
    
    if (body.currentPage !== undefined) updateData.currentPage = body.currentPage;    
    if (body.totalPages !== undefined) updateData.totalPages = body.totalPages;    
    if (body.status !== undefined) {
      updateData.status = body.status;
      
      // Set timestamps based on status changes
      if (body.status === 'reading' && !currentData.startedAt) updateData.startedAt = Timestamp.now();
      else if (body.status === 'completed' && !currentData.completedAt) updateData.completedAt = Timestamp.now();
    }

    const startedAt = parseDateInput(body.startedAt);
    if (startedAt !== undefined) updateData.startedAt = startedAt;

    const completedAt = parseDateInput(body.completedAt);
    if (completedAt !== undefined) updateData.completedAt = completedAt;
  
    if (body.notes !== undefined) updateData.notes = body.notes;

    // Check if there's at least one field to update
    if (Object.keys(updateData).length === 0) return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    await bookRef.update(updateData);

    return NextResponse.json({ 
      message: "Book updated successfully",
      book: { ...currentData, ...updateData }
    });
  } 
  catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error updating book" }, { status: 400 });
  }
}