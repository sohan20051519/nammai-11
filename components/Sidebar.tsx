
import React from 'react';
import { PlusIcon, ClockIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from './icons';
import { ChatSession } from '../types';

interface SidebarProps {
  chatHistory: ChatSession[];
  activeChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  t: (key: string, ...args: any[]) => string;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
    chatHistory,
    activeChatId,
    onNewChat,
    onSelectChat,
    t,
    isOpen,
    onToggle,
}) => {
    
  return (
    <aside className={`bg-zinc-900 flex flex-col border-r border-zinc-800 transition-all duration-300 ${isOpen ? 'w-64 p-4' : 'w-20 p-2'}`}>
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
            <button 
                onClick={onNewChat}
                className={`w-full flex items-center gap-2 p-3 rounded-lg text-zinc-200 bg-zinc-800 hover:bg-zinc-700 transition-colors ${isOpen ? 'justify-start' : 'justify-center'}`}
            >
                <PlusIcon className="w-5 h-5 shrink-0"/>
                {isOpen && <span className="font-semibold">{t('newChat')}</span>}
            </button>

          <div className="flex flex-col gap-4 flex-1">
            <div>
                <h2 className={`text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-2 ${isOpen ? 'px-3' : 'justify-center'}`}>
                    <ClockIcon className="w-4 h-4 shrink-0" />
                    {isOpen && <span>{t('history')}</span>}
                </h2>
                <div className="flex flex-col gap-1">
                   {chatHistory.map(chat => (
                       <button 
                            key={chat.id} 
                            onClick={() => onSelectChat(chat.id)}
                            className={`w-full text-left p-3 rounded-lg transition-colors truncate ${
                                activeChatId === chat.id 
                                    ? 'bg-zinc-800 text-zinc-100 font-semibold' 
                                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'
                            } ${!isOpen && 'flex justify-center'}`}
                            title={chat.title}
                       >
                            {isOpen ? chat.title : <div className="w-2 h-2 bg-zinc-500 rounded-full"></div>}
                       </button>
                   ))}
                </div>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-zinc-800">
            <button 
                onClick={onToggle}
                className={`w-full flex items-center gap-2 p-3 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors ${isOpen ? 'justify-start' : 'justify-center'}`}
                aria-label={isOpen ? t('collapseSidebar') : t('expandSidebar')}
            >
                {isOpen ? <ChevronDoubleLeftIcon className="w-5 h-5 shrink-0" /> : <ChevronDoubleRightIcon className="w-5 h-5 shrink-0" />}
                {isOpen && <span className="font-semibold text-sm">{t('collapseSidebar')}</span>}
            </button>
        </div>
    </aside>
  );
};
