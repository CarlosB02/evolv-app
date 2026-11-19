import React, { useState } from 'react';
import { 
  Calendar, 
  Flame, 
  Target, 
  Droplets, 
  Lightbulb, 
  PartyPopper, 
  Info, 
  ChevronRight,
  CheckCheck
} from 'lucide-react';
import { AppNotification, NotificationCategory } from '../../types';
import { useNotifications } from '../../context/NotificationContext';
import { NotificationDetailModal } from './NotificationDetailModal';

interface GeneralNotificationsTabProps {
  onNavigateTab?: (targetTab: string) => void;
}

const CATEGORIES: NotificationCategory[] = [
  'Todos',
  'Avaliação',
  'Motivação',
  'Dicas',
  'Informações',
];

export function GeneralNotificationsTab({ onNavigateTab }: GeneralNotificationsTabProps) {
  const { 
    notifications, 
    markNotificationAsRead, 
    markAllAsRead, 
    unreadNotificationsCount 
  } = useNotifications();

  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory>('Todos');
  const [selectedNotification, setSelectedNotification] = useState<AppNotification | null>(null);

  // Filter notifications
  const filteredNotifications = notifications.filter(item => {
    if (selectedCategory === 'Todos') return true;
    return item.category === selectedCategory;
  });

  const handleCardClick = (item: AppNotification) => {
    markNotificationAsRead(item.id);
    setSelectedNotification(item);
  };

  const handleActionClick = (item: AppNotification) => {
    if (item.targetTab && onNavigateTab) {
      onNavigateTab(item.targetTab);
    }
  };

  const getNotificationIcon = (iconType: AppNotification['iconType']) => {
    switch (iconType) {
      case 'assessment':
        return <Calendar className="w-5 h-5 text-blue-400 shrink-0 mt-0.5 transition-transform group-hover:scale-105" />;
      case 'motivation':
        return <Flame className="w-5 h-5 text-orange-400 shrink-0 mt-0.5 transition-transform group-hover:scale-105" />;
      case 'goal':
        return <Target className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 transition-transform group-hover:scale-105" />;
      case 'water':
        return <Droplets className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5 transition-transform group-hover:scale-105" />;
      case 'tip':
        return <Lightbulb className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 transition-transform group-hover:scale-105" />;
      case 'congrats':
        return <PartyPopper className="w-5 h-5 text-purple-400 shrink-0 mt-0.5 transition-transform group-hover:scale-105" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-zinc-300 shrink-0 mt-0.5 transition-transform group-hover:scale-105" />;
    }
  };

  return (
    <div className="flex flex-col flex-1 pb-6">
      {/* Category Filter Pills & Mark all as read */}
      <div className="px-5 pt-3 pb-2 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-zinc-500 text-[11px] font-medium">
            {unreadNotificationsCount > 0 
              ? `${unreadNotificationsCount} ${unreadNotificationsCount === 1 ? 'não lida' : 'não lidas'}`
              : 'Tudo em dia'}
          </span>
          {unreadNotificationsCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-orange-500 hover:text-orange-400 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Marcar todas como lidas</span>
            </button>
          )}
        </div>

        {/* Filter Scrollable List */}
        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar py-0.5">
          {CATEGORIES.map(category => {
            const isSelected = selectedCategory === category;
            const countForCat = category === 'Todos' 
              ? notifications.length 
              : notifications.filter(n => n.category === category).length;

            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                    : 'bg-[#141414] text-zinc-400 hover:text-white border border-zinc-800/80'
                }`}
              >
                <span>{category}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {countForCat}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications Compact Cards List */}
      <div className="px-5 pt-1 space-y-2">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12 px-4 bg-[#111111] rounded-2xl border border-zinc-800/80 mt-2">
            <Info className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-white text-xs font-semibold">Nenhuma notificação encontrada</p>
            <p className="text-zinc-500 text-[11px] mt-1 max-w-[200px] mx-auto">
              Não existem avisos na categoria {selectedCategory}.
            </p>
          </div>
        ) : (
          filteredNotifications.map(item => {
            const isUnread = !item.read;

            return (
              <div
                key={item.id}
                onClick={() => handleCardClick(item)}
                className={`group relative flex items-start gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                  isUnread
                    ? 'bg-[#141414] hover:bg-[#181818] border-orange-500/30 shadow-sm'
                    : 'bg-[#0f0f0f] hover:bg-[#141414] border-zinc-800/70'
                }`}
              >
                {/* Unread Glowing Dot Indicator */}
                {isUnread && (
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316] ring-2 ring-black" />
                )}

                {/* Content Icon */}
                {getNotificationIcon(item.iconType)}

                {/* Content Text */}
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className={`text-xs font-semibold leading-tight truncate ${
                      isUnread ? 'text-white font-bold' : 'text-zinc-200'
                    }`}>
                      {item.title}
                    </h4>
                  </div>

                  <p className="text-zinc-400 text-[11px] leading-snug line-clamp-2 mt-0.5">
                    {item.shortDescription}
                  </p>

                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-zinc-500 font-medium">
                      {item.timestamp}
                    </span>
                    <span className="text-zinc-600 text-[8px]">•</span>
                    <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Chevron */}
                <div className="self-center text-zinc-600 group-hover:text-zinc-300 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail Modal */}
      <NotificationDetailModal
        isOpen={!!selectedNotification}
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
        onActionClick={handleActionClick}
      />
    </div>
  );
}
