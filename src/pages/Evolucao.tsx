import { useState } from 'react';
import { Bell, User } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { useNotifications } from '../context/NotificationContext';
import { PhysicalEvolutionTab } from '../components/evolution/PhysicalEvolutionTab';
import { PhysicalListTab } from '../components/evolution/PhysicalListTab';
import { PhysicalChartTab } from '../components/evolution/PhysicalChartTab';
import { TrainingEvolutionTab } from '../components/evolution/TrainingEvolutionTab';
import { WorkoutEvolutionTab } from '../components/evolution/WorkoutEvolutionTab';
import { useScrollToTop } from '../utils/scrollToTop';

type MainArea = 'avaliacoes' | 'treino';
type AssessmentSubTab = 'lista' | 'evolucao' | 'grafico';
type TrainingSubTab = 'treino' | 'exercicio';

export function Evolucao() {
  const { openProfile } = useProfile();
  const { openNotifications, totalUnreadCount } = useNotifications();
  const [activeArea, setActiveArea] = useState<MainArea>('avaliacoes');
  const [assessmentTab, setAssessmentTab] = useState<AssessmentSubTab>('evolucao');
  const [trainingTab, setTrainingTab] = useState<TrainingSubTab>('treino');

  useScrollToTop([activeArea, assessmentTab, trainingTab]);

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

      <div className="flex flex-col px-5 pt-4 pb-6 animate-in fade-in duration-200">

      {/* NAVEGAÇÃO PRINCIPAL: AVALIAÇÕES FÍSICAS vs TREINO */}
      <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#0a0a0a] border border-zinc-800/80 mb-3">
        <button
          type="button"
          onClick={() => setActiveArea('avaliacoes')}
          style={activeArea === 'avaliacoes' ? { color: '#ffffff' } : undefined}
          className={`min-h-[40px] py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeArea === 'avaliacoes'
              ? 'bg-[#F77F00] shadow-md shadow-orange-500/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Avaliações Físicas
        </button>

        <button
          type="button"
          onClick={() => setActiveArea('treino')}
          style={activeArea === 'treino' ? { color: '#ffffff' } : undefined}
          className={`min-h-[40px] py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeArea === 'treino'
              ? 'bg-[#F77F00] shadow-md shadow-orange-500/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          Treino
        </button>
      </div>

      {/* ÁREA: AVALIAÇÕES FÍSICAS */}
      {activeArea === 'avaliacoes' ? (
        <>
          {/* TABS DENTRO DE AVALIAÇÕES FÍSICAS: LISTA | EVOLUÇÃO | GRÁFICO */}
          <div className="grid grid-cols-3 border-b border-zinc-800/80 mb-4">
            {(
              [
                { id: 'lista', label: 'Lista' },
                { id: 'evolucao', label: 'Evolução' },
                { id: 'grafico', label: 'Gráfico' },
              ] as const
            ).map((tab) => {
              const isActive = assessmentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setAssessmentTab(tab.id)}
                  className={`min-h-[42px] py-2.5 text-xs font-bold relative transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'text-[#F77F00]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>{tab.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 inset-x-4 h-[2px] rounded-full bg-[#F77F00]" />
                  )}
                </button>
              );
            })}
          </div>

          {assessmentTab === 'evolucao' && <PhysicalEvolutionTab />}

          {assessmentTab === 'lista' && <PhysicalListTab />}

          {assessmentTab === 'grafico' && <PhysicalChartTab />}
        </>
      ) : (
        <>
          {/* TABS DENTRO DE TREINO: TREINO | EXERCÍCIO */}
          <div className="grid grid-cols-2 border-b border-zinc-800/80 mb-4">
            {(
              [
                { id: 'treino', label: 'Treino' },
                { id: 'exercicio', label: 'Exercício' },
              ] as const
            ).map((tab) => {
              const isActive = trainingTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTrainingTab(tab.id)}
                  className={`min-h-[42px] py-2.5 text-xs font-bold relative transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'text-[#F77F00]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <span>{tab.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 inset-x-4 h-[2px] rounded-full bg-[#F77F00]" />
                  )}
                </button>
              );
            })}
          </div>

          {trainingTab === 'treino' ? (
            <WorkoutEvolutionTab />
          ) : (
            <TrainingEvolutionTab />
          )}
        </>
      )}
      </div>
    </>
  );
}
