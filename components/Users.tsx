'use client';

import React from 'react';
import User from './User';
import useUsers from '@/lib/hooks/useUsers';
import useCurrentUserDocument from '@/lib/hooks/useCurrentUserDocument';

const Users = () => {
  const users = useUsers();
  const currentUserDoc = useCurrentUserDocument();

  if (!currentUserDoc) {
      return <div>Loading users...</div>;
  }

  return (
    <div className="w-full px-5  mt-10">
      <div className="p-1 space-y-3">
        <div className="text-lg font-bold">Znajomi:</div>
        <div className="flex flex-col gap-3">
          {users.map((user) =>
            user.id === currentUserDoc.uid ? null : (
              <User
                key={user.id}
                nick={user.data.nickName}
                firstname={user.data.firstName}
                balance={user.data.balance}
                id={user.id}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;
