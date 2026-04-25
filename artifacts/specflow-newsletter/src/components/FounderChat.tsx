import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Cpu, Zap, Globe, AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

interface FounderChatProps {
  usedThisMonth: number;
  onUsageUpdate: (next: number) => void;
}

// Mirrors backend CHAT_LIMITS
const LIMITS: Record<string, number> = { free: 3, pro: 30, max: 100, incubator: 100 };

const STARTER_PROMPTS = [
  "How do I get my first 100 paying customers?",
  "What's the fastest way to validate my idea?",
  "When should I raise funding vs. stay bootstrapped?",
];

export const AVAILABLE_PERSONAS = [
  { id: "elite-coach", name: "The $1M Founder Coach" },
  { id: "venture-capitalist", name: "Tier-1 Venture Capitalist" },
  { id: "devops-architect", name: "Elite Systems Architect" },
  { id: "sales-shark", name: "Enterprise Sales Director" },
  { id: "viral-marketer", name: "Viral Marketer" },
  { id: "copywriter", name: "Master Copywriter" },
  { id: "performance-coach", name: "High-Performance Coach" },
];

export default function FounderChat({ usedThisMonth, onUsageUpdate }: FounderChatProps) {
  const { session, tier } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState("elite-coach");
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [showShortWarning, setShowShortWarning] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const limit = LIMITS[tier] ?? 5;
  const remaining = limit - usedThisMonth;
  const isAtLimit = remaining <= 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (overrideText?: string, forceSend: boolean = false) => {
    const text = (overrideText ?? input).trim();
    if (!text || loading || isAtLimit) return;

    // Short brief interceptor
    const wordCount = text.split(/\s+/).length;
    if (wordCount < 15 && !forceSend && !overrideText) {
      setShowShortWarning(true);
      return;
    }
    setShowShortWarning(false);

    const email = session?.user?.email;
    if (!email) return;

    if (!overrideText) setInput("");

    const userMsg: Message = { role: "user", content: text };
    const assistantMsg: Message = { role: "assistant", content: "", streaming: true };

    setMessages(prev => [...prev, userMsg, assistantMsg]);
    setLoading(true);

    const assistantIdx = messages.length + 1; // index of the streaming message

    try {
      const res = await fetch("/api/engine/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ message: text, persona: selectedPersona, useWebSearch }),
      });

      if (!res.ok || !res.body) {
        const errData = await res.json().catch(() => ({}));
        setMessages(prev => prev.map((m, i) =>
          i === assistantIdx ? { ...m, content: errData.error || "AI Advisor unavailable — try again shortly.", streaming: false } : m
        ));
        setLoading(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const payload = JSON.parse(line.slice(6));
            if (payload.text) {
              setMessages(prev => prev.map((m, i) =>
                i === assistantIdx ? { ...m, content: m.content + payload.text } : m
              ));
            }
            if (payload.done) {
              setMessages(prev => prev.map((m, i) =>
                i === assistantIdx ? { ...m, streaming: false } : m
              ));
              onUsageUpdate(payload.used);
            }
            if (payload.error) {
              setMessages(prev => prev.map((m, i) =>
                i === assistantIdx ? { ...m, content: payload.error, streaming: false } : m
              ));
            }
          } catch { /* malformed SSE line, skip */ }
        }
      }
    } catch {
      setMessages(prev => prev.map((m, i) =>
        i === assistantIdx ? { ...m, content: "Connection lost. Check your network and try again.", streaming: false } : m
      ));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col bg-card border border-border rounded-2xl overflow-hidden" style={{ minHeight: 360 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border/60 bg-primary/5">
        <div className="flex items-center gap-3">
          <Cpu className="w-3.5 h-3.5 text-primary" />
          <select
            value={selectedPersona}
            onChange={(e) => setSelectedPersona(e.target.value)}
            className="bg-transparent text-[11px] font-bold uppercase tracking-widest text-primary outline-none cursor-pointer hover:opacity-80 transition-opacity"
          >
            {AVAILABLE_PERSONAS.map(p => (
              <option key={p.id} value={p.id} className="text-foreground bg-background">
                {p.name}
              </option>
            ))}
          </select>
          {loading && (
            <motion.div
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="w-1.5 h-1.5 rounded-full bg-primary"
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          {tier === "max" || tier === "incubator" ? (
            <span className="text-[9px] font-bold uppercase tracking-widest text-primary/60 flex items-center gap-1">
              <Zap className="w-3 h-3 fill-current" /> Max Access
            </span>
          ) : (
            <span className={`text-[10px] font-mono font-bold ${remaining <= 1 ? "text-red-500" : "text-muted-foreground"}`}>
              {remaining}/{limit} this month
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 text-sm" style={{ maxHeight: 360 }}>
        {messages.length === 0 && (
          <div className="pt-4 space-y-3">
            <p className="text-xs text-muted-foreground text-center font-serif italic">
              "The best time to ask was before you started. The second best is now."
            </p>
            <div className="space-y-2 mt-4">
              {STARTER_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => send(prompt)}
                  disabled={isAtLimit || loading}
                  className="w-full text-left px-4 py-2.5 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 text-xs text-muted-foreground hover:text-foreground transition-all disabled:opacity-40"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background border border-border text-foreground"
              }`}>
                {msg.content || (msg.streaming ? "" : "…")}
                {msg.streaming && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6 }}
                    className="inline-block w-1.5 h-3 bg-current ml-0.5 align-middle opacity-60"
                  />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Limit reached banner */}
      {isAtLimit && (
        <div className="mx-4 mb-3 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 font-medium text-center">
          Monthly limit reached. Resets on the 1st.
          {tier === "pro" && " Upgrade to Max for 100 messages/month."}
          {tier === "free" && " Upgrade to Pro for 30 messages/month."}
        </div>
      )}

      {/* Short Brief Warning */}
      {showShortWarning && (
        <div className="mx-4 mb-3 p-3 bg-primary/5 border border-primary/20 rounded-xl text-xs text-foreground/80">
          <div className="flex items-start gap-2 mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Short Brief Detected.</strong> For $1M-level advice, you need to provide more context. Tell us about your brand, MRR, audience, or the exact blocker.
            </p>
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <button
              onClick={() => { setShowShortWarning(false); textareaRef.current?.focus(); }}
              className="px-3 py-1.5 rounded bg-background border border-border text-[10px] font-bold uppercase tracking-wider hover:bg-muted transition-colors"
            >
              Add Context
            </button>
            <button
              onClick={() => send(undefined, true)}
              className="px-3 py-1.5 rounded bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              Just Continue
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border/60 px-4 py-3 flex gap-2 items-end bg-background">
        <button
          onClick={() => setUseWebSearch(!useWebSearch)}
          title="Toggle Web Search"
          className={`shrink-0 p-2 rounded-xl transition-all ${
            useWebSearch 
              ? "bg-primary/10 text-primary border border-primary/30" 
              : "bg-transparent text-muted-foreground hover:bg-muted"
          }`}
        >
          <Globe className="w-4 h-4" />
        </button>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading || isAtLimit}
          placeholder={isAtLimit ? "Monthly limit reached" : "Ask anything... (⌘↵ to send)"}
          rows={1}
          className="flex-1 bg-transparent text-foreground text-xs placeholder:text-muted-foreground/50 resize-none outline-none leading-relaxed py-1.5 disabled:opacity-40"
          style={{ maxHeight: 80 }}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading || isAtLimit}
          className="shrink-0 p-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all disabled:opacity-30"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
