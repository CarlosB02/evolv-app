import { DetailedWorkout } from './workoutsData';

export interface PersonalRecordEntry {
  id: string;
  exercise: string;
  bestWeight: number;
  bestReps: number;
  dateLabel: string;
  history: number[];
  fresh?: boolean;
}

export interface NewPREvent {
  exercise: string;
  newWeight: number;
  reps: number;
  previousWeight: number;
  previousReps: number;
  diffKg: number;
  diffReps: number;
  diffPercent: number;
  dateLabel: string;
}

const STORAGE_KEY = 'rteam_personal_records_v1';

export const PLATES_BANNER_IMAGE =
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=900&auto=format&fit=crop';

export const initialPersonalRecords: PersonalRecordEntry[] = [
  {
    id: 'pr-hip-thrust',
    exercise: 'Hip Thrust na Barra',
    bestWeight: 70,
    bestReps: 12,
    dateLabel: '2 nov',
    history: [55, 60, 62.5, 65, 68, 70],
  },
  {
    id: 'pr-supino-reto',
    exercise: 'Supino Reto com Barra',
    bestWeight: 70,
    bestReps: 12,
    dateLabel: '29 out',
    history: [57.5, 60, 62.5, 65, 67.5, 70],
  },
  {
    id: 'pr-agachamento-bulgaro',
    exercise: 'Agachamento Búlgaro com Halteres',
    bestWeight: 14,
    bestReps: 12,
    dateLabel: '26 out',
    history: [10, 10, 12, 12, 14, 14],
  },
  {
    id: 'pr-terra',
    exercise: 'Levantamento Terra Convencional',
    bestWeight: 85,
    bestReps: 8,
    dateLabel: '19 out',
    history: [70, 72.5, 75, 80, 82.5, 85],
  },
  {
    id: 'pr-militar',
    exercise: 'Desenvolvimento Militar com Barra',
    bestWeight: 38,
    bestReps: 10,
    dateLabel: '12 out',
    history: [30, 32, 34, 35, 36, 38],
  },
];

export function formatKgPt(n: number): string {
  const rounded = Number.isInteger(n) ? n : Number(n.toFixed(1));
  return String(rounded).replace('.', ',');
}

export function parseNumericValue(raw: string | number | undefined): number {
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0;
  if (!raw) return 0;
  const normalized = String(raw).replace(',', '.');
  const match = normalized.match(/\d+(\.\d+)?/);
  if (!match) return 0;
  const parsed = parseFloat(match[0]);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function loadPersonalRecords(): PersonalRecordEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Fallback to defaults
  }
  return initialPersonalRecords;
}

export function savePersonalRecords(records: PersonalRecordEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Ignore storage quota issues
  }
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

function formatTodayShortPt(): string {
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const now = new Date();
  return `${now.getDate()} ${months[now.getMonth()]}`;
}

export function getExerciseBaselinePR(
  exerciseName: string,
  workout?: DetailedWorkout
): { weight: number; reps: number } {
  const records = loadPersonalRecords();
  const norm = normalizeName(exerciseName);
  const existing = records.find((r) => normalizeName(r.exercise) === norm);

  let maxPrevWeight = 0;
  let maxPrevReps = 0;

  if (workout) {
    const ex = workout.exercises.find((e) => normalizeName(e.name) === norm);
    if (ex?.sets) {
      for (const s of ex.sets) {
        const w = parseNumericValue(s.prevWeight);
        const r = parseNumericValue(s.prevReps);
        if (w > maxPrevWeight || (w === maxPrevWeight && r > maxPrevReps)) {
          maxPrevWeight = w;
          maxPrevReps = r;
        }
      }
    }
  }

  if (existing) {
    if (existing.bestWeight > maxPrevWeight) {
      return { weight: existing.bestWeight, reps: existing.bestReps };
    }
    if (existing.bestWeight === maxPrevWeight && existing.bestReps >= maxPrevReps) {
      return { weight: existing.bestWeight, reps: existing.bestReps };
    }
  }

  return {
    weight: maxPrevWeight || 0,
    reps: maxPrevReps || 0,
  };
}

export function detectAndSavePR(params: {
  exerciseName: string;
  weightStr: string;
  repsStr: string;
  workout?: DetailedWorkout;
}): NewPREvent | null {
  const newWeight = parseNumericValue(params.weightStr);
  const newReps = Math.max(1, Math.round(parseNumericValue(params.repsStr)));

  if (newWeight <= 0) return null;

  const baseline = getExerciseBaselinePR(params.exerciseName, params.workout);
  if (baseline.weight <= 0) return null;

  const isHigherWeight = newWeight > baseline.weight;
  const isMoreRepsAtSameWeight = newWeight === baseline.weight && newReps > baseline.reps;

  if (!isHigherWeight && !isMoreRepsAtSameWeight) {
    return null;
  }

  const diffKg = Number((newWeight - baseline.weight).toFixed(1));
  const diffReps = newReps - baseline.reps;
  const diffPercent =
    baseline.weight > 0
      ? Number((((newWeight - baseline.weight) / baseline.weight) * 100).toFixed(1))
      : 0;

  const dateLabel = formatTodayShortPt();
  const norm = normalizeName(params.exerciseName);
  const records = loadPersonalRecords();
  const existingIdx = records.findIndex((r) => normalizeName(r.exercise) === norm);

  let updatedRecords: PersonalRecordEntry[];
  if (existingIdx !== -1) {
    const prev = records[existingIdx];
    const nextHistory = [...prev.history.slice(-7), newWeight];
    const updatedEntry: PersonalRecordEntry = {
      ...prev,
      bestWeight: newWeight,
      bestReps: newReps,
      dateLabel,
      history: nextHistory,
      fresh: true,
    };
    updatedRecords = [
      updatedEntry,
      ...records.filter((_, idx) => idx !== existingIdx).map((r) => ({ ...r, fresh: r.fresh })),
    ];
  } else {
    const newEntry: PersonalRecordEntry = {
      id: `pr-${Date.now()}`,
      exercise: params.exerciseName,
      bestWeight: newWeight,
      bestReps: newReps,
      dateLabel,
      history: [
        Math.max(1, Number((baseline.weight * 0.85).toFixed(1))),
        Math.max(1, Number((baseline.weight * 0.92).toFixed(1))),
        baseline.weight,
        newWeight,
      ],
      fresh: true,
    };
    updatedRecords = [newEntry, ...records];
  }

  savePersonalRecords(updatedRecords);

  return {
    exercise: params.exerciseName,
    newWeight,
    reps: newReps,
    previousWeight: baseline.weight,
    previousReps: baseline.reps,
    diffKg,
    diffReps,
    diffPercent,
    dateLabel,
  };
}
