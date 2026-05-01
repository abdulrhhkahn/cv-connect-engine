import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useJobStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Search, Briefcase, Users } from "lucide-react";

const CandidateCompanies = () => {
  const { companyProfiles, jobs } = useJobStore();
  const [query, setQuery] = useState("");

  const companies = useMemo(() => {
    const q = query.toLowerCase();
    return companyProfiles
      .map((c) => ({
        ...c,
        activeJobs: jobs.filter((j) => j.companyId === c.userId && j.status === "active"),
      }))
      .filter(
        (c) =>
          !q ||
          c.companyName.toLowerCase().includes(q) ||
          c.industry?.toLowerCase().includes(q) ||
          c.about?.toLowerCase().includes(q)
      );
  }, [companyProfiles, jobs, query]);

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-1">Companies</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Discover companies hiring on HireAI and explore their open positions
      </p>

      <div className="glass-card rounded-xl p-3 mb-6 flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search companies by name, industry, or keyword..."
          className="border-0 focus-visible:ring-0 px-0"
        />
      </div>

      {companies.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">No companies match your search.</div>
      ) : (
        <div className="space-y-3">
          {companies.map((c) => (
            <div key={c.userId} className="glass-card rounded-xl p-5 animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-lg bg-secondary flex items-center justify-center overflow-hidden shrink-0">
                  {c.logoUrl ? (
                    <img src={c.logoUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Building2 className="h-7 w-7 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <Link
                      to={`/company/${c.userId}`}
                      className="font-semibold hover:underline"
                    >
                      {c.companyName}
                    </Link>
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/company/${c.userId}`}>View profile</Link>
                    </Button>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 flex-wrap">
                    {c.industry && <Badge variant="secondary" className="text-xs">{c.industry}</Badge>}
                    {c.location && (
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {c.location}</span>
                    )}
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {(c.followers || []).length} followers</span>
                  </div>
                  {c.about && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{c.about}</p>
                  )}

                  {c.activeJobs.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                        <Briefcase className="h-3 w-3" /> Active jobs ({c.activeJobs.length})
                      </p>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {c.activeJobs.slice(0, 4).map((j) => (
                          <Link
                            key={j.id}
                            to={`/dashboard?job=${j.id}`}
                            className="bg-secondary/50 hover:bg-secondary rounded-lg px-3 py-2 transition-colors"
                          >
                            <p className="text-sm font-medium truncate">{j.title}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {j.location} · {j.type}
                            </p>
                          </Link>
                        ))}
                      </div>
                      {c.activeJobs.length > 4 && (
                        <Link
                          to={`/company/${c.userId}`}
                          className="text-xs text-primary hover:underline inline-block"
                        >
                          +{c.activeJobs.length - 4} more
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CandidateCompanies;
