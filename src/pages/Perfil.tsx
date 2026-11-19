import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Settings as SettingsIcon, 
  LogOut, 
  Camera, 
  CreditCard, 
  CalendarDays, 
  FileSpreadsheet, 
  FileText, 
  HelpCircle, 
  Info, 
  ChevronRight, 
  Edit2, 
  Check, 
  Sparkles,
  RefreshCw,
  Activity,
  BookOpen,
  Gift,
  ClipboardList,
  HeartPulse,
  AlertCircle
} from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { AvatarPickerModal } from '../components/profile/AvatarPickerModal';
import { SettingsModal } from '../components/profile/SettingsModal';
import { LogoutModal } from '../components/profile/LogoutModal';
import { ReportProblemModal } from '../components/profile/ReportProblemModal';
import { SubscriptionView } from '../components/profile/SubscriptionView';
import { ClassesView } from '../components/profile/ClassesView';
import { ExamsView } from '../components/profile/ExamsView';
import { TermsView } from '../components/profile/TermsView';
import { ConteudoView } from '../components/profile/ConteudoView';
import { IndicarAmigoView } from '../components/profile/IndicarAmigoView';
import { RegistoSemanalView } from '../components/profile/RegistoSemanalView';
import { AvaliacaoFisicaView } from '../components/profile/AvaliacaoFisicaView';
import { useScrollToTop } from '../utils/scrollToTop';

interface PerfilProps {
  onBack: () => void;
}

type ProfileActiveView = 
  | 'main' 
  | 'subscription' 
  | 'classes' 
  | 'contents' 
  | 'referral' 
  | 'weekly_log' 
  | 'assessment' 
  | 'exams' 
  | 'terms';

