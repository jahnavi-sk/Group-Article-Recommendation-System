import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { CursorGlow } from '@/components/ui/cursor-glow';

export const metadata: Metadata = {
  title: 'RECAP - Recommendation for Academic Authors and Papers',
  description: 'A recommendation system for individuals and groups.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <CursorGlow />
        <main className="relative z-10">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
