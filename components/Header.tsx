import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Language } from '../types';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const Header: React.FC<HeaderProps> = ({ language, onLanguageChange }) => {
  const { user, userProfile, logout } = useAuth();

  return (
    <header className="bg-zinc-800 border-b border-zinc-700 px-4 sm:px-6 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-xl font-bold text-white">N</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">NammAI</h1>
            <p className="text-xs text-zinc-400 hidden sm:block">Your all-rounder AI assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="flex gap-1 p-1 bg-zinc-700 rounded-lg">
            <button
              onClick={() => onLanguageChange('kannada')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                language === 'kannada'
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-600'
              }`}
            >
              Kanglish
            </button>
            <button
              onClick={() => onLanguageChange('english')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                language === 'english'
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-600'
              }`}
            >
              English
            </button>
          </div>

          {/* User Profile */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                {userProfile?.photoURL && (
                  <img 
                    src={userProfile.photoURL} 
                    alt={userProfile.displayName}
                    className="w-8 h-8 rounded-full border-2 border-zinc-600"
                  />
                )}
                <span className="text-zinc-300 text-sm font-medium max-w-32 truncate">
                  {userProfile?.displayName || user.email}
                </span>
              </div>
              <button
                onClick={logout}
                className="px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-700 rounded-lg transition-all duration-200 font-medium"
              >
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sm:hidden">⏻</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
