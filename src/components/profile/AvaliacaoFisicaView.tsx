import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Calendar, 
  Activity, 
  Scale, 
  Ruler, 
  Camera, 
  CheckCircle2, 
  Clock, 
  Upload, 
  Sparkles, 
  User, 
  ChevronRight, 
  Plus, 
  Eye, 
  Image as ImageIcon,
  MessageSquare
} from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { AssessmentSubmission } from '../../types';
import { useScrollToTop } from '../../utils/scrollToTop';

interface AvaliacaoFisicaViewProps {
  onBack: () => void;
}

export function AvaliacaoFisicaView({ onBack }: AvaliacaoFisicaViewProps) {
  const { student, assessmentSubmissions, addAssessmentSubmission, settings } = useProfile();
  
  const [activeTab, setActiveTab] = useState<'history' | 'new'>('history');
  useScrollToTop([activeTab]);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // New assessment form state
  const [weight, setWeight] = useState<number>(78.4);
  const [peito, setPeito] = useState<number>(104.5);
  const [braco, setBraco] = useState<number>(38.8);
  const [cintura, setCintura] = useState<number>(81.5);
  const [quadril, setQuadril] = useState<number>(97.5);
  const [coxa, setCoxa] = useState<number>(60.0);

  // Photos state (simulated URL strings)
  const [photoFront, setPhotoFront] = useState<string>(
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&auto=format&fit=crop&q=80'
  );
  const [photoBack, setPhotoBack] = useState<string>(
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&auto=format&fit=crop&q=80'
  );
  const [photoSide, setPhotoSide] = useState<string>(
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&auto=format&fit=crop&q=80'
  );

  // Questionnaire state
  const [energyLevel, setEnergyLevel] = useState<number>(4);
  const [muscleSoreness, setMuscleSoreness] = useState<'Baixa' | 'Média' | 'Alta'>('Média');
  const [dietCompliance, setDietCompliance] = useState<'100% à risca' | 'Maioritariamente' | 'Com deslizes'>('100% à risca');
  const [sleepRest, setSleepRest] = useState<'Muito reparador' | 'Aceitável' | 'Insuficiente'>('Muito reparador');
  const [notes, setNotes] = useState<string>('Senti grande progressão no peitoral e dorsal. Cargas no agachamento subiram com técnica consistente.');

  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAssessmentSubmission({
      date: 'Hoje (Submetido pelo Aluno)',
      trainer: student.assessment.trainer || 'Prof. André Silva',
      weight: Number(weight),
      measurements: {
        peito: Number(peito),
        braco: Number(braco),
        cintura: Number(cintura),
        quadril: Number(quadril),
        coxa: Number(coxa),
      },
      photos: {
        front: photoFront,
        back: photoBack,
        side: photoSide,
      },
      questionnaire: {
        energyLevel,
        muscleSoreness,
        dietCompliance,
        sleepRest,
        notes,
      },
    });

    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      setActiveTab('history');
    }, 2000);
  };

  const weightUnit = settings.weightUnit || 'Kg';

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
        <span className="text-zinc-500 text-xs font-mono">Acompanhamento • Avaliação</span>
      </div>

      <div className="mb-4">
        <h2 className="text-white text-xl font-bold tracking-tight">Avaliação Física</h2>
        <p className="text-zinc-400 text-xs mt-0.5">
          Consulta o histórico de medições e envia a tua autoavaliação com fotografias.
        </p>
      </div>

      {/* Tabs: Histórico vs Nova Avaliação */}
      <div className="flex p-1 rounded-xl bg-zinc-900 border border-zinc-800/80 mb-5">
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'history'
              ? 'bg-orange-500 text-white font-semibold shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Histórico & Próxima</span>
        </button>
        <button
          onClick={() => setActiveTab('new')}
          className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'new'
              ? 'bg-orange-500 text-white font-semibold shadow-md'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Submeter Avaliação</span>
        </button>
      </div>

      {submitSuccess && (
        <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5 animate-in zoom-in-95">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-bold">Avaliação submetida com sucesso!</p>
            <p className="text-[11px] text-emerald-300">O teu treinador foi notificado e analisará os dados.</p>
          </div>
        </div>
      )}

      {/* TAB 1: HISTÓRICO & PRÓXIMA AVALIAÇÃO */}
      {activeTab === 'history' && (
        <div className="space-y-5">
          
          {/* Card Próxima Avaliação Agendada */}
          <div className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[#18120b] via-[#111111] to-black border border-orange-500/30 p-4.5 shadow-xl shadow-orange-500/5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-500">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-orange-400">
                    Próxima Avaliação Oficial
                  </span>
                  <h3 className="text-white text-base font-bold">{student.assessment.date}</h3>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-orange-500 text-white shadow-sm">
                Faltam {student.assessment.daysRemaining} dias
              </span>
            </div>

            <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-zinc-500" />
                {student.assessment.trainer}
              </span>
              <span className="text-zinc-500 text-[11px]">{student.assessment.type}</span>
            </div>

            {/* Quick action button */}
            <button
              onClick={() => setActiveTab('new')}
              className="w-full mt-3.5 py-2.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Preencher Medidas & Fotos Agora</span>
            </button>
          </div>

          {/* Past Submissions / History */}
          <div>
            <div className="flex items-center justify-between mb-3 px-0.5">
              <h3 className="text-white text-xs font-bold uppercase tracking-wider">
                Histórico de Avaliações ({assessmentSubmissions.length})
              </h3>
              <span className="text-zinc-500 text-[11px]">Ordenado por data</span>
            </div>

            <div className="space-y-4">
              {assessmentSubmissions.map(item => (
                <div
                  key={item.id}
                  className="bg-[#0a0a0a] rounded-2xl p-4 border border-zinc-800/80 space-y-3.5"
                >
                  <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800/60">
                    <div>
                      <h4 className="text-white text-sm font-bold">{item.date}</h4>
                      <p className="text-zinc-500 text-[10px]">{item.trainer}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-orange-400 font-mono text-sm font-black">
                        {item.weight} {weightUnit}
                      </span>
                      <span className="text-zinc-500 text-[10px] block">Peso corporal</span>
                    </div>
                  </div>

                  {/* Measurements grid */}
                  <div>
                    <span className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider block mb-1.5">
                      Medidas Antropométricas (cm)
                    </span>
                    <div className="grid grid-cols-5 gap-1.5 text-center">
                      <div className="bg-zinc-900/70 p-1.5 rounded-lg border border-zinc-800/60">
                        <span className="text-zinc-500 text-[9px] block">Peito</span>
                        <span className="text-white text-xs font-bold">{item.measurements.peito}</span>
                      </div>
                      <div className="bg-zinc-900/70 p-1.5 rounded-lg border border-zinc-800/60">
                        <span className="text-zinc-500 text-[9px] block">Braço</span>
                        <span className="text-white text-xs font-bold">{item.measurements.braco}</span>
                      </div>
                      <div className="bg-zinc-900/70 p-1.5 rounded-lg border border-zinc-800/60">
                        <span className="text-zinc-500 text-[9px] block">Cintura</span>
                        <span className="text-white text-xs font-bold">{item.measurements.cintura}</span>
                      </div>
                      <div className="bg-zinc-900/70 p-1.5 rounded-lg border border-zinc-800/60">
                        <span className="text-zinc-500 text-[9px] block">Quadril</span>
                        <span className="text-white text-xs font-bold">{item.measurements.quadril}</span>
                      </div>
                      <div className="bg-zinc-900/70 p-1.5 rounded-lg border border-zinc-800/60">
                        <span className="text-zinc-500 text-[9px] block">Coxa</span>
                        <span className="text-white text-xs font-bold">{item.measurements.coxa}</span>
                      </div>
                    </div>
                  </div>

                  {/* Photos thumbnail preview if present */}
                  {item.photos && (item.photos.front || item.photos.back || item.photos.side) && (
                    <div>
                      <span className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider block mb-1.5">
                        Fotos de Evolução
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {item.photos.front && (
                          <div 
                            onClick={() => setExpandedPhoto(item.photos.front!)}
                            className="relative h-24 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 cursor-pointer group"
                          >
                            <img src={item.photos.front} alt="Frente" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-zinc-300">
                              Frente
                            </span>
                          </div>
                        )}
                        {item.photos.back && (
                          <div 
                            onClick={() => setExpandedPhoto(item.photos.back!)}
                            className="relative h-24 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 cursor-pointer group"
                          >
                            <img src={item.photos.back} alt="Costas" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-zinc-300">
                              Costas
                            </span>
                          </div>
                        )}
                        {item.photos.side && (
                          <div 
                            onClick={() => setExpandedPhoto(item.photos.side!)}
                            className="relative h-24 rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 cursor-pointer group"
                          >
                            <img src={item.photos.side} alt="Perfil" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-zinc-300">
                              Perfil
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Questionnaire feedback */}
                  {item.questionnaire && (
                    <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/60 text-xs space-y-1">
                      <div className="flex items-center justify-between text-zinc-400">
                        <span>Energia: <strong className="text-white">{item.questionnaire.energyLevel}/5</strong></span>
                        <span>Dieta: <strong className="text-emerald-400">{item.questionnaire.dietCompliance}</strong></span>
                        <span>Sono: <strong className="text-blue-400">{item.questionnaire.sleepRest}</strong></span>
                      </div>
                      {item.questionnaire.notes && (
                        <p className="text-zinc-300 text-[11px] italic pt-1 border-t border-zinc-800/40">
                          "{item.questionnaire.notes}"
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: NOVA SUBMISSÃO PELO ALUNO */}
      {activeTab === 'new' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Section 1: Peso */}
          <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-zinc-800/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-orange-500" />
                <span className="text-white text-xs font-bold uppercase tracking-wider">
                  Peso Corporal Atual
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
                <input
                  type="number"
                  step="0.1"
                  required
                  value={weight}
                  onChange={e => setWeight(parseFloat(e.target.value) || 0)}
                  className="w-16 bg-transparent text-white text-base font-black text-right focus:outline-none"
                />
                <span className="text-zinc-400 text-xs font-bold">{weightUnit}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Medidas Corporais (cm) */}
          <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-zinc-800/80 space-y-3">
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-orange-500" />
              <span className="text-white text-xs font-bold uppercase tracking-wider">
                Medidas Corporais (em centímetros)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-zinc-400 text-[11px] font-medium block mb-1">Peito (Tórax)</label>
                <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2">
                  <input
                    type="number"
                    step="0.5"
                    value={peito}
                    onChange={e => setPeito(parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent text-white text-xs font-bold focus:outline-none"
                  />
                  <span className="text-zinc-500 text-xs">cm</span>
                </div>
              </div>

              <div>
                <label className="text-zinc-400 text-[11px] font-medium block mb-1">Braço (Contração)</label>
                <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2">
                  <input
                    type="number"
                    step="0.5"
                    value={braco}
                    onChange={e => setBraco(parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent text-white text-xs font-bold focus:outline-none"
                  />
                  <span className="text-zinc-500 text-xs">cm</span>
                </div>
              </div>

              <div>
                <label className="text-zinc-400 text-[11px] font-medium block mb-1">Cintura (Umbilical)</label>
                <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2">
                  <input
                    type="number"
                    step="0.5"
                    value={cintura}
                    onChange={e => setCintura(parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent text-white text-xs font-bold focus:outline-none"
                  />
                  <span className="text-zinc-500 text-xs">cm</span>
                </div>
              </div>

              <div>
                <label className="text-zinc-400 text-[11px] font-medium block mb-1">Quadril (Glúteo)</label>
                <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2">
                  <input
                    type="number"
                    step="0.5"
                    value={quadril}
                    onChange={e => setQuadril(parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent text-white text-xs font-bold focus:outline-none"
                  />
                  <span className="text-zinc-500 text-xs">cm</span>
                </div>
              </div>

              <div className="col-span-2">
                <label className="text-zinc-400 text-[11px] font-medium block mb-1">Coxa Medial</label>
                <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2">
                  <input
                    type="number"
                    step="0.5"
                    value={coxa}
                    onChange={e => setCoxa(parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent text-white text-xs font-bold focus:outline-none"
                  />
                  <span className="text-zinc-500 text-xs">cm</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Fotografias de Evolução */}
          <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-zinc-800/80 space-y-3">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-orange-500" />
              <span className="text-white text-xs font-bold uppercase tracking-wider">
                Fotografias de Evolução
              </span>
            </div>
            <p className="text-zinc-400 text-[11px]">
              Tira fotografias com boa iluminação e a mesma distância (frente, costas e perfil).
            </p>

            <div className="grid grid-cols-3 gap-2">
              {/* Frente */}
              <div className="relative rounded-xl overflow-hidden aspect-[3/4] bg-zinc-900 border border-zinc-800 group">
                <img src={photoFront} alt="Frente" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-between p-2">
                  <span className="text-[10px] text-white font-bold bg-black/60 px-1.5 py-0.5 rounded">
                    Frente
                  </span>
                  <button
                    type="button"
                    onClick={() => setExpandedPhoto(photoFront)}
                    className="p-1 rounded-full bg-orange-500 text-white cursor-pointer hover:scale-110 transition-transform"
                    title="Ver"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Costas */}
              <div className="relative rounded-xl overflow-hidden aspect-[3/4] bg-zinc-900 border border-zinc-800 group">
                <img src={photoBack} alt="Costas" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-between p-2">
                  <span className="text-[10px] text-white font-bold bg-black/60 px-1.5 py-0.5 rounded">
                    Costas
                  </span>
                  <button
                    type="button"
                    onClick={() => setExpandedPhoto(photoBack)}
                    className="p-1 rounded-full bg-orange-500 text-white cursor-pointer hover:scale-110 transition-transform"
                    title="Ver"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Perfil */}
              <div className="relative rounded-xl overflow-hidden aspect-[3/4] bg-zinc-900 border border-zinc-800 group">
                <img src={photoSide} alt="Perfil" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-between p-2">
                  <span className="text-[10px] text-white font-bold bg-black/60 px-1.5 py-0.5 rounded">
                    Perfil
                  </span>
                  <button
                    type="button"
                    onClick={() => setExpandedPhoto(photoSide)}
                    className="p-1 rounded-full bg-orange-500 text-white cursor-pointer hover:scale-110 transition-transform"
                    title="Ver"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Questionário de Avaliação */}
          <div className="bg-[#0a0a0a] rounded-2xl p-4 border border-zinc-800/80 space-y-3.5">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-orange-500" />
              <span className="text-white text-xs font-bold uppercase tracking-wider">
                Questionário de Sensações & Adesão
              </span>
            </div>

            {/* Energia 1-5 */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-zinc-400 text-xs font-medium">Nível Geral de Energia</span>
                <span className="text-orange-400 text-xs font-bold font-mono">{energyLevel} / 5</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setEnergyLevel(n)}
                    className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                      energyLevel === n
                        ? 'bg-orange-500 border-orange-500 text-white shadow-sm'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Adesão à Dieta */}
            <div>
              <span className="text-zinc-400 text-xs font-medium block mb-1.5">Adesão ao Plano Nutricional</span>
              <div className="grid grid-cols-3 gap-1.5">
                {(['100% à risca', 'Maioritariamente', 'Com deslizes'] as const).map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDietCompliance(d)}
                    className={`py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer truncate px-1 ${
                      dietCompliance === d
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Qualidade do Sono */}
            <div>
              <span className="text-zinc-400 text-xs font-medium block mb-1.5">Recuperação / Sono</span>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Muito reparador', 'Aceitável', 'Insuficiente'] as const).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSleepRest(s)}
                    className={`py-1.5 text-[10px] font-bold rounded-lg border transition-all cursor-pointer truncate px-1 ${
                      sleepRest === s
                        ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Notas adicionais */}
            <div>
              <label className="text-zinc-400 text-xs font-medium block mb-1">
                Observações para o Treinador
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Dores articulares, dúvidas sobre exercícios, objetivos para as próximas 4 semanas..."
                rows={3}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className="py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-medium text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Enviar Avaliação Completa</span>
            </button>
          </div>

        </form>
      )}

      {/* Expanded Photo Lightbox */}
      {expandedPhoto && (
        <div 
          onClick={() => setExpandedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer animate-in fade-in"
        >
          <div className="max-w-[90vw] max-h-[85vh] rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl relative">
            <img src={expandedPhoto} alt="Foto Ampliada" className="w-full h-full object-contain" />
          </div>
        </div>
      )}

    </div>
  );
}
