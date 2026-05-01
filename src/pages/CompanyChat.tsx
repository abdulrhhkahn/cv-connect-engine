import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ChatMessage, Job } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, Sparkles, Briefcase, Save, CheckCircle2, Lightbulb, FileDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useJobStore } from "@/lib/store";
import TagInput from "@/components/TagInput";
import MicButton from "@/components/MicButton";
import JobPreviewDialog from "@/components/JobPreviewDialog";
import ExportHistoryPanel from "@/components/ExportHistoryPanel";
import { toast } from "sonner";

const roleTemplates: Record<string, { keywords: string[]; title: string; description: string; requirements: string[]; preferredSkills: string[]; experience: string; industryExperience: string[]; softSkills: string[]; culturalFit: string[] }> = {
  frontend: {
    keywords: ["frontend", "front-end", "react", "vue", "angular", "ui developer", "web developer"],
    title: "Frontend Engineer",
    description: "We're seeking a talented Frontend Engineer to build beautiful, performant user interfaces. You'll work closely with design and product teams to create exceptional user experiences.",
    requirements: ["3+ years React/TypeScript experience", "Strong HTML5/CSS3 fundamentals", "Experience with state management (Redux, Zustand, or Context API)", "Understanding of web performance optimization and Core Web Vitals", "Familiarity with responsive design and cross-browser compatibility"],
    preferredSkills: ["Next.js or Remix", "Tailwind CSS or CSS-in-JS", "Testing (Jest, Cypress, Playwright)", "Figma-to-code workflow", "GraphQL or tRPC"],
    experience: "3+ years",
    industryExperience: ["SaaS", "B2C products"],
    softSkills: ["Attention to detail", "Communication", "Collaboration"],
    culturalFit: ["Design-driven", "User-centric", "Agile methodology"],
  },
  backend: {
    keywords: ["backend", "back-end", "api", "server", "microservices", "node.js", "python developer", "go developer", "java developer"],
    title: "Backend Engineer",
    description: "Join our engineering team to design and build scalable backend services. You'll architect APIs, optimize databases, and ensure our systems handle growing traffic reliably.",
    requirements: ["3+ years backend development (Node.js, Python, Go, or Java)", "Strong database design skills (PostgreSQL, MySQL, or MongoDB)", "RESTful and/or GraphQL API design", "Experience with cloud platforms (AWS, GCP, or Azure)", "Understanding of authentication, authorization, and security best practices"],
    preferredSkills: ["Docker and Kubernetes", "Message queues (Kafka, RabbitMQ, or SQS)", "CI/CD pipelines (GitHub Actions, GitLab CI)", "Observability tools (Datadog, Grafana, Prometheus)", "Infrastructure as Code (Terraform, Pulumi)"],
    experience: "3+ years",
    industryExperience: ["Cloud infrastructure", "Fintech"],
    softSkills: ["Problem-solving", "Autonomy", "Analytical thinking"],
    culturalFit: ["Engineering excellence", "Data-driven decisions", "Remote-friendly"],
  },
  fullstack: {
    keywords: ["fullstack", "full-stack", "full stack"],
    title: "Full Stack Engineer",
    description: "We're looking for a versatile Full Stack Engineer comfortable working across the entire stack — from crafting responsive UIs to building robust APIs and managing databases.",
    requirements: ["3+ years full-stack development experience", "Proficiency in a modern frontend framework (React, Vue, or Angular)", "Backend experience with Node.js, Python, or similar", "Database design and query optimization (SQL and/or NoSQL)", "Version control with Git and code review practices"],
    preferredSkills: ["TypeScript end-to-end", "DevOps and CI/CD pipelines", "Cloud services (AWS, GCP, Vercel, or similar)", "Testing at all levels (unit, integration, e2e)", "WebSocket or real-time communication"],
    experience: "3+ years",
    industryExperience: ["Startups", "SaaS"],
    softSkills: ["Adaptability", "Communication", "Self-motivation"],
    culturalFit: ["Ownership mindset", "Fast-paced environment", "Collaborative"],
  },
  design: {
    keywords: ["design", "ux", "ui", "product designer", "ux researcher", "interaction design"],
    title: "Product Designer",
    description: "We're looking for a Product Designer to shape the future of our product experience. You'll lead design from concept to launch, creating intuitive interfaces backed by user research.",
    requirements: ["4+ years product design experience", "Strong portfolio of shipped digital products", "Expert proficiency in Figma", "User research and usability testing skills", "Experience building and maintaining design systems"],
    preferredSkills: ["Motion design and prototyping (Framer, Principle)", "Basic HTML/CSS understanding", "Data visualization design", "Accessibility (WCAG) expertise", "Workshop facilitation"],
    experience: "4+ years",
    industryExperience: ["Consumer tech", "SaaS"],
    softSkills: ["Creativity", "Empathy", "Storytelling", "Communication"],
    culturalFit: ["User-centric", "Design-driven culture", "Inclusive environment"],
  },
  data: {
    keywords: ["data scientist", "data analyst", "machine learning", "ml engineer", "data engineer", "analytics"],
    title: "Data Scientist",
    description: "Join our data team to uncover insights that drive business decisions. You'll build predictive models, analyze large datasets, and collaborate with stakeholders to translate data into action.",
    requirements: ["3+ years data science or analytics experience", "Strong Python/R proficiency for data analysis", "Statistical modeling and hypothesis testing", "Advanced SQL and data pipeline experience", "Experience with ML frameworks (scikit-learn, TensorFlow, or PyTorch)"],
    preferredSkills: ["Deep learning and NLP", "Apache Spark or Databricks", "A/B testing and experimentation platforms", "Data visualization (Tableau, Looker, or D3.js)", "MLOps and model deployment"],
    experience: "3+ years",
    industryExperience: ["Analytics", "AI/ML"],
    softSkills: ["Analytical thinking", "Communication", "Intellectual curiosity"],
    culturalFit: ["Data-driven culture", "Research-oriented", "Collaborative"],
  },
  devops: {
    keywords: ["devops", "sre", "site reliability", "infrastructure", "platform engineer", "cloud engineer"],
    title: "DevOps Engineer",
    description: "We're hiring a DevOps Engineer to build and maintain our cloud infrastructure, CI/CD pipelines, and monitoring systems. You'll ensure our services are reliable, scalable, and secure.",
    requirements: ["3+ years DevOps or SRE experience", "Strong Linux systems administration", "Container orchestration (Kubernetes, Docker Swarm)", "CI/CD pipeline design (Jenkins, GitHub Actions, GitLab CI)", "Infrastructure as Code (Terraform, CloudFormation, or Pulumi)"],
    preferredSkills: ["Service mesh (Istio, Linkerd)", "Monitoring and alerting (Prometheus, Grafana, PagerDuty)", "Security hardening and compliance", "Cost optimization on cloud platforms", "Scripting (Bash, Python)"],
    experience: "3+ years",
    industryExperience: ["Cloud-native", "High-traffic systems"],
    softSkills: ["Problem-solving under pressure", "Documentation", "Collaboration"],
    culturalFit: ["Reliability-focused", "Automation-first", "Blameless culture"],
  },
  mobile: {
    keywords: ["mobile", "ios", "android", "react native", "flutter", "swift", "kotlin"],
    title: "Mobile Developer",
    description: "We're looking for a Mobile Developer to build and maintain high-quality mobile applications. You'll own the full mobile development lifecycle from architecture to App Store deployment.",
    requirements: ["3+ years mobile development experience", "Proficiency in React Native, Flutter, Swift, or Kotlin", "Understanding of mobile UI/UX patterns and guidelines", "Experience with RESTful APIs and offline-first architecture", "App Store and Google Play submission process"],
    preferredSkills: ["Native iOS and Android development", "Push notifications and deep linking", "Mobile analytics and crash reporting", "Accessibility on mobile platforms", "CI/CD for mobile (Fastlane, Bitrise)"],
    experience: "3+ years",
    industryExperience: ["Consumer apps", "E-commerce"],
    softSkills: ["Attention to detail", "User empathy", "Self-direction"],
    culturalFit: ["Mobile-first mindset", "Quality-focused", "Iterative development"],
  },
  pm: {
    keywords: ["product manager", "project manager", "scrum master", "program manager", "product owner"],
    title: "Product Manager",
    description: "We're seeking a Product Manager to define product strategy, prioritize the roadmap, and collaborate with engineering and design to deliver features that delight users and drive growth.",
    requirements: ["4+ years product management experience", "Track record of shipping successful products", "Strong analytical skills and data-driven decision making", "Excellent stakeholder communication", "Experience writing PRDs and user stories"],
    preferredSkills: ["SQL or data querying skills", "A/B testing and experimentation", "Agile/Scrum certification", "Technical background or CS degree", "Market research and competitive analysis"],
    experience: "4+ years",
    industryExperience: ["Tech", "SaaS"],
    softSkills: ["Leadership", "Communication", "Strategic thinking", "Empathy"],
    culturalFit: ["Customer-obsessed", "Data-informed", "Cross-functional collaboration"],
  },
  marketing: {
    keywords: ["marketing", "growth", "seo", "content", "brand", "social media", "digital marketing"],
    title: "Marketing Manager",
    description: "We're hiring a Marketing Manager to develop and execute marketing strategies that drive brand awareness, user acquisition, and engagement across multiple channels.",
    requirements: ["3+ years marketing experience", "Proven track record in digital marketing campaigns", "Analytics proficiency (Google Analytics, Mixpanel)", "Content strategy and copywriting skills", "Budget management and ROI analysis"],
    preferredSkills: ["SEO/SEM expertise", "Marketing automation (HubSpot, Marketo)", "Social media advertising", "Email marketing and CRM tools", "Video content creation"],
    experience: "3+ years",
    industryExperience: ["Tech", "D2C"],
    softSkills: ["Creativity", "Communication", "Analytical thinking"],
    culturalFit: ["Growth-oriented", "Experimental mindset", "Brand-conscious"],
  },
  sales: {
    keywords: ["sales", "account executive", "business development", "bdr", "sdr", "revenue"],
    title: "Sales Representative",
    description: "Join our sales team to drive revenue growth by building relationships with prospects, understanding their needs, and delivering compelling product demonstrations.",
    requirements: ["2+ years B2B sales experience", "Proven quota attainment track record", "CRM proficiency (Salesforce, HubSpot)", "Excellent presentation and negotiation skills", "Pipeline management and forecasting"],
    preferredSkills: ["SaaS sales experience", "Outbound prospecting tools (Outreach, Apollo)", "Industry vertical expertise", "Solution selling methodology (MEDDIC, SPIN)", "Contract negotiation"],
    experience: "2+ years",
    industryExperience: ["SaaS", "Enterprise software"],
    softSkills: ["Persuasion", "Resilience", "Active listening", "Time management"],
    culturalFit: ["Results-driven", "Competitive spirit", "Team player"],
  },
};

