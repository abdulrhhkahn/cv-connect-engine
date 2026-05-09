import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useJobStore } from "@/lib/store";
import { Job } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles } from "lucide-react";
import MicButton from "@/components/MicButton";
import { streamChat } from "@/lib/chat-stream";
import { toast } from "sonner";

interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

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
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMsg = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setIsTyping(true);

    const activeJobs = jobs.filter((j) => j.status === "active");
    const context = {
      candidate: profile
        ? {
            name: user?.name,
            skills: profile.skills,
            experience: profile.experience,
            softSkills: profile.softSkills,
            industryExperience: profile.industryExperience,
            culturalFit: profile.culturalFit,
          }
        : null,
      jobs: activeJobs.map((j) => {
        const m = profile ? calculateMatch(j) : null;
        return {
          id: j.id,
          title: j.title,
          companyName: j.companyName,
          location: j.location,
          type: j.type,
          experienceRequired: j.experienceRequired,
          salary: j.salary,
          requirements: j.requirements,
          preferredSkills: j.preferredSkills,
          softSkills: j.softSkills,
          industryExperience: j.industryExperience,
          culturalFit: j.culturalFit,
          description: j.description,
          matchScore: m?.score,
          qualifies: m?.qualifies,
        };
      }),
    };

    const assistantId = crypto.randomUUID();
    let acc = "";
    let started = false;

    await streamChat({
      role: "candidate",
      messages: history.map((m) => ({ role: m.role, content: m.content })),
      context,
      onDelta: (chunk) => {
        acc += chunk;
        if (!started) {
          started = true;
          setIsTyping(false);
          setMessages((prev) => [
            ...prev,
            { id: assistantId, role: "assistant", content: acc, timestamp: new Date() },
          ]);
        } else {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: acc } : m))
          );
        }
      },
      onDone: () => setIsTyping(false),
      onError: (err) => {
        setIsTyping(false);
        toast.error(err.message || "Chat failed");
      },
    });
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
                className={`w-fit max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line break-words ${
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
          <MicButton onTranscript={(t) => setInput((prev) => (prev ? prev + " " : "") + t)} disabled={isTyping} />
          <Button onClick={handleSend} disabled={!input.trim() || isTyping}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CandidateChat;
