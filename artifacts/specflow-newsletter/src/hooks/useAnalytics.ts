import { useEffect, useRef } from "react";
import { useAuth as useClerkAuth } from "@clerk/react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function getSessionId(): string {
  let sid = sessionStorage.getItem("_sid");
  if (!sid) {
    sid = Math.random().toString(36).slice(2);
    sessionStorage.setItem("_sid", sid);
  }
  return sid;
}

export function usePageTracking(page: string) {
  const { userId } = useClerkAuth();

  useEffect(() => {
    fetch(`${BASE}/api/analytics/pageview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page,
        userId: userId ?? null,
        sessionId: getSessionId(),
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {});
  }, [page, userId]);
}

export function useTrack() {
  const { userId, getToken } = useClerkAuth();
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (userId) {
      getToken().then((t) => { tokenRef.current = t ?? null; }).catch(() => {});
    }
  }, [userId, getToken]);

  const track = (event: string, properties?: Record<string, unknown>) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (tokenRef.current) headers["Authorization"] = `Bearer ${tokenRef.current}`;

    fetch(`${BASE}/api/analytics/event`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        event,
        properties: properties ?? {},
        userId: userId ?? null,
        sessionId: getSessionId(),
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {});
  };

  return { track };
}
