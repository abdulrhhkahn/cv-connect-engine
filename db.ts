/**
 * db.ts — All Supabase database operations
 *
 * Column naming convention:
 *   DB (snake_case)  ←→  App types (camelCase)
 * Each mapX() function translates a raw DB row to the TypeScript type.
 */

import { supabase } from './supabase';
import type {
  Job, Application, CandidateProfile, CompanyProfile,
  Interview, Notification, ExportHistoryEntry,
} from './types';

// ── Mappers ──────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

function mapJob(r: Row): Job {
  return {
    id:                  r.id,
    companyId:           r.company_id,
    companyName:         r.company_name,
    title:               r.title,
    description:         r.description,
    requirements:        r.requirements        ?? [],
    preferredSkills:     r.preferred_skills    ?? [],
    experienceRequired:  r.experience_required ?? '',
    location:            r.location,
    type:                r.type,
    salary:              r.salary              ?? undefined,
    createdAt:           new Date(r.created_at),
    status:              r.status,
    industryExperience:  r.industry_experience ?? [],
    softSkills:          r.soft_skills         ?? [],
    culturalFit:         r.cultural_fit        ?? [],
  };
}

function mapApplication(r: Row): Application {
  return {
    id:             r.id,
    jobId:          r.job_id,
    candidateId:    r.candidate_id,
    candidateName:  r.candidate_name,
    status:         r.status,
    matchScore:     r.match_score   ?? 0,
    matchDetails:   r.match_details ?? '',
    appliedAt:      new Date(r.applied_at),
    decisionReason: r.decision_reason ?? undefined,
    improvements:   r.improvements  ?? [],
    missingSkills:  r.missing_skills ?? [],
  };
}

function mapCandidateProfile(r: Row): CandidateProfile {
  return {
    userId:              r.user_id,
    name:                r.name,
    email:               r.email,
    title:               r.title               ?? '',
    summary:             r.summary             ?? '',
    skills:              r.skills              ?? [],
    experience:          r.experience          ?? '',
    education:           r.education           ?? '',
    cvUrl:               r.cv_url              ?? undefined,
    cvFileName:          r.cv_file_name        ?? undefined,
    avatarUrl:           r.avatar_url          ?? undefined,
    phone:               r.phone               ?? undefined,
    linkedIn:            r.linked_in           ?? undefined,
    portfolio:           r.portfolio           ?? undefined,
    location:            r.location            ?? undefined,
    industryExperience:  r.industry_experience ?? [],
    softSkills:          r.soft_skills         ?? [],
    culturalFit:         r.cultural_fit        ?? [],
  };
}

function mapCompanyProfile(r: Row): CompanyProfile {
  return {
    userId:       r.user_id,
    companyName:  r.company_name,
    about:        r.about         ?? '',
    industry:     r.industry      ?? '',
    location:     r.location      ?? '',
    size:         r.size          ?? '',
    website:      r.website       ?? '',
    contactEmail: r.contact_email ?? '',
    contactPhone: r.contact_phone ?? '',
    logoUrl:      r.logo_url      ?? undefined,
    bannerUrl:    r.banner_url    ?? undefined,
    employees:    r.employees     ?? [],
    followers:    (r.followers ?? []).map(String),
  };
}

function mapInterview(r: Row): Interview {
  return {
    id:                   r.id,
    jobId:                r.job_id,
    applicationId:        r.application_id,
    companyId:            r.company_id,
    companyName:          r.company_name,
    candidateId:          r.candidate_id,
    candidateName:        r.candidate_name,
    jobTitle:             r.job_title,
    scheduledAt:          new Date(r.scheduled_at),
    durationMins:         r.duration_mins,
    mode:                 r.mode,
    location:             r.location             ?? undefined,
    notes:                r.notes                ?? undefined,
    status:               r.status,
    candidateConfirmed:   r.candidate_confirmed  ?? undefined,
    proposedBy:           r.proposed_by          ?? undefined,
    proposedAt:           r.proposed_at          ? new Date(r.proposed_at) : undefined,
    proposedDurationMins: r.proposed_duration_mins ?? undefined,
    proposedNote:         r.proposed_note        ?? undefined,
    cancellationReason:   r.cancellation_reason  ?? undefined,
    cancellationMessage:  r.cancellation_message ?? undefined,
    cancelledBy:          r.cancelled_by         ?? undefined,
    cancelledAt:          r.cancelled_at         ? new Date(r.cancelled_at) : undefined,
  };
}

