import React from 'react';
import { Menu, Volume2, Globe, VolumeX, User as UserIcon, LogIn } from 'lucide-react';
import { NavigationTab, Language, User } from '../types';

interface TopNavProps {
  activeTab: NavigationTab;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onToggleMobileMenu: () => void;
  isSpeaking: boolean;
  onStopSpeech: () => void;
  hasTamilVoice: boolean;
  currentUser: User | null;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
}

const TAB_TITLES: Record<NavigationTab, { en: string; ta: string }> = {
  home: { en: 'Home Dashboard', ta: 'முகப்பு பலகை' },
  aac: { en: 'AAC Communication Board', ta: 'AAC தொடர்பாடல் பலகை' },
  sign: { en: 'Sign Language to Voice', ta: 'சைகை மொழி குரலாக' },
  voice: { en: 'Voice Assistant', ta: 'குரல் உதவியாளர்' },
  history: { en: 'Communication History', ta: 'தொடர்பாடல் வரலாறு' },
  settings: { en: 'Settings & Preferences', ta: 'அமைப்புகள்' },
  help: { en: 'Help & User Guide', ta: 'வழிகாட்டி மற்றும் உதவி' },
};

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  language,
  onLanguageChange,
  onToggleMobileMenu,
  isSpeaking,
  onStopSpeech,
  hasTamilVoice,
  currentUser,
  onOpenAuth,
  onOpenProfile,
}) => {
  const currentTitle = TAB_TITLES[activeTab] || { en: 'AAC Communication', ta: 'AAC தொடர்பாடல்' };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-white border-b border-[#E5EAF0]">
      {/* Zone 1: Mobile menu toggle + Page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 -ml-1 text-slate-600 rounded-lg md:hidden hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#3478F6]"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <h1 className="text-base md:text-lg font-semibold text-[#243247] tracking-tight">
            {language === 'ta' ? currentTitle.ta : currentTitle.en}
          </h1>
          {language === 'ta' && (
            <span className="hidden sm:inline text-xs text-[#718096]">
              · {currentTitle.en}
            </span>
          )}
        </div>
      </div>

      {/* Zone 2: Voice status indicator & controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Speaking badge with stop control */}
        {isSpeaking && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#EAF2FF] border border-[#3478F6]/20">
            <Volume2 className="w-4 h-4 text-[#3478F6] animate-pulse" />
            <span className="text-xs font-medium text-[#3478F6] hidden sm:inline">
              {language === 'ta' ? 'பேசுகிறது...' : 'Speaking...'}
            </span>
            <button
              onClick={onStopSpeech}
              className="p-0.5 text-slate-500 hover:text-rose-600 rounded"
              title="Stop speech"
              aria-label="Stop speech"
            >
              <VolumeX className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tamil voice indicator badge */}
        {language === 'ta' && !hasTamilVoice && (
          <span
            className="hidden xl:inline text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md"
            title="Tamil voice synthesis will use default phonetics or browser engine"
          >
            தமிழ் குரல் தொகுப்பு
          </span>
        )}

        {/* Zone 3: Language Selector Segmented Control */}
        <div className="flex items-center p-1 rounded-lg bg-[#F7FAFC] border border-[#E5EAF0]">
          <button
            onClick={() => onLanguageChange('en')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              language === 'en'
                ? 'bg-white text-[#3478F6] shadow-xs'
                : 'text-[#718096] hover:text-[#243247]'
            }`}
            aria-pressed={language === 'en'}
          >
            English
          </button>
          <button
            onClick={() => onLanguageChange('ta')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all font-tamil ${
              language === 'ta'
                ? 'bg-white text-[#3478F6] shadow-xs'
                : 'text-[#718096] hover:text-[#243247]'
            }`}
            aria-pressed={language === 'ta'}
          >
            தமிழ்
          </button>
        </div>

        {/* Zone 4: User Profile or Login Trigger */}
        {currentUser ? (
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl hover:bg-[#F7FAFC] border border-[#E5EAF0] transition-colors"
            title="View Account Profile"
          >
            <span className="text-lg leading-none">{currentUser.avatar}</span>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-[#243247] leading-tight max-w-[100px] truncate">
                {language === 'ta' && currentUser.nameTa ? currentUser.nameTa : currentUser.name}
              </span>
              <span className="text-[10px] text-[#718096] capitalize leading-none">
                {currentUser.role}
              </span>
            </div>
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#3478F6] hover:bg-[#2563EB] shadow-xs transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'உள்நுழைவு' : 'Sign In'}</span>
          </button>
        )}
      </div>
    </header>
  );
};
