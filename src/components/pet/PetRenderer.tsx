import React, { useState } from 'react';
import { PetSpecies, PetEvolutionStageIndex, PetNeed } from '../../types';
import { soundManager } from '../../services/audio';

interface PetRendererProps {
  species: PetSpecies;
  stageIndex: PetEvolutionStageIndex;
  isSleeping?: boolean;
  equippedAccessories?: string[];
  activeNeed?: PetNeed | null;
  onTapPet?: () => void;
  scale?: number;
}

export const PetRenderer: React.FC<PetRendererProps> = ({
  species,
  stageIndex,
  isSleeping = false,
  equippedAccessories = [],
  activeNeed,
  onTapPet,
  scale = 1
}) => {
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [notes, setNotes] = useState<{ id: number; char: string; x: number; y: number }[]>([]);
  const [chirpText, setChirpText] = useState<string | null>(null);
  const [isWiggling, setIsWiggling] = useState(false);

  const stage = species.stages[stageIndex] || species.stages[0];

  const getPetChirpText = (speciesId: string) => {
    const id = (speciesId || '').toLowerCase();
    if (id.includes('kucing') || id.includes('cat')) return 'Meoong~ 🐾';
    if (id.includes('kelinci') || id.includes('rabbit')) return 'Chirp! Pip-pip~ 🐰';
    if (id.includes('shiba') || id.includes('dog') || id.includes('anjing')) return 'Yip-yip! Guk! 🐶';
    if (id.includes('panda')) return 'Nguk-nguk riang! 🐼';
    if (id.includes('owl') || id.includes('burung') || id.includes('hantu')) return 'Hoo-hoot! 🦉';
    if (id.includes('hamster')) return 'Cicit-pip! 🐹';
    if (id.includes('naga') || id.includes('dragon')) return 'Rooaar kristal! ✨🐲';
    return 'Chirp-chirp! 💖';
  };

  const handlePetClick = (e: React.MouseEvent) => {
    // Spawn floating heart
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newHeart = { id: Date.now() + Math.random(), x, y };

    setHearts((prev) => [...prev, newHeart]);
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1200);

    // Spawn floating music notes
    const noteChars = ['🎵', '🎶', '✨', '🐾'];
    const newNote = {
      id: Date.now() + Math.random() + 1,
      char: noteChars[Math.floor(Math.random() * noteChars.length)],
      x: x + (Math.random() - 0.5) * 40,
      y: y - 20
    };
    setNotes((prev) => [...prev, newNote]);
    setTimeout(() => {
      setNotes((prev) => prev.filter((n) => n.id !== newNote.id));
    }, 1300);

    // Show vocal chirp bubble
    setChirpText(getPetChirpText(species.id));
    setTimeout(() => {
      setChirpText(null);
    }, 1400);

    setIsWiggling(true);
    setTimeout(() => setIsWiggling(false), 500);

    // Play species-specific happy chirp
    soundManager.playPetChirp(species.id, stageIndex);

    if (onTapPet) {
      onTapPet();
    }
  };

  const hasAccessory = (accId: string) => equippedAccessories.includes(accId);

  return (
    <div
      className="relative flex flex-col items-center justify-center cursor-pointer select-none"
      style={{ transform: `scale(${scale})` }}
      onClick={handlePetClick}
      title="Sentuh atau elus pet kesayanganmu!"
    >
      {/* Speech / Thought Bubble for Pet Desires */}
      {activeNeed && !isSleeping && (
        <div className="absolute -top-16 z-30 max-w-xs animate-bounce-gentle bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border-2 border-amber-300 text-xs text-slate-800 flex items-center gap-2">
          <span className="text-xl shrink-0">{activeNeed.icon}</span>
          <div className="leading-snug font-medium">
            <span className="font-bold text-amber-700 block">Keinginanku:</span>
            {activeNeed.text}
          </div>
          {/* Bubble pointer triangle */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-amber-300" />
        </div>
      )}

      {/* Sleeping Indicator */}
      {isSleeping && (
        <div className="absolute -top-12 z-30 flex items-center gap-1 font-bold text-indigo-600 animate-float text-sm bg-white/90 px-3 py-1 rounded-full shadow-md border border-indigo-200">
          <span>💤 Zzz... Sedang bermimpi indah</span>
        </div>
      )}

      {/* Floating Hearts from Petting */}
      {hearts.map((h) => (
        <div
          key={h.id}
          className="absolute z-40 pointer-events-none animate-heart-rise text-2xl text-rose-500 font-bold"
          style={{ left: `${h.x}px`, top: `${h.y}px` }}
        >
          💖
        </div>
      ))}

      {/* Floating Music Notes from Happy Chirps */}
      {notes.map((n) => (
        <div
          key={n.id}
          className="absolute z-45 pointer-events-none animate-heart-rise text-xl filter drop-shadow select-none"
          style={{ left: `${n.x}px`, top: `${n.y}px` }}
        >
          {n.char}
        </div>
      ))}

      {/* Temporary Vocal Chirp Bubble */}
      {chirpText && !isSleeping && (
        <div className="absolute -top-10 z-35 pointer-events-none animate-bounce-gentle bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-950 font-black text-xs px-3 py-1 rounded-full shadow-lg border border-white flex items-center gap-1">
          <span>{chirpText}</span>
        </div>
      )}

      {/* Main Pet Artwork Container */}
      <div
        className={`relative transition-transform duration-300 ${
          isWiggling ? 'animate-wiggle scale-105' : isSleeping ? 'opacity-85' : 'animate-float'
        }`}
      >
        {/* Glow Aura for Adult Stage (Level 10) */}
        {stageIndex === 3 && (
          <div className="absolute inset-0 -m-4 bg-gradient-to-r from-amber-300/30 via-yellow-400/40 to-amber-300/30 rounded-full blur-xl animate-pulse" />
        )}

        {/* If Custom Image/GIF uploaded by teacher */}
        {isSleeping && (stage.sleepingImageUrl || species.sleepingImageUrl) ? (
          <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center animate-pulse-gentle">
            <img
              src={stage.sleepingImageUrl || species.sleepingImageUrl}
              alt={`${stage.name} (Sedang Tidur)`}
              className="max-w-full max-h-full object-contain drop-shadow-xl"
            />
          </div>
        ) : stage.imageUrl ? (
          <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
            <img
              src={stage.imageUrl}
              alt={stage.name}
              className={`max-w-full max-h-full object-contain drop-shadow-lg transition-all ${
                isSleeping ? 'opacity-85 brightness-90 saturate-75 filter blur-[0.2px]' : ''
              }`}
            />
          </div>
        ) : (
          /* Built-in Vector Artwork by Species & Stage */
          <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
            {renderVectorSpecies(species.id, stageIndex, isSleeping)}
          </div>
        )}

        {/* Equipped Accessories Overlays */}
        {hasAccessory('item-hat-grad') && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-4xl filter drop-shadow-md z-20 animate-bounce-gentle">
            🎓
          </div>
        )}
        {hasAccessory('item-crown') && (
          <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-4xl filter drop-shadow-lg z-20 animate-pulse-glow">
            👑
          </div>
        )}
        {hasAccessory('item-glasses') && (
          <div className="absolute top-10 sm:top-12 left-1/2 -translate-x-1/2 text-3xl filter drop-shadow-sm z-20">
            👓
          </div>
        )}
        {hasAccessory('item-ribbon') && (
          <div className="absolute top-4 right-2 text-3xl filter drop-shadow-sm z-20">
            🎀
          </div>
        )}
      </div>

      {/* Pet Shadow */}
      <div className="w-28 sm:w-36 h-4 bg-slate-900/15 rounded-full blur-sm mt-1 mx-auto" />
    </div>
  );
};

