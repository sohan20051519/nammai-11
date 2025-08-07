
import React from 'react';
import { EyeIcon, GlobeAltIcon, DownloadIcon } from './icons';

interface PreviewWindowProps {
  htmlContent: string | null;
  onPublish: () => void;
  t: (key: string, ...args: any[]) => string;
}

export const PreviewWindow: React.FC<PreviewWindowProps> = ({ htmlContent, onPublish, t }) => {
  const handleDownload = () => {
    if (!htmlContent) return;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nammai-preview.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="flex flex-col h-full bg-zinc-900">
      <div className="flex items-center justify-between p-3 border-b border-zinc-800 text-zinc-300 shrink-0">
        <div className="flex items-center gap-3 font-medium">
            <EyeIcon className="w-5 h-5" />
            <span>{t('livePreview')}</span>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={handleDownload}
                disabled={!htmlContent}
                className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <DownloadIcon className="w-4 h-4" />
                {t('download')}
            </button>
            <button 
                onClick={onPublish}
                disabled={!htmlContent}
                className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <GlobeAltIcon className="w-4 h-4" />
                {t('publish')}
            </button>
        </div>
      </div>
      {htmlContent ? (
        <iframe
          key={htmlContent}
          srcDoc={htmlContent}
          title="Live Preview"
          className="w-full h-full border-0 bg-white"
          sandbox="allow-scripts allow-same-origin"
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 text-zinc-600">
          <EyeIcon className="w-16 h-16 mb-4" />
          <h3 className="font-semibold text-zinc-500">{t('previewEmptyTitle')}</h3>
          <p className="max-w-xs mx-auto text-sm">
            {t('previewEmptyMessage')}
          </p>
        </div>
      )}
    </div>
  );
};
