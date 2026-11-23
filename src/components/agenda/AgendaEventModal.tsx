import React, { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Palette,
  Repeat,
  Trash2,
  X,
} from 'lucide-react';
import {
  ALERT_OPTIONS,
  AgendaEvent,
  EVENT_COLORS,
  EventAlertOption,
  EventRepeatOption,
  MONTHS_PT,
  MONTHS_SHORT_PT,
  REPEAT_OPTIONS,
  getAlertLabel,
  getEventBgClass,
  getRepeatLabel,
  parseISODateLocal,
  toISODateLocal,
} from './agendaTypes';

interface AgendaEventModalProps {
  isOpen: boolean;
  defaultDateISO: string;
  editingEvent: AgendaEvent | null;
  onClose: () => void;
  onSave: (eventData: Omit<AgendaEvent, 'id'>, existingId?: string) => void;
  onDelete?: (id: string) => void;
}

type ActivePicker =
  | 'startDate'
  | 'endDate'
  | 'startTime'
  | 'endTime'
  | 'repeat'
  | 'alert'
  | null;

const WEEKDAYS_INITIAL = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const HOURS_LIST = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, '0')
);
const MINUTES_LIST = Array.from({ length: 12 }, (_, i) =>
  String(i * 5).padStart(2, '0')
);