function mapNotification(r: Row): Notification {
  return {
    id:        r.id,
    userId:    r.user_id,
    title:     r.title,
    message:   r.message,
    type:      r.type,
    link:      r.link ?? undefined,
    read:      r.read,
    createdAt: new Date(r.created_at),
  };
}

function mapExportHistory(r: Row): ExportHistoryEntry {
  return {
    id:          r.id,
    companyId:   r.company_id,
    jobSnapshot: r.job_snapshot as Job,
    shareUrl:    r.share_url,
    createdAt:   new Date(r.created_at),
    type:        r.type,
  };
}

// ── Jobs ─────────────────────────────────────────────────────

export async function fetchJobs(): Promise<Job[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapJob);
}

export async function insertJob(job: Job): Promise<Job> {
  const { data, error } = await supabase
    .from('jobs')
    .insert({
      id:                  job.id,
      company_id:          job.companyId,
      company_name:        job.companyName,
      title:               job.title,
      description:         job.description,
      requirements:        job.requirements,
      preferred_skills:    job.preferredSkills,
      experience_required: job.experienceRequired,
      location:            job.location,
      type:                job.type,
      salary:              job.salary ?? null,
      status:              job.status,
      industry_experience: job.industryExperience ?? [],
      soft_skills:         job.softSkills ?? [],
      cultural_fit:        job.culturalFit ?? [],
    })
    .select()
    .single();
  if (error) throw error;
  return mapJob(data);
}

export async function patchJob(id: string, updates: Partial<Job>): Promise<void> {
  const dbPatch: Record<string, unknown> = {};
  if (updates.title              !== undefined) dbPatch.title               = updates.title;
  if (updates.description        !== undefined) dbPatch.description         = updates.description;
  if (updates.requirements       !== undefined) dbPatch.requirements        = updates.requirements;
  if (updates.preferredSkills    !== undefined) dbPatch.preferred_skills    = updates.preferredSkills;
  if (updates.experienceRequired !== undefined) dbPatch.experience_required = updates.experienceRequired;
  if (updates.location           !== undefined) dbPatch.location            = updates.location;
  if (updates.type               !== undefined) dbPatch.type                = updates.type;
  if (updates.salary             !== undefined) dbPatch.salary              = updates.salary;
  if (updates.status             !== undefined) dbPatch.status              = updates.status;
  if (updates.industryExperience !== undefined) dbPatch.industry_experience = updates.industryExperience;
  if (updates.softSkills         !== undefined) dbPatch.soft_skills         = updates.softSkills;
  if (updates.culturalFit        !== undefined) dbPatch.cultural_fit        = updates.culturalFit;

  const { error } = await supabase.from('jobs').update(dbPatch).eq('id', id);
  if (error) throw error;
}

export async function removeJob(id: string): Promise<void> {
  const { error } = await supabase.from('jobs').delete().eq('id', id);
  if (error) throw error;
}

// ── Applications ─────────────────────────────────────────────

