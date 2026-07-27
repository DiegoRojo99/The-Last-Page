import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDB } from "@/lib/firebase-admin";
import { userBook } from "@/app/utils/types/booksDB";

async function verifyUser(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  const idToken = authHeader.split("Bearer ")[1];
  const decodedToken = await adminAuth.verifyIdToken(idToken);
  return decodedToken.uid;
}

// GET all user books
export async function GET(req: NextRequest) {
  try {
    const uid = await verifyUser(req);

    // Get the user's books collection reference
    const booksRef = adminDB.collection(`users/${uid}/books`);
    const snapshot = await booksRef.get();

    // Map the documents to an array of books
    const userBooks: userBook[] = snapshot.docs.map(doc => ({
      ...doc.data() as userBook,
    }));

    return NextResponse.json(userBooks, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unauthorized or Error fetching books" }, { status: 401 });
  }
}

// POST a new book
export async function POST(req: NextRequest) {
  try {
    const uid = await verifyUser(req);
    const body = await req.json();

    if (!body?.id || !body?.title) {
      return NextResponse.json({ error: 'Book ID and title are required' }, { status: 400 });
    }

    // Get the user's books collection reference
    const booksRef = adminDB.collection(`users/${uid}/books`);

    const bookDoc = booksRef.doc(body.id);
    const existingBook = await bookDoc.get();
    if (existingBook.exists) {
      return NextResponse.json({ error: 'Book is already in your library' }, { status: 409 });
    }
    
    // Create a new book object
    const newBook: userBook = {
      id: body.id,
      title: body.title,
      authors: body.authors || [],
      coverImage: body.coverImage || null,
      status: body.status || "notStarted",
      startedAt: body.startedAt || null,
      completedAt: body.completedAt || null,
      totalPages: body.totalPages || null,
      currentPage: body.currentPage || 0,
      notes: body.notes || null,
    };

    // Add the new book to the user's books collection
    await bookDoc.set(newBook);

    return NextResponse.json({ id: bookDoc.id }, { status: 201 });
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Error adding book' }, { status: 500 });
  }
}