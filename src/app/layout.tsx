import type { Metadata } from 'next';
import './globals.css';
import '@pollar/react/styles.css';
import { PollarProvider } from '@pollar/react';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';

export const metadata: Metadata = {
  title: 'AYNI — Protocolo Global P2P de Crowdshipping, Comercio & Herencias Cripto',
  description: 'Plataforma descentralizada de logística colaborativa, marketplace de productos nativos y condimentos para la diáspora, y bóvedas de herencia protegidas por Smart Contracts.',
  keywords: ['AYNI', 'crowdshipping', 'remesas', 'P2P', 'marketplace', 'condimentos', 'herencias cripto', 'smart contracts', 'Base L2', 'Web3'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <PollarProvider
          client={{
            apiKey: process.env.NEXT_PUBLIC_POLLAR_API_KEY!,
            stellarNetwork: (process.env.NEXT_PUBLIC_POLLAR_NETWORK as 'mainnet' | 'testnet') || 'testnet',
          }}
        >
          <AuthProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </AuthProvider>
        </PollarProvider>
      </body>
    </html>
  );
}
