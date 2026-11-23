import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronLeft,
  MoreVertical,
  Flame,
  Beef,
  Wheat,
  Leaf,
  Link2,
  ClipboardList,
  RefreshCw,
  Plus,
  Minus,
  Save,
  X,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import {
  SubstituirAlimentoModal,
  FoodItemData,
} from '../components/diet/SubstituirAlimentoModal';

interface RefeicaoDetailProps {
  onBack: () => void;
  title: string;
}

function getMealNote(title: string): string {
  const normalized = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  if (normalized.includes('pequeno')) {
    return 'Pesar os alimentos em cru. Beber um copo de água ao acordar.';
  }
  if (normalized.includes('almoco')) {
    return 'Temperar com ervas aromáticas e limão. Evitar molhos extra.';
  }
  if (normalized.includes('lanche')) {
    return 'Consumir 60 a 90 min antes do treino e manter boa hidratação.';
  }
  if (normalized.includes('jantar')) {
    return 'Refeição leve para melhor digestão. Medir o azeite em cru.';
  }
  return 'Respeitar as quantidades indicadas e temperar com ervas a gosto.';
}

function isLiterUnit(unit: string): boolean {
  const u = unit.trim().toLowerCase();
  return u === 'l' || u === 'litro' || u === 'litros';
}

function formatQuantityAmount(value: number, unit: string): string {
  const cleanUnit = unit.trim() || 'g';
  if (isLiterUnit(cleanUnit)) {
    const rounded = Math.round(value * 100) / 100;
    return `${rounded.toLocaleString('pt-PT', {
      minimumFractionDigits: Number.isInteger(rounded) ? 0 : 1,
      maximumFractionDigits: 2,
    })} ${cleanUnit}`;
  }
  return `${Math.round(value)}${cleanUnit}`;
}

