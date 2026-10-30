import React, { useState, useEffect, useCallback } from 'react';
import {
  NavigationTab,
  Language,
  SentenceToken,
  AACItem,
  HistoryItem,
  SettingsState,
  User,
} from './types';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { SentenceBuilder } from './components/SentenceBuilder';
import { AACBoard } from './components/AACBoard';
import { SignAssistant } from './components/SignAssistant';
import { VoiceAssistant } from './components/VoiceAssistant';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { HelpView } from './components/HelpView';
import { HomeDashboard } from './components/HomeDashboard';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import {
  initVoices,
  speakText,
  stopSpeaking,
  isSpeaking,
  getTamilVoices,
  playAssistiveBeep,
} from './services/speechService';
import {
  clearHistory as clearRemoteHistory,
  clearSession,
  deleteHistoryItem as deleteRemoteHistoryItem,
  getSessionUser,
  loadCurrentUser,
  loadHistory,
  loadSettings,
  saveHistoryItem,
  saveSettings,
  updateHistoryItem,
} from './services/api';

const DEFAULT_SETTINGS: SettingsState = {
  language: 'en',
  autoSpeakAac: false,
  autoSpeakSign: true,
  speechRate: 1.0,
  speechPitch: 1.0,
  speechVolume: 1.0,
  selectedVoiceURI: '',
  highContrast: false,
  largeText: false,
  tapAudio: true,
};

const INITIAL_HISTORY: HistoryItem[] = [
  {
    id: 'hist_init_1',
    textEn: 'I want water',
    textTa: 'எனக்கு தண்ணீர் வேண்டும்',
    spokenText: 'I want water',
    language: 'en',
    type: 'aac',
    timestamp: Date.now() - 3600000,
    isFavorite: true,
  },
  {
    id: 'hist_init_2',
    textEn: 'Help',
    textTa: 'உதவி',
    spokenText: 'உதவி',
    language: 'ta',
    type: 'sign',
    timestamp: Date.now() - 1800000,
    isFavorite: true,
  },
  {
    id: 'hist_init_3',
    textEn: 'Thank you very much',
    textTa: 'மிக்க நன்றி',
    spokenText: 'Thank you very much',
    language: 'en',
    type: 'aac',
    timestamp: Date.now() - 900000,
    isFavorite: false,
  },
];

