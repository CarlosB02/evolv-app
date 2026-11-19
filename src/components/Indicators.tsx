import { Droplets, Footprints, Scale, Plus } from 'lucide-react';
import { Indicator } from '../types';
import { useProfile } from '../context/ProfileContext';

interface IndicatorsProps {
  indicators: Indicator[];
}

export function Indicators({ indicators }: IndicatorsProps) {
  const { settings } = useProfile();
  const formatNumber = (num: number) => num.toLocaleString('pt-BR');
  const isLbs = settings.weightUnit === 'Lbs';

  return (
    <section className="px-5 py-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500 fill-mode-both">
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-sm font-bold text-white">Meus indicadores</h2>
        <button className="text-[11px] font-bold text-orange-500 hover:text-orange-400 transition-colors flex items-center gap-1">
          Ver todos ›
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-2 pb-2">
        {indicators.map((ind) => {
          const progress = ind.targetValue 
            ? Math.min(100, Math.round((ind.currentValue / ind.targetValue) * 100)) 
            : null;

          return (
            <div 
              key={ind.id} 
              className="bg-[#0a0a0a] border border-zinc-800/60 rounded-[16px] p-2.5 flex flex-col justify-between"
            >
              {/* TOP SECTION */}
              <div className={ind.type === 'weight' ? 'flex flex-col w-full mb-1' : 'flex gap-2 items-center mb-2'}>
                
                {/* ÁGUA & PASSOS */}
                {(ind.type === 'water' || ind.type === 'steps') && (
                  <>
                    <div className="relative w-[34px] h-[34px] flex items-center justify-center shrink-0">
                      <svg className="w-[34px] h-[34px] -rotate-90 absolute inset-0">
                        <circle cx="17" cy="17" r="14" fill="none" className="stroke-zinc-800/80" strokeWidth="2.5" />
                        <circle cx="17" cy="17" r="14" fill="none" className="stroke-orange-500" strokeWidth="2.5" strokeDasharray="87.9" strokeDashoffset={87.9 - ((progress || 0) * 87.9) / 100} strokeLinecap="round" />
                      </svg>
                      {ind.type === 'water' ? (
                        <Droplets className="w-3.5 h-3.5 text-orange-500 relative z-10" strokeWidth={2.5} />
                      ) : (
                        <Footprints className="w-3.5 h-3.5 text-orange-500 relative z-10" strokeWidth={2.5} />
                      )}
                    </div>
                    
                    <div className="flex flex-col justify-center">
                      <span className="text-zinc-400 text-[8px] font-bold uppercase tracking-widest mb-0.5">{ind.label}</span>
                      <div className="flex items-baseline gap-0.5 leading-none mb-1">
                        <span className="text-lg font-normal text-white tracking-tight">{formatNumber(ind.currentValue)}</span>
                        {ind.type === 'water' && <span className="text-[9px] font-bold text-white">L</span>}
                      </div>
                      {ind.targetValue && (
                        <span className="text-[8px] text-zinc-500 font-medium whitespace-nowrap">de {formatNumber(ind.targetValue)} {ind.type === 'water' ? 'L' : ''}</span>
                      )}
                    </div>
                  </>
                )}

                {/* PESO */}
                {ind.type === 'weight' && (
                  <div className="mt-[-2px]">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-3.5 h-3.5 border border-orange-500/80 rounded-[3px] flex items-center justify-center shrink-0">
                         <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.29 7 12 12 20.71 7"></polyline><line x1="12" y1="22" x2="12" y2="12"></line></svg>
                      </div>
                      <span className="text-zinc-400 text-[8px] font-bold uppercase tracking-widest leading-none">Peso</span>
                    </div>
                    
                    <div className="flex items-baseline gap-1 mb-1.5 leading-none">
                      <span className="text-lg font-normal text-white tracking-tight">
                        {isLbs ? (ind.currentValue * 2.20462).toFixed(1) : formatNumber(ind.currentValue)}
                      </span>
                      <span className="text-[9px] font-bold text-white">{isLbs ? 'lbs' : 'kg'}</span>
                    </div>
                    
                    <div className="h-4 flex items-end mb-1 mt-1">
                      <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
                        <path d="M0,22 L16,24 L32,24 L48,22 L64,16 L80,12 L100,10" fill="none" className="stroke-orange-500" strokeWidth="2" strokeLinejoin="round" />
                        <circle cx="0" cy="22" r="2.5" className="fill-orange-500" />
                        <circle cx="16" cy="24" r="2.5" className="fill-orange-500" />
                        <circle cx="32" cy="24" r="2.5" className="fill-orange-500" />
                        <circle cx="48" cy="22" r="2.5" className="fill-orange-500" />
                        <circle cx="64" cy="16" r="2.5" className="fill-orange-500" />
                        <circle cx="80" cy="12" r="2.5" className="fill-orange-500" />
                        <circle cx="100" cy="10" r="2.5" className="fill-orange-500" />
                      </svg>
                    </div>
                    
                    <div className="flex flex-col gap-0 leading-tight">
                      <span className={ind.history && ind.history <= 0 ? 'text-orange-500 text-[8px] font-bold' : 'text-red-500 text-[8px] font-bold'}>
                        {ind.history && ind.history > 0 ? '+' : ''}
                        {ind.history ? (isLbs ? (ind.history * 2.20462).toFixed(1) : formatNumber(ind.history)) : 0} {isLbs ? 'lbs' : 'kg'}
                      </span>
                      <span className="text-zinc-500 text-[7px] font-medium tracking-tight">vs última semana</span>
                    </div>
                  </div>
                )}
              </div>

              {/* BOTTOM ACTION */}
              <div className="mt-auto pt-1">
                <button className="w-full flex items-center justify-between bg-zinc-900/80 hover:bg-zinc-800 transition-colors rounded-[8px] p-1 pl-2 border border-zinc-800/80 group">
                  <span className="text-[9px] font-medium text-zinc-300 group-hover:text-white transition-colors">Registar</span>
                  <div className="w-[18px] h-[18px] rounded-full border border-orange-500 flex items-center justify-center shrink-0">
                    <Plus className="w-2.5 h-2.5 text-orange-500" />
                  </div>
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </section>
  );
}
