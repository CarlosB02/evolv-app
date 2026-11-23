export type EventRepeatOption = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export type EventAlertOption =
  | 'none'
  | 'at_time'
  | '10m'
  | '30m'
  | '1h'
  | '1d';

export interface AgendaEventColor {
  id: string;
  label: string;
  hex: string;
  bgClass: string;
}

export interface AgendaEvent {
  id: string;
  title: string;
  allDay: boolean;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  repeat: EventRepeatOption;
  alert: EventAlertOption;
  color: string; // hex
  notes: string;
}

export const EVENT_COLORS: AgendaEventColor[] = [
  { id: 'orange', label: 'Laranja', hex: '#F77F00', bgClass: 'bg-[#F77F00]' },
  { id: 'sky', label: 'Azul', hex: '#38bdf8', bgClass: 'bg-[#38bdf8]' },
  { id: 'emerald', label: 'Verde', hex: '#34d399', bgClass: 'bg-[#34d399]' },
  { id: 'purple', label: 'Roxo', hex: '#a855f7', bgClass: 'bg-[#a855f7]' },
  { id: 'rose', label: 'Rosa', hex: '#f43f5e', bgClass: 'bg-[#f43f5e]' },
  { id: 'amber', label: 'Amarelo', hex: '#facc15', bgClass: 'bg-[#facc15]' },
];

export function getEventBgClass(hex: string): string {
  return (
    EVENT_COLORS.find((c) => c.hex.toLowerCase() === hex.toLowerCase())
      ?.bgClass ?? 'bg-[#F77F00]'
  );
}

export const REPEAT_OPTIONS: Array<{ value: EventRepeatOption; label: string }> = [
  { value: 'none', label: 'Nunca' },
  { value: 'daily', label: 'Todos os dias' },
  { value: 'weekly', label: 'Todas as semanas' },
  { value: 'monthly', label: 'Todos os meses' },
  { value: 'yearly', label: 'Todos os anos' },
];

export const ALERT_OPTIONS: Array<{ value: EventAlertOption; label: string }> = [
  { value: 'none', label: 'Nenhum' },
  { value: 'at_time', label: 'Na hora do evento' },
  { value: '10m', label: '10 min antes' },
  { value: '30m', label: '30 min antes' },
  { value: '1h', label: '1 hora antes' },
  { value: '1d', label: '1 dia antes' },
];

export const MONTHS_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export const MONTHS_SHORT_PT = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

export const WEEKDAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function toISODateLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseISODateLocal(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function addDaysLocal(iso: string, delta: number): string {
  const d = parseISODateLocal(iso);
  d.setDate(d.getDate() + delta);
  return toISODateLocal(d);
}

export function getRepeatLabel(repeat: EventRepeatOption): string {
  return REPEAT_OPTIONS.find((r) => r.value === repeat)?.label ?? 'Nunca';
}

export function getAlertLabel(alert: EventAlertOption): string {
  return ALERT_OPTIONS.find((a) => a.value === alert)?.label ?? 'Nenhum';
}

export function formatShortDatePT(iso: string): string {
  const d = parseISODateLocal(iso);
  return `${d.getDate()} ${MONTHS_SHORT_PT[d.getMonth()]}`;
}

export function formatFullDatePT(iso: string): string {
  const d = parseISODateLocal(iso);
  return `${WEEKDAYS_PT[d.getDay()]}, ${d.getDate()} de ${MONTHS_PT[d.getMonth()]}`;
}

/**
 * Determina se um evento (incluindo eventos de vários dias e recorrentes) ocorre na data ISO indicada.
 */
export function doesEventOccurOnDate(
  event: AgendaEvent,
  targetISO: string
): boolean {
  const startISO = event.startDate;
  const endISO =
    event.endDate && event.endDate >= startISO ? event.endDate : startISO;

  if (targetISO < startISO) return false;

  // Evento não recorrente: verifica se está dentro do intervalo [startDate, endDate]
  if (event.repeat === 'none') {
    return targetISO >= startISO && targetISO <= endISO;
  }

  // Para eventos recorrentes, verificar se a data alvo corresponde à recorrência
  const start = parseISODateLocal(startISO);
  const target = parseISODateLocal(targetISO);

  switch (event.repeat) {
    case 'daily':
      return true;
    case 'weekly':
      return target.getDay() === start.getDay();
    case 'monthly':
      return target.getDate() === start.getDate();
    case 'yearly':
      return (
        target.getDate() === start.getDate() &&
        target.getMonth() === start.getMonth()
      );
    default:
      return false;
  }
}

export function getInitialAgendaEvents(todayISO: string): AgendaEvent[] {
  const inTwoDays = addDaysLocal(todayISO, 2);
  const inFourDays = addDaysLocal(todayISO, 4);
  const twoDaysAgo = addDaysLocal(todayISO, -2);

  return [
    {
      id: 'evt-seed-1',
      title: 'Treino de Glúteo & Pernas',
      allDay: false,
      startDate: todayISO,
      endDate: todayISO,
      startTime: '18:00',
      endTime: '19:15',
      repeat: 'weekly',
      alert: '30m',
      color: '#F77F00',
      notes: 'Foco em progressão de carga no agachamento e hip thrust.',
    },
    {
      id: 'evt-seed-2',
      title: 'Cardio Zona 2',
      allDay: false,
      startDate: inTwoDays,
      endDate: inTwoDays,
      startTime: '08:30',
      endTime: '09:15',
      repeat: 'none',
      alert: '10m',
      color: '#38bdf8',
      notes: '45 min passadeira com inclinação moderada.',
    },
    {
      id: 'evt-seed-3',
      title: 'Avaliação Física com Treinador',
      allDay: false,
      startDate: inFourDays,
      endDate: inFourDays,
      startTime: '10:00',
      endTime: '10:45',
      repeat: 'monthly',
      alert: '1d',
      color: '#34d399',
      notes: 'Levar registo semanal de peso em jejum e medidas.',
    },
    {
      id: 'evt-seed-4',
      title: 'Dia de Descanso Ativo',
      allDay: true,
      startDate: twoDaysAgo,
      endDate: twoDaysAgo,
      startTime: '09:00',
      endTime: '10:00',
      repeat: 'none',
      alert: 'none',
      color: '#a855f7',
      notes: 'Mobilidade articular e caminhada leve.',
    },
  ];
}
