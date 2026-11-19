import React, { useState } from 'react';
import { X, Send, Heart, Reply, MessageSquare } from 'lucide-react';
import { CommunityPost } from '../../types/community';
import { useCommunity } from '../../context/CommunityContext';

interface CommentsModalProps {
  post: CommunityPost;
  onClose: () => void;
}

export function CommentsModal({ post, onClose }: CommentsModalProps) {
  const { addComment, addReply, toggleCommentLike } = useCommunity();
  const [commentText, setCommentText] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(post.id, commentText);
    setCommentText('');
  };

  const handleSendReply = (commentId: string) => {
    if (!replyText.trim()) return;
    addReply(post.id, commentId, replyText);
    setReplyText('');
    setReplyingToCommentId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="w-full sm:max-w-md max-h-[85vh] bg-zinc-950 border-t sm:border border-zinc-800 sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-900 bg-zinc-950/90 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-orange-500" />
            <h3 className="text-white text-sm font-bold tracking-tight">Comentários</h3>
            <span className="text-xs text-zinc-500 font-medium">({post.comments.length})</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Post Brief Reference */}
        <div className="px-5 py-3 bg-zinc-900/40 border-b border-zinc-900 flex items-center gap-3">
          <img
            src={post.author.avatarUrl}
            alt={post.author.name}
            className="w-8 h-8 rounded-full object-cover border border-zinc-700"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white font-semibold truncate">{post.author.name}</p>
            <p className="text-[11px] text-zinc-400 truncate">{post.content}</p>
          </div>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 hide-scrollbar">
          {post.comments.length === 0 ? (
            <div className="text-center py-10">
              <MessageSquare className="w-8 h-8 text-zinc-600 mx-auto mb-2 opacity-50" />
              <p className="text-sm text-zinc-400 font-medium">Ainda sem comentários</p>
              <p className="text-xs text-zinc-600 mt-1">Sê o primeiro a apoiar este treino!</p>
            </div>
          ) : (
            post.comments.map((comment) => (
              <div key={comment.id} className="space-y-2">
                <div className="flex items-start gap-3 group">
                  <img
                    src={comment.author.avatarUrl}
                    alt={comment.author.name}
                    className="w-8 h-8 rounded-full object-cover border border-zinc-800 shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0 bg-zinc-900/60 rounded-2xl p-3 border border-zinc-800/60">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-white">{comment.author.name}</span>
                        {comment.author.role && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 font-semibold border border-orange-500/20">
                            {comment.author.role}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-500">{comment.timestamp}</span>
                    </div>

                    <p className="text-xs text-zinc-200 leading-relaxed break-words">{comment.text}</p>

                    <div className="flex items-center gap-4 mt-2 pt-1 border-t border-zinc-800/40">
                      <button
                        onClick={() => toggleCommentLike(post.id, comment.id)}
                        className={`flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer ${
                          comment.isLiked ? 'text-red-400' : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${comment.isLiked ? 'fill-current' : ''}`} />
                        <span>{comment.likes > 0 ? comment.likes : 'Gosto'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setReplyingToCommentId(replyingToCommentId === comment.id ? null : comment.id);
                          setReplyText('');
                        }}
                        className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-orange-400 font-medium transition-colors cursor-pointer"
                      >
                        <Reply className="w-3.5 h-3.5" />
                        <span>Responder</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Inline Reply Form */}
                {replyingToCommentId === comment.id && (
                  <div className="ml-11 flex items-center gap-2 animate-in fade-in duration-200">
                    <input
                      type="text"
                      placeholder={`Responder a ${comment.author.name}...`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendReply(comment.id);
                      }}
                      autoFocus
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                    />
                    <button
                      onClick={() => handleSendReply(comment.id)}
                      disabled={!replyText.trim()}
                      className="p-2 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white cursor-pointer transition-colors"
                    >
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Nested Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-11 space-y-2 border-l-2 border-zinc-800/80 pl-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex items-start gap-2.5 bg-zinc-900/40 rounded-xl p-2.5 border border-zinc-800/40">
                        <img
                          src={reply.author.avatarUrl}
                          alt={reply.author.name}
                          className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[11px] font-bold text-white">{reply.author.name}</span>
                            <span className="text-[9px] text-zinc-500">{reply.timestamp}</span>
                          </div>
                          <p className="text-xs text-zinc-300 leading-snug break-words">{reply.text}</p>
                          <div className="mt-1">
                            <button
                              onClick={() => toggleCommentLike(post.id, comment.id, reply.id)}
                              className={`flex items-center gap-1 text-[10px] transition-colors cursor-pointer ${
                                reply.isLiked ? 'text-red-400 font-semibold' : 'text-zinc-500 hover:text-zinc-300'
                              }`}
                            >
                              <Heart className={`w-3 h-3 ${reply.isLiked ? 'fill-current' : ''}`} />
                              <span>{reply.likes > 0 ? reply.likes : 'Gosto'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendComment} className="p-3 bg-zinc-950 border-t border-zinc-900 flex items-center gap-2">
          <input
            type="text"
            placeholder="Adiciona um comentário..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 bg-zinc-900/90 border border-zinc-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!commentText.trim()}
            className="w-9 h-9 rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-orange-500/20 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
