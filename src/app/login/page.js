'use client';
import { useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '../utils/firebase';
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
    <div className="p-4 flex flex-col items-center justify-center min-h-screen">
      <h1>Login</h1>
      <button onClick={handleGoogleLogin}>Login with Google</button>
    </div>
  );

}