import {
  Student,
  Teacher,
  PetSpecies,
  ShopItem,
  StarRewardCategory,
  StarDeductionCategory,
  StarAuditLog,
  PetNeed,
  DailyQuest,
  PushNotification,
  CompleteBackupData,
  AppTheme,
  MiniGameConfig,
  TriviaQuestion,
  AnimalDietPair,
  MemoryPair
} from '../types';
import {
  INITIAL_TEACHERS,
  INITIAL_STUDENTS,
  INITIAL_PET_SPECIES,
  INITIAL_SHOP_ITEMS,
  INITIAL_REWARD_CATEGORIES,
  INITIAL_DEDUCTION_CATEGORIES,
  INITIAL_PET_NEEDS,
  INITIAL_DAILY_QUESTS,
  ANIMAL_TRIVIA_QUESTIONS,
  ANIMAL_DIET_PAIRS,
  MEMORY_CARD_PAIRS
} from '../data/initialData';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { doc, setDoc, deleteDoc, collection, onSnapshot } from 'firebase/firestore';
import { MiniGameRecentPerformance } from '../utils/petMood';

const STORAGE_KEYS = {
  TEACHERS: 'mvp_teachers_v1',
  STUDENTS: 'mvp_students_v1',
  SPECIES: 'mvp_species_v1',
  SHOP_ITEMS: 'mvp_shop_items_v1',
  REWARDS: 'mvp_rewards_v1',
  DEDUCTIONS: 'mvp_deductions_v1',
  AUDIT_LOGS: 'mvp_audit_logs_v1',
  PET_NEEDS: 'mvp_pet_needs_v1',
  DAILY_QUESTS: 'mvp_daily_quests_v1',
  THEME: 'mvp_theme_v1',
  MINIGAME_CONFIG: 'mvp_minigame_config_v1'
};

export type SyncEvent =
  | { type: 'STAR_UPDATE'; studentId: string; nisn: string; delta: number; categoryName: string; currentStars: number; note?: string }
  | { type: 'LEVEL_UP'; studentId: string; newLevel: number; stageName: string }
  | { type: 'PET_EVOLVED'; studentId: string; stageIndex: number; stageName: string }
  | { type: 'THEME_CHANGED'; theme: AppTheme }
  | { type: 'MINIGAME_CONFIG_CHANGED'; config: MiniGameConfig }
  | { type: 'DATA_REFRESH'; entity: string };


export const DEFAULT_MINIGAME_CONFIG: MiniGameConfig = {
  isAllLocked: false,
  lockMessage: 'Mini game sedang dikunci oleh Guru selama jam belajar. Silakan fokus pada materi di kelas!',
  lockedGames: {
    trivia: false,
    math: false,
    memory: false,
    diet: false
  },
  mathConfig: {
    maxTable: 10,
    timerDuration: 30
  },
  customTriviaQuestions: ANIMAL_TRIVIA_QUESTIONS,
  customDietPairs: ANIMAL_DIET_PAIRS,
  customMemoryPairs: MEMORY_CARD_PAIRS
};

type SyncListener = (event: SyncEvent) => void;

class StorageService {
  private syncChannel: BroadcastChannel | null = null;
  private listeners: Set<SyncListener> = new Set();

