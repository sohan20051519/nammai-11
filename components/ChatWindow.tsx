// ChatWindow.tsx
import React, { useState, useRef, useCallback } from 'react';
import { Message, Sender, GenerationMode } from '../types';

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (text: string, file?: { mimeType: string; data: string }) => void;
  isAiTyping: boolean;
  generationMode: GenerationMode;
  setGenerationMode: (mode: GenerationMode) => void;
  onShowToast: (message: string) => void;
  t: (key: string) => string;
  isMobile: boolean;
  expandedCodeBlocks?: Set<number>;
  onToggleCodeBlock?: (messageId: number) => void;
  showCodePreview?: { [key: number]: boolean };
  onToggleCodePreview?: (messageId: number) => void;
  previewHtml?: string | null;
  setPreviewHtml?: (html: string | null) => void;
  hideProfilePhotos?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  onSendMessage,
  isAiTyping,
  generationMode,
  setGenerationMode,
  onShowToast,
  t,
  isMobile,
  expandedCodeBlocks = new Set(),
  onToggleCodeBlock,
  showCodePreview = {},
  onToggleCodePreview,
  previewHtml,
  setPreviewHtml,
  hideProfilePhotos = false
}) => {
  const [inputText, setInputText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [activePreviewMessageId, setActivePreviewMessageId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isAiTyping) return;
    onSendMessage(inputText);
    setInputText('');
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      onShowToast('Please upload a valid image file (JPEG, PNG, GIF, WebP)');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      onShowToast('File size must be less than 5MB');
      return;
    }
    
    setIsUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      onSendMessage(inputText || '', {
        mimeType: file.type,
        data: base64
      });
      
      setInputText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      onShowToast('Error uploading file');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const processMessageText = (text: string, messageId: number) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts: Array<{ type: 'text' | 'code'; content: string; language?: string; index?: number }> = [];
    let lastIndex = 0;
    let match;
    let codeBlockIndex = 0;
    
    while ((match = codeBlockRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index)
        });
      }
      
      parts.push({
        type: 'code',
        content: match[2].trim(),
        language: match[1] || 'text',
        index: codeBlockIndex
      });
      
      lastIndex = match.index + match[0].length;
      codeBlockIndex++;
    }
    
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex)
      });
    }
    
    if (parts.length === 0) {
      parts.push({ type: 'text', content: text });
    }
    
    return parts;
  };

  const copyCodeToClipboard = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      onShowToast('Code copied to clipboard!');
    }).catch(() => {
      onShowToast('Failed to copy code');
    });
  };

  const renderCodeBlock = (code: string, language: string, messageId: number, codeIndex: number) => {
    const isExpanded = expandedCodeBlocks.has(messageId);
    const displayCode = isExpanded ? code : code.split('\n').slice(0, 3).join('\n');
    const isMinimized = !isExpanded && code.split('\n').length > 3;
    
    return (
      <div key={`${messageId}-${codeIndex}`} className="my-4">
        <div className="bg-zinc-800 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-zinc-700 border-b border-zinc-600">
            <span className="text-sm text-zinc-300 font-medium">{language}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyCodeToClipboard(code)}
                className="px-2 py-1 text-xs text-zinc-300 hover:text-white hover:bg-zinc-600 rounded transition-colors"
                title="Copy code"
              >
                📋 Copy
              </button>
              {isMinimized && (
                <button
                  onClick={() => onToggleCodeBlock?.(messageId)}
                  className="px-2 py-1 text-xs text-blue-400 hover:text-blue-300 hover:bg-zinc-600 rounded transition-colors"
                >
                  Click to see full code
                </button>
              )}
              {isExpanded && (
                <button
                  onClick={() => onToggleCodeBlock?.(messageId)}
                  className="px-2 py-1 text-xs text-zinc-400 hover:text-zinc-300 hover:bg-zinc-600 rounded transition-colors"
                >
                  Minimize
                </button>
              )}
            </div>
          </div>
          
          <div className="p-4 overflow-x-auto">
            <pre className="text-sm text-zinc-100">
              <code>{displayCode}</code>
            </pre>
            {isMinimized && (
              <div className="text-zinc-500 text-xs mt-2">
                ... {code.split('\n').length - 3} more lines
              </div>
            )}
          </div>
        </div>
        
        {/* Preview button for HTML code - always visible for HTML blocks */}
        {language === 'html' && (
          <div className="mt-2">
            <button
              onClick={() => {
                if (setPreviewHtml) {
                  setPreviewHtml(code);
                }
                setActivePreviewMessageId(messageId);
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              Preview
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderMessage = (message: Message) => {
    const isUser = message.sender === Sender.USER;
    
    return (
      <div key={message.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        {!isUser && !hideProfilePhotos && (
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">AI</span>
          </div>
        )}
        
        <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser 
            ? 'bg-blue-600 text-white ml-auto' 
            : 'bg-zinc-700 text-zinc-100'
        }`}>
          {message.isTyping ? (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-zinc-400 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-zinc-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-zinc-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap break-words">
              {!isUser ? (
                processMessageText(message.text, message.id).map((part, index) => {
                  if (part.type === 'code') {
                    return renderCodeBlock(part.content, part.language || 'text', message.id, part.index || 0);
                  }
                  return (
                    <span key={index} className="whitespace-pre-wrap">
                      {part.content}
                    </span>
                  );
                })
              ) : (
                message.text
              )}
            </div>
          )}
        </div>
        
        {isUser && !hideProfilePhotos && (
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">U</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-zinc-400">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">AI</span>
              </div>
              <p className="text-lg mb-2">Welcome to NammAI!</p>
              <p className="text-sm">How can I assist you today?</p>
            </div>
          </div>
        ) : (
          messages.map(renderMessage)
        )}
        
        {isAiTyping && (
          <div className="flex gap-3 justify-start mb-4">
            {!hideProfilePhotos && (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-white">AI</span>
              </div>
            )}
            <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-zinc-700 text-zinc-100">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Mode Buttons */}
      <div className="flex items-center gap-2 py-3 justify-center px-2">
        <button
          onClick={() => setGenerationMode('chat')}
          className={`rounded-lg transition-all duration-200 flex items-center group relative ${
            isMobile 
              ? 'px-2 py-2 text-xs flex-1 max-w-[120px] flex-col gap-1'
              : 'px-3 py-1.5 text-sm gap-2'
          } ${
            generationMode === 'chat'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-700 border border-zinc-600'
          }`}
          title="Chat Mode - General conversation and assistance"
        >
          <span className={isMobile ? 'text-sm' : 'text-sm'}>💬</span>
          <span className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>Chat</span>
          {!isMobile && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-zinc-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
              General conversation and assistance
            </div>
          )}
        </button>
        
        <button
          onClick={() => setGenerationMode('code')}
          className={`rounded-lg transition-all duration-200 flex items-center group relative ${
            isMobile 
              ? 'px-2 py-2 text-xs flex-1 max-w-[120px] flex-col gap-1'
              : 'px-3 py-1.5 text-sm gap-2'
          } ${
            generationMode === 'code'
              ? 'bg-green-600 text-white shadow-sm'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-700 border border-zinc-600'
          }`}
          title="Code Mode - Programming and development help"
        >
          <span className={isMobile ? 'text-sm' : 'text-sm'}>⚡</span>
          <span className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>Code</span>
          {!isMobile && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-zinc-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
              Programming and development help
            </div>
          )}
        </button>
        
        <button
          onClick={() => setGenerationMode('slides')}
          className={`rounded-lg transition-all duration-200 flex items-center group relative ${
            isMobile 
              ? 'px-2 py-2 text-xs flex-1 max-w-[120px] flex-col gap-1'
              : 'px-3 py-1.5 text-sm gap-2'
          } ${
            generationMode === 'slides'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-700 border border-zinc-600'
          }`}
          title="Slide Mode - Create presentations and slides"
        >
          <span className={isMobile ? 'text-sm' : 'text-sm'}>📊</span>
          <span className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>Slides</span>
          {!isMobile && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-zinc-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
              Create presentations and slides
            </div>
          )}
        </button>
      </div>
      
      {/* Input Area */}
      <div className="border-t border-zinc-700 bg-zinc-800 p-4">
        <form onSubmit={handleSubmit} className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="w-full bg-zinc-700 text-zinc-100 rounded-xl px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              style={{ minHeight: '48px', maxHeight: '120px' }}
              disabled={isAiTyping || isUploading}
            />
            
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isAiTyping || isUploading}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-zinc-400 hover:text-zinc-100 transition-colors disabled:opacity-50"
              title="Upload image"
            >
              {isUploading ? (
                <div className="w-5 h-5 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              )}
            </button>
          </div>
          
          <button
            type="submit"
            disabled={!inputText.trim() || isAiTyping || isUploading}
            className="bg-blue-600 text-white rounded-xl px-4 py-3 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {isAiTyping ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
      
      {/* Preview Modal */}
      {activePreviewMessageId !== null && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setActivePreviewMessageId(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">HTML Preview</h3>
              <button 
                onClick={() => setActivePreviewMessageId(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <iframe
                srcDoc={previewHtml || ''}
                className="w-full h-full min-h-[500px] border-0"
                sandbox="allow-scripts allow-same-origin allow-popups"
                title="HTML Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};