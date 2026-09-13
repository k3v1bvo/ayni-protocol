'use client';

import React, { useEffect, useState } from 'react';
import '@pollar/react/styles.css';
import { PollarProvider } from '@pollar/react';

const DEFAULT_POLLAR_API_KEY = 'pub_testnet_cd773a3660f401f076b7d8057541a650';

export function PollarClientProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const apiKey = process.env.NEXT_PUBLIC_POLLAR_API_KEY || DEFAULT_POLLAR_API_KEY;
  const stellarNetwork = (process.env.NEXT_PUBLIC_POLLAR_NETWORK as 'mainnet' | 'testnet') || 'testnet';

  // Evita inicializar PollarClient en SSR donde no existen las APIs del navegador
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <PollarProvider
      client={{
        apiKey,
        stellarNetwork,
      }}
    >
      {children}
    </PollarProvider>
  );
}
