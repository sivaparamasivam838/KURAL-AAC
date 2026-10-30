import React from 'react';
import {
  LayoutDashboard,
  Grid3X3,
  HandMetal,
  Mic,
  History,
  Settings,
  HelpCircle,
  X,
  Volume2,
  LogIn,
  User as UserIcon,
} from 'lucide-react';
import { NavigationTab, Language, User } from '../types';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  language: Language;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isSpeakingNow: boolean;
  currentUser: User | null;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
}

interface NavItemConfig {
  id: NavigationTab;
  labelEn: string;
  labelTa: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItemConfig[] = [
  { id: 'home', labelEn: 'Home', labelTa: 'முகப்பு', icon: LayoutDashboard },
  { id: 'aac', labelEn: 'AAC Communication', labelTa: 'AAC பலகை', icon: Grid3X3 },
  { id: 'sign', labelEn: 'Sign Language Assistant', labelTa: 'சைகை மொழி', icon: HandMetal },
  { id: 'voice', labelEn: 'Voice Assistant', labelTa: 'குரல் உதவி', icon: Mic },
  { id: 'history', labelEn: 'Communication History', labelTa: 'வரலாறு', icon: History },
  { id: 'settings', labelEn: 'Settings', labelTa: 'அமைப்புகள்', icon: Settings },
  { id: 'help', labelEn: 'Help and Support', labelTa: 'உதவி & வழிகாட்டி', icon: HelpCircle },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  language,
  isOpenMobile,
  onCloseMobile,
  isSpeakingNow,
  currentUser,
  onOpenAuth,
  onOpenProfile,
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex flex-col w-64 bg-white border-r border-[#E5EAF0] transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5EAF0]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#EAF2FF] text-[#3478F6] shadow-xs">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-[#243247]">
                Kural AAC
              </span>
              <p className="text-[11px] text-[#718096] font-medium leading-none mt-0.5">
                {language === 'ta' ? 'உதவி தொடர்பாடல்' : 'Assistive Voice & Sign'}
              </p>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg md:hidden hover:bg-slate-50"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation items list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-[#EAF2FF] text-[#3478F6] font-semibold'
                    : 'text-[#243247] hover:bg-[#F7FAFC] hover:text-[#3478F6]'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive ? 'text-[#3478F6]' : 'text-[#718096]'
                  }`}
                />
                <span className="truncate">
                  {language === 'ta' ? item.labelTa : item.labelEn}
                </span>

                {item.id === 'voice' && isSpeakingNow && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-[#3478F6] animate-pulse" title="Voice active" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Account Bar in Sidebar */}
        <div className="p-3 mx-3 mb-3 rounded-2xl bg-[#F7FAFC] border border-[#E5EAF0]">
          {currentUser ? (
            <div
              onClick={() => {
                onOpenProfile();
                onCloseMobile();
              }}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E5EAF0] flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                {currentUser.avatar}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#243247] truncate group-hover:text-[#3478F6] transition-colors">
                  {language === 'ta' && currentUser.nameTa ? currentUser.nameTa : currentUser.name}
                </p>
                <p className="text-[10px] text-[#718096] capitalize truncate">
                  {currentUser.role}
                </p>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                onOpenAuth();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-[#3478F6] bg-[#EAF2FF] hover:bg-[#D8E7FF] rounded-xl transition-colors"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? 'உள்நுழைக / பதிவு' : 'Sign In / Register'}</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
