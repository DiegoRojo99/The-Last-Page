'use client';

import React, { useEffect, useMemo, useState } from "react";
import BookshelfTabs from "./BookshelfTabs";
import AddBookButton from "./AddBookButton";
import { AddBookModal } from "./AddBookModal";
import { bookStatus, userBook, wishlistBook } from "../utils/types/booksDB";
import { BookCard } from "./BookCard";
import { WishlistCard } from "./WishlistCard";
import { useCurrentUser } from "@/lib/currentUser";
import { Badge, Button, EmptyState, PageHeader, Skeleton, useToast } from "../components/ui";
import { FiArchive, FiBookOpen, FiCheckCircle, FiClock, FiFilter, FiHeart, FiPauseCircle, FiSave, FiTag } from "react-icons/fi";

type SortOption = 'title-asc' | 'title-desc' | 'progress-desc';
type BookshelfPreset = {
  name: string;
  tab: bookStatus | 'wishlist';
  sortBy: SortOption;
  tagFilter: string;
};

const TAG_STORAGE_KEY = 'tlp-book-tags-v1';
const PRESET_STORAGE_KEY = 'tlp-bookshelf-presets-v1';

function BookshelfPageSkeleton() {
  return (
    <div className="app-section">
      <div className="app-container page-stack">
        <div className="surface-elevated px-5 py-6 md:px-7 md:py-7">
          <Skeleton className="h-10 w-56" />
          <Skeleton className="mt-3 h-5 w-96 max-w-full" />
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`stat-skeleton-${i}`} className="surface-paper p-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="mt-3 h-8 w-14" />
            </div>
          ))}
        </div>

        <Skeleton className="h-12 w-full rounded-[var(--radius-lg)]" />

        <div className="surface-elevated p-6">
          <Skeleton className="h-7 w-52" />
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={`card-skeleton-${i}`} className="space-y-2">
                <Skeleton className="h-44 w-full rounded-[var(--radius-md)]" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookshelfPage() {
  const { user, loading } = useCurrentUser();
  const { pushToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [books, setBooks] = useState<userBook[]>([]);
  const [wishlist, setWishlist] = useState<wishlistBook[]>([]);
  const [selectedTab, setSelectedTab] = useState<bookStatus | 'wishlist'>('notStarted');
  const [fetchLoading, setFetchLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('title-asc');
  const [tagFilter, setTagFilter] = useState('all');
  const [bookTags, setBookTags] = useState<Record<string, string[]>>({});
  const [tagInput, setTagInput] = useState('');
  const [presets, setPresets] = useState<BookshelfPreset[]>([]);
  const [presetName, setPresetName] = useState('');
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [bulkStartedAt, setBulkStartedAt] = useState('');
  const [bulkCompletedAt, setBulkCompletedAt] = useState('');

  useEffect(() => {
    try {
      const storedTags = localStorage.getItem(TAG_STORAGE_KEY);
      const storedPresets = localStorage.getItem(PRESET_STORAGE_KEY);

      if (storedTags) {
        const parsedTags = JSON.parse(storedTags) as Record<string, string[]>;
        setBookTags(parsedTags);
      }

      if (storedPresets) {
        const parsedPresets = JSON.parse(storedPresets) as BookshelfPreset[];
        setPresets(parsedPresets);
      }
    } catch (storageError) {
      console.error('Failed to load bookshelf preferences:', storageError);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(TAG_STORAGE_KEY, JSON.stringify(bookTags));
    } catch (storageError) {
      console.error('Failed to save book tags:', storageError);
    }
  }, [bookTags]);

  useEffect(() => {
    try {
      localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presets));
    } catch (storageError) {
      console.error('Failed to save presets:', storageError);
    }
  }, [presets]);

  useEffect(() => {
    if (loading || !user) return;

    async function fetchData() {
      try {
        setFetchLoading(true);
        const token = await user?.getIdToken();
        if (!token) {
          console.error("Failed to retrieve authentication token.");
          return;
        }

        const booksRes = await fetch('/api/user/books', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        const booksData = await booksRes.json();
        setBooks(Array.isArray(booksData) ? booksData : []);

        const wishlistRes = await fetch('/api/user/wishlist', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        const wishlistData = await wishlistRes.json();
        setWishlist(Array.isArray(wishlistData?.wishlist) ? wishlistData.wishlist : []);
      }
      catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setFetchLoading(false);
      }
    }

    fetchData();
  }, [loading, user, refresh]);

  function handleTabChange(tab: bookStatus | 'wishlist') {
    setSelectedTab(tab);
    setSelectedBookIds([]);
  }

  const booksInTab = useMemo(
    () => (selectedTab === 'wishlist' ? [] : books.filter((book) => book.status === selectedTab)),
    [books, selectedTab]
  );

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    Object.values(bookTags).forEach((values) => {
      values.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort((a, b) => a.localeCompare(b));
  }, [bookTags]);

  const filteredBooks = useMemo(() => {
    const byTag = tagFilter === 'all'
      ? booksInTab
      : booksInTab.filter((book) => (bookTags[book.id] || []).includes(tagFilter));

    const sortable = [...byTag];
    if (sortBy === 'title-asc') sortable.sort((a, b) => a.title.localeCompare(b.title));
    else if (sortBy === 'title-desc') sortable.sort((a, b) => b.title.localeCompare(a.title));
    else {
      sortable.sort((a, b) => {
        const progressA = a.totalPages && a.currentPage ? a.currentPage / a.totalPages : 0;
        const progressB = b.totalPages && b.currentPage ? b.currentPage / b.totalPages : 0;
        return progressB - progressA;
      });
    }

    return sortable;
  }, [booksInTab, bookTags, sortBy, tagFilter]);

  const displayItems = selectedTab === 'wishlist' ? wishlist : filteredBooks;

  function handleBookUpdate(updatedBook: userBook) {
    setBooks((prev) => prev.map((book) => (book.id === updatedBook.id ? { ...book, ...updatedBook } : book)));
  }

  const visibleSelectedCount = useMemo(
    () => filteredBooks.filter((book) => selectedBookIds.includes(book.id)).length,
    [filteredBooks, selectedBookIds]
  );

  function toggleBookSelection(bookId: string) {
    setSelectedBookIds((prev) =>
      prev.includes(bookId) ? prev.filter((id) => id !== bookId) : [...prev, bookId]
    );
  }

  function toggleSelectAllVisible() {
    const visibleIds = filteredBooks.map((book) => book.id);
    const allVisibleSelected = visibleIds.every((id) => selectedBookIds.includes(id));

    if (allVisibleSelected) {
      setSelectedBookIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
      return;
    }

    setSelectedBookIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
  }

  async function applyBulkStatus(nextStatus: bookStatus) {
    if (!user || selectedBookIds.length === 0 || selectedTab === 'wishlist') return;

    setIsBulkUpdating(true);
    try {
      const token = await user.getIdToken();
      const results = await Promise.all(
        selectedBookIds.map(async (bookId) => {
          const response = await fetch(`/api/user/books/${bookId}`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: nextStatus }),
          });
          return { bookId, ok: response.ok };
        })
      );

      const failedCount = results.filter((result) => !result.ok).length;
      setBooks((prev) => prev.map((book) => (
        selectedBookIds.includes(book.id)
          ? { ...book, status: nextStatus }
          : book
      )));

      setSelectedBookIds([]);
      if (failedCount > 0) {
        pushToast({
          title: 'Bulk update partially applied',
          description: `${results.length - failedCount} books updated, ${failedCount} failed.`,
          variant: 'warning',
        });
      } else {
        pushToast({
          title: 'Bulk update applied',
          description: `${results.length} books updated successfully.`,
          variant: 'success',
        });
      }

      setRefresh((prev) => !prev);
    } catch (bulkError) {
      console.error('Error applying bulk status:', bulkError);
      pushToast({
        title: 'Bulk update failed',
        description: 'Could not apply the selected action.',
        variant: 'error',
      });
    } finally {
      setIsBulkUpdating(false);
    }
  }

  async function markSelectedCompletedWithDates() {
    if (!user || selectedBookIds.length === 0 || selectedTab === 'wishlist') return;

    if (!bulkCompletedAt) {
      pushToast({
        title: 'Completion date required',
        description: 'Set at least a completed date before applying this action.',
        variant: 'warning',
      });
      return;
    }

    const startedAtDate = bulkStartedAt ? new Date(bulkStartedAt) : null;
    const completedAtDate = new Date(bulkCompletedAt);

    if (startedAtDate && completedAtDate.getTime() < startedAtDate.getTime()) {
      pushToast({
        title: 'Invalid date range',
        description: 'Completed date cannot be earlier than start date.',
        variant: 'warning',
      });
      return;
    }

    setIsBulkUpdating(true);
    try {
      const token = await user.getIdToken();
      const results = await Promise.all(
        selectedBookIds.map(async (bookId) => {
          const response = await fetch(`/api/user/books/${bookId}`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: 'completed',
              startedAt: startedAtDate ? startedAtDate.toISOString() : null,
              completedAt: completedAtDate.toISOString(),
            }),
          });
          return { ok: response.ok };
        })
      );

      const failedCount = results.filter((result) => !result.ok).length;
      const successCount = results.length - failedCount;

      if (successCount > 0) {
        setBooks((prev) => prev.map((book) => (
          selectedBookIds.includes(book.id)
            ? {
                ...book,
                status: 'completed',
                startedAt: startedAtDate ? (startedAtDate as unknown as userBook['startedAt']) : undefined,
                completedAt: (completedAtDate as unknown as userBook['completedAt']),
              }
            : book
        )));
      }

      setSelectedBookIds([]);
      if (failedCount > 0) {
        pushToast({
          title: 'Bulk completion partially applied',
          description: `${successCount} books updated, ${failedCount} failed.`,
          variant: 'warning',
        });
      } else {
        pushToast({
          title: 'Books marked as completed',
          description: `${successCount} selected books were updated with your dates.`,
          variant: 'success',
        });
      }

      setRefresh((prev) => !prev);
    } catch (error) {
      console.error('Error applying completion backfill:', error);
      pushToast({
        title: 'Could not apply completion backfill',
        description: 'Please try again.',
        variant: 'error',
      });
    } finally {
      setIsBulkUpdating(false);
    }
  }

  function addTagToSelectedBooks() {
    const cleanTag = tagInput.trim().toLowerCase();
    if (!cleanTag || selectedBookIds.length === 0) return;

    setBookTags((prev) => {
      const next = { ...prev };
      selectedBookIds.forEach((bookId) => {
        const existing = next[bookId] || [];
        if (!existing.includes(cleanTag)) {
          next[bookId] = [...existing, cleanTag];
        }
      });
      return next;
    });

    setTagInput('');
    pushToast({
      title: 'Tag added',
      description: `Tag applied to ${selectedBookIds.length} selected book(s).`,
      variant: 'success',
    });
  }

  function saveCurrentPreset() {
    const cleanName = presetName.trim();
    if (!cleanName) return;

    const preset: BookshelfPreset = {
      name: cleanName,
      tab: selectedTab,
      sortBy,
      tagFilter,
    };

    setPresets((prev) => {
      const withoutSameName = prev.filter((item) => item.name.toLowerCase() !== cleanName.toLowerCase());
      return [...withoutSameName, preset];
    });
    setPresetName('');
    pushToast({
      title: 'Preset saved',
      description: `Saved preset "${cleanName}".`,
      variant: 'success',
    });
  }

  function applyPreset(name: string) {
    const preset = presets.find((entry) => entry.name === name);
    if (!preset) return;

    setSelectedTab(preset.tab);
    setSortBy(preset.sortBy);
    setTagFilter(preset.tagFilter);
    setSelectedBookIds([]);
  }

  const bookCounts = {
    reading: books.filter((b) => b.status === 'reading').length,
    completed: books.filter((b) => b.status === 'completed').length,
    notStarted: books.filter((b) => b.status === 'notStarted').length,
    abandoned: books.filter((b) => b.status === 'abandoned').length,
    wishlist: wishlist.length,
  };

  const totalBooksInLibrary = books.length;
  const activeReadRatio = totalBooksInLibrary > 0
    ? Math.round((bookCounts.reading / totalBooksInLibrary) * 100)
    : 0;

  const statusCards = [
    {
      key: 'reading',
      label: 'Currently Reading',
      value: bookCounts.reading,
      helper: `${activeReadRatio}% active`,
      icon: FiBookOpen,
      tone: 'text-[var(--color-info)]',
      bg: 'bg-[#eef4ff]'
    },
    {
      key: 'completed',
      label: 'Completed',
      value: bookCounts.completed,
      helper: 'Finished books',
      icon: FiCheckCircle,
      tone: 'text-[var(--color-success)]',
      bg: 'bg-[#ebf8f0]'
    },
    {
      key: 'notStarted',
      label: 'Want to Read',
      value: bookCounts.notStarted,
      helper: 'Ready queue',
      icon: FiClock,
      tone: 'text-[var(--neutral-700)]',
      bg: 'bg-[var(--neutral-100)]'
    },
    {
      key: 'abandoned',
      label: 'Abandoned',
      value: bookCounts.abandoned,
      helper: 'Paused long-term',
      icon: FiPauseCircle,
      tone: 'text-[var(--color-danger)]',
      bg: 'bg-[#fff0ec]'
    },
    {
      key: 'wishlist',
      label: 'Wishlist',
      value: bookCounts.wishlist,
      helper: 'Next candidates',
      icon: FiHeart,
      tone: 'text-[var(--color-warning)]',
      bg: 'bg-[#fff6e8]'
    },
  ];

  if (loading) {
    return <BookshelfPageSkeleton />;
  }

  if (!user) {
    return (
      <div className="app-container app-section">
        <div className="mx-auto max-w-2xl">
          <EmptyState
            title="Please Log In"
            description="You need to be logged in to view your bookshelf."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="app-section">
      <div className="app-container page-stack">
        <PageHeader
          title="My Bookshelf"
          description="Manage your library, stay in motion, and keep every reading session in one place."
          action={<AddBookButton handleClick={() => setIsModalOpen(true)} />}
          className="bg-mesh-warm"
        />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {statusCards.map((card) => (
            <div key={card.key} className="surface-paper p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--neutral-500)]">{card.label}</p>
                  <p className="mt-2 text-3xl font-bold text-[var(--neutral-900)]">{card.value}</p>
                  <p className="mt-1 text-xs text-[var(--neutral-600)]">{card.helper}</p>
                </div>
                <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${card.bg} ${card.tone}`}>
                  <card.icon className="text-lg" />
                </span>
              </div>
            </div>
          ))}
        </div>

        <BookshelfTabs selectedTab={selectedTab} onTabChange={handleTabChange} counts={bookCounts} />

        <div className="surface-paper p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-[var(--neutral-500)]">
                <FiFilter />
                View Controls
              </span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortOption)}
                className="h-9 rounded-[var(--radius-md)] border border-[var(--neutral-300)] bg-white px-3 text-sm text-[var(--neutral-700)]"
              >
                <option value="title-asc">Sort: Title A-Z</option>
                <option value="title-desc">Sort: Title Z-A</option>
                <option value="progress-desc">Sort: Progress High-Low</option>
              </select>

              <select
                value={tagFilter}
                onChange={(event) => setTagFilter(event.target.value)}
                className="h-9 rounded-[var(--radius-md)] border border-[var(--neutral-300)] bg-white px-3 text-sm text-[var(--neutral-700)]"
              >
                <option value="all">All tags</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                value={presetName}
                onChange={(event) => setPresetName(event.target.value)}
                placeholder="Preset name"
                className="h-9 w-36 rounded-[var(--radius-md)] border border-[var(--neutral-300)] px-3 text-sm"
              />
              <Button variant="secondary" size="sm" onClick={saveCurrentPreset} className="h-9">
                <FiSave />
                Save Preset
              </Button>
            </div>

            <div>
              <select
                onChange={(event) => {
                  if (event.target.value) {
                    applyPreset(event.target.value);
                    event.target.value = '';
                  }
                }}
                className="h-9 w-full rounded-[var(--radius-md)] border border-[var(--neutral-300)] bg-white px-3 text-sm text-[var(--neutral-700)]"
              >
                <option value="">Apply preset</option>
                {presets.map((preset) => (
                  <option key={preset.name} value={preset.name}>{preset.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {selectedTab !== 'wishlist' ? (
          <div className="surface-paper p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant={multiSelectMode ? 'primary' : 'secondary'}
                onClick={() => {
                  setMultiSelectMode((prev) => !prev);
                  setSelectedBookIds([]);
                }}
              >
                {multiSelectMode ? 'Exit Multi-Select' : 'Multi-Select'}
              </Button>

              {multiSelectMode ? (
                <>
                  <Button size="sm" variant="ghost" onClick={toggleSelectAllVisible}>
                    Toggle Select Visible
                  </Button>
                  <Badge variant="neutral">{visibleSelectedCount} selected</Badge>
                  <Button size="sm" onClick={() => void applyBulkStatus('reading')} disabled={isBulkUpdating || visibleSelectedCount === 0}>Set Reading</Button>
                  <Button size="sm" onClick={() => void applyBulkStatus('completed')} disabled={isBulkUpdating || visibleSelectedCount === 0}>Set Completed</Button>
                  <Button size="sm" onClick={() => void applyBulkStatus('notStarted')} disabled={isBulkUpdating || visibleSelectedCount === 0}>Set To Read</Button>
                  <Button size="sm" variant="secondary" onClick={() => void applyBulkStatus('abandoned')} disabled={isBulkUpdating || visibleSelectedCount === 0}>
                    <FiArchive />
                    Archive
                  </Button>
                </>
              ) : null}
            </div>

            {multiSelectMode ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <input
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  placeholder="Add tag to selected"
                  className="h-9 w-44 rounded-[var(--radius-md)] border border-[var(--neutral-300)] px-3 text-sm"
                />
                <Button size="sm" variant="secondary" onClick={addTagToSelectedBooks} disabled={visibleSelectedCount === 0 || !tagInput.trim()}>
                  <FiTag />
                  Add Tag
                </Button>
                {allTags.slice(0, 8).map((tag) => (
                  <Button key={tag} size="sm" variant="ghost" onClick={() => setTagInput(tag)} className="h-8 text-xs">
                    {tag}
                  </Button>
                ))}
              </div>
            ) : null}

            {multiSelectMode ? (
              <div className="mt-3 rounded-[var(--radius-md)] border border-[var(--neutral-200)] bg-[var(--neutral-50)] p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--neutral-500)]">
                  Backfill Completion Dates
                </p>
                <div className="flex flex-wrap items-end gap-2">
                  <label className="text-xs text-[var(--neutral-600)]">
                    Started at
                    <input
                      type="date"
                      value={bulkStartedAt}
                      onChange={(event) => setBulkStartedAt(event.target.value)}
                      className="mt-1 block h-9 rounded-[var(--radius-md)] border border-[var(--neutral-300)] bg-white px-3 text-sm text-[var(--neutral-700)]"
                    />
                  </label>

                  <label className="text-xs text-[var(--neutral-600)]">
                    Completed at
                    <input
                      type="date"
                      value={bulkCompletedAt}
                      onChange={(event) => setBulkCompletedAt(event.target.value)}
                      className="mt-1 block h-9 rounded-[var(--radius-md)] border border-[var(--neutral-300)] bg-white px-3 text-sm text-[var(--neutral-700)]"
                    />
                  </label>

                  <Button
                    size="sm"
                    onClick={() => void markSelectedCompletedWithDates()}
                    disabled={isBulkUpdating || visibleSelectedCount === 0}
                    className="h-9"
                  >
                    Mark Selected Completed
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="surface-elevated">
          <div className="p-6">
            <h2 className="mb-6 text-2xl text-[var(--neutral-900)]">
              {selectedTab === 'reading' && 'Currently Reading'}
              {selectedTab === 'completed' && 'Completed Books'}
              {selectedTab === 'notStarted' && 'Want to Read'}
              {selectedTab === 'abandoned' && 'Abandoned Books'}
              {selectedTab === 'wishlist' && 'Wishlist'}
              {displayItems.length > 0 && (
                <span className="ml-2 font-normal text-[var(--neutral-500)]">({displayItems.length})</span>
              )}
            </h2>

            {fetchLoading ? (
              <div className="grid grid-cols-2 gap-4 py-2 md:grid-cols-4 lg:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={`book-grid-skeleton-${i}`} className="space-y-2">
                    <Skeleton className="h-44 w-full rounded-[var(--radius-md)]" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : displayItems.length > 0 ? (
              <div className="flex flex-wrap gap-4 justify-start">
                {selectedTab === 'wishlist'
                  ? wishlist.map((book) => (
                      <WishlistCard
                        key={book.id}
                        book={book}
                        onRemoved={() => setRefresh((prev) => !prev)}
                        onMoveToLibrary={() => setRefresh((prev) => !prev)}
                      />
                    ))
                  : filteredBooks.map((book) => (
                      <div key={book.id} className="space-y-2">
                        {multiSelectMode ? (
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border border-[var(--neutral-200)] bg-white px-2 py-1 text-xs text-[var(--neutral-700)]">
                            <input
                              type="checkbox"
                              checked={selectedBookIds.includes(book.id)}
                              onChange={() => toggleBookSelection(book.id)}
                            />
                            Select
                          </label>
                        ) : null}

                        <BookCard
                          book={book}
                          onBookUpdate={handleBookUpdate}
                        />

                        {(bookTags[book.id] || []).length > 0 ? (
                          <div className="flex w-[170px] flex-wrap gap-1">
                            {(bookTags[book.id] || []).map((tag) => (
                              <Badge key={`${book.id}-${tag}`} variant="neutral" className="text-[10px]">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}
              </div>
            ) : (
              <EmptyState
                title={selectedTab === 'wishlist' ? 'No books in your wishlist' : 'No books in this category'}
                description={
                  selectedTab === 'reading'
                    ? 'Start reading a book to see it here.'
                    : selectedTab === 'completed'
                      ? "Books you've finished will appear here."
                      : selectedTab === 'notStarted'
                        ? 'Add books you want to read to see them here.'
                        : selectedTab === 'abandoned'
                          ? "Books you've stopped reading will appear here."
                          : 'Books you want to buy or read later will appear here.'
                }
                action={
                  <Button onClick={() => setIsModalOpen(true)}>
                    {selectedTab === 'wishlist' ? 'Browse Books' : 'Add Your First Book'}
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <AddBookModal
          onClose={() => setIsModalOpen(false)}
          onBookAdded={() => setSelectedTab('notStarted')}
          refreshData={() => setRefresh((prev) => !prev)}
        />
      )}
    </div>
  );
}
