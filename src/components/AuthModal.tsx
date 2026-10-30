import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Shield,
  HeartHandshake,
  Stethoscope,
  Globe,
} from 'lucide-react';
import { User, Language, UserRole } from '../types';
import { login, requestPasswordReset, resetPassword, signup } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  currentLanguage: Language;
}

const AVATAR_OPTIONS = ['🌸', '👨‍⚕️', '👩‍👧', '🌟', '🚀', '💡', '🎨', '🌈', '🕊️', '🦋'];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentLanguage,
}) => {
  const resetToken = new URLSearchParams(window.location.search).get('resetToken');
  const [tab, setTab] = useState<'signin' | 'signup' | 'forgot' | 'reset'>(resetToken ? 'reset' : 'signin');

  // Sign In form fields
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Sign Up form fields
  const [signUpName, setSignUpName] = useState('');
  const [signUpNameTa, setSignUpNameTa] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpRole, setSignUpRole] = useState<UserRole>('communicator');
  const [signUpLang, setSignUpLang] = useState<Language>(currentLanguage);
  const [signUpAvatar, setSignUpAvatar] = useState('🌸');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  // Status and error
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isStatusSuccess, setIsStatusSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsStatusSuccess(false);
    setIsLoading(true);

    try {
      const user = await login({ email: signInEmail, password: signInPassword });
      setIsLoading(false);
      onSuccess(user);
      onClose();
    } catch (error) {
      setIsLoading(false);
      setErrorMsg(error instanceof Error ? error.message : 'Failed to sign in.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsStatusSuccess(false);
    setIsLoading(true);

    try {
      const user = await signup({
        name: signUpName,
        nameTa: signUpNameTa || signUpName,
        email: signUpEmail,
        password: signUpPassword,
        role: signUpRole,
        preferredLanguage: signUpLang,
        avatar: signUpAvatar,
      });
      setIsLoading(false);
      onSuccess(user);
      onClose();
    } catch (error) {
      setIsLoading(false);
      setErrorMsg(error instanceof Error ? error.message : 'Failed to register account.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsStatusSuccess(false);
    setIsLoading(true);
    try {
      await requestPasswordReset(forgotEmail);
      setIsStatusSuccess(true);
      setErrorMsg('If that email exists, a reset link has been sent. In local development, check the API terminal.');
    } catch (error) {
      setIsStatusSuccess(false);
      setErrorMsg(error instanceof Error ? error.message : 'Unable to request a reset link.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken) return;
    setErrorMsg(null);
    setIsStatusSuccess(false);
    setIsLoading(true);
    try {
      await resetPassword(resetToken, newPassword);
      window.history.replaceState({}, '', window.location.pathname);
      setTab('signin');
      setIsStatusSuccess(true);
      setErrorMsg('Password updated. You can now sign in.');
    } catch (error) {
      setIsStatusSuccess(false);
      setErrorMsg(error instanceof Error ? error.message : 'Unable to reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-[#E5EAF0] shadow-xl overflow-hidden my-8">
        {/* Header with Close */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#E5EAF0]">
          <div>
            <span className="text-xs font-semibold text-[#3478F6] uppercase tracking-wider">
              Kural AAC Platform
            </span>
            <h2 className="text-xl font-bold text-[#243247] mt-0.5">
              {tab === 'signin'
                ? currentLanguage === 'ta'
                  ? 'கணக்கில் உள்நுழையவும்'
                  : 'Welcome Back'
                : currentLanguage === 'ta'
                ? 'புதிய பயனர் கணக்கு உருவாக்கவும்'
                : 'Create Your Account'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 p-1 bg-[#F7FAFC] rounded-xl border border-[#E5EAF0]">
            <button
              onClick={() => {
                setTab('signin');
                setErrorMsg(null);
                setIsStatusSuccess(false);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                tab === 'signin'
                  ? 'bg-white text-[#3478F6] shadow-xs'
                  : 'text-[#718096] hover:text-[#243247]'
              }`}
            >
              {currentLanguage === 'ta' ? 'உள்நுழைவு (Sign In)' : 'Sign In'}
            </button>
            <button
              onClick={() => {
                setTab('signup');
                setErrorMsg(null);
                setIsStatusSuccess(false);
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                tab === 'signup'
                  ? 'bg-white text-[#3478F6] shadow-xs'
                  : 'text-[#718096] hover:text-[#243247]'
              }`}
            >
              {currentLanguage === 'ta' ? 'பதிவு செய்தல் (Sign Up)' : 'Sign Up'}
            </button>
          </div>
        </div>

        {/* Error message banner */}
        {errorMsg && (
          <div className={`mx-6 mt-4 p-3 rounded-xl border text-xs leading-relaxed ${
            isStatusSuccess
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}>
            {errorMsg}
          </div>
        )}

        {/* TAB 1: SIGN IN FORM */}
        {tab === 'signin' && (
          <div className="p-6 space-y-5">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#718096] uppercase tracking-wider mb-1.5">
                  {currentLanguage === 'ta' ? 'மின்னஞ்சல் முகவரி' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    placeholder="e.g. ananya@kural.org"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F7FAFC] border border-[#E5EAF0] rounded-xl text-sm text-[#243247] placeholder:text-slate-400 focus:bg-white focus:border-[#3478F6] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#718096] uppercase tracking-wider mb-1.5">
                  {currentLanguage === 'ta' ? 'கடவுச்சொல்' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type={showSignInPassword ? 'text' : 'password'}
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#F7FAFC] border border-[#E5EAF0] rounded-xl text-sm text-[#243247] placeholder:text-slate-400 focus:bg-white focus:border-[#3478F6] focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#3478F6] hover:bg-[#2563EB] disabled:bg-slate-300 shadow-xs transition-colors"
              >
                <span>{isLoading ? 'Signing In...' : currentLanguage === 'ta' ? 'உள்நுழையவும்' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <button
              type="button"
              onClick={() => { setTab('forgot'); setErrorMsg(null); }}
              className="w-full text-xs font-semibold text-[#3478F6] hover:underline"
            >
              Forgot password?
            </button>

          </div>
        )}

        {tab === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="p-6 space-y-4">
            <p className="text-sm text-[#718096]">Enter your account email and we will send a password reset link.</p>
            <input
              type="email"
              required
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 bg-[#F7FAFC] border border-[#E5EAF0] rounded-xl text-sm"
            />
            <button type="submit" disabled={isLoading} className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-[#3478F6] disabled:bg-slate-300">
              {isLoading ? 'Sending...' : 'Send reset link'}
            </button>
            <button type="button" onClick={() => setTab('signin')} className="w-full text-xs text-[#3478F6]">Back to sign in</button>
          </form>
        )}

        {tab === 'reset' && (
          <form onSubmit={handleResetPassword} className="p-6 space-y-4">
            <p className="text-sm text-[#718096]">Choose a new password for your account.</p>
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full px-3.5 py-2.5 bg-[#F7FAFC] border border-[#E5EAF0] rounded-xl text-sm"
            />
            <button type="submit" disabled={isLoading} className="w-full py-3 rounded-xl text-sm font-semibold text-white bg-[#3478F6] disabled:bg-slate-300">
              {isLoading ? 'Updating...' : 'Update password'}
            </button>
          </form>
        )}

        {/* TAB 2: SIGN UP FORM */}
        {tab === 'signup' && (
          <form onSubmit={handleSignUp} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Full Name & Tamil Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#718096] uppercase tracking-wider mb-1">
                  {currentLanguage === 'ta' ? 'முழுப் பெயர் (English)' : 'Full Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder="e.g. Ananya Ram"
                  className="w-full px-3.5 py-2 bg-[#F7FAFC] border border-[#E5EAF0] rounded-xl text-sm text-[#243247] focus:bg-white focus:border-[#3478F6] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#718096] uppercase tracking-wider mb-1">
                  {currentLanguage === 'ta' ? 'பெயர் (தமிழ்)' : 'Tamil Name (Optional)'}
                </label>
                <input
                  type="text"
                  value={signUpNameTa}
                  onChange={(e) => setSignUpNameTa(e.target.value)}
                  placeholder="எ.கா. அனன்யா"
                  className="w-full px-3.5 py-2 bg-[#F7FAFC] border border-[#E5EAF0] rounded-xl text-sm text-[#243247] font-tamil focus:bg-white focus:border-[#3478F6] focus:outline-hidden"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-[#718096] uppercase tracking-wider mb-1">
                {currentLanguage === 'ta' ? 'மின்னஞ்சல் முகவரி' : 'Email Address'} *
              </label>
              <input
                type="email"
                required
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2 bg-[#F7FAFC] border border-[#E5EAF0] rounded-xl text-sm text-[#243247] focus:bg-white focus:border-[#3478F6] focus:outline-hidden"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-[#718096] uppercase tracking-wider mb-1">
                {currentLanguage === 'ta' ? 'கடவுச்சொல்' : 'Password'} *
              </label>
              <div className="relative">
                <input
                  type={showSignUpPassword ? 'text' : 'password'}
                  required
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-3.5 pr-10 py-2 bg-[#F7FAFC] border border-[#E5EAF0] rounded-xl text-sm text-[#243247] focus:bg-white focus:border-[#3478F6] focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* User Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-[#718096] uppercase tracking-wider mb-1.5">
                {currentLanguage === 'ta' ? 'பயனர் பங்கு (Role)' : 'Your Primary Role'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSignUpRole('communicator')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    signUpRole === 'communicator'
                      ? 'border-[#3478F6] bg-[#EAF2FF] text-[#3478F6] font-semibold'
                      : 'border-[#E5EAF0] text-[#718096] hover:bg-slate-50'
                  }`}
                >
                  <HeartHandshake className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-xs block">
                    {currentLanguage === 'ta' ? 'தொடர்பாளர்' : 'Communicator'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSignUpRole('caregiver')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    signUpRole === 'caregiver'
                      ? 'border-[#3478F6] bg-[#EAF2FF] text-[#3478F6] font-semibold'
                      : 'border-[#E5EAF0] text-[#718096] hover:bg-slate-50'
                  }`}
                >
                  <Shield className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-xs block">
                    {currentLanguage === 'ta' ? 'பராமரிப்பாளர்' : 'Caregiver'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSignUpRole('therapist')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    signUpRole === 'therapist'
                      ? 'border-[#3478F6] bg-[#EAF2FF] text-[#3478F6] font-semibold'
                      : 'border-[#E5EAF0] text-[#718096] hover:bg-slate-50'
                  }`}
                >
                  <Stethoscope className="w-4 h-4 mx-auto mb-1" />
                  <span className="text-xs block">
                    {currentLanguage === 'ta' ? 'மருத்துவர் / SLP' : 'Therapist'}
                  </span>
                </button>
              </div>
            </div>

            {/* Avatar Selection */}
            <div>
              <label className="block text-xs font-semibold text-[#718096] uppercase tracking-wider mb-1.5">
                {currentLanguage === 'ta' ? 'சுயவிவர சின்னம் (Avatar)' : 'Choose Avatar'}
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setSignUpAvatar(av)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 border transition-transform ${
                      signUpAvatar === av
                        ? 'border-[#3478F6] bg-[#EAF2FF] scale-110 shadow-xs'
                        : 'border-[#E5EAF0] hover:bg-slate-50'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#3478F6] hover:bg-[#2563EB] disabled:bg-slate-300 shadow-xs transition-colors mt-2"
            >
              <span>{isLoading ? 'Creating Account...' : currentLanguage === 'ta' ? 'கணக்கை உருவாக்கு' : 'Create Account'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
