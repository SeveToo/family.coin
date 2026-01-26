import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useState, useEffect } from 'react';

interface User {
  id: string;
  data: any;
}

const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const fetchedUsers: User[] = [];

      querySnapshot.forEach((doc) => {
        fetchedUsers.push({
          id: doc.id,
          data: doc.data(),
        });
      });

      setUsers(fetchedUsers);
    };

    fetchUsers();
  }, []);

  return users;
};

export default useUsers;
