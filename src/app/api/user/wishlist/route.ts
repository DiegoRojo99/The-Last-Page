import { wishlistBook } from "@/app/utils/types/booksDB";
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

// GET user's wishlist
export async function GET(req: NextRequest) {
  try {
    const uid = await verifyUser(req);
    if (!uid) { 
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's wishlist
    const wishlistSnapshot = await adminDB
      .collection('users')
      .doc(uid)
      .collection('wishlist')
      .orderBy('addedAt', 'desc')
      .get();

    const wishlist = wishlistSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as wishlistBook[];

    return NextResponse.json({ wishlist });
  } 
  catch (error) {
    console.error('Error fetching wishlist:', error);
    return NextResponse.json({ error: "Error fetching wishlist" }, { status: 500 });
  }
}

// POST add book to wishlist
export async function POST(req: NextRequest) {
  try {
    const uid = await verifyUser(req);
    if (!uid) { 
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, title, authors, coverImage } = body;

    if (!id || !title) {
      return NextResponse.json({ error: "Book ID and title are required" }, { status: 400 });
    }

    // Check if book is already in wishlist
    const existingWishlistItem = await adminDB
      .collection('users')
      .doc(uid)
      .collection('wishlist')
      .doc(id)
      .get();

    if (existingWishlistItem.exists) {
      return NextResponse.json({ error: "Book is already in your wishlist" }, { status: 409 });
    }

    // Check if book is already in user's library
    const existingBook = await adminDB
      .collection('users')
      .doc(uid)
      .collection('books')
      .doc(id)
      .get();

    if (existingBook.exists) {
      return NextResponse.json({ error: "Book is already in your library" }, { status: 409 });
    }

    const wishlistBookData = {
      id,
      title,
      authors: authors || [],
      coverImage: coverImage || '',
      addedAt: Timestamp.now()
    } as wishlistBook;

    await adminDB
      .collection('users')
      .doc(uid)
      .collection('wishlist')
      .doc(id)
      .set(wishlistBookData);

    return NextResponse.json({ 
      message: "Book added to wishlist successfully",
      book: wishlistBookData
    });
  } 
  catch (error) {
    console.error('Error adding book to wishlist:', error);
    return NextResponse.json({ error: "Error adding book to wishlist" }, { status: 500 });
  }
}
