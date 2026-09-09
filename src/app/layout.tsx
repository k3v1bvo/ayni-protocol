import type { Metadata } from 'next';
import './globals.css';
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
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
