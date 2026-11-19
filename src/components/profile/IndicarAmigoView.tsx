import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Gift, 
  Copy, 
  Check, 
  Share2, 
  Send, 
  Users, 
  Award, 
  Sparkles, 
  MessageCircle, 
  Mail, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';

interface IndicarAmigoViewProps {
  onBack: () => void;
}

export function IndicarAmigoView({ onBack }: IndicarAmigoViewProps) {
  const { 
    student, 
    isReferralActive, 
    setIsReferralActive, 
    referralInvites, 
    addReferralInvite 
  } = useProfile();

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [friendName, setFriendName] = useState('');
  const [friendContact, setFriendContact] = useState('');
  const [customGreeting, setCustomGreeting] = useState('');
  const [sendSuccess, setSendSuccess] = useState(false);

  // Referral code & URL
  const referralCode = `RTEAM-${student.membershipId || 'P1-8429'}`;
  const inviteUrl = `https://rteam.club/convite/${student.name.toLowerCase().replace(/\s+/g, '-')}`;

  // Personalized message template
  const dynamicGreeting = customGreeting.trim() || 'Olá!';
  const personalizedMessage = `${dynamicGreeting} ${friendName ? friendName + ', ' : ''}estou a treinar na RTEAM com plano personalizado e resultados brutais! Junta-te a mim e ganhas 15% de desconto na inscrição através do meu link exclusivo: ${inviteUrl} (Código: ${referralCode}). Vamos treinar juntos!`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyMessage = () => {
    navigator.clipboard?.writeText(personalizedMessage);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(personalizedMessage);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent('Convite especial para treinares comigo na RTEAM!');
    const body = encodeURIComponent(personalizedMessage);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Convite RTEAM',
          text: personalizedMessage,
          url: inviteUrl,
        });
      } catch (err) {
        // User cancelled or unsupported
      }
    } else {
      handleCopyLink();
    }
  };

  const handleSendInviteForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendName.trim()) return;

    addReferralInvite(friendName.trim(), friendContact.trim() || 'Partilha direta');
    setSendSuccess(true);
    setFriendName('');
    setFriendContact('');
    setTimeout(() => setSendSuccess(false), 3000);
  };

  // Metrics summary
  const totalInvites = referralInvites.length;
  const joinedCount = referralInvites.filter(i => i.status === 'Aderiu' || i.status === 'Recompensa Atribuída').length;
  const rewardsClaimedCount = referralInvites.filter(i => i.status === 'Recompensa Atribuída').length;

  return (
    <div className="flex flex-col px-5 pt-4 pb-12 animate-in fade-in zoom-in-95 duration-200">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer group"
        >
          <ChevronLeft className="w-5 h-5 text-orange-500 group-hover:-translate-x-0.5 transition-transform" />
          <span className="text-[13px] font-medium">Voltar ao Perfil</span>
        </button>
        <span className="text-zinc-500 text-xs font-mono">Conta • Referências</span>
      </div>

      <div className="mb-4">
        <h2 className="text-white text-xl font-bold tracking-tight">Indicar um Amigo</h2>
        <p className="text-zinc-400 text-xs mt-0.5">
          Traz os teus parceiros de treino para a RTEAM e ganha benefícios exclusivos.
        </p>
      </div>

      {/* Program Active Banner / Toggle */}
      <div className="p-3.5 rounded-2xl bg-[#0a0a0a] border border-zinc-800/80 mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
            <Gift className="w-4 h-4" />
          </div>
          <div>
            <span className="text-white text-xs font-bold block leading-tight">
              Programa de Recompensas RTEAM
            </span>
            <span className="text-zinc-500 text-[10px] block mt-0.5">
              {isReferralActive ? 'Ativo e com bónus de 15% em vigor' : 'Programa pausado temporariamente'}
            </span>
          </div>
        </div>

        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
          isReferralActive 
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' 
            : 'bg-zinc-800 border-zinc-700 text-zinc-400'
        }`}>
          {isReferralActive ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      {!isReferralActive ? (
        <div className="p-8 text-center bg-[#0a0a0a] rounded-2xl border border-zinc-800/60 my-4">
          <AlertCircle className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <p className="text-zinc-300 text-sm font-medium">Programa Temporariamente Indisponível</p>
          <p className="text-zinc-500 text-xs mt-1 mb-3">
            O programa de referências da equipa está a ser reestruturado pelo treinador.
          </p>
          <button
            onClick={() => setIsReferralActive(true)}
            className="py-2 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold cursor-pointer"
          >
            Reativar Programa
          </button>
        </div>
      ) : (
        <>
          {/* Reward Highlight Card */}
          <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[#18120b] via-[#111111] to-black border border-orange-500/30 p-5 mb-5 shadow-xl shadow-orange-500/5">
            <div className="absolute top-0 right-0 w-36 h-36 bg-orange-500/15 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Oferta RTEAM
                </span>
              </div>

              <h3 className="text-white text-lg font-black tracking-tight leading-snug mb-1">
                Ganha 15% de Desconto ou Vale de 20€
              </h3>
              <p className="text-zinc-300 text-xs leading-relaxed mb-4">
                Por cada amigo que se inscrever na RTEAM através do teu código, recebes <span className="text-orange-400 font-bold">15% de desconto direto</span> na tua próxima mensalidade e o teu amigo recebe isenção da taxa de inscrição!
              </p>

              {/* Accumulated Rewards Bar */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-800/80">
                <div className="bg-black/60 p-2.5 rounded-xl border border-zinc-800/60 text-center">
                  <span className="text-zinc-500 text-[10px] block">Convites</span>
                  <span className="text-white text-base font-bold mt-0.5 block">{totalInvites}</span>
                </div>
                <div className="bg-black/60 p-2.5 rounded-xl border border-zinc-800/60 text-center">
                  <span className="text-zinc-500 text-[10px] block">Aderiram</span>
                  <span className="text-orange-400 text-base font-bold mt-0.5 block">{joinedCount}</span>
                </div>
                <div className="bg-black/60 p-2.5 rounded-xl border border-zinc-800/60 text-center">
                  <span className="text-zinc-500 text-[10px] block">Recompensas</span>
                  <span className="text-emerald-400 text-base font-bold mt-0.5 block">{rewardsClaimedCount * 15}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* 1-Click Copy Personal Link & Share Buttons */}
          <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-zinc-800/70 mb-5">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-2">
              O Teu Link Pessoal de Convite
            </h4>

            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl p-1.5 pl-3 mb-3">
              <span className="text-zinc-300 font-mono text-xs truncate flex-1">
                {inviteUrl}
              </span>
              <button
                onClick={handleCopyLink}
                className="py-1.5 px-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-sm"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Link</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Share Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleWhatsAppShare}
                className="py-2.5 px-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={handleEmailShare}
                className="py-2.5 px-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email</span>
              </button>

              <button
                onClick={handleNativeShare}
                className="py-2.5 px-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Partilhar</span>
              </button>
            </div>
          </div>

          {/* Customizable Invitation Message */}
          <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-zinc-800/70 mb-5">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-2">
              Personalizar Mensagem de Convite
            </h4>

            {sendSuccess && (
              <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Convite registado com sucesso no teu histórico!</span>
              </div>
            )}

            <form onSubmit={handleSendInviteForm} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-zinc-400 text-[11px] font-medium block mb-1">
                    Nome do Amigo
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Pedro Santos"
                    value={friendName}
                    onChange={e => setFriendName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 text-[11px] font-medium block mb-1">
                    Saudação
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Olá bro! / Boas!"
                    value={customGreeting}
                    onChange={e => setCustomGreeting(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Live Preview of message */}
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">
                    Pré-visualização do Texto
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="text-orange-400 hover:text-orange-300 text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedMessage ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedMessage ? 'Copiada' : 'Copiar Texto'}</span>
                  </button>
                </div>
                <p className="text-zinc-300 text-xs leading-relaxed italic bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-800/50">
                  "{personalizedMessage}"
                </p>
              </div>

              <button
                type="submit"
                disabled={!friendName.trim()}
                className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/15 transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Registar Envio de Convite</span>
              </button>
            </form>
          </div>

          {/* Referral History List */}
          <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-zinc-800/70">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white text-xs font-bold uppercase tracking-wider">
                Histórico de Convites
              </h4>
              <span className="text-zinc-500 text-[11px] font-medium">
                {referralInvites.length} registados
              </span>
            </div>

            <div className="space-y-2.5">
              {referralInvites.map(item => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="text-white text-xs font-bold truncate">{item.name}</p>
                    <p className="text-zinc-500 text-[10px] truncate mt-0.5">
                      {item.phoneOrEmail} • {item.date}
                    </p>
                    {item.rewardEarned && (
                      <p className="text-orange-400 text-[10px] font-medium mt-0.5">
                        {item.rewardEarned}
                      </p>
                    )}
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 ${
                    item.status === 'Recompensa Atribuída'
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : item.status === 'Aderiu'
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

    </div>
  );
}
