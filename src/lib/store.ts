import { useState, useCallback } from "react";
import { Job, Application, CandidateProfile } from "./types";
import { mockJobs, mockApplications, mockCandidateProfiles } from "./mock-data";

// Simple global state (replace with proper state management later)
let globalJobs = [...mockJobs];
let globalApplications = [...mockApplications];
let globalProfiles = [...mockCandidateProfiles];
let listeners: (() => void)[] = [];

const notify = () => listeners.forEach((l) => l());

export const useJobStore = () => {
  const [, setTick] = useState(0);
  const rerender = useCallback(() => setTick((t) => t + 1), []);

  // Subscribe to changes
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
  };
};
