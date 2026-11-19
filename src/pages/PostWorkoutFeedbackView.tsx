import React, { useState } from 'react';
import { 
  Trophy, 
  CheckCircle2, 
  AlertCircle, 
  ChevronLeft 
} from 'lucide-react';
import { useProfile } from '../context/ProfileContext';

export type PerceivedEffort = 'Leve' | 'Fácil' | 'Normal' | 'Difícil' | 'Intenso';
export type PainLevel = 'Sem dor' | 'Ligeira' | 'Moderada' | 'Forte';
export type PumpLevel = 'Nenhum' | 'Ligeiro' | 'Bom' | 'Excelente';

export interface PostWorkoutFeedbackData {
  workoutName: string;
  completedAt: string;
  perceivedEffort: PerceivedEffort;
  painLevel: PainLevel;
  painLocation?: string;
  pumpLevel: PumpLevel;
  fatigueLevel: number; // 0 to 10
  additionalNotes?: string;
}

interface PostWorkoutFeedbackViewProps {
  workoutName?: string;
  onSubmit: (feedback: PostWorkoutFeedbackData) => void;
  onCancel: () => void;
}

export function PostWorkoutFeedbackView({
  workoutName = 'Glúteo & Posteriores',
  onSubmit,
  onCancel
}: PostWorkoutFeedbackViewProps) {
  const { student } = useProfile();

  // Extract student name or fallback to Rita
  const studentDisplayName = student?.name ? student.name.split(' ')[0] : 'Rita';

  // State for the 5 questions
  const [effort, setEffort] = useState<PerceivedEffort | null>(null);
  const [pain, setPain] = useState<PainLevel | null>(null);
  const [painLocation, setPainLocation] = useState<string>('');
  const [pump, setPump] = useState<PumpLevel | null>(null);
  const [fatigue, setFatigue] = useState<number>(0);
  const [hasMovedFatigue, setHasMovedFatigue] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');

  // Validation: First 4 questions required
  const isPainValid = pain === 'Sem dor' ? true : (pain !== null && painLocation.trim().length > 0);
  const isFormComplete = effort !== null && pain !== null && isPainValid && pump !== null && hasMovedFatigue;

  // Question 1: Effort options with exact emojis from print
  const effortOptions: { label: PerceivedEffort; emoji: string }[] = [
    { label: 'Leve', emoji: '😇' },
    { label: 'Fácil', emoji: '😎' },
    { label: 'Normal', emoji: '😳' },
    { label: 'Difícil', emoji: '😰' },
    { label: 'Intenso', emoji: '🤯' }
  ];

  // Question 2: Pain options (segmented pill bar)
  const painOptions: PainLevel[] = ['Sem dor', 'Ligeira', 'Moderada', 'Forte'];

  // Quick suggestions for pain location
  const quickPainLocations = ['Ombro direito', 'Ombro esquerdo', 'Joelho', 'Lombar', 'Cotovelo', 'Punho'];

  // Question 3: Pump options (segmented pill bar)
  const pumpOptions: PumpLevel[] = ['Nenhum', 'Ligeiro', 'Bom', 'Excelente'];

  // Short fatigue description with dynamic color progression (green -> amber -> orange -> red)
  const getFatigueInfo = (val: number): { label: string; color: string; barColor: string } => {
    if (val <= 1) return { label: 'Sem cansaço', color: 'text-emerald-400', barColor: 'bg-emerald-500' };
    if (val <= 3) return { label: 'Cansaço ligeiro', color: 'text-emerald-400', barColor: 'bg-emerald-500' };
    if (val <= 5) return { label: 'Cansaço moderado', color: 'text-amber-400', barColor: 'bg-amber-500' };
    if (val <= 7) return { label: 'Bastante cansado', color: 'text-orange-400', barColor: 'bg-orange-500' };
    if (val <= 9) return { label: 'Muito cansado', color: 'text-orange-500', barColor: 'bg-orange-500' };
    return { label: 'Exausto', color: 'text-red-400', barColor: 'bg-red-500' };
  };

  const fatigueInfo = getFatigueInfo(fatigue);

  const handleSubmit = () => {
    if (!isFormComplete) return;

    const feedbackData: PostWorkoutFeedbackData = {
      workoutName,
      completedAt: new Date().toISOString(),
      perceivedEffort: effort!,
      painLevel: pain!,
      painLocation: pain !== 'Sem dor' ? painLocation.trim() : undefined,
      pumpLevel: pump!,
      fatigueLevel: fatigue,
      additionalNotes: notes.trim() ? notes.trim() : undefined
    };

    try {
      const existing = localStorage.getItem('rteam_workout_feedbacks');
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(feedbackData);
      localStorage.setItem('rteam_workout_feedbacks', JSON.stringify(list));
    } catch {
      // Local storage fallback
    }

    onSubmit(feedbackData);
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white px-4 pt-4 pb-8 max-w-[430px] mx-auto animate-in fade-in duration-300">
      
      {/* BOTÃO VOLTAR TOPO */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 -ml-1 text-zinc-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
          aria-label="Voltar"
        >
          <ChevronLeft className="w-5 h-5 text-orange-500" />
          <span className="text-xs font-semibold text-zinc-400">Voltar</span>
        </button>

        <span className="font-black text-sm tracking-widest text-zinc-500">
          RTEAM
        </span>

        <div className="w-12" />
      </div>

      {/* CABEÇALHO IDÊNTICO AO DESIGN: TROFÉU COM GLOW + TÍTULO EM CAPS + SUBTÍTULO EM ITÁLICO */}
      <div className="relative text-center mb-6 pt-2">
        {/* Glow suave por trás do troféu */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-500/15 blur-2xl rounded-full pointer-events-none" />

        {/* Troféu dourado central */}
        <div className="relative z-10 text-4xl sm:text-5xl mb-2 flex justify-center drop-shadow-[0_0_16px_rgba(234,179,8,0.4)]">
          🏆
        </div>

        {/* Título: TREINO TERMINADO */}
        <h1 className="relative z-10 text-3xl font-black tracking-wider text-white uppercase font-sans">
          TREINO TERMINADO
        </h1>

        {/* Subtítulo: Excelente trabalho, [Nome]! */}
        <p className="relative z-10 text-xs sm:text-sm text-zinc-400 italic mt-1 font-serif">
          Excelente trabalho, {studentDisplayName}!
        </p>
      </div>

      {/* CARD PRINCIPAL UNIFICADO COM AS 5 SECÇÕES */}
      <div className="bg-[#0e0e0e] border border-zinc-850 rounded-[28px] p-5 shadow-2xl space-y-5 mb-5">
        
        {/* 01  COMO FOI O TREINO? */}
        <div className="pb-5 border-b border-zinc-900">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-orange-500 font-bold text-xs">01</span>
            <span className="text-zinc-300 font-bold text-xs tracking-wider uppercase">
              COMO FOI O TREINO?
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {effortOptions.map((opt) => {
              const isSelected = effort === opt.label;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setEffort(opt.label)}
                  className={`py-3 px-1 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-orange-500 text-white font-bold shadow-lg shadow-orange-500/25 border border-orange-400 scale-[1.03]'
                      : 'bg-[#151516] border border-zinc-800/80 text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  <span className="text-xl mb-1.5">{opt.emoji}</span>
                  <span className={`text-[11px] leading-tight text-center ${isSelected ? 'text-white font-bold' : 'text-zinc-400'}`}>
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 02  SENTISTE DOR? (SEGMENTED BAR + CAMPO CONDICIONAL) */}
        <div className="pb-5 border-b border-zinc-900">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-orange-500 font-bold text-xs">02</span>
            <span className="text-zinc-300 font-bold text-xs tracking-wider uppercase">
              SENTISTE DOR?
            </span>
          </div>

          {/* Segmented control bar */}
          <div className="bg-[#151516] border border-zinc-800/80 rounded-2xl p-1.5 flex items-center justify-between gap-1">
            {painOptions.map((opt) => {
              const isSelected = pain === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setPain(opt)}
                  className={`flex-1 py-2 px-1 text-center text-xs transition-all cursor-pointer rounded-xl ${
                    isSelected
                      ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20'
                      : 'text-zinc-400 hover:text-white font-medium'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Campo adicional quando há dor */}
          {pain !== null && pain !== 'Sem dor' && (
            <div className="mt-3.5 pt-3 border-t border-zinc-855 animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="text-[11px] font-semibold text-orange-400 block mb-1.5 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                Onde sentiste dor? <span className="text-zinc-500 font-normal">(obrigatório)</span>
              </label>

              {/* Quick suggestions */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {quickPainLocations.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setPainLocation(loc)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-colors cursor-pointer ${
                      painLocation === loc 
                        ? 'bg-orange-500/20 border-orange-500/60 text-orange-300' 
                        : 'bg-[#151516] border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={painLocation}
                onChange={(e) => setPainLocation(e.target.value)}
                placeholder="Ex: ombro direito ou joelho..."
                className="w-full bg-[#151516] border border-zinc-800 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
              />
            </div>
          )}
        </div>

        {/* 03  TIVESTE PUMP PÓS-TREINO? (SEGMENTED BAR) */}
        <div className="pb-5 border-b border-zinc-900">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-orange-500 font-bold text-xs">03</span>
            <span className="text-zinc-300 font-bold text-xs tracking-wider uppercase">
              TIVESTE PUMP PÓS-TREINO?
            </span>
          </div>

          {/* Segmented control bar */}
          <div className="bg-[#151516] border border-zinc-800/80 rounded-2xl p-1.5 flex items-center justify-between gap-1">
            {pumpOptions.map((opt) => {
              const isSelected = pump === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setPump(opt)}
                  className={`flex-1 py-2 px-1 text-center text-xs transition-all cursor-pointer rounded-xl ${
                    isSelected
                      ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20'
                      : 'text-zinc-400 hover:text-white font-medium'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* 04  NÍVEL DE CANSAÇO (COM INDICADOR E CORES DINÂMICAS: VERDE A VERMELHO) */}
        <div className="pb-5 border-b border-zinc-900">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-orange-500 font-bold text-xs">04</span>
              <span className="text-zinc-300 font-bold text-xs tracking-wider uppercase">
                NÍVEL DE CANSAÇO
              </span>
            </div>
            {/* Traço indicador com a cor do nível */}
            <span className={`w-5 h-1 rounded-full transition-colors ${hasMovedFatigue ? fatigueInfo.barColor : 'bg-emerald-500'}`} />
          </div>

          {/* Slider track com números */}
          <div className="px-1">
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={fatigue}
              onChange={(e) => {
                setFatigue(parseInt(e.target.value, 10));
                setHasMovedFatigue(true);
              }}
              className="w-full h-2 bg-[#222225] rounded-lg appearance-none cursor-pointer accent-orange-500"
            />

            {/* Marcadores numéricos: 0 a 10 */}
            <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono mt-2 px-0.5 select-none">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <span 
                  key={num} 
                  className={hasMovedFatigue && fatigue === num ? `${fatigueInfo.color} font-bold scale-110 transition-transform` : ''}
                >
                  {num}
                </span>
              ))}
            </div>

            {/* Linha inferior: Nada | Texto reduzido com a cor original (verde -> amarelo -> laranja -> vermelho) | Exausto */}
            <div className="flex justify-between items-center mt-3 text-xs">
              <span className="text-zinc-500 font-medium">Nada</span>
              
              {/* Texto com a cor preservada: verde para sem cansaço até vermelho para exausto */}
              <span className={`font-bold tracking-tight transition-colors ${hasMovedFatigue ? fatigueInfo.color : 'text-emerald-400'}`}>
                {hasMovedFatigue ? fatigueInfo.label : 'Sem cansaço'}
              </span>

              <span className="text-zinc-500 font-medium">Exausto</span>
            </div>
          </div>
        </div>

        {/* 05  NOTAS ADICIONAIS */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-orange-500 font-bold text-xs">05</span>
            <span className="text-zinc-300 font-bold text-xs tracking-wider uppercase">
              NOTAS ADICIONAIS
            </span>
          </div>

          <div className="bg-[#151516] border border-zinc-800/80 rounded-2xl p-3.5 focus-within:border-orange-500/80 transition-colors">
            <textarea
              value={notes}
              maxLength={400}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Alguma troca de máquina, sensação ou algo que ache relevante..."
              className="w-full bg-transparent text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-colors resize-none leading-relaxed"
            />
            <div className="text-right text-[10px] font-mono text-zinc-600 mt-1">
              {notes.length}/400
            </div>
          </div>
        </div>

      </div>

      {/* AÇÕES FINAIS (BOTÃO CANCELAR E FINALIZAR TREINO) */}
      <div className="mt-auto pt-1 flex items-center gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3.5 rounded-2xl bg-[#141416] hover:bg-zinc-800 text-white font-bold text-xs border border-zinc-800 transition-colors cursor-pointer text-center"
        >
          Cancelar
        </button>

        <button
          type="button"
          disabled={!isFormComplete}
          onClick={handleSubmit}
          className={`flex-[2] py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
            isFormComplete
              ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/25 active:scale-[0.99] cursor-pointer'
              : 'bg-zinc-800/80 text-zinc-500 border border-zinc-800/60 cursor-not-allowed opacity-50'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span className="text-white font-bold">Finalizar treino</span>
        </button>
      </div>

    </div>
  );
}
