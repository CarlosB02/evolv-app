import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Clock, 
  Dumbbell, 
  Weight, 
  CheckCircle2, 
  ChevronRight, 
  MoreHorizontal
} from 'lucide-react';
import { PersonalRecordModal } from '../components/workout/PersonalRecordModal';

export interface ExerciseSummaryRow {
  setsCount: number;
  name: string;
  bestWeight: number | string;
  bestReps: number | string;
  isPr?: boolean;
  progression?: string; // e.g. "+2 reps", "+1 kg", or ""
}

export interface WorkoutSummaryData {
  workoutName: string;
  dateStr?: string;
  durationStr: string;
  exercisesCompletedStr: string;
  prsCount: number;
  totalKg: number;
  elephantEquivalentCount?: number;
  exercises: ExerciseSummaryRow[];
}

interface WorkoutSummaryViewProps {
  data?: WorkoutSummaryData;
  onDone: () => void;
}

const defaultSummaryData: WorkoutSummaryData = {
  workoutName: 'Glúteo & Posteriores',
  dateStr: 'Terça-Feira, 16 Fevereiro',
  durationStr: '1h 30m',
  exercisesCompletedStr: '7/8',
  prsCount: 5,
  totalKg: 14000,
  elephantEquivalentCount: 2,
  exercises: [
    {
      setsCount: 2,
      name: 'Calf Press on Seated Machine',
      bestWeight: 25,
      bestReps: 12,
      isPr: true,
      progression: '+2 reps'
    },
    {
      setsCount: 2,
      name: 'Hip Abductor (Machine)',
      bestWeight: 32,
      bestReps: 12,
      isPr: false,
      progression: '+1 kg'
    },
    {
      setsCount: 2,
      name: 'Seated Leg Curl (Machine)',
      bestWeight: 52,
      bestReps: 11,
      isPr: true,
      progression: '+1 kg'
    },
    {
      setsCount: 2,
      name: 'Leg Extension (Machine)',
      bestWeight: 60,
      bestReps: 12,
      isPr: false,
      progression: '+2 reps'
    },
    {
      setsCount: 2,
      name: 'Leg Press',
      bestWeight: 150,
      bestReps: 10,
      isPr: true,
      progression: '+2 reps'
    },
    {
      setsCount: 3,
      name: 'Triceps Pushdown (Rope)',
      bestWeight: 40,
      bestReps: 9,
      isPr: false,
      progression: ''
    }
  ]
};

