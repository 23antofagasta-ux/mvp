import React, { useState, useEffect, useRef } from 'react';
import { Palette, Sun, Moon, Sparkles, Check, ChevronDown } from 'lucide-react';
import { AppTheme, ThemeConfig } from '../../types';
import { storageService, SyncEvent } from '../../services/storage';
import { soundManager } from '../../services/audio';

export const AVAILABLE_THEMES: ThemeConfig[] = [
  {
    id: 'bright',
    name: 'Terang Ceria',
    label: 'Bright',
    icon: '☀️',
    badge: 'Klasik',
    description: 'Suasana kelas ceria & hangat standar MVP',
    accentColor: 'from-amber-400 to-yellow-300'
  },
  {
    id: 'dark',
    name: 'Mode Gelap',
    label: 'Dark',
    icon: '🌙',
    badge: 'Malam / Proyektor',
    description: 'Kontras tinggi, hemat energi & nyaman di mata',
    accentColor: 'from-slate-800 to-slate-950'
  },
  {
    id: 'clay',
    name: 'Clay 3D Empuk',
    label: 'Clay',
    icon: '🎨',
    badge: 'Claymorphism',
    description: 'Efek 3D claymorphic empuk dengan bayangan timbul',
    accentColor: 'from-blue-200 to-indigo-300'
  },
  {
    id: 'cartoon',
    name: 'Kartun & Komik',
    label: 'Cartoon',
    icon: '💥',
    badge: 'Comic Pop',
    description: 'Gaya komik seru garis hitam tebal & bayangan pop',
    accentColor: 'from-yellow-300 to-amber-400'
  }
];

interface ThemeSelectorProps {
  compact?: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ compact = false }) => {
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() => storageService.getTheme());
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync with global theme changes
  useEffect(() => {
    const unsub = storageService.subscribe((event: SyncEvent) => {
      if (event.type === 'THEME_CHANGED') {
        setCurrentTheme(event.theme);
      }
    });
    return () => unsub();
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectTheme = (themeId: AppTheme) => {
    storageService.setTheme(themeId);
    setCurrentTheme(themeId);
    setIsOpen(false);
    try {
      soundManager.playPop();
    } catch {
      // Audio optional
    }
  };

  const activeConfig = AVAILABLE_THEMES.find((t) => t.id === currentTheme) || AVAILABLE_THEMES[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-amber-300/80 bg-white/90 hover:bg-amber-50 text-slate-700 text-xs font-bold transition shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-400"
        title="Ganti Tema Aplikasi (Clay, Cartoon, Dark, Bright)"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span className="text-sm leading-none">{activeConfig.icon}</span>
        <span className="hidden md:inline font-heading tracking-tight">{activeConfig.label}</span>
        <Palette className="w-3.5 h-3.5 text-amber-600 hidden sm:inline" />
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white shadow-2xl border-2 border-amber-300 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-extrabold font-heading text-slate-800">
                Pilih Tema Aplikasi
              </span>
            </div>
            <span className="text-[10px] bg-amber-100 text-amber-800 font-black px-2 py-0.5 rounded-full">
              4 Tema
            </span>
          </div>

          <div className="py-1.5 space-y-1">
            {AVAILABLE_THEMES.map((theme) => {
              const isSelected = theme.id === currentTheme;
              return (
                <button
                  key={theme.id}
                  onClick={() => handleSelectTheme(theme.id)}
                  className={`w-full text-left p-2.5 rounded-xl flex items-start gap-3 transition group ${
                    isSelected
                      ? 'bg-amber-100/70 border-2 border-amber-400 font-bold'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  {/* Theme Icon Badge */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-xs shrink-0 bg-gradient-to-tr ${theme.accentColor} border ${
                      isSelected ? 'border-amber-500' : 'border-slate-200'
                    }`}
                  >
                    {theme.icon}
                  </div>

                  {/* Theme Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-black font-heading text-slate-900 group-hover:text-amber-700">
                        {theme.name}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {theme.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-normal">
                      {theme.description}
                    </p>
                  </div>

                  {/* Active Indicator */}
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-1 pt-2 border-t border-slate-100 px-3 py-1 bg-slate-50 rounded-xl text-[10px] text-slate-500 flex items-center justify-between">
            <span>💾 Tersimpan otomatis di perangkat</span>
            <span className="font-bold text-amber-600">Aktif: {activeConfig.name}</span>
          </div>
        </div>
      )}
    </div>
  );
};
