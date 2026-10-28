import React, { useState } from 'react';
import { Heart, Moon, Sun, Volume2, VolumeX, Music } from 'lucide-react';
import { PetSpecies, PetEvolutionStageIndex, PetNeed, Student } from '../../types';
import { PetRenderer } from './PetRenderer';
import { soundManager } from '../../services/audio';
import { PetMoodIndicator } from './PetMoodIndicator';
import { MiniGameRecentPerformance } from '../../utils/petMood';

interface HabitatRoomProps {
  species: PetSpecies;
  stageIndex: PetEvolutionStageIndex;
  isSleeping: boolean;
  equippedAccessories: string[];
  backgroundId: string;
  furnitureId: string;
  ornamentId: string;
  activeNeed?: PetNeed | null;
  student?: Student;
  recentPerf?: MiniGameRecentPerformance | null;
  onTapPet?: () => void;
  onPetting?: () => void;
  onToggleSleep?: () => void;
  onMoodAction?: (actionType: 'pet' | 'feed' | 'drink' | 'clean' | 'sleep' | 'minigame') => void;
}

export const HabitatRoom: React.FC<HabitatRoomProps> = ({
  species,
  stageIndex,
  isSleeping,
  equippedAccessories,
  backgroundId,
  furnitureId,
  ornamentId,
  activeNeed,
  student,
  recentPerf,
  onTapPet,
  onPetting,
  onToggleSleep,
  onMoodAction
}) => {
  const [isPetVoiceMuted, setIsPetVoiceMuted] = useState<boolean>(() => soundManager.getIsPetVoiceMuted());
  const [isPlayingChirp, setIsPlayingChirp] = useState<boolean>(false);

  const handleTogglePetVoice = () => {
    const nextMuted = soundManager.togglePetVoice();
    setIsPetVoiceMuted(nextMuted);
    if (!nextMuted) {
      setIsPlayingChirp(true);
      soundManager.playPetChirp(species.id, stageIndex);
      setTimeout(() => setIsPlayingChirp(false), 700);
    }
  };

  const handleTestChirp = () => {
    if (isPetVoiceMuted) {
      soundManager.setPetVoiceMuted(false);
      setIsPetVoiceMuted(false);
    }
    setIsPlayingChirp(true);
    soundManager.playPetChirp(species.id, stageIndex);
    setTimeout(() => setIsPlayingChirp(false), 700);
  };
  // Determine background scenery styles & decorative elements
  const renderBackgroundScenery = () => {
    switch (backgroundId) {
      case 'hab-bg-garden':
        return (
          <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-teal-100 to-emerald-200 overflow-hidden">
            {/* Rainbow */}
            <div className="absolute -top-16 left-1/4 w-80 h-80 rounded-full border-[14px] border-t-rose-400 border-r-amber-400 border-b-transparent border-l-sky-400 opacity-40 blur-xs" />
            {/* Sun */}
            <div className="absolute top-6 right-8 w-16 h-16 rounded-full bg-amber-300 shadow-[0_0_30px_#fde047] animate-pulse" />
            {/* Clouds */}
            <div className="absolute top-12 left-10 text-3xl opacity-75 animate-float-slow">☁️</div>
            <div className="absolute top-20 right-28 text-2xl opacity-60 animate-float">☁️</div>
            {/* Flowers on grass */}
            <div className="absolute bottom-2 left-6 text-2xl">🌷</div>
            <div className="absolute bottom-3 left-16 text-xl">🌼</div>
            <div className="absolute bottom-4 right-8 text-2xl">🌸</div>
            <div className="absolute bottom-1 right-20 text-xl">🌻</div>
            <div className="absolute bottom-0 inset-x-0 h-10 bg-emerald-400/40 rounded-b-3xl border-t-2 border-emerald-500/20" />
          </div>
        );

      case 'hab-bg-jungle':
        return (
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-300 via-green-100 to-lime-200 overflow-hidden">
            {/* Jungle vines & canopy */}
            <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-emerald-600/30 to-transparent flex justify-around text-2xl">
              <span>🌿</span><span>🍃</span><span>🌿</span><span>🍃</span><span>🌿</span>
            </div>
            {/* Waterfall effect */}
            <div className="absolute top-8 left-6 w-12 h-44 bg-gradient-to-b from-cyan-300/60 to-teal-400/40 rounded-full blur-[1px] opacity-70 animate-pulse" />
            <div className="absolute bottom-3 left-4 text-xs font-bold text-teal-800">💧 Air Terjun</div>
            {/* Tropical birds */}
            <div className="absolute top-8 right-12 text-2xl animate-float">🦜</div>
            <div className="absolute bottom-0 inset-x-0 h-10 bg-lime-400/40 rounded-b-3xl" />
          </div>
        );

      case 'hab-bg-beach':
        return (
          <div className="absolute inset-0 bg-gradient-to-b from-amber-200 via-orange-100 to-sky-200 overflow-hidden">
            {/* Sunset */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-gradient-to-t from-orange-400 to-amber-200 shadow-[0_0_40px_#fb923c]" />
            {/* Palm tree */}
            <div className="absolute top-8 left-4 text-4xl">🌴</div>
            <div className="absolute top-12 right-6 text-3xl">🌴</div>
            {/* Ocean wave */}
            <div className="absolute bottom-8 inset-x-0 h-12 bg-sky-400/30 rounded-t-full border-t border-sky-300 animate-pulse" />
            {/* Sandy Shore */}
            <div className="absolute bottom-0 inset-x-0 h-8 bg-amber-200 rounded-b-3xl flex justify-around text-sm">
              <span>🐚</span><span>🏖️</span><span>🦀</span>
            </div>
          </div>
        );

      case 'hab-bg-castle':
        return (
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-900 via-purple-800 to-slate-900 overflow-hidden">
            {/* Glowing stars */}
            <div className="absolute top-6 left-8 text-yellow-300 text-sm animate-ping">✨</div>
            <div className="absolute top-12 right-12 text-yellow-300 text-sm animate-ping">✨</div>
            <div className="absolute top-20 left-1/3 text-amber-200 text-xs">⭐</div>
            <div className="absolute top-4 right-1/4 text-amber-200 text-xs">⭐</div>
            {/* Castle Window & Pillars */}
            <div className="absolute inset-x-8 top-4 bottom-14 border-4 border-amber-400/40 rounded-t-full bg-purple-900/30 backdrop-blur-xs flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-yellow-200/20 blur-md" />
            </div>
            {/* Royal Carpet Floor */}
            <div className="absolute bottom-0 inset-x-0 h-12 bg-rose-900 border-t-4 border-amber-400 rounded-b-3xl flex justify-center items-center">
              <div className="w-3/4 h-5 bg-rose-700 rounded-full border border-amber-300/40" />
            </div>
          </div>
        );

      case 'hab-bg-aurora':
        return (
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-teal-950 to-indigo-950 overflow-hidden">
            {/* Aurora streaks */}
            <div className="absolute top-0 inset-x-0 h-36 bg-gradient-to-r from-emerald-400/30 via-cyan-400/40 to-purple-500/30 blur-xl animate-pulse" />
            <div className="absolute top-6 left-10 text-xl text-cyan-200">❄️</div>
            <div className="absolute top-14 right-16 text-lg text-cyan-200">❄️</div>
            <div className="absolute top-4 right-1/3 text-sm text-cyan-100">✨</div>
            {/* Snowy Floor */}
            <div className="absolute bottom-0 inset-x-0 h-10 bg-sky-100 rounded-b-3xl border-t-2 border-cyan-200 shadow-inner" />
          </div>
        );

      case 'hab-bg-bedroom':
      default:
        return (
          <div className="absolute inset-0 bg-gradient-to-b from-amber-100 via-orange-50 to-amber-100 overflow-hidden">
            {/* Window with outside view */}
            <div className="absolute top-6 right-8 w-20 h-24 bg-sky-200 border-4 border-amber-800 rounded-t-full shadow-inner flex flex-col items-center justify-center">
              <div className="w-full h-0.5 bg-amber-800 my-auto" />
              <div className="h-full w-0.5 bg-amber-800 mx-auto absolute" />
              <span className="text-sm absolute top-2 right-2">☀️</span>
            </div>
            {/* Wall Picture Frame */}
            <div className="absolute top-8 left-8 p-1 bg-amber-700 rounded shadow-md border border-amber-900">
              <div className="w-10 h-8 bg-amber-50 rounded flex items-center justify-center text-xs">
                🐾
              </div>
            </div>
            {/* Warm Wooden Floor */}
            <div className="absolute bottom-0 inset-x-0 h-11 bg-gradient-to-r from-amber-300 via-amber-200 to-amber-300 border-t-4 border-amber-400 rounded-b-3xl shadow-inner" />
          </div>
        );
    }
  };

  // Render selected furniture
  const renderFurniture = () => {
    switch (furnitureId) {
      case 'hab-fur-sofa':
        return (
          <div className="absolute bottom-6 left-4 z-10 text-4xl filter drop-shadow-md select-none" title="Sofa Beludru Kerajaan">
            🛋️
          </div>
        );
      case 'hab-fur-treehouse':
        return (
          <div className="absolute bottom-6 left-3 z-10 text-4xl filter drop-shadow-md select-none" title="Rumah Pohon Mini">
            🏡
          </div>
        );
      case 'hab-fur-desk':
        return (
          <div className="absolute bottom-6 left-4 z-10 text-4xl filter drop-shadow-md select-none" title="Meja Belajar Pintar">
            📖
          </div>
        );
      case 'hab-fur-lantern':
        return (
          <div className="absolute top-6 left-6 z-10 text-3xl filter drop-shadow-lg select-none animate-pulse" title="Lentera Kristal Bintang">
            🏮
          </div>
        );
      case 'hab-fur-bed':
      default:
        return (
          <div className="absolute bottom-6 left-4 z-10 text-4xl filter drop-shadow-md select-none" title="Kasur Awan Mewah">
            🛏️
          </div>
        );
    }
  };

  // Render selected ornament
  const renderOrnament = () => {
    switch (ornamentId) {
      case 'hab-orn-aquarium':
        return (
          <div className="absolute bottom-7 right-5 z-10 text-3xl filter drop-shadow-md select-none animate-bounce-gentle" title="Akuarium Ikan Neon">
            🐠
          </div>
        );
      case 'hab-orn-plant':
        return (
          <div className="absolute bottom-7 right-5 z-10 text-3xl filter drop-shadow-md select-none" title="Tanaman Monstera Hijau">
            🪴
          </div>
        );
      case 'hab-orn-trophy':
        return (
          <div className="absolute bottom-7 right-5 z-10 text-3xl filter drop-shadow-lg select-none animate-pulse-glow" title="Piala Emas Siswa Teladan">
            🏆
          </div>
        );
      case 'hab-orn-balloon':
        return (
          <div className="absolute top-10 right-6 z-10 text-3xl filter drop-shadow-md select-none animate-float" title="Balon Pesta Ceria">
            🎈
          </div>
        );
      case 'hab-orn-musicbox':
        return (
          <div className="absolute bottom-7 right-5 z-10 text-3xl filter drop-shadow-md select-none" title="Kotak Musik Ajaib">
            🎶
          </div>
        );
      case 'hab-orn-none':
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-96 sm:h-[430px] rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300/80 transition-all duration-500">
      {/* Dynamic Background Room Scenery */}
      {renderBackgroundScenery()}

      {/* Equipped Furniture */}
      {renderFurniture()}

      {/* Equipped Ornament */}
      {renderOrnament()}

      {/* Night / Sleeping Filter Overlay */}
      {isSleeping && (
        <div className="absolute inset-0 bg-indigo-950/65 backdrop-blur-[0.5px] z-15 pointer-events-none transition-opacity duration-700 flex items-start justify-end p-4">
          <div className="flex items-center gap-1.5 text-yellow-200 text-xs font-semibold bg-indigo-900/80 px-2.5 py-1 rounded-full border border-indigo-700">
            <span>🌙 Mode Malam (Tidur)</span>
          </div>
        </div>
      )}

      {/* Top-Left Active Need Tag & Mood Badge in Room */}
      <div className="absolute top-4 left-4 z-25 flex items-center gap-2 flex-wrap max-w-[65%]">
        {activeNeed && !isSleeping && (
          <div className="bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-2xl border-2 border-amber-300 shadow-lg flex items-center gap-2 text-xs font-bold text-slate-800 animate-fadeIn">
            <span className="text-base animate-bounce-gentle">{activeNeed.icon}</span>
            <div className="flex items-center gap-1">
              <span className="text-amber-900 font-extrabold hidden sm:inline">Kebutuhan:</span>
              <span className="text-slate-800 truncate max-w-[140px] sm:max-w-xs">{activeNeed.text}</span>
            </div>
          </div>
        )}

        {student && (
          <PetMoodIndicator
            student={student}
            species={species}
            recentPerf={recentPerf}
            compact
            onQuickAction={onMoodAction}
          />
        )}
      </div>

      {/* Top-Right Pet Audio Toggle Control */}
      <div className="absolute top-4 right-4 z-25 flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1 sm:p-1.5 rounded-2xl border-2 border-amber-300 shadow-lg">
        {/* Audio Toggle Button */}
        <button
          type="button"
          onClick={handleTogglePetVoice}
          className={`px-2.5 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
            isPetVoiceMuted
              ? 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-300'
              : 'bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 shadow-xs border border-amber-300 active:scale-95'
          }`}
          title={isPetVoiceMuted ? 'Nyalakan Suara Unik Pet' : 'Matikan Suara Pet (Senyap)'}
        >
          {isPetVoiceMuted ? (
            <>
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Suara: Mati</span>
            </>
          ) : (
            <>
              <Volume2 className={`w-3.5 h-3.5 text-amber-950 ${isPlayingChirp ? 'animate-bounce' : ''}`} />
              <span className="hidden sm:inline">Suara: Nyala</span>
            </>
          )}
        </button>

        {/* Quick 'Tes Suara' Chirp Button */}
        <button
          type="button"
          onClick={handleTestChirp}
          className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl border border-amber-200 text-xs font-bold transition active:scale-90 cursor-pointer flex items-center gap-1"
          title={`Dengarkan suara ceria ${species.name}!`}
        >
          <Music className={`w-3.5 h-3.5 text-amber-600 ${isPlayingChirp ? 'animate-spin-slow' : ''}`} />
          <span className="hidden md:inline text-[11px]">Tes Ceria</span>
        </button>
      </div>

      {/* Central Pet Character */}
      <div className="absolute inset-0 flex items-center justify-center pt-2 sm:pt-4 z-20">
        <PetRenderer
          species={species}
          stageIndex={stageIndex}
          isSleeping={isSleeping}
          equippedAccessories={equippedAccessories}
          activeNeed={activeNeed}
          onTapPet={onTapPet}
        />
      </div>

      {/* Floating Corner Action Buttons (Elus & Tidur) */}
      <div className="absolute bottom-4 right-4 z-25 flex items-center gap-2">
        {onPetting && (
          <button
            onClick={() => {
              soundManager.playPetChirp(species.id, stageIndex);
              onPetting();
            }}
            className="p-3 bg-white/95 hover:bg-rose-50 text-rose-600 rounded-2xl shadow-xl border-2 border-rose-200 transition active:scale-90 flex items-center gap-1.5 font-extrabold text-xs cursor-pointer"
            title="Elus Sayang Pet (+Ceria, Suara & XP)"
          >
            <Heart className="w-4 h-4 fill-rose-500" />
            <span className="hidden sm:inline">Elus Sayang</span>
          </button>
        )}

        {onToggleSleep && (
          <button
            onClick={onToggleSleep}
            className={`p-3 rounded-2xl shadow-xl border-2 transition active:scale-90 flex items-center gap-1.5 font-extrabold text-xs ${
              isSleeping
                ? 'bg-amber-400 hover:bg-amber-300 text-amber-950 border-amber-300'
                : 'bg-indigo-900/90 hover:bg-indigo-950 text-yellow-300 border-indigo-700'
            }`}
            title={isSleeping ? 'Bangunkan Pet' : 'Istirahatkan Pet (Tidur)'}
          >
            {isSleeping ? <Sun className="w-4 h-4 fill-amber-500" /> : <Moon className="w-4 h-4" />}
            <span className="hidden sm:inline">
              {isSleeping ? 'Bangun' : 'Tidur'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
