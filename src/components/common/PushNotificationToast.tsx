import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, AlertCircle, Award, X, TrendingUp } from 'lucide-react';
import { storageService, SyncEvent } from '../../services/storage';
import { soundManager } from '../../services/audio';

interface ToastData {
  id: string;
  title: string;
  message: string;
  type: 'star_add' | 'star_deduct' | 'level_up' | 'evolution' | 'info';
  delta?: number;
}

interface PushNotificationToastProps {
  currentStudentNisn?: string;
}

export const PushNotificationToast: React.FC<PushNotificationToastProps> = ({ currentStudentNisn }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const unsubscribe = storageService.subscribe((event: SyncEvent) => {
      if (event.type === 'STAR_UPDATE') {
        // If current student is specified, check if it belongs to this student, or if general view
        if (currentStudentNisn && event.nisn !== currentStudentNisn) {
          return;
        }

        const isPositive = event.delta >= 0;
        const newToast: ToastData = {
          id: 'toast-' + Date.now() + Math.random(),
          title: isPositive ? '⭐ Bintang Prestasi Baru!' : '⚠️ Pengurangan Poin',
          message: isPositive
            ? `Kamu memperoleh +${event.delta} Bintang untuk: ${event.categoryName}. Total Bintang: ${event.currentStars} ⭐`
            : `Poin berkurang ${event.delta} Bintang untuk: ${event.categoryName}. Total Bintang: ${event.currentStars} ⭐`,
          type: isPositive ? 'star_add' : 'star_deduct',
          delta: event.delta
        };

        setToasts((prev) => [...prev, newToast]);

        // Trigger Audio & Confetti
        if (isPositive) {
          soundManager.playStarChime();
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 }
            });
          } catch {
            // ignore if canvas-confetti issue
          }
        } else {
          soundManager.playDeductBuzz();
        }

        // Auto dismiss after 5s
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
        }, 5000);
      } else if (event.type === 'LEVEL_UP') {
        const newToast: ToastData = {
          id: 'toast-' + Date.now() + Math.random(),
          title: '🎉 LEVEL UP!',
          message: `Selamat! Hewan peliharaanmu naik ke Level ${event.newLevel} (${event.stageName})!`,
          type: 'level_up'
        };
        setToasts((prev) => [...prev, newToast]);
        soundManager.playLevelUp();
        try {
          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.5 }
          });
        } catch {
          // ignore
        }
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
        }, 5000);
      }
    });

    return () => unsubscribe();
  }, [currentStudentNisn]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3">
      {toasts.map((toast) => {
        const isStarAdd = toast.type === 'star_add';
        const isDeduct = toast.type === 'star_deduct';
        const isLevelUp = toast.type === 'level_up';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-2xl border-2 transition-all duration-300 animate-bounce-gentle ${
              isStarAdd
                ? 'bg-amber-500 text-white border-amber-300 shadow-amber-500/40'
                : isDeduct
                ? 'bg-rose-600 text-white border-rose-400 shadow-rose-600/40'
                : 'bg-indigo-600 text-white border-indigo-400 shadow-indigo-600/40'
            }`}
          >
            <div className="p-2 rounded-xl bg-white/20 shrink-0 text-xl">
              {isStarAdd ? <Sparkles className="w-6 h-6 text-yellow-200" /> : isDeduct ? <AlertCircle className="w-6 h-6 text-rose-200" /> : <Award className="w-6 h-6 text-indigo-200" />}
            </div>
            <div className="flex-1">
              <h4 className="font-extrabold text-sm tracking-wide flex items-center justify-between">
                <span>{toast.title}</span>
                {toast.delta !== undefined && (
                  <span className="text-base px-2 py-0.5 rounded-full bg-white/25 font-black">
                    {toast.delta > 0 ? `+${toast.delta} ⭐` : `${toast.delta} ⭐`}
                  </span>
                )}
              </h4>
              <p className="text-xs mt-1 text-white/95 leading-relaxed font-medium">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
