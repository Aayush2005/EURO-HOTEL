import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Euro Hotel — Admin',
  description: 'Euro Hotel Admin Panel',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-charcoal-700 antialiased">{children}</body>
    </html>
  );
}
