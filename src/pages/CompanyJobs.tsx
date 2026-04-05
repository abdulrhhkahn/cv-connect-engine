import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useJobStore } from "@/lib/store";
import { Job } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, Trash2, Eye, Globe, Archive, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const statusColors: Record<string, string> = {
  draft: "bg-secondary text-secondary-foreground",
  active: "match-badge-high",
  closed: "match-badge-low",
};

const CompanyJobs = () => {
  const { user } = useAuth();
  const { jobs, updateJob, deleteJob } = useJobStore();
  const navigate = useNavigate();
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editForm, setEditForm] = useState<Partial<Job>>({});

  const myJobs = jobs.filter((j) => j.companyId === user?.id);

  const openEdit = (job: Job) => {
    setEditingJob(job);
    setEditForm({
      title: job.title,
      description: job.description,
      requirements: [...job.requirements],
      preferredSkills: [...job.preferredSkills],
      experienceRequired: job.experienceRequired,
      location: job.location,
      salary: job.salary,
    });
  };

  const saveEdit = () => {
    if (!editingJob) return;
    updateJob(editingJob.id, editForm);
    setEditingJob(null);
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Postings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your open positions</p>
        </div>
        <Button onClick={() => navigate("/dashboard")}>
          <Plus className="h-4 w-4 mr-1" />
          New via Chat
        </Button>
      </div>

      {myJobs.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>No jobs yet. Use the Chat to create your first job posting.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myJobs.map((job) => (
            <div key={job.id} className="glass-card rounded-xl p-5 animate-fade-in">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{job.title}</h3>
                    <Badge variant="secondary" className={statusColors[job.status]}>
                      {job.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{job.description}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{job.location}</span>
                    <span>·</span>
                    <span>{job.type}</span>
                    <span>·</span>
                    <span>{job.experienceRequired}</span>
                    {job.salary && <><span>·</span><span>{job.salary}</span></>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {job.status === "draft" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateJob(job.id, { status: "active" })}
                      title="Publish"
                    >
                      <Globe className="h-4 w-4" />
                    </Button>
                  )}
                  {job.status === "active" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateJob(job.id, { status: "closed" })}
                      title="Close"
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => openEdit(job)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => deleteJob(job.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!editingJob} onOpenChange={(o) => !o && setEditingJob(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={editForm.title || ""}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={editForm.description || ""}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={4}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Requirements (one per line)</Label>
              <Textarea
                value={(editForm.requirements || []).join("\n")}
                onChange={(e) => setEditForm({ ...editForm, requirements: e.target.value.split("\n").filter(Boolean) })}
                rows={4}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Preferred Skills (one per line)</Label>
              <Textarea
                value={(editForm.preferredSkills || []).join("\n")}
                onChange={(e) => setEditForm({ ...editForm, preferredSkills: e.target.value.split("\n").filter(Boolean) })}
                rows={3}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Experience</Label>
                <Input
                  value={editForm.experienceRequired || ""}
                  onChange={(e) => setEditForm({ ...editForm, experienceRequired: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Location</Label>
                <Input
                  value={editForm.location || ""}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Salary (optional)</Label>
              <Input
                value={editForm.salary || ""}
                onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
                className="mt-1"
              />
            </div>
            <Button onClick={saveEdit} className="w-full">Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyJobs;
