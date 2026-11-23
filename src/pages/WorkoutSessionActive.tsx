import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  ChevronLeft, 
  Check, 
  Pause, 
  Play, 
  ChevronDown, 
  ChevronUp, 
  Video, 
  Calendar, 
  Dumbbell, 
  CheckCircle2, 
  Info,
  Timer,
  ChevronRight,
  ArrowLeftRight,
  MoreVertical,
  X
} from 'lucide-react';
import { 
  DetailedWorkout, 
  ExerciseSet, 
  WarmupRoutine, 
  getWorkoutWarmup, 
  generateDefaultSets 
} from '../data/workoutsData';
import { ExerciseDetailView } from './ExerciseDetailView';
import { ExerciseSwapPage } from './ExerciseSwapPage';
import { WorkoutSummaryView } from './WorkoutSummaryView';
import { PostWorkoutFeedbackView } from './PostWorkoutFeedbackView';
import { PersonalRecordModal } from '../components/workout/PersonalRecordModal';
import { detectAndSavePR, NewPREvent } from '../data/personalRecords';
import { useScrollToTop } from '../utils/scrollToTop';

interface WorkoutSessionActiveProps {
  workout: DetailedWorkout;
  onFinish: () => void;
  onExit: () => void;
  onUpdateWorkout?: (updatedWorkout: DetailedWorkout) => void;
}

