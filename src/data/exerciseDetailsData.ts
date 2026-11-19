export interface ExerciseVideoItem {
  id: string;
  title: string; // e.g. "Vídeo 1 - Execução Frontal", "Vídeo 2 - Ângulo Lateral"
  tag: string; // e.g. "Ângulo Principal", "Vista Lateral", "Correção Técnica"
  thumbnail: string;
  videoUrl?: string;
  duration: string; // e.g. "0:45"
  tips?: string;
}

export interface MuscleAnatomyInfo {
  primaryMuscle: string; // e.g. "Glúteo Máximo"
  secondaryMuscles: string[]; // e.g. ["Glúteo Médio", "Isquiotibiais", "Eretores da Espinha"]
  anatomicalImageUrl: string; // high-quality anatomy illustration
  muscleCategory: string; // e.g. "Membros Inferiores • Cadeia Posterior"
  functionDescription: string; // Biomechanical function
  roleInExercise: string; // Specific involvement in this exercise
  activationLevel: 'Alta' | 'Muito Alta' | 'Isolamento Máximo';
}

export interface TechnicalInstruction {
  setup: string; // Posicionamento inicial
  howToExecute: {
    step: number;
    title: string;
    description: string;
  }[];
  attentionPoints: {
    iconType: 'check' | 'alert' | 'shield';
    title: string;
    description: string;
  }[];
  mistakesToAvoid: string[];
}

export interface DetailedExerciseInfo {
  id: string;
  name: string;
  equipment: string;
  suggestedTempo?: string; // e.g. "3-0-1-1 (Excêntrica controlada)"
  isFavorite?: boolean;
  videos: ExerciseVideoItem[];
  instructions: TechnicalInstruction;
  muscleAnatomy: MuscleAnatomyInfo;
}

