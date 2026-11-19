import React, { useState } from 'react';
import { 
  ChevronLeft, 
  History, 
  Check, 
  X, 
  Flame, 
  Heart, 
  Timer, 
  Gauge, 
  Sparkles,
  Info,
  MapPin,
  Activity,
  Flag
} from 'lucide-react';
import { useCardio } from '../context/CardioContext';
import { useProfile } from '../context/ProfileContext';

interface FinalizarCardioProps {
  onBack: () => void;
  onOpenHistory: () => void;
  initialDate?: string;
  onSuccess?: () => void;
}

export function FinalizarCardio({ 
  onBack, 
  onOpenHistory, 
  initialDate,
  onSuccess 
}: FinalizarCardioProps) {
  const { 
    weekDays, 
    selectedDate, 
    setSelectedDate, 
    config, 
    addSession,
    sessions
  } = useCardio();

  const { settings } = useProfile();
  const distUnit = settings.distanceUnit === 'Mi' ? 'mi' : 'km';
  const paceUnit = settings.distanceUnit === 'Mi' ? 'min/mi' : 'min/km';

  // Date selection
  const activeDate = initialDate || selectedDate;

  // Form states
  const [duration, setDuration] = useState<number>(30);
  const [durationUnit, setDurationUnit] = useState<'min' | 'h'>('min');
  const [machine, setMachine] = useState<string>(config.equipment || 'Passadeira');
  
  // Optional details
  const [distance, setDistance] = useState<string>('4.2');
  const [pace, setPace] = useState<string>('5:40');
  const [calories, setCalories] = useState<string>('245');
  const [avgBpm, setAvgBpm] = useState<string>('138');
  const [notes, setNotes] = useState<string>('');

  const MAX_NOTES_LENGTH = 200;

  // Helper to format minutes per km into mm:ss
  const calculatePaceString = (totalMins: number, distStr: string): string => {
    const numDist = parseFloat(distStr.replace(',', '.'));
    if (!isNaN(numDist) && numDist > 0 && totalMins > 0) {
      const paceDecimal = totalMins / numDist;
      const paceMins = Math.floor(paceDecimal);
      const paceSecs = Math.round((paceDecimal - paceMins) * 60);
      if (paceSecs === 60) {
        return `${paceMins + 1}:00`;
      }
      return `${paceMins}:${paceSecs < 10 ? '0' : ''}${paceSecs}`;
    }
    return '';
  };

  // Handle duration change with auto calorie and pace estimate
  const handleDurationChange = (val: number) => {
    setDuration(val);
    const totalMinutes = durationUnit === 'h' ? val * 60 : val;
    if (!calories || calories === '245' || calories === '0') {
      setCalories(String(Math.round(totalMinutes * 8.2)));
    }
    const computedPace = calculatePaceString(totalMinutes, distance);
    if (computedPace) {
      setPace(computedPace);
    }
  };

  // Handle distance change with auto pace calculation
  const handleDistanceChange = (val: string) => {
    setDistance(val);
    const totalMinutes = durationUnit === 'h' ? duration * 60 : duration;
    const computedPace = calculatePaceString(totalMinutes, val);
    if (computedPace) {
      setPace(computedPace);
    }
  };

  const handleUnitToggle = (unit: 'min' | 'h') => {
    if (unit === durationUnit) return;
    setDurationUnit(unit);
    let newDuration = duration;
    if (unit === 'h') {
      newDuration = parseFloat((duration / 60).toFixed(1)) || 0.5;
      setDuration(newDuration);
    } else {
      newDuration = Math.round(duration * 60) || 30;
      setDuration(newDuration);
    }
    const totalMinutes = unit === 'h' ? newDuration * 60 : newDuration;
    const computedPace = calculatePaceString(totalMinutes, distance);
    if (computedPace) {
      setPace(computedPace);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const totalMinutes = durationUnit === 'h' ? Math.round(duration * 60) : Math.round(duration);
    if (totalMinutes <= 0) return;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const numDist = distance.trim() !== '' ? parseFloat(distance.replace(',', '.')) : undefined;
    const numCal = calories.trim() !== '' ? parseInt(calories, 10) : undefined;
    const numBpm = avgBpm.trim() !== '' ? parseInt(avgBpm, 10) : undefined;

    addSession({
      date: activeDate,
      time: timeStr,
      durationMinutes: totalMinutes,
      equipment: machine,
      distanceKm: numDist && !isNaN(numDist) ? numDist : undefined,
      pace: pace.trim() !== '' ? pace.trim() : undefined,
      calories: numCal && !isNaN(numCal) ? numCal : undefined,
      avgBpm: numBpm && !isNaN(numBpm) ? numBpm : undefined,
      notes: notes.trim() !== '' ? notes.trim() : undefined,
      speed: config.speed,
      incline: config.incline,
      periodLabel: 'Treino'
    });

    if (onSuccess) {
      onSuccess();
    } else {
      onBack();
    }
  };

  return (
    <div className="flex flex-col gap-4 px-5 pt-4 pb-12 animate-in fade-in duration-200">
      
      {/* 1. CABEÇALHO */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 hover:bg-orange-500/20 active:scale-95 transition-all cursor-pointer"
            aria-label="Voltar"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-white text-lg font-bold tracking-tight">Cardio</h1>
            <p className="text-zinc-500 text-[11px]">Finalizar e guardar sessão</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenHistory}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 active:scale-95 text-xs font-semibold transition-all cursor-pointer"
        >
          <History className="w-4 h-4 text-orange-500" />
          <span>Meus registos</span>
        </button>
      </header>

      {/* 2. SELETOR HORIZONTAL DE DATAS */}
      <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-2xl p-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Data da Sessão
          </span>
          <span className="text-[11px] text-orange-500 font-medium">
            {activeDate}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {weekDays.map((item) => {
            const isSelected = item.dateStr === activeDate;
            const hasSessions = sessions.some(s => s.date === item.dateStr && s.durationMinutes > 0);
            const isToday = item.isToday;

            return (
              <button
                key={item.dateStr}
                type="button"
                onClick={() => setSelectedDate(item.dateStr)}
                className={`relative flex flex-col items-center justify-center aspect-square w-full rounded-xl transition-all cursor-pointer ${
                  isToday
                    ? 'bg-gradient-to-b from-orange-400 via-orange-500 to-orange-600 border border-orange-300/80 shadow-[0_0_14px_rgba(249,115,22,0.45)] ring-1 ring-orange-300/30 text-white font-bold scale-[1.02]'
                    : isSelected 
                      ? 'bg-orange-500/10 border-orange-500 text-orange-400 shadow-sm shadow-orange-500/20' 
                      : 'bg-zinc-950/60 border border-zinc-800/70 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <span className={`text-[10px] uppercase font-bold tracking-wider mb-0.5 ${
                  isToday 
                    ? 'text-white/90' 
                    : isSelected 
                      ? 'text-orange-500 font-semibold' 
                      : 'text-zinc-500'
                }`}>
                  {item.dayShort}
                </span>

                {isToday ? (
                  <span className="text-sm font-extrabold text-white leading-none">
                    {item.dayNum}
                  </span>
                ) : hasSessions ? (
                  <div className="flex items-center justify-center h-[18px]">
                    <Check 
                      className={`w-4 h-4 stroke-[3] ${
                        isSelected ? 'text-orange-400' : 'text-orange-500'
                      }`} 
                    />
                  </div>
                ) : (
                  <span className={`text-sm font-extrabold leading-none ${
                    isSelected ? 'text-white' : 'text-zinc-300'
                  }`}>
                    {item.dayNum}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. FORMULÁRIO — FINALIZAR CARDIO */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        {/* Card Principal */}
        <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-2xl p-5 shadow-lg flex flex-col gap-5">
          
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/25 flex items-center justify-center shrink-0">
                <Flame className="w-4 h-4 text-orange-500" />
              </div>
              <h2 className="text-white text-base font-bold tracking-tight">
                Finalizar cardio
              </h2>
            </div>
            <p className="text-zinc-400 text-xs mt-1">
              Confirme os detalhes do seu treino
            </p>
          </div>

          {/* Campo: Tempo de cardio */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 text-orange-500" />
                Tempo de cardio
              </label>
              
              {/* Seletor de unidade */}
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => handleUnitToggle('min')}
                  className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                    durationUnit === 'min'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  min
                </button>
                <button
                  type="button"
                  onClick={() => handleUnitToggle('h')}
                  className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                    durationUnit === 'h'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  h
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type="number"
                min="1"
                step={durationUnit === 'h' ? '0.1' : '1'}
                value={duration}
                onChange={(e) => handleDurationChange(parseFloat(e.target.value) || 0)}
                required
                className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-orange-500 transition-colors"
                placeholder="Ex: 30"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-xs font-bold pointer-events-none">
                {durationUnit}
              </span>
            </div>
          </div>

          {/* Campo: Máquina utilizada */}
          <div>
            <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5 mb-1.5">
              <Gauge className="w-3.5 h-3.5 text-orange-500" />
              Máquina utilizada
            </label>
            <div className="relative">
              <select
                value={machine}
                onChange={(e) => setMachine(e.target.value)}
                className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-medium text-xs focus:outline-none focus:border-orange-500 transition-colors cursor-pointer appearance-none"
              >
                <option value="Passadeira">Passadeira</option>
                <option value="Bicicleta Estática">Bicicleta Estática</option>
                <option value="Elíptica">Elíptica</option>
                <option value="Remo">Remo</option>
                <option value="Escadas / Stairmaster">Escadas / Stairmaster</option>
                <option value="Corrida Exterior">Corrida Exterior</option>
                <option value="Caminhada">Caminhada</option>
                <option value="Outro">Outro</option>
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 text-[10px] font-bold">
                ▼
              </div>
            </div>
          </div>

          {/* DETALHES (OPCIONAL) */}
          <div className="border-t border-zinc-800/80 pt-4 mt-1 flex flex-col gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-zinc-400 tracking-wider uppercase">
                Detalhes (Opcional)
              </span>
            </div>

            {/* Distância e Pace */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5 mb-1.5">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" />
                  <span>Distância ({distUnit})</span>
                </label>
                <input
                  type="text"
                  value={distance}
                  onChange={(e) => handleDistanceChange(e.target.value)}
                  placeholder="Ex: 5.0"
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500 font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5 mb-1.5">
                  <Activity className="w-3.5 h-3.5 text-orange-500" />
                  <span>Pace ({paceUnit})</span>
                </label>
                <input
                  type="text"
                  value={pace}
                  onChange={(e) => setPace(e.target.value)}
                  placeholder="Ex: 5:30"
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500 font-semibold"
                />
              </div>
            </div>

            {/* Calorias e BPM Médio */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5 mb-1.5">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  <span>Calorias (kcal)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="Ex: 250"
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500 font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5 mb-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>BPM Médio</span>
                </label>
                <input
                  type="number"
                  min="40"
                  max="220"
                  value={avgBpm}
                  onChange={(e) => setAvgBpm(e.target.value)}
                  placeholder="Ex: 140"
                  className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500 font-semibold"
                />
              </div>
            </div>

            {/* Notas adicionais */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-300">
                  Notas adicionais
                </label>
                <span className={`text-[10px] ${notes.length > MAX_NOTES_LENGTH ? 'text-rose-500 font-bold' : 'text-zinc-500'}`}>
                  {notes.length}/{MAX_NOTES_LENGTH}
                </span>
              </div>
              <textarea
                rows={3}
                maxLength={MAX_NOTES_LENGTH}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Bom ritmo, inclinação constante de 2%, sem dores articulares..."
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>

          </div>

        </div>

        {/* 4. AÇÕES: CANCELAR E CONFIRMAR */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={onBack}
            className="w-full py-3.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 active:scale-[0.98] border border-zinc-800 text-zinc-300 font-bold text-sm transition-all cursor-pointer text-center"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[3] text-white" />
            <span className="text-white font-bold">Confirmar</span>
          </button>
        </div>

      </form>

    </div>
  );
}
