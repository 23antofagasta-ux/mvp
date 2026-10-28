import React, { useState, useEffect, useRef } from 'react';
import { KeyRound, ArrowRight, ShieldCheck, Search, User, Sparkles, X, Keyboard, Users, ChevronRight } from 'lucide-react';
import { Student } from '../../types';
import { storageService } from '../../services/storage';
import { soundManager } from '../../services/audio';

interface StudentLoginProps {
  onSuccess: (student: Student) => void;
  onSwitchToTeacher: () => void;
}

export const StudentLogin: React.FC<StudentLoginProps> = ({ onSuccess, onSwitchToTeacher }) => {
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'manual' | 'list'>('manual');
  const [allStudents, setAllStudents] = useState<Student[]>(() => storageService.getStudents());
  const [suggestions, setSuggestions] = useState<Student[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAllStudents(storageService.getStudents());
  }, []);

  // Update suggestions on query change
  useEffect(() => {
    const clean = query.trim().toLowerCase();
    if (clean.length > 0) {
      const filtered = allStudents.filter(
        (s) =>
          s.nisn.toLowerCase().includes(clean) ||
          s.name.toLowerCase().includes(clean) ||
          s.petNickname.toLowerCase().includes(clean) ||
          s.className.toLowerCase().includes(clean)
      );
      setSuggestions(filtered.slice(0, 4));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query, allStudents]);

  const handleLoginStudent = (student: Student) => {
    soundManager.playStarChime();
    onSuccess(student);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim();
    if (!clean) {
      setError('Silakan ketik nomor NISN atau nama siswa.');
      return;
    }

    // Try finding by NISN or name using storageService helper
    const matched = storageService.findStudentByNisnOrName(clean);
    if (matched) {
      handleLoginStudent(matched);
    } else if (suggestions.length > 0) {
      // Pick first matching suggestion
      handleLoginStudent(suggestions[0]);
    } else {
      soundManager.playWrong();
      setError(`Siswa dengan NISN atau nama "${clean}" tidak ditemukan. Pastikan data yang diketik sudah sesuai.`);
    }
  };

  const getPetEmoji = (speciesId: string) => {
    switch (speciesId) {
      case 'kucing': return '🐱';
      case 'naga': return '🐲';
      case 'kelinci': return '🐰';
      case 'burung': return '🦜';
      case 'rubah': return '🦊';
      case 'panda': return '🐼';
      case 'anjing': return '🐶';
      case 'singa': return '🦁';
      case 'lumba': return '🐬';
      case 'kura': return '🐢';
      case 'hamster': return '🐹';
      case 'kuda': return '🦄';
      case 'koala': return '🐨';
      default: return '🐾';
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-300 relative text-center">
        {/* Header Icon */}
        <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-xl border-4 border-white mb-3 animate-bounce-gentle">
          🐱
        </div>

        <h2 className="text-2xl sm:text-3xl font-black font-heading text-slate-800">
          Masuk Portal Siswa
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
          Ketik manual nomor NISN atau nama lengkapmu untuk langsung merawat hewan peliharaan!
        </p>

        {/* Tab switcher: Ketik Manual vs Daftar Siswa */}
        <div className="flex bg-slate-100 p-1 rounded-2xl my-4 text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => {
              setActiveTab('manual');
              setTimeout(() => inputRef.current?.focus(), 50);
            }}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'manual'
                ? 'bg-white text-amber-900 shadow-sm'
                : 'hover:text-slate-900'
            }`}
          >
            <Keyboard className="w-4 h-4 text-amber-600" />
            <span>Ketik Manual (NISN/Nama)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'list'
                ? 'bg-white text-amber-900 shadow-sm'
                : 'hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-amber-600" />
            <span>Pilih Siswa ({allStudents.length})</span>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 py-2.5 px-3 rounded-2xl animate-wiggle text-left">
            {error}
          </div>
        )}

        {/* TAB 1: KETIK MANUAL */}
        {activeTab === 'manual' && (
          <div>
            <form onSubmit={handleManualSubmit} className="space-y-4 text-left relative">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Ketik Manual: NISN atau Nama Siswa
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4 text-amber-600" />
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    required
                    autoFocus
                    placeholder="Contoh: 0012345678 atau ketik 'Ahmad'..."
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setError('');
                    }}
                    onFocus={() => {
                      if (suggestions.length > 0) setShowSuggestions(true);
                    }}
                    className="w-full pl-10 pr-9 py-3 text-sm rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-amber-400 focus:bg-white outline-none font-bold text-slate-800 transition"
                    autoComplete="off"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery('');
                        setSuggestions([]);
                        setShowSuggestions(false);
                        inputRef.current?.focus();
                      }}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Live Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="mt-1.5 bg-white border border-amber-200 rounded-2xl shadow-xl overflow-hidden divide-y divide-slate-100 z-20 relative text-left animate-fadeIn">
                    <div className="p-2 bg-amber-50/70 text-[10px] font-bold text-amber-800 flex items-center justify-between">
                      <span>💡 Siswa Ditemukan ({suggestions.length}) - Klik untuk Masuk:</span>
                    </div>
                    {suggestions.map((st) => (
                      <div
                        key={st.id}
                        onClick={() => handleLoginStudent(st)}
                        className="p-2.5 hover:bg-amber-50 flex items-center justify-between cursor-pointer transition group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl group-hover:scale-110 transition">
                            {getPetEmoji(st.petSpeciesId)}
                          </span>
                          <div>
                            <div className="text-xs font-black text-slate-800 group-hover:text-amber-700">
                              {st.name}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                              <span className="font-mono bg-slate-100 px-1 py-0.2 rounded text-slate-600 font-bold">
                                NISN: {st.nisn}
                              </span>
                              <span>• {st.className}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-amber-600 group-hover:translate-x-1 transition text-xs font-bold flex items-center gap-0.5">
                          <span>Masuk</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 active:scale-95 text-amber-950 font-black text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2 border border-amber-300 cursor-pointer"
              >
                <span>Masuk ke Akun Pet</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Chips for Students */}
            <div className="mt-5 p-3 bg-amber-50/80 rounded-2xl border border-amber-200 text-left">
              <div className="flex items-center justify-between text-[11px] font-bold text-amber-900 mb-1.5">
                <span>⚡ Coba Ketik Manual / Klik Cepat:</span>
                <span className="text-[10px] text-amber-700">Contoh Siswa</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {allStudents.slice(0, 3).map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      setQuery(st.nisn);
                      handleLoginStudent(st);
                    }}
                    className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-amber-100 border border-amber-300 rounded-lg text-slate-800 shadow-2xs transition flex items-center gap-1 active:scale-95 cursor-pointer"
                  >
                    <span>{getPetEmoji(st.petSpeciesId)}</span>
                    <span>{st.name}</span>
                    <span className="font-mono text-slate-400 text-[10px]">({st.nisn})</span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                Ketik nomor NISN lengkap atau cukup ketik nama siswa di kolom pencarian di atas.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: PILIH DARI DAFTAR SISWA */}
        {activeTab === 'list' && (
          <div className="text-left space-y-2">
            <div className="text-[11px] font-bold text-slate-600 mb-2 flex items-center justify-between">
              <span>Pilih salah satu siswa dari kelas:</span>
              <span className="text-amber-700 font-bold">{allStudents.length} Terdaftar</span>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
              {allStudents.length === 0 ? (
                <div className="text-center py-6 px-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="text-xs text-slate-600 font-bold">
                    Belum ada siswa yang terdaftar di database.
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Silakan minta Bapak/Ibu Guru untuk mendaftarkan akun siswa di Panel Guru.
                  </p>
                </div>
              ) : (
                allStudents.map((st) => (
                <div
                  key={st.id}
                  onClick={() => handleLoginStudent(st)}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 bg-slate-50/60 hover:bg-amber-50/70 transition flex items-center justify-between cursor-pointer group active:scale-98"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-xl shadow-2xs group-hover:scale-110 transition">
                      {getPetEmoji(st.petSpeciesId)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 group-hover:text-amber-800">
                        {st.name}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-700">NISN: {st.nisn}</span>
                        <span>•</span>
                        <span>{st.className}</span>
                        <span>•</span>
                        <span className="text-amber-600 font-bold">⭐ {st.stars}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-amber-600 flex items-center gap-1 group-hover:translate-x-1 transition">
                    <span>Pilih</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              )))}
            </div>
          </div>
        )}

        {/* Switch to Teacher Portal */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <button
            onClick={onSwitchToTeacher}
            className="text-xs font-bold text-slate-500 hover:text-amber-600 transition flex items-center justify-center gap-1 mx-auto cursor-pointer"
          >
            <span>Masuk ke Panel Guru (Wali Kelas)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

