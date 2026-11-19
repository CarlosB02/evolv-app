import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronDown,
  Bookmark, 
  Play, 
  Check, 
  Info, 
  AlertTriangle, 
  ShieldCheck, 
  Activity, 
  Flame, 
  Dumbbell, 
  Layers, 
  X, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Maximize2, 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Sparkles,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { ExerciseItem } from '../data/workoutsData';
import { 
  getExerciseDetailedInfo, 
  DetailedExerciseInfo, 
  ExerciseVideoItem 
} from '../data/exerciseDetailsData';
import { ExerciseNotesTab } from '../components/ExerciseNotesTab';
import { ExerciseProgressTab } from '../components/ExerciseProgressTab';
import { ExerciseChartsTab } from '../components/ExerciseChartsTab';

interface ExerciseDetailViewProps {
  exercise: ExerciseItem;
  onBack: () => void;
  onToggleFavorite?: (exerciseId: string, isFav: boolean) => void;
}

type TabKey = 'descricao' | 'notas' | 'progresso' | 'graficos';

export function ExerciseDetailView({
  exercise,
  onBack,
  onToggleFavorite
}: ExerciseDetailViewProps) {
  // Current active tab - "Descrição" active by default
  const [activeTab, setActiveTab] = useState<TabKey>('descricao');

  // Collapsible sections for "Descrição" tab (all minimized by default)
  const [openSections, setOpenSections] = useState<{
    videos: boolean;
    comoRealizar: boolean;
    terEmAtencao: boolean;
    grupoMuscular: boolean;
  }>({
    videos: false,
    comoRealizar: false,
    terEmAtencao: false,
    grupoMuscular: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Exercise details data
  const details: DetailedExerciseInfo = getExerciseDetailedInfo(exercise);

  // Favorite state (with localStorage persistence)
  const [isFavorite, setIsFavorite] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`fav_exercise_${exercise.id}`);
      return saved ? JSON.parse(saved) : (exercise.isFavorite ?? false);
    } catch {
      return exercise.isFavorite ?? false;
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Video Player Modal State
  const [playingVideo, setPlayingVideo] = useState<ExerciseVideoItem | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleToggleFavorite = () => {
    const nextState = !isFavorite;
    setIsFavorite(nextState);
    try {
      localStorage.setItem(`fav_exercise_${exercise.id}`, JSON.stringify(nextState));
    } catch (e) {
      console.error(e);
    }
    if (onToggleFavorite) {
      onToggleFavorite(exercise.id, nextState);
    }
    showToast(nextState ? 'Exercício guardado nos favoritos!' : 'Removido dos favoritos');
  };

  return (
    <div className="flex flex-col min-h-full bg-black text-white px-4 pt-4 pb-12 animate-in fade-in zoom-in-98 duration-200">
      
      {/* TOAST FEEDBACK */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] w-[90%] max-w-[360px] bg-zinc-900 border border-orange-500/40 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-7 h-7 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0">
            <Bookmark className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. CABEÇALHO                                                              */}
      {/* ========================================================================= */}
      <header className="flex items-center justify-between gap-3 mb-3">
        {/* Ação para fechar a página e regressar à área anterior */}
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white hover:border-zinc-700 active:scale-95 transition-all cursor-pointer shrink-0"
          aria-label="Voltar"
          title="Regressar à lista de exercícios"
        >
          <ChevronLeft className="w-5 h-5 text-orange-400 stroke-[2.5]" />
        </button>

        {/* Nome do exercício selecionado */}
        <div className="flex-1 text-center px-1 min-w-0">
          <h1 className="text-white text-base sm:text-lg font-bold tracking-tight truncate">
            {details.name}
          </h1>
          <p className="text-[10px] text-zinc-400 truncate mt-0.5">
            {exercise.muscleTarget || details.muscleAnatomy.primaryMuscle} • {exercise.series} séries
          </p>
        </div>

        {/* Ação para guardar nos favoritos (ícone marcador) */}
        <button
          type="button"
          onClick={handleToggleFavorite}
          className={`w-10 h-10 rounded-xl border flex items-center justify-center active:scale-95 transition-all cursor-pointer shrink-0 ${
            isFavorite
              ? 'bg-orange-500/15 border-orange-500/50 text-orange-400 shadow-md shadow-orange-500/20'
              : 'bg-zinc-900/90 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
          }`}
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Guardar nos favoritos'}
          title={isFavorite ? 'Guardado nos favoritos' : 'Guardar nos favoritos'}
        >
          <Bookmark 
            className={`w-4 h-4 transition-transform ${isFavorite ? 'fill-orange-400 text-orange-400 scale-110' : ''}`} 
            strokeWidth={2.5} 
          />
        </button>
      </header>

      {/* ========================================================================= */}
      {/* 2. TABS: DESCRIÇÃO, NOTAS, PROGRESSO E GRÁFICOS                           */}
      {/* ========================================================================= */}
      <nav className="border-b border-zinc-800/80 mb-5 -mx-1 px-1">
        <div className="flex items-center justify-between gap-1 overflow-x-auto hide-scrollbar">
          {(
            [
              { key: 'descricao', label: 'Descrição' },
              { key: 'notas', label: 'Notas' },
              { key: 'progresso', label: 'Progresso' },
              { key: 'graficos', label: 'Gráficos' }
            ] as { key: TabKey; label: string }[]
          ).map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`relative py-2.5 px-3 sm:px-4 text-xs font-semibold tracking-wide transition-all cursor-pointer shrink-0 ${
                  isActive 
                    ? 'text-orange-400 font-bold' 
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>{tab.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-400 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* CONTEÚDO DA TAB SELECIONADA                                               */}
      {/* ========================================================================= */}

      {activeTab === 'descricao' && (
        <div className="flex flex-col gap-3.5 animate-in fade-in duration-200">

          {/* 1. VÍDEOS DEMONSTRATIVOS (COLLAPSIBLE / MINIMIZADO POR DEFEITO) */}
          <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-2xl overflow-hidden transition-all shadow-sm">
            <button
              type="button"
              onClick={() => toggleSection('videos')}
              className="w-full flex items-center justify-between p-4 cursor-pointer text-left hover:bg-zinc-900/40 active:bg-zinc-900/60 transition-colors"
              aria-expanded={openSections.videos}
            >
              <div className="flex items-center gap-2.5">
                <Play className="w-4 h-4 text-orange-400 fill-orange-400 shrink-0" />
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-200">
                  Vídeos Demonstrativos
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-zinc-500 font-medium">
                  {details.videos.length} {details.videos.length === 1 ? 'vídeo' : 'vídeos'}
                </span>
                <ChevronDown 
                  className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                    openSections.videos ? 'rotate-180 text-orange-400' : ''
                  }`} 
                />
              </div>
            </button>

            {openSections.videos && (
              <div className="px-4 pb-4 pt-1 border-t border-zinc-850 flex flex-col gap-3 animate-in fade-in duration-200">
                {/* Lista/Grelha de vídeos */}
                <div className="grid grid-cols-1 gap-3 pt-2">
                  {details.videos.map((vid, idx) => (
                    <div 
                      key={vid.id || idx}
                      className="group relative overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-orange-500/40 transition-all shadow-md"
                    >
                      {/* Player Preview / Thumbnail */}
                      <div 
                        onClick={() => setPlayingVideo(vid)}
                        className="relative w-full h-44 sm:h-48 bg-zinc-900 overflow-hidden cursor-pointer"
                      >
                        <img 
                          src={vid.thumbnail} 
                          alt={vid.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        
                        {/* Gradients */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/30" />

                        {/* Botão Central de Reprodução (Play) */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-13 h-13 rounded-full bg-orange-500/90 text-white flex items-center justify-center shadow-lg shadow-orange-500/40 border border-white/20 group-hover:scale-110 group-active:scale-95 transition-all">
                            <Play className="w-6 h-6 fill-white stroke-none ml-0.5" />
                          </div>
                        </div>

                        {/* Tag de Ângulo / Canto Superior Esquerdo */}
                        <div className="absolute top-3 left-3">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                            {vid.tag}
                          </span>
                        </div>

                        {/* Duração / Canto Superior Direito */}
                        <div className="absolute top-3 right-3">
                          <span className="text-[10px] font-medium text-zinc-200 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
                            {vid.duration}
                          </span>
                        </div>

                        {/* Título Identificativo no rodapé da miniatura (mantem apenas o título) */}
                        <div className="absolute bottom-3 left-3 right-3">
                          <h3 className="text-white font-bold text-xs sm:text-sm drop-shadow-sm truncate">
                            {vid.title}
                          </h3>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. COMO REALIZAR (COLLAPSIBLE / MINIMIZADO POR DEFEITO) */}
          <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-2xl overflow-hidden transition-all shadow-sm">
            <button
              type="button"
              onClick={() => toggleSection('comoRealizar')}
              className="w-full flex items-center justify-between p-4 cursor-pointer text-left hover:bg-zinc-900/40 active:bg-zinc-900/60 transition-colors"
              aria-expanded={openSections.comoRealizar}
            >
              <div className="flex items-center gap-2.5">
                <Dumbbell className="w-4.5 h-4.5 text-orange-400 shrink-0" />
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-200">
                  Como Realizar
                </h2>
              </div>
              <ChevronDown 
                className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                  openSections.comoRealizar ? 'rotate-180 text-orange-400' : ''
                }`} 
              />
            </button>

            {openSections.comoRealizar && (
              <div className="px-4 pb-4 pt-1 border-t border-zinc-850 flex flex-col gap-3 animate-in fade-in duration-200">
                {details.instructions.setup && (
                  <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/70 mt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 block mb-1">
                      Preparação & Ajuste
                    </span>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {details.instructions.setup}
                    </p>
                  </div>
                )}

                {/* Passos numerados */}
                <div className="flex flex-col gap-2.5 mt-1">
                  {details.instructions.howToExecute.map((item) => (
                    <div 
                      key={item.step}
                      className="flex items-start gap-3 p-2.5 rounded-xl bg-zinc-950 border border-zinc-850 hover:border-zinc-700 transition-colors"
                    >
                      <div className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {item.step}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white mb-0.5">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. TER EM ATENÇÃO (COLLAPSIBLE / MINIMIZADO POR DEFEITO) */}
          <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-2xl overflow-hidden transition-all shadow-sm">
            <button
              type="button"
              onClick={() => toggleSection('terEmAtencao')}
              className="w-full flex items-center justify-between p-4 cursor-pointer text-left hover:bg-zinc-900/40 active:bg-zinc-900/60 transition-colors"
              aria-expanded={openSections.terEmAtencao}
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4.5 h-4.5 text-amber-400 shrink-0" />
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-200">
                  Ter em Atenção
                </h2>
              </div>
              <ChevronDown 
                className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                  openSections.terEmAtencao ? 'rotate-180 text-orange-400' : ''
                }`} 
              />
            </button>

            {openSections.terEmAtencao && (
              <div className="px-4 pb-4 pt-1 border-t border-zinc-850 flex flex-col gap-3 animate-in fade-in duration-200">
                {/* Pontos de foco / cuidados */}
                <div className="flex flex-col gap-2 pt-2">
                  {details.instructions.attentionPoints.map((point, i) => (
                    <div 
                      key={i}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/60"
                    >
                      <div className="mt-0.5 shrink-0">
                        {point.iconType === 'alert' && (
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        )}
                        {point.iconType === 'check' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        )}
                        {point.iconType === 'shield' && (
                          <ShieldCheck className="w-4 h-4 text-sky-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-[11px] font-bold text-zinc-200">
                          {point.title}
                        </h5>
                        <p className="text-[11px] text-zinc-400 leading-relaxed mt-0.5">
                          {point.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Erros a evitar */}
                {details.instructions.mistakesToAvoid && details.instructions.mistakesToAvoid.length > 0 && (
                  <div className="mt-1 pt-3 border-t border-zinc-800/70">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 block mb-2">
                      Erros Frequentes a Evitar
                    </span>
                    <ul className="flex flex-col gap-1.5">
                      {details.instructions.mistakesToAvoid.map((mistake, mi) => (
                        <li key={mi} className="flex items-start gap-2 text-[11px] text-zinc-300">
                          <span className="text-red-400 font-bold leading-none mt-0.5">✕</span>
                          <span className="leading-tight">{mistake}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4. GRUPO MUSCULAR (COLLAPSIBLE / MINIMIZADO POR DEFEITO) */}
          <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-2xl overflow-hidden transition-all shadow-sm">
            <button
              type="button"
              onClick={() => toggleSection('grupoMuscular')}
              className="w-full flex items-center justify-between p-4 cursor-pointer text-left hover:bg-zinc-900/40 active:bg-zinc-900/60 transition-colors"
              aria-expanded={openSections.grupoMuscular}
            >
              <div className="flex items-center gap-2.5">
                <Activity className="w-4.5 h-4.5 text-orange-400 shrink-0" />
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-200">
                  Grupo Muscular
                </h2>
              </div>
              <ChevronDown 
                className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                  openSections.grupoMuscular ? 'rotate-180 text-orange-400' : ''
                }`} 
              />
            </button>

            {openSections.grupoMuscular && (
              <div className="px-4 pb-4 pt-1 border-t border-zinc-850 flex flex-col gap-3.5 animate-in fade-in duration-200">
                {/* Header do Músculo com Nome (Sem tag Ativação Muito Alta) */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                    Músculo Principal
                  </span>
                  <h3 className="text-base font-bold text-white">
                    {details.muscleAnatomy.primaryMuscle}
                  </h3>
                </div>

                {/* Imagem Anatómica Ilustrativa (Sem tag Diagrama Biomecânico) */}
                <div className="relative w-full h-44 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
                  <img 
                    src={details.muscleAnatomy.anatomicalImageUrl} 
                    alt={details.muscleAnatomy.primaryMuscle}
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  
                  {/* Badge de categoria sobre a imagem */}
                  <div className="absolute bottom-3 left-3">
                    <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                      <Activity className="w-3.5 h-3.5 text-orange-400" />
                      <span className="text-[10px] font-semibold text-zinc-200">
                        {details.muscleAnatomy.muscleCategory}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Músculos Secundários / Sinérgicos */}
                {details.muscleAnatomy.secondaryMuscles && details.muscleAnatomy.secondaryMuscles.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                      Músculos Secundários & Sinérgicos
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {details.muscleAnatomy.secondaryMuscles.map((sec, si) => (
                        <span 
                          key={si}
                          className="text-[10px] font-medium text-zinc-300 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800"
                        >
                          {sec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Explicação da função do músculo e envolvimento */}
                <div className="flex flex-col gap-2.5 pt-1 border-t border-zinc-800/70">
                  <div className="bg-zinc-900/50 border border-zinc-800/60 p-3 rounded-xl">
                    <div className="flex items-center gap-1.5 text-orange-400 text-xs font-bold mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Função do Músculo</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {details.muscleAnatomy.functionDescription}
                    </p>
                  </div>

                  <div className="bg-zinc-900/50 border border-zinc-800/60 p-3 rounded-xl">
                    <div className="flex items-center gap-1.5 text-orange-400 text-xs font-bold mb-1">
                      <Flame className="w-3.5 h-3.5" />
                      <span>Envolvimento no Exercício</span>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {details.muscleAnatomy.roleInExercise}
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TAB NOTAS (HISTÓRICO, CRIAÇÃO, EDIÇÃO, FIXAÇÃO E ENVIO AO PROFISSIONAL)  */}
      {/* ========================================================================= */}
      {activeTab === 'notas' && (
        <ExerciseNotesTab exercise={exercise} />
      )}

      {/* ========================================================================= */}
      {/* 3. TAB PROGRESSO (RECORDES PESSOAIS, RESUMO, HISTÓRICO DE SESSÕES E LEGENDA) */}
      {/* ========================================================================= */}
      {activeTab === 'progresso' && (
        <ExerciseProgressTab exercise={exercise} />
      )}

      {/* ========================================================================= */}
      {/* 4. TAB GRÁFICOS (EVOLUÇÃO TEMPORAL, LINHA SVG, MÉTRICAS E ÁREA EXPLICATIVA) */}
      {/* ========================================================================= */}
      {activeTab === 'graficos' && (
        <ExerciseChartsTab exercise={exercise} />
      )}

      {/* ========================================================================= */}
      {/* MODAL / PLAYER DE VÍDEO INTERATIVO COM ACESSO AO VÍDEO                   */}
      {/* ========================================================================= */}
      {playingVideo && (
        <div className="fixed inset-0 z-[280] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0a0a0a] border border-zinc-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
            
            {/* Header do Player Modal */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/80 bg-zinc-950">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider block">
                  {playingVideo.tag}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                  {playingVideo.title}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setPlayingVideo(null)}
                className="w-8 h-8 rounded-full bg-zinc-900 text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Fechar vídeo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Área do Player de Vídeo */}
            <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
              <video
                src={playingVideo.videoUrl}
                poster={playingVideo.thumbnail}
                autoPlay={isPlaying}
                loop
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Botão de pausa/play sobreposto ao tocar */}
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group cursor-pointer"
              >
                {!isPlaying && (
                  <div className="w-14 h-14 rounded-full bg-orange-500/90 text-white flex items-center justify-center shadow-xl border border-white/20">
                    <Play className="w-7 h-7 fill-white stroke-none ml-0.5" />
                  </div>
                )}
              </button>

              {/* Controlos no fundo do player */}
              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 cursor-pointer"
                  >
                    {isPlaying ? <span className="text-xs font-black">❚❚</span> : <Play className="w-3.5 h-3.5 fill-white stroke-none ml-0.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 cursor-pointer"
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                  <span className="text-[10px] text-white/90 font-medium">
                    {playingVideo.duration}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPlaying(false);
                      setTimeout(() => setIsPlaying(true), 50);
                    }}
                    className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 cursor-pointer"
                    title="Repetir"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Rodapé informativo do vídeo */}
            <div className="p-4 bg-zinc-950 flex flex-col gap-2">
              <div className="flex items-start gap-2 text-xs text-zinc-300">
                <Info className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  {playingVideo.tips || 'Observa a cadência de movimento e o alinhamento das articulações durante a execução completa.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPlayingVideo(null)}
                className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all cursor-pointer mt-1"
              >
                Concluir Visualização
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
