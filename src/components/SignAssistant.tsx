import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  HandMetal,
  Volume2,
  PlusCircle,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Language, RecognizedSign } from '../types';
import { analyzeVideoFrame, VOCABULARY_SIGNS, DetectedSignResult } from '../services/gestureService';

interface SignAssistantProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onSpeakText: (text: string, lang: Language) => void;
  onAddSignToSentence: (sign: { signEn: string; signTa: string }) => void;
  onNavigateToAac: () => void;
  onNavigateToVoice: (initialText?: string) => void;
  autoSpeakPreference: boolean;
  onToggleAutoSpeak: (val: boolean) => void;
}

export const SignAssistant: React.FC<SignAssistantProps> = ({
  language,
  onLanguageChange,
  onSpeakText,
  onAddSignToSentence,
  onNavigateToAac,
  onNavigateToVoice,
  autoSpeakPreference,
  onToggleAutoSpeak,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameId = useRef<number | null>(null);

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isDetecting, setIsDetecting] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [activeSign, setActiveSign] = useState<DetectedSignResult | null>(null);
  const [recentSigns, setRecentSigns] = useState<RecognizedSign[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('Camera is standby.');
  const lastSpokenSignRef = useRef<string | null>(null);
  const stableCountRef = useRef<number>(0);

  // Start Camera
  const startCamera = async () => {
    setCameraError(null);
    setStatusMessage(language === 'ta' ? 'கேமரா இயக்கப்படுகிறது...' : 'Starting camera...');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsCameraActive(true);
          setStatusMessage(
            language === 'ta'
              ? 'கை சைகைகளை கேமரா முன் காட்டவும்'
              : 'Show hand signs in front of the camera.'
          );
        };
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setIsCameraActive(false);
      let errMsg = 'Unable to access camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errMsg = 'Camera permission was denied. Please allow camera access in your browser settings.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errMsg = 'No video camera was found on your device.';
      }
      setCameraError(errMsg);
      setStatusMessage(errMsg);
    }
  };

  // Stop Camera
  const stopCamera = useCallback(() => {
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setStatusMessage(language === 'ta' ? 'கேமரா நிறுத்தப்பட்டது.' : 'Camera stopped.');
  }, [language]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Frame processing loop when camera is active
  useEffect(() => {
    if (!isCameraActive || !isDetecting) return;

    let isSubscribed = true;

    const processFrame = () => {
      if (!isSubscribed) return;

      if (videoRef.current && canvasRef.current && videoRef.current.readyState >= 2) {
        const result = analyzeVideoFrame(videoRef.current, canvasRef.current);

        if (result) {
          setActiveSign((prev) => {
            // Stability check
            if (prev && prev.signEn === result.signEn) {
              stableCountRef.current += 1;
            } else {
              stableCountRef.current = 1;
            }

            // Once sign is stable for >= 5 consecutive frames, register it
            if (stableCountRef.current === 5) {
              // Add to recent signs
              setRecentSigns((history) => [
                {
                  signEn: result.signEn,
                  signTa: result.signTa,
                  confidence: result.confidence,
                  timestamp: Date.now(),
                },
                ...history.slice(0, 5),
              ]);

              // If auto-speak is enabled and not recently spoken
              if (autoSpeakPreference && lastSpokenSignRef.current !== result.signEn) {
                lastSpokenSignRef.current = result.signEn;
                const textToSpeak = language === 'ta' ? result.signTa : result.signEn;
                onSpeakText(textToSpeak, language);
              }
            }

            return result;
          });
        }
      }

      animFrameId.current = requestAnimationFrame(processFrame);
    };

    animFrameId.current = requestAnimationFrame(processFrame);

    return () => {
      isSubscribed = false;
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [isCameraActive, isDetecting, autoSpeakPreference, language, onSpeakText]);

  // Manual Recognize Current Pose Trigger
  const handleRecognizeNow = () => {
    if (!isCameraActive) {
      startCamera();
      return;
    }
    if (videoRef.current && canvasRef.current) {
      const res = analyzeVideoFrame(videoRef.current, canvasRef.current);
      if (res) {
        setActiveSign(res);
        setRecentSigns((prev) => [
          {
            signEn: res.signEn,
            signTa: res.signTa,
            confidence: res.confidence,
            timestamp: Date.now(),
          },
          ...prev.slice(0, 5),
        ]);
        if (autoSpeakPreference) {
          const textToSpeak = language === 'ta' ? res.signTa : res.signEn;
          onSpeakText(textToSpeak, language);
        }
      }
    }
  };

  const handleClearSign = () => {
    setActiveSign(null);
    lastSpokenSignRef.current = null;
    stableCountRef.current = 0;
  };

  const handleSpeakActive = () => {
    if (!activeSign) return;
    const textToSpeak = language === 'ta' ? activeSign.signTa : activeSign.signEn;
    onSpeakText(textToSpeak, language);
  };

  const handleAddSign = () => {
    if (!activeSign) return;
    onAddSignToSentence({ signEn: activeSign.signEn, signTa: activeSign.signTa });
  };

  return (
    <div className="space-y-6">
      {/* Introduction banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-[#E5EAF0]">
        <div>
          <h2 className="text-base font-bold text-[#243247]">
            {language === 'ta' ? 'சைகை மொழி அடையாளம் மற்றும் குரல்' : 'Real-Time Sign Language Assistant'}
          </h2>
          <p className="text-xs text-[#718096] mt-0.5">
            {language === 'ta'
              ? 'ஓபன்சிவி (OpenCV) கணினி பார்வை மூலம் கை சைகைகளை உணர்ந்து குரலாக மாற்றுகிறது.'
              : 'Translates hand gesture signs into speech and sends recognized phrases to the AAC sentence builder.'}
          </p>
        </div>

        {/* Language selector for sign output */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-medium text-[#718096]">
            {language === 'ta' ? 'மொழி:' : 'Output:'}
          </span>
          <div className="flex items-center p-0.5 rounded-lg bg-[#F7FAFC] border border-[#E5EAF0]">
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md ${
                language === 'en' ? 'bg-white text-[#3478F6] shadow-xs' : 'text-slate-600'
              }`}
            >
              English
            </button>
            <button
              onClick={() => onLanguageChange('ta')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md font-tamil ${
                language === 'ta' ? 'bg-white text-[#3478F6] shadow-xs' : 'text-slate-600'
              }`}
            >
              தமிழ்
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Balanced Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL: Live Camera (7 cols on desktop) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E5EAF0] p-4 md:p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF0] mb-3">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#3478F6]" />
              <span className="text-xs font-semibold text-[#243247] uppercase tracking-wider">
                {language === 'ta' ? 'நேரடி கேமரா முன்னோட்டம்' : 'Live Camera Feed'}
              </span>
            </div>

            {/* Camera Status */}
            <div className="flex items-center gap-1.5 text-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  isCameraActive ? 'bg-[#20B8A6] animate-pulse' : 'bg-slate-300'
                }`}
              />
              <span className="text-[#718096] font-medium">
                {isCameraActive
                  ? language === 'ta'
                    ? 'கேமரா இயங்குகிறது'
                    : 'Active'
                  : language === 'ta'
                  ? 'நிறுத்தப்பட்டுள்ளது'
                  : 'Standby'}
              </span>
            </div>
          </div>

          {/* Camera Frame Viewport */}
          <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-slate-900/5 border border-slate-200/80 flex items-center justify-center">
            {/* Hidden Video element for feed */}
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover hidden"
              playsInline
              muted
            />

            {/* Active Canvas with CV Overlays */}
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className={`w-full h-full object-cover ${!isCameraActive ? 'hidden' : 'block'}`}
            />

            {/* Standby / Inactive Overlay */}
            {!isCameraActive && !cameraError && (
              <div className="flex flex-col items-center justify-center p-6 text-center max-w-sm">
                <div className="w-14 h-14 rounded-2xl bg-[#EAF2FF] text-[#3478F6] flex items-center justify-center mb-3">
                  <Camera className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-semibold text-[#243247]">
                  {language === 'ta' ? 'கேமரா தயார் நிலையில் உள்ளது' : 'Camera is Ready'}
                </h4>
                <p className="text-xs text-[#718096] mt-1 mb-4">
                  {language === 'ta'
                    ? 'கை சைகைகளை அடையாளம் காண கேமராவை இயக்கவும்.'
                    : 'Click Start Camera to begin real-time gesture recognition.'}
                </p>
                <button
                  onClick={startCamera}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#3478F6] hover:bg-[#2563EB] shadow-xs transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  <span>{language === 'ta' ? 'கேமரா தொடங்கு' : 'Start Camera'}</span>
                </button>
              </div>
            )}

            {/* Error Overlay */}
            {cameraError && (
              <div className="flex flex-col items-center justify-center p-6 text-center max-w-sm text-rose-600">
                <AlertCircle className="w-10 h-10 mb-2" />
                <h4 className="text-sm font-semibold text-[#243247]">
                  {language === 'ta' ? 'கேமரா பிழை' : 'Camera Access Error'}
                </h4>
                <p className="text-xs text-rose-600 mt-1 mb-4 leading-relaxed">{cameraError}</p>
                <button
                  onClick={startCamera}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-white bg-rose-600 hover:bg-rose-700"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{language === 'ta' ? 'மீண்டும் முயற்சி' : 'Retry Permission'}</span>
                </button>
              </div>
            )}

            {/* Subtle framing guide when active */}
            {isCameraActive && (
              <div className="absolute inset-4 pointer-events-none border-2 border-dashed border-[#20B8A6]/40 rounded-xl flex items-start justify-end p-2">
                <span className="text-[10px] font-semibold text-[#20B8A6] bg-white/90 px-2 py-0.5 rounded-md shadow-xs">
                  {language === 'ta' ? 'கை எல்லை' : 'Gesture Area'}
                </span>
              </div>
            )}
          </div>

          {/* Camera Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-1">
            <div className="flex items-center gap-2">
              {isCameraActive ? (
                <button
                  onClick={stopCamera}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                >
                  <CameraOff className="w-4 h-4" />
                  <span>{language === 'ta' ? 'கேமரா நிறுத்து' : 'Stop Camera'}</span>
                </button>
              ) : (
                <button
                  onClick={startCamera}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-[#3478F6] hover:bg-[#2563EB] transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  <span>{language === 'ta' ? 'கேமரா தொடங்கு' : 'Start Camera'}</span>
                </button>
              )}

              {/* Single shot recognize button */}
              <button
                onClick={handleRecognizeNow}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#243247] bg-[#F7FAFC] hover:bg-slate-100 border border-[#E5EAF0] transition-colors"
              >
                <HandMetal className="w-4 h-4 text-[#20B8A6]" />
                <span>{language === 'ta' ? 'சைகை கண்டறி' : 'Recognize Sign'}</span>
              </button>
            </div>

            {/* Continuous Recognition Switch */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#243247] select-none">
              <input
                type="checkbox"
                checked={isDetecting}
                onChange={(e) => setIsDetecting(e.target.checked)}
                className="w-4 h-4 text-[#3478F6] rounded border-slate-300 focus:ring-[#3478F6]"
              />
              <span>{language === 'ta' ? 'தொடர் கண்காணிப்பு' : 'Continuous Tracking'}</span>
            </label>
          </div>

          {/* Privacy Message */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#E5EAF0] text-[11px] text-[#718096]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {language === 'ta'
                ? 'தனியுரிமைப் பாதுகாப்பு: வீடியோக்கள் உங்கள் சாதனத்திலேயே உலாவிக்குள் மட்டுமே செயலாக்கப்படுகின்றன. எந்த பதிவும் சேமிக்கப்படுவதில்லை.'
                : 'Privacy Guaranteed: Video processing runs completely client-side in your browser. No video is recorded or sent to cloud servers.'}
            </span>
          </div>
        </div>

        {/* RIGHT PANEL: Recognition Results & Bridge (5 cols on desktop) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Main Result Card */}
          <div className="bg-white rounded-2xl border border-[#E5EAF0] p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5EAF0]">
              <span className="text-xs font-semibold text-[#718096] uppercase tracking-wider">
                {language === 'ta' ? 'அடையாளம் காணப்பட்ட சைகை' : 'Recognized Sign'}
              </span>

              {/* Auto Speak Toggle */}
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-[#243247] select-none">
                <input
                  type="checkbox"
                  checked={autoSpeakPreference}
                  onChange={(e) => onToggleAutoSpeak(e.target.checked)}
                  className="w-3.5 h-3.5 text-[#3478F6] rounded border-slate-300 focus:ring-[#3478F6]"
                />
                <span className="text-[#718096]">{language === 'ta' ? 'தானியங்கி குரல்' : 'Auto Speak'}</span>
              </label>
            </div>

            {/* Big Word Display with soft mint / blue background */}
            <div className="my-4 p-5 rounded-2xl bg-[#E8F8F2] border border-[#20B8A6]/20 text-center min-h-[140px] flex flex-col items-center justify-center">
              {activeSign ? (
                <>
                  <div className="inline-flex items-center gap-1 text-xs font-bold text-[#12645B] mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#20B8A6]" />
                    <span>{language === 'ta' ? 'உறுதி செய்யப்பட்டது' : 'Sign Detected'}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#243247] tracking-tight">
                    {language === 'ta' ? activeSign.signTa : activeSign.signEn}
                  </h3>

                  <p className="text-xs font-medium text-[#718096] mt-1">
                    {language === 'ta' ? activeSign.signEn : activeSign.signTa}
                  </p>

                  {/* Confidence meter only when supplied */}
                  <div className="mt-3 flex items-center gap-2 text-xs text-[#12645B] font-mono-num font-semibold">
                    <span>{language === 'ta' ? 'துல்லியம்:' : 'Confidence:'}</span>
                    <span className="bg-white/80 px-2 py-0.5 rounded-md border border-[#20B8A6]/30">
                      {Math.round(activeSign.confidence * 100)}%
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center text-slate-400 py-3">
                  <HandMetal className="w-10 h-10 mb-2 stroke-1" />
                  <p className="text-xs text-[#718096]">
                    {language === 'ta'
                      ? 'கேமரா முன் சைகை காட்டவும் அல்லது "சைகை கண்டறி" அழுத்தவும்'
                      : 'Show a gesture in camera or click "Recognize Sign"'}
                  </p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Speak Button */}
              <button
                onClick={handleSpeakActive}
                disabled={!activeSign}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#3478F6] hover:bg-[#2563EB] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-xs transition-colors"
              >
                <Volume2 className="w-4 h-4" />
                <span>{language === 'ta' ? 'குரலில் பேசு' : 'Speak'}</span>
              </button>

              {/* Add to Sentence Button */}
              <button
                onClick={handleAddSign}
                disabled={!activeSign}
                className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-[#12645B] bg-[#E8F8F2] hover:bg-[#D4F4E7] border border-[#20B8A6]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{language === 'ta' ? '+ வாக்கியத்தில் சேர்' : '+ Add to Sentence'}</span>
              </button>
            </div>

            {/* Clear result */}
            {activeSign && (
              <div className="mt-3 pt-3 border-t border-[#E5EAF0] flex justify-end">
                <button
                  onClick={handleClearSign}
                  className="flex items-center gap-1 text-xs text-[#718096] hover:text-rose-600 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{language === 'ta' ? 'அழி' : 'Clear result'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Supported Sign Gestures Quick Guide */}
          <div className="bg-white rounded-2xl border border-[#E5EAF0] p-4 shadow-xs">
            <h4 className="text-xs font-semibold text-[#243247] uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>{language === 'ta' ? 'ஆதரிக்கப்படும் சைகைகள்' : 'Supported Signs'}</span>
              <span className="text-[11px] font-normal text-[#718096]">
                {VOCABULARY_SIGNS.length} {language === 'ta' ? 'சைகைகள்' : 'gestures'}
              </span>
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {VOCABULARY_SIGNS.slice(0, 6).map((item) => (
                <div
                  key={item.key}
                  onClick={() => {
                    setActiveSign({
                      signEn: item.nameEn,
                      signTa: item.nameTa,
                      confidence: 0.94,
                      description: item.description,
                    });
                    if (autoSpeakPreference) {
                      const text = language === 'ta' ? item.nameTa : item.nameEn;
                      onSpeakText(text, language);
                    }
                  }}
                  className="p-2 rounded-xl bg-[#F7FAFC] hover:bg-[#EAF2FF] border border-[#E5EAF0] cursor-pointer transition-colors"
                >
                  <div className="font-semibold text-[#243247]">
                    {language === 'ta' ? item.nameTa : item.nameEn}
                  </div>
                  <div className="text-[10px] text-[#718096]">
                    {language === 'ta' ? item.nameEn : item.nameTa}
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Recognitions Strip */}
            {recentSigns.length > 0 && (
              <div className="mt-4 pt-3 border-t border-[#E5EAF0]">
                <span className="text-[11px] font-semibold text-[#718096] uppercase tracking-wider block mb-2">
                  {language === 'ta' ? 'சமீபத்திய சைகைகள்' : 'Recent Detections'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {recentSigns.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const text = language === 'ta' ? s.signTa : s.signEn;
                        onSpeakText(text, language);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F7FAFC] hover:bg-slate-100 border border-[#E5EAF0] text-[#243247] flex items-center gap-1.5"
                    >
                      <span>{language === 'ta' ? s.signTa : s.signEn}</span>
                      <span className="text-[10px] text-[#718096]">
                        {Math.round(s.confidence * 100)}%
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