const generateJobFromPrompt = (prompt: string, companyId: string, companyName: string): Job => {
  const lower = prompt.toLowerCase();

  // Find matching template
  let matched = Object.values(roleTemplates).find(t => t.keywords.some(k => lower.includes(k)));

  let title: string;
  let description: string;
  let requirements: string[];
  let preferredSkills: string[];
  let experience: string;
  let industryExperience: string[];
  let softSkills: string[];
  let culturalFit: string[];

  if (matched) {
    ({ title, description, requirements, preferredSkills, experience, industryExperience, softSkills, culturalFit } = matched);
  } else {
    // Extract a meaningful title from the prompt
    title = prompt.replace(/^(create|post|make|build|write|generate|i need|looking for|hire|we need)\s+(a\s+)?(job\s+)?(posting\s+)?(for\s+)?(an?\s+)?/i, "").trim();
    title = title.length > 60 ? title.slice(0, 60) : title;
    title = title.charAt(0).toUpperCase() + title.slice(1) || "Software Engineer";
    description = `We're looking for a talented ${title} to join our growing team. You'll work on impactful projects, collaborate cross-functionally, and help shape the future of our product.`;
    requirements = [`2+ years experience as a ${title} or similar role`, "Strong problem-solving and analytical skills", "Excellent written and verbal communication", "Ability to work independently and in a team", "Relevant education or equivalent practical experience"];
    preferredSkills = ["Industry certifications or specialized training", "Experience with modern tools and workflows", "Cross-functional collaboration experience", "Mentoring or leadership experience"];
    experience = "2+ years";
    industryExperience = [];
    softSkills = ["Communication", "Adaptability", "Teamwork"];
    culturalFit = ["Collaborative", "Growth-oriented"];
  }

  // Apply seniority modifiers
  if (lower.includes("senior") || lower.includes("sr")) {
    title = "Senior " + title;
    experience = "5+ years";
    requirements = requirements.map(r => r.replace(/\d\+/, "5+"));
    softSkills = [...new Set([...softSkills, "Leadership", "Mentoring"])];
  } else if (lower.includes("lead") || lower.includes("principal")) {
    title = "Lead " + title;
    experience = "7+ years";
    requirements = requirements.map(r => r.replace(/\d\+/, "7+"));
    softSkills = [...new Set([...softSkills, "Leadership", "Strategic thinking", "Mentoring"])];
  } else if (lower.includes("junior") || lower.includes("jr") || lower.includes("entry")) {
    title = "Junior " + title;
    experience = "0-2 years";
    requirements = requirements.map(r => r.replace(/\d\+ years/, "0-2 years"));
    softSkills = softSkills.filter(s => s !== "Leadership" && s !== "Mentoring");
    softSkills = [...new Set([...softSkills, "Eagerness to learn", "Receptiveness to feedback"])];
  }

  // Extract salary hints
  const salaryMatch = prompt.match(/\$[\d,]+[kK]?\s*[-–]\s*\$[\d,]+[kK]?/);
  const salary = salaryMatch ? salaryMatch[0] : undefined;

  return {
    id: crypto.randomUUID(),
    companyId,
    companyName,
    title,
    description,
    requirements,
    preferredSkills,
    experienceRequired: experience,
    location: lower.includes("remote") ? "Remote" : lower.includes("hybrid") ? "Hybrid" : "On-site",
    type: lower.includes("remote") ? "remote" : lower.includes("contract") ? "contract" : lower.includes("part-time") || lower.includes("part time") ? "part-time" : "full-time",
    salary,
    createdAt: new Date(),
    status: "draft",
    industryExperience,
    softSkills,
    culturalFit,
  };
};

