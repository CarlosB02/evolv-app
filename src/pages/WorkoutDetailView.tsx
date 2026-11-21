import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Pencil, 
  Clock, 
  Flame, 
  Gauge, 
  Dumbbell, 
  ChevronRight, 
  Play, 
  Check, 
  X, 
  Sparkles, 
  Info,
  Timer,
  CheckCircle2,
  RotateCcw,
  Plus
} from 'lucide-react';
import { DetailedWorkout, ExerciseItem } from '../data/workoutsData';
import { WorkoutEditFullPage } from './WorkoutEditFullPage';
import { ExerciseDetailView } from './ExerciseDetailView';
import { useScrollToTop } from '../utils/scrollToTop';

interface WorkoutDetailViewProps {
  workout: DetailedWorkout;
  onBack: () => void;
  onStartWorkout: () => void;
  onUpdateWorkout?: (updatedWorkout: DetailedWorkout) => void;
}

export function WorkoutDetailView({
  workout,
  onBack,
  onStartWorkout,
  onUpdateWorkout
}: WorkoutDetailViewProps) {
  // Navigation states
  const [isEditingExercises, setIsEditingExercises] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseItem | null>(null);

  useScrollToTop([isEditingExercises, selectedExercise?.id]);
  
  // Editable fields for workout
  const [currentWorkout, setCurrentWorkout] = useState<DetailedWorkout>(workout);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSaveExercisesFromFullPage = (updated: DetailedWorkout) => {
    setCurrentWorkout(updated);
    setIsEditingExercises(false);
    if (onUpdateWorkout) {
      onUpdateWorkout(updated);
    }
    showToast('Exercícios atualizados com sucesso!');
  };

  if (isEditingExercises) {
    return (
      <WorkoutEditFullPage
        workout={currentWorkout}
        onSave={handleSaveExercisesFromFullPage}
        onCancel={() => setIsEditingExercises(false)}
      />
    );
  }

  // Página dedicada aos Detalhes do Exercício antes de iniciar o treino
  if (selectedExercise) {
    return (
      <ExerciseDetailView
        exercise={selectedExercise}
        onBack={() => setSelectedExercise(null)}
        onToggleFavorite={(exId, isFav) => {
          setCurrentWorkout(prev => ({
            ...prev,
            exercises: prev.exercises.map(ex => ex.id === exId ? { ...ex, isFavorite: isFav } : ex)
          }));
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 px-5 pt-4 pb-10 animate-in fade-in zoom-in-95 duration-200">
      
      {/* TOAST FEEDBACK */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[250] w-[90%] max-w-[360px] bg-emerald-500 text-white px-4 py-3 rounded-2xl shadow-xl border border-emerald-400/40 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-white stroke-[3]" />
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* 1. CABEÇALHO */}
      <header className="flex items-center justify-between mb-1">
        <button 
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 hover:bg-orange-500/20 active:scale-95 transition-all cursor-pointer"
          aria-label="Voltar"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
        </button>

        {/* Nome do treino / grupo muscular centrado */}
        <div className="flex-1 text-center px-2">
          <h1 className="text-white text-base sm:text-lg font-bold tracking-tight truncate">
            {currentWorkout.name}
          </h1>
        </div>

        {/* Botão de edição no canto superior direito: Abre a página completa de edição */}
        <button
          type="button"
          onClick={() => setIsEditingExercises(true)}
          className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white hover:border-zinc-700 active:scale-95 transition-all cursor-pointer"
          aria-label="Editar exercícios"
          title="Editar exercícios"
        >
          <Pencil className="w-4 h-4 text-orange-500" />
        </button>
      </header>

      {/* 2. BANNER VISUAL DO TREINO */}
      <div className="relative overflow-hidden rounded-[22px] bg-zinc-950 border border-zinc-800/70 h-[115px] shadow-lg">
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
          <p className="text-zinc-400 text-xs font-medium mt-0.5">
            {currentWorkout.exercises.length} exercícios programados
          </p>
        </div>
      </div>

      {/* 3. RESUMO DO TREINO (CARD COM 2 INDICADORES: Nº DE EXERCÍCIOS E DURAÇÃO DO ÚLTIMO TREINO) */}
      <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-[20px] p-4 shadow-md">
        <div className="grid grid-cols-2 gap-2 divide-x divide-zinc-800/60">
          
          {/* Indicador 1: Nº de Exercícios */}
          <div className="flex flex-col items-center px-2 text-center">
            <Dumbbell className="w-4 h-4 text-orange-500 mb-1 shrink-0" strokeWidth={2.2} />
            <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider block leading-tight">
              Nº de Exercícios
            </span>
            <span className="text-sm font-bold text-white tabular-nums block mt-0.5 leading-tight">
              {currentWorkout.exercises.length}
            </span>
          </div>

          {/* Indicador 2: Duração do último treino */}
          <div className="flex flex-col items-center px-2 text-center">
            <Clock className="w-4 h-4 text-orange-500 mb-1 shrink-0" strokeWidth={2.2} />
            <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider block leading-tight">
              Último Treino
            </span>
            <span className="text-sm font-bold text-white tabular-nums block mt-0.5 leading-tight">
              {currentWorkout.durationEstimated.replace(/^~\s*/, '')}
            </span>
          </div>

        </div>
      </div>

      {/* 4. LISTA DE EXERCÍCIOS */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              EXERCÍCIOS
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-bold">
              {currentWorkout.exercises.length}
            </span>
          </div>
        </div>

        {/* Cards dos exercícios */}
        <div className="flex flex-col gap-2">
          {currentWorkout.exercises.map((ex, idx) => (
            <div
              key={ex.id}
              onClick={() => setSelectedExercise(ex)}
              className="group flex items-center justify-between p-3 rounded-2xl bg-[#0a0a0a] hover:bg-zinc-900/80 border border-zinc-800/80 hover:border-orange-500/40 active:scale-[0.99] transition-all cursor-pointer shadow-sm"
            >
              {/* Lado esquerdo: Imagem + Info */}
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                {/* Imagem ilustrativa */}
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0">
                  <img 
                    src={ex.image} 
                    alt={ex.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                  <div className="absolute top-1 left-1 w-4 h-4 rounded-md bg-black/70 backdrop-blur-xs flex items-center justify-center text-[9px] font-black text-orange-400">
                    {idx + 1}
                  </div>
                </div>

                {/* Nome e repetições */}
                <div className="flex flex-col min-w-0 pr-2">
                  <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-orange-400 transition-colors truncate">
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

              {/* Lado direito: Seta lateral de navegação */}
              <div className="w-8 h-8 rounded-xl bg-zinc-900 group-hover:bg-orange-500/10 flex items-center justify-center text-zinc-400 group-hover:text-orange-500 transition-colors shrink-0">
                <ChevronRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
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
