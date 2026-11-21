import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Droplets, Footprints, Smartphone, Target } from 'lucide-react';
import {
  addDaysISO,
  fromISODate,
  useDailyCheckIn,
} from '../../context/DailyCheckInContext';

type ChartMetric = 'steps' | 'water';
type PeriodDays = 7 | 30;
type MotionPermissionState = 'prompt' | 'granted' | 'denied';

type SensorConstructorWithPermission = {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

interface DayBarItem {
  iso: string;
  value: number | null;
  pctOfGoal: number;
  metGoal: boolean;
  weekdayShort: string;
  dayNumber: string;
  shortDate: string; // ex: "19 Nov"
  fullDateLabel: string; // ex: "Qui, 19 Nov"
}

interface LiquidFrame {
  phase: number;
  tilt: number; // -1..1 (+ = inclinado para a direita)
  energy: number; // 0..1 amplitude extra de ondulação
}

function browserRequiresMotionPermission(): boolean {
  if (typeof window === 'undefined') return false;
  const orientCtor = (
    window as unknown as {
      DeviceOrientationEvent?: SensorConstructorWithPermission;
    }
  ).DeviceOrientationEvent;
  const motionCtor = (
    window as unknown as {
      DeviceMotionEvent?: SensorConstructorWithPermission;
    }
  ).DeviceMotionEvent;
  return (
    typeof orientCtor?.requestPermission === 'function' ||
    typeof motionCtor?.requestPermission === 'function'
  );
}

const WEEKDAY_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const VIEW_W = 360;
const VIEW_H = 220;
const PAD_LEFT = 44;
const PAD_RIGHT = 12;
const PAD_TOP = 26;
const PAD_BOTTOM = 36;
const PLOT_W = VIEW_W - PAD_LEFT - PAD_RIGHT;
const PLOT_H = VIEW_H - PAD_TOP - PAD_BOTTOM;

function formatPtNumber(value: number, decimals = 0): string {
  return value.toLocaleString('pt-PT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatCompactSteps(value: number): string {
  if (value >= 1000) {
    const k = value / 1000;
    const isInt = Math.abs(k - Math.round(k)) < 0.05;
    return `${formatPtNumber(k, isInt ? 0 : 1)}k`;
  }
  return String(Math.round(value));
}

function formatDayDates(iso: string): {
  weekdayShort: string;
  dayNumber: string;
  shortDate: string;
  fullDateLabel: string;
} {
  const dt = fromISODate(iso);
  const weekdayShort = WEEKDAY_PT[dt.getDay()];
  const dayNumber = String(dt.getDate());
  const monthRaw = dt
    .toLocaleDateString('pt-PT', { month: 'short' })
    .replace('.', '');
  const month = monthRaw.charAt(0).toUpperCase() + monthRaw.slice(1);
  return {
    weekdayShort,
    dayNumber,
    shortDate: `${dayNumber} ${month}`,
    fullDateLabel: `${weekdayShort}, ${dayNumber} ${month}`,
  };
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

function sampleWaveSurfacePoints(
  x: number,
  surfaceY: number,
  baselineY: number,
  w: number,
  phase: number,
  amp: number,
  tiltPx: number,
  segments: number
): Array<{ px: number; py: number }> {
  const pts: Array<{ px: number; py: number }> = [];
  const overscan = 1.5;
  const startX = x - overscan;
  const spanW = w + overscan * 2;
  const maxY = baselineY - 1;
  const minY = PAD_TOP - 2;

  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments;
    const px = startX + t * spanW;
    // Gravidade real: inclinar para a direita (tiltPx > 0) sobe o nível à direita (menor y) e desce à esquerda (maior y)
    const tiltOffset = -(t - 0.5) * tiltPx;
    const waveOffset = Math.sin(t * Math.PI * 1.45 + phase) * amp;
    const py = Math.min(maxY, Math.max(minY, surfaceY + tiltOffset + waveOffset));
    pts.push({ px, py });
  }
  return pts;
}

function buildLiquidWavePaths(
  x: number,
  surfaceY: number,
  baselineY: number,
  w: number,
  phase: number,
  amp: number,
  tiltPx: number,
  segments: number
): { fillPath: string; surfacePath: string } {
  const pts = sampleWaveSurfacePoints(
    x,
    surfaceY,
    baselineY,
    w,
    phase,
    amp,
    tiltPx,
    segments
  );

  let surfacePath = `M ${pts[0].px.toFixed(2)} ${pts[0].py.toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const midX = (p0.px + p1.px) / 2;
    const midY = (p0.py + p1.py) / 2;
    if (i === 0) {
      surfacePath += ` L ${midX.toFixed(2)} ${midY.toFixed(2)}`;
    } else {
      surfacePath += ` Q ${p0.px.toFixed(2)} ${p0.py.toFixed(2)} ${midX.toFixed(2)} ${midY.toFixed(2)}`;
    }
  }
  const last = pts[pts.length - 1];
  surfacePath += ` L ${last.px.toFixed(2)} ${last.py.toFixed(2)}`;

  const fillPath = `${surfacePath} L ${last.px.toFixed(2)} ${(baselineY + 2).toFixed(2)} L ${pts[0].px.toFixed(2)} ${(baselineY + 2).toFixed(2)} Z`;
  return { fillPath, surfacePath };
}

export function CheckInChartsTab() {
  const { todayISO, recordsByDate, goals } = useDailyCheckIn();

  const [metric, setMetric] = useState<ChartMetric>('steps');
  const [periodDays, setPeriodDays] = useState<PeriodDays>(7);
  const [selectedISO, setSelectedISO] = useState<string>(todayISO);
  const [animProgress, setAnimProgress] = useState<number>(1);
  const [motionPermission, setMotionPermission] =
    useState<MotionPermissionState>(() =>
      browserRequiresMotionPermission() ? 'prompt' : 'granted'
    );
  const [liquidFrame, setLiquidFrame] = useState<LiquidFrame>({
    phase: 0,
    tilt: 0,
    energy: 0,
  });

  const targetTiltRef = useRef<number>(0);
  const pointerTiltRef = useRef<number>(0);
  const sloshImpulseRef = useRef<number>(0);
  const shakeVelKickRef = useRef<number>(0);
  const hasOrientationEventRef = useRef<boolean>(false);
  const lastPointerXRef = useRef<number | null>(null);

  const requestMotionSensors = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const orientCtor = (
      window as unknown as {
        DeviceOrientationEvent?: SensorConstructorWithPermission;
      }
    ).DeviceOrientationEvent;
    const motionCtor = (
      window as unknown as {
        DeviceMotionEvent?: SensorConstructorWithPermission;
      }
    ).DeviceMotionEvent;

    try {
      let granted = false;

      if (typeof orientCtor?.requestPermission === 'function') {
        const res = await orientCtor.requestPermission();
        if (res === 'granted') granted = true;
      }

      if (typeof motionCtor?.requestPermission === 'function') {
        try {
          const res = await motionCtor.requestPermission();
          if (res === 'granted') granted = true;
        } catch {
          // Se o primeiro já autorizou, prosseguir
        }
      }

      if (
        typeof orientCtor?.requestPermission !== 'function' &&
        typeof motionCtor?.requestPermission !== 'function'
      ) {
        granted = true;
      }

      setMotionPermission(granted ? 'granted' : 'denied');
      if (granted) {
        sloshImpulseRef.current = 0.7;
      }
    } catch {
      // Caso o pedido não tenha partido de gesto suportado, manter 'prompt' para poder tentar novamente
      setMotionPermission('prompt');
    }
  }, []);

  const handleSelectMetric = (nextMetric: ChartMetric) => {
    setMetric(nextMetric);
    if (nextMetric === 'water' && motionPermission === 'prompt') {
      void requestMotionSensors();
    }
  };

  const isSteps = metric === 'steps';
  const goalValue = isSteps ? goals.stepsGoal : goals.waterGoalLiters;

  // Paleta contextual: laranja EVOLV para Passos, azul aquático para Água
  const accentHex = isSteps ? '#F77F00' : '#38bdf8';

  // Construir série diária real para os últimos 7 ou 30 dias (até hoje)
  const daySeries = useMemo<DayBarItem[]>(() => {
    const items: DayBarItem[] = [];
    for (let offset = -(periodDays - 1); offset <= 0; offset += 1) {
      const iso = addDaysISO(todayISO, offset);
      const rec = recordsByDate[iso];
      const rawValue = isSteps ? rec?.steps : rec?.waterLiters;
      const value =
        rawValue !== null && rawValue !== undefined ? rawValue : null;
      const pctOfGoal =
        value !== null && goalValue > 0
          ? Math.round((value / goalValue) * 100)
          : 0;
      const metGoal = value !== null && value >= goalValue;
      const labels = formatDayDates(iso);

      items.push({
        iso,
        value,
        pctOfGoal,
        metGoal,
        ...labels,
      });
    }
    return items;
  }, [todayISO, recordsByDate, periodDays, isSteps, goalValue]);

  // Calcular todos os indicadores automaticamente com base nos registos reais do período
  const stats = useMemo(() => {
    const registered = daySeries.filter((d) => d.value !== null);
    const registeredCount = registered.length;
    const sum = registered.reduce((acc, d) => acc + (d.value ?? 0), 0);
    const dailyAvg =
      registeredCount > 0
        ? isSteps
          ? Math.round(sum / registeredCount)
          : Math.round((sum / registeredCount) * 100) / 100
        : 0;

    const daysOnGoal = registered.filter((d) => d.metGoal).length;
    const daysOnGoalPct =
      periodDays > 0 ? Math.round((daysOnGoal / periodDays) * 100) : 0;

    let bestDay: DayBarItem | null = null;
    for (const d of registered) {
      if (d.value !== null && (!bestDay || d.value > (bestDay.value ?? -1))) {
        bestDay = d;
      }
    }

    return {
      dailyAvg,
      daysOnGoal,
      daysOnGoalPct,
      registeredCount,
      bestDay,
    };
  }, [daySeries, isSteps, periodDays]);

  // Garantir que o dia selecionado pertence ao período atual (por defeito hoje)
  useEffect(() => {
    const exists = daySeries.some((d) => d.iso === selectedISO);
    if (!exists) {
      setSelectedISO(todayISO);
    }
  }, [daySeries, selectedISO, todayISO]);

  // Animação suave de entrada das barras ao mudar indicador ou período
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setAnimProgress(1);
      return;
    }

    setAnimProgress(0);
    if (metric === 'water') {
      sloshImpulseRef.current = 0.65;
    }

    let rafId = 0;
    let startTs: number | null = null;
    const duration = 620;

    const tick = (now: number) => {
      if (startTs === null) startTs = now;
      const raw = Math.min(1, (now - startTs) / duration);
      setAnimProgress(raw);
      if (raw < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [metric, periodDays]);

  // Animação contínua (ondas + inclinação na Água; brasas/faíscas cinéticas nos Passos)
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setLiquidFrame({ phase: 0, tilt: 0, energy: 0 });
      return;
    }

    hasOrientationEventRef.current = false;

    const getScreenAngle = (): number => {
      if (typeof window === 'undefined') return 0;
      const angle = window.screen?.orientation?.angle;
      if (typeof angle === 'number') return angle;
      const legacy = (window as unknown as { orientation?: number })
        .orientation;
      return typeof legacy === 'number' ? legacy : 0;
    };

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const { gamma, beta } = event;
      if (typeof gamma !== 'number' || Number.isNaN(gamma)) return;

      hasOrientationEventRef.current = true;
      const screenAngle = getScreenAngle();
      let rollDeg = gamma;

      if (screenAngle === 90 && typeof beta === 'number') {
        rollDeg = -beta;
      } else if (
        (screenAngle === -90 || screenAngle === 270) &&
        typeof beta === 'number'
      ) {
        rollDeg = beta;
      } else if (screenAngle === 180) {
        rollDeg = -gamma;
      }

      const clamped = Math.max(-45, Math.min(45, rollDeg));
      const normalized = clamped / 45;
      const delta = Math.abs(normalized - targetTiltRef.current);
      if (delta > 0.025) {
        sloshImpulseRef.current = Math.min(
          1,
          sloshImpulseRef.current + delta * 1.8
        );
      }
      targetTiltRef.current = normalized;
    };

    const handleMotion = (event: DeviceMotionEvent) => {
      // Fallback de gravidade via acelerómetro (funciona em Android/iOS mesmo se deviceorientation não emitir gamma)
      if (!hasOrientationEventRef.current && event.accelerationIncludingGravity) {
        const ax = event.accelerationIncludingGravity.x;
        const ay = event.accelerationIncludingGravity.y;
        if (
          typeof ax === 'number' &&
          typeof ay === 'number' &&
          !Number.isNaN(ax) &&
          !Number.isNaN(ay)
        ) {
          // Unificar sinal entre iOS (ay < 0 em pé) e Android (ay > 0 em pé)
          const gravitySign = ay < 0 ? 1 : -1;
          const rollRad = Math.atan2(ax * gravitySign, Math.abs(ay) + 0.5);
          const rollDeg = (rollRad * 180) / Math.PI;
          const normalized = Math.max(-1, Math.min(1, rollDeg / 45));
          const delta = Math.abs(normalized - targetTiltRef.current);
          if (delta > 0.03) {
            sloshImpulseRef.current = Math.min(
              1,
              sloshImpulseRef.current + delta * 1.6
            );
          }
          targetTiltRef.current = normalized;
        }
      }

      // Aceleração lateral real (abanar ou mover o telemóvel para o lado agita a água)
      const accX = event.acceleration?.x;
      if (typeof accX === 'number' && !Number.isNaN(accX)) {
        const mag = Math.abs(accX);
        if (mag > 0.45) {
          const boost = Math.min(0.9, mag * 0.14);
          sloshImpulseRef.current = Math.min(1, sloshImpulseRef.current + boost);
          shakeVelKickRef.current = Math.max(
            -3.5,
            Math.min(3.5, shakeVelKickRef.current + accX * 0.35)
          );
        }
      }
    };

    const attachSensors = motionPermission === 'granted';
    if (attachSensors) {
      window.addEventListener('deviceorientation', handleOrientation, {
        passive: true,
      });
      window.addEventListener('devicemotion', handleMotion, {
        passive: true,
      });
    }

    let rafId = 0;
    let lastTs = performance.now();
    let phase = 0;
    let currentTilt = 0;
    let tiltVel = 0;

    const loop = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
      lastTs = now;

      // Combinar inclinação do sensor com interação suave do ponteiro/toque
      const desiredTilt = Math.max(
        -1,
        Math.min(1, targetTiltRef.current + pointerTiltRef.current)
      );

      // Injetar impulso lateral de movimento do telemóvel
      if (Math.abs(shakeVelKickRef.current) > 0.01) {
        tiltVel += shakeVelKickRef.current;
        shakeVelKickRef.current = 0;
      }

      // Mola amortecida para movimento realista de líquido com inércia
      const accel = (desiredTilt - currentTilt) * 22;
      tiltVel = (tiltVel + accel * dt) * Math.exp(-4.2 * dt);
      currentTilt = Math.max(-1.15, Math.min(1.15, currentTilt + tiltVel * dt));

      // Energia extra de ondulação quando há movimento/inclinação rápida
      sloshImpulseRef.current = Math.min(
        1,
        sloshImpulseRef.current * Math.exp(-2.6 * dt) +
          Math.abs(tiltVel) * dt * 1.15
      );

      phase += dt * (2.35 + sloshImpulseRef.current * 2.1);

      setLiquidFrame({
        phase,
        tilt: currentTilt,
        energy: sloshImpulseRef.current,
      });

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      if (attachSensors) {
        window.removeEventListener('deviceorientation', handleOrientation);
        window.removeEventListener('devicemotion', handleMotion);
      }
      if (rafId) cancelAnimationFrame(rafId);
      pointerTiltRef.current = 0;
      lastPointerXRef.current = null;
      shakeVelKickRef.current = 0;
    };
  }, [metric, motionPermission]);

  const handleChartPointerMove = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0) return;
    const relX = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1..1
    const clamped = Math.max(-1, Math.min(1, relX));

    if (lastPointerXRef.current !== null) {
      const dx = Math.abs(clamped - lastPointerXRef.current);
      sloshImpulseRef.current = Math.min(1, sloshImpulseRef.current + dx * 1.6);
    }
    lastPointerXRef.current = clamped;
    pointerTiltRef.current = clamped * (isSteps ? 0.45 : 0.7);
  };

  const handleChartPointerLeave = () => {
    pointerTiltRef.current = 0;
    lastPointerXRef.current = null;
  };

  const handleSelectDay = (iso: string) => {
    setSelectedISO(iso);
    sloshImpulseRef.current = Math.min(1, sloshImpulseRef.current + 0.55);
    if (!isSteps && motionPermission === 'prompt') {
      void requestMotionSensors();
    }
  };

  const activeDay = useMemo(() => {
    return (
      daySeries.find((d) => d.iso === selectedISO) ??
      daySeries[daySeries.length - 1] ??
      null
    );
  }, [daySeries, selectedISO]);

  // Geometria SVG das barras + linha horizontal da meta
  const geometry = useMemo(() => {
    const numericValues = daySeries
      .map((d) => d.value)
      .filter((v): v is number => v !== null);
    const dataMax = numericValues.length > 0 ? Math.max(...numericValues) : 0;

    // Garantir que a linha de meta e a barra máxima cabem confortavelmente
    const rawTop = Math.max(dataMax, goalValue) * 1.15;
    const yMax = isSteps
      ? Math.max(12000, Math.ceil(rawTop / 2000) * 2000)
      : Math.max(3, Math.ceil(rawTop * 2) / 2);

    const tickCount = 4;
    const yTicks = Array.from({ length: tickCount }, (_, i) => {
      const ratio = i / (tickCount - 1);
      const val = (1 - ratio) * yMax;
      const y = PAD_TOP + ratio * PLOT_H;
      return { value: val, y };
    });

    const baselineY = PAD_TOP + PLOT_H;
    const goalY = baselineY - (goalValue / yMax) * PLOT_H;

    const n = daySeries.length;
    const slotW = PLOT_W / Math.max(1, n);
    const barW =
      periodDays === 7
        ? Math.min(28, Math.max(16, slotW * 0.56))
        : Math.max(4.5, Math.min(8, slotW * 0.68));

    const bars = daySeries.map((day, idx) => {
      const x = PAD_LEFT + idx * slotW + (slotW - barW) / 2;
      const rawH =
        day.value !== null && day.value > 0
          ? Math.max(4, (day.value / yMax) * PLOT_H)
          : 0;
      return {
        day,
        x,
        slotX: PAD_LEFT + idx * slotW,
        slotW,
        w: barW,
        h: rawH,
        centerX: x + barW / 2,
      };
    });

    // Índices das legendas no eixo X para 30 dias (sem sobreposição)
    const xLabelIndices = new Set<number>();
    if (periodDays === 7) {
      for (let i = 0; i < n; i += 1) xLabelIndices.add(i);
    } else {
      xLabelIndices.add(0);
      xLabelIndices.add(7);
      xLabelIndices.add(14);
      xLabelIndices.add(21);
      xLabelIndices.add(n - 1);
    }

    return { yTicks, baselineY, goalY, bars, xLabelIndices };
  }, [daySeries, goalValue, isSteps, periodDays]);

  const formatMetricValue = (val: number) =>
    isSteps ? formatPtNumber(val, 0) : `${formatPtNumber(val, 2)} L`;

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 1. SUB-TABS: PASSOS | ÁGUA */}
      <div className="grid grid-cols-2 border-b border-zinc-800/80">
        {(
          [
            { id: 'steps', label: 'Passos', Icon: Footprints },
            { id: 'water', label: 'Água', Icon: Droplets },
          ] as const
        ).map((tab) => {
          const isActive = metric === tab.id;
          const IconComp = tab.Icon;
          const isWaterTab = tab.id === 'water';
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleSelectMetric(tab.id)}
              className={`min-h-[42px] py-2.5 text-xs font-bold relative flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                isActive
                  ? isWaterTab
                    ? 'text-sky-400'
                    : 'text-[#F77F00]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <IconComp className="w-3.5 h-3.5 shrink-0" />
              <span>{tab.label}</span>
              {isActive && (
                <span
                  className={`absolute bottom-0 inset-x-4 h-[2px] rounded-full ${
                    isWaterTab ? 'bg-sky-400' : 'bg-[#F77F00]'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* 2. SELETOR DE PERÍODO (7 DIAS | 30 DIAS) */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-zinc-400">
          Período de análise
        </span>

        <div className="inline-grid grid-cols-2 p-0.5 rounded-xl bg-[#0a0a0a] border border-zinc-800/80 shrink-0">
          {([7, 30] as const).map((days) => {
            const isSelected = periodDays === days;
            return (
              <button
                key={days}
                type="button"
                onClick={() => setPeriodDays(days)}
                className={`min-h-[34px] px-3.5 py-1 rounded-[10px] text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? isSteps
                      ? 'bg-[#F77F00] text-white shadow-sm shadow-orange-500/20'
                      : 'bg-[#0284c7] text-white shadow-sm shadow-sky-500/25'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {days} dias
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. RESUMO DO PERÍODO: MÉDIA DIÁRIA & DIAS NA META */}
      <section className="grid grid-cols-2 gap-2.5">
        <div className="rounded-[20px] bg-[#0a0a0a] border border-zinc-800/80 p-3.5 relative overflow-hidden">
          <div
            className={`absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent to-transparent ${
              isSteps ? 'via-[#F77F00]/60' : 'via-sky-400/70'
            }`}
            aria-hidden="true"
          />
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400">
            {isSteps ? (
              <Footprints className="w-3.5 h-3.5 text-[#F77F00] shrink-0" />
            ) : (
              <Droplets className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            )}
            <span>Média diária</span>
          </div>
          <p className="text-2xl font-black text-white tracking-tight tabular-nums leading-tight mt-1.5 whitespace-nowrap">
            {isSteps
              ? formatPtNumber(stats.dailyAvg, 0)
              : formatPtNumber(stats.dailyAvg, 2)}
            <span className="text-xs font-semibold text-zinc-400 ml-1">
              {isSteps ? 'passos' : 'L'}
            </span>
          </p>
          <span className="text-[11px] text-zinc-400 block mt-0.5 truncate">
            Últimos {periodDays} dias
          </span>
        </div>

        <div className="rounded-[20px] bg-[#0a0a0a] border border-zinc-800/80 p-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400">
            <Target
              className={`w-3.5 h-3.5 shrink-0 ${
                isSteps ? 'text-[#F77F00]' : 'text-sky-400'
              }`}
            />
            <span>Dias na meta</span>
          </div>
          <p className="text-2xl font-black text-white tracking-tight tabular-nums leading-tight mt-1.5 whitespace-nowrap">
            {stats.daysOnGoal}
            <span className="text-xs font-semibold text-zinc-400 ml-1">
              de {periodDays} dias
            </span>
          </p>
          <span
            className={`text-[11px] font-medium block mt-0.5 truncate tabular-nums ${
              isSteps ? 'text-[#F77F00]' : 'text-sky-400'
            }`}
          >
            Meta:{' '}
            {isSteps
              ? `${formatPtNumber(goalValue, 0)} passos`
              : `${formatPtNumber(goalValue, 1)} L`}
          </span>
        </div>
      </section>

      {/* 4. GRÁFICO DIÁRIO INTERATIVO + DETALHE DO DIA SELECIONADO */}
      <section className="rounded-[22px] bg-[#0a0a0a] border border-zinc-800/80 overflow-hidden">
        <div className="p-4 space-y-3">
          {/* Detalhe do dia selecionado */}
          {activeDay && (
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-zinc-800/70">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white tabular-nums">
                    {activeDay.value !== null
                      ? isSteps
                        ? `${formatPtNumber(activeDay.value, 0)} passos`
                        : `${formatPtNumber(activeDay.value, 2)} L`
                      : 'Sem registo'}
                  </span>
                  <span className="text-[11px] text-zinc-400 truncate">
                    · {activeDay.fullDateLabel}
                    {activeDay.iso === todayISO ? ' (Hoje)' : ''}
                  </span>
                </div>
                <p className="text-[10.5px] text-zinc-500 mt-0.5 tabular-nums">
                  {activeDay.value !== null
                    ? activeDay.metGoal
                      ? 'Meta diária atingida'
                      : `Faltam ${
                          isSteps
                            ? `${formatPtNumber(
                                Math.max(0, goalValue - activeDay.value),
                                0
                              )} passos`
                            : `${formatPtNumber(
                                Math.max(0, goalValue - activeDay.value),
                                2
                              )} L`
                        } para a meta`
                    : 'Sem dados registados neste dia'}
                </p>
              </div>

              <span
                className={`text-xs font-bold tabular-nums shrink-0 ${
                  activeDay.value === null
                    ? 'text-zinc-500'
                    : activeDay.metGoal
                      ? 'text-emerald-400'
                      : isSteps
                        ? 'text-[#F77F00]'
                        : 'text-sky-400'
                }`}
              >
                {activeDay.pctOfGoal}% da meta
              </span>
            </div>
          )}

          {/* Atalho discreto para autorizar sensor de movimento no iOS (só visível se ainda for necessário) */}
          {!isSteps && motionPermission === 'prompt' && (
            <button
              type="button"
              onClick={() => void requestMotionSensors()}
              className="w-full py-2 px-3 rounded-xl bg-sky-500/10 border border-sky-400/25 text-sky-300 text-[11px] font-semibold flex items-center justify-center gap-1.5 hover:bg-sky-500/15 transition-colors cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 shrink-0" />
              <span>Ativar sensor de inclinação do telemóvel</span>
            </button>
          )}

          {/* SVG Bar Chart */}
          <div
            className="w-full"
            onPointerMove={handleChartPointerMove}
            onPointerUp={handleChartPointerLeave}
            onPointerCancel={handleChartPointerLeave}
            onPointerLeave={handleChartPointerLeave}
          >
            <svg
              viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
              className="w-full h-auto block select-none overflow-visible"
              role="img"
              aria-label={`Gráfico diário de ${
                isSteps ? 'passos' : 'água em litros'
              } nos últimos ${periodDays} dias`}
            >
              <defs>
                {/* Gradientes laranja cinético — Passos */}
                <linearGradient
                  id="checkin-bar-goal-grad"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#FFC25C" />
                  <stop offset="22%" stopColor="#FF9424" />
                  <stop offset="65%" stopColor="#F77F00" />
                  <stop offset="100%" stopColor="#C2410C" />
                </linearGradient>
                <linearGradient
                  id="checkin-bar-below-grad"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#F77F00" stopOpacity="0.46" />
                  <stop offset="60%" stopColor="#EA580C" stopOpacity="0.26" />
                  <stop offset="100%" stopColor="#9A3412" stopOpacity="0.14" />
                </linearGradient>
                <radialGradient
                  id="checkin-ember-halo-grad"
                  cx="50%"
                  cy="50%"
                  r="50%"
                >
                  <stop offset="0%" stopColor="#FDBA74" stopOpacity="0.58" />
                  <stop offset="55%" stopColor="#F77F00" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#F77F00" stopOpacity="0" />
                </radialGradient>
                <linearGradient
                  id="checkin-bar-shimmer-grad"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.34" />
                  <stop offset="40%" stopColor="#FF9A2E" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#F77F00" stopOpacity="0" />
                </linearGradient>

                {/* Gradientes azul líquido — Água */}
                <linearGradient
                  id="checkin-water-goal-grad"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.98" />
                  <stop offset="48%" stopColor="#0ea5e9" stopOpacity="0.94" />
                  <stop offset="100%" stopColor="#0369a1" stopOpacity="0.96" />
                </linearGradient>
                <linearGradient
                  id="checkin-water-below-grad"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.62" />
                  <stop offset="55%" stopColor="#0284c7" stopOpacity="0.42" />
                  <stop offset="100%" stopColor="#075985" stopOpacity="0.32" />
                </linearGradient>
                <linearGradient
                  id="checkin-water-back-grad"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.42" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.22" />
                </linearGradient>

                {/* ClipPaths individuais para conter a onda líquida dentro de cada coluna */}
                {!isSteps &&
                  geometry.bars.map((item) => (
                    <clipPath
                      key={`clip-${item.day.iso}`}
                      id={`water-col-clip-${item.day.iso}`}
                    >
                      <path
                        d={topRoundedBarPath(
                          item.x,
                          PAD_TOP,
                          item.w,
                          PLOT_H,
                          periodDays === 7 ? 5 : 2.5
                        )}
                      />
                    </clipPath>
                  ))}
              </defs>

              {/* Grelha horizontal e eixo Y */}
              {geometry.yTicks.map((tick, idx) => (
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
                    className="text-zinc-400 text-[9px] font-medium tabular-nums"
                  >
                    {isSteps
                      ? formatCompactSteps(tick.value)
                      : `${formatPtNumber(tick.value, 1)} L`}
                  </text>
                </g>
              ))}

              {/* Linha base do eixo X */}
              <line
                x1={PAD_LEFT}
                y1={geometry.baselineY}
                x2={VIEW_W - PAD_RIGHT}
                y2={geometry.baselineY}
                stroke="currentColor"
                strokeWidth="1"
                className="text-zinc-800"
              />

              {/* Linha de referência da META diária */}
              <line
                x1={PAD_LEFT}
                y1={geometry.goalY}
                x2={VIEW_W - PAD_RIGHT}
                y2={geometry.goalY}
                stroke="#34d399"
                strokeOpacity="0.72"
                strokeDasharray="4 3"
                strokeWidth="1.25"
              />
              <text
                x={VIEW_W - PAD_RIGHT}
                y={geometry.goalY - 5}
                textAnchor="end"
                fill="#34d399"
                className="text-[8.5px] font-bold tabular-nums"
              >
                Meta{' '}
                {isSteps
                  ? formatCompactSteps(goalValue)
                  : `${formatPtNumber(goalValue, 1)} L`}
              </text>

              {/* Barras diárias */}
              {geometry.bars.map((item, idx) => {
                const total = geometry.bars.length;
                const stagger = total > 1 ? (idx / (total - 1)) * 0.32 : 0;
                const localRaw = Math.max(
                  0,
                  Math.min(1, (animProgress - stagger) / (1 - stagger))
                );
                const eased = 1 - Math.pow(1 - localRaw, 3);

                const currentH = item.h * eased;
                const currentY = geometry.baselineY - currentH;
                const isSelected = activeDay?.iso === item.day.iso;
                const colRadius = periodDays === 7 ? 5 : 2.5;

                // Geometria para Passos (energia / brasas cinéticas)
                const isSteps7d = isSteps && periodDays === 7;
                const stepsBarPath = isSteps
                  ? topRoundedBarPath(
                      item.x,
                      currentY,
                      item.w,
                      currentH,
                      colRadius
                    )
                  : '';
                const stepsColumnOutlinePath = isSteps7d
                  ? topRoundedBarPath(item.x, PAD_TOP, item.w, PLOT_H, colRadius)
                  : '';
                const emberPulse =
                  0.5 + 0.5 * Math.sin(liquidFrame.phase * 1.45 + idx * 1.1);
                const spark1P =
                  ((liquidFrame.phase * 0.24 + idx * 0.29) % 1 + 1) % 1;
                const spark2P =
                  ((liquidFrame.phase * 0.19 + idx * 0.61 + 0.37) % 1 + 1) % 1;
                const spark3P =
                  ((liquidFrame.phase * 0.28 + idx * 0.83 + 0.71) % 1 + 1) % 1;

                // Geometria líquida para Água
                const isWater7d = !isSteps && periodDays === 7;
                const waterColumnOutlinePath = isWater7d
                  ? topRoundedBarPath(item.x, PAD_TOP, item.w, PLOT_H, colRadius)
                  : '';

                let frontWave: { fillPath: string; surfacePath: string } | null =
                  null;
                let backWave: { fillPath: string; surfacePath: string } | null =
                  null;

                if (!isSteps && currentH > 1) {
                  const barPhaseOffset = idx * 0.85;
                  const baseAmp = periodDays === 7 ? 2.1 : 1.05;
                  const dynamicAmp =
                    (baseAmp +
                      liquidFrame.energy * (periodDays === 7 ? 3.1 : 1.3)) *
                    Math.min(1, currentH / 14);
                  // Inclinação fiel ao horizonte real conforme a rotação do telemóvel
                  const maxTiltPx = Math.min(
                    currentH * 0.72,
                    item.w * (periodDays === 7 ? 0.92 : 0.78)
                  );
                  const tiltPx = liquidFrame.tilt * maxTiltPx;
                  const segments = periodDays === 7 ? 6 : 3;

                  frontWave = buildLiquidWavePaths(
                    item.x,
                    currentY,
                    geometry.baselineY,
                    item.w,
                    liquidFrame.phase + barPhaseOffset,
                    dynamicAmp,
                    tiltPx,
                    segments
                  );

                  if (isWater7d && currentH > 5) {
                    backWave = buildLiquidWavePaths(
                      item.x,
                      currentY - 1.1,
                      geometry.baselineY,
                      item.w,
                      -liquidFrame.phase * 0.82 + barPhaseOffset + 2.2,
                      dynamicAmp * 0.85,
                      tiltPx * 0.72,
                      segments
                    );
                  }
                }

                // Micro-bolhas subtis na vista 7 dias da Água
                const bubble1Progress =
                  ((liquidFrame.phase * 0.16 + idx * 0.31) % 1 + 1) % 1;
                const bubble2Progress =
                  ((liquidFrame.phase * 0.12 + idx * 0.67 + 0.5) % 1 + 1) % 1;

                return (
                  <g key={item.day.iso}>
                    {/* Guia vertical discreta no dia selecionado */}
                    {isSelected && (
                      <line
                        x1={item.centerX}
                        y1={PAD_TOP}
                        x2={item.centerX}
                        y2={geometry.baselineY}
                        stroke={accentHex}
                        strokeOpacity="0.32"
                        strokeDasharray="2 2"
                        strokeWidth="1"
                      />
                    )}

                    {/* PASSOS — Energia cinética: brasas quentes + faíscas subtis nos dias na meta */}
                    {isSteps ? (
                      <>
                        {/* Silhueta subtil da coluna na vista 7 dias */}
                        {isSteps7d && (
                          <path
                            d={stepsColumnOutlinePath}
                            fill="#261206"
                            fillOpacity={isSelected ? '0.32' : '0.16'}
                            stroke="#F77F00"
                            strokeOpacity={isSelected ? '0.42' : '0.12'}
                            strokeWidth={isSelected ? '1.1' : '0.8'}
                          />
                        )}

                        {stepsBarPath ? (
                          <>
                            {/* Halo quente discreto no topo dos dias que atingiram a meta */}
                            {item.day.metGoal && localRaw > 0.65 && (
                              <ellipse
                                cx={item.centerX}
                                cy={currentY + 1}
                                rx={
                                  isSteps7d
                                    ? item.w * 0.68
                                    : Math.max(4, item.w * 0.78)
                                }
                                ry={
                                  (isSteps7d ? 6.5 : 3.5) +
                                  emberPulse * (isSteps7d ? 2.2 : 1) +
                                  liquidFrame.energy * 1.8
                                }
                                fill="url(#checkin-ember-halo-grad)"
                                opacity={
                                  (isSelected ? 0.85 : 0.6) +
                                  emberPulse * 0.25
                                }
                              />
                            )}

                            {/* Destaque de seleção na vista 30 dias */}
                            {!isSteps7d && isSelected && (
                              <path
                                d={topRoundedBarPath(
                                  item.x - 1,
                                  currentY - 1,
                                  item.w + 2,
                                  currentH + 1,
                                  3
                                )}
                                fill="none"
                                stroke="#FDBA74"
                                strokeOpacity="0.78"
                                strokeWidth="1"
                              />
                            )}

                            {/* Corpo da barra */}
                            <path
                              d={stepsBarPath}
                              fill={
                                item.day.metGoal || isSelected
                                  ? 'url(#checkin-bar-goal-grad)'
                                  : 'url(#checkin-bar-below-grad)'
                              }
                            />

                            {/* Reflexo vertical quente subtil (7 dias) */}
                            {isSteps7d && currentH > 10 && (
                              <rect
                                x={item.x + 2.5}
                                y={currentY + 4}
                                width={2.2}
                                height={Math.max(0, currentH - 8)}
                                rx={1.1}
                                fill="url(#checkin-bar-shimmer-grad)"
                                opacity={
                                  item.day.metGoal || isSelected ? 0.9 : 0.45
                                }
                              />
                            )}

                            {/* Crista luminosa de brasa no topo dos dias na meta */}
                            {item.day.metGoal &&
                              (isSteps7d ? (
                                <line
                                  x1={item.x + 4}
                                  y1={currentY + 1.1}
                                  x2={item.x + item.w - 4}
                                  y2={currentY + 1.1}
                                  stroke="#FEF08A"
                                  strokeOpacity={
                                    0.55 +
                                    emberPulse * 0.35 +
                                    liquidFrame.energy * 0.1
                                  }
                                  strokeWidth="1.4"
                                  strokeLinecap="round"
                                />
                              ) : (
                                <circle
                                  cx={item.centerX}
                                  cy={currentY + 1}
                                  r={Math.max(1.2, item.w * 0.34)}
                                  fill="#FEF08A"
                                  fillOpacity={0.45 + emberPulse * 0.38}
                                />
                              ))}

                            {/* Faíscas cinéticas a subir suavemente apenas nos dias na meta */}
                            {item.day.metGoal &&
                              localRaw > 0.72 &&
                              (isSteps7d ? (
                                <>
                                  <circle
                                    cx={
                                      item.x +
                                      item.w * 0.28 -
                                      liquidFrame.tilt * spark1P * 6.5 +
                                      Math.sin(
                                        liquidFrame.phase * 1.4 + idx
                                      ) *
                                        2.1
                                    }
                                    cy={Math.max(
                                      6,
                                      currentY - 1 - spark1P * 19
                                    )}
                                    r={1.25 * (1 - spark1P * 0.45)}
                                    fill={spark1P < 0.4 ? '#FEF08A' : '#FB923C'}
                                    fillOpacity={
                                      Math.sin(spark1P * Math.PI) *
                                      (0.75 + liquidFrame.energy * 0.22)
                                    }
                                  />
                                  <circle
                                    cx={
                                      item.x +
                                      item.w * 0.56 -
                                      liquidFrame.tilt * spark2P * 7.5 +
                                      Math.cos(
                                        liquidFrame.phase * 1.15 + idx * 1.7
                                      ) *
                                        2.4
                                    }
                                    cy={Math.max(
                                      6,
                                      currentY - 2 - spark2P * 23
                                    )}
                                    r={1.05 * (1 - spark2P * 0.45)}
                                    fill={spark2P < 0.45 ? '#FDE68A' : '#F77F00'}
                                    fillOpacity={
                                      Math.sin(spark2P * Math.PI) *
                                      (0.68 + liquidFrame.energy * 0.22)
                                    }
                                  />
                                  <circle
                                    cx={
                                      item.x +
                                      item.w * 0.76 -
                                      liquidFrame.tilt * spark3P * 5.5 +
                                      Math.sin(
                                        liquidFrame.phase * 1.7 + idx * 2.3
                                      ) *
                                        1.7
                                    }
                                    cy={Math.max(
                                      6,
                                      currentY - 1 - spark3P * 15
                                    )}
                                    r={0.85 * (1 - spark3P * 0.4)}
                                    fill="#FDBA74"
                                    fillOpacity={
                                      Math.sin(spark3P * Math.PI) * 0.62
                                    }
                                  />
                                </>
                              ) : (
                                (idx % 2 === 0 || isSelected) && (
                                  <circle
                                    cx={
                                      item.centerX -
                                      liquidFrame.tilt * spark1P * 4 +
                                      Math.sin(liquidFrame.phase + idx) * 1.1
                                    }
                                    cy={Math.max(
                                      6,
                                      currentY - 1 - spark1P * 12
                                    )}
                                    r={0.85 * (1 - spark1P * 0.4)}
                                    fill={spark1P < 0.45 ? '#FEF08A' : '#FB923C'}
                                    fillOpacity={
                                      Math.sin(spark1P * Math.PI) * 0.65
                                    }
                                  />
                                )
                              ))}
                          </>
                        ) : (
                          <line
                            x1={item.x + 1}
                            y1={geometry.baselineY - 1.5}
                            x2={item.x + item.w - 1}
                            y2={geometry.baselineY - 1.5}
                            stroke={isSelected ? '#F77F00' : '#3f3f46'}
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        )}
                      </>
                    ) : (
                      /* ÁGUA — Colunas com líquido azul animado e ondulação */
                      <>
                        {/* Silhueta subtil do recipiente na vista 7 dias */}
                        {isWater7d && (
                          <path
                            d={waterColumnOutlinePath}
                            fill="#082f49"
                            fillOpacity={isSelected ? '0.32' : '0.18'}
                            stroke="#38bdf8"
                            strokeOpacity={isSelected ? '0.42' : '0.14'}
                            strokeWidth={isSelected ? '1.1' : '0.8'}
                          />
                        )}

                        {frontWave ? (
                          <g clipPath={`url(#water-col-clip-${item.day.iso})`}>
                            {/* Onda traseira translúcida para profundidade */}
                            {backWave && (
                              <path
                                d={backWave.fillPath}
                                fill="url(#checkin-water-back-grad)"
                              />
                            )}

                            {/* Corpo principal de água azul */}
                            <path
                              d={frontWave.fillPath}
                              fill={
                                item.day.metGoal || isSelected
                                  ? 'url(#checkin-water-goal-grad)'
                                  : 'url(#checkin-water-below-grad)'
                              }
                            />

                            {/* Reflexo vertical subtil no vidro (7 dias) */}
                            {isWater7d && currentH > 10 && (
                              <rect
                                x={item.x + 2.5}
                                y={currentY + 4}
                                width={2.2}
                                height={Math.max(0, currentH - 8)}
                                rx={1.1}
                                fill="#e0f2fe"
                                fillOpacity={
                                  item.day.metGoal || isSelected ? '0.18' : '0.1'
                                }
                              />
                            )}

                            {/* Micro-bolhas a subir contra a gravidade (7 dias) */}
                            {isWater7d && currentH > 26 && localRaw > 0.7 && (
                              <>
                                <circle
                                  cx={
                                    item.x +
                                    item.w * 0.34 -
                                    liquidFrame.tilt * bubble1Progress * 4.5 +
                                    Math.sin(liquidFrame.phase + idx) * 1.1
                                  }
                                  cy={
                                    geometry.baselineY -
                                    4 -
                                    bubble1Progress * Math.max(6, currentH - 12)
                                  }
                                  r={1.15}
                                  fill="#e0f2fe"
                                  fillOpacity={
                                    (1 - bubble1Progress) * 0.42
                                  }
                                />
                                <circle
                                  cx={
                                    item.x +
                                    item.w * 0.68 -
                                    liquidFrame.tilt * bubble2Progress * 4.5 +
                                    Math.cos(liquidFrame.phase * 0.9 + idx) * 1.0
                                  }
                                  cy={
                                    geometry.baselineY -
                                    5 -
                                    bubble2Progress * Math.max(6, currentH - 14)
                                  }
                                  r={0.9}
                                  fill="#bae6fd"
                                  fillOpacity={
                                    (1 - bubble2Progress) * 0.36
                                  }
                                />
                              </>
                            )}

                            {/* Brilho da superfície líquida (menisco) */}
                            <path
                              d={frontWave.surfacePath}
                              fill="none"
                              stroke="#e0f2fe"
                              strokeOpacity={
                                item.day.metGoal || isSelected ? '0.78' : '0.45'
                              }
                              strokeWidth={periodDays === 7 ? '1.35' : '0.9'}
                              strokeLinecap="round"
                            />
                          </g>
                        ) : (
                          <line
                            x1={item.x + 1}
                            y1={geometry.baselineY - 1.5}
                            x2={item.x + item.w - 1}
                            y2={geometry.baselineY - 1.5}
                            stroke={isSelected ? '#38bdf8' : '#3f3f46'}
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        )}

                        {/* Destaque discreto do dia selecionado (30 dias) */}
                        {!isWater7d && isSelected && frontWave && (
                          <path
                            d={topRoundedBarPath(
                              item.x - 1,
                              currentY - 1,
                              item.w + 2,
                              currentH + 1,
                              3
                            )}
                            fill="none"
                            stroke="#bae6fd"
                            strokeOpacity="0.7"
                            strokeWidth="1"
                          />
                        )}
                      </>
                    )}

                    {/* Valor no topo das barras na vista de 7 dias */}
                    {periodDays === 7 &&
                      item.day.value !== null &&
                      localRaw > 0.65 && (
                        <text
                          x={item.centerX}
                          y={
                            isSteps
                              ? currentY - 6
                              : Math.max(PAD_TOP - 6, currentY - 7)
                          }
                          textAnchor="middle"
                          fill={
                            isSelected || item.day.metGoal
                              ? accentHex
                              : 'currentColor'
                          }
                          className={`tabular-nums ${
                            isSelected
                              ? 'text-[9px] font-extrabold'
                              : 'text-zinc-300 text-[8.5px] font-semibold'
                          }`}
                        >
                          {isSteps
                            ? formatCompactSteps(item.day.value)
                            : formatPtNumber(item.day.value, 1)}
                        </text>
                      )}

                    {/* Eixo X */}
                    {geometry.xLabelIndices.has(idx) &&
                      (periodDays === 7 ? (
                        <>
                          <text
                            x={item.centerX}
                            y={geometry.baselineY + 13}
                            textAnchor="middle"
                            fill={isSelected ? accentHex : 'currentColor'}
                            className={`text-[8.5px] ${
                              isSelected
                                ? 'font-bold'
                                : 'text-zinc-400 font-medium'
                            }`}
                          >
                            {item.day.weekdayShort}
                          </text>
                          <text
                            x={item.centerX}
                            y={geometry.baselineY + 23}
                            textAnchor="middle"
                            fill={isSelected ? accentHex : 'currentColor'}
                            className={`text-[7.5px] tabular-nums ${
                              isSelected
                                ? 'font-bold'
                                : 'text-zinc-500 font-medium'
                            }`}
                          >
                            {item.day.dayNumber}
                          </text>
                        </>
                      ) : (
                        <text
                          x={item.centerX}
                          y={geometry.baselineY + 15}
                          textAnchor={
                            idx === 0
                              ? 'start'
                              : idx === geometry.bars.length - 1
                                ? 'end'
                                : 'middle'
                          }
                          fill={isSelected ? accentHex : 'currentColor'}
                          className={`text-[8.5px] tabular-nums ${
                            isSelected
                              ? 'font-bold'
                              : 'text-zinc-400 font-medium'
                          }`}
                        >
                          {item.day.shortDate}
                        </text>
                      ))}

                    {/* Área interativa de toque para cada dia */}
                    <rect
                      x={item.slotX}
                      y={PAD_TOP}
                      width={item.slotW}
                      height={PLOT_H + 28}
                      fill="transparent"
                      className="cursor-pointer"
                      onClick={() => handleSelectDay(item.day.iso)}
                    />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* 5. INDICADORES FINAIS INTEGRADOS NO FUNDO DO BLOCO */}
        <div className="grid grid-cols-3 border-t border-zinc-800/70 divide-x divide-zinc-800/70">
          <div className="py-3.5 px-2 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block leading-none">
              Melhor dia
            </span>
            <span
              className={`text-sm font-bold tabular-nums mt-1.5 block leading-none whitespace-nowrap ${
                isSteps ? 'text-[#F77F00]' : 'text-sky-400'
              }`}
            >
              {stats.bestDay && stats.bestDay.value !== null
                ? formatMetricValue(stats.bestDay.value)
                : '—'}
            </span>
            {stats.bestDay && (
              <span className="text-[10px] text-zinc-500 block mt-1 leading-none truncate">
                {stats.bestDay.shortDate}
              </span>
            )}
          </div>

          <div className="py-3.5 px-2 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block leading-none">
              Dias na meta
            </span>
            <span
              className={`text-sm font-bold tabular-nums mt-1.5 block leading-none whitespace-nowrap ${
                isSteps ? 'text-[#F77F00]' : 'text-sky-400'
              }`}
            >
              {stats.daysOnGoalPct}%
            </span>
            <span className="text-[10px] text-zinc-500 block mt-1 leading-none tabular-nums">
              {stats.daysOnGoal}/{periodDays} dias
            </span>
          </div>

          <div className="py-3.5 px-2 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block leading-none">
              Dias registados
            </span>
            <span className="text-sm font-bold text-white tabular-nums mt-1.5 block leading-none whitespace-nowrap">
              {stats.registeredCount}
              <span className="text-zinc-500 font-semibold">/{periodDays}</span>
            </span>
            <span className="text-[10px] text-zinc-500 block mt-1 leading-none">
              no período
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