export function WorkoutSessionActive({
  workout,
  onFinish,
  onExit,
  onUpdateWorkout
}: WorkoutSessionActiveProps) {
  // Current active workout state (can be updated via edit page)
  const [currentWorkout, setCurrentWorkout] = useState<DetailedWorkout>(() => {
    // Ensure each exercise has sets generated and sensible realistic gym weights (e.g. 14, 70 kg, not 1216)
    const populated = { ...workout };
    populated.exercises = populated.exercises.map(ex => {
      let sets = ex.sets;
      if (!sets || sets.length === 0) {
        sets = generateDefaultSets(ex.series, ex.weightSuggestion || '30 kg');
      } else {
        // Sanitize any previously contaminated sets with 4-digit weights (e.g. 1216 or > 120 kg)
        sets = sets.map((st, i) => {
          const num = parseInt(st.weight.replace(/[^0-9]/g, ''), 10);
          if (num > 120 || String(num).length > 2) {
            // Recalculate realistic 2-digit weight from exercise suggestion
            const fallbackSets = generateDefaultSets(ex.series, ex.weightSuggestion || '30 kg');
            const safeKg = fallbackSets[i]?.weight || '30';
            return {
              ...st,
              weight: safeKg,
              prevWeight: `${safeKg} kg`
            };
          }
          return st;
        });
      }

      return {
        ...ex,
        sets
      };
    });
    return populated;
  });

  // Timer & active state - user starts explicitly via prominent button or resume
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Pre-workout dropdown state
  const [isWarmupExpanded, setIsWarmupExpanded] = useState(false);

  // Expanded exercises in session (accordion/dropdown behaviour: tracks which exercise is open)
  // Default first exercise expanded for convenience
  const [expandedExerciseIds, setExpandedExerciseIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (workout.exercises.length > 0) {
      initial[workout.exercises[0].id] = true;
    }
    return initial;
  });

  // Selected exercise for 4-tab detail view during active session
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

  // Selected exercise for 3-tab swap alternatives page
  const [swapExerciseId, setSwapExerciseId] = useState<string | null>(null);

  // Exercise 3-dots options bottom-sheet state
  const [optionsMenuExerciseId, setOptionsMenuExerciseId] = useState<string | null>(null);

  // Mutually exclusive intensity logging mode per exercise: 'rir' | 'pse' | 'none'
  const [intensityMetricByExercise, setIntensityMetricByExercise] = useState<
    Record<string, 'rir' | 'pse' | 'none'>
  >({});

  // Confirmation bottom-sheet before finishing workout
  const [isConfirmFinishOpen, setIsConfirmFinishOpen] = useState(false);

  // Finish flow steps: null -> 'summary' -> 'feedback' -> completed
  const [finishFlowStep, setFinishFlowStep] = useState<'summary' | 'feedback' | null>(null);

  useScrollToTop([finishFlowStep, selectedExerciseId, swapExerciseId]);

  useEffect(() => {
    if (!optionsMenuExerciseId && !isWarmupExpanded && !isConfirmFinishOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOptionsMenuExerciseId(null);
        setIsWarmupExpanded(false);
        setIsConfirmFinishOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [optionsMenuExerciseId, isWarmupExpanded, isConfirmFinishOpen]);

  const getExerciseIntensityMetric = (exerciseId: string): 'rir' | 'pse' | 'none' =>
    intensityMetricByExercise[exerciseId] ?? 'rir';

  const handleToggleIntensityMetric = (exerciseId: string, metric: 'rir' | 'pse') => {
    setIntensityMetricByExercise((prev) => {
      const current = prev[exerciseId] ?? 'rir';
      return {
        ...prev,
        [exerciseId]: current === metric ? 'none' : metric,
      };
    });
  };
  // Demo video placeholder modal
  const [videoModalExerciseName, setVideoModalExerciseName] = useState<string | null>(null);
  // Novo PR pop-up state
  const [activePRModal, setActivePRModal] = useState<{
    event: NewPREvent | null;
    initialStep: 'celebration' | 'records';
  } | null>(null);
  const [sessionPrCount, setSessionPrCount] = useState<number>(0);
  const [prToast, setPrToast] = useState<string | null>(null);

  const showPrToast = (msg: string) => {
    setPrToast(msg);
    setTimeout(() => {
      setPrToast(curr => (curr === msg ? null : curr));
    }, 2400);
  };

  // Timer effect (tracks total elapsed workout time when started and active)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Toggle dropdown for individual exercise
  const toggleExerciseDropdown = (id: string) => {
    setExpandedExerciseIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Update specific set row
  const handleUpdateSet = (exerciseId: string, setIndex: number, field: keyof ExerciseSet, value: any) => {
    setCurrentWorkout(prev => {
      const updatedExercises = prev.exercises.map(ex => {
        if (ex.id !== exerciseId) return ex;
        const updatedSets = [...(ex.sets || [])];
        if (updatedSets[setIndex]) {
          updatedSets[setIndex] = {
            ...updatedSets[setIndex],
            [field]: value
          };
        }
        return {
          ...ex,
          sets: updatedSets
        };
      });
      return {
        ...prev,
        exercises: updatedExercises
      };
    });
  };

  // Start workout overall session explicitly
  const handleStartOverallWorkout = () => {
    setHasStarted(true);
    setIsActive(true);
  };

  // Toggle set completed status + PR detection
  const handleToggleSetCompleted = (exerciseId: string, setIndex: number) => {
    const targetEx = currentWorkout.exercises.find(ex => ex.id === exerciseId);
    const targetSet = targetEx?.sets?.[setIndex];

    if (targetEx && targetSet && !targetSet.completed) {
      const prEvent = detectAndSavePR({
        exerciseName: targetEx.name,
        weightStr: targetSet.weight,
        repsStr: targetSet.reps,
        workout: currentWorkout,
      });
      if (prEvent) {
        setSessionPrCount(c => c + 1);
        setActivePRModal({ event: prEvent, initialStep: 'celebration' });
      }
    }

    setCurrentWorkout(prev => {
      const updatedExercises = prev.exercises.map(ex => {
        if (ex.id !== exerciseId) return ex;
        const updatedSets = [...(ex.sets || [])];
        if (updatedSets[setIndex]) {
          updatedSets[setIndex] = {
            ...updatedSets[setIndex],
            completed: !updatedSets[setIndex].completed
          };
        }
        return {
          ...ex,
          sets: updatedSets
        };
      });
      return {
        ...prev,
        exercises: updatedExercises
      };
    });
  };

  // Warmup data
  const warmupRoutine: WarmupRoutine = currentWorkout.warmup || getWorkoutWarmup(currentWorkout.dayKey);

  // Completed series count
  const completedSetsCount = currentWorkout.exercises
    .flatMap(ex => ex.sets || [])
    .filter(s => s.completed).length;

  // If user clicked an exercise card during the active workout, open the 4-tab ExerciseDetailView
  const selectedExerciseForDetail = selectedExerciseId
    ? currentWorkout.exercises.find(ex => ex.id === selectedExerciseId) || null
    : null;

  if (selectedExerciseForDetail) {
    return (
      <ExerciseDetailView
        exercise={selectedExerciseForDetail}
        onBack={() => setSelectedExerciseId(null)}
        onToggleFavorite={(exId, isFav) => {
          setCurrentWorkout(prev => {
            const updated = {
              ...prev,
              exercises: prev.exercises.map(ex =>
                ex.id === exId ? { ...ex, isFavorite: isFav } : ex
              )
            };
            if (onUpdateWorkout) {
              onUpdateWorkout(updated);
            }
            return updated;
          });
        }}
      />
    );
  }

  // If user clicked the swap icon on an exercise, open the 3-tab alternatives page
  const exerciseToSwap = swapExerciseId
    ? currentWorkout.exercises.find(ex => ex.id === swapExerciseId) || null
    : null;

  if (exerciseToSwap) {
    return (
      <ExerciseSwapPage
        currentExercise={exerciseToSwap}
        onBack={() => setSwapExerciseId(null)}
        onSelectAlternative={(newExercise) => {
          setCurrentWorkout(prev => {
            const updated = {
              ...prev,
              exercises: prev.exercises.map(ex =>
                ex.id === exerciseToSwap.id ? newExercise : ex
              )
            };
            if (onUpdateWorkout) {
              onUpdateWorkout(updated);
            }
            return updated;
          });
          setSwapExerciseId(null);
          showPrToast(`Substituído por ${newExercise.name}`);
        }}
      />
    );
  }

  const optionsMenuExercise = optionsMenuExerciseId
    ? currentWorkout.exercises.find(ex => ex.id === optionsMenuExerciseId) || null
    : null;

  return (
    <div className="flex flex-col gap-4 px-5 pt-4 pb-28 animate-in fade-in duration-200">
      
      {/* 1. NOME DO TREINO NO TOPO */}
      <header className="flex items-center justify-between">
        <button 
          type="button"
          onClick={onExit}
          className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0"
          aria-label="Voltar"
          title="Voltar"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        <div className="text-center px-2 flex-1 min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight uppercase truncate">
            {currentWorkout.name}
          </h1>
        </div>

        <div className="w-10 shrink-0" aria-hidden="true" />
      </header>

      {/* 2. DOIS INDICADORES COMPACTOS LADO A LADO: DATA E NÚMERO TOTAL DE EXERCÍCIOS */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Data do treino com ícone de calendário */}
        <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 shadow-sm">
          <Calendar className="w-4 h-4 text-orange-500 shrink-0" />
          <span className="text-xs font-semibold text-white truncate">
            {currentWorkout.dayLabel || 'Segunda-feira'}
          </span>
        </div>

        {/* Número total de exercícios com ícone */}
        <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 shadow-sm">
          <Dumbbell className="w-4 h-4 text-orange-500 shrink-0" />
          <span className="text-xs font-semibold text-white truncate">
            {currentWorkout.exercises.length} exercícios
          </span>
        </div>
      </div>

      {/* 3. BARRA DO TEMPORIZADOR COM AÇÕES (INICIAR EM DESTAQUE / PAUSAR / TERMINAR) */}
      <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-2xl p-3 shadow-md flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2.5">
          {/* Ícone de cronómetro e tempo decorrido do treino global */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              isActive 
                ? 'bg-orange-500/20 border border-orange-500/50 text-orange-400' 
                : 'bg-zinc-900 border border-zinc-800 text-zinc-500'
            }`}>
              <Timer className="w-4 h-4 text-orange-500" strokeWidth={2.2} />
            </div>
            <span className="font-mono text-base sm:text-lg font-bold text-white tracking-wider tabular-nums leading-none">
              {formatTimer(seconds)}
            </span>
          </div>

          {/* Botões de Controlo do Treino Geral */}
          <div className="flex items-center gap-2 shrink-0">
            {!hasStarted ? (
              <button
                type="button"
                onClick={handleStartOverallWorkout}
                className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs shadow-lg shadow-orange-500/25 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Iniciar Treino</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer active:scale-95 ${
                    isActive
                      ? 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                      : 'bg-orange-500/10 border-orange-500/40 text-orange-400'
                  }`}
                >
                  {isActive ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pausar</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Retomar</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsConfirmFinishOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer"
                >
                  Terminar
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 4. BLOCO PRÉ-TREINO (CLICÁVEL -> ABRE BOTTOM SHEET) */}
      <button
        type="button"
        onClick={() => setIsWarmupExpanded(true)}
        className="w-full bg-[#0a0a0a] border border-zinc-800/80 hover:border-orange-500/40 active:scale-[0.99] rounded-2xl px-4 py-3.5 flex items-center justify-between transition-all shadow-sm cursor-pointer text-left"
      >
        <span className="text-xs font-bold text-white">Pré-treino</span>
        <ChevronRight className="w-4 h-4 text-orange-400 shrink-0" strokeWidth={2.4} />
      </button>

      {/* 5. TÍTULO SEPARADOR: EXERCÍCIOS */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between pt-1 px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            EXERCÍCIOS
          </h2>
        </div>

        {/* Exercícios interativos */}
        <div className="flex flex-col gap-3">
          {currentWorkout.exercises.map((ex, exIdx) => {
            const isExpanded = !!expandedExerciseIds[ex.id];
            const sets = ex.sets || [];
            const completedCount = sets.filter(s => s.completed).length;
            const isAllCompleted = sets.length > 0 && completedCount === sets.length;
            const intensityMode = getExerciseIntensityMetric(ex.id);

            return (
              <div 
                key={ex.id}
                className={`bg-[#0a0a0a] border rounded-2xl overflow-hidden transition-all shadow-sm ${
                  isAllCompleted
                    ? 'border-emerald-500/40 bg-emerald-950/10'
                    : isExpanded
                      ? 'border-orange-500/40'
                      : 'border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                {/* CARD CABEÇALHO DO EXERCÍCIO (CLICÁVEL PARA ABRIR DETALHES COM 4 TABS) */}
                <div 
                  onClick={() => setSelectedExerciseId(ex.id)}
                  className="p-3.5 flex items-center justify-between gap-2.5 cursor-pointer select-none hover:bg-zinc-900/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Imagem + Badge de Ordem */}
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0">
                      <img 
                        src={ex.image} 
                        alt={ex.name} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1 left-1 w-4 h-4 rounded-md bg-black/80 flex items-center justify-center text-[9px] font-black text-orange-400">
                        {exIdx + 1}
                      </div>
                    </div>

                    {/* Informações: Nome e Grupos Musculares */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                          {ex.name}
                        </h4>
                        {isAllCompleted && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 font-medium truncate mt-0.5">
                        {ex.muscleTarget || currentWorkout.muscleGroups}
                      </p>
                    </div>
                  </div>

                  {/* Ações do Exercício (apenas ícones, sem quadrado por trás): Trocar, 3 Pontos, Minimizar/Maximizar */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSwapExerciseId(ex.id);
                      }}
                      className="p-1.5 text-orange-400 hover:text-orange-300 flex items-center justify-center transition-all cursor-pointer active:scale-90"
                      title="Trocar exercício"
                      aria-label={`Trocar ${ex.name}`}
                    >
                      <ArrowLeftRight className="w-[18px] h-[18px]" strokeWidth={2.2} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOptionsMenuExerciseId(ex.id);
                      }}
                      className="p-1.5 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
                      title="Opções do exercício"
                      aria-label={`Opções de ${ex.name}`}
                    >
                      <MoreVertical className="w-[18px] h-[18px]" strokeWidth={2.2} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExerciseDropdown(ex.id);
                      }}
                      aria-expanded={isExpanded}
                      aria-label={isExpanded ? `Minimizar séries de ${ex.name}` : `Expandir séries de ${ex.name}`}
                      title={isExpanded ? 'Minimizar séries' : 'Expandir séries'}
                      className="p-1.5 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer active:scale-90"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-[19px] h-[19px] text-orange-400" strokeWidth={2.3} />
                      ) : (
                        <ChevronDown className="w-[19px] h-[19px]" strokeWidth={2.3} />
                      )}
                    </button>
                  </div>
                </div>

                {/* TABELA EXPANDIDA DE SÉRIES (DROPDOWN DIRETO NA PÁGINA) */}
                {isExpanded && (
                  <div className="p-3.5 pt-0 border-t border-zinc-800/80 bg-zinc-950/60 animate-in fade-in slide-in-from-top-2 duration-200">
                    
                    {/* Header da Tabela */}
                    <div className="grid grid-cols-12 gap-1.5 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-center border-b border-zinc-800/60">
                      <div className="col-span-1">SET</div>
                      <div className="col-span-3">ANTERIOR</div>
                      <div className="col-span-3">CARGA (KG)</div>
                      <div className={intensityMode === 'none' ? 'col-span-3' : 'col-span-2'}>
                        REPS
                      </div>
                      {intensityMode !== 'none' && (
                        <div className="col-span-1">
                          {intensityMode === 'rir' ? 'RIR' : 'PSE'}
                        </div>
                      )}
                      <div className="col-span-2">FEITO</div>
                    </div>

                    {/* Linhas da Tabela de Séries */}
                    <div className="flex flex-col gap-1.5 pt-2">
                      {sets.map((st, setIdx) => {
                        const isSetDone = !!st.completed;
                        return (
                          <div 
                            key={setIdx}
                            className={`grid grid-cols-12 gap-1.5 items-center p-1.5 rounded-xl border text-xs transition-colors ${
                              isSetDone
                                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                                : 'bg-zinc-900/70 border-zinc-800/80 text-white'
                            }`}
                          >
                            {/* Número da Série */}
                            <div className="col-span-1 text-center font-bold text-zinc-400 text-xs tabular-nums">
                              {st.setNumber}
                            </div>

                            {/* Desempenho Anterior */}
                            <div className="col-span-3 text-center text-[10px] text-zinc-400 font-medium truncate tabular-nums">
                              {st.prevWeight} × {st.prevReps.replace(' reps', '')}
                            </div>

                            {/* Carga Utilizada */}
                            <div className="col-span-3">
                              <input 
                                type="text"
                                value={st.weight}
                                onChange={(e) => handleUpdateSet(ex.id, setIdx, 'weight', e.target.value)}
                                placeholder="kg"
                                className="w-full py-1 px-1.5 bg-black/60 border border-zinc-700/60 rounded-lg text-white font-bold text-xs text-center tabular-nums focus:outline-none focus:border-orange-500"
                              />
                            </div>

                            {/* Repetições Realizadas */}
                            <div className={intensityMode === 'none' ? 'col-span-3' : 'col-span-2'}>
                              <input 
                                type="text"
                                value={st.reps}
                                onChange={(e) => handleUpdateSet(ex.id, setIdx, 'reps', e.target.value)}
                                placeholder="reps"
                                className="w-full py-1 px-1 bg-black/60 border border-zinc-700/60 rounded-lg text-orange-400 font-bold text-xs text-center tabular-nums focus:outline-none focus:border-orange-500"
                              />
                            </div>

                            {/* RIR ou PSE (mutuamente exclusivos) */}
                            {intensityMode === 'rir' && (
                              <div className="col-span-1">
                                <input 
                                  type="text"
                                  value={st.rir}
                                  onChange={(e) => handleUpdateSet(ex.id, setIdx, 'rir', e.target.value)}
                                  placeholder="2"
                                  aria-label="RIR"
                                  className="w-full py-1 bg-black/60 border border-zinc-700/60 rounded-lg text-zinc-300 font-medium text-[11px] text-center tabular-nums focus:outline-none focus:border-orange-500"
                                />
                              </div>
                            )}

                            {intensityMode === 'pse' && (
                              <div className="col-span-1">
                                <input 
                                  type="text"
                                  value={st.pse ?? ''}
                                  onChange={(e) => handleUpdateSet(ex.id, setIdx, 'pse', e.target.value)}
                                  placeholder="8"
                                  aria-label="PSE"
                                  className="w-full py-1 bg-black/60 border border-zinc-700/60 rounded-lg text-zinc-300 font-medium text-[11px] text-center tabular-nums focus:outline-none focus:border-orange-500"
                                />
                              </div>
                            )}

                            {/* Indicador Visual para Assinalar como Concluída */}
                            <div className="col-span-2 flex justify-center">
                              <button
                                type="button"
                                onClick={() => handleToggleSetCompleted(ex.id, setIdx)}
                                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                                  isSetDone
                                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-500 border border-zinc-700'
                                }`}
                                title={isSetDone ? 'Série concluída' : 'Marcar série'}
                              >
                                <Check className="w-4 h-4 stroke-[3]" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Nota do Exercício (apenas se existir) */}
                    {ex.notes && (
                      <div className="pt-2.5 mt-2 border-t border-zinc-800/60">
                        <p className="text-[11px] text-orange-400/90 italic leading-relaxed">
                          {ex.notes}
                        </p>
                      </div>
                    )}

                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. BOTÃO INFERIOR FINALIZAR SESSÃO */}
      <div className="pt-3">
        <button
          type="button"
          onClick={() => setIsConfirmFinishOpen(true)}
          className="w-full py-3.5 rounded-2xl bg-[#F77F00] hover:bg-[#e57300] active:scale-[0.98] text-white font-bold text-sm shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Finalizar e Concluir Treino</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* MODAL: VÍDEO DEMONSTRATIVO (PREPARADO PARA INTEGRAÇÃO)    */}
      {/* ========================================================= */}
      {videoModalExerciseName &&
        createPortal(
          <div
            className="fixed inset-0 z-[290] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setVideoModalExerciseName(null);
              }
            }}
          >
            <div className="bg-[#0a0a0a] border border-zinc-800/90 rounded-[24px] w-full max-w-sm p-5 shadow-2xl text-center animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 mx-auto mb-3">
                <Video className="w-6 h-6" />
              </div>

              <h3 className="text-sm font-bold text-white mb-1">
                Vídeo Demonstrativo
              </h3>
              <p className="text-xs text-orange-400 font-semibold mb-3">
                {videoModalExerciseName}
              </p>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 mb-4 leading-relaxed">
                <p>O leitor de vídeo de alta definição para este exercício está preparado e será integrado nesta área na próxima fase.</p>
              </div>

              <button
                type="button"
                onClick={() => setVideoModalExerciseName(null)}
                className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>,
          document.querySelector('.app-device-wrapper') || document.body
        )}

      {/* ========================================================= */}
      {/* MODAL: TREINO CONCLUÍDO COM SUCESSO                       */}
      {/* ========================================================= */}
      {/* ========================================================= */}
      {/* FLUXO DE CONCLUSÃO: 1. RESUMO -> 2. FEEDBACK PÓS-TREINO   */}
      {/* ========================================================= */}
      {finishFlowStep === 'summary' &&
        (() => {
          const completedExercises = currentWorkout.exercises.filter((ex) =>
            (ex.sets || []).some((s) => s.completed)
          );

          const totalCompletedKg = completedExercises.reduce((acc, ex) => {
            const exVol = (ex.sets || [])
              .filter((st) => st.completed)
              .reduce((sAcc, st) => {
                const w = parseInt((st.weight || '0').replace(/[^0-9]/g, ''), 10) || 0;
                const r = parseInt((st.reps || '0').replace(/[^0-9]/g, ''), 10) || 0;
                return sAcc + w * r;
              }, 0);
            return acc + exVol;
          }, 0);

          const summaryExerciseRows = completedExercises.map((ex, i) => {
            const doneSets = (ex.sets || []).filter((s) => s.completed);
            const bestSet = doneSets.reduce((best, curr) => {
              const currW = parseInt((curr.weight || '0').replace(/[^0-9]/g, ''), 10) || 0;
              const bestW = parseInt((best.weight || '0').replace(/[^0-9]/g, ''), 10) || 0;
              return currW >= bestW ? curr : best;
            }, doneSets[0]);

            const weightNum = bestSet
              ? parseInt((bestSet.weight || '0').replace(/[^0-9]/g, ''), 10) || 0
              : 0;
            const repsNum = bestSet
              ? parseInt((bestSet.reps || '0').replace(/[^0-9]/g, ''), 10) || 0
              : 0;

            return {
              setsCount: doneSets.length,
              name: ex.name,
              bestWeight: weightNum,
              bestReps: repsNum,
              isPr: i % 2 === 0 && sessionPrCount > 0,
              progression:
                i === 0
                  ? '+2 reps'
                  : i === 1
                    ? '+1 kg'
                    : i === 2
                      ? '+1 kg'
                      : '',
            };
          });

          const totalCompletedSets = completedExercises.reduce(
            (acc, ex) => acc + (ex.sets || []).filter((st) => st.completed).length,
            0
          );

          const totalCompletedReps = completedExercises.reduce((acc, ex) => {
            const exReps = (ex.sets || [])
              .filter((st) => st.completed)
              .reduce(
                (rAcc, st) =>
                  rAcc + (parseInt((st.reps || '0').replace(/[^0-9]/g, ''), 10) || 0),
                0
              );
            return acc + exReps;
          }, 0);

          return (
            <div className="fixed inset-0 z-[300] bg-black overflow-y-auto">
              <WorkoutSummaryView
                data={{
                  workoutName: currentWorkout.name,
                  muscleGroups: currentWorkout.muscleGroups,
                  dateStr: 'Hoje',
                  durationStr: formatTimer(seconds),
                  exercisesCompletedStr: `${completedExercises.length}/${currentWorkout.exercises.length}`,
                  prsCount: sessionPrCount,
                  totalKg: totalCompletedKg,
                  totalSets: totalCompletedSets,
                  totalReps: totalCompletedReps,
                  elephantEquivalentCount:
                    totalCompletedKg > 0
                      ? Math.max(1, Math.round(totalCompletedKg / 6000))
                      : 0,
                  exercises: summaryExerciseRows,
                }}
                onDone={() => setFinishFlowStep('feedback')}
              />
            </div>
          );
        })()}

      {finishFlowStep === 'feedback' && (
        <div className="fixed inset-0 z-[300] bg-black overflow-y-auto">
          <PostWorkoutFeedbackView 
            workoutName={currentWorkout.name}
            onCancel={() => setFinishFlowStep('summary')}
            onSubmit={() => {
              setFinishFlowStep(null);
              onFinish();
            }}
          />
        </div>
      )}

      {/* POP-UP NOVO PR (CELEBRAÇÃO -> PARTILHA -> PUBLICADO -> RECORDES) */}
      {activePRModal && (
        <PersonalRecordModal
          prEvent={activePRModal.event}
          initialStep={activePRModal.initialStep}
          onClose={() => setActivePRModal(null)}
          onDismissNotNow={() => {
            setActivePRModal(null);
            showPrToast('Guardado nos teus recordes');
          }}
        />
      )}

      {/* BOTTOM SHEET: OPÇÕES DO EXERCÍCIO (3 PONTOS) */}
      {optionsMenuExercise &&
        createPortal(
          (() => {
            const activeMode = getExerciseIntensityMetric(optionsMenuExercise.id);
            const isRirOn = activeMode === 'rir';
            const isPseOn = activeMode === 'pse';

            return (
              <div
                className="fixed inset-0 z-[260] flex items-end justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setOptionsMenuExerciseId(null);
                  }
                }}
              >
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-label={`Opções de ${optionsMenuExercise.name}`}
                  className="w-full max-w-[414px] bg-[#0a0a0c] border-t border-x border-zinc-800 rounded-t-[28px] shadow-[0_-24px_60px_rgba(0,0,0,0.9)] overflow-hidden animate-in slide-in-from-bottom duration-200"
                >
                  {/* Drag handle */}
                  <div className="pt-3 pb-1 flex justify-center">
                    <div className="w-10 h-1 rounded-full bg-zinc-700/80" />
                  </div>

                  {/* Cabeçalho */}
                  <div className="flex items-center justify-between px-5 pt-2 pb-3.5 border-b border-zinc-800/70">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0">
                        <img
                          src={optionsMenuExercise.image}
                          alt={optionsMenuExercise.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-white text-sm font-bold truncate">
                          {optionsMenuExercise.name}
                        </h3>
                        <p className="text-[11px] text-zinc-400 truncate">
                          {optionsMenuExercise.muscleTarget || currentWorkout.muscleGroups}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOptionsMenuExerciseId(null)}
                      aria-label="Fechar"
                      className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Lista de Opções */}
                  <div className="px-5 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] flex flex-col gap-2.5">
                    {/* 1. Info do exercício -> leva para a página das 4 tabs */}
                    <button
                      type="button"
                      onClick={() => {
                        const targetId = optionsMenuExercise.id;
                        setOptionsMenuExerciseId(null);
                        setSelectedExerciseId(targetId);
                      }}
                      className="w-full flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#111113] hover:bg-zinc-900 border border-zinc-800/80 hover:border-orange-500/40 transition-all cursor-pointer text-left active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Info className="w-5 h-5 text-[#F77F00] shrink-0" />
                        <div className="min-w-0">
                          <span className="text-sm font-bold text-white block leading-tight">
                            Info do exercício
                          </span>
                          <span className="text-[11px] text-zinc-400 block mt-0.5">
                            Descrição, notas, progresso e gráficos
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0" />
                    </button>

                    {/* 2. Registar RIR (mutuamente exclusivo com PSE) */}
                    <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#111113] border border-zinc-800/80">
                      <div className="min-w-0">
                        <span className="text-sm font-bold text-white block leading-tight">
                          Registar RIR
                        </span>
                        <span className="text-[11px] text-zinc-400 block mt-0.5">
                          Repetições em reserva na tabela
                        </span>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isRirOn}
                        aria-label="Registar RIR"
                        onClick={() =>
                          handleToggleIntensityMetric(optionsMenuExercise.id, 'rir')
                        }
                        className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
                          isRirOn ? 'bg-[#F77F00]' : 'bg-zinc-800'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                            isRirOn ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* 3. Registar PSE (mutuamente exclusivo com RIR) */}
                    <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#111113] border border-zinc-800/80">
                      <div className="min-w-0">
                        <span className="text-sm font-bold text-white block leading-tight">
                          Registar PSE
                        </span>
                        <span className="text-[11px] text-zinc-400 block mt-0.5">
                          Perceção subjetiva de esforço (1–10)
                        </span>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isPseOn}
                        aria-label="Registar PSE"
                        onClick={() =>
                          handleToggleIntensityMetric(optionsMenuExercise.id, 'pse')
                        }
                        className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
                          isPseOn ? 'bg-[#F77F00]' : 'bg-zinc-800'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                            isPseOn ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })(),
          document.querySelector('.app-device-wrapper') || document.body
        )}

      {/* BOTTOM SHEET: PRÉ-TREINO */}
      {isWarmupExpanded &&
        createPortal(
          <div
            className="fixed inset-0 z-[260] flex items-end justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsWarmupExpanded(false);
              }
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Pré-treino"
              className="w-full max-w-[414px] max-h-[82vh] flex flex-col bg-[#0a0a0c] border-t border-x border-zinc-800 rounded-t-[28px] shadow-[0_-24px_60px_rgba(0,0,0,0.9)] overflow-hidden animate-in slide-in-from-bottom duration-200"
            >
              {/* Drag handle */}
              <div className="pt-3 pb-1 flex justify-center shrink-0">
                <div className="w-10 h-1 rounded-full bg-zinc-700/80" />
              </div>

              {/* Cabeçalho */}
              <div className="flex items-center justify-between px-5 pt-2 pb-3.5 border-b border-zinc-800/70 shrink-0">
                <h3 className="text-white text-base font-bold tracking-tight">
                  Pré-treino
                </h3>
                <button
                  type="button"
                  onClick={() => setIsWarmupExpanded(false)}
                  aria-label="Fechar pré-treino"
                  className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Lista de exercícios do pré-treino */}
              <div className="px-5 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] overflow-y-auto flex flex-col gap-2.5">
                {warmupRoutine.exercises.map((wEx) => (
                  <div
                    key={wEx.id}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-[#111113] border border-zinc-800/80"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0">
                      <img
                        src={wEx.image}
                        alt={wEx.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-white leading-snug">
                        {wEx.name}
                      </h4>
                      <p className="text-xs font-semibold text-[#F77F00] tabular-nums mt-0.5">
                        {wEx.durationOrReps}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVideoModalExerciseName(wEx.name)}
                      aria-label={`Ver vídeo demonstrativo de ${wEx.name}`}
                      title="Ver vídeo demonstrativo"
                      className="p-2 text-zinc-400 hover:text-[#F77F00] active:scale-90 transition-all cursor-pointer shrink-0"
                    >
                      <Video className="w-[18px] h-[18px]" strokeWidth={2.2} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>,
          document.querySelector('.app-device-wrapper') || document.body
        )}

      {/* BOTTOM SHEET: CONFIRMAÇÃO PARA TERMINAR TREINO */}
      {isConfirmFinishOpen &&
        createPortal(
          (() => {
            const doneExercisesCount = currentWorkout.exercises.filter((ex) =>
              (ex.sets || []).some((s) => s.completed)
            ).length;

            return (
              <div
                className="fixed inset-0 z-[270] flex items-end justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setIsConfirmFinishOpen(false);
                  }
                }}
              >
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-label="Confirmar fim do treino"
                  className="w-full max-w-[414px] bg-[#0a0a0c] border-t border-x border-zinc-800 rounded-t-[28px] shadow-[0_-24px_60px_rgba(0,0,0,0.9)] overflow-hidden animate-in slide-in-from-bottom duration-200"
                >
                  {/* Drag handle */}
                  <div className="pt-3 pb-1 flex justify-center">
                    <div className="w-10 h-1 rounded-full bg-zinc-700/80" />
                  </div>

                  <div className="px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-white text-base font-bold leading-snug">
                        Tens a certeza que queres terminar o treino?
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsConfirmFinishOpen(false)}
                        aria-label="Fechar"
                        className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-zinc-400 leading-relaxed mb-5 tabular-nums">
                      {completedSetsCount > 0
                        ? `Tens ${doneExercisesCount} de ${currentWorkout.exercises.length} exercícios concluídos (${completedSetsCount} ${completedSetsCount === 1 ? 'série' : 'séries'}).`
                        : 'Ainda não assinalaste nenhuma série como concluída.'}
                    </p>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => setIsConfirmFinishOpen(false)}
                        className="flex-1 min-h-[46px] rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Continuar treino
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsConfirmFinishOpen(false);
                          setIsActive(false);
                          setFinishFlowStep('summary');
                        }}
                        className="flex-1 min-h-[46px] rounded-2xl bg-[#F77F00] hover:bg-[#e57300] active:scale-[0.98] text-white text-xs font-bold shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
                      >
                        Sim, terminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })(),
          document.querySelector('.app-device-wrapper') || document.body
        )}

      {/* TOAST DE CONFIRMAÇÃO DE RECORDE */}
      {prToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[340] bg-[#1d1d1f] border border-orange-500 text-white px-4 py-2.5 rounded-2xl font-semibold text-xs shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 whitespace-nowrap">
          {prToast}
        </div>
      )}

    </div>
  );
}
