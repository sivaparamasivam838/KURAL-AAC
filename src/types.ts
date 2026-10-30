export type Language = 'en' | 'ta';

export type CategoryId = 'needs' | 'food' | 'feelings' | 'people' | 'activities' | 'emergency' | 'phrases';

export type UserRole = 'communicator' | 'caregiver' | 'therapist';

export interface User {
  id: string;
  name: string;
  nameTa?: string;
  email: string;
  role: UserRole;
  preferredLanguage: Language;
  avatar: string;
  bio?: string;
  createdAt: number;
}

export interface AACItem {
  id: string;
  labelEn: string;
  labelTa: string;
  iconName: string;
  category: CategoryId;
  speechTextEn?: string;
  speechTextTa?: string;
  accentColor?: string;
}

export interface SentenceToken {
  id: string;
  sourceId: string;
  labelEn: string;
  labelTa: string;
  speechTextEn: string;
  speechTextTa: string;
  category?: CategoryId | 'sign';
}

export interface HistoryItem {
  id: string;
  userId?: string;
  textEn: string;
  textTa: string;
  spokenText: string;
  language: Language;
  type: 'aac' | 'sign' | 'voice';
  category?: CategoryId | 'sign' | 'custom';
  timestamp: number;
  isFavorite?: boolean;
}

export interface SettingsState {
  language: Language;
  autoSpeakAac: boolean;
  autoSpeakSign: boolean;
  speechRate: number; // 0.5 to 1.5
  speechPitch: number; // 0.5 to 1.5
  speechVolume: number; // 0 to 1
  selectedVoiceURI: string;
  highContrast: boolean;
  largeText: boolean;
  tapAudio: boolean;
}

export type NavigationTab = 
  | 'home'
  | 'aac'
  | 'sign'
  | 'voice'
  | 'history'
  | 'settings'
  | 'help';

export interface RecognizedSign {
  signEn: string;
  signTa: string;
  confidence: number;
  timestamp: number;
}
