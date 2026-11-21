import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  CheckInDietOption,
  CheckInSleepOption,
  CheckInTrainedOption,
  DailyCheckInGoals,
  DailyCheckInRecord,
} from '../types';

const STORAGE_KEY_RECORDS = 'evolv_daily_checkins_v1';
const STORAGE_KEY_GOALS = 'evolv_daily_checkin_goals_v1';
const LEGACY_INDICATORS_KEY = 'evolv_home_indicators_v1';

export type DayCheckInStatus =
  | 'completed'
  | 'partial'
  | 'pending'
  | 'missed'
  | 'future';

export interface DayCompletionInfo {
  filledCount: number;
  totalFields: 6;
  status: DayCheckInStatus;
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0);
}

export function addDaysISO(iso: string, offsetDays: number): string {
  const dt = fromISODate(iso);
  dt.setDate(dt.getDate() + offsetDays);
  return toISODate(dt);
}

export function getMondayOfWeekISO(iso: string): string {
  const dt = fromISODate(iso);
  const dow = dt.getDay(); // 0 = Dom, 1 = Seg
  const diffToMonday = dow === 0 ? -6 : 1 - dow;
  dt.setDate(dt.getDate() + diffToMonday);
  return toISODate(dt);
}

export function getWeekDatesISO(
  weekOffsetFromCurrent: number,
  todayISO: string
): string[] {
  const currentMonday = getMondayOfWeekISO(todayISO);
  const targetMonday = addDaysISO(currentMonday, weekOffsetFromCurrent * 7);
  return Array.from({ length: 7 }, (_, i) => addDaysISO(targetMonday, i));
}

export function countFilledFields(
  record: DailyCheckInRecord | undefined
): number {
  if (!record) return 0;
  let count = 0;
  if (record.weightKg !== null && record.weightKg !== undefined) count += 1;
  if (record.trained !== null && record.trained !== undefined) count += 1;
  if (record.sleepHours !== null && record.sleepHours !== undefined) count += 1;
  if (record.dietPlan !== null && record.dietPlan !== undefined) count += 1;
  if (record.steps !== null && record.steps !== undefined) count += 1;
  if (record.waterLiters !== null && record.waterLiters !== undefined) count += 1;
  return count;
}

