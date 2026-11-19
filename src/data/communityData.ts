import { 
  CommunityPost, 
  Challenge, 
  LeaderboardAthlete, 
  PointRule, 
  CommunityAchievement, 
  CommunityFriend 
} from '../types/community';

export const mockCurrentUser = {
  id: 'user-carlos',
  name: 'Carlos Bernardo',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  role: 'Atleta RTEAM',
  level: 7,
};

export const pointRules: PointRule[] = [
  { id: 'p1', activity: 'Treino concluído', points: 100, iconName: 'Dumbbell', frequency: 'Por treino finalizado' },
  { id: 'p2', activity: 'Cardio concluído', points: 50, iconName: 'Zap', frequency: 'Por sessão de cardio' },
  { id: 'p3', activity: 'Registo diário completo', points: 30, iconName: 'CalendarCheck', frequency: 'Por check-in de água e passos' },
  { id: 'p4', activity: 'Publicação na comunidade', points: 20, iconName: 'MessageSquare', frequency: 'Por partilha no feed' },
  { id: 'p5', activity: 'Novo recorde pessoal (PR)', points: 150, iconName: 'Trophy', frequency: 'Ao bater uma marca anterior' },
  { id: 'p6', activity: 'Conquista partilhada', points: 80, iconName: 'Award', frequency: 'Ao desbloquear e partilhar' },
  { id: 'p7', activity: 'Desafio concluído', points: 200, iconName: 'Flame', frequency: 'Ao atingir o objetivo do desafio' },
];

export const userGamificationSummary = {
  semana: {
    points: 620,
    userRank: 3,
    level: 7,
    levelName: 'Atleta Elite',
    nextLevel: 8,
    pointsRemaining: 180,
    currentLevelProgress: 77,
  },
  mes: {
    points: 2450,
    userRank: 4,
    level: 7,
    levelName: 'Atleta Elite',
    nextLevel: 8,
    pointsRemaining: 150,
    currentLevelProgress: 85,
  },
  historico: {
    points: 8940,
    userRank: 2,
    level: 7,
    levelName: 'Atleta Elite',
    nextLevel: 8,
    pointsRemaining: 150,
    currentLevelProgress: 85,
  },
};