// Generate interactive AI suggestions for a draft job
const generateSuggestions = (job: Job): string[] => {
  const tips: string[] = [];
  if (!job.salary) tips.push("💰 Consider adding a salary range — postings with salary info get 30% more applications.");
  if (!job.industryExperience || job.industryExperience.length === 0) tips.push("🏢 Specify industry experience to attract candidates with the right background.");
  if (!job.softSkills || job.softSkills.length < 3) tips.push("🤝 Add a few soft skills (e.g. communication, ownership) — they help screen for cultural fit.");
  if (!job.culturalFit || job.culturalFit.length === 0) tips.push("🌱 Describe your team culture — values like 'remote-first' or 'collaborative' attract aligned candidates.");
  if (job.requirements.length > 7) tips.push("✂️ You have many hard requirements. Consider moving some to 'preferred skills' to widen your candidate pool.");
  if (job.location === "On-site") tips.push("🌍 Offering remote or hybrid work can dramatically expand your talent pool.");
  if (!job.description.toLowerCase().includes("benefit") && !job.description.toLowerCase().includes("perk")) {
    tips.push("🎁 Mention key benefits or perks in the description (health, equity, learning budget, PTO).");
  }
  if (!/diversit|inclus|equal opportunity/i.test(job.description)) {
    tips.push("✨ Add a diversity & inclusion statement to encourage applications from underrepresented groups.");
  }
  return tips.slice(0, 4);
};

