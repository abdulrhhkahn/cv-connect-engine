import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useJobStore } from "@/lib/store";
import { Job } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, Trash2, Globe, Archive, Plus, Upload, Star, Zap } from "lucide-react";
import PricingModal from "@/components/PricingModal";
import FeaturedJobModal from "@/components/FeaturedJobModal";
import { PLANS, Plan, canAddJob, isFeaturedActive } from "@/lib/billing";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { extractTextFromFile } from "@/lib/document-parser";

// Lightweight JD parser — extracts title/description/requirements/preferred skills from raw text
const parseJobDescription = (text: string, companyId: string, companyName: string): Job => {
  const clean = text.replace(/\r/g, "").trim();
  const lines = clean.split("\n").map((l) => l.trim()).filter(Boolean);

  // Title: first non-empty line, or first line under "Title:" / "Position:" / "Role:"
  let title = lines[0]?.slice(0, 80) || "Untitled role";
  const labeledTitle = clean.match(/^(?:title|position|role|job\s*title)\s*[:\-]\s*(.+)$/im);
  if (labeledTitle) title = labeledTitle[1].trim().slice(0, 80);

  // Section split helpers
  const sectionRegex = (names: string[]) =>
    new RegExp(
      `(?:^|\\n)\\s*(?:${names.join("|")})\\s*[:\\-]?\\s*\\n([\\s\\S]*?)(?=\\n\\s*(?:requirements?|qualifications?|responsibilities|about|description|preferred|nice\\s*to\\s*have|skills?|benefits?|what\\s*we\\s*offer|location|salary|compensation|experience)\\s*[:\\-]?\\s*\\n|$)`,
      "i"
    );

  const grabBullets = (block: string | undefined) => {
    if (!block) return [];
    return block
      .split("\n")
      .map((l) => l.replace(/^[-•*·\u2022]\s*/, "").replace(/^\d+[.)]\s*/, "").trim())
      .filter((l) => l.length > 2 && l.length < 240)
      .slice(0, 12);
  };

  const reqBlock = clean.match(sectionRegex(["requirements?", "qualifications?", "must\\s*have", "what\\s*you'?ll\\s*need"]));
  const prefBlock = clean.match(sectionRegex(["preferred", "nice\\s*to\\s*have", "bonus", "good\\s*to\\s*have"]));
  const descBlock = clean.match(sectionRegex(["about\\s*the\\s*role", "description", "overview", "summary", "responsibilities"]));

  const requirements = grabBullets(reqBlock?.[1]);
  const preferredSkills = grabBullets(prefBlock?.[1]);
  let description = (descBlock?.[1] || "").trim();
  if (!description) {
    // fall back to first 2-3 paragraphs after the title
    description = lines.slice(1, 6).join(" ").slice(0, 600);
  }

  const lower = clean.toLowerCase();
  const salaryMatch = clean.match(/\$[\d,]+\s*[kK]?\s*[-–to]+\s*\$?[\d,]+\s*[kK]?/);
  const locMatch =
    clean.match(/^location\s*[:\-]\s*(.+)$/im)?.[1]?.trim() ||
    (lower.includes("remote") ? "Remote" : lower.includes("hybrid") ? "Hybrid" : "On-site");
  const expMatch = clean.match(/(\d+\+?\s*(?:-\s*\d+)?\s*years?)/i)?.[1] || "Not specified";

  return {
    id: crypto.randomUUID(),
    companyId,
    companyName,
    title,
    description: description || `We're hiring a ${title}.`,
    requirements: requirements.length ? requirements : ["Relevant experience for this role"],
    preferredSkills,
    experienceRequired: expMatch,
    location: locMatch,
    type: lower.includes("contract")
      ? "contract"
      : lower.includes("part-time") || lower.includes("part time")
      ? "part-time"
      : lower.includes("remote")
      ? "remote"
      : "full-time",
    salary: salaryMatch ? salaryMatch[0] : undefined,
    createdAt: new Date(),
    status: "draft",
    industryExperience: [],
    softSkills: [],
    culturalFit: [],
  };
};

const statusColors: Record<string, string> = {
  draft: "bg-secondary text-secondary-foreground",
  active: "match-badge-high",
  closed: "match-badge-low",
};

