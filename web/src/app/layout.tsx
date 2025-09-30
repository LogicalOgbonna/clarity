import type {Metadata} from 'next';
import {Urbanist} from 'next/font/google';
import './globals.css';

const urbanist = Urbanist({subsets: ['latin'], variable: '--font-urbanist'});

export const metadata: Metadata = {
  title: 'Clarity',
  description: 'Understand the internet’s fine print before you click “I agree”.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-clarity-cream text-clarity-ink">
      <body className={`${urbanist.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
