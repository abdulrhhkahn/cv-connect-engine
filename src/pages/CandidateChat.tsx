import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useJobStore } from "@/lib/store";
import { Job } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Sparkles, Briefcase, MapPin, Clock } from "lucide-react";

interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  jobs?: Job[];
}

const generateResponse = (
  input: string,
  jobs: Job[],
  profile: ReturnType<ReturnType<typeof useJobStore>["getProfile"]>,
  calculateMatch: (job: Job) => { score: number; details: string; qualifies: boolean; softSkillGaps: string[]; industryGaps: string[]; culturalGaps: string[] }
): { content: string; jobs?: Job[] } => {
  const lower = input.toLowerCase();

  // Greeting
  if (/^(hi|hello|hey|howdy|good\s*(morning|afternoon|evening))/i.test(lower)) {
    return {
      content: `Hey there! 👋 I'm the HireAI assistant. I can help you with:\n\n• **Browse open positions** — ask about available jobs\n• **Check your fit** — I'll analyze how your profile matches a role\n• **Application help** — tips on what to improve\n• **Job details** — ask about requirements, salary, location\n\nWhat would you like to know?`,
    };
  }

  // List jobs / what's available
  if (/(what|which|show|list|any|open|available|current)\s*(jobs|positions|roles|openings)/i.test(lower) || lower.includes("what's hiring") || lower.includes("opportunities")) {
    const activeJobs = jobs.filter((j) => j.status === "active");
    if (activeJobs.length === 0) {
      return { content: "There are no open positions right now. Check back soon — new roles are posted regularly!" };
    }
    const jobList = activeJobs
      .map((j) => {
        const match = profile ? calculateMatch(j) : null;
        return `• **${j.title}** at ${j.companyName} — ${j.location}, ${j.type}${match ? ` (${match.score}% match)` : ""}`;
      })
      .join("\n");
    return {
      content: `Here are the current open positions:\n\n${jobList}\n\nAsk me about any specific role for more details or to check your fit!`,
      jobs: activeJobs,
    };
  }

  // Match for a specific job
  const matchJob = jobs.find(
    (j) => j.status === "active" && (lower.includes(j.title.toLowerCase()) || lower.includes(j.companyName.toLowerCase()))
  );

  // Profile fit / do I qualify
  if (/(fit|match|qualify|eligible|suitable|chance|good\s*for|right\s*for|profile)/i.test(lower)) {
    if (!profile) {
      return {
        content: "I'd love to check your fit, but you haven't completed your profile yet. Head to the **Profile** tab to add your skills, experience, and soft skills — then come back and I'll give you a detailed breakdown!",
      };
    }

    if (matchJob) {
      const match = calculateMatch(matchJob);
      const parts: string[] = [];
      parts.push(`**${matchJob.title}** — ${match.score}% match ${match.qualifies ? "✅" : "⚠️"}`);
      parts.push("");
      parts.push(match.details);

      if (match.softSkillGaps.length > 0) {
        parts.push(`\n💡 **Soft skills to develop:** ${match.softSkillGaps.join(", ")}`);
      }
      if (match.industryGaps.length > 0) {
        parts.push(`🏢 **Industry experience gaps:** ${match.industryGaps.join(", ")}`);
      }
      if (match.culturalGaps.length > 0) {
        parts.push(`🤝 **Cultural alignment:** Consider highlighting ${match.culturalGaps.join(", ")}`);
      }

      if (!match.qualifies) {
        parts.push("\n**Tips to improve your chances:**");
        parts.push("• Update your profile with any relevant experience you may have missed");
        parts.push("• Add soft skills and industry experience tags");
        parts.push("• Consider upskilling in the gap areas above");
      } else {
        parts.push("\n🎉 You're a strong candidate! Head to **Jobs** to apply.");
      }

      return { content: parts.join("\n") };
    }

    // General fit check across all jobs
    const activeJobs = jobs.filter((j) => j.status === "active");
    const fits = activeJobs.map((j) => ({ job: j, match: calculateMatch(j) })).sort((a, b) => b.match.score - a.match.score);

    if (fits.length === 0) {
      return { content: "No open positions to compare against right now. Check back soon!" };
    }

    const top = fits.slice(0, 3);
    const lines = top.map((f) => `• **${f.job.title}** — ${f.match.score}% match ${f.match.qualifies ? "✅" : "⚠️"}`);

    return {
      content: `Here's how your profile stacks up against open roles:\n\n${lines.join("\n")}\n\nAsk about a specific role for detailed feedback!`,
    };
  }

  // Job details
  if (matchJob) {
    const match = profile ? calculateMatch(matchJob) : null;
    const parts = [
      `**${matchJob.title}** at ${matchJob.companyName}`,
      "",
      matchJob.description,
      "",
      `**Location:** ${matchJob.location}`,
      `**Type:** ${matchJob.type}`,
      `**Experience:** ${matchJob.experienceRequired}`,
      matchJob.salary ? `**Salary:** ${matchJob.salary}` : "",
      "",
      `**Requirements:** ${matchJob.requirements.join(", ")}`,
      "",
      `**Preferred Skills:** ${matchJob.preferredSkills.join(", ")}`,
    ];

    if (matchJob.softSkills?.length) {
      parts.push("", `**Soft Skills:** ${matchJob.softSkills.join(", ")}`);
    }
    if (matchJob.industryExperience?.length) {
      parts.push(`**Industry:** ${matchJob.industryExperience.join(", ")}`);
    }
    if (matchJob.culturalFit?.length) {
      parts.push(`**Culture:** ${matchJob.culturalFit.join(", ")}`);
    }

    if (match) {
      parts.push("", `**Your match: ${match.score}%** ${match.qualifies ? "— You qualify! ✅" : "— Below threshold ⚠️"}`);
    }

    return { content: parts.filter(Boolean).join("\n") };
  }

  // How to apply
  if (/(how|help).*(apply|application|submit)/i.test(lower)) {
    return {
      content: `Here's how to apply:\n\n1. **Complete your profile** — add skills, experience, soft skills, and industry background\n2. **Browse Jobs** — check the Jobs tab for open positions\n3. **Check your fit** — click a job to see your match score\n4. **Apply** — if you meet the 50% threshold, hit "Apply Now"\n\nI can also check your fit for any role — just ask!`,
    };
  }

  // Salary questions
  if (/(salary|pay|compensation|how\s*much)/i.test(lower)) {
    const withSalary = jobs.filter((j) => j.status === "active" && j.salary);
    if (withSalary.length === 0) {
      return { content: "Salary details aren't listed for current openings. You can ask about them during the interview process." };
    }
    const lines = withSalary.map((j) => `• **${j.title}** — ${j.salary}`);
    return { content: `Here's salary info for current roles:\n\n${lines.join("\n")}` };
  }

  // Remote work
  if (/(remote|work\s*from\s*home|wfh|hybrid)/i.test(lower)) {
    const remote = jobs.filter((j) => j.status === "active" && (j.type === "remote" || j.location.toLowerCase().includes("remote")));
    if (remote.length === 0) {
      return { content: "There aren't any remote positions listed right now, but new roles are added regularly." };
    }
    const lines = remote.map((j) => `• **${j.title}** at ${j.companyName}`);
    return { content: `These positions are remote-friendly:\n\n${lines.join("\n")}\n\nAsk about any role for more details!` };
  }

  // Fallback
  return {
    content: `I'm not sure I understand that. Here's what I can help with:\n\n• **"What jobs are available?"** — see open positions\n• **"Do I qualify for [job title]?"** — profile fit analysis\n• **"How do I apply?"** — application process\n• **"Tell me about [job title]"** — job details\n• **"What's the salary for..."** — compensation info\n\nGive it a try!`,
  };
};

