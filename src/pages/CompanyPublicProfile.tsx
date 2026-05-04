import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useJobStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Globe, Phone, Mail, Users, Briefcase, Heart, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Job } from "@/lib/types";
import { toast } from "sonner";

const CompanyPublicProfile = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const { user } = useAuth();
  const { companyProfiles, jobs, applications, toggleFollow, addApplication, addNotification } = useJobStore();
  const [openJob, setOpenJob] = useState<Job | null>(null);

  const profile = companyProfiles.find((p) => p.userId === companyId);
  const companyJobs = jobs.filter((j) => j.companyId === companyId && j.status === "active");
  const isFollowing = user && profile?.followers?.includes(user.id);
  const isCandidate = user?.role === "candidate";

  const hasApplied = (jobId: string) =>
    !!user && applications.some((a) => a.jobId === jobId && a.candidateId === user.id);

  const handleApply = (job: Job) => {
    if (!user || !isCandidate) return;
    if (hasApplied(job.id)) {
      toast.message("You've already applied to this role");
      return;
    }
    addApplication({
      id: crypto.randomUUID(),
      jobId: job.id,
      candidateId: user.id,
      candidateName: user.name,
      status: "pending",
      matchScore: 70,
      matchDetails: "Application submitted from company profile.",
      appliedAt: new Date(),
    });
    addNotification({
      userId: job.companyId,
      title: "New application",
      message: `${user.name} applied for "${job.title}".`,
      type: "application",
      link: "/applicants",
    });
    toast.success(`Applied to ${job.title}`);
    setOpenJob(null);
  };

  if (!profile) {
    return (
      <div className="p-4 lg:p-8 max-w-2xl mx-auto text-center py-16 text-muted-foreground">
        Company profile not found.
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto">
      <div className="glass-card rounded-xl overflow-hidden animate-fade-in">
        {/* Banner */}
        <div className="h-40 bg-gradient-to-r from-primary/20 to-accent/30 overflow-hidden">
          {profile.bannerUrl && <img src={profile.bannerUrl} alt="Banner" className="w-full h-full object-cover" />}
        </div>

        <div className="p-6">
          <div className="flex items-start gap-4 -mt-14 relative z-10 mb-4">
            <div className="h-20 w-20 rounded-xl bg-card border-4 border-background flex items-center justify-center overflow-hidden shadow-md shrink-0">
              {profile.logoUrl ? (
                <img src={profile.logoUrl} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <Building2 className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div className="pt-8 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold">{profile.companyName}</h1>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> {(profile.followers || []).length} followers
                    {profile.size && <> · {profile.size} employees</>}
                  </p>
                </div>
                {isCandidate && user && (
                  <Button
                    variant={isFollowing ? "secondary" : "default"}
                    size="sm"
                    onClick={() => toggleFollow(companyId!, user.id)}
                  >
                    <Heart className={`h-4 w-4 mr-1 ${isFollowing ? "fill-current" : ""}`} />
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {profile.industry && <Badge variant="secondary">{profile.industry}</Badge>}
            {profile.about && <p className="text-sm">{profile.about}</p>}

            <div className="bg-secondary/50 rounded-lg p-3 space-y-1.5">
              {profile.location && <p className="text-sm flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {profile.location}</p>}
              {profile.website && <p className="text-sm flex items-center gap-2"><Globe className="h-3.5 w-3.5 text-muted-foreground" /> {profile.website}</p>}
              {profile.contactEmail && <p className="text-sm flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" /> {profile.contactEmail}</p>}
              {profile.contactPhone && <p className="text-sm flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> {profile.contactPhone}</p>}
            </div>

            {/* Employees hired via platform */}
            {profile.employees.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5"><Users className="h-4 w-4" /> People hired via HireAI</h3>
                <div className="space-y-2">
                  {profile.employees.map((emp, i) => (
                    <div key={i} className="flex items-center gap-3 bg-secondary/50 rounded-lg px-3 py-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                        {emp.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{emp.name}</p>
                        <p className="text-xs text-muted-foreground">{emp.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Open positions */}
            {companyJobs.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5"><Briefcase className="h-4 w-4" /> Open Positions</h3>
                <div className="space-y-2">
                  {companyJobs.map((job) => (
                    <div key={job.id} className="bg-secondary/50 rounded-lg px-3 py-2">
                      <p className="text-sm font-medium">{job.title}</p>
                      <p className="text-xs text-muted-foreground">{job.location} · {job.type} {job.salary && `· ${job.salary}`}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyPublicProfile;
