import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ChatMessage, Job } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, Briefcase, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useJobStore } from "@/lib/store";

const generateJobFromPrompt = (prompt: string, companyId: string, companyName: string): Job => {
  const lower = prompt.toLowerCase();
  const isFrontend = lower.includes("frontend") || lower.includes("front-end") || lower.includes("react");
  const isBackend = lower.includes("backend") || lower.includes("back-end") || lower.includes("api");
  const isDesign = lower.includes("design") || lower.includes("ux") || lower.includes("ui");
  const isData = lower.includes("data") || lower.includes("analyst") || lower.includes("machine learning");

  let title = "Software Engineer";
  let description = "";
  let requirements: string[] = [];
  let preferredSkills: string[] = [];
  let experience = "3+ years";
  let industryExperience: string[] = [];
  let softSkills: string[] = [];
  let culturalFit: string[] = [];

  if (isFrontend) {
    title = "Frontend Engineer";
    description = "We're seeking a talented Frontend Engineer to build beautiful, performant user interfaces. You'll work closely with design and product teams to create exceptional user experiences that delight our customers.";
    requirements = ["3+ years React/TypeScript experience", "Strong HTML/CSS fundamentals", "Experience with state management", "Understanding of web performance optimization", "Bachelor's in CS or equivalent experience"];
    preferredSkills = ["Next.js", "Tailwind CSS", "Testing (Jest/Cypress)", "Figma", "GraphQL"];
    experience = "3+ years";
    industryExperience = ["SaaS", "B2C"];
    softSkills = ["Attention to detail", "Communication", "Collaboration"];
    culturalFit = ["Design-driven", "User-centric", "Agile"];
  } else if (isBackend) {
    title = "Backend Engineer";
    description = "Join our engineering team to design and build scalable backend services. You'll architect APIs, optimize databases, and ensure our systems handle growing traffic with reliability.";
    requirements = ["3+ years backend development", "Proficiency in Node.js, Python, or Go", "Database design (SQL & NoSQL)", "RESTful API design", "Experience with cloud services (AWS/GCP)"];
    preferredSkills = ["Kubernetes/Docker", "Message queues (Kafka/RabbitMQ)", "CI/CD pipelines", "Microservices architecture", "Performance monitoring"];
    experience = "3+ years";
    industryExperience = ["Cloud infrastructure", "Fintech"];
    softSkills = ["Problem-solving", "Autonomy", "Analytical thinking"];
    culturalFit = ["Engineering excellence", "Data-driven", "Remote-friendly"];
  } else if (isDesign) {
    title = "Product Designer";
    description = "We're looking for a Product Designer to shape the future of our product experience. You'll lead design from concept to launch, creating intuitive interfaces backed by user research.";
    requirements = ["4+ years product design experience", "Strong portfolio of shipped products", "Proficiency in Figma", "User research skills", "Design systems experience"];
    preferredSkills = ["Motion design", "Prototyping", "HTML/CSS", "Data visualization", "Accessibility"];
    experience = "4+ years";
    industryExperience = ["Consumer tech", "SaaS"];
    softSkills = ["Creativity", "Empathy", "Storytelling", "Communication"];
    culturalFit = ["User-centric", "Design-driven", "Inclusive"];
  } else if (isData) {
    title = "Data Scientist";
    description = "Join our data team to uncover insights that drive business decisions. You'll build models, analyze large datasets, and collaborate with stakeholders to translate data into action.";
    requirements = ["3+ years data science experience", "Python/R proficiency", "Statistical modeling", "SQL expertise", "Experience with ML frameworks"];
    preferredSkills = ["TensorFlow/PyTorch", "Spark", "A/B testing", "Data visualization (Tableau/D3)", "NLP"];
    experience = "3+ years";
    industryExperience = ["Analytics", "AI/ML"];
    softSkills = ["Analytical thinking", "Communication", "Curiosity"];
    culturalFit = ["Data-driven", "Research-oriented", "Collaborative"];
  } else {
    title = prompt.length > 50 ? prompt.slice(0, 50) : prompt.replace(/^(create|post|make|build|write|generate)\s+(a\s+)?(job\s+)?(for\s+)?/i, "").trim() || "Software Engineer";
    title = title.charAt(0).toUpperCase() + title.slice(1);
    description = `We're looking for a talented ${title} to join our growing team. You'll work on challenging problems, collaborate with cross-functional teams, and make a meaningful impact on our product.`;
    requirements = ["Relevant professional experience", "Strong problem-solving skills", "Excellent communication", "Team collaboration experience"];
    preferredSkills = ["Industry certifications", "Leadership experience", "Agile/Scrum methodology"];
    experience = "2+ years";
    industryExperience = [];
    softSkills = ["Communication", "Adaptability", "Teamwork"];
    culturalFit = ["Collaborative", "Growth-oriented"];
  }

  if (lower.includes("senior") || lower.includes("sr")) {
    title = "Senior " + title;
    experience = "5+ years";
    softSkills = [...new Set([...softSkills, "Leadership", "Mentoring"])];
  } else if (lower.includes("lead")) {
    title = "Lead " + title;
    experience = "7+ years";
    softSkills = [...new Set([...softSkills, "Leadership", "Strategic thinking", "Mentoring"])];
  } else if (lower.includes("junior") || lower.includes("jr")) {
    title = "Junior " + title;
    experience = "0-2 years";
    softSkills = softSkills.filter(s => s !== "Leadership" && s !== "Mentoring");
    softSkills = [...new Set([...softSkills, "Eagerness to learn", "Receptiveness to feedback"])];
  }

  return {
    id: crypto.randomUUID(),
    companyId,
    companyName,
    title,
    description,
    requirements,
    preferredSkills,
    experienceRequired: experience,
    location: lower.includes("remote") ? "Remote" : "On-site",
    type: lower.includes("remote") ? "remote" : lower.includes("contract") ? "contract" : "full-time",
    createdAt: new Date(),
    status: "draft",
    industryExperience,
    softSkills,
    culturalFit,
  };
};

