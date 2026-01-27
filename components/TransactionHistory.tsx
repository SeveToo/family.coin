'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import { onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '@/lib/contexts/AuthContext';
import { Transaction } from '@/lib/types';
import { formatBalance } from '@/lib/utils';

const TransactionHistory = ({ type }: { type?: 'transfer' | 'shop' | 'earn' | 'admin' }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setError(null);

    let q = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    if (type) {
      q = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid),
        where('type', '==', type),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs: Transaction[] = [];
      snapshot.forEach((doc) => {
        txs.push({ id: doc.id, ...doc.data() } as Transaction);
      });
      setTransactions(txs);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching transactions:", err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, type]);

  const getTypeBadge = (type: string) => {
    switch(type) {
      case 'shop': return <span className="badge badge-outline badge-xs opacity-70">Sklep</span>;
      case 'transfer': return <span className="badge badge-outline badge-xs opacity-70">Przelew</span>;
      case 'earn': return <span className="badge badge-outline badge-xs opacity-70">Zadanie</span>;
      default: return <span className="badge badge-outline badge-xs opacity-70">Admin</span>;
    }
  };

  if (loading) return <div className="text-center p-8"><span className="loading loading-dots loading-md text-primary"></span></div>;

  if (error) {
    return (
      <div className="alert alert-error shadow-lg mb-4 text-xs sm:text-sm">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <div>
          <h3 className="font-bold">Błąd indeksu Firebase</h3>
          <p>Brakuje indeksu w bazie danych. Historia nie będzie widoczna, dopóki go nie utworzysz.</p>
          <p className="mt-1 opacity-70 text-[10px]">Błąd: {error}</p>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center p-12 opacity-50 bg-base-200/50 rounded-3xl border-2 border-dashed border-base-300">
        <div className="text-4xl mb-2">📜</div>
        <div className="font-medium">Brak historii transakcji</div>
        <div className="text-xs">Twoje operacje pojawią się tutaj.</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {transactions.map((tx) => (
        <div key={tx.id} className="flex justify-between items-center bg-base-200 p-4 rounded-xl border border-base-300 shadow-sm">
          <div className="flex gap-3 items-center">
             <div className={`p-2 rounded-lg ${tx.amount > 0 ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                {tx.amount > 0 ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                  </svg>
                )}
             </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <div className="font-bold text-sm sm:text-base leading-tight">{tx.description}</div>
                {getTypeBadge(tx.type)}
              </div>
              <div className="text-[10px] sm:text-xs opacity-50 font-medium">
                {new Date(tx.createdAt).toLocaleString('pl-PL')}
              </div>
            </div>
          </div>
          <div className={`font-black text-right whitespace-nowrap ${tx.amount > 0 ? 'text-success' : 'text-error'}`}>
            {tx.amount > 0 ? '+' : ''}{formatBalance(tx.amount)} FC
          </div>
        </div>
      ))}
    </div>
  );
};

export default TransactionHistory;
