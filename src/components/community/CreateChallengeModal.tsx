import React, { useState } from 'react';
import { X, Flame, Dumbbell, Zap, Footprints, Calendar, Check, Users, Plus } from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';

interface CreateChallengeModalProps {
  onClose: () => void;
}

export function CreateChallengeModal({ onClose }: CreateChallengeModalProps) {
  const { createChallenge, friends } = useCommunity();
  const [challengeType, setChallengeType] = useState<'workouts' | 'steps' | 'cardio' | 'consistency'>('workouts');
  const [name, setName] = useState('');
  const [durationDays, setDurationDays] = useState('14');
  const [targetValue, setTargetValue] = useState('12');
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([friends[0]?.id, friends[1]?.id].filter(Boolean));

  const toggleSelectFriend = (id: string) => {
    setSelectedFriendIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getTargetUnit = (type: string) => {
    switch (type) {
      case 'workouts': return 'treinos';
      case 'steps': return 'passos';
      case 'cardio': return 'km';
      default: return 'dias';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = name.trim() || `Desafio ${challengeType.toUpperCase()}`;
    const targetUnit = getTargetUnit(challengeType);
    const totalDays = parseInt(durationDays, 10) || 14;
    const finalTargetValue = parseFloat(targetValue) || 15;

    const invitedAvatars = friends
      .filter((f) => selectedFriendIds.includes(f.id))
      .map((f) => f.avatarUrl);

    createChallenge({
      title: finalTitle,
      type: challengeType,
      totalDays,
      daysRemaining: totalDays,
      targetValue: finalTargetValue,
      targetUnit,
      participantAvatars: invitedAvatars,
      description: `Desafio comunitário de ${totalDays} dias: atingir ${finalTargetValue} ${targetUnit}!`,
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
            <Flame className="w-4 h-4 text-orange-500" />
            <h3 className="text-white text-sm font-bold">Criar Desafio Personalizado</h3>
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
          {/* 1. Escolher o tipo de desafio */}
          <div>
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
              1. Tipo de Desafio
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setChallengeType('workouts');
                  setTargetValue('12');
                }}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  challengeType === 'workouts'
                    ? 'bg-orange-500/10 border-orange-500 text-white'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <Dumbbell className={`w-4 h-4 ${challengeType === 'workouts' ? 'text-orange-500' : 'text-zinc-500'}`} />
                <div>
                  <p className="text-xs font-bold leading-tight">Treinos Concluídos</p>
                  <p className="text-[10px] text-zinc-500">Total de sessões</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setChallengeType('steps');
                  setTargetValue('100000');
                }}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  challengeType === 'steps'
                    ? 'bg-orange-500/10 border-orange-500 text-white'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <Footprints className={`w-4 h-4 ${challengeType === 'steps' ? 'text-orange-500' : 'text-zinc-500'}`} />
                <div>
                  <p className="text-xs font-bold leading-tight">Passos Diários</p>
                  <p className="text-[10px] text-zinc-500">Contador de passos</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setChallengeType('cardio');
                  setTargetValue('40');
                }}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  challengeType === 'cardio'
                    ? 'bg-orange-500/10 border-orange-500 text-white'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <Zap className={`w-4 h-4 ${challengeType === 'cardio' ? 'text-orange-500' : 'text-zinc-500'}`} />
                <div>
                  <p className="text-xs font-bold leading-tight">Cardio (km)</p>
                  <p className="text-[10px] text-zinc-500">Distância corrida/bike</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setChallengeType('consistency');
                  setTargetValue('14');
                }}
                className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  challengeType === 'consistency'
                    ? 'bg-orange-500/10 border-orange-500 text-white'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                <Calendar className={`w-4 h-4 ${challengeType === 'consistency' ? 'text-orange-500' : 'text-zinc-500'}`} />
                <div>
                  <p className="text-xs font-bold leading-tight">Consistência</p>
                  <p className="text-[10px] text-zinc-500">Dias seguidos</p>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Definir o nome e a duração */}
          <div>
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
              2. Nome e Meta
            </label>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="ex: Batalha de Treinos de Outono"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Duração</label>
                  <select
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="7">7 Dias (1 Semana)</option>
                    <option value="14">14 Dias (2 Semanas)</option>
                    <option value="21">21 Dias (Hábito)</option>
                    <option value="30">30 Dias (1 Mês)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Meta ({getTargetUnit(challengeType)})</label>
                  <input
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-bold text-orange-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Selecionar amigos da comunidade */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                3. Convidar Amigos
              </label>
              <span className="text-[10px] text-orange-400 font-semibold">
                {selectedFriendIds.length} selecionado(s)
              </span>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto hide-scrollbar pr-1">
              {friends.map((friend) => {
                const isSelected = selectedFriendIds.includes(friend.id);
                return (
                  <button
                    key={friend.id}
                    type="button"
                    onClick={() => toggleSelectFriend(friend.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-orange-500/10 border-orange-500/50'
                        : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={friend.avatarUrl}
                        alt={friend.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div className="text-left">
                        <p className="text-xs font-semibold text-white">{friend.name}</p>
                        <p className="text-[10px] text-zinc-500">Nível {friend.level}</p>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                      isSelected ? 'bg-orange-500 border-orange-500 text-white' : 'border-zinc-700'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Resumo dos participantes */}
          <div className="bg-zinc-900/60 rounded-2xl p-3 border border-zinc-800 text-xs">
            <div className="flex items-center justify-between text-zinc-400 mb-1.5">
              <span>Participantes no desafio:</span>
              <strong className="text-white">{selectedFriendIds.length + 1} atleta(s)</strong>
            </div>
            <p className="text-[11px] text-zinc-500">
              Ao criar o desafio, os convites serão enviados de imediato na aba Desafios.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Desafio e Enviar Convites</span>
          </button>
        </form>
      </div>
    </div>
  );
}
