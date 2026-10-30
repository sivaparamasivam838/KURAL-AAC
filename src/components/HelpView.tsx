import React from 'react';
import {
  HelpCircle,
  Grid3X3,
  HandMetal,
  Mic,
  Globe,
  Keyboard,
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { Language } from '../types';

interface HelpViewProps {
  language: Language;
  onNavigateToTab: (tab: any) => void;
}

export const HelpView: React.FC<HelpViewProps> = ({ language, onNavigateToTab }) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title Card */}
      <div className="p-4 bg-white rounded-2xl border border-[#E5EAF0]">
        <h2 className="text-base font-bold text-[#243247]">
          {language === 'ta' ? 'உதவி மற்றும் பயனர் வழிகாட்டி' : 'Help & User Accessibility Guide'}
        </h2>
        <p className="text-xs text-[#718096] mt-0.5">
          {language === 'ta'
            ? 'AAC பலகை, சைகை மொழி கேமரா, குரல் உதவியாளர் மற்றும் தமிழ் குரல் நிறுவல் பற்றிய எளிய குறிப்புகள்.'
            : 'Step-by-step instructions for picture boards, computer vision sign recognition, and voice setup.'}
        </p>
      </div>

      {/* 4 Feature Guide Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Guide 1: AAC Symbols */}
        <div className="bg-white rounded-2xl border border-[#E5EAF0] p-5 shadow-xs">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-[#EAF2FF] text-[#3478F6] flex items-center justify-center">
              <Grid3X3 className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#243247]">
              {language === 'ta' ? '1. AAC பலகை பயன்பாடு' : '1. AAC Picture Board'}
            </h3>
          </div>
          <ul className="space-y-2 text-xs text-[#718096] leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                {language === 'ta'
                  ? 'தேவைகள், உணவு, உணர்வுகள் போன்ற பிரிவுகளைத் தேர்ந்தெடுத்து தேவையான அட்டையைத் தொடவும்.'
                  : 'Tap on cards (Needs, Food, Feelings, Emergency) to add them directly into your sentence.'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                {language === 'ta'
                  ? 'மேலே உள்ள "வாக்கியம் பேசு" பொத்தானை அழுத்தினால் முழு வாக்கியமும் குரலில் ஒலிக்கும்.'
                  : 'Click the prominent blue "Speak Sentence" button to vocalize your complete constructed thought.'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                {language === 'ta'
                  ? 'தனிப்பட்ட அட்டைக்கு மேலே உள்ள ஒலிபெருக்கி ஐகானைத் தொட்டால் உடனடியாக அந்த ஒரு வார்த்தை மட்டும் பேசப்படும்.'
                  : 'Click the speaker icon on any individual card to hear that single word instantly.'}
              </span>
            </li>
          </ul>
        </div>

        {/* Guide 2: Sign Language */}
        <div className="bg-white rounded-2xl border border-[#E5EAF0] p-5 shadow-xs">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-[#E8F8F2] text-[#20B8A6] flex items-center justify-center">
              <HandMetal className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#243247]">
              {language === 'ta' ? '2. சைகை மொழி உதவியாளர்' : '2. Sign Language Camera'}
            </h3>
          </div>
          <ul className="space-y-2 text-xs text-[#718096] leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                {language === 'ta'
                  ? 'நன்கு வெளிச்சம் உள்ள இடத்தில் கேமராவுக்கு 1-2 அடி தூரத்தில் கைகளைத் தெளிவாகக் காட்டவும்.'
                  : 'Position yourself in good lighting with your hand clearly framed 1–2 feet from your webcam.'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                {language === 'ta'
                  ? 'வணக்கம், உதவி, தண்ணீர், உணவு, நன்றி போன்ற சைகைகளை 1-2 நொடிகள் நிலையாக வைக்கவும்.'
                  : 'Hold signs like "Hello", "Help", "Water", "Food", "Thank You" steady for 1–2 seconds.'}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                {language === 'ta'
                  ? 'அடையாளம் காணப்பட்டதும் "+ வாக்கியத்தில் சேர்" அழுத்தி AAC வாக்கியத்துடன் இணைக்கலாம்.'
                  : 'Click "+ Add to Sentence" to seamlessly push the recognized word into your AAC sentence.'}
              </span>
            </li>
          </ul>
        </div>

        {/* Guide 3: Tamil Voice Setup */}
        <div className="bg-white rounded-2xl border border-[#E5EAF0] p-5 shadow-xs">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#243247]">
              {language === 'ta' ? '3. தமிழ் குரல் அமைப்பது எப்படி?' : '3. Tamil Voice Installation Guide'}
            </h3>
          </div>
          <p className="text-xs text-[#718096] leading-relaxed mb-2">
            {language === 'ta'
              ? 'தமிழ் உரையை தெளிவான உச்சரிப்பில் கேட்க உங்கள் கணினி அல்லது கைபேசியில் தமிழ் மொழி தொகுப்பை சேர்க்கலாம்:'
              : 'To enable natural Tamil text-to-speech audio, ensure Tamil TTS voice pack is installed on your OS:'}
          </p>
          <div className="space-y-1.5 text-xs text-[#243247] bg-[#F7FAFC] p-3 rounded-xl border border-[#E5EAF0]">
            <p><strong>Windows:</strong> Settings → Time & Language → Speech → Add &quot;Tamil (India)&quot; voice.</p>
            <p><strong>Android:</strong> Settings → Accessibility → Text-to-Speech output → Google TTS → Install Tamil voice data.</p>
            <p><strong>macOS / iOS:</strong> Settings → Accessibility → Spoken Content → Voices → Tamil.</p>
          </div>
        </div>

        {/* Guide 4: Keyboard Shortcuts */}
        <div className="bg-white rounded-2xl border border-[#E5EAF0] p-5 shadow-xs">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Keyboard className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#243247]">
              {language === 'ta' ? '4. விசைப்பலகை குறுக்குவழிகள்' : '4. Keyboard Access Shortcuts'}
            </h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-[#718096]">{language === 'ta' ? 'முழு வாக்கியம் பேச' : 'Speak current sentence'}</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[11px]">Space</kbd>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-100">
              <span className="text-[#718096]">{language === 'ta' ? 'வாக்கியத்தை அழிக்க' : 'Clear sentence board'}</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[11px]">Escape</kbd>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-[#718096]">{language === 'ta' ? 'கடைசி சொல்லை நீக்க' : 'Undo last token'}</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[11px]">Ctrl + Z</kbd>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Assistance Notice */}
      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div className="text-xs">
          <h4 className="font-bold">
            {language === 'ta' ? 'அவசர உதவி தேவைப்பட்டால்:' : 'Medical Emergency Note:'}
          </h4>
          <p className="mt-0.5 text-rose-800 leading-relaxed">
            {language === 'ta'
              ? 'உடனடி மருத்துவ அவசர உதவிக்கு AAC பலகையில் உள்ள "அவசர உதவி" (Emergency) பிரிவைப் பயன்படுத்தவும். அல்லது அருகிலுள்ள அவசர உதவி எண்ணை (108 / 112) தொடர்பு கொள்ளவும்.'
              : 'For immediate critical situations, use the high-visibility Emergency tab on the AAC board or contact local emergency dispatch (108 / 112 / 911).'}
          </p>
        </div>
      </div>
    </div>
  );
};
