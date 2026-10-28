import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Share2, X, Smartphone } from 'lucide-react';
import { Student } from '../../types';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: Student | null;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, student }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://my-virtual-pet.app';
  const shareUrl = student
    ? `${origin}/?nisn=${student.nisn}`
    : `${origin}/?portal=siswa`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = student
      ? `Halo ${student.name}! Ayo rawat hewan peliharaanmu di Game My Virtual Pet: ${shareUrl}`
      : `Halo kawan-kawan! Yuk buka Game My Virtual Pet di ponselmu: ${shareUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleOpenTab = () => {
    window.open(shareUrl, '_blank');
  };

  // Google Charts QR API or fallback SVG pattern
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(shareUrl)}&margin=10`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-amber-300 relative text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
          <Smartphone className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold font-heading text-slate-800">
          {student ? `Tautan & QR Code Siswa` : `Portal Game Siswa`}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {student
            ? `Pindai atau bagikan tautan ini agar ${student.name} (${student.nisn}) dapat langsung bermain di ponselnya!`
            : `Pindai untuk membuka portal siswa My Virtual Pet.`}
        </p>

        {/* QR Code Container */}
        <div className="mt-4 p-4 bg-amber-50 rounded-2xl border-2 border-dashed border-amber-200 inline-block shadow-inner">
          <img
            src={qrImageUrl}
            alt="QR Code Siswa"
            className="w-48 h-48 rounded-xl object-contain mx-auto bg-white p-2 shadow-sm"
          />
          <div className="text-[11px] text-amber-700 font-bold mt-2 flex items-center justify-center gap-1">
            <span>📷 Buka Kamera HP lalu Arahkan ke QR Code</span>
          </div>
        </div>

        {/* Share Link Field */}
        <div className="mt-4 flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="text-xs bg-transparent text-slate-700 flex-1 outline-none px-2 font-mono truncate"
          />
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition shadow"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin</span>
              </>
            )}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <button
            onClick={handleWhatsApp}
            className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow"
          >
            <Share2 className="w-4 h-4" />
            <span>Kirim WhatsApp</span>
          </button>
          <button
            onClick={handleOpenTab}
            className="py-2.5 px-3 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Buka di Tab Baru</span>
          </button>
        </div>
      </div>
    </div>
  );
};
