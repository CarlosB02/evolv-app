import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronLeft,
  ArrowLeftRight,
  Dumbbell,
  Play,
  Maximize2,
  X,
  Volume2,
  VolumeX,
  RotateCcw,
} from 'lucide-react';
import { ExerciseItem, generateDefaultSets } from '../data/workoutsData';

interface HowToStep {
  step: number;
  title: string;
  description: string;
}

interface ExerciseAlternative {
  id: string;
  name: string;
  muscleTarget: string;
  equipment: string;
  series: number;
  reps: string;
  restSeconds: number;
  weightSuggestion: string;
  notes: string;
  image: string;
  videoUrl: string;
  howToExecute: HowToStep[];
}

interface ExerciseSwapPageProps {
  currentExercise: ExerciseItem;
  onBack: () => void;
  onSelectAlternative: (newExercise: ExerciseItem) => void;
}

const SAMPLE_VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
];

function getAlternativesForExercise(ex: ExerciseItem): ExerciseAlternative[] {
  const normalized = `${ex.name} ${ex.muscleTarget || ''}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  if (
    normalized.includes('bulgaro') ||
    normalized.includes('agachamento') ||
    normalized.includes('afundo') ||
    normalized.includes('passada')
  ) {
    return [
      {
        id: `${ex.id}-alt-1`,
        name: 'Afundo no Smith Machine',
        muscleTarget: 'Glúteo Máximo & Quadríceps',
        equipment: 'Smith Machine',
        series: ex.series,
        reps: ex.reps,
        restSeconds: ex.restSeconds || 60,
        weightSuggestion: '20–30 kg',
        notes: 'Controlar a descida e empurrar com o calcanhar da perna da frente.',
        image:
          'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
        videoUrl: SAMPLE_VIDEOS[0],
        howToExecute: [
          {
            step: 1,
            title: 'Posicionamento na barra',
            description:
              'Apoia a barra sobre os trapézios, coloca um pé ligeiramente à frente e o outro atrás em apoio na ponta do pé.',
          },
          {
            step: 2,
            title: 'Descida controlada',
            description:
              'Flete ambos os joelhos de forma suave até o joelho traseiro se aproximar do chão, mantendo o tronco estável.',
          },
          {
            step: 3,
            title: 'Subida e contração',
            description:
              'Empurra o chão pelo calcanhar da perna da frente até estender a anca sem bloquear totalmente o joelho.',
          },
        ],
      },
      {
        id: `${ex.id}-alt-2`,
        name: 'Step-Up Alto com Halteres',
        muscleTarget: 'Glúteo Máximo & Médio',
        equipment: 'Halteres + Caixa/Banco',
        series: ex.series,
        reps: ex.reps,
        restSeconds: ex.restSeconds || 60,
        weightSuggestion: '10–14 kg',
        notes: 'Empurrar com a perna elevada sem dar impulso com o pé de trás.',
        image:
          'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop',
        videoUrl: SAMPLE_VIDEOS[1],
        howToExecute: [
          {
            step: 1,
            title: 'Base firme na caixa',
            description:
              'Segura os halteres ao lado do corpo e coloca todo o pé da perna de trabalho em cima da caixa ou banco estável.',
          },
          {
            step: 2,
            title: 'Subida com foco no glúteo',
            description:
              'Inclina ligeiramente o tronco à frente e sobe fazendo força apenas com a perna elevada, sem impulsionar com a de baixo.',
          },
          {
            step: 3,
            title: 'Retorno lento',
            description:
              'Desce em 2 segundos controlando o alinhamento do joelho até tocar suavemente com o pé traseiro no solo.',
          },
        ],
      },
      {
        id: `${ex.id}-alt-3`,
        name: 'Agachamento Hack na Máquina',
        muscleTarget: 'Quadríceps & Glúteo',
        equipment: 'Máquina Hack Squat',
        series: ex.series,
        reps: ex.reps,
        restSeconds: ex.restSeconds || 75,
        weightSuggestion: '40–60 kg',
        notes: 'Manter costas e lombar totalmente apoiadas no encosto.',
        image:
          'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=800&auto=format&fit=crop',
        videoUrl: SAMPLE_VIDEOS[2],
        howToExecute: [
          {
            step: 1,
            title: 'Ajuste das costas e pés',
            description:
              'Encosta firmemente os ombros e a lombar no suporte, posicionando os pés à largura dos ombros na plataforma.',
          },
          {
            step: 2,
            title: 'Amplitude profunda',
            description:
              'Destrava a máquina e desce controladamente até ultrapassar os 90° de flexão dos joelhos sem descolar a bacia.',
          },
          {
            step: 3,
            title: 'Extensão forte',
            description:
              'Empurra a plataforma com toda a planta do pé mantendo tensão contínua no topo do movimento.',
          },
        ],
      },
    ];
  }

  if (
    normalized.includes('hip thrust') ||
    normalized.includes('glute') ||
    normalized.includes('abdutora')
  ) {
    return [
      {
        id: `${ex.id}-alt-1`,
        name: 'Hip Thrust na Máquina',
        muscleTarget: 'Glúteo Máximo',
        equipment: 'Máquina Glute Builder',
        series: ex.series,
        reps: ex.reps,
        restSeconds: ex.restSeconds || 90,
        weightSuggestion: '50–70 kg',
        notes: 'Segurar 1 segundo no pico de contração no topo.',
        image:
          'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
        videoUrl: SAMPLE_VIDEOS[0],
        howToExecute: [
          {
            step: 1,
            title: 'Ajuste do apoio e cinto',
            description:
              'Apoia as escápulas no encosto, ajusta o cinto sobre a linha da anca e posiciona os pés de forma que as canelas fiquem verticais no topo.',
          },
          {
            step: 2,
            title: 'Elevação da anca',
            description:
              'Empurra pelos calcanhares e eleva a bacia até alinhar joelhos, anca e ombros mantendo o queixo recolhido.',
          },
          {
            step: 3,
            title: 'Pausa e descida controlada',
            description:
              'Contrai fortemente os glúteos por 1 segundo no topo e desce de forma resistida sem bater os pesos.',
          },
        ],
      },
      {
        id: `${ex.id}-alt-2`,
        name: 'Elevação Pélvica Unilateral no Banco',
        muscleTarget: 'Glúteo Máximo & Médio',
        equipment: 'Halter + Banco',
        series: ex.series,
        reps: '10–12 cada lado',
        restSeconds: ex.restSeconds || 60,
        weightSuggestion: '16–24 kg',
        notes: 'Manter a bacia nivelada durante toda a subida.',
        image:
          'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop',
        videoUrl: SAMPLE_VIDEOS[1],
        howToExecute: [
          {
            step: 1,
            title: 'Apoio unilateral',
            description:
              'Apoia a parte superior das costas no banco, coloca o halter sobre a anca e retira um dos pés do solo.',
          },
          {
            step: 2,
            title: 'Extensão alinhada',
            description:
              'Sobe a bacia usando apenas a perna apoiada, mantendo ambos os lados da anca paralelos ao chão.',
          },
          {
            step: 3,
            title: 'Controlo excêntrico',
            description:
              'Desce devagar mantendo o abdómen ativo para não hiperestender a zona lombar.',
          },
        ],
      },
      {
        id: `${ex.id}-alt-3`,
        name: 'Extensão de Anca na Polia Baixa',
        muscleTarget: 'Glúteo Máximo',
        equipment: 'Polia Baixa + Tornozeleira',
        series: ex.series,
        reps: '12–15 cada lado',
        restSeconds: 45,
        weightSuggestion: '12–18 kg',
        notes: 'Estender a anca sem arquear a lombar.',
        image:
          'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=800&auto=format&fit=crop',
        videoUrl: SAMPLE_VIDEOS[2],
        howToExecute: [
          {
            step: 1,
            title: 'Fixação e postura',
            description:
              'Prende a tornozeleira na polia baixa, segura na estrutura da máquina e inclina o tronco a cerca de 30°.',
          },
          {
            step: 2,
            title: 'Extensão pura do glúteo',
            description:
              'Leva a perna para trás contraindo o glúteo, mantendo a coluna neutra e a pelve virada para a frente.',
          },
          {
            step: 3,
            title: 'Retorno sob tensão',
            description:
              'Regressa lentamente à posição inicial sem deixar as placas perderem tensão.',
          },
        ],
      },
    ];
  }

  if (normalized.includes('leg press') || normalized.includes('extensora')) {
    return [
      {
        id: `${ex.id}-alt-1`,
        name: 'Leg Press Horizontal',
        muscleTarget: 'Quadríceps & Glúteo',
        equipment: 'Máquina Leg Press Horizontal',
        series: ex.series,
        reps: ex.reps,
        restSeconds: ex.restSeconds || 60,
        weightSuggestion: '70–90 kg',
        notes: 'Não descolar a lombar do encosto durante a flexão.',
        image:
          'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
        videoUrl: SAMPLE_VIDEOS[0],
        howToExecute: [
          {
            step: 1,
            title: 'Ajuste do assento',
            description:
              'Regula a distância do banco para iniciar com boa flexão dos joelhos mantendo a lombar colada ao encosto.',
          },
          {
            step: 2,
            title: 'Empurrar com controlo',
            description:
              'Empurra a plataforma estendendo as pernas sem bloquear totalmente os joelhos no final.',
          },
          {
            step: 3,
            title: 'Retorno cadenciado',
            description:
              'Volta em 2 segundos mantendo os joelhos alinhados com a ponta dos pés.',
          },
        ],
      },
      {
        id: `${ex.id}-alt-2`,
        name: 'Agachamento Goblet com Halter',
        muscleTarget: 'Quadríceps',
        equipment: 'Halter',
        series: ex.series,
        reps: ex.reps,
        restSeconds: ex.restSeconds || 60,
        weightSuggestion: '18–26 kg',
        notes: 'Tronco direito e joelhos projetados na linha dos pés.',
        image:
          'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
        videoUrl: SAMPLE_VIDEOS[1],
        howToExecute: [
          {
            step: 1,
            title: 'Pega junto ao peito',
            description:
              'Segura o halter verticalmente junto ao esterno com os cotovelos apontados para baixo e pés à largura dos ombros.',
          },
          {
            step: 2,
            title: 'Descida vertical',
            description:
              'Agacha profundamente mantendo o peito aberto e os cotovelos a passar por dentro dos joelhos.',
          },
          {
            step: 3,
            title: 'Subida firme',
            description:
              'Empurra o solo com toda a planta do pé regressando à posição inicial com o core contraído.',
          },
        ],
      },
      {
        id: `${ex.id}-alt-3`,
        name: 'Sissy Squat Assistido',
        muscleTarget: 'Quadríceps Isolado',
        equipment: 'Apoio / Peso Corporal',
        series: ex.series,
        reps: '12–15',
        restSeconds: 45,
        weightSuggestion: '10 kg',
        notes: 'Projetar os joelhos à frente mantendo a anca estendida.',
        image:
          'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop',
        videoUrl: SAMPLE_VIDEOS[2],
        howToExecute: [
          {
            step: 1,
            title: 'Apoio lateral estável',
            description:
              'Segura num suporte fixo com uma mão, eleva os calcanhares e mantém o tronco e a anca numa linha reta.',
          },
          {
            step: 2,
            title: 'Alongamento do quadríceps',
            description:
              'Inclina-te para trás enquanto projetas os joelhos para a frente de forma lenta e controlada.',
          },
          {
            step: 3,
            title: 'Extensão controlada',
            description:
              'Volta à vertical contraindo intensamente os quadríceps sem dobrar a cintura.',
          },
        ],
      },
    ];
  }

  if (
    normalized.includes('puxada') ||
    normalized.includes('remada') ||
    normalized.includes('dorsal')
  ) {
    return [
      {
        id: `${ex.id}-alt-1`,
        name: 'Remada na Máquina Articulada',
        muscleTarget: 'Grande Dorsal & Romboides',
        equipment: 'Máquina Hammer Row',
        series: ex.series,
        reps: ex.reps,
        restSeconds: ex.restSeconds || 60,
        weightSuggestion: '40–55 kg',
        notes: 'Peito firme no apoio e cotovelos próximos ao tronco.',
        image:
          'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
        videoUrl: SAMPLE_VIDEOS[0],
        howToExecute: [
          {
            step: 1,
            title: 'Apoio do peito',
            description:
              'Ajusta o assento de modo que as pegas fiquem alinhadas com o peito e apoia o tronco firmemente na almofada.',
          },
          {
            step: 2,
            title: 'Puxada com os cotovelos',
            description:
              'Puxa as alavancas levando os cotovelos para trás e juntando as escápulas no final do movimento.',
          },
          {
            step: 3,
            title: 'Alongamento controlado',
            description:
              'Estende os braços devagar na volta sentindo as dorsais alongarem sem perder a postura.',
          },
        ],
      },
      {
        id: `${ex.id}-alt-2`,
        name: 'Pulldown com Corda na Polia Alta',
        muscleTarget: 'Grande Dorsal',
        equipment: 'Polia Alta + Corda',
        series: ex.series,
        reps: '12–15',
        restSeconds: 45,
        weightSuggestion: '25–35 kg',
        notes: 'Braços semi-estendidos levando a corda até à anca.',
        image:
          'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
        videoUrl: SAMPLE_VIDEOS[1],
        howToExecute: [
          {
            step: 1,
            title: 'Postura inclinada',
            description:
              'Segura a corda com os braços quase estendidos, afasta um passo da polia e inclina ligeiramente o tronco.',
          },
          {
            step: 2,
            title: 'Arco até à anca',
            description:
              'Puxa a corda para baixo em arco mantendo os ombros afastados das orelhas até às coxas.',
          },
          {
            step: 3,
            title: 'Retorno resistido',
            description:
              'Controla a subida dos braços até acima da cabeça para um alongamento completo do dorsal.',
          },
        ],
      },
      {
        id: `${ex.id}-alt-3`,
        name: 'Remada Unilateral com Halter',
        muscleTarget: 'Dorsal & Trapézio Médio',
        equipment: 'Halter + Banco',
        series: ex.series,
        reps: ex.reps,
        restSeconds: ex.restSeconds || 60,
        weightSuggestion: '18–26 kg',
        notes: 'Puxar em direção à linha da anca sem rodar o tronco.',
        image:
          'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop',
        videoUrl: SAMPLE_VIDEOS[2],
        howToExecute: [
          {
            step: 1,
            title: 'Estabilização no banco',
            description:
              'Apoia uma mão e o joelho do mesmo lado no banco mantendo a coluna neutra e paralela ao chão.',
          },
          {
            step: 2,
            title: 'Tração até à anca',
            description:
              'Puxa o halter num ligeiro arco em direção à cintura, conduzindo o movimento pelo cotovelo.',
          },
          {
            step: 3,
            title: 'Descida completa',
            description:
              'Desce o halter com controlo permitindo o alongamento total da escápula antes da próxima repetição.',
          },
        ],
      },
    ];
  }

  if (
    normalized.includes('supino') ||
    normalized.includes('crossover') ||
    normalized.includes('peitoral')
  ) {
    return [
      {
        id: `${ex.id}-alt-1`,
        name: 'Chest Press na Máquina',
        muscleTarget: 'Peitoral Maior',
        equipment: 'Máquina Chest Press',
        series: ex.series,
        reps: ex.reps,
        restSeconds: ex.restSeconds || 75,
        weightSuggestion: '45–65 kg',
        notes: 'Escápulas encaixadas no encosto durante toda a série.',
        image:
          'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
        videoUrl: SAMPLE_VIDEOS[0],
        howToExecute: [
          {
            step: 1,
            title: 'Altura das pegas',
            description:
              'Ajusta o banco para que as pegas fiquem alinhadas com o meio do peitoral e retrai as escápulas.',
          },
          {
            step: 2,
            title: 'Empurrar com controlo',
            description:
              'Empurra as pegas à frente contraindo o peitoral sem projetar os ombros para fora do encosto.',
          },
          {
            step: 3,
            title: 'Fase excêntrica lenta',
            description:
              'Recua devagar em 2 segundos até sentir um alongamento confortável no peito.',
          },
        ],
      },
      {
        id: `${ex.id}-alt-2`,
        name: 'Supino Reto com Halteres',
        muscleTarget: 'Peitoral & Ombro Anterior',
        equipment: 'Halteres + Banco',
        series: ex.series,
        reps: ex.reps,
        restSeconds: ex.restSeconds || 75,
        weightSuggestion: '20–28 kg',
        notes: 'Cotovelos a cerca de 45° do tronco na descida.',
        image:
          'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
        videoUrl: SAMPLE_VIDEOS[1],
        howToExecute: [
          {
            step: 1,
            title: 'Base firme no banco',
            description:
              'Deita-te com os pés bem apoiados no chão, peito aberto e halteres alinhados acima dos ombros.',
          },
          {
            step: 2,
            title: 'Descida controlada',
            description:
              'Desce os halteres até à linha do peito mantendo os cotovelos a cerca de 45° em relação ao tronco.',
          },
          {
            step: 3,
            title: 'Subida convergente',
            description:
              'Empurra os halteres para cima aproximando-os ligeiramente no topo sem bater um no outro.',
          },
        ],
      },
      {
        id: `${ex.id}-alt-3`,
        name: 'Peck Deck (Voador)',
        muscleTarget: 'Peitoral Isolado',
        equipment: 'Máquina Peck Deck',
        series: ex.series,
        reps: '12–15',
        restSeconds: 60,
        weightSuggestion: '35–50 kg',
        notes: 'Apertar o peitoral no centro por 1 segundo.',
        image:
          'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=800&auto=format&fit=crop',
        videoUrl: SAMPLE_VIDEOS[2],
        howToExecute: [
          {
            step: 1,
            title: 'Ajuste de abertura',
            description:
              'Senta-te com o peito elevado, segura as pegas com os cotovelos ligeiramente fletidos na linha dos ombros.',
          },
          {
            step: 2,
            title: 'Fecho em abraço',
            description:
              'Aproxima os braços à frente do peito como num abraço e aperta o peitoral por 1 segundo no centro.',
          },
          {
            step: 3,
            title: 'Abertura resistida',
            description:
              'Retorna devagar controlando o peso até ao alongamento seguro sem deixar os ombros rodarem à frente.',
          },
        ],
      },
    ];
  }

  const target = ex.muscleTarget || 'Grupo Muscular Alvo';
  return [
    {
      id: `${ex.id}-alt-1`,
      name: `${ex.name.split(' ')[0]} com Halteres`,
      muscleTarget: target,
      equipment: 'Halteres',
      series: ex.series,
      reps: ex.reps,
      restSeconds: ex.restSeconds || 60,
      weightSuggestion: ex.weightSuggestion || '16–24 kg',
      notes: 'Execução controlada focada na amplitude total.',
      image:
        'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
      videoUrl: SAMPLE_VIDEOS[0],
      howToExecute: [
        {
          step: 1,
          title: 'Posição inicial estável',
          description:
            'Segura os halteres com firmeza, ativa o core e alinha as articulações antes de iniciar a repetição.',
        },
        {
          step: 2,
          title: 'Fase concêntrica focada',
          description:
            'Executa o movimento principal de forma fluida concentrando o esforço no grupo muscular alvo.',
        },
        {
          step: 3,
          title: 'Retorno controlado',
          description:
            'Controla a descida em 2 segundos mantendo tensão constante até ao início da repetição seguinte.',
        },
      ],
    },
    {
      id: `${ex.id}-alt-2`,
      name: `Variação na Polia (${target.split('&')[0].trim()})`,
      muscleTarget: target,
      equipment: 'Polia Ajustável',
      series: ex.series,
      reps: ex.reps,
      restSeconds: ex.restSeconds || 60,
      weightSuggestion: ex.weightSuggestion || '25–35 kg',
      notes: 'Manter tensão contínua do início ao fim.',
      image:
        'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
      videoUrl: SAMPLE_VIDEOS[1],
      howToExecute: [
        {
          step: 1,
          title: 'Alinhamento com o cabo',
          description:
            'Ajusta a altura da polia à linha natural do movimento e afasta-te o suficiente para criar tensão imediata.',
        },
        {
          step: 2,
          title: 'Contração no pico',
          description:
            'Completa toda a amplitude do movimento segurando brevemente no ponto de máxima contração.',
        },
        {
          step: 3,
          title: 'Fase excêntrica resistida',
          description:
            'Acompanha o retorno do cabo devagar sem deixar as placas baterem entre repetições.',
        },
      ],
    },
    {
      id: `${ex.id}-alt-3`,
      name: `Variação em Máquina (${target.split('&')[0].trim()})`,
      muscleTarget: target,
      equipment: 'Máquina Guiada',
      series: ex.series,
      reps: ex.reps,
      restSeconds: ex.restSeconds || 60,
      weightSuggestion: ex.weightSuggestion || '35–50 kg',
      notes: 'Ajustar os apoios antes de iniciar a série.',
      image:
        'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop',
      videoUrl: SAMPLE_VIDEOS[2],
      howToExecute: [
        {
          step: 1,
          title: 'Ajuste ergonómico',
          description:
            'Regula o assento e os apoios da máquina para o eixo do equipamento alinhar com a articulação trabalhada.',
        },
        {
          step: 2,
          title: 'Execução guiada',
          description:
            'Move a carga com cadência estável sem usar balanço do tronco para compensar o esforço.',
        },
        {
          step: 3,
          title: 'Controlo na volta',
          description:
            'Retorna lentamente mantendo a musculatura sob tensão durante toda a série.',
        },
      ],
    },
  ];
}

export function ExerciseSwapPage({
  currentExercise,
  onBack,
  onSelectAlternative,
}: ExerciseSwapPageProps) {
  const alternatives = useMemo(
    () => getAlternativesForExercise(currentExercise),
    [currentExercise]
  );

  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const [isFullscreenVideoOpen, setIsFullscreenVideoOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const selectedAlt = alternatives[activeTabIndex] || alternatives[0];

  useEffect(() => {
    if (!isFullscreenVideoOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreenVideoOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isFullscreenVideoOpen]);

  const handleOpenFullscreenVideo = () => {
    setIsPlaying(true);
    setIsFullscreenVideoOpen(true);
  };

  const handleTogglePlay = () => {
    const vid = videoRef.current;
    if (!vid) {
      setIsPlaying((prev) => !prev);
      return;
    }
    if (vid.paused) {
      vid.play().catch(() => {});
      setIsPlaying(true);
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  };

  const handleReplay = () => {
    const vid = videoRef.current;
    if (vid) {
      vid.currentTime = 0;
      vid.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleConfirmSwap = () => {
    const swappedExercise: ExerciseItem = {
      ...currentExercise,
      name: selectedAlt.name,
      muscleTarget: selectedAlt.muscleTarget,
      equipment: selectedAlt.equipment,
      series: selectedAlt.series,
      reps: selectedAlt.reps,
      restSeconds: selectedAlt.restSeconds,
      weightSuggestion: selectedAlt.weightSuggestion,
      notes: selectedAlt.notes,
      image: selectedAlt.image,
      videoUrl: selectedAlt.videoUrl,
      sets: generateDefaultSets(
        selectedAlt.series,
        selectedAlt.weightSuggestion
      ),
    };
    onSelectAlternative(swappedExercise);
  };

  return (
    <div className="flex flex-col min-h-full bg-black text-white px-5 pt-4 pb-12 animate-in fade-in slide-in-from-right-4 duration-200">
      {/* CABEÇALHO */}
      <header className="flex items-center justify-between gap-3 mb-4">
        <button
          type="button"
          onClick={onBack}
          className="w-10 h-10 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-white hover:border-zinc-700 active:scale-95 transition-all cursor-pointer shrink-0"
          aria-label="Voltar ao treino"
        >
          <ChevronLeft className="w-5 h-5 text-orange-400" strokeWidth={2.5} />
        </button>

        <div className="flex-1 text-center min-w-0 px-1">
          <h1 className="text-white text-base font-bold tracking-tight truncate">
            Trocar Exercício
          </h1>
          <p className="text-[11px] text-zinc-400 truncate mt-0.5">
            Atual: {currentExercise.name}
          </p>
        </div>

        <div className="w-10 shrink-0" aria-hidden="true" />
      </header>

      {/* 3 TABS DE ALTERNATIVAS */}
      <div
        role="tablist"
        aria-label="Alternativas de exercício"
        className="grid grid-cols-3 gap-1.5 bg-[#0a0a0a] border border-zinc-800/80 rounded-2xl p-1 mb-5"
      >
        {alternatives.map((alt, idx) => {
          const isActive = activeTabIndex === idx;
          return (
            <button
              key={alt.id}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => setActiveTabIndex(idx)}
              className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#F77F00]/15 border border-[#F77F00]/55 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
              }`}
            >
              Alternativa {idx + 1}
            </button>
          );
        })}
      </div>

      {/* CONTEÚDO DA ALTERNATIVA SELECIONADA */}
      <div
        key={selectedAlt.id}
        className="flex flex-col gap-4 animate-in fade-in duration-200"
      >
        {/* Vídeo clicável para ecrã inteiro com apenas o nome sobreposto */}
        <button
          type="button"
          onClick={handleOpenFullscreenVideo}
          aria-label={`Ver vídeo de ${selectedAlt.name} em ecrã inteiro`}
          className="group relative w-full h-52 overflow-hidden rounded-[22px] bg-zinc-900 border border-zinc-800/80 hover:border-[#F77F00]/50 shadow-lg text-left cursor-pointer transition-all"
        >
          <img
            src={selectedAlt.image}
            alt={selectedAlt.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/25" />

          {/* Ícone indicar ecrã inteiro */}
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/65 backdrop-blur-md border border-white/15 flex items-center justify-center text-white/90">
            <Maximize2 className="w-3.5 h-3.5" />
          </div>

          {/* Botão Play central */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-[#F77F00]/90 text-white flex items-center justify-center shadow-lg shadow-orange-500/40 border border-white/20 group-hover:scale-110 group-active:scale-95 transition-all">
              <Play className="w-6 h-6 fill-white stroke-none ml-0.5" />
            </div>
          </div>

          {/* Apenas o nome do exercício */}
          <div className="absolute bottom-3.5 left-4 right-4">
            <h2 className="text-lg font-black text-white leading-tight drop-shadow-sm">
              {selectedAlt.name}
            </h2>
          </div>
        </button>

        {/* Bloco único: Como Realizar */}
        <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-[#F77F00] shrink-0" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Como Realizar
            </h3>
          </div>

          <div className="flex flex-col gap-2.5">
            {selectedAlt.howToExecute.map((item) => (
              <div
                key={item.step}
                className="flex items-start gap-3 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/70"
              >
                <div className="w-6 h-6 rounded-full bg-[#F77F00]/15 border border-[#F77F00]/40 text-[#F77F00] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                  {item.step}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-white mb-0.5">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Único botão de ação: Substituir por esta alternativa */}
        <button
          type="button"
          onClick={handleConfirmSwap}
          className="w-full py-3.5 rounded-2xl bg-[#F77F00] hover:bg-[#e57300] active:scale-[0.98] text-white font-bold text-sm shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer mt-1"
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>Substituir por esta alternativa</span>
        </button>
      </div>

      {/* PLAYER DE VÍDEO EM ECRÃ INTEIRO */}
      {isFullscreenVideoOpen &&
        createPortal(
          <div className="fixed inset-0 z-[320] bg-black flex flex-col animate-in fade-in duration-200">
            {/* Barra superior */}
            <div className="flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3 bg-gradient-to-b from-black/90 to-transparent z-10">
              <h3 className="text-sm font-bold text-white truncate pr-3">
                {selectedAlt.name}
              </h3>
              <button
                type="button"
                onClick={() => setIsFullscreenVideoOpen(false)}
                aria-label="Fechar vídeo em ecrã inteiro"
                className="w-9 h-9 rounded-full bg-zinc-900/90 border border-zinc-700 text-white flex items-center justify-center hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Área central do vídeo em ecrã inteiro */}
            <div
              onClick={handleTogglePlay}
              className="relative flex-1 flex items-center justify-center bg-black overflow-hidden cursor-pointer"
            >
              <video
                ref={videoRef}
                src={selectedAlt.videoUrl}
                poster={selectedAlt.image}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="w-full h-full object-contain"
              />

              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="w-16 h-16 rounded-full bg-[#F77F00]/95 text-white flex items-center justify-center shadow-2xl border border-white/20">
                    <Play className="w-7 h-7 fill-white stroke-none ml-0.5" />
                  </div>
                </div>
              )}
            </div>

            {/* Controlos inferiores */}
            <div className="flex items-center justify-between px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-black/95 to-transparent z-10">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  aria-label={isPlaying ? 'Pausar vídeo' : 'Reproduzir vídeo'}
                  className="w-10 h-10 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white flex items-center justify-center hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  {isPlaying ? (
                    <span className="text-xs font-black">❚❚</span>
                  ) : (
                    <Play className="w-4 h-4 fill-white stroke-none ml-0.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsMuted((prev) => !prev)}
                  aria-label={isMuted ? 'Ativar som' : 'Silenciar vídeo'}
                  className="w-10 h-10 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white flex items-center justify-center hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={handleReplay}
                aria-label="Repetir vídeo"
                className="w-10 h-10 rounded-xl bg-zinc-900/90 border border-zinc-800 text-white flex items-center justify-center hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
