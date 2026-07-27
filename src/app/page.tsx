import Image from 'next/image';
import Link from 'next/link';
import { FiBook, FiBookmark, FiSearch, FiTrendingUp } from 'react-icons/fi';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui';
import HomeReadingPanels from './components/home/HomeReadingPanels';

export default function Home() {
  return (
    <div className="bg-mesh-warm pb-16">
      <section className="app-section pt-14 md:pt-16">
        <div className="app-container page-stack">
          <div className="surface-elevated bg-noise-soft overflow-hidden px-6 py-10 md:px-10 md:py-12">
            <div className="grid items-center gap-8 md:grid-cols-[1.1fr_0.9fr]">
              <div className="animate-fade-up">
                <p className="mb-3 inline-flex rounded-[var(--radius-pill)] bg-[var(--neutral-100)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--neutral-700)]">
                  Personal Reading OS
                </p>
                <h1 className="text-5xl md:text-6xl">The Last Page</h1>
                <p className="mt-4 max-w-xl text-lg text-[var(--neutral-600)] md:text-xl">
                  Track your reading journey, discover books with intention, and keep your momentum from first chapter to final page.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link href="/bookshelf">
                    <Button size="lg">Open My Bookshelf</Button>
                  </Link>
                  <Link href="/books">
                    <Button variant="secondary" size="lg">Search Books</Button>
                  </Link>
                </div>
              </div>
              <div className="animate-fade-up animate-stagger-1">
                <Image
                  src="/images/undraw_book-lover_m9n3.svg"
                  alt="Reader illustration"
                  width={800}
                  height={622}
                  priority
                  className="mx-auto h-auto w-[430px] max-w-full"
                />
              </div>
            </div>
          </div>

          <HomeReadingPanels />

          <div className="app-section pb-0">
            <div className="mb-8 text-center">
              <h2 className="text-4xl md:text-5xl">Everything you need to track your reading</h2>
              <p className="mx-auto mt-2 max-w-2xl text-[var(--neutral-600)]">
                A focused workspace for discovery, progress, and reflection.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <Card className="animate-fade-up">
                <CardHeader>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#ffece4] text-[var(--color-accent)]">
                    <FiBook className="text-xl" />
                  </span>
                  <CardTitle className="mt-4">Personal Library</CardTitle>
                  <CardDescription>Organize your books with clear statuses and custom reading flow.</CardDescription>
                </CardHeader>
              </Card>

              <Card className="animate-fade-up animate-stagger-1">
                <CardHeader>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#e7faf7] text-[var(--color-teal)]">
                    <FiSearch className="text-xl" />
                  </span>
                  <CardTitle className="mt-4">Discovery</CardTitle>
                  <CardDescription>Search millions of books and bring them into your system instantly.</CardDescription>
                </CardHeader>
              </Card>

              <Card className="animate-fade-up animate-stagger-2">
                <CardHeader>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#eef3ff] text-[var(--color-info)]">
                    <FiBookmark className="text-xl" />
                  </span>
                  <CardTitle className="mt-4">Reading States</CardTitle>
                  <CardDescription>Move from planning to completion with less friction and better focus.</CardDescription>
                </CardHeader>
              </Card>

              <Card className="animate-fade-up animate-stagger-3">
                <CardHeader>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#fff5e8] text-[var(--color-warning)]">
                    <FiTrendingUp className="text-xl" />
                  </span>
                  <CardTitle className="mt-4">Progress Insights</CardTitle>
                  <CardDescription>See your consistency and pace with meaningful, actionable stats.</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>

          <Card className="surface-elevated animate-fade-up">
            <CardContent className="py-8 text-center md:py-10">
              <h2 className="text-4xl">Start your reading journey today</h2>
              <p className="mx-auto mt-3 max-w-2xl text-[var(--neutral-600)]">
                Build your personalized reading command center and keep every session moving you forward.
              </p>
              <div className="mt-6">
                <Link href="/bookshelf">
                  <Button size="lg">Get Started</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <footer className="surface-paper border border-[var(--neutral-200)] bg-white/85 px-6 py-6 text-center text-sm text-[var(--neutral-500)]">
            <p className="font-medium text-[var(--neutral-700)]">The Last Page</p>
            <p className="mt-1">© 2026. Built for book lovers, by book lovers.</p>
          </footer>
        </div>
      </section>
    </div>
  );
}
