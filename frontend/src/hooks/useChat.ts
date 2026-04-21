import { useState } from "react";
import type { ChatMessage } from "../types";
import { sendChatMessage } from "../data/api";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "Hi, how can I help?" },
  ]);
  const [loading, setLoading] = useState(false);

  const send = async (text: string) => {
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setLoading(true);
    try {
      const { reply } = await sendChatMessage(next);
      setMessages([...next, { role: "assistant", content: reply }]);
    } catch {
      setMessages([
        ...next,
        { role: "assistant", content: "Sorry, I couldn't connect right now." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return { messages, loading, send };
}