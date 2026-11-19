import React, { useMemo, useState } from 'react';
import {
  Activity,
  Calendar,
  Camera,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Moon,
  Ruler,
  Scale,
  Utensils,
  X,
  Zap,
} from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { AssessmentSubmission } from '../../types';
import { useScrollToTop } from '../../utils/scrollToTop';

function parseTimestamp(assessment: AssessmentSubmission): number {
  if (assessment.isoDate) {
    const t = new Date(`${assessment.isoDate}T12:00:00`).getTime();
    if (!Number.isNaN(t)) return t;
  }
  return 0;
}

function getAssessmentYear(assessment: AssessmentSubmission): number {
  if (assessment.isoDate) {
    const year = Number(assessment.isoDate.slice(0, 4));
    if (Number.isFinite(year) && year > 1900) return year;
  }
  const match = assessment.date.match(/\b(20\d{2})\b/);
  return match ? Number(match[1]) : new Date().getFullYear();
}

function formatPtNumber(value: number, decimals = 1): string {
  return value.toLocaleString('pt-PT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function computeMonthsSpan(startTs: number, endTs: number): number {
  const start = new Date(startTs);
  const end = new Date(endTs);
  let months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  if (end.getDate() - start.getDate() >= 15) {
    months += 1;
  } else if (
    end.getDate() < start.getDate() &&
    months > 1 &&
    start.getDate() - end.getDate() >= 15
  ) {
    months -= 1;
  }
  return Math.max(0, months);
}

function formatTrackingSpan(firstTs: number, lastTs: number): string {
  if (!firstTs || !lastTs || lastTs <= firstTs) {
    return 'início recente';
  }
  const months = computeMonthsSpan(firstTs, lastTs);
  if (months >= 1) {
    return months === 1 ? 'ao longo de 1 mês' : `ao longo de ${months} meses`;
  }
  const days = Math.max(1, Math.round((lastTs - firstTs) / (1000 * 60 * 60 * 24)));
  return days === 1 ? 'ao longo de 1 dia' : `ao longo de ${days} dias`;
}

function formatRelativeElapsed(assessmentTs: number): string {
  if (!assessmentTs) return '';
  const now = new Date();
  const todayNoon = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    12,
    0,
    0
  ).getTime();

  const diffDays = Math.round((todayNoon - assessmentTs) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'Hoje';
  if (diffDays === 1) return 'há 1 dia';
  if (diffDays < 30) return `há ${diffDays} dias`;

  const months = computeMonthsSpan(assessmentTs, todayNoon);
  if (months <= 1) return 'há 1 mês';
  if (months < 24) return `há ${months} meses`;

  const years = Math.floor(months / 12);
  return years === 1 ? 'há 1 ano' : `há ${years} anos`;
}

function getAssessmentStatus(assessment: AssessmentSubmission): string {
  const photos = assessment.photos || {};
  const photoCount = [photos.front, photos.side, photos.back].filter(Boolean).length;
  const m = assessment.measurements;
  const hasMeasurements = Boolean(
    m && m.cintura > 0 && m.quadril > 0 && m.peito > 0 && m.braco > 0 && m.coxa > 0
  );

  if (photoCount === 3 && hasMeasurements && assessment.weight > 0) {
    return 'Avaliação completa';
  }
  if (photoCount > 0 && assessment.weight > 0) {
    return 'Avaliação parcial';
  }
  return 'Registo base';
}

const MEASUREMENT_ROWS: {
  key: keyof AssessmentSubmission['measurements'];
  label: string;
}[] = [
  { key: 'cintura', label: 'Cintura' },
  { key: 'quadril', label: 'Anca' },
  { key: 'peito', label: 'Peito' },
  { key: 'braco', label: 'Braço' },
  { key: 'coxa', label: 'Coxa' },
];

export function PhysicalListTab() {
  const { assessmentSubmissions } = useProfile();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<{
    src: string;
    label: string;
  } | null>(null);

  useScrollToTop([selectedId]);

  const sortedAssessments = useMemo(() => {
    return [...assessmentSubmissions].sort(
      (a, b) => parseTimestamp(b) - parseTimestamp(a)
    );
  }, [assessmentSubmissions]);

  const groupedByYear = useMemo(() => {
    const groups = new Map<number, AssessmentSubmission[]>();
    for (const item of sortedAssessments) {
      const year = getAssessmentYear(item);
      const existing = groups.get(year) || [];
      existing.push(item);
      groups.set(year, existing);
    }
    return Array.from(groups.entries()).sort((a, b) => b[0] - a[0]);
  }, [sortedAssessments]);

  const selectedIndex = selectedId
    ? sortedAssessments.findIndex((a) => a.id === selectedId)
    : -1;
  const selectedAssessment =
    selectedIndex >= 0 ? sortedAssessments[selectedIndex] : null;
  const previousToSelected =
    selectedIndex >= 0 && selectedIndex + 1 < sortedAssessments.length
      ? sortedAssessments[selectedIndex + 1]
      : null;

  // ============================================================================
  // PÁGINA DE DETALHES DA AVALIAÇÃO SELECIONADA
  // ============================================================================
  if (selectedAssessment) {
    const statusLabel = getAssessmentStatus(selectedAssessment);
    const relativeTime = formatRelativeElapsed(parseTimestamp(selectedAssessment));
    const weightDelta = previousToSelected
      ? Math.round((selectedAssessment.weight - previousToSelected.weight) * 10) / 10
      : null;

    const photoEntries = [
      { key: 'front', label: 'Frente', src: selectedAssessment.photos?.front },
      { key: 'side', label: 'Lado', src: selectedAssessment.photos?.side },
      { key: 'back', label: 'Costas', src: selectedAssessment.photos?.back },
    ];

    return (
      <div className="space-y-4 animate-in fade-in duration-200">
        {/* Navegação de regresso */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            className="min-h-[44px] flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors cursor-pointer group"
          >
            <ChevronLeft className="w-5 h-5 text-[#F77F00] group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-medium">Lista de avaliações</span>
          </button>

          {selectedIndex === 0 && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#F77F00]">
              RECENTE
            </span>
          )}
        </div>

        {/* Cabeçalho da Avaliação */}
        <div className="rounded-[22px] bg-[#0a0a0a] border border-zinc-800/80 p-4.5 relative overflow-hidden">
          <div
            className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#F77F00]/60 to-transparent"
            aria-hidden="true"
          />

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Calendar className="w-4 h-4 text-[#F77F00] shrink-0" />
                <span className="font-semibold text-white">
                  {selectedAssessment.date}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1.5">
                {statusLabel}
                {relativeTime ? ` · ${relativeTime}` : ''}
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">
                {selectedAssessment.trainer}
              </p>
            </div>

            <div className="text-right shrink-0">
              <div className="flex items-center justify-end gap-1.5 text-[11px] text-zinc-400">
                <Scale className="w-3.5 h-3.5 text-[#F77F00]" />
                <span>Peso</span>
              </div>
              <p className="text-2xl font-black text-white tabular-nums leading-tight mt-0.5">
                {formatPtNumber(selectedAssessment.weight)}
                <span className="text-xs font-semibold text-zinc-400 ml-1">kg</span>
              </p>
              {weightDelta !== null && Math.abs(weightDelta) >= 0.05 && (
                <span
                  className={`text-[11px] font-bold tabular-nums block mt-0.5 ${
                    weightDelta < 0 ? 'text-emerald-400' : 'text-[#F77F00]'
                  }`}
                >
                  {weightDelta > 0 ? '+' : '-'}
                  {formatPtNumber(Math.abs(weightDelta))} kg vs anterior
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Medidas Corporais */}
        <section className="space-y-2.5">
          <div className="flex items-center gap-2 px-0.5">
            <Ruler className="w-4 h-4 text-[#F77F00]" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Medidas corporais
            </h3>
          </div>

          <div className="rounded-[22px] bg-[#0a0a0a] border border-zinc-800/80 divide-y divide-zinc-800/70 overflow-hidden">
            {MEASUREMENT_ROWS.map((row) => {
              const value = selectedAssessment.measurements?.[row.key];
              const prevValue = previousToSelected?.measurements?.[row.key];
              const diff =
                value !== undefined && prevValue !== undefined
                  ? Math.round((value - prevValue) * 10) / 10
                  : null;

              return (
                <div
                  key={row.key}
                  className="px-4 py-3 flex items-center justify-between gap-3"
                >
                  <span className="text-xs font-semibold text-zinc-300">
                    {row.label}
                  </span>

                  <div className="flex items-center gap-3 tabular-nums">
                    {diff !== null && Math.abs(diff) >= 0.05 && (
                      <span
                        className={`text-[11px] font-semibold ${
                          diff < 0 ? 'text-emerald-400' : 'text-[#F77F00]'
                        }`}
                      >
                        {diff > 0 ? '+' : '-'}
                        {formatPtNumber(Math.abs(diff))} cm
                      </span>
                    )}
                    <span className="text-sm font-bold text-white min-w-[64px] text-right">
                      {value !== undefined ? `${formatPtNumber(value)} cm` : '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Fotografias da Avaliação */}
        <section className="space-y-2.5">
          <div className="flex items-center gap-2 px-0.5">
            <Camera className="w-4 h-4 text-[#F77F00]" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Fotografias
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {photoEntries.map((photo) => (
              <button
                key={photo.key}
                type="button"
                disabled={!photo.src}
                onClick={() => {
                  if (photo.src) {
                    setLightboxPhoto({ src: photo.src, label: photo.label });
                  }
                }}
                className={`relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800/80 ${
                  photo.src
                    ? 'cursor-pointer hover:border-[#F77F00]/60 transition-colors'
                    : 'cursor-default'
                }`}
              >
                {photo.src ? (
                  <img
                    src={photo.src}
                    alt={`${photo.label} — ${selectedAssessment.date}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 p-2">
                    <Camera className="w-5 h-5 text-zinc-600 mb-1" />
                    <span className="text-[10px]">Sem foto</span>
                  </div>
                )}

                <div
                  className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/85 via-black/40 to-transparent text-left"
                  aria-hidden="true"
                >
                  <span
                    style={{ color: '#ffffff' }}
                    className="text-[10px] font-semibold block"
                  >
                    {photo.label}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Registo / Questionário */}
        {selectedAssessment.questionnaire && (
          <section className="space-y-2.5">
            <div className="flex items-center gap-2 px-0.5">
              <Activity className="w-4 h-4 text-[#F77F00]" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Questionário e observações
              </h3>
            </div>

            <div className="rounded-[22px] bg-[#0a0a0a] border border-zinc-800/80 p-4 space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center divide-x divide-zinc-800/70">
                <div className="px-1">
                  <Zap className="w-3.5 h-3.5 text-[#F77F00] mx-auto mb-1" />
                  <span className="text-[10px] text-zinc-400 block">Energia</span>
                  <span className="text-xs font-bold text-white tabular-nums">
                    {selectedAssessment.questionnaire.energyLevel}/5
                  </span>
                </div>
                <div className="px-1">
                  <Utensils className="w-3.5 h-3.5 text-[#F77F00] mx-auto mb-1" />
                  <span className="text-[10px] text-zinc-400 block">Dieta</span>
                  <span className="text-xs font-bold text-white truncate block">
                    {selectedAssessment.questionnaire.dietCompliance}
                  </span>
                </div>
                <div className="px-1">
                  <Moon className="w-3.5 h-3.5 text-[#F77F00] mx-auto mb-1" />
                  <span className="text-[10px] text-zinc-400 block">Sono</span>
                  <span className="text-xs font-bold text-white truncate block">
                    {selectedAssessment.questionnaire.sleepRest}
                  </span>
                </div>
              </div>

              {selectedAssessment.questionnaire.notes && (
                <div className="pt-3 border-t border-zinc-800/70">
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {selectedAssessment.questionnaire.notes}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Lightbox simples para fotografia */}
        {lightboxPhoto && (
          <div
            onClick={() => setLightboxPhoto(null)}
            className="fixed inset-0 z-[220] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-5 animate-in fade-in duration-150"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[380px] space-y-3"
            >
              <div className="flex items-center justify-between">
                <span
                  style={{ color: '#ffffff' }}
                  className="text-sm font-bold"
                >
                  {lightboxPhoto.label} · {selectedAssessment.date}
                </span>
                <button
                  type="button"
                  onClick={() => setLightboxPhoto(null)}
                  aria-label="Fechar"
                  style={{ color: '#ffffff' }}
                  className="p-1.5 hover:opacity-80 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950">
                <img
                  src={lightboxPhoto.src}
                  alt={lightboxPhoto.label}
                  className="w-full max-h-[75vh] object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================================
  // VISTA PRINCIPAL DA TAB LISTA
  // ============================================================================
  const totalCount = sortedAssessments.length;
  const newestAssessment = sortedAssessments[0];
  const oldestAssessment = sortedAssessments[totalCount - 1];
  const trackingSpan =
    oldestAssessment && newestAssessment
      ? formatTrackingSpan(
          parseTimestamp(oldestAssessment),
          parseTimestamp(newestAssessment)
        )
      : 'sem registos';

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. RESUMO DAS AVALIAÇÕES */}
      <section className="rounded-[22px] bg-[#0a0a0a] border border-zinc-800/80 p-4.5 relative overflow-hidden">
        <div
          className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#F77F00]/60 to-transparent"
          aria-hidden="true"
        />

        <span className="text-[11px] font-bold uppercase tracking-wider text-[#F77F00] block mb-2">
          Avaliações realizadas
        </span>

        {totalCount === 0 ? (
          <p className="text-sm text-zinc-400">
            Ainda não existem avaliações físicas registadas.
          </p>
        ) : (
          <>
            <p className="text-lg font-bold text-white tracking-tight leading-snug">
              {totalCount === 1
                ? '1 avaliação realizada'
                : `${totalCount} avaliações realizadas`}{' '}
              <span className="text-zinc-300 font-medium">{trackingSpan}</span>
            </p>

            {newestAssessment && (
              <p className="text-xs text-zinc-400 mt-2">
                Última avaliação:{' '}
                <span className="text-zinc-200 font-semibold">
                  {newestAssessment.date}
                </span>
              </p>
            )}
          </>
        )}
      </section>

      {/* 2. HISTÓRICO DE AVALIAÇÕES AGRUPADO POR ANO */}
      {totalCount === 0 ? (
        <div className="rounded-[22px] bg-[#0a0a0a] border border-zinc-800/80 p-8 text-center">
          <ClipboardList className="w-7 h-7 text-zinc-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-white">
            Sem histórico disponível
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByYear.map(([year, items]) => (
            <section key={year} className="space-y-2">
              <div className="flex items-baseline justify-between px-1">
                <h3 className="text-sm font-bold text-white tabular-nums">
                  {year}
                </h3>
                <span className="text-[11px] font-medium text-zinc-400 tabular-nums">
                  {items.length === 1
                    ? '1 avaliação'
                    : `${items.length} avaliações`}
                </span>
              </div>

              <div className="rounded-[22px] bg-[#0a0a0a] border border-zinc-800/80 divide-y divide-zinc-800/70 overflow-hidden">
                {items.map((item) => {
                  const isMostRecent = item.id === newestAssessment?.id;
                  const statusText = getAssessmentStatus(item);
                  const elapsedText = formatRelativeElapsed(parseTimestamp(item));

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className="w-full min-h-[64px] px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-zinc-900/50 transition-colors text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <Calendar
                          className={`w-[18px] h-[18px] shrink-0 ${
                            isMostRecent ? 'text-[#F77F00]' : 'text-zinc-400'
                          }`}
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-white leading-tight">
                              {item.date}
                            </span>
                            {isMostRecent && (
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#F77F00]">
                                RECENTE
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-1 flex-wrap">
                            <span>{statusText}</span>
                            {elapsedText && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-zinc-500">{elapsedText}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-[#F77F00] group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
