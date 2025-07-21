'use client';
import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { FiMenu, FiX } from "react-icons/fi";

const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setIsMobileMenuOpen(false);
    router.push("/login");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold hover:text-gray-300 transition-colors">
              The Last Page
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6">
            <Link href="/bookshelf" className="hover:text-gray-300 transition-colors px-3 py-2 rounded-md text-sm font-medium">
              Bookshelf
            </Link>
            <Link href="/books" className="hover:text-gray-300 transition-colors px-3 py-2 rounded-md text-sm font-medium">
              Search
            </Link>
            {user ? (
              <button 
                onClick={handleLogout}
                className="hover:text-gray-300 transition-colors px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
              >
                Logout
              </button>
            ) : (
              <Link href="/login" className="hover:text-gray-300 transition-colors px-3 py-2 rounded-md text-sm font-medium">
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-white hover:text-gray-300 focus:outline-none focus:text-gray-300 transition-colors p-2"
            >
              {isMobileMenuOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-700">
            <Link 
              href="/bookshelf" 
              onClick={closeMobileMenu}
              className="block px-3 py-2 rounded-md text-base font-medium hover:text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Bookshelf
            </Link>
            <Link 
              href="/books" 
              onClick={closeMobileMenu}
              className="block px-3 py-2 rounded-md text-base font-medium hover:text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Search
            </Link>
            {user ? (
              <button 
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:text-gray-300 hover:bg-gray-700 transition-colors"
              >
                Logout
              </button>
            ) : (
              <Link 
                href="/login" 
                onClick={closeMobileMenu}
                className="block px-3 py-2 rounded-md text-base font-medium hover:text-gray-300 hover:bg-gray-700 transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;