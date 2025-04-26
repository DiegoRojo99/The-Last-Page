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

// GET all user's books
// export async function GET(req: NextRequest) {
//   try {
//     const uid = await verifyUser(req);

//     const booksRef = adminDB.collection(`users/${uid}/books`);
//     const booksQuery = query(booksRef);
//     const booksSnapshot = await getDocs(booksQuery);

//     const books = booksSnapshot.docs.map(doc => ({
//       id: doc.id,
//       ...doc.data(),
//     }));

//     return NextResponse.json(books);
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: "Unauthorized or Error fetching books" }, { status: 401 });
//   }
// }

// POST a new book
export async function POST(req: NextRequest) {
  try {
    const uid = await verifyUser(req);
    const body = await req.json();

    // Get the user's books collection reference
    const booksRef = adminDB.collection(`users/${uid}/books`);
    
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
      notes: body.notes || null,
    };

    // Add the new book to the user's books collection
    const bookAddition = await booksRef.add(newBook);

    return NextResponse.json({ id: bookAddition.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Unauthorized or Error adding book" }, { status: 401 });
  }
}