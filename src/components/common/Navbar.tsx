import React, { useState } from 'react';
import { Volume2, VolumeX, Share2, LogOut, Shield, User, Sparkles, Cloud, CloudOff, LogIn } from 'lucide-react';
import { soundManager } from '../../services/audio';
import { Student, Teacher } from '../../types';
import { ThemeSelector } from './ThemeSelector';
import { useFirebase } from '../../context/FirebaseContext';

interface NavbarProps {
  currentRole: 'teacher' | 'student' | null;
  activeTeacher?: Teacher | null;
  activeStudent?: Student | null;
  onSwitchRole: () => void;
  onLogout: () => void;
  onOpenQR: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  activeTeacher,
  activeStudent,
  onSwitchRole,
  onLogout,
  onOpenQR
}) => {
  const [isMuted, setIsMuted] = useState(soundManager.getIsMuted());
  const { user, isOnline, signInWithGoogle, signOut } = useFirebase();

  const handleToggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundManager.playStarChime();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-amber-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={onSwitchRole}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-2xl shadow-md border-2 border-white">
            🐾
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold font-heading text-lg sm:text-xl text-slate-800 tracking-tight">
                My Virtual Pet
              </span>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-1.5 py-0.5 rounded-md border border-amber-300">
                MVP
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              Game Edukasi & Penguatan Karakter
            </p>
          </div>
        </div>

        {/* Center / User Status Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentRole === 'teacher' && activeTeacher && (
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full text-xs font-bold text-amber-900">
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              <span className="truncate max-w-[130px] sm:max-w-none">{activeTeacher.name}</span>
            </div>
          )}

          {currentRole === 'student' && activeStudent && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-300 px-3 py-1.5 rounded-full shadow-xs">
              <div className="flex items-center gap-1 text-xs font-extrabold text-amber-900">
                <User className="w-3.5 h-3.5 text-amber-600" />
                <span className="truncate max-w-[100px] sm:max-w-[140px]">{activeStudent.name}</span>
                <span className="text-[10px] text-amber-600 font-medium hidden sm:inline">
                  ({activeStudent.className})
                </span>
              </div>
              <div className="flex items-center gap-1 bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full text-xs font-black shadow-xs">
                <Sparkles className="w-3 h-3" />
                <span>{activeStudent.stars} ⭐</span>
              </div>
            </div>
          )}

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className={`p-2 rounded-xl transition border ${
              isMuted
                ? 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                : 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200'
            }`}
            title={isMuted ? 'Nyalakan Suara Game' : 'Matikan Suara (Mute)'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Theme Selector (Clay, Cartoon, Dark, Bright) */}
          <ThemeSelector />

          {/* Cloud Sync Status Pill */}
          <div
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-extrabold border ${
              isOnline
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-50 text-amber-800 border-amber-300'
            }`}
            title={isOnline ? 'Terhubung ke Firebase Cloud Firestore' : 'Mode Offline (Penyimpanan Lokal)'}
          >
            {isOnline ? (
              <>
                <Cloud className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span>Cloud Firestore</span>
              </>
            ) : (
              <>
                <CloudOff className="w-3.5 h-3.5 text-amber-600" />
                <span>Offline</span>
              </>
            )}
          </div>

          {/* Google Auth Status / Login Button */}
          {user ? (
            <div
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-2.5 py-1 rounded-full text-xs font-bold text-slate-700 cursor-pointer"
              onClick={() => signOut()}
              title={`Masuk sebagai ${user.email}. Klik untuk keluar akun Google.`}
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-5 h-5 rounded-full" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-black">
                  G
                </div>
              )}
              <span className="hidden xl:inline truncate max-w-[120px]">{user.displayName || user.email}</span>
            </div>
          ) : (
            <button
              onClick={() => signInWithGoogle()}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold transition shadow-xs cursor-pointer"
              title="Masuk dengan Google Account untuk Admin / Guru"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-600" />
              <span>Google Login</span>
            </button>
          )}

          {/* Share QR Code Button */}
          <button
            onClick={onOpenQR}
            className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition shadow-xs cursor-pointer"
            title="Bagikan Tautan & QR Code ke Siswa"
          >
            <Share2 className="w-4 h-4" />
          </button>

          {/* Logout or Switch Portal */}
          {currentRole ? (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 text-xs font-bold transition"
              title="Keluar Akun"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          ) : (
            <button
              onClick={onSwitchRole}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition shadow"
            >
              Pilih Peran
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
