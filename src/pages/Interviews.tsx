import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useJobStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Video,
  Phone,
  MapPin,
  Building2,
  User as UserIcon,
  XCircle,
  CheckCircle2,
  CalendarClock,
  RefreshCw,
  CalendarPlus,
  Link as LinkIcon,
} from "lucide-react";
import { toast } from "sonner";
import RescheduleInterviewDialog from "@/components/RescheduleInterviewDialog";
import CancelInterviewDialog from "@/components/CancelInterviewDialog";
import type { Interview } from "@/lib/types";
import { downloadInterviewICS, buildInterviewICS } from "@/lib/ics";

const modeIcon = { video: Video, phone: Phone, onsite: MapPin } as const;

const Interviews = () => {
  const { user } = useAuth();
  const { interviews, updateInterview, addNotification } = useJobStore();
  const [rescheduling, setRescheduling] = useState<Interview | null>(null);
  const [cancelling, setCancelling] = useState<Interview | null>(null);

  const isCompany = user?.role === "company";

  const myInterviews = useMemo(() => {
    if (!user) return [];
    return interviews
      .filter((i) => (isCompany ? i.companyId === user.id : i.candidateId === user.id))
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  }, [interviews, user, isCompany]);

  const isLive = (i: Interview) =>
    ["scheduled", "pending_confirmation", "reschedule_proposed"].includes(i.status) &&
    new Date(i.scheduledAt).getTime() >= Date.now() - 60 * 60 * 1000;
  const upcoming = myInterviews.filter(isLive);
  const past = myInterviews.filter((i) => !upcoming.includes(i));

  const formatWhen = (d: Date) =>
    new Date(d).toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  const confirm = (iv: Interview) => {
    const updated = { ...iv, status: "scheduled" as const, candidateConfirmed: true };
    updateInterview(iv.id, { status: "scheduled", candidateConfirmed: true });
    addNotification({
      userId: iv.companyId,
      title: "Interview confirmed",
      message: `${iv.candidateName} confirmed the interview for "${iv.jobTitle}".`,
      type: "interview",
      link: "/interviews",
    });
    downloadInterviewICS(updated);
    toast.success("Interview confirmed — calendar invite downloaded");
  };

  const acceptProposal = (iv: Interview) => {
    if (!iv.proposedAt) return;
    updateInterview(iv.id, {
      status: "scheduled",
      scheduledAt: iv.proposedAt,
      durationMins: iv.proposedDurationMins || iv.durationMins,
      candidateConfirmed: !isCompany ? true : iv.candidateConfirmed,
      proposedAt: undefined,
      proposedBy: undefined,
      proposedDurationMins: undefined,
      proposedNote: undefined,
    });
    const recipientId = isCompany ? iv.candidateId : iv.companyId;
    addNotification({
      userId: recipientId,
      title: "New time accepted",
      message: `Interview for "${iv.jobTitle}" is now ${new Date(iv.proposedAt).toLocaleString()}.`,
      type: "interview",
      link: "/interviews",
    });
    downloadInterviewICS({
      ...iv,
      scheduledAt: iv.proposedAt,
      durationMins: iv.proposedDurationMins || iv.durationMins,
      status: "scheduled",
    });
    toast.success("New time confirmed — calendar invite downloaded");
  };

  const declineProposal = (iv: Interview) => {
    updateInterview(iv.id, {
      status: iv.candidateConfirmed ? "scheduled" : "pending_confirmation",
      proposedAt: undefined,
      proposedBy: undefined,
      proposedDurationMins: undefined,
      proposedNote: undefined,
    });
    const recipientId = isCompany ? iv.candidateId : iv.companyId;
    addNotification({
      userId: recipientId,
      title: "Proposed time declined",
      message: `The new time for "${iv.jobTitle}" was declined.`,
      type: "interview",
      link: "/interviews",
    });
    toast.message("Proposal declined");
  };

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
            const proposed = iv.status === "reschedule_proposed";
            const youProposed = proposed && ((isCompany && iv.proposedBy === "company") || (!isCompany && iv.proposedBy === "candidate"));
            return (
              <div key={iv.id} className="glass-card rounded-xl p-4 animate-fade-in">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{iv.jobTitle}</h3>
                      <Badge variant="secondary" className="text-xs capitalize">
                        <Icon className="h-3 w-3 mr-1" /> {iv.mode}
                      </Badge>
                      {iv.status === "pending_confirmation" && (
                        <Badge variant="secondary" className="match-badge-medium text-xs">Awaiting confirmation</Badge>
                      )}
                      {iv.status === "scheduled" && (
                        <Badge variant="secondary" className="match-badge-high text-xs">Confirmed</Badge>
                      )}
                      {proposed && (
                        <Badge variant="secondary" className="match-badge-medium text-xs">
                          New time proposed
                        </Badge>
                      )}
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
                    {iv.status === "cancelled" && (
                      <div className="mt-2 rounded-md border border-destructive/30 bg-destructive/10 p-2.5 text-xs space-y-0.5">
                        <p className="font-medium text-destructive">
                          Cancelled{iv.cancelledBy ? ` by ${iv.cancelledBy}` : ""}
                          {iv.cancelledAt ? ` · ${new Date(iv.cancelledAt).toLocaleString()}` : ""}
                        </p>
                        {iv.cancellationReason ? (
                          <p className="text-muted-foreground">Reason: "{iv.cancellationReason}"</p>
                        ) : (
                          <p className="text-muted-foreground">No reason provided.</p>
                        )}
                      </div>
                    )}
                    {proposed && iv.proposedAt && (
                      <div className="mt-2 rounded-md border border-primary/30 bg-accent/40 p-2.5 text-xs space-y-1">
                        <p className="font-medium flex items-center gap-1.5">
                          <CalendarClock className="h-3.5 w-3.5" /> Proposed: {formatWhen(iv.proposedAt)}
                          {iv.proposedDurationMins ? ` · ${iv.proposedDurationMins} min` : ""}
                        </p>
                        {iv.proposedNote && <p className="text-muted-foreground">"{iv.proposedNote}"</p>}
                        <p className="text-muted-foreground">
                          {youProposed ? "Waiting for the other party to confirm." : "Accept, decline, or counter-propose."}
                        </p>
                      </div>
                    )}
                  </div>

                  {!isPast && iv.status !== "cancelled" && iv.status !== "completed" && (
                    <div className="flex flex-wrap gap-1 shrink-0 justify-end">
                      {/* Candidate confirm initial invite */}
                      {!isCompany && iv.status === "pending_confirmation" && (
                        <Button size="sm" onClick={() => confirm(iv)}>
                          <CheckCircle2 className="h-4 w-4 mr-1" /> Confirm
                        </Button>
                      )}

                      {/* Proposal actions for the receiving party */}
                      {proposed && !youProposed && (
                        <>
                          <Button size="sm" onClick={() => acceptProposal(iv)}>
                            <CheckCircle2 className="h-4 w-4 mr-1" /> Accept
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => declineProposal(iv)}>
                            Decline
                          </Button>
                        </>
                      )}

                      {/* Reschedule */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setRescheduling(iv)}
                        title="Propose new time"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>

                      {/* Company can mark complete on confirmed sessions */}
                      {isCompany && iv.status === "scheduled" && (
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

                      {iv.status === "scheduled" && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => downloadInterviewICS(iv)}
                            title="Download calendar invite (.ics)"
                          >
                            <CalendarPlus className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={async () => {
                              const ics = buildInterviewICS(iv);
                              const link = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
                              try {
                                await navigator.clipboard.writeText(link);
                                toast.success("Calendar share link copied");
                              } catch {
                                toast.error("Couldn't copy link");
                              }
                            }}
                            title="Copy calendar share link"
                          >
                            <LinkIcon className="h-4 w-4" />
                          </Button>
                        </>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => setCancelling(iv)}
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
            : "Confirm invitations and propose new times when needed."}
        </p>
      </div>
      <Section title="Upcoming" items={upcoming} />
      <Section title="Past" items={past} isPast />

      <RescheduleInterviewDialog
        open={!!rescheduling}
        onOpenChange={(o) => !o && setRescheduling(null)}
        interview={rescheduling}
      />
      <CancelInterviewDialog
        open={!!cancelling}
        onOpenChange={(o) => !o && setCancelling(null)}
        interview={cancelling}
      />
    </div>
  );
};

export default Interviews;
