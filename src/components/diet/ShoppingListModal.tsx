import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Beef,
  Check,
  Droplet,
  Leaf,
  Plus,
  RotateCcw,
  ShoppingCart,
  Trash2,
  Wheat,
  X,
} from 'lucide-react';

export type IngredientCategory = 'proteinas' | 'hidratos' | 'frescos' | 'gorduras' | 'extras';

export interface ShoppingIngredient {
  id: string;
  name: string;
  baseQuantity: number;
  unit: 'g' | 'ml' | 'un';
  category: IngredientCategory;
  checked: boolean;
  isCustom?: boolean;
  customQtyLabel?: string;
}

interface ShoppingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName?: string;
  items: ShoppingIngredient[];
  daysMultiplier: number;
  onChangeDaysMultiplier: (days: number) => void;
  onToggleItem: (id: string) => void;
  onAddCustomItem: (name: string, qtyLabel: string) => void;
  onRemoveItem: (id: string) => void;
  onResetChecked: () => void;
}

const CATEGORY_META: Record<
  IngredientCategory,
  { label: string; icon: React.ReactNode }
> = {
  proteinas: {
    label: 'Proteínas',
    icon: <Beef className="w-3.5 h-3.5 text-rose-400 shrink-0" />,
  },
  hidratos: {
    label: 'Hidratos & Cereais',
    icon: <Wheat className="w-3.5 h-3.5 text-amber-400 shrink-0" />,
  },
  frescos: {
    label: 'Fruta & Vegetais',
    icon: <Leaf className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
  },
  gorduras: {
    label: 'Gorduras & Laticínios',
    icon: <Droplet className="w-3.5 h-3.5 text-sky-400 shrink-0" />,
  },
  extras: {
    label: 'Adicionados por ti',
    icon: <ShoppingCart className="w-3.5 h-3.5 text-[#F77F00] shrink-0" />,
  },
};

const CATEGORY_ORDER: IngredientCategory[] = [
  'proteinas',
  'hidratos',
  'frescos',
  'gorduras',
  'extras',
];

export function getInitialShoppingIngredients(planName?: string): ShoppingIngredient[] {
  const isRest = (planName || '').toLowerCase().includes('descanso');

  if (isRest) {
    return [
      { id: 'ing-r-1', name: 'Peito de frango', baseQuantity: 260, unit: 'g', category: 'proteinas', checked: false },
      { id: 'ing-r-2', name: 'Salmão fresco', baseQuantity: 150, unit: 'g', category: 'proteinas', checked: false },
      { id: 'ing-r-3', name: 'Ovos L', baseQuantity: 3, unit: 'un', category: 'proteinas', checked: false },
      { id: 'ing-r-4', name: 'Iogurte grego natural magro', baseQuantity: 180, unit: 'g', category: 'proteinas', checked: false },
      { id: 'ing-r-5', name: 'Flocos de aveia', baseQuantity: 45, unit: 'g', category: 'hidratos', checked: false },
      { id: 'ing-r-6', name: 'Batata-doce', baseQuantity: 180, unit: 'g', category: 'hidratos', checked: false },
      { id: 'ing-r-7', name: 'Arroz basmati', baseQuantity: 100, unit: 'g', category: 'hidratos', checked: false },
      { id: 'ing-r-8', name: 'Morangos frescos', baseQuantity: 120, unit: 'g', category: 'frescos', checked: false },
      { id: 'ing-r-9', name: 'Brócolos', baseQuantity: 150, unit: 'g', category: 'frescos', checked: false },
      { id: 'ing-r-10', name: 'Espinafres / Salada mista', baseQuantity: 100, unit: 'g', category: 'frescos', checked: false },
      { id: 'ing-r-11', name: 'Azeite virgem extra', baseQuantity: 20, unit: 'ml', category: 'gorduras', checked: false },
      { id: 'ing-r-12', name: 'Abacate', baseQuantity: 80, unit: 'g', category: 'gorduras', checked: false },
      { id: 'ing-r-13', name: 'Amêndoas naturais', baseQuantity: 25, unit: 'g', category: 'gorduras', checked: false },
    ];
  }

  return [
    { id: 'ing-t-1', name: 'Peito de frango', baseQuantity: 300, unit: 'g', category: 'proteinas', checked: false },
    { id: 'ing-t-2', name: 'Lombo de salmão / Pescada', baseQuantity: 160, unit: 'g', category: 'proteinas', checked: false },
    { id: 'ing-t-3', name: 'Ovos L', baseQuantity: 3, unit: 'un', category: 'proteinas', checked: false },
    { id: 'ing-t-4', name: 'Iogurte Skyr natural', baseQuantity: 200, unit: 'g', category: 'proteinas', checked: false },
    { id: 'ing-t-5', name: 'Arroz branco / Basmati', baseQuantity: 250, unit: 'g', category: 'hidratos', checked: false },
    { id: 'ing-t-6', name: 'Flocos de aveia', baseQuantity: 70, unit: 'g', category: 'hidratos', checked: false },
    { id: 'ing-t-7', name: 'Pão integral / Tortilhas', baseQuantity: 2, unit: 'un', category: 'hidratos', checked: false },
    { id: 'ing-t-8', name: 'Banana', baseQuantity: 2, unit: 'un', category: 'frescos', checked: false },
    { id: 'ing-t-9', name: 'Morangos / Frutos vermelhos', baseQuantity: 120, unit: 'g', category: 'frescos', checked: false },
    { id: 'ing-t-10', name: 'Legumes salteados (brócolos, courgette)', baseQuantity: 200, unit: 'g', category: 'frescos', checked: false },
    { id: 'ing-t-11', name: 'Azeite virgem extra', baseQuantity: 20, unit: 'ml', category: 'gorduras', checked: false },
    { id: 'ing-t-12', name: 'Manteiga de amendoim 100%', baseQuantity: 20, unit: 'g', category: 'gorduras', checked: false },
  ];
}

