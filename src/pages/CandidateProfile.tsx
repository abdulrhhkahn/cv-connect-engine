import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useJobStore } from "@/lib/store";
import { CandidateProfile as ProfileType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, Save, X, Plus, User, Phone, Globe, MapPin, Linkedin } from "lucide-react";
import { toast } from "sonner";
import TagInput from "@/components/TagInput";

const CandidateProfilePage = () => {
  const { user } = useAuth();
  const { getProfile, updateProfile } = useJobStore();
  const profile = user ? getProfile(user.id) : null;

  const [form, setForm] = useState<Partial<ProfileType>>({
    name: "", email: "", title: "", summary: "", skills: [],
    experience: "", education: "", phone: "", linkedIn: "", portfolio: "", location: "",
    industryExperience: [], softSkills: [], culturalFit: [],
  });
  const [cvFile, setCvFile] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name, email: profile.email, title: profile.title,
        summary: profile.summary, skills: [...profile.skills],
        experience: profile.experience, education: profile.education,
        phone: profile.phone || "", linkedIn: profile.linkedIn || "",
        portfolio: profile.portfolio || "", location: profile.location || "",
        industryExperience: [...(profile.industryExperience || [])],
        softSkills: [...(profile.softSkills || [])],
        culturalFit: [...(profile.culturalFit || [])],
      });
      setCvFile(profile.cvFileName || null);
      setAvatarPreview(profile.avatarUrl || null);
    } else if (user) {
      setForm({
        name: user.name, email: user.email, title: "", summary: "",
        skills: [], experience: "", education: "",
        phone: "", linkedIn: "", portfolio: "", location: "",
        industryExperience: [], softSkills: [], culturalFit: [],
      });
    }
  }, [profile, user]);

  const parseCvText = async (file: File): Promise<string> => {
    // Best-effort text extraction. PDFs/DOCs are binary; we read as text and
    // also fall back to the file name. Real parsing would happen server-side.
    try {
      const text = await file.text();
      return text;
    } catch {
      return file.name;
    }
  };

  const extractFromCv = (text: string) => {
    const lower = text.toLowerCase();
    const data: Partial<ProfileType> = {};

    const emailMatch = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
    if (emailMatch) data.email = emailMatch[0];

    const phoneMatch = text.match(/(\+?\d[\d\s().-]{7,}\d)/);
    if (phoneMatch) data.phone = phoneMatch[0].trim();

    const linkedInMatch = text.match(/(linkedin\.com\/in\/[\w-]+)/i);
    if (linkedInMatch) data.linkedIn = linkedInMatch[0];

    const portfolioMatch = text.match(/https?:\/\/(?!.*linkedin)[\w.-]+\.[a-z]{2,}[\w/.-]*/i);
    if (portfolioMatch) data.portfolio = portfolioMatch[0];

    // Naive name: first non-empty line that looks like a person name
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const nameLine = lines.find((l) => /^[A-Z][a-z]+(\s[A-Z][a-z'-]+){1,3}$/.test(l));
    if (nameLine) data.name = nameLine;

    // Common skills lookup
    const skillVocab = [
      "React", "TypeScript", "JavaScript", "Node.js", "Python", "Java", "Go", "Ruby",
      "PostgreSQL", "MySQL", "MongoDB", "Redis", "GraphQL", "REST", "Docker", "Kubernetes",
      "AWS", "GCP", "Azure", "Tailwind", "Next.js", "Vue", "Angular", "Swift", "Kotlin",
      "Figma", "SQL", "TensorFlow", "PyTorch", "Git", "CI/CD",
    ];
    const foundSkills = skillVocab.filter((s) => new RegExp(`\\b${s.replace(/[.+]/g, "\\$&")}\\b`, "i").test(text));
    if (foundSkills.length) data.skills = foundSkills;

    // Years of experience
    const expMatch = text.match(/(\d+)\+?\s*years?\s+(of\s+)?experience/i);
    if (expMatch) data.experience = `${expMatch[1]}+ years`;

    // Education hint
    const eduMatch = text.match(/(B\.?Sc\.?|M\.?Sc\.?|B\.?A\.?|M\.?A\.?|MBA|Ph\.?D\.?|Bachelor|Master)[^\n,]{0,80}/i);
    if (eduMatch) data.education = eduMatch[0].trim();

    // Title heuristic
    const titleMatch = text.match(/(senior|junior|lead|principal|staff)?\s*(software|frontend|backend|full[\s-]?stack|data|product|ux|ui|devops|mobile)\s*(engineer|developer|designer|scientist|manager)/i);
    if (titleMatch) data.title = titleMatch[0].replace(/\s+/g, " ").trim();

    // Industry hints
    const industryHints = ["SaaS", "Fintech", "Healthcare", "E-commerce", "Education", "Gaming", "AI/ML"];
    const foundIndustries = industryHints.filter((i) => lower.includes(i.toLowerCase()));
    if (foundIndustries.length) data.industryExperience = foundIndustries;

    // Soft skills
    const softVocab = ["Leadership", "Communication", "Teamwork", "Collaboration", "Problem-solving", "Adaptability", "Mentoring", "Empathy"];
    const foundSoft = softVocab.filter((s) => lower.includes(s.toLowerCase()));
    if (foundSoft.length) data.softSkills = foundSoft;

    return data;
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCvFile(file.name);
    toast.success(`CV "${file.name}" uploaded`);

    const text = await parseCvText(file);
    const extracted = extractFromCv(text);

    // Only fill fields that are currently empty
    setForm((prev) => {
      const merged: Partial<ProfileType> = { ...prev };
      const isEmpty = (v: unknown) => v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);
      let filled = 0;
      (Object.keys(extracted) as (keyof ProfileType)[]).forEach((k) => {
        if (isEmpty(merged[k])) {
          (merged as Record<string, unknown>)[k] = extracted[k];
          filled++;
        }
      });
      if (filled > 0) toast.success(`Auto-filled ${filled} field${filled === 1 ? "" : "s"} from your CV`);
      return merged;
    });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => { setAvatarPreview(ev.target?.result as string); };
      reader.readAsDataURL(file);
      toast.success("Profile image updated");
    }
  };

  const setField = (key: keyof ProfileType, value: unknown) => setForm({ ...form, [key]: value });

  const save = () => {
    if (!user) return;
    updateProfile(user.id, {
      ...form, userId: user.id,
      cvFileName: cvFile || undefined,
      avatarUrl: avatarPreview || undefined,
    } as ProfileType);
    toast.success("Profile saved!");
  };

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-1">Your Profile</h1>
      <p className="text-sm text-muted-foreground mb-6">Keep your profile updated to get better job matches</p>

      <div className="glass-card rounded-xl p-6 space-y-5 animate-fade-in">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <label className="relative cursor-pointer group">
            <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center overflow-hidden border-2 border-border group-hover:border-primary transition-colors">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <User className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Upload className="h-5 w-5 text-white" />
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          </label>
          <div>
            <p className="font-semibold">{form.name || "Your Name"}</p>
            <p className="text-sm text-muted-foreground">{form.title || "Your Title"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><Label>Full name</Label><Input value={form.name || ""} onChange={(e) => setField("name", e.target.value)} className="mt-1" /></div>
          <div><Label>Email</Label><Input value={form.email || ""} onChange={(e) => setField("email", e.target.value)} className="mt-1" /></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Phone</Label>
            <Input value={form.phone || ""} onChange={(e) => setField("phone", e.target.value)} placeholder="+1 (555) 000-0000" className="mt-1" />
          </div>
          <div>
            <Label className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Location</Label>
            <Input value={form.location || ""} onChange={(e) => setField("location", e.target.value)} placeholder="City, State" className="mt-1" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="flex items-center gap-1.5"><Linkedin className="h-3.5 w-3.5" /> LinkedIn</Label>
            <Input value={form.linkedIn || ""} onChange={(e) => setField("linkedIn", e.target.value)} placeholder="linkedin.com/in/..." className="mt-1" />
          </div>
          <div>
            <Label className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5" /> Portfolio</Label>
            <Input value={form.portfolio || ""} onChange={(e) => setField("portfolio", e.target.value)} placeholder="yoursite.com" className="mt-1" />
          </div>
        </div>

        <div>
          <Label>Job title</Label>
          <Input value={form.title || ""} onChange={(e) => setField("title", e.target.value)} placeholder="e.g. Frontend Developer" className="mt-1" />
        </div>

        <div>
          <Label>Professional summary</Label>
          <Textarea value={form.summary || ""} onChange={(e) => setField("summary", e.target.value)} placeholder="Brief overview of your background and strengths..." rows={3} className="mt-1" />
        </div>

        <TagInput label="Skills" tags={form.skills || []} onAdd={(t) => setField("skills", [...(form.skills || []), t])} onRemove={(t) => setField("skills", (form.skills || []).filter(s => s !== t))} placeholder="Add a skill..." />
        <TagInput label="Industry Experience" tags={form.industryExperience || []} onAdd={(t) => setField("industryExperience", [...(form.industryExperience || []), t])} onRemove={(t) => setField("industryExperience", (form.industryExperience || []).filter(s => s !== t))} placeholder="e.g. SaaS, Fintech..." />
        <TagInput label="Soft Skills" tags={form.softSkills || []} onAdd={(t) => setField("softSkills", [...(form.softSkills || []), t])} onRemove={(t) => setField("softSkills", (form.softSkills || []).filter(s => s !== t))} placeholder="e.g. Leadership, Communication..." />
        <TagInput label="Cultural Preferences" tags={form.culturalFit || []} onAdd={(t) => setField("culturalFit", [...(form.culturalFit || []), t])} onRemove={(t) => setField("culturalFit", (form.culturalFit || []).filter(s => s !== t))} placeholder="e.g. Collaborative, Remote-first..." />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><Label>Experience</Label><Input value={form.experience || ""} onChange={(e) => setField("experience", e.target.value)} placeholder="e.g. 4 years" className="mt-1" /></div>
          <div><Label>Education</Label><Input value={form.education || ""} onChange={(e) => setField("education", e.target.value)} placeholder="e.g. B.Sc. Computer Science" className="mt-1" /></div>
        </div>

        <div>
          <Label>CV / Resume</Label>
          <div className="mt-1">
            <label className="flex items-center gap-2 px-4 py-3 rounded-lg border border-dashed border-border cursor-pointer hover:bg-secondary/50 transition-colors">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{cvFile || "Upload your CV (PDF, DOC)"}</span>
              <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleCvUpload} />
            </label>
          </div>
        </div>

        <Button onClick={save} className="w-full"><Save className="h-4 w-4 mr-1" /> Save Profile</Button>
      </div>
    </div>
  );
};

export default CandidateProfilePage;
