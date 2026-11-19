import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check, Sparkles } from 'lucide-react';

interface AvatarPickerModalProps {
  currentAvatar: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectAvatar: (url: string) => void;
}

const PRESET_AVATARS = [
  {
    name: 'Atleta 1',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  },
  {
    name: 'Atleta 2',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  },
  {
    name: 'Atleta 3',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  },
  {
    name: 'Atleta 4',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
  },
  {
    name: 'Atleta 5',
    url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80',
  },
  {
    name: 'Atleta 6',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
  },
];

export function AvatarPickerModal({
  currentAvatar,
  isOpen,
  onClose,
  onSelectAvatar,
}: AvatarPickerModalProps) {
  const [selectedUrl, setSelectedUrl] = useState(currentAvatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSelectedUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSelectAvatar(selectedUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#111111] border border-zinc-800 rounded-t-[28px] sm:rounded-[24px] w-full max-w-[390px] p-5 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-orange-500" />
            <h3 className="text-white text-base font-semibold">Alterar Fotografia</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Preview */}
        <div className="flex flex-col items-center justify-center my-5">
          <div className="relative">
            <img
              src={selectedUrl}
              alt="Pré-visualização"
              className="w-24 h-24 rounded-full object-cover border-2 border-orange-500 shadow-lg shadow-orange-500/10"
            />
            <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white p-1.5 rounded-full shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <p className="text-zinc-400 text-xs mt-2">Pré-visualização do perfil</p>
        </div>

        {/* Upload Button */}
        <div className="mb-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-800/60 text-white text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4 text-orange-500" />
            <span>Carregar foto do dispositivo</span>
          </button>
        </div>

        {/* Presets Grid */}
        <div className="mb-5">
          <p className="text-zinc-400 text-[11px] font-medium uppercase tracking-wider mb-2.5">
            Ou escolha um avatar:
          </p>
          <div className="grid grid-cols-6 gap-2">
            {PRESET_AVATARS.map((avatar, idx) => {
              const isSelected = selectedUrl === avatar.url;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedUrl(avatar.url)}
                  className={`relative rounded-full aspect-square overflow-hidden border-2 transition-all cursor-pointer ${
                    isSelected ? 'border-orange-500 scale-105 shadow-md shadow-orange-500/30' : 'border-zinc-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" />
                  {isSelected && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Check className="w-3 h-3 text-orange-500" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-2.5 pt-2 border-t border-zinc-800/80">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors shadow-lg shadow-orange-500/20 cursor-pointer"
          >
            Guardar Fotografia
          </button>
        </div>
      </div>
    </div>
  );
}
