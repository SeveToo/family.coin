'use client';

import React from 'react';
import Wallet from '@/components/Wallet';
import Nav from '@/components/Nav';
import Users from '@/components/Users';
import useCurrentUserDocument from '@/lib/hooks/useCurrentUserDocument';
import PrivateRoute from '@/components/auth/PrivateRoute';

const Home = () => {
  const currentUserDoc = useCurrentUserDocument();

  return (
    <PrivateRoute>
      <div className="min-h-screen w-full max-w-xl flex mx-auto flex-col items-center py-20">
        <h2 className="text-xl">Witaj, {currentUserDoc?.nickName}</h2>

        <Wallet />
        <Users />
      </div>
      <Nav />
    </PrivateRoute>
  );
};

export default Home;
