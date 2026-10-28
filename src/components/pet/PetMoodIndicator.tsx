import React, { useState } from 'react';
import {
  Sparkles,
  Heart,
  Clock,
  Award,
  ChevronRight,
  Info,
  X,
  Zap,
  Smile,
  Activity
} from 'lucide-react';
import { Student, PetSpecies } from '../../types';
import { calculatePetMood, PetMoodDetails, MiniGameRecentPerformance } from '../../utils/petMood';
import { soundManager } from '../../services/audio';

interface PetMoodIndicatorProps {
  student: Student;
  species: PetSpecies;
  recentPerf?: MiniGameRecentPerformance | null;
  compact?: boolean;
  onQuickAction?: (actionType: 'pet' | 'feed' | 'drink' | 'clean' | 'sleep' | 'minigame') => void;
}

export const PetMoodIndicator: React.FC<PetMoodIndicatorProps> = ({
  student,
  species,
  recentPerf,
  compact = false,
  onQuickAction
}) => {
  const [showModal, setShowModal] = useState(false);

  const mood: PetMoodDetails = calculatePetMood(student, recentPerf);

  const handleOpenModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playPop();
    setShowModal(true);
  };

  const handleExecuteAction = () => {
    setShowModal(false);
    if (onQuickAction) {
      onQuickAction(mood.suggestedActionType);
    }
  };

  return (
    <>
      {/* Visual Badge Indicator */}
      <button
        type="button"
        onClick={handleOpenModal}
        className={`group relative inline-flex items-center gap-1.5 px-3 py-1 rounded-2xl border transition-all duration-200 cursor-pointer shadow-xs active:scale-95 ${
          mood.badgeBg
        } ${mood.badgeBorder} ${mood.textColor} ${
          compact ? 'text-[11px] py-0.5 px-2.5' : 'text-xs'
        }`}
        title={`Mood ${student.petNickname}: ${mood.label}. Klik untuk melihat status kebugaran!`}
      >
        <span className="text-base select-none animate-bounce-gentle">
          {mood.emoji}
        </span>
        <span className="font-extrabold flex items-center gap-1">
          <span className="text-slate-500 font-bold hidden xs:inline">Mood:</span>
          <span>{mood.label}</span>
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping opacity-75 ml-0.5" />
      </button>

      {/* Detailed Pet Mood & Wellbeing Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden animate-scaleUp text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`p-4 sm:p-5 bg-gradient-to-r ${mood.accentGradient} text-white flex items-center justify-between shadow-md relative`}>
              <div className="flex items-center gap-2.5">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs border-2 border-white/50 flex items-center justify-center text-3xl shadow-inner animate-bounce-gentle">
                  {mood.emoji}
                </div>
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-white/90 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Suasana Hati & Kebugaran Pet</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-black font-heading text-white">
                    {mood.label}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-4">
              {/* Pet Identity & Description */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-amber-950">{student.petNickname} ({species.name}): </span>
                {mood.description}
              </div>

              {/* Factors that determine the mood */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-600" />
                  <span>Faktor Suasana Hati Saat Ini</span>
                </h4>

                {/* Last Interaction Factor */}
                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <Clock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-slate-800 block">Waktu Interaksi Terakhir</span>
                    <span className="text-slate-600">Disapa atau dielus: <strong className="text-amber-800">{mood.interactionTimeAgoText}</strong></span>
                  </div>
                </div>

                {/* Mini-Game Performance Factor */}
                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-slate-800 block">Aktivitas & Prestasi Mini-Game</span>
                    <span className="text-slate-600">{mood.miniGameContextText}</span>
                  </div>
                </div>

                {/* Pet Meters Snapshot */}
                <div className="grid grid-cols-5 gap-1.5 pt-1 text-center">
                  {[
                    { label: 'Kenyang', val: student.needs.hunger, icon: '🍖', color: 'text-orange-600' },
                    { label: 'Segar', val: student.needs.thirst, icon: '💧', color: 'text-blue-600' },
                    { label: 'Bersih', val: student.needs.hygiene, icon: '🧼', color: 'text-teal-600' },
                    { label: 'Ceria', val: student.needs.happiness, icon: '🎾', color: 'text-pink-600' },
                    { label: 'Energi', val: student.needs.energy, icon: '⚡', color: 'text-yellow-600' }
                  ].map((stat) => (
                    <div key={stat.label} className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                      <div className="text-base select-none">{stat.icon}</div>
                      <div className="text-[10px] text-slate-500 font-bold">{stat.label}</div>
                      <div className={`text-xs font-black ${stat.color}`}>{stat.val}%</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Recommendation Box */}
              <div className="p-3.5 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl border-2 border-amber-300">
                <div className="text-xs font-black text-amber-950 flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Saran Agar Pet Lebih Ceria & Bahagia:</span>
                </div>
                <p className="text-xs text-slate-700 leading-normal mb-3">
                  {mood.suggestedActionText}
                </p>

                {onQuickAction && (
                  <button
                    type="button"
                    onClick={handleExecuteAction}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-amber-950 font-black text-xs shadow-md transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Lakukan Tindakan Sekarang</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
