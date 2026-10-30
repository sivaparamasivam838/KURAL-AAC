import React, { useState } from 'react';
import {
  Settings,
  Volume2,
  Sliders,
  Globe,
  Camera,
  Eye,
  Trash2,
  Check,
  AlertTriangle,
  Play,
  HelpCircle,
} from 'lucide-react';
import { SettingsState, Language } from '../types';
import { speakText, playAssistiveBeep } from '../services/speechService';

interface SettingsViewProps {
  settings: SettingsState;
  onUpdateSettings: (updater: (prev: SettingsState) => SettingsState) => void;
  voices: SpeechSynthesisVoice[];
  onClearHistory: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  voices,
  onClearHistory,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const language = settings.language;

  const handleTestSpeech = () => {
    const text =
      language === 'ta'
        ? 'வணக்கம்! இந்த குரல் உங்கள் அமைப்புகளின்படி சோதிக்கப்படுகிறது.'
        : 'Hello! This is a test of your current voice and speed settings.';

    speakText(text, language, {
      rate: settings.speechRate,
      pitch: settings.speechPitch,
      volume: settings.speechVolume,
      voiceURI: settings.selectedVoiceURI,
      onEnd: () => {
        setTestSuccess(true);
        setTimeout(() => setTestSuccess(false), 2500);
      },
    });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="p-4 bg-white rounded-2xl border border-[#E5EAF0]">
        <h2 className="text-base font-bold text-[#243247]">
          {language === 'ta' ? 'பயன்பாட்டு அமைப்புகள்' : 'Application Settings'}
        </h2>
        <p className="text-xs text-[#718096] mt-0.5">
          {language === 'ta'
            ? 'மொழி, குரல் வேகம், சைகை மொழி அமைப்புகள் மற்றும் அணுகல்தன்மை விருப்பங்கள்.'
            : 'Configure speech voice, speed rates, assistive tap sounds, and accessibility options.'}
        </p>
      </div>

      {/* 1. Language Preference */}
      <div className="bg-white rounded-2xl border border-[#E5EAF0] p-5 shadow-xs">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E5EAF0] mb-4">
          <Globe className="w-4 h-4 text-[#3478F6]" />
          <h3 className="text-xs font-semibold text-[#718096] uppercase tracking-wider">
            {language === 'ta' ? 'முதன்மை மொழி' : 'Primary Language Preference'}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              if (settings.tapAudio) playAssistiveBeep();
              onUpdateSettings((s) => ({ ...s, language: 'en' }));
            }}
            className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
              settings.language === 'en'
                ? 'border-[#3478F6] bg-[#EAF2FF] ring-1 ring-[#3478F6]'
                : 'border-[#E5EAF0] hover:bg-[#F7FAFC]'
            }`}
          >
            <div>
              <span className="text-sm font-bold text-[#243247]">English</span>
              <p className="text-xs text-[#718096] mt-0.5">International standard</p>
            </div>
            {settings.language === 'en' && <Check className="w-4 h-4 text-[#3478F6] mt-3" />}
          </button>

          <button
            onClick={() => {
              if (settings.tapAudio) playAssistiveBeep();
              onUpdateSettings((s) => ({ ...s, language: 'ta' }));
            }}
            className={`p-4 rounded-xl border text-left flex flex-col justify-between font-tamil transition-all ${
              settings.language === 'ta'
                ? 'border-[#3478F6] bg-[#EAF2FF] ring-1 ring-[#3478F6]'
                : 'border-[#E5EAF0] hover:bg-[#F7FAFC]'
            }`}
          >
            <div>
              <span className="text-sm font-bold text-[#243247]">தமிழ் (Tamil)</span>
              <p className="text-xs text-[#718096] mt-0.5 font-sans">தமிழ் மொழி ஆதரவு</p>
            </div>
            {settings.language === 'ta' && <Check className="w-4 h-4 text-[#3478F6] mt-3" />}
          </button>
        </div>
      </div>

      {/* 2. Speech Synthesis & Voice Selection */}
      <div className="bg-white rounded-2xl border border-[#E5EAF0] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF0]">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-[#3478F6]" />
            <h3 className="text-xs font-semibold text-[#718096] uppercase tracking-wider">
              {language === 'ta' ? 'குரல் மற்றும் ஒலி அமைப்புகள்' : 'Speech Engine & Voice'}
            </h3>
          </div>

          <button
            onClick={handleTestSpeech}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#3478F6] bg-[#EAF2FF] hover:bg-[#D8E7FF] transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{testSuccess ? (language === 'ta' ? 'வெற்றி!' : 'Success!') : (language === 'ta' ? 'குரல் சோதனை' : 'Test Speech')}</span>
          </button>
        </div>

        {/* Voice Selector Dropdown */}
        <div>
          <label className="block text-xs font-medium text-[#718096] mb-1.5">
            {language === 'ta' ? 'கணினி குரல் தேர்வு' : 'Synthesizer Voice'}
          </label>
          <select
            value={settings.selectedVoiceURI}
            onChange={(e) =>
              onUpdateSettings((s) => ({ ...s, selectedVoiceURI: e.target.value }))
            }
            className="w-full p-2.5 rounded-xl border border-[#E5EAF0] bg-white text-xs text-[#243247] focus:border-[#3478F6] focus:outline-hidden"
          >
            <option value="">{language === 'ta' ? 'இயல்புநிலை உலாவி குரல்' : 'Default Browser Voice'}</option>
            {voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </div>

        {/* Speed Rate Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-[#243247]">
              {language === 'ta' ? 'பேசும் வேகம்' : 'Speech Speed'}
            </span>
            <span className="font-mono-num font-semibold text-[#3478F6]">
              {settings.speechRate.toFixed(1)}x
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.1"
            value={settings.speechRate}
            onChange={(e) =>
              onUpdateSettings((s) => ({ ...s, speechRate: parseFloat(e.target.value) }))
            }
            className="w-full accent-[#3478F6] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[#718096]">
            <span>{language === 'ta' ? 'மெதுவாக' : 'Slower (0.5x)'}</span>
            <span>{language === 'ta' ? 'இயல்பு' : 'Normal (1.0x)'}</span>
            <span>{language === 'ta' ? 'வேகமாக' : 'Faster (1.5x)'}</span>
          </div>
        </div>

        {/* Volume Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-[#243247]">
              {language === 'ta' ? 'ஒலியளவு' : 'Volume Level'}
            </span>
            <span className="font-mono-num font-semibold text-[#3478F6]">
              {Math.round(settings.speechVolume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={settings.speechVolume}
            onChange={(e) =>
              onUpdateSettings((s) => ({ ...s, speechVolume: parseFloat(e.target.value) }))
            }
            className="w-full accent-[#3478F6] cursor-pointer"
          />
        </div>
      </div>

      {/* 3. Auto-Speak Behaviors */}
      <div className="bg-white rounded-2xl border border-[#E5EAF0] p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E5EAF0]">
          <Sliders className="w-4 h-4 text-[#20B8A6]" />
          <h3 className="text-xs font-semibold text-[#718096] uppercase tracking-wider">
            {language === 'ta' ? 'தானியங்கி நடத்தை' : 'Automation & Speech Triggers'}
          </h3>
        </div>

        <label className="flex items-center justify-between p-3 rounded-xl bg-[#F7FAFC] border border-[#E5EAF0] cursor-pointer">
          <div>
            <span className="text-xs font-semibold text-[#243247]">
              {language === 'ta' ? 'சைகை மொழி தானியங்கி குரல்' : 'Auto Speak Recognized Signs'}
            </span>
            <p className="text-[11px] text-[#718096]">
              {language === 'ta'
                ? 'கேமராவில் சைகை அடையாளம் காணப்பட்டவுடன் தானாக குரலில் ஒலிக்கும்.'
                : 'Instantly speak gesture signs out loud when stably recognized.'}
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.autoSpeakSign}
            onChange={(e) =>
              onUpdateSettings((s) => ({ ...s, autoSpeakSign: e.target.checked }))
            }
            className="w-4 h-4 text-[#3478F6] rounded border-slate-300 focus:ring-[#3478F6]"
          />
        </label>

        <label className="flex items-center justify-between p-3 rounded-xl bg-[#F7FAFC] border border-[#E5EAF0] cursor-pointer">
          <div>
            <span className="text-xs font-semibold text-[#243247]">
              {language === 'ta' ? 'AAC அட்டை தானியங்கி குரல்' : 'Auto Speak on Card Click'}
            </span>
            <p className="text-[11px] text-[#718096]">
              {language === 'ta'
                ? 'AAC அட்டை தொட்டவுடன் வாக்கியத்தில் சேர்ப்பதுடன் குரலிலும் பேசும்.'
                : 'Speak symbol aloud immediately when touched.'}
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.autoSpeakAac}
            onChange={(e) =>
              onUpdateSettings((s) => ({ ...s, autoSpeakAac: e.target.checked }))
            }
            className="w-4 h-4 text-[#3478F6] rounded border-slate-300 focus:ring-[#3478F6]"
          />
        </label>
      </div>

      {/* 4. Accessibility Preferences */}
      <div className="bg-white rounded-2xl border border-[#E5EAF0] p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E5EAF0]">
          <Eye className="w-4 h-4 text-[#3478F6]" />
          <h3 className="text-xs font-semibold text-[#718096] uppercase tracking-wider">
            {language === 'ta' ? 'அணுகல்தன்மை விருப்பங்கள்' : 'Accessibility Options'}
          </h3>
        </div>

        <label className="flex items-center justify-between p-3 rounded-xl bg-[#F7FAFC] border border-[#E5EAF0] cursor-pointer">
          <div>
            <span className="text-xs font-semibold text-[#243247]">
              {language === 'ta' ? 'தொடுதல் ஒலி பின்னூட்டம்' : 'Tactile Tap Audio Feedback'}
            </span>
            <p className="text-[11px] text-[#718096]">
              {language === 'ta'
                ? 'பொத்தான்களைத் தொடும்போது மென்மையான ஒலி கேட்கும்.'
                : 'Play a gentle comforting beep when cards and buttons are tapped.'}
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.tapAudio}
            onChange={(e) =>
              onUpdateSettings((s) => ({ ...s, tapAudio: e.target.checked }))
            }
            className="w-4 h-4 text-[#3478F6] rounded border-slate-300 focus:ring-[#3478F6]"
          />
        </label>

        <label className="flex items-center justify-between p-3 rounded-xl bg-[#F7FAFC] border border-[#E5EAF0] cursor-pointer">
          <div>
            <span className="text-xs font-semibold text-[#243247]">
              {language === 'ta' ? 'பெரிய உரை பயன்முறை' : 'Large Text Display'}
            </span>
            <p className="text-[11px] text-[#718096]">
              {language === 'ta'
                ? 'பார்வைக் குறைபாடு உள்ளவர்களுக்காக அட்டைகளில் பெரிய எழுத்துக்கள்.'
                : 'Enlarge typography on AAC cards and controls.'}
            </p>
          </div>
          <input
            type="checkbox"
            checked={settings.largeText}
            onChange={(e) =>
              onUpdateSettings((s) => ({ ...s, largeText: e.target.checked }))
            }
            className="w-4 h-4 text-[#3478F6] rounded border-slate-300 focus:ring-[#3478F6]"
          />
        </label>
      </div>

      {/* 5. Data & Privacy Management */}
      <div className="bg-white rounded-2xl border border-rose-200 p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-rose-700 uppercase tracking-wider">
              {language === 'ta' ? 'தரவு மேலாண்மை' : 'Data Management'}
            </h3>
            <p className="text-xs text-[#718096] mt-0.5">
              {language === 'ta'
                ? 'உள்ளூர் சேமிப்பகத்திலிருந்து வரலாற்றை நிரந்தரமாக நீக்கலாம்.'
                : 'Delete all locally stored communication transcripts.'}
            </p>
          </div>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
          >
            {language === 'ta' ? 'வரலாறு அழி' : 'Clear All History'}
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-[#E5EAF0]">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-[#243247]">
              {language === 'ta' ? 'வரலாற்றை அழிக்க வேண்டுமா?' : 'Clear All History?'}
            </h3>
            <p className="text-xs text-[#718096] mt-1.5 leading-relaxed">
              {language === 'ta'
                ? 'சேமிக்கப்பட்ட அனைத்து தொடர்பாடல் பதிவுகளும் அழிக்கப்படும்.'
                : 'All locally stored history records will be erased.'}
            </p>

            <div className="flex items-center justify-end gap-2.5 mt-6">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                {language === 'ta' ? 'ரத்து' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  onClearHistory();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-xs"
              >
                {language === 'ta' ? 'ஆம், அழி' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
