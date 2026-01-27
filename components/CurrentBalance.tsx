'use client';

import { useState, useEffect } from 'react';
import useUserBalance from '@/lib/hooks/useUserBalance';
import { formatBalance } from '@/lib/utils';

const CurrentBalance = () => {
  const userBalance = useUserBalance();
  const [displayBalance, setDisplayBalance] = useState(userBalance);

  useEffect(() => {
    const duration = 500; // ms
    const startTime = performance.now();
    const startValue = displayBalance;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function: easeOutQuart
      const ease = 1 - Math.pow(1 - progress, 4);
      
      const currentValue = startValue + (userBalance - startValue) * ease;
      setDisplayBalance(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [userBalance]);

  return (
    <div className="stats bg-base-100 text-base-content w-full shadow-xl border border-base-300">
      <div className="stat overflow-hidden relative">
        <div className="stat-title opacity-70">Obecnie posiadasz:</div>
        <div className="stat-value text-primary transition-all duration-300">
          {formatBalance(displayBalance)}
          <span className="mx-2 text-lg font-medium opacity-80">
            Family coiny 👑
          </span>
        </div>
        {/* Subtle background glow when balance changes */}
        <div className={`absolute inset-0 bg-primary/5 transition-opacity duration-1000 ${displayBalance !== userBalance ? 'opacity-100' : 'opacity-0'}`}></div>
      </div>
    </div>
  );
};

export default CurrentBalance;
