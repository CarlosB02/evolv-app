import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Droplets, Footprints, Minus, Plus, Scale } from 'lucide-react';
import { Indicator } from '../types';
import { useProfile } from '../context/ProfileContext';
import { useDailyCheckIn } from '../context/DailyCheckInContext';

interface IndicatorsProps {
  indicators: Indicator[];
}

const LBS_FACTOR = 2.20462;

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function Indicators({ indicators: _initialIndicators }: IndicatorsProps) {
  const { settings } = useProfile();
  const {
    todayRecord,
    goals,
    baselineWeekAgoWeightKg,
    updateTodayCheckIn,
  } = useDailyCheckIn();
  const isLbs = settings.weightUnit === 'Lbs';

  const baselineWeightKg = baselineWeekAgoWeightKg;

  const items = useMemo<Indicator[]>(() => {
    const waterVal = todayRecord.waterLiters ?? 0;
    const stepsVal = todayRecord.steps ?? 0;
    const weightVal = todayRecord.weightKg ?? baselineWeightKg;

    return [
      {
        id: 'i1',
        type: 'water',
        label: 'Água',
        currentValue: round2(waterVal),
        targetValue: goals.waterGoalLiters,
        unit: 'L',
      },
      {
        id: 'i2',
        type: 'steps',
        label: 'Passos',
        currentValue: Math.round(stepsVal),
        targetValue: goals.stepsGoal,
        unit: 'passos',
      },
      {
        id: 'i3',
        type: 'weight',
        label: 'Peso Atual',
        currentValue: round1(weightVal),
        unit: 'kg',
        history: round1(weightVal - baselineWeightKg),
      },
    ];
  }, [todayRecord, goals, baselineWeightKg]);

  // Bottom sheet state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const [draftText, setDraftText] = useState('');

  // Drag-to-dismiss state
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartYRef = useRef<number | null>(null);
  const dragStartTimeRef = useRef<number>(0);
  const closeTimeoutRef = useRef<number | null>(null);

  const activeIndicator = items.find((i) => i.id === editingId) ?? null;

  const toDisplayValue = (ind: Indicator): number => {
    if (ind.type === 'weight') {
      return isLbs ? round1(ind.currentValue * LBS_FACTOR) : round1(ind.currentValue);
    }
    if (ind.type === 'water') {
      return round2(ind.currentValue);
    }
    return Math.round(ind.currentValue);
  };

  const openEditor = (ind: Indicator) => {
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setEditingId(ind.id);
    setDraftText(String(toDisplayValue(ind)));
    setDragY(0);
    setIsDragging(false);
    // Trigger CSS slide-up transition on next frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsSheetVisible(true);
      });
    });
  };

  const closeEditor = () => {
    setIsSheetVisible(false);
    setIsDragging(false);
    setDragY(0);
    if (closeTimeoutRef.current) {
      window.clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = window.setTimeout(() => {
      setEditingId(null);
      closeTimeoutRef.current = null;
    }, 260);
  };

  useEffect(() => {
    if (!editingId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeEditor();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [editingId]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        window.clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const parseDraft = (): number => {
    const normalized = draftText.replace(',', '.').trim();
    const num = parseFloat(normalized);
    return Number.isFinite(num) && num >= 0 ? num : 0;
  };

  const adjustDraft = (delta: number) => {
    if (!activeIndicator) return;
    const current = parseDraft();
    let next = Math.max(0, current + delta);
    if (activeIndicator.type === 'water') {
      next = round2(Math.min(15, next));
    } else if (activeIndicator.type === 'steps') {
      next = Math.round(Math.min(100000, next));
    } else {
      next = round1(Math.min(isLbs ? 660 : 300, next));
    }
    setDraftText(String(next));
  };

  const handleSave = () => {
    if (!activeIndicator) return;
    const parsed = parseDraft();

    if (activeIndicator.type === 'water') {
      updateTodayCheckIn({ waterLiters: round2(parsed) });
    } else if (activeIndicator.type === 'steps') {
      updateTodayCheckIn({ steps: Math.round(parsed) });
    } else {
      const nextKg = isLbs ? round1(parsed / LBS_FACTOR) : round1(parsed);
      updateTodayCheckIn({ weightKg: nextKg });
    }

    closeEditor();
  };

  // Pointer drag handlers for swipe-down to dismiss
  const handleDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, input')) return;
    dragStartYRef.current = e.clientY;
    dragStartTimeRef.current = performance.now();
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleDragMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartYRef.current === null) return;
    const delta = e.clientY - dragStartYRef.current;
    setDragY(delta > 0 ? delta : 0);
  };

  const handleDragEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartYRef.current === null) return;
    const delta = Math.max(0, e.clientY - dragStartYRef.current);
    const elapsed = Math.max(1, performance.now() - dragStartTimeRef.current);
    const velocity = delta / elapsed; // px/ms

    dragStartYRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    if (delta > 85 || (delta > 28 && velocity > 0.45)) {
      closeEditor();
    } else {
      setIsDragging(false);
      setDragY(0);
    }
  };

  const formatNumber = (num: number) =>
    num.toLocaleString('pt-PT', { maximumFractionDigits: 2 });

  const portalTarget =
    typeof document !== 'undefined'
      ? document.querySelector('.app-device-wrapper') || document.body
      : null;

  const draftValue = parseDraft();
  const draftProgress =
    activeIndicator && activeIndicator.targetValue
      ? Math.min(100, Math.round((draftValue / activeIndicator.targetValue) * 100))
      : null;

  const stepAmount =
    activeIndicator?.type === 'water'
      ? 0.25
      : activeIndicator?.type === 'steps'
      ? 500
      : 0.1;

  const quickAdjustments =
    activeIndicator?.type === 'water'
      ? [
          { label: '+0,25 L', delta: 0.25 },
          { label: '+0,5 L', delta: 0.5 },
          { label: '+1 L', delta: 1 },
        ]
      : activeIndicator?.type === 'steps'
      ? [
          { label: '+500', delta: 500 },
          { label: '+1 000', delta: 1000 },
          { label: '+2 500', delta: 2500 },
        ]
      : [
          { label: '-0,5', delta: -0.5 },
          { label: '-0,1', delta: -0.1 },
          { label: '+0,1', delta: 0.1 },
          { label: '+0,5', delta: 0.5 },
        ];

  const backdropOpacity = isSheetVisible
    ? Math.max(0.15, 1 - dragY / 320)
    : 0;

  const sheetPortal =
    activeIndicator && portalTarget
      ? createPortal(
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) closeEditor();
            }}
            style={{
              backgroundColor: `rgba(0, 0, 0, ${0.72 * backdropOpacity})`,
              transition: isDragging ? 'none' : 'background-color 240ms ease',
            }}
            className="fixed inset-0 z-[260] flex items-end justify-center backdrop-blur-[2px]"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Editar ${activeIndicator.label}`}
              onPointerDown={handleDragStart}
              onPointerMove={handleDragMove}
              onPointerUp={handleDragEnd}
              onPointerCancel={handleDragEnd}
              style={{
                transform: isSheetVisible
                  ? `translateY(${dragY}px)`
                  : 'translateY(100%)',
                transition: isDragging
                  ? 'none'
                  : 'transform 280ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              className="w-full max-w-[420px] bg-[#111111] border-t sm:border-x border-zinc-800 rounded-t-[28px] shadow-2xl overflow-hidden select-none touch-none"
            >
              {/* Cabeçalho + barra de arrasto */}
              <div className="cursor-grab active:cursor-grabbing px-5 pt-3 pb-3">
                <div className="w-10 h-1 rounded-full bg-zinc-700/80 mx-auto mb-3.5" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {activeIndicator.type === 'water' && (
                      <Droplets className="w-5 h-5 text-[#F77F00]" strokeWidth={2.2} />
                    )}
                    {activeIndicator.type === 'steps' && (
                      <Footprints className="w-5 h-5 text-[#F77F00]" strokeWidth={2.2} />
                    )}
                    {activeIndicator.type === 'weight' && (
                      <Scale className="w-5 h-5 text-[#F77F00]" strokeWidth={2.2} />
                    )}
                    <div>
                      <h3 className="text-white text-base font-bold leading-tight">
                        {activeIndicator.type === 'weight' ? 'Peso' : activeIndicator.label}
                      </h3>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        {activeIndicator.targetValue
                          ? `Meta diária: ${formatNumber(activeIndicator.targetValue)} ${
                              activeIndicator.type === 'water' ? 'L' : 'passos'
                            }`
                          : `Última semana: ${
                              isLbs
                                ? `${round1(baselineWeightKg * LBS_FACTOR)} lbs`
                                : `${formatNumber(baselineWeightKg)} kg`
                            }`}
                      </p>
                    </div>
                  </div>

                  {/* Troca rápida entre indicadores */}
                  <div
                    onPointerDown={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 bg-[#0a0a0a] border border-zinc-800/80 p-0.5 rounded-xl"
                  >
                    {items.map((tabItem) => {
                      const isCurrent = tabItem.id === activeIndicator.id;
                      return (
                        <button
                          key={tabItem.id}
                          type="button"
                          onClick={() => {
                            setEditingId(tabItem.id);
                            setDraftText(String(toDisplayValue(tabItem)));
                          }}
                          style={isCurrent ? { color: '#ffffff' } : undefined}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                            isCurrent
                              ? 'bg-[#F77F00]'
                              : 'text-zinc-500 hover:text-zinc-200'
                          }`}
                        >
                          {tabItem.type === 'water'
                            ? 'Água'
                            : tabItem.type === 'steps'
                            ? 'Passos'
                            : 'Peso'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Corpo minimalista de edição */}
              <div className="px-5 pt-2 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-5">
                {/* Controlo principal - / input / + */}
                <div className="flex items-center justify-between gap-3 bg-[#0a0a0a] border border-zinc-800/80 rounded-2xl p-3">
                  <button
                    type="button"
                    onClick={() => adjustDraft(-stepAmount)}
                    aria-label="Diminuir"
                    className="w-11 h-11 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:scale-95 border border-zinc-800 flex items-center justify-center text-zinc-200 transition-all cursor-pointer shrink-0"
                  >
                    <Minus className="w-4 h-4" strokeWidth={2.5} />
                  </button>

                  <div className="flex items-baseline justify-center gap-1.5 flex-1 min-w-0">
                    <input
                      type="text"
                      inputMode={activeIndicator.type === 'steps' ? 'numeric' : 'decimal'}
                      value={draftText}
                      onChange={(e) => {
                        const clean = e.target.value.replace(/[^0-9.,]/g, '');
                        setDraftText(clean);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave();
                      }}
                      aria-label={`Valor de ${activeIndicator.label}`}
                      className="w-28 bg-transparent text-center text-3xl font-bold text-white tabular-nums outline-none focus:text-[#F77F00] transition-colors"
                    />
                    <span className="text-xs font-bold text-zinc-400 uppercase shrink-0">
                      {activeIndicator.type === 'water'
                        ? 'L'
                        : activeIndicator.type === 'steps'
                        ? 'passos'
                        : isLbs
                        ? 'lbs'
                        : 'kg'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => adjustDraft(stepAmount)}
                    aria-label="Aumentar"
                    className="w-11 h-11 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:scale-95 border border-zinc-800 flex items-center justify-center text-[#F77F00] transition-all cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                </div>

                {/* Progresso ao vivo (Água & Passos) */}
                {draftProgress !== null && (
                  <div className="space-y-1.5 px-0.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400 font-medium">Progresso diário</span>
                      <span className="text-[#F77F00] font-bold tabular-nums">{draftProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#F77F00] rounded-full transition-all duration-300"
                        style={{ width: `${draftProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Atalhos rápidos */}
                <div className="flex items-center gap-2">
                  {quickAdjustments.map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => adjustDraft(chip.delta)}
                      className="flex-1 py-2.5 rounded-xl bg-[#0a0a0a] hover:bg-zinc-900 active:scale-95 border border-zinc-800/80 hover:border-[#F77F00]/50 text-xs font-semibold text-zinc-200 transition-all cursor-pointer tabular-nums"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                {/* Botão Guardar */}
                <button
                  type="button"
                  onClick={handleSave}
                  style={{ color: '#ffffff' }}
                  className="w-full py-3.5 rounded-2xl bg-[#F77F00] hover:bg-orange-600 active:scale-[0.99] font-bold text-sm shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>,
          portalTarget
        )
      : null;

  return (
    <section className="px-5 py-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500 fill-mode-both">
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-sm font-bold text-white">Meus indicadores</h2>
        <button
          type="button"
          onClick={() => items[0] && openEditor(items[0])}
          className="text-[11px] font-bold text-orange-500 hover:text-orange-400 transition-colors flex items-center gap-1 cursor-pointer"
        >
          Editar ›
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-2 pb-2">
        {items.map((ind) => {
          const progress = ind.targetValue 
            ? Math.min(100, Math.round((ind.currentValue / ind.targetValue) * 100)) 
            : null;

          return (
            <div 
              key={ind.id} 
              onClick={() => openEditor(ind)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openEditor(ind);
                }
              }}
              className="bg-[#0a0a0a] border border-zinc-800/60 hover:border-orange-500/40 active:scale-[0.98] rounded-[16px] p-2.5 flex flex-col justify-between transition-all cursor-pointer"
            >
              {/* TOP SECTION */}
              <div className={ind.type === 'weight' ? 'flex flex-col w-full mb-1' : 'flex gap-2 items-center mb-2'}>
                
                {/* ÁGUA & PASSOS */}
                {(ind.type === 'water' || ind.type === 'steps') && (
                  <>
                    <div className="relative w-[34px] h-[34px] flex items-center justify-center shrink-0">
                      <svg className="w-[34px] h-[34px] -rotate-90 absolute inset-0">
                        <circle cx="17" cy="17" r="14" fill="none" className="stroke-zinc-800/80" strokeWidth="2.5" />
                        <circle
                          cx="17"
                          cy="17"
                          r="14"
                          fill="none"
                          className="stroke-orange-500 transition-all duration-500"
                          strokeWidth="2.5"
                          strokeDasharray="87.9"
                          strokeDashoffset={87.9 - ((progress || 0) * 87.9) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
                      {ind.type === 'water' ? (
                        <Droplets className="w-3.5 h-3.5 text-orange-500 relative z-10" strokeWidth={2.5} />
                      ) : (
                        <Footprints className="w-3.5 h-3.5 text-orange-500 relative z-10" strokeWidth={2.5} />
                      )}
                    </div>
                    
                    <div className="flex flex-col justify-center min-w-0">
                      <span className="text-zinc-400 text-[8px] font-bold uppercase tracking-widest mb-0.5">{ind.label}</span>
                      <div className="flex items-baseline gap-0.5 leading-none mb-1">
                        <span className="text-lg font-normal text-white tracking-tight tabular-nums">{formatNumber(ind.currentValue)}</span>
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
                      <span className="text-lg font-normal text-white tracking-tight tabular-nums">
                        {isLbs ? (ind.currentValue * LBS_FACTOR).toFixed(1) : formatNumber(ind.currentValue)}
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
                        {ind.history ? (isLbs ? (ind.history * LBS_FACTOR).toFixed(1) : formatNumber(ind.history)) : 0} {isLbs ? 'lbs' : 'kg'}
                      </span>
                      <span className="text-zinc-500 text-[7px] font-medium tracking-tight">vs última semana</span>
                    </div>
                  </div>
                )}
              </div>

              {/* BOTTOM ACTION */}
              <div className="mt-auto pt-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditor(ind);
                  }}
                  className="w-full flex items-center justify-between bg-zinc-900/80 hover:bg-zinc-800 transition-colors rounded-[8px] p-1 pl-2 border border-zinc-800/80 group cursor-pointer"
                >
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

      {sheetPortal}
    </section>
  );
}
