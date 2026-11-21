import { 
  Student, 
  DailyCheckIn, 
  WeeklySummary, 
  Workout, 
  Goal, 
  Indicator, 
  StudentProfile, 
  GymClass, 
  MedicalExam,
  AppNotification,
  ChatMessage,
  CoachInfo,
  GoalStrategyData
} from './types';

export const mockStudent: Student = {
  name: 'João',
  avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d'
};

const today = new Date();

export const mockCheckIns: DailyCheckIn[] = [
  { id: '1', date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3), status: 'completed', dayName: 'Seg', dayNumber: today.getDate() - 3 },
  { id: '2', date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2), status: 'completed', dayName: 'Ter', dayNumber: today.getDate() - 2 },
  { id: '3', date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1), status: 'missed', dayName: 'Qua', dayNumber: today.getDate() - 1 },
  { id: '4', date: today, status: 'pending', dayName: 'Qui', dayNumber: today.getDate() },
  { id: '5', date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1), status: 'future', dayName: 'Sex', dayNumber: today.getDate() + 1 },
  { id: '6', date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2), status: 'future', dayName: 'Sáb', dayNumber: today.getDate() + 2 },
  { id: '7', date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3), status: 'future', dayName: 'Dom', dayNumber: today.getDate() + 3 },
];

export const mockWeeklySummary: WeeklySummary = {
  workoutsDone: 2,
  workoutsPlanned: 4,
  goalProgressPercent: 65,
};

export const mockNextWorkout: Workout = {
  id: 'w1',
  name: 'PUSH',
  type: 'Hipertrofia',
  muscleGroups: ['Peito', 'Ombro', 'Tríceps'],
  durationMinutes: 55,
  intensity: 'Alta',
};

const targetDate = new Date(today);
targetDate.setDate(targetDate.getDate() + 45); // 45 days from now

export const mockGoal: Goal = {
  title: 'Chegar aos 70kg',
  progressPercent: 42,
  targetDate: targetDate,
};

export const mockIndicators: Indicator[] = [
  {
    id: 'i1',
    type: 'water',
    label: 'Água',
    currentValue: 1.2,
    targetValue: 2.5,
    unit: 'L',
  },
  {
    id: 'i2',
    type: 'steps',
    label: 'Passos',
    currentValue: 6540,
    targetValue: 10000,
    unit: 'passos',
  },
  {
    id: 'i3',
    type: 'weight',
    label: 'Peso Atual',
    currentValue: 78.5,
    unit: 'kg',
    history: -1.2, // lost 1.2kg since last measurement
  }
];

export const mockMotivation = "A disciplina é a ponte entre os teus objetivos e as tuas realizações. Estás no bom caminho, continua o excelente trabalho nesta semana!";

export const initialStudentProfile: StudentProfile = {
  name: 'João Silva',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  memberSince: 'Outubro de 2023',
  membershipId: 'P1-8429',
  renewal: {
    daysRemaining: 18,
    date: '26 de Outubro, 2026',
    status: 'active',
  },
  assessment: {
    daysRemaining: 12,
    date: '20 de Outubro, 2026',
    trainer: 'Prof. André Silva',
    type: 'Bioimpedância & Antropometria',
  },
  subscription: {
    planName: 'Plano Premium Semestral',
    status: 'Ativa',
    price: '199 € / 6 meses',
    billingCycle: 'Semestral',
    nextBillingDate: '26 Novembro 2026',
    accessUntil: '26 Novembro 2026',
    paymentMethod: 'Cartão •••• 4242',
    startDate: '26 Maio 2026',
    perks: [
      'Plano de treino e alimentação 100% personalizado',
      'Chat direto e feedback com o teu treinador',
      'Registos diários, avaliações físicas e comunidade',
      'Acesso a todas as aulas gravadas e conteúdos exclusivos',
    ],
  },
};

