export type CommunityTab = 'feed' | 'desafios' | 'conquistas';

export type ChallengeSubTab = 'geral' | 'desafios';

export type ChallengePeriod = 'semana' | 'mes' | 'historico';

export type AchievementFilter = 'todas' | 'recordes' | 'consistencia' | 'objetivos';

export type ReactionEmoji = 'heart' | 'fire' | 'applause' | 'muscle' | 'rocket';

export interface CommunityAuthor {
  id: string;
  name: string;
  avatarUrl: string;
  role?: string; // 'Atleta RTEAM' | 'Coach' | 'Atleta Elite'
  level?: number;
}

export interface CommunityCommentReply {
  id: string;
  author: CommunityAuthor;
  text: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
}

export interface CommunityComment {
  id: string;
  author: CommunityAuthor;
  text: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
  replies?: CommunityCommentReply[];
}

export interface PRDetails {
  exercise: string;
  newWeight: number;
  previousWeight: number;
  reps: number;
  diffKg: number;
  diffPercent: number;
}

export interface AchievementDetails {
  title: string;
  category: 'recordes' | 'consistencia' | 'objetivos';
  badgeIcon: string;
  highlightText: string;
}

export interface CommunityPost {
  id: string;
  author: CommunityAuthor;
  timestamp: string;
  type: 'text' | 'image' | 'multi_image' | 'video' | 'pr' | 'conquista';
  content: string;
  images?: string[];
  videoDuration?: string;
  videoThumbnail?: string;
  prData?: PRDetails;
  achievementData?: AchievementDetails;
  reactions: Record<ReactionEmoji, number>;
  userReaction?: ReactionEmoji | null;
  comments: CommunityComment[];
  isSaved?: boolean;
}

export interface ChallengeLeaderboardEntry {
  rank: number;
  name: string;
  avatarUrl: string;
  score: number;
  scoreUnit: string;
  progressPercent: number;
  isUser?: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'workouts' | 'steps' | 'cardio' | 'consistency';
  targetValue: number;
  targetUnit: string;
  userProgress: number;
  daysRemaining: number;
  totalDays: number;
  participantsCount: number;
  participantAvatars: string[];
  userRank: number;
  isReceivedInvite?: boolean;
  invitedBy?: {
    name: string;
    avatarUrl: string;
  };
  leaderboard: ChallengeLeaderboardEntry[];
}

export interface LeaderboardAthlete {
  rank: number;
  name: string;
  avatarUrl: string;
  points: number;
  change: number; // >0 for up, <0 for down, 0 for equal
  level: number;
  badge: string;
  isUser?: boolean;
}

export interface PointRule {
  id: string;
  activity: string;
  points: number;
  iconName: string;
  frequency: string;
}

export interface CommunityAchievement {
  id: string;
  title: string;
  category: 'recordes' | 'consistencia' | 'objetivos';
  description: string;
  date: string;
  author: CommunityAuthor;
  badgeIcon: string;
  badgeGradient: string;
  applauseCount: number;
  hasApplauded?: boolean;
  metric?: string;
  image?: string;
}

export interface CommunityFriend {
  id: string;
  name: string;
  avatarUrl: string;
  level: number;
  isFriend: boolean;
  status: string;
}
