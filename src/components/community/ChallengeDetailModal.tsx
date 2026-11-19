import React from 'react';
import { X, Trophy, Flame, Calendar, Users, Target, ArrowUpRight } from 'lucide-react';
import { Challenge } from '../../types/community';

interface ChallengeDetailModalProps {
  challenge: Challenge;
  onClose: () => void;
}

export function ChallengeDetailModal({ challenge, onClose }: ChallengeDetailModalProps) {
  const getBadgeType = (type: string) => {
    switch (type) {
      case 'workouts': return { label: 'Treinos', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      case 'cardio': return { label: 'Cardio', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
      case 'steps': return { label: 'Passos', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      default: return { label: 'Consistência', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };
    }
  };

  const badgeInfo = getBadgeType(challenge.type);
  const userPercent = Math.min(100, Math.round((challenge.userProgress / challenge.targetValue) * 100));

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
            <h3 className="text-white text-sm font-bold truncate">Detalhes do Desafio</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 hide-scrollbar">
          {/* Hero Banner */}
          <div className="bg-gradient-to-br from-orange-500/15 via-zinc-900 to-zinc-900 border border-orange-500/30 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeInfo.color}`}>
                {badgeInfo.label}
              </span>
              <div className="flex items-center gap-1 text-[11px] text-orange-400 font-semibold">
                <Calendar className="w-3.5 h-3.5" />
                <span>{challenge.daysRemaining} dias restantes</span>
              </div>
            </div>

            <h2 className="text-base font-extrabold text-white mb-1.5">{challenge.title}</h2>
            <p className="text-xs text-zinc-300 leading-relaxed mb-4">{challenge.description}</p>

            {/* Quick stats grid */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-800/80 text-center">
              <div className="bg-zinc-900/80 rounded-xl p-2 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">Objetivo</span>
                <span className="text-xs font-bold text-white">{challenge.targetValue} {challenge.targetUnit}</span>
              </div>
              <div className="bg-zinc-900/80 rounded-xl p-2 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">Tua Posição</span>
                <span className="text-xs font-bold text-orange-400">#{challenge.userRank || 3}</span>
              </div>
              <div className="bg-zinc-900/80 rounded-xl p-2 border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block">Atletas</span>
                <span className="text-xs font-bold text-white">{challenge.participantsCount}</span>
              </div>
            </div>
          </div>

          {/* User Progress Bar */}
          <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-orange-500" />
                O teu progresso no desafio
              </span>
              <span className="text-xs font-extrabold text-orange-400">{userPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${userPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-zinc-400">
              <span>Registado: <strong className="text-white">{challenge.userProgress}</strong> {challenge.targetUnit}</span>
              <span>Meta: <strong className="text-white">{challenge.targetValue}</strong> {challenge.targetUnit}</span>
            </div>
          </div>

          {/* Challenge Leaderboard */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Classificação do Desafio</h4>
              </div>
              <span className="text-[11px] text-zinc-500">{challenge.leaderboard.length} atletas em prova</span>
            </div>

            <div className="space-y-2">
              {challenge.leaderboard.map((entry) => {
                const isTop3 = entry.rank <= 3;
                return (
                  <div
                    key={entry.rank}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      entry.isUser
                        ? 'bg-orange-500/10 border-orange-500/40 shadow-sm'
                        : 'bg-zinc-900/50 border-zinc-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 text-center">
                        {entry.rank === 1 && <span className="text-sm">🥇</span>}
                        {entry.rank === 2 && <span className="text-sm">🥈</span>}
                        {entry.rank === 3 && <span className="text-sm">🥉</span>}
                        {entry.rank > 3 && (
                          <span className="text-xs font-bold text-zinc-500">#{entry.rank}</span>
                        )}
                      </div>

                      <img
                        src={entry.avatarUrl}
                        alt={entry.name}
                        className="w-8 h-8 rounded-full object-cover border border-zinc-700"
                      />

                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-white">{entry.name}</p>
                          {entry.isUser && (
                            <span className="text-[9px] bg-orange-500 text-black font-extrabold px-1 rounded">
                              TU
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-400">
                          {entry.score} {entry.scoreUnit} ({entry.progressPercent}%)
                        </p>
                      </div>
                    </div>

                    <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${entry.isUser ? 'bg-orange-500' : 'bg-zinc-500'}`}
                        style={{ width: `${Math.min(100, entry.progressPercent)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
