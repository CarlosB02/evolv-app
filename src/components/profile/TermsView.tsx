import React from 'react';
import { ChevronLeft, ShieldCheck, FileText, CheckCircle } from 'lucide-react';

interface TermsViewProps {
  onBack: () => void;
}

export function TermsView({ onBack }: TermsViewProps) {
  return (
    <div className="flex flex-col px-5 pt-4 pb-12 animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer group"
        >
          <ChevronLeft className="w-5 h-5 text-orange-500 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-[13px] font-medium">Voltar ao Perfil</span>
        </button>
        <span className="text-zinc-500 text-xs font-mono">Suporte • Termos</span>
      </div>

      <div className="mb-4">
        <h2 className="text-white text-xl font-bold tracking-tight">Termos e Condições</h2>
        <p className="text-zinc-400 text-xs mt-0.5">
          Consulta os termos de adesão, regulamento interno e proteção de dados PR1ME.
        </p>
      </div>

      <div className="space-y-4">
        {/* Section 1 */}
        <div className="bg-[#0a0a0a] rounded-[20px] p-4.5 border border-zinc-800/60">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-orange-500" />
            <h3 className="text-white text-sm font-bold">1. Adesão e Condições Gerais</h3>
          </div>
          <p className="text-zinc-400 text-xs leading-relaxed">
            A adesão ao clube PR1ME confere ao titular o direito de acesso e utilização das instalações de treino, balneários e áreas comuns, de acordo com o plano contratado. A utilização dos serviços requer validação digital via app ou pulseira de acesso.
          </p>
        </div>

        {/* Section 2 */}
        <div className="bg-[#0a0a0a] rounded-[20px] p-4.5 border border-zinc-800/60">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-orange-500" />
            <h3 className="text-white text-sm font-bold">2. Normas de Utilização e Higiene</h3>
          </div>
          <p className="text-zinc-400 text-xs leading-relaxed space-y-1">
            É obrigatório o uso de toalha durante a utilização dos aparelhos, bem como calçado e vestuário desportivo adequado. Os utilizadores devem desinfetar e arrumar os equipamentos e halteres nos suportes respetivos após a sua utilização.
          </p>
        </div>

        {/* Section 3 */}
        <div className="bg-[#0a0a0a] rounded-[20px] p-4.5 border border-zinc-800/60">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-orange-500" />
            <h3 className="text-white text-sm font-bold">3. Cancelamento e Trancamento</h3>
          </div>
          <p className="text-zinc-400 text-xs leading-relaxed">
            O plano pode ser cancelado ou suspenso temporariamente (por motivos médicos ou profissionais comprovados) mediante comunicação escrita com antecedência mínima de 15 dias relativamente à data de renovação da mensalidade.
          </p>
        </div>

        {/* Section 4 */}
        <div className="bg-[#0a0a0a] rounded-[20px] p-4.5 border border-zinc-800/60">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-orange-500" />
            <h3 className="text-white text-sm font-bold">4. Privacidade e RGPD</h3>
          </div>
          <p className="text-zinc-400 text-xs leading-relaxed">
            Os dados biométricos, dados de evolução física e informações de contacto são confidenciais e tratados em rigorosa conformidade com o Regulamento Geral sobre a Proteção de Dados (UE 2016/679).
          </p>
        </div>
      </div>
    </div>
  );
}
