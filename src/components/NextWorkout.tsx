import { ArrowRight } from 'lucide-react';
import { Workout } from '../types';

interface NextWorkoutProps {
  workout: Workout;
  onGoToWorkout?: () => void;
}

export function NextWorkout({ workout, onGoToWorkout }: NextWorkoutProps) {
  return (
    <section className="px-5 py-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
      <div
        role="button"
        tabIndex={0}
        onClick={onGoToWorkout}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onGoToWorkout?.();
          }
        }}
        className="relative overflow-hidden rounded-[24px] bg-zinc-950 border border-zinc-800/80 shadow-lg group cursor-pointer h-[130px] active:scale-[0.99] transition-transform"
      >
        
        {/* Background Image & Overlay */}
        <div 
          className="absolute inset-y-0 right-0 w-2/3 bg-cover bg-center z-0 opacity-60 mix-blend-lighten"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=1000&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/90 to-transparent z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent z-0"></div>
        <div className="absolute inset-0 bg-orange-500/10 mix-blend-overlay z-0"></div>
        
        <div className="relative z-10 p-5 h-full flex flex-col justify-center">
          <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-0.5">
            Próximo Treino
          </p>
          <h3 className="text-4xl font-black text-white italic tracking-tighter leading-none mb-1 drop-shadow-lg">
            {workout.name}
          </h3>
          <p className="text-[9px] text-zinc-300 font-bold mb-3 tracking-wide">
            {workout.muscleGroups.join(' • ')}
          </p>
          
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onGoToWorkout?.();
            }}
            className="flex items-center gap-1.5 bg-transparent border border-orange-500 text-orange-500 px-3 py-1.5 rounded-full text-[10px] font-bold shadow-[0_0_15px_rgba(249,115,22,0.2)] transition-transform group-hover:scale-105 w-fit cursor-pointer"
          >
            Ir para o treino
            <ArrowRight className="w-3 h-3" strokeWidth={3} />
          </button>
        </div>
      </div>
    </section>
  );
}
