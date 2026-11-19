import React, { useState, useEffect } from 'react';
import { 
  Pin, 
  PinOff, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Lock, 
  UserCheck, 
  Sparkles, 
  Clock, 
  MoreVertical,
  PlusCircle,
  FileText,
  ChevronDown
} from 'lucide-react';
import { ExerciseItem } from '../data/workoutsData';

export interface ExerciseNoteItem {
  id: string;
  text: string;
  createdAt: string;
  isPinned: boolean;
  sharedWithTrainer: boolean;
  updatedAt?: string;
}

interface ExerciseNotesTabProps {
  exercise: ExerciseItem;
}

export function ExerciseNotesTab({ exercise }: ExerciseNotesTabProps) {
  // Local storage keys
  const notesStorageKey = `exercise_notes_${exercise.id}`;

  // Default seed notes for a realistic feel if none exist yet
  const getDefaultNotes = (): ExerciseNoteItem[] => {
    return [
      {
        id: 'seed-1',
        text: exercise.notes 
          ? `Nota técnica: ${exercise.notes}` 
          : 'Focar na cadência lenta de 3 segundos na fase excêntrica. Manter o core bem travado e respiração sincronizada.',
        createdAt: '10 Out 2026, 10:15',
        isPinned: true,
        sharedWithTrainer: true,
      },
      {
        id: 'seed-2',
        text: 'Sentir bom pico de contração no topo da repetição. Ajustar o banco 1 furo mais acima para melhor estabilização do quadril.',
        createdAt: '06 Out 2026, 17:40',
        isPinned: false,
        sharedWithTrainer: false,
      }
    ];
  };

  // State: Notes list
  const [notes, setNotes] = useState<ExerciseNoteItem[]>(() => {
    try {
      const saved = localStorage.getItem(notesStorageKey);
      if (saved) {
        return JSON.parse(saved);
      }
      return getDefaultNotes();
    } catch {
      return getDefaultNotes();
    }
  });

  // State: Expanded notes in previous notes accordion (all minimized by default)
  const [expandedNoteIds, setExpandedNoteIds] = useState<Record<string, boolean>>({});

  const toggleNoteExpanded = (noteId: string) => {
    setExpandedNoteIds(prev => ({
      ...prev,
      [noteId]: !prev[noteId]
    }));
  };

  // State: New note creation form
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [shareNewNoteWithTrainer, setShareNewNoteWithTrainer] = useState<boolean>(true);

  // State: Editing note
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [editingShareWithTrainer, setEditingShareWithTrainer] = useState<boolean>(false);

  // State: Action menu open dropdown for each note
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Feedback banner / toast
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  const showStatus = (msg: string) => {
    setStatusFeedback(msg);
    setTimeout(() => setStatusFeedback(null), 2500);
  };

  // Sync notes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(notesStorageKey, JSON.stringify(notes));
    } catch (e) {
      console.error('Failed to save notes:', e);
    }
  }, [notes, notesStorageKey]);

  // Format current date in PT format (e.g. "12 Out 2026, 15:45")
  const getFormattedCurrentDate = (): string => {
    const now = new Date();
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const day = String(now.getDate()).padStart(2, '0');
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  };

  // 1. ADD NEW NOTE
  const handleSaveNewNote = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newNoteText.trim();
    if (!trimmed) return;
    if (trimmed.length > 500) {
      showStatus('A nota não pode ter mais de 500 caracteres.');
      return;
    }

    const newNote: ExerciseNoteItem = {
      id: `note-${Date.now()}`,
      text: trimmed,
      createdAt: getFormattedCurrentDate(),
      isPinned: false,
      sharedWithTrainer: shareNewNoteWithTrainer,
    };

    setNotes((prev) => [newNote, ...prev]);
    setNewNoteText('');
    showStatus('Nota guardada com sucesso!');
  };

  // 2. TOGGLE PIN
  const handleTogglePin = (noteId: string) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === noteId) {
          const nextPinned = !n.isPinned;
          showStatus(nextPinned ? 'Nota fixada no topo!' : 'Fixação removida.');
          return { ...n, isPinned: nextPinned };
        }
        return n;
      })
    );
    setActiveMenuId(null);
  };

  // 3. DELETE NOTE
  const handleDeleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    setActiveMenuId(null);
    showStatus('Nota eliminada do histórico.');
  };

  // 4. START EDITING
  const handleStartEdit = (note: ExerciseNoteItem) => {
    setEditingNoteId(note.id);
    setEditingText(note.text);
    setEditingShareWithTrainer(note.sharedWithTrainer);
    setActiveMenuId(null);
    // Make sure it is expanded when editing
    setExpandedNoteIds(prev => ({ ...prev, [note.id]: true }));
  };

  // SAVE EDIT
  const handleSaveEdit = (noteId: string) => {
    const trimmed = editingText.trim();
    if (!trimmed) return;
    if (trimmed.length > 500) {
      showStatus('A nota não pode exceder 500 caracteres.');
      return;
    }

    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === noteId) {
          return {
            ...n,
            text: trimmed,
            sharedWithTrainer: editingShareWithTrainer,
            updatedAt: getFormattedCurrentDate(),
          };
        }
        return n;
      })
    );
    setEditingNoteId(null);
    showStatus('Nota atualizada com sucesso!');
  };

  // CANCEL EDIT
  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingText('');
  };

  // TOGGLE SHARE ON SPECIFIC NOTE
  const handleToggleShareOnNote = (noteId: string) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === noteId) {
          const nextShared = !n.sharedWithTrainer;
          showStatus(
            nextShared 
              ? 'Nota partilhada com o treinador.' 
              : 'Nota mantida privada.'
          );
          return { ...n, sharedWithTrainer: nextShared };
        }
        return n;
      })
    );
    setActiveMenuId(null);
  };

  // Sort notes: pinned first, then chronological
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  const charCount = newNoteText.length;
  const isNearLimit = charCount >= 450;
  const isOverLimit = charCount > 500;

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-200">
      
      {/* STATUS TOAST / FEEDBACK */}
      {statusFeedback && (
        <div className="p-3 rounded-xl bg-orange-500/15 border border-orange-500/40 text-orange-300 text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-top-2 duration-200">
          <Sparkles className="w-4 h-4 text-orange-400 shrink-0" />
          <span>{statusFeedback}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. ADICIONA NOVA NOTA                                                     */}
      {/* ========================================================================= */}
      <section className="bg-[#0a0a0a] border border-zinc-800/80 rounded-2xl p-4 shadow-sm">
        {/* Título: "adiciona nova nota" com tamanho de letra mais pequeno e sem nome do exercício */}
        <div className="flex items-center gap-2 mb-3">
          <PlusCircle className="w-4 h-4 text-orange-400 shrink-0" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Adiciona nova nota
          </h2>
        </div>

        <form onSubmit={handleSaveNewNote} className="flex flex-col gap-3">
          {/* Campo de texto com placeholder e contador 0/500 no canto inferior direito */}
          <div className="relative">
            <textarea
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Escreve aqui a tua nota..."
              rows={4}
              maxLength={520}
              className={`w-full bg-zinc-950/80 border rounded-xl p-3.5 pb-8 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none transition-all resize-none leading-relaxed ${
                isOverLimit 
                  ? 'border-red-500/80 focus:border-red-500' 
                  : 'border-zinc-800 focus:border-orange-500/80'
              }`}
            />
            {/* Limite de caracteres no canto inferior direito de onde se escreve */}
            <div className="absolute right-3 bottom-3 pointer-events-none">
              <span className={`text-[10px] font-mono font-bold ${
                isOverLimit 
                  ? 'text-red-400' 
                  : isNearLimit 
                  ? 'text-amber-400' 
                  : 'text-zinc-500'
              }`}>
                {charCount}/500
              </span>
            </div>
          </div>

          {/* Barra de Ação: Toggle Partilhar com Treinador + Botão Guardar Nota na MESMA LINHA */}
          <div className="flex items-center justify-between gap-2 pt-1 flex-nowrap w-full">
            {/* Opção: Partilhar com o treinador (sem ícone) */}
            <button
              type="button"
              onClick={() => setShareNewNoteWithTrainer(!shareNewNoteWithTrainer)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] sm:text-xs font-medium transition-all cursor-pointer select-none shrink-0 ${
                shareNewNoteWithTrainer
                  ? 'bg-orange-500/10 border-orange-500/40 text-orange-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-300'
              }`}
            >
              <span className="whitespace-nowrap">Partilhar com treinador</span>
              {/* Mini toggle switch */}
              <div
                className={`w-6 sm:w-7 h-3.5 sm:h-4 rounded-full transition-colors flex items-center p-0.5 ml-0.5 shrink-0 ${
                  shareNewNoteWithTrainer ? 'bg-orange-500 justify-end' : 'bg-zinc-800 justify-start'
                }`}
              >
                <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 rounded-full bg-white shadow-sm" />
              </div>
            </button>

            {/* Botão Guardar Nota (sem ícone) */}
            <button
              type="submit"
              disabled={!newNoteText.trim() || isOverLimit}
              className={`flex items-center justify-center px-4 sm:px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                newNoteText.trim() && !isOverLimit
                  ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25 active:scale-95'
                  : 'bg-zinc-900 text-zinc-600 border border-zinc-800/80 cursor-not-allowed opacity-60'
              }`}
            >
              <span>Guardar Nota</span>
            </button>
          </div>
        </form>
      </section>

      {/* ========================================================================= */}
      {/* 2. NOTAS ANTERIORES                                                      */}
      {/* ========================================================================= */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-400 shrink-0" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Notas Anteriores
            </h2>
          </div>
          <span className="text-[10px] text-zinc-400 font-semibold bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800">
            {notes.length} {notes.length === 1 ? 'nota' : 'notas'}
          </span>
        </div>

        {/* Lista de notas com lógica minimizada por defeito (estilo accordion) */}
        {sortedNotes.length === 0 ? (
          <div className="bg-[#0a0a0a] border border-zinc-800/80 rounded-2xl p-7 text-center flex flex-col items-center justify-center">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-2.5">
              <FileText className="w-5 h-5 text-zinc-500" />
            </div>
            <h3 className="text-xs font-bold text-white mb-1">
              Ainda não tens notas gravadas
            </h3>
            <p className="text-[11px] text-zinc-400 max-w-xs">
              Usa o campo acima para registar observações sobre a execução deste exercício.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {sortedNotes.map((note) => {
              const isEditing = editingNoteId === note.id;
              const isMenuOpen = activeMenuId === note.id;
              const isExpanded = !!expandedNoteIds[note.id] || isEditing;

              return (
                <article
                  key={note.id}
                  className={`relative rounded-2xl border transition-all duration-200 overflow-hidden ${
                    note.isPinned
                      ? 'bg-[#0e0c08] border-amber-500/40 shadow-sm'
                      : 'bg-[#0a0a0a] border-zinc-800/80 hover:border-zinc-700/80'
                  }`}
                >
                  {/* Cabeçalho da Nota: Minimizada com título sendo parte do texto em 1 linha e botões */}
                  <div className="flex items-center justify-between p-3.5 gap-2.5">
                    
                    {/* Botão de Dropdown / Expandir: Título com 1 linha e indicador */}
                    <button
                      type="button"
                      onClick={() => toggleNoteExpanded(note.id)}
                      className="flex-1 min-w-0 flex items-center gap-2.5 text-left cursor-pointer hover:opacity-90 transition-opacity"
                      aria-expanded={isExpanded}
                    >
                      {/* Ícone de Pin se fixada, ou chevron */}
                      {note.isPinned ? (
                        <Pin className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      )}

                      {/* Título: Apenas 1 linha do texto com '...' e badges */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-zinc-200 truncate pr-1">
                          {note.text}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px] text-zinc-500">
                            {note.createdAt}
                          </span>
                          <span className="text-zinc-700 text-[10px]">•</span>
                          {note.sharedWithTrainer ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                              <UserCheck className="w-2.5 h-2.5 shrink-0" />
                              <span>Partilhada</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-500">
                              <Lock className="w-2.5 h-2.5 shrink-0" />
                              <span>Privada</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Seta indicadora de drop/expand */}
                      <ChevronDown 
                        className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-orange-400' : ''
                        }`} 
                      />
                    </button>

                    {/* Menu de Ações (3 pontos no canto) */}
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(isMenuOpen ? null : note.id);
                        }}
                        className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 active:scale-95 transition-all cursor-pointer"
                        aria-label="Opções da nota"
                        title="Mais opções"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>

                      {/* Dropdown Menu de Ações */}
                      {isMenuOpen && (
                        <>
                          {/* Backdrop click to close */}
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(null);
                            }}
                          />

                          <div className="absolute right-0 top-8 z-50 w-48 bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl p-1.5 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-150">
                            
                            {/* Ação: Fixar / Retirar fixação */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTogglePin(note.id);
                              }}
                              className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-xs font-medium text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors text-left cursor-pointer"
                            >
                              {note.isPinned ? (
                                <>
                                  <PinOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                  <span>Retirar fixação</span>
                                </>
                              ) : (
                                <>
                                  <Pin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                  <span>Fixar no topo</span>
                                </>
                              )}
                            </button>

                            {/* Ação: Partilhar / Tornar privada */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleShareOnNote(note.id);
                              }}
                              className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-xs font-medium text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors text-left cursor-pointer"
                            >
                              {note.sharedWithTrainer ? (
                                <>
                                  <Lock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                  <span>Tornar privada</span>
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  <span>Partilhar c/ treinador</span>
                                </>
                              )}
                            </button>

                            {/* Ação: Editar */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEdit(note);
                              }}
                              className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-xs font-medium text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors text-left cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                              <span>Editar nota</span>
                            </button>

                            <div className="h-px bg-zinc-800 my-0.5" />

                            {/* Ação: Eliminar */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteNote(note.id);
                              }}
                              className="flex items-center gap-2 w-full px-2.5 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/15 hover:text-red-300 transition-colors text-left cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 shrink-0" />
                              <span>Eliminar nota</span>
                            </button>

                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Conteúdo Expandido (Drop) com texto completo ou edição */}
                  {isExpanded && (
                    <div className="px-3.5 pb-3.5 pt-1 border-t border-zinc-850/80 animate-in fade-in duration-200">
                      {isEditing ? (
                        <div className="flex flex-col gap-2.5 pt-2">
                          <div className="relative">
                            <textarea
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              rows={3}
                              maxLength={520}
                              className="w-full bg-zinc-950 border border-orange-500/80 rounded-xl p-3 pb-7 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none leading-relaxed resize-none"
                            />
                            <div className="absolute right-2.5 bottom-2 pointer-events-none">
                              <span className="text-[10px] font-mono text-zinc-500">
                                {editingText.length}/500
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                            {/* Toggle partilha na edição */}
                            <button
                              type="button"
                              onClick={() => setEditingShareWithTrainer(!editingShareWithTrainer)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                                editingShareWithTrainer
                                  ? 'bg-orange-500/10 border-orange-500/40 text-orange-400'
                                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-300'
                              }`}
                            >
                              {editingShareWithTrainer ? (
                                <UserCheck className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                              ) : (
                                <Lock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                              )}
                              <span>{editingShareWithTrainer ? 'Partilhada com o treinador' : 'Apenas para mim (Privada)'}</span>
                            </button>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 cursor-pointer"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(note.id)}
                                disabled={!editingText.trim() || editingText.length > 500}
                                className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-50 cursor-pointer shadow-sm"
                              >
                                Guardar
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2.5 pt-2">
                          <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed whitespace-pre-line">
                            {note.text}
                          </p>

                          <div className="flex items-center justify-between pt-1 border-t border-zinc-850/60 flex-wrap gap-2">
                            {note.sharedWithTrainer ? (
                              <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                                <UserCheck className="w-3 h-3 shrink-0" />
                                <span>Partilhada com o treinador (visível na plataforma)</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-400 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-md">
                                <Lock className="w-3 h-3 shrink-0" />
                                <span>Nota privada (apenas visível para ti)</span>
                              </div>
                            )}

                            {note.updatedAt && (
                              <span className="text-[10px] text-zinc-500 italic">
                                Editada em {note.updatedAt}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}

