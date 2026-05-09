export type ChatThreadRole = "candidate" | "company";

export interface PersistedMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  draftJob?: unknown;
  saved?: boolean;
  suggestions?: string[];
}

export interface ChatThread {
  id: string;
  title: string;
  role: ChatThreadRole;
  userId: string;
  messages: PersistedMessage[];
  createdAt: string;
  updatedAt: string;
}

const key = (role: ChatThreadRole, userId: string) => `hireai_threads_${role}_${userId}`;

export const loadThreads = (role: ChatThreadRole, userId: string): ChatThread[] => {
  try {
    const raw = localStorage.getItem(key(role, userId));
    if (!raw) return [];
    const arr = JSON.parse(raw) as ChatThread[];
    return arr.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  } catch {
    return [];
  }
};

export const saveThread = (thread: ChatThread) => {
  const all = loadThreads(thread.role, thread.userId);
  const idx = all.findIndex((t) => t.id === thread.id);
  if (idx >= 0) all[idx] = thread;
  else all.unshift(thread);
  localStorage.setItem(key(thread.role, thread.userId), JSON.stringify(all));
};

export const deleteThread = (role: ChatThreadRole, userId: string, threadId: string) => {
  const all = loadThreads(role, userId).filter((t) => t.id !== threadId);
  localStorage.setItem(key(role, userId), JSON.stringify(all));
};

export const titleFromMessages = (msgs: PersistedMessage[]): string => {
  const firstUser = msgs.find((m) => m.role === "user");
  if (!firstUser) return "New chat";
  const t = firstUser.content.trim().replace(/\s+/g, " ");
  return t.length > 48 ? t.slice(0, 48) + "…" : t;
};
