import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  Calendar, 
  Scale, 
  Dumbbell, 
  Moon, 
  Utensils, 
  Footprints, 
  Droplet, 
  TrendingUp, 
  TrendingDown, 
  Check, 
  Sparkles, 
  Save, 
  BarChart3, 
  SlidersHorizontal 
} from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { DailyLogEntry } from '../../types';

interface RegistoSemanalViewProps {
  onBack: () => void;
}

export function RegistoSemanalView({ onBack }: RegistoSemanalViewProps) {
  const { weeklyDailyLogs, updateDailyLog, settings } = useProfile();
  
  const [activeTab, setActiveTab] = useState<'registo' | 'graficos'>('registo');
  const [selectedDayId, setSelectedDayId] = useState<string>('qui'); // Thursday (today)
  const [period, setPeriod] = useState<'7d' | '30d' | '3m'>('7d');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const selectedDayLog = useMemo(() => {
    return weeklyDailyLogs.find(l => l.dayId === selectedDayId) || weeklyDailyLogs[0];
  }, [weeklyDailyLogs, selectedDayId]);

  // Local draft states for the active day form
  const [draftWeight, setDraftWeight] = useState<number>(selectedDayLog.weight);
  const [draftWorkoutDone, setDraftWorkoutDone] = useState<boolean>(selectedDayLog.workoutDone);
  const [draftWorkoutName, setDraftWorkoutName] = useState<string>(selectedDayLog.workoutName || '');
  const [draftSleepHours, setDraftSleepHours] = useState<number>(selectedDayLog.sleepHours);
  const [draftSleepQuality, setDraftSleepQuality] = useState<'Excelente' | 'Bom' | 'Regular' | 'Mau'>(selectedDayLog.sleepQuality);
  const [draftDietPercent, setDraftDietPercent] = useState<number>(selectedDayLog.dietAdherencePercent);
  const [draftSteps, setDraftSteps] = useState<number>(selectedDayLog.steps);
  const [draftWater, setDraftWater] = useState<number>(selectedDayLog.waterLiters);

  // Sync draft when selected day changes
  const handleSelectDay = (dayId: string) => {
    setSelectedDayId(dayId);
    const target = weeklyDailyLogs.find(l => l.dayId === dayId);
    if (target) {
      setDraftWeight(target.weight);
      setDraftWorkoutDone(target.workoutDone);
      setDraftWorkoutName(target.workoutName || '');
      setDraftSleepHours(target.sleepHours);
      setDraftSleepQuality(target.sleepQuality);
      setDraftDietPercent(target.dietAdherencePercent);
      setDraftSteps(target.steps);
      setDraftWater(target.waterLiters);
    }
  };

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    updateDailyLog(selectedDayId, {
      weight: Number(draftWeight),
      workoutDone: draftWorkoutDone,
      workoutName: draftWorkoutName,
      sleepHours: Number(draftSleepHours),
      sleepQuality: draftSleepQuality,
      dietAdherencePercent: Number(draftDietPercent),
      steps: Number(draftSteps),
      waterLiters: Number(draftWater),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Unit helpers
  const weightUnit = settings.weightUnit || 'Kg';

  // Calculations for charts
  const avgWeight = (weeklyDailyLogs.reduce((acc, l) => acc + l.weight, 0) / weeklyDailyLogs.length).toFixed(1);
  const avgSleep = (weeklyDailyLogs.reduce((acc, l) => acc + l.sleepHours, 0) / weeklyDailyLogs.length).toFixed(1);
  const avgSteps = Math.round(weeklyDailyLogs.reduce((acc, l) => acc + l.steps, 0) / weeklyDailyLogs.length);
  const avgDiet = Math.round(weeklyDailyLogs.reduce((acc, l) => acc + l.dietAdherencePercent, 0) / weeklyDailyLogs.length);
  const workoutsCompletedCount = weeklyDailyLogs.filter(l => l.workoutDone).length;

  return (
    <div className="flex flex-col px-5 pt-4 pb-12 animate-in fade-in zoom-in-95 duration-200">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer group"
        >
          <ChevronLeft className="w-5 h-5 text-orange-500 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-[13px] font-medium">Voltar ao Perfil</span>
        </button>
        <span className="text-zinc-500 text-xs font-mono">Acompanhamento • Semanal</span>
      </div>

      <div className="mb-4">
        <h2 className="text-white text-xl font-bold tracking-tight">Registo Semanal</h2>
        <p className="text-zinc-400 text-xs mt-0.5">
          Preenchimento diário dos teus 6 indicadores essenciais e evolução gráfica.
        </p>
      </div>

      {/* Main Tabs: Registo vs Gráficos */}
      <div className="flex p-1 rounded-xl bg-zinc-900 border border-zinc-800/80 mb-5">
        <button
          onClick={() => setActiveTab('registo')}
          className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'registo'
              ? 'bg-orange-500 text-white font-semibold shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Registo Diário (6 Itens)</span>
        </button>
        <button
          onClick={() => setActiveTab('graficos')}
          className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'graficos'
              ? 'bg-orange-500 text-white font-semibold shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Gráficos de Tendência</span>
        </button>
      </div>

      {/* TAB 1: REGISTO */}
      {activeTab === 'registo' && (
        <div className="space-y-4">
          
          {/* Day Selector (Seg - Dom) */}
          <div>
            <span className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider block mb-2 px-1">
              Seleciona o Dia da Semana
            </span>
            <div className="grid grid-cols-7 gap-1.5 bg-[#0a0a0a] p-1.5 rounded-2xl border border-zinc-800/80">
              {weeklyDailyLogs.map(log => {
                const isSelected = log.dayId === selectedDayId;
                const isToday = log.dayId === 'qui';

                return (
                  <button
                    key={log.dayId}
                    type="button"
                    onClick={() => handleSelectDay(log.dayId)}
                    className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25 scale-[1.03]'
                        : 'hover:bg-zinc-900 text-zinc-400'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-tight">
                      {log.dayId.substring(0, 3)}
                    </span>
                    <span className="text-xs font-black mt-0.5">
                      {log.dateStr.split(' ')[0]}
                    </span>
                    {log.workoutDone && (
                      <span className={`w-1.5 h-1.5 rounded-full mt-1 ${
                        isSelected ? 'bg-white' : 'bg-orange-500'
                      }`} />
                    )}
                    {isToday && !isSelected && (
                      <span className="absolute -top-1 w-2 h-0.5 rounded-full bg-orange-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Day Banner */}
          <div className="flex items-center justify-between px-1">
            <h3 className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-orange-500" />
              <span>{selectedDayLog.dayName} ({selectedDayLog.dateStr})</span>
            </h3>
            {saveSuccess && (
              <span className="text-emerald-400 text-xs font-bold flex items-center gap-1 animate-in fade-in">
                <Check className="w-3.5 h-3.5" />
                Guardado!
              </span>
            )}
          </div>

          {/* Form for 6 metrics */}
          <form onSubmit={handleSaveLog} className="space-y-3">
            
            {/* 1. PESO */}
            <div className="bg-[#0a0a0a] rounded-2xl p-3.5 border border-zinc-800/80">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                    <Scale className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-white text-xs font-bold block leading-tight">1. Peso Corporal</span>
                    <span className="text-zinc-500 text-[10px]">Pesagem em jejum ao acordar</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
                  <input
                    type="number"
                    step="0.1"
                    value={draftWeight}
                    onChange={e => setDraftWeight(parseFloat(e.target.value) || 0)}
                    className="w-14 bg-transparent text-white text-sm font-black text-right focus:outline-none"
                  />
                  <span className="text-zinc-400 text-xs font-bold">{weightUnit}</span>
                </div>
              </div>
            </div>

            {/* 2. TREINO */}
            <div className="bg-[#0a0a0a] rounded-2xl p-3.5 border border-zinc-800/80">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                    <Dumbbell className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-white text-xs font-bold block leading-tight">2. Treino Realizado</span>
                    <span className="text-zinc-500 text-[10px]">Cumprimento da sessão</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setDraftWorkoutDone(true)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      draftWorkoutDone
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'text-zinc-500 hover:text-white'
                    }`}
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => setDraftWorkoutDone(false)}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                      !draftWorkoutDone
                        ? 'bg-zinc-800 text-white shadow-sm'
                        : 'text-zinc-500 hover:text-white'
                    }`}
                  >
                    Descanso
                  </button>
                </div>
              </div>

              <input
                type="text"
                placeholder="Ex: Treino A - PUSH Hipertrofia (ou Descanso Ativo)"
                value={draftWorkoutName}
                onChange={e => setDraftWorkoutName(e.target.value)}
                className="w-full bg-zinc-900/80 border border-zinc-800/70 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* 3. SONO */}
            <div className="bg-[#0a0a0a] rounded-2xl p-3.5 border border-zinc-800/80">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Moon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-white text-xs font-bold block leading-tight">3. Sono & Descanso</span>
                    <span className="text-zinc-500 text-[10px]">Horas dormidas na noite anterior</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
                  <input
                    type="number"
                    step="0.5"
                    min="3"
                    max="14"
                    value={draftSleepHours}
                    onChange={e => setDraftSleepHours(parseFloat(e.target.value) || 0)}
                    className="w-12 bg-transparent text-white text-sm font-black text-right focus:outline-none"
                  />
                  <span className="text-zinc-400 text-xs font-bold">horas</span>
                </div>
              </div>

              {/* Quality selector */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {(['Excelente', 'Bom', 'Regular', 'Mau'] as const).map(q => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setDraftSleepQuality(q)}
                    className={`py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                      draftSleepQuality === q
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. PLANO ALIMENTAR */}
            <div className="bg-[#0a0a0a] rounded-2xl p-3.5 border border-zinc-800/80">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Utensils className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-white text-xs font-bold block leading-tight">4. Plano Alimentar</span>
                    <span className="text-zinc-500 text-[10px]">Cumprimento da dieta e macronutrientes</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-black">
                  {draftDietPercent}%
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={draftDietPercent}
                onChange={e => setDraftDietPercent(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[9px] text-zinc-500 font-medium px-0.5 mt-1">
                <span>0% (Deslizes)</span>
                <span>50%</span>
                <span>80%</span>
                <span className="text-emerald-400 font-bold">100% (À risca)</span>
              </div>
            </div>

            {/* 5. PASSOS */}
            <div className="bg-[#0a0a0a] rounded-2xl p-3.5 border border-zinc-800/80">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Footprints className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-white text-xs font-bold block leading-tight">5. Passos Diários</span>
                    <span className="text-zinc-500 text-[10px]">Meta diária: 10.000 passos</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
                  <input
                    type="number"
                    step="100"
                    value={draftSteps}
                    onChange={e => setDraftSteps(parseInt(e.target.value, 10) || 0)}
                    className="w-16 bg-transparent text-white text-sm font-black text-right focus:outline-none"
                  />
                  <span className="text-zinc-400 text-xs font-bold">passos</span>
                </div>
              </div>
            </div>

            {/* 6. ÁGUA */}
            <div className="bg-[#0a0a0a] rounded-2xl p-3.5 border border-zinc-800/80">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                    <Droplet className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-white text-xs font-bold block leading-tight">6. Água / Hidratação</span>
                    <span className="text-zinc-500 text-[10px]">Meta diária: 2.5 a 3.0 Litros</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
                  <input
                    type="number"
                    step="0.1"
                    value={draftWater}
                    onChange={e => setDraftWater(parseFloat(e.target.value) || 0)}
                    className="w-12 bg-transparent text-white text-sm font-black text-right focus:outline-none"
                  />
                  <span className="text-zinc-400 text-xs font-bold">L</span>
                </div>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all cursor-pointer mt-2"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Registo de {selectedDayLog.dayName}</span>
            </button>
          </form>

        </div>
      )}

      {/* TAB 2: GRÁFICOS */}
      {activeTab === 'graficos' && (
        <div className="space-y-4">
          
          {/* Period selector */}
          <div className="flex items-center justify-between bg-[#0a0a0a] p-1.5 rounded-xl border border-zinc-800">
            <span className="text-zinc-400 text-xs font-medium pl-2">Intervalo Temporal:</span>
            <div className="flex items-center gap-1">
              {(['7d', '30d', '3m'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    period === p
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  {p === '7d' ? '7 Dias' : p === '30d' ? '30 Dias' : '3 Meses'}
                </button>
              ))}
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-[#0a0a0a] p-3 rounded-2xl border border-zinc-800/80">
              <span className="text-zinc-500 text-[10px] block font-semibold uppercase">Média Peso</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-white text-xl font-black">{avgWeight}</span>
                <span className="text-zinc-400 text-xs">{weightUnit}</span>
              </div>
              <span className="text-emerald-400 text-[10px] font-medium flex items-center gap-0.5 mt-0.5">
                <TrendingDown className="w-2.5 h-2.5" /> -0.5 kg na semana
              </span>
            </div>

            <div className="bg-[#0a0a0a] p-3 rounded-2xl border border-zinc-800/80">
              <span className="text-zinc-500 text-[10px] block font-semibold uppercase">Adesão Dieta</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-emerald-400 text-xl font-black">{avgDiet}%</span>
              </div>
              <span className="text-zinc-400 text-[10px]">
                {workoutsCompletedCount}/7 treinos feitos
              </span>
            </div>
          </div>

          {/* Gráfico 1: Peso Corporal */}
          <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-zinc-800/80">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-orange-500" />
                <h4 className="text-white text-xs font-bold uppercase tracking-wider">
                  Evolução do Peso ({weightUnit})
                </h4>
              </div>
              <span className="text-orange-400 font-mono text-xs font-bold">
                {weeklyDailyLogs[weeklyDailyLogs.length - 1].weight} {weightUnit}
              </span>
            </div>

            {/* Custom SVG Line Chart */}
            <div className="h-32 w-full pt-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 100">
                {/* Gridlines */}
                <line x1="0" y1="20" x2="300" y2="20" stroke="#27272a" strokeDasharray="3 3" />
                <line x1="0" y1="50" x2="300" y2="50" stroke="#27272a" strokeDasharray="3 3" />
                <line x1="0" y1="80" x2="300" y2="80" stroke="#27272a" strokeDasharray="3 3" />

                {/* Points curve */}
                {(() => {
                  const weights = weeklyDailyLogs.map(l => l.weight);
                  const min = Math.min(...weights) - 0.2;
                  const max = Math.max(...weights) + 0.2;
                  const range = max - min || 1;
                  
                  const points = weeklyDailyLogs.map((l, i) => {
                    const x = (i / (weeklyDailyLogs.length - 1)) * 280 + 10;
                    const y = 90 - ((l.weight - min) / range) * 70;
                    return { x, y, weight: l.weight, day: l.dayId.toUpperCase() };
                  });

                  const d = points.reduce((acc, pt, i) => i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`, '');

                  return (
                    <>
                      <path d={d} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
                      {points.map((pt, i) => (
                        <g key={i}>
                          <circle cx={pt.x} cy={pt.y} r="4" fill="#09090b" stroke="#f97316" strokeWidth="2" />
                          <text x={pt.x} y="98" fill="#71717a" fontSize="8" textAnchor="middle">
                            {pt.day.substring(0, 3)}
                          </text>
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>
          </div>

          {/* Gráfico 2: Horas de Sono & Passos Diários */}
          <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-zinc-800/80">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-blue-400" />
                <h4 className="text-white text-xs font-bold uppercase tracking-wider">
                  Horas de Sono por Noite
                </h4>
              </div>
              <span className="text-blue-400 font-mono text-xs font-bold">Média: {avgSleep}h</span>
            </div>

            {/* Bar Chart for Sleep */}
            <div className="flex items-end justify-between h-28 gap-2 pt-2 px-1">
              {weeklyDailyLogs.map(log => {
                const heightPercent = Math.min(100, (log.sleepHours / 10) * 100);
                const isOptimal = log.sleepHours >= 7.5;

                return (
                  <div key={log.dayId} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[9px] font-mono font-bold text-zinc-300">
                      {log.sleepHours}h
                    </span>
                    <div className="w-full bg-zinc-900 rounded-t-lg overflow-hidden flex flex-col justify-end h-20">
                      <div
                        className={`w-full rounded-t-md transition-all ${
                          isOptimal ? 'bg-blue-500' : 'bg-blue-500/50'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-zinc-500 uppercase font-bold">
                      {log.dayId.substring(0, 3)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Gráfico 3: Passos e Hidratação */}
          <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-zinc-800/80">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Footprints className="w-4 h-4 text-amber-400" />
                <h4 className="text-white text-xs font-bold uppercase tracking-wider">
                  Passos & Movimento Diário
                </h4>
              </div>
              <span className="text-amber-400 font-mono text-xs font-bold">Média: {avgSteps}</span>
            </div>

            {/* Steps bars */}
            <div className="space-y-2">
              {weeklyDailyLogs.map(log => {
                const pct = Math.min(100, Math.round((log.steps / 10000) * 100));
                const hitTarget = log.steps >= 10000;

                return (
                  <div key={log.dayId} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400 font-medium">{log.dayName.split('-')[0]}</span>
                      <span className={`font-mono font-bold ${hitTarget ? 'text-amber-400' : 'text-zinc-400'}`}>
                        {log.steps.toLocaleString()} / 10.000
                      </span>
                    </div>
                    <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          hitTarget ? 'bg-amber-400' : 'bg-zinc-700'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
