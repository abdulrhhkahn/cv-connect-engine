import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
  const [message, setMessage] = useState("");

  if (!interview || !user) return null;
  const isCompany = user.role === "company";

  const handleCancel = () => {
    cancelInterview(interview.id);
    const recipientId = isCompany ? interview.candidateId : interview.companyId;
    const senderName = isCompany ? interview.companyName : interview.candidateName;
    addNotification({
      userId: recipientId,
      title: "Interview cancelled",
      message: `${senderName} cancelled the interview for "${interview.jobTitle}".${
        message.trim() ? ` Message: "${message.trim()}"` : ""
      }`,
      type: "interview",
      link: "/interviews",
    });
    toast.success("Interview cancelled");
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
            <Label className="text-xs">Message (optional)</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="mt-1"
              placeholder="Let the other party know why…"
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
