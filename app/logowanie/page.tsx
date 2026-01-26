'use client';

import { auth, googleProvider, db } from '@/lib/firebase/config';
import { signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import PublicRoute from '@/components/auth/PublicRoute';

const LoginPage = () => {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user exists in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // Create new account pending approval
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          firstName: user.displayName?.split(' ')[0] || 'User',
          nickName: user.displayName || 'User',
          photoURL: user.photoURL,
          balance: 100, // Starting balance
          createdAt: serverTimestamp(),
          isApproved: false, // Requires admin approval
          isAdmin: false
        });
        
        await signOut(auth);
        setError('Konto utworzone. Oczekuje na zatwierdzenie przez administratora.');
        setLoading(false);
        return;
      }

      const userData = userDocSnap.data();

      if (!userData.isApproved) {
        await signOut(auth);
        setError('Twoje konto nie zostało jeszcze zatwierdzone przez administratora.');
        setLoading(false);
        return;
      }

      // If approved, redirect to home
      router.push('/');

    } catch (err: any) {
      console.error(err);
      setError('Wystąpił błąd logowania: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <PublicRoute>
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold mb-8">Family Coin</h1>
            <p className="py-6 text-xl">
              Zaloguj się kontem Google, aby zarządzać swoimi coinami.
            </p>
            
            {error && (
              <div className="alert alert-error mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>{error}</span>
              </div>
            )}

            <button 
              onClick={handleGoogleLogin} 
              className={`btn btn-primary btn-wide text-lg ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Logowanie...' : 'Zaloguj przez Google'}
            </button>
            
            <p className="mt-4 text-sm opacity-70">
              Nowe konta wymagają zatwierdzenia przez administratora.
            </p>
          </div>
        </div>
      </div>
    </PublicRoute>
  );
};

export default LoginPage;
