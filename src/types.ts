export interface Student {
  name: string;
  avatarUrl?: string;
}

export interface StudentProfile {
  name: string;
  avatarUrl: string;
  memberSince: string;
  membershipId: string;
  renewal: {
    daysRemaining: number;
    date: string;
    status: 'active' | 'warning' | 'expired';
  };
  assessment: {
    daysRemaining: number;
    date: string;
    trainer: string;
    type: string;
  };
  subscription: {
    planName: string;
    status: 'Ativa' | 'Pendente' | 'Cancelada';
    price: string;
    billingCycle: string;
    nextBillingDate: string;
    accessUntil?: string;
    paymentMethod: string;
    startDate?: string;
    cancellationReason?: string;
    cancellationNotes?: string;
    cancelledAt?: string;
    isExpiredSimulated?: boolean;
    perks: string[];
  };
}

export interface GymClass {
  id: string;
  name: string;
  instructor: string;
  time: string;
  day: string;
  room: string;
  duration: string;
  booked: boolean;
  spotsLeft: number;
  category: 'HIIT' | 'Força' | 'Mobilidade' | 'Cardio';
}

export interface MedicalExam {
  id: string;
  title: string;
  date: string;
  doctorOrTrainer: string;
  summary: string;
  metrics: {
    label: string;
    value: string;
    change?: string;
  }[];
}

export type CheckInStatus = 'completed' | 'missed' | 'pending' | 'future';

export interface DailyCheckIn {
  id: string;
  date: Date;
  status: CheckInStatus;
  dayName: string; // e.g., "Seg", "Ter"
  dayNumber: number; // e.g., 12, 13
}

export interface WeeklySummary {
  workoutsDone: number;
  workoutsPlanned: number;
  goalProgressPercent: number;
}

export interface Workout {
  id: string;
  name: string;
  type: string;
  muscleGroups: string[];
  durationMinutes: number;
  intensity: 'Baixa' | 'Média' | 'Alta';
  imageUrl?: string;
}

export interface Goal {
  title: string;
  progressPercent: number;
  targetDate: Date;
}

export interface DashboardObjective {
  title?: string;
  endDate?: string; // YYYY-MM-DD
}

export interface DashboardStrategy {
  name?: string;
  description?: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  weekDirection?: 'up' | 'down'; // 'up' = a subir (default), 'down' = a descer
}

export interface GoalStrategyData {
  objective?: DashboardObjective | null;
  strategy?: DashboardStrategy | null;
}

export interface Indicator {
  id: string;
  type: 'water' | 'steps' | 'weight';
  label: string;
  currentValue: number;
  targetValue?: number;
  unit: string;
  history?: number; // for weight evolution
}

export type NotificationCategory = 'Todos' | 'Avaliação' | 'Motivação' | 'Dicas' | 'Informações';

export interface AppNotification {
  id: string;
  category: 'Avaliação' | 'Motivação' | 'Dicas' | 'Informações';
  title: string;
  shortDescription: string;
  fullContent?: string;
  timestamp: string; // e.g. "Hoje, 10:30"
  createdAt: string; // ISO format for chronological sorting
  read: boolean;
  iconType: 'assessment' | 'motivation' | 'goal' | 'water' | 'tip' | 'congrats' | 'info';
  actionLabel?: string;
  targetTab?: 'agenda' | 'dieta' | 'evolucao' | 'treino' | 'home';
}

export interface ChatMessage {
  id: string;
  sender: 'coach' | 'student';
  text?: string;
  imageUrl?: string;
  audioDurationSeconds?: number;
  timestamp: string; // e.g. "10:24"
  dateLabel: string; // e.g. "Hoje", "Ontem", "Segunda-feira"
  createdAt: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
}

export interface CoachInfo {
  name: string;
  role: string;
  avatarUrl: string;
  status: string;
  phone: string;
  club: string;
}

export interface CardioSession {
  id: string;
  date: string; // YYYY-MM-DD
  time: string;
  durationMinutes: number;
  equipment: string;
  speed: number;
  incline: number;
  calories: number;
  avgBpm: number;
  distanceKm?: number;
  notes?: string;
  periodLabel: string;
}

export interface CardioConfig {
  equipment: string;
  speed: number;
  incline: number;
  targetMinutesPerDay: number;
}

export type ClassCategory = 'Treino' | 'Mobilidade' | 'Yoga' | 'Pilates';

export interface RecordedClass {
  id: string;
  title: string;
  instructor: string;
  instructorRole?: string;
  category: ClassCategory;
  duration: string;
  level: 'Iniciante' | 'Intermédio' | 'Avançado';
  description: string;
  videoUrl?: string;
  thumbnailUrl: string;
  progressPercent: number; // 0 to 100
  isFavorite: boolean;
  completed: boolean;
  caloriesBurn?: number;
}

export type EducationalCategory = 'Dicas' | 'Ebooks' | 'Vídeos' | 'Receitas';

export interface EducationalContent {
  id: string;
  title: string;
  category: EducationalCategory;
  summary: string;
  format: string; // e.g. "Ebook • 24 pág" | "Vídeo • 14 min" | "Dica • 3 min"
  duration: string;
  isNew: boolean;
  thumbnailUrl: string;
  fullText?: string;
  videoUrl?: string;
  pdfPages?: string[];
  pdfDownloadName?: string;
  recipeData?: {
    prepTime: string;
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
    ingredients: string[];
    steps: string[];
  };
}

export interface ReferralInvite {
  id: string;
  name: string;
  phoneOrEmail: string;
  date: string;
  status: 'Enviado' | 'Aderiu' | 'Recompensa Atribuída';
  rewardEarned?: string;
}

export interface DailyLogEntry {
  dayId: string;
  dayName: string;
  dateStr: string;
  weight: number;
  workoutDone: boolean;
  workoutName?: string;
  sleepHours: number;
  sleepQuality: 'Excelente' | 'Bom' | 'Regular' | 'Mau';
  dietAdherencePercent: number;
  steps: number;
  waterLiters: number;
}

export interface AssessmentSubmission {
  id: string;
  date: string;
  isoDate?: string;
  label?: string;
  trainer: string;
  weight: number;
  measurements: {
    peito: number;
    braco: number;
    cintura: number;
    quadril: number;
    coxa: number;
  };
  photos: {
    front?: string;
    back?: string;
    side?: string;
  };
  questionnaire: {
    energyLevel: number; // 1-5
    muscleSoreness: 'Baixa' | 'Média' | 'Alta';
    dietCompliance: '100% à risca' | 'Maioritariamente' | 'Com deslizes';
    sleepRest: 'Muito reparador' | 'Aceitável' | 'Insuficiente';
    notes: string;
  };
}

