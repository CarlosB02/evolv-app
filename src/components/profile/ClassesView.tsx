import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  Search, 
  Bookmark, 
  Play, 
  CheckCircle2, 
  User, 
  X, 
  MoreVertical, 
  Sparkles, 
  ArrowUpDown,
  Clock
} from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { RecordedClass } from '../../types';

interface ClassesViewProps {
  onBack: () => void;
}

type FilterOption = 'Todas' | 'Treino' | 'Mobilidade' | 'Yoga' | 'Pilates' | 'Guardados';
type SortOption = 'default' | 'duration_asc' | 'duration_desc' | 'az';

export function ClassesView({ onBack }: ClassesViewProps) {
  const { 
    recordedClasses, 
    toggleFavoriteClass, 
    markClassCompleted 
  } = useProfile();

  // Active category filter: Todas, Treino, Mobilidade, Yoga, Pilates, Guardados
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('Todas');
  
  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Bottom Sheet "Ordenar aulas" popup
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false);
  const [isClosingSortSheet, setIsClosingSortSheet] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('default');

  const openSortSheet = () => {
    setIsClosingSortSheet(false);
    setIsSortSheetOpen(true);
  };

  const closeSortSheet = () => {
    setIsClosingSortSheet(true);
    setTimeout(() => {
      setIsSortSheetOpen(false);
      setIsClosingSortSheet(false);
    }, 220);
  };

  // Selected class for detail modal / video player
  const [selectedClass, setSelectedClass] = useState<RecordedClass | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Focus search input when toggled open
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filterOptions: FilterOption[] = ['Todas', 'Treino', 'Mobilidade', 'Yoga', 'Pilates', 'Guardados'];

  // "Continuar a ver" list (in-progress classes, without progress bar/level/kcal)
  const continueWatchingList = useMemo(() => {
    const list = recordedClasses.filter(c => c.progressPercent > 0 && !c.completed);
    if (list.length > 0) return list;
    return recordedClasses.slice(0, 2);
  }, [recordedClasses]);

  // Filtered & Sorted Classes for "Todas as aulas"
  const filteredAndSortedClasses = useMemo(() => {
    let list = recordedClasses.filter(c => {
      if (selectedFilter === 'Guardados') {
        if (!c.isFavorite) return false;
      } else if (selectedFilter !== 'Todas') {
        if (c.category !== selectedFilter) return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = c.title.toLowerCase().includes(query);
        const matchesInstructor = c.instructor.toLowerCase().includes(query);
        const matchesCategory = c.category.toLowerCase().includes(query);
        if (!matchesTitle && !matchesInstructor && !matchesCategory) return false;
      }
      return true;
    });

    if (sortBy === 'duration_asc') {
      list = [...list].sort((a, b) => parseInt(a.duration, 10) - parseInt(b.duration, 10));
    } else if (sortBy === 'duration_desc') {
      list = [...list].sort((a, b) => parseInt(b.duration, 10) - parseInt(a.duration, 10));
    } else if (sortBy === 'az') {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title, 'pt'));
    }

    return list;
  }, [recordedClasses, selectedFilter, searchQuery, sortBy]);

  const handleOpenClass = (cls: RecordedClass) => {
    const current = recordedClasses.find(c => c.id === cls.id) || cls;
    setSelectedClass(current);
    setIsPlaying(false);
  };

  const handleMarkAsCompleted = (clsId: string) => {
    markClassCompleted(clsId);
    showToast('Aula marcada como concluída!');
    if (selectedClass && selectedClass.id === clsId) {
      setSelectedClass(prev => prev ? { ...prev, completed: true, progressPercent: 100 } : null);
    }
  };

  const handleSelectSort = (opt: SortOption) => {
    setSortBy(opt);
    setTimeout(() => {
      closeSortSheet();
    }, 120);
  };

  return (
    <div className="flex flex-col px-5 pt-4 pb-12 animate-in fade-in zoom-in-95 duration-200">
      
      {/* 1. CABEÇALHO */}
      <header className="flex items-center justify-between mb-4 relative">
        {/* Botão Voltar */}
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors cursor-pointer group"
          aria-label="Voltar"
        >
          <ChevronLeft className="w-5 h-5 text-orange-500 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-[13px] font-medium">Voltar</span>
        </button>

        {/* Título "Aulas" */}
        <h1 className="text-white text-base font-bold tracking-wide">Aulas</h1>

        {/* Ações do cabeçalho: Pesquisa + Menu de 3 Pontos (que também abre o Ordenar) */}
        <div className="flex items-center gap-1.5">
          {/* Botão de Pesquisa */}
          <button
            onClick={() => {
              setIsSearchOpen(!isSearchOpen);
              if (isSearchOpen) setSearchQuery('');
            }}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              isSearchOpen || searchQuery
                ? 'text-orange-500 bg-orange-500/10'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
            aria-label="Procurar aulas"
            title="Pesquisar aulas"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Menu de Opções Adicionais (3 pontos -> abre a pop-up de ordenar aulas com animação) */}
          <button
            onClick={openSortSheet}
            className={`p-2 rounded-full transition-colors cursor-pointer ${
              isSortSheetOpen
                ? 'text-orange-500 bg-orange-500/10'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
            aria-label="Ordenar aulas"
            title="Ordenar aulas"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Barra de Pesquisa Expansível */}
      {isSearchOpen && (
        <div className="relative mb-3.5 animate-in fade-in slide-in-from-top-2 duration-150">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Procurar aula ou instrutor..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-orange-500/40 focus:border-orange-500 rounded-xl pl-9 pr-9 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="mb-4 p-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs flex items-center gap-2 animate-in fade-in">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. FILTROS POR CATEGORIA (Navegação Horizontal) */}
      <div className="mb-5">
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
          {filterOptions.map(opt => {
            const isSelected = selectedFilter === opt;
            const count = opt === 'Todas' 
              ? recordedClasses.length 
              : opt === 'Guardados' 
              ? recordedClasses.filter(c => c.isFavorite).length 
              : recordedClasses.filter(c => c.category === opt).length;

            return (
              <button
                key={opt}
                onClick={() => setSelectedFilter(opt)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20 scale-[1.02]'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                {opt === 'Guardados' && (
                  <Bookmark className={`w-3 h-3 ${isSelected ? 'fill-white text-white' : 'text-zinc-400'}`} />
                )}
                <span>{opt}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white font-bold' : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. DIVISÃO "CONTINUAR A VER" */}
      {!searchQuery && selectedFilter === 'Todas' && continueWatchingList.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3 px-0.5">
            <h2 className="text-white text-sm font-bold tracking-tight">Continuar a ver</h2>
            <span className="text-zinc-500 text-[11px] font-medium">
              {continueWatchingList.length} {continueWatchingList.length === 1 ? 'aula' : 'aulas'}
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
            {continueWatchingList.map(cls => (
              <div
                key={cls.id}
                onClick={() => handleOpenClass(cls)}
                className="w-56 shrink-0 bg-[#0a0a0a] rounded-2xl border border-zinc-800/80 overflow-hidden hover:border-zinc-700 transition-all cursor-pointer group flex flex-col justify-between"
              >
                {/* Thumbnail com duração e play button */}
                <div className="relative h-28 w-full overflow-hidden bg-zinc-900">
                  <img
                    src={cls.thumbnailUrl}
                    alt={cls.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-xs text-[9px] font-mono font-medium text-white">
                    {cls.duration}
                  </span>

                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white group-hover:bg-orange-500 group-hover:scale-110 transition-all shadow-md">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Card Info (Sem barra de progresso, sem nível e sem kcal) */}
                <div className="p-3">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-orange-400 text-[9px] font-bold uppercase tracking-wider">
                      {cls.category}
                    </span>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toggleFavoriteClass(cls.id);
                      }}
                      className="p-1 text-zinc-500 hover:text-orange-400 transition-colors cursor-pointer"
                      title={cls.isFavorite ? 'Remover dos guardados' : 'Guardar aula'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${cls.isFavorite ? 'fill-orange-400 text-orange-400' : ''}`} />
                    </button>
                  </div>

                  <h3 className="text-white text-xs font-bold line-clamp-1 group-hover:text-orange-400 transition-colors">
                    {cls.title}
                  </h3>
                  <p className="text-zinc-400 text-[11px] truncate mt-0.5">
                    {cls.instructor}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. TODAS AS AULAS COM "ORDENAR POR" */}
      <div className="mb-3 flex items-center justify-between px-0.5">
        <h2 className="text-white text-sm font-bold tracking-tight">
          {selectedFilter === 'Guardados' 
            ? 'Aulas Guardadas' 
            : selectedFilter !== 'Todas' 
            ? `Aulas de ${selectedFilter}` 
            : 'Todas as aulas'}
        </h2>

        {/* Botão "Ordenar por" que abre a pop-up da foto com animação */}
        <button
          onClick={openSortSheet}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-white px-2.5 py-1 rounded-lg bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
        >
          <span className="text-xs font-medium">Ordenar por</span>
          <ArrowUpDown className="w-3 h-3 text-orange-500" />
        </button>
      </div>

      {/* 5. LISTAGEM PRINCIPAL DE AULAS */}
      <div className="space-y-3">
        {filteredAndSortedClasses.length === 0 ? (
          <div className="p-8 text-center bg-[#0a0a0a] rounded-2xl border border-zinc-800/60">
            <Bookmark className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-zinc-300 text-sm font-medium">Nenhuma aula encontrada</p>
            <p className="text-zinc-500 text-xs mt-1 mb-3">
              {selectedFilter === 'Guardados'
                ? 'Ainda não guardaste nenhuma aula nos teus guardados.'
                : 'Não existem aulas com os filtros ou pesquisa aplicados.'}
            </p>
            {(selectedFilter !== 'Todas' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedFilter('Todas');
                  setSearchQuery('');
                  setSortBy('default');
                }}
                className="py-2 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Ver Todas as Aulas
              </button>
            )}
          </div>
        ) : (
          filteredAndSortedClasses.map(cls => (
            <div
              key={cls.id}
              className="bg-[#0a0a0a] rounded-2xl border border-zinc-800/70 p-3 hover:border-zinc-700 transition-all cursor-pointer group flex gap-3.5"
              onClick={() => handleOpenClass(cls)}
            >
              {/* Thumbnail com duração e botão play */}
              <div className="relative w-28 h-24 rounded-xl overflow-hidden shrink-0 bg-zinc-900">
                <img
                  src={cls.thumbnailUrl}
                  alt={cls.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white group-hover:bg-orange-500 group-hover:scale-110 transition-all shadow-md">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </div>

                <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-xs text-[9px] font-mono font-medium text-white">
                  {cls.duration}
                </span>
              </div>

              {/* Informações da aula (sem barra de progresso, sem nível e sem kcal) */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-orange-400 text-[9px] font-bold uppercase tracking-wider">
                      {cls.category}
                    </span>
                    
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toggleFavoriteClass(cls.id);
                      }}
                      className="p-1 text-zinc-500 hover:text-orange-400 transition-colors cursor-pointer"
                      title={cls.isFavorite ? 'Remover dos guardados' : 'Guardar aula'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${cls.isFavorite ? 'fill-orange-400 text-orange-400' : ''}`} />
                    </button>
                  </div>

                  <h3 className="text-white text-xs font-bold leading-tight group-hover:text-orange-400 transition-colors line-clamp-2">
                    {cls.title}
                  </h3>

                  <p className="text-zinc-400 text-[11px] truncate mt-1">
                    {cls.instructor}
                  </p>
                </div>

                {cls.completed && (
                  <div className="flex items-center text-[10px] pt-1 border-t border-zinc-800/60 mt-1">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Vista
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* POP-UP BOTTOM SHEET: "ORDENAR AULAS" COM ANIMAÇÃO DE VIR DO FUNDO DO ECRÃ */}
      {isSortSheetOpen && (
        <div 
          className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end justify-center ${
            isClosingSortSheet ? 'animate-fade-out' : 'animate-fade-in'
          }`}
          onClick={closeSortSheet}
        >
          <div 
            className={`bg-[#0b0b0b] border-t border-zinc-800 rounded-t-[32px] w-full max-w-[420px] p-5 pb-8 shadow-2xl ${
              isClosingSortSheet ? 'animate-slide-down' : 'animate-slide-up'
            }`}
            onClick={e => e.stopPropagation()}
          >
            {/* Linha/Pill superior para arrastar */}
            <div className="w-10 h-1 bg-zinc-700/80 rounded-full mx-auto mb-4" />

            {/* Título: "Ordenar aulas" */}
            <h3 className="text-white text-lg font-bold tracking-tight mb-4 text-left">
              Ordenar aulas
            </h3>

            {/* Lista de Opções: Padrão, Mais curtas, Mais longas, A–Z */}
            <div className="space-y-2.5">
              {/* Opção 1: Padrão */}
              <button
                type="button"
                onClick={() => handleSelectSort('default')}
                className={`w-full py-3.5 rounded-2xl text-center font-bold text-sm transition-all cursor-pointer ${
                  sortBy === 'default'
                    ? 'bg-[#f97316] text-white shadow-lg shadow-orange-500/25'
                    : 'bg-[#151515] border border-zinc-800/80 text-white hover:bg-zinc-800/70'
                }`}
              >
                Padrão
              </button>

              {/* Opção 2: Mais curtas */}
              <button
                type="button"
                onClick={() => handleSelectSort('duration_asc')}
                className={`w-full py-3.5 rounded-2xl text-center font-bold text-sm transition-all cursor-pointer ${
                  sortBy === 'duration_asc'
                    ? 'bg-[#f97316] text-white shadow-lg shadow-orange-500/25'
                    : 'bg-[#151515] border border-zinc-800/80 text-white hover:bg-zinc-800/70'
                }`}
              >
                Mais curtas
              </button>

              {/* Opção 3: Mais longas */}
              <button
                type="button"
                onClick={() => handleSelectSort('duration_desc')}
                className={`w-full py-3.5 rounded-2xl text-center font-bold text-sm transition-all cursor-pointer ${
                  sortBy === 'duration_desc'
                    ? 'bg-[#f97316] text-white shadow-lg shadow-orange-500/25'
                    : 'bg-[#151515] border border-zinc-800/80 text-white hover:bg-zinc-800/70'
                }`}
              >
                Mais longas
              </button>

              {/* Opção 4: A–Z */}
              <button
                type="button"
                onClick={() => handleSelectSort('az')}
                className={`w-full py-3.5 rounded-2xl text-center font-bold text-sm transition-all cursor-pointer ${
                  sortBy === 'az'
                    ? 'bg-[#f97316] text-white shadow-lg shadow-orange-500/25'
                    : 'bg-[#151515] border border-zinc-800/80 text-white hover:bg-zinc-800/70'
                }`}
              >
                A–Z
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALHE DA AULA COM VÍDEO */}
      {selectedClass && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-zinc-800 rounded-t-[28px] sm:rounded-[24px] w-full max-w-[430px] p-5 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[92vh] overflow-y-auto hide-scrollbar">
            
            {/* Header modal */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3.5">
              <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 text-[10px] font-bold uppercase tracking-wider border border-orange-500/30">
                {selectedClass.category}
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleFavoriteClass(selectedClass.id)}
                  className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-orange-400 transition-colors cursor-pointer"
                  title="Guardar"
                >
                  <Bookmark className={`w-4 h-4 ${selectedClass.isFavorite ? 'fill-orange-400 text-orange-400' : ''}`} />
                </button>
                <button
                  onClick={() => {
                    setSelectedClass(null);
                    setIsPlaying(false);
                  }}
                  className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Video Player Box */}
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video mb-4 border border-zinc-800 shadow-xl group">
              {isPlaying && selectedClass.videoUrl ? (
                <video
                  src={selectedClass.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-cover"
                  onEnded={() => handleMarkAsCompleted(selectedClass.id)}
                />
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={selectedClass.thumbnailUrl}
                    alt={selectedClass.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
                    <button
                      onClick={() => setIsPlaying(true)}
                      className="w-14 h-14 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-2xl shadow-orange-500/50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    </button>
                    <span className="text-white text-xs font-semibold mt-2.5 drop-shadow">
                      Iniciar Aula
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Title & Info */}
            <div className="space-y-3 mb-5">
              <div>
                <h3 className="text-white text-base font-bold leading-tight">
                  {selectedClass.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <User className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-zinc-300 text-xs font-semibold">{selectedClass.instructor}</span>
                  {selectedClass.instructorRole && (
                    <span className="text-zinc-500 text-[11px] truncate">({selectedClass.instructorRole})</span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="bg-[#0a0a0a] p-3.5 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider block mb-1">
                  Sobre esta Aula
                </span>
                <p className="text-zinc-300 text-xs leading-relaxed">
                  {selectedClass.description}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-3 border-t border-zinc-800/80">
              <button
                onClick={() => setIsPlaying(true)}
                className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Assistir Aula</span>
              </button>

              <button
                onClick={() => handleMarkAsCompleted(selectedClass.id)}
                className={`py-3 px-4 rounded-xl text-xs font-bold transition-colors border flex items-center justify-center gap-1.5 cursor-pointer ${
                  selectedClass.completed
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{selectedClass.completed ? 'Concluída' : 'Marcar como Vista'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
