import React from 'react';
import { PetNeedsState } from '../../types';

interface PetMetersProps {
  needs: PetNeedsState;
}

export const PetMeters: React.FC<PetMetersProps> = ({ needs }) => {
  const meters = [
    {
      id: 'hunger',
      label: 'Kenyang',
      value: needs.hunger,
      icon: '🍖',
      barColor: 'bg-gradient-to-r from-orange-400 to-amber-500',
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-800'
    },
    {
      id: 'thirst',
      label: 'Kesegaran',
      value: needs.thirst,
      icon: '💧',
      barColor: 'bg-gradient-to-r from-sky-400 to-blue-500',
      bgColor: 'bg-sky-100',
      textColor: 'text-sky-800'
    },
    {
      id: 'hygiene',
      label: 'Kebersihan',
      value: needs.hygiene,
      icon: '🧼',
      barColor: 'bg-gradient-to-r from-emerald-400 to-teal-500',
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-800'
    },
    {
      id: 'happiness',
      label: 'Ceria',
      value: needs.happiness,
      icon: '🎾',
      barColor: 'bg-gradient-to-r from-pink-400 to-rose-500',
      bgColor: 'bg-pink-100',
      textColor: 'text-pink-800'
    },
    {
      id: 'energy',
      label: 'Energi',
      value: needs.energy,
      icon: '⚡',
      barColor: 'bg-gradient-to-r from-yellow-400 to-amber-400',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3 bg-white/90 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl shadow-lg border border-amber-200">
      {meters.map((m) => {
        const isCritical = m.value < 25;
        return (
          <div key={m.id} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className={`flex items-center gap-1 ${m.textColor}`}>
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </span>
              <span className={`${isCritical ? 'text-rose-600 font-extrabold animate-pulse' : 'text-slate-600'}`}>
                {m.value}%
              </span>
            </div>
            {/* Meter Bar */}
            <div className={`w-full h-3 sm:h-3.5 rounded-full overflow-hidden ${m.bgColor} p-0.5 border border-slate-200/60`}>
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCritical ? 'bg-rose-500 animate-pulse' : m.barColor
                }`}
                style={{ width: `${Math.min(100, Math.max(0, m.value))}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
