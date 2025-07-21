import { adminAuth, adminDB } from "@/lib/firebase-admin";
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

// DELETE remove book from wishlist
export async function DELETE(req: NextRequest) {
  try {
    const bookId = req.nextUrl.pathname.split("/").pop();
    if (!bookId) {
      throw new Error("Book ID is required");
    }

    const uid = await verifyUser(req);
    if (!uid) { 
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if book exists in wishlist
    const wishlistItemRef = adminDB
      .collection('users')
      .doc(uid)
      .collection('wishlist')
      .doc(bookId);

    const wishlistItem = await wishlistItemRef.get();
    if (!wishlistItem.exists) {
      return NextResponse.json({ error: "Book not found in wishlist" }, { status: 404 });
    }

    // Remove from wishlist
    await wishlistItemRef.delete();

    return NextResponse.json({ message: "Book removed from wishlist successfully" });
  } 
  catch (error) {
    console.error('Error removing book from wishlist:', error);
    return NextResponse.json({ error: "Error removing book from wishlist" }, { status: 500 });
  }
}

// POST move book from wishlist to library
export async function POST(req: NextRequest) {
  try {
    const bookId = req.nextUrl.pathname.split("/").pop();
    if (!bookId) {
      throw new Error("Book ID is required");
    }

    const uid = await verifyUser(req);
    if (!uid) { 
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get book from wishlist
    const wishlistItemRef = adminDB
      .collection('users')
      .doc(uid)
      .collection('wishlist')
      .doc(bookId);

    const wishlistItem = await wishlistItemRef.get();
    if (!wishlistItem.exists) {
      return NextResponse.json({ error: "Book not found in wishlist" }, { status: 404 });
    }

    const wishlistData = wishlistItem.data();

    // Check if book already exists in library
    const existingBook = await adminDB
      .collection('users')
      .doc(uid)
      .collection('books')
      .doc(bookId)
      .get();

    if (existingBook.exists) {
      return NextResponse.json({ error: "Book is already in your library" }, { status: 409 });
    }

    // Add to library
    const userBookData = {
      id: wishlistData?.id,
      title: wishlistData?.title,
      authors: wishlistData?.authors || [],
      coverImage: wishlistData?.coverImage || '',
      status: 'notStarted',
      startedAt: null,
      completedAt: null,
      totalPages: null,
      currentPage: 0,
      notes: ''
    };

    await adminDB
      .collection('users')
      .doc(uid)
      .collection('books')
      .doc(bookId)
      .set(userBookData);

    // Remove from wishlist
    await wishlistItemRef.delete();

    return NextResponse.json({ 
      message: "Book moved to library successfully",
      book: userBookData
    });
  } 
  catch (error) {
    console.error('Error moving book to library:', error);
    return NextResponse.json({ error: "Error moving book to library" }, { status: 500 });
  }
}