export const mockGymClasses: GymClass[] = [
  {
    id: 'c1',
    name: 'CrossFit WOD & Power',
    instructor: 'Prof. Ricardo Santos',
    time: '18:30 - 19:20',
    day: 'Terça-feira, 14 Out',
    room: 'Box Arena 1',
    duration: '50 min',
    booked: true,
    spotsLeft: 3,
    category: 'HIIT',
  },
  {
    id: 'c2',
    name: 'Pilates Core & Recovery',
    instructor: 'Prof. Mariana Lima',
    time: '19:00 - 19:45',
    day: 'Quinta-feira, 16 Out',
    room: 'Estúdio Zen',
    duration: '45 min',
    booked: true,
    spotsLeft: 5,
    category: 'Mobilidade',
  },
  {
    id: 'c3',
    name: 'Spinning Sprint Pulse',
    instructor: 'Prof. Tiago Ferreira',
    time: '08:00 - 08:45',
    day: 'Sexta-feira, 17 Out',
    room: 'Cycle Lab',
    duration: '45 min',
    booked: false,
    spotsLeft: 8,
    category: 'Cardio',
  },
  {
    id: 'c4',
    name: 'Hyrox Strength & Conditioning',
    instructor: 'Prof. André Silva',
    time: '10:30 - 11:30',
    day: 'Sábado, 18 Out',
    room: 'Área Funcional',
    duration: '60 min',
    booked: false,
    spotsLeft: 2,
    category: 'Força',
  },
];

export const mockExams: MedicalExam[] = [
  {
    id: 'e1',
    title: 'Avaliação Física & Bioimpedância InBody',
    date: '20 de Agosto, 2026',
    doctorOrTrainer: 'Prof. André Silva',
    summary: 'Excelente evolução com ganho de massa magra de 1.4kg e redução de 2.1% no percentual de gordura.',
    metrics: [
      { label: 'Peso Corporal', value: '78.5 kg', change: '-1.2 kg' },
      { label: 'Massa Muscular Esquelética', value: '38.2 kg', change: '+1.4 kg' },
      { label: 'Gordura Corporal', value: '14.8%', change: '-2.1%' },
      { label: 'Gordura Visceral', value: 'Nível 4', change: '-1 nível' },
      { label: 'Taxa Metabólica Basal', value: '1.840 kcal', change: '+45 kcal' },
    ],
  },
  {
    id: 'e2',
    title: 'Teste Cardiorrespiratório VO2 Máx',
    date: '15 de Maio, 2026',
    doctorOrTrainer: 'Dra. Inês Carvalheiro',
    summary: 'Capacidade aeróbica superior à média etária (VO2 Máx: 48.6 ml/kg/min). Apto para treinos de alta intensidade.',
    metrics: [
      { label: 'VO2 Máx Estimado', value: '48.6 ml/kg/min', change: '+3.2' },
      { label: 'FC Repouso', value: '54 bpm', change: '-4 bpm' },
      { label: 'FC Máxima Atingida', value: '188 bpm' },
      { label: 'Zona 2 Limiar', value: '135 - 148 bpm' },
    ],
  },
  {
    id: 'e3',
    title: 'Check-Up Médico Desportivo & Eletrocardiograma',
    date: '10 de Janeiro, 2026',
    doctorOrTrainer: 'Dr. Pedro Guimarães (Medicina Desportiva)',
    summary: 'ECG em repouso sem alterações. Tensão arterial excelente (118/76 mmHg). Atestado de aptidão física emitido.',
    metrics: [
      { label: 'Tensão Arterial', value: '118 / 76 mmHg' },
      { label: 'ECG Repouso', value: 'Normal / Ritmo Sinusal' },
      { label: 'Status de Aptidão', value: 'Válido até Jan 2027' },
    ],
  },
];

export const mockCoachInfo: CoachInfo = {
  name: 'Coach André Silva',
  role: 'Personal Trainer & Preparador Físico',
  avatarUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&auto=format&fit=crop&q=80',
  status: 'Online agora',
  phone: '+351 912 345 678',
  club: 'EVOLV Performance Club',
  specialty: 'Hipertrofia & Força',
  availability: 'Seg - Sex (07:00 - 20:00)',
};

export const mockNutritionistInfo: CoachInfo = {
  name: 'Dra. Inês Costa',
  role: 'Nutricionista Desportiva',
  avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
  status: 'Online agora',
  phone: '+351 914 820 315',
  club: 'EVOLV Nutrição & Saúde',
  specialty: 'Nutrição Desportiva & Recomposição',
  availability: 'Seg - Sex (09:00 - 19:00)',
};

