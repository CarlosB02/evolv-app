import { Bell, Users, User } from 'lucide-react';
import { Student } from '../types';
import { useProfile } from '../context/ProfileContext';
import { useNotifications } from '../context/NotificationContext';
import { useCommunity } from '../context/CommunityContext';

interface HeaderProps {
  student: Student;
}

export function Header({ student }: HeaderProps) {
  const { openProfile } = useProfile();
  const { openNotifications, totalUnreadCount } = useNotifications();
  const { openCommunity } = useCommunity();

  return (
    <header className="flex justify-between items-center px-5 pt-[max(0.75rem,env(safe-area-inset-top))] sm:pt-8 pb-3 bg-black/90 backdrop-blur-xl sticky top-0 z-30 border-b border-zinc-900">
      <div className="flex items-center gap-3">
        <img
          src="/assets/aistudio/9CF5FBD1-65BF-4557-BF19-1F1A5C3032B1_b4e3ad3d.PNG"
          alt="EVOLV"
          className="w-10 h-10 object-contain shrink-0"
        />
        <p className="text-white text-sm font-bold tracking-wider leading-tight">EVOLV</p>
      </div>
      
      <div className="flex items-center gap-4">
        {/* 1. Notificações */}
        <button 
          onClick={() => openNotifications('geral')}
          className="relative text-orange-500 transition-transform hover:scale-110 cursor-pointer" 
          aria-label="Notificações"
          title="Abrir Notificações"
        >
          <Bell className="w-[22px] h-[22px]" strokeWidth={2} />
          {totalUnreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-[#0a0a0a] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-black animate-pulse">
              {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
            </span>
          )}
        </button>

        {/* 2. Comunidade */}
        <button 
          onClick={() => openCommunity()}
          className="relative text-orange-500 transition-transform hover:scale-110 cursor-pointer" 
          aria-label="Comunidade"
          title="Abrir Comunidade RTEAM"
        >
          <Users className="w-[22px] h-[22px]" strokeWidth={2} />
        </button>

        {/* 3. Perfil */}
        <button 
          onClick={openProfile}
          className="relative text-orange-500 transition-transform hover:scale-110 cursor-pointer" 
          aria-label="Perfil"
          title="Abrir Perfil"
        >
          <User className="w-[22px] h-[22px]" strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}
