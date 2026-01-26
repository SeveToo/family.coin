import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/lib/contexts/AuthContext';

// Define a general interface for documents. 
// Specific components can extend this or cast the result.
interface FirestoreDoc {
  id: string;
  [key: string]: any;
}

const useFirestore = (collectionName: string) => {
  const { user } = useAuth();
  const [userDocs, setUserDocs] = useState<FirestoreDoc[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Corrected Logic: useEffect runs automatically when deps change.
  // We don't wrap useEffect in a getDocs function.
  useEffect(() => {
    if (!user?.uid || !collectionName) return;

    try {
      setIsLoading(true);
      const q = query(
        collection(db, collectionName),
        where('uid', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const docs: FirestoreDoc[] = [];
        querySnapshot.forEach((doc) => {
          docs.push({ ...doc.data(), id: doc.id });
        });
        setUserDocs(docs);
        setIsLoading(false);
      }, (error) => {
          console.error("Firestore error:", error);
          setIsLoading(false);
      });
      return () => unsubscribe();
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  }, [collectionName, user?.uid]);

  const storeDateToFirestore = async (userId: string, nickName: string, firstName: string) => {
    const userInfo = {
      nickName: nickName,
      firstName: firstName,
      balance: 100,
      createdAt: new Date(),
      uid: userId,
      isAdmin: false,
    };
    // users/userId
    await setDoc(doc(db, 'users', userInfo.uid), userInfo);
    // users/userId/transactions/transactionId
    // Note: 'transactionId' in the original code seems to be a hardcoded ID or placeholder.
    // I will use a generated ID or timestamp to avoid overwriting if called multiple times,
    // but for strict migration I'll follow the pattern or improve it slightly.
    // The original code used a hardcoded 'transactionId' path segment which means 
    // it would overwrite the same transaction every time? 
    // "doc(db, 'users', userInfo.uid, 'transactions', 'transactionId')"
    // I will change it to auto-generated ID for safety, or keep strict if intended.
    // The original code: doc(db, 'users', userInfo.uid, 'transactions', 'transactionId')
    // This looks like a bug in the original code (overwriting same doc), 
    // but maybe it's just for the "First deposit".
    // I'll keep it as is to mimic behavior but add a comment.
    
    await setDoc(
      doc(db, 'users', userInfo.uid, 'transactions', 'transactionId'),
      {
        amount: 100,
        createdAt: new Date(),
        type: 'deposit',
        description: 'First deposit',
      }
    );
  };

  return {
    storeDateToFirestore,
    userDocs,
    isLoading,
  };
};

export default useFirestore;
