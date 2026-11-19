export interface ExerciseSet {
  setNumber: number;
  prevWeight: string; // e.g. "40 kg"
  prevReps: string;   // e.g. "12 reps"
  weight: string;     // current logged weight
  reps: string;       // current logged reps
  rir: string;        // e.g. "2" (reps in reserve)
  completed: boolean;
}

export interface ExerciseItem {
  id: string;
  order: number;
  name: string;
  series: number;
  reps: string; // e.g. "10–12"
  restSeconds?: number;
  weightSuggestion?: string;
  equipment?: string;
  notes?: string;
  image: string;
  muscleTarget?: string;
  videoUrl?: string;
  isFavorite?: boolean;
  sets?: ExerciseSet[];
}

export interface WarmupExercise {
  id: string;
  name: string;
  durationOrReps: string; // e.g. "60 seg" or "15 reps"
  image: string;
  muscleFocus: string;
  videoUrl?: string;
}

export interface WarmupRoutine {
  title: string;
  estimatedDuration: string; // e.g. "~8 min"
  exercisesCount: number;
  exercises: WarmupExercise[];
}

export interface DetailedWorkout {
  id: string;
  dayKey: string; // 'SEG', 'TER', etc.
  dayLabel: string; // 'Segunda-feira'
  dayNum: string; // '22'
  dateFormatted?: string; // e.g. "22/10/2026"
  name: string;
  muscleGroups: string;
  durationEstimated: string; // '~60 min'
  caloriesEstimated: string; // '~450 kcal'
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  equipment: string; // 'Máquinas e Halteres'
  image: string;
  isRest?: boolean;
  warmup?: WarmupRoutine;
  exercises: ExerciseItem[];
}

