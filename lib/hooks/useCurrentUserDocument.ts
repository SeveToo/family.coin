import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/lib/contexts/AuthContext';

interface UserData {
  [key: string]: any;
}

const useCurrentUserDocument = () => {
  const [currentUserDoc, setCurrentUserDoc] = useState<UserData | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCurrentUserDoc = async () => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnapshot = await getDoc(userDocRef);

        if (docSnapshot.exists()) {
          setCurrentUserDoc(docSnapshot.data());
        } else {
          console.log('User document not found');
        }
      }
    };

    fetchCurrentUserDoc();
  }, [user]);

  return currentUserDoc;
};

export default useCurrentUserDocument;
