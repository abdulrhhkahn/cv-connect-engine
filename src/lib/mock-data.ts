import { Job, CandidateProfile, Application, User } from "./types";

export const mockUsers: User[] = [
  { id: "c1", email: "hr@techcorp.com", name: "Sarah Chen", role: "company", company: "TechCorp" },
  { id: "u1", email: "alex@email.com", name: "Alex Rivera", role: "candidate" },
  { id: "u2", email: "jordan@email.com", name: "Jordan Kim", role: "candidate" },
];

export const mockJobs: Job[] = [
  {
    id: "j1",
    companyId: "c1",
    companyName: "TechCorp",
    title: "Senior Frontend Engineer",
    description: "We're looking for a senior frontend engineer to lead our design system team and build beautiful, performant web applications.",
    requirements: ["5+ years React/TypeScript experience", "Strong CSS/design systems knowledge", "Experience with testing frameworks", "Bachelor's in CS or equivalent"],
    preferredSkills: ["Next.js", "Figma", "Storybook", "GraphQL", "CI/CD pipelines"],
    experienceRequired: "5+ years",
    location: "San Francisco, CA",
    type: "full-time",
    salary: "$150k - $200k",
    createdAt: new Date("2024-03-15"),
    status: "active",
    industryExperience: ["SaaS", "B2B"],
    softSkills: ["Leadership", "Communication", "Mentoring"],
    culturalFit: ["Collaborative", "Growth-oriented", "Design-driven"],
  },
  {
    id: "j2",
    companyId: "c1",
    companyName: "TechCorp",
    title: "Backend Engineer",
    description: "Join our platform team to build scalable microservices and APIs that power millions of users.",
    requirements: ["3+ years backend development", "Experience with Node.js or Python", "Database design skills", "API design experience"],
    preferredSkills: ["Kubernetes", "AWS", "PostgreSQL", "Redis", "gRPC"],
    experienceRequired: "3+ years",
    location: "Remote",
    type: "remote",
    salary: "$120k - $170k",
    createdAt: new Date("2024-03-20"),
    status: "active",
    industryExperience: ["Cloud infrastructure", "Fintech"],
    softSkills: ["Problem-solving", "Autonomy", "Communication"],
    culturalFit: ["Remote-first", "Engineering excellence", "Data-driven"],
  },
];

export const mockCandidateProfiles: CandidateProfile[] = [
  {
    userId: "u1",
    name: "Alex Rivera",
    email: "alex@email.com",
    title: "Frontend Developer",
    summary: "Passionate frontend developer with 4 years of experience building modern web applications with React and TypeScript.",
    skills: ["React", "TypeScript", "CSS", "JavaScript", "HTML", "Git", "Tailwind CSS"],
    experience: "4 years",
    education: "B.Sc. Computer Science, UC Berkeley",
    industryExperience: ["SaaS", "E-commerce"],
    softSkills: ["Communication", "Teamwork"],
    culturalFit: ["Collaborative", "Growth-oriented"],
  },
  {
    userId: "u2",
    name: "Jordan Kim",
    email: "jordan@email.com",
    title: "Full Stack Developer",
    summary: "Full stack developer with 6 years of experience across frontend and backend technologies.",
    skills: ["React", "TypeScript", "Node.js", "Python", "PostgreSQL", "AWS", "Docker", "GraphQL", "Next.js"],
    experience: "6 years",
    education: "M.Sc. Software Engineering, Stanford",
    industryExperience: ["SaaS", "B2B", "Cloud infrastructure"],
    softSkills: ["Leadership", "Mentoring", "Problem-solving", "Communication"],
    culturalFit: ["Engineering excellence", "Collaborative", "Growth-oriented"],
  },
];

export const mockApplications: Application[] = [
  {
    id: "a1",
    jobId: "j1",
    candidateId: "u1",
    candidateName: "Alex Rivera",
    status: "pending",
    matchScore: 65,
    matchDetails: "Meets 3/4 core requirements. Missing: 5+ years experience (has 4). Has React/TypeScript but limited design systems experience.",
    appliedAt: new Date("2024-03-18"),
  },
  {
    id: "a2",
    jobId: "j1",
    candidateId: "u2",
    candidateName: "Jordan Kim",
    status: "shortlisted",
    matchScore: 92,
    matchDetails: "Exceeds experience requirement. Strong match across all core requirements and preferred skills including Next.js and GraphQL.",
    appliedAt: new Date("2024-03-19"),
  },
];
