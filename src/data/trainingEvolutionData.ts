import { loadPersonalRecords } from './personalRecords';

export interface ExerciseSessionLog {
  isoDate: string; // YYYY-MM-DD
  loadKg: number;
  sets: number;
  reps: number;
}

export interface TrackedExerciseEvolution {
  id: string;
  shortFocus: string; // Ex.: "Coxas 2"
  muscleGroup: string; // Ex.: "Quadríceps & Glúteo"
  exerciseName: string; // Ex.: "Leg Press 45°"
  equipment: string;
  sessions: ExerciseSessionLog[];
}

interface MonthlySeed {
  year: number;
  month: number; // 1..12
  loads: number[]; // cargas por sessão no mês
  sets: number;
  reps: number;
}

function buildSessionsFromMonthlySeeds(seeds: MonthlySeed[]): ExerciseSessionLog[] {
  const logs: ExerciseSessionLog[] = [];
  for (const seed of seeds) {
    const days =
      seed.loads.length === 4
        ? [4, 11, 18, 25]
        : seed.loads.length === 3
          ? [5, 15, 24]
          : [7, 21];

    seed.loads.forEach((load, idx) => {
      const day = Math.min(28, days[idx] ?? 10 + idx * 7);
      const mm = String(seed.month).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      logs.push({
        isoDate: `${seed.year}-${mm}-${dd}`,
        loadKg: load,
        sets: seed.sets,
        reps: seed.reps,
      });
    });
  }
  return logs.sort((a, b) => a.isoDate.localeCompare(b.isoDate));
}

