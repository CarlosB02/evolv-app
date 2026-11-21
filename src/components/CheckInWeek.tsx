import { useMemo, useState } from 'react';
import { Check, ChevronDown, Dumbbell } from 'lucide-react';
import { DailyCheckIn, WeeklySummary } from '../types';
import {
  fromISODate,
  getWeekDatesISO,
  useDailyCheckIn,
} from '../context/DailyCheckInContext';

interface CheckInWeekProps {
  checkIns?: DailyCheckIn[];
  summary?: WeeklySummary;
}

const DAY_NAMES_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function CheckInWeek(_props: CheckInWeekProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const {
    todayISO,
    getDayCompletion,
    currentWeekWorkoutsDone,
    openCheckIn,
  } = useDailyCheckIn();

  const weekDays = useMemo(() => {
    return getWeekDatesISO(0, todayISO).map((iso) => {
      const dt = fromISODate(iso);
      const completion = getDayCompletion(iso);
      return {
        iso,
        dayName: DAY_NAMES_PT[dt.getDay()],
        dayNumber: dt.getDate(),
        isToday: iso === todayISO,
        status: completion.status,
      };
    });
  }, [todayISO, getDayCompletion]);

  return (
    <section className="px-5 py-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
      <div className="bg-[#0a0a0a] border border-zinc-800/60 rounded-[20px] p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white">Check-in Diário</h2>
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            aria-label={
              isExpanded
                ? 'Minimizar progresso de treinos'
                : 'Mostrar progresso de treinos'
            }
            className="p-1.5 -mr-1.5 text-zinc-400 hover:text-orange-500 active:scale-90 transition-colors cursor-pointer"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ease-out ${
                isExpanded ? 'rotate-180' : 'rotate-0'
              }`}
              strokeWidth={2.5}
            />
          </button>
        </div>

        <div className="flex justify-between items-center">
          {weekDays.map((day) => {
            const isCompleted = day.status === 'completed';

            return (
              <div key={day.iso} className="flex flex-col items-center gap-1.5">
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider ${
                    day.isToday ? 'text-white' : 'text-zinc-500'
                  }`}
                >
                  {day.dayName}
                </span>

                {day.isToday ? (
                  <button
                    type="button"
                    onClick={openCheckIn}
                    aria-label="Abrir Check-in Diário de hoje"
                    style={{ color: '#ffffff' }}
                    className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-[#F77F00] hover:bg-[#e57300] active:scale-95 shadow-[0_0_12px_rgba(247,127,0,0.35)] transition-all duration-200 cursor-pointer"
                  >
                    {isCompleted ? (
                      <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    ) : (
                      <span className="text-xs font-bold tabular-nums">
                        {day.dayNumber}
                      </span>
                    )}
                  </button>
                ) : (
                  <div
                    aria-disabled="true"
                    className={`relative flex items-center justify-center w-8 h-8 rounded-lg select-none cursor-default ${
                      isCompleted
                        ? 'bg-zinc-950 border border-orange-500/50 text-orange-500'
                        : 'bg-transparent text-zinc-600'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    ) : (
                      <span className="text-xs font-bold tabular-nums">
                        {day.dayNumber}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div
          className={`grid transition-all duration-300 ease-out ${
            isExpanded
              ? 'grid-rows-[1fr] opacity-100 mt-4'
              : 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none'
          }`}
        >
          <div className="overflow-hidden">
            <div className="pt-4 border-t border-zinc-800/60 flex items-center gap-3">
              <Dumbbell className="w-4 h-4 text-orange-500 shrink-0" />
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider shrink-0">
                Treinos feitos
              </span>
              <div className="flex-1 h-1.5 bg-black rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-500 rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: isExpanded
                      ? `${Math.min(100, (currentWeekWorkoutsDone / 7) * 100)}%`
                      : '0%',
                  }}
                />
              </div>
              <span className="text-[11px] font-black text-white tabular-nums shrink-0">
                {currentWeekWorkoutsDone}/7
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
