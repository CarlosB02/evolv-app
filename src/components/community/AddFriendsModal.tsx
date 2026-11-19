import React, { useState } from 'react';
import { X, UserPlus, Link2, Check, Share2, Users } from 'lucide-react';
import { useCommunity } from '../../context/CommunityContext';

interface AddFriendsModalProps {
  onClose: () => void;
}

export function AddFriendsModal({ onClose }: AddFriendsModalProps) {
  const { friends, toggleFriend, showToast } = useCommunity();
  const [copied, setCopied] = useState(false);
  const inviteLink = 'https://rteam.app/join/carlos-bernardo';

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(inviteLink);
    setCopied(true);
    showToast('Link copiado para a área de transferência!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-900 bg-zinc-950 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-orange-500" />
            <h3 className="text-white text-sm font-bold">Conectar com Amigos</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 hide-scrollbar">
          {/* Convidar por link */}
          <div className="bg-zinc-900/60 rounded-2xl p-4 border border-zinc-800">
            <div className="flex items-center gap-2 text-white font-bold text-xs mb-1">
              <Link2 className="w-4 h-4 text-orange-500" />
              <span>Convidar Pessoas através de Link</span>
            </div>
            <p className="text-[11px] text-zinc-400 mb-3 leading-relaxed">
              Partilha o teu link pessoal do RTEAM para convidar parceiros de treino para a comunidade.
            </p>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-black/60 border border-zinc-800 rounded-xl px-3 py-2 text-[11px] text-zinc-300 font-mono truncate">
                {inviteLink}
              </div>
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Atletas Sugeridos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-zinc-400" />
                Atletas da Comunidade
              </h4>
              <span className="text-[10px] text-zinc-500">RTEAM Lisboa</span>
            </div>

            <div className="space-y-2">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/80"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={friend.avatarUrl}
                      alt={friend.name}
                      className="w-9 h-9 rounded-full object-cover border border-zinc-700"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">{friend.name}</p>
                      <p className="text-[10px] text-zinc-400">{friend.status} • Nível {friend.level}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleFriend(friend.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      friend.isFriend
                        ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                        : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20'
                    }`}
                  >
                    {friend.isFriend ? 'Amigos' : '+ Adicionar'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
