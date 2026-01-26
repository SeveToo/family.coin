'use client';

import { signOut } from 'firebase/auth';
import React from 'react';
import { auth } from '@/lib/firebase/config';
import { useRouter } from 'next/navigation';
import ThemeSwitch from './ThemeSwitch';

const Nav = () => {
  const router = useRouter();

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

  return (
    <ul className="shadow-xl fixed bottom-4 left-1/2 transform -translate-x-1/2 menu menu-horizontal bg-base-300 rounded-box mt-6 z-50 gap-2">
      <li>
        <ThemeSwitch />
      </li>
      <li>
        <button onClick={logout}>Wyloguj</button>
      </li>
    </ul>
  );
};

export default Nav;
