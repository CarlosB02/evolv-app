import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Check, 
  Pause, 
  Play, 
  ChevronDown, 
  ChevronUp, 
  Video, 
  Pencil,
  Edit3, 
  Clock, 
  Calendar, 
  Dumbbell, 
  Flame, 
  CheckCircle2, 
  Trophy, 
  Plus, 
  Trash2, 
  Sparkles,
  Info,
  Timer,
  FastForward,
  ChevronRight
} from 'lucide-react';
import { 
  DetailedWorkout, 
  ExerciseItem, 
  ExerciseSet, 
  WarmupRoutine, 
  getWorkoutWarmup, 
  generateDefaultSets 
} from '../data/workoutsData';
import { WorkoutEditFullPage } from './WorkoutEditFullPage';
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

  // Navigation mode: session view or full-page exercise edit
  const [isEditingExercisesPage, setIsEditingExercisesPage] = useState(false);

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

  // Finish flow steps: null -> 'summary' -> 'feedback' -> completed
  const [finishFlowStep, setFinishFlowStep] = useState<'summary' | 'feedback' | null>(null);

  useScrollToTop([isEditingExercisesPage, finishFlowStep]);
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

  // Active Exercise Execution Modal & Rest Timer
  const [activeExecExerciseId, setActiveExecExerciseId] = useState<string | null>(null);
  const [activeExecSetIndex, setActiveExecSetIndex] = useState<number>(0);
  const [execMode, setExecMode] = useState<'set_active' | 'resting' | 'ready_next_set' | 'completed'>('set_active');
  const [restCountdownSeconds, setRestCountdownSeconds] = useState<number>(90);
  const [totalRestDurationSeconds, setTotalRestDurationSeconds] = useState<number>(90);
  const [setTimerSeconds, setSetTimerSeconds] = useState<number>(0);

  // Derived current executing exercise
  const currentExecExercise = currentWorkout.exercises.find(e => e.id === activeExecExerciseId) || null;

  // Set execution timer effect (counts elapsed time of the active set)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeExecExerciseId && execMode === 'set_active') {
      interval = setInterval(() => {
        setSetTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeExecExerciseId, execMode]);

  // Rest countdown timer effect (counts down from 90 seconds to 0)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeExecExerciseId && execMode === 'resting') {
      interval = setInterval(() => {
        setRestCountdownSeconds(prev => {
          if (prev <= 1) {
            // Rest ended - trigger gentle vibration if available on mobile
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              try {
                navigator.vibrate([200, 100, 200]);
              } catch (_) {}
            }
            setExecMode('ready_next_set');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeExecExerciseId, execMode]);

  // Start workout overall session explicitly
  const handleStartOverallWorkout = () => {
    setHasStarted(true);
    setIsActive(true);
  };

  // Open exercise execution modal from individual exercise clock icon or button
  const handleOpenExerciseExecutionModal = (exerciseId: string) => {
    // Automatically ensure overall workout timer is also marked as started/active if user begins an exercise
    if (!hasStarted) {
      setHasStarted(true);
      setIsActive(true);
    }

    const ex = currentWorkout.exercises.find(e => e.id === exerciseId);
    if (!ex) return;
    const sets = ex.sets || [];
    const firstUncompleted = sets.findIndex(s => !s.completed);
    const targetIndex = firstUncompleted !== -1 ? firstUncompleted : 0;
    
    setActiveExecExerciseId(exerciseId);
    setActiveExecSetIndex(targetIndex);
    setExecMode('set_active');
    setSetTimerSeconds(0);
    setRestCountdownSeconds(90);
    setTotalRestDurationSeconds(90);
  };

  // Finish current set: marks completed, starts rest countdown if more sets, or marks completed if last
  const handleFinishCurrentSet = () => {
    if (!currentExecExercise) return;
    const sets = currentExecExercise.sets || [];
    
    // Auto check this set in the exercise table!
    handleToggleSetCompleted(currentExecExercise.id, activeExecSetIndex, true);

    // If this was the last set of the exercise:
    if (activeExecSetIndex >= sets.length - 1) {
      setExecMode('completed');
    } else {
      // Automatically start 90s rest countdown
      setRestCountdownSeconds(90);
      setTotalRestDurationSeconds(90);
      setExecMode('resting');
    }
  };

  // Start next set upon user confirmation (only starts after user interaction)
  const handleStartNextSet = () => {
    if (!currentExecExercise) return;
    setActiveExecSetIndex(prev => prev + 1);
    setSetTimerSeconds(0);
    setExecMode('set_active');
  };

  // Skip rest countdown and jump straight to ready
  const handleSkipRest = () => {
    setRestCountdownSeconds(0);
    setExecMode('ready_next_set');
  };

  // Add 30 seconds to rest countdown
  const handleAddRest30s = () => {
    setRestCountdownSeconds(prev => prev + 30);
    setTotalRestDurationSeconds(prev => prev + 30);
  };

  // Move to next exercise if available
  const handleGoToNextExercise = () => {
    if (!currentExecExercise) return;
    const currentIndex = currentWorkout.exercises.findIndex(e => e.id === currentExecExercise.id);
    if (currentIndex !== -1 && currentIndex < currentWorkout.exercises.length - 1) {
      const nextEx = currentWorkout.exercises[currentIndex + 1];
      handleOpenExerciseExecutionModal(nextEx.id);
    } else {
      setActiveExecExerciseId(null);
    }
  };

  const formatCountdown = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Toggle set completed status (supports optional forceCompleted flag) + PR detection
  const handleToggleSetCompleted = (exerciseId: string, setIndex: number, forceCompleted?: boolean) => {
    const targetEx = currentWorkout.exercises.find(ex => ex.id === exerciseId);
    const targetSet = targetEx?.sets?.[setIndex];

    if (targetEx && targetSet) {
      const nextStatus = forceCompleted !== undefined ? forceCompleted : !targetSet.completed;
      if (nextStatus) {
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
    }

    setCurrentWorkout(prev => {
      const updatedExercises = prev.exercises.map(ex => {
        if (ex.id !== exerciseId) return ex;
        const updatedSets = [...(ex.sets || [])];
        if (updatedSets[setIndex]) {
          const nextStatus = forceCompleted !== undefined ? forceCompleted : !updatedSets[setIndex].completed;
          updatedSets[setIndex] = {
            ...updatedSets[setIndex],
            completed: nextStatus
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

  // Total series and completed series count
  const allSets = currentWorkout.exercises.flatMap(ex => ex.sets || []);
  const completedSetsCount = allSets.filter(s => s.completed).length;
  const totalSetsCount = allSets.length;
  const progressPercent = totalSetsCount > 0 ? Math.round((completedSetsCount / totalSetsCount) * 100) : 0;

  // Handle saving from the full-page edit
  const handleSaveExercisesFromFullPage = (updated: DetailedWorkout) => {
    setCurrentWorkout(updated);
    setIsEditingExercisesPage(false);
    if (onUpdateWorkout) {
      onUpdateWorkout(updated);
    }
  };

  // If user opened the full page edit view, render it
  if (isEditingExercisesPage) {
    return (
      <WorkoutEditFullPage
        workout={currentWorkout}
        onSave={handleSaveExercisesFromFullPage}
        onCancel={() => setIsEditingExercisesPage(false)}
      />
    );
  }

  // Get current date formatted (ex: 11/10/2026 or from workout)
  const today = new Date();
  const dateFormatted = currentWorkout.dateFormatted || 
    `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

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

        <button
          type="button"
          onClick={() => setIsEditingExercisesPage(true)}
          className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 flex items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0"
          title="Editar Composição dos Exercícios"
          aria-label="Editar Exercícios"
        >
          <Pencil className="w-4 h-4 text-orange-500" />
        </button>
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
            <div>
              <span className="font-mono text-base sm:text-lg font-bold text-white tracking-wider block leading-tight">
                {formatTimer(seconds)}
              </span>
              <span className="text-[10px] text-zinc-500 font-medium">
                {hasStarted ? (isActive ? 'Treino em curso' : 'Treino em pausa') : 'Não iniciado'}
              </span>
            </div>
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
                  onClick={() => {
                    setIsActive(false);
                    setFinishFlowStep('summary');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer"
                >
                  Terminar
                </button>
              </>
            )}
          </div>
        </div>

        {/* Botão em destaque adicional quando ainda não começou para máxima usabilidade */}
        {!hasStarted && (
          <button
            type="button"
            onClick={handleStartOverallWorkout}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:scale-[0.99] text-white font-bold text-xs shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Começar Treino & Ativar Cronómetro</span>
          </button>
        )}
      </div>

      {/* 4. BARRA PRÉ-TREINO (BARRA HORIZONTAL COMPACTA COM EXPANSÃO DIRETA) */}
      <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-2xl overflow-hidden shadow-sm transition-all">
        {/* Barra compacta */}
        <button
          type="button"
          onClick={() => setIsWarmupExpanded(!isWarmupExpanded)}
          className="w-full px-3.5 py-3 flex items-center justify-between hover:bg-zinc-900/50 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white">Pré-treino</span>
          </div>

          <div className="flex items-center gap-1.5 text-orange-400 text-xs font-semibold">
            <span>Ver pré-treino</span>
            {isWarmupExpanded ? (
              <ChevronUp className="w-4 h-4 text-orange-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-orange-400" />
            )}
          </div>
        </button>

        {/* Dropdown com a rotina de aquecimento */}
        {isWarmupExpanded && (
          <div className="p-3.5 pt-0 border-t border-zinc-800/60 bg-zinc-950/40 flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between py-1 text-[11px] text-zinc-400">
              <span className="font-semibold text-zinc-300">{warmupRoutine.title}</span>
              <span className="text-orange-400 font-bold">{warmupRoutine.estimatedDuration} • {warmupRoutine.exercisesCount} exercícios</span>
            </div>

            <div className="flex flex-col gap-2">
              {warmupRoutine.exercises.map((wEx) => (
                <div 
                  key={wEx.id}
                  className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/70 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-11 h-11 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0">
                      <img 
                        src={wEx.image} 
                        alt={wEx.name}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">
                        {wEx.name}
                      </h4>
                      <p className="text-[10px] text-orange-400 font-medium">
                        {wEx.durationOrReps} • {wEx.muscleFocus}
                      </p>
                    </div>
                  </div>

                  {/* Botão de vídeo demonstrativo */}
                  <button
                    type="button"
                    onClick={() => setVideoModalExerciseName(wEx.name)}
                    className="p-2 rounded-xl bg-zinc-800/80 hover:bg-orange-500/10 text-zinc-400 hover:text-orange-400 border border-zinc-700/60 transition-colors cursor-pointer shrink-0"
                    title="Ver vídeo demonstrativo"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. TÍTULO SEPARADOR: EXERCÍCIOS */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between pt-1 px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              EXERCÍCIOS
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-bold">
              {currentWorkout.exercises.length}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsEditingExercisesPage(true)}
            className="text-[11px] text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Pencil className="w-3 h-3" />
            <span>Editar lista</span>
          </button>
        </div>

        {/* Exercícios interativos */}
        <div className="flex flex-col gap-3">
          {currentWorkout.exercises.map((ex, exIdx) => {
            const isExpanded = !!expandedExerciseIds[ex.id];
            const sets = ex.sets || [];
            const completedCount = sets.filter(s => s.completed).length;
            const isAllCompleted = sets.length > 0 && completedCount === sets.length;

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
                {/* CARD CABEÇALHO DO EXERCÍCIO (CLICÁVEL PARA EXPANDIR DROPDOWN) */}
                <div 
                  onClick={() => toggleExerciseDropdown(ex.id)}
                  className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-zinc-900/40 transition-colors"
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

                    {/* Informações: Nome e Grupos Musculares (sublinha de series/reps removida conforme pedido) */}
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

                  {/* Ações do Exercício: Cronómetro Individual, Vídeo e Dropdown Toggle */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Ícone de relógio individual em cada exercício para abrir pop-up animado de execução */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenExerciseExecutionModal(ex.id);
                      }}
                      className="w-8 h-8 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center transition-all cursor-pointer active:scale-95"
                      title="Iniciar cronómetro deste exercício"
                      aria-label="Iniciar cronómetro deste exercício"
                    >
                      <Clock className="w-4 h-4 text-orange-400" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setVideoModalExerciseName(ex.name);
                      }}
                      className="w-8 h-8 rounded-xl bg-zinc-900 hover:bg-orange-500/10 text-zinc-400 hover:text-orange-400 border border-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
                      title="Vídeo demonstrativo"
                      aria-label="Abrir vídeo demonstrativo"
                    >
                      <Video className="w-4 h-4" />
                    </button>

                    <div className="w-8 h-8 rounded-xl bg-zinc-900 text-zinc-400 flex items-center justify-center">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-orange-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </div>
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
                      <div className="col-span-2">REPS</div>
                      <div className="col-span-1">RIR</div>
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
                            <div className="col-span-1 text-center font-bold text-zinc-400 text-xs">
                              {st.setNumber}
                            </div>

                            {/* Desempenho Anterior */}
                            <div className="col-span-3 text-center text-[10px] text-zinc-400 font-medium truncate">
                              {st.prevWeight} × {st.prevReps.replace(' reps', '')}
                            </div>

                            {/* Carga Utilizada */}
                            <div className="col-span-3">
                              <input 
                                type="text"
                                value={st.weight}
                                onChange={(e) => handleUpdateSet(ex.id, setIdx, 'weight', e.target.value)}
                                placeholder="kg"
                                className="w-full py-1 px-1.5 bg-black/60 border border-zinc-700/60 rounded-lg text-white font-bold text-xs text-center focus:outline-none focus:border-orange-500"
                              />
                            </div>

                            {/* Repetições Realizadas */}
                            <div className="col-span-2">
                              <input 
                                type="text"
                                value={st.reps}
                                onChange={(e) => handleUpdateSet(ex.id, setIdx, 'reps', e.target.value)}
                                placeholder="reps"
                                className="w-full py-1 px-1 bg-black/60 border border-zinc-700/60 rounded-lg text-orange-400 font-bold text-xs text-center focus:outline-none focus:border-orange-500"
                              />
                            </div>

                            {/* RIR (Repetições em Reserva) */}
                            <div className="col-span-1">
                              <input 
                                type="text"
                                value={st.rir}
                                onChange={(e) => handleUpdateSet(ex.id, setIdx, 'rir', e.target.value)}
                                placeholder="2"
                                className="w-full py-1 bg-black/60 border border-zinc-700/60 rounded-lg text-zinc-300 font-medium text-[11px] text-center focus:outline-none focus:border-orange-500"
                              />
                            </div>

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

                    {/* Dica e Descanso do Exercício */}
                    <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2.5 mt-1 border-t border-zinc-800/60">
                      <span>Descanso recomendado: <strong className="text-white">{ex.restSeconds || 60}s</strong></span>
                      {ex.notes && (
                        <span className="text-orange-400/90 truncate max-w-[180px] italic">{ex.notes}</span>
                      )}
                    </div>

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
          onClick={() => {
            setIsActive(false);
            setFinishFlowStep('summary');
          }}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-[0.98] text-white font-medium text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Finalizar e Concluir Treino</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* MODAL ANIMADO: EXECUÇÃO DO EXERCÍCIO, INÍCIO/FIM DE SÉRIE & REST COUNTDOWN */}
      {/* ========================================================================= */}
      {currentExecExercise && (
        <div className="fixed inset-0 z-[280] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#0c0c0e] border border-orange-500/40 rounded-[28px] w-full max-w-sm p-6 shadow-2xl relative overflow-hidden flex flex-col items-center animate-in zoom-in-95 duration-200">
            {/* Efeito sutil de brilho superior */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
            
            {/* Botão fechar modal no topo direito */}
            <button
              type="button"
              onClick={() => setActiveExecExerciseId(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              title="Fechar painel de execução"
            >
              ✕
            </button>

            {/* Imagem miniatura e cabeçalho do exercício */}
            <div className="flex items-center gap-3 w-full mb-4 pr-8">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0">
                <img
                  src={currentExecExercise.image}
                  alt={currentExecExercise.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider block truncate">
                  Execução do Exercício
                </span>
                <h3 className="text-sm font-bold text-white truncate">
                  {currentExecExercise.name}
                </h3>
                <span className="text-[11px] text-zinc-400">
                  Série {activeExecSetIndex + 1} de {currentExecExercise.sets?.length || currentExecExercise.series}
                </span>
              </div>
            </div>

            {/* ESTADO 1: SÉRIE EM EXECUÇÃO */}
            {execMode === 'set_active' && (
              <div className="w-full flex flex-col items-center gap-4 animate-in fade-in duration-200">
                {/* Timer da série ativo com anel animado */}
                <div className="relative w-36 h-36 rounded-full bg-zinc-950 border-4 border-orange-500/40 flex flex-col items-center justify-center shadow-[0_0_25px_rgba(249,115,22,0.25)]">
                  <div className="absolute inset-0 rounded-full border border-orange-500/20 animate-ping opacity-25 pointer-events-none" />
                  <Clock className="w-5 h-5 text-orange-400 mb-1 animate-pulse" />
                  <span className="font-mono text-3xl font-extrabold text-white tracking-wider">
                    {formatCountdown(setTimerSeconds)}
                  </span>
                  <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold mt-0.5">
                    Tempo da Série
                  </span>
                </div>

                {/* Dados da série atual (Carga e Reps planejadas) */}
                {currentExecExercise.sets?.[activeExecSetIndex] && (
                  <div className="grid grid-cols-3 gap-2 w-full bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-3 text-center">
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Série</span>
                      <span className="text-sm font-bold text-white">#{activeExecSetIndex + 1}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Carga</span>
                      <span className="text-sm font-bold text-orange-400">
                        {(() => {
                          const rawWeight = currentExecExercise.sets[activeExecSetIndex].weight || '30';
                          const cleaned = rawWeight.trim();
                          return /kg$/i.test(cleaned) ? cleaned : `${cleaned} kg`;
                        })()}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Alvo Reps</span>
                      <span className="text-sm font-bold text-white">
                        {currentExecExercise.sets[activeExecSetIndex].reps || '12'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Botão Fim de Exercício / Série: dá check automático e inicia countdown de 90s */}
                <button
                  type="button"
                  onClick={handleFinishCurrentSet}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 active:scale-[0.98] text-white font-black text-sm shadow-xl shadow-orange-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>Fim da Série {activeExecSetIndex + 1}</span>
                </button>
                <p className="text-[11px] text-zinc-400 text-center">
                  Assinala como concluída e inicia o descanso de 90s
                </p>
              </div>
            )}

            {/* ESTADO 2: CONTAGEM DECRESCENTE DE DESCANSO (90 SEGUNDOS AUTOMÁTICO) */}
            {execMode === 'resting' && (
              <div className="w-full flex flex-col items-center gap-4 animate-in fade-in duration-200">
                {/* Indicador de que a série anterior foi concluída com sucesso */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Série {activeExecSetIndex + 1} concluída com sucesso!</span>
                </div>

                {/* Cronómetro regressivo circular com efeito de redução de outline, laranja mais carregado e glow vibrante */}
                {(() => {
                  const radius = 72;
                  const circumference = 2 * Math.PI * radius; // ~452.389
                  const duration = Math.max(1, totalRestDurationSeconds);
                  const progress = Math.max(0, Math.min(1, restCountdownSeconds / duration));
                  const strokeDashoffset = circumference * (1 - progress);

                  return (
                    <div className="relative w-48 h-48 flex items-center justify-center my-1 select-none">
                      {/* Glow de fundo pulsante sutil em laranja profundo */}
                      <div className="absolute inset-4 rounded-full bg-orange-600/15 blur-2xl pointer-events-none" />

                      <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
                        <defs>
                          {/* Gradiente laranja carregado e intenso */}
                          <linearGradient id="restOrangeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ea580c" />
                            <stop offset="50%" stopColor="#f97316" />
                            <stop offset="100%" stopColor="#ff4500" />
                          </linearGradient>

                          {/* Filtro de glow de alta densidade */}
                          <filter id="restOrangeGlow" x="-30%" y="-30%" width="160%" height="160%">
                            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                            <feMerge>
                              <feMergeNode in="coloredBlur" />
                              <feMergeNode in="coloredBlur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>

                        {/* Anel de fundo escuro com borda subtil */}
                        <circle
                          cx="80"
                          cy="80"
                          r={radius}
                          fill="#09090b"
                          stroke="#27272a"
                          strokeWidth="7"
                          className="opacity-90"
                        />

                        {/* Anel de progresso em redução com laranja carregado e glow envolvente */}
                        <circle
                          cx="80"
                          cy="80"
                          r={radius}
                          fill="transparent"
                          stroke="url(#restOrangeGrad)"
                          strokeWidth="7"
                          strokeLinecap="round"
                          filter="url(#restOrangeGlow)"
                          style={{
                            strokeDasharray: circumference,
                            strokeDashoffset: strokeDashoffset,
                            transition: 'stroke-dashoffset 1s linear'
                          }}
                        />
                      </svg>

                      {/* Conteúdo central: ícone, contagem e label */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                        <div className="w-8 h-8 rounded-full bg-orange-500/15 border border-orange-500/30 flex items-center justify-center mb-1">
                          <Timer className="w-4 h-4 text-orange-400 animate-pulse" />
                        </div>
                        <span className="font-mono text-4xl font-black text-white tracking-wider drop-shadow-[0_2px_12px_rgba(249,115,22,0.45)]">
                          {formatCountdown(restCountdownSeconds)}
                        </span>
                        <span className="text-[10px] text-orange-400/90 uppercase tracking-widest font-extrabold mt-0.5">
                          Descanso
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Controlos de descanso: +30s ou Avançar descanso */}
                <div className="flex items-center gap-2 w-full">
                  <button
                    type="button"
                    onClick={handleAddRest30s}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 transition-colors cursor-pointer"
                  >
                    +30s Descanso
                  </button>
                  <button
                    type="button"
                    onClick={handleSkipRest}
                    className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-orange-400 transition-colors cursor-pointer"
                  >
                    Saltar Descanso
                  </button>
                </div>

                {/* Iniciar próxima série manualmente ou aguardar */}
                <button
                  type="button"
                  onClick={handleStartNextSet}
                  className="w-full py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold text-xs shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Iniciar Série {activeExecSetIndex + 2} Já</span>
                </button>
              </div>
            )}

            {/* ESTADO 3: DESCANSO TERMINADO - ESPERA PELA INDICAÇÃO DO USER PARA INICIAR A SÉRIE SEGUINTE */}
            {execMode === 'ready_next_set' && (
              <div className="w-full flex flex-col items-center gap-4 animate-in fade-in duration-200">
                <div className="w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-1">
                  <Flame className="w-8 h-8 animate-bounce" />
                </div>

                <div className="text-center">
                  <h4 className="text-base font-extrabold text-white">
                    Descanso Terminado!
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Pronto para a série {activeExecSetIndex + 2}? Clica abaixo quando estiveres preparado.
                  </p>
                </div>

                {/* Botão de destaque: só começa depois com indicação do user */}
                <button
                  type="button"
                  onClick={handleStartNextSet}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 active:scale-[0.98] text-white font-extrabold text-sm shadow-xl shadow-orange-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Iniciar Série {activeExecSetIndex + 2}</span>
                </button>
              </div>
            )}

            {/* ESTADO 4: TODAS AS SÉRIES DESTE EXERCÍCIO CONCLUÍDAS */}
            {execMode === 'completed' && (
              <div className="w-full flex flex-col items-center gap-4 animate-in fade-in duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
                  <Trophy className="w-8 h-8" />
                </div>

                <div className="text-center">
                  <h4 className="text-base font-extrabold text-white">
                    Exercício Concluído!
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Todas as {currentExecExercise.sets?.length || currentExecExercise.series} séries foram registadas com sucesso.
                  </p>
                </div>

                <div className="flex flex-col gap-2 w-full pt-1">
                  <button
                    type="button"
                    onClick={handleGoToNextExercise}
                    className="w-full py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <span>Próximo Exercício</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveExecExerciseId(null)}
                    className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Voltar à Lista de Exercícios
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: VÍDEO DEMONSTRATIVO (PREPARADO PARA INTEGRAÇÃO)    */}
      {/* ========================================================= */}
      {videoModalExerciseName && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
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
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: TREINO CONCLUÍDO COM SUCESSO                       */}
      {/* ========================================================= */}
      {/* ========================================================= */}
      {/* FLUXO DE CONCLUSÃO: 1. RESUMO -> 2. FEEDBACK PÓS-TREINO   */}
      {/* ========================================================= */}
      {finishFlowStep === 'summary' && (
        <div className="fixed inset-0 z-[300] bg-black overflow-y-auto">
          <WorkoutSummaryView 
            data={{
              workoutName: currentWorkout.name,
              dateStr: 'Hoje',
              durationStr: formatTimer(seconds),
              exercisesCompletedStr: `${completedSetsCount > 0 ? currentWorkout.exercises.filter(e => e.sets?.some(s => s.completed)).length : currentWorkout.exercises.length}/${currentWorkout.exercises.length}`,
              prsCount: sessionPrCount > 0 ? sessionPrCount : 5,
              totalKg: (() => {
                const total = currentWorkout.exercises.reduce((acc, ex) => {
                  const exVol = (ex.sets || []).reduce((sAcc, st) => {
                    const w = parseInt((st.weight || '0').replace(/[^0-9]/g, ''), 10) || 0;
                    const r = parseInt((st.reps || '0').replace(/[^0-9]/g, ''), 10) || 0;
                    return sAcc + (w * r);
                  }, 0);
                  return acc + exVol;
                }, 0);
                return total > 0 ? total : 14000;
              })(),
              elephantEquivalentCount: 2,
              exercises: currentWorkout.exercises.length > 0
                ? currentWorkout.exercises.map((ex, i) => {
                    const bestSet = ex.sets?.find(s => s.completed) || ex.sets?.[0];
                    const weightNum = bestSet ? parseInt(bestSet.weight.replace(/[^0-9]/g, ''), 10) || 30 : 30;
                    const repsNum = bestSet ? parseInt(bestSet.reps.replace(/[^0-9]/g, ''), 10) || 12 : 12;
                    return {
                      setsCount: ex.sets?.length || ex.series || 2,
                      name: ex.name,
                      bestWeight: weightNum,
                      bestReps: repsNum,
                      isPr: i % 2 === 0,
                      progression: i === 0 ? '+2 reps' : i === 1 ? '+1 kg' : i === 2 ? '+1 kg' : i === 3 ? '+2 reps' : i === 4 ? '+2 reps' : ''
                    };
                  })
                : undefined
            }}
            onDone={() => setFinishFlowStep('feedback')}
          />
        </div>
      )}

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

      {/* TOAST DE CONFIRMAÇÃO DE RECORDE */}
      {prToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[340] bg-[#1d1d1f] border border-orange-500 text-white px-4 py-2.5 rounded-2xl font-semibold text-xs shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 whitespace-nowrap">
          {prToast}
        </div>
      )}

    </div>
  );
}
