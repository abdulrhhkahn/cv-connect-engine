import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useJobStore } from "@/lib/store";
import { Application, Interview, Job } from "@/lib/types";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  application: Application | null;
  job: Job | null | undefined;
}

const ScheduleInterviewDialog = ({ open, onOpenChange, application, job }: Props) => {
  const { user } = useAuth();
  const { addInterview, updateApplication, addNotification } = useJobStore();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [duration, setDuration] = useState("30");
  const [mode, setMode] = useState<Interview["mode"]>("video");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  const handleSchedule = () => {
    if (!user || !application || !job) return;
    if (!date) {
      toast.error("Please pick a date");
      return;
    }
    const scheduledAt = new Date(`${date}T${time}`);
    if (isNaN(scheduledAt.getTime())) {
      toast.error("Invalid date/time");
      return;
    }
    const interview: Interview = {
      id: crypto.randomUUID(),
      jobId: job.id,
      applicationId: application.id,
      companyId: user.id,
      companyName: job.companyName,
      candidateId: application.candidateId,
      candidateName: application.candidateName,
      jobTitle: job.title,
      scheduledAt,
      durationMins: Number(duration) || 30,
      mode,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      status: "pending_confirmation",
      candidateConfirmed: false,
    };
    addInterview(interview);
    if (application.status === "pending") {
      updateApplication(application.id, { status: "reviewed" });
    }
    addNotification({
      userId: application.candidateId,
      title: "Interview invitation",
      message: `${job.companyName} invited you to interview for "${job.title}" on ${scheduledAt.toLocaleString()}. Please confirm.`,
      type: "interview",
      link: "/interviews",
    });
    toast.success(`Invitation sent to ${application.candidateName}`);
    onOpenChange(false);
    setDate(""); setTime("10:00"); setDuration("30"); setMode("video"); setLocation(""); setNotes("");
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Interview</DialogTitle>
        </DialogHeader>
        {application && job && (
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              With <strong className="text-foreground">{application.candidateName}</strong> for{" "}
              <strong className="text-foreground">{job.title}</strong>
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Date</Label>
                <Input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Time</Label>
                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Duration (min)</Label>
                <Input type="number" min={15} step={15} value={duration} onChange={(e) => setDuration(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Mode</Label>
                <Select value={mode} onValueChange={(v) => setMode(v as Interview["mode"])}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video call</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="onsite">On-site</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">
                {mode === "video" ? "Meeting link" : mode === "phone" ? "Phone number" : "Address"}
              </Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={mode === "video" ? "https://meet…" : mode === "phone" ? "+1 555…" : "Office address"}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Notes (optional)</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="mt-1" placeholder="Agenda, panel, prep…" />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSchedule}>Schedule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleInterviewDialog;
