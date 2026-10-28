import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Home, Sparkles, Check, Lock } from 'lucide-react';
import { Student, HabitatOption, PetSpecies } from '../../types';
import { HABITAT_OPTIONS } from '../../data/initialData';
import { storageService } from '../../services/storage';
import { soundManager } from '../../services/audio';
import { HabitatRoom } from '../pet/HabitatRoom';

interface HabitatCustomizerProps {
  student: Student;
  species: PetSpecies;
  onUpdate: () => void;
}

export const HabitatCustomizer: React.FC<HabitatCustomizerProps> = ({
  student,
  species,
  onUpdate
}) => {
  const [activeTab, setActiveTab] = useState<'background' | 'furniture' | 'ornament'>('background');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const backgrounds = HABITAT_OPTIONS.filter((h) => h.type === 'background');
  const furnitureList = HABITAT_OPTIONS.filter((h) => h.type === 'furniture');
  const ornamentList = HABITAT_OPTIONS.filter((h) => h.type === 'ornament');

  const handleEquip = (opt: HabitatOption) => {
    const updated = { ...student };
    if (opt.type === 'background') {
      updated.equippedHabitat.background = opt.id;
    } else if (opt.type === 'furniture') {
      updated.equippedHabitat.furniture = opt.id;
    } else if (opt.type === 'ornament') {
      updated.equippedHabitat.ornament = opt.id;
    }

    storageService.saveStudent(updated);
    soundManager.playStarChime();
    setStatusMsg(`Berhasil memasang "${opt.name}" di ruangan pet!`);
    onUpdate();
  };

  const handleUnlockAndEquip = (opt: HabitatOption) => {
    if (student.stars < opt.price) {
      soundManager.playWrong();
      setStatusMsg(`Bintang tidak cukup! Butuh ${opt.price} ⭐, kamu memiliki ${student.stars} ⭐.`);
      return;
    }

    const updated = { ...student };
    updated.stars -= opt.price;
    if (!updated.unlockedHabitats.includes(opt.id)) {
      updated.unlockedHabitats.push(opt.id);
    }

    if (opt.type === 'background') {
      updated.equippedHabitat.background = opt.id;
    } else if (opt.type === 'furniture') {
      updated.equippedHabitat.furniture = opt.id;
    } else if (opt.type === 'ornament') {
      updated.equippedHabitat.ornament = opt.id;
    }

    storageService.saveStudent(updated);
    soundManager.playStarChime();
    try {
      confetti({ particleCount: 50, spread: 60 });
    } catch {
      // ignore
    }

    setStatusMsg(`Selamat! "${opt.name}" berhasil dibuka dan dipasang di ruangan pet!`);
    onUpdate();
  };

  const currentList =
    activeTab === 'background'
      ? backgrounds
      : activeTab === 'furniture'
      ? furnitureList
      : ornamentList;

  return (
    <div className="space-y-6">
      {/* Live Preview Room */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
          <span>Pratinjau Ruangan & Habitat Pet:</span>
          <span className="text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full font-bold">
            Saldumu: {student.stars} ⭐
          </span>
        </div>
        <HabitatRoom
          species={species}
          stageIndex={student.evolutionStage}
          isSleeping={student.isSleeping}
          equippedAccessories={student.equippedAccessories}
          backgroundId={student.equippedHabitat.background}
          furnitureId={student.equippedHabitat.furniture}
          ornamentId={student.equippedHabitat.ornament}
        />
      </div>

      {statusMsg && (
        <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-2xl text-xs font-bold text-amber-950 flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'background', label: 'Tema Latar Belakang', icon: '🎨' },
          { id: 'furniture', label: 'Perabotan Ruangan', icon: '🛋️' },
          { id: 'ornament', label: 'Ornamen & Tanaman', icon: '🪴' }
        ].map((tab) => {
          const isSel = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as typeof activeTab);
                setStatusMsg(null);
              }}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs ${
                isSel
                  ? 'bg-amber-500 text-white shadow-amber-500/20'
                  : 'bg-white hover:bg-amber-50 text-slate-600 border border-slate-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {currentList.map((opt) => {
          const isUnlocked = student.unlockedHabitats.includes(opt.id) || opt.price === 0;
          const isEquipped =
            (opt.type === 'background' && student.equippedHabitat.background === opt.id) ||
            (opt.type === 'furniture' && student.equippedHabitat.furniture === opt.id) ||
            (opt.type === 'ornament' && student.equippedHabitat.ornament === opt.id);
          const canAfford = student.stars >= opt.price;

          return (
            <div
              key={opt.id}
              className={`bg-white rounded-3xl p-4 border-2 transition flex flex-col justify-between shadow-xs ${
                isEquipped
                  ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-300'
                  : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-3xl p-2 bg-amber-50 rounded-2xl border border-amber-100">
                    {opt.icon}
                  </span>
                  <div>
                    {isEquipped ? (
                      <span className="text-[10px] font-black bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Dipasang
                      </span>
                    ) : isUnlocked ? (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Dimiliki
                      </span>
                    ) : (
                      <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                        {opt.price} ⭐
                      </span>
                    )}
                  </div>
                </div>

                <h4 className="font-extrabold font-heading text-slate-800 text-sm mt-3">
                  {opt.name}
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {opt.description}
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-100">
                {isEquipped ? (
                  <button
                    disabled
                    className="w-full py-2 bg-amber-100 text-amber-900 font-bold text-xs rounded-xl cursor-default"
                  >
                    Sedang Digunakan
                  </button>
                ) : isUnlocked ? (
                  <button
                    onClick={() => handleEquip(opt)}
                    className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow transition active:scale-95"
                  >
                    Pasang Sekarang
                  </button>
                ) : (
                  <button
                    onClick={() => handleUnlockAndEquip(opt)}
                    className={`w-full py-2 rounded-xl text-xs font-bold shadow transition flex items-center justify-center gap-1 active:scale-95 ${
                      canAfford
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-amber-500/20'
                        : 'bg-slate-100 text-slate-600 border border-slate-300'
                    }`}
                  >
                    <Lock className="w-3 h-3" />
                    <span>Buka Kunci ({opt.price} ⭐)</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
