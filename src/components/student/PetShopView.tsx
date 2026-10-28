import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { ShoppingBag, Sparkles, Check, AlertCircle, ArrowRight } from 'lucide-react';
import { ShopItem, Student, ShopCategory } from '../../types';
import { storageService } from '../../services/storage';
import { soundManager } from '../../services/audio';

interface PetShopViewProps {
  student: Student;
  onItemPurchased: () => void;
}

export const PetShopView: React.FC<PetShopViewProps> = ({ student, onItemPurchased }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const shopItems = storageService.getShopItems().filter((item) => item.inStock);

  const handleBuyItem = (item: ShopItem) => {
    setPurchaseSuccess(null);
    setPurchaseError(null);

    if (student.stars < item.price) {
      soundManager.playWrong();
      setPurchaseError(`Bintang tidak cukup! Butuh ${item.price} ⭐, kamu memiliki ${student.stars} ⭐. Dapatkan bintang dari guru dengan rajin belajar!`);
      return;
    }

    if (student.level < item.unlockLevel) {
      soundManager.playWrong();
      setPurchaseError(`Item ini baru terbuka pada Level ${item.unlockLevel}. Tingkatkan level petmu terlebih dahulu!`);
      return;
    }

    // Deduct stars and add to inventory
    const updatedStudent = { ...student };
    updatedStudent.stars -= item.price;

    const currentQty = updatedStudent.inventory[item.id] || 0;
    updatedStudent.inventory[item.id] = currentQty + 1;

    storageService.saveStudent(updatedStudent);
    soundManager.playStarChime();

    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {
      // ignore
    }

    setPurchaseSuccess(`Berhasil membeli "${item.name}"! Item telah dimasukkan ke Tas Barang (Inventory).`);
    onItemPurchased();
  };

  const categories = [
    { id: 'all', label: 'Semua', icon: '🛍️' },
    { id: 'makanan', label: 'Makanan', icon: '🍖' },
    { id: 'minuman', label: 'Minuman', icon: '💧' },
    { id: 'sabun', label: 'Kebersihan', icon: '🧼' },
    { id: 'mainan', label: 'Mainan', icon: '🎾' },
    { id: 'aksesoris', label: 'Aksesoris', icon: '🎀' }
  ];

  const filteredItems = shopItems.filter(
    (item) => selectedCategory === 'all' || item.category === selectedCategory
  );

  return (
    <div className="space-y-5">
      {/* Top Banner with Star Balance */}
      <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-3xl p-5 sm:p-6 text-amber-950 shadow-xl flex items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider bg-white/40 px-2.5 py-0.5 rounded-full">
            Toko Hadiah Siswa (Pet Shop)
          </span>
          <h3 className="text-xl sm:text-2xl font-extrabold font-heading mt-1">
            Tukarkan Bintang Prestasimu!
          </h3>
          <p className="text-xs text-amber-900/80 mt-0.5">
            Beli makanan lezat, ramuan ajaib, mainan seru, dan aksesoris keren untuk pet kesayangan.
          </p>
        </div>

        {/* Current Balance */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3 sm:p-4 text-center shadow-md border-2 border-amber-300 shrink-0">
          <div className="text-[10px] font-extrabold text-slate-500 uppercase">Saldumu:</div>
          <div className="text-2xl sm:text-3xl font-black font-heading text-amber-600 flex items-center justify-center gap-1">
            <span>⭐</span>
            <span>{student.stars}</span>
          </div>
          <div className="text-[10px] text-amber-800 font-bold">Bintang</div>
        </div>
      </div>

      {/* Alerts */}
      {purchaseSuccess && (
        <div className="p-3 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-xs font-bold text-emerald-900 flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{purchaseSuccess}</span>
        </div>
      )}

      {purchaseError && (
        <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-2xl text-xs font-bold text-rose-900 flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{purchaseError}</span>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((c) => {
          const isSel = selectedCategory === c.id;
          return (
            <button
              key={c.id}
              onClick={() => {
                setSelectedCategory(c.id);
                setPurchaseSuccess(null);
                setPurchaseError(null);
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition shadow-xs ${
                isSel
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'bg-white hover:bg-amber-50 text-slate-700 border border-slate-200'
              }`}
            >
              <span>{c.icon}</span>
              <span>{c.label}</span>
            </button>
          );
        })}
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.map((item) => {
          const inInventoryQty = student.inventory[item.id] || 0;
          const canAfford = student.stars >= item.price;
          const isLevelLocked = student.level < item.unlockLevel;

          return (
            <div
              key={item.id}
              className={`bg-white rounded-3xl p-5 border-2 transition-all flex flex-col justify-between shadow-xs hover:shadow-md ${
                canAfford ? 'border-amber-200 hover:border-amber-400' : 'border-slate-200 opacity-90'
              }`}
            >
              <div>
                {/* Top Row: Icon & Price */}
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-3xl shadow-inner">
                    {item.icon}
                  </div>
                  <div className="bg-amber-100 text-amber-950 font-black text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                    <span>⭐</span>
                    <span>{item.price} Bintang</span>
                  </div>
                </div>

                <h4 className="font-extrabold font-heading text-slate-800 text-base mt-3">
                  {item.name}
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {item.description}
                </p>

                {/* Stat Boosts */}
                <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-bold">
                  {item.boosts.hunger && (
                    <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-200">
                      🍖 +{item.boosts.hunger}%
                    </span>
                  )}
                  {item.boosts.thirst && (
                    <span className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded border border-sky-200">
                      💧 +{item.boosts.thirst}%
                    </span>
                  )}
                  {item.boosts.hygiene && (
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                      🧼 +{item.boosts.hygiene}%
                    </span>
                  )}
                  {item.boosts.happiness && (
                    <span className="bg-pink-50 text-pink-700 px-2 py-0.5 rounded border border-pink-200">
                      🎾 +{item.boosts.happiness}%
                    </span>
                  )}
                  {item.boosts.energy && (
                    <span className="bg-yellow-50 text-yellow-800 px-2 py-0.5 rounded border border-yellow-200">
                      ⚡ +{item.boosts.energy}%
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button & In Inventory Count */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500">
                  {inInventoryQty > 0 ? (
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Di Tas: {inInventoryQty}
                    </span>
                  ) : (
                    'Belum dimiliki'
                  )}
                </span>

                <button
                  onClick={() => handleBuyItem(item)}
                  disabled={isLevelLocked}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow transition active:scale-95 ${
                    isLevelLocked
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      : canAfford
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30'
                      : 'bg-slate-100 hover:bg-amber-100 text-slate-700 border border-slate-300'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{isLevelLocked ? `Buka Lvl ${item.unlockLevel}` : 'Beli'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
