import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  Film, 
  FileText, 
  Award, 
  Flame, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Trophy, 
  ArrowUpRight, 
  ChevronRight, 
  ChevronLeft,
  Play,
  TrendingUp,
  Sparkles,
  Heart
} from 'lucide-react';
import { CommunityPost, ReactionEmoji } from '../../types/community';
import { useCommunity } from '../../context/CommunityContext';
import { mockCurrentUser } from '../../data/communityData';
import { CommentsModal } from './CommentsModal';
import { CreatePostModal } from './CreatePostModal';

const EMOJI_MAP: Record<ReactionEmoji, { symbol: string; label: string; color: string }> = {
  fire: { symbol: '🔥', label: 'Fogo', color: 'text-orange-500' },
  muscle: { symbol: '💪', label: 'Força', color: 'text-amber-500' },
  applause: { symbol: '👏', label: 'Palmas', color: 'text-yellow-400' },
  rocket: { symbol: '🚀', label: 'Foguete', color: 'text-purple-400' },
  heart: { symbol: '❤️', label: 'Coração', color: 'text-rose-500' },
};

export function CommunityFeedTab() {
  const { 
    posts, 
    toggleReaction, 
    toggleSavePost, 
    showToast, 
    activeChallenges, 
    setSelectedChallenge,
    setActiveTab 
  } = useCommunity();

  // Highlight active challenge for top banner
  const highlightChallenge = activeChallenges[0] || null;

  // Modals state
  const [selectedPostForComments, setSelectedPostForComments] = useState<CommunityPost | null>(null);
  const [createModalType, setCreateModalType] = useState<'text' | 'image' | 'video' | 'conquista' | 'pr' | null>(null);
  
  // Emoji picker popup active on specific post
  const [emojiPickerPostId, setEmojiPickerPostId] = useState<string | null>(null);

  // Multi-image active index tracking per post
  const [activeImageIndices, setActiveImageIndices] = useState<Record<string, number>>({});

  const handleNextImage = (postId: string, total: number) => {
    setActiveImageIndices((prev) => ({
      ...prev,
      [postId]: ((prev[postId] || 0) + 1) % total,
    }));
  };

  const handlePrevImage = (postId: string, total: number) => {
    setActiveImageIndices((prev) => ({
      ...prev,
      [postId]: ((prev[postId] || 0) - 1 + total) % total,
    }));
  };

  const handleShare = (postId: string) => {
    navigator.clipboard?.writeText(`https://rteam.app/feed/post/${postId}`);
    showToast('Ligação da publicação copiada para a área de transferência!');
  };

  return (
    <div className="space-y-4 pb-16">
      {/* 1. Cartão de Publicação (Início do Feed) */}
      <div className="bg-[#121212] border border-zinc-800/80 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <img
            src={mockCurrentUser.avatarUrl}
            alt={mockCurrentUser.name}
            className="w-10 h-10 rounded-full object-cover border border-zinc-700 shrink-0"
          />
          <button
            type="button"
            onClick={() => setCreateModalType('text')}
            className="flex-1 text-left bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          >
            O que gostarias de partilhar?
          </button>
        </div>

        {/* Atalhos para Fotografia, Vídeo, Texto e Conquista */}
        <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-zinc-900">
          <button
            onClick={() => setCreateModalType('image')}
            className="flex items-center justify-center gap-1.5 py-1.5 px-1 rounded-lg hover:bg-zinc-900 text-[11px] font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate">Fotografia</span>
          </button>

          <button
            onClick={() => setCreateModalType('video')}
            className="flex items-center justify-center gap-1.5 py-1.5 px-1 rounded-lg hover:bg-zinc-900 text-[11px] font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <Film className="w-3.5 h-3.5 text-blue-400" />
            <span className="truncate">Vídeo</span>
          </button>

          <button
            onClick={() => setCreateModalType('text')}
            className="flex items-center justify-center gap-1.5 py-1.5 px-1 rounded-lg hover:bg-zinc-900 text-[11px] font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span className="truncate">Texto</span>
          </button>

          <button
            onClick={() => setCreateModalType('conquista')}
            className="flex items-center justify-center gap-1.5 py-1.5 px-1 rounded-lg hover:bg-zinc-900 text-[11px] font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <Award className="w-3.5 h-3.5 text-orange-400" />
            <span className="truncate">Conquista</span>
          </button>
        </div>
      </div>

      {/* 2. Cartão Destacado de Desafio Ativo */}
      {highlightChallenge && (
        <div 
          onClick={() => {
            setSelectedChallenge(highlightChallenge);
          }}
          className="relative overflow-hidden bg-gradient-to-r from-orange-500/15 via-zinc-900 to-zinc-900 border border-orange-500/30 rounded-2xl p-4 transition-all hover:border-orange-500/50 cursor-pointer group shadow-lg shadow-orange-500/5"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Desafio Ativo</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-zinc-400">
              <span>{highlightChallenge.daysRemaining} dias restantes</span>
            </div>
          </div>

          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-orange-400 transition-colors">
                {highlightChallenge.title}
              </h3>
              <p className="text-xs text-zinc-300 mt-0.5">
                A tua posição: <strong className="text-orange-400 font-extrabold">{highlightChallenge.userRank}º Lugar</strong>
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('desafios');
              }}
              className="px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1 transition-all shadow-md shadow-orange-500/20 shrink-0 cursor-pointer"
            >
              <span>Ver Desafios</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Feed de Publicações */}
      <div className="space-y-4">
        {posts.map((post) => {
          const totalReactions = (Object.values(post.reactions) as number[]).reduce((acc: number, curr: number) => acc + curr, 0);
          const currentImgIndex = activeImageIndices[post.id] || 0;

          return (
            <article
              key={post.id}
              className={`rounded-2xl border transition-all ${
                post.type === 'pr'
                  ? 'bg-[#121212] border-orange-500/40 shadow-lg shadow-orange-500/5 ring-1 ring-orange-500/20'
                  : post.type === 'conquista'
                  ? 'bg-[#121212] border-amber-500/30 shadow-md'
                  : 'bg-[#121212] border-zinc-800/80'
              }`}
            >
              {/* Header: Author + Timestamp */}
              <div className="p-4 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={post.author.avatarUrl}
                    alt={post.author.name}
                    className="w-10 h-10 rounded-full object-cover border border-zinc-700 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-white">{post.author.name}</span>
                      {post.author.role && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 font-semibold border border-orange-500/20">
                          {post.author.role}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-500">{post.timestamp}</span>
                  </div>
                </div>

                {/* Post format badge */}
                {post.type === 'pr' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500 text-black flex items-center gap-1 shadow-sm">
                    <Trophy className="w-3 h-3" />
                    <span>NOVO PR</span>
                  </span>
                )}
                {post.type === 'conquista' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-black flex items-center gap-1 shadow-sm">
                    <Award className="w-3 h-3" />
                    <span>CONQUISTA</span>
                  </span>
                )}
              </div>

              {/* Special Card: Personal Record (PR) */}
              {post.type === 'pr' && post.prData && (
                <div className="mx-4 mb-3 overflow-hidden rounded-xl bg-gradient-to-br from-orange-500/15 via-[#181818] to-[#141414] border border-orange-500/30">
                  {post.images && post.images.length > 0 && (
                    <div className="aspect-[16/9] w-full overflow-hidden border-b border-orange-500/20 bg-zinc-900">
                      <img
                        src={post.images[0]}
                        alt={post.prData.exercise}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400">
                        <Trophy className="w-4 h-4 text-orange-500" />
                        <span className="truncate">{post.prData.exercise}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-zinc-400">
                        {post.prData.reps} reps
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-zinc-800/80">
                      <div className="bg-zinc-900/80 p-2 rounded-xl border border-orange-500/20">
                        <span className="text-[9px] text-zinc-400 block uppercase">Novo PR</span>
                        <span className="text-sm font-black text-orange-400">{post.prData.newWeight} kg</span>
                      </div>
                      <div className="bg-zinc-900/80 p-2 rounded-xl border border-zinc-800">
                        <span className="text-[9px] text-zinc-500 block uppercase">Anterior</span>
                        <span className="text-xs font-bold text-zinc-300">{post.prData.previousWeight} kg</span>
                      </div>
                      <div className="bg-zinc-900/80 p-2 rounded-xl border border-emerald-500/20">
                        <span className="text-[9px] text-zinc-400 block uppercase">Evolução</span>
                        <span className="text-xs font-extrabold text-emerald-400 flex items-center justify-center gap-0.5">
                          <TrendingUp className="w-3 h-3" />
                          {post.prData.diffKg > 0 ? `+${post.prData.diffKg}kg` : `${post.prData.reps} reps`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Special Card: Conquista */}
              {post.type === 'conquista' && post.achievementData && (
                <div className="mx-4 mb-3 p-3.5 rounded-xl bg-gradient-to-br from-amber-500/15 via-[#181818] to-[#141414] border border-amber-500/30 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white">{post.achievementData.title}</h4>
                    <p className="text-[11px] text-amber-300 font-semibold">{post.achievementData.highlightText}</p>
                    <span className="text-[9px] text-zinc-400 uppercase tracking-wider">{post.achievementData.category}</span>
                  </div>
                </div>
              )}

              {/* Content text */}
              <div className="px-4 pb-3">
                <p className="text-xs text-zinc-200 leading-relaxed break-words">{post.content}</p>
              </div>

              {/* Media Formats */}
              {/* Single Image */}
              {post.type === 'image' && post.images && post.images.length === 1 && (
                <div className="mb-3 px-4">
                  <div className="rounded-xl overflow-hidden aspect-[4/3] bg-zinc-900 border border-zinc-800">
                    <img
                      src={post.images[0]}
                      alt="Treino"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Multi-Image Carousel */}
              {post.type === 'multi_image' && post.images && post.images.length > 1 && (
                <div className="mb-3 px-4 relative">
                  <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-zinc-900 border border-zinc-800">
                    <img
                      src={post.images[currentImgIndex]}
                      alt={`Imagem ${currentImgIndex + 1}`}
                      className="w-full h-full object-cover transition-opacity duration-300"
                    />

                    {/* Image Counter Badge */}
                    <div className="absolute top-2 right-2 bg-black/75 backdrop-blur px-2 py-0.5 rounded-full text-[10px] text-white font-mono">
                      {currentImgIndex + 1}/{post.images.length}
                    </div>

                    {/* Navigation arrows */}
                    <button
                      onClick={() => handlePrevImage(post.id, post.images!.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleNextImage(post.id, post.images!.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur transition-all cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Video Format with Duration Indicator */}
              {post.type === 'video' && post.videoThumbnail && (
                <div className="mb-3 px-4">
                  <div className="relative rounded-xl overflow-hidden aspect-video bg-zinc-900 border border-zinc-800 group cursor-pointer">
                    <img
                      src={post.videoThumbnail}
                      alt="Vídeo de treino"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-orange-500/90 group-hover:bg-orange-500 text-white flex items-center justify-center shadow-xl transition-transform group-hover:scale-110">
                        <Play className="w-5 h-5 ml-0.5 fill-current" />
                      </div>
                    </div>
                    {/* Duration badge */}
                    <div className="absolute bottom-2.5 right-2.5 bg-black/85 backdrop-blur px-2 py-0.5 rounded-md text-[10px] text-white font-mono flex items-center gap-1 border border-zinc-700/50">
                      <Film className="w-3 h-3 text-orange-400" />
                      <span>{post.videoDuration || '0:45'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Interaction Bar & Counters */}
              <div className="px-4 py-2.5 border-t border-zinc-900 flex items-center justify-between text-xs text-zinc-400 relative">
                {/* Reaction button & emoji popover */}
                <div className="relative">
                  <button
                    onClick={() => setEmojiPickerPostId(emojiPickerPostId === post.id ? null : post.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                      post.userReaction
                        ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30 font-bold'
                        : 'hover:bg-zinc-900 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>{post.userReaction ? EMOJI_MAP[post.userReaction].symbol : '🔥'}</span>
                    <span>{totalReactions > 0 ? totalReactions : 'Reagir'}</span>
                  </button>

                  {/* Reaction Picker Popup */}
                  {emojiPickerPostId === post.id && (
                    <div 
                      className="absolute bottom-full left-0 mb-2 z-20 bg-zinc-900 border border-zinc-700 rounded-2xl p-1.5 shadow-2xl flex items-center gap-1 animate-in zoom-in-90 duration-150"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {(['heart', 'fire', 'applause', 'muscle', 'rocket'] as ReactionEmoji[]).map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            toggleReaction(post.id, emoji);
                            setEmojiPickerPostId(null);
                          }}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg hover:scale-125 transition-transform cursor-pointer ${
                            post.userReaction === emoji ? 'bg-orange-500/20 ring-1 ring-orange-500' : 'hover:bg-zinc-800'
                          }`}
                          title={EMOJI_MAP[emoji].label}
                        >
                          {EMOJI_MAP[emoji].symbol}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Comments button */}
                <button
                  onClick={() => setSelectedPostForComments(post)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.comments.length}</span>
                </button>

                {/* Share button */}
                <button
                  onClick={() => handleShare(post.id)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Partilhar publicação"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                {/* Bookmark/Save button */}
                <button
                  onClick={() => toggleSavePost(post.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl transition-colors cursor-pointer ${
                    post.isSaved ? 'text-orange-500' : 'hover:bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                  title={post.isSaved ? 'Guardada' : 'Guardar'}
                >
                  <Bookmark className={`w-4 h-4 ${post.isSaved ? 'fill-current' : ''}`} />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Comments Drawer / Modal */}
      {selectedPostForComments && (
        <CommentsModal
          post={selectedPostForComments}
          onClose={() => setSelectedPostForComments(null)}
        />
      )}

      {/* Create Post Modal */}
      {createModalType && (
        <CreatePostModal
          initialType={createModalType}
          onClose={() => setCreateModalType(null)}
        />
      )}
    </div>
  );
}
