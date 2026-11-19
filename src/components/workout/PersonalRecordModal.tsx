import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Camera,
  Check,
  ChevronLeft,
  Globe,
  Share2,
  Trophy,
  X,
} from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';
import {
  NewPREvent,
  PLATES_BANNER_IMAGE,
  PersonalRecordEntry,
  formatKgPt,
  loadPersonalRecords,
} from '../../data/personalRecords';

export type PRModalStep = 'celebration' | 'share' | 'published' | 'records';

interface PersonalRecordModalProps {
  prEvent: NewPREvent | null;
  initialStep?: PRModalStep;
  onClose: () => void;
  onDismissNotNow?: () => void;
}

function Sparkline({ history }: { history: number[] }) {
  const safe = history.length >= 2 ? history : [history[0] || 0, history[0] || 0];
  const min = Math.min(...safe);
  const max = Math.max(...safe);
  const W = 76;
  const H = 34;

  const pts = safe.map((v, i) => {
    const x = (i / (safe.length - 1)) * (W - 8) + 4;
    const y = H - 5 - ((v - min) / (max - min || 1)) * (H - 11);
    return [Number(x.toFixed(1)), Number(y.toFixed(1))];
  });

  const last = pts[pts.length - 1];

  return (
    <svg className="w-[76px] h-[34px] shrink-0" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <polyline
        points={pts.map((p) => p.join(',')).join(' ')}
        fill="none"
        stroke="#f77f00"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last[0]} cy={last[1]} r="3.2" fill="#ff9d00" />
    </svg>
  );
}

function PRShareCard({
  prEvent,
  backgroundPhoto,
}: {
  prEvent: NewPREvent;
  backgroundPhoto: string | null;
}) {
  const bgUrl = backgroundPhoto || PLATES_BANNER_IMAGE;
  const diffLabel =
    prEvent.diffKg > 0
      ? `+${formatKgPt(prEvent.diffKg)} kg`
      : `+${prEvent.diffReps} ${prEvent.diffReps === 1 ? 'rep' : 'reps'}`;

  return (
    <div
      className="relative overflow-hidden rounded-[22px] border border-zinc-700/80 p-5 bg-cover bg-center"
      style={{ backgroundImage: `url('${bgUrl}')` }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, rgba(8,8,8,0.94) 0%, rgba(8,8,8,0.72) 48%, rgba(8,8,8,0.32) 100%)',
        }}
      />
      <div className="relative z-10 text-left">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-full border border-orange-500 bg-black/45 flex items-center justify-center shrink-0">
            <Trophy className="w-4.5 h-4.5 text-orange-400" />
          </span>
          <span className="text-orange-400 font-bold tracking-[0.26em] text-xs uppercase">
            Novo PR
          </span>
        </div>

        <h3 className="mt-4 text-xl font-bold text-white tracking-tight leading-snug">
          {prEvent.exercise}
        </h3>

        <div className="mt-0.5 text-5xl font-black text-white tracking-tight leading-none tabular-nums">
          {formatKgPt(prEvent.newWeight)}
          <span className="text-2xl font-bold text-orange-500 ml-1">kg</span>
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 text-orange-500 font-bold text-lg">
          <ArrowUpRight className="w-5 h-5 stroke-[2.2]" />
          <span>{diffLabel}</span>
        </div>

        <div className="mt-1 text-xs text-zinc-300 font-medium">
          Recorde anterior: {formatKgPt(prEvent.previousWeight)} kg × {prEvent.previousReps}
        </div>
      </div>
    </div>
  );
}

