import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  ChevronLeft, 
  Flame, 
  Beef,
  Wheat,
  Droplet, 
  ChevronDown, 
  ChevronRight, 
  Coffee, 
  Utensils, 
  Apple, 
  Moon,
  Bell, 
  Plus, 
  FileText, 
  Paperclip,
  X,
  ShoppingCart
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import {
  ShoppingIngredient,
  ShoppingListModal,
  getInitialShoppingIngredients,
} from '../components/diet/ShoppingListModal';
import { PT_DIET_NOTE, PtDietNote } from '../data/dietPlansData';

export interface RefeicaoItem {
  id: string;
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image: string;
  iconType: 'coffee' | 'lunch' | 'snack' | 'dinner' | 'custom';
}

interface RefeicoesViewProps {
  onBack: () => void;
  onSelectMeal: (mealName: string) => void;
  planName?: string;
  planNote?: PtDietNote | null;
}

export function RefeicoesView({ onBack, onSelectMeal, planName, planNote }: RefeicoesViewProps) {
  const { openNotifications, totalUnreadCount } = useNotifications();
  const activeNote = planNote ?? PT_DIET_NOTE;
  const planStorageKey = `evolv_shopping_list_${(planName || 'default').toLowerCase().replace(/\s+/g, '_')}`;

  const [shoppingItems, setShoppingItems] = useState<ShoppingIngredient[]>(() => {
    try {
      const saved = localStorage.getItem(planStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback to default ingredients
    }
    return getInitialShoppingIngredients(planName);
  });

  const [shoppingDays, setShoppingDays] = useState<number>(3);
  const [isShoppingListOpen, setIsShoppingListOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(planStorageKey, JSON.stringify(shoppingItems));
    } catch {
      // Ignore storage errors
    }
  }, [planStorageKey, shoppingItems]);

  const remainingShoppingCount = shoppingItems.filter((item) => !item.checked).length;

  const handleToggleShoppingItem = (id: string) => {
    setShoppingItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleAddCustomShoppingItem = (name: string, qtyLabel: string) => {
    setShoppingItems((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        name,
        baseQuantity: 1,
        unit: 'un',
        category: 'extras',
        checked: false,
        isCustom: true,
        customQtyLabel: qtyLabel,
      },
    ]);
  };

  const handleRemoveShoppingItem = (id: string) => {
    setShoppingItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleResetCheckedShopping = () => {
    setShoppingItems((prev) => prev.map((item) => ({ ...item, checked: false })));
  };

  const [meals, setMeals] = useState<RefeicaoItem[]>([
    {
      id: '1',
      name: 'PEQUENO-ALMOÇO',
      time: '12:00',
      calories: 350,
      protein: 30,
      carbs: 50,
      fat: 10,
      image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=300&auto=format&fit=crop',
      iconType: 'coffee'
    },
    {
      id: '2',
      name: 'ALMOÇO',
      time: '12:00',
      calories: 350,
      protein: 40,
      carbs: 65,
      fat: 15,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&auto=format&fit=crop',
      iconType: 'lunch'
    },
    {
      id: '3',
      name: 'LANCHE DA TARDE',
      time: '17:00',
      calories: 320,
      protein: 25,
      carbs: 35,
      fat: 8,
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=300&auto=format&fit=crop',
      iconType: 'snack'
    },
    {
      id: '4',
      name: 'JANTAR',
      time: '20:00',
      calories: 630,
      protein: 35,
      carbs: 50,
      fat: 17,
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=300&auto=format&fit=crop',
      iconType: 'dinner'
    }
  ]);

  const [sortOrder, setSortOrder] = useState<'time' | 'calories'>('time');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  
  const [newMealData, setNewMealData] = useState({
    name: '',
    time: '15:30',
    calories: '300',
    protein: '25',
    carbs: '30',
    fat: '10'
  });

  const getMealIcon = (type: RefeicaoItem['iconType']) => {
    switch (type) {
      case 'coffee':
        return <Coffee className="w-3.5 h-3.5 text-amber-400 shrink-0" strokeWidth={2.2} />;
      case 'lunch':
        return <Utensils className="w-3.5 h-3.5 text-[#F77F00] shrink-0" strokeWidth={2.2} />;
      case 'snack':
        return <Apple className="w-3.5 h-3.5 text-emerald-400 shrink-0" strokeWidth={2.2} />;
      case 'dinner':
        return <Moon className="w-3.5 h-3.5 text-indigo-400 shrink-0" strokeWidth={2.2} />;
      default:
        return <Utensils className="w-3.5 h-3.5 text-sky-400 shrink-0" strokeWidth={2.2} />;
    }
  };

  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMealData.name.trim()) return;

    const newMeal: RefeicaoItem = {
      id: String(Date.now()),
      name: newMealData.name.trim().toUpperCase(),
      time: newMealData.time,
      calories: Number(newMealData.calories) || 0,
      protein: Number(newMealData.protein) || 0,
      carbs: Number(newMealData.carbs) || 0,
      fat: Number(newMealData.fat) || 0,
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=300&auto=format&fit=crop',
      iconType: 'custom'
    };

    setMeals([...meals, newMeal]);
    setNewMealData({
      name: '',
      time: '15:30',
      calories: '300',
      protein: '25',
      carbs: '30',
      fat: '10'
    });
    setIsAddModalOpen(false);
  };

  const sortedMeals = [...meals].sort((a, b) => {
    if (sortOrder === 'calories') {
      return b.calories - a.calories;
    }
    return a.time.localeCompare(b.time);
  });

  return (
    <>
      {/* HEADER SUPERIOR STICKY COM BOTÃO VOLTAR + CARRINHO DE COMPRAS */}
      <header className="flex justify-between items-center px-5 pt-[max(0.75rem,env(safe-area-inset-top))] sm:pt-8 pb-3 bg-black/90 backdrop-blur-xl sticky top-0 z-30 border-b border-zinc-900">
        <button 
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6 text-orange-500" />
          <span className="text-[13px] font-medium">Voltar</span>
        </button>

        <h2 className="text-white text-[15px] font-medium tracking-wide truncate max-w-[160px] text-center">
          {planName || 'Refeições'}
        </h2>

        <div className="flex gap-4">
          <button 
            type="button"
            onClick={() => openNotifications('geral')}
            className="relative text-orange-500 transition-transform hover:scale-110 cursor-pointer" 
            aria-label="Notificações"
            title="Abrir Notificações"
          >
            <Bell className="w-[20px] h-[20px]" strokeWidth={2} />
            {totalUnreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-[#0a0a0a] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-black animate-pulse">
                {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
              </span>
            )}
          </button>
          <button 
            type="button"
            onClick={() => setIsShoppingListOpen(true)}
            className="relative text-orange-500 transition-transform hover:scale-110 cursor-pointer" 
            aria-label="Lista de Compras"
            title="Abrir Lista de Compras"
          >
            <ShoppingCart className="w-[20px] h-[20px]" strokeWidth={2} />
            {remainingShoppingCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-orange-500 text-[#0a0a0a] text-[9px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center border-2 border-black">
                {remainingShoppingCount > 99 ? '99+' : remainingShoppingCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-4 px-5 pt-4 pb-8 animate-in fade-in duration-200">
      {/* 1. PAINEL DE MACROS DIÁRIOS */}
      <div className="bg-[#0a0a0a] rounded-[22px] p-4 border border-zinc-800/60 shadow-lg">
        <div className="grid grid-cols-4 gap-2 text-center">
          {/* Calorias */}
          <div className="flex flex-col items-center gap-1.5">
            <Flame className="w-4 h-4 text-[#F77F00]" strokeWidth={2.2} />
            <span className="text-[11px] text-zinc-400 font-normal">Calorias</span>
            <div className="text-[11px] font-medium leading-tight">
              <span className="text-white font-bold text-[12px]">1.850</span>
              <span className="text-zinc-500 text-[10px]"> / 2.400 kcal</span>
            </div>
          </div>

          {/* Proteínas */}
          <div className="flex flex-col items-center gap-1.5">
            <Beef className="w-4 h-4 text-rose-400" strokeWidth={2.2} />
            <span className="text-[11px] text-zinc-400 font-normal">Proteínas</span>
            <div className="text-[11px] font-medium leading-tight">
              <span className="text-white font-bold text-[12px]">130 g</span>
              <span className="text-zinc-500 text-[10px]"> / 160 g</span>
            </div>
          </div>

          {/* Hidratos */}
          <div className="flex flex-col items-center gap-1.5">
            <Wheat className="w-4 h-4 text-amber-400" strokeWidth={2.2} />
            <span className="text-[11px] text-zinc-400 font-normal">Hidratos</span>
            <div className="text-[11px] font-medium leading-tight">
              <span className="text-white font-bold text-[12px]">200 g</span>
              <span className="text-zinc-500 text-[10px]"> / 260 g</span>
            </div>
          </div>

          {/* Gorduras */}
          <div className="flex flex-col items-center gap-1.5">
            <Droplet className="w-4 h-4 text-sky-400" strokeWidth={2.2} />
            <span className="text-[11px] text-zinc-400 font-normal">Gorduras</span>
            <div className="text-[11px] font-medium leading-tight">
              <span className="text-white font-bold text-[12px]">60 g</span>
              <span className="text-zinc-500 text-[10px]"> / 70 g</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CABEÇALHO REFEIÇÕES + ORDENAR */}
      <div className="flex justify-between items-center px-1 mt-1">
        <h3 className="text-white text-[18px] font-bold tracking-tight">Refeições</h3>
        
        <button 
          onClick={() => setSortOrder(prev => prev === 'time' ? 'calories' : 'time')}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0a0a0a] border border-zinc-800 text-zinc-300 text-[11px] font-medium hover:border-zinc-700 transition-colors cursor-pointer"
        >
          <span>Ordenar</span>
          <ChevronDown className="w-3.5 h-3.5 text-orange-500" />
        </button>
      </div>

      {/* 3. LISTA DE REFEIÇÕES */}
      <div className="flex flex-col gap-3">
        {sortedMeals.map((meal) => (
          <div 
            key={meal.id}
            onClick={() => onSelectMeal(meal.name)}
            className="bg-[#0a0a0a] border border-zinc-800/60 rounded-[20px] p-3 flex items-center gap-3.5 cursor-pointer group hover:border-zinc-700/80 transition-colors"
          >
            {/* Foto do prato */}
            <div className="w-[74px] h-[74px] rounded-[16px] overflow-hidden shrink-0 bg-zinc-900 border border-zinc-800/80">
              <img 
                src={meal.image} 
                alt={meal.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Informações da refeição */}
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
              <div className="flex items-center gap-2">
                {getMealIcon(meal.iconType)}
                <h4 className="text-white font-bold text-[12.5px] tracking-wider uppercase truncate">
                  {meal.name}
                </h4>
              </div>

              <span className="text-zinc-500 text-[11px] font-normal leading-none">
                {meal.time}
              </span>

              {/* Macros da refeição */}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-orange-500 font-bold text-[12px] whitespace-nowrap">
                  {meal.calories} kcal
                </span>
                <span className="text-zinc-700 text-[10px]">|</span>
                <span className="text-zinc-400 text-[11px] whitespace-nowrap">
                  P {meal.protein}g
                </span>
                <span className="text-zinc-700 text-[10px]">|</span>
                <span className="text-zinc-400 text-[11px] whitespace-nowrap">
                  C {meal.carbs}g
                </span>
                <span className="text-zinc-700 text-[10px]">|</span>
                <span className="text-zinc-400 text-[11px] whitespace-nowrap">
                  G {meal.fat}g
                </span>
              </div>
            </div>

            {/* Seta laranja indicadora */}
            <ChevronRight className="w-4 h-4 text-orange-500 shrink-0 mr-1 transition-transform group-hover:translate-x-0.5" />
          </div>
        ))}
      </div>

      {/* 4. BOTÃO ADICIONAR REFEIÇÃO */}
      <button 
        onClick={() => setIsAddModalOpen(true)}
        className="w-full py-3.5 rounded-[18px] border border-dashed border-orange-500/30 flex items-center justify-center gap-2 text-orange-500 text-[13px] font-medium hover:bg-orange-500/5 transition-colors cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>Adicionar refeição</span>
      </button>

      {/* 5. BLOCO INFERIOR: NOTAS DO PT / NUTRICIONISTA (APENAS LEITURA) */}
      {activeNote && (
        <button
          type="button"
          onClick={() => setIsNotesModalOpen(true)}
          className="w-full mt-1 rounded-[20px] bg-[#0a0a0a] hover:bg-zinc-900/60 border border-zinc-800/80 hover:border-[#F77F00]/50 px-4 py-3.5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer group"
        >
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <FileText
              className="w-4 h-4 text-[#F77F00] shrink-0 mt-0.5"
              strokeWidth={2.2}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-white leading-tight">
                  Notas
                </span>
                <span className="text-[11px] text-zinc-500 truncate">
                  · {activeNote.author}
                </span>
                {activeNote.attachments && activeNote.attachments.length > 0 && (
                  <Paperclip
                    className="w-3 h-3 text-zinc-400 group-hover:text-[#F77F00] shrink-0 transition-colors"
                    strokeWidth={2}
                    aria-label="Contém anexo"
                  />
                )}
              </div>
              <p className="text-[11.5px] text-zinc-400 line-clamp-2 mt-1 leading-snug">
                {activeNote.message}
              </p>
            </div>
          </div>

          <ChevronRight className="w-4 h-4 text-[#F77F00] shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}
      </div>

      {/* MODAL ADICIONAR REFEIÇÃO */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-[24px] w-full max-w-[340px] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-white font-semibold text-[16px]">Adicionar Refeição</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMeal} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-zinc-400 text-[11px] font-medium">Nome da Refeição</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: CEIA"
                  value={newMealData.name}
                  onChange={e => setNewMealData({ ...newMealData, name: e.target.value })}
                  className="bg-black border border-zinc-800 rounded-[12px] px-3.5 py-2.5 text-white text-[13px] focus:outline-none focus:border-orange-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-1">
                  <label className="text-zinc-400 text-[11px] font-medium">Horário</label>
                  <input 
                    type="time"
                    required
                    value={newMealData.time}
                    onChange={e => setNewMealData({ ...newMealData, time: e.target.value })}
                    className="bg-black border border-zinc-800 rounded-[12px] px-3 py-2 text-white text-[12px] focus:outline-none focus:border-orange-500/50"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-zinc-400 text-[11px] font-medium">Calorias (kcal)</label>
                  <input 
                    type="number"
                    required
                    value={newMealData.calories}
                    onChange={e => setNewMealData({ ...newMealData, calories: e.target.value })}
                    className="bg-black border border-zinc-800 rounded-[12px] px-3 py-2 text-white text-[12px] focus:outline-none focus:border-orange-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-zinc-400 text-[10px]">Proteínas (g)</label>
                  <input 
                    type="number"
                    value={newMealData.protein}
                    onChange={e => setNewMealData({ ...newMealData, protein: e.target.value })}
                    className="bg-black border border-zinc-800 rounded-[10px] px-2.5 py-1.5 text-white text-[12px] focus:outline-none focus:border-orange-500/50"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-zinc-400 text-[10px]">Hidratos (g)</label>
                  <input 
                    type="number"
                    value={newMealData.carbs}
                    onChange={e => setNewMealData({ ...newMealData, carbs: e.target.value })}
                    className="bg-black border border-zinc-800 rounded-[10px] px-2.5 py-1.5 text-white text-[12px] focus:outline-none focus:border-orange-500/50"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-zinc-400 text-[10px]">Gorduras (g)</label>
                  <input 
                    type="number"
                    value={newMealData.fat}
                    onChange={e => setNewMealData({ ...newMealData, fat: e.target.value })}
                    className="bg-black border border-zinc-800 rounded-[10px] px-2.5 py-1.5 text-white text-[12px] focus:outline-none focus:border-orange-500/50"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="mt-2 w-full bg-orange-500 hover:bg-orange-600 text-white font-medium text-[13px] py-2.5 rounded-[12px] transition-colors cursor-pointer"
              >
                Adicionar Refeição
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SHEET DE LEITURA DAS NOTAS DO PT / NUTRICIONISTA */}
      {isNotesModalOpen &&
        activeNote &&
        createPortal(
          <div
            className="fixed sm:absolute inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
            onClick={() => setIsNotesModalOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111111] border border-zinc-800 rounded-t-[28px] sm:rounded-[24px] w-full max-w-[420px] max-h-[85dvh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200 overflow-hidden"
            >
              {/* Cabeçalho */}
              <div className="px-5 pt-4 pb-3 border-b border-zinc-800/80 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <FileText className="w-5 h-5 text-[#F77F00]" />
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Notas{planName ? ` · ${planName}` : ''}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setIsNotesModalOpen(false)}
                  aria-label="Fechar"
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mensagem do PT / Nutricionista (apenas leitura) */}
              <div className="p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] space-y-4 overflow-y-auto hide-scrollbar">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span className="font-semibold text-white">
                    {activeNote.author}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{activeNote.updatedAt}</span>
                </div>

                <div className="rounded-2xl bg-[#0a0a0a] border border-zinc-800/80 p-4">
                  <p className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap">
                    {activeNote.message}
                  </p>
                </div>

                {activeNote.attachments && activeNote.attachments.length > 0 && (
                  <div className="space-y-2">
                    {activeNote.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-3 px-3.5 py-3 rounded-2xl bg-[#0a0a0a] border border-zinc-800/80"
                      >
                        <Paperclip className="w-4 h-4 text-[#F77F00] shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-white truncate">
                            {att.name}
                          </p>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            {att.sizeLabel}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsNotesModalOpen(false)}
                  className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#F77F00] hover:bg-[#e57300] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>,
          document.querySelector('.app-device-wrapper') || document.body
        )}
      {/* MODAL LISTA DE COMPRAS */}
      <ShoppingListModal
        isOpen={isShoppingListOpen}
        onClose={() => setIsShoppingListOpen(false)}
        planName={planName}
        items={shoppingItems}
        daysMultiplier={shoppingDays}
        onChangeDaysMultiplier={setShoppingDays}
        onToggleItem={handleToggleShoppingItem}
        onAddCustomItem={handleAddCustomShoppingItem}
        onRemoveItem={handleRemoveShoppingItem}
        onResetChecked={handleResetCheckedShopping}
      />
    </>
  );
}
