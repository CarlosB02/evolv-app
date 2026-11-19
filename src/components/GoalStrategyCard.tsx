import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  ChevronRight,
  Flag,
  Play,
  Trophy,
} from 'lucide-react';
import { GoalStrategyData } from '../types';

interface GoalStrategyCardProps {
  data?: GoalStrategyData | null;
}

const MONTHS_LONG_PT = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

const MONTHS_SHORT_PT = [
  'jan',
  'fev',
  'mar',
  'abr',
  'mai',
  'jun',
  'jul',
  'ago',
  'set',
  'out',
  'nov',
  'dez',
];

function getTodayLisbonYMD(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Lisbon',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function normalizeYMD(input?: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const check = new Date(Date.UTC(y, m - 1, d));
  if (
    check.getUTCFullYear() !== y ||
    check.getUTCMonth() !== m - 1 ||
    check.getUTCDate() !== d
  ) {
    return null;
  }
  return `${match[1]}-${match[2]}-${match[3]}`;
}

function toUTCMs(ymd: string): number {
  const [y, m, d] = ymd.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

function diffCalendarDays(targetYMD: string, baseYMD: string): number {
  return Math.round((toUTCMs(targetYMD) - toUTCMs(baseYMD)) / 86400000);
}

function formatLongPtDate(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number);
  return `${d} de ${MONTHS_LONG_PT[m - 1]} de ${y}`;
}

function formatShortPtDate(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number);
  return `${d} ${MONTHS_SHORT_PT[m - 1]} ${y}`;
}

type CountdownModel =
  | { kind: 'today' }
  | { kind: 'daysOnly'; days: number }
  | { kind: 'weeksOnly'; weeks: number }
  | { kind: 'weeksAndDays'; weeks: number; days: number };

function buildCountdown(daysRemaining: number): CountdownModel {
  if (daysRemaining <= 0) return { kind: 'today' };
  if (daysRemaining < 7) return { kind: 'daysOnly', days: daysRemaining };
  if (daysRemaining % 7 === 0) return { kind: 'weeksOnly', weeks: daysRemaining / 7 };
  return {
    kind: 'weeksAndDays',
    weeks: Math.floor(daysRemaining / 7),
    days: daysRemaining % 7,
  };
}

