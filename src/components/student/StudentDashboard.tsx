import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Heart,
  Moon,
  Sun,
  Package,
  ShoppingBag,
  Home,
  Gamepad2,
  BookOpen,
  Award,
  Edit3,
  CheckCircle2,
  RefreshCw,
  Gift,
  HelpCircle,
  Volume2,
  VolumeX,
  Music
} from 'lucide-react';
import { Student, PetSpecies, PetNeed, DailyQuest, ShopItem } from '../../types';
import { storageService, SyncEvent } from '../../services/storage';
import { soundManager } from '../../services/audio';
import { HabitatRoom } from '../pet/HabitatRoom';
import { PetMeters } from '../pet/PetMeters';
import { PetNeedQuickBar } from './PetNeedQuickBar';
import { PetShopView } from './PetShopView';
import { InventoryView } from './InventoryView';
import { HabitatCustomizer } from './HabitatCustomizer';
import { MiniGamesView } from './MiniGamesView';
import { StarDiaryView } from './StarDiaryView';
import { CertificateModal } from './CertificateModal';
import { ThemeSelector } from '../common/ThemeSelector';
import { FlyingStarsEffect } from './FlyingStarsEffect';
import { PetMoodIndicator } from '../pet/PetMoodIndicator';
import { MiniGameRecentPerformance } from '../../utils/petMood';

