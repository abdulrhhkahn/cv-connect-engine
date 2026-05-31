import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Users, Sparkles, ArrowRight, Building2, User, Loader2 } from "lucide-react";

// LinkedIn SVG (not in lucide-react)
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const Landing = () => {
  const { login, signup } = useAuth();
  const [authMode, setAuthMode]         = useState<"login" | "signup">("login");
  const [role, setRole]                 = useState<UserRole>("candidate");
  const [form, setForm]                 = useState({ name: "", email: "", password: "", company: "" });
  const [error, setError]               = useState("");
  const [submitting, setSubmitting]     = useState(false);
  const [linkedInLoading, setLinkedInLoading] = useState(false);

  // ── Email / password submit ───────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (authMode === "signup") {
      if (!form.name || !form.email || !form.password) {
        setError("Please fill all fields");
        return;
      }
      if (role === "company" && !form.company) {
        setError("Please enter your company name");
        return;
      }
    }

    setSubmitting(true);
    try {
      if (authMode === "login") {
        await login(form.email, form.password);
      } else {
        await signup(form.name, form.email, form.password, role, form.company);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ── LinkedIn OAuth ─────────────────────────────────────────────
  // Note: requires "LinkedIn (OIDC)" enabled in Supabase → Auth → Providers
  const handleLinkedIn = async () => {
    setError("");
    setLinkedInLoading(true);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "linkedin_oidc",          // ← correct provider name (not "linkedin")
        options: {
          redirectTo: window.location.origin, // Supabase redirects back here after login
          scopes: "openid profile email",
        },
      });
      if (oauthError) throw oauthError;
      // Supabase will redirect the browser; no further action needed here
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "LinkedIn sign-in failed");
      setLinkedInLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* ── Left: Hero ─────────────────────────────────────────── */}
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
              { icon: Users,     text: "Smart candidate matching and screening" },
              { icon: Sparkles,  text: "Candidates get instant qualification feedback" },
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

      {/* ── Right: Auth ────────────────────────────────────────── */}
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
            <Tabs value={authMode} onValueChange={(v) => { setAuthMode(v as "login" | "signup"); setError(""); }}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Log in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>

              {/* ── Login tab ───────────────────────────────────── */}
              <TabsContent value="login" className="mt-0">
                {/* LinkedIn OAuth */}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mb-4 gap-2"
                  onClick={handleLinkedIn}
                  disabled={linkedInLoading}
                >
                  {linkedInLoading
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <LinkedInIcon />}
                  Continue with LinkedIn
                </Button>

                {/* Divider */}
                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-2 text-muted-foreground">or continue with email</span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
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

                  <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                    {submitting
                      ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in…</>
                      : <>Log in <ArrowRight className="ml-2 h-4 w-4" /></>}
                  </Button>
                </form>
              </TabsContent>

              {/* ── Sign-up tab ─────────────────────────────────── */}
              <TabsContent value="signup" className="mt-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Role selector */}
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { value: "candidate" as UserRole, label: "Candidate", icon: User },
                      { value: "company"   as UserRole, label: "Company",   icon: Building2 },
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

                  {/* Full name — both roles */}
                  <div>
                    <Label htmlFor="signup-name">Full name</Label>
                    <Input
                      id="signup-name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your full name"
                      className="mt-1.5"
                    />
                  </div>

                  {/* Company name — company role only */}
                  {role === "company" && (
                    <div className="animate-fade-in">
                      <Label htmlFor="signup-company">Company name</Label>
                      <Input
                        id="signup-company"
                        value={form.company}
                        onChange={(e) => setForm({ ...form, company: e.target.value })}
                        placeholder="Your company"
                        className="mt-1.5"
                      />
                    </div>
                  )}

                  {/* Email — both roles */}
                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com"
                      className="mt-1.5"
                    />
                  </div>

                  {/* Password — both roles */}
                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
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

                  <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                    {submitting
                      ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account…</>
                      : <>Create account <ArrowRight className="ml-2 h-4 w-4" /></>}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
