import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/lib/providers/query-provider';

export const metadata: Metadata = {
  title: 'Student Portal',
  description: 'Student Portal for Interview Application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

