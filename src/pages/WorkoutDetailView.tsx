import React from 'react';
import { 
  ChevronLeft, 
  Clock, 
  Dumbbell, 
  Play
} from 'lucide-react';
import { DetailedWorkout } from '../data/workoutsData';

interface WorkoutDetailViewProps {
  workout: DetailedWorkout;
  onBack: () => void;
  onStartWorkout: () => void;
}

export function WorkoutDetailView({
  workout,
  onBack,
  onStartWorkout,
}: WorkoutDetailViewProps) {
  const currentWorkout = workout;

  return (
    <div className="flex flex-col gap-4 px-5 pt-4 pb-10 animate-in fade-in zoom-in-95 duration-200">
      {/* 1. CABEÇALHO */}
      <header className="flex items-center justify-between mb-1">
        <button 
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 hover:bg-orange-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
          aria-label="Voltar"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
        </button>

        {/* Nome do treino / grupo muscular centrado */}
        <div className="flex-1 text-center px-2 min-w-0">
          <h1 className="text-white text-base sm:text-lg font-bold tracking-tight truncate">
            {currentWorkout.name}
          </h1>
        </div>

        <div className="w-10 shrink-0" aria-hidden="true" />
      </header>

      {/* 2. BANNER VISUAL DO TREINO */}
      <div className="relative overflow-hidden rounded-[22px] bg-zinc-950 border border-zinc-800/70 h-[108px] shadow-lg">
        <div 
          className="absolute inset-y-0 right-0 w-[70%] bg-cover bg-center z-0 opacity-80"
          style={{ backgroundImage: `url('${currentWorkout.image}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-transparent z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 to-transparent z-0"></div>

        <div className="relative z-10 px-5 h-full flex flex-col justify-center">
          <span className="text-[10px] uppercase font-bold tracking-widest text-orange-500 mb-1">
            Plano Ativo
          </span>
          <h2 className="text-xl font-black text-white uppercase tracking-tight">
            {currentWorkout.name}
          </h2>
        </div>
      </div>

      {/* 3. RESUMO DO TREINO COMPACTO (ÍCONE À ESQUERDA, TEXTO E NÚMERO À DIREITA) */}
      <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-[18px] py-2.5 px-3 shadow-md">
        <div className="grid grid-cols-2 divide-x divide-zinc-800/60">
          
          {/* Indicador 1: Nº de Exercícios */}
          <div className="flex items-center justify-center gap-2.5 pr-2">
            <Dumbbell className="w-4 h-4 text-orange-500 shrink-0" strokeWidth={2.2} />
            <div className="min-w-0">
              <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider block leading-tight">
                Nº de Exercícios
              </span>
              <span className="text-sm font-bold text-white tabular-nums block mt-0.5 leading-tight">
                {currentWorkout.exercises.length}
              </span>
            </div>
          </div>

          {/* Indicador 2: Duração do último treino */}
          <div className="flex items-center justify-center gap-2.5 pl-2">
            <Clock className="w-4 h-4 text-orange-500 shrink-0" strokeWidth={2.2} />
            <div className="min-w-0">
              <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider block leading-tight">
                Último Treino
              </span>
              <span className="text-sm font-bold text-white tabular-nums block mt-0.5 leading-tight">
                {currentWorkout.durationEstimated.replace(/^~\s*/, '')}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* 4. LISTA DE EXERCÍCIOS (PRÉ-VISUALIZAÇÃO) */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            EXERCÍCIOS
          </h3>
        </div>

        {/* Cards dos exercícios (apenas pré-visualização, sem abrir detalhes aqui) */}
        <div className="flex flex-col gap-2">
          {currentWorkout.exercises.map((ex, idx) => (
            <div
              key={ex.id}
              className="flex items-center p-3 rounded-2xl bg-[#0a0a0a] border border-zinc-800/80 shadow-sm"
            >
              {/* Imagem + Info */}
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                {/* Imagem ilustrativa */}
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0">
                  <img 
                    src={ex.image} 
                    alt={ex.name}
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute top-1 left-1 w-4 h-4 rounded-md bg-black/70 backdrop-blur-xs flex items-center justify-center text-[9px] font-black text-orange-400">
                    {idx + 1}
                  </div>
                </div>

                {/* Nome e repetições */}
                <div className="flex flex-col min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                    {ex.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] mt-0.5 flex-wrap">
                    <span className="text-orange-500 font-semibold">{ex.series} séries</span>
                    <span className="text-zinc-600">•</span>
                    <span>{ex.reps} repetições</span>
                    {ex.weightSuggestion && (
                      <>
                        <span className="text-zinc-600 hidden sm:inline">•</span>
                        <span className="text-zinc-500 text-[10px] hidden sm:inline">{ex.weightSuggestion}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 5. BOTÃO DESTACADO JUNTO AO ÚLTIMO EXERCÍCIO */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onStartWorkout}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:scale-[0.98] text-white font-medium text-sm shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white stroke-none" />
            <span>Iniciar treino</span>
          </button>
        </div>
      </section>

    </div>
  );
}
