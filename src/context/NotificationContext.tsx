import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppNotification, ChatMessage, ChatSpecialist, CoachInfo } from '../types';
import {
  mockNotifications,
  mockChatMessages,
  mockCoachInfo,
  mockNutritionistInfo,
  mockNutritionistMessages,
} from '../data';

interface SendMessagePayload {
  text?: string;
  imageUrl?: string;
  audioDurationSeconds?: number;
}

interface NotificationContextType {
  isNotificationsOpen: boolean;
  openNotifications: (tab?: 'geral' | 'coach', specialist?: ChatSpecialist) => void;
  closeNotifications: () => void;
  activeTab: 'geral' | 'coach';
  setActiveTab: (tab: 'geral' | 'coach') => void;
  activeChatSpecialist: ChatSpecialist;
  setActiveChatSpecialist: (specialist: ChatSpecialist) => void;
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  unreadCoachCount: number;
  unreadNutritionistCount: number;
  unreadChatCount: number;
  totalUnreadCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllAsRead: () => void;
  chatMessages: ChatMessage[];
  nutritionistMessages: ChatMessage[];
  coachInfo: CoachInfo;
  nutritionistInfo: CoachInfo;
  isCoachTyping: boolean;
  isNutritionistTyping: boolean;
  sendMessage: (payload: SendMessagePayload, specialist?: ChatSpecialist) => void;
  clearChat: (specialist?: ChatSpecialist) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'geral' | 'coach'>('geral');
  const [activeChatSpecialist, setActiveChatSpecialistState] = useState<ChatSpecialist>('coach');

