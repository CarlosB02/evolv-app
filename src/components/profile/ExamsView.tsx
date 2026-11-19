import React, { useMemo, useState } from 'react';
import {
  Activity,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Droplets,
  FlaskConical,
  Gauge,
  HeartPulse,
  History,
  Info,
  Sun,
  Waves,
} from 'lucide-react';
import {
  EXAM_ANALYSIS_DATES,
  EXAM_CATEGORIES,
  ExamAnalysisDate,
  ExamCategoryDefinition,
  ExamCategoryId,
  ExamParameterDefinition,
  evaluateExamStatus,
  formatLabNumber,
  getPreviousAnalysisDate,
} from '../../data/examsData';
import { useScrollToTop } from '../../utils/scrollToTop';

interface ExamsViewProps {
  onBack: () => void;
}

type ActiveSubView =
  | { kind: 'main' }
  | { kind: 'detail'; categoryId: ExamCategoryId | 'all' }
  | { kind: 'history' };

type SortOption = 'recent' | 'oldest' | 'alpha' | 'altered';

const CATEGORY_ICON_MAP: Record<
  ExamCategoryId,
  { Icon: React.ComponentType<{ className?: string }>; colorClass: string }
> = {
  'hemograma-lh-fsh': { Icon: Droplets, colorClass: 'text-rose-400' },
  'perfil-glicidico': { Icon: Gauge, colorClass: 'text-amber-400' },
  'perfil-lipidico': { Icon: HeartPulse, colorClass: 'text-[#F77F00]' },
  'funcao-hepatica': { Icon: FlaskConical, colorClass: 'text-emerald-400' },
  'funcao-renal': { Icon: Waves, colorClass: 'text-sky-400' },
  'vitaminas-minerais': { Icon: Sun, colorClass: 'text-yellow-400' },
  'funcao-tiroideia': { Icon: Activity, colorClass: 'text-violet-400' },
};


function StatusLegend() {
  return (
    <div className="rounded-2xl bg-[#0a0a0a] border border-zinc-800/80 px-4 py-3">
      <p className="text-[11px] font-semibold text-zinc-400 mb-2">
        Indicadores de referência
      </p>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" aria-hidden="true" />
          <span className="text-xs font-medium text-zinc-200 whitespace-nowrap">
            Abaixo
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F77F00] shrink-0" aria-hidden="true" />
          <span className="text-xs font-medium text-zinc-200 whitespace-nowrap">
            No intervalo
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" aria-hidden="true" />
          <span className="text-xs font-medium text-zinc-200 whitespace-nowrap">
            Acima
          </span>
        </div>
      </div>
    </div>
  );
}

function ReferenceNote() {
  return (
    <div className="rounded-2xl bg-[#0a0a0a] border border-zinc-800/70 p-4 flex items-start gap-3">
      <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
      <p className="text-[11px] text-zinc-400 leading-relaxed">
        Os valores de referência podem variar conforme o laboratório e a metodologia utilizada. Em caso de dúvida sobre qualquer resultado, consulta sempre o teu profissional de saúde.
      </p>
    </div>
  );
}

interface ComparisonTableProps {
  category: ExamCategoryDefinition;
  currentDate: ExamAnalysisDate;
  previousDate: ExamAnalysisDate | null;
}