// Rich Vector Illustrations for species and their 4 stages
function renderVectorSpecies(speciesId: string, stageIndex: PetEvolutionStageIndex, isSleeping: boolean) {
  // If Stage 0 and species category is egg-born: Egg representation with species color accents
  const eggSpecies = ['naga', 'owl', 'iguana', 'kurakura', 'nemo', 'kakatua', 'sembrani'];
  const isEgg = stageIndex === 0 && eggSpecies.includes(speciesId);

  if (isEgg) {
    return (
      <svg viewBox="0 0 160 180" className="w-full h-full drop-shadow-lg">
        <defs>
          <radialGradient id="eggGrad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#fffbeb" />
            <stop offset="50%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </radialGradient>
        </defs>
        {/* Glowing Egg Body */}
        <ellipse cx="80" cy="95" rx="55" ry="70" fill="url(#eggGrad)" stroke="#d97706" strokeWidth="4" />
        {/* Egg Shell Pattern Spots */}
        <circle cx="65" cy="70" r="8" fill="#fbbf24" opacity="0.6" />
        <circle cx="95" cy="85" r="12" fill="#fbbf24" opacity="0.6" />
        <circle cx="60" cy="120" r="10" fill="#fbbf24" opacity="0.6" />
        <circle cx="100" cy="125" r="7" fill="#fbbf24" opacity="0.6" />
        {/* Cute Egg Crack */}
        <path d="M75,55 L85,65 L78,75 L88,85" fill="none" stroke="#b45309" strokeWidth="3" strokeLinecap="round" />
        {/* Little curious eyes peeking */}
        <circle cx="78" cy="73" r="3.5" fill="#1e293b" />
        <circle cx="85" cy="75" r="3.5" fill="#1e293b" />
        <circle cx="79" cy="72" r="1" fill="#ffffff" />
        <circle cx="86" cy="74" r="1" fill="#ffffff" />
        {/* Star Sparkle */}
        <path d="M120,45 L124,35 L128,45 L138,49 L128,53 L124,63 L120,53 L110,49 Z" fill="#fbbf24" />
      </svg>
    );
  }

  // Mammals Stage 0 (Baby) or other species
  switch (speciesId) {
    case 'kucing':
      return renderCat(stageIndex, isSleeping);
    case 'naga':
      return renderDragon(stageIndex, isSleeping);
    case 'kelinci':
      return renderRabbit(stageIndex, isSleeping);
    case 'panda':
    case 'panda_imut':
      return renderPanda(stageIndex, isSleeping, speciesId === 'panda_imut');
    case 'shiba':
      return renderShiba(stageIndex, isSleeping);
    case 'owl':
      return renderOwl(stageIndex, isSleeping);
    case 'hamster':
      return renderHamster(stageIndex, isSleeping);
    case 'iguana':
      return renderIguana(stageIndex, isSleeping);
    case 'kurakura':
      return renderTurtle(stageIndex, isSleeping);
    case 'nemo':
      return renderFish(stageIndex, isSleeping);
    case 'kakatua':
      return renderParrot(stageIndex, isSleeping);
    case 'sembrani':
      return renderPegasus(stageIndex, isSleeping);
    default:
      return renderCat(stageIndex, isSleeping);
  }
}

