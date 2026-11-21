import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { CheckInRegisterTab } from '../components/checkin/CheckInRegisterTab';
import { CheckInChartsTab } from '../components/checkin/CheckInChartsTab';
import { useScrollToTop } from '../utils/scrollToTop';

type CheckInMainTab = 'registo' | 'graficos';

interface CheckInDiarioProps {
  onBack: () => void;
}

export function CheckInDiario({ onBack }: CheckInDiarioProps) {
  const [activeTab, setActiveTab] = useState<CheckInMainTab>('registo');

  useScrollToTop([activeTab]);

  return (
    <div className="flex flex-col min-h-full animate-in fade-in duration-200">
      {/* HEADER STICKY */}
      <header className="flex items-center justify-between px-5 pt-[max(0.75rem,env(safe-area-inset-top))] sm:pt-8 pb-3 bg-black/90 backdrop-blur-xl sticky top-0 z-30 border-b border-zinc-900">
        <button
          type="button"
          onClick={onBack}
          aria-label="Voltar ao início"
          className="min-w-[44px] min-h-[40px] -ml-2 flex items-center gap-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 text-[#F77F00]" strokeWidth={2.5} />
          <span className="text-xs font-semibold">Voltar</span>
        </button>

        <h1 className="text-white text-sm font-bold tracking-wide whitespace-nowrap">
          Check-in Diário
        </h1>

        <div className="w-[64px]" aria-hidden="true" />
      </header>

      <div className="flex flex-col px-5 pt-4 pb-8">
        {/* TABS PRINCIPAIS: REGISTO | GRÁFICOS */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#0a0a0a] border border-zinc-800/80 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('registo')}
            style={activeTab === 'registo' ? { color: '#ffffff' } : undefined}
            className={`min-h-[40px] py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'registo'
                ? 'bg-[#F77F00] shadow-md shadow-orange-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Registo
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('graficos')}
            style={activeTab === 'graficos' ? { color: '#ffffff' } : undefined}
            className={`min-h-[40px] py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'graficos'
                ? 'bg-[#F77F00] shadow-md shadow-orange-500/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Gráficos
          </button>
        </div>

        {activeTab === 'registo' ? <CheckInRegisterTab /> : <CheckInChartsTab />}
      </div>
    </div>
  );
}
