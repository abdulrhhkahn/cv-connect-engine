import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MessageSquare, Plus, Trash2, History } from "lucide-react";
import { ChatThread, ChatThreadRole, loadThreads, deleteThread } from "@/lib/chat-threads";
import { toast } from "sonner";

interface Props {
  role: ChatThreadRole;
  userId: string;
  currentThreadId: string;
  onSelect: (thread: ChatThread) => void;
  onNew: () => void;
  refreshKey?: number;
}

const ChatThreadsSheet = ({ role, userId, currentThreadId, onSelect, onNew, refreshKey }: Props) => {
  const [open, setOpen] = useState(false);
  const [threads, setThreads] = useState<ChatThread[]>([]);

  useEffect(() => {
    if (open || refreshKey !== undefined) setThreads(loadThreads(role, userId));
  }, [open, role, userId, refreshKey]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteThread(role, userId, id);
    setThreads(loadThreads(role, userId));
    toast.message("Chat deleted");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <History className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Chats</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[320px] sm:w-[380px]">
        <SheetHeader>
          <SheetTitle>Chat history</SheetTitle>
        </SheetHeader>
        <div className="mt-4 flex flex-col gap-2">
          <Button
            size="sm"
            className="justify-start"
            onClick={() => {
              onNew();
              setOpen(false);
            }}
          >
            <Plus className="h-4 w-4 mr-1.5" /> New chat
          </Button>
          <div className="border-t border-border pt-2 mt-2 max-h-[calc(100vh-12rem)] overflow-auto space-y-1">
            {threads.length === 0 ? (
              <p className="text-xs text-muted-foreground py-4 text-center">No saved chats yet.</p>
            ) : (
              threads.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onSelect(t);
                    setOpen(false);
                  }}
                  className={`group w-full text-left rounded-md px-2.5 py-2 hover:bg-accent flex items-start gap-2 ${
                    t.id === currentThreadId ? "bg-accent" : ""
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{t.title}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(t.updatedAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    onClick={(e) => handleDelete(e, t.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive p-1"
                    role="button"
                    aria-label="Delete chat"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ChatThreadsSheet;
