import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  ShoppingBag,
  Package,
  Heart,
  Moon,
  Sun,
  Shuffle,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Zap
} from 'lucide-react';
import { Student, ShopItem, PetNeed, PetSpecies } from '../../types';
import { storageService } from '../../services/storage';
import { soundManager } from '../../services/audio';

interface PetNeedQuickBarProps {
  student: Student;
  species: PetSpecies;
  activeNeed: PetNeed | null;
  onItemUsed: () => void;
  onOpenShop: () => void;
  onOpenInventory: () => void;
  onTapPet: () => void;
  onToggleSleep: () => void;
  onPetting: () => void;
}

export const PetNeedQuickBar: React.FC<PetNeedQuickBarProps> = ({
  student,
  species,
  activeNeed,
  onItemUsed,
  onOpenShop,
  onOpenInventory,
  onTapPet,
  onToggleSleep,
  onPetting
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'makanan' | 'minuman' | 'sabun' | 'mainan'>('all');
  const [actionFeedback, setActionFeedback] = useState<{ message: string; isBonus: boolean } | null>(null);

  const allShopItems = storageService.getShopItems();

  // Find all consumable items that the student currently owns (qty > 0)
  const ownedConsumableItems: { item: ShopItem; qty: number }[] = [];
  Object.entries(student.inventory).forEach(([itemId, qty]) => {
    if (qty > 0) {
      const item = allShopItems.find((i) => i.id === itemId);
      if (item && item.category !== 'aksesoris' && item.category !== 'dekorasi') {
        ownedConsumableItems.push({ item, qty });
      }
    }
  });

  // Items that specifically match the pet's active need
  const matchingOwnedItems = ownedConsumableItems.filter(({ item }) => {
    if (!activeNeed) return false;
    if (activeNeed.targetItemId && activeNeed.targetItemId === item.id) return true;
    return activeNeed.category === item.category;
  });

  // Filtered list for the quick care hotbar
  const filteredOwnedItems = ownedConsumableItems.filter(({ item }) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  // Handle Giving an Item directly from the Beranda Ruang Pet
  const handleGiveItem = (item: ShopItem) => {
    const currentQty = student.inventory[item.id] || 0;
    if (currentQty <= 0) return;

    const updated = { ...student };

    // Apply stat boosts to needs meters
    const newNeeds = { ...updated.needs };
    if (item.boosts.hunger) newNeeds.hunger = Math.min(100, newNeeds.hunger + item.boosts.hunger);
    if (item.boosts.thirst) newNeeds.thirst = Math.min(100, newNeeds.thirst + item.boosts.thirst);
    if (item.boosts.hygiene) newNeeds.hygiene = Math.min(100, newNeeds.hygiene + item.boosts.hygiene);
    if (item.boosts.happiness) newNeeds.happiness = Math.min(100, newNeeds.happiness + item.boosts.happiness);
    if (item.boosts.energy) newNeeds.energy = Math.min(100, newNeeds.energy + item.boosts.energy);
    updated.needs = newNeeds;

    // Deduct consumable quantity
    updated.inventory[item.id] = currentQty - 1;

    // Play appropriate sound & increment daily quests
    if (item.category === 'makanan' || item.category === 'minuman') {
      soundManager.playMunch();
      setTimeout(() => soundManager.playPetChirp(species.id, student.evolutionStage), 320);
      storageService.incrementQuestProgress('feed', 1);
    } else if (item.category === 'sabun') {
      soundManager.playBubble();
      setTimeout(() => soundManager.playPetChirp(species.id, student.evolutionStage), 320);
      storageService.incrementQuestProgress('clean', 1);
    } else if (item.category === 'mainan') {
      soundManager.playPetChirp(species.id, student.evolutionStage);
      storageService.incrementQuestProgress('play', 1);
    }

    // Base XP
    let xpGain = 15;
    let isMatch = false;

    // Check if this item satisfies pet's current desire / need!
    if (activeNeed && (activeNeed.targetItemId === item.id || activeNeed.category === item.category)) {
      isMatch = true;
      xpGain += activeNeed.rewardXp;
      soundManager.playStarChime();
      try {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.7 }
        });
      } catch {
        // ignore
      }

      // Pick next random need from teacher's database
      const allNeeds = storageService.getPetNeeds();
      if (allNeeds.length > 0) {
        const nextNeed = allNeeds[Math.floor(Math.random() * allNeeds.length)];
        updated.currentNeedId = nextNeed.id;
      }
    }

    storageService.saveStudent(updated);
    storageService.addStudentXp(student.id, xpGain);

    const feedbackText = isMatch
      ? `🎉 Luar Biasa! Memberikan "${item.name}" sangat disukai ${student.petNickname}! (+${xpGain} XP & Bar Pertumbuhan Naik!)`
      : `Memberikan "${item.name}" pada ${student.petNickname}. (+${xpGain} XP)`;

    setActionFeedback({
      message: feedbackText,
      isBonus: isMatch
    });

    setTimeout(() => {
      setActionFeedback(null);
    }, 4500);

    onItemUsed();
  };

  return (
    <div className="space-y-3.5">
      {/* Real-time Feedback Banner */}
      {actionFeedback && (
        <div
          className={`p-3.5 rounded-2xl border-2 text-xs font-bold flex items-center justify-between gap-3 shadow-md animate-fadeIn ${
            actionFeedback.isBonus
              ? 'bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-200 border-amber-400 text-amber-950 ring-2 ring-amber-300'
              : 'bg-emerald-50 border-emerald-300 text-emerald-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {actionFeedback.isBonus ? (
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0 animate-spin" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            )}
            <span>{actionFeedback.message}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-xs px-2 py-0.5 rounded-md hover:bg-black/10 text-slate-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* --- SECTION 1: KEBUTUHAN UTAMA PET SAAT INI (PET NEED SPOTLIGHT) --- */}
      <div className="bg-gradient-to-br from-amber-500 via-amber-400 to-yellow-400 p-0.5 rounded-3xl shadow-lg">
        <div className="bg-white rounded-[22px] p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-100">
            {/* Header with Pet Wish */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-900 border-2 border-amber-300 flex items-center justify-center text-2xl shadow-inner shrink-0 animate-bounce-gentle">
                {activeNeed?.icon || '💭'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                    Kebutuhan Pet Saat Ini
                  </span>
                  <span className="text-[11px] font-extrabold text-amber-700 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                    Bonus +{activeNeed?.rewardXp || 25} XP
                  </span>
                </div>
                <h3 className="font-black text-slate-800 text-sm sm:text-base mt-0.5">
                  {student.petNickname}: &ldquo;{activeNeed?.text || 'Aku ingin bermain dan makan yang lezat!'}&rdquo;
                </h3>
              </div>
            </div>

            {/* Quick Actions (Randomize Desire / Touch Pet) */}
            <button
              onClick={onTapPet}
              className="self-start sm:self-auto px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-xl border border-amber-200 flex items-center gap-1.5 transition active:scale-95 shadow-xs"
              title="Acak atau ganti keinginan pet"
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-600" />
              <span>Ganti Keinginan</span>
            </button>
          </div>

          {/* Action Area: Matching Items or Special Non-Item Actions */}
          <div className="pt-3.5">
            {/* Case A: Need is 'elus' */}
            {activeNeed?.category === 'elus' && (
              <div className="flex items-center justify-between gap-3 bg-rose-50 p-3.5 rounded-2xl border border-rose-200">
                <div className="text-xs text-rose-900 font-bold">
                  🐾 {student.petNickname} ingin dimanja dan dielus sayang olehmu!
                </div>
                <button
                  onClick={onPetting}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition active:scale-95 shrink-0"
                >
                  <Heart className="w-4 h-4 fill-white" />
                  <span>Elus Sayang Sekarang</span>
                </button>
              </div>
            )}

            {/* Case B: Need is 'tidur' */}
            {activeNeed?.category === 'tidur' && (
              <div className="flex items-center justify-between gap-3 bg-indigo-50 p-3.5 rounded-2xl border border-indigo-200">
                <div className="text-xs text-indigo-900 font-bold">
                  🌙 {student.petNickname} mengantuk dan butuh istirahat sejenak.
                </div>
                <button
                  onClick={onToggleSleep}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition active:scale-95 shrink-0"
                >
                  {student.isSleeping ? <Sun className="w-4 h-4 fill-yellow-300" /> : <Moon className="w-4 h-4" />}
                  <span>{student.isSleeping ? 'Bangunkan Pet' : 'Tidurkan Pet'}</span>
                </button>
              </div>
            )}

            {/* Case C: Need requires Item (Makanan, Minuman, Sabun, Mainan, etc.) */}
            {activeNeed?.category !== 'elus' && activeNeed?.category !== 'tidur' && (
              <div>
                {matchingOwnedItems.length > 0 ? (
                  <div>
                    <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Item di Tas yang Cocok dengan Keinginan Pet:</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {matchingOwnedItems.map(({ item, qty }) => (
                        <div
                          key={item.id}
                          className="bg-amber-50/70 border-2 border-amber-400 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-xs hover:shadow-md transition"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-3xl shrink-0 filter drop-shadow-xs">{item.icon}</span>
                            <div className="min-w-0">
                              <div className="font-extrabold text-xs text-slate-900 truncate">
                                {item.name}
                              </div>
                              <div className="text-[11px] text-amber-800 font-bold flex items-center gap-1.5">
                                <span className="bg-amber-200 text-amber-950 px-1.5 py-0.2 rounded-md">
                                  Tersedia: {qty}
                                </span>
                                {item.boosts.hunger && <span>+{item.boosts.hunger} 🍖</span>}
                                {item.boosts.thirst && <span>+{item.boosts.thirst} 💧</span>}
                                {item.boosts.hygiene && <span>+{item.boosts.hygiene} 🧼</span>}
                                {item.boosts.happiness && <span>+{item.boosts.happiness} 🎾</span>}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleGiveItem(item)}
                            className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-amber-950 font-black text-xs rounded-xl shadow transition active:scale-95 shrink-0 flex items-center gap-1 border border-amber-300"
                          >
                            <span>Beri</span>
                            <span>✨</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border-2 border-dashed border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 text-base">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          Kamu belum memiliki item {activeNeed?.category} yang dicari pet di tas.
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Beli item lezat atau mainan seru di Pet Shop menggunakan saldo {student.stars} bintangmu!
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={onOpenShop}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition active:scale-95 shrink-0"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Beli di Pet Shop</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- SECTION 2: RAK KEBUTUHAN PET & PERAWATAN CEPAT (QUICK ITEM SHELF) --- */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold font-heading text-slate-800 text-sm flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-600" />
              <span>Rak Kebutuhan Pet (Beranda Ruang Pet)</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Gunakan item langsung dari ruang pet tanpa harus membuka tas inventory.
            </p>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              onClick={onOpenShop}
              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl border border-amber-200 flex items-center gap-1 transition"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Beli Item</span>
            </button>
            <button
              onClick={onOpenInventory}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 transition"
            >
              <Package className="w-3.5 h-3.5" />
              <span>Buka Tas ({ownedConsumableItems.reduce((acc, curr) => acc + curr.qty, 0)})</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { id: 'all', label: `Semua (${ownedConsumableItems.reduce((acc, curr) => acc + curr.qty, 0)})` },
            { id: 'makanan', label: '🍖 Makanan' },
            { id: 'minuman', label: '💧 Minuman' },
            { id: 'sabun', label: '🧼 Mandi / Sabun' },
            { id: 'mainan', label: '🎾 Mainan' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as typeof selectedCategory)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition text-[11px] ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Item Cards Grid / Horizontal Shelf */}
        {filteredOwnedItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-1">
            {filteredOwnedItems.map(({ item, qty }) => {
              const isMatch =
                activeNeed && (activeNeed.targetItemId === item.id || activeNeed.category === item.category);

              return (
                <div
                  key={item.id}
                  className={`relative p-3 rounded-2xl border-2 transition flex flex-col justify-between ${
                    isMatch
                      ? 'border-amber-400 bg-amber-50/60 ring-2 ring-amber-300 shadow-md animate-pulse'
                      : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  {/* Top Indicators */}
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="text-3xl select-none filter drop-shadow-xs">{item.icon}</span>
                    <span className="text-[11px] font-black bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full border border-slate-200">
                      x{qty}
                    </span>
                  </div>

                  {/* Item Info */}
                  <div className="mb-2">
                    <div className="font-extrabold text-xs text-slate-800 truncate" title={item.name}>
                      {item.name}
                    </div>

                    {isMatch ? (
                      <div className="text-[10px] font-black text-amber-700 flex items-center gap-0.5 mt-0.5">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>Dicari Pet! (+Bonus)</span>
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                        {item.boosts.hunger && `+${item.boosts.hunger} Kenyang `}
                        {item.boosts.thirst && `+${item.boosts.thirst} Haus `}
                        {item.boosts.hygiene && `+${item.boosts.hygiene} Bersih `}
                        {item.boosts.happiness && `+${item.boosts.happiness} Senang `}
                      </div>
                    )}
                  </div>

                  {/* Give Button */}
                  <button
                    onClick={() => handleGiveItem(item)}
                    className={`w-full py-1.5 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 active:scale-95 shadow-xs ${
                      isMatch
                        ? 'bg-amber-500 hover:bg-amber-600 text-white font-black'
                        : 'bg-slate-100 hover:bg-amber-100 text-slate-800 hover:text-amber-900 border border-slate-200'
                    }`}
                  >
                    <span>Beri</span>
                    <span>{isMatch ? '✨' : '➔'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 px-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <div className="text-3xl mb-1.5">🎒</div>
            <div className="font-bold text-xs text-slate-700">
              Tidak ada item {selectedCategory !== 'all' ? selectedCategory : ''} di tas saat ini
            </div>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-0.5 mb-3">
              Tukarkan bintang belajarmu di Pet Shop untuk membeli makanan, minuman, sabun, dan mainan!
            </p>
            <button
              onClick={onOpenShop}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow inline-flex items-center gap-1.5 transition active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Kunjungi Pet Shop Sekarang</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