const CandidateChat = () => {
  const { user } = useAuth();
  const { jobs, getProfile } = useJobStore();
  const profile = user ? getProfile(user.id) : null;

  const calculateMatch = (job: Job) => {
    if (!profile) return { score: 0, details: "Complete your profile", qualifies: false, missing: [] as string[], softSkillGaps: [] as string[], industryGaps: [] as string[], culturalGaps: [] as string[] };

    const candidateSkills = profile.skills.map((s) => s.toLowerCase());
    let matched = 0;
    const missing: string[] = [];
    job.requirements.forEach((req) => {
      const reqLower = req.toLowerCase();
      if (candidateSkills.some((s) => reqLower.includes(s)) || reqLower.includes(profile.experience.toLowerCase())) matched++;
      else missing.push(req);
    });
    const reqScore = job.requirements.length > 0 ? (matched / job.requirements.length) * 50 : 25;

    let skillMatched = 0;
    job.preferredSkills.forEach((skill) => {
      if (candidateSkills.some((s) => skill.toLowerCase().includes(s) || s.includes(skill.toLowerCase()))) skillMatched++;
    });
    const skillScore = job.preferredSkills.length > 0 ? (skillMatched / job.preferredSkills.length) * 20 : 10;

    const candidateIndustry = (profile.industryExperience || []).map((s) => s.toLowerCase());
    const jobIndustry = job.industryExperience || [];
    let industryMatched = 0;
    const industryGaps: string[] = [];
    jobIndustry.forEach((ind) => {
      if (candidateIndustry.some((ci) => ind.toLowerCase().includes(ci) || ci.includes(ind.toLowerCase()))) industryMatched++;
      else industryGaps.push(ind);
    });
    const industryScore = jobIndustry.length > 0 ? (industryMatched / jobIndustry.length) * 10 : 5;

    const candidateSoft = (profile.softSkills || []).map((s) => s.toLowerCase());
    const jobSoft = job.softSkills || [];
    let softMatched = 0;
    const softSkillGaps: string[] = [];
    jobSoft.forEach((ss) => {
      if (candidateSoft.some((cs) => ss.toLowerCase().includes(cs) || cs.includes(ss.toLowerCase()))) softMatched++;
      else softSkillGaps.push(ss);
    });
    const softScore = jobSoft.length > 0 ? (softMatched / jobSoft.length) * 10 : 5;

    const candidateCulture = (profile.culturalFit || []).map((s) => s.toLowerCase());
    const jobCulture = job.culturalFit || [];
    let cultureMatched = 0;
    const culturalGaps: string[] = [];
    jobCulture.forEach((cf) => {
      if (candidateCulture.some((cc) => cf.toLowerCase().includes(cc) || cc.includes(cf.toLowerCase()))) cultureMatched++;
      else culturalGaps.push(cf);
    });
    const cultureScore = jobCulture.length > 0 ? (cultureMatched / jobCulture.length) * 10 : 5;

    const score = Math.round(reqScore + skillScore + industryScore + softScore + cultureScore);
    const qualifies = score >= 50;

    const detailParts: string[] = [`${matched}/${job.requirements.length} requirements`, `${skillMatched}/${job.preferredSkills.length} preferred skills`];
    if (jobIndustry.length) detailParts.push(`${industryMatched}/${jobIndustry.length} industry exp`);
    if (jobSoft.length) detailParts.push(`${softMatched}/${jobSoft.length} soft skills`);
    if (jobCulture.length) detailParts.push(`${cultureMatched}/${jobCulture.length} cultural fit`);

    const details = qualifies
      ? `Strong match! You meet ${detailParts.join(", ")}.`
      : `You meet ${detailParts.join(", ")}.`;

    return { score, details, qualifies, missing, softSkillGaps, industryGaps, culturalGaps };
  };

  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hi ${user?.name || "there"}! 👋 I'm your HireAI career assistant. I can help you:\n\n• **Explore open positions** and get details\n• **Check your profile fit** against any role\n• **Guide you through applying**\n• **Suggest improvements** to boost your chances\n\nWhat would you like to know?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMsg = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 800 + Math.random() * 600));

    const response = generateResponse(input, jobs, profile, calculateMatch);

    const botMsg: ChatMsg = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: response.content,
      timestamp: new Date(),
      jobs: response.jobs,
    };

    setMessages((prev) => [...prev, botMsg]);
    setIsTyping(false);
  };

  const quickActions = [
    "What jobs are available?",
    "Do I qualify?",
    "How do I apply?",
    "Remote positions?",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="flex-1 overflow-auto p-4 lg:p-8">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex animate-fade-in ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === "user" ? "chat-bubble-user text-foreground" : "chat-bubble-ai"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-1.5 mb-2 text-primary">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">HireAI</span>
                  </div>
                )}
                {msg.content.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
                  part.startsWith("**") && part.endsWith("**") ? (
                    <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}
                {msg.jobs && msg.jobs.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {msg.jobs.slice(0, 4).map((job) => (
                      <Badge key={job.id} variant="secondary" className="text-xs gap-1">
                        <Briefcase className="h-3 w-3" />
                        {job.title}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="chat-bubble-ai rounded-xl px-4 py-3 flex items-center gap-1.5">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          {messages.length === 1 && (
            <div className="flex flex-wrap gap-2 justify-center pt-2 animate-fade-in">
              {quickActions.map((action) => (
                <Button
                  key={action}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setInput(action);
                    setTimeout(() => {
                      setInput(action);
                      const el = document.querySelector<HTMLInputElement>("[data-chat-input]");
                      el?.focus();
                    }, 0);
                  }}
                >
                  {action}
                </Button>
              ))}
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </div>

      <div className="border-t border-border p-4">
        <div className="max-w-2xl mx-auto flex gap-2">
          <Input
            data-chat-input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask about jobs, your fit, how to apply..."
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!input.trim() || isTyping}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CandidateChat;
