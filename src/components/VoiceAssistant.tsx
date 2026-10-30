import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Info,
  Check,
  Send,
  PlusCircle,
  Settings2,
} from 'lucide-react';
import { Language } from '../types';
import { speakText, stopSpeaking, isSpeaking } from '../services/speechService';

interface VoiceAssistantProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  voices: SpeechSynthesisVoice[];
  hasTamilVoice: boolean;
  selectedVoiceURI: string;
  speechRate: number;
  speechPitch: number;
  speechVolume: number;
  onAddPhraseToSentence: (phrase: { en: string; ta: string }) => void;
  onRecordHistory: (item: { en: string; ta: string; spokenText: string; lang: Language; type: 'voice' }) => void;
}

type VoiceStatus = 'idle' | 'listening' | 'processing' | 'speaking';

const QUICK_PHRASES: Array<{ en: string; ta: string }> = [
  { en: 'I need immediate assistance please.', ta: 'எனக்கு உடனடி உதவி தேவை, தயவுசெய்து வாருங்கள்.' },
  { en: 'Could you please repeat what you said?', ta: 'நீங்கள் கூறியதை மீண்டும் கூற முடியுமா?' },
  { en: 'I am doing well today, thank you.', ta: 'நான் இன்று நலமாக இருக்கிறேன், நன்றி.' },
  { en: 'Please give me some water.', ta: 'தயவுசெய்து எனக்கு கொஞ்சம் தண்ணீர் கொடுங்கள்.' },
  { en: 'I am experiencing some discomfort.', ta: 'எனக்கு சிறிது அசௌகரியமாக அல்லது வலியாக இருக்கிறது.' },
  { en: 'Thank you for your kindness and help.', ta: 'உங்கள் உதவிக்கும் கனிவிற்கும் மிக்க நன்றி.' },
];

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  language,
  onLanguageChange,
  voices,
  hasTamilVoice,
  selectedVoiceURI,
  speechRate,
  speechPitch,
  speechVolume,
  onAddPhraseToSentence,
  onRecordHistory,
}) => {
  const [inputText, setInputText] = useState('');
  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [statusNotice, setStatusNotice] = useState<string>('Ready to speak or listen.');
  const [isRecognitionSupported, setIsRecognitionSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Check speech recognition support
  useEffect(() => {
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsRecognitionSupported(false);
    }
  }, []);

  // Update speech synthesis loop state check
  useEffect(() => {
    const interval = setInterval(() => {
      if (status === 'speaking' && !isSpeaking()) {
        setStatus('idle');
      }
    }, 300);
    return () => clearInterval(interval);
  }, [status]);

  // Handle Speech-to-Text Listening
  const toggleListening = () => {
    if (status === 'listening') {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setStatus('idle');
      setStatusNotice(language === 'ta' ? 'கேட்பது நிறுத்தப்பட்டது.' : 'Listening stopped.');
      return;
    }

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setStatusNotice(
        language === 'ta'
          ? 'இந்த உலாவியில் மைக்ரோஃபோன் குரல் உள்ளீடு ஆதரிக்கப்படவில்லை.'
          : 'Speech recognition is not supported in this browser. Please type your phrase.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'ta' ? 'ta-IN' : 'en-US';

      recognition.onstart = () => {
        setStatus('listening');
        setStatusNotice(
          language === 'ta' ? 'மைக்ரோஃபோன் கேட்கிறது... பேசவும்' : 'Listening... Speak clearly now.'
        );
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setInputText(transcript);
        setStatus('processing');
      };

      recognition.onerror = (event: any) => {
        console.error('Recognition error:', event);
        setStatus('idle');
        setStatusNotice(`Microphone error: ${event.error}`);
      };

      recognition.onend = () => {
        setStatus('idle');
        setStatusNotice(language === 'ta' ? 'குரல் உள்ளீடு முடிந்தது.' : 'Finished listening.');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Speech recognition exception:', err);
      setStatus('idle');
      setStatusNotice('Unable to start speech recognition.');
    }
  };

  // Speak Current Input Text
  const handleSpeak = (customText?: string) => {
    const textToSpeak = customText || inputText;
    if (!textToSpeak.trim()) return;

    setStatus('speaking');
    setStatusNotice(language === 'ta' ? 'குரலில் ஒலிக்கிறது...' : 'Speaking message...');

    speakText(textToSpeak, language, {
      rate: speechRate,
      pitch: speechPitch,
      volume: speechVolume,
      voiceURI: selectedVoiceURI,
      onEnd: () => {
        setStatus('idle');
        setStatusNotice(language === 'ta' ? 'பேசி முடித்தது.' : 'Speech completed.');
      },
      onError: () => {
        setStatus('idle');
        setStatusNotice(language === 'ta' ? 'குரல் ஒலிப்பதில் பிழை.' : 'Error during speech.');
      },
    });

    // Record into history
    onRecordHistory({
      en: language === 'en' ? textToSpeak : 'Spoken in Tamil',
      ta: language === 'ta' ? textToSpeak : 'ஆங்கிலத்தில் பேசப்பட்டது',
      spokenText: textToSpeak,
      lang: language,
      type: 'voice',
    });
  };

  const handleStopSpeech = () => {
    stopSpeaking();
    setStatus('idle');
    setStatusNotice(language === 'ta' ? 'குரல் நிறுத்தப்பட்டது.' : 'Speech stopped.');
  };

  const handleTestVoice = () => {
    const testPhrase =
      language === 'ta'
        ? 'வணக்கம்! குரல் உதவியாளர் சரியாக இயங்குகிறது.'
        : 'Hello! Your voice assistant is working properly.';
    handleSpeak(testPhrase);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Language Selector & Voice Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-[#E5EAF0]">
        <div>
          <h2 className="text-base font-bold text-[#243247]">
            {language === 'ta' ? 'குரல் உதவியாளர்' : 'Speech & Voice Communicator'}
          </h2>
          <p className="text-xs text-[#718096] mt-0.5">
            {language === 'ta'
              ? 'இயற்கையான குரலில் வாக்கியங்களைப் பேசுங்கள் அல்லது மைக்ரோஃபோன் மூலம் உரையாடுங்கள்.'
              : 'Speak typed phrases out loud with high-clarity voice synthesis or dictate using speech recognition.'}
          </p>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 rounded-lg bg-[#F7FAFC] border border-[#E5EAF0]">
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md ${
                language === 'en' ? 'bg-white text-[#3478F6] shadow-xs' : 'text-slate-600'
              }`}
            >
              English
            </button>
            <button
              onClick={() => onLanguageChange('ta')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md font-tamil ${
                language === 'ta' ? 'bg-white text-[#3478F6] shadow-xs' : 'text-slate-600'
              }`}
            >
              தமிழ்
            </button>
          </div>

          <button
            onClick={handleTestVoice}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#3478F6] bg-[#EAF2FF] hover:bg-[#D8E7FF] border border-[#3478F6]/20 transition-colors"
          >
            {language === 'ta' ? 'குரல் சோதனை' : 'Test Voice'}
          </button>
        </div>
      </div>

      {/* Main Communicator Card */}
      <div className="bg-white rounded-2xl border border-[#E5EAF0] p-6 shadow-xs max-w-3xl mx-auto">
        {/* Status indicator bar */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E5EAF0]">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                status === 'speaking'
                  ? 'bg-[#3478F6] animate-pulse'
                  : status === 'listening'
                  ? 'bg-rose-500 animate-pulse'
                  : 'bg-emerald-500'
              }`}
            />
            <span className="text-xs font-bold uppercase tracking-wider text-[#243247]">
              {status === 'speaking'
                ? language === 'ta'
                  ? 'பேசுகிறது (Speaking)'
                  : 'Speaking'
                : status === 'listening'
                ? language === 'ta'
                  ? 'மைக்ரோஃபோன் கேட்கிறது (Listening)'
                  : 'Listening'
                : status === 'processing'
                ? language === 'ta'
                  ? 'செயலாக்குகிறது'
                  : 'Processing'
                : language === 'ta'
                ? 'தயார் நிலை (Idle)'
                : 'Ready'}
            </span>
          </div>

          <span className="text-xs text-[#718096] italic">{statusNotice}</span>
        </div>

        {/* Central Audio Action Hub */}
        <div className="my-6 flex flex-col items-center justify-center">
          <div className="relative">
            {/* Gentle ring when active */}
            {(status === 'listening' || status === 'speaking') && (
              <div
                className={`absolute inset-0 -m-3 rounded-full animate-ping opacity-25 ${
                  status === 'listening' ? 'bg-rose-400' : 'bg-[#3478F6]'
                }`}
              />
            )}

            <button
              onClick={toggleListening}
              className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-md transition-all active:scale-95 ${
                status === 'listening'
                  ? 'bg-rose-500 text-white'
                  : 'bg-[#EAF2FF] text-[#3478F6] hover:bg-[#D8E7FF]'
              }`}
              title={
                status === 'listening'
                  ? 'Click to stop listening'
                  : 'Click to start voice dictation'
              }
              aria-label="Toggle voice microphone"
            >
              {status === 'listening' ? (
                <MicOff className="w-8 h-8" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>
          </div>

          <p className="text-xs font-semibold text-[#243247] mt-3">
            {status === 'listening'
              ? language === 'ta'
                ? 'நிறுத்த கிளிக் செய்யவும்'
                : 'Click to Stop Listening'
              : language === 'ta'
              ? 'குரல் உள்ளீட்டிற்கு மைக்கை கிளிக் செய்யவும்'
              : 'Click to Dictate with Microphone'}
          </p>
        </div>

        {/* Speech Text Area */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[#718096] uppercase tracking-wider">
            {language === 'ta' ? 'பேச வேண்டிய உரை / வாக்கியம்' : 'Phrase to Speak'}
          </label>
          <div className="relative">
            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                language === 'ta'
                  ? 'இங்கு பேச வேண்டிய வார்த்தைகளை தட்டச்சு செய்யவும் அல்லது மேலே உள்ள மைக்கை பயன்படுத்தவும்...'
                  : 'Type a message here or use the microphone to dictate...'
              }
              className={`w-full p-4 rounded-xl border border-[#E5EAF0] text-sm text-[#243247] placeholder:text-slate-400 bg-[#F7FAFC] focus:bg-white focus:border-[#3478F6] focus:ring-1 focus:ring-[#3478F6] focus:outline-hidden resize-none leading-relaxed ${
                language === 'ta' ? 'font-tamil' : ''
              }`}
            />
            {inputText && (
              <button
                onClick={() => setInputText('')}
                className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Primary Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-[#E5EAF0]">
          <div className="flex items-center gap-2">
            {/* Speak Button */}
            <button
              onClick={() => handleSpeak()}
              disabled={!inputText.trim() || status === 'speaking'}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#3478F6] hover:bg-[#2563EB] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-xs transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              <span>{language === 'ta' ? 'குரலில் பேசு' : 'Speak Text'}</span>
            </button>

            {/* Stop Speech */}
            {status === 'speaking' && (
              <button
                onClick={handleStopSpeech}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
              >
                <VolumeX className="w-4 h-4" />
                <span>{language === 'ta' ? 'நிறுத்து' : 'Stop'}</span>
              </button>
            )}
          </div>

          {/* Add to Sentence Builder Button */}
          {inputText.trim() && (
            <button
              onClick={() => {
                onAddPhraseToSentence({
                  en: language === 'en' ? inputText : inputText,
                  ta: language === 'ta' ? inputText : inputText,
                });
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-[#20B8A6] bg-[#E8F8F2] hover:bg-[#D4F4E7] border border-[#20B8A6]/30 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? '+ AAC பலகையில் சேர்' : '+ Add to AAC Board'}</span>
            </button>
          )}
        </div>

        {/* Tamil Voice Availability Notification */}
        {language === 'ta' && !hasTamilVoice && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">தமிழ் குரல் தொகுப்பு தகவல்</p>
              <p className="mt-0.5 text-amber-800">
                உங்கள் சாதனத்தில் சொந்த தமிழ் குரல் நிறுவப்படவில்லை என்றால், உலாவி தானாகவே கிடைக்கும் பொருத்தமான குரலைப் பயன்படுத்தும். தெளிவான தமிழ் ஒலிக்கு விண்டோஸ் அல்லது ஆண்ட்ராய்டு அமைப்பில் &quot;Tamil Voice Pack&quot; நிறுவலாம்.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Frequently Spoken Assistive Phrases */}
      <div className="bg-white rounded-2xl border border-[#E5EAF0] p-5 shadow-xs max-w-3xl mx-auto">
        <h3 className="text-xs font-semibold text-[#718096] uppercase tracking-wider mb-3">
          {language === 'ta' ? 'அடிக்கடி பயன்படுத்தப்படும் வாக்கியங்கள்' : 'Quick Assistive Phrases'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {QUICK_PHRASES.map((item, idx) => {
            const label = language === 'ta' ? item.ta : item.en;
            const sub = language === 'ta' ? item.en : item.ta;

            return (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-[#F7FAFC] hover:bg-[#EAF2FF] border border-[#E5EAF0] group transition-colors"
              >
                <div
                  className="flex-1 cursor-pointer pr-2"
                  onClick={() => {
                    setInputText(label);
                    handleSpeak(label);
                  }}
                >
                  <p className="text-xs font-semibold text-[#243247] group-hover:text-[#3478F6] transition-colors">
                    {label}
                  </p>
                  <p className="text-[10px] text-[#718096] mt-0.5">{sub}</p>
                </div>
                <button
                  onClick={() => handleSpeak(label)}
                  className="p-1.5 rounded-lg text-slate-400 group-hover:text-[#3478F6] hover:bg-white transition-colors"
                  title="Speak phrase"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
