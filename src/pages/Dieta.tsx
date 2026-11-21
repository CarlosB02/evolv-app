import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Bell,
  Calendar,
  ChevronRight,
  Dumbbell,
  FileText,
  Flame,
  Moon,
  Paperclip,
  User,
  Utensils,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { RefeicaoDetail } from './RefeicaoDetail';
import { RefeicoesView } from './RefeicoesView';
import { useProfile } from '../context/ProfileContext';
import { useNotifications } from '../context/NotificationContext';
import { useScrollToTop } from '../utils/scrollToTop';
import {
  ASSIGNED_DIET_PLANS,
  DietPlan,
  DietPlanType,
  FALLBACK_DIET_PLAN_IMAGE,
  PT_DIET_NOTE,
  formatKcal,
} from '../data/dietPlansData';

function getPlanIcon(type: DietPlanType) {
  switch (type) {
    case 'training':
      return <Dumbbell className="w-5 h-5 text-[#F77F00] shrink-0" strokeWidth={2.2} />;
    case 'rest':
      return <Moon className="w-5 h-5 text-sky-400 shrink-0" strokeWidth={2.2} />;
    case 'refeed':
      return <Flame className="w-5 h-5 text-amber-400 shrink-0" strokeWidth={2.2} />;
    case 'custom':
    default:
      return <Utensils className="w-5 h-5 text-emerald-400 shrink-0" strokeWidth={2.2} />;
  }
}

interface DietPlanCardProps {
  plan: DietPlan;
  onSelect: (plan: DietPlan) => void;
}

const DietPlanCard: React.FC<DietPlanCardProps> = ({ plan, onSelect }) => {
  const [imgSrc, setImgSrc] = useState(plan.imageUrl);
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <article
      onClick={() => onSelect(plan)}
      className="rounded-[22px] overflow-hidden bg-[#0a0a0a] border border-zinc-800/80 hover:border-[#F77F00]/50 shadow-[0_12px_30px_rgba(0,0,0,0.45)] transition-colors cursor-pointer group"
    >
      {/* Área principal com fotografia do plano */}
      <div className="relative h-[180px] w-full overflow-hidden bg-zinc-900">
        {!imgFailed ? (
          <img
            src={imgSrc}
            alt={`Plano alimentar ${plan.name}`}
            referrerPolicy="no-referrer"
            onError={() => {
              if (imgSrc !== FALLBACK_DIET_PLAN_IMAGE) {
                setImgSrc(FALLBACK_DIET_PLAN_IMAGE);
              } else {
                setImgFailed(true);
              }
            }}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-zinc-900 via-zinc-950 to-orange-950/30 flex items-center justify-center">
            {getPlanIcon(plan.type)}
          </div>
        )}

        {/* Camada de contraste sobre a fotografia */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/15"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/55 via-transparent to-black/25"
          aria-hidden="true"
        />

        {/* Identificação do plano + botão Ver detalhes */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-4 flex items-end justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {getPlanIcon(plan.type)}
            <h2
              style={{ color: '#ffffff' }}
              className="text-[20px] font-bold tracking-tight leading-tight truncate drop-shadow-sm"
            >
              {plan.name}
            </h2>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(plan);
            }}
            style={{ color: '#ffffff' }}
            className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#F77F00] hover:bg-[#e57300] active:scale-[0.98] text-xs font-bold inline-flex items-center gap-1 shadow-lg shadow-orange-500/25 transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>Ver detalhes</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Separação clara + Faixa inferior de informação nutricional */}
      <div className="border-t border-zinc-800/80 bg-[#0a0a0a] grid grid-cols-4 divide-x divide-zinc-800/70 py-3 px-1 text-center">
        <div className="px-1.5 flex flex-col items-center justify-center">
          <div className="text-[13.5px] font-bold text-white tabular-nums leading-tight whitespace-nowrap">
            {formatKcal(plan.calories)}
            <span className="text-[10px] font-medium text-zinc-400 ml-0.5">kcal</span>
          </div>
          <span className="text-[10px] font-medium text-zinc-400 mt-1 truncate max-w-full">
            Calorias
          </span>
        </div>

        <div className="px-1.5 flex flex-col items-center justify-center">
          <div className="text-[13.5px] font-bold text-white tabular-nums leading-tight whitespace-nowrap">
            {plan.proteinGrams}
            <span className="text-[10px] font-medium text-zinc-400 ml-0.5">g</span>
          </div>
          <span className="text-[10px] font-medium text-zinc-400 mt-1 truncate max-w-full">
            Proteína
          </span>
        </div>

        <div className="px-1.5 flex flex-col items-center justify-center">
          <div className="text-[13.5px] font-bold text-white tabular-nums leading-tight whitespace-nowrap">
            {plan.carbsGrams}
            <span className="text-[10px] font-medium text-zinc-400 ml-0.5">g</span>
          </div>
          <span className="text-[10px] font-medium text-zinc-400 mt-1 truncate max-w-full">
            Hidratos
          </span>
        </div>

        <div className="px-1.5 flex flex-col items-center justify-center">
          <div className="text-[13.5px] font-bold text-white tabular-nums leading-tight whitespace-nowrap">
            {plan.fatGrams}
            <span className="text-[10px] font-medium text-zinc-400 ml-0.5">g</span>
          </div>
          <span className="text-[10px] font-medium text-zinc-400 mt-1 truncate max-w-full">
            Gordura
          </span>
        </div>
      </div>
    </article>
  );
};

