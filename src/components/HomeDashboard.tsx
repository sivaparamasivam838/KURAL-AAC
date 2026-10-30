import React from 'react';
import {
  Grid3X3,
  HandMetal,
  Mic,
  ArrowRight,
  Sparkles,
  Volume2,
  Globe,
  Lightbulb,
  History,
  ShieldCheck,
  User as UserIcon,
  Star,
} from 'lucide-react';
import { NavigationTab, Language, HistoryItem, User } from '../types';

interface HomeDashboardProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onNavigateTab: (tab: NavigationTab) => void;
  recentHistory: HistoryItem[];
  onReSpeak: (item: HistoryItem) => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
}

const HERO_IMG = '/src/assets/images/aac_hero_banner_1793119200481.jpg';
const AAC_IMG = '/src/assets/images/aac_symbols_showcase_1793119201734.jpg';
const SIGN_IMG = '/src/assets/images/sign_language_hands_1793119201251.jpg';
const VOICE_IMG = '/src/assets/images/voice_speech_waves_1793119201469.jpg';

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  language,
  onLanguageChange,
  onNavigateTab,
  recentHistory,
  onReSpeak,
  currentUser,
  onOpenAuth,
  onOpenProfile,
}) => {
  const userName = currentUser
    ? language === 'ta' && currentUser.nameTa
      ? currentUser.nameTa
      : currentUser.name
    : null;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Welcome Section with User Greeting */}
      <section className="bg-white rounded-3xl border border-[#E5EAF0] p-6 sm:p-8 shadow-xs overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2">
              {currentUser ? (
                <button
                  onClick={onOpenProfile}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF2FF] text-[#3478F6] text-xs font-semibold hover:bg-[#D8E7FF] transition-colors"
                >
                  <span>{currentUser.avatar}</span>
                  <span>
                    {language === 'ta' ? `வணக்கம், ${userName}!` : `Welcome back, ${userName}!`}
                  </span>
                </button>
              ) : (
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF2FF] text-[#3478F6] text-xs font-semibold hover:bg-[#D8E7FF] transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {language === 'ta' ? 'உள்நுழையவும் / பதிவு செய்யவும்' : 'Sign In or Create Account'}
                  </span>
                </button>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#243247] tracking-tight leading-tight">
              {language === 'ta'
                ? 'உங்கள் குரலை எளிதாகவும் நம்பிக்கையுடனும் பகிருங்கள்'
                : 'Express Yourself Clearly with Assistive AAC & Sign to Voice'}
            </h1>

            <p className="text-sm sm:text-base text-[#718096] leading-relaxed max-w-xl">
              {language === 'ta'
                ? 'படங்கள் மூலமான AAC பலகை, கேமரா சைகை மொழி அடையாளம் மற்றும் இருமொழி (தமிழ் / ஆங்கிலம்) குரல் உதவியாளர் மூலம் தடையற்ற உரையாடலை உருவாக்குங்கள்.'
                : 'Designed for people with speech and motor difficulties. Build sentences using intuitive visual symbol boards, recognize sign gestures via OpenCV, and speak out loud in natural Tamil and English.'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigateTab('aac')}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-[#3478F6] hover:bg-[#2563EB] shadow-xs active:scale-98 transition-all"
              >
                <span>{language === 'ta' ? 'தொடர்பாடலைத் தொடங்கவும்' : 'Start Communicating'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigateTab('sign')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-[#243247] bg-[#F7FAFC] hover:bg-slate-100 border border-[#E5EAF0] transition-colors"
              >
                <HandMetal className="w-4 h-4 text-[#20B8A6]" />
                <span>{language === 'ta' ? 'சைகை மொழி கேமரா' : 'Try Sign Camera'}</span>
              </button>
            </div>
          </div>

          {/* Hero Visual Asset */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-[#E5EAF0] aspect-16/10 bg-slate-100 shadow-xs">
              <img
                src={HERO_IMG}
                alt="Assistive AAC communication tablet"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3 Primary Feature Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#243247] tracking-tight">
            {language === 'ta' ? 'முதன்மை தொடர்பாடல் வசதிகள்' : 'Core Communication Tools'}
          </h2>
          <span className="text-xs text-[#718096]">
            {language === 'ta' ? 'உடனடி அணுகல்' : 'Instant 1-Click Access'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: AAC Communication */}
          <div className="bg-white rounded-2xl border border-[#E5EAF0] overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-sm hover:-translate-y-0.5 transition-all">
            <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
              <img
                src={AAC_IMG}
                alt="AAC Symbol Board display"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-white/90 backdrop-blur-xs text-[#3478F6] flex items-center justify-center shadow-xs">
                <Grid3X3 className="w-5 h-5" />
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-[#243247]">
                  {language === 'ta' ? 'AAC படப் பலகை' : 'AAC Picture Communication'}
                </h3>
                <p className="text-xs text-[#718096] mt-1.5 leading-relaxed">
                  {language === 'ta'
                    ? 'தேவைகள், உணவுகள், உணர்வுகள் மற்றும் அவசர நிலைகளுக்கான எளிய பட அட்டைகளைக் கொண்டு வாக்கியங்களை அமையுங்கள்.'
                    : 'Tactile symbol cards with Tamil and English labels, instant sentence builder, and clear text-to-speech.'}
                </p>
              </div>

              <button
                onClick={() => onNavigateTab('aac')}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-[#3478F6] bg-[#EAF2FF] hover:bg-[#D8E7FF] transition-colors"
              >
                <span>{language === 'ta' ? 'பலகையைத் திறக்க' : 'Open AAC Board'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Sign Language to Voice */}
          <div className="bg-white rounded-2xl border border-[#E5EAF0] overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-sm hover:-translate-y-0.5 transition-all">
            <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
              <img
                src={SIGN_IMG}
                alt="Hands expressing sign language"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-white/90 backdrop-blur-xs text-[#20B8A6] flex items-center justify-center shadow-xs">
                <HandMetal className="w-5 h-5" />
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-[#243247]">
                  {language === 'ta' ? 'சைகை மொழி குரலாக' : 'Sign Language to Voice'}
                </h3>
                <p className="text-xs text-[#718096] mt-1.5 leading-relaxed">
                  {language === 'ta'
                    ? 'OpenCV கணினி பார்வை உங்கள் கை சைகைகளை உடனுக்குடன் அடையாளம் கண்டு தமிழ் மற்றும் ஆங்கிலத்தில் ஒலிக்கும்.'
                    : 'Real-time gesture analysis using OpenCV computer vision. Bridge recognized signs directly into AAC sentences.'}
                </p>
              </div>

              <button
                onClick={() => onNavigateTab('sign')}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-[#12645B] bg-[#E8F8F2] hover:bg-[#D4F4E7] border border-[#20B8A6]/20 transition-colors"
              >
                <span>{language === 'ta' ? 'சைகை கேமரா திறக்க' : 'Launch Sign Assistant'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3: Voice Assistant */}
          <div className="bg-white rounded-2xl border border-[#E5EAF0] overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-sm hover:-translate-y-0.5 transition-all">
            <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
              <img
                src={VOICE_IMG}
                alt="Smart voice communicator"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-white/90 backdrop-blur-xs text-purple-600 flex items-center justify-center shadow-xs">
                <Mic className="w-5 h-5" />
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-[#243247]">
                  {language === 'ta' ? 'குரல் உதவியாளர்' : 'Voice Assistant & Dictation'}
                </h3>
                <p className="text-xs text-[#718096] mt-1.5 leading-relaxed">
                  {language === 'ta'
                    ? 'விரைவு வாக்கியங்களை தட்டச்சு செய்யவும், மைக்ரோஃபோன் மூலம் பேசவும் அல்லது கேட்கவும் எளிய குரல் கருவி.'
                    : 'Type phrases to be vocalized aloud or dictate speech using your microphone with native audio output.'}
                </p>
              </div>

              <button
                onClick={() => onNavigateTab('voice')}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200/50 transition-colors"
              >
                <span>{language === 'ta' ? 'குரல் கருவி திறக்க' : 'Open Voice Assistant'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Two columns: Recent Communications & Accessibility Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Communication Log Preview (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E5EAF0] p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF0] mb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#3478F6]" />
              <h3 className="text-xs font-semibold text-[#243247] uppercase tracking-wider">
                {language === 'ta' ? 'சமீபத்திய தொடர்பாடல்கள்' : 'Recent Communications'}
              </h3>
            </div>

            {recentHistory.length > 0 && (
              <button
                onClick={() => onNavigateTab('history')}
                className="text-xs font-semibold text-[#3478F6] hover:underline"
              >
                {language === 'ta' ? 'முழு வரலாறு காண்க' : 'View all history'}
              </button>
            )}
          </div>

          {recentHistory.length === 0 ? (
            <div className="text-center py-6 text-slate-400">
              <p className="text-xs text-[#718096]">
                {language === 'ta'
                  ? 'இன்னும் வாக்கியங்கள் பேசப்படவில்லை. AAC பலகை அல்லது குரல் கருவியைப் பயன்படுத்தவும்.'
                  : 'No phrases spoken yet today. Start by tapping symbols on the AAC board.'}
              </p>
              <button
                onClick={() => onNavigateTab('aac')}
                className="mt-3 px-4 py-2 rounded-xl text-xs font-semibold text-[#3478F6] bg-[#EAF2FF] hover:bg-[#D8E7FF] transition-colors"
              >
                {language === 'ta' ? 'AAC பலகைக்குச் செல்' : 'Go to AAC Board'}
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentHistory.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#F7FAFC] border border-[#E5EAF0] hover:border-slate-300 transition-colors"
                >
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      {item.isFavorite && <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />}
                      <p className="text-xs font-bold text-[#243247] truncate">
                        {language === 'ta' ? item.textTa : item.textEn}
                      </p>
                    </div>
                    <p className="text-[10px] text-[#718096]">
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <button
                    onClick={() => onReSpeak(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#3478F6] hover:bg-white transition-colors shrink-0"
                    title="Speak phrase"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Accessibility Tips (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E5EAF0] p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E5EAF0]">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-semibold text-[#243247] uppercase tracking-wider">
              {language === 'ta' ? 'அணுகல்தன்மை குறிப்புகள்' : 'Helpful Accessibility Tips'}
            </h3>
          </div>

          <div className="space-y-2.5 text-xs text-[#718096] leading-relaxed">
            <div className="p-3 rounded-xl bg-[#EAF2FF]/50 border border-[#3478F6]/15 text-[#243247]">
              <p className="font-semibold text-xs text-[#3478F6]">
                {language === 'ta' ? 'இருமொழி சமநிலை' : 'Bilingual Display'}
              </p>
              <p className="mt-0.5 text-xs text-[#718096]">
                {language === 'ta'
                  ? 'மேல் வலது மூலையில் தமிழ் மற்றும் ஆங்கில மொழிக்கு எப்போது வேண்டுமானாலும் மாறலாம்.'
                  : 'Toggle between English and Tamil (தமிழ்) at any moment from the top navigation bar.'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#E8F8F2]/60 border border-[#20B8A6]/20 text-[#243247]">
              <p className="font-semibold text-xs text-[#12645B]">
                {language === 'ta' ? 'விசைப்பலகை வசதி' : 'Keyboard Accessibility'}
              </p>
              <p className="mt-0.5 text-xs text-[#718096]">
                {language === 'ta'
                  ? 'Space பட்டனை அழுத்தினால் நடப்பு வாக்கியம் பேசப்படும். Escape அழுத்தினால் அழிக்கலாம்.'
                  : 'Press Space to speak your sentence board aloud; press Escape to clear all tokens.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
