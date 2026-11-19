import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Camera,
  Check,
  ChevronDown,
  Columns2,
  Minus,
  MoveHorizontal,
  Plus,
  Ruler,
  Scale,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { AssessmentSubmission } from '../../types';

type VisualMode = 'side-by-side' | 'slider';
type PhotoPerspective = 'front' | 'side' | 'back';

interface ComparisonMetricConfig {
  id: string;
  label: string;
  unit: string;
  decimals: number;
  Icon: React.ComponentType<{ className?: string }>;
  getValue: (assessment: AssessmentSubmission) => number | undefined;
}

/**
 * Estrutura extensível de indicadores físicos comparados.
 * Novas medidas (ex.: Peito, Braço, Coxa) podem ser adicionadas diretamente a esta lista.
 */
const COMPARISON_METRICS: ComparisonMetricConfig[] = [
  {
    id: 'weight',
    label: 'Peso',
    unit: 'kg',
    decimals: 1,
    Icon: Scale,
    getValue: (a) => a.weight,
  },
  {
    id: 'cintura',
    label: 'Cintura',
    unit: 'cm',
    decimals: 1,
    Icon: Ruler,
    getValue: (a) => a.measurements?.cintura,
  },
  {
    id: 'quadril',
    label: 'Anca',
    unit: 'cm',
    decimals: 1,
    Icon: Activity,
    getValue: (a) => a.measurements?.quadril,
  },
];

const PERSPECTIVE_OPTIONS: { id: PhotoPerspective; label: string }[] = [
  { id: 'front', label: 'Frente' },
  { id: 'side', label: 'Lado' },
  { id: 'back', label: 'Costas' },
];

function formatPtNumber(value: number, decimals = 1): string {
  return value.toLocaleString('pt-PT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatSignedDiff(diff: number, unit: string, decimals = 1): string {
  if (Math.abs(diff) < 0.05) {
    return `${formatPtNumber(0, decimals)} ${unit}`;
  }
  const sign = diff > 0 ? '+' : '-';
  return `${sign}${formatPtNumber(Math.abs(diff), decimals)} ${unit}`;
}

function parseAssessmentTimestamp(assessment: AssessmentSubmission): number {
  if (assessment.isoDate) {
    const t = new Date(`${assessment.isoDate}T12:00:00`).getTime();
    if (!Number.isNaN(t)) return t;
  }
  return 0;
}

function formatShortDate(assessment: AssessmentSubmission): string {
  if (assessment.isoDate) {
    const d = new Date(`${assessment.isoDate}T12:00:00`);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString('pt-PT', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
  }
  return assessment.date;
}

function computeElapsedPeriodLabel(
  startAssessment: AssessmentSubmission,
  endAssessment: AssessmentSubmission
): string {
  const startTs = parseAssessmentTimestamp(startAssessment);
  const endTs = parseAssessmentTimestamp(endAssessment);
  if (!startTs || !endTs || endTs <= startTs) {
    return 'mesma data';
  }

  const start = new Date(startTs);
  const end = new Date(endTs);

  let months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  if (end.getDate() - start.getDate() >= 15) {
    months += 1;
  } else if (end.getDate() < start.getDate() && months > 1 && start.getDate() - end.getDate() >= 15) {
    months -= 1;
  }

  if (months >= 1) {
    return months === 1 ? 'durante 1 mês' : `durante ${months} meses`;
  }

  const days = Math.max(1, Math.round((endTs - startTs) / (1000 * 60 * 60 * 24)));
  return days === 1 ? 'durante 1 dia' : `durante ${days} dias`;
}

function readImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Invalid image file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read image'));
    reader.readAsDataURL(file);
  });
}

