/**
 * Web Speech Synthesis and Audio feedback service
 */

import { Language } from '../types';

let cachedVoices: SpeechSynthesisVoice[] = [];

export function initVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve([]);
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      cachedVoices = voices;
      resolve(voices);
      return;
    }

    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoices = window.speechSynthesis.getVoices();
      resolve(cachedVoices);
    };

    // Fallback if event doesn't fire promptly
    setTimeout(() => {
      cachedVoices = window.speechSynthesis.getVoices();
      resolve(cachedVoices);
    }, 500);
  });
}

export function getTamilVoices(voices: SpeechSynthesisVoice[] = cachedVoices): SpeechSynthesisVoice[] {
  return voices.filter(
    (v) =>
      v.lang.toLowerCase().startsWith('ta') ||
      v.name.toLowerCase().includes('tamil') ||
      v.lang.toLowerCase().includes('in') && v.name.toLowerCase().includes('tamil')
  );
}

export function getEnglishVoices(voices: SpeechSynthesisVoice[] = cachedVoices): SpeechSynthesisVoice[] {
  return voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
}

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voiceURI?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

export function speakText(
  text: string,
  lang: Language = 'en',
  options: SpeakOptions = {}
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser environment.');
    return false;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  if (!text || !text.trim()) return false;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options.rate ?? 1.0;
  utterance.pitch = options.pitch ?? 1.0;
  utterance.volume = options.volume ?? 1.0;

  const targetLang = lang === 'ta' ? 'ta-IN' : 'en-US';
  utterance.lang = targetLang;

  const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();

  if (options.voiceURI) {
    const matchedVoice = voices.find((v) => v.voiceURI === options.voiceURI);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
  }

  // If no voice explicitly selected, choose best match for language
  if (!utterance.voice) {
    if (lang === 'ta') {
      const taVoices = getTamilVoices(voices);
      if (taVoices.length > 0) {
        utterance.voice = taVoices[0];
      }
    } else {
      const enVoice = voices.find((v) => v.lang.startsWith('en') && v.default) ||
                      voices.find((v) => v.lang.startsWith('en-US')) ||
                      voices.find((v) => v.lang.startsWith('en'));
      if (enVoice) {
        utterance.voice = enVoice;
      }
    }
  }

  utterance.onstart = () => {
    if (options.onStart) options.onStart();
  };

  utterance.onend = () => {
    if (options.onEnd) options.onEnd();
  };

  utterance.onerror = (e) => {
    console.error('Speech synthesis error:', e);
    if (options.onError) options.onError(e);
  };

  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeaking(): boolean {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
}

// Gentle audio click for tactile assistive feedback
export function playAssistiveBeep(frequency = 520, durationMs = 60): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + durationMs / 1000);
  } catch (err) {
    // Ignore audio context autoplay limitations
  }
}