function formatButtonDatePT(iso: string): string {
  const d = parseISODateLocal(iso);
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS_SHORT_PT[d.getMonth()]} ${d.getFullYear()}`;
}

interface MiniCalendarProps {
  selectedISO: string;
  minISO?: string;
  todayISO: string;
  onSelect: (iso: string) => void;
}

function BrandedCalendarDropdown({
  selectedISO,
  minISO,
  todayISO,
  onSelect,
}: MiniCalendarProps) {
  const initialDate = useMemo(
    () => parseISODateLocal(selectedISO || todayISO),
    [selectedISO, todayISO]
  );
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  useEffect(() => {
    const dt = parseISODateLocal(selectedISO || todayISO);
    setViewYear(dt.getFullYear());
    setViewMonth(dt.getMonth());
  }, [selectedISO, todayISO]);

  const cells = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const startWeekday = first.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrev = new Date(viewYear, viewMonth, 0).getDate();

    const list: Array<{ iso: string; day: number; inMonth: boolean }> = [];
    for (let i = startWeekday - 1; i >= 0; i -= 1) {
      const day = daysInPrev - i;
      list.push({
        iso: toISODateLocal(new Date(viewYear, viewMonth - 1, day)),
        day,
        inMonth: false,
      });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      list.push({
        iso: toISODateLocal(new Date(viewYear, viewMonth, day)),
        day,
        inMonth: true,
      });
    }
    const rem = list.length % 7;
    if (rem !== 0) {
      for (let day = 1; day <= 7 - rem; day += 1) {
        list.push({
          iso: toISODateLocal(new Date(viewYear, viewMonth + 1, day)),
          day,
          inMonth: false,
        });
      }
    }
    return list;
  }, [viewYear, viewMonth]);

  const handlePrev = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNext = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  return (
    <div className="mt-2 rounded-[18px] bg-[#111111] border border-zinc-800 shadow-[0_18px_40px_rgba(0,0,0,0.7)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
      <div
        className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#F77F00]/70 to-transparent"
        aria-hidden="true"
      />

      <div className="p-3">
        {/* Header Mês + Ano */}
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Mês anterior"
            className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <span className="text-xs font-bold text-white tracking-tight tabular-nums">
            {MONTHS_PT[viewMonth]} {viewYear}
          </span>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Mês seguinte"
            className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dias da semana */}
        <div className="grid grid-cols-7 gap-y-1 text-center mb-1">
          {WEEKDAYS_INITIAL.map((wd, idx) => (
            <span
              key={`${wd}-${idx}`}
              className="text-[10px] font-bold text-zinc-500 py-0.5"
            >
              {wd}
            </span>
          ))}
        </div>

        {/* Grelha de dias */}
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {cells.map((cell) => {
            const isSelected = cell.iso === selectedISO;
            const isToday = cell.iso === todayISO;
            const isDisabled = Boolean(minISO && cell.iso < minISO);

            return (
              <button
                key={cell.iso}
                type="button"
                disabled={isDisabled}
                onClick={() => onSelect(cell.iso)}
                className="flex items-center justify-center py-0.5 focus:outline-none disabled:cursor-not-allowed cursor-pointer"
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] tabular-nums transition-all ${
                    isDisabled
                      ? 'text-zinc-700 opacity-40'
                      : isSelected
                        ? 'bg-[#F77F00] text-white font-bold shadow-sm shadow-orange-500/30'
                        : isToday
                          ? 'border border-[#F77F00] text-[#F77F00] font-bold'
                          : cell.inMonth
                            ? 'text-zinc-200 font-medium hover:bg-[#F77F00]/15 hover:text-white'
                            : 'text-zinc-600 font-medium hover:text-zinc-400'
                  }`}
                >
                  {cell.day}
                </span>
              </button>
            );
          })}
        </div>

        {/* Atalho Hoje */}
        {(!minISO || todayISO >= minISO) && selectedISO !== todayISO && (
          <div className="mt-2.5 pt-2 border-t border-zinc-800/70 flex justify-end">
            <button
              type="button"
              onClick={() => onSelect(todayISO)}
              className="text-[11px] font-bold text-[#F77F00] hover:text-orange-400 transition-colors cursor-pointer"
            >
              Selecionar hoje
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface TimeDropdownProps {
  value: string;
  onChange: (nextTime: string) => void;
  onClose: () => void;
}

function BrandedTimeDropdown({ value, onChange, onClose }: TimeDropdownProps) {
  const [curH, curM] = (value || '09:00').split(':');

  return (
    <div className="mt-2 rounded-[18px] bg-[#111111] border border-zinc-800 shadow-[0_18px_40px_rgba(0,0,0,0.7)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
      <div
        className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#F77F00]/70 to-transparent"
        aria-hidden="true"
      />

      <div className="p-3">
        <div className="grid grid-cols-2 gap-2.5">
          {/* Horas */}
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#F77F00] mb-1.5 text-center">
              Hora
            </span>
            <div className="max-h-[152px] overflow-y-auto hide-scrollbar space-y-0.5 pr-0.5">
              {HOURS_LIST.map((h) => {
                const isActive = h === curH;
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => onChange(`${h}:${curM || '00'}`)}
                    className={`w-full py-1.5 rounded-lg text-xs font-bold tabular-nums transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#F77F00] text-white'
                        : 'text-zinc-300 hover:bg-[#F77F00]/12 hover:text-white'
                    }`}
                  >
                    {h}h
                  </button>
                );
              })}
            </div>
          </div>

          {/* Minutos */}
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-[#F77F00] mb-1.5 text-center">
              Minutos
            </span>
            <div className="max-h-[152px] overflow-y-auto hide-scrollbar space-y-0.5 pl-0.5">
              {MINUTES_LIST.map((m) => {
                const isActive = m === curM;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      onChange(`${curH || '09'}:${m}`);
                      onClose();
                    }}
                    className={`w-full py-1.5 rounded-lg text-xs font-bold tabular-nums transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#F77F00] text-white'
                        : 'text-zinc-300 hover:bg-[#F77F00]/12 hover:text-white'
                    }`}
                  >
                    :{m}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AgendaEventModal({
  isOpen,
  defaultDateISO,
  editingEvent,
  onClose,
  onSave,
  onDelete,
}: AgendaEventModalProps) {
  const todayISO = useMemo(() => toISODateLocal(new Date()), []);

  const [title, setTitle] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [startDate, setStartDate] = useState(defaultDateISO);
  const [endDate, setEndDate] = useState(defaultDateISO);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [repeat, setRepeat] = useState<EventRepeatOption>('none');
  const [alert, setAlert] = useState<EventAlertOption>('30m');
  const [color, setColor] = useState(EVENT_COLORS[0].hex);
  const [notes, setNotes] = useState('');
  const [titleError, setTitleError] = useState(false);
  const [activePicker, setActivePicker] = useState<ActivePicker>(null);

  useEffect(() => {
    if (!isOpen) return;
    setTitleError(false);
    setActivePicker(null);

    if (editingEvent) {
      setTitle(editingEvent.title);
      setAllDay(editingEvent.allDay);
      setStartDate(editingEvent.startDate);
      setEndDate(editingEvent.endDate || editingEvent.startDate);
      setStartTime(editingEvent.startTime || '09:00');
      setEndTime(editingEvent.endTime || '10:00');
      setRepeat(editingEvent.repeat);
      setAlert(editingEvent.alert);
      setColor(editingEvent.color || EVENT_COLORS[0].hex);
      setNotes(editingEvent.notes || '');
    } else {
      setTitle('');
      setAllDay(false);
      setStartDate(defaultDateISO);
      setEndDate(defaultDateISO);
      setStartTime('09:00');
      setEndTime('10:00');
      setRepeat('none');
      setAlert('30m');
      setColor(EVENT_COLORS[0].hex);
      setNotes('');
    }
  }, [isOpen, editingEvent, defaultDateISO]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activePicker) {
          setActivePicker(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activePicker, onClose]);

  if (!isOpen) return null;

  const togglePicker = (picker: Exclude<ActivePicker, null>) => {
    setActivePicker((prev) => (prev === picker ? null : picker));
  };

  const handleStartDateChange = (nextStart: string) => {
    setStartDate(nextStart);
    if (!endDate || endDate < nextStart) {
      setEndDate(nextStart);
    }
    setActivePicker(null);
  };

  const handleEndDateChange = (nextEnd: string) => {
    setEndDate(nextEnd);
    setActivePicker(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError(true);
      return;
    }

    const normalizedStart = startDate || defaultDateISO;
    const normalizedEnd = allDay
      ? normalizedStart
      : endDate && endDate >= normalizedStart
        ? endDate
        : normalizedStart;

    onSave(
      {
        title: trimmedTitle,
        allDay,
        startDate: normalizedStart,
        endDate: normalizedEnd,
        startTime: startTime || '09:00',
        endTime: endTime || '10:00',
        repeat,
        alert,
        color,
        notes: notes.trim(),
      },
      editingEvent?.id
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[260] flex items-end justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={editingEvent ? 'Editar evento' : 'Novo evento'}
        className="w-full max-w-[414px] max-h-[90dvh] bg-[#0a0a0c] border-t border-x border-zinc-800 rounded-t-[28px] shadow-[0_-24px_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200"
      >
        {/* Drag handle */}
        <div className="pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1 rounded-full bg-zinc-700/80" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-2 pb-3 border-b border-zinc-800/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${getEventBgClass(color)}`}
            />
            <h3 className="text-white text-base font-bold tracking-tight">
              {editingEvent ? 'Editar Evento' : 'Novo Evento'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form
          id="agenda-event-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto hide-scrollbar px-5 py-4 space-y-4"
        >
          {/* Título */}
          <div>
            <label
              htmlFor="agenda-event-title"
              className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5"
            >
              Título
            </label>
            <input
              id="agenda-event-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError(false);
              }}
              placeholder="Ex: Treino de força, Avaliação física..."
              autoFocus
              className={`w-full rounded-xl bg-zinc-900/70 border px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none transition-colors ${
                titleError
                  ? 'border-red-500 focus:border-red-400'
                  : 'border-zinc-800 focus:border-[#F77F00]'
              }`}
            />
            {titleError && (
              <p className="text-[11px] text-red-400 mt-1">
                Indica um título para o evento.
              </p>
            )}
          </div>

          {/* Todo o dia + Datas/Horas com Dropdown EVOLV */}
          <div className="rounded-2xl bg-zinc-900/45 border border-zinc-800/70 divide-y divide-zinc-800/70">
            <div className="flex items-center justify-between px-3.5 py-3">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#F77F00] shrink-0" />
                <span className="text-sm font-medium text-white">
                  Todo o dia
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={allDay}
                onClick={() => {
                  setAllDay((prev) => !prev);
                  setActivePicker(null);
                }}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
                  allDay ? 'bg-[#F77F00]' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    allDay ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {allDay ? (
              <div className="p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                    <Calendar className="w-3.5 h-3.5 text-[#F77F00] shrink-0" />
                    <span>Data</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => togglePicker('startDate')}
                    className={`px-3 py-1.5 rounded-xl bg-[#0a0a0a] border text-xs font-bold text-white tabular-nums flex items-center gap-2 transition-colors cursor-pointer ${
                      activePicker === 'startDate'
                        ? 'border-[#F77F00]'
                        : 'border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <span>{formatButtonDatePT(startDate)}</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[#F77F00] transition-transform duration-200 ${
                        activePicker === 'startDate' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>

                {activePicker === 'startDate' && (
                  <BrandedCalendarDropdown
                    selectedISO={startDate}
                    todayISO={todayISO}
                    onSelect={handleStartDateChange}
                  />
                )}
              </div>
            ) : (
              <div className="p-3.5 space-y-3">
                {/* Início */}
                <div>
                  <span className="text-[11px] font-semibold text-zinc-400 block mb-1.5">
                    Início
                  </span>
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <button
                      type="button"
                      onClick={() => togglePicker('startDate')}
                      className={`w-full px-3 py-2 rounded-xl bg-[#0a0a0a] border text-xs font-bold text-white tabular-nums flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                        activePicker === 'startDate'
                          ? 'border-[#F77F00]'
                          : 'border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5 truncate">
                        <Calendar className="w-3.5 h-3.5 text-[#F77F00] shrink-0" />
                        <span>{formatButtonDatePT(startDate)}</span>
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-[#F77F00] shrink-0 transition-transform duration-200 ${
                          activePicker === 'startDate' ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => togglePicker('startTime')}
                      className={`px-3 py-2 rounded-xl bg-[#0a0a0a] border text-xs font-bold text-white tabular-nums flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                        activePicker === 'startTime'
                          ? 'border-[#F77F00]'
                          : 'border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 text-[#F77F00] shrink-0" />
                      <span>{startTime}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-[#F77F00] shrink-0 transition-transform duration-200 ${
                          activePicker === 'startTime' ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {activePicker === 'startDate' && (
                    <BrandedCalendarDropdown
                      selectedISO={startDate}
                      todayISO={todayISO}
                      onSelect={handleStartDateChange}
                    />
                  )}
                  {activePicker === 'startTime' && (
                    <BrandedTimeDropdown
                      value={startTime}
                      onChange={setStartTime}
                      onClose={() => setActivePicker(null)}
                    />
                  )}
                </div>

                {/* Fim */}
                <div>
                  <span className="text-[11px] font-semibold text-zinc-400 block mb-1.5">
                    Fim
                  </span>
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <button
                      type="button"
                      onClick={() => togglePicker('endDate')}
                      className={`w-full px-3 py-2 rounded-xl bg-[#0a0a0a] border text-xs font-bold text-white tabular-nums flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                        activePicker === 'endDate'
                          ? 'border-[#F77F00]'
                          : 'border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5 truncate">
                        <Calendar className="w-3.5 h-3.5 text-[#F77F00] shrink-0" />
                        <span>{formatButtonDatePT(endDate)}</span>
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-[#F77F00] shrink-0 transition-transform duration-200 ${
                          activePicker === 'endDate' ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => togglePicker('endTime')}
                      className={`px-3 py-2 rounded-xl bg-[#0a0a0a] border text-xs font-bold text-white tabular-nums flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                        activePicker === 'endTime'
                          ? 'border-[#F77F00]'
                          : 'border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 text-[#F77F00] shrink-0" />
                      <span>{endTime}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-[#F77F00] shrink-0 transition-transform duration-200 ${
                          activePicker === 'endTime' ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {activePicker === 'endDate' && (
                    <BrandedCalendarDropdown
                      selectedISO={endDate}
                      minISO={startDate}
                      todayISO={todayISO}
                      onSelect={handleEndDateChange}
                    />
                  )}
                  {activePicker === 'endTime' && (
                    <BrandedTimeDropdown
                      value={endTime}
                      onChange={setEndTime}
                      onClose={() => setActivePicker(null)}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Repetir & Alerta com Dropdown EVOLV */}
          <div className="rounded-2xl bg-zinc-900/45 border border-zinc-800/70 divide-y divide-zinc-800/70">
            {/* Repetir */}
            <div className="p-3.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-sm font-medium text-white">
                  <Repeat className="w-4 h-4 text-[#F77F00] shrink-0" />
                  <span>Repetir</span>
                </div>
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={activePicker === 'repeat'}
                  onClick={() => togglePicker('repeat')}
                  className={`px-3 py-1.5 rounded-xl bg-[#0a0a0a] border text-xs font-bold text-zinc-100 flex items-center gap-2 transition-colors cursor-pointer ${
                    activePicker === 'repeat'
                      ? 'border-[#F77F00]'
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <span>{getRepeatLabel(repeat)}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#F77F00] shrink-0 transition-transform duration-200 ${
                      activePicker === 'repeat' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>

              {activePicker === 'repeat' && (
                <div
                  role="listbox"
                  aria-label="Opções de repetição"
                  className="mt-2.5 rounded-[18px] bg-[#111111] border border-zinc-800 shadow-[0_18px_40px_rgba(0,0,0,0.7)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div
                    className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#F77F00]/70 to-transparent"
                    aria-hidden="true"
                  />
                  <div className="py-1">
                    {REPEAT_OPTIONS.map((opt) => {
                      const isActive = opt.value === repeat;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          role="option"
                          aria-selected={isActive}
                          onClick={() => {
                            setRepeat(opt.value);
                            setActivePicker(null);
                          }}
                          className={`w-full min-h-[40px] px-3.5 py-2 flex items-center justify-between text-xs font-bold transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-[#F77F00]/12 text-[#F77F00]'
                              : 'text-zinc-200 hover:bg-[#F77F00]/10 hover:text-white'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {isActive && (
                            <Check className="w-3.5 h-3.5 text-[#F77F00] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Alerta */}
            <div className="p-3.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-sm font-medium text-white">
                  <Bell className="w-4 h-4 text-[#F77F00] shrink-0" />
                  <span>Alerta</span>
                </div>
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={activePicker === 'alert'}
                  onClick={() => togglePicker('alert')}
                  className={`px-3 py-1.5 rounded-xl bg-[#0a0a0a] border text-xs font-bold text-zinc-100 flex items-center gap-2 transition-colors cursor-pointer ${
                    activePicker === 'alert'
                      ? 'border-[#F77F00]'
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <span>{getAlertLabel(alert)}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#F77F00] shrink-0 transition-transform duration-200 ${
                      activePicker === 'alert' ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>

              {activePicker === 'alert' && (
                <div
                  role="listbox"
                  aria-label="Opções de alerta"
                  className="mt-2.5 rounded-[18px] bg-[#111111] border border-zinc-800 shadow-[0_18px_40px_rgba(0,0,0,0.7)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <div
                    className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#F77F00]/70 to-transparent"
                    aria-hidden="true"
                  />
                  <div className="py-1">
                    {ALERT_OPTIONS.map((opt) => {
                      const isActive = opt.value === alert;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          role="option"
                          aria-selected={isActive}
                          onClick={() => {
                            setAlert(opt.value);
                            setActivePicker(null);
                          }}
                          className={`w-full min-h-[40px] px-3.5 py-2 flex items-center justify-between text-xs font-bold transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-[#F77F00]/12 text-[#F77F00]'
                              : 'text-zinc-200 hover:bg-[#F77F00]/10 hover:text-white'
                          }`}
                        >
                          <span>{opt.label}</span>
                          {isActive && (
                            <Check className="w-3.5 h-3.5 text-[#F77F00] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cor */}
          <div className="rounded-2xl bg-zinc-900/45 border border-zinc-800/70 px-3.5 py-3">
            <div className="flex items-center gap-2.5 mb-2.5">
              <Palette className="w-4 h-4 text-[#F77F00] shrink-0" />
              <span className="text-sm font-medium text-white">Cor</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              {EVENT_COLORS.map((swatch) => {
                const isSelected = color === swatch.hex;
                return (
                  <button
                    key={swatch.id}
                    type="button"
                    onClick={() => setColor(swatch.hex)}
                    aria-label={swatch.label}
                    title={swatch.label}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform cursor-pointer ${swatch.bgClass} ${
                      isSelected
                        ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0c]'
                        : 'opacity-80 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    {isSelected && (
                      <Check
                        className="w-4 h-4 text-black"
                        strokeWidth={3}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label
              htmlFor="agenda-event-notes"
              className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              <span>Notas</span>
            </label>
            <textarea
              id="agenda-event-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicionar detalhes ou observações..."
              className="w-full rounded-xl bg-zinc-900/70 border border-zinc-800 px-3.5 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#F77F00] resize-none transition-colors"
            />
          </div>
        </form>

        {/* Sticky Footer */}
        <div className="px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] border-t border-zinc-800/70 flex items-center gap-2.5 shrink-0 bg-[#0a0a0c]">
          {editingEvent && onDelete ? (
            <button
              type="button"
              onClick={() => {
                onDelete(editingEvent.id);
                onClose();
              }}
              className="min-h-[44px] px-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 hover:bg-red-500/20 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Trash2 className="w-4 h-4" />
              <span>Eliminar</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          )}

          <button
            type="submit"
            form="agenda-event-form"
            className="flex-1 min-h-[44px] rounded-xl bg-[#F77F00] hover:bg-[#e57300] text-white text-xs font-bold shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98] cursor-pointer"
          >
            {editingEvent ? 'Guardar alterações' : 'Guardar evento'}
          </button>
        </div>
      </div>
    </div>
  );
}
