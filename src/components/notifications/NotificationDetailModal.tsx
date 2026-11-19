import React from 'react';
import { 
  X, 
  Calendar, 
  Flame, 
  Target, 
  Droplets, 
  Lightbulb, 
  PartyPopper, 
  Info,
  Clock,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { AppNotification } from '../../types';

interface NotificationDetailModalProps {
  notification: AppNotification | null;
  isOpen: boolean;
  onClose: () => void;
  onActionClick?: (notification: AppNotification) => void;
}

export function NotificationDetailModal({
  notification,
  isOpen,
  onClose,
  onActionClick,
}: NotificationDetailModalProps) {
  if (!isOpen || !notification) return null;

  const getIcon = () => {
    switch (notification.iconType) {
      case 'assessment':
        return <Calendar className="w-5 h-5 text-blue-400" />;
      case 'motivation':
        return <Flame className="w-5 h-5 text-orange-400" />;
      case 'goal':
        return <Target className="w-5 h-5 text-amber-400" />;
      case 'water':
        return <Droplets className="w-5 h-5 text-cyan-400" />;
      case 'tip':
        return <Lightbulb className="w-5 h-5 text-emerald-400" />;
      case 'congrats':
        return <PartyPopper className="w-5 h-5 text-purple-400" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-zinc-300" />;
    }
  };

  const getBadgeColor = () => {
    switch (notification.category) {
      case 'Avaliação':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Motivação':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'Dicas':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Informações':
      default:
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#111111] border border-zinc-800 rounded-t-[28px] sm:rounded-[24px] w-full max-w-[400px] p-5 shadow-2xl animate-in slide-from-bottom duration-300 max-h-[85vh] overflow-y-auto hide-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-4 sticky top-0 bg-[#111111] z-10">
          <div className="flex items-center gap-2.5">
            {getIcon()}
            <div>
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${getBadgeColor()}`}>
                {notification.category}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800/60 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div>
            <h3 className="text-white text-base font-bold tracking-tight mb-1">
              {notification.title}
            </h3>
            <div className="flex items-center gap-1.5 text-zinc-500 text-[11px]">
              <Clock className="w-3 h-3" />
              <span>{notification.timestamp}</span>
            </div>
          </div>

          <div className="bg-[#0a0a0a] rounded-xl p-3.5 border border-zinc-800/70 text-zinc-300 text-xs leading-relaxed">
            {notification.fullContent || notification.shortDescription}
          </div>

          {/* Action Button if available */}
          {notification.actionLabel && onActionClick && (
            <button
              onClick={() => {
                onActionClick(notification);
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
            >
              <span>{notification.actionLabel}</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          )}

          <div className="flex items-center justify-center gap-1.5 text-zinc-500 text-[11px] pt-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Notificação lida e arquivada</span>
          </div>
        </div>
      </div>
    </div>
  );
}
