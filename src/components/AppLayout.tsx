import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Sparkles, LogOut, Briefcase, User, MessageSquare, FileText, Building2, Menu, Sun, Moon, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NavLink } from "react-router-dom";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  if (!user) return null;

  const isCompany = user.role === "company";
  const navItems = isCompany
    ? [
        { to: "/dashboard", label: "Chat", icon: MessageSquare },
        { to: "/jobs", label: "Jobs", icon: Briefcase },
        { to: "/applicants", label: "Applicants", icon: User },
        { to: "/company-profile", label: "Company", icon: Building2 },
      ]
    : [
        { to: "/chat", label: "AI Chat", icon: MessageSquare },
        { to: "/dashboard", label: "Jobs", icon: Briefcase },
        { to: "/my-applications", label: "Applications", icon: FileText },
        { to: "/profile", label: "Profile", icon: User },
      ];

  const Logo = (
    <div className="flex items-center gap-2">
      <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
        <Sparkles className="h-4 w-4 text-primary-foreground" />
      </div>
      <span className="font-semibold text-sm tracking-tight">HireAI</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-14 border-b border-border flex items-center px-4 lg:px-6 justify-between shrink-0">
        <div className="flex items-center gap-6">
          {/* Mobile: hamburger replaces logo */}
          <div className="sm:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 flex flex-col">
                <div className="px-4 py-4 border-b border-border">{Logo}</div>
                <nav className="flex-1 p-3 flex flex-col gap-1">
                  {navItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                        }`
                      }
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </NavLink>
                  ))}
                </nav>
                <div className="border-t border-border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                      <span>{theme === "dark" ? "Dark" : "Light"} theme</span>
                    </div>
                    <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} aria-label="Toggle theme" />
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {user.name} {user.company && `· ${user.company}`}
                  </div>
                  <Button variant="outline" size="sm" className="w-full" onClick={() => { setOpen(false); logout(); }}>
                    <LogOut className="h-4 w-4 mr-2" /> Log out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop: logo + nav */}
          <div className="hidden sm:block">{Logo}</div>
          <nav className="hidden sm:flex items-center gap-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {user.name} {user.company && `· ${user.company}`}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="hidden sm:inline-flex"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={logout} className="hidden sm:inline-flex">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
};

export default AppLayout;