// 🐱 CAT VECTOR
function renderCat(stage: number, isSleeping: boolean) {
  const isBaby = stage === 0;
  const isAdult = stage === 3;
  return (
    <svg viewBox="0 0 180 180" className="w-full h-full drop-shadow-md">
      {/* Ears */}
      <polygon points="50,45 28,15 65,30" fill="#f59e0b" stroke="#b45309" strokeWidth="3" />
      <polygon points="48,42 35,22 60,32" fill="#fbcfe8" />
      <polygon points="130,45 152,15 115,30" fill="#f59e0b" stroke="#b45309" strokeWidth="3" />
      <polygon points="132,42 145,22 120,32" fill="#fbcfe8" />
      {/* Body */}
      <ellipse cx="90" cy="120" rx={isBaby ? 40 : 50} ry={isBaby ? 45 : 52} fill="#fbbf24" stroke="#d97706" strokeWidth="3" />
      {/* Chest Fluff */}
      <ellipse cx="90" cy="122" rx="28" ry="32" fill="#fffbeb" />
      {/* Head */}
      <circle cx="90" cy="72" r={isBaby ? 42 : 46} fill="#fbbf24" stroke="#d97706" strokeWidth="3" />
      {/* Head stripes */}
      <path d="M90,32 L90,44 M80,36 L84,46 M100,36 L96,46" stroke="#b45309" strokeWidth="3" strokeLinecap="round" />
      {/* Eyes */}
      {isSleeping ? (
        <g stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M68,72 Q76,80 84,72" />
          <path d="M96,72 Q104,80 112,72" />
        </g>
      ) : (
        <g>
          <ellipse cx="74" cy="70" rx={isAdult ? 8 : 9} ry={isAdult ? 9 : 10} fill="#1e293b" />
          <circle cx="72" cy="68" r="3" fill="#ffffff" />
          <ellipse cx="106" cy="70" rx={isAdult ? 8 : 9} ry={isAdult ? 9 : 10} fill="#1e293b" />
          <circle cx="104" cy="68" r="3" fill="#ffffff" />
        </g>
      )}
      {/* Nose & Mouth */}
      <polygon points="87,79 93,79 90,83" fill="#f43f5e" />
      <path d="M85,84 Q90,89 95,84" fill="none" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
      {/* Whiskers */}
      <line x1="55" y1="76" x2="35" y2="74" stroke="#92400e" strokeWidth="2" strokeLinecap="round" />
      <line x1="55" y1="82" x2="35" y2="85" stroke="#92400e" strokeWidth="2" strokeLinecap="round" />
      <line x1="125" y1="76" x2="145" y2="74" stroke="#92400e" strokeWidth="2" strokeLinecap="round" />
      <line x1="125" y1="82" x2="145" y2="85" stroke="#92400e" strokeWidth="2" strokeLinecap="round" />
      {/* Blush */}
      <circle cx="62" cy="82" r="6" fill="#f43f5e" opacity="0.3" />
      <circle cx="118" cy="82" r="6" fill="#f43f5e" opacity="0.3" />
      {/* Paws */}
      <ellipse cx="72" cy="155" rx="14" ry="10" fill="#fffbeb" stroke="#d97706" strokeWidth="2.5" />
      <ellipse cx="108" cy="155" rx="14" ry="10" fill="#fffbeb" stroke="#d97706" strokeWidth="2.5" />
      {/* Tail */}
      <path d="M135,135 Q160,110 150,90" fill="none" stroke="#d97706" strokeWidth="10" strokeLinecap="round" />
    </svg>
  );
}

