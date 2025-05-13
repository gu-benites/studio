"use client";

import { Check, ChevronLeft } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/language-context';

interface LanguageSelectorProps {
  onBack: () => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onBack }) => {
  const { language, setLanguage, languages, isLoading } = useLanguage();

  // Update language in context and database
  const handleSelectLanguage = async (code: string) => {
    if (isLoading) return;
    await setLanguage(code);
    // Optionally close after selection
    // onBack();
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-2 border-b">
        <button
          onClick={onBack}
          className={cn(
            "p-2 rounded-md transition-colors",
            "hover:bg-sidebar-hover hover:text-sidebar-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-card"
            )}
          aria-label="Back to main menu"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="text-sm font-semibold text-sidebar-foreground">Select Language</h3>
        <div className="w-9 h-9" /> {/* Spacer */}
      </div>
      <div className="py-1">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleSelectLanguage(lang.code)}
            className={cn(
              'flex w-full items-center justify-between px-4 py-2.5 text-sm text-left rounded-md transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-card',
              language === lang.code 
                ? 'font-semibold bg-sidebar-active text-sidebar-active-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-hover'
            )}
          >
            <div className="flex items-center gap-2">
              {lang.flag && <span className="text-lg">{lang.flag}</span>}
              <span>{lang.name}</span>
            </div>
            {/* Check icon color will be inherited from button's text color when active */}
            {language === lang.code && <Check className="h-4 w-4" />}
            {isLoading && language === lang.code && (
              <span className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

    