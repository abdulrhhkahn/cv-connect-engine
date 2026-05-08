import { useState, useCallback } from "react";
import { Job, Application, CandidateProfile, CompanyProfile, Interview, ExportHistoryEntry, Notification } from "./types";
import { mockJobs, mockApplications, mockCandidateProfiles, mockCompanyProfiles } from "./mock-data";

let globalJobs = [...mockJobs];
let globalApplications = [...mockApplications];
let globalProfiles = [...mockCandidateProfiles];
let globalCompanyProfiles = [...mockCompanyProfiles];
let globalInterviews: Interview[] = [];
let globalExportHistory: ExportHistoryEntry[] = [];
let globalNotifications: Notification[] = [];
let listeners: (() => void)[] = [];

const notify = () => listeners.forEach((l) => l());

export const useJobStore = () => {
  const [, setTick] = useState(0);
  const rerender = useCallback(() => setTick((t) => t + 1), []);

  useState(() => {
    listeners.push(rerender);
    return () => {
      listeners = listeners.filter((l) => l !== rerender);
    };
  });

  return {
    jobs: globalJobs,
    applications: globalApplications,
    profiles: globalProfiles,
    companyProfiles: globalCompanyProfiles,
    interviews: globalInterviews,
    exportHistory: globalExportHistory,
    notifications: globalNotifications,

    addNotification: (n: Omit<Notification, "id" | "read" | "createdAt"> & Partial<Pick<Notification, "id" | "read" | "createdAt">>) => {
      const full: Notification = {
        id: n.id || crypto.randomUUID(),
        read: n.read ?? false,
        createdAt: n.createdAt || new Date(),
        userId: n.userId,
        title: n.title,
        message: n.message,
        type: n.type,
        link: n.link,
      };
      globalNotifications = [full, ...globalNotifications].slice(0, 200);
      notify();
    },

    markNotificationRead: (id: string) => {
      globalNotifications = globalNotifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      notify();
    },

    markAllNotificationsRead: (userId: string) => {
      globalNotifications = globalNotifications.map((n) => (n.userId === userId ? { ...n, read: true } : n));
      notify();
    },

    addJob: (job: Job) => {
      globalJobs = [job, ...globalJobs];
      notify();
    },

    updateJob: (id: string, updates: Partial<Job>) => {
      globalJobs = globalJobs.map((j) => (j.id === id ? { ...j, ...updates } : j));
      notify();
    },

    deleteJob: (id: string) => {
      globalJobs = globalJobs.filter((j) => j.id !== id);
      notify();
    },

    addApplication: (app: Application) => {
      globalApplications = [app, ...globalApplications];
      notify();
    },

    updateApplication: (id: string, updates: Partial<Application>) => {
      globalApplications = globalApplications.map((a) => (a.id === id ? { ...a, ...updates } : a));
      notify();
    },

    updateProfile: (userId: string, updates: Partial<CandidateProfile>) => {
      const idx = globalProfiles.findIndex((p) => p.userId === userId);
      if (idx >= 0) {
        globalProfiles = globalProfiles.map((p) => (p.userId === userId ? { ...p, ...updates } : p));
      } else {
        globalProfiles = [...globalProfiles, { userId, ...updates } as CandidateProfile];
      }
      notify();
    },

    getProfile: (userId: string) => globalProfiles.find((p) => p.userId === userId),

    getCompanyProfile: (userId: string) => globalCompanyProfiles.find((p) => p.userId === userId),

    updateCompanyProfile: (userId: string, updates: Partial<CompanyProfile>) => {
      const idx = globalCompanyProfiles.findIndex((p) => p.userId === userId);
      if (idx >= 0) {
        globalCompanyProfiles = globalCompanyProfiles.map((p) => (p.userId === userId ? { ...p, ...updates } : p));
      } else {
        globalCompanyProfiles = [...globalCompanyProfiles, { userId, ...updates } as CompanyProfile];
      }
      notify();
    },

    toggleFollow: (companyUserId: string, candidateUserId: string) => {
      globalCompanyProfiles = globalCompanyProfiles.map((p) => {
        if (p.userId === companyUserId) {
          const followers = p.followers || [];
          const isFollowing = followers.includes(candidateUserId);
          return { ...p, followers: isFollowing ? followers.filter((f) => f !== candidateUserId) : [...followers, candidateUserId] };
        }
        return p;
      });
      notify();
    },

    addInterview: (interview: Interview) => {
      globalInterviews = [interview, ...globalInterviews];
      notify();
    },

    updateInterview: (id: string, updates: Partial<Interview>) => {
      globalInterviews = globalInterviews.map((i) => (i.id === id ? { ...i, ...updates } : i));
      notify();
    },

    cancelInterview: (id: string, reason?: string, cancelledBy?: "company" | "candidate") => {
      globalInterviews = globalInterviews.map((i) =>
        i.id === id
          ? { ...i, status: "cancelled", cancellationReason: reason, cancelledBy, cancelledAt: new Date() }
          : i
      );
      notify();
    },

    addExportHistory: (entry: ExportHistoryEntry) => {
      globalExportHistory = [entry, ...globalExportHistory].slice(0, 50);
      notify();
    },
  };
};
