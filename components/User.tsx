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
    <div className="flex justify-between items-center p-3 sm:p-4 rounded-2xl bg-base-200 w-full gap-3 shadow-sm border border-white/5">
      <div className="flex flex-col min-w-0 flex-1">
        <div className="text-primary font-black text-sm sm:text-base leading-tight truncate">
          {firstname}
        </div>
        <div className="text-[10px] sm:text-xs opacity-60 font-medium truncate">
          @{nick}
        </div>
      </div>
      
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <div className="text-primary font-black text-sm sm:text-base">
            {formatBalance(balance)}
          </div>
          <div className="text-[10px] sm:text-xs opacity-40 font-bold uppercase leading-none">
            Monet 🪙
          </div>
        </div>
        <Modal id={id} nick={nick} />
      </div>
    </div>
  );
};

export default User;
