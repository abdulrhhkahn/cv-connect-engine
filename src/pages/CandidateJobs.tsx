import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useJobStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Job, Application } from "@/lib/types";
import { Briefcase, MapPin, Clock, DollarSign, CheckCircle2, AlertTriangle, XCircle, Users, Heart, Building2, Search, Filter, Star } from "lucide-react";
import { isFeaturedActive } from "@/lib/billing";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { WORLD_LOCATIONS, INDUSTRIES } from "@/lib/reference-data";

const CandidateJobs = () => {
  const { user } = useAuth();
  const { jobs, applications, addApplication, getProfile, companyProfiles, toggleFollow, addNotification } = useJobStore();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [matchFilter, setMatchFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");

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

  // Comprehensive worldwide locations & industries, merged with anything present in jobs
  const locations = useMemo(() => {
    const fromJobs = activeJobs.map((j) => j.location);
    return [...new Set([...WORLD_LOCATIONS, ...fromJobs])];
  }, [activeJobs]);
  const industries = useMemo(() => {
    const fromJobs = activeJobs.flatMap((j) => j.industryExperience || []);
    return [...new Set([...INDUSTRIES, ...fromJobs])];
  }, [activeJobs]);

  // Filter jobs
  const filteredJobs = useMemo(() => {
    return activeJobs.filter(job => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!job.title.toLowerCase().includes(q) && !job.companyName.toLowerCase().includes(q) && !job.description.toLowerCase().includes(q)) return false;
      }
      if (locationFilter !== "all" && job.location !== locationFilter) return false;
      if (typeFilter !== "all" && job.type !== typeFilter) return false;
      if (industryFilter !== "all" && !(job.industryExperience || []).includes(industryFilter)) return false;
      if (matchFilter !== "all" && profile) {
        const score = calculateMatch(job).score;
        if (matchFilter === "high" && score < 80) return false;
        if (matchFilter === "medium" && (score < 50 || score >= 80)) return false;
        if (matchFilter === "low" && score >= 50) return false;
      }
      return true;
    }).sort((a, b) => {
      // Featured + active jobs float to the top
      const aFeat = isFeaturedActive(a) ? 1 : 0;
      const bFeat = isFeaturedActive(b) ? 1 : 0;
      if (aFeat !== bFeat) return bFeat - aFeat;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [activeJobs, searchQuery, locationFilter, typeFilter, matchFilter, industryFilter, profile]);

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
      decisionReason: "Your application is being reviewed by the hiring team.",
      improvements: match.missing.length > 0 ? match.missing.map(m => `Strengthen: ${m}`) : [],
      missingSkills: [...match.softSkillGaps, ...match.industryGaps],
    };
    addApplication(app);
    addNotification({
      userId: selectedJob.companyId,
      title: "New application",
      message: `${user.name} applied for "${selectedJob.title}".`,
      type: "application",
      link: "/applicants",
    });
    toast.success("Application submitted!");
    setSelectedJob(null);
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-1">Open Positions</h1>
      <p className="text-sm text-muted-foreground mb-4">Browse and apply to jobs that match your skills</p>

      {/* Search & Filters */}
      <div className="glass-card rounded-xl p-4 mb-6 space-y-3 animate-fade-in">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            placeholder="Search jobs by title, company, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-full sm:w-[160px] h-8 text-xs">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[140px] h-8 text-xs">
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="full-time">Full-time</SelectItem>
              <SelectItem value="part-time">Part-time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
            </SelectContent>
          </Select>
          {profile && (
            <Select value={matchFilter} onValueChange={setMatchFilter}>
              <SelectTrigger className="w-full sm:w-[140px] h-8 text-xs">
                <SelectValue placeholder="Match Score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Matches</SelectItem>
                <SelectItem value="high">80%+ Match</SelectItem>
                <SelectItem value="medium">50-79% Match</SelectItem>
                <SelectItem value="low">Below 50%</SelectItem>
              </SelectContent>
            </Select>
          )}
          {industries.length > 0 && (
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-full sm:w-[150px] h-8 text-xs">
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industries.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {!profile && (
        <div className="bg-accent rounded-xl p-4 mb-6 flex items-start gap-3 animate-fade-in">
          <AlertTriangle className="h-5 w-5 text-accent-foreground shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-accent-foreground">Complete your profile</p>
            <p className="text-xs text-muted-foreground mt-0.5">Add your skills, soft skills, and industry experience to see better match scores.</p>
          </div>
        </div>
      )}

      {filteredJobs.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          {activeJobs.length === 0 ? "No jobs available right now." : "No jobs match your filters."}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((job) => {
            const match = calculateMatch(job);
            const applied = hasApplied(job.id);
            const showMatch = profile && match.score >= 60;

            return (
              <div
                key={job.id}
                className={`glass-card rounded-xl p-5 cursor-pointer hover:shadow-md transition-shadow animate-fade-in ${
                  isFeaturedActive(job) ? "border-2 border-yellow-400/50 dark:border-yellow-500/40" : ""
                }`}
                onClick={() => setSelectedJob(job)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {isFeaturedActive(job) && (
                        <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-400/40 gap-1 text-xs">
                          <Star className="h-3 w-3 fill-current" /> Featured
                        </Badge>
                      )}
                      <h3 className="font-semibold">{job.title}</h3>
                      {showMatch && (
                        <Badge
                          variant="secondary"
                          className={
                            match.score >= 80 ? "match-badge-high" : "match-badge-medium"
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
          const company = companyProfiles.find((c) => c.userId === selectedJob.companyId);
          const isFollowing = !!(user && company?.followers?.includes(user.id));
          return (
            <DialogContent className="w-full max-w-lg max-h-[85vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>{selectedJob.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="text-sm text-muted-foreground">
                    {company ? (
                      <Link to={`/company/${selectedJob.companyId}`} className="font-medium text-foreground hover:underline">
                        {selectedJob.companyName}
                      </Link>
                    ) : (
                      <span className="font-medium text-foreground">{selectedJob.companyName}</span>
                    )}
                    {" · "}{selectedJob.location} · {selectedJob.type}
                  </p>
                  {company && user && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => toggleFollow(selectedJob.companyId, user.id)}
                    >
                      <Heart className={`h-3.5 w-3.5 mr-1 ${isFollowing ? "fill-current text-primary" : ""}`} />
                      {isFollowing ? "Following" : "Follow"}
                    </Button>
                  )}
                </div>
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
