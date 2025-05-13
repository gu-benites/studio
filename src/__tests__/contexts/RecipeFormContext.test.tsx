// src/__tests__/contexts/RecipeFormContext.test.tsx
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RecipeFormProvider, useRecipeForm } from '@/contexts/RecipeFormContext';

// Mock component that uses the context
const TestComponent = () => {
  const { 
    formData, 
    updateFormData, 
    resetFormData, 
    setCurrentStep,
    setIsLoading,
    setError
  } = useRecipeForm();

  return (
    <div>
      <div data-testid="health-concern">{formData.healthConcern || 'No health concern'}</div>
      <div data-testid="loading-state">{formData.isLoading ? 'Loading' : 'Not loading'}</div>
      <div data-testid="error-state">{formData.error || 'No error'}</div>
      <button 
        data-testid="update-button"
        onClick={() => updateFormData({ healthConcern: 'Headache' })}
      >
        Update Health Concern
      </button>
      <button 
        data-testid="reset-button"
        onClick={resetFormData}
      >
        Reset Form
      </button>
      <button 
        data-testid="set-step-button"
        onClick={() => setCurrentStep('properties-oils')}
      >
        Set Step
      </button>
      <button 
        data-testid="set-loading-button"
        onClick={() => setIsLoading(true)}
      >
        Set Loading
      </button>
      <button 
        data-testid="set-error-button"
        onClick={() => setError('Test error')}
      >
        Set Error
      </button>
    </div>
  );
};

describe('RecipeFormContext', () => {
  beforeEach(() => {
    // Clear session storage before each test
    window.sessionStorage.clear();
  });

  it('provides initial form data', () => {
    render(
      <RecipeFormProvider>
        <TestComponent />
      </RecipeFormProvider>
    );

    expect(screen.getByTestId('health-concern')).toHaveTextContent('No health concern');
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Not loading');
  });

  it('updates form data when updateFormData is called', async () => {
    render(
      <RecipeFormProvider>
        <TestComponent />
      </RecipeFormProvider>
    );

    await userEvent.click(screen.getByTestId('update-button'));
    expect(screen.getByTestId('health-concern')).toHaveTextContent('Headache');
  });

  it('resets form data when resetFormData is called', async () => {
    render(
      <RecipeFormProvider>
        <TestComponent />
      </RecipeFormProvider>
    );

    // First update the data
    await userEvent.click(screen.getByTestId('update-button'));
    expect(screen.getByTestId('health-concern')).toHaveTextContent('Headache');

    // Then reset it
    await userEvent.click(screen.getByTestId('reset-button'));
    expect(screen.getByTestId('health-concern')).toHaveTextContent('No health concern');
  });

  it('sets loading state correctly', async () => {
    render(
      <RecipeFormProvider>
        <TestComponent />
      </RecipeFormProvider>
    );

    await userEvent.click(screen.getByTestId('set-loading-button'));
    expect(screen.getByTestId('loading-state')).toHaveTextContent('Loading');
  });

  it('sets error state correctly', async () => {
    render(
      <RecipeFormProvider>
        <TestComponent />
      </RecipeFormProvider>
    );

    await userEvent.click(screen.getByTestId('set-error-button'));
    expect(screen.getByTestId('error-state')).toHaveTextContent('Test error');
  });

  it('persists data to session storage', async () => {
    const { unmount } = render(
      <RecipeFormProvider>
        <TestComponent />
      </RecipeFormProvider>
    );

    await userEvent.click(screen.getByTestId('update-button'));
    
    // Unmount and remount to test persistence
    unmount();
    
    render(
      <RecipeFormProvider>
        <TestComponent />
      </RecipeFormProvider>
    );

    // Data should be restored from session storage
    expect(screen.getByTestId('health-concern')).toHaveTextContent('Headache');
  });
});