const BASE_TRACKED_EXERCISES: TrackedExerciseEvolution[] = [
  {
    id: 'coxas-2',
    shortFocus: 'Coxas 2',
    muscleGroup: 'Quadríceps & Glúteo',
    exerciseName: 'Leg Press 45°',
    equipment: 'Máquina Leg Press 45',
    sessions: buildSessionsFromMonthlySeeds([
      { year: 2025, month: 12, loads: [120, 120, 125, 125], sets: 3, reps: 12 },
      { year: 2026, month: 1, loads: [125, 130, 130, 132], sets: 3, reps: 12 },
      { year: 2026, month: 2, loads: [132, 135, 135, 138], sets: 3, reps: 12 },
      { year: 2026, month: 3, loads: [138, 140, 140, 142], sets: 3, reps: 12 },
      { year: 2026, month: 4, loads: [142, 145, 145, 148], sets: 3, reps: 12 },
      { year: 2026, month: 5, loads: [148, 150, 152, 155], sets: 3, reps: 12 },
      { year: 2026, month: 6, loads: [152, 155, 158, 160], sets: 3, reps: 12 },
      { year: 2026, month: 7, loads: [158, 160, 162, 165], sets: 3, reps: 12 },
      { year: 2026, month: 8, loads: [160, 162, 164, 164], sets: 3, reps: 12 },
      { year: 2026, month: 9, loads: [164, 166, 168, 170], sets: 3, reps: 12 },
      { year: 2026, month: 10, loads: [168, 170, 172, 174], sets: 3, reps: 12 },
      { year: 2026, month: 11, loads: [172, 175, 178], sets: 3, reps: 12 },
    ]),
  },
  {
    id: 'coxas-1',
    shortFocus: 'Coxas 1',
    muscleGroup: 'Quadríceps Isolado',
    exerciseName: 'Cadeira Extensora',
    equipment: 'Máquina Extensora',
    sessions: buildSessionsFromMonthlySeeds([
      { year: 2025, month: 12, loads: [38, 38, 40, 40], sets: 3, reps: 14 },
      { year: 2026, month: 1, loads: [40, 40, 42, 42], sets: 3, reps: 14 },
      { year: 2026, month: 2, loads: [42, 42, 44, 44], sets: 3, reps: 14 },
      { year: 2026, month: 3, loads: [44, 45, 45, 46], sets: 3, reps: 14 },
      { year: 2026, month: 4, loads: [46, 46, 48, 48], sets: 3, reps: 12 },
      { year: 2026, month: 5, loads: [48, 48, 50, 50], sets: 3, reps: 12 },
      { year: 2026, month: 6, loads: [50, 50, 52, 52], sets: 3, reps: 12 },
      { year: 2026, month: 7, loads: [52, 52, 54, 55], sets: 3, reps: 12 },
      { year: 2026, month: 8, loads: [52, 54, 54, 54], sets: 3, reps: 12 },
      { year: 2026, month: 9, loads: [54, 55, 56, 56], sets: 3, reps: 12 },
      { year: 2026, month: 10, loads: [56, 56, 58, 58], sets: 3, reps: 12 },
      { year: 2026, month: 11, loads: [58, 60, 60], sets: 3, reps: 12 },
    ]),
  },
  {
    id: 'gluteo-hip-thrust',
    shortFocus: 'Glúteos',
    muscleGroup: 'Glúteo Máximo',
    exerciseName: 'Hip Thrust na Barra',
    equipment: 'Barra Olímpica + Banco',
    sessions: buildSessionsFromMonthlySeeds([
      { year: 2025, month: 12, loads: [50, 50, 52.5, 52.5], sets: 4, reps: 10 },
      { year: 2026, month: 1, loads: [52.5, 55, 55, 55], sets: 4, reps: 10 },
      { year: 2026, month: 2, loads: [55, 55, 57.5, 57.5], sets: 4, reps: 10 },
      { year: 2026, month: 3, loads: [57.5, 57.5, 60, 60], sets: 4, reps: 10 },
      { year: 2026, month: 4, loads: [60, 60, 62.5, 62.5], sets: 4, reps: 10 },
      { year: 2026, month: 5, loads: [62.5, 62.5, 65, 65], sets: 4, reps: 10 },
      { year: 2026, month: 6, loads: [65, 65, 65, 67.5], sets: 4, reps: 10 },
      { year: 2026, month: 7, loads: [65, 67.5, 67.5, 68], sets: 4, reps: 10 },
      { year: 2026, month: 8, loads: [66, 66, 67.5, 67.5], sets: 4, reps: 10 },
      { year: 2026, month: 9, loads: [67.5, 68, 68, 69], sets: 4, reps: 10 },
      { year: 2026, month: 10, loads: [68, 69, 69, 70], sets: 4, reps: 10 },
      { year: 2026, month: 11, loads: [70, 70, 70], sets: 4, reps: 10 },
    ]),
  },
  {
    id: 'peito-supino',
    shortFocus: 'Peito',
    muscleGroup: 'Peitoral Maior',
    exerciseName: 'Supino Reto com Barra',
    equipment: 'Barra Olímpica + Banco Reto',
    sessions: buildSessionsFromMonthlySeeds([
      { year: 2025, month: 12, loads: [52.5, 52.5, 55, 55], sets: 4, reps: 10 },
      { year: 2026, month: 1, loads: [55, 55, 57.5, 57.5], sets: 4, reps: 10 },
      { year: 2026, month: 2, loads: [57.5, 57.5, 57.5, 60], sets: 4, reps: 10 },
      { year: 2026, month: 3, loads: [60, 60, 60, 62.5], sets: 4, reps: 10 },
      { year: 2026, month: 4, loads: [60, 62.5, 62.5, 62.5], sets: 4, reps: 10 },
      { year: 2026, month: 5, loads: [62.5, 62.5, 65, 65], sets: 4, reps: 10 },
      { year: 2026, month: 6, loads: [65, 65, 65, 66], sets: 4, reps: 10 },
      { year: 2026, month: 7, loads: [65, 66, 67.5, 67.5], sets: 4, reps: 10 },
      { year: 2026, month: 8, loads: [65, 65, 66, 67.5], sets: 4, reps: 10 },
      { year: 2026, month: 9, loads: [67.5, 67.5, 68, 69], sets: 4, reps: 10 },
      { year: 2026, month: 10, loads: [68, 69, 70, 70], sets: 4, reps: 10 },
      { year: 2026, month: 11, loads: [70, 70, 72.5], sets: 4, reps: 10 },
    ]),
  },
  {
    id: 'costas-puxada',
    shortFocus: 'Costas',
    muscleGroup: 'Grande Dorsal',
    exerciseName: 'Puxada Frontal na Polia',
    equipment: 'Polia Alta',
    sessions: buildSessionsFromMonthlySeeds([
      { year: 2025, month: 12, loads: [40, 42.5, 42.5, 45], sets: 4, reps: 11 },
      { year: 2026, month: 1, loads: [45, 45, 45, 47.5], sets: 4, reps: 11 },
      { year: 2026, month: 2, loads: [45, 47.5, 47.5, 47.5], sets: 4, reps: 11 },
      { year: 2026, month: 3, loads: [47.5, 47.5, 50, 50], sets: 4, reps: 11 },
      { year: 2026, month: 4, loads: [50, 50, 52.5, 52.5], sets: 4, reps: 11 },
      { year: 2026, month: 5, loads: [50, 52.5, 52.5, 55], sets: 4, reps: 11 },
      { year: 2026, month: 6, loads: [52.5, 55, 55, 55], sets: 4, reps: 11 },
      { year: 2026, month: 7, loads: [55, 55, 57.5, 57.5], sets: 4, reps: 11 },
      { year: 2026, month: 8, loads: [55, 55, 56, 56], sets: 4, reps: 11 },
      { year: 2026, month: 9, loads: [56, 57.5, 57.5, 59], sets: 4, reps: 11 },
      { year: 2026, month: 10, loads: [57.5, 59, 60, 60], sets: 4, reps: 11 },
      { year: 2026, month: 11, loads: [60, 60, 62.5], sets: 4, reps: 11 },
    ]),
  },
  {
    id: 'posterior-terra',
    shortFocus: 'Posterior',
    muscleGroup: 'Cadeia Posterior & Costas',
    exerciseName: 'Levantamento Terra Convencional',
    equipment: 'Barra Olímpica + Discos',
    sessions: buildSessionsFromMonthlySeeds([
      { year: 2025, month: 12, loads: [65, 67.5, 67.5, 70], sets: 4, reps: 7 },
      { year: 2026, month: 1, loads: [70, 70, 72.5, 72.5], sets: 4, reps: 7 },
      { year: 2026, month: 2, loads: [72.5, 72.5, 75, 75], sets: 4, reps: 7 },
      { year: 2026, month: 3, loads: [75, 75, 77.5, 77.5], sets: 4, reps: 7 },
      { year: 2026, month: 4, loads: [75, 77.5, 80, 80], sets: 4, reps: 7 },
      { year: 2026, month: 5, loads: [77.5, 80, 80, 82.5], sets: 4, reps: 7 },
      { year: 2026, month: 6, loads: [80, 80, 82.5, 82.5], sets: 4, reps: 7 },
      { year: 2026, month: 7, loads: [80, 82.5, 82.5, 85], sets: 4, reps: 7 },
      { year: 2026, month: 8, loads: [80, 82.5, 82.5, 82.5], sets: 4, reps: 7 },
      { year: 2026, month: 9, loads: [82.5, 82.5, 85, 85], sets: 4, reps: 7 },
      { year: 2026, month: 10, loads: [82.5, 85, 85, 85], sets: 4, reps: 7 },
      { year: 2026, month: 11, loads: [85, 85, 87.5], sets: 4, reps: 7 },
    ]),
  },
  {
    id: 'ombros-militar',
    shortFocus: 'Ombros',
    muscleGroup: 'Ombros e Tríceps',
    exerciseName: 'Desenvolvimento Militar com Barra',
    equipment: 'Barra Olímpica',
    sessions: buildSessionsFromMonthlySeeds([
      { year: 2025, month: 12, loads: [27.5, 28, 30, 30], sets: 4, reps: 9 },
      { year: 2026, month: 1, loads: [30, 30, 31, 32], sets: 4, reps: 9 },
      { year: 2026, month: 2, loads: [31, 32, 32, 33], sets: 4, reps: 9 },
      { year: 2026, month: 3, loads: [32, 33, 34, 34], sets: 4, reps: 9 },
      { year: 2026, month: 4, loads: [33, 34, 35, 35], sets: 4, reps: 9 },
      { year: 2026, month: 5, loads: [34, 35, 35, 36], sets: 4, reps: 9 },
      { year: 2026, month: 6, loads: [35, 35, 36, 36], sets: 4, reps: 9 },
      { year: 2026, month: 7, loads: [35, 36, 37, 37.5], sets: 4, reps: 9 },
      { year: 2026, month: 8, loads: [35, 36, 36, 36], sets: 4, reps: 9 },
      { year: 2026, month: 9, loads: [36, 37, 37.5, 38], sets: 4, reps: 9 },
      { year: 2026, month: 10, loads: [37, 38, 38, 38], sets: 4, reps: 9 },
      { year: 2026, month: 11, loads: [38, 38, 40], sets: 4, reps: 9 },
    ]),
  },
];

