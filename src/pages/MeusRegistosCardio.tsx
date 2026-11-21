import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronDown,
  Filter, 
  Plus, 
  MapPin, 
  Flame, 
  Zap, 
  X, 
  Check, 
  Calendar,
  Activity,
  FileText
} from 'lucide-react';
import { useCardio } from '../context/CardioContext';
import { useProfile } from '../context/ProfileContext';

interface MeusRegistosCardioProps {
  onBack: () => void;
  onOpenNewWorkout?: () => void;
}

type PeriodFilter = 'all' | 'week' | 'month' | 'past30';

export function MeusRegistosCardio({ onBack, onOpenNewWorkout }: MeusRegistosCardioProps) {
  const { 
    sessions, 
    addSession, 
    weekDays,
    selectedDate 
  } = useCardio();

  const { settings } = useProfile();
  const distUnit = settings.distanceUnit === 'Mi' ? 'mi' : 'km';
  const paceUnit = settings.distanceUnit === 'Mi' ? 'min/mi' : 'min/km';

  // Filters state
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const [equipmentFilter, setEquipmentFilter] = useState<string>('all');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Modal states
  const [isNewWorkoutModalOpen, setIsNewWorkoutModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New workout modal form state
  const [newDuration, setNewDuration] = useState<number>(45);
  const [newDistance, setNewDistance] = useState<number>(6.0);
  const [newCalories, setNewCalories] = useState<number>(360);
  const [newEquipment, setNewEquipment] = useState<string>('Passadeira');
  const [newSpeed, setNewSpeed] = useState<number>(8.5);
  const [newIncline, setNewIncline] = useState<number>(2.0);
  const [newBpm, setNewBpm] = useState<number>(142);
  const [newDate, setNewDate] = useState<string>(selectedDate);
  const [newTime, setNewTime] = useState<string>('10:00');
  const [newNotes, setNewNotes] = useState<string>('');
  const [newPeriod, setNewPeriod] = useState<string>('Pós-treino');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper to format Pace (/km)
  const formatPace = (durationMin: number, distKm?: number, speedKmH?: number): string => {
    let effectiveDist = distKm;
    if (!effectiveDist || effectiveDist <= 0) {
      if (speedKmH && speedKmH > 0) {
        effectiveDist = (speedKmH * durationMin) / 60;
      }
    }
    if (!effectiveDist || effectiveDist <= 0 || durationMin <= 0) {
      return '--:--';
    }
    const paceDecimal = durationMin / effectiveDist;
    const paceMinutes = Math.floor(paceDecimal);
    const paceSeconds = Math.round((paceDecimal - paceMinutes) * 60);
    const secStr = paceSeconds < 10 ? `0${paceSeconds}` : `${paceSeconds}`;
    const unit = paceUnit.replace('min/', '/').replace('min', '').trim();
    return `${paceMinutes}:${secStr} ${unit}`;
  };

  // Helper to format Date (DD/MM/YYYY)
  const formatDateShort = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const [year, month, day] = parts;
        return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Sort sessions chronologically (most recent first)
  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      const dateA = `${a.date}T${a.time || '00:00'}`;
      const dateB = `${b.date}T${b.time || '00:00'}`;
      return dateB.localeCompare(dateA);
    });
  }, [sessions]);

  // Filter sessions
  const filteredSessions = useMemo(() => {
    const now = new Date();
    const currentWeekDates = weekDays.map(d => d.dateStr);
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    return sortedSessions.filter((session) => {
      // Equipment filter
      if (equipmentFilter !== 'all' && session.equipment !== equipmentFilter) {
        return false;
      }

      // Period filter
      if (periodFilter === 'week') {
        return currentWeekDates.includes(session.date);
      }
      if (periodFilter === 'month') {
        return session.date.startsWith(currentYearMonth);
      }
      if (periodFilter === 'past30') {
        const sessionDate = new Date(session.date);
        const diffTime = Math.abs(now.getTime() - sessionDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
      }

      return true;
    });
  }, [sortedSessions, periodFilter, equipmentFilter, weekDays]);

  // Paginação: máximo de 3 registos iniciais, carrega mais 3 com "Ver mais"
  const [visibleCount, setVisibleCount] = useState<number>(3);

  // Reinicia a paginação quando os filtros mudam
  useEffect(() => {
    setVisibleCount(3);
  }, [periodFilter, equipmentFilter]);

  const displayedSessions = useMemo(() => {
    return filteredSessions.slice(0, visibleCount);
  }, [filteredSessions, visibleCount]);

  const hasMore = filteredSessions.length > visibleCount;

  // Unique equipments for filter
  const uniqueEquipments = useMemo(() => {
    const set = new Set<string>();
    sessions.forEach(s => {
      if (s.equipment) set.add(s.equipment);
    });
    return Array.from(set);
  }, [sessions]);

  // Nota curta por defeito caso a sessão não tenha nota guardada
  const getShortSessionNote = (notes?: string, equipment?: string) => {
    const cleaned = notes?.trim();
    if (cleaned) return cleaned;
    if (equipment?.toLowerCase().includes('bicicleta')) {
      return 'Cadência estável e boa recuperação.';
    }
    if (equipment?.toLowerCase().includes('elíptica')) {
      return 'Ritmo fluido e frequência cardíaca controlada.';
    }
    return 'Ritmo constante e boa sensação geral.';
  };

  // Open new workout modal / page
  const handleOpenNewWorkout = () => {
    if (onOpenNewWorkout) {
      onOpenNewWorkout();
      return;
    }
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setNewDuration(45);
    setNewDistance(6.0);
    setNewCalories(360);
    setNewEquipment('Passadeira');
    setNewSpeed(8.5);
    setNewIncline(2.0);
    setNewBpm(142);
    setNewDate(selectedDate);
    setNewTime(timeStr);
    setNewNotes('');
    setNewPeriod('Pós-treino');
    setIsNewWorkoutModalOpen(true);
  };

  // Submit new workout
  const handleCreateNewWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    addSession({
      durationMinutes: Number(newDuration),
      distanceKm: Number(newDistance),
      calories: Number(newCalories),
      equipment: newEquipment,
      speed: Number(newSpeed),
      incline: Number(newIncline),
      avgBpm: Number(newBpm),
      date: newDate,
      time: newTime,
      notes: newNotes.trim() ? newNotes.trim() : undefined,
      periodLabel: newPeriod,
    });

    setIsNewWorkoutModalOpen(false);
    showToast('Novo cardio registado com sucesso!');
  };

  const hasActiveFilters = periodFilter !== 'all' || equipmentFilter !== 'all';

  return (
    <div className="flex flex-col gap-4 px-5 pt-4 pb-20 animate-in fade-in zoom-in-95 duration-200">
      
      {/* CABEÇALHO */}
      <header className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 hover:bg-orange-500/20 active:scale-95 transition-all cursor-pointer"
            aria-label="Voltar"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
          </button>
          <h1 className="text-white text-xl font-bold tracking-tight">
            Meus registos
          </h1>
        </div>

        {/* Botão Filtrar */}
        <button 
          onClick={() => setIsFilterModalOpen(true)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all active:scale-95 cursor-pointer ${
            hasActiveFilters
              ? 'bg-orange-500 text-white border-orange-500 font-semibold shadow-sm shadow-orange-500/30'
              : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
          }`}
        >
          <Filter className="w-3.5 h-3.5" strokeWidth={2.2} />
          <span>Filtrar</span>
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-white ml-0.5" />
          )}
        </button>
      </header>

      {/* SUCCESS TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[370px] bg-emerald-500/95 text-white px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md border border-emerald-400/40 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-white stroke-[3]" />
          </div>
          <p className="text-xs font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* ACTIVE FILTER CHIPS (IF ANY) */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap pt-0.5">
          <span className="text-[11px] text-zinc-500 font-medium">Filtros:</span>
          {periodFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-orange-400 text-[10px] font-medium">
              {periodFilter === 'week' ? 'Esta semana' : periodFilter === 'month' ? 'Este mês' : 'Últimos 30 dias'}
              <button onClick={() => setPeriodFilter('all')} className="hover:text-white ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {equipmentFilter !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-orange-400 text-[10px] font-medium">
              {equipmentFilter}
              <button onClick={() => setEquipmentFilter('all')} className="hover:text-white ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <button 
            onClick={() => { setPeriodFilter('all'); setEquipmentFilter('all'); }}
            className="text-[10px] text-zinc-500 hover:text-zinc-300 underline cursor-pointer ml-auto"
          >
            Limpar todos
          </button>
        </div>
      )}

      {/* CONTAGEM DE RESULTADOS */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
        <span>{filteredSessions.length} {filteredSessions.length === 1 ? 'treino encontrado' : 'treinos encontrados'}</span>
        <span className="text-zinc-500">Ordenado por data decrescente</span>
      </div>

      {/* LISTA DE REGISTOS */}
      <div className="flex flex-col gap-3">
        {filteredSessions.length === 0 ? (
          <div className="bg-[#0a0a0a] border border-zinc-800/60 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-3">
              <Activity className="w-6 h-6" />
            </div>
            <p className="text-white text-sm font-semibold mb-1">Nenhum registo encontrado</p>
            <p className="text-zinc-500 text-xs max-w-[240px] mb-4">
              Não existem treinos com os filtros selecionados ou ainda não registou sessões.
            </p>
            <button
              onClick={handleOpenNewWorkout}
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white text-xs font-medium flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2]" />
              <span>Registar primeiro cardio</span>
            </button>
          </div>
        ) : (
          displayedSessions.map((session, index) => {
            // Is it the very first session in the list?
            const isLatest = index === 0 && periodFilter === 'all' && equipmentFilter === 'all';
            const dist = session.distanceKm || Number(((session.speed * (session.durationMinutes / 60)).toFixed(1)));
            const pace = formatPace(session.durationMinutes, dist, session.speed);

            return (
              <div 
                key={session.id}
                className={`bg-[#0a0a0a] border rounded-[22px] p-4 flex flex-col relative transition-all shadow-md shadow-black/30 hover:border-zinc-700 ${
                  isLatest 
                    ? 'border-orange-500/50 bg-gradient-to-b from-orange-500/[0.04] to-[#0a0a0a]' 
                    : 'border-zinc-800/70'
                }`}
              >
                {/* TOPO DO CARD: Data e Equipamento à esquerda | Tempo total à direita */}
                <div className="flex items-center justify-between mb-3.5">
                  {/* Lado esquerdo: Data e Equipamento em texto pequeno por baixo */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 text-zinc-300 text-xs font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      <span>{formatDateShort(session.date)}</span>
                    </div>
                    <span className="text-[11px] text-zinc-400 font-normal mt-0.5">
                      {session.equipment}
                    </span>
                  </div>

                  {/* Lado direito: Total de tempo */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-white tracking-tight tabular-nums">
                      {session.durationMinutes}
                    </span>
                    <span className="text-zinc-400 text-xs font-medium">min</span>
                  </div>
                </div>

                {/* AS 3 MÉTRICAS DO FUNDO: Juntas num único bloco separadas por linha simples */}
                <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl grid grid-cols-[1fr_1.35fr_1fr] divide-x divide-zinc-800/80 p-2.5">
                  {/* Distância */}
                  <div className="pr-2 min-w-0">
                    <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-medium mb-0.5 whitespace-nowrap">
                      <MapPin className="w-3 h-3 text-orange-500 shrink-0" />
                      <span className="truncate">Distância</span>
                    </div>
                    <p className="text-white text-xs font-semibold tracking-tight whitespace-nowrap">
                      {dist.toFixed(1)} <span className="text-[10px] text-zinc-400 font-normal">{distUnit}</span>
                    </p>
                  </div>

                  {/* Pace médio */}
                  <div className="px-2 min-w-0">
                    <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-medium mb-0.5 whitespace-nowrap">
                      <Zap className="w-3 h-3 text-orange-500 shrink-0" />
                      <span className="whitespace-nowrap">Pace médio</span>
                    </div>
                    <p className="text-white text-xs font-semibold tracking-tight whitespace-nowrap" title={pace}>
                      {pace}
                    </p>
                  </div>

                  {/* Calorias gastas */}
                  <div className="pl-2 min-w-0">
                    <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-medium mb-0.5 whitespace-nowrap">
                      <Flame className="w-3 h-3 text-orange-500 shrink-0" />
                      <span className="truncate">Calorias</span>
                    </div>
                    <p className="text-white text-xs font-semibold tracking-tight whitespace-nowrap">
                      {session.calories} <span className="text-[10px] text-zinc-400 font-normal">kcal</span>
                    </p>
                  </div>
                </div>

                {/* NOTA SIMPLES E PEQUENA */}
                <div className="mt-2.5 pt-2.5 border-t border-zinc-800/60 flex items-start gap-2">
                  <FileText className="w-3.5 h-3.5 text-orange-500/80 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-zinc-400 leading-snug line-clamp-2">
                    {getShortSessionNote(session.notes, session.equipment)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* BOTÃO "VER MAIS" (+3 SESSÕES) */}
      {hasMore && (
        <div className="pt-1">
          <button
            onClick={() => setVisibleCount((prev) => prev + 3)}
            className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800/90 border border-zinc-800 hover:border-zinc-700 active:scale-[0.99] text-zinc-300 hover:text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <ChevronDown className="w-4 h-4 text-orange-500" />
            <span>Ver mais</span>
          </button>
        </div>
      )}

      {/* BOTÃO NO FUNDO: REGISTAR NOVO CARDIO */}
      <div className="pt-2">
        <button
          onClick={handleOpenNewWorkout}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:scale-[0.99] text-white font-medium text-xs tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2]" />
          <span>Registar novo cardio</span>
        </button>
      </div>

      {/* ========================================= */}
      {/* MODAL: FILTRAR REGISTOS */}
      {/* ========================================= */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[420px] bg-zinc-950 border border-zinc-800 rounded-t-[28px] sm:rounded-[28px] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500">
                  <Filter className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Filtrar Registos</h3>
              </div>
              <button 
                onClick={() => setIsFilterModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Filtro por Período */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-2">
                  Período / Data
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'all', label: 'Todos os treinos' },
                    { id: 'week', label: 'Esta semana' },
                    { id: 'month', label: 'Este mês' },
                    { id: 'past30', label: 'Últimos 30 dias' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPeriodFilter(p.id as PeriodFilter)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                        periodFilter === p.id 
                          ? 'bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-500/20' 
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtro por Equipamento */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-2">
                  Equipamento
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setEquipmentFilter('all')}
                    className={`py-1.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                      equipmentFilter === 'all'
                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-500/20'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    Todos
                  </button>
                  {uniqueEquipments.map((eq) => (
                    <button
                      key={eq}
                      type="button"
                      onClick={() => setEquipmentFilter(eq)}
                      className={`py-1.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                        equipmentFilter === eq
                          ? 'bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-500/20'
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      {eq}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPeriodFilter('all');
                    setEquipmentFilter('all');
                    setIsFilterModalOpen(false);
                  }}
                  className="flex-1 py-3 rounded-xl bg-zinc-900 text-zinc-300 font-semibold text-xs border border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Repor Filtros
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium text-xs shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* ========================================= */}
      {/* MODAL: REGISTAR NOVO TREINO */}
      {/* ========================================= */}
      {isNewWorkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[420px] bg-zinc-950 border border-zinc-800 rounded-t-[28px] sm:rounded-[28px] p-6 shadow-2xl max-h-[90vh] overflow-y-auto hide-scrollbar animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500">
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Registar Novo Cardio</h3>
                  <p className="text-[11px] text-zinc-400">Adicione uma nova sessão de cardio</p>
                </div>
              </div>
              <button 
                onClick={() => setIsNewWorkoutModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewWorkout} className="space-y-4">
              {/* Data e Hora */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Data
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-medium text-xs focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Hora
                  </label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-medium text-xs focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              {/* Duração e Distância */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Duração (min)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="360"
                    value={newDuration}
                    onChange={(e) => {
                      const d = parseInt(e.target.value) || 0;
                      setNewDuration(d);
                      setNewCalories(Math.round(d * 8.2));
                      setNewDistance(Number(((8.5 * (d / 60)).toFixed(1))));
                    }}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-medium text-xs focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Distância ({distUnit})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={newDistance}
                    onChange={(e) => setNewDistance(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-medium text-xs focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              {/* Ritmo calculado preview */}
              <div className="p-2.5 bg-zinc-900/60 border border-zinc-800/80 rounded-xl flex items-center justify-between text-xs">
                <span className="text-zinc-400">Ritmo médio estimado:</span>
                <span className="text-orange-400 font-bold">
                  {formatPace(newDuration, newDistance, newSpeed)}
                </span>
              </div>

              {/* Equipamento */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                  Equipamento
                </label>
                <select
                  value={newEquipment}
                  onChange={(e) => setNewEquipment(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-medium text-xs focus:outline-none focus:border-orange-500"
                >
                  <option value="Passadeira">Passadeira</option>
                  <option value="Bicicleta Estática">Bicicleta Estática</option>
                  <option value="Elíptica">Elíptica</option>
                  <option value="Remo">Remo</option>
                  <option value="Escadas / Stairmaster">Escadas / Stairmaster</option>
                  <option value="Corrida Exterior">Corrida Exterior</option>
                </select>
              </div>

              {/* Calorias e BPM */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Calorias (kcal)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newCalories}
                    onChange={(e) => setNewCalories(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-medium text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    BPM Médio
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="220"
                    value={newBpm}
                    onChange={(e) => setNewBpm(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-medium text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                  Notas de treino (opcional)
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Ex: Ritmo progressivo, boa frequência cardíaca..."
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewWorkoutModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-zinc-900 text-zinc-300 font-semibold text-xs border border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-medium text-xs shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
                >
                  Guardar Cardio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
