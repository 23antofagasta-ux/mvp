import React, { useState, useEffect, useRef } from 'react';
import { KeyRound, ShieldAlert, ArrowRight, Eye, EyeOff, Keyboard, Grid, Sparkles, X, LogIn } from 'lucide-react';
import { Teacher } from '../../types';
import { storageService } from '../../services/storage';
import { soundManager } from '../../services/audio';
import { loginWithGoogle } from '../../services/firebase';

interface TeacherLoginProps {
  onSuccess: (teacher: Teacher) => void;
  onSwitchToStudent: () => void;
}

export const TeacherLogin: React.FC<TeacherLoginProps> = ({ onSuccess, onSwitchToStudent }) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [inputMode, setInputMode] = useState<'manual' | 'keypad'>('manual');
  const [error, setError] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);


  // Auto-focus input when in manual mode
  useEffect(() => {
    if (inputMode === 'manual' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputMode]);

  const handleKeypadPress = (val: string) => {
    if (pin.length < 6) {
      const nextPin = pin + val;
      setPin(nextPin);
      setError('');
      if (nextPin.length === 4) {
        verify(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError('');
    if (inputMode === 'manual' && inputRef.current) inputRef.current.focus();
  };

  const handleClear = () => {
    setPin('');
    setError('');
    if (inputMode === 'manual' && inputRef.current) inputRef.current.focus();
  };

  const verify = (codeToVerify: string) => {
    const cleanCode = codeToVerify.trim();
    if (!cleanCode) {
      setError('Silakan masukkan nomor PIN guru terlebih dahulu.');
      return;
    }

    const matched = storageService.verifyTeacherPin(cleanCode);

    if (matched) {
      soundManager.playStarChime();
      onSuccess(matched);
    } else {
      soundManager.playDeductBuzz();
      setError('PIN tidak cocok. Silakan periksa kembali atau hubungi pengelola.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verify(pin);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-300 relative text-center">
        {/* Header Icon */}
        <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-3xl mx-auto flex items-center justify-center text-3xl shadow-lg border-2 border-white mb-3 animate-bounce-gentle">
          👨‍🏫
        </div>

        <h2 className="text-2xl font-black font-heading text-slate-800">
          Masuk Panel Guru
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          Kelola database siswa, reward bintang real-time, dan evolusi pet kelas
        </p>

        {/* Input Mode Switcher Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-2xl my-4 text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => {
              setInputMode('manual');
              setTimeout(() => inputRef.current?.focus(), 50);
            }}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              inputMode === 'manual'
                ? 'bg-white text-amber-900 shadow-sm'
                : 'hover:text-slate-900'
            }`}
          >
            <Keyboard className="w-4 h-4 text-amber-600" />
            <span>Ketik Manual</span>
          </button>
          <button
            type="button"
            onClick={() => setInputMode('keypad')}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              inputMode === 'keypad'
                ? 'bg-white text-amber-900 shadow-sm'
                : 'hover:text-slate-900'
            }`}
          >
            <Grid className="w-4 h-4 text-amber-600" />
            <span>Keypad Layar</span>
          </button>
        </div>



        {/* Error message */}
        {error && (
          <div className="mb-4 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 animate-wiggle">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: KETIK MANUAL (INPUT KEYBOARD) */}
        {inputMode === 'manual' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-left">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                  <span>Ketik 4-Digit PIN Guru:</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {pin.length}/4 digit
                </span>
              </div>

              <div className="relative">
                <input
                  ref={inputRef}
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoFocus
                  required
                  placeholder="••••"
                  value={pin}

                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/[^0-9]/g, '');
                    setPin(cleaned);
                    setError('');
                    if (cleaned.length >= 4 && storageService.verifyTeacherPin(cleaned)) {
                      verify(cleaned);
                    }
                  }}
                  className="w-full text-center text-2xl tracking-[0.35em] font-mono font-extrabold py-3.5 pl-10 pr-20 rounded-2xl bg-amber-50/40 border-2 border-amber-300 focus:border-amber-500 focus:bg-white outline-none transition shadow-inner text-slate-900 placeholder:text-slate-300 placeholder:tracking-normal placeholder:font-normal placeholder:text-xs"
                />

                <div className="absolute inset-y-0 right-2 flex items-center gap-1">
                  {pin.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                      title="Hapus"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-amber-100 transition cursor-pointer"
                    title={showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* PIN Dots Visual feedback */}
              <div className="flex justify-center items-center gap-2.5 mt-3">
                {[0, 1, 2, 3].map((idx) => {
                  const hasDigit = pin.length > idx;
                  return (
                    <div
                      key={idx}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        hasDigit
                          ? 'bg-amber-500 scale-125 shadow-xs'
                          : 'bg-slate-200 border border-slate-300'
                      }`}
                    />
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 active:scale-95 text-amber-950 font-black text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2 border border-amber-300 cursor-pointer"
            >
              <span>Masuk Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* TAB 2: KEYPAD LAYAR (VIRTUAL NUMPAD) */}
        {inputMode === 'keypad' && (
          <div>
            {/* PIN Dots Display */}
            <div className="flex justify-center items-center gap-3 my-4">
              {[0, 1, 2, 3].map((idx) => {
                const hasDigit = pin.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-4 h-4 rounded-full transition-all duration-300 ${
                      hasDigit
                        ? 'bg-amber-500 scale-125 shadow-md shadow-amber-400/50'
                        : 'bg-slate-200 border-2 border-slate-300'
                    }`}
                  />
                );
              })}
            </div>

            {/* Numeric Keypad for fast tap */}
            <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    if (val === 'C') handleClear();
                    else if (val === '⌫') handleBackspace();
                    else handleKeypadPress(val);
                  }}
                  className="h-12 rounded-2xl bg-amber-50 hover:bg-amber-100 active:scale-90 font-bold text-slate-800 text-lg transition border border-amber-200 shadow-xs flex items-center justify-center select-none cursor-pointer"
                >
                  {val}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Google Sign-In Option for Teacher */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 mb-2">Atau masuk cepat dengan akun Google:</p>
          <button
            type="button"
            onClick={async () => {
              try {
                const u = await loginWithGoogle();
                if (u) {
                  const teachers = storageService.getTeachers();
                  let currentT = teachers.find(t => t.email === u.email);
                  if (!currentT) {
                    currentT = {
                      id: u.uid || `t-${Date.now()}`,
                      name: u.displayName || 'Guru (Google)',
                      pin: '1234',
                      email: u.email || undefined,
                      createdAt: new Date().toISOString()
                    };
                    storageService.saveTeacher(currentT);
                  }
                  soundManager.playStarChime();
                  onSuccess(currentT);
                }
              } catch (err: any) {
                setError(err?.message || 'Login dengan Google gagal');
              }
            }}
            className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-amber-400 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Masuk dengan Akun Google</span>
          </button>
        </div>

        {/* Security Notice - PIN Hidden */}
        <div className="mt-4 p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/80 text-left">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-1">
            <KeyRound className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Keamanan Akun & PIN Rahasia</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Halaman ini khusus untuk Dewan Guru & Wali Kelas. Masukkan PIN rahasia Anda untuk membuka panel kontrol kelas. Jaga kerahasiaan PIN dan pastikan tidak terlihat oleh siswa.
          </p>
          <p className="text-[10px] text-slate-400 mt-2">
            Anda dapat mengetik langsung dengan keyboard atau menggunakan keypad layar sentuh.
          </p>
        </div>

        {/* Switch to Student Portal */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <button
            onClick={onSwitchToStudent}
            className="text-xs font-bold text-slate-600 hover:text-amber-600 transition flex items-center justify-center gap-1 mx-auto cursor-pointer"
          >
            <span>Beralih ke Portal Siswa / Player</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

