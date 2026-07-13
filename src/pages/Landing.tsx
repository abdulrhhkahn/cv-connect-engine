import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { UserRole } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Briefcase, Users, Sparkles, ArrowRight, ArrowLeft,
  Building2, User, Loader2, Eye, EyeOff,
  CheckCircle2, XCircle, MailCheck,
} from "lucide-react";

// ── LinkedIn icon ─────────────────────────────────────────────
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

// ── Password strength ─────────────────────────────────────────
const REQUIREMENTS = [
  { test: (p: string) => p.length >= 8,           label: "At least 8 characters" },
  { test: (p: string) => /[A-Z]/.test(p),         label: "One uppercase letter"  },
  { test: (p: string) => /[0-9]/.test(p),         label: "One number"            },
  { test: (p: string) => /[^A-Za-z0-9]/.test(p), label: "One special character"  },
];

function getStrength(pw: string) {
  const n = REQUIREMENTS.filter(r => r.test(pw)).length;
  return {
    score:    n,
    label:    ["", "Weak", "Fair", "Good", "Strong"][n],
    color:    ["", "text-red-500", "text-orange-500", "text-yellow-600 dark:text-yellow-400", "text-green-600 dark:text-green-500"][n],
    barColor: ["", "bg-red-500",   "bg-orange-400",   "bg-yellow-400",                         "bg-green-500"][n],
  };
}
const isStrong = (pw: string) => REQUIREMENTS.every(r => r.test(pw));

