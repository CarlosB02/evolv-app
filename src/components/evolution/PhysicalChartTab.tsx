import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Minus,
  Ruler,
  Scale,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { AssessmentSubmission } from '../../types';

type ChartMetricId = 'weight' | 'cintura' | 'quadril';

interface ChartMetricConfig {
  id: ChartMetricId;
  label: string;
  tableHeader: string;
  unit: string;
  decimals: number;
  Icon: React.ComponentType<{ className?: string }>;
  getValue: (assessment: AssessmentSubmission) => number | undefined;
}

const CHART_METRICS: ChartMetricConfig[] = [
  {
    id: 'weight',
    label: 'Peso (kg)',
    tableHeader: 'PESO',
    unit: 'kg',
    decimals: 1,
    Icon: Scale,
    getValue: (a) => a.weight,
  },
  {
    id: 'cintura',
    label: 'Cintura (cm)',
    tableHeader: 'CINTURA',
    unit: 'cm',
    decimals: 1,
    Icon: Ruler,
    getValue: (a) => a.measurements?.cintura,
  },
  {
    id: 'quadril',
    label: 'Anca (cm)',
    tableHeader: 'ANCA',
    unit: 'cm',
    decimals: 1,
    Icon: Activity,
    getValue: (a) => a.measurements?.quadril,
  },
];

interface ChartPoint {
  assessment: AssessmentSubmission;
  value: number;
  diffPrev: number | null;
  axisDate: string;
  fullShortDate: string;
  x: number;
  y: number;
  distanceAlongLine: number;
}

const VIEW_W = 360;
const VIEW_H = 212;
const PAD_LEFT = 58;
const PAD_RIGHT = 22;
const PAD_TOP = 28;
const PAD_BOTTOM = 34;
const PLOT_W = VIEW_W - PAD_LEFT - PAD_RIGHT;
const PLOT_H = VIEW_H - PAD_TOP - PAD_BOTTOM;

function parseTimestamp(assessment: AssessmentSubmission): number {
  if (assessment.isoDate) {
    const t = new Date(`${assessment.isoDate}T12:00:00`).getTime();
    if (!Number.isNaN(t)) return t;
  }
  return 0;
}

