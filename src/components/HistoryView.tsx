import React, { useState } from 'react';
import {
  History,
  Volume2,
  Trash2,
  Copy,
  PlusCircle,
  Filter,
  Check,
  Download,
  AlertTriangle,
  Grid3X3,
  HandMetal,
  Mic,
  Star,
  Search,
  Calendar,
  Sparkles,
  BarChart3,
  Share2,
} from 'lucide-react';
import { HistoryItem, Language, User } from '../types';

interface HistoryViewProps {
  history: HistoryItem[];
  language: Language;
  onReSpeak: (item: HistoryItem) => void;
  onAddToSentence: (item: HistoryItem) => void;
  onClearHistory: () => void;
  onToggleFavorite: (id: string) => void;
  onDeleteItem: (id: string) => void;
  currentUser?: User | null;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  language,
  onReSpeak,
  onAddToSentence,
  onClearHistory,
  onToggleFavorite,
  onDeleteItem,
  currentUser,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'aac' | 'sign' | 'voice' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Statistics calculation
  const totalCount = history.length;
  const aacCount = history.filter((h) => h.type === 'aac').length;
  const signCount = history.filter((h) => h.type === 'sign').length;
  const voiceCount = history.filter((h) => h.type === 'voice').length;
  const favoriteCount = history.filter((h) => h.isFavorite).length;

