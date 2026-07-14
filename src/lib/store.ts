/**
 * store.ts — React Query-backed store
 *
 * Public API is identical to the old in-memory store so no page changes needed.
 * All reads are cached by React Query; writes invalidate the relevant queries.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import * as db from './db';
import type {
  Job, Application, CandidateProfile, CompanyProfile,
  Interview, ExportHistoryEntry, Notification,
} from './types';

export const useJobStore = () => {
  const { user }  = useAuth();
  const qc        = useQueryClient();
  const uid       = user?.id;
  const isCompany = user?.role === 'company';

  // ── Queries ───────────────────────────────────────────────────

  const jobsQ = useQuery({
    queryKey: ['jobs', uid],
    queryFn:  db.fetchJobs,
    enabled:  !!uid,
    staleTime: 30_000,
  });

  const appsQ = useQuery({
    queryKey: ['applications', uid],
    queryFn:  db.fetchApplications,
    enabled:  !!uid,
    staleTime: 30_000,
  });

  const candidateProfilesQ = useQuery({
    queryKey: ['candidate_profiles'],
    queryFn:  db.fetchCandidateProfiles,
    enabled:  !!uid,
    staleTime: 60_000,
  });

  const companyProfilesQ = useQuery({
    queryKey: ['company_profiles'],
    queryFn:  db.fetchCompanyProfiles,
    enabled:  !!uid,
    staleTime: 60_000,
  });

  const interviewsQ = useQuery({
    queryKey: ['interviews', uid],
    queryFn:  db.fetchInterviews,
    enabled:  !!uid,
    staleTime: 30_000,
  });

  const exportHistoryQ = useQuery({
    queryKey: ['export_history', uid],
    queryFn:  db.fetchExportHistory,
    enabled:  !!uid && isCompany,
    staleTime: 60_000,
  });

  const notificationsQ = useQuery({
    queryKey: ['notifications', uid],
    queryFn:  () => db.fetchNotifications(uid!),
    enabled:  !!uid,
    staleTime: 15_000,
    refetchInterval: 30_000,
  });

  // ── Mutation helpers ─────────────────────────────────────────

  const inv = (keys: string[][]) =>
    keys.forEach((k) => qc.invalidateQueries({ queryKey: k }));

  const err =
    (label: string) => (e: unknown) => {
      console.error(label, e);
      toast.error(label);
    };

  // ── Jobs ──────────────────────────────────────────────────────

  const addJobMut = useMutation({
    mutationFn: db.insertJob,
    onSuccess:  () => inv([['jobs']]),
    onError:    err('Failed to save job'),
  });

  const updateJobMut = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Job> }) =>
      db.patchJob(id, updates),
    onSuccess: () => inv([['jobs']]),
    onError:   err('Failed to update job'),
  });

  const deleteJobMut = useMutation({
    mutationFn: db.removeJob,
    onSuccess:  () => inv([['jobs']]),
    onError:    err('Failed to delete job'),
  });

  // ── Applications ──────────────────────────────────────────────

  const addApplicationMut = useMutation({
    mutationFn: db.insertApplication,
    onSuccess:  () => inv([['applications']]),
    onError:    err('Failed to submit application'),
  });

  const updateApplicationMut = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Application> }) =>
      db.patchApplication(id, updates),
    onSuccess: () => inv([['applications']]),
    onError:   err('Failed to update application'),
  });

  // ── Profiles ──────────────────────────────────────────────────

  const profiles = candidateProfilesQ.data ?? [];

  const updateProfileMut = useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: Partial<CandidateProfile> }) => {
      const existing = profiles.find((p) => p.userId === userId) ?? {
        userId,
        name:  user?.name  ?? '',
        email: user?.email ?? '',
        title: '', summary: '', skills: [], experience: '', education: '',
        industryExperience: [], softSkills: [], culturalFit: [],
      } as CandidateProfile;
      return db.upsertCandidateProfile({ ...existing, ...updates });
    },
    onSuccess: () => inv([['candidate_profiles']]),
    onError:   err('Failed to save profile'),
  });

  const companyProfiles = companyProfilesQ.data ?? [];

  const updateCompanyProfileMut = useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: Partial<CompanyProfile> }) => {
      const existing = companyProfiles.find((p) => p.userId === userId) ?? {
        userId,
        companyName: user?.company ?? '',
        about: '', industry: '', location: '', size: '',
        website: '', contactEmail: user?.email ?? '', contactPhone: '',
        employees: [], followers: [],
      } as CompanyProfile;
      return db.upsertCompanyProfile({ ...existing, ...updates });
    },
    onSuccess: () => inv([['company_profiles']]),
    onError:   err('Failed to save company profile'),
  });

  const toggleFollowMut = useMutation({
    mutationFn: ({ companyUserId, candidateUserId }: { companyUserId: string; candidateUserId: string }) =>
      db.toggleFollowInDB(companyUserId, candidateUserId),
    onSuccess: () => inv([['company_profiles']]),
    onError:   err('Follow action failed'),
  });

  // ── Interviews ────────────────────────────────────────────────

  const addInterviewMut = useMutation({
    mutationFn: db.insertInterview,
    onSuccess:  () => inv([['interviews']]),
    onError:    err('Failed to schedule interview'),
  });

  const updateInterviewMut = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Interview> }) =>
      db.patchInterview(id, updates),
    onSuccess: () => inv([['interviews']]),
    onError:   err('Failed to update interview'),
  });

  const cancelInterviewMut = useMutation({
    mutationFn: ({
      id, reason, cancelledBy, message,
    }: { id: string; reason?: string; cancelledBy?: 'company' | 'candidate'; message?: string }) =>
      db.patchInterview(id, {
        status:              'cancelled',
        cancellationReason:  reason,
        cancellationMessage: message,
        cancelledBy,
        cancelledAt: new Date(),
      }),
    onSuccess: () => inv([['interviews']]),
    onError:   err('Failed to cancel interview'),
  });

  // ── Export history ────────────────────────────────────────────

  const addExportHistoryMut = useMutation({
    mutationFn: db.insertExportHistory,
    onSuccess:  () => inv([['export_history']]),
    onError:    err('Failed to save export history'),
  });

  // ── Notifications ─────────────────────────────────────────────

  const addNotificationMut = useMutation({
    mutationFn: db.insertNotification,
    onSuccess:  () => inv([['notifications']]),
    onError:    (e) => console.error('Notification insert failed:', e),
  });

  const markReadMut = useMutation({
    mutationFn: db.markNotificationReadById,
    onSuccess:  () => inv([['notifications', uid]]),
    onError:    (e) => console.error(e),
  });

  const markAllReadMut = useMutation({
    mutationFn: (userId: string) => db.markAllNotificationsReadByUser(userId),
    onSuccess:  () => inv([['notifications', uid]]),
    onError:    (e) => console.error(e),
  });

  // ── Public API (same shape as the old in-memory store) ───────

  return {
    // ── Data ──
    jobs:            jobsQ.data           ?? [],
    applications:    appsQ.data           ?? [],
    profiles,
    companyProfiles,
    interviews:      interviewsQ.data     ?? [],
    exportHistory:   exportHistoryQ.data  ?? [],
    notifications:   notificationsQ.data  ?? [],

    // Optional loading flag (new — pages can use this if they want)
    isLoading: jobsQ.isLoading || appsQ.isLoading,

    // ── Getters ──
    getProfile:        (userId: string) => profiles.find((p) => p.userId === userId),
    getCompanyProfile: (userId: string) => companyProfiles.find((p) => p.userId === userId),

    // ── Job mutations ──
    addJob:    (job: Job)                              => addJobMut.mutateAsync(job),
    updateJob: (id: string, updates: Partial<Job>)     => updateJobMut.mutate({ id, updates }),
    deleteJob: (id: string)                            => deleteJobMut.mutate(id),

    // ── Application mutations ──
    addApplication:    (app: Application)                            => addApplicationMut.mutate(app),
    updateApplication: (id: string, updates: Partial<Application>)  => updateApplicationMut.mutate({ id, updates }),

    // ── Profile mutations ──
    updateProfile:        (userId: string, updates: Partial<CandidateProfile>) => updateProfileMut.mutate({ userId, updates }),
    updateCompanyProfile: (userId: string, updates: Partial<CompanyProfile>)   => updateCompanyProfileMut.mutate({ userId, updates }),
    toggleFollow:         (companyUserId: string, candidateUserId: string)     => toggleFollowMut.mutate({ companyUserId, candidateUserId }),

    // ── Interview mutations ──
    addInterview:    (iv: Interview)                                 => addInterviewMut.mutate(iv),
    updateInterview: (id: string, updates: Partial<Interview>)       => updateInterviewMut.mutate({ id, updates }),
    cancelInterview: (id: string, reason?: string, cancelledBy?: 'company' | 'candidate', message?: string) =>
      cancelInterviewMut.mutate({ id, reason, cancelledBy, message }),

    // ── Export history mutations ──
    addExportHistory: (entry: ExportHistoryEntry) => addExportHistoryMut.mutate(entry),

    // ── Notification mutations ──
    addNotification:          (n: Omit<Notification, 'id' | 'read' | 'createdAt'> & Partial<Pick<Notification, 'id' | 'read' | 'createdAt'>>) =>
      addNotificationMut.mutate(n),
    markNotificationRead:     (id: string)     => markReadMut.mutate(id),
    markAllNotificationsRead: (userId: string) => markAllReadMut.mutate(userId),
  };
};
