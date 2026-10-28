import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  AlertTriangle,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Sparkles,
  Gamepad2,
  Brain,
  Calculator,
  Grid,
  Utensils,
  RotateCcw,
  Save,
  Clock,
  HelpCircle
} from 'lucide-react';
import { MiniGameConfig, TriviaQuestion, Teacher } from '../../types';
import { storageService } from '../../services/storage';
import { soundManager } from '../../services/audio';

interface MiniGameManagerProps {
  teacher: Teacher;
  onToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const MiniGameManager: React.FC<MiniGameManagerProps> = ({ teacher, onToast }) => {
  const [config, setConfig] = useState<MiniGameConfig>(() => storageService.getMiniGameConfig());
  const [activeSubTab, setActiveSubTab] = useState<'locks' | 'trivia' | 'math' | 'diet'>('locks');

  // Trivia Question Form Modal
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<TriviaQuestion | null>(null);
  const [questionForm, setQuestionForm] = useState<{
    question: string;
    options: [string, string, string, string];
    correctIndex: number;
    explanation: string;
  }>({
    question: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    explanation: ''
  });

  // Custom Diet Pair Form Modal
  const [showDietModal, setShowDietModal] = useState(false);
  const [dietForm, setDietForm] = useState({
    animal: '',
    icon: '🐾',
    food: '',
    foodIcon: '🍎',
    sound: 'Nyam!'
  });

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string; type: 'question' | 'diet' } | null>(null);

  // Sync helper
  const updateAndSave = (newConfig: MiniGameConfig, toastMsg: string) => {
    newConfig.updatedBy = teacher.name;
    storageService.saveMiniGameConfig(newConfig);
    setConfig(newConfig);
    onToast(toastMsg, 'success');
  };

  // Toggle Master Lock
  const handleToggleMasterLock = (locked: boolean) => {
    const updated: MiniGameConfig = {
      ...config,
      isAllLocked: locked
    };
    if (locked) soundManager.playDeductBuzz();
    else soundManager.playStarChime();

    updateAndSave(
      updated,
      locked ? 'Semua mini game berhasil DIKUNCI untuk siswa!' : 'Semua mini game berhasil DIBUKA untuk siswa!'
    );
  };

  // Toggle Single Game Lock
  const handleToggleSingleLock = (gameKey: 'trivia' | 'math' | 'memory' | 'diet') => {
    const nextLocked = !config.lockedGames[gameKey];
    const updated: MiniGameConfig = {
      ...config,
      lockedGames: {
        ...config.lockedGames,
        [gameKey]: nextLocked
      }
    };
    if (nextLocked) soundManager.playPop();
    else soundManager.playStarChime();

    updateAndSave(
      updated,
      nextLocked ? `Mini game tersebut berhasil dikunci.` : `Mini game tersebut berhasil dibuka.`
    );
  };

  // Save Lock Message
  const handleSaveLockMessage = (e: React.FormEvent) => {
    e.preventDefault();
    updateAndSave(config, 'Pesan penguncian berhasil disimpan.');
  };

  // Open Add Question Modal
  const handleOpenAddQuestion = () => {
    setEditingQuestion(null);
    setQuestionForm({
      question: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      explanation: ''
    });
    setShowQuestionModal(true);
  };

  // Open Edit Question Modal
  const handleOpenEditQuestion = (q: TriviaQuestion) => {
    setEditingQuestion(q);
    setQuestionForm({
      question: q.question,
      options: [
        q.options[0] || '',
        q.options[1] || '',
        q.options[2] || '',
        q.options[3] || ''
      ],
      correctIndex: q.correctIndex,
      explanation: q.explanation || ''
    });
    setShowQuestionModal(true);
  };

