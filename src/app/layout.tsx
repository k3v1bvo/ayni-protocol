import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Navbar } from '@/components/layout/Navbar';

export const metadata: Metadata = {
  title: 'AYNI / MINKA — Ecosistema P2P de Crowdshipping, Comercio y Remesas',
  description: 'Plataforma P2P descentralizada impulsada por Web3 (Base L2) y visión artificial (Google Gemini) para la optimización de equipaje y compras en mostrador.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
