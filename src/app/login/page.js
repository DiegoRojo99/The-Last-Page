'use client';
import { useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '../utils/firebase';
import { FaGoogle } from 'react-icons/fa';
const provider = new GoogleAuthProvider();

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Redirect to home page or dashboard if already logged in
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  async function handleGoogleLogin(){
    try {
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  return (
    <div className="p-4 flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* <h1 className="text-3xl font-semibold mb-6 text-gray-800">Login</h1> */}
      <button
        onClick={handleGoogleLogin}
        className="flex items-center justify-center space-x-3 bg-blue-500 text-white py-2 px-6 rounded-lg shadow-md hover:bg-blue-600 transition-all duration-200"
      >
        <FaGoogle className="text-lg" />
        <span className="text-lg">Login with Google</span>
      </button>
    </div>
  );

}