export default function App() {
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);
  const [isSpeakingNow, setIsSpeakingNow] = useState<boolean>(false);

  // Authentication State
  const [currentUser, setCurrentUserState] = useState<User | null>(() => getSessionUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Core preferences
  const [settings, setSettings] = useState<SettingsState>(() => {
    try {
      const saved = localStorage.getItem('kural_aac_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const language = settings.language;

  // Sentence Builder State
  const [sentenceTokens, setSentenceTokens] = useState<SentenceToken[]>([]);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('kural_aac_history');
      return saved ? JSON.parse(saved) : INITIAL_HISTORY;
    } catch {
      return INITIAL_HISTORY;
    }
  });
  const [isRemoteDataLoaded, setIsRemoteDataLoaded] = useState(false);

  // Recent recognized sign gesture for cross-screen sentence insertion
  const [recentRecognizedSign, setRecentRecognizedSign] = useState<{
    signEn: string;
    signTa: string;
  } | null>(null);

  // Available browser speech voices
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [hasTamilVoice, setHasTamilVoice] = useState<boolean>(false);

  // Initialize speech voices
  useEffect(() => {
    initVoices().then((loadedVoices) => {
      setVoices(loadedVoices);
      const taVoices = getTamilVoices(loadedVoices);
      setHasTamilVoice(taVoices.length > 0);
    });
  }, []);

  // Restore the authenticated account and its MongoDB-backed data.
  useEffect(() => {
    if (!currentUser) {
      setIsRemoteDataLoaded(false);
      return;
    }
    let active = true;
    Promise.all([loadCurrentUser(), loadHistory(), loadSettings()])
      .then(([userResult, historyResult, settingsResult]) => {
        if (!active) return;
        setCurrentUserState(userResult);
        setHistory(historyResult.history);
        if (settingsResult.settings) setSettings(settingsResult.settings);
        setIsRemoteDataLoaded(true);
      })
      .catch((error) => {
        console.warn('Unable to load account data from the API:', error);
        setIsRemoteDataLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [currentUser?.id]);

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kural_aac_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Unable to persist settings to localStorage:', e);
    }
    if (currentUser && isRemoteDataLoaded) {
      saveSettings(settings).catch((error) => console.warn('Unable to persist settings:', error));
    }
  }, [settings, currentUser, isRemoteDataLoaded]);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kural_aac_history', JSON.stringify(history));
    } catch (e) {
      console.warn('Unable to persist history to localStorage:', e);
    }
    if (currentUser && isRemoteDataLoaded) {
      history.forEach((item) => {
        saveHistoryItem(item).catch((error) => console.warn('Unable to persist history item:', error));
      });
    }
  }, [history, currentUser, isRemoteDataLoaded]);

  // Periodic polling for speech completion
  useEffect(() => {
    const timer = setInterval(() => {
      setIsSpeakingNow(isSpeaking());
    }, 250);
    return () => clearInterval(timer);
  }, []);

  // User Authentication Handlers
  const handleAuthSuccess = (user: User) => {
    setCurrentUserState(user);
    if (user.preferredLanguage) {
      setSettings((prev) => ({ ...prev, language: user.preferredLanguage }));
    }
  };

  const handleLogout = () => {
    clearSession();
    setCurrentUserState(null);
    setIsRemoteDataLoaded(false);
  };

  const handleSwitchUser = (user: User) => {
    setCurrentUserState(user);
    if (user.preferredLanguage) {
      setSettings((prev) => ({ ...prev, language: user.preferredLanguage }));
    }
  };

  // Language Change Handler
  const handleLanguageChange = (newLang: Language) => {
    if (settings.tapAudio) playAssistiveBeep();
    setSettings((prev) => ({ ...prev, language: newLang }));
  };

  // Add AAC Item to Sentence
  const handleSelectAACItem = (item: AACItem) => {
    const newToken: SentenceToken = {
      id: `${item.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sourceId: item.id,
      labelEn: item.labelEn,
      labelTa: item.labelTa,
      speechTextEn: item.speechTextEn || item.labelEn,
      speechTextTa: item.speechTextTa || item.labelTa,
      category: item.category,
    };

    setSentenceTokens((prev) => [...prev, newToken]);

    // If auto-speak is enabled for AAC cards
    if (settings.autoSpeakAac) {
      const text = language === 'ta' ? newToken.speechTextTa : newToken.speechTextEn;
      handleSpeakText(text, language);
    }
  };

  // Speak single AAC item immediately
  const handleSpeakSingleItem = (item: AACItem) => {
    const text = language === 'ta' ? (item.speechTextTa || item.labelTa) : (item.speechTextEn || item.labelEn);
    handleSpeakText(text, language);
  };

  // Speak full Sentence Builder content
  const handleSpeakSentence = () => {
    if (sentenceTokens.length === 0) return;

    const fullSentenceEn = sentenceTokens.map((t) => t.labelEn).join(' ');
    const fullSentenceTa = sentenceTokens.map((t) => t.labelTa).join(' ');
    const spokenText = language === 'ta' ? fullSentenceTa : fullSentenceEn;

    handleSpeakText(spokenText, language);

    // Record into history
    const historyEntry: HistoryItem = {
      id: `hist_aac_${Date.now()}`,
      userId: currentUser?.id,
      textEn: fullSentenceEn,
      textTa: fullSentenceTa,
      spokenText,
      language,
      type: 'aac',
      timestamp: Date.now(),
      isFavorite: false,
    };

    setHistory((prev) => [historyEntry, ...prev]);
  };

  // Global speech helper
  const handleSpeakText = (text: string, lang: Language) => {
    setIsSpeakingNow(true);
    speakText(text, lang, {
      rate: settings.speechRate,
      pitch: settings.speechPitch,
      volume: settings.speechVolume,
      voiceURI: settings.selectedVoiceURI,
      onEnd: () => setIsSpeakingNow(false),
      onError: () => setIsSpeakingNow(false),
    });
  };

  const handleStopSpeech = () => {
    stopSpeaking();
    setIsSpeakingNow(false);
  };

  // Sentence Builder Token actions
  const handleRemoveToken = (tokenId: string) => {
    if (settings.tapAudio) playAssistiveBeep();
    setSentenceTokens((prev) => prev.filter((t) => t.id !== tokenId));
  };

  const handleClearAllTokens = () => {
    if (settings.tapAudio) playAssistiveBeep();
    setSentenceTokens([]);
  };

  const handleUndoToken = () => {
    if (settings.tapAudio) playAssistiveBeep();
    setSentenceTokens((prev) => prev.slice(0, -1));
  };

  // Add Recognized Sign Gesture into Sentence Builder
  const handleAddSignToSentence = (sign: { signEn: string; signTa: string }) => {
    if (settings.tapAudio) playAssistiveBeep();
    setRecentRecognizedSign(sign);

    const signToken: SentenceToken = {
      id: `sign_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sourceId: `sign_${sign.signEn}`,
      labelEn: sign.signEn,
      labelTa: sign.signTa,
      speechTextEn: sign.signEn,
      speechTextTa: sign.signTa,
      category: 'sign',
    };

    setSentenceTokens((prev) => [...prev, signToken]);

    // Also record into history
    setHistory((prev) => [
      {
        id: `hist_sign_${Date.now()}`,
        userId: currentUser?.id,
        textEn: sign.signEn,
        textTa: sign.signTa,
        spokenText: language === 'ta' ? sign.signTa : sign.signEn,
        language,
        type: 'sign',
        timestamp: Date.now(),
        isFavorite: false,
      },
      ...prev,
    ]);
  };

  // Add phrase from Voice Assistant to Sentence Builder
  const handleAddVoicePhraseToSentence = (phrase: { en: string; ta: string }) => {
    if (settings.tapAudio) playAssistiveBeep();
    const token: SentenceToken = {
      id: `voice_${Date.now()}`,
      sourceId: `voice_item`,
      labelEn: phrase.en,
      labelTa: phrase.ta,
      speechTextEn: phrase.en,
      speechTextTa: phrase.ta,
      category: 'phrases',
    };
    setSentenceTokens((prev) => [...prev, token]);
    setActiveTab('aac');
  };

  // Re-speak History item
  const handleReSpeakHistory = (item: HistoryItem) => {
    handleSpeakText(item.spokenText, item.language);
  };

  // Add History item back into sentence builder
  const handleAddHistoryToSentence = (item: HistoryItem) => {
    if (settings.tapAudio) playAssistiveBeep();
    const token: SentenceToken = {
      id: `hist_reuse_${Date.now()}`,
      sourceId: item.id,
      labelEn: item.textEn,
      labelTa: item.textTa,
      speechTextEn: item.textEn,
      speechTextTa: item.textTa,
      category: 'phrases',
    };
    setSentenceTokens((prev) => [...prev, token]);
    setActiveTab('aac');
  };

  // Toggle favorite status on a history item
  const handleToggleFavorite = (id: string) => {
    if (settings.tapAudio) playAssistiveBeep();
    setHistory((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
    if (currentUser) {
      const item = history.find((entry) => entry.id === id);
      if (item) updateHistoryItem(id, { isFavorite: !item.isFavorite }).catch(console.warn);
    }
  };

  // Delete single history item
  const handleDeleteHistoryItem = (id: string) => {
    if (settings.tapAudio) playAssistiveBeep();
    setHistory((prev) => prev.filter((item) => item.id !== id));
    if (currentUser) deleteRemoteHistoryItem(id).catch(console.warn);
  };

  // Clear communication history
  const handleClearHistory = () => {
    setHistory([]);
    try { localStorage.removeItem('kural_aac_history'); } catch {}
    if (currentUser) clearRemoteHistory().catch(console.warn);
  };

  // Global Keyboard shortcuts (Space = Speak sentence, Escape = Clear sentence)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing inside an input or textarea
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }

      if (e.code === 'Space' && sentenceTokens.length > 0) {
        e.preventDefault();
        handleSpeakSentence();
      } else if (e.code === 'Escape' && sentenceTokens.length > 0) {
        e.preventDefault();
        handleClearAllTokens();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sentenceTokens, language]);

  return (
    <div
      className={`min-h-screen flex bg-[#F7FAFC] text-[#243247] ${
        settings.largeText ? 'text-base' : 'text-sm'
      }`}
    >
      {/* Slim Modern Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        language={language}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
        isSpeakingNow={isSpeakingNow}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navigation Bar */}
        <TopNav
          activeTab={activeTab}
          language={language}
          onLanguageChange={handleLanguageChange}
          onToggleMobileMenu={() => setIsOpenMobile(true)}
          isSpeaking={isSpeakingNow}
          onStopSpeech={handleStopSpeech}
          hasTamilVoice={hasTamilVoice}
          currentUser={currentUser}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
        />

        {/* Viewport Content Container */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {/* TAB 1: Home Dashboard */}
          {activeTab === 'home' && (
            <HomeDashboard
              language={language}
              onLanguageChange={handleLanguageChange}
              onNavigateTab={setActiveTab}
              recentHistory={history}
              onReSpeak={handleReSpeakHistory}
              currentUser={currentUser}
              onOpenAuth={() => setIsAuthModalOpen(true)}
              onOpenProfile={() => setIsProfileModalOpen(true)}
            />
          )}

          {/* TAB 2: AAC Communication Board */}
          {activeTab === 'aac' && (
            <div className="space-y-4">
              {/* Sentence Builder at top */}
              <SentenceBuilder
                tokens={sentenceTokens}
                language={language}
                onRemoveToken={handleRemoveToken}
                onClearAll={handleClearAllTokens}
                onUndo={handleUndoToken}
                onSpeakSentence={handleSpeakSentence}
                isSpeaking={isSpeakingNow}
                onNavigateToSign={() => setActiveTab('sign')}
                recentRecognizedSign={recentRecognizedSign}
                onAddSignToSentence={handleAddSignToSentence}
              />

              {/* Symbol Category Cards */}
              <AACBoard
                language={language}
                onSelectItem={handleSelectAACItem}
                onSpeakSingleItem={handleSpeakSingleItem}
                playTapSound={() => {
                  if (settings.tapAudio) playAssistiveBeep();
                }}
              />
            </div>
          )}

          {/* TAB 3: Sign Language Assistant */}
          {activeTab === 'sign' && (
            <SignAssistant
              language={language}
              onLanguageChange={handleLanguageChange}
              onSpeakText={handleSpeakText}
              onAddSignToSentence={handleAddSignToSentence}
              onNavigateToAac={() => setActiveTab('aac')}
              onNavigateToVoice={(text) => {
                setActiveTab('voice');
              }}
              autoSpeakPreference={settings.autoSpeakSign}
              onToggleAutoSpeak={(val) =>
                setSettings((prev) => ({ ...prev, autoSpeakSign: val }))
              }
            />
          )}

          {/* TAB 4: Voice Assistant */}
          {activeTab === 'voice' && (
            <VoiceAssistant
              language={language}
              onLanguageChange={handleLanguageChange}
              voices={voices}
              hasTamilVoice={hasTamilVoice}
              selectedVoiceURI={settings.selectedVoiceURI}
              speechRate={settings.speechRate}
              speechPitch={settings.speechPitch}
              speechVolume={settings.speechVolume}
              onAddPhraseToSentence={handleAddVoicePhraseToSentence}
              onRecordHistory={(item) => {
                setHistory((prev) => [
                  {
                    id: `hist_voice_${Date.now()}`,
                    userId: currentUser?.id,
                    textEn: item.en,
                    textTa: item.ta,
                    spokenText: item.spokenText,
                    language: item.lang,
                    type: 'voice',
                    timestamp: Date.now(),
                    isFavorite: false,
                  },
                  ...prev,
                ]);
              }}
            />
          )}

          {/* TAB 5: Communication History */}
          {activeTab === 'history' && (
            <HistoryView
              history={history}
              language={language}
              onReSpeak={handleReSpeakHistory}
              onAddToSentence={handleAddHistoryToSentence}
              onClearHistory={handleClearHistory}
              onToggleFavorite={handleToggleFavorite}
              onDeleteItem={handleDeleteHistoryItem}
              currentUser={currentUser}
            />
          )}

          {/* TAB 6: Settings */}
          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={setSettings}
              voices={voices}
              onClearHistory={handleClearHistory}
            />
          )}

          {/* TAB 7: Help & Guide */}
          {activeTab === 'help' && (
            <HelpView
              language={language}
              onNavigateToTab={setActiveTab}
            />
          )}
        </main>
      </div>

      {/* Auth Modal (Login / Sign Up) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        currentLanguage={language}
      />

      {/* User Account Profile Modal */}
      {currentUser && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={currentUser}
          onUpdateUser={(updated) => setCurrentUserState(updated)}
          onLogout={handleLogout}
          onSwitchUser={handleSwitchUser}
          language={language}
        />
      )}
    </div>
  );
}
