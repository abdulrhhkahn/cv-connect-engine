import { useEffect, useState } from "react";
import { Job } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Printer, Share2, Link as LinkIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const decode = (hash: string): Job | null => {
  try {
    const b64 = hash.replace(/^#/, "");
    if (!b64) return null;
    const json = decodeURIComponent(escape(atob(b64)));
    return JSON.parse(json) as Job;
  } catch {
    return null;
  }
};

const JobPreview = () => {
  const [job, setJob] = useState<Job | null>(null);

  useEffect(() => {
    setJob(decode(window.location.hash));
  }, []);

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-2xl font-semibold">Preview not available</h1>
        <p className="text-muted-foreground mt-2">This shareable preview link is invalid or has expired.</p>
        <Button asChild className="mt-4"><Link to="/">Go home</Link></Button>
      </div>
    );
  }

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard");
    } catch {
      toast.error("Unable to copy link");
    }
  };

  const handleNativeShare = async () => {
    const shareData = {
      title: `${job.title} at ${job.companyName}`,
      text: `${job.title} — ${job.companyName} · ${job.location}`,
      url: shareUrl,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* cancelled */ }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 border-b border-border flex items-center justify-between px-4 lg:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm">HireAI</span>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm">
              <Share2 className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {typeof navigator !== "undefined" && "share" in navigator && (
              <DropdownMenuItem onClick={handleNativeShare}>
                <Share2 className="h-4 w-4 mr-2" /> Share via…
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleCopyLink}>
              <LinkIcon className="h-4 w-4 mr-2" /> Copy link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" /> Print / Download PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <main className="max-w-2xl mx-auto p-6 space-y-5">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{job.title}</h1>
          <p className="text-muted-foreground mt-1">
            <strong>{job.companyName}</strong> · {job.location} · {job.type} · {job.experienceRequired}
            {job.salary ? ` · ${job.salary}` : ""}
          </p>
        </div>
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Description</h3>
          <p className="whitespace-pre-line leading-relaxed">{job.description}</p>
        </section>
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Requirements</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">{job.requirements.map((r, i) => <li key={i}>{r}</li>)}</ul>
        </section>
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Preferred Skills</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">{job.preferredSkills.map((r, i) => <li key={i}>{r}</li>)}</ul>
        </section>
        {!!job.industryExperience?.length && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Industry</h3>
            <div className="flex flex-wrap gap-1.5">{job.industryExperience.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}</div>
          </section>
        )}
        {!!job.softSkills?.length && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Soft Skills</h3>
            <div className="flex flex-wrap gap-1.5">{job.softSkills.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}</div>
          </section>
        )}
        {!!job.culturalFit?.length && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Cultural Fit</h3>
            <div className="flex flex-wrap gap-1.5">{job.culturalFit.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}</div>
          </section>
        )}
      </main>
    </div>
  );
};

export default JobPreview;