export function PhysicalEvolutionTab() {
  const { assessmentSubmissions, addAssessmentSubmission, student } = useProfile();

  // Ordenar avaliações cronologicamente (mais recente primeiro)
  const sortedAssessments = useMemo(() => {
    return [...assessmentSubmissions].sort(
      (a, b) => parseAssessmentTimestamp(b) - parseAssessmentTimestamp(a)
    );
  }, [assessmentSubmissions]);

  const [recentId, setRecentId] = useState<string>(
    () => sortedAssessments[0]?.id || ''
  );
  const [previousId, setPreviousId] = useState<string>(
    () => sortedAssessments[sortedAssessments.length - 1]?.id || sortedAssessments[0]?.id || ''
  );

  // Garantir seleções válidas e coerentes quando o conjunto de avaliações muda
  const recentIndex = useMemo(() => {
    const idx = sortedAssessments.findIndex((a) => a.id === recentId);
    return idx >= 0 ? idx : 0;
  }, [sortedAssessments, recentId]);

  const previousIndex = useMemo(() => {
    const idx = sortedAssessments.findIndex((a) => a.id === previousId);
    if (idx > recentIndex) return idx;
    if (sortedAssessments.length > recentIndex + 1) {
      return sortedAssessments.length - 1;
    }
    return recentIndex;
  }, [sortedAssessments, previousId, recentIndex]);

  const recentAssessment = sortedAssessments[recentIndex];
  const previousAssessment = sortedAssessments[previousIndex];

  const [visualMode, setVisualMode] = useState<VisualMode>('side-by-side');
  const [perspective, setPerspective] = useState<PhotoPerspective>('front');
  const [sliderPos, setSliderPos] = useState<number>(50);
  const sliderContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const [openDropdown, setOpenDropdown] = useState<'previous' | 'recent' | null>(null);
  const dropdownRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openDropdown) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (
        dropdownRowRef.current &&
        !dropdownRowRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openDropdown]);

  // Modal "Adicionar novas fotos"
  const [isAddPhotosOpen, setIsAddPhotosOpen] = useState(false);
  const [newIsoDate, setNewIsoDate] = useState<string>('2026-11-18');
  const [newWeight, setNewWeight] = useState<string>(() =>
    recentAssessment ? String(recentAssessment.weight) : '76.0'
  );
  const [newWaist, setNewWaist] = useState<string>(() =>
    recentAssessment ? String(recentAssessment.measurements.cintura) : '79.0'
  );
  const [newHip, setNewHip] = useState<string>(() =>
    recentAssessment ? String(recentAssessment.measurements.quadril) : '95.5'
  );
  const [uploadedPhotos, setUploadedPhotos] = useState<{
    front?: string;
    side?: string;
    back?: string;
  }>({});

  const frontInputRef = useRef<HTMLInputElement>(null);
  const sideInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  if (!recentAssessment || !previousAssessment) {
    return (
      <div className="rounded-[22px] bg-[#0a0a0a] border border-zinc-800/80 p-8 text-center">
        <Activity className="w-7 h-7 text-zinc-600 mx-auto mb-2" />
        <p className="text-sm font-semibold text-white">
          Sem avaliações físicas registadas
        </p>
      </div>
    );
  }

  const handleSelectRecent = (newId: string) => {
    setRecentId(newId);
    const nextRecentIdx = sortedAssessments.findIndex((a) => a.id === newId);
    if (nextRecentIdx >= 0 && previousIndex <= nextRecentIdx) {
      const fallbackPrev = sortedAssessments[nextRecentIdx + 1];
      if (fallbackPrev) {
        setPreviousId(fallbackPrev.id);
      }
    }
  };

  const handleSelectPrevious = (newId: string) => {
    setPreviousId(newId);
  };

  // Cálculo da variação de peso principal
  const weightDiff = Math.round((recentAssessment.weight - previousAssessment.weight) * 10) / 10;
  const elapsedLabel = computeElapsedPeriodLabel(previousAssessment, recentAssessment);
  const isWeightLoss = weightDiff < -0.05;
  const isWeightGain = weightDiff > 0.05;

  // Opções para os seletores
  const recentOptions =
    sortedAssessments.length > 1
      ? sortedAssessments.slice(0, sortedAssessments.length - 1)
      : sortedAssessments;

  const previousOptions =
    sortedAssessments.length > recentIndex + 1
      ? sortedAssessments.slice(recentIndex + 1)
      : sortedAssessments;

  const prevPhoto = previousAssessment.photos?.[perspective];
  const recentPhoto = recentAssessment.photos?.[perspective];

  const updateSliderFromClientX = (clientX: number) => {
    const el = sliderContainerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(5, Math.min(95, pct)));
  };

  const handleOpenAddPhotos = () => {
    setNewWeight(String(recentAssessment.weight));
    setNewWaist(String(recentAssessment.measurements.cintura));
    setNewHip(String(recentAssessment.measurements.quadril));
    setUploadedPhotos({});
    setIsAddPhotosOpen(true);
  };

  const handlePhotoUpload = async (
    targetPerspective: PhotoPerspective,
    fileList: FileList | null
  ) => {
    const file = fileList?.[0];
    if (!file) return;
    try {
      const dataUrl = await readImageAsDataUrl(file);
      setUploadedPhotos((prev) => ({
        ...prev,
        [targetPerspective]: dataUrl,
      }));
    } catch {
      // ignore read failure
    }
  };

  const handleSaveNewPhotos = (e: React.FormEvent) => {
    e.preventDefault();
    const hasAnyPhoto = Boolean(
      uploadedPhotos.front || uploadedPhotos.side || uploadedPhotos.back
    );
    if (!hasAnyPhoto) return;

    const dateObj = new Date(`${newIsoDate}T12:00:00`);
    const formattedDate = Number.isNaN(dateObj.getTime())
      ? newIsoDate
      : dateObj.toLocaleDateString('pt-PT', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });

    const parsedWeight = parseFloat(newWeight.replace(',', '.'));
    const parsedWaist = parseFloat(newWaist.replace(',', '.'));
    const parsedHip = parseFloat(newHip.replace(',', '.'));

    const created = addAssessmentSubmission({
      date: formattedDate,
      isoDate: newIsoDate,
      label: 'Registo Fotográfico',
      trainer: student.assessment.trainer || 'Prof. André Silva',
      weight: Number.isFinite(parsedWeight) ? parsedWeight : recentAssessment.weight,
      measurements: {
        ...recentAssessment.measurements,
        cintura: Number.isFinite(parsedWaist)
          ? parsedWaist
          : recentAssessment.measurements.cintura,
        quadril: Number.isFinite(parsedHip)
          ? parsedHip
          : recentAssessment.measurements.quadril,
      },
      photos: {
        front: uploadedPhotos.front || recentAssessment.photos.front,
        side: uploadedPhotos.side || recentAssessment.photos.side,
        back: uploadedPhotos.back || recentAssessment.photos.back,
      },
      questionnaire: {
        energyLevel: 4,
        muscleSoreness: 'Baixa',
        dietCompliance: '100% à risca',
        sleepRest: 'Muito reparador',
        notes: 'Novas fotografias de evolução carregadas.',
      },
    });

    setRecentId(created.id);
    if (uploadedPhotos.front) setPerspective('front');
    else if (uploadedPhotos.side) setPerspective('side');
    else if (uploadedPhotos.back) setPerspective('back');

    setIsAddPhotosOpen(false);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 2. VARIAÇÃO DE PESO */}
      <section className="rounded-[22px] bg-[#0a0a0a] border border-zinc-800/80 p-4.5 relative overflow-hidden">
        <div
          className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#F77F00]/60 to-transparent"
          aria-hidden="true"
        />

        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-[#F77F00] shrink-0" />
            <span className="text-xs font-semibold text-zinc-400">
              Variação de peso
            </span>
          </div>

          <div
            className={`inline-flex items-center gap-1 text-xs font-semibold ${
              isWeightLoss
                ? 'text-emerald-400'
                : isWeightGain
                  ? 'text-[#F77F00]'
                  : 'text-zinc-400'
            }`}
          >
            {isWeightLoss ? (
              <>
                <TrendingDown className="w-4 h-4" />
                <span>Redução</span>
              </>
            ) : isWeightGain ? (
              <>
                <TrendingUp className="w-4 h-4" />
                <span>Aumento</span>
              </>
            ) : (
              <>
                <Minus className="w-4 h-4" />
                <span>Sem alteração</span>
              </>
            )}
          </div>
        </div>

        <div className="text-[32px] font-black text-white tracking-tight tabular-nums leading-none my-2">
          {formatSignedDiff(weightDiff, 'kg', 1)}
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          Entre <span className="text-zinc-200 font-medium">{previousAssessment.date}</span> e{' '}
          <span className="text-zinc-200 font-medium">{recentAssessment.date}</span>,{' '}
          <span className="text-[#F77F00] font-semibold">{elapsedLabel}</span>.
        </p>
      </section>

      {/* 3. COMPARAÇÃO ENTRE AVALIAÇÕES */}
      <section className="space-y-3">
        <div ref={dropdownRowRef} className="relative">
          <div className="grid grid-cols-2 gap-2.5">
            {/* Avaliação Anterior */}
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={openDropdown === 'previous'}
              aria-label="Selecionar avaliação anterior"
              onClick={() =>
                setOpenDropdown((prev) =>
                  prev === 'previous' ? null : 'previous'
                )
              }
              className={`rounded-2xl bg-[#0a0a0a] border p-3 text-left transition-colors cursor-pointer ${
                openDropdown === 'previous'
                  ? 'border-[#F77F00]'
                  : 'border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[11px] font-semibold text-zinc-400">
                  Anterior
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform duration-200 ${
                    openDropdown === 'previous' ? 'rotate-180 text-[#F77F00]' : ''
                  }`}
                />
              </div>
              <p className="text-xs font-bold text-white truncate tabular-nums">
                {formatShortDate(previousAssessment)}
              </p>
              <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                {previousAssessment.label || 'Avaliação Física'}
              </p>
            </button>

            {/* Avaliação Mais Recente */}
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={openDropdown === 'recent'}
              aria-label="Selecionar avaliação mais recente"
              onClick={() =>
                setOpenDropdown((prev) => (prev === 'recent' ? null : 'recent'))
              }
              className={`rounded-2xl bg-[#0a0a0a] border p-3 text-left transition-colors cursor-pointer ${
                openDropdown === 'recent'
                  ? 'border-[#F77F00]'
                  : 'border-[#F77F00]/40 hover:border-[#F77F00]/70'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[11px] font-semibold text-[#F77F00]">
                  Mais recente
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#F77F00] shrink-0 transition-transform duration-200 ${
                    openDropdown === 'recent' ? 'rotate-180' : ''
                  }`}
                />
              </div>
              <p className="text-xs font-bold text-white truncate tabular-nums">
                {formatShortDate(recentAssessment)}
              </p>
              <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                {recentAssessment.label || 'Avaliação Física'}
              </p>
            </button>
          </div>

          {/* Menu Dropdown RTEAM */}
          {openDropdown && (
            <div
              role="listbox"
              aria-label={
                openDropdown === 'previous'
                  ? 'Selecionar avaliação anterior'
                  : 'Selecionar avaliação mais recente'
              }
              className="absolute left-0 right-0 top-full mt-2 z-50 rounded-[20px] bg-[#111111] border border-zinc-800 shadow-[0_18px_40px_rgba(0,0,0,0.65)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div
                className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#F77F00]/70 to-transparent"
                aria-hidden="true"
              />

              <div className="px-4 pt-3 pb-1.5 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#F77F00]">
                  {openDropdown === 'previous'
                    ? 'Avaliação anterior'
                    : 'Avaliação mais recente'}
                </span>
              </div>

              <div className="max-h-[260px] overflow-y-auto hide-scrollbar pb-1.5">
                {(openDropdown === 'previous'
                  ? previousOptions
                  : recentOptions
                ).map((item) => {
                  const isActive =
                    openDropdown === 'previous'
                      ? item.id === previousAssessment.id
                      : item.id === recentAssessment.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={() => {
                        if (openDropdown === 'previous') {
                          handleSelectPrevious(item.id);
                        } else {
                          handleSelectRecent(item.id);
                        }
                        setOpenDropdown(null);
                      }}
                      className={`w-full min-h-[48px] px-4 py-2.5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#F77F00]/12'
                          : 'hover:bg-[#F77F00]/10 active:bg-[#F77F00]/15'
                      }`}
                    >
                      <div className="min-w-0">
                        <p
                          className={`text-xs font-bold truncate tabular-nums ${
                            isActive ? 'text-[#F77F00]' : 'text-white'
                          }`}
                        >
                          {formatShortDate(item)}
                        </p>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                          {item.label || 'Avaliação Física'} ·{' '}
                          {formatPtNumber(item.weight, 1)} kg
                        </p>
                      </div>

                      {isActive && (
                        <Check className="w-4 h-4 text-[#F77F00] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Indicadores Físicos Comparados */}
        <div className="rounded-[22px] bg-[#0a0a0a] border border-zinc-800/80 divide-y divide-zinc-800/70 overflow-hidden">
          {COMPARISON_METRICS.map((metric) => {
            const currentVal = metric.getValue(recentAssessment);
            const prevVal = metric.getValue(previousAssessment);
            const hasBoth = currentVal !== undefined && prevVal !== undefined;
            const diff = hasBoth
              ? Math.round((currentVal - prevVal) * 10) / 10
              : 0;
            const isDecrease = diff < -0.05;
            const isIncrease = diff > 0.05;
            const MetricIcon = metric.Icon;

            return (
              <div
                key={metric.id}
                className="px-4 py-3.5 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <MetricIcon className="w-[18px] h-[18px] text-[#F77F00] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-white block leading-tight">
                      {metric.label}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 tabular-nums mt-0.5 flex-wrap">
                      <span>
                        Anterior:{' '}
                        <strong className="text-zinc-300 font-medium">
                          {prevVal !== undefined
                            ? `${formatPtNumber(prevVal, metric.decimals)} ${metric.unit}`
                            : '—'}
                        </strong>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Atual:{' '}
                        <strong className="text-white font-semibold">
                          {currentVal !== undefined
                            ? `${formatPtNumber(currentVal, metric.decimals)} ${metric.unit}`
                            : '—'}
                        </strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={`inline-flex items-center gap-1 text-xs font-bold tabular-nums shrink-0 ${
                    isDecrease
                      ? 'text-emerald-400'
                      : isIncrease
                        ? 'text-[#F77F00]'
                        : 'text-zinc-400'
                  }`}
                >
                  {isDecrease ? (
                    <ArrowDownRight className="w-4 h-4 shrink-0" />
                  ) : isIncrease ? (
                    <ArrowUpRight className="w-4 h-4 shrink-0" />
                  ) : (
                    <Minus className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span>
                    {hasBoth
                      ? formatSignedDiff(diff, metric.unit, metric.decimals)
                      : '—'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. EVOLUÇÃO VISUAL */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2 px-0.5">
          <h3 className="text-base font-bold text-white tracking-tight">
            Evolução visual
          </h3>

          {/* Alternância Lado a lado / Deslizar */}
          <div className="inline-flex p-0.5 rounded-xl bg-[#0a0a0a] border border-zinc-800/80 shrink-0">
            <button
              type="button"
              onClick={() => setVisualMode('side-by-side')}
              style={visualMode === 'side-by-side' ? { color: '#ffffff' } : undefined}
              className={`min-h-[34px] px-2.5 py-1 rounded-[10px] text-[11px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                visualMode === 'side-by-side'
                  ? 'bg-[#F77F00]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Columns2 className="w-3.5 h-3.5 shrink-0" />
              <span>Lado a lado</span>
            </button>
            <button
              type="button"
              onClick={() => setVisualMode('slider')}
              style={visualMode === 'slider' ? { color: '#ffffff' } : undefined}
              className={`min-h-[34px] px-2.5 py-1 rounded-[10px] text-[11px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                visualMode === 'slider'
                  ? 'bg-[#F77F00]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
              <span>Deslizar</span>
            </button>
          </div>
        </div>

        {/* Filtros por perspetiva: Frente, Lado, Costas */}
        <div className="grid grid-cols-3 gap-2">
          {PERSPECTIVE_OPTIONS.map((opt) => {
            const isSelected = perspective === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPerspective(opt.id)}
                className={`min-h-[40px] py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#F77F00]/15 border-[#F77F00] text-[#F77F00]'
                    : 'bg-[#0a0a0a] border-zinc-800/80 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Comparação Fotográfica */}
        {visualMode === 'side-by-side' ? (
          <div className="grid grid-cols-2 gap-2.5">
            {/* Anterior */}
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800/80">
              {prevPhoto ? (
                <img
                  src={prevPhoto}
                  alt={`Fotografia anterior - ${perspective}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 p-4 text-center">
                  <Camera className="w-6 h-6 mb-1.5 text-zinc-600" />
                  <span className="text-[11px]">Sem foto</span>
                </div>
              )}
              <div
                className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent"
                aria-hidden="true"
              >
                <span
                  style={{ color: '#ffffff' }}
                  className="text-[11px] font-bold block leading-tight"
                >
                  Anterior
                </span>
                <span
                  style={{ color: '#d4d4d8' }}
                  className="text-[10px] tabular-nums block mt-0.5"
                >
                  {formatShortDate(previousAssessment)}
                </span>
              </div>
            </div>

            {/* Mais recente */}
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 border border-[#F77F00]/40">
              {recentPhoto ? (
                <img
                  src={recentPhoto}
                  alt={`Fotografia mais recente - ${perspective}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 p-4 text-center">
                  <Camera className="w-6 h-6 mb-1.5 text-zinc-600" />
                  <span className="text-[11px]">Sem foto</span>
                </div>
              )}
              <div
                className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent"
                aria-hidden="true"
              >
                <span
                  style={{ color: '#F77F00' }}
                  className="text-[11px] font-bold block leading-tight"
                >
                  Mais recente
                </span>
                <span
                  style={{ color: '#d4d4d8' }}
                  className="text-[10px] tabular-nums block mt-0.5"
                >
                  {formatShortDate(recentAssessment)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div
            ref={sliderContainerRef}
            onPointerDown={(e) => {
              isDraggingRef.current = true;
              e.currentTarget.setPointerCapture(e.pointerId);
              updateSliderFromClientX(e.clientX);
            }}
            onPointerMove={(e) => {
              if (!isDraggingRef.current) return;
              updateSliderFromClientX(e.clientX);
            }}
            onPointerUp={() => {
              isDraggingRef.current = false;
            }}
            onPointerCancel={() => {
              isDraggingRef.current = false;
            }}
            className="relative aspect-[3/4] max-h-[460px] w-full rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800/80 select-none touch-none cursor-ew-resize"
          >
            {/* Imagem Mais Recente (camada base à direita) */}
            {recentPhoto ? (
              <img
                src={recentPhoto}
                alt={`Fotografia mais recente - ${perspective}`}
                referrerPolicy="no-referrer"
                draggable={false}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-xs">
                Sem fotografia recente nesta perspetiva
              </div>
            )}

            {/* Imagem Anterior (camada sobreposta à esquerda) */}
            {prevPhoto ? (
              <img
                src={prevPhoto}
                alt={`Fotografia anterior - ${perspective}`}
                referrerPolicy="no-referrer"
                draggable={false}
                style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
            ) : (
              <div
                style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                className="absolute inset-0 bg-zinc-950 flex items-center justify-center text-zinc-500 text-xs pointer-events-none"
              >
                Sem fotografia anterior
              </div>
            )}

            {/* Separador vertical interativo */}
            <div
              style={{ left: `${sliderPos}%` }}
              className="absolute inset-y-0 -translate-x-1/2 flex flex-col items-center justify-center pointer-events-none z-10"
            >
              <div className="w-[2px] flex-1 bg-[#F77F00] shadow-[0_0_8px_rgba(247,127,0,0.8)]" />
              <div
                style={{ color: '#ffffff' }}
                className="w-9 h-9 rounded-full bg-[#F77F00] border-2 border-white flex items-center justify-center shadow-lg my-0.5"
              >
                <MoveHorizontal className="w-4 h-4" />
              </div>
              <div className="w-[2px] flex-1 bg-[#F77F00] shadow-[0_0_8px_rgba(247,127,0,0.8)]" />
            </div>

            {/* Controlo acessível por teclado */}
            <input
              type="range"
              min={5}
              max={95}
              value={Math.round(sliderPos)}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              aria-label="Comparar fotografia anterior e mais recente"
              className="sr-only"
            />

            {/* Legendas nos cantos inferiores */}
            <div
              className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex items-end justify-between pointer-events-none z-10"
              aria-hidden="true"
            >
              <div>
                <span
                  style={{ color: '#ffffff' }}
                  className="text-[11px] font-bold block leading-tight"
                >
                  Anterior
                </span>
                <span style={{ color: '#d4d4d8' }} className="text-[10px] tabular-nums">
                  {formatShortDate(previousAssessment)}
                </span>
              </div>
              <div className="text-right">
                <span
                  style={{ color: '#F77F00' }}
                  className="text-[11px] font-bold block leading-tight"
                >
                  Mais recente
                </span>
                <span style={{ color: '#d4d4d8' }} className="text-[10px] tabular-nums">
                  {formatShortDate(recentAssessment)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Botão Adicionar novas fotos */}
        <button
          type="button"
          onClick={handleOpenAddPhotos}
          style={{ color: '#ffffff' }}
          className="w-full min-h-[46px] py-3 px-4 rounded-xl bg-[#F77F00] hover:bg-[#e57300] active:scale-[0.99] text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar novas fotos</span>
        </button>
      </section>

      {/* MODAL / SHEET: ADICIONAR NOVAS FOTOS */}
      {isAddPhotosOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setIsAddPhotosOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#111111] border border-zinc-800 rounded-t-[28px] sm:rounded-[24px] w-full max-w-[420px] max-h-[90vh] flex flex-col shadow-2xl animate-in slide-from-bottom duration-200 overflow-hidden"
          >
            <div className="px-5 pt-4 pb-3 border-b border-zinc-800/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Camera className="w-5 h-5 text-[#F77F00]" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  Adicionar novas fotos
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddPhotosOpen(false)}
                aria-label="Fechar"
                className="min-w-[40px] min-h-[40px] flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveNewPhotos}
              className="p-5 space-y-4 overflow-y-auto hide-scrollbar flex-1"
            >
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Data da avaliação
                  </label>
                  <input
                    type="date"
                    required
                    value={newIsoDate}
                    onChange={(e) => setNewIsoDate(e.target.value)}
                    className="w-full min-h-[42px] rounded-xl bg-[#0a0a0a] border border-zinc-800 px-3 text-xs text-white focus:outline-none focus:border-[#F77F00]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="w-full min-h-[42px] rounded-xl bg-[#0a0a0a] border border-zinc-800 px-3 text-xs text-white tabular-nums focus:outline-none focus:border-[#F77F00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Cintura (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newWaist}
                    onChange={(e) => setNewWaist(e.target.value)}
                    className="w-full min-h-[42px] rounded-xl bg-[#0a0a0a] border border-zinc-800 px-3 text-xs text-white tabular-nums focus:outline-none focus:border-[#F77F00]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Anca (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newHip}
                    onChange={(e) => setNewHip(e.target.value)}
                    className="w-full min-h-[42px] rounded-xl bg-[#0a0a0a] border border-zinc-800 px-3 text-xs text-white tabular-nums focus:outline-none focus:border-[#F77F00]"
                  />
                </div>
              </div>

              {/* Uploads por perspetiva */}
              <div className="grid grid-cols-3 gap-2.5 pt-1">
                {(
                  [
                    { id: 'front', label: 'Frente', ref: frontInputRef },
                    { id: 'side', label: 'Lado', ref: sideInputRef },
                    { id: 'back', label: 'Costas', ref: backInputRef },
                  ] as const
                ).map((slot) => {
                  const preview = uploadedPhotos[slot.id];
                  return (
                    <div key={slot.id} className="space-y-1.5">
                      <input
                        ref={slot.ref}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          handlePhotoUpload(slot.id, e.target.files);
                          e.target.value = '';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => slot.ref.current?.click()}
                        className={`w-full aspect-[3/4] rounded-2xl border overflow-hidden relative flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                          preview
                            ? 'border-[#F77F00] bg-zinc-900'
                            : 'border-dashed border-zinc-700 bg-[#0a0a0a] hover:border-[#F77F00]/70 text-zinc-400 hover:text-white'
                        }`}
                      >
                        {preview ? (
                          <img
                            src={preview}
                            alt={slot.label}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <>
                            <Camera className="w-5 h-5 text-[#F77F00]" />
                            <span className="text-[11px] font-semibold">
                              {slot.label}
                            </span>
                          </>
                        )}
                      </button>
                      {preview && (
                        <button
                          type="button"
                          onClick={() =>
                            setUploadedPhotos((prev) => ({
                              ...prev,
                              [slot.id]: undefined,
                            }))
                          }
                          className="w-full text-[10px] text-zinc-400 hover:text-red-400 font-medium cursor-pointer"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                type="submit"
                disabled={
                  !uploadedPhotos.front &&
                  !uploadedPhotos.side &&
                  !uploadedPhotos.back
                }
                style={{ color: '#ffffff' }}
                className="w-full min-h-[46px] py-3 px-4 rounded-xl bg-[#F77F00] hover:bg-[#e57300] disabled:opacity-40 disabled:pointer-events-none text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Guardar avaliação</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
