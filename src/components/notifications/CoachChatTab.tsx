import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Camera, 
  Mic, 
  MoreVertical, 
  Phone, 
  Check, 
  CheckCheck, 
  Clock, 
  Play, 
  Pause, 
  Trash2, 
  Info,
  X,
  Volume2,
  Dumbbell,
  Utensils,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { ChatMessage, ChatSpecialist } from '../../types';

export function CoachChatTab() {
  const { 
    activeChatSpecialist,
    setActiveChatSpecialist,
    chatMessages,
    nutritionistMessages,
    coachInfo,
    nutritionistInfo,
    isCoachTyping,
    isNutritionistTyping,
    unreadCoachCount,
    unreadNutritionistCount,
    sendMessage, 
    clearChat,
  } = useNotifications();

  const isNutritionist = activeChatSpecialist === 'nutritionist';
  const activeMessages = isNutritionist ? nutritionistMessages : chatMessages;
  const activeSpecialist = isNutritionist ? nutritionistInfo : coachInfo;
  const isActiveTyping = isNutritionist ? isNutritionistTyping : isCoachTyping;

  const [inputText, setInputText] = useState('');
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showSpecialistInfoModal, setShowSpecialistInfoModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  
  // Voice recording state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<number | null>(null);

  // Audio playback state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll to bottom on mount, specialist switch, and when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages, isActiveTyping, activeChatSpecialist]);

  // Voice recording timer
  useEffect(() => {
    if (isRecordingVoice) {
      setRecordingSeconds(0);
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecordingVoice]);

  const handleSelectSpecialist = (specialist: ChatSpecialist) => {
    setShowOptionsMenu(false);
    setPlayingAudioId(null);
    setIsRecordingVoice(false);
    setActiveChatSpecialist(specialist);
  };

  // Handle Send text
  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage({ text: inputText }, activeChatSpecialist);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Handle Voice send
  const handleSendVoice = () => {
    const duration = Math.max(2, recordingSeconds);
    setIsRecordingVoice(false);
    sendMessage({ audioDurationSeconds: duration }, activeChatSpecialist);
  };

  const handleCancelVoice = () => {
    setIsRecordingVoice(false);
  };

  // Handle image upload from file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          sendMessage(
            {
              imageUrl: reader.result,
              text: isNutritionist
                ? 'Enviei uma foto da minha refeição para análise nutricional.'
                : 'Enviei uma foto do treino para análise técnica.',
            },
            activeChatSpecialist
          );
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  // Sample quick camera photos
  const handleSendPresetPhoto = (url: string, caption: string) => {
    setShowCameraModal(false);
    sendMessage({ imageUrl: url, text: caption }, activeChatSpecialist);
  };

  // Group messages by dateLabel
  const groupedMessages: { [date: string]: ChatMessage[] } = {};
  activeMessages.forEach(msg => {
    const date = msg.dateLabel || 'Hoje';
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(msg);
  });

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full relative overflow-hidden">
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Specialist Switcher Tabs: Treinador vs Nutricionista */}
      <div className="grid grid-cols-2 bg-[#0a0a0a] border-b border-zinc-800/80 shrink-0 z-20">
        <button
          type="button"
          onClick={() => handleSelectSpecialist('coach')}
          className={`relative py-2.5 px-3 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
            !isNutritionist
              ? 'text-[#F77F00]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Dumbbell className="w-3.5 h-3.5 shrink-0" />
          <span>Treinador</span>
          {unreadCoachCount > 0 && (
            <span
              style={{ color: '#ffffff' }}
              className="text-[9px] min-w-[16px] h-4 px-1 rounded-full bg-[#F77F00] font-bold inline-flex items-center justify-center"
            >
              {unreadCoachCount}
            </span>
          )}
          {!isNutritionist && (
            <span className="absolute bottom-0 inset-x-6 h-[2px] rounded-full bg-[#F77F00]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => handleSelectSpecialist('nutritionist')}
          className={`relative py-2.5 px-3 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
            isNutritionist
              ? 'text-[#F77F00]'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Utensils className="w-3.5 h-3.5 shrink-0" />
          <span>Nutricionista</span>
          {unreadNutritionistCount > 0 && (
            <span
              style={{ color: '#ffffff' }}
              className="text-[9px] min-w-[16px] h-4 px-1 rounded-full bg-[#F77F00] font-bold inline-flex items-center justify-center"
            >
              {unreadNutritionistCount}
            </span>
          )}
          {isNutritionist && (
            <span className="absolute bottom-0 inset-x-6 h-[2px] rounded-full bg-[#F77F00]" />
          )}
        </button>
      </div>

      {/* Specialist Info Bar */}
      <div className="px-5 py-2.5 bg-[#0d0d0d] border-b border-zinc-800/80 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative cursor-pointer shrink-0" onClick={() => setShowSpecialistInfoModal(true)}>
            <img
              src={activeSpecialist.avatarUrl}
              alt={activeSpecialist.name}
              className="w-9 h-9 rounded-full object-cover border-2 border-orange-500/40"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-black" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-white text-xs font-bold leading-tight truncate">
                {activeSpecialist.name}
              </h3>
              <span className="text-[9px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-1.5 py-0.5 rounded font-semibold shrink-0">
                {isNutritionist ? 'NUTRI' : 'PT'}
              </span>
            </div>
            <p className="text-emerald-400 text-[10px] leading-tight flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{activeSpecialist.status}</span>
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 relative shrink-0">
          <button
            type="button"
            onClick={() => setShowCallModal(true)}
            className="p-2 rounded-xl text-zinc-400 hover:text-orange-500 hover:bg-zinc-800/60 transition-colors cursor-pointer"
            title={isNutritionist ? 'Ligar à Nutricionista' : 'Ligar ao Treinador'}
            aria-label={isNutritionist ? 'Ligar à Nutricionista' : 'Ligar ao Treinador'}
          >
            <Phone className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
            title="Mais Opções"
            aria-label="Mais Opções"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Options Dropdown Menu */}
          {showOptionsMenu && (
            <div className="absolute right-0 top-10 w-52 bg-[#181818] border border-zinc-800 rounded-xl shadow-xl z-30 py-1 animate-in fade-in zoom-in-95 duration-150">
              <button
                type="button"
                onClick={() => {
                  setShowOptionsMenu(false);
                  setShowSpecialistInfoModal(true);
                }}
                className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800/70 hover:text-white flex items-center gap-2 cursor-pointer"
              >
                <Info className="w-3.5 h-3.5 text-zinc-400" />
                <span>{isNutritionist ? 'Perfil da Nutricionista' : 'Perfil do Treinador'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowOptionsMenu(false);
                  setShowCallModal(true);
                }}
                className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800/70 hover:text-white flex items-center gap-2 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-zinc-400" />
                <span>Iniciar Chamada</span>
              </button>
              <div className="border-t border-zinc-800 my-1" />
              <button
                type="button"
                onClick={() => {
                  setShowOptionsMenu(false);
                  clearChat(activeChatSpecialist);
                }}
                className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
                <span>Limpar Conversa</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        key={activeChatSpecialist}
        className="flex-1 min-h-0 px-4 py-3 space-y-4 overflow-y-auto overscroll-y-contain hide-scrollbar animate-in fade-in duration-150"
      >
        {/* End-to-end encryption note */}
        <div className="flex items-center justify-center gap-1.5 py-1">
          <span className="text-[10px] text-zinc-500 bg-[#111111] border border-zinc-800/80 px-2.5 py-1 rounded-full text-center">
            {isNutritionist
              ? '🔒 Canal privado e seguro com a tua Nutricionista'
              : '🔒 Canal privado e seguro com o teu Personal Trainer'}
          </span>
        </div>

        {Object.entries(groupedMessages).map(([dateLabel, msgs]) => (
          <div key={dateLabel} className="space-y-3">
            {/* Date Separator */}
            <div className="flex items-center justify-center my-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 bg-[#141414] border border-zinc-800 px-3 py-0.5 rounded-full">
                {dateLabel}
              </span>
            </div>

            {/* Messages in this group */}
            {msgs.map(message => {
              const isStudent = message.sender === 'student';

              return (
                <div
                  key={message.id}
                  className={`flex items-end gap-2 ${
                    isStudent ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {/* Specialist Avatar */}
                  {!isStudent && (
                    <img
                      src={activeSpecialist.avatarUrl}
                      alt={activeSpecialist.name}
                      className="w-7 h-7 rounded-full object-cover shrink-0 mb-0.5 border border-zinc-800"
                      referrerPolicy="no-referrer"
                    />
                  )}

                  {/* Message Bubble Container */}
                  <div
                    className={`max-w-[80%] rounded-2xl p-3 shadow-md relative ${
                      isStudent
                        ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-br-xs font-normal'
                        : 'bg-[#181818] border border-zinc-800/80 text-white rounded-bl-xs'
                    }`}
                  >
                    {/* Sender name for specialist */}
                    {!isStudent && (
                      <span className="text-[10px] font-bold text-orange-400 block mb-1">
                        {activeSpecialist.name}
                      </span>
                    )}

                    {/* Image if present */}
                    {message.imageUrl && (
                      <div className="mb-2 rounded-xl overflow-hidden border border-black/20 max-w-[240px]">
                        <img 
                          src={message.imageUrl} 
                          alt="Anexo enviado" 
                          className="w-full h-auto object-cover max-h-[220px]"
                        />
                      </div>
                    )}

                    {/* Voice audio note if present */}
                    {message.audioDurationSeconds && (
                      <div className="flex items-center gap-2.5 py-1 min-w-[170px]">
                        <button
                          type="button"
                          onClick={() => setPlayingAudioId(playingAudioId === message.id ? null : message.id)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105 shrink-0 ${
                            isStudent
                              ? 'bg-white text-orange-500'
                              : 'bg-orange-500 text-white'
                          }`}
                        >
                          {playingAudioId === message.id ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4 ml-0.5" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-center gap-0.5 h-5">
                            {[40, 70, 90, 50, 80, 100, 60, 85, 45, 95, 65, 40].map((h, i) => (
                              <span
                                key={i}
                                style={{ height: `${h}%` }}
                                className={`w-1 rounded-full transition-all ${
                                  playingAudioId === message.id
                                    ? isStudent ? 'bg-white animate-pulse' : 'bg-orange-400 animate-pulse'
                                    : isStudent ? 'bg-white/60' : 'bg-zinc-600'
                                }`}
                              />
                            ))}
                          </div>
                          <span className={`text-[9px] font-medium block mt-0.5 ${
                            isStudent ? 'text-white/80' : 'text-zinc-400'
                          }`}>
                            0:{message.audioDurationSeconds < 10 ? `0${message.audioDurationSeconds}` : message.audioDurationSeconds} min
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Message text */}
                    {message.text && (
                      <p
                        style={isStudent ? { color: '#ffffff' } : undefined}
                        className={`text-xs leading-relaxed ${
                          isStudent ? 'font-medium' : 'text-zinc-200'
                        }`}
                      >
                        {message.text}
                      </p>
                    )}

                    {/* Timestamp & Status */}
                    <div
                      style={isStudent ? { color: 'rgba(255,255,255,0.85)' } : undefined}
                      className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                        isStudent ? '' : 'text-zinc-500'
                      }`}
                    >
                      <span>{message.timestamp}</span>

                      {isStudent && (
                        <span>
                          {message.status === 'sending' && (
                            <Clock className="w-2.5 h-2.5" />
                          )}
                          {message.status === 'sent' && (
                            <Check className="w-3 h-3" />
                          )}
                          {message.status === 'delivered' && (
                            <CheckCheck className="w-3 h-3" />
                          )}
                          {message.status === 'read' && (
                            <CheckCheck className="w-3 h-3 font-black" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Specialist is typing bubble */}
        {isActiveTyping && (
          <div className="flex items-end gap-2 animate-in fade-in duration-200">
            <img
              src={activeSpecialist.avatarUrl}
              alt={activeSpecialist.name}
              className="w-7 h-7 rounded-full object-cover shrink-0 mb-0.5 border border-zinc-800"
              referrerPolicy="no-referrer"
            />
            <div className="bg-[#181818] border border-zinc-800/80 rounded-2xl rounded-bl-xs px-3.5 py-2.5 flex items-center gap-1.5 shadow-md">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" />
              <span className="text-[10px] text-zinc-400 ml-1 font-medium">
                {activeSpecialist.name} está a escrever...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Recording Active Bar */}
      {isRecordingVoice ? (
        <div className="p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-[#161616] border-t border-zinc-800 flex items-center justify-between gap-3 shrink-0 animate-in slide-from-bottom-2 duration-150">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-orange-500 animate-pulse" />
              <span className="text-white text-xs font-mono font-bold">
                0:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}
              </span>
              <span className="text-zinc-400 text-xs">A gravar áudio...</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancelVoice}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSendVoice}
              style={{ color: '#ffffff' }}
              className="px-3.5 py-1.5 rounded-xl bg-[#F77F00] hover:bg-orange-600 text-xs font-bold flex items-center gap-1 shadow-lg shadow-orange-500/20 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar</span>
            </button>
          </div>
        </div>
      ) : (
        /* Fixed Bottom Composer Bar */
        <div className="p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-[#111111] border-t border-zinc-800/80 shrink-0 z-20">
          <div className="flex items-center gap-1.5">
            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-zinc-400 hover:text-orange-500 rounded-xl hover:bg-zinc-800/60 transition-colors cursor-pointer"
              title="Anexar ficheiro ou fotografia"
              aria-label="Anexar ficheiro"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Camera Button */}
            <button
              type="button"
              onClick={() => setShowCameraModal(true)}
              className="p-2 text-zinc-400 hover:text-orange-500 rounded-xl hover:bg-zinc-800/60 transition-colors cursor-pointer"
              title="Câmara / Foto rápida"
              aria-label="Tirar foto"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* Text Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isNutritionist
                    ? 'Mensagem para a Nutricionista...'
                    : 'Mensagem para o Treinador...'
                }
                className="w-full bg-[#181818] border border-zinc-800 focus:border-orange-500 text-white placeholder-zinc-500 text-xs rounded-xl px-3.5 py-2.5 outline-none transition-colors"
              />
            </div>

            {/* Microphone Button for voice note */}
            {!inputText.trim() && (
              <button
                type="button"
                onClick={() => setIsRecordingVoice(true)}
                className="p-2 text-zinc-400 hover:text-orange-500 rounded-xl hover:bg-zinc-800/60 transition-colors cursor-pointer"
                title="Gravar mensagem de voz"
                aria-label="Gravar áudio"
              >
                <Mic className="w-4 h-4" />
              </button>
            )}

            {/* Send Button */}
            {inputText.trim() && (
              <button
                type="button"
                onClick={handleSend}
                style={{ color: '#ffffff' }}
                className="p-2.5 bg-[#F77F00] hover:bg-orange-600 rounded-xl transition-all shadow-md shadow-orange-500/20 cursor-pointer flex items-center justify-center shrink-0"
                title="Enviar mensagem"
                aria-label="Enviar"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick Camera Preset Modal */}
      {showCameraModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCameraModal(false);
          }}
          className="fixed inset-0 z-[260] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4"
        >
          <div className="bg-[#141414] border border-zinc-800 rounded-t-3xl sm:rounded-2xl w-full max-w-[380px] p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl animate-in slide-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-orange-500" />
                <h4 className="text-white text-xs font-bold">
                  {isNutritionist ? 'Câmara & Fotos das Refeições' : 'Câmara & Fotos do Treino'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowCameraModal(false)}
                className="text-zinc-400 hover:text-white p-1 cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-zinc-400 text-xs mb-3">
              Escolhe uma fotografia para enviar diretamente para {activeSpecialist.name}:
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {isNutritionist ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleSendPresetPhoto(
                      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&auto=format&fit=crop&q=80',
                      'Dra. Inês, esta foi a minha refeição pós-treino (arroz, frango e vegetais). As porções estão bem equilibradas?'
                    )}
                    className="group relative rounded-xl overflow-hidden border border-zinc-800 text-left p-1 bg-black hover:border-orange-500 transition-colors cursor-pointer"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300&auto=format&fit=crop&q=80"
                      alt="Refeição Pós-Treino"
                      className="w-full h-24 object-cover rounded-lg group-hover:scale-105 transition-transform"
                    />
                    <span className="text-[10px] text-zinc-300 font-semibold block px-1 py-1">
                      Refeição Pós-Treino
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendPresetPhoto(
                      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=80',
                      'Enviei o meu almoço de hoje para confirmares se está alinhado com o plano de Dia de Treino.'
                    )}
                    className="group relative rounded-xl overflow-hidden border border-zinc-800 text-left p-1 bg-black hover:border-orange-500 transition-colors cursor-pointer"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&auto=format&fit=crop&q=80"
                      alt="Prato Equilibrado"
                      className="w-full h-24 object-cover rounded-lg group-hover:scale-105 transition-transform"
                    />
                    <span className="text-[10px] text-zinc-300 font-semibold block px-1 py-1">
                      Almoço Equilibrado
                    </span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleSendPresetPhoto(
                      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80',
                      'Coach, tirei foto à execução do exercício para confirmares a postura!'
                    )}
                    className="group relative rounded-xl overflow-hidden border border-zinc-800 text-left p-1 bg-black hover:border-orange-500 transition-colors cursor-pointer"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300&auto=format&fit=crop&q=80"
                      alt="Postura do Treino"
                      className="w-full h-24 object-cover rounded-lg group-hover:scale-105 transition-transform"
                    />
                    <span className="text-[10px] text-zinc-300 font-semibold block px-1 py-1">
                      Execução Técnica
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSendPresetPhoto(
                      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=80',
                      'Treino de hoje concluído! Deixo o registo da carga final.'
                    )}
                    className="group relative rounded-xl overflow-hidden border border-zinc-800 text-left p-1 bg-black hover:border-orange-500 transition-colors cursor-pointer"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&auto=format&fit=crop&q=80"
                      alt="Treino Concluído"
                      className="w-full h-24 object-cover rounded-lg group-hover:scale-105 transition-transform"
                    />
                    <span className="text-[10px] text-zinc-300 font-semibold block px-1 py-1">
                      Registo de Treino
                    </span>
                  </button>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setShowCameraModal(false);
                fileInputRef.current?.click();
              }}
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Paperclip className="w-3.5 h-3.5 text-orange-500" />
              <span>Carregar Foto da Galeria</span>
            </button>
          </div>
        </div>
      )}

      {/* Specialist Info Modal */}
      {showSpecialistInfoModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSpecialistInfoModal(false);
          }}
          className="fixed inset-0 z-[260] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div className="bg-[#141414] border border-zinc-800 rounded-3xl w-full max-w-[340px] p-5 shadow-2xl text-center">
            <img
              src={activeSpecialist.avatarUrl}
              alt={activeSpecialist.name}
              className="w-20 h-20 rounded-full object-cover mx-auto border-4 border-orange-500/30 mb-3 shadow-lg"
              referrerPolicy="no-referrer"
            />
            <h3 className="text-white text-base font-bold">{activeSpecialist.name}</h3>
            <p className="text-orange-400 text-xs font-medium">{activeSpecialist.role}</p>
            <p className="text-zinc-500 text-[11px] mt-1">{activeSpecialist.club}</p>

            <div className="bg-[#0c0c0c] rounded-2xl p-3 border border-zinc-800/80 my-4 text-left space-y-2">
              <div className="flex justify-between gap-2 text-xs">
                <span className="text-zinc-500">Contacto:</span>
                <span className="text-zinc-200 font-mono font-medium">{activeSpecialist.phone}</span>
              </div>
              <div className="flex justify-between gap-2 text-xs">
                <span className="text-zinc-500">Disponibilidade:</span>
                <span className="text-emerald-400 font-medium text-right">
                  {activeSpecialist.availability || 'Seg - Sex (08:00 - 20:00)'}
                </span>
              </div>
              <div className="flex justify-between gap-2 text-xs">
                <span className="text-zinc-500">Especialidade:</span>
                <span className="text-zinc-200 font-medium text-right">
                  {activeSpecialist.specialty || (isNutritionist ? 'Nutrição Desportiva' : 'Hipertrofia & Força')}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSpecialistInfoModal(false)}
              style={{ color: '#ffffff' }}
              className="w-full py-2.5 rounded-xl bg-[#F77F00] hover:bg-orange-600 font-bold text-xs transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Simulated Call Modal */}
      {showCallModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCallModal(false);
          }}
          className="fixed inset-0 z-[260] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
        >
          <div className="bg-[#111111] border border-zinc-800 rounded-3xl w-full max-w-[320px] p-6 text-center shadow-2xl">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <span className="absolute inset-0 rounded-full bg-orange-500/20 animate-ping" />
              <img
                src={activeSpecialist.avatarUrl}
                alt={activeSpecialist.name}
                className="w-full h-full rounded-full object-cover border-4 border-orange-500 relative z-10"
                referrerPolicy="no-referrer"
              />
            </div>
            <h3 className="text-white text-base font-bold">{activeSpecialist.name}</h3>
            <p className="text-orange-400 text-xs animate-pulse mt-1">A chamar por voz...</p>
            <p className="text-zinc-500 text-[11px] mt-2">
              {isNutritionist
                ? 'A nutricionista recebe o alerta de chamada no seu dispositivo EVOLV Pro.'
                : 'O treinador recebe o alerta de chamada no seu dispositivo EVOLV Coach.'}
            </p>

            <button
              type="button"
              onClick={() => setShowCallModal(false)}
              style={{ color: '#ffffff' }}
              className="mt-6 w-full py-3 rounded-2xl bg-red-500 hover:bg-red-600 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-500/30 transition-all cursor-pointer"
            >
              <Phone className="w-4 h-4 rotate-135" />
              <span>Desligar Chamada</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
