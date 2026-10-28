import { Student } from '../types';

export interface MiniGameRecentPerformance {
  gameId: 'trivia' | 'math' | 'memory' | 'diet';
  gameName: string;
  score: number;
  maxScore?: number;
  isVictory: boolean;
  timestamp: string; // ISO String
}

export type PetMoodType =
  | 'excited'
  | 'happy'
  | 'hungry'
  | 'thirsty'
  | 'sleepy'
  | 'dirty'
  | 'bored'
  | 'curious';

export interface PetMoodDetails {
  type: PetMoodType;
  label: string;
  emoji: string;
  badgeBg: string;
  badgeBorder: string;
  textColor: string;
  accentGradient: string;
  description: string;
  reason: string;
  suggestedActionText: string;
  suggestedActionType: 'pet' | 'feed' | 'drink' | 'clean' | 'sleep' | 'minigame';
  interactionTimeAgoText: string;
  miniGameContextText: string;
}

/**
 * Format human-friendly Indonesian time difference
 */
export function formatTimeAgo(isoString?: string | null): string {
  if (!isoString) return 'Belum lama ini';
  const diffMs = Date.now() - new Date(isoString).getTime();
  if (isNaN(diffMs) || diffMs < 0) return 'Baru saja';

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Baru saja';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} menit yang lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam yang lalu`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay} hari yang lalu`;
}

/**
 * Calculate dynamic pet mood based on last interaction time, mini-game performance, and meters
 */
