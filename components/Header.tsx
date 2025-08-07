import React from 'react';
import { NammAIIcon } from './icons';
import { Language } from '../types';

interface HeaderProps {
    language: Language;
    onLanguageChange: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({ language, onLanguageChange }) => {
  return (
    <header className="flex items-center justify-between p-3 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm z-10 shrink-0">
      <div className="flex items-center gap-3">
        <NammAIIcon className="w-8 h-8 text-zinc-200" />
        <h1 className="text-xl font-bold text-zinc-200">
          NammAI
        </h1>
      </div>
      <div className="flex items-center gap-2 p-1 bg-zinc-800 rounded-lg">
        <button
            onClick={() => onLanguageChange('kannada')}
            className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                language === 'kannada' ? 'bg-zinc-200 text-zinc-900' : 'text-zinc-400 hover:bg-zinc-700'
            }`}
        >
            Kanglish
        </button>
        <button
            onClick={() => onLanguageChange('english')}
            className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${
                language === 'english' ? 'bg-zinc-200 text-zinc-900' : 'text-zinc-400 hover:bg-zinc-700'
            }`}
        >
            English
        </button>
      </div>
    </header>
  );
};
