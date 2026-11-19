import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  CommunityTab, 
  ReactionEmoji, 
  CommunityPost, 
  Challenge, 
  CommunityAchievement, 
  CommunityFriend, 
  CommunityComment 
} from '../types/community';
import { 
  initialFeedPosts, 
  initialActiveChallenges, 
  initialReceivedInvites, 
  initialAchievements, 
  mockCommunityFriends, 
  mockCurrentUser 
} from '../data/communityData';

interface CommunityContextType {
  isCommunityOpen: boolean;
  openCommunity: (tab?: CommunityTab) => void;
  closeCommunity: () => void;
  activeTab: CommunityTab;
  setActiveTab: (tab: CommunityTab) => void;
  
  // Feed operations
  posts: CommunityPost[];
  toggleReaction: (postId: string, emoji: ReactionEmoji) => void;
  addComment: (postId: string, text: string) => void;
  addReply: (postId: string, commentId: string, text: string) => void;
  toggleCommentLike: (postId: string, commentId: string, replyId?: string) => void;
  toggleSavePost: (postId: string) => void;
  createPost: (post: Partial<CommunityPost>) => void;
  
  // Challenges operations
  activeChallenges: Challenge[];
  receivedInvites: Challenge[];
  acceptInvite: (challengeId: string) => void;
  declineInvite: (challengeId: string) => void;
  createChallenge: (challenge: Partial<Challenge>) => void;
  selectedChallenge: Challenge | null;
  setSelectedChallenge: (challenge: Challenge | null) => void;
  
  // Achievements operations
  achievements: CommunityAchievement[];
  toggleApplaudAchievement: (achievementId: string) => void;
  shareAchievement: (achievement: Partial<CommunityAchievement>) => void;
  
  // Friends & Social operations
  friends: CommunityFriend[];
  toggleFriend: (friendId: string) => void;
  