// 🐲 DRAGON VECTOR
function renderDragon(stage: number, isSleeping: boolean) {
  return (
    <svg viewBox="0 0 180 180" className="w-full h-full drop-shadow-md">
      {/* Wings */}
      <path d="M40,95 Q10,65 35,45 Q50,65 55,85" fill="#a855f7" stroke="#7e22ce" strokeWidth="3" />
      <path d="M140,95 Q170,65 145,45 Q130,65 125,85" fill="#a855f7" stroke="#7e22ce" strokeWidth="3" />
      {/* Horns */}
      <polygon points="65,48 50,20 75,38" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
      <polygon points="115,48 130,20 105,38" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
      {/* Tail */}
      <path d="M135,140 Q165,145 155,120" fill="none" stroke="#059669" strokeWidth="12" strokeLinecap="round" />
      <polygon points="155,115 168,110 162,128" fill="#fbbf24" />
      {/* Body */}
      <ellipse cx="90" cy="120" rx="46" ry="50" fill="#10b981" stroke="#047857" strokeWidth="3" />
      <ellipse cx="90" cy="122" rx="26" ry="34" fill="#a7f3d0" />
      {/* Head */}
      <circle cx="90" cy="74" r="44" fill="#10b981" stroke="#047857" strokeWidth="3" />
      {/* Eyes */}
      {isSleeping ? (
        <g stroke="#064e3b" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M70,72 Q78,78 84,72" />
          <path d="M96,72 Q102,78 110,72" />
        </g>
      ) : (
        <g>
          <circle cx="74" cy="70" r="9" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
          <ellipse cx="74" cy="70" rx="3.5" ry="7" fill="#064e3b" />
          <circle cx="72" cy="67" r="2" fill="#ffffff" />
          <circle cx="106" cy="70" r="9" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
          <ellipse cx="106" cy="70" rx="3.5" ry="7" fill="#064e3b" />
          <circle cx="104" cy="67" r="2" fill="#ffffff" />
        </g>
      )}
      {/* Snout & Smile */}
      <ellipse cx="90" cy="85" rx="16" ry="10" fill="#34d399" />
      <circle cx="85" cy="83" r="2" fill="#047857" />
      <circle cx="95" cy="83" r="2" fill="#047857" />
      <path d="M85,88 Q90,92 95,88" fill="none" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// 🐰 RABBIT VECTOR
function renderRabbit(stage: number, isSleeping: boolean) {
  return (
    <svg viewBox="0 0 180 180" className="w-full h-full drop-shadow-md">
      {/* Long Ears */}
      <ellipse cx="65" cy="35" rx="12" ry="36" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="3" transform="rotate(-10 65 35)" />
      <ellipse cx="65" cy="35" rx="6" ry="24" fill="#fda4af" transform="rotate(-10 65 35)" />
      <ellipse cx="115" cy="35" rx="12" ry="36" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="3" transform="rotate(10 115 35)" />
      <ellipse cx="115" cy="35" rx="6" ry="24" fill="#fda4af" transform="rotate(10 115 35)" />
      {/* Body */}
      <ellipse cx="90" cy="125" rx="46" ry="48" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="3" />
      <ellipse cx="90" cy="126" rx="26" ry="30" fill="#f1f5f9" />
      {/* Head */}
      <circle cx="90" cy="80" r="42" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="3" />
      {/* Eyes */}
      {isSleeping ? (
        <g stroke="#334155" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M70,80 Q78,86 84,80" />
          <path d="M96,80 Q102,86 110,80" />
        </g>
      ) : (
        <g>
          <ellipse cx="74" cy="78" rx="8" ry="9" fill="#be185d" />
          <circle cx="72" cy="75" r="2.8" fill="#ffffff" />
          <ellipse cx="106" cy="78" rx="8" ry="9" fill="#be185d" />
          <circle cx="104" cy="75" r="2.8" fill="#ffffff" />
        </g>
      )}
      {/* Nose & Mouth */}
      <polygon points="87,86 93,86 90,90" fill="#f43f5e" />
      <path d="M85,91 Q90,95 95,91" fill="none" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" />
      {/* Cheeks */}
      <circle cx="64" cy="88" r="6" fill="#fbcfe8" opacity="0.7" />
      <circle cx="116" cy="88" r="6" fill="#fbcfe8" opacity="0.7" />
      {/* Paws */}
      <ellipse cx="72" cy="160" rx="14" ry="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
      <ellipse cx="108" cy="160" rx="14" ry="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
    </svg>
  );
}

// 🐼 PANDA / PANDA IMUT
function renderPanda(stage: number, isSleeping: boolean, isRedPanda: boolean = false) {
  const mainColor = isRedPanda ? '#ea580c' : '#ffffff';
  const earColor = isRedPanda ? '#7c2d12' : '#0f172a';
  const strokeColor = isRedPanda ? '#9a3412' : '#0f172a';

  return (
    <svg viewBox="0 0 180 180" className="w-full h-full drop-shadow-md">
      {/* Ears */}
      <circle cx="50" cy="45" r="18" fill={earColor} />
      <circle cx="130" cy="45" r="18" fill={earColor} />
      {/* Body */}
      <ellipse cx="90" cy="125" rx="50" ry="48" fill={mainColor} stroke={strokeColor} strokeWidth="3" />
      {!isRedPanda && (
        <path d="M45,100 Q90,130 135,100 L135,135 Q90,150 45,135 Z" fill="#0f172a" opacity="0.9" />
      )}
      {/* Head */}
      <circle cx="90" cy="80" r="45" fill={mainColor} stroke={strokeColor} strokeWidth="3" />
      {/* Eye Patches */}
      <ellipse cx="72" cy="78" rx="14" ry="12" fill={earColor} transform="rotate(-15 72 78)" />
      <ellipse cx="108" cy="78" rx="14" ry="12" fill={earColor} transform="rotate(15 108 78)" />
      {/* Eyes */}
      {isSleeping ? (
        <g stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none">
          <path d="M68,78 Q72,82 76,78" />
          <path d="M104,78 Q108,82 112,78" />
        </g>
      ) : (
        <g>
          <circle cx="72" cy="78" r="4.5" fill="#ffffff" />
          <circle cx="73" cy="78" r="2.5" fill="#0f172a" />
          <circle cx="108" cy="78" r="4.5" fill="#ffffff" />
          <circle cx="107" cy="78" r="2.5" fill="#0f172a" />
        </g>
      )}
      {/* Snout */}
      <ellipse cx="90" cy="92" rx="12" ry="8" fill="#f8fafc" />
      <ellipse cx="90" cy="90" rx="5" ry="3.5" fill="#0f172a" />
      <path d="M86,94 Q90,97 94,94" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 🐕 SHIBA INU
function renderShiba(stage: number, isSleeping: boolean) {
  return (
    <svg viewBox="0 0 180 180" className="w-full h-full drop-shadow-md">
      {/* Ears */}
      <polygon points="50,55 35,22 68,36" fill="#d97706" stroke="#b45309" strokeWidth="3" />
      <polygon points="130,55 145,22 112,36" fill="#d97706" stroke="#b45309" strokeWidth="3" />
      {/* Body */}
      <ellipse cx="90" cy="125" rx="46" ry="48" fill="#d97706" stroke="#b45309" strokeWidth="3" />
      <ellipse cx="90" cy="126" rx="26" ry="32" fill="#fef3c7" />
      {/* Head */}
      <circle cx="90" cy="80" r="44" fill="#d97706" stroke="#b45309" strokeWidth="3" />
      {/* White cheek patches */}
      <ellipse cx="65" cy="88" rx="16" ry="14" fill="#fef3c7" />
      <ellipse cx="115" cy="88" rx="16" ry="14" fill="#fef3c7" />
      {/* Eyes */}
      {isSleeping ? (
        <g stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M68,78 Q74,84 80,78" />
          <path d="M100,78 Q106,84 112,78" />
        </g>
      ) : (
        <g>
          <ellipse cx="74" cy="76" rx="6" ry="7" fill="#1e293b" />
          <circle cx="73" cy="74" r="2" fill="#ffffff" />
          <ellipse cx="106" cy="76" rx="6" ry="7" fill="#1e293b" />
          <circle cx="105" cy="74" r="2" fill="#ffffff" />
        </g>
      )}
      {/* Nose & Muzzle */}
      <ellipse cx="90" cy="88" rx="14" ry="10" fill="#fef3c7" />
      <ellipse cx="90" cy="85" rx="5" ry="3.5" fill="#1e293b" />
      <path d="M85,91 Q90,96 95,91" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
      {/* Tongue out */}
      <path d="M88,93 Q90,99 92,93" fill="#f43f5e" />
    </svg>
  );
}

// 🦉 OWL
function renderOwl(stage: number, isSleeping: boolean) {
  return (
    <svg viewBox="0 0 180 180" className="w-full h-full drop-shadow-md">
      {/* Ear Tufts */}
      <polygon points="55,45 35,20 68,35" fill="#6366f1" stroke="#4338ca" strokeWidth="3" />
      <polygon points="125,45 145,20 112,35" fill="#6366f1" stroke="#4338ca" strokeWidth="3" />
      {/* Body */}
      <ellipse cx="90" cy="115" rx="48" ry="54" fill="#6366f1" stroke="#4338ca" strokeWidth="3" />
      <ellipse cx="90" cy="120" rx="30" ry="38" fill="#e0e7ff" />
      {/* Large Eyes */}
      <circle cx="68" cy="75" r="22" fill="#ffffff" stroke="#4338ca" strokeWidth="3" />
      <circle cx="112" cy="75" r="22" fill="#ffffff" stroke="#4338ca" strokeWidth="3" />
      {isSleeping ? (
        <g stroke="#312e81" strokeWidth="3.5" strokeLinecap="round" fill="none">
          <path d="M58,75 Q68,83 78,75" />
          <path d="M102,75 Q112,83 122,75" />
        </g>
      ) : (
        <g>
          <circle cx="68" cy="75" r="11" fill="#f59e0b" />
          <circle cx="68" cy="75" r="6" fill="#1e1b4b" />
          <circle cx="65" cy="72" r="2.5" fill="#ffffff" />
          <circle cx="112" cy="75" r="11" fill="#f59e0b" />
          <circle cx="112" cy="75" r="6" fill="#1e1b4b" />
          <circle cx="109" cy="72" r="2.5" fill="#ffffff" />
        </g>
      )}
      {/* Beak */}
      <polygon points="85,82 95,82 90,94" fill="#f59e0b" stroke="#b45309" strokeWidth="2" />
    </svg>
  );
}

// 🐹 HAMSTER
function renderHamster(stage: number, isSleeping: boolean) {
  return (
    <svg viewBox="0 0 180 180" className="w-full h-full drop-shadow-md">
      {/* Round ears */}
      <circle cx="50" cy="50" r="16" fill="#f97316" stroke="#c2410c" strokeWidth="3" />
      <circle cx="50" cy="50" r="9" fill="#fed7aa" />
      <circle cx="130" cy="50" r="16" fill="#f97316" stroke="#c2410c" strokeWidth="3" />
      <circle cx="130" cy="50" r="9" fill="#fed7aa" />
      {/* Round Body */}
      <circle cx="90" cy="115" r="54" fill="#fb923c" stroke="#c2410c" strokeWidth="3" />
      <ellipse cx="90" cy="120" rx="34" ry="40" fill="#fff7ed" />
      {/* Giant Chubby Cheeks */}
      <circle cx="55" cy="100" r="22" fill="#fff7ed" stroke="#fed7aa" strokeWidth="2" />
      <circle cx="125" cy="100" r="22" fill="#fff7ed" stroke="#fed7aa" strokeWidth="2" />
      {/* Eyes */}
      {isSleeping ? (
        <g stroke="#1c1917" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M68,82 Q74,88 80,82" />
          <path d="M100,82 Q106,88 112,82" />
        </g>
      ) : (
        <g>
          <circle cx="74" cy="80" r="7" fill="#1c1917" />
          <circle cx="72" cy="78" r="2.5" fill="#ffffff" />
          <circle cx="106" cy="80" r="7" fill="#1c1917" />
          <circle cx="104" cy="78" r="2.5" fill="#ffffff" />
        </g>
      )}
      {/* Nose & tiny tooth */}
      <ellipse cx="90" cy="90" rx="5" ry="3.5" fill="#f43f5e" />
      <rect x="88" y="93" width="4" height="4" fill="#ffffff" rx="1" stroke="#cbd5e1" strokeWidth="1" />
    </svg>
  );
}

// 🦎 IGUANA
function renderIguana(stage: number, isSleeping: boolean) {
  return (
    <svg viewBox="0 0 180 180" className="w-full h-full drop-shadow-md">
      {/* Spikes on Back */}
      <polygon points="65,50 68,35 73,50" fill="#15803d" />
      <polygon points="80,45 84,28 89,45" fill="#15803d" />
      <polygon points="95,45 100,28 105,45" fill="#15803d" />
      <polygon points="112,50 116,35 120,50" fill="#15803d" />
      {/* Body */}
      <ellipse cx="90" cy="115" rx="50" ry="46" fill="#22c55e" stroke="#16a34a" strokeWidth="3" />
      <ellipse cx="90" cy="118" rx="30" ry="32" fill="#bbf7d0" />
      {/* Head */}
      <ellipse cx="90" cy="75" rx="42" ry="36" fill="#22c55e" stroke="#16a34a" strokeWidth="3" />
      {/* Eyes */}
      {isSleeping ? (
        <path d="M72,72 Q80,78 88,72 M96,72 Q104,78 112,72" stroke="#14532d" strokeWidth="3" strokeLinecap="round" fill="none" />
      ) : (
        <g>
          <circle cx="74" cy="70" r="9" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
          <ellipse cx="74" cy="70" rx="2.5" ry="6" fill="#14532d" />
          <circle cx="106" cy="70" r="9" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
          <ellipse cx="106" cy="70" rx="2.5" ry="6" fill="#14532d" />
        </g>
      )}
      {/* Smile */}
      <path d="M78,88 Q90,95 102,88" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// 🐢 TURTLE
function renderTurtle(stage: number, isSleeping: boolean) {
  return (
    <svg viewBox="0 0 180 180" className="w-full h-full drop-shadow-md">
      {/* Shell */}
      <ellipse cx="90" cy="115" rx="54" ry="48" fill="#15803d" stroke="#166534" strokeWidth="3.5" />
      <polygon points="90,85 110,98 105,125 75,125 70,98" fill="#16a34a" stroke="#14532d" strokeWidth="2" />
      {/* Head */}
      <ellipse cx="90" cy="65" rx="26" ry="24" fill="#4ade80" stroke="#16a34a" strokeWidth="3" />
      {/* Eyes */}
      {isSleeping ? (
        <path d="M78,65 Q82,70 86,65 M94,65 Q98,70 102,65" stroke="#14532d" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      ) : (
        <g>
          <circle cx="80" cy="63" r="5" fill="#14532d" />
          <circle cx="79" cy="62" r="1.8" fill="#ffffff" />
          <circle cx="100" cy="63" r="5" fill="#14532d" />
          <circle cx="99" cy="62" r="1.8" fill="#ffffff" />
        </g>
      )}
      {/* Smile */}
      <path d="M84,74 Q90,78 96,74" stroke="#14532d" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// 🐟 CLOWNFISH NEMO
function renderFish(stage: number, isSleeping: boolean) {
  return (
    <svg viewBox="0 0 180 180" className="w-full h-full drop-shadow-md">
      {/* Tail Fin */}
      <polygon points="140,90 175,60 165,90 175,120" fill="#f97316" stroke="#c2410c" strokeWidth="3" />
      {/* Fins */}
      <path d="M90,50 Q110,35 125,55" fill="#f97316" stroke="#c2410c" strokeWidth="2.5" />
      {/* Fish Body */}
      <ellipse cx="85" cy="90" rx="55" ry="42" fill="#ea580c" stroke="#9a3412" strokeWidth="3" />
      {/* White Stripes */}
      <path d="M65,52 Q75,90 65,128 L75,128 Q85,90 75,52 Z" fill="#ffffff" stroke="#9a3412" strokeWidth="1.5" />
      <path d="M105,58 Q112,90 105,122 L112,122 Q120,90 112,58 Z" fill="#ffffff" stroke="#9a3412" strokeWidth="1.5" />
      {/* Eyes */}
      {isSleeping ? (
        <path d="M45,86 Q52,92 59,86" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" fill="none" />
      ) : (
        <g>
          <circle cx="52" cy="82" r="9" fill="#ffffff" stroke="#9a3412" strokeWidth="2" />
          <circle cx="50" cy="82" r="5" fill="#1e293b" />
          <circle cx="48" cy="80" r="2" fill="#ffffff" />
        </g>
      )}
    </svg>
  );
}

// 🦜 PARROT KAKATUA
function renderParrot(stage: number, isSleeping: boolean) {
  return (
    <svg viewBox="0 0 180 180" className="w-full h-full drop-shadow-md">
      {/* Yellow Crest */}
      <path d="M90,45 Q70,10 90,15 Q105,18 100,45" fill="#facc15" stroke="#ca8a04" strokeWidth="3" />
      {/* Body */}
      <ellipse cx="90" cy="115" rx="44" ry="50" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="3" />
      <ellipse cx="90" cy="120" rx="24" ry="34" fill="#f1f5f9" />
      {/* Head */}
      <circle cx="90" cy="70" r="38" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="3" />
      {/* Eyes */}
      {isSleeping ? (
        <path d="M72,70 Q78,76 84,70" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      ) : (
        <g>
          <circle cx="76" cy="68" r="7" fill="#1e293b" />
          <circle cx="74" cy="66" r="2.5" fill="#ffffff" />
        </g>
      )}
      {/* Hooked Beak */}
      <path d="M60,68 Q40,78 52,90 Q65,85 62,75 Z" fill="#475569" stroke="#1e293b" strokeWidth="2" />
    </svg>
  );
}

// 🦄 PEGASUS KUDA SEMBRANI
function renderPegasus(stage: number, isSleeping: boolean) {
  return (
    <svg viewBox="0 0 180 180" className="w-full h-full drop-shadow-md">
      {/* Feathery Wings */}
      <path d="M45,95 Q15,45 60,35 Q65,65 70,85" fill="#e0e7ff" stroke="#6366f1" strokeWidth="3" />
      <path d="M135,95 Q165,45 120,35 Q115,65 110,85" fill="#e0e7ff" stroke="#6366f1" strokeWidth="3" />
      {/* Star Horn */}
      <polygon points="85,38 90,12 95,38" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
      {/* Body */}
      <ellipse cx="90" cy="120" rx="46" ry="48" fill="#ffffff" stroke="#c7d2fe" strokeWidth="3" />
      {/* Head */}
      <circle cx="90" cy="70" r="38" fill="#ffffff" stroke="#c7d2fe" strokeWidth="3" />
      {/* Mane */}
      <path d="M90,32 Q75,50 85,70" stroke="#818cf8" strokeWidth="6" strokeLinecap="round" fill="none" />
      {/* Eyes */}
      {isSleeping ? (
        <path d="M72,70 Q80,76 88,70 M92,70 Q100,76 108,70" stroke="#4338ca" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      ) : (
        <g>
          <ellipse cx="78" cy="68" rx="6" ry="7" fill="#4338ca" />
          <circle cx="76" cy="66" r="2.5" fill="#ffffff" />
          <ellipse cx="102" cy="68" rx="6" ry="7" fill="#4338ca" />
          <circle cx="100" cy="66" r="2.5" fill="#ffffff" />
        </g>
      )}
      <ellipse cx="90" cy="85" rx="14" ry="8" fill="#f8fafc" stroke="#c7d2fe" strokeWidth="1.5" />
      <path d="M85,88 Q90,92 95,88" stroke="#4338ca" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}
