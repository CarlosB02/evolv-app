import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  BarChart3,
  Bell,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Dumbbell,
  Plus,
  Repeat,
  Timer,
  Trophy,
  User,
} from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { useNotifications } from '../context/NotificationContext';
import { useCardio } from '../context/CardioContext';
import { useDailyCheckIn } from '../context/DailyCheckInContext';
import {
  AgendaEvent,
  MONTHS_PT,
  MONTHS_SHORT_PT,
  WEEKDAYS_PT,
  doesEventOccurOnDate,
  formatFullDatePT,
  formatShortDatePT,
  getAlertLabel,
  getEventBgClass,
  getInitialAgendaEvents,
  getRepeatLabel,
  parseISODateLocal,
  toISODateLocal,
} from '../components/agenda/agendaTypes';
import { AgendaEventModal } from '../components/agenda/AgendaEventModal';

const STORAGE_EVENTS_KEY = 'evolv_agenda_events_v1';

interface CalendarCell {
  iso: string;
  day: number;
  inCurrentMonth: boolean;
}

function buildMonthGrid(year: number, month: number): CalendarCell[] {
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay(); // 0 = Dom
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: CalendarCell[] = [];

  // Dias finais do mês anterior
  for (let i = startWeekday - 1; i >= 0; i -= 1) {
    const day = daysInPrevMonth - i;
    const dt = new Date(year, month - 1, day);
    cells.push({
      iso: toISODateLocal(dt),
      day,
      inCurrentMonth: false,
    });
  }

  // Dias do mês atual
  for (let day = 1; day <= daysInMonth; day += 1) {
    const dt = new Date(year, month, day);
    cells.push({
      iso: toISODateLocal(dt),
      day,
      inCurrentMonth: true,
    });
  }

  // Completar a última semana com dias iniciais do mês seguinte
  const remainder = cells.length % 7;
  if (remainder !== 0) {
    const needed = 7 - remainder;
    for (let day = 1; day <= needed; day += 1) {
      const dt = new Date(year, month + 1, day);
      cells.push({
        iso: toISODateLocal(dt),
        day,
        inCurrentMonth: false,
      });
    }
  }

  return cells;
}

