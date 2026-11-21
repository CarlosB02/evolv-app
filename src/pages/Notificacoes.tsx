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
    activeChatSpecialist,
    unreadNotificationsCount, 
    unreadChatCount,
  } = useNotifications();

  const subtitle =
    activeTab === 'geral'
      ? 'Alertas e novidades'
      : activeChatSpecialist === 'nutritionist'
      ? 'Conversa com a Nutricionista'
      : 'Conversa com o Treinador';

  return (
    <div className="flex flex-col h-full bg-black text-white overflow-hidden animate-in fade-in duration-200">
      {/* Top Header */}
      <header className="px-5 pt-[max(0.75rem,env(safe-area-inset-top))] sm:pt-8 pb-3 bg-black/90 backdrop-blur-xl border-b border-zinc-900 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 -ml-1.5 text-zinc-300 hover:text-white transition-colors cursor-pointer shrink-0"
            aria-label="Voltar"
            title="Voltar"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-white text-lg font-bold tracking-tight leading-tight">
              Notificações
            </h1>
            <p className="text-zinc-500 text-[11px] leading-tight truncate">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Small live badge */}
        <div className="flex items-center gap-1.5 bg-[#141414] border border-zinc-800 px-2.5 py-1 rounded-full text-[11px] text-zinc-400 shrink-0">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span>EVOLV Connect</span>
        </div>
      </header>

      {/* Tabs Selector: Geral vs Chat Live */}
      <div className="px-5 pt-3 pb-2.5 bg-black border-b border-zinc-900 shrink-0 z-20">
        <div className="grid grid-cols-2 p-1 bg-[#121212] rounded-2xl border border-zinc-800/80">
          {/* Tab 1: Geral */}
          <button
            type="button"
            onClick={() => setActiveTab('geral')}
            style={activeTab === 'geral' ? { color: '#ffffff' } : undefined}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'geral'
                ? 'bg-[#F77F00] shadow-md shadow-orange-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Geral</span>
            {unreadNotificationsCount > 0 && (
              <span
                style={{ color: '#ffffff' }}
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'geral' ? 'bg-white/20' : 'bg-[#F77F00]'
                }`}
              >
                {unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Tab 2: Chat Live */}
          <button
            type="button"
            onClick={() => setActiveTab('coach')}
            style={activeTab === 'coach' ? { color: '#ffffff' } : undefined}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'coach'
                ? 'bg-[#F77F00] shadow-md shadow-orange-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat Live</span>
            {unreadChatCount > 0 && (
              <span
                style={{ color: '#ffffff' }}
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'coach' ? 'bg-white/20' : 'bg-[#F77F00]'
                }`}
              >
                {unreadChatCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'geral' ? (
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain hide-scrollbar">
          <GeneralNotificationsTab onNavigateTab={onNavigateTab} />
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <CoachChatTab />
        </div>
      )}
    </div>
  );
}
