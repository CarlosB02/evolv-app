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
  Sparkles,
  Info,
  X,
  Volume2
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { ChatMessage } from '../../types';

export function CoachChatTab() {
  const { 
    chatMessages, 
    coachInfo, 
    isCoachTyping, 
    sendMessage, 
    clearChat 
  } = useNotifications();

  const [inputText, setInputText] = useState('');
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showCoachInfoModal, setShowCoachInfoModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  
  // Voice recording state
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<number | null>(null);

  // Audio playback state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll to bottom on mount and when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isCoachTyping]);

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

  // Handle Send text
  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage({ text: inputText });
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
    sendMessage({ audioDurationSeconds: duration });
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
          sendMessage({ 
            imageUrl: reader.result, 
            text: 'Enviei uma foto do treino / refeição para análise.' 
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Sample quick camera photos
  const handleSendPresetPhoto = (url: string, caption: string) => {
    setShowCameraModal(false);
    sendMessage({ imageUrl: url, text: caption });
  };

  // Group messages by dateLabel
  const groupedMessages: { [date: string]: ChatMessage[] } = {};
  chatMessages.forEach(msg => {
    const date = msg.dateLabel || 'Hoje';
    if (!groupedMessages[date]) {
      groupedMessages[date] = [];
    }
    groupedMessages[date].push(msg);
  });

  return (
    <div className="flex flex-col flex-1 h-full min-h-[500px] relative">
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Coach Info Bar */}
      <div className="px-5 py-2.5 bg-[#0d0d0d] border-b border-zinc-800/80 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className="relative cursor-pointer" onClick={() => setShowCoachInfoModal(true)}>
            <img
              src={coachInfo.avatarUrl}
              alt={coachInfo.name}
              className="w-9 h-9 rounded-full object-cover border-2 border-orange-500/40"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-black" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-white text-xs font-bold leading-tight">
                {coachInfo.name}
              </h3>
              <span className="text-[9px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-1 rounded font-semibold">
                PRO
              </span>
            </div>
            <p className="text-emerald-400 text-[10px] leading-tight flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{coachInfo.status}</span>
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 relative">
          <button
            onClick={() => setShowCallModal(true)}
            className="p-2 rounded-xl text-zinc-400 hover:text-orange-500 hover:bg-zinc-800/60 transition-colors cursor-pointer"
            title="Ligar ao Treinador"
            aria-label="Ligar ao Treinador"
          >
            <Phone className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
            title="Mais Opções"
            aria-label="Mais Opções"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Options Dropdown Menu */}
          {showOptionsMenu && (
            <div className="absolute right-0 top-10 w-48 bg-[#181818] border border-zinc-800 rounded-xl shadow-xl z-30 py-1 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => {
                  setShowOptionsMenu(false);
                  setShowCoachInfoModal(true);
                }}
                className="w-full text-left px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800/70 hover:text-white flex items-center gap-2 cursor-pointer"
              >
                <Info className="w-3.5 h-3.5 text-zinc-400" />
                <span>Perfil do Treinador</span>
              </button>
              <button
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
                onClick={() => {
                  setShowOptionsMenu(false);
                  clearChat();
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
      <div className="flex-1 px-4 py-3 space-y-4 overflow-y-auto hide-scrollbar">
        {/* End-to-end encryption note */}
        <div className="flex items-center justify-center gap-1.5 py-1">
          <span className="text-[10px] text-zinc-500 bg-[#111111] border border-zinc-800/80 px-2.5 py-1 rounded-full text-center">
            🔒 Canal privado e seguro com o teu Personal Trainer
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
                  {/* Coach Avatar if coach */}
                  {!isStudent && (
                    <img
                      src={coachInfo.avatarUrl}
                      alt={coachInfo.name}
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
                    {/* Sender name for Coach */}
                    {!isStudent && (
                      <span className="text-[10px] font-bold text-orange-400 block mb-1">
                        {coachInfo.name}
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
                      <p className={`text-xs leading-relaxed ${
                        isStudent ? 'text-white font-medium' : 'text-zinc-200'
                      }`}>
                        {message.text}
                      </p>
                    )}

                    {/* Timestamp & Status */}
                    <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                      isStudent ? 'text-white/80' : 'text-zinc-500'
                    }`}>
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
                            <CheckCheck className="w-3 h-3 text-white font-black" />
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

        {/* Coach is typing bubble */}
        {isCoachTyping && (
          <div className="flex items-end gap-2 animate-in fade-in duration-200">
            <img
              src={coachInfo.avatarUrl}
              alt={coachInfo.name}
              className="w-7 h-7 rounded-full object-cover shrink-0 mb-0.5 border border-zinc-800"
              referrerPolicy="no-referrer"
            />
            <div className="bg-[#181818] border border-zinc-800/80 rounded-2xl rounded-bl-xs px-3.5 py-2.5 flex items-center gap-1.5 shadow-md">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" />
              <span className="text-[10px] text-zinc-400 ml-1 font-medium">
                {coachInfo.name} está a escrever...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Recording Active Bar */}
      {isRecordingVoice ? (
        <div className="p-3 bg-[#161616] border-t border-zinc-800 flex items-center justify-between gap-3 animate-in slide-from-bottom-2 duration-150">
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
              onClick={handleCancelVoice}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={handleSendVoice}
              className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1 shadow-lg shadow-orange-500/20 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-white" />
              <span>Enviar</span>
            </button>
          </div>
        </div>
      ) : (
        /* Fixed Bottom Composer Bar */
        <div className="p-3 bg-[#111111] border-t border-zinc-800/80 sticky bottom-0 z-20">
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
                placeholder="Mensagem..."
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
                className="p-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all shadow-md shadow-orange-500/20 cursor-pointer flex items-center justify-center shrink-0"
                title="Enviar mensagem"
                aria-label="Enviar"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick Camera Preset Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-[#141414] border border-zinc-800 rounded-t-3xl sm:rounded-2xl w-full max-w-[380px] p-5 shadow-2xl animate-in slide-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-orange-500" />
                <h4 className="text-white text-xs font-bold">Câmara & Fotos do Treino</h4>
              </div>
              <button onClick={() => setShowCameraModal(false)} className="text-zinc-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-zinc-400 text-xs mb-3">
              Escolhe uma fotografia para enviar diretamente ao Coach André:
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
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
                onClick={() => handleSendPresetPhoto(
                  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&auto=format&fit=crop&q=80',
                  'Esta foi a minha refeição pós-treino (arroz, frango e vegetais). Está bem equilibrada?'
                )}
                className="group relative rounded-xl overflow-hidden border border-zinc-800 text-left p-1 bg-black hover:border-orange-500 transition-colors cursor-pointer"
              >
                <img
                  src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300&auto=format&fit=crop&q=80"
                  alt="Refeição"
                  className="w-full h-24 object-cover rounded-lg group-hover:scale-105 transition-transform"
                />
                <span className="text-[10px] text-zinc-300 font-semibold block px-1 py-1">
                  Refeição Pós-Treino
                </span>
              </button>
            </div>

            <button
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

      {/* Coach Info Modal */}
      {showCoachInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#141414] border border-zinc-800 rounded-3xl w-full max-w-[340px] p-5 shadow-2xl text-center">
            <img
              src={coachInfo.avatarUrl}
              alt={coachInfo.name}
              className="w-20 h-20 rounded-full object-cover mx-auto border-4 border-orange-500/30 mb-3 shadow-lg"
              referrerPolicy="no-referrer"
            />
            <h3 className="text-white text-base font-bold">{coachInfo.name}</h3>
            <p className="text-orange-400 text-xs font-medium">{coachInfo.role}</p>
            <p className="text-zinc-500 text-[11px] mt-1">{coachInfo.club}</p>

            <div className="bg-[#0c0c0c] rounded-2xl p-3 border border-zinc-800/80 my-4 text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Contacto:</span>
                <span className="text-zinc-200 font-mono font-medium">{coachInfo.phone}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Disponibilidade:</span>
                <span className="text-emerald-400 font-medium">Seg - Sex (07:00 - 20:00)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Especialidade:</span>
                <span className="text-zinc-200 font-medium">Hipertrofia & Força</span>
              </div>
            </div>

            <button
              onClick={() => setShowCoachInfoModal(false)}
              className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Simulated Call Modal */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-[#111111] border border-zinc-800 rounded-3xl w-full max-w-[320px] p-6 text-center shadow-2xl">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <span className="absolute inset-0 rounded-full bg-orange-500/20 animate-ping" />
              <img
                src={coachInfo.avatarUrl}
                alt={coachInfo.name}
                className="w-full h-full rounded-full object-cover border-4 border-orange-500 relative z-10"
                referrerPolicy="no-referrer"
              />
            </div>
            <h3 className="text-white text-base font-bold">{coachInfo.name}</h3>
            <p className="text-orange-400 text-xs animate-pulse mt-1">A chamar por voz...</p>
            <p className="text-zinc-500 text-[11px] mt-2">
              O treinador recebe o alerta de chamada no seu dispositivo PR1ME Coach.
            </p>

            <button
              onClick={() => setShowCallModal(false)}
              className="mt-6 w-full py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-500/30 transition-all cursor-pointer"
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
