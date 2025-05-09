"use client"; // Add "use client" for dynamic imports and loading states

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import React from 'react';

const RecipeGenerator = dynamic(() => 
  import('@/components/recipe-generator').then(mod => mod.RecipeGenerator),
  {
    ssr: false, // Assuming RecipeGenerator might be interactive and client-side heavy
    loading: () => (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading Recipe Generator...</p>
      </div>
    )
  }
);

export default function HomePage() {
  const [hasMounted, setHasMounted] = React.useState(false);
  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    // Return the same loading component or a simplified version for initial render
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">Loading Recipe Generator...</p>
      </div>
    );
  }

  return (
      <RecipeGenerator />
  );
}