export async function fetchApplications(): Promise<Application[]> {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('applied_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapApplication);
}

export async function insertApplication(app: Application): Promise<Application> {
  const { data, error } = await supabase
    .from('applications')
    .insert({
      id:              app.id,
      job_id:          app.jobId,
      candidate_id:    app.candidateId,
      candidate_name:  app.candidateName,
      status:          app.status,
      match_score:     app.matchScore,
      match_details:   app.matchDetails,
      applied_at:      app.appliedAt.toISOString(),
      decision_reason: app.decisionReason ?? null,
      improvements:    app.improvements ?? [],
      missing_skills:  app.missingSkills ?? [],
    })
    .select()
    .single();
  if (error) throw error;
  return mapApplication(data);
}

export async function patchApplication(id: string, updates: Partial<Application>): Promise<void> {
  const dbPatch: Record<string, unknown> = {};
  if (updates.status          !== undefined) dbPatch.status           = updates.status;
  if (updates.matchScore      !== undefined) dbPatch.match_score      = updates.matchScore;
  if (updates.matchDetails    !== undefined) dbPatch.match_details    = updates.matchDetails;
  if (updates.decisionReason  !== undefined) dbPatch.decision_reason  = updates.decisionReason;
  if (updates.improvements    !== undefined) dbPatch.improvements     = updates.improvements;
  if (updates.missingSkills   !== undefined) dbPatch.missing_skills   = updates.missingSkills;

  const { error } = await supabase.from('applications').update(dbPatch).eq('id', id);
  if (error) throw error;
}

// ── Candidate Profiles ────────────────────────────────────────

export async function fetchCandidateProfiles(): Promise<CandidateProfile[]> {
  const { data, error } = await supabase.from('candidate_profiles').select('*');
  if (error) throw error;
  return (data ?? []).map(mapCandidateProfile);
}

export async function upsertCandidateProfile(profile: CandidateProfile): Promise<void> {
  const { error } = await supabase
    .from('candidate_profiles')
    .upsert({
      user_id:             profile.userId,
      name:                profile.name,
      email:               profile.email,
      title:               profile.title            ?? '',
      summary:             profile.summary          ?? '',
      skills:              profile.skills           ?? [],
      experience:          profile.experience       ?? '',
      education:           profile.education        ?? '',
      cv_url:              profile.cvUrl            ?? null,
      cv_file_name:        profile.cvFileName       ?? null,
      avatar_url:          profile.avatarUrl        ?? null,
      phone:               profile.phone            ?? null,
      linked_in:           profile.linkedIn         ?? null,
      portfolio:           profile.portfolio        ?? null,
      location:            profile.location         ?? null,
      industry_experience: profile.industryExperience ?? [],
      soft_skills:         profile.softSkills       ?? [],
      cultural_fit:        profile.culturalFit      ?? [],
    }, { onConflict: 'user_id' });
  if (error) throw error;
}

// ── Company Profiles ──────────────────────────────────────────

export async function fetchCompanyProfiles(): Promise<CompanyProfile[]> {
  const { data, error } = await supabase.from('company_profiles').select('*');
  if (error) throw error;
  return (data ?? []).map(mapCompanyProfile);
}

export async function upsertCompanyProfile(profile: CompanyProfile): Promise<void> {
  const { error } = await supabase
    .from('company_profiles')
    .upsert({
      user_id:       profile.userId,
      company_name:  profile.companyName,
      about:         profile.about         ?? '',
      industry:      profile.industry      ?? '',
      location:      profile.location      ?? '',
      size:          profile.size          ?? '',
      website:       profile.website       ?? '',
      contact_email: profile.contactEmail  ?? '',
      contact_phone: profile.contactPhone  ?? '',
      logo_url:      profile.logoUrl       ?? null,
      banner_url:    profile.bannerUrl     ?? null,
      employees:     profile.employees     ?? [],
      followers:     profile.followers     ?? [],
    }, { onConflict: 'user_id' });
  if (error) throw error;
}

export async function toggleFollowInDB(companyUserId: string, candidateUserId: string): Promise<void> {
  const { error } = await supabase.rpc('toggle_company_follow', {
    p_company_user_id:   companyUserId,
    p_candidate_user_id: candidateUserId,
  });
  if (error) throw error;
}

// ── Interviews ────────────────────────────────────────────────

export async function fetchInterviews(): Promise<Interview[]> {
  const { data, error } = await supabase
    .from('interviews')
    .select('*')
    .order('scheduled_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapInterview);
}

export async function insertInterview(iv: Interview): Promise<Interview> {
  const { data, error } = await supabase
    .from('interviews')
    .insert({
      id:             iv.id,
      job_id:         iv.jobId,
      application_id: iv.applicationId,
      company_id:     iv.companyId,
      company_name:   iv.companyName,
      candidate_id:   iv.candidateId,
      candidate_name: iv.candidateName,
      job_title:      iv.jobTitle,
      scheduled_at:   iv.scheduledAt.toISOString(),
      duration_mins:  iv.durationMins,
      mode:           iv.mode,
      location:       iv.location ?? null,
      notes:          iv.notes ?? null,
      status:         iv.status,
      candidate_confirmed: iv.candidateConfirmed ?? false,
    })
    .select()
    .single();
  if (error) throw error;
  return mapInterview(data);
}

export async function patchInterview(id: string, updates: Partial<Interview>): Promise<void> {
  const dbPatch: Record<string, unknown> = {};
  if (updates.status               !== undefined) dbPatch.status                  = updates.status;
  if (updates.scheduledAt          !== undefined) dbPatch.scheduled_at             = updates.scheduledAt.toISOString();
  if (updates.durationMins         !== undefined) dbPatch.duration_mins            = updates.durationMins;
  if (updates.mode                 !== undefined) dbPatch.mode                     = updates.mode;
  if (updates.location             !== undefined) dbPatch.location                 = updates.location;
  if (updates.notes                !== undefined) dbPatch.notes                    = updates.notes;
  if (updates.candidateConfirmed   !== undefined) dbPatch.candidate_confirmed      = updates.candidateConfirmed;
  if (updates.proposedBy           !== undefined) dbPatch.proposed_by              = updates.proposedBy;
  if (updates.proposedAt           !== undefined) dbPatch.proposed_at              = updates.proposedAt.toISOString();
  if (updates.proposedDurationMins !== undefined) dbPatch.proposed_duration_mins   = updates.proposedDurationMins;
  if (updates.proposedNote         !== undefined) dbPatch.proposed_note            = updates.proposedNote;
  if (updates.cancellationReason   !== undefined) dbPatch.cancellation_reason      = updates.cancellationReason;
  if (updates.cancellationMessage  !== undefined) dbPatch.cancellation_message     = updates.cancellationMessage;
  if (updates.cancelledBy          !== undefined) dbPatch.cancelled_by             = updates.cancelledBy;
  if (updates.cancelledAt          !== undefined) dbPatch.cancelled_at             = updates.cancelledAt.toISOString();

  const { error } = await supabase.from('interviews').update(dbPatch).eq('id', id);
  if (error) throw error;
}

// ── Notifications ─────────────────────────────────────────────

export async function fetchNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []).map(mapNotification);
}

export async function insertNotification(
  n: Omit<Notification, 'id' | 'read' | 'createdAt'> & Partial<Pick<Notification, 'id' | 'read' | 'createdAt'>>
): Promise<void> {
  const { error } = await supabase.from('notifications').insert({
    user_id: n.userId,
    title:   n.title,
    message: n.message,
    type:    n.type,
    link:    n.link ?? null,
    read:    n.read ?? false,
  });
  if (error) throw error;
}

export async function markNotificationReadById(id: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id);
  if (error) throw error;
}

export async function markAllNotificationsReadByUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);
  if (error) throw error;
}

// ── Export History ────────────────────────────────────────────

export async function fetchExportHistory(): Promise<ExportHistoryEntry[]> {
  const { data, error } = await supabase
    .from('export_history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data ?? []).map(mapExportHistory);
}

export async function insertExportHistory(entry: ExportHistoryEntry): Promise<void> {
  const { error } = await supabase.from('export_history').insert({
    id:           entry.id,
    company_id:   entry.companyId,
    job_snapshot: entry.jobSnapshot,
    share_url:    entry.shareUrl,
    type:         entry.type,
  });
  if (error) throw error;
}
