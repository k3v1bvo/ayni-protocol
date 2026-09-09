import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'AYNI / MINKA — Plataforma P2P de Crowdshipping y Comercio',
  description: 'Ecosistema descentralizado de logística colaborativa, marketplace de artesanías y remesas seguras. Buildathon ETH Bolivia 2026.',
  keywords: ['crowdshipping', 'remesas', 'P2P', 'marketplace', 'artesanías', 'Bolivia', 'Base L2', 'Web3'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