  // Notifications State with localStorage persistence
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('pr1me_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return mockNotifications;
      }
    }
    return mockNotifications;
  });

  // Coach Chat Messages State with localStorage persistence
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('pr1me_chat_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return mockChatMessages;
      }
    }
    return mockChatMessages;
  });

  // Nutritionist Chat Messages State with localStorage persistence
  const [nutritionistMessages, setNutritionistMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('evolv_nutritionist_chat_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return mockNutritionistMessages;
      }
    }
    return mockNutritionistMessages;
  });

  const [isCoachTyping, setIsCoachTyping] = useState(false);
  const [isNutritionistTyping, setIsNutritionistTyping] = useState(false);
  const coachInfo = mockCoachInfo;
  const nutritionistInfo = mockNutritionistInfo;

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('pr1me_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('pr1me_chat_messages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem('evolv_nutritionist_chat_messages', JSON.stringify(nutritionistMessages));
  }, [nutritionistMessages]);

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  const unreadCoachCount = chatMessages.filter(m => m.sender === 'coach' && m.status !== 'read').length;
  const unreadNutritionistCount = nutritionistMessages.filter(m => m.sender === 'coach' && m.status !== 'read').length;
  const unreadChatCount = unreadCoachCount + unreadNutritionistCount;
  const totalUnreadCount = unreadNotificationsCount + unreadChatCount;

  const markSpecialistRead = (specialist: ChatSpecialist) => {
    if (specialist === 'coach') {
      setChatMessages(prev => prev.map(m => m.sender === 'coach' ? { ...m, status: 'read' } : m));
    } else {
      setNutritionistMessages(prev => prev.map(m => m.sender === 'coach' ? { ...m, status: 'read' } : m));
    }
  };

  const openNotifications = (tab: 'geral' | 'coach' = 'geral', specialist?: ChatSpecialist) => {
    const targetSpecialist = specialist ?? activeChatSpecialist;
    if (specialist) {
      setActiveChatSpecialistState(specialist);
    }
    setActiveTab(tab);
    setIsNotificationsOpen(true);
    if (tab === 'coach') {
      markSpecialistRead(targetSpecialist);
    }
  };

  const closeNotifications = () => {
    setIsNotificationsOpen(false);
  };

  const handleSetActiveTab = (tab: 'geral' | 'coach') => {
    setActiveTab(tab);
    if (tab === 'coach') {
      markSpecialistRead(activeChatSpecialist);
    }
  };

  const setActiveChatSpecialist = (specialist: ChatSpecialist) => {
    setActiveChatSpecialistState(specialist);
    markSpecialistRead(specialist);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(item => (item.id === id ? { ...item, read: true } : item))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(item => ({ ...item, read: true })));
  };

  const clearChat = (specialist: ChatSpecialist = activeChatSpecialist) => {
    const timestamp = new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(new Date());
    if (specialist === 'nutritionist') {
      setNutritionistMessages([
        {
          id: `nutri-${Date.now()}`,
          sender: 'coach',
          text: 'Olá João! Conversa reiniciada. Sempre que quiseres rever o plano alimentar, trocar alimentos ou tirar dúvidas sobre macronutrientes, fala comigo por aqui!',
          timestamp,
          dateLabel: 'Hoje',
          createdAt: new Date().toISOString(),
          status: 'read',
        },
      ]);
      return;
    }

    setChatMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'coach',
        text: 'Olá João! Conversa reiniciada. Se precisares de ajustar o treino, rever a técnica de algum exercício ou tirar qualquer dúvida, estou por aqui!',
        timestamp,
        dateLabel: 'Hoje',
        createdAt: new Date().toISOString(),
        status: 'read',
      },
    ]);
  };

  const sendMessage = (
    { text, imageUrl, audioDurationSeconds }: SendMessagePayload,
    specialist: ChatSpecialist = activeChatSpecialist
  ) => {
    const now = new Date();
    const timeStr = new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(now);
    const newId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const setTargetMessages =
      specialist === 'nutritionist' ? setNutritionistMessages : setChatMessages;
    const setTargetTyping =
      specialist === 'nutritionist' ? setIsNutritionistTyping : setIsCoachTyping;

    const newMsg: ChatMessage = {
      id: newId,
      sender: 'student',
      text: text?.trim(),
      imageUrl,
      audioDurationSeconds,
      timestamp: timeStr,
      dateLabel: 'Hoje',
      createdAt: now.toISOString(),
      status: 'sending',
    };

    setTargetMessages(prev => [...prev, newMsg]);

    // Update status to 'sent' after 400ms, then 'delivered' after 900ms, 'read' after 1500ms
    setTimeout(() => {
      setTargetMessages(prev => prev.map(m => m.id === newId ? { ...m, status: 'sent' } : m));
    }, 400);

    setTimeout(() => {
      setTargetMessages(prev => prev.map(m => m.id === newId ? { ...m, status: 'delivered' } : m));
    }, 900);

    setTimeout(() => {
      setTargetMessages(prev => prev.map(m => m.id === newId ? { ...m, status: 'read' } : m));
    }, 1500);

    // Simulate specialist typing and responding
    setTimeout(() => {
      setTargetTyping(true);

      setTimeout(() => {
        setTargetTyping(false);
        const replyNow = new Date();
        const replyTime = new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(replyNow);
        const lower = text?.toLowerCase() || '';

        let replyText = '';

        if (specialist === 'nutritionist') {
          replyText = 'Mensagem recebida, João! Vou analisar e ajustar no teu acompanhamento nutricional sempre que necessário.';
          if (imageUrl) {
            replyText = 'Excelente aspeto da refeição! O equilíbrio entre proteína, hidratos complexos e legumes está no ponto certo para o teu objetivo.';
          } else if (audioDurationSeconds) {
            replyText = 'Ouvi o teu áudio! Faz todo o sentido ajustar esse horário das refeições à tua rotina. Vamos manter a consistência nos macros diários.';
          } else if (lower.includes('trocar') || lower.includes('substitu') || lower.includes('arroz') || lower.includes('batata') || lower.includes('massa')) {
            replyText = 'Podes fazer essa substituição sem problema! Na secção Dieta também tens equivalências exatas em gramas para manteres as calorias alinhadas.';
          } else if (lower.includes('proteina') || lower.includes('proteína') || lower.includes('whey') || lower.includes('creatina') || lower.includes('suplemento')) {
            replyText = 'Ótima pergunta! Mantém a ingestão de proteína distribuída ao longo do dia e a creatina (5g/dia) de forma consistente, mesmo nos dias de descanso.';
          } else if (lower.includes('fome') || lower.includes('saciedade') || lower.includes('doce') || lower.includes('jantar')) {
            replyText = 'Para ajudar na saciedade, reforça os vegetais fibrosos e a hidratação antes das refeições principais. Se precisares, ajustamos o lanche da tarde!';
          } else if (lower.includes('olá') || lower.includes('ola') || lower.includes('boas') || lower.includes('bom dia') || lower.includes('boa tarde')) {
            replyText = 'Olá João! Como tem estado a adesão ao plano alimentar esta semana? Alguma refeição que queiras ajustar?';
          } else if (lower.includes('obrigado') || lower.includes('obg') || lower.includes('top') || lower.includes('perfeito')) {
            replyText = 'De nada, João! Excelente consistência — qualquer dúvida alimentar estou sempre por aqui.';
          }
        } else {
          replyText = 'Mensagem recebida, João! Continua o excelente foco e compromisso com o teu plano.';
          if (imageUrl) {
            replyText = 'Boa foto! Dá para ver excelente alinhamento postural e definição. Continua com essa execução técnica exemplar!';
          } else if (audioDurationSeconds) {
            replyText = 'Ouvi a tua mensagem de voz! Foco total nisso que disseste. Se sentires qualquer desconforto na articulação, ajustamos a carga no próximo treino.';
          } else if (lower.includes('treino') || lower.includes('supino') || lower.includes('carga') || lower.includes('dor')) {
            replyText = 'Muito bem! Registei o teu feedback de treino. Mantém o foco no aquecimento dinâmico e na respiração ritmada.';
          } else if (lower.includes('dieta') || lower.includes('comida') || lower.includes('proteina') || lower.includes('agua')) {
            replyText = 'Boa observação! Para ajustes mais finos de macronutrientes podes falar diretamente com a Dra. Inês aqui na tab Nutricionista — trabalhamos sempre alinhados.';
          } else if (lower.includes('olá') || lower.includes('ola') || lower.includes('boas') || lower.includes('bom dia') || lower.includes('boa tarde')) {
            replyText = 'Viva João! Tudo a postos para os treinos desta semana? Como te sentes em termos de energia e recuperação muscular?';
          } else if (lower.includes('obrigado') || lower.includes('obg') || lower.includes('top') || lower.includes('forte')) {
            replyText = 'Sempre juntos na evolução! Estamos a caminho da melhor forma física de sempre. Conta comigo! 💪';
          }
        }

        const specialistReply: ChatMessage = {
          id: `${specialist}-reply-${Date.now()}`,
          sender: 'coach',
          text: replyText,
          timestamp: replyTime,
          dateLabel: 'Hoje',
          createdAt: replyNow.toISOString(),
          status: 'read',
        };

        setTargetMessages(prev => [...prev, specialistReply]);
      }, 2000);
    }, 1800);
  };

  return (
    <NotificationContext.Provider
      value={{
        isNotificationsOpen,
        openNotifications,
        closeNotifications,
        activeTab,
        setActiveTab: handleSetActiveTab,
        activeChatSpecialist,
        setActiveChatSpecialist,
        notifications,
        unreadNotificationsCount,
        unreadCoachCount,
        unreadNutritionistCount,
        unreadChatCount,
        totalUnreadCount,
        markNotificationAsRead,
        markAllAsRead,
        chatMessages,
        nutritionistMessages,
        coachInfo,
        nutritionistInfo,
        isCoachTyping,
        isNutritionistTyping,
        sendMessage,
        clearChat,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
