import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useJobStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Job, Application } from "@/lib/types";
import { Briefcase, MapPin, Clock, DollarSign, CheckCircle2, AlertTriangle, XCircle, Users, Heart, Building2 } from "lucide-react";
import { toast } from "sonner";

const CandidateJobs = () => {
  const { user } = useAuth();
  const { jobs, applications, addApplication, getProfile } = useJobStore();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const activeJobs = jobs.filter((j) => j.status === "active");
  const profile = user ? getProfile(user.id) : null;

  const hasApplied = (jobId: string) => applications.some((a) => a.jobId === jobId && a.candidateId === user?.id);

  const calculateMatch = (job: Job) => {
    if (!profile) return { score: 0, details: "Complete your profile to see match score", qualifies: false, missing: [] as string[], softSkillGaps: [] as string[], industryGaps: [] as string[], culturalGaps: [] as string[] };

    const candidateSkills = profile.skills.map((s) => s.toLowerCase());
    let matched = 0;
    const missing: string[] = [];

    job.requirements.forEach((req) => {
      const reqLower = req.toLowerCase();
      const hasSkill = candidateSkills.some((s) => reqLower.includes(s)) || reqLower.includes(profile.experience.toLowerCase());
      if (hasSkill) matched++;
      else missing.push(req);
    });

    const reqScore = job.requirements.length > 0 ? (matched / job.requirements.length) * 50 : 25;

    let skillMatched = 0;
    job.preferredSkills.forEach((skill) => {
      if (candidateSkills.some((s) => skill.toLowerCase().includes(s) || s.includes(skill.toLowerCase()))) {
        skillMatched++;
      }
    });
    const skillScore = job.preferredSkills.length > 0 ? (skillMatched / job.preferredSkills.length) * 20 : 10;

    // Industry experience matching
    const candidateIndustry = (profile.industryExperience || []).map(s => s.toLowerCase());
    const jobIndustry = job.industryExperience || [];
    let industryMatched = 0;
    const industryGaps: string[] = [];
    jobIndustry.forEach(ind => {
      if (candidateIndustry.some(ci => ind.toLowerCase().includes(ci) || ci.includes(ind.toLowerCase()))) {
        industryMatched++;
      } else {
        industryGaps.push(ind);
      }
    });
    const industryScore = jobIndustry.length > 0 ? (industryMatched / jobIndustry.length) * 10 : 5;

    // Soft skills matching
    const candidateSoft = (profile.softSkills || []).map(s => s.toLowerCase());
    const jobSoft = job.softSkills || [];
    let softMatched = 0;
    const softSkillGaps: string[] = [];
    jobSoft.forEach(ss => {
      if (candidateSoft.some(cs => ss.toLowerCase().includes(cs) || cs.includes(ss.toLowerCase()))) {
        softMatched++;
      } else {
        softSkillGaps.push(ss);
      }
    });
    const softScore = jobSoft.length > 0 ? (softMatched / jobSoft.length) * 10 : 5;

    // Cultural fit matching
    const candidateCulture = (profile.culturalFit || []).map(s => s.toLowerCase());
    const jobCulture = job.culturalFit || [];
    let cultureMatched = 0;
    const culturalGaps: string[] = [];
    jobCulture.forEach(cf => {
      if (candidateCulture.some(cc => cf.toLowerCase().includes(cc) || cc.includes(cf.toLowerCase()))) {
        cultureMatched++;
      } else {
        culturalGaps.push(cf);
      }
    });
    const cultureScore = jobCulture.length > 0 ? (cultureMatched / jobCulture.length) * 10 : 5;

    const score = Math.round(reqScore + skillScore + industryScore + softScore + cultureScore);
    const qualifies = score >= 50;

    const detailParts: string[] = [];
    detailParts.push(`${matched}/${job.requirements.length} requirements`);
    detailParts.push(`${skillMatched}/${job.preferredSkills.length} preferred skills`);
    if (jobIndustry.length) detailParts.push(`${industryMatched}/${jobIndustry.length} industry exp`);
    if (jobSoft.length) detailParts.push(`${softMatched}/${jobSoft.length} soft skills`);
    if (jobCulture.length) detailParts.push(`${cultureMatched}/${jobCulture.length} cultural fit`);

    const details = qualifies
      ? `Strong match! You meet ${detailParts.join(", ")}.`
      : `You meet ${detailParts.join(", ")}. ${missing.length ? `Strengthen: ${missing.slice(0, 2).join("; ")}` : ""}`;

    return { score, details, qualifies, missing, softSkillGaps, industryGaps, culturalGaps };
  };

  const applyForJob = (job: Job) => {
    if (!user || !profile) {
      toast.error("Please complete your profile first");
      return;
    }
    const match = calculateMatch(job);
    if (!match.qualifies) {
      toast.error("Your profile doesn't meet the minimum requirements for this role");
      return;
    }
    const app: Application = {
      id: crypto.randomUUID(),
      jobId: job.id,
      candidateId: user.id,
      candidateName: profile.name,
      status: "pending",
      matchScore: match.score,
      matchDetails: match.details,
      appliedAt: new Date(),
    };
    addApplication(app);
    toast.success("Application submitted!");
    setSelectedJob(null);
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-1">Open Positions</h1>
      <p className="text-sm text-muted-foreground mb-6">Browse and apply to jobs that match your skills</p>

      {!profile && (
        <div className="bg-accent rounded-xl p-4 mb-6 flex items-start gap-3 animate-fade-in">
          <AlertTriangle className="h-5 w-5 text-accent-foreground shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-accent-foreground">Complete your profile</p>
            <p className="text-xs text-muted-foreground mt-0.5">Add your skills, soft skills, and industry experience to see better match scores.</p>
          </div>
        </div>
      )}

      {activeJobs.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">No jobs available right now.</div>
      ) : (
        <div className="space-y-3">
          {activeJobs.map((job) => {
            const match = calculateMatch(job);
            const applied = hasApplied(job.id);

            return (
              <div
                key={job.id}
                className="glass-card rounded-xl p-5 cursor-pointer hover:shadow-md transition-shadow animate-fade-in"
                onClick={() => setSelectedJob(job)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{job.title}</h3>
                      {profile && (
                        <Badge
                          variant="secondary"
                          className={
                            match.score >= 80 ? "match-badge-high" : match.score >= 50 ? "match-badge-medium" : "match-badge-low"
                          }
                        >
                          {match.score}% match
                        </Badge>
                      )}
                      {applied && (
                        <Badge variant="secondary" className="match-badge-high">Applied</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{job.companyName}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{job.type}</span>
                      <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{job.experienceRequired}</span>
                      {job.salary && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{job.salary}</span>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!selectedJob} onOpenChange={(o) => !o && setSelectedJob(null)}>
        {selectedJob && (() => {
          const match = calculateMatch(selectedJob);
          return (
            <DialogContent className="max-w-lg max-h-[85vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>{selectedJob.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{selectedJob.companyName} · {selectedJob.location} · {selectedJob.type}</p>
                <p className="text-sm">{selectedJob.description}</p>

                <div>
                  <h4 className="text-sm font-semibold mb-2">Requirements</h4>
                  <ul className="space-y-1">
                    {selectedJob.requirements.map((r, i) => {
                      const isMissing = match.missing.includes(r);
                      return (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          {isMissing ? <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" /> : <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />}
                          <span className={isMissing ? "text-muted-foreground" : ""}>{r}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2">Preferred Skills</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.preferredSkills.map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                </div>

                {selectedJob.industryExperience && selectedJob.industryExperience.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                      <Building2 className="h-4 w-4" /> Industry Experience
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.industryExperience.map((ind) => {
                        const isGap = match.industryGaps.includes(ind);
                        return (
                          <Badge key={ind} variant="secondary" className={`text-xs ${isGap ? "opacity-50" : "match-badge-high"}`}>
                            {ind} {!isGap && profile && "✓"}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedJob.softSkills && selectedJob.softSkills.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                      <Users className="h-4 w-4" /> Soft Skills
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.softSkills.map((ss) => {
                        const isGap = match.softSkillGaps.includes(ss);
                        return (
                          <Badge key={ss} variant="secondary" className={`text-xs ${isGap ? "opacity-50" : "match-badge-medium"}`}>
                            {ss} {!isGap && profile && "✓"}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedJob.culturalFit && selectedJob.culturalFit.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                      <Heart className="h-4 w-4" /> Cultural Fit
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.culturalFit.map((cf) => {
                        const isGap = match.culturalGaps.includes(cf);
                        return (
                          <Badge key={cf} variant="secondary" className={`text-xs ${isGap ? "opacity-50" : "match-badge-high"}`}>
                            {cf} {!isGap && profile && "✓"}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

                {profile && (
                  <div className="bg-secondary/50 rounded-lg p-3 space-y-1">
                    <p className="text-sm">{match.details}</p>
                    {match.softSkillGaps.length > 0 && (
                      <p className="text-xs text-muted-foreground">💡 Develop: {match.softSkillGaps.join(", ")}</p>
                    )}
                    {match.industryGaps.length > 0 && (
                      <p className="text-xs text-muted-foreground">🏢 Industry gaps: {match.industryGaps.join(", ")}</p>
                    )}
                    {match.culturalGaps.length > 0 && (
                      <p className="text-xs text-muted-foreground">🤝 Cultural alignment: {match.culturalGaps.join(", ")}</p>
                    )}
                  </div>
                )}

                {selectedJob.salary && <p className="text-sm"><strong>Salary:</strong> {selectedJob.salary}</p>}

                <Button
                  className="w-full"
                  disabled={hasApplied(selectedJob.id) || !profile || !match.qualifies}
                  onClick={() => applyForJob(selectedJob)}
                >
                  {hasApplied(selectedJob.id)
                    ? "Already Applied"
                    : !profile
                    ? "Complete Profile to Apply"
                    : !match.qualifies
                    ? "Does Not Meet Requirements"
                    : "Apply Now"}
                </Button>
              </div>
            </DialogContent>
          );
        })()}
      </Dialog>
    </div>
  );
};

export default CandidateJobs;
