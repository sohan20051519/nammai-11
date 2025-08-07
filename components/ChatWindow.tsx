
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <div className="flex-1 flex flex-col p-4 bg-zinc-950 overflow-hidden">
      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} onShowToast={onShowToast} t={t} />
        ))}
        {isAiTyping && !messages.some(m => m.isTyping) && (
           <Message message={{ id: 0, sender: Sender.AI, text: '...', isTyping: true }} onShowToast={onShowToast} t={t} />
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-4 pt-4 border-t border-zinc-800">
        <form onSubmit={handleSubmit} className="relative">
          <div className="bg-zinc-800 rounded-lg">
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
              className="w-full bg-transparent text-zinc-200 rounded-lg p-3 pr-14 resize-none focus:outline-none"
              rows={2}
            />
            <div className="flex items-center justify-between p-3 border-t border-zinc-700/60">
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
