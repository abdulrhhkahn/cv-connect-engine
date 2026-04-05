import { useAuth } from "@/contexts/AuthContext";
import { useJobStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, XCircle, Star } from "lucide-react";

const statusConfig: Record<string, { icon: typeof Clock; label: string; className: string }> = {
  pending: { icon: Clock, label: "Pending", className: "bg-secondary text-secondary-foreground" },
  reviewed: { icon: Star, label: "Reviewed", className: "match-badge-medium" },
  shortlisted: { icon: CheckCircle2, label: "Shortlisted", className: "match-badge-high" },
  rejected: { icon: XCircle, label: "Rejected", className: "match-badge-low" },
};

const CandidateApplications = () => {
  const { user } = useAuth();
  const { applications, jobs } = useJobStore();

  const myApps = applications.filter((a) => a.candidateId === user?.id);

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-1">My Applications</h1>
      <p className="text-sm text-muted-foreground mb-6">Track the status of your job applications</p>

      {myApps.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          You haven't applied to any jobs yet.
        </div>
      ) : (
        <div className="space-y-3">
          {myApps.map((app) => {
            const job = jobs.find((j) => j.id === app.jobId);
            const config = statusConfig[app.status];
            const Icon = config.icon;

            return (
              <div key={app.id} className="glass-card rounded-xl p-5 animate-fade-in">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{job?.title || "Unknown Position"}</h3>
                      <Badge variant="secondary" className={config.className}>
                        <Icon className="h-3 w-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{job?.companyName}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant="secondary"
                        className={
                          app.matchScore >= 80 ? "match-badge-high" : app.matchScore >= 50 ? "match-badge-medium" : "match-badge-low"
                        }
                      >
                        {app.matchScore}% match
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Applied {app.appliedAt.toLocaleDateString()}
                      </span>
                    </div>
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

export default CandidateApplications;
