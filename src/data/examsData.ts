export type ExamCategoryId =
  | 'hemograma-lh-fsh'
  | 'perfil-glicidico'
  | 'perfil-lipidico'
  | 'funcao-hepatica'
  | 'funcao-renal'
  | 'vitaminas-minerais'
  | 'funcao-tiroideia';

export type ExamResultStatus = 'below' | 'normal' | 'above';

export interface ExamAnalysisDate {
  id: string;
  isoDate: string; // YYYY-MM-DD
  shortDate: string; // e.g. '14 Out 2026'
  longDate: string; // e.g. '14 de Outubro, 2026'
  labName: string;
  physician: string;
}

export interface ExamParameterDefinition {
  id: string;
  name: string;
  unit: string;
  referenceText: string;
  refMin?: number;
  refMax?: number;
  subcategory?: string;
  valuesByDate: Record<string, number>;
}

export interface ExamCategoryDefinition {
  id: ExamCategoryId;
  name: string;
  shortDescription: string;
  orderIndex: number;
  parameters: ExamParameterDefinition[];
}

export const EXAM_ANALYSIS_DATES: ExamAnalysisDate[] = [
  {
    id: '2026-10-14',
    isoDate: '2026-10-14',
    shortDate: '14 Out 2026',
    longDate: '14 de Outubro, 2026',
    labName: 'Laboratório Synlab Lisboa',
    physician: 'Dr. Tiago Mendes',
  },
  {
    id: '2026-06-12',
    isoDate: '2026-06-12',
    shortDate: '12 Jun 2026',
    longDate: '12 de Junho, 2026',
    labName: 'Laboratório Synlab Lisboa',
    physician: 'Dr. Tiago Mendes',
  },
  {
    id: '2026-02-08',
    isoDate: '2026-02-08',
    shortDate: '08 Fev 2026',
    longDate: '08 de Fevereiro, 2026',
    labName: 'Laboratório Unilabs',
    physician: 'Dra. Beatriz Costa',
  },
  {
    id: '2025-10-15',
    isoDate: '2025-10-15',
    shortDate: '15 Out 2025',
    longDate: '15 de Outubro, 2025',
    labName: 'Laboratório Unilabs',
    physician: 'Dra. Beatriz Costa',
  },
];

