import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../translations';
import { Language } from '../types';

export const LoginScreen: React.FC = () => {
  const { signInWithGoogle } = useAuth();
  const [language, setLanguage] = useState<Language>('kannada');
  const [loading, setLoading] = useState(false);

  const t = (key: keyof typeof translations['english']) => {
    return translations[language][key] || translations.english[key];
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-zinc-800 rounded-xl shadow-2xl p-8 border border-zinc-700">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-zinc-600 to-zinc-700 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-zinc-100">N</span>
            </div>
            <h1 className="text-3xl font-bold text-zinc-100 mb-2">NammAI</h1>
            <p className="text-zinc-400">
              {language === 'kannada' 
                ? 'Nimma all-rounder AI assistant' 
                : 'Your all-rounder AI assistant'
              }
            </p>
          </div>

          {/* Language Selector */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setLanguage('kannada')}
              className={`flex-1 px-4 py-2 text-sm rounded-lg transition-colors ${
                language === 'kannada'
                  ? 'bg-zinc-600 text-white'
                  : 'bg-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-600'
              }`}
            >
              Kanglish
            </button>
            <button
              onClick={() => setLanguage('english')}
              className={`flex-1 px-4 py-2 text-sm rounded-lg transition-colors ${
                language === 'english'
                  ? 'bg-zinc-600 text-white'
                  : 'bg-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-600'
              }`}
            >
              English
            </button>
          </div>

          {/* Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {loading ? 'Signing in...' : t('signInWithGoogle')}
          </button>

          {/* Features */}
          <div className="mt-8 pt-6 border-t border-zinc-700">
            <h3 className="text-zinc-300 font-medium mb-3">
              {language === 'kannada' ? 'Features:' : 'Features:'}
            </h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full"></span>
                {language === 'kannada' ? 'Content creation & writing' : 'Content creation & writing'}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full"></span>
                {language === 'kannada' ? 'Image generation' : 'Image generation'}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full"></span>
                {language === 'kannada' ? 'Presentation slides' : 'Presentation slides'}
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full"></span>
                {language === 'kannada' ? 'Code assistance' : 'Code assistance'}
              </li>
            </ul>
          </div>

          <p className="text-xs text-zinc-500 text-center mt-6">
            {t('loginToSave')}
          </p>
        </div>
      </div>
    </div>
  );
};
