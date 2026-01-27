'use client';

import { usePathname } from 'next/navigation';
import Nav from '@/components/Nav';
import PageTransition from '@/components/PageTransition';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/logowanie' || pathname === '/rejestracja';

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-base-100 flex flex-col items-center">
      <main className="w-full max-w-xl px-4 py-5 pb-32">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <Nav />
    </div>
  );
}
