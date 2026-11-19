import React, { useState } from 'react';
import { 
  Trophy, 
  Flame, 
  Target, 
  Award, 
  Plus, 
  Sparkles, 
  Dumbbell, 
  Zap, 
  Calendar,
  ThumbsUp
} from 'lucide-react';
import { AchievementFilter, CommunityAchievement } from '../../types/community';
import { useCommunity } from '../../context/CommunityContext';
import { ShareAchievementModal } from './ShareAchievementModal';

export function CommunityAchievementsTab() {
  const { achievements, toggleApplaudAchievement } = useCommunity();
  const [activeFilter, setActiveFilter] = useState<AchievementFilter>('todas');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const filteredAchievements = achievements.filter((ach) => {
    if (activeFilter === 'todas') return true;
    return ach.category === activeFilter;
  });

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Dumbbell': return <Dumbbell className="w-5 h-5 text-amber-400" />;
      case 'Flame': return <Flame className="w-5 h-5 text-orange-400" />;
      case 'Zap': return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'Target': return <Target className="w-5 h-5 text-blue-400" />;
      case 'Award': return <Award className="w-5 h-5 text-emerald-400" />;
      default: return <Trophy className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-4 pb-16">
      {/* Top Action & Summary */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            Galeria de Conquistas
          </h3>
          <p className="text-[11px] text-zinc-500">Marcos históricos da equipa RTEAM</p>
        </div>

        <button
          onClick={() => setIsShareModalOpen(true)}
          className="py-2 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Partilhar Conquista</span>
        </button>
      </div>

      {/* Filtros: Todas, Recordes, Consistência, Objetivos */}
      <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1">
        {(['todas', 'recordes', 'consistencia', 'objetivos'] as AchievementFilter[]).map((filter) => {
          const labels: Record<AchievementFilter, string> = {
            todas: 'Todas',
            recordes: 'Recordes',
            consistencia: 'Consistência',
            objetivos: 'Objetivos',
          };

          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 capitalize ${
                activeFilter === filter
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-[#121212] text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {labels[filter]}
            </button>
          );
        })}
      </div>

      {/* Lista de Cartões de Conquista */}
      <div className="space-y-3">
        {filteredAchievements.map((achievement) => (
          <div
            key={achievement.id}
            className="bg-[#121212] border border-zinc-800/80 rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:border-amber-500/40 transition-all"
          >
            {/* Header: Author + Date */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <img
                  src={achievement.author.avatarUrl}
                  alt={achievement.author.name}
                  className="w-8 h-8 rounded-full object-cover border border-zinc-700 shrink-0"
                />
                <div>
                  <p className="text-xs font-bold text-white leading-tight">{achievement.author.name}</p>
                  <span className="text-[10px] text-zinc-500">{achievement.date}</span>
                </div>
              </div>

              {/* Category Pill */}
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 uppercase tracking-wider">
                {achievement.category}
              </span>
            </div>

            {/* Main Badge + Info Card */}
            <div className="flex items-start gap-3.5 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/60 mb-3">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${achievement.badgeGradient} flex items-center justify-center shadow-lg shrink-0 p-2 text-white`}>
                {getBadgeIcon(achievement.badgeIcon)}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-black text-white leading-tight">{achievement.title}</h4>
                {achievement.metric && (
                  <p className="text-xs font-extrabold text-orange-400 mt-0.5">{achievement.metric}</p>
                )}
                <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">{achievement.description}</p>
              </div>
            </div>

            {/* Optional image attachment */}
            {achievement.image && (
              <div className="mb-3 rounded-xl overflow-hidden aspect-video bg-zinc-900 border border-zinc-800">
                <img src={achievement.image} alt={achievement.title} className="w-full h-full object-cover" />
              </div>
            )}

            {/* Footer: Palmas / Felicitações Interativas */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
              <span className="text-[10px] text-zinc-500">
                {achievement.applauseCount} atletas aplaudiram
              </span>

              <button
                onClick={() => toggleApplaudAchievement(achievement.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  achievement.hasApplauded
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                <span className="text-sm">👏</span>
                <span>{achievement.hasApplauded ? 'Aplaudido' : 'Parabéns!'}</span>
                <span className="text-[11px] opacity-80">({achievement.applauseCount})</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Share Achievement Modal */}
      {isShareModalOpen && (
        <ShareAchievementModal
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
    </div>
  );
}
