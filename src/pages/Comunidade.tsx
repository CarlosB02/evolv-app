import React from 'react';
import { ArrowLeft, Users, MessageSquare, Flame, Trophy, Sparkles } from 'lucide-react';
import { CommunityTab } from '../types/community';
import { useCommunity } from '../context/CommunityContext';
import { CommunityFeedTab } from '../components/community/CommunityFeedTab';
import { CommunityChallengesTab } from '../components/community/CommunityChallengesTab';
import { CommunityAchievementsTab } from '../components/community/CommunityAchievementsTab';

interface ComunidadeProps {
  onBack: () => void;
}

export function Comunidade({ onBack }: ComunidadeProps) {
  const { activeTab, setActiveTab, toastMessage } = useCommunity();

  return (
    <div className="flex flex-col min-h-full bg-black text-white animate-in slide-in-from-right duration-300 ease-out">
      {/* 1. Header do Topo: Botão Voltar à Home + Título "Comunidade" */}
      <header className="px-5 pt-7 pb-3 bg-black/90 backdrop-blur-md sticky top-0 z-30 border-b border-zinc-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer group"
            aria-label="Voltar à Home"
            title="Voltar à Home"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <h1 className="text-white text-lg font-bold tracking-tight leading-tight">
              Comunidade
            </h1>
            <p className="text-zinc-500 text-[11px] leading-tight">
              RTEAM Family • 142 atletas online
            </p>
          </div>
        </div>

        {/* Live Community Tag */}
        <div className="flex items-center gap-1.5 bg-[#141414] border border-zinc-800 px-2.5 py-1 rounded-full text-[11px] text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="font-semibold text-zinc-300">RTEAM</span>
        </div>
      </header>

      {/* 2. Três Separadores Principais: Feed, Desafios, Conquistas */}
      <div className="px-5 pt-3 pb-2 bg-black border-b border-zinc-900 sticky top-[68px] z-20">
        <div className="grid grid-cols-3 p-1 bg-[#121212] rounded-2xl border border-zinc-800/80">
          {/* Separador 1: Feed */}
          <button
            type="button"
            onClick={() => setActiveTab('feed')}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'feed'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Feed</span>
          </button>

          {/* Separador 2: Desafios */}
          <button
            type="button"
            onClick={() => setActiveTab('desafios')}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'desafios'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Desafios</span>
          </button>

          {/* Separador 3: Conquistas */}
          <button
            type="button"
            onClick={() => setActiveTab('conquistas')}
            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'conquistas'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Conquistas</span>
          </button>
        </div>
      </div>

      {/* 3. Conteúdo Independente de Cada Separador */}
      <main className="flex-1 px-5 pt-4">
        {activeTab === 'feed' && <CommunityFeedTab />}
        {activeTab === 'desafios' && <CommunityChallengesTab />}
        {activeTab === 'conquistas' && <CommunityAchievementsTab />}
      </main>

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-orange-500 text-black px-4 py-2 rounded-full font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