function CategoryComparisonTable({
  category,
  currentDate,
  previousDate,
}: ComparisonTableProps) {
  // Group parameters by subcategory preserving order
  const groups = useMemo(() => {
    const map = new Map<string, ExamParameterDefinition[]>();
    for (const param of category.parameters) {
      const key = param.subcategory || 'Parâmetros';
      const list = map.get(key) || [];
      list.push(param);
      map.set(key, list);
    }
    return Array.from(map.entries());
  }, [category]);

  return (
    <div className="space-y-4">
      {groups.map(([subcategoryName, params]) => (
        <div
          key={subcategoryName}
          className="rounded-2xl bg-[#0a0a0a] border border-zinc-800/80 overflow-hidden"
        >
          <div className="px-4 py-2.5 border-b border-zinc-800/80 bg-zinc-900/70">
            <h4 className="text-xs font-bold text-white tracking-tight">
              {subcategoryName}
            </h4>
          </div>

          <div className="overflow-x-auto exam-table-scroll">
            <table className="w-full min-w-[540px] border-collapse text-left">
              <thead>
                <tr className="border-b border-zinc-800/80 text-[10px] font-semibold text-zinc-400">
                  <th
                    scope="col"
                    className="sticky left-0 z-10 bg-[#0a0a0a] py-2.5 pl-4 pr-3 w-[165px] min-w-[165px] border-r border-zinc-800/60 align-bottom"
                  >
                    Exame
                  </th>
                  <th scope="col" className="py-2.5 px-3 min-w-[130px] align-bottom whitespace-nowrap">
                    Valor de referência
                  </th>
                  <th scope="col" className="py-2.5 px-3 min-w-[115px] align-bottom whitespace-nowrap">
                    <span className="block">Valor anterior</span>
                    <span className="text-[9px] font-normal text-zinc-500 block mt-0.5 tabular-nums">
                      {previousDate ? previousDate.shortDate : 'Sem registo'}
                    </span>
                  </th>
                  <th scope="col" className="py-2.5 pl-3 pr-4 min-w-[125px] align-bottom whitespace-nowrap">
                    <span className="block">Novo valor</span>
                    <span className="text-[9px] font-normal text-zinc-500 block mt-0.5 tabular-nums">
                      {currentDate.shortDate}
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {params.map((param) => {
                  const newVal = param.valuesByDate[currentDate.id];
                  const prevVal = previousDate
                    ? param.valuesByDate[previousDate.id]
                    : undefined;
                  const status = evaluateExamStatus(
                    newVal,
                    param.refMin,
                    param.refMax
                  );

                  const valueColorClass =
                    status === 'below'
                      ? 'text-sky-400'
                      : status === 'above'
                        ? 'text-red-400'
                        : 'text-white';

                  const dotColorClass =
                    status === 'below'
                      ? 'bg-sky-500'
                      : status === 'above'
                        ? 'bg-red-500'
                        : 'bg-[#F77F00]';

                  const statusLabel =
                    status === 'below'
                      ? 'Abaixo do intervalo de referência'
                      : status === 'above'
                        ? 'Acima do intervalo de referência'
                        : 'Dentro do intervalo de referência';

                  return (
                    <tr key={param.id} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="sticky left-0 z-10 bg-[#0a0a0a] py-3 pl-4 pr-3 w-[165px] min-w-[165px] border-r border-zinc-800/60 align-middle">
                        <span className="text-xs font-semibold text-white leading-snug">
                          {param.name}
                          <span className="text-[11px] font-normal text-zinc-400 ml-1.5 whitespace-nowrap">
                            {param.unit}
                          </span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs text-zinc-300 tabular-nums align-middle whitespace-nowrap">
                        <span className="font-medium">{param.referenceText}</span>
                        <span className="text-[11px] text-zinc-400 ml-1">
                          {param.unit}
                        </span>
                      </td>
                      <td className="py-3 px-3 tabular-nums align-middle whitespace-nowrap">
                        {prevVal !== undefined ? (
                          <span className="text-xs font-medium text-zinc-300">
                            {formatLabNumber(prevVal)}
                            <span className="text-[11px] font-normal text-zinc-400 ml-1">
                              {param.unit}
                            </span>
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-500">—</span>
                        )}
                      </td>
                      <td className="py-3 pl-3 pr-4 tabular-nums align-middle whitespace-nowrap">
                        {newVal !== undefined ? (
                          <div className="inline-flex items-center gap-2">
                            <span
                              className={`w-2.5 h-2.5 rounded-full shrink-0 ${dotColorClass}`}
                              title={statusLabel}
                              aria-label={statusLabel}
                            />
                            <span className={`text-xs font-bold ${valueColorClass}`}>
                              {formatLabNumber(newVal)}
                              <span className="text-[11px] font-normal text-zinc-400 ml-1">
                                {param.unit}
                              </span>
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-500">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ExamsView({ onBack }: ExamsViewProps) {
  const latestAnalysis = EXAM_ANALYSIS_DATES[0];
  const [selectedDateId, setSelectedDateId] = useState<string>(latestAnalysis.id);
  const [activeView, setActiveView] = useState<ActiveSubView>({ kind: 'main' });

  // Main list filters
  const [categoryFilter, setCategoryFilter] = useState<ExamCategoryId | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  // Full panel active category tab when clicking "Ver detalhes" on "Último exame"
  const [allViewTab, setAllViewTab] = useState<ExamCategoryId>('hemograma-lh-fsh');

  useScrollToTop([
    activeView.kind,
    activeView.kind === 'detail' ? activeView.categoryId : null,
    allViewTab,
  ]);

  // History view comparison state
  const [historyNewDateId, setHistoryNewDateId] = useState<string>(EXAM_ANALYSIS_DATES[0].id);
  const [historyOldDateId, setHistoryOldDateId] = useState<string>(EXAM_ANALYSIS_DATES[1].id);
  const [historyCategoryId, setHistoryCategoryId] = useState<ExamCategoryId | 'all'>('all');

  const selectedAnalysis = useMemo(
    () => EXAM_ANALYSIS_DATES.find((d) => d.id === selectedDateId) || latestAnalysis,
    [selectedDateId, latestAnalysis]
  );

  const previousForSelected = useMemo(
    () => getPreviousAnalysisDate(selectedAnalysis.id),
    [selectedAnalysis.id]
  );

  // Compute summary stats for a category on a given analysis date
  const getCategoryStats = (cat: ExamCategoryDefinition, dateId: string) => {
    let belowCount = 0;
    let aboveCount = 0;
    let normalCount = 0;
    for (const p of cat.parameters) {
      const status = evaluateExamStatus(p.valuesByDate[dateId], p.refMin, p.refMax);
      if (status === 'below') belowCount += 1;
      else if (status === 'above') aboveCount += 1;
      else normalCount += 1;
    }
    return {
      total: cat.parameters.length,
      belowCount,
      aboveCount,
      normalCount,
      alteredCount: belowCount + aboveCount,
    };
  };

  const filteredAndSortedCategories = useMemo(() => {
    const base =
      categoryFilter === 'all'
        ? [...EXAM_CATEGORIES]
        : EXAM_CATEGORIES.filter((c) => c.id === categoryFilter);

    if (sortBy === 'oldest') {
      return base.sort((a, b) => b.orderIndex - a.orderIndex);
    }
    if (sortBy === 'alpha') {
      return base.sort((a, b) => a.name.localeCompare(b.name, 'pt-PT'));
    }
    if (sortBy === 'altered') {
      return base.sort((a, b) => {
        const diff =
          getCategoryStats(b, selectedAnalysis.id).alteredCount -
          getCategoryStats(a, selectedAnalysis.id).alteredCount;
        return diff !== 0 ? diff : a.orderIndex - b.orderIndex;
      });
    }
    return base.sort((a, b) => a.orderIndex - b.orderIndex);
  }, [categoryFilter, sortBy, selectedAnalysis.id]);

  // ============================================================================
  // VIEW: DETAIL PAGE (Single Category or All Categories from "Último exame")
  // ============================================================================
  if (activeView.kind === 'detail') {
    const isAllMode = activeView.categoryId === 'all';
    const detailDate = isAllMode ? latestAnalysis : selectedAnalysis;
    const detailPreviousDate = getPreviousAnalysisDate(detailDate.id);
    const activeCategory =
      EXAM_CATEGORIES.find((c) =>
        isAllMode ? c.id === allViewTab : c.id === activeView.categoryId
      ) || EXAM_CATEGORIES[0];

    return (
      <div className="flex flex-col px-5 pt-4 pb-12 gap-4 animate-in fade-in duration-200">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setActiveView({ kind: 'main' })}
            className="min-h-[44px] flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors cursor-pointer group"
          >
            <ChevronLeft className="w-5 h-5 text-[#F77F00] group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-medium">Exames</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView({ kind: 'history' })}
            className="min-h-[40px] px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-[#F77F00]/60 text-zinc-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <History className="w-3.5 h-3.5 text-[#F77F00]" />
            <span>Ver histórico</span>
          </button>
        </div>

        {/* Category Title & Date Context */}
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {isAllMode ? 'Último exame completo' : activeCategory.name}
          </h2>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-zinc-400 mt-1">
            <span>{detailDate.longDate}</span>
            <span aria-hidden="true">·</span>
            <span>{detailDate.labName}</span>
          </div>
        </div>

        {/* Date Selector inside Detail (when viewing a specific category) */}
        {!isAllMode && (
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {EXAM_ANALYSIS_DATES.map((dateItem) => {
              const isSelected = dateItem.id === selectedDateId;
              return (
                <button
                  key={dateItem.id}
                  type="button"
                  onClick={() => setSelectedDateId(dateItem.id)}
                  className={`min-h-[40px] px-3.5 py-2 rounded-xl border text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#F77F00] border-[#F77F00] text-white shadow-md shadow-orange-500/20'
                      : 'bg-[#0a0a0a] border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  {dateItem.shortDate}
                </button>
              );
            })}
          </div>
        )}

        {/* Category Switcher when opened from "Último exame" -> "Ver detalhes" */}
        {isAllMode && (
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
            {EXAM_CATEGORIES.map((cat) => {
              const isSelected = cat.id === allViewTab;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setAllViewTab(cat.id)}
                  className={`min-h-[40px] px-3.5 py-2 rounded-xl border text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#F77F00] border-[#F77F00] text-white shadow-md shadow-orange-500/20'
                      : 'bg-[#0a0a0a] border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Indicators Legend */}
        <StatusLegend />

        {/* Organized Parameters Table grouped by Subcategory */}
        <CategoryComparisonTable
          category={activeCategory}
          currentDate={detailDate}
          previousDate={detailPreviousDate}
        />

        <ReferenceNote />
      </div>
    );
  }

  // ============================================================================
  // VIEW: HISTORY & SIDE-BY-SIDE COMPARISON ("Ver histórico")
  // ============================================================================
  if (activeView.kind === 'history') {
    const newDateObj =
      EXAM_ANALYSIS_DATES.find((d) => d.id === historyNewDateId) || EXAM_ANALYSIS_DATES[0];
    const oldDateObj =
      EXAM_ANALYSIS_DATES.find((d) => d.id === historyOldDateId) || EXAM_ANALYSIS_DATES[1];

    const categoriesToRender =
      historyCategoryId === 'all'
        ? EXAM_CATEGORIES
        : EXAM_CATEGORIES.filter((c) => c.id === historyCategoryId);

    return (
      <div className="flex flex-col px-5 pt-4 pb-12 gap-4 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActiveView({ kind: 'main' })}
            className="min-h-[44px] flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors cursor-pointer group"
          >
            <ChevronLeft className="w-5 h-5 text-[#F77F00] group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-medium">Voltar a Exames</span>
          </button>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Histórico de Exames
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Compara resultados de análises anteriores lado a lado ou seleciona uma data para consultar.
          </p>
        </div>

        {/* Chronological list of lab sessions */}
        <div className="rounded-2xl bg-[#0a0a0a] border border-zinc-800/80 divide-y divide-zinc-800/60 overflow-hidden">
          {EXAM_ANALYSIS_DATES.map((dateItem, idx) => {
            const isSelectedMain = dateItem.id === selectedDateId;
            return (
              <button
                key={dateItem.id}
                type="button"
                onClick={() => {
                  setSelectedDateId(dateItem.id);
                  setActiveView({ kind: 'main' });
                }}
                className="w-full min-h-[56px] px-4 py-3 flex items-center justify-between gap-3 hover:bg-zinc-900/50 transition-colors text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      idx === 0
                        ? 'bg-[#F77F00]/15 border-[#F77F00]/40 text-[#F77F00]'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">
                      {dateItem.longDate}
                    </p>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                      {dateItem.labName} · {dateItem.physician}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {isSelectedMain && (
                    <span className="text-[10px] font-semibold text-[#F77F00]">
                      Ativa
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-[#F77F00] transition-colors" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Side-by-side comparison controls */}
        <div className="rounded-2xl bg-[#0a0a0a] border border-zinc-800/80 p-4 space-y-3">
          <h3 className="text-xs font-bold text-white">
            Comparação entre análises
          </h3>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label
                htmlFor="history-old-date"
                className="block text-[10px] font-semibold text-zinc-400 mb-1"
              >
                Valor anterior
              </label>
              <div className="relative">
                <select
                  id="history-old-date"
                  value={historyOldDateId}
                  onChange={(e) => setHistoryOldDateId(e.target.value)}
                  className="w-full min-h-[40px] appearance-none rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs font-semibold pl-3 pr-8 focus:outline-none focus:border-[#F77F00] cursor-pointer"
                >
                  {EXAM_ANALYSIS_DATES.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.shortDate}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label
                htmlFor="history-new-date"
                className="block text-[10px] font-semibold text-zinc-400 mb-1"
              >
                Novo valor
              </label>
              <div className="relative">
                <select
                  id="history-new-date"
                  value={historyNewDateId}
                  onChange={(e) => setHistoryNewDateId(e.target.value)}
                  className="w-full min-h-[40px] appearance-none rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs font-semibold pl-3 pr-8 focus:outline-none focus:border-[#F77F00] cursor-pointer"
                >
                  {EXAM_ANALYSIS_DATES.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.shortDate}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-zinc-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="history-category-filter"
              className="block text-[10px] font-semibold text-zinc-400 mb-1"
            >
              Categoria
            </label>
            <div className="relative">
              <select
                id="history-category-filter"
                value={historyCategoryId}
                onChange={(e) =>
                  setHistoryCategoryId(e.target.value as ExamCategoryId | 'all')
                }
                className="w-full min-h-[40px] appearance-none rounded-xl bg-zinc-900 border border-zinc-800 text-white text-xs font-semibold pl-3 pr-8 focus:outline-none focus:border-[#F77F00] cursor-pointer"
              >
                <option value="all">Todas as categorias</option>
                {EXAM_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>

        <StatusLegend />

        {/* Render selected comparison tables */}
        <div className="space-y-5">
          {categoriesToRender.map((cat) => (
            <div key={cat.id} className="space-y-2.5">
              <h3 className="text-sm font-bold text-white px-1">{cat.name}</h3>
              <CategoryComparisonTable
                category={cat}
                currentDate={newDateObj}
                previousDate={oldDateObj}
              />
            </div>
          ))}
        </div>

        <ReferenceNote />
      </div>
    );
  }

  // ============================================================================
  // VIEW: MAIN PAGE ("Exames")
  // ============================================================================
  return (
    <div className="flex flex-col px-5 pt-4 pb-12 gap-4 animate-in fade-in duration-200">
      {/* Top Navigation */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onBack}
          className="min-h-[44px] flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer group"
        >
          <ChevronLeft className="w-5 h-5 text-[#F77F00] group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-[13px] font-medium">Perfil</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveView({ kind: 'history' })}
          className="min-h-[40px] px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-[#F77F00]/70 text-zinc-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <History className="w-3.5 h-3.5 text-[#F77F00]" />
          <span>Ver histórico</span>
        </button>
      </div>

      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Exames</h1>
      </div>

      {/* Horizontal Date Selector */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {EXAM_ANALYSIS_DATES.map((dateItem) => {
          const isSelected = dateItem.id === selectedDateId;
          return (
            <button
              key={dateItem.id}
              type="button"
              onClick={() => setSelectedDateId(dateItem.id)}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-left transition-all cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-[#F77F00]/15 border-[#F77F00] text-white'
                  : 'bg-[#0a0a0a] border-zinc-800/80 text-zinc-400 hover:border-zinc-700 hover:text-white'
              }`}
            >
              <span
                className={`text-xs font-bold block whitespace-nowrap tabular-nums ${
                  isSelected ? 'text-[#F77F00]' : 'text-white'
                }`}
              >
                {dateItem.shortDate}
              </span>
              <span className="text-[10px] text-zinc-500 block whitespace-nowrap mt-0.5">
                {dateItem.id === latestAnalysis.id
                  ? 'Mais recente'
                  : dateItem.labName.replace('Laboratório ', '')}
              </span>
            </button>
          );
        })}
      </div>

      {/* Section: "Exames realizados" + 2 Filters */}
      <section className="space-y-3 pt-1">
        <div className="px-0.5">
          <h2 className="text-base font-bold text-white tracking-tight">
            Exames realizados
          </h2>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="relative">
            <select
              id="exam-type-filter"
              aria-label="Tipo de exame"
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value as ExamCategoryId | 'all')
              }
              className="w-full min-h-[42px] appearance-none rounded-xl bg-[#0a0a0a] border border-zinc-800/90 text-white text-xs font-semibold pl-3 pr-8 focus:outline-none focus:border-[#F77F00] cursor-pointer truncate"
            >
              <option value="all">Todos os exames</option>
              {EXAM_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>

          <div className="relative">
            <select
              id="exam-sort-filter"
              aria-label="Ordenação"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full min-h-[42px] appearance-none rounded-xl bg-[#0a0a0a] border border-zinc-800/90 text-white text-xs font-semibold pl-3 pr-8 focus:outline-none focus:border-[#F77F00] cursor-pointer truncate"
            >
              <option value="recent">Mais recentes</option>
              <option value="oldest">Mais antigos</option>
              <option value="alpha">Nome (A–Z)</option>
              <option value="altered">Com alterações</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Vertical list of category cards */}
        <div className="space-y-2.5">
          {filteredAndSortedCategories.map((cat) => {
            const { Icon, colorClass } = CATEGORY_ICON_MAP[cat.id];

            return (
              <button
                key={cat.id}
                type="button"
                onClick={() =>
                  setActiveView({ kind: 'detail', categoryId: cat.id })
                }
                className="w-full min-h-[64px] px-4 py-3.5 rounded-2xl bg-[#0a0a0a] hover:bg-zinc-900/60 border border-zinc-800/80 hover:border-[#F77F00]/50 flex items-center justify-between gap-3 text-left transition-all cursor-pointer group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <Icon className={`w-5 h-5 shrink-0 ${colorClass}`} />

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-white group-hover:text-[#F77F00] transition-colors truncate">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5 tabular-nums">
                      {selectedAnalysis.shortDate}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-[#F77F00] group-hover:translate-x-0.5 transition-transform shrink-0" />
              </button>
            );
          })}
        </div>
      </section>

      {/* Reference Values Informative Note */}
      <ReferenceNote />
    </div>
  );
}
