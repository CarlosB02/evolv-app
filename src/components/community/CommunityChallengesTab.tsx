import React, { useState } from 'react';
import { 
  Trophy, 
  Flame, 
  Users, 
  Target, 
  Plus, 
  UserPlus, 
  Calendar, 
  Zap, 
  Dumbbell, 
  CalendarCheck, 
  MessageSquare, 
  Award, 
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Check,
  X,
  Footprints,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { ChallengeSubTab, ChallengePeriod, Challenge } from '../../types/community';
import { useCommunity } from '../../context/CommunityContext';
import { 
  userGamificationSummary, 
  pointRules, 
  leaderboardDataByPeriod, 
  mockCurrentUser 
} from '../../data/communityData';
import { ChallengeDetailModal } from './ChallengeDetailModal';
import { CreateChallengeModal } from './CreateChallengeModal';
import { AddFriendsModal } from './AddFriendsModal';

export function CommunityChallengesTab() {
  const { 
    activeChallenges, 
    receivedInvites, 
    acceptInvite, 
    declineInvite,
    selectedChallenge,
    setSelectedChallenge
  } = useCommunity();

  const [subTab, setSubTab] = useState<ChallengeSubTab>('geral');
  const [period, setPeriod] = useState<ChallengePeriod>('mes');
  
  // Modals
  const [isCreateChallengeOpen, setIsCreateChallengeOpen] = useState(false);
  const [isAddFriendsOpen, setIsAddFriendsOpen] = useState(false);

  const gamification = userGamificationSummary[period];
  const leaderboard = leaderboardDataByPeriod[period] || [];

  const getRuleIcon = (iconName: string) => {
    switch (iconName) {
      case 'Dumbbell': return <Dumbbell className="w-4 h-4 text-orange-400" />;
      case 'Zap': return <Zap className="w-4 h-4 text-blue-400" />;
      case 'CalendarCheck': return <CalendarCheck className="w-4 h-4 text-emerald-400" />;
      case 'MessageSquare': return <MessageSquare className="w-4 h-4 text-purple-400" />;
      case 'Trophy': return <Trophy className="w-4 h-4 text-amber-400" />;
      case 'Award': return <Award className="w-4 h-4 text-yellow-400" />;
      case 'Flame': return <Flame className="w-4 h-4 text-rose-400" />;
      default: return <Sparkles className="w-4 h-4 text-orange-400" />;
    }
  };

  const getChallengeTypeBadge = (type: string) => {
    switch (type) {
      case 'workouts': return { label: 'Treinos', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      case 'cardio': return { label: 'Cardio (km)', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
      case 'steps': return { label: 'Passos', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      default: return { label: 'Consistência', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };
    }
  };

  return (
    <div className="space-y-4 pb-16">
      {/* 1. Sub-Separadores: Geral vs Desafios */}
      <div className="grid grid-cols-2 p-1 bg-[#121212] rounded-2xl border border-zinc-800/80">
        <button
          type="button"
          onClick={() => setSubTab('geral')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            subTab === 'geral'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Geral & Ranking</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('desafios')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 relative ${
            subTab === 'desafios'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Desafios em Curso</span>
          {receivedInvites.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping absolute top-2 right-2" />
          )}
        </button>
      </div>

      {/* ======================= SUBTAB 1: GERAL ======================= */}
      {subTab === 'geral' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Seletor de Período */}
          <div className="flex items-center justify-between bg-zinc-950 p-1 rounded-xl border border-zinc-900">
            <span className="text-[11px] font-bold text-zinc-500 uppercase px-2">Período:</span>
            <div className="flex gap-1">
              {(['semana', 'mes', 'historico'] as ChallengePeriod[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer capitalize ${
                    period === p
                      ? 'bg-zinc-800 text-orange-400 border border-zinc-700'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {p === 'historico' ? 'Histórico Completo' : p === 'mes' ? 'Mês' : 'Semana'}
                </button>
              ))}
            </div>
          </div>

          {/* Gamification Dashboard Card */}
          <div className="bg-gradient-to-br from-orange-500/15 via-[#141414] to-[#111111] border border-orange-500/30 rounded-2xl p-4 shadow-lg shadow-orange-500/5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold">
                  Pontos Acumulados ({period === 'historico' ? 'Total' : period})
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-white">{gamification.points.toLocaleString()}</span>
                  <span className="text-xs font-bold text-orange-400">pts</span>
                </div>
              </div>

              {/* Posição do aluno */}
              <div className="text-right bg-zinc-900/90 border border-orange-500/20 px-3 py-1.5 rounded-xl">
                <span className="text-[9px] text-zinc-400 block uppercase">Classificação</span>
                <span className="text-sm font-extrabold text-orange-400">#{gamification.userRank}</span>
              </div>
            </div>

            {/* Nível Atual do Aluno & Barra de Progresso */}
            <div className="pt-3 border-t border-zinc-800/80">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-orange-500" />
                  Nível {gamification.level} • {gamification.levelName}
                </span>
                <span className="text-[11px] text-zinc-400">
                  Próximo: <strong className="text-white">Nível {gamification.nextLevel}</strong>
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden mb-1.5">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${gamification.currentLevelProgress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-zinc-400">
                <span>{gamification.currentLevelProgress}% concluído</span>
                <span className="text-orange-400 font-semibold">Faltam {gamification.pointsRemaining} pts para o Nível {gamification.nextLevel}</span>
              </div>
            </div>
          </div>

          {/* Secção "Como ganhas pontos" */}
          <div className="bg-[#121212] border border-zinc-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Como Ganhas Pontos</h3>
              </div>
              <span className="text-[10px] text-zinc-500">Regras RTEAM</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {pointRules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/60"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                      {getRuleIcon(rule.iconName)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{rule.activity}</p>
                      <p className="text-[9px] text-zinc-500 truncate">{rule.frequency}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-orange-400 shrink-0 ml-2">+{rule.points} pts</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ranking Geral dos Atletas */}
          <div className="bg-[#121212] border border-zinc-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Ranking dos Atletas ({period})
                </h3>
              </div>
              <span className="text-[10px] text-zinc-500">Atualizado a cada 15 min</span>
            </div>

            <div className="space-y-2">
              {leaderboard.map((athlete) => {
                const isUser = athlete.isUser;
                return (
                  <div
                    key={athlete.rank}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      isUser
                        ? 'bg-orange-500/10 border-orange-500/40 shadow-sm'
                        : 'bg-zinc-900/40 border-zinc-800/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Posição & Medalha */}
                      <div className="w-6 text-center shrink-0">
                        {athlete.rank === 1 && <span className="text-base">🥇</span>}
                        {athlete.rank === 2 && <span className="text-base">🥈</span>}
                        {athlete.rank === 3 && <span className="text-base">🥉</span>}
                        {athlete.rank > 3 && (
                          <span className="text-xs font-extrabold text-zinc-500">#{athlete.rank}</span>
                        )}
                      </div>

                      <img
                        src={athlete.avatarUrl}
                        alt={athlete.name}
                        className="w-9 h-9 rounded-full object-cover border border-zinc-700 shrink-0"
                      />

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs font-bold text-white">{athlete.name}</p>
                          {isUser && (
                            <span className="text-[9px] bg-orange-500 text-black font-extrabold px-1 rounded">
                              TU
                            </span>
                          )}
                          <span className="text-[9px] text-zinc-400">Nív {athlete.level}</span>
                        </div>
                        <p className="text-[10px] text-zinc-400">{athlete.badge}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <span className="text-xs font-bold text-white">{athlete.points.toLocaleString()}</span>
                        <span className="text-[10px] text-zinc-400 block">pts</span>
                      </div>

                      {/* Evolução da classificação */}
                      <div className="w-6 flex items-center justify-center">
                        {athlete.change > 0 && (
                          <span className="flex items-center text-[10px] font-bold text-emerald-400">
                            <TrendingUp className="w-3 h-3 mr-0.5" />
                            {athlete.change}
                          </span>
                        )}
                        {athlete.change < 0 && (
                          <span className="flex items-center text-[10px] font-bold text-rose-400">
                            <TrendingDown className="w-3 h-3 mr-0.5" />
                            {Math.abs(athlete.change)}
                          </span>
                        )}
                        {athlete.change === 0 && (
                          <Minus className="w-3.5 h-3.5 text-zinc-600" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================= SUBTAB 2: DESAFIOS ======================= */}
      {subTab === 'desafios' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Top Quick Actions: Criar Desafio & Conectar Amigos */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setIsCreateChallengeOpen(true)}
              className="py-2.5 px-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-orange-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Desafio</span>
            </button>

            <button
              onClick={() => setIsAddFriendsOpen(true)}
              className="py-2.5 px-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-orange-400" />
              <span>Convidar Amigos</span>
            </button>
          </div>

          {/* Novos Desafios Recebidos (Convites) */}
          {receivedInvites.length > 0 && (
            <div className="bg-gradient-to-br from-orange-500/10 via-[#141414] to-[#121212] border border-orange-500/30 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Novos Desafios Recebidos ({receivedInvites.length})
                  </h3>
                </div>
              </div>

              <div className="space-y-3">
                {receivedInvites.map((invite) => (
                  <div
                    key={invite.id}
                    className="bg-zinc-900/80 rounded-xl p-3.5 border border-zinc-800"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {invite.invitedBy && (
                        <img
                          src={invite.invitedBy.avatarUrl}
                          alt={invite.invitedBy.name}
                          className="w-6 h-6 rounded-full object-cover border border-zinc-700"
                        />
                      )}
                      <p className="text-[11px] text-zinc-300">
                        <strong className="text-white">{invite.invitedBy?.name}</strong> convidou-te para um desafio!
                      </p>
                    </div>

                    <h4 className="text-xs font-bold text-white mb-1">{invite.title}</h4>
                    <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">{invite.description}</p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => acceptInvite(invite.id)}
                        className="flex-1 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Participar</span>
                      </button>

                      <button
                        onClick={() => declineInvite(invite.id)}
                        className="py-1.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Recusar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lista de Desafios Ativos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500" />
                Desafios Ativos ({activeChallenges.length})
              </h3>
              <span className="text-[10px] text-zinc-500">Toca para ver o ranking</span>
            </div>

            {activeChallenges.map((challenge) => {
              const badgeInfo = getChallengeTypeBadge(challenge.type);
              const progressPercent = Math.min(100, Math.round((challenge.userProgress / challenge.targetValue) * 100));

              return (
                <div
                  key={challenge.id}
                  onClick={() => setSelectedChallenge(challenge)}
                  className="bg-[#121212] hover:bg-zinc-900/60 border border-zinc-800/80 hover:border-orange-500/40 rounded-2xl p-4 transition-all cursor-pointer group shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${badgeInfo.color}`}>
                      {badgeInfo.label}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium">
                      {challenge.daysRemaining} dias restantes
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white group-hover:text-orange-400 transition-colors mb-1">
                    {challenge.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                    {challenge.description}
                  </p>

                  {/* Participantes & Progresso */}
                  <div className="space-y-2 pt-2 border-t border-zinc-900">
                    <div className="flex items-center justify-between">
                      {/* Avatares dos Participantes */}
                      <div className="flex items-center">
                        <div className="flex -space-x-1.5 mr-2">
                          {challenge.participantAvatars.slice(0, 3).map((avatar, i) => (
                            <img
                              key={i}
                              src={avatar}
                              alt="Participante"
                              className="w-5 h-5 rounded-full object-cover border border-zinc-900"
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-zinc-400">
                          {challenge.participantsCount} atletas
                        </span>
                      </div>

                      <span className="text-[11px] font-bold text-orange-400">
                        {progressPercent}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-zinc-500">
                      <span>Progresso: {challenge.userProgress} / {challenge.targetValue} {challenge.targetUnit}</span>
                      <span className="text-zinc-300 font-semibold group-hover:text-orange-400 flex items-center gap-0.5">
                        Ver Ranking
                        <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Challenge Detail Modal */}
      {selectedChallenge && (
        <ChallengeDetailModal
          challenge={selectedChallenge}
          onClose={() => setSelectedChallenge(null)}
        />
      )}

      {/* Create Custom Challenge Modal */}
      {isCreateChallengeOpen && (
        <CreateChallengeModal
          onClose={() => setIsCreateChallengeOpen(false)}
        />
      )}

      {/* Add Friends Modal */}
      {isAddFriendsOpen && (
        <AddFriendsModal
          onClose={() => setIsAddFriendsOpen(false)}
        />
      )}
    </div>
  );
}
