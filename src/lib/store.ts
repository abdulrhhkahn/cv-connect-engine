import { useState, useCallback } from "react";
import { Job, Application, CandidateProfile, CompanyProfile, Interview, ExportHistoryEntry } from "./types";
import { mockJobs, mockApplications, mockCandidateProfiles, mockCompanyProfiles } from "./mock-data";

let globalJobs = [...mockJobs];
let globalApplications = [...mockApplications];
let globalProfiles = [...mockCandidateProfiles];
let globalCompanyProfiles = [...mockCompanyProfiles];
let globalInterviews: Interview[] = [];
let globalExportHistory: ExportHistoryEntry[] = [];
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

    cancelInterview: (id: string) => {
      globalInterviews = globalInterviews.map((i) => (i.id === id ? { ...i, status: "cancelled" } : i));
      notify();
    },

    addExportHistory: (entry: ExportHistoryEntry) => {
      globalExportHistory = [entry, ...globalExportHistory].slice(0, 50);
      notify();
    },
  };
};
