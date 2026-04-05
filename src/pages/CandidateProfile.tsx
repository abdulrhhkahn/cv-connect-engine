import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useJobStore } from "@/lib/store";
import { CandidateProfile as ProfileType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, Save, X, Plus } from "lucide-react";
import { toast } from "sonner";

const CandidateProfilePage = () => {
  const { user } = useAuth();
  const { getProfile, updateProfile } = useJobStore();
  const profile = user ? getProfile(user.id) : null;

  const [form, setForm] = useState<Partial<ProfileType>>({
    name: "",
    email: "",
    title: "",
    summary: "",
    skills: [],
    experience: "",
    education: "",
  });
  const [newSkill, setNewSkill] = useState("");
  const [cvFile, setCvFile] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name,
        email: profile.email,
        title: profile.title,
        summary: profile.summary,
        skills: [...profile.skills],
        experience: profile.experience,
        education: profile.education,
      });
      setCvFile(profile.cvFileName || null);
    } else if (user) {
      setForm({
        name: user.name,
        email: user.email,
        title: "",
        summary: "",
        skills: [],
        experience: "",
        education: "",
      });
    }
  }, [profile, user]);

  const addSkill = () => {
    if (!newSkill.trim()) return;
    setForm({ ...form, skills: [...(form.skills || []), newSkill.trim()] });
    setNewSkill("");
  };

  const removeSkill = (skill: string) => {
    setForm({ ...form, skills: (form.skills || []).filter((s) => s !== skill) });
  };

  const handleCvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCvFile(file.name);
      toast.success(`CV "${file.name}" uploaded`);
    }
  };

  const save = () => {
    if (!user) return;
    updateProfile(user.id, {
      ...form,
      userId: user.id,
      cvFileName: cvFile || undefined,
    } as ProfileType);
    toast.success("Profile saved!");
  };

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-1">Your Profile</h1>
      <p className="text-sm text-muted-foreground mb-6">Keep your profile updated to get better job matches</p>

      <div className="glass-card rounded-xl p-6 space-y-5 animate-fade-in">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Full name</Label>
            <Input
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              value={form.email || ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label>Job title</Label>
          <Input
            value={form.title || ""}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Frontend Developer"
            className="mt-1"
          />
        </div>

        <div>
          <Label>Professional summary</Label>
          <Textarea
            value={form.summary || ""}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            placeholder="Brief overview of your background and strengths..."
            rows={3}
            className="mt-1"
          />
        </div>

        <div>
          <Label>Skills</Label>
          <div className="flex flex-wrap gap-1.5 mt-2 mb-2">
            {(form.skills || []).map((skill) => (
              <Badge key={skill} variant="secondary" className="gap-1">
                {skill}
                <button onClick={() => removeSkill(skill)} className="hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
              placeholder="Add a skill..."
              className="flex-1"
            />
            <Button variant="outline" size="sm" onClick={addSkill}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Experience</Label>
            <Input
              value={form.experience || ""}
              onChange={(e) => setForm({ ...form, experience: e.target.value })}
              placeholder="e.g. 4 years"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Education</Label>
            <Input
              value={form.education || ""}
              onChange={(e) => setForm({ ...form, education: e.target.value })}
              placeholder="e.g. B.Sc. Computer Science"
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label>CV / Resume</Label>
          <div className="mt-1">
            <label className="flex items-center gap-2 px-4 py-3 rounded-lg border border-dashed border-border cursor-pointer hover:bg-secondary/50 transition-colors">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {cvFile || "Upload your CV (PDF, DOC)"}
              </span>
              <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleCvUpload} />
            </label>
          </div>
        </div>

        <Button onClick={save} className="w-full">
          <Save className="h-4 w-4 mr-1" />
          Save Profile
        </Button>
      </div>
    </div>
  );
};

export default CandidateProfilePage;