export function getDayCompletionInfo(
  isoDate: string,
  todayISO: string,
  record: DailyCheckInRecord | undefined
): DayCompletionInfo {
  const filledCount = countFilledFields(record);

  if (isoDate > todayISO) {
    return { filledCount: 0, totalFields: 6, status: 'future' };
  }

  if (isoDate === todayISO) {
    return {
      filledCount,
      totalFields: 6,
      status: filledCount === 6 ? 'completed' : 'pending',
    };
  }

  if (filledCount === 6) {
    return { filledCount, totalFields: 6, status: 'completed' };
  }
  if (filledCount > 0) {
    return { filledCount, totalFields: 6, status: 'partial' };
  }
  return { filledCount: 0, totalFields: 6, status: 'missed' };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

const DEFAULT_GOALS: DailyCheckInGoals = {
  stepsGoal: 10000,
  waterGoalLiters: 2.5,
};

/**
 * Gera 35 dias anteriores realistas de registos do aluno + estado inicial do dia atual
 * sincronizado com os indicadores da página inicial.
 */
function buildInitialRecords(todayISO: string): Record<string, DailyCheckInRecord> {
  const records: Record<string, DailyCheckInRecord> = {};

  // Alguns dias realisticamente sem registo ao longo dos últimos 35 dias
  const missedOffsets = new Set([-3, -11, -19, -27, -33]);

  const stepsPattern = [
    10850, 9420, 11340, 8120, 10250, 12480, 7650,
    10610, 9870, 11890, 8950, 10420, 12150, 7920,
    10980, 9120, 11460, 10180, 8640, 12840, 7420,
    10520, 9640, 11210, 8390, 10760, 11640, 8180,
    10340, 9280, 10910, 8750, 10140, 11520, 7890,
  ];

  const waterPattern = [
    2.75, 2.25, 2.5, 2.0, 2.75, 3.0, 2.25,
    2.5, 2.75, 3.0, 2.25, 2.5, 3.25, 2.0,
    2.75, 2.25, 2.5, 2.75, 2.0, 3.0, 1.75,
    2.5, 2.25, 2.75, 2.0, 2.5, 3.0, 2.25,
    2.5, 2.25, 2.75, 2.0, 2.5, 2.75, 2.25,
  ];

  const sleepPattern: CheckInSleepOption[] = [
    '7-8h', '7-8h', '5-6h', '7-8h', '7-8h', '9h+', '7-8h',
    '7-8h', '5-6h', '7-8h', '7-8h', '7-8h', '9h+', '7-8h',
    '<5h', '7-8h', '7-8h', '5-6h', '7-8h', '9h+', '7-8h',
  ];

  const dietPattern: CheckInDietOption[] = [
    'totalmente', 'totalmente', 'quase', 'totalmente', 'totalmente', 'quase', 'pouco',
    'totalmente', 'quase', 'totalmente', 'totalmente', 'quase', 'totalmente', 'quase',
  ];

  for (let offset = -35; offset <= -1; offset += 1) {
    if (missedOffsets.has(offset)) continue;

    const iso = addDaysISO(todayISO, offset);
    const dt = fromISODate(iso);
    const dow = dt.getDay(); // 0=Dom, 1=Seg, ...
    const idx = Math.abs(offset) - 1;

    // Progressão realista de peso (~79,7 kg há 35 dias -> ~78,5 kg hoje)
    const trendWeight = 78.5 + (Math.abs(offset) / 35) * 1.25;
    const microWave = ((idx % 5) - 2) * 0.08;
    const weightKg = round1(trendWeight + microWave);

    // Padrão de treino coerente com 4-5 sessões por semana (Dom e Qui descanso habitual)
    let trained: CheckInTrainedOption = 'sim';
    if (dow === 0) {
      trained = 'descanso';
    } else if (dow === 4) {
      trained = idx % 3 === 0 ? 'sim' : 'descanso';
    } else if (idx % 9 === 0) {
      trained = 'nao';
    }

    records[iso] = {
      date: iso,
      weightKg,
      trained,
      sleepHours: sleepPattern[idx % sleepPattern.length],
      dietPlan: dietPattern[idx % dietPattern.length],
      steps: stepsPattern[idx % stepsPattern.length],
      waterLiters: waterPattern[idx % waterPattern.length],
      updatedAt: `${iso}T21:15:00`,
    };
  }

  // Sincronizar valores iniciais de hoje com os indicadores guardados (se existirem)
  let todayWeight = 78.5;
  let todaySteps = 6540;
  let todayWater = 1.2;

  try {
    const legacyRaw = localStorage.getItem(LEGACY_INDICATORS_KEY);
    if (legacyRaw) {
      const parsed = JSON.parse(legacyRaw);
      if (Array.isArray(parsed)) {
        const w = parsed.find((x: { type?: string }) => x?.type === 'weight');
        const s = parsed.find((x: { type?: string }) => x?.type === 'steps');
        const h = parsed.find((x: { type?: string }) => x?.type === 'water');
        if (w && typeof w.currentValue === 'number') todayWeight = round1(w.currentValue);
        if (s && typeof s.currentValue === 'number') todaySteps = Math.round(s.currentValue);
        if (h && typeof h.currentValue === 'number') todayWater = round2(h.currentValue);
      }
    }
  } catch {
    // Usar valores base
  }

  records[todayISO] = {
    date: todayISO,
    weightKg: todayWeight,
    trained: null,
    sleepHours: null,
    dietPlan: null,
    steps: todaySteps,
    waterLiters: todayWater,
  };

  return records;
}

interface DailyCheckInContextValue {
  todayISO: string;
  recordsByDate: Record<string, DailyCheckInRecord>;
  goals: DailyCheckInGoals;
  todayRecord: DailyCheckInRecord;
  baselineWeekAgoWeightKg: number;
  currentWeekWorkoutsDone: number;
  isCheckInOpen: boolean;
  openCheckIn: () => void;
  closeCheckIn: () => void;
  getRecord: (isoDate: string) => DailyCheckInRecord | undefined;
  getDayCompletion: (isoDate: string) => DayCompletionInfo;
  updateTodayCheckIn: (
    patch: Partial<Omit<DailyCheckInRecord, 'date' | 'updatedAt'>>
  ) => void;
  updateGoals: (patch: Partial<DailyCheckInGoals>) => void;
}

const DailyCheckInContext = createContext<DailyCheckInContextValue | undefined>(
  undefined
);

export function DailyCheckInProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const todayISO = useMemo(() => toISODate(new Date()), []);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);

  const [goals, setGoals] = useState<DailyCheckInGoals>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GOALS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          stepsGoal:
            typeof parsed.stepsGoal === 'number' && parsed.stepsGoal > 0
              ? parsed.stepsGoal
              : DEFAULT_GOALS.stepsGoal,
          waterGoalLiters:
            typeof parsed.waterGoalLiters === 'number' &&
            parsed.waterGoalLiters > 0
              ? parsed.waterGoalLiters
              : DEFAULT_GOALS.waterGoalLiters,
        };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_GOALS;
  });

  const [recordsByDate, setRecordsByDate] = useState<
    Record<string, DailyCheckInRecord>
  >(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECORDS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          // Garantir que o dia de hoje existe no mapa sem sobrescrever registos já guardados
          if (!parsed[todayISO]) {
            const seeded = buildInitialRecords(todayISO);
            return {
              ...seeded,
              ...parsed,
              [todayISO]: seeded[todayISO],
            };
          }
          return parsed;
        }
      }
    } catch {
      // Fallback para dados iniciais
    }
    return buildInitialRecords(todayISO);
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(recordsByDate));
    } catch {
      // Ignore storage quota errors
    }
  }, [recordsByDate]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(goals));
    } catch {
      // Ignore storage quota errors
    }
  }, [goals]);

  const openCheckIn = useCallback(() => setIsCheckInOpen(true), []);
  const closeCheckIn = useCallback(() => setIsCheckInOpen(false), []);

  const getRecord = useCallback(
    (isoDate: string) => recordsByDate[isoDate],
    [recordsByDate]
  );

  const getDayCompletion = useCallback(
    (isoDate: string) =>
      getDayCompletionInfo(isoDate, todayISO, recordsByDate[isoDate]),
    [recordsByDate, todayISO]
  );

  // Regra estrita: apenas o dia atual pode ser preenchido ou editado
  const updateTodayCheckIn = useCallback(
    (patch: Partial<Omit<DailyCheckInRecord, 'date' | 'updatedAt'>>) => {
      setRecordsByDate((prev) => {
        const current: DailyCheckInRecord = prev[todayISO] ?? {
          date: todayISO,
          weightKg: null,
          trained: null,
          sleepHours: null,
          dietPlan: null,
          steps: null,
          waterLiters: null,
        };

        const sanitized: Partial<DailyCheckInRecord> = { ...patch };
        if (typeof sanitized.weightKg === 'number') {
          sanitized.weightKg = round1(Math.max(25, Math.min(300, sanitized.weightKg)));
        }
        if (typeof sanitized.steps === 'number') {
          sanitized.steps = Math.round(Math.max(0, Math.min(100000, sanitized.steps)));
        }
        if (typeof sanitized.waterLiters === 'number') {
          sanitized.waterLiters = round2(Math.max(0, Math.min(15, sanitized.waterLiters)));
        }

        const updated: DailyCheckInRecord = {
          ...current,
          ...sanitized,
          date: todayISO,
          updatedAt: new Date().toISOString(),
        };

        return {
          ...prev,
          [todayISO]: updated,
        };
      });
    },
    [todayISO]
  );

  const updateGoals = useCallback((patch: Partial<DailyCheckInGoals>) => {
    setGoals((prev) => ({ ...prev, ...patch }));
  }, []);

  const todayRecord = useMemo<DailyCheckInRecord>(() => {
    return (
      recordsByDate[todayISO] ?? {
        date: todayISO,
        weightKg: null,
        trained: null,
        sleepHours: null,
        dietPlan: null,
        steps: null,
        waterLiters: null,
      }
    );
  }, [recordsByDate, todayISO]);

  // Peso de referência há ~7 dias para variação real na Home
  const baselineWeekAgoWeightKg = useMemo(() => {
    for (let offset = -7; offset >= -14; offset -= 1) {
      const rec = recordsByDate[addDaysISO(todayISO, offset)];
      if (rec?.weightKg !== null && rec?.weightKg !== undefined) {
        return rec.weightKg;
      }
    }
    return 79.7;
  }, [recordsByDate, todayISO]);

  // Número real de treinos realizados na semana atual
  const currentWeekWorkoutsDone = useMemo(() => {
    const weekDates = getWeekDatesISO(0, todayISO);
    return weekDates.reduce((acc, iso) => {
      const rec = recordsByDate[iso];
      return acc + (rec?.trained === 'sim' ? 1 : 0);
    }, 0);
  }, [recordsByDate, todayISO]);

  const value = useMemo<DailyCheckInContextValue>(
    () => ({
      todayISO,
      recordsByDate,
      goals,
      todayRecord,
      baselineWeekAgoWeightKg,
      currentWeekWorkoutsDone,
      isCheckInOpen,
      openCheckIn,
      closeCheckIn,
      getRecord,
      getDayCompletion,
      updateTodayCheckIn,
      updateGoals,
    }),
    [
      todayISO,
      recordsByDate,
      goals,
      todayRecord,
      baselineWeekAgoWeightKg,
      currentWeekWorkoutsDone,
      isCheckInOpen,
      openCheckIn,
      closeCheckIn,
      getRecord,
      getDayCompletion,
      updateTodayCheckIn,
      updateGoals,
    ]
  );

  return (
    <DailyCheckInContext.Provider value={value}>
      {children}
    </DailyCheckInContext.Provider>
  );
}

export function useDailyCheckIn() {
  const ctx = useContext(DailyCheckInContext);
  if (!ctx) {
    throw new Error('useDailyCheckIn must be used within a DailyCheckInProvider');
  }
  return ctx;
}