export function WorkoutSummaryView({ data = defaultSummaryData, onDone }: WorkoutSummaryViewProps) {
  const [animatedKg, setAnimatedKg] = useState(0);
  const [isRecordsOpen, setIsRecordsOpen] = useState(false);

  // Smooth ease-out counter animation for the total weight lifted
  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1200; // 1.2s animation
    const target = data.totalKg;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // ease-out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setAnimatedKg(Math.round(target * easeOut));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    const animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [data.totalKg]);

  const elephantCount = data.elephantEquivalentCount ?? Math.max(1, Math.round(data.totalKg / 6000));

  return (
    <div className="flex flex-col min-h-screen bg-black text-white px-4 pt-5 pb-8 max-w-[430px] mx-auto animate-in fade-in duration-300">
      
      {/* 1. BRANDING TOPO: RTEAM */}
      <div className="text-center mb-2">
        <span className="font-black text-3xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 drop-shadow-[0_0_16px_rgba(249,115,22,0.6)]">
          RTEAM
        </span>
      </div>

      {/* 2. TÍTULO PRINCIPAL */}
      <div className="text-center mb-5">
        <h1 className="text-2xl font-black tracking-tight text-white">
          Treino Terminado
        </h1>
        <p className="text-xs text-zinc-400 mt-1 font-medium">
          Bom trabalho. Continua consistente.
        </p>
      </div>

      {/* 3. HERO CARD: CARGA TOTAL E EQUIVALÊNCIA CRIATIVA */}
      <div className="relative overflow-hidden bg-[#0c0c0c] border border-orange-500/35 rounded-2xl p-4.5 mb-4 shadow-[0_0_30px_rgba(249,115,22,0.12)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Ícone discreto em anel laranja */}
            <div className="w-9 h-9 rounded-full border border-orange-500/80 bg-orange-500/10 flex items-center justify-center mb-2 text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.3)]">
              <Weight className="w-4.5 h-4.5" />
            </div>

            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Levantou um total de
            </span>

            {/* Número animado grande e limpo */}
            <div className="text-4xl sm:text-5xl font-black text-orange-500 tracking-tight my-1 tabular-nums">
              {animatedKg.toLocaleString('pt-PT')}
              <span className="text-lg font-bold text-orange-400/80 ml-1.5">kg</span>
            </div>

            {/* Equivalência sem ruído visual */}
            <div className="pt-2 border-t border-zinc-800/80 mt-2">
              <p className="text-xs font-semibold text-zinc-200">
                É igual a levantar {elephantCount} {elephantCount === 1 ? 'elefante' : 'elefantes'}
              </p>
              <span className="text-[10px] text-zinc-400 block mt-0.5">
                Um elefante pesa cerca de 6 000 kg
              </span>
            </div>
          </div>

          {/* Gráfico do Elefante estilizado */}
          <div className="w-28 sm:w-32 shrink-0 opacity-85 select-none pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?q=80&w=400&auto=format&fit=crop" 
              alt="Elefante representativo"
              className="w-full h-24 sm:h-28 object-cover rounded-xl border border-zinc-800 [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]"
            />
          </div>
        </div>
      </div>

      {/* 4. CARD DETALHE DO TREINO E PROGRESSÃO */}
      <div className="bg-[#0b0b0b] border border-zinc-800/90 rounded-2xl p-4.5 mb-5 shadow-lg">
        {/* Cabeçalho do Card */}
        <div className="flex items-start justify-between gap-2 mb-3.5">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
              {data.workoutName}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {data.dateStr || 'Hoje'}
            </p>
          </div>
          <button 
            type="button" 
            className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Opções"
          >
            <MoreHorizontal className="w-5 h-5 text-orange-500/80" />
          </button>
        </div>

        {/* Grelha de 4 Estatísticas */}
        <div className="grid grid-cols-4 gap-1 py-3 border-y border-zinc-800/80 text-center mb-3">
          <div>
            <div className="flex justify-center mb-1">
              <Clock className="w-4 h-4 text-orange-400" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-white block truncate">
              {data.durationStr}
            </span>
            <span className="text-[9px] text-zinc-400 uppercase tracking-wider block mt-0.5">
              Duração
            </span>
          </div>

          <div className="border-l border-zinc-800/80">
            <div className="flex justify-center mb-1">
              <Dumbbell className="w-4 h-4 text-orange-400" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-white block truncate">
              {data.exercisesCompletedStr}
            </span>
            <span className="text-[9px] text-zinc-400 uppercase tracking-wider block mt-0.5">
              Exercícios
            </span>
          </div>

          <div className="border-l border-zinc-800/80">
            <div className="flex justify-center mb-1">
              <Trophy className="w-4 h-4 text-orange-400" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-white block truncate">
              {data.prsCount}
            </span>
            <span className="text-[9px] text-zinc-400 uppercase tracking-wider block mt-0.5">
              PR's
            </span>
          </div>

          <div className="border-l border-zinc-800/80">
            <div className="flex justify-center mb-1">
              <Weight className="w-4 h-4 text-orange-400" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-white block truncate">
              {data.totalKg.toLocaleString('pt-PT')}
            </span>
            <span className="text-[9px] text-zinc-400 uppercase tracking-wider block mt-0.5">
              Carga total
            </span>
          </div>
        </div>

        {/* Tabela de Exercícios & Best Sets */}
        <div className="mb-2">
          {/* Cabeçalho da Lista */}
          <div className="flex items-center justify-between text-[10px] font-bold tracking-wider uppercase text-orange-400 mb-2 px-1">
            <span>Exercício</span>
            <span>Best Set</span>
          </div>

          {/* Linhas Compactas dos Exercícios */}
          <div className="space-y-1.5">
            {data.exercises.map((item, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-2 p-2 rounded-xl bg-[#111111] border border-zinc-850 hover:border-zinc-800 transition-colors"
              >
                {/* Ícone */}
                <Dumbbell className="w-3.5 h-3.5 text-zinc-400 shrink-0" />

                {/* Nome do exercício com séries */}
                <div className="flex-1 min-w-0 pr-1">
                  <p className="text-xs font-semibold text-white truncate">
                    <span className="text-orange-400 font-bold mr-1.5">{item.setsCount}x</span>
                    {item.name}
                  </p>
                </div>

                {/* Best Set Pill */}
                <div className="relative shrink-0 px-2.5 py-1 rounded-lg bg-black/60 border border-zinc-800 text-xs font-medium text-white flex items-center gap-1">
                  <span>
                    {item.bestWeight} <span className="text-orange-400 font-semibold">kg</span> × {item.bestReps}
                  </span>
                  {item.isPr && (
                    <Trophy className="w-3 h-3 text-orange-400 fill-orange-400 shrink-0 ml-0.5" />
                  )}
                </div>

                {/* Progressão Badge */}
                <div className="w-16 shrink-0 text-right">
                  {item.progression ? (
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold text-orange-400 bg-orange-500/15 border border-orange-500/30">
                      ▲ {item.progression}
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-400 font-medium">
                      = igual
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Nota discreta de progressão */}
          <div className="text-right text-[10px] text-zinc-400 mt-2 pr-1">
            ▲ Progressão face ao último treino
          </div>
        </div>

        {/* Card de Recordes Pessoais */}
        {data.prsCount > 0 && (
          <button
            type="button"
            onClick={() => setIsRecordsOpen(true)}
            className="w-full mt-3 p-3 rounded-xl bg-gradient-to-r from-orange-500/10 via-zinc-900 to-zinc-900 border border-orange-500/30 flex items-center justify-between cursor-pointer hover:border-orange-500/50 transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400">
                <Trophy className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white">
                <strong className="text-orange-400">{data.prsCount}</strong> Recordes Pessoais
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-orange-500" />
          </button>
        )}
      </div>

      {/* 5. BOTÃO DE AÇÃO: FEITO (TEXTO BRANCO OBRIGATÓRIO) */}
      <div className="mt-auto pt-2">
        <button
          type="button"
          onClick={onDone}
          className="w-full py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-bold text-sm shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span>Feito</span>
        </button>
      </div>

      {isRecordsOpen && (
        <PersonalRecordModal
          prEvent={null}
          initialStep="records"
          onClose={() => setIsRecordsOpen(false)}
        />
      )}

    </div>
  );
}
