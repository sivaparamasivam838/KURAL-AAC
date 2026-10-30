import React, { useState } from 'react';
import {
  X,
  LogOut,
  User as UserIcon,
  Shield,
  HeartHandshake,
  Stethoscope,
  Globe,
  Edit2,
  Check,
  RotateCcw,
} from 'lucide-react';
import { User, Language, UserRole } from '../types';
import { updateProfile } from '../services/api';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
  onSwitchUser: (user: User) => void;
  language: Language;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onLogout,
  onSwitchUser,
  language,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [nameTa, setNameTa] = useState(currentUser.nameTa || currentUser.name);
  const [bio, setBio] = useState(currentUser.bio || '');

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      const updated = await updateProfile({ name, nameTa, bio });
      onUpdateUser(updated);
      setIsEditing(false);
    } catch (error) {
      console.error('Unable to update profile:', error);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'therapist':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Stethoscope className="w-3 h-3" />
            <span>{language === 'ta' ? 'மருத்துவர் / SLP' : 'Speech Therapist'}</span>
          </span>
        );
      case 'caregiver':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            <Shield className="w-3 h-3" />
            <span>{language === 'ta' ? 'பராமரிப்பாளர்' : 'Caregiver'}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#EAF2FF] text-[#3478F6] border border-[#3478F6]/20">
            <HeartHandshake className="w-3 h-3" />
            <span>{language === 'ta' ? 'தொடர்பாளர் (AAC)' : 'Communicator'}</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#E5EAF0] shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#E5EAF0]">
          <h2 className="text-base font-bold text-[#243247]">
            {language === 'ta' ? 'பயனர் சுயவிவரம்' : 'User Account Profile'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Profile Banner */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#EAF2FF] border border-[#3478F6]/20 flex items-center justify-center text-3xl shadow-xs shrink-0">
              {currentUser.avatar}
            </div>

            <div className="min-w-0 flex-1">
              {!isEditing ? (
                <>
                  <h3 className="text-lg font-bold text-[#243247] truncate">
                    {language === 'ta' && currentUser.nameTa ? currentUser.nameTa : currentUser.name}
                  </h3>
                  <p className="text-xs text-[#718096] truncate">{currentUser.email}</p>
                  <div className="mt-1.5">{getRoleBadge(currentUser.role)}</div>
                </>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={nameTa}
                    onChange={(e) => setNameTa(e.target.value)}
                    placeholder="Tamil name"
                    className="w-full px-2.5 py-1 text-xs border border-slate-300 rounded-lg font-tamil"
                  />
                </div>
              )}
            </div>

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-slate-400 hover:text-[#3478F6] hover:bg-[#EAF2FF] rounded-xl transition-colors"
                title="Edit profile"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="p-2 text-white bg-[#3478F6] hover:bg-[#2563EB] rounded-xl shadow-xs transition-colors"
                title="Save changes"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Bio statement */}
          {!isEditing ? (
            <div className="p-3 bg-[#F7FAFC] rounded-xl border border-[#E5EAF0] text-xs text-[#718096]">
              {currentUser.bio || 'Assistive communication account.'}
            </div>
          ) : (
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Short bio..."
              className="w-full p-2.5 text-xs bg-[#F7FAFC] border border-[#E5EAF0] rounded-xl text-[#243247] resize-none"
            />
          )}

          {/* Log Out Button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? 'வெளியேறு (Log Out)' : 'Log Out'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
