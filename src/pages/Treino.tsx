import React, { useState } from 'react';
import { 
  User, 
  ChevronDown, 
  Calendar, 
  Dumbbell, 
  CheckCircle2, 
  ChevronRight, 
  Clock, 
  Flame, 
  Activity, 
  Target,
  Bell,
  Trophy
} from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { useNotifications } from '../context/NotificationContext';
import { useCardio } from '../context/CardioContext';
import { RegistoCardio } from './RegistoCardio';
import { WorkoutDetailView } from './WorkoutDetailView';
import { WorkoutSessionActive } from './WorkoutSessionActive';
import { WorkoutSummaryView } from './WorkoutSummaryView';
import { PostWorkoutFeedbackView } from './PostWorkoutFeedbackView';
import { mockDetailedWorkouts, DetailedWorkout } from '../data/workoutsData';
import { useScrollToTop } from '../utils/scrollToTop';

export function Treino() {
  const { openProfile } = useProfile();
  const { openNotifications, totalUnreadCount } = useNotifications();
  const { weekMinutes, todayMinutes, sessions } = useCardio();
  const [showCardio, setShowCardio] = useState(false);
  
  // Navigation states
  const [selectedWorkoutDetail, setSelectedWorkoutDetail] = useState<DetailedWorkout | null>(null);
  const [activeRunningWorkout, setActiveRunningWorkout] = useState<DetailedWorkout | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [summaryFlowStep, setSummaryFlowStep] = useState<'summary' | 'feedback' | null>(null);

  useScrollToTop([
    selectedWorkoutDetail?.id,
    activeRunningWorkout?.id,
    summaryFlowStep,
    showCardio,
  ]);

  // Latest session metrics
  const latestSession = sessions[0];
  const displayCalories = latestSession ? latestSession.calories : 0;
  const displayBpm = latestSession ? latestSession.avgBpm : 0;
  const weeklyTarget = 150;
  const weeklyProgress = Math.min(Math.round((weekMinutes / weeklyTarget) * 12), 12);

  // Early returns AFTER all hooks are called
  if (summaryFlowStep === 'summary') {
    return (
      <WorkoutSummaryView 
        onDone={() => setSummaryFlowStep('feedback')} 
      />
    );
  }

  if (summaryFlowStep === 'feedback') {
    return (
      <PostWorkoutFeedbackView
        workoutName="Glúteo & Quads"
        onCancel={() => setSummaryFlowStep('summary')}
        onSubmit={() => {
          setSummaryFlowStep(null);
        }}
      />
    );
  }

  if (activeRunningWorkout) {
    return (
      <WorkoutSessionActive
        workout={activeRunningWorkout}
        onExit={() => setActiveRunningWorkout(null)}
        onFinish={() => {
          setActiveRunningWorkout(null);
          setSelectedWorkoutDetail(null);
        }}
        onUpdateWorkout={(updated) => {
          setActiveRunningWorkout(updated);
          setSelectedWorkoutDetail(updated);
        }}
      />
    );
  }

  if (selectedWorkoutDetail) {
    return (
      <WorkoutDetailView
        workout={selectedWorkoutDetail}
        onBack={() => setSelectedWorkoutDetail(null)}
        onStartWorkout={() => {
          setActiveRunningWorkout(selectedWorkoutDetail);
        }}
        onUpdateWorkout={(updated) => {
          setSelectedWorkoutDetail(updated);
        }}
      />
    );
  }

  if (showCardio) {
    return <RegistoCardio onBack={() => setShowCardio(false)} />;
  }

  // Plano de treinos por dia da semana
  const workoutsByDay: {
    day: string;
    dayNum: string;
    isCompleted?: boolean;
    workout: {
      name: string;
      exercisesCount: number;
      muscleGroups: string;
      image: string;
      isRest?: boolean;
    };
  }[] = [
    {
      day: 'SEG',
      dayNum: '22',
      isCompleted: true,
      workout: {
        name: 'Glúteo & Quads',
        exercisesCount: 5,
        muscleGroups: 'Glúteo Máximo, Médio e Quadríceps',
        image: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=600&auto=format&fit=crop'
      }
    },
    {
      day: 'TER',
      dayNum: '23',
      workout: {
        name: 'Superiores & Costas',
        exercisesCount: 6,
        muscleGroups: 'Dorsais, Deltoides e Bíceps',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop'
      }
    },
    {
      day: 'QUA',
      dayNum: '24',
      workout: {
        name: 'Descanso Ativo',
        exercisesCount: 0,
        muscleGroups: 'Alongamento & Mobilidade',
        image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop',
        isRest: true
      }
    },
    {
      day: 'QUI',
      dayNum: '25',
      workout: {
        name: 'Posteriores & Glúteo',
        exercisesCount: 6,
        muscleGroups: 'Isquiotibiais, Glúteo e Panturrilhas',
        image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600&auto=format&fit=crop'
      }
    },
    {
      day: 'SEX',
      dayNum: '26',
      workout: {
        name: 'Peito & Tríceps',
        exercisesCount: 5,
        muscleGroups: 'Peitoral, Tríceps e Ombro Anterior',
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop'
      }
    },
    {
      day: 'SÁB',
      dayNum: '27',
      workout: {
        name: 'Full Body & Core',
        exercisesCount: 7,
        muscleGroups: 'Corpo Inteiro, Abdómen e Lombar',
        image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?q=80&w=600&auto=format&fit=crop'
      }
    },
    {
      day: 'DOM',
      dayNum: '28',
      workout: {
        name: 'Descanso Total',
        exercisesCount: 0,
        muscleGroups: 'Recuperação Muscular',
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600&auto=format&fit=crop',
        isRest: true
      }
    }
  ];

  const activeWorkoutItem = workoutsByDay[selectedDayIndex];

  return (
    <div className="flex flex-col gap-4 px-5 pt-4 pb-10 animate-in fade-in zoom-in-95 duration-300">
      
      {/* HEADER */}
      <header className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-3">
          <img
            src="/assets/aistudio/9CF5FBD1-65BF-4557-BF19-1F1A5C3032B1_b4e3ad3d.PNG"
            alt="EVOLV"
            className="w-10 h-10 object-contain shrink-0"
          />
          <button className="flex items-center gap-1.5 group">
            <span className="text-white font-medium text-sm tracking-wide group-hover:text-zinc-200">Plano Treino Ginásio</span>
            <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
          </button>
        </div>

        <div className="flex gap-4">
          <button 
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
            onClick={openProfile}
            className="relative text-orange-500 transition-transform hover:scale-110 cursor-pointer" 
            aria-label="Perfil"
            title="Abrir Perfil"
          >
            <User className="w-[22px] h-[22px]" strokeWidth={2} />
          </button>
        </div>
      </header>

      {/* WEEK SELECTOR (CLICÁVEL) */}
      <div className="grid grid-cols-7 gap-1.5">
        {workoutsByDay.map((item, i) => {
          const isSelected = selectedDayIndex === i;
          return (
            <button 
              key={item.day}
              type="button"
              onClick={() => setSelectedDayIndex(i)}
              className={`flex flex-col items-center justify-center aspect-square w-full rounded-xl border transition-all cursor-pointer active:scale-95 ${
                isSelected 
                  ? 'bg-orange-500/10 border-orange-500 text-orange-500 shadow-sm shadow-orange-500/20 ring-1 ring-orange-500/30' 
                  : 'bg-transparent border-zinc-800/60 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
              }`}
            >
              <span className={`text-[10px] font-medium tracking-wider mb-0.5 ${isSelected ? 'text-white font-bold' : 'text-zinc-400'}`}>
                {item.day}
              </span>
              <span className={`text-[13px] font-semibold ${isSelected ? 'text-orange-500 font-bold' : 'text-zinc-500'}`}>
                {item.dayNum}
              </span>
            </button>
          );
        })}
      </div>

      {/* WORKOUT CARD DINÂMICO */}
      <div 
        key={selectedDayIndex}
        onClick={() => {
          const detailed = mockDetailedWorkouts[activeWorkoutItem.day] || mockDetailedWorkouts['SEG'];
          setSelectedWorkoutDetail(detailed);
        }}
        className="relative overflow-hidden rounded-[20px] bg-zinc-950 border border-zinc-800/60 h-[120px] mt-2 cursor-pointer group hover:border-orange-500/50 transition-all duration-300 animate-in fade-in zoom-in-98 active:scale-[0.99]"
      >
        <div 
          className="absolute inset-y-0 right-0 w-[65%] bg-contain bg-right bg-no-repeat z-0 opacity-100 transition-all duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url('${activeWorkoutItem.workout.image}')`, backgroundSize: '150%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/60 to-transparent z-0"></div>
        
        <div className="relative z-10 px-5 h-full flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-[17px] font-medium text-white tracking-wide uppercase">
              {activeWorkoutItem.workout.name}
            </h3>
            {activeWorkoutItem.isCompleted && (
              <CheckCircle2 className="w-[16px] h-[16px] text-orange-500 shrink-0" strokeWidth={2.5} />
            )}
          </div>
          <p className="text-orange-500 text-[11px] font-medium">
            {activeWorkoutItem.workout.isRest ? (
              <span>Recuperação Ativa</span>
            ) : (
              <span>{activeWorkoutItem.workout.exercisesCount} Exercícios • {activeWorkoutItem.workout.muscleGroups}</span>
            )}
          </p>
        </div>
      </div>

      {/* BOTÃO DISCRETO PARA VER RESUMO DO TREINO CONCLUÍDO */}
      {activeWorkoutItem.isCompleted && (
        <button
          type="button"
          onClick={() => setSummaryFlowStep('summary')}
          className="w-full -mt-2 py-2.5 px-4 rounded-xl bg-[#0c0c0c] border border-orange-500/30 hover:border-orange-500/60 text-xs font-semibold text-white flex items-center justify-between transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-zinc-300 group-hover:text-white transition-colors">Ver Resumo do Treino Concluído</span>
          </div>
          <ChevronRight className="w-4 h-4 text-orange-500 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* CARDIO SECTION */}
      <div 
        onClick={() => setShowCardio(true)}
        className="bg-[#0a0a0a] border border-zinc-800/60 hover:border-orange-500/50 rounded-[20px] p-5 flex flex-col cursor-pointer group transition-all duration-200"
      >
        <div className="flex items-center gap-5 mb-6">
          <div className="w-[60px] h-[60px] rounded-full border border-zinc-800 group-hover:border-orange-500/40 flex items-center justify-center shrink-0 transition-colors">
            <Activity className="w-7 h-7 text-orange-500" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <h4 className="text-[15px] font-medium text-white tracking-wider uppercase">Cardio</h4>
              <div className="flex items-center gap-1 text-orange-500 text-xs font-medium">
                <span>Registar</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
            <p className="text-zinc-400 text-xs font-normal mb-3">
              <span className="text-white font-medium">{weekMinutes}</span> / {weeklyTarget} min esta semana
            </p>
            {/* Dashed progress bar */}
            <div className="flex gap-1 h-1">
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i} 
                  className={`flex-1 rounded-full transition-colors ${
                    i < weeklyProgress ? 'bg-orange-500' : 'bg-zinc-800'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 pt-2">
          <div className="flex items-center gap-1.5">
            <Clock className="w-[18px] h-[18px] text-orange-500 shrink-0" strokeWidth={2} />
            <div>
              <p className="text-zinc-500 text-[9px] font-normal leading-none mb-0.5">Hoje</p>
              <p className="text-white text-[11px] font-medium leading-none">{todayMinutes} min</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame className="w-[18px] h-[18px] text-orange-500 shrink-0" strokeWidth={2} />
            <div>
              <p className="text-zinc-500 text-[9px] font-normal leading-none mb-0.5">Calorias</p>
              <p className="text-white text-[11px] font-medium leading-none">{displayCalories} kcal</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="w-[18px] h-[18px] text-orange-500 shrink-0" strokeWidth={2} />
            <div>
              <p className="text-zinc-500 text-[9px] font-normal leading-none mb-0.5">BPM médio</p>
              <p className="text-white text-[11px] font-medium leading-none">{displayBpm} bpm</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Target className="w-[18px] h-[18px] text-orange-500 shrink-0" strokeWidth={2} />
            <div>
              <p className="text-zinc-500 text-[9px] font-normal leading-none mb-0.5">Objetivo</p>
              <p className="text-white text-[11px] font-medium leading-none">{weeklyTarget} min</p>
            </div>
          </div>
        </div>
      </div>

      {/* NOTAS TREINO */}
      <div className="bg-[#0a0a0a] border border-zinc-800/60 rounded-[20px] p-5 flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <h4 className="text-[13px] font-medium text-white uppercase tracking-wider">Notas Treino</h4>
          <button className="flex items-center gap-1 border border-orange-500/30 text-orange-500 px-3 py-1 rounded-full hover:bg-orange-500/10 transition-colors">
            <span className="text-[10px] font-medium">Ver mais</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="flex flex-col">
          <div className="flex items-start gap-3 pb-4 border-b border-zinc-800/60">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 mt-1.5"></div>
            <div>
              <p className="text-xs font-medium text-white mb-1">3x semana 45' Bicicleta</p>
              <p className="text-[11px] text-zinc-500 font-normal leading-tight">Foco em resistência e cadência.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 pt-4">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 mt-1.5"></div>
            <div>
              <p className="text-xs font-medium text-white mb-1">2x Semana 30' Passadeira</p>
              <p className="text-[11px] text-zinc-500 font-normal leading-tight">Manter ritmo constante.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
