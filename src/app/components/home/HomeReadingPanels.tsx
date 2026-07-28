'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useCurrentUser } from '@/lib/currentUser';
import { userBook } from '@/app/utils/types/booksDB';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Skeleton, SkeletonText } from '../ui';
import { FiActivity, FiArrowRight, FiBookOpen, FiClock, FiPlusCircle, FiSearch, FiTrendingUp } from 'react-icons/fi';

type WishlistResponse = {
  wishlist?: Array<{ id: string }>;
};

function progressOf(book: userBook) {
  if (!book.totalPages || !book.currentPage) return 0;
  return Math.min((book.currentPage / book.totalPages) * 100, 100);
}

export default function HomeReadingPanels() {
  const { user, loading } = useCurrentUser();
  const [books, setBooks] = useState<userBook[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [fetchLoading, setFetchLoading] = useState(false);

  useEffect(() => {
    if (loading || !user) return;

    async function fetchHomeData() {
      try {
        setFetchLoading(true);
        const currentUser = user;
        if (!currentUser) return;
        const token = await currentUser.getIdToken();

        const [booksRes, wishlistRes] = await Promise.all([
          fetch('/api/user/books', {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
          fetch('/api/user/wishlist', {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
        ]);

        if (booksRes.ok) {
          const booksData = (await booksRes.json()) as userBook[];
          setBooks(booksData);
        }

        if (wishlistRes.ok) {
          const wishlistData = (await wishlistRes.json()) as WishlistResponse;
          setWishlistCount(wishlistData.wishlist?.length ?? 0);
        }
      } catch (error) {
        console.error('Failed to fetch home panel data:', error);
      } finally {
        setFetchLoading(false);
      }
    }

    fetchHomeData();
  }, [loading, user]);

  const continueReading = useMemo(() => {
    return books
      .filter((book) => book.status === 'reading' || (book.status === 'notStarted' && (book.currentPage ?? 0) > 0))
      .sort((a, b) => (progressOf(b) - progressOf(a)))
      .slice(0, 3);
  }, [books]);

  return (
    <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
      <Card className="animate-fade-up">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Continue Reading</CardTitle>
              <CardDescription>Jump back into your current books with one click.</CardDescription>
            </div>
            <Badge variant="info">
              <FiBookOpen className="mr-1" />
              Live
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading || fetchLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <SkeletonText lines={2} />
            </div>
          ) : !user ? (
            <div className="rounded-[var(--radius-md)] border border-[var(--neutral-200)] bg-[var(--neutral-50)] p-5">
              <p className="text-[var(--neutral-700)]">Sign in to see your reading queue and progress.</p>
              <div className="mt-4">
                <Link href="/login">
                  <Button size="sm">Login to Continue</Button>
                </Link>
              </div>
            </div>
          ) : continueReading.length === 0 ? (
            <div className="rounded-[var(--radius-md)] border border-[var(--neutral-200)] bg-[var(--neutral-50)] p-5">
              <p className="text-[var(--neutral-700)]">No active reads yet. Add your next book and start your first streak.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/books">
                  <Button size="sm">Find a Book</Button>
                </Link>
                <Link href="/bookshelf">
                  <Button size="sm" variant="secondary">Open Bookshelf</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {continueReading.map((book) => {
                const progress = progressOf(book);
                return (
                  <div
                    key={book.id}
                    className="rounded-[var(--radius-md)] border border-[var(--neutral-200)] bg-[var(--color-paper)] p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--neutral-900)]">{book.title}</p>
                        <p className="mt-0.5 truncate text-xs text-[var(--neutral-600)]">
                          {book.authors?.length ? book.authors.join(', ') : 'Unknown author'}
                        </p>
                      </div>
                      <Link href={`/bookshelf/${book.id}`}>
                        <Button size="sm" variant="ghost">
                          Resume
                          <FiArrowRight className="text-xs" />
                        </Button>
                      </Link>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-[var(--neutral-600)]">
                      <span>{book.currentPage ?? 0} / {book.totalPages ?? 0} pages</span>
                      <span>{progress.toFixed(0)}%</span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-[var(--neutral-200)]">
                      <div
                        className="h-2 rounded-full bg-[var(--color-accent)] transition-all duration-[var(--motion-normal)]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="animate-fade-up animate-stagger-1">
        <CardHeader>
          <CardTitle>Next Actions</CardTitle>
          <CardDescription>Quick shortcuts to keep your reading flow moving.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Link href="/books" className="block">
            <Button variant="secondary" fullWidth className="justify-start">
              <FiSearch />
              Discover a New Book
            </Button>
          </Link>
          <Link href="/bookshelf" className="block">
            <Button variant="secondary" fullWidth className="justify-start">
              <FiPlusCircle />
              Add or Organize Books
            </Button>
          </Link>
          <Link href="/stats" className="block">
            <Button variant="secondary" fullWidth className="justify-start">
              <FiTrendingUp />
              Review Progress Stats
            </Button>
          </Link>
          <Link href="/bookshelf" className="block">
            <Button variant="secondary" fullWidth className="justify-start">
              <FiClock />
              Check Wishlist ({wishlistCount})
            </Button>
          </Link>

          <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--neutral-200)] bg-[var(--neutral-50)] p-3 text-sm text-[var(--neutral-700)]">
            <p className="font-semibold text-[var(--neutral-900)]">
              <FiActivity className="mr-1 inline" /> This Week Focus
            </p>
            <p className="mt-1">Aim to move at least 60 pages forward across your active books this week.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