export const mockDetailedWorkouts: Record<string, DetailedWorkout> = {
  SEG: {
    id: 'seg-gluteo-quads',
    dayKey: 'SEG',
    dayLabel: 'Segunda-feira',
    dayNum: '22',
    name: 'Glúteo & Quads',
    muscleGroups: 'Glúteo Máximo, Médio e Quadríceps',
    durationEstimated: '~60 min',
    caloriesEstimated: '~450 kcal',
    level: 'Intermediário',
    equipment: 'Máquinas e Halteres',
    image: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=600&auto=format&fit=crop',
    exercises: [
      {
        id: 'ex-1',
        order: 1,
        name: 'Agachamento Búlgaro com Halteres',
        series: 4,
        reps: '10–12',
        restSeconds: 60,
        weightSuggestion: '12–16 kg',
        equipment: 'Halteres + Banco',
        muscleTarget: 'Glúteo Máximo & Quadríceps',
        notes: 'Manter o tronco ligeiramente inclinado para frente para maior ativação do glúteo.',
        image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'ex-2',
        order: 2,
        name: 'Hip Thrust na Barra',
        series: 4,
        reps: '8–10',
        restSeconds: 90,
        weightSuggestion: '60–80 kg',
        equipment: 'Barra Olímpica + Banco',
        muscleTarget: 'Glúteo Máximo',
        notes: 'Pausa de 1 segundo no pico de contração no topo.',
        image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'ex-3',
        order: 3,
        name: 'Leg Press 45°',
        series: 3,
        reps: '12–15',
        restSeconds: 60,
        weightSuggestion: '140–180 kg',
        equipment: 'Máquina Leg Press 45',
        muscleTarget: 'Quadríceps & Glúteo',
        notes: 'Pés na largura dos ombros, não bloquear os joelhos no topo.',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'ex-4',
        order: 4,
        name: 'Cadeira Extensora',
        series: 3,
        reps: '12–15',
        restSeconds: 45,
        weightSuggestion: '45–55 kg',
        equipment: 'Máquina Extensora',
        muscleTarget: 'Quadríceps Isolado',
        notes: 'Movimento cadenciado de 2 segundos de subida e 2 segundos de descida.',
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'ex-5',
        order: 5,
        name: 'Cadeira Abdutora',
        series: 3,
        reps: '15–20',
        restSeconds: 45,
        weightSuggestion: '50–65 kg',
        equipment: 'Máquina Abdutora',
        muscleTarget: 'Glúteo Médio',
        notes: 'Pausa de 2 segundos com máxima abertura.',
        image: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=400&auto=format&fit=crop'
      }
    ]
  },
  TER: {
    id: 'ter-superiores-costas',
    dayKey: 'TER',
    dayLabel: 'Terça-feira',
    dayNum: '23',
    name: 'Superiores & Costas',
    muscleGroups: 'Dorsais, Deltoides e Bíceps',
    durationEstimated: '~55 min',
    caloriesEstimated: '~420 kcal',
    level: 'Intermediário',
    equipment: 'Cabos, Halteres e Barras',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop',
    exercises: [
      {
        id: 'ex-201',
        order: 1,
        name: 'Puxada Frontal na Polia',
        series: 4,
        reps: '10–12',
        restSeconds: 60,
        weightSuggestion: '45–60 kg',
        equipment: 'Polia Alta',
        muscleTarget: 'Grande Dorsal',
        notes: 'Expandir o peito e puxar os cotovelos em direção à cintura.',
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'ex-202',
        order: 2,
        name: 'Remada Curvada com Barra',
        series: 4,
        reps: '8–10',
        restSeconds: 75,
        weightSuggestion: '50–65 kg',
        equipment: 'Barra Olímpica',
        muscleTarget: 'Dorsais e Trapézio Médio',
        notes: 'Costas retas em 45 graus, puxar a barra até a linha do umbigo.',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'ex-203',
        order: 3,
        name: 'Remada Baixa no Triângulo',
        series: 3,
        reps: '10–12',
        restSeconds: 60,
        weightSuggestion: '50–65 kg',
        equipment: 'Polia Baixa',
        muscleTarget: 'Espessura Dorsal',
        notes: 'Segurar 1 segundo junto ao abdómen sem balançar o tronco.',
        image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'ex-204',
        order: 4,
        name: 'Elevação Lateral com Halteres',
        series: 4,
        reps: '12–15',
        restSeconds: 45,
        weightSuggestion: '8–12 kg',
        equipment: 'Halteres',
        muscleTarget: 'Deltoide Lateral',
        notes: 'Cotovelos ligeiramente flexionados, subir até a linha dos ombros.',
        image: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'ex-205',
        order: 5,
        name: 'Rosca Direta com Barra W',
        series: 3,
        reps: '10–12',
        restSeconds: 60,
        weightSuggestion: '20–30 kg',
        equipment: 'Barra W',
        muscleTarget: 'Bíceps Braquial',
        notes: 'Sem balançar o quadril, cotovelos fixos ao lado do tronco.',
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'ex-206',
        order: 6,
        name: 'Rosca Martelo com Halteres',
        series: 3,
        reps: '12–15',
        restSeconds: 45,
        weightSuggestion: '10–14 kg',
        equipment: 'Halteres',
        muscleTarget: 'Braquiorradial e Bíceps',
        notes: 'Pegada neutra, foco na antebraço e cabeça longa do bíceps.',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop'
      }
    ]
  },
  QUA: {
    id: 'qua-descanso-ativo',
    dayKey: 'QUA',
    dayLabel: 'Quarta-feira',
    dayNum: '24',
    name: 'Descanso Ativo',
    muscleGroups: 'Alongamento & Mobilidade Articular',
    durationEstimated: '~30 min',
    caloriesEstimated: '~180 kcal',
    level: 'Iniciante',
    equipment: 'Tapete & Rolo de Espuma',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop',
    isRest: true,
    exercises: [
      {
        id: 'ex-301',
        order: 1,
        name: 'Libertação Miofascial no Foam Roller',
        series: 3,
        reps: '60s por zona',
        restSeconds: 30,
        equipment: 'Rolo de Espuma',
        muscleTarget: 'Quadríceps, Glúteos e Dorsais',
        notes: 'Deslizar lentamente sobre os pontos de maior tensão muscular.',
        image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'ex-302',
        order: 2,
        name: 'Mobilidade Torácica & Quadril',
        series: 3,
        reps: '10–12 cada lado',
        restSeconds: 30,
        equipment: 'Tapete',
        muscleTarget: 'Coluna Torácica e Quadril',
        notes: 'Posição 90/90 para rotação interna e externa de anca.',
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'ex-303',
        order: 3,
        name: 'Caminhada Regenerativa Leve',
        series: 1,
        reps: '20 min',
        restSeconds: 0,
        equipment: 'Passadeira / Exterior',
        muscleTarget: 'Sistema Cardiovascular',
        notes: 'Ritmo conversacional suave para acelerar a drenagem de lactato.',
        image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=400&auto=format&fit=crop'
      }
    ]
  },
  QUI: {
    id: 'qui-posteriores-gluteo',
    dayKey: 'QUI',
    dayLabel: 'Quinta-feira',
    dayNum: '25',
    name: 'Posteriores & Glúteo',
    muscleGroups: 'Isquiotibiais, Glúteo e Panturrilhas',
    durationEstimated: '~60 min',
    caloriesEstimated: '~460 kcal',
    level: 'Intermediário',
    equipment: 'Máquinas, Barra e Halteres',
    image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=600&auto=format&fit=crop',
    exercises: [
      {
        id: 'ex-401',
        order: 1,
        name: 'Stiff com Barra Olímpica',
        series: 4,
        reps: '8–10',
        restSeconds: 75,
        weightSuggestion: '50–70 kg',
        equipment: 'Barra Olímpica',
        muscleTarget: 'Isquiotibiais e Glúteo',
        notes: 'Coluna neutra, projetar o quadril bem para trás até sentir o alongamento.',
        image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'ex-402',
        order: 2,
        name: 'Mesa Flexora Deitada',
        series: 4,
        reps: '10–12',
        restSeconds: 60,
        weightSuggestion: '35–50 kg',
        equipment: 'Máquina Flexora',
        muscleTarget: 'Isquiotibiais',
        notes: 'Segurar 1s na contração sem levantar a bacia do banco.',
        image: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'ex-403',
        order: 3,
        name: 'Cadeira Flexora Sentada',
        series: 3,
        reps: '12–15',
        restSeconds: 60,
        weightSuggestion: '40–55 kg',
        equipment: 'Máquina Flexora Sentada',
        muscleTarget: 'Isquiotibiais em alongamento',
        notes: 'Alongar o máximo possível na fase excêntrica.',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'ex-404',
        order: 4,
        name: 'Glute Kickback na Polia Baixa',
        series: 3,
        reps: '12–15 cada perna',
        restSeconds: 45,
        weightSuggestion: '10–15 kg',
        equipment: 'Polia com Tornozeleira',
        muscleTarget: 'Glúteo Máximo Superior',
        notes: 'Focar na extensão do quadril sem arquear a região lombar.',
        image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'ex-405',
        order: 5,
        name: 'Passadas Afundo com Halteres',
        series: 3,
        reps: '12 passos cada perna',
        restSeconds: 60,
        weightSuggestion: '10–14 kg cada halter',
        equipment: 'Halteres',
        muscleTarget: 'Glúteo e Quadríceps',
        notes: 'Passos amplos para enfatizar os glúteos.',
        image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'ex-406',
        order: 6,
        name: 'Panturrilha em Pé no Smith',
        series: 4,
        reps: '15–20',
        restSeconds: 45,
        weightSuggestion: '60–80 kg',
        equipment: 'Smith Machine + Step',
        muscleTarget: 'Gastrocnêmio',
        notes: 'Alongamento profundo no fundo e pico de contração no topo.',
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=400&auto=format&fit=crop'
      }
    ]
  },
  SEX: {
    id: 'sex-peito-triceps',
    dayKey: 'SEX',
    dayLabel: 'Sexta-feira',
    dayNum: '26',
    name: 'Peito & Tríceps',
    muscleGroups: 'Peitoral, Tríceps e Ombro Anterior',
    durationEstimated: '~55 min',
    caloriesEstimated: '~430 kcal',
    level: 'Intermediário',
    equipment: 'Bancos, Barras e Polias',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600&auto=format&fit=crop',
    exercises: [
      {
        id: 'ex-501',
        order: 1,
        name: 'Supino Reto com Barra',
        series: 4,
        reps: '8–10',
        restSeconds: 90,
        weightSuggestion: '60–80 kg',
        equipment: 'Barra Olímpica + Banco Reto',
        muscleTarget: 'Peitoral Maior',
        notes: 'Escápulas aduzidas, descer a barra com controlo até ao esterno.',
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'ex-502',
        order: 2,
        name: 'Supino Inclinado com Halteres',
        series: 4,
        reps: '10–12',
        restSeconds: 75,
        weightSuggestion: '20–26 kg cada halter',
        equipment: 'Halteres + Banco a 30°',
        muscleTarget: 'Peitoral Superior',
        notes: 'Ângulo de 30 graus no banco para não sobrecarregar os ombros.',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'ex-503',
        order: 3,
        name: 'Crossover na Polia Média',
        series: 3,
        reps: '12–15',
        restSeconds: 60,
        weightSuggestion: '15–20 kg cada lado',
        equipment: 'Polias Duplas',
        muscleTarget: 'Peitoral Isolado',
        notes: 'Apertar o peitoral na frente por 1 segundo a cada repetição.',
        image: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'ex-504',
        order: 4,
        name: 'Tríceps Pushdown na Corda',
        series: 4,
        reps: '12–15',
        restSeconds: 45,
        weightSuggestion: '25–35 kg',
        equipment: 'Polia Alta com Corda',
        muscleTarget: 'Tríceps Lateral & Medial',
        notes: 'Abrir a corda no final da extensão para contração total.',
        image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'ex-505',
        order: 5,
        name: 'Tríceps Francês Unilateral',
        series: 3,
        reps: '12–15 cada braço',
        restSeconds: 45,
        weightSuggestion: '8–12 kg',
        equipment: 'Halter',
        muscleTarget: 'Cabeça Longa do Tríceps',
        notes: 'Cotovelo apontado para o teto, descida lenta atrás da cabeça.',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop'
      }
    ]
  },
  SÁB: {
    id: 'sab-full-body-core',
    dayKey: 'SÁB',
    dayLabel: 'Sábado',
    dayNum: '27',
    name: 'Full Body & Core',
    muscleGroups: 'Corpo Inteiro, Abdómen e Lombar',
    durationEstimated: '~65 min',
    caloriesEstimated: '~500 kcal',
    level: 'Avançado',
    equipment: 'Máquinas, Halteres e Barra',
    image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?q=80&w=600&auto=format&fit=crop',
    exercises: [
      {
        id: 'ex-601',
        order: 1,
        name: 'Levantamento Terra Convencional',
        series: 4,
        reps: '6–8',
        restSeconds: 90,
        weightSuggestion: '70–100 kg',
        equipment: 'Barra Olímpica + Discos',
        muscleTarget: 'Cadeia Posterior & Costas',
        notes: 'Manter a barra colada ao corpo durante toda a puxada.',
        image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'ex-602',
        order: 2,
        name: 'Desenvolvimento Militar com Barra',
        series: 4,
        reps: '8–10',
        restSeconds: 75,
        weightSuggestion: '30–45 kg',
        equipment: 'Barra Olímpica',
        muscleTarget: 'Ombros e Tríceps',
        notes: 'Empurrar a barra acima da cabeça bloqueando o abdómen.',
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'ex-603',
        order: 3,
        name: 'Remada Unilateral com Halter (Serrote)',
        series: 3,
        reps: '10–12 cada lado',
        restSeconds: 60,
        weightSuggestion: '18–26 kg',
        equipment: 'Halter + Banco',
        muscleTarget: 'Grande Dorsal',
        notes: 'Alongar bem embaixo e puxar até o quadril.',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'ex-604',
        order: 4,
        name: 'Afundo Búlgaro',
        series: 3,
        reps: '10–12 cada perna',
        restSeconds: 60,
        weightSuggestion: '10–14 kg cada halter',
        equipment: 'Halteres + Banco',
        muscleTarget: 'Pernas & Glúteos',
        notes: 'Descida profunda com controlo da perna da frente.',
        image: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'ex-605',
        order: 5,
        name: 'Elevação de Pernas na Barra Fixa',
        series: 3,
        reps: '12–15',
        restSeconds: 45,
        equipment: 'Barra Fixa',
        muscleTarget: 'Abdómen Infra',
        notes: 'Evitar balanço do corpo; focar em enrolar a bacia.',
        image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'ex-606',
        order: 6,
        name: 'Prancha Abdominal com Peso',
        series: 3,
        reps: '45–60s',
        restSeconds: 45,
        equipment: 'Tapete + Disco',
        muscleTarget: 'Core & Transverso Abdominal',
        notes: 'Glúteos e abdómen bem contraídos o tempo todo.',
        image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'ex-607',
        order: 7,
        name: 'Abdominal Crunch na Polia',
        series: 3,
        reps: '15–20',
        restSeconds: 45,
        weightSuggestion: '35–50 kg',
        equipment: 'Polia Alta + Corda',
        muscleTarget: 'Reto Abdominal',
        notes: 'Flexionar a coluna em direção aos joelhos.',
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=400&auto=format&fit=crop'
      }
    ]
  },
  DOM: {
    id: 'dom-descanso-total',
    dayKey: 'DOM',
    dayLabel: 'Domingo',
    dayNum: '28',
    name: 'Descanso Total',
    muscleGroups: 'Recuperação Muscular & Repouso',
    durationEstimated: '~0 min',
    caloriesEstimated: '~0 kcal',
    level: 'Iniciante',
    equipment: 'Nenhum',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600&auto=format&fit=crop',
    isRest: true,
    exercises: [
      {
        id: 'ex-701',
        order: 1,
        name: 'Alongamento Estático Geral',
        series: 2,
        reps: '30s por grupo',
        restSeconds: 20,
        equipment: 'Tapete',
        muscleTarget: 'Todo o Corpo',
        notes: 'Respirar fundo e relaxar a musculatura sem dor.',
        image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'ex-702',
        order: 2,
        name: 'Hidratação & Sono Reparador',
        series: 1,
        reps: '8 horas',
        restSeconds: 0,
        equipment: 'Recuperação Natural',
        muscleTarget: 'Sistema Nervoso Central',
        notes: 'Fundamental para a síntese proteica e recuperação neuromuscular.',
        image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=400&auto=format&fit=crop'
      }
    ]
  }
};

