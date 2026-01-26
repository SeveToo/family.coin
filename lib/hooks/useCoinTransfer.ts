import { useState } from 'react';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/lib/contexts/AuthContext';
import { doc, getDoc, runTransaction } from 'firebase/firestore';

const useCoinTransfer = () => {
  const { user } = useAuth();
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transferCoins = async (toUserId: string, amount: string | number) => {
    if (!user) {
      setError('Nie jesteś zalogowany');
      return;
    }

    try {
      // Round to 2 decimal places to prevent floating point errors
      const numericAmount = Math.round(Number(amount) * 100) / 100;

      if (isNaN(numericAmount) || numericAmount <= 0) {
        setError('Podano niepoprawną ilość monet');
        return;
      }

      const currentUserDocRef = doc(db, 'users', user.uid);
      const currentUserDocSnapshot = await getDoc(currentUserDocRef);
      const currentUserData = currentUserDocSnapshot.data();

      if (!currentUserData || currentUserData.balance < numericAmount) {
        setError('Brak wystarczających środków na koncie');
        return;
      }

      setIsTransferring(true);
      setError(null); // Clear previous errors

      const fromUserRef = doc(db, 'users', user.uid);
      const toUserRef = doc(db, 'users', toUserId);

      await runTransaction(db, async (transaction) => {
        const fromUserDoc = await transaction.get(fromUserRef);
        const toUserDoc = await transaction.get(toUserRef);

        const fromUserData = fromUserDoc.data();
        const toUserData = toUserDoc.data();

        if (!fromUserData || !toUserData) {
            throw new Error("User data not found");
        }

        if (fromUserData.balance >= numericAmount) {
          transaction.update(fromUserRef, {
            balance: fromUserData.balance - numericAmount,
          });
          transaction.update(toUserRef, {
            balance: Number(toUserData.balance) + Number(numericAmount),
          });
        } else {
          throw new Error('Insufficient funds');
        }
      });

      setIsTransferring(false);
      // Optional: Return success
    } catch (error) {
      console.error('Problem z transferem:', error);
      setError('Problem z transferem');
      setIsTransferring(false);
    }
  };

  return { transferCoins, isTransferring, error };
};

export default useCoinTransfer;
