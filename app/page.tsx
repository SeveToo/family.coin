'use client';

import React, { useState } from 'react';
import Wallet from '@/components/Wallet';
import Nav from '@/components/Nav';
import Users from '@/components/Users';
import TransactionHistory from '@/components/TransactionHistory';
import useCurrentUserDocument from '@/lib/hooks/useCurrentUserDocument';
import PrivateRoute from '@/components/auth/PrivateRoute';

const Home = () => {
  const currentUserDoc = useCurrentUserDocument();
  const [activeTab, setActiveTab] = useState<'users' | 'history'>('users');

  return (
    <PrivateRoute>
      <div className="min-h-screen w-full max-w-xl flex mx-auto flex-col items-center py-5 px-4 pb-32">
        <div className="w-full text-center mb-6">
          <h2 className="text-2xl font-black">Witaj, {currentUserDoc?.nickName}! 👋</h2>
        </div>

        <Wallet />

        <div className="tabs tabs-boxed w-full mt-6 mb-6">
          <button 
            className={`tab flex-1 ${activeTab === 'users' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Przelej 💸
          </button>
          <button 
            className={`tab flex-1 ${activeTab === 'history' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            Historia 📜
          </button>
        </div>

        {activeTab === 'users' ? (
          <Users />
        ) : (
          <TransactionHistory />
        )}
      </div>
      <Nav />
    </PrivateRoute>
  );
};

export default Home;
