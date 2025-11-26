import './globals.css';
import '@/styles/colors.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Valle 360 - Portal Integrado',
  description: 'Plataforma interna e portal do cliente',
  manifest: '/manifest.json',
  themeColor: '#0b1220',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/icons/valle360-icon.png" />
        <link rel="apple-touch-icon" href="/icons/valle360-icon.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