/**
 * Obtém os exercícios rastreados sincronizando eventuais novos recordes (PRs)
 * registados pelo aluno durante os treinos reais na secção Treino.
 */
export function getTrackedExercisesWithPRSync(): TrackedExerciseEvolution[] {
  const prs = loadPersonalRecords();
  const prMap = new Map(
    prs.map((r) => [r.exercise.trim().toLowerCase(), r])
  );

  return BASE_TRACKED_EXERCISES.map((ex) => {
    const matchedPR = prMap.get(ex.exerciseName.trim().toLowerCase());
    if (!matchedPR) return ex;

    const currentMax = Math.max(...ex.sessions.map((s) => s.loadKg));
    if (matchedPR.bestWeight > currentMax) {
      const updatedSessions = [...ex.sessions];
      const lastIdx = updatedSessions.length - 1;
      if (lastIdx >= 0) {
        updatedSessions[lastIdx] = {
          ...updatedSessions[lastIdx],
          loadKg: matchedPR.bestWeight,
        };
      }
      return { ...ex, sessions: updatedSessions };
    }
    return ex;
  });
}

export interface WorkoutSessionLog {
  isoDate: string; // YYYY-MM-DD
  totalVolumeKg: number; // Volume total levantado na sessão completa (kg)
  exercisesCount: number;
  setsCount: number;
  durationMinutes: number;
}

