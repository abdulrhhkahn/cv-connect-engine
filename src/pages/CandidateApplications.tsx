import { useAuth } from "@/contexts/AuthContext";
import { useJobStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, XCircle, Star, AlertTriangle, Lightbulb, TrendingUp } from "lucide-react";

const statusConfig: Record<string, { icon: typeof Clock; label: string; className: string; description: string }> = {
  pending: { icon: Clock, label: "Pending", className: "bg-secondary text-secondary-foreground", description: "Your application is being reviewed" },
  reviewed: { icon: Star, label: "Reviewed", className: "match-badge-medium", description: "The hiring team has reviewed your application" },
  shortlisted: { icon: CheckCircle2, label: "Shortlisted", className: "match-badge-high", description: "Congratulations! You've been shortlisted" },
  rejected: { icon: XCircle, label: "Rejected", className: "match-badge-low", description: "Unfortunately, you were not selected for this role" },
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
        <div className="space-y-4">
          {myApps.map((app) => {
            const job = jobs.find((j) => j.id === app.jobId);
            const config = statusConfig[app.status];
            const Icon = config.icon;

            return (
              <div key={app.id} className="glass-card rounded-xl p-5 animate-fade-in">
                <div className="flex items-start justify-between gap-4 mb-3">
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

                {/* Decision & Reasoning */}
                <div className="space-y-3 border-t border-border pt-3">
                  <p className="text-sm text-muted-foreground italic">{config.description}</p>

                  {app.decisionReason && (
                    <div className="bg-secondary/50 rounded-lg p-3">
                      <p className="text-sm flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-accent-foreground shrink-0 mt-0.5" />
                        {app.decisionReason}
                      </p>
                    </div>
                  )}

                  {app.missingSkills && app.missingSkills.length > 0 && (
                    <div className="bg-destructive/5 rounded-lg p-3">
                      <p className="text-sm font-medium flex items-center gap-1.5 mb-2">
                        <TrendingUp className="h-4 w-4 text-destructive" />
                        Skills & Experience Gaps
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {app.missingSkills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="match-badge-low text-xs">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {app.improvements && app.improvements.length > 0 && (
                    <div className="bg-accent/50 rounded-lg p-3">
                      <p className="text-sm font-medium flex items-center gap-1.5 mb-2">
                        <Lightbulb className="h-4 w-4 text-accent-foreground" />
                        How to Improve
                      </p>
                      <ul className="space-y-1">
                        {app.improvements.map((imp, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="text-accent-foreground mt-0.5">→</span>
                            {imp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
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
