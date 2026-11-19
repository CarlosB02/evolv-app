import React, { useState } from 'react';
import { 
  ChevronLeft, 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  X, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  Clock, 
  RotateCcw,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { useScrollToTop } from '../../utils/scrollToTop';

interface SubscriptionViewProps {
  onBack: () => void;
}

type SubScreenMode = 'overview' | 'cancel_confirm' | 'cancel_success';

const CANCELLATION_REASONS = [
  'Preço demasiado alto',
  'Já atingi o meu objetivo',
  'Falta de tempo',
  'Não gostei do acompanhamento',
  'Problemas com a app',
  'Vou treinar noutro sítio',
  'Problema de saúde / lesão',
  'Dificuldades financeiras',
  'Outro',
];

export function SubscriptionView({ onBack }: SubscriptionViewProps) {
  const { student, cancelSubscription, reactivateSubscription, toggleSimulateExpired } = useProfile();
  const sub = student.subscription;

  const [screenMode, setScreenMode] = useState<SubScreenMode>('overview');
  useScrollToTop([screenMode]);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [otherText, setOtherText] = useState('');
  const [errorText, setErrorText] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showPtDashboardPreview, setShowPtDashboardPreview] = useState(false);

  // Access until date
  const accessDate = sub.accessUntil || sub.nextBillingDate || '26 Novembro 2026';
  const startDate = sub.startDate || '26 Maio 2026';
  const paymentDisplay = sub.paymentMethod || 'Cartão •••• 4242';
  const valueDisplay = sub.price || '199 € / 6 meses';

  const isCancelled = sub.status === 'Cancelada';
  const isExpired = sub.isExpiredSimulated;

  // Toggle reason chip (tap again to unselect)
  const handleToggleReason = (reason: string) => {
    setErrorText(null);
    if (selectedReason === reason) {
      setSelectedReason(null);
      if (reason === 'Outro') {
        setOtherText('');
      }
    } else {
      setSelectedReason(reason);
    }
  };

  // Confirm cancellation
  const handleConfirmCancel = () => {
    // If "Outro" is selected, the text is mandatory
    if (selectedReason === 'Outro') {
      if (!otherText.trim()) {
        setErrorText('Escreve o motivo para continuar.');
        return;
      }
    }

    const reasonToSave = selectedReason || 'Não especificado';
    const notesToSave = selectedReason === 'Outro' ? otherText.trim() : '';

    cancelSubscription(reasonToSave, notesToSave);
    setScreenMode('cancel_success');
  };

  // Reactivate subscription
  const handleReactivate = () => {
    reactivateSubscription();
    setToastMessage('Subscrição reativada com sucesso');
    setScreenMode('overview');
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  /* -------------------------------------------------------------------------- */
  /* ECRÃ 3: DEPOIS DE CONFIRMAR O CANCELAMENTO                                  */
  /* -------------------------------------------------------------------------- */
  if (screenMode === 'cancel_success') {
    return (
      <div className="flex flex-col px-5 pt-6 pb-12 animate-in fade-in zoom-in-95 duration-200">
        {/* Toast feedback se houver */}
        {toastMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Ícone ✓ Verde */}
        <div className="flex flex-col items-center text-center mt-6 mb-8">
          <div className="w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-5 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <Check className="w-10 h-10 stroke-[2.5]" />
          </div>

          <h2 className="text-white text-2xl font-bold tracking-tight mb-2">
            Subscrição cancelada
          </h2>
          <p className="text-zinc-400 text-[13.5px] leading-relaxed max-w-[320px]">
            Manténs o acesso até <span className="text-white font-semibold">{accessDate}</span>. Não vais ser cobrado de novo.
          </p>
        </div>

        {/* Cartão Informativo de Resumo */}
        <div className="bg-[#0a0a0a] rounded-[20px] p-4 border border-zinc-800/80 mb-8 space-y-3">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-zinc-800/60">
            <span className="text-zinc-500">Plano</span>
            <span className="text-white font-semibold">{sub.planName}</span>
          </div>
          <div className="flex items-center justify-between text-xs pb-2 border-b border-zinc-800/60">
            <span className="text-zinc-500">Acesso até</span>
            <span className="text-orange-400 font-bold">{accessDate}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500">Próxima cobrança</span>
            <span className="text-zinc-400">Nenhuma (cancelada)</span>
          </div>
        </div>

        {/* Ações / Botões - Regra estrita: texto branco em todos os botões */}
        <div className="flex flex-col gap-3">
          {/* Reativar subscrição */}
          <button
            onClick={handleReactivate}
            className="w-full py-4 rounded-[16px] bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-[14px] flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] active:scale-[0.99] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-white" />
            <span className="text-white font-bold">Reativar subscrição</span>
          </button>

          {/* Voltar ao perfil */}
          <button
            onClick={onBack}
            className="w-full py-3.5 rounded-[16px] bg-[#121212] hover:bg-zinc-800 border border-zinc-800 text-white font-bold text-[13.5px] transition-colors cursor-pointer text-center"
          >
            <span className="text-white font-bold">Voltar ao perfil</span>
          </button>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* ECRÃ 2: ECRÃ CANCELAR SUBSCRIÇÃO                                           */
  /* -------------------------------------------------------------------------- */
  if (screenMode === 'cancel_confirm') {
    return (
      <div className="flex flex-col px-5 pt-4 pb-12 animate-in fade-in zoom-in-95 duration-200">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => setScreenMode('overview')}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer group"
          >
            <ChevronLeft className="w-5 h-5 text-orange-500 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-[13px] font-medium">Voltar</span>
          </button>
          <span className="text-zinc-500 text-xs font-mono">Cancelar Subscrição</span>
        </div>

        {/* Título & Texto */}
        <div className="mb-5">
          <h2 className="text-white text-2xl font-bold tracking-tight mb-2">
            Queres mesmo cancelar?
          </h2>
          <p className="text-zinc-400 text-[13px] leading-relaxed">
            A subscrição deixa de renovar. Manténs o acesso até <span className="text-white font-semibold">{accessDate}</span> e não há novas cobranças.
          </p>
        </div>

        {/* Lista do que perde depois dessa data (com ✕) */}
        <div className="bg-[#0a0a0a] rounded-[20px] p-4 border border-zinc-800/80 mb-6">
          <h3 className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-3">
            O que perdes depois de {accessDate}:
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-zinc-300 text-[13px]">
              <div className="w-5 h-5 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <X className="w-3.5 h-3.5 text-red-400 stroke-[2.5]" />
              </div>
              <span className="leading-snug">Planos de treino e alimentação</span>
            </div>

            <div className="flex items-start gap-3 text-zinc-300 text-[13px]">
              <div className="w-5 h-5 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <X className="w-3.5 h-3.5 text-red-400 stroke-[2.5]" />
              </div>
              <span className="leading-snug">Chat com o treinador</span>
            </div>

            <div className="flex items-start gap-3 text-zinc-300 text-[13px]">
              <div className="w-5 h-5 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <X className="w-3.5 h-3.5 text-red-400 stroke-[2.5]" />
              </div>
              <span className="leading-snug">Registos, avaliações e comunidade</span>
            </div>
          </div>
        </div>

        {/* Motivo de Cancelamento - Chips de seleção única */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white text-[13.5px] font-semibold">
              Porquê? <span className="text-zinc-500 font-normal text-xs">(opcional)</span>
            </h3>
            {selectedReason && (
              <span className="text-zinc-500 text-[11px]">Toca para desmarcar</span>
            )}
          </div>

          {/* Chips */}
          <div className="flex flex-wrap gap-2 mb-3">
            {CANCELLATION_REASONS.map((reason) => {
              const isSelected = selectedReason === reason;
              return (
                <button
                  key={reason}
                  type="button"
                  onClick={() => handleToggleReason(reason)}
                  className={`px-3.5 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-orange-500 text-white font-bold border border-orange-500 shadow-sm shadow-orange-500/20'
                      : 'bg-[#121212] border border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white'
                  }`}
                >
                  {reason}
                </button>
              );
            })}
          </div>

          {/* Se escolheu "Outro": caixa de texto com 300 caracteres, obrigatória */}
          {selectedReason === 'Outro' && (
            <div className="mt-3 p-3.5 rounded-[18px] bg-[#0d0d0d] border border-zinc-800/90 animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-zinc-300 text-xs font-semibold">
                  Explica-nos o motivo <span className="text-red-400">*</span>
                </label>
                <span className={`text-[11px] font-mono ${otherText.length >= 300 ? 'text-red-400 font-bold' : 'text-zinc-500'}`}>
                  {otherText.length}/300
                </span>
              </div>
              <textarea
                value={otherText}
                maxLength={300}
                onChange={(e) => {
                  setOtherText(e.target.value);
                  if (errorText) setErrorText(null);
                }}
                rows={3}
                placeholder="Partilha connosco o que te levou a cancelar..."
                className="w-full bg-black border border-zinc-800 focus:border-orange-500/60 rounded-[12px] p-3 text-white text-[13px] outline-none resize-none transition-colors placeholder:text-zinc-600"
              />
              {errorText && (
                <p className="text-red-400 text-xs font-semibold mt-1.5 flex items-center gap-1.5 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                  <span>{errorText}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Botões de Ação com texto branco */}
        <div className="flex flex-col gap-3 mt-2">
          {/* Confirmar cancelamento (contorno vermelho, texto branco) */}
          <button
            onClick={handleConfirmCancel}
            className="w-full py-3.5 rounded-[16px] border border-red-500/70 bg-red-500/10 hover:bg-red-500/20 text-white font-bold text-[14px] flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span className="text-white font-bold">Confirmar cancelamento</span>
          </button>

          {/* Manter subscrição (contorno laranja, volta ao Perfil/Subscrição sem alterar nada) */}
          <button
            onClick={() => setScreenMode('overview')}
            className="w-full py-3.5 rounded-[16px] border border-orange-500/70 bg-orange-500/10 hover:bg-orange-500/20 text-white font-bold text-[14px] flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span className="text-white font-bold">Manter subscrição</span>
          </button>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* ECRÃ 1: ECRÃ SUBSCRIÇÃO PRINCIPAL (DENTRO DO PERFIL)                        */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="flex flex-col px-5 pt-4 pb-14 animate-in fade-in zoom-in-95 duration-200">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="mb-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* AVISO DE PLANO EXPIRADO (se data estiver expirada) */}
      {isExpired && (
        <div className="mb-5 p-4 rounded-[20px] bg-red-500/15 border border-red-500/40 flex flex-col gap-2.5 animate-in shake duration-300">
          <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
            <span>Plano Expirado</span>
          </div>
          <p className="text-zinc-300 text-xs leading-relaxed">
            O teu período de acesso terminou a <strong className="text-white">{accessDate}</strong>. Reativa a tua subscrição para recuperares acesso aos treinos, dieta e chat com o teu treinador.
          </p>
          <button
            onClick={handleReactivate}
            className="mt-1 w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md"
          >
            <RotateCcw className="w-3.5 h-3.5 text-white" />
            <span className="text-white font-bold">Reativar agora</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer group"
        >
          <ChevronLeft className="w-5 h-5 text-orange-500 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-[13px] font-medium">Voltar ao Perfil</span>
        </button>
        <span className="text-zinc-500 text-xs font-mono">Conta • Subscrição</span>
      </div>

      <div className="mb-4">
        <h2 className="text-white text-xl font-bold tracking-tight">A Tua Subscrição</h2>
        <p className="text-zinc-400 text-xs mt-0.5">
          Gere o teu plano, método de faturação e estado do acompanhamento.
        </p>
      </div>

      {/* 1. CARTÃO COM O NOME DO PLANO E A ETIQUETA DE ESTADO (Ativa ou Cancelada) */}
      <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[#161616] via-[#0f0f0f] to-black border border-zinc-800 p-5 mb-5 shadow-xl">
        <div className="absolute top-0 right-0 w-36 h-36 bg-orange-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

        <div className="flex items-start justify-between relative z-10 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30">
                Plano
              </span>

              {/* Etiqueta de estado: Ativa ou Cancelada */}
              {isCancelled ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  Cancelada
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Ativa
                </span>
              )}
            </div>

            <h3 className="text-white text-2xl font-black italic tracking-tight">
              {sub.planName}
            </h3>
          </div>
        </div>

        {/* 2. LINHAS: Valor, Próxima cobrança (ou Acesso até se cancelada), Pagamento e Início */}
        <div className="divide-y divide-zinc-800/80 pt-1 border-t border-zinc-800/80 mb-2">
          {/* Valor */}
          <div className="py-2.5 flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">Valor</span>
            <span className="text-white font-bold">{valueDisplay}</span>
          </div>

          {/* Próxima cobrança (se cancelada, passa a "Acesso até") */}
          <div className="py-2.5 flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">
              {isCancelled ? 'Acesso até' : 'Próxima cobrança'}
            </span>
            <span className={`font-bold flex items-center gap-1.5 ${isCancelled ? 'text-orange-400' : 'text-white'}`}>
              <Calendar className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              {accessDate}
            </span>
          </div>

          {/* Pagamento */}
          <div className="py-2.5 flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">Pagamento</span>
            <span className="text-white font-semibold flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              {paymentDisplay}
            </span>
          </div>

          {/* Início */}
          <div className="py-2.5 flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">Início</span>
            <span className="text-zinc-300 font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              {startDate}
            </span>
          </div>
        </div>
      </div>

      {/* 3. BOTÕES E NOTAS CONFORME O ESTADO DA SUBSCRIÇÃO */}
      <div className="mb-6">
        {!isCancelled ? (
          /* COM A SUBSCRIÇÃO ATIVA */
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                setErrorText(null);
                setScreenMode('cancel_confirm');
              }}
              className="w-full py-3.5 rounded-[16px] border border-red-500/70 bg-red-500/10 hover:bg-red-500/20 text-white font-bold text-[14px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-[0.99]"
            >
              <span className="text-white font-bold">Cancelar subscrição</span>
            </button>
            <p className="text-zinc-400 text-xs text-center px-2 leading-relaxed">
              Podes cancelar quando quiseres. Manténs o acesso até ao fim do período já pago.
            </p>
          </div>
        ) : (
          /* COM A SUBSCRIÇÃO CANCELADA */
          <div className="flex flex-col gap-2">
            <button
              onClick={handleReactivate}
              className="w-full py-4 rounded-[16px] bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-[14px] flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] active:scale-[0.99] cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-white" />
              <span className="text-white font-bold">Reativar subscrição</span>
            </button>
            <p className="text-zinc-400 text-xs text-center px-2 leading-relaxed">
              A subscrição não vai renovar. Podes reativá-la até {accessDate}.
            </p>
          </div>
        )}
      </div>

      {/* 4. DASHBOARD DO TREINADOR: VISTA DO REGISTO DE CANCELAMENTO */}
      {isCancelled && (
        <div className="bg-[#0a0a0a] rounded-[20px] p-4 border border-zinc-800/80 mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-orange-500" />
              <h4 className="text-white text-xs font-semibold uppercase tracking-wider">
                Registo no Dashboard do Treinador
              </h4>
            </div>
            <button
              onClick={() => setShowPtDashboardPreview(!showPtDashboardPreview)}
              className="text-orange-400 text-xs font-medium hover:underline cursor-pointer"
            >
              {showPtDashboardPreview ? 'Ocultar' : 'Ver Registo'}
            </button>
          </div>

          <p className="text-zinc-400 text-xs leading-relaxed mb-3">
            O motivo de cancelamento foi registado no sistema de gestão do PT para acompanhamento e análise de retenção.
          </p>

          {showPtDashboardPreview && (
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-2 animate-in fade-in duration-200">
              <div className="flex justify-between text-zinc-400">
                <span>Aluno:</span>
                <span className="text-white font-semibold">{student.name}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Estado:</span>
                <span className="text-red-400 font-bold">Cancelada</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Acesso até:</span>
                <span className="text-zinc-200">{accessDate}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Data do pedido:</span>
                <span className="text-zinc-200">{sub.cancelledAt || 'Hoje'}</span>
              </div>
              <div className="pt-2 border-t border-zinc-800/80">
                <span className="text-zinc-400 block mb-1">Motivo registado:</span>
                <span className="inline-block px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-400 font-semibold border border-orange-500/20">
                  {sub.cancellationReason || 'Não especificado'}
                </span>
                {sub.cancellationNotes && (
                  <p className="text-zinc-300 mt-2 bg-black/60 p-2 rounded-lg border border-zinc-800/60 italic">
                    "{sub.cancellationNotes}"
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. FERRAMENTA DE TESTE: SIMULAÇÃO DE DATA EXPIRADA */}
      <div className="p-4 rounded-[20px] bg-[#0c0c0c] border border-zinc-800/70 mb-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-zinc-300 text-xs font-semibold block">
              Simulador de Teste
            </span>
            <span className="text-zinc-500 text-[11px] block mt-0.5">
              Testar aviso de plano expirado (após {accessDate})
            </span>
          </div>
          <button
            onClick={toggleSimulateExpired}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer text-white ${
              isExpired 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-zinc-800 hover:bg-zinc-700'
            }`}
          >
            {isExpired ? 'Expirado (Ativo)' : 'Normal'}
          </button>
        </div>
      </div>

      {/* 6. NOTA DE SEGURANÇA */}
      <div className="p-3.5 rounded-xl bg-zinc-900/30 border border-zinc-800/40 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
        <p className="text-zinc-500 text-[11px] leading-relaxed">
          Os pagamentos e cancelamentos são geridos com conformidade RGPD e encriptação bancária. Não existem fidelizações forçadas nem taxas de cancelamento.
        </p>
      </div>
    </div>
  );
}