interface StudentDashboardProps {
  initialStudent: Student;
  onOpenQR: (student: Student) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  initialStudent,
  onOpenQR
}) => {
  const [student, setStudent] = useState<Student>(initialStudent);
  const [speciesList, setSpeciesList] = useState<PetSpecies[]>(storageService.getSpecies());
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>(storageService.getDailyQuests());
  const [petNeeds, setPetNeeds] = useState<PetNeed[]>(storageService.getPetNeeds());

  // Active Main View Tab
  const [activeTab, setActiveTab] = useState<'habitat' | 'shop' | 'inventory' | 'decor' | 'minigames' | 'diary'>('habitat');

  // Modals
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(student.petNickname);

  // Active Pet Need / Desire
  const [activeNeed, setActiveNeed] = useState<PetNeed | null>(null);

  // Recent Mini-Game Performance for Dynamic Mood
  const [recentPerf, setRecentPerf] = useState<MiniGameRecentPerformance | null>(() =>
    storageService.getRecentMiniGamePerformance(initialStudent.id)
  );

  // --- FLYING STARS ANIMATION STATE ---
  const starBalanceBadgeRef = useRef<HTMLDivElement | null>(null);
  const prevStarsRef = useRef<number>(initialStudent.stars);
  const [starAnimTrigger, setStarAnimTrigger] = useState<number>(0);
  const [starAnimDelta, setStarAnimDelta] = useState<number>(0);
  const [starAnimOrigin, setStarAnimOrigin] = useState<{ x: number; y: number } | null>(null);
  const [isStarBadgeBumping, setIsStarBadgeBumping] = useState<boolean>(false);
  const [floatingGainText, setFloatingGainText] = useState<string | null>(null);
  const [isPetVoiceMuted, setIsPetVoiceMuted] = useState<boolean>(() => soundManager.getIsPetVoiceMuted());
  const bumpTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const floatTextTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Quick Action Handler from Pet Mood Indicator
  const handleMoodQuickAction = (actionType: 'pet' | 'feed' | 'drink' | 'clean' | 'sleep' | 'minigame') => {
    switch (actionType) {
      case 'pet':
        handlePetting();
        break;
      case 'sleep':
        handleToggleSleep();
        break;
      case 'minigame':
        setActiveTab('minigames');
        break;
      case 'feed':
      case 'drink':
      case 'clean':
        setActiveTab('inventory');
        break;
    }
  };

  // Toggle Pet Unique Audio Voice
  const handleTogglePetVoice = () => {
    const nextMuted = soundManager.togglePetVoice();
    setIsPetVoiceMuted(nextMuted);
    if (!nextMuted) {
      soundManager.playPetChirp(currentSpecies.id, student.evolutionStage);
    }
  };

  // Trigger Flying Stars Swarm
  const triggerStarAnimation = (delta: number, originPoint?: { x: number; y: number } | null) => {
    if (delta <= 0) return;
    setStarAnimDelta(delta);
    if (originPoint) {
      setStarAnimOrigin(originPoint);
    } else {
      setStarAnimOrigin({
        x: typeof window !== 'undefined' ? window.innerWidth / 2 : 300,
        y: typeof window !== 'undefined' ? window.innerHeight * 0.58 : 400
      });
    }
    setStarAnimTrigger((prev) => prev + 1);
  };

  // Detect star additions
  useEffect(() => {
    if (student.stars > prevStarsRef.current) {
      const delta = student.stars - prevStarsRef.current;
      triggerStarAnimation(delta, starAnimOrigin);
    }
    prevStarsRef.current = student.stars;
  }, [student.stars]);

  // Sync with storage updates & real-time events
  useEffect(() => {
    const unsub = storageService.subscribe((event: SyncEvent) => {
      if (event.type === 'STAR_UPDATE' && event.studentId === student.id && event.delta && event.delta > 0) {
        // Teacher or system awarded stars
        triggerStarAnimation(event.delta, null);
      }
      const refreshed = storageService.getStudentById(student.id);
      if (refreshed) {
        setStudent(refreshed);
      }
      setSpeciesList(storageService.getSpecies());
      setDailyQuests(storageService.getDailyQuests());
      setPetNeeds(storageService.getPetNeeds());
      setRecentPerf(storageService.getRecentMiniGamePerformance(student.id));
    });
    return () => unsub();
  }, [student.id]);

  // Impact on star balance badge
  const handleStarHit = () => {
    setIsStarBadgeBumping(false);
    requestAnimationFrame(() => {
      setIsStarBadgeBumping(true);
    });

    if (bumpTimeoutRef.current) clearTimeout(bumpTimeoutRef.current);
    bumpTimeoutRef.current = setTimeout(() => {
      setIsStarBadgeBumping(false);
    }, 500);
  };

  // Completion celebration
  const handleAnimationComplete = () => {
    if (starAnimDelta > 0) {
      setFloatingGainText(`+${starAnimDelta} ⭐`);
      if (floatTextTimeoutRef.current) clearTimeout(floatTextTimeoutRef.current);
      floatTextTimeoutRef.current = setTimeout(() => {
        setFloatingGainText(null);
      }, 1500);
    }
  };

  // Init pet need
  useEffect(() => {
    const allNeeds = storageService.getPetNeeds();
    if (allNeeds.length > 0) {
      if (student.currentNeedId) {
        const found = allNeeds.find((n) => n.id === student.currentNeedId);
        setActiveNeed(found || allNeeds[0]);
      } else {
        const picked = allNeeds[Math.floor(Math.random() * allNeeds.length)];
        setActiveNeed(picked);
      }
    }
  }, [student.currentNeedId]);

  const currentSpecies = speciesList.find((s) => s.id === student.petSpeciesId) || speciesList[0];
  const currentStage = currentSpecies.stages[student.evolutionStage] || currentSpecies.stages[0];

  // Refresh student state from storage
  const reloadStudent = () => {
    const refreshed = storageService.getStudentById(student.id);
    if (refreshed) setStudent(refreshed);
    setDailyQuests(storageService.getDailyQuests());
    setRecentPerf(storageService.getRecentMiniGamePerformance(student.id));
  };

  // Tap Pet -> cycle / re-display pet's random desire from teacher's list
  const handleTapPet = () => {
    const allNeeds = storageService.getPetNeeds();
    if (allNeeds.length > 0) {
      const randomNeed = allNeeds[Math.floor(Math.random() * allNeeds.length)];
      setActiveNeed(randomNeed);
      const updated = { ...student, currentNeedId: randomNeed.id, lastInteractionTime: new Date().toISOString() };
      storageService.saveStudent(updated);
    }
    // Also give slight happiness & pet quest progress
    handlePetting();
  };

  // Petting Action
  const handlePetting = () => {
    soundManager.playPetChirp(currentSpecies.id, student.evolutionStage);
    const updated = { ...student, lastInteractionTime: new Date().toISOString() };
    updated.needs.happiness = Math.min(100, updated.needs.happiness + 5);
    storageService.saveStudent(updated);
    storageService.addStudentXp(student.id, 10);
    storageService.incrementQuestProgress('pet', 1);
    reloadStudent();
  };

  // Sleep Toggle Action
  const handleToggleSleep = () => {
    const updated = { ...student, isSleeping: !student.isSleeping, lastInteractionTime: new Date().toISOString() };
    if (!student.isSleeping) {
      // Put to sleep: rest
      soundManager.playPurr();
      updated.needs.energy = Math.min(100, updated.needs.energy + 35);
    } else {
      // Wake up with pet's cheerful chirp
      soundManager.playPetChirp(currentSpecies.id, student.evolutionStage);
    }
    storageService.saveStudent(updated);
    reloadStudent();
  };

  // Handle Give Item (used by in-room items dock, pet need quick bar, etc.)
  const handleGiveItem = (item: ShopItem) => {
    const currentQty = student.inventory[item.id] || 0;
    if (currentQty <= 0) return;

    const updated = { ...student, lastInteractionTime: new Date().toISOString() };

    // Apply stat boosts to needs meters
    const newNeeds = { ...updated.needs };
    if (item.boosts.hunger) newNeeds.hunger = Math.min(100, newNeeds.hunger + item.boosts.hunger);
    if (item.boosts.thirst) newNeeds.thirst = Math.min(100, newNeeds.thirst + item.boosts.thirst);
    if (item.boosts.hygiene) newNeeds.hygiene = Math.min(100, newNeeds.hygiene + item.boosts.hygiene);
    if (item.boosts.happiness) newNeeds.happiness = Math.min(100, newNeeds.happiness + item.boosts.happiness);
    if (item.boosts.energy) newNeeds.energy = Math.min(100, newNeeds.energy + item.boosts.energy);
    updated.needs = newNeeds;

    // Deduct consumable quantity
    updated.inventory[item.id] = currentQty - 1;

    // Play appropriate sound & increment daily quests
    if (item.category === 'makanan' || item.category === 'minuman') {
      soundManager.playMunch();
      setTimeout(() => soundManager.playPetChirp(currentSpecies.id, student.evolutionStage), 320);
      storageService.incrementQuestProgress('feed', 1);
    } else if (item.category === 'sabun') {
      soundManager.playBubble();
      setTimeout(() => soundManager.playPetChirp(currentSpecies.id, student.evolutionStage), 320);
      storageService.incrementQuestProgress('clean', 1);
    } else if (item.category === 'mainan') {
      soundManager.playPetChirp(currentSpecies.id, student.evolutionStage);
      storageService.incrementQuestProgress('play', 1);
    }

    // Base XP
    let xpGain = 15;

    // Check if this item satisfies pet's current desire / need!
    if (activeNeed && (activeNeed.targetItemId === item.id || activeNeed.category === item.category)) {
      xpGain += activeNeed.rewardXp;
      soundManager.playStarChime();
      try {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }

      // Pick next random need from teacher's database
      const allNeeds = storageService.getPetNeeds();
      if (allNeeds.length > 0) {
        const nextNeed = allNeeds[Math.floor(Math.random() * allNeeds.length)];
        updated.currentNeedId = nextNeed.id;
        setActiveNeed(nextNeed);
      }
    }

    storageService.saveStudent(updated);
    storageService.addStudentXp(student.id, xpGain);
    reloadStudent();
  };

  // Rename Pet
  const handleRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nicknameInput.trim()) return;

    const updated = { ...student, petNickname: nicknameInput.trim() };
    storageService.saveStudent(updated);
    setShowRenameModal(false);
    soundManager.playStarChime();
    reloadStudent();
  };

  // Claim Daily Quest Reward
  const handleClaimQuest = (questId: string) => {
    const success = storageService.claimQuestReward(questId, student.id);
    if (success) {
      soundManager.playStarChime();
      try {
        confetti({ particleCount: 70, spread: 60 });
      } catch {
        // ignore
      }
      reloadStudent();
    }
  };

  // Progress to next evolution calculation
  // Stage 0: Lvl 1-2, Stage 1: Lvl 3-5, Stage 2: Lvl 6-9, Stage 3: Lvl 10 (MVP)
  const isMaster = student.level >= 10;
  const nextTargetLevel = isMaster ? 10 : student.evolutionStage === 0 ? 3 : student.evolutionStage === 1 ? 6 : 10;
  const nextStageName = isMaster
    ? 'MVP Pet Master'
    : student.evolutionStage === 0
    ? currentSpecies.stages[1]?.name || 'Anak-anak'
    : student.evolutionStage === 1
    ? currentSpecies.stages[2]?.name || 'Remaja'
    : currentSpecies.stages[3]?.name || 'Dewasa Juara';

  const allShopItems = storageService.getShopItems();
  const ownedConsumableItems = Object.entries(student.inventory)
    .filter(([_, qty]) => qty > 0)
    .map(([itemId, qty]) => {
      const item = allShopItems.find((i) => i.id === itemId);
      return item && item.category !== 'aksesoris' && item.category !== 'dekorasi' ? { item, qty } : null;
    })
    .filter((entry): entry is { item: ShopItem; qty: number } => entry !== null);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 pb-24">
      {/* Top Floating Player Profile Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-amber-300 shadow-xl mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Student & Pet Identity */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center text-2xl shadow-md border-2 border-white shrink-0">
              🐾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black font-heading text-slate-800 text-base sm:text-lg">
                  {student.name}
                </h2>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                  {student.className}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap mt-1">
                <div className="text-xs text-amber-700 font-bold flex items-center gap-1.5">
                  <span>Hewan: {student.petNickname} ({currentSpecies.name})</span>
                  <button
                    onClick={() => {
                      setNicknameInput(student.petNickname);
                      setShowRenameModal(true);
                    }}
                    className="p-1 text-slate-400 hover:text-amber-700 rounded"
                    title="Ubah Nama Panggilan Pet"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                </div>

                {/* Visual Pet Mood Indicator */}
                <PetMoodIndicator
                  student={student}
                  species={currentSpecies}
                  recentPerf={recentPerf}
                  onQuickAction={handleMoodQuickAction}
                />
              </div>
            </div>
          </div>

          {/* Stars, Level & Theme Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Theme Selector */}
            <ThemeSelector />

            {/* Pet Audio Voice Toggle */}
            <button
              onClick={handleTogglePetVoice}
              className={`px-2.5 py-1.5 rounded-2xl border text-xs font-black shadow-sm flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                isPetVoiceMuted
                  ? 'bg-slate-100 text-slate-500 border-slate-300 hover:bg-slate-200'
                  : 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-950 border-amber-300 hover:from-amber-200 hover:to-yellow-200'
              }`}
              title={isPetVoiceMuted ? 'Nyalakan Suara Unik Pet' : 'Matikan Suara Lucu Pet'}
            >
              {isPetVoiceMuted ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline text-[11px]">Suara: Senyap</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                  <span className="hidden sm:inline text-[11px]">Suara: Nyala</span>
                </>
              )}
            </button>

            {/* Stars Count Badge */}
            <div
              ref={starBalanceBadgeRef}
              className={`relative bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-amber-950 font-black text-sm px-3.5 py-1.5 rounded-2xl shadow-md flex items-center gap-1.5 border border-amber-300 transition-all duration-200 select-none ${
                isStarBadgeBumping
                  ? 'scale-110 shadow-amber-400/80 shadow-lg ring-4 ring-yellow-300/60 animate-star-bump'
                  : 'hover:scale-105'
              }`}
              title="Total Saldo Bintang Kamu"
            >
              <span className="text-base select-none">⭐</span>
              <span>{student.stars} Bintang</span>

              {/* Floating upward +N text indicator when stars arrive */}
              {floatingGainText && (
                <div className="absolute -top-7 -right-2 pointer-events-none text-amber-950 font-black text-xs bg-yellow-300 border-2 border-white px-2 py-0.5 rounded-full shadow-xl animate-star-float-up flex items-center gap-1 z-30 whitespace-nowrap">
                  <span>{floatingGainText}</span>
                </div>
              )}
            </div>

            {/* Quick Interactive Animation Preview Button */}
            <button
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setStarAnimOrigin({
                  x: rect.left + rect.width / 2,
                  y: rect.top + rect.height / 2
                });
                storageService.awardStars(student.id, 'Uji Coba Animasi Bintang', 1, 'Animasi Bintang Melayang');
                reloadStudent();
              }}
              className="px-2.5 py-1.5 bg-gradient-to-r from-amber-50 to-yellow-100 hover:from-amber-100 hover:to-yellow-200 text-amber-900 font-black text-xs rounded-2xl border border-amber-300 shadow-sm flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              title="Klik untuk mencoba animasi bintang melayang ke saldo"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin-slow" />
              <span className="hidden sm:inline">Coba Efek</span>
              <span>+1 ⭐</span>
            </button>

            {/* Level Badge */}
            <div className="bg-indigo-600 text-white font-extrabold text-xs px-3 py-1.5 rounded-2xl shadow-md flex items-center gap-1">
              <span>Level {student.level}</span>
            </div>

            {/* MVP Certificate Button if Level 10 */}
            {isMaster && (
              <button
                onClick={() => setShowCertificateModal(true)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-950 font-black text-xs rounded-2xl shadow-lg border-2 border-white flex items-center gap-1 animate-pulse-glow"
              >
                <span>👑 Sertifikat MVP</span>
              </button>
            )}
          </div>
        </div>

        {/* Evolution Progress Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs font-bold mb-1">
            <span className="text-slate-700 flex items-center gap-1">
              <span>{currentStage.name}</span>
              <span className="text-slate-400">➔</span>
              <span className="text-amber-700">{nextStageName}</span>
            </span>
            <span className="text-indigo-600 font-extrabold">
              {isMaster ? 'Maksimal (MVP Juara)' : `Menuju Level ${nextTargetLevel} (${student.xp} XP)`}
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-full transition-all duration-700"
              style={{ width: `${isMaster ? 100 : Math.min(100, (student.level / 10) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs for Mobile & Desktop */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {[
          { id: 'habitat', label: 'Ruangan Pet', icon: Home },
          { id: 'shop', label: 'Pet Shop (Toko)', icon: ShoppingBag },
          { id: 'inventory', label: 'Tas Barang', icon: Package, badge: Object.values(student.inventory).reduce((a, b) => a + b, 0) },
          { id: 'decor', label: 'Dekorasi Ruangan', icon: Sparkles },
          { id: 'minigames', label: 'Mini-Game Edukasi', icon: Gamepad2 },
          { id: 'diary', label: 'Buku Harian Bintang', icon: BookOpen }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSel = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition flex items-center gap-2 shadow-xs ${
                isSel
                  ? 'bg-amber-500 text-white shadow-amber-500/30'
                  : 'bg-white hover:bg-amber-50 text-slate-700 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSel ? 'bg-white/30 text-white' : 'bg-amber-100 text-amber-900'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* --- TAB 1: HABITAT UTAMA RUANGAN PET --- */}
      {activeTab === 'habitat' && (
        <div className="space-y-4">
          {/* Main Habitat Room & Interactive Pet (Bebas dari frame item untuk estetika maksimal) */}
          <div className="relative">
            <HabitatRoom
              species={currentSpecies}
              stageIndex={student.evolutionStage}
              isSleeping={student.isSleeping}
              equippedAccessories={student.equippedAccessories}
              backgroundId={student.equippedHabitat.background}
              furnitureId={student.equippedHabitat.furniture}
              ornamentId={student.equippedHabitat.ornament}
              activeNeed={activeNeed}
              student={student}
              recentPerf={recentPerf}
              onTapPet={handleTapPet}
              onPetting={handlePetting}
              onToggleSleep={handleToggleSleep}
              onMoodAction={handleMoodQuickAction}
            />
          </div>

          {/* ITEM KEBUTUHAN PET & ITEM YANG DIMILIKI PLAYER (DILETAKKAN DI ATAS BAR PERTUMBUHAN) */}
          <PetNeedQuickBar
            student={student}
            species={currentSpecies}
            activeNeed={activeNeed}
            onItemUsed={reloadStudent}
            onOpenShop={() => setActiveTab('shop')}
            onOpenInventory={() => setActiveTab('inventory')}
            onTapPet={handleTapPet}
            onToggleSleep={handleToggleSleep}
            onPetting={handlePetting}
          />

          {/* BAR PERTUMBUHAN & INDIKATOR KEBUTUHAN STATUS PET (DI BAWAH RAK ITEM) */}
          <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-amber-300 shadow-md space-y-4">
            {/* Header Bar Pertumbuhan & Evolusi */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-lg shrink-0">
                    🌱
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-sm sm:text-base flex items-center gap-2">
                      <span>Bar Pertumbuhan & Evolusi Pet</span>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                        {currentStage.name} ➔ {nextStageName}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Beri item kebutuhan pet di atas atau selesaikan mini-game untuk menaikkan bar pertumbuhan!
                    </p>
                  </div>
                </div>

                <div className="text-right sm:self-center">
                  <span className="text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-xl inline-block shadow-2xs">
                    {isMaster ? '👑 MVP Juara (Maksimal)' : `Level ${student.level} (${student.xp} XP / Menuju Lv ${nextTargetLevel})`}
                  </span>
                </div>
              </div>

              {/* Progress Bar Pertumbuhan */}
              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-full transition-all duration-700 shadow-sm relative overflow-hidden"
                  style={{ width: `${isMaster ? 100 : Math.min(100, (student.level / 10) * 100)}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
            </div>

            {/* 5 Meter Indikator Kebutuhan & Vitalitas Pet */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                <span className="flex items-center gap-1.5">
                  <span>📊</span>
                  <span>Indikator Status Kebutuhan Pet:</span>
                </span>
                <span className="text-[11px] text-slate-400 font-normal">
                  Kenyang, Kesegaran, Kebersihan, Senang, Energi
                </span>
              </div>
              <PetMeters needs={student.needs} />
            </div>
          </div>

          {/* Quick Navigation Shortcuts Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={() => setActiveTab('minigames')}
              className="p-3 bg-white hover:bg-indigo-50 rounded-2xl border-2 border-slate-200 hover:border-indigo-300 transition text-center shadow-xs"
            >
              <div className="text-2xl mb-1">🎮</div>
              <div className="text-xs font-bold text-slate-800">Mini-Game Edukasi</div>
              <div className="text-[10px] text-slate-400">Asah Otak & +XP</div>
            </button>

            <button
              onClick={() => setActiveTab('shop')}
              className="p-3 bg-white hover:bg-amber-50 rounded-2xl border-2 border-slate-200 hover:border-amber-300 transition text-center shadow-xs"
            >
              <div className="text-2xl mb-1">🛍️</div>
              <div className="text-xs font-bold text-slate-800">Pet Shop (Toko)</div>
              <div className="text-[10px] text-slate-400">Belanja Bintang</div>
            </button>

            <button
              onClick={() => setActiveTab('decor')}
              className="p-3 bg-white hover:bg-emerald-50 rounded-2xl border-2 border-slate-200 hover:border-emerald-300 transition text-center shadow-xs"
            >
              <div className="text-2xl mb-1">🛋️</div>
              <div className="text-xs font-bold text-slate-800">Dekorasi Habitat</div>
              <div className="text-[10px] text-slate-400">Kamar & Ornamen</div>
            </button>

            <button
              onClick={() => setActiveTab('diary')}
              className="p-3 bg-white hover:bg-rose-50 rounded-2xl border-2 border-slate-200 hover:border-rose-300 transition text-center shadow-xs"
            >
              <div className="text-2xl mb-1">⭐</div>
              <div className="text-xs font-bold text-slate-800">Buku Bintang</div>
              <div className="text-[10px] text-slate-400">Catatan Prestasi</div>
            </button>
          </div>

          {/* Daily Quests Card */}
          <div className="bg-white rounded-3xl p-5 border-2 border-amber-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold font-heading text-slate-800 text-sm flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-600" />
                <span>Misi Harian Siswa (Daily Quests)</span>
              </h3>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                Dapatkan Ekstra XP & Bintang!
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {dailyQuests.map((quest) => {
                const isDone = quest.completed;
                const isClaimed = quest.claimed;

                return (
                  <div
                    key={quest.id}
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                      isClaimed
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : isDone
                        ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-300'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-xs text-slate-800">{quest.title}</h4>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                        {quest.description}
                      </p>
                      <div className="text-[10px] font-bold text-amber-700 mt-1">
                        Hadiah: +{quest.xpReward} XP, +{quest.starReward} ⭐
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isClaimed ? (
                        <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded-lg">
                          Telah Diklaim
                        </span>
                      ) : isDone ? (
                        <button
                          onClick={() => handleClaimQuest(quest.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-xl shadow transition animate-bounce-gentle"
                        >
                          Klaim Hadiah!
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded-lg">
                          {quest.current}/{quest.target}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: PET SHOP --- */}
      {activeTab === 'shop' && (
        <PetShopView student={student} onItemPurchased={reloadStudent} />
      )}

      {/* --- TAB 3: INVENTORY --- */}
      {activeTab === 'inventory' && (
        <InventoryView
          student={student}
          onItemUsed={reloadStudent}
          onOpenShop={() => setActiveTab('shop')}
          activeNeed={activeNeed}
        />
      )}

      {/* --- TAB 4: HABITAT CUSTOMIZER --- */}
      {activeTab === 'decor' && (
        <HabitatCustomizer
          student={student}
          species={currentSpecies}
          onUpdate={reloadStudent}
        />
      )}

      {/* --- TAB 5: MINI-GAMES EDUKASI --- */}
      {activeTab === 'minigames' && (
        <MiniGamesView student={student} onRewardClaimed={reloadStudent} />
      )}

      {/* --- TAB 6: BUKU HARIAN BINTANG --- */}
      {activeTab === 'diary' && <StarDiaryView student={student} />}

      {/* RENAME MODAL */}
      {showRenameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border-4 border-amber-300 relative text-center">
            <h3 className="text-base font-bold font-heading text-slate-800 mb-2">
              Ubah Nama Panggilan Pet
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Beri nama panggilan kesayangan untuk hewan peliharaanmu:
            </p>
            <form onSubmit={handleRename} className="space-y-3">
              <input
                type="text"
                required
                maxLength={20}
                value={nicknameInput}
                onChange={(e) => setNicknameInput(e.target.value)}
                placeholder="Contoh: Milo Si Juara"
                className="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 border border-slate-300 outline-none focus:border-amber-500 text-center font-bold"
              />
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRenameModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow"
                >
                  Simpan Nama
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MVP CERTIFICATE MODAL */}
      <CertificateModal
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        student={student}
        species={currentSpecies}
      />

      {/* FLYING STARS ANIMATION EFFECT OVERLAY */}
      <FlyingStarsEffect
        targetRef={starBalanceBadgeRef}
        triggerCount={starAnimTrigger}
        starsAdded={starAnimDelta}
        origin={starAnimOrigin}
        onStarHit={handleStarHit}
        onComplete={handleAnimationComplete}
      />
    </div>
  );
};