const CompanyChat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addJob } = useJobStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hi ${user?.name}! 👋 I'm your AI hiring assistant. Tell me about the role you want to fill and I'll create a professional job posting for you.\n\nTry something like:\n• "Post a senior frontend engineer role"\n• "I need a remote backend developer"\n• "Create a job for a UX designer"`,
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
    if (!input.trim() || !user) return;
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking
    await new Promise((r) => setTimeout(r, 1200));

    const job = generateJobFromPrompt(input, user.id, user.company || user.name);

    const advancedSection = [
      job.industryExperience?.length ? `\n**Industry Experience:**\n${job.industryExperience.map((s) => `• ${s}`).join("\n")}` : "",
      job.softSkills?.length ? `\n**Soft Skills:**\n${job.softSkills.map((s) => `• ${s}`).join("\n")}` : "",
      job.culturalFit?.length ? `\n**Cultural Fit:**\n${job.culturalFit.map((s) => `• ${s}`).join("\n")}` : "",
    ].join("");

    const response: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: `Great! I've drafted a **${job.title}** position. Here's what I've put together:\n\n**📋 ${job.title}**\n${job.description}\n\n**Requirements:**\n${job.requirements.map((r) => `• ${r}`).join("\n")}\n\n**Preferred Skills:**\n${job.preferredSkills.map((s) => `• ${s}`).join("\n")}${advancedSection}\n\n**Experience:** ${job.experienceRequired}\n**Location:** ${job.location} · ${job.type}\n\nThe job has been saved as a **draft**. You can edit it in the Jobs tab or publish it right away. Would you like to create another role?`,
      timestamp: new Date(),
      jobData: job,
    };

    addJob(job);
    setMessages((prev) => [...prev, response]);
    setIsTyping(false);
  };

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
                  msg.role === "user"
                    ? "chat-bubble-user text-foreground"
                    : "chat-bubble-ai"
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
                {msg.jobData && (
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => navigate("/jobs")}
                    >
                      <Briefcase className="h-3 w-3 mr-1" />
                      View in Jobs
                    </Button>
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
          <Button onClick={handleSend} disabled={!input.trim() || isTyping}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompanyChat;
