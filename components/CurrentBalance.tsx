'use client';

import useUserBalance from '@/lib/hooks/useUserBalance';

const CurrentBalance = () => {
  const userBalance = useUserBalance();

  return (
    <div className="stats bg-base-100 text-base-content w-full shadow-xl border border-base-300">
      <div className="stat">
        <div className="stat-title opacity-70">Obecnie posiadasz:</div>
        <div className="stat-value">
          {userBalance}
          <span className="mx-2 text-lg font-medium opacity-80">
            Family coiny 👑
          </span>
        </div>
      </div>
    </div>
  );
};

export default CurrentBalance;