function formatPtNumber(value: number, decimals = 1): string {
  return value.toLocaleString('pt-PT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatSignedValue(diff: number, unit: string, decimals = 1): string {
  if (Math.abs(diff) < 0.05) {
    return `${formatPtNumber(0, decimals)} ${unit}`;
  }
  const sign = diff > 0 ? '+' : '-';
  return `${sign}${formatPtNumber(Math.abs(diff), decimals)} ${unit}`;
}

function formatAxisDate(assessment: AssessmentSubmission): string {
  if (assessment.isoDate) {
    const d = new Date(`${assessment.isoDate}T12:00:00`);
    if (!Number.isNaN(d.getTime())) {
      const day = d.getDate();
      const month = d
        .toLocaleDateString('pt-PT', { month: 'short' })
        .replace('.', '');
      const capMonth = month.charAt(0).toUpperCase() + month.slice(1);
      const yr = String(d.getFullYear()).slice(-2);
      return `${day} ${capMonth} ${yr}`;
    }
  }
  return assessment.date;
}

function formatFullShortDate(assessment: AssessmentSubmission): string {
  if (assessment.isoDate) {
    const d = new Date(`${assessment.isoDate}T12:00:00`);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString('pt-PT', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
  }
  return assessment.date;
}

export function PhysicalChartTab() {
  const { assessmentSubmissions } = useProfile();
  const [selectedMetricId, setSelectedMetricId] = useState<ChartMetricId>('weight');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);

  // Estado da animação progressiva do gráfico (executa sempre que entra na tab ou muda o indicador)
  const [revealedCount, setRevealedCount] = useState<number>(0);
  const [animationDone, setAnimationDone] = useState<boolean>(false);

  const linePathRef = useRef<SVGPathElement>(null);
  const chartSectionRef = useRef<HTMLElement>(null);

  const metric = useMemo(
    () => CHART_METRICS.find((m) => m.id === selectedMetricId) || CHART_METRICS[0],
    [selectedMetricId]
  );

  // Ordenar avaliações cronologicamente (mais antiga -> mais recente) para o gráfico
  const chronologicalRecords = useMemo(() => {
    const sorted = [...assessmentSubmissions].sort(
      (a, b) => parseTimestamp(a) - parseTimestamp(b)
    );
    const valid = sorted
      .map((assessment) => {
        const val = metric.getValue(assessment);
        if (val === undefined || Number.isNaN(val)) return null;
        return { assessment, value: val };
      })
      .filter((item): item is { assessment: AssessmentSubmission; value: number } => item !== null);

    return valid.map((item, idx) => {
      const prev = idx > 0 ? valid[idx - 1].value : null;
      const diffPrev =
        prev !== null ? Math.round((item.value - prev) * 10) / 10 : null;
      return {
        ...item,
        diffPrev,
        axisDate: formatAxisDate(item.assessment),
        fullShortDate: formatFullShortDate(item.assessment),
      };
    });
  }, [assessmentSubmissions, metric]);

  // Calcular escala Y, ticks e coordenadas SVG dos pontos
  const chartGeometry = useMemo(() => {
    if (chronologicalRecords.length === 0) {
      return {
        points: [] as ChartPoint[],
        yTicks: [] as { value: number; y: number }[],
        lineD: '',
        areaD: '',
        totalLength: 0,
      };
    }

    const values = chronologicalRecords.map((r) => r.value);
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const rawSpan = rawMax - rawMin;

    const padding = rawSpan < 0.4 ? 1.5 : Math.max(0.5, rawSpan * 0.22);
    const yMin = Math.floor((rawMin - padding) * 2) / 2;
    const yMax = Math.ceil((rawMax + padding) * 2) / 2;
    const ySpan = Math.max(1, yMax - yMin);

    const tickCount = 4;
    const yTicks = Array.from({ length: tickCount }, (_, i) => {
      const ratio = i / (tickCount - 1);
      const val = yMin + (1 - ratio) * ySpan;
      const y = PAD_TOP + ratio * PLOT_H;
      return {
        value: Math.round(val * 10) / 10,
        y,
      };
    });

    const n = chronologicalRecords.length;
    const rawPoints = chronologicalRecords.map((rec, idx) => {
      const x =
        n === 1
          ? PAD_LEFT + PLOT_W / 2
          : PAD_LEFT + (idx / (n - 1)) * PLOT_W;
      const normY = (rec.value - yMin) / ySpan;
      const y = PAD_TOP + (1 - normY) * PLOT_H;
      return {
        ...rec,
        x,
        y,
        distanceAlongLine: 0,
      };
    });

    let cumulative = 0;
    for (let i = 0; i < rawPoints.length; i += 1) {
      if (i > 0) {
        const dx = rawPoints[i].x - rawPoints[i - 1].x;
        const dy = rawPoints[i].y - rawPoints[i - 1].y;
        cumulative += Math.hypot(dx, dy);
      }
      rawPoints[i].distanceAlongLine = cumulative;
    }

    const lineD = rawPoints
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
      .join(' ');

    const baselineY = PAD_TOP + PLOT_H;
    const areaD =
      rawPoints.length > 1
        ? `${lineD} L ${rawPoints[rawPoints.length - 1].x.toFixed(2)} ${baselineY} L ${rawPoints[0].x.toFixed(2)} ${baselineY} Z`
        : '';

    return {
      points: rawPoints,
      yTicks,
      lineD,
      areaD,
      totalLength: cumulative,
    };
  }, [chronologicalRecords]);

  // Executar animação de desenho progressivo ao montar a tab ou trocar de indicador
  useEffect(() => {
    const pts = chartGeometry.points;
    const totalLen = chartGeometry.totalLength;

    if (pts.length === 0) {
      setRevealedCount(0);
      setAnimationDone(true);
      return;
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || pts.length === 1 || totalLen <= 0) {
      if (linePathRef.current) {
        linePathRef.current.style.strokeDasharray = `${Math.max(1, totalLen)}`;
        linePathRef.current.style.strokeDashoffset = '0';
      }
      setRevealedCount(pts.length);
      setAnimationDone(true);
      return;
    }

    setRevealedCount(1);
    setAnimationDone(false);

    const pathEl = linePathRef.current;
    if (pathEl) {
      pathEl.style.strokeDasharray = `${totalLen}`;
      pathEl.style.strokeDashoffset = `${totalLen}`;
    }

    let rafId = 0;
    let startTime: number | null = null;
    const duration = 760;

    const tick = (now: number) => {
      if (startTime === null) startTime = now;
      const elapsed = now - startTime;
      const rawProgress = Math.min(1, elapsed / duration);
      // Curva suave easeOutCubic para entrada fluida e rápida
      const eased = 1 - Math.pow(1 - rawProgress, 3);
      const currentLength = eased * totalLen;

      if (linePathRef.current) {
        linePathRef.current.style.strokeDashoffset = `${Math.max(0, totalLen - currentLength)}`;
      }

      let nextRevealed = 1;
      for (let i = 1; i < pts.length; i += 1) {
        if (currentLength >= pts[i].distanceAlongLine - 2) {
          nextRevealed = i + 1;
        }
      }
      setRevealedCount((prev) => (nextRevealed > prev ? nextRevealed : prev));

      if (rawProgress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        if (linePathRef.current) {
          linePathRef.current.style.strokeDashoffset = '0';
        }
        setRevealedCount(pts.length);
        setAnimationDone(true);
      }
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [chartGeometry]);

  // Registos organizados do mais recente para o mais antigo para o histórico
  const newestFirstRecords = useMemo(
    () => [...chartGeometry.points].reverse(),
    [chartGeometry.points]
  );

  const firstPoint = chartGeometry.points[0] || null;
  const latestPoint = chartGeometry.points[chartGeometry.points.length - 1] || null;

  const activePoint = useMemo(() => {
    if (!latestPoint) return null;
    if (selectedAssessmentId) {
      const found = chartGeometry.points.find(
        (p) => p.assessment.id === selectedAssessmentId
      );
      if (found) return found;
    }
    return latestPoint;
  }, [chartGeometry.points, latestPoint, selectedAssessmentId]);

  const handleSelectPoint = (id: string, scrollIntoChart = false) => {
    setSelectedAssessmentId(id);
    if (scrollIntoChart) {
      chartSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  };

  // Resumo da evolução (INÍCIO, ATUAL, VARIAÇÃO + %)
  const totalDiff =
    firstPoint && latestPoint
      ? Math.round((latestPoint.value - firstPoint.value) * 10) / 10
      : null;
  const totalPercent =
    firstPoint && latestPoint && firstPoint.value > 0
      ? Math.round(((latestPoint.value - firstPoint.value) / firstPoint.value) * 1000) / 10
      : null;

  // Índices das datas a mostrar no eixo X para evitar sobreposição em ecrãs móveis
  const visibleXLabelIndices = useMemo(() => {
    const n = chartGeometry.points.length;
    if (n <= 5) {
      return new Set(chartGeometry.points.map((_, idx) => idx));
    }
    const indices = new Set<number>([0, n - 1]);
    const step = Math.ceil((n - 1) / 3);
    for (let i = step; i < n - 1; i += step) {
      indices.add(i);
    }
    return indices;
  }, [chartGeometry.points]);

  if (chartGeometry.points.length === 0) {
    return (
      <div className="rounded-[22px] bg-[#0a0a0a] border border-zinc-800/80 p-8 text-center">
        <BarChart3 className="w-7 h-7 text-zinc-600 mx-auto mb-2" />
        <p className="text-sm font-semibold text-white">
          Sem dados disponíveis para este indicador
        </p>
      </div>
    );
  }

  const latestDiff = latestPoint?.diffPrev ?? null;
  const isLatestDown = latestDiff !== null && latestDiff < -0.05;
  const isLatestUp = latestDiff !== null && latestDiff > 0.05;
  const isTotalDown = totalDiff !== null && totalDiff < -0.05;
  const isTotalUp = totalDiff !== null && totalDiff > 0.05;
  const isInspectingOlder =
    activePoint && latestPoint && activePoint.assessment.id !== latestPoint.assessment.id;

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 1. SELEÇÃO DOS INDICADORES */}
      <div className="grid grid-cols-3 p-1 rounded-2xl bg-[#0a0a0a] border border-zinc-800/80">
        {CHART_METRICS.map((opt) => {
          const isSelected = opt.id === selectedMetricId;
          const IconComp = opt.Icon;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelectedMetricId(opt.id)}
              style={isSelected ? { color: '#ffffff' } : undefined}
              className={`min-h-[40px] py-2 px-1.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'bg-[#F77F00] shadow-md shadow-orange-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <IconComp className="w-3.5 h-3.5 shrink-0" />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. INDICADOR ATUAL */}
      {latestPoint && (
        <section className="rounded-[22px] bg-[#0a0a0a] border border-zinc-800/80 p-4.5 relative overflow-hidden">
          <div
            className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#F77F00]/60 to-transparent"
            aria-hidden="true"
          />

          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#F77F00] shrink-0">
                ATUAL
              </span>
              <span className="text-xs text-zinc-400 truncate">
                {latestPoint.assessment.date}
              </span>
            </div>

            {latestDiff !== null && (
              <div
                className={`inline-flex items-center gap-1 text-xs font-semibold shrink-0 ${
                  isLatestDown
                    ? 'text-emerald-400'
                    : isLatestUp
                      ? 'text-[#F77F00]'
                      : 'text-zinc-400'
                }`}
              >
                {isLatestDown ? (
                  <TrendingDown className="w-3.5 h-3.5" />
                ) : isLatestUp ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <Minus className="w-3.5 h-3.5" />
                )}
                <span>
                  {isLatestDown
                    ? 'Redução'
                    : isLatestUp
                      ? 'Aumento'
                      : 'Estável'}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <p className="text-[30px] font-black text-white tracking-tight tabular-nums leading-none">
              {formatPtNumber(latestPoint.value, metric.decimals)}
              <span className="text-sm font-semibold text-zinc-400 ml-1">
                {metric.unit}
              </span>
            </p>

            {latestDiff !== null ? (
              <span
                className={`text-xs font-bold tabular-nums ${
                  isLatestDown
                    ? 'text-emerald-400'
                    : isLatestUp
                      ? 'text-[#F77F00]'
                      : 'text-zinc-400'
                }`}
              >
                {formatSignedValue(latestDiff, metric.unit, metric.decimals)} vs
                anterior
              </span>
            ) : (
              <span className="text-xs text-zinc-500">Registo inicial</span>
            )}
          </div>
        </section>
      )}

      {/* 3. GRÁFICO DE EVOLUÇÃO */}
      <section
        ref={chartSectionRef}
        className="rounded-[22px] bg-[#0a0a0a] border border-zinc-800/80 p-4 space-y-3"
      >
        {/* Barra de consulta do ponto selecionado */}
        {activePoint && (
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-zinc-800/70">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#F77F00] shrink-0" />
                <span className="text-xs font-bold text-white tabular-nums">
                  {formatPtNumber(activePoint.value, metric.decimals)}{' '}
                  {metric.unit}
                </span>
                <span className="text-[11px] text-zinc-400 truncate">
                  · {activePoint.fullShortDate}
                </span>
              </div>
              {activePoint.diffPrev !== null && (
                <p className="text-[11px] text-zinc-400 pl-4 mt-0.5 tabular-nums">
                  Variação vs anterior:{' '}
                  <span
                    className={`font-semibold ${
                      activePoint.diffPrev < -0.05
                        ? 'text-emerald-400'
                        : activePoint.diffPrev > 0.05
                          ? 'text-[#F77F00]'
                          : 'text-zinc-300'
                    }`}
                  >
                    {formatSignedValue(
                      activePoint.diffPrev,
                      metric.unit,
                      metric.decimals
                    )}
                  </span>
                </p>
              )}
            </div>

            {isInspectingOlder && latestPoint && (
              <button
                type="button"
                onClick={() => setSelectedAssessmentId(latestPoint.assessment.id)}
                className="text-[11px] font-semibold text-[#F77F00] hover:underline shrink-0 cursor-pointer"
              >
                Ver atual
              </button>
            )}
          </div>
        )}

        {/* SVG Line Chart */}
        <div className="w-full">
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="w-full h-auto block select-none overflow-visible"
            role="img"
            aria-label={`Gráfico de evolução de ${metric.label}`}
          >
            <defs>
              <linearGradient
                id={`evol-area-${metric.id}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="#F77F00" stopOpacity="0.24" />
                <stop offset="100%" stopColor="#F77F00" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grelha horizontal e eixo vertical (valores + unidades) */}
            {chartGeometry.yTicks.map((tick, idx) => (
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
                  x={PAD_LEFT - 8}
                  y={tick.y + 3.5}
                  textAnchor="end"
                  fill="currentColor"
                  className="text-zinc-400 text-[10px] font-medium tabular-nums"
                >
                  {formatPtNumber(tick.value, metric.decimals)} {metric.unit}
                </text>
              </g>
            ))}

            {/* Área preenchida suave sob a linha */}
            {chartGeometry.areaD && (
              <path
                d={chartGeometry.areaD}
                fill={`url(#evol-area-${metric.id})`}
                style={{
                  opacity: animationDone ? 1 : 0,
                  transition: 'opacity 320ms ease-out',
                }}
              />
            )}

            {/* Guia vertical discreta no ponto selecionado */}
            {activePoint && animationDone && (
              <line
                x1={activePoint.x}
                y1={activePoint.y}
                x2={activePoint.x}
                y2={PAD_TOP + PLOT_H}
                stroke="#F77F00"
                strokeOpacity="0.35"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
            )}

            {/* Linha de evolução com desenho progressivo */}
            {chartGeometry.lineD && chartGeometry.points.length > 1 && (
              <path
                ref={linePathRef}
                d={chartGeometry.lineD}
                fill="none"
                stroke="#F77F00"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Pontos individuais + destaque do mais recente e do selecionado */}
            {chartGeometry.points.map((pt, idx) => {
              const isVisible = idx < revealedCount;
              const isLatest = idx === chartGeometry.points.length - 1;
              const isActive =
                activePoint?.assessment.id === pt.assessment.id;
              const showLatestPulse = isLatest && animationDone;

              const labelX = Math.max(
                PAD_LEFT + 28,
                Math.min(VIEW_W - PAD_RIGHT - 28, pt.x)
              );
              const labelAbove = pt.y - 14 >= 12;
              const labelY = labelAbove ? pt.y - 13 : pt.y + 20;

              return (
                <g key={pt.assessment.id}>
                  {/* Anel de destaque do registo mais recente ao terminar o desenho */}
                  {showLatestPulse && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={10.5}
                      fill="#F77F00"
                      fillOpacity="0.16"
                      stroke="#F77F00"
                      strokeOpacity="0.45"
                      strokeWidth="1"
                      className="transition-all duration-300"
                    />
                  )}

                  {/* Anel externo quando o ponto está selecionado */}
                  {isActive && isVisible && !showLatestPulse && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={9.5}
                      fill="#F77F00"
                      fillOpacity="0.15"
                      stroke="#F77F00"
                      strokeWidth="1.25"
                    />
                  )}

                  {/* Ponto principal */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isActive || isLatest ? 5 : 4}
                    fill={isActive || isLatest ? '#F77F00' : '#ffffff'}
                    stroke="#F77F00"
                    strokeWidth={isActive || isLatest ? 2 : 2}
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? 'scale(1)' : 'scale(0.3)',
                      transformOrigin: `${pt.x}px ${pt.y}px`,
                      transition:
                        'opacity 200ms ease-out, transform 240ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                  />

                  {/* Etiqueta com valor junto ao ponto selecionado */}
                  {isActive && animationDone && (
                    <g pointerEvents="none">
                      <rect
                        x={labelX - 27}
                        y={labelY - 10}
                        width={54}
                        height={16}
                        rx={6}
                        fill="#F77F00"
                      />
                      <text
                        x={labelX}
                        y={labelY + 1.5}
                        textAnchor="middle"
                        fill="#ffffff"
                        className="text-[9.5px] font-bold tabular-nums"
                      >
                        {formatPtNumber(pt.value, metric.decimals)} {metric.unit}
                      </text>
                    </g>
                  )}

                  {/* Datas no eixo horizontal */}
                  {visibleXLabelIndices.has(idx) && (
                    <text
                      x={pt.x}
                      y={VIEW_H - 10}
                      textAnchor={
                        chartGeometry.points.length > 1 && idx === 0
                          ? 'start'
                          : chartGeometry.points.length > 1 &&
                              idx === chartGeometry.points.length - 1
                            ? 'end'
                            : 'middle'
                      }
                      fill="currentColor"
                      className={`text-[9.5px] tabular-nums ${
                        isActive
                          ? 'text-[#F77F00] font-bold'
                          : 'text-zinc-400 font-medium'
                      }`}
                    >
                      {pt.axisDate}
                    </text>
                  )}

                  {/* Área clicável generosa para toque em mobile */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={18}
                    fill="transparent"
                    className="cursor-pointer"
                    onClick={() => handleSelectPoint(pt.assessment.id)}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </section>

      {/* 4. RESUMO DA EVOLUÇÃO */}
      <section className="grid grid-cols-3 rounded-[22px] bg-[#0a0a0a] border border-zinc-800/80 divide-x divide-zinc-800/70 overflow-hidden">
        <div className="p-3.5 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
            INÍCIO
          </span>
          <span className="text-sm font-bold text-white tabular-nums mt-1 block">
            {firstPoint
              ? `${formatPtNumber(firstPoint.value, metric.decimals)} ${metric.unit}`
              : '—'}
          </span>
        </div>

        <div className="p-3.5 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#F77F00] block">
            ATUAL
          </span>
          <span className="text-sm font-bold text-white tabular-nums mt-1 block">
            {latestPoint
              ? `${formatPtNumber(latestPoint.value, metric.decimals)} ${metric.unit}`
              : '—'}
          </span>
        </div>

        <div className="p-3.5 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
            VARIAÇÃO
          </span>
          <span
            className={`text-sm font-bold tabular-nums mt-1 block ${
              isTotalDown
                ? 'text-emerald-400'
                : isTotalUp
                  ? 'text-[#F77F00]'
                  : 'text-white'
            }`}
          >
            {totalDiff !== null
              ? formatSignedValue(totalDiff, metric.unit, metric.decimals)
              : '—'}
          </span>
          {totalPercent !== null && Math.abs(totalPercent) >= 0.05 && (
            <span
              className={`text-[10px] font-semibold tabular-nums block ${
                isTotalDown
                  ? 'text-emerald-400/90'
                  : isTotalUp
                    ? 'text-[#F77F00]/90'
                    : 'text-zinc-400'
              }`}
            >
              ({totalPercent > 0 ? '+' : '-'}
              {formatPtNumber(Math.abs(totalPercent), 1)}%)
            </span>
          )}
        </div>
      </section>

      {/* 5. HISTÓRICO DE AVALIAÇÕES */}
      <section className="space-y-2.5">
        <h3 className="text-sm font-bold text-white tracking-tight px-0.5">
          Histórico de avaliações
        </h3>

        <div className="rounded-[22px] bg-[#0a0a0a] border border-zinc-800/80 overflow-hidden">
          <div className="grid grid-cols-3 px-4 py-2.5 border-b border-zinc-800/80 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            <span>DATA</span>
            <span className="text-center">{metric.tableHeader}</span>
            <span className="text-right">VS ANTERIOR</span>
          </div>

          <div className="divide-y divide-zinc-800/70">
            {newestFirstRecords.map((rec, idx) => {
              const isSelected =
                activePoint?.assessment.id === rec.assessment.id;
              const isMostRecent = idx === 0;
              const diff = rec.diffPrev;
              const isDown = diff !== null && diff < -0.05;
              const isUp = diff !== null && diff > 0.05;

              return (
                <button
                  key={rec.assessment.id}
                  type="button"
                  onClick={() => handleSelectPoint(rec.assessment.id, true)}
                  className={`w-full min-h-[50px] px-4 py-3 grid grid-cols-3 items-center gap-2 text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#F77F00]/10'
                      : 'hover:bg-zinc-900/50'
                  }`}
                >
                  <div className="min-w-0 flex items-center gap-1.5">
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F77F00] shrink-0" />
                    )}
                    <div className="min-w-0">
                      <span
                        className={`text-xs font-semibold block truncate tabular-nums ${
                          isSelected ? 'text-[#F77F00]' : 'text-white'
                        }`}
                      >
                        {rec.fullShortDate}
                      </span>
                      {isMostRecent && (
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#F77F00] block leading-none mt-0.5">
                          ATUAL
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-xs font-bold text-white text-center tabular-nums">
                    {formatPtNumber(rec.value, metric.decimals)} {metric.unit}
                  </span>

                  <div
                    className={`flex items-center justify-end gap-1 text-xs font-bold tabular-nums ${
                      diff === null
                        ? 'text-zinc-500'
                        : isDown
                          ? 'text-emerald-400'
                          : isUp
                            ? 'text-[#F77F00]'
                            : 'text-zinc-400'
                    }`}
                  >
                    {diff === null ? (
                      <span>—</span>
                    ) : (
                      <>
                        {isDown ? (
                          <ArrowDownRight className="w-3.5 h-3.5 shrink-0" />
                        ) : isUp ? (
                          <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <Minus className="w-3 h-3 shrink-0" />
                        )}
                        <span>
                          {formatSignedValue(
                            diff,
                            metric.unit,
                            metric.decimals
                          )}
                        </span>
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
