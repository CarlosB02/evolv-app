import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Dumbbell,
  Footprints,
  Lock,
  Minus,
  Moon,
  Plus,
  Scale,
  Utensils,
} from 'lucide-react';
import {
  fromISODate,
  getWeekDatesISO,
  useDailyCheckIn,
} from '../../context/DailyCheckInContext';
import {
  CheckInDietOption,
  CheckInSleepOption,
  CheckInTrainedOption,
} from '../../types';

const WEEKDAY_SHORT_PT = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

const TRAINED_OPTIONS: { value: CheckInTrainedOption; label: string }[] = [
  { value: 'sim', label: 'Sim' },
  { value: 'nao', label: 'Não' },
  { value: 'descanso', label: 'Descanso' },
];

const SLEEP_OPTIONS: { value: CheckInSleepOption; label: string }[] = [
  { value: '<5h', label: '<5h' },
  { value: '5-6h', label: '5–6h' },
  { value: '7-8h', label: '7–8h' },
  { value: '9h+', label: '9h+' },
];

const DIET_OPTIONS: { value: CheckInDietOption; label: string }[] = [
  { value: 'totalmente', label: 'Totalmente' },
  { value: 'quase', label: 'Quase' },
  { value: 'pouco', label: 'Pouco' },
  { value: 'nao', label: 'Não' },
];