export function Agenda() {
  const { openProfile } = useProfile();
  const { openNotifications, totalUnreadCount } = useNotifications();
  const {
    sessions: cardioSessions,
    weekWorkoutsCount: cardioWeekCount,
    monthWorkoutsCount: cardioMonthCount,
  } = useCardio();
  const { todayISO, recordsByDate, weeklyWorkoutsCount } = useDailyCheckIn();

  const todayDate = useMemo(() => parseISODateLocal(todayISO), [todayISO]);

  const [viewYear, setViewYear] = useState<number>(() => todayDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(() => todayDate.getMonth());
  const [selectedDateISO, setSelectedDateISO] = useState<string>(todayISO);

  const [events, setEvents] = useState<AgendaEvent[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_EVENTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fallback para eventos iniciais
    }
    return getInitialAgendaEvents(todayISO);
  });

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AgendaEvent | null>(null);
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const monthPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMonthPickerOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (
        monthPickerRef.current &&
        !monthPickerRef.current.contains(e.target as Node)
      ) {
        setIsMonthPickerOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMonthPickerOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isMonthPickerOpen]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_EVENTS_KEY, JSON.stringify(events));
    } catch {
      // Ignorar erro de quota
    }
  }, [events]);

  // Métricas reais de Treinos (Semana / Mês / Total)
  const trainingStats = useMemo(() => {
    const currentYearMonth = todayISO.substring(0, 7);
    let monthCount = 0;
    let recordedTotal = 0;

    for (const dateKey of Object.keys(recordsByDate)) {
      const rec = recordsByDate[dateKey];
      if (rec?.trained === 'sim') {
        recordedTotal += 1;
        if (rec.date.startsWith(currentYearMonth)) {
          monthCount += 1;
        }
      }
    }

    return {
      week: weeklyWorkoutsCount,
      month: monthCount,
      total: 112 + recordedTotal,
    };
  }, [recordsByDate, todayISO, weeklyWorkoutsCount]);

  // Métricas reais de Cardio (Semana / Mês / Total)
  const cardioStats = useMemo(() => {
    return {
      week: cardioWeekCount,
      month: cardioMonthCount,
      total: cardioSessions.length,
    };
  }, [cardioWeekCount, cardioMonthCount, cardioSessions.length]);

  const calendarCells = useMemo(
    () => buildMonthGrid(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  // Mapa de cores de eventos por dia visível no calendário (até 3 pontos)
  const eventColorsByDate = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const cell of calendarCells) {
      const colors: string[] = [];
      for (const evt of events) {
        if (doesEventOccurOnDate(evt, cell.iso)) {
          if (!colors.includes(evt.color)) {
            colors.push(evt.color);
          }
          if (colors.length >= 3) break;
        }
      }
      if (colors.length > 0) {
        map[cell.iso] = colors;
      }
    }
    return map;
  }, [calendarCells, events]);

  // Eventos do dia selecionado (todo o dia primeiro, depois ordenados por hora)
  const selectedDayEvents = useMemo(() => {
    return events
      .filter((evt) => doesEventOccurOnDate(evt, selectedDateISO))
      .sort((a, b) => {
        if (a.allDay && !b.allDay) return -1;
        if (!a.allDay && b.allDay) return 1;
        return a.startTime.localeCompare(b.startTime);
      });
  }, [events, selectedDateISO]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectCell = (cell: CalendarCell) => {
    setSelectedDateISO(cell.iso);
    if (!cell.inCurrentMonth) {
      const dt = parseISODateLocal(cell.iso);
      setViewYear(dt.getFullYear());
      setViewMonth(dt.getMonth());
    }
  };

  const handleJumpToday = () => {
    setViewYear(todayDate.getFullYear());
    setViewMonth(todayDate.getMonth());
    setSelectedDateISO(todayISO);
  };

  const handleOpenAddEvent = () => {
    setEditingEvent(null);
    setIsEventModalOpen(true);
  };

  const handleOpenEditEvent = (evt: AgendaEvent) => {
    setEditingEvent(evt);
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = (
    eventData: Omit<AgendaEvent, 'id'>,
    existingId?: string
  ) => {
    if (existingId) {
      setEvents((prev) =>
        prev.map((evt) =>
          evt.id === existingId ? { ...eventData, id: existingId } : evt
        )
      );
    } else {
      const newEvt: AgendaEvent = {
        ...eventData,
        id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      };
      setEvents((prev) => [...prev, newEvt]);
    }

    // Atualizar o dia e mês selecionados para a data de início do evento guardado
    if (eventData.startDate) {
      const startDt = parseISODateLocal(eventData.startDate);
      setSelectedDateISO(eventData.startDate);
      setViewYear(startDt.getFullYear());
      setViewMonth(startDt.getMonth());
    }
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((evt) => evt.id !== id));
  };

  const isViewingTodayMonth =
    viewYear === todayDate.getFullYear() &&
    viewMonth === todayDate.getMonth();

  return (
    <>
      {/* HEADER */}
      <header className="flex justify-between items-center px-5 pt-[max(0.75rem,env(safe-area-inset-top))] sm:pt-8 pb-3 bg-black/90 backdrop-blur-xl sticky top-0 z-30 border-b border-zinc-900">
        <div className="flex items-center gap-3">
          <img
            src="/assets/aistudio/9CF5FBD1-65BF-4557-BF19-1F1A5C3032B1_b4e3ad3d.PNG"
            alt="EVOLV"
            className="w-10 h-10 object-contain shrink-0"
          />
          <p className="text-white text-sm font-bold tracking-wider leading-tight">
            EVOLV
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => openNotifications('geral')}
            className="relative text-orange-500 transition-transform hover:scale-110 cursor-pointer"
            aria-label="Notificações"
            title="Abrir Notificações"
          >
            <Bell className="w-[22px] h-[22px]" strokeWidth={2} />
            {totalUnreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-[#0a0a0a] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-black animate-pulse">
                {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
              </span>
            )}
          </button>
          <button
            onClick={openProfile}
            className="relative text-orange-500 transition-transform hover:scale-110 cursor-pointer"
            aria-label="Perfil"
            title="Abrir Perfil"
          >
            <User className="w-[22px] h-[22px]" strokeWidth={2} />
          </button>
        </div>
      </header>

      <div className="flex flex-col px-5 pt-4 pb-6 animate-in fade-in duration-200">
        {/* 1. BLOCO DE ESTATÍSTICAS: TREINOS & CARDIO (SEMANA / MÊS / TOTAL) */}
        <section className="bg-[#0a0a0a] rounded-[20px] p-4 mb-4 border border-zinc-800/60 space-y-3.5">
          {/* Treinos */}
          <div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <Dumbbell className="w-3.5 h-3.5 text-[#F77F00] shrink-0" />
              <span className="text-xs font-bold text-zinc-200 tracking-wide">
                Treinos
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-zinc-900/40 rounded-xl p-2.5 border border-zinc-800/40 flex items-center justify-center gap-1.5">
                <Timer
                  className="text-[#F77F00] w-[17px] h-[17px] shrink-0"
                  strokeWidth={2}
                />
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-zinc-500 text-[8.5px] uppercase tracking-wider font-semibold leading-tight">
                    Semana
                  </span>
                  <div className="text-white font-bold text-xs leading-tight tabular-nums mt-0.5 whitespace-nowrap">
                    {trainingStats.week}
                    <span className="text-zinc-500 text-[9px] font-normal ml-0.5">
                      / Sem
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/40 rounded-xl p-2.5 border border-zinc-800/40 flex items-center justify-center gap-1.5">
                <Calendar
                  className="text-[#F77F00] w-[17px] h-[17px] shrink-0"
                  strokeWidth={2}
                />
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-zinc-500 text-[8.5px] uppercase tracking-wider font-semibold leading-tight">
                    Mês
                  </span>
                  <div className="text-white font-bold text-xs leading-tight tabular-nums mt-0.5 whitespace-nowrap">
                    {trainingStats.month}
                    <span className="text-zinc-500 text-[9px] font-normal ml-0.5">
                      / Mês
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/40 rounded-xl p-2.5 border border-zinc-800/40 flex items-center justify-center gap-1.5">
                <Trophy
                  className="text-[#F77F00] w-[17px] h-[17px] shrink-0"
                  strokeWidth={2}
                />
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-zinc-500 text-[8.5px] uppercase tracking-wider font-semibold leading-tight">
                    Total
                  </span>
                  <div className="text-white font-bold text-xs leading-tight tabular-nums mt-0.5 whitespace-nowrap">
                    {trainingStats.total}
                    <span className="text-zinc-500 text-[9px] font-normal ml-0.5">
                      / Tot
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cardio */}
          <div className="pt-3.5 border-t border-zinc-800/60">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Activity className="w-3.5 h-3.5 text-[#F77F00] shrink-0" />
              <span className="text-xs font-bold text-zinc-200 tracking-wide">
                Cardio
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-zinc-900/40 rounded-xl p-2.5 border border-zinc-800/40 flex items-center justify-center gap-1.5">
                <Timer
                  className="text-[#F77F00] w-[17px] h-[17px] shrink-0"
                  strokeWidth={2}
                />
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-zinc-500 text-[8.5px] uppercase tracking-wider font-semibold leading-tight">
                    Semana
                  </span>
                  <div className="text-white font-bold text-xs leading-tight tabular-nums mt-0.5 whitespace-nowrap">
                    {cardioStats.week}
                    <span className="text-zinc-500 text-[9px] font-normal ml-0.5">
                      / Sem
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/40 rounded-xl p-2.5 border border-zinc-800/40 flex items-center justify-center gap-1.5">
                <Calendar
                  className="text-[#F77F00] w-[17px] h-[17px] shrink-0"
                  strokeWidth={2}
                />
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-zinc-500 text-[8.5px] uppercase tracking-wider font-semibold leading-tight">
                    Mês
                  </span>
                  <div className="text-white font-bold text-xs leading-tight tabular-nums mt-0.5 whitespace-nowrap">
                    {cardioStats.month}
                    <span className="text-zinc-500 text-[9px] font-normal ml-0.5">
                      / Mês
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-900/40 rounded-xl p-2.5 border border-zinc-800/40 flex items-center justify-center gap-1.5">
                <Trophy
                  className="text-[#F77F00] w-[17px] h-[17px] shrink-0"
                  strokeWidth={2}
                />
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-zinc-500 text-[8.5px] uppercase tracking-wider font-semibold leading-tight">
                    Total
                  </span>
                  <div className="text-white font-bold text-xs leading-tight tabular-nums mt-0.5 whitespace-nowrap">
                    {cardioStats.total}
                    <span className="text-zinc-500 text-[9px] font-normal ml-0.5">
                      / Tot
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. CALENDÁRIO MENSAL INTERATIVO */}
        <section className="bg-[#0a0a0a] rounded-[20px] p-5 mb-4 border border-zinc-800/60">
          <div ref={monthPickerRef} className="relative mb-5">
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Mês anterior"
                className="w-8 h-8 rounded-xl bg-zinc-900/60 border border-zinc-800/60 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-haspopup="dialog"
                  aria-expanded={isMonthPickerOpen}
                  onClick={() => setIsMonthPickerOpen((prev) => !prev)}
                  className={`px-3 py-1.5 rounded-xl border text-white font-bold text-sm tracking-tight tabular-nums inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isMonthPickerOpen
                      ? 'bg-zinc-900 border-[#F77F00]'
                      : 'bg-zinc-900/50 border-zinc-800/70 hover:border-zinc-700'
                  }`}
                >
                  <span>
                    {MONTHS_PT[viewMonth]} {viewYear}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#F77F00] shrink-0 transition-transform duration-200 ${
                      isMonthPickerOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {(!isViewingTodayMonth || selectedDateISO !== todayISO) && (
                  <button
                    type="button"
                    onClick={() => {
                      handleJumpToday();
                      setIsMonthPickerOpen(false);
                    }}
                    className="text-[11px] font-semibold text-[#F77F00] hover:text-orange-400 transition-colors cursor-pointer"
                  >
                    Hoje
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Mês seguinte"
                className="w-8 h-8 rounded-xl bg-zinc-900/60 border border-zinc-800/60 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Dropdown EVOLV de Mês e Ano */}
            {isMonthPickerOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 z-40 rounded-[20px] bg-[#111111] border border-zinc-800 shadow-[0_18px_40px_rgba(0,0,0,0.72)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div
                  className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#F77F00]/70 to-transparent"
                  aria-hidden="true"
                />
                <div className="p-3.5">
                  <div className="flex items-center justify-between mb-3">
                    <button
                      type="button"
                      onClick={() => setViewYear((y) => y - 1)}
                      aria-label="Ano anterior"
                      className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#F77F00] tabular-nums">
                      {viewYear}
                    </span>
                    <button
                      type="button"
                      onClick={() => setViewYear((y) => y + 1)}
                      aria-label="Ano seguinte"
                      className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {MONTHS_SHORT_PT.map((label, mIdx) => {
                      const isActive = mIdx === viewMonth;
                      const isCurrentRealMonth =
                        mIdx === todayDate.getMonth() &&
                        viewYear === todayDate.getFullYear();
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => {
                            setViewMonth(mIdx);
                            setIsMonthPickerOpen(false);
                          }}
                          className={`py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-[#F77F00] text-white shadow-sm shadow-orange-500/25'
                              : isCurrentRealMonth
                                ? 'bg-[#F77F00]/12 text-[#F77F00] border border-[#F77F00]/40'
                                : 'bg-zinc-900/60 text-zinc-300 hover:bg-[#F77F00]/12 hover:text-white'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-7 gap-y-2.5 text-center">
            {WEEKDAYS_PT.map((day) => (
              <span
                key={day}
                className="text-zinc-500 text-[11px] font-medium pb-1.5"
              >
                {day}
              </span>
            ))}

            {calendarCells.map((cell) => {
              const isSelected = cell.iso === selectedDateISO;
              const isToday = cell.iso === todayISO;
              const dotColors = eventColorsByDate[cell.iso] ?? [];

              return (
                <button
                  key={cell.iso}
                  type="button"
                  onClick={() => handleSelectCell(cell)}
                  aria-label={formatFullDatePT(cell.iso)}
                  aria-pressed={isSelected}
                  className="flex flex-col items-center justify-start py-0.5 cursor-pointer group focus:outline-none"
                >
                  <span
                    className={`w-[32px] h-[32px] rounded-full flex items-center justify-center text-[13px] tabular-nums transition-all ${
                      isSelected
                        ? 'bg-[#F77F00] text-white font-bold shadow-md shadow-orange-500/25'
                        : isToday
                          ? 'border border-[#F77F00] text-white font-semibold'
                          : cell.inCurrentMonth
                            ? 'text-white font-medium group-hover:bg-zinc-800/70'
                            : 'text-zinc-600 font-medium group-hover:text-zinc-400'
                    }`}
                  >
                    {cell.day}
                  </span>

                  <div className="h-2 flex items-center justify-center gap-0.5 mt-1">
                    {dotColors.map((hex) => (
                      <span
                        key={hex}
                        className={`w-1.5 h-1.5 rounded-full ${getEventBgClass(hex)} ${
                          cell.inCurrentMonth ? 'opacity-100' : 'opacity-45'
                        }`}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. BLOCO DE EVENTOS DA DATA SELECIONADA */}
        <section className="bg-[#0a0a0a] rounded-[20px] p-4 mb-4 border border-zinc-800/60">
          <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-zinc-800/60">
            <div className="min-w-0">
              <h3 className="text-white text-sm font-bold tracking-tight leading-tight">
                Eventos
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5 truncate">
                {selectedDateISO === todayISO ? 'Hoje · ' : ''}
                {formatFullDatePT(selectedDateISO)}
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddEvent}
              className="min-h-[36px] px-3 py-1.5 rounded-xl bg-[#F77F00] hover:bg-[#e57300] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-orange-500/20 transition-all active:scale-95 cursor-pointer shrink-0 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span>Adicionar</span>
            </button>
          </div>

          {selectedDayEvents.length > 0 ? (
            <div className="divide-y divide-zinc-800/60 mt-1">
              {selectedDayEvents.map((evt) => {
                const isMultiDay =
                  !evt.allDay && evt.endDate && evt.endDate > evt.startDate;
                return (
                  <button
                    key={evt.id}
                    type="button"
                    onClick={() => handleOpenEditEvent(evt)}
                    className="w-full py-3.5 flex items-stretch gap-3 text-left group hover:bg-zinc-900/35 -mx-1 px-1 rounded-xl transition-colors cursor-pointer"
                  >
                    <span
                      className={`w-1 rounded-full shrink-0 ${getEventBgClass(evt.color)}`}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-white text-[13.5px] font-semibold leading-snug truncate">
                          {evt.title}
                        </h4>
                        <span className="text-[11px] font-medium text-zinc-400 tabular-nums shrink-0 whitespace-nowrap">
                          {evt.allDay
                            ? 'Todo o dia'
                            : `${evt.startTime} – ${evt.endTime}`}
                        </span>
                      </div>

                      {isMultiDay && (
                        <p className="text-[11px] text-zinc-400 mt-0.5 tabular-nums">
                          {formatShortDatePT(evt.startDate)} →{' '}
                          {formatShortDatePT(evt.endDate)}
                        </p>
                      )}

                      {(evt.repeat !== 'none' || evt.alert !== 'none') && (
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[11px] text-zinc-500">
                          {evt.repeat !== 'none' && (
                            <span className="inline-flex items-center gap-1">
                              <Repeat className="w-3 h-3 shrink-0" />
                              <span>{getRepeatLabel(evt.repeat)}</span>
                            </span>
                          )}
                          {evt.alert !== 'none' && (
                            <span className="inline-flex items-center gap-1">
                              <Bell className="w-3 h-3 shrink-0" />
                              <span>{getAlertLabel(evt.alert)}</span>
                            </span>
                          )}
                        </div>
                      )}

                      {evt.notes && (
                        <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                          {evt.notes}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-6 text-center">
              <div className="w-10 h-10 rounded-2xl bg-zinc-900/70 border border-zinc-800/70 flex items-center justify-center mx-auto mb-2.5 text-zinc-500">
                <Clock className="w-4 h-4" />
              </div>
              <p className="text-xs font-medium text-zinc-400">
                Sem eventos agendados para este dia
              </p>
              <button
                type="button"
                onClick={handleOpenAddEvent}
                className="mt-2 text-xs font-bold text-[#F77F00] hover:text-orange-400 transition-colors cursor-pointer"
              >
                + Adicionar evento
              </button>
            </div>
          )}
        </section>

        {/* 4. CHART: DISTRIBUIÇÃO SEMANAL */}
        <section className="bg-[#0a0a0a] rounded-[20px] p-5 border border-zinc-800/60">
          <div className="flex items-center gap-2 mb-8">
            <BarChart3 className="w-4 h-4 text-zinc-400" />
            <span className="text-white text-[13px] font-medium">
              Distribuição Semanal
            </span>
          </div>

          <div className="flex justify-between items-end h-[140px] px-2">
            {[
              { day: 'Seg', val: 15.6, hClass: 'h-[80%]' },
              { day: 'Ter', val: 17, hClass: 'h-full' },
              { day: 'Qua', val: 13.3, hClass: 'h-[65%]' },
              { day: 'Qui', val: 16.3, hClass: 'h-[85%]' },
              { day: 'Sex', val: 13.3, hClass: 'h-[65%]' },
              { day: 'Sáb', val: 13.3, hClass: 'h-[65%]' },
              { day: 'Dom', val: 11.1, hClass: 'h-[50%]' },
            ].map((item) => (
              <div
                key={item.day}
                className="flex flex-col items-center h-full w-full group"
              >
                <span className="text-[9px] text-zinc-400 group-hover:text-white transition-colors tabular-nums">
                  {item.val}%
                </span>
                <div className="flex-1 w-full flex items-end justify-center py-2">
                  <div
                    className={`w-3 ${item.hClass} rounded-full bg-gradient-to-t from-red-600 via-orange-500 to-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.3)] transition-all duration-500 group-hover:brightness-110`}
                  />
                </div>
                <span className="text-[10px] text-zinc-500">{item.day}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* BOTTOM SHEET: ADICIONAR / EDITAR EVENTO */}
      <AgendaEventModal
        isOpen={isEventModalOpen}
        defaultDateISO={selectedDateISO}
        editingEvent={editingEvent}
        onClose={() => {
          setIsEventModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />
    </>
  );
}

