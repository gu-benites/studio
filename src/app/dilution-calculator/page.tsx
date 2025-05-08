
"use client";

import type { NextPage } from 'next';
import Head from 'next/head';
import React from 'react';
import { DilutionCalculatorLayout } from '@/components/dilution-calculator/DilutionCalculatorLayout';

const DilutionCalculatorPage: NextPage = () => {
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
        <DilutionCalculatorLayout />
      </div>
    </>
  );
};

export default DilutionCalculatorPage;
