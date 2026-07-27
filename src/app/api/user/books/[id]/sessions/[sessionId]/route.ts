import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDB } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

type SessionPayload = {
  durationMinutes?: number;
  pagesRead?: number;
  notes?: string;
  sessionDate?: Date | string | Timestamp;
};

async function verifyUser(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) throw new Error('Unauthorized');

  const idToken = authHeader.split('Bearer ')[1];
  const decodedToken = await adminAuth.verifyIdToken(idToken);
  return decodedToken.uid;
}

function toTimestamp(value: Date | string | Timestamp | undefined) {
  if (!value) return Timestamp.now();
  if (value instanceof Timestamp) return value;
  if (value instanceof Date) return Timestamp.fromDate(value);

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return Timestamp.now();
  return Timestamp.fromDate(parsed);
}

async function recalculateBookProgress(userId: string, bookId: string) {
  const bookRef = adminDB.collection('users').doc(userId).collection('books').doc(bookId);
  const sessionsRef = bookRef.collection('readingSessions');

  const [bookDoc, sessionsSnapshot] = await Promise.all([bookRef.get(), sessionsRef.get()]);
  if (!bookDoc.exists) return;

  const currentData = bookDoc.data() || {};
  const totalPages = Number(currentData.totalPages || 0);
  const currentStatus = String(currentData.status || 'notStarted');
  const totalPagesRead = sessionsSnapshot.docs.reduce((sum, doc) => {
    const pagesRead = Number(doc.data().pagesRead || 0);
    return sum + (Number.isFinite(pagesRead) ? pagesRead : 0);
  }, 0);

  let nextStatus = currentStatus;
  if (totalPages > 0 && totalPagesRead >= totalPages) nextStatus = 'completed';
  else if (currentStatus !== 'abandoned') nextStatus = totalPagesRead > 0 ? 'reading' : 'notStarted';


  const updateData: {
    currentPage: number;
    status: string;
    startedAt?: Timestamp;
    completedAt?: Timestamp;
  } = {
    currentPage: totalPagesRead,
    status: nextStatus,
  };

  if (nextStatus === 'reading' && !currentData.startedAt) updateData.startedAt = Timestamp.now();
  if (nextStatus === 'completed' && !currentData.completedAt) updateData.completedAt = Timestamp.now();
  await bookRef.update(updateData);
}

function parseIds(req: NextRequest) {
  const parts = req.nextUrl.pathname.split('/').filter(Boolean);
  const sessionsIndex = parts.findIndex((segment) => segment === 'sessions');

  if (sessionsIndex < 1 || sessionsIndex === parts.length - 1) {
    return { bookId: '', sessionId: '' };
  }

  return {
    bookId: parts[sessionsIndex - 1],
    sessionId: parts[sessionsIndex + 1],
  };
}

export async function PUT(req: NextRequest) {
  try {
    const { bookId, sessionId } = parseIds(req);
    if (!bookId || !sessionId) {
      return NextResponse.json({ error: 'Book ID and session ID are required' }, { status: 400 });
    }

    const userId = await verifyUser(req);
    const body = await req.json() as SessionPayload;

    const durationMinutes = Number(body.durationMinutes);
    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      return NextResponse.json({ error: 'Duration must be greater than 0' }, { status: 400 });
    }

    const pagesRead = Number(body.pagesRead || 0);
    if (!Number.isFinite(pagesRead) || pagesRead < 0) {
      return NextResponse.json({ error: 'Pages read must be 0 or greater' }, { status: 400 });
    }

    const sessionRef = adminDB
      .collection('users')
      .doc(userId)
      .collection('books')
      .doc(bookId)
      .collection('readingSessions')
      .doc(sessionId);

    const sessionDoc = await sessionRef.get();
    if (!sessionDoc.exists) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    await sessionRef.update({
      durationMinutes,
      pagesRead,
      notes: body.notes?.trim() || '',
      sessionDate: toTimestamp(body.sessionDate),
    });

    await recalculateBookProgress(userId, bookId);

    return NextResponse.json({ message: 'Session updated successfully' });
  } catch (error) {
    console.error('Error updating reading session:', error);
    return NextResponse.json({ error: 'Failed to update reading session' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { bookId, sessionId } = parseIds(req);
    if (!bookId || !sessionId) {
      return NextResponse.json({ error: 'Book ID and session ID are required' }, { status: 400 });
    }

    const userId = await verifyUser(req);

    const sessionRef = adminDB
      .collection('users')
      .doc(userId)
      .collection('books')
      .doc(bookId)
      .collection('readingSessions')
      .doc(sessionId);

    const sessionDoc = await sessionRef.get();
    if (!sessionDoc.exists) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    await sessionRef.delete();
    await recalculateBookProgress(userId, bookId);

    return NextResponse.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Error deleting reading session:', error);
    return NextResponse.json({ error: 'Failed to delete reading session' }, { status: 500 });
  }
}