export function calculatePetMood(
  student: Student,
  recentPerf?: MiniGameRecentPerformance | null
): PetMoodDetails {
  const needs = student.needs || { hunger: 50, thirst: 50, hygiene: 50, happiness: 50, energy: 50 };
  const lastTime = student.lastInteractionTime;
  const timeAgoText = formatTimeAgo(lastTime);

  // Check how long since last interaction (in minutes)
  const diffMinutes = lastTime ? (Date.now() - new Date(lastTime).getTime()) / (1000 * 60) : 0;

  // Check recent mini-game performance (within the last 20 minutes)
  const isRecentGame = recentPerf
    ? (Date.now() - new Date(recentPerf.timestamp).getTime()) < 20 * 60 * 1000
    : false;

  let miniGameText = 'Belum bermain mini-game baru-baru ini.';
  if (recentPerf) {
    const gameTimeAgo = formatTimeAgo(recentPerf.timestamp);
    if (recentPerf.isVictory) {
      miniGameText = `🏆 Berhasil di ${recentPerf.gameName} (${recentPerf.score} poin, ${gameTimeAgo})!`;
    } else {
      miniGameText = `🎯 Mencoba ${recentPerf.gameName} (${recentPerf.score} poin, ${gameTimeAgo}).`;
    }
  }

  // 1. SLEEPY / ASLEEP
  if (student.isSleeping) {
    return {
      type: 'sleepy',
      label: 'Sedang Tidur Pulas',
      emoji: '💤',
      badgeBg: 'bg-indigo-50',
      badgeBorder: 'border-indigo-300',
      textColor: 'text-indigo-900',
      accentGradient: 'from-indigo-500 to-purple-600',
      description: 'Pet sedang tidur tenang memulihkan seluruh tenaga dan stamina tubuhnya.',
      reason: 'Pet beristirahat di kasur empuk kamar virtualnya.',
      suggestedActionText: 'Bangunkan Pet jika ingin mulai belajar lagi.',
      suggestedActionType: 'sleep',
      interactionTimeAgoText: timeAgoText,
      miniGameContextText: miniGameText
    };
  }

  if (needs.energy <= 20) {
    return {
      type: 'sleepy',
      label: 'Sangat Mengantuk',
      emoji: '🥱',
      badgeBg: 'bg-amber-50',
      badgeBorder: 'border-amber-300',
      textColor: 'text-amber-900',
      accentGradient: 'from-amber-400 to-orange-500',
      description: 'Mata pet sudah sayu dan langkahnya gontai karena energi tersisa sangat minim.',
      reason: 'Tingkat energi sangat rendah (di bawah 20%). Butuh istirahat.',
      suggestedActionText: 'Istirahatkan Pet dengan tombol Tidur.',
      suggestedActionType: 'sleep',
      interactionTimeAgoText: timeAgoText,
      miniGameContextText: miniGameText
    };
  }

  // 2. HUNGRY
  if (needs.hunger <= 30) {
    return {
      type: 'hungry',
      label: 'Perut Lapar',
      emoji: '🍖',
      badgeBg: 'bg-orange-50',
      badgeBorder: 'border-orange-300',
      textColor: 'text-orange-900',
      accentGradient: 'from-orange-400 to-amber-500',
      description: 'Perut pet berbunyi keroncongan dan menatap mangkuk makannya yang kosong.',
      reason: 'Kenyang turun drastis (di bawah 30%).',
      suggestedActionText: 'Beri makanan lezat dari Pet Shop atau Tas Barang.',
      suggestedActionType: 'feed',
      interactionTimeAgoText: timeAgoText,
      miniGameContextText: miniGameText
    };
  }

  // 3. THIRSTY
  if (needs.thirst <= 30) {
    return {
      type: 'thirsty',
      label: 'Haus & Kering',
      emoji: '💧',
      badgeBg: 'bg-sky-50',
      badgeBorder: 'border-sky-300',
      textColor: 'text-sky-900',
      accentGradient: 'from-sky-400 to-blue-500',
      description: 'Tenggorokan pet terasa kering dan butuh seteguk air mineral atau susu segar.',
      reason: 'Kesegaran di bawah 30%.',
      suggestedActionText: 'Beri minuman segar dari Tas Barang.',
      suggestedActionType: 'drink',
      interactionTimeAgoText: timeAgoText,
      miniGameContextText: miniGameText
    };
  }

  // 4. DIRTY
  if (needs.hygiene <= 25) {
    return {
      type: 'dirty',
      label: 'Gerah & Berdebu',
      emoji: '🧼',
      badgeBg: 'bg-teal-50',
      badgeBorder: 'border-teal-300',
      textColor: 'text-teal-900',
      accentGradient: 'from-teal-400 to-emerald-500',
      description: 'Bulu pet kotor terkena debu petualangan dan butuh dimandikan dengan busa wangi.',
      reason: 'Kebersihan turun di bawah 25%.',
      suggestedActionText: 'Gunakan Sabun Wangi untuk memandikan pet.',
      suggestedActionType: 'clean',
      interactionTimeAgoText: timeAgoText,
      miniGameContextText: miniGameText
    };
  }

  // 5. EXCITED / PROUD (From recent mini-game triumph)
  if (isRecentGame && recentPerf?.isVictory) {
    return {
      type: 'excited',
      label: 'Bangga & Bersemangat!',
      emoji: '🤩',
      badgeBg: 'bg-purple-50',
      badgeBorder: 'border-purple-300',
      textColor: 'text-purple-900',
      accentGradient: 'from-purple-500 via-pink-500 to-amber-400',
      description: `Pet melompat-lompat riang karena baru saja menyelesaikan ${recentPerf.gameName} dengan cemerlang!`,
      reason: `Prestasi terbaru: Menang di ${recentPerf.gameName} (+${recentPerf.score} poin)!`,
      suggestedActionText: 'Lanjutkan rekor juaramu di tantangan mini-game lainnya!',
      suggestedActionType: 'minigame',
      interactionTimeAgoText: timeAgoText,
      miniGameContextText: miniGameText
    };
  }

  // 6. BORED / LONELY (No interaction for a while or low happiness)
  if (diffMinutes > 15 || needs.happiness <= 35) {
    return {
      type: 'bored',
      label: 'Bosan & Rindu',
      emoji: '🥺',
      badgeBg: 'bg-rose-50',
      badgeBorder: 'border-rose-300',
      textColor: 'text-rose-900',
      accentGradient: 'from-rose-400 to-pink-500',
      description: 'Pet duduk melamun di sudut ruangan karena sudah lama tidak diajak berinteraksi.',
      reason: lastTime ? `Terakhir disapa ${timeAgoText}. Tingkat kegembiraan sedang turun.` : 'Belum sempat diajak bermain hari ini.',
      suggestedActionText: 'Elus sayang pet atau ajak bermain bola benang!',
      suggestedActionType: 'pet',
      interactionTimeAgoText: timeAgoText,
      miniGameContextText: miniGameText
    };
  }

  // 7. CURIOUS (High energy, ready for educational mini-game)
  if (needs.energy >= 60 && (!recentPerf || (Date.now() - new Date(recentPerf.timestamp).getTime()) > 30 * 60 * 1000)) {
    return {
      type: 'curious',
      label: 'Penasaran & Siap Belajar',
      emoji: '🧐',
      badgeBg: 'bg-amber-50',
      badgeBorder: 'border-amber-300',
      textColor: 'text-amber-900',
      accentGradient: 'from-yellow-400 to-amber-500',
      description: 'Mata pet berbinar tajam dan penasaran ingin mengasah kecerdasan otak.',
      reason: 'Energi berlimpah dan siap menyelesaikan tantangan kuis/matematika.',
      suggestedActionText: 'Buka tab Mini-Game Edukasi dan selesaikan tantangan!',
      suggestedActionType: 'minigame',
      interactionTimeAgoText: timeAgoText,
      miniGameContextText: miniGameText
    };
  }

  // 8. HAPPY / CONTENT (Default healthy state)
  return {
    type: 'happy',
    label: 'Gembira & Ceria',
    emoji: '🥰',
    badgeBg: 'bg-emerald-50',
    badgeBorder: 'border-emerald-300',
    textColor: 'text-emerald-900',
    accentGradient: 'from-emerald-400 via-teal-400 to-amber-400',
    description: 'Pet merasa sangat disayang, kenyang, dan riang menemani hari belajarmu!',
    reason: `Baru saja berinteraksi (${timeAgoText}) dan semua meter kebutuhan seimbang.`,
    suggestedActionText: 'Pertahankan suasana hati ceria pet kesayanganmu!',
    suggestedActionType: 'pet',
    interactionTimeAgoText: timeAgoText,
    miniGameContextText: miniGameText
  };
}
