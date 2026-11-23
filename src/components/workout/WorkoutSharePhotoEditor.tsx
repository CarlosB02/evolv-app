import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronLeft,
  ImagePlus,
  Layers,
  Share2,
  Trophy,
  X,
  Check,
} from 'lucide-react';
import type { WorkoutSummaryData } from '../../pages/WorkoutSummaryView';
import { loadPersonalRecords, formatKgPt } from '../../data/personalRecords';
import { useCommunity } from '../../context/CommunityContext';

export type ShareOverlayStyle =
  | 'principal'
  | 'mes'
  | 'semana'
  | 'treino'
  | 'anatomia'
  | 'recordes';

interface WorkoutSharePhotoEditorProps {
  photoUrl: string;
  data: WorkoutSummaryData;
  onBack: () => void;
  onChangePhoto: (newPhotoUrl: string) => void;
  onComplete: () => void;
}

type MuscleGroupKey =
  | 'chest'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'abs'
  | 'quads'
  | 'back'
  | 'glutes'
  | 'hamstrings'
  | 'calves';

function detectTrainedMuscles(data: WorkoutSummaryData): {
  keys: Set<MuscleGroupKey>;
  labels: string[];
} {
  const haystack = [
    data.workoutName,
    data.muscleGroups || '',
    ...data.exercises.map((e) => e.name),
  ]
    .join(' ')
    .toLowerCase();

  const keys = new Set<MuscleGroupKey>();
  const labels: string[] = [];

  const add = (key: MuscleGroupKey, label: string) => {
    if (!keys.has(key)) {
      keys.add(key);
      labels.push(label);
    }
  };

  if (/gl[uú]teo|hip thrust|abductor|ponte|eleva[çc][aã]o p[eé]lvica/.test(haystack)) {
    add('glutes', 'Glúteos');
  }
  if (/quadr[ií]ceps|quad|leg extension|leg press|agachamento|squat|lunge|b[uú]lgaro/.test(haystack)) {
    add('quads', 'Quadríceps');
  }
  if (/posterior|isquio|leg curl|rdl|stiff|peso morto|deadlift/.test(haystack)) {
    add('hamstrings', 'Posteriores');
  }
  if (/panturrilha|g[eé]meo|calf/.test(haystack)) {
    add('calves', 'Gémeos');
  }
  if (/peito|peitoral|chest|supino|bench|fly|crucifixo/.test(haystack)) {
    add('chest', 'Peitoral');
  }
  if (/costas|dorsal|pulldown|remada|row|puxada|pull[- ]?up|lat/.test(haystack)) {
    add('back', 'Dorsais');
  }
  if (/ombro|deltoid|shoulder|lateral raise|eleva[çc][aã]o lateral|militar/.test(haystack)) {
    add('shoulders', 'Ombros');
  }
  if (/b[ií]cep|curl/.test(haystack) && !/leg curl/.test(haystack)) {
    add('biceps', 'Bíceps');
  }
  if (/tr[ií]cep|pushdown|extens[aã]o|franc[eê]s/.test(haystack)) {
    add('triceps', 'Tríceps');
  }
  if (/abd[oó]m|core|prancha|plank|crunch/.test(haystack)) {
    add('abs', 'Core');
  }
  if (/corpo inteiro|full body/.test(haystack)) {
    add('quads', 'Quadríceps');
    add('glutes', 'Glúteos');
    add('back', 'Dorsais');
    add('chest', 'Peitoral');
    add('abs', 'Core');
  }

  if (keys.size === 0) {
    add('glutes', 'Glúteos');
    add('quads', 'Quadríceps');
    add('hamstrings', 'Posteriores');
  }

  return { keys, labels };
}

