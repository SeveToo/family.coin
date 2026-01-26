import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/lib/contexts/AuthContext';

const useUserBalance = () => {
  const [balance, setBalance] = useState<number>(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      const data = doc.data();
      setBalance(data?.balance || 0);
    });

    return () => {
      unsubscribe();
    };
  }, [user?.uid]);

  return balance;
};

export default useUserBalance;
