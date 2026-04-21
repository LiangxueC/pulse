import React, { useRef, useEffect, useState, useCallback } from "react";
import type { ChatMessage } from "../types";
import "./ChatDrawer.css";

interface ChatDrawerProps {
  messages: ChatMessage[];
  loading: boolean;
  onSend: (text: string) => void;
  autoOpen?: boolean;
  userName?: string;
  issueCount?: number;
}

const QUICK_CHIPS = [
  "Explain cash situation",
  "Explain a term",
  "Explain next steps",
  "What is my biggest risk?",
  "How do I improve status?",
];

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  messages,
  loading,
  onSend,
  autoOpen = true,
  userName = "there",
  issueCount = 0,
}) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-open on mount
  useEffect(() => {
    if (autoOpen) {
      const t = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, [autoOpen]);

  // Auto-close after 10s of no interaction
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      setOpen(false);
    }, 10000);
  }, []);

  useEffect(() => {
    if (open) {
      resetInactivityTimer();
    } else {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    }
    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [open, resetInactivityTimer]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text: string) => {
    const msg = text.trim();
    if (!msg || loading) return;
    setInput("");
    resetInactivityTimer();
    onSend(msg);
  };

  const handleChip = (chip: string) => {
    resetInactivityTimer();
    onSend(chip);
  };

  const handleOpen = () => {
    setOpen(true);
    resetInactivityTimer();
  };

  return (
    <>
      {/* FAB */}
      <button className="pulse-fab" onClick={handleOpen}>
        <div className="pulse-fab__dot">
          <div className="pulse-fab__inner" />
        </div>
        Chat with Pulse
      </button>

      {/* Drawer */}
      {open && (
        <div
          className="chat-drawer"
          onMouseMove={resetInactivityTimer}
          onClick={resetInactivityTimer}
        >
          <div className="chat-drawer__header">
            <div className="chat-drawer__pulse-dot" />
            <div className="chat-drawer__header-info">
              <span className="chat-drawer__title">Pulse</span>
            </div>
            <button className="chat-drawer__close" onClick={() => setOpen(false)}>⌄</button>
          </div>

          <div className="chat-drawer__messages">
            {/* Auto greeting */}
            <div className="chat-msg chat-msg--assistant">
              <div className="chat-msg__bubble">
                <strong>Hi {userName}!</strong>
                <br />
                {issueCount > 0
                  ? `My review of your cash situation over the next 2 weeks found ${issueCount} issue${issueCount !== 1 ? "s" : ""}. Please take a look at your projected lowest cash balance as soon as you can.`
                  : "Your cash flow looks healthy right now. Let me know if you have any questions!"}
              </div>
            </div>

            {messages.slice(1).map((m, i) => (
              <div key={i} className={`chat-msg chat-msg--${m.role}`}>
                <div className="chat-msg__bubble">{m.content}</div>
              </div>
            ))}

            {loading && (
              <div className="chat-msg chat-msg--assistant">
                <div className="chat-msg__bubble chat-msg__bubble--loading">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick chips */}
          {!loading && (
            <div className="chat-drawer__chips">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip}
                  className="chat-drawer__chip"
                  onClick={() => handleChip(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          <div className="chat-drawer__input-row">
            <button className="chat-drawer__attach" aria-label="Attach">
              <AttachIcon />
            </button>
            <input
              className="chat-drawer__input"
              placeholder="Type a message"
              value={input}
              onChange={(e) => { setInput(e.target.value); resetInactivityTimer(); }}
              onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
            />
            <button
              className="chat-drawer__send"
              onClick={() => handleSend(input)}
              disabled={loading}
            >
              <SendIcon />
            </button>
          </div>

          <p className="chat-drawer__disclaimer">
            *Pulse is AI and can make mistakes. Important information should always be checked before proceeding.*
          </p>
        </div>
      )}
    </>
  );
};

const AttachIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
  </svg>
);
const SendIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);