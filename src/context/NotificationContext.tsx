import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppNotification, ChatMessage, CoachInfo } from '../types';
import { mockNotifications, mockChatMessages, mockCoachInfo } from '../data';

interface SendMessagePayload {
  text?: string;
  imageUrl?: string;
  audioDurationSeconds?: number;
}

interface NotificationContextType {
  isNotificationsOpen: boolean;
  openNotifications: (tab?: 'geral' | 'coach') => void;
  closeNotifications: () => void;
  activeTab: 'geral' | 'coach';
  setActiveTab: (tab: 'geral' | 'coach') => void;
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  unreadCoachCount: number;
  totalUnreadCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllAsRead: () => void;
  chatMessages: ChatMessage[];
  coachInfo: CoachInfo;
  isCoachTyping: boolean;
  sendMessage: (payload: SendMessagePayload) => void;
  clearChat: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'geral' | 'coach'>('geral');

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

  // Chat Messages State with localStorage persistence
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

  const [isCoachTyping, setIsCoachTyping] = useState(false);
  const coachInfo = mockCoachInfo;

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('pr1me_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('pr1me_chat_messages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  // Let's have unread coach count = messages from coach with status !== 'read' if activeTab is not coach
  const unreadCoachCount = chatMessages.filter(m => m.sender === 'coach' && m.status !== 'read').length;
  const totalUnreadCount = unreadNotificationsCount + unreadCoachCount;

  const openNotifications = (tab: 'geral' | 'coach' = 'geral') => {
    setActiveTab(tab);
    setIsNotificationsOpen(true);
    if (tab === 'coach') {
      // Mark coach messages as read
      setChatMessages(prev => prev.map(m => m.sender === 'coach' ? { ...m, status: 'read' } : m));
    }
  };

  const closeNotifications = () => {
    setIsNotificationsOpen(false);
  };

  const handleSetActiveTab = (tab: 'geral' | 'coach') => {
    setActiveTab(tab);
    if (tab === 'coach') {
      setChatMessages(prev => prev.map(m => m.sender === 'coach' ? { ...m, status: 'read' } : m));
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(item => (item.id === id ? { ...item, read: true } : item))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(item => ({ ...item, read: true })));
  };

  const clearChat = () => {
    setChatMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'coach',
        text: 'Olá João! Conversa reiniciada. Se precisares de ajustar o treino, falar sobre a dieta ou tirar qualquer dúvida, estou por aqui!',
        timestamp: new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
        dateLabel: 'Hoje',
        createdAt: new Date().toISOString(),
        status: 'read',
      }
    ]);
  };

  const sendMessage = ({ text, imageUrl, audioDurationSeconds }: SendMessagePayload) => {
    const now = new Date();
    const timeStr = new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(now);
    const newId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

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

    setChatMessages(prev => [...prev, newMsg]);

    // Update status to 'sent' after 400ms, then 'delivered' after 900ms, 'read' after 1500ms
    setTimeout(() => {
      setChatMessages(prev => prev.map(m => m.id === newId ? { ...m, status: 'sent' } : m));
    }, 400);

    setTimeout(() => {
      setChatMessages(prev => prev.map(m => m.id === newId ? { ...m, status: 'delivered' } : m));
    }, 900);

    setTimeout(() => {
      setChatMessages(prev => prev.map(m => m.id === newId ? { ...m, status: 'read' } : m));
    }, 1500);

    // Simulate Coach typing and responding
    setTimeout(() => {
      setIsCoachTyping(true);

      setTimeout(() => {
        setIsCoachTyping(false);
        const replyNow = new Date();
        const replyTime = new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(replyNow);

        let coachText = 'Mensagem recebida, João! Continua o excelente foco e compromisso com o teu plano.';
        const lower = text?.toLowerCase() || '';

        if (imageUrl) {
          coachText = 'Boa foto! Dá para ver excelente alinhamento postural e definição. Continua com essa execução técnica exemplar!';
        } else if (audioDurationSeconds) {
          coachText = 'Ouvi a tua mensagem de voz! Foco total nisso que disseste. Se sentires qualquer desconforto na articulação, ajustamos a carga no próximo treino.';
        } else if (lower.includes('treino') || lower.includes('supino') || lower.includes('carga') || lower.includes('dor')) {
          coachText = 'Muito bem! Registei o teu feedback de treino. Mantém o foco no aquecimento dinâmico e na respiração ritmada.';
        } else if (lower.includes('dieta') || lower.includes('comida') || lower.includes('proteina') || lower.includes('agua')) {
          coachText = 'Certíssimo! A nutrição é 70% dos teus resultados. Mantém a ingestão de água acima dos 2.5L e não saltes a refeição pós-treino.';
        } else if (lower.includes('olá') || lower.includes('ola') || lower.includes('boas') || lower.includes('bom dia') || lower.includes('boa tarde')) {
          coachText = 'Viva João! Tudo a postos para os treinos desta semana? Como te sentes em termos de energia e recuperação muscular?';
        } else if (lower.includes('obrigado') || lower.includes('obg') || lower.includes('top') || lower.includes('forte')) {
          coachText = 'Sempre juntos na evolução! Estamos a caminho da melhor forma física de sempre. Conta comigo! 💪';
        }

        const coachReply: ChatMessage = {
          id: `coach-reply-${Date.now()}`,
          sender: 'coach',
          text: coachText,
          timestamp: replyTime,
          dateLabel: 'Hoje',
          createdAt: replyNow.toISOString(),
          status: 'read',
        };

        setChatMessages(prev => [...prev, coachReply]);
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
        notifications,
        unreadNotificationsCount,
        unreadCoachCount,
        totalUnreadCount,
        markNotificationAsRead,
        markAllAsRead,
        chatMessages,
        coachInfo,
        isCoachTyping,
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
