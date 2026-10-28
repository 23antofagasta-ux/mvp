import React from 'react';
import { Award, Download, Printer, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { Student, PetSpecies } from '../../types';
import { downloadStudentCertificate } from '../../services/pdfGenerator';
import { soundManager } from '../../services/audio';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  species?: PetSpecies;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  isOpen,
  onClose,
  student,
  species
}) => {
  if (!isOpen) return null;

  const handleDownloadPdf = () => {
    soundManager.playStarChime();
    downloadStudentCertificate(student, species);
  };

  const handlePrint = () => {
    window.print();
  };

  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-[#fefcf3] rounded-3xl max-w-4xl w-full p-6 sm:p-10 shadow-2xl border-4 border-amber-400 relative text-center my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-amber-100 text-slate-500 hover:text-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Outer Border Frame */}
        <div className="border-4 border-amber-600/70 p-4 sm:p-8 rounded-2xl relative bg-radial from-amber-50/50 via-[#fefcf3] to-amber-100/30 shadow-inner">
          {/* Corner Decors */}
          <div className="absolute top-2 left-2 text-amber-600 text-lg">✦</div>
          <div className="absolute top-2 right-2 text-amber-600 text-lg">✦</div>
          <div className="absolute bottom-2 left-2 text-amber-600 text-lg">✦</div>
          <div className="absolute bottom-2 right-2 text-amber-600 text-lg">✦</div>

          {/* Academy Header */}
          <div className="text-[11px] sm:text-xs font-black tracking-widest text-amber-900 uppercase">
            ANIMAL KINGDOM ACADEMY OF EXCELLENCE
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-slate-900 mt-2 tracking-tight">
            SERTIFIKAT KELULUSAN RESMI
          </h2>

          <div className="text-xs sm:text-sm font-bold text-amber-700 tracking-wider mt-1 uppercase flex items-center justify-center gap-1.5">
            <span>👑 GELAR KEHORMATAN: MVP PET MASTER 👑</span>
          </div>

          <div className="w-32 h-0.5 bg-amber-400 mx-auto my-3" />

          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Dengan penuh rasa bangga, Dewan Kehormatan Kerajaan Satwa menganugerahkan piagam kelulusan ini kepada:
          </p>

          {/* Student Name */}
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-amber-950 uppercase mt-3 tracking-wide drop-shadow-xs">
            {student.name}
          </h1>

          <div className="text-xs font-bold text-slate-500 font-mono mt-0.5">
            NISN: {student.nisn} • {student.className}
          </div>

          {/* Narrative */}
          <p className="text-xs sm:text-sm text-slate-700 max-w-2xl mx-auto mt-4 leading-relaxed font-medium">
            Atas dedikasi, kedisiplinan, kasih sayang, dan ketekunan luar biasa dalam merawat serta mendidik{' '}
            <span className="font-extrabold text-amber-900">"{student.petNickname}"</span> ({species?.name || 'Hewan Peliharaan'}) hingga sukses berevolusi ke Tahap Puncak Dewasa (Level 10) serta meraih predikat teladan di sekolah.
          </p>

          {/* Badge & Stat Box */}
          <div className="my-5 p-3 sm:p-4 bg-amber-100/70 border border-amber-300 rounded-2xl max-w-lg mx-auto flex items-center justify-around text-xs font-bold text-amber-950 shadow-inner">
            <div>
              <span className="text-[10px] text-amber-800 uppercase block font-semibold">Total Bintang:</span>
              <span className="text-base font-black text-amber-700">{student.stars} ⭐</span>
            </div>
            <div className="w-px h-8 bg-amber-300" />
            <div>
              <span className="text-[10px] text-amber-800 uppercase block font-semibold">Poin Pengalaman:</span>
              <span className="text-base font-black text-indigo-700">{student.xp} XP</span>
            </div>
            <div className="w-px h-8 bg-amber-300" />
            <div>
              <span className="text-[10px] text-amber-800 uppercase block font-semibold">Tingkat Prestasi:</span>
              <span className="text-base font-black text-emerald-700">MVP Master</span>
            </div>
          </div>

          {/* Seal & Signatures Row */}
          <div className="grid grid-cols-3 gap-2 items-center mt-6 pt-4 border-t border-amber-300/80">
            {/* Left Sign */}
            <div className="text-left sm:text-center">
              <div className="text-[10px] sm:text-xs font-bold text-slate-700">
                Dewan Guru & Pengajar
              </div>
              <div className="h-9 flex items-end justify-center">
                <span className="font-serif italic text-amber-900 text-xs sm:text-sm">Budi Santoso</span>
              </div>
              <div className="w-24 sm:w-32 h-0.5 bg-slate-300 mx-auto my-1" />
              <div className="text-[9px] sm:text-[10px] text-slate-500">Wali Kelas 4A</div>
            </div>

            {/* Center Official Gold Seal */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 border-4 border-amber-600 flex flex-col items-center justify-center shadow-lg text-amber-950 p-1">
                <span className="text-[8px] font-black uppercase tracking-tighter">OFFICIAL</span>
                <span className="text-base sm:text-lg">⭐</span>
                <span className="text-[8px] font-black uppercase tracking-tighter">VERIFIED</span>
              </div>
              <span className="text-[9px] text-slate-500 mt-1">{todayStr}</span>
            </div>

            {/* Right Sign */}
            <div className="text-right sm:text-center">
              <div className="text-[10px] sm:text-xs font-bold text-slate-700">
                Kepala Kehormatan Satwa
              </div>
              <div className="h-9 flex items-end justify-center">
                <span className="font-serif italic text-amber-900 text-xs sm:text-sm">Prof. Archibald Owl</span>
              </div>
              <div className="w-24 sm:w-32 h-0.5 bg-slate-300 mx-auto my-1" />
              <div className="text-[9px] sm:text-[10px] text-slate-500">Animal Kingdom</div>
            </div>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleDownloadPdf}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-extrabold text-sm rounded-2xl shadow-xl flex items-center justify-center gap-2 transition active:scale-95"
          >
            <Download className="w-5 h-5" />
            <span>Unduh Sertifikat Resmi (PDF)</span>
          </button>

          <button
            onClick={handlePrint}
            className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm rounded-2xl border-2 border-slate-200 flex items-center justify-center gap-2 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Print</span>
          </button>
        </div>
      </div>
    </div>
  );
};
