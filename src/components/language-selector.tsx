
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
          className="p-2 rounded-md hover:bg-muted"
          aria-label="Back to main menu"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="text-sm font-semibold">Select Language</h3>
        <div className="w-9 h-9" /> {/* Spacer */}
      </div>
      <div className="py-1">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleSelectLanguage(lang.code)}
            className={cn(
              'flex w-full items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-muted',
              selectedLanguage === lang.code && 'font-semibold'
            )}
          >
            <div className="flex items-center gap-2">
              {lang.flag && <span className="text-lg">{lang.flag}</span>}
              <span>{lang.name}</span>
            </div>
            {selectedLanguage === lang.code && <Check className="h-4 w-4 text-primary" />}
          </button>
        ))}
      </div>
    </div>
  );
};