export function PersonalRecordModal({
  prEvent,
  initialStep = 'celebration',
  onClose,
  onDismissNotNow,
}: PersonalRecordModalProps) {
  const { createPost } = useCommunity();
  const [step, setStep] = useState<PRModalStep>(initialStep);
  const [animatedWeight, setAnimatedWeight] = useState<number>(prEvent?.newWeight || 0);
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [videoAttachedName, setVideoAttachedName] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [records, setRecords] = useState<PersonalRecordEntry[]>(() => loadPersonalRecords());
  const [localToast, setLocalToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRecords(loadPersonalRecords());
  }, [step, prEvent]);

  // Count-up animation for the PR weight on celebration screen
  useEffect(() => {
    if (!prEvent || step !== 'celebration') return;
    const target = prEvent.newWeight;
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setAnimatedWeight(target);
      return;
    }

    let start: number | null = null;
    let rafId = 0;
    const duration = 800;

    const frame = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Number((target * eased).toFixed(target % 1 !== 0 ? 1 : 0));
      setAnimatedWeight(current);
      if (progress < 1) {
        rafId = requestAnimationFrame(frame);
      } else {
        setAnimatedWeight(target);
      }
    };

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [prEvent, step]);

  const showLocalToast = (msg: string) => {
    setLocalToast(msg);
    setTimeout(() => {
      setLocalToast((cur) => (cur === msg ? null : cur));
    }, 2200);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setVideoAttachedName(file.name);
      setUploadedPhoto(null);
      showLocalToast('Vídeo adicionado (pré-visualização só com fotos)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUploadedPhoto(reader.result);
        setVideoAttachedName(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveMedia = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedPhoto(null);
    setVideoAttachedName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePublishRecord = () => {
    if (!prEvent) return;

    const defaultMsg = `Novo PR em ${prEvent.exercise}: ${formatKgPt(prEvent.newWeight)} kg × ${prEvent.reps} repetições!`;
    createPost({
      type: 'pr',
      content: caption.trim() || defaultMsg,
      images: uploadedPhoto ? [uploadedPhoto] : undefined,
      prData: {
        exercise: prEvent.exercise,
        newWeight: prEvent.newWeight,
        previousWeight: prEvent.previousWeight,
        reps: prEvent.reps,
        diffKg: prEvent.diffKg,
        diffPercent: prEvent.diffPercent,
      },
    });

    setStep('published');
    showLocalToast('Recorde publicado na comunidade');
  };

  const diffLabel = prEvent
    ? prEvent.diffKg > 0
      ? `+${formatKgPt(prEvent.diffKg)} kg`
      : `+${prEvent.diffReps} ${prEvent.diffReps === 1 ? 'rep' : 'reps'}`
    : '';

  return (
    <div
      className="fixed inset-0 z-[320] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && step === 'celebration') {
          onClose();
        }
      }}
    >
      {/* 1. CELEBRATION POP-UP */}
      {step === 'celebration' && prEvent && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pr-modal-title"
          className="relative w-full max-w-[380px] rounded-[26px] bg-[#0c0c0e] border border-zinc-800 shadow-[0_24px_60px_rgba(0,0,0,0.85)] overflow-hidden text-center animate-in zoom-in-95 duration-200"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="absolute top-3.5 right-3.5 z-20 w-9 h-9 rounded-full border border-zinc-700/80 bg-black/55 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          {/* Top banner with fade */}
          <div
            className="h-32 w-full bg-cover bg-center"
            style={{
              backgroundImage: `url('${PLATES_BANNER_IMAGE}')`,
              WebkitMaskImage: 'linear-gradient(#000 45%, transparent)',
              maskImage: 'linear-gradient(#000 45%, transparent)',
            }}
          />

          {/* Overlapping Trophy badge */}
          <div className="relative -mt-10 mx-auto w-[68px] h-[68px] rounded-full border-2 border-orange-500 bg-[#150c04] flex items-center justify-center shadow-[0_0_28px_rgba(247,127,0,0.4)]">
            <Trophy className="w-7 h-7 text-orange-400" strokeWidth={2} />
          </div>

          <div className="px-5 pb-5">
            <div className="mt-3.5 text-orange-500 font-bold tracking-[0.3em] text-xs uppercase pl-[0.3em]">
              Novo PR
            </div>

            <h2
              id="pr-modal-title"
              className="mt-1 text-2xl sm:text-[26px] font-extrabold text-white tracking-tight leading-tight"
            >
              {prEvent.exercise}
            </h2>

            <div className="mt-1 text-5xl font-black text-orange-500 tracking-tight leading-none tabular-nums">
              {formatKgPt(animatedWeight)}{' '}
              <span className="text-4xl font-extrabold">kg</span>
            </div>

            <div className="mt-1 text-sm text-zinc-300 font-medium">
              × {prEvent.reps} {prEvent.reps === 1 ? 'repetição' : 'repetições'}
            </div>

            {/* Comparison Box */}
            <div className="mt-4 mb-3.5 flex rounded-2xl border border-zinc-800 bg-[#0d0d0e] text-left overflow-hidden">
              <div className="flex-1 p-3 flex items-center gap-2.5">
                <ArrowUpRight className="w-6 h-6 text-orange-500 shrink-0" strokeWidth={2} />
                <div className="min-w-0">
                  <b className="block text-base font-extrabold text-orange-500 leading-tight">
                    {diffLabel}
                  </b>
                  <span className="text-[11px] text-zinc-400 leading-tight block">
                    face ao recorde anterior
                  </span>
                </div>
              </div>

              <div className="w-[44%] p-3 border-l border-zinc-800 flex flex-col justify-center">
                <small className="text-[10px] tracking-[0.14em] uppercase text-zinc-400 font-semibold">
                  Anterior
                </small>
                <b className="text-base font-bold text-white tabular-nums mt-0.5">
                  {formatKgPt(prEvent.previousWeight)} kg × {prEvent.previousReps}
                </b>
              </div>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed mb-4">
              Mais forte do que ontem.
              <br />
              A consistência compensa sempre.
            </p>

            {/* Primary CTA (White Text) */}
            <button
              type="button"
              onClick={() => setStep('share')}
              className="w-full h-13 py-3.5 rounded-2xl bg-gradient-to-r from-[#f77f00] to-[#ff9a1f] hover:brightness-110 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-white" />
              <span>Partilhar na comunidade</span>
            </button>

            {/* Secondary CTA (White Text) */}
            <button
              type="button"
              onClick={() => {
                if (onDismissNotNow) {
                  onDismissNotNow();
                } else {
                  onClose();
                }
              }}
              className="w-full mt-2.5 h-12 py-3 rounded-2xl bg-[#150c04] border border-orange-500/75 hover:border-orange-400 active:scale-[0.99] text-white font-bold text-sm transition-all cursor-pointer"
            >
              Agora não
            </button>
          </div>
        </div>
      )}

      {/* 2. SHARE SCREEN */}
      {step === 'share' && prEvent && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Partilhar recorde"
          className="relative w-full max-w-[390px] max-h-[90vh] overflow-y-auto rounded-[26px] bg-[#050505] border border-zinc-800 shadow-2xl p-5 flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setStep('celebration')}
              aria-label="Voltar"
              className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>

            <h2 className="text-base font-bold text-white tracking-tight">
              Partilhar recorde
            </h2>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* PR Card Preview */}
          <PRShareCard prEvent={prEvent} backgroundPhoto={uploadedPhoto} />

          {/* Upload photo/video trigger */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="mt-3">
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              className="w-full flex items-center gap-3 bg-[#0d0d0e] border border-dashed border-[#4a3a24] hover:border-orange-500/70 rounded-2xl p-3 text-left transition-colors cursor-pointer"
            >
              <span className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                <Camera className="w-4.5 h-4.5 text-orange-400" />
              </span>
              <span className="flex-1 min-w-0">
                <b className="block text-xs font-bold text-white truncate">
                  {uploadedPhoto
                    ? 'Foto adicionada'
                    : videoAttachedName
                    ? `Vídeo: ${videoAttachedName}`
                    : 'Juntar foto ou vídeo'}
                </b>
                <span className="text-[11px] text-zinc-400 block truncate">
                  {uploadedPhoto
                    ? 'Aparece como fundo do cartão'
                    : 'A prova da série ajuda o treinador a confirmar'}
                </span>
              </span>

              {(uploadedPhoto || videoAttachedName) && (
                <button
                  type="button"
                  onClick={handleRemoveMedia}
                  className="text-xs text-white underline hover:text-orange-400 px-2 py-1 cursor-pointer shrink-0"
                >
                  Remover
                </button>
              )}
            </div>
          </div>

          {/* Caption */}
          <div className="mt-4">
            <label
              htmlFor="pr-share-caption"
              className="block text-xs font-semibold text-zinc-300 mb-1.5"
            >
              Legenda
            </label>
            <textarea
              id="pr-share-caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={200}
              placeholder="Conta como foi a série…"
              rows={3}
              className="w-full bg-[#0d0d0e] border border-zinc-800 focus:border-orange-500 rounded-xl p-3 text-sm text-white placeholder-zinc-500 outline-none resize-none transition-colors"
            />
            <span className="block text-right text-[11px] text-zinc-400 mt-1">
              {caption.length}/200
            </span>
          </div>

          {/* Privacy note */}
          <div className="mt-3 mb-5 flex items-start gap-2.5 text-xs text-zinc-400 leading-relaxed">
            <Globe className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
            <p>
              Visível para toda a comunidade. Só mostramos os dados do exercício: o teu peso
              corporal e os teus dados de saúde nunca são partilhados. O Coach André confirma o
              recorde com o teu registo de cargas.
            </p>
          </div>

          {/* Publish CTA (White Text) */}
          <button
            type="button"
            onClick={handlePublishRecord}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#ff9f00] via-[#ff9c10] to-[#ff6a00] hover:brightness-110 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
          >
            Publicar recorde
          </button>
        </div>
      )}

      {/* 3. PUBLISHED CONFIRMATION */}
      {step === 'published' && prEvent && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Recorde publicado"
          className="relative w-full max-w-[390px] max-h-[90vh] overflow-y-auto rounded-[26px] bg-[#050505] border border-zinc-800 shadow-2xl p-6 text-center flex flex-col animate-in zoom-in-95 duration-200"
        >
          <div className="mx-auto w-[72px] h-[72px] rounded-full border-2 border-emerald-400 bg-emerald-950/30 flex items-center justify-center shadow-[0_0_28px_rgba(62,207,142,0.3)] mb-4">
            <Check className="w-8 h-8 text-emerald-400 stroke-[2.5]" />
          </div>

          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Recorde publicado
          </h2>
          <p className="mt-2 mb-5 text-xs text-zinc-400 leading-relaxed max-w-[290px] mx-auto">
            O teu PR já está visível na comunidade. O Coach André confirma-o com o teu registo de
            cargas.
          </p>

          <PRShareCard prEvent={prEvent} backgroundPhoto={uploadedPhoto} />

          <div className="mt-6 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#ff9f00] via-[#ff9c10] to-[#ff6a00] hover:brightness-110 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
            >
              Concluir
            </button>

            <button
              type="button"
              onClick={() => setStep('records')}
              className="w-full py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              Ver os meus recordes
            </button>
          </div>
        </div>
      )}

      {/* 4. MY RECORDS SCREEN */}
      {step === 'records' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Os meus recordes"
          className="relative w-full max-w-[390px] max-h-[90vh] overflow-y-auto rounded-[26px] bg-[#050505] border border-zinc-800 shadow-2xl p-5 flex flex-col animate-in fade-in slide-in-from-right-4 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => {
                if (prEvent) {
                  setStep('published');
                } else {
                  onClose();
                }
              }}
              aria-label="Voltar"
              className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>

            <h2 className="text-base font-bold text-white tracking-tight">
              Os meus recordes
            </h2>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
            Melhor série em cada exercício, com a evolução das últimas semanas.
          </p>

          <div className="flex flex-col gap-2.5">
            {records.map((rec) => (
              <div
                key={rec.id}
                className={`flex items-center gap-3 rounded-2xl border p-3.5 transition-colors ${
                  rec.fresh
                    ? 'border-orange-500/55 bg-gradient-to-r from-orange-500/10 via-[#0d0d0e] to-[#0d0d0e]'
                    : 'border-zinc-800 bg-[#0d0d0e]'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <b className="block text-sm font-bold text-white truncate">
                    {rec.exercise}
                  </b>
                  <span className="text-[11px] text-zinc-400 block mt-0.5">
                    {rec.dateLabel}
                    {rec.fresh ? ' · novo' : ''} · {rec.history.length} registos
                  </span>
                </div>

                <Sparkline history={rec.history} />

                <div className="text-right shrink-0">
                  <b className="block text-base font-extrabold text-white tabular-nums">
                    {formatKgPt(rec.bestWeight)} kg
                  </b>
                  <span className="text-[11px] text-zinc-400 font-medium">
                    × {rec.bestReps}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Local Toast inside PR modal */}
      {localToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[350] bg-[#1d1d1f] border border-orange-500 text-white px-4 py-2.5 rounded-2xl font-semibold text-xs shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200 whitespace-nowrap">
          {localToast}
        </div>
      )}
    </div>
  );
}
