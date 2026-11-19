import { Home, Dumbbell, Utensils, CalendarDays, TrendingUp } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  return (
    <nav className="shrink-0 w-full bg-black/90 backdrop-blur-xl border-t border-zinc-900 px-6 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] z-40 sm:rounded-b-[36px]">
      <div className="flex justify-between items-center max-w-sm mx-auto">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 group ${activeTab === 'home' ? 'opacity-100' : 'opacity-50 hover:opacity-100'} transition-opacity`}
        >
          <div className="relative">
            <Home className={`w-5 h-5 ${activeTab === 'home' ? 'text-orange-500' : 'text-zinc-400 group-hover:text-white transition-colors'}`} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
          </div>
          <span className={`text-[9px] ${activeTab === 'home' ? 'font-bold text-orange-500' : 'font-medium text-zinc-400 group-hover:text-white transition-colors'}`}>Início</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('treino')}
          className={`flex flex-col items-center gap-1 group ${activeTab === 'treino' ? 'opacity-100' : 'opacity-50 hover:opacity-100'} transition-opacity`}
        >
          <Dumbbell className={`w-5 h-5 ${activeTab === 'treino' ? 'text-orange-500' : 'text-zinc-400 group-hover:text-white transition-colors'}`} strokeWidth={activeTab === 'treino' ? 2.5 : 2} />
          <span className={`text-[9px] ${activeTab === 'treino' ? 'font-bold text-orange-500' : 'font-medium text-zinc-400 group-hover:text-white transition-colors'}`}>Treino</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('dieta')}
          className={`flex flex-col items-center gap-1 group ${activeTab === 'dieta' ? 'opacity-100' : 'opacity-50 hover:opacity-100'} transition-opacity`}
        >
          <Utensils className={`w-5 h-5 ${activeTab === 'dieta' ? 'text-orange-500' : 'text-zinc-400 group-hover:text-white transition-colors'}`} strokeWidth={activeTab === 'dieta' ? 2.5 : 2} />
          <span className={`text-[9px] ${activeTab === 'dieta' ? 'font-bold text-orange-500' : 'font-medium text-zinc-400 group-hover:text-white transition-colors'}`}>Dieta</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('agenda')}
          className={`flex flex-col items-center gap-1 group ${activeTab === 'agenda' ? 'opacity-100' : 'opacity-50 hover:opacity-100'} transition-opacity`}
        >
          <CalendarDays className={`w-5 h-5 ${activeTab === 'agenda' ? 'text-orange-500' : 'text-zinc-400 group-hover:text-white transition-colors'}`} strokeWidth={activeTab === 'agenda' ? 2.5 : 2} />
          <span className={`text-[9px] ${activeTab === 'agenda' ? 'font-bold text-orange-500' : 'font-medium text-zinc-400 group-hover:text-white transition-colors'}`}>Agenda</span>
        </button>

        <button 
          onClick={() => setActiveTab('evolucao')}
          className={`flex flex-col items-center gap-1 group ${activeTab === 'evolucao' ? 'opacity-100' : 'opacity-50 hover:opacity-100'} transition-opacity`}
        >
          <TrendingUp className={`w-5 h-5 ${activeTab === 'evolucao' ? 'text-orange-500' : 'text-zinc-400 group-hover:text-white transition-colors'}`} strokeWidth={activeTab === 'evolucao' ? 2.5 : 2} />
          <span className={`text-[9px] ${activeTab === 'evolucao' ? 'font-bold text-orange-500' : 'font-medium text-zinc-400 group-hover:text-white transition-colors'}`}>Evolução</span>
        </button>
      </div>
    </nav>
  );
}
