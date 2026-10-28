import React, { useState, useEffect } from 'react';
import {
  Users,
  Shield,
  Sparkles,
  ShoppingBag,
  Award,
  MinusCircle,
  PlusCircle,
  Share2,
  Trash2,
  Edit2,
  Search,
  KeyRound,
  RotateCcw,
  Heart,
  Gamepad2,
  Image as ImageIcon,
  Check,
  AlertTriangle,
  ExternalLink,
  Plus,
  RefreshCw,
  Eye,
  EyeOff,
  Table,
  LayoutGrid,
  CheckCircle2,
  Database,
  Moon
} from 'lucide-react';
import {
  Student,
  Teacher,
  PetSpecies,
  ShopItem,
  StarRewardCategory,
  StarDeductionCategory,
  StarAuditLog,
  PetNeed,
  ShopCategory,
  PetEvolutionStageIndex,
  PetStageConfig
} from '../../types';
import { storageService, SyncEvent } from '../../services/storage';
import { soundManager } from '../../services/audio';
import { QRCodeModal } from '../common/QRCodeModal';
import { PetRenderer } from '../pet/PetRenderer';
import { BackupRestoreSection } from './BackupRestoreSection';
import { compressImageFile } from '../../utils/imageCompressor';
import { ThemeSelector } from '../common/ThemeSelector';
import { MiniGameManager } from './MiniGameManager';

