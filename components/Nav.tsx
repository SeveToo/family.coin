'use client';

import { signOut } from 'firebase/auth';
import React from 'react';
import { auth } from '@/lib/firebase/config';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import ThemeSwitch from './ThemeSwitch';
import useCurrentUserDocument from '@/lib/hooks/useCurrentUserDocument';

const Nav = () => {
  const router = useRouter();
  const pathname = usePathname();
  const currentUserDoc = useCurrentUserDocument();

  const logout = () => {
    signOut(auth)
      .then(() => {
        console.log('signout successful');
        router.push('/logowanie');
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const menuItems = [
    { name: 'Sklep', href: '/shop', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
    { name: 'Przelew', href: '/', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg> },
    { name: 'Praca', href: '/earn', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { name: 'Zasady', href: '/rules', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
  ];

  if (currentUserDoc?.isAdmin) {
    menuItems.push({ 
      name: 'Panel', 
      href: '/admin', 
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> 
    });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 w-full p-2 sm:p-4 sm:bottom-4 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:max-w-lg">
      <div className="navbar bg-base-300/90 backdrop-blur-md rounded-2xl sm:rounded-box shadow-2xl min-h-0 py-1 px-1 flex justify-between items-center gap-0.5 border border-white/5">
        {/* Left: Theme Switch */}
        <div className="flex-none">
          <ThemeSwitch />
        </div>

        {/* Center: Menu */}
        <div className="flex-1 flex justify-center overflow-x-auto custom-scrollbar">
          <ul className="menu menu-horizontal p-0 gap-0.5 flex-nowrap">
            {menuItems.map((item) => (
              <li key={item.href} className="flex-1 min-w-[50px]">
                <Link 
                  href={item.href} 
                  className={`flex flex-col items-center gap-1 p-2 sm:px-4 sm:py-3 text-[9px] sm:text-xs leading-tight rounded-xl transition-all active:scale-95 ${pathname === item.href ? 'bg-primary text-primary-content font-bold shadow-lg' : 'hover:bg-base-200'}`}
                >
                  {item.icon}
                  <span className="xs:block truncate">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Logout */}
        <div className="flex-none">
          <button onClick={logout} className="btn btn-ghost btn-circle btn-sm text-error hover:bg-error/10" title="Wyloguj">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Nav;