export interface TrackedWorkoutEvolution {
  id: string;
  shortName: string;
  category: 'Membros Inferiores' | 'Membros Superiores' | 'Corpo Inteiro';
  muscleGroups: string;
  exercisesCount: number;
  avgDurationMin: number;
  sessions: WorkoutSessionLog[];
}

interface WorkoutMonthlySeed {
  year: number;
  month: number; // 1..12
  volumesKg: number[];
  exercisesCount: number;
  setsCount: number;
  durationMinutes: number;
}

function buildWorkoutSessionsFromSeeds(
  seeds: WorkoutMonthlySeed[]
): WorkoutSessionLog[] {
  const logs: WorkoutSessionLog[] = [];
  for (const seed of seeds) {
    const days =
      seed.volumesKg.length === 4
        ? [3, 10, 17, 24]
        : seed.volumesKg.length === 3
          ? [4, 14, 23]
          : [6, 20];

    seed.volumesKg.forEach((vol, idx) => {
      const day = Math.min(28, days[idx] ?? 8 + idx * 7);
      const mm = String(seed.month).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      logs.push({
        isoDate: `${seed.year}-${mm}-${dd}`,
        totalVolumeKg: vol,
        exercisesCount: seed.exercisesCount,
        setsCount: seed.setsCount,
        durationMinutes: seed.durationMinutes,
      });
    });
  }
  return logs.sort((a, b) => a.isoDate.localeCompare(b.isoDate));
}

