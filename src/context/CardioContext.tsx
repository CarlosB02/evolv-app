import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CardioSession, CardioConfig } from '../types';

interface WeekDayItem {
  dateStr: string;
  dayShort: string; // SEG, TER, etc.
  dayNum: string;   // 05, 06, etc.
  isToday: boolean;
}

interface CardioContextType {
  sessions: CardioSession[];
  config: CardioConfig;
  selectedDate: string;
  setSelectedDate: (dateStr: string) => void;
  weekDays: WeekDayItem[];
  addSession: (session: Omit<CardioSession, 'id'>) => CardioSession;
  updateSession: (id: string, partial: Partial<CardioSession>) => void;
  deleteSession: (id: string) => void;
  updateConfig: (newConfig: Partial<CardioConfig>) => void;
  saveDayRecord: (dateStr: string) => boolean;
  
  // Dynamic metrics
  selectedDayMinutes: number;
  selectedDaySessions: CardioSession[];
  todayMinutes: number;
  todaySessionsCount: number;
  weekMinutes: number;
  weekWorkoutsCount: number;
  monthMinutes: number;
  monthWorkoutsCount: number;
}

const CardioContext = createContext<CardioContextType | undefined>(undefined);

// Helper to format Date to YYYY-MM-DD
export function formatDateISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const dayNamesPT = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

// Generate Monday to Sunday for current week
function getDaysOfCurrentWeek(): WeekDayItem[] {
  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday
  const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  
  const monday = new Date(now);
  monday.setDate(now.getDate() + distanceToMonday);

  const days: WeekDayItem[] = [];
  const todayISO = formatDateISO(now);

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const iso = formatDateISO(d);
    days.push({
      dateStr: iso,
      dayShort: dayNamesPT[d.getDay()],
      dayNum: String(d.getDate()).padStart(2, '0'),
      isToday: iso === todayISO,
    });
  }
  return days;
}

// Initial mock sessions
function getInitialSessions(): CardioSession[] {
  const now = new Date();
  const todayISO = formatDateISO(now);
  
  // Calculate 2 days ago (Tuesday if today is Thursday)
  const twoDaysAgo = new Date(now);
  twoDaysAgo.setDate(now.getDate() - 2);
  const twoDaysAgoISO = formatDateISO(twoDaysAgo);

  // Past dates for month history
  const pastSessions: CardioSession[] = [];
  
  // 13 sessions earlier this month
  for (let i = 4; i <= 16; i++) {
    const pastDate = new Date(now);
    pastDate.setDate(now.getDate() - i);
    const pastISO = formatDateISO(pastDate);
    pastSessions.push({
      id: `past-${i}`,
      date: pastISO,
      time: i % 2 === 0 ? '08:45' : '18:15',
      durationMinutes: 40 + ((i * 3) % 15),
      equipment: i % 3 === 0 ? 'Bicicleta Estática' : i % 2 === 0 ? 'Passadeira' : 'Elíptica',
      speed: 8.0,
      incline: 2.0,
      calories: 320,
      avgBpm: 138,
      distanceKm: 5.2,
      notes: 'Sessão regular de manutenção de capacidade aeróbica.',
      periodLabel: i % 2 === 0 ? 'Manhã' : 'Fim da tarde'
    });
  }

  return [
    {
      id: 'session-today',
      date: todayISO,
      time: '09:15',
      durationMinutes: 45,
      equipment: 'Passadeira',
      speed: 8.5,
      incline: 2.5,
      calories: 360,
      avgBpm: 142,
      distanceKm: 6.4,
      notes: 'Ritmo contínuo em zona 2/3 com inclinação moderada. Excelente resposta cardíaca e sensação de recuperação.',
      periodLabel: 'Manhã (Pós-treino)',
    },
    {
      id: 'session-tuesday',
      date: twoDaysAgoISO,
      time: '18:30',
      durationMinutes: 40,
      equipment: 'Bicicleta Estática',
      speed: 24.0,
      incline: 0.0,
      calories: 310,
      avgBpm: 136,
      distanceKm: 16.0,
      notes: 'Cardio regenerativo pós perna. Manter cadência em 85 RPM.',
      periodLabel: 'Fim do dia',
    },
    ...pastSessions,
  ];
}

