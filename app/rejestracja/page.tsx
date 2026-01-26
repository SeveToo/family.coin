'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/logowanie');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Przekierowywanie do logowania...</p>
    </div>
  );
}
