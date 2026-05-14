"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import {
    ArrowUpIcon,
    Terminal,
    Megaphone,
    Briefcase,
    Loader2,
} from "lucide-react";

interface UseAutoResizeTextareaProps {
    minHeight: number;
    maxHeight?: number;
}

function useAutoResizeTextarea({
    minHeight,
    maxHeight,
}: UseAutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(
        (reset?: boolean) => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (reset) {
                textarea.style.height = `${minHeight}px`;
                return;
            }

            // Temporarily shrink to get the right scrollHeight
            textarea.style.height = `${minHeight}px`;

            // Calculate new height
            const newHeight = Math.max(
                minHeight,
                Math.min(
                    textarea.scrollHeight,
                    maxHeight ?? Number.POSITIVE_INFINITY
                )
            );

            textarea.style.height = `${newHeight}px`;
        },
        [minHeight, maxHeight]
    );

    useEffect(() => {
        // Set initial height
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = `${minHeight}px`;
        }
    }, [minHeight]);

    // Adjust height on window resize
    useEffect(() => {
        const handleResize = () => adjustHeight();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [adjustHeight]);

    return { textareaRef, adjustHeight };
}

export function IntelligenceEngineChat() {
  const { session } = useAuth();
  const [value, setValue] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [persona, setPersona] = useState<string>("elite-coach");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = value.trim();
    if (!text || sending) return;
    const token = session?.access_token;
    if (!token) {
      toast.error("Sign in to use the Intelligence Engine.");
      return;
    }
    setValue("");
    adjustHeight(true);
    setMessages((m) => [...m, { role: "user", content: text }, { role: "assistant", content: "" }]);
    setSending(true);
    try {
      const res = await fetch("/api/engine/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text, persona }),
      });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "Engine unavailable" }));
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: `Error: ${err.error || "Engine unavailable"}` };
          return copy;
        });
        return;
      }
      // Stream SSE
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { value: chunk, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(chunk, { stream: true });
        // SSE format: "data: <text>\n\n"
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";
        for (const evt of events) {
          const line = evt.trim();
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (payload === "[DONE]") continue;
          let token: string;
          try {
            const parsed = JSON.parse(payload);
            token = typeof parsed === "string" ? parsed : (parsed.content ?? parsed.text ?? "");
          } catch {
            token = payload;
          }
          if (!token) continue;
          setMessages((m) => {
            const copy = [...m];
            const last = copy[copy.length - 1];
            if (last?.role === "assistant") {
              copy[copy.length - 1] = { ...last, content: last.content + token };
            }
            return copy;
          });
        }
      }
    } catch (err) {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: "Network error. Please try again." };
        return copy;
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col items-center w-full mx-auto space-y-6 h-full justify-center">
      {messages.length === 0 ? (
        <h3 className="font-serif text-3xl font-bold text-foreground text-center">
          What can I help you ship?
        </h3>
      ) : (
        <div className="w-full max-h-[400px] overflow-y-auto space-y-4 pr-2">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={cn(
                "rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap",
                m.role === "user"
                  ? "bg-primary/10 border border-primary/20 ml-12"
                  : "bg-card/60 border border-border/40 mr-12",
              )}
            >
              {m.content || (
                <span className="text-muted-foreground italic">Thinking...</span>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      <div className="w-full">
        <div className="relative bg-card/60 backdrop-blur-xl rounded-[2rem] border border-border/40 shadow-2xl overflow-hidden focus-within:border-primary/50 transition-colors duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          <div className="overflow-y-auto relative z-10 p-2">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                adjustHeight();
              }}
              onKeyDown={handleKeyDown}
              disabled={sending}
              placeholder={sending ? "Engine is responding..." : "Ask the Intelligence Engine..."}
              className={cn(
                "w-full px-4 py-3",
                "resize-none",
                "bg-transparent",
                "border-none",
                "text-foreground text-sm",
                "focus:outline-none",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "placeholder:text-muted-foreground placeholder:text-sm",
                "min-h-[60px]",
              )}
              style={{ overflow: "hidden" }}
            />
          </div>

          <div className="flex items-center justify-between p-3 relative z-10 border-t border-border/40 bg-background/50">
            <div className="flex items-center gap-2">
              {/* Persona indicator */}
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                As: {PERSONA_LABELS[persona] ?? persona}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSend}
                disabled={sending || !value.trim()}
                className={cn(
                  "px-2.5 py-2.5 rounded-xl text-sm transition-all border flex items-center justify-center gap-1",
                  value.trim() && !sending
                    ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
                    : "bg-muted border-border/50 text-muted-foreground cursor-not-allowed",
                )}
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowUpIcon className="w-4 h-4" />
                )}
                <span className="sr-only">Send</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          <ActionButton
            icon={<Terminal className="w-3.5 h-3.5" />}
            label="Act as a Technical Founder"
            active={persona === "devops-architect"}
            onClick={() => setPersona("devops-architect")}
          />
          <ActionButton
            icon={<Megaphone className="w-3.5 h-3.5" />}
            label="Act as a Growth Marketer"
            active={persona === "viral-marketer"}
            onClick={() => setPersona("viral-marketer")}
          />
          <ActionButton
            icon={<Briefcase className="w-3.5 h-3.5" />}
            label="Act as a Venture Capitalist"
            active={persona === "venture-capitalist"}
            onClick={() => setPersona("venture-capitalist")}
          />
        </div>
      </div>
    </div>
  );
}

const PERSONA_LABELS: Record<string, string> = {
  "elite-coach": "$1M Founder Coach",
  "venture-capitalist": "Tier-1 VC",
  "devops-architect": "Systems Architect",
  "sales-shark": "Sales Director",
  "viral-marketer": "Growth Hacker",
  "copywriter": "Copywriter",
  "performance-coach": "Performance Coach",
};

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function ActionButton({ icon, label, active, onClick }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs shadow-sm transition-all hover:-translate-y-0.5",
        active
          ? "bg-primary/10 border-primary/40 text-primary"
          : "bg-card/50 hover:bg-primary/10 border-border/50 hover:border-primary/30 text-muted-foreground hover:text-primary hover:shadow-primary/5",
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