export function GoalStrategyCard({ data }: GoalStrategyCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const todayYMD = getTodayLisbonYMD();

  // 1. Evaluate Objective validity
  const objectiveTitle = data?.objective?.title?.trim() || '';
  const objectiveEndYMD = normalizeYMD(data?.objective?.endDate);
  const showObjective =
    Boolean(objectiveTitle) && (!objectiveEndYMD || objectiveEndYMD >= todayYMD);

  // 2. Evaluate Strategy validity
  const strategyName = data?.strategy?.name?.trim() || '';
  const strategyDescription = data?.strategy?.description?.trim() || '';
  const rawStartYMD = normalizeYMD(data?.strategy?.startDate);
  const rawEndYMD = normalizeYMD(data?.strategy?.endDate);
  const hasStrategyDates = Boolean(
    rawStartYMD && rawEndYMD && rawEndYMD >= rawStartYMD
  );
  const showStrategy =
    Boolean(strategyName) &&
    (!hasStrategyDates || (todayYMD >= rawStartYMD! && todayYMD <= rawEndYMD!));

  // If neither Objective nor Strategy is valid, render nothing
  if (!showObjective && !showStrategy) {
    return null;
  }

  // Objective countdown calculation (only if endDate exists)
  const countdown =
    showObjective && objectiveEndYMD
      ? buildCountdown(diffCalendarDays(objectiveEndYMD, todayYMD))
      : null;

  // Strategy progress calculation (only if both startDate and endDate exist)
  const strategyProgress =
    showStrategy && hasStrategyDates
      ? (() => {
          const totalDays = diffCalendarDays(rawEndYMD!, rawStartYMD!) + 1;
          const totalWeeks = Math.max(1, Math.ceil(totalDays / 7));
          const daysSinceStart = Math.max(0, diffCalendarDays(todayYMD, rawStartYMD!));
          const currentWeek = Math.min(
            totalWeeks,
            Math.floor(daysSinceStart / 7) + 1
          );
          const percentage = Math.round((currentWeek / totalWeeks) * 100);
          const direction =
            data?.strategy?.weekDirection === 'down' ? 'down' : 'up';

          let homeLabel = `Semana ${currentWeek} de ${totalWeeks} desta fase`;
          if (direction === 'down') {
            const remainingWeeks = totalWeeks - currentWeek;
            if (currentWeek >= totalWeeks) {
              homeLabel = 'Última semana desta fase';
            } else if (remainingWeeks === 1) {
              homeLabel = 'Falta 1 semana desta fase';
            } else {
              homeLabel = `Faltam ${remainingWeeks} semanas desta fase`;
            }
          }

          return {
            totalWeeks,
            currentWeek,
            percentage,
            homeLabel,
            startLabel: formatShortPtDate(rawStartYMD!),
            endLabel: formatShortPtDate(rawEndYMD!),
          };
        })()
      : null;

  // Clickable & chevron only if there is detail beyond the title
  const hasDetails = Boolean(
    (showObjective && objectiveEndYMD) ||
      (showStrategy && (strategyDescription || hasStrategyDates))
  );

  return (
    <>
      <section className="px-5 py-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
        <div
          role={hasDetails ? 'button' : undefined}
          tabIndex={hasDetails ? 0 : undefined}
          onClick={() => {
            if (hasDetails) setIsDetailsOpen(true);
          }}
          onKeyDown={(e) => {
            if (hasDetails && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              setIsDetailsOpen(true);
            }
          }}
          className={`relative overflow-hidden rounded-[22px] bg-[#0a0a0c] border border-[#F77F00]/65 shadow-[0_0_24px_rgba(247,127,0,0.14)] p-4 transition-all ${
            hasDetails
              ? 'cursor-pointer hover:border-[#F77F00] active:scale-[0.99]'
              : ''
          }`}
        >
          {/* Top glow line */}
          <div className="pointer-events-none absolute top-0 inset-x-6 h-[1px] bg-gradient-to-r from-transparent via-[#F77F00] to-transparent opacity-90" />

          {/* Subtle decorative wave in bottom-right corner */}
          <svg
            aria-hidden="true"
            viewBox="0 0 180 90"
            className="pointer-events-none absolute -bottom-2 -right-2 w-44 h-24 opacity-[0.12]"
          >
            <path
              d="M10 85 C 50 78, 70 40, 115 42 C 145 43, 162 22, 180 8 L 180 90 Z"
              fill="#F77F00"
            />
            <path
              d="M35 88 C 75 72, 95 54, 138 56 C 160 57, 170 42, 180 30"
              fill="none"
              stroke="#F77F00"
              strokeWidth="1.5"
            />
          </svg>

          <div className="relative z-10 flex flex-col">
            {/* LINHA 1: OBJETIVO */}
            {showObjective && (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
                    Objetivo
                  </p>
                  <h3 className="text-[21px] font-bold text-white leading-tight mt-0.5 break-words">
                    {objectiveTitle}
                  </h3>
                  {objectiveEndYMD && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-zinc-300 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{formatLongPtDate(objectiveEndYMD)}</span>
                    </div>
                  )}
                </div>

                {/* Caixa FALTAM / TERMINA Hoje (apenas com data de fim) */}
                {countdown && (
                  <div className="border-l border-[#F77F00]/25 pl-3.5 shrink-0 flex flex-col items-center text-center">
                    <span className="text-[9px] font-bold text-[#F77F00] uppercase tracking-[0.18em] mb-1">
                      {countdown.kind === 'today' ? 'Termina' : 'Faltam'}
                    </span>

                    {countdown.kind === 'today' && (
                      <span className="text-base font-extrabold text-white leading-tight">
                        Hoje
                      </span>
                    )}

                    {countdown.kind === 'daysOnly' && (
                      <div className="flex flex-col items-center">
                        <span className="text-xl font-extrabold text-white leading-none tabular-nums">
                          {countdown.days}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-medium mt-0.5">
                          {countdown.days === 1 ? 'dia' : 'dias'}
                        </span>
                      </div>
                    )}

                    {countdown.kind === 'weeksOnly' && (
                      <div className="flex flex-col items-center">
                        <span className="text-xl font-extrabold text-white leading-none tabular-nums">
                          {countdown.weeks}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-medium mt-0.5">
                          {countdown.weeks === 1 ? 'semana' : 'semanas'}
                        </span>
                      </div>
                    )}

                    {countdown.kind === 'weeksAndDays' && (
                      <div className="flex items-center gap-2.5">
                        <div className="flex flex-col items-center">
                          <span className="text-xl font-extrabold text-white leading-none tabular-nums">
                            {countdown.weeks}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-medium mt-0.5">
                            {countdown.weeks === 1 ? 'semana' : 'semanas'}
                          </span>
                        </div>
                        <div className="w-[1px] h-7 bg-zinc-800" />
                        <div className="flex flex-col items-center">
                          <span className="text-xl font-extrabold text-white leading-none tabular-nums">
                            {countdown.days}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-medium mt-0.5">
                            {countdown.days === 1 ? 'dia' : 'dias'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Chevron à direita caso não exista estratégia e haja detalhes */}
                {!showStrategy && hasDetails && (
                  <ChevronRight className="w-5 h-5 text-[#F77F00] shrink-0" />
                )}
              </div>
            )}

            {/* Linha divisória fina entre Objetivo e Estratégia */}
            {showObjective && showStrategy && (
              <div className="my-3 border-t border-zinc-800/80" />
            )}

            {/* LINHA 2: ESTRATÉGIA ATUAL */}
            {showStrategy && (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-[#F77F00] uppercase tracking-[0.2em]">
                    Estratégia Atual
                  </p>
                  <p className="text-[15px] font-bold text-white leading-snug mt-0.5 truncate">
                    {strategyName}
                  </p>
                </div>

                {hasDetails && (
                  <ChevronRight className="w-5 h-5 text-[#F77F00] shrink-0" />
                )}
              </div>
            )}

            {/* LINHA 3: PROGRESSO DA ESTRATÉGIA (só com início e fim) */}
            {strategyProgress && (
              <>
                <div className="my-3 border-t border-zinc-800/80" />
                <div className="flex items-center gap-2.5">
                  <span className="text-[11px] font-medium text-zinc-300 shrink-0">
                    {strategyProgress.homeLabel}
                  </span>
                  <div className="flex-1 min-w-[44px] h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#F77F00] rounded-full transition-all duration-300"
                      style={{ width: `${strategyProgress.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-[#F77F00] shrink-0 tabular-nums">
                    {strategyProgress.percentage}%
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* BOTTOM SHEET DE DETALHES */}
      {isDetailsOpen && hasDetails && (
        <div
          className="fixed inset-0 z-[260] flex items-end justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsDetailsOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Detalhes do objetivo e estratégia"
            className="w-full max-w-[414px] max-h-[92dvh] bg-[#0a0a0c] border-t border-x border-zinc-800 rounded-t-[28px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
          >
            {/* Top drag handle */}
            <div className="pt-3 pb-1 flex justify-center shrink-0">
              <div className="w-10 h-1 rounded-full bg-zinc-700/80" />
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-5 pt-3 pb-4 space-y-5">
              {/* Secção Objetivo */}
              {showObjective && (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-[#F77F00]/12 border border-[#F77F00]/30 flex items-center justify-center text-[#F77F00] shrink-0 mt-0.5">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
                        Objetivo
                      </p>
                      <h3 className="text-lg font-bold text-white leading-snug mt-0.5 break-words">
                        {objectiveTitle}
                      </h3>
                      {objectiveEndYMD && (
                        <p className="text-xs text-zinc-300 mt-1 font-medium">
                          {formatLongPtDate(objectiveEndYMD)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Caixa FALTAM no detalhe */}
                  {countdown && (
                    <div className="rounded-2xl border border-[#F77F00]/65 bg-[#150c04] shadow-[0_0_18px_rgba(247,127,0,0.2)] px-3 py-2.5 shrink-0 flex flex-col items-center text-center">
                      <span className="text-[9px] font-bold text-[#F77F00] uppercase tracking-[0.18em] mb-1">
                        {countdown.kind === 'today' ? 'Termina' : 'Faltam'}
                      </span>

                      {countdown.kind === 'today' && (
                        <span className="text-sm font-extrabold text-white leading-tight">
                          Hoje
                        </span>
                      )}

                      {countdown.kind === 'daysOnly' && (
                        <div className="flex flex-col items-center">
                          <span className="text-xl font-extrabold text-white leading-none tabular-nums">
                            {countdown.days}
                          </span>
                          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mt-1">
                            {countdown.days === 1 ? 'DIA' : 'DIAS'}
                          </span>
                        </div>
                      )}

                      {countdown.kind === 'weeksOnly' && (
                        <div className="flex flex-col items-center">
                          <span className="text-xl font-extrabold text-white leading-none tabular-nums">
                            {countdown.weeks}
                          </span>
                          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mt-1">
                            {countdown.weeks === 1 ? 'SEMANA' : 'SEMANAS'}
                          </span>
                        </div>
                      )}

                      {countdown.kind === 'weeksAndDays' && (
                        <div className="flex items-center gap-2.5">
                          <div className="flex flex-col items-center">
                            <span className="text-xl font-extrabold text-white leading-none tabular-nums">
                              {countdown.weeks}
                            </span>
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mt-1">
                              {countdown.weeks === 1 ? 'SEMANA' : 'SEMANAS'}
                            </span>
                          </div>
                          <div className="w-[1px] h-7 bg-[#F77F00]/25" />
                          <div className="flex flex-col items-center">
                            <span className="text-xl font-extrabold text-white leading-none tabular-nums">
                              {countdown.days}
                            </span>
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider mt-1">
                              {countdown.days === 1 ? 'DIA' : 'DIAS'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Linha divisória */}
              {showObjective && showStrategy && (
                <div className="border-t border-zinc-800/80" />
              )}

              {/* Secção Estratégia */}
              {showStrategy && (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F77F00]/12 border border-[#F77F00]/30 flex items-center justify-center text-[#F77F00] shrink-0 mt-0.5">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-[#F77F00] uppercase tracking-[0.2em]">
                        Estratégia Atual
                      </p>
                      <h4 className="text-base font-bold text-white leading-snug mt-0.5">
                        {strategyName}
                      </h4>
                      {strategyDescription && (
                        <p className="text-xs text-zinc-300 leading-relaxed mt-2">
                          {strategyDescription}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Faixa com 3 colunas (só com datas da estratégia) */}
                  {strategyProgress && (
                    <>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="rounded-2xl bg-[#121215] border border-zinc-800/90 p-3 flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-400">
                            <Play className="w-3 h-3 text-[#F77F00] fill-[#F77F00]" />
                            <span>Início</span>
                          </div>
                          <span className="text-xs font-bold text-white">
                            {strategyProgress.startLabel}
                          </span>
                        </div>

                        <div className="rounded-2xl bg-[#121215] border border-zinc-800/90 p-3 flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-400">
                            <Flag className="w-3 h-3 text-[#F77F00]" />
                            <span>Fim</span>
                          </div>
                          <span className="text-xs font-bold text-white">
                            {strategyProgress.endLabel}
                          </span>
                        </div>

                        <div className="rounded-2xl bg-[#121215] border border-zinc-800/90 p-3 flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-zinc-400">
                            <Calendar className="w-3 h-3 text-[#F77F00]" />
                            <span>Duração</span>
                          </div>
                          <span className="text-xs font-bold text-white">
                            {strategyProgress.totalWeeks}{' '}
                            {strategyProgress.totalWeeks === 1 ? 'semana' : 'semanas'}
                          </span>
                        </div>
                      </div>

                      {/* Progresso da fase */}
                      <div className="rounded-2xl bg-[#121215] border border-zinc-800/90 p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-zinc-300">
                            Progresso da fase
                          </span>
                          <span className="font-bold text-white">
                            Semana {strategyProgress.currentWeek} de{' '}
                            {strategyProgress.totalWeeks}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#F77F00] rounded-full transition-all duration-300"
                              style={{ width: `${strategyProgress.percentage}%` }}
                            />
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full border border-[#F77F00]/70 bg-[#F77F00]/10 text-[#F77F00] text-xs font-bold tabular-nums shrink-0">
                            {strategyProgress.percentage}%
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Footer sticky button (sempre visível e texto branco obrigatório) */}
            <div className="px-5 pt-2 pb-5 bg-[#0a0a0c] border-t border-zinc-900 shrink-0">
              <button
                type="button"
                onClick={() => setIsDetailsOpen(false)}
                className="w-full py-3.5 rounded-2xl bg-[#F77F00] hover:bg-orange-600 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
