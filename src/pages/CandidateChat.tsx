import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useJobStore } from "@/lib/store";
import { Job } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, Square, Plus } from "lucide-react";
import MicButton from "@/components/MicButton";
import { streamChat } from "@/lib/chat-stream";
import { toast } from "sonner";
import ChatThreadsSheet from "@/components/ChatThreadsSheet";
import { ChatThread, loadThreads, saveThread, titleFromMessages, PersistedMessage } from "@/lib/chat-threads";

interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const WELCOME = (name?: string): ChatMsg => ({
  id: "welcome",
  role: "assistant",
  content: `Hi ${name || "there"}! 👋 I'm your HireAI career assistant. I can help you:\n\n• **Explore open positions** and get details\n• **Check your profile fit** against any role\n• **Guide you through applying**\n• **Suggest improvements** to boost your chances\n\nWhat would you like to know?`,
  timestamp: new Date(),
});

const toPersisted = (msgs: ChatMsg[]): PersistedMessage[] =>
  msgs.map((m) => ({ id: m.id, role: m.role, content: m.content, timestamp: m.timestamp.toISOString() }));

const fromPersisted = (msgs: PersistedMessage[]): ChatMsg[] =>
  msgs.map((m) => ({ id: m.id, role: m.role, content: m.content, timestamp: new Date(m.timestamp) }));