export const defaultWarmupRoutines: Record<string, WarmupRoutine> = {
  SEG: {
    title: 'Mobilidade & Ativação de Glúteo e Anca',
    estimatedDuration: '~8 min',
    exercisesCount: 4,
    exercises: [
      {
        id: 'w-1',
        name: 'Rotação e Mobilidade de Anca 90/90',
        durationOrReps: '10 reps / lado',
        muscleFocus: 'Articulação Coxofemoral',
        image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'w-2',
        name: 'Ponte de Glúteos com Miniband',
        durationOrReps: '15 reps com pausa',
        muscleFocus: 'Glúteo Máximo',
        image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'w-3',
        name: 'Agachamento Profundo com Alongamento Torácico',
        durationOrReps: '10 reps lentas',
        muscleFocus: 'Tornozelos e Anca',
        image: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'w-4',
        name: 'Passada com Afundo Dinâmico',
        durationOrReps: '8 reps / perna',
        muscleFocus: 'Flexores da Coxa & Quads',
        image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400&auto=format&fit=crop'
      }
    ]
  },
  DEFAULT: {
    title: 'Mobilidade & Ativação Geral',
    estimatedDuration: '~7 min',
    exercisesCount: 3,
    exercises: [
      {
        id: 'wd-1',
        name: 'Cat-Cow e Mobilidade Espinhal',
        durationOrReps: '12 repetições',
        muscleFocus: 'Coluna e Core',
        image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'wd-2',
        name: 'Círculos com os Braços e Rotações',
        durationOrReps: '30 seg cada sentido',
        muscleFocus: 'Manguito Rotador & Ombros',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&auto=format&fit=crop'
      },
      {
        id: 'wd-3',
        name: 'Ativação com Saltos Suaves no Lugar',
        durationOrReps: '45 segundos',
        muscleFocus: 'Frequência Cardíaca & Aquecimento',
        image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=400&auto=format&fit=crop'
      }
    ]
  }
};

