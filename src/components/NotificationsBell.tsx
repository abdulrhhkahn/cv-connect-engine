import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useJobStore } from "@/lib/store";
import { Bell, Calendar, Briefcase, FileText, Heart, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";

const iconFor = {
  interview: Calendar,
  application: FileText,
  job: Briefcase,
  follow: Heart,
  system: Sparkles,
} as const;

const NotificationsBell = ({ compact = false }: { compact?: boolean }) => {
  const { user } = useAuth();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useJobStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!user) return null;
  const mine = notifications.filter((n) => n.userId === user.id);
  const unread = mine.filter((n) => !n.read).length;

  const formatRel = (d: Date) => {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size={compact ? "sm" : "sm"}
          aria-label="Notifications"
          className="relative"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
          {compact && <span className="ml-2">Notifications</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <span className="text-sm font-semibold">Notifications</span>
          {unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => markAllNotificationsRead(user.id)}
            >
              <Check className="h-3 w-3 mr-1" /> Mark all read
            </Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {mine.length === 0 ? (
            <div className="text-xs text-muted-foreground text-center py-8 px-4">
              You're all caught up. New activity will show up here.
            </div>
          ) : (
            mine.map((n) => {
              const Icon = iconFor[n.type] || Sparkles;
              return (
                <button
                  key={n.id}
                  onClick={() => {
                    markNotificationRead(n.id);
                    if (n.link) {
                      setOpen(false);
                      navigate(n.link);
                    }
                  }}
                  className={`w-full text-left px-3 py-2.5 border-b border-border/50 last:border-0 hover:bg-secondary/60 transition-colors flex gap-2.5 ${
                    !n.read ? "bg-accent/30" : ""
                  }`}
                >
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{n.title}</p>
                      {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{formatRel(n.createdAt)}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsBell;
