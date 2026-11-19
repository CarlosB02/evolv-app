import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  StudentProfile, 
  GymClass, 
  MedicalExam, 
  RecordedClass, 
  EducationalContent, 
  ReferralInvite, 
  DailyLogEntry, 
  AssessmentSubmission 
} from '../types';
import { initialStudentProfile, mockGymClasses, mockExams } from '../data';
import { 
  initialRecordedClasses, 
  initialEducationalContents, 
  initialReferralInvites, 
  initialWeeklyDailyLogs, 
  initialAssessmentSubmissions 
} from '../data/profileExtraData';

export interface AppSettings {
  pushNotifications: boolean;
  workoutReminders: boolean;
  language: 'PT' | 'EN' | 'ES';
  theme: 'dark' | 'light';
  zoomPercent: number; // 50 to 120
  textZoom?: 'small' | 'medium' | 'large';
  weightUnit: 'Kg' | 'Lbs';
  distanceUnit: 'Km' | 'Mi';
}

interface ProfileContextType {
  isProfileOpen: boolean;
  openProfile: () => void;
  closeProfile: () => void;
  student: StudentProfile;
  updateAvatar: (url: string) => void;
  updateName: (name: string) => void;
  gymClasses: GymClass[];
  toggleBookClass: (classId: string) => void;
  exams: MedicalExam[];
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  logout: () => void;
  isLoggedOut: boolean;
  reLogin: () => void;
  
  // Recorded Classes
  recordedClasses: RecordedClass[];
  toggleFavoriteClass: (id: string) => void;
  updateClassProgress: (id: string, progress: number) => void;
  markClassCompleted: (id: string) => void;
  
  // Educational Contents
  educationalContents: EducationalContent[];
  markContentAsRead: (id: string) => void;
  
  // Referral Program
  isReferralActive: boolean;
  setIsReferralActive: (active: boolean) => void;
  referralInvites: ReferralInvite[];
  addReferralInvite: (name: string, phoneOrEmail: string) => void;
  
  // Weekly Daily Logs
  weeklyDailyLogs: DailyLogEntry[];
  updateDailyLog: (dayId: string, updates: Partial<DailyLogEntry>) => void;
  
  // Physical Assessments
  assessmentSubmissions: AssessmentSubmission[];
  addAssessmentSubmission: (submission: Omit<AssessmentSubmission, 'id'>) => AssessmentSubmission;

