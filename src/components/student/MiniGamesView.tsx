import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Brain,
  Calculator,
  Grid,
  Utensils,
  Award,
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Timer,
  Lock
} from 'lucide-react';
import { soundManager } from '../../services/audio';
import { storageService } from '../../services/storage';
import { Student, MiniGameConfig } from '../../types';
import {
  ANIMAL_TRIVIA_QUESTIONS,
  ANIMAL_DIET_PAIRS,
  MEMORY_CARD_PAIRS
} from '../../data/initialData';

interface MiniGamesViewProps {
  student: Student;
  onRewardClaimed: () => void;
}

export const MiniGamesView: React.FC<MiniGamesViewProps> = ({ student, onRewardClaimed }) => {
  const [config, setConfig] = useState<MiniGameConfig>(() => storageService.getMiniGameConfig());
  const [selectedGame, setSelectedGame] = useState<'trivia' | 'math' | 'memory' | 'diet'>('trivia');

  // Real-time synchronization with Teacher changes
  useEffect(() => {
    const unsub = storageService.subscribe((event) => {
      if (event.type === 'MINIGAME_CONFIG_CHANGED' || event.type === 'DATA_REFRESH') {
        setConfig(storageService.getMiniGameConfig());
      }
    });
    return () => unsub();
  }, []);

  // --- TRIVIA STATE ---
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [triviaSelected, setTriviaSelected] = useState<number | null>(null);
  const [triviaScore, setTriviaScore] = useState(0);
  const [triviaFinished, setTriviaFinished] = useState(false);

  // --- MATH SPRINT STATE ---
  const [mathA, setMathA] = useState(6);
  const [mathB, setMathB] = useState(7);
  const [mathOptions, setMathOptions] = useState<number[]>([]);
  const [mathScore, setMathScore] = useState(0);
  const [mathStreak, setMathStreak] = useState(0);
  const [mathTimer, setMathTimer] = useState(config.mathConfig?.timerDuration || 30);

  const [mathActive, setMathActive] = useState(false);
  const [mathFinished, setMathFinished] = useState(false);

  // --- MEMORY MATCH STATE ---
  interface MemoryCard {
    cardId: string;
    pairId: string;
    name: string;
    emoji: string;
    bg: string;
    flipped: boolean;
    matched: boolean;
  }
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryFinished, setMemoryFinished] = useState(false);

  // --- DIET MATCH STATE ---
  const [dietSelectedAnimal, setDietSelectedAnimal] = useState<string | null>(null);
  const [dietMatches, setDietMatches] = useState<string[]>([]);
  const [dietFeedback, setDietFeedback] = useState<string | null>(null);

  // Derived dynamic content from Teacher's configuration
  const triviaQuestions =
    config.customTriviaQuestions && config.customTriviaQuestions.length > 0
      ? config.customTriviaQuestions
      : ANIMAL_TRIVIA_QUESTIONS;

  const dietPairs =
    config.customDietPairs && config.customDietPairs.length > 0
      ? config.customDietPairs
      : ANIMAL_DIET_PAIRS;

  const memoryPairs =
    config.customMemoryPairs && config.customMemoryPairs.length > 0
      ? config.customMemoryPairs
      : MEMORY_CARD_PAIRS;

  // Init Math
  const generateMathQuestion = () => {
    const maxTable = config.mathConfig?.maxTable || 10;
    const a = Math.floor(Math.random() * (maxTable - 1)) + 2; // 2 to maxTable
    const b = Math.floor(Math.random() * (maxTable - 1)) + 2; // 2 to maxTable
    const correct = a * b;

    const wrong1 = correct + (Math.random() > 0.5 ? 2 : -2);
    const wrong2 = correct + (Math.random() > 0.5 ? 4 : -4);
    const wrong3 = Math.max(4, correct + (Math.random() > 0.5 ? 10 : -10));

    const setOpts = new Set([correct, wrong1, wrong2, wrong3]);
    while (setOpts.size < 4) {
      setOpts.add(correct + Math.floor(Math.random() * 12) - 6);
    }
    const shuffled = Array.from(setOpts).sort(() => Math.random() - 0.5);

    setMathA(a);
    setMathB(b);
    setMathOptions(shuffled);
  };

  // Math countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mathActive && mathTimer > 0) {
      interval = setInterval(() => {
        setMathTimer((t) => {
          if (t <= 1) {
            setMathActive(false);
            setMathFinished(true);
            soundManager.playStarChime();
            // Reward for math score
            storageService.addStudentXp(student.id, Math.min(100, mathScore * 10 + 20));
            storageService.incrementQuestProgress('minigame', 1);
            storageService.recordMiniGamePerformance(student.id, {
              gameId: 'math',
              gameName: 'Tantangan Perkalian',
              score: mathScore,
              isVictory: mathScore >= 4,
              timestamp: new Date().toISOString()
            });
            onRewardClaimed();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mathActive, mathTimer, mathScore]);

  // Init Memory Match Cards
  const initMemoryGame = () => {
    const deck: MemoryCard[] = [];
    memoryPairs.forEach((item) => {
      deck.push({
        cardId: `${item.id}-1`,
        pairId: item.id,
        name: item.name,
        emoji: item.emoji,
        bg: item.bg,
        flipped: false,
        matched: false
      });
      deck.push({
        cardId: `${item.id}-2`,
        pairId: item.id,
        name: item.name,
        emoji: item.emoji,
        bg: item.bg,
        flipped: false,
        matched: false
      });
    });
    setCards(deck.sort(() => Math.random() - 0.5));
    setFlippedIndices([]);
    setMemoryMoves(0);
    setMemoryFinished(false);
  };

  useEffect(() => {
    initMemoryGame();
    generateMathQuestion();
  }, [config.customMemoryPairs, config.mathConfig]);

  // TRIVIA HANDLER
  const currentQ = triviaQuestions[triviaIndex] || triviaQuestions[0];
  const handleSelectTrivia = (idx: number) => {
    if (triviaSelected !== null || !currentQ) return;
    setTriviaSelected(idx);

    if (idx === currentQ.correctIndex) {
      soundManager.playCorrect();
      setTriviaScore((s) => s + 1);
    } else {
      soundManager.playWrong();
    }
  };

  const handleNextTrivia = () => {
    if (triviaIndex + 1 < triviaQuestions.length) {
      setTriviaIndex((i) => i + 1);
      setTriviaSelected(null);
    } else {
      setTriviaFinished(true);
      soundManager.playStarChime();
      storageService.addStudentXp(student.id, 50);
      storageService.incrementQuestProgress('minigame', 1);
      storageService.recordMiniGamePerformance(student.id, {
        gameId: 'trivia',
        gameName: 'Kuis Cerdas Satwa',
        score: triviaScore,
        maxScore: triviaQuestions.length,
        isVictory: triviaScore >= Math.ceil(triviaQuestions.length / 2),
        timestamp: new Date().toISOString()
      });
      confetti({ particleCount: 70, spread: 60 });
      onRewardClaimed();
    }
  };

  // MATH HANDLER
  const handleAnswerMath = (chosen: number) => {
    if (!mathActive) return;
    if (chosen === mathA * mathB) {
      soundManager.playCorrect();
      setMathScore((s) => s + 1);
      setMathStreak((st) => st + 1);
    } else {
      soundManager.playWrong();
      setMathStreak(0);
    }
    generateMathQuestion();
  };

  const startMathGame = () => {
    setMathScore(0);
    setMathStreak(0);
    setMathTimer(config.mathConfig?.timerDuration || 30);
    setMathFinished(false);
    setMathActive(true);
    generateMathQuestion();
  };


  // MEMORY MATCH HANDLER
  const handleFlipCard = (index: number) => {
    if (cards[index].flipped || cards[index].matched || flippedIndices.length >= 2) return;

    soundManager.playPurr();
    const newCards = [...cards];
    newCards[index].flipped = true;
    setCards(newCards);

    const nextFlipped = [...flippedIndices, index];
    setFlippedIndices(nextFlipped);

    if (nextFlipped.length === 2) {
      setMemoryMoves((m) => m + 1);
      const [first, second] = nextFlipped;
      if (newCards[first].pairId === newCards[second].pairId) {
        // MATCH!
        soundManager.playCorrect();
        newCards[first].matched = true;
        newCards[second].matched = true;
        setCards([...newCards]);
        setFlippedIndices([]);

        // Check all matched
        if (newCards.every((c) => c.matched)) {
          setMemoryFinished(true);
          soundManager.playStarChime();
          storageService.addStudentXp(student.id, 60);
          storageService.incrementQuestProgress('minigame', 1);
          storageService.recordMiniGamePerformance(student.id, {
            gameId: 'memory',
            gameName: 'Memori Hewan',
            score: memoryMoves,
            isVictory: true,
            timestamp: new Date().toISOString()
          });
          confetti({ particleCount: 90, spread: 70 });
          onRewardClaimed();
        }
      } else {
        // MISMATCH -> Flip back
        setTimeout(() => {
          newCards[first].flipped = false;
          newCards[second].flipped = false;
          setCards([...newCards]);
          setFlippedIndices([]);
        }, 900);
      }
    }
  };

  // DIET MATCH HANDLER
  const handleTapAnimalDiet = (animalName: string) => {
    if (dietMatches.includes(animalName)) return;
    setDietSelectedAnimal(animalName);
    setDietFeedback(null);
  };

  const handleTapFoodDiet = (foodName: string) => {
    if (!dietSelectedAnimal) {
      setDietFeedback('Pilih hewannya terlebih dahulu!');
      return;
    }

    const pair = dietPairs.find((p) => p.animal === dietSelectedAnimal);
    if (pair && pair.food === foodName) {
      soundManager.playCorrect();
      setDietMatches((prev) => [...prev, dietSelectedAnimal]);
      setDietFeedback(`Benar! ${pair.sound} ${dietSelectedAnimal} menyukai ${foodName}!`);
      setDietSelectedAnimal(null);

      if (dietMatches.length + 1 >= dietPairs.length) {
        soundManager.playStarChime();
        storageService.addStudentXp(student.id, 50);
        storageService.incrementQuestProgress('minigame', 1);
        storageService.recordMiniGamePerformance(student.id, {
          gameId: 'diet',
          gameName: 'Cocokkan Makanan',
          score: dietMatches.length + 1,
          maxScore: dietPairs.length,
          isVictory: true,
          timestamp: new Date().toISOString()
        });
        confetti({ particleCount: 80, spread: 60 });
        onRewardClaimed();
      }
    } else {
      soundManager.playWrong();
      setDietFeedback(`Kurang tepat. Coba pilih makanan yang sesuai untuk ${dietSelectedAnimal}!`);
    }
  };

  const isCurrentGameLocked = config.isAllLocked || config.lockedGames[selectedGame];

  return (
    <div className="space-y-6">
      {/* Game Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { id: 'trivia' as const, label: 'Kuis Cerdas Satwa', icon: Brain, desc: 'Fakta & Kebiasaan Satwa', badge: '+50 XP' },
          { id: 'math' as const, label: 'Tantangan Perkalian', icon: Calculator, desc: `Hafalan 1-${config.mathConfig.maxTable}`, badge: '+XP & Combo' },
          { id: 'memory' as const, label: 'Memori Hewan', icon: Grid, desc: 'Cocokkan Kartu Lucu', badge: '+60 XP' },
          { id: 'diet' as const, label: 'Cocokkan Makanan', icon: Utensils, desc: 'Diet Alami Satwa', badge: '+50 XP' }
        ].map((g) => {
          const Icon = g.icon;
          const isSel = selectedGame === g.id;
          const isLocked = config.isAllLocked || config.lockedGames[g.id];
          return (
            <button
              key={g.id}
              onClick={() => setSelectedGame(g.id)}
              className={`p-3.5 rounded-3xl border-2 text-left transition flex flex-col justify-between shadow-xs relative overflow-hidden ${
                isSel
                  ? isLocked
                    ? 'bg-rose-50 border-rose-400 text-rose-950 shadow-md scale-102'
                    : 'bg-gradient-to-br from-amber-400 to-yellow-400 text-amber-950 border-amber-500 shadow-md scale-102'
                  : isLocked
                  ? 'bg-rose-50/50 hover:bg-rose-100/60 border-rose-200 text-slate-600'
                  : 'bg-white hover:bg-amber-50/60 border-slate-200 text-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`p-2 rounded-2xl text-xl shadow-xs ${isLocked ? 'bg-rose-100 text-rose-700' : 'bg-white/60 text-amber-800'}`}>
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                    isLocked ? 'bg-rose-500 text-white' : 'bg-amber-950/15 text-amber-950'
                  }`}>
                    {isLocked ? (
                      <>
                        <Lock className="w-2.5 h-2.5" />
                        <span>Kunci</span>
                      </>
                    ) : (
                      g.badge
                    )}
                  </span>
                </div>
                <h4 className="font-extrabold font-heading text-sm">{g.label}</h4>
                <p className="text-[11px] opacity-80 mt-0.5">{g.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* LOCKED STATE NOTICE */}
      {isCurrentGameLocked ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border-4 border-amber-300 shadow-xl max-w-xl mx-auto text-center animate-fadeIn">
          <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 via-rose-400 to-rose-500 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-lg border-4 border-white mb-4 animate-bounce-gentle">
            🔒
          </div>
          <span className="inline-block px-3.5 py-1 bg-rose-100 border border-rose-300 text-rose-800 font-black text-xs rounded-full uppercase tracking-wider mb-2">
            Sedang Dikunci oleh Guru
          </span>
          <h3 className="text-xl sm:text-2xl font-black font-heading text-slate-800">
            {config.isAllLocked ? 'Semua Mini Game Dikunci Sementara' : 'Game Ini Sedang Dikunci Guru'}
          </h3>

          <div className="mt-4 p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-200 text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
            <span className="font-extrabold text-amber-950 block mb-1">📢 Pesan dari Guru:</span>
            <p className="font-semibold text-slate-800 italic">"{config.lockMessage}"</p>
          </div>

          <p className="text-xs text-slate-500 mt-4 leading-relaxed">
            Silakan kembali menyimak instruksi Bapak/Ibu Guru di kelas. Game akan otomatis terbuka kembali begitu Guru membuka kuncinya.
          </p>
        </div>
      ) : (
        <>
      {/* GAME 1: KUIS CERDAS SATWA */}

      {selectedGame === 'trivia' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-xl max-w-2xl mx-auto">
          {!triviaFinished ? (
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 pb-3 border-b border-slate-100">
                <span>Soal {triviaIndex + 1} dari {triviaQuestions.length}</span>
                <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                  Skor: {triviaScore} Benar ⭐
                </span>
              </div>

              <h3 className="font-extrabold font-heading text-slate-800 text-base sm:text-lg mt-4 leading-relaxed">
                {currentQ.question}
              </h3>

              {/* Options */}
              <div className="space-y-2.5 mt-5">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = triviaSelected === idx;
                  const isCorrect = idx === currentQ.correctIndex;
                  const showResult = triviaSelected !== null;

                  let btnStyle = 'bg-slate-50 hover:bg-amber-50 border-slate-200 text-slate-800';
                  if (showResult) {
                    if (isCorrect) btnStyle = 'bg-emerald-100 border-emerald-400 text-emerald-950 font-bold';
                    else if (isSelected) btnStyle = 'bg-rose-100 border-rose-400 text-rose-950';
                  }

                  return (
                    <button
                      key={idx}
                      disabled={showResult}
                      onClick={() => handleSelectTrivia(idx)}
                      className={`w-full p-3.5 rounded-2xl border-2 text-left text-xs sm:text-sm font-semibold transition flex items-center justify-between gap-3 ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                      {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Educational Explanation Box */}
              {triviaSelected !== null && (
                <div className="mt-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 animate-fadeIn">
                  <div className="text-xs font-bold text-amber-900 mb-1 flex items-center gap-1">
                    <span>💡 Fakta Edukasi Satwa:</span>
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed font-medium">
                    {currentQ.explanation}
                  </p>
                  <button
                    onClick={handleNextTrivia}
                    className="mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold rounded-xl shadow transition flex items-center gap-1.5 ml-auto"
                  >
                    <span>{triviaIndex + 1 < triviaQuestions.length ? 'Soal Berikutnya' : 'Lihat Hasil'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-20 h-20 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center text-4xl mx-auto mb-4 animate-bounce-gentle">
                🏆
              </div>
              <h3 className="text-2xl font-extrabold font-heading text-slate-800">
                Luar Biasa, Siswa Pintar!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Kamu telah menyelesaikan Kuis Cerdas Satwa dengan hasil memuaskan!
              </p>
              <div className="my-5 p-4 bg-amber-50 rounded-2xl border border-amber-200 inline-block font-extrabold text-amber-900">
                Skor Akhir: {triviaScore} dari {triviaQuestions.length} Soal Benar 🎉
                <div className="text-xs font-bold text-indigo-600 mt-1">
                  Hadiah: +50 XP ditambahkan ke hewan peliharaanmu!
                </div>
              </div>
              <div>
                <button
                  onClick={() => {
                    setTriviaIndex(0);
                    setTriviaSelected(null);
                    setTriviaScore(0);
                    setTriviaFinished(false);
                  }}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow transition inline-flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Mainkan Lagi</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* GAME 2: TANTANGAN PERKALIAN KILAT */}
      {selectedGame === 'math' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-xl max-w-xl mx-auto text-center">
          {!mathActive && !mathFinished && (
            <div className="py-4">
              <div className="w-16 h-16 rounded-3xl bg-sky-100 text-sky-600 flex items-center justify-center text-3xl mx-auto mb-3">
                ⚡
              </div>
              <h3 className="text-xl font-extrabold font-heading text-slate-800">
                Tantangan Kilat Perkalian 1–10
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                Jawab sebanyak mungkin soal perkalian dengan benar dalam 30 detik! Bangun kombo benar untuk mendapatkan XP berlimpah!
              </p>
              <button
                onClick={startMathGame}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-black text-sm rounded-2xl shadow-lg transition active:scale-95"
              >
                Mulai Tantangan Sekarang ⏱️
              </button>
            </div>
          )}

          {mathActive && (
            <div>
              {/* Header Stats */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 text-xs font-bold">
                <div className="flex items-center gap-1.5 text-rose-600 font-mono text-sm bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                  <Timer className="w-4 h-4" />
                  <span>{mathTimer} Detik</span>
                </div>
                <div className="bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                  Skor: <span className="font-extrabold">{mathScore}</span>
                </div>
                <div className="bg-indigo-100 text-indigo-900 px-3 py-1 rounded-full">
                  Kombo: <span className="font-extrabold">{mathStreak}x 🔥</span>
                </div>
              </div>

              {/* Big Math Question */}
              <div className="my-6 py-6 bg-amber-50/80 rounded-3xl border-2 border-dashed border-amber-300">
                <span className="text-4xl sm:text-5xl font-black font-heading text-slate-800 tracking-wider">
                  {mathA} × {mathB} = ?
                </span>
              </div>

              {/* 4 Answer Buttons */}
              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                {mathOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswerMath(opt)}
                    className="h-14 rounded-2xl bg-slate-50 hover:bg-amber-100 active:scale-95 text-slate-800 font-extrabold text-xl transition border-2 border-slate-200 hover:border-amber-400 shadow-xs flex items-center justify-center"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mathFinished && (
            <div className="py-4">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-xl font-extrabold font-heading text-slate-800">
                Waktu Habis! Kamu Hebat!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Latihan hafalan perkalian membantumu semakin cepat berhitung di kelas.
              </p>
              <div className="my-4 p-4 bg-amber-50 rounded-2xl border border-amber-200 inline-block font-extrabold text-slate-800">
                <div className="text-2xl text-amber-700 font-black">{mathScore} Soal Benar!</div>
                <div className="text-xs text-indigo-600 mt-1">
                  Hadiah: +{mathScore * 10 + 20} XP hewan peliharaan!
                </div>
              </div>
              <div>
                <button
                  onClick={startMathGame}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  Coba Tantangan Lagi
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* GAME 3: MEMORI KARTU HEWAN */}
      {selectedGame === 'memory' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-xl max-w-xl mx-auto text-center">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 pb-3 mb-4 border-b border-slate-100">
            <span>Mencocokkan 6 Pasang Kartu Satwa</span>
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                Langkah: {memoryMoves}
              </span>
              <button
                onClick={initMemoryGame}
                className="p-1 rounded hover:bg-slate-100 text-slate-600"
                title="Kocok Ulang Kartu"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!memoryFinished ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-w-md mx-auto">
              {cards.map((card, idx) => {
                const isOpen = card.flipped || card.matched;
                return (
                  <div
                    key={card.cardId}
                    onClick={() => handleFlipCard(idx)}
                    className={`h-24 sm:h-28 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center select-none shadow-xs ${
                      isOpen
                        ? `${card.bg} border-amber-400 scale-100`
                        : 'bg-amber-500 border-amber-600 hover:bg-amber-400 text-white hover:scale-102'
                    }`}
                  >
                    {isOpen ? (
                      <>
                        <span className="text-3xl sm:text-4xl animate-bounce-gentle">{card.emoji}</span>
                        <span className="text-[10px] font-extrabold mt-1 truncate max-w-[80px]">
                          {card.name}
                        </span>
                      </>
                    ) : (
                      <span className="text-2xl font-bold opacity-80">❓</span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-6">
              <div className="text-4xl mb-2">⭐</div>
              <h3 className="text-2xl font-extrabold font-heading text-slate-800">
                Selamat! Semua Pasangan Ditemukan!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Daya ingat visualmu sangat tajam dalam {memoryMoves} langkah.
              </p>
              <div className="my-4 text-xs font-bold text-indigo-600 bg-indigo-50 py-2 px-4 rounded-xl inline-block border border-indigo-200">
                +60 XP telah dihadiahkan ke hewan peliharaanmu!
              </div>
              <div>
                <button
                  onClick={initMemoryGame}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  Mainkan Lagi
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* GAME 4: COCOKKAN MAKANAN ALAMI HEWAN */}
      {selectedGame === 'diet' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-xl max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-lg font-extrabold font-heading text-slate-800">
              Cocokkan Hewan dengan Makanan Alaminya
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              1. Klik salah satu hewan di sebelah kiri ➔ 2. Klik makanan yang tepat di sebelah kanan!
            </p>
            {dietFeedback && (
              <div className="mt-3 text-xs font-bold text-amber-900 bg-amber-50 py-1.5 px-3 rounded-full border border-amber-200 inline-block animate-fadeIn">
                {dietFeedback}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Left: Animals Column */}
            <div className="space-y-2">
              <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                Hewan Peliharaan:
              </div>
              {dietPairs.map((p) => {
                const isMatched = dietMatches.includes(p.animal);
                const isSel = dietSelectedAnimal === p.animal;
                return (
                  <button
                    key={p.animal}
                    disabled={isMatched}
                    onClick={() => handleTapAnimalDiet(p.animal)}
                    className={`w-full p-3 rounded-2xl border-2 text-left font-bold text-xs sm:text-sm flex items-center justify-between transition ${
                      isMatched
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 opacity-60'
                        : isSel
                        ? 'bg-amber-100 border-amber-500 text-amber-950 scale-102 shadow-sm'
                        : 'bg-slate-50 hover:bg-amber-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-xl">{p.icon}</span>
                      <span>{p.animal}</span>
                    </span>
                    {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>
                );
              })}
            </div>

            {/* Right: Foods Column */}
            <div className="space-y-2">
              <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
                Pilihan Makanan:
              </div>
              {/* Dynamic Foods from dietPairs */}
              {Array.from(
                new Map(dietPairs.map((p) => [p.food, { food: p.food, icon: p.foodIcon }])).values()
              ).map((f) => {
                const isAlreadyMatched = dietPairs.some(
                  (p) => p.food === f.food && dietMatches.includes(p.animal)
                );
                return (
                  <button
                    key={f.food}
                    disabled={isAlreadyMatched}
                    onClick={() => handleTapFoodDiet(f.food)}
                    className={`w-full p-3 rounded-2xl border-2 text-left font-bold text-xs sm:text-sm flex items-center justify-between transition ${
                      isAlreadyMatched
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 opacity-60'
                        : 'bg-slate-50 hover:bg-amber-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-xl">{f.icon}</span>
                      <span>{f.food}</span>
                    </span>
                    {isAlreadyMatched && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {dietMatches.length >= dietPairs.length && (
            <div className="mt-6 text-center py-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <span className="text-2xl">🎉</span>
              <h4 className="font-extrabold text-emerald-900 text-sm mt-1">
                Semua Makanan Berhasil Dicocokkan!
              </h4>
              <p className="text-xs text-emerald-700 mt-0.5">
                Kamu paham betul nutrisi dan makanan alami sahabat satwa. (+50 XP)
              </p>
              <button
                onClick={() => {
                  setDietMatches([]);
                  setDietSelectedAnimal(null);
                  setDietFeedback(null);
                }}
                className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow"
              >
                Mainkan Ulang
              </button>
            </div>
          )}
        </div>
      )}
        </>
      )}
    </div>
  );
};