  // Filter and search
  const filteredHistory = history.filter((item) => {
    // Type / Favorite filter
    if (filterType === 'favorites' && !item.isFavorite) return false;
    if (filterType !== 'all' && filterType !== 'favorites' && item.type !== filterType) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchEn = item.textEn.toLowerCase().includes(q);
      const matchTa = item.textTa.includes(searchQuery);
      const matchSpoken = item.spokenText.toLowerCase().includes(q);
      if (!matchEn && !matchTa && !matchSpoken) return false;
    }

    return true;
  });

  const handleCopy = (item: HistoryItem) => {
    const text = language === 'ta' ? item.textTa : item.textEn;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleExportCSV = () => {
    if (history.length === 0) return;
    const header = 'Timestamp,Type,Language,English,Tamil,SpokenText,Favorite\n';
    const rows = history
      .map(
        (h) =>
          `"${new Date(h.timestamp).toISOString()}","${h.type}","${h.language}","${h.textEn.replace(/"/g, '""')}","${h.textTa.replace(/"/g, '""')}","${h.spokenText.replace(/"/g, '""')}","${h.isFavorite ? 'Yes' : 'No'}"`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `kural_aac_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTypeIcon = (type: HistoryItem['type']) => {
    switch (type) {
      case 'sign':
        return <HandMetal className="w-4 h-4 text-[#20B8A6]" />;
      case 'voice':
        return <Mic className="w-4 h-4 text-purple-600" />;
      default:
        return <Grid3X3 className="w-4 h-4 text-[#3478F6]" />;
    }
  };

  const getTypeName = (type: HistoryItem['type']) => {
    switch (type) {
      case 'sign':
        return language === 'ta' ? 'சைகை மொழி' : 'Sign Gesture';
      case 'voice':
        return language === 'ta' ? 'குரல்' : 'Voice Assistant';
      default:
        return language === 'ta' ? 'AAC பலகை' : 'AAC Board';
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header & Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-5 bg-white rounded-2xl border border-[#E5EAF0]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base md:text-lg font-bold text-[#243247]">
              {language === 'ta' ? 'தொடர்பாடல் வரலாறு & பதிவுகள்' : 'Communication History & Logs'}
            </h2>
            {currentUser && (
              <span className="text-xs text-[#718096] hidden md:inline">
                · {currentUser.name}
              </span>
            )}
          </div>
          <p className="text-xs text-[#718096] mt-0.5">
            {language === 'ta'
              ? 'முன்னர் பேசிய அனைத்து வாக்கியங்கள், சைகை மொழி மொழிபெயர்ப்புகள் மற்றும் விருப்பமான சொற்றொடர்கள்.'
              : 'Complete log of spoken AAC sentences, recognized sign gestures, and voice queries.'}
          </p>
        </div>

        {/* Clear & Export actions */}
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#243247] bg-[#F7FAFC] hover:bg-slate-100 border border-[#E5EAF0] transition-colors"
                title="Export history as CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>{language === 'ta' ? 'பதிவிறக்கு' : 'Export CSV'}</span>
              </button>

              <button
                onClick={() => setShowConfirmClear(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50/50 hover:bg-rose-50 border border-rose-200/60 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{language === 'ta' ? 'அழி' : 'Clear All'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Analytics Summary Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl border border-[#E5EAF0] p-4 flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-[#EAF2FF] text-[#3478F6] flex items-center justify-center shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-extrabold text-[#243247] font-mono-num">{totalCount}</p>
            <p className="text-[11px] text-[#718096] font-medium leading-none">
              {language === 'ta' ? 'மொத்த வாக்கியங்கள்' : 'Total Phrases'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5EAF0] p-4 flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 fill-amber-500" />
          </div>
          <div>
            <p className="text-lg font-extrabold text-[#243247] font-mono-num">{favoriteCount}</p>
            <p className="text-[11px] text-[#718096] font-medium leading-none">
              {language === 'ta' ? 'விருப்பமானவை' : 'Favorites'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5EAF0] p-4 flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-[#E8F8F2] text-[#20B8A6] flex items-center justify-center shrink-0">
            <HandMetal className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-extrabold text-[#243247] font-mono-num">{signCount}</p>
            <p className="text-[11px] text-[#718096] font-medium leading-none">
              {language === 'ta' ? 'சைகை சிக்னல்கள்' : 'Sign Gestures'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E5EAF0] p-4 flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <p className="text-lg font-extrabold text-[#243247] font-mono-num">{voiceCount}</p>
            <p className="text-[11px] text-[#718096] font-medium leading-none">
              {language === 'ta' ? 'குரல் உள்ளீடுகள்' : 'Voice Inputs'}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 md:pb-0 scrollbar-none">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
              filterType === 'all'
                ? 'bg-[#3478F6] text-white shadow-xs'
                : 'bg-white text-[#718096] hover:text-[#243247] border border-[#E5EAF0]'
            }`}
          >
            {language === 'ta' ? 'அனைத்தும்' : 'All'} ({totalCount})
          </button>
          <button
            onClick={() => setFilterType('favorites')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
              filterType === 'favorites'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-white text-[#718096] hover:text-[#243247] border border-[#E5EAF0]'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${filterType === 'favorites' ? 'fill-white' : 'text-amber-500'}`} />
            <span>{language === 'ta' ? 'விருப்பமானவை' : 'Favorites'} ({favoriteCount})</span>
          </button>
          <button
            onClick={() => setFilterType('aac')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
              filterType === 'aac'
                ? 'bg-[#3478F6] text-white shadow-xs'
                : 'bg-white text-[#718096] hover:text-[#243247] border border-[#E5EAF0]'
            }`}
          >
            {language === 'ta' ? 'AAC பலகை' : 'AAC Board'} ({aacCount})
          </button>
          <button
            onClick={() => setFilterType('sign')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
              filterType === 'sign'
                ? 'bg-[#20B8A6] text-white shadow-xs'
                : 'bg-white text-[#718096] hover:text-[#243247] border border-[#E5EAF0]'
            }`}
          >
            {language === 'ta' ? 'சைகை மொழி' : 'Sign'} ({signCount})
          </button>
          <button
            onClick={() => setFilterType('voice')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
              filterType === 'voice'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-[#718096] hover:text-[#243247] border border-[#E5EAF0]'
            }`}
          >
            {language === 'ta' ? 'குரல்' : 'Voice'} ({voiceCount})
          </button>
        </div>

        {/* Search input */}
        <div className="relative md:w-64 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ta' ? 'வரலாற்றில் தேட...' : 'Search logs...'}
            className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-white border border-[#E5EAF0] rounded-xl text-[#243247] placeholder:text-slate-400 focus:border-[#3478F6] focus:outline-hidden"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* History Items List */}
      {filteredHistory.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5EAF0] p-12 text-center max-w-md mx-auto">
          <History className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-[#243247]">
            {language === 'ta' ? 'பதிவுகள் எதுவும் கிடைக்கவில்லை' : 'No Matching Communications'}
          </h3>
          <p className="text-xs text-[#718096] mt-1">
            {language === 'ta'
              ? 'தேடல் சொல் அல்லது வடிகட்டியை மாற்றி முயற்சிக்கவும்.'
              : 'Try adjusting your search criteria or switch filter tabs.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-slate-300 transition-all ${
                item.isFavorite ? 'border-amber-200/80 bg-amber-50/15' : 'border-[#E5EAF0]'
              }`}
            >
              <div className="space-y-1 flex-1 pr-2">
                <div className="flex items-center gap-2 text-xs text-[#718096]">
                  {getTypeIcon(item.type)}
                  <span className="font-semibold text-[#243247]">{getTypeName(item.type)}</span>
                  <span>·</span>
                  <span className="font-mono-num">
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span>·</span>
                  <span className="uppercase text-[10px] font-bold tracking-wider">
                    {item.language === 'ta' ? 'தமிழ்' : 'English'}
                  </span>
                </div>

                <p className="text-base font-bold text-[#243247] leading-snug">
                  {language === 'ta' ? item.textTa : item.textEn}
                </p>
                <p className="text-xs text-[#718096]">
                  {language === 'ta' ? item.textEn : item.textTa}
                </p>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {/* Favorite Star */}
                <button
                  onClick={() => onToggleFavorite(item.id)}
                  className={`p-2 rounded-xl transition-colors ${
                    item.isFavorite
                      ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                      : 'text-slate-300 hover:text-amber-500 hover:bg-slate-50'
                  }`}
                  title={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  aria-label="Toggle favorite"
                >
                  <Star className={`w-4 h-4 ${item.isFavorite ? 'fill-amber-500' : ''}`} />
                </button>

                {/* Re-Speak Button */}
                <button
                  onClick={() => onReSpeak(item)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#3478F6] hover:bg-[#2563EB] shadow-2xs transition-colors"
                  title="Speak phrase aloud"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{language === 'ta' ? 'பேசு' : 'Speak'}</span>
                </button>

                {/* Add to Sentence Builder */}
                <button
                  onClick={() => onAddToSentence(item)}
                  className="p-2 rounded-xl text-slate-500 hover:text-[#3478F6] hover:bg-[#EAF2FF] border border-[#E5EAF0] transition-colors"
                  title="Insert into Sentence Builder"
                  aria-label="Insert into sentence builder"
                >
                  <PlusCircle className="w-4 h-4" />
                </button>

                {/* Copy Text */}
                <button
                  onClick={() => handleCopy(item)}
                  className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-[#E5EAF0] transition-colors"
                  title="Copy phrase"
                  aria-label="Copy phrase"
                >
                  {copiedId === item.id ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

                {/* Delete single item */}
                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="p-2 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete from history"
                  aria-label="Delete entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal for Clearing History */}
      {showConfirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-xl border border-[#E5EAF0]">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-[#243247]">
              {language === 'ta' ? 'அனைத்து வரலாற்றையும் அழிக்க வேண்டுமா?' : 'Clear Entire History?'}
            </h3>
            <p className="text-xs text-[#718096] mt-1.5 leading-relaxed">
              {language === 'ta'
                ? 'இதுவரை பதிவு செய்யப்பட்ட அனைத்து உரையாடல் வாக்கியங்களும் நிரந்தரமாக நீக்கப்படும்.'
                : 'All saved sentences and recognition logs will be permanently deleted.'}
            </p>

            <div className="flex items-center justify-end gap-2.5 mt-6">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                {language === 'ta' ? 'ரத்து' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  onClearHistory();
                  setShowConfirmClear(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-xs transition-colors"
              >
                {language === 'ta' ? 'ஆம், அழி' : 'Yes, Clear All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
