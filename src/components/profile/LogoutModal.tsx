import React from 'react';
import { LogOut, X, AlertCircle } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LogoutModal({ isOpen, onClose }: LogoutModalProps) {
  const { student, logout } = useProfile();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#111111] border border-zinc-800 rounded-[24px] w-full max-w-[360px] p-5 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-3">
          <LogOut className="w-6 h-6" />
        </div>

        <h3 className="text-white text-base font-bold text-center mb-1">Terminar Sessão</h3>
        <p className="text-zinc-400 text-xs text-center leading-relaxed mb-5">
          Tens a certeza que desejas sair da conta de <span className="text-white font-medium">{student.name}</span>? Os teus treinos e progresso continuarão guardados na nuvem.
        </p>

        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={logout}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-semibold transition-colors shadow-lg shadow-red-500/20 cursor-pointer"
          >
            Terminar Sessão
          </button>
        </div>
      </div>
    </div>
  );
}