const defaultCardioConfig: CardioConfig = {
  equipment: 'Passadeira Profissional',
  speed: 8.5,
  incline: 2.5,
  targetMinutesPerDay: 60,
};

export function CardioProvider({ children }: { children: ReactNode }) {
  const currentWeekDays = getDaysOfCurrentWeek();
  const todayISO = formatDateISO(new Date());

  const [selectedDate, setSelectedDate] = useState<string>(todayISO);

  const [sessions, setSessions] = useState<CardioSession[]>(() => {
    const saved = localStorage.getItem('pr1me_cardio_sessions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return getInitialSessions();
      }
    }
    return getInitialSessions();
  });

  const [config, setConfig] = useState<CardioConfig>(() => {
    const saved = localStorage.getItem('pr1me_cardio_config');
    if (saved) {
      try {
        return { ...defaultCardioConfig, ...JSON.parse(saved) };
      } catch {
        return defaultCardioConfig;
      }
    }
    return defaultCardioConfig;
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('pr1me_cardio_sessions', JSON.stringify(sessions));
    } catch {
      // ignore
    }
  }, [sessions]);

  useEffect(() => {
    try {
      localStorage.setItem('pr1me_cardio_config', JSON.stringify(config));
    } catch {
      // ignore
    }
  }, [config]);

  const addSession = (sessionData: Omit<CardioSession, 'id'>) => {
    const newSession: CardioSession = {
      ...sessionData,
      id: `cardio-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setSessions((prev) => [newSession, ...prev]);
    return newSession;
  };

  const updateSession = (id: string, partial: Partial<CardioSession>) => {
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, ...partial } : s)));
  };

  const deleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  const updateConfig = (newConfig: Partial<CardioConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  const saveDayRecord = (_dateStr: string) => {
    // Explicit trigger to save and confirm
    try {
      localStorage.setItem('pr1me_cardio_sessions', JSON.stringify(sessions));
      localStorage.setItem('pr1me_cardio_config', JSON.stringify(config));
      return true;
    } catch {
      return false;
    }
  };

  // Metrics for selected day
  const selectedDaySessions = sessions.filter((s) => s.date === selectedDate);
  const selectedDayMinutes = selectedDaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  // Metrics for Today
  const todaySessions = sessions.filter((s) => s.date === todayISO);
  const todayMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const todaySessionsCount = todaySessions.length;

  // Metrics for Current Week
  const weekDateStrings = currentWeekDays.map((d) => d.dateStr);
  const weekSessions = sessions.filter((s) => weekDateStrings.includes(s.date));
  const weekMinutes = weekSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  // Count unique days or total sessions: count of sessions
  const weekWorkoutsCount = weekSessions.length;

  // Metrics for Current Month
  const currentYearMonth = selectedDate.substring(0, 7); // YYYY-MM
  const monthSessions = sessions.filter((s) => s.date.startsWith(currentYearMonth));
  const monthMinutes = monthSessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const monthWorkoutsCount = monthSessions.length;

  return (
    <CardioContext.Provider
      value={{
        sessions,
        config,
        selectedDate,
        setSelectedDate,
        weekDays: currentWeekDays,
        addSession,
        updateSession,
        deleteSession,
        updateConfig,
        saveDayRecord,
        selectedDayMinutes,
        selectedDaySessions,
        todayMinutes,
        todaySessionsCount,
        weekMinutes,
        weekWorkoutsCount,
        monthMinutes,
        monthWorkoutsCount,
      }}
    >
      {children}
    </CardioContext.Provider>
  );
}

export function useCardio() {
  const context = useContext(CardioContext);
  if (!context) {
    throw new Error('useCardio must be used within a CardioProvider');
  }
  return context;
}
