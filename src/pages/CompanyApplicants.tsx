import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useJobStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, XCircle, Clock, Star, User, MapPin, Phone, Mail, Globe, Linkedin, Briefcase, GraduationCap, Building2, Users, Heart, CalendarPlus } from "lucide-react";
import { CandidateProfile, Application } from "@/lib/types";
import ScheduleInterviewDialog from "@/components/ScheduleInterviewDialog";

const statusIcons: Record<string, typeof Clock> = {
  pending: Clock,
  reviewed: Star,
  shortlisted: CheckCircle2,
  rejected: XCircle,
};

const CompanyApplicants = () => {
  const { user } = useAuth();
  const { jobs, applications, updateApplication, profiles } = useJobStore();
  const [selectedProfile, setSelectedProfile] = useState<CandidateProfile | null>(null);

  const myJobIds = jobs.filter((j) => j.companyId === user?.id).map((j) => j.id);
  const myApplications = applications.filter((a) => myJobIds.includes(a.jobId));

  const getJob = (jobId: string) => jobs.find((j) => j.id === jobId);
  const getMatchClass = (score: number) =>
    score >= 80 ? "match-badge-high" : score >= 50 ? "match-badge-medium" : "match-badge-low";

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-1">Applicants</h1>
      <p className="text-sm text-muted-foreground mb-6">Review and manage candidates</p>

      {myApplications.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">No applications yet.</div>
      ) : (
        <div className="space-y-3">
          {myApplications.map((app) => {
            const job = getJob(app.jobId);
            const Icon = statusIcons[app.status] || Clock;
            const profile = profiles.find((p) => p.userId === app.candidateId);

            return (
              <div key={app.id} className="glass-card rounded-xl p-5 animate-fade-in">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      {profile?.avatarUrl ? (
                        <img src={profile.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{app.candidateName}</h3>
                          <Badge variant="secondary" className={getMatchClass(app.matchScore)}>
                            {app.matchScore}% match
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">Applied for: {job?.title || "Unknown"}</p>
                      </div>
                    </div>
                    {profile && (
                      <p className="text-xs text-muted-foreground ml-[52px] mb-2">
                        {profile.title} · {profile.experience} exp
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground bg-secondary/50 rounded-md px-3 py-2 mt-2">
                      {app.matchDetails}
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <Button size="sm" variant={app.status === "shortlisted" ? "default" : "ghost"} onClick={() => updateApplication(app.id, { status: "shortlisted" })} title="Shortlist">
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className={app.status === "rejected" ? "text-destructive" : ""} onClick={() => updateApplication(app.id, { status: "rejected" })} title="Reject">
                      <XCircle className="h-4 w-4" />
                    </Button>
                    {profile && (
                      <Button size="sm" variant="outline" onClick={() => setSelectedProfile(profile)} title="View Profile" className="mt-1">
                        <User className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Candidate Profile Detail Dialog */}
      <Dialog open={!!selectedProfile} onOpenChange={(o) => !o && setSelectedProfile(null)}>
        {selectedProfile && (
          <DialogContent className="max-w-lg max-h-[85vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Candidate Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {selectedProfile.avatarUrl ? (
                  <img src={selectedProfile.avatarUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold">{selectedProfile.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedProfile.title}</p>
                </div>
              </div>

              {selectedProfile.summary && (
                <p className="text-sm">{selectedProfile.summary}</p>
              )}

              {/* Contact Info */}
              <div className="bg-secondary/50 rounded-lg p-3 space-y-1.5">
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Contact Information</p>
                <p className="text-sm flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" /> {selectedProfile.email}</p>
                {selectedProfile.phone && <p className="text-sm flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> {selectedProfile.phone}</p>}
                {selectedProfile.location && <p className="text-sm flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-muted-foreground" /> {selectedProfile.location}</p>}
                {selectedProfile.linkedIn && <p className="text-sm flex items-center gap-2"><Linkedin className="h-3.5 w-3.5 text-muted-foreground" /> {selectedProfile.linkedIn}</p>}
                {selectedProfile.portfolio && <p className="text-sm flex items-center gap-2"><Globe className="h-3.5 w-3.5 text-muted-foreground" /> {selectedProfile.portfolio}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1 flex items-center gap-1"><Briefcase className="h-3 w-3" /> Experience</p>
                  <p className="text-sm">{selectedProfile.experience}</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1 flex items-center gap-1"><GraduationCap className="h-3 w-3" /> Education</p>
                  <p className="text-sm">{selectedProfile.education}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProfile.skills.map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                </div>
              </div>

              {(selectedProfile.industryExperience || []).length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1"><Building2 className="h-3 w-3" /> Industry Experience</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedProfile.industryExperience || []).map(i => <Badge key={i} variant="secondary" className="text-xs">{i}</Badge>)}
                  </div>
                </div>
              )}

              {(selectedProfile.softSkills || []).length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1"><Users className="h-3 w-3" /> Soft Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedProfile.softSkills || []).map(s => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}
                  </div>
                </div>
              )}

              {(selectedProfile.culturalFit || []).length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1"><Heart className="h-3 w-3" /> Cultural Preferences</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedProfile.culturalFit || []).map(c => <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>)}
                  </div>
                </div>
              )}

              {selectedProfile.cvFileName && (
                <p className="text-sm text-muted-foreground">📄 CV: {selectedProfile.cvFileName}</p>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default CompanyApplicants;