function ElephantSilhouette({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M46 14C42 9.5 34.5 8 27 8.5C18.5 9 12 13.5 10.5 21.5C9.8 25.2 10.2 28.5 11.5 31L10.5 41.5C10.4 42.8 11.4 44 12.8 44H16.2C17.4 44 18.4 43 18.5 41.8L19.3 33.5H25.2L26 41.8C26.1 43 27.1 44 28.3 44H31.5C32.8 44 33.8 42.9 33.7 41.6L33.1 33.5H39.8L40.5 41.8C40.6 43 41.6 44 42.8 44H45.8C47.1 44 48.1 42.9 48 41.6L47.5 32.8C50.4 31.4 52.5 28.6 53.3 25.4C54.2 28.1 55.6 31.6 58.6 32.6C60.2 33.1 61.5 31.7 61 30.2C60.4 28.5 58.8 27.4 58.1 24.4C57.5 21.5 57.5 17.5 55.2 14.5C53 11.7 49.5 11.5 46 14Z"
        fill="currentColor"
      />
      <path
        d="M43.5 15.5C40.2 15.2 38 18 38.4 21.8C38.8 25.2 41.4 27.2 44.5 26.8C47.4 26.4 49 23.6 48.6 20.4C48.2 17.2 46.2 15.7 43.5 15.5Z"
        fill="rgba(0,0,0,0.32)"
      />
      <circle cx="51.2" cy="18.2" r="1.2" fill="#0a0a0c" />
      <path
        d="M9.5 23C7.2 24.5 5.8 27.2 5.5 30.2"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AnatomicalMuscleDiagram({
  trainedMuscles,
}: {
  trainedMuscles: Set<MuscleGroupKey>;
}) {
  const activeFill = '#F77F00';
  const inactiveFill = 'rgba(255,255,255,0.16)';
  const baseOutline = 'rgba(255,255,255,0.22)';

  const fillFor = (key: MuscleGroupKey) =>
    trainedMuscles.has(key) ? activeFill : inactiveFill;

  return (
    <div className="flex items-center justify-center gap-6 py-1">
      {/* VISTA ANTERIOR (FRENTE) */}
      <div className="flex flex-col items-center gap-1">
        <svg
          viewBox="0 0 110 210"
          className="w-[74px] h-[140px] drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)]"
          aria-label="Anatomia anterior"
        >
          {/* Cabeça e pescoço */}
          <circle cx="55" cy="18" r="11" fill={baseOutline} />
          <rect x="49" y="29" width="12" height="8" rx="3" fill={baseOutline} />

          {/* Tronco base */}
          <path
            d="M34 40 C34 36 42 35 55 35 C68 35 76 36 76 40 L72 95 C72 103 65 108 55 108 C45 108 38 103 38 95 Z"
            fill="rgba(255,255,255,0.08)"
          />

          {/* Ombros / Deltoides */}
          <ellipse cx="32" cy="46" rx="8.5" ry="9.5" fill={fillFor('shoulders')} />
          <ellipse cx="78" cy="46" rx="8.5" ry="9.5" fill={fillFor('shoulders')} />

          {/* Peitoral */}
          <path
            d="M39 43 C44 40 53 41 54 46 L54 58 C48 60 40 57 38 51 Z"
            fill={fillFor('chest')}
          />
          <path
            d="M71 43 C66 40 57 41 56 46 L56 58 C62 60 70 57 72 51 Z"
            fill={fillFor('chest')}
          />

          {/* Bíceps */}
          <rect x="23" y="55" width="9.5" height="24" rx="4.7" fill={fillFor('biceps')} />
          <rect x="77.5" y="55" width="9.5" height="24" rx="4.7" fill={fillFor('biceps')} />

          {/* Antebraços */}
          <rect x="20" y="81" width="8.5" height="24" rx="4.2" fill={baseOutline} />
          <rect x="81.5" y="81" width="8.5" height="24" rx="4.2" fill={baseOutline} />

          {/* Abdómen / Core */}
          <rect x="45" y="61" width="8.5" height="10" rx="2.5" fill={fillFor('abs')} />
          <rect x="56.5" y="61" width="8.5" height="10" rx="2.5" fill={fillFor('abs')} />
          <rect x="45" y="73" width="8.5" height="10" rx="2.5" fill={fillFor('abs')} />
          <rect x="56.5" y="73" width="8.5" height="10" rx="2.5" fill={fillFor('abs')} />
          <rect x="46" y="85" width="18" height="10" rx="3" fill={fillFor('abs')} />

          {/* Quadríceps */}
          <path
            d="M37 107 C36 122 36 142 40 156 C44 159 50 158 52 153 L53 111 Z"
            fill={fillFor('quads')}
          />
          <path
            d="M73 107 C74 122 74 142 70 156 C66 159 60 158 58 153 L57 111 Z"
            fill={fillFor('quads')}
          />

          {/* Canelas / Gémeos anteriores */}
          <path
            d="M40 161 L50 161 L48 198 C45 200 41 199 40 196 Z"
            fill={fillFor('calves')}
          />
          <path
            d="M60 161 L70 161 L70 196 C69 199 65 200 62 198 Z"
            fill={fillFor('calves')}
          />
        </svg>
        <span className="text-[10px] font-semibold text-zinc-300 tracking-wide">
          Frente
        </span>
      </div>

      {/* VISTA POSTERIOR (COSTAS) */}
      <div className="flex flex-col items-center gap-1">
        <svg
          viewBox="0 0 110 210"
          className="w-[74px] h-[140px] drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)]"
          aria-label="Anatomia posterior"
        >
          {/* Cabeça e pescoço */}
          <circle cx="55" cy="18" r="11" fill={baseOutline} />
          <rect x="49" y="29" width="12" height="8" rx="3" fill={baseOutline} />

          {/* Tronco base */}
          <path
            d="M34 40 C34 36 42 35 55 35 C68 35 76 36 76 40 L72 95 C72 103 65 108 55 108 C45 108 38 103 38 95 Z"
            fill="rgba(255,255,255,0.08)"
          />

          {/* Ombros posteriores */}
          <ellipse cx="32" cy="46" rx="8.5" ry="9.5" fill={fillFor('shoulders')} />
          <ellipse cx="78" cy="46" rx="8.5" ry="9.5" fill={fillFor('shoulders')} />

          {/* Dorsais e Trapézio */}
          <path
            d="M42 38 L68 38 L62 55 L48 55 Z"
            fill={fillFor('back')}
          />
          <path
            d="M37 47 L53 56 L53 84 L41 79 Z"
            fill={fillFor('back')}
          />
          <path
            d="M73 47 L57 56 L57 84 L69 79 Z"
            fill={fillFor('back')}
          />

          {/* Tríceps */}
          <rect x="23" y="55" width="9.5" height="24" rx="4.7" fill={fillFor('triceps')} />
          <rect x="77.5" y="55" width="9.5" height="24" rx="4.7" fill={fillFor('triceps')} />

          {/* Antebraços */}
          <rect x="20" y="81" width="8.5" height="24" rx="4.2" fill={baseOutline} />
          <rect x="81.5" y="81" width="8.5" height="24" rx="4.2" fill={baseOutline} />

          {/* Glúteos */}
          <ellipse cx="46" cy="105" rx="10.5" ry="13" fill={fillFor('glutes')} />
          <ellipse cx="64" cy="105" rx="10.5" ry="13" fill={fillFor('glutes')} />

          {/* Isquiotibiais / Posteriores */}
          <path
            d="M37 119 L52 121 L51 155 C46 158 40 156 38 152 Z"
            fill={fillFor('hamstrings')}
          />
          <path
            d="M73 119 L58 121 L59 155 C64 158 70 156 72 152 Z"
            fill={fillFor('hamstrings')}
          />

          {/* Gémeos posteriores */}
          <ellipse cx="45" cy="176" rx="6.5" ry="16" fill={fillFor('calves')} />
          <ellipse cx="65" cy="176" rx="6.5" ry="16" fill={fillFor('calves')} />
        </svg>
        <span className="text-[10px] font-semibold text-zinc-300 tracking-wide">
          Costas
        </span>
      </div>
    </div>
  );
}

const STYLE_OPTIONS: {
  id: ShareOverlayStyle;
  label: string;
}[] = [
  { id: 'principal', label: 'Principal' },
  { id: 'mes', label: 'Calendário do Mês' },
  { id: 'semana', label: 'Calendário da Semana' },
  { id: 'treino', label: 'Treino do Dia' },
  { id: 'anatomia', label: 'Músculos Treinados' },
  { id: 'recordes', label: 'Recordes Pessoais' },
];

function StyleThumbnailPreview({
  styleId,
  trainedMuscles,
  hasBackground,
}: {
  styleId: ShareOverlayStyle;
  trainedMuscles: Set<MuscleGroupKey>;
  hasBackground: boolean;
}) {
  const miniCardClass = hasBackground
    ? 'w-full h-full rounded-lg bg-black/75 border border-white/12 p-2 flex flex-col justify-between'
    : 'w-full h-full rounded-lg bg-transparent p-1.5 flex flex-col justify-between';

  switch (styleId) {
    case 'principal':
      return (
        <div className={miniCardClass}>
          <div className="flex items-center justify-between gap-1">
            <div>
              <div className="text-[7px] font-black tracking-[0.16em] text-[#F77F00] leading-none">
                RTEAM
              </div>
              <div className="text-xs font-black text-white leading-tight mt-1 tabular-nums">
                14k <span className="text-[8px] text-[#F77F00]">kg</span>
              </div>
            </div>
            <ElephantSilhouette className="w-6 h-5 text-[#F77F00] shrink-0" />
          </div>
          <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-white/12 text-center tabular-nums">
            <div>
              <span className="text-[8px] font-black text-white block leading-none">120</span>
              <span className="text-[6px] text-zinc-400 block mt-0.5">Reps</span>
            </div>
            <div>
              <span className="text-[8px] font-black text-white block leading-none">14</span>
              <span className="text-[6px] text-zinc-400 block mt-0.5">Séries</span>
            </div>
            <div>
              <span className="text-[8px] font-black text-[#F77F00] block leading-none">3</span>
              <span className="text-[6px] text-zinc-400 block mt-0.5">PRs</span>
            </div>
          </div>
        </div>
      );

    case 'mes': {
      const activeIdx = new Set([0, 1, 3, 5, 7, 8, 10, 12, 14, 15, 17, 19]);
      return (
        <div className={miniCardClass}>
          <div className="flex items-center justify-between">
            <span className="text-[7px] font-bold text-white">Mês</span>
            <span className="text-[8px] font-black text-[#F77F00] tabular-nums">12 treinos</span>
          </div>
          <div className="grid grid-cols-7 gap-1 mt-1">
            {Array.from({ length: 21 }).map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full mx-auto ${
                  activeIdx.has(idx) ? 'bg-[#F77F00]' : 'bg-white/15'
                }`}
              />
            ))}
          </div>
        </div>
      );
    }

    case 'semana': {
      const trainedWeek = [true, true, false, true, false, true, false];
      const letters = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
      return (
        <div className={miniCardClass}>
          <div className="flex items-center justify-between">
            <span className="text-[7px] font-bold text-white">Semana</span>
            <span className="text-[8px] font-black text-[#F77F00] tabular-nums">4 treinos</span>
          </div>
          <div className="grid grid-cols-7 gap-0.5 items-center my-auto">
            {trainedWeek.map((active, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <span className="text-[6px] text-zinc-400 leading-none">{letters[idx]}</span>
                <span
                  className={`w-3 h-3 rounded-full ${
                    active ? 'bg-[#F77F00]' : 'bg-white/15'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'treino':
      return (
        <div className={miniCardClass}>
          <div className="flex items-center justify-between gap-1">
            <span className="text-[8px] font-black text-white truncate">Glúteos</span>
            <span className="text-[6px] font-black tracking-[0.14em] text-[#F77F00]">RTEAM</span>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1.5 border-t border-white/12 tabular-nums">
            <div>
              <span className="text-[6px] text-zinc-400 block leading-none">Volume</span>
              <span className="text-[8px] font-black text-[#F77F00] leading-tight">14k kg</span>
            </div>
            <div>
              <span className="text-[6px] text-zinc-400 block leading-none">Duração</span>
              <span className="text-[8px] font-black text-white leading-tight">55m</span>
            </div>
            <div>
              <span className="text-[6px] text-zinc-400 block leading-none">Reps</span>
              <span className="text-[8px] font-black text-white leading-tight">120</span>
            </div>
            <div>
              <span className="text-[6px] text-zinc-400 block leading-none">Séries</span>
              <span className="text-[8px] font-black text-white leading-tight">14</span>
            </div>
          </div>
        </div>
      );

    case 'anatomia': {
      const fillMini = (key: MuscleGroupKey) =>
        trainedMuscles.has(key) ? '#F77F00' : 'rgba(255,255,255,0.2)';
      return (
        <div className={miniCardClass}>
          <div className="text-[7px] font-black text-white text-center truncate leading-none">
            Glúteos & Posteriores
          </div>
          <div className="flex items-center justify-center gap-3 flex-1 pt-1">
            {/* Mini Frente */}
            <svg viewBox="0 0 110 210" className="w-7 h-12" aria-hidden="true">
              <circle cx="55" cy="18" r="11" fill="rgba(255,255,255,0.22)" />
              <ellipse cx="32" cy="46" rx="9" ry="10" fill={fillMini('shoulders')} />
              <ellipse cx="78" cy="46" rx="9" ry="10" fill={fillMini('shoulders')} />
              <rect x="38" y="42" width="34" height="17" rx="6" fill={fillMini('chest')} />
              <rect x="44" y="62" width="22" height="32" rx="4" fill={fillMini('abs')} />
              <rect x="22" y="56" width="10" height="38" rx="5" fill={fillMini('biceps')} />
              <rect x="78" y="56" width="10" height="38" rx="5" fill={fillMini('biceps')} />
              <rect x="37" y="106" width="15" height="50" rx="6" fill={fillMini('quads')} />
              <rect x="58" y="106" width="15" height="50" rx="6" fill={fillMini('quads')} />
              <rect x="40" y="160" width="10" height="38" rx="4" fill={fillMini('calves')} />
              <rect x="60" y="160" width="10" height="38" rx="4" fill={fillMini('calves')} />
            </svg>
            {/* Mini Costas */}
            <svg viewBox="0 0 110 210" className="w-7 h-12" aria-hidden="true">
              <circle cx="55" cy="18" r="11" fill="rgba(255,255,255,0.22)" />
              <ellipse cx="32" cy="46" rx="9" ry="10" fill={fillMini('shoulders')} />
              <ellipse cx="78" cy="46" rx="9" ry="10" fill={fillMini('shoulders')} />
              <path d="M38 40 L72 40 L66 84 L44 84 Z" fill={fillMini('back')} />
              <rect x="22" y="56" width="10" height="38" rx="5" fill={fillMini('triceps')} />
              <rect x="78" y="56" width="10" height="38" rx="5" fill={fillMini('triceps')} />
              <ellipse cx="46" cy="105" rx="11" ry="13" fill={fillMini('glutes')} />
              <ellipse cx="64" cy="105" rx="11" ry="13" fill={fillMini('glutes')} />
              <rect x="37" y="120" width="15" height="36" rx="6" fill={fillMini('hamstrings')} />
              <rect x="58" y="120" width="15" height="36" rx="6" fill={fillMini('hamstrings')} />
              <rect x="40" y="160" width="10" height="38" rx="4" fill={fillMini('calves')} />
              <rect x="60" y="160" width="10" height="38" rx="4" fill={fillMini('calves')} />
            </svg>
          </div>
        </div>
      );
    }

    case 'recordes':
      return (
        <div className={miniCardClass}>
          <div className="flex items-center justify-between">
            <span className="text-[7px] font-black uppercase text-white">PRs</span>
            <span className="text-[7px] font-black text-[#F77F00]">3 Novos</span>
          </div>
          <div className="flex flex-col gap-1.5 mt-1">
            <div className="flex items-center justify-between gap-1">
              <span className="h-1.5 w-12 rounded-full bg-white/75" />
              <span className="text-[7px] font-black text-[#F77F00] tabular-nums">70 kg</span>
            </div>
            <div className="flex items-center justify-between gap-1">
              <span className="h-1.5 w-10 rounded-full bg-white/55" />
              <span className="text-[7px] font-black text-[#F77F00] tabular-nums">52 kg</span>
            </div>
            <div className="flex items-center justify-between gap-1">
              <span className="h-1.5 w-11 rounded-full bg-white/40" />
              <span className="text-[7px] font-black text-[#F77F00] tabular-nums">150 kg</span>
            </div>
          </div>
        </div>
      );
  }
}

const PT_MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const WEEK_LETTERS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
const WEEK_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export function WorkoutSharePhotoEditor({
  photoUrl,
  data,
  onBack,
  onChangePhoto,
  onComplete,
}: WorkoutSharePhotoEditorProps) {
  const { createPost } = useCommunity();
  const [selectedStyle, setSelectedStyle] = useState<ShareOverlayStyle>('principal');
  const [hasBackground, setHasBackground] = useState(true);
  const [isStyleSheetOpen, setIsStyleSheetOpen] = useState(false);
  const [showDragHint, setShowDragHint] = useState(true);
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [hasShared, setHasShared] = useState(false);

  // Drag positioning state
  const canvasRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const replacePhotoInputRef = useRef<HTMLInputElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef<{ startPointerX: number; startPointerY: number; startX: number; startY: number }>({
    startPointerX: 0,
    startPointerY: 0,
    startX: 0,
    startY: 0,
  });

  // Derived metrics
  const totalSets = useMemo(() => {
    if (typeof data.totalSets === 'number') return data.totalSets;
    return data.exercises.reduce((sum, ex) => sum + ex.setsCount, 0);
  }, [data.totalSets, data.exercises]);

  const totalReps = useMemo(() => {
    if (typeof data.totalReps === 'number') return data.totalReps;
    return data.exercises.reduce((sum, ex) => {
      const r = typeof ex.bestReps === 'number' ? ex.bestReps : parseInt(String(ex.bestReps), 10) || 0;
      return sum + ex.setsCount * r;
    }, 0);
  }, [data.totalReps, data.exercises]);

  const elephantCount =
    data.elephantEquivalentCount ?? (data.totalKg > 0 ? Math.max(1, Math.round(data.totalKg / 6000)) : 0);

  const trainedMuscles = useMemo(() => detectTrainedMuscles(data), [data]);

  // Month & week calendar data (always includes today as trained + realistic recent cadence)
  const calendarInfo = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const todayDate = now.getDate();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayJs = new Date(year, month, 1).getDay(); // 0 Sun .. 6 Sat
    const leadingBlanks = (firstDayJs + 6) % 7; // Monday = 0

    // Consistent trained days up to today (e.g. Mon, Tue, Thu, Sat pattern + today)
    const trainedDaysSet = new Set<number>();
    for (let d = 1; d <= todayDate; d++) {
      const dow = (new Date(year, month, d).getDay() + 6) % 7; // 0=Mon..6=Sun
      if (dow === 0 || dow === 1 || dow === 3 || dow === 5 || d === todayDate) {
        trainedDaysSet.add(d);
      }
    }

    // Current week (Mon..Sun containing today)
    const todayDow = (now.getDay() + 6) % 7;
    const monday = new Date(year, month, todayDate - todayDow);
    const weekDays = Array.from({ length: 7 }, (_, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const isToday =
        d.getFullYear() === year && d.getMonth() === month && d.getDate() === todayDate;
      const isFuture = d > now && !isToday;
      const isTrained =
        !isFuture && (idx === 0 || idx === 1 || idx === 3 || idx === 5 || isToday);
      return {
        label: WEEK_SHORT[idx],
        dayNum: d.getDate(),
        isToday,
        isTrained,
      };
    });

    const weekTrainedCount = weekDays.filter((w) => w.isTrained).length;

    return {
      monthLabel: `${PT_MONTHS[month]} ${year}`,
      daysInMonth,
      leadingBlanks,
      todayDate,
      trainedDaysSet,
      monthTrainedCount: trainedDaysSet.size,
      weekDays,
      weekTrainedCount,
    };
  }, []);

  // Personal records list for option 6
  const personalRecordsList = useMemo(() => {
    const sessionPrs = data.exercises
      .filter((ex) => ex.isPr)
      .map((ex) => ({
        name: ex.name,
        weight: `${ex.bestWeight} kg`,
        reps: `${ex.bestReps} reps`,
        delta: ex.progression || 'Novo PR',
      }));

    if (sessionPrs.length > 0) {
      return sessionPrs.slice(0, 4);
    }

    const stored = loadPersonalRecords();
    return stored.slice(0, 4).map((rec) => ({
      name: rec.exercise,
      weight: `${formatKgPt(rec.bestWeight)} kg`,
      reps: `${rec.bestReps} reps`,
      delta: 'Recorde',
    }));
  }, [data.exercises]);

  // Hide initial drag hint smoothly
  useEffect(() => {
    const timer = setTimeout(() => setShowDragHint(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Center overlay initially and clamp whenever style/background changes
  useEffect(() => {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !overlay) return;

    const cRect = canvas.getBoundingClientRect();
    const oRect = overlay.getBoundingClientRect();
    const padX = 14;
    const topSafe = 68;
    const bottomSafe = 96;

    const maxX = Math.max(padX, cRect.width - oRect.width - padX);
    const maxY = Math.max(topSafe, cRect.height - oRect.height - bottomSafe);

    setPosition((prev) => {
      if (!prev) {
        // Default: centered horizontally, lower-middle comfortably above action bar
        const defaultX = Math.max(padX, (cRect.width - oRect.width) / 2);
        const defaultY = Math.max(topSafe, Math.min(maxY, cRect.height - oRect.height - bottomSafe - 16));
        return { x: defaultX, y: defaultY };
      }
      return {
        x: Math.min(Math.max(prev.x, padX), maxX),
        y: Math.min(Math.max(prev.y, topSafe), maxY),
      };
    });
  }, [selectedStyle, hasBackground]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const overlay = overlayRef.current;
    const canvas = canvasRef.current;
    if (!overlay || !canvas) return;

    e.preventDefault();
    overlay.setPointerCapture(e.pointerId);
    setShowDragHint(false);
    setIsDragging(true);

    const currentPos = position ?? { x: 16, y: 120 };
    dragOffsetRef.current = {
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      startX: currentPos.x,
      startY: currentPos.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !overlay) return;

    const cRect = canvas.getBoundingClientRect();
    const oRect = overlay.getBoundingClientRect();
    const padX = 10;
    const topSafe = 62;
    const bottomSafe = 90;

    const dx = e.clientX - dragOffsetRef.current.startPointerX;
    const dy = e.clientY - dragOffsetRef.current.startPointerY;

    const nextX = dragOffsetRef.current.startX + dx;
    const nextY = dragOffsetRef.current.startY + dy;

    const maxX = Math.max(padX, cRect.width - oRect.width - padX);
    const maxY = Math.max(topSafe, cRect.height - oRect.height - bottomSafe);

    setPosition({
      x: Math.min(Math.max(nextX, padX), maxX),
      y: Math.min(Math.max(nextY, topSafe), maxY),
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    try {
      overlayRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if capture already released
    }
    setIsDragging(false);
  };

  const handleReplacePhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChangePhoto(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleShare = async () => {
    const summaryLine = `${data.workoutName} · ${data.totalKg.toLocaleString('pt-PT')} kg · ${totalSets} séries · ${totalReps} reps`;

    // Publish to EVOLV Community feed
    createPost({
      type: 'workout',
      content: `Treino concluído: ${summaryLine}`,
      images: [photoUrl],
    });

    // Try native Web Share API when available
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: `RTEAM · ${data.workoutName}`,
          text: summaryLine,
        });
      } catch {
        // User cancelled native share sheet or browser blocked it
      }
    }

    setHasShared(true);
    setShareToast('Partilhado com sucesso na comunidade');
    setTimeout(() => {
      setShareToast(null);
    }, 2400);
  };

  // Overlay container styling based on Fundo ON/OFF
  const cardSurfaceClass = hasBackground
    ? 'bg-black/72 backdrop-blur-md border border-white/15 rounded-2xl p-4 shadow-[0_14px_36px_rgba(0,0,0,0.65)]'
    : 'bg-transparent border border-transparent p-2 [text-shadow:0_2px_10px_rgba(0,0,0,0.92)]';

  const renderOverlayContent = () => {
    switch (selectedStyle) {
      case 'principal':
        return (
          <div className="w-[296px] max-w-[calc(100vw-36px)]">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="font-black text-xs tracking-[0.22em] text-[#F77F00]">
                RTEAM
              </span>
              <span className="text-[11px] font-semibold text-zinc-300 truncate">
                {data.workoutName}
              </span>
            </div>

            {/* Volume + Elefante */}
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] font-semibold text-zinc-300 uppercase tracking-wider block">
                  Volume Total
                </span>
                <div className="text-3xl font-black text-white tracking-tight leading-none mt-0.5 tabular-nums">
                  {data.totalKg.toLocaleString('pt-PT')}
                  <span className="text-sm font-bold text-[#F77F00] ml-1">kg</span>
                </div>
              </div>

              {data.totalKg > 0 && (
                <div className="flex items-center gap-1.5 text-right shrink-0">
                  <ElephantSilhouette className="w-9 h-7 text-[#F77F00] drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]" />
                  <div className="leading-tight">
                    <span className="text-xs font-extrabold text-white block tabular-nums">
                      ≈ {elephantCount} {elephantCount === 1 ? 'elefante' : 'elefantes'}
                    </span>
                    <span className="text-[9px] text-zinc-300 block">
                      peso equivalente
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Reps / Séries / PRs */}
            <div
              className={`grid grid-cols-3 gap-2 pt-3 mt-3 text-center ${
                hasBackground ? 'border-t border-white/12' : 'border-t border-white/25'
              }`}
            >
              <div>
                <span className="text-base font-black text-white block leading-none tabular-nums">
                  {totalReps}
                </span>
                <span className="text-[10px] font-semibold text-zinc-300 block mt-1">
                  Reps
                </span>
              </div>
              <div>
                <span className="text-base font-black text-white block leading-none tabular-nums">
                  {totalSets}
                </span>
                <span className="text-[10px] font-semibold text-zinc-300 block mt-1">
                  Séries
                </span>
              </div>
              <div>
                <span className="text-base font-black text-[#F77F00] block leading-none tabular-nums">
                  {data.prsCount}
                </span>
                <span className="text-[10px] font-semibold text-zinc-300 block mt-1">
                  PRs
                </span>
              </div>
            </div>
          </div>
        );

      case 'mes':
        return (
          <div className="w-[286px] max-w-[calc(100vw-36px)]">
            <div className="flex items-baseline justify-between gap-2 mb-2.5">
              <div>
                <span className="text-xs font-extrabold text-white block leading-tight">
                  {calendarInfo.monthLabel}
                </span>
                <span className="text-[10px] font-semibold text-zinc-300">
                  Consistência mensal
                </span>
              </div>
              <div className="text-right tabular-nums">
                <span className="text-xl font-black text-[#F77F00] leading-none">
                  {calendarInfo.monthTrainedCount}
                </span>
                <span className="text-[11px] font-bold text-white ml-1">
                  {calendarInfo.monthTrainedCount === 1 ? 'treino' : 'treinos'}
                </span>
              </div>
            </div>

            {/* Dias da semana */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {WEEK_LETTERS.map((letter, idx) => (
                <span
                  key={idx}
                  className="text-[9px] font-bold text-zinc-400 uppercase"
                >
                  {letter}
                </span>
              ))}
            </div>

            {/* Grelha mensal */}
            <div className="grid grid-cols-7 gap-y-1 gap-x-1 text-center tabular-nums">
              {Array.from({ length: calendarInfo.leadingBlanks }).map((_, i) => (
                <span key={`empty-${i}`} className="h-6" />
              ))}
              {Array.from({ length: calendarInfo.daysInMonth }, (_, i) => {
                const day = i + 1;
                const isTrained = calendarInfo.trainedDaysSet.has(day);
                const isToday = day === calendarInfo.todayDate;
                return (
                  <div
                    key={day}
                    className="flex items-center justify-center h-6"
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                        isTrained
                          ? 'bg-[#F77F00] text-white shadow-sm'
                          : 'text-zinc-300/75'
                      } ${isToday ? 'ring-2 ring-white/90' : ''}`}
                    >
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'semana':
        return (
          <div className="w-[296px] max-w-[calc(100vw-36px)]">
            <div className="flex items-baseline justify-between gap-2 mb-3">
              <div>
                <span className="text-xs font-extrabold text-white block leading-tight">
                  Esta semana
                </span>
                <span className="text-[10px] font-semibold text-zinc-300">
                  {data.workoutName}
                </span>
              </div>
              <div className="text-right tabular-nums">
                <span className="text-xl font-black text-[#F77F00] leading-none">
                  {calendarInfo.weekTrainedCount}
                </span>
                <span className="text-[11px] font-bold text-white ml-1">
                  {calendarInfo.weekTrainedCount === 1 ? 'treino' : 'treinos'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1.5 text-center tabular-nums">
              {calendarInfo.weekDays.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-zinc-300">
                    {day.label}
                  </span>
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold ${
                      day.isTrained
                        ? 'bg-[#F77F00] text-white shadow-md shadow-orange-500/30'
                        : 'bg-white/10 text-zinc-300'
                    } ${day.isToday ? 'ring-2 ring-white' : ''}`}
                  >
                    {day.dayNum}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'treino':
        return (
          <div className="w-[288px] max-w-[calc(100vw-36px)]">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className="text-base font-black text-white tracking-tight leading-snug truncate">
                {data.workoutName}
              </span>
              <span className="font-black text-[10px] tracking-[0.2em] text-[#F77F00] shrink-0">
                RTEAM
              </span>
            </div>

            <div
              className={`grid grid-cols-2 gap-x-4 gap-y-2.5 pt-2.5 ${
                hasBackground ? 'border-t border-white/12' : 'border-t border-white/25'
              } tabular-nums`}
            >
              <div>
                <span className="text-[10px] font-semibold text-zinc-300 block">
                  Volume
                </span>
                <span className="text-lg font-black text-[#F77F00] leading-tight">
                  {data.totalKg.toLocaleString('pt-PT')} kg
                </span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-zinc-300 block">
                  Duração
                </span>
                <span className="text-lg font-black text-white leading-tight">
                  {data.durationStr}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-zinc-300 block">
                  Reps
                </span>
                <span className="text-lg font-black text-white leading-tight">
                  {totalReps}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-zinc-300 block">
                  Séries
                </span>
                <span className="text-lg font-black text-white leading-tight">
                  {totalSets}
                </span>
              </div>
            </div>
          </div>
        );

      case 'anatomia':
        return (
          <div className="w-[272px] max-w-[calc(100vw-36px)]">
            <div className="text-center mb-1.5">
              <span className="text-sm font-black text-white tracking-tight block leading-snug">
                {data.workoutName}
              </span>
              <span className="text-[10px] font-semibold text-[#F77F00] block mt-0.5">
                {trainedMuscles.labels.join(' · ')}
              </span>
            </div>

            <AnatomicalMuscleDiagram trainedMuscles={trainedMuscles.keys} />
          </div>
        );

      case 'recordes':
        return (
          <div className="w-[292px] max-w-[calc(100vw-36px)]">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-[#F77F00] shrink-0" />
                <span className="text-xs font-black text-white tracking-wide uppercase">
                  Recordes Pessoais
                </span>
              </div>
              <span className="text-xs font-extrabold text-[#F77F00] tabular-nums">
                {data.prsCount > 0 ? `${data.prsCount} PRs` : `${personalRecordsList.length} Top`}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {personalRecordsList.map((pr, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between gap-2 ${
                    idx > 0
                      ? hasBackground
                        ? 'pt-2 border-t border-white/10'
                        : 'pt-2 border-t border-white/20'
                      : ''
                  }`}
                >
                  <span className="text-xs font-bold text-white truncate min-w-0">
                    {pr.name}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0 tabular-nums">
                    <span className="text-xs font-black text-[#F77F00]">
                      {pr.weight}
                    </span>
                    <span className="text-[10px] font-semibold text-zinc-300">
                      × {pr.reps.replace(' reps', '')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[330] bg-black flex flex-col select-none animate-in fade-in duration-200">
      {/* Hidden file input for swapping the photo */}
      <input
        ref={replacePhotoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleReplacePhotoFile}
      />

      {/* CANVAS DA FOTO COM OVERLAY ARRASTÁVEL */}
      <div
        ref={canvasRef}
        className="relative flex-1 w-full overflow-hidden bg-black"
      >
        {/* Foto escolhida ou tirada */}
        <img
          src={photoUrl}
          alt="Foto do treino"
          draggable={false}
          className="w-full h-full object-cover pointer-events-none select-none"
        />

        {/* Vinhetas suaves para legibilidade dos controlos de topo e fundo */}
        <div
          className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/75 via-black/30 to-transparent pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none"
          aria-hidden="true"
        />

        {/* BARRA SUPERIOR */}
        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            aria-label="Voltar"
            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-black/70 flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => replacePhotoInputRef.current?.click()}
              aria-label="Trocar foto"
              title="Trocar foto"
              className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md text-white hover:text-[#F77F00] flex items-center justify-center transition-colors cursor-pointer"
            >
              <ImagePlus className="w-5 h-5" />
            </button>

            {hasShared && (
              <button
                type="button"
                onClick={onComplete}
                className="h-10 px-3.5 rounded-full bg-black/60 backdrop-blur-md text-white hover:text-[#F77F00] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4 text-[#F77F00]" />
                <span>Concluir</span>
              </button>
            )}
          </div>
        </div>

        {/* Dica discreta inicial para arrastar */}
        {showDragHint && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-black/65 backdrop-blur-md text-[11px] font-semibold text-zinc-200 pointer-events-none animate-in fade-in duration-300 whitespace-nowrap">
            Arrasta o cartão para posicionar na foto
          </div>
        )}

        {/* OVERLAY ARRASTÁVEL DAS STATS */}
        <div
          ref={overlayRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            transform: position
              ? `translate3d(${position.x}px, ${position.y}px, 0)`
              : 'translate3d(16px, 240px, 0)',
            touchAction: 'none',
          }}
          className={`absolute top-0 left-0 z-10 select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          <div
            className={`transition-transform duration-150 ${
              isDragging ? 'scale-[1.02]' : 'scale-100'
            } ${cardSurfaceClass}`}
          >
            {renderOverlayContent()}
          </div>
        </div>

        {/* BARRA INFERIOR: PARTILHAR + BOTÃO DE ESTILO AO LADO */}
        <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleShare}
            className="flex-1 min-h-[48px] py-3.5 px-5 rounded-2xl bg-[#F77F00] hover:bg-[#e57300] active:scale-[0.98] text-white font-bold text-sm shadow-xl shadow-orange-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Share2 className="w-5 h-5 shrink-0" strokeWidth={2.2} />
            <span>Partilhar</span>
          </button>

          <button
            type="button"
            onClick={() => setIsStyleSheetOpen(true)}
            aria-label="Mudar estilo do overlay"
            className="min-h-[48px] py-3.5 px-4 rounded-2xl bg-[#141416]/95 hover:bg-zinc-800 backdrop-blur-md border border-zinc-700/80 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shrink-0 transition-all cursor-pointer"
          >
            <Layers className="w-5 h-5 text-[#F77F00] shrink-0" strokeWidth={2.2} />
            <span>Estilo</span>
          </button>
        </div>
      </div>

      {/* TOAST DE PARTILHA */}
      {shareToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[350] bg-[#141416] border border-[#F77F00]/70 text-white px-4 py-2.5 rounded-2xl font-semibold text-xs shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 whitespace-nowrap">
          {shareToast}
        </div>
      )}

      {/* POP-UP DE BAIXO: ESTILO DO OVERLAY */}
      {isStyleSheetOpen && (
        <div
          className="fixed inset-0 z-[340] flex items-end justify-center bg-black/45 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsStyleSheetOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Estilo do overlay"
            className="w-full max-w-[414px] flex flex-col bg-[#0a0a0c] border-t border-x border-zinc-800 rounded-t-[28px] shadow-[0_-24px_60px_rgba(0,0,0,0.9)] overflow-hidden animate-in slide-in-from-bottom duration-200"
          >
            {/* Drag handle */}
            <div className="pt-3 pb-1 flex justify-center shrink-0">
              <div className="w-10 h-1 rounded-full bg-zinc-700/80" />
            </div>

            {/* Cabeçalho (apenas cruz para fechar) */}
            <div className="flex items-center justify-between gap-3 px-5 pt-2 pb-3.5 border-b border-zinc-800/70 shrink-0">
              <h3 className="text-white text-base font-bold tracking-tight">
                Estilo do overlay
              </h3>
              <button
                type="button"
                onClick={() => setIsStyleSheetOpen(false)}
                aria-label="Fechar"
                className="p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="px-5 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] flex flex-col gap-4">
              {/* Toggle Fundo ON / OFF */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-white leading-tight">
                  Fundo
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={hasBackground}
                  aria-label="Fundo do overlay"
                  onClick={() => setHasBackground((prev) => !prev)}
                  className={`relative w-12 h-7 rounded-full transition-colors cursor-pointer shrink-0 ${
                    hasBackground ? 'bg-[#F77F00]' : 'bg-zinc-800'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                      hasBackground ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="h-px bg-zinc-800/80" />

              {/* Seleção horizontal com scroll: apenas simulação visual + título */}
              <div>
                <span className="text-xs font-bold text-zinc-400 block mb-3">
                  Escolher estilo
                </span>

                <div className="flex items-start gap-3 overflow-x-auto pb-1 -mx-5 px-5 hide-scrollbar snap-x snap-mandatory">
                  {STYLE_OPTIONS.map((option) => {
                    const isSelected = selectedStyle === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setSelectedStyle(option.id)}
                        className="shrink-0 w-[132px] flex flex-col items-center gap-2 snap-start cursor-pointer group active:scale-[0.98] transition-transform"
                      >
                        <div
                          className={`relative w-full h-[88px] rounded-2xl p-1.5 overflow-hidden border-2 transition-colors ${
                            isSelected
                              ? 'border-[#F77F00] bg-zinc-900 shadow-[0_0_20px_rgba(247,127,0,0.22)]'
                              : 'border-zinc-800 bg-zinc-900/80 group-hover:border-zinc-700'
                          }`}
                        >
                          {/* Simulação subtil de foto de fundo */}
                          <img
                            src={photoUrl}
                            alt=""
                            aria-hidden="true"
                            className="absolute inset-0 w-full h-full object-cover opacity-35 pointer-events-none"
                          />
                          <div className="relative z-10 w-full h-full">
                            <StyleThumbnailPreview
                              styleId={option.id}
                              trainedMuscles={trainedMuscles.keys}
                              hasBackground={hasBackground}
                            />
                          </div>
                        </div>

                        <span
                          className={`text-[11px] font-bold text-center leading-tight transition-colors ${
                            isSelected ? 'text-[#F77F00]' : 'text-zinc-200'
                          }`}
                        >
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.querySelector('.app-device-wrapper') || document.body
  );
}
