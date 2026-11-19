/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BottomNav } from './components/BottomNav';
import { Home } from './pages/Home';
import { Treino } from './pages/Treino';
import { Dieta } from './pages/Dieta';
import { Agenda } from './pages/Agenda';
import { Evolucao } from './pages/Evolucao';
import { Perfil } from './pages/Perfil';
import { Notificacoes } from './pages/Notificacoes';
import { Comunidade } from './pages/Comunidade';
import { ProfileProvider, useProfile } from './context/ProfileContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { CommunityProvider, useCommunity } from './context/CommunityContext';
import { CardioProvider } from './context/CardioContext';
import { LogIn } from 'lucide-react';
import { useScrollToTop } from './utils/scrollToTop';

function MainApp() {
  const [activeTab, setActiveTab] = useState('home');
  const { isProfileOpen, closeProfile, isLoggedOut, reLogin, student, settings } = useProfile();
  const { isNotificationsOpen, closeNotifications } = useNotifications();
  const { isCommunityOpen, closeCommunity } = useCommunity();

  const isLight = settings.theme === 'light';

  useScrollToTop([activeTab, isProfileOpen, isNotificationsOpen, isCommunityOpen, isLoggedOut]);

  useEffect(() => {
    // Sync theme class to root
    if (isLight) {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }

    // Sync zoom scale to root font-size (50% to 120%)
    const zoomPct = settings.zoomPercent ?? (settings.textZoom === 'small' ? 90 : settings.textZoom === 'large' ? 110 : 100);
    document.documentElement.style.fontSize = `${(zoomPct / 100) * 16}px`;
  }, [isLight, settings.zoomPercent, settings.textZoom]);

  const handleTabChange = (tab: string) => {
    if (isProfileOpen) {
      closeProfile();
    }
    if (isNotificationsOpen) {
      closeNotifications();
    }
    if (isCommunityOpen) {
      closeCommunity();
    }
    setActiveTab(tab);
  };

  return (
    <div className={`h-[100dvh] sm:h-auto sm:min-h-screen w-full transition-colors duration-200 flex sm:items-center sm:justify-center font-sans antialiased overflow-hidden selection:bg-orange-500/30 ${
      isLight ? 'bg-slate-200' : 'bg-black'
    }`}>
      {/* Mobile Device Wrapper */}
      <div className={`w-full sm:max-w-[414px] h-[100dvh] sm:h-[896px] app-device-wrapper sm:rounded-[48px] overflow-hidden flex flex-col relative sm:border-[12px] [transform:translateZ(0)] transition-all duration-200 ${
        isLight
          ? 'light-theme bg-[#f8fafc] sm:border-slate-300 ring-1 ring-slate-300 shadow-[0_15px_50px_rgba(0,0,0,0.12)]'
          : 'bg-black sm:border-zinc-900 ring-1 ring-zinc-800 shadow-[0_0_60px_rgba(0,0,0,0.3)]'
      }`}>
        
        {/* Notch simulation (desktop only) */}
        <div className={`hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 rounded-b-3xl z-50 transition-colors ${
          isLight ? 'bg-slate-300' : 'bg-zinc-900'
        }`}></div>

        <div
          data-app-scroll-container="true"
          className={`flex-1 min-h-0 overflow-y-auto overscroll-y-contain hide-scrollbar relative scroll-smooth ${
          isNotificationsOpen || isCommunityOpen ? 'pb-0' : 'pb-4'
        }`}>
          {isLoggedOut ? (
            <div className="flex flex-col items-center justify-center min-h-[70vh] px-8 text-center animate-in fade-in zoom-in-95 duration-200">
              <img
                src="/assets/aistudio/9CF5FBD1-65BF-4557-BF19-1F1A5C3032B1_b4e3ad3d.PNG"
                alt="EVOLV"
                className="w-16 h-16 object-contain mb-4"
              />
              <h2 className="text-white text-xl font-bold tracking-tight mb-1">Sessão Terminada</h2>
              <p className="text-zinc-400 text-xs mb-6 max-w-[260px]">
                A tua sessão foi encerrada com segurança. Inicia sessão para acederes aos teus treinos e plano de nutrição.
              </p>
              <button
                onClick={reLogin}
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar como {student.name}</span>
              </button>
            </div>
          ) : isNotificationsOpen ? (
            <Notificacoes 
              onBack={closeNotifications} 
              onNavigateTab={(tab) => {
                closeNotifications();
                setActiveTab(tab);
              }}
            />
          ) : isCommunityOpen ? (
            <Comunidade onBack={closeCommunity} />
          ) : isProfileOpen ? (
            <Perfil onBack={closeProfile} />
          ) : (
            <>
              {activeTab === 'home' && <Home onGoToWorkout={() => setActiveTab('treino')} />}
              {activeTab === 'treino' && <Treino />}
              {activeTab === 'dieta' && <Dieta />}
              {activeTab === 'agenda' && <Agenda />}
              {activeTab === 'evolucao' && <Evolucao />}
            </>
          )}
        </div>

        {!isLoggedOut && !isNotificationsOpen && !isCommunityOpen && (
          <BottomNav 
            activeTab={isProfileOpen ? '' : activeTab} 
            setActiveTab={handleTabChange} 
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ProfileProvider>
      <NotificationProvider>
        <CommunityProvider>
          <CardioProvider>
            <MainApp />
          </CardioProvider>
        </CommunityProvider>
      </NotificationProvider>
    </ProfileProvider>
  );
}
