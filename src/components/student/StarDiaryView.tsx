import React from 'react';
import { BookOpen, Sparkles, Award, Calendar, AlertCircle } from 'lucide-react';
import { Student } from '../../types';
import { storageService } from '../../services/storage';

interface StarDiaryViewProps {
  student: Student;
}

export const StarDiaryView: React.FC<StarDiaryViewProps> = ({ student }) => {
  const allLogs = storageService.getAuditLogs();
  const studentLogs = allLogs.filter((log) => log.studentId === student.id || log.nisn === student.nisn);

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-3xl p-6 text-amber-950 shadow-xl flex items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider bg-white/40 px-2.5 py-0.5 rounded-full">
            Buku Prestasi Siswa
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold font-heading mt-1">
            Buku Harian Bintang ⭐
          </h3>
          <p className="text-xs text-amber-900/80 mt-0.5">
            Catatan lengkap apresiasi dan penghargaan dari Bapak/Ibu Guru atas ketekunan dan kedisiplinanmu.
          </p>
        </div>

        <div className="bg-white/90 rounded-2xl p-4 text-center shadow-md border-2 border-amber-300 shrink-0">
          <div className="text-[10px] font-extrabold text-slate-500 uppercase">Saldo Saat Ini</div>
          <div className="text-2xl sm:text-3xl font-black font-heading text-amber-600">
            {student.stars} ⭐
          </div>
        </div>
      </div>

      {/* Timeline List */}
      <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-sm space-y-3">
        <h4 className="font-extrabold font-heading text-slate-800 text-sm flex items-center gap-2 pb-3 border-b border-slate-100">
          <BookOpen className="w-4 h-4 text-amber-600" />
          <span>Riwayat Perjalanan Belajar & Bintang</span>
        </h4>

        {studentLogs.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {studentLogs.map((log) => {
              const isAward = log.type === 'award';
              return (
                <div key={log.id} className="py-3.5 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 ${
                        isAward ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isAward ? '⭐' : '⚠️'}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-800">
                        {log.categoryName}
                      </div>
                      {log.note && (
                        <div className="text-xs text-slate-600 mt-0.5 italic">
                          "{log.note}"
                        </div>
                      )}
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(log.timestamp).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`font-black text-xs px-2.5 py-1 rounded-full shrink-0 shadow-xs ${
                      isAward
                        ? 'bg-amber-400 text-amber-950'
                        : 'bg-rose-600 text-white'
                    }`}
                  >
                    {log.stars > 0 ? `+${log.stars} ⭐` : `${log.stars} ⭐`}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs">
            Belum ada catatan bintang tersimpan. Tunjukkan prestasimu di kelas agar Guru memberikan bintang!
          </div>
        )}
      </div>
    </div>
  );
};