export function Dieta() {
  const { openProfile } = useProfile();
  const { openNotifications, totalUnreadCount } = useNotifications();
  const [selectedPlan, setSelectedPlan] = useState<DietPlan | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isFreeMealOpen, setIsFreeMealOpen] = useState(false);

  useScrollToTop([selectedMeal, selectedPlan?.id]);

  if (selectedMeal) {
    return (
      <RefeicaoDetail
        title={selectedMeal}
        onBack={() => setSelectedMeal(null)}
      />
    );
  }

  if (selectedPlan) {
    return (
      <RefeicoesView
        planName={selectedPlan.name}
        onBack={() => setSelectedPlan(null)}
        onSelectMeal={(mealName) => setSelectedMeal(mealName)}
      />
    );
  }

  const ptNote = PT_DIET_NOTE;
  const hasAttachments = Boolean(ptNote?.attachments && ptNote.attachments.length > 0);

  return (
    <>
      {/* HEADER */}
      <header className="flex justify-between items-center px-5 pt-[max(0.75rem,env(safe-area-inset-top))] sm:pt-8 pb-3 bg-black/90 backdrop-blur-xl sticky top-0 z-30 border-b border-zinc-900">
        <div className="flex items-center gap-3">
          <img
            src="/assets/aistudio/9CF5FBD1-65BF-4557-BF19-1F1A5C3032B1_b4e3ad3d.PNG"
            alt="EVOLV"
            className="w-10 h-10 object-contain shrink-0"
          />
          <p className="text-white text-sm font-bold tracking-wider leading-tight">
            EVOLV
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => openNotifications('geral')}
            className="relative text-orange-500 transition-transform hover:scale-110 cursor-pointer"
            aria-label="Notificações"
            title="Abrir Notificações"
          >
            <Bell className="w-[22px] h-[22px]" strokeWidth={2} />
            {totalUnreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-[#0a0a0a] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-black animate-pulse">
                {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={openProfile}
            className="relative text-orange-500 transition-transform hover:scale-110 cursor-pointer"
            aria-label="Perfil"
            title="Abrir Perfil"
          >
            <User className="w-[22px] h-[22px]" strokeWidth={2} />
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-4 px-5 pt-4 pb-6 animate-in fade-in duration-200">

      {/* TÍTULO DA SECÇÃO */}
      <h1 className="text-2xl font-bold text-white tracking-tight px-0.5">
        Dieta
      </h1>

      {/* CARTÕES DOS PLANOS ALIMENTARES */}
      {ASSIGNED_DIET_PLANS.length === 0 ? (
        <div className="rounded-[22px] bg-[#0a0a0a] border border-zinc-800/80 p-8 text-center">
          <Utensils className="w-7 h-7 text-zinc-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-white">
            Sem planos alimentares atribuídos
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {ASSIGNED_DIET_PLANS.map((plan) => (
            <DietPlanCard
              key={plan.id}
              plan={plan}
              onSelect={(selected) => setSelectedPlan(selected)}
            />
          ))}
        </div>
      )}

      {/* BLOCOS INFERIORES: REFEIÇÃO LIVRE (ESQUERDA) + NOTAS (DIREITA) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Bloco Refeição Livre (lado esquerdo) */}
        <button
          type="button"
          onClick={() => setIsFreeMealOpen(true)}
          className="min-h-[78px] rounded-[20px] bg-[#0a0a0a] hover:bg-zinc-900/60 border border-zinc-800/80 hover:border-[#F77F00]/50 px-3.5 py-3.5 flex items-center justify-between gap-2 text-left transition-colors cursor-pointer group"
        >
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <UtensilsCrossed
              className="w-4 h-4 text-[#F77F00] shrink-0 mt-0.5"
              strokeWidth={2.2}
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-[13px] font-bold text-white leading-tight truncate">
                Refeição livre
              </h3>
              <p className="text-[11px] text-amber-400 font-medium truncate mt-1">
                1x por semana
              </p>
              <p className="text-[10px] text-zinc-400 truncate mt-0.5">
                Sábado · 1.500 kcal
              </p>
            </div>
          </div>

          <ChevronRight className="w-4 h-4 text-[#F77F00] shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Bloco Notas (lado direito) */}
        {ptNote && (
          <button
            type="button"
            onClick={() => setIsNotesOpen(true)}
            className="min-h-[78px] rounded-[20px] bg-[#0a0a0a] hover:bg-zinc-900/60 border border-zinc-800/80 hover:border-[#F77F00]/50 px-3.5 py-3.5 flex items-center justify-between gap-2 text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-start gap-2.5 min-w-0 flex-1">
              <FileText
                className="w-4 h-4 text-[#F77F00] shrink-0 mt-0.5"
                strokeWidth={2.2}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-[13px] font-bold text-white leading-tight truncate">
                    Notas
                  </h3>
                  {hasAttachments && (
                    <Paperclip
                      className="w-3 h-3 text-zinc-400 group-hover:text-[#F77F00] shrink-0 transition-colors"
                      strokeWidth={2}
                      aria-label="Contém anexo"
                    />
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-snug">
                  {ptNote.message}
                </p>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-[#F77F00] shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>
      </div>

      {/* SHEET DE DETALHE: REFEIÇÃO LIVRE */}
      {isFreeMealOpen &&
        createPortal(
          <div
            className="fixed sm:absolute inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
            onClick={() => setIsFreeMealOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111111] border border-zinc-800 rounded-t-[28px] sm:rounded-[24px] w-full max-w-[420px] max-h-[85dvh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200 overflow-hidden"
            >
              {/* Cabeçalho */}
              <div className="px-5 pt-4 pb-3 border-b border-zinc-800/80 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <UtensilsCrossed className="w-5 h-5 text-[#F77F00]" />
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Refeição Livre
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFreeMealOpen(false)}
                  aria-label="Fechar"
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Conteúdo */}
              <div className="p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-4 overflow-y-auto hide-scrollbar">
                <div className="rounded-2xl bg-[#0a0a0a] border border-zinc-800/80 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-400" />
                      Frequência
                    </span>
                    <span className="text-white font-semibold">1x por semana</span>
                  </div>

                  <div className="h-[1px] bg-zinc-800/70" />

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 flex items-center gap-2">
                      <Moon className="w-4 h-4 text-sky-400" />
                      Dia sugerido
                    </span>
                    <span className="text-white font-semibold">Sábado à noite</span>
                  </div>

                  <div className="h-[1px] bg-zinc-800/70" />

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 flex items-center gap-2">
                      <Flame className="w-4 h-4 text-[#F77F00]" />
                      Referência calórica
                    </span>
                    <span className="text-[#F77F00] font-bold">~1.500 kcal</span>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#0a0a0a] border border-zinc-800/80 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                    Indicação do PT
                  </p>
                  <p className="text-xs text-zinc-200 leading-relaxed">
                    Mantém as restantes refeições do dia dentro do plano, prioriza proteína ao longo do dia e reforça a hidratação. Aproveita sem culpa!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFreeMealOpen(false)}
                  style={{ color: '#ffffff' }}
                  className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#F77F00] hover:bg-[#e57300] text-xs font-bold transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>,
          document.querySelector('.app-device-wrapper') || document.body
        )}

      {/* SHEET DE LEITURA DA NOTA DO PT */}
      {isNotesOpen &&
        ptNote &&
        createPortal(
          <div
            className="fixed sm:absolute inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
            onClick={() => setIsNotesOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111111] border border-zinc-800 rounded-t-[28px] sm:rounded-[24px] w-full max-w-[420px] max-h-[85dvh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200 overflow-hidden"
            >
              {/* Cabeçalho */}
              <div className="px-5 pt-4 pb-3 border-b border-zinc-800/80 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-[#F77F00]" />
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Notas
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setIsNotesOpen(false)}
                  aria-label="Fechar"
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mensagem do PT (apenas leitura) */}
              <div className="p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-4 overflow-y-auto hide-scrollbar">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span className="font-semibold text-white">{ptNote.author}</span>
                  <span aria-hidden="true">·</span>
                  <span>{ptNote.updatedAt}</span>
                </div>

                <div className="rounded-2xl bg-[#0a0a0a] border border-zinc-800/80 p-4">
                  <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
                    {ptNote.message}
                  </p>
                </div>

                {ptNote.attachments && ptNote.attachments.length > 0 && (
                  <div className="space-y-2">
                    {ptNote.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-[#0a0a0a] border border-zinc-800/80"
                      >
                        <Paperclip className="w-4 h-4 text-[#F77F00] shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-white truncate">
                            {att.name}
                          </p>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            {att.sizeLabel}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsNotesOpen(false)}
                  style={{ color: '#ffffff' }}
                  className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#F77F00] hover:bg-[#e57300] text-xs font-bold transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>,
          document.querySelector('.app-device-wrapper') || document.body
        )}
    </>
  );
}
