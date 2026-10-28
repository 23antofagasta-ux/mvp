import React, { useState, useRef } from 'react';
import {
  Download,
  Upload,
  Database,
  RefreshCw,
  FileJson,
  Check,
  Copy,
  AlertTriangle,
  Trash2,
  ShieldCheck,
  FileText,
  Clock,
  HardDrive,
  Users,
  Award,
  ShoppingBag,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileUp,
  RotateCcw
} from 'lucide-react';
import { CompleteBackupData, Teacher } from '../../types';
import { storageService } from '../../services/storage';
import { soundManager } from '../../services/audio';

interface BackupRestoreSectionProps {
  currentTeacher: Teacher;
  onDataRefreshed: () => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  triggerConfirmModal: (config: {
    title: string;
    itemName: string;
    itemType: string;
    warningText?: string;
    onConfirm: () => void;
  }) => void;
}

export const BackupRestoreSection: React.FC<BackupRestoreSectionProps> = ({
  currentTeacher,
  onDataRefreshed,
  showToast,
  triggerConfirmModal
}) => {
  const [copied, setCopied] = useState(false);
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [activeImportMode, setActiveImportMode] = useState<'replace' | 'merge'>('replace');
  const [uploadedBackup, setUploadedBackup] = useState<CompleteBackupData | null>(null);
  const [uploadFileName, setUploadFileName] = useState<string>('');
  const [pasteJsonText, setPasteJsonText] = useState<string>('');
  const [showPasteArea, setShowPasteArea] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Current stats
  const students = storageService.getStudents();
  const teachers = storageService.getTeachers();
  const species = storageService.getSpecies();
  const shopItems = storageService.getShopItems();
  const rewards = storageService.getRewardCategories();
  const deductions = storageService.getDeductionCategories();
  const petNeeds = storageService.getPetNeeds();
  const quests = storageService.getDailyQuests();
  const logs = storageService.getAuditLogs();

  // Approximate database size calculation
  const currentBackupJson = JSON.stringify(storageService.exportAllData(currentTeacher.name), null, 2);
  const currentSizeKb = (new Blob([currentBackupJson]).size / 1024).toFixed(1);

  // 1. Download Backup File
  const handleDownloadBackup = () => {
    try {
      const backupData = storageService.exportAllData(currentTeacher.name);
      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-').slice(0, 5);
      const fileName = `MVP_Backup_Database_${dateStr}_${timeStr}.json`;

      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      soundManager.playStarChime();
      showToast(`File backup berhasil diunduh: "${fileName}"`);
    } catch (err: any) {
      showToast('Gagal mengunduh file backup: ' + (err?.message || 'Error'), 'error');
    }
  };

  // 2. Copy JSON to Clipboard
  const handleCopyJson = async () => {
    try {
      const backupData = storageService.exportAllData(currentTeacher.name);
      await navigator.clipboard.writeText(JSON.stringify(backupData, null, 2));
      setCopied(true);
      soundManager.playStarChime();
      showToast('Seluruh data JSON berhasil disalin ke clipboard.');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      showToast('Gagal menyalin ke clipboard.', 'error');
    }
  };

  // 3. Handle File Selection for Restore
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text) as CompleteBackupData;

        // Basic validation
        if (!parsed || !parsed.data || !Array.isArray(parsed.data.students)) {
          showToast('File tidak sesuai format backup My Virtual Pet.', 'error');
          setUploadedBackup(null);
          return;
        }

        setUploadedBackup(parsed);
        soundManager.playStarChime();
        showToast(`File "${file.name}" berhasil dibaca dan siap dipulihkan.`);
      } catch (err) {
        showToast('File tidak valid atau format JSON rusak.', 'error');
        setUploadedBackup(null);
      }
    };
    reader.readAsText(file);
  };

  // 4. Parse from Pasted JSON
  const handleParsePastedJson = () => {
    if (!pasteJsonText.trim()) {
      showToast('Silakan tempel teks JSON terlebih dahulu.', 'error');
      return;
    }
    try {
      const parsed = JSON.parse(pasteJsonText) as CompleteBackupData;
      if (!parsed || !parsed.data || !Array.isArray(parsed.data.students)) {
        showToast('Format JSON tidak sesuai dengan spesifikasi backup database.', 'error');
        return;
      }
      setUploadedBackup(parsed);
      setUploadFileName('Teks JSON Tempelan Manual');
      soundManager.playStarChime();
      showToast('Teks JSON berhasil diverifikasi dan siap dipulihkan.');
    } catch (err) {
      showToast('Teks bukan format JSON yang valid. Periksa kembali kurung kurawal.', 'error');
    }
  };

  // 5. Execute Restore
  const executeRestore = () => {
    if (!uploadedBackup) {
      showToast('Belum ada data backup yang dipilih untuk dipulihkan.', 'error');
      return;
    }

    const modeText = activeImportMode === 'replace' ? 'Menimpa Seluruh Data' : 'Menggabungkan Data (Merge)';
    triggerConfirmModal({
      title: 'Konfirmasi Pulihkan (Restore) Data',
      itemName: uploadFileName || 'File Cadangan',
      itemType: `Database Keseluruhan (${modeText})`,
      warningText:
        activeImportMode === 'replace'
          ? 'PERHATIAN: Mode "Timpa" akan mengganti seluruh database saat ini dengan isi file backup ini. Pastikan Anda telah membuat cadangan terbaru.'
          : 'Data yang memiliki ID sama akan diperbarui, dan data baru dari backup akan ditambahkan ke sistem.',
      onConfirm: () => {
        setIsProcessing(true);
        setTimeout(() => {
          const result = storageService.restoreAllData(uploadedBackup, activeImportMode);
          setIsProcessing(false);
          if (result.success) {
            soundManager.playLevelUp();
            showToast(result.message, 'success');
            onDataRefreshed();
            setUploadedBackup(null);
            setUploadFileName('');
            setPasteJsonText('');
            if (fileInputRef.current) fileInputRef.current.value = '';
          } else {
            showToast(result.message, 'error');
          }
        }, 300);
      }
    });
  };

  // 6. Reset to Factory Default
  const handleFactoryReset = () => {
    triggerConfirmModal({
      title: 'Reset ke Pengaturan & Data Bawaan Pabrik',
      itemName: 'Seluruh Database MVP',
      itemType: 'Semua Data Kelas',
      warningText:
        'PERINGATAN KERAS: Semua data siswa yang dibuat, riwayat audit bintang, dan modifikasi akan dihapus serta dikembalikan ke data demo awal (Pak Budi Santoso, 12 siswa contoh, dan 13 spesies pet default). Tindakan ini tidak dapat dibatalkan.',
      onConfirm: () => {
        storageService.resetToFactoryDefaults();
        soundManager.playDeductBuzz();
        showToast('Database berhasil direset ke data awal bawaan aplikasi.');
        onDataRefreshed();
      }
    });
  };

  // 7. Clear Student Database Only
  const handleClearStudentDatabase = () => {
    triggerConfirmModal({
      title: 'Kosongkan Seluruh Database Siswa',
      itemName: `Semua Siswa (${students.length} anak)`,
      itemType: 'Data Siswa',
      warningText:
        'PERHATIAN: Hanya seluruh data siswa (NISN, akun peliharaan, dan saldo bintang) yang akan dihapus bersih (0 siswa). Akun guru, spesies, dan toko tetap utuh.',
      onConfirm: () => {
        storageService.clearAllStudents();
        soundManager.playDeductBuzz();
        showToast('Seluruh database siswa berhasil dikosongkan.');
        onDataRefreshed();
      }
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold mb-3 border border-white/20">
              <Database className="w-3.5 h-3.5" />
              <span>Pusat Cadangan & Pemulihan Database</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-heading tracking-tight">
              Backup & Restore Data Keseluruhan
            </h2>
            <p className="text-amber-100 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
              Amankan seluruh data sekolah Anda (siswa, NISN, level pet, saldo bintang, kategori reward, katalog toko, dan riwayat guru) ke dalam satu file JSON yang dapat dipulihkan kapan saja.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
            <button
              onClick={handleDownloadBackup}
              className="py-3 px-5 rounded-2xl bg-white hover:bg-amber-50 text-amber-900 font-extrabold text-xs shadow-lg transition flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-600" />
              <span>Unduh File Backup (.JSON)</span>
            </button>
            <button
              onClick={handleCopyJson}
              className="py-2.5 px-4 rounded-2xl bg-amber-700/60 hover:bg-amber-700 border border-white/20 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Berhasil Disalin!' : 'Salin Teks JSON'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Database Statistics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl shrink-0">
            👥
          </div>
          <div className="overflow-hidden">
            <div className="text-[11px] font-bold text-slate-500 truncate">Total Siswa</div>
            <div className="text-lg font-black text-slate-800">{students.length} Anak</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center text-xl shrink-0">
            👨‍🏫
          </div>
          <div className="overflow-hidden">
            <div className="text-[11px] font-bold text-slate-500 truncate">Akun Guru & PIN</div>
            <div className="text-lg font-black text-slate-800">{teachers.length} Guru</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl shrink-0">
            🐾
          </div>
          <div className="overflow-hidden">
            <div className="text-[11px] font-bold text-slate-500 truncate">Spesies Pet</div>
            <div className="text-lg font-black text-slate-800">{species.length} Spesies</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center text-xl shrink-0">
            🛍️
          </div>
          <div className="overflow-hidden">
            <div className="text-[11px] font-bold text-slate-500 truncate">Item Pet Shop</div>
            <div className="text-lg font-black text-slate-800">{shopItems.length} Item</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center text-xl shrink-0">
            💾
          </div>
          <div className="overflow-hidden">
            <div className="text-[11px] font-bold text-slate-500 truncate">Ukuran Database</div>
            <div className="text-lg font-black text-slate-800">~{currentSizeKb} KB</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Section 1 (Export) & Section 2 (Import / Restore) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CARD 1: CADANGKAN (BACKUP / EXPORT) */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Download className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold font-heading text-slate-800">
                  1. Ekspor & Unduh Cadangan
                </h3>
                <p className="text-xs text-slate-500">
                  Simpan arsip seluruh data kelas ke komputer atau HP Anda
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 my-4 text-xs space-y-2.5">
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Format File:
                </span>
                <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-amber-900">
                  JSON (Standar Kompatibel)
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-medium flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Waktu Ekspor Terakhir:
                </span>
                <span className="font-bold text-slate-800">Baru Saja (Real-time)</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="font-medium flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-purple-600" />
                  Cakupan Data:
                </span>
                <span className="font-bold text-slate-800">100% Seluruh Entitas</span>
              </div>
            </div>

            {/* Included Content Badges */}
            <div className="text-[11px] font-bold text-slate-600 mb-2">
              Termasuk dalam file backup ini:
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-1 rounded-lg text-[11px] font-bold">
                ✓ {students.length} Siswa & Pet
              </span>
              <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-1 rounded-lg text-[11px] font-bold">
                ✓ {teachers.length} Akun Guru
              </span>
              <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-1 rounded-lg text-[11px] font-bold">
                ✓ {species.length} Spesies & Evolusi
              </span>
              <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-1 rounded-lg text-[11px] font-bold">
                ✓ {shopItems.length} Item Toko
              </span>
              <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-1 rounded-lg text-[11px] font-bold">
                ✓ {rewards.length + deductions.length} Kriteria Bintang
              </span>
              <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-1 rounded-lg text-[11px] font-bold">
                ✓ {logs.length} Riwayat Transaksi
              </span>
            </div>

            {/* Collapsible JSON Preview */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowJsonPreview(!showJsonPreview)}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 transition"
              >
                <span>{showJsonPreview ? 'Tutup Pratinjau JSON' : 'Lihat Pratinjau Struktur Data JSON'}</span>
                {showJsonPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showJsonPreview && (
                <div className="mt-2.5 p-3 bg-slate-900 text-amber-300 rounded-xl font-mono text-[10px] max-h-48 overflow-y-auto leading-relaxed border border-slate-800">
                  <pre>{currentBackupJson.slice(0, 1500) + '\n... (dan seterusnya)'}</pre>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={handleDownloadBackup}
              className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Unduh File .JSON Sekarang</span>
            </button>
            <button
              onClick={handleCopyJson}
              className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin' : 'Salin JSON'}</span>
            </button>
          </div>
        </div>

        {/* CARD 2: PULIHKAN (RESTORE / IMPORT) */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
                <Upload className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold font-heading text-slate-800">
                  2. Pulihkan (Restore) Data
                </h3>
                <p className="text-xs text-slate-500">
                  Unggah file cadangan atau tempel teks JSON untuk mengembalikan data
                </p>
              </div>
            </div>

            {/* Mode Selector: Timpa (Replace) vs Gabung (Merge) */}
            <div className="mt-4 p-1 bg-slate-100 rounded-2xl flex text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setActiveImportMode('replace')}
                className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeImportMode === 'replace'
                    ? 'bg-white text-amber-900 shadow-sm'
                    : 'hover:text-slate-900'
                }`}
              >
                <span>Timpa Seluruhnya (Replace)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveImportMode('merge')}
                className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeImportMode === 'merge'
                    ? 'bg-white text-amber-900 shadow-sm'
                    : 'hover:text-slate-900'
                }`}
              >
                <span>Gabungkan (Merge)</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 mt-2">
              {activeImportMode === 'replace'
                ? '💡 Mode Timpa: Mengganti total data kelas saat ini persis seperti data di dalam file backup.'
                : '💡 Mode Gabung: Menambahkan siswa dan item baru dari backup tanpa menghapus yang sudah ada.'}
            </p>

            {/* File Upload Box */}
            <div className="mt-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
                id="backup-file-input"
              />
              <label
                htmlFor="backup-file-input"
                className="block p-5 border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/40 hover:bg-amber-50/70 rounded-2xl cursor-pointer text-center transition group"
              >
                <FileUp className="w-8 h-8 text-amber-600 mx-auto mb-2 group-hover:scale-110 transition" />
                <span className="text-xs font-extrabold text-slate-800 block">
                  {uploadFileName ? uploadFileName : 'Pilih atau Tarik File Cadangan (.JSON) ke Sini'}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Klik untuk mencari file backup dari komputer atau perangkat Anda
                </span>
              </label>
            </div>

            {/* Toggle Paste Area */}
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => setShowPasteArea(!showPasteArea)}
                className="text-xs font-bold text-slate-500 hover:text-amber-700 transition"
              >
                {showPasteArea ? '✕ Sembunyikan Kotak Tempel Teks' : 'Atau Tempel (Paste) Teks JSON Manual'}
              </button>
            </div>

            {showPasteArea && (
              <div className="mt-3 space-y-2 animate-fadeIn">
                <textarea
                  rows={4}
                  value={pasteJsonText}
                  onChange={(e) => setPasteJsonText(e.target.value)}
                  placeholder="Tempelkan seluruh teks JSON file backup di sini..."
                  className="w-full text-xs font-mono p-3 rounded-xl border border-slate-300 focus:border-amber-400 outline-none bg-slate-50"
                />
                <button
                  type="button"
                  onClick={handleParsePastedJson}
                  className="py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Verifikasi Teks JSON
                </button>
              </div>
            )}

            {/* Verification Result Card */}
            {uploadedBackup && (
              <div className="mt-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs animate-scaleUp">
                <div className="flex items-center gap-1.5 font-extrabold text-emerald-900 mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>File Backup Terverifikasi & Siap Dipulihkan:</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-500">Waktu Cadangan:</span>
                    <div className="font-bold text-slate-800">
                      {new Date(uploadedBackup.timestamp).toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Pembuat Backup:</span>
                    <div className="font-bold text-slate-800">
                      {uploadedBackup.exportedBy || 'Guru / Wali Kelas'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Jumlah Siswa:</span>
                    <div className="font-bold text-slate-800">
                      {uploadedBackup.data.students.length} Siswa
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">Jumlah Akun Guru:</span>
                    <div className="font-bold text-slate-800">
                      {uploadedBackup.data.teachers.length} Guru
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={executeRestore}
              disabled={!uploadedBackup || isProcessing}
              className={`w-full py-3 px-4 rounded-xl font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 ${
                uploadedBackup && !isProcessing
                  ? 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
              <span>
                {isProcessing
                  ? 'Sedang Memulihkan Database...'
                  : uploadedBackup
                  ? `Mulai Pulihkan Data (${activeImportMode === 'replace' ? 'Timpa' : 'Gabung'})`
                  : 'Pilih File Backup Terlebih Dahulu'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone: Database Reset & Clear */}
      <div className="bg-rose-50/70 rounded-3xl p-6 border-2 border-rose-200 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-rose-200/60">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
              <Trash2 className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-rose-950 font-heading">
                Kosongkan Seluruh Database Siswa (0 Siswa)
              </h4>
              <p className="text-xs text-rose-800/80 mt-0.5 max-w-xl leading-relaxed">
                Hapus semua akun murid, status hewan peliharaan, dan saldo bintang dari database kelas ({students.length} siswa saat ini). Akun guru, PIN login, spesies hewan, dan item toko Anda tetap aman.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClearStudentDatabase}
            className="py-2.5 px-4 rounded-xl bg-white hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-300 font-extrabold text-xs transition shadow-xs flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Kosongkan Siswa ({students.length})</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-rose-950 font-heading">
                Reset Seluruh Database ke Bawaan Pabrik
              </h4>
              <p className="text-xs text-rose-800/80 mt-0.5 max-w-xl leading-relaxed">
                Kembalikan seluruh database ke pengaturan awal demo (12 siswa contoh, 13 spesies hewan, dan PIN bawaan 1234).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleFactoryReset}
            className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition shadow-xs flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Data Bawaan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
