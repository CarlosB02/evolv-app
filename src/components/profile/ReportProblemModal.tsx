import React, { useState } from 'react';
import { X, Send, AlertTriangle, CheckCircle2, MessageSquareText } from 'lucide-react';

interface ReportProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReportProblemModal({ isOpen, onClose }: ReportProblemModalProps) {
  const [category, setCategory] = useState('app');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setDescription('');
        onClose();
      }, 2000);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#111111] border border-zinc-800 rounded-t-[28px] sm:rounded-[24px] w-full max-w-[390px] p-5 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h3 className="text-white text-base font-semibold">Reportar um Problema</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-white text-base font-bold mb-1">Problema Reportado!</h4>
            <p className="text-zinc-400 text-xs">
              A equipa técnica da PR1ME recebeu o teu relatório (#TK-928) e responderá em menos de 24h.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-zinc-400 text-xs font-medium block mb-1.5">
                Categoria do Problema
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'app', label: 'Aplicação' },
                  { id: 'classes', label: 'Marcação Aulas' },
                  { id: 'billing', label: 'Faturação' },
                  { id: 'other', label: 'Outro' },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategory(item.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border text-left transition-colors cursor-pointer ${
                      category === item.id
                        ? 'bg-orange-500/10 border-orange-500 text-orange-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-zinc-400 text-xs font-medium block mb-1.5">
                Descrição Detalhada
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Descreve o que aconteceu, passos para reproduzir ou a tua dúvida..."
                rows={4}
                className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                required
              />
            </div>

            <div className="flex gap-2.5 pt-2 border-t border-zinc-800/80">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !description.trim()}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-lg shadow-orange-500/20 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>A enviar...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar Relatório</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
