import dietPlanBalancedImg from '../assets/images/diet_plan_balanced_1795019143786.jpg';
import dietPlanTreinoImg from '../assets/images/diet_plan_treino_1795019145620.jpg';
import dietPlanDescansoImg from '../assets/images/diet_plan_descanso_1795019143382.jpg';

export type DietPlanType = 'training' | 'rest' | 'refeed' | 'custom';

export interface DietPlan {
  id: string;
  name: string;
  type: DietPlanType;
  imageUrl: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

export interface DietNoteAttachment {
  id: string;
  name: string;
  sizeLabel: string;
}

export interface PtDietNote {
  id: string;
  author: string;
  updatedAt: string;
  message: string;
  attachments?: DietNoteAttachment[];
}

export const FALLBACK_DIET_PLAN_IMAGE = dietPlanBalancedImg;

/**
 * Planos alimentares atribuídos ao aluno pelo profissional na plataforma de gestão.
 * A quantidade, nomes e totais nutricionais refletem diretamente o configurado pelo treinador/nutricionista.
 */
export const ASSIGNED_DIET_PLANS: DietPlan[] = [
  {
    id: 'plan-treino',
    name: 'Treino',
    type: 'training',
    imageUrl: dietPlanTreinoImg,
    calories: 2540,
    proteinGrams: 185,
    carbsGrams: 285,
    fatGrams: 68,
  },
  {
    id: 'plan-descanso',
    name: 'Dias de Descanso',
    type: 'rest',
    imageUrl: dietPlanDescansoImg,
    calories: 2050,
    proteinGrams: 175,
    carbsGrams: 170,
    fatGrams: 74,
  },
];

/**
 * Nota definida pelo PT / profissional na plataforma de gestão (apenas leitura para o aluno).
 */
export const PT_DIET_NOTE: PtDietNote | null = {
  id: 'pt-note-1',
  author: 'Coach André',
  updatedAt: '16 Nov 2026',
  message:
    'Manter ingestão mínima de 3L de água por dia. Nos dias de treino, priorizar a refeição pré-treino 60 a 90 minutos antes da sessão e manter 5g de creatina diariamente após o treino.',
  attachments: [
    {
      id: 'pt-att-1',
      name: 'Guia_Substituicoes_RTEAM.pdf',
      sizeLabel: '420 KB',
    },
  ],
};

export function formatKcal(value: number): string {
  return value.toLocaleString('pt-PT');
}
