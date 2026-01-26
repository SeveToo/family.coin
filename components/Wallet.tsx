'use client';

import React from 'react';
import CurrentBalance from './CurrentBalance';

const Wallet = () => {
  return (
    <div className="w-full sticky top-0 p-5 pb-0 z-30 ">
      <CurrentBalance />
    </div>
  );
};

export default Wallet;
