import React, { useState } from 'react';
import {
  Droplets,
  Bath,
  Moon,
  HelpCircle,
  Pill,
  ShowerHead,
  Armchair,
  Wind,
  Utensils,
  Coffee,
  Citrus,
  Apple,
  Cookie,
  Smile,
  Frown,
  Zap,
  BatteryLow,
  Flame,
  Heart,
  Sparkles,
  User,
  UserCheck,
  HeartHandshake,
  Shield,
  Stethoscope,
  UserPlus,
  Users,
  Footprints,
  Music,
  BookOpen,
  Tv,
  AlertTriangle,
  PhoneCall,
  Check,
  X,
  MessageCircle,
  MessageSquare,
  OctagonAlert,
  Plus,
  MinusCircle,
  Search,
  Volume2,
  Filter,
} from 'lucide-react';
import { AACItem, CategoryId, Language } from '../types';
import { AAC_CATEGORIES, AAC_ITEMS } from '../data/aacCategories';

interface AACBoardProps {
  language: Language;
  onSelectItem: (item: AACItem) => void;
  onSpeakSingleItem: (item: AACItem) => void;
  playTapSound: () => void;
}

// Icon dictionary for high safety & performance
const ICON_MAP: Record<string, React.ElementType> = {
  Droplets,
  Bath,
  Moon,
  HelpCircle,
  Pill,
  ShowerHead,
  Armchair,
  Wind,
  Utensils,
  Coffee,
  Citrus,
  Apple,
  Cookie,
  Smile,
  Frown,
  Zap,
  BatteryLow,
  Flame,
  Heart,
  Sparkles,
  User,
  UserCheck,
  HeartHandshake,
  Shield,
  Stethoscope,
  UserPlus,
  Users,
  Footprints,
  Music,
  BookOpen,
  Tv,
  AlertTriangle,
  PhoneCall,
  Check,
  X,
  MessageCircle,
  MessageSquare,
  OctagonAlert,
  Plus,
  MinusCircle,
};

export const AACBoard: React.FC<AACBoardProps> = ({
  language,
  onSelectItem,
  onSpeakSingleItem,
  playTapSound,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = AAC_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      item.labelEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.labelTa.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const getCategoryBorder = (catId: CategoryId) => {
    switch (catId) {
      case 'emergency':
        return 'border-rose-200 hover:border-rose-400 bg-rose-50/30';
      case 'food':
        return 'border-orange-200 hover:border-orange-400 bg-orange-50/30';
      case 'feelings':
        return 'border-blue-200 hover:border-blue-400 bg-blue-50/30';
      case 'people':
        return 'border-purple-200 hover:border-purple-400 bg-purple-50/30';
      case 'activities':
        return 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/30';
      case 'phrases':
        return 'border-teal-200 hover:border-teal-400 bg-teal-50/30';
      default:
        return 'border-amber-200 hover:border-amber-400 bg-amber-50/30';
    }
  };

  const getIconColor = (catId: CategoryId) => {
    switch (catId) {
      case 'emergency':
        return 'text-rose-600 bg-rose-100/70';
      case 'food':
        return 'text-orange-600 bg-orange-100/70';
      case 'feelings':
        return 'text-[#3478F6] bg-[#EAF2FF]';
      case 'people':
        return 'text-purple-600 bg-purple-100/70';
      case 'activities':
        return 'text-emerald-600 bg-emerald-100/70';
      case 'phrases':
        return 'text-[#20B8A6] bg-[#E8F8F2]';
      default:
        return 'text-amber-600 bg-amber-100/70';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Category Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 md:pb-0 scrollbar-none">
          <button
            onClick={() => {
              playTapSound();
              setSelectedCategory('all');
            }}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-[#3478F6] text-white shadow-xs'
                : 'bg-white text-[#718096] hover:text-[#243247] border border-[#E5EAF0]'
            }`}
          >
            {language === 'ta' ? 'அனைத்தும்' : 'All Symbols'}
          </button>

          {AAC_CATEGORIES.map((cat) => {
            const isCatActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  playTapSound();
                  setSelectedCategory(cat.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  isCatActive
                    ? 'bg-[#3478F6] text-white shadow-xs'
                    : 'bg-white text-[#718096] hover:text-[#243247] border border-[#E5EAF0]'
                }`}
              >
                <span>{language === 'ta' ? cat.nameTa : cat.nameEn}</span>
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative shrink-0 md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ta' ? 'வார்த்தை தேட...' : 'Search symbols...'}
            className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-white border border-[#E5EAF0] rounded-xl text-[#243247] placeholder:text-slate-400 focus:border-[#3478F6] focus:ring-1 focus:ring-[#3478F6] focus:outline-hidden"
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

      {/* Grid of AAC symbol cards */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E5EAF0] p-12 text-center">
          <MessageCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-[#243247]">
            {language === 'ta' ? 'வார்த்தை கிடைக்கவில்லை' : 'No matching symbols'}
          </h3>
          <p className="text-xs text-[#718096] mt-1">
            {language === 'ta' ? 'வேறு தேடல் சொல்லை முயற்சிக்கவும்' : 'Try adjusting your search query or category filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {filteredItems.map((item) => {
            const IconComponent = ICON_MAP[item.iconName] || MessageSquare;
            const borderStyle = getCategoryBorder(item.category);
            const iconBg = getIconColor(item.category);

            return (
              <div
                key={item.id}
                className={`relative group flex flex-col items-center text-center p-3 sm:p-4 rounded-2xl border ${borderStyle} bg-white shadow-2xs hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all select-none`}
              >
                {/* Main card tap target */}
                <button
                  onClick={() => {
                    playTapSound();
                    onSelectItem(item);
                  }}
                  className="w-full flex flex-col items-center focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#3478F6] rounded-xl"
                  aria-label={`${item.labelEn} (${item.labelTa})`}
                >
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-2.5 transition-transform group-hover:scale-105 ${iconBg}`}
                  >
                    <IconComponent className="w-7 h-7 sm:w-8 sm:h-8" />
                  </div>

                  {/* Primary text in selected language */}
                  <span className="text-sm sm:text-base font-bold text-[#243247] leading-snug line-clamp-1">
                    {language === 'ta' ? item.labelTa : item.labelEn}
                  </span>

                  {/* Secondary translation label */}
                  <span className="text-[11px] text-[#718096] font-medium leading-none mt-1 line-clamp-1">
                    {language === 'ta' ? item.labelEn : item.labelTa}
                  </span>
                </button>

                {/* Instant Quick Speak icon */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playTapSound();
                    onSpeakSingleItem(item);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-lg text-slate-400 hover:text-[#3478F6] hover:bg-[#EAF2FF] opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity"
                  title={language === 'ta' ? 'உடனடியாக பேசு' : 'Speak immediately'}
                  aria-label={`Speak ${item.labelEn}`}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
