import { Chat } from '@google/genai';

export enum Sender {
  USER = 'USER',
  AI = 'AI',
}

export type GenerationMode = 'chat' | 'image' | 'slides';
export type Language = 'kannada' | 'english';

export interface Message {
  id: number;
  sender: Sender;
  text: string;
  isTyping?: boolean;
  imageUrl?: string;
  isDownloadable?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  geminiChat: Chat;
  language: Language;
}