const CandidateChat = () => {
  const { user } = useAuth();
  const { jobs, getProfile } = useJobStore();
  const profile = user ? getProfile(user.id) : null;

  const calculateMatch = (job: Job) => {
    if (!profile) return { score: 0, qualifies: false, missingRequirements: [] as string[], missingPreferredSkills: [] as string[], softSkillGaps: [] as string[], industryGaps: [] as string[], culturalGaps: [] as string[], matchedRequirements: [] as string[], matchedPreferredSkills: [] as string[] };

    const candidateSkills = profile.skills.map((s) => s.toLowerCase());
    const matchedRequirements: string[] = [];
    const missingRequirements: string[] = [];
    job.requirements.forEach((req) => {
      const reqLower = req.toLowerCase();
      if (candidateSkills.some((s) => reqLower.includes(s)) || reqLower.includes(profile.experience.toLowerCase())) matchedRequirements.push(req);
      else missingRequirements.push(req);
    });
    const reqScore = job.requirements.length > 0 ? (matchedRequirements.length / job.requirements.length) * 50 : 25;

    const matchedPreferredSkills: string[] = [];
    const missingPreferredSkills: string[] = [];
    job.preferredSkills.forEach((skill) => {
      if (candidateSkills.some((s) => skill.toLowerCase().includes(s) || s.includes(skill.toLowerCase()))) matchedPreferredSkills.push(skill);
      else missingPreferredSkills.push(skill);
    });
    const skillScore = job.preferredSkills.length > 0 ? (matchedPreferredSkills.length / job.preferredSkills.length) * 20 : 10;

    const candidateIndustry = (profile.industryExperience || []).map((s) => s.toLowerCase());
    const industryGaps: string[] = [];
    let industryMatched = 0;
    (job.industryExperience || []).forEach((ind) => {
      if (candidateIndustry.some((ci) => ind.toLowerCase().includes(ci) || ci.includes(ind.toLowerCase()))) industryMatched++;
      else industryGaps.push(ind);
    });
    const industryScore = (job.industryExperience || []).length > 0 ? (industryMatched / (job.industryExperience || []).length) * 10 : 5;

    const candidateSoft = (profile.softSkills || []).map((s) => s.toLowerCase());
    const softSkillGaps: string[] = [];
    let softMatched = 0;
    (job.softSkills || []).forEach((ss) => {
      if (candidateSoft.some((cs) => ss.toLowerCase().includes(cs) || cs.includes(ss.toLowerCase()))) softMatched++;
      else softSkillGaps.push(ss);
    });
    const softScore = (job.softSkills || []).length > 0 ? (softMatched / (job.softSkills || []).length) * 10 : 5;

    const candidateCulture = (profile.culturalFit || []).map((s) => s.toLowerCase());
    const culturalGaps: string[] = [];
    let cultureMatched = 0;
    (job.culturalFit || []).forEach((cf) => {
      if (candidateCulture.some((cc) => cf.toLowerCase().includes(cc) || cc.includes(cf.toLowerCase()))) cultureMatched++;
      else culturalGaps.push(cf);
    });
    const cultureScore = (job.culturalFit || []).length > 0 ? (cultureMatched / (job.culturalFit || []).length) * 10 : 5;

    const score = Math.round(reqScore + skillScore + industryScore + softScore + cultureScore);
    return { score, qualifies: score >= 50, missingRequirements, missingPreferredSkills, softSkillGaps, industryGaps, culturalGaps, matchedRequirements, matchedPreferredSkills };
  };

  const [threadId, setThreadId] = useState<string>(() => crypto.randomUUID());
  const [messages, setMessages] = useState<ChatMsg[]>([WELCOME(user?.name)]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [threadsRefresh, setThreadsRefresh] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load most recent thread for this user on first mount
  useEffect(() => {
    if (!user) return;
    const existing = loadThreads("candidate", user.id);
    if (existing.length > 0) {
      const t = existing[0];
      setThreadId(t.id);
      setMessages(fromPersisted(t.messages));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Persist whenever messages change (skip pure welcome state)
  useEffect(() => {
    if (!user) return;
    if (messages.length <= 1 && messages[0]?.id === "welcome") return;
    const thread: ChatThread = {
      id: threadId,
      title: titleFromMessages(toPersisted(messages)),
      role: "candidate",
      userId: user.id,
      messages: toPersisted(messages),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveThread(thread);
    setThreadsRefresh((n) => n + 1);
  }, [messages, threadId, user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startNewChat = useCallback(() => {
    abortRef.current?.abort();
    setThreadId(crypto.randomUUID());
    setMessages([WELCOME(user?.name)]);
    setIsTyping(false);
    setIsStreaming(false);
  }, [user?.name]);

  const openThread = useCallback((t: ChatThread) => {
    abortRef.current?.abort();
    setThreadId(t.id);
    setMessages(fromPersisted(t.messages));
    setIsTyping(false);
    setIsStreaming(false);
  }, []);

  const handleStop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsTyping(false);
    setIsStreaming(false);
    toast.message("Response stopped");
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMsg: ChatMsg = { id: crypto.randomUUID(), role: "user", content: input, timestamp: new Date() };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setIsTyping(true);
    setIsStreaming(true);

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
          matchedRequirements: m?.matchedRequirements,
          missingRequirements: m?.missingRequirements,
          matchedPreferredSkills: m?.matchedPreferredSkills,
          missingPreferredSkills: m?.missingPreferredSkills,
          softSkillGaps: m?.softSkillGaps,
          industryGaps: m?.industryGaps,
          culturalGaps: m?.culturalGaps,
        };
      }),
    };

    const assistantId = crypto.randomUUID();
    let acc = "";
    let started = false;
    const controller = new AbortController();
    abortRef.current = controller;

    await streamChat({
      role: "candidate",
      messages: history.map((m) => ({ role: m.role, content: m.content })),
      context,
      signal: controller.signal,
      onDelta: (chunk) => {
        acc += chunk;
        if (!started) {
          started = true;
          setIsTyping(false);
          setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: acc, timestamp: new Date() }]);
        } else {
          setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: acc } : m)));
        }
      },
      onDone: () => {
        setIsTyping(false);
        setIsStreaming(false);
        abortRef.current = null;
      },
      onError: (err) => {
        setIsTyping(false);
        setIsStreaming(false);
        abortRef.current = null;
        if (err.name !== "AbortError") toast.error(err.message || "Chat failed");
      },
    });
  };

  const quickActions = ["What jobs are available?", "Do I qualify?", "How do I apply?", "Remote positions?"];

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="flex items-center justify-end gap-2 px-4 lg:px-8 pt-4">
        <Button variant="ghost" size="sm" onClick={startNewChat} className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> <span className="hidden sm:inline">New chat</span>
        </Button>
        {user && (
          <ChatThreadsSheet
            role="candidate"
            userId={user.id}
            currentThreadId={threadId}
            onSelect={openThread}
            onNew={startNewChat}
            refreshKey={threadsRefresh}
          />
        )}
      </div>
      <div className="flex-1 overflow-auto p-4 lg:p-8 pt-2">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex animate-fade-in ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
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
            disabled={isStreaming}
          />
          <MicButton onTranscript={(t) => setInput((prev) => (prev ? prev + " " : "") + t)} disabled={isStreaming} />
          {isStreaming ? (
            <Button onClick={handleStop} variant="destructive" aria-label="Stop response">
              <Square className="h-4 w-4 fill-current" />
            </Button>
          ) : (
            <Button onClick={handleSend} disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateChat;
