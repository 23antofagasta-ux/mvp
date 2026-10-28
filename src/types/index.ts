export type Role = 'teacher' | 'student' | null;

export type AppTheme = 'bright' | 'dark' | 'clay' | 'cartoon';

export interface ThemeConfig {
  id: AppTheme;
  name: string;
  label: string;
  icon: string;
  badge: string;
  description: string;
  accentColor: string;
}

export type PetEvolutionStageIndex = 0 | 1 | 2 | 3;

export interface PetStageConfig {
  name: string; // e.g. "Telur Ajaib", "Kucing Bayi", "Kucing Anak", "Kucing Dewasa Juara"
  minLevel: number; // e.g. 1, 3, 6, 10
  minStars: number;
  imageUrl?: string; // custom upload saat bangun (JPEG, PNG, GIF)
  sleepingImageUrl?: string; // custom upload saat tidur (JPEG, PNG, GIF)
  vectorType: string; // built-in vector archetype
  description: string;
}

export interface PetSpecies {
  id: string;
  name: string;
  description: string;
  category: 'mamalia' | 'unggas' | 'reptil' | 'akuatik' | 'fantasi';
  stages: [PetStageConfig, PetStageConfig, PetStageConfig, PetStageConfig];
  soundType?: string;
  sleepingImageUrl?: string; // default sleeping image if stage doesn't specify one
}

export interface PetNeedsState {
  hunger: number; // 0 - 100 (Kenyang 🍖)
  thirst: number; // 0 - 100 (Kesegaran 💧)
  hygiene: number; // 0 - 100 (Kebersihan 🧼)
  happiness: number; // 0 - 100 (Kegembiraan 🎾)
  energy: number; // 0 - 100 (Energi ⚡)
}

export interface Student {
  id: string;
  name: string;
  nisn: string;
  className: string;
  petSpeciesId: string;
  petNickname: string;
  stars: number;
  level: number;
  xp: number;
  evolutionStage: PetEvolutionStageIndex;
  needs: PetNeedsState;
  inventory: Record<string, number>; // itemId -> quantity
  equippedAccessories: string[]; // itemIds of equipped accessories
  equippedHabitat: {
    background: string;
    furniture: string;
    ornament: string;
  };
  unlockedHabitats: string[]; // IDs of unlocked habitat items
  isSleeping: boolean;
  currentNeedId?: string;
  needCooldownUntil?: string; // ISO timestamp jeda waktu keinginan pet berikutnya
  lastNeedFulfilledTime?: string;
  lastInteractionTime?: string;
}

export interface Teacher {
  id: string;
  name: string;
  pin: string;
  email?: string;
  createdAt: string;
}

export type ShopCategory = 'makanan' | 'minuman' | 'sabun' | 'mainan' | 'aksesoris' | 'dekorasi';

export interface ShopItem {
  id: string;
  name: string;
  category: ShopCategory;
  price: number; // In stars
  boosts: {
    hunger?: number;
    thirst?: number;
    hygiene?: number;
    happiness?: number;
    energy?: number;
  };
  icon: string;
  imageUrl?: string;
  description: string;
  unlockLevel: number;
  inStock: boolean;
  decorType?: 'background' | 'furniture' | 'ornament';
}

export interface PetNeed {
  id: string;
  text: string;
  icon: string;
  category: 'makanan' | 'minuman' | 'sabun' | 'mainan' | 'aksesoris' | 'elus' | 'tidur';
  targetItemId?: string; // Optional specific item that satisfies it
  rewardXp: number;
  rewardProgress: number; // % progress towards next growth
}

export interface StarRewardCategory {
  id: string;
  name: string;
  stars: number;
  icon: string;
  description: string;
}

export interface StarDeductionCategory {
  id: string;
  name: string;
  stars: number; // negative number or positive for subtraction
  icon: string;
  description: string;
}

export interface StarAuditLog {
  id: string;
  studentId: string;
  studentName: string;
  nisn: string;
  type: 'award' | 'deduct';
  categoryName: string;
  stars: number;
  note?: string;
  timestamp: string;
  reverted?: boolean;
}

export interface HabitatOption {
  id: string;
  name: string;
  type: 'background' | 'furniture' | 'ornament';
  previewColor: string;
  icon: string;
  price: number;
  description: string;
  unlockLevel: number;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  category: 'feed' | 'clean' | 'play' | 'minigame' | 'pet';
  target: number;
  current: number;
  xpReward: number;
  starReward: number;
  completed: boolean;
  claimed: boolean;
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  type: 'star_add' | 'star_deduct' | 'level_up' | 'evolution' | 'need_fulfilled' | 'info';
  stars?: number;
  timestamp: string;
}

export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface AnimalDietPair {
  animal: string;
  icon: string;
  food: string;
  foodIcon: string;
  sound: string;
}

export interface MemoryPair {
  id: string;
  name: string;
  emoji: string;
  bg: string;
}

export interface MiniGameConfig {
  isAllLocked: boolean;
  lockMessage: string;
  lockedGames: {
    trivia: boolean;
    math: boolean;
    memory: boolean;
    diet: boolean;
  };
  mathConfig: {
    maxTable: number;
    timerDuration: number;
  };
  customTriviaQuestions: TriviaQuestion[];
  customDietPairs: AnimalDietPair[];
  customMemoryPairs: MemoryPair[];
  lastUpdated?: string;
  updatedBy?: string;
}

export interface CompleteBackupData {
  version: 'mvp-backup-v1';
  timestamp: string;
  app: 'My Virtual Pet - Game Edukasi';
  exportedBy?: string;
  stats: {
    totalStudents: number;
    totalTeachers: number;
    totalSpecies: number;
    totalShopItems: number;
    totalRewards: number;
    totalDeductions: number;
    totalPetNeeds: number;
    totalQuests: number;
    totalLogs: number;
    totalTriviaQuestions?: number;
  };
  data: {
    teachers: Teacher[];
    students: Student[];
    species: PetSpecies[];
    shopItems: ShopItem[];
    rewards: StarRewardCategory[];
    deductions: StarDeductionCategory[];
    petNeeds: PetNeed[];
    dailyQuests: DailyQuest[];
    auditLogs: StarAuditLog[];
    miniGameConfig?: MiniGameConfig;
  };
}