export function getWorkoutWarmup(dayKey: string): WarmupRoutine {
  return defaultWarmupRoutines[dayKey] || defaultWarmupRoutines.DEFAULT;
}

export function generateDefaultSets(seriesCount: number, baseWeight: string = '40 kg'): ExerciseSet[] {
  // Extract realistic weight number from range strings like "12–16 kg", "60–80 kg", "140–180 kg", etc.
  let numBase = 40;
  if (baseWeight) {
    // Check if it's a range like 12-16 or 12–16
    const rangeMatch = baseWeight.match(/(\d+)\s*[-–]\s*(\d+)/);
    if (rangeMatch) {
      const min = parseInt(rangeMatch[1], 10);
      const max = parseInt(rangeMatch[2], 10);
      numBase = Math.round((min + max) / 2);
    } else {
      const singleMatch = baseWeight.match(/\d+/);
      if (singleMatch) {
        numBase = parseInt(singleMatch[0], 10);
      }
    }
  }

  // Ensure sensible gym weights (between 8 and 95 kg for typical dumbbell/machine sets, max 2 digits if high)
  if (numBase > 95) {
    numBase = 80;
  }
  if (numBase < 6) {
    numBase = 12;
  }

  return Array.from({ length: seriesCount }, (_, i) => {
    // Progressive slight load progression per set or steady
    const step = (seriesCount - 1 - i) * 2;
    const prevKg = Math.max(8, numBase - step);
    return {
      setNumber: i + 1,
      prevWeight: `${prevKg} kg`,
      prevReps: '12 reps',
      weight: `${prevKg}`,
      reps: '12',
      rir: '2',
      completed: false
    };
  });
}

