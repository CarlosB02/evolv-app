import React, { useState } from 'react';
import { X, Trophy, Flame, Target, Award, Sparkles, Send } from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';

interface ShareAchievementModalProps {
  onClose: () => void;
}

export function ShareAchievementModal({ onClose }: ShareAchievementModalProps) {
  const { shareAchievement } = useCommunity();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'recordes' | 'consistencia' | 'objetivos'>('recordes');
  const [metric, setMetric] = useState('');
  const [description, setDescription] = useState('');
  const [selectedBadge, setSelectedBadge] = useState('Trophy');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let gradient = 'from-amber-500 to-orange-600';
    if (category === 'consistencia') gradient = 'from-orange-500 to-red-600';
    if (category === 'objetivos') gradient = 'from-blue-500 to-cyan-600';

    shareAchievement({
      title: title.trim(),
      category,
      metric: metric.trim() || undefined,
      description: description.trim() || 'Conquista alcançada com foco e dedicação!',
      badgeIcon: selectedBadge,
      badgeGradient: gradient,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-900 bg-zinc-950 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-orange-500" />
            <h3 className="text-white text-sm font-bold">Partilhar Nova Conquista</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 hide-scrollbar">
          {/* Categoria */}
          <div>
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
              Categoria da Conquista
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setCategory('recordes');
                  setSelectedBadge('Trophy');
                }}
                className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                  category === 'recordes'
                    ? 'bg-amber-500/15 border-amber-500 text-white font-bold'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <Trophy className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                <span className="text-xs">Recordes</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategory('consistencia');
                  setSelectedBadge('Flame');
                }}
                className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                  category === 'consistencia'
                    ? 'bg-orange-500/15 border-orange-500 text-white font-bold'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <Flame className="w-4 h-4 mx-auto mb-1 text-orange-400" />
                <span className="text-xs">Consistência</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategory('objetivos');
                  setSelectedBadge('Target');
                }}
                className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                  category === 'objetivos'
                    ? 'bg-blue-500/15 border-blue-500 text-white font-bold'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <Target className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                <span className="text-xs">Objetivos</span>
              </button>
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              Título da Conquista
            </label>
            <input
              type="text"
              required
              placeholder="ex: Primeiro Supino com 110kg ou 30 Dias Seguidos"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Métrica / Marca */}
          <div>
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              Métrica ou Marca Alcançada (opcional)
            </label>
            <input
              type="text"
              placeholder="ex: 110 kg • 5 reps ou 100km Cardio"
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-orange-400 font-bold placeholder-zinc-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              Relato ou Descrição
            </label>
            <textarea
              rows={3}
              placeholder="Conta à comunidade como superaste este objetivo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 resize-none"
            />
          </div>

          <div className="bg-zinc-900/40 p-3 rounded-2xl border border-zinc-800 text-[11px] text-zinc-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-400 shrink-0" />
            <span>Esta conquista ficará visível na galeria e criará uma publicação no Feed da comunidade.</span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Partilhar Conquista com RTEAM</span>
          </button>
        </form>
      </div>
    </div>
  );
}
