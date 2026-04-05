import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Users, Sparkles, ArrowRight, Building2, User } from "lucide-react";

const Landing = () => {
  const { login, signup } = useAuth();
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [role, setRole] = useState<UserRole>("candidate");
  const [form, setForm] = useState({ name: "", email: "", password: "", company: "" });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (authMode === "login") {
      if (!login(form.email, form.password)) setError("Invalid credentials");
    } else {
      if (!form.name || !form.email || !form.password) {
        setError("Please fill all fields");
        return;
      }
      if (role === "company" && !form.company) {
        setError("Please enter your company name");
        return;
      }
      if (!signup(form.name, form.email, form.password, role, form.company)) {
        setError("Signup failed");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left: Hero */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-16 xl:px-24">
        <div className="max-w-lg">
          <div className="flex items-center gap-2 mb-8">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold tracking-tight">HireAI</span>
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold tracking-tight leading-tight mb-6">
            Hiring made <span className="text-gradient">intelligent</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-10">
            Post jobs with AI-powered descriptions, screen candidates automatically,
            and find the perfect match — all through a simple chat interface.
          </p>
          <div className="space-y-4">
            {[
              { icon: Briefcase, text: "AI generates job descriptions from a simple prompt" },
              { icon: Users, text: "Smart candidate matching and screening" },
              { icon: Sparkles, text: "Candidates get instant qualification feedback" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-muted-foreground">
                <div className="h-8 w-8 rounded-md bg-accent flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-accent-foreground" />
                </div>
                <span className="text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Auth */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold tracking-tight">HireAI</span>
          </div>

          <div className="glass-card rounded-xl p-8">
            <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as "login" | "signup")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Log in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-4">
                <TabsContent value="signup" className="space-y-4 mt-0">
                  {/* Role selector */}
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { value: "candidate" as UserRole, label: "Candidate", icon: User },
                      { value: "company" as UserRole, label: "Company", icon: Building2 },
                    ]).map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRole(value)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                          role === value
                            ? "border-primary bg-accent text-accent-foreground"
                            : "border-border text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                  <div>
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your full name"
                      className="mt-1.5"
                    />
                  </div>
                  {role === "company" && (
                    <div className="animate-fade-in">
                      <Label htmlFor="company">Company name</Label>
                      <Input
                        id="company"
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        placeholder="Your company"
                        className="mt-1.5"
                      />
                    </div>
                  )}
                </TabsContent>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="mt-1.5"
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive animate-fade-in">{error}</p>
                )}

                <Button type="submit" className="w-full" size="lg">
                  {authMode === "login" ? "Log in" : "Create account"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                {authMode === "login" && (
                  <p className="text-xs text-center text-muted-foreground">
                    Demo: use <span className="font-medium">hr@techcorp.com</span> (company) or <span className="font-medium">alex@email.com</span> (candidate)
                  </p>
                )}
              </form>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