const BASE_TRACKED_WORKOUTS: TrackedWorkoutEvolution[] = [
  {
    id: 'workout-gluteo-quads',
    shortName: 'Glúteo & Quads',
    category: 'Membros Inferiores',
    muscleGroups: 'Glúteo Máximo, Médio e Quadríceps',
    exercisesCount: 5,
    avgDurationMin: 58,
    sessions: buildWorkoutSessionsFromSeeds([
      { year: 2025, month: 12, volumesKg: [7600, 7750, 7900, 8050], exercisesCount: 5, setsCount: 18, durationMinutes: 60 },
      { year: 2026, month: 1, volumesKg: [8100, 8250, 8400, 8550], exercisesCount: 5, setsCount: 18, durationMinutes: 59 },
      { year: 2026, month: 2, volumesKg: [8500, 8700, 8850, 8950], exercisesCount: 5, setsCount: 18, durationMinutes: 58 },
      { year: 2026, month: 3, volumesKg: [8900, 9100, 9200, 9350], exercisesCount: 5, setsCount: 19, durationMinutes: 60 },
      { year: 2026, month: 4, volumesKg: [9300, 9450, 9600, 9750], exercisesCount: 5, setsCount: 19, durationMinutes: 58 },
      { year: 2026, month: 5, volumesKg: [9700, 9850, 10050, 10200], exercisesCount: 5, setsCount: 19, durationMinutes: 57 },
      { year: 2026, month: 6, volumesKg: [10100, 10250, 10400, 10550], exercisesCount: 5, setsCount: 20, durationMinutes: 59 },
      { year: 2026, month: 7, volumesKg: [10450, 10600, 10750, 10900], exercisesCount: 5, setsCount: 20, durationMinutes: 58 },
      { year: 2026, month: 8, volumesKg: [10500, 10650, 10700, 10800], exercisesCount: 5, setsCount: 19, durationMinutes: 56 },
      { year: 2026, month: 9, volumesKg: [10850, 10950, 11100, 11200], exercisesCount: 5, setsCount: 20, durationMinutes: 58 },
      { year: 2026, month: 10, volumesKg: [11150, 11300, 11400, 11550], exercisesCount: 5, setsCount: 20, durationMinutes: 57 },
      { year: 2026, month: 11, volumesKg: [11500, 11700, 11900], exercisesCount: 5, setsCount: 20, durationMinutes: 58 },
    ]),
  },
  {
    id: 'workout-superiores-costas',
    shortName: 'Superiores & Costas',
    category: 'Membros Superiores',
    muscleGroups: 'Dorsais, Deltoides e Bíceps',
    exercisesCount: 6,
    avgDurationMin: 54,
    sessions: buildWorkoutSessionsFromSeeds([
      { year: 2025, month: 12, volumesKg: [5400, 5550, 5650, 5800], exercisesCount: 6, setsCount: 20, durationMinutes: 56 },
      { year: 2026, month: 1, volumesKg: [5800, 5950, 6050, 6150], exercisesCount: 6, setsCount: 20, durationMinutes: 55 },
      { year: 2026, month: 2, volumesKg: [6100, 6250, 6350, 6450], exercisesCount: 6, setsCount: 20, durationMinutes: 54 },
      { year: 2026, month: 3, volumesKg: [6400, 6550, 6700, 6800], exercisesCount: 6, setsCount: 21, durationMinutes: 55 },
      { year: 2026, month: 4, volumesKg: [6750, 6900, 7000, 7100], exercisesCount: 6, setsCount: 21, durationMinutes: 54 },
      { year: 2026, month: 5, volumesKg: [7050, 7200, 7350, 7450], exercisesCount: 6, setsCount: 21, durationMinutes: 53 },
      { year: 2026, month: 6, volumesKg: [7350, 7500, 7600, 7700], exercisesCount: 6, setsCount: 22, durationMinutes: 55 },
      { year: 2026, month: 7, volumesKg: [7650, 7750, 7850, 7950], exercisesCount: 6, setsCount: 22, durationMinutes: 54 },
      { year: 2026, month: 8, volumesKg: [7600, 7700, 7750, 7800], exercisesCount: 6, setsCount: 21, durationMinutes: 52 },
      { year: 2026, month: 9, volumesKg: [7850, 7950, 8050, 8150], exercisesCount: 6, setsCount: 22, durationMinutes: 54 },
      { year: 2026, month: 10, volumesKg: [8100, 8200, 8300, 8400], exercisesCount: 6, setsCount: 22, durationMinutes: 54 },
      { year: 2026, month: 11, volumesKg: [8350, 8500, 8650], exercisesCount: 6, setsCount: 22, durationMinutes: 53 },
    ]),
  },
  {
    id: 'workout-posteriores-gluteo',
    shortName: 'Posteriores & Glúteo',
    category: 'Membros Inferiores',
    muscleGroups: 'Isquiotibiais, Glúteo e Gémeos',
    exercisesCount: 6,
    avgDurationMin: 59,
    sessions: buildWorkoutSessionsFromSeeds([
      { year: 2025, month: 12, volumesKg: [6900, 7050, 7200, 7350], exercisesCount: 6, setsCount: 20, durationMinutes: 60 },
      { year: 2026, month: 1, volumesKg: [7300, 7450, 7600, 7750], exercisesCount: 6, setsCount: 20, durationMinutes: 59 },
      { year: 2026, month: 2, volumesKg: [7700, 7850, 8000, 8150], exercisesCount: 6, setsCount: 20, durationMinutes: 59 },
      { year: 2026, month: 3, volumesKg: [8100, 8250, 8400, 8550], exercisesCount: 6, setsCount: 21, durationMinutes: 60 },
      { year: 2026, month: 4, volumesKg: [8500, 8650, 8800, 8950], exercisesCount: 6, setsCount: 21, durationMinutes: 58 },
      { year: 2026, month: 5, volumesKg: [8850, 9000, 9150, 9300], exercisesCount: 6, setsCount: 21, durationMinutes: 58 },
      { year: 2026, month: 6, volumesKg: [9200, 9350, 9500, 9650], exercisesCount: 6, setsCount: 22, durationMinutes: 60 },
      { year: 2026, month: 7, volumesKg: [9550, 9700, 9850, 10000], exercisesCount: 6, setsCount: 22, durationMinutes: 59 },
      { year: 2026, month: 8, volumesKg: [9600, 9700, 9800, 9850], exercisesCount: 6, setsCount: 21, durationMinutes: 57 },
      { year: 2026, month: 9, volumesKg: [9900, 10050, 10150, 10300], exercisesCount: 6, setsCount: 22, durationMinutes: 59 },
      { year: 2026, month: 10, volumesKg: [10200, 10350, 10500, 10600], exercisesCount: 6, setsCount: 22, durationMinutes: 58 },
      { year: 2026, month: 11, volumesKg: [10550, 10750, 10950], exercisesCount: 6, setsCount: 22, durationMinutes: 59 },
    ]),
  },
  {
    id: 'workout-peito-triceps',
    shortName: 'Peito & Tríceps',
    category: 'Membros Superiores',
    muscleGroups: 'Peitoral, Tríceps e Ombro Anterior',
    exercisesCount: 5,
    avgDurationMin: 50,
    sessions: buildWorkoutSessionsFromSeeds([
      { year: 2025, month: 12, volumesKg: [4800, 4950, 5050, 5200], exercisesCount: 5, setsCount: 18, durationMinutes: 52 },
      { year: 2026, month: 1, volumesKg: [5150, 5300, 5400, 5500], exercisesCount: 5, setsCount: 18, durationMinutes: 51 },
      { year: 2026, month: 2, volumesKg: [5450, 5600, 5700, 5800], exercisesCount: 5, setsCount: 18, durationMinutes: 50 },
      { year: 2026, month: 3, volumesKg: [5750, 5900, 6000, 6100], exercisesCount: 5, setsCount: 19, durationMinutes: 51 },
      { year: 2026, month: 4, volumesKg: [6050, 6150, 6250, 6400], exercisesCount: 5, setsCount: 19, durationMinutes: 50 },
      { year: 2026, month: 5, volumesKg: [6350, 6450, 6600, 6700], exercisesCount: 5, setsCount: 19, durationMinutes: 49 },
      { year: 2026, month: 6, volumesKg: [6650, 6750, 6850, 6950], exercisesCount: 5, setsCount: 19, durationMinutes: 50 },
      { year: 2026, month: 7, volumesKg: [6900, 7000, 7100, 7200], exercisesCount: 5, setsCount: 20, durationMinutes: 50 },
      { year: 2026, month: 8, volumesKg: [6850, 6950, 7000, 7050], exercisesCount: 5, setsCount: 19, durationMinutes: 48 },
      { year: 2026, month: 9, volumesKg: [7100, 7200, 7300, 7400], exercisesCount: 5, setsCount: 20, durationMinutes: 50 },
      { year: 2026, month: 10, volumesKg: [7350, 7450, 7550, 7650], exercisesCount: 5, setsCount: 20, durationMinutes: 49 },
      { year: 2026, month: 11, volumesKg: [7600, 7750, 7900], exercisesCount: 5, setsCount: 20, durationMinutes: 50 },
    ]),
  },
  {
    id: 'workout-full-body-core',
    shortName: 'Full Body & Core',
    category: 'Corpo Inteiro',
    muscleGroups: 'Corpo Inteiro, Abdómen e Lombar',
    exercisesCount: 7,
    avgDurationMin: 62,
    sessions: buildWorkoutSessionsFromSeeds([
      { year: 2025, month: 12, volumesKg: [6200, 6350, 6500, 6650], exercisesCount: 7, setsCount: 22, durationMinutes: 64 },
      { year: 2026, month: 1, volumesKg: [6600, 6750, 6900, 7050], exercisesCount: 7, setsCount: 22, durationMinutes: 63 },
      { year: 2026, month: 2, volumesKg: [7000, 7150, 7250, 7400], exercisesCount: 7, setsCount: 22, durationMinutes: 62 },
      { year: 2026, month: 3, volumesKg: [7350, 7500, 7650, 7800], exercisesCount: 7, setsCount: 23, durationMinutes: 63 },
      { year: 2026, month: 4, volumesKg: [7700, 7850, 8000, 8150], exercisesCount: 7, setsCount: 23, durationMinutes: 62 },
      { year: 2026, month: 5, volumesKg: [8050, 8200, 8350, 8500], exercisesCount: 7, setsCount: 23, durationMinutes: 61 },
      { year: 2026, month: 6, volumesKg: [8400, 8550, 8700, 8800], exercisesCount: 7, setsCount: 24, durationMinutes: 62 },
      { year: 2026, month: 7, volumesKg: [8700, 8850, 8950, 9100], exercisesCount: 7, setsCount: 24, durationMinutes: 62 },
      { year: 2026, month: 8, volumesKg: [8650, 8750, 8850, 8900], exercisesCount: 7, setsCount: 23, durationMinutes: 60 },
      { year: 2026, month: 9, volumesKg: [8950, 9050, 9200, 9300], exercisesCount: 7, setsCount: 24, durationMinutes: 62 },
      { year: 2026, month: 10, volumesKg: [9200, 9350, 9450, 9600], exercisesCount: 7, setsCount: 24, durationMinutes: 61 },
      { year: 2026, month: 11, volumesKg: [9550, 9700, 9850], exercisesCount: 7, setsCount: 24, durationMinutes: 62 },
    ]),
  },
];

export function getTrackedWorkoutsEvolution(): TrackedWorkoutEvolution[] {
  return BASE_TRACKED_WORKOUTS;
}
