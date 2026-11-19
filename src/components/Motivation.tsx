import { Sparkles } from 'lucide-react';

interface MotivationProps {
  message: string;
}

export function Motivation({ message }: MotivationProps) {
  return (
    <section className="px-5 py-2 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-700 fill-mode-both">
      <div className="relative overflow-hidden rounded-[24px] bg-zinc-950 border border-zinc-800/80 shadow-lg h-[100px]">
        
        {/* Background Image & Overlay */}
        <div 
          className="absolute inset-y-0 left-0 w-2/3 bg-cover bg-left z-0 opacity-70"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/20 via-zinc-950/90 to-zinc-950 z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent z-0"></div>
        <div className="absolute inset-0 bg-orange-500/10 mix-blend-overlay z-0"></div>
        
        <div className="relative z-10 p-5 h-full flex flex-col justify-center items-end text-right">
          <h4 className="text-sm font-black text-white mb-1 flex items-center gap-1.5 justify-end">
            <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0" strokeWidth={2.5} />
            Foco, disciplina e consistência
          </h4>
          <p className="text-[10px] font-bold text-zinc-400">
            É o que separa o sonho da conquista.
          </p>
        </div>
      </div>
    </section>
  );
}