export const mockNotifications: AppNotification[] = [
  {
    id: 'notif-1',
    category: 'Avaliação',
    title: 'Dia de Avaliação',
    shortDescription: 'Lembrete: Avaliação física agendada para 20 de Outubro com o Coach André.',
    fullContent: 'A tua avaliação física periódica (Bioimpedância InBody & Antropometria) está marcada para o dia 20 de Outubro às 10:00 com o Prof. André Silva. Recomenda-se jejum de 2 horas e roupa desportiva confortável.',
    timestamp: 'Hoje, 10:15',
    createdAt: '2026-10-08T10:15:00Z',
    read: false,
    iconType: 'assessment',
    actionLabel: 'Ver Agendamento',
    targetTab: 'agenda',
  },
  {
    id: 'notif-2',
    category: 'Motivação',
    title: 'Frase Motivacional do Dia',
    shortDescription: '“A disciplina é a ponte entre os teus objetivos e as tuas realizações.”',
    fullContent: '“A consistência bate o talento quando o talento não é consistente. Mantém o foco no teu plano de hoje, cada repetição conta para a tua transformação!” — PR1ME Motivation',
    timestamp: 'Hoje, 08:30',
    createdAt: '2026-10-08T08:30:00Z',
    read: false,
    iconType: 'motivation',
    actionLabel: 'Ver Treino de Hoje',
    targetTab: 'treino',
  },
  {
    id: 'notif-3',
    category: 'Motivação',
    title: 'Meta Semanal em Andamento',
    shortDescription: 'Já completaste 2 dos 4 treinos planeados para esta semana (50%).',
    fullContent: 'Excelente ritmo! Já cumpriste 50% da tua meta de 4 sessões semanais. Mantém a intensidade para garantires o bónus de constância e atingires o objetivo até domingo.',
    timestamp: 'Ontem, 19:40',
    createdAt: '2026-10-07T19:40:00Z',
    read: false,
    iconType: 'goal',
    actionLabel: 'Ver Resumo Semanal',
    targetTab: 'evolucao',
  },
  {
    id: 'notif-4',
    category: 'Dicas',
    title: 'Hidratação Essencial',
    shortDescription: 'Hora de beber água! Registaste 1.2L da tua meta diária de 2.5L.',
    fullContent: 'A hidratação adequada melhora o rendimento muscular em até 15%, reduz a fadiga central e potencia a recuperação muscular. Bebe agora um copo de água fresca para reabastecer os teus níveis!',
    timestamp: 'Ontem, 15:20',
    createdAt: '2026-10-07T15:20:00Z',
    read: true,
    iconType: 'water',
    actionLabel: 'Registar +250ml',
    targetTab: 'home',
  },
  {
    id: 'notif-5',
    category: 'Dicas',
    title: 'Dica do Dia: Sono & Recuperação',
    shortDescription: 'Dormir 7 a 8 horas por noite otimiza a libertação de GH e a queima de gordura.',
    fullContent: 'Durante a fase de sono profundo (REM e ondas lentas) dá-se a maior síntese proteica muscular e recuperação do sistema nervoso central. Evita café e ecrãs azuis nos 45 minutos antes de deitar.',
    timestamp: 'Ontem, 09:10',
    createdAt: '2026-10-07T09:10:00Z',
    read: true,
    iconType: 'tip',
    actionLabel: 'Ver Dicas de Treino',
    targetTab: 'treino',
  },
  {
    id: 'notif-6',
    category: 'Motivação',
    title: 'Parabéns! Novo Recorde Pessoal',
    shortDescription: 'Superaste a tua carga no Supino Reto com 80kg (+5kg vs. semana anterior)!',
    fullContent: 'Parabéns pelo excelente desempenho técnico e força demonstrada! O Coach André validou o teu novo Recorde Pessoal de 80kg no Supino Reto com cadência perfeita.',
    timestamp: '06 Out, 18:25',
    createdAt: '2026-10-06T18:25:00Z',
    read: true,
    iconType: 'congrats',
    actionLabel: 'Ver Evolução de Cargas',
    targetTab: 'evolucao',
  },
  {
    id: 'notif-7',
    category: 'Informações',
    title: 'Informação: Próximo Plano Alimentar',
    shortDescription: 'O teu ciclo nutricional atual expira em 5 dias. Agenda a revisão nutricional.',
    fullContent: 'Para acompanhar a tua evolução de hipertrofia com ganho limpo, o teu nutricionista recomenda um ajuste nos macronutrientes. Fala diretamente com o Coach ou consulta o teu plano.',
    timestamp: '05 Out, 11:00',
    createdAt: '2026-10-05T11:00:00Z',
    read: true,
    iconType: 'info',
    actionLabel: 'Ver Plano Nutricional',
    targetTab: 'dieta',
  },
];

