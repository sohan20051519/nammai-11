import React, { useState } from 'react';
import { ChatSession } from '../types';

interface SidebarProps {
  chatHistory: ChatSession[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onToggleSidebar: () => void;
  onDeleteChat: (chatId: string) => void;
  t: (key: string) => string;
  isMobile?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chatHistory,
  activeChatId,
  onSelectChat,
  onNewChat,
  onToggleSidebar,
  onDeleteChat,
  t,
  isMobile = false,
}) => {
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);

  const handleDeleteClick = (chatId: string) => {
    setChatToDelete(chatId);
  };

  const confirmDelete = () => {
    if (chatToDelete) {
      onDeleteChat(chatToDelete);
      setChatToDelete(null);
    }
  };

  const cancelDelete = () => {
    setChatToDelete(null);
  };

  return (
    <>
      <div className="h-full flex flex-col bg-zinc-800">
        {/* Header - Only show close button on mobile */}
        <div className="p-4 border-b border-zinc-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-100">Chats</h2>
          {isMobile && (
            <button
              onClick={onToggleSidebar}
              className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 rounded-lg transition-colors"
              aria-label="Close sidebar"
            >
              ✕
            </button>
          )}
        </div>
        
        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={onNewChat}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="text-lg">+</span>
            <span>{t('newChatTitle')}</span>
          </button>
        </div>
        
        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-2">
            {chatHistory.length === 0 ? (
              <div className="text-center text-zinc-500 py-8">
                <div className="text-4xl mb-2">💬</div>
                <p className="text-sm">No chats yet</p>
                <p className="text-xs text-zinc-600">Start a new conversation</p>
              </div>
            ) : (
              chatHistory.map((chat) => (
                <div key={chat.id} className="group relative">
                  <button
                    onClick={() => onSelectChat(chat.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
                      chat.id === activeChatId
                        ? 'bg-zinc-700 border border-zinc-600 shadow-md'
                        : 'hover:bg-zinc-700/50 border border-transparent hover:border-zinc-600'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Chat Icon */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        chat.id === activeChatId
                          ? 'bg-blue-600 text-white'
                          : 'bg-zinc-600 text-zinc-300 group-hover:bg-zinc-500'
                      }`}>
                        <span className="text-sm">💬</span>
                      </div>
                      
                      {/* Chat Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-medium text-sm truncate ${
                          chat.id === activeChatId ? 'text-zinc-100' : 'text-zinc-200'
                        }`}>
                          {chat.title}
                        </h3>
                        
                        {/* Last message preview */}
                        {chat.messages.length > 1 && (
                          <p className="text-xs text-zinc-500 truncate mt-1">
                            {chat.messages[chat.messages.length - 1]?.text.substring(0, 50)}
                            {chat.messages[chat.messages.length - 1]?.text.length > 50 ? '...' : ''}
                          </p>
                        )}
                        
                        {/* Language badge */}
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded-md ${
                            chat.language === 'kannada'
                              ? 'bg-green-900/50 text-green-300 border border-green-800'
                              : 'bg-blue-900/50 text-blue-300 border border-blue-800'
                          }`}>
                            {chat.language === 'kannada' ? 'Kanglish' : 'English'}
                          </span>
                          
                          {/* Message count */}
                          <span className="text-xs text-zinc-500">
                            {chat.messages.length - 1} messages
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                  
                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(chat.id);
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    aria-label="Delete chat"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-zinc-700">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-2">
              <span className="text-xl font-bold text-white">N</span>
            </div>
            <p className="text-xs text-zinc-400">NammAI</p>
            <p className="text-xs text-zinc-500">Your AI Assistant</p>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal with Disclaimer */}
      {chatToDelete && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-800 rounded-xl border border-zinc-700 max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-amber-500/20 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-zinc-100 mb-1">Delete Chat?</h3>
                <p className="text-zinc-400 text-sm mb-3">
                  This action cannot be undone. This will permanently delete your chat and all its messages.
                </p>
                
                {/* Disclaimer Section */}
                <div className="bg-amber-900/20 border border-amber-800/50 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-xs font-medium text-amber-400">Disclaimer</p>
                      <p className="text-xs text-amber-300 mt-1">
                        Once deleted, your chat history cannot be recovered. Make sure you've saved any important information.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};