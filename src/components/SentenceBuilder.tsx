import React from 'react';
import { Volume2, RotateCcw, Trash2, Copy, Check, HandMetal, Sparkles } from 'lucide-react';
import { SentenceToken, Language } from '../types';

interface SentenceBuilderProps {
  tokens: SentenceToken[];
  language: Language;
  onRemoveToken: (tokenId: string) => void;
  onClearAll: () => void;
  onUndo: () => void;
  onSpeakSentence: () => void;
  isSpeaking: boolean;
  onNavigateToSign?: () => void;
  recentRecognizedSign?: { signEn: string; signTa: string } | null;
  onAddSignToSentence?: (sign: { signEn: string; signTa: string }) => void;
}

export const SentenceBuilder: React.FC<SentenceBuilderProps> = ({
  tokens,
  language,
  onRemoveToken,
  onClearAll,
  onUndo,
  onSpeakSentence,
  isSpeaking,
  onNavigateToSign,
  recentRecognizedSign,
  onAddSignToSentence,
}) => {
  const [copied, setCopied] = React.useState(false);

  const fullSentenceEn = tokens.map((t) => t.labelEn).join(' ');
  const fullSentenceTa = tokens.map((t) => t.labelTa).join(' ');

  const handleCopy = () => {
    const textToCopy = language === 'ta' ? fullSentenceTa : fullSentenceEn;
    if (textToCopy && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5EAF0] p-4 md:p-5 shadow-xs mb-6">
      {/* Header with status & sign language integration bridge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E5EAF0]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#718096] uppercase tracking-wider">
            {language === 'ta' ? 'வாக்கிய அமைப்பு பலகை' : 'Sentence Builder'}
          </span>
          <span className="text-xs text-[#718096]">
            ({tokens.length} {language === 'ta' ? 'வார்த்தைகள்' : tokens.length === 1 ? 'word' : 'words'})
          </span>
        </div>

        {/* Quick bridge to insert recent recognized sign if available */}
        {recentRecognizedSign && onAddSignToSentence && (
          <button
            onClick={() => onAddSignToSentence(recentRecognizedSign)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-[#20B8A6] bg-[#E8F8F2] hover:bg-[#D4F4E7] rounded-lg border border-[#20B8A6]/20 transition-colors"
            title="Add sign language word to this sentence"
          >
            <HandMetal className="w-3.5 h-3.5" />
            <span>
              {language === 'ta' ? '+ சைகை சொல்:' : '+ Add Sign:'}{' '}
              <strong>{language === 'ta' ? recentRecognizedSign.signTa : recentRecognizedSign.signEn}</strong>
            </span>
          </button>
        )}
      </div>

      {/* Main token flow area */}
      <div className="min-h-[72px] my-3 py-2 flex flex-wrap items-center gap-2.5">
        {tokens.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-[#718096] italic py-2">
            <span>
              {language === 'ta'
                ? 'கீழே உள்ள படக் அட்டைகளைத் தொட்டு வாக்கியத்தை உருவாக்கவும்...'
                : 'Select AAC symbol cards below to construct your message...'}
            </span>
          </div>
        ) : (
          tokens.map((token, index) => (
            <div
              key={token.id}
              className={`group flex items-center gap-2 pl-3.5 pr-2 py-2 rounded-xl border text-sm font-medium transition-all ${
                token.category === 'sign'
                  ? 'bg-[#E8F8F2] border-[#20B8A6]/40 text-[#12645B]'
                  : 'bg-[#F7FAFC] border-[#E5EAF0] text-[#243247] hover:border-slate-300'
              }`}
            >
              {token.category === 'sign' && (
                <HandMetal className="w-3.5 h-3.5 text-[#20B8A6] shrink-0" />
              )}
              <div className="flex flex-col">
                <span className="leading-tight font-semibold">
                  {language === 'ta' ? token.labelTa : token.labelEn}
                </span>
                <span className="text-[10px] text-[#718096] leading-none">
                  {language === 'ta' ? token.labelEn : token.labelTa}
                </span>
              </div>
              <button
                onClick={() => onRemoveToken(token.id)}
                className="w-5 h-5 flex items-center justify-center rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 ml-1 transition-colors"
                aria-label={`Remove ${token.labelEn}`}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      {/* Action controls row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E5EAF0]">
        <div className="flex items-center gap-2">
          {/* Speak Button (Primary) */}
          <button
            onClick={onSpeakSentence}
            disabled={tokens.length === 0 || isSpeaking}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#3478F6] hover:bg-[#2563EB] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-xs active:scale-98 transition-all"
          >
            <Volume2 className="w-4 h-4" />
            <span>{language === 'ta' ? 'வாக்கியம் பேசு' : 'Speak Sentence'}</span>
          </button>

          {/* Copy Text */}
          <button
            onClick={handleCopy}
            disabled={tokens.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#243247] bg-[#F7FAFC] hover:bg-slate-100 border border-[#E5EAF0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Copy sentence"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
            <span className="hidden sm:inline">
              {copied ? (language === 'ta' ? 'நகலெடுக்கப்பட்டது' : 'Copied') : (language === 'ta' ? 'நகல்' : 'Copy')}
            </span>
          </button>
        </div>

        {/* Undo and Clear */}
        <div className="flex items-center gap-2">
          <button
            onClick={onUndo}
            disabled={tokens.length === 0}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-[#E5EAF0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Undo last word"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'மீளமை' : 'Undo'}</span>
          </button>

          <button
            onClick={onClearAll}
            disabled={tokens.length === 0}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50/50 hover:bg-rose-50 border border-rose-200/60 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Clear all tokens"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'அனைத்தும் நீக்கு' : 'Clear'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