export const leaderboardDataByPeriod: Record<string, LeaderboardAthlete[]> = {
  semana: [
    { rank: 1, name: 'Rodrigo Antunes', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', points: 740, change: 1, level: 8, badge: 'Líder Semanal' },
    { rank: 2, name: 'Beatriz Fonseca', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', points: 690, change: -1, level: 7, badge: 'Consistente' },
    { rank: 3, name: 'Carlos Bernardo', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', points: 620, change: 2, level: 7, badge: 'Tu', isUser: true },
    { rank: 4, name: 'André Moreira', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', points: 580, change: 0, level: 6, badge: 'Focado' },
    { rank: 5, name: 'Marta Ribeiro', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', points: 510, change: -1, level: 6, badge: 'Subindo' },
    { rank: 6, name: 'Tiago Neves', avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80', points: 460, change: 3, level: 5, badge: 'Determinado' },
  ],
  mes: [
    { rank: 1, name: 'Beatriz Fonseca', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', points: 2890, change: 1, level: 8, badge: 'Top 1 Mês' },
    { rank: 2, name: 'Rodrigo Antunes', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', points: 2750, change: -1, level: 8, badge: 'Top 2 Mês' },
    { rank: 3, name: 'Mariana Costa', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', points: 2510, change: 2, level: 7, badge: 'Guerreira' },
    { rank: 4, name: 'Carlos Bernardo', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', points: 2450, change: 1, level: 7, badge: 'Tu', isUser: true },
    { rank: 5, name: 'André Moreira', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', points: 2280, change: -2, level: 6, badge: 'Constante' },
    { rank: 6, name: 'Lucas Vasconcelos', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', points: 2110, change: 0, level: 6, badge: 'Atleta' },
  ],
  historico: [
    { rank: 1, name: 'Rodrigo Antunes', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', points: 9820, change: 0, level: 9, badge: 'Veterano RTEAM' },
    { rank: 2, name: 'Carlos Bernardo', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', points: 8940, change: 1, level: 7, badge: 'Tu', isUser: true },
    { rank: 3, name: 'Beatriz Fonseca', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', points: 8810, change: -1, level: 8, badge: 'Lenda' },
    { rank: 4, name: 'Mariana Costa', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', points: 8240, change: 0, level: 7, badge: 'Elite' },
    { rank: 5, name: 'André Moreira', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', points: 7600, change: 0, level: 6, badge: 'Constante' },
  ],
};

export const initialActiveChallenges: Challenge[] = [
  {
    id: 'ch-1',
    title: 'Desafio 21 Dias Sem Falhas',
    description: 'Manter a sequência perfeita de treinos e registo diário durante 21 dias consecutivos. Cada dia concluído conta para o ranking geral.',
    type: 'consistency',
    targetValue: 21,
    targetUnit: 'dias',
    userProgress: 16,
    daysRemaining: 5,
    totalDays: 21,
    participantsCount: 48,
    participantAvatars: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80'
    ],
    userRank: 3,
    leaderboard: [
      { rank: 1, name: 'Rodrigo Antunes', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', score: 18, scoreUnit: 'dias', progressPercent: 86 },
      { rank: 2, name: 'Beatriz Fonseca', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', score: 17, scoreUnit: 'dias', progressPercent: 81 },
      { rank: 3, name: 'Carlos Bernardo', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', score: 16, scoreUnit: 'dias', progressPercent: 76, isUser: true },
      { rank: 4, name: 'Mariana Costa', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', score: 15, scoreUnit: 'dias', progressPercent: 71 },
      { rank: 5, name: 'Tiago Neves', avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80', score: 14, scoreUnit: 'dias', progressPercent: 67 },
    ],
  },
  {
    id: 'ch-2',
    title: 'Guerra do Cardio 50km',
    description: 'Acumular 50 km de corrida, passadeira ou remo no mês. Conta todo o cardio registado com monitorização.',
    type: 'cardio',
    targetValue: 50,
    targetUnit: 'km',
    userProgress: 38.5,
    daysRemaining: 9,
    totalDays: 30,
    participantsCount: 32,
    participantAvatars: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80'
    ],
    userRank: 4,
    leaderboard: [
      { rank: 1, name: 'Beatriz Fonseca', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', score: 47.2, scoreUnit: 'km', progressPercent: 94 },
      { rank: 2, name: 'Lucas Vasconcelos', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', score: 42.0, scoreUnit: 'km', progressPercent: 84 },
      { rank: 3, name: 'Rodrigo Antunes', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', score: 40.5, scoreUnit: 'km', progressPercent: 81 },
      { rank: 4, name: 'Carlos Bernardo', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', score: 38.5, scoreUnit: 'km', progressPercent: 77, isUser: true },
      { rank: 5, name: 'André Moreira', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', score: 34.0, scoreUnit: 'km', progressPercent: 68 },
    ],
  },
  {
    id: 'ch-3',
    title: 'Meta 20 Treinos no Mês',
    description: 'Concluir 20 sessões de musculação no plano mensal do clube. A consistência nos treinos gera o maior ganho muscular.',
    type: 'workouts',
    targetValue: 20,
    targetUnit: 'treinos',
    userProgress: 17,
    daysRemaining: 11,
    totalDays: 30,
    participantsCount: 64,
    participantAvatars: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
    ],
    userRank: 2,
    leaderboard: [
      { rank: 1, name: 'Rodrigo Antunes', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', score: 19, scoreUnit: 'treinos', progressPercent: 95 },
      { rank: 2, name: 'Carlos Bernardo', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', score: 17, scoreUnit: 'treinos', progressPercent: 85, isUser: true },
      { rank: 3, name: 'Mariana Costa', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', score: 16, scoreUnit: 'treinos', progressPercent: 80 },
    ],
  },
];

export const initialReceivedInvites: Challenge[] = [
  {
    id: 'inv-1',
    title: 'Desafio 10.000 Passos por 14 Dias',
    description: 'Atingir 10.000 passos diários sem falhar durante 2 semanas. Aumenta o teu NEAT e a queima calórica diária.',
    type: 'steps',
    targetValue: 140000,
    targetUnit: 'passos',
    userProgress: 0,
    daysRemaining: 14,
    totalDays: 14,
    participantsCount: 8,
    participantAvatars: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80'
    ],
    userRank: 0,
    isReceivedInvite: true,
    invitedBy: {
      name: 'Mariana Costa',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    },
    leaderboard: [
      { rank: 1, name: 'Mariana Costa', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', score: 24500, scoreUnit: 'passos', progressPercent: 18 },
      { rank: 2, name: 'André Moreira', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', score: 21200, scoreUnit: 'passos', progressPercent: 15 },
    ],
  },
];

export const initialFeedPosts: CommunityPost[] = [
  // 1. Special PR Card
  {
    id: 'post-pr-1',
    author: {
      id: 'user-carlos',
      name: 'Carlos Bernardo',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      role: 'Atleta RTEAM',
      level: 7,
    },
    timestamp: 'Há 1 hora',
    type: 'pr',
    content: 'Hoje foi dia de quebrar barreiras no Supino Reto! Depois de semanas com 102.5kg, consegui meter 110kg sólidos para 5 repetições limpas. Obrigado ao coach André pelas dicas na retração escapular!',
    prData: {
      exercise: 'Supino Reto com Barra',
      newWeight: 110.0,
      previousWeight: 102.5,
      reps: 5,
      diffKg: 7.5,
      diffPercent: 7.3,
    },
    reactions: {
      fire: 24,
      muscle: 38,
      applause: 19,
      rocket: 12,
      heart: 15,
    },
    userReaction: 'muscle',
    comments: [
      {
        id: 'c-101',
        author: {
          id: 'u-coach',
          name: 'Coach André Silva',
          avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
          role: 'Coach RTEAM',
          level: 10,
        },
        text: 'Enorme evolução, Carlos! O arco torácico e a trajetória da barra foram perfeitos. Rumo aos 120kg no próximo ciclo.',
        timestamp: 'Há 45 min',
        likes: 8,
        isLiked: true,
        replies: [
          {
            id: 'cr-101',
            author: {
              id: 'user-carlos',
              name: 'Carlos Bernardo',
              avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
              role: 'Atleta RTEAM',
            },
            text: 'Obrigado mister! Vamos com tudo! 💪🔥',
            timestamp: 'Há 30 min',
            likes: 4,
            isLiked: false,
          }
        ]
      },
      {
        id: 'c-102',
        author: {
          id: 'u-rodrigo',
          name: 'Rodrigo Antunes',
          avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          role: 'Atleta Elite',
          level: 8,
        },
        text: 'Carga pesadíssima irmão! Parabéns!',
        timestamp: 'Há 25 min',
        likes: 3,
        isLiked: false,
      }
    ],
    isSaved: true,
  },

  // 2. Video Post with duration indicator
  {
    id: 'post-video-1',
    author: {
      id: 'u-beatriz',
      name: 'Beatriz Fonseca',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      role: 'Atleta RTEAM',
      level: 8,
    },
    timestamp: 'Há 3 horas',
    type: 'video',
    content: 'Check de profundidade no Agachamento Búlgaro com Halteres de 24kg. Trabalho excêntrico controlado de 3 segundos para queimar os glúteos e quadríceps! 🍑🔥',
    videoDuration: '0:42',
    videoThumbnail: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80',
    reactions: {
      fire: 31,
      muscle: 22,
      applause: 14,
      rocket: 8,
      heart: 19,
    },
    userReaction: 'fire',
    comments: [
      {
        id: 'c-103',
        author: {
          id: 'u-mariana',
          name: 'Mariana Costa',
          avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
          role: 'Atleta RTEAM',
          level: 7,
        },
        text: 'Que forma impecável Bia! Esse tempo sob tensão destrói qualquer um haha 👏',
        timestamp: 'Há 2 horas',
        likes: 5,
        isLiked: false,
      }
    ],
    isSaved: false,
  },

  // 3. Special Achievement (Conquista) Post
  {
    id: 'post-ach-1',
    author: {
      id: 'u-tiago',
      name: 'Tiago Neves',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      role: 'Atleta RTEAM',
      level: 5,
    },
    timestamp: 'Há 5 horas',
    type: 'conquista',
    content: 'Hoje completei a minha 100ª sessão de treino registada na app RTEAM! Comecei há 6 meses sem motivação nenhuma e hoje não imagino o meu dia-a-dia sem puxar ferro. Obrigado a toda a comunidade pelo incentivo diário!',
    achievementData: {
      title: 'Centurião de Ferro',
      category: 'consistencia',
      badgeIcon: 'Trophy',
      highlightText: '100 Treinos Concluídos com Sucesso',
    },
    reactions: {
      fire: 42,
      muscle: 45,
      applause: 51,
      rocket: 29,
      heart: 34,
    },
    userReaction: 'applause',
    comments: [],
    isSaved: false,
  },

  // 4. Multi-Image Post (carousel / grid)
  {
    id: 'post-multi-1',
    author: {
      id: 'u-mariana',
      name: 'Mariana Costa',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      role: 'Atleta RTEAM',
      level: 7,
    },
    timestamp: 'Há 8 horas',
    type: 'multi_image',
    content: 'Treino de costas & ombros com foco em puxadas verticais e elevações laterais na polia. O pump de hoje mereceu registo duplo! ⚡💪',
    images: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&auto=format&fit=crop&q=80'
    ],
    reactions: {
      fire: 29,
      muscle: 18,
      applause: 15,
      rocket: 6,
      heart: 22,
    },
    userReaction: null,
    comments: [],
    isSaved: false,
  },

  // 5. Simple Single Photo Post
  {
    id: 'post-img-1',
    author: {
      id: 'u-rodrigo',
      name: 'Rodrigo Antunes',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'Atleta Elite',
      level: 8,
    },
    timestamp: 'Ontem às 19:45',
    type: 'image',
    content: 'Cardio pós-treino concluído: 6km na passadeira com inclinação a 4%. Hidratação reforçada com eletrólitos e agora descanso merecido.',
    images: [
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&auto=format&fit=crop&q=80'
    ],
    reactions: {
      fire: 18,
      muscle: 14,
      applause: 9,
      rocket: 4,
      heart: 11,
    },
    userReaction: null,
    comments: [],
    isSaved: false,
  },

  // 6. Text Only Post
  {
    id: 'post-text-1',
    author: {
      id: 'u-coach',
      name: 'Coach André Silva',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      role: 'Coach RTEAM',
      level: 10,
    },
    timestamp: 'Ontem às 14:10',
    type: 'text',
    content: '🚨 LEMBRETE PARA A EQUIPA: A recuperação é onde o músculo realmente cresce! Não descurem as 7 a 8 horas de sono de qualidade e a ingestão de pelo menos 2.5L de água hoje. Menos desculpas, mais consistência! 🔥',
    reactions: {
      fire: 56,
      muscle: 48,
      applause: 33,
      rocket: 21,
      heart: 28,
    },
    userReaction: 'fire',
    comments: [
      {
        id: 'c-104',
        author: {
          id: 'user-carlos',
          name: 'Carlos Bernardo',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
          role: 'Atleta RTEAM',
        },
        text: 'Mensagem certeira! Sono e hidratação hoje foram 100%.',
        timestamp: 'Ontem às 15:00',
        likes: 6,
        isLiked: true,
      }
    ],
    isSaved: true,
  }
];

export const initialAchievements: CommunityAchievement[] = [
  {
    id: 'ach-1',
    title: 'Clube dos 100kg no Supino',
    category: 'recordes',
    description: 'Ultrapassou a barreira lendária dos 100 kg no supino com execução validada pelo treinador.',
    date: 'Ontem',
    author: {
      id: 'user-carlos',
      name: 'Carlos Bernardo',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      role: 'Atleta RTEAM',
      level: 7,
    },
    badgeIcon: 'Dumbbell',
    badgeGradient: 'from-amber-500 to-orange-600',
    applauseCount: 42,
    hasApplauded: true,
    metric: '110 kg alcançados',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'ach-2',
    title: 'Mestre da Consistência: 30 Dias 100%',
    category: 'consistencia',
    description: 'Completou todos os treinos e registos de hidratação planeados durante 30 dias seguidos.',
    date: 'Há 3 dias',
    author: {
      id: 'u-beatriz',
      name: 'Beatriz Fonseca',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      role: 'Atleta Elite',
      level: 8,
    },
    badgeIcon: 'Flame',
    badgeGradient: 'from-orange-500 to-red-600',
    applauseCount: 56,
    hasApplauded: false,
    metric: '30 dias seguidos',
  },
  {
    id: 'ach-3',
    title: 'Maratona Mensal de Cardio (100km)',
    category: 'objetivos',
    description: 'Atingiu a meta histórica de 100 km acumulados de corrida e cardio num único mês.',
    date: 'Há 5 dias',
    author: {
      id: 'u-rodrigo',
      name: 'Rodrigo Antunes',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'Atleta Elite',
      level: 8,
    },
    badgeIcon: 'Zap',
    badgeGradient: 'from-yellow-400 to-amber-600',
    applauseCount: 38,
    hasApplauded: false,
    metric: '102.4 km registados',
  },
  {
    id: 'ach-4',
    title: 'Recorde Pessoal no Agachamento (140kg)',
    category: 'recordes',
    description: 'Novo recorde com 140kg para 3 repetições completas com barra olímpica.',
    date: 'Há 1 semana',
    author: {
      id: 'u-mariana',
      name: 'Mariana Costa',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      role: 'Atleta RTEAM',
      level: 7,
    },
    badgeIcon: 'Trophy',
    badgeGradient: 'from-purple-500 to-indigo-600',
    applauseCount: 29,
    hasApplauded: false,
    metric: '140 kg • PR',
  },
  {
    id: 'ach-5',
    title: 'Primeiro Semestre Completo sem Falhas',
    category: 'consistencia',
    description: 'Completou 6 meses consecutivos cumprindo o plano de treino estipulado.',
    date: 'Há 2 semanas',
    author: {
      id: 'u-tiago',
      name: 'Tiago Neves',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      role: 'Atleta RTEAM',
      level: 5,
    },
    badgeIcon: 'Award',
    badgeGradient: 'from-emerald-500 to-teal-600',
    applauseCount: 33,
    hasApplauded: false,
    metric: '6 meses 100%',
  },
  {
    id: 'ach-6',
    title: 'Meta de Gordura Corporal Atingida (12%)',
    category: 'objetivos',
    description: 'Atingiu a meta de composição corporal estipulada na última bioimpedância.',
    date: 'Há 2 semanas',
    author: {
      id: 'user-carlos',
      name: 'Carlos Bernardo',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      role: 'Atleta RTEAM',
      level: 7,
    },
    badgeIcon: 'Target',
    badgeGradient: 'from-blue-500 to-cyan-600',
    applauseCount: 47,
    hasApplauded: true,
    metric: '12.1% GC',
  }
];

export const mockCommunityFriends: CommunityFriend[] = [
  { id: 'f-1', name: 'Rodrigo Antunes', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', level: 8, isFriend: true, status: 'Treinou há 1h' },
  { id: 'f-2', name: 'Beatriz Fonseca', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', level: 8, isFriend: true, status: 'No ginásio agora' },
  { id: 'f-3', name: 'Mariana Costa', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', level: 7, isFriend: true, status: 'Treinou ontem' },
  { id: 'f-4', name: 'André Moreira', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', level: 6, isFriend: true, status: 'Offline' },
  { id: 'f-5', name: 'Tiago Neves', avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80', level: 5, isFriend: false, status: 'Sugerido por Coach André' },
  { id: 'f-6', name: 'Lucas Vasconcelos', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80', level: 6, isFriend: false, status: 'Frequenta mesmo horário' },
  { id: 'f-7', name: 'Sara Mesquita', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', level: 4, isFriend: false, status: 'Nova atleta RTEAM' },
];
