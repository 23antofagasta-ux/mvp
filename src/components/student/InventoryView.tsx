import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Package, Sparkles, Check, Heart, Shield, ShoppingBag } from 'lucide-react';
import { Student, ShopItem, PetNeed } from '../../types';
import { storageService } from '../../services/storage';
import { soundManager } from '../../services/audio';

interface InventoryViewProps {
  student: Student;
  onItemUsed: () => void;
  onOpenShop: () => void;
  activeNeed?: PetNeed | null;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  student,
  onItemUsed,
  onOpenShop,
  activeNeed
}) => {
  const [useNotification, setUseNotification] = useState<string | null>(null);

  const allShopItems = storageService.getShopItems();

  // Find owned items
  const ownedItemEntries = Object.entries(student.inventory).filter(([_, qty]) => qty > 0);

  const handleUseItem = (item: ShopItem) => {
    const currentQty = student.inventory[item.id] || 0;
    if (currentQty <= 0 && item.category !== 'aksesoris') return;

    const updated = { ...student };

    // Apply stat boosts to needs meters
    const newNeeds = { ...updated.needs };
    if (item.boosts.hunger) newNeeds.hunger = Math.min(100, newNeeds.hunger + item.boosts.hunger);
    if (item.boosts.thirst) newNeeds.thirst = Math.min(100, newNeeds.thirst + item.boosts.thirst);
    if (item.boosts.hygiene) newNeeds.hygiene = Math.min(100, newNeeds.hygiene + item.boosts.hygiene);
    if (item.boosts.happiness) newNeeds.happiness = Math.min(100, newNeeds.happiness + item.boosts.happiness);
    if (item.boosts.energy) newNeeds.energy = Math.min(100, newNeeds.energy + item.boosts.energy);
    updated.needs = newNeeds;

    // Check if accessory
    if (item.category === 'aksesoris') {
      const isAlreadyEquipped = updated.equippedAccessories.includes(item.id);
      if (isAlreadyEquipped) {
        updated.equippedAccessories = updated.equippedAccessories.filter((id) => id !== item.id);
        setUseNotification(`Melepas "${item.name}".`);
      } else {
        updated.equippedAccessories = [...updated.equippedAccessories, item.id];
        setUseNotification(`Mengenakan "${item.name}" pada pet!`);
        soundManager.playStarChime();
      }
      storageService.saveStudent(updated);
      onItemUsed();
      return;
    }

    // Deduct consumable quantity
    updated.inventory[item.id] = currentQty - 1;

    // Play appropriate sound
    if (item.category === 'makanan' || item.category === 'minuman') {
      soundManager.playMunch();
      storageService.incrementQuestProgress('feed', 1);
    } else if (item.category === 'sabun') {
      soundManager.playBubble();
      storageService.incrementQuestProgress('clean', 1);
    } else if (item.category === 'mainan') {
      soundManager.playPurr();
      storageService.incrementQuestProgress('play', 1);
    }

    // Base XP
    let xpGain = 15;
    let matchBonusMessage = '';

    // Check if this item satisfies pet's current desire / need!
    if (activeNeed && (activeNeed.targetItemId === item.id || activeNeed.category === item.category)) {
      xpGain += activeNeed.rewardXp;
      matchBonusMessage = ` 🎉 Sesuai Keinginan Pet! Bonus +${activeNeed.rewardXp} XP & Bar Tumbuh!`;
      soundManager.playStarChime();
      try {
        confetti({ particleCount: 60, spread: 60 });
      } catch {
        // ignore
      }
      // Pick next random need
      const allNeeds = storageService.getPetNeeds();
      if (allNeeds.length > 0) {
        const nextNeed = allNeeds[Math.floor(Math.random() * allNeeds.length)];
        updated.currentNeedId = nextNeed.id;
      }
    }

    storageService.saveStudent(updated);
    storageService.addStudentXp(student.id, xpGain);

    setUseNotification(`Memberikan "${item.name}" pada pet! (+${xpGain} XP)${matchBonusMessage}`);
    onItemUsed();
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="bg-white rounded-3xl p-5 border-2 border-amber-200 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-2xl shadow-inner">
            🎒
          </div>
          <div>
            <h3 className="font-extrabold font-heading text-slate-800 text-base">
              Tas Barang (Inventory)
            </h3>
            <p className="text-xs text-slate-500">
              Gunakan item untuk merawat pet atau pasang aksesoris favoritmu.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenShop}
          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Beli Item di Toko</span>
        </button>
      </div>

      {/* Notification Banner */}
      {useNotification && (
        <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-2xl text-xs font-bold text-amber-950 flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{useNotification}</span>
        </div>
      )}

      {/* Grid of Owned Items */}
      {ownedItemEntries.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {ownedItemEntries.map(([itemId, qty]) => {
            const item = allShopItems.find((i) => i.id === itemId);
            if (!item) return null;

            const isAccessory = item.category === 'aksesoris';
            const isEquipped = isAccessory && student.equippedAccessories.includes(item.id);
            const matchesActiveNeed =
              activeNeed && (activeNeed.targetItemId === item.id || activeNeed.category === item.category);

            return (
              <div
                key={itemId}
                className={`bg-white rounded-3xl p-4 border-2 transition flex flex-col justify-between shadow-xs ${
                  matchesActiveNeed
                    ? 'border-amber-400 bg-amber-50/40 shadow-md ring-2 ring-amber-300 animate-pulse'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-3xl p-2 bg-amber-50 rounded-2xl border border-amber-100">
                      {item.icon}
                    </span>
                    <span className="text-xs font-extrabold bg-slate-100 text-slate-800 px-2 py-0.5 rounded-full">
                      Jumlah: {qty}
                    </span>
                  </div>

                  <h4 className="font-extrabold font-heading text-slate-800 text-xs sm:text-sm mt-3">
                    {item.name}
                  </h4>
                  <span className="text-[10px] uppercase font-bold text-slate-500">
                    {item.category}
                  </span>

                  {matchesActiveNeed && (
                    <div className="mt-2 text-[10px] font-black text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <span>✨ Sedang Diinginkan Pet!</span>
                    </div>
                  )}

                  {/* Boost Preview */}
                  <div className="mt-2 flex flex-wrap gap-1 text-[10px] font-bold">
                    {item.boosts.hunger && <span className="text-orange-700">🍖 +{item.boosts.hunger}%</span>}
                    {item.boosts.thirst && <span className="text-sky-700">💧 +{item.boosts.thirst}%</span>}
                    {item.boosts.hygiene && <span className="text-emerald-700">🧼 +{item.boosts.hygiene}%</span>}
                    {item.boosts.happiness && <span className="text-pink-700">🎾 +{item.boosts.happiness}%</span>}
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleUseItem(item)}
                    className={`w-full py-2 rounded-xl text-xs font-black transition shadow-xs flex items-center justify-center gap-1.5 active:scale-95 ${
                      isAccessory
                        ? isEquipped
                          ? 'bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : matchesActiveNeed
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-amber-500/40'
                        : 'bg-amber-500 hover:bg-amber-600 text-white'
                    }`}
                  >
                    <span>
                      {isAccessory ? (isEquipped ? 'Lepas Aksesoris' : 'Pakai Aksesoris') : 'Gunakan ke Pet'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-6">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center text-3xl mx-auto mb-3">
            🎒
          </div>
          <h4 className="font-extrabold font-heading text-slate-800 text-base">
            Tas Barang Masih Kosong
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Gunakan bintang prestasimu untuk berbelanja makanan lezat, minuman segar, sabun mandi, dan aksesoris di Pet Shop!
          </p>
          <button
            onClick={onOpenShop}
            className="mt-4 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow transition"
          >
            Buka Pet Shop Sekarang 🛍️
          </button>
        </div>
      )}
    </div>
  );
};
