import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useState, useEffect } from 'react';

interface User {
  id: string;
  data: any;
}

const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (querySnapshot) => {
      const fetchedUsers: User[] = [];
      querySnapshot.forEach((doc) => {
        fetchedUsers.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      setUsers(fetchedUsers);
    });

    return () => unsubscribe();
  }, []);

  return users;
};

export default useUsers;