export function RefeicaoDetail({ onBack, title }: RefeicaoDetailProps) {
  // Option selection
  const [activeOption, setActiveOption] = useState<number>(1);

  // Foods state with rich nutrition data
  const [foods, setFoods] = useState<FoodItemData[]>([
    {
      id: 'f-1',
      name: 'Arroz branco cozido',
      amount: '150g',
      rawGrams: 150,
      unit: 'g',
      carbs: 42,
      protein: 3,
      fat: 0,
      calories: 190,
      emoji: '🍚',
      image:
        'https://images.unsplash.com/photo-1516684732162-798a0062be99?q=80&w=150&auto=format&fit=crop',
      category: 'carbs',
      note: 'Pesado pronto / cozido',
    },
    {
      id: 'f-2',
      name: 'Peito de frango grelhado',
      amount: '140g',
      rawGrams: 140,
      unit: 'g',
      carbs: 0,
      protein: 43,
      fat: 3,
      calories: 203,
      emoji: '🍗',
      image:
        'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=150&auto=format&fit=crop',
      category: 'protein',
      note: 'Grelhado com ervas',
    },
    {
      id: 'f-3',
      name: 'Azeite virgem extra',
      amount: '10ml',
      rawGrams: 10,
      unit: 'ml',
      carbs: 0,
      protein: 0,
      fat: 10,
      calories: 88,
      emoji: '🫒',
      image:
        'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=150&auto=format&fit=crop',
      category: 'fat',
      note: 'Crú para tempero',
    },
    {
      id: 'f-4',
      name: 'Morangos frescos',
      amount: '120g',
      rawGrams: 120,
      unit: 'g',
      carbs: 9,
      protein: 1,
      fat: 0.4,
      calories: 40,
      emoji: '🍓',
      image:
        'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=150&auto=format&fit=crop',
      category: 'fruits',
      note: 'Sobremesa',
    },
  ]);

  // Dynamic calculation of total meal macros
  const totalMacros = useMemo(() => {
    return foods.reduce(
      (acc, curr) => ({
        calories: acc.calories + curr.calories,
        protein: Math.round((acc.protein + curr.protein) * 10) / 10,
        carbs: Math.round((acc.carbs + curr.carbs) * 10) / 10,
        fat: Math.round((acc.fat + curr.fat) * 10) / 10,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [foods]);

  // Substitution Bottom Sheet state
  const [swapModalState, setSwapModalState] = useState<{
    isOpen: boolean;
    food: FoodItemData | null;
    foodIndex: number | null;
  }>({
    isOpen: false,
    food: null,
    foodIndex: null,
  });

  // Quantity Bottom Sheet state (only grams / ml / L editable)
  const [quantitySheet, setQuantitySheet] = useState<{
    isOpen: boolean;
    index: number | null;
    valueStr: string;
  }>({
    isOpen: false,
    index: null,
    valueStr: '',
  });

  // Toast notification state
  const [toast, setToast] = useState<{
    isOpen: boolean;
    kind: 'swap' | 'save' | 'info';
    primary: string;
    secondary?: string;
  }>({
    isOpen: false,
    kind: 'info',
    primary: '',
  });

  // Add new food modal state (add only)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    note: '',
  });

  const showToast = (
    kind: 'swap' | 'save' | 'info',
    primary: string,
    secondary?: string
  ) => {
    setToast({ isOpen: true, kind, primary, secondary });
    window.setTimeout(() => {
      setToast((prev) => ({ ...prev, isOpen: false }));
    }, 3000);
  };

  useEffect(() => {
    if (!quantitySheet.isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setQuantitySheet({ isOpen: false, index: null, valueStr: '' });
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [quantitySheet.isOpen]);

  // Open Substitution Bottom Sheet
  const handleOpenSwapSheet = (index: number) => {
    setSwapModalState({
      isOpen: true,
      food: foods[index],
      foodIndex: index,
    });
  };

  // Perform substitution
  const handlePerformSwap = (
    originalFood: FoodItemData,
    newFood: FoodItemData
  ) => {
    if (swapModalState.foodIndex === null) return;

    const updated = [...foods];
    updated[swapModalState.foodIndex] = {
      ...newFood,
      id: `f-${Date.now()}`,
    };
    setFoods(updated);
    showToast('swap', originalFood.name, newFood.name);
  };

  // Duplicate item
  const handleDuplicate = (index: number) => {
    const item = foods[index];
    const duplicated: FoodItemData = {
      ...item,
      id: `f-${Date.now()}`,
      name: `${item.name} (cópia)`,
    };
    const newFoodsList = [...foods];
    newFoodsList.splice(index + 1, 0, duplicated);
    setFoods(newFoodsList);
  };

  // Store link action (placeholder until store links are configured)
  const handleStoreLink = (food: FoodItemData) => {
    showToast('info', `Link da loja para ${food.name} será adicionado em breve.`);
  };

  // Open Quantity Bottom Sheet (grams / ml / L only)
  const handleOpenQuantitySheet = (index: number) => {
    const food = foods[index];
    setQuantitySheet({
      isOpen: true,
      index,
      valueStr: String(food.rawGrams),
    });
  };

  const activeQuantityFood =
    quantitySheet.index !== null ? foods[quantitySheet.index] ?? null : null;

  const parsedSheetQty = useMemo(() => {
    const normalized = quantitySheet.valueStr.replace(',', '.').trim();
    const num = parseFloat(normalized);
    if (Number.isNaN(num) || num <= 0) return null;
    return num;
  }, [quantitySheet.valueStr]);

  const previewMacros = useMemo(() => {
    if (!activeQuantityFood) return null;
    const baseQty = activeQuantityFood.rawGrams > 0 ? activeQuantityFood.rawGrams : 1;
    const targetQty = parsedSheetQty ?? baseQty;
    const ratio = targetQty / baseQty;
    return {
      calories: Math.round(activeQuantityFood.calories * ratio),
      protein: Math.round(activeQuantityFood.protein * ratio * 10) / 10,
      carbs: Math.round(activeQuantityFood.carbs * ratio * 10) / 10,
      fat: Math.round(activeQuantityFood.fat * ratio * 10) / 10,
    };
  }, [activeQuantityFood, parsedSheetQty]);

  const handleStepQuantity = (direction: -1 | 1) => {
    if (!activeQuantityFood) return;
    const liter = isLiterUnit(activeQuantityFood.unit);
    const step = liter
      ? 0.1
      : activeQuantityFood.unit.toLowerCase() === 'ml'
        ? 5
        : 10;
    const minVal = liter ? 0.1 : 1;
    const current = parsedSheetQty ?? activeQuantityFood.rawGrams;
    const next = Math.max(
      minVal,
      Math.round((current + direction * step) * 100) / 100
    );
    setQuantitySheet((prev) => ({ ...prev, valueStr: String(next) }));
  };

  const handleSaveQuantity = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      quantitySheet.index === null ||
      !activeQuantityFood ||
      parsedSheetQty === null ||
      !previewMacros
    ) {
      return;
    }

    const updated = [...foods];
    updated[quantitySheet.index] = {
      ...activeQuantityFood,
      rawGrams: parsedSheetQty,
      amount: formatQuantityAmount(parsedSheetQty, activeQuantityFood.unit),
      calories: previewMacros.calories,
      protein: previewMacros.protein,
      carbs: previewMacros.carbs,
      fat: previewMacros.fat,
    };
    setFoods(updated);
    setQuantitySheet({ isOpen: false, index: null, valueStr: '' });
  };

  // Open Add modal
  const handleOpenAdd = () => {
    setFormData({ name: '', amount: '', note: '' });
    setIsAddModalOpen(true);
  };

  // Save new food item
  const handleSaveAddModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.amount.trim()) return;

    const amountClean = formData.amount.trim();
    const numericMatch = amountClean.replace(',', '.').match(/[\d.]+/);
    const parsedQty = numericMatch ? parseFloat(numericMatch[0]) || 100 : 100;
    const lower = amountClean.toLowerCase();
    const unit = lower.includes('ml')
      ? 'ml'
      : lower.includes('l')
        ? 'L'
        : 'g';

    const newFoodItem: FoodItemData = {
      id: `f-${Date.now()}`,
      name: formData.name.trim(),
      amount: formatQuantityAmount(parsedQty, unit),
      rawGrams: parsedQty,
      unit,
      carbs: 20,
      protein: 15,
      fat: 5,
      calories: 185,
      emoji: '🍽️',
      image:
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=150&auto=format&fit=crop',
      category: 'custom',
      note: formData.note.trim(),
    };
    setFoods([...foods, newFoodItem]);
    setIsAddModalOpen(false);
  };

  return (
    <div className="relative flex flex-col min-h-screen px-5 pt-4 pb-14 animate-in slide-in-from-right-4 duration-300">
      {/* HEADER */}
      <header className="flex items-center justify-between pb-5 shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="text-orange-500 hover:scale-110 transition-transform p-1 cursor-pointer"
          aria-label="Voltar"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-white font-semibold text-[16px] tracking-wide">
          {title}
        </h2>
        <button
          type="button"
          className="text-orange-500 hover:scale-110 transition-transform p-1 cursor-pointer"
          aria-label="Opções"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      <div className="flex flex-col">
        {/* TABS DE OPÇÕES */}
        <div className="flex bg-[#0a0a0a] border border-zinc-800/80 rounded-[14px] p-1 mb-5">
          {[1, 2, 3].map((opt) => {
            const isActive = activeOption === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setActiveOption(opt)}
                className={`flex-1 py-2 rounded-[10px] text-[13px] font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-orange-500/15 border border-orange-500/50 text-white shadow-sm'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Opção {opt}
              </button>
            );
          })}
        </div>

        {/* PAINEL DE MACROS TOTAIS + NOTAS */}
        <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-[18px] mb-5 shadow-sm overflow-hidden">
          <div className="grid grid-cols-4 gap-2 py-4 px-2">
            <div className="flex flex-col items-center justify-center gap-1 border-r border-zinc-800/60">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-white font-bold text-[14px] leading-none tabular-nums">
                  {totalMacros.calories}
                </span>
              </div>
              <span className="text-zinc-500 text-[10px] font-medium">
                kcal
              </span>
            </div>

            <div className="flex flex-col items-center justify-center gap-1 border-r border-zinc-800/60">
              <div className="flex items-center gap-1.5">
                <Beef className="w-4 h-4 text-orange-500" />
                <span className="text-white font-bold text-[14px] leading-none tabular-nums">
                  {totalMacros.protein}g
                </span>
              </div>
              <span className="text-zinc-500 text-[10px] font-medium">
                Proteína
              </span>
            </div>

            <div className="flex flex-col items-center justify-center gap-1 border-r border-zinc-800/60">
              <div className="flex items-center gap-1.5">
                <Wheat className="w-4 h-4 text-orange-500" />
                <span className="text-white font-bold text-[14px] leading-none tabular-nums">
                  {totalMacros.carbs}g
                </span>
              </div>
              <span className="text-zinc-500 text-[10px] font-medium">
                Carboidratos
              </span>
            </div>

            <div className="flex flex-col items-center justify-center gap-1">
              <div className="flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-orange-500" />
                <span className="text-white font-bold text-[14px] leading-none tabular-nums">
                  {totalMacros.fat}g
                </span>
              </div>
              <span className="text-zinc-500 text-[10px] font-medium">
                Gorduras
              </span>
            </div>
          </div>

          <div className="border-t border-zinc-800/70 px-3.5 py-2.5 flex items-start gap-2">
            <FileText className="w-3.5 h-3.5 text-[#F77F00] shrink-0 mt-0.5" />
            <p className="text-[11.5px] text-zinc-400 leading-snug">
              <span className="text-zinc-200 font-semibold">Notas:</span>{' '}
              {getMealNote(title)}
            </p>
          </div>
        </div>

        {/* LISTA DE ALIMENTOS DA REFEIÇÃO */}
        <div className="flex justify-between items-center mb-2 px-1">
          <h3 className="text-white font-bold text-[15px] tracking-tight">
            Ingredientes ({foods.length})
          </h3>
          <span className="text-zinc-500 text-[11px]">
            Toca na quantidade para ajustar
          </span>
        </div>

        <div className="flex flex-col gap-2.5 mb-5">
          {foods.map((food, i) => (
            <div
              key={food.id || i}
              className="flex items-center bg-[#0a0a0a] border border-zinc-800/70 hover:border-zinc-700/80 rounded-[18px] px-3 py-3 gap-2.5 transition-colors group"
            >
              {/* EMOJI SEM QUADRADO */}
              <span
                aria-hidden="true"
                className="text-2xl leading-none shrink-0 select-none"
              >
                {food.emoji || '🍽️'}
              </span>

              {/* DETALHES: NOME -> QUANTIDADE (EDITÁVEL) -> MACROS -> NOTAS */}
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-bold text-[14.5px] leading-snug">
                  {food.name}
                </h4>

                {/* Linha 1: apenas gramas / ml / litros (clicável para editar via bottom-sheet) */}
                <div className="mt-1">
                  <button
                    type="button"
                    onClick={() => handleOpenQuantitySheet(i)}
                    aria-label={`Editar quantidade de ${food.name}`}
                    className="text-[#F77F00] hover:text-orange-400 font-bold text-[13px] leading-tight tabular-nums transition-colors cursor-pointer"
                  >
                    {food.amount}
                  </button>
                </div>

                {/* Linha 2: restantes macros */}
                <div className="text-zinc-400 text-[11px] font-medium tabular-nums mt-0.5">
                  {food.carbs}C • {food.protein}P • {food.fat}G •{' '}
                  {food.calories} kcal
                </div>

                {/* Linha 3: notas do ingrediente */}
                {food.note && (
                  <span className="text-zinc-500 text-[10.5px] block mt-0.5 leading-snug">
                    {food.note}
                  </span>
                )}
              </div>

              {/* AÇÕES */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenSwapSheet(i)}
                  title="Substituir alimento"
                  aria-label={`Substituir ${food.name}`}
                  className="w-8 h-8 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDuplicate(i)}
                  title="Duplicar"
                  aria-label={`Duplicar ${food.name}`}
                  className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ClipboardList className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleStoreLink(food)}
                  title="Ver na loja"
                  aria-label={`Abrir link da loja para ${food.name}`}
                  className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-[#F77F00] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Link2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* BOTÃO ADICIONAR ALIMENTO */}
        <button
          type="button"
          onClick={handleOpenAdd}
          className="w-full py-3.5 rounded-[16px] border border-dashed border-orange-500/40 flex items-center justify-center gap-2 text-white font-bold text-[13px] hover:bg-orange-500/10 transition-colors mb-5 cursor-pointer bg-zinc-950/40"
        >
          <Plus className="w-4 h-4 text-orange-500" />
          <span className="text-white font-bold">Adicionar alimento</span>
        </button>

        {/* BOTÃO PRINCIPAL GUARDAR REFEIÇÃO */}
        <button
          type="button"
          onClick={() => showToast('save', 'Refeição guardada com sucesso!')}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-[14px] py-3.5 rounded-[16px] flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(249,115,22,0.25)] active:scale-[0.99] cursor-pointer"
        >
          <Save className="w-4 h-4 text-white" />
          <span className="text-white font-bold">Guardar Refeição</span>
        </button>
      </div>

      {/* SUBSTITUIR ALIMENTO BOTTOM SHEET MODAL */}
      <SubstituirAlimentoModal
        isOpen={swapModalState.isOpen}
        currentFood={swapModalState.food}
        onClose={() =>
          setSwapModalState({ isOpen: false, food: null, foodIndex: null })
        }
        onSwap={handlePerformSwap}
      />

      {/* BOTTOM SHEET: EDITAR APENAS QUANTIDADE (GRAMAS / ML / LITROS) */}
      {quantitySheet.isOpen &&
        activeQuantityFood &&
        createPortal(
          <div
            className="fixed inset-0 z-[260] flex items-end justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setQuantitySheet({ isOpen: false, index: null, valueStr: '' });
              }
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Editar quantidade de ${activeQuantityFood.name}`}
              className="w-full max-w-[414px] bg-[#0a0a0c] border-t border-x border-zinc-800 rounded-t-[28px] shadow-[0_-24px_60px_rgba(0,0,0,0.9)] overflow-hidden animate-in slide-in-from-bottom duration-200"
            >
              {/* Drag handle */}
              <div className="pt-3 pb-1 flex justify-center">
                <div className="w-10 h-1 rounded-full bg-zinc-700/80" />
              </div>

              {/* Cabeçalho */}
              <div className="flex items-center justify-between px-5 pt-2 pb-3 border-b border-zinc-800/70">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-xl shrink-0">
                    {activeQuantityFood.emoji || '🍽️'}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-white text-sm font-bold truncate">
                      {activeQuantityFood.name}
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Ajustar quantidade ({activeQuantityFood.unit})
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setQuantitySheet({
                      isOpen: false,
                      index: null,
                      valueStr: '',
                    })
                  }
                  aria-label="Fechar"
                  className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Formulário de Quantidade */}
              <form
                onSubmit={handleSaveQuantity}
                className="px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-5"
              >
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleStepQuantity(-1)}
                    aria-label="Diminuir quantidade"
                    className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-[#F77F00]/60 text-white flex items-center justify-center transition-colors active:scale-95 cursor-pointer shrink-0"
                  >
                    <Minus className="w-5 h-5" />
                  </button>

                  <div className="flex items-baseline justify-center gap-1.5 bg-[#111111] border border-zinc-800 focus-within:border-[#F77F00] rounded-2xl px-4 py-2.5 min-w-[140px] transition-colors">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={quantitySheet.valueStr}
                      onChange={(e) =>
                        setQuantitySheet((prev) => ({
                          ...prev,
                          valueStr: e.target.value.replace(/[^0-9.,]/g, ''),
                        }))
                      }
                      autoFocus
                      aria-label={`Quantidade em ${activeQuantityFood.unit}`}
                      className="w-20 bg-transparent text-center text-2xl font-black text-white tabular-nums focus:outline-none"
                    />
                    <span className="text-sm font-bold text-[#F77F00]">
                      {activeQuantityFood.unit}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStepQuantity(1)}
                    aria-label="Aumentar quantidade"
                    className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-[#F77F00]/60 text-white flex items-center justify-center transition-colors active:scale-95 cursor-pointer shrink-0"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                {/* Pré-visualização automática das macros */}
                {previewMacros && (
                  <div className="grid grid-cols-4 gap-2 rounded-2xl bg-[#111111] border border-zinc-800/80 py-3 px-2 text-center">
                    <div>
                      <span className="block text-xs font-bold text-white tabular-nums">
                        {previewMacros.calories}
                      </span>
                      <span className="block text-[10px] text-zinc-500 mt-0.5">
                        kcal
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-white tabular-nums">
                        {previewMacros.protein}g
                      </span>
                      <span className="block text-[10px] text-zinc-500 mt-0.5">
                        Proteína
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-white tabular-nums">
                        {previewMacros.carbs}g
                      </span>
                      <span className="block text-[10px] text-zinc-500 mt-0.5">
                        Hidratos
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-white tabular-nums">
                        {previewMacros.fat}g
                      </span>
                      <span className="block text-[10px] text-zinc-500 mt-0.5">
                        Gordura
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantitySheet({
                        isOpen: false,
                        index: null,
                        valueStr: '',
                      })
                    }
                    className="min-h-[44px] px-4 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={parsedSheetQty === null}
                    className="flex-1 min-h-[44px] rounded-xl bg-[#F77F00] hover:bg-[#e57300] disabled:opacity-45 text-white text-xs font-bold shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed"
                  >
                    Guardar quantidade
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.querySelector('.app-device-wrapper') || document.body
        )}

      {/* FLOATING TOAST */}
      {toast.isOpen && (
        <div
          onClick={() => setToast((prev) => ({ ...prev, isOpen: false }))}
          className="fixed bottom-6 left-5 right-5 max-w-[400px] mx-auto z-[250] bg-[#0f0f0f] border border-orange-500/70 rounded-[18px] p-3.5 px-4 flex items-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-5 duration-300 cursor-pointer"
        >
          <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0" />
          <span className="text-[13px] text-zinc-200 leading-snug">
            {toast.kind === 'swap' ? (
              <>
                <strong className="text-white font-bold">
                  {toast.primary}
                </strong>{' '}
                substituído por{' '}
                <strong className="text-orange-400 font-bold">
                  {toast.secondary}
                </strong>
              </>
            ) : (
              <span className="font-semibold text-white">{toast.primary}</span>
            )}
          </span>
        </div>
      )}

      {/* MODAL ADICIONAR ALIMENTO */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0a0a0a] border border-zinc-800/90 rounded-[24px] w-full max-w-[340px] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-white font-bold text-[16px]">
                Adicionar Alimento
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveAddModal}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 text-[12px] font-medium">
                  Nome do Alimento
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ex: Arroz Branco cozido"
                  className="bg-black border border-zinc-800 rounded-[12px] px-4 py-3 text-white text-[14px] focus:outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 text-[12px] font-medium">
                  Quantidade (g, ml ou L)
                </label>
                <input
                  type="text"
                  required
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="Ex: 150g"
                  className="bg-black border border-zinc-800 rounded-[12px] px-4 py-3 text-white text-[14px] focus:outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 text-[12px] font-medium">
                  Nota (Opcional)
                </label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                  placeholder="Ex: Cozido sem sal"
                  className="bg-black border border-zinc-800 rounded-[12px] px-4 py-3 text-white text-[14px] focus:outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-[14px] py-3 rounded-[12px] transition-colors cursor-pointer shadow-[0_0_12px_rgba(249,115,22,0.25)]"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

