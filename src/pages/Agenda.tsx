import { Timer, Calendar, Trophy, ChevronLeft, ChevronRight, Dumbbell, ChevronRight as ChevronRightSmall, BarChart3, Bell, User } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { useNotifications } from '../context/NotificationContext';

export function Agenda() {
  const { openProfile } = useProfile();
  const { openNotifications, totalUnreadCount } = useNotifications();

  return (
    <>
      {/* HEADER */}
      <header className="flex justify-between items-center px-5 pt-[max(0.75rem,env(safe-area-inset-top))] sm:pt-8 pb-3 bg-black/90 backdrop-blur-xl sticky top-0 z-30 border-b border-zinc-900">
        <div className="flex items-center gap-3">
          <img
            src="/assets/aistudio/9CF5FBD1-65BF-4557-BF19-1F1A5C3032B1_b4e3ad3d.PNG"
            alt="EVOLV"
            className="w-10 h-10 object-contain shrink-0"
          />
          <p className="text-white text-sm font-bold tracking-wider leading-tight">EVOLV</p>
        </div>
        
        <div className="flex gap-4">
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

      <div className="flex flex-col px-5 pt-4 pb-6 animate-in fade-in duration-200">

      {/* STATS HEADER */}
      <div className="bg-[#0a0a0a] rounded-[20px] p-5 mb-4 border border-zinc-800/60">
        <div className="flex justify-between items-center mb-3">
          <span className="text-zinc-300 text-[13px] font-medium">Total Treinos esta Semana</span>
          <span className="text-orange-500 text-[13px] font-medium">3/5 <span className="text-zinc-500 text-xs">Treinos</span></span>
        </div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-zinc-300 text-[13px] font-medium">Total Treinos Mês</span>
          <div className="text-right">
            <span className="text-orange-500 text-[13px] font-medium block">3 <span className="text-zinc-500 text-xs">Treinos</span></span>
            <span className="text-zinc-500 text-[10px]">+3% Mês Anterior</span>
          </div>
        </div>
        <div className="flex justify-between items-center mb-5">
          <span className="text-zinc-300 text-[13px] font-medium">Total Treinos Ano</span>
          <span className="text-orange-500 text-[13px] font-medium">130 <span className="text-zinc-500 text-xs">Treinos</span></span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-zinc-900/40 rounded-xl p-2 border border-zinc-800/40 flex items-center justify-center gap-1.5">
            <Timer className="text-orange-500 w-[18px] h-[18px] shrink-0" strokeWidth={2} />
            <div className="flex flex-col items-start">
              <span className="text-zinc-500 text-[8px] uppercase tracking-wider font-medium leading-tight">Sessões</span>
              <div className="text-white font-medium text-[11px] leading-tight">4<span className="text-zinc-500 text-[9px] font-normal ml-0.5">/ Sem</span></div>
            </div>
          </div>
          <div className="bg-zinc-900/40 rounded-xl p-2 border border-zinc-800/40 flex items-center justify-center gap-1.5">
            <Calendar className="text-orange-500 w-[18px] h-[18px] shrink-0" strokeWidth={2} />
            <div className="flex flex-col items-start">
              <span className="text-zinc-500 text-[8px] uppercase tracking-wider font-medium leading-tight">Sessões</span>
              <div className="text-white font-medium text-[11px] leading-tight">16<span className="text-zinc-500 text-[9px] font-normal ml-0.5">/ Mês</span></div>
            </div>
          </div>
          <div className="bg-zinc-900/40 rounded-xl p-2 border border-zinc-800/40 flex items-center justify-center gap-1.5">
            <Trophy className="text-orange-500 w-[18px] h-[18px] shrink-0" strokeWidth={2} />
            <div className="flex flex-col items-start">
              <span className="text-zinc-500 text-[8px] uppercase tracking-wider font-medium leading-tight">Sessões</span>
              <div className="text-white font-medium text-[11px] leading-tight">130<span className="text-zinc-500 text-[9px] font-normal ml-0.5">/ Ano</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* CALENDAR */}
      <div className="bg-[#0a0a0a] rounded-[20px] p-5 mb-4 border border-zinc-800/60">
        <div className="flex justify-between items-center mb-6">
          <button className="p-1"><ChevronLeft className="w-4 h-4 text-zinc-400" /></button>
          <span className="text-white font-medium text-sm">Janeiro</span>
          <button className="p-1"><ChevronRight className="w-4 h-4 text-zinc-400" /></button>
        </div>
        
        <div className="grid grid-cols-7 gap-y-5 text-center">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <span key={day} className="text-zinc-500 text-[11px]">{day}</span>
          ))}
          
          {/* Previous month days */}
          {[26, 27, 28].map(d => <div key={`p${d}`} className="text-zinc-600 text-[13px] font-medium pt-1">{d}</div>)}
          
          {/* Current month days */}
          {[1, 2, 3].map(d => (
            <div key={d} className="relative pt-1 flex flex-col items-center">
              <span className="text-white text-[13px] font-medium">{d}</span>
              <div className="w-1 h-1 bg-orange-500 rounded-full mt-1.5"></div>
            </div>
          ))}
          
          <div className="relative flex flex-col items-center">
            <div className="w-[30px] h-[30px] rounded-full border border-orange-500 flex items-center justify-center">
              <span className="text-white text-[13px] font-medium">4</span>
            </div>
          </div>
          
          {[5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map(d => (
            <div key={d} className="text-white text-[13px] font-medium pt-1">{d}</div>
          ))}
          
          {[20, 21].map(d => (
            <div key={d} className="relative pt-1 flex flex-col items-center">
              <span className="text-white text-[13px] font-medium">{d}</span>
              <div className="w-1 h-1 bg-orange-500 rounded-full mt-1.5"></div>
            </div>
          ))}
          
          <div className="text-white text-[13px] font-medium pt-1">22</div>
          
          <div className="relative pt-1 flex flex-col items-center">
            <span className="text-white text-[13px] font-medium">23</span>
              <div className="w-1 h-1 bg-orange-500 rounded-full mt-1.5"></div>
          </div>
          
          {[24, 25, 26, 27, 28, 29, 30, 31].map(d => (
            <div key={d} className="text-white text-[13px] font-medium pt-1">{d}</div>
          ))}

          {/* Next month days */}
          {[1, 2, 3, 4, 5, 6, 7, 8].map(d => <div key={`n${d}`} className="text-zinc-600 text-[13px] font-medium pt-1">{d}</div>)}
        </div>
      </div>

      {/* LOG ITEM */}
      <div className="bg-[#0a0a0a] rounded-[20px] p-4 mb-4 border border-zinc-800/60 flex items-center justify-between cursor-pointer group hover:border-zinc-700/80 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-[50px] h-[50px] rounded-[14px] border border-orange-500/30 flex items-center justify-center overflow-hidden bg-zinc-900/50">
            <img src="https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=150&auto=format&fit=crop" alt="Glúteo" className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div>
            <h4 className="text-white font-medium text-[15px] mb-1 leading-none">Glúteo</h4>
            <div className="text-zinc-500 text-xs">
              Duração do Treino <span className="text-orange-500 font-medium ml-1">1:03:25s</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 text-[11px]">14:32</span>
          <ChevronRightSmall className="w-4 h-4 text-orange-500 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* CHART */}
      <div className="bg-[#0a0a0a] rounded-[20px] p-5 border border-zinc-800/60">
        <div className="flex items-center gap-2 mb-8">
          <BarChart3 className="w-4 h-4 text-zinc-400" />
          <span className="text-white text-[13px] font-medium">Distribuição Semanal</span>
        </div>
        
        <div className="flex justify-between items-end h-[140px] px-2">
          {[
            { day: 'Seg', val: 15.6, h: '80%' },
            { day: 'Ter', val: 17, h: '100%' },
            { day: 'Qua', val: 13.3, h: '65%' },
            { day: 'Qui', val: 16.3, h: '85%' },
            { day: 'Sex', val: 13.3, h: '65%' },
            { day: 'Sáb', val: 13.3, h: '65%' },
            { day: 'Dom', val: 11.1, h: '50%' }
          ].map(item => (
            <div key={item.day} className="flex flex-col items-center h-full w-full group">
              <span className="text-[9px] text-zinc-400 group-hover:text-white transition-colors">{item.val}%</span>
              <div className="flex-1 w-full flex items-end justify-center py-2">
                <div 
                  className="w-3 rounded-full bg-gradient-to-t from-red-600 via-orange-500 to-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.3)] transition-all duration-500 group-hover:brightness-110" 
                  style={{ height: item.h }}
                ></div>
              </div>
              <span className="text-[10px] text-zinc-500">{item.day}</span>
            </div>
          ))}
        </div>
      </div>
      
      </div>
    </>
  );
}
