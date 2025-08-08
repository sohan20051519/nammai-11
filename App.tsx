import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { Sender, Message, ChatSession, GenerationMode, Language } from './types';
import { GoogleGenAI, Chat, Part } from '@google/genai';
import { PreviewWindow } from './components/PreviewWindow';
import { Toast } from './components/Toast';
import { translations } from './translations';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { collection, addDoc, getDocs, query, where, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

const getInitialMessage = (lang: Language): Message => ({
  id: 1,
  sender: Sender.AI,
  text: translations[lang].initialMessage,
});

const getSystemInstruction = (lang: Language): string => {
  return translations[lang].systemInstruction;
};

const AppContent: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [generationMode, setGenerationMode] = useState<GenerationMode>('chat');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [language, setLanguage] = useState<Language>('kannada');
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [panelsWidth, setPanelsWidth] = useState({ chat: 60, preview: 40 });
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [expandedCodeBlocks, setExpandedCodeBlocks] = useState<Set<number>>(new Set());
  const [showCodePreview, setShowCodePreview] = useState<{ [key: number]: boolean }>({});
  const mainContentRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Set document title dynamically
  useEffect(() => {
    document.title = 'NammAI - Your All-Rounder AI Assistant';
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const ai = useMemo(() => {
    const apiKey = (process.env.API_KEY || (window as any).API_KEY) as string;
    if (!apiKey) {
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

  // Load user's chats from Firestore
  const loadUserChats = useCallback(async () => {
    if (!user || !ai) return;

    try {
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const loadedChats: ChatSession[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const newChatInstance = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: { systemInstruction: getSystemInstruction(data.language) },
        });

        loadedChats.push({
          id: doc.id,
          title: data.title,
          messages: data.messages,
          geminiChat: newChatInstance,
          language: data.language,
          userId: data.userId
        });
      });

      setChatHistory(loadedChats);
      if (loadedChats.length > 0) {
        setActiveChatId(loadedChats[0].id);
        setLanguage(loadedChats[0].language);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
    }
  }, [user, ai]);

  // Save chat to Firestore
  const saveChatToFirestore = useCallback(async (chatSession: ChatSession) => {
    if (!user) return;

    try {
      const chatData = {
        userId: user.uid,
        title: chatSession.title,
        messages: chatSession.messages,
        language: chatSession.language,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (chatSession.id && chatSession.id.length > 13) {
        const chatRef = doc(db, 'chats', chatSession.id);
        await updateDoc(chatRef, {
          ...chatData,
          updatedAt: new Date()
        });
      } else {
        const docRef = await addDoc(collection(db, 'chats'), chatData);
        setChatHistory(prev => prev.map(c =>
          c.id === chatSession.id ? { ...c, id: docRef.id } : c
        ));
        if (activeChatId === chatSession.id) {
          setActiveChatId(docRef.id);
        }
      }
    } catch (error) {
      console.error('Error saving chat:', error);
    }
  }, [user, activeChatId]);

  // Delete chat from Firestore
  const deleteChatFromFirestore = useCallback(async (chatId: string) => {
    if (!user) return;

    try {
      if (chatId.length > 13) {
        const chatRef = doc(db, 'chats', chatId);
        await deleteDoc(chatRef);
      }

      setChatHistory(prev => prev.filter(c => c.id !== chatId));
      if (activeChatId === chatId) {
        const remainingChats = chatHistory.filter(c => c.id !== chatId);
        if (remainingChats.length > 0) {
          setActiveChatId(remainingChats[0].id);
        } else {
          handleNewChat();
        }
      }
      showToastNotification('Chat deleted successfully');
    } catch (error) {
      console.error('Error deleting chat:', error);
      showToastNotification('Error deleting chat');
    }
  }, [user, activeChatId, chatHistory]);

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
        userId: user?.uid
      };

      setChatHistory(prev => [newSession, ...prev]);
      setActiveChatId(newChatId);
      setPreviewHtml(null);
      setError(null);
      // Reset code block states for new chat
      setExpandedCodeBlocks(new Set());
      setShowCodePreview({});
    } catch (e) {
      console.error(e);
      setError(t('apiKeyError'));
    }
  }, [ai, language, t, user]);

  useEffect(() => {
    if (user && ai) {
      loadUserChats();
    } else if (!user) {
      setChatHistory([]);
      setActiveChatId(null);
    }
  }, [user, ai, loadUserChats]);

  useEffect(() => {
    if (chatHistory.length === 0 && user && ai) {
      handleNewChat();
    }
  }, [chatHistory.length, handleNewChat, user, ai]);

  useEffect(() => {
    if (activeChat && user) {
      saveChatToFirestore(activeChat);
    }
  }, [activeChat?.messages, saveChatToFirestore, user, activeChat]);

  const handleSelectChat = useCallback((chatId: string) => {
    setActiveChatId(chatId);
    const selectedChat = chatHistory.find(c => c.id === chatId);
    if(selectedChat) {
      setLanguage(selectedChat.language);
    }

    // Reset code block states when switching chats
    setExpandedCodeBlocks(new Set());
    setShowCodePreview({});

    const lastAiMessage = selectedChat?.messages.slice().reverse().find(m => m.sender === Sender.AI);
    if (lastAiMessage?.text.includes("```")) {
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
          const newChatInstance = ai!.chats.create({
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

  // Function to toggle code block expansion
  const toggleCodeBlock = useCallback((messageId: number) => {
    setExpandedCodeBlocks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  }, []);

  // Function to toggle code preview
  const toggleCodePreview = useCallback((messageId: number) => {
    setShowCodePreview(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  }, []);

  const handleSendMessage = useCallback(async (text: string, file?: { mimeType: string; data: string; }) => {
    if ((!text.trim() && !file) || !chat || !activeChat || !ai) return;

    let promptText = text.trim();
    if (generationMode === 'slides' && promptText) {
      promptText = t('slidesPrompt', promptText);
    } else if (generationMode === 'code' && promptText) {
      promptText = `Please write ${promptText} code with proper explanation and best practices.`;
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
    setPreviewHtml(null);

    try {
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

  const handleSignOut = useCallback(async () => {
    try {
      await logout();
      setChatHistory([]);
      setActiveChatId(null);
      setShowProfileDropdown(false);
      showToastNotification('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      showToastNotification('Error signing out');
    }
  }, [logout]);

  // Calculate panel widths - Modified for desktop only
  const calculatePanelWidths = () => {
    const sidebarWidth = isSidebarOpen ? 22 : 0;
    // For desktop: remove preview panel, for mobile: keep original logic
    const previewWidth = window.innerWidth >= 1024 ? 0 : (isPreviewOpen ? 33 : 0);
    const chatWidth = 100 - sidebarWidth - previewWidth;
    return { sidebar: sidebarWidth, chat: chatWidth, preview: previewWidth };
  };

  const currentPanelWidths = calculatePanelWidths();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-zinc-300">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="h-screen bg-zinc-900 text-white flex flex-col overflow-hidden">
      {/* Mobile Header - UNCHANGED */}
      <div className="lg:hidden bg-zinc-800 border-b border-zinc-700 px-4 py-3 flex items-center justify-between">
        {/* Left side - Logo and Menu */}
        <div className="flex items-center gap-3">
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 rounded-lg transition-colors"
            >
              ☰
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-sm">
              N
            </div>
            <h1 className="text-lg font-semibold">NammAI</h1>
          </div>
        </div>

        {/* Right side - Language and Profile */}
        <div className="flex items-center gap-2">
          <div className="flex bg-zinc-700 rounded-lg p-0.5">
            <button
              onClick={() => handleLanguageChange('kannada')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                language === 'kannada'
                  ? 'bg-white text-zinc-900'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              Kanglish
            </button>
            <button
              onClick={() => handleLanguageChange('english')}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                language === 'english'
                  ? 'bg-white text-zinc-900'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              English
            </button>
          </div>

          {/* User Profile with Dropdown */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold text-sm">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50 py-2">
                <div className="px-4 py-2 border-b border-zinc-700">
                  <p className="font-medium text-white">{user?.displayName || 'User'}</p>
                  <p className="text-sm text-zinc-400">{user?.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full px-4 py-2 text-left text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Mobile Preview Button - UNCHANGED */}
          {previewHtml && (
            <button
              onClick={() => setIsPreviewOpen(prev => !prev)}
              className={`p-2 rounded-lg transition-colors ${
                isPreviewOpen
                  ? 'bg-purple-600 text-white'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700'
              }`}
              title={isPreviewOpen ? 'Hide Preview' : 'Show Preview'}
            >
              👁️
            </button>
          )}
        </div>
      </div>

      {/* Desktop Header - UNCHANGED */}
      <div className="hidden lg:flex bg-zinc-800 border-b border-zinc-700 px-6 py-4 items-center justify-between">
        {/* Left side - Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center font-bold">
            N
          </div>
          <h1 className="text-xl font-bold">NammAI</h1>
        </div>

        {/* Right side - Language selector and Profile */}
        <div className="flex items-center gap-4">
          <div className="flex bg-zinc-700 rounded-lg p-1">
            <button
              onClick={() => handleLanguageChange('kannada')}
              className={`px-3 py-1.5 text-sm rounded transition-colors font-medium ${
                language === 'kannada'
                  ? 'bg-white text-zinc-900'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              Kanglish
            </button>
            <button
              onClick={() => handleLanguageChange('english')}
              className={`px-3 py-1.5 text-sm rounded transition-colors font-medium ${
                language === 'english'
                  ? 'bg-white text-zinc-900'
                  : 'text-zinc-300 hover:text-white'
              }`}
            >
              English
            </button>
          </div>

          {/* User Profile with Dropdown */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <span className="text-zinc-300">{user?.displayName || user?.email?.split('@')[0] || 'User'}</span>
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50 py-2">
                <div className="px-4 py-2 border-b border-zinc-700">
                  <p className="font-medium text-white">{user?.displayName || 'User'}</p>
                  <p className="text-sm text-zinc-400">{user?.email}</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full px-4 py-2 text-left text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden" ref={mainContentRef}>
        {/* Left Sidebar */}
        {isSidebarOpen && (
          <>
            {window.innerWidth < 1024 && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}
            <div
              className={`${window.innerWidth < 1024 ? 'fixed left-0 top-0 h-full z-50' : 'relative'} bg-zinc-800 border-r border-zinc-700 flex flex-col overflow-hidden`}
              style={{
                width: window.innerWidth >= 1024 ? `${currentPanelWidths.sidebar}%` : '288px',
              }}
            >
              <Sidebar
                chatHistory={chatHistory}
                activeChatId={activeChatId}
                onSelectChat={handleSelectChat}
                onNewChat={handleNewChat}
                onDeleteChat={deleteChatFromFirestore}
                onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
                t={t}
                isMobile={window.innerWidth < 1024}
              />
            </div>
          </>
        )}

        {/* Center Chat Area */}
        <div
          className="flex-1 flex flex-col bg-zinc-800 relative overflow-hidden"
          style={{
            width: window.innerWidth >= 1024 ? `${currentPanelWidths.chat}%` : '100%',
          }}
        >
          {/* Chat Header - Desktop: NO PREVIEW BUTTON, Mobile: UNCHANGED */}
          <div className="hidden lg:flex bg-zinc-800 border-b border-zinc-700 px-4 py-3 items-center justify-between">
            {/* Left Corner */}
            <div className="flex items-center gap-3">
              {!isSidebarOpen && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 rounded-lg transition-colors flex-shrink-0"
                  title="Show chats"
                >
                  ☰
                </button>
              )}
              <h2 className="text-lg font-semibold text-zinc-100 truncate">
                {activeChat?.title || 'New Chat'}
              </h2>
            </div>
            {/* NO PREVIEW BUTTON IN DESKTOP MODE */}
          </div>

          {error ? (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="text-red-400 text-center">
                <p className="font-semibold">{t('errorLabel')}: {error}</p>
              </div>
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
              isMobile={window.innerWidth < 1024}
              expandedCodeBlocks={expandedCodeBlocks}
              onToggleCodeBlock={toggleCodeBlock}
              showCodePreview={showCodePreview}
              onToggleCodePreview={toggleCodePreview}
              previewHtml={previewHtml}
              setPreviewHtml={setPreviewHtml}
              hideProfilePhotos={true}
            />
          )}
        </div>

        {/* Right Preview Panel - ONLY FOR MOBILE */}
        {isPreviewOpen && window.innerWidth < 1024 && (
          <div
            className="bg-zinc-900 border-l border-zinc-700 flex flex-col overflow-hidden"
            style={{
              width: window.innerWidth >= 1024 ? `${currentPanelWidths.preview}%` : undefined,
            }}
          >
            {window.innerWidth < 1024 && (
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-100 bg-zinc-700 rounded-full transition-colors shadow-lg z-10"
                aria-label="Close preview"
              >
                ✕
              </button>
            )}
            <PreviewWindow 
              htmlContent={previewHtml} 
              onPublish={handlePublish}
              t={t}
            />
          </div>
        )}
      </div>

      <Toast
        message={toastMessage}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        t={t}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;