  // Submit Question
  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionForm.question.trim()) {
      onToast('Teks soal pertanyaan wajib diisi!', 'error');
      return;
    }
    if (questionForm.options.some((opt) => !opt.trim())) {
      onToast('Keempat opsi pilihan jawaban harus diisi lengkap!', 'error');
      return;
    }

    if (editingQuestion) {
      const updatedList = config.customTriviaQuestions.map((q) =>
        q.id === editingQuestion.id
          ? {
              ...editingQuestion,
              question: questionForm.question.trim(),
              options: questionForm.options.map((o) => o.trim()),
              correctIndex: questionForm.correctIndex,
              explanation: questionForm.explanation.trim() || undefined
            }
          : q
      );
      updateAndSave({ ...config, customTriviaQuestions: updatedList }, 'Soal kuis berhasil diperbarui!');
    } else {
      const newQuestion: TriviaQuestion = {
        id: `q-custom-${Date.now()}`,
        question: questionForm.question.trim(),
        options: questionForm.options.map((o) => o.trim()),
        correctIndex: questionForm.correctIndex,
        explanation: questionForm.explanation.trim() || undefined
      };
      updateAndSave(
        { ...config, customTriviaQuestions: [...config.customTriviaQuestions, newQuestion] },
        'Soal baru berhasil ditambahkan ke Kuis Satwa!'
      );
    }

    setShowQuestionModal(false);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'question') {
      const filtered = config.customTriviaQuestions.filter((q) => q.id !== deleteTarget.id);
      updateAndSave({ ...config, customTriviaQuestions: filtered }, 'Soal kuis berhasil dihapus.');
    } else if (deleteTarget.type === 'diet') {
      const filtered = config.customDietPairs.filter((p) => p.animal !== deleteTarget.id);
      updateAndSave({ ...config, customDietPairs: filtered }, 'Pasangan makanan berhasil dihapus.');
    }

    setDeleteTarget(null);
  };

  // Reset to default
  const handleResetToDefault = () => {
    storageService.resetMiniGameQuestionsToDefault();
    const fresh = storageService.getMiniGameConfig();
    setConfig(fresh);
    onToast('Konten mini game dikembalikan ke standar bawaan aplikasi.', 'info');
  };

  // Save Math Settings
  const handleUpdateMathSettings = (maxTable: number, timerDuration: number) => {
    const updated: MiniGameConfig = {
      ...config,
      mathConfig: {
        maxTable,
        timerDuration
      }
    };
    updateAndSave(updated, `Pengaturan perkalian 1-${maxTable} (${timerDuration} detik) tersimpan!`);
  };

  // Submit Diet Pair
  const handleSubmitDiet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dietForm.animal.trim() || !dietForm.food.trim()) {
      onToast('Nama hewan dan nama makanan wajib diisi!', 'error');
      return;
    }
    const newPair = {
      animal: dietForm.animal.trim(),
      icon: dietForm.icon || '🐾',
      food: dietForm.food.trim(),
      foodIcon: dietForm.foodIcon || '🍎',
      sound: dietForm.sound.trim() || 'Nyam!'
    };
    const updated = {
      ...config,
      customDietPairs: [...config.customDietPairs, newPair]
    };
    updateAndSave(updated, 'Pasangan hewan & makanan berhasil ditambahkan!');
    setShowDietModal(false);
    setDietForm({ animal: '', icon: '🐾', food: '', foodIcon: '🍎', sound: 'Nyam!' });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 text-8xl opacity-15 select-none pointer-events-none">
          🎮
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                Kontrol Mini Game Guru
              </span>
              <span
                className={`text-xs font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                  config.isAllLocked
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-emerald-400 text-emerald-950'
                }`}
              >
                {config.isAllLocked ? (
                  <>
                    <Lock className="w-3 h-3" />
                    <span>STATUS: SEMUA DIKUNCI</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3 h-3" />
                    <span>STATUS: DIIZINKAN</span>
                  </>
                )}
              </span>
            </div>
            <h2 className="text-2xl font-black font-heading mt-2">
              Kelola & Kunci Mini Game
            </h2>
            <p className="text-xs sm:text-sm text-amber-100 max-w-2xl mt-1">
              Kunci mini game selama jam pelajaran atau ujian agar siswa tetap fokus, serta edit kuis satwa & pengaturan matematika agar relevan dengan kurikulum.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleToggleMasterLock(!config.isAllLocked)}
              className={`px-4 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg transition transform active:scale-95 cursor-pointer ${
                config.isAllLocked
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
                  : 'bg-rose-600 hover:bg-rose-500 text-white'
              }`}
            >
              {config.isAllLocked ? (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Buka Kunci Semua Game</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Kunci Semua Mini Game</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'locks', label: '🔒 Kunci & Akses Game', icon: Lock },
          { id: 'trivia', label: `🧠 Edit Soal Kuis (${config.customTriviaQuestions.length})`, icon: Brain },
          { id: 'math', label: '🧮 Pengaturan Perkalian', icon: Calculator },
          { id: 'diet', label: `🍽️ Pasangan Makanan (${config.customDietPairs.length})`, icon: Utensils }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as typeof activeSubTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-white hover:bg-amber-50 text-slate-700 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: KUNCI & AKSES GAME */}
      {activeSubTab === 'locks' && (
        <div className="space-y-6">
          {/* Master Lock Banner & Custom Message */}
          <div className="bg-white rounded-3xl p-6 border-2 border-amber-200 shadow-md">
            <h3 className="font-extrabold font-heading text-slate-800 text-base sm:text-lg flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-600" />
              <span>Pesan Peringatan Ketika Mini Game Dikunci</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Pesan ini akan tampil di layar siswa saat mereka mencoba membuka permainan yang terkunci.
            </p>

            <form onSubmit={handleSaveLockMessage} className="mt-4 space-y-3">
              <div>
                <textarea
                  rows={2}
                  value={config.lockMessage}
                  onChange={(e) => setConfig({ ...config, lockMessage: e.target.value })}
                  placeholder="Ketik pesan untuk siswa..."
                  className="w-full text-xs sm:text-sm p-3.5 rounded-2xl bg-amber-50/50 border-2 border-amber-200 focus:border-amber-500 focus:bg-white outline-none transition"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-slate-500">Pilihan Cepat:</span>
                {[
                  'Mini game dikunci selama jam pelajaran. Harap fokus pada materi!',
                  'Sedang berlangsung Ujian / Penilaian Harian.',
                  'Waktu istirahat telah selesai. Mari bersiap kembali belajar!',
                  'Waktu Sholat dan Makan Siang. Simpan game Anda.'
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setConfig({ ...config, lockMessage: preset });
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200 transition cursor-pointer"
                  >
                    Preset {idx + 1}
                  </button>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Pesan Penguncian</span>
                </button>
              </div>
            </form>
          </div>

          {/* Individual Per-Game Lock Toggles */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-extrabold font-heading text-slate-800 text-base">
                  Kunci Per-Permainan (Kontrol Individual)
                </h3>
                <p className="text-xs text-slate-500">
                  Guru dapat mengunci permainan tertentu sementara membuka permainan edukasi lainnya.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  id: 'trivia' as const,
                  name: 'Kuis Cerdas Satwa',
                  desc: 'Kuis fakta hewan, biologi, dan kebiasaan satwa (+50 XP)',
                  icon: Brain,
                  color: 'from-amber-400 to-yellow-500'
                },
                {
                  id: 'math' as const,
                  name: 'Tantangan Perkalian',
                  desc: 'Latihan hitung cepat perkalian matematika (+XP & Combo)',
                  icon: Calculator,
                  color: 'from-blue-400 to-indigo-500'
                },
                {
                  id: 'memory' as const,
                  name: 'Memori Hewan',
                  desc: 'Mencocokkan pasangan kartu hewan lucu (+60 XP)',
                  icon: Grid,
                  color: 'from-emerald-400 to-teal-500'
                },
                {
                  id: 'diet' as const,
                  name: 'Cocokkan Makanan Hewan',
                  desc: 'Mencocokkan jenis makanan alami satwa (+50 XP)',
                  icon: Utensils,
                  color: 'from-rose-400 to-pink-500'
                }
              ].map((g) => {
                const Icon = g.icon;
                const isLocked = config.isAllLocked || config.lockedGames[g.id];
                return (
                  <div
                    key={g.id}
                    className={`p-4 rounded-3xl border-2 transition shadow-xs flex items-center justify-between gap-3 ${
                      isLocked
                        ? 'bg-rose-50/60 border-rose-300'
                        : 'bg-white border-slate-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${g.color} text-white flex items-center justify-center shadow-md`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-slate-800">{g.name}</h4>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              isLocked
                                ? 'bg-rose-200 text-rose-900'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isLocked ? '🔒 Dikunci' : '🔓 Terbuka'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{g.desc}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={config.isAllLocked}
                      onClick={() => handleToggleSingleLock(g.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                        config.isAllLocked
                          ? 'opacity-40 cursor-not-allowed bg-slate-200 text-slate-500'
                          : isLocked
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs'
                          : 'bg-rose-500 hover:bg-rose-600 text-white shadow-xs'
                      }`}
                      title={config.isAllLocked ? 'Semua game sedang dikunci oleh saklar utama' : ''}
                    >
                      {isLocked ? (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Buka</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Kunci</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
            {config.isAllLocked && (
              <p className="text-xs text-rose-600 font-bold mt-2 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Saklar Master Lock aktif: Semua game terkunci serentak. Buka saklar utama di atas untuk mengatur per-game secara bebas.</span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: EDIT SOAL KUIS */}
      {activeSubTab === 'trivia' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="font-extrabold font-heading text-slate-800 text-base">
                Bank Soal Kuis Cerdas Satwa
              </h3>
              <p className="text-xs text-slate-500">
                Soal ini akan dimainkan langsung oleh siswa di tab Kuis Satwa Pintar (+50 XP).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetToDefault}
                className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                title="Kembalikan ke soal bawaan"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Standar</span>
              </button>
              <button
                onClick={handleOpenAddQuestion}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Soal Baru</span>
              </button>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-3">
            {config.customTriviaQuestions.map((q, idx) => (
              <div
                key={q.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-amber-300 shadow-xs transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h4 className="font-bold text-sm text-slate-800 leading-snug">
                        {q.question}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pl-8">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = optIdx === q.correctIndex;
                        return (
                          <div
                            key={optIdx}
                            className={`text-xs p-2 rounded-xl border flex items-center gap-2 ${
                              isCorrect
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <span className="w-4 h-4 rounded-full bg-white text-[10px] flex items-center justify-center font-mono border border-slate-300">
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="truncate">{opt}</span>
                            {isCorrect && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <p className="text-[11px] text-slate-500 mt-2 pl-8 italic">
                        💡 Penjelasan: {q.explanation}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEditQuestion(q)}
                      className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition cursor-pointer"
                      title="Edit Soal"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      disabled={config.customTriviaQuestions.length <= 1}
                      onClick={() =>
                        setDeleteTarget({
                          id: q.id,
                          title: `Soal #${idx + 1}: "${q.question.slice(0, 40)}..."`,
                          type: 'question'
                        })
                      }
                      className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer disabled:opacity-30"
                      title="Hapus Soal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: PENGATURAN PERKALIAN */}
      {activeSubTab === 'math' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-6">
          <div>
            <h3 className="font-extrabold font-heading text-slate-800 text-base sm:text-lg flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-600" />
              <span>Pengaturan Tantangan Perkalian (Math Sprint)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Sesuaikan tingkat kesulitan perkalian dan durasi bermain agar pas dengan tingkatan kelas siswa (misal: Kelas 2 perkalian 1-5, Kelas 4 perkalian 1-10).
            </p>
          </div>

          {/* Max Table Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Maksimum Tabel Perkalian:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { val: 5, label: 'Perkalian 1 - 5', desc: 'Pemula / Kelas Rendah' },
                { val: 10, label: 'Perkalian 1 - 10', desc: 'Standar / Kelas 3-4' },
                { val: 12, label: 'Perkalian 1 - 12', desc: 'Lanjutan / Kelas 5' },
                { val: 15, label: 'Perkalian 1 - 15', desc: 'Tantangan Master' }
              ].map((item) => {
                const isSelected = config.mathConfig.maxTable === item.val;
                return (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => handleUpdateMathSettings(item.val, config.mathConfig.timerDuration)}
                    className={`p-3.5 rounded-2xl border-2 text-left transition cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-950 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="text-sm font-extrabold">{item.label}</div>
                    <div className="text-[11px] opacity-70 mt-0.5">{item.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timer Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Durasi Waktu Permainan (Timer):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { val: 20, label: '20 Detik', desc: 'Super Cepat' },
                { val: 30, label: '30 Detik', desc: 'Waktu Standar' },
                { val: 45, label: '45 Detik', desc: 'Santai & Leluasa' },
                { val: 60, label: '60 Detik', desc: '1 Menit Penuh' }
              ].map((item) => {
                const isSelected = config.mathConfig.timerDuration === item.val;
                return (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => handleUpdateMathSettings(config.mathConfig.maxTable, item.val)}
                    className={`p-3.5 rounded-2xl border-2 text-left transition cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50 border-amber-500 text-amber-950 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="text-sm font-extrabold flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>{item.label}</span>
                    </div>
                    <div className="text-[11px] opacity-70 mt-0.5">{item.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-200 text-xs text-indigo-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              Pengaturan saat ini: Siswa akan menjawab perkalian acak dari <strong>1 s.d. {config.mathConfig.maxTable}</strong> selama <strong>{config.mathConfig.timerDuration} detik</strong>.
            </span>
          </div>
        </div>
      )}

      {/* SUBTAB 4: PASANGAN MAKANAN HEWAN */}
      {activeSubTab === 'diet' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="font-extrabold font-heading text-slate-800 text-base">
                Pasangan Makanan Alami Satwa
              </h3>
              <p className="text-xs text-slate-500">
                Data ini digunakan dalam mini game Cocokkan Makanan Hewan.
              </p>
            </div>
            <button
              onClick={() => setShowDietModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pasangan Hewan</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {config.customDietPairs.map((pair, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-3.5 border border-slate-200 hover:border-amber-300 shadow-xs flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl p-2 bg-amber-50 rounded-xl">{pair.icon}</span>
                  <div>
                    <h5 className="font-bold text-xs text-slate-800">{pair.animal}</h5>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                      <span>Makan:</span>
                      <span className="font-semibold text-amber-700">{pair.foodIcon} {pair.food}</span>
                    </div>
                  </div>
                </div>

                <button
                  disabled={config.customDietPairs.length <= 2}
                  onClick={() =>
                    setDeleteTarget({
                      id: pair.animal,
                      title: `${pair.animal} & ${pair.food}`,
                      type: 'diet'
                    })
                  }
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer disabled:opacity-30"
                  title="Hapus Pasangan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QUESTION MODAL (ADD / EDIT) */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border-4 border-amber-300 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black font-heading text-slate-800">
              {editingQuestion ? 'Edit Soal Kuis Satwa' : 'Tambah Soal Baru'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tulis pertanyaan yang menarik dan mendidik untuk siswa.
            </p>

            <form onSubmit={handleSubmitQuestion} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Pertanyaan Kuis:
                </label>
                <textarea
                  required
                  rows={3}
                  value={questionForm.question}
                  onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                  placeholder="Contoh: Mengapa kucing sering menjilat bulunya sendiri?"
                  className="w-full text-xs p-3 rounded-xl bg-amber-50/50 border border-amber-200 focus:border-amber-500 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Pilihan Jawaban (Pilih radio button untuk KUNCI BENAR):
                </label>
                <div className="space-y-2">
                  {questionForm.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="radio"
                        id={`opt-radio-${idx}`}
                        name="correctOpt"
                        checked={questionForm.correctIndex === idx}
                        onChange={() => setQuestionForm({ ...questionForm, correctIndex: idx })}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        title="Tandai sebagai jawaban benar"
                      />
                      <label htmlFor={`opt-radio-${idx}`} className="text-xs font-bold font-mono text-slate-600 w-5">
                        {String.fromCharCode(65 + idx)}:
                      </label>
                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...questionForm.options] as [string, string, string, string];
                          newOpts[idx] = e.target.value;
                          setQuestionForm({ ...questionForm, options: newOpts });
                        }}
                        placeholder={`Pilihan ${String.fromCharCode(65 + idx)}...`}
                        className="flex-1 text-xs p-2 rounded-xl bg-slate-50 border border-slate-200 focus:border-amber-400 focus:bg-white outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Pembahasan Edukatif / Penjelasan (Opsional):
                </label>
                <input
                  type="text"
                  value={questionForm.explanation}
                  onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                  placeholder="Contoh: Kucing menjilat bulunya untuk membersihkan diri dan mendinginkan suhu tubuh."
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-amber-400 focus:bg-white outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {editingQuestion ? 'Perbarui Soal' : 'Simpan Soal Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIET MODAL (ADD PAIR) */}
      {showDietModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-4 border-amber-300 animate-fadeIn">
            <h3 className="text-lg font-black font-heading text-slate-800">
              Tambah Pasangan Makanan Hewan
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tambahkan nama hewan dan makanannya untuk kuis cocokkan makanan.
            </p>

            <form onSubmit={handleSubmitDiet} className="space-y-3 mt-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Emoji Hewan:
                  </label>
                  <input
                    type="text"
                    required
                    value={dietForm.icon}
                    onChange={(e) => setDietForm({ ...dietForm, icon: e.target.value })}
                    className="w-full text-center text-lg p-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Nama Hewan:
                  </label>
                  <input
                    type="text"
                    required
                    value={dietForm.animal}
                    onChange={(e) => setDietForm({ ...dietForm, animal: e.target.value })}
                    placeholder="Misal: Koala Lucu"
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Emoji Makanan:
                  </label>
                  <input
                    type="text"
                    required
                    value={dietForm.foodIcon}
                    onChange={(e) => setDietForm({ ...dietForm, foodIcon: e.target.value })}
                    className="w-full text-center text-lg p-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Nama Makanan:
                  </label>
                  <input
                    type="text"
                    required
                    value={dietForm.food}
                    onChange={(e) => setDietForm({ ...dietForm, food: e.target.value })}
                    placeholder="Misal: Daun Eukaliptus"
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Suara / Keterangan Bunyi:
                </label>
                <input
                  type="text"
                  value={dietForm.sound}
                  onChange={(e) => setDietForm({ ...dietForm, sound: e.target.value })}
                  placeholder="Misal: Krauk-krauk!"
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDietModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Tambah Pasangan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IN-APP DELETE MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border-4 border-rose-300 text-center animate-fadeIn">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-base text-slate-800">
              Konfirmasi Hapus
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Apakah Anda yakin ingin menghapus <strong>{deleteTarget.title}</strong>?
            </p>
            <div className="flex items-center justify-center gap-2 mt-5">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
