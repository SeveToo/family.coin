'use client';

import useUserBalance from '@/lib/hooks/useUserBalance';

const CurrentBalance = () => {
  const userBalance = useUserBalance();

  return (
    <div className="stats bg-primary-content text-accent-content w-full shadow-xl">
      <div className="stat">
        <div className="stat-title text-base-content">Obecnie posiadasz:</div>
        <div className="stat-value">
          {userBalance}
          <span className="mx-2 text-base-content text-[1.3rem] font-medium">
            Family coiny 👑
          </span>
        </div>
      </div>
    </div>
  );
};

export default CurrentBalance;
