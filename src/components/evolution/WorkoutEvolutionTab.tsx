import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  BarChart3,
  Calendar,
  Check,
  ChevronDown,
  ClipboardList,
  Sparkles,
  Trophy,
} from 'lucide-react';
import {
  WorkoutSessionLog,
  getTrackedWorkoutsEvolution,
} from '../../data/trainingEvolutionData';

type PeriodIntervalCount = 3 | 6 | 8 | 12;

interface WorkoutBarDatum {
  key: string;
  topLabel: string;
  bottomLabel: string;
  fullPeriodLabel: string;
  valueKg: number;
  sessionsCount: number;
  avgDurationMin: number;
  growthVsPrevPct: number | null;
}

const PERIOD_OPTIONS: { value: PeriodIntervalCount; shortLabel: string }[] = [
  { value: 3, shortLabel: '3M' },
  { value: 6, shortLabel: '6M' },
  { value: 8, shortLabel: '8M' },
  { value: 12, shortLabel: '12M' },
];

const MONTH_ABBR_PT = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

const MONTH_FULL_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const VIEW_W = 360;
const VIEW_H = 224;
const PAD_LEFT = 50;
const PAD_RIGHT = 12;
const PAD_TOP = 30;
const PAD_BOTTOM = 38;
const PLOT_W = VIEW_W - PAD_LEFT - PAD_RIGHT;
const PLOT_H = VIEW_H - PAD_TOP - PAD_BOTTOM;

