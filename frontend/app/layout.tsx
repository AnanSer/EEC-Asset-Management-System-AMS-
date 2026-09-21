import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EEC EAMS – Ethiopian Engineering Corporation',
  description:
    'Enterprise Asset Management System for Ethiopian Engineering Corporation',
  keywords: ['EEC', 'Asset Management', 'Ethiopian Engineering', 'EAMS'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
