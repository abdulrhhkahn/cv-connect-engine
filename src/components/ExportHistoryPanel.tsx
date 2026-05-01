import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useJobStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { History, Link as LinkIcon, FileText, ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";
import { Job } from "@/lib/types";
import JobPreviewDialog from "./JobPreviewDialog";

const ExportHistoryPanel = () => {
  const { user } = useAuth();
  const { exportHistory } = useJobStore();
  const [open, setOpen] = useState(false);
  const [previewJob, setPreviewJob] = useState<Job | null>(null);

  const myHistory = exportHistory.filter((e) => e.companyId === user?.id);

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm">
            <History className="h-4 w-4 mr-1.5" />
            Preview history
            {myHistory.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-xs">{myHistory.length}</Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Preview & Export History</SheetTitle>
          </SheetHeader>
          <p className="text-xs text-muted-foreground mt-1">
            Review previously generated PDF previews and shareable links before publishing.
          </p>

          {myHistory.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-12">
              No exports yet. Generate a job and click <strong>Export / Preview</strong>.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {myHistory.map((e) => (
                <div key={e.id} className="rounded-lg border border-border p-3 bg-card">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {e.type === "pdf" ? (
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                      ) : (
                        <LinkIcon className="h-4 w-4 text-primary shrink-0" />
                      )}
                      <p className="text-sm font-medium truncate">{e.jobSnapshot.title}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs capitalize shrink-0">
                      {e.type === "pdf" ? "PDF" : "Link"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(e.createdAt).toLocaleString()} · {e.jobSnapshot.location} · {e.jobSnapshot.type}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    <Button size="sm" variant="ghost" onClick={() => setPreviewJob(e.jobSnapshot)}>
                      Re-preview
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => copy(e.shareUrl)}>
                      <Copy className="h-3.5 w-3.5 mr-1" /> Copy link
                    </Button>
                    <Button size="sm" variant="ghost" asChild>
                      <a href={e.shareUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-3.5 w-3.5 mr-1" /> Open
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SheetContent>
      </Sheet>
      <JobPreviewDialog open={!!previewJob} onOpenChange={(o) => !o && setPreviewJob(null)} job={previewJob} />
    </>
  );
};

export default ExportHistoryPanel;
