import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useJobStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video, Phone, MapPin, Building2, User as UserIcon, XCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const modeIcon = { video: Video, phone: Phone, onsite: MapPin } as const;

const Interviews = () => {
  const { user } = useAuth();
  const { interviews, cancelInterview, updateInterview } = useJobStore();

  const isCompany = user?.role === "company";

  const myInterviews = useMemo(() => {
    if (!user) return [];
    return interviews
      .filter((i) => (isCompany ? i.companyId === user.id : i.candidateId === user.id))
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  }, [interviews, user, isCompany]);

  const upcoming = myInterviews.filter(
    (i) => i.status === "scheduled" && new Date(i.scheduledAt).getTime() >= Date.now() - 60 * 60 * 1000
  );
  const past = myInterviews.filter((i) => !upcoming.includes(i));

  const formatWhen = (d: Date) =>
    new Date(d).toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  const Section = ({ title, items, isPast = false }: { title: string; items: typeof myInterviews; isPast?: boolean }) => (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">{title}</h2>
      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground py-6 text-center bg-secondary/40 rounded-lg">
          {isPast ? "No past interviews." : "No upcoming interviews."}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((iv) => {
            const Icon = modeIcon[iv.mode];
            return (
              <div key={iv.id} className="glass-card rounded-xl p-4 animate-fade-in">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{iv.jobTitle}</h3>
                      <Badge variant="secondary" className="text-xs capitalize">
                        <Icon className="h-3 w-3 mr-1" /> {iv.mode}
                      </Badge>
                      {iv.status === "cancelled" && (
                        <Badge variant="secondary" className="match-badge-low text-xs">Cancelled</Badge>
                      )}
                      {iv.status === "completed" && (
                        <Badge variant="secondary" className="match-badge-high text-xs">Completed</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                      {isCompany ? <UserIcon className="h-3.5 w-3.5" /> : <Building2 className="h-3.5 w-3.5" />}
                      {isCompany ? iv.candidateName : iv.companyName}
                    </p>
                    <div className="text-xs text-muted-foreground mt-2 flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatWhen(iv.scheduledAt)}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {iv.durationMins} min</span>
                      {iv.location && <span className="truncate max-w-[260px]">📍 {iv.location}</span>}
                    </div>
                    {iv.notes && (
                      <p className="text-xs text-muted-foreground bg-secondary/50 rounded-md p-2 mt-2">{iv.notes}</p>
                    )}
                  </div>

                  {iv.status === "scheduled" && !isPast && (
                    <div className="flex gap-1 shrink-0">
                      {isCompany && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            updateInterview(iv.id, { status: "completed" });
                            toast.success("Marked as completed");
                          }}
                          title="Mark completed"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => {
                          cancelInterview(iv.id);
                          toast.success("Interview cancelled");
                        }}
                        title="Cancel interview"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
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

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Interviews</h1>
        <p className="text-sm text-muted-foreground">
          {isCompany
            ? "Schedule and track interviews with candidates from the Applicants page."
            : "Your upcoming interviews with hiring teams."}
        </p>
      </div>
      <Section title="Upcoming" items={upcoming} />
      <Section title="Past" items={past} isPast />
    </div>
  );
};

export default Interviews;
