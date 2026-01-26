import React from 'react';
import Modal from './Modal';
import { formatBalance } from '@/lib/utils';

interface UserProps {
  nick?: string;
  firstname?: string;
  balance?: number;
  id: string;
}

const User = ({ nick = 'Nazwa', firstname = 'Imię', balance = 0, id }: UserProps) => {
  return (
    <div className="flex justify-between items-center p-4 rounded-2xl bg-base-200 w-full">
      <div className="flex items-center gap-4 pl-4 min-w-0 flex-1 overflow-hidden">
        <div className="text-primary font-bold truncate max-w-[100px]">{firstname}</div>
        <div className="truncate flex-1 min-w-0">{nick}</div>
        <div className="whitespace-nowrap shrink-0">
          <span className="text-primary font-bold">{formatBalance(balance)}</span>Æ
        </div>
      </div>
      <div className="shrink-0 ml-2">
        <Modal id={id} nick={nick} />
      </div>
    </div>
  );
};

export default User;
