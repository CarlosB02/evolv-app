import React from 'react';
import { ArrowLeft, MessageSquare, Bell } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { GeneralNotificationsTab } from '../components/notifications/GeneralNotificationsTab';
import { CoachChatTab } from '../components/notifications/CoachChatTab';

interface NotificacoesProps {
  onBack: () => void;
  onNavigateTab?: (targetTab: string) => void;
}

export function Notificacoes({ onBack, onNavigateTab }: NotificacoesProps) {
  const { 
    activeTab, 
    setActiveTab, 
    unreadNotificationsCount, 
    unreadCoachCount 
  } = useNotifications();

  return (
    <div className="flex flex-col min-h-full bg-black text-white animate-in fade-in duration-200">
      {/* Top Header */}
      <header className="px-5 pt-7 pb-3 bg-black/90 backdrop-blur-md sticky top-0 z-30 border-b border-zinc-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 -ml-1.5 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Voltar"
            title="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-white text-lg font-bold tracking-tight leading-tight">
              Notificações
            </h1>
            <p className="text-zinc-500 text-[11px] leading-tight">
              {activeTab === 'geral' ? 'Alertas e novidades' : 'Conversa com o Treinador'}
            </p>
          </div>
        </div>

        {/* Small live badge */}
        <div className="flex items-center gap-1.5 bg-[#141414] border border-zinc-800 px-2.5 py-1 rounded-full text-[11px] text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span>PR1ME Connect</span>
        </div>
      </header>

      {/* Tabs Selector: Geral vs Coach */}
      <div className="px-5 pt-3 pb-2 bg-black border-b border-zinc-900 sticky top-[68px] z-20">
        <div className="grid grid-cols-2 p-1 bg-[#121212] rounded-2xl border border-zinc-800/80">
          {/* Tab 1: Geral */}
          <button
            type="button"
            onClick={() => setActiveTab('geral')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'geral'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Geral</span>
            {unreadNotificationsCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'geral' ? 'bg-white/20 text-white' : 'bg-orange-500 text-white'
              }`}>
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Tab 2: Coach */}
          <button
            type="button"
            onClick={() => setActiveTab('coach')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'coach'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Coach</span>
            {unreadCoachCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'coach' ? 'bg-white/20 text-white' : 'bg-orange-500 text-white'
              }`}>
                {unreadCoachCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 flex flex-col">
        {activeTab === 'geral' ? (
          <GeneralNotificationsTab onNavigateTab={onNavigateTab} />
        ) : (
          <CoachChatTab />
        )}
      </div>
    </div>
  );
}
