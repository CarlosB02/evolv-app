import React, { useState } from 'react';
import { 
  ChevronLeft, 
  History, 
  Activity, 
  Clock, 
  Flame, 
  Target, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Check, 
  CheckCircle2, 
  X, 
  Trash2, 
  SlidersHorizontal,
  FileText
} from 'lucide-react';
import { useCardio } from '../context/CardioContext';
import { useProfile } from '../context/ProfileContext';
import { CardioSession } from '../types';
import { MeusRegistosCardio } from './MeusRegistosCardio';
import { FinalizarCardio } from './FinalizarCardio';
import { useScrollToTop } from '../utils/scrollToTop';

interface RegistoCardioProps {
  onBack: () => void;
}

export function RegistoCardio({ onBack }: RegistoCardioProps) {
  const { 
    sessions, 
    config, 
    selectedDate, 
    setSelectedDate, 
    weekDays, 
    addSession, 
    deleteSession, 
    updateConfig, 
    saveDayRecord,
    selectedDayMinutes,
    selectedDaySessions,
    todayMinutes,
    weekMinutes,
    weekWorkoutsCount,
    monthMinutes,
    monthWorkoutsCount,
  } = useCardio();

  const { settings } = useProfile();
  const speedUnit = settings.distanceUnit === 'Mi' ? 'mph' : 'km/h';

  // UI state
  const [showHistoryPage, setShowHistoryPage] = useState(false);
  const [showFinalizePage, setShowFinalizePage] = useState(false);

  useScrollToTop([showHistoryPage, showFinalizePage]);
  const [isNotesExpanded, setIsNotesExpanded] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // New session modal form state
  const [newDuration, setNewDuration] = useState<number>(30);
  const [newEquipment, setNewEquipment] = useState<string>(config.equipment || 'Passadeira');
  const [newSpeed, setNewSpeed] = useState<number>(config.speed || 8.0);
  const [newIncline, setNewIncline] = useState<number>(config.incline || 2.0);
  const [newCalories, setNewCalories] = useState<number>(240);
  const [newBpm, setNewBpm] = useState<number>(135);
  const [newPeriod, setNewPeriod] = useState<string>('Pós-treino');
  const [newNotes, setNewNotes] = useState<string>('');

  // Edit config modal form state
  const [editEquipment, setEditEquipment] = useState<string>(config.equipment);
  const [editSpeed, setEditSpeed] = useState<number>(config.speed);
  const [editIncline, setEditIncline] = useState<number>(config.incline);
  const [editTargetMinutes, setEditTargetMinutes] = useState<number>(config.targetMinutesPerDay || 60);

  // Quick note modal state
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [quickNoteText, setQuickNoteText] = useState('');

  // Target metrics calculation
  const targetMinutes = config.targetMinutesPerDay || 60;
  const progressPercent = Math.min(Math.round((selectedDayMinutes / targetMinutes) * 100), 100);
  const remainingMinutes = Math.max(0, targetMinutes - selectedDayMinutes);

  // Format month minutes into hours + minutes
  const formatMonthTime = (totalMin: number) => {
    const hours = Math.floor(totalMin / 60);
    const mins = totalMin % 60;
    if (hours === 0) return `${mins} min`;
    return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
  };

  const handleSaveDay = () => {
    const ok = saveDayRecord(selectedDate);
    if (ok) {
      setSaveSuccessMessage('Registo de cardio guardado com sucesso!');
      setTimeout(() => setSaveSuccessMessage(null), 3000);
    }
  };

  const handleOpenRegisterModal = () => {
    setNewDuration(30);
    setNewEquipment(config.equipment || 'Passadeira');
    setNewSpeed(config.speed || 8.0);
    setNewIncline(config.incline || 2.0);
    setNewCalories(Math.round(30 * 8.2));
    setNewBpm(138);
    setNewPeriod('Pós-treino');
    setNewNotes('');
    setIsRegisterModalOpen(true);
  };

  const handleDurationChange = (dur: number) => {
    setNewDuration(dur);
    // Estimate calories ~8 kcal/min for cardio
    setNewCalories(Math.round(dur * 8.2));
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    addSession({
      date: selectedDate,
      time: timeStr,
      durationMinutes: Number(newDuration),
      equipment: newEquipment,
      speed: Number(newSpeed),
      incline: Number(newIncline),
      calories: Number(newCalories),
      avgBpm: Number(newBpm),
      periodLabel: newPeriod,
      notes: newNotes.trim() ? newNotes.trim() : undefined,
    });

    setIsRegisterModalOpen(false);
    setSaveSuccessMessage('Sessão registada com sucesso!');
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  const handleOpenConfigModal = () => {
    setEditEquipment(config.equipment);
    setEditSpeed(config.speed);
    setEditIncline(config.incline);
    setEditTargetMinutes(config.targetMinutesPerDay || 60);
    setIsConfigModalOpen(true);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig({
      equipment: editEquipment,
      speed: Number(editSpeed),
      incline: Number(editIncline),
      targetMinutesPerDay: Number(editTargetMinutes),
    });
    setIsConfigModalOpen(false);
    setSaveSuccessMessage('Configuração atualizada com sucesso!');
    setTimeout(() => setSaveSuccessMessage(null), 2500);
  };

  const handleAddQuickNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNoteText.trim()) return;

    if (selectedDaySessions.length > 0) {
      // Append note to the first session of the day or create a micro note session
      const targetSession = selectedDaySessions[0];
      targetSession.notes = targetSession.notes 
        ? `${targetSession.notes} | ${quickNoteText.trim()}` 
        : quickNoteText.trim();
      saveDayRecord(selectedDate);
    } else {
      // Add a note session
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      addSession({
        date: selectedDate,
        time: timeStr,
        durationMinutes: 0,
        equipment: config.equipment,
        speed: config.speed,
        incline: config.incline,
        calories: 0,
        avgBpm: 0,
        periodLabel: 'Nota de treino',
        notes: quickNoteText.trim(),
      });
    }

    setQuickNoteText('');
    setIsAddNoteModalOpen(false);
    setIsNotesExpanded(true);
    setSaveSuccessMessage('Nota guardada com sucesso!');
    setTimeout(() => setSaveSuccessMessage(null), 2500);
  };

  // Collect notes for the selected day or overall
  const dayNotes = selectedDaySessions.filter(s => s.notes && s.notes.trim().length > 0);
  const allNotesWithSessions = sessions.filter(s => s.notes && s.notes.trim().length > 0);

  // SVG Circular progress params
  const circleSize = 64;
  const strokeWidth = 5;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * progressPercent) / 100;

  if (showFinalizePage) {
    return (
      <FinalizarCardio 
        onBack={() => setShowFinalizePage(false)}
        onOpenHistory={() => {
          setShowFinalizePage(false);
          setShowHistoryPage(true);
        }}
        initialDate={selectedDate}
        onSuccess={() => {
          setShowFinalizePage(false);
          setSaveSuccessMessage('Sessão de cardio registada com sucesso!');
          setTimeout(() => setSaveSuccessMessage(null), 2500);
        }}
      />
    );
  }

  if (showHistoryPage) {
    return (
      <MeusRegistosCardio 
        onBack={() => setShowHistoryPage(false)} 
        onOpenNewWorkout={() => {
          setShowHistoryPage(false);
          setShowFinalizePage(true);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 px-5 pt-4 pb-12 animate-in fade-in zoom-in-95 duration-200">
      
      {/* 1. CABEÇALHO */}
      <header className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 hover:bg-orange-500/20 active:scale-95 transition-all cursor-pointer"
            aria-label="Voltar aos treinos"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-white text-[17px] font-semibold tracking-tight">
              Registo Cardio
            </h1>
            <p className="text-zinc-500 text-[11px] leading-tight">
              Monitorização e metas diárias
            </p>
          </div>
        </div>

        <button 
          onClick={() => setShowHistoryPage(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-orange-500/40 text-xs font-medium transition-all active:scale-95 cursor-pointer"
        >
          <History className="w-3.5 h-3.5 text-orange-500" strokeWidth={2} />
          <span>Histórico</span>
        </button>
      </header>

      {/* SUCCESS TOAST NOTIFICATION */}
      {saveSuccessMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[370px] bg-emerald-500/90 text-white px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md border border-emerald-400/40 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4 text-white stroke-[3]" />
          </div>
          <p className="text-xs font-medium">{saveSuccessMessage}</p>
        </div>
      )}

      {/* 2. SELEÇÃO DO DIA */}
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-7 gap-1.5">
          {weekDays.map((item) => {
            const isSelected = item.dateStr === selectedDate;
            const hasSessions = sessions.some(s => s.date === item.dateStr && s.durationMinutes > 0);
            const isToday = item.isToday;

            return (
              <button 
                key={item.dateStr}
                onClick={() => setSelectedDate(item.dateStr)}
                className={`relative flex flex-col items-center justify-center aspect-square w-full rounded-xl transition-all cursor-pointer ${
                  isToday
                    ? 'bg-gradient-to-b from-orange-400 via-orange-500 to-orange-600 border border-orange-300/80 shadow-[0_0_14px_rgba(249,115,22,0.45)] ring-1 ring-orange-300/30 text-white font-bold scale-[1.02]'
                    : isSelected 
                      ? 'bg-orange-500/10 border-orange-500 text-orange-400 shadow-sm shadow-orange-500/20' 
                      : 'bg-zinc-950/50 border border-zinc-800/70 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <span className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${
                  isToday 
                    ? 'text-white/90' 
                    : isSelected 
                      ? 'text-orange-500 font-semibold' 
                      : 'text-zinc-400'
                }`}>
                  {item.dayShort}
                </span>

                {isToday ? (
                  <span className="text-[14px] font-extrabold text-white leading-none">
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
                  <span className={`text-[14px] font-bold leading-none ${
                    isSelected ? 'text-white' : 'text-zinc-300'
                  }`}>
                    {item.dayNum}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Resumo semanal de cardio */}
        <div className="px-3 py-2 rounded-xl bg-zinc-900/50 border border-zinc-800/50 flex flex-col gap-1.5">
          <div className="text-[10px] sm:text-[10.5px] text-zinc-400 leading-normal">
            <strong className="text-white font-semibold">{weekWorkoutsCount} treinos</strong> esta semana <span className="text-zinc-600 mx-1">/</span> <strong className="text-white font-semibold">{monthWorkoutsCount}</strong> este mês
          </div>

          {/* Barra de progresso com degradé */}
          <div className="w-full h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.35)] transition-all duration-500"
              style={{ 
                width: `${Math.min(100, Math.max(10, Math.round((weekWorkoutsCount / 4) * 100)))}%` 
              }}
            />
          </div>
        </div>
      </div>

      {/* 3. PROGRESSO DE HOJE (Card Principal) */}
      <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-[22px] p-5 flex flex-col relative overflow-hidden shadow-lg shadow-black/40">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-[10px] font-bold text-orange-500 tracking-widest uppercase">
              PROGRESSO DO DIA
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                {selectedDayMinutes}
              </h2>
              <span className="text-zinc-400 text-sm font-medium">min</span>
            </div>
          </div>

          {/* Indicador circular com ícone de cardio */}
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-16 h-16 -rotate-90" viewBox={`0 0 ${circleSize} ${circleSize}`}>
              <circle
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={radius}
                className="stroke-zinc-800/80"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              <circle
                cx={circleSize / 2}
                cy={circleSize / 2}
                r={radius}
                className="stroke-orange-500 transition-all duration-700 ease-out"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Activity className="w-5 h-5 text-orange-500" strokeWidth={2.2} />
              <span className="text-[9px] font-bold text-white mt-0.5">{progressPercent}%</span>
            </div>
          </div>
        </div>

        {/* Barra de progresso linear com % na mesma linha e meta / restantes em baixo */}
        <div className="flex flex-col gap-2 mb-5">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-zinc-800/80 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-white shrink-0">
              {progressPercent}%
            </span>
          </div>

          <div className="flex justify-between items-center text-[11px] text-zinc-400 font-medium px-0.5">
            <span>Meta {targetMinutes}min</span>
            <span>{remainingMinutes > 0 ? `${remainingMinutes}min restantes` : '0min restantes'}</span>
          </div>
        </div>

        {/* Botão “Registar Sessão” com texto branco */}
        <button
          onClick={() => setShowFinalizePage(true)}
          className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-orange-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2] text-white" />
          <span>Registar Sessão</span>
        </button>
      </div>

      {/* 4. RESUMO DE ATIVIDADE */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Hoje */}
        <div className="bg-[#0a0a0a] border border-zinc-800/60 rounded-2xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-medium mb-2">
            <Clock className="w-3.5 h-3.5 text-orange-500 shrink-0" strokeWidth={2} />
            <span>Hoje</span>
          </div>
          <div>
            <p className="text-white text-lg font-bold tracking-tight leading-none mb-1">
              {todayMinutes} <span className="text-xs text-zinc-400 font-normal">min</span>
            </p>
          </div>
        </div>

        {/* Semana */}
        <div className="bg-[#0a0a0a] border border-zinc-800/60 rounded-2xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-medium mb-2">
            <Activity className="w-3.5 h-3.5 text-orange-500 shrink-0" strokeWidth={2} />
            <span>Semana</span>
          </div>
          <div>
            <p className="text-white text-lg font-bold tracking-tight leading-none mb-1">
              {weekMinutes} <span className="text-xs text-zinc-400 font-normal">min</span>
            </p>
          </div>
        </div>

        {/* Mês */}
        <div className="bg-[#0a0a0a] border border-zinc-800/60 rounded-2xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-medium mb-2">
            <Target className="w-3.5 h-3.5 text-orange-500 shrink-0" strokeWidth={2} />
            <span>Mês</span>
          </div>
          <div>
            <p className="text-white text-lg font-bold tracking-tight leading-none mb-1">
              {formatMonthTime(monthMinutes)}
            </p>
          </div>
        </div>
      </div>

      {/* 5. NOTAS DE TREINO (Secção Expansível) */}
      <div className="bg-[#0a0a0a] border border-zinc-800/60 rounded-2xl overflow-hidden transition-all">
        <button
          onClick={() => setIsNotesExpanded(!isNotesExpanded)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-900/30 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-orange-500 shrink-0" />
            <h3 className="text-[13px] font-semibold text-white tracking-wide">
              Notas de treino
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium text-orange-500">
              {isNotesExpanded ? 'Recolher' : 'Ver detalhes'}
            </span>
            {isNotesExpanded ? (
              <ChevronUp className="w-4 h-4 text-orange-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-orange-500" />
            )}
          </div>
        </button>

        {/* Bullet points simples quando recolhido */}
        {!isNotesExpanded && (
          <div className="px-4 pb-3.5 pt-0">
            <ul className="space-y-1.5 text-[11px] text-zinc-400">
              {dayNotes.length > 0 ? (
                dayNotes.map((session, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold select-none">•</span>
                    <span className="text-zinc-300 leading-snug">
                      {session.notes.length > 70 ? `${session.notes.slice(0, 70)}...` : session.notes}
                    </span>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-center gap-2">
                    <span className="text-orange-500 font-bold select-none">•</span>
                    <span className="text-zinc-300">Aquecimento inicial progressivo de 5 min</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-orange-500 font-bold select-none">•</span>
                    <span className="text-zinc-300">Manter frequência cardíaca constante na zona aeróbica</span>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}

        {/* Conteúdo completo quando expandido */}
        {isNotesExpanded && (
          <div className="px-4 pb-4 pt-1 border-t border-zinc-800/60 flex flex-col gap-3 animate-in fade-in duration-200">
            {dayNotes.length > 0 ? (
              <div className="space-y-2.5 pt-2">
                {dayNotes.map((session, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/70 text-xs text-zinc-200">
                    <div className="flex items-center justify-between mb-1 text-[10px] text-zinc-400 font-medium">
                      <span className="text-orange-400 font-semibold">{session.periodLabel}</span>
                      <span>{session.time} • {session.equipment} ({session.durationMinutes} min)</span>
                    </div>
                    <p className="leading-relaxed">{session.notes}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-zinc-500">
                Ainda não há notas adicionadas para este dia.
              </div>
            )}

            {/* Outras notas recentes de cardio */}
            {allNotesWithSessions.length > dayNotes.length && (
              <div className="pt-2">
                <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider mb-2">
                  Notas de sessões anteriores
                </p>
                <div className="space-y-2">
                  {allNotesWithSessions
                    .filter(s => s.date !== selectedDate)
                    .slice(0, 2)
                    .map((s, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-zinc-900/30 border border-zinc-800/40 text-[11px] text-zinc-400">
                        <div className="flex justify-between text-[10px] text-zinc-500 mb-0.5">
                          <span className="font-medium text-zinc-300">{s.date} ({s.equipment})</span>
                          <span>{s.durationMinutes} min</span>
                        </div>
                        <p className="line-clamp-2">{s.notes}</p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setIsAddNoteModalOpen(true)}
              className="mt-1 py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-orange-400 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar nota rápida</span>
            </button>
          </div>
        )}
      </div>

      {/* 6. CONFIGURAÇÃO */}
      <div className="bg-[#0a0a0a] border border-zinc-800/60 rounded-2xl p-4 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="w-4 h-4 text-orange-500 shrink-0" />
            <h3 className="text-[13px] font-semibold text-white tracking-wide">
              Configuração
            </h3>
          </div>

          <button
            onClick={handleOpenConfigModal}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-orange-500/30 text-orange-500 hover:bg-orange-500/10 text-[11px] font-medium transition-colors cursor-pointer"
          >
            <span>Editar configuração</span>
          </button>
        </div>

        {/* Único bloco com os 3 parâmetros divididos por linha simples */}
        <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl grid grid-cols-3 divide-x divide-zinc-800/80 p-3">
          <div className="pr-3">
            <span className="text-[10px] text-zinc-500 font-medium block mb-0.5">Equipamento</span>
            <p className="text-white text-xs font-semibold truncate" title={config.equipment}>
              {config.equipment}
            </p>
          </div>

          <div className="px-3">
            <span className="text-[10px] text-zinc-500 font-medium block mb-0.5">Velocidade</span>
            <p className="text-white text-xs font-semibold">
              {config.speed} <span className="text-[10px] text-zinc-400 font-normal">{speedUnit}</span>
            </p>
          </div>

          <div className="pl-3">
            <span className="text-[10px] text-zinc-500 font-medium block mb-0.5">Inclinação</span>
            <p className="text-white text-xs font-semibold">
              {config.incline}%
            </p>
          </div>
        </div>
      </div>

      {/* 7. GUARDAR REGISTO (Botão Destacado no Fundo) */}
      <div className="pt-2">
        <button
          onClick={handleSaveDay}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:scale-[0.99] text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 transition-all cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4 stroke-[2] text-white" />
          <span>Guardar Registo</span>
        </button>
      </div>

      {/* ========================================= */}
      {/* MODAL / BOTTOM SHEET: REGISTAR SESSÃO */}
      {/* ========================================= */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[420px] bg-zinc-950 border border-zinc-800 rounded-t-[28px] sm:rounded-[28px] p-6 shadow-2xl max-h-[90vh] overflow-y-auto hide-scrollbar animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Registar Sessão de Cardio</h3>
              </div>
              <button 
                onClick={() => setIsRegisterModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-4">
              {/* Duração com atalhos */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                  Duração (minutos)
                </label>
                <div className="flex gap-1.5 mb-2">
                  {[15, 30, 45, 60].map((mins) => (
                    <button
                      type="button"
                      key={mins}
                      onClick={() => handleDurationChange(mins)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                        newDuration === mins 
                          ? 'bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-500/20' 
                          : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={newDuration}
                  onChange={(e) => handleDurationChange(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-semibold text-sm focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              {/* Equipamento */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                  Equipamento
                </label>
                <select
                  value={newEquipment}
                  onChange={(e) => setNewEquipment(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm focus:outline-none focus:border-orange-500"
                >
                  <option value="Passadeira">Passadeira</option>
                  <option value="Bicicleta Estática">Bicicleta Estática</option>
                  <option value="Elíptica">Elíptica</option>
                  <option value="Remo">Remo</option>
                  <option value="Escadas / Stairmaster">Escadas / Stairmaster</option>
                  <option value="Corrida Exterior">Corrida Exterior</option>
                </select>
              </div>

              {/* Velocidade e Inclinação */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Velocidade ({speedUnit})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="40"
                    value={newSpeed}
                    onChange={(e) => setNewSpeed(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-semibold text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Inclinação (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="25"
                    value={newIncline}
                    onChange={(e) => setNewIncline(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-semibold text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
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
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-semibold text-sm focus:outline-none focus:border-orange-500"
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
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-semibold text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Período */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                  Período
                </label>
                <div className="flex gap-2">
                  {['Manhã', 'Pós-treino', 'Fim do dia'].map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setNewPeriod(p)}
                      className={`flex-1 py-1.5 text-[11px] font-medium rounded-lg border transition-all cursor-pointer ${
                        newPeriod === p
                          ? 'bg-orange-500/15 border-orange-500 text-orange-400'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
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
                  placeholder="Ex: Zona cardíaca controlada, ritmo confortável..."
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-zinc-900 text-zinc-300 font-semibold text-xs border border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
                >
                  Guardar Sessão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* MODAL / BOTTOM SHEET: EDITAR CONFIGURAÇÃO */}
      {/* ========================================= */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[420px] bg-zinc-950 border border-zinc-800 rounded-t-[28px] sm:rounded-[28px] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Editar Configuração</h3>
              </div>
              <button 
                onClick={() => setIsConfigModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                  Equipamento Utilizado
                </label>
                <input
                  type="text"
                  value={editEquipment}
                  onChange={(e) => setEditEquipment(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-semibold text-sm focus:outline-none focus:border-orange-500"
                  placeholder="Ex: Passadeira Profissional"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Velocidade ({speedUnit})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="40"
                    value={editSpeed}
                    onChange={(e) => setEditSpeed(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-semibold text-sm focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Inclinação (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="25"
                    value={editIncline}
                    onChange={(e) => setEditIncline(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-semibold text-sm focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                  Meta Diária Recomendada (minutos)
                </label>
                <input
                  type="number"
                  min="10"
                  max="180"
                  value={editTargetMinutes}
                  onChange={(e) => setEditTargetMinutes(parseInt(e.target.value) || 60)}
                  className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-semibold text-sm focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-zinc-900 text-zinc-300 font-semibold text-xs border border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-[0.98] text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
                >
                  Guardar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================= */}
      {/* MODAL: ADICIONAR NOTA RÁPIDA */}
      {/* ========================================= */}
      {isAddNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[420px] bg-zinc-950 border border-zinc-800 rounded-t-[28px] sm:rounded-[28px] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <h3 className="text-base font-bold text-white">Adicionar Nota de Treino</h3>
              <button 
                onClick={() => setIsAddNoteModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddQuickNote} className="space-y-4">
              <p className="text-xs text-zinc-400">
                Data selecionada: <strong className="text-white">{selectedDate}</strong>
              </p>
              <textarea
                rows={4}
                value={quickNoteText}
                onChange={(e) => setQuickNoteText(e.target.value)}
                placeholder="Indicações do coach, sensações físicas, intensidade..."
                className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
                required
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddNoteModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-zinc-900 text-zinc-300 font-semibold text-xs border border-zinc-800 hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
                >
                  Guardar Nota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
