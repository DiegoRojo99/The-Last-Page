'use client';

import { auth } from "@/lib/firebase";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JSX, useCallback, useEffect, useMemo, useState } from "react";
import { FiAlertCircle, FiArrowRight, FiBookOpen, FiCheck, FiClock, FiGlobe, FiHash, FiLayers, FiPlus, FiRefreshCw } from "react-icons/fi";
import WishlistAction from "@/app/components/WishlistAction";
import { Badge, Button, Card, CardContent, EmptyState, Skeleton, SkeletonText, useToast } from "@/app/components/ui";
import { Book } from "@/app/utils/types/booksAPI";
import { normalizeGoogleBooksImageUrl, sanitizeHtml } from "@/app/utils/common";

interface BookPageProps {
  bookId: string;
}

export default function BookDetails({ bookId }: BookPageProps) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingToShelf, setIsAddingToShelf] = useState(false);
  const [isInShelf, setIsInShelf] = useState(false);
  const [recommendations, setRecommendations] = useState<Book[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const { pushToast } = useToast();

  const fetchBook = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/books/details?id=${bookId}`);
      if (response.ok) {
        const bookDetails = await response.json();
        setBook(bookDetails);
        return;
      }

      if (response.status === 404) {
        notFound();
      }

      const body = await response.json().catch(() => null) as { error?: string } | null;
      setError(body?.error ?? "Failed to fetch book details");
    } catch (requestError) {
      console.error("Error fetching book details:", requestError);
      setError("Error loading book details");
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    if (bookId) {
      void fetchBook();
    }
  }, [bookId, fetchBook]);

  useEffect(() => {
    const loadRecommendations = async () => {
      if (!book?.volumeInfo) {
        setRecommendations([]);
        return;
      }

      const firstCategory = book.volumeInfo.categories?.[0];
      const firstAuthor = book.volumeInfo.authors?.[0];
      const fallbackTerm = book.volumeInfo.title?.split(' ').slice(0, 2).join(' ');
      const searchTerm = firstCategory || firstAuthor || fallbackTerm;

      if (!searchTerm) {
        setRecommendations([]);
        return;
      }

      try {
        setRecommendationsLoading(true);
        const response = await fetch(`/api/books/search?q=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) {
          setRecommendations([]);
          return;
        }

        const data = await response.json() as Book[];
        const nextRecommendations = data
          .filter((item) => item.id !== book.id && item.volumeInfo?.title)
          .slice(0, 6);
        setRecommendations(nextRecommendations);
      } catch (requestError) {
        console.error('Error loading recommendations:', requestError);
        setRecommendations([]);
      } finally {
        setRecommendationsLoading(false);
      }
    };

    void loadRecommendations();
  }, [book]);

  const handleAddToShelf = async () => {
    if (!book?.volumeInfo || isAddingToShelf || isInShelf) return;

    const currentUser = auth.currentUser;
    if (!currentUser) {
      pushToast({
        title: "Login required",
        description: "Please login to add this book to your shelf.",
        variant: "warning",
      });
      window.location.href = "/login";
      return;
    }

    setIsAddingToShelf(true);

    try {
      const token = await currentUser.getIdToken();

      const response = await fetch("/api/user/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: book.id,
          title: book.volumeInfo.title,
          authors: book.volumeInfo.authors || [],
          coverImage: normalizeGoogleBooksImageUrl(book.volumeInfo.imageLinks?.thumbnail),
          status: "notStarted",
          startedAt: null,
          completedAt: null,
          totalPages: book.volumeInfo.pageCount || null,
          currentPage: 0,
          notes: null,
        }),
      });

      if (response.ok || response.status === 409) {
        setIsInShelf(true);
        pushToast({
          title: response.status === 409 ? "Already in library" : "Book added",
          description:
            response.status === 409
              ? "This book is already in your library."
              : `${book.volumeInfo.title} was added to your bookshelf.`,
          variant: response.status === 409 ? "info" : "success",
        });
        return;
      }

      const body = await response.json().catch(() => null) as { error?: string } | null;
      pushToast({
        title: "Could not add book",
        description: body?.error || "Failed to add this book to your shelf.",
        variant: "error",
      });
    } catch (requestError) {
      console.error("Error adding book to shelf:", requestError);
      pushToast({
        title: "Could not add book",
        description: requestError instanceof Error ? requestError.message : "Unexpected error while adding this book.",
        variant: "error",
      });
    } finally {
      setIsAddingToShelf(false);
    }
  };

  const formatPublishedYear = (value?: string) => {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }
    return parsed.getFullYear().toString();
  };

  if (loading) {
    return (
      <div className="app-section">
        <div className="app-container page-stack">
          <section className="surface-elevated overflow-hidden p-5 md:p-7">
            <div className="grid gap-5 md:grid-cols-[220px,1fr] md:gap-7">
              <Skeleton className="h-[320px] w-full rounded-[var(--radius-lg)]" />
              <div className="space-y-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-11 w-11/12" />
                <Skeleton className="h-7 w-2/3" />
                <Skeleton className="h-5 w-1/2" />
                <div className="grid gap-3 sm:grid-cols-3">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Skeleton className="h-11 w-full sm:w-44" />
                  <Skeleton className="h-11 w-full sm:w-44" />
                </div>
              </div>
            </div>
          </section>
          <Card>
            <CardContent className="py-6">
              <SkeletonText lines={7} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-section">
        <div className="app-container">
          <EmptyState
            title="Could not load this book"
            description={error}
            icon={<FiAlertCircle className="text-3xl" />}
            action={
              <Button onClick={() => void fetchBook()} variant="secondary">
                <FiRefreshCw />
                Try Again
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  if (!book || !book.volumeInfo) {
    notFound();
  }

  const { volumeInfo } = book;
  const coverImage = normalizeGoogleBooksImageUrl(volumeInfo.imageLinks?.thumbnail);
  const publishedYear = formatPublishedYear(volumeInfo.publishedDate);

  const detailChips = [
    publishedYear ? { label: "Published", value: publishedYear, icon: <FiClock /> } : null,
    volumeInfo.pageCount ? { label: "Length", value: `${volumeInfo.pageCount} pages`, icon: <FiLayers /> } : null,
    volumeInfo.language ? { label: "Language", value: volumeInfo.language.toUpperCase(), icon: <FiGlobe /> } : null,
  ].filter((chip) => Boolean(chip)) as { label: string; value: string; icon: JSX.Element }[];

  const identifiers = useMemo(() => {
    if (!volumeInfo.industryIdentifiers?.length) {
      return [] as { type: string; identifier: string }[];
    }
    return volumeInfo.industryIdentifiers.filter((entry) => entry.identifier).slice(0, 4);
  }, [volumeInfo.industryIdentifiers]);

  return (
    <div className="app-section">
      <div className="app-container page-stack">
        <section className="surface-elevated relative overflow-hidden bg-mesh-warm p-5 md:p-7">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0.7),rgba(255,255,255,0.2)_45%,rgba(255,255,255,0.8))]" />
          <div className="relative grid gap-6 md:grid-cols-[220px,1fr] md:gap-8">
            <div className="relative mx-auto w-full max-w-[220px] md:mx-0">
              {coverImage ? (
                <Image
                  src={coverImage}
                  alt={volumeInfo.title}
                  width={220}
                  height={320}
                  className="h-[320px] w-full rounded-[var(--radius-lg)] border border-white/70 object-cover shadow-[var(--shadow-lg)]"
                  unoptimized
                />
              ) : (
                <div className="flex h-[320px] w-full items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-[var(--neutral-300)] bg-[var(--neutral-100)] text-[var(--neutral-500)]">
                  <FiBookOpen className="text-4xl" />
                </div>
              )}
            </div>

            <div className="flex min-w-0 flex-col gap-4 md:gap-5">
              <div className="flex flex-wrap gap-2">
                {(volumeInfo.categories || []).slice(0, 3).map((category) => (
                  <Badge key={category} variant="info">
                    {category}
                  </Badge>
                ))}
              </div>

              <div className="space-y-2">
                <h1 className="text-balance text-4xl leading-tight text-[var(--neutral-900)] md:text-5xl">
                  {volumeInfo.title}
                </h1>
                {volumeInfo.subtitle ? (
                  <p className="text-pretty text-lg text-[var(--neutral-700)] md:text-xl">{volumeInfo.subtitle}</p>
                ) : null}
                <p className="text-base text-[var(--neutral-700)] md:text-lg">
                  by {volumeInfo.authors?.join(", ") || "Unknown author"}
                </p>
              </div>

              {detailChips.length ? (
                <div className="grid gap-2 sm:grid-cols-3">
                  {detailChips.map((chip) => (
                    <Card key={chip.label} className="border border-white/60 bg-white/70 backdrop-blur">
                      <CardContent className="flex items-center gap-2 py-3">
                        <span className="text-[var(--neutral-600)]">{chip.icon}</span>
                        <div className="min-w-0">
                          <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--neutral-500)]">{chip.label}</p>
                          <p className="truncate text-sm font-semibold text-[var(--neutral-900)]">{chip.value}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : null}

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button size="lg" onClick={handleAddToShelf} disabled={isAddingToShelf || isInShelf} className="sm:min-w-48">
                  {isInShelf ? (
                    <>
                      <FiCheck />
                      In Your Shelf
                    </>
                  ) : isAddingToShelf ? (
                    "Adding..."
                  ) : (
                    <>
                      <FiPlus />
                      Add To Shelf
                    </>
                  )}
                </Button>

                <div className="inline-flex">
                  <WishlistAction
                    bookId={book.id}
                    title={volumeInfo.title}
                    authors={volumeInfo.authors}
                    coverImage={coverImage}
                    className="h-12 w-12 border-[var(--neutral-300)] bg-white/80 text-[var(--neutral-700)] hover:bg-[var(--neutral-100)]"
                  />
                </div>

                <Link href="/bookshelf">
                  <Button size="lg" variant="secondary" className="sm:min-w-44">
                    Open Bookshelf
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
          <Card>
            <CardContent className="space-y-4 py-6">
              <h2 className="text-3xl text-[var(--neutral-900)]">About This Book</h2>
              {volumeInfo.description ? (
                <div
                  className="prose prose-gray max-w-none text-[var(--neutral-700)] leading-relaxed"
                  dangerouslySetInnerHTML={sanitizeHtml(volumeInfo.description)}
                />
              ) : (
                <p className="italic text-[var(--neutral-500)]">No description available.</p>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardContent className="space-y-4 py-5">
                <h3 className="text-xl text-[var(--neutral-900)]">Details</h3>
                {volumeInfo.publisher ? (
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--neutral-500)]">Publisher</p>
                    <p className="text-sm font-medium text-[var(--neutral-900)]">{volumeInfo.publisher}</p>
                  </div>
                ) : null}
                {publishedYear ? (
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--neutral-500)]">Published</p>
                    <p className="text-sm font-medium text-[var(--neutral-900)]">{publishedYear}</p>
                  </div>
                ) : null}
                {volumeInfo.pageCount ? (
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--neutral-500)]">Pages</p>
                    <p className="text-sm font-medium text-[var(--neutral-900)]">{volumeInfo.pageCount}</p>
                  </div>
                ) : null}
                {volumeInfo.language ? (
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--neutral-500)]">Language</p>
                    <p className="text-sm font-medium text-[var(--neutral-900)]">{volumeInfo.language.toUpperCase()}</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {identifiers.length ? (
              <Card>
                <CardContent className="space-y-3 py-5">
                  <h3 className="text-xl text-[var(--neutral-900)]">Identifiers</h3>
                  {identifiers.map((identifier) => (
                    <div key={`${identifier.type}-${identifier.identifier}`} className="flex gap-2 text-sm">
                      <span className="mt-[1px] text-[var(--neutral-500)]"><FiHash /></span>
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--neutral-500)]">{identifier.type}</p>
                        <p className="truncate font-medium text-[var(--neutral-900)]">{identifier.identifier}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>

        <Card>
          <CardContent className="space-y-4 py-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-2xl text-[var(--neutral-900)]">Similar Books</h3>
              <Link href="/books" className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-accent)] hover:underline">
                Browse more
                <FiArrowRight />
              </Link>
            </div>

            {recommendationsLoading ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={`rec-skeleton-${index}`} className="surface-paper p-3">
                    <Skeleton className="h-40 w-full rounded-[var(--radius-md)]" />
                    <Skeleton className="mt-2 h-4 w-5/6" />
                    <Skeleton className="mt-1 h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {recommendations.map((recommendation) => {
                  const recommendationCover = normalizeGoogleBooksImageUrl(recommendation.volumeInfo?.imageLinks?.thumbnail);
                  return (
                    <Link
                      key={recommendation.id}
                      href={`/books/${recommendation.id}`}
                      className="surface-paper group overflow-hidden p-3 transition-all duration-[var(--motion-fast)] hover:-translate-y-0.5"
                    >
                      <div className="relative overflow-hidden rounded-[var(--radius-md)] bg-[var(--neutral-100)]">
                        {recommendationCover ? (
                          <Image
                            src={recommendationCover}
                            alt={recommendation.volumeInfo.title}
                            width={180}
                            height={230}
                            className="h-44 w-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-44 items-center justify-center text-[var(--neutral-500)]">
                            <FiBookOpen className="text-3xl" />
                          </div>
                        )}
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm font-semibold text-[var(--neutral-900)]">
                        {recommendation.volumeInfo.title}
                      </p>
                      <p className="line-clamp-1 text-xs text-[var(--neutral-600)]">
                        {recommendation.volumeInfo.authors?.join(', ') || 'Unknown author'}
                      </p>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-[var(--neutral-600)]">No recommendations available right now.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}