export const mockChatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'coach',
    text: 'Olá João! Como correu o treino PUSH de hoje? Conseguiste manter a cadência de 3 segundos na descida excêntrica?',
    timestamp: '10:15',
    dateLabel: 'Segunda-feira, 6 de Outubro',
    createdAt: '2026-10-06T10:15:00Z',
    status: 'read',
  },
  {
    id: 'msg-2',
    sender: 'student',
    text: 'Boas André! Correu muito bem, senti bastante o peitoral e cheguei aos 80kg no supino com excelente técnica 💪',
    timestamp: '10:22',
    dateLabel: 'Segunda-feira, 6 de Outubro',
    createdAt: '2026-10-06T10:22:00Z',
    status: 'read',
  },
  {
    id: 'msg-3',
    sender: 'coach',
    text: 'Espetacular! Vi o teu registo na app. Excelente evolução técnica e de carga. Lembra-te de focar bem na hidratação e consumir proteína após o treino.',
    timestamp: '10:25',
    dateLabel: 'Segunda-feira, 6 de Outubro',
    createdAt: '2026-10-06T10:25:00Z',
    status: 'read',
  },
  {
    id: 'msg-4',
    sender: 'student',
    text: 'André, amanhã consigo treinar às 07:30 da manhã. O plano PULL já está atualizado com as novas séries?',
    timestamp: '18:45',
    dateLabel: 'Ontem',
    createdAt: '2026-10-07T18:45:00Z',
    status: 'read',
  },
  {
    id: 'msg-5',
    sender: 'coach',
    text: 'Sim, já está tudo afinado na tua aba de Treino! Coloquei foco especial em remadas e puxada dorsal. Dá o teu máximo!',
    timestamp: '18:50',
    dateLabel: 'Ontem',
    createdAt: '2026-10-07T18:50:00Z',
    status: 'read',
  },
  {
    id: 'msg-6',
    sender: 'student',
    text: 'Perfeito, obrigado Coach! Até amanhã 👊',
    timestamp: '18:52',
    dateLabel: 'Ontem',
    createdAt: '2026-10-07T18:52:00Z',
    status: 'read',
  },
  {
    id: 'msg-7',
    sender: 'coach',
    text: 'Bom dia João! Não te esqueças que temos avaliação física agendada para dia 20 às 10:00. Se tiveres dúvidas sobre os treinos desta semana diz-me por aqui.',
    timestamp: '09:30',
    dateLabel: 'Hoje',
    createdAt: '2026-10-08T09:30:00Z',
    status: 'read',
  },
];

export const mockNutritionistMessages: ChatMessage[] = [
  {
    id: 'nutri-1',
    sender: 'coach',
    text: 'Olá João! Já atualizei o teu plano de Dia de Treino e Dia de Descanso na secção Dieta. Como te tens sentido com o nível de energia nos treinos?',
    timestamp: '11:10',
    dateLabel: 'Ontem',
    createdAt: '2026-10-07T11:10:00Z',
    status: 'read',
  },
  {
    id: 'nutri-2',
    sender: 'student',
    text: 'Olá Dra. Inês! Muito melhor esta semana, especialmente desde que subimos os hidratos no pré-treino. Posso trocar o arroz basmati por batata-doce ao jantar?',
    timestamp: '11:24',
    dateLabel: 'Ontem',
    createdAt: '2026-10-07T11:24:00Z',
    status: 'read',
  },
  {
    id: 'nutri-3',
    sender: 'coach',
    text: 'Sim, perfeitamente! Podes usar 220g de batata-doce assada ou cozida em substituição dos 150g de arroz cozido para manteres os mesmos hidratos.',
    timestamp: '11:29',
    dateLabel: 'Ontem',
    createdAt: '2026-10-07T11:29:00Z',
    status: 'read',
  },
  {
    id: 'nutri-4',
    sender: 'coach',
    text: 'Lembra-te também de manter os 2.5L de água ao longo do dia e envia foto da refeição pós-treino se tiveres alguma dúvida nas porções.',
    timestamp: '09:15',
    dateLabel: 'Hoje',
    createdAt: '2026-10-08T09:15:00Z',
    status: 'read',
  },
];

function addLisbonDaysYMD(offsetDays: number): string {
  const lisbonTodayStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Lisbon',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const [y, m, d] = lisbonTodayStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + offsetDays));
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

export const mockGoalStrategy: GoalStrategyData = {
  objective: {
    title: 'Competir em 2027',
    endDate: addLisbonDaysYMD(195),
  },
  strategy: {
    name: 'Fase de Aumento',
    description:
      'Construção muscular limpa com superávit calórico controlado, progressão de cargas nos exercícios base e foco na recuperação entre sessões.',
    startDate: addLisbonDaysYMD(-33),
    endDate: addLisbonDaysYMD(50),
    weekDirection: 'up',
  },
};

