
"use client";

import { Check, ChevronLeft } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

interface Language {
  code: string;
  name: string;
  flag?: string; // Placeholder for flag icon/emoji
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

interface LanguageSelectorProps {
  onBack: () => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onBack }) => {
  const [selectedLanguage, setSelectedLanguage] = React.useState('pt'); // Default to Portuguese

  // In a real app, this would update i18n and potentially a user preference
  const handleSelectLanguage = (code: string) => {
    setSelectedLanguage(code);
    console.log(`Language selected: ${code}`);
    // onBack(); // Optionally close after selection
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-2 border-b">
        <button
          onClick={onBack}
          className={cn(
            "p-2 rounded-md transition-colors",
            "hover:bg-[hsl(var(--app-sidebar-hover-background))] hover:text-[hsl(var(--app-sidebar-foreground))]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-card"
            )}
          aria-label="Back to main menu"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="text-sm font-semibold text-[hsl(var(--app-sidebar-foreground))]">Select Language</h3>
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
              selectedLanguage === lang.code 
                ? 'font-semibold bg-[hsl(var(--app-sidebar-active-background))] text-[hsl(var(--app-sidebar-active-foreground))]'
                : 'text-[hsl(var(--app-sidebar-foreground))] hover:bg-[hsl(var(--app-sidebar-hover-background))] hover:text-[hsl(var(--app-sidebar-foreground))]'
            )}
          >
            <div className="flex items-center gap-2">
              {lang.flag && <span className="text-lg">{lang.flag}</span>}
              <span>{lang.name}</span>
            </div>
            {/* Check icon color will be inherited from button's text color when active */}
            {selectedLanguage === lang.code && <Check className="h-4 w-4" />}
          </button>
        ))}
      </div>
    </div>
  );
};

    