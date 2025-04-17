'use client';
import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "../utils/firebase";
import { useRouter } from "next/navigation";
import { User } from "firebase/auth";

const Navbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  return (
    <nav className="bg-gray-800 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">
          <Link href="/">The Last Page</Link>
        </div>
        <div className="space-x-6">
          <Link href="/" className="hover:text-gray-400">
            Home
          </Link>
          {/* <Link href="/dashboard" className="hover:text-gray-400">
            Dashboard
          </Link> */}
          {user ? (
            <>
              <span className="hover:text-gray-400 cursor-pointer" onClick={handleLogout}>
                Logout
              </span>
            </>
          ) : (
            <Link href="/login" className="hover:text-gray-400">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;