export function Perfil({ onBack }: PerfilProps) {
  const { student, updateName, updateAvatar, isReferralActive, educationalContents } = useProfile();
  
  const [activeView, setActiveView] = useState<ProfileActiveView>('main');
  useScrollToTop([activeView]);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Inline name editing state
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(student.name);

  const handleSaveName = () => {
    if (tempName.trim()) {
      updateName(tempName.trim());
    }
    setIsEditingName(false);
  };

  // Check if there are new educational contents
  const hasNewContents = educationalContents.some(c => c.isNew);

  // Temporal progress calculations (out of 30-day billing/assessment cycle)
  const renewalPercent = Math.min(100, Math.max(0, Math.round(((30 - student.renewal.daysRemaining) / 30) * 100)));
  const assessmentPercent = Math.min(100, Math.max(0, Math.round(((30 - student.assessment.daysRemaining) / 30) * 100)));

  // Sub-views rendering
  if (activeView === 'subscription') {
    return <SubscriptionView onBack={() => setActiveView('main')} />;
  }

  if (activeView === 'classes') {
    return <ClassesView onBack={() => setActiveView('main')} />;
  }

  if (activeView === 'contents') {
    return <ConteudoView onBack={() => setActiveView('main')} />;
  }

  if (activeView === 'referral') {
    return <IndicarAmigoView onBack={() => setActiveView('main')} />;
  }

  if (activeView === 'weekly_log') {
    return <RegistoSemanalView onBack={() => setActiveView('main')} />;
  }

  if (activeView === 'assessment') {
    return <AvaliacaoFisicaView onBack={() => setActiveView('main')} />;
  }

  if (activeView === 'exams') {
    return <ExamsView onBack={() => setActiveView('main')} />;
  }

  if (activeView === 'terms') {
    return <TermsView onBack={() => setActiveView('main')} />;
  }

  return (
    <div className="flex flex-col px-5 pt-4 pb-12 animate-in fade-in zoom-in-95 duration-200">
      
      {/* 1. CABEÇALHO */}
      <header className="flex items-center justify-between mb-5">
        {/* Botão Voltar */}
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors cursor-pointer group"
          aria-label="Voltar"
        >
          <ChevronLeft className="w-5 h-5 text-orange-500 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-[13px] font-medium">Voltar</span>
        </button>

        {/* Título "Perfil" */}
        <h1 className="text-white text-base font-bold tracking-wide">Perfil</h1>

        {/* Acesso às Definições & Ação para Terminar Sessão */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-full text-zinc-400 hover:text-orange-500 hover:bg-zinc-800/60 transition-all cursor-pointer"
            aria-label="Definições"
            title="Definições"
          >
            <SettingsIcon className="w-[19px] h-[19px]" strokeWidth={2} />
          </button>
          
          <button
            onClick={() => setIsLogoutOpen(true)}
            className="p-2 rounded-full text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
            aria-label="Terminar Sessão"
            title="Terminar Sessão"
          >
            <LogOut className="w-[19px] h-[19px]" strokeWidth={2} />
          </button>
        </div>
      </header>

      {/* AVISO DE PLANO EXPIRADO (se simulado/expirado) */}
      {student.subscription.isExpiredSimulated && (
        <div className="mb-5 p-4 rounded-[20px] bg-red-500/15 border border-red-500/40 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3 min-w-0">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <div className="min-w-0">
              <span className="text-white text-xs font-bold block">Plano Expirado</span>
              <span className="text-zinc-300 text-[11px] truncate block">
                O teu acesso terminou a {student.subscription.accessUntil || '26 Novembro 2026'}.
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveView('subscription')}
            className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shrink-0 cursor-pointer shadow-md transition-colors"
          >
            Reativar
          </button>
        </div>
      )}

      {/* 2. INFORMAÇÃO DO ALUNO */}
      <div className="flex flex-col items-center text-center mb-6">
        {/* Avatar & Botão de Alterar Fotografia */}
        <div className="relative mb-3 group">
          <div className="w-24 h-24 rounded-full p-0.5 bg-gradient-to-tr from-orange-500 via-amber-500 to-orange-400 shadow-xl shadow-orange-500/15">
            <img
              src={student.avatarUrl}
              alt={student.name}
              className="w-full h-full rounded-full object-cover border-2 border-black"
            />
          </div>

          <button
            onClick={() => setIsAvatarModalOpen(true)}
            className="absolute bottom-0 right-0 p-2 rounded-full bg-orange-500 hover:bg-orange-400 text-white shadow-lg shadow-orange-500/30 transition-transform active:scale-90 cursor-pointer border-2 border-black"
            aria-label="Alterar Fotografia"
            title="Alterar Fotografia"
          >
            <Camera className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </button>
        </div>

        {/* Nome do Aluno */}
        <div className="flex items-center justify-center gap-1.5 mb-1">
          {isEditingName ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={tempName}
                onChange={e => setTempName(e.target.value)}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                className="bg-zinc-900 border border-orange-500 rounded-lg px-2.5 py-1 text-white text-base font-bold text-center focus:outline-none"
              />
              <button
                onClick={handleSaveName}
                className="p-1.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-white text-lg font-bold tracking-tight">{student.name}</h2>
              <button
                onClick={() => {
                  setTempName(student.name);
                  setIsEditingName(true);
                }}
                className="text-zinc-500 hover:text-orange-400 transition-colors p-1"
                aria-label="Editar Nome"
                title="Editar Nome"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </>
          )}
        </div>

        {/* Membro desde quando */}
        <p className="text-zinc-400 text-xs font-normal mb-1.5">
          Membro desde <span className="text-zinc-300 font-medium">{student.memberSince}</span>
        </p>

        {/* Badge de estatuto */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
          <span>Aluno {student.membershipId} • Plano Black</span>
        </div>
      </div>

      {/* 3. INDICADORES SUPERIORES COM PROGRESSO TEMPORAL */}
      <div className="mb-5">
        <h3 className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider mb-2 px-1">
          Resumo & Próximas Datas
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Indicador 1: Renovação */}
          <div className="bg-[#0a0a0a] rounded-[18px] p-3 border border-zinc-800/60 relative overflow-hidden flex flex-col justify-between hover:border-zinc-700/80 transition-colors group">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-zinc-400 text-[11px] font-medium">Renovação</span>
                <RefreshCw className="w-4 h-4 text-orange-500 shrink-0" />
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-white text-xl font-black tracking-tight leading-none">
                  {student.renewal.daysRemaining}
                </span>
                <span className="text-zinc-400 text-[11px]">dias</span>
              </div>
              <p className="text-orange-400 text-[10px] font-medium mt-0.5 leading-tight truncate">
                {student.renewal.date}
              </p>
            </div>

            {/* Temporal progress indicator */}
            <div className="mt-2 pt-1.5 border-t border-zinc-800/60">
              <div className="flex items-center justify-between text-[8px] text-zinc-500 mb-0.5">
                <span>Ciclo Mensal</span>
                <span className="font-mono">{renewalPercent}%</span>
              </div>
              <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-500"
                  style={{ width: `${renewalPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Indicador 2: Avaliação */}
          <div className="bg-[#0a0a0a] rounded-[18px] p-3 border border-zinc-800/60 relative overflow-hidden flex flex-col justify-between hover:border-zinc-700/80 transition-colors group">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-zinc-400 text-[11px] font-medium">Avaliação</span>
                <Activity className="w-4 h-4 text-orange-500 shrink-0" />
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-white text-xl font-black tracking-tight leading-none">
                  {student.assessment.daysRemaining}
                </span>
                <span className="text-zinc-400 text-[11px]">dias</span>
              </div>
              <p className="text-orange-400 text-[10px] font-medium mt-0.5 leading-tight truncate">
                {student.assessment.date}
              </p>
            </div>

            {/* Temporal progress indicator */}
            <div className="mt-2 pt-1.5 border-t border-zinc-800/60">
              <div className="flex items-center justify-between text-[8px] text-zinc-500 mb-0.5">
                <span>Intervalo Periódico</span>
                <span className="font-mono">{assessmentPercent}%</span>
              </div>
              <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${assessmentPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. SECÇÃO CONTA */}
      <div className="mb-6">
        <h3 className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider mb-2.5 px-1">
          Conta
        </h3>

        <div className="bg-[#0a0a0a] rounded-[22px] border border-zinc-800/60 overflow-hidden divide-y divide-zinc-900">
          
          {/* Subscrição */}
          <button
            onClick={() => setActiveView('subscription')}
            className="w-full flex items-center justify-between p-4 hover:bg-zinc-900/50 transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <CreditCard className="w-[18px] h-[18px] text-orange-500 shrink-0" />
              <div>
                <span className="text-white text-xs font-semibold block leading-tight">
                  Subscrição
                </span>
                <span className="text-zinc-400 text-[11px] mt-0.5 block">
                  {student.subscription.planName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {student.subscription.status === 'Cancelada' ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                  Cancelada
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Ativa
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-orange-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
            </div>
          </button>

          {/* Aulas */}
          <button
            onClick={() => setActiveView('classes')}
            className="w-full flex items-center justify-between p-4 hover:bg-zinc-900/50 transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <CalendarDays className="w-[18px] h-[18px] text-orange-500 shrink-0" />
              <div>
                <span className="text-white text-xs font-semibold block leading-tight">
                  Aulas
                </span>
                <span className="text-zinc-400 text-[11px] mt-0.5 block">
                  Aulas gravadas e programas
                </span>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-orange-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Conteúdos */}
          <button
            onClick={() => setActiveView('contents')}
            className="w-full flex items-center justify-between p-4 hover:bg-zinc-900/50 transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <BookOpen className="w-[18px] h-[18px] text-orange-500 shrink-0" />
              <div>
                <span className="text-white text-xs font-semibold block leading-tight">
                  Conteúdos
                </span>
                <span className="text-zinc-400 text-[11px] mt-0.5 block">
                  Dicas, ebooks e vídeos
                </span>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-orange-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Indicar um amigo */}
          <button
            onClick={() => setActiveView('referral')}
            className="w-full flex items-center justify-between p-4 hover:bg-zinc-900/50 transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <Gift className="w-[18px] h-[18px] text-orange-500 shrink-0" />
              <div>
                <span className="text-white text-xs font-semibold block leading-tight">
                  Indicar um amigo
                </span>
                <span className="text-zinc-400 text-[11px] mt-0.5 block">
                  Por email, WhatsApp ou link
                </span>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-orange-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
          </button>

        </div>
      </div>

      {/* 5. SECÇÃO ACOMPANHAMENTO */}
      <div className="mb-6">
        <h3 className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider mb-2.5 px-1">
          Acompanhamento
        </h3>

        <div className="bg-[#0a0a0a] rounded-[22px] border border-zinc-800/60 overflow-hidden divide-y divide-zinc-900">
          
          {/* Registo semanal */}
          <button
            onClick={() => setActiveView('weekly_log')}
            className="w-full flex items-center justify-between p-4 hover:bg-zinc-900/50 transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <ClipboardList className="w-[18px] h-[18px] text-orange-500 shrink-0" />
              <div>
                <span className="text-white text-xs font-semibold block leading-tight">
                  Registo semanal
                </span>
                <span className="text-zinc-400 text-[11px] mt-0.5 block">
                  Peso, sono, passos e água
                </span>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-orange-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Avaliação física */}
          <button
            onClick={() => setActiveView('assessment')}
            className="w-full flex items-center justify-between p-4 hover:bg-zinc-900/50 transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <HeartPulse className="w-[18px] h-[18px] text-orange-500 shrink-0" />
              <div>
                <span className="text-white text-xs font-semibold block leading-tight">
                  Avaliação física
                </span>
                <span className="text-zinc-400 text-[11px] mt-0.5 block">
                  Submeter nova avaliação
                </span>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-orange-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Exames */}
          <button
            onClick={() => setActiveView('exams')}
            className="w-full flex items-center justify-between p-4 hover:bg-zinc-900/50 transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <FileSpreadsheet className="w-[18px] h-[18px] text-orange-500 shrink-0" />
              <div>
                <span className="text-white text-xs font-semibold block leading-tight">
                  Exames
                </span>
                <span className="text-zinc-400 text-[11px] mt-0.5 block">
                  Resultados e histórico
                </span>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-orange-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
          </button>

        </div>
      </div>

      {/* 6. SECÇÃO SUPORTE */}
      <div className="mb-4">
        <h3 className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider mb-2.5 px-1">
          Suporte
        </h3>

        <div className="bg-[#0a0a0a] rounded-[22px] border border-zinc-800/60 overflow-hidden divide-y divide-zinc-900">
          
          {/* Configurações */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-zinc-900/50 transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <SettingsIcon className="w-[18px] h-[18px] text-zinc-400 shrink-0" />
              <div>
                <span className="text-white text-xs font-semibold block leading-tight">
                  Configurações
                </span>
                <span className="text-zinc-500 text-[11px] mt-0.5 block">
                  Aparência, zoom, idioma e unidades
                </span>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-orange-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Termos e condições */}
          <button
            onClick={() => setActiveView('terms')}
            className="w-full flex items-center justify-between p-4 hover:bg-zinc-900/50 transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <FileText className="w-[18px] h-[18px] text-zinc-400 shrink-0" />
              <div>
                <span className="text-white text-xs font-semibold block leading-tight">
                  Termos e condições
                </span>
                <span className="text-zinc-500 text-[11px] mt-0.5 block">
                  Regulamento do clube e privacidade
                </span>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-orange-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Reportar problema */}
          <button
            onClick={() => setIsReportOpen(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-zinc-900/50 transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <HelpCircle className="w-[18px] h-[18px] text-zinc-400 shrink-0" />
              <div>
                <span className="text-white text-xs font-semibold block leading-tight">
                  Reportar problema
                </span>
                <span className="text-zinc-500 text-[11px] mt-0.5 block">
                  Ajuda técnica e apoio ao aluno
                </span>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-orange-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* Versão da aplicação */}
          <div className="w-full flex items-center justify-between p-4 bg-zinc-950/40">
            <div className="flex items-center gap-3.5">
              <Info className="w-[18px] h-[18px] text-zinc-500 shrink-0" />
              <div>
                <span className="text-white text-xs font-semibold block leading-tight">
                  Versão da aplicação
                </span>
                <span className="text-zinc-500 text-[11px] mt-0.5 block">
                  Versão instalada
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-zinc-400 font-mono text-xs">v2.4.1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modais auxiliares */}
      <AvatarPickerModal
        currentAvatar={student.avatarUrl}
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onSelectAvatar={updateAvatar}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <LogoutModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
      />

      <ReportProblemModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
}