interface TeacherDashboardProps {
  teacher: Teacher;
  onLoginAsStudent: (student: Student) => void;
  onOpenQR: (student?: Student) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  teacher,
  onLoginAsStudent,
  onOpenQR
}) => {
  const [activeTab, setActiveTab] = useState<
    'students' | 'teachers' | 'gallery' | 'shop' | 'rewards' | 'needs' | 'logs' | 'backup' | 'minigames'
  >('students');
  const [miniGameConfig, setMiniGameConfig] = useState(() => storageService.getMiniGameConfig());


  // Core Data States
  const [students, setStudents] = useState<Student[]>(storageService.getStudents());
  const [teachers, setTeachers] = useState<Teacher[]>(storageService.getTeachers());
  const [speciesList, setSpeciesList] = useState<PetSpecies[]>(storageService.getSpecies());
  const [shopItems, setShopItems] = useState<ShopItem[]>(storageService.getShopItems());
  const [rewardCategories, setRewardCategories] = useState<StarRewardCategory[]>(storageService.getRewardCategories());
  const [deductionCategories, setDeductionCategories] = useState<StarDeductionCategory[]>(storageService.getDeductionCategories());
  const [petNeeds, setPetNeeds] = useState<PetNeed[]>(storageService.getPetNeeds());
  const [auditLogs, setAuditLogs] = useState<StarAuditLog[]>(storageService.getAuditLogs());

  // Search & Filters
  const [studentSearch, setStudentSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [selectedSpeciesId, setSelectedSpeciesId] = useState(speciesList[0]?.id || 'kucing');
  const [shopCategoryFilter, setShopCategoryFilter] = useState<string>('all');

  // Modals & Forms State
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const [showAwardModal, setShowAwardModal] = useState(false);
  const [showDeductModal, setShowDeductModal] = useState(false);
  const [actionTargetStudent, setActionTargetStudent] = useState<Student | null>(null);
  const [selectedRewardCatId, setSelectedRewardCatId] = useState('');
  const [selectedDeductCatId, setSelectedDeductCatId] = useState('');
  const [customNote, setCustomNote] = useState('');

  const [showAddShopModal, setShowAddShopModal] = useState(false);
  const [editingShopItem, setEditingShopItem] = useState<ShopItem | null>(null);

  const [showAddNeedModal, setShowAddNeedModal] = useState(false);
  const [editingNeed, setEditingNeed] = useState<PetNeed | null>(null);

  const [showAddRewardCatModal, setShowAddRewardCatModal] = useState(false);
  const [editingRewardCat, setEditingRewardCat] = useState<StarRewardCategory | null>(null);
  const [showAddDeductCatModal, setShowAddDeductCatModal] = useState(false);
  const [editingDeductCat, setEditingDeductCat] = useState<StarDeductionCategory | null>(null);

  const [showAddSpeciesModal, setShowAddSpeciesModal] = useState(false);
  const [editingSpecies, setEditingSpecies] = useState<PetSpecies | null>(null);
  const [studentViewMode, setStudentViewMode] = useState<'table' | 'card'>('table');
  const [crudToast, setCrudToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [showMyHeaderPin, setShowMyHeaderPin] = useState(false);
  const [revealedTeacherPins, setRevealedTeacherPins] = useState<Record<string, boolean>>({});
  const [showModalPin, setShowModalPin] = useState(false);

  // In-app Delete Confirmation Modal (Iframe-safe, replaces blocked window.confirm)
  interface DeleteModalConfig {
    title: string;
    itemName: string;
    itemType: string;
    warningText?: string;
    onConfirm: () => void;
  }
  const [deleteModal, setDeleteModal] = useState<DeleteModalConfig | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setCrudToast({ message, type });
    setTimeout(() => {
      setCrudToast(null);
    }, 3500);
  };

  // Form Fields
  const [studentForm, setStudentForm] = useState({
    name: '',
    nisn: '',
    className: 'Kelas 4A',
    petSpeciesId: 'kucing',
    petNickname: '',
    stars: 5,
    level: 1
  });

  const [speciesForm, setSpeciesForm] = useState<{
    name: string;
    category: 'mamalia' | 'unggas' | 'reptil' | 'akuatik' | 'fantasi';
    description: string;
    stage0Name: string;
    stage1Name: string;
    stage2Name: string;
    stage3Name: string;
  }>({
    name: '',
    category: 'mamalia',
    description: '',
    stage0Name: 'Telur / Bayi',
    stage1Name: 'Anak-anak',
    stage2Name: 'Remaja Ceria',
    stage3Name: 'Dewasa Juara'
  });

  const [rewardCatForm, setRewardCatForm] = useState({
    name: '',
    stars: 3,
    icon: '🌟',
    description: ''
  });

  const [deductCatForm, setDeductCatForm] = useState({
    name: '',
    stars: 1,
    icon: '⚠️',
    description: ''
  });

  const [teacherForm, setTeacherForm] = useState({
    name: '',
    pin: '',
    email: ''
  });

  const [shopItemForm, setShopItemForm] = useState<Partial<ShopItem>>({
    name: '',
    category: 'makanan',
    price: 1,
    icon: '🍎',
    description: '',
    unlockLevel: 1,
    inStock: true,
    boosts: { hunger: 25, happiness: 10 }
  });

  const [needForm, setNeedForm] = useState({
    text: '',
    icon: '🍎',
    category: 'makanan' as PetNeed['category'],
    rewardXp: 35,
    rewardProgress: 20
  });

  // Listen to Storage Sync
  useEffect(() => {
    const unsub = storageService.subscribe((event: SyncEvent) => {
      setStudents(storageService.getStudents());
      setTeachers(storageService.getTeachers());
      setSpeciesList(storageService.getSpecies());
      setShopItems(storageService.getShopItems());
      setRewardCategories(storageService.getRewardCategories());
      setDeductionCategories(storageService.getDeductionCategories());
      setPetNeeds(storageService.getPetNeeds());
      setAuditLogs(storageService.getAuditLogs());
      setMiniGameConfig(storageService.getMiniGameConfig());
    });
    return () => unsub();
  }, []);

  const refreshData = () => {
    setStudents(storageService.getStudents());
    setTeachers(storageService.getTeachers());
    setSpeciesList(storageService.getSpecies());
    setShopItems(storageService.getShopItems());
    setRewardCategories(storageService.getRewardCategories());
    setDeductionCategories(storageService.getDeductionCategories());
    setPetNeeds(storageService.getPetNeeds());
    setAuditLogs(storageService.getAuditLogs());
    setMiniGameConfig(storageService.getMiniGameConfig());
  };

  // Student Actions (CRUD)
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.name.trim() || !studentForm.nisn.trim()) {
      showToast('Nama siswa dan NISN wajib diisi!', 'error');
      return;
    }

    const studentLevel = Math.min(10, Math.max(1, Number(studentForm.level) || 1));
    const stageIdx: PetEvolutionStageIndex = studentLevel >= 10 ? 3 : studentLevel >= 6 ? 2 : studentLevel >= 3 ? 1 : 0;

    if (editingStudent) {
      const updated: Student = {
        ...editingStudent,
        name: studentForm.name.trim(),
        nisn: studentForm.nisn.trim(),
        className: studentForm.className.trim() || 'Kelas 4A',
        petSpeciesId: studentForm.petSpeciesId,
        petNickname: studentForm.petNickname.trim() || editingStudent.petNickname,
        stars: Math.max(0, Number(studentForm.stars) || 0),
        level: studentLevel,
        evolutionStage: stageIdx
      };
      storageService.saveStudent(updated);
      showToast(`Data siswa "${updated.name}" berhasil diperbarui!`);
    } else {
      // Check if NISN already exists
      const existing = students.find((s) => s.nisn.trim() === studentForm.nisn.trim());
      if (existing) {
        showToast(`NISN "${studentForm.nisn}" sudah terdaftar atas nama ${existing.name}. Gunakan nomor lain.`, 'error');
        return;
      }

      const newStudent: Student = {
        id: 'student-' + Date.now(),
        name: studentForm.name.trim(),
        nisn: studentForm.nisn.trim(),
        className: studentForm.className.trim() || 'Kelas 4A',
        petSpeciesId: studentForm.petSpeciesId,
        petNickname: studentForm.petNickname.trim() || 'Sahabatku',
        stars: Math.max(0, Number(studentForm.stars) || 0),
        level: studentLevel,
        xp: 0,
        evolutionStage: stageIdx,
        needs: { hunger: 100, thirst: 100, hygiene: 100, happiness: 100, energy: 100 },
        inventory: { 'item-apple': 2, 'item-water': 2, 'item-soap': 1 },
        equippedAccessories: [],
        equippedHabitat: {
          background: 'hab-bg-bedroom',
          furniture: 'hab-fur-bed',
          ornament: 'hab-orn-trophy'
        },
        unlockedHabitats: ['hab-bg-bedroom', 'hab-fur-bed', 'hab-orn-trophy'],
        isSleeping: false
      };
      storageService.saveStudent(newStudent);
      showToast(`Siswa baru "${newStudent.name}" berhasil ditambahkan ke database!`);
    }

    setShowAddStudentModal(false);
    setEditingStudent(null);
    setStudentForm({ name: '', nisn: '', className: 'Kelas 4A', petSpeciesId: 'kucing', petNickname: '', stars: 5, level: 1 });
    refreshData();
  };

  const handleDeleteStudent = (id: string, name: string) => {
    setDeleteModal({
      title: 'Hapus Data Siswa',
      itemName: name,
      itemType: 'Siswa',
      warningText: 'Data hewan peliharaan, level, saldo bintang, dan riwayat siswa ini akan dihapus secara permanen dari database kelas.',
      onConfirm: () => {
        storageService.deleteStudent(id);
        setSelectedStudentIds((prev) => prev.filter((item) => item !== id));
        showToast(`Data siswa "${name}" berhasil dihapus dari database.`);
        refreshData();
        setDeleteModal(null);
      }
    });
  };

  const handleDeleteSelectedStudents = () => {
    if (selectedStudentIds.length === 0) return;
    const count = selectedStudentIds.length;
    setDeleteModal({
      title: 'Hapus Siswa Terpilih',
      itemName: `${count} Siswa Terpilih`,
      itemType: 'Data Siswa',
      warningText: `PERHATIAN: ${count} akun siswa yang dipilih akan dihapus secara permanen dari database kelas. Tindakan ini tidak dapat dibatalkan.`,
      onConfirm: () => {
        storageService.deleteStudentsBatch(selectedStudentIds);
        showToast(`${count} data siswa terpilih berhasil dihapus dari database.`);
        setSelectedStudentIds([]);
        refreshData();
        setDeleteModal(null);
      }
    });
  };

  const handleClearAllStudents = () => {
    setDeleteModal({
      title: 'Kosongkan Seluruh Database Siswa',
      itemName: `Semua Siswa (${students.length} anak)`,
      itemType: 'Seluruh Database Siswa',
      warningText: 'PERINGATAN KERAS: Seluruh akun siswa, hewan peliharaan, level, inventaris, dan saldo bintang akan dihapus bersih (0 siswa). Anda dapat menambahkan siswa baru atau memuat kembali 12 siswa contoh kapan saja.',
      onConfirm: () => {
        storageService.clearAllStudents();
        showToast('Seluruh database siswa berhasil dikosongkan.');
        setSelectedStudentIds([]);
        refreshData();
        setDeleteModal(null);
      }
    });
  };

  const handleResetSampleStudents = () => {
    storageService.resetStudentsToSample();
    showToast('12 data siswa contoh berhasil dimuat ulang ke database.');
    setSelectedStudentIds([]);
    refreshData();
  };

  const toggleSelectStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAllStudents = (filteredList: Student[]) => {
    const filteredIds = filteredList.map((s) => s.id);
    const allSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedStudentIds.includes(id));
    if (allSelected) {
      setSelectedStudentIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedStudentIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  // Teacher / PIN Actions (CRUD)
  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherForm.name.trim() || !teacherForm.pin.trim()) {
      showToast('Nama guru dan PIN wajib diisi!', 'error');
      return;
    }

    if (editingTeacher) {
      const updated: Teacher = {
        ...editingTeacher,
        name: teacherForm.name.trim(),
        pin: teacherForm.pin.trim(),
        email: teacherForm.email.trim()
      };
      storageService.saveTeacher(updated);
      showToast(`Akun guru "${updated.name}" dan PIN berhasil diperbarui!`);
    } else {
      const newTeacher: Teacher = {
        id: 'teacher-' + Date.now(),
        name: teacherForm.name.trim(),
        pin: teacherForm.pin.trim(),
        email: teacherForm.email.trim(),
        createdAt: new Date().toISOString()
      };
      storageService.saveTeacher(newTeacher);
      showToast(`Akun guru baru "${newTeacher.name}" berhasil ditambahkan!`);
    }

    setShowAddTeacherModal(false);
    setEditingTeacher(null);
    setTeacherForm({ name: '', pin: '', email: '' });
    refreshData();
  };

  const handleDeleteTeacher = (id: string, name: string) => {
    if (teachers.length <= 1) {
      showToast('Tidak dapat menghapus! Minimal harus ada 1 akun Guru / PIN aktif di sistem.', 'error');
      return;
    }
    setDeleteModal({
      title: 'Hapus Akun Guru & PIN',
      itemName: name,
      itemType: 'Akun Pengajar',
      warningText: 'Akses masuk akun dan PIN ini akan dicabut secara permanen.',
      onConfirm: () => {
        const success = storageService.deleteTeacher(id);
        if (success) {
          showToast(`Akun guru "${name}" berhasil dihapus.`);
          refreshData();
        } else {
          showToast('Gagal menghapus akun guru.', 'error');
        }
        setDeleteModal(null);
      }
    });
  };

  // Pet Species Actions (CRUD)
  const handleSaveSpecies = (e: React.FormEvent) => {
    e.preventDefault();
    if (!speciesForm.name.trim()) return;

    if (editingSpecies) {
      const updated: PetSpecies = {
        ...editingSpecies,
        name: speciesForm.name.trim(),
        category: speciesForm.category,
        description: speciesForm.description.trim() || `Hewan peliharaan ${speciesForm.name}`,
        stages: editingSpecies.stages.map((stg, idx) => {
          let stageName = stg.name;
          if (idx === 0 && speciesForm.stage0Name) stageName = speciesForm.stage0Name;
          if (idx === 1 && speciesForm.stage1Name) stageName = speciesForm.stage1Name;
          if (idx === 2 && speciesForm.stage2Name) stageName = speciesForm.stage2Name;
          if (idx === 3 && speciesForm.stage3Name) stageName = speciesForm.stage3Name;
          return { ...stg, name: stageName };
        }) as [typeof editingSpecies.stages[0], typeof editingSpecies.stages[1], typeof editingSpecies.stages[2], typeof editingSpecies.stages[3]]
      };
      storageService.saveSpecies(updated);
      showToast(`Spesies "${updated.name}" berhasil diperbarui!`);
      setSelectedSpeciesId(updated.id);
    } else {
      const newId = 'spec-' + Date.now();
      const newSpecies: PetSpecies = {
        id: newId,
        name: speciesForm.name.trim(),
        category: speciesForm.category,
        description: speciesForm.description.trim() || `Hewan peliharaan ${speciesForm.name}`,
        stages: [
          {
            name: speciesForm.stage0Name || 'Telur / Bayi',
            description: `Tahap awal kelahiran ${speciesForm.name}`,
            minLevel: 1,
            minStars: 0,
            vectorType: 'bayi'
          },
          {
            name: speciesForm.stage1Name || 'Anak-anak',
            description: `Anak ${speciesForm.name} yang lucu dan aktif`,
            minLevel: 3,
            minStars: 5,
            vectorType: 'anak'
          },
          {
            name: speciesForm.stage2Name || 'Remaja Ceria',
            description: `${speciesForm.name} remaja yang tangkas`,
            minLevel: 6,
            minStars: 15,
            vectorType: 'remaja'
          },
          {
            name: speciesForm.stage3Name || 'Dewasa Juara',
            description: `${speciesForm.name} dewasa bermahkota MVP`,
            minLevel: 10,
            minStars: 30,
            vectorType: 'dewasa'
          }
        ]
      };

      storageService.saveSpecies(newSpecies);
      setSelectedSpeciesId(newId);
      showToast(`Spesies baru "${newSpecies.name}" berhasil ditambahkan ke Pet Gallery!`);
    }

    setShowAddSpeciesModal(false);
    setEditingSpecies(null);
    setSpeciesForm({
      name: '',
      category: 'mamalia',
      description: '',
      stage0Name: 'Telur / Bayi',
      stage1Name: 'Anak-anak',
      stage2Name: 'Remaja Ceria',
      stage3Name: 'Dewasa Juara'
    });
    refreshData();
  };

  const handleDeleteSpecies = (id: string, name: string) => {
    const isUsed = students.some((s) => s.petSpeciesId === id);
    if (isUsed) {
      showToast(`Spesies "${name}" sedang dipelihara oleh siswa dalam database dan tidak boleh dihapus.`, 'error');
      return;
    }
    if (speciesList.length <= 1) {
      showToast('Minimal harus tersisa 1 spesies hewan dalam database.', 'error');
      return;
    }
    setDeleteModal({
      title: 'Hapus Spesies Pet',
      itemName: name,
      itemType: 'Spesies Pet',
      warningText: 'Spesies ini akan dihapus dari Pet Gallery.',
      onConfirm: () => {
        storageService.deleteSpecies(id);
        showToast(`Spesies "${name}" berhasil dihapus.`);
        const remaining = storageService.getSpecies();
        if (selectedSpeciesId === id && remaining.length > 0) {
          setSelectedSpeciesId(remaining[0].id);
        }
        refreshData();
        setDeleteModal(null);
      }
    });
  };

  // Reward & Deduction Categories (CRUD)
  const handleSaveRewardCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewardCatForm.name.trim()) return;

    if (editingRewardCat) {
      const updated: StarRewardCategory = {
        ...editingRewardCat,
        name: rewardCatForm.name.trim(),
        stars: Math.max(1, Number(rewardCatForm.stars) || 1),
        icon: rewardCatForm.icon.trim() || '🌟',
        description: rewardCatForm.description.trim()
      };
      storageService.saveRewardCategory(updated);
      showToast(`Kategori reward "${updated.name}" berhasil diperbarui!`);
    } else {
      const newCat: StarRewardCategory = {
        id: 'rew-' + Date.now(),
        name: rewardCatForm.name.trim(),
        stars: Math.max(1, Number(rewardCatForm.stars) || 1),
        icon: rewardCatForm.icon.trim() || '🌟',
        description: rewardCatForm.description.trim()
      };
      storageService.saveRewardCategory(newCat);
      showToast(`Kategori reward baru "${newCat.name}" berhasil ditambahkan!`);
    }

    setShowAddRewardCatModal(false);
    setEditingRewardCat(null);
    setRewardCatForm({ name: '', stars: 3, icon: '🌟', description: '' });
    refreshData();
  };

  const handleSaveDeductionCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deductCatForm.name.trim()) return;

    if (editingDeductCat) {
      const updated: StarDeductionCategory = {
        ...editingDeductCat,
        name: deductCatForm.name.trim(),
        stars: Math.max(1, Number(deductCatForm.stars) || 1),
        icon: deductCatForm.icon.trim() || '⚠️',
        description: deductCatForm.description.trim()
      };
      storageService.saveDeductionCategory(updated);
      showToast(`Kategori pengurangan "${updated.name}" berhasil diperbarui!`);
    } else {
      const newCat: StarDeductionCategory = {
        id: 'ded-' + Date.now(),
        name: deductCatForm.name.trim(),
        stars: Math.max(1, Number(deductCatForm.stars) || 1),
        icon: deductCatForm.icon.trim() || '⚠️',
        description: deductCatForm.description.trim()
      };
      storageService.saveDeductionCategory(newCat);
      showToast(`Kategori pengurangan baru "${newCat.name}" berhasil ditambahkan!`);
    }

    setShowAddDeductCatModal(false);
    setEditingDeductCat(null);
    setDeductCatForm({ name: '', stars: 1, icon: '⚠️', description: '' });
    refreshData();
  };
  // Reward / Deduct Stars
  const handleExecuteAward = () => {
    if (!actionTargetStudent) return;
    const cat = rewardCategories.find((c) => c.id === selectedRewardCatId);
    if (!cat) return;

    storageService.awardStars(actionTargetStudent.id, cat.name, cat.stars, customNote);
    setShowAwardModal(false);
    setActionTargetStudent(null);
    setCustomNote('');
    refreshData();
  };

  const handleExecuteDeduct = () => {
    if (!actionTargetStudent) return;
    const cat = deductionCategories.find((c) => c.id === selectedDeductCatId);
    if (!cat) return;

    storageService.deductStars(actionTargetStudent.id, cat.name, cat.stars, customNote);
    setShowDeductModal(false);
    setActionTargetStudent(null);
    setCustomNote('');
    refreshData();
  };

  const handleUndoLog = (logId: string) => {
    setDeleteModal({
      title: 'Batalkan Catatan Bintang (Undo)',
      itemName: 'Riwayat Catatan Bintang',
      itemType: 'Catatan Log',
      warningText: 'Aksi ini akan mengembalikan saldo bintang siswa seperti sebelum tindakan ini dilakukan.',
      onConfirm: () => {
        storageService.undoAuditLog(logId);
        showToast('Catatan bintang berhasil dibatalkan dan saldo dikembalikan.');
        refreshData();
        setDeleteModal(null);
      }
    });
  };

  // Pet Gallery Evolution settings
  const currentSpecies = speciesList.find((s) => s.id === selectedSpeciesId) || speciesList[0];
  const [uploadingStage, setUploadingStage] = useState<number | null>(null);
  const [uploadingSleepingStage, setUploadingSleepingStage] = useState<number | null>(null);
  const [uploadingSpeciesSleeping, setUploadingSpeciesSleeping] = useState<boolean>(false);
  const [stagePreviewMode, setStagePreviewMode] = useState<Record<number, 'awake' | 'sleeping'>>({});

  const handleImageUpload = async (stageIdx: PetEvolutionStageIndex, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentSpecies) return;

    const inputElement = e.target;
    setUploadingStage(stageIdx);

    try {
      // Compress large images (2MB - 12MB photos) to crisp 320x320 thumbnails (~15KB - 35KB)
      const compressed = await compressImageFile(file, 320, 0.82);

      const updated = {
        ...currentSpecies,
        stages: [...currentSpecies.stages] as [PetStageConfig, PetStageConfig, PetStageConfig, PetStageConfig]
      };
      updated.stages[stageIdx] = {
        ...updated.stages[stageIdx],
        imageUrl: compressed.dataUrl
      };

      const saved = storageService.saveSpecies(updated);
      if (saved) {
        refreshData();
        showToast(
          `Foto bangun tahap ${stageIdx + 1} (${currentSpecies.stages[stageIdx]?.name}) berhasil diunggah (${compressed.sizeKb} KB)!`
        );
      } else {
        showToast('Penyimpanan lokal penuh. Hapus beberapa foto kustom atau cadangkan data.', 'error');
      }
    } catch (err: any) {
      console.error('Image upload failed:', err);
      showToast('Gagal memproses gambar: ' + (err?.message || 'Format tidak didukung'), 'error');
    } finally {
      setUploadingStage(null);
      if (inputElement) inputElement.value = '';
    }
  };

  const handleSleepingImageUpload = async (stageIdx: PetEvolutionStageIndex, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentSpecies) return;

    const inputElement = e.target;
    setUploadingSleepingStage(stageIdx);

    try {
      const compressed = await compressImageFile(file, 320, 0.82);

      const updated = {
        ...currentSpecies,
        stages: [...currentSpecies.stages] as [PetStageConfig, PetStageConfig, PetStageConfig, PetStageConfig]
      };
      updated.stages[stageIdx] = {
        ...updated.stages[stageIdx],
        sleepingImageUrl: compressed.dataUrl
      };

      const saved = storageService.saveSpecies(updated);
      if (saved) {
        // Automatically switch preview to sleeping mode so the teacher immediately sees their uploaded sleeping photo!
        setStagePreviewMode((prev) => ({ ...prev, [stageIdx]: 'sleeping' }));
        refreshData();
        showToast(
          `Foto tidur (Zzz) tahap ${stageIdx + 1} (${currentSpecies.stages[stageIdx]?.name}) berhasil diunggah (${compressed.sizeKb} KB)!`
        );
      } else {
        showToast('Penyimpanan lokal penuh. Hapus beberapa foto kustom atau cadangkan data.', 'error');
      }
    } catch (err: any) {
      console.error('Sleeping image upload failed:', err);
      showToast('Gagal memproses gambar tidur: ' + (err?.message || 'Format tidak didukung'), 'error');
    } finally {
      setUploadingSleepingStage(null);
      if (inputElement) inputElement.value = '';
    }
  };

  const handleSpeciesSleepingImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentSpecies) return;

    const inputElement = e.target;
    setUploadingSpeciesSleeping(true);

    try {
      const compressed = await compressImageFile(file, 320, 0.82);
      const updated = {
        ...currentSpecies,
        sleepingImageUrl: compressed.dataUrl
      };

      const saved = storageService.saveSpecies(updated);
      if (saved) {
        refreshData();
        showToast(`Foto tidur utama spesies ${currentSpecies.name} berhasil diunggah (${compressed.sizeKb} KB)!`);
      } else {
        showToast('Penyimpanan lokal penuh. Hapus beberapa foto kustom atau cadangkan data.', 'error');
      }
    } catch (err: any) {
      console.error('Species sleeping image upload failed:', err);
      showToast('Gagal memproses gambar tidur: ' + (err?.message || 'Format tidak didukung'), 'error');
    } finally {
      setUploadingSpeciesSleeping(false);
      if (inputElement) inputElement.value = '';
    }
  };

  const handleClearSpeciesSleepingImage = () => {
    if (!currentSpecies) return;
    const updated = { ...currentSpecies };
    delete updated.sleepingImageUrl;
    storageService.saveSpecies(updated);
    refreshData();
    showToast(`Foto tidur utama spesies ${currentSpecies.name} telah dihapus.`);
  };

  const handleClearImage = (stageIdx: PetEvolutionStageIndex) => {
    if (!currentSpecies) return;
    const updated = {
      ...currentSpecies,
      stages: [...currentSpecies.stages] as [PetStageConfig, PetStageConfig, PetStageConfig, PetStageConfig]
    };
    const stageCopy = { ...updated.stages[stageIdx] };
    delete stageCopy.imageUrl;
    updated.stages[stageIdx] = stageCopy;
    storageService.saveSpecies(updated);
    refreshData();
    showToast(`Foto bangun tahap ${stageIdx + 1} dihapus, dikembalikan ke vektor asli.`);
  };

  const handleClearSleepingImage = (stageIdx: PetEvolutionStageIndex) => {
    if (!currentSpecies) return;
    const updated = {
      ...currentSpecies,
      stages: [...currentSpecies.stages] as [PetStageConfig, PetStageConfig, PetStageConfig, PetStageConfig]
    };
    const stageCopy = { ...updated.stages[stageIdx] };
    delete stageCopy.sleepingImageUrl;
    updated.stages[stageIdx] = stageCopy;
    storageService.saveSpecies(updated);
    refreshData();
    showToast(`Foto tidur tahap ${stageIdx + 1} dihapus.`);
  };

  const handleUpdateStageThreshold = (stageIdx: PetEvolutionStageIndex, minLevel: number, minStars: number) => {
    if (!currentSpecies) return;
    const updated = {
      ...currentSpecies,
      stages: [...currentSpecies.stages] as [PetStageConfig, PetStageConfig, PetStageConfig, PetStageConfig]
    };
    updated.stages[stageIdx].minLevel = minLevel;
    updated.stages[stageIdx].minStars = minStars;
    storageService.saveSpecies(updated);
    refreshData();
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.nisn.includes(studentSearch);
    const matchesClass = classFilter === 'all' || s.className === classFilter;
    return matchesSearch && matchesClass;
  });

  const uniqueClasses = Array.from(new Set(students.map((s) => s.className)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-20">
      {/* Top Welcome Card */}
      <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-6 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 text-9xl opacity-15 select-none pointer-events-none">
          🐾
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                Panel Guru & Wali Kelas
              </span>
              <button
                type="button"
                onClick={() => setShowMyHeaderPin(!showMyHeaderPin)}
                className="text-xs bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold px-2.5 py-0.5 rounded-full transition flex items-center gap-1 cursor-pointer shadow-xs"
                title={showMyHeaderPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
              >
                <span>PIN: {showMyHeaderPin ? teacher.pin : '••••'}</span>
                {showMyHeaderPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading mt-2">
              Selamat Bertugas, {teacher.name}!
            </h1>
            <p className="text-xs sm:text-sm text-amber-100 max-w-2xl mt-1">
              Kelola database siswa, berikan apresiasi reward bintang real-time, atur evolusi pet gallery, dan pantau perkembangan karakter anak didik.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="bg-white/95 rounded-xl shadow-lg p-0.5">
              <ThemeSelector />
            </div>
            <button
              onClick={() => setActiveTab('backup')}
              className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg transition active:scale-95 cursor-pointer ${
                activeTab === 'backup'
                  ? 'bg-amber-900 text-white border border-amber-300'
                  : 'bg-white hover:bg-amber-50 text-amber-900'
              }`}
            >
              <Database className="w-4 h-4 text-amber-600" />
              <span>💾 Backup & Restore Data</span>
            </button>
            <button
              onClick={() => onOpenQR()}
              className="px-4 py-2.5 bg-white/90 hover:bg-white text-amber-800 active:scale-95 text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg transition cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-amber-600" />
              <span>Bagikan Link Siswa</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none border-b border-slate-200">
        {[
          { id: 'students', label: 'Database Siswa (CRUD)', icon: Users, count: students.length },
          { id: 'teachers', label: 'Database Guru & PIN (CRUD)', icon: Shield, count: teachers.length },
          { id: 'minigames', label: '🎮 Kelola & Kunci Mini Game', icon: Gamepad2, count: miniGameConfig.isAllLocked ? '🔒 Kunci' : `${miniGameConfig.customTriviaQuestions.length} Soal` },
          { id: 'gallery', label: 'Pet Gallery (CRUD)', icon: Sparkles, count: speciesList.length },
          { id: 'shop', label: 'Pet Shop (CRUD)', icon: ShoppingBag, count: shopItems.length },
          { id: 'rewards', label: 'Reward & Pengurangan (CRUD)', icon: Award, count: rewardCategories.length + deductionCategories.length },
          { id: 'needs', label: 'Keinginan Pet (CRUD)', icon: Heart, count: petNeeds.length },
          { id: 'logs', label: 'Audit Log & Undo', icon: RotateCcw, count: auditLogs.length },
          { id: 'backup', label: '💾 Backup & Restore Data', icon: Database, count: 'JSON' }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shadow-xs cursor-pointer ${
                isActive
                  ? 'bg-amber-500 text-white shadow-amber-500/30'
                  : 'bg-white hover:bg-amber-50 text-slate-600 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/30 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Floating CRUD Toast Notification */}
      {crudToast && (
        <div
          className={`mb-4 p-3.5 rounded-2xl border-2 text-xs font-bold flex items-center justify-between shadow-md animate-fadeIn ${
            crudToast.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-rose-50 border-rose-300 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{crudToast.message}</span>
          </div>
          <button
            onClick={() => setCrudToast(null)}
            className="text-xs px-2 py-0.5 rounded-md hover:bg-black/5"
          >
            ✕
          </button>
        </div>
      )}

      {/* TAB 1: DATABASE SISWA (CRUD) */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 flex-1 max-w-lg">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama atau NISN siswa..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-amber-400 font-medium"
                />
              </div>

              {/* Class Filter */}
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="py-2 px-3 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-bold outline-none focus:border-amber-400"
              >
                <option value="all">Semua Kelas</option>
                {uniqueClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* View Mode Toggle & Actions Bar */}
            <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
              {/* Batch Action: Hapus Terpilih */}
              {selectedStudentIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleDeleteSelectedStudents}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition cursor-pointer"
                  title="Hapus semua siswa yang dicentang dari database"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus ({selectedStudentIds.length}) Siswa</span>
                </button>
              )}

              {/* Kosongkan Seluruh Siswa */}
              {students.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllStudents}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                  title="Hapus seluruh data siswa di database (kosongkan)"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span className="hidden sm:inline">Kosongkan Database Siswa</span>
                  <span className="sm:hidden">Kosongkan DB</span>
                </button>
              )}

              {/* Muat Siswa Contoh (Demo) */}
              {students.length === 0 && (
                <button
                  type="button"
                  onClick={handleResetSampleStudents}
                  className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                  title="Muat kembali 12 data siswa contoh"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                  <span>Muat Siswa Contoh</span>
                </button>
              )}

              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setStudentViewMode('table')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                    studentViewMode === 'table'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Tampilan Tabel Database (Excel/Dapodik)"
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>Tabel</span>
                </button>
                <button
                  onClick={() => setStudentViewMode('card')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                    studentViewMode === 'card'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Tampilan Kartu Siswa"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Kartu</span>
                </button>
              </div>

              <button
                onClick={() => {
                  setEditingStudent(null);
                  setStudentForm({
                    name: '',
                    nisn: '',
                    className: 'Kelas 4A',
                    petSpeciesId: 'kucing',
                    petNickname: '',
                    stars: 5,
                    level: 1
                  });
                  setShowAddStudentModal(true);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow transition active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Tambah Siswa</span>
              </button>
            </div>
          </div>

          {/* TABLE VIEW (TABEL DATABASE SISWA) */}
          {studentViewMode === 'table' && filteredStudents.length > 0 && (
            <div className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-600 uppercase tracking-wider">
                      <th className="py-3 px-3 text-center w-10">
                        <input
                          type="checkbox"
                          checked={filteredStudents.length > 0 && filteredStudents.every((s) => selectedStudentIds.includes(s.id))}
                          onChange={() => toggleSelectAllStudents(filteredStudents)}
                          className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
                          title="Pilih / Batalkan Semua Siswa"
                        />
                      </th>
                      <th className="py-3 px-2 text-center">No</th>
                      <th className="py-3 px-4">NISN (Login)</th>
                      <th className="py-3 px-4">Nama Siswa</th>
                      <th className="py-3 px-3">Kelas</th>
                      <th className="py-3 px-4">Hewan Peliharaan</th>
                      <th className="py-3 px-3.5">Saldo Bintang</th>
                      <th className="py-3 px-4">Level & Evolusi</th>
                      <th className="py-3 px-4 text-center">Aksi CRUD & Reward</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium">
                    {filteredStudents.map((s, idx) => {
                      const spec = speciesList.find((sp) => sp.id === s.petSpeciesId) || speciesList[0];
                      const stage = spec.stages[s.evolutionStage] || spec.stages[0];
                      const isSelected = selectedStudentIds.includes(s.id);

                      return (
                        <tr key={s.id} className={`hover:bg-amber-50/40 transition ${isSelected ? 'bg-amber-50/70' : ''}`}>
                          <td className="py-3 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectStudent(s.id)}
                              className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400 cursor-pointer"
                              title={`Pilih ${s.name}`}
                            />
                          </td>
                          <td className="py-3 px-2 text-center font-bold text-slate-400 font-mono">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-4 font-mono font-extrabold text-slate-800">
                            {s.nisn}
                          </td>
                          <td className="py-3 px-4 font-extrabold text-slate-900">
                            {s.name}
                          </td>
                          <td className="py-3 px-3">
                            <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full text-[11px]">
                              {s.className}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5 font-bold text-slate-800">
                              <span>🐾</span>
                              <span>{s.petNickname}</span>
                              <span className="text-slate-400 font-normal text-[11px]">({spec.name})</span>
                            </div>
                          </td>
                          <td className="py-3 px-3.5">
                            <span className="bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 font-black px-2.5 py-1 rounded-full text-xs shadow-2xs inline-flex items-center gap-1 border border-amber-300">
                              <span>⭐</span>
                              <span>{s.stars}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-extrabold text-indigo-700">
                              Level {s.level}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {stage.name} ({s.xp} XP)
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              {/* Beri Bintang */}
                              <button
                                onClick={() => {
                                  setActionTargetStudent(s);
                                  setSelectedRewardCatId(rewardCategories[0]?.id || '');
                                  setShowAwardModal(true);
                                }}
                                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-[11px] rounded-lg border border-amber-300 transition"
                                title="Beri Apresiasi Bintang"
                              >
                                +⭐ Beri
                              </button>

                              {/* Kurang Poin */}
                              <button
                                onClick={() => {
                                  setActionTargetStudent(s);
                                  setSelectedDeductCatId(deductionCategories[0]?.id || '');
                                  setShowDeductModal(true);
                                }}
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-[11px] rounded-lg border border-rose-300 transition"
                                title="Pengurangan Poin"
                              >
                                -⭐ Kurang
                              </button>

                              {/* Edit CRUD */}
                              <button
                                onClick={() => {
                                  setEditingStudent(s);
                                  setStudentForm({
                                    name: s.name,
                                    nisn: s.nisn,
                                    className: s.className,
                                    petSpeciesId: s.petSpeciesId,
                                    petNickname: s.petNickname,
                                    stars: s.stars,
                                    level: s.level
                                  });
                                  setShowAddStudentModal(true);
                                }}
                                className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-[11px] rounded-lg border border-sky-300 transition flex items-center gap-1"
                                title="Edit Data Siswa"
                              >
                                <Edit2 className="w-3 h-3 text-sky-600" />
                                <span>Edit</span>
                              </button>

                              {/* Hapus CRUD */}
                              <button
                                onClick={() => handleDeleteStudent(s.id, s.name)}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] rounded-lg border border-rose-300 transition flex items-center gap-1"
                                title="Hapus Siswa dari Database"
                              >
                                <Trash2 className="w-3 h-3 text-rose-600" />
                                <span>Hapus</span>
                              </button>

                              {/* QR Link */}
                              <button
                                onClick={() => onOpenQR(s)}
                                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 transition"
                                title="Bagikan QR Link Siswa"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Login Pet */}
                              <button
                                onClick={() => onLoginAsStudent(s)}
                                className="p-1 rounded-lg hover:bg-amber-100 text-amber-700 transition"
                                title="Buka Akun Pet Siswa"
                              >
                                <Gamepad2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CARD VIEW (TAMPILAN KARTU SISWA) */}
          {studentViewMode === 'card' && filteredStudents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map((s) => {
                const spec = speciesList.find((sp) => sp.id === s.petSpeciesId) || speciesList[0];
                const stage = spec.stages[s.evolutionStage] || spec.stages[0];

                const isSelected = selectedStudentIds.includes(s.id);

                return (
                  <div
                    key={s.id}
                    className={`bg-white rounded-3xl p-5 border-2 transition shadow-sm hover:shadow-md flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-400 bg-amber-50/30 shadow-md ring-2 ring-amber-300'
                        : 'border-slate-200 hover:border-amber-300'
                    }`}
                  >
                    <div>
                      {/* Top Row: Info & Avatar */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectStudent(s.id)}
                            className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400 cursor-pointer shrink-0"
                            title={`Pilih ${s.name}`}
                          />
                          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center overflow-hidden shrink-0">
                            <PetRenderer
                              species={spec}
                              stageIndex={s.evolutionStage}
                              isSleeping={s.isSleeping}
                              scale={0.4}
                            />
                          </div>
                          <div>
                            <h3 className="font-extrabold font-heading text-slate-800 text-base leading-tight">
                              {s.name}
                            </h3>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5 font-medium">
                              <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                                NISN: {s.nisn}
                              </span>
                              <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                                {s.className}
                              </span>
                            </div>
                            <div className="text-xs text-amber-700 font-bold mt-1">
                              🐾 {s.petNickname} ({spec.name})
                            </div>
                          </div>
                        </div>

                        {/* Stars Badge */}
                        <div className="bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 font-black text-sm px-3 py-1 rounded-full shadow-xs flex items-center gap-1 shrink-0 border border-amber-300">
                          <span>⭐</span>
                          <span>{s.stars}</span>
                        </div>
                      </div>

                      {/* Level & Evolution bar */}
                      <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex justify-between items-center text-xs font-bold mb-1">
                          <span className="text-slate-700">
                            Level {s.level} - {stage.name}
                          </span>
                          <span className="text-indigo-600 font-extrabold">{s.xp} XP</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (s.xp % 300) / 3)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
                      {/* Quick Star Award & Deduct */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setActionTargetStudent(s);
                            setSelectedRewardCatId(rewardCategories[0]?.id || '');
                            setShowAwardModal(true);
                          }}
                          className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1 border border-amber-200 transition"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          <span>+ Beri Bintang</span>
                        </button>

                        <button
                          onClick={() => {
                            setActionTargetStudent(s);
                            setSelectedDeductCatId(deductionCategories[0]?.id || '');
                            setShowDeductModal(true);
                          }}
                          className="py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1 border border-rose-200 transition"
                        >
                          <MinusCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>- Kurangi Poin</span>
                        </button>
                      </div>

                      {/* CRUD Actions */}
                      <div className="flex items-center justify-between gap-1 pt-1">
                        <div className="flex items-center gap-1 text-slate-500">
                          <button
                            onClick={() => onOpenQR(s)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 hover:text-amber-600 transition flex items-center gap-1 text-[11px] font-bold"
                            title="Bagikan QR Link Siswa"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>QR Link</span>
                          </button>

                          <button
                            onClick={() => onLoginAsStudent(s)}
                            className="p-1.5 rounded-lg hover:bg-sky-50 text-sky-700 transition flex items-center gap-1 text-[11px] font-bold"
                            title="Buka Dasbor Siswa Ini"
                          >
                            <Gamepad2 className="w-3.5 h-3.5" />
                            <span>Pet</span>
                          </button>
                        </div>

                        {/* Explicit CRUD Buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingStudent(s);
                              setStudentForm({
                                name: s.name,
                                nisn: s.nisn,
                                className: s.className,
                                petSpeciesId: s.petSpeciesId,
                                petNickname: s.petNickname,
                                stars: s.stars,
                                level: s.level
                              });
                              setShowAddStudentModal(true);
                            }}
                            className="px-2.5 py-1 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 transition text-xs font-extrabold flex items-center gap-1"
                            title="Edit Data Siswa (CRUD)"
                          >
                            <Edit2 className="w-3 h-3 text-sky-600" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteStudent(s.id, s.name)}
                            className="px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 transition text-xs font-extrabold flex items-center gap-1"
                            title="Hapus Siswa (CRUD)"
                          >
                            <Trash2 className="w-3 h-3 text-rose-600" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {students.length === 0 && (
            <div className="text-center py-12 px-6 bg-white rounded-3xl border-2 border-dashed border-amber-300 shadow-sm max-w-xl mx-auto my-6 animate-fadeIn">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
                👥
              </div>
              <h3 className="text-lg font-black font-heading text-slate-800">
                Database Siswa Saat Ini Kosong (0 Siswa)
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
                Database siswa Anda telah bersih tanpa data siswa. Anda dapat menambahkan siswa baru satu per satu untuk kelas nyata Anda, atau memuat 12 siswa contoh kapan saja.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingStudent(null);
                    setStudentForm({
                      name: '',
                      nisn: '',
                      className: 'Kelas 4A',
                      petSpeciesId: 'kucing',
                      petNickname: '',
                      stars: 5,
                      level: 1
                    });
                    setShowAddStudentModal(true);
                  }}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-md transition active:scale-95 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Tambah Siswa Baru</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetSampleStudents}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl flex items-center gap-2 border border-slate-300 transition active:scale-95 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-slate-600" />
                  <span>Muat 12 Siswa Contoh (Demo)</span>
                </button>
              </div>
            </div>
          )}

          {students.length > 0 && filteredStudents.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
              <p className="text-sm text-slate-500 font-medium">
                Tidak ada data siswa yang cocok dengan pencarian "{studentSearch}".
              </p>
              <button
                type="button"
                onClick={() => {
                  setStudentSearch('');
                  setClassFilter('all');
                }}
                className="mt-2 text-xs font-bold text-amber-600 hover:underline cursor-pointer"
              >
                Reset Filter Pencarian
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DATABASE GURU & PIN */}
      {activeTab === 'teachers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Manajemen Akun Guru & Akses PIN
              </h3>
              <p className="text-xs text-slate-500">
                Ubah PIN, tambah pengajar baru, atau hapus akun guru lama (minimal tersisa 1 akun).
              </p>
            </div>
            <button
              onClick={() => {
                setEditingTeacher(null);
                setTeacherForm({ name: '', pin: '', email: '' });
                setShowAddTeacherModal(true);
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Guru / PIN</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachers.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg">
                      👨‍🏫
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setRevealedTeacherPins((prev) => ({
                          ...prev,
                          [t.id]: !prev[t.id]
                        }))
                      }
                      className="text-xs font-mono font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-full flex items-center gap-1 transition cursor-pointer"
                      title={revealedTeacherPins[t.id] ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
                    >
                      <span>PIN: {revealedTeacherPins[t.id] ? t.pin : '••••'}</span>
                      {revealedTeacherPins[t.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  </div>
                  <h4 className="font-extrabold font-heading text-slate-800 text-base mt-3">
                    {t.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">{t.email || 'Tanpa email'}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditingTeacher(t);
                      setTeacherForm({ name: t.name, pin: t.pin, email: t.email || '' });
                      setShowAddTeacherModal(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Ubah PIN</span>
                  </button>
                  <button
                    onClick={() => handleDeleteTeacher(t.id, t.name)}
                    disabled={teachers.length <= 1}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 disabled:opacity-30 disabled:pointer-events-none transition"
                    title="Hapus Akun"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PET GALLERY (4 TAHAP PERTUMBUHAN) */}
      {activeTab === 'gallery' && (
        <div className="space-y-6">
          {/* Species Selector Bar with Add Button */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1 overflow-hidden">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Pilih Spesies Hewan Peliharaan ({speciesList.length} Spesies):
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {speciesList.map((sp) => {
                  const isSelected = sp.id === selectedSpeciesId;
                  return (
                    <button
                      key={sp.id}
                      onClick={() => setSelectedSpeciesId(sp.id)}
                      className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                        isSelected
                          ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                          : 'bg-slate-50 hover:bg-amber-50 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <span>{sp.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => {
                setEditingSpecies(null);
                setSpeciesForm({
                  name: '',
                  category: 'mamalia',
                  description: '',
                  stage0Name: 'Telur / Bayi',
                  stage1Name: 'Anak-anak',
                  stage2Name: 'Remaja Ceria',
                  stage3Name: 'Dewasa Juara'
                });
                setShowAddSpeciesModal(true);
              }}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold rounded-xl shadow flex items-center justify-center gap-1.5 transition active:scale-95 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Tambah Spesies Pet</span>
            </button>
          </div>

          {/* Current Species 4 Evolution Stages Display */}
          {currentSpecies && (
            <div className="bg-white rounded-3xl p-6 border-2 border-amber-200 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-extrabold font-heading text-slate-800">
                      {currentSpecies.name}
                    </h3>
                    <button
                      onClick={() => {
                        setEditingSpecies(currentSpecies);
                        setSpeciesForm({
                          name: currentSpecies.name,
                          category: currentSpecies.category,
                          description: currentSpecies.description,
                          stage0Name: currentSpecies.stages[0]?.name || 'Telur / Bayi',
                          stage1Name: currentSpecies.stages[1]?.name || 'Anak-anak',
                          stage2Name: currentSpecies.stages[2]?.name || 'Remaja Ceria',
                          stage3Name: currentSpecies.stages[3]?.name || 'Dewasa Juara'
                        });
                        setShowAddSpeciesModal(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 text-[11px] font-bold flex items-center gap-1 transition"
                      title="Edit Informasi Spesies (CRUD)"
                    >
                      <Edit2 className="w-3 h-3 text-sky-600" />
                      <span>Edit Spesies</span>
                    </button>
                    {speciesList.length > 1 && (
                      <button
                        onClick={() => handleDeleteSpecies(currentSpecies.id, currentSpecies.name)}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-[11px] font-bold flex items-center gap-1 transition"
                        title="Hapus Spesies Ini dari Database"
                      >
                        <Trash2 className="w-3 h-3 text-rose-600" />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {currentSpecies.description} (Kategori: {currentSpecies.category})
                  </p>

                  {/* Species-wide Default Sleeping Image */}
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 flex-wrap">
                    <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                      <Moon className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Foto Tidur Utama Spesies (Zzz):</span>
                    </span>
                    {currentSpecies.sleepingImageUrl ? (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-950/20 border border-indigo-200 overflow-hidden flex items-center justify-center">
                          <img src={currentSpecies.sleepingImageUrl} alt="Foto Tidur Spesies" className="max-h-full max-w-full object-contain" />
                        </div>
                        <span className="text-xs font-extrabold text-indigo-700">Tersedia ✓</span>
                        <button
                          type="button"
                          onClick={handleClearSpeciesSleepingImage}
                          className="text-[11px] text-rose-500 hover:underline font-bold cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Belum disetel</span>
                    )}

                    <label className={`py-1 px-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-bold flex items-center gap-1 transition cursor-pointer ${
                      uploadingSpeciesSleeping ? 'opacity-60 pointer-events-none' : ''
                    }`}>
                      <Moon className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{uploadingSpeciesSleeping ? 'Mengompres...' : currentSpecies.sleepingImageUrl ? 'Ganti Foto Tidur' : '+ Unggah Foto Tidur Utama'}</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        onChange={handleSpeciesSleepingImageUpload}
                        className="hidden"
                        disabled={uploadingSpeciesSleeping}
                      />
                    </label>
                  </div>
                </div>
                <div className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                  4 Tahap Pertumbuhan: Telur/Bayi ➔ Anak ➔ Remaja ➔ Dewasa
                </div>
              </div>

              {/* 4 Stages Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {currentSpecies.stages.map((stg, sIdx) => {
                  const stageNum = sIdx as PetEvolutionStageIndex;
                  const stageLabels = ['Tahap 1: Telur / Bayi', 'Tahap 2: Anak-anak', 'Tahap 3: Remaja Ceria', 'Tahap 4: Dewasa Juara (MVP)'];
                  const isSleepingPreview = stagePreviewMode[stageNum] === 'sleeping';

                  return (
                    <div
                      key={sIdx}
                      className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-[11px] font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md inline-block">
                            {stageLabels[sIdx]}
                          </div>

                          {/* Quick Toggle Preview: Bangun vs Tidur */}
                          <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
                            <button
                              type="button"
                              onClick={() => setStagePreviewMode((prev) => ({ ...prev, [stageNum]: 'awake' }))}
                              className={`px-2 py-0.5 rounded transition cursor-pointer ${
                                !isSleepingPreview
                                  ? 'bg-amber-400 text-amber-950 shadow-xs'
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                              title="Lihat tampilan saat bangun"
                            >
                              ☀️ Bangun
                            </button>
                            <button
                              type="button"
                              onClick={() => setStagePreviewMode((prev) => ({ ...prev, [stageNum]: 'sleeping' }))}
                              className={`px-2 py-0.5 rounded transition cursor-pointer ${
                                isSleepingPreview
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                              title="Lihat tampilan saat tidur (Zzz)"
                            >
                              🌙 Tidur
                            </button>
                          </div>
                        </div>

                        {/* Pet Stage Visualizer */}
                        <div className={`w-full h-36 rounded-xl border flex items-center justify-center relative overflow-hidden mb-3 transition-colors ${
                          isSleepingPreview
                            ? 'bg-indigo-950/20 border-indigo-300'
                            : 'bg-white border-slate-200'
                        }`}>
                          <PetRenderer
                            species={currentSpecies}
                            stageIndex={stageNum}
                            isSleeping={isSleepingPreview}
                            scale={0.7}
                          />
                          {isSleepingPreview ? (
                            <span className="absolute bottom-1 right-2 text-[9px] bg-indigo-900/80 text-yellow-200 px-1.5 py-0.5 rounded font-mono flex items-center gap-0.5">
                              <span>💤</span>
                              <span>{stg.sleepingImageUrl ? 'Foto Tidur Kustom' : currentSpecies.sleepingImageUrl ? 'Foto Tidur Utama' : 'Vektor Tidur'}</span>
                            </span>
                          ) : stg.imageUrl ? (
                            <span className="absolute bottom-1 right-2 text-[9px] bg-slate-800/70 text-white px-1.5 py-0.5 rounded font-mono">
                              Foto Bangun Kustom
                            </span>
                          ) : (
                            <span className="absolute bottom-1 right-2 text-[9px] bg-slate-700/60 text-slate-200 px-1.5 py-0.5 rounded font-mono">
                              Vektor Asli
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-sm text-slate-800">{stg.name}</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {stg.description}
                        </p>
                      </div>

                      {/* Threshold & Upload Settings */}
                      <div className="mt-4 pt-3 border-t border-slate-200 space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 font-medium">Batas Level:</span>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={stg.minLevel}
                            onChange={(e) =>
                              handleUpdateStageThreshold(stageNum, Number(e.target.value), stg.minStars)
                            }
                            className="w-14 text-center py-1 px-1 bg-white border border-slate-300 rounded font-bold text-xs"
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-600 font-medium">Batas Bintang:</span>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={stg.minStars}
                            onChange={(e) =>
                              handleUpdateStageThreshold(stageNum, stg.minLevel, Number(e.target.value))
                            }
                            className="w-14 text-center py-1 px-1 bg-white border border-slate-300 rounded font-bold text-xs"
                          />
                        </div>

                        {/* Upload Awake/Normal Image */}
                        <div className="pt-2 border-t border-slate-200">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 mb-1">
                            <span>☀️ Foto Saat Bangun:</span>
                            {stg.imageUrl ? (
                              <span className="text-emerald-600 font-extrabold">Kustom ✓</span>
                            ) : (
                              <span className="text-slate-400">Vektor</span>
                            )}
                          </div>
                          <label
                            className={`w-full py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold rounded-lg border border-amber-200 cursor-pointer flex items-center justify-center gap-1 transition ${
                              uploadingStage === stageNum ? 'opacity-60 pointer-events-none' : ''
                            }`}
                          >
                            <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                            <span>
                              {uploadingStage === stageNum ? 'Mengompres...' : 'Unggah Foto Bangun'}
                            </span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp,image/gif"
                              onChange={(e) => handleImageUpload(stageNum, e)}
                              className="hidden"
                              disabled={uploadingStage === stageNum}
                            />
                          </label>

                          {stg.imageUrl && (
                            <button
                              type="button"
                              onClick={() => handleClearImage(stageNum)}
                              className="w-full text-center text-[10px] text-rose-500 hover:underline mt-0.5 cursor-pointer font-bold"
                            >
                              Reset Foto Bangun
                            </button>
                          )}
                        </div>

                        {/* Upload Sleeping / Tidur Image */}
                        <div className="pt-2 border-t border-slate-200">
                          <div className="flex items-center justify-between text-[10px] font-bold text-indigo-900 mb-1">
                            <span>🌙 Foto Saat Tidur (Zzz):</span>
                            {stg.sleepingImageUrl ? (
                              <span className="text-indigo-600 font-extrabold">Kustom ✓</span>
                            ) : (
                              <span className="text-slate-400">Vektor / Otomatis</span>
                            )}
                          </div>

                          {stg.sleepingImageUrl && (
                            <div className="w-full h-16 bg-indigo-950/20 rounded-lg border border-indigo-200 mb-1.5 flex items-center justify-center relative overflow-hidden">
                              <img
                                src={stg.sleepingImageUrl}
                                alt="Foto Tidur"
                                className="max-h-full max-w-full object-contain"
                              />
                              <span className="absolute top-1 right-1 text-xs">💤</span>
                            </div>
                          )}

                          <label
                            className={`w-full py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-[11px] font-bold rounded-lg border border-indigo-200 cursor-pointer flex items-center justify-center gap-1 transition ${
                              uploadingSleepingStage === stageNum ? 'opacity-60 pointer-events-none' : ''
                            }`}
                          >
                            <Moon className="w-3.5 h-3.5 text-indigo-600" />
                            <span>
                              {uploadingSleepingStage === stageNum ? 'Mengompres...' : 'Unggah Foto Tidur'}
                            </span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp,image/gif"
                              onChange={(e) => handleSleepingImageUpload(stageNum, e)}
                              className="hidden"
                              disabled={uploadingSleepingStage === stageNum}
                            />
                          </label>

                          {stg.sleepingImageUrl && (
                            <button
                              type="button"
                              onClick={() => handleClearSleepingImage(stageNum)}
                              className="w-full text-center text-[10px] text-rose-500 hover:underline mt-0.5 cursor-pointer font-bold"
                            >
                              Reset Foto Tidur
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PET SHOP (CRUD) */}
      {activeTab === 'shop' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            {/* Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {['all', 'makanan', 'minuman', 'sabun', 'mainan', 'aksesoris'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setShopCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                    shopCategoryFilter === cat
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-amber-50'
                  }`}
                >
                  {cat === 'all' ? 'Semua Kategori' : cat}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setEditingShopItem(null);
                setShopItemForm({
                  name: '',
                  category: 'makanan',
                  price: 1,
                  icon: '🍎',
                  description: '',
                  unlockLevel: 1,
                  inStock: true,
                  boosts: { hunger: 25, happiness: 10 }
                });
                setShowAddShopModal(true);
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Item Baru</span>
            </button>
          </div>

          {/* Shop Item Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {shopItems
              .filter((i) => shopCategoryFilter === 'all' || i.category === shopCategoryFilter)
              .map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-5 border-2 border-slate-200 hover:border-amber-300 transition shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-3xl shadow-inner">
                        {item.icon}
                      </div>
                      <span className="bg-amber-100 text-amber-900 font-extrabold text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                        <span>⭐</span>
                        <span>{item.price}</span>
                      </span>
                    </div>

                    <h4 className="font-extrabold font-heading text-slate-800 text-sm mt-3">
                      {item.name}
                    </h4>
                    <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Stat Boosts Badge */}
                    <div className="mt-3 flex flex-wrap gap-1 text-[11px] font-bold">
                      {item.boosts.hunger && (
                        <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
                          🍖 +{item.boosts.hunger}
                        </span>
                      )}
                      {item.boosts.thirst && (
                        <span className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded border border-sky-200">
                          💧 +{item.boosts.thirst}
                        </span>
                      )}
                      {item.boosts.hygiene && (
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                          🧼 +{item.boosts.hygiene}
                        </span>
                      )}
                      {item.boosts.happiness && (
                        <span className="bg-pink-50 text-pink-700 px-2 py-0.5 rounded border border-pink-200">
                          🎾 +{item.boosts.happiness}
                        </span>
                      )}
                      {item.boosts.energy && (
                        <span className="bg-yellow-50 text-yellow-800 px-2 py-0.5 rounded border border-yellow-200">
                          ⚡ +{item.boosts.energy}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        item.inStock
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.inStock ? 'Tersedia' : 'Habis'}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingShopItem(item);
                          setShopItemForm({ ...item });
                          setShowAddShopModal(true);
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteModal({
                            title: 'Hapus Item Pet Shop',
                            itemName: item.name,
                            itemType: 'Item Toko',
                            warningText: 'Item ini akan ditarik dari etalase toko dan tidak bisa dibeli lagi oleh siswa.',
                            onConfirm: () => {
                              storageService.deleteShopItem(item.id);
                              showToast(`Item "${item.name}" berhasil dihapus dari Pet Shop.`);
                              refreshData();
                              setDeleteModal(null);
                            }
                          });
                        }}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 transition"
                        title="Hapus Item (CRUD)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 5: REWARD & PENGURANGAN POIN */}
      {activeTab === 'rewards' && (
        <div className="space-y-6">
          {/* Apresiasi Bintang Categories */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold font-heading text-slate-800 text-base flex items-center gap-2">
                  <span>⭐ Kategori Apresiasi Bintang (Reward)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Daftar kriteria pemberian bintang saat siswa berprestasi atau berbuat baik.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingRewardCat(null);
                  setRewardCatForm({ name: '', stars: 3, icon: '🌟', description: '' });
                  setShowAddRewardCatModal(true);
                }}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Kategori</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {rewardCategories.map((rc) => (
                <div
                  key={rc.id}
                  className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl shrink-0 p-1.5 bg-amber-100 rounded-xl">{rc.icon}</span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">{rc.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">{rc.description}</p>
                      <span className="mt-2 inline-block bg-amber-400 text-amber-950 font-black text-xs px-2.5 py-0.5 rounded-full">
                        +{rc.stars} Bintang ⭐
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingRewardCat(rc);
                        setRewardCatForm({ name: rc.name, stars: rc.stars, icon: rc.icon, description: rc.description });
                        setShowAddRewardCatModal(true);
                      }}
                      className="text-slate-400 hover:text-sky-600 p-1.5 rounded-lg hover:bg-sky-50 transition"
                      title="Edit Kategori Reward (CRUD)"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteModal({
                          title: 'Hapus Kategori Apresiasi',
                          itemName: rc.name,
                          itemType: 'Kategori Reward',
                          warningText: 'Kategori apresiasi bintang ini akan dihapus dari daftar opsi penilaian guru.',
                          onConfirm: () => {
                            storageService.deleteRewardCategory(rc.id);
                            showToast(`Kategori reward "${rc.name}" berhasil dihapus.`);
                            refreshData();
                            setDeleteModal(null);
                          }
                        });
                      }}
                      className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition"
                      title="Hapus Kategori Reward (CRUD)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pengurangan Poin Categories */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold font-heading text-slate-800 text-base flex items-center gap-2">
                  <span>⚠️ Kategori Pengurangan Bintang (Pelanggaran)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Kriteria pengurangan poin saat siswa lupa tugas, melanggar ketertiban, dll.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingDeductCat(null);
                  setDeductCatForm({ name: '', stars: 1, icon: '⚠️', description: '' });
                  setShowAddDeductCatModal(true);
                }}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Pelanggaran</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {deductionCategories.map((dc) => (
                <div
                  key={dc.id}
                  className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl shrink-0 p-1.5 bg-rose-100 rounded-xl">{dc.icon}</span>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">{dc.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">{dc.description}</p>
                      <span className="mt-2 inline-block bg-rose-600 text-white font-black text-xs px-2.5 py-0.5 rounded-full">
                        -{dc.stars} Bintang
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingDeductCat(dc);
                        setDeductCatForm({ name: dc.name, stars: dc.stars, icon: dc.icon, description: dc.description });
                        setShowAddDeductCatModal(true);
                      }}
                      className="text-slate-400 hover:text-sky-600 p-1.5 rounded-lg hover:bg-sky-50 transition"
                      title="Edit Kategori Pelanggaran (CRUD)"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteModal({
                          title: 'Hapus Kategori Pelanggaran',
                          itemName: dc.name,
                          itemType: 'Kategori Pelanggaran',
                          warningText: 'Kategori pelanggaran ini akan dihapus dari daftar konsekuensi siswa.',
                          onConfirm: () => {
                            storageService.deleteDeductionCategory(dc.id);
                            showToast(`Kategori pengurangan "${dc.name}" berhasil dihapus.`);
                            refreshData();
                            setDeleteModal(null);
                          }
                        });
                      }}
                      className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition"
                      title="Hapus Kategori Pelanggaran (CRUD)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: KEINGINAN PET (CRUD) */}
      {activeTab === 'needs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Kelola Daftar Keinginan / Kebutuhan Pet
              </h3>
              <p className="text-xs text-slate-500">
                Keinginan ini akan muncul secara acak saat siswa menyentuh (tap) hewan peliharaannya.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingNeed(null);
                setNeedForm({
                  text: '',
                  icon: '🍎',
                  category: 'makanan',
                  rewardXp: 35,
                  rewardProgress: 20
                });
                setShowAddNeedModal(true);
              }}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Keinginan Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {petNeeds.map((need) => (
              <div
                key={need.id}
                className="bg-white rounded-3xl p-5 border-2 border-slate-200 hover:border-amber-300 transition shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl p-2 bg-amber-50 rounded-2xl border border-amber-200">
                      {need.icon}
                    </span>
                    <span className="text-xs font-bold uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                      {need.category}
                    </span>
                  </div>

                  <p className="font-bold text-slate-800 text-sm mt-3 leading-relaxed">
                    "{need.text}"
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-xs font-bold">
                    <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      +{need.rewardXp} XP
                    </span>
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      +{need.rewardProgress}% Bar Tumbuh
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-1">
                  <button
                    onClick={() => {
                      setEditingNeed(need);
                      setNeedForm({
                        text: need.text,
                        icon: need.icon,
                        category: need.category,
                        rewardXp: need.rewardXp,
                        rewardProgress: need.rewardProgress
                      });
                      setShowAddNeedModal(true);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setDeleteModal({
                        title: 'Hapus Keinginan Pet',
                        itemName: need.text,
                        itemType: 'Keinginan Pet',
                        warningText: 'Keinginan pet ini tidak akan muncul lagi di speech bubble hewan peliharaan siswa.',
                        onConfirm: () => {
                          storageService.deletePetNeed(need.id);
                          showToast('Keinginan pet berhasil dihapus.');
                          refreshData();
                          setDeleteModal(null);
                        }
                      });
                    }}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 transition"
                    title="Hapus Keinginan (CRUD)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: AUDIT LOG & UNDO */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold font-heading text-slate-800 text-base">
                Riwayat Audit Bintang & Pembatalan (Undo)
              </h3>
              <p className="text-xs text-slate-500">
                Setiap aksi penambahan atau pengurangan bintang tercatat di sini dan dapat dibatalkan jika salah klik.
              </p>
            </div>
            <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
              Total Log: {auditLogs.length}
            </span>
          </div>

          <div className="divide-y divide-slate-100 overflow-x-auto">
            {auditLogs.map((log) => {
              const isAward = log.type === 'award';
              return (
                <div
                  key={log.id}
                  className={`py-3.5 px-3 flex items-center justify-between gap-3 rounded-xl transition ${
                    log.reverted ? 'opacity-40 bg-slate-50' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base shrink-0 ${
                        isAward
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isAward ? '⭐' : '⚠️'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800">
                          {log.studentName}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          ({log.nisn})
                        </span>
                        {log.reverted && (
                          <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                            Telah Dibatalkan (Undone)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-600 font-medium">
                        {log.categoryName} {log.note && `• Catatan: "${log.note}"`}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(log.timestamp).toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`font-black text-sm px-2.5 py-1 rounded-full ${
                        isAward
                          ? 'bg-amber-400 text-amber-950'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {log.stars > 0 ? `+${log.stars} ⭐` : `${log.stars} ⭐`}
                    </span>

                    {!log.reverted && (
                      <button
                        onClick={() => handleUndoLog(log.id)}
                        className="py-1 px-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 text-xs font-bold transition flex items-center gap-1"
                        title="Batalkan aksi ini dan kembalikan poin"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Undo</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {auditLogs.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">
                Belum ada riwayat catatan reward atau pengurangan bintang.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 8: BACKUP & RESTORE DATA KESELURUHAN */}
      {activeTab === 'backup' && (
        <BackupRestoreSection
          currentTeacher={teacher}
          onDataRefreshed={refreshData}
          showToast={showToast}
          triggerConfirmModal={setDeleteModal}
        />
      )}

      {/* TAB 9: KELOLA & KUNCI MINI GAME */}
      {activeTab === 'minigames' && (
        <MiniGameManager
          teacher={teacher}
          onToast={(msg, type) => showToast(msg, type || 'success')}
        />
      )}


      {/* --- MODAL: ADD / EDIT STUDENT (CRUD) --- */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-amber-300 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-extrabold font-heading text-slate-800">
                  {editingStudent ? '✏️ Edit Data Siswa (CRUD)' : '➕ Tambah Siswa Baru (CRUD)'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {editingStudent ? 'Ubah informasi identitas dan status pet siswa.' : 'Daftarkan siswa baru ke dalam database kelas.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddStudentModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nama Lengkap Siswa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ahmad Fauzi"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 outline-none focus:border-amber-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    NISN (ID Login) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 0012345678"
                    value={studentForm.nisn}
                    onChange={(e) => setStudentForm({ ...studentForm, nisn: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 outline-none focus:border-amber-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Kelas <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kelas 4A"
                    value={studentForm.className}
                    onChange={(e) => setStudentForm({ ...studentForm, className: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 outline-none focus:border-amber-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Spesies Pet</label>
                  <select
                    value={studentForm.petSpeciesId}
                    onChange={(e) => setStudentForm({ ...studentForm, petSpeciesId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 outline-none focus:border-amber-500 font-medium"
                  >
                    {speciesList.map((sp) => (
                      <option key={sp.id} value={sp.id}>
                        {sp.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Nama Panggilan Pet</label>
                  <input
                    type="text"
                    placeholder="Contoh: Milo"
                    value={studentForm.petNickname}
                    onChange={(e) => setStudentForm({ ...studentForm, petNickname: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 outline-none focus:border-amber-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Saldo Bintang ⭐</label>
                  <input
                    type="number"
                    min="0"
                    value={studentForm.stars}
                    onChange={(e) => setStudentForm({ ...studentForm, stars: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 outline-none focus:border-amber-500 font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Level Pet (1–10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={studentForm.level || 1}
                    onChange={(e) => setStudentForm({ ...studentForm, level: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 outline-none focus:border-amber-500 font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-extrabold shadow transition"
                >
                  {editingStudent ? 'Simpan Perubahan' : 'Tambah Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: ADD / EDIT TEACHER PIN --- */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-amber-300 relative">
            <h3 className="text-lg font-bold font-heading text-slate-800 mb-4">
              {editingTeacher ? 'Ubah PIN Guru' : 'Tambah Guru / PIN Baru'}
            </h3>

            <form onSubmit={handleSaveTeacher} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nama Lengkap Guru</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso, S.Pd"
                  value={teacherForm.name}
                  onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">4-Digit PIN Masuk</label>
                <div className="relative">
                  <input
                    type={showModalPin ? 'text' : 'password'}
                    required
                    maxLength={6}
                    placeholder="••••"
                    value={teacherForm.pin}
                    onChange={(e) => setTeacherForm({ ...teacherForm, pin: e.target.value })}
                    className="w-full px-3 py-2 pr-10 text-xs rounded-xl bg-slate-50 border border-slate-300 outline-none focus:border-amber-500 font-mono text-base font-bold tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowModalPin(!showModalPin)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-600 transition"
                    title={showModalPin ? 'Sembunyikan' : 'Tampilkan'}
                  >
                    {showModalPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email / Kontak (Opsional)</label>
                <input
                  type="text"
                  placeholder="guru@sekolah.id"
                  value={teacherForm.email}
                  onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTeacherModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow"
                >
                  Simpan Akun Guru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: AWARD STARS --- */}
      {showAwardModal && actionTargetStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-amber-400 relative">
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl mx-auto shadow-inner mb-2">
                ⭐
              </div>
              <h3 className="text-lg font-bold font-heading text-slate-800">
                Beri Bintang Apresiasi
              </h3>
              <p className="text-xs text-slate-500">
                Untuk: <span className="font-bold text-slate-800">{actionTargetStudent.name}</span> ({actionTargetStudent.className})
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">Pilih Kategori Apresiasi:</label>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {rewardCategories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedRewardCatId(cat.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between gap-2 ${
                      selectedRewardCatId === cat.id
                        ? 'bg-amber-50 border-amber-400 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{cat.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{cat.name}</div>
                        <div className="text-[11px] text-slate-500">{cat.description}</div>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full shrink-0">
                      +{cat.stars} ⭐
                    </span>
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Catatan Tambahan (Opsional)</label>
                <input
                  type="text"
                  placeholder="Misal: Tugas matematika halaman 42 sangat rapi"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setShowAwardModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  onClick={handleExecuteAward}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Kirim Bintang Real-time</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: DEDUCT STARS --- */}
      {showDeductModal && actionTargetStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-rose-400 relative">
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-2xl mx-auto shadow-inner mb-2">
                ⚠️
              </div>
              <h3 className="text-lg font-bold font-heading text-slate-800">
                Pengurangan Bintang Siswa
              </h3>
              <p className="text-xs text-slate-500">
                Untuk: <span className="font-bold text-slate-800">{actionTargetStudent.name}</span> (Saldo: {actionTargetStudent.stars} ⭐)
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">Pilih Alasan Pelanggaran:</label>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {deductionCategories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedDeductCatId(cat.id)}
                    className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between gap-2 ${
                      selectedDeductCatId === cat.id
                        ? 'bg-rose-50 border-rose-400 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{cat.icon}</span>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{cat.name}</div>
                        <div className="text-[11px] text-slate-500">{cat.description}</div>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold bg-rose-600 text-white px-2 py-0.5 rounded-full shrink-0">
                      -{cat.stars} ⭐
                    </span>
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Catatan Tambahan (Opsional)</label>
                <input
                  type="text"
                  placeholder="Misal: Sudah diingatkan 2 kali saat jam pelajaran"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setShowDeductModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  onClick={handleExecuteDeduct}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow flex items-center gap-1.5"
                >
                  <MinusCircle className="w-4 h-4" />
                  <span>Kurangi Poin Real-time</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: ADD / EDIT PET SHOP ITEM --- */}
      {showAddShopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-amber-300 relative">
            <h3 className="text-lg font-bold font-heading text-slate-800 mb-4">
              {editingShopItem ? 'Edit Item Pet Shop' : 'Tambah Item Pet Shop Baru'}
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!shopItemForm.name) return;

                const itemToSave: ShopItem = {
                  id: editingShopItem?.id || 'item-' + Date.now(),
                  name: shopItemForm.name!,
                  category: (shopItemForm.category || 'makanan') as ShopCategory,
                  price: Number(shopItemForm.price || 1),
                  icon: shopItemForm.icon || '🎁',
                  description: shopItemForm.description || '',
                  unlockLevel: Number(shopItemForm.unlockLevel || 1),
                  inStock: shopItemForm.inStock ?? true,
                  boosts: shopItemForm.boosts || { hunger: 25, happiness: 10 }
                };

                storageService.saveShopItem(itemToSave);
                setShowAddShopModal(false);
                refreshData();
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Nama Item</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Biskuit Ikan Renyah"
                  value={shopItemForm.name || ''}
                  onChange={(e) => setShopItemForm({ ...shopItemForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Kategori</label>
                  <select
                    value={shopItemForm.category || 'makanan'}
                    onChange={(e) => setShopItemForm({ ...shopItemForm, category: e.target.value as ShopCategory })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 outline-none focus:border-amber-500"
                  >
                    <option value="makanan">Makanan 🍖</option>
                    <option value="minuman">Minuman 💧</option>
                    <option value="sabun">Sabun 🧼</option>
                    <option value="mainan">Mainan 🎾</option>
                    <option value="aksesoris">Aksesoris 🎀</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Harga (Bintang ⭐)</label>
                  <input
                    type="number"
                    min="1"
                    value={shopItemForm.price || 1}
                    onChange={(e) => setShopItemForm({ ...shopItemForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Emoji / Ikon</label>
                  <input
                    type="text"
                    value={shopItemForm.icon || '🎁'}
                    onChange={(e) => setShopItemForm({ ...shopItemForm, icon: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 outline-none focus:border-amber-500 text-center text-lg"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Status Stok</label>
                  <select
                    value={shopItemForm.inStock ? 'true' : 'false'}
                    onChange={(e) => setShopItemForm({ ...shopItemForm, inStock: e.target.value === 'true' })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 outline-none focus:border-amber-500"
                  >
                    <option value="true">Tersedia (Ready)</option>
                    <option value="false">Habis (Out of Stock)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Deskripsi Item</label>
                <textarea
                  rows={2}
                  value={shopItemForm.description || ''}
                  onChange={(e) => setShopItemForm({ ...shopItemForm, description: e.target.value })}
                  placeholder="Khasiat atau keunggulan item ini..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddShopModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow"
                >
                  Simpan Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: ADD / EDIT PET NEED --- */}
      {showAddNeedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-amber-300 relative">
            <h3 className="text-lg font-bold font-heading text-slate-800 mb-4">
              {editingNeed ? 'Edit Keinginan Pet' : 'Tambah Keinginan Pet Baru'}
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!needForm.text) return;

                const needToSave: PetNeed = {
                  id: editingNeed?.id || 'need-' + Date.now(),
                  text: needForm.text,
                  icon: needForm.icon,
                  category: needForm.category,
                  rewardXp: Number(needForm.rewardXp),
                  rewardProgress: Number(needForm.rewardProgress)
                };

                storageService.savePetNeed(needToSave);
                setShowAddNeedModal(false);
                refreshData();
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Teks Ucapan / Keinginan Pet (Muncul di Speech Bubble)
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Misal: Perutku bunyi lapar, pengen makan apel manis! 🍎"
                  value={needForm.text}
                  onChange={(e) => setNeedForm({ ...needForm, text: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Kategori Kebutuhan</label>
                  <select
                    value={needForm.category}
                    onChange={(e) => setNeedForm({ ...needForm, category: e.target.value as PetNeed['category'] })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 outline-none focus:border-amber-500"
                  >
                    <option value="makanan">Makanan 🍖</option>
                    <option value="minuman">Minuman 💧</option>
                    <option value="sabun">Mandi Sabun 🧼</option>
                    <option value="mainan">Mainan 🎾</option>
                    <option value="aksesoris">Aksesoris 🎀</option>
                    <option value="elus">Elus Sayang ❤️</option>
                    <option value="tidur">Tidur Istirahat 💤</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Ikon / Emoji</label>
                  <input
                    type="text"
                    value={needForm.icon}
                    onChange={(e) => setNeedForm({ ...needForm, icon: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 outline-none focus:border-amber-500 text-center text-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Bonus XP</label>
                  <input
                    type="number"
                    min="10"
                    value={needForm.rewardXp}
                    onChange={(e) => setNeedForm({ ...needForm, rewardXp: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Bonus Bar Tumbuh (%)</label>
                  <input
                    type="number"
                    min="5"
                    max="50"
                    value={needForm.rewardProgress}
                    onChange={(e) => setNeedForm({ ...needForm, rewardProgress: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddNeedModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow"
                >
                  Simpan Keinginan Pet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: ADD / EDIT PET SPECIES (CRUD) --- */}
      {showAddSpeciesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-amber-300 relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-extrabold font-heading text-slate-800">
                  {editingSpecies ? '✏️ Edit Spesies Pet (CRUD)' : '➕ Tambah Spesies Pet Baru (CRUD)'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {editingSpecies ? 'Ubah informasi spesies dan nama tahapan evolusinya.' : 'Daftarkan varian spesies hewan peliharaan baru ke Pet Gallery.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddSpeciesModal(false);
                  setEditingSpecies(null);
                }}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSpecies} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nama Spesies <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Burung Garuda, Panda, Hamster"
                  value={speciesForm.name}
                  onChange={(e) => setSpeciesForm({ ...speciesForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 outline-none focus:border-amber-500 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Kategori Hewan</label>
                <select
                  value={speciesForm.category}
                  onChange={(e) => setSpeciesForm({ ...speciesForm, category: e.target.value as 'mamalia' | 'unggas' | 'reptil' | 'akuatik' | 'fantasi' })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 outline-none focus:border-amber-500 font-medium"
                >
                  <option value="mamalia">Mamalia 🐾</option>
                  <option value="unggas">Unggas / Burung 🦅</option>
                  <option value="reptil">Reptil 🦎</option>
                  <option value="akuatik">Akuatik / Air 🐠</option>
                  <option value="fantasi">Fantasi / Mitologi 🦄</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Deskripsi Spesies</label>
                <textarea
                  rows={2}
                  placeholder="Karakteristik spesies ini..."
                  value={speciesForm.description}
                  onChange={(e) => setSpeciesForm({ ...speciesForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="text-xs font-extrabold text-slate-800 block mb-2">
                  Nama 4 Tahapan Evolusi:
                </label>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block mb-0.5">Tahap 1 (Level 1):</span>
                    <input
                      type="text"
                      placeholder="Telur / Bayi"
                      value={speciesForm.stage0Name}
                      onChange={(e) => setSpeciesForm({ ...speciesForm, stage0Name: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 outline-none focus:border-amber-500 text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block mb-0.5">Tahap 2 (Level 3):</span>
                    <input
                      type="text"
                      placeholder="Anak-anak"
                      value={speciesForm.stage1Name}
                      onChange={(e) => setSpeciesForm({ ...speciesForm, stage1Name: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 outline-none focus:border-amber-500 text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block mb-0.5">Tahap 3 (Level 6):</span>
                    <input
                      type="text"
                      placeholder="Remaja Ceria"
                      value={speciesForm.stage2Name}
                      onChange={(e) => setSpeciesForm({ ...speciesForm, stage2Name: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 outline-none focus:border-amber-500 text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block mb-0.5">Tahap 4 (Level 10):</span>
                    <input
                      type="text"
                      placeholder="Dewasa Juara"
                      value={speciesForm.stage3Name}
                      onChange={(e) => setSpeciesForm({ ...speciesForm, stage3Name: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 outline-none focus:border-amber-500 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddSpeciesModal(false);
                    setEditingSpecies(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-extrabold shadow transition"
                >
                  {editingSpecies ? 'Simpan Perubahan' : 'Tambah Spesies'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: ADD / EDIT REWARD CATEGORY (CRUD) --- */}
      {showAddRewardCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-amber-300 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-extrabold font-heading text-slate-800">
                  {editingRewardCat ? '✏️ Edit Kategori Apresiasi Bintang (CRUD)' : '➕ Tambah Kategori Apresiasi Bintang (CRUD)'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {editingRewardCat ? 'Ubah kriteria dan jumlah bintang reward.' : 'Buat kriteria baru pemberian bintang kebaikan atau prestasi.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddRewardCatModal(false);
                  setEditingRewardCat(null);
                }}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRewardCategory} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nama Kategori <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Kreativitas Menggambar"
                  value={rewardCatForm.name}
                  onChange={(e) => setRewardCatForm({ ...rewardCatForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 outline-none focus:border-amber-500 font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Jumlah Bintang ⭐</label>
                  <input
                    type="number"
                    min="1"
                    value={rewardCatForm.stars}
                    onChange={(e) => setRewardCatForm({ ...rewardCatForm, stars: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 outline-none focus:border-amber-500 font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Emoji / Ikon</label>
                  <input
                    type="text"
                    value={rewardCatForm.icon}
                    onChange={(e) => setRewardCatForm({ ...rewardCatForm, icon: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 outline-none focus:border-amber-500 text-center text-lg"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Deskripsi Singkat</label>
                <input
                  type="text"
                  placeholder="Kriteria siswa mendapatkan reward ini"
                  value={rewardCatForm.description}
                  onChange={(e) => setRewardCatForm({ ...rewardCatForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 outline-none focus:border-amber-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddRewardCatModal(false);
                    setEditingRewardCat(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-extrabold shadow transition"
                >
                  {editingRewardCat ? 'Simpan Perubahan' : 'Simpan Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: ADD / EDIT DEDUCT CATEGORY (CRUD) --- */}
      {showAddDeductCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-rose-300 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-extrabold font-heading text-slate-800">
                  {editingDeductCat ? '✏️ Edit Kategori Pengurangan (CRUD)' : '➕ Tambah Kategori Pelanggaran (CRUD)'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {editingDeductCat ? 'Ubah kriteria dan jumlah pengurangan bintang.' : 'Buat kriteria pelanggaran atau konsekuensi kedisiplinan.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddDeductCatModal(false);
                  setEditingDeductCat(null);
                }}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDeductionCategory} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nama Pelanggaran <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Tidak Membawa Buku Pelajaran"
                  value={deductCatForm.name}
                  onChange={(e) => setDeductCatForm({ ...deductCatForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 outline-none focus:border-rose-500 font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Jumlah Poin Dikurang</label>
                  <input
                    type="number"
                    min="1"
                    value={deductCatForm.stars}
                    onChange={(e) => setDeductCatForm({ ...deductCatForm, stars: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 outline-none focus:border-rose-500 font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Emoji / Ikon</label>
                  <input
                    type="text"
                    value={deductCatForm.icon}
                    onChange={(e) => setDeductCatForm({ ...deductCatForm, icon: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 outline-none focus:border-rose-500 text-center text-lg"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Deskripsi Singkat</label>
                <input
                  type="text"
                  placeholder="Penjelasan pelanggaran"
                  value={deductCatForm.description}
                  onChange={(e) => setDeductCatForm({ ...deductCatForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 outline-none focus:border-rose-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddDeductCatModal(false);
                    setEditingDeductCat(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-extrabold shadow transition"
                >
                  {editingDeductCat ? 'Simpan Perubahan' : 'Simpan Pelanggaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- GLOBAL IN-APP DELETE CONFIRMATION MODAL (IFRAME-SAFE) --- */}
      {deleteModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
          onClick={() => setDeleteModal(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border-4 border-rose-300 relative text-center animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Warning Icon Badge */}
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Trash2 className="w-7 h-7 text-rose-600" />
            </div>

            <h3 className="text-lg font-black font-heading text-slate-800">
              {deleteModal.title}
            </h3>

            <p className="text-xs text-slate-600 mt-2 font-medium">
              Apakah Anda yakin ingin menghapus {deleteModal.itemType}:
            </p>

            <div className="my-2.5 p-2.5 bg-rose-50 rounded-xl border border-rose-200">
              <span className="font-extrabold text-rose-950 text-sm block truncate">
                "{deleteModal.itemName}"
              </span>
            </div>

            {deleteModal.warningText && (
              <p className="text-[11px] text-slate-500 leading-relaxed mb-4">
                ⚠️ {deleteModal.warningText}
              </p>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeleteModal(null)}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={deleteModal.onConfirm}
                className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