export const EXAM_CATEGORIES: ExamCategoryDefinition[] = [
  {
    id: 'hemograma-lh-fsh',
    name: 'Hemograma, LH e FSH',
    shortDescription: 'Série vermelha, série branca, plaquetas e gonadotrofinas',
    orderIndex: 1,
    parameters: [
      // Eritrograma
      {
        id: 'eritrocitos',
        name: 'Eritrócitos',
        unit: '10⁶/µL',
        referenceText: '4,50 – 5,90',
        refMin: 4.5,
        refMax: 5.9,
        subcategory: 'Eritrograma',
        valuesByDate: {
          '2026-10-14': 5.12,
          '2026-06-12': 5.04,
          '2026-02-08': 4.88,
          '2025-10-15': 4.92,
        },
      },
      {
        id: 'hemoglobina',
        name: 'Hemoglobina',
        unit: 'g/dL',
        referenceText: '13,5 – 17,5',
        refMin: 13.5,
        refMax: 17.5,
        subcategory: 'Eritrograma',
        valuesByDate: {
          '2026-10-14': 15.2,
          '2026-06-12': 14.8,
          '2026-02-08': 14.3,
          '2025-10-15': 14.5,
        },
      },
      {
        id: 'hematocrito',
        name: 'Hematócrito',
        unit: '%',
        referenceText: '40,0 – 52,0',
        refMin: 40.0,
        refMax: 52.0,
        subcategory: 'Eritrograma',
        valuesByDate: {
          '2026-10-14': 45.4,
          '2026-06-12': 44.6,
          '2026-02-08': 43.1,
          '2025-10-15': 43.8,
        },
      },
      {
        id: 'vgm',
        name: 'VGM (Vol. Globular Médio)',
        unit: 'fL',
        referenceText: '80,0 – 98,0',
        refMin: 80.0,
        refMax: 98.0,
        subcategory: 'Eritrograma',
        valuesByDate: {
          '2026-10-14': 88.7,
          '2026-06-12': 88.5,
          '2026-02-08': 88.3,
          '2025-10-15': 89.0,
        },
      },
      {
        id: 'hgm',
        name: 'HGM (Hemog. Glob. Média)',
        unit: 'pg',
        referenceText: '27,0 – 33,0',
        refMin: 27.0,
        refMax: 33.0,
        subcategory: 'Eritrograma',
        valuesByDate: {
          '2026-10-14': 29.7,
          '2026-06-12': 29.4,
          '2026-02-08': 29.3,
          '2025-10-15': 29.5,
        },
      },
      {
        id: 'chgm',
        name: 'CHGM',
        unit: 'g/dL',
        referenceText: '32,0 – 36,0',
        refMin: 32.0,
        refMax: 36.0,
        subcategory: 'Eritrograma',
        valuesByDate: {
          '2026-10-14': 33.5,
          '2026-06-12': 33.2,
          '2026-02-08': 33.2,
          '2025-10-15': 33.1,
        },
      },
      {
        id: 'rdw',
        name: 'RDW',
        unit: '%',
        referenceText: '11,5 – 14,5',
        refMin: 11.5,
        refMax: 14.5,
        subcategory: 'Eritrograma',
        valuesByDate: {
          '2026-10-14': 12.6,
          '2026-06-12': 12.9,
          '2026-02-08': 13.1,
          '2025-10-15': 12.8,
        },
      },

      // Leucograma
      {
        id: 'leucocitos',
        name: 'Leucócitos',
        unit: '10³/µL',
        referenceText: '4,00 – 10,50',
        refMin: 4.0,
        refMax: 10.5,
        subcategory: 'Leucograma',
        valuesByDate: {
          '2026-10-14': 6.45,
          '2026-06-12': 6.82,
          '2026-02-08': 7.1,
          '2025-10-15': 6.2,
        },
      },
      {
        id: 'neutrofilos',
        name: 'Neutrófilos',
        unit: '%',
        referenceText: '40,0 – 75,0',
        refMin: 40.0,
        refMax: 75.0,
        subcategory: 'Leucograma',
        valuesByDate: {
          '2026-10-14': 56.2,
          '2026-06-12': 58.0,
          '2026-02-08': 59.4,
          '2025-10-15': 55.1,
        },
      },
      {
        id: 'linfocitos',
        name: 'Linfócitos',
        unit: '%',
        referenceText: '20,0 – 45,0',
        refMin: 20.0,
        refMax: 45.0,
        subcategory: 'Leucograma',
        valuesByDate: {
          '2026-10-14': 33.8,
          '2026-06-12': 31.5,
          '2026-02-08': 30.2,
          '2025-10-15': 34.4,
        },
      },
      {
        id: 'monocitos',
        name: 'Monócitos',
        unit: '%',
        referenceText: '2,0 – 10,0',
        refMin: 2.0,
        refMax: 10.0,
        subcategory: 'Leucograma',
        valuesByDate: {
          '2026-10-14': 6.8,
          '2026-06-12': 7.1,
          '2026-02-08': 6.9,
          '2025-10-15': 7.2,
        },
      },
      {
        id: 'eosinofilos',
        name: 'Eosinófilos',
        unit: '%',
        referenceText: '0,5 – 5,0',
        refMin: 0.5,
        refMax: 5.0,
        subcategory: 'Leucograma',
        valuesByDate: {
          '2026-10-14': 2.5,
          '2026-06-12': 2.8,
          '2026-02-08': 2.9,
          '2025-10-15': 2.7,
        },
      },
      {
        id: 'basofilos',
        name: 'Basófilos',
        unit: '%',
        referenceText: '0,0 – 1,5',
        refMin: 0.0,
        refMax: 1.5,
        subcategory: 'Leucograma',
        valuesByDate: {
          '2026-10-14': 0.7,
          '2026-06-12': 0.6,
          '2026-02-08': 0.6,
          '2025-10-15': 0.6,
        },
      },

      // Plaquetas
      {
        id: 'plaquetas',
        name: 'Plaquetas',
        unit: '10³/µL',
        referenceText: '150 – 400',
        refMin: 150,
        refMax: 400,
        subcategory: 'Plaquetas',
        valuesByDate: {
          '2026-10-14': 248,
          '2026-06-12': 261,
          '2026-02-08': 254,
          '2025-10-15': 242,
        },
      },
      {
        id: 'vpm',
        name: 'VPM (Vol. Plaq. Médio)',
        unit: 'fL',
        referenceText: '7,5 – 11,5',
        refMin: 7.5,
        refMax: 11.5,
        subcategory: 'Plaquetas',
        valuesByDate: {
          '2026-10-14': 9.6,
          '2026-06-12': 9.8,
          '2026-02-08': 9.7,
          '2025-10-15': 9.5,
        },
      },

      // Hormonas Gonadotróficas
      {
        id: 'lh',
        name: 'LH (Hormona Luteinizante)',
        unit: 'mUI/mL',
        referenceText: '1,7 – 8,6',
        refMin: 1.7,
        refMax: 8.6,
        subcategory: 'Hormonas Gonadotróficas',
        valuesByDate: {
          '2026-10-14': 4.9,
          '2026-06-12': 4.4,
          '2026-02-08': 4.1,
          '2025-10-15': 4.6,
        },
      },
      {
        id: 'fsh',
        name: 'FSH (Horm. Foliculoestim.)',
        unit: 'mUI/mL',
        referenceText: '1,5 – 12,4',
        refMin: 1.5,
        refMax: 12.4,
        subcategory: 'Hormonas Gonadotróficas',
        valuesByDate: {
          '2026-10-14': 5.3,
          '2026-06-12': 5.0,
          '2026-02-08': 4.8,
          '2025-10-15': 5.1,
        },
      },
    ],
  },
  {
    id: 'perfil-glicidico',
    name: 'Perfil Glicídico',
    shortDescription: 'Glicemia em jejum, HbA1c, insulina e resistência insulínica',
    orderIndex: 2,
    parameters: [
      {
        id: 'glicose',
        name: 'Glicose em Jejum',
        unit: 'mg/dL',
        referenceText: '70 – 99',
        refMin: 70,
        refMax: 99,
        subcategory: 'Metabolismo da Glicose',
        valuesByDate: {
          '2026-10-14': 86,
          '2026-06-12': 91,
          '2026-02-08': 94,
          '2025-10-15': 102,
        },
      },
      {
        id: 'hba1c',
        name: 'Hemoglobina Glicada (HbA1c)',
        unit: '%',
        referenceText: '4,0 – 5,6',
        refMin: 4.0,
        refMax: 5.6,
        subcategory: 'Metabolismo da Glicose',
        valuesByDate: {
          '2026-10-14': 5.1,
          '2026-06-12': 5.2,
          '2026-02-08': 5.3,
          '2025-10-15': 5.5,
        },
      },
      {
        id: 'insulina',
        name: 'Insulina em Jejum',
        unit: 'µUI/mL',
        referenceText: '2,6 – 24,9',
        refMin: 2.6,
        refMax: 24.9,
        subcategory: 'Metabolismo da Glicose',
        valuesByDate: {
          '2026-10-14': 6.8,
          '2026-06-12': 8.1,
          '2026-02-08': 9.4,
          '2025-10-15': 11.2,
        },
      },
      {
        id: 'homa-ir',
        name: 'Índice HOMA-IR',
        unit: 'índice',
        referenceText: '< 2,50',
        refMax: 2.5,
        subcategory: 'Metabolismo da Glicose',
        valuesByDate: {
          '2026-10-14': 1.44,
          '2026-06-12': 1.82,
          '2026-02-08': 2.18,
          '2025-10-15': 2.82,
        },
      },
    ],
  },
  {
    id: 'perfil-lipidico',
    name: 'Perfil Lipídico',
    shortDescription: 'Colesterol total, frações HDL/LDL e triglicéridos',
    orderIndex: 3,
    parameters: [
      {
        id: 'colesterol-total',
        name: 'Colesterol Total',
        unit: 'mg/dL',
        referenceText: '< 190',
        refMax: 190,
        subcategory: 'Lípidos e Lipoproteínas',
        valuesByDate: {
          '2026-10-14': 174,
          '2026-06-12': 194,
          '2026-02-08': 198,
          '2025-10-15': 205,
        },
      },
      {
        id: 'hdl',
        name: 'Colesterol HDL',
        unit: 'mg/dL',
        referenceText: '> 40',
        refMin: 40,
        subcategory: 'Lípidos e Lipoproteínas',
        valuesByDate: {
          '2026-10-14': 58,
          '2026-06-12': 52,
          '2026-02-08': 47,
          '2025-10-15': 38,
        },
      },
      {
        id: 'ldl',
        name: 'Colesterol LDL',
        unit: 'mg/dL',
        referenceText: '< 115',
        refMax: 115,
        subcategory: 'Lípidos e Lipoproteínas',
        valuesByDate: {
          '2026-10-14': 101,
          '2026-06-12': 121,
          '2026-02-08': 127,
          '2025-10-15': 136,
        },
      },
      {
        id: 'nao-hdl',
        name: 'Colesterol Não-HDL',
        unit: 'mg/dL',
        referenceText: '< 145',
        refMax: 145,
        subcategory: 'Lípidos e Lipoproteínas',
        valuesByDate: {
          '2026-10-14': 116,
          '2026-06-12': 142,
          '2026-02-08': 151,
          '2025-10-15': 167,
        },
      },
      {
        id: 'trigliceridos',
        name: 'Triglicéridos',
        unit: 'mg/dL',
        referenceText: '< 150',
        refMax: 150,
        subcategory: 'Lípidos e Lipoproteínas',
        valuesByDate: {
          '2026-10-14': 76,
          '2026-06-12': 98,
          '2026-02-08': 118,
          '2025-10-15': 156,
        },
      },
    ],
  },
  {
    id: 'funcao-hepatica',
    name: 'Função Hepática',
    shortDescription: 'Transaminases, Gama-GT, bilirrubina e albumina',
    orderIndex: 4,
    parameters: [
      {
        id: 'ast',
        name: 'AST (TGO)',
        unit: 'U/L',
        referenceText: '10 – 40',
        refMin: 10,
        refMax: 40,
        subcategory: 'Enzimas Hepáticas',
        valuesByDate: {
          '2026-10-14': 31,
          '2026-06-12': 44,
          '2026-02-08': 36,
          '2025-10-15': 29,
        },
      },
      {
        id: 'alt',
        name: 'ALT (TGP)',
        unit: 'U/L',
        referenceText: '10 – 45',
        refMin: 10,
        refMax: 45,
        subcategory: 'Enzimas Hepáticas',
        valuesByDate: {
          '2026-10-14': 27,
          '2026-06-12': 34,
          '2026-02-08': 31,
          '2025-10-15': 28,
        },
      },
      {
        id: 'ggt',
        name: 'GGT (Gama-GT)',
        unit: 'U/L',
        referenceText: '8 – 61',
        refMin: 8,
        refMax: 61,
        subcategory: 'Enzimas Hepáticas',
        valuesByDate: {
          '2026-10-14': 22,
          '2026-06-12': 24,
          '2026-02-08': 26,
          '2025-10-15': 25,
        },
      },
      {
        id: 'fosfatase-alcalina',
        name: 'Fosfatase Alcalina',
        unit: 'U/L',
        referenceText: '40 – 129',
        refMin: 40,
        refMax: 129,
        subcategory: 'Enzimas Hepáticas',
        valuesByDate: {
          '2026-10-14': 68,
          '2026-06-12': 71,
          '2026-02-08': 74,
          '2025-10-15': 70,
        },
      },
      {
        id: 'bilirrubina-total',
        name: 'Bilirrubina Total',
        unit: 'mg/dL',
        referenceText: '0,20 – 1,20',
        refMin: 0.2,
        refMax: 1.2,
        subcategory: 'Bilirrubina e Proteínas',
        valuesByDate: {
          '2026-10-14': 0.78,
          '2026-06-12': 0.85,
          '2026-02-08': 0.81,
          '2025-10-15': 0.74,
        },
      },
      {
        id: 'albumina',
        name: 'Albumina Sérica',
        unit: 'g/dL',
        referenceText: '3,5 – 5,2',
        refMin: 3.5,
        refMax: 5.2,
        subcategory: 'Bilirrubina e Proteínas',
        valuesByDate: {
          '2026-10-14': 4.6,
          '2026-06-12': 4.5,
          '2026-02-08': 4.4,
          '2025-10-15': 4.4,
        },
      },
    ],
  },
  {
    id: 'funcao-renal',
    name: 'Função Renal',
    shortDescription: 'Creatinina, ureia, taxa de filtração glomerular e eletrólitos',
    orderIndex: 5,
    parameters: [
      {
        id: 'creatinina',
        name: 'Creatinina Sérica',
        unit: 'mg/dL',
        referenceText: '0,70 – 1,20',
        refMin: 0.7,
        refMax: 1.2,
        subcategory: 'Filtração e Azotemia',
        valuesByDate: {
          '2026-10-14': 1.06,
          '2026-06-12': 1.12,
          '2026-02-08': 1.04,
          '2025-10-15': 0.99,
        },
      },
      {
        id: 'ureia',
        name: 'Ureia',
        unit: 'mg/dL',
        referenceText: '15 – 45',
        refMin: 15,
        refMax: 45,
        subcategory: 'Filtração e Azotemia',
        valuesByDate: {
          '2026-10-14': 36,
          '2026-06-12': 41,
          '2026-02-08': 38,
          '2025-10-15': 34,
        },
      },
      {
        id: 'tfg',
        name: 'TFG Estimada (CKD-EPI)',
        unit: 'mL/min/1,73m²',
        referenceText: '> 90',
        refMin: 90,
        subcategory: 'Filtração e Azotemia',
        valuesByDate: {
          '2026-10-14': 98,
          '2026-06-12': 93,
          '2026-02-08': 101,
          '2025-10-15': 105,
        },
      },
      {
        id: 'acido-urico',
        name: 'Ácido Úrico',
        unit: 'mg/dL',
        referenceText: '3,4 – 7,0',
        refMin: 3.4,
        refMax: 7.0,
        subcategory: 'Filtração e Azotemia',
        valuesByDate: {
          '2026-10-14': 5.4,
          '2026-06-12': 5.8,
          '2026-02-08': 6.1,
          '2025-10-15': 6.3,
        },
      },
      {
        id: 'sodio',
        name: 'Sódio',
        unit: 'mmol/L',
        referenceText: '136 – 145',
        refMin: 136,
        refMax: 145,
        subcategory: 'Eletrólitos',
        valuesByDate: {
          '2026-10-14': 140,
          '2026-06-12': 141,
          '2026-02-08': 139,
          '2025-10-15': 140,
        },
      },
      {
        id: 'potassio',
        name: 'Potássio',
        unit: 'mmol/L',
        referenceText: '3,5 – 5,1',
        refMin: 3.5,
        refMax: 5.1,
        subcategory: 'Eletrólitos',
        valuesByDate: {
          '2026-10-14': 4.3,
          '2026-06-12': 4.4,
          '2026-02-08': 4.2,
          '2025-10-15': 4.1,
        },
      },
    ],
  },
  {
    id: 'vitaminas-minerais',
    name: 'Vitaminas e Minerais',
    shortDescription: 'Vitamina D, B12, folato, metabolismo do ferro e eletrólitos',
    orderIndex: 6,
    parameters: [
      {
        id: 'vitamina-d',
        name: 'Vitamina D (25-OH)',
        unit: 'ng/mL',
        referenceText: '30,0 – 100,0',
        refMin: 30.0,
        refMax: 100.0,
        subcategory: 'Vitaminas',
        valuesByDate: {
          '2026-10-14': 41.6,
          '2026-06-12': 33.2,
          '2026-02-08': 24.8,
          '2025-10-15': 28.4,
        },
      },
      {
        id: 'vitamina-b12',
        name: 'Vitamina B12',
        unit: 'pg/mL',
        referenceText: '197 – 771',
        refMin: 197,
        refMax: 771,
        subcategory: 'Vitaminas',
        valuesByDate: {
          '2026-10-14': 488,
          '2026-06-12': 435,
          '2026-02-08': 392,
          '2025-10-15': 368,
        },
      },
      {
        id: 'acido-folico',
        name: 'Ácido Fólico',
        unit: 'ng/mL',
        referenceText: '3,9 – 26,8',
        refMin: 3.9,
        refMax: 26.8,
        subcategory: 'Vitaminas',
        valuesByDate: {
          '2026-10-14': 11.4,
          '2026-06-12': 10.2,
          '2026-02-08': 9.6,
          '2025-10-15': 8.9,
        },
      },
      {
        id: 'ferro-serico',
        name: 'Ferro Sérico',
        unit: 'µg/dL',
        referenceText: '65 – 175',
        refMin: 65,
        refMax: 175,
        subcategory: 'Metabolismo do Ferro e Minerais',
        valuesByDate: {
          '2026-10-14': 112,
          '2026-06-12': 98,
          '2026-02-08': 86,
          '2025-10-15': 79,
        },
      },
      {
        id: 'ferritina',
        name: 'Ferritina',
        unit: 'ng/mL',
        referenceText: '30 – 300',
        refMin: 30,
        refMax: 300,
        subcategory: 'Metabolismo do Ferro e Minerais',
        valuesByDate: {
          '2026-10-14': 74,
          '2026-06-12': 52,
          '2026-02-08': 26,
          '2025-10-15': 34,
        },
      },
      {
        id: 'magnesio',
        name: 'Magnésio',
        unit: 'mg/dL',
        referenceText: '1,7 – 2,4',
        refMin: 1.7,
        refMax: 2.4,
        subcategory: 'Metabolismo do Ferro e Minerais',
        valuesByDate: {
          '2026-10-14': 2.1,
          '2026-06-12': 2.0,
          '2026-02-08': 1.9,
          '2025-10-15': 1.8,
        },
      },
      {
        id: 'zinco',
        name: 'Zinco Sérico',
        unit: 'µg/dL',
        referenceText: '70 – 120',
        refMin: 70,
        refMax: 120,
        subcategory: 'Metabolismo do Ferro e Minerais',
        valuesByDate: {
          '2026-10-14': 96,
          '2026-06-12': 89,
          '2026-02-08': 84,
          '2025-10-15': 78,
        },
      },
    ],
  },
  {
    id: 'funcao-tiroideia',
    name: 'Função Tiroideia',
    shortDescription: 'TSH, T4 Livre e T3 Livre',
    orderIndex: 7,
    parameters: [
      {
        id: 'tsh',
        name: 'TSH',
        unit: 'µUI/mL',
        referenceText: '0,27 – 4,20',
        refMin: 0.27,
        refMax: 4.2,
        subcategory: 'Eixo Tiroideu',
        valuesByDate: {
          '2026-10-14': 1.85,
          '2026-06-12': 2.04,
          '2026-02-08': 2.18,
          '2025-10-15': 1.96,
        },
      },
      {
        id: 't4-livre',
        name: 'T4 Livre',
        unit: 'ng/dL',
        referenceText: '0,93 – 1,70',
        refMin: 0.93,
        refMax: 1.7,
        subcategory: 'Eixo Tiroideu',
        valuesByDate: {
          '2026-10-14': 1.28,
          '2026-06-12': 1.24,
          '2026-02-08': 1.21,
          '2025-10-15': 1.26,
        },
      },
      {
        id: 't3-livre',
        name: 'T3 Livre',
        unit: 'pg/mL',
        referenceText: '2,00 – 4,40',
        refMin: 2.0,
        refMax: 4.4,
        subcategory: 'Eixo Tiroideu',
        valuesByDate: {
          '2026-10-14': 3.35,
          '2026-06-12': 3.22,
          '2026-02-08': 3.14,
          '2025-10-15': 3.28,
        },
      },
    ],
  },
];

export function evaluateExamStatus(
  value: number | undefined,
  refMin?: number,
  refMax?: number
): ExamResultStatus {
  if (value === undefined || Number.isNaN(value)) return 'normal';
  if (refMin !== undefined && value < refMin) return 'below';
  if (refMax !== undefined && value > refMax) return 'above';
  return 'normal';
}

export function formatLabNumber(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) return '—';
  // Format with comma decimal separator matching Portuguese clinical lab reports
  return String(value).replace('.', ',');
}

export function getPreviousAnalysisDate(selectedDateId: string): ExamAnalysisDate | null {
  const idx = EXAM_ANALYSIS_DATES.findIndex((d) => d.id === selectedDateId);
  if (idx === -1 || idx + 1 >= EXAM_ANALYSIS_DATES.length) {
    return null;
  }
  return EXAM_ANALYSIS_DATES[idx + 1];
}