function formatScaledQuantity(item: ShoppingIngredient, days: number): string {
  if (item.isCustom) {
    return item.customQtyLabel || '1 un';
  }
  const total = item.baseQuantity * days;
  if (item.unit === 'g' && total >= 1000) {
    const kg = Math.round((total / 1000) * 100) / 100;
    return `${kg.toLocaleString('pt-PT')} kg`;
  }
  if (item.unit === 'ml' && total >= 1000) {
    const liters = Math.round((total / 1000) * 100) / 100;
    return `${liters.toLocaleString('pt-PT')} L`;
  }
  return `${total.toLocaleString('pt-PT')} ${item.unit}`;
}

export function ShoppingListModal({
  isOpen,
  onClose,
  planName,
  items,
  daysMultiplier,
  onChangeDaysMultiplier,
  onToggleItem,
  onAddCustomItem,
  onRemoveItem,
  onResetChecked,
}: ShoppingListModalProps) {
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const checkedCount = useMemo(
    () => items.filter((item) => item.checked).length,
    [items]
  );

  const progressPct =
    items.length > 0 ? Math.round((checkedCount / items.length) * 100) : 0;

  const grouped = useMemo(() => {
    const map: Record<IngredientCategory, ShoppingIngredient[]> = {
      proteinas: [],
      hidratos: [],
      frescos: [],
      gorduras: [],
      extras: [],
    };
    items.forEach((item) => {
      map[item.category].push(item);
    });
    return map;
  }, [items]);

  if (!isOpen) return null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddCustomItem(newName.trim(), newQty.trim() || '1 un');
    setNewName('');
    setNewQty('');
  };

  const portalTarget =
    typeof document !== 'undefined'
      ? document.querySelector('.app-device-wrapper') || document.body
      : null;

  const content = (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[260] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm px-0 pt-[max(1rem,env(safe-area-inset-top))] sm:p-4 animate-in fade-in duration-200"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Lista de Compras"
        className="bg-[#111111] border-t sm:border border-zinc-800 rounded-t-[28px] sm:rounded-[24px] w-full max-w-[420px] max-h-full sm:max-h-[88%] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200"
      >
        {/* Fixed Header */}
        <div className="px-5 pt-4 pb-3 border-b border-zinc-800/80 bg-[#111111] shrink-0 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <ShoppingCart className="w-5 h-5 text-[#F77F00] shrink-0" strokeWidth={2.2} />
              <div className="min-w-0">
                <h3 className="text-white text-base font-bold leading-tight truncate">
                  Lista de Compras
                </h3>
                <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                  {planName || 'Plano Alimentar'} • {checkedCount}/{items.length} no carrinho
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="text-zinc-400 hover:text-white min-w-[40px] min-h-[40px] -mr-2 flex items-center justify-center rounded-full hover:bg-zinc-800/60 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Barra de progresso das compras */}
          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#F77F00] rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {/* Multiplicador de dias (1, 3, 5, 7 dias) */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-zinc-400 shrink-0">
              Quantidades para:
            </span>
            <div className="flex items-center gap-1 bg-[#0a0a0a] border border-zinc-800/80 p-0.5 rounded-xl">
              {[1, 3, 5, 7].map((days) => {
                const isSelected = daysMultiplier === days;
                return (
                  <button
                    key={days}
                    type="button"
                    onClick={() => onChangeDaysMultiplier(days)}
                    style={isSelected ? { color: '#ffffff' } : undefined}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer tabular-nums ${
                      isSelected
                        ? 'bg-[#F77F00]'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {days}d
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scrollable Ingredient List */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain hide-scrollbar px-5 py-4 space-y-4">
          {CATEGORY_ORDER.map((category) => {
            const catItems = grouped[category];
            if (catItems.length === 0) return null;
            const meta = CATEGORY_META[category];

            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center gap-2 px-1">
                  {meta.icon}
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    {meta.label}
                  </span>
                </div>

                <div className="bg-[#0a0a0a] border border-zinc-800/70 rounded-2xl divide-y divide-zinc-800/60 overflow-hidden">
                  {catItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onToggleItem(item.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onToggleItem(item.id);
                        }
                      }}
                      className="flex items-center justify-between gap-3 px-3.5 py-3 hover:bg-zinc-900/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                            item.checked
                              ? 'bg-[#F77F00] border-[#F77F00]'
                              : 'border-zinc-700 bg-zinc-950'
                          }`}
                        >
                          {item.checked && (
                            <Check
                              className="w-3.5 h-3.5"
                              style={{ color: '#ffffff' }}
                              strokeWidth={3}
                            />
                          )}
                        </span>

                        <span
                          className={`text-xs font-medium truncate transition-colors ${
                            item.checked
                              ? 'line-through text-zinc-500'
                              : 'text-white'
                          }`}
                        >
                          {item.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-xs font-bold tabular-nums ${
                            item.checked ? 'text-zinc-600' : 'text-[#F77F00]'
                          }`}
                        >
                          {formatScaledQuantity(item, daysMultiplier)}
                        </span>

                        {item.isCustom && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveItem(item.id);
                            }}
                            aria-label={`Remover ${item.name}`}
                            className="p-1 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Adicionar ingrediente extra */}
          <form
            onSubmit={handleAddSubmit}
            className="bg-[#0a0a0a] border border-zinc-800/70 rounded-2xl p-3 space-y-2.5"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block px-0.5">
              Adicionar à lista
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Café, Canela, Água..."
                className="flex-1 min-w-0 bg-[#141414] border border-zinc-800 focus:border-[#F77F00] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
              />
              <input
                type="text"
                value={newQty}
                onChange={(e) => setNewQty(e.target.value)}
                placeholder="Qtd"
                className="w-20 bg-[#141414] border border-zinc-800 focus:border-[#F77F00] rounded-xl px-2.5 py-2 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={!newName.trim()}
                aria-label="Adicionar ingrediente"
                style={{ color: '#ffffff' }}
                className="w-9 h-9 rounded-xl bg-[#F77F00] hover:bg-orange-600 disabled:opacity-40 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-zinc-800/80 bg-[#111111] shrink-0 flex items-center gap-2.5">
          {checkedCount > 0 && (
            <button
              type="button"
              onClick={onResetChecked}
              className="px-3.5 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            style={{ color: '#ffffff' }}
            className="flex-1 py-3 rounded-xl bg-[#F77F00] hover:bg-orange-600 font-bold text-xs shadow-lg shadow-orange-500/20 transition-colors cursor-pointer"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );

  return portalTarget ? createPortal(content, portalTarget) : content;
}
