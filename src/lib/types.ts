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
