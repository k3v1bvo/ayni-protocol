'use client';

import React, { useEffect, useState } from 'react';
import { WalletButton } from '@pollar/react';

export function PollarWalletButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div style={{ width: 135, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.04)' }} />
    );
  }

  return <WalletButton />;
}
