
"use client";

import type { NextPage } from 'next';
import Head from 'next/head';
import React from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamically import DilutionCalculatorLayout
const DilutionCalculatorLayout = dynamic(() => 
  import('@/components/dilution-calculator/DilutionCalculatorLayout').then(mod => mod.DilutionCalculatorLayout),
  {
    ssr: false, // Assuming this component is client-side heavy or uses browser APIs
    loading: () => (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Loading Calculator...</p>
      </div>
    )
  }
);

const DilutionCalculatorPage: NextPage = () => {
  const [hasMounted, setHasMounted] = React.useState(false);
  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  return (
    <>
      <Head>
        <title>Dilution Calculator - RecipeSage</title>
        <meta name="description" content="Calculate essential oil dilutions accurately." />
      </Head>
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-primary">
            Calculadora de Diluição de Óleos Essenciais
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Calcule com precisão as suas diluições para uso seguro e eficaz.
          </p>
        </header>
        {hasMounted ? <DilutionCalculatorLayout /> : (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-2 text-muted-foreground">Loading Calculator...</p>
          </div>
        )} 
      </div>
    </>
  );
};

export default DilutionCalculatorPage;
