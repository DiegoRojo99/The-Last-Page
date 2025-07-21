import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDB } from '@/lib/firebase-admin';
import { readingSession } from '@/app/utils/types/booksDB';
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

export async function GET(
  request: NextRequest,
) {
  try {
    const bookId = request.nextUrl.pathname.replace('/sessions', '').split("/").pop();
    if (!bookId) {
      return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });
    }
    
    const userId = await verifyUser(request);
    if (!userId) { 
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get reading sessions for the book
    const bookRef = adminDB.collection('users').doc(userId).collection('books').doc(bookId);
    const bookDoc = await bookRef.get();
    if (!bookDoc.exists) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Fetch reading sessions for the book
    const sessionsSnapshot = await adminDB
      .collection('users')
      .doc(userId)
      .collection('books')
      .doc(bookId)
      .collection('readingSessions')
      .orderBy('sessionDate', 'desc')
      .get();

    const sessions = sessionsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as readingSession[];

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching reading sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch reading sessions' }, { status: 500 });
  }
}

function getTimestampFromDate(date: Date | Timestamp): Timestamp {
  if (date instanceof Timestamp) {
    return date;
  } 
  else if (date instanceof Date) {
    return Timestamp.fromDate(date);
  } 
  else if (typeof date === 'string') {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return Timestamp.now();
    }
    return Timestamp.fromDate(parsedDate);
  } 
  else {
    return Timestamp.now();
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const bookId = request.nextUrl.pathname.replace('/sessions', '').split("/").pop();
    if (!bookId) {
      return NextResponse.json({ error: 'Book ID is required' }, { status: 400 });
    }
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await request.json();
    const { durationMinutes, pagesRead, notes, sessionDate } = body;

    if (!durationMinutes || durationMinutes <= 0) {
      return NextResponse.json({ error: 'Duration must be provided and greater than 0' }, { status: 400 });
    }

    // Create new reading session
    const timestamp = getTimestampFromDate(sessionDate || new Date());
    const sessionData = {
      bookId,
      durationMinutes,
      pagesRead: pagesRead || 0,
      sessionDate: timestamp,
      notes: notes || ''
    };

    const sessionRef = await adminDB
      .collection('users')
      .doc(userId)
      .collection('books')
      .doc(bookId)
      .collection('readingSessions')
      .add(sessionData);

    // Update book progress if pages were read
    if (pagesRead && pagesRead > 0) {
      const bookRef = adminDB.collection('users').doc(userId).collection('books').doc(bookId);
      const bookDoc = await bookRef.get();
      
      if (bookDoc.exists) {
        const currentData = bookDoc.data();
        const currentPage = (currentData?.currentPage || 0) + pagesRead;
        const totalPages = currentData?.totalPages || 0;
        
        // Update current page and status if needed
        let status = currentData?.status || 'reading';
        if (totalPages > 0 && currentPage >= totalPages && status === 'reading') {
          status = 'completed';
        } else if (status === 'notStarted') {
          status = 'reading';
        }

        await bookRef.update({
          currentPage,
          status,
          ...(status === 'reading' && !currentData?.startedAt ? { startedAt: timestamp } : {}),
          ...(status === 'completed' && !currentData?.completedAt ? { completedAt: timestamp } : {})
        });
      }
    }

    return NextResponse.json({ 
      id: sessionRef.id,
      ...sessionData,
      message: 'Reading session added successfully'
    });

  } catch (error) {
    console.error('Error adding reading session:', error);
    return NextResponse.json({ error: 'Failed to add reading session' }, { status: 500 });
  }
}