// Catálogo com dados profundos e biomecânicos específicos para exercícios do plano
export const exerciseDetailedCatalog: Record<string, Partial<DetailedExerciseInfo>> = {
  // Cable Kick Back / Glute Kickback na Polia
  'cable-kick-back': {
    name: 'Cable Kick Back (Extensão de Quadril na Polia)',
    equipment: 'Polia Baixa com Tornozeleira',
    suggestedTempo: '2-1-1-2 (2s descida, 1s pausa, 1s subida, 2s contração)',
    videos: [
      {
        id: 'vid-ckb-1',
        title: 'Vídeo 1 - Execução Padrão e Alinhamento',
        tag: 'Ângulo Principal',
        thumbnail: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        duration: '0:42',
        tips: 'Foco na extensão pura da anca sem rotação pélvica'
      },
      {
        id: 'vid-ckb-2',
        title: 'Vídeo 2 - Visão Lateral e Estabilização Lombar',
        tag: 'Vista Lateral',
        thumbnail: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        duration: '0:38',
        tips: 'Evitar compensação e arqueamento da coluna lombar'
      }
    ],
    instructions: {
      setup: 'Prende a tornozeleira na polia baixa. Afasta-te cerca de meio metro da torre com o tronco ligeiramente inclinado para a frente (aprox. 30° a 45°), segurando firmemente na estrutura com as duas mãos para manter o core 100% estável.',
      howToExecute: [
        {
          step: 1,
          title: 'Posicionamento e Alinhamento',
          description: 'Apoia o peso na perna de base (ligeiramente fletida). A perna de trabalho começa com o joelho ligeiramente fletido à frente da linha do quadril.'
        },
        {
          step: 2,
          title: 'Fase Concêntrica (Extensão)',
          description: 'Chuta para trás e ligeiramente para fora, estendendo o quadril exclusivamente pela contração do glúteo máximo, sem dobrar as costas.'
        },
        {
          step: 3,
          title: 'Pico de Contração Máxima',
          description: 'No ponto mais alto da extensão, aperta o glúteo deliberadamente por 1 a 2 segundos mantendo a coluna lombar neutra e imóvel.'
        },
        {
          step: 4,
          title: 'Fase Excêntrica Controlada',
          description: 'Retorna a perna de forma suave e resistida até a posição inicial, mantendo a tensão contínua do cabo sem deixar as placas baterem.'
        }
      ],
      attentionPoints: [
        {
          iconType: 'alert',
          title: 'Evitar Hiperextensão Lombar',
          description: 'O movimento deve ocorrer apenas na articulação do quadril. Não curves a coluna lombar no topo para tentar subir a perna mais alto.'
        },
        {
          iconType: 'check',
          title: 'Manter a Pelve Nivelada',
          description: 'Não rodes a bacia para os lados durante o chute. Ambos os ossos ilíacos devem apontar para a frente da torre.'
        },
        {
          iconType: 'shield',
          title: 'Perna de Apoio Estável',
          description: 'Mantém o joelho de apoio destravado e o calcanhar bem fincado ao solo para absorver a força reativa do cabo.'
        }
      ],
      mistakesToAvoid: [
        'Utilizar impulso do tronco para puxar a carga',
        'Girar o quadril para fora durante a fase concêntrica',
        'Subir o peso em excesso comprometendo a amplitude e a conexão muscular',
        'Deixar as placas caírem sem controlo na fase excêntrica'
      ]
    },
    muscleAnatomy: {
      primaryMuscle: 'Glúteo Máximo',
      secondaryMuscles: ['Glúteo Médio', 'Isquiotibiais', 'Eretores da Espinha (estabilização)'],
      anatomicalImageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
      muscleCategory: 'Membros Inferiores • Região Glútea',
      functionDescription: 'O Glúteo Máximo é o músculo mais volumoso e potente do corpo humano. É o motor primário da extensão do quadril, da rotação externa e da retroversão pélvica.',
      roleInExercise: 'Neste exercício, a linha de força do cabo proporciona tensão mecânica contínua exatamente no plano de extensão do quadril, permitindo isolamento supremo das fibras superiores e médias do glúteo máximo sem compressão axial na coluna.',
      activationLevel: 'Isolamento Máximo'
    }
  },

  // Hip Thrust na Barra
  'hip-thrust': {
    name: 'Hip Thrust na Barra',
    equipment: 'Barra Olímpica com Protetor + Banco Estável',
    suggestedTempo: '2-1-1-1 (1s de contração isométrica no topo)',
    videos: [
      {
        id: 'vid-ht-1',
        title: 'Vídeo 1 - Técnica de Apoio Escapular e Pés',
        tag: 'Ângulo Frontal & Lateral',
        thumbnail: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        duration: '0:50',
        tips: 'Olhar sempre direcionado para a frente, queixo recolhido'
      },
      {
        id: 'vid-ht-2',
        title: 'Vídeo 2 - Posição das Canelas a 90° e Extensão',
        tag: 'Vista Lateral',
        thumbnail: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        duration: '0:45',
        tips: 'Bloqueio pélvico no topo com retroversão e ativação total'
      }
    ],
    instructions: {
      setup: 'Senta no chão com as costas apoiadas na borda inferior das escápulas contra um banco estável. Posiciona a barra acolchoada na dobra do quadril (crista ilíaca) e coloca os pés afastados na largura dos ombros.',
      howToExecute: [
        {
          step: 1,
          title: 'Ajuste das Canelas e Pés',
          description: 'Ao subir, as canelas devem ficar verticais formando um ângulo de 90° com as coxas. Os pés apontam ligeiramente para fora.'
        },
        {
          step: 2,
          title: 'Impulso pelos Calcanhares',
          description: 'Empurra o chão através dos calcanhares, estendendo o quadril para cima com firmeza até o tronco e coxas ficarem alinhados horizontalmente.'
        },
        {
          step: 3,
          title: 'Bloqueio e Retroversão Pélvica',
          description: 'No topo do movimento, aperta os glúteos intensamente realizando uma ligeira retroversão pélvica. Mantém o queixo encostado no peito.'
        },
        {
          step: 4,
          title: 'Descida Controlada',
          description: 'Desce o quadril de forma ritmada até perto do chão, mantendo a tensão nos glúteos e a coluna torácica travada contra o banco.'
        }
      ],
      attentionPoints: [
        {
          iconType: 'check',
          title: 'Ângulo de 90° nos Joelhos',
          description: 'Se os pés estiverem muito à frente sentirás mais os isquiotibiais; se muito atrás, sobrecarregarás os quadríceps.'
        },
        {
          iconType: 'alert',
          title: 'Olhar Direcionado para a Frente',
          description: 'Não deites a cabeça para trás no banco. Manter o queixo voltado para o esterno protege a coluna cervical e lombar.'
        },
        {
          iconType: 'shield',
          title: 'Retroversão Pélvica no Topo',
          description: 'Encaixa o quadril para dentro no ápice da subida para máxima solicitação muscular.'
        }
      ],
      mistakesToAvoid: [
        'Hiperestender a coluna lombar na tentativa de subir mais',
        'Empurrar o chão pelas pontas dos pés em vez dos calcanhares',
        'Subir com peso excessivo sem alcançar a extensão completa do quadril'
      ]
    },
    muscleAnatomy: {
      primaryMuscle: 'Glúteo Máximo',
      secondaryMuscles: ['Glúteo Médio', 'Isquiotibiais', 'Quadríceps', 'Core Abdominal'],
      anatomicalImageUrl: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=800&auto=format&fit=crop',
      muscleCategory: 'Membros Inferiores • Glúteo',
      functionDescription: 'O Glúteo Máximo é o principal extensor da articulação coxofemoral e o maior estabilizador da bacia.',
      roleInExercise: 'O Hip Thrust é considerado o padrão-ouro de ativação do glúteo máximo, pois a carga é perpendicular ao quadril exatamente no ponto de máxima contração isométrica e encurtamento das fibras musculares.',
      activationLevel: 'Muito Alta'
    }
  },

  // Agachamento Búlgaro com Halteres
  'agachamento-bulgaro': {
    name: 'Agachamento Búlgaro com Halteres',
    equipment: 'Halteres + Banco Reto',
    suggestedTempo: '3-1-1-0 (Descida profunda e controlada em 3 segundos)',
    videos: [
      {
        id: 'vid-ab-1',
        title: 'Vídeo 1 - Posicionamento e Inclinação do Tronco',
        tag: 'Ângulo Lateral',
        thumbnail: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        duration: '0:48',
        tips: 'Inclinar o tronco levemente à frente para foco no glúteo'
      },
      {
        id: 'vid-ab-2',
        title: 'Vídeo 2 - Profundidade e Trajetória do Joelho',
        tag: 'Vista Frontal',
        thumbnail: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=800&auto=format&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        duration: '0:44',
        tips: 'Evitar colapso em valgo (joelho a cair para dentro)'
      }
    ],
    instructions: {
      setup: 'Em pé, a cerca de dois a três passos de distância à frente de um banco. Apoia o peito do pé de trás na superfície do banco e segura os halteres firmemente ao lado do corpo com postura ereta.',
      howToExecute: [
        {
          step: 1,
          title: 'Distribuição de Peso e Equilíbrio',
          description: 'Aproximadamente 85% do teu peso deve repousar sobre o calcanhar e centro do pé da perna dianteira.'
        },
        {
          step: 2,
          title: 'Descida Profunda e Controlada',
          description: 'Flexiona o joelho e quadril dianteiros, descendo o corpo verticalmente e ligeiramente para trás até a coxa dianteira ficar paralela ao solo.'
        },
        {
          step: 3,
          title: 'Inclinação do Tronco Estratégica',
          description: 'Inclina o tronco levemente para a frente mantendo a coluna reta para maximizar o alongamento das fibras do glúteo.'
        },
        {
          step: 4,
          title: 'Subida Explosiva pelo Calcanhar',
          description: 'Empurra o solo através do calcanhar da perna da frente até retornar à posição de partida sem travar o joelho de forma rígida.'
        }
      ],
      attentionPoints: [
        {
          iconType: 'alert',
          title: 'Cuidado com o Valgo Dinâmico',
          description: 'O joelho da frente deve seguir rigorosamente a direção do 2º e 3º dedo do pé, sem ceder para dentro.'
        },
        {
          iconType: 'check',
          title: 'Alongamento Máximo',
          description: 'Desce até que o joelho traseiro quase toque suavemente no solo para amplitude completa.'
        },
        {
          iconType: 'shield',
          title: 'Estabilidade do Core',
          description: 'Ativa o abdómen antes de iniciar a descida para evitar oscilações laterais.'
        }
      ],
      mistakesToAvoid: [
        'Colocar peso excessivo no pé de trás que está no banco',
        'Distância entre o pé dianteiro e o banco demasiado curta gerando pressão patelar',
        'Perder o equilíbrio por olhar para os lados durante a série'
      ]
    },
    muscleAnatomy: {
      primaryMuscle: 'Glúteo Máximo & Quadríceps',
      secondaryMuscles: ['Glúteo Médio', 'Isquiotibiais', 'Adutores', 'Panturrilhas'],
      anatomicalImageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop',
      muscleCategory: 'Membros Inferiores • Unilateral',
      functionDescription: 'Exercício unilateral poliarticular que recruta a musculatura extensora do quadril e do joelho com enorme exigência de estabilização pélvica.',
      roleInExercise: 'O glúteo máximo é submetido a um estiramento excêntrico profundo no fundo do movimento, promovendo forte estímulo mecânico para hipertrofia com correção de assimetrias.',
      activationLevel: 'Muito Alta'
    }
  },

  // Leg Press 45°
  'leg-press': {
    name: 'Leg Press 45°',
    equipment: 'Máquina Leg Press 45° Articulada',
    suggestedTempo: '3-0-1-0 (Descida em 3 segundos com amplitude total)',
    videos: [
      {
        id: 'vid-lp-1',
        title: 'Vídeo 1 - Posicionamento dos Pés e Amplitude',
        tag: 'Vista Frontal & Ângulo',
        thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        duration: '0:46',
        tips: 'Nunca descolar a lombar do encosto'
      },
      {
        id: 'vid-lp-2',
        title: 'Vídeo 2 - Não Bloqueio Articular dos Joelhos',
        tag: 'Vista Lateral',
        thumbnail: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        duration: '0:39',
        tips: 'Manter tensão constante no topo sem trancar articulações'
      }
    ],
    instructions: {
      setup: 'Acomoda a lombar e o quadril completamente apoiados no encosto do aparelho. Posiciona os pés na plataforma na largura dos ombros com as pontas ligeiramente voltadas para fora.',
      howToExecute: [
        {
          step: 1,
          title: 'Destravar e Estabilizar',
          description: 'Destrava a máquina segurando firmemente nas pegas laterais para puxar ativamente o quadril contra o assento.'
        },
        {
          step: 2,
          title: 'Descida Controlada e Profunda',
          description: 'Flexiona os joelhos trazendo a plataforma em direção ao peito até atingir um ângulo de pelo menos 90 graus nas pernas sem descolar o sacro.'
        },
        {
          step: 3,
          title: 'Empurrão pelos Calcanhares',
          description: 'Expele o ar e empurra a plataforma com força distribuída pela sola dos pés e calcanhares.'
        },
        {
          step: 4,
          title: 'Ponto Alto com Joelhos Destravados',
          description: 'Finaliza a subida antes do bloqueio ósseo completo (hiperestensão) para manter o estímulo contínuo nos músculos.'
        }
      ],
      attentionPoints: [
        {
          iconType: 'alert',
          title: 'Retrognatismo / Descolamento Pélvico',
          description: 'Se a bacia enrolar para cima na descida, reduz imediatamente a amplitude. Manter a lombar colada evita hérnias discais.'
        },
        {
          iconType: 'shield',
          title: 'Proibido Travar Joelhos no Topo',
          description: 'Travar as pernas desvia a sobrecarga para a articulação do joelho e ligamentos, diminuindo a segurança.'
        },
        {
          iconType: 'check',
          title: 'Pés no Alto para Foco no Glúteo',
          description: 'Posicionar os pés mais altos na plataforma aumenta a ênfase na cadeia posterior e glúteos.'
        }
      ],
      mistakesToAvoid: [
        'Apoiar as mãos sobre os joelhos durante a subida',
        'Deixar os calcanhares saírem da plataforma',
        'Fazer repetições curtas demais por excesso de carga'
      ]
    },
    muscleAnatomy: {
      primaryMuscle: 'Quadríceps & Glúteo Máximo',
      secondaryMuscles: ['Isquiotibiais', 'Adutores'],
      anatomicalImageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
      muscleCategory: 'Membros Inferiores • Cadeia Completa',
      functionDescription: 'Extensão em cadeia cinética fechada com grande recrutamento sinérgico de quadríceps e extensores da anca.',
      roleInExercise: 'Permite sobrecarga mecânica elevada e progressão de força com suporte seguro para o tronco.',
      activationLevel: 'Muito Alta'
    }
  },

  // Cadeira Abdutora
  'cadeira-abdutora': {
    name: 'Cadeira Abdutora',
    equipment: 'Máquina Abdutora Sentada',
    suggestedTempo: '2-2-1-0 (2s de isometria no ponto de máxima abertura)',
    videos: [
      {
        id: 'vid-ca-1',
        title: 'Vídeo 1 - Execução com Tronco Inclinado',
        tag: 'Execução Recomendada',
        thumbnail: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=800&auto=format&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        duration: '0:35',
        tips: 'Tronco ligeiramente inclinado projeta mais o glúteo médio'
      }
    ],
    instructions: {
      setup: 'Ajusta as almofadas na parte externa dos joelhos. Inclina o tronco ligeiramente para a frente (apoiando as mãos nas pegas) mantendo a coluna neutra e os pés firmes nos apoios.',
      howToExecute: [
        {
          step: 1,
          title: 'Início da Abdução',
          description: 'Abre as pernas empurrando as almofadas através da força dos joelhos e da lateral do quadril.'
        },
        {
          step: 2,
          title: 'Isometria de Pico',
          description: 'No ponto de amplitude máxima, sustenta a contração durante 2 segundos completos sentindo o ardor no glúteo médio.'
        },
        {
          step: 3,
          title: 'Retorno Suave',
          description: 'Fecha as pernas de forma lenta e controlada, parando antes de as placas tocarem para manter a tensão mecânica contínua.'
        }
      ],
      attentionPoints: [
        {
          iconType: 'check',
          title: 'Empurrar com os Joelhos',
          description: 'A força deve ser exercida pela lateral do fémur/joelho e não pelos pés.'
        },
        {
          iconType: 'alert',
          title: 'Não Descolar o Quadril',
          description: 'Permanece com o assento bem ocupado para isolar a musculatura abdutora.'
        }
      ],
      mistakesToAvoid: [
        'Utilizar impulso rápido das pernas sem segurar a contração',
        'Deixar os joelhos colidirem com força no retorno'
      ]
    },
    muscleAnatomy: {
      primaryMuscle: 'Glúteo Médio & Mínimo',
      secondaryMuscles: ['Tensor da Fáscia Lata', 'Piriforme'],
      anatomicalImageUrl: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?q=80&w=800&auto=format&fit=crop',
      muscleCategory: 'Região Glútea Lateral',
      functionDescription: 'O Glúteo Médio é o principal abdutor do quadril e o estabilizador fundamental da pelve no plano frontal.',
      roleInExercise: 'Promove preenchimento da porção lateral/superior dos glúteos e estabilização articular indispensável para a marcha e agachamentos.',
      activationLevel: 'Isolamento Máximo'
    }
  },

  // Stiff com Barra Olímpica
  'stiff': {
    name: 'Stiff com Barra Olímpica',
    equipment: 'Barra Olímpica ou Halteres',
    suggestedTempo: '3-1-1-0 (3s na descida controlada sentindo o estiramento)',
    videos: [
      {
        id: 'vid-stf-1',
        title: 'Vídeo 1 - Dobradiça de Quadril (Hip Hinge)',
        tag: 'Visão Lateral Obrigatória',
        thumbnail: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        duration: '0:49',
        tips: 'Projetar o bumbum para trás como se fosse fechar uma porta'
      }
    ],
    instructions: {
      setup: 'Em pé, segura a barra com pegada pronada na largura dos ombros. Mantém os pés alinhados com o quadril, peito aberto e joelhos semifletidos (apenas destravados).',
      howToExecute: [
        {
          step: 1,
          title: 'Iniciação pelo Quadril (Hip Hinge)',
          description: 'Leva o quadril para trás enquanto o tronco desce em linha reta, mantendo a barra deslizando muito rente às pernas.'
        },
        {
          step: 2,
          title: 'Alongamento Máximo Posterior',
          description: 'Desce até a linha média das canelas ou até sentir o estiramento profundo dos isquiotibiais, mantendo a curvatura lordótica natural da coluna.'
        },
        {
          step: 3,
          title: 'Subida por Extensão Pélvica',
          description: 'Contrai os glúteos e isquiotibiais para puxar o quadril para a frente até a posição em pé, sem hiperestender a lombar no topo.'
        }
      ],
      attentionPoints: [
        {
          iconType: 'alert',
          title: 'Barra Rente às Pernas',
          description: 'Se a barra se afastar da linha do corpo, o braço de alavanca sobre a lombar aumenta perigosamente.'
        },
        {
          iconType: 'shield',
          title: 'Coluna 100% Neutra',
          description: 'Nunca arredonde as costas. Se sentires arredondamento, reduz a amplitude de descida.'
        }
      ],
      mistakesToAvoid: [
        'Agachar dobrando os joelhos em demasia (transformando o stiff em agachamento)',
        'Arredondar a coluna torácica ou lombar',
        'Jogar a cabeça para cima hiperestendendo o pescoço'
      ]
    },
    muscleAnatomy: {
      primaryMuscle: 'Isquiotibiais & Glúteo Máximo',
      secondaryMuscles: ['Eretores da Espinha', 'Trapézio', 'Adutores'],
      anatomicalImageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop',
      muscleCategory: 'Cadeia Posterior • Membros Inferiores',
      functionDescription: 'Os isquiotibiais realizam a extensão do quadril e flexão do joelho, atuando como potentes desaceleradores.',
      roleInExercise: 'O Stiff proporciona um dos maiores estímulos de hipertrofia mediada pelo estiramento sob carga pesada.',
      activationLevel: 'Muito Alta'
    }
  },

  // Puxada Frontal na Polia
  'puxada-frontal': {
    name: 'Puxada Frontal na Polia (Lat Pulldown)',
    equipment: 'Polia Alta com Barra Reta ou Curva',
    suggestedTempo: '2-1-1-1 (Pausa no queixo e estiramento controlado)',
    videos: [
      {
        id: 'vid-pf-1',
        title: 'Vídeo 1 - Depressão Escapular e Trajetória',
        tag: 'Execução Frontal',
        thumbnail: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        duration: '0:42',
        tips: 'Puxar os cotovelos para baixo em direção aos bolsos'
      }
    ],
    instructions: {
      setup: 'Ajusta as almofadas para travar as coxas com firmeza. Segura a barra com pegada pronada ligeiramente mais larga que os ombros.',
      howToExecute: [
        {
          step: 1,
          title: 'Depressão Escapular Inicial',
          description: 'Antes de fletir os braços, puxa as omoplatas para baixo e para trás com o peito estufado.'
        },
        {
          step: 2,
          title: 'Tração em Direção à Clavícula',
          description: 'Puxa a barra em direção à parte superior do peitoral, direcionando os cotovelos para baixo e ligeiramente para trás.'
        },
        {
          step: 3,
          title: 'Subida e Alongamento do Dorsal',
          description: 'Permite que a barra suba suavemente, estendendo os braços por completo para alongar a grande dorsal.'
        }
      ],
      attentionPoints: [
        {
          iconType: 'check',
          title: 'Peito Aberto e Elevado',
          description: 'Mantém a caixa torácica expandida para garantir alinhamento das fibras do dorsal.'
        },
        {
          iconType: 'alert',
          title: 'Evitar Balanço Excessivo',
          description: 'Inclinação de no máximo 10 a 15 graus com o tronco estável, sem embalar.'
        }
      ],
      mistakesToAvoid: [
        'Puxar a barra por trás da nuca gerando risco de impacto nos ombros',
        'Usar a força exclusiva dos bíceps em vez de puxar pelos cotovelos'
      ]
    },
    muscleAnatomy: {
      primaryMuscle: 'Grande Dorsal (Latissimus Dorsi)',
      secondaryMuscles: ['Bíceps Braquial', 'Redondo Maior', 'Romboides', 'Deltoide Posterior'],
      anatomicalImageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
      muscleCategory: 'Membros Superiores • Costas',
      functionDescription: 'O Grande Dorsal é o maior músculo das costas, responsável pela adução e extensão do braço.',
      roleInExercise: 'Proporciona a largura em "V" das costas e estabilização escapulotorácica.',
      activationLevel: 'Muito Alta'
    }
  },

  // Supino Reto com Barra
  'supino-reto': {
    name: 'Supino Reto com Barra',
    equipment: 'Banco Reto + Barra Olímpica',
    suggestedTempo: '3-1-1-0 (Descida cadenciada e toque leve no peito)',
    videos: [
      {
        id: 'vid-sr-1',
        title: 'Vídeo 1 - Ponte Escapular e Ponto de Contacto',
        tag: 'Vista Lateral & Topo',
        thumbnail: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        duration: '0:45',
        tips: 'Travar as escápulas juntas e para baixo contra o banco'
      }
    ],
    instructions: {
      setup: 'Deita no banco com os olhos alinhados verticalmente abaixo da barra. Pés bem apoiados no solo gerando leg drive. Retrai e deprime as escápulas contra o encosto.',
      howToExecute: [
        {
          step: 1,
          title: 'Pegada e Desengate',
          description: 'Segura a barra com pegada pronada na largura de 1,5 vezes os ombros. Desengata com os braços estendidos.'
        },
        {
          step: 2,
          title: 'Descida Controlada ao Esterno',
          description: 'Desce a barra com os cotovelos em ângulo aproximado de 45° a 70° em relação ao tronco, tocando suavemente na linha inferior do peito.'
        },
        {
          step: 3,
          title: 'Empurrão Forte em Arco Suave',
          description: 'Empurra a barra para cima e ligeiramente para trás em direção aos ombros, mantendo o peito expandido.'
        }
      ],
      attentionPoints: [
        {
          iconType: 'shield',
          title: 'Retração Escapular Essencial',
          description: 'Nunca projete os ombros para a frente no topo do movimento; mantém as omoplatas coladas ao banco.'
        },
        {
          iconType: 'alert',
          title: 'Não Deixar a Barra Bater no Peito',
          description: 'Evita quicar a barra contra o esterno para não provocar lesões na cartilagem costal.'
        }
      ],
      mistakesToAvoid: [
        'Abrir os cotovelos a 90 graus sobrecarregando o manguito rotador',
        'Tirar a bacia ou os pés do chão durante o esforço máximo'
      ]
    },
    muscleAnatomy: {
      primaryMuscle: 'Peitoral Maior (Esternocostal & Clavicular)',
      secondaryMuscles: ['Deltoide Anterior', 'Tríceps Braquial', 'Serrátil Anterior'],
      anatomicalImageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800&auto=format&fit=crop',
      muscleCategory: 'Membros Superiores • Tronco Anterior',
      functionDescription: 'O Peitoral Maior é o motor principal da flexão e adução horizontal do ombro.',
      roleInExercise: 'Construtor fundamental de massa e densidade peitoral com transferência direta de força de empurrar.',
      activationLevel: 'Muito Alta'
    }
  }
};

