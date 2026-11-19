import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Check, 
  Layers, 
  ArrowUp, 
  ArrowDown, 
  ChevronDown, 
  ChevronUp, 
  Dumbbell, 
  Sparkles, 
  Calendar, 
  Video, 
  X,
  Play
} from 'lucide-react';
import { 
  DetailedWorkout, 
  ExerciseItem, 
  ExerciseSet, 
  WarmupRoutine, 
  getWorkoutWarmup, 
  generateDefaultSets 
} from '../data/workoutsData';

interface WorkoutEditFullPageProps {
  workout: DetailedWorkout;
  onSave: (updatedWorkout: DetailedWorkout) => void;
  onCancel: () => void;
}

export function WorkoutEditFullPage({
  workout,
  onSave,
  onCancel
}: WorkoutEditFullPageProps) {
  // Inicialização dos exercícios com garantia de sets definidos
  const [exercises, setExercises] = useState<ExerciseItem[]>(() => {
    const cloned: ExerciseItem[] = JSON.parse(JSON.stringify(workout.exercises));
    return cloned.map((ex, idx) => {
      const seriesCount = ex.series || 3;
      let sets = (ex.sets && ex.sets.length > 0)
        ? ex.sets
        : generateDefaultSets(seriesCount, ex.weightSuggestion || '30 kg');

      // Sanitize 4-digit / crazy weights like 1216
      sets = sets.map((st, i) => {
        const num = parseInt(st.weight.replace(/[^0-9]/g, ''), 10);
        if (num > 120 || String(num).length > 2) {
          const fallbackSets = generateDefaultSets(seriesCount, ex.weightSuggestion || '30 kg');
          const safeKg = fallbackSets[i]?.weight || '30';
          return {
            ...st,
            weight: safeKg,
            prevWeight: `${safeKg} kg`
          };
        }
        return st;
      });

      return {
        ...ex,
        order: idx + 1,
        series: sets.length,
        sets
      };
    });
  });

  // Estado para controlar quais exercícios estão expandidos (dropdown)
  // Por omissão, o primeiro exercício começa expandido
  const [expandedExerciseIds, setExpandedExerciseIds] = useState<Record<string, boolean>>(() => {
    if (workout.exercises.length > 0) {
      return { [workout.exercises[0].id]: true };
    }
    return {};
  });

  // Estado da barra de Pré-treino (expandida/recolhida)
  const [isWarmupExpanded, setIsWarmupExpanded] = useState(false);

  // Modal para pré-visualização de vídeo
  const [videoModalExerciseName, setVideoModalExerciseName] = useState<string | null>(null);

  // Modal / Formulário para adicionar novo exercício
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExSeries, setNewExSeries] = useState(3);
  const [newExReps, setNewExReps] = useState('10–12');
  const [newExWeight, setNewExWeight] = useState('20 kg');
  const [newExMuscle, setNewExMuscle] = useState('');

  // Rotina de pré-treino
  const warmupRoutine: WarmupRoutine = workout.warmup || getWorkoutWarmup(workout.dayKey);

  // Alternar dropdown de expansão de um exercício
  const toggleExerciseDropdown = (id: string) => {
    setExpandedExerciseIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Atualizar campo de um exercício (ex: nome)
  const handleUpdateExerciseField = (id: string, field: keyof ExerciseItem, value: any) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== id) return ex;
      return { ...ex, [field]: value };
    }));
  };

  // Atualizar um campo específico de uma série (weight, reps, rir)
  const handleUpdateSet = (exerciseId: string, setIndex: number, field: keyof ExerciseSet, value: string) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex;
      const sets = [...(ex.sets || [])];
      if (sets[setIndex]) {
        sets[setIndex] = {
          ...sets[setIndex],
          [field]: value
        };
      }
      return {
        ...ex,
        sets
      };
    }));
  };

  // Adicionar uma nova série ao exercício
  const handleAddSetToExercise = (exerciseId: string) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex;
      const sets = [...(ex.sets || [])];
      const newSetNumber = sets.length + 1;
      const lastSet = sets[sets.length - 1];
      const weightVal = lastSet?.weight || ex.weightSuggestion || '25 kg';
      const repsVal = lastSet?.reps || '12';
      const rirVal = lastSet?.rir || '2';

      const newSet: ExerciseSet = {
        setNumber: newSetNumber,
        prevWeight: lastSet?.prevWeight || weightVal,
        prevReps: lastSet?.prevReps || `${repsVal} reps`,
        weight: weightVal,
        reps: repsVal,
        rir: rirVal,
        completed: false
      };

      const updatedSets = [...sets, newSet];
      return {
        ...ex,
        series: updatedSets.length,
        sets: updatedSets
      };
    }));
  };

  // Remover uma série específica de um exercício
  const handleRemoveSetFromExercise = (exerciseId: string, setIndex: number) => {
    setExercises(prev => prev.map(ex => {
      if (ex.id !== exerciseId) return ex;
      const sets = [...(ex.sets || [])];
      if (sets.length <= 1) return ex; // Mantém pelo menos 1 série

      sets.splice(setIndex, 1);
      // Renumerar séries
      const renumberedSets = sets.map((st, i) => ({
        ...st,
        setNumber: i + 1
      }));

      return {
        ...ex,
        series: renumberedSets.length,
        sets: renumberedSets
      };
    }));
  };

  // Mover exercício para cima ou para baixo na sequência
  const handleMoveExercise = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= exercises.length) return;
    const newItems = [...exercises];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIndex, 0, moved);
    setExercises(newItems.map((ex, idx) => ({ ...ex, order: idx + 1 })));
  };

  // Remover exercício da lista
  const handleDeleteExercise = (id: string) => {
    setExercises(prev => {
      const filtered = prev.filter(ex => ex.id !== id);
      return filtered.map((ex, idx) => ({ ...ex, order: idx + 1 }));
    });
  };

  // Submeter formulário de novo exercício
  const handleAddNewExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExName.trim()) return;

    const seriesCount = Math.max(1, newExSeries);
    const weightVal = newExWeight.trim() || '20 kg';
    const repsVal = newExReps.trim() || '10–12';
    const newId = `ex-custom-${Date.now()}`;

    const newEx: ExerciseItem = {
      id: newId,
      order: exercises.length + 1,
      name: newExName.trim(),
      series: seriesCount,
      reps: repsVal,
      weightSuggestion: weightVal,
      muscleTarget: newExMuscle.trim() || workout.muscleGroups.split(',')[0],
      equipment: 'Máquinas e Halteres',
      image: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=400&auto=format&fit=crop',
      sets: generateDefaultSets(seriesCount, weightVal)
    };

    setExercises(prev => [...prev, newEx]);
    setExpandedExerciseIds(prev => ({ ...prev, [newId]: true }));
    setNewExName('');
    setNewExSeries(3);
    setNewExReps('10–12');
    setNewExWeight('20 kg');
    setNewExMuscle('');
    setIsAddingExercise(false);
  };

  // Guardar alterações e regressar
  const handleSaveAll = () => {
    // Sincronizar séries e repetições de cada exercício
    const syncedExercises = exercises.map(ex => {
      const sets = ex.sets || [];
      const primaryReps = sets.length > 0 ? sets[0].reps : ex.reps;
      const primaryWeight = sets.length > 0 ? sets[0].weight : (ex.weightSuggestion || '25 kg');
      return {
        ...ex,
        series: sets.length,
        reps: primaryReps.includes('–') || primaryReps.includes('-') ? primaryReps : `${primaryReps} reps`,
        weightSuggestion: primaryWeight
      };
    });

    onSave({
      ...workout,
      exercises: syncedExercises
    });
  };

  return (
    <div className="flex flex-col gap-4 px-5 pt-4 pb-28 animate-in fade-in duration-200">
      
      {/* 1. NOME DO TREINO NO TOPO (COM BOTÃO VOLTAR E BOTÃO GUARDAR) */}
      <header className="flex items-center justify-between">
        {/* Botão de voltar à esquerda */}
        <button 
          type="button"
          onClick={onCancel}
          className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0"
          aria-label="Voltar"
          title="Voltar"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>

        {/* Nome do treino centrado em destaque */}
        <div className="text-center px-2 flex-1 min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight uppercase truncate">
            {workout.name}
          </h1>
        </div>

        {/* Botão “Guardar” no canto superior direito */}
        <button
          type="button"
          onClick={handleSaveAll}
          className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs shadow-md shadow-orange-500/20 flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
        >
          <Check className="w-4 h-4 stroke-[3] text-white" />
          <span className="text-white font-bold">Guardar</span>
        </button>
      </header>

      {/* 2. DOIS INDICADORES COMPACTOS LADO A LADO: DATA E NÚMERO TOTAL DE EXERCÍCIOS */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Data do treino com ícone de calendário */}
        <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 shadow-sm">
          <Calendar className="w-4 h-4 text-orange-500 shrink-0" />
          <span className="text-xs font-semibold text-white truncate">
            {workout.dayLabel || 'Segunda-feira'}
          </span>
        </div>

        {/* Número total de exercícios com ícone de haltere */}
        <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 shadow-sm">
          <Dumbbell className="w-4 h-4 text-orange-500 shrink-0" />
          <span className="text-xs font-semibold text-white truncate">
            {exercises.length} exercícios
          </span>
        </div>
      </div>

      {/* 3. BARRA PRÉ-TREINO (BARRA HORIZONTAL COMPACTA COM EXPANSÃO DIRETA) */}
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

      {/* 4. COMPOSIÇÃO DO TREINO (BARRA DE GESTÃO E ADIÇÃO) */}
      <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-2xl p-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-orange-500 shrink-0">
            <Layers className="w-4 h-4 text-orange-500" />
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-white block">
              Composição do Treino
            </span>
            <span className="text-[11px] text-zinc-400 font-medium truncate block">
              Altere séries, repetições, ordem ou adicione novos exercícios
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddingExercise(true)}
          className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-orange-400 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer shrink-0 ml-2"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>+ Adicionar</span>
        </button>
      </div>

      {/* FORMULÁRIO COMPACTO ADICIONAR NOVO EXERCÍCIO (SE ABERTO) */}
      {isAddingExercise && (
        <form 
          onSubmit={handleAddNewExercise}
          className="bg-zinc-950 border border-orange-500/40 rounded-2xl p-4 shadow-xl flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-orange-500" />
              Novo Exercício
            </span>
            <button 
              type="button"
              onClick={() => setIsAddingExercise(false)}
              className="text-zinc-500 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-zinc-400 hover:text-white" />
            </button>
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 font-medium block mb-1">Nome do Exercício</label>
            <input 
              type="text" 
              required
              value={newExName}
              onChange={(e) => setNewExName(e.target.value)}
              placeholder="Ex: Tríceps Testa na Barra W"
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500 placeholder:text-zinc-600"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-zinc-400 font-medium block mb-1">Séries</label>
              <input 
                type="number" 
                min="1" 
                max="10"
                value={newExSeries}
                onChange={(e) => setNewExSeries(parseInt(e.target.value) || 3)}
                className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-xs text-center focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 font-medium block mb-1">Repetições</label>
              <input 
                type="text" 
                value={newExReps}
                onChange={(e) => setNewExReps(e.target.value)}
                placeholder="10–12"
                className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-orange-400 font-bold text-xs text-center focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 font-medium block mb-1">Carga</label>
              <input 
                type="text" 
                value={newExWeight}
                onChange={(e) => setNewExWeight(e.target.value)}
                placeholder="20 kg"
                className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-xs text-center focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingExercise(false)}
              className="flex-1 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span>Adicionar Exercício</span>
            </button>
          </div>
        </form>
      )}

      {/* 5. TÍTULO SEPARADOR: EXERCÍCIOS */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between pt-1 px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              EXERCÍCIOS
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-bold">
              {exercises.length}
            </span>
          </div>

          <span className="text-[11px] text-zinc-400 font-medium">
            Modo de Edição
          </span>
        </div>

        {/* 6. LISTA DE EXERCÍCIOS (LINHAS COMPACTAS E EXPANSÍVEIS IDÊNTICAS AO MODO DE EXECUÇÃO) */}
        <div className="flex flex-col gap-3">
          {exercises.map((ex, index) => {
            const isExpanded = !!expandedExerciseIds[ex.id];
            const sets = ex.sets || [];

            return (
              <div 
                key={ex.id}
                className={`bg-[#0a0a0a] border rounded-2xl overflow-hidden transition-all shadow-sm ${
                  isExpanded ? 'border-orange-500/40 ring-1 ring-orange-500/20' : 'border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                {/* LINHA HORIZONTAL COMPACTA DO EXERCÍCIO */}
                <div 
                  onClick={() => toggleExerciseDropdown(ex.id)}
                  className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-zinc-900/40 transition-colors"
                >
                  {/* Lado Esquerdo: Indicador circular + Miniatura + Nome + Séries */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    
                    {/* Imagem + Badge de Ordem idêntico */}
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0">
                      <img 
                        src={ex.image} 
                        alt={ex.name} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-1 left-1 w-4 h-4 rounded-md bg-black/80 flex items-center justify-center text-[9px] font-black text-orange-400">
                        {index + 1}
                      </div>
                    </div>

                    {/* Informações: Nome, Grupos Musculares e Séries */}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-bold text-white truncate hover:text-orange-400 transition-colors">
                        {ex.name}
                      </h4>
                      <p className="text-[11px] text-zinc-400 font-medium truncate mt-0.5">
                        {ex.muscleTarget || workout.muscleGroups.split(',')[0]}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[10px]">
                        <span className="text-orange-400 font-semibold">
                          {sets.length} séries • {ex.reps}
                        </span>
                        <span className="text-zinc-600">|</span>
                        <span className="text-zinc-400 font-medium">
                          {ex.weightSuggestion || '30 kg'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Lado Direito: Ações de ordenação, remoção, vídeo e chevron dropdown */}
                  <div 
                    className="flex items-center gap-1 shrink-0"
                    onClick={(e) => e.stopPropagation()} // Permite clicar nas ações sem acionar o toggle
                  >
                    {/* Mover para cima */}
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveExercise(index, 'up')}
                      className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-20 disabled:cursor-not-allowed text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Mover para cima"
                      aria-label="Mover para cima"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>

                    {/* Mover para baixo */}
                    <button
                      type="button"
                      disabled={index === exercises.length - 1}
                      onClick={() => handleMoveExercise(index, 'down')}
                      className="w-7 h-7 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-20 disabled:cursor-not-allowed text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Mover para baixo"
                      aria-label="Mover para baixo"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Remover exercício */}
                    <button
                      type="button"
                      onClick={() => handleDeleteExercise(ex.id)}
                      className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                      title="Remover exercício"
                      aria-label="Remover exercício"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Dropdown Chevron Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleExerciseDropdown(ex.id)}
                      className="w-7 h-7 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center transition-colors ml-0.5 cursor-pointer"
                      title={isExpanded ? "Recolher detalhes" : "Expandir detalhes"}
                      aria-label={isExpanded ? "Recolher" : "Expandir"}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-orange-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-zinc-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* 7. TABELA DE SÉRIES (DROPDOWN DENTRO DO EXERCÍCIO EXPANDIDO) */}
                {isExpanded && (
                  <div className="p-3.5 pt-0 border-t border-zinc-800/80 bg-zinc-950/60 animate-in fade-in duration-200">
                    
                    {/* Campo para editar o nome do exercício */}
                    <div className="pt-2.5 pb-2">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                        Editar Nome do Exercício
                      </label>
                      <input 
                        type="text" 
                        value={ex.name}
                        onChange={(e) => handleUpdateExerciseField(ex.id, 'name', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-bold text-xs focus:outline-none focus:border-orange-500"
                      />
                    </div>

                    {/* Cabeçalho da Tabela de Séries idêntico */}
                    <div className="grid grid-cols-12 gap-1.5 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider text-center border-b border-zinc-800/60">
                      <div className="col-span-1">SET</div>
                      <div className="col-span-3">ANTERIOR</div>
                      <div className="col-span-3">CARGA (KG)</div>
                      <div className="col-span-2">REPS</div>
                      <div className="col-span-1">RIR</div>
                      <div className="col-span-2">AÇÃO</div>
                    </div>

                    {/* Linhas da Tabela de Séries */}
                    <div className="flex flex-col gap-1.5 pt-2">
                      {sets.map((st, setIdx) => (
                        <div 
                          key={setIdx}
                          className="grid grid-cols-12 gap-1.5 items-center p-1.5 rounded-xl bg-zinc-900/70 border border-zinc-800/80 text-xs text-white"
                        >
                          {/* 1. Número da Série */}
                          <div className="col-span-1 text-center font-bold text-zinc-400 text-xs">
                            {st.setNumber}
                          </div>

                          {/* 2. Desempenho Anterior */}
                          <div className="col-span-3 text-center text-[10px] text-zinc-400 font-medium truncate">
                            {st.prevWeight} × {st.prevReps.replace(' reps', '')}
                          </div>

                          {/* 3. Carga */}
                          <div className="col-span-3">
                            <input 
                              type="text"
                              value={st.weight}
                              onChange={(e) => handleUpdateSet(ex.id, setIdx, 'weight', e.target.value)}
                              placeholder="kg"
                              className="w-full py-1 px-1.5 bg-black/60 border border-zinc-700/60 rounded-lg text-white font-bold text-xs text-center focus:outline-none focus:border-orange-500"
                            />
                          </div>

                          {/* 4. Repetições */}
                          <div className="col-span-2">
                            <input 
                              type="text"
                              value={st.reps}
                              onChange={(e) => handleUpdateSet(ex.id, setIdx, 'reps', e.target.value)}
                              placeholder="reps"
                              className="w-full py-1 px-1 bg-black/60 border border-zinc-700/60 rounded-lg text-orange-400 font-bold text-xs text-center focus:outline-none focus:border-orange-500"
                            />
                          </div>

                          {/* 5. RIR */}
                          <div className="col-span-1">
                            <input 
                              type="text"
                              value={st.rir}
                              onChange={(e) => handleUpdateSet(ex.id, setIdx, 'rir', e.target.value)}
                              placeholder="2"
                              className="w-full py-1 bg-black/60 border border-zinc-700/60 rounded-lg text-zinc-300 font-medium text-[11px] text-center focus:outline-none focus:border-orange-500"
                            />
                          </div>

                          {/* 6. Ação: Eliminar Série */}
                          <div className="col-span-2 flex justify-center">
                            <button
                              type="button"
                              disabled={sets.length <= 1}
                              onClick={() => handleRemoveSetFromExercise(ex.id, setIdx)}
                              className="w-7 h-7 rounded-lg bg-zinc-800/80 hover:bg-rose-500/20 disabled:opacity-20 disabled:cursor-not-allowed text-zinc-400 hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
                              title="Remover série"
                              aria-label="Remover série"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Ação Integrada: Adicionar Série */}
                    <div className="pt-2.5">
                      <button
                        type="button"
                        onClick={() => handleAddSetToExercise(ex.id)}
                        className="w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-dashed border-zinc-700/80 text-orange-400 hover:text-orange-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Adicionar Série ({sets.length + 1})</span>
                      </button>
                    </div>

                  </div>
                )}

              </div>
            );
          })}

          {/* Estado vazio */}
          {exercises.length === 0 && (
            <div className="p-8 text-center bg-[#0a0a0a] border border-dashed border-zinc-800 rounded-2xl">
              <Dumbbell className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-zinc-400 text-xs font-semibold">Sem exercícios configurados</p>
              <button
                type="button"
                onClick={() => setIsAddingExercise(true)}
                className="mt-3 px-4 py-2 rounded-xl bg-orange-500 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-md shadow-orange-500/20 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Adicionar primeiro exercício</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 8. BOTÕES DE AÇÃO INFERIORES */}
      <div className="pt-2 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-semibold text-xs transition-colors cursor-pointer text-center"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSaveAll}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Check className="w-4 h-4 stroke-[3] text-white" />
          <span>Guardar Alterações</span>
        </button>
      </div>

      {/* MODAL DE VÍDEO DEMONSTRATIVO */}
      {videoModalExerciseName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-sm p-5 shadow-2xl flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 mb-3">
              <Video className="w-7 h-7" />
            </div>
            <h3 className="text-white font-bold text-sm mb-1">
              Vídeo Demonstrativo
            </h3>
            <p className="text-orange-400 font-medium text-xs mb-3">
              {videoModalExerciseName}
            </p>
            <p className="text-zinc-400 text-xs mb-5">
              A integração de streaming de vídeo de alta definição para este exercício estará disponível na próxima atualização.
            </p>
            <button
              type="button"
              onClick={() => setVideoModalExerciseName(null)}
              className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer"
            >
              Compreendido
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
