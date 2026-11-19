import { Target, Timer } from 'lucide-react';
import { Goal } from '../types';

interface CurrentGoalProps {
  goal: Goal;
}

export function CurrentGoal({ goal }: CurrentGoalProps) {
  const today = new Date();
  const diffTime = Math.abs(goal.targetDate.getTime() - today.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const weeksLeft = Math.floor(diffDays / 7);
  const daysLeft = diffDays % 7;

  return (
    <section className="px-5 py-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both">
      <div className="bg-[#0a0a0a] border border-zinc-800/60 rounded-[20px] p-4 flex items-center justify-between">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center border border-zinc-800 shrink-0">
            <Target className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mb-0.5">Objetivo Atual</p>
            <h3 className="text-sm text-white font-bold leading-tight max-w-[140px] truncate">{goal.title}</h3>
          </div>
        </div>

        <div className="flex items-center gap-2 border-l border-zinc-800 pl-4">
          <div className="flex flex-col items-center">
            <span className="text-lg font-black text-white leading-none">{weeksLeft}</span>
            <span className="text-[9px] font-bold text-zinc-500 uppercase mt-0.5">S</span>
          </div>
          <span className="text-zinc-700 font-black text-sm pb-3">:</span>
          <div className="flex flex-col items-center">
            <span className="text-lg font-black text-white leading-none">{daysLeft}</span>
            <span className="text-[9px] font-bold text-zinc-500 uppercase mt-0.5">D</span>
          </div>
          <span className="text-zinc-700 font-black text-sm pb-3">:</span>
          <div className="flex flex-col items-center">
            <span className="text-lg font-black text-white leading-none">23</span>
            <span className="text-[9px] font-bold text-zinc-500 uppercase mt-0.5">H</span>
          </div>
        </div>

      </div>
    </section>
  );
}
