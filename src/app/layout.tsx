import type { Metadata } from 'next';
import { Inter as FontSans, Poppins } from 'next/font/google'; // Add Poppins
import './globals.css';

import { cn } from '@/lib/utils';
import { ClientRoot } from '@/components/client-root'; 
import React from 'react';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-geist-sans', // Default sans font for the app
});

// Configure Poppins font for Design System page
const fontPoppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'], // Weights used in design_system_01.html
  variable: '--font-poppins', // CSS variable for Poppins
  display: 'swap',
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
    <html lang="en" suppressHydrationWarning className={cn(fontSans.variable, fontPoppins.variable)}>
      <body
        suppressHydrationWarning
        className={cn(
          'min-h-screen bg-background font-sans antialiased'
        )}
      >
        <ClientRoot>{children}</ClientRoot>
      </body>
    </html>
  );
}