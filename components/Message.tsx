
import React from 'react';
import { Message as MessageType, Sender } from '../types';
import { NammAIIcon, DownloadIcon } from './icons';
import { CodeBlock } from './CodeBlock';

interface MessageProps {
  message: MessageType;
  onShowToast?: (message: string) => void;
  t: (key: string, ...args: any[]) => string;
}

const TypingIndicator: React.FC = () => (
  <div className="flex items-center gap-1.5">
    <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
    <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
    <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
  </div>
);

export const Message: React.FC<MessageProps> = ({ message, onShowToast, t }) => {
  const isUser = message.sender === Sender.USER;

  const handleDownloadImage = () => {
    if (!message.imageUrl) return;
    const a = document.createElement('a');
    a.href = message.imageUrl;
    a.download = 'nammai-image.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
        if(onShowToast) {
            onShowToast(t('codeCopied'));
        }
    });
  };

  const parseBold = (text: string) => {
    return text.split('**').map((part, index) => 
        index % 2 === 1 ? <strong key={`bold-${index}`}>{part}</strong> : <span key={`bold-txt-${index}`}>{part}</span>
    );
  };

  const renderMessageContent = () => {
    const content = message.text;
    const regex = /(```(?:\w*\n)?[\s\S]*?```)|(\!\[.*?\]\(.*?\))/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={`text-${lastIndex}`}>{parseBold(content.substring(lastIndex, match.index))}</span>);
      }
      
      const codeBlockMatch = match[1];
      const imageMatch = match[2];

      if (codeBlockMatch) {
        const codeBlockRegex = /^```(\w*)\n?([\s\S]*?)```$/;
        const codeParts = codeBlockMatch.match(codeBlockRegex);
        if(codeParts) {
            const language = codeParts[1] || 'text';
            const code = codeParts[2].trim();
            parts.push(<CodeBlock key={`code-${match.index}`} language={language} code={code} onCopy={handleCopyCode} t={t} />);
        }
      } else if (imageMatch) {
        const imageRegex = /\!\[(.*?)\]\((.*?)\)/;
        const imageParts = imageMatch.match(imageRegex);
        if (imageParts) {
            parts.push(<img key={`img-${match.index}`} src={imageParts[2]} alt={imageParts[1]} className="rounded-lg max-w-sm w-full my-2 border border-zinc-700" />);
        }
      }
      
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(<span key={`text-${lastIndex}`}>{parseBold(content.substring(lastIndex))}</span>);
    }

    return parts.length > 0 ? parts : <>{parseBold(content)}</>;
  };

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-xl bg-zinc-200 text-zinc-900 rounded-lg rounded-br-none p-3">
          <p className="whitespace-pre-wrap">{message.text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
        <NammAIIcon className="w-5 h-5 text-zinc-200" />
      </div>
      <div className="max-w-2xl bg-zinc-800 rounded-lg rounded-bl-none">
        <div className="p-3">
          <div className="text-zinc-200 whitespace-pre-wrap">
              {message.isTyping ? <TypingIndicator /> : renderMessageContent()}
          </div>
        </div>
        {message.imageUrl && (
          <div className="p-3 border-t border-zinc-700">
              <img src={message.imageUrl} alt="Generated content" className="rounded-lg max-w-sm w-full" />
              {message.isDownloadable && (
                <button 
                  onClick={handleDownloadImage}
                  className="flex items-center gap-2 mt-3 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-700 hover:bg-zinc-600 rounded-md transition-colors"
                >
                  <DownloadIcon className="w-4 h-4" />
                  {t('downloadImage')}
                </button>
              )}
          </div>
        )}
      </div>
    </div>
  );
};
