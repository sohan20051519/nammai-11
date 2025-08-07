import React, { useState, useRef, useEffect } from 'react';
import { Message as MessageType, Sender, GenerationMode } from '../types';
import { Message } from './Message';
import { SendIcon, PaperclipIcon, XIcon } from './icons';
import { GenerationModeSelector } from './GenerationModeSelector';

interface ChatWindowProps {
  messages: MessageType[];
  onSendMessage: (text: string, file?: { mimeType: string; data: string }) => void;
  isAiTyping: boolean;
  generationMode: GenerationMode;
  setGenerationMode: (mode: GenerationMode) => void;
  onShowToast: (message: string) => void;
  t: (key: string, ...args: any[]) => string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSendMessage, isAiTyping, generationMode, setGenerationMode, onShowToast, t }) => {
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isMobile = window.innerWidth < 640;

  const getPlaceholder = () => {
    switch(generationMode) {
      case 'image': return t('imagePlaceholder');
      case 'slides': return t('slidesPlaceholder');
      default: return t('chatPlaceholder');
    }
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAiTyping]);

  useEffect(() => {
    if (generationMode !== 'chat') {
        handleRemoveFile(); // Disallow file uploads when not in chat/analysis mode
    }
  }, [generationMode]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        if (!selectedFile.type.startsWith('image/')) {
            alert(t('imageOnlyError'));
            if(fileInputRef.current) fileInputRef.current.value = "";
            return;
        }
        setFile(selectedFile);
        setGenerationMode('chat'); // Force back to chat mode for analysis
        setShowDropdown(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !file) return;

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = (reader.result as string).split(',')[1];
        onSendMessage(inputText, { mimeType: file.type, data: base64Data });
        setInputText('');
        handleRemoveFile();
      };
      reader.readAsDataURL(file);
    } else {
      onSendMessage(inputText);
      setInputText('');
    }
  };
  
  const showFileInput = generationMode === 'chat';

  return (
    <div className={`flex-1 flex flex-col ${isMobile ? 'p-0 bg-zinc-800' : 'p-4 bg-zinc-950'} overflow-hidden`}>
      <div 
        className={`flex-1 ${isMobile ? 'pr-0 chat-messages' : 'pr-2'} space-y-6 ${isMobile ? 'p-4' : ''}`} 
        style={{ 
          overflowY: 'auto',
          scrollbarWidth: isMobile ? 'none' : 'auto',
          msOverflowStyle: isMobile ? 'none' : 'auto'
        }}
      >
        {/* Hide scrollbar on mobile */}
        {isMobile && (
          <style dangerouslySetInnerHTML={{
            __html: `
              .chat-messages::-webkit-scrollbar {
                display: none;
              }
            `
          }} />
        )}
        
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} onShowToast={onShowToast} t={t} />
        ))}
        {isAiTyping && !messages.some(m => m.isTyping) && (
           <Message message={{ id: 0, sender: Sender.AI, text: '...', isTyping: true }} onShowToast={onShowToast} t={t} />
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className={`${isMobile ? 'p-4' : 'mt-4 pt-4'} ${isMobile ? '' : 'border-t border-zinc-800'}`}>
        <form onSubmit={handleSubmit} className="relative">
          <div className={`${isMobile ? 'bg-zinc-700' : 'bg-zinc-800'} rounded-lg`}>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder={getPlaceholder()}
              className={`w-full bg-transparent text-zinc-200 rounded-lg p-3 ${isMobile ? 'pr-10' : 'pr-14'} resize-none focus:outline-none`}
              rows={isMobile ? 1 : 2}
              style={{
                maxHeight: isMobile ? '40px' : 'auto',
                overflow: 'hidden'
              }}
            />
            
            <div className={`flex items-center justify-between p-3 ${isMobile ? '' : 'border-t border-zinc-700/60'}`}>
              {isMobile ? (
                // Mobile: Dropdown menu for buttons
                <div className="flex items-center gap-2 relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="p-2 text-zinc-400 hover:text-zinc-100 transition-colors bg-zinc-600 rounded-full"
                    aria-label="Options"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                  
                  {file && (
                    <div className="flex items-center gap-2 bg-zinc-600 pl-2 pr-1 py-1 rounded-md max-w-[120px] animate-in fade-in duration-300">
                      <span className="text-xs text-zinc-300 truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="text-zinc-400 hover:text-zinc-100 shrink-0"
                        aria-label={t('removeFile')}
                      >
                        <XIcon className="w-3 h-3"/>
                      </button>
                    </div>
                  )}

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div className="absolute bottom-full left-0 mb-2 bg-zinc-700 rounded-lg shadow-lg border border-zinc-600 min-w-[200px] z-50">
                      <div className="p-2">
                        {/* File Attachment Option */}
                        {showFileInput && (
                          <>
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileChange}
                              className="hidden"
                              accept="image/*"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                fileInputRef.current?.click();
                                setShowDropdown(false);
                              }}
                              className="w-full flex items-center gap-2 p-2 text-zinc-300 hover:bg-zinc-600 rounded transition-colors"
                            >
                              <PaperclipIcon className="w-4 h-4" />
                              <span className="text-sm">{t('attachFile')}</span>
                            </button>
                          </>
                        )}
                        
                        {/* Generation Mode Selector */}
                        <div className="border-t border-zinc-600 mt-2 pt-2">
                          <div className="text-xs text-zinc-400 mb-2 px-2">Generation Mode</div>
                          <div className="space-y-1">
                            {(['chat', 'image', 'slides'] as GenerationMode[]).map((mode) => (
                              <button
                                key={mode}
                                type="button"
                                onClick={() => {
                                  setGenerationMode(mode);
                                  setShowDropdown(false);
                                }}
                                className={`w-full text-left p-2 text-sm rounded transition-colors ${
                                  generationMode === mode 
                                    ? 'bg-zinc-600 text-zinc-100' 
                                    : 'text-zinc-300 hover:bg-zinc-600'
                                }`}
                              >
                                {mode === 'chat' && '💬 Chat'}
                                {mode === 'image' && '🖼️ Image'}
                                {mode === 'slides' && '📊 Slides'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Desktop: Original layout
                <div className="flex items-center gap-1">
                  {showFileInput && (
                    <>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-zinc-400 hover:text-zinc-100 transition-colors"
                        aria-label={t('attachFile')}
                      >
                        <PaperclipIcon className="w-5 h-5" />
                      </button>
                      {file && (
                        <div className="flex items-center gap-2 bg-zinc-700 pl-2 pr-1 py-1 rounded-md max-w-[120px] animate-in fade-in duration-300">
                          <span className="text-xs text-zinc-300 truncate">{file.name}</span>
                          <button
                            type="button"
                            onClick={handleRemoveFile}
                            className="text-zinc-400 hover:text-zinc-100 shrink-0"
                            aria-label={t('removeFile')}
                          >
                            <XIcon className="w-4 h-4"/>
                          </button>
                        </div>
                      )}
                    </>
                  )}
                  <GenerationModeSelector
                    currentMode={generationMode}
                    onModeChange={setGenerationMode}
                    t={t}
                  />
                </div>
              )}
              
              <button
                type="submit"
                className="bg-zinc-200 hover:bg-zinc-300 text-zinc-900 rounded-full p-2 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed transition-colors"
                disabled={(!inputText.trim() && !file) || isAiTyping}
              >
                <SendIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
