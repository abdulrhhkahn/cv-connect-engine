export type UserRole = "company" | "candidate";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  company?: string;
  avatar?: string;
}

export interface CompanyProfile {
  userId: string;
  companyName: string;
  about: string;
  industry: string;
  location: string;
  size: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
  logoUrl?: string;
  bannerUrl?: string;
  employees: { name: string; title: string; avatarUrl?: string }[];
  followers: string[]; // candidate user IDs
}

export interface Job {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  description: string;
  requirements: string[];
  preferredSkills: string[];
  experienceRequired: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "remote";
  salary?: string;
  createdAt: Date;
  status: "draft" | "active" | "closed";
  industryExperience?: string[];
  softSkills?: string[];
  culturalFit?: string[];
}

export interface CandidateProfile {
  userId: string;
  name: string;
  email: string;
  title: string;
  summary: string;
  skills: string[];
  experience: string;
  education: string;
  cvUrl?: string;
  cvFileName?: string;
  avatarUrl?: string;
  phone?: string;
  linkedIn?: string;
  portfolio?: string;
  location?: string;
  industryExperience?: string[];
  softSkills?: string[];
  culturalFit?: string[];
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  candidateName: string;
  status: "pending" | "reviewed" | "shortlisted" | "rejected";
  matchScore: number;
  matchDetails: string;
  appliedAt: Date;
  decisionReason?: string;
  improvements?: string[];
  missingSkills?: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  jobData?: Partial<Job>;
}

export interface Interview {
  id: string;
  jobId: string;
  applicationId: string;
  companyId: string;
  companyName: string;
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  scheduledAt: Date;
  durationMins: number;
  mode: "video" | "phone" | "onsite";
  location?: string; // meeting link / address / phone number
  notes?: string;
  status: "scheduled" | "completed" | "cancelled";
}

export interface ExportHistoryEntry {
  id: string;
  companyId: string;
  jobSnapshot: Job;
  shareUrl: string;
  createdAt: Date;
  type: "share-link" | "pdf";
}
