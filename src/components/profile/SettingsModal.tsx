import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  Calendar, 
  Globe, 
  Settings as SettingsIcon,
  ZoomIn,
  Scale,
  Compass,
  Sparkles,
  RotateCcw
} from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, updateSettings } = useProfile();
  const [langNotice, setLangNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const isLightMode = settings.theme === 'light';
  const currentZoom = settings.zoomPercent ?? 100;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    updateSettings({ zoomPercent: val });
  };

  const handleSelectLanguage = (lang: 'PT' | 'EN' | 'ES') => {
    updateSettings({ language: lang });
    if (lang !== 'PT') {
      setLangNotice(
        lang === 'EN' 
          ? 'Interface configurada para Inglês (EN).' 
          : 'Interface configurada para Espanhol (ES).'
      );
      setTimeout(() => setLangNotice(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#111111] border border-zinc-800 rounded-t-[28px] sm:rounded-[24px] w-full max-w-[420px] p-5 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[92vh] overflow-y-auto hide-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-3.5 sticky top-0 bg-[#111111] z-10">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-orange-500" />
            <h3 className="text-white text-base font-bold">Definições da Aplicação</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800/60 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          
          {/* 1. APARÊNCIA */}
          <div>
            <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mb-2 px-1">
              Aparência & Interface
            </p>
            <div className="bg-[#0a0a0a] rounded-2xl p-3.5 border border-zinc-800/70 space-y-3.5">
              
              {/* MODO CLARO / ESCURO */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={isLightMode ? "/sun.png" : "/moon.png"}
                    alt={isLightMode ? "Modo Claro" : "Modo Escuro"}
                    className="w-5 h-5 object-contain shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex flex-col">
                    <span className="text-white text-xs font-semibold leading-tight">Tema Visual</span>
                    <span className="text-zinc-500 text-[10px] leading-tight mt-0.5">
                      {isLightMode ? 'Modo Claro ativo' : 'Modo Escuro ativo'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className={`text-[11px] font-bold tracking-wide uppercase transition-colors ${
                    isLightMode ? 'text-amber-500' : 'text-zinc-400'
                  }`}>
                    {isLightMode ? 'Claro' : 'Escuro'}
                  </span>

                  <label className="theme-switch" htmlFor="theme-toggle" title={isLightMode ? "Mudar para modo escuro" : "Mudar para modo claro"}>
                    <input
                      type="checkbox"
                      id="theme-toggle"
                      checked={!isLightMode}
                      onChange={() => updateSettings({ theme: isLightMode ? 'dark' : 'light' })}
                      aria-label="Alternar modo claro e escuro"
                    />
                    <span className="theme-slider">
                      <img
                        src="/sun.png"
                        alt="Modo Claro"
                        className="theme-icon theme-icon-sun"
                        referrerPolicy="no-referrer"
                      />
                      <img
                        src="/moon.png"
                        alt="Modo Escuro"
                        className="theme-icon theme-icon-moon"
                        referrerPolicy="no-referrer"
                      />
                    </span>
                  </label>
                </div>
              </div>

              {/* IDIOMA: PT, EN, ES */}
              <div className="pt-3 border-t border-zinc-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-4 h-4 text-orange-500 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-white text-xs font-semibold leading-tight">Idioma</span>
                      <span className="text-zinc-500 text-[10px] leading-tight mt-0.5">Língua do sistema</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-xl border border-zinc-800">
                    {(['PT', 'EN', 'ES'] as const).map(lang => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => handleSelectLanguage(lang)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                          settings.language === lang
                            ? 'bg-orange-500 text-white shadow-sm'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                {langNotice && (
                  <div className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 text-[10px] animate-in fade-in duration-200">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>{langNotice}</span>
                  </div>
                )}
              </div>

              {/* SLIDER DE ZOOM DA INTERFACE (50% a 120%) COM PERCENTAGEM E PREVIEW AO VIVO */}
              <div className="pt-3 border-t border-zinc-800/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <ZoomIn className="w-4 h-4 text-orange-500 shrink-0" />
                    <div>
                      <span className="text-white text-xs font-semibold leading-tight block">
                        Zoom da Interface
                      </span>
                      <span className="text-zinc-500 text-[10px] leading-tight">
                        Escala geral de texto e cartões
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-orange-500/15 border border-orange-500/30 text-orange-400 font-mono text-xs font-black">
                      {currentZoom}%
                    </span>
                    {currentZoom !== 100 && (
                      <button
                        type="button"
                        onClick={() => updateSettings({ zoomPercent: 100 })}
                        className="p-1 rounded-md text-zinc-500 hover:text-orange-400 transition-colors cursor-pointer"
                        title="Repor 100%"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Slider bar */}
                <div className="px-1 pt-1">
                  <input
                    type="range"
                    min={50}
                    max={120}
                    step={5}
                    value={currentZoom}
                    onChange={handleSliderChange}
                    className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    aria-label="Zoom da interface de 50% a 120%"
                  />
                  <div className="flex justify-between text-[9px] text-zinc-500 font-medium px-0.5 mt-1.5">
                    <span 
                      onClick={() => updateSettings({ zoomPercent: 50 })}
                      className="cursor-pointer hover:text-zinc-300"
                    >
                      50% (Mín)
                    </span>
                    <span 
                      onClick={() => updateSettings({ zoomPercent: 100 })}
                      className={`cursor-pointer ${currentZoom === 100 ? 'text-orange-500 font-bold' : 'hover:text-zinc-300'}`}
                    >
                      100% (Padrão)
                    </span>
                    <span 
                      onClick={() => updateSettings({ zoomPercent: 120 })}
                      className="cursor-pointer hover:text-zinc-300"
                    >
                      120% (Máx)
                    </span>
                  </div>
                </div>

                {/* Live Preview Box */}
                <div className="mt-2.5 p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80">
                  <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider block mb-1">
                    Pré-visualização em tempo real
                  </span>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white font-medium">RTEAM Treino A • Supino Reto</span>
                    <span className="text-orange-400 font-bold">4 x 80 kg</span>
                  </div>
                  <p className="text-zinc-400 text-[11px] mt-0.5 truncate">
                    Ajuste suave aplicado a toda a tipografia e elementos visuais da app.
                  </p>
                </div>

              </div>

            </div>
          </div>

          {/* 2. UNIDADES DE MEDIDA */}
          <div>
            <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mb-2 px-1">
              Unidades de Medida
            </p>
            <div className="bg-[#0a0a0a] rounded-2xl p-3.5 border border-zinc-800/70 space-y-3">
              
              {/* CARGA: KG / LBS */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Scale className="w-4 h-4 text-orange-500 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-white text-xs font-semibold leading-tight">Carga / Peso</span>
                    <span className="text-zinc-500 text-[10px] leading-tight mt-0.5">
                      Unidade de pesagem e halteres
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-xl border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => updateSettings({ weightUnit: 'Kg' })}
                    className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      settings.weightUnit === 'Kg'
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Kg
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSettings({ weightUnit: 'Lbs' })}
                    className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      settings.weightUnit === 'Lbs'
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Lbs
                  </button>
                </div>
              </div>

              {/* DISTÂNCIA: KM / MI */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
                <div className="flex items-center gap-2.5">
                  <Compass className="w-4 h-4 text-orange-500 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-white text-xs font-semibold leading-tight">Distância</span>
                    <span className="text-zinc-500 text-[10px] leading-tight mt-0.5">
                      Cardio, passadeira e corrida
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-xl border border-zinc-800">
                  <button
                    type="button"
                    onClick={() => updateSettings({ distanceUnit: 'Km' })}
                    className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      settings.distanceUnit === 'Km'
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Km
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSettings({ distanceUnit: 'Mi' })}
                    className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      settings.distanceUnit === 'Mi'
                        ? 'bg-orange-500 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Mi
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* 3. NOTIFICAÇÕES E ALERTAS */}
          <div>
            <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mb-2 px-1">
              Notificações
            </p>
            <div className="bg-[#0a0a0a] rounded-2xl p-3.5 border border-zinc-800/70 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Bell className="w-4 h-4 text-orange-500 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-white text-xs font-semibold leading-tight">Notificações Push</span>
                    <span className="text-zinc-500 text-[10px] leading-tight mt-0.5">Avisos de novas metas e planos</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updateSettings({ pushNotifications: !settings.pushNotifications })}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    settings.pushNotifications ? 'bg-orange-500' : 'bg-zinc-800'
                  }`}
                  aria-label="Alternar Notificações Push"
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-orange-500 shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-white text-xs font-semibold leading-tight">Lembretes de Treino</span>
                    <span className="text-zinc-500 text-[10px] leading-tight mt-0.5">Alerta 1h antes do treino planeado</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => updateSettings({ workoutReminders: !settings.workoutReminders })}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    settings.workoutReminders ? 'bg-orange-500' : 'bg-zinc-800'
                  }`}
                  aria-label="Alternar Lembretes de Treino"
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      settings.workoutReminders ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Action Button */}
        <div className="pt-4 mt-4 border-t border-zinc-800/80">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors shadow-lg shadow-orange-500/20 cursor-pointer"
          >
            Guardar & Concluir
          </button>
        </div>
      </div>
    </div>
  );
}
