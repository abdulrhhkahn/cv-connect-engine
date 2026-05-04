import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useJobStore } from "@/lib/store";
import { Interview } from "@/lib/types";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  interview: Interview | null;
}

const RescheduleInterviewDialog = ({ open, onOpenChange, interview }: Props) => {
  const { user } = useAuth();
  const { updateInterview, addNotification } = useJobStore();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState("30");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (interview && open) {
      const d = new Date(interview.scheduledAt);
      setDate(d.toISOString().split("T")[0]);
      setTime(d.toTimeString().slice(0, 5));
      setDuration(String(interview.durationMins));
      setNote("");
    }
  }, [interview, open]);

  if (!interview || !user) return null;

  const isCompany = user.role === "company";
  const today = new Date().toISOString().split("T")[0];

  const handlePropose = () => {
    if (!date) {
      toast.error("Pick a date");
      return;
    }
    const newAt = new Date(`${date}T${time}`);
    if (isNaN(newAt.getTime())) {
      toast.error("Invalid date/time");
      return;
    }
    updateInterview(interview.id, {
      status: "reschedule_proposed",
      proposedAt: newAt,
      proposedDurationMins: Number(duration) || interview.durationMins,
      proposedBy: isCompany ? "company" : "candidate",
      proposedNote: note.trim() || undefined,
    });

    // Notify the other party
    const recipientId = isCompany ? interview.candidateId : interview.companyId;
    const proposerName = isCompany ? interview.companyName : interview.candidateName;
    addNotification({
      userId: recipientId,
      title: "New time proposed",
      message: `${proposerName} proposed a new time for "${interview.jobTitle}" on ${newAt.toLocaleString()}.`,
      type: "interview",
      link: "/interviews",
    });

    toast.success("New time proposed. Awaiting confirmation.");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Propose new time</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            Interview for <strong className="text-foreground">{interview.jobTitle}</strong>
            <br />
            Currently: {new Date(interview.scheduledAt).toLocaleString()}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">New date</Label>
              <Input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">New time</Label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Duration (min)</Label>
              <Input
                type="number"
                min={15}
                step={15}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label className="text-xs">Message (optional)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="mt-1"
              placeholder="Reason for rescheduling…"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handlePropose}>Propose new time</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RescheduleInterviewDialog;
