import { useAuth } from "@/contexts/AuthContext";
import { Sparkles, LogOut, Briefcase, User, MessageSquare, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  if (!user) return null;

  const isCompany = user.role === "company";
  const navItems = isCompany
    ? [
        { to: "/dashboard", label: "Chat", icon: MessageSquare },
        { to: "/jobs", label: "Jobs", icon: Briefcase },
        { to: "/applicants", label: "Applicants", icon: User },
      ]
    : [
        { to: "/dashboard", label: "Jobs", icon: Briefcase },
        { to: "/profile", label: "Profile", icon: User },
        { to: "/my-applications", label: "Applications", icon: FileText },
      ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="h-14 border-b border-border flex items-center px-4 lg:px-6 justify-between shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm tracking-tight">HireAI</span>
          </div>
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
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
};

export default AppLayout;
