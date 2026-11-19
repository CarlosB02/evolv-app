import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight,
  BookOpen, 
  Lightbulb, 
  Video, 
  UtensilsCrossed, 
  Download, 
  Play, 
  X, 
  CheckCircle2
} from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { EducationalContent, EducationalCategory } from '../../types';

interface ConteudoViewProps {
  onBack: () => void;
}

export function ConteudoView({ onBack }: ConteudoViewProps) {
  const { educationalContents, markContentAsRead } = useProfile();

  const [selectedCategory, setSelectedCategory] = useState<EducationalCategory | 'Todos'>('Todos');
  const [activeItem, setActiveItem] = useState<EducationalContent | null>(null);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  const categories: (EducationalCategory | 'Todos')[] = ['Todos', 'Dicas', 'Ebooks', 'Vídeos', 'Receitas'];

  // Filtered contents based on category
  const filteredContents = useMemo(() => {
    if (selectedCategory === 'Todos') return educationalContents;
    return educationalContents.filter(item => item.category === selectedCategory);
  }, [educationalContents, selectedCategory]);

  // Dynamic featured content: first item matching category
  const featuredContent = filteredContents.length > 0 ? filteredContents[0] : null;

  // Remaining contents in compact vertical list
  const remainingContents = filteredContents.length > 1 ? filteredContents.slice(1) : [];

  const handleOpenItem = (item: EducationalContent) => {
    setActiveItem(item);
    setIsPlayingVideo(false);
    if (item.isNew) {
      markContentAsRead(item.id);
    }
  };

  const handleDownloadPDF = (name?: string) => {
    const filename = name || 'RTEAM_Conteudo_Educativo.pdf';
    setDownloadNotice(filename);
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  const getCategoryIcon = (cat: EducationalCategory, className = 'w-4 h-4 text-orange-500') => {
    switch (cat) {
      case 'Dicas':
        return <Lightbulb className={className} />;
      case 'Ebooks':
        return <BookOpen className={className} />;
      case 'Vídeos':
        return <Video className={className} />;
      case 'Receitas':
        return <UtensilsCrossed className={className} />;
    }
  };

  const getActionButtonLabel = (cat: EducationalCategory) => {
    switch (cat) {
      case 'Ebooks':
        return { label: 'Descarregar Ebook', icon: <Download className="w-3.5 h-3.5" /> };
      case 'Vídeos':
        return { label: 'Ver vídeo', icon: <Play className="w-3.5 h-3.5 fill-current" /> };
      case 'Dicas':
        return { label: 'Ler dica', icon: <BookOpen className="w-3.5 h-3.5" /> };
      case 'Receitas':
        return { label: 'Ver receita', icon: <UtensilsCrossed className="w-3.5 h-3.5" /> };
    }
  };

  return (
    <div className="flex flex-col px-5 pt-4 pb-12 animate-in fade-in zoom-in-95 duration-200">
      
      {/* 1. CABEÇALHO LIMPO E CENTRALIZADO */}
      <header className="flex items-center justify-between mb-5 relative">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-full text-zinc-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Voltar"
        >
          <ChevronLeft className="w-5 h-5 text-orange-500" />
        </button>

        <h1 className="text-white text-base font-bold tracking-tight text-center flex-1">
          Conteúdos
        </h1>

        {/* Espaçador equilibrado para centralização simétrica */}
        <div className="w-7" />
      </header>

      {/* AVISO TOAST DE DOWNLOAD */}
      {downloadNotice && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[360px] bg-zinc-900 border border-emerald-500/40 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs text-zinc-200 truncate">
            Ficheiro <strong className="text-white font-semibold">"{downloadNotice}"</strong> transferido.
          </span>
        </div>
      )}

      {/* 2. FILTROS HORIZONTAIS POR CATEGORIA */}
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 mb-5">
        {categories.map(cat => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-orange-500 text-white font-bold shadow-md shadow-orange-500/20'
                  : 'bg-[#101010] border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 3. CONTEÚDO EM DESTAQUE */}
      {featuredContent && (
        <div className="mb-6">
          <div 
            onClick={() => handleOpenItem(featuredContent)}
            className="bg-[#0c0c0c] border border-zinc-800/90 hover:border-zinc-700/80 rounded-2xl p-4.5 transition-all cursor-pointer shadow-lg group relative overflow-hidden"
          >
            {/* Top row do destaque: Tag EM DESTAQUE e Ícone do formato */}
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className="text-[10px] font-bold tracking-wider uppercase text-orange-400">
                EM DESTAQUE
              </span>

              <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                {getCategoryIcon(featuredContent.category, 'w-3.5 h-3.5 text-orange-400')}
                <span className="text-[11px] font-medium text-zinc-400">{featuredContent.category}</span>
              </div>
            </div>

            {/* Título do destaque */}
            <h2 className="text-white text-sm sm:text-base font-bold leading-snug group-hover:text-orange-400 transition-colors">
              {featuredContent.title}
            </h2>

            {/* Pequena descrição */}
            <p className="text-zinc-400 text-xs leading-relaxed mt-1.5 line-clamp-2">
              {featuredContent.summary}
            </p>

            {/* Linha de formato complementar */}
            <div className="text-[11px] text-zinc-400 font-medium mt-2.5">
              {featuredContent.format}
            </div>

            {/* Botão de ação adaptado conforme o formato */}
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                handleOpenItem(featuredContent);
              }}
              className="mt-3.5 w-full py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md shadow-orange-500/15"
            >
              {getActionButtonLabel(featuredContent.category).icon}
              <span>{getActionButtonLabel(featuredContent.category).label}</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. LISTA DE CONTEÚDOS (LINHAS COMPACTAS) */}
      <div>
        <div className="mb-3 px-0.5 flex items-center justify-between">
          <h3 className="text-white text-xs font-bold tracking-tight">
            {selectedCategory === 'Todos' ? 'Mais Conteúdos' : `Conteúdos de ${selectedCategory}`}
          </h3>
          <span className="text-zinc-400 text-[11px]">
            {filteredContents.length} {filteredContents.length === 1 ? 'disponível' : 'disponíveis'}
          </span>
        </div>

        {remainingContents.length === 0 && !featuredContent ? (
          <div className="p-8 text-center bg-[#0a0a0a] rounded-2xl border border-zinc-800/60">
            <BookOpen className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-zinc-300 text-xs font-medium">Nenhum conteúdo nesta categoria</p>
          </div>
        ) : (
          <div className="space-y-2">
            {remainingContents.map(item => (
              <div
                key={item.id}
                onClick={() => handleOpenItem(item)}
                className="p-3 bg-[#0a0a0a] hover:bg-[#121212] border border-zinc-800/70 hover:border-zinc-700/80 rounded-xl flex items-center gap-3 transition-colors cursor-pointer group"
              >
                {/* Ícone representativo da categoria */}
                <div className="w-8 h-8 rounded-lg bg-zinc-900/90 border border-zinc-800/80 flex items-center justify-center shrink-0">
                  {getCategoryIcon(item.category, 'w-4 h-4 text-orange-400')}
                </div>

                {/* Coluna central: Título e Identificação de formato complementar */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-white text-xs font-semibold leading-tight truncate group-hover:text-orange-400 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-zinc-400 text-[11px] leading-tight truncate mt-0.5">
                    {item.format}
                  </p>
                </div>

                {/* Tag NOVO discreta quando aplicável */}
                {item.isNew && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 shrink-0">
                    NOVO
                  </span>
                )}

                {/* Seta lateral laranja */}
                <ChevronRight className="w-4 h-4 text-orange-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. MODAL DE VISUALIZAÇÃO / DETALHE LIMPO */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-[#0e0e0e] border border-zinc-800 rounded-t-[28px] sm:rounded-[24px] w-full max-w-[420px] p-5 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[92vh] overflow-y-auto hide-scrollbar">
            
            {/* Header do modal */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3.5">
              <div className="flex items-center gap-2">
                {getCategoryIcon(activeItem.category, 'w-4 h-4 text-orange-500')}
                <span className="text-white text-xs font-bold uppercase tracking-wider">
                  {activeItem.category}
                </span>
                <span className="text-zinc-400 text-xs">• {activeItem.format}</span>
              </div>
              <button
                onClick={() => {
                  setActiveItem(null);
                  setIsPlayingVideo(false);
                }}
                className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Player de Vídeo ou Miniatura */}
            {activeItem.category === 'Vídeos' && (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video mb-4 border border-zinc-800 shadow-xl">
                {isPlayingVideo && activeItem.videoUrl ? (
                  <video
                    src={activeItem.videoUrl}
                    controls
                    autoPlay
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <img
                      src={activeItem.thumbnailUrl}
                      alt={activeItem.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                      <button
                        onClick={() => setIsPlayingVideo(true)}
                        className="w-13 h-13 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-2xl shadow-orange-500/40 hover:scale-105 transition-all cursor-pointer"
                      >
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Título e Resumo */}
            <h3 className="text-white text-base font-bold leading-snug mb-1.5">
              {activeItem.title}
            </h3>
            <p className="text-zinc-400 text-xs leading-relaxed mb-4">
              {activeItem.summary}
            </p>

            {/* CONTEÚDO ESPECÍFICO CONFORME O FORMATO */}

            {/* A) EBOOK: Capítulos, Resumo e Download */}
            {activeItem.category === 'Ebooks' && (
              <div className="space-y-3 mb-5">
                {activeItem.pdfPages && (
                  <div className="bg-[#070707] p-3.5 rounded-xl border border-zinc-800/80">
                    <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider block mb-2">
                      Índice do Ebook
                    </span>
                    <div className="space-y-2">
                      {activeItem.pdfPages.map((page, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                          <span className="w-4.5 h-4.5 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-orange-400 text-[10px] font-bold shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-snug">{page}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeItem.fullText && (
                  <div className="bg-[#070707] p-3.5 rounded-xl border border-zinc-800/80">
                    <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider block mb-1">
                      Visão Geral
                    </span>
                    <p className="text-zinc-300 text-xs leading-relaxed">
                      {activeItem.fullText}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleDownloadPDF(activeItem.pdfDownloadName)}
                  className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Descarregar Ebook Completo (PDF)</span>
                </button>
              </div>
            )}

            {/* B) RECEITAS: Macros, Ingredientes e Preparação */}
            {activeItem.category === 'Receitas' && activeItem.recipeData && (
              <div className="space-y-3 mb-5">
                {/* Linha de Macros limpa */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-[#070707] p-2 rounded-xl border border-zinc-800/80 text-center">
                    <span className="text-zinc-400 text-[10px] block">Tempo</span>
                    <span className="text-white text-xs font-bold mt-0.5 block">{activeItem.recipeData.prepTime}</span>
                  </div>
                  <div className="bg-[#070707] p-2 rounded-xl border border-zinc-800/80 text-center">
                    <span className="text-zinc-400 text-[10px] block">Proteína</span>
                    <span className="text-orange-400 text-xs font-bold mt-0.5 block">{activeItem.recipeData.protein}</span>
                  </div>
                  <div className="bg-[#070707] p-2 rounded-xl border border-zinc-800/80 text-center">
                    <span className="text-zinc-400 text-[10px] block">Calorias</span>
                    <span className="text-white text-xs font-bold mt-0.5 block">{activeItem.recipeData.calories}</span>
                  </div>
                  <div className="bg-[#070707] p-2 rounded-xl border border-zinc-800/80 text-center">
                    <span className="text-zinc-400 text-[10px] block">Carbs</span>
                    <span className="text-white text-xs font-bold mt-0.5 block">{activeItem.recipeData.carbs}</span>
                  </div>
                </div>

                {/* Ingredientes */}
                <div className="bg-[#070707] p-3.5 rounded-xl border border-zinc-800/80">
                  <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider block mb-2">
                    Ingredientes
                  </span>
                  <ul className="space-y-1.5">
                    {activeItem.recipeData.ingredients.map((ing, i) => (
                      <li key={i} className="text-zinc-300 text-xs flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0" />
                        <span>{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Preparação */}
                <div className="bg-[#070707] p-3.5 rounded-xl border border-zinc-800/80">
                  <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider block mb-2">
                    Modo de Preparação
                  </span>
                  <ol className="space-y-2">
                    {activeItem.recipeData.steps.map((st, i) => (
                      <li key={i} className="text-zinc-300 text-xs flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-zinc-800 text-zinc-300 font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{st}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            {/* C) DICAS & VÍDEOS: Texto completo */}
            {(activeItem.category === 'Dicas' || activeItem.category === 'Vídeos') && activeItem.fullText && (
              <div className="mb-5">
                <div className="bg-[#070707] p-4 rounded-xl border border-zinc-800/80">
                  <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider block mb-2">
                    Recomendações Práticas
                  </span>
                  <p className="text-zinc-300 text-xs leading-relaxed whitespace-pre-line">
                    {activeItem.fullText}
                  </p>
                </div>
              </div>
            )}

            {/* Botão Fechar */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveItem(null);
                  setIsPlayingVideo(false);
                }}
                className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
