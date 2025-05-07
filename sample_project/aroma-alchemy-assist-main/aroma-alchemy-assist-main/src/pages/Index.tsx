
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import MultiStepForm from '@/components/MultiStepForm';
import { FormProvider } from '@/context/FormContext';
import { useIsMobile } from '@/hooks/use-mobile';

const Index: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <FormProvider>
      <Layout>
        <div className="w-full">
          <MultiStepForm />
          
          {/* Add a tiny design system link for developers - this should be removed in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 text-center">
              <Link 
                to="/design-system" 
                className="text-xs text-gray-400 hover:text-primary transition-colors"
              >
                Design System
              </Link>
            </div>
          )}
        </div>
      </Layout>
    </FormProvider>
  );
};

export default Index;
