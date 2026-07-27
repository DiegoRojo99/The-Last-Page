'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { FiBookOpen, FiLogIn, FiLogOut, FiMenu, FiSearch, FiTrendingUp, FiX } from "react-icons/fi";
import { cn } from "./ui/cn";

const navigationItems = [
  { href: "/bookshelf", label: "Bookshelf", icon: FiBookOpen },
  { href: "/books", label: "Search", icon: FiSearch },
  { href: "/stats", label: "Stats", icon: FiTrendingUp },
];

const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setIsMobileMenuOpen(false);
    router.push("/login");
  };

  const isActiveRoute = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const linkClass = (active: boolean) =>
    cn(
      "inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-3 py-2 text-sm font-semibold transition-all duration-[var(--motion-fast)] ease-[var(--motion-ease)]",
      active
        ? "bg-[var(--color-accent)] text-white shadow-[var(--shadow-sm)]"
        : "text-[var(--neutral-700)] hover:bg-[var(--neutral-100)] hover:text-[var(--neutral-900)]",
    );

  return (
    <nav className="sticky top-0 z-40 border-b border-[var(--neutral-200)] bg-white/78 backdrop-blur-xl">
      <div className="app-container relative">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="group inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-1 py-1 transition-colors">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-ink)] text-white">
              <FiBookOpen className="text-sm" />
            </span>
            <span className="text-xl text-[var(--neutral-900)] transition-colors group-hover:text-[var(--color-accent)]">
              The Last Page
            </span>
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            {navigationItems.map((item) => {
              const active = isActiveRoute(item.href);
              return (
                <Link key={item.href} href={item.href} className={linkClass(active)}>
                  <item.icon className="text-sm" />
                  {item.label}
                </Link>
              );
            })}
            {user ? (
              <button onClick={handleLogout} className={linkClass(false)}>
                <FiLogOut className="text-sm" />
                Logout
              </button>
            ) : (
              <Link href="/login" className={linkClass(isActiveRoute("/login"))}>
                <FiLogIn className="text-sm" />
                Login
              </Link>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="rounded-[var(--radius-sm)] border border-[var(--neutral-300)] bg-white p-2 text-[var(--neutral-700)] transition-colors hover:text-[var(--neutral-900)]"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <div
          className={cn(
            "absolute left-0 right-0 top-full md:hidden",
            isMobileMenuOpen ? "pointer-events-auto" : "pointer-events-none",
          )}
        >
          <div
            className={cn(
              "app-container origin-top overflow-hidden rounded-b-[var(--radius-lg)] border border-t-0 border-[var(--neutral-200)] bg-[var(--color-paper)] shadow-[var(--shadow-md)] transition-all duration-[var(--motion-normal)] ease-[var(--motion-ease)]",
              isMobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
            )}
          >
            <div className="space-y-1 p-3">
              {navigationItems.map((item) => {
                const active = isActiveRoute(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(linkClass(active), "flex w-full")}
                  >
                    <item.icon className="text-sm" />
                    {item.label}
                  </Link>
                );
              })}
              {user ? (
                <button onClick={handleLogout} className={cn(linkClass(false), "flex w-full")}>
                  <FiLogOut className="text-sm" />
                  Logout
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(linkClass(isActiveRoute("/login")), "flex w-full")}
                >
                  <FiLogIn className="text-sm" />
                  Login
                </Link>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close mobile menu overlay"
            className={cn(
              "fixed inset-0 top-16 -z-10 bg-black/20 transition-opacity duration-[var(--motion-normal)] ease-[var(--motion-ease)]",
              isMobileMenuOpen ? "opacity-100" : "opacity-0",
            )}
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