  // Subscription Management
  cancelSubscription: (reason: string, notes?: string) => void;
  reactivateSubscription: () => void;
  toggleSimulateExpired: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [student, setStudent] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem('pr1me_student_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...initialStudentProfile,
          ...parsed,
          subscription: {
            ...initialStudentProfile.subscription,
            ...(parsed.subscription || {})
          }
        };
      } catch {
        return initialStudentProfile;
      }
    }
    return initialStudentProfile;
  });

  const [gymClasses, setGymClasses] = useState<GymClass[]>(mockGymClasses);
  const [exams] = useState<MedicalExam[]>(mockExams);
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const defaultSettings: AppSettings = {
    pushNotifications: true,
    workoutReminders: true,
    language: 'PT',
    theme: 'dark',
    zoomPercent: 100,
    textZoom: 'medium',
    weightUnit: 'Kg',
    distanceUnit: 'Km',
  };

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('pr1me_app_settings');
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  // Recorded Classes
  const [recordedClasses, setRecordedClasses] = useState<RecordedClass[]>(() => {
    const saved = localStorage.getItem('rteam_recorded_classes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialRecordedClasses;
      }
    }
    return initialRecordedClasses;
  });

  const toggleFavoriteClass = (id: string) => {
    setRecordedClasses(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, isFavorite: !c.isFavorite } : c);
      localStorage.setItem('rteam_recorded_classes', JSON.stringify(updated));
      return updated;
    });
  };

  const updateClassProgress = (id: string, progress: number) => {
    setRecordedClasses(prev => {
      const updated = prev.map(c => c.id === id ? { 
        ...c, 
        progressPercent: progress,
        completed: progress >= 100 ? true : c.completed
      } : c);
      localStorage.setItem('rteam_recorded_classes', JSON.stringify(updated));
      return updated;
    });
  };

  const markClassCompleted = (id: string) => {
    setRecordedClasses(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, progressPercent: 100, completed: true } : c);
      localStorage.setItem('rteam_recorded_classes', JSON.stringify(updated));
      return updated;
    });
  };

  // Educational Content
  const [educationalContents, setEducationalContents] = useState<EducationalContent[]>(() => {
    const saved = localStorage.getItem('rteam_educational_contents');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialEducationalContents;
      }
    }
    return initialEducationalContents;
  });

  const markContentAsRead = (id: string) => {
    setEducationalContents(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, isNew: false } : c);
      localStorage.setItem('rteam_educational_contents', JSON.stringify(updated));
      return updated;
    });
  };

  // Referral Program
  const [isReferralActive, setIsReferralActive] = useState<boolean>(true);
  const [referralInvites, setReferralInvites] = useState<ReferralInvite[]>(() => {
    const saved = localStorage.getItem('rteam_referral_invites');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialReferralInvites;
      }
    }
    return initialReferralInvites;
  });

  const addReferralInvite = (name: string, phoneOrEmail: string) => {
    const newInvite: ReferralInvite = {
      id: `ref-${Date.now()}`,
      name,
      phoneOrEmail,
      date: 'Hoje',
      status: 'Enviado',
    };
    setReferralInvites(prev => {
      const updated = [newInvite, ...prev];
      localStorage.setItem('rteam_referral_invites', JSON.stringify(updated));
      return updated;
    });
  };

  // Weekly Daily Logs
  const [weeklyDailyLogs, setWeeklyDailyLogs] = useState<DailyLogEntry[]>(() => {
    const saved = localStorage.getItem('rteam_weekly_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialWeeklyDailyLogs;
      }
    }
    return initialWeeklyDailyLogs;
  });

  const updateDailyLog = (dayId: string, updates: Partial<DailyLogEntry>) => {
    setWeeklyDailyLogs(prev => {
      const updated = prev.map(log => log.dayId === dayId ? { ...log, ...updates } : log);
      localStorage.setItem('rteam_weekly_logs', JSON.stringify(updated));
      return updated;
    });
  };

  // Physical Assessments
  const [assessmentSubmissions, setAssessmentSubmissions] = useState<AssessmentSubmission[]>(() => {
    const saved = localStorage.getItem('rteam_assessment_submissions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasLegacyPaths = parsed.some(
            (item: AssessmentSubmission) =>
              !item.isoDate ||
              Object.values(item.photos || {}).some(
                (url) =>
                  typeof url === 'string' &&
                  (url.includes('images.unsplash.com') ||
                    url.startsWith('/src/assets/'))
              )
          );
          if (!hasLegacyPaths) {
            return parsed;
          }
        }
      } catch {
        return initialAssessmentSubmissions;
      }
    }
    return initialAssessmentSubmissions;
  });

  const addAssessmentSubmission = (submission: Omit<AssessmentSubmission, 'id'>) => {
    const newSub: AssessmentSubmission = {
      ...submission,
      id: `sub-${Date.now()}`,
    };
    setAssessmentSubmissions(prev => {
      const updated = [newSub, ...prev];
      localStorage.setItem('rteam_assessment_submissions', JSON.stringify(updated));
      return updated;
    });
    return newSub;
  };

  const openProfile = () => setIsProfileOpen(true);
  const closeProfile = () => setIsProfileOpen(false);

  const updateAvatar = (newUrl: string) => {
    setStudent(prev => {
      const updated = { ...prev, avatarUrl: newUrl };
      localStorage.setItem('pr1me_student_profile', JSON.stringify(updated));
      return updated;
    });
  };

  const updateName = (newName: string) => {
    setStudent(prev => {
      const updated = { ...prev, name: newName };
      localStorage.setItem('pr1me_student_profile', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleBookClass = (classId: string) => {
    setGymClasses(prev =>
      prev.map(item => {
        if (item.id === classId) {
          const newBooked = !item.booked;
          return {
            ...item,
            booked: newBooked,
            spotsLeft: newBooked ? Math.max(0, item.spotsLeft - 1) : item.spotsLeft + 1,
          };
        }
        return item;
      })
    );
  };

  const updateSettings = (partial: Partial<AppSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...partial };
      localStorage.setItem('pr1me_app_settings', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    setIsLoggedOut(true);
    setIsProfileOpen(false);
  };

  const reLogin = () => {
    setIsLoggedOut(false);
  };

  const cancelSubscription = (reason: string, notes?: string) => {
    setStudent(prev => {
      const updated: StudentProfile = {
        ...prev,
        subscription: {
          ...prev.subscription,
          status: 'Cancelada',
          cancellationReason: reason,
          cancellationNotes: notes ? notes.trim() : '',
          cancelledAt: new Date().toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' }),
          accessUntil: prev.subscription.accessUntil || '26 Novembro 2026',
        }
      };
      localStorage.setItem('pr1me_student_profile', JSON.stringify(updated));
      return updated;
    });
  };

  const reactivateSubscription = () => {
    setStudent(prev => {
      const updated: StudentProfile = {
        ...prev,
        subscription: {
          ...prev.subscription,
          status: 'Ativa',
          cancellationReason: undefined,
          cancellationNotes: undefined,
          cancelledAt: undefined,
          isExpiredSimulated: false,
        }
      };
      localStorage.setItem('pr1me_student_profile', JSON.stringify(updated));
      return updated;
    });
  };

  const toggleSimulateExpired = () => {
    setStudent(prev => {
      const updated: StudentProfile = {
        ...prev,
        subscription: {
          ...prev.subscription,
          isExpiredSimulated: !prev.subscription.isExpiredSimulated,
        }
      };
      localStorage.setItem('pr1me_student_profile', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <ProfileContext.Provider
      value={{
        isProfileOpen,
        openProfile,
        closeProfile,
        student,
        updateAvatar,
        updateName,
        gymClasses,
        toggleBookClass,
        exams,
        settings,
        updateSettings,
        logout,
        isLoggedOut,
        reLogin,
        cancelSubscription,
        reactivateSubscription,
        toggleSimulateExpired,
        recordedClasses,
        toggleFavoriteClass,
        updateClassProgress,
        markClassCompleted,
        educationalContents,
        markContentAsRead,
        isReferralActive,
        setIsReferralActive,
        referralInvites,
        addReferralInvite,
        weeklyDailyLogs,
        updateDailyLog,
        assessmentSubmissions,
        addAssessmentSubmission,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