  // Feedback toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export function CommunityProvider({ children }: { children: ReactNode }) {
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<CommunityTab>('feed');
  const [posts, setPosts] = useState<CommunityPost[]>(initialFeedPosts);
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>(initialActiveChallenges);
  const [receivedInvites, setReceivedInvites] = useState<Challenge[]>(initialReceivedInvites);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [achievements, setAchievements] = useState<CommunityAchievement[]>(initialAchievements);
  const [friends, setFriends] = useState<CommunityFriend[]>(mockCommunityFriends);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3000);
  };

  const openCommunity = (tab?: CommunityTab) => {
    if (tab) {
      setActiveTab(tab);
    }
    setIsCommunityOpen(true);
  };

  const closeCommunity = () => {
    setIsCommunityOpen(false);
  };

  const toggleReaction = (postId: string, emoji: ReactionEmoji) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const currentReaction = post.userReaction;
        const newReactions = { ...post.reactions };

        if (currentReaction === emoji) {
          // Remove reaction
          newReactions[emoji] = Math.max(0, newReactions[emoji] - 1);
          return {
            ...post,
            reactions: newReactions,
            userReaction: null,
          };
        } else {
          // If already reacted with another emoji, decrease old
          if (currentReaction) {
            newReactions[currentReaction] = Math.max(0, newReactions[currentReaction] - 1);
          }
          // Increase new emoji
          newReactions[emoji] = (newReactions[emoji] || 0) + 1;
          return {
            ...post,
            reactions: newReactions,
            userReaction: emoji,
          };
        }
      })
    );
  };

  const addComment = (postId: string, text: string) => {
    if (!text.trim()) return;
    const newComment: CommunityComment = {
      id: `c-${Date.now()}`,
      author: {
        id: mockCurrentUser.id,
        name: mockCurrentUser.name,
        avatarUrl: mockCurrentUser.avatarUrl,
        role: mockCurrentUser.role,
        level: mockCurrentUser.level,
      },
      text: text.trim(),
      timestamp: 'Agora mesmo',
      likes: 0,
      isLiked: false,
      replies: [],
    };

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, comments: [...post.comments, newComment] } : post
      )
    );
    showToast('Comentário publicado!');
  };

  const addReply = (postId: string, commentId: string, text: string) => {
    if (!text.trim()) return;
    const newReply = {
      id: `cr-${Date.now()}`,
      author: {
        id: mockCurrentUser.id,
        name: mockCurrentUser.name,
        avatarUrl: mockCurrentUser.avatarUrl,
        role: mockCurrentUser.role,
      },
      text: text.trim(),
      timestamp: 'Agora mesmo',
      likes: 0,
      isLiked: false,
    };

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        return {
          ...post,
          comments: post.comments.map((c) =>
            c.id === commentId ? { ...c, replies: [...(c.replies || []), newReply] } : c
          ),
        };
      })
    );
    showToast('Resposta enviada!');
  };

  const toggleCommentLike = (postId: string, commentId: string, replyId?: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        return {
          ...post,
          comments: post.comments.map((comment) => {
            if (replyId && comment.id === commentId) {
              return {
                ...comment,
                replies: (comment.replies || []).map((reply) => {
                  if (reply.id === replyId) {
                    const isLiked = !reply.isLiked;
                    return {
                      ...reply,
                      isLiked,
                      likes: isLiked ? reply.likes + 1 : Math.max(0, reply.likes - 1),
                    };
                  }
                  return reply;
                }),
              };
            }
            if (comment.id === commentId) {
              const isLiked = !comment.isLiked;
              return {
                ...comment,
                isLiked,
                likes: isLiked ? comment.likes + 1 : Math.max(0, comment.likes - 1),
              };
            }
            return comment;
          }),
        };
      })
    );
  };

  const toggleSavePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const isSaved = !post.isSaved;
          showToast(isSaved ? 'Publicação guardada nos favoritos!' : 'Publicação removida dos guardados');
          return { ...post, isSaved };
        }
        return post;
      })
    );
  };

  const createPost = (newPostData: Partial<CommunityPost>) => {
    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      author: {
        id: mockCurrentUser.id,
        name: mockCurrentUser.name,
        avatarUrl: mockCurrentUser.avatarUrl,
        role: mockCurrentUser.role,
        level: mockCurrentUser.level,
      },
      timestamp: 'Agora mesmo',
      type: newPostData.type || 'text',
      content: newPostData.content || '',
      images: newPostData.images,
      videoDuration: newPostData.videoDuration,
      videoThumbnail: newPostData.videoThumbnail,
      prData: newPostData.prData,
      achievementData: newPostData.achievementData,
      reactions: {
        fire: 1,
        muscle: 1,
        applause: 0,
        rocket: 0,
        heart: 1,
      },
      userReaction: 'fire',
      comments: [],
      isSaved: false,
    };

    setPosts((prev) => [newPost, ...prev]);
    showToast('Publicação partilhada com sucesso!');
  };

  const acceptInvite = (challengeId: string) => {
    const invite = receivedInvites.find((ch) => ch.id === challengeId);
    if (!invite) return;

    setReceivedInvites((prev) => prev.filter((ch) => ch.id !== challengeId));
    
    // Add to active with updated user stats
    const acceptedChallenge: Challenge = {
      ...invite,
      isReceivedInvite: false,
      userRank: invite.leaderboard.length + 1,
      participantsCount: invite.participantsCount + 1,
      participantAvatars: [mockCurrentUser.avatarUrl, ...invite.participantAvatars],
      leaderboard: [
        ...invite.leaderboard,
        {
          rank: invite.leaderboard.length + 1,
          name: mockCurrentUser.name,
          avatarUrl: mockCurrentUser.avatarUrl,
          score: 0,
          scoreUnit: invite.targetUnit,
          progressPercent: 0,
          isUser: true,
        },
      ],
    };

    setActiveChallenges((prev) => [acceptedChallenge, ...prev]);
    showToast(`Aceitaste o "${invite.title}"! 🔥`);
  };

  const declineInvite = (challengeId: string) => {
    setReceivedInvites((prev) => prev.filter((ch) => ch.id !== challengeId));
    showToast('Convite recusado.');
  };

  const createChallenge = (challengeData: Partial<Challenge>) => {
    const newChallenge: Challenge = {
      id: `ch-custom-${Date.now()}`,
      title: challengeData.title || 'Desafio RTEAM',
      description: challengeData.description || 'Desafio criado por ti para motivar a equipa.',
      type: challengeData.type || 'workouts',
      targetValue: challengeData.targetValue || 15,
      targetUnit: challengeData.targetUnit || 'treinos',
      userProgress: 1,
      daysRemaining: challengeData.totalDays || 14,
      totalDays: challengeData.totalDays || 14,
      participantsCount: (challengeData.participantAvatars?.length || 0) + 1,
      participantAvatars: [mockCurrentUser.avatarUrl, ...(challengeData.participantAvatars || [])],
      userRank: 1,
      leaderboard: [
        {
          rank: 1,
          name: mockCurrentUser.name,
          avatarUrl: mockCurrentUser.avatarUrl,
          score: 1,
          scoreUnit: challengeData.targetUnit || 'treinos',
          progressPercent: Math.round((1 / (challengeData.targetValue || 15)) * 100),
          isUser: true,
        },
        ...((challengeData.participantAvatars || []).map((avatar, idx) => ({
          rank: idx + 2,
          name: friends[idx]?.name || `Atleta ${idx + 1}`,
          avatarUrl: avatar,
          score: 0,
          scoreUnit: challengeData.targetUnit || 'treinos',
          progressPercent: 0,
        }))),
      ],
    };

    setActiveChallenges((prev) => [newChallenge, ...prev]);
    showToast(`Desafio "${newChallenge.title}" criado e convites enviados! 🚀`);
  };

  const toggleApplaudAchievement = (achievementId: string) => {
    setAchievements((prev) =>
      prev.map((ach) => {
        if (ach.id !== achievementId) return ach;
        const hasApplauded = !ach.hasApplauded;
        return {
          ...ach,
          hasApplauded,
          applauseCount: hasApplauded ? ach.applauseCount + 1 : Math.max(0, ach.applauseCount - 1),
        };
      })
    );
  };

  const shareAchievement = (newAch: Partial<CommunityAchievement>) => {
    const achievement: CommunityAchievement = {
      id: `ach-${Date.now()}`,
      title: newAch.title || 'Nova Conquista',
      category: newAch.category || 'objetivos',
      description: newAch.description || '',
      date: 'Hoje',
      author: {
        id: mockCurrentUser.id,
        name: mockCurrentUser.name,
        avatarUrl: mockCurrentUser.avatarUrl,
        role: mockCurrentUser.role,
        level: mockCurrentUser.level,
      },
      badgeIcon: newAch.badgeIcon || 'Trophy',
      badgeGradient: newAch.badgeGradient || 'from-amber-500 to-orange-600',
      applauseCount: 1,
      hasApplauded: true,
      metric: newAch.metric,
      image: newAch.image,
    };

    setAchievements((prev) => [achievement, ...prev]);

    // Also publish to social Feed as special achievement post
    createPost({
      type: 'conquista',
      content: `${achievement.title} - ${achievement.description}`,
      achievementData: {
        title: achievement.title,
        category: achievement.category,
        badgeIcon: achievement.badgeIcon,
        highlightText: achievement.metric || achievement.title,
      },
      images: achievement.image ? [achievement.image] : undefined,
    });

    showToast('Conquista registada e partilhada no Feed! 🏆');
  };

  const toggleFriend = (friendId: string) => {
    setFriends((prev) =>
      prev.map((friend) => {
        if (friend.id === friendId) {
          const isFriend = !friend.isFriend;
          showToast(isFriend ? `Pedido de amizade enviado a ${friend.name}!` : `Amizade com ${friend.name} atualizada`);
          return { ...friend, isFriend };
        }
        return friend;
      })
    );
  };

  return (
    <CommunityContext.Provider
      value={{
        isCommunityOpen,
        openCommunity,
        closeCommunity,
        activeTab,
        setActiveTab,
        posts,
        toggleReaction,
        addComment,
        addReply,
        toggleCommentLike,
        toggleSavePost,
        createPost,
        activeChallenges,
        receivedInvites,
        acceptInvite,
        declineInvite,
        createChallenge,
        selectedChallenge,
        setSelectedChallenge,
        achievements,
        toggleApplaudAchievement,
        shareAchievement,
        friends,
        toggleFriend,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity() {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
}
