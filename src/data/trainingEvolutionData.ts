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
