import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { Sender, Message, ChatSession, GenerationMode, Language } from './types';
import { GoogleGenAI, Chat, Part } from '@google/genai';
import { PreviewWindow } from './components/PreviewWindow';
import { Toast } from './components/Toast';
import { translations } from './translations';

const getInitialMessage = (lang: Language): Message => ({
  id: 1,
  sender: Sender.AI,
  text: translations[lang].initialMessage,
});

const getSystemInstruction = (lang: Language): string => {
  return translations[lang].systemInstruction;
};

const App: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [generationMode, setGenerationMode] = useState<GenerationMode>('chat');
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);
  const [language, setLanguage] = useState<Language>('kannada');
  // Set sidebar/preview open by default on desktop, closed on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [isPreviewOpen, setIsPreviewOpen] = useState(() => window.innerWidth >= 1024);

  // Resizing state
  const [isResizing, setIsResizing] = useState(false);
  const [panelsWidth, setPanelsWidth] = useState({ chat: 60, preview: 40 });
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Memoize ai instance so it's not recreated on every render
  const ai = useMemo(() => {
    // TODO: Replace with your actual API key or a secure way to provide it
    const apiKey = (process.env.API_KEY || (window as any).API_KEY) as string;
    if (!apiKey) {
      // Optionally, handle missing API key error here
      return null;
    }
    return new GoogleGenAI({ apiKey });
  }, []);

  const t = useCallback((key: keyof typeof translations['english'], ...args: any[]): string => {
    const translation = translations[language][key] || translations.english[key];
    if (typeof translation === 'function') {
        return (translation as (...a: any[]) => string)(...args);
    }
    return String(translation);
  }, [language]);

  const activeChat = chatHistory.find(c => c.id === activeChatId);
  const messages = activeChat ? activeChat.messages : [];
  const chat = activeChat ? activeChat.geminiChat : null;

  const handleNewChat = useCallback(() => {
    if (!ai) {
      setError(t('apiKeyError'));
      return;
    }
    try {
      const newChatInstance = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: { systemInstruction: getSystemInstruction(language) },
      });
      const newChatId = Date.now().toString();
      const newSession: ChatSession = {
        id: newChatId,
        title: t('newChatTitle'),
        messages: [getInitialMessage(language)],
        geminiChat: newChatInstance,
        language: language,
      };
      setChatHistory(prev => [...prev, newSession]);
      setActiveChatId(newChatId);
      setPreviewHtml(null);
      setError(null);
    } catch (e) {
      console.error(e);
      setError(t('apiKeyError'));
    }
  }, [ai, language, t]);

  useEffect(() => {
    if (chatHistory.length === 0) {
      handleNewChat();
    }
  }, [chatHistory.length, handleNewChat]);
  
  const handleSelectChat = useCallback((chatId: string) => {
    setActiveChatId(chatId);
    const selectedChat = chatHistory.find(c => c.id === chatId);
    if(selectedChat) {
      setLanguage(selectedChat.language);
    }
    const lastAiMessage = selectedChat?.messages.slice().reverse().find(m => m.sender === Sender.AI);

    if (lastAiMessage?.text.includes("```html")) {
      const htmlRegex = /```html\n([\s\S]*?)```/;
      const match = lastAiMessage.text.match(htmlRegex);
      if (match && match[1]) {
        setPreviewHtml(match[1]);
      } else {
        setPreviewHtml(null);
      }
    } else {
      setPreviewHtml(null);
    }
  }, [chatHistory]);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    if (activeChat && activeChat.messages.length === 1) {
       setChatHistory(prev => prev.map(c => {
        if (c.id === activeChatId) {
            const newChatInstance = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: { systemInstruction: getSystemInstruction(lang) },
            });
            return {
                ...c,
                language: lang,
                messages: [getInitialMessage(lang)],
                geminiChat: newChatInstance,
            };
        }
        return c;
    }));
    }
  };

  const addMessageToActiveChat = (message: Message) => {
    setChatHistory(prev => prev.map(c => {
        if (c.id === activeChatId) {
            return { ...c, messages: [...c.messages, message] };
        }
        return c;
    }));
  };

  const updateLastMessageInActiveChat = (updatedMessage: Partial<Message>) => {
     setChatHistory(prev => prev.map(c => {
          if (c.id === activeChatId) {
            const lastMessage = c.messages[c.messages.length - 1];
            const newLastMessage = { ...lastMessage, ...updatedMessage };
            return { ...c, messages: [...c.messages.slice(0, -1), newLastMessage] };
          }
          return c;
      }));
  };
  
  const showToastNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const handleSendMessage = useCallback(async (text: string, file?: { mimeType: string; data: string; }) => {
    if ((!text.trim() && !file) || !chat || !activeChat || !ai) return;
    
    let promptText = text.trim();
    if (generationMode === 'slides' && promptText) {
      promptText = t('slidesPrompt', promptText);
    } else if (file && !promptText) {
      promptText = t('imageAnalysisPrompt');
    }

    if (!promptText) return;

    const userMessage: Message = { id: Date.now(), sender: Sender.USER, text: text.trim() };
    
    const updatedMessages = [...activeChat.messages, userMessage];
    let newTitle = activeChat.title;
    if (activeChat.messages.length <= 1) {
        newTitle = text.trim().substring(0, 30) + (text.trim().length > 30 ? "..." : "");
    }

    setChatHistory(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: updatedMessages, title: newTitle } : c));
    setIsAiTyping(true);
    if (generationMode !== 'image') setPreviewHtml(null);

    try {
      if (generationMode === 'image') {
        const placeholderMessage: Message = { id: Date.now() + 1, sender: Sender.AI, text: t('imageGenerationPlaceholder', promptText), isTyping: true };
        addMessageToActiveChat(placeholderMessage);
        
        const response = await ai.models.generateImages({
          model: 'imagen-3.0-generate-002',
          prompt: promptText,
          config: { numberOfImages: 1, outputMimeType: 'image/jpeg' }
        });

        setIsAiTyping(false);
        const base64Image = response.generatedImages[0].image.imageBytes;
        const imageUrl = `data:image/jpeg;base64,${base64Image}`;
        updateLastMessageInActiveChat({ text: t('imageGenerationDone', promptText), imageUrl, isTyping: false, isDownloadable: true });

      } else { // Handle 'chat' and 'slides' mode
        const apiParts: Part[] = [{ text: promptText }];
        if (file) {
          apiParts.push({ inlineData: { mimeType: file.mimeType, data: file.data } });
        }
  
        const stream = await chat.sendMessageStream({ message: apiParts });
        
        let firstChunk = true;
        let aiResponseText = '';
        const aiMessageId = Date.now() + 1;
        
        addMessageToActiveChat({ id: aiMessageId, sender: Sender.AI, text: "", isTyping: true });
  
        for await (const chunk of stream) {
          const chunkText = chunk.text;
          aiResponseText += chunkText;
          if (firstChunk) {
            setIsAiTyping(false);
            firstChunk = false;
          }
          updateLastMessageInActiveChat({ text: aiResponseText, isTyping: false });
        }
        
        if (firstChunk) {
            setIsAiTyping(false);
            updateLastMessageInActiveChat({ isTyping: false, text: "..." });
        }
  
        if (aiResponseText) {
            const htmlRegex = /```html\n([\s\S]*?)```/;
            const match = aiResponseText.match(htmlRegex);
            if (match && match[1]) {
                setPreviewHtml(match[1]);
            }
        }
      }
    } catch (e) {
      console.error("Error sending message to AI:", e);
      setIsAiTyping(false);
      const errorMessage: Message = {
        id: Date.now(),
        sender: Sender.AI,
        text: t('apiError'),
      };
      addMessageToActiveChat(errorMessage);
    } finally {
        setGenerationMode('chat');
    }
  }, [chat, activeChat, activeChatId, generationMode, ai, t]);

  const handlePublish = useCallback(() => {
    if (!previewHtml) {
      showToastNotification(t('publishError'));
      return;
    }
    const uniqueId = Math.random().toString(36).substring(2, 10);
    const publishUrl = `https://f-studio-pub-${uniqueId}.preview.app`;
    showToastNotification(t('publishSuccess', publishUrl));
  }, [previewHtml, t]);

    // Resizing logic
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
    };

    const handleMouseUp = useCallback(() => {
        setIsResizing(false);
    }, []);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isResizing && mainContentRef.current) {
            const containerRect = mainContentRef.current.getBoundingClientRect();
            const newChatWidth = e.clientX - containerRect.left;
            const totalWidth = containerRect.width;

            const chatPercentage = (newChatWidth / totalWidth) * 100;
            
            const minPercent = 20;
            const maxPercent = 80;

            if (chatPercentage > minPercent && chatPercentage < maxPercent) {
                setPanelsWidth({
                    chat: chatPercentage,
                    preview: 100 - chatPercentage,
                });
            }
        }
    }, [isResizing]);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, handleMouseMove, handleMouseUp]);

  // Responsive: update sidebar/preview open state on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
        setIsPreviewOpen(false);
      } else {
        setIsSidebarOpen(true);
        setIsPreviewOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    // Optionally, call once on mount to ensure correct state
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-zinc-900 font-sans">
      <Header language={language} onLanguageChange={handleLanguageChange} />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: show as overlay on mobile, as side panel on desktop */}
        {isSidebarOpen && (
          <div
            className={`
              fixed inset-0 z-40 bg-black bg-opacity-40 lg:static lg:bg-transparent
              ${window.innerWidth < 1024 ? '' : 'flex'}
            `}
            style={{ display: window.innerWidth < 1024 ? 'block' : 'flex' }}
          >
            <Sidebar
              chatHistory={chatHistory}
              activeChatId={activeChatId}
              onNewChat={handleNewChat}
              onSelectChat={handleSelectChat}
              t={t}
              isOpen={isSidebarOpen}
              onToggle={() => setIsSidebarOpen(prev => !prev)}
            />
            {/* Close button for mobile sidebar */}
            {window.innerWidth < 1024 && (
              <button
                className="absolute top-4 right-4 z-50 bg-zinc-800 text-zinc-100 rounded-full p-2"
                onClick={() => setIsSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                ✕
              </button>
            )}
          </div>
        )}
        {/* Sidebar open button for mobile */}
        {!isSidebarOpen && window.innerWidth < 1024 && (
          <button
            className="fixed top-4 left-4 z-50 bg-zinc-800 text-zinc-100 rounded-full p-2 shadow-lg lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            ☰
          </button>
        )}
        <div ref={mainContentRef} className="flex flex-1 overflow-hidden main-content">
          <main
            className="flex flex-col bg-zinc-950 min-w-0"
            style={{
              width: isPreviewOpen && window.innerWidth >= 1024 ? `${panelsWidth.chat}%` : '100%',
              padding: window.innerWidth < 640 ? '1rem' : '2rem',
            }}
          >
               {error ? (
                <div className="flex-1 flex items-center justify-center text-center text-zinc-500 p-4">
                  <p><strong className="font-bold text-zinc-200">{t('errorLabel')}:</strong> {error}</p>
                </div>
              ) : (
                <ChatWindow 
                    messages={messages} 
                    onSendMessage={handleSendMessage} 
                    isAiTyping={isAiTyping}
                    generationMode={generationMode}
                    setGenerationMode={setGenerationMode}
                    onShowToast={showToastNotification}
                    t={t}
                />
              )}
            </main>
          {/* Resizer: only show on desktop */}
          {isPreviewOpen && window.innerWidth >= 1024 && (
            <div
              className="w-1.5 cursor-col-resize bg-zinc-800 hover:bg-zinc-700 transition-colors"
              onMouseDown={handleMouseDown}
            />
          )}
          {/* Preview window: show as overlay on mobile, as side panel on desktop */}
          {isPreviewOpen && (
            <div
              className={`
                ${window.innerWidth < 1024
                  ? 'fixed inset-0 z-40 bg-black bg-opacity-40 flex flex-col'
                  : 'hidden lg:flex flex-col'}
              `}
              style={{
                width: window.innerWidth >= 1024 ? `${panelsWidth.preview}%` : undefined,
                display: window.innerWidth < 1024 ? 'flex' : undefined,
              }}
            >
              <PreviewWindow htmlContent={previewHtml} onPublish={handlePublish} t={t} />
              {/* Close button for mobile preview */}
              {window.innerWidth < 1024 && (
                <button
                  className="absolute top-4 right-4 z-50 bg-zinc-800 text-zinc-100 rounded-full p-2"
                  onClick={() => setIsPreviewOpen(false)}
                  aria-label="Close preview"
                >
                  ✕
                </button>
              )}
            </div>
          )}
          {/* Preview open button for mobile */}
          {!isPreviewOpen && previewHtml && window.innerWidth < 1024 && (
            <button
              className="fixed bottom-4 right-4 z-50 bg-zinc-800 text-zinc-100 rounded-full p-2 shadow-lg lg:hidden"
              onClick={() => setIsPreviewOpen(true)}
              aria-label="Open preview"
            >
              👁️
            </button>
          )}
        </div>
      </div>
      <Toast
        message={toastMessage}
        show={showToast}
        onClose={() => setShowToast(false)}
        t={t}
      />
    </div>
  );
};

export default App;