// Gerador dinâmico contextual para garantir que 100% dos exercícios têm dados biomecânicos e vídeos de demonstração
export function getExerciseDetailedInfo(exercise: {
  id?: string;
  name: string;
  equipment?: string;
  muscleTarget?: string;
  image?: string;
  notes?: string;
  isFavorite?: boolean;
}): DetailedExerciseInfo {
  const norm = (exercise.name || '').toLowerCase();

  // Procurar no catálogo por correspondência de palavras-chave
  let matchedKey: string | null = null;
  if (norm.includes('kick') || norm.includes('glute kickback') || norm.includes('cable kick')) matchedKey = 'cable-kick-back';
  else if (norm.includes('thrust') || norm.includes('pélvica') || norm.includes('hip')) matchedKey = 'hip-thrust';
  else if (norm.includes('búlgaro') || norm.includes('bulgaro')) matchedKey = 'agachamento-bulgaro';
  else if (norm.includes('leg press')) matchedKey = 'leg-press';
  else if (norm.includes('abdutora') || norm.includes('abdução')) matchedKey = 'cadeira-abdutora';
  else if (norm.includes('stiff') || norm.includes('terra')) matchedKey = 'stiff';
  else if (norm.includes('puxada') || norm.includes('lat pull')) matchedKey = 'puxada-frontal';
  else if (norm.includes('supino') || norm.includes('bench press')) matchedKey = 'supino-reto';

  if (matchedKey && exerciseDetailedCatalog[matchedKey]) {
    const base = exerciseDetailedCatalog[matchedKey]!;
    return {
      id: exercise.id || `ex-${matchedKey}`,
      name: exercise.name || base.name || 'Exercício',
      equipment: exercise.equipment || base.equipment || 'Equipamento Ginásio',
      suggestedTempo: base.suggestedTempo || '2-0-1-1',
      isFavorite: exercise.isFavorite ?? false,
      videos: base.videos || [],
      instructions: base.instructions!,
      muscleAnatomy: base.muscleAnatomy!
    };
  }

  // Geração dinâmica contextual de fallback quando o exercício não estiver pré-cadastrado no catálogo
  const primaryMuscle = exercise.muscleTarget?.split('&')[0]?.trim() || 
    (norm.includes('glúteo') || norm.includes('gluteo') ? 'Glúteo Máximo' :
     norm.includes('perna') || norm.includes('quad') ? 'Quadríceps Femoral' :
     norm.includes('costas') || norm.includes('dorsal') || norm.includes('remada') ? 'Grande Dorsal' :
     norm.includes('peito') || norm.includes('supino') ? 'Peitoral Maior' :
     norm.includes('ombro') || norm.includes('elevação') ? 'Deltoide' :
     norm.includes('braço') || norm.includes('bíceps') ? 'Bíceps Braquial' :
     norm.includes('tríceps') ? 'Tríceps Braquial' : 'Músculo Alvo');

  const fallbackImage = exercise.image || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop';

  return {
    id: exercise.id || 'ex-default',
    name: exercise.name,
    equipment: exercise.equipment || 'Equipamento Ginásio P1',
    suggestedTempo: '2-1-1-1 (Execução técnica cadenciada)',
    isFavorite: exercise.isFavorite ?? false,
    videos: [
      {
        id: `vid-${exercise.id || '1'}-1`,
        title: 'Vídeo 1 - Execução Técnica e Postura',
        tag: 'Vista Principal',
        thumbnail: fallbackImage,
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        duration: '0:45',
        tips: 'Manter ativação constante do core e amplitude completa'
      },
      {
        id: `vid-${exercise.id || '1'}-2`,
        title: 'Vídeo 2 - Visão Lateral e Ângulo Articular',
        tag: 'Correção Técnica',
        thumbnail: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=800&auto=format&fit=crop',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        duration: '0:38',
        tips: 'Controle excêntrico e postura da coluna'
      }
    ],
    instructions: {
      setup: exercise.notes 
        ? `${exercise.notes} Ajusta a carga sugerida e alinha o corpo com estabilidade total antes da primeira repetição.`
        : `Posiciona-te de forma confortável com alinhamento anatómico neutro, ajustando o equipamento conforme a tua estatura.`,
      howToExecute: [
        {
          step: 1,
          title: 'Posicionamento Inicial Estável',
          description: 'Ajusta a pegada ou os apoios garantindo base sólida e alinhamento articular antes de retirar a carga.'
        },
        {
          step: 2,
          title: 'Fase Concêntrica (Ação Muscular)',
          description: `Contrai os músculos principais (${primaryMuscle}) de forma fluida e potente, expirando o ar durante a fase de esforço.`
        },
        {
          step: 3,
          title: 'Pico de Contração Máxima',
          description: 'Segura o movimento no ponto de máxima contração durante 1 segundo para recrutar o maior número de unidades motoras.'
        },
        {
          step: 4,
          title: 'Fase Excêntrica (Retorno Controlado)',
          description: 'Retorna à posição inicial em 2 a 3 segundos mantendo a tensão contínua sem relaxar a musculatura no ponto de partida.'
        }
      ],
      attentionPoints: [
        {
          iconType: 'check',
          title: 'Alinhamento e Estabilidade',
          description: 'Mantém a coluna em posição neutra e o abdómen contraído durante todas as repetições.'
        },
        {
          iconType: 'alert',
          title: 'Evitar Compensações Articulares',
          description: 'Não utilizes embalo ou movimentos bruscos que retirem o foco do músculo principal alvo.'
        },
        {
          iconType: 'shield',
          title: 'Cadência Respiratória',
          description: 'Inspira durante a descida e expira durante a contração máxima para manter pressão intra-abdominal estável.'
        }
      ],
      mistakesToAvoid: [
        'Utilizar carga excessiva que comprometa a amplitude de movimento',
        'Acelerar a fase excêntrica deixando o peso cair',
        'Perder a postura neutra da coluna durante as últimas repetições'
      ]
    },
    muscleAnatomy: {
      primaryMuscle: primaryMuscle,
      secondaryMuscles: ['Músculos Estabilizadores', 'Core Abdominal'],
      anatomicalImageUrl: fallbackImage,
      muscleCategory: exercise.muscleTarget || 'Grupo Muscular Principal',
      functionDescription: `Responsável pela contração e estabilização primária nos planos de movimento deste exercício, assegurando transferência de força e eficiência mecânica.`,
      roleInExercise: `Atua como motor primário na fase concêntrica, recebendo o maior pico de tensão e estímulo hipertrófico durante a execução.`,
      activationLevel: 'Alta'
    }
  };
}