const CompanyJobs = () => {
  const { user } = useAuth();
  const { jobs, addJob, updateJob, deleteJob, getCompanyProfile } = useJobStore();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editForm, setEditForm] = useState<Partial<Job>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const companyProfile = user ? getCompanyProfile(user.id) : null;
  const plan: Plan = (companyProfile?.plan ?? 'free') as Plan;
  const activeJobCount = jobs.filter((j) => j.companyId === user?.id && j.status === 'active').length;
  const atLimit = !canAddJob(plan, activeJobCount);

  const [showPricing, setShowPricing]   = useState(false);
  const [featuringJob, setFeaturingJob] = useState<typeof jobs[0] | null>(null);

  const myJobs = jobs.filter((j) => j.companyId === user?.id);

  const openEdit = (job: Job) => {
    setEditingJob(job);
    setEditForm({
      title: job.title,
      description: job.description,
      requirements: [...job.requirements],
      preferredSkills: [...job.preferredSkills],
      experienceRequired: job.experienceRequired,
      location: job.location,
      salary: job.salary,
      industryExperience: [...(job.industryExperience || [])],
      softSkills: [...(job.softSkills || [])],
      culturalFit: [...(job.culturalFit || [])],
    });
  };

  const saveEdit = () => {
    if (!editingJob) return;
    updateJob(editingJob.id, editForm);
    setEditingJob(null);
  };

  // Open editor when arriving via ?edit=<jobId>
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (editId) {
      const job = jobs.find((j) => j.id === editId && j.companyId === user?.id);
      if (job) openEdit(job);
      const next = new URLSearchParams(searchParams);
      next.delete("edit");
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, jobs.length]);

  const handleUpload = async (file: File) => {
    if (!user) return;
    const supported = /\.(txt|md|markdown|pdf|docx)$/i.test(file.name);
    if (!supported) {
      toast.error("Unsupported file. Use .txt, .md, .pdf or .docx");
      return;
    }
    const t = toast.loading("Extracting job description…");
    try {
      const text = await extractTextFromFile(file);
      if (!text.trim()) {
        toast.error("No text could be extracted", { id: t });
        return;
      }
      const job = parseJobDescription(text, user.id, user.company || user.name);
      try {
        await addJob(job);
        openEdit(job);
        toast.success("Job description imported — review and publish", { id: t });
      } catch {
        toast.error("Failed to create job", { id: t });
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not read file", { id: t });
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 gap-2 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Job Postings</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${PLANS[plan].badge}`}>
              {PLANS[plan].label}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {activeJobCount} / {PLANS[plan].jobLimit === Infinity ? '∞' : PLANS[plan].jobLimit} active jobs
            {atLimit && (
              <button
                type="button"
                className="ml-2 text-primary hover:underline font-medium"
                onClick={() => setShowPricing(true)}
              >
                Upgrade
              </button>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md,.markdown,.pdf,.docx,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
              e.target.value = "";
            }}
          />
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4 mr-1" />
            Upload JD
          </Button>
          <Button
            onClick={() => atLimit ? setShowPricing(true) : navigate("/dashboard")}
            variant={atLimit ? "outline" : "default"}
          >
            {atLimit ? <Zap className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
            {atLimit ? "Upgrade to post more" : "New via Chat"}
          </Button>
        </div>
      </div>

      {myJobs.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>No jobs yet. Use the Chat to create your first job posting.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myJobs.map((job) => (
            <div key={job.id} className="glass-card rounded-xl p-5 animate-fade-in">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold truncate">{job.title}</h3>
                    <Badge variant="secondary" className={statusColors[job.status]}>
                      {job.status}
                    </Badge>
                    {isFeaturedActive(job) && (
                      <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-400/40 gap-1 text-xs">
                        <Star className="h-3 w-3 fill-current" /> Featured
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{job.description}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{job.location}</span>
                    <span>·</span>
                    <span>{job.type}</span>
                    <span>·</span>
                    <span>{job.experienceRequired}</span>
                    {job.salary && <><span>·</span><span>{job.salary}</span></>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {job.status === "draft" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateJob(job.id, { status: "active" })}
                      title="Publish"
                    >
                      <Globe className="h-4 w-4" />
                    </Button>
                  )}
                  {job.status === "active" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateJob(job.id, { status: "closed" })}
                      title="Close"
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  )}
                  {job.status === 'active' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className={isFeaturedActive(job) ? "text-yellow-500" : ""}
                      onClick={() => setFeaturingJob(job)}
                      title={isFeaturedActive(job) ? "Extend featured listing" : "Feature this job"}
                    >
                      <Star className={`h-4 w-4 ${isFeaturedActive(job) ? "fill-current" : ""}`} />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => openEdit(job)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => deleteJob(job.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <PricingModal
        open={showPricing}
        onOpenChange={setShowPricing}
        currentPlan={plan}
        reason={atLimit ? `You've reached the ${PLANS[plan].jobLimit}-job limit on the ${PLANS[plan].label} plan.` : undefined}
      />
      <FeaturedJobModal
        open={!!featuringJob}
        onOpenChange={(o) => !o && setFeaturingJob(null)}
        job={featuringJob}
      />
      <Dialog open={!!editingJob} onOpenChange={(o) => !o && setEditingJob(null)}>
        <DialogContent className="w-full max-w-lg max-h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={editForm.title || ""}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={editForm.description || ""}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={4}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Requirements (one per line)</Label>
              <Textarea
                value={(editForm.requirements || []).join("\n")}
                onChange={(e) => setEditForm({ ...editForm, requirements: e.target.value.split("\n").filter(Boolean) })}
                rows={4}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Preferred Skills (one per line)</Label>
              <Textarea
                value={(editForm.preferredSkills || []).join("\n")}
                onChange={(e) => setEditForm({ ...editForm, preferredSkills: e.target.value.split("\n").filter(Boolean) })}
                rows={3}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Experience</Label>
                <Input
                  value={editForm.experienceRequired || ""}
                  onChange={(e) => setEditForm({ ...editForm, experienceRequired: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  value={editForm.location || ""}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Salary (optional)</Label>
              <Input
                value={editForm.salary || ""}
                onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Industry Experience (one per line)</Label>
              <Textarea
                value={(editForm.industryExperience || []).join("\n")}
                onChange={(e) => setEditForm({ ...editForm, industryExperience: e.target.value.split("\n").filter(Boolean) })}
                rows={2}
                placeholder="e.g. SaaS, Fintech, Healthcare"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Soft Skills (one per line)</Label>
              <Textarea
                value={(editForm.softSkills || []).join("\n")}
                onChange={(e) => setEditForm({ ...editForm, softSkills: e.target.value.split("\n").filter(Boolean) })}
                rows={2}
                placeholder="e.g. Leadership, Communication, Mentoring"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Cultural Fit (one per line)</Label>
              <Textarea
                value={(editForm.culturalFit || []).join("\n")}
                onChange={(e) => setEditForm({ ...editForm, culturalFit: e.target.value.split("\n").filter(Boolean) })}
                rows={2}
                placeholder="e.g. Collaborative, Growth-oriented, Remote-first"
                className="mt-1"
              />
            </div>
            <Button onClick={saveEdit} className="w-full">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyJobs;
