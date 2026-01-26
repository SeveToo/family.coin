import { useState } from 'react';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/lib/contexts/AuthContext';
import { doc, getDoc, runTransaction } from 'firebase/firestore';

const useCoinTransfer = () => {
  const { user } = useAuth();
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transferCount, setTransferCount] = useState(0);
  const [lastTransferTime, setLastTransferTime] = useState<number>(0);

  const transferCoins = async (toUserId: string, amount: string | number) => {
    if (!user) {
      setError('Nie jesteś zalogowany');
      return;
    }

    // Rate limiting: maximum 5 transfers per minute
    const now = Date.now();
    const oneMinute = 60 * 1000;

    if (now - lastTransferTime > oneMinute) {
      // Reset counter after 1 minute
      setTransferCount(1);
      setLastTransferTime(now);
    } else if (transferCount >= 5) {
      setError('Przekroczono limit transakcji. Spróbuj ponownie za chwilę.');
      return;
    } else {
      setTransferCount(prev => prev + 1);
    }

    // Validate that user is not sending to themselves
    if (toUserId === user.uid) {
      setError('Nie możesz przesłać pieniędzy samemu sobie');
      return;
    }

    try {
      // Round to 2 decimal places to prevent floating point errors
      const numericAmount = Math.round(Number(amount) * 100) / 100;
      
      const MAX_TRANSACTION_LIMIT = 1000;

      if (isNaN(numericAmount) || numericAmount <= 0) {
        setError('Podano niepoprawną ilość monet');
        return;
      }

      if (numericAmount > MAX_TRANSACTION_LIMIT) {
         setError(`Maksymalna kwota przelewu to ${MAX_TRANSACTION_LIMIT}`);
         return;
      }

      const currentUserDocRef = doc(db, 'users', user.uid);
      const currentUserDocSnapshot = await getDoc(currentUserDocRef);
      const currentUserData = currentUserDocSnapshot.data();

      if (!currentUserData || currentUserData.balance < numericAmount) {
        setError('Brak wystarczających środków na koncie');
        return;
      }

      // Validate that recipient exists
      const toUserDocRef = doc(db, 'users', toUserId);
      const toUserDocSnapshot = await getDoc(toUserDocRef);
      if (!toUserDocSnapshot.exists()) {
        setError('Odbiorca nie istnieje');
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