interface DraftMessage extends ChatMessage {
  draftJob?: Job;
  saved?: boolean;
  suggestions?: string[];
}

const CompanyChat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addJob } = useJobStore();
  const [messages, setMessages] = useState<DraftMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hi ${user?.name}! 👋 I'm your AI hiring assistant. Tell me about the role you want to fill and I'll draft a professional job posting that you can refine inline before saving.\n\nTry something like:\n• "Post a senior frontend engineer role"\n• "I need a remote backend developer with $120k - $150k"\n• "Create a job for a UX designer in Berlin"`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [previewJob, setPreviewJob] = useState<Job | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const updateDraft = (msgId: string, updates: Partial<Job>) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId || !m.draftJob) return m;
        const updated = { ...m.draftJob, ...updates };
        return { ...m, draftJob: updated, suggestions: generateSuggestions(updated) };
      })
    );
  };

  const saveDraft = (msgId: string) => {
    const msg = messages.find((m) => m.id === msgId);
    if (!msg?.draftJob) return;
    addJob(msg.draftJob);
    setMessages((prev) => prev.map((m) => (m.id === msgId ? { ...m, saved: true } : m)));
    toast.success("Draft saved to Jobs");
  };

  const handleSend = async () => {
    if (!input.trim() || !user) return;
    const userMsg: DraftMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    await new Promise((r) => setTimeout(r, 1000));

    const job = generateJobFromPrompt(input, user.id, user.company || user.name);
    const suggestions = generateSuggestions(job);

    const response: DraftMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: `I've drafted a **${job.title}** posting. Review and edit any field below — when it looks right, click **Save Draft** to add it to your Jobs.`,
      timestamp: new Date(),
      draftJob: job,
      suggestions,
    };

    setMessages((prev) => [...prev, response]);
    setIsTyping(false);
  };


  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="flex items-center justify-end px-4 lg:px-8 pt-4">
        <ExportHistoryPanel />
      </div>
      <div className="flex-1 overflow-auto p-4 lg:p-8 pt-2">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="space-y-3 animate-fade-in">
              <div className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
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
                </div>
              </div>

              {msg.draftJob && (
                <div className="glass-card rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-primary" />
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Draft Job — Editable
                      </span>
                    </div>
                    {msg.saved && (
                      <Badge variant="secondary" className="match-badge-high text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Saved
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Title</label>
                      <Input
                        value={msg.draftJob.title}
                        onChange={(e) => updateDraft(msg.id, { title: e.target.value })}
                        disabled={msg.saved}
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Experience</label>
                      <Input
                        value={msg.draftJob.experienceRequired}
                        onChange={(e) => updateDraft(msg.id, { experienceRequired: e.target.value })}
                        disabled={msg.saved}
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Location</label>
                      <Input
                        value={msg.draftJob.location}
                        onChange={(e) => updateDraft(msg.id, { location: e.target.value })}
                        disabled={msg.saved}
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Salary (optional)</label>
                      <Input
                        value={msg.draftJob.salary || ""}
                        onChange={(e) => updateDraft(msg.id, { salary: e.target.value })}
                        disabled={msg.saved}
                        placeholder="$120k - $150k"
                        className="mt-1 h-8 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Description</label>
                    <Textarea
                      value={msg.draftJob.description}
                      onChange={(e) => updateDraft(msg.id, { description: e.target.value })}
                      disabled={msg.saved}
                      rows={3}
                      className="mt-1 text-sm"
                    />
                  </div>

                  <TagInput
                    label="Requirements"
                    tags={msg.draftJob.requirements}
                    onAdd={(t) => updateDraft(msg.id, { requirements: [...msg.draftJob!.requirements, t] })}
                    onRemove={(t) => updateDraft(msg.id, { requirements: msg.draftJob!.requirements.filter((x) => x !== t) })}
                    placeholder="Add a requirement..."
                  />
                  <TagInput
                    label="Preferred Skills"
                    tags={msg.draftJob.preferredSkills}
                    onAdd={(t) => updateDraft(msg.id, { preferredSkills: [...msg.draftJob!.preferredSkills, t] })}
                    onRemove={(t) => updateDraft(msg.id, { preferredSkills: msg.draftJob!.preferredSkills.filter((x) => x !== t) })}
                    placeholder="Add a preferred skill..."
                  />
                  <TagInput
                    label="Industry Experience"
                    tags={msg.draftJob.industryExperience || []}
                    onAdd={(t) => updateDraft(msg.id, { industryExperience: [...(msg.draftJob!.industryExperience || []), t] })}
                    onRemove={(t) => updateDraft(msg.id, { industryExperience: (msg.draftJob!.industryExperience || []).filter((x) => x !== t) })}
                    placeholder="e.g. SaaS, Fintech..."
                  />
                  <TagInput
                    label="Soft Skills"
                    tags={msg.draftJob.softSkills || []}
                    onAdd={(t) => updateDraft(msg.id, { softSkills: [...(msg.draftJob!.softSkills || []), t] })}
                    onRemove={(t) => updateDraft(msg.id, { softSkills: (msg.draftJob!.softSkills || []).filter((x) => x !== t) })}
                    placeholder="e.g. Leadership, Communication..."
                  />
                  <TagInput
                    label="Cultural Fit"
                    tags={msg.draftJob.culturalFit || []}
                    onAdd={(t) => updateDraft(msg.id, { culturalFit: [...(msg.draftJob!.culturalFit || []), t] })}
                    onRemove={(t) => updateDraft(msg.id, { culturalFit: (msg.draftJob!.culturalFit || []).filter((x) => x !== t) })}
                    placeholder="e.g. Collaborative, Remote-first..."
                  />

                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button size="sm" onClick={() => saveDraft(msg.id)} disabled={msg.saved}>
                      <Save className="h-3.5 w-3.5 mr-1" />
                      {msg.saved ? "Saved" : "Save Draft"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setPreviewJob(msg.draftJob!)}>
                      <FileDown className="h-3.5 w-3.5 mr-1" /> Export / Preview
                    </Button>
                    {msg.saved && (
                      <Button size="sm" variant="outline" onClick={() => navigate("/jobs")}>
                        <Briefcase className="h-3.5 w-3.5 mr-1" /> View in Jobs
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {msg.suggestions && msg.suggestions.length > 0 && !msg.saved && (
                <div className="rounded-xl border border-primary/20 bg-accent/40 p-4">
                  <div className="flex items-center gap-1.5 mb-2 text-primary">
                    <Lightbulb className="h-3.5 w-3.5" />
                    <span className="text-xs font-semibold uppercase tracking-wide">AI Suggestions</span>
                  </div>
                  <ul className="space-y-1.5">
                    {msg.suggestions.map((s, i) => (
                      <li key={i} className="text-xs leading-relaxed text-foreground/90">{s}</li>
                    ))}
                  </ul>
                </div>
              )}
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
          <div ref={scrollRef} />
        </div>
      </div>

      <div className="border-t border-border p-4">
        <div className="max-w-2xl mx-auto flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Describe the role you want to post..."
            className="flex-1"
          />
          <MicButton onTranscript={(t) => setInput((prev) => (prev ? prev + " " : "") + t)} disabled={isTyping} />
          <Button onClick={handleSend} disabled={!input.trim() || isTyping}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <JobPreviewDialog open={!!previewJob} onOpenChange={(o) => !o && setPreviewJob(null)} job={previewJob} />
    </div>
  );
};

export default CompanyChat;