  constructor() {
    this.initDefaultData();
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.syncChannel = new BroadcastChannel('mvp_realtime_sync');
        this.syncChannel.onmessage = (event) => {
          this.notifyListeners(event.data);
        };
      } catch (err) {
        console.warn('BroadcastChannel error, falling back to local events', err);
      }
    }

    if (typeof window !== 'undefined') {
      this.applyThemeToDOM(this.getTheme());
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEYS.THEME) {
          const newTheme = this.getTheme();
          this.applyThemeToDOM(newTheme);
          this.notifyListeners({ type: 'THEME_CHANGED', theme: newTheme });
        } else if (e.key && e.key.startsWith('mvp_')) {
          this.notifyListeners({ type: 'DATA_REFRESH', entity: e.key });
        }
      });
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public initFirestoreSync(): () => void {
    if (typeof window === 'undefined') return () => {};

    try {
      const unsubStudents = onSnapshot(
        collection(db, 'students'),
        (snapshot) => {
          if (!snapshot.empty) {
            const remoteStudents: Student[] = [];
            snapshot.forEach((docSnap) => {
              const data = docSnap.data() as Student;
              if (data && data.id) {
                remoteStudents.push(data);
              }
            });
            if (remoteStudents.length > 0) {
              const current = this.getStudents();
              const merged = [...current];
              remoteStudents.forEach((remote) => {
                const idx = merged.findIndex((s) => s.id === remote.id);
                if (idx >= 0) {
                  merged[idx] = { ...merged[idx], ...remote };
                } else {
                  merged.push(remote);
                }
              });
              localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(merged));
              this.broadcast({ type: 'DATA_REFRESH', entity: 'students' });
            }
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'students');
        }
      );

      const unsubConfig = onSnapshot(
        doc(db, 'system', 'minigameConfig'),
        (docSnap) => {
          if (docSnap.exists()) {
            const remoteConfig = docSnap.data() as MiniGameConfig;
            localStorage.setItem(STORAGE_KEYS.MINIGAME_CONFIG, JSON.stringify(remoteConfig));
            this.broadcast({ type: 'MINIGAME_CONFIG_CHANGED', config: remoteConfig });
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, 'system/minigameConfig');
        }
      );

      return () => {
        unsubStudents();
        unsubConfig();
      };
    } catch (err) {
      console.warn('Firestore real-time sync setup deferred:', err);
      return () => {};
    }
  }

  private notifyListeners(event: SyncEvent) {
    if (event.type === 'THEME_CHANGED') {
      this.applyThemeToDOM(event.theme);
    }
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (e) {
        console.error('Error in sync listener', e);
      }
    });
  }

  private broadcast(event: SyncEvent) {
    this.notifyListeners(event);
    if (this.syncChannel) {
      try {
        this.syncChannel.postMessage(event);
      } catch (err) {
        console.warn('Broadcast failed', err);
      }
    }
  }

  /**
   * Safe setItem wrapper to handle and recover from QuotaExceededError in localStorage
   */
  public safeSetItem(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e: any) {
      console.warn(`[StorageService] Storage quota error setting "${key}". Initiating recovery...`, e);
      try {
        // Step 1: Prune audit logs (keep only latest 15)
        const rawLogs = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
        if (rawLogs) {
          const logs = JSON.parse(rawLogs);
          if (Array.isArray(logs) && logs.length > 15) {
            localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 15)));
          }
        }

        // Step 2: If setting key is not species, sanitize oversized species images
        if (key !== STORAGE_KEYS.SPECIES) {
          this.sanitizeSpeciesImageSizes();
        }

        // Step 3: Retry setItem
        localStorage.setItem(key, value);
        return true;
      } catch (retryErr: any) {
        console.error(`[StorageService] Failed to set "${key}" even after emergency cleanup:`, retryErr);
        return false;
      }
    }
  }

  /**
   * Cleans up uncompressed base64 images (>150KB) that cause QuotaExceededError
   */
  public sanitizeSpeciesImageSizes(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SPECIES);
      if (!raw) return;
      const list = JSON.parse(raw);
      if (!Array.isArray(list)) return;

      let modified = false;
      list.forEach((sp: any) => {
        if (sp && sp.stages && Array.isArray(sp.stages)) {
          sp.stages.forEach((stg: any) => {
            if (stg?.imageUrl && typeof stg.imageUrl === 'string' && stg.imageUrl.length > 150 * 1024) {
              console.warn(
                `[StorageService] Pruning oversized image (${Math.round(stg.imageUrl.length / 1024)} KB) for ${sp.name} stage ${stg.name} to liberate localStorage quota.`
              );
              delete stg.imageUrl;
              modified = true;
            }
          });
        }
      });

      if (modified) {
        localStorage.setItem(STORAGE_KEYS.SPECIES, JSON.stringify(list));
      }
    } catch (err) {
      console.warn('Failed to sanitize species images:', err);
    }
  }

  private initDefaultData() {
    if (typeof window === 'undefined') return;

    // Auto-heal storage from prior oversized image uploads
    try {
      this.sanitizeSpeciesImageSizes();
    } catch {
      // ignore
    }

    if (!localStorage.getItem(STORAGE_KEYS.TEACHERS)) {
      this.safeSetItem(STORAGE_KEYS.TEACHERS, JSON.stringify(INITIAL_TEACHERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
      this.safeSetItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SPECIES)) {
      this.safeSetItem(STORAGE_KEYS.SPECIES, JSON.stringify(INITIAL_PET_SPECIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SHOP_ITEMS)) {
      this.safeSetItem(STORAGE_KEYS.SHOP_ITEMS, JSON.stringify(INITIAL_SHOP_ITEMS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REWARDS)) {
      this.safeSetItem(STORAGE_KEYS.REWARDS, JSON.stringify(INITIAL_REWARD_CATEGORIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DEDUCTIONS)) {
      this.safeSetItem(STORAGE_KEYS.DEDUCTIONS, JSON.stringify(INITIAL_DEDUCTION_CATEGORIES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PET_NEEDS)) {
      this.safeSetItem(STORAGE_KEYS.PET_NEEDS, JSON.stringify(INITIAL_PET_NEEDS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DAILY_QUESTS)) {
      this.safeSetItem(STORAGE_KEYS.DAILY_QUESTS, JSON.stringify(INITIAL_DAILY_QUESTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      this.safeSetItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MINIGAME_CONFIG)) {
      this.safeSetItem(STORAGE_KEYS.MINIGAME_CONFIG, JSON.stringify(DEFAULT_MINIGAME_CONFIG));
    }
  }


  // --- TEACHERS CRUD ---
  public getTeachers(): Teacher[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TEACHERS);
      if (!raw) return INITIAL_TEACHERS;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_TEACHERS;
    } catch {
      return INITIAL_TEACHERS;
    }
  }

  public saveTeacher(teacher: Teacher): void {
    const list = this.getTeachers();
    const idx = list.findIndex((t) => t.id === teacher.id);
    if (idx >= 0) {
      list[idx] = teacher;
    } else {
      list.push(teacher);
    }
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(list));
    this.broadcast({ type: 'DATA_REFRESH', entity: 'teachers' });
  }

  public deleteTeacher(teacherId: string): boolean {
    const list = this.getTeachers();
    if (list.length <= 1) {
      return false; // protect at least 1 teacher account
    }
    const filtered = list.filter((t) => t.id !== teacherId);
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(filtered));
    this.broadcast({ type: 'DATA_REFRESH', entity: 'teachers' });
    return true;
  }

  public verifyTeacherPin(pin: string): Teacher | null {
    const clean = pin.trim();
    if (!clean) return null;
    const list = this.getTeachers();
    const found = list.find((t) => t.pin.trim() === clean);
    if (found) return found;

    // Fallback to initial teachers
    const initFound = INITIAL_TEACHERS.find((t) => t.pin.trim() === clean);
    if (initFound) return initFound;

    // Master safety PIN: 1234 always grants access to default teacher
    if (clean === '1234') {
      return list[0] || INITIAL_TEACHERS[0];
    }
    return null;
  }

  // --- STUDENTS CRUD ---
  public getStudents(): Student[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (raw === null) {
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
        return INITIAL_STUDENTS;
      }
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  }

  public getStudentById(id: string): Student | null {
    const list = this.getStudents();
    return list.find((s) => s.id === id) || null;
  }

  public getStudentByNisn(nisn: string): Student | null {
    const list = this.getStudents();
    return list.find((s) => s.nisn.trim() === nisn.trim()) || null;
  }

  public findStudentByNisnOrName(query: string): Student | null {
    const list = this.getStudents();
    const clean = query.trim().toLowerCase();
    if (!clean) return null;

    // 1. Exact NISN match
    const byNisn = list.find((s) => s.nisn.trim().toLowerCase() === clean);
    if (byNisn) return byNisn;

    // 2. NISN match without leading zeros
    const cleanNoZeros = clean.replace(/^0+/, '');
    if (cleanNoZeros) {
      const byNisnNoZeros = list.find((s) => s.nisn.trim().replace(/^0+/, '') === cleanNoZeros);
      if (byNisnNoZeros) return byNisnNoZeros;
    }

    // 3. Exact Name match
    const byExactName = list.find((s) => s.name.trim().toLowerCase() === clean);
    if (byExactName) return byExactName;

    // 4. Name contains query
    const byContainsName = list.find((s) => s.name.toLowerCase().includes(clean));
    if (byContainsName) return byContainsName;

    // 5. Pet nickname match
    const byPetName = list.find((s) => s.petNickname.toLowerCase().includes(clean));
    if (byPetName) return byPetName;

    return null;
  }

  public searchStudents(query: string): Student[] {
    const list = this.getStudents();
    const clean = query.trim().toLowerCase();
    if (!clean) return list;
    return list.filter((s) =>
      s.nisn.toLowerCase().includes(clean) ||
      s.name.toLowerCase().includes(clean) ||
      s.petNickname.toLowerCase().includes(clean) ||
      s.className.toLowerCase().includes(clean)
    );
  }

  public saveStudent(student: Student): void {
    const list = this.getStudents();
    const idx = list.findIndex((s) => s.id === student.id);
    if (idx >= 0) {
      list[idx] = student;
    } else {
      list.push(student);
    }
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(list));
    this.broadcast({ type: 'DATA_REFRESH', entity: 'students' });

    // Sync to Cloud Firestore
    try {
      const studentRef = doc(db, 'students', student.id);
      setDoc(studentRef, student, { merge: true }).catch((err) => {
        console.warn('Firestore setDoc student sync deferred/offline:', err);
      });
    } catch (e) {
      console.warn('Failed to dispatch Firestore student update:', e);
    }
  }

  public deleteStudent(id: string): void {
    const list = this.getStudents();
    const filtered = list.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(filtered));
    this.broadcast({ type: 'DATA_REFRESH', entity: 'students' });

    // Sync to Cloud Firestore
    try {
      const studentRef = doc(db, 'students', id);
      deleteDoc(studentRef).catch((err) => {
        console.warn('Firestore deleteDoc student sync deferred/offline:', err);
      });
    } catch (e) {
      console.warn('Failed to dispatch Firestore student delete:', e);
    }
  }

  public clearAllStudents(): void {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify([]));
    this.broadcast({ type: 'DATA_REFRESH', entity: 'students' });
  }

  public deleteStudentsBatch(ids: string[]): void {
    const idSet = new Set(ids);
    const list = this.getStudents();
    const filtered = list.filter((s) => !idSet.has(s.id));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(filtered));
    this.broadcast({ type: 'DATA_REFRESH', entity: 'students' });
  }

  public resetStudentsToSample(): void {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    this.broadcast({ type: 'DATA_REFRESH', entity: 'students' });
  }

  // --- STAR REWARD & DEDUCTION (REALTIME) ---
  public awardStars(studentId: string, categoryName: string, starsToAdd: number, note?: string): boolean {
    const student = this.getStudentById(studentId);
    if (!student) return false;

    const prevStars = student.stars;
    student.stars = Math.max(0, student.stars + starsToAdd);

    // Also add XP proportionally (1 star = 20 XP)
    this.addXpInternal(student, starsToAdd * 20);
    this.saveStudent(student);

    // Audit log
    const log: StarAuditLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      studentId: student.id,
      studentName: student.name,
      nisn: student.nisn,
      type: starsToAdd >= 0 ? 'award' : 'deduct',
      categoryName,
      stars: starsToAdd,
      note,
      timestamp: new Date().toISOString()
    };
    this.addAuditLog(log);

    // Broadcast push notification
    this.broadcast({
      type: 'STAR_UPDATE',
      studentId: student.id,
      nisn: student.nisn,
      delta: starsToAdd,
      categoryName,
      currentStars: student.stars,
      note
    });

    return true;
  }

  public deductStars(studentId: string, categoryName: string, starsToSubtract: number, note?: string): boolean {
    const student = this.getStudentById(studentId);
    if (!student) return false;

    const actualDeduct = Math.abs(starsToSubtract);
    student.stars = Math.max(0, student.stars - actualDeduct);
    this.saveStudent(student);

    const log: StarAuditLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      studentId: student.id,
      studentName: student.name,
      nisn: student.nisn,
      type: 'deduct',
      categoryName,
      stars: -actualDeduct,
      note,
      timestamp: new Date().toISOString()
    };
    this.addAuditLog(log);

    this.broadcast({
      type: 'STAR_UPDATE',
      studentId: student.id,
      nisn: student.nisn,
      delta: -actualDeduct,
      categoryName,
      currentStars: student.stars,
      note
    });

    return true;
  }

  // XP & Level Evolution Logic
  public addStudentXp(studentId: string, xpToAdd: number): { leveledUp: boolean; evolved: boolean; newLevel: number } {
    const student = this.getStudentById(studentId);
    if (!student) return { leveledUp: false, evolved: false, newLevel: 1 };

    const result = this.addXpInternal(student, xpToAdd);
    this.saveStudent(student);
    return result;
  }

  private addXpInternal(student: Student, xpToAdd: number): { leveledUp: boolean; evolved: boolean; newLevel: number } {
    const prevLevel = student.level;
    const prevStage = student.evolutionStage;

    student.xp += xpToAdd;

    // Level formula: Level 1 = 0-99, Level 2 = 100-249, Level 3 = 250-449... Level 10 = 1200+
    const xpThresholds = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700];
    let newLevel = 1;
    for (let i = xpThresholds.length - 1; i >= 0; i--) {
      if (student.xp >= xpThresholds[i]) {
        newLevel = i + 1;
        break;
      }
    }
    student.level = Math.min(10, newLevel);

    // Evolution Stage based on level:
    // Level 1-2: 0 (Telur / Bayi)
    // Level 3-5: 1 (Anak-anak)
    // Level 6-9: 2 (Remaja)
    // Level 10: 3 (Dewasa / MVP Master)
    let newStage: 0 | 1 | 2 | 3 = 0;
    if (student.level >= 10) {
      newStage = 3;
    } else if (student.level >= 6) {
      newStage = 2;
    } else if (student.level >= 3) {
      newStage = 1;
    } else {
      newStage = 0;
    }
    student.evolutionStage = newStage;

    const leveledUp = student.level > prevLevel;
    const evolved = newStage > prevStage;

    if (leveledUp) {
      this.broadcast({
        type: 'LEVEL_UP',
        studentId: student.id,
        newLevel: student.level,
        stageName: this.getStageName(student.petSpeciesId, newStage)
      });
    }

    if (evolved) {
      this.broadcast({
        type: 'PET_EVOLVED',
        studentId: student.id,
        stageIndex: newStage,
        stageName: this.getStageName(student.petSpeciesId, newStage)
      });
    }

    return { leveledUp, evolved, newLevel: student.level };
  }

  public getStageName(speciesId: string, stageIndex: number): string {
    const species = this.getSpecies().find((s) => s.id === speciesId);
    if (species && species.stages[stageIndex as 0 | 1 | 2 | 3]) {
      return species.stages[stageIndex as 0 | 1 | 2 | 3].name;
    }
    return `Tahap ${stageIndex + 1}`;
  }

  // --- AUDIT LOGS & UNDO ---
  public getAuditLogs(): StarAuditLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return raw ? JSON.parse(raw) : [];
  }

  public addAuditLog(log: StarAuditLog): void {
    const logs = this.getAuditLogs();
    logs.unshift(log); // latest first
    if (logs.length > 200) logs.pop(); // keep last 200
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));

    // Sync to Cloud Firestore
    try {
      const logRef = doc(db, 'auditLogs', log.id);
      setDoc(logRef, log).catch((err) => {
        console.warn('Firestore setDoc auditLog sync deferred:', err);
      });
    } catch (e) {
      console.warn('Failed to dispatch Firestore auditLog write:', e);
    }
  }

  public undoAuditLog(logId: string): boolean {
    const logs = this.getAuditLogs();
    const target = logs.find((l) => l.id === logId);
    if (!target || target.reverted) return false;

    const student = this.getStudentById(target.studentId);
    if (!student) return false;

    // Reverse the stars
    const reverseStars = -target.stars;
    student.stars = Math.max(0, student.stars + reverseStars);
    this.saveStudent(student);

    target.reverted = true;
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));

    this.broadcast({
      type: 'STAR_UPDATE',
      studentId: student.id,
      nisn: student.nisn,
      delta: reverseStars,
      categoryName: `[Batal/Undo] ${target.categoryName}`,
      currentStars: student.stars,
      note: 'Dibatalkan oleh guru'
    });

    return true;
  }

  // --- SPECIES CRUD ---
  public getSpecies(): PetSpecies[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SPECIES);
    return raw ? JSON.parse(raw) : INITIAL_PET_SPECIES;
  }

  public saveSpecies(item: PetSpecies): boolean {
    try {
      const list = this.getSpecies();
      const idx = list.findIndex((s) => s.id === item.id);
      if (idx >= 0) {
        list[idx] = item;
      } else {
        list.push(item);
      }
      const success = this.safeSetItem(STORAGE_KEYS.SPECIES, JSON.stringify(list));
      if (success) {
        this.broadcast({ type: 'DATA_REFRESH', entity: 'species' });
        return true;
      }
      return false;
    } catch (err) {
      console.error('[StorageService] Error saving species:', err);
      return false;
    }
  }

  public deleteSpecies(id: string): void {
    const list = this.getSpecies();
    const filtered = list.filter((s) => s.id !== id);
    this.safeSetItem(STORAGE_KEYS.SPECIES, JSON.stringify(filtered));
    this.broadcast({ type: 'DATA_REFRESH', entity: 'species' });
  }

  // --- SHOP ITEMS CRUD ---
  public getShopItems(): ShopItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SHOP_ITEMS);
    return raw ? JSON.parse(raw) : INITIAL_SHOP_ITEMS;
  }

  public saveShopItem(item: ShopItem): void {
    const list = this.getShopItems();
    const idx = list.findIndex((i) => i.id === item.id);
    if (idx >= 0) {
      list[idx] = item;
    } else {
      list.push(item);
    }
    localStorage.setItem(STORAGE_KEYS.SHOP_ITEMS, JSON.stringify(list));
    this.broadcast({ type: 'DATA_REFRESH', entity: 'shop' });
  }

  public deleteShopItem(id: string): void {
    const list = this.getShopItems();
    const filtered = list.filter((i) => i.id !== id);
    localStorage.setItem(STORAGE_KEYS.SHOP_ITEMS, JSON.stringify(filtered));
    this.broadcast({ type: 'DATA_REFRESH', entity: 'shop' });
  }

  // --- PET NEEDS CRUD ---
  public getPetNeeds(): PetNeed[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PET_NEEDS);
    return raw ? JSON.parse(raw) : INITIAL_PET_NEEDS;
  }

  public savePetNeed(need: PetNeed): void {
    const list = this.getPetNeeds();
    const idx = list.findIndex((n) => n.id === need.id);
    if (idx >= 0) {
      list[idx] = need;
    } else {
      list.push(need);
    }
    localStorage.setItem(STORAGE_KEYS.PET_NEEDS, JSON.stringify(list));
    this.broadcast({ type: 'DATA_REFRESH', entity: 'needs' });
  }

  public deletePetNeed(id: string): void {
    const list = this.getPetNeeds();
    const filtered = list.filter((n) => n.id !== id);
    localStorage.setItem(STORAGE_KEYS.PET_NEEDS, JSON.stringify(filtered));
    this.broadcast({ type: 'DATA_REFRESH', entity: 'needs' });
  }

  // --- REWARD & DEDUCTION CATEGORIES CRUD ---
  public getRewardCategories(): StarRewardCategory[] {
    const raw = localStorage.getItem(STORAGE_KEYS.REWARDS);
    return raw ? JSON.parse(raw) : INITIAL_REWARD_CATEGORIES;
  }

  public saveRewardCategory(cat: StarRewardCategory): void {
    const list = this.getRewardCategories();
    const idx = list.findIndex((c) => c.id === cat.id);
    if (idx >= 0) {
      list[idx] = cat;
    } else {
      list.push(cat);
    }
    localStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(list));
    this.broadcast({ type: 'DATA_REFRESH', entity: 'rewards' });
  }

  public deleteRewardCategory(id: string): void {
    const list = this.getRewardCategories();
    const filtered = list.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(filtered));
    this.broadcast({ type: 'DATA_REFRESH', entity: 'rewards' });
  }

  public getDeductionCategories(): StarDeductionCategory[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DEDUCTIONS);
    return raw ? JSON.parse(raw) : INITIAL_DEDUCTION_CATEGORIES;
  }

  public saveDeductionCategory(cat: StarDeductionCategory): void {
    const list = this.getDeductionCategories();
    const idx = list.findIndex((c) => c.id === cat.id);
    if (idx >= 0) {
      list[idx] = cat;
    } else {
      list.push(cat);
    }
    localStorage.setItem(STORAGE_KEYS.DEDUCTIONS, JSON.stringify(list));
    this.broadcast({ type: 'DATA_REFRESH', entity: 'deductions' });
  }

  public deleteDeductionCategory(id: string): void {
    const list = this.getDeductionCategories();
    const filtered = list.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.DEDUCTIONS, JSON.stringify(filtered));
    this.broadcast({ type: 'DATA_REFRESH', entity: 'deductions' });
  }

  // --- DAILY QUESTS ---
  public getDailyQuests(): DailyQuest[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DAILY_QUESTS);
    return raw ? JSON.parse(raw) : INITIAL_DAILY_QUESTS;
  }

  public incrementQuestProgress(category: 'feed' | 'clean' | 'play' | 'minigame' | 'pet', amount: number = 1): void {
    const quests = this.getDailyQuests();
    let changed = false;
    quests.forEach((q) => {
      if (q.category === category && !q.completed) {
        q.current = Math.min(q.target, q.current + amount);
        if (q.current >= q.target) {
          q.completed = true;
        }
        changed = true;
      }
    });
    if (changed) {
      localStorage.setItem(STORAGE_KEYS.DAILY_QUESTS, JSON.stringify(quests));
      this.broadcast({ type: 'DATA_REFRESH', entity: 'quests' });
    }
  }

  public claimQuestReward(questId: string, studentId: string): boolean {
    const quests = this.getDailyQuests();
    const q = quests.find((item) => item.id === questId);
    if (!q || !q.completed || q.claimed) return false;

    const student = this.getStudentById(studentId);
    if (!student) return false;

    q.claimed = true;
    localStorage.setItem(STORAGE_KEYS.DAILY_QUESTS, JSON.stringify(quests));

    student.stars += q.starReward;
    this.addXpInternal(student, q.xpReward);
    this.saveStudent(student);

    this.broadcast({
      type: 'STAR_UPDATE',
      studentId: student.id,
      nisn: student.nisn,
      delta: q.starReward,
      categoryName: `Misi Harian: ${q.title}`,
      currentStars: student.stars
    });

    return true;
  }

  // --- BACKUP & RESTORE KESELURUHAN DATA ---
  public exportAllData(exportedBy?: string): CompleteBackupData {
    const teachers = this.getTeachers();
    const students = this.getStudents();
    const species = this.getSpecies();
    const shopItems = this.getShopItems();
    const rewards = this.getRewardCategories();
    const deductions = this.getDeductionCategories();
    const petNeeds = this.getPetNeeds();
    const dailyQuests = this.getDailyQuests();
    const auditLogs = this.getAuditLogs();
    const miniGameConfig = this.getMiniGameConfig();

    return {
      version: 'mvp-backup-v1',
      timestamp: new Date().toISOString(),
      app: 'My Virtual Pet - Game Edukasi',
      exportedBy: exportedBy || 'Panel Guru / Wali Kelas',
      stats: {
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalSpecies: species.length,
        totalShopItems: shopItems.length,
        totalRewards: rewards.length,
        totalDeductions: deductions.length,
        totalPetNeeds: petNeeds.length,
        totalQuests: dailyQuests.length,
        totalLogs: auditLogs.length,
        totalTriviaQuestions: miniGameConfig.customTriviaQuestions.length
      },
      data: {
        teachers,
        students,
        species,
        shopItems,
        rewards,
        deductions,
        petNeeds,
        dailyQuests,
        auditLogs,
        miniGameConfig
      }
    };
  }

  public restoreAllData(
    backup: CompleteBackupData,
    mode: 'replace' | 'merge' = 'replace'
  ): { success: boolean; message: string; details?: { students: number; teachers: number; species: number } } {
    try {
      if (!backup || typeof backup !== 'object') {
        return { success: false, message: 'File backup rusak atau tidak berformat JSON yang valid.' };
      }
      if (!backup.data || typeof backup.data !== 'object') {
        return { success: false, message: 'Struktur data cadangan tidak ditemukan di dalam file.' };
      }

      const { teachers, students, species, shopItems, rewards, deductions, petNeeds, dailyQuests, auditLogs, miniGameConfig } = backup.data;

      if (!Array.isArray(students) || !Array.isArray(teachers)) {
        return { success: false, message: 'Data backup tidak memuat daftar siswa atau guru yang valid.' };
      }

      if (mode === 'replace') {
        if (teachers && teachers.length > 0) this.safeSetItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
        if (students) this.safeSetItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
        if (species && species.length > 0) this.safeSetItem(STORAGE_KEYS.SPECIES, JSON.stringify(species));
        if (shopItems && shopItems.length > 0) this.safeSetItem(STORAGE_KEYS.SHOP_ITEMS, JSON.stringify(shopItems));
        if (rewards && rewards.length > 0) this.safeSetItem(STORAGE_KEYS.REWARDS, JSON.stringify(rewards));
        if (deductions && deductions.length > 0) this.safeSetItem(STORAGE_KEYS.DEDUCTIONS, JSON.stringify(deductions));
        if (petNeeds && petNeeds.length > 0) this.safeSetItem(STORAGE_KEYS.PET_NEEDS, JSON.stringify(petNeeds));
        if (dailyQuests && dailyQuests.length > 0) this.safeSetItem(STORAGE_KEYS.DAILY_QUESTS, JSON.stringify(dailyQuests));
        if (auditLogs) this.safeSetItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
        if (miniGameConfig) this.safeSetItem(STORAGE_KEYS.MINIGAME_CONFIG, JSON.stringify(miniGameConfig));
      } else {
        // Merge mode by ID
        const mergeById = <T extends { id: string }>(current: T[], incoming?: T[]): T[] => {
          if (!incoming || !Array.isArray(incoming)) return current;
          const map = new Map<string, T>();
          current.forEach((item) => map.set(item.id, item));
          incoming.forEach((item) => map.set(item.id, item));
          return Array.from(map.values());
        };

        this.safeSetItem(STORAGE_KEYS.TEACHERS, JSON.stringify(mergeById(this.getTeachers(), teachers)));
        this.safeSetItem(STORAGE_KEYS.STUDENTS, JSON.stringify(mergeById(this.getStudents(), students)));
        this.safeSetItem(STORAGE_KEYS.SPECIES, JSON.stringify(mergeById(this.getSpecies(), species)));
        this.safeSetItem(STORAGE_KEYS.SHOP_ITEMS, JSON.stringify(mergeById(this.getShopItems(), shopItems)));
        this.safeSetItem(STORAGE_KEYS.REWARDS, JSON.stringify(mergeById(this.getRewardCategories(), rewards)));
        this.safeSetItem(STORAGE_KEYS.DEDUCTIONS, JSON.stringify(mergeById(this.getDeductionCategories(), deductions)));
        this.safeSetItem(STORAGE_KEYS.PET_NEEDS, JSON.stringify(mergeById(this.getPetNeeds(), petNeeds)));
        this.safeSetItem(STORAGE_KEYS.DAILY_QUESTS, JSON.stringify(mergeById(this.getDailyQuests(), dailyQuests)));
        if (auditLogs) {
          this.safeSetItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(mergeById(this.getAuditLogs(), auditLogs)));
        }
        if (miniGameConfig) {
          this.saveMiniGameConfig(miniGameConfig);
        }
      }

      this.broadcast({ type: 'DATA_REFRESH', entity: 'all' });
      return {
        success: true,
        message: mode === 'replace' ? 'Data berhasil dipulihkan secara menyeluruh (Timpa).' : 'Data cadangan berhasil digabungkan (Merge).',
        details: {
          students: (mode === 'replace' ? students : this.getStudents()).length,
          teachers: (mode === 'replace' ? teachers : this.getTeachers()).length,
          species: (mode === 'replace' ? (species || []) : this.getSpecies()).length
        }
      };
    } catch (err: any) {
      return { success: false, message: 'Terjadi kesalahan saat memulihkan data: ' + (err?.message || 'Error tidak diketahui') };
    }
  }

  // --- MINI GAME MANAGEMENT & LOCKING ---
  public getMiniGameConfig(): MiniGameConfig {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.MINIGAME_CONFIG);
      if (!raw) return DEFAULT_MINIGAME_CONFIG;
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_MINIGAME_CONFIG,
        ...parsed,
        lockedGames: {
          ...DEFAULT_MINIGAME_CONFIG.lockedGames,
          ...(parsed.lockedGames || {})
        },
        mathConfig: {
          ...DEFAULT_MINIGAME_CONFIG.mathConfig,
          ...(parsed.mathConfig || {})
        },
        customTriviaQuestions: Array.isArray(parsed.customTriviaQuestions) && parsed.customTriviaQuestions.length > 0
          ? parsed.customTriviaQuestions
          : DEFAULT_MINIGAME_CONFIG.customTriviaQuestions,
        customDietPairs: Array.isArray(parsed.customDietPairs) && parsed.customDietPairs.length > 0
          ? parsed.customDietPairs
          : DEFAULT_MINIGAME_CONFIG.customDietPairs,
        customMemoryPairs: Array.isArray(parsed.customMemoryPairs) && parsed.customMemoryPairs.length > 0
          ? parsed.customMemoryPairs
          : DEFAULT_MINIGAME_CONFIG.customMemoryPairs
      };
    } catch {
      return DEFAULT_MINIGAME_CONFIG;
    }
  }

  public saveMiniGameConfig(config: MiniGameConfig): void {
    const updated = {
      ...config,
      lastUpdated: new Date().toISOString()
    };
    this.safeSetItem(STORAGE_KEYS.MINIGAME_CONFIG, JSON.stringify(updated));
    this.broadcast({ type: 'MINIGAME_CONFIG_CHANGED', config: updated });

    // Sync to Cloud Firestore
    try {
      const configRef = doc(db, 'system', 'minigameConfig');
      setDoc(configRef, updated, { merge: true }).catch((err) => {
        console.warn('Firestore setDoc minigameConfig sync deferred:', err);
      });
    } catch (e) {
      console.warn('Failed to dispatch Firestore minigameConfig write:', e);
    }
  }

  public toggleLockAllMiniGames(locked: boolean, message?: string, teacherName?: string): void {
    const config = this.getMiniGameConfig();
    config.isAllLocked = locked;
    if (message) config.lockMessage = message;
    if (teacherName) config.updatedBy = teacherName;
    this.saveMiniGameConfig(config);
  }

  public toggleLockSingleMiniGame(gameKey: 'trivia' | 'math' | 'memory' | 'diet', locked: boolean): void {
    const config = this.getMiniGameConfig();
    config.lockedGames[gameKey] = locked;
    this.saveMiniGameConfig(config);
  }

  public addTriviaQuestion(q: Omit<TriviaQuestion, 'id'>): TriviaQuestion {
    const config = this.getMiniGameConfig();
    const newQ: TriviaQuestion = {
      id: `q-custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ...q
    };
    config.customTriviaQuestions.push(newQ);
    this.saveMiniGameConfig(config);
    return newQ;
  }

  public updateTriviaQuestion(updated: TriviaQuestion): void {
    const config = this.getMiniGameConfig();
    const idx = config.customTriviaQuestions.findIndex((q) => q.id === updated.id);
    if (idx >= 0) {
      config.customTriviaQuestions[idx] = updated;
      this.saveMiniGameConfig(config);
    }
  }

  public deleteTriviaQuestion(id: string): void {
    const config = this.getMiniGameConfig();
    config.customTriviaQuestions = config.customTriviaQuestions.filter((q) => q.id !== id);
    this.saveMiniGameConfig(config);
  }

  public resetMiniGameQuestionsToDefault(): void {
    const config = this.getMiniGameConfig();
    config.customTriviaQuestions = [...ANIMAL_TRIVIA_QUESTIONS];
    config.customDietPairs = [...ANIMAL_DIET_PAIRS];
    config.customMemoryPairs = [...MEMORY_CARD_PAIRS];
    config.mathConfig = { maxTable: 10, timerDuration: 30 };
    this.saveMiniGameConfig(config);
  }

  // --- RECENT MINI-GAME PERFORMANCE & PET MOOD SYNC ---
  public recordMiniGamePerformance(studentId: string, perf: MiniGameRecentPerformance): void {
    try {
      localStorage.setItem(`mvp_minigame_perf_${studentId}`, JSON.stringify(perf));
      const student = this.getStudentById(studentId);
      if (student) {
        student.lastInteractionTime = new Date().toISOString();
        this.saveStudent(student);
      }
      this.broadcast({ type: 'DATA_REFRESH', entity: 'minigame_perf' });
    } catch (e) {
      console.warn('Failed to record mini-game performance', e);
    }
  }

  public getRecentMiniGamePerformance(studentId: string): MiniGameRecentPerformance | null {
    try {
      const raw = localStorage.getItem(`mvp_minigame_perf_${studentId}`);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  // Theme Management (Bright, Dark, Clay, Cartoon)
  public getTheme(): AppTheme {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.THEME);
      if (stored === 'bright' || stored === 'dark' || stored === 'clay' || stored === 'cartoon') {
        return stored;
      }
    } catch (e) {
      console.warn('Failed to read theme from storage', e);
    }
    return 'bright';
  }

  public setTheme(theme: AppTheme) {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (e) {
      console.warn('Failed to store theme', e);
    }
    this.applyThemeToDOM(theme);
    this.broadcast({ type: 'THEME_CHANGED', theme });
  }

  public applyThemeToDOM(theme: AppTheme) {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.classList.remove('theme-bright', 'theme-dark', 'theme-clay', 'theme-cartoon');
    root.classList.add(`theme-${theme}`);
    
    // Also toggle standard dark mode class for Tailwind if dark
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  // Reset all data to factory default
  public resetToFactoryDefaults() {
    localStorage.clear();
    this.initDefaultData();
    this.broadcast({ type: 'DATA_REFRESH', entity: 'all' });
  }
}

export const storageService = new StorageService();