function formatPtNumber(value: number, decimals = 1): string {
  return value.toLocaleString('pt-PT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatVolumeKg(value: number): string {
  return Math.round(value).toLocaleString('pt-PT');
}

function formatCompactKg(value: number): string {
  if (value >= 1000) {
    const k = value / 1000;
    const isExact = Math.abs(k - Math.round(k)) < 0.05;
    return `${formatPtNumber(k, isExact ? 0 : 1)}k`;
  }
  return formatVolumeKg(value);
}

function topRoundedBarPath(
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
): string {
  if (h <= 0.6) return '';
  const r = Math.min(radius, w / 2, h);
  return `M ${x.toFixed(2)} ${(y + h).toFixed(2)} L ${x.toFixed(2)} ${(y + r).toFixed(2)} Q ${x.toFixed(2)} ${y.toFixed(2)} ${(x + r).toFixed(2)} ${y.toFixed(2)} L ${(x + w - r).toFixed(2)} ${y.toFixed(2)} Q ${(x + w).toFixed(2)} ${y.toFixed(2)} ${(x + w).toFixed(2)} ${(y + r).toFixed(2)} L ${(x + w).toFixed(2)} ${(y + h).toFixed(2)} Z`;
}

function aggregateWorkoutSessions(
  sessions: WorkoutSessionLog[],
  intervalMonths: PeriodIntervalCount
): {
  bars: WorkoutBarDatum[];
  periodDisplayLabel: string;
  totalLiftedKg: number;
} {
  if (sessions.length === 0) {
    return {
      bars: [],
      periodDisplayLabel: `Últimos ${intervalMonths} meses`,
      totalLiftedKg: 0,
    };
  }

  const sorted = [...sessions].sort((a, b) => a.isoDate.localeCompare(b.isoDate));
  const lastDate = new Date(`${sorted[sorted.length - 1].isoDate}T12:00:00`);

  const startMonthDate = new Date(
    lastDate.getFullYear(),
    lastDate.getMonth() - (intervalMonths - 1),
    1
  );
  const startKey = `${startMonthDate.getFullYear()}-${String(
    startMonthDate.getMonth() + 1
  ).padStart(2, '0')}-01`;

  const filteredSessions = sorted.filter((s) => s.isoDate >= startKey);
  const totalLiftedKg = filteredSessions.reduce(
    (sum, s) => sum + Math.round(s.totalVolumeKg),
    0
  );

  // Agrupamento mensal (melhor sessão completa do mês)
  const monthMap = new Map<
    string,
    {
      year: number;
      monthIdx: number;
      maxVolumeKg: number;
      count: number;
      durationSum: number;
    }
  >();

  for (const s of filteredSessions) {
    const d = new Date(`${s.isoDate}T12:00:00`);
    const y = d.getFullYear();
    const m = d.getMonth();
    const key = `${y}-${String(m + 1).padStart(2, '0')}`;
    const existing = monthMap.get(key);
    if (existing) {
      existing.maxVolumeKg = Math.max(existing.maxVolumeKg, s.totalVolumeKg);
      existing.count += 1;
      existing.durationSum += s.durationMinutes;
    } else {
      monthMap.set(key, {
        year: y,
        monthIdx: m,
        maxVolumeKg: s.totalVolumeKg,
        count: 1,
        durationSum: s.durationMinutes,
      });
    }
  }

  const entries = Array.from(monthMap.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  const bars: WorkoutBarDatum[] = entries.map(([key, item], idx) => {
    const prev = idx > 0 ? entries[idx - 1][1].maxVolumeKg : null;
    const growthVsPrevPct =
      prev && prev > 0
        ? Math.round(((item.maxVolumeKg - prev) / prev) * 1000) / 10
        : null;

    return {
      key,
      topLabel: MONTH_ABBR_PT[item.monthIdx],
      bottomLabel: String(item.year).slice(-2),
      fullPeriodLabel: `${MONTH_FULL_PT[item.monthIdx]} ${item.year}`,
      valueKg: item.maxVolumeKg,
      sessionsCount: item.count,
      avgDurationMin: Math.round(item.durationSum / item.count),
      growthVsPrevPct,
    };
  });

  return {
    bars,
    periodDisplayLabel: `Últimos ${intervalMonths} meses`,
    totalLiftedKg,
  };
}

export function WorkoutEvolutionTab() {
  const workouts = useMemo(() => getTrackedWorkoutsEvolution(), []);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>(
    () => workouts[0]?.id || 'workout-gluteo-quads'
  );
  const [intervalCount, setIntervalCount] = useState<PeriodIntervalCount>(8);
  const [selectedBarKey, setSelectedBarKey] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [animProgress, setAnimProgress] = useState<number>(0);

  // Fechar dropdown ao clicar fora ou pressionar Escape
  useEffect(() => {
    if (!isDropdownOpen) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  const selectedWorkout = useMemo(
    () => workouts.find((w) => w.id === selectedWorkoutId) || workouts[0],
    [workouts, selectedWorkoutId]
  );

  const { bars, periodDisplayLabel, totalLiftedKg } = useMemo(() => {
    if (!selectedWorkout) {
      return {
        bars: [],
        periodDisplayLabel: 'Últimos 8 meses',
        totalLiftedKg: 0,
      };
    }
    return aggregateWorkoutSessions(selectedWorkout.sessions, intervalCount);
  }, [selectedWorkout, intervalCount]);

  // Identificar Recorde, Média e Melhor Barra do período
  const summaryStats = useMemo(() => {
    if (bars.length === 0) {
      return {
        recordKg: 0,
        avgKg: 0,
        bestBarKey: '',
        bestBarLabel: '',
        maxGrowthPct: 0,
        maxGrowthContext: '',
      };
    }

    let recordKg = -Infinity;
    let bestBarKey = bars[0].key;
    let bestBarLabel = bars[0].fullPeriodLabel;
    let sumKg = 0;

    let maxGrowthPct = -Infinity;
    let maxGrowthContext = '';

    bars.forEach((b, idx) => {
      sumKg += b.valueKg;
      if (b.valueKg >= recordKg) {
        recordKg = b.valueKg;
        bestBarKey = b.key;
        bestBarLabel = b.fullPeriodLabel;
      }
      if (b.growthVsPrevPct !== null && b.growthVsPrevPct > maxGrowthPct) {
        maxGrowthPct = b.growthVsPrevPct;
        const prevLabel = bars[idx - 1]?.topLabel || '';
        maxGrowthContext = prevLabel ? `${prevLabel} → ${b.topLabel}` : '';
      }
    });

    const avgKg = Math.round(sumKg / bars.length);

    if (!Number.isFinite(maxGrowthPct)) {
      maxGrowthPct = 0;
    }

    return {
      recordKg,
      avgKg,
      bestBarKey,
      bestBarLabel,
      maxGrowthPct,
      maxGrowthContext,
    };
  }, [bars]);

  // Calcular escala Y e geometria das barras
  const barChartGeometry = useMemo(() => {
    if (bars.length === 0) {
      return {
        yTicks: [] as { value: number; y: number }[],
        rects: [] as {
          bar: WorkoutBarDatum;
          x: number;
          y: number;
          w: number;
          h: number;
        }[],
        baselineY: PAD_TOP + PLOT_H,
      };
    }

    const values = bars.map((b) => b.valueKg);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const span = maxVal - minVal;

    const yMinRaw = Math.max(0, minVal - Math.max(400, span * 0.6));
    const stepBase = 500;
    const yMin = Math.floor(yMinRaw / stepBase) * stepBase;
    const yMaxRaw = maxVal + Math.max(300, span * 0.18);
    const yMax = Math.max(
      yMin + stepBase * 3,
      Math.ceil(yMaxRaw / stepBase) * stepBase
    );
    const ySpan = Math.max(1, yMax - yMin);

    const tickCount = 4;
    const yTicks = Array.from({ length: tickCount }, (_, i) => {
      const ratio = i / (tickCount - 1);
      const val = yMin + (1 - ratio) * ySpan;
      const y = PAD_TOP + ratio * PLOT_H;
      return {
        value: Math.round(val),
        y,
      };
    });

    const n = bars.length;
    const slotW = PLOT_W / n;
    const barW = Math.min(34, Math.max(12, slotW * 0.56));
    const baselineY = PAD_TOP + PLOT_H;

    const rects = bars.map((bar, idx) => {
      const norm = Math.max(0.06, (bar.valueKg - yMin) / ySpan);
      const h = Math.max(10, norm * PLOT_H);
      const x = PAD_LEFT + idx * slotW + (slotW - barW) / 2;
      const y = baselineY - h;
      return { bar, x, y, w: barW, h };
    });

    return { yTicks, rects, baselineY };
  }, [bars]);

  // Animação fluida das barras ao entrar na tab ou mudar filtro
  useEffect(() => {
    setSelectedBarKey(null);

    if (bars.length === 0) {
      setAnimProgress(1);
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setAnimProgress(1);
      return;
    }

    setAnimProgress(0);
    let rafId = 0;
    let startTs: number | null = null;
    const duration = 740;

    const tick = (now: number) => {
      if (startTs === null) startTs = now;
      const elapsed = now - startTs;
      const raw = Math.min(1, elapsed / duration);
      setAnimProgress(raw);
      if (raw < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [selectedWorkoutId, intervalCount, bars.length]);

  const activeBar = useMemo(() => {
    if (bars.length === 0) return null;
    if (selectedBarKey) {
      const found = bars.find((b) => b.key === selectedBarKey);
      if (found) return found;
    }
    return (
      bars.find((b) => b.key === summaryStats.bestBarKey) || bars[bars.length - 1]
    );
  }, [bars, selectedBarKey, summaryStats.bestBarKey]);

  if (!selectedWorkout) {
    return null;
  }

  const lowerWorkouts = workouts.filter((w) => w.category === 'Membros Inferiores');
  const upperWorkouts = workouts.filter((w) => w.category === 'Membros Superiores');
  const fullBodyWorkouts = workouts.filter((w) => w.category === 'Corpo Inteiro');

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 1. SELEÇÃO DO TREINO COMPLETO */}
      <section className="space-y-2.5">
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={isDropdownOpen}
            aria-label="Selecionar treino completo"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className={`w-full rounded-[20px] bg-[#0a0a0a] border p-3.5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
              isDropdownOpen
                ? 'border-[#F77F00]'
                : 'border-zinc-800/80 hover:border-[#F77F00]/60'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <ClipboardList className="w-[18px] h-[18px] text-[#F77F00] shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Treino completo
                </span>
                <p className="text-xs font-bold text-white truncate mt-0.5">
                  {selectedWorkout.shortName}
                </p>
                <p className="text-[11px] text-zinc-400 truncate">
                  {selectedWorkout.exercisesCount} exercícios · {selectedWorkout.muscleGroups}
                </p>
              </div>
            </div>

            <ChevronDown
              className={`w-4 h-4 text-[#F77F00] shrink-0 transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div
              role="listbox"
              aria-label="Lista de treinos completos"
              className="absolute left-0 right-0 top-full mt-2 z-50 rounded-[20px] bg-[#111111] border border-zinc-800 shadow-[0_18px_40px_rgba(0,0,0,0.65)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div
                className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#F77F00]/70 to-transparent"
                aria-hidden="true"
              />

              <div className="max-h-[300px] overflow-y-auto hide-scrollbar py-1.5">
                {[
                  { groupLabel: 'Membros Inferiores', items: lowerWorkouts },
                  { groupLabel: 'Membros Superiores', items: upperWorkouts },
                  { groupLabel: 'Corpo Inteiro', items: fullBodyWorkouts },
                ]
                  .filter((g) => g.items.length > 0)
                  .map((group, groupIdx) => (
                    <div
                      key={group.groupLabel}
                      className={
                        groupIdx > 0 ? 'mt-1 pt-1 border-t border-zinc-800/70' : ''
                      }
                    >
                      <span className="block px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#F77F00]">
                        {group.groupLabel}
                      </span>

                      {group.items.map((w) => {
                        const isActive = w.id === selectedWorkout.id;
                        return (
                          <button
                            key={w.id}
                            type="button"
                            role="option"
                            aria-selected={isActive}
                            onClick={() => {
                              setSelectedWorkoutId(w.id);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full min-h-[48px] px-4 py-2.5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                              isActive
                                ? 'bg-[#F77F00]/12'
                                : 'hover:bg-[#F77F00]/10 active:bg-[#F77F00]/15'
                            }`}
                          >
                            <div className="min-w-0">
                              <p
                                className={`text-xs font-bold truncate ${
                                  isActive ? 'text-[#F77F00]' : 'text-white'
                                }`}
                              >
                                {w.shortName}
                              </p>
                              <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                                {w.exercisesCount} exercícios · {w.muscleGroups}
                              </p>
                            </div>

                            {isActive && (
                              <Check className="w-4 h-4 text-[#F77F00] shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Atalhos rápidos por treino */}
        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-0.5">
          {workouts.map((w) => {
            const isSelected = w.id === selectedWorkout.id;
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => setSelectedWorkoutId(w.id)}
                style={isSelected ? { color: '#ffffff' } : undefined}
                className={`min-h-[34px] px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 transition-all cursor-pointer whitespace-nowrap border ${
                  isSelected
                    ? 'bg-[#F77F00] border-[#F77F00] shadow-sm shadow-orange-500/20'
                    : 'bg-[#0a0a0a] border-zinc-800/80 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                {w.shortName}
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. RESUMO DE DESEMPENHO (RECORDE & MÉDIA DE VOLUME DO TREINO) */}
      <section className="grid grid-cols-2 gap-2.5">
        <div className="rounded-[20px] bg-[#0a0a0a] border border-zinc-800/80 p-3.5 relative overflow-hidden">
          <div
            className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#F77F00]/60 to-transparent"
            aria-hidden="true"
          />
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400">
            <Trophy className="w-3.5 h-3.5 text-[#F77F00] shrink-0" />
            <span>Recorde</span>
          </div>
          <p className="text-2xl font-black text-white tracking-tight tabular-nums leading-tight mt-1.5">
            {formatVolumeKg(summaryStats.recordKg)}
            <span className="text-xs font-semibold text-zinc-400 ml-1">kg</span>
          </p>
          <span className="text-[11px] text-[#F77F00] font-medium block mt-0.5 truncate">
            {summaryStats.bestBarLabel || 'Sem registo'}
          </span>
        </div>

        <div className="rounded-[20px] bg-[#0a0a0a] border border-zinc-800/80 p-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400">
            <Activity className="w-3.5 h-3.5 text-[#F77F00] shrink-0" />
            <span>Média</span>
          </div>
          <p className="text-2xl font-black text-white tracking-tight tabular-nums leading-tight mt-1.5">
            {formatVolumeKg(summaryStats.avgKg)}
            <span className="text-xs font-semibold text-zinc-400 ml-1">kg</span>
          </p>
          <span className="text-[11px] text-zinc-400 block mt-0.5 truncate">
            {periodDisplayLabel}
          </span>
        </div>
      </section>

      {/* 3. GRÁFICO DE EVOLUÇÃO DO TREINO COMPLETO (BARRAS ANIMADAS) */}
      <section className="rounded-[22px] bg-[#0a0a0a] border border-zinc-800/80 p-4 space-y-3">
        {/* Leitura rápida da barra destacada */}
        {activeBar && (
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-zinc-800/70">
            <div className="flex items-center gap-2 min-w-0">
              <BarChart3 className="w-4 h-4 text-[#F77F00] shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white tabular-nums">
                    {formatVolumeKg(activeBar.valueKg)} kg
                  </span>
                  <span className="text-[11px] text-zinc-400 truncate">
                    · {activeBar.fullPeriodLabel}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 tabular-nums">
                  {activeBar.key === summaryStats.bestBarKey
                    ? `Melhor treino do período · ~${activeBar.avgDurationMin} min`
                    : `${activeBar.sessionsCount} ${
                        activeBar.sessionsCount === 1 ? 'treino' : 'treinos'
                      } · ~${activeBar.avgDurationMin} min`}
                </p>
              </div>
            </div>

            {activeBar.growthVsPrevPct !== null && (
              <span
                className={`text-[11px] font-bold tabular-nums shrink-0 ${
                  activeBar.growthVsPrevPct > 0
                    ? 'text-emerald-400'
                    : activeBar.growthVsPrevPct < 0
                      ? 'text-[#F77F00]'
                      : 'text-zinc-400'
                }`}
              >
                {activeBar.growthVsPrevPct > 0 ? '+' : ''}
                {formatPtNumber(activeBar.growthVsPrevPct, 1)}% vs ant.
              </span>
            )}
          </div>
        )}

        {/* SVG Bar Chart */}
        <div className="w-full">
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="w-full h-auto block select-none overflow-visible"
            role="img"
            aria-label={`Gráfico de barras da evolução de volume do treino ${selectedWorkout.shortName}`}
          >
            <defs>
              <linearGradient id="workout-bar-best-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF9A2E" />
                <stop offset="100%" stopColor="#F77F00" />
              </linearGradient>
              <linearGradient id="workout-bar-std-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F77F00" stopOpacity="0.52" />
                <stop offset="100%" stopColor="#F77F00" stopOpacity="0.18" />
              </linearGradient>
            </defs>

            {/* Eixo Vertical (kg) e grelha horizontal */}
            {barChartGeometry.yTicks.map((tick, idx) => (
              <g key={idx}>
                <line
                  x1={PAD_LEFT}
                  y1={tick.y}
                  x2={VIEW_W - PAD_RIGHT}
                  y2={tick.y}
                  stroke="currentColor"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                  className="text-zinc-800"
                />
                <text
                  x={PAD_LEFT - 7}
                  y={tick.y + 3.5}
                  textAnchor="end"
                  fill="currentColor"
                  className="text-zinc-400 text-[9.5px] font-medium tabular-nums"
                >
                  {formatCompactKg(tick.value)}
                </text>
              </g>
            ))}

            {/* Linha base do eixo horizontal */}
            <line
              x1={PAD_LEFT}
              y1={barChartGeometry.baselineY}
              x2={VIEW_W - PAD_RIGHT}
              y2={barChartGeometry.baselineY}
              stroke="currentColor"
              strokeWidth="1"
              className="text-zinc-800"
            />

            {/* Barras animadas */}
            {barChartGeometry.rects.map((item, idx) => {
              const totalBars = barChartGeometry.rects.length;
              const staggerDelay = totalBars > 1 ? (idx / (totalBars - 1)) * 0.35 : 0;
              const localRaw = Math.max(
                0,
                Math.min(1, (animProgress - staggerDelay) / (1 - staggerDelay))
              );
              const eased = 1 - Math.pow(1 - localRaw, 3);

              const currentH = item.h * eased;
              const currentY = barChartGeometry.baselineY - currentH;
              const isBest = item.bar.key === summaryStats.bestBarKey;
              const isSelected = activeBar?.key === item.bar.key;
              const showValue = localRaw > 0.65;
              const valueOpacity = showValue
                ? Math.min(1, (localRaw - 0.65) / 0.35)
                : 0;
              const bestHighlightOpacity =
                isBest && localRaw > 0.8
                  ? Math.min(1, (localRaw - 0.8) / 0.2)
                  : 0;

              const barPath = topRoundedBarPath(
                item.x,
                currentY,
                item.w,
                currentH,
                Math.min(6, item.w / 2.2)
              );

              const centerX = item.x + item.w / 2;

              return (
                <g key={item.bar.key}>
                  {/* Halo de destaque atrás da melhor barra */}
                  {isBest && bestHighlightOpacity > 0 && (
                    <path
                      d={topRoundedBarPath(
                        item.x - 2,
                        currentY - 2,
                        item.w + 4,
                        currentH + 2,
                        7
                      )}
                      fill="none"
                      stroke="#F77F00"
                      strokeOpacity={0.45 * bestHighlightOpacity}
                      strokeWidth="1.5"
                    />
                  )}

                  {/* Barra principal */}
                  {barPath && (
                    <path
                      d={barPath}
                      fill={
                        isBest || isSelected
                          ? 'url(#workout-bar-best-grad)'
                          : 'url(#workout-bar-std-grad)'
                      }
                    />
                  )}

                  {/* Marca visual discreta no topo da melhor barra */}
                  {isBest && bestHighlightOpacity > 0 && (
                    <circle
                      cx={centerX}
                      cy={currentY - 19}
                      r={2.5}
                      fill="#F77F00"
                      fillOpacity={bestHighlightOpacity}
                    />
                  )}

                  {/* Valor do volume acima da barra */}
                  <text
                    x={centerX}
                    y={currentY - 6}
                    textAnchor="middle"
                    fill={isBest || isSelected ? '#F77F00' : 'currentColor'}
                    fillOpacity={valueOpacity}
                    className={`tabular-nums ${
                      isBest || isSelected
                        ? 'text-[9px] font-extrabold'
                        : 'text-zinc-300 text-[8px] font-semibold'
                    }`}
                  >
                    {formatCompactKg(item.bar.valueKg)}
                  </text>

                  {/* Eixo horizontal: mês e ano */}
                  <text
                    x={centerX}
                    y={barChartGeometry.baselineY + 13}
                    textAnchor="middle"
                    fill={isSelected ? '#F77F00' : 'currentColor'}
                    className={`text-[8.5px] tabular-nums ${
                      isSelected ? 'font-bold' : 'text-zinc-400 font-medium'
                    }`}
                  >
                    {item.bar.topLabel}
                  </text>
                  <text
                    x={centerX}
                    y={barChartGeometry.baselineY + 23}
                    textAnchor="middle"
                    fill={isSelected ? '#F77F00' : 'currentColor'}
                    className={`text-[7.5px] tabular-nums ${
                      isSelected ? 'font-bold' : 'text-zinc-500 font-medium'
                    }`}
                  >
                    {item.bar.bottomLabel}
                  </text>

                  {/* Área clicável confortável em mobile */}
                  <rect
                    x={item.x - 4}
                    y={PAD_TOP}
                    width={item.w + 8}
                    height={PLOT_H + 26}
                    fill="transparent"
                    className="cursor-pointer"
                    onClick={() => setSelectedBarKey(item.bar.key)}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </section>

      {/* 4. PERÍODO DE ANÁLISE */}
      <section className="rounded-[22px] bg-[#0a0a0a] border border-zinc-800/80 p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#F77F00] shrink-0" />
            <span className="text-xs font-semibold text-zinc-400">
              Período selecionado
            </span>
          </div>
          <span className="text-xs font-bold text-white">
            {periodDisplayLabel}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {PERIOD_OPTIONS.map((opt) => {
            const isSelected = intervalCount === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setIntervalCount(opt.value)}
                style={isSelected ? { color: '#ffffff' } : undefined}
                className={`min-h-[36px] py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#F77F00] border-[#F77F00]'
                    : 'bg-zinc-950/60 border-zinc-800/80 text-zinc-400 hover:text-white'
                }`}
              >
                {opt.shortLabel}
              </button>
            );
          })}
        </div>
      </section>

      {/* 5. INDICADORES COMPLEMENTARES */}
      <section className="grid grid-cols-3 rounded-[22px] bg-[#0a0a0a] border border-zinc-800/80 divide-x divide-zinc-800/70 overflow-hidden">
        <div className="p-3.5 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block leading-tight">
            Volume Total
          </span>
          <span className="text-sm font-bold text-white tabular-nums mt-1.5 block">
            {formatCompactKg(totalLiftedKg)} kg
          </span>
        </div>

        <div className="p-3.5 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block leading-tight">
            Maior Evolução
          </span>
          <span className="text-sm font-bold text-emerald-400 tabular-nums mt-1.5 block">
            {summaryStats.maxGrowthPct > 0 ? '+' : ''}
            {formatPtNumber(summaryStats.maxGrowthPct, 1)}%
          </span>
          {summaryStats.maxGrowthContext && (
            <span className="text-[9.5px] text-zinc-500 block mt-0.5 truncate">
              {summaryStats.maxGrowthContext}
            </span>
          )}
        </div>

        <div className="p-3.5 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block leading-tight">
            Treino Atual
          </span>
          <span className="text-sm font-bold text-[#F77F00] mt-1.5 block truncate">
            {selectedWorkout.shortName}
          </span>
          <span className="text-[9.5px] text-zinc-500 block mt-0.5 truncate">
            {selectedWorkout.exercisesCount} exercícios · ~{selectedWorkout.avgDurationMin}m
          </span>
        </div>
      </section>

      {/* 6. MENSAGEM INFORMATIVA */}
      <section className="rounded-[20px] bg-[#0a0a0a] border border-zinc-800/80 p-4 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-[#F77F00] shrink-0 mt-0.5" />
        <p className="text-xs text-zinc-300 leading-relaxed">
          O volume total de cada treino reflete a soma de todas as séries e cargas realizadas. Evolui com consistência sessão após sessão.
        </p>
      </section>
    </div>
  );
}
