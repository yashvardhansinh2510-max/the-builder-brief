import { useState } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function useSubscribe(source = "homepage") {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "exists">("idle");

  async function subscribe(email: string) {
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch(`${BASE}/api/subscribers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      if (res.status === 409) {
        setStatus("exists");
        setTimeout(() => setStatus("idle"), 5000);
        return;
      }
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
      setTimeout(() => setStatus("idle"), 6000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  }

  return { status, subscribe };
}
