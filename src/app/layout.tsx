
import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import './globals.css';

import { cn } from '@/lib/utils';
import { ClientRoot } from '@/components/client-root'; // Import the new client root component
import React from 'react';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-geist-sans',
});

export const metadata: Metadata = {
  title: 'RecipeSage - AI Powered Recipes',
  description: 'Generate amazing recipes with AI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          fontSans.variable
        )}
      >
        <ClientRoot>{children}</ClientRoot>
      </body>
    </html>
  );
}