function formatPtNumber(value: number, decimals = 0): string {
  return value.toLocaleString('pt-PT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatWeekRangeLabel(weekDates: string[]): string {
  if (weekDates.length < 7) return '';
  const start = fromISODate(weekDates[0]);
  const end = fromISODate(weekDates[6]);

  const startDay = start.getDate();
  const endDay = end.getDate();
  const startMonth = start
    .toLocaleDateString('pt-PT', { month: 'short' })
    .replace('.', '');
  const endMonth = end
    .toLocaleDateString('pt-PT', { month: 'short' })
    .replace('.', '');

  const capStart = startMonth.charAt(0).toUpperCase() + startMonth.slice(1);
  const capEnd = endMonth.charAt(0).toUpperCase() + endMonth.slice(1);

  if (start.getMonth() === end.getMonth()) {
    return `${startDay} – ${endDay} ${capEnd}`;
  }
  return `${startDay} ${capStart} – ${endDay} ${capEnd}`;
}

function formatFullDatePt(iso: string): string {
  const dt = fromISODate(iso);
  const formatted = dt.toLocaleDateString('pt-PT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function CheckInRegisterTab() {
  const {
    todayISO,
    recordsByDate,
    goals,
    getDayCompletion,
    updateTodayCheckIn,
    baselineWeekAgoWeightKg,
  } = useDailyCheckIn();

  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [selectedISO, setSelectedISO] = useState<string>(todayISO);

  const weekDates = useMemo(
    () => getWeekDatesISO(weekOffset, todayISO),
    [weekOffset, todayISO]
  );

  // Manter sempre um dia válido selecionado ao trocar de semana
  useEffect(() => {
    if (!weekDates.includes(selectedISO)) {
      if (weekDates.includes(todayISO)) {
        setSelectedISO(todayISO);
      } else {
        // Selecionar o último dia com registo nessa semana ou domingo
        const lastWithRecord = [...weekDates]
          .reverse()
          .find((iso) => Boolean(recordsByDate[iso]));
        setSelectedISO(lastWithRecord ?? weekDates[0]);
      }
    }
  }, [weekDates, selectedISO, todayISO, recordsByDate]);

  // Resumo semanal calculado automaticamente dos registos da semana apresentada
  const weeklySummary = useMemo(() => {
    let completedDays = 0;
    let stepsSum = 0;
    let stepsDays = 0;
    let waterSum = 0;
    let waterDays = 0;

    for (const iso of weekDates) {
      if (iso > todayISO) continue;
      const completion = getDayCompletion(iso);
      if (completion.status === 'completed') {
        completedDays += 1;
      }
      const rec = recordsByDate[iso];
      if (rec?.steps !== null && rec?.steps !== undefined) {
        stepsSum += rec.steps;
        stepsDays += 1;
      }
      if (rec?.waterLiters !== null && rec?.waterLiters !== undefined) {
        waterSum += rec.waterLiters;
        waterDays += 1;
      }
    }

    return {
      completedDays,
      avgSteps: stepsDays > 0 ? Math.round(stepsSum / stepsDays) : 0,
      avgWaterLiters: waterDays > 0 ? Math.round((waterSum / waterDays) * 100) / 100 : 0,
      hasSteps: stepsDays > 0,
      hasWater: waterDays > 0,
    };
  }, [weekDates, todayISO, recordsByDate, getDayCompletion]);

  const isTodaySelected = selectedISO === todayISO;
  const isFutureSelected = selectedISO > todayISO;
  const selectedRecord = recordsByDate[selectedISO];
  const selectedCompletion = getDayCompletion(selectedISO);

  // Inputs controlados para escrita direta de Peso, Passos e Água no dia atual
  const [weightInput, setWeightInput] = useState<string>('');
  const [stepsInput, setStepsInput] = useState<string>('');
  const [waterInput, setWaterInput] = useState<string>('');

  useEffect(() => {
    setWeightInput(
      selectedRecord?.weightKg !== null && selectedRecord?.weightKg !== undefined
        ? formatPtNumber(selectedRecord.weightKg, 1)
        : ''
    );
    setStepsInput(
      selectedRecord?.steps !== null && selectedRecord?.steps !== undefined
        ? String(selectedRecord.steps)
        : ''
    );
    setWaterInput(
      selectedRecord?.waterLiters !== null && selectedRecord?.waterLiters !== undefined
        ? formatPtNumber(selectedRecord.waterLiters, 2)
        : ''
    );
  }, [
    selectedISO,
    selectedRecord?.weightKg,
    selectedRecord?.steps,
    selectedRecord?.waterLiters,
  ]);

  const handlePatchToday = (
    patch: Parameters<typeof updateTodayCheckIn>[0]
  ) => {
    if (!isTodaySelected) return;
    updateTodayCheckIn(patch);
  };

  const handleAdjustWeight = (delta: number) => {
    if (!isTodaySelected) return;
    const base = selectedRecord?.weightKg ?? baselineWeekAgoWeightKg ?? 78.5;
    const next = Math.round((base + delta) * 10) / 10;
    handlePatchToday({ weightKg: next });
  };

  const handleAdjustSteps = (delta: number) => {
    if (!isTodaySelected) return;
    const base = selectedRecord?.steps ?? 0;
    const next = Math.max(0, Math.round(base + delta));
    handlePatchToday({ steps: next });
  };

  const handleAdjustWater = (delta: number) => {
    if (!isTodaySelected) return;
    const base = selectedRecord?.waterLiters ?? 0;
    const next = Math.max(0, Math.round((base + delta) * 100) / 100);
    handlePatchToday({ waterLiters: next });
  };

  const handleWeightInputChange = (raw: string) => {
    if (!isTodaySelected) return;
    const clean = raw.replace(/[^0-9.,]/g, '');
    setWeightInput(clean);
    const parsed = parseFloat(clean.replace(',', '.'));
    if (Number.isFinite(parsed) && parsed >= 25 && parsed <= 300) {
      handlePatchToday({ weightKg: Math.round(parsed * 10) / 10 });
    }
  };

  const handleWeightBlur = () => {
    const parsed = parseFloat(weightInput.replace(',', '.'));
    if (Number.isFinite(parsed) && parsed > 0) {
      handlePatchToday({ weightKg: Math.round(parsed * 10) / 10 });
    } else {
      setWeightInput(
        selectedRecord?.weightKg !== null && selectedRecord?.weightKg !== undefined
          ? formatPtNumber(selectedRecord.weightKg, 1)
          : ''
      );
    }
  };

  const handleStepsInputChange = (raw: string) => {
    if (!isTodaySelected) return;
    const clean = raw.replace(/[^0-9]/g, '');
    setStepsInput(clean);
    if (clean.length > 0) {
      const parsed = parseInt(clean, 10);
      if (Number.isFinite(parsed)) {
        handlePatchToday({ steps: Math.min(100000, parsed) });
      }
    }
  };

  const handleStepsBlur = () => {
    if (stepsInput.trim() === '') {
      setStepsInput(
        selectedRecord?.steps !== null && selectedRecord?.steps !== undefined
          ? String(selectedRecord.steps)
          : ''
      );
    }
  };

  const handleWaterInputChange = (raw: string) => {
    if (!isTodaySelected) return;
    const clean = raw.replace(/[^0-9.,]/g, '');
    setWaterInput(clean);
    const parsed = parseFloat(clean.replace(',', '.'));
    if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 15) {
      handlePatchToday({ waterLiters: Math.round(parsed * 100) / 100 });
    }
  };

  const handleWaterBlur = () => {
    const parsed = parseFloat(waterInput.replace(',', '.'));
    if (Number.isFinite(parsed) && parsed >= 0) {
      handlePatchToday({ waterLiters: Math.round(parsed * 100) / 100 });
    } else {
      setWaterInput(
        selectedRecord?.waterLiters !== null && selectedRecord?.waterLiters !== undefined
          ? formatPtNumber(selectedRecord.waterLiters, 2)
          : ''
      );
    }
  };

  const handleGoToToday = () => {
    setWeekOffset(0);
    setSelectedISO(todayISO);
  };

  const stepsVal = selectedRecord?.steps ?? 0;
  const stepsPct =
    goals.stepsGoal > 0 ? Math.round((stepsVal / goals.stepsGoal) * 100) : 0;

  const waterVal = selectedRecord?.waterLiters ?? 0;
  const waterPct =
    goals.waterGoalLiters > 0
      ? Math.round((waterVal / goals.waterGoalLiters) * 100)
      : 0;

  const showEmptyReadOnly =
    !isTodaySelected &&
    (isFutureSelected || selectedCompletion.filledCount === 0);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* 1. NAVEGAÇÃO ENTRE SEMANAS + DIAS */}
      <section className="rounded-[22px] bg-[#0a0a0a] border border-zinc-800/80 p-4 space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setWeekOffset((prev) => prev - 1)}
            aria-label="Semana anterior"
            className="min-w-[40px] min-h-[40px] rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/80 flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex flex-col items-center min-w-0">
            <span className="text-xs font-bold text-white tabular-nums truncate">
              {formatWeekRangeLabel(weekDates)}
            </span>
            {(weekOffset !== 0 || !isTodaySelected) && (
              <button
                type="button"
                onClick={handleGoToToday}
                className="text-[11px] font-semibold text-[#F77F00] hover:underline mt-0.5 cursor-pointer"
              >
                Voltar a hoje
              </button>
            )}
          </div>

          <button
            type="button"
            disabled={weekOffset >= 0}
            onClick={() => setWeekOffset((prev) => Math.min(0, prev + 1))}
            aria-label="Semana seguinte"
            className="min-w-[40px] min-h-[40px] rounded-xl bg-zinc-900/80 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none border border-zinc-800/80 flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Tira de 7 dias */}
        <div className="grid grid-cols-7 gap-1.5">
          {weekDates.map((iso) => {
            const dt = fromISODate(iso);
            const isSelected = iso === selectedISO;
            const isToday = iso === todayISO;
            const comp = getDayCompletion(iso);
            const isCompleted = comp.status === 'completed';
            const isPartial = comp.status === 'partial';
            const isFuture = comp.status === 'future';

            return (
              <button
                key={iso}
                type="button"
                onClick={() => setSelectedISO(iso)}
                aria-label={`${formatFullDatePt(iso)} — ${
                  isCompleted ? 'Completo' : isToday ? 'Hoje' : isFuture ? 'Futuro' : 'Por preencher'
                }`}
                className={`min-h-[58px] py-1.5 px-1 rounded-xl border flex flex-col items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#F77F00] border-[#F77F00] shadow-md shadow-orange-500/20'
                    : isToday
                      ? 'bg-[#F77F00]/12 border-[#F77F00]/60'
                      : isCompleted
                        ? 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                        : 'bg-zinc-950/60 border-zinc-800/60 hover:border-zinc-700'
                }`}
              >
                <span
                  style={isSelected ? { color: '#ffffff' } : undefined}
                  className={`text-[9px] font-bold uppercase tracking-wider leading-none ${
                    isSelected
                      ? ''
                      : isToday
                        ? 'text-[#F77F00]'
                        : isFuture
                          ? 'text-zinc-600'
                          : 'text-zinc-400'
                  }`}
                >
                  {WEEKDAY_SHORT_PT[dt.getDay()]}
                </span>

                <span
                  style={isSelected ? { color: '#ffffff' } : undefined}
                  className={`text-xs font-bold tabular-nums leading-none ${
                    isSelected
                      ? ''
                      : isFuture
                        ? 'text-zinc-600'
                        : 'text-white'
                  }`}
                >
                  {dt.getDate()}
                </span>

                <div className="h-3 flex items-center justify-center">
                  {isCompleted ? (
                    <Check
                      style={isSelected ? { color: '#ffffff' } : undefined}
                      className={`w-3 h-3 ${isSelected ? '' : 'text-[#F77F00]'}`}
                      strokeWidth={3}
                    />
                  ) : isPartial || (isToday && comp.filledCount > 0) ? (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-white' : 'bg-[#F77F00]'
                      }`}
                    />
                  ) : (
                    <span
                      className={`w-1.5 h-[1.5px] rounded-full ${
                        isSelected
                          ? 'bg-white/60'
                          : isFuture
                            ? 'bg-zinc-800'
                            : 'bg-zinc-700'
                      }`}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. RESUMO SEMANAL */}
      <section className="grid grid-cols-3 rounded-[22px] bg-[#0a0a0a] border border-zinc-800/80 divide-x divide-zinc-800/70 overflow-hidden">
        <div className="py-3.5 px-2 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block leading-none">
            Completos
          </span>
          <span className="text-sm font-bold text-white tabular-nums mt-1.5 block leading-none whitespace-nowrap">
            {weeklySummary.completedDays}
            <span className="text-zinc-500 font-semibold">/7</span>
          </span>
        </div>

        <div className="py-3.5 px-2 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block leading-none">
            Média passos
          </span>
          <span className="text-sm font-bold text-white tabular-nums mt-1.5 block leading-none whitespace-nowrap">
            {weeklySummary.hasSteps ? formatPtNumber(weeklySummary.avgSteps, 0) : '—'}
          </span>
        </div>

        <div className="py-3.5 px-2 text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block leading-none">
            Média água
          </span>
          <span className="text-sm font-bold text-[#F77F00] tabular-nums mt-1.5 block leading-none whitespace-nowrap">
            {weeklySummary.hasWater
              ? `${formatPtNumber(weeklySummary.avgWaterLiters, 2)} L`
              : '—'}
          </span>
        </div>
      </section>

      {/* 3. FORMULÁRIO / CONSULTA DO CHECK-IN */}
      {showEmptyReadOnly ? (
        <section className="rounded-[22px] bg-[#0a0a0a] border border-zinc-800/80 p-6 text-center space-y-3">
          <Lock className="w-6 h-6 text-zinc-600 mx-auto" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-white">
              {isFutureSelected
                ? 'Dia ainda não disponível'
                : 'Sem check-in registado neste dia'}
            </p>
            <p className="text-xs text-zinc-400 max-w-[260px] mx-auto leading-relaxed">
              {isFutureSelected
                ? 'O check-in diário só fica disponível na data correspondente.'
                : 'Apenas o dia atual pode ser preenchido ou editado.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleGoToToday}
            style={{ color: '#ffffff' }}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-[#F77F00] hover:bg-[#e57300] text-xs font-bold transition-colors cursor-pointer"
          >
            Ir para hoje
          </button>
        </section>
      ) : (
        <div className="space-y-3">
          {/* PESO (kg) */}
          <section className="rounded-[20px] bg-[#0a0a0a] border border-zinc-800/80 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#F77F00] shrink-0" />
                <span className="text-xs font-bold text-white">Peso</span>
              </div>
              <span className="text-[11px] text-zinc-500 font-medium">kg</span>
            </div>

            {isTodaySelected ? (
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleAdjustWeight(-0.1)}
                  aria-label="Diminuir peso em 0,1 kg"
                  className="w-11 h-11 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:scale-95 border border-zinc-800 flex items-center justify-center text-zinc-200 transition-all cursor-pointer shrink-0"
                >
                  <Minus className="w-4 h-4" strokeWidth={2.5} />
                </button>

                <div className="flex items-baseline justify-center gap-1 flex-1 min-w-0">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={weightInput}
                    onChange={(e) => handleWeightInputChange(e.target.value)}
                    onBlur={handleWeightBlur}
                    placeholder="0,0"
                    aria-label="Peso em quilogramas"
                    className="w-24 bg-transparent text-center text-2xl font-bold text-white tabular-nums outline-none focus:text-[#F77F00] transition-colors"
                  />
                  <span className="text-xs font-semibold text-zinc-400">kg</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleAdjustWeight(0.1)}
                  aria-label="Aumentar peso em 0,1 kg"
                  className="w-11 h-11 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:scale-95 border border-zinc-800 flex items-center justify-center text-[#F77F00] transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <p className="text-xl font-bold text-white tabular-nums">
                {selectedRecord?.weightKg !== null &&
                selectedRecord?.weightKg !== undefined
                  ? `${formatPtNumber(selectedRecord.weightKg, 1)} kg`
                  : '—'}
              </p>
            )}
          </section>

          {/* TREINASTE? */}
          <section className="rounded-[20px] bg-[#0a0a0a] border border-zinc-800/80 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-[#F77F00] shrink-0" />
              <span className="text-xs font-bold text-white">Treinaste?</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {TRAINED_OPTIONS.map((opt) => {
                const isActive = selectedRecord?.trained === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={!isTodaySelected}
                    onClick={() => handlePatchToday({ trained: opt.value })}
                    style={isActive ? { color: '#ffffff' } : undefined}
                    className={`min-h-[42px] py-2 px-2 rounded-xl border text-xs font-bold transition-all whitespace-nowrap ${
                      isTodaySelected ? 'cursor-pointer active:scale-[0.98]' : 'cursor-default'
                    } ${
                      isActive
                        ? 'bg-[#F77F00] border-[#F77F00] shadow-sm shadow-orange-500/20'
                        : isTodaySelected
                          ? 'bg-zinc-950/60 border-zinc-800/80 text-zinc-300 hover:text-white hover:border-zinc-700'
                          : 'bg-zinc-950/40 border-zinc-800/50 text-zinc-500'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* HORAS DE SONO */}
          <section className="rounded-[20px] bg-[#0a0a0a] border border-zinc-800/80 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-[#F77F00] shrink-0" />
              <span className="text-xs font-bold text-white">Horas de sono</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {SLEEP_OPTIONS.map((opt) => {
                const isActive = selectedRecord?.sleepHours === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={!isTodaySelected}
                    onClick={() => handlePatchToday({ sleepHours: opt.value })}
                    style={isActive ? { color: '#ffffff' } : undefined}
                    className={`min-h-[42px] py-2 px-1 rounded-xl border text-xs font-bold tabular-nums transition-all whitespace-nowrap ${
                      isTodaySelected ? 'cursor-pointer active:scale-[0.98]' : 'cursor-default'
                    } ${
                      isActive
                        ? 'bg-[#F77F00] border-[#F77F00] shadow-sm shadow-orange-500/20'
                        : isTodaySelected
                          ? 'bg-zinc-950/60 border-zinc-800/80 text-zinc-300 hover:text-white hover:border-zinc-700'
                          : 'bg-zinc-950/40 border-zinc-800/50 text-zinc-500'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* PLANO ALIMENTAR */}
          <section className="rounded-[20px] bg-[#0a0a0a] border border-zinc-800/80 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-[#F77F00] shrink-0" />
              <span className="text-xs font-bold text-white">Plano alimentar</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {DIET_OPTIONS.map((opt) => {
                const isActive = selectedRecord?.dietPlan === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={!isTodaySelected}
                    onClick={() => handlePatchToday({ dietPlan: opt.value })}
                    style={isActive ? { color: '#ffffff' } : undefined}
                    className={`min-h-[42px] py-2 px-1 rounded-xl border text-[11px] font-bold transition-all whitespace-nowrap ${
                      isTodaySelected ? 'cursor-pointer active:scale-[0.98]' : 'cursor-default'
                    } ${
                      isActive
                        ? 'bg-[#F77F00] border-[#F77F00] shadow-sm shadow-orange-500/20'
                        : isTodaySelected
                          ? 'bg-zinc-950/60 border-zinc-800/80 text-zinc-300 hover:text-white hover:border-zinc-700'
                          : 'bg-zinc-950/40 border-zinc-800/50 text-zinc-500'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* PASSOS */}
          <section className="rounded-[20px] bg-[#0a0a0a] border border-zinc-800/80 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Footprints className="w-4 h-4 text-[#F77F00] shrink-0" />
                <span className="text-xs font-bold text-white">Passos</span>
              </div>
              <span className="text-[11px] text-zinc-400 tabular-nums">
                <strong className={stepsPct >= 100 ? 'text-emerald-400' : 'text-[#F77F00]'}>
                  {stepsPct}%
                </strong>{' '}
                · Meta {formatPtNumber(goals.stepsGoal, 0)}
              </span>
            </div>

            {isTodaySelected ? (
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleAdjustSteps(-500)}
                  aria-label="Diminuir passos em 500"
                  className="w-11 h-11 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:scale-95 border border-zinc-800 flex items-center justify-center text-zinc-200 transition-all cursor-pointer shrink-0"
                >
                  <Minus className="w-4 h-4" strokeWidth={2.5} />
                </button>

                <div className="flex items-baseline justify-center gap-1.5 flex-1 min-w-0">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={stepsInput}
                    onChange={(e) => handleStepsInputChange(e.target.value)}
                    onBlur={handleStepsBlur}
                    placeholder="0"
                    aria-label="Número de passos"
                    className="w-28 bg-transparent text-center text-2xl font-bold text-white tabular-nums outline-none focus:text-[#F77F00] transition-colors"
                  />
                  <span className="text-xs font-semibold text-zinc-400">passos</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleAdjustSteps(500)}
                  aria-label="Aumentar passos em 500"
                  className="w-11 h-11 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:scale-95 border border-zinc-800 flex items-center justify-center text-[#F77F00] transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <p className="text-xl font-bold text-white tabular-nums">
                {selectedRecord?.steps !== null && selectedRecord?.steps !== undefined
                  ? `${formatPtNumber(selectedRecord.steps, 0)} passos`
                  : '—'}
              </p>
            )}

            <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  stepsPct >= 100 ? 'bg-emerald-400' : 'bg-[#F77F00]'
                }`}
                style={{ width: `${Math.min(100, stepsPct)}%` }}
              />
            </div>
          </section>

          {/* ÁGUA (L) */}
          <section className="rounded-[20px] bg-[#0a0a0a] border border-zinc-800/80 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-[#F77F00] shrink-0" />
                <span className="text-xs font-bold text-white">Água</span>
              </div>
              <span className="text-[11px] text-zinc-400 tabular-nums">
                <strong className={waterPct >= 100 ? 'text-emerald-400' : 'text-[#F77F00]'}>
                  {waterPct}%
                </strong>{' '}
                · Meta {formatPtNumber(goals.waterGoalLiters, 1)} L
              </span>
            </div>

            {isTodaySelected ? (
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleAdjustWater(-0.25)}
                  aria-label="Diminuir água em 0,25 litros"
                  className="w-11 h-11 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:scale-95 border border-zinc-800 flex items-center justify-center text-zinc-200 transition-all cursor-pointer shrink-0"
                >
                  <Minus className="w-4 h-4" strokeWidth={2.5} />
                </button>

                <div className="flex items-baseline justify-center gap-1 flex-1 min-w-0">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={waterInput}
                    onChange={(e) => handleWaterInputChange(e.target.value)}
                    onBlur={handleWaterBlur}
                    placeholder="0,00"
                    aria-label="Água consumida em litros"
                    className="w-24 bg-transparent text-center text-2xl font-bold text-white tabular-nums outline-none focus:text-[#F77F00] transition-colors"
                  />
                  <span className="text-xs font-semibold text-zinc-400">L</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleAdjustWater(0.25)}
                  aria-label="Aumentar água em 0,25 litros"
                  className="w-11 h-11 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:scale-95 border border-zinc-800 flex items-center justify-center text-[#F77F00] transition-all cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <p className="text-xl font-bold text-white tabular-nums">
                {selectedRecord?.waterLiters !== null &&
                selectedRecord?.waterLiters !== undefined
                  ? `${formatPtNumber(selectedRecord.waterLiters, 2)} L`
                  : '—'}
              </p>
            )}

            <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  waterPct >= 100 ? 'bg-emerald-400' : 'bg-[#F77F00]'
                }`}
                style={{ width: `${Math.min(100, waterPct)}%` }}
              />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
