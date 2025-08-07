import React, { useState, useCallback } from 'react';
import { CodeBracketIcon, ClipboardIcon } from './icons';

interface CodeBlockProps {
  language: string;
  code: string;
  onCopy: (code: string) => void;
  t: (key: string, ...args: any[]) => string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, code, onCopy, t }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopy = useCallback(() => {
    onCopy(code);
  }, [code, onCopy]);

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full flex items-center gap-3 my-2 p-3 rounded-lg bg-zinc-900 hover:bg-zinc-950 transition-colors text-left"
      >
        <CodeBracketIcon className="w-5 h-5 text-zinc-400 shrink-0" />
        <div className="flex-1">
          <p className="font-semibold text-zinc-200">{t('codeBlockTitle')}</p>
          <p className="text-sm text-zinc-400">{t('codeBlockDescription', language || 'unknown')}</p>
        </div>
      </button>
    );
  }

  return (
    <div className="my-2 bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800">
      <div className="flex justify-between items-center p-2 bg-zinc-900">
        <span className="text-xs font-semibold text-zinc-400 uppercase">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 text-xs rounded-md text-zinc-300 hover:bg-zinc-800 transition-colors"
        >
          <ClipboardIcon className="w-4 h-4" />
          {t('copyCode')}
        </button>
      </div>
      <pre className="p-4 text-sm overflow-x-auto text-zinc-200 bg-zinc-950">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
};
