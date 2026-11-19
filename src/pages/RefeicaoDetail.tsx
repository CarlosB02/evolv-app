import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  MoreVertical, 
  Flame, 
  Beef, 
  Wheat, 
  Leaf, 
  Pencil, 
  ClipboardList, 
  RefreshCw, 
  Plus, 
  Save, 
  X, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { SubstituirAlimentoModal, FoodItemData } from '../components/diet/SubstituirAlimentoModal';

interface RefeicaoDetailProps {
  onBack: () => void;
  title: string;
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
      image: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?q=80&w=150&auto=format&fit=crop',
      category: 'carbs',
      note: 'Pesado pronto / cozido'
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
      image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?q=80&w=150&auto=format&fit=crop',
      category: 'protein',
      note: 'Grelhado com ervas'
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
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=150&auto=format&fit=crop',
      category: 'fat',
      note: 'Crú para tempero'
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
      image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=150&auto=format&fit=crop',
      category: 'fruits',
      note: 'Sobremesa'
    }
  ]);

  // Dynamic calculation of total meal macros
  const totalMacros = useMemo(() => {
    return foods.reduce(
      (acc, curr) => ({
        calories: acc.calories + curr.calories,
        protein: Math.round((acc.protein + curr.protein) * 10) / 10,
        carbs: Math.round((acc.carbs + curr.carbs) * 10) / 10,
        fat: Math.round((acc.fat + curr.fat) * 10) / 10
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
    foodIndex: null
  });

  // Toast notification state
  const [toast, setToast] = useState<{
    isOpen: boolean;
    original: string;
    replacement: string;
  }>({
    isOpen: false,
    original: '',
    replacement: ''
  });

  // Add / Edit regular modal state
  const [editModalState, setEditModalState] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    index: number | null;
  }>({ isOpen: false, mode: 'add', index: null });

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    note: ''
  });

  // Open Substitution Bottom Sheet
  const handleOpenSwapSheet = (index: number) => {
    setSwapModalState({
      isOpen: true,
      food: foods[index],
      foodIndex: index
    });
  };

  // Perform substitution
  const handlePerformSwap = (originalFood: FoodItemData, newFood: FoodItemData) => {
    if (swapModalState.foodIndex === null) return;

    const updated = [...foods];
    updated[swapModalState.foodIndex] = {
      ...newFood,
      id: `f-${Date.now()}`
    };
    setFoods(updated);

    // Show floating toast matching user's HTML mockup
    setToast({
      isOpen: true,
      original: originalFood.name,
      replacement: newFood.name
    });

    // Auto-hide toast after 3.5 seconds
    setTimeout(() => {
      setToast(prev => ({ ...prev, isOpen: false }));
    }, 3500);
  };

  // Duplicate item
  const handleDuplicate = (index: number) => {
    const item = foods[index];
    const duplicated: FoodItemData = {
      ...item,
      id: `f-${Date.now()}`,
      name: `${item.name} (cópia)`
    };
    const newFoodsList = [...foods];
    newFoodsList.splice(index + 1, 0, duplicated);
    setFoods(newFoodsList);
  };

  // Open Edit modal
  const handleOpenEdit = (index: number) => {
    const food = foods[index];
    setFormData({
      name: food.name,
      amount: food.amount,
      note: food.note || ''
    });
    setEditModalState({ isOpen: true, mode: 'edit', index });
  };

  // Open Add modal
  const handleOpenAdd = () => {
    setFormData({ name: '', amount: '', note: '' });
    setEditModalState({ isOpen: true, mode: 'add', index: null });
  };

  // Delete food item
  const handleDeleteFood = () => {
    if (editModalState.index !== null) {
      setFoods(foods.filter((_, i) => i !== editModalState.index));
      setEditModalState({ isOpen: false, mode: 'add', index: null });
    }
  };

  // Save add/edit
  const handleSaveEditModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.amount.trim()) return;

    const parsedGrams = parseInt(formData.amount.replace(/\D/g, '')) || 100;

    if (editModalState.mode === 'add') {
      const newFoodItem: FoodItemData = {
        id: `f-${Date.now()}`,
        name: formData.name.trim(),
        amount: formData.amount.trim(),
        rawGrams: parsedGrams,
        unit: formData.amount.includes('ml') ? 'ml' : 'g',
        carbs: 20,
        protein: 15,
        fat: 5,
        calories: 185,
        emoji: '🍽️',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=150&auto=format&fit=crop',
        category: 'custom',
        note: formData.note.trim()
      };
      setFoods([...foods, newFoodItem]);
    } else if (editModalState.mode === 'edit' && editModalState.index !== null) {
      const updated = [...foods];
      const target = updated[editModalState.index];
      updated[editModalState.index] = {
        ...target,
        name: formData.name.trim(),
        amount: formData.amount.trim(),
        rawGrams: parsedGrams,
        note: formData.note.trim()
      };
      setFoods(updated);
    }

    setEditModalState({ isOpen: false, mode: 'add', index: null });
  };

  return (
    <div className="relative flex flex-col min-h-screen px-5 pt-4 pb-14 animate-in slide-in-from-right-4 duration-300">
      
      {/* HEADER */}
      <header className="flex items-center justify-between pb-5 shrink-0">
        <button 
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
          className="text-orange-500 hover:scale-110 transition-transform p-1 cursor-pointer"
          aria-label="Opções"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </header>

      <div className="flex flex-col">
        
        {/* HERO IMAGE */}
        <div className="w-full h-[200px] rounded-[24px] overflow-hidden mb-5 border border-zinc-800/60 relative group shadow-lg">
          <img 
            src="https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=800&auto=format&fit=crop" 
            alt="Refeição" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
            <span className="text-white font-bold text-[17px] drop-shadow-md">
              {title}
            </span>
          </div>
        </div>

        {/* TABS DE OPÇÕES */}
        <div className="flex bg-[#0a0a0a] border border-zinc-800/80 rounded-[14px] p-1 mb-5">
          {[1, 2, 3].map((opt) => {
            const isActive = activeOption === opt;
            return (
              <button 
                key={opt}
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

        {/* PAINEL DE MACROS TOTAIS */}
        <div className="grid grid-cols-4 gap-2 bg-[#0a0a0a] border border-zinc-800/80 rounded-[18px] py-4 px-2 mb-5 shadow-sm">
          <div className="flex flex-col items-center justify-center gap-1 border-r border-zinc-800/60">
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-white font-bold text-[14px] leading-none">
                {totalMacros.calories}
              </span>
            </div>
            <span className="text-zinc-500 text-[10px] font-medium">kcal</span>
          </div>

          <div className="flex flex-col items-center justify-center gap-1 border-r border-zinc-800/60">
            <div className="flex items-center gap-1.5">
              <Beef className="w-4 h-4 text-orange-500" />
              <span className="text-white font-bold text-[14px] leading-none">
                {totalMacros.protein}g
              </span>
            </div>
            <span className="text-zinc-500 text-[10px] font-medium">Proteína</span>
          </div>

          <div className="flex flex-col items-center justify-center gap-1 border-r border-zinc-800/60">
            <div className="flex items-center gap-1.5">
              <Wheat className="w-4 h-4 text-orange-500" />
              <span className="text-white font-bold text-[14px] leading-none">
                {totalMacros.carbs}g
              </span>
            </div>
            <span className="text-zinc-500 text-[10px] font-medium">Carboidratos</span>
          </div>

          <div className="flex flex-col items-center justify-center gap-1">
            <div className="flex items-center gap-1.5">
              <Leaf className="w-4 h-4 text-orange-500" />
              <span className="text-white font-bold text-[14px] leading-none">
                {totalMacros.fat}g
              </span>
            </div>
            <span className="text-zinc-500 text-[10px] font-medium">Gorduras</span>
          </div>
        </div>

        {/* LISTA DE ALIMENTOS DA REFEIÇÃO */}
        <div className="flex justify-between items-center mb-2 px-1">
          <h3 className="text-white font-bold text-[15px] tracking-tight">
            Ingredientes ({foods.length})
          </h3>
          <span className="text-zinc-500 text-[11px]">
            Clica em ⇄ para substituir alimento
          </span>
        </div>

        <div className="flex flex-col gap-2.5 mb-5">
          {foods.map((food, i) => (
            <div 
              key={food.id || i} 
              className="flex items-center bg-[#0a0a0a] border border-zinc-800/70 hover:border-zinc-700/80 rounded-[18px] p-3 gap-3.5 transition-colors group"
            >
              {/* EMOJI OU FOTO TILE */}
              <div className="w-12 h-12 rounded-[14px] bg-[#141414] border border-zinc-800 flex items-center justify-center text-2xl shrink-0">
                {food.emoji || '🍽️'}
              </div>
              
              {/* DETALHES */}
              <div 
                onClick={() => handleOpenSwapSheet(i)}
                className="flex-1 min-w-0 cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <h4 className="text-white font-bold text-[14.5px] truncate group-hover:text-orange-400 transition-colors">
                    {food.name}
                  </h4>
                </div>
                
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-orange-500 font-bold text-[13px] leading-tight">
                    {food.amount}
                  </span>
                  <span className="text-zinc-500 text-[11px] font-medium">
                    {food.carbs}C • {food.protein}P • {food.fat}G • {food.calories} kcal
                  </span>
                </div>

                {food.note && (
                  <span className="text-zinc-500 text-[10.5px] truncate block mt-0.5">
                    {food.note}
                  </span>
                )}
              </div>

              {/* AÇÕES */}
              <div className="flex items-center gap-2 shrink-0">
                <button 
                  onClick={() => handleOpenSwapSheet(i)} 
                  title="Substituir alimento"
                  className="w-8 h-8 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <button 
                  onClick={() => handleDuplicate(i)} 
                  title="Duplicar"
                  className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <ClipboardList className="w-4 h-4" />
                </button>

                <button 
                  onClick={() => handleOpenEdit(i)} 
                  title="Editar"
                  className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* BOTÃO ADICIONAR ALIMENTO */}
        <button 
          onClick={handleOpenAdd}
          className="w-full py-3.5 rounded-[16px] border border-dashed border-orange-500/40 flex items-center justify-center gap-2 text-white font-bold text-[13px] hover:bg-orange-500/10 transition-colors mb-5 cursor-pointer bg-zinc-950/40"
        >
          <Plus className="w-4 h-4 text-orange-500" />
          <span className="text-white font-bold">Adicionar alimento</span>
        </button>

        {/* BOTÃO PRINCIPAL GUARDAR REFEIÇÃO COM TEXTO BRANCO */}
        <button 
          onClick={() => {
            // Simulated save with smooth interaction
            setToast({
              isOpen: true,
              original: 'Refeição',
              replacement: 'Guardada com sucesso!'
            });
            setTimeout(() => {
              setToast(prev => ({ ...prev, isOpen: false }));
            }, 2500);
          }}
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
        onClose={() => setSwapModalState({ isOpen: false, food: null, foodIndex: null })}
        onSwap={handlePerformSwap}
      />

      {/* FLOATING TOAST MATCHING HTML MOCKUP */}
      {toast.isOpen && (
        <div 
          onClick={() => setToast(prev => ({ ...prev, isOpen: false }))}
          className="fixed bottom-6 left-5 right-5 max-w-[400px] mx-auto z-[250] bg-[#0f0f0f] border border-orange-500/70 rounded-[18px] p-3.5 px-4 flex items-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-5 duration-300 cursor-pointer"
        >
          <CheckCircle2 className="w-5 h-5 text-orange-500 shrink-0" />
          <span className="text-[13px] text-zinc-200 leading-snug">
            {toast.original === 'Refeição' ? (
              <span className="font-semibold text-white">Refeição guardada com sucesso!</span>
            ) : (
              <>
                <strong className="text-white font-bold">{toast.original}</strong> substituído por{' '}
                <strong className="text-orange-400 font-bold">{toast.replacement}</strong>
              </>
            )}
          </span>
        </div>
      )}

      {/* MODAL REGULAR ADICIONAR / EDITAR */}
      {editModalState.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0a0a0a] border border-zinc-800/90 rounded-[24px] w-full max-w-[340px] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-white font-bold text-[16px]">
                {editModalState.mode === 'add' ? 'Adicionar Alimento' : 'Editar Alimento'}
              </h3>
              <button 
                onClick={() => setEditModalState({ ...editModalState, isOpen: false })} 
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditModal} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 text-[12px] font-medium">Nome do Alimento</label>
                <input 
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: Arroz Branco cozido"
                  className="bg-black border border-zinc-800 rounded-[12px] px-4 py-3 text-white text-[14px] focus:outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 text-[12px] font-medium">Quantidade (g ou ml)</label>
                <input 
                  type="text"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="Ex: 150g"
                  className="bg-black border border-zinc-800 rounded-[12px] px-4 py-3 text-white text-[14px] focus:outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-zinc-400 text-[12px] font-medium">Nota (Opcional)</label>
                <input 
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  placeholder="Ex: Cozido sem sal"
                  className="bg-black border border-zinc-800 rounded-[12px] px-4 py-3 text-white text-[14px] focus:outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>

              <div className="flex gap-3 mt-2">
                {editModalState.mode === 'edit' && (
                  <button 
                    type="button"
                    onClick={handleDeleteFood}
                    className="flex-1 bg-red-500/10 text-red-400 font-bold text-[13px] py-3 rounded-[12px] hover:bg-red-500/20 transition-colors cursor-pointer"
                  >
                    Remover
                  </button>
                )}
                <button 
                  type="submit"
                  className="flex-[2] bg-orange-500 hover:bg-orange-600 text-white font-bold text-[14px] py-3 rounded-[12px] transition-colors cursor-pointer shadow-[0_0_12px_rgba(249,115,22,0.25)]"
                >
                  {editModalState.mode === 'add' ? 'Adicionar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
