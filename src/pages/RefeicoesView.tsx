import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Flame, 
  Shield, 
  Droplet, 
  ChevronDown, 
  ChevronRight, 
  Coffee, 
  Utensils, 
  Apple, 
  Bell, 
  Plus, 
  Calendar, 
  FileText, 
  X,
  User
} from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { useNotifications } from '../context/NotificationContext';

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
}

export function RefeicoesView({ onBack, onSelectMeal, planName }: RefeicoesViewProps) {
  const { openProfile } = useProfile();
  const { openNotifications, totalUnreadCount } = useNotifications();
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
  const [isCheatMealModalOpen, setIsCheatMealModalOpen] = useState(false);
  const [notes, setNotes] = useState('');
  
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
        return <Coffee className="w-3.5 h-3.5 text-zinc-400" />;
      case 'lunch':
        return <Utensils className="w-3.5 h-3.5 text-zinc-400" />;
      case 'snack':
        return <Apple className="w-3.5 h-3.5 text-zinc-400" />;
      case 'dinner':
        return <Bell className="w-3.5 h-3.5 text-zinc-400" />;
      default:
        return <Utensils className="w-3.5 h-3.5 text-zinc-400" />;
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
    <div className="flex flex-col gap-4 px-5 pt-4 pb-12 animate-in fade-in zoom-in-95 duration-200">
      {/* HEADER SUPERIOR COM BOTÃO VOLTAR */}
      <div className="flex justify-between items-center mb-1">
        <button 
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
            onClick={openProfile}
            className="relative text-orange-500 transition-transform hover:scale-110 cursor-pointer" 
            aria-label="Perfil"
            title="Abrir Perfil"
          >
            <User className="w-[20px] h-[20px]" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* 1. PAINEL DE MACROS DIÁRIOS (IDÊNTICO À IMAGEM DE REFERÊNCIA) */}
      <div className="bg-[#0a0a0a] rounded-[22px] p-4 border border-zinc-800/60 shadow-lg">
        <div className="grid grid-cols-4 gap-2 text-center">
          {/* Calorias */}
          <div className="flex flex-col items-center gap-1.5">
            <Flame className="w-4 h-4 text-zinc-300" strokeWidth={1.8} />
            <span className="text-[11px] text-zinc-400 font-normal">Calorias</span>
            <div className="text-[11px] font-medium leading-tight">
              <span className="text-white font-bold text-[12px]">1.850</span>
              <span className="text-zinc-500 text-[10px]"> / 2.400 kcal</span>
            </div>
          </div>

          {/* Proteínas */}
          <div className="flex flex-col items-center gap-1.5">
            <Shield className="w-4 h-4 text-zinc-300" strokeWidth={1.8} />
            <span className="text-[11px] text-zinc-400 font-normal">Proteínas</span>
            <div className="text-[11px] font-medium leading-tight">
              <span className="text-white font-bold text-[12px]">130 g</span>
              <span className="text-zinc-500 text-[10px]"> / 160 g</span>
            </div>
          </div>

          {/* Hidratos */}
          <div className="flex flex-col items-center gap-1.5">
            <Droplet className="w-4 h-4 text-zinc-300" strokeWidth={1.8} />
            <span className="text-[11px] text-zinc-400 font-normal">Hidratos</span>
            <div className="text-[11px] font-medium leading-tight">
              <span className="text-white font-bold text-[12px]">200 g</span>
              <span className="text-zinc-500 text-[10px]"> / 260 g</span>
            </div>
          </div>

          {/* Gorduras */}
          <div className="flex flex-col items-center gap-1.5">
            <Droplet className="w-4 h-4 text-zinc-300" strokeWidth={1.8} />
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

      {/* 5. BLOCOS INFERIORES: REFEIÇÃO LIVRE & NOTAS */}
      <div className="grid grid-cols-2 gap-3 mt-1">
        {/* Bloco Refeição Livre */}
        <div 
          onClick={() => setIsCheatMealModalOpen(true)}
          className="bg-[#0a0a0a] border border-zinc-800/60 rounded-[20px] p-3 flex items-center gap-2.5 cursor-pointer group hover:border-zinc-700/80 transition-colors"
        >
          <div className="w-12 h-12 rounded-[14px] overflow-hidden shrink-0 bg-zinc-900 border border-zinc-800/60">
            <img 
              src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=300&auto=format&fit=crop" 
              alt="Refeição livre" 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-white font-semibold text-[11px] leading-tight truncate">Refeição livre</span>
              <span className="bg-orange-500/10 text-orange-400 border border-orange-500/30 text-[8px] font-medium px-1 rounded-full whitespace-nowrap">
                1x por semana
              </span>
            </div>

            <div className="flex items-center gap-1 text-zinc-400 text-[9px]">
              <Calendar className="w-2.5 h-2.5 text-zinc-500 shrink-0" />
              <span className="truncate">Planeada p/ sábado</span>
            </div>

            <div className="flex items-center gap-1 text-zinc-400 text-[9px]">
              <Flame className="w-2.5 h-2.5 text-orange-500 shrink-0" />
              <span>1.500 kcal</span>
            </div>
          </div>

          <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0 group-hover:text-orange-500 transition-colors" />
        </div>

        {/* Bloco Notas */}
        <div 
          onClick={() => setIsNotesModalOpen(true)}
          className="bg-[#0a0a0a] border border-zinc-800/60 rounded-[20px] p-3 flex items-center justify-between cursor-pointer group hover:border-zinc-700/80 transition-colors"
        >
          <div className="flex flex-col justify-center gap-1.5 min-w-0">
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-white font-semibold text-[12px]">Notas</span>
            </div>
            <span className="text-zinc-500 text-[10px] truncate">
              {notes ? notes : 'Sem notas adicionadas'}
            </span>
          </div>

          <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0 group-hover:text-orange-500 transition-colors ml-1" />
        </div>
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

      {/* MODAL NOTAS */}
      {isNotesModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-[24px] w-full max-w-[340px] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-orange-500" />
                <h3 className="text-white font-semibold text-[16px]">Notas da Dieta</h3>
              </div>
              <button onClick={() => setIsNotesModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-zinc-400 text-[12px] mb-3">
              Indicações do nutricionista ou lembretes pessoais:
            </p>

            <textarea 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ex: Beber 3L de água por dia. Suplementar creatina após o treino..."
              rows={4}
              className="w-full bg-black border border-zinc-800 rounded-[12px] p-3 text-white text-[13px] focus:outline-none focus:border-orange-500/50 resize-none mb-4"
            />

            <button 
              onClick={() => setIsNotesModalOpen(false)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium text-[13px] py-2.5 rounded-[12px] transition-colors cursor-pointer"
            >
              Guardar Notas
            </button>
          </div>
        </div>
      )}

      {/* MODAL REFEIÇÃO LIVRE */}
      {isCheatMealModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-[24px] w-full max-w-[340px] p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3 border-2 border-orange-500/40">
              <img 
                src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=300&auto=format&fit=crop" 
                alt="Burger" 
                className="w-full h-full object-cover"
              />
            </div>

            <h3 className="text-white font-bold text-[16px] mb-1">Refeição Livre</h3>
            <span className="inline-block bg-orange-500/10 text-orange-400 border border-orange-500/30 text-[10px] font-medium px-2 py-0.5 rounded-full mb-3">
              1x por semana autorizada
            </span>

            <div className="bg-black/60 rounded-[14px] p-3 border border-zinc-800/60 text-left mb-4 flex flex-col gap-2">
              <div className="flex justify-between items-center text-[12px]">
                <span className="text-zinc-400">Dia planeado:</span>
                <span className="text-white font-semibold">Sábado à noite</span>
              </div>
              <div className="flex justify-between items-center text-[12px]">
                <span className="text-zinc-400">Limite calórico aprox:</span>
                <span className="text-orange-500 font-semibold">1.500 kcal</span>
              </div>
              <div className="flex justify-between items-center text-[12px]">
                <span className="text-zinc-400">Dica do coach:</span>
                <span className="text-zinc-300">Aproveita sem culpa e hidrata-te bem!</span>
              </div>
            </div>

            <button 
              onClick={() => setIsCheatMealModalOpen(false)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium text-[13px] py-2.5 rounded-[12px] transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
