import { Check, Dumbbell } from 'lucide-react';
import { DailyCheckIn, WeeklySummary } from '../types';

interface CheckInWeekProps {
  checkIns: DailyCheckIn[];
  summary: WeeklySummary;
}

export function CheckInWeek({ checkIns, summary }: CheckInWeekProps) {
  return (
    <section className="px-5 py-3 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
      <div className="bg-[#0a0a0a] border border-zinc-800/60 rounded-[20px] p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white">Check-in Diário</h2>
        </div>

        <div className="flex justify-between items-center mb-4">
          {checkIns.map((day) => {
            const isToday = day.status === 'pending';
            const isCompleted = day.status === 'completed';
            
            return (
              <div key={day.id} className="flex flex-col items-center gap-1.5">
                <span className={`text-[9px] font-bold uppercase tracking-wider ${isToday ? 'text-white' : 'text-zinc-500'}`}>
                  {day.dayName.substring(0, 3)}
                </span>
                
                <button 
                  className={`relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 ${
                    isCompleted 
                      ? 'bg-zinc-950 border border-orange-500/50 text-orange-500'
                      : isToday
                      ? 'bg-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.3)]'
                      : 'bg-transparent text-zinc-600'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                  ) : (
                    <span className="text-xs font-bold">{day.dayNumber}</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-4 border-t border-zinc-800/60 flex items-center gap-3">
          <Dumbbell className="w-4 h-4 text-orange-500 shrink-0" />
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider shrink-0">Treinos feitos</span>
          <div className="flex-1 h-1.5 bg-black rounded-full overflow-hidden">
            <div 
              className="h-full bg-orange-500 rounded-full" 
              style={{ width: `${(summary.workoutsDone / 7) * 100}%` }}
            />
          </div>
          <span className="text-[11px] font-black text-white shrink-0">{summary.workoutsDone}/7</span>
        </div>
      </div>
    </section>
  );
}
