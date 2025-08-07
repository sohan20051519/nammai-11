
import React from 'react';
import { GenerationMode } from '../types';
import { ChatBubbleLeftIcon, PhotoIcon, PresentationChartBarIcon } from './icons';

interface GenerationModeSelectorProps {
    currentMode: GenerationMode;
    onModeChange: (mode: GenerationMode) => void;
    t: (key: string, ...args: any[]) => string;
}

const ModeButton: React.FC<{
    icon: React.FC<{ className?: string }>;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon: Icon, label, isActive, onClick }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center gap-2 p-2 rounded-md text-sm transition-colors ${
                isActive 
                ? 'bg-zinc-700 text-zinc-100' 
                : 'text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-100'
            }`}
            aria-label={label}
        >
            <Icon className="w-5 h-5" />
        </button>
    );
};


export const GenerationModeSelector: React.FC<GenerationModeSelectorProps> = ({ currentMode, onModeChange, t }) => {
    const MODES: { mode: GenerationMode; icon: React.FC<{ className?: string }>; label: string }[] = [
        { mode: 'chat', icon: ChatBubbleLeftIcon, label: t('chatMode') },
        { mode: 'image', icon: PhotoIcon, label: t('imageMode') },
        { mode: 'slides', icon: PresentationChartBarIcon, label: t('slidesMode') },
    ];

    return (
        <div className="flex items-center p-1 bg-zinc-900/50 rounded-lg">
           {MODES.map(({ mode, icon, label }) => (
                <ModeButton
                    key={mode}
                    icon={icon}
                    label={label}
                    isActive={currentMode === mode}
                    onClick={() => onModeChange(mode)}
                />
            ))}
        </div>
    );
};
