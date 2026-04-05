import { useAuth } from "@/contexts/AuthContext";
import { useJobStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock, Star } from "lucide-react";

const statusIcons: Record<string, typeof Clock> = {
  pending: Clock,
  reviewed: Star,
  shortlisted: CheckCircle2,
  rejected: XCircle,
};

const CompanyApplicants = () => {
  const { user } = useAuth();
  const { jobs, applications, updateApplication, profiles } = useJobStore();

  const myJobIds = jobs.filter((j) => j.companyId === user?.id).map((j) => j.id);
  const myApplications = applications.filter((a) => myJobIds.includes(a.jobId));

  const getJob = (jobId: string) => jobs.find((j) => j.id === jobId);
  const getMatchClass = (score: number) =>
    score >= 80 ? "match-badge-high" : score >= 50 ? "match-badge-medium" : "match-badge-low";

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-1">Applicants</h1>
      <p className="text-sm text-muted-foreground mb-6">Review and manage candidates</p>

      {myApplications.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          No applications yet.
        </div>
      ) : (
        <div className="space-y-3">
          {myApplications.map((app) => {
            const job = getJob(app.jobId);
            const Icon = statusIcons[app.status] || Clock;
            const profile = profiles.find((p) => p.userId === app.candidateId);

            return (
              <div key={app.id} className="glass-card rounded-xl p-5 animate-fade-in">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{app.candidateName}</h3>
                      <Badge variant="secondary" className={getMatchClass(app.matchScore)}>
                        {app.matchScore}% match
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Applied for: {job?.title || "Unknown"}
                    </p>
                    {profile && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {profile.title} · {profile.experience} exp · Skills: {profile.skills.join(", ")}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground bg-secondary/50 rounded-md px-3 py-2 mt-2">
                      {app.matchDetails}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant={app.status === "shortlisted" ? "default" : "ghost"}
                      onClick={() => updateApplication(app.id, { status: "shortlisted" })}
                      title="Shortlist"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={app.status === "rejected" ? "text-destructive" : ""}
                      onClick={() => updateApplication(app.id, { status: "rejected" })}
                      title="Reject"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CompanyApplicants;