const StrengthMeter = ({ password }: { password: string }) => {
  if (!password) return null;
  const { score, label, color, barColor } = getStrength(password);
  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1" role="meter" aria-label={`Password strength: ${label}`}>
        {[1,2,3,4].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= score ? barColor : "bg-border"}`} />
        ))}
      </div>
      {label && <p className={`text-xs font-medium ${color}`}>{label}</p>}
      <ul className="space-y-1">
        {REQUIREMENTS.map(req => {
          const met = req.test(password);
          return (
            <li key={req.label} className={`flex items-center gap-1.5 text-xs transition-colors ${met ? "text-green-600 dark:text-green-500" : "text-muted-foreground"}`}>
              {met ? <CheckCircle2 className="h-3 w-3 shrink-0 text-green-600 dark:text-green-500" />
                   : <XCircle     className="h-3 w-3 shrink-0" />}
              {req.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

// ── Show/hide password input ─────────────────────────────────
const PasswordInput = ({
  id, value, onChange, placeholder = "••••••••", autoComplete = "current-password",
}: { id: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; autoComplete?: string }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input id={id} type={visible ? "text" : "password"} value={value} onChange={onChange}
        placeholder={placeholder} autoComplete={autoComplete} className="pr-10 mt-1.5" />
      <button type="button" tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setVisible(v => !v)} aria-label={visible ? "Hide password" : "Show password"}>
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
};

// ── Error normaliser ─────────────────────────────────────────
function friendlyError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login") || m.includes("invalid_credentials") || m.includes("user not found") || m.includes("invalid credentials"))
    return "Invalid email or password.";
  if (m.includes("email not confirmed"))
    return "Please verify your email before logging in — check your inbox.";
  if (m.includes("rate") || m.includes("too many") || m.includes("over_email_send_rate_limit"))
    return "Too many attempts. Please wait a few minutes and try again.";
  if (m.includes("already registered") || m.includes("already exists") || m.includes("user_already_exists"))
    return "An account with this email already exists.";
  if (m.includes("weak password") || m.includes("should be at least"))
    return "Password is too weak — use 8+ characters with uppercase, numbers, and symbols.";
  if (m.includes("network") || m.includes("fetch"))
    return "Network error. Check your connection and try again.";
  return msg; // surface unknown errors verbatim so we can debug them
}

/** Safely extract a message from anything that might be thrown */
function errorMessage(err: unknown): string {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && "message" in err) return String((err as { message: unknown }).message);
  return JSON.stringify(err);
}

// ── Types ─────────────────────────────────────────────────────
type LoginView  = "credentials" | "forgot" | "forgot-sent" | "reset";
type SignupView = "form" | "confirm-sent";

// ═══════════════════════════════════════════════════════════════
const Landing = () => {
  const { login, signup, isPasswordRecovery, sendPasswordReset, updatePassword } = useAuth();

  const [authMode,   setAuthMode]   = useState<"login" | "signup">("login");
  const [_loginView, _setLV]        = useState<LoginView>("credentials");
  const [signupView, setSignupView] = useState<SignupView>("form");
  const [role,       setRole]       = useState<UserRole>("candidate");
  const [error,      setError]      = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [liLoading,  setLiLoading]  = useState(false);

  // form state
  const [creds,      setCreds]      = useState({ email: "", password: "" });
  const [forgotEmail, setForgotEmail] = useState("");
  const [signupForm,  setSignupForm]  = useState({ name: "", email: "", password: "", confirm: "", company: "" });
  const [resetForm,   setResetForm]   = useState({ password: "", confirm: "" });
  const [signupEmail, setSignupEmail] = useState(""); // shown on confirm screen

  const loginView = isPasswordRecovery ? "reset" : _loginView;
  const setLoginView = (v: LoginView) => { _setLV(v); setError(""); };

  useEffect(() => { if (isPasswordRecovery) setError(""); }, [isPasswordRecovery]);

  // ── LinkedIn OAuth ──────────────────────────────────────────
  const handleLinkedIn = async () => {
    setError(""); setLiLoading(true);
    try {
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: "linkedin_oidc",
        options: { redirectTo: window.location.origin, scopes: "openid profile email" },
      });
      if (oauthErr) throw oauthErr;
    } catch (err) {
      setError(friendlyError(errorMessage(err)));
      setLiLoading(false);
    }
  };

  // ── Login ───────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (!creds.email || !creds.password) { setError("Please fill all fields."); return; }
    setSubmitting(true);
    try { await login(creds.email, creds.password); }
    catch (err) { setError(friendlyError(errorMessage(err))); }
    finally { setSubmitting(false); }
  };

  // ── Sign up ─────────────────────────────────────────────────
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    const { name, email, password, confirm, company } = signupForm;
    if (!name || !email || !password || !confirm) { setError("Please fill all fields."); return; }
    if (role === "company" && !company)           { setError("Please enter your company name."); return; }
    if (!isStrong(password))                      { setError("Password doesn't meet the requirements below."); return; }
    if (password !== confirm)                     { setError("Passwords do not match."); return; }
    setSubmitting(true);
    try {
      const { confirmationRequired } = await signup(name, email, password, role, company);
      if (confirmationRequired) {
        setSignupEmail(email.trim().toLowerCase());
        setSignupView("confirm-sent");
        setError("");
      }
      // if confirmationRequired=false the user is auto-logged-in via onAuthStateChange
    } catch (err) {
      setError(friendlyError(errorMessage(err)));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Forgot password ─────────────────────────────────────────
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (!forgotEmail) { setError("Please enter your email address."); return; }
    setSubmitting(true);
    try { await sendPasswordReset(forgotEmail); setLoginView("forgot-sent"); }
    catch (err) { setError(friendlyError(errorMessage(err))); }
    finally { setSubmitting(false); }
  };

  // ── Reset password ──────────────────────────────────────────
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    const { password, confirm } = resetForm;
    if (!password || !confirm)  { setError("Please fill all fields."); return; }
    if (!isStrong(password))    { setError("Password doesn't meet the requirements."); return; }
    if (password !== confirm)   { setError("Passwords do not match."); return; }
    setSubmitting(true);
    try { await updatePassword(password); }
    catch (err) { setError(friendlyError(errorMessage(err))); }
    finally { setSubmitting(false); }
  };

  // ── Reusable pieces ─────────────────────────────────────────
  const ErrorMsg = () => error
    ? <p role="alert" className="text-sm text-destructive animate-fade-in">{error}</p>
    : null;

  const SubmitBtn = ({ label, loadingLabel }: { label: string; loadingLabel: string }) => (
    <Button type="submit" className="w-full" size="lg" disabled={submitting}>
      {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{loadingLabel}</>
                  : <>{label}<ArrowRight className="ml-2 h-4 w-4" /></>}
    </Button>
  );

  // ═════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-background flex">

      {/* ── Left hero ──────────────────────────────────────── */}
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

      {/* ── Right: auth panel ───────────────────────────────── */}
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

            {/* ─── PASSWORD RESET VIEW (from email link) ────── */}
            {loginView === "reset" ? (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold">Set a new password</h2>
                  <p className="text-sm text-muted-foreground mt-1">Choose a strong password for your account.</p>
                </div>
                <form onSubmit={handleReset} className="space-y-4">
                  <div>
                    <Label htmlFor="reset-pw">New password</Label>
                    <PasswordInput id="reset-pw" value={resetForm.password}
                      onChange={e => setResetForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="New password" autoComplete="new-password" />
                    <StrengthMeter password={resetForm.password} />
                  </div>
                  <div>
                    <Label htmlFor="reset-confirm">Confirm new password</Label>
                    <PasswordInput id="reset-confirm" value={resetForm.confirm}
                      onChange={e => setResetForm(f => ({ ...f, confirm: e.target.value }))}
                      placeholder="Repeat password" autoComplete="new-password" />
                    {resetForm.confirm && resetForm.password !== resetForm.confirm && (
                      <p className="text-xs text-destructive mt-1">Passwords don't match</p>
                    )}
                  </div>
                  <ErrorMsg />
                  <SubmitBtn label="Update password" loadingLabel="Updating…" />
                </form>
              </div>
            ) : (

            /* ─── TABS ────────────────────────────────────── */
            <Tabs
              value={authMode}
              onValueChange={v => {
                setAuthMode(v as "login" | "signup");
                setLoginView("credentials");
                setSignupView("form");
                setError("");
              }}
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Log in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>

              {/* ─── LOGIN TAB ─────────────────────────────── */}
              <TabsContent value="login" className="mt-0">

                {loginView === "forgot" && (
                  <div className="space-y-4">
                    <button type="button" onClick={() => setLoginView("credentials")}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                      <ArrowLeft className="h-4 w-4" /> Back to log in
                    </button>
                    <div>
                      <h2 className="text-base font-semibold">Reset your password</h2>
                      <p className="text-sm text-muted-foreground mt-1">Enter your email and we'll send a reset link.</p>
                    </div>
                    <form onSubmit={handleForgot} className="space-y-4">
                      <div>
                        <Label htmlFor="forgot-email">Email</Label>
                        <Input id="forgot-email" type="email" value={forgotEmail}
                          onChange={e => setForgotEmail(e.target.value)}
                          placeholder="you@example.com" autoComplete="email" className="mt-1.5" />
                      </div>
                      <ErrorMsg />
                      <SubmitBtn label="Send reset link" loadingLabel="Sending…" />
                    </form>
                  </div>
                )}

                {loginView === "forgot-sent" && (
                  <div className="space-y-5 text-center">
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                      <MailCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold">Check your inbox</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        We sent a reset link to <span className="font-medium text-foreground">{forgotEmail}</span>.
                        It expires in 1 hour.
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Didn't get it? Check spam, or{" "}
                      <button type="button" className="text-primary hover:underline" onClick={() => setLoginView("forgot")}>
                        try again
                      </button>.
                    </p>
                    <Button variant="outline" className="w-full" onClick={() => { setLoginView("credentials"); setError(""); }}>
                      Back to log in
                    </Button>
                  </div>
                )}

                {loginView === "credentials" && (
                  <>
                    <Button type="button" variant="outline" className="w-full mb-4 gap-2"
                      onClick={handleLinkedIn} disabled={liLoading}>
                      {liLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LinkedInIcon />}
                      Continue with LinkedIn
                    </Button>
                    <div className="relative mb-4">
                      <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-card px-2 text-muted-foreground">or continue with email</span>
                      </div>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <Label htmlFor="login-email">Email</Label>
                        <Input id="login-email" type="email" value={creds.email}
                          onChange={e => setCreds(c => ({ ...c, email: e.target.value }))}
                          placeholder="you@example.com" autoComplete="email" className="mt-1.5" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="login-password">Password</Label>
                          <button type="button"
                            className="text-xs text-muted-foreground hover:text-primary transition-colors"
                            onClick={() => { setForgotEmail(creds.email); setLoginView("forgot"); }}>
                            Forgot password?
                          </button>
                        </div>
                        <PasswordInput id="login-password" value={creds.password}
                          onChange={e => setCreds(c => ({ ...c, password: e.target.value }))}
                          autoComplete="current-password" />
                      </div>
                      <ErrorMsg />
                      <SubmitBtn label="Log in" loadingLabel="Signing in…" />
                    </form>
                  </>
                )}
              </TabsContent>

              {/* ─── SIGN-UP TAB ───────────────────────────── */}
              <TabsContent value="signup" className="mt-0">

                {/* ── Email confirmation pending ── */}
                {signupView === "confirm-sent" && (
                  <div className="space-y-5 text-center">
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                      <MailCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold">Confirm your email</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        We sent a confirmation link to{" "}
                        <span className="font-medium text-foreground">{signupEmail}</span>.
                        Click it to activate your account.
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Didn't get it? Check your spam folder, or{" "}
                      <button type="button" className="text-primary hover:underline"
                        onClick={() => { setSignupView("form"); setError(""); }}>
                        try again
                      </button>.
                    </p>
                    <Button variant="outline" className="w-full"
                      onClick={() => { setAuthMode("login"); setLoginView("credentials"); setSignupView("form"); setError(""); }}>
                      Go to log in
                    </Button>
                  </div>
                )}

                {/* ── Sign-up form ── */}
                {signupView === "form" && (
                  <form onSubmit={handleSignup} className="space-y-4">
                    {/* Role selector */}
                    <div className="grid grid-cols-2 gap-3">
                      {([
                        { value: "candidate" as UserRole, label: "Candidate", icon: User },
                        { value: "company"   as UserRole, label: "Company",   icon: Building2 },
                      ]).map(({ value, label, icon: Icon }) => (
                        <button key={value} type="button" onClick={() => setRole(value)}
                          className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                            role === value ? "border-primary bg-accent text-accent-foreground"
                                          : "border-border text-muted-foreground hover:border-primary/50"}`}>
                          <Icon className="h-4 w-4" /> {label}
                        </button>
                      ))}
                    </div>

                    <div>
                      <Label htmlFor="su-name">Full name</Label>
                      <Input id="su-name" value={signupForm.name}
                        onChange={e => setSignupForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Your full name" autoComplete="name" className="mt-1.5" />
                    </div>

                    {role === "company" && (
                      <div className="animate-fade-in">
                        <Label htmlFor="su-company">Company name</Label>
                        <Input id="su-company" value={signupForm.company}
                          onChange={e => setSignupForm(f => ({ ...f, company: e.target.value }))}
                          placeholder="Your company" autoComplete="organization" className="mt-1.5" />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="su-email">Email</Label>
                      <Input id="su-email" type="email" value={signupForm.email}
                        onChange={e => setSignupForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="you@example.com" autoComplete="email" className="mt-1.5" />
                    </div>

                    <div>
                      <Label htmlFor="su-pw">Password</Label>
                      <PasswordInput id="su-pw" value={signupForm.password}
                        onChange={e => setSignupForm(f => ({ ...f, password: e.target.value }))}
                        placeholder="Create a password" autoComplete="new-password" />
                      <StrengthMeter password={signupForm.password} />
                    </div>

                    <div>
                      <Label htmlFor="su-confirm">Confirm password</Label>
                      <PasswordInput id="su-confirm" value={signupForm.confirm}
                        onChange={e => setSignupForm(f => ({ ...f, confirm: e.target.value }))}
                        placeholder="Repeat password" autoComplete="new-password" />
                      {signupForm.confirm && signupForm.password !== signupForm.confirm && (
                        <p className="text-xs text-destructive mt-1">Passwords don't match</p>
                      )}
                    </div>

                    <ErrorMsg />
                    <SubmitBtn label="Create account" loadingLabel="Creating account…" />
                  </form>
                )}
              </TabsContent>
            </Tabs>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
