import React from 'react';
import Modal from './Modal';

interface UserProps {
  nick?: string;
  firstname?: string;
  balance?: number;
  id: string;
}

const User = ({ nick = 'Nazwa', firstname = 'Imię', balance = 0, id }: UserProps) => {
  return (
    <div className="flex justify-between items-center p-4 rounded-2xl bg-base-200">
      <div className="flex items-center gap-4 pl-4">
        <div className="text-primary font-bold">{firstname}</div>
        <div>{nick}</div>
        <div>
          <span className="text-primary font-bold">{balance}</span>Æ
        </div>
      </div>
      <Modal id={id} nick={nick} />
    </div>
  );
};

export default User;
