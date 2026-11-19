import React, { useState } from 'react';
import { X, Image as ImageIcon, Film, FileText, Award, Trophy, Sparkles, Send } from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import { mockCurrentUser } from '../../data/communityData';

interface CreatePostModalProps {
  initialType?: 'text' | 'image' | 'video' | 'conquista' | 'pr';
  onClose: () => void;
}

const sampleGymPhotos = [
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop&q=80'
];

export function CreatePostModal({ initialType = 'text', onClose }: CreatePostModalProps) {
  const { createPost } = useCommunity();
  const [postType, setPostType] = useState<'text' | 'image' | 'video' | 'conquista' | 'pr'>(initialType);
  const [content, setContent] = useState('');
  
  // Image state
  const [selectedImage, setSelectedImage] = useState<string>(sampleGymPhotos[0]);
  
  // Video state
  const [videoDuration, setVideoDuration] = useState('0:35');
  
  // PR state
  const [prExercise, setPrExercise] = useState('Supino Reto com Barra');
  const [prNewWeight, setPrNewWeight] = useState('112.5');
  const [prPrevWeight, setPrPrevWeight] = useState('105.0');
  const [prReps, setPrReps] = useState('5');

  // Conquista state
  const [achTitle, setAchTitle] = useState('Superação de Limite');
  const [achCategory, setAchCategory] = useState<'recordes' | 'consistencia' | 'objetivos'>('consistencia');
  const [achHighlight, setAchHighlight] = useState('Treino Concluído com Foco Máximo');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && postType === 'text') return;

    if (postType === 'text') {
      createPost({
        type: 'text',
        content: content.trim(),
      });
    } else if (postType === 'image') {
      createPost({
        type: 'image',
        content: content.trim() || 'Treino do dia finalizado! Foco na meta.',
        images: [selectedImage],
      });
    } else if (postType === 'video') {
      createPost({
        type: 'video',
        content: content.trim() || 'Execução sob controlo e foco na biomecânica.',
        videoDuration: videoDuration || '0:40',
        videoThumbnail: selectedImage,
      });
    } else if (postType === 'pr') {
      const newW = parseFloat(prNewWeight) || 100;
      const prevW = parseFloat(prPrevWeight) || 90;
      const diff = Number((newW - prevW).toFixed(1));
      const diffPct = Number(((diff / prevW) * 100).toFixed(1));
      createPost({
        type: 'pr',
        content: content.trim() || `Novo recorde pessoal batido no exercício ${prExercise}! A evolução não pára!`,
        prData: {
          exercise: prExercise,
          newWeight: newW,
          previousWeight: prevW,
          reps: parseInt(prReps, 10) || 5,
          diffKg: diff,
          diffPercent: diffPct,
        },
      });
    } else if (postType === 'conquista') {
      createPost({
        type: 'conquista',
        content: content.trim() || `${achTitle}: mais um grande marco conquistado na jornada RTEAM!`,
        achievementData: {
          title: achTitle,
          category: achCategory,
          badgeIcon: 'Award',
          highlightText: achHighlight,
        },
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-900 bg-zinc-950 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <h3 className="text-white text-sm font-bold">Criar Publicação</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Format Selector Pills */}
        <div className="px-5 pt-3 pb-2 bg-zinc-900/40 border-b border-zinc-900 overflow-x-auto hide-scrollbar flex gap-2">
          <button
            type="button"
            onClick={() => setPostType('text')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              postType === 'text'
                ? 'bg-orange-500 text-white'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Texto</span>
          </button>

          <button
            type="button"
            onClick={() => setPostType('image')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              postType === 'image'
                ? 'bg-orange-500 text-white'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Fotografia</span>
          </button>

          <button
            type="button"
            onClick={() => setPostType('video')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              postType === 'video'
                ? 'bg-orange-500 text-white'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Vídeo</span>
          </button>

          <button
            type="button"
            onClick={() => setPostType('pr')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              postType === 'pr'
                ? 'bg-orange-500 text-white'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Novo PR</span>
          </button>

          <button
            type="button"
            onClick={() => setPostType('conquista')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              postType === 'conquista'
                ? 'bg-orange-500 text-white'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Conquista</span>
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 hide-scrollbar">
          {/* User info */}
          <div className="flex items-center gap-3">
            <img
              src={mockCurrentUser.avatarUrl}
              alt={mockCurrentUser.name}
              className="w-10 h-10 rounded-full object-cover border border-zinc-700"
            />
            <div>
              <p className="text-xs font-bold text-white">{mockCurrentUser.name}</p>
              <span className="text-[10px] text-orange-400 font-semibold">{mockCurrentUser.role} • Nível {mockCurrentUser.level}</span>
            </div>
          </div>

          {/* Main text area */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="O que gostarias de partilhar com a comunidade?"
            rows={3}
            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-2xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors resize-none"
          />

          {/* Type Specific Fields */}
          {postType === 'image' && (
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-zinc-400 block">Escolhe a foto do treino:</label>
              <div className="grid grid-cols-4 gap-2">
                {sampleGymPhotos.map((url, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setSelectedImage(url)}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                      selectedImage === url ? 'border-orange-500 ring-2 ring-orange-500/30' : 'border-zinc-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt="Gym" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {postType === 'video' && (
            <div className="space-y-3 bg-zinc-900/50 p-3.5 rounded-2xl border border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">Duração do Vídeo</span>
                <input
                  type="text"
                  value={videoDuration}
                  onChange={(e) => setVideoDuration(e.target.value)}
                  placeholder="ex: 0:45"
                  className="w-20 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-center text-orange-400 font-mono"
                />
              </div>
              <div className="relative rounded-xl overflow-hidden aspect-video border border-zinc-800">
                <img src={selectedImage} alt="Video preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-orange-500/90 text-white flex items-center justify-center shadow-lg">
                    <Film className="w-5 h-5" />
                  </div>
                </div>
                <span className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] text-white font-mono">
                  {videoDuration}
                </span>
              </div>
            </div>
          )}

          {postType === 'pr' && (
            <div className="space-y-3 bg-gradient-to-br from-orange-500/10 via-zinc-900 to-zinc-900 p-4 rounded-2xl border border-orange-500/30">
              <div className="flex items-center gap-2 text-orange-400 text-xs font-bold uppercase tracking-wider">
                <Trophy className="w-4 h-4" />
                <span>Dados do Recorde Pessoal</span>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Exercício</label>
                <input
                  type="text"
                  value={prExercise}
                  onChange={(e) => setPrExercise(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Nova Carga (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={prNewWeight}
                    onChange={(e) => setPrNewWeight(e.target.value)}
                    className="w-full bg-zinc-900 border border-orange-500/40 rounded-xl px-3 py-1.5 text-xs text-orange-400 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Carga Anterior</label>
                  <input
                    type="number"
                    step="0.5"
                    value={prPrevWeight}
                    onChange={(e) => setPrPrevWeight(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-300"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Reps</label>
                  <input
                    type="number"
                    value={prReps}
                    onChange={(e) => setPrReps(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-300"
                  />
                </div>
              </div>
            </div>
          )}

          {postType === 'conquista' && (
            <div className="space-y-3 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Título da Conquista</label>
                <input
                  type="text"
                  value={achTitle}
                  onChange={(e) => setAchTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Destaque / Marca</label>
                <input
                  type="text"
                  value={achHighlight}
                  onChange={(e) => setAchHighlight(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-orange-400 font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Categoria</label>
                <select
                  value={achCategory}
                  onChange={(e) => setAchCategory(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="consistencia">Consistência</option>
                  <option value="recordes">Recordes Pessoais</option>
                  <option value="objetivos">Objetivos e Metas</option>
                </select>
              </div>
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Publicar na Comunidade</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
