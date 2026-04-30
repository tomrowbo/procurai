import { ConversationState } from "@/types";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Session {
  state: ConversationState;
  history: Message[];
}

const sessions = new Map<string, Session>();

export function getSession(phone: string): Session {
  if (!sessions.has(phone)) {
    sessions.set(phone, { state: { stage: "idle" }, history: [] });
  }
  return sessions.get(phone)!;
}

export function updateSession(
  phone: string,
  state: ConversationState,
  userMessage: string,
  assistantReply: string
): void {
  const session = getSession(phone);
  session.state = state;
  session.history.push(
    { role: "user", content: userMessage },
    { role: "assistant", content: assistantReply }
  );
  // Keep last 20 messages to avoid context bloat
  if (session.history.length > 20) {
    session.history = session.history.slice(-20);
  }
  sessions.set(phone, session);
}

export function resetSession(phone: string): void {
  sessions.set(phone, { state: { stage: "idle" }, history: [] });
}
