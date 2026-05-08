import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useJobStore } from "@/lib/store";
import type { Interview } from "@/lib/types";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  interview: Interview | null;
}

const CancelInterviewDialog = ({ open, onOpenChange, interview }: Props) => {
  const { user } = useAuth();
  const { cancelInterview, addNotification } = useJobStore();
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");

  if (!interview || !user) return null;
  const isCompany = user.role === "company";

  const handleCancel = () => {
    const reasonTrim = reason.trim();
    const messageTrim = message.trim();
    cancelInterview(
      interview.id,
      reasonTrim || undefined,
      isCompany ? "company" : "candidate",
      messageTrim || undefined,
    );
    const recipientId = isCompany ? interview.candidateId : interview.companyId;
    const senderName = isCompany ? interview.companyName : interview.candidateName;

    const parts: string[] = [
      `${senderName} cancelled the interview for "${interview.jobTitle}".`,
    ];
    if (reasonTrim) parts.push(`Reason: "${reasonTrim}"`);
    if (messageTrim) parts.push(`Message: "${messageTrim}"`);

    addNotification({
      userId: recipientId,
      title: "Interview cancelled",
      message: parts.join(" "),
      type: "interview",
      link: "/interviews",
    });
    toast.success("Interview cancelled");
    setReason("");
    setMessage("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel interview</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            Cancel the interview for <strong className="text-foreground">{interview.jobTitle}</strong> on{" "}
            {new Date(interview.scheduledAt).toLocaleString()}?
          </p>
          <div>
            <Label className="text-xs">Reason (optional)</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1"
              placeholder="e.g. Schedule conflict"
            />
          </div>
          <div>
            <Label className="text-xs">Message (optional)</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="mt-1"
              placeholder="Add a note for the other party…"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep interview
          </Button>
          <Button variant="destructive" onClick={handleCancel}>
            Cancel interview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelInterviewDialog;
