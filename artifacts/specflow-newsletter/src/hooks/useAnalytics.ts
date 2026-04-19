import { useEffect } from "react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function usePageTracking(page: string) {
  useEffect(() => {
    fetch(`${BASE}/api/analytics/pageview`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page }),
    }).catch(() => {});
  }, [page